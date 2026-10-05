/**
*  @filename    Radament.js
*  @author      kolton
*  @desc        kill Radament
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Radament = new Runnable(
  function Radament () {
    Pather.useWaypoint(sdk.areas.A2SewersLvl2);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.A2SewersLvl3, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.HoradricScrollChest)) {
      throw new Error("Failed to move to Radament");
    }

    Attack.kill(sdk.monsters.Radament);
    Pickit.pickItems();
    Misc.openChests(20);

    return true;
  },
  {
    startArea: sdk.areas.A2SewersLvl2,
    bossid: sdk.monsters.Radament,
  }
);
