/**
*  @filename    AncientTunnels.js
*  @author      kolton
*  @desc        clear Ancient Tunnels
*
*/

function AncientTunnels() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.LostCity);
	Precast.doPrecast(true);

	try {
		Config.AncientTunnels.OpenChest && Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.SuperChest) && Misc.openChests(5) && Pickit.pickItems();
	} catch (e) {
		console.error(e);
	}

	try {
		Config.AncientTunnels.KillDarkElder && Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.DarkElder) && Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.DarkElder));
	} catch (e) {
		console.error(e);
	}

	if (!Pather.moveToExit(sdk.areas.AncientTunnels, true)) throw new Error("Failed to move to Ancient Tunnels");
	Attack.clearLevel(Config.ClearType);

	return true;
}
