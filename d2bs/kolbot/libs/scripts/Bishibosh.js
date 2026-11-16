/**
*  @filename    Bishibosh.js
*  @author      theBGuy
*  @desc        kill Bishibosh
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Bishibosh = new Runnable(
  function Bishibosh () {
    Pather.useWaypoint(sdk.areas.ColdPlains);
    Precast.doPrecast(true);

    Pather.moveToPresetMonster(sdk.areas.ColdPlains, sdk.monsters.preset.Bishibosh);
    Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Bishibosh));
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.ColdPlains,
    bossid: getLocaleString(sdk.locale.monsters.Bishibosh),
  }
);
