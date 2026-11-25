/**
*  @filename    ThreshSocket.js
*  @author      kolton
*  @desc        kill Thresh Socket
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var ThreshSocket = new Runnable(
  function ThreshSocket () {
    Pather.useWaypoint(sdk.areas.ArreatPlateau);
    Precast.doPrecast(true);

    // ArreatPlateau returns invalid size with getBaseStat('leveldefs', 112, ['SizeX', 'SizeX(N)', 'SizeX(H)'][me.diff]);
    // Could this be causing crashes here? Would it be better to go from crystal to Arreat instead?
    if (!Pather.moveToExit(sdk.areas.CrystalizedPassage, false)) throw new Error("Failed to move to Thresh Socket");

    Attack.kill(getLocaleString(sdk.locale.monsters.ThreshSocket));
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.ArreatPlateau,
    bossid: getLocaleString(sdk.locale.monsters.ThreshSocket),
  }
);
