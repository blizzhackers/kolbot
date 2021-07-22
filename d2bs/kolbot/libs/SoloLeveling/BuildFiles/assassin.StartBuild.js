/**
 *    @filename   assassin.StartBuild.js
 *	  @author	  isid0re
 *    @desc       assassin build for before respecOne
 */

var build = {
	caster: false,
	skillstab: 48, // traps
	wantedskills: [251, 262], // fireblast, wake of fire
	usefulskills: [252], // claw mastery
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["vitality", 70],
		["strength", 47],
		["dexterity", 46],
		["energy", 50],
		["vitality", "all"]
	],
	skills: [
		[251, 3], // fireblast
		[252, 1], // claw mastery
		[258, 2], // burst of speed
		[251, 4], // fireblast
		[258, 5], // burst of speed
		[262, 10, false], // wake of fire
		[251, 6, false], // fireblast
		[262, 20, false], // wake of fire
		[251, 10], // fireblast
	]
};
