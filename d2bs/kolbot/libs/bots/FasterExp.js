/**
*  @filename    FasterExp.js
*  @author      dzik, Tpower @ D2GM, theBGuy
*  @desc        Fast exp script based on FastExp.js by dzik but heavily modified.
*               Requires 5 chars minimum but ideally run with 7-8 chars.
*               Chars not specified will help clear chaos, hurt diablo, help clear throne and hurt Baal.
*               Route is seal bosses > xp shrine > kill diablo > leach waves > leach baal > kill nith (nith right after diablo is faster but you often lose XP shrine @ nith).
*               To ensure Barb makes it to cata 2 on time he should be d2botlead, rest running d2botfollow.
*               leveler must have diaLead, nithPrep and shrineHunter in quitlist, everryone else must have leveler in quitlist.
*
*/
include("FasterExpConfig.js");

// todo - remove all the while delays, initiate task list using the chat events to assign current task

function FasterExp() {
	const FastExpSettings = {
		leveler: "", // Char being leveled
		diaLead: "", // Diablo lead char (should be hammerdin), opens boss seals, opens TP + summons leveler for seal boss kills, helps prep Diablo + kills baal
		nithPrep: "", // Preps nith, then helps clear throne
		shrineHunter: "", // Hunts for shrine and tps throne for rest of team
		BOer: "", // BO Barb (only runs BoBarbHelper.js)
	};

	if (!FasterExpConfig[Config.FasterExp.Team]) {
		throw new Error("Failed to locate team config file");
	} else {
		Object.assign(FastExpSettings, FasterExpConfig[Config.FasterExp.Team]);
	}

	// Internal variables - don't touch
	const hurtDia = 30; // Hurt Diablo to health %
	const hurtNith = 30; // Hurt Nith to health %
	const hurtBaal = 10; // Hurt Baal to health %
	const msgShrineY = "s yes";
	const msgShrineN = "s no";
	const msgNith = "nith ready";
	const msgstartDia = "Start Diablo";
	const msgSeal1 = "s1";
	const msgSeal2 = "s2";
	const msgSeal3 = "s3";
	const msgDia = "dia up";
	const msgGoThrone = "Throne";
	const msgBeforeB = "town and wait";
	const msgBaal = "baal up";
	const msgQuit = "we done";

	let player;
	let shrineWait = true;
	let goForShrine = false;
	let readyNith = false;
	let startDia = false;
	let canKill1 = false;
	let canKill2 = false;
	let canKill3 = false;
	let readyDia = false;
	let goThrone = false;
	let readyWaves = false;
	let readyBaal = false;
	let done = false;
	let id = "";

	this.messenger = function(name, msg) {
		switch (msg) {
		case msgShrineY:
			shrineWait = false;
			goForShrine = true;

			break;
		case msgShrineN:
			shrineWait = false;

			break;
		case msgNith:
			readyNith = true;

			break;
		case msgstartDia:
			startDia = true;

			break;
		case msgSeal1:
			canKill1 = true;
			id = getLocaleString(2851);

			break;
		case msgSeal2:
			canKill2 = true;
			id = getLocaleString(2852);

			break;
		case msgSeal3:
			canKill3 = true;
			id = getLocaleString(2853);

			break;
		case msgDia:
			readyDia = true;

			break;
		case msgGoThrone:
			goThrone = true;

			break;
		case msgBeforeB:
			readyWaves = true;

			break;
		case msgBaal:
			readyBaal = true;

			break;
		case msgQuit:
			done = true;

			break;
		default:
			break;
		}
	};

	addEventListener("chatmsg", this.messenger);

	if (me.name === FastExpSettings.BOer) {
		// only runs bo-er script - until told to leave
		while (!done) {
			try {
				Loader.runScript("BoBarbHelper");
			} catch (e) {
				console.errorReport(e);
			}

			delay(1000);
		}

		return true;
	} else {
		Config.BattleOrders.Mode = 1; // getter
		
		try {
			Loader.runScript("BattleOrders");
		} catch (e) {
			console.errorReport(e);
		}
	}

	Town.doChores();

	if (me.name === FastExpSettings.nithPrep) {
		Pather.useWaypoint(sdk.areas.HallsofPain);
		Pather.moveToExit(sdk.areas.HallsofVaught, true);
		Pather.moveToPreset(me.area, 2, sdk.units.NihlathaksPlatform, 10, 10);
		Attack.hurt(sdk.monsters.Nihlathak, hurtNith);
		Town.doChores();
		say(msgNith);
		Town.move("portalspot");
	}

	if (me.name === FastExpSettings.shrineHunter) {
		let noShrine = true, i;

		Pather.useWaypoint(sdk.areas.StonyField);
		for (i = sdk.areas.StonyField; i > sdk.areas.RogueEncampment; i -= 1) {
			if (Misc.getShrinesInArea(i, 15, false)) {
				if (me.name === FastExpSettings.shrineHunter) {
					say(msgShrineY);
					noShrine = false;
				}
				break;
			}
		}

		if (i === 1) {
			Town.goToTown();
			Pather.useWaypoint(sdk.areas.DarkWood);

			for (i = sdk.areas.DarkWood; i < sdk.areas.DenofEvil; i += 1) {
				if (Misc.getShrinesInArea(i, 15, false)) {
					if (me.name === FastExpSettings.shrineHunter) {
						say(msgShrineY);
						noShrine = false;
					}
					break;
				}
			}
		}

		noShrine && say(msgShrineN);
		Town.goToTown(sdk.areas.Harrogath);
		
		while (!goThrone) {
			delay(100);
		}

		me.area !== sdk.areas.WorldstoneLvl2 && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);
		if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true)) {
			throw new Error("Failed to move to Throne of Destruction.");
		}
		Pather.moveTo(15118, 5045);
		Town.goToTown();
	}

	if (me.name === FastExpSettings.leveler) {
		say(msgstartDia);
		Pather.useWaypoint(sdk.areas.PandemoniumFortress);
		Town.move("portalspot");
		
		while (!canKill1) {
			delay(100);
		}

		if (canKill1 && !canKill2) {
			Pather.usePortal(sdk.areas.ChaosSanctuary, FastExpSettings.diaLead);

			try {
				Attack.kill(id);
			} catch (e) {
				say("Seal boss 1 not found");
			} finally {
				Pickit.pickItems();
				Town.goToTown();
			}
		}

		while (!canKill2) {
			delay(100);
		}

		if (canKill2 && !canKill3) {
			Pather.usePortal(sdk.areas.ChaosSanctuary, FastExpSettings.diaLead);
			try {
				Attack.kill(id);
			} catch (e) {
				say("Seal boss 2 not found");
			} finally {
				Pickit.pickItems();
				Town.goToTown();
			}
		}

		while (!canKill3) {
			delay(100);
		}

		if (canKill3 && !readyDia) {
			Pather.usePortal(sdk.areas.ChaosSanctuary, FastExpSettings.diaLead);
			try {
				Attack.kill(id);
			} catch (e) {
				say("Seal boss 3 not found");
			} finally {
				Pickit.pickItems();
				Town.goToTown();
			}
		}

		Town.move("waypoint");
		Pather.useWaypoint(sdk.areas.StonyField);
		Town.goToTown(sdk.areas.RogueEncampment);
		
		while (shrineWait) {
			delay(100);
		}

		if (goForShrine) {
			while (!Pather.usePortal(null, FastExpSettings.shrineHunter)) {
				delay(100);
			}

			say(msgGoThrone);
			Misc.getShrinesInArea(me.area, 15, true);
			delay(300);
			Pather.usePortal(null, FastExpSettings.shrineHunter);
			delay(300);
			Pather.usePortal(null, me.name);
			Pather.useWaypoint(sdk.areas.PandemoniumFortress, true);
			Town.move("portalspot");
		}

		if (!goForShrine) {
			say(msgGoThrone);
			Pather.usePortal(null, me.name);
			Pather.useWaypoint(sdk.areas.PandemoniumFortress, true);
			Town.move("portalspot");
		}

		while (!readyDia) {
			delay(100);
		}

		Pather.usePortal(sdk.areas.ChaosSanctuary, FastExpSettings.diaLead);

		try {
			Attack.kill(sdk.monsters.Diablo);
		} catch (e) {
			say("Diablo not found");
		} finally {
			Pickit.pickItems();
			Town.goToTown(sdk.areas.Harrogath);
			Town.move("portalspot");
		}

		while (!Pather.usePortal(sdk.areas.WorldstoneChamber, FastExpSettings.shrineHunter)) {
			delay(100);
		}

		while (!readyWaves) {
			Pather.moveTo(15117, 5045);
		}

		Town.goToTown();

		while (!readyBaal) {
			delay(100);
		}

		while (!Pather.usePortal(sdk.areas.WorldstoneChamber, null)) {
			delay(100);
		}

		try {
			Pather.moveTo(15177, 5952);
			player = Misc.findPlayer(FastExpSettings.diaLead);
			
			while (me.area === player.area) {
				delay(100);
			}
		} catch (e) {
			say("Baal not found");
		} finally {
			Town.goToTown();
		}

		while (!readyNith) {
			delay(100);
		}

		Pather.usePortal(sdk.areas.HallsofVaught, FastExpSettings.nithPrep);

		try {
			Attack.kill(sdk.monsters.Nihlathak);
		} catch (e) {
			say("Nith not found");
		} finally {
			Pickit.pickItems();
		}

		return true;
	}

	if (me.name !== FastExpSettings.leveler && me.name !== FastExpSettings.shrineHunter && me.name !== FastExpSettings.nithPrep) {
		while (!startDia) {
			delay(100);
		}

		if (me.area !== sdk.areas.RiverofFlame) Pather.useWaypoint(sdk.areas.RiverofFlame);
		Common.Diablo.initLayout();
		Common.Diablo.openSeal(sdk.units.DiabloSealVizier2);
		me.name === FastExpSettings.diaLead && Common.Diablo.openSeal(sdk.units.DiabloSealVizier);
		Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);
		me.name === FastExpSettings.diaLead && Pather.makePortal() && say(msgSeal1);

		while (!Common.Diablo.getBoss(getLocaleString(2851))) {
			delay(100);
		}

		me.name === FastExpSettings.diaLead && Common.Diablo.openSeal(sdk.units.DiabloSealSeis);
		Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);
		me.name === FastExpSettings.diaLead && Pather.makePortal() && say(msgSeal2);

		while (!Common.Diablo.getBoss(getLocaleString(2852))) {
			delay(100);
		}

		Common.Diablo.openSeal(sdk.units.DiabloSealInfector);
		me.name === FastExpSettings.diaLead && Common.Diablo.openSeal(sdk.units.DiabloSealInfector2);
		Common.Diablo.infLayout === 1 ? delay(1) : Pather.moveTo(7928, 5295);

		me.name === FastExpSettings.diaLead && Pather.makePortal() && say(msgSeal3);

		while (!Common.Diablo.getBoss(getLocaleString(2853))) {
			delay(100);
		}

		Pather.moveTo(7788, 5292);
		Common.Diablo.diabloPrep();
		Attack.hurt(sdk.monsters.Diablo, hurtDia);
		Town.goToTown(sdk.areas.Harrogath);
		say(msgDia);
		Town.move("portalspot");
	}

	while (!goThrone) {
		delay(100);
	}

	while (!Pather.usePortal(sdk.areas.ThroneofDestruction, FastExpSettings.shrineHunter)) {
		delay(100);
	}

	me.name === FastExpSettings.shrineHunter && Pather.makePortal();

	Common.Baal.clearThrone();
	Pickit.pickItems();
	Common.Baal.clearWaves();

	say(msgBeforeB);
	Pather.moveTo(15090, 5008);

	if (me.name === FastExpSettings.nithPrep) {
		while (true) {
			delay(1000);
		}
	}

	delay(5000);
	Precast.doPrecast(true);

	if (!Misc.poll(() => !monster(sdk.monsters.ThroneBaal), minutes(3), 1000)) {
		Common.Baal.clearWaves();
		
		if (!Misc.poll(() => !monster(sdk.monsters.ThroneBaal), minutes(3), 1000)) {
			throw new Error("Couldn't clear waves");
		}
	}

	let portal = object(sdk.units.WorldstonePortal);

	if (portal) {
		Pather.usePortal(null, null, portal);
	} else {
		throw new Error("Couldn't find portal.");
	}

	Pather.moveTo(15134, 5923);
	Attack.hurt(sdk.monsters.Baal, hurtBaal);
	say(msgBaal);

	if (me.name === FastExpSettings.diaLead) {
		player = Misc.findPlayer(FastExpSettings.leveler);
		
		while (me.area !== player.area) {
			delay(100);
		}

		Attack.kill(sdk.monsters.Baal);
		say(msgQuit);
	}

	Town.goToTown();

	while (!done) {
		delay(1000);
	}

	return true;
}
