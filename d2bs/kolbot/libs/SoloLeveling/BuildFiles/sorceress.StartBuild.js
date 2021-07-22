/*
 *    @filename   	sorceress.startBuild.js
 *	  @author	  	isid0re
 *    @desc       	sorceress build for before respecOne
 */

var build = {
	caster: true,
	skillstab: 9, //lightning
	wantedskills: [38, 42], // charged bolt, static
	usefulskills: [40, 49], // frozen armor, lightning
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["energy", 40],
		["vitality", 15],
		["energy", 45],
		["vitality", 20],
		["energy", 50],
		["strength", 15],
		["vitality", 25],
		["energy", 60],
		["vitality", 40],
		["strength", 35],
		["vitality", "all"]
	],
	skills: [
		[38, 4], // charged Bolt 5
		[43, 1], // Telekinesis 6
		[44, 1], // Frost Nova 6/7
		[42, 4], // Static
		[48, 7], // Nova
		[54, 1], // Teleport
		[40, 1], // Frozen Armor
		[42, 6], // Static
		[39, 1], // ice bolt
		[45, 1], // ice blast
		[55, 1], // gspike
		[59, 6], // blizzard
		[65, 1], // cold mastery
		[59, 8], // blizzard
	]
};
