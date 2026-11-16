/**
 * @filename    HelpMenu.js
 * @author      theBGuy
 * @desc        UMD module Help Menu for MapThread
 * 
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.HelpMenu = factory();
  }
}([].filter.constructor("return this")(), function() {
  const Worker = require("../../modules/Worker");
  const POSITION_MODIFIER = (
    Number(!!me.diff)
    + Number(!!me.gamepassword)
    + Number(!!me.gametype)
    + Number(!!me.gamename)
    + Number(!!me.gameserverip && !me.realm)
  );

  const HelpMenu = {
    /** @type {Text[]} */
    hooks: [],
    /** @type {(Box | Frame)[]} */
    box: [],
    cleared: true,
    helpBoxX: 715 + (me.screensize ? 0 : -160),
    helpBoxY: 78 + 16 * POSITION_MODIFIER,
    helpBoxTextX: 647 + (me.screensize ? 0 : -160),
    helpBoxTextY: 78 + 16 * POSITION_MODIFIER + 15,
    action: [],
    actionY: -1,
    tick: 0,
    chatCommands: {
      "me": "Displays Character level, Area, and x/y coordinates",
      "pick [n]": "Pick items from the ground to inventory within n range (default: 40)",
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
        "antidote [n]": "Buy and stack n antidote potions (default: 10) for 5 minutes of boosted poison resistance",
        "thawing [n]": "Buy and stack n thawing potions (default: 10) for 5 minutes of boosted cold resistance",
        "stamina [n]": "Buy and stack n stamina potions (default: 10) for 5 minutes of boosted stamina",
      },
      // "Num": {
      //   "9:": "Stops current pathing action",
      // },
    },

    /**
     * @param {number} click 
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    hookHandler: function (click, x, y) {
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
    },

    /** @param {string} text */
    addHook: function (text) {
      this.hooks.push(new Text("ÿc4." + text, this.helpBoxTextX, this.helpBoxTextY + 13 * this.hooks.length, 0, 0, 0, false, this.hookHandler));
    },

    /**
     * Builds and draws the chat/key-command help box (hooks + boxes) at the configured screen position.
     * @returns {void}
     */
    showMenu: function () {
      this.cleared = false;
      
      this.hooks.push(new Text("ÿc2Chat Commands:", this.helpBoxTextX, this.helpBoxTextY, 0, 0, 0));
      this.hooks[this.hooks.length - 1].zorder = 2;

      const addCommands = (commands, prefix = "") => {
        const cmdKeys = Object.keys(commands);
        
        for (let i = 0; i < cmdKeys.length; i++) {
          const key = cmdKeys[i];
          
          if (typeof commands[key] === "object") {
            this.addHook(prefix + key);
            
            const subPrefix = prefix + key + " ";
            Object.keys(commands[key]).forEach(subKey => {
              this.addHook("  " + subPrefix + subKey);
            });
          } else {
            this.addHook(prefix + key);
          }
        }
      };
      
      addCommands(this.chatCommands);

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

      this.box.push(new Box(this.helpBoxX, this.helpBoxY, 150, 18, 0x0, 4, 2));
      this.box[this.box.length - 1].zorder = 1;
      this.box.push(new Box(this.helpBoxX, this.helpBoxY, 150, 8 + (this.hooks.length * 13), 0x0, 1, 2));
      this.box.push(new Frame(this.helpBoxX, this.helpBoxY, 150, 8 + (this.hooks.length * 13), 2));
      this.box[this.box.length - 2].zorder = 0;
      
      this.hooks.push(new Text("ÿc1X", this.helpBoxTextX + 125, this.helpBoxTextY, 0, 0, 0, false, this.hookHandler));
      this.hooks[this.hooks.length - 1].zorder = 1;
    },

    /**
     * Removes all help-box hooks and boxes drawn by showMenu.
     * @returns {void}
     */
    hideMenu: function () {
      this.cleared = true;

      while (this.hooks.length > 0) {
        this.hooks.shift().remove();
      }

      while (this.box.length > 0) {
        this.box.shift().remove();
      }

      return;
    },

    /**
     * Comparator sorting hooks by vertical proximity to the clicked y-coordinate (HelpMenu.actionY).
     * @param {Text} h1
     * @param {Text} h2
     * @returns {number}
     */
    sortHooks: function (h1, h2) {
      return Math.abs(h1.y - HelpMenu.actionY) - Math.abs(h2.y - HelpMenu.actionY);
    }
  };

  /**
   * Drains queued menu clicks, resolving each to the nearest clickable hook and echoing its help text
   * overhead; clicking the "X" hook closes the menu.
   * @returns {boolean} true once the action queue is drained (or the menu was closed).
   */
  Worker.runInBackground.helpAction = function () {
    while (HelpMenu.action.length > 0) {
      HelpMenu.tick = getTickCount();
      HelpMenu.actionY = HelpMenu.action.shift()[1];
      const actionHooks = HelpMenu.hooks.filter(function (hook) {
        return typeof hook.click === "function";
      }).sort(HelpMenu.sortHooks);

      if (actionHooks[0].text === "ÿc1X") {
        HelpMenu.hideMenu();

        return true;
      }

      const msgList = actionHooks[0].text.split(" ").filterNull();
      let cmd = msgList[0].split(".")[1];

      if (!actionHooks[0].text.includes(".")) {
        cmd = msgList[1];
      }

      try {
        let str = "";

        if (msgList[0] === "ÿc4." && msgList.length >= 2) {
          const parentCmd = msgList[1];
          const subCmd = msgList[2];
          const subWithParam = msgList.slice(2).join(" ");
        
          if (HelpMenu.chatCommands[parentCmd]) {
            if (HelpMenu.chatCommands[parentCmd][subCmd]) {
              str = HelpMenu.chatCommands[parentCmd][subCmd];
            } else if (HelpMenu.chatCommands[parentCmd][subWithParam]) {
              str = HelpMenu.chatCommands[parentCmd][subWithParam];
            }
          }
        } else if (typeof HelpMenu.chatCommands[cmd] === "object") {
          const subCommands = Object.keys(HelpMenu.chatCommands[cmd]);
          str = "Available options: " + subCommands.join(", ");
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

  return HelpMenu;
}));
