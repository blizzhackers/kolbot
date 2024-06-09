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

  let i, command, master, commandSplit0;
  let commands = [];
  let sequence = [
    "cain", "andariel", "radament", "cube", "amulet", "staff", "summoner", "duriel", "lamesen",
    "travincal", "mephisto", "izual", "diablo", "shenk", "anya", "ancients", "baal", "givewps"
  ];
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

  while (Misc.getPartyCount() < Math.min(8, Config.Rusher.WaitPlayerCount)) {
    me.overhead("Waiting for players to join");
    delay(500);
  }

  // Skip to a higher act if all party members are there
  switch (getPartyAct()) {
  case 2:
    say("Party is in act 2, starting from act 2");
    RushThread.send("skiptoact 2");

    break;
  case 3:
    say("Party is in act 3, starting from act 3");
    RushThread.send("skiptoact 3");

    break;
  case 4:
    say("Party is in act 4, starting from act 4");
    RushThread.send("skiptoact 4");

    break;
  case 5:
    say("Party is in act 5, starting from act 5");
    RushThread.send("skiptoact 5");

    break;
  }

  // get info from master
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
    commandSplit0 = command.split(" ")[1];
    if (!!commandSplit0 && sequence.some(el => el.toLowerCase() === commandSplit0)) {
      RushThread.send(command.toLowerCase());
    }
  }

  delay(200);
  RushThread.send("go");

  while (true) {
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
            for (i = 0; i < sequence.length; i += 1) {
              if (command.split(" ")[1] && sequence[i].match(command.split(" ")[1], "gi")) {
                RushThread.reload();
                RushThread.send(command.split(" ")[1]);

                break;
              }
            }

            i === sequence.length && say("Invalid sequence");
          } else if (commandSplit0.toLowerCase() === "clear") {
            if (!isNaN(parseInt(command.split(" ")[1], 10))
              && parseInt(command.split(" ")[1], 10) > 0
              && parseInt(command.split(" ")[1], 10) <= 132) {
              RushThread.reload();
              RushThread.send(command);
            } else {
              say("Invalid area");
            }
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
