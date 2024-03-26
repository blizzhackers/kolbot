/**
*  @filename    Baal.js
*  @author      kolton, YGM, theBGuy
*  @desc        clear Throne of Destruction and kill Baal
*
*/

function Baal () {
  include("core/Common/Baal.js");
  const announce = function () {
    let count, string, souls, dolls;
    let monster = Game.getMonster();

    if (monster) {
      count = 0;

      do {
        if (monster.attackable && monster.y < 5094) {
          monster.distance <= 40 && (count += 1);
          !souls && monster.classid === sdk.monsters.BurningSoul1 && (souls = true);
          !dolls && monster.classid === sdk.monsters.SoulKiller && (dolls = true);
        }
      } while (monster.getNext());
    }

    if (count > 30) {
      string = "DEADLY!!!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
    } else if (count > 20) {
      string = "Lethal!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
    } else if (count > 10) {
      string = "Dangerous!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
    } else if (count > 0) {
      string = "Warm" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
    } else {
      string = "Cool TP. No immediate monsters.";
    }

    if (souls) {
      string += " Souls ";
      dolls && (string += "and Dolls ");
      string += "in area.";
    } else if (dolls) {
      string += " Dolls in area.";
    }

    say(string);
  };

  Town.doChores();
  Config.RandomPrecast
    ? Precast.doRandomPrecast(true, sdk.areas.WorldstoneLvl2)
    : Pather.useWaypoint(sdk.areas.WorldstoneLvl2) && Precast.doPrecast(true);
  !me.inArea(sdk.areas.WorldstoneLvl2) && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);

  if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true)) {
    throw new Error("Failed to move to Throne of Destruction.");
  }

  Pather.moveToEx(15095, 5029, { callback: () => {
    if (Config.Baal.DollQuit && Game.getMonster(sdk.monsters.SoulKiller)) {
      say("Dolls found! NG.");
      throw new ScriptError("Dolls found! NG.");
    }

    if (Config.Baal.SoulQuit && Game.getMonster(sdk.monsters.BurningSoul1)) {
      say("Souls found! NG.");
      throw new ScriptError("Souls found! NG.");
    }
  } });

  if (Config.PublicMode) {
    announce();
    Pather.moveTo(15118, 5002);
    Pather.makePortal();
    say(Config.Baal.HotTPMessage);
    Attack.clear(15);
  }

  Common.Baal.clearThrone();

  if (Config.PublicMode) {
    Pather.moveTo(15118, 5045);
    Pather.makePortal();
    say(Config.Baal.SafeTPMessage);
    Precast.doPrecast(true);
  }

  if (!Common.Baal.clearWaves()) {
    throw new Error("Couldn't clear baal waves");
  }

  Config.Baal.KillBaal && Common.Baal.killBaal();

  return true;
}
