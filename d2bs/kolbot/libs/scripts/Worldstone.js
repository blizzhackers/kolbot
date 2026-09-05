/**
*  @filename    Worldstone.js
*  @author      kolton, theBGuy
*  @desc        Clear Worldstone levels
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Worldstone = new Runnable(
  function Worldstone() {
    Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
    Precast.doPrecast(true);
    /**
    * Calc distances so we know whether to tp to town or not after clearing WSK1
    * - WP -> WSK3
    * - WSK1 -> WSK3
    * @todo Take into account walking vs tele and adjust distance check accordingly
    */
    
    /** @type {Exit[]} */
    let exits = getArea().exits || [];
    let WS1 = exits.find(t => t.target === sdk.areas.WorldstoneLvl1);
    let WS3 = exits.find(t => t.target === sdk.areas.WorldstoneLvl3);
    let wpToWS3 = WS3 ? WS3.distance : Infinity;
    let ws1ToWS3 = (WS1 && WS3) ? getDistance(WS1, WS3) : Infinity;

    Attack.clearLevel(Config.ClearType);
    Pather.moveToExit(sdk.areas.WorldstoneLvl1, true) && Attack.clearLevel(Config.ClearType);
    if (wpToWS3 < ws1ToWS3 + Pather.getDistanceToExit(me.area, sdk.areas.WorldstoneLvl2)) {
      console.log("Going to town to start from WSK2 waypoint.");
      Town.goToTown();
      Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
    } else {
      Pather.moveToExit(sdk.areas.WorldstoneLvl2, true);
    }

    Pather.moveToExit(sdk.areas.WorldstoneLvl3, true) && Attack.clearLevel(Config.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.WorldstoneLvl2
  }
);
