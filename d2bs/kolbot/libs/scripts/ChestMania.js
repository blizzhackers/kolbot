/**
*  @filename    ChestMania.js
*  @author      kolton
*  @desc        Open chests in configured areas
*
*/

// todo - if we have run ghostsbusters before this then some of these areas don't need to be re-run

function ChestMania () {
  Town.doChores();

  Object.values(Config.ChestMania)
    .forEach(act => {
      for (let area of act) {
        if ([
          sdk.areas.BloodMoor, sdk.areas.RockyWaste,
          sdk.areas.SpiderForest, sdk.areas.OuterSteppes, sdk.areas.BloodyFoothills
        ].includes(area)) {
          // if we precast as soon as we step out of town it sometimes crashes - so do precast somewhere else first
          Precast.doRandomPrecast(false);
        }
        Pather.journeyTo(area);
        Precast.doPrecast(false);
        Misc.openChestsInArea(area);
      }

      Town.doChores();
    });

  return true;
}
