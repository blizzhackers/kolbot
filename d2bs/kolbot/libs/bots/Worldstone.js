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
	// need to check distance from current position to wsk1 exit, and also distance from wsk2 exit to wsk3
	// compared to distance from wsk2 waypoint to wsk3 exit
	/**
	*  @cases:
	*   - Distance from current pos (wsk1) to wsk2 exit is greater > 100
	*      - Distance from wsk2 exit to wsk3 exit is greater than waypoint to exit -> go to town and use waypoint
	*      - Distance from wsk2 exit to wsk3 exit is less than waypoint to exit -> check by how much
	*         - 
	*/
	Pather.moveToExit([sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3], true) && Attack.clearLevel(Config.ClearType);

	return true;
}
