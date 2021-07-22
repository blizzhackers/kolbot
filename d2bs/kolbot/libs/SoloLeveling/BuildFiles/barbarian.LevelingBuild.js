/**
 *      @filename   Barbarian.LevelingBuild.js
 *      @author     isid0re
 *      @desc       Barbarian leveling build
 */

var build = {
	caster: false,
	skillstab: 32, // Combat
	wantedskills: [129, 144, 154], // Mace Mastery, Concentrate, WarCry
	usefulskills: [149, 153], // Battle Orders, Natural Resist
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["vitality", 40], ["dexterity", 35], ["strength", 60],
		["vitality", 60], ["dexterity", 44], ["strength", 89],
		["vitality", 96], ["dexterity", 77],
		["vitality", "all"]
	],
	skills: [
		[129, 5], // Mace Mastery
		[126, 1], // Bash
		[139, 1], // Stun
		[130, 1], // Howl
		[137, 1], // Taunt
		[138, 1], // Shout
		[146, 4], // Battle Cry
		[144, 6], // Concentrate
		[145, 1], // Iron Skin
		[149, 8], // Battle Orders
		[155, 1], // Battle Command
		[153, 1], // Natural Resistance
		[154, 20], // War Cry
		[149, 20], // Battle Orders
		[129, 20], // Mace Mastery
		[126, 20] // Bash
	],
};
