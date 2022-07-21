/**
*  @filename    TownOverrides.js
*  @author      theBGuy
*  @desc        Town.js additions to improve functionality for map mode
*
*/

includeIfNotIncluded("common/Town.js");

Town.stash = function (stashGold = true) {
	me.cancel();

	let items = me.getItemsEx()
		.filter(function (item) {
			return item.isInInventory && !(item.isEquippedCharm && (item.unique || Storage.Inventory.IsLocked(item, Config.Inventory)));
		})
		.sort(function (a, b) {
			if (a.itemType >= 96 && a.itemType <= 102 || a.itemType === 74 || a.quality === 7) {
				return -1;
			}

			if (b.itemType >= 96 && b.itemType <= 102 || b.itemType === 74 || b.quality === 7) {
				return 1;
			}

			return a.quality - b.quality;
		});

	if (items) {
		for (let i = 0; i < items.length; i++) {
			if (this.canStash(items[i])) {
				Misc.itemLogger("Stashed", items[i]);
				Storage.Stash.MoveTo(items[i]);
			}
		}
	}

	// Stash gold
	if (stashGold) {
		if (me.getStat(sdk.stats.Gold) >= Config.StashGold && me.getStat(sdk.stats.GoldBank) < 25e5 && this.openStash()) {
			gold(me.getStat(sdk.stats.Gold), 3);
			delay(1000); // allow UI to initialize
			me.cancel();
		}
	}

	return true;
};
