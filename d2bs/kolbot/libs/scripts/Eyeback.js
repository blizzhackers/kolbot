/**
*  @filename    Eyeback.js
*  @author      kolton, theBGuy
*  @desc        kill Eyeback the Unleashed
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Eyeback = new Runnable(
  function Eyeback () {
    Pather.useWaypoint(sdk.areas.ArreatPlateau);
    Precast.doPrecast(true);

    if (!Pather.moveToPresetMonster(sdk.areas.FrigidHighlands, sdk.monsters.preset.EyebacktheUnleashed)) {
      throw new Error("Failed to move to Eyeback the Unleashed");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.EyebacktheUnleashed));

    return true;
  },
  {
    startArea: sdk.areas.ArreatPlateau,
    bossid: getLocaleString(sdk.locale.monsters.EyebacktheUnleashed),
  }
);
