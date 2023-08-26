/**
*  @filename    Coldcrow.js
*  @author      njomnjomnjom
*  @desc        kill Coldcrow
*
*/

function Coldcrow () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.ColdPlains);
  Precast.doPrecast(true);

  if (!Pather.moveToExit(sdk.areas.CaveLvl1, true, false)) throw new Error("Failed to move to Cave");
  if (!Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Coldcrow, 0, 0, false)) {
    throw new Error("Failed to move to Coldcrow");
  }

  Attack.kill(getLocaleString(sdk.locale.monsters.Coldcrow));

  return true;
}
