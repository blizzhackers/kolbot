/**
 * tsserver plugin: (1) pull kolbot's .dbj entry scripts into the configured project, and
 * (2) go-to-definition on loader path strings - include("core/Attack.js"), load("threads/X.js"),
 * require("./modules/Worker") - jumping to the file the RUNTIME would load. Resolution comes
 * from ../loader-paths.cjs, shared with the lint rule so navigation and lint never disagree.
 *
 * Without (1), .dbj files are "loose files" in an inferred project: no D2BS globals, no
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
var loaderPaths = require("../loader-paths.cjs");

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

// SoloPlay's *Overrides.js files reassign members of core globals (NTIP.CheckItem = ...), so a
// symbol can have definition sites in both worlds. Which one is LIVE depends on the requesting
// file: SoloPlay overrides are only include()d by SoloPlay threads. Mirror that at nav time:
// from outside SoloPlay, drop SoloPlay definition sites (when a non-SoloPlay site exists).
var OVERRIDE_DIR = "/libs/soloplay/";

function inOverrideDir (fileName) {
  return String(fileName).replace(/\\/g, "/").toLowerCase().indexOf(OVERRIDE_DIR) >= 0;
}

function filterContextualDefs (fromFile, definitions) {
  if (!definitions || definitions.length < 2 || inOverrideDir(fromFile)) return definitions;
  var filtered = definitions.filter(function (d) {
    return !inOverrideDir(d.fileName);
  });
  return filtered.length > 0 ? filtered : definitions;
}

function init (modules) {
  var ts = modules.typescript;

  /** Identifies the Obj.prop pair when position sits on a property-access member name. */
  function propertyAccessAt (sourceFile, position) {
    var hit = null;
    (function walk (node) {
      if (position < node.getFullStart() || position >= node.getEnd()) return;
      if (
        ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.expression) &&
        position >= node.name.getStart(sourceFile) &&
        position < node.name.getEnd()
      ) {
        hit = { obj: node.expression.text, prop: node.name.text };
      }
      ts.forEachChild(node, walk);
    })(sourceFile);
    return hit;
  }

  /** Top-level `Obj.prop = ...` assignment sites in non-override, non-declaration program files. */
  function findAssignmentSites (program, obj, prop) {
    var out = [];
    var files = program.getSourceFiles();
    for (var i = 0; i < files.length; i++) {
      var sf = files[i];
      if (sf.isDeclarationFile || inOverrideDir(sf.fileName)) continue;
      var statements = sf.statements;
      for (var j = 0; j < statements.length; j++) {
        var s = statements[j];
        if (
          ts.isExpressionStatement(s) &&
          ts.isBinaryExpression(s.expression) &&
          s.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isPropertyAccessExpression(s.expression.left) &&
          ts.isIdentifier(s.expression.left.expression) &&
          s.expression.left.expression.text === obj &&
          s.expression.left.name.text === prop
        ) {
          var nameNode = s.expression.left.name;
          out.push({
            fileName: sf.fileName,
            textSpan: { start: nameNode.getStart(sf), length: nameNode.getWidth(sf) },
            kind: ts.ScriptElementKind.memberFunctionElement,
            name: obj + "." + prop,
            containerKind: ts.ScriptElementKind.unknown,
            containerName: obj,
          });
        }
      }
    }
    return out;
  }

  /** Finds the string literal at position when it is the first argument of a loader call. */
  function loaderLiteralAt (sourceFile, position) {
    var hit = null;
    (function walk (node) {
      if (position < node.getFullStart() || position >= node.getEnd()) return;
      if (
        ts.isStringLiteral(node) &&
        node.parent &&
        ts.isCallExpression(node.parent) &&
        node.parent.arguments[0] === node &&
        ts.isIdentifier(node.parent.expression) &&
        loaderPaths.LOADER_CALLEES.indexOf(node.parent.expression.text) >= 0
      ) {
        hit = { literal: node, callee: node.parent.expression.text };
        return;
      }
      ts.forEachChild(node, walk);
    })(sourceFile);
    return hit;
  }

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

    // Language-service proxy: pass everything through, override definition lookup so loader
    // path strings navigate to the file the runtime would load.
    var ls = info.languageService;
    var proxy = Object.create(null);
    for (var k in ls) {
      (function (key) {
        if (typeof ls[key] === "function") {
          proxy[key] = function () {
            return ls[key].apply(ls, arguments);
          };
        }
      })(k);
    }

    proxy.getDefinitionAndBoundSpan = function (fileName, position) {
      var program = ls.getProgram();
      var sourceFile = program && program.getSourceFile(fileName);
      if (sourceFile) {
        var hit = loaderLiteralAt(sourceFile, position);
        if (hit) {
          var kolbotRoot = loaderPaths.kolbotRootOf(path.normalize(fileName));
          var target = kolbotRoot &&
            loaderPaths.resolveLoaderTarget(kolbotRoot, path.normalize(fileName), hit.callee, hit.literal.text);
          if (target && fs.existsSync(target)) {
            return {
              definitions: [{
                fileName: norm(target),
                textSpan: { start: 0, length: 0 },
                kind: ts.ScriptElementKind.moduleElement,
                name: hit.literal.text,
                containerKind: ts.ScriptElementKind.unknown,
                containerName: hit.callee,
              }],
              textSpan: {
                start: hit.literal.getStart(sourceFile) + 1,
                length: hit.literal.text.length,
              },
            };
          }
        }
      }
      var res = ls.getDefinitionAndBoundSpan(fileName, position);
      if (res && res.definitions) {
        var kept = filterContextualDefs(fileName, res.definitions);
        if (kept !== res.definitions) {
          return { definitions: kept, textSpan: res.textSpan };
        }
        // The checker sometimes binds an overridden member (Obj.member = ...) to the override
        // site ONLY - the core assignment never makes the list. When asking from outside the
        // override dir, recover core sites syntactically: top-level `Obj.member =` assignments
        // in non-override program files are exactly what the runtime's global include() executes.
        if (sourceFile && !inOverrideDir(fileName) && res.definitions.length > 0 &&
            res.definitions.every(function (d) { return inOverrideDir(d.fileName); })) {
          var target = propertyAccessAt(sourceFile, position);
          if (target) {
            var coreSites = findAssignmentSites(program, target.obj, target.prop);
            if (coreSites.length > 0) {
              return { definitions: coreSites, textSpan: res.textSpan };
            }
          }
        }
      }
      return res;
    };

    // Same context rule for Go to Implementation.
    proxy.getImplementationAtPosition = function (fileName, position) {
      var impls = ls.getImplementationAtPosition(fileName, position);
      return impls ? filterContextualDefs(fileName, impls) : impls;
    };

    return proxy;
  }

  function getExternalFiles (project) {
    var root = dbjRoot(project, null);
    return root ? findDbj(root) : [];
  }

  return { create: create, getExternalFiles: getExternalFiles };
}

module.exports = init;
