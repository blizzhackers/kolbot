/*
*	@filename	Tristram.js
*	@author		isid0re
*	@desc		rescue cain and leveling
*/

function tristram () {
	let spots = [
		[25176, 5128], [25175, 5145], [25171, 5159], [25166, 5178],
		[25173, 5192], [25153, 5198], [25136, 5189], [25127, 5167],
		[25120, 5148], [25101, 5136], [25119, 5106], [25121, 5080],
		[25119, 5061], [4933, 4363]
	];

	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting tristram');
	me.overhead("tristram");

	if (!Misc.checkQuest(4, 4) && !me.getItem(525)) { // missing task or key
		if (!me.getItem(524)) { // missing scroll
			if (!Pather.checkWP(6)) {
				Pather.getWP(6);
				Pather.useWaypoint(5);
			} else {
				Pather.useWaypoint(5);
			}

			Precast.doPrecast(true);

			if (!Pather.moveToPreset(5, 2, 30, 5, 5)) {
				print("ÿc9SoloLevelingÿc0: Failed to move to Tree of Inifuss");
			}

			Quest.collectItem(524, 30);
			Pickit.pickItems();
		}

		if (me.getItem(524)) {
			Town.npcInteract("akara");
		}
	}

	if (!Pather.checkWP(4)) {
		Pather.getWP(4);
	} else {
		Pather.useWaypoint(4);
	}

	Precast.doPrecast(true);
	Pather.moveToPreset(4, 2, 17);
	Attack.clear(20, 0x7); // kill rakanishu
	Pather.moveToPreset(4, 2, 17);

	try { // go to tristram
		for (let touch = 0; touch < 5; touch += 1) {
			for (let piece = 17; piece < 22; piece += 1) {
				let stone = getUnit(2, piece);

				if (stone) {
					Misc.openChest(stone);
					Attack.clear(10);
				}
			}
		}

		while (!Pather.usePortal(38)) {
			Attack.securePosition(me.x, me.y, 10, 1000);
		}
	} catch (err) {
		Pather.usePortal(38);
	}

	if (me.area === 38) {
		if (!me.tristram) {
			let gibbet = getUnit(2, 26);

			if (!Pather.moveToPreset(38, 2, 26, 0, 0, true, true)) {
				print("ÿc9SoloLevelingÿc0: Failed to move to Cain's Gibbet");
			}

			for (let x = 0; x < 5; x++) {
				Misc.openChest(gibbet);
			}

			Town.npcInteract("akara");
			Pather.usePortal(38, me.name);
		}

		Attack.clearLocations(spots);
	}

	return true;
}
