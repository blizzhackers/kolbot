/**
*  @filename    Abaddon.js
*  @author      kolton
*  @desc        clear Abaddon
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Abaddon = new Runnable(
  function Abaddon () {
    Pather.useWaypoint(sdk.areas.FrigidHighlands);
    Precast.doPrecast(true);

    if (!Pather.moveToPresetObject(sdk.areas.FrigidHighlands, sdk.objects.RedPortal)
      || !Pather.usePortal(sdk.areas.Abaddon)) {
      throw new Error("Failed to move to Abaddon");
    }

    Attack.clearLevel(Config.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.FrigidHighlands
  }
);
