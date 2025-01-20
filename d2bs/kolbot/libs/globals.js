/**
*  @filename    globals.js
*  @author      theBGuy
*  @desc        Globals that aren't polyfills just helpful utils that need to be accessable both in-game and out
*
*/

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~ global d2bs helpers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - sdk - sdk object @see libs/modules/sdk.js
 * - includeIfNotIncluded - include file if not already included
 * - includeCoreLibs - include all core libs
 * - includeSystemLibs - include all system driver files
 * - clone - clone object
 * - copyObj
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */


if (!global.hasOwnProperty("sdk") && typeof require !== "undefined") {
  Object.defineProperty(global, "sdk", {
    value: require("../modules/sdk"),
    enumerable: true,
  });
}

if (!global.hasOwnProperty("includeIfNotIncluded")) {
  Object.defineProperty(global, "includeIfNotIncluded", {
    /**
     * @param {string} file
     */
    value: function (file = "") {
      if (!isIncluded(file)) {
        if (!include(file)) {
          console.error("Failed to include " + file);
          console.trace();
          return false;
        }
      }
      return true;
    },
  });
}

if (!global.hasOwnProperty("includeCoreLibs")) {
  Object.defineProperty(global, "includeCoreLibs", {
    /**
     * @description includes all files from libs/core/ folder
     * @param {string[]} ignoreFiles
     */
    value: function (obj = { exclude: [] }) {
      /** @type {string[]} */
      let files = dopen("libs/core/").getFiles();
      if (!files.length) throw new Error("Failed to find my files");
      if (!files.includes("Pather.js")) {
        console.warn("Incorrect Files?", files);
        // something went wrong?
        while (!files.includes("Pather.js")) {
          files = dopen("libs/core/").getFiles();
          delay(50);
        }
      }
      // always include util first
      includeIfNotIncluded("core/Util.js");
      files
        .filter(function (file) {
          return file.endsWith(".js")
            && !obj.exclude.includes(file)
            && !file.match("util.js", "gi");
        })
        .forEach(function (x) {
          if (!includeIfNotIncluded("core/" + x)) {
            throw new Error("Failed to include core/" + x);
          }
        });
      return true;
    },
  });
}

if (!global.hasOwnProperty("includeSystemLibs")) {
  Object.defineProperty(global, "includeSystemLibs", {
    /**
     * @description includes system driver files from libs/systems/ folder
     */
    value: function () {
      include("systems/automule/automule.js");
      include("systems/crafting/CraftingSystem.js");
      include("systems/gambling/Gambling.js");
      include("systems/torch/TorchSystem.js");
      return true;
    },
  });
}

if (!global.hasOwnProperty("clone")) {
  Object.defineProperty(global, "clone", {
    /**
     * @param {Date | any[] | object} obj 
     * @returns {ThisParameterType} deep copy of parameter
     */
    value: function (obj) {
      let copy;

      // Handle the 3 simple types, and null or undefined
      if (null === obj || "object" !== typeof obj) {
        return obj;
      }

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());

        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];

        for (let i = 0; i < obj.length; i += 1) {
          copy[i] = clone(obj[i]);
        }

        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};

        for (let attr in obj) {
          if (obj.hasOwnProperty(attr)) {
            copy[attr] = clone(obj[attr]);
          }
        }

        return copy;
      }

      throw new Error("Unable to copy obj! Its type isn't supported.");
    },
  });
}

if (!global.hasOwnProperty("copyObj")) {
  Object.defineProperty(global, "copyObj", {
    /**
     * @param {object} from 
     * @returns {object} deep copy
     */
    value: function (from) {
      let obj = {};

      for (let i in from) {
        if (from.hasOwnProperty(i)) {
          obj[i] = clone(from[i]);
        }
      }

      return obj;
    },
  });
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Misc Utils ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Time - Namespace of Helper methods for dealing with time
 * - isType - Method to peform simple type checks
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

const Time = {
  /**
   * Converts seconds to milliseconds.
   * 
   * @param {number} [seconds=0] - The number of seconds to convert.
   * @returns {number} - The equivalent time in milliseconds.
   */
  seconds: function (seconds = 0) {
    if (!isType(seconds, "number")) return 0;
    return (seconds * 1000);
  },

  /**
   * Converts minutes to milliseconds.
   * 
   * @param {number} [minutes=0] - The number of minutes to convert.
   * @returns {number} - The equivalent time in milliseconds.
   */
  minutes: function (minutes = 0) {
    if (!isType(minutes, "number")) return 0;
    return (minutes * 60000);
  },

  /**
   * Formats milliseconds into a "HH:MM:SS" string.
   * 
   * @param {number} [ms=0] - The time in milliseconds to format.
   * @returns {string} - The formatted time string.
   */
  format: function (ms = 0) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    /** @param {number} num */
    const pad = function (num) {
      return (num < 10 ? "0" + num : num);
    };

    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    // return (new Date(ms).toISOString().slice(11, -5));
  },

  /**
   * Converts milliseconds to seconds.
   * 
   * @param {number} [ms=0] - The time in milliseconds to convert.
   * @returns {number} - The equivalent time in seconds.
   */
  toSeconds: function (ms = 0) {
    return (ms / 1000);
  },

  /**
   * Converts milliseconds to minutes.
   * 
   * @param {number} [ms=0] - The time in milliseconds to convert.
   * @returns {number} - The equivalent time in minutes.
   */
  toMinutes: function (ms = 0) {
    return (ms / 60000);
  },

  /**
   * Converts milliseconds to hours.
   * 
   * @param {number} [ms=0] - The time in milliseconds to convert.
   * @returns {number} - The equivalent time in hours.
   */
  toHours: function (ms = 0) {
    return (ms / 3600000);
  },

  /**
   * Converts milliseconds to days.
   * 
   * @param {number} [ms=0] - The time in milliseconds to convert.
   * @returns {number} - The equivalent time in days.
   */
  toDays: function (ms = 0) {
    return (ms / 86400000);
  },

  /**
   * Calculates the elapsed time from a given timestamp.
   * 
   * @param {number} [ms=0] - The starting time in milliseconds.
   * @returns {number} - The elapsed time in milliseconds.
   */
  elapsed: function (ms = 0) {
    return (getTickCount() - ms);
  }
};

/**
 * @param {any} val 
 * @param {PrimitiveType} type 
 * @returns {boolean}
 */
const isType = function (val, type) {
  if (type === "array") {
    return Array.isArray(val);
  }
  return typeof val === type;
};

/**
 * get all running threads and return them as an array
 * @returns {Script[]}
 */
const getThreads = function () {
  let threads = [];
  let script = getScript();

  if (script) {
    do {
      threads.push(copyObj(script));
    } while (script.getNext());
  }

  return threads;
};
