/* eslint-disable @stylistic/max-len */
/* eslint-disable dot-notation */
/**
*  @filename    require.js
*  @author      Jaenster
*  @desc        A node like require function.
*
*/
!isIncluded("polyfill.js") && include("polyfill.js");

// noinspection ThisExpressionReferencesGlobalObjectJS <-- definition of global here
typeof global === "undefined" && (this["global"] = this);

global["module"] = { exports: undefined };
global["exports"] = {};
/**
 * Resolves "." and ".." segments out of a path, normalizing backslashes to forward slashes.
 * @param {string} test path to normalize
 * @returns {string} normalized path with relative segments collapsed
 */
function removeRelativePath(test) {
  return test.replace(/\\/g, "/").split("/").reduce(function (acc, cur) {
    if (!cur || cur === ".") return acc;
    if (cur === "..") {
      acc.pop();
      return acc;
    }
    acc.push(cur);
    return acc;

  }, []).join("/");
}
global.require = (function (include, isIncluded, print, notify) {
  const debug = false;

  let depth = 0;
  const modules = {};
  const obj = function require(field, path) {
    const stack = new Error().stack.match(/[^\r\n]+/g);
    let directory = stack[1].match(/.*?@.*?d2bs\\(kolbot\\?.*)\\.*(\.js|\.dbj):/)[1].replace("\\", "/") + "/";
    let filename = stack[1].match(/.*?@.*?d2bs\\kolbot\\?(.*)(\.js|\.dbj):/)[1];
    filename = filename.substr(filename.length - filename.split("").reverse().join("").indexOf("\\"));
    // remove the name kolbot of the file
    if (directory.startsWith("kolbot")) {
      directory = directory.substr("kolbot".length);
    }

    // remove the / from it
    if (directory.startsWith("/")) {
      directory = directory.substr(1);
    }

    // strip off lib
    if (directory.startsWith("lib")) {
      directory = directory.substr(4);
    } else {
      directory = "../" + directory; // Add a extra recursive path, as we start out of the lib directory
    }

    // remove the / from it, in case it was libs/ (rather than lib/) and we now have a leading slash
    if (directory.startsWith("/")) {
      directory = directory.substr(1);
    }

    path = path || directory;

    let fullpath = removeRelativePath((path + field).replace(/\\/, "/")).toLowerCase();
    // remove lib again, if required in e.g. kolbot\tools but wants modules\whatever
    if (fullpath.startsWith("lib")) {
      fullpath = fullpath.substr(4);
    }

    // remove the / from it, in case it was libs/ (rather than lib/) and we now have a leading slash
    if (fullpath.startsWith("/")) {
      fullpath = fullpath.substr(1);
    }

    const packageName = fullpath;

    const asNew = this.__proto__.constructor === require && ((...args) => new (Function.prototype.bind.apply(modules[packageName].exports, args)));

    if (field.hasOwnProperty("endsWith") && field.endsWith(".json")) { // Simply reads a json file
      return modules[packageName] = File.open("libs/" + path + field, 0).readAllLines();
    }

    let nameShort;
    try {
      nameShort = (fullpath + ".js").match(/.*?\/([^/]*).js$/)[1];
    } catch (e) {
      // file in libs folder same as us
      nameShort = (fullpath + ".js").match(/.*?\/([^/]*).js$/)[0];
    }
    const moduleNameShort = nameShort;

    if (!isIncluded(fullpath + ".js") && !modules.hasOwnProperty(moduleNameShort)) {
      if (debug) {
        depth && notify && console.log("ÿc2Kolbotÿc0 ::    - loading dependency of " + filename + ": " + moduleNameShort);
        !depth && notify && console.log("ÿc2Kolbotÿc0 :: Loading module: " + moduleNameShort);
      }

      let oldModule = Object.create(global["module"]);
      let oldExports = Object.create(global["exports"]);
      delete global["module"];
      delete global["exports"];
      global["module"] = { exports: null };
      global["exports"] = {};

      // Include the file;
      try {
        depth++;
        if (!include(fullpath + ".js")) {
          const err = new Error("module " + fullpath + " not found");

          // Rewrite the location of the error, to be more clear for the developer/user _where_ it crashes
          const myStack = err.stack.match(/[^\r\n]+/g);
          err.fileName = directory + myStack[1].match(/.*?@.*?d2bs\\kolbot\\?(.*)(\.js|\.dbj):/)[1];
          err.lineNumber = myStack[1].substr(stack[1].lastIndexOf(":") + 1);
          myStack.unshift();
          err.stack = myStack.join("\r\n"); // rewrite stack

          throw err;
        }
      } finally {
        depth--;
      }

      if (!global["module"]["exports"] && Object.keys(global["exports"])) { // Incase its transpiled typescript
        global["module"]["exports"] = global["exports"];
      }

      modules[packageName] = Object.create(global["module"]);
      delete global["module"];
      delete global["exports"];
      global["module"] = oldModule;
      global["exports"] = oldExports;
    }

    if (!modules.hasOwnProperty(packageName)) throw Error("unexpected module error -- " + field);

    // If called as "new", fake an constructor
    return asNew || modules[packageName].exports;
  };
  obj.modules = modules;
  return obj;
})(include, isIncluded, print, getScript(true).name.toLowerCase().split("").reverse().splice(0, ".dbj".length).reverse().join("") === ".dbj");

/**
 * Ensures the calling script is running as its own thread rather than inline, loading it as a
 * separate script if it isn't already running.
 * @returns {"thread" | "started" | "loaded"} "thread" if already running as this thread, "started"
 * if it was just loaded as a new thread, "loaded" if it was already loaded under another thread
 */
getScript.startAsThread = function () {
  let stack = new Error().stack.match(/[^\r\n]+/g),
    filename = stack[1].match(/.*?@.*?d2bs\\kolbot\\(.*):/)[1];

  if (getScript(true).name.toLowerCase() === filename.toLowerCase()) {
    return "thread";
  }

  if (!getScript(filename)) {
    load(filename);
    return "started";
  }

  return "loaded";
};
