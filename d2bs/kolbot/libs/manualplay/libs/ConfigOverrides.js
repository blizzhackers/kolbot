/**
*  @filename    ConfigOverrides.js
*  @author      theBGuy
*  @desc        Config.js additions to improve functionality for map mode
*
*/

includeIfNotIncluded("core/Config.js");

(function (Config, original) {
  /**
   * Loads the manualplay character config (falling back to the class default) before delegating
   * to the original `Config.init` for the shared setup and AutoBuild initialization.
   * @param {boolean} notify
   * @returns {void}
   */
  Config.init = function (notify) {
    const className = sdk.player.class.nameOf(me.classid);
    const formats = ((className, profile, charname, realm) => ({
      // Class.Profile.js
      1: className + "." + profile + ".js",
      // Realm.Class.Charname.js
      2: realm + "." + className + "." + charname + ".js",
      // Class.Charname.js
      3: className + "." + charname + ".js",
      // Profile.js
      4: profile + ".js",
      // Class.js
      5: className + ".js",
    }))(className, me.profile, me.charname, me.realm);
    let configFilename = "";

    for (let i = 0; i < 5; i++) {
      switch (i) {
      case 0: // Custom config
        includeIfNotIncluded("config/_customconfig.js");

        for (let n in CustomConfig) {
          if (CustomConfig.hasOwnProperty(n) && CustomConfig[n].includes(me.profile)) {
            notify && console.log("ÿc2Loading custom config: ÿc9" + n + ".js");
            configFilename = n + ".js";

            break;
          }
        }

        break;
      default:
        configFilename = formats[i];

        break;
      }

      if (configFilename && FileTools.exists("libs/manualplay/config/" + configFilename)) {
        break;
      }
    }

    if (FileTools.exists("libs/manualplay/config/" + configFilename)) {
      try {
        if (!include("manualplay/config/" + configFilename)) {
          throw new Error();
        }
      } catch (e1) {
        throw new Error("Failed to load character config." + (e1 && e1.message ? " - " + e1.message : ""));
      }
    } else {
      if (notify) {
        console.log("ÿc1" + className + "." + me.charname + ".js not found!"); // Use the primary format
        console.log("ÿc1Loading default config.");
      }

      try {
        // Try to find default config
        if (!FileTools.exists("libs/manualplay/config/" + className + ".js")) {
          D2Bot.printToConsole("Not going well? Read the guides: https://github.com/blizzhackers/documentation");
          throw new Error("ÿc1Default config not found. \nÿc9     Try reading the kolbot guides.");
        }

        if (!include("manualplay/config/" + className + ".js")) {
          throw new Error("ÿc1Failed to load default config.");
        }
      } catch (e) {
        console.log(e);
        original.apply(this, arguments);
      }
    }

    try {
      LoadConfig.call();
    } catch (e2) {
      if (notify) {
        console.error(e2);
        
        // e2 is surfaced via console.error immediately above; the throw is a clean domain message
        throw new Error("Config.init: Error in character config.");
      }
    }

    if (Config.Silence && !Config.LocalChat.Enabled) {
      // Override the say function with print, so it just gets printed to console
      global._say = global.say;
      /**
       * @param {string} what
       * @returns {void}
       */
      global.say = (what) => console.log("Tryed to say: " + what);
    }

    try {
      if (Config.AutoBuild.Enabled === true && includeIfNotIncluded("core/Auto/AutoBuild.js")) {
        AutoBuild.initialize();
      }
    } catch (e3) {
      console.log("ÿc8Error in libs/core/AutoBuild.js (AutoBuild system is not active!)");
      console.error(e3);
    }
  };
})(Config, Config.init);
