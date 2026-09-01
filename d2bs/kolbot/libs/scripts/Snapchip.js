/**
*  @filename    Snapchip.js
*  @author      kolton
*  @desc        kill Snapchip and optionally clear Icy Cellar
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Snapchip = new Runnable(
  function Snapchip () {
    Pather.useWaypoint(sdk.areas.AncientsWay);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.IcyCellar, true)
      || !Pather.moveToPresetObject(me.area, sdk.objects.SmallSparklyChest)) {
      throw new Error("Failed to move to Snapchip Shatter");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.SnapchipShatter));
    Config.Snapchip.ClearIcyCellar && Attack.clearLevel(Config.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.AncientsWay
  }
);
