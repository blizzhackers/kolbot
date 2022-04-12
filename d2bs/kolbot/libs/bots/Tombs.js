/**
*	@filename	Tombs.js
*	@author		kolton, theBGuy
*	@desc		clear Tal Rasha's Tombs, optional kill duriel as well
*/

function Tombs() {
	Town.doChores();
	Pather.useWaypoint(46);
	Precast.doPrecast(true);

	for (let i = 66; i <= 72; i += 1) {
		try {
			if (!Pather.journeyTo(i, true)) {
				throw new Error("Failed to move to tomb");
			}
	
			Attack.clearLevel(Config.ClearType);
	
			if (Config.Tombs.KillDuriel && me.area === getRoom().correcttomb) {
				Pather.journeyTo(sdk.areas.DurielsLair) && Attack.kill(sdk.monsters.Duriel);
				Pather.journeyTo(sdk.areas.CanyonofMagic);
			}
	
			if (!Pather.moveToExit(46, true)) {
				throw new Error("Failed to move to Canyon");
			}
		} catch (e) {
			console.warn(e);
		}
	}

	return true;
}
