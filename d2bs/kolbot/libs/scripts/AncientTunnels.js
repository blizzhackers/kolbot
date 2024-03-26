/**
*  @filename    AncientTunnels.js
*  @author      kolton
*  @desc        clear Ancient Tunnels
*
*/

function AncientTunnels () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.LostCity);
  Precast.doPrecast(true);

  try {
    if (Config.AncientTunnels.OpenChest && Pather.moveToPresetObject(me.area, sdk.objects.SuperChest)) {
      Misc.openChests(5) && Pickit.pickItems();
    }
  } catch (e) {
    console.error(e);
  }

  try {
    if (Config.AncientTunnels.KillDarkElder
      && Pather.moveToPresetMonster(me.area, sdk.monsters.preset.DarkElder)) {
      Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.DarkElder));
    }
  } catch (e) {
    console.error(e);
  }

  if (!Pather.moveToExit(sdk.areas.AncientTunnels, true)) throw new Error("Failed to move to Ancient Tunnels");
  Attack.clearLevel(Config.ClearType);

  return true;
}
