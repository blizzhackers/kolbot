/**
*  @filename    AncientTunnels.js
*  @author      kolton
*  @desc        clear Ancient Tunnels
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var AncientTunnels = new Runnable(
  function AncientTunnels () {
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
        && !Attack.haveKilled(getLocaleString(sdk.locale.monsters.DarkElder))
        && Pather.moveToPresetMonster(me.area, sdk.monsters.preset.DarkElder)) {
        Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.DarkElder));
      }
    } catch (e) {
      console.error(e);
    }

    if (!Pather.moveToExit(sdk.areas.AncientTunnels, true)) throw new Error("Failed to move to Ancient Tunnels");
    Attack.clearLevel(Config.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.LostCity
  }
);
