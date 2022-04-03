/**
 * @author Jaenster (I think), theBGuy (includeCommonLibs Function)
 * @description utility functions for kolbot
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
		itemEvent = false,
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
