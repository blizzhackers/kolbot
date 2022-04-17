/**
*	@filename	TristramLeech.js
*	@author		ToS/XxXGoD/YGM
*	@desc		Tristram Leech (Helper)
*/

function TristramLeech() {
	let leader, whereisleader;

	Town.doChores();
	Pather.useWaypoint(1); // Back To Rouge
	Town.move("portalspot"); // Portal Spot
	leader = Config.Leader;

	// Check leader isn't in other zones, whilst waiting for portal.
	for (let i = 0; i < Config.TristramLeech.Wait; i += 1) {
		whereisleader = getParty(leader);

		if (whereisleader && [83, 108, 131].includes(whereisleader.area)) {
			return false;
		}

		if (Pather.usePortal(38, leader)) {
			break;
		}

		delay(1000);
	}

	if (me.area !== sdk.areas.Tristram) throw new Error("No portal found to Tristram.");

	Precast.doPrecast(true);
	delay(3000);

	for (let i = 0; i < 30; i += 1) {
		whereisleader = getParty(leader);

		if (whereisleader) {
			if (whereisleader.area === 38) {
				break;
			}
		}

		delay(1000);
	}

	while (whereisleader.area === 38) {
		whereisleader = getParty(leader);
		let leaderUnit = Misc.getPlayerUnit(leader);

		if (whereisleader.area === me.area) {
			try {
				if (copyUnit(leaderUnit).x) {
					if (getDistance(me, leaderUnit) > 4) {
						Pather.moveToUnit(leaderUnit);
						Attack.clear(10);
					}
				} else {
					Pather.moveTo(copyUnit(leaderUnit).x, copyUnit(leaderUnit).y);
					Attack.clear(10);
				}
			} catch (err) {
				if (whereisleader.area === me.area) {
					Pather.moveTo(whereisleader.x, whereisleader.y);
					Attack.clear(10);
				}
			}
		}

		delay(100);
	}

	return true;
}
