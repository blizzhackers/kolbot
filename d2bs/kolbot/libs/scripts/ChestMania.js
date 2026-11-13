/**
*  @filename    ChestMania.js
*  @author      kolton, theBGuy
*  @desc        Open chests in configured areas
*
*/

// todo - if we have run ghostsbusters before this then some of these areas don't need to be re-run

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var ChestMania = new Runnable(
  function ChestMania () {
    Config.OpenChests._enabled = Config.OpenChests.Enabled;
    Config.OpenChests.Enabled = true;
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
  },
  {
    startArea: Object.values(Config.ChestMania).find((act) => act.length > 0)[0],
    /**
     * Restores Config.OpenChests.Enabled to its pre-run value.
     */
    cleanup: function () {
      Config.OpenChests.Enabled = Config.OpenChests._enabled;
      delete Config.OpenChests._enabled;
    }
  }
);
