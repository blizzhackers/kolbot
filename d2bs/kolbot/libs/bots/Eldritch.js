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

	if (Config.Eldritch.OpenChest) {
		let chest = getPresetUnit(me.area, 2, 455);

		if (chest) {
			Pather.moveToUnit(chest);

			let superChest = getUnit(2, 455);

			if (Misc.openChest(superChest)) {
				Pickit.pickItems();
			}
		}
	}

	if (Config.Eldritch.KillShenk) {
		Pather.moveTo(3876, 5130);
		Attack.kill(getLocaleString(sdk.locale.monsters.ShenktheOverseer));
	}

	if (Config.Eldritch.KillDacFarren) {
		Pather.moveTo(4478, 5108);
		Attack.kill(getLocaleString(sdk.locale.monsters.DacFarren));
	}

	return true;
}
