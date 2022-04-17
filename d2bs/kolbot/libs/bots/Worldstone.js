/**
*	@filename	Worldstone.js
*	@author		kolton
*	@desc		Clear Worldstone levels
*/

function Worldstone() {
	Town.doChores();
	Pather.useWaypoint(129);
	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);
	Pather.moveToExit(128, true) && Attack.clearLevel(Config.ClearType);
	// should we check the distance from current location to exit and maybe use tp to town instead if its far?
	Pather.moveToExit([129, 130], true) && Attack.clearLevel(Config.ClearType);

	return true;
}
