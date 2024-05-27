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

function Rusher () {
  load("threads/rushthread.js");
  delay(500);

  const {
    AutoRush,
    RushModes,
    RushConfig,
  } = require("../systems/autorush/RushConfig");

  const commands = [];
  let command = "";
  let master = "";
  let commandSplit0;
  let done = false;

  const RushThread = {
    /** @type {Script} */
    _thread: null,
    path: "threads/rushthread.js",

    get: function () {
      if (!this._thread) {
        this._thread = getScript(this.path);
      }
      return this._thread;
    },
    /** @param {String} msg */
    send: function (msg) {
      // sign the msg so we can ignore other threads' messages
      this.get().send("rush-" + msg);
    },
    pause: function () {
      say("Pausing");
      console.log("Pausing rush thread");
      this.get().pause();
    },
    resume: function () {
      say("Resuming");
      console.log("Resuming rush thread");
      this.get().resume();
    },
    start: function () {
      load(this.path);
      delay(500);
      
      while (!this.get()) {
        delay(500);
      }
    },
    stop: function () {
      this.get().stop();
    },
    reload: function () {
      this.stop();

      while (this.get().running) {
        delay(3);
      }
      this._thread = null;
      this.start();
    },
  };

  const getPartyAct = function () {
    let party = getParty();
    let minArea = 999;

    do {
      if (party.name !== me.name) {
        while (!party.area) {
          me.overhead("Waiting for party area info");
          delay(500);
        }

        if (party.area < minArea) {
          minArea = party.area;
        }
      }
    } while (party.getNext());

    return sdk.areas.actOf(minArea);
  };

  const chatEvent = function (nick, msg) {
    if (nick !== me.name) {
      if (typeof msg !== "string") return;
      switch (msg) {
      case "master":
        if (!master) {
          say(nick + " is my master.");

          master = nick;
        } else {
          say("I already have a master.");
        }

        break;
      case "release":
        if (nick === master) {
          say("I have no master now.");

          master = false;
        } else {
          say("I'm only accepting commands from my master.");
        }

        break;
      case "quit":
        if (nick === master) {
          done = true;
          say("bye ~");
          scriptBroadcast("quit");
        } else {
          say("I'm only accepting commands from my master.");
        }

        break;
      default:
        if (msg && msg.match(/^do \w|^clear \d|^pause$|^resume$/gi)) {
          if (nick === master) {
            commands.push(msg);
          } else {
            say("I'm only accepting commands from my master.");
          }
        } else if (msg && msg.includes("highestquest")) {
          if (!!master && nick === master || !master) {
            command = msg;
          } else {
            say("I'm only accepting commands from my master.");
          }
        }

        break;
      }
    }
  };

  addEventListener("chatmsg", chatEvent);

  while (Misc.getPartyCount() < Math.min(8, RushConfig[me.profile].config.WaitPlayerCount)) {
    me.overhead("Waiting for players to join");
    delay(500);
  }

  // Skip to a higher act if all party members are there
  let partyAct = getPartyAct();
  if (partyAct > 1) {
    say("Party is in act " + partyAct + ", skipping to act " + partyAct);
    RushThread.send("skiptoact " + partyAct);
  }

  // get info from master
  if (RushConfig[me.profile].type === RushModes.rusher) {
    let tick = getTickCount();
    let askAgain = 1;
    say("questinfo");
    while (!command) {
      // wait up to 3 minutes
      if (getTickCount() - tick > Time.minutes(3)) {
        break;
      }

      if (getTickCount() - tick > Time.minutes(askAgain)) {
        say("questinfo");
        askAgain++;
      }
    }
    if (command) {
      commandSplit0 = command.toLowerCase().split(" ")[1];
      if (!!commandSplit0 && AutoRush.sequences.includes(commandSplit0)) {
        RushThread.send(command.toLowerCase());
      }
    }
  }
  
  delay(200);
  RushThread.send("go");

  while (!done) {
    if (commands.length > 0) {
      command = commands.shift();

      switch (command) {
      case "pause":
        RushThread.pause();

        break;
      case "resume":
        RushThread.resume();

        break;
      default:
        if (typeof command === "string") {
          commandSplit0 = command.split(" ")[0];

          if (commandSplit0 === undefined) {
            break;
          }

          if (commandSplit0.toLowerCase() === "do") {
            let script = command.split(" ")[1];
            if (!script || !AutoRush.sequences.some(el => el.match(script, "gi"))) {
              say("Invalid sequence");
              break;
            }
            RushThread.reload();
            RushThread.send(script);
          } else if (commandSplit0.toLowerCase() === "clear") {
            let area = command.split(" ")[1];
            if (!area) break;
            let areaId = parseInt(area, 10);
            if (isNaN(areaId) || areaId < 1 || areaId > 132) {
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

  // eslint-disable-next-line no-unreachable
  return true;
}
