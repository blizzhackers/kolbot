/*
*	@filename	jail.js
*	@author		isid0re
*	@desc		jail runs for levels
*/

function jail () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting jail');
	me.overhead("jail");

	if (!Pather.checkWP(29)) {
		Pather.getWP(29);
	} else {
		Pather.useWaypoint(29);
	}

	Precast.doPrecast(true);
	Attack.clearLevel(0xF);

	return true;
}
