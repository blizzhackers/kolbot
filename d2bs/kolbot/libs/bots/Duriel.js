/**
*	@filename	Duriel.js
*	@author		kolton
*	@desc		kill Duriel
*/

function Duriel () {
	this.killDuriel = function () {
		let target = Misc.poll(() => getUnit(sdk.unittype.Monster, sdk.monsters.Duriel), 1000, 200);

		if (!target) throw new Error("Duriel not found.");

		Config.MFLeader && Pather.makePortal() && say("kill " + 211);

		for (let i = 0; i < 300 && target.attackable; i += 1) {
			ClassAttack.doAttack(target);
			getDistance(me, target) <= 10 && Pather.moveTo(22638, me.y < target.y ? 15722 : 15693);
		}

		return target.dead;
	};

	if (me.area !== 46) {
		Town.doChores();
		Pather.useWaypoint(46);
	}

	Precast.doPrecast(true);

	if (!Pather.moveToExit(getRoom().correcttomb, true)) throw new Error("Failed to move to Tal Rasha's Tomb");
	if (!Pather.moveToPreset(me.area, 2, 152, -11, 3)) throw new Error("Failed to move to Orifice");

	me.hardcore && !me.sorceress && Attack.clear(5);

	let unit = getUnit(2, 100);

	if (Skill.useTK(unit)) {
		Misc.poll(function () {
			Skill.cast(sdk.skills.Telekinesis, 0, unit) && delay(100);
			return me.area === sdk.areas.DurielsLair;
		}, 1000, 200);
	}

	if (me.area !== sdk.areas.DurielsLair && !Pather.useUnit(2, 100, 73)) {
		Attack.clear(10);
		Pather.useUnit(2, 100, 73);
	}

	if (me.area !== sdk.areas.DurielsLair) throw new Error("Failed to move to Duriel");

	me.sorceress && me.classic ? this.killDuriel() : Attack.kill(sdk.monsters.Duriel);
	Pickit.pickItems();

	return true;
}
