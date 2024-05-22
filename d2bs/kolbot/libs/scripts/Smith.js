/**
*  @filename    Smith.js
*  @author      kolton
*  @desc        kill the Smith
*
*/

const Smith = new Runnable(
  function Smith () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.OuterCloister);
    Precast.doPrecast(true);

    if (!Pather.moveToPresetObject(sdk.areas.Barracks, sdk.quest.chest.MalusHolder)) {
      throw new Error("Failed to move to the Smith");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.TheSmith));
    Pickit.pickItems();

    return true;
  },
  sdk.areas.OuterCloister,
  {
    bossid: getLocaleString(sdk.locale.monsters.TheSmith),
  }
);
