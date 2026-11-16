// Shared helpers for the tools/audit/* scanners.
//
// These scanners exist because kolbot's include() architecture hides whole classes of gap from
// both tsc and eslint: a file can be absent from every TS program, a global can be published by
// assignment and therefore typed by nothing, and an interface can silently drift from the object
// it describes. Each scanner below closes one of those blind spots and is safe to re-run.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const KOLBOT = join(REPO, "d2bs", "kolbot");
export const SOLOPLAY = join(KOLBOT, "libs", "SoloPlay");

const require = createRequire(join(REPO, "tools", "generate-eslint-globals.mjs"));
export const espree = require("espree");

/**
 * Tracked + untracked-but-not-ignored files matching the patterns, run from `cwd`.
 * Enumerating via git (rather than walking the filesystem) is deliberate: it keeps gitignored
 * local files - personal configs, generated tsc output - out of every report.
 * `:(glob)` magic is required; default pathspec fnmatch treats `**​/` as at-least-one directory
 * and silently drops root-level files.
 */
export function gitFiles(cwd, patterns) {
  const specs = patterns.map((p) => `:(glob)${p}`);
  const run = (args) => {
    try {
      return execFileSync("git", [...args, "-z", "--", ...specs], {
        cwd,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      })
        .split("\0")
        .filter(Boolean);
    } catch {
      return [];
    }
  };
  return [...new Set([...run(["ls-files"]), ...run(["ls-files", "--others", "--exclude-standard"])])];
}

/** Parse a runtime file; returns null when espree cannot (never throws at the call site). */
export function parseJs(file, opts = {}) {
  try {
    return espree.parse(readFileSync(file, "utf8"), {
      ecmaVersion: "latest",
      sourceType: "script",
      range: true,
      ...opts,
    });
  } catch {
    return null;
  }
}

/** Depth-first walk of an ESTree AST, passing (node, parent). */
export function walk(node, visit, parent = null) {
  if (!node || typeof node.type !== "string") return;
  visit(node, parent);
  for (const key of Object.keys(node)) {
    if (key === "range" || key === "loc" || key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit, node);
    } else if (value && typeof value === "object") {
      walk(value, visit, node);
    }
  }
}

/**
 * Member names declared by every `interface <name>` block across the given d.ts sources.
 * Brace-matched rather than regex-bounded: kolbot's big interfaces (MeType, IConfig) nest object
 * types several levels deep, and a depth-limited pattern silently truncates their member list -
 * which reads downstream as "the implementation has 30 undeclared members".
 * Interfaces merge, so members accumulate across every declaration of the same name.
 */
export function interfaceMembers(rawText) {
  // Strip comments first: a brace inside a comment (`// ... {` or a JSDoc example) desynchronises
  // the brace matcher, which then swallows every interface that follows - silently, as an empty
  // member set that reads downstream like real drift.
  const dtsText = rawText
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, "");
  const byName = new Map();
  const parents = new Map();
  const re = /\binterface (\w+)([^{]*)\{/g;
  let m;
  while ((m = re.exec(dtsText)) !== null) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < dtsText.length && depth > 0) {
      const ch = dtsText[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      i++;
    }
    const body = dtsText.slice(start, i - 1);
    const set = byName.get(m[1]) ?? new Set();
    // Top-level members only: a nested `{ a: { b: ... } }` must not contribute `b`.
    let nest = 0;
    for (const line of body.split("\n")) {
      if (nest === 0) {
        const hit = line.match(/^\s*(?:readonly )?(\w+)\s*[(:?<]/);
        if (hit) set.add(hit[1]);
      }
      for (const ch of line) {
        if (ch === "{") nest++;
        else if (ch === "}") nest = Math.max(0, nest - 1);
      }
    }
    byName.set(m[1], set);
    const ext = m[2].match(/\bextends\s+([\w.,\s]+)/);
    if (ext) {
      const list = parents.get(m[1]) ?? [];
      for (const p of ext[1].split(",")) list.push(p.trim().split(".").pop());
      parents.set(m[1], list);
    }
    re.lastIndex = i;
  }
  // Inherited members count as declared: `interface MeType extends Unit` really does expose every
  // Unit member on `me`, and reporting them as drift manufactures findings (me.haveRunes).
  const resolved = new Map();
  const resolve = (name, seen = new Set()) => {
    if (resolved.has(name)) return resolved.get(name);
    if (seen.has(name)) return byName.get(name) ?? new Set();
    seen.add(name);
    const merged = new Set(byName.get(name) ?? []);
    for (const p of parents.get(name) ?? []) {
      for (const mem of resolve(p, seen)) merged.add(mem);
    }
    resolved.set(name, merged);
    return merged;
  };
  for (const name of byName.keys()) resolve(name);
  return resolved;
}

export function readAll(paths) {
  return paths.map((p) => readFileSync(p, "utf8")).join("\n\n");
}

/** Exit non-zero when a scanner is run with --check and found something. */
export function finish(failures, label) {
  const check = process.argv.includes("--check");
  if (failures > 0 && check) {
    console.error(`\n${label}: ${failures} finding(s) - failing because --check was passed.`);
    process.exit(1);
  }
}
