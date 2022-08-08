/**
*  @filename    Diablo.js
*  @author      kolton, theBGuy
*  @desc        clear Chaos Sanctuary and kill Diablo
*  @configurable
*      run only Vizier - intended for classic sorc, only kills Vizier
*      clear safe spot around seals for leechers - used in conjuction with SealLeecher
*      run Fast Diablo - focuses only on popping the seals quickly
*
*/

function Diablo() {
	Pather._teleport = Pather.teleport;

	// START
	Town.doChores();
	!!Config.RandomPrecast ? Precast.doRandomPrecast(true, sdk.areas.RiverofFlame) : Pather.useWaypoint(sdk.areas.RiverofFlame) && Precast.doPrecast(true);
	!me.inArea(sdk.areas.RiverofFlame) && Pather.useWaypoint(sdk.areas.RiverofFlame);

	if (!Pather.moveToExit(sdk.areas.ChaosSanctuary, true) && !Pather.moveTo(7790, 5544)) throw new Error("Failed to move to Chaos Sanctuary");

	Common.Diablo.initLayout();

	if (Config.Diablo.JustViz) {
		Common.Diablo.vizLayout === 1 ? Pather.moveTo(7708, 5269) : Pather.moveTo(7647, 5267);
		Config.PublicMode && Pather.makePortal();
		Common.Diablo.vizierSeal(true);

		return true;
	}

	if (Config.Diablo.Entrance && !Config.Diablo.Fast) {
		Attack.clear(30, 0, false, Common.Diablo.sort);
		Pather.moveTo(7790, 5544);

		if (Config.PublicMode && Pather.makePortal()) {
			say(Config.Diablo.EntranceTP);
			Pather.teleport = !Config.Diablo.WalkClear && Pather._teleport;
		}

		Pather.moveTo(7790, 5544);
		Precast.doPrecast(true);
		Attack.clear(30, 0, false, Common.Diablo.sort);
		Common.Diablo.followPath(Common.Diablo.entranceToStar);
	} else {
		Pather.moveTo(7774, 5305);
		Attack.clear(15, 0, false, Common.Diablo.sort);
	}

	Pather.moveTo(7791, 5293);

	if (Config.PublicMode && Pather.makePortal()) {
		say(Config.Diablo.StarTP);
		Pather.teleport = !Config.Diablo.WalkClear && Pather._teleport;
	}

	Attack.clear(30, 0, false, Common.Diablo.sort);

	try {
		Common.Diablo.runSeals(Config.Diablo.SealOrder);
		// maybe instead of throwing error if we fail to open seal, add it to an array to re-check before diabloPrep then if that fails throw and error
		Config.PublicMode && say(Config.Diablo.DiabloMsg);
		print("Attempting to find Diablo");
		Common.Diablo.diabloPrep();
	} catch (error) {
		print("Diablo wasn't found. Checking seals.");
		Common.Diablo.runSeals(Config.Diablo.SealOrder);
		Common.Diablo.diabloPrep();
	}

	Attack.kill(sdk.monsters.Diablo);
	Pickit.pickItems();

	Pather.teleport = Pather._teleport;
	Config.Diablo.SealLeader && say("done");

	return true;
}
