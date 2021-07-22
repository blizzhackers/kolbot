/*
*	@filename	Globals.js
*	@author		isid0re
*	@desc		Global variables Settings, general functions for SoloLeveling functionality
*/

if (!isIncluded("OOG.js")) {
	include("OOG.js");
}

// general settings
var Difficulty = ['Normal', 'Nightmare', 'Hell'];

var SetUp = {
	scripts: [
		"den", "bloodraven", "tristram", "countess", /*"smith",*/ "pits", "andariel", "cows", // Act 1
		"cube", "radament", "amulet", "summoner", "tombs", "ancienttunnels", "staff", "duriel", // Act 2
		"templeruns", "eye", "heart", "brain", "travincal", "mephisto", // Act 3
		"izual", "hellforge", "diablo", //Act 4
		"shenk", "savebarby", "anya", "ancients", "baal", // Act 5
	],

	include: function () {
		var folders = ["Functions"];
		folders.forEach( (folder) => {
			var files = dopen("libs/SoloLeveling/" + folder + "/").getFiles();
			files.forEach( (file) => {
				if (file.slice(file.length - 3) === ".js") {
					if (!isIncluded("SoloLeveling/" + folder + "/" + file)) {
						if (!include("SoloLeveling/" + folder + "/" + file)) {
							throw new Error("Failed to include " + "SoloLeveling/" + folder + "/" + file);
						}
					}
				}
			});
		});
	},

	//Storage Settings
	sortSettings: {
		ItemsSortedFromLeft: [], // default: everything not in Config.ItemsSortedFromRight
		ItemsSortedFromRight: [
			// (NOTE: default pickit is fastest if the left side is open)
			603, 604, 605, // sort charms from the right
			519, 518, 543, // sort tomes and keys to the right
			515, 516, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596 // sort all inventory potions from the right
		],
		PrioritySorting: true,
		ItemsSortedFromLeftPriority: [/*605, 604, 603, 519, 518*/], // (NOTE: the earlier in the index, the further to the Left)
		ItemsSortedFromRightPriority: [
			// (NOTE: the earlier in the index, the further to the Right)
			519, 518, 605, 604, 603, 543 // sort charms from the right, Books > GC > LC > SC
		],
	},

	levelCap: [33, 65, 100][me.diff],
	className: ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"][me.classid],
	finalBuild: DataFile.getStats().finalBuild,
	respecOne: [ 25, 28, 26, 19, 31, 24, 30][me.classid],

	respecTwo: function () {
		let respec;

		switch (me.gametype) {
		case 0:
			respec = [75, 75, 75, 85, 75, 75, 75][me.classid];
			break;

		case 1:
			switch (this.finalBuild) {
			case "Witchyzon":
				respec = Check.haveItem("diamondbow", "unique", "Witchwild String") ? me.charlvl : 100;
				break;
			case "Javazon":
			case "Lightning":
			case "Blova":
				respec = Attack.checkInfinity() ? me.charlvl : 100;
				break;
			case "Cold":
			case "Meteorb":
			case "Blizzballer":
				respec = Check.haveItem("amulet", "set", "Tal Rasha's Adjudication") && Check.haveItem("belt", "set", "Tal Rasha's Fine-Spun Cloth") && Check.haveItem("armor", "set", "Tal Rasha's Guardianship") && Check.haveItem("swirlingcrystal", "set", "Tal Rasha's Lidless Eye") ? me.charlvl : 100; //Tal ammy, belt, armor, and wep
				break;
			case "Bone":
			case "Poison":
			case "Summon":
			case "Hammerdin":
			case "Elemental":
			case "Wind":
			case "Trapsin":
			case "Singer":
				respec = Check.haveItem("armor", "runeword", "Enigma") ? me.charlvl : 100;
				break;
			case "Whirlwind":
			case "Smiter":
				respec = Check.haveItem("sword", "runeword", "Grief") ? me.charlvl : 100;
				break;
			case "Frenzy":
				respec = Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("sword", "runeword", "Breath of the Dying") ? me.charlvl : 100;
				break;
			case "Wolf":
				respec = Check.haveItem("stalagmite", "unique", "Ribcracker") && Check.haveItem("armor", "runeword", "Chains of Honor") ? me.charlvl : 100;
				break;
			case "Plaguewolf":
				respec = Check.haveItem("sword", "runeword", "Grief") && Check.haveItem("armor", "runeword", "Chains of Honor") ? me.charlvl : 100;
				break;
			}
		}

		return respec;
	},

	getBuild: function () {
		let buildType;

		if (me.charlvl < SetUp.respecOne) {
			buildType = "Start";
		} else if (me.charlvl >= SetUp.respecTwo()) {
			buildType = SetUp.finalBuild;
		} else {
			buildType = "Leveling";
		}

		return buildType;
	},

	specPush: function (specType) {
		function getBuildTemplate () {
			let buildType = SetUp.getBuild();
			let build = buildType + "Build" ;
			let classname = SetUp.className;
			let template = "SoloLeveling/BuildFiles/" + classname + "." + build + ".js";

			return template.toLowerCase();
		}

		var template = getBuildTemplate();

		if (!include(template)) {
			throw new Error("Failed to include template: " + template);
		}

		let specCheck = [];

		switch (specType) {
		case "skills":
			specCheck = JSON.parse(JSON.stringify(build.skills));	//push skills value from template file
			break;
		case "stats":
			specCheck = JSON.parse(JSON.stringify(build.stats)); //push stats value from template file
			break;
		}

		return specCheck;
	},
};

