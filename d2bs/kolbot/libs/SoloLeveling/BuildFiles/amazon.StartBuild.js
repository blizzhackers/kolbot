/*
 *    @filename   amazon.StartBuild.js
 *	  @author	  isid0re
 *    @desc       amazon build for before respecOne
 */

var build = {
	caster: false,
	skillstab: 0, // Bow N Crossbow Skills
	wantedskills: [7, 16, 9], // fire arrow, exploding arrow, critical strike
	usefulskills: [12, 13], // multishot, dodge
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["vitality", 35], ["strength", 22], ["dexterity", 28], ["vitality", 75], ["strength", 27], ["vitality", "all"],
	],
	skills: [
		[9, 1], // critical strike
		[7, 4], // fire arrow
		[13, 1], // dodge
		[7, 7], // fire arrow
		[6, 1], // magic arrow
		[12, 1], // multishot
		[16, 5], // exploding arrow
		[13, 2], // dodge
		[16, 12], // exploding arrow
		[7, 10], // fire arrow
		[16, 13], // exploding arrow
		[7, 11], // fire arrow
		[16, 20], // exploding arrow
		[7, 20], // fire arrow
	]
};
