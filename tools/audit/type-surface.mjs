// Does the ambient type layer still describe the objects it claims to describe?
//
// Two drift classes, both invisible to tsc (an interface is never "wrong", only incomplete) and
// to eslint (which does not read types):
//
//   1. MEMBER DRIFT - an implementation gains `X.foo = ...` or a literal member, and the
//      interface that types X is never updated. The member then resolves to nothing in the
//      editor even though the code runs fine. (Found 91 in SoloPlay, 16 on main's Pather.)
//   2. UNDECLARED PUBLICATIONS - `global.X = ...` publishes a value by assignment. Nothing
//      infers a global from that, so the name is untyped everywhere. (Found the 5 DynamicTiers
//      autoequip scorers this way - 465 untyped call sites.)
//
// Targets are DERIVED, not hardcoded: every `const X: T;` in the ambient layer is looked up
// against a same-named implementation, so new globals are covered automatically.
//
//   node tools/audit/type-surface.mjs [--check]
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KOLBOT, SOLOPLAY, gitFiles, parseJs, walk, interfaceMembers, readAll, finish } from "./lib.mjs";

const DTS = [
  ...gitFiles(KOLBOT, ["sdk/**/*.d.ts", "libs/**/*.d.ts"])
    .filter((p) => !p.includes("SoloPlay"))
    .map((p) => join(KOLBOT, p)),
  ...gitFiles(SOLOPLAY, ["**/*.d.ts"]).map((p) => join(SOLOPLAY, p)),
];
const dtsText = readAll(DTS);
const members = interfaceMembers(dtsText);

