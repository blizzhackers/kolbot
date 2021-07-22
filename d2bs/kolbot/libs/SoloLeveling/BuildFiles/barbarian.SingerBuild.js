/*
 *    @filename   	barbarian.Singer.js
 *	  @author	  	isid0re
 *    @desc       	Warcry (Singer/Shout) build
 *    @credits		ebner20
 */

var build = {
	caster: me.charlvl === SetUp.respecTwo() ? true : false,
	skillstab: 32, // Combat
	wantedskills: [154, 138], //warcry, shout
	usefulskills: [148, 153], //increased speed, natural resistance
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["vit", 40],
		["str", 60],
		["vit", 100],
		["str", 85],
		["vit", 150],
		["dex", 35],
		["str", 100],
		["vit", 180],
		["str", 125],
		["vit", 205],
		["str", 156],
		["vit", "all"]
	],
	skills: [
		[130, 1, false], // Howl
		[131, 1, false], //Find Potion
		[138, 6, false], //Shout
		[142, 1, false], //Find Item
		[141, 1, false], //Increased Stamina level
		[138, 11, false], //Shout
		[145, 1, false], //Iron Skin
		[138, 15, false], //Shout
		[149, 1, false], //Battle Orders
		[148, 1, false], //Increased Speed
		[149, 5, false], //Battle Orders
		[154, 1, false], //War Cry
		[155, 1, false], //Battle Command
		[153, 1, false], //Natural Resistance
		[149, 20, false], //Max battle orders
		[138, 20, false], //Max shout
		[153, 11, false], //Natural Resistance
		[148, 5, false], //Increased Speed
		[145, 20, false], //Iron Skin
		[142, 10, false], //Find Item
		[155, 20, false] //Battle Command
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == mace && [flag] == runeword # [FCR] == 40 # [tier] == 100000", // HotO x2 dual weild
		//Helmet
		"[name] == shako && [quality] == unique && [flag] != ethereal # [DamageResist] == 10 # [tier] == 100000", // harlequin's crest
		//belt
		"[name] == spiderwebsash && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 100000", //arach's
		//boots
		"[Name] == MeshBoots && [Quality] == Unique && [Flag] != Ethereal # [frw] >= 30 # [tier] == 100000", //silkweave
		//armor
		"[type] == armor && [flag] != ethereal && [flag] == runeword # [frw] >= 45 # [tier] == 100000", //Enigma
		//gloves
		"[name] == gauntlets && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 10 # [tier] == 100000", //frostburns
		//ammy
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 100000", //maras
		//rings
		"[type] == ring && [quality] == unique # [itemmaxmanapercent] == 25 # [tier] == 100000", //soj
		"[type] == ring && [quality] == unique # [lifeleech] >= 3 && [maxstamina] == 50 # [tier] == 100000", // bul-kathos' wedding band
		//merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000",	//Fortitude
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000",	//Eth Andy's
	]
};
