/**
*  @filename    Stormtree.js
*  @author      kolton
*  @desc        kill Stormtree
*
*/

const Stormtree = new Runnable(
  function Stormtree () {
    Pather.useWaypoint(sdk.areas.LowerKurast);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.FlayerJungle, true)) {
      throw new Error("Failed to move to Stormtree");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.Stormtree));

    return true;
  },
  {
    startArea: sdk.areas.LowerKurast,
    bossid: getLocaleString(sdk.locale.monsters.Stormtree),
  }
);
