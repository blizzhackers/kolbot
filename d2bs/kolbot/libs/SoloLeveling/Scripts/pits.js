/*
*	@filename	pits.js
*	@author		isid0re
*	@desc		pits A1 for MF and gold
*/

function pits () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting pits');
	me.overhead("pits");

	if (!Pather.checkWP(6)) {
		Pather.getWP(6);
	} else {
		Pather.useWaypoint(6);
	}

	Precast.doPrecast(true);

	if (!Pather.moveToExit([7, 12], true)) {
		print("ÿc9SoloLevelingÿc0: Failed to move to Pit level 1");
	}

	Attack.clearLevel();

	if (!Pather.moveToExit(16, true)) {
		print("ÿc9SoloLevelingÿc0: Failed to move to Pit level 2");
	}

	Attack.clearLevel();
	Misc.openChestsInArea(16);

	return true;
}
