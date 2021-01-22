/**
 * @filename WPGiver.js
 * @author   Toxik (Toxik1983 on GitHub)
 * @desc     Waypoint 'giver' script. This will make a bot visit all waypoints and set up portals there. Meant as a solution for characters that can't teleport.
 *
 * Chat commands:
 * master - Get control over the bot. Auto-assigned when a command is issued without having a master.
 * release - Release control over the bot. Auto-released when the master leaves the game.
 * quit - Makes the bot quit.
 * start - Start with (or start over with) the first waypoint of the current act.
 * next - Advance to the next waypoint. Can be used instead of 'start', if the first waypoint of an act is due next.
 * a1, a2, a3, a4, a5 - Switch to a different act. Will start over, if the current act is specified.
 */

function WPGiver() {
  Town.doChores();

  var commands, command, master, waypointIndex, availableActs, towns;
  commands = [];
  towns = [1, 40, 75, 103, 109];

  // Gather available acts
  availableActs = [1];
  for (let i = 2; i < 6; i++) {
    if (Pather.accessToAct(i)) {
      availableActs.push(i);
    }
  }

  // Give control over the bot to a player
  this.assignMaster = function (nick) {
    say(nick + " is now my master.");
    master = nick;
  }

  // Allow a new player to control the bot
  this.releaseMaster = function () {
    master = false;
    say("I have no master anymore.");
  }

  // Listen for chat commands; based on Rusher script by kolton
  this.chatEvent = function (nick, msg) {
    if (nick !== me.name) {
      switch (msg) {
        case "master":
          if (!master) {
            this.assignMaster(nick);
          } else {
            say(nick + " is already my master.");
          }
          break;
        case "release":
          if (nick === master) {
            this.releaseMaster();
          } else {
            say("I'm only accepting commands from " + master + ".");
          }
          break;
        case "quit":
          if (nick === master) {
            say("See you later!");
            scriptBroadcast("quit");
          } else {
            say("I'm only accepting commands from " + master + ".");
          }
          break;
        default:
          if (msg && msg.match(/^start$|^next$|^a[0-9]$/gi)) {
            switch (true) {
              case (nick === master):
                commands.push(msg);
                break;
              case (!master):
                this.assignMaster(nick);
                commands.push(msg);
                break;
              default:
                say("I'm only accepting commands from " + master + ".");
            }
          }
      }
    }
  };

  addEventListener("chatmsg", this.chatEvent);

  // Automatically release master if they leave
  this.gameEvent = function (mode, param1, param2, name1, name2) {
    switch (mode) {
      case 0x00:
      case 0x01:
      case 0x03:
        if (master && name1 === master) {
          this.releaseMaster();
        }
        break;
    }
  }

  addEventListener("gameevent", this.gameEvent);

  // Next waypoint will be the first one of the current act
  this.resetIndex = function () {
    waypointIndex = -1;
  }

  // Switch to a different act, or reset the current one
  this.changeAct = function (act) {
    // Change towns
    if (act !== me.act) {
      if (availableActs.indexOf(act) !== -1) {
        Town.goToTown(act);
      } else {
        say("I don't have access to act " + act + ". My available acts are: " + (availableActs.length > 1 ? availableActs.slice(0, (availableActs.length - 1)).join(", ") + " and " + availableActs[availableActs.length - 1] + "." : "1."));
        return false;
      }
    }
    // Wait by the town waypoint
    this.resetIndex();
    Pather.getWP(me.area);
    say("Ready to go. Say 'start' to begin in act " + act + ", or say 'a1' up to 'a5' to switch acts.");
    return true;
  }

  // Something went wrong; return to the waypoint in town
  this.abortWaypoint = function () {
    say("Sorry, I was unable to get to the waypoint.");
    Town.goToTown(me.act);
    Pather.getWP(me.area);
    return false;
  }

  // Go to the next waypoint and set up a portal there
  this.makeNextPortalAtWaypoint = function () {
    waypointIndex++;

    let waypointList, targetArea, waypoint;

    // Get waypoints for this act
    switch (me.act) {
      case 1:
        waypointList = [3, 4, 5, 6, 27, 29, 32, 35];
        break;
      case 2:
        waypointList = [48, 42, 57, 43, 44, 52, 74, 46];
        break;
      case 3:
        waypointList = [76, 77, 78, 79, 80, 81, 83, 101];
        break;
      case 4:
        waypointList = [106, 107];
        break;
      case 5:
        waypointList = [111, 112, 113, 115, 123, 117, 118, 129];
        break;
    }

    if (waypointIndex < waypointList.length) {
      targetArea = waypointList[waypointIndex];

      // Go to the next waypoint
      if (targetArea === 123) {
        // Protect Anya's portal by preventing the bot from activating the Halls of Pain waypoint
        Pather.journeyTo(targetArea);
        let preset = getPresetUnit(me.area, 2, 496);
        if (preset) {
          Pather.moveToUnit(preset);
        } else {
          return this.abortWaypoint();
        }
      } else {
        Pather.useWaypoint(targetArea);
      }

      // Make a secure portal near the waypoint
      waypoint = getUnit(2, "waypoint");
      if (waypoint && waypoint.area === me.area) {
        Pather.moveToUnit(waypoint);
        Attack.securePosition(me.x, me.y, 40, 500);
        Pather.moveToUnit(waypoint, 0, -5);
        Pather.makePortal();
        say(Pather.getAreaName(me.area) + " portal up. Say 'next' to advance to the next waypoint.");
        Attack.securePosition(me.x, me.y, 40, 1000);
      } else {
        return this.abortWaypoint();
      }
      // Return to town by using the waypoint, except when in Halls of Pain
      if (me.area !== 123) {
        Pather.useWaypoint(towns[me.act - 1]);
      } else {
        Pather.usePortal(null, me.name);
      }
      // Keep an eye on our TP scrolls
      if (Town.checkScrolls(518) < 5) {
        Town.fillTome(518);
      }
      // Return to the waypoint in town
      Pather.getWP(me.area);
    } else {
      // Last waypoint reached; go to the next act if possible
      if (me.act < 5) {
        let nextAct = me.act + 1;
        if (availableActs.indexOf(nextAct) !== -1) {
          say("Advancing to act " + nextAct + ".");
          this.changeAct(nextAct);
        } else {
          say("I don't have access to act " + nextAct + ". My available acts are: " + (availableActs.length > 1 ? availableActs.slice(0, (availableActs.length - 1)).join(", ") + " and " + availableActs[availableActs.length - 1] + "." : "1."));
        }
      } else {
        say("End of the line. If you're still missing a waypoint, say 'a1' up to 'a5' to switch acts.");
      }
    }

    return true;
  }

  // Start the bot in act 1
  this.changeAct(1);

  // Main loop that will process chat commands
  while (true) {
    if (commands.length > 0) {
      command = commands.shift();

      switch (command) {
        case "a1":
        case "a2":
        case "a3":
        case "a4":
        case "a5":
          this.changeAct(parseInt(command.charAt(1), 10));
          break;
        case "start":
          this.resetIndex();
        // This is supposed to fall through
        case "next":
          this.makeNextPortalAtWaypoint();
          break;
      }
    }

    delay(100);
  }
}
