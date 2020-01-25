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
		timeout = getTickCount(),
		gamePacket = bytes => bytes && bytes.length > 0 && bytes[0] === 0x9D /* item event*/ && (itemEvent = true) && false; // false to not block

	addEventListener('gamepacket', gamePacket);

	clickItem.apply(undefined, args);
	delay(Math.max(me.ping * 2, 250));

	before = !me.itemoncursor;
	while (!itemEvent) { // Wait until item is picked up.
		delay(3);

		if (before !== !!me.itemoncursor || getTickCount() - timeout > Math.min(1000, 100 + (me.ping * 4))) {
			break; // quit the loop of item on cursor has changed
		}
	}

	removeEventListener('gamepacket', gamePacket);
	delay(Math.max(me.ping, 50));
	itemEvent = false;
};