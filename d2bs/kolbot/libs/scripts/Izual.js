/**
*  @filename    Izual.js
*  @author      kolton
*  @desc        kill Izual
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Izual = new Runnable(
  function Izual () {
    Pather.useWaypoint(sdk.areas.CityoftheDamned);
    Precast.doPrecast(true);

    if (!Pather.moveToPresetMonster(sdk.areas.PlainsofDespair, sdk.monsters.Izual)) {
      throw new Error("Failed to move to Izual.");
    }

    Attack.kill(sdk.monsters.Izual);
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.CityoftheDamned,
    bossid: sdk.monsters.Izual,
  }
);
