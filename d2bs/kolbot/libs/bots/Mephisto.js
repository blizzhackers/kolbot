/**
*	@filename	Mephisto.js
*	@author		kolton, njomnjomnjom
*	@desc		kill Mephisto
*/

function Mephisto() {
	this.killMephisto = function () {
		let pos = {},
			attackCount = 0,
			meph = getUnit(1, 242);

		if (!meph) {
			throw new Error("Mephisto not found!");
		}

		Config.MFLeader && Pather.makePortal() && say("kill " + meph.classid);

		while (attackCount < 300 && meph.attackable(meph)) {
			if (meph.mode === 5) {
				let angle = Math.round(Math.atan2(me.y - meph.y, me.x - meph.x) * 180 / Math.PI);
				let angles = me.y > meph.y ? [-30, -60, -90] : [30, 60, 90];

				for (let i = 0; i < angles.length; i += 1) {
					pos.dist = 18;
					pos.x = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * pos.dist + meph.x);
					pos.y = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * pos.dist + meph.y);

					if (Attack.validSpot(pos.x, pos.y)) {
						me.overhead("move, bitch!");
						Pather.moveTo(pos.x, pos.y);

						break;
					}
				}
			}

			if (ClassAttack.doAttack(meph) < 2) {
				break;
			}

			attackCount += 1;
		}

		return (meph.mode === 0 || meph.mode === 12);
	};

	this.moat = function () {
		let count;

		count = 0;

		delay(350);
		Pather.moveTo(17563, 8072);

		let mephisto = getUnit(1, 242);

		if (!mephisto) {
			throw new Error("Mephisto not found.");
		}

		delay(350);
		Pather.moveTo(17575, 8086);
		delay(350);
		Pather.moveTo(17584, 8091);
		delay(1200);
		Pather.moveTo(17600, 8095);
		delay(550);
		Pather.moveTo(17610, 8094);
		delay(2500);
		Attack.clear(10);
		Pather.moveTo(17610, 8094);

		let distance = getDistance(me, mephisto);

		while (distance > 27) {
			count += 1;

			Pather.moveTo(17600, 8095);
			delay(150);
			Pather.moveTo(17584, 8091);
			delay(150);
			Pather.moveTo(17575, 8086);
			delay(150);
			Pather.moveTo(17563, 8072);
			delay(350);
			Pather.moveTo(17575, 8086);
			delay(350);
			Pather.moveTo(17584, 8091);
			delay(1200);
			Pather.moveTo(17600, 8095);
			delay(550);
			Pather.moveTo(17610, 8094);
			delay(2500);
			Attack.clear(10);
			Pather.moveTo(17610, 8094);

			distance = getDistance(me, mephisto);

			if (count >= 5) {
				throw new Error("Failed to lure Mephisto.");
			}
		}

		return true;
	};

	this.killCouncil = function () {
		let coords = [17600, 8125, 17600, 8015, 17643, 8068];

		for (let i = 0; i < coords.length; i += 2) {
			Pather.moveTo(coords[i], coords[i + 1]);
			Attack.clearList(Attack.getMob([345, 346, 347], 0, 40));
		}

		return true;
	};

	Town.doChores();
	Pather.useWaypoint(101);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(102, true)) {
		throw new Error("Failed to move to Durance Level 3");
	}

	Config.Mephisto.KillCouncil && this.killCouncil();

	if (Config.Mephisto.TakeRedPortal) {
		Pather.moveTo(17590, 8068);
		delay(400); // Activate the bridge tile
	} else {
		Pather.moveTo(17566, 8069);
	}

	if (me.sorceress) {
		if (Config.Mephisto.MoatTrick) {
			this.moat();
			Skill.usePvpRange = true;
			Attack.kill(242); // Mephisto
			Skill.usePvpRange = false;
		} else {
			Attack.kill(242); // Mephisto
		}
	} else {
		Attack.kill(242); // Mephisto
	}

	Pickit.pickItems();

	if (Config.OpenChests.Enabled) {
		Pather.moveTo(17572, 8011);
		Attack.openChests(5);
		Pather.moveTo(17572, 8125);
		Attack.openChests(5);
		Pather.moveTo(17515, 8061);
		Attack.openChests(5);
	}

	if (Config.Mephisto.TakeRedPortal) {
		Pather.moveTo(17590, 8068);
		let tick = getTickCount(), time = 0;

		// Wait until bridge is there
		while (getCollision(me.area, 17601, 8070, 17590, 8068) !== 0 && (time = getTickCount() - tick) < 2000) {
			Pather.moveTo(17590, 8068); // Activate it
			delay(3);
		}

		// If bridge is there, and we can move to the location
		if (time < 2000 && Pather.moveTo(17601, 8070)) {
			Pather.usePortal(null);
		}
	}

	return true;
}
