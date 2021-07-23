var CustomConfig, configCheck = me.profile.toUpperCase().split("-");

if (getScript("D2BotSoloLevelingEntry.dbj") && !!configCheck[1]) {
	if (me.classid === 0 && configCheck[1].toString().substring(0, 3).includes("ZON")) {
		CustomConfig = {
			"Amazon.SoloLeveling": me.profile,
		};
	}

	if (me.classid === 1 && configCheck[1].toString().substring(0, 3).includes("SOR")) {
		CustomConfig = {
			"Sorceress.SoloLeveling": me.profile,
		};
	}

	if (me.classid === 2 && configCheck[1].toString().substring(0, 3).includes("NEC")) {
		CustomConfig = {
			"Necromancer.SoloLeveling": me.profile,
		};
	}

	if (me.classid === 3 && configCheck[1].toString().substring(0, 3).includes("PAL")) {
		CustomConfig = {
			"Paladin.SoloLeveling": me.profile,
		};
	}

	if (me.classid === 4 && configCheck[1].toString().substring(0, 3).includes("BAR")) {
		CustomConfig = {
			"Barbarian.SoloLeveling": me.profile,
		};
	}

	if (me.classid === 5 && configCheck[1].toString().substring(0, 3).includes("DRU")) {
		CustomConfig = {
			"Druid.SoloLeveling": me.profile,
		};
	}

	if (me.classid === 6 && configCheck[1].toString().substring(0, 3).includes("SIN")) {
		CustomConfig = {
			"Assassin.SoloLeveling": me.profile,
		};
	}
} else {
	CustomConfig = {
		/* Format:
			"Config_Filename_Without_Extension": ["array", "of", "profiles"]

			Multiple entries are separated by commas
		*/


	};
}