/**
*  @filename    AutoBuildThread.js
*  @author      alogwe
*  @desc        Helper thread for AutoBuild.js that monitors changes in character level
*
*/
js_strict(true);

!isIncluded("common/AutoSkill.js") && include("common/AutoSkill.js");
!isIncluded("common/AutoStat.js") && include("common/AutoStat.js");
!isIncluded("common/Config.js") && include("common/Config.js");
!isIncluded("common/Cubing.js") && include("common/Cubing.js");
!isIncluded("common/Prototypes.js") && include("common/Prototypes.js");
!isIncluded("common/Runewords.js") && include("common/Runewords.js");
!isIncluded("common/Town.js") && include("common/Town.js");

Config.init(); // includes libs/common/AutoBuild.js

const debug = !!Config.AutoBuild.DebugMode;
const SPEND_POINTS 	= true;		// For testing, it actually allows skill and stat point spending.
const STAT_ID_TO_NAME =	[
	getLocaleString(4060),		// Strength
	getLocaleString(4069),		// Energy
	getLocaleString(4062),		// Dexterity
	getLocaleString(4066)		// Vitality
];
let	prevLevel = me.charlvl;

// Will check if value exists in an Array
Array.prototype.contains = function (val) { return this.indexOf(val) > -1; };

function skillInValidRange (id) {
	switch (me.classid) {
	case sdk.charclass.Amazon:
		return sdk.skills.MagicArrow <= id && id <= sdk.skills.LightningFury;
	case sdk.charclass.Sorceress:
		return sdk.skills.FireBolt <= id && id <= sdk.skills.ColdMastery;
	case sdk.charclass.Necromancer:
		return sdk.skills.AmplifyDamage <= id && id <= sdk.skills.Revive;
	case sdk.charclass.Paladin:
		return sdk.skills.Sacrifice <= id && id <= sdk.skills.Salvation;
	case sdk.charclass.Barbarian:
		return sdk.skills.Bash <= id && id <= sdk.skills.BattleCommand;
	case sdk.charclass.Druid:
		return sdk.skills.Raven <= id && id <= sdk.skills.Hurricane;
	case sdk.charclass.Assassin:
		return sdk.skills.FireBlast <= id && id <= sdk.skills.PhoenixStrike;
	default:
		return false;
	}
}

function gainedLevels () { return me.charlvl - prevLevel; }

function canSpendPoints () {
	let unusedStatPoints = me.getStat(4);
	let haveUnusedStatpoints = unusedStatPoints >= 5;	// We spend 5 stat points per level up
	let unusedSkillPoints = me.getStat(5);
	let haveUnusedSkillpoints = unusedSkillPoints >= 1;	// We spend 1 skill point per level up
	debug && AutoBuild.print("Stat points:", unusedStatPoints, "     Skill points:", unusedSkillPoints);
	return haveUnusedStatpoints && haveUnusedSkillpoints;
}

function spendStatPoint (id) {
	let unusedStatPoints = me.getStat(4);
	if (SPEND_POINTS) {
		useStatPoint(id);
		AutoBuild.print("useStatPoint(" + id + "): " + STAT_ID_TO_NAME[id]);
	} else {
		AutoBuild.print("Fake useStatPoint(" + id + "): " + STAT_ID_TO_NAME[id]);
	}
	delay(100);											// TODO: How long should we wait... if at all?
	return (unusedStatPoints - me.getStat(4) === 1);	// Check if we spent one point
}

// TODO: What do we do if it fails? report/ignore/continue?
function spendStatPoints () {
	let stats = AutoBuildTemplate[me.charlvl].StatPoints;
	let errorMessage = "\nInvalid stat point set in build template " + getTemplateFilename() + " at level " + me.charlvl;
	let spentEveryPoint = true;
	let unusedStatPoints = me.getStat(4);
	let len = stats.length;

	if (Config.AutoStat.Enabled) {
		return spentEveryPoint;
	}

	if (len > unusedStatPoints) {
		len = unusedStatPoints;
		AutoBuild.print("Warning: Number of stats specified in your build template at level " + me.charlvl + " exceeds the available unused stat points" +
			"\nOnly the first " + len + " stats " + stats.slice(0, len).join(", ") + " will be added");
	}

	// We silently ignore stats set to -1
	for (let i = 0; i < len; i++) {
		let id = stats[i];
		let statIsValid = (typeof id === "number") && (0 <= id && id <= 3);

		if (id === -1) {
			continue;
		} else if (statIsValid) {
			let preStatValue = me.getStat(id);
			let pointSpent = spendStatPoint(id);
			if (SPEND_POINTS) {
				if (!pointSpent) {
					spentEveryPoint = false;
					AutoBuild.print("Attempt to spend point " + (i + 1) + " in " + STAT_ID_TO_NAME[id] + " may have failed!");
				} else if (debug) {
					AutoBuild.print("Stat (" + (i + 1) + "/" + len + ") Increased " + STAT_ID_TO_NAME[id] + " from " + preStatValue + " to " + me.getStat(id));
				}
			}
		} else {
			throw new Error("Stat id must be one of the following:\n0:" + STAT_ID_TO_NAME[0] +
				",\t1:" + STAT_ID_TO_NAME[1] + ",\t2:" + STAT_ID_TO_NAME[2] + ",\t3:" + STAT_ID_TO_NAME[3] + errorMessage);
		}
	}

	return spentEveryPoint;
}

