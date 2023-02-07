/**
*  @filename    Questing.js
*  @author      kolton, theBGuy
*  @desc        Do simple quests, the ones that don't have a lot of pre-reqs for now
*
*/

// @notes: can't do duriel or meph because all the extra tasks. this is not meant to be autoplay or self rush

function Questing () {
	const log = (msg = "", errorMsg = false) => {
		me.overhead(msg);
		console.log("ÿc9(Questing) :: " + (errorMsg ? "ÿc1" : "ÿc0") + msg);
	};

	const getQuestItem = (item) => {
		if (item) {
			let id = item.classid;
			let canFit = Storage.Inventory.CanFit(item);
			if (!canFit && Pickit.canMakeRoom()) {
				console.log("ÿc7Trying to make room for " + Item.color(item) + item.name);
				Town.visitTown();
				!copyUnit(item).x && (item = Misc.poll(() => Game.getItem(id)));
			}
		}
		return Pickit.pickItem(item);
	};

	const den = function () {
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

	const smith = function () {
		if (Misc.checkQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete)) return true;

		log("starting smith");
		include("core/Common/Smith.js");

		return Common.Smith();
	};

	const cain = function () {
		include("core/Common/Cain.js");
		log("starting cain");

		Town.doChores();
		Common.Cain.run();

		return true;
	};

	const andy = function () {
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
				let andy = Game.getMonster(sdk.monsters.Andariel);

				if (andy && andy.distance < 15) {
					break;
				}

				Pather.moveToUnit(coords[0]);
				Attack.clearClassids(sdk.monsters.DarkShaman1);
				coords.shift();
			}
		}

		Attack.kill(sdk.monsters.Andariel);
		Town.goToTown();
		Town.npcInteract("Warriv", false);
		Misc.useMenu(sdk.menu.GoEast);

		return true;
	};

	const radament = function () {
		if (!Pather.accessToAct(2)) return false;

		log("starting radament");

		if (!Pather.journeyTo(sdk.areas.A2SewersLvl3)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToPreset(sdk.areas.A2SewersLvl3, sdk.unittype.Object, sdk.quest.chest.HoradricScrollChest)) {
			throw new Error("radament failed");
		}

		Attack.kill(sdk.monsters.Radament);

		let book = Game.getItem(sdk.quest.item.BookofSkill);
		getQuestItem(book);

		Town.goToTown();
		Town.npcInteract("Atma");

		return true;
	};

	const lamEssen = function () {
		if (!Pather.accessToAct(3)) return false;

		log("starting lam essen");

		if (!Pather.journeyTo(sdk.areas.RuinedTemple)) {
			throw new Error("Lam Essen quest failed");
		}

		Precast.doPrecast(true);

		if (!Pather.moveToPreset(sdk.areas.RuinedTemple, sdk.unittype.Object, sdk.quest.chest.LamEsensTomeHolder)) {
			throw new Error("Lam Essen quest failed");
		}

		Misc.openChest(sdk.quest.chest.LamEsensTomeHolder);
		let book = Misc.poll(() => Game.getItem(sdk.quest.item.LamEsensTome), 1000, 100);
		getQuestItem(book);
		Town.goToTown();
		Town.npcInteract("Alkor");

		return true;
	};

	const izual = function () {
		if (!Pather.accessToAct(4)) return false;
		
		log("starting izual");
		if (!Loader.runScript("Izual")) throw new Error();
		Town.goToTown();
		Town.npcInteract("Tyrael");

		return true;
	};

	const diablo = function () {
		if (!Pather.accessToAct(4)) return false;
		if (Misc.checkQuest(sdk.quest.id.TerrorsEnd, sdk.quest.states.Completed)) return true;

		log("starting diablo");
		if (!Loader.runScript("Diablo")) throw new Error();
		Town.goToTown(4);

		Game.getObject(sdk.objects.RedPortalToAct5)
			? Pather.useUnit(sdk.unittype.Object, sdk.objects.RedPortalToAct5, sdk.areas.Harrogath)
			: Town.npcInteract("Tyrael", false) && Misc.useMenu(sdk.menu.TravelToHarrogath);

		return true;
	};

	const shenk = function () {
		if (!Pather.accessToAct(5)) return false;
		if (Misc.checkQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete)) return true;

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

	const barbs = function () {
		if (!Pather.accessToAct(5)) return false;

		log("starting barb rescue");

		Pather.journeyTo(sdk.areas.FrigidHighlands);
		Precast.doPrecast(true);

		let barbs = (Game.getPresetObjects(me.area, sdk.quest.chest.BarbCage) || []);

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
			let door = Game.getMonster(sdk.monsters.PrisonDoor);

			if (door) {
				Pather.moveToUnit(door, 1, 0);
				Attack.kill(door);
			}

			delay(1500 + me.ping);
		}

		Town.npcInteract("qual_kehk");

		return !!Misc.checkQuest(sdk.quest.id.RescueonMountArreat, sdk.quest.states.Completed);
	};

	const anya = function () {
		if (!Pather.accessToAct(5)) return false;
		if (Misc.checkQuest(sdk.quest.id.PrisonofIce, sdk.quest.states.ReqComplete)) return true;

		log("starting anya");

		if (!Pather.journeyTo(sdk.areas.CrystalizedPassage)) {
			throw new Error();
		}

		Precast.doPrecast(true);

		if (!Pather.moveToPreset(sdk.areas.FrozenRiver, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform)) {
			throw new Error("Anya quest failed");
		}

		delay(1000);

		let anya = Game.getObject(sdk.objects.FrozenAnya);

		// talk to anya, then cancel her speech
		if (anya) {
			Pather.moveToUnit(anya);
			Packet.entityInteract(anya);
			Misc.poll(() => getIsTalkingNPC(), 2000, 50);
			me.cancel();
		}

		// get pot from malah, then return to anya
		Town.goToTown();
		Town.npcInteract("Malah");
		if (!Misc.poll(() => {
			Pather.usePortal(sdk.areas.FrozenRiver, me.name);
			return me.inArea(sdk.areas.FrozenRiver);
		}, Time.seconds(30), 1000)) throw new Error("Anya quest failed - Failed to return to frozen river");

		// unfreeze her, cancel her speech again
		if (anya) {
			Pather.moveToUnit(anya, 1, 2);
			Packet.entityInteract(anya);
			Misc.poll(() => getIsTalkingNPC() || anya.mode, 2000, 50);
			me.cancel() && me.cancel();
		}

		// get reward
		Town.goToTown();
		Town.npcInteract("Malah");

		let scroll = me.scrollofresistance;
		!!scroll && scroll.use();

		return true;
	};

	// @theBGuy
	const ancients = function () {
		include("core/Common/Ancients.js");
		Town.doChores();
		log("starting ancients");

		Pather.useWaypoint(sdk.areas.AncientsWay);
		Precast.doPrecast(true);
		Pather.moveToExit(sdk.areas.ArreatSummit, true);

		// failed to move to Arreat Summit
		if (!me.inArea(sdk.areas.ArreatSummit)) return false;

		// ancients prep
		Town.doChores();
		[sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.ThawingPotion].forEach(p => Town.buyPots(10, p, true));

		let tempConfig = copyObj(Config); // save and update config settings
		let townChicken = getScript("threads/townchicken.js");
		townChicken && townChicken.running && townChicken.stop();

		Config.TownCheck = false;
		Config.MercWatch = false;
		Config.TownHP = 0;
		Config.TownMP = 0;
		Config.HPBuffer = 15;
		Config.MPBuffer = 15;
		Config.LifeChicken = 10;

		log("updated settings");

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
		log("restored settings");
		Precast.doPrecast(true);

		// reload town chicken in case we are doing others scripts after this one finishes
		let townChick = getScript("threads/TownChicken.js");
		(Config.TownHP > 0 || Config.TownMP > 0) && (townChick && !townChick.running || !townChick) && load("threads/TownChicken.js");

		try {
			if (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.Completed)) {
				Pather.moveToExit([sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2], true);
				Pather.getWP(sdk.areas.WorldstoneLvl2);
			}
		} catch (err) {
			log("Cleared Ancients. Failed to get WSK Waypoint", true);
		}

		return true;
	};

	const baal = function () {
		log("starting baal");
		// just run baal script? I mean why re-invent the wheel here
		Loader.runScript("Baal");
		Town.goToTown(5);

		return true;
	};

	const index = {
		"den": {
			id: sdk.quest.id.DenofEvil,
			run: () => den(),
		},
		"smith": {
			id: sdk.quest.id.ToolsoftheTrade,
			run: () => smith(),
		},
		"cain": {
			id: sdk.quest.id.TheSearchForCain,
			run: () => cain(),
		},
		"andy": {
			id: sdk.quest.id.SistersToTheSlaughter,
			run: () => andy(),
		},
		"radament": {
			id: sdk.quest.id.RadamentsLair,
			run: () => radament(),
		},
		"lamEssen": {
			id: sdk.quest.id.LamEsensTome,
			run: () => lamEssen(),
		},
		"izual": {
			id: sdk.quest.id.TheFallenAngel,
			run: () => izual(),
		},
		"diablo": {
			id: sdk.quest.id.TerrorsEnd,
			run: () => diablo(),
		},
		"shenk": {
			id: sdk.quest.id.SiegeOnHarrogath,
			run: () => shenk(),
		},
		"barbs": {
			id: sdk.quest.id.RescueonMountArreat,
			run: () => barbs(),
		},
		"anya": {
			id: sdk.quest.id.PrisonofIce,
			run: () => anya(),
		},
		"ancients": {
			id: sdk.quest.id.RiteofPassage,
			run: () => ancients(),
		},
		"baal": {
			id: sdk.quest.id.EyeofDestruction,
			run: () => baal(),
		},
	};

	Object.defineProperty(index, "complete", {
		value: function () {
			return !!Misc.checkQuest(this.id, sdk.quest.states.Completed);
		}
	});

	let didTask = false;
	me.inTown && Town.doChores();

	Object.keys(index).forEach(quest => {
		didTask && me.inTown && Town.doChores();
		let j;

		for (j = 0; j < 3; j += 1) {
			if (!index[quest].complete()) {
				try {
					if (index[quest].run()) {
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

		j === 3 && D2Bot.printToConsole("Questing :: " + quest + " quest failed.", sdk.colors.D2Bot.Red);
	});

	if (Config.Questing.StopProfile || Loader.scriptList.length === 1) {
		D2Bot.printToConsole("All quests done. Stopping profile.", sdk.colors.D2Bot.Green);
		D2Bot.stop();
	} else {
		log("ÿc9(Questing) :: ÿc2Complete");
		// reload town chicken in case we are doing others scripts after this one finishes
		let townChick = getScript("threads/TownChicken.js");
		(Config.TownHP > 0 || Config.TownMP > 0) && (townChick && !townChick.running || !townChick) && load("threads/TownChicken.js");
	}

	return true;
}
