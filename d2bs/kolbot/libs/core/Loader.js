/**
*  @filename    Loader.js
*  @author      kolton, theBGuy
*  @desc        script loader, based on mBot's Sequencer.js
*
*/

/** @typedef {function(): boolean} GlobalScript */
// TODO: preaction/postaction
/**
 * @typedef {Object} RunnableOptions
 * @property {function(): any} preAction
 * @property {function(): boolean} postAction
 * @property {function(): any} cleanup
 * @property {boolean} forceTown
 * @property {number} bossid
 * @property {number} startArea
 */

/**
 * @constructor
 * @param {function(): boolean} action
 * @param {RunnableOptions} [options]
 */
function Runnable (action, options = {}) {
  this.action = action;
  this.startArea = options.hasOwnProperty("startArea") ? options.startArea : null;
  this.preAction = options.hasOwnProperty("preAction")
    ? options.preAction
    : function chores () {
        // TODO: We need to do a dry-run of chores to actually determine if we need it or not
        if (getTickCount() - Town.lastChores > Time.minutes(1)) {
          Town.doChores();
        }
      };
  this.postAction = options.hasOwnProperty("postAction") ? options.postAction : null;
  this.cleanup = options.hasOwnProperty("cleanup") ? options.cleanup : null;
  this.forceTown = options.hasOwnProperty("forceTown") ? options.forceTown : false;
  this.bossid = options.hasOwnProperty("bossid") ? options.bossid : null;
}

const Loader = {
  /** @type {string[]} */
  fileList: [],
  /** @type {string[]} */
  scriptList: [],
  scriptIndex: -1,
  skipTown: ["Test", "Follower"],
  firstScriptAct: -1,
  /** @type {GlobalScript | Runnable | null} */
  currentScript: null,
  /** @type {Runnable | null} */
  nextScript: null,
  /** @type {Set<string>} */
  doneScripts: new Set(),

  init: function () {
    this.getScripts();
    this.loadScripts();
  },

  getScripts: function () {
    /** @type {string[]} */
    let fileList = dopen("libs/scripts/").getFiles();

    for (let i = 0; i < fileList.length; i += 1) {
      if (fileList[i].endsWith(".js")) {
        this.fileList.push(fileList[i].substring(0, fileList[i].indexOf(".js")));
      }
    }
  },

  _runCurrent: function () {
    return this.currentScript instanceof Runnable
      ? this.currentScript.action()
      : this.currentScript();
  },

  /**
   * @see http://stackoverflow.com/questions/728360/copying-an-object-in-javascript#answer-728694
   * @param {Date | Array | Object} obj 
   * @returns 
   */
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

      Loader.currentScript = global[script];

      // Preload the next script
      if (Loader.scriptIndex < Loader.scriptList.length - 1) {
        let nextScript = this.scriptList[Loader.scriptIndex + 1];
        if (include("scripts/" + nextScript + ".js")) {
          if (global[nextScript] instanceof Runnable && global[nextScript].startArea) {
            Loader.nextScript = global[nextScript];
          }
        }
      }

      if (isIncluded("scripts/" + script + ".js")) {
        try {
          if (Loader.currentScript instanceof Runnable) {
            const { startArea, bossid, preAction } = Loader.currentScript;
            
            if (startArea && Loader.scriptIndex === 0) {
              Loader.firstScriptAct = sdk.areas.actOf(startArea);
            }

            if (bossid && Attack.haveKilled(bossid)) {
              console.log("ÿc2Skipping script: ÿc9" + script + " ÿc2- Boss already killed.");
              continue;
            }

            if (preAction && typeof preAction === "function") {
              preAction();
            }

            if (startArea && me.inArea(startArea)) {
              this.skipTown.push(script);
            }
          } else if (typeof (Loader.currentScript) !== "function") {
            throw new Error(
              "Invalid script function name. "
              + "Typeof: " + typeof (Loader.currentScript)
              + " Name: " + script
            );
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

            if (Loader._runCurrent()) {
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
          } else {
            console.error(error);
          }
        } finally {
          // Dont run for last script as that will clear everything anyway
          if (this.scriptIndex < this.scriptList.length) {
            // run cleanup if applicable
            if (Loader.currentScript instanceof Runnable) {
              if (Loader.currentScript.cleanup && typeof Loader.currentScript.cleanup === "function") {
                Loader.currentScript.cleanup();
              }
            }
            // remove script function from global scope, so it can be cleared by GC
            delete global[script];
            Loader.currentScript = null;
            Loader.nextScript = null;
          }
          
          if (reconfiguration) {
            console.log("ÿc2Reverting back unmodified config properties.");
            this.copy(unmodifiedConfig, Config);
          }
        }
      }
    }

    // return to first script town
    if (Loader.firstScriptAct > -1) {
      let _act = [2, 3].includes(Loader.firstScriptAct) ? 1 : Loader.firstScriptAct;
      Town.goToTown(_act);
    }
  },

  /** @type {string[]} */
  tempList: [],

  /**
   * @param {string} script 
   * @param {Object | function(): any} configOverride 
   * @returns {boolean}
   */
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

    Loader.currentScript = global[script];

    if (isIncluded("scripts/" + script + ".js")) {
      try {
        if (Loader.currentScript instanceof Runnable) {
          const { startArea, bossid } = Loader.currentScript;

          if (startArea && me.inArea(startArea)) {
            Loader.skipTown.push(script);
          }
          
          if (bossid && Attack.haveKilled(bossid)) {
            console.log("ÿc2Skipping script: ÿc9" + script + " ÿc2- Boss already killed.");
            return true;
          }
        } else if (typeof (Loader.currentScript) !== "function") {
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

          if (Loader._runCurrent()) {
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

        // run cleanup if applicable
        if (Loader.currentScript instanceof Runnable) {
          if (Loader.currentScript.cleanup && typeof Loader.currentScript.cleanup === "function") {
            Loader.currentScript.cleanup();
          }
        }
        
        Loader.currentScript = null;
        Loader.tempList.pop();
        
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
