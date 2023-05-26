/* eslint-disable dot-notation */
/**
*  @filename    GameAction.js
*  @author      noah-@github.com
*  @desc        Perform task based actions specified by Profile Tag
*
*/
include("systems/mulelogger/MuleLogger.js");

const GameAction = {
  // keeping with the general structure changes this section should probably be in its own config file
  // but its not a lot so does it really need to be?
  LogNames: true, // Put account/character name on the picture
  LogItemLevel: true, // Add item level to the picture
  LogEquipped: false, // include equipped items
  LogMerc: false, // include items merc has equipped (if alive)
  SaveScreenShot: false, // Save pictures in jpg format (saved in 'Images' folder)
  IngameTime: 60, // Time to wait before leaving game

  task: null,
  // don't edit
  init: function (task) {
    GameAction.task = JSON.parse(task);

    if (this.task["data"] && typeof this.task.data === "string") {
      this.task.data = JSON.parse(this.task.data);
    }

    MuleLogger.LogNames = this.LogNames;
    MuleLogger.LogItemLevel = this.LogItemLevel;
    MuleLogger.LogEquipped = this.LogEquipped;
    MuleLogger.LogMerc = this.LogMerc;
    MuleLogger.SaveScreenShot = this.SaveScreenShot;

    return true;
  },

  update: function (action, data) {
    if (typeof action !== "string") throw new Error("Action must be a string!");
    
    typeof data !== "string" && (data = JSON.stringify(data));

    D2Bot.printToConsole(data);

    let tag = JSON.parse(JSON.stringify(this.task)); // deep copy
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

    // drop specific object
    if (this.task.data["items"] && this.task.data.items.length > 0) {
      li.realm = this.task.data.items[0].realm;
      li.account = this.task.data.items[0].account;
    }

    // mule log specific objects
    this.task.data["realm"] && (li.realm = this.task.data.realm);
    this.task.data["account"] && (li.account = this.task.data.account);

    if (!li.password || !li.account || !li.realm) {
      this.update("done", "Realm, Account, or Password was invalid!");
      D2Bot.stop();
      delay(500);
    }

    return li;
  },

  getCharacters: function () {
    let chars = [];

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

    return chars;
  },

  inGameCheck: function () {
    if (getScript("D2BotGameAction.dbj")) {
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
    }

    return false;
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

      let info = droplist[i].itemid.split(":"); //":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y;

      let classid = info[1];
      let loc = info[2];
      let unitX = info[3];
      let unitY = info[4];

      // for debug purposes
      print("classid: " + classid + " location: " + loc + " X: " + unitX + " Y: " + unitY);

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
};
