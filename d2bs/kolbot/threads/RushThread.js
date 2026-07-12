/* eslint-disable max-len */
/**
*  @filename    RushThread.js
*  @author      kolton, theBGuy
*  @desc        Second half of the Rusher script
*
*/
js_strict(true);
include("critical.js");

// globals needed for core gameplay
includeCoreLibs();

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");


function main () {
  const {
    log,
    andariel,
    cube,
    amulet,
    staff,
    summoner,
    duriel,
    travincal,
    mephisto,
    diablo,
    ancients,
    baal,
    cain,
    radament,
    lamesen,
    izual,
    shenk,
    anya,
  } = require("../libs/systems/autorush/AutoRush");
  const { AutoRush } = require("../libs/systems/autorush/RushConstants");
  const { RushConfig } = require("../libs/systems/autorush/RushConfig");
  /** @type {RusherConfig} */
  const rushProfile = RushConfig[me.profile];

  if (!rushProfile) {
    throw new Error("No rush config found for this profile. Please create one in RushConfig.js");
  }

  const Overrides = require("../libs/modules/Override");

  let count = 0;
  let silentNameTracker = [];
  let wpsToGive = Pather.nonTownWpAreas.slice(0).filter(function (area) {
    if (area === sdk.areas.HallsofPain) return false;
    if (me.classic && area >= sdk.areas.Harrogath) return false;
    return true;
  });

  function wpEvent (who, msg) {
    if (typeof msg === "string" && (msg === "gotwp" || msg === "Failed to get wp" || msg === "alreadyhave")) {
      count++;
      !silentNameTracker.includes(who) && silentNameTracker.push(who);
    }
  }

  function giveWP () {
    let wp = Game.getObject("waypoint");
    let success = false;
    
    if (wp && !me.inTown && wpsToGive.includes(me.area)) {
      try {
        addEventListener("chatmsg", wpEvent);
        let playerCount = Misc.getPartyCount();
        
        if (me.getMobCount(15) > 0) {
          Attack.securePosition(me.x, me.y, { range: 15, duration: Time.seconds(30), skipBlocked: true });
        }

        wp.distance > 5 && Pather.moveToUnit(wp);
        Pather.makePortal();
        say("wp");
        let tick = getTickCount();
        while (getTickCount() - tick < Time.minutes(2)) {
          let player = Game.getPlayer();
          if (player) {
            do {
              if (player.name !== me.name && !silentNameTracker.includes(player.name)) {
                silentNameTracker.push(player.name);
              }
            } while (player.getNext());
          }
          if (count === playerCount || (silentNameTracker.length === playerCount && Misc.getNearbyPlayerCount() === 0)) {
            wpsToGive.remove(me.area);
            success = true;
            break;
          }
          delay(50);
        }
      } catch (e) {
        console.error(e);
        Config.LocalChat.Enabled && say("Failed to give wp");
      } finally {
        removeEventListener("chatmsg", wpEvent);
        silentNameTracker = [];
        count = 0;
      }
      return success;
    }

    return false;
  }

  new Overrides.Override(Pather, Pather.useWaypoint, function(orignal, targetArea, check) {
    if (orignal(targetArea, check)) {
      return (rushProfile.config.Wps && giveWP()) || true;
    } else {
      console.log("failed");
      
      return false;
    }
  }).apply();

  const clearArea = function (area) {
    Pather.journeyTo(area);
    Attack.clearLevel(0);
    log("Done clearing area: " + area);
  };

  const givewps = function () {
    if (!rushProfile.config.Wps) return false;

    say("wpinfo");

    Misc.poll(function () {
      return gotWpInfo;
    }, Time.minutes(3), 1000);

    log("Starting wps to give: " + wpsToGive.length);
    let wpsLeft = wpsToGive.slice(0);
    console.log(JSON.stringify(wpsLeft));

    wpsLeft.forEach(function (wp) {
      me.checkScrolls(sdk.items.TomeofTownPortal) <= 5 && (Pather.useWaypoint(sdk.areas.townOf(me.area)) || Town.goToTown()) && Town.doChores();
      Pather.useWaypoint(wp);
    });

    return true;
  };

  console.log(sdk.colors.LightGold + "Loading RushThread");

  let command = "";
  let current = 0;
  let questerName = "";
  let gotWpInfo = false;

  const sequences = [
    cain,
    andariel,
    radament,
    cube,
    amulet,
    staff,
    summoner,
    duriel,
    lamesen,
    travincal,
    mephisto,
    izual,
    diablo,
    shenk,
    anya,
    ancients,
    baal,
    // givewps
  ];

  const scriptEvent = function (msg) {
    if (typeof msg === "string") {
      if (!msg.startsWith("rush-")) return;
      command = msg.substring(5);
    } else if (
      isType(msg, "object")
      && Object.hasOwn(msg, "type")
      && msg.type === "rush"
    ) {
      switch (msg.action) {
      case "highestquest":
        questerName = msg.data.quester;
        // hacky but don't feel like changing orginal logic in handleRushCommand right now
        command = "highestquest " + msg.data.highestquest;
        break;
      case "wps":
        wpsToGive = msg.data.wps;
        gotWpInfo = true;
        break;
      }
    }
  };

  addEventListener("scriptmsg", scriptEvent);

  /** @param {string} msg */
  const handleRushCommand = function (msg) {
    if (!isType(msg, "string")) return;

    let [action, info] = msg.toLowerCase().split(" ");
    console.log("Received rush command: " + action + " info: " + info);

    if (action) {
      if (action === "skiptoact") {
        if (!isNaN(parseInt(info, 10))) {
          switch (parseInt(info, 10)) {
          case 2:
            current = sequences.findIndex((s) => s.name === "andariel") + 1;
            Town.goToTown(2);

            break;
          case 3:
            current = sequences.findIndex((s) => s.name === "duriel") + 1;
            Town.goToTown(3);

            break;
          case 4:
            current = sequences.findIndex((s) => s.name === "mephisto") + 1;
            Town.goToTown(4);

            break;
          case 5:
            current = sequences.findIndex((s) => s.name === "diablo") + 1;
            Town.goToTown(5);

            break;
          }
        }

        command = "";
      } else if (action === "clear") {
        clearArea(Number(info));
        Town.goToTown();

        command = "go";
      } else if (action === "highestquest" && info) {
        let foundIdx = sequences.findIndex(function (s) {
          return s.name === info;
        });
        console.log("highestquest idx: " + foundIdx);
        foundIdx > -1 && (current = foundIdx + 1);

        command = "";
      }
    } else {
      let foundIdx = sequences.findIndex(function (s) {
        return s.name.toLowerCase() === command.toLowerCase();
      });

      if (foundIdx > -1) {
        current = foundIdx;
      }

      Town.goToTown();

      command = "go";
    }
  };

  // START
  Config.init(false);
  Pickit.init(false);
  Attack.init();
  Storage.Init();
  CraftingSystem.buildLists();
  Runewords.init();
  Cubing.init();

  Config.MFLeader = false;

  (function () {
    let lastRunIdx = sequences.findIndex(function (s) {
      return String.isEqual(rushProfile.config.LastRun, s.name);
    });
    if (lastRunIdx > -1) {
      let temp = sequences.slice(0, lastRunIdx + 1);
      sequences.length = 0;
      for (let i = 0; i < temp.length; i++) {
        sequences.push(temp[i]);
      }
    }
  })();

  if (rushProfile.config.Wps) {
    sequences.push(givewps);
  }

  console.debug("Rush sequence: " + sequences.map((s) => s.name).join(", "));

  while (true) {
    if (command) {
      switch (command) {
      case "go":
        // End run if entire sequence is done or if Config.Rusher.LastRun is done
        if (current >= sequences.length) {
          delay(3000);
          log("exit");
          console.log("Current sequence length: " + current + " sequence length: " + sequences.length);

          while (Misc.getPlayerCount() > 1) {
            delay(1000);
          }

          scriptBroadcast("quit");

          break;
        }

        Town.doChores();

        // TODO: add extra checks before starting to ensure quester is moving along with us

        try {
          sequences[current](questerName);
        } catch (sequenceError) {
          log(sequenceError.message);
          log(AutoRush.playersOut);
          Town.goToTown();
        }

        current += 1;
        command = "go";

        break;
      default:
        handleRushCommand(command);

        break;
      }
    }

    delay(100);
  }
}
