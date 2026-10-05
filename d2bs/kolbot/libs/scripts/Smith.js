/**
*  @filename    Smith.js
*  @author      kolton
*  @desc        kill the Smith
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Smith = new Runnable(
  function Smith () {
    Pather.useWaypoint(sdk.areas.OuterCloister);
    Precast.doPrecast(true);

    if (!Pather.moveToPresetObject(sdk.areas.Barracks, sdk.quest.chest.MalusHolder)) {
      throw new Error("Failed to move to the Smith");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.TheSmith));
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.OuterCloister,
    bossid: getLocaleString(sdk.locale.monsters.TheSmith),
  }
);
