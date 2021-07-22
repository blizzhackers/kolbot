/*
*	@filename	andariel.js
*	@author		isid0re
*	@desc		andariel quest.
*/

function andariel () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting andy');
	me.overhead("andy");

	if (me.normal && Misc.checkQuest(6, 1)) {
		Pather.changeAct();

		return true;
	}

	if (!Pather.checkWP(35)) {
		Pather.getWP(35);
	} else {
		Pather.useWaypoint(35);
	}

	Precast.doPrecast(true);
	Pather.moveToExit([36, 37], true);
	let resPenalty = [[0, 20, 50], [0, 40, 100]][me.gametype][me.diff];

	if (Check.Resistance().PR < 75 + me.getStat(46)) {
		Town.doChores();
		Town.buyPots(8, "Antidote"); // antidote
		Town.drinkPots();
		Pather.usePortal(37, me.name);
	}

	Precast.doPrecast(true);
	Pather.moveTo(22572, 9635);
	Pather.moveTo(22554, 9618);
	Pather.moveTo(22542, 9600);
	Pather.moveTo(22572, 9582);
	Pather.moveTo(22554, 9566);
	Pather.moveTo(22546, 9554);
	Config.MercWatch = false;
	Attack.killTarget("Andariel");
	delay(2000 + me.ping); // Wait for minions to die.
	Pickit.pickItems();
	Config.MercWatch = true;

	if (!me.andariel) {
		Pather.changeAct();
	}

	return true;
}
