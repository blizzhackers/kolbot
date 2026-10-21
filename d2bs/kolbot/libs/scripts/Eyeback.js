/**
*  @filename    Eyeback.js
*  @author      kolton, theBGuy
*  @desc        kill Eyeback the Unleashed
*
*/

const Eyeback = new Runnable(
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
