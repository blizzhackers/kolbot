/**
*	@filename	Eldritch.js
*	@author		kolton
*	@desc		kill Eldritch the Rectifier, optionally kill Shenk the Overseer, Dac Farren and open chest
*/

function Eldritch() {
	Town.doChores();
	Pather.useWaypoint(111);
	Precast.doPrecast(true);
	Pather.moveTo(3745, 5084);
	Attack.kill(getLocaleString(sdk.locale.monsters.EldritchtheRectifier));

	if (Config.Eldritch.OpenChest && !!getPresetUnit(me.area, 2, 455)) {
		if (Pather.moveNearPreset(sdk.areas.FrigidHighlands, 2, 455, 10)) {
			Misc.openChest(455) && Pickit.pickItems();
		}
	}

	if (Config.Eldritch.KillShenk && Pather.moveToExit(sdk.areas.BloodyFoothills, false) && Pather.moveTo(3876, 5130)) {
		Attack.kill(getLocaleString(sdk.locale.monsters.ShenktheOverseer));
	}

	if (Config.Eldritch.KillDacFarren && Pather.moveNearPreset(sdk.areas.BloodyFoothills, 1, sdk.monsters.preset.DacFarren, 10) && Pather.moveTo(4478, 5108)) {
		Attack.kill(getLocaleString(sdk.locale.monsters.DacFarren));
	}

	return true;
}
