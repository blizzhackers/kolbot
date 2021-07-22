//	/d2bs/kolbot/libs/config/Builds/Necromancer.Start.js

/**
*
* Instructions:	See /d2bs/kolbot/libs/config/Builds/README.txt
*
* Skill IDs:	See /d2bs/kolbot/sdk/skills.txt for a list of skill IDs.
*
* Stat IDs:
*
* 	Strength	= 0
* 	Energy		= 1
* 	Dexterity	= 2
* 	Vitality	= 3
*
*/
js_strict(true);

if (!isIncluded("common/Cubing.js")) {
	include("common/Cubing.js");
}

if (!isIncluded("common/Prototypes.js")) {
	include("common/Prototypes.js");
}

if (!isIncluded("common/Runewords.js")) {
	include("common/Runewords.js");
}

if (!isIncluded("common/Town.js")) {
	include("common/Town.js");
}

var AutoBuildTemplate = {

	1:	{
		//SkillPoints: [-1],								// This doesn't matter. We don't have skill points to spend at lvl 1
		//StatPoints: [-1,-1,-1,-1,-1],						// This doesn't matter. We don't have stat points to spend at lvl 1
		Update: function () {
			Config.AttackSkill = [-1, 0, 0, 0, 0, -1, -1];
			Config.LowManaSkill = [0, 0];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.HPBuffer = 6;
			Config.MPBuffer = 6;
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 0, 0, 0, 0, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
		}
	},

	3:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	4:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	5:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	6:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	7:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			Config.Curse[1] = me.normal && me.getSkill(71, 0) ? 71 : me.getSkill(66, 0) ? 66 : 0; // Other monsters curse.
		}
	},

	8:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	9:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	10:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.TownCheck = me.findItem("tbk", 0, 3);
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	11:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
		}
	},

	13:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
		}
	},

	14:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
		}
	},

	15:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
			Config.Golem = "Clay"; // Golem.
		}
	},

	16:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
		}
	},

	17:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];
		}
	},

	18:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 67, -1, 67, -1, -1, -1];

		}
	},

	19:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	20:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
			Config.ExplodeCorpses = 74;

		}
	},

	21:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	22:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	23:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	24:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	25:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	26:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	27:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	28:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	29:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	30:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	31:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},

	32:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 84, -1, 84, -1, -1, -1];
		}
	},
};
