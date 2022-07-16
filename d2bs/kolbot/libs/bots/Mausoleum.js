/**
*  @filename    Mausoleum.js
*  @author      kolton
*  @desc        clear Mausoleum
*
*/

function Mausoleum() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.ColdPlains);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(sdk.areas.BurialGrounds, true)) throw new Error("Failed to move to Burial Grounds");

	if (Config.Mausoleum.KillBloodRaven) {
		Pather.moveToPreset(sdk.areas.BurialGrounds, sdk.unittype.Monster, sdk.monsters.preset.BloodRaven);
		Attack.kill(getLocaleString(sdk.locale.monsters.BloodRaven));
		Pickit.pickItems();
	}

	try {
		Pather.moveToExit(sdk.areas.Mausoleum, true) && Attack.clearLevel(Config.ClearType);
	} catch (e) {
		console.errorReport(e);
	}

	if (Config.Mausoleum.ClearCrypt) {
		// Crypt exit is... awkward
		if (!(Pather.moveToExit(sdk.areas.BurialGrounds, true) && Pather.moveToPreset(sdk.areas.BurialGrounds, 5, 6) && Pather.moveToExit(sdk.areas.Crypt, true))) {
			throw new Error("Failed to move to Crypt");
		}

		Attack.clearLevel(Config.ClearType);
	}

	return true;
}
