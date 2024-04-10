/**
*  @filename    Abaddon.js
*  @author      kolton
*  @desc        clear Abaddon
*
*/

const Abaddon = new Runnable(
  function Abaddon () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.FrigidHighlands);
    Precast.doPrecast(true);

    if (!Pather.moveToPresetObject(sdk.areas.FrigidHighlands, sdk.objects.RedPortal)
      || !Pather.usePortal(sdk.areas.Abaddon)) {
      throw new Error("Failed to move to Abaddon");
    }

    Attack.clearLevel(Config.ClearType);

    return true;
  },
  sdk.areas.FrigidHighlands
);
