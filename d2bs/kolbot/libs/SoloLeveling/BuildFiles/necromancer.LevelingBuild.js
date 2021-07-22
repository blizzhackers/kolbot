/**
 *    @filename   necromancer.ExplosionBuild.js
 *	  @author	  isid0re
 *    @desc       explosionmancer necro build for after respecOne
 */

var build = {
	caster: true,
	skillstab: 17, //bone
	wantedskills: [74, 84], // corpseexplosion, bonespear
	usefulskills: [66, 68, 87], //ampdamage, bone armor, decrepify
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 48], ["vitality", 165], ["strength", 61], ["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[66, 1], // amplified damage
		[67, 1], // teeth
		[68, 1], // Bone Armor
		[72, 1], // Weaken
		[74, 1], // Corpse Explosion
		[75, 1], // clay golem
		[77, 1], // Terror
		[79, 1], // Golem Mastery
		[78, 1], // Bone Wall
		[84, 1], // Bone Spear
		[87, 1], // Decrepify
		[89, 1], // Summon Resist
		[88, 1], // Bone Prison
		[84, 20, false], // Bone Spear
		[88, 20, false], // Bone Prison
		[74, 20, false], // Corpse Explosion
		[78, 20, false], // Bone Wall
		[67, 20, false], // teeth
	]
};
