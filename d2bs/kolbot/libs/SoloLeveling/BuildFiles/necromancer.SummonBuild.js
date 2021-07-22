/**
 *    @filename   necromancer.SummonBuild.js
 *	  @author	  isid0re
 *    @desc       FishyMancer build for after respecOne
 */

var build = {
	caster: true,
	skillstab: 18, //summon
	wantedskills: [70, 74], // raise skelly, corpse explosion
	usefulskills: [66, 69, 68, 87], //ampdamage, skelly mastery, bone armor, decrepify
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 48], ["vitality", 165], ["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[66, 1, false], //Amplify damage
		[70, 1, false], //Raise Skeleton
		[69, 1, false], //Skeleton Mastery
		[75, 1, false], //Clay Golem
		[79, 1, false], //Golem Mastery
		[89, 1, false], //Summon Resist
		[72, 1, false], //Weaken
		[77, 1, false], //Terror
		[87, 1, false], //Decrepify
		[67, 1, false], //Teeth
		[74, 1, false], //Corpse Explosion
		[68, 1, false], //Bone Armor
		[70, 20, false], //Max Raise Skeleton
		[69, 20, false], //Max Skeleton Mastery
		[74, 20, false], //Corpse Explosion
		[66, 20, false], //Amplify damage
		[95, 20, false], //Max Revive
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"([type] == wand || [type] == sword && ([Quality] >= Magic || [flag] == runeword) || [type] == knife && [Quality] >= Magic) && [flag] != ethereal # [secondarymindamage] == 0 && [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//Helmet
		"[name] == shako && [quality] == unique && [flag] != ethereal # [DamageResist] == 10 # [tier] == 100000", // harlequin's crest
		//belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000", //arach's
		//boots
		"[name] == battleboots && [quality] == unique && [flag] != ethereal # [itemmagicbonus] >= 50 # [tier] == 100000", //war traveler
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [frw] >= 45 # [tier] == 100000", //Enigma
		//shield
		"([type] == shield && ([Quality] >= Magic || [flag] == runeword) || [type] == voodooheads) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//gloves
		"[name] == lightgauntlets && [quality] == unique && [flag] != ethereal # [fcr] >= 20 # [tier] == 100000",
		//ammy
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000", //maras
		//rings
		"[name] == ring && [quality] == unique # [maxhp] >= 40 && [magicdamagereduction] >= 12 # [tier] == 99000", // dwarfstar
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
