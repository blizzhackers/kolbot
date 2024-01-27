/* eslint-disable max-len */
/**
*  @filename    HelpMenu.js
*  @author      theBGuy
*  @desc        Help Menu for MapThread
*
*/

const HelpMenu = new function () {
  this.hooks = [];
  this.box = [];
  this.cleared = true;
  this.helpBoxX = 715 + (me.screensize ? 0 : -160);
  this.helpBoxY = 88 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm));
  this.helpBoxTextX = 647 + (me.screensize ? 0 : -160);
  this.helpBoxTextY = 88 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm)) + 15;
  this.action = [];
  this.actionY = -1;
  this.tick = 0;
  this.chatCommands = {
    "me": "Displays Character level, Area, and x/y coordinates",
    "pick": "Pick items from the ground to inventory",
    "hide": "Hide this menu",
    "make": "create config file with current characters name",
    "stash": "Stash items/gold from inventory",
    "gamble": "Start gambling",
    "filltps": "Fill tp tome",
    "cowportal": "Make cow portal as long as bot already has leg",
    "uberportal": "Make uber portal(s) as long as bot already has key",
    "ubertrist": "Make uber tristam portal as long as bot already has organs",
    "useraddon": "Toggles useraddon mode",
    "Ctrl": "Hover over an item then press Ctrl to move that item from one area to the next. In example: Stash to Inventory, Cube to Inventory, Inventory to TradeScreen, or Inventory to Shop (sellItem)",
    "drop": {
      "invo": "Drop all items in the inventory",
      "stash": "Drop all items in the stash excluding the cube"
    },
    "stack": {
      "antidote": "Buy and Stack 10 antidote potions for 5 minutes of boosted poison resistance",
      "thawing": "Buy and Stack 10 thawing potions for 5 minutes of boosted cold resistance",
      "stamina": "Buy and Stack 10 stamina potions for 5 minutes of boosted stamina",
    },
    "Num": {
      "9:": "Stops current pathing action",
    },
  };

  this.hookHandler = function (click, x, y) {
    // Left click
    if (click === 0) {
      // give a small timeout between clicks
      if (getTickCount() - HelpMenu.tick > 1000) {
        HelpMenu.action.push([x, y]);
      }
      // Block click
      return true;
    }

    return false;
  };

  this.addHook = function (text) {
    this.hooks.push(new Text("ÿc4." + text, this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false, this.hookHandler));
  };

  this.showMenu = function () {
    this.cleared = false;

    let chatCommands = [
      "me",
      "pick",
      "hide",
      "make",
      "stash",
      "gamble",
      "filltps",
      "cowportal",
      "uberportal",
      "ubertrist",
      "useraddon",
      "drop invo",
      "drop stash",
      "stack antidote",
      "stack thawing",
      "stack stamina",
    ];

    this.hooks.push(new Text("ÿc2Chat Commands:", this.helpBoxTextX, this.helpBoxTextY, 0, 0, 0));

    for (let i = 0; i < chatCommands.length; i++) {
      this.addHook(chatCommands[i]);
    }

    this.hooks.push(new Text("ÿc2Key Commands:", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0));
    this.hooks.push(new Text("ÿc4 Ctrl : ÿc0Move Item", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false, this.hookHandler));
    this.hooks.push(new Text("ÿc4 Pause : ÿc1Pause Map", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));
    this.hooks.push(new Text("ÿc4 Delete: ÿc1Quick Exit", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));
    this.hooks.push(new Text("ÿc4 End : ÿc1Stop Profile", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));
    this.hooks.push(new Text("ÿc4 Num 9: ÿc1Stop Action", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false, this.hookHandler));
    this.hooks.push(new Text("ÿc4 Num / : ÿc1Reload", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));
    this.hooks.push(new Text("ÿc4 Num + : ÿc0Show Stats", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));
    this.hooks.push(new Text("ÿc4 Num * : ÿc0Precast", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));
    this.hooks.push(new Text("ÿc4 Num . : ÿc0Log Character", this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false));

    this.box.push(new Box(this.helpBoxX, this.helpBoxY, 150, 8 + (this.hooks.length * 13), 0x0, 1, 2));
    this.box.push(new Frame(this.helpBoxX, this.helpBoxY, 150, 8 + (this.hooks.length * 13), 2));
    this.box[this.box.length - 2].zorder = 0;
  };

  this.hideMenu = function () {
    this.cleared = true;

    while (this.hooks.length > 0) {
      this.hooks.shift().remove();
    }

    while (this.box.length > 0) {
      this.box.shift().remove();
    }

    return;
  };

  this.sortHooks = function (h1, h2) {
    return Math.abs(h1.y - HelpMenu.actionY) - Math.abs(h2.y - HelpMenu.actionY);
  };
};

let Worker = require("../../modules/Worker");

Worker.runInBackground.helpAction = function () {
  while (HelpMenu.action.length > 0) {
    HelpMenu.tick = getTickCount();
    HelpMenu.actionY = HelpMenu.action.shift()[1];
    // Sort hooks
    HelpMenu.hooks.sort(HelpMenu.sortHooks);

    let cmd = HelpMenu.hooks[0].text.split(" ")[0].split(".")[1];
    let msgList = HelpMenu.hooks[0].text.split(" ");

    if (!HelpMenu.hooks[0].text.includes(".")) {
      cmd = HelpMenu.hooks[0].text.split(" ")[1];
    }

    try {
      let str = "";

      if (msgList.length === 2 && typeof HelpMenu.chatCommands[cmd] === "object") {
        str = HelpMenu.chatCommands[cmd][msgList[1]];
      } else if (msgList.length > 2 && typeof HelpMenu.chatCommands[cmd] === "object") {
        str = HelpMenu.chatCommands[cmd][msgList[2]];
      } else {
        str = HelpMenu.chatCommands[cmd];
      }

      !!str && me.overhead(str);
    } catch (e) {
      console.error(e);
      me.overhead(cmd);
    }

    delay(150);
  }

  return true;
};
