/**
*  @filename    BaalHelper.js
*  @author      kolton, theBGuy
*  @desc        help the leading player in clearing Throne of Destruction and killing Baal
*
*/

function BaalHelper() {
	Config.BaalHelper.KillNihlathak && Loader.runScript("Nihlathak");
	Config.BaalHelper.FastChaos && Loader.runScript("Diablo", () => Config.Diablo.Fast = true);

	Town.goToTown(5);
	Town.doChores();
	Config.RandomPrecast && Precast.needOutOfTownCast() ? Precast.doRandomPrecast(true, sdk.areas.Harrogath) : Precast.doPrecast(true);

	if (Config.BaalHelper.SkipTP) {
		me.area !== sdk.areas.WorldstoneLvl2 && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);

		if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], false)) throw new Error("Failed to move to WSK3.");
		if (!Misc.poll(() => {
			let party = getParty();

			if (party) {
				do {
					if ((!Config.Leader || party.name === Config.Leader) && party.area === sdk.areas.ThroneofDestruction) {
						return true;
					}
				} while (party.getNext());
			}

			return false;
		}, minutes(Config.BaalHelper.Wait), 1000)) throw new Error("Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Throne)");

		let entrance = Misc.poll(() => getUnit(5, 82), 1000, 200);
		entrance && Pather.moveTo(entrance.x > me.x ? entrance.x - 5 : entrance.x + 5, entrance.y > me.y ? entrance.y - 5 : entrance.y + 5);

		if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], false)) throw new Error("Failed to move to WSK3.");
		if (!Pather.moveToExit(sdk.areas.ThroneofDestruction, true)) throw new Error("Failed to move to Throne of Destruction.");
		if (!Pather.moveTo(15113, 5040)) D2Bot.printToConsole("path fail");
	} else {
		Town.goToTown(5);
		Town.move("portalspot");

		if (!Misc.poll(() => {
			if (Pather.getPortal(sdk.areas.ThroneofDestruction, Config.Leader || null) && Pather.usePortal(sdk.areas.ThroneofDestruction, Config.Leader || null)) {
				return true;
			}

			return false;
		}, minutes(Config.BaalHelper.Wait), 1000)) throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
	}

	if (Config.BaalHelper.DollQuit && getUnit(1, 691)) {
		print("Undead Soul Killers found.");

		return true;
	}

	Precast.doPrecast(false);
	Attack.clear(15);
	Common.Baal.clearThrone();
	
	if (!Common.Baal.clearWaves()) {
		throw new Error("Couldn't clear baal waves");
	}

	if (Config.BaalHelper.KillBaal) {
		Common.Baal.killBaal();
	} else {
		while (true) {
			delay(500);
		}
	}

	return true;
}
