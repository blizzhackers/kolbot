/**
*  @filename    Loader.js
*  @author      kolton, theBGuy
*  @desc        script loader, based on mBot's Sequencer.js
*
*/

const Loader = {
  fileList: [],
  scriptList: [],
  scriptIndex: -1,
  skipTown: ["Test", "Follower"],
  doneScripts: new Set(),

  init: function () {
    this.getScripts();
    this.loadScripts();
  },

  getScripts: function () {
    let fileList = dopen("libs/scripts/").getFiles();

    for (let i = 0; i < fileList.length; i += 1) {
      if (fileList[i].indexOf(".js") > -1) {
        this.fileList.push(fileList[i].substring(0, fileList[i].indexOf(".js")));
      }
    }
  },

  // see http://stackoverflow.com/questions/728360/copying-an-object-in-javascript#answer-728694
  clone: function (obj) {
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
        copy[i] = this.clone(obj[i]);
      }

      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};

      for (let attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.clone(obj[attr]);
        }
      }

      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  },

  copy: function (from, to) {
    for (let i in from) {
      if (from.hasOwnProperty(i)) {
        to[i] = this.clone(from[i]);
      }
    }
  },

  loadScripts: function () {
    let reconfiguration, unmodifiedConfig = {};

    this.copy(Config, unmodifiedConfig);

    if (!this.fileList.length) {
      showConsole();

      throw new Error("You don't have any valid scripts in bots folder.");
    }

    for (let s in Scripts) {
      if (Scripts.hasOwnProperty(s) && Scripts[s]) {
        Loader.scriptList.push(s);
      }
    }

    // handle getting cube here instead of from Cubing.doCubing
    if (Config.Cubing && !me.getItem(sdk.quest.item.Cube) && me.accessToAct(2)) {
      // we can actually get the cube - fixes bug causing level 1's to crash
      Loader.runScript("GetCube");
    }

    for (Loader.scriptIndex = 0; Loader.scriptIndex < Loader.scriptList.length; Loader.scriptIndex++) {
      let script = this.scriptList[this.scriptIndex];

      if (this.fileList.indexOf(script) === -1) {
        if (FileTools.exists("scripts/" + script + ".js")) {
          console.warn(
            "ÿc1Something went wrong in loader, file exists in folder but didn't get included during init process. "
            + "Lets ignore the error and continue to include the script by name instead"
          );
        } else {
          Misc.errorReport("ÿc1Script " + script + " doesn't exist.");

          continue;
        }
      }

      if (!include("scripts/" + script + ".js")) {
        Misc.errorReport("Failed to include script: " + script);
        continue;
      }

      if (isIncluded("scripts/" + script + ".js")) {
        try {
          if (typeof (global[script]) !== "function") {
            throw new Error("Invalid script function name");
          }

          if (this.skipTown.includes(script) || Town.goToTown()) {
            console.log("ÿc2Starting script: ÿc9" + script);
            Messaging.sendToScript("threads/toolsthread.js", JSON.stringify({ currScript: script }));
            reconfiguration = typeof Scripts[script] === "object";

            if (reconfiguration) {
              console.log("ÿc2Copying Config properties from " + script + " object.");
              this.copy(Scripts[script], Config);
            }

            let tick = getTickCount();
            let exp = me.getStat(sdk.stats.Experience);

            if (me.inTown) {
              if (Config.StackThawingPots.enabled) {
                Town.buyPots(Config.StackThawingPots.quantity, sdk.items.ThawingPotion, true);
              }
              if (Config.StackAntidotePots.enabled) {
                Town.buyPots(Config.StackAntidotePots.quantity, sdk.items.AntidotePotion, true);
              }
              if (Config.StackStaminaPots.enabled) {
                Town.buyPots(Config.StackStaminaPots.quantity, sdk.items.StaminaPotion, true);
              }
            }

            // kinda hacky, but faster for mfhelpers to stop
            if (Config.MFLeader && Config.PublicMode && ["Diablo", "Baal"].includes(script)) {
              say("nextup " + script);
            }

            if (global[script]()) {
              let gain = Math.max(me.getStat(sdk.stats.Experience) - exp, 0);
              let duration = Time.elapsed(tick);
              console.log(
                "ÿc7" + script + " :: ÿc0Complete\n"
                + "ÿc2 Statistics:\n"
                + "ÿc7 - Duration: ÿc0" + (Time.format(duration)) + "\n"
                + "ÿc7 - Experience Gained: ÿc0" + gain + "\n"
                + "ÿc7 - Exp/minute: ÿc0" + (gain / (duration / 60000)).toFixed(2)
              );
              this.doneScripts.add(script);
            }
          }
        } catch (error) {
          if (!(error instanceof ScriptError)) {
            Misc.errorReport(error, script);
          }
        } finally {
          // Dont run for last script as that will clear everything anyway
          if (this.scriptIndex < this.scriptList.length) {
            // remove script function from global scope, so it can be cleared by GC
            delete global[script];
          }
          
          if (reconfiguration) {
            console.log("ÿc2Reverting back unmodified config properties.");
            this.copy(unmodifiedConfig, Config);
          }
        }
      }
    }
  },

  tempList: [],

  runScript: function (script, configOverride) {
    let reconfiguration, unmodifiedConfig = {};
    let failed = false;
    let mainScript = this.scriptName();
    
    function buildScriptMsg () {
      let str = "ÿc9" + mainScript + " ÿc0:: ";

      if (Loader.tempList.length && Loader.tempList[0] !== mainScript) {
        Loader.tempList.forEach(s => str += "ÿc9" + s + " ÿc0:: ");
      }
      
      return str;
    }

    this.copy(Config, unmodifiedConfig);

    if (!include("scripts/" + script + ".js")) {
      Misc.errorReport("Failed to include script: " + script);

      return false;
    }

    if (isIncluded("scripts/" + script + ".js")) {
      try {
        if (typeof (global[script]) !== "function") {
          throw new Error("Invalid script function name");
        }

        if (this.skipTown.includes(script) || Town.goToTown()) {
          let mainScriptStr = (mainScript !== script ? buildScriptMsg() : "");
          this.tempList.push(script);
          console.log(mainScriptStr + "ÿc2Starting script: ÿc9" + script);
          Messaging.sendToScript("threads/toolsthread.js", JSON.stringify({ currScript: script }));

          reconfiguration = typeof Scripts[script] === "object";

          if (reconfiguration) {
            console.log("ÿc2Copying Config properties from " + script + " object.");
            this.copy(Scripts[script], Config);
          }

          if (typeof configOverride === "function") {
            reconfiguration = true;
            configOverride();
          } else if (typeof configOverride === "object") {
            reconfiguration = true;
            this.copy(configOverride, Config);
          }

          let tick = getTickCount();
          let exp = me.getStat(sdk.stats.Experience);

          if (global[script]()) {
            console.log(
              mainScriptStr + "ÿc7" + script
              + " :: ÿc0Complete ÿc0- ÿc7Duration: ÿc0" + (Time.format(getTickCount() - tick))
            );
            let gain = Math.max(me.getStat(sdk.stats.Experience) - exp, 0);
            let duration = Time.elapsed(tick);
            console.log(
              mainScriptStr + "ÿc7" + script + " :: ÿc0Complete\n"
              + "ÿc2 Statistics:\n"
              + "ÿc7 - Duration: ÿc0" + (Time.format(duration)) + "\n"
              + "ÿc7 - Experience Gained: ÿc0" + gain + "\n"
              + "ÿc7 - Exp/minute: ÿc0" + (gain / (duration / 60000)).toFixed(2)
            );
            this.doneScripts.add(script);
          }
        }
      } catch (error) {
        if (!(error instanceof ScriptError)) {
          Misc.errorReport(error, script);
        }
        failed = true;
      } finally {
        // Dont run for last script as that will clear everything anyway
        if (this.scriptIndex < this.scriptList.length) {
          // remove script function from global scope, so it can be cleared by GC
          delete global[script];
        } else if (this.tempList.length) {
          delete global[script];
        }

        this.tempList.pop();
        
        if (reconfiguration) {
          console.log("ÿc2Reverting back unmodified config properties.");
          this.copy(unmodifiedConfig, Config);
        }
      }
    }

    return !failed;
  },

  /**
   * Get script name by index
   * @param {number} [offset] 
   * @returns {string}
   */
  scriptName: function (offset = 0) {
    let index = this.scriptIndex + offset;

    if (index >= 0 && index < this.scriptList.length) {
      return this.scriptList[index];
    }

    return "";
  }
};
