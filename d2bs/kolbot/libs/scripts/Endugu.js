/**
*  @filename    Endugu.js
*  @author      kolton, theBGuy
*  @desc        kill Witch Doctor Endugu
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Endugu = new Runnable(
  function Endugu () {
    Pather.useWaypoint(sdk.areas.FlayerJungle);
    Precast.doPrecast(true);

    const exits = [
      sdk.areas.FlayerDungeonLvl1,
      sdk.areas.FlayerDungeonLvl2,
      sdk.areas.FlayerDungeonLvl3
    ];

    if (!Pather.moveToExit(exits, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsBrainChest)) {
      throw new Error("Failed to move to Endugu");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.WitchDoctorEndugu));

    return true;
  },
  {
    startArea: sdk.areas.FlayerJungle,
    bossid: getLocaleString(sdk.locale.monsters.WitchDoctorEndugu),
  }
);
