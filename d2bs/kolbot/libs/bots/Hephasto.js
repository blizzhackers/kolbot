/**
*	@filename	Hephasto.js
*	@author		kolton
*	@desc		kill Hephasto the Armorer
*/

function Hephasto() {
	Town.doChores();
	Pather.useWaypoint(107);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 2, 376)) {
		throw new Error("Failed to move to Hephasto");
	}

	try {
		Attack.kill(getLocaleString(1067)); // Hephasto The Armorer
	} catch (e) {
		print("Heph not found. Carry on");
	}
	Pickit.pickItems();

	if (Config.Hephasto.ClearRiver) {
		Attack.clearLevel(Config.Hephasto.ClearType);
	}

	return true;
}
