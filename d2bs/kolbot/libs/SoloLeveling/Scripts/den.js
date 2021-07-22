/*
*	@filename	den.js
*	@author		isid0re
*	@desc		den quest
*/

function den () {
	print('ÿc9SoloLevelingÿc0: starting den');
	me.overhead("den");

	if (!Pather.checkWP(3)) {
		Pather.moveToExit(2, true);
		Pather.moveToExit(8, false, true);
		Pather.makePortal();
		Pather.getWP(3);
		Attack.clear(50);
		Pather.useWaypoint(1);
	}

	Town.doChores();

	if (!Pather.usePortal(2, me.name)) {
		Pather.moveToExit(2, true);
	}

	Precast.doPrecast(true);
	Attack.clear(50);
	Pather.moveToExit(8, true);

	while (me.area === 8) {
		Attack.clearLevel();
	}

	return true;
}
