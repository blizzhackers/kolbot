/**
*  @filename    main.js
*  @author      theBGuy
*  @credits     kolton for orginal MapThread,
*               isid0re for the box/frame style,
*               laz for gamepacketsent event handler
*  @desc        main thread for D2BotMap.dbj
*/
js_strict(true);
include("critical.js"); // required

// globals needed for core gameplay
includeCoreLibs();

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");

// main thread specific
const LocalChat = require("../modules/LocalChat");

include("manualplay/MapMode.js");
MapMode.include();

/** @typedef {import('./hooks/TextHooks')} TextHooksModule */

function main () {
  D2Bot.init(); // Get D2Bot# handle
  D2Bot.ingame();

  (function (global, original) {
    /**
     * @param {...string} args - Forwarded to the original `load`.
     * @returns {void}
     */
    global.load = function (...args) {
      original.apply(this, args);
      delay(500);
    };
  })([].filter.constructor("return this")(), load);

  // wait until game is ready
  while (!me.gameReady) {
    delay(50);
  }

  clearAllEvents(); // remove any event listeners from game crash

  // load heartbeat if it isn't already running
  let _heartbeat = getScript("threads/heartbeat.js");
  if (!_heartbeat || !_heartbeat.running) {
    load("threads/heartbeat.js");
  }

  console.log("ÿc9Map Thread Loaded.");
  MapMode.include();
  Config.init(true);
  LocalChat.init();
  Storage.Init();
  Pickit.init(true);
  Hooks.init();

  // load threads
  me.automap = true;
  load("libs/manualplay/threads/maphelper.js");
  load("libs/manualplay/threads/maptoolsthread.js");
  Config.ManualPlayPick && load("libs/manualplay/threads/pickthread.js");
  if (Config.PublicMode) {
    Config.PublicMode === true
      ? require("../modules/workers/SimpleParty")
      : load("threads/Party.js");
  }

  const Worker = require("../modules/Worker");
  const UnitInfo = new (require("../modules/UnitInfo"));
  const HelpMenu = require("./modules/HelpMenu");

  /** @returns {boolean} Always true; keeps the background process re-queued each low-prio check. */
  Worker.runInBackground.unitInfo = function () {
    // always, maybe a timeout would be good though
    UnitInfo.check();

    // not being used atm - keep looping
    if (!Hooks.userAddon) {
      return true;
    }
    
    UnitInfo.createInfo(Game.getSelectedUnit());

    return true;
  };

  Worker.runInBackground.antiIdle = (function () {
    const last = {
      area: me.area,
      x: me.x,
      y: me.y,
      idleTick: getTickCount() + Time.seconds(rand(1200, 1500)),
    };

    return function () {
      if (!me.gameReady) return true;
      if (last.area !== me.area || last.distance > 10) {
        last.area = me.area;
        last.x = me.x;
        last.y = me.y;
        last.idleTick = getTickCount() + Time.seconds(rand(1200, 1500));
      }

      if (getTickCount() - last.idleTick > 0) {
        Packet.questRefresh();
        last.idleTick += Time.seconds(rand(1200, 1500));
        console.log("Sent anti-idle packet, next refresh in: (" + Time.format(last.idleTick - getTickCount()) + ")");
      }
      return true;
    };
  })();

  const log = function (msg = "") {
    me.overhead(msg);
    console.log(msg);
  };

  if (Config.MapMode.UseOwnItemFilter) {
    ItemHooks.pickitEnabled = true;
  }

  const hideFlags = [
    sdk.uiflags.Inventory, sdk.uiflags.StatsWindow,
    sdk.uiflags.QuickSkill, sdk.uiflags.SkillWindow,
    sdk.uiflags.ChatBox, sdk.uiflags.EscMenu,
    sdk.uiflags.Shop, sdk.uiflags.Quest,
    sdk.uiflags.Waypoint, sdk.uiflags.TradePrompt,
    sdk.uiflags.Msgs, sdk.uiflags.Stash,
    sdk.uiflags.Cube, sdk.uiflags.Help, sdk.uiflags.MercScreen
  ];
  /** @type {Set<number>} */
  const revealedAreas = new Set();

  /** @param {number} area */
  const revealArea = function (area) {
    if (revealedAreas.has(area)) {
      return;
    }
    delay(500);
    
    if (!getRoom()) {
      return;
    }
    
    revealLevel(true);
    revealedAreas.add(area);
  };

  /**
   * Run commands from chat
   * @param {string} msg 
   * @returns {boolean}
   */
  const runCommand = function (msg) {
    if (msg.length <= 1) return true;

    msg = msg.toLowerCase();
    let cmd = msg.split(" ")[0].split(".")[1];
    let msgList = msg.split(" ");
    const qolObj = { type: "qol", dest: false, action: false, params: [] };

    switch (cmd) {
    case "useraddon":
      Hooks.userAddon = !Hooks.userAddon;
      log("userAddon set to " + Hooks.userAddon);

      break;
    case "me":
      log("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);

      break;
    case "stash":
      me.inTown && (qolObj.action = "stashItems");

      break;
    case "gamble":
      me.inTown && (qolObj.action = "gamble");
 
      break;
    case "pick":
    case "cowportal":
    case "uberportal":
    case "filltps":
      qolObj.action = cmd;

      if (msgList.length > 1) {
        qolObj.params.push(msgList.at(1));
      }

      break;
    case "drop":
      if (msgList.length < 2) {
        console.log("ÿc1Missing arguments");
        break;
      }

      qolObj.type = "drop";
      qolObj.action = msgList[1];

      break;
    case "stack":
      if (msgList.length < 2) {
        console.log("ÿc1Missing arguments");
        break;
      }

      qolObj.type = "stack";
      qolObj.action = msgList[1];

      if (msgList.length > 2) {
        qolObj.params.push(msgList.at(2));
      }

      break;
    case "help":
      if (HelpMenu.cleared) {
        HelpMenu.showMenu();
        log("Click each command for more info");
      }

      break;
    case "hide":
      hideConsole();
      HelpMenu.hideMenu();
      TextHooks.displayTitle = false;
      {
        let tHook = TextHooks.getHook("title", TextHooks.hooks);
        !!tHook && tHook.hook.remove();
      }

      break;
    case "make": {
      let className = sdk.player.class.nameOf(me.classid);
      if (!FileTools.exists("libs/manualplay/config/" + className + "." + me.name + ".js")) {
        FileTools.copy("libs/manualplay/config/" + className + ".js", "libs/manualplay/config/" + className + "." + me.name + ".js");
        D2Bot.printToConsole("libs/manualplay/config/" + className + "." + me.name + ".js has been created. Configure the bot and reload to apply changes");
        log("libs/manualplay/config/" + className + "." + me.name + ".js has been created. Configure the bot and reload to apply changes");
      }
      
      break;
    }
    case "docubing":
    case "makerunewords":
      qolObj.action = cmd;

      break;
    default:
      console.warn("ÿc1Invalid command : " + cmd);

      break;
    }

    qolObj.action && Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(qolObj));

    return true;
  };

  /**
   * @param {string} speaker 
   * @param {string} msg 
   * @returns {boolean}
   */
  const onChatInput = function (speaker, msg) {
    if (msg.length && msg[0] === ".") {
      runCommand(msg);

      return true;
    }

    return false;
  };

  addEventListener("chatinputblocker", onChatInput);
  addEventListener("keyup", ActionHooks.event);
  // addEventListener("itemaction", Pickit.itemEvent);

  try {
    while (true) {
      while (!me.area || !me.gameReady) {
        nativeDelay(100);
      }

      let hideFlagFound = false;

      revealArea(me.area);
      
      for (let i = 0; i < hideFlags.length; i++) {
        if (getUIFlag(hideFlags[i])) {
          Hooks.flush(hideFlags[i]);
          ActionHooks.checkAction();
          hideFlagFound = true;
          delay(100);

          break;
        }
      }

      if (hideFlagFound) {
        continue;
      }

      getUIFlag(sdk.uiflags.AutoMap)
        ? Hooks.update()
        : Hooks.flush(true) && (!HelpMenu.cleared && HelpMenu.hideMenu());

      delay(20);

      while (getUIFlag(sdk.uiflags.ShowItem)) {
        ItemHooks.flush();
      }
    }
  } catch (e) {
    Misc.errorReport(e, "main.js", "main()");
  }
}
