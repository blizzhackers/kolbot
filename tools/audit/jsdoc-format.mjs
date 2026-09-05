// Enforces the project's JSDoc shape rule (chosen 2026-08-01):
//
//   single-line `/** ... */`  ONLY when the block is exactly ONE tag, no prose, within 120 chars
//   multi-line block           for two or more tags, or any prose
//
// Only the block's FORM is changed - never its content, and never a code line. Blocks that are
// already multi-line and should stay multi-line are left byte-for-byte alone, so this does not
// churn file headers.
//
//   node tools/audit/jsdoc-format.mjs [--write] [--check]
//
// Default is a dry run. --write applies. --check exits non-zero when anything would change,
// which is the CI form.
import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { KOLBOT, REPO, SOLOPLAY, gitFiles, parseJs, finish } from "./lib.mjs";

const WRITE = process.argv.includes("--write");

const ROOTS = [
  { cwd: KOLBOT, patterns: ["libs/**/*.js", "threads/*.js", "*.dbj"], skip: ["libs/SoloPlay/", "libs/json2.js"] },
  { cwd: SOLOPLAY, patterns: ["**/*.js"], skip: ["Modules/bigInt.js"] },
];

/** Split a one-line multi-tag body into per-tag pieces; never splits inside braces. */
function splitTags(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth = Math.max(0, depth - 1);
    if (ch === "@" && depth === 0 && i > 0 && /\s/.test(text[i - 1]) && current.trim() !== "") {
      parts.push(current.trim());
      current = "@";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

let changedFiles = 0;
let expanded = 0;
let collapsed = 0;

for (const root of ROOTS) {
  for (const rel of gitFiles(root.cwd, root.patterns)) {
    if (root.skip.some((s) => rel.startsWith(s))) continue;
    const file = join(root.cwd, rel);
    const text = readFileSync(file, "utf8");
    const ast = parseJs(file, { comment: true });
    if (!ast) continue;
    const nl = text.includes("\r\n") ? "\r\n" : "\n";
    const edits = [];

    for (const c of ast.comments ?? []) {
      if (c.type !== "Block" || !c.value.startsWith("*")) continue;
      const [start, end] = c.range;
      const lineStart = text.lastIndexOf("\n", start) + 1;
      const indent = text.slice(lineStart, start);
      if (/\S/.test(indent)) continue; // inline JSDoc mid-expression: leave alone

      const lines = c.value
        .slice(1)
        .split("\n")
        .map((l) => l.replace(/\r$/, "").replace(/^\s*\*? ?/, "").trimEnd());
      while (lines.length && lines[lines.length - 1] === "") lines.pop();
      while (lines.length && lines[0] === "") lines.shift();
      if (lines.length === 0) continue;

      const isOneLiner = !c.value.includes("\n");
      const single = lines.length === 1 ? lines[0] : null;
      const tags = single ? splitTags(single) : [];
      const qualifiesAsSingle =
        single !== null && tags.length === 1 && single.startsWith("@") &&
        (indent + "/** " + single + " */").length <= 120;

      let replacement = null;
      if (qualifiesAsSingle && !isOneLiner) {
        replacement = "/** " + single + " */";
        collapsed++;
      } else if (!qualifiesAsSingle && isOneLiner) {
        const body = single !== null && tags.length > 1 && single.startsWith("@") ? tags : lines;
        replacement = "/**" + nl + body.map((l) => indent + " *" + (l ? " " + l : "")).join(nl) + nl + indent + " */";
        expanded++;
      }
      if (replacement !== null && text.slice(start, end) !== replacement) {
        edits.push({ start, end, replacement });
      }
    }

    if (!edits.length) continue;
    changedFiles++;
    if (WRITE) {
      let out = text;
      for (const e of edits.sort((a, b) => b.start - a.start)) {
        out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
      }
      writeFileSync(file, out);
    } else {
      console.log(`${relative(REPO, file).replace(/\\/g, "/")}: ${edits.length} block(s) off-rule`);
    }
  }
}

console.log(
  `${WRITE ? "rewrote" : "would rewrite"} ${changedFiles} file(s)  (expand ${expanded}, collapse ${collapsed})`,
);
finish(WRITE ? 0 : changedFiles, "jsdoc-format");
