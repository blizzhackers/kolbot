/**
*  @filename    Pit.js
*  @author      kolton
*  @desc        clear Pit
*
*/

function Pit () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.BlackMarsh);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([sdk.areas.TamoeHighland, sdk.areas.PitLvl1], true)) {
    throw new Error("Failed to move to Pit level 1");
  }
  Config.Pit.ClearPit1 && Attack.clearLevel(Config.ClearType);

  if (!Pather.moveToExit(sdk.areas.PitLvl2, true, Config.Pit.ClearPath)) {
    throw new Error("Failed to move to Pit level 2");
  }
  Attack.clearLevel();

  return true;
}
