/**
*	@filename	Coldworm.js
*	@author		kolton, edited by 13ack.Stab
*	@desc		kill Coldworm; optionally kill Beetleburst and clear Maggot Lair
*/

function Coldworm() {
	Town.doChores();
	Pather.useWaypoint(43);
	Precast.doPrecast(true);

	// Beetleburst, added by 13ack.Stab
	if (Config.Coldworm.KillBeetleburst) {
		try {
			if (!Pather.moveToPreset(me.area, 1, 747)) {
				throw new Error("Failed to move to Beetleburst");
			}

			Attack.kill(getLocaleString(sdk.locale.monsters.Beetleburst));
		} catch (e) {
			console.warn(e); // not the main part of this script so simply log and move on
		}
	}

	if (!Pather.moveToExit([62, 63, 64], true)) {
		throw new Error("Failed to move to Coldworm");
	}

	if (Config.Coldworm.ClearMaggotLair) {
		Attack.clearLevel(Config.ClearType);
	} else {
		if (!Pather.moveToPreset(me.area, 2, 356)) {
			throw new Error("Failed to move to Coldworm");
		}

		Attack.kill(sdk.monsters.ColdwormtheBurrower);
	}

	return true;
}
