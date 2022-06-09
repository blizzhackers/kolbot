/**
*  @filename    Questing.js
*  @author      kolton, theBGuy
*  @desc        Do simple quests, the ones that don't have a lot of pre-reqs for now
*
*/

// @notes: can't do duriel or meph because all the extra tasks. this is not meant to be autoplay or self rush

function Questing() {
	const log = (msg = "", errorMsg = false) => {
		me.overhead(msg);
		console.log("ÿc9(Questing) :: " + (errorMsg ? "ÿc1" : "ÿc0") + msg);
	};

	let quests = [
		[1, "den"],
		[3, "smith"],
		[4, "cain"],
		[6, "andy"],
		[9, "radament"],
		[17, "lamEssen"],
		[25, "izual"],
		[26, "diablo"],
		[35, "shenk"],
		[36, "barbs"],
		[37, "anya"],
		[39, "ancients"],
		[40, "baal"]
	];

	this.den = function () {
		log("starting den");

		if (!Town.goToTown(1) || !Pather.moveToExit([sdk.areas.BloodMoor, sdk.areas.DenofEvil], true)) {
			throw new Error();
		}

		Precast.doPrecast(true);
		Attack.clearLevel();
		Town.goToTown();
		Town.npcInteract("Akara");

		return true;
	};

	this.smith = function () {
		if (Misc.checkQuest(3, 1)) return true;

		log("starting smith");
		if (!Loader.runScript("Smith")) throw new Error();

		let malusChest = object(sdk.quest.chest.MalusHolder);
		!!malusChest && malusChest.distance > 5 && Pather.moveToUnit(malusChest);
		Misc.openChest(malusChest);
		let malus = Misc.poll(() => item(sdk.quest.item.HoradricMalus), 1000, 100);
		Pickit.pickItem(malus);
		Town.goToTown();
		Town.npcInteract("Charsi");

		return !!Misc.checkQuest(3, 1);
	};

	this.cain = function () {
		log("starting cain");

		Town.doChores();
		Common.Questing.cain();

		return true;
	};

	this.andy = function () {
		log("starting andy");

		Town.doChores();
		Pather.useWaypoint(sdk.areas.CatacombsLvl2, true);
		Precast.doPrecast(true);

		if (!Pather.moveToExit([sdk.areas.CatacombsLvl3, sdk.areas.CatacombsLvl4], true) || !Pather.moveTo(22582, 9612)) {
			throw new Error("andy failed");
		}

		let coords = [
			{x: 22572, y: 9635}, {x: 22554, y: 9618},
			{x: 22542, y: 9600}, {x: 22572, y: 9582},
			{x: 22554, y: 9566}
		];

		if (Pather.useTeleport()) {
			Pather.moveTo(22571, 9590);
		} else {
			while (coords.length) {
				let andy = monster(sdk.monsters.Andariel);

				if (andy && andy.distance < 15) {
					break;
				}

				Pather.moveToUnit(coords[0]);
				Attack.clearClassids(61);
				coords.shift();
			}
		}

		Attack.kill(sdk.monsters.Andariel);
		Town.goToTown();
		Town.npcInteract("Warriv", false);
		Misc.useMenu(sdk.menu.GoEast);

		return true;
	};

	this.radament = function () {
		if (!Pather.accessToAct(2)) return false;

		log("starting radament");

		if (!Town.goToTown() || !Pather.useWaypoint(sdk.areas.A2SewersLvl2, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(sdk.areas.HallsoftheDeadLvl3, true)
			|| !Pather.moveToPreset(me.area, 2, sdk.quest.chest.HoradricCubeChest)) {
			throw new Error("cube failed");
		}

		Attack.kill(sdk.monsters.Radament);

		let book = item(sdk.quest.item.BookofSkill);
		book && Pickit.pickItem(book) && book.use();

		Town.goToTown();
		Town.npcInteract("Atma");

		return true;
	};

	this.lamEssen = function () {
		if (!Pather.accessToAct(3)) return false;

		log("starting lam essen");

		if (!Town.goToTown() || !Pather.useWaypoint(sdk.areas.KurastBazaar, true)) {
			throw new Error("Lam Essen quest failed");
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(sdk.areas.RuinedTemple, true)
			|| !Pather.moveToPreset(me.area, 2, sdk.quest.chest.LamEsensTomeHolder)) {
			throw new Error("Lam Essen quest failed");
		}

		Misc.openChest(sdk.quest.chest.LamEsensTomeHolder);
		let book = Misc.poll(() => item(sdk.quest.item.LamEsensTome), 1000, 100);

		Pickit.pickItem(book);
		Town.goToTown();
		Town.npcInteract("Alkor");

		return true;
	};

	this.izual = function () {
		if (!Pather.accessToAct(4)) return false;
		
		log("starting izual");
		if (!Loader.runScript("Izual")) throw new Error();
		Town.goToTown();
		Town.npcInteract("Tyrael");

		return true;
	};

	this.diablo = function () {
		if (!Pather.accessToAct(4)) return false;
		if (Misc.checkQuest(26, 0)) return true;

		log("starting diablo");
		if (!Loader.runScript("Diablo")) throw new Error();
		Town.goToTown(4);

		object(sdk.units.RedPortalToAct5)
			? Pather.useUnit(2, sdk.units.RedPortalToAct5, sdk.areas.Harrogath)
			: Town.npcInteract("Tyrael", false) && Misc.useMenu(sdk.menu.TravelToHarrogath);

		return true;
	};

	this.shenk = function () {
		if (!Pather.accessToAct(5)) return false;
		if (Misc.checkQuest(35, 1)) return true;

		log("starting shenk");

		if (!Town.goToTown() || !Pather.useWaypoint(sdk.areas.FrigidHighlands, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);
		Pather.moveTo(3883, 5113);
		Attack.kill(getLocaleString(sdk.locale.monsters.ShenktheOverseer));
		Town.goToTown();

		return true;
	};

	this.barbs = function () {
		if (!Pather.accessToAct(5)) return false;

		log("starting barb rescue");

		Pather.journeyTo(sdk.areas.FrigidHighlands);
		Precast.doPrecast(true);

		let barbs = (getPresetUnits(me.area, 2, 473) || []);

		if (!barbs.length) {
			log("Couldn't find the barbs");
			
			return false;
		}

		let coords = [];

		// Dark-f: x-3
		for (let cage = 0; cage < barbs.length; cage += 1) {
			coords.push({
				x: barbs[cage].roomx * 5 + barbs[cage].x - 3,
				y: barbs[cage].roomy * 5 + barbs[cage].y
			});
		}

		for (let i = 0; i < coords.length; i += 1) {
			log((i + 1) + "/" + coords.length);
			Pather.moveToUnit(coords[i], 2, 0);
			let door = monster(sdk.quest.chest.BarbCage);

			if (door) {
				Pather.moveToUnit(door, 1, 0);
				Attack.kill(door);
			}

			delay(1500 + me.ping);
		}

		Town.npcInteract("qual_kehk");

		return !!Misc.checkQuest(36, 0);
	};

	this.anya = function () {
		if (!Pather.accessToAct(5)) return false;
		if (Misc.checkQuest(37, 1)) return true;

		log("starting anya");

		if (!Town.goToTown() || !Pather.useWaypoint(113, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(sdk.areas.FrozenRiver, true)
			|| !Pather.moveToPreset(me.area, 2, sdk.unit.FrozenAnyasPlatforn)) {
			throw new Error("Anya quest failed");
		}

		delay(1000);

		let anya = object(sdk.units.FrozenAnya);

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

		// unfreeze her, cancel her speech again
		anya.interact();
		delay(300);
		me.cancel();

		// get reward
		Town.goToTown();
		Town.npcInteract("Malah");

		let scroll = me.scrollofresistance;
		scroll && clickItem(1, scroll);

		return true;
	};

	// @theBGuy
	this.ancients = function () {
		Town.doChores();
		log('starting ancients');

		Pather.useWaypoint(sdk.areas.AncientsWay);
		Precast.doPrecast(true);
		Pather.moveToExit(sdk.areas.ArreatSummit, true);

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

		log('updated settings');

		Town.buyPotions();
		// re-enter Arreat Summit
		if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
			log("Failed to take portal back to Arreat Summit", true);
			Pather.journeyTo(sdk.areas.ArreatSummit);
		}
		
		Precast.doPrecast(true);

		// move to altar
		if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, sdk.quest.chest.AncientsAltar)) {
			log("Failed to move to ancients' altar", true);
		}

		Common.Ancients.touchAltar();
		Common.Ancients.startAncients(true);
		
		me.cancel();
		Config = tempConfig;
		log('restored settings');
		Precast.doPrecast(true);

		// reload town chicken in case we are doing others scripts after this one finishes
		let townChick = getScript("tools/TownChicken.js");
		(Config.TownHP > 0 || Config.TownMP > 0) && (townChick && !townChick.running || !townChick) && load("tools/TownChicken.js");

		try {
			if (Misc.checkQuest(39, 0)) {
				Pather.moveToExit([sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2], true);
				Pather.getWP(sdk.areas.WorldstoneLvl2);
			}
		} catch (err) {
			log('Cleared Ancients. Failed to get WSK Waypoint', true);
		}

		return true;
	};

	this.baal = function () {
		log("starting baal");
		// just run baal script? I mean why re-invent the wheel here
		Loader.runScript("Baal");
		Town.goToTown(5);

		return true;
	};

	let didTask = false;

	me.inTown && Town.doChores();

	for (let i = 0; i < quests.length; i += 1) {
		didTask && me.inTown && Town.doChores();
		let j;

		for (j = 0; j < 3; j += 1) {
			if (!Misc.checkQuest(quests[i][0], 0)) {
				try {
					if (this[quests[i][1]]()) {
						didTask = true;
						
						break;
					}
				} catch (e) {
					continue;
				}
			} else {
				didTask = false;

				break;
			}
		}

		j === 3 && D2Bot.printToConsole("Questing :: " + quests[i][1] + " quest failed.", 9);
	}

	if (Config.Questing.StopProfile || Loader.scriptList.length === 1) {
		D2Bot.printToConsole("All quests done. Stopping profile.", 5);
		D2Bot.stop();
	} else {
		log("ÿc9(Questing) :: ÿc2Complete");
		// reload town chicken in case we are doing others scripts after this one finishes
		let townChick = getScript("tools/TownChicken.js");
		(Config.TownHP > 0 || Config.TownMP > 0) && (townChick && !townChick.running || !townChick) && load("tools/TownChicken.js");
	}

	return true;
}
