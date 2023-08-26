/**
*  @filename    Coldworm.js
*  @author      kolton, edited by 13ack.Stab
*  @desc        kill Coldworm; optionally kill Beetleburst and clear Maggot Lair
*
*/

function Coldworm () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.FarOasis);
  Precast.doPrecast(true);

  // Beetleburst, added by 13ack.Stab
  if (Config.Coldworm.KillBeetleburst) {
    try {
      if (!Pather.moveToPresetMonster(me.area, sdk.monsters.preset.Beetleburst)) {
        throw new Error("Failed to move to Beetleburst");
      }
      Attack.kill(getLocaleString(sdk.locale.monsters.Beetleburst));
    } catch (e) {
      console.error(e); // not the main part of this script so simply log and move on
    }
  }

  if (!Pather.moveToExit([sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3], true)) {
    throw new Error("Failed to move to Coldworm");
  }

  if (Config.Coldworm.ClearMaggotLair) {
    Attack.clearLevel(Config.ClearType);
  } else {
    if (!Pather.moveToPresetObject(me.area, sdk.quest.chest.ShaftoftheHoradricStaffChest)) {
      throw new Error("Failed to move to Coldworm");
    }
    Attack.kill(sdk.monsters.ColdwormtheBurrower);
  }

  return true;
}
