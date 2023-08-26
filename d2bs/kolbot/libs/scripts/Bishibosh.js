/**
*  @filename    Bishibosh.js
*  @author      theBGuy
*  @desc        kill Bishibosh
*
*/

function Bishibosh () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.ColdPlains);
  Precast.doPrecast(true);

  Pather.moveToPresetMonster(sdk.areas.ColdPlains, sdk.monsters.preset.Bishibosh);
  Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Bishibosh));
  Pickit.pickItems();

  return true;
}
