/**
*  @filename    PickitOverrides.js
*  @author      theBGuy
*  @desc        Pickit.js additions to improve functionality for map mode
*
*/

includeIfNotIncluded("core/Pickit.js");

Pickit.basicPickItems = function () {
  let itemList = [];
  let item = Game.getItem();

  if (item) {
    do {
      if (item.onGroundOrDropping) {
        itemList.push(copyUnit(item));
      }
    } while (item.getNext());
  }

  while (itemList.length > 0) {
    itemList.sort(this.sortFastPickItems);
    item = copyUnit(itemList.shift());

    // Check if the item unit is still valid
    if (item.x !== undefined) {
      if (this.canPick(item) && (Storage.Inventory.CanFit(item) || Pickit.essentials.includes(item.itemType))) {
        this.pickItem(item);
      }
    }
  }

  return true;
};
