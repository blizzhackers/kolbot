/*
*	@filename	PickitOverrides.js
*	@author		theBGuy
*	@desc		Pickit.js fixes to improve functionality for map mode
*/

if (!isIncluded("common/Pickit.js")) { include("common/Pickit.js"); }

Pickit.basicPickItems = function () {
	let item, itemList = [];

	item = getUnit(4);

	if (item) {
		do {
			if ((item.mode === 3 || item.mode === 5)) {
				itemList.push(copyUnit(item));
			}
		} while (item.getNext());
	}

	while (itemList.length > 0) {
		itemList.sort(this.sortFastPickItems);
		item = copyUnit(itemList.shift());

		// Check if the item unit is still valid
		if (item.x !== undefined) {
			if (this.canPick(item) && (Storage.Inventory.CanFit(item) || [4, 22, 76, 77, 78].indexOf(item.itemType) > -1)) {
				this.pickItem(item);
			}
		}
	}

	return true;
};
