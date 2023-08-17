/**
*  @filename    BaalHelper.js
*  @author      kolton, theBGuy
*  @desc        help the leading player in clearing Throne of Destruction and killing Baal
*
*/

function BaalHelper () {
  include("core/Common/Baal.js");
  Config.BaalHelper.KillNihlathak && Loader.runScript("Nihlathak");
  Config.BaalHelper.FastChaos && Loader.runScript("Diablo", () => Config.Diablo.Fast = true);

  Town.goToTown(5);
  Town.doChores();
  Config.RandomPrecast && Precast.needOutOfTownCast()
    ? Precast.doRandomPrecast(true, sdk.areas.Harrogath)
    : Precast.doPrecast(true);

  if (Config.BaalHelper.SkipTP) {
    !me.inArea(sdk.areas.WorldstoneLvl2) && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);

    if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], false)) {
      throw new Error("Failed to move to WSK3.");
    }
    if (!Misc.poll(() => {
      let party = getParty();

      if (party) {
        do {
          if ((!Config.Leader || party.name === Config.Leader) && party.area === sdk.areas.ThroneofDestruction) {
            return true;
          }
        } while (party.getNext());
      }

      return false;
    }, Time.minutes(Config.BaalHelper.Wait), 1000)) {
      throw new Error("Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Throne)");
    }

    let entrance = Misc.poll(() => Game.getStairs(sdk.exits.preset.NextAreaWorldstone), 1000, 200);
    if (entrance) {
      let [x, y] = [
        entrance.x > me.x ? entrance.x - 5 : entrance.x + 5,
        entrance.y > me.y ? entrance.y - 5 : entrance.y + 5
      ];
      Pather.moveTo(x, y);
    }

    if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], false)) {
      throw new Error("Failed to move to WSK3.");
    }
    if (!Pather.moveToExit(sdk.areas.ThroneofDestruction, true)) {
      throw new Error("Failed to move to Throne of Destruction.");
    }
    Pather.moveToEx(15113, 5040, { callback: () => {
      if (Config.BaalHelper.DollQuit && Game.getMonster(sdk.monsters.SoulKiller)) {
        console.log("Undead Soul Killers found, ending script.");
        throw new ScriptError("Undead Soul Killers found, ending script.");
      }

      if (Config.BaalHelper.SoulQuit && Game.getMonster(sdk.monsters.BurningSoul1)) {
        console.log("Burning Souls found, ending script.");
        throw new ScriptError("Burning Souls found, ending script.");
      }
    } });
  } else {
    Town.goToTown(5);
    Town.move("portalspot");

    let quitFlag = false;

    const chatEvent = function (nick, msg) {
      if (nick === Config.Leader) {
        if ((Config.BaalHelper.DollQuit && msg === "Dolls found! NG.")
          || (Config.BaalHelper.SoulQuit && msg === "Souls found! NG.")) {
          quitFlag = true;
        }
      }
    };

    if (Config.BaalHelper.DollQuit || Config.BaalHelper.SoulQuit) {
      addEventListener("chatmsg", chatEvent);
    }

    try {
      if (!Misc.poll(() => {
        if (Pather.getPortal(sdk.areas.ThroneofDestruction, Config.Leader || null)) {
          if (quitFlag) throw new ScriptError("Burning Souls or Dolls found, ending script.");
          if (Pather.usePortal(sdk.areas.ThroneofDestruction, Config.Leader || null)) {
            return true;
          }
        }

        return false;
      }, Time.minutes(Config.BaalHelper.Wait), 1000)) {
        throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
      }
    } catch (e) {
      console.log(e.message);

      return true;
    } finally {
      removeEventListener("chatmsg", chatEvent);
    }
  }

  if (Config.BaalHelper.DollQuit && Game.getMonster(sdk.monsters.SoulKiller)) {
    print("Undead Soul Killers found.");

    return true;
  }

  Precast.doPrecast(false);
  Attack.clear(15);
  Common.Baal.clearThrone();
  
  if (!Common.Baal.clearWaves()) {
    throw new Error("Couldn't clear baal waves");
  }

  if (Config.BaalHelper.KillBaal) {
    Common.Baal.killBaal();
  } else {
    Town.goToTown();
    while (true) {
      delay(500);
    }
  }

  return true;
}
