/**
 *    @filename		druid.ElementalBuild.js
 *	  @author		thatflykid, isid0re
 *    @desc			Druid elemental build for after respecOne
 */

var build = {
	caster: true,
	skillstab: 42, // elemental
	wantedskills: [225, 234], // firestorm, fissure
	usefulskills: [235], // cyclone armor
	mercAuraName: "Blessed Aim",
	mercAuraWanted: 108,
	mercDiff: 0,
	stats: [
		["strength", 48], ["vitality", 165], ["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[225, 2, false], // fire storm 3
		[221, 1, false], // Raven 4
		[229, 1, false], // molten boulder 5
		[226, 1, false], // Oak Sage 6
		[227, 1, false], // Summon Wolf 7
		[225, 6, false], // fire storm 11
		[234, 1, false], // fissure 12
		[237, 1, false], // Summon Dire Wolf 13
		[234, 11, false], // fissure 23
		[247, 1, false], // Grizzly 24
		[244, 1, false], // volcano 25
		[234, 20, false], // fissure 34
		[226, 6, false], // Oak Sage 39
		[230, 1, false], // artic blast 40
		[235, 1, false], // cyclone armor 41
		[225, 20, false], // firestorm 55
		[244, 20, false], // volcano 74
		[226, 20, false], // Oak Sage 88
		[235, 20, false], //cyclone armor 107
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == mace && [flag] == runeword # [FCR] == 40 # [tier] == 100000", // HotO
		//Helmet
		"[Name] == SkySpirit && [Quality] == Unique # [PassiveFirePierce] >= 10 # [tier] == 100000", // ravenlore
		//belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000", //arach's
		//boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 100000", //war traveler
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [frw] >= 45 # [tier] == 100000", //Enigma
		//shield
		"[Name] == Monarch && [Flag] != Ethereal && [flag] == runeword # [fcr] >= 35 # [tier] == 100000", //spirit shield
		//gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 # [tier] == 100000", //magefist
		//ammy
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000", //maras
		//rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
