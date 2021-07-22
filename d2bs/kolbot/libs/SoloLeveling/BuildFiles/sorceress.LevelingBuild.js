/*
 *    @filename 	Sorceress.BlizzballerBuild.js
 *	  @author	  	isid0re
 *    @desc    		Sorceress blizzballer build for after respecOne
 */

var build = {
	caster: true,
	skillstab: 10, //cold
	wantedskills: [59, 47, 65], // blizzard, fireball, cold mastery
	usefulskills: [55, 56, 61, 42], // glacial spike, meteor, fire mastery, static
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["energy", 50], ["strength", 48], ["vitality", 165], ["strength", 61], ["vitality", 252], ["strength", 84], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		[36, 1], // Fire Bolt
		[37, 1], // warmth
		[40, 1], // Frozen Armor
		[39, 1], // ice bolt
		[45, 1], // ice blast
		[42, 1], // Static
		[43, 1], // telekensis
		[41, 1], // Inferno
		[46, 1], // Blaze
		[44, 1], // Frost nova
		[47, 7], // Fireball 7
		[54, 1], //Teleport
		[55, 1], // gspike
		[51, 1], // Firewall
		[47, 15], // fireball 15
		[59, 1], // blizzard
		[56, 1], // meteor
		[61, 1, false], // Fire Mastery
		[65, 1, false], // cold mastery
		[47, 20], // fireball 20
		[59, 20], // blizzard 20
		[55, 20], // gspike
		[56, 20], // meteor
		[65, 5], // cold mastery
		[36, 20], // Fire Bolt
	]
};
