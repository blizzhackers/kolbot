/**
*  @filename    Corpsefire.js
*  @author      kolton
*  @desc        kill Corpsefire and optionally clear Den of Evil
*
*/

const Corpsefire = new Runnable(
  function Corpsefire () {
    Pather.useWaypoint(sdk.areas.ColdPlains);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.DenofEvil], true)
      || !Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Corpsefire, 0, 0, false, true)) {
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
