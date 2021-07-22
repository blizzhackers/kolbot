/*
*	@filename	cube.js
*	@author		isid0re
*	@desc		get cube item
*/

function cube () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting cube');
	me.overhead("cube");

	if (!Pather.checkWP(57)) {
		Pather.getWP(57);
	} else {
		Pather.useWaypoint(57);
	}

	Precast.doPrecast(true);
	Pather.moveToExit(60, true);
	Pather.moveToPreset(me.area, 2, 354);
	Attack.securePosition(me.x, me.y, 30, 3000, true);
	Quest.collectItem(549, 354);
	Quest.stashItem(549);

	return true;
}
