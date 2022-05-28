/**
*  @filename    Questing.js
*  @author      kolton, theBGuy
*  @desc        Do quests, only most popular ones for now
*
*/

function Questing() {
	const log = (msg = "", errorMsg = false) => {
		me.overhead(msg);
		console.log("ÿc9(Questing) :: " + (errorMsg ? "ÿc1" : "ÿc0") + msg);
	};

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

	this.killRadament = function () {
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
		object(sdk.units.RedPortalToAct5) && Pather.useUnit(2, sdk.units.RedPortalToAct5, sdk.areas.Harrogath);

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

	this.killShenk = function () {
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

	// save barbs?

	this.freeAnya = function () {
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

		log('updated settings');

		Town.buyPotions();
		if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
			log("Failed to take portal back to Arreat Summit", true);
			Pather.journeyTo(sdk.areas.ArreatSummit); // enter Arreat Summit
		}
		
		Precast.doPrecast(true);

		// move to altar
		if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, 546)) {
			log("Failed to move to ancients' altar", true);
		}

		Common.Ancients.touchAltar(); //activate altar
		Common.Ancients.startAncients(true);
		
		me.cancel();
		Config = tempConfig;
		log('restored settings');
		Precast.doPrecast(true);

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
		log("ÿc9(Questing) :: ÿc2Complete");
		// reload town chicken in case we are doing others scripts after this one finishes
		let townChick = getScript("tools/TownChicken.js");
		(Config.TownHP > 0 || Config.TownMP > 0) && (townChick && !townChick.running || !townChick) && load("tools/TownChicken.js");
	}

	return true;
}
