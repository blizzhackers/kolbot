/**
 *    @filename		paladin.levelingBuild.js
 *	  @author	  	isid0re
 *    @desc			paladin build for hammerdin.
 * 					skills based on https://www.diabloii.net/forums/threads/max-damage-hammerdin-guide-by-captain_bogus-repost.127596/
 */

var build = {
	caster: true,
	skillstab: 24, //combat
	wantedskills: [112, 113], // hammers, concentration
	usefulskills: [117, 108], // holy shield, blessed aim
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["vitality", 60], ["dexterity", 30], ["strength", 27],
		["vitality", 91], ["dexterity", 44], ["strength", 30],
		["vitality", 96], ["dexterity", 59], ["strength", 60],
		["vitality", 109], ["dexterity", 77], ["strength", 89],
		["vitality", 137], ["dexterity", 89],
		["vitality", 173], ["dexterity", 103],
		["vitality", 208], ["dexterity", 118],
		["vitality", 243], ["dexterity", 133],
		["vitality", 279], ["dexterity", 147],
		["vitality", "all"]
	],
	skills: [
		[98, 1], // might
		[97, 1], // smite
		[99, 1], // prayer
		[101, 1], // holy bolt
		[104, 1], // defiance
		[107, 1], // charge
		[108, 1], // blessed aim
		[109, 1], // cleansing
		[108, 6], // blessed aim
		[112, 1], // blessed hammers
		[113, 1], // concentration
		[115, 1], // vigor
		[108, 7], // blessed aim
		[112, 2], // blessed hammers
		[113, 2], // concentration
		[115, 2], // vigor
		[112, 7], // blessed hammers
		[117, 1], // holy shield
		[120, 1], // mediation
		[112, 12], // blessed hammers
		[124, 1], // redemption
		[112, 20], // max hammers
		[113, 3], // level concentration
		[115, 3], // level vigor
		[113, 4], // level concentration
		[115, 4], // level vigor
		[113, 5], // level concentration
		[115, 5], // level vigor
		[113, 6], // level concentration
		[115, 6], // level vigor
		[113, 7], // level concentration
		[115, 7], // level vigor
		[113, 8], // level concentration
		[115, 8], // level vigor
		[113, 9], // level concentration
		[115, 9], // level vigor
		[113, 10], // level concentration
		[115, 10], // level vigor
		[113, 11], // level concentration
		[115, 11], // level vigor
		[113, 12], // level concentration
		[115, 12], // level vigor
		[113, 13], // level concentration
		[115, 13], // level vigor
		[113, 14], // level concentration
		[115, 14], // level vigor
		[113, 15], // level concentration
		[115, 15], // level vigor
		[113, 16], // level concentration
		[115, 16], // level vigor
		[113, 17], // level concentration
		[115, 17], // level vigor
		[113, 18], // level concentration
		[115, 18], // level vigor
		[113, 19], // level concentration
		[115, 19], // level vigor
		[113, 20], // max concentration
		[115, 20], // max vigor
		[108, 20], // max blessed aim
		[117, 20] // max holy shield
	]
};
