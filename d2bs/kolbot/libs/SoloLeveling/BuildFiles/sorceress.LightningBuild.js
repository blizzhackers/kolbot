/**
 *    @filename   	Sorceress.LightningBuild.js
 *	  @author	  	theBGuy
 *    @desc     	Sorceress lightning build for after respecTwo
 */

var build = {
	caster: true,
	skillstab: 9, //light
	wantedskills: [53, 49], // Chain-light, lightning
	usefulskills: [63, 38, 48], // light-mastery, charged bolt, nova
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 156], ["dexterity", 35], ["vitality", "all"]
	],
	skills: [
		[37, 1], // warmth
		[42, 1], // Static
		[43, 1], // telekensis
		[54, 1], //Teleport
		[40, 1], // Frozen Armor
		[57, 1], // Thunder-Storm
		[63, 1], // light-mastery
		[49, 20, false], // lightning
		[53, 20, false], // chain lightning
		[63, 20], // light-mastery
		[48, 20], // nova
		[38, 20], // charged bolt
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == mace && [flag] == runeword # [FCR] == 40 # [tier] == 100000", // HotO
		//Helmet
		"[name] == diadem && [quality] == unique # [fcr] == 25 # [tier] == 100000", //griffons
		//belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000", //arach's
		//boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 30 # [tier] == 100000", //war traveler
		//armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 100000", //CoH
		//shield
		"[type] == shield # [fcr] >= 35 && [maxmana] >= 89 # [tier] == 100000", //spirit
		//gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 # [tier] == 100000", //magefist
		//ammy
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000", //maras
		//rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 100000", //bk ring
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
