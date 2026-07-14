/**
*  @filename    BaalHelper.js
*  @author      kolton, theBGuy
*  @desc        help the leading player in clearing Throne of Destruction and killing Baal
*
*/

/**
 * @typedef {ScriptContext & { chatEvent: (nick: string, msg: string) => void }} BaalHelperContext
 */

const BaalHelper = new Runnable(
  /** @param {BaalHelperContext} ctx */
  function BaalHelper (ctx) {
    let quitFlag = false;
    
    const chatEvent = function (nick, msg) {
      if (nick === Config.Leader) {
        if ((Config.BaalHelper.DollQuit && msg === "Dolls found! NG.")
          || (Config.BaalHelper.SoulQuit && msg === "Souls found! NG.")) {
          quitFlag = true;
        }
      }
    };
    ctx.chatEvent = chatEvent;

    if (Config.BaalHelper.DollQuit || Config.BaalHelper.SoulQuit) {
      addEventListener("chatmsg", chatEvent);
    }

    if (Config.BaalHelper.SkipTP) {
      !me.inArea(sdk.areas.WorldstoneLvl2) && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);

      if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], false)) {
        throw new Error("Failed to move to WSK3.");
      }
      if (!Misc.poll(() => {
        if (quitFlag) throw new ScriptError("Burning Souls or Dolls found, ending script.");
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
        throw new ScriptError(
          "Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Throne)"
        );
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
      Pather.moveToEx(15113, 5040, { callback: function () {
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

      if (!Misc.poll(() => {
        if (Pather.getPortal(sdk.areas.ThroneofDestruction, Config.Leader || null)) {
          if (quitFlag) throw new ScriptError("Burning Souls or Dolls found, ending script.");
          if (Pather.usePortal(sdk.areas.ThroneofDestruction, Config.Leader || null)) {
            return true;
          }
        }

        return false;
      }, Time.minutes(Config.BaalHelper.Wait), 1000)) {
        throw new ScriptError("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
      }
    }

    if (Config.BaalHelper.DollQuit && Game.getMonster(sdk.monsters.SoulKiller)) {
      console.log("Undead Soul Killers found.");

      return true;
    }

    Precast.doPrecast(false);
    Attack.clear(15);
    Common.Baal.clearThrone();
    
    if (!Common.Baal.clearWaves()) {
      throw new Error("Couldn't clear baal waves");
    }

    if (Config.BaalHelper.KillBaal || Config.BaalHelper.HurtBaal) {
      Common.Baal.killBaal(Config.BaalHelper.HurtBaal);
    } else {
      Town.goToTown();
      // infinite loops are bad, TODO: add break condition, maybe a 5-10 minute timeout?
      while (true) {
        delay(500);
      }
    }

    return true;
  },
  {
    preAction: function () {
      Config.BaalHelper.KillNihlathak && Loader.runScript("Nihlathak");
      Config.BaalHelper.FastChaos && Loader.runScript("Diablo", () => Config.Diablo.Fast = true);

      if (getTickCount() - Town.lastChores > Time.minutes(1)) {
        Town.doChores();
      }

      Config.RandomPrecast && Precast.needOutOfTownCast()
        ? Precast.doRandomPrecast(true, (Config.BaalHelper.SkipTP ? sdk.areas.WorldstoneLvl2 : sdk.areas.Harrogath))
        : Precast.doPrecast(true);
      
      if (!Config.BaalHelper.SkipTP) {
        Town.goToTown(5);
        Town.move("portalspot");
      }
    },
    /** @param {BaalHelperContext} ctx */
    cleanup: function (ctx) {
      removeEventListener("chatmsg", ctx.chatEvent);
    }
  }
);

Object.defineProperty(BaalHelper, "startArea", {
  get: function() {
    if (Config.BaalHelper.KillNihlathak || !Config.BaalHelper.FastChaos) {
      return sdk.areas.Harrogath;
    }
    return sdk.areas.RiverofFlame;
  },
});
