// JSDoc coverage: function-valued members with no JSDoc block immediately above them.
//
// Counts object-literal methods, `X.y = function`, `this.x = function`, and function
// declarations. A block only counts when nothing but whitespace separates it from the
// declaration, which is what the editor requires to show it.
//
//   node tools/audit/jsdoc-coverage.mjs [main|soloplay|all] [--json <path>] [--check]
//
// Known false negatives: inline `{ callback: function () {...} }` properties, where the only
// legal comment position is above the enclosing statement. Those report as undocumented.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KOLBOT, SOLOPLAY, gitFiles, parseJs, finish } from "./lib.mjs";

// Data tables and vendored code: real files, but documenting per-entry adds noise, not meaning.
const TARGETS = {
  main: {
    cwd: KOLBOT,
    patterns: ["libs/**/*.js", "threads/*.js", "*.dbj"],
    exclude: [
      "libs/SoloPlay/", // its own project - use the soloplay target
      "libs/json2.js", // vendored Crockford polyfill
      "libs/core/GameData/", // generated/large data tables
      "libs/config/Builds/", // per-level Update() template stubs
    ],
  },
  soloplay: {
    cwd: SOLOPLAY,
    patterns: ["**/*.js"],
    exclude: [
      "Modules/bigInt.js", // vendored BigInteger
      "Tools/SoloIndex.js", // script-index data table
      "Modules/GameData/", // data tables
    ],
  },
};

const which = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "all";
const jsonFlag = process.argv.indexOf("--json");
const targets = which === "all" ? Object.keys(TARGETS) : [which];

const report = [];
let grandTotal = 0;
let grandUndoc = 0;

for (const name of targets) {
  const target = TARGETS[name];
  if (!target) throw new Error(`unknown target "${name}" (expected main|soloplay|all)`);
  const files = gitFiles(target.cwd, target.patterns)
    .filter((rel) => !target.exclude.some((ex) => rel.startsWith(ex)));

  for (const rel of files) {
    const file = join(target.cwd, rel);
    const ast = parseJs(file, { comment: true, loc: true });
    if (!ast) continue;
    const src = readFileSync(file, "utf8");
    const jsdocEnds = new Map();
    for (const c of ast.comments ?? []) {
      if (c.type === "Block" && c.value.startsWith("*")) jsdocEnds.set(c.range[1], c.value);
    }
    // Adjacent = only whitespace between the block's end and the declaration's start.
    const docFor = (node) => jsdocEnds.get(src.slice(0, node.range[0]).trimEnd().length);
    const documented = (node) => docFor(node) !== undefined;

    // Members of a `@type`-annotated container are already typed by that annotation
    // (`/** @type {Record<..>} */ const seals = { 1: () => ... }`), so requiring a block per
    // entry would be noise. Suppress only the container's DIRECT members - one level, so a
    // documented file-level IIFE does not silently excuse everything inside it.
    const coveredProps = new Set();
    (function collect(node) {
      if (!node || typeof node.type !== "string") return;
      if (node.type === "VariableDeclaration" && /@type\b/.test(docFor(node) ?? "")) {
        for (const d of node.declarations) {
          if (d.init && d.init.type === "ObjectExpression") {
            for (const p of d.init.properties) if (p.range) coveredProps.add(p.range[0]);
          }
        }
      }
      for (const key of Object.keys(node)) {
        if (key === "range" || key === "loc") continue;
        const value = node[key];
        if (Array.isArray(value)) for (const child of value) collect(child);
        else if (value && typeof value === "object") collect(value);
      }
    })(ast);

    let total = 0;
    const missing = [];
    const isFn = (n) => n && (n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression");
    (function scan(node) {
      if (!node || typeof node.type !== "string") return;
      let target = null;
      let label = null;
      if (node.type === "FunctionDeclaration" && node.id) [target, label] = [node, node.id.name];
      else if (node.type === "Property" && isFn(node.value) && node.key) {
        [target, label] = [node, node.key.name ?? node.key.value];
      } else if (
        node.type === "ExpressionStatement" &&
        node.expression.type === "AssignmentExpression" &&
        isFn(node.expression.right) &&
        node.expression.left.type === "MemberExpression" &&
        !node.expression.left.computed
      ) {
        [target, label] = [node, node.expression.left.property.name];
      }
      if (target && label && !coveredProps.has(target.range[0])) {
        total++;
        if (!documented(target)) missing.push(`${label}:${target.loc.start.line}`);
      }
      for (const key of Object.keys(node)) {
        if (key === "range" || key === "loc") continue;
        const value = node[key];
        if (Array.isArray(value)) for (const child of value) scan(child);
        else if (value && typeof value === "object") scan(value);
      }
    })(ast);

    if (total > 0) {
      grandTotal += total;
      grandUndoc += missing.length;
      if (missing.length) report.push({ target: name, file: rel, total, undocd: missing.length, missing });
    }
  }
}

report.sort((a, b) => b.undocd - a.undocd);
console.log(`functions: ${grandTotal}  undocumented: ${grandUndoc}\n`);
for (const r of report.slice(0, 25)) {
  console.log(`${String(r.undocd).padStart(4)} / ${String(r.total).padEnd(4)} [${r.target}] ${r.file}`);
}
if (report.length > 25) console.log(`... and ${report.length - 25} more files`);
if (jsonFlag > -1 && process.argv[jsonFlag + 1]) {
  writeFileSync(process.argv[jsonFlag + 1], JSON.stringify(report, null, 1));
  console.log(`\nwrote ${process.argv[jsonFlag + 1]}`);
}

finish(grandUndoc, "jsdoc-coverage");
