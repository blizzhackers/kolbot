/**
*	@filename	SealLeader.js
*	@author		probably kolton, theBGuy
*	@desc		Clear a safe spot around seals and invite leechers in. Works in conjuction with SealLeecher script.
*/

function SealLeader() {
	this.getBoss = function (name) {
		let glow = getUnit(2, 131);

		for (let i = 0; i < 16; i += 1) {
			let boss = getUnit(1, name);

			if (boss) {
				Common.Diablo.chaosPreattack(name, 8);

				return Attack.clear(40, 0, name);
			}

			delay(250);
		}

		return !!glow;
	};

	// START
	Town.doChores();
	Pather.useWaypoint(107);
	Precast.doPrecast(true);
	Common.Diablo.initLayout();

	Common.Diablo.vizLayout === 1 ? Pather.moveTo(7708, 5269) : Pather.moveTo(7647, 5267);
	Attack.securePosition(me.x, me.y, 35, 3000, true);
	Pather.makePortal();
	say("in");
	Common.Diablo.openSeal(395);
	Common.Diablo.openSeal(396);

	Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);

	// Kill Viz
	if (!this.getBoss(getLocaleString(2851))) {
		throw new Error("Failed to kill Vizier");
	}

	say("out");

	Common.Diablo.seisLayout === 1 ? Pather.moveTo(7767, 5147) : Pather.moveTo(7820, 5147);
	Attack.securePosition(me.x, me.y, 35, 3000, true);
	Pather.makePortal();
	say("in");
	Common.Diablo.openSeal(394);
	Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);

	if (!this.getBoss(getLocaleString(2852))) {
		throw new Error("Failed to kill de Seis");
	}

	say("out");

	Common.Diablo.infLayout === 1 ? Pather.moveTo(7860, 5314) : Pather.moveTo(7909, 5317);
	Attack.securePosition(me.x, me.y, 35, 3000, true);
	Pather.makePortal();
	say("in");
	Common.Diablo.openSeal(392);

	if (Common.Diablo.infLayout === 1) {
		if (me.sorceress || me.assassin) {
			Pather.moveTo(7876, 5296);
		}

		delay(1 + me.ping);
	} else {
		delay(1 + me.ping);
		Pather.moveTo(7928, 5295);
	}

	if (!this.getBoss(getLocaleString(2853))) {
		throw new Error("Failed to kill Infector");
	}

	Common.Diablo.openSeal(393);
	say("out");
	Pather.moveTo(7763, 5267);
	Pather.makePortal();
	Pather.moveTo(7788, 5292);
	say("in");
	Common.Diablo.diabloPrep();
	Attack.kill(243); // Diablo
	say("done");
	Pickit.pickItems();

	return true;
}
