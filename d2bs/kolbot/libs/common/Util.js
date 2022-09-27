/**
*  @filename    Util.js
*  @author      Jaenster, theBGuy
*  @desc        utility functions for kolbot
*
*/

!isIncluded("Polyfill.js") && include("Polyfill.js");
// torn on if these include functions should be here or in polyfill - not exactly polyfill functions but sorta?
const includeIfNotIncluded = function (file = "") {
	if (!isIncluded(file)) {
		if (!include(file)) {
			console.error("Failed to include " + file);
			console.trace();
		}
	}
	return true;
};

const includeCommonLibs = function () {
	let files = dopen("libs/common/").getFiles();
	if (!files.length) throw new Error("Failed to find my files");
	if (!files.includes("Pather.js")) {
		console.warn("Incorrect Files?", files);
		// something went wrong?
		while (!files.includes("Pather.js")) {
			files = dopen("libs/common/").getFiles();
			delay(50);
		}
	}

	files.filter(file => file.endsWith(".js") && !file.match("auto", "gi") && !file.match("util.js", "gi"))
		.forEach(function (x) {
			if (!includeIfNotIncluded("common/" + x)) {
				throw new Error("Failed to include common/" + x);
			}
		});
};

const includeOOGLibs = function () {
	let files = dopen("libs/oog/").getFiles();
	if (!files.length) throw new Error("Failed to find my files");
	if (!files.includes("DataFile.js")) {
		console.warn("Incorrect Files?", files);
		// something went wrong?
		while (!files.includes("DataFile.js")) {
			files = dopen("libs/oog/").getFiles();
			delay(50);
		}
	}
		
	files.filter(file => file.endsWith(".js"))
		.forEach(function (x) {
			if (!includeIfNotIncluded("oog/" + x)) {
				throw new Error("Failed to include oog/" + x);
			}
		});
};

/**
 * @param args
 * @returns Unit[]
 */
const getUnits = function (...args) {
	let units = [], unit = getUnit.apply(null, args);

	if (!unit) {
		return [];
	}
	do {
		units.push(copyUnit(unit));
	} while (unit.getNext());
	return units;
};

const clickItemAndWait = function (...args) {
	let timeout = getTickCount(), timedOut;
	let before = !me.itemoncursor;

	clickItem.apply(undefined, args);
	delay(Math.max(me.ping * 2, 250));


	while (true) { // Wait until item is picked up.
		delay(3);

		if (before !== !!me.itemoncursor || (timedOut = getTickCount() - timeout > Math.min(1000, 100 + (me.ping * 4)))) {
			break; // quit the loop of item on cursor has changed
		}
	}

	delay(Math.max(me.ping, 50));

	// return item if we didnt timeout
	return !timedOut;
};

/**
 * @description clickMap doesn't return if we sucessfully clicked a unit just that a click was sent, this checks and returns that a units mode has changed
 *		as a result of us clicking it.
 * @returns boolean
 */
const clickUnitAndWait = function (button, shift, unit) {
	if (typeof (unit) !== "object") throw new Error("clickUnitAndWait: Third arg must be a Unit.");

	let before = unit.mode;

	me.blockMouse = true;
	clickMap(button, shift, unit);
	delay(Math.max(me.ping * 2, 250));
	clickMap(button + 2, shift, unit);
	me.blockMouse = false;
	
	let waitTick = getTickCount();
	let timeOut = Math.min(1000, 100 + (me.ping * 4));

	while (getTickCount() - waitTick < timeOut) {
		delay(30);
		
		// quit the loop if mode has changed
		if (before !== unit.mode) {
			break;
		}
	}

	delay(Math.max(me.ping + 1, 50));

	return (before !== unit.mode);
};