function getTemplateFilename () {
	let buildType = Config.AutoBuild.Template;
	let templateFilename = "config/Builds/" + sdk.charclass.nameOf(me.classid) + "." + buildType + ".js";
	return templateFilename;
}

function getRequiredSkills (id) {
	function searchSkillTree (id) {
		let results = [];
		let skillTreeRight	= getBaseStat("skills", id, 181);
		let skillTreeMiddle	= getBaseStat("skills", id, 182);
		let skillTreeLeft	= getBaseStat("skills", id, 183);

		results.push(skillTreeRight);
		results.push(skillTreeMiddle);
		results.push(skillTreeLeft);

		for (let i = 0; i < results.length; i++) {
			let skill = results[i];
			let skillInValidRange = (0 < skill && skill <= 280) && (![217, 218, 219, 220].contains(skill));
			let hardPointsInSkill = me.getSkill(skill, 0);

			if (skillInValidRange && !hardPointsInSkill) {
				requirements.push(skill);
				searchSkillTree(skill);	// search children;
			}
		}
	}

	let requirements = [];
	searchSkillTree(id);
	function increasing (a, b) { return a - b; }
	return requirements.sort(increasing);
}

function spendSkillPoint (id) {
	let unusedSkillPoints = me.getStat(5);
	let skillName = getSkillById(id) + " (" + id + ")";
	if (SPEND_POINTS) {
		useSkillPoint(id);
		AutoBuild.print("useSkillPoint(): " + skillName);
	} else {
		AutoBuild.print("Fake useSkillPoint(): " + skillName);
	}
	delay(200);											// TODO: How long should we wait... if at all?
	return (unusedSkillPoints - me.getStat(5) === 1);	// Check if we spent one point
}

function spendSkillPoints () {
	let skills = AutoBuildTemplate[me.charlvl].SkillPoints;
	let errInvalidSkill = "\nInvalid skill point set in build template " + getTemplateFilename() + " for level " + me.charlvl;
	let spentEveryPoint = true;
	let unusedSkillPoints = me.getStat(5);
	let len = skills.length;

	if (Config.AutoSkill.Enabled) {
		return spentEveryPoint;
	}

	if (len > unusedSkillPoints) {
		len = unusedSkillPoints;
		AutoBuild.print("Warning: Number of skills specified in your build template at level " + me.charlvl + " exceeds the available unused skill points" +
			"\nOnly the first " + len + " skills " + skills.slice(0, len).join(", ") + " will be added");
	}

	// We silently ignore skills set to -1
	for (let i = 0; i < len; i++) {
		let id = skills[i];

		if (id === -1) {
			continue;
		} else if (!skillInValidRange(id)) {
			throw new Error("Skill id " + id + " is not a skill for your character class" + errInvalidSkill);
		}

		let skillName = getSkillById(id) + " (" + id + ")";
		let requiredSkills = getRequiredSkills(id);
		if (requiredSkills.length > 0) {
			throw new Error("You need prerequisite skills " + requiredSkills.join(", ") + " before adding " + skillName + errInvalidSkill);
		}

		let requiredLevel = getBaseStat("skills", id, 176);
		if (me.charlvl < requiredLevel) {
			throw new Error("You need to be at least level " + requiredLevel + " before you get " + skillName + errInvalidSkill);
		}

		let pointSpent = spendSkillPoint(id);

		if (SPEND_POINTS) {
			if (!pointSpent) {
				spentEveryPoint = false;
				AutoBuild.print("Attempt to spend skill point " + (i + 1) + " in " + skillName + " may have failed!");
			} else if (debug) {
				let actualSkillLevel = me.getSkill(id, 1);
				AutoBuild.print("Skill (" + (i + 1) + "/" + len + ") Increased " + skillName + " by one (level: ", actualSkillLevel + ")");
			}
		}

		delay(200);	// TODO: How long should we wait... if at all?
	}

	return spentEveryPoint;
}

/*
*	TODO: determine if changes need to be made for
*	the case of gaining multiple levels at once so as
*	not to bombard the d2bs event system
*/

function main () {
	try {
		AutoBuild.print("Loaded helper thread");

		while (true) {
			let levels = gainedLevels();

			if (levels > 0 && (canSpendPoints() || Config.AutoSkill.Enabled || Config.AutoStat.Enabled)) {
				scriptBroadcast("toggleQuitlist");
				AutoBuild.print("Level up detected (", prevLevel, "-->", me.charlvl, ")");
				spendSkillPoints();
				spendStatPoints();
				Config.AutoSkill.Enabled && AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
				Config.AutoStat.Enabled && AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
				scriptBroadcast({event: "level up"});
				AutoBuild.applyConfigUpdates(); // scriptBroadcast() won't trigger listener on this thread.

				debug && AutoBuild.print("Incrementing cached character level to", prevLevel + 1);
				// prevLevel doesn't get set to me.charlvl because
				// we may have gained multiple levels at once
				prevLevel += 1;

				scriptBroadcast("toggleQuitlist");
			}

			delay(1e3);
		}
	} catch (err) {
		print("Something broke!");
		print("Error:" + err.toSource());
		print("Stack trace: \n" + err.stack);

		return false;
	}
}
