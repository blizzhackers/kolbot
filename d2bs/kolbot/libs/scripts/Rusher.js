/// <reference path="../systems/autorush/index.d.ts" />
/**
*  @filename    Rusher.js
*  @author      kolton, theBGuy
*  @desc        Rusher script.
*
*  @Commands
*    master - assigns player as master and listens to his commands
*    release - resets master
*    pause - pause the rusher
*    resume - resume the rusher
*    do sequence - stop current action and start the given sequence.
*    supported sequences are: andariel, cube, amulet, staff, summoner, duriel, travincal, mephisto, diablo
*    Example: do travincal
*
*/

const Rusher = new Runnable(
  function Rusher () {
    load("threads/rushthread.js");
    delay(500);

    const {
      RushConfig,
    } = require("../systems/autorush/RushConfig");
    const { RushModes, AutoRush } = require("../systems/autorush/RushConstants");
    
    const commands = [];
    /** @type {RusherConfig} */
    const rushProfile = RushConfig[me.profile];
    
    let master = "";
    let done = false;
    let gotQInfo = false;

    const RushThread = {
      /** @type {Script} */
      _thread: null,
      path: "threads/rushthread.js",

      get thread() {
        if (!this._thread) {
          this._thread = getScript(this.path);
        }
        return this._thread;
      },
      /** @param {String} msg */
      send: function (msg) {
        // sign the msg so we can ignore other threads' messages
        this.thread.send("rush-" + msg);
      },
      /**
      * @param {string} action
      * @param {object} blob
      */
      sendBlob: function (action, blob) {
        // sign the msg so we can ignore other threads' messages
        this.thread.send({ type: "rush", action: action, data: blob });
      },
      pause: function () {
        say("Pausing");
        console.log("Pausing rush thread");
        this.thread.pause();
      },
      resume: function () {
        say("Resuming");
        console.log("Resuming rush thread");
        this.thread.resume();
      },
      start: function () {
        load(this.path);
        nativeDelay(500);
        
        while (!this.thread) {
          nativeDelay(500);
        }
      },
      stop: function () {
        this.thread.stop();
      },
      reload: function () {
        this.stop();

        while (this.thread.running) {
          nativeDelay(50);
        }
        this._thread = null;
        this.start();
      },
    };

    const getPartyAct = function () {
      let party = getParty();
      if (!party) return sdk.areas.actOf(me.area);
      let minArea = 999;

      do {
        if (party.name !== me.name) {
          Misc.poll(function () {
            me.overhead("Waiting for party area info from " + party.name);
            return party.area;
          }, Time.seconds(5), 500);

          if (party.area < minArea) {
            minArea = party.area;
          }
        }
      } while (party.getNext());

      return sdk.areas.actOf(minArea);
    };

    /**
     * @param {string} nick 
     * @param {string} msg 
     */
    const chatEvent = function (nick, msg) {
      if (!nick || !msg) return;
      if (nick === me.name) return;
      if (typeof msg !== "string") return;
      if (msg === "who is rusher") {
        say("i am rusher");
        return;
      }
      try {
        if (msg.includes("qinfo")) {
          if ((!!master && nick === master) || !master) {
            RushThread.sendBlob("highestquest", {
              highestquest: msg.split("qinfo ")[1],
              quester: nick,
            });
            console.log("Received quest info from master");
            gotQInfo = true;
          }
          return;
        }
        if (msg.includes("wpinfo")) {
          if ((!!master && nick === master) || !master) {
            /** @type {string[]} */
            let wps = JSON.parse(msg.split("wpinfo ")[1]);
            RushThread.sendBlob("wps", {
              wps: wps.map(wp => parseInt(wp, 10)),
            });
            console.log("Received wp info from master");
          }
          return;
        }
        switch (msg) {
        case "master":
          if (master) {
            if (master !== nick) {
              throw new Error("I already have a master.");
            }
          } else {
            say(nick + " is my master.");

            master = nick;
          }

          break;
        case "release":
          if (nick !== master) {
            throw new Error("I'm only accepting commands from my master.");
          }
          say("I have no master now.");
          master = false;

          break;
        case "quit":
          if (nick !== master) {
            throw new Error("I'm only accepting commands from my master.");
          }
          done = true;
          say("bye ~");
          scriptBroadcast("quit");

          break;
        default:
          if (msg && msg.match(/^do \w|^clear \d|^pause$|^resume$/gi)) {
            if (nick !== master) {
              throw new Error("I'm only accepting commands from my master.");
            }
            commands.push(msg);
          }

          break;
        }
      } catch (e) {
        say("Error: " + e.message);
      }
    };

    addEventListener("chatmsg", chatEvent);

    const playerWaitTimeout = getTickCount() + Time.minutes(2);
    const { WaitPlayerCount } = rushProfile.config;
    
    while (Misc.getPartyCount() < Math.min(8, WaitPlayerCount)) {
      if (getTickCount() > playerWaitTimeout) {
        say("Player wait timed out. Expected: " + WaitPlayerCount + ", Found: " + Misc.getPartyCount());
        break;
      }
      me.overhead("Waiting " + Math.round((playerWaitTimeout - getTickCount()) / 1000) + "s for players to join");
      delay(500);
    }

    // Skip to a higher act if all party members are there
    let partyAct = getPartyAct();
    if (partyAct > 1) {
      say("Party is in act " + partyAct + ", skipping to act " + partyAct);
      RushThread.send("skiptoact " + partyAct);
    }

    if (rushProfile.type === RushModes.rusher) {
      // get quest info from master
      let tick = getTickCount();
      let askAgain = 1;
      say("questinfo");
      
      while (!gotQInfo) {
        // wait up to 3 minutes
        if (getTickCount() - tick > Time.minutes(3)) {
          break;
        }

        if (getTickCount() - tick > Time.minutes(askAgain)) {
          say("questinfo");
          askAgain++;
        }
      }
    }
    
    delay(200);
    RushThread.send("go");

    while (!done) {
      if (commands.length > 0) {
        let command = commands.shift();

        switch (command) {
        case "pause":
          RushThread.pause();

          break;
        case "resume":
          RushThread.resume();

          break;
        default:
          if (typeof command === "string") {
            let commandSplit0 = command.split(" ")[0];

            if (commandSplit0 === undefined) {
              break;
            }

            if (commandSplit0.toLowerCase() === "do") {
              let script = (command.split(" ")[1] || "").toLowerCase();
              if (!script || !AutoRush.sequences.includes(script)) {
                say("Invalid sequence");
                break;
              }
              RushThread.reload();
              RushThread.send(script);
            } else if (commandSplit0.toLowerCase() === "clear") {
              let area = command.split(" ")[1];
              if (!area) break;
              let areaId = parseInt(area, 10);
              if (isNaN(areaId) || areaId < sdk.areas.RogueEncampment || areaId > sdk.areas.WorldstoneChamber) {
                say("Invalid area");
                break;
              }
              RushThread.reload();
              RushThread.send(command);
            }
          }

          break;
        }
      }

      delay(100);
    }

    return true;
  }
);
