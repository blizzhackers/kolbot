/**
*  @filename    UndergroundPassage.js
*  @author      loshmi
*  @desc        Move and clear Underground passage level 2
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var UndergroundPassage = new Runnable(
  function UndergroundPassage() {
    Pather.useWaypoint(sdk.areas.StonyField);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.UndergroundPassageLvl1, sdk.areas.UndergroundPassageLvl2], true)) {
      throw new Error("Failed to move to Underground passage level 2");
    }

    Attack.clearLevel();

    return true;
  },
  {
    startArea: sdk.areas.StonyField
  }
);
