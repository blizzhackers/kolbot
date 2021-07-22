/**
 *    @filename		druid.PlaguewolfBuild.js
 *	  @author		theBGuy
 *    @desc			Plague wolf final build
 */

var build = {
	caster: false,
	skillstab: 41, // shape-shifting
	wantedskills: [223, 224, 248], // werewolf, lycanthropy, fury
	usefulskills: [246, 247], // spirit of the barbs, summon grizzly
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 156], ["dexterity", 136], ["vitality", "all"]
	],
	skills: [
		[223, 20, false], // werewolf
		[224, 20, false], // lycanthropy
		[222, 1, false], // Poison Creeper
		[247, 1, false], // Grizzly
		[248, 20, false], // fury
		[236, 10, false], // heart of wolverine
		[238, 20, false], // rabies
		[236, 20, false], // heart of wolverine
		[222, 20, false], // Poison Creeper
	],
	autoEquipTiers: [ // autoequip final gear
		//weapon
		"[Type] == sword && [flag] == runeword # [ias] >= 30 # [tier] == 110000", //Grief
		//Shield
		"[name] == monarch && [quality] == unique # [damageresist] >= 35 # [tier] == 110000",	//Stormshield
		//Helmet
		"[name] == totemicmask && [quality] == unique # [druidskills] == 2 && [shapeshiftingskilltab] == 2 # [tier] == 110000 + tierscore(item)", //Jalal's mane
		//belt
		"[name] == mithrilcoil && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 110000 + tierscore(item)", //Verdungo's
		//armor
		"[type] == armor && [flag] == runeword  && [flag] != ethereal # [fireresist] == 65 && [hpregen] == 7 # [tier] == 110000", //CoH
		//gloves
		"[name] == vampirebonegloves && [quality] == unique && [flag] != ethereal # [enhanceddefense] >= 90 # [tier] == 110000 + tierscore(item)", //Dracul's
		//ammy
		"[type] == amulet && [quality] == unique # [strength] == 5 && [coldresist] >= 30 # [tier] == 110000 + tierscore(item)", //maras
		//rings
		"[type] == ring && [quality] == unique # [itemabsorblightpercent] >= 10 # [tier] == 110000 + tierscore(item)", //Wisp
		"[name] == ring && [quality] == unique # [maxstamina] == 50 && [lifeleech] >= 3 # [tier] == 110000 + tierscore(item)", //bk ring
		//Merc
		"[type] == armor && [flag] == runeword # [enhanceddefense] >= 200 && [enhanceddamage] >= 300 # [merctier] == 100000", //Fortitude
		"[type] == armor && [flag] == runeword # [ias] == 45 && [coldresist] == 30 # [merctier] == 50000", //Treachery
		"[name] == demonhead && [quality] == unique && [flag] == ethereal # [strength] >= 25 && [enhanceddefense] >= 100 # [merctier] == 50000", //Eth Andy's
		"[name] == thresher && [quality] == unique # [enhanceddamage] >= 190 && [lifeleech] >= 11 # [merctier] == 100000 + mercscore(item)",	// Reaper's Toll
	]
};
