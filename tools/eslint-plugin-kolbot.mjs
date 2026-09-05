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

export default {
  rules: {
    "include-path-exists": includePathExists,
  },
};
