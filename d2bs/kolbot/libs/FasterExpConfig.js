/**
*  @filename    FasterExpConfig.js
*  @author      theBGuy
*  @desc        Settings for for FasterExp.js script
*  @setup       Using in game character names, fill out settings. Inside character configuration file set Config.FasterExp.Team equal to the team set up name
*  @example
*    Scripts.FasterExp = true;
*        Config.FasterExp.Team = "Team1"
*
*/

const FasterExpConfig = {
	// Config.FasterExp.Team
	"Team1": {
		leveler: "", // Char being leveled
		diaLead: "", // Diablo lead char (should be hammerdin), opens boss seals, opens TP + summons leveler for seal boss kills, helps prep Diablo + kills baal
		nithPrep: "", // Preps nith, then helps clear throne
		shrineHunter: "", // Hunts for shrine and tps throne for rest of team
		BOer: "", // BO Barb (only runs BoBarbHelper.js)
	},

	"Team2": {
		leveler: "", // Char being leveled
		diaLead: "", // Diablo lead char (should be hammerdin), opens boss seals, opens TP + summons leveler for seal boss kills, helps prep Diablo + kills baal
		nithPrep: "", // Preps nith, then helps clear throne
		shrineHunter: "", // Hunts for shrine and tps throne for rest of team
		BOer: "", // BO Barb (only runs BoBarbHelper.js)
	},
};
