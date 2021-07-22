/**
 *    @filename   paladin.SmiterBuild.js
 *	  @author	  isid0re
 *    @desc       End-game smiter build
 */

var build = {
	caster: me.charlvl !== SetUp.respecTwo() ? true : false,
	skillstab: 24, //combat
	wantedskills: [97, 122], //smite, fanaticism
	usefulskills: [117, 125], //holy shield, salvation
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 115], ["dexterity", 136], ["vitality", 300], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[97, 20], //smite
		[101, 1], // holy bolt
		[107, 1], // charge
		[112, 1], //blessed hammer
		[117, 20], // holy shield
		[98, 1], // might
		[108, 1], //blessed aim
		[113, 1], //concentration
		[122, 20], // fanaticism
		[125, 5], // salvation
		[110, 15], // resist lightning
		[100, 14], // resist fire
		[105, 10] // resist cold
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 100000", //Grief
		//helmet
		"[name] == wingedhelm && [quality] == set && [flag] != ethereal # [fhr] >= 30 # [tier] == 100000", // gface
		//belt
		"[name] == warbelt && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 160  # [tier] == 100000", //tgods
		//boots
		"[name] == lightplatedboots && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 50 # [tier] == 100000", //goblin toes
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [frw] >= 45 # [tier] == 100000", //Enigma
		//shield
		"[Name] == GildedShield && [Quality] == unique && [flag] != ethereal  # [EnhancedDefense] >= 150 # [tier] == 100000", //hoz
		//gloves
		"[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 100 && [strength] >= 12 && [lifeleech] >= 9  # [tier] == 100000", // drac's
		//ammy
		"[type] == amulet && [quality] == unique # [lightresist] == 35 # [tier] == 100000", //highlords
		//rings
		"[type] == ring && [quality] == unique # [tohit] >= 180 && [dexterity] >= 15 # [tier] == 100000", // ravenfrost
		"[type] == ring && [quality] == unique # [lifeleech] >= 5 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
