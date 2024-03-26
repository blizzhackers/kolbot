/**
*  @filename    DiabloHelper.js
*  @author      kolton, theBGuy
*  @desc        help leading player in clearing Chaos Sanctuary and killing Diablo
*
*/

function DiabloHelper () {
  include("core/Common/Diablo.js");
  this.Leader = Config.Leader;
  Common.Diablo.waitForGlow = true;
  Common.Diablo.clearRadius = Config.DiabloHelper.ClearRadius;
  Town.doChores();
  const Worker = require("../modules/Worker");

  try {
    addEventListener("gamepacket", Common.Diablo.diabloLightsEvent);
    
    if (Config.DiabloHelper.SkipIfBaal) {
      let leadTick = getTickCount();

      Worker.runInBackground.leaderTracker = function () {
        if (Common.Diablo.done) return false;
        // check every 3 seconds
        if (getTickCount() - leadTick < 3000) return true;
        leadTick = getTickCount();

        // check again in another 3 seconds if game wasn't ready
        if (!me.gameReady) return true;
        if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");
        let party = getParty();

        if (party) {
          do {
            // Player is in Throne of Destruction or Worldstone Chamber
            if ([sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(party.area)) {
              if (Loader.scriptName() === "DiabloHelper") {
                throw new Error("Party leader is running baal");
              } else {
                // kill process
                return false;
              }
            }
          } while (party.getNext());
        }

        return true;
      };
    }

    Config.DiabloHelper.SafePrecast && Precast.needOutOfTownCast()
      ? Precast.doRandomPrecast(true, sdk.areas.PandemoniumFortress)
      : Precast.doPrecast(true);

    if (Config.DiabloHelper.SkipTP) {
      !me.inArea(sdk.areas.RiverofFlame) && Pather.useWaypoint(sdk.areas.RiverofFlame);

      if (!Pather.moveTo(7790, 5544)) throw new Error("Failed to move to Chaos Sanctuary");
      !Config.DiabloHelper.Entrance && Pather.moveTo(7774, 5305);

      if (!Misc.poll(() => {
        let party = getParty();

        if (party) {
          do {
            if ((!DiabloHelper.Leader || party.name === DiabloHelper.Leader)
              && party.area === sdk.areas.ChaosSanctuary) {
              return true;
            }
          } while (party.getNext());
        }

        Attack.clear(30, 0, false, Common.Diablo.sort);

        return false;
      }, Time.minutes(Config.DiabloHelper.Wait), 1000)) {
        throw new Error("Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Chaos)");
      }
    } else {
      Town.goToTown(4);
      Town.move("portalspot");
      if (!DiabloHelper.Leader) {
        DiabloHelper.Leader = Misc.autoLeaderDetect({
          destination: sdk.areas.ChaosSanctuary,
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
        throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
      }
    }

    Common.Diablo.initLayout();

    let diaTick = getTickCount();

    Worker.runInBackground.diaSpawned = function () {
      if (Common.Diablo.done) return false;
      // check every 1/4 second
      if (getTickCount() - diaTick < 250) return true;
      diaTick = getTickCount();

      if (Common.Diablo.diabloSpawned) throw new Error("Diablo spawned");

      return true;
    };

    try {
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
        ].includes(Misc.getPlayerArea(DiabloHelper.Leader))) {
          throw new Error("END");
        }
        return false;
      }, Time.minutes(2), 500);
    } catch (e) {
      let eMsg = e.message ? e.message : e;
      console.log(eMsg);

      if (eMsg === "END") {
        return true;
      }
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

    Attack.kill(sdk.monsters.Diablo);
    Pickit.pickItems();
  } catch (e) {
    console.error(e);
  } finally {
    Common.Diablo.done = true;
    removeEventListener("gamepacket", Common.Diablo.diabloLightsEvent);
  }

  return true;
}