// SoloLeveling Pickit Items
var nipItems = {
	Selling: [
		'([type] == ring || [type] == amulet) && [quality] >= magic # [fcr] >= 600',
		'([type] == armor || [type] == boots || [type] == gloves || [type] == belt) && [quality] >= magic # [fcr] >= 600',
		'([type] == helm || [type] == circlet || [type] == primalhelm || [type] == pelt) && [quality] >= magic # [fcr] >= 600',
		'([type] == anyshield || [type] == voodooheads) && [quality] >= magic # [fcr] >= 600',
		'([type] == javelin || [type] == amazonspear || [type] == amazonjavelin) && [quality] >= rare # [fcr] >= 600',
		'([type] == orb || [type] == wand || [type] == staff) && [quality] >= normal # [fcr] >= 600',
		'([type] == throwingaxe || [type] == axe || [type] == mace || [type] == club || [type] == scepter || [type] == hammer) && [quality] >= magic # [fcr] >= 600',
		'([type] == sword || [type] == knife || [type] == throwingknife) && [quality] >= magic # [fcr] >= 600',
		'([type] == bow || [type] == crossbow) && [quality] >= rare # [fcr] >= 600',
		'([type] == handtohand || [type] == assassinclaw) && [quality] >= magic  # [fcr] >= 600',
	],

	General: [
		"[name] == tomeoftownportal",
		"[name] == tomeofidentify",
		"[name] == gold # [gold] >= me.charlvl * 3 * me.diff",
		"me.normal && [name] == minorhealingpotion",
		"[name] == lighthealingpotion",
		"[name] == healingpotion",
		"[name] == greaterhealingpotion",
		"[name] == superhealingpotion",
		"me.normal && [name] == minormanapotion",
		"[name] == lightmanapotion",
		"[name] == manapotion",
		"[name] == greatermanapotion",
		"[name] == supermanapotion",
		"[name] == rejuvenationpotion",
		"[name] == fullrejuvenationpotion",
		"[name] == ScrollofTownPortal # # [MaxQuantity] == 20",
		"[name] == scrollofidentify # # [MaxQuantity] == 20",
		"[name] == key # # [maxquantity] == 12",
		"[name] == perfectamethyst # # [MaxQuantity] == 2",
		"[name] == perfectemerald # # [MaxQuantity] == 2",
		"[name] == perfecttopaz # # [MaxQuantity] == 2",
		"[name] == perfectdiamond # # [MaxQuantity] == 2",
		"[name] == perfectruby # # [MaxQuantity] == 2",
		"[name] == perfectsapphire # # [MaxQuantity] == 2",
		"[name] >= pulrune && [name] <= zodrune"
	],

	Quest: [
		"[Name] == ScrollOfInifuss",
		"[Name] == KeyToTheCairnStones",
		"[name] == BookOfSkill",
		"[Name] == HoradricCube",
		"[Name] == ShaftOfTheHoradricStaff",
		"[Name] == TopOfTheHoradricStaff",
		"[Name] == HoradricStaff",
		"[Name] == ajadefigurine",
		"[Name] == TheGoldenBird",
		"[Name] == potionoflife",
		"[Name] == lamesen'stome",
		"[Name] == Khalim'sEye",
		"[Name] == Khalim'sHeart",
		"[Name] == Khalim'sBrain",
		"[Name] == Khalim'sFlail",
		"[Name] == Khalim'sWill",
		"[Name] == malah'spotion",
		"[Name] == ScrollofResistance",
	],
};

