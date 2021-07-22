/*
*	@filename	baal.js
*	@author		isid0re
*	@desc		kill baal linked with baal wave skip
*/

function baal () {
	this.clearThrone = function () {
		let monsterList = [];
		let position = [15094, 5022, 15094, 5041, 15094, 5060, 15094, 5041, 15094, 5022];

		if (Config.AvoidDolls) {
			let monster = getUnit(1, 691);

			if (monster) {
				do {
					if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && Attack.checkMonster(monster) && Attack.skipCheck(monster)) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			if (monsterList.length) {
				Attack.clearList(monsterList);
			}
		}

		for (let location = 0; location < position.length; location += 2) {
			Pather.moveTo(position[location], position[location + 1]);
			Attack.clear(25);
		}
	};

	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting baal');
	me.overhead("baal");

	if (!Pather.checkWP(129)) {
		Pather.getWP(129);
	} else {
		Pather.useWaypoint(129);
	}

	Precast.doPrecast(true);
	Pather.moveToExit([130, 131], true);
	Pather.moveTo(15095, 5029);

	if (me.diff === 2 && getUnit(1, 691)) {
		print("ÿc9SoloLevelingÿc0: Dolls found! NG.");
		me.overhead("Dolls found! NG.");

		return true;
	}

	if (me.diff === 2 && getUnit(1, 641)) {
		print("ÿc9SoloLevelingÿc0: Souls found! NG.");
		me.overhead("Souls found! NG.");

		return true;
	}

	Town.doChores();
	Precast.doPrecast(true);
	Pather.usePortal(null, me.name);
	this.clearThrone();
	Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);

	while (true) {
		if (!getUnit(1, 543)) {
			break;
		}

		Attack.clear(40);
		delay(10 + me.ping);
	}

	Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
	Pickit.pickItems();

	Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
	Pickit.pickItems();
	Pather.moveTo(15090, 5008);
	delay(2500 + me.ping);
	Precast.doPrecast(true);

	while (getUnit(1, 543)) {
		delay(500 + me.ping);
	}

	if (SetUp.finalBuild === "Bumper") {
		print("ÿc9SoloLevelingÿc0: Bumper check triggered");

		return true;
	}

	let portal = getUnit(2, 563);

	if (portal) {
		Pather.usePortal(null, null, portal);
	} else {
		print("ÿc9SoloLevelingÿc0: Couldn't access portal.");
	}

	Pather.moveTo(15134, 5923);
	Attack.killTarget(544); // Baal
	Pickit.pickItems();

	return true;
}
