/**
*  @filename    Pit.js
*  @author      kolton
*  @desc        clear Pit
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Pit = new Runnable(
  function Pit () {
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
  },
  {
    startArea: sdk.areas.BlackMarsh
  }
);
