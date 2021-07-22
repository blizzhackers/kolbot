/**
 *    @filename  	paladin.startBuild.js
 *	  @author	  	isid0re
 *    @desc     	paladin build for before respecOne
 */

var build = {
	caster: false,
	skillstab: 24, //combat
	wantedskills: [106, 102], //zeal, holy fire
	usefulskills: [98, 100], //might, resist fire
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["vitality", 80], // base 25
		["dexterity", 27], // base 20
		["strength", 47], //base 25
		["vitality", "all"],
	],
	skills: [
		[98, 1],
		[100, 4],
		[102, 3],
		[96, 1],
		[97, 1],
		[106, 1],
		[107, 1],
		[106, 4],
		[102, 6],
		[100, 16]
	]
};
