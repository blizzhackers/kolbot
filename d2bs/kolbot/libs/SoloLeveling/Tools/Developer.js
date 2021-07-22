/*
*	@filename	Developer.js
*	@author		isid0re
*	@desc		Developer tools for SoloLeveling
*	@credits	kolton, D3STROY3R, theBGuy, Adaptist
*/

const Developer = {
	logPerformance: true,	// enables logging statistics
	Overlay: true,	//enables overlay
	logEquipped: false,	//enables equipped items viewable from D2Bot# charviewer tab
	forcePacketCasting: true, //enables forced packet casting for skill.cast
	hideChickens: true, // disable printing chicken info in D2Bot console
	addLadderRW: false, // set to true to enable single player ladder runewords ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED

	/*  Developer tools */
	getObj: function (path) {
		let obj, OBJstring = Misc.fileAction(path, 0);

		while (!obj) {
			try {
				obj = JSON.parse(OBJstring);
			} catch (e) {
				Misc.errorReport(e, "Developer");
			}
		}

		if (obj) {
			return obj;
		}

		print("ÿc9SoloLevelingÿc0: Failed to read Obj. (Developer.parseObj)");

		return false;
	},

	readObj: function (jsonPath) { //getStats
		let obj = this.getObj(jsonPath);

		return Misc.clone(obj);
	},

	writeObj: function (obj, path) {
		let string = JSON.stringify(obj, null, 2);
		Misc.fileAction(path, 1, string);

		return true;
	},

	Timer: function (tick) {
		return getTickCount() - tick;
	},

	formatTime: function (milliseconds) {
		let seconds = milliseconds / 1000,
			sec = (seconds % 60).toFixed(0),
			minutes = (Math.floor(seconds / 60) % 60).toFixed(0),
			hours = Math.floor(seconds / 3600).toFixed(0),
			timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');

		return timeString;
	},
};
