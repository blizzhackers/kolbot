/**
*  @filename    TristramLeech.js
*  @author      ToS/XxXGoD/YGM, theBGuy
*  @desc        Tristram Leech (Helper)
*
*/

function TristramLeech() {
	let whereisleader, leader;

	Town.doChores();
	Town.goToTown(1);
	Town.move("portalspot");

	if (Config.Leader) {
		leader = (Config.Leader || Config.TristramLeech.Leader);
		if (!Misc.poll(() => Misc.inMyParty(leader), 30e3, 1000)) throw new Error("TristramLeech: Leader not partied");
	}

	!leader && (leader = Misc.autoLeaderDetect({
		destination: sdk.areas.Tristram,
		quitIf: (area) => [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(area),
		timeout: Time.minutes(5)
	}));

	if (leader) {
		const Worker = require('../modules/Worker');

		let leadTick = getTickCount();
		let killLeaderTracker = false;

		Worker.runInBackground.leaderTracker = function () {
			if (killLeaderTracker) return false;
			// check every 3 seconds
			if (getTickCount() - leadTick < 3000) return true;
			leadTick = getTickCount();

			// check again in another 3 seconds if game wasn't ready
			if (!me.gameReady) return true;
			if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");

			let party = getParty(leader);

			if (party) {
				// Player is in Throne of Destruction or Worldstone Chamber
				if ([sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(party.area)) {
					if (Loader.scriptName() === "TristramLeech") {
						killLeaderTracker = true;
						throw new Error('Party leader is running baal');
					} else {
						// kill process
						return false;
					}
				}
			}

			return true;
		};

		try {
			if (!Misc.poll(() => {
				if (Pather.getPortal(sdk.areas.Tristram, Config.Leader || null) && Pather.usePortal(sdk.areas.Tristram, Config.Leader || null)) {
					return true;
				}

				return false;
			}, Time.minutes(5), 1000)) throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");

			Precast.doPrecast(true);
			delay(3000);

			whereisleader = Misc.poll(() => {
				let lead = getParty(leader);

				if (lead.area === sdk.areas.Tristram) {
					return lead;
				}

				return false;
			}, Time.minutes(3), 1000);
			
			while (true) {
				whereisleader = getParty(leader);
				let leaderUnit = Misc.getPlayerUnit(leader);

				if (whereisleader.area !== sdk.areas.Tristram && !Misc.poll(() => {
					let lead = getParty(leader);

					if (lead.area === sdk.areas.Tristram) {
						return true;
					}

					return false;
				}, Time.minutes(3), 1000)) {
					console.log("Leader wasn't in tristram for longer than 3 minutes, End script");

					break;
				}

				if (whereisleader.area === me.area) {
					try {
						if (copyUnit(leaderUnit).x) {
							Config.TristramLeech.Helper && leaderUnit.distance > 4 && Pather.moveToUnit(leaderUnit) && Attack.clear(10);
							!Config.TristramLeech.Helper && leaderUnit.distance > 20 && Pather.moveNearUnit(leaderUnit, 15);
						} else {
							Config.TristramLeech.Helper && Pather.moveTo(copyUnit(leaderUnit).x, copyUnit(leaderUnit).y) && Attack.clear(10);
							!Config.TristramLeech.Helper && Pather.moveNear(copyUnit(leaderUnit).x, copyUnit(leaderUnit).y, 15);
						}
					} catch (err) {
						if (whereisleader.area === me.area) {
							Config.TristramLeech.Helper && Pather.moveTo(whereisleader.x, whereisleader.y) && Attack.clear(10);
							!Config.TristramLeech.Helper && Pather.moveNear(whereisleader.x, whereisleader.y, 15);
						}
					}
				}

				delay(100);
			}
		} catch (e) {
			console.errorReport(e);
		} finally {
			killLeaderTracker = true;
		}
	}

	return true;
}
