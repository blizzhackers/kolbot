/**
*  @filename    BaalAssistant.js
*  @author      kolton, YGM, theBGuy
*  @desc        Help or Leech Baal Runs.
*
*/

/**
 * @todo
 * - combine autobaal, baalhelper, and baalassistant into one script
 * - track leaders area so we can do silent follow
 * - override Misc.getShrinesInArea to end when we recieve safeCheck message
 */

function BaalAssistant () {
  include("core/Common/Baal.js");
  let Leader = Config.Leader;
  let Helper = Config.BaalAssistant.Helper;
  let firstAttempt = true;
  let quitFlag = false;
  let [hotCheck, safeCheck, baalCheck, ngCheck, baalIsDead] = [false, false, false, false, false];
  let [ShrineStatus, secondAttempt, throneStatus, killTracker] = [false, false, false, false];

  // convert all messages to lowercase
  Config.BaalAssistant.HotTPMessage.forEach((msg, i) => {
    Config.BaalAssistant.HotTPMessage[i] = msg.toLowerCase();
  });

  Config.BaalAssistant.SafeTPMessage.forEach((msg, i) => {
    Config.BaalAssistant.SafeTPMessage[i] = msg.toLowerCase();
  });

  Config.BaalAssistant.BaalMessage.forEach((msg, i) => {
    Config.BaalAssistant.BaalMessage[i] = msg.toLowerCase();
  });

  Config.BaalAssistant.NextGameMessage.forEach((msg, i) => {
    Config.BaalAssistant.NextGameMessage[i] = msg.toLowerCase();
  });

  const chatEvent = function (nick, msg) {
    if (nick === Leader) {
      if ((Config.BaalAssistant.DollQuit && msg === "Dolls found! NG.")
        || (Config.BaalAssistant.SoulQuit && msg === "Souls found! NG.")) {
        quitFlag = true;

        return;
      }

      msg = msg.toLowerCase();

      for (let i = 0; i < Config.BaalAssistant.HotTPMessage.length; i += 1) {
        if (msg.includes(Config.BaalAssistant.HotTPMessage[i])) {
          hotCheck = true;
          break;
        }
      }

      for (let i = 0; i < Config.BaalAssistant.SafeTPMessage.length; i += 1) {
        if (msg.includes(Config.BaalAssistant.SafeTPMessage[i])) {
          safeCheck = true;
          break;
        }
      }

      for (let i = 0; i < Config.BaalAssistant.BaalMessage.length; i += 1) {
        if (msg.includes(Config.BaalAssistant.BaalMessage[i])) {
          baalCheck = true;
          break;
        }
      }

      for (let i = 0; i < Config.BaalAssistant.NextGameMessage.length; i += 1) {
        if (msg.includes(Config.BaalAssistant.NextGameMessage[i])) {
          ngCheck = true;
          killTracker = true;
          break;
        }
      }
    }
  };

  const baalDeathEvent = function (bytes = []) {
    if (!bytes.length || bytes.length !== 2) return;

    if (bytes[0] === sdk.packets.recv.UniqueEvents && bytes[1] === 0x13) {
      baalIsDead = true;
    }
  };

  const checkParty = function () {
    for (let i = 0; i < Config.BaalAssistant.Wait; i += 1) {
      let partycheck = getParty();
      if (partycheck) {
        do {
          if (partycheck.area === sdk.areas.ThroneofDestruction) return false;
          if (partycheck.area === sdk.areas.RiverofFlame || partycheck.area === sdk.areas.ChaosSanctuary) return true;
        } while (partycheck.getNext());
      }

      delay(1000);
    }

    return false;
  };

  // Start
  const Worker = require("../modules/Worker");

  if (Leader) {
    if (!Misc.poll(() => Misc.inMyParty(Leader), Time.seconds(30), 1000)) {
      throw new Error("BaalAssistant: Leader not partied");
    }
  }

  try {
    addEventListener("chatmsg", chatEvent);

    let killLeaderTracker = false;
    if (!Leader && (Config.BaalAssistant.KillNihlathak || Config.BaalAssistant.FastChaos)) {
      // run background auto detect so we don't miss messages while running add ons
      let leadTick = getTickCount();

      Worker.runInBackground.leaderTracker = function () {
        if (killLeaderTracker || killTracker) return false;
        // check every 3 seconds
        if (getTickCount() - leadTick < 3000) return true;
        leadTick = getTickCount();

        // check again in another 3 seconds if game wasn't ready
        if (!me.gameReady) return true;
        if (Misc.getPlayerCount() <= 1) return false;

        let party = getParty();

        if (party) {
          do {
            // Player is in Throne of Destruction or Worldstone Chamber
            if ([sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(party.area)) {
              Leader = party.name;
              console.log(sdk.colors.DarkGold + "Autodected " + Leader);
              return false;
            }
          } while (party.getNext());
        }

        return true;
      };
    }

    Config.BaalAssistant.KillNihlathak && Loader.runScript("Nihlathak");
    Config.BaalAssistant.FastChaos && Loader.runScript("Diablo", () => Config.Diablo.Fast = true);

    Town.goToTown(5);
    Town.doChores();

    if (Leader
      || (Leader = Misc.autoLeaderDetect({
        destination: sdk.areas.WorldstoneLvl3,
        quitIf: (area) => [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(area)
      }))
      || (Leader = Misc.autoLeaderDetect({
        destination: sdk.areas.ThroneofDestruction,
        quitIf: (area) => [sdk.areas.WorldstoneChamber].includes(area)
      }))) {
      print("ÿc<Leader: " + Leader);
      killLeaderTracker = true;

      try {
        let ngTick = getTickCount();

        Worker.runInBackground.ngTracker = function () {
          if (killTracker) return false;
          // check every 3 seconds
          if (getTickCount() - ngTick < 3000) return true;
          ngTick = getTickCount();

          // check again in another 3 seconds if game wasn't ready
          if (!me.gameReady) return true;
          if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");
          // sometimes worker seems to continue running for a bit even after script ends - so check that we are still in the right script
          if (Loader.scriptName() !== "BaalAssistant") return false;
          
          if (ngCheck) {
            killTracker = true;
            throw "NG";
          }

          return true;
        };

        if (Config.LifeChicken <= 0) {
          let deadTick = getTickCount();

          Worker.runInBackground.deathTracker = function () {
            if (killTracker) return false;
            // check every 3 seconds
            if (getTickCount() - deadTick < 3000) return true;
            deadTick = getTickCount();

            // check again in another 3 seconds if game wasn't ready
            if (!me.gameReady) return true;
            
            if (me.dead) {
              console.log("I died");
              me.revive();
              delay(500);

              if (me.inTown) {
                Town.move("portalspot");
                baalCheck
                  ? Pather.usePortal(sdk.areas.WorldstoneChamber, null)
                  : Pather.usePortal(sdk.areas.ThroneofDestruction, null);
              }
            }

            return true;
          };
        }

        while (Misc.inMyParty(Leader)) {
          if (!secondAttempt && !safeCheck && !baalCheck
            && !ShrineStatus && !!Config.BaalAssistant.GetShrine
            && me.inArea(sdk.areas.Harrogath)) {
            if (!!Config.BaalAssistant.GetShrineWaitForHotTP) {
              Misc.poll(() => hotCheck, Time.seconds(Config.BaalAssistant.Wait), 1000);

              if (!hotCheck) {
                print("ÿc1Leader didn't tell me to start hunting for an experience shrine.");
                ShrineStatus = true;
              }
            }

            // don't waste time looking for seal if party is already killing baal, he'll be dead by the time we find one
            if (!ShrineStatus && !baalCheck) {
              Pather.useWaypoint(sdk.areas.StonyField);
              Precast.doPrecast(true);
              let i;

              for (i = sdk.areas.StonyField; i > sdk.areas.RogueEncampment; i -= 1) {
                if (safeCheck) {
                  break;
                }
                if (Misc.getShrinesInArea(i, sdk.shrines.Experience, true)) {
                  break;
                }
              }

              if (!safeCheck) {
                if (i === sdk.areas.RogueEncampment) {
                  Town.goToTown();
                  Pather.useWaypoint(sdk.areas.DarkWood);
                  Precast.doPrecast(true);

                  for (i = sdk.areas.DarkWood; i < sdk.areas.DenofEvil; i += 1) {
                    if (safeCheck) {
                      break;
                    }
                    if (Misc.getShrinesInArea(i, sdk.shrines.Experience, true)) {
                      break;
                    }
                  }
                }
              }
            }

            Town.goToTown(5);
            ShrineStatus = true;
          }

          if (firstAttempt && !secondAttempt && !safeCheck
            && !baalCheck && !me.inArea(sdk.areas.ThroneofDestruction)
            && !me.inArea(sdk.areas.WorldstoneChamber)) {
            !!Config.RandomPrecast
              ? Precast.doRandomPrecast(true, sdk.areas.WorldstoneLvl2)
              : Pather.useWaypoint(sdk.areas.WorldstoneLvl2) && Precast.doPrecast(true);
          }

          if (!me.inArea(sdk.areas.ThroneofDestruction) && !me.inArea(sdk.areas.WorldstoneChamber)) {
            if (Config.BaalAssistant.SkipTP) {
              if (firstAttempt && !secondAttempt) {
                !me.inArea(sdk.areas.WorldstoneLvl2) && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
                if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], false)) {
                  throw new Error("Failed to move to WSK3.");
                }

                checkParty();
                let entrance = Misc.poll(() => Game.getStairs(sdk.exits.preset.NextAreaWorldstone), 1000, 200);
                if (entrance) {
                  let [x, y] = [
                    entrance.x > me.x ? entrance.x - 5 : entrance.x + 5,
                    entrance.y > me.y ? entrance.y - 5 : entrance.y + 5
                  ];
                  Pather.moveTo(x, y);
                }

                if (!Pather.moveToExit(sdk.areas.WorldstoneLvl3, true) || !Pather.moveTo(15118, 5002)) {
                  throw new Error("Failed to move to Throne of Destruction.");
                }

                Pather.moveToEx(15095, 5029, { callback: () => {
                  if (Config.BaalAssistant.DollQuit && Game.getMonster(sdk.monsters.SoulKiller)) {
                    console.log("Undead Soul Killers found, ending script.");
                    throw new ScriptError("Undead Soul Killers found, ending script.");
                  }

                  if (Config.BaalAssistant.SoulQuit && Game.getMonster(sdk.monsters.BurningSoul1)) {
                    console.log("Burning Souls found, ending script.");
                    throw new ScriptError("Burning Souls found, ending script.");
                  }
                } });

                Pather.moveTo(15118, 5002);
                Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);

                secondAttempt = true;
                safeCheck = true;
              } else {
                if (me.inTown) {
                  Town.move("portalspot");
                  Pather.usePortal(sdk.areas.ThroneofDestruction, null);
                  Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);
                }
              }
            } else {
              if (firstAttempt && !secondAttempt) {
                !me.inArea(sdk.areas.Harrogath) && Pather.useWaypoint(sdk.areas.Harrogath);
                Town.move("portalspot");

                if (Config.BaalAssistant.WaitForSafeTP
                  && !Misc.poll(() => safeCheck, Time.seconds(Config.BaalAssistant.Wait), 1000)) {
                  throw new Error("No safe TP message.");
                }

                if ((Config.BaalAssistant.SoulQuit || Config.BaalAssistant.DollQuit) && quitFlag) {
                  throw new ScriptError("Burning Souls or Undead Soul Killers found, ending script.");
                }

                if (!Misc.poll(
                  () => Pather.usePortal(sdk.areas.ThroneofDestruction, null),
                  Time.seconds(Config.BaalAssistant.Wait),
                  1000
                )) {
                  throw new Error("No portals to Throne.");
                }

                if ((Config.BaalAssistant.SoulQuit
                  && Game.getMonster(sdk.monsters.BurningSoul1))
                  || (Config.BaalAssistant.DollQuit && Game.getMonster(sdk.monsters.SoulKiller))) {
                  throw new ScriptError("Burning Souls or Undead Soul Killers found, ending script.");
                }

                Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);
                secondAttempt = true;
                safeCheck = true;
              } else {
                if (me.inTown) {
                  Town.move("portalspot");
                  Pather.usePortal(sdk.areas.ThroneofDestruction, null);
                  Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);
                }
              }
            }
          }

          if (safeCheck && !baalCheck && me.inArea(sdk.areas.ThroneofDestruction)) {
            if (!baalCheck && !throneStatus) {
              if (Helper) {
                Attack.clear(15);
                Common.Baal.clearThrone();
                Pather.moveTo(15094, me.paladin ? 5029 : 5038);
                Precast.doPrecast(true);
              }

              let tick = getTickCount();

              MainLoop: while (true) {
                if (Helper) {
                  if (getDistance(me, 15094, me.paladin ? 5029 : 5038) > 3) {
                    Pather.moveTo(15094, me.paladin ? 5029 : 5038);
                  }
                }

                if (!Game.getMonster(sdk.monsters.ThroneBaal)) {
                  break;
                }

                switch (Common.Baal.checkThrone(Helper)) {
                case 1:
                  Helper && Attack.clear(40);
                  tick = getTickCount();

                  break;
                case 2:
                  Helper && Attack.clear(40);
                  tick = getTickCount();

                  break;
                case 4:
                  Helper && Attack.clear(40);
                  tick = getTickCount();

                  break;
                case 3:
                  Helper && Attack.clear(40) && Common.Baal.checkHydra();
                  tick = getTickCount();

                  break;
                case 5:
                  if (Helper) {
                    Attack.clear(40);
                  } else {
                    while ([sdk.monsters.ListerTheTormenter, sdk.monsters.Minion1, sdk.monsters.Minion2]
                      .map((unitId) => Game.getMonster(unitId))
                      .filter(Boolean).some((unit) => unit.attackable)) {
                      delay(1000);
                    }

                    delay(1000);
                  }

                  break MainLoop;
                default:
                  if (getTickCount() - tick < 7e3) {
                    if (me.paladin && me.getState(sdk.states.Poison)
                      && Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right)) {
                      break;
                    }
                  }

                  if (Helper && !Common.Baal.preattack()) {
                    delay(100);
                  }

                  break;
                }
                delay(10);
              }
              throneStatus = true;
              baalCheck = true;
            }
          }

          if ((throneStatus || baalCheck)
            && Config.BaalAssistant.KillBaal
            && me.inArea(sdk.areas.ThroneofDestruction)) {
            Helper ? Pather.moveTo(15090, 5008) && delay(2000) : Pather.moveTo(15090, 5010);
            Precast.doPrecast(true);
            !Helper && addEventListener("gamepacket", baalDeathEvent);

            while (Game.getMonster(sdk.monsters.ThroneBaal)) {
              delay(500);
            }

            let portal = Game.getObject(sdk.objects.WorldstonePortal);

            if (portal) {
              delay((Helper ? 1000 : 4000));
              Pather.usePortal(null, null, portal);
            } else {
              throw new Error("Couldn't find portal.");
            }

            if (Helper) {
              delay(1000);
              Pather.moveTo(15134, 5923);
              Attack.kill(sdk.monsters.Baal);
              Pickit.pickItems();
            } else {
              Pather.moveTo(15177, 5952);
              let baal = Game.getMonster(sdk.monsters.Baal);
              
              while (!!baal && baal.attackable && !baalIsDead) {
                delay(1000);
              }
            }

          } else {
            // how to accurately know when to end script in the instance of no ngCheck
            // listen for baal death packet maybe?
            while (!ngCheck && !baalIsDead) {
              delay(500);
            }
          }

          delay(500);
        }
      } catch (e) {
        console.error(e);
      } finally {
        killTracker = true;
      }
    } else {
      throw new Error("Empty game.");
    }
  } finally {
    removeEventListener("chatmsg", chatEvent);
    removeEventListener("gamepacket", baalDeathEvent);
  }

  return true;
}
