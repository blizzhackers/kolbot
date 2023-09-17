/**
*  @filename    MFHelper.js
*  @author      kolton, theBGuy
*  @desc        help another player kill bosses or clear areas
*
*/

function MFHelper () {
  const startTime = getTickCount();
  /**
   * @todo We should be able to handle Diablo scripts then resume MFHelper, not sure how yet but doesn't make sense to have
   * helper just idle if leader does any of the a5 scripts before baal. I guess could re-order them in the configs but having
   * it broken up by act flows better
   */
  let player, playerAct, split;
  let lastPrecast;

  /** @type {{ task: string, msg: string, at: number, area: number }[]} */
  const taskList = [];
  const tasks = ["kill", "clearlevel", "clear", "quit", "cows", "council", "goto", "nextup"];

  /**
   * @param {string} name 
   * @param {string} msg 
   */
  function chatEvent (name, msg) {
    if (!msg) return;
    let msgShort = msg && msg.length ? msg.split(" ")[0] : "";
    if (!tasks.includes(msgShort)) return;

    if (!player) {
      // anything else we need to consider here?
      player = Misc.findPlayer(name);
    }

    if (player && name === player.name) {
      taskList.push({ task: msgShort, msg: msg, at: getTickCount(), area: player.area });
    }
  }

  addEventListener("chatmsg", chatEvent);
  Town.doChores();
  Town.move("portalspot");

  if (Config.Leader) {
    if (!Misc.poll(() => Misc.inMyParty(Config.Leader), 30e4, 1000)) {
      throw new Error("MFHelper: Leader not partied");
    }

    player = Misc.findPlayer(Config.Leader);
  }

  if (player) {
    if (!Misc.poll(() => player.area, 120 * 60, 100 + me.ping)) {
      throw new Error("Failed to wait for player area");
    }

    playerAct = Misc.getPlayerAct(Config.Leader);

    if (playerAct && playerAct !== me.act) {
      Town.goToTown(playerAct);
      Town.move("portalspot");
    }
  }

  // START
  while (true) {
    if (me.dead) {
      while (me.mode === sdk.player.mode.Death) {
        delay(3);
      }

      if (me.hardcore) {
        D2Bot.printToConsole(
          "(MFHelper) :: " + me.charname + " has died at level "
          + me.charlvl + ". Shutting down profile...",
          sdk.colors.D2Bot.Red
        );
        D2Bot.stop();
      }

      while (!me.inTown) {
        me.revive();
        delay(1000);
      }

      Town.move("portalspot");
      console.log("revived!");
    }

    if (player) {
      if (me.needHealing() && Town.heal()) {
        Town.move("portalspot");
      }

      // Finish MFHelper script if leader is running Diablo or Baal AND we've been running longer than 30s
      if ((getTickCount() - startTime > Time.seconds(30)) && [
        sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber
      ].includes(player.area)) {
        break;
      }

      if (taskList.length) {
        console.debug("Leader area :: " + player.area);

        if (taskList[0].task === "quit") return true;
        // check if any message is telling us to quit
        if (taskList.find(el => el.task === "quit")) return true;
        
        // check if any message is telling us that nextup is diablo/baal
        if (taskList.some(el => {
          if (el.task === "nextup") {
            let script = el.msg.split("nextup ")[1];

            if (script && ["Diablo", "Baal"].includes(script)) {
              console.log("ÿc4MFHelperÿc0: Ending script");
              return true;
            }
          }

          return false;
        })) return true;

        // handled pre-reqs, now perform normal checks
        let { task, msg, at, area } = taskList.shift();

        switch (task) {
        case "goto":
          try {
            // lets see if the task list contains any other goto messages, in case we were late
            {
              let gt = taskList.findIndex(el => el.task === "goto");
              if (gt > -1) {
                // alright there is another so lets see where we should actually be going
                for (let i = 0; i < gt - 1; i++) {
                  // feels hacky but this should remove all elements up to the next goto message, while preserving the order of list
                  ({ task, msg, at, area } = taskList.shift());
                }
              }
            }

            split = msg.substr(6);
            console.log("ÿc4MFHelperÿc0: Goto " + split);
            
            if (!!parseInt(split, 10)) {
              split = parseInt(split, 10);
            }

            Town.goToTown(split, true);
            Town.move("portalspot");
          } catch (townerror) {
            console.log(townerror);
          }

          break;
        case "nextup":
          split = msg.split("nextup ")[1];
          console.log("ÿc4MFHelperÿc0: NextUp " + split);

          break;
        case "cows":
          console.log("ÿc4MFHelperÿc0: Clear Cows");

          if (Misc.poll(() => {
            Town.goToTown(1) && Pather.usePortal(sdk.areas.MooMooFarm);
            return me.inArea(sdk.areas.MooMooFarm);
          }, Time.minutes(1), 500 + me.ping)) {
            include("core/Common/Cows.js");
            Precast.doPrecast(false);
            Common.Cows.clearCowLevel();
            delay(1000);
          } else {
            console.warn("Failed to use portal. Currently in area: " + me.area);
          }

          break;
        case "council":
          if (!me.inArea(sdk.areas.Travincal) && Town.goToTown(3)) {
            Town.move("portalspot");
            Misc.poll(() => Pather.usePortal(sdk.areas.Travincal, player.name), Time.seconds(15), 500 + me.ping);
          }
          console.log("ÿc4MFHelperÿc0: Kill Council");
          Attack.clearClassids(sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3);

          break;
        default:
          // alright first lets check how long its been since the command was given
          // this probably needs to be adjusted but for now 3 minutes on any of theses tasks is probably too long
          if (getTickCount() - at > Time.minutes(3)) continue;

          /**
           * @todo still think this section needs to be done better, we are using a snapshot of the player's area at the time
           * of the message but sometimes the area hasn't been updated yet, causing us to do dumb things like attempt to kill
           * while still in town. We can't just use the players area though because of towncheck/chicken. Feel like best solution
           * would be adding area into leaders message and just always parsing it from there
           */
          try {
            split = msg.split(task + " ")[1];
            if (parseInt(split, 10)) {
              split = parseInt(split, 10);
            }
          } catch (e) {
            console.warn(e.message || "Failed to get id from message split");
            break;
          }

          if (me.area !== area) {
            !me.inTown && Town.goToTown();

            if (me.act !== sdk.areas.actOf(area)) {
              Town.goToTown(sdk.areas.actOf(area));
              Town.move("portalspot");
            }

            String.isEqual(task, "clearlevel")
              ? (area = split)
              : (player.area !== area && !player.inTown) && (area = player.area);

            try {
              Misc.poll(() => Pather.usePortal(null, player.name), Time.seconds(15), 500 + me.ping);
            } catch (e) {
              console.warn(e.message || "Failed to take leader portal");
              continue;
            }
          }

          if (!me.inTown && me.area === area) {
            let forceCast = false;
            if (!lastPrecast || getTickCount() - lastPrecast > Time.minutes(2)) {
              (forceCast = true) && (lastPrecast = getTickCount());
            }
            Precast.doPrecast(forceCast);
          } else if (!me.inTown && !me.inArea(player.area)) {
            Town.goToTown(sdk.areas.actOf(player.area));
            continue;
          }

          switch (task) {
          case "kill":
            console.log("ÿc4MFHelperÿc0: Kill " + split);

            try {
              Attack.kill(split);
              Pickit.pickItems();
            } catch (killerror) {
              console.error(killerror);
            }

            break;
          case "clearlevel":
            try {
              console.log("ÿc4MFHelperÿc0: Clear Level " + getAreaName(split));

              if (me.area !== split) {
                Town.goToTown(sdk.areas.actOf(split));
                Town.move("portalspot");
                if (!Misc.poll(() => Pather.usePortal(split, player.name), Time.seconds(15), 500 + me.ping)) {
                  throw new Error("Failed to move to clearlevel area");
                }
              }
              Attack.clearLevel(Config.ClearType);
            } catch (killerror2) {
              console.error(killerror2);
            }

            break;
          case "clear":
            console.log("ÿc4MFHelperÿc0: Clear " + split);

            try {
              Attack.clear(15, 0, split);
            } catch (killerror2) {
              console.error(killerror2);
            }

            break;
          }

          if (!Pather.getPortal(sdk.areas.townOf(me.act)) || !Pather.usePortal(sdk.areas.townOf(me.act))) {
            Town.goToTown();
          }
        }
      }
    }

    delay(100);
  }

  return true;
}
