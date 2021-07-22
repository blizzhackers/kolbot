/*
*	@filename	izual.js
*	@author		isid0re
*	@desc		izual quest for skillpoints
*/

function izual () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting izual');
	me.overhead("izual");

	if (!Pather.checkWP(106)) {
		Pather.getWP(106);
	} else {
		Pather.useWaypoint(106);
	}

	Precast.doPrecast(true);

	if (!Misc.checkQuest(25, 1)) {
		Pather.moveToPreset(105, 1, 256);
		Attack.killTarget("Izual");
	}

	Town.npcInteract("tyrael");

	return true;
}
