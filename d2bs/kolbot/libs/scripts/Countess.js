/**
*  @filename    Countess.js
*  @author      kolton
*  @desc        kill The Countess and optionally kill Ghosts along the way
*
*/

function Countess () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.BlackMarsh);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([
    sdk.areas.ForgottenTower, sdk.areas.TowerCellarLvl1, sdk.areas.TowerCellarLvl2,
    sdk.areas.TowerCellarLvl3, sdk.areas.TowerCellarLvl4, sdk.areas.TowerCellarLvl5
  ], true)) throw new Error("Failed to move to Countess");

  let poi = Game.getPresetObject(me.area, sdk.objects.SuperChest);

  if (!poi) throw new Error("Failed to move to Countess (preset not found)");

  switch (poi.roomx * 5 + poi.x) {
  case 12565:
    Pather.moveTo(12578, 11043);
    break;
  case 12526:
    Pather.moveTo(12548, 11083);
    break;
  }

  Attack.clear(20, 0, getLocaleString(sdk.locale.monsters.TheCountess));
  Config.OpenChests.Enabled && Misc.openChestsInArea();

  return true;
}
