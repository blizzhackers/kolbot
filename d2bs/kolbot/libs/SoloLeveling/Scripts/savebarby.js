/*
*	@filename	savebarby.js
*	@author		isid0re
*	@desc		rescue barbies for runes for ancient pledge
*/

function savebarby () {
	let coords = [];
	let barbies = [];

	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting barbies');
	me.overhead("barbies");

	if (!Pather.checkWP(111)) {
		Pather.getWP(111);
	} else {
		Pather.useWaypoint(111);
	}

	Precast.doPrecast(true);
	barbies = getPresetUnits (me.area, 2, 473);

	if (!barbies) {
		return false;
	}

	for ( let cage = 0 ; cage < barbies.length ; cage += 1) {
		coords.push({
			x: barbies[cage].roomx * 5 + barbies[cage].x - 3, //Dark-f: x-3
			y: barbies[cage].roomy * 5 + barbies[cage].y
		});
	}

	for ( let k = 0 ; k < coords.length ; k += 1) {
		me.overhead("come on Barby let's go party... " + (k + 1) + "/" + barbies.length);
		Pather.moveToUnit(coords[k], 2, 0);
		let door = getUnit(1, 434);

		if (door) {
			Pather.moveToUnit(door, 1, 0);

			for (let i = 0; i < 20 && door.hp; i += 1) {
				Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), door);
			}
		}

		delay(1500 + me.ping);
	}

	Town.npcInteract("qual_kehk");

	return true;
}
