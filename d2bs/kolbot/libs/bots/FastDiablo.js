/**
*  @filename    FastDiablo.js
*  @author      kolton, theBGuy
*  @desc        kill seal bosses and Diablo w/ speed
*
*/

let Overrides = require('../modules/Override');
new Overrides.Override(Common.Diablo, Common.Diablo.openSeal, function (orignal, classid) {
	if (!orignal(classid)) {
		throw new Error("Failed to open seal (id " + classid + ")");
	}
}).apply();

function FastDiablo() {
	this.getBoss = function (name) {
		let glow = object(sdk.units.SealGlow);

		for (let i = 0; i < 24; i += 1) {
			let boss = monster(name);

			if (boss) {
				Common.Diablo.chaosPreattack(name, 8);
				Attack.kill(name);

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
	Common.Diablo.openSeal(sdk.units.DiabloSealVizier2);
	Common.Diablo.openSeal(sdk.units.DiabloSealVizier);

	Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);
	if (!this.getBoss(getLocaleString(sdk.locale.monsters.GrandVizierofChaos))) throw new Error("Failed to kill Vizier");

	Common.Diablo.openSeal(sdk.units.DiabloSealSeis);
	Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);
	if (!this.getBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) throw new Error("Failed to kill de Seis");

	Common.Diablo.openSeal(sdk.units.DiabloSealInfector2);
	Common.Diablo.openSeal(sdk.units.DiabloSealInfector);

	if (Common.Diablo.infLayout === 1) {
		if (me.sorceress || me.assassin) {
			Pather.moveTo(7876, 5296);
		}

		delay(1 + me.ping);
	} else {
		delay(1 + me.ping);
		Pather.moveTo(7928, 5295);
	}

	if (!this.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) throw new Error("Failed to kill Infector");

	Pather.moveTo(7788, 5292);
	Common.Diablo.diabloPrep();
	Attack.kill(sdk.monsters.Diablo);
	Pickit.pickItems();

	return true;
}
