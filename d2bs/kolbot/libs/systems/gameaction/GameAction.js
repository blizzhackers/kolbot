/* eslint-disable dot-notation */
/**
*  @filename    GameAction.js
*  @author      noah-@github.com
*  @desc        Perform task based actions specified by Profile Tag
*
*/
include("systems/mulelogger/MuleLogger.js");

/** @type {import("./GameAction").GameActionType} */
const GameAction = {
  task: null,
  
  /**
   * @param {string} task - JSON string containing task information
   * @returns {boolean}
   */
  init: function (task) {
    try {
      GameAction.task = JSON.parse(task);
      const { action } = GameAction.task;
      console.log("ÿc4GameActionÿc0: Task: " + action);
      
      if (this.task["data"] && typeof this.task.data === "string") {
        this.task.data = JSON.parse(this.task.data);
      }

      if (this.task.action === "doDrop" && this.task.data && Array.isArray(this.task.data.items)) {
        /** @type {GameActionData} */
        let data = (this.task.data);
        for (let i = 0; i < data.items.length; i += 1) {
          console.log("ÿc4GameActionÿc0: Item: " + data.items[i].title);
        }
      }

      MuleLogger.LogNames = this.LogNames;
      MuleLogger.LogItemLevel = this.LogItemLevel;
      MuleLogger.LogEquipped = this.LogEquipped;
      MuleLogger.LogMerc = this.LogMerc;
      MuleLogger.SaveScreenShot = this.SaveScreenShot;

      return true;
    } catch (err) {
      console.log("ÿc4GameActionÿc0: Error in init: " + err);
      this.update("done", "Error in init: " + err);
      D2Bot.stop();
      
      return false;
    }
  },

  /**
   * @param {string} action 
   * @param {string | Object} data 
   */
  update: function (action, data) {
    if (typeof action !== "string") throw new Error("Action must be a string!");
    
    typeof data !== "string" && (data = JSON.stringify(data));

    D2Bot.printToConsole(data);

    let tag = (function () {
      try {
        return JSON.parse(JSON.stringify(GameAction.task)); // deep copy
      } catch (err) {
        console.log("ÿc4GameActionÿc0: Error in update: " + err);
        return {};
      }
    })();
    tag.action = action;
    tag.data = data;
    D2Bot.setTag(tag);
  },

  gameInfo: function () {
    let gi = { gameName: null, gamePass: null };

    switch (this.task.action) {
    case "doMule":
      gi = null;

      break; // create random game
    case "doDrop":
      gi.gameName = this.task.data.gameName;
      gi.gamePass = this.task.data.gamePass;

      break; // join game
    default:
      gi = null;

      break;
    }

    return gi;
  },

  getLogin: function () {
    let li = { realm: null, account: null, password: null };

    (this.task && this.task.data) && (li.password = this.load(this.task.hash));

    if (this.task && this.task.data) {
      // drop specific object
      if (this.task.data["items"] && this.task.data.items.length > 0) {
        li.realm = this.task.data.items[0].realm;
        li.account = this.task.data.items[0].account;
      }

      // mule log specific objects
      this.task.data["realm"] && (li.realm = this.task.data.realm);
      this.task.data["account"] && (li.account = this.task.data.account);
    }

    if (!li.password || !li.account || !li.realm) {
      this.update("done", "Realm, Account, or Password was invalid!");
      D2Bot.stop();
      delay(500);
    }

    return li;
  },

  getCharacters: function () {
    let chars = [];

    if (this.task && this.task.data) {
      // drop specific object
      if (this.task.data["items"]) {
        for (let i = 0; i < this.task.data.items.length; i += 1) {
          if (chars.indexOf(this.task.data.items[i].character) === -1) {
            chars.push(this.task.data.items[i].character);
          }
        }
      }

      // mule log specific object
      this.task.data["chars"] && (chars = this.task.data.chars);
    }

    return chars;
  },

  inGameCheck: function () {
    if (!getScript("D2BotGameAction.dbj")) {
      return false;
    }
    
    while (!this["task"]) {
      D2Bot.getProfile();
      delay(500);
    }

    switch (this.task.action) {
    case "doMule":
      MuleLogger.logChar();

      break;
    case "doDrop":
      this.dropItems(this.task.data.items);
      MuleLogger.logChar();

      break;
    default:
      break;
    }

    while ((getTickCount() - me.gamestarttime) < this.IngameTime * 1000) {
      const elapsedMs = getTickCount() - me.gamestarttime;
      const totalMs = this.IngameTime * 1000;
      const remainingSeconds = Math.round((totalMs - elapsedMs) / 1000);
  
      me.overhead("Stalling for " + remainingSeconds + " Seconds");
      delay(1000);
    }

    try {
      quit();
    } finally {
      while (me.ingame) {
        delay(100);
      }
    }

    return true;
  },

  load: function (hash) {
    let filename = "data/secure/" + hash + ".txt";

    if (!FileTools.exists(filename)) {
      this.update("done", "File " + filename + " does not exist!");
      D2Bot.stop();
      delay(5000);
      quitGame(); // pretty sure quitGame crashes?
    }

    return FileTools.readText(filename);
  },

  save: function (hash, data) {
    let filename = "data/secure/" + hash + ".txt";
    FileTools.writeText(filename, data);
  },

  dropItems: function (droplist) {
    if (!droplist) return;

    while (!me.gameReady) {
      delay(100);
    }

    let items = me.getItemsEx();

    if (!items || !items.length) return;

    for (let i = 0; i < droplist.length; i += 1) {
      if (droplist[i].character !== me.charname) {
        continue;
      }

      //unit.gid ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y;
      let info = droplist[i].itemid.split(":");

      let classid = info[1];
      let loc = info[2];
      let unitX = info[3];
      let unitY = info[4];

      // for debug purposes
      console.log("classid: " + classid + " location: " + loc + " X: " + unitX + " Y: " + unitY);

      for (let j = 0; j < items.length; j += 1) {
        if (items[j].classid.toString() === classid
          && items[j].location.toString() === loc
          && items[j].x.toString() === unitX
          && items[j].y.toString() === unitY) {
          items[j].drop();
        }
      }
    }
  },

  convertLadderFiles: function () {
    console.log("ÿc4GameActionÿc0: Converting ladder files to non-ladder...");
    if (!this.task || !this.task.data || this.task.action !== "doConvertNL") {
      return;
    }

    /** @type {{ realm: string, account: string, character: string}[]} */
    const data = this.task.data;
    let converted = 0;

    if (!data || !Array.isArray(data)) {
      this.update("done", "Invalid data for conversion!");
      D2Bot.stop();
      delay(5000);
    }

    for (let i = 0; i < data.length; i++) {
      const { realm, account, character } = data[i];

      if (!realm || !account || !character) {
        continue;
      }

      const fileName = "mules/" + realm + "/" + account + "/" + character + ".txt";
      if (!FileTools.exists(fileName)) {
        continue;
      }

      const fileContent = FileTools.readText(fileName);
      if (!fileContent) {
        continue;
      }
      const [charName, ext] = character.split(".");
      const newFileName = "mules/" + realm + "/" + account + "/" + charName + "." + ext.replace("l", "n") + ".txt";
      FileTools.writeText(newFileName, fileContent);
      FileTools.remove(fileName);
      console.log("Converted " + fileName + " to " + newFileName);
      converted++;
    }

    this.update("done", "Conversion complete! Converted " + converted + " files.");
    D2Bot.stop(me.profile, true);
  },
};

// load configuration file and apply settings to GameAction, has to be after the namespace is created
(function () {
  Object.assign(GameAction, require("./GameActionConfig", null, false));
})();
