/*
*	@filename	beetleburst.js
*	@author		isid0re
*	@desc		kill beetleburst for exp
*/

function beetleburst () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting beetleburst');

	if (!Pather.checkWP(43)) {
		Pather.getWP(43);
	} else {
		Pather.useWaypoint(43);
	}

	Precast.doPrecast(true);
	Pather.moveToPreset(me.area, 1, 747);
	Attack.clear(15, 0, getLocaleString(2882));

	return true;
}
