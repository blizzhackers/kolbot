/* eslint-disable max-len */
/**
*  @filename    ConfigOverrides.js
*  @author      theBGuy
*  @desc        Config.js additions to improve functionality for map mode
*
*/

includeIfNotIncluded("core/Config.js");

let original = Config.init;

Config.init = function (notify) {
  let configFilename = "";
  let classes = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"];

  for (let i = 0; i < 5; i += 1) {
    switch (i) {
    case 0: // Custom config
      includeIfNotIncluded("config/_customconfig.js");

      for (let n in CustomConfig) {
        if (CustomConfig.hasOwnProperty(n)) {
          if (CustomConfig[n].indexOf(me.profile) > -1) {
            if (notify) {
              print("ÿc2Loading custom config: ÿc9" + n + ".js");
            }

            configFilename = n + ".js";

            break;
          }
        }
      }

      break;
    case 1:// Class.Profile.js
      configFilename = classes[me.classid] + "." + me.profile + ".js";

      break;
    case 2: // Realm.Class.Charname.js
      configFilename = me.realm + "." + classes[me.classid] + "." + me.charname + ".js";

      break;
    case 3: // Class.Charname.js
      configFilename = classes[me.classid] + "." + me.charname + ".js";

      break;
    case 4: // Profile.js
      configFilename = me.profile + ".js";

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
      throw new Error("Failed to load character config.");
    }
  } else {
    if (notify) {
      print("ÿc1" + classes[me.classid] + "." + me.charname + ".js not found!"); // Use the primary format
      print("ÿc1Loading default config.");
    }

    try {
      // Try to find default config
      if (!FileTools.exists("libs/manualplay/config/" + classes[me.classid] + ".js")) {
        D2Bot.printToConsole("Not going well? Read the guides: https://github.com/blizzhackers/documentation");
        throw new Error("ÿc1Default config not found. \nÿc9     Try reading the kolbot guides.");
      }

      if (!include("manualplay/config/" + classes[me.classid] + ".js")) {
        throw new Error("ÿc1Failed to load default config.");
      }
    } catch (e) {
      print(e);
      original();
    }
  }

  try {
    LoadConfig.call();
  } catch (e2) {
    if (notify) {
      print("ÿc8Error in " + e2.fileName.substring(e2.fileName.lastIndexOf("\\") + 1, e2.fileName.length) + "(line " + e2.lineNumber + "): " + e2.message);

      throw new Error("Config.init: Error in character config.");
    }
  }

  if (Config.Silence && !Config.LocalChat.Enabled) {
    // Override the say function with print, so it just gets printed to console
    global._say = global.say;
    global.say = (what) => print("Tryed to say: " + what);
  }

  try {
    if (Config.AutoBuild.Enabled === true && !isIncluded("core/Auto/AutoBuild.js") && include("core/Auto/AutoBuild.js")) {
      AutoBuild.initialize();
    }
  } catch (e3) {
    print("ÿc8Error in libs/core/AutoBuild.js (AutoBuild system is not active!)");
    print(e3.toSource());
  }
};
