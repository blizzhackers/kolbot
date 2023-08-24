/**
*  @filename    main.js
*  @author      theBGuy
*  @desc        Executed upon game join, main thread for mule
*
*  @typedef {import("./sdk/globals")}
*  @typedef {import("./libs/systems/mulelogger/MuleLogger")}
*/

js_strict(true);
include("critical.js"); // required

// globals needed for core gameplay
includeCoreLibs();

// system libs
includeSystemLibs();
include("systems/automule/Mule.js");
include("systems/mulelogger/MuleLogger.js");

function main () {
  D2Bot.init(); // Get D2Bot# handle
  D2Bot.ingame();

  while (!me.gameReady) {
    delay(50);
  }

  // load heartbeat if it isn't already running
  let _heartbeat = getScript("threads/heartbeat.js");
  if (!_heartbeat || !_heartbeat.running) {
    load("threads/heartbeat.js");
  }

  const Worker = require("../../modules/Worker");
  const Delta = new (require("../../modules/Deltas"));
  
  Worker.runInBackground.areaWatcher = (function () {
    let areaTick = 0;
    return function () {
      // run area check every half second
      if (getTickCount() - areaTick < 500) return true;
      areaTick = getTickCount();
      // check that we are actually in game and that we've been there longer than a minute
      if (getLocation() !== null || getTickCount() - me.gamestarttime < Time.minutes(1)) return true;
      
      if (me.ingame && me.gameReady && me.area > 0) {
        if (me.area !== sdk.areas.RogueEncampment) {
          console.warn("Preventing Suicide Walk! Current Area: " + me.area);
          console.trace();

          Mule.quit();
        }
      }

      return true;
    };
  })();

  Worker.runInBackground.antiIdle = (function () {
    let idleTick = 0;
    return function () {
      if (!me.ingame || getTickCount() - me.gamestarttime < Time.minutes(1) || !me.gameReady) return true;
      if (idleTick === 0) {
        idleTick = getTickCount() + Time.seconds(rand(1200, 1500));
        console.log("Anti-idle refresh in: (" + Time.format(idleTick - getTickCount()) + ")");
      }
      if (me.gameReady) {
        if (getTickCount() - idleTick > 0) {
          Packet.questRefresh();
          idleTick += Time.seconds(rand(1200, 1500));
          console.log("Sent anti-idle packet, next refresh in: (" + Time.format(idleTick - getTickCount()) + ")");
        }
      } else if (getLocation() !== null) {
        idleTick = 0;
      }

      return true;
    };
  })();

  // START
  const EntryScript = getScript("D2BotMule.dbj");

  Delta.track(() => Mule.status, () => EntryScript.send({ status: Mule.status }));

  addEventListener("itemaction", function (gid, mode, code) {
    if (gid > 0 && mode === 2) {
      console.log("gid: " + gid, " mode: " + mode + " code: " + code);
      Mule.droppedGids.add(gid);
      // Mule.status = "begin";
    }
  });
  addEventListener("scriptmsg", function (msg) {
    if (typeof msg === "object") {
      if (msg.hasOwnProperty("obj")) {
        // Object.assign(Mule, msg);
        Mule.obj = msg.obj;
        Mule.mode = msg.mode;
        Mule.master = msg.master;
        Mule.next = msg.next;
        Mule.minGameTime = msg.minGameTime;
        Mule.maxGameTime = msg.maxGameTime;
        Mule.continuous = msg.obj.continuousMule;
        MuleData.fileName = msg.fileName;
      }
    }
  });
  addEventListener("copydata", function (mode, msg) {
    switch (mode) {
    case 10: // mule request
      let obj = JSON.parse(msg);

      if (Mule.continuous) {
        sendCopyData(null, obj.profile, 10, JSON.stringify({ status: "ready" }));
      } else {
        if (!Mule.master) {
          let masterInfo = Mule.getMaster(obj);

          if (masterInfo) {
            Mule.master = masterInfo.profile;
            Mule.mode = masterInfo.mode;
          }
        } else {
          // come back to this to allow multiple mulers
          if (obj.profile === Mule.master) {
            sendCopyData(null, Mule.master, 10, JSON.stringify({ status: Mule.status }));
          } else {
            sendCopyData(null, obj.profile, 10, JSON.stringify({ status: "busy" }));
          }
        }
      }

      break;
    case 11: // begin item pickup
      Mule.status = "begin";

      break;
    case 12: // get master's status
      Mule.masterStatus = JSON.parse(msg);

      break;
    }
  });
  EntryScript.send("mule_init");
  Misc.poll(() => Mule.obj !== null, Time.seconds(30), 100);
  Mule.startTick = getTickCount();

  if (Mule.next) {
    // we had to make a new mule, if we are here then items need to be picked up
    Mule.status = "begin";
    Mule.masterStatus = { status: "done" };
  }

  Mule.status !== "begin" && (Mule.status = "ready");
  Mule.recheckTick = getTickCount();

  Town.goToTown(1);
  Town.move("stash");
        
  Storage.Init();

  if (Mule.continuous) {
    !Mule.obj.onlyLogWhenFull && MuleLogger.logChar();
  }
  console.log("~~~Mule init complete~~~");
  // check the ground for items
  if (Mule.getGroundItems().length > 0) {
    Mule.status = "begin";
  }

  if (!Mule.continuous) {
    Mule.waitForMaster();
  }

  while (me.ingame) {
    if (Mule.status === "begin") {
      Mule.status = Mule.pickItems();

      switch (Mule.status) {
      // done picking, tell the master to leave game and kill mule profile
      case "done":
        Mule.done();

        return true;
      // can't fit more items, get to next character or account
      case "next":
        EntryScript.send("next");
        Mule.nextChar();

        return true;
      }
    } else if (Mule.droppedGids.size > 0 && Mule.status === "ready") {
      Mule.status = "begin";
    }

    if (Town.getDistance("stash") > 10) {
      Town.move("stash");
    }

    if (Mule.continuous) {
      if (Mule.maxGameTime > 0
        && getTickCount() - me.gamestarttime > Time.minutes(Mule.maxGameTime)
        && Mule.foreverAlone()) {
        console.log("~~~MaxGameTime Reached~~~");
        EntryScript.send("refresh");
        Mule.quit();

        break;
      }
    }
    delay(1000);
  }
  return true;
}
