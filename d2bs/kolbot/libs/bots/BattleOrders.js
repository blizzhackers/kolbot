/**
*  @filename    BattleOrders.js
*  @author      kolton, jmichelsen
*  @desc        give or receive Battle Orders buff
*
*/

function BattleOrders () {
	this.checkForPlayers = function () {
		if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");
	};

	this.amTardy = function () {
		let party = getParty();

		AreaInfoLoop:
		while (true) {
			try {
				this.checkForPlayers();
			} catch (e) {
				if (Config.BattleOrders.Wait) {
					print("Waiting " + Config.BattleOrders.Wait + " seconds for other players...");

					while (getTickCount() - tick < Config.BattleOrders.Wait * 1000) {
						me.overhead("Waiting " + Math.round(((tick + (Config.BattleOrders.Wait * 1000)) - getTickCount()) / 1000) + " Seconds for other players");
						delay(1000);
					}

					this.checkForPlayers();
				}
			}

			if (party) {
				do {
					if (party.name !== me.name && party.area) {
						break AreaInfoLoop; // Can read player area
					}
				} while (party.getNext());
			}
		}

		if (party) {
			do {
				if ([39, 108, 131, 132].includes(party.area)) {
					// Player is in Throne of Destruction, Worldstone Chamber, Chaos Sanctuary, or Cows
					print("ÿc1I'm late to BOs. Moving on...");

					return true;
				}
			} while (party.getNext());
		}

		return false; // Not late; wait.
	};

	this.giveBO = function (list) {
		let failTimer = 60,
			tick = getTickCount();

		for (let i = 0; i < list.length; i += 1) {
			let unit = getUnit(0, list[i]);

			if (unit) {
				while (!unit.getState(32) && copyUnit(unit).x) {
					if (getTickCount() - tick >= failTimer * 1000) {
						showConsole();
						print("ÿc1BO timeout fail.");

						if (Config.BattleOrders.QuitOnFailure) {
							quit();
						}

						break;
					}

					Precast.doPrecast(true);
					delay(1000);
				}
			}
		}

		return true;
	};

	Town.doChores();

	try {
		Pather.useWaypoint(35, true); // catacombs
	} catch (wperror) {
		showConsole();
		print("ÿc1Failed to take waypoint.");
		Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

		return false;
	}

	Pather.moveTo(me.x + 6, me.y + 6);

	let tick = getTickCount(),
		failTimer = 60;

	MainLoop:
	while (true) {
		if (Config.BattleOrders.SkipIfTardy && this.amTardy()) {
			break;
		}

		switch (Config.BattleOrders.Mode) {
		case 0: // Give BO
			for (let i = 0; i < Config.BattleOrders.Getters.length; i += 1) {
				while (!Misc.inMyParty(Config.BattleOrders.Getters[i]) || !getUnit(0, Config.BattleOrders.Getters[i])) {
					if (getTickCount() - tick >= failTimer * 1000) {
						showConsole();
						print("ÿc1BO timeout fail.");

						if (Config.BattleOrders.QuitOnFailure) {
							quit();
						}

						break MainLoop;
					}

					delay(500);
				}
			}

			if (this.giveBO(Config.BattleOrders.Getters)) {
				break MainLoop;
			}

			break;
		case 1: // Get BO
			if (me.getState(32)) {
				delay(1000);

				break MainLoop;
			}

			if (getTickCount() - tick >= failTimer * 1000) {
				showConsole();
				print("ÿc1BO timeout fail.");
				Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

				break MainLoop;
			}

			break;
		}

		delay(500);
	}

	Pather.useWaypoint(1);

	if (Config.BattleOrders.Mode === 0 && Config.BattleOrders.Idle) {
		for (let i = 0; i < Config.BattleOrders.Getters.length; i += 1) {
			while (Misc.inMyParty(Config.BattleOrders.Getters[i])) {
				delay(500);
			}
		}
	}

	return true;
}
