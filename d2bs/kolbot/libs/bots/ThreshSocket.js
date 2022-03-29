/**
*	@filename	ThreshSocket.js
*	@author		kolton
*	@desc		kill Thresh Socket
*/

function ThreshSocket() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.ArreatPlateau);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(sdk.areas.CrystalizedPassage, false)) {
		throw new Error("Failed to move to Thresh Socket");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.ThreshSocket));
	Pickit.pickItems();

	return true;
}
