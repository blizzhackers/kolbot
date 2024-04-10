/**
*  @filename    WPGetter.js
*  @author      kolton, theBGuy
*  @desc        Get wps we don't have
*
*/

const WPGetter = new Runnable(
  function WPGetter () {
    Town.doChores();
    Town.goToTown();
    Pather.getWP(me.area);

    const highestAct = me.highestAct;
    let lastWP = sdk.areas.townOfAct((highestAct === 5 ? highestAct : highestAct + 1));
    lastWP === sdk.areas.Harrogath && (lastWP = me.baal ? sdk.areas.WorldstoneLvl2 : sdk.areas.AncientsWay);
    let wpsToGet = Pather.nonTownWpAreas
      .filter((wp) => wp < lastWP && wp !== sdk.areas.HallsofPain && !getWaypoint(Pather.wpAreas.indexOf(wp)));

    console.debug(wpsToGet);

    for (let wp of wpsToGet) {
      Pather.getWP(wp);
      if (me.checkScrolls(sdk.items.TomeofTownPortal) < 10) {
        Town.doChores();
      }
    }

    return true;
  }
);
