// Generates eslint.globals.mjs — the no-undef globals inventory for kolbot's include()
// architecture, where every top-level declaration in every included file is a cross-thread-shape
// global. Hand-curating this list is hopeless (the old 90-name list was stale AND inert); this
// derives it from the two sources of truth:
//   1. the ambient type layer (declare-global values in every .d.ts tsserver loads), and
//   2. top-level declarations in every runtime .js/.dbj file espree can parse.
// Union is a deliberate superset: threads have separate JS contexts at runtime, so a global from
// another thread's include set will not be flagged — no-undef here hunts TYPOS and vanished
// symbols, not cross-thread reachability.
// Regenerate: npm run globals:gen  (rerun after adding globals, renaming top-level consts, or
// editing the sdk .d.ts surface).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const espree = require("espree");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Enumerate via git (tracked + untracked-but-not-ignored) so gitignored local files (e.g.
// libs/scripts/__ControlBot.js scratch copies) never leak into the inventory - a filesystem
// walk made the generated file differ per machine.
function gitFiles(patterns) {
  // :(glob) magic is required: default pathspec fnmatch treats `**/` as at-least-one directory,
  // silently dropping root-level files (sdk/globals.d.ts, the .dbj entry scripts).
  // Two calls because --recurse-submodules (needed for SoloPlay's files) is incompatible with
  // --others (needed for new not-yet-tracked files in the parent).
  const specs = patterns.map((p) => `:(glob)${p}`);
  const run = (args) =>
    execFileSync("git", [...args, "-z", "--", ...specs], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })
      .split("\0")
      .filter(Boolean);
  const tracked = run(["ls-files", "--recurse-submodules"]);
  const untracked = run(["ls-files", "--others", "--exclude-standard"]);
  return [...new Set([...tracked, ...untracked])].map((p) => join(root, p));
}

// Engine/loader names that neither source declares statically (assignment-created or host-set).
const MANUAL_EXTRAS = [
  "module", // require-shim swaps these around include()
  "exports",
  "require", // defined via Object.defineProperty(global, "require", ...) in Polyfill.js
  "global", // Polyfill.js: var global = [].filter.constructor("return this")()
  "globalThis",
  "await", // Worker.js: global.await cooperative helper
  "console", // Polyfill.js console shim
  "StopIteration", // legacy-generator termination sentinel; engine-verified via .probe (EngineProbe)
  "define", // UMD factory boilerplate: the define([], factory) call is typeof-guarded, dead in-engine
  // declared by libs/config/_CustomConfig.js - untracked/gitignored, seeded by the setup script
  // alongside the other user config files, so it exists in every supported install
  "CustomConfig",
];

// --- source 1: declare-global VALUES from the .d.ts layer ---------------------------------
const dtsGlobals = new Map(); // name -> first declaring file
function collectDtsStatements(statements, file) {
  for (const s of statements) {
    if (ts.isModuleDeclaration(s)) {
      if (s.name?.getText?.() === "global" && s.body && ts.isModuleBlock(s.body)) {
        collectDtsStatements(s.body.statements, file);
      } else if (ts.isIdentifier(s.name)) {
        add(dtsGlobals, s.name.text, file); // declare namespace X => value
      }
      continue;
    }
    if (ts.isFunctionDeclaration(s) && s.name) add(dtsGlobals, s.name.text, file);
    else if (ts.isClassDeclaration(s) && s.name) add(dtsGlobals, s.name.text, file);
    else if (ts.isEnumDeclaration(s)) add(dtsGlobals, s.name.text, file);
    else if (ts.isVariableStatement(s)) {
      for (const d of s.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) add(dtsGlobals, d.name.text, file);
      }
    }
    // interfaces / type aliases are type-only: invisible to no-undef
  }
}

// --- source 2: top-level declarations in runtime scripts ----------------------------------
// A file's top-level declarations only become globals in threads that actually include() it, so
// treating them all as universal globals masks reachability bugs. --ambient-only omits them:
// the shared surface is then the DECLARED layer (d.ts) + deliberate global.X publications.
const AMBIENT_ONLY = process.argv.includes("--ambient-only");
// Loader-dispatched files run via include()/load() and are invoked by STRING name (Loader.runScript,
// getScript) - nothing references their top-level declarations as identifiers from other files
// (measured 2026-07-31: zero live cross-references), so counting them as globals only masks typos.
// SoloPlay's Scripts/ and BuildFiles/ are deliberately NOT dropped: that family shares identifiers
// internally (class base files declare CharInfo for sibling builds) - its model is the SoloPlay
// epic's call.
const LOADER_DISPATCHED_DIRS = [
  "d2bs/kolbot/libs/scripts/",
  "d2bs/kolbot/threads/",
];
const scriptGlobals = new Map();
const assignedGlobals = new Map();
function bindingNames(pattern, out) {
  if (!pattern) return;
  switch (pattern.type) {
    case "Identifier":
      out.push(pattern.name);
      break;
    case "ObjectPattern":
      for (const p of pattern.properties) bindingNames(p.value ?? p.argument, out);
      break;
    case "ArrayPattern":
      for (const el of pattern.elements) bindingNames(el, out);
      break;
    case "AssignmentPattern":
      bindingNames(pattern.left, out);
      break;
    case "RestElement":
      bindingNames(pattern.argument, out);
      break;
  }
}

