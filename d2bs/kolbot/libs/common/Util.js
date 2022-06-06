/**
*  @filename    Util.js
*  @author      Jaenster, theBGuy
*  @desc        utility functions for kolbot
*
*/

/**
 * @param args
 * @returns {Unit[]}
 */
function getUnits(...args) {
	let units = [], unit = getUnit.apply(null, args);

	if (!unit) {
		return [];
	}
	do {
		units.push(copyUnit(unit));
	} while (unit.getNext());
	return units;
}

const clickItemAndWait = (...args) => {
	let before,
		timeout = getTickCount(), timedOut;

	before = !me.itemoncursor;
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
const clickUnitAndWait = (button, shift, unit) => {
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

function includeCommonLibs () {
	let files = dopen("libs/common/").getFiles();
		
	Array.isArray(files) && files
		.filter(file => file.endsWith('.js') && !file.match("auto", "gi") && file !== "Util.js")
		.forEach(function (x) {
			if (!include("common/" + x)) {
				throw new Error("Failed to include " + "common/" + x);
			}
		});
}

// helper functions in case you find it annoying like me to write while (getTickCount() - tick > 3 * 60 * 1000) which is 3 minutes
// instead we can do while (getTickCount() - tick > minutes(5))
function seconds (ms = 0) {
	if (typeof ms !== "number") return 0;
	return (ms * 1000);
}

function minutes (ms = 0) {
	if (typeof ms !== "number") return 0;
	return (ms * 60000);
}

function formatTime (ms = 0) {
	return (new Date(ms).toISOString().slice(11, -5));
}

(function (global, print) {
	global.console = global.console || (function () {
		const console = {};
		const argMap = el => typeof el === 'object' && el /*not null */ && JSON.stringify(el) || el;

		console.log = function (...args) {
			// use call to avoid type errors
			print.call(null, args.map(argMap).join(','));
		};

		console.printDebug = true;
		console.debug = function (...args) {
			if (console.printDebug) {
				const stack = new Error().stack.match(/[^\r\n]+/g),
					filenameAndLine = stack && stack.length && stack[1].substr(stack[1].lastIndexOf('\\') + 1) || 'unknown:0';
				this.log('ÿc:[ÿc:' + filenameAndLine + 'ÿc:]ÿc0 ' + args.map(argMap).join(','));
			}
		};

		console.errorReport = function (error) {
			let msg, source, stack;
			
			if (typeof error === "string") {
				msg = error;
			} else {
				source = error.fileName.substring(error.fileName.lastIndexOf("\\") + 1, error.fileName.length);
				msg = "ÿc1Error @ ÿc2[" + source + " line :: " + error.lineNumber + "ÿc2] ÿc1(" + error.message + ")";

				if (error.hasOwnProperty("stack")) {
					stack = error.stack;

					if (stack) {
						stack = stack.split("\n");

						if (stack && typeof stack === "object") {
							stack.reverse();
						}
					}
				}
			}

			print(msg);
		};

		console.warn = console.debug;

		return console;

	})();
})([].filter.constructor('return this')(), print);
