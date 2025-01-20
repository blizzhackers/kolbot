/* eslint-disable max-len */
/**
*  @filename    TextHooks.js
*  @author      theBGuy
*  @desc        Text hooks for MapThread
*
*/

const TextHooks = {
  enabled: true,
  lastAct: 0,
  wasInTown: true,
  displayTitle: true,
  displaySettings: true,
  frameworkDisplayed: false,
  frameYSizeScale: 0,
  frameYLocScale: 0,
  settingsModifer: 0,
  dashBoardWidthScale: 0,
  statusFrameYSize: 0,
  qolFrameYSize: 0,
  statusHookNames: ["pickitStatus", "vectorStatus", "monsterStatus", "itemStatus"],
  qols: ["previousAct", "nextAct", "key6", "key5"],
  statusHooks: [],
  dashBoard: [],
  qolHooks: [],
  hooks: [],
  yLocMapScale: { 1: 40, 2: 30, 3: 20, 4: 10, 6: -10, 9: -40 },
  modifier: 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm)),

  getScale: function (hkLen) {
    if (!!TextHooks.yLocMapScale[hkLen]) {
      TextHooks.frameYSizeScale = (-1 * this.yLocMapScale[hkLen]);
      TextHooks.frameYLocScale = this.yLocMapScale[hkLen];
    } else {
      TextHooks.frameYSizeScale = 0;
      TextHooks.frameYLocScale = 0;
    }

    TextHooks.settingsModifer = Math.max(0, hkLen - 3);
  },

  check: function () {
    if (!this.enabled) {
      this.flush();

      return;
    }

    if (!this.frameworkDisplayed) {
      !this.getHook("credits", this.hooks) && this.add("credits");
      !!me.gameserverip && !this.getHook("ip", this.hooks) && this.add("ip");
      TextHooks.lastAct = 0; // sorta hacky solution, but works this will cause qolBoard to update after being flushed from a uiflag
      TextHooks.frameworkDisplayed = true;
    }

    this.displaySettings ? !this.getHook("showSettings", this.statusHooks) && this.add("showSettings") : !this.getHook("hideSettings", this.statusHooks) && this.add("hideSettings");
    this.displayTitle && !this.getHook("title", this.hooks) && this.add("title");
    !this.getHook("ping", this.hooks) ? this.add("ping") : (this.getHook("ping", this.hooks).hook.text = "Ping: " + me.ping);
    !this.getHook("time", this.hooks) ? this.add("time") : (this.getHook("time", this.hooks).hook.text = this.timer());
  },

  update: function (hkLen = 0) {
    let updateSettingsDisplay = (this.displaySettings && this.settingsModifer < Math.max(0, hkLen - 3));

    this.getScale(hkLen);
    this.add("dashboard");
    updateSettingsDisplay && this.add("showSettings");
    (this.lastAct !== me.act || this.wasInTown !== me.inTown || !this.getHook("qolBoard", this.qolHooks)) && this.add("qolBoard");
  },

  hookHandler: function (click, x, y) {
    function sortHooks(h1, h2) {
      return Math.abs(h1.hook.y - y) - Math.abs(h2.hook.y - y);
    }
    
    if (click === 0) {
      TextHooks.statusHooks.sort(sortHooks);

      if (TextHooks.statusHooks[0].name === "hideSettings" || TextHooks.statusHooks[0].name === "showSettings") {
        TextHooks.displaySettings = !TextHooks.displaySettings;

        return true;
      }
    }

    return false;
  },

  add: function (name, hookArr = []) {
    let orginalLen = hookArr.length;
    
    switch (name) {
    case "credits":
      this.hooks.push({
        name: "credits",
        hook: new Text("MM by theBGuy", 0, 600 + Hooks.resfix.y, 4, 0, 0)
      });

      break;
    case "title":
      this.hooks.push({
        name: "title",
        hook: new Text(":: Running Map-Mode, enter .help in chat to see more commands ::", 0, 13, 4, 0, 0)
      });

      break;
    case "ping":
      this.hooks.push({
        name: "ping",
        hook: new Text("Ping: " + me.ping, 785 + Hooks.resfix.x, 56 + this.modifier, 4, 1, 1)
      });

      break;
    case "time":
      this.hooks.push({
        name: "time",
        hook: new Text(this.timer(), 785 + Hooks.resfix.x, 72 + this.modifier, 4, 1, 1)
      });

      break;
    case "ip":
      this.hooks.push({
        name: "ip",
        hook: new Text("IP: " + (me.gameserverip.length > 0 ? me.gameserverip.split(".")[3] : "0"), 785 + Hooks.resfix.x, 88 + this.modifier, 4, 1, 1)
      });

      break;
    case "dashboard":
      while (this.dashBoard.length) {
        this.dashBoard.shift().hook.remove();
      }

      this.dashBoard.push({
        name: "dashboard",
        hook: new Box(Hooks.dashBoard.x, Hooks.dashBoard.y + Hooks.resfix.y + this.frameYLocScale, 225, 60 + this.frameYSizeScale, 0x0, 1, 0)
      });

      this.dashBoard.push({
        name: "dashboardframe",
        hook: new Frame(Hooks.dashBoard.x, Hooks.dashBoard.y + Hooks.resfix.y + this.frameYLocScale, 225, 60 + this.frameYSizeScale, 0)
      });

      this.getHook("dashboard", this.dashBoard).hook.zorder = 0;

      break;
    case "key5":
      this.qolHooks.push({
        name: "key5",
        hook: new Text("Key 5: " + (me.inTown ? "Heal" : "Make Portal"), Hooks.qolBoard.x + 5 + Hooks.resfix.x, 545 - (this.qolHooks.length * 10) + Hooks.resfix.y, 4)
      });

      break;
    case "key6":
      this.qolHooks.push({
        name: "key6",
        hook: new Text("Key 6: " + (me.inTown ? "Open Stash" : "Go To Town"), Hooks.qolBoard.x + 5 + Hooks.resfix.x, 545 - (this.qolHooks.length * 10) + Hooks.resfix.y, 4)
      });

      break;
    case "nextAct":
      me.inTown && me.accessToAct(me.act + 1) && this.qolHooks.push({
        name: "Next Act",
        dest: me.act + 1,
        type: "actChange",
        hook: new Text("Shift > : Next Act", Hooks.qolBoard.x + 5 + Hooks.resfix.x, 545 - (this.qolHooks.length * 10) + Hooks.resfix.y, 4)
      });

      break;
    case "previousAct":
      me.inTown && me.act > 1 && this.qolHooks.push({
        name: "Previous Act",
        dest: me.act - 1,
        type: "actChange",
        hook: new Text("Shift < : Previous Act", Hooks.qolBoard.x + 5 + Hooks.resfix.x, 545 - (this.qolHooks.length * 10) + Hooks.resfix.y, 4)
      });

      break;
    case "qolBoard":
      TextHooks.qolFrameYSize = 50;
      TextHooks.lastAct = me.act;
      TextHooks.wasInTown = me.inTown;

      while (this.qolHooks.length) {
        this.qolHooks.shift().hook.remove();
      }

      this.qols.forEach(function (hook) {
        TextHooks.add(hook, TextHooks.qolHooks) && (TextHooks.qolFrameYSize -= 10);
      });

      this.qolHooks.push({
        name: "qolBoard",
        hook: new Box(Hooks.qolBoard.x + Hooks.resfix.x, Hooks.qolBoard.y + this.qolFrameYSize + Hooks.resfix.y, 140, 60 + (-1 * this.qolFrameYSize), 0x0, 1, 0)
      });

      this.qolHooks.push({
        name: "qolFrame",
        hook: new Frame(Hooks.qolBoard.x + Hooks.resfix.x, Hooks.qolBoard.y + this.qolFrameYSize + Hooks.resfix.y, 140, 60 + (-1 * this.qolFrameYSize), 0)
      });

      this.qolHooks[this.qolHooks.length - 2].hook.zorder = 0;

      break;
    case "pickitStatus":
      this.statusHooks.push({
        name: "pickitStatus",
        hook: new Text("ÿc4N-Pad - ÿc0: " + (ItemHooks.pickitEnabled ? "ÿc<Your Filter" : "ÿc1Default Filter"), 10, 503 - (this.settingsModifer * 10) - (this.statusHooks.length * 11) + Hooks.resfix.y)
      });

      break;
    case "itemStatus":
      this.statusHooks.push({
        name: "itemStatus",
        hook: new Text("ÿc4Key 7ÿc0: " + (ItemHooks.enabled ? "Disable" : "Enable") + " Item Filter", 10, 503 - (this.settingsModifer * 10) - (this.statusHooks.length * 11) + Hooks.resfix.y)
      });

      break;
    case "monsterStatus":
      this.statusHooks.push({
        name: "monsterStatus",
        hook: new Text("ÿc4Key 8ÿc0: " + (MonsterHooks.enabled ? "Disable" : "Enable") + " Monsters", 10, 503 - (this.settingsModifer * 10) - (this.statusHooks.length * 11) + Hooks.resfix.y)
      });

      break;
    case "vectorStatus":
      this.statusHooks.push({
        name: "vectorStatus",
        hook: new Text("ÿc4Key 9ÿc0: " + (VectorHooks.enabled ? "Disable" : "Enable") + " Vectors", 10, 503 - (this.settingsModifer * 10) - (this.statusHooks.length * 11) + Hooks.resfix.y)
      });

      break;
    case "showSettings":
      TextHooks.statusFrameYSize = 0;

      while (this.statusHooks.length) {
        this.statusHooks.shift().hook.remove();
      }

      this.statusHookNames.forEach(function (hook) {
        TextHooks.add(hook, TextHooks.statusHooks);
        TextHooks.statusFrameYSize += 13;
      });

      this.statusHooks.push({
        name: "statusBox",
        hook: new Box(5, 503 - (this.settingsModifer * 10) - (this.statusHookNames.length * 12) + Hooks.resfix.y, 170, this.statusFrameYSize, 0x0, 1, 0)
      });

      this.statusHooks.push({
        name: "statusFrame",
        hook: new Frame(3, 503 - (this.settingsModifer * 10) - (this.statusHookNames.length * 12) + Hooks.resfix.y, 170, this.statusFrameYSize, 0)
      });

      this.statusHooks[this.statusHooks.length - 2].hook.zorder = 0;

      this.statusHooks.push({
        name: "showSettings", /*feels backwards but makes sense I guess*/
        hook: new Text("ÿc1Hide Settings", 0, 590 + Hooks.resfix.y, 4, 0, 0, false, TextHooks.hookHandler)
      });

      break;
    case "hideSettings":
      while (this.statusHooks.length) {
        this.statusHooks.shift().hook.remove();
      }

      this.statusHooks.push({
        name: "hideSettings",
        hook: new Text("ÿc<Show Settings", 0, 590 + Hooks.resfix.y, 4, 0, 0, false, TextHooks.hookHandler)
      });

      break;
    }

    return hookArr.length > orginalLen;
  },

  getHook: function (name, hookArr = []) {
    for (let i = 0; i < hookArr.length; i++) {
      if (hookArr[i].name === name) {
        return hookArr[i];
      }
    }

    return false;
  },

  timer: function () {
    return " (" + new Date(getTickCount() - me.gamestarttime).toISOString().slice(11, -5) + ")";
  },

  flush: function () {
    if (!Hooks.enabled) {
      while (this.hooks.length) {
        this.hooks.shift().hook.remove();
      }

      TextHooks.frameworkDisplayed = false;
    }

    while (this.statusHooks.length) {
      this.statusHooks.shift().hook.remove();
    }

    while (this.dashBoard.length) {
      this.dashBoard.shift().hook.remove();
    }

    while (this.qolHooks.length) {
      this.qolHooks.shift().hook.remove();
    }
  },
};