// General Game functions
var Check = {
	Task: function (sequenceName) {
		let needRunes = this.Runes();

		switch (sequenceName.toLowerCase()) {
		case "den": //den
			if (!me.den) {
				return true;
			}

			break;
		case "bloodraven": //bloodraven
			if (me.normal && !me.bloodraven) {
				return true;
			}

			break;
		case "smith": //tools of the trade
			if (me.normal && !me.smith) {
				return true;
			}

			break;
		case "tristram": //tristram
			if (me.normal && me.charlvl < 15 || !me.normal && !me.tristram && (me.classic && me.diablo || me.baal)) {
				return true;
			}

			break;
		case "countess": //countess
			if (me.classic && !me.countess || !me.classic && (needRunes || !me.hell && !Check.Gold())) { // classic quest completed normal || have runes for difficulty
				return true;
			}

			break;
		case "pits": //pits
			if (me.hell) {
				return true;
			}

			break;
		case "andariel": //andy
			if (me.classic && me.hell || !me.classic && !me.normal || !me.andariel) {
				return true;
			}

			break;
		case "cube": //cube
			if (Pather.accessToAct(2) && !me.cube) {
				return true;
			}

			break;
		case "radament": //radament
			if (Pather.accessToAct(2) && !me.radament) {
				return true;
			}

			break;
		case "staff": //staff
			if (Pather.accessToAct(2) && !me.shaft && !me.staff && !me.horadricstaff) {
				return true;
			}

			break;
		case "amulet": //ammy
			if (Pather.accessToAct(2) && !me.amulet && !me.staff && !me.horadricstaff) {
				return true;
			}

			break;
		case "ancienttunnels": // ancient tunnels
			if (Pather.accessToAct(2) && me.hell && !me.paladin) { // no pally in hell magic immunes
				return true;
			}

			break;
		case "summoner": //summoner
			if (Pather.accessToAct(2) && !me.summoner) {
				return true;
			}

			break;
		case "tombs": //tombs
			if (Pather.accessToAct(2) && (me.normal && me.charlvl < 25 || !Check.Gold())) {
				return true;
			}

			break;
		case "duriel": //duriel
			if (Pather.accessToAct(2) && !me.duriel) {
				return true;
			}

			break;
		case "eye": // eye
			if (Pather.accessToAct(3) && !me.eye && !me.khalimswill && !me.travincal) {
				return true;
			}

			break;
		case "templeruns": //temple runs
			if (Pather.accessToAct(3) && (!me.lamessen || me.nightmare && me.charlvl < 50 || me.hell || !Check.Gold())) {
				return true;
			}

			break;
		case "heart": //heart
			if (Pather.accessToAct(3) && !me.heart && !me.khalimswill && !me.travincal) {
				return true;
			}

			break;
		case "brain": //brain
			if (Pather.accessToAct(3) && !me.brain && !me.khalimswill && !me.travincal) {
				return true;
			}

			break;
		case "travincal": //travincal
			if (Pather.accessToAct(3) && (me.charlvl < 25 || !me.travincal)) {
				return true;
			}

			break;
		case "mephisto": //mephisto
			if (Pather.accessToAct(3) && (!me.normal || !me.mephisto)) {
				return true;
			}

			break;
		case "izual": // izzy
			if (Pather.accessToAct(4) && !me.izual) {
				return true;
			}

			break;
		case "diablo": //diablo
			if (Pather.accessToAct(4)) {
				return true;
			}

			break;
		case "hellforge": // hellforge
			if (Pather.accessToAct(4) && !me.normal && !me.hellforge) {
				return true;
			}

			break;
		case "shenk": // shenk
			if (!me.classic && Pather.accessToAct(5)) {
				return true;
			}

			break;
		case "savebarby": //barbies
			if (!me.classic && Pather.accessToAct(5) && me.normal && !me.savebarby) {
				return true;
			}

			break;
		case "anya": //anya
			if (!me.classic && Pather.accessToAct(5)) {
				return true;
			}

			break;
		case "ancients": //ancients
			if (!me.classic && Pather.accessToAct(5) && !me.ancients) {
				return true;
			}

			break;
		case "baal": //baal
			if (!me.classic && Pather.accessToAct(5)) {
				return true;
			}

			break;
		case "cows": //cows
			if (!me.normal && !me.cows && (me.classic && me.diablo || me.baal)) {
				return true;
			}

			break;
		default:
			break;
		}

		return false;
	},

	Gold: function () {
		let gold = me.getStat(14) + me.getStat(15);
		let goldLimit = [10000, 50000, 100000][me.diff];

		if (me.normal && !Pather.accessToAct(2) || gold >= goldLimit) {
			return true;
		}

		me.overhead('low gold');

		return false;
	},

	Resistance: function () {
		let resStatus,
			resPenalty = me.classic ? [0, 20, 50, 50] : [ 0, 40, 100, 100],
			frRes = me.getStat(39),
			lrRes = me.getStat(41),
			crRes = me.getStat(43),
			prRes = me.getStat(45);

		if ((frRes - resPenalty[me.diff + 1] >= 0) && (lrRes - resPenalty[me.diff + 1] >= 0) && (crRes - resPenalty[me.diff + 1] >= 0)) {
			resStatus = true;
		} else {
			resStatus = false;
		}

		return {
			Status: resStatus,
			FR: frRes - resPenalty[me.diff],
			CR: crRes - resPenalty[me.diff],
			LR: lrRes - resPenalty[me.diff],
			PR: prRes - resPenalty[me.diff],
		};
	},

	nextDifficulty: function () {
		let diffShift = me.diff;
		let lowRes = !this.Resistance().Status;
		let lvlReq = me.charlvl >= SetUp.levelCap ? true : false;
		let diffCompleted = !me.classic && me.baal ? true : me.classic && me.diablo ? true : false;

		if (diffCompleted) {
			if (lvlReq) {
				if (!lowRes) {
					diffShift = me.diff + 1;
					D2Bot.printToConsole('SoloLeveling: next difficulty requirements met. Starting: ' + Difficulty[diffShift]);
				} else {
					if (me.charlvl >= SetUp.levelCap + 5) {
						diffShift = me.diff + 1;
						D2Bot.printToConsole('SoloLeveling: Over leveled. Starting: ' + Difficulty[diffShift]);
					} else {
						D2Bot.printToConsole('SoloLeveling: ' + Difficulty[diffShift + 1] + ' requirements not met. Negative resistance. FR: ' + Check.Resistance().FR + ' | CR: ' + Check.Resistance().CR + ' | LR: ' + Check.Resistance().LR);
					}
				}
			}
		}

		let nextDiff = Difficulty[diffShift];

		return nextDiff;
	},

	Runes: function () {
		let needRunes = true;

		switch (me.diff) {
		case 0: //normal
			//have runes or stealth and ancients pledge
			if (me.getItem(616) && me.getItem(614) || this.haveItem("armor", "runeword", "Stealth")) {
				needRunes = false;
			}

			break;
		case 1: //nightmare
			if (me.getItem(616) && me.getItem(619) && me.getItem(618) && me.getItem(620) || !me.paladin && this.haveItem("sword", "runeword", "Spirit") || me.paladin && this.haveItem("sword", "runeword", "Spirit") && this.haveItem("auricshields", "runeword", "Spirit")) {
				needRunes = false;
			}

			break;
		case 2: //hell
			if (!me.baal || me.sorceress) {
				needRunes = false;
			}

			break;
		}

		return needRunes;
	},

	haveItem: function (type, flag, iName) {
		if (type && !NTIPAliasType[type] && !NTIPAliasClassID[type]) {
			print("ÿc9SoloLevelingÿc0: No NTIPalias for '" + type + "'");
		}

		type = type.toLowerCase();
		flag = flag.toLowerCase();

		if (iName !== undefined) {
			iName = iName.toLowerCase();
		}

		let typeCHECK = false;
		let items = me.getItems();
		let itemCHECK = false;

		for (let i = 0; i < items.length && !itemCHECK; i++) {

			switch (flag) {
			case 'set':
				itemCHECK = !!(items[i].quality === 5) && items[i].fname.toLowerCase().includes(iName);
				break;
			case 'unique':
				itemCHECK = !!(items[i].quality === 7) && items[i].fname.toLowerCase().includes(iName);
				break;
			case 'crafted':
				itemCHECK = !!(items[i].getFlag(NTIPAliasQuality["crafted"]));
				break;
			case 'runeword':
				itemCHECK = !!(items[i].getFlag(NTIPAliasFlag["runeword"])) && items[i].fname.toLowerCase().includes(iName);
				break;
			}

			switch (type) {
			case "helm":
			case "primalhelm":
			case "pelt":
			case "armor":
			case "shield":
			case "auricshields":
			case "voodooheads":
			case "gloves":
			case "belt":
			case "boots":
			case "ring":
			case "amulet":
			case "axe":
			case "bow":
			case "amazonbow":
			case "crossbow":
			case "dagger":
			case "javelin":
			case "amazonjavelin":
			case "mace":
			case "polearm":
			case "scepter":
			case "spear":
			case "amazonspear":
			case "staff":
			case "sword":
			case "wand":
			case "assassinclaw":
			case "weapon":
				typeCHECK = items[i].itemType === NTIPAliasType[type];
				break;
			default:
				typeCHECK = items[i].classid === NTIPAliasClassID[type];
				break;
			}

			if (type) {
				itemCHECK = itemCHECK && typeCHECK;
			}
		}

		return itemCHECK;
	},

	Build: function () {
		function getBuildTemplate () {
			let buildType = SetUp.finalBuild;
			let build = buildType + "Build" ;
			let classname = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"][me.classid];
			let template = "SoloLeveling/BuildFiles/" + classname + "." + build + ".js";

			return template.toLowerCase();
		}

		var template = getBuildTemplate();

		if (!include(template)) {
			if (SetUp.finalBuild === "Bumper") {
				return {
					caster: true,
					tabSkills: -1,
					wantedSkills: -1,
					usefulSkills: -1,
					mercAuraName: "holy freeze",
					mercAuraWanted: 104,
					mercDiff: 2,
					finalGear: -1,
				};
			}

			throw new Error("buildCheck(): Failed to include template: " + template);
		}

		return {
			caster: build.caster,
			tabSkills: build.skillstab,
			wantedSkills: build.wantedskills,
			usefulSkills: build.usefulskills,
			mercAuraName: build.mercAuraName,
			mercAuraWanted: build.mercAuraWanted,
			mercDiff: build.mercDiff,
			finalGear: build.autoEquipTiers,
		};
	},

	setupCharms: function () {
		let i, equipped, limit,
			type = [603, 604, 605],
			items = me.getItems()
				.filter(item => item.location === 3 && type.indexOf(item.classid) > -1)
				.sort((a, b) => a.classid - b.classid);

		for (i = 0; i < type.length; i++) {
			equipped = items.filter(item => item.classid === type[i])
				.sort((a, b) => NTIP.GetCharmTier(a) - NTIP.GetCharmTier(b));

			limit = Item.getCharmLimit(type[i]) * -1; // trim off lowest tier
			equipped = equipped.slice(limit);

			while (equipped.length > 0) {
				Check.equippedCharms[i].push(copyUnit(equipped[0]));
				equipped.shift();
			}
		}

		return true;
	},

	equippedCharms: [[], [], []],
};

var indexOfMax = function (arr) {
	if (arr.length === 0) {
		return -1;
	}

	var max = arr[0];
	var maxIndex = 0;

	for (let index = 1; index < arr.length; index++) {
		if (arr[index] > max) {
			maxIndex = index;
			max = arr[index];
		}
	}

	return maxIndex;
};
