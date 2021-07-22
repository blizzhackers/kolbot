/*
*	@filename	shenk.js
*	@author		isid0re
*	@desc		shenk quest for sockets, wp's, and mf
*/

function shenk () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting shenk');
	me.overhead("shenk");

	if (!Pather.checkWP(111)) {
		Pather.getWP(111);
	} else {
		Pather.useWaypoint(111);
	}

	Precast.doPrecast(true);
	let Eldritch = getUnit(1, getLocaleString(22500));

	if (Eldritch && Attack.canAttack(Eldritch)) {// Eldritch the Rectifier
		Pather.moveTo(3745, 5084);
		Attack.killTarget(getLocaleString(22500));
		Pickit.pickItems();
	}

	Pather.moveTo(110, true);
	Pather.moveTo(3883, 5113);
	Attack.killTarget(getLocaleString(22435)); // Shenk the Overseer
	Pickit.pickItems();

	return true;
}
