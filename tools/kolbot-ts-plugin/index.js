/**
 * tsserver plugin: pull kolbot's .dbj entry scripts into the configured project.
 *
 * Without this, .dbj files are "loose files" in an inferred project: no D2BS globals, no
 * sdk/*.d.ts types (2 completions on `me.` instead of 261). tsconfig include cannot fix it -
 * tsserver rejects unknown extensions (TS6054) and allowNonTsExtensions is not a public option.
 *
 * Wiring: tsconfig.json `plugins: [{ "name": "kolbot-ts-plugin" }]` + the `file:` devDependency
 * (resolution happens relative to tsserver.js, so the plugin must sit in node_modules), and VS Code
 * must use the WORKSPACE TypeScript (language-service plugins do not load in TS 7.0; restored in 7.1).
 *
 * Optional tsconfig plugin config: { "name": "kolbot-ts-plugin", "dbjDir": "d2bs/kolbot" }.
 */
var fs = require("fs");
var path = require("path");

function norm (p) {
  return p.split(path.sep).join("/");
}

function findDbj (dir) {
  var out = [];
  try {
    var names = fs.readdirSync(dir);
    for (var i = 0; i < names.length; i++) {
      if (names[i].slice(-4) === ".dbj") out.push(norm(path.join(dir, names[i])));
    }
  } catch (e) {}
  return out;
}

/** Project name is the tsconfig path for configured projects; inferred projects have no dir to scan. */
function dbjRoot (project, config) {
  var name = project.getProjectName();
  if (!name || name.indexOf("tsconfig") < 0) return null;
  var rel = (config && config.dbjDir) || "d2bs/kolbot";
  return path.join(path.dirname(name), rel);
}

function init (modules) {
  var ts = modules.typescript;

  function create (info) {
    var root = dbjRoot(info.project, info.config);
    var log = info.project.projectService.logger;
    if (!root) {
      log.info("[kolbot-ts-plugin] non-configured project, plugin inactive");
      return info.languageService;
    }
    log.info("[kolbot-ts-plugin] active for " + info.project.getProjectName()
      + " (" + findDbj(root).length + " .dbj files)");

    var host = info.languageServiceHost;

    var origNames = host.getScriptFileNames.bind(host);
    host.getScriptFileNames = function () {
      var names = origNames();
      var dbj = findDbj(root);
      for (var i = 0; i < dbj.length; i++) {
        if (names.indexOf(dbj[i]) < 0) names.push(dbj[i]);
      }
      return names;
    };

    var origKind = host.getScriptKind ? host.getScriptKind.bind(host) : null;
    host.getScriptKind = function (fileName) {
      if (fileName.slice(-4) === ".dbj") return ts.ScriptKind.JS;
      return origKind ? origKind(fileName) : ts.ScriptKind.Unknown;
    };

    var origSnap = host.getScriptSnapshot.bind(host);
    host.getScriptSnapshot = function (fileName) {
      // The original host MUST win: it serves the editor's unsaved buffer. Reading disk first
      // silently analyzes stale text (observed: completions drop and hovers go blank).
      var snap = origSnap(fileName);
      if (snap) return snap;
      if (fileName.slice(-4) === ".dbj") {
        try {
          return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName, "utf8"));
        } catch (e) {
          return undefined;
        }
      }
      return undefined;
    };

    var origVer = host.getScriptVersion.bind(host);
    host.getScriptVersion = function (fileName) {
      if (fileName.slice(-4) === ".dbj") {
        // Open buffers keep their real version via the original host; closed files use mtime so
        // on-disk edits invalidate (the prototype's constant version never reparsed).
        var v = origVer(fileName);
        if (v) return v;
        try {
          return String(fs.statSync(fileName).mtimeMs);
        } catch (e) {
          return "0";
        }
      }
      return origVer(fileName);
    };

    return info.languageService;
  }

  function getExternalFiles (project) {
    var root = dbjRoot(project, null);
    return root ? findDbj(root) : [];
  }

  return { create: create, getExternalFiles: getExternalFiles };
}

module.exports = init;
