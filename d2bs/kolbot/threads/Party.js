/**
*  @filename    Party.js
*  @author      kolton, theBGuy
*  @desc        handle party procedure ingame
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

// party thread specific
include("oog/ShitList.js");

function main () {
  Config.init();

  /** @type {string[][]} */
  let [shitList, scriptList] = [[], []];
  let myPartyId, player, currScript;
  let playerLevels = {};
  let partyTick = getTickCount();

  if (!me.gameserverip) {
    console.log("Shutting down party thread, it's not needed on single player");
    return true;
  }

  /**
   * Format the event message here to prevent repetitive code
   * @param {string[]} arr 
   * @param {Player | string} player
   * @param {string} [killer] 
   */
  const eventMsg = (arr, player, killer) => {
    try {
      typeof player === "string" && (player = getParty(player));

      if (!player || player.name === me.name) return "";
      return (arr
        .random()
        .format(
          ["$name", player.name],
          ["$level", player.level],
          ["$class", sdk.player.class.nameOf(player.classid)],
          ["$killer", killer]
        )
      );
    } catch (e1) {
      return "";
    }
  };

  const gameEvent = function (mode, param1, param2, name1, name2) {
    let msg = "";

    switch (mode) {
    case 0x02: // "%Name1(%Name2) joined our world. Diablo's minions grow stronger."
      if (Config.Greetings.length > 0) {
        msg = eventMsg(Config.Greetings, name1);
      }

      break;
    case 0x06: // "%Name1 was Slain by %Name2"
      if (Config.DeathMessages.length > 0) {
        msg = eventMsg(Config.DeathMessages, name1, name2);
      }

      break;
    }

    if (msg) {
      say(msg);
    }
  };

  if (Config.Greetings.length > 0 || Config.DeathMessages.length > 0) {
    addEventListener("gameevent", gameEvent);
  }

  let quitting = false;
  let partyCheck = false;

  const scriptEvent = function (msg) {
    if (!!msg && typeof msg === "string") {
      switch (msg) {
      case "hostileCheck":
        partyCheck = true;

        break;
      case "quit":
        console.debug("Quiting");
        quitting = true;

        break;
      default:
        let obj;

        try {
          obj = JSON.parse(msg);
        } catch (e) {
          return;
        }

        if (obj && obj.hasOwnProperty("currScript")) {
          currScript = obj.currScript;
        }

        break;
      }
    }
  };

  addEventListener("scriptmsg", scriptEvent);

  console.log("ÿc2Party thread loaded. Mode: " + (Config.PublicMode === 2 ? "Accept" : "Invite"));

  if (Config.ShitList || Config.UnpartyShitlisted) {
    shitList = ShitList.read();

    console.log(shitList.length + " entries in shit list.");
  }

  if (Config.PartyAfterScript) {
    scriptList = [];

    for (let i in Scripts) {
      if (Scripts.hasOwnProperty(i) && !!Scripts[i]) {
        scriptList.push(i);
      }
    }
  }

  // Main loop
  while (true) {
    if (quitting) {
      // we intercepted quit message to toolsthread, go ahead an shut down
      return true;
    }

    /**
     * @todo if we are already partied with everyone in game, then this doesn't need to keep checking unless an event happens
     * e.g. someone joins/leaves game or someone declares hostility
     * the exception to that is if we are running with Config.Congratulations, in which case we do need to constantly monitor changes
     */
    if (me.gameReady
      && (!Config.PartyAfterScript || scriptList.indexOf(currScript) > scriptList.indexOf(Config.PartyAfterScript))) {
      player = getParty();

      if (player) {
        myPartyId = player.partyid;

        while (player.getNext()) {
          switch (Config.PublicMode) {
          case 1: // Invite others
          case 3: // Invite others but never accept
            if (getPlayerFlag(me.gid, player.gid, sdk.player.flag.Hostile)) {
              if (Config.ShitList && shitList.indexOf(player.name) === -1) {
                say(player.name + " has been shitlisted.");
                shitList.push(player.name);
                ShitList.add(player.name);
              }

              if (player.partyflag === sdk.party.flag.Cancel) {
                clickParty(player, sdk.party.controls.InviteOrCancel); // cancel invitation
                delay(100);
              }

              break;
            }

            if (Config.ShitList && shitList.includes(player.name)) {
              break;
            }

            if (player.partyflag !== sdk.party.flag.Cancel
              && player.partyflag !== sdk.party.flag.Accept
              && player.partyid === sdk.party.NoParty) {
              clickParty(player, sdk.party.controls.InviteOrCancel);
              delay(100);
            }

            if (Config.PublicMode === 3) {
              break;
            }
            // eslint-disable-next-line no-fallthrough
          case 2: // Accept invites
            if (myPartyId === sdk.party.NoParty) {
              if (Config.Leader && player.name !== Config.Leader) {
                break;
              }

              if (player.partyflag === sdk.party.flag.Accept
                && (getTickCount() - partyTick >= 2000 || Config.FastParty)) {
                clickParty(player, sdk.party.controls.InviteOrCancel);
                delay(100);
              }
            }

            break;
          }

          if (Config.UnpartyShitlisted) {
            // Add new hostile players to temp shitlist, leader should have Config.ShitList set to true to update the permanent list.
            if (getPlayerFlag(me.gid, player.gid, sdk.player.flag.Hostile) && shitList.indexOf(player.name) === -1) {
              shitList.push(player.name);
            }

            if (shitList.includes(player.name) && myPartyId !== sdk.party.NoParty && player.partyid === myPartyId) {
              // Only the one sending invites should say this.
              if ([1, 3].includes(Config.PublicMode)) {
                say(player.name + " is shitlisted. Do not invite them.");
              }

              clickParty(player, sdk.party.controls.Leave);
              delay(100);
            }
          }

          if (Config.Congratulations.length > 0) {
            if (player.name !== me.name) {
              if (!playerLevels[player.name]) {
                playerLevels[player.name] = player.level;
              }

              if (player.level > playerLevels[player.name]) {
                let msg = eventMsg(Config.Congratulations, player);
                msg && say(msg);
                
                playerLevels[player.name] = player.level;
              }
            }
          }
        }
      }
    }

    delay(500);
  }
}
