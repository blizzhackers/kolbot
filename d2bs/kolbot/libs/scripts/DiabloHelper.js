/**
*  @filename    DiabloHelper.js
*  @author      kolton, theBGuy
*  @desc        help leading player in clearing Chaos Sanctuary and killing Diablo
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var DiabloHelper = new Runnable(
  function DiabloHelper () {
    Common.Diablo.waitForGlow = true;
    Common.Diablo.clearRadius = Config.DiabloHelper.ClearRadius;
    const Worker = require("../modules/Worker");

    let leader = Config.Leader;

    const leaderTracker = (function (ignoreDelay = false) {
      let leadTick = getTickCount();
          
      return function () {
        if (Common.Diablo.done) return false;
        // check every 3 seconds
        if (!ignoreDelay && getTickCount() - leadTick < 3000) {
          return true;
        }
        leadTick = getTickCount();

        // check again in another 3 seconds if game wasn't ready
        if (!me.gameReady) return true;
        if (Misc.getPlayerCount() <= 1) {
          throw new ScriptError("Empty game");
        }
        let party = getParty();

        if (party) {
          do {
            // Player is in Throne of Destruction or Worldstone Chamber
            if ([sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(party.area)) {
              throw new ScriptError("Leader is running baal");
            }
          } while (party.getNext());
        }

        return true;
      };
    })();

    const waitForPortal = function () {
      if (!leader) {
        leader = Misc.autoLeaderDetect({
          destination: sdk.areas.ChaosSanctuary,
          /**
           * @param {number} area
           * @returns {boolean}
           */
          quitIf: (area) => [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(area),
          timeout: Time.minutes(2)
        });
      }

      if (!Misc.poll(() => {
        if (Pather.getPortal(sdk.areas.ChaosSanctuary, Config.Leader || null)
              && Pather.usePortal(sdk.areas.ChaosSanctuary, Config.Leader || null)) {
          return true;
        }

        return false;
      }, Time.minutes(Config.DiabloHelper.Wait), 1000)) {
        console.error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
        throw new ScriptError("Player wait timed out");
      }
    };

    try {
      Common.Diablo.addLightsEventListener();
      
      if (Config.DiabloHelper.SkipIfBaal) {
        // start tracking leader - run once manually to initialize
        leaderTracker();
        Worker.runInBackground.leaderTracker = leaderTracker;
      }

      let portalCheck = Pather.getPortal(sdk.areas.ChaosSanctuary, Config.Leader || null);
      if (portalCheck) {
        console.log("Found portal to Chaos Sanctuary");
      }

      try {
        Common.Diablo.diaSpawnWatcher();
        Worker.runInBackground.diaSpawned = Common.Diablo.diaSpawnWatcher();
        
        Config.DiabloHelper.SafePrecast && Precast.needOutOfTownCast()
          ? Precast.doRandomPrecast(
            true,
            (Config.DiabloHelper.SkipTP && !portalCheck) ? sdk.areas.RiverofFlame : sdk.areas.PandemoniumFortress
          )
          : Precast.doPrecast(true);

        if (Config.DiabloHelper.SkipTP && !portalCheck) {
          !me.inArea(sdk.areas.RiverofFlame) && Pather.useWaypoint(sdk.areas.RiverofFlame);

          if (!Pather.moveTo(7790, 5544)) throw new ScriptError("Failed to move to Chaos Sanctuary");
          !Config.DiabloHelper.Entrance && Pather.moveTo(7774, 5305);

          if (!Misc.poll(() => {
            let party = getParty();

            if (party) {
              do {
                if ((!leader || party.name === leader)
                  && party.area === sdk.areas.ChaosSanctuary) {
                  return true;
                }
              } while (party.getNext());
            }

            Attack.clear(30, 0, false, Common.Diablo.sort);

            if (Misc.getPlayerCount() <= 1) {
              throw new ScriptError("Empty game");
            }

            return false;
          }, Time.minutes(Config.DiabloHelper.Wait), 1000)) {
            console.error("Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Chaos)");
            throw new ScriptError("Player wait timed out");
          }
        } else {
          Town.goToTown(4);
          Town.move("portalspot");
          waitForPortal();
        }
      } catch (e) {
        if (e instanceof ScriptError) {
          if (e.message === "Empty game" || e.message === "Leader is running baal" || e.message === "Player wait timed out") {
            throw e;
          }
          if (e.message === "Failed to move to Chaos Sanctuary") {
            Town.goToTown(4);
            Town.move("portalspot");
            waitForPortal();
          }
          if ((e.message === "Diablo spawned")) {
            Town.goToTown(4);
            Town.move("portalspot");
            if (!Pather.usePortal(sdk.areas.ChaosSanctuary, Config.Leader || null)) {
              throw new Error("Failed to use portal to Chaos Sanctuary after Diablo spawn");
            }
          }
        } else {
          console.error(e);
        }
      }

      Common.Diablo.initLayout();

      try {
        Common.Diablo.diaSpawnWatcher();
        
        if (Config.DiabloHelper.Entrance && Common.Diablo.starCoords.distance > Common.Diablo.entranceCoords.distance) {
          Attack.clear(35, 0, false, Common.Diablo.sort);
          Common.Diablo.followPath(Common.Diablo.entranceToStar);
        } else {
          Pather.moveTo(7774, 5305);
          Attack.clear(35, 0, false, Common.Diablo.sort);
        }

        Pather.moveTo(7774, 5305);
        Attack.clear(35, 0, false, Common.Diablo.sort);
        Common.Diablo.runSeals(Config.DiabloHelper.SealOrder, Config.DiabloHelper.OpenSeals);
        Common.Diablo.moveToStar();
        Misc.poll(() => {
          if (Common.Diablo.diabloSpawned) return true;
          if (Game.getMonster(sdk.monsters.Diablo)) return true;
          if ([
            sdk.areas.WorldstoneLvl3,
            sdk.areas.ThroneofDestruction,
            sdk.areas.WorldstoneChamber
          ].includes(Misc.getPlayerArea(leader))) {
            throw new ScriptError("Leader is running baal");
          }
          return false;
        }, Time.minutes(2), 500);
      } catch (e) {
        if (e instanceof ScriptError) {
          if (e.message === "Empty game" || e.message === "Leader is running baal") {
            throw e;
          }
        }
        console.error(e);
      }

      try {
        !Common.Diablo.diabloSpawned && (Common.Diablo.diaWaitTime += Time.minutes(1));
        console.log("Attempting to find Diablo");
        Common.Diablo.diabloPrep();
      } catch (error) {
        console.log("Diablo wasn't found");
        if (Config.DiabloHelper.RecheckSeals) {
          try {
            console.log("Rechecking seals");
            Common.Diablo.runSeals(Config.DiabloHelper.SealOrder, Config.DiabloHelper.OpenSeals);
            Misc.poll(() => Common.Diablo.diabloSpawned, Time.minutes(2), 500);
            Common.Diablo.diabloPrep();
          } catch (e2) {
            //
          }
        }
      }

      Config.DiabloHelper.HurtDiablo > 0
        ? Attack.hurt(sdk.monsters.Diablo, Config.DiabloHelper.HurtDiablo)
        : Attack.kill(sdk.monsters.Diablo);
      Pickit.pickItems();
    } catch (e) {
      console.error(e);
    } finally {
      delete Worker.runInBackground.leaderTracker;
      delete Worker.runInBackground.diaSpawned;
      
      Common.Diablo.done = true;
      Common.Diablo.removeLightsEventListener();
    }

    return true;
  },
  {
    startArea: sdk.areas.PandemoniumFortress
  }
);