function add(map, name, file) {
  if (!map.has(name)) map.set(name, relative(root, file).replaceAll("\\", "/"));
}

const dtsFiles = gitFiles(["d2bs/kolbot/sdk/**/*.d.ts", "d2bs/kolbot/libs/**/*.d.ts"]);
for (const file of dtsFiles) {
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  collectDtsStatements(sf.statements, file);
}

const scriptFiles = gitFiles(["d2bs/kolbot/**/*.js", "d2bs/kolbot/**/*.dbj"]).filter((p) => {
  const rel = relative(root, p).replaceAll("\\", "/");
  return !LOADER_DISPATCHED_DIRS.some((d) => rel.startsWith(d));
});
let parseFailures = 0;
for (const file of scriptFiles) {
  let ast;
  try {
    ast = espree.parse(readFileSync(file, "utf8"), { ecmaVersion: "latest", sourceType: "script" });
  } catch {
    parseFailures++;
    continue;
  }
  for (const node of ast.body) {
    if (node.type === "VariableDeclaration") {
      const names = [];
      for (const d of node.declarations) bindingNames(d.id, names);
      for (const n of names) add(scriptGlobals, n, file);
    } else if (node.type === "FunctionDeclaration" && node.id) {
      add(scriptGlobals, node.id.name, file);
    } else if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.type === "Identifier"
    ) {
      add(scriptGlobals, node.expression.left.name, file); // top-level implicit global
    }
  }
  // `global.X = ...` anywhere in the file (any depth): modules deliberately publish globals this
  // way (e.g. Worker.js's global.await, NTItemParser's tierscore family). Tracked separately from
  // top-level declarations: these are intentional cross-file API, the former are conditional.
  (function walk(n) {
    if (!n || typeof n.type !== "string") return;
    if (
      n.type === "AssignmentExpression" &&
      n.left.type === "MemberExpression" &&
      !n.left.computed &&
      n.left.object.type === "Identifier" &&
      n.left.object.name === "global" &&
      n.left.property.type === "Identifier"
    ) {
      add(assignedGlobals, n.left.property.name, file);
    }
    for (const key of Object.keys(n)) {
      const v = n[key];
      if (Array.isArray(v)) for (const c of v) walk(c);
      else if (v && typeof v === "object") walk(v);
    }
  })(ast);
}

const all = AMBIENT_ONLY
  ? new Map([...dtsGlobals, ...assignedGlobals])
  : new Map([...dtsGlobals, ...scriptGlobals, ...assignedGlobals]);
for (const extra of MANUAL_EXTRAS) if (!all.has(extra)) all.set(extra, "MANUAL_EXTRAS");
const names = [...all.keys()].sort((a, b) => a.localeCompare(b));

const header = `// GENERATED by tools/generate-eslint-globals.mjs - do not edit by hand.
// Regenerate with: npm run globals:gen
// Mode: ${AMBIENT_ONLY ? "ambient-only (d.ts + global.X publications)" : "union (+ top-level script declarations)"}
// Sources: ${dtsGlobals.size} declare-global values from ${dtsFiles.length} .d.ts files,
// ${AMBIENT_ONLY ? 0 : scriptGlobals.size} top-level script declarations from ${scriptFiles.length} runtime files
// (${parseFailures} unparseable skipped), ${assignedGlobals.size} global.X publications,
// ${MANUAL_EXTRAS.length} manual extras.
`;
const body = `export default {\n${names.map((n) => `  ${JSON.stringify(n)}: "writable",`).join("\n")}\n};\n`;
writeFileSync(join(root, "eslint.globals.mjs"), header + body);
console.log(
  `eslint.globals.mjs: ${names.length} globals (${dtsGlobals.size} from d.ts, ${scriptGlobals.size} from scripts, ${parseFailures} files unparseable)`,
);
