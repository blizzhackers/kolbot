/**
*	@filename	FastDiablo.js
*	@author		kolton, theBGuy
*	@desc		kill seal bosses and Diablo
*/

let Overrides = require('../modules/Override');
new Overrides.Override(Common.Diablo, Common.Diablo.openSeal, function(orignal, classid) {
	if (!orignal(classid)) {
		throw new Error("Failed to open seal (id " + classid + ")");
	}
}).apply();

function FastDiablo() {
	this.getBoss = function (name) {
		let glow = getUnit(2, 131);

		for (let i = 0; i < 24; i += 1) {
			let boss = getUnit(1, name);

			if (boss) {
				Common.Diablo.chaosPreattack(name, 8);

				try {
					Attack.kill(name);
				} catch (e) {
					Attack.clear(10, 0, name);
				}

				if (!!boss && !boss.dead && !Attack.canAttack(boss)) {
					throw new Error("Unable to kill seal boos");
				}

				Pickit.pickItems();

				return true;
			}

			delay(250);
		}

		return !!glow;
	};

	Town.doChores();
	Pather.useWaypoint(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);
	Common.Diablo.initLayout();
	Common.Diablo.openSeal(395);
	Common.Diablo.openSeal(396);

	Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);
	if (!this.getBoss(getLocaleString(2851))) {
		throw new Error("Failed to kill Vizier");
	}

	Common.Diablo.openSeal(394);
	Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);
	if (!this.getBoss(getLocaleString(2852))) {
		throw new Error("Failed to kill de Seis");
	}

	Common.Diablo.openSeal(393);
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

	Pather.moveTo(7788, 5292);
	Common.Diablo.diabloPrep();
	Attack.kill(243); // Diablo
	Pickit.pickItems();

	return true;
}
