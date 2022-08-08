/**
*  @filename    Summoner.js
*  @author      kolton
*  @desc        kill the Summoner
*
*/

function Summoner () {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
	Precast.doPrecast(true);

	if (Config.Summoner.FireEye) {
		try {
			if (!Pather.usePortal(null)) throw new Error("Failed to move to Fire Eye");
			Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.FireEye));
		} catch (e) {
			console.error(e);
		}
	}

	if (me.inArea(sdk.areas.PalaceCellarLvl3) && !Pather.usePortal(null)) throw new Error("Failed to move to Summoner");
	if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.Journal, -3, -3)) throw new Error("Failed to move to Summoner");

	Attack.clear(15, 0, sdk.monsters.TheSummoner);

	if (Loader.scriptName(1) === "Duriel") {
		let journal = Game.getObject(sdk.quest.chest.Journal);
		if (!journal) return true;

		Pather.moveToUnit(journal);
		journal.interact();
		delay(500);
		me.cancel();

		if (!Pather.usePortal(sdk.areas.CanyonofMagic)) return true;

		Loader.skipTown.push("Duriel");
	}

	return true;
}
