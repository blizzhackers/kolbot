/**
*  @filename    Stormtree.js
*  @author      kolton
*  @desc        kill Stormtree
*
*/

const Stormtree = new Runnable(
  function Stormtree () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.LowerKurast);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.FlayerJungle, true)) {
      throw new Error("Failed to move to Stormtree");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.Stormtree));

    return true;
  },
  sdk.areas.LowerKurast,
  {
    bossid: getLocaleString(sdk.locale.monsters.Stormtree),
  }
);