// helper functions in case you find it annoying like me to write while (getTickCount() - tick > 3 * 60 * 1000) which is 3 minutes
// instead we can do while (getTickCount() - tick > Time.minutes(5))
const Time = {
	seconds: function (seconds = 0) {
		if (typeof seconds !== "number") return 0;
		return (seconds * 1000);
	},
	minutes: function (minutes = 0) {
		if (typeof minutes !== "number") return 0;
		return (minutes * 60000);
	},
	format: function (ms = 0) {
		return (new Date(ms).toISOString().slice(11, -5));
	}
};

const Game = {
	getDistance: function (...args) {
		switch (args.length) {
		case 0:
			return Infinity;
		case 1:
			// getDistance(unit) - returns distance that unit is from me
			if (typeof args[0] !== "object") return Infinity;
			if (!args[0].hasOwnProperty("x")) return Infinity;
			return Math.sqrt(Math.pow((me.x - args[0].x), 2) + Math.pow((me.y - args[0].y), 2));
		case 2:
			// getDistance(x, y) - returns distance x, y is from me
			// getDistance(unitA, unitB) - returns distace unitA is from unitB
			if (typeof args[0] === "number" && typeof args[1] === "number") {
				return Math.sqrt(Math.pow((me.x - args[0]), 2) + Math.pow((me.y - args[1]), 2));
			} else if (typeof args[0] === "object" && typeof args[1] === "object") {
				if (!args[1].hasOwnProperty("x")) return Infinity;
				return Math.sqrt(Math.pow((args[0].x - args[1].x), 2) + Math.pow((args[0].y - args[1].y), 2));
			}
			return Infinity;
		case 3:
			// getDistance(unit, x, y) - returns distance x, y is from unit
			if (typeof args[2] !== "number") return Infinity;
			if (!args[0].hasOwnProperty("x")) return Infinity;
			return Math.sqrt(Math.pow((args[0].x - args[1]), 2) + Math.pow((args[0].y - args[2]), 2));
		case 4:
			// getDistance(x1, y1, x2, y2)
			if (typeof args[0] !== "number" || typeof args[3] !== "number") return Infinity;
			return Math.sqrt(Math.pow((args[0] - args[2]), 2) + Math.pow((args[1] - args[3]), 2));
		default:
			return Infinity;
		}
	},
	getCursorUnit: function () {
		return getUnit(100);
	},
	getSelectedUnit: function () {
		return getUnit(101);
	},
	getPlayer: function (id, mode, gid) {
		return getUnit(sdk.unittype.Player, id, mode, gid);
	},
	getMonster: function (id, mode, gid) {
		return getUnit(sdk.unittype.Monster, id, mode, gid);
	},
	getNPC: function (id, mode, gid) {
		return getUnit(sdk.unittype.NPC, id, mode, gid);
	},
	getObject: function (id, mode, gid) {
		return getUnit(sdk.unittype.Object, id, mode, gid);
	},
	getMissile: function (id, mode, gid) {
		return getUnit(sdk.unittype.Missile, id, mode, gid);
	},
	getItem: function (id, mode, gid) {
		return getUnit(sdk.unittype.Item, id, mode, gid);
	},
	getStairs: function (id, mode, gid) {
		return getUnit(sdk.unittype.Stairs, id, mode, gid);
	},
	getPresetMonster: function (area, id) {
		!area && (area = me.area);
		return getPresetUnit(area, sdk.unittype.Monster, id);
	},
	getPresetMonsters: function (area, id) {
		!area && (area = me.area);
		return getPresetUnits(area, sdk.unittype.Monster, id);
	},
	getPresetObject: function (area, id) {
		!area && (area = me.area);
		return getPresetUnit(area, sdk.unittype.Object, id);
	},
	getPresetObjects: function (area, id) {
		!area && (area = me.area);
		return getPresetUnits(area, sdk.unittype.Object, id);
	},
	getPresetStair: function (area, id) {
		!area && (area = me.area);
		return getPresetUnit(area, sdk.unittype.Stairs, id);
	},
	getPresetStairs: function (area, id) {
		!area && (area = me.area);
		return getPresetUnits(area, sdk.unittype.Stairs, id);
	},
};
