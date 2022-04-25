/**
 *	@filename	Baal.js
 *	@author		kolton, YGM, theBGuy
 *	@desc		clear Throne of Destruction and kill Baal
 */

function Baal() {
	this.announce = function () {
		let count, string, souls, dolls,
			monster = getUnit(1);

		if (monster) {
			count = 0;

			do {
				if (monster.attackable && monster.y < 5094) {
					monster.distance <= 40 && (count += 1);
					!souls && monster.classid === 641 && (souls = true);
					!dolls && monster.classid === 691 && (dolls = true);
				}
			} while (monster.getNext());
		}

		if (count > 30) {
			string = "DEADLY!!!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 20) {
			string = "Lethal!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 10) {
			string = "Dangerous!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 0) {
			string = "Warm" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else {
			string = "Cool TP. No immediate monsters.";
		}

		if (souls) {
			string += " Souls ";
			dolls && (string += "and Dolls ");
			string += "in area.";
		} else if (dolls) {
			string += " Dolls in area.";
		}

		say(string);
	};

	Town.doChores();
	!!Config.RandomPrecast ? Precast.doRandomPrecast(true, sdk.areas.WorldstoneLvl2) : Pather.useWaypoint(sdk.areas.WorldstoneLvl2) && Precast.doPrecast(true);
	me.area !== sdk.areas.WorldstoneLvl2 && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);

	if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true)) {
		throw new Error("Failed to move to Throne of Destruction.");
	}

	Pather.moveTo(15095, 5029);

	if (Config.Baal.DollQuit && getUnit(1, 691)) {
		say("Dolls found! NG.");

		return true;
	}

	if (Config.Baal.SoulQuit && getUnit(1, 641)) {
		say("Souls found! NG.");

		return true;
	}

	if (Config.PublicMode) {
		this.announce();
		Pather.moveTo(15118, 5002);
		Pather.makePortal();
		say(Config.Baal.HotTPMessage);
		Attack.clear(15);
	}

	Common.Baal.clearThrone();

	if (Config.PublicMode) {
		Pather.moveTo(15118, 5045);
		Pather.makePortal();
		say(Config.Baal.SafeTPMessage);
		Precast.doPrecast(true);
	}

	if (!Common.Baal.clearWaves()) {
		throw new Error("Couldn't clear baal waves");
	}

	if (Config.Baal.KillBaal) {
		Config.PublicMode && say(Config.Baal.BaalMessage);
		Pather.moveTo(15090, 5008);
		delay(5000);
		Precast.doPrecast(true);

		while (getUnit(1, 543)) {
			delay(500);
		}

		let portal = getUnit(2, 563);

		if (portal) {
			Pather.usePortal(null, null, portal);
		} else {
			throw new Error("Couldn't find portal.");
		}

		Pather.moveTo(15134, 5923);
		Attack.kill(544); // Baal
		Pickit.pickItems();
	}

	return true;
}
