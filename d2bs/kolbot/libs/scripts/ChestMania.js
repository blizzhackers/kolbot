/**
*  @filename    ChestMania.js
*  @author      kolton, theBGuy
*  @desc        Open chests in configured areas
*
*/

// todo - if we have run ghostsbusters before this then some of these areas don't need to be re-run

function ChestMania () {
  Town.doChores();
  const nextToTown = [
    sdk.areas.BloodMoor,
    sdk.areas.RockyWaste,
    sdk.areas.SpiderForest,
    sdk.areas.OuterSteppes,
    sdk.areas.BloodyFoothills
  ];

  Object.values(Config.ChestMania)
    .forEach(function (act) {
      for (let area of act) {
        if (nextToTown.includes(area)) {
          // if we precast as soon as we step out of town it sometimes crashes - so do precast somewhere else first
          Precast.doRandomPrecast(false);
        }
        try {
          Pather.journeyTo(area);
          Precast.doPrecast(false);
          Misc.openChestsInArea(area);
        } catch (e) {
          console.error(e);
        }
      }

      Town.doChores();
    });

  return true;
}
