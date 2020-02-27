/**
*	@filename	Nihlathak.js
*	@author		kolton
*	@desc		kill Nihlathak
*/

function Nihlathak() {
	Town.doChores();
	Pather.useWaypoint(123);
	Precast.doPrecast(false);

	let skillBackup1, skillBackup2;
	if (Config.Nihlathak.UseRedemption && me.classid === 3 && me.getSkill(124, 0)) {
		skillBackup1 = Config.AttackSkill[2];
		skillBackup2 = Config.AttackSkill[4];
		Config.AttackSkill[2] = 124;
		Config.AttackSkill[4] = 124;

		Attack.init();
	}

	if (!Pather.moveToExit(124, true)) {
		throw new Error("Failed to go to Nihlathak");
	}

	Pather.moveToPreset(me.area, 2, 462, 0, 0, false, true);

	if (Config.Nihlathak.ViperQuit && getUnit(1, 597)) {
		print("Tomb Vipers found.");

		return true;
	}

	Attack.kill(526); // Nihlathak

	if (skillBackup1) {
		Config.AttackSkill[2] = skillBackup1;
		Config.AttackSkill[4] = skillBackup2;

		Attack.init();
	}

	Pickit.pickItems();

	return true;
}
