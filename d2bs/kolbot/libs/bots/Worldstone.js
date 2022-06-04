/**
*  @filename    Worldstone.js
*  @author      kolton
*  @desc        Clear Worldstone levels
*
*/

function Worldstone() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);
	Pather.moveToExit(sdk.areas.WorldstoneLvl1, true) && Attack.clearLevel(Config.ClearType);
	// should we check the distance from current location to exit and maybe use tp to town instead if its far?
	Pather.moveToExit([sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3], true) && Attack.clearLevel(Config.ClearType);

	return true;
}
