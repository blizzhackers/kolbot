/**
 *      @filename   Barbarian.StartBuild.js
 *      @author     isid0re
 *      @desc       Barbarian start build
 */

var build = {
	caster: false,
	skillstab: 32, // Combat
	wantedskills: [129, 147], // Mace Mastery, Frenzy
	usefulskills: [146, 133], // Battle Cry, Double Swing
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["vitality", 40],
		["strength", 60],
		["dexterity", 35],
		["vitality", "all"]
	],
	skills: [
		[129, 1], // Mace Mastery
		[126, 1], // Bash
		[133, 6], // Double Swing
		[139, 1], // Stun
		[133, 9], // Double Swing
		[140, 1], // Double Throw
		[130, 1], // Howl
		[137, 1], // Taunt
		[146, 1], // Battle Cry
		[144, 1], // Concentrate
		[138, 1], // Shout
		[141, 1], // Increased Stamina
		[148, 1], // Increased Speed
		[149, 1], // Battle Orders
		[147, 1], // Frenzy
		[154, 1, false], // War Cry
		[155, 1, false], // Battle Command
		[153, 1, false], // Natural Resistance
		[147, 20], // Frenzy
	]
};
