/**
*  @filename    Corpsefire.js
*  @author      kolton, theBGuy
*  @desc        kill Corpsefire and optionally clear Den of Evil
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Corpsefire = new Runnable(
  function Corpsefire () {
    Pather.useWaypoint(sdk.areas.ColdPlains);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.DenofEvil], true)
      || !Pather.moveToPresetMonster(sdk.areas.DenofEvil, sdk.monsters.preset.Corpsefire, { pop: true })
    ) {
      throw new Error("Failed to move to Corpsefire");
    }

    Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Corpsefire));
    Config.Corpsefire.ClearDen && Attack.clearLevel();

    return true;
  },
  {
    startArea: sdk.areas.ColdPlains,
    bossid: getLocaleString(sdk.locale.monsters.Corpsefire),
  }
);
