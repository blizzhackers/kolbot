/**
*	@filename	BaalHelper.js
*	@author		kolton
*	@desc		help the leading player in clearing Throne of Destruction and killing Baal
*/

function BaalHelper() {
	Config.BaalHelper.KillNihlathak && Loader.runScript("Nihlathak");
	Config.BaalHelper.FastChaos && Loader.runScript("FastDiablo");

	Town.goToTown(5);
	Town.doChores();
	Pather.useWaypoint(Config.RandomPrecast ? "random" : 129);
	Precast.doPrecast(true);

	if (Config.BaalHelper.SkipTP) {
		me.area !== 129 && Pather.useWaypoint(129);

		if (!Pather.moveToExit([130, 131], false)) throw new Error("Failed to move to WSK3.");

		let i;
		WSKLoop:
		for (i = 0; i < Config.BaalHelper.Wait; i += 1) {
			let party = getParty();

			if (party) {
				do {
					if ((!Config.Leader || party.name === Config.Leader) && party.area === 131) {
						break WSKLoop;
					}
				} while (party.getNext());
			}

			delay(1000);
		}

		if (i === Config.BaalHelper.Wait) throw new Error("Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Throne)");

		let entrance = Misc.poll(() => getUnit(5, 82), 1000, 200);
		entrance && Pather.moveTo(entrance.x > me.x ? entrance.x - 5 : entrance.x + 5, entrance.y > me.y ? entrance.y - 5 : entrance.y + 5);

		if (!Pather.moveToExit([130, 131], false)) throw new Error("Failed to move to WSK3.");
		if (!Pather.moveToExit(131, true)) throw new Error("Failed to move to Throne of Destruction.");
		if (!Pather.moveTo(15113, 5040)) D2Bot.printToConsole("path fail");
	} else {
		Pather.useWaypoint(109);
		Town.move("portalspot");
		let i;

		for (i = 0; i < Config.BaalHelper.Wait; i += 1) {
			if (Pather.getPortal(131, Config.Leader || null) && Pather.usePortal(131, Config.Leader || null)) {
				break;
			}

			delay(1000);
		}

		if (i === Config.BaalHelper.Wait) throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
	}

	if (Config.BaalHelper.DollQuit && getUnit(1, 691)) {
		print("Undead Soul Killers found.");

		return true;
	}

	Precast.doPrecast(false);
	Attack.clear(15);
	Common.Baal.clearThrone();
	if (!Common.Baal.clearWaves()) { throw new Error("Couldn't clear baal waves"); }

	if (Config.BaalHelper.KillBaal) {
		Pather.moveTo(15092, 5011);
		Precast.doPrecast(false);

		while (getUnit(1, 543)) {
			delay(500);
		}

		delay(1000);
		Pather.moveTo(15092, 5011);

		let portal = getUnit(2, 563);

		if (portal) {
			Pather.usePortal(null, null, portal);
		} else {
			throw new Error("Couldn't find portal.");
		}

		Pather.moveTo(15134, 5923);
		Attack.kill(544); // Baal
		Pickit.pickItems();
	} else {
		while (true) {
			delay(500);
		}
	}

	return true;
}
