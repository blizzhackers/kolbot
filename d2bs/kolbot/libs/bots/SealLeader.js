/**
*  @filename    SealLeader.js
*  @author      probably kolton, theBGuy
*  @desc        Clear a safe spot around seals and invite leechers in. Works in conjuction with SealLeecher script.
*
*/

function SealLeader() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);
	Common.Diablo.initLayout();

	Common.Diablo.vizLayout === 1 ? Pather.moveTo(7708, 5269) : Pather.moveTo(7647, 5267);
	Attack.securePosition(me.x, me.y, 35, 3000, true);
	Pather.makePortal();
	say("in");
	Common.Diablo.openSeal(sdk.units.DiabloSealVizier2);
	Common.Diablo.openSeal(sdk.units.DiabloSealVizier);

	Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);

	// Kill Viz
	if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) {
		throw new Error("Failed to kill Vizier");
	}

	say("out");

	Common.Diablo.seisLayout === 1 ? Pather.moveTo(7767, 5147) : Pather.moveTo(7820, 5147);
	Attack.securePosition(me.x, me.y, 35, 3000, true);
	Pather.makePortal();
	say("in");
	Common.Diablo.openSeal(sdk.units.DiabloSealSeis);
	Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);

	if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) {
		throw new Error("Failed to kill de Seis");
	}

	say("out");

	Common.Diablo.infLayout === 1 ? Pather.moveTo(7860, 5314) : Pather.moveTo(7909, 5317);
	Attack.securePosition(me.x, me.y, 35, 3000, true);
	Pather.makePortal();
	say("in");
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

	if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) {
		throw new Error("Failed to kill Infector");
	}

	Common.Diablo.openSeal(sdk.units.DiabloSealInfector2);
	say("out");
	Pather.moveTo(7763, 5267);
	Pather.makePortal();
	Pather.moveTo(7788, 5292);
	say("in");
	Common.Diablo.diabloPrep();
	Attack.kill(sdk.monsters.Diablo);
	say("done");
	Pickit.pickItems();

	return true;
}
