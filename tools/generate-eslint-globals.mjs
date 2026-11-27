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
// treating them all as universal globals masks reachability bugs. Ambient-only is the DEFAULT
// (flipped 2026-08-01): the shared surface is the DECLARED layer (d.ts values) + deliberate
// global.X publications + the curated CROSS_FILE_GLOBALS manifest below. Pass --union to
// restore the old scrape-everything superset for comparison.
const AMBIENT_ONLY = !process.argv.includes("--union");

// Curated cross-file globals: top-level declarations that other files genuinely read as bare
// identifiers, but which have NO ambient value declaration (their d.ts coverage is a types-only
// interface - the TS2451 house pattern) and no global.X publication. Every entry was verified
// by scope-aware analysis (eslint-scope through-references, so same-name locals don't count).
// A NEW deliberate cross-file global belongs here; a no-undef warning at a read site otherwise
// means a typo, a vanished symbol, or an accidental dependency on another file's leak.
const CROSS_FILE_GLOBALS = [
  // libs/core singletons (types-only interfaces since the 2026-07-31 d.ts standardization).
  // Town/Pather/Pickit/Precast/ClassAttack joined 2026-08-01: their names had been riding
  // SoloPlay globals.d.ts namespace declarations, which the generator no longer scans.
  "CollMap", "Cubing", "Experience", "Item", "Loader", "NPC", "Packet", "Scripts",
  "NodeAction",
  "Town", "Pather", "Pickit", "Precast", "ClassAttack",
  // core/Cubing.js + config DSL surface (read by config files and BuildFiles)
  "Recipe", "Roll",
  // core/Pather.js internals shared with the override families
  "PathDebug", "PathNode",
  // core/Auto family + the per-class config injection contract
  "AutoSkill", "AutoStat", "AutoBuildTemplate",
  // systems drivers (includeSystemLibs() convention) + their entry pairs
  "CraftingSystem", "Gambling", "TorchSystem", "CharRefresher", "GameAction",
  "Mule", "MuleData",
  // oog layer
  "FileAction", "ShitList", "getThreads",
  // manualplay hook family (loaded together via Hooks.init()/MapMode.include())
  "ActionHooks", "Hooks", "ItemHooks", "MonsterHooks", "ShrineHooks", "VectorHooks", "MapMode",
  // AutoBuild is MAIN's core/Auto/AutoBuild.js (readers: core/Config.js, manualplay
  // ConfigOverrides.js) - SoloPlay's same-named global is a separate copy, covered by the
  // SoloPlay-scoped globals block in eslint.config.mjs. All other SoloPlay-internal globals
  // (myPrint, CharInfo, ...) live in that scoped block, NOT here: the submodule owns its
  // global surface, and the epic moves that block into a submodule-owned manifest.
  "AutoBuild",
];
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

// SoloPlay d.ts are EXCLUDED: the submodule owns its lint surface via its own manifest
// (libs/SoloPlay/eslint.globals.mjs, imported by the SoloPlay-scoped config block) -
// its ambient declarations must not leak names into the shared inventory.
const dtsFiles = gitFiles(["d2bs/kolbot/sdk/**/*.d.ts", "d2bs/kolbot/libs/**/*.d.ts"])
  .filter((p) => !p.includes("SoloPlay"));
for (const file of dtsFiles) {
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  collectDtsStatements(sf.statements, file);
}

// SoloPlay is EXCLUDED here as well as from the d.ts scan above: the submodule owns its own
// lint surface (libs/SoloPlay/eslint.globals.mjs, imported by the SoloPlay-scoped config
// block), so its `global.X =` publications must not leak into the shared inventory. This also
// keeps this file reproducible when the submodule is not checked out, which is how CI runs.
const scriptFiles = gitFiles(["d2bs/kolbot/**/*.js", "d2bs/kolbot/**/*.dbj"]).filter((p) => {
  const rel = relative(root, p).replaceAll("\\", "/");
  if (rel.startsWith("d2bs/kolbot/libs/SoloPlay/")) return false;
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
if (AMBIENT_ONLY) {
  // Manifest names keep their provenance visible: prefer the scanned declaration site so a
  // stale entry (provider deleted/renamed) is caught here instead of lying in the output.
  for (const name of CROSS_FILE_GLOBALS) {
    if (all.has(name)) continue;
    if (!scriptGlobals.has(name)) {
      console.warn(`WARNING: CROSS_FILE_GLOBALS entry "${name}" has no top-level declaration anywhere - stale manifest entry?`);
    }
    all.set(name, scriptGlobals.get(name) ?? "CROSS_FILE_GLOBALS");
  }
}
for (const extra of MANUAL_EXTRAS) if (!all.has(extra)) all.set(extra, "MANUAL_EXTRAS");
const names = [...all.keys()].sort((a, b) => a.localeCompare(b));

// Header carries NO derived counts on purpose: this file is diff-checked in CI, and embedding
// statistics made it churn whenever any .d.ts gained a declaration - failing the gate for a
// changed number while the actual global set was identical. The counts still print to stdout.
const header = `// GENERATED by tools/generate-eslint-globals.mjs - do not edit by hand.
// Regenerate with: npm run globals:gen
// Mode: ${AMBIENT_ONLY ? "ambient-only (d.ts values + global.X publications + curated cross-file manifest)" : "union (+ top-level script declarations)"}
`;
const body = `export default {\n${names.map((n) => `  ${JSON.stringify(n)}: "writable",`).join("\n")}\n};\n`;
writeFileSync(join(root, "eslint.globals.mjs"), header + body);
console.log(
  `eslint.globals.mjs: ${names.length} globals (${dtsGlobals.size} from d.ts, ${scriptGlobals.size} from scripts, ${parseFailures} files unparseable)`,
);