// name -> interface it is typed as (`const Foo: IFoo;`), plus plain `function name(` declarations.
const ambientConsts = new Map();
for (const m of dtsText.matchAll(/^\s*(?:declare )?const (\w+)\s*:\s*([\w.]+)\s*;/gm)) {
  ambientConsts.set(m[1], m[2]);
}
const declaredNames = new Set([...ambientConsts.keys()]);
for (const m of dtsText.matchAll(/^\s*(?:declare )?function (\w+)\s*[(<]/gm)) declaredNames.add(m[1]);
// var/let declarations count too - runtime-assigned globals (global.X = ...) are declared as
// `var`, and their type is often a function type the const regex above cannot parse.
for (const m of dtsText.matchAll(/^\s*(?:declare )?(?:var|let) (\w+)\s*[:;]/gm)) declaredNames.add(m[1]);
// A `namespace X {}` block is a value declaration too - NPCAction is typed that way because its
// js uses the tsc namespace-emit IIFE shape.
for (const m of dtsText.matchAll(/^\s*(?:declare )?namespace (\w+)\s*\{/gm)) declaredNames.add(m[1]);

const JS = [
  ...gitFiles(KOLBOT, ["libs/**/*.js", "threads/*.js"])
    .filter((p) => !p.startsWith("libs/SoloPlay/"))
    .map((p) => join(KOLBOT, p)),
  ...gitFiles(SOLOPLAY, ["**/*.js"]).map((p) => join(SOLOPLAY, p)),
];

/** Members an implementation actually exposes on `name`. */
const implMembers = new Map();
const publications = new Map();
// Second pairing family: interfaces with NO ambient const, merged instead with a same-named
// top-level script const (Item, Tracker, CharData, ...). The ambient-const loop cannot see
// them, which is how Tracker.IPPath drifted unreported. Top-level declarations only - a
// function-local `const GameTracker = ...` shadow must not pollute the member set.
const topLevelConsts = new Map();

for (const file of JS) {
  const ast = parseJs(file);
  if (!ast) continue;
  const add = (name, member) => {
    if (!implMembers.has(name)) implMembers.set(name, new Map());
    if (!implMembers.get(name).has(member)) implMembers.get(name).set(member, file);
  };
  const fromLiteral = (name, literal) => {
    for (const p of literal.properties ?? []) {
      const key = p.key && (p.key.name ?? p.key.value);
      if (key !== undefined) add(name, String(key));
    }
  };

  for (const stmt of ast.body) {
    if (stmt.type !== "VariableDeclaration") continue;
    for (const d of stmt.declarations) {
      if (d.id?.type === "Identifier") topLevelConsts.set(d.id.name, file);
    }
  }

  walk(ast, (node) => {
    // const X = {...} / new function(){this.y=..} / (function(){ return {...} })()
    if (node.type === "VariableDeclarator" && node.id?.type === "Identifier" && node.init) {
      const name = node.id.name;
      let init = node.init;
      while (init.type === "ParenthesizedExpression") init = init.expression;
      if (init.type === "ObjectExpression") fromLiteral(name, init);
      else if (init.type === "NewExpression" || init.type === "CallExpression") {
        let fn = init.callee ?? init.expression;
        while (fn && fn.type === "ParenthesizedExpression") fn = fn.expression;
        if (fn && (fn.type === "FunctionExpression" || fn.type === "ArrowFunctionExpression") && fn.body) {
          // TOP-LEVEL statements only. Walking the whole body would attribute every nested
          // helper's `return {...}` and `this.x =` to the outer object - that is how a naive
          // scan "discovers" Check.Status or Precast.lastCast, which live on closure-private
          // constructors and are not on the object at all.
          for (const stmt of fn.body.body ?? []) {
            if (stmt.type === "ReturnStatement" && stmt.argument?.type === "ObjectExpression") {
              fromLiteral(name, stmt.argument);
            }
            if (
              stmt.type === "ExpressionStatement" &&
              stmt.expression.type === "AssignmentExpression" &&
              stmt.expression.left.type === "MemberExpression" &&
              stmt.expression.left.object?.type === "ThisExpression" &&
              stmt.expression.left.property?.name
            ) {
              add(name, stmt.expression.left.property.name);
            }
          }
        }
      }
    }
    // X.member = ... (expando additions, incl. overrides adding to another file's object)
    if (
      node.type === "AssignmentExpression" &&
      node.left.type === "MemberExpression" &&
      !node.left.computed &&
      node.left.object?.type === "Identifier" &&
      node.left.property?.name
    ) {
      const obj = node.left.object.name;
      const prop = node.left.property.name;
      if (obj === "global") publications.set(prop, file);
      else add(obj, prop);
    }
  });
}

const ALIASES = { NPC: "NPCList" };
let findings = 0;

console.log("--- member drift (implementation has it, the interface does not) ---");
for (const [name, iface] of [...ambientConsts].sort()) {
  const impl = implMembers.get(name);
  if (!impl) continue; // engine builtin or module-built: no same-named js literal to compare
  const declared =
    members.get(iface) ?? members.get(ALIASES[name] ?? name) ?? members.get(name) ?? new Set();
  if (declared.size === 0) continue; // interface not found by the regex (generic/odd shape)
  const missing = [...impl.keys()].filter((m) => !declared.has(m) && !m.startsWith("_"));
  if (missing.length) {
    findings += missing.length;
    console.log(`  ${name} (${iface}): ${missing.length} - ${missing.slice(0, 10).join(", ")}`);
  }
}

// Interfaces merged with a same-named top-level script const instead of bound via an ambient
// const. Skip names the ambient-const loop already compared, and names with no such interface.
const coveredByAmbient = new Set([...ambientConsts.keys(), ...ambientConsts.values()]);
for (const [name, file] of [...topLevelConsts].sort()) {
  if (coveredByAmbient.has(name)) continue;
  const declared = members.get(name);
  if (!declared || declared.size === 0) continue;
  const impl = implMembers.get(name);
  if (!impl) continue;
  const missing = [...impl.keys()].filter((m) => !declared.has(m) && !m.startsWith("_"));
  if (missing.length) {
    findings += missing.length;
    console.log(`  ${name} (script-const merge): ${missing.length} - ${missing.slice(0, 10).join(", ")}`);
  }
}

console.log("\n--- global.X publications with no declaration ---");
for (const [name, file] of [...publications].sort()) {
  if (declaredNames.has(name)) continue;
  findings++;
  console.log(`  ${name}  (published in ${file.replace(/\\/g, "/").split("/d2bs/kolbot/")[1] ?? file})`);
}

console.log(`\ntotal findings: ${findings}`);
finish(findings, "type-surface");
