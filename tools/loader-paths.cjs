// Shared resolution mirror for kolbot's runtime loaders - consumed by BOTH the lint rule
// (tools/eslint-plugin-kolbot.mjs: flag dangling paths) and the tsserver plugin
// (tools/kolbot-ts-plugin: go-to-definition on loader path strings). One implementation on
// purpose: the normalization subtleties below were each earned against real call sites.
//
// Semantics (verified against the engine source and libs/require.js):
//   include()/isIncluded()/includeIfNotIncluded(p) -> <kolbot>/libs/<p>   (JSCore.cpp: %s\libs\%s)
//   load(p)                                        -> <kolbot>/<p>        (JSCore.cpp: %s\%s)
//   require(p) -> caller-dir-relative (bare or ./ ../) or libs-root-relative ("libs/..."),
//                 ".js" appended, finally include()d - so always under <kolbot>/libs/.
// The engine resolves case-insensitively; fs checks match that on Windows (the dev platform)
// but are case-sensitive on Linux - a case-only mismatch is NOT a runtime bug.
const { dirname, posix, relative, resolve, sep } = require("node:path");

const KOLBOT_MARKER = `${sep}d2bs${sep}kolbot${sep}`;
const LOADER_CALLEES = ["include", "isIncluded", "includeIfNotIncluded", "load", "require"];

/** Locates the kolbot root above a file, or null when the file is outside the bot tree. */
function kolbotRootOf(filename) {
  const idx = filename.lastIndexOf(KOLBOT_MARKER);
  return idx < 0 ? null : filename.slice(0, idx + KOLBOT_MARKER.length - 1);
}

function requireTarget(kolbotRoot, callerFile, arg) {
  if (arg.endsWith(".json")) return null; // shim special-cases .json via File.open; skip
  // caller dir relative to libs/ (files outside libs/, e.g. .dbj entries, resolve as libs-root)
  const callerDir = relative(resolve(kolbotRoot, "libs"), dirname(callerFile)).replaceAll(sep, "/");
  const base = callerDir.startsWith("..") ? "" : callerDir;
  let joined;
  if (arg.startsWith("./") || arg.startsWith("../")) {
    joined = posix.join(base, arg);
  } else if (arg.startsWith("libs/")) {
    joined = arg.slice("libs/".length);
  } else {
    joined = posix.join(base, arg); // bare name = caller-dir-relative
  }
  // Normalization order matters and mirrors the shim: FIRST clamp ..-segments that escape the
  // libs root (libs/globals.js's require("../modules/sdk") lands on libs/modules/sdk.js), THEN
  // strip a leading libs/ segment (threads/ files write require("../libs/modules/X"), root-level
  // .dbj files write require("./libs/modules/X") - both work because include() is libs-anchored).
  while (joined.startsWith("../")) joined = joined.slice(3);
  if (joined.startsWith("libs/")) joined = joined.slice("libs/".length);
  return resolve(kolbotRoot, "libs", `${joined}.js`);
}

/**
 * Resolves a loader call's string argument to the absolute file the runtime would load.
 * Returns null for non-loader callees or unresolvable forms (.json requires).
 */
function resolveLoaderTarget(kolbotRoot, callerFile, callee, arg) {
  switch (callee) {
    case "include":
    case "isIncluded":
    case "includeIfNotIncluded":
      return resolve(kolbotRoot, "libs", arg);
    case "load":
      return resolve(kolbotRoot, arg);
    case "require":
      return requireTarget(kolbotRoot, callerFile, arg);
    default:
      return null;
  }
}

module.exports = { KOLBOT_MARKER, LOADER_CALLEES, kolbotRootOf, resolveLoaderTarget };
