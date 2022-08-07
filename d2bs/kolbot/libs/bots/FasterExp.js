/**
*  @filename    FasterExp.js
*  @author      dzik, Tpower @ D2GM, theBGuy
*  @desc        Fast exp script based on FastExp.js by dzik but heavily modified.
*               Requires 5 chars minimum but ideally run with 7-8 chars.
*               Chars not specified will help clear chaos, hurt diablo, help clear throne and hurt Baal.
*               Route is seal bosses > xp shrine > kill diablo > leach waves > leach baal > kill nith (nith right after diablo is faster but you often lose XP shrine @ nith).
*               To ensure Barb makes it to cata 2 on time he should be d2botlead, rest running d2botfollow.
*               leveler must have diaLead, nithPrep and shrineHunter in quitlist, everyone else must have leveler in quitlist.
*
*/
include("FasterExpConfig.js");

// todo - remove all the while delays, initiate task list using the chat events to assign current task
// todo - break up shrine hunter. shrine hunter should only hunt shrines. Maybe baalLead to handle throne
// are any of the other bosses enough xp to be worth it?

function FasterExp() {
	const Roles = {
		leveler: "", // Char being leveled
		diaLead: "", // Diablo lead char (should be hammerdin), opens boss seals, opens TP + summons leveler for seal boss kills, helps prep Diablo + kills baal
		nithPrep: "", // Preps nith, then helps clear throne
		shrineHunter: "", // Hunts for shrine and tps throne for rest of team
		BOer: "", // BO Barb (only runs BoBarbHelper.js)
	};

	if (!FasterExpConfig[Config.FasterExp.Team]) {
		throw new Error("Failed to locate team config file");
	} else {
		Object.assign(Roles, FasterExpConfig[Config.FasterExp.Team]);
	}

	// Internal variables - don't touch
	const hurtDia = 30; // Hurt Diablo to health %
	const hurtNith = 30; // Hurt Nith to health %
	const hurtBaal = 10; // Hurt Baal to health %
	const msgShrineY = "s yes";
	const msgShrineN = "s no";
	const msgNith = "nith ready";
	const nithDone = "nith done";
	const msgstartDia = "Start Diablo";
	const msgSeal1 = "s1";
	const msgSeal2 = "s2";
	const msgSeal3 = "s3";
	const msgDia = "dia up";
	const msgGoThrone = "Throne";
	const wavesReady = "Waves";
	const msgBeforeBaal = "town and wait";
	const msgBaal = "baal up";
	const msgQuit = "we done";

	let player;
	let shrineWait = true;
	let goForShrine = false;
	let readyNith = false;
	let nithDead = false;
	let startDia = false;
	let canKill1 = false;
	let canKill2 = false;
	let canKill3 = false;
	let readyDia = false;
	let goThrone = false;
	let readyWaves = false;
	let townForBaal = false;
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
		case nithDone:
			nithDead = true;

			break;
		case msgstartDia:
			startDia = true;

			break;
		case msgSeal1:
			canKill1 = true;
			id = getLocaleString(sdk.locale.monster.GrandVizierofChaos);

			break;
		case msgSeal2:
			canKill2 = true;
			id = getLocaleString(sdk.locale.monster.LordDeSeis);

			break;
		case msgSeal3:
			canKill3 = true;
			id = getLocaleString(sdk.locale.monster.InfectorofSouls);

			break;
		case msgDia:
			readyDia = true;

			break;
		case msgGoThrone:
			goThrone = true;

			break;
		case wavesReady:
			readyWaves = true;

			break;
		case msgBeforeBaal:
			townForBaal = true;

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

	if (me.name === Roles.BOer) {
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

	if (me.name === Roles.nithPrep) {
		Pather.useWaypoint(sdk.areas.HallsofPain);
		Pather.moveToExit(sdk.areas.HallsofVaught, true);
		Pather.moveToPreset(sdk.areas.HallsofVaught, sdk.unittype.Objects, sdk.units.NihlathaksPlatform, 10, 10);
		Attack.hurt(sdk.monsters.Nihlathak, hurtNith);
		Town.doChores();
		say(msgNith);
		Town.move("portalspot");
	}

	// add more areas - looks and finds exp shrine - guards it until leveler comes and grabs it - then looks for another
	if (me.name === Roles.shrineHunter) {
		let areas = [];
		let i, noShrine = true;

		Pather.useWaypoint(sdk.areas.StonyField);
		for (i = sdk.areas.StonyField; i > sdk.areas.RogueEncampment; i -= 1) {
			if (Misc.getShrinesInArea(i, sdk.shrines.Experience, false)) {
				if (me.name === Roles.shrineHunter) {
					say(msgShrineY);
					noShrine = false;
				}
				break;
			}
			areas.push(i);
		}

		if (i === 1) {
			Town.goToTown();
			Pather.useWaypoint(sdk.areas.DarkWood);

			for (i = sdk.areas.DarkWood; i < sdk.areas.DenofEvil; i += 1) {
				if (Misc.getShrinesInArea(i, sdk.shrines.Experience, false)) {
					if (me.name === Roles.shrineHunter) {
						say(msgShrineY);
						noShrine = false;
					}
					break;
				}
				areas.push(i);
			}
		}

		noShrine && say(msgShrineN);
		Town.goToTown(5);
		
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

	// Leveler start
	if (me.name === Roles.leveler) {
		say(msgstartDia);
		Pather.useWaypoint(sdk.areas.PandemoniumFortress);
		Town.move("portalspot");
		
		while (!canKill1) {
			delay(100);
		}

		if (canKill1 && !canKill2) {
			Pather.usePortal(sdk.areas.ChaosSanctuary, Roles.diaLead);

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
			Pather.usePortal(sdk.areas.ChaosSanctuary, Roles.diaLead);

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
			Pather.usePortal(sdk.areas.ChaosSanctuary, Roles.diaLead);

			try {
				Attack.kill(id);
			} catch (e) {
				say("Seal boss 3 not found");
			} finally {
				Pickit.pickItems();
				Town.goToTown();
			}
		}

		if (Roles.shrineHunter) {
			Town.move("waypoint");
			Pather.useWaypoint(sdk.areas.StonyField);
			Town.goToTown(1);
			
			while (shrineWait) {
				delay(100);
			}
		}

		if (goForShrine) {
			while (!Pather.usePortal(null, Roles.shrineHunter)) {
				delay(100);
			}

			say(msgGoThrone);
			Misc.getShrinesInArea(me.area, sdk.shrines.Experience, true);
			delay(300);
			Pather.usePortal(null, Roles.shrineHunter);
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

		Pather.usePortal(sdk.areas.ChaosSanctuary, Roles.diaLead);

		try {
			Attack.kill(sdk.monsters.Diablo);
		} catch (e) {
			say("Diablo not found");
		} finally {
			Pickit.pickItems();
			Town.goToTown(5) && Town.move("portalspot");
		}

		while (!readyNith) {
			delay(100);
		}

		Pather.usePortal(sdk.areas.HallsofVaught, Roles.nithPrep);

		try {
			Attack.kill(sdk.monsters.Nihlathak);
		} catch (e) {
			say("Nith not found");
		} finally {
			say(nithDone);
			Pickit.pickItems();
			Town.goToTown() && Pather.usePortal(sdk.areas.ThroneofDestruction, Roles.diaLead);

		}

		while (!readyWaves) {
			delay(100);
		}

		let longRangeSupport = function () {
			switch (me.classid) {
			case sdk.charclass.Necromancer:
				ClassAttack.raiseArmy(50);

				if (Config.Curse[1] > 0) {
					let monster = Game.getMonster();

					if (monster) {
						do {
							if (monster.attackable && monster.distance < 50 && !checkCollision(me, monster, sdk.collision.Ranged)
								&& monster.curseable && !monster.isSpecial && !monster.getState(ClassAttack.curseState[1])) {
								Skill.cast(Config.Curse[1], sdk.clicktypes.click.Right, monster);
							}
						} while (monster.getNext());
					}
				}

				break;
			case sdk.charclass.Assassin:
				if (Config.UseTraps && ClassAttack.checkTraps({x: 15095, y: 5037})) {
					ClassAttack.placeTraps({x: 15095, y: 5037}, 5);
				}

				break;
			default:
				break;
			}

			let skills = [
				sdk.skills.ChargedStrike, sdk.skills.Lightning, sdk.skills.FireWall, sdk.skills.Meteor, sdk.skills.Blizzard,
				sdk.skills.BoneSpear, sdk.skills.BoneSpirit, sdk.skills.DoubleThrow, sdk.skills.Volcano
			];

			if (!skills.some(skill => Config.AttackSkill[1] === skill || Config.AttackSkill[3] === skill)) {
				return false;
			}

			let monster = Game.getMonster();
			let monList = [];

			if (monster) {
				do {
					if (monster.attackable && monster.distance < 50 && !checkCollision(me, monster, sdk.collision.Ranged)) {
						monList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			while (monList.length) {
				monList.sort(Sort.units);
				monster = copyUnit(monList[0]);

				if (monster && monster.attackable) {
					let index = monster.isSpecial ? 1 : 3;

					if (Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[index]))) {
						if (Config.AttackSkill[index] > -1) {
							ClassAttack.doCast(monster, Config.AttackSkill[index], Config.AttackSkill[index + 1]);
						}
					} else {
						monList.shift();
					}
				} else {
					monList.shift();
				}

				delay(5);
			}

			return true;
		};
		
		Skill.usePvpRange = true;
		Pather.usePortal(sdk.areas.ThroneofDestruction);

		// long distance support?
		while (!townForBaal) {
			Pather.moveTo(15117, 5049);
			longRangeSupport();

			delay(50);
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
			player = Misc.findPlayer(Roles.diaLead);
			
			while (me.area === player.area) {
				delay(100);
			}
		} catch (e) {
			say("Baal not found");
		} finally {
			Town.goToTown();
		}

		return true;
	}

	if ([Roles.leveler, Roles.shrineHunter, Roles.nithPrep].indexOf(me.name) === -1) {
		while (!startDia) {
			delay(100);
		}

		if (me.area !== sdk.areas.RiverofFlame) Pather.useWaypoint(sdk.areas.RiverofFlame);
		if (!Pather.moveToExit(sdk.areas.ChaosSanctuary, true) && !Pather.moveTo(7790, 5544)) throw new Error("Failed to move to Chaos Sanctuary");
		Common.Diablo.initLayout();

		Common.Diablo.openSeal(sdk.units.DiabloSealVizier2);
		me.name === Roles.diaLead && Common.Diablo.openSeal(sdk.units.DiabloSealVizier);
		Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);
		me.name === Roles.diaLead && Pather.makePortal() && say(msgSeal1);

		while (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monster.GrandVizierofChaos))) {
			delay(100);
		}

		me.name === Roles.diaLead && Common.Diablo.openSeal(sdk.units.DiabloSealSeis);
		Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);
		me.name === Roles.diaLead && Pather.makePortal() && say(msgSeal2);

		while (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monster.LordDeSeis))) {
			delay(100);
		}

		Common.Diablo.openSeal(sdk.units.DiabloSealInfector2);
		me.name === Roles.diaLead && Common.Diablo.openSeal(sdk.units.DiabloSealInfector);
		Common.Diablo.infLayout === 1 ? delay(1) : Pather.moveTo(7928, 5295);
		me.name === Roles.diaLead && Pather.makePortal() && say(msgSeal3);

		while (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monster.InfectorofSouls))) {
			delay(100);
		}

		Pather.moveTo(7788, 5292);
		Common.Diablo.diabloPrep();
		Attack.hurt(sdk.monsters.Diablo, hurtDia);
		Town.goToTown(5);
		say(msgDia);
		Town.move("portalspot");
	}

	while (!goThrone) {
		delay(100);
	}

	if (me.name === Roles.nithPrep) {
		while (!nithDead) {
			if (done) {
				return true;
			}

			delay(1000);
		}
	}

	if (Roles.shrineHunter) {
		while (!Pather.usePortal(sdk.areas.ThroneofDestruction, Roles.shrineHunter)) {
			delay(100);
		}
	} else {
		if (!Pather.usePortal(sdk.areas.ThroneofDestruction)) {
			Pather.journeyTo(sdk.areas.ThroneofDestruction);
			Pather.moveTo(15118, 5045);
			Pather.makePortal();
		}
	}

	me.name === Roles.shrineHunter && Pather.makePortal();
	me.name === Roles.diaLead && me.area === sdk.areas.ThroneofDestruction && Pather.makePortal() && say(wavesReady);

	Common.Baal.clearThrone();
	Pickit.pickItems();
	Common.Baal.clearWaves();

	me.name === Roles.diaLead && say(msgBeforeBaal);
	Pather.moveTo(15090, 5008);

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

	if (me.name === Roles.diaLead) {
		// move safe distance away from baal
		Attack.deploy(monster(sdk.monsters.Baal), 20, 5, 9);
		player = Misc.findPlayer(Roles.leveler);
		
		while (me.area !== player.area) {
			delay(100);
		}

		Attack.kill(sdk.monsters.Baal);
		Pickit.pickItems();
		delay(5000);
		say(msgQuit);
	}

	Town.goToTown();

	while (!done) {
		delay(1000);
	}

	return true;
}
