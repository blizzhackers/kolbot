/**
 *  @filename    TextHooks.js
 *  @author      theBGuy
 *  @desc        Text hooks for MapThread
 *
 */

/** @type {TextHooks} */
const TextHooks = (function () {
  const Events = new (require("../../modules/AsyncEvents"));
  const HookFactory = require("../modules/HookFactory");

  const Y_POS_MODIFIER = 16
    * (Number(!!me.diff)
      + Number(!!me.gamepassword)
      + Number(!!me.gametype)
      + Number(!!me.gamename)
      + Number(!!me.gameserverip && !me.realm));
  const IP = (me.gameserverip.length > 0 ? me.gameserverip.split(".")[3] : "");
  const Y_LOC_MAP_SCALE = { 1: 40, 2: 30, 3: 20, 4: 10, 6: -10, 9: -40 };

  /** @typedef {import("./TextHooks").HookEntry} HookEntry */
  /** @typedef {import("../libs/Hooks")} HooksModule */

  /**
   * @param {number} click 
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  const onClick = function (click, x, y) {
    /**
     * @param {HookEntry} h1 
     * @param {HookEntry} h2 
     */
    const sortHooks = function (h1, h2) {
      return Math.abs(h1.hook.y - y) - Math.abs(h2.hook.y - y);
    };

    if (click === 0) {
      const actionHooks = TextHooks.statusHooks.filter(function ({ hook }) {
        return typeof hook.click === "function";
      }).sort(sortHooks);

      if (!actionHooks.length) {
        console.log("No action hooks found.", actionHooks);
        return false;
      }

      if (actionHooks[0].name === "hideSettings" || actionHooks[0].name === "showSettings") {
        TextHooks.displaySettings = !TextHooks.displaySettings;

        return true;
      }
    }

    return false;
  };

  const getScale = function (hkLen) {
    if (!!Y_LOC_MAP_SCALE[hkLen]) {
      TextHooks.frameYSizeScale = -1 * Y_LOC_MAP_SCALE[hkLen];
      TextHooks.frameYLocScale = Y_LOC_MAP_SCALE[hkLen];
    } else {
      TextHooks.frameYSizeScale = 0;
      TextHooks.frameYLocScale = 0;
    }

    TextHooks.settingsModifer = Math.max(0, hkLen - 3);
  };

  /** @param {HookEntry[]} hooks */
  const clearHooks = (hooks) => {
    while (hooks.length) {
      hooks.pop().hook.remove();
    }
  };

  const timer = function () {
    return " (" + new Date(getTickCount() - me.gamestarttime).toISOString().slice(11, -5) + ")";
  };

  const textHooks = {
    /** @returns {HookEntry} */
    credits: function () {
      return HookFactory.createHooks.text({
        name: "credits",
        text: "MM by theBGuy",
        x: 0,
        y: 600 + Hooks.resfix.y,
      });
    },
    /** @returns {HookEntry} */
    title: function () {
      return HookFactory.createHooks.text({
        name: "title",
        text: ":: Running Map-Mode, enter .help in chat to see more commands ::",
        x: 0,
        y: 13,
      });
    },
    /** @returns {HookEntry} */
    ping: function () {
      return HookFactory.createHooks.text({
        name: "ping",
        text: "Ping: " + me.ping,
        x: 785 + Hooks.resfix.x,
        y: 56 + Y_POS_MODIFIER,
        color: 4,
        font: 1,
        align: 1,
      });
    },
    /** @returns {HookEntry} */
    time: function () {
      return HookFactory.createHooks.text({
        name: "time",
        text: timer(),
        x: 785 + Hooks.resfix.x,
        y: 72 + Y_POS_MODIFIER,
        color: 4,
        font: 1,
        align: 1,
      });
    },
    /** @returns {HookEntry} */
    ip: function () {
      const hook = HookFactory.createHooks.text({
        name: "ip",
        text: "IP: " + IP,
        x: 785 + Hooks.resfix.x,
        y: 88 + Y_POS_MODIFIER,
        color: 4,
        font: 1,
        align: 1,
      });
      hook.hook.zorder = 0;
      return hook;
    },
    /** @returns {HookEntry} */
    key5: function () {
      return HookFactory.createHooks.text({
        name: "key5",
        text: "Key 5: " + (me.inTown ? "Heal" : "Make Portal"),
        x: Hooks.qolBoard.x + 5 + Hooks.resfix.x,
        y: 545 - TextHooks.qolHooks.length * 10 + Hooks.resfix.y,
      });
    },
    /** @returns {HookEntry} */
    key6: function () {
      return HookFactory.createHooks.text({
        name: "key6",
        text: "Key 6: " + (me.inTown ? "Open Stash" : "Go To Town"),
        x: Hooks.qolBoard.x + 5 + Hooks.resfix.x,
        y: 545 - TextHooks.qolHooks.length * 10 + Hooks.resfix.y,
      });
    },
    /** @returns {(HookEntry & { dest: number, type: string })|null} */
    nextAct: function () {
      if (me.inTown && me.accessToAct(me.act + 1)) {
        return Object.assign({
          dest: me.act + 1,
          type: "actChange",
        }, HookFactory.createHooks.text({
          name: "Next Act",
          text: "Shift > : Next Act",
          x: Hooks.qolBoard.x + 5 + Hooks.resfix.x,
          y: 545 - TextHooks.qolHooks.length * 10 + Hooks.resfix.y,
        }));
      }
      return null;
    },
    /** @returns {(HookEntry & { dest: number, type: string })|null} */
    previousAct: function () {
      if (me.inTown && me.act > 1) {
        return Object.assign({
          dest: me.act - 1,
          type: "actChange",
        }, HookFactory.createHooks.text({
          name: "Previous Act",
          text: "Shift < : Previous Act",
          x: Hooks.qolBoard.x + 5 + Hooks.resfix.x,
          y: 545 - TextHooks.qolHooks.length * 10 + Hooks.resfix.y,
        }));
      }
      return null;
    },
    /** @returns {HookEntry} */
    pickitStatus: function () {
      return HookFactory.createHooks.text({
        name: "pickitStatus",
        text: "ÿc4N-Pad - ÿc0: " + (ItemHooks.pickitEnabled ? "ÿc<Your Filter" : "ÿc1Default Filter"),
        x: 10,
        y: 503 - TextHooks.settingsModifer * 10 - TextHooks.statusHooks.length * 11 + Hooks.resfix.y,
      });
    },
    /** @returns {HookEntry} */
    itemStatus: function () {
      return HookFactory.createHooks.text({
        name: "itemStatus",
        text: "ÿc4Key 7ÿc0: " + (ItemHooks.enabled ? "Disable" : "Enable") + " Item Filter",
        x: 10,
        y: 503 - TextHooks.settingsModifer * 10 - TextHooks.statusHooks.length * 11 + Hooks.resfix.y,
      });
    },
    /** @returns {HookEntry} */
    monsterStatus: function () {
      return HookFactory.createHooks.text({
        name: "monsterStatus",
        text: "ÿc4Key 8ÿc0: " + (MonsterHooks.enabled ? "Disable" : "Enable") + " Monsters",
        x: 10,
        y: 503 - TextHooks.settingsModifer * 10 - TextHooks.statusHooks.length * 11 + Hooks.resfix.y,
      });
    },
    /** @returns {HookEntry} */
    vectorStatus: function () {
      return HookFactory.createHooks.text({
        name: "vectorStatus",
        text: "ÿc4Key 9ÿc0: " + (VectorHooks.enabled ? "Disable" : "Enable") + " Vectors",
        x: 10,
        y: 503 - TextHooks.settingsModifer * 10 - TextHooks.statusHooks.length * 11 + Hooks.resfix.y,
      });
    },
  };

  const statusHookNames = ["pickitStatus", "vectorStatus", "monsterStatus", "itemStatus"];
  const qols = ["previousAct", "nextAct", "key6", "key5"];
  const specialCases = {
    /**
     * Rebuilds the dashboard container hooks (box + frame) at the current scale.
     */
    dashboard: function () {
      clearHooks(TextHooks.dashBoard);
      
      const containers = HookFactory.createContainer(
        "dashboard", "dashboardframe",
        Hooks.dashBoard.x,
        Hooks.dashBoard.y + Hooks.resfix.y + TextHooks.frameYLocScale,
        225,
        60 + TextHooks.frameYSizeScale
      );
      
      containers.forEach(function (container) {
        TextHooks.dashBoard.push(container);
      });
    },
    
    /**
     * Rebuilds the quality-of-life hook list and its container, sized to how many hooks fit.
     */
    qolBoard: function () {
      clearHooks(TextHooks.qolHooks);
      
      TextHooks.qolFrameYSize = 50;
      TextHooks.lastAct = me.act;

      qols.forEach(function (hook) {
        TextHooks.add(hook, TextHooks.qolHooks) && (TextHooks.qolFrameYSize -= 10);
      });
      
      const containers = HookFactory.createContainer(
        "qolBoard", "qolFrame",
        Hooks.qolBoard.x + Hooks.resfix.x,
        Hooks.qolBoard.y + TextHooks.qolFrameYSize + Hooks.resfix.y,
        140,
        60 + -1 * TextHooks.qolFrameYSize
      );
      
      containers.forEach(function (container) {
        TextHooks.qolHooks.push(container);
      });
    },
    
    /**
     * Rebuilds the status hooks with the full settings box and a "Hide Settings" toggle.
     */
    showSettings: function () {
      clearHooks(TextHooks.statusHooks);
      
      TextHooks.statusFrameYSize = 0;

      statusHookNames.forEach(function (hook) {
        TextHooks.add(hook, TextHooks.statusHooks);
        TextHooks.statusFrameYSize += 13;
      });

      const containers = HookFactory.createContainer(
        "statusBox", "statusFrame",
        5,
        503 - TextHooks.settingsModifer * 10 - statusHookNames.length * 12 + Hooks.resfix.y,
        170,
        TextHooks.statusFrameYSize,
        4
      );

      containers.forEach(function (container) {
        TextHooks.statusHooks.push(container);
      });

      TextHooks.statusHooks.push(HookFactory.createHooks.text({
        name: "showSettings",
        text: "ÿc1Hide Settings",
        x: 0,
        y: 590 + Hooks.resfix.y,
        color: 4,
        font: 0,
        align: 0,
        automap: false,
        handler: onClick
      }));
    },

    /**
     * Clears the status hooks and replaces them with a single "Show Settings" toggle.
     */
    hideSettings: function () {
      clearHooks(TextHooks.statusHooks);

      TextHooks.statusHooks.push(HookFactory.createHooks.text({
        name: "hideSettings",
        text: "ÿc<Show Settings",
        x: 0,
        y: 590 + Hooks.resfix.y,
        color: 4,
        font: 0,
        align: 0,
        automap: false,
        handler: onClick
      }));
    }
  };

  Events.on("areachange", function () {
    console.log("Area change detected, clearing hooks.");
    
    clearHooks(TextHooks.dashBoard);
    clearHooks(TextHooks.qolHooks);
    
    getScale(ActionHooks.hooks.length);
    TextHooks.add("dashboard", TextHooks.dashBoard);
    TextHooks.add("qolBoard", TextHooks.qolHooks);

    if (TextHooks.displaySettings) {
      clearHooks(TextHooks.statusHooks);
      TextHooks.add("showSettings", TextHooks.statusHooks);
    }
  });
  
  return {
    events: Events,
    enabled: true,
    displayTitle: true,
    displaySettings: true,
    frameworkDisplayed: false,
    frameYSizeScale: 0,
    frameYLocScale: 0,
    settingsModifer: 0,
    dashBoardWidthScale: 0,
    statusFrameYSize: 0,
    qolFrameYSize: 0,
    /** @type {HookEntry[]} */
    statusHooks: [],
    /** @type {HookEntry[]} */
    dashBoard: [],
    /** @type {HookEntry[]} */
    qolHooks: [],
    /** @type {HookEntry[]} */
    hooks: [],

    /**
     * Adds/refreshes the framework, settings and title hooks and updates the ping/time text.
     */
    check: function () {
      if (!TextHooks.enabled) {
        TextHooks.flush();

        return;
      }

      if (!TextHooks.frameworkDisplayed) {
        TextHooks.add("credits", TextHooks.hooks);
        !!IP && TextHooks.add("ip", TextHooks.hooks);
        TextHooks.frameworkDisplayed = true;
      }

      TextHooks.displaySettings
        ? TextHooks.add("showSettings", TextHooks.statusHooks)
        : TextHooks.add("hideSettings", TextHooks.statusHooks);
      if (TextHooks.displayTitle) {
        TextHooks.add("title", TextHooks.hooks);
      }
      TextHooks.updateHook("ping", TextHooks.hooks, "Ping: " + me.ping);
      TextHooks.updateHook("time", TextHooks.hooks, timer());
    },

    /**
     * @param {string} name 
     * @param {HookEntry[]} hookArr 
     * @param {string} text 
     */
    updateHook: function (name = "", hookArr = [], text = "") {
      const entry = TextHooks.getHook(name, hookArr);
      
      if (entry && text) {
        entry.hook.text = text;
      } else {
        TextHooks.add(name, hookArr);
      }
    },

    /**
     * @param {string} name 
     * @param {HookEntry[]} hookArr 
     * @returns {boolean}
     */
    add: function (name, hookArr = []) {
      const orginalLen = hookArr.length;
      
      if (!name || !hookArr || TextHooks.getHook(name, hookArr)) {
        return false;
      }
      
      if (textHooks[name]) {
        let hook = textHooks[name]();
        if (hook) {
          hookArr.push(hook);
        }
      } else if (specialCases[name]) {
        specialCases[name]();
      }

      return hookArr.length > orginalLen;
    },
    
    /**
     * @param {string} name 
     * @param {HookEntry[]} hookArr 
     * @returns {HookEntry|boolean}
     */
    getHook: function (name, hookArr = []) {
      for (let i = 0; i < hookArr.length; i++) {
        if (hookArr[i].name === name) {
          return hookArr[i];
        }
      }

      return false;
    },

    /**
     * Removes the status/dashboard/qol hooks; also clears the framework hooks if Hooks is disabled.
     */
    flush: function () {
      if (!Hooks.enabled) {
        clearHooks(this.hooks);
        TextHooks.frameworkDisplayed = false;
      }

      clearHooks(this.statusHooks);
      clearHooks(this.dashBoard);
      clearHooks(this.qolHooks);
    },
  };
})();
