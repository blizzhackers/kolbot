/**
 * @filename    LazyLoader.js
 * @author      theBGuy
 * @desc        Provides a factory function to create a proxy object that lazily loads modules on property access.
 *              Useful for grouping related modules and optimizing resource usage by loading each module only when needed.
 * 
 */

(function (module, require) {
  /**
   * Derives the relative path from LazyLoader.js's directory to the caller's directory, by walking the
   * call stack for the first frame outside this file. Used to resolve caller-relative ("./") module paths.
   * @returns {string} the relative path (e.g. "../scripts"), or "" if it couldn't be determined.
   */
  function getCallerRelativeDir() {
    const stack = new Error().stack.match(/[^\r\n]+/g);
    let loaderDir, callerDir;
    
    for (let i = 1; i < stack.length; i++) {
      // Find LazyLoader.js location
      if (/lazyloader\.js/i.test(stack[i])) {
        let match = stack[i].match(/@([a-zA-Z]:.+?)\.js:/);
        if (match) {
          loaderDir = match[1].replace(/\\/g, "/");
        }
      } else {
        // Find first non-LazyLoader caller
        const match = stack[i].match(/@([a-zA-Z]:.+?)\.js:/);
        if (match) {
          callerDir = match[1].replace(/\\/g, "/");
          break;
        }
      }
    }
    if (!loaderDir || !callerDir) return "";
    // Remove filenames, keep directories
    loaderDir = loaderDir.substring(0, loaderDir.lastIndexOf("/"));
    callerDir = callerDir.substring(0, callerDir.lastIndexOf("/"));
    // Compute relative path from loaderDir to callerDir
    const loaderParts = loaderDir.split("/");
    const callerParts = callerDir.split("/");
    // Find common root
    let i = 0;
    while (i < loaderParts.length && i < callerParts.length && loaderParts[i] === callerParts[i]) {
      i++;
    }
    // Go up from loaderDir
    let relPath = "";
    for (let j = i; j < loaderParts.length; j++) relPath += "../";
    // Go down to callerDir
    relPath += callerParts.slice(i).join("/");
    return relPath;
  }
  
  /**
   * Create a lazy-loading proxy for modules.
   * @param {Map<string, string>} modulePathMap - Map of module names to paths
   */
  function createLazyModuleProxy(modulePathMap) {
    const moduleCache = new Map();
    const callerRelDir = getCallerRelativeDir();

    /**
     * Resolves and requires a module by name, caching the result; a supplied customHandler bypasses
     * requiring and is cached/returned as-is.
     * @param {string|number} moduleName
     * @param {*} [customHandler]
     * @returns {*} the loaded module (or customHandler, if given).
     */
    function loadModule(moduleName, customHandler) {
      const nameStr = String(moduleName);
      
      if (customHandler) {
        moduleCache.set(nameStr, customHandler);
        return customHandler;
      }
      if (moduleCache.has(nameStr)) {
        return moduleCache.get(nameStr);
      }
      let modulePath = modulePathMap.get(nameStr);
      if (!modulePath) {
        throw new Error("Unknown module: " + nameStr);
      }
      try {
        if (modulePath.startsWith("./")) {
          modulePath = callerRelDir + "/" + modulePath.slice(2);
        }
        console.debug("Loading module: " + nameStr + " from " + modulePath);
        let module = require(modulePath);
        moduleCache.set(nameStr, module);
        return module;
      } catch (error) {
        throw new Error("Failed to load module " + nameStr + ": " + error.message);
      }
    }

    return new Proxy({}, {
      /**
       * @param {Object} target
       * @param {string} property
       * @returns {any}
       */
      get: function (target, property) {
        if (property === "load") {
          /** @param {string} module */
          return function (module, customHandler) {
            return loadModule(module, customHandler);
          };
        }
        if (modulePathMap.has(property)) {
          return loadModule(property);
        }
        // Backwards compatibility for ClassAttack: proxy to current class instance
        if (
          typeof property === "string" &&
          !(property in target) &&
          modulePathMap.has(me.classid)
        ) {
          const instance = loadModule(me.classid);
          if (instance && property in instance) {
            const value = instance[property];
            return typeof value === "function" ? value.bind(instance) : value;
          }
        }
        if (!target.hasOwnProperty(property)) {
          console.warn("Attempted to access unknown property: " + String(property));
        }
        return target[property];
      },
      
      /**
       * @param {Object} target
       * @param {string} property
       * @param {any} value
       * @returns {boolean}
       */
      set: function (target, property, value) {
        target[property] = value;
        return true;
      },
      
      /**
       * @param {Object} target
       * @param {string} property
       * @returns {boolean}
       */
      has: function (target, property) {
        return typeof property === "string" && (
          modulePathMap.has(property) || target.hasOwnProperty(property)
        );
      },
      
      /**
       * @param {Object} target
       * @returns {string[]}
       */
      ownKeys: function (target) {
        return Array.from(modulePathMap.keys()).concat(Object.keys(target));
      },
      
      /**
       * @param {Object} target
       * @param {string} property
       * @returns {PropertyDescriptor | undefined}
       */
      getOwnPropertyDescriptor: function (target, property) {
        if (modulePathMap.has(property)) {
          return {
            enumerable: true,
            configurable: true,
            /** @returns {*} the lazily-loaded module. */
            get: function () {
              return loadModule(property);
            }
          };
        }
        return Object.getOwnPropertyDescriptor(target, property);
      },
      
      /**
       * @param {Object} target
       * @param {string} property
       * @returns {boolean}
       */
      deleteProperty: function (target, property) {
        if (modulePathMap.has(property)) {
          if (moduleCache.has(property)) {
            moduleCache.delete(property);
          }
          if (target.hasOwnProperty(property)) {
            delete target[property];
          }
          return true;
        }
        if (target.hasOwnProperty(property)) {
          delete target[property];
          return true;
        }
        return false;
      }
    });
  }

  module.exports = createLazyModuleProxy;
})(module, require);
