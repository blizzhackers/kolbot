/**
*  @filename    UndergroundPassage.js
*  @author      loshmi
*  @desc        Move and clear Underground passage level 2
*
*/

function UndergroundPassage() {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.StonyField);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([sdk.areas.UndergroundPassageLvl1, sdk.areas.UndergroundPassageLvl2], true)) {
    throw new Error("Failed to move to Underground passage level 2");
  }

  Attack.clearLevel();

  return true;
}
