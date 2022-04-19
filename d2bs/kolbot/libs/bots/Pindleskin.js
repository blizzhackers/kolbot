/**
*	@filename	Pindleskin.js
*	@author		kolton
*	@desc		kill Pindleskin and optionally Nihlathak
*/

function Pindleskin() {
	Town.goToTown(Config.Pindleskin.UseWaypoint ? undefined : 5);
	Town.doChores();

	if (Config.Pindleskin.UseWaypoint) {
		Pather.useWaypoint(123);
		Precast.doPrecast(true);

		if (!Pather.moveToExit([122, 121], true)) {
			throw new Error("Failed to move to Nihlahak's Temple");
		}
	} else {
		Town.move(NPC.Anya);

		if (!Pather.getPortal(121) && me.getQuest(37, 1)) {
			let anya = getUnit(1, NPC.Anya);

			if (anya) {
				anya.openMenu();
				me.cancel();
			}
		}

		if (!Pather.usePortal(121)) throw new Error("Failed to use portal.");

		Precast.doPrecast(true);
	}

	Pather.moveTo(10058, 13234);

	try {
		Attack.kill(getLocaleString(sdk.locale.monsters.Pindleskin));
	} catch (e) {
		print(e);
	}

	if (Config.Pindleskin.KillNihlathak) {
		if (!Pather.moveToExit([122, 123, 124], true)) throw new Error("Failed to move to Halls of Vaught");

		Pather.moveToPreset(me.area, 2, 462, 10, 10);

		if (Config.Pindleskin.ViperQuit && getUnit(1, 597)) {
			console.log("Tomb Vipers found.");

			return true;
		}

		Config.Pindleskin.ClearVipers && Attack.clearList(Attack.getMob(597, 0, 20));

		Attack.kill(526); // Nihlathak
		Pickit.pickItems();
	}

	return true;
}
