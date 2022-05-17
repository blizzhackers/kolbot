/**
*	@filename	Questing.js
*	@author		kolton, theBGuy
*	@desc		Do quests, only most popular ones for now
*/

function Questing() {
	let quests = [
		[1, "clearDen"],
		[9, "killRadament"],
		[17, "lamEssen"],
		[25, "killIzual"],
		[35, "killShenk"],
		// todo: free barbs
		[37, "freeAnya"],
		[39, "ancients"]
	];

	this.clearDen = function () {
		console.log("starting den");

		if (!Town.goToTown(1) || !Pather.moveToExit([2, 8], true)) {
			throw new Error();
		}

		Precast.doPrecast(true);
		Attack.clearLevel();
		Town.goToTown();
		Town.npcInteract("Akara");

		return true;
	};

	this.killRadament = function () {
		if (!Pather.accessToAct(2)) return false;

		print("starting radament");

		if (!Town.goToTown() || !Pather.useWaypoint(48, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(49, true) || !Pather.moveToPreset(me.area, 2, 355)) {
			throw new Error();
		}

		Attack.kill(229); // Radament

		let book = getUnit(4, 552);

		if (book) {
			Pickit.pickItem(book);
			delay(300);
			clickItem(1, book);
		}

		Town.goToTown();
		Town.npcInteract("Atma");

		return true;
	};

	this.killIzual = function () {
		if (!Pather.accessToAct(4)) return false;

		print("starting izual");

		if (!Town.goToTown() || !Pather.useWaypoint(106, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToPreset(105, 1, 256)) {
			return false;
		}

		Attack.kill(256); // Izual
		Town.goToTown();
		Town.npcInteract("Tyrael");
		getUnit(2, 566) && Pather.useUnit(2, 566, 109);

		return true;
	};

	this.lamEssen = function () {
		if (!Pather.accessToAct(3)) return false;

		print("starting lam essen");

		if (!Town.goToTown() || !Pather.useWaypoint(80, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(94, true) || !Pather.moveToPreset(me.area, 2, 193)) {
			throw new Error();
		}

		Misc.openChest(193);
		let book = Misc.poll(() => getUnit(4, 548), 1000, 100);

		Pickit.pickItem(book);
		Town.goToTown();
		Town.npcInteract("Alkor");

		return true;
	};

	this.killShenk = function () {
		if (!Pather.accessToAct(5)) return false;
		if (Misc.checkQuest(35, 1)) return true;

		print("starting shenk");

		if (!Town.goToTown() || !Pather.useWaypoint(111, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);
		Pather.moveTo(3883, 5113);
		Attack.kill(getLocaleString(22435)); // Shenk the Overseer
		Town.goToTown();

		return true;
	};

	// save barbs?

	this.freeAnya = function () {
		if (!Pather.accessToAct(5)) return false;
		if (Misc.checkQuest(37, 1)) return true;

		print("starting anya");

		if (!Town.goToTown() || !Pather.useWaypoint(113, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(114, true) || !Pather.moveToPreset(me.area, 2, 460)) {
			throw new Error();
		}

		delay(1000);

		let anya = getUnit(2, 558);

		// talk to anya, then cancel her boring speech
		Pather.moveToUnit(anya);
		sendPacket(1, 0x13, 4, 0x2, 4, anya.gid);
		delay(300);
		me.cancel();

		// get pot from malah, then return to anya
		Town.goToTown();
		Town.npcInteract("Malah");
		Town.move("portalspot");
		Pather.usePortal(114, me.name);

		// unfreeze her a$$, cancel her speech again
		anya.interact();
		delay(300);
		me.cancel();

		// get reward
		Town.goToTown();
		Town.npcInteract("Malah");

		let scroll = me.getItem(646);
		scroll && clickItem(1, scroll);

		return true;
	};

	// @theBGuy
	this.ancients = function () {
		// ancients resists
		let canAncients = function () {
			let ancient = getUnit(1);

			if (ancient) {
				do {
					if (!ancient.getParent() && !Attack.canAttack(ancient)) {
						return false;
					}
				} while (ancient.getNext());
			}

			return true;
		};

		// touch altar
		let touchAltar = function () {
			let tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUnit(2, 546)) {
					break;
				}

				delay(20 + me.ping);
			}

			let altar = getUnit(2, 546);

			if (altar) {
				while (altar.mode !== 2) {
					Pather.moveToUnit(altar);
					altar.interact();
					delay(200 + me.ping);
					me.cancel();
				}

				return true;
			}

			return false;
		};

		// ancients prep
		let ancientsPrep = function () {
			Town.goToTown();
			Town.fillTome(sdk.items.TomeofTownPortal);
			Town.buyPots(10, "Thawing", true);
			Town.buyPots(10, "Antidote", true);
			Town.buyPots(10, "Stamina", true);
			Town.buyPotions();
			Pather.usePortal(sdk.areas.ArreatSummit, me.name);
		};

		Town.doChores();
		print('starting ancients');
		me.overhead("ancients");

		Pather.useWaypoint(sdk.areas.AncientsWay);
		Precast.doPrecast(true);
		Pather.moveToExit(sdk.areas.ArreatSummit, true); // enter Arreat Summit

		// failed to move to Arreat Summit
		if (me.area !== sdk.areas.ArreatSummit) return false;

		// ancients prep
		Town.doChores();
		Town.buyPots(10, "Thawing", true);
		Town.buyPots(10, "Antidote", true);
		Town.buyPots(10, "Stamina", true);

		let tempConfig = Misc.copy(Config); // save and update config settings
		let townChicken = getScript("tools/townchicken.js");
		townChicken && townChicken.running && townChicken.stop();

		Config.TownCheck = false;
		Config.MercWatch = false;
		Config.TownHP = 0;
		Config.TownMP = 0;
		Config.HPBuffer = 15;
		Config.MPBuffer = 15;
		Config.LifeChicken = 10;
		me.overhead('updated settings');

		Town.buyPotions();
		if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
			print("ÿc8(Questing)ÿc1 :: Failed to take portal back to Arreat Summit");
			Pather.journeyTo(sdk.areas.ArreatSummit); // enter Arreat Summit
		}
		
		Precast.doPrecast(true);

		// move to altar
		if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, 546)) {
			print("ÿc8(Questing)ÿc1 :: Failed to move to ancients' altar");
		}

		touchAltar(); //activate altar

		// wait for ancients to spawn
		while (!getUnit(sdk.unittype.Monster, sdk.monsters.TalictheDefender)) {
			delay(250 + me.ping);
		}

		// reroll ancients if unable to attack
		while (!canAncients()) {
			Pather.makePortal(true);
			ancientsPrep();
			Pather.usePortal(sdk.areas.ArreatSummit, me.name);
			touchAltar();

			while (!getUnit(sdk.unittype.Monster, sdk.monsters.TalictheDefender)) {
				delay(10 + me.ping);
			}
		}

		for (let i = 0; i < 3 && !me.ancients; i++) {
			Attack.clearList([getUnit(2, sdk.monsters.KorlictheProtector), getUnit(2, sdk.monsters.TalictheDefender), getUnit(2, sdk.monsters.MadawctheGuardian)]);
			Pather.moveTo(10048, 12628);

			if (!Misc.checkQuest(39, 0)) {
				me.overhead("Failed to kill anicents. Attempt: " + i);
				touchAltar(); //activate altar
			}
		}
		
		me.cancel();
		Config = tempConfig;
		me.overhead('restored settings');
		Precast.doPrecast(true);

		try {
			if (Misc.checkQuest(39, 0)) {
				Pather.clearToExit(sdk.areas.ArreatSummit, sdk.areas.WorldstoneLvl1, true);
				Pather.clearToExit(sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2, true);
				Pather.getWP(sdk.areas.WorldstoneLvl2);
			}
		} catch (err) {
			print('ÿc8(Questing)ÿc1 :: Cleared Ancients. Failed to get WSK Waypoint');
		}

		return true;
	};

	for (let i = 0; i < quests.length; i += 1) {
		me.inTown && Town.doChores();
		
		let j;

		for (j = 0; j < 3; j += 1) {
			if (!Misc.checkQuest(quests[i][0], 0)) {
				try {
					if (this[quests[i][1]]()) {
						break;
					}
				} catch (e) {
					continue;
				}
			} else {
				break;
			}
		}

		j === 3 && D2Bot.printToConsole("Quest " + quests[i][1] + " failed.");
	}

	if (Config.Questing.StopProfile || Loader.scriptList.length === 1) {
		D2Bot.printToConsole("All quests done. Stopping profile.", 5);
		D2Bot.stop();
	} else {
		print("ÿc9(Questing) :: ÿc2Complete");
		// reload town chicken in case we are doing others scripts after this one finishes
		let townChick = getScript("tools/TownChicken.js");
		(Config.TownHP > 0 || Config.TownMP > 0) && townChick && !townChick.running && load("tools/TownChicken.js");
	}

	return true;
}
