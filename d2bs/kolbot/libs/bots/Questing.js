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

		Town.doChores();
		Pather.useWaypoint(sdk.areas.OuterCloister);
		Precast.doPrecast(true);

		if (!Pather.moveToPreset(sdk.areas.Barracks, sdk.unittype.Object, sdk.quest.chest.MalusHolder)) {
			throw new Error("Failed to move to the Smith");
		}

		Attack.kill(getLocaleString(sdk.locale.monsters.TheSmith));
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

		MainLoop:
		while (true) {
			switch (true) {
			case !item(sdk.quest.item.ScrollofInifuss) && !item(sdk.quest.item.KeytotheCairnStones) && !Misc.checkQuest(4, 4):
				Pather.useWaypoint(sdk.areas.DarkWood, true);
				Precast.doPrecast(true);

				if (!Pather.moveToPreset(sdk.areas.DarkWood, 2, 30, 5, 5)) {
					throw new Error("Failed to move to Tree of Inifuss");
				}

				let tree = object(sdk.quest.chest.InifussTree);
				!!tree && tree.distance > 5 && Pather.moveToUnit(tree);
				Misc.openChest(tree);
				let scroll = Misc.poll(() => item(sdk.quest.item.ScrollofInifuss), 1000, 100);

				Pickit.pickItem(scroll);
				Town.goToTown();
				Town.npcInteract("Akara");
				
				break;
			case item(sdk.quest.item.ScrollofInifuss):
				Town.goToTown(1);
				Town.npcInteract("Akara");

				break;
			case item(sdk.quest.item.KeytotheCairnStones) && me.area !== sdk.areas.StonyField:
				Pather.journeyTo(sdk.areas.StonyField);
				Precast.doPrecast(true);

				break;
			case item(sdk.quest.item.KeytotheCairnStones) && me.area === sdk.areas.StonyField:
				Pather.moveToPreset(sdk.areas.StonyField, 1, 737, 10, 10, false, true);
				Attack.securePosition(me.x, me.y, 40, 3000, true);
				Pather.moveToPreset(sdk.areas.StonyField, 2, 17, null, null, true);
				let stones = [
					object(sdk.quest.chest.StoneAlpha),
					object(sdk.quest.chest.StoneBeta),
					object(sdk.quest.chest.StoneGamma),
					object(sdk.quest.chest.StoneDelta),
					object(sdk.quest.chest.StoneLambda)
				];

				while (stones.some((stone) => !stone.mode)) {
					for (let i = 0; i < stones.length; i++) {
						let stone = stones[i];

						if (Misc.openChest(stone)) {
							stones.splice(i, 1);
							i--;
						}
						delay(10);
					}
				}

				let tick = getTickCount();
				// wait up to two minutes
				while (getTickCount() - tick < minutes(2)) {
					if (Pather.getPortal(sdk.areas.Tristram)) {
						Pather.usePortal(sdk.areas.Tristram);
								
						break;
					}
				}

				break;
			case me.area === sdk.areas.Tristram && !Misc.checkQuest(4, 0):
				let gibbet = object(sdk.quest.chest.CainsJail);

				if (gibbet && !gibbet.mode) {
					Pather.moveTo(gibbet.x, gibbet.y);
					if (Misc.poll(() => Misc.openChest(gibbet), 2000, 100)) {
						Town.goToTown(1);
						Town.npcInteract("Akara") && log("Akara done");
					}
				}

				break;
			default:
				break MainLoop;
			}
		}
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

				Pather.moveTo(coords.x, coords.y);
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

		if (!Pather.moveToExit(sdk.areas.A2SewersLvl3, true) || !Pather.moveToPreset(me.area, 2, 355)) {
			throw new Error();
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

		if (!Town.goToTown() || !Pather.useWaypoint(80, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(94, true) || !Pather.moveToPreset(me.area, 2, 193)) {
			throw new Error();
		}

		Misc.openChest(193);
		let book = Misc.poll(() => item(sdk.quest.item.LamEsensTome), 1000, 100);

		Pickit.pickItem(book);
		Town.goToTown();
		Town.npcInteract("Alkor");

		return true;
	};

	this.izual = function () {
		if (!Pather.accessToAct(4)) return false;

		log("starting izual");

		if (!Town.goToTown() || !Pather.useWaypoint(sdk.areas.CityoftheDamned, true)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToPreset(sdk.areas.PlainsofDespair, 1, sdk.monsters.Izual)) {
			return false;
		}

		Attack.kill(sdk.monsters.Izual);
		Town.goToTown();
		Town.npcInteract("Tyrael");

		return true;
	};

	this.diablo = function () {
		if (!Pather.accessToAct(4)) return false;
		if (Misc.checkQuest(26, 0)) return true;

		log("starting diablo");
		// just run diablo script? I mean why re-invent the wheel here
		Loader.runScript("Diablo");
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

		if (!Town.goToTown() || !Pather.useWaypoint(111, true)) {
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
		console.debug(barbs);

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

		console.debug(coords);

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

		if (!Pather.moveToExit(114, true) || !Pather.moveToPreset(me.area, 2, 460)) {
			throw new Error();
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
		if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, 546)) {
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
