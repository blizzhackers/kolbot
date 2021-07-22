/*
*	@filename	Tracker.js
*	@author		isid0re
*	@desc		Track bot game performance and sends to CSV file
*/

if (!isIncluded("SoloLeveling/Tools/Developer.js")) {
	include("SoloLeveling/Tools/Developer.js");
}

if (!isIncluded("SoloLeveling/Functions/Quest.js")) {
	include("SoloLeveling/Functions/Quest.js");
}

if (!isIncluded("common/Misc.js")) {
	include("common/Misc.js");
}

var Tracker = {
	GTPath: "libs/SoloLeveling/Data/" + me.profile + ".GameTime.json",
	LPPath: "libs/SoloLeveling/Data/" + me.profile + ".LevelingPerformance.csv",
	SPPath: "libs/SoloLeveling/Data/" + me.profile + ".ScriptPerformance.csv",

	initialize: function () {
		//File Structure
		var LPHeader = "Total Time,InGame Time,Split Time,Area,Character Level,Gained EXP,Gained EXP/Minute,Difficulty,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n"; //Leveling Performance
		var SPHeader = "Total Time,InGame Time,Sequence Time,Sequence,Character Level,Gained EXP,Gained EXP/Minute,Difficulty,Fire Resist,Cold Resist,Light Resist,Poison Resist,Current Build" + "\n"; //Script Performance
		let FirstSave = getTickCount();
		var GameTracker = {
			"Total": 0,
			"InGame": 0,
			"OOG": 0,
			"LastLevel": me.gamestarttime,
			"LastSave": FirstSave
		};

		// Create Files
		if (!FileTools.exists("libs/SoloLeveling/Data/" + me.profile + ".GameTime.json")) {
			Developer.writeObj(GameTracker, Tracker.GTPath);
		}

		if (!FileTools.exists("libs/SoloLeveling/Data/" + me.profile + ".LevelingPerformance.csv")) {
			Misc.fileAction(Tracker.LPPath, 1, LPHeader);
		}

		if (!FileTools.exists("libs/SoloLeveling/Data/" + me.profile + ".ScriptPerformance.csv")) {
			Misc.fileAction(Tracker.SPPath, 1, SPHeader);
		}

		return true;
	},

	logLeveling: function (obj) {
		if (typeof obj === "object" && obj.hasOwnProperty("event") && obj["event"] === "level up") {
			Tracker.Leveling();
		}
	},

	Script: function (starttime, subscript, startexp) {
		var GameTracker = Developer.readObj(Tracker.GTPath),
			newTick = me.gamestarttime >= GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave,
			totalTick = GameTracker.LastSave,
			newIG = GameTracker.InGame + Developer.Timer(newTick),
			newTotal = GameTracker.Total + Developer.Timer(totalTick),
			scriptTime = Developer.Timer(starttime),
			diffString = Difficulty[me.diff],
			gainAMT = me.getStat(13) - startexp,
			gainTime = gainAMT / (scriptTime / 60000),
			currentBuild = SetUp.getBuild(),
			newSave = getTickCount(),
			FR = me.getStat(39),
			CR = me.getStat(43),
			LR = me.getStat(41),
			PR = me.getStat(45),
			string = Developer.formatTime(newTotal) + "," + Developer.formatTime(newIG) + "," + Developer.formatTime(scriptTime) + "," + subscript + "," + me.charlvl + "," + gainAMT + "," + gainTime + "," + diffString + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n";

		GameTracker.Total = newTotal;
		GameTracker.InGame = newIG;
		GameTracker.LastSave = newSave;
		Developer.writeObj(GameTracker, Tracker.GTPath);
		Misc.fileAction(Tracker.SPPath, 2, string);

		return true;
	},

	Leveling: function () {
		var GameTracker = Developer.readObj(Tracker.GTPath),
			newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave,
			totalTick = GameTracker.LastSave,
			newIG = GameTracker.InGame + Developer.Timer(newTick),
			newTotal = GameTracker.Total + Developer.Timer(totalTick),
			newOOG = newTotal - newIG,
			splitTime = Developer.Timer(GameTracker.LastLevel),
			diffString = Difficulty[me.diff],
			areaName = Pather.getAreaName(me.area),
			currentBuild = SetUp.getBuild(),
			newSave = getTickCount(),
			gainAMT = me.getStat(13) - Experience.totalExp[me.charlvl - 1],
			gainTime = gainAMT / (splitTime / 60000),
			FR = me.getStat(39),
			CR = me.getStat(43),
			LR = me.getStat(41),
			PR = me.getStat(45),
			string = Developer.formatTime(newTotal) + "," + Developer.formatTime(newIG) + "," + Developer.formatTime(splitTime) + "," + areaName + "," + me.charlvl + "," + gainAMT + "," + gainTime + "," + diffString + "," + FR + "," + CR + "," + LR + "," + PR + "," + currentBuild + "\n";

		GameTracker.Total = newTotal;
		GameTracker.InGame = newIG;
		GameTracker.OOG = newOOG;
		GameTracker.LastLevel = newSave;
		GameTracker.LastSave = newSave;
		Developer.writeObj(GameTracker, Tracker.GTPath);
		Misc.fileAction(Tracker.LPPath, 2, string);

		return true;
	},

	Update: function () {
		var GameTracker = Developer.readObj(Tracker.GTPath),
			newTick = me.gamestarttime > GameTracker.LastSave ? me.gamestarttime : GameTracker.LastSave,
			totalTick = GameTracker.LastSave,
			newIG = GameTracker.InGame + Developer.Timer(newTick),
			newTotal = GameTracker.Total + Developer.Timer(totalTick),
			newOOG = newTotal - newIG,
			newSave = getTickCount();

		GameTracker.Total = newTotal;
		GameTracker.InGame = newIG;
		GameTracker.OOG = newOOG;
		GameTracker.LastSave = newSave;
		Developer.writeObj(GameTracker, Tracker.GTPath);

		return true;
	},

	Interval: function () {
		let minutes = 3; // interval for timeout in minutes;
		Tracker.Update();
		setTimeout(Tracker.Interval, minutes * 60000);
	},
};
