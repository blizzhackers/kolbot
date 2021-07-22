/*
*	@filename	tombs.js
*	@author		isid0re
*	@desc		leveling in act 2 tombs
*/

function tombs () {
	print('ÿc9SoloLevelingÿc0: starting tombs');
	me.overhead("tombs");

	let tombID = [66, 67, 68, 69, 70, 71, 72];
	Town.townTasks();

	for (let number = 0; number < tombID.length; number += 1) {
		if (!Pather.checkWP(46)) {
			Pather.getWP(46);
		} else {
			Pather.useWaypoint(46);
		}

		Precast.doPrecast(true);

		if (Pather.moveToExit(tombID[number], true, true)) {
			me.overhead("Tomb #" + (number + 1));

			let gbox = getPresetUnit(me.area, 2, 397);
			let orifice = getPresetUnit(me.area, 2, 152);

			if (gbox) {
				Pather.moveToPreset(me.area, 2, 397);
			}

			if (orifice) {
				Pather.moveToPreset(me.area, 2, 152);
			}

			Attack.clear(50);
			Pickit.pickItems();
		}

		Town.goToTown();
	}

	return true;
}
