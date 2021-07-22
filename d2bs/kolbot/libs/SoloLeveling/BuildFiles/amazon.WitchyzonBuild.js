/*
 *    @filename   amazon.WitchyzonBuild.js
 *	  @author	  isid0re
 *    @desc       based off of https://diabloii.net/forums/threads/chipmcs-witchwild-string-strafeazon-guide-v-0-05-beta-if.240912/
 */

var build = {
	caster: false,
	skillstab: 0, // Bow and Crossbow Skills
	wantedskills: [26], // strafe
	usefulskills: [23, 32, 33], //Penetrate, Valkyrie, Pierce
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 89], ["vitality", 100], ["dexterity", "all"]
	],
	skills: [
		[6, 1], // magic arrow
		[11, 1], // cold arrow
		[12, 1], // multi shot
		[22, 1], // guided arrow
		[26, 1], // strafe
		[8, 1], // inner sight
		[9, 1], // critical strike
		[13, 1], // Dodge
		[17, 1], // slows missiles
		[18, 1], // Avoid
		[23, 1], // Penetrate
		[28, 1], // decoy
		[29, 1], // Evade
		[32, 1], // Valkyrie
		[33, 1], // Pierce
		[26, 20], // strafe
		[33, 10], // Pierce
		[23, 20], // Penetrate
		[32, 20], // Valkyrie
		[13, 12], // Dodge
		[18, 7], // Avoid
		[29, 12], // Evade
		[28, 2], // decoy
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[name] == diamondbow && [quality] == unique # [fireresist] == 40 # [tier] == 100000", // WitchWild String up'd
		//Helmet
		"[name] == grimhelm && [quality] == unique  && [flag] != ethereal # [manaleech] >= 6 && [lifeleech] >= 6 && [damageresist] >= 20 # [tier] == 100000", //vampz gaze
		//boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000", //war traveler
		//belt
		"[name] == vampirefangbelt && [quality] == unique && [flag] != ethereal # [lifeleech] >= 5 # [tier] == 100000", //nosferatu's coil
		//armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", //CoH
		//ammy
		"[type] == amulet && [quality] == unique # [dexterity] == 25 # [tier] == 110000", // cat's eye
		//rings
		"[type] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 # [tier] == # [tier] == 110000", // raven frost
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 110000", //bk ring
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
