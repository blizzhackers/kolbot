// Local ESLint plugin for kolbot-specific rules. Loaded straight from eslint.config.mjs -
// no npm packaging, no build step. Loader-path resolution lives in ./loader-paths.cjs, shared
// with the tsserver plugin so lint and go-to-definition can never disagree.
import { existsSync } from "node:fs";
import { relative } from "node:path";
import loaderPaths from "./loader-paths.cjs";

const { LOADER_CALLEES, kolbotRootOf, resolveLoaderTarget } = loaderPaths;

const existsCache = new Map();
function cachedExists(path) {
  let hit = existsCache.get(path);
  if (hit === undefined) {
    hit = existsSync(path);
    existsCache.set(path, hit);
  }
  return hit;
}

const includePathExists = {
  meta: {
    type: "problem",
    docs: {
      description:
        "include()/load()/require() paths must exist on disk - the engine silently returns false on a missing file, so a dangling path is an invisible runtime no-op",
    },
    schema: [
      {
        type: "object",
        properties: {
          // Deliberately-dangling extension points (e.g. the untracked systems/dropper plugin)
          allowMissing: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missing: "{{callee}}(\"{{arg}}\") does not resolve: {{resolved}} does not exist",
    },
  },
  create(context) {
    const kolbotRoot = kolbotRootOf(context.filename);
    if (!kolbotRoot) return {};
    const allowMissing = (context.options[0] && context.options[0].allowMissing) || [];

    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !LOADER_CALLEES.includes(node.callee.name)) return;
        const argNode = node.arguments[0];
        if (!argNode || argNode.type !== "Literal" || typeof argNode.value !== "string") return;
        const arg = argNode.value;
        if (allowMissing.some((prefix) => arg.startsWith(prefix))) return;

        const resolved = resolveLoaderTarget(kolbotRoot, context.filename, node.callee.name, arg);
        if (resolved === null) return;
        if (!cachedExists(resolved)) {
          context.report({
            node: argNode,
            messageId: "missing",
            data: { callee: node.callee.name, arg, resolved: relative(kolbotRoot, resolved) },
          });
        }
      },
    };
  },
};

// Scope kinds that do NOT start a fresh const binding context in SM24. Everything else
// (function, class, and function-expression-name — the self-binding of
// `const F = new Runnable(function F () {})`) is a boundary the fold must stop at.
const BLOCK_SCOPES = new Set(["block", "switch", "for", "catch", "with"]);

const noRedeclaredConst = {
  meta: {
    type: "problem",
    docs: {
      description:
        "SM24 predates block-scoped const (that landed ~SpiderMonkey 36), so a const binds at FUNCTION scope - two same-named consts in sibling blocks are one binding and the engine rejects the whole file with \"redeclaration of const X\" before any of it runs",
    },
    schema: [],
    messages: {
      redeclared:
        "SM24: const is function-scoped - \"{{name}}\" is already declared at line {{line}} of this function, and nested blocks (if/case/loop bodies) do not separate the two. Rename one, or hoist a single `let` above them.",
    },
  },
  create(context) {
    // Only const-vs-const is reported. A const paired with a same-named let/var/param in the
    // same function is the adjacent shape but runs fine in-engine (LazyLoader.js, Cows.js,
    // SoloPlay/Core/ItemOverrides.js all ship it), so flagging it would be noise.
    function collect(scope, out) {
      for (const variable of scope.variables) {
        for (const def of variable.defs) {
          if (def.type !== "Variable" || def.parent.kind !== "const") continue;
          const ids = out.get(variable.name) || [];
          ids.push(def.name);
          out.set(variable.name, ids);
        }
      }
      for (const child of scope.childScopes) {
        if (BLOCK_SCOPES.has(child.type)) collect(child, out);
      }
    }

    function walk(scope) {
      if (!BLOCK_SCOPES.has(scope.type)) {
        const byName = new Map();
        collect(scope, byName);
        for (const ids of byName.values()) {
          if (ids.length < 2) continue;
          ids.sort((a, b) => a.range[0] - b.range[0]);
          for (let i = 1; i < ids.length; i++) {
            context.report({
              node: ids[i],
              messageId: "redeclared",
              data: { name: ids[i].name, line: ids[0].loc.start.line },
            });
          }
        }
      }
      for (const child of scope.childScopes) walk(child);
    }

    return {
      Program(node) {
        walk(context.sourceCode.getScope(node));
      },
    };
  },
};

export default {
  rules: {
    "include-path-exists": includePathExists,
    "no-redeclared-const": noRedeclaredConst,
  },
};
