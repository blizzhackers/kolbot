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

  function isDeclarationPath (fileName) {
    return /\.d\.ts$/i.test(String(fileName));
  }

  function dedupSpans (spans) {
    var seen = {};
    return spans.filter(function (s) {
      var key = s.fileName + ":" + s.textSpan.start;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  /**
   * `Object.defineProperty(obj, "prop", ...)` / `Object.defineProperties(obj, { prop: ... })`
   * sites anywhere in non-override program files - unlike plain assignments these legitimately
   * sit inside blocks (feature-detection guards in Me.js), so the walk is recursive.
   */
  function findDefinePropertySites (program, obj, prop) {
    var out = [];
    var files = program.getSourceFiles();
    for (var i = 0; i < files.length; i++) {
      var sf = files[i];
      if (sf.isDeclarationFile || inOverrideDir(sf.fileName)) continue;
      (function walk (node) {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === "Object" &&
          node.arguments.length >= 2 &&
          ts.isIdentifier(node.arguments[0]) &&
          node.arguments[0].text === obj
        ) {
          var callee = node.expression.name.text;
          var siteNode = null;
          if (callee === "defineProperty" && ts.isStringLiteral(node.arguments[1]) &&
              node.arguments[1].text === prop) {
            siteNode = node.arguments[1];
          } else if (callee === "defineProperties" && ts.isObjectLiteralExpression(node.arguments[1])) {
            for (var p = 0; p < node.arguments[1].properties.length; p++) {
              var entry = node.arguments[1].properties[p];
              if (entry.name && ts.isIdentifier(entry.name) && entry.name.text === prop) {
                siteNode = entry.name;
                break;
              }
            }
          }
          if (siteNode) {
            out.push({
              fileName: norm(sf.fileName),
              textSpan: { start: siteNode.getStart(sf), length: siteNode.getWidth(sf) },
              kind: ts.ScriptElementKind.memberVariableElement,
              name: obj + "." + prop,
              containerKind: ts.ScriptElementKind.unknown,
              containerName: obj,
            });
          }
        }
        ts.forEachChild(node, walk);
      })(sf);
    }
    return out;
  }

  /**
   * Member implementation sites inside the INITIALIZER of a top-level `const obj = ...`:
   * object-literal properties, IIFE-returned literal properties, and `this.prop = ...` inside
   * `new function () {...}` singletons (that shape is opaque to tsserver's implementation
   * search - no contextual typing flows into constructor-function this-assignments).
   */
  function findMemberSites (program, obj, prop) {
    var out = [];

    function unwrapParens (node) {
      while (node && ts.isParenthesizedExpression(node)) node = node.expression;
      return node;
    }
    function pushSite (sf, nameNode) {
      out.push({
        fileName: norm(sf.fileName),
        textSpan: { start: nameNode.getStart(sf), length: nameNode.getWidth(sf) },
        kind: ts.ScriptElementKind.memberFunctionElement,
        name: obj + "." + prop,
        containerKind: ts.ScriptElementKind.unknown,
        containerName: obj,
      });
    }
    function scanObjectLiteral (sf, literal) {
      for (var p = 0; p < literal.properties.length; p++) {
        var entry = literal.properties[p];
        var name = entry.name;
        if (name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) && name.text === prop) {
          pushSite(sf, name);
        }
      }
    }
    function scanCtorBody (sf, fn) {
      if (!fn || !fn.body) return;
      (function walk (node) {
        if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isPropertyAccessExpression(node.left) &&
          node.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
          node.left.name.text === prop
        ) {
          pushSite(sf, node.left.name);
        }
        ts.forEachChild(node, walk);
      })(fn.body);
    }

    var files = program.getSourceFiles();
    for (var i = 0; i < files.length; i++) {
      var sf = files[i];
      if (sf.isDeclarationFile || inOverrideDir(sf.fileName)) continue;
      // Recursive: UMD modules build the object inside their factory closure
      // (libs/oog/D2Bot.js), so the declaration is NOT a top-level statement.
      (function walkDecls (node) {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
            node.name.text === obj && node.initializer) {
          var init = unwrapParens(node.initializer);
          if (ts.isObjectLiteralExpression(init)) {
            scanObjectLiteral(sf, init);
          } else if (ts.isNewExpression(init)) {
            var ctor = unwrapParens(init.expression);
            if (ctor && ts.isFunctionExpression(ctor)) scanCtorBody(sf, ctor);
          } else if (ts.isCallExpression(init)) {
            var fn = unwrapParens(init.expression);
            if (fn && ts.isFunctionExpression(fn) && fn.body) {
              for (var r = 0; r < fn.body.statements.length; r++) {
                var ret = fn.body.statements[r];
                if (ts.isReturnStatement(ret) && ret.expression) {
                  var retVal = unwrapParens(ret.expression);
                  if (ts.isObjectLiteralExpression(retVal)) scanObjectLiteral(sf, retVal);
                }
              }
            }
          }
        }
        ts.forEachChild(node, walkDecls);
      })(sf);
    }
    return out;
  }

  /**
   * Identifier-level implementation sites for ambient-only globals whose runtime value is
   * built by a module wrapper (UMD `root.X = factory()` in D2Bot.js, OOG.js's Object.assign
   * export): the `const X = {...}`/`new function`/IIFE declaration at ANY depth, plus
   * `<anything>.X = ...` publication assignments. require()-alias consts don't match: the
   * initializer must be a literal/constructor shape, not an arbitrary call.
   */
  function findGlobalValueSites (program, name) {
    var out = [];
    var files = program.getSourceFiles();
    for (var i = 0; i < files.length; i++) {
      var sf = files[i];
      if (sf.isDeclarationFile || inOverrideDir(sf.fileName)) continue;
      (function walk (node) {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
            node.name.text === name && node.initializer) {
          var init = unwrapParensOf(node.initializer);
          var ok = ts.isObjectLiteralExpression(init) || ts.isNewExpression(init) ||
            (ts.isCallExpression(init) && ts.isFunctionExpression(unwrapParensOf(init.expression)));
          if (ok) {
            out.push({
              fileName: norm(sf.fileName),
              textSpan: { start: node.name.getStart(sf), length: node.name.getWidth(sf) },
              kind: ts.ScriptElementKind.constElement,
              name: name,
              containerKind: ts.ScriptElementKind.unknown,
              containerName: "",
            });
          }
        }
        if (
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isPropertyAccessExpression(node.left) &&
          node.left.name.text === name
        ) {
          out.push({
            fileName: norm(sf.fileName),
            textSpan: { start: node.left.name.getStart(sf), length: node.left.name.getWidth(sf) },
            kind: ts.ScriptElementKind.constElement,
            name: name,
            containerKind: ts.ScriptElementKind.unknown,
            containerName: "",
          });
        }
        ts.forEachChild(node, walk);
      })(sf);
    }
    return out;
  }

  function unwrapParensOf (node) {
    while (node && ts.isParenthesizedExpression(node)) node = node.expression;
    return node;
  }

  /** The same-basename .js implementation next to a module .d.ts, if the program has it. */
  function siblingJsSourceFile (program, dtsFileName) {
    if (!isDeclarationPath(dtsFileName)) return null;
    var jsPath = String(dtsFileName).replace(/\.d\.ts$/i, ".js");
    return program.getSourceFile(jsPath) || program.getSourceFile(norm(jsPath)) || null;
  }

  /**
   * Value sites for `name` inside ONE file: declarations first (the class/const itself),
   * export-assignments (`exports.X = X`) as fallback. Scoped to a single sibling file so
   * common member names never fan out repo-wide.
   */
  function findLocalValueSites (sf, name) {
    var decls = [];
    var assigns = [];
    (function walk (node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
          node.name.text === name && node.initializer) {
        decls.push(node.name);
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isPropertyAccessExpression(node.left) && node.left.name.text === name &&
          node.right.kind !== ts.SyntaxKind.VoidExpression) {
        assigns.push(node.left.name);
      }
      ts.forEachChild(node, walk);
    })(sf);
    var picked = decls.length ? decls : assigns;
    return picked.map(function (n) {
      return {
        fileName: norm(sf.fileName),
        textSpan: { start: n.getStart(sf), length: n.getWidth(sf) },
        kind: ts.ScriptElementKind.constElement,
        name: name,
        containerKind: ts.ScriptElementKind.unknown,
        containerName: "",
      };
    });
  }

  /**
   * Definition site of the require shim: the `global.require = (...)` assignment in
   * libs/require.js. require is deliberately NOT declared in the ambient d.ts - a declared
   * global would defeat tsserver's CommonJS inference that types `const X = require("...")`
   * from the module file - so identifier navigation is provided here instead.
   */
  function requireShimSite (program, kolbotRoot) {
    var shimPath = path.join(kolbotRoot, "libs", "require.js");
    var sf = program.getSourceFile(shimPath) || program.getSourceFile(norm(shimPath));
    if (!sf) return null;
    for (var i = 0; i < sf.statements.length; i++) {
      var s = sf.statements[i];
      if (
        ts.isExpressionStatement(s) &&
        ts.isBinaryExpression(s.expression) &&
        s.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(s.expression.left) &&
        ts.isIdentifier(s.expression.left.expression) &&
        s.expression.left.expression.text === "global" &&
        s.expression.left.name.text === "require"
      ) {
        var nameNode = s.expression.left.name;
        return {
          fileName: norm(sf.fileName),
          textSpan: { start: nameNode.getStart(sf), length: nameNode.getWidth(sf) },
          kind: ts.ScriptElementKind.functionElement,
          name: "require",
          containerKind: ts.ScriptElementKind.unknown,
          containerName: "global",
        };
      }
    }
    return null;
  }

  /** The identifier node containing position, or null. */
  function identifierAt (sourceFile, position) {
    var hit = null;
    (function walk (node) {
      if (position < node.getFullStart() || position >= node.getEnd()) return;
      if (ts.isIdentifier(node) && position >= node.getStart(sourceFile)) hit = node;
      ts.forEachChild(node, walk);
    })(sourceFile);
    return hit;
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
      // Undeclared-global fallback: `require` has no ambient declaration (see requireShimSite),
      // so native lookup yields nothing unless a local binding shadows it - which correctly
      // takes precedence because res is non-empty then.
      if ((!res || !res.definitions || res.definitions.length === 0) && sourceFile) {
        var ident = identifierAt(sourceFile, position);
        if (ident && ident.text === "require") {
          var reqRoot = loaderPaths.kolbotRootOf(path.normalize(fileName));
          var shim = reqRoot && requireShimSite(program, reqRoot);
          if (shim) {
            return {
              definitions: [shim],
              textSpan: { start: ident.getStart(sourceFile), length: ident.getWidth(sourceFile) },
            };
          }
        }
      }
      // No native response at all for a property access: recover syntactic sites with a
      // constructed bound span (the checker can fail to bind members it has no type for).
      if ((!res || !res.definitions || res.definitions.length === 0) && sourceFile) {
        var paTarget = propertyAccessAt(sourceFile, position);
        if (paTarget) {
          var paSites = dedupSpans(findAssignmentSites(program, paTarget.obj, paTarget.prop)
            .concat(findDefinePropertySites(program, paTarget.obj, paTarget.prop))
            .concat(findMemberSites(program, paTarget.obj, paTarget.prop)));
          if (paSites.length > 0) {
            var paNode = identifierAt(sourceFile, position);
            return {
              definitions: paSites,
              textSpan: paNode
                ? { start: paNode.getStart(sourceFile), length: paNode.getWidth(sourceFile) }
                : (res && res.textSpan) || { start: position, length: 0 },
            };
          }
        }
      }
      if (res && res.definitions) {
        var defs = filterContextualDefs(fileName, res.definitions);
        var changed = defs !== res.definitions;
        // Implementation preference: interfaces deliberately share their const's name
        // (interface Experience + const Experience), which makes native lookup return the d.ts
        // alongside the js const. For a VALUE reference the implementation is the answer - the
        // d.ts stays reachable via Go to Type Definition. identifierAt() is the type-position
        // guard: JSDoc type references ({@type {Experience}}) live outside forEachChild's
        // traversal, so ident is null there and the d.ts result passes through untouched.
        var ident = sourceFile && identifierAt(sourceFile, position);
        if (ident && defs.length > 1) {
          var impls = defs.filter(function (d) { return !isDeclarationPath(d.fileName); });
          if (impls.length > 0 && impls.length < defs.length) {
            defs = impls;
            changed = true;
          }
        }
        // All-ambient property access (me.walk, me.needMerc): the runtime addition is an
        // assignment, not a declaration, so the checker only ever knows the d.ts member.
        // Recover the executable site syntactically - the same trick the override fallback
        // below uses, extended to Object.defineProperty/defineProperties getter additions.
        // Empty defs count as "all ambient": a member the checker failed to bind at all
        // still deserves the syntactic recovery.
        if (sourceFile &&
            defs.every(function (d) { return isDeclarationPath(d.fileName); })) {
          var ambientTarget = propertyAccessAt(sourceFile, position);
          if (ambientTarget) {
            var implSites = findAssignmentSites(program, ambientTarget.obj, ambientTarget.prop)
              .concat(findDefinePropertySites(program, ambientTarget.obj, ambientTarget.prop))
              .concat(findMemberSites(program, ambientTarget.obj, ambientTarget.prop));
            // Contextual typing lets the native implementation search reach object-literal
            // members the syntactic scans could miss; keep executable (.js) results only.
            // try/catch: an implementation-search Debug failure must degrade, not turn the
            // whole definition request into an error response.
            var nativeImpls = [];
            try {
              nativeImpls = ls.getImplementationAtPosition(fileName, position) || [];
            } catch (e) {}
            for (var ni = 0; ni < nativeImpls.length; ni++) {
              if (!isDeclarationPath(nativeImpls[ni].fileName)) implSites.push(nativeImpls[ni]);
            }
            // Module-pair remap: when the only defs are in a .d.ts sitting next to its js
            // implementation (hand-typed UMD modules like modules/Override), jump into the js.
            if (implSites.length === 0) {
              for (var si = 0; si < defs.length; si++) {
                var sibSf = siblingJsSourceFile(program, defs[si].fileName);
                if (sibSf) implSites = implSites.concat(findLocalValueSites(sibSf, ambientTarget.prop));
              }
            }
            implSites = dedupSpans(implSites);
            if (implSites.length > 0) {
              defs = implSites;
              changed = true;
            }
          } else if (ident) {
            // Bare identifier with ambient-only defs: a module-built global (UMD D2Bot,
            // OOG.js's Object.assign exports). Navigate to the closure declaration or
            // publication site instead of the d.ts declare.
            var valueSites = dedupSpans(findGlobalValueSites(program, ident.text));
            if (valueSites.length > 0) {
              defs = valueSites;
              changed = true;
            }
          }
        }
        // The checker sometimes binds an overridden member (Obj.member = ...) to the override
        // site ONLY - the core assignment never makes the list. When asking from outside the
        // override dir, recover core sites syntactically: top-level `Obj.member =` assignments
        // in non-override program files are exactly what the runtime's global include() executes.
        if (sourceFile && !inOverrideDir(fileName) && defs.length > 0 &&
            defs.every(function (d) { return inOverrideDir(d.fileName); })) {
          var target = propertyAccessAt(sourceFile, position);
          if (target) {
            // Same three scans as the ambient branch: the core "definition" of an overridden
            // member can be an assignment OR a literal member (Town.doChores in Town.js).
            var coreSites = findAssignmentSites(program, target.obj, target.prop)
              .concat(findDefinePropertySites(program, target.obj, target.prop))
              .concat(findMemberSites(program, target.obj, target.prop));
            coreSites = dedupSpans(coreSites);
            if (coreSites.length > 0) {
              defs = coreSites;
              changed = true;
            }
          }
        }
        if (changed) {
          return { definitions: defs, textSpan: res.textSpan };
        }
      }
      return res;
    };

    // Same context rule for Go to Implementation, plus the ambient-member recovery: prefer
    // executable sites when any exist, and fall back to the syntactic scans when the native
    // search only knows the d.ts (the CollMap/AutoSkill `new function(){}` singleton shape).
    proxy.getImplementationAtPosition = function (fileName, position) {
      var impls = ls.getImplementationAtPosition(fileName, position);
      var kept = impls ? filterContextualDefs(fileName, impls) : [];
      var executable = kept.filter(function (d) { return !isDeclarationPath(d.fileName); });
      if (executable.length > 0) return executable;
      var program = ls.getProgram();
      var sourceFile = program && program.getSourceFile(fileName);
      var target = sourceFile && propertyAccessAt(sourceFile, position);
      if (target) {
        var sites = findAssignmentSites(program, target.obj, target.prop)
          .concat(findDefinePropertySites(program, target.obj, target.prop))
          .concat(findMemberSites(program, target.obj, target.prop));
        if (sites.length > 0) return dedupSpans(sites);
      }
      return impls ? kept : impls;
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
