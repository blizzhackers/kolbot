/* eslint-disable max-len */
/**
*  @filename    Storage.js
*  @author      McGod, kolton, esd1, theBGuy
*  @desc        Manage our storage space, belt, stash, cube, inventory
*
*/

(function () {
  /**
   * @constructor
   * @param {string} name - container name 
   * @param {number} width - container width 
   * @param {number} height - container height
   * @param {number} location - container location
   */
  function Container (name, width, height, location) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.location = location;
    /** @type {number[][]} */
    this.buffer = [];
    /** @type {ItemUnit[]} */
    this.itemList = [];
    this.openPositions = this.height * this.width;

    for (let h = 0; h < this.height; h += 1) {
      this.buffer.push([]);

      for (let w = 0; w < this.width; w += 1) {
        this.buffer[h][w] = 0;
      }
    }
  }

  /**
   * @param {ItemUnit} item 
   */
  Container.prototype.Mark = function (item) {
    let x, y;

    // Make sure it is in this container.
    if (item.location !== this.location
      || (item.mode !== sdk.items.mode.inStorage && item.mode !== sdk.items.mode.inBelt)) {
      return false;
    }

    // Mark item in buffer.
    for (x = item.x; x < (item.x + item.sizex); x += 1) {
      for (y = item.y; y < (item.y + item.sizey); y += 1) {
        this.buffer[y][x] = this.itemList.length + 1;
        this.openPositions -= 1;
      }
    }

    // Add item to list.
    this.itemList.push(copyUnit(item));

    return true;
  };

  /**
   * @param {ItemUnit} item 
   * @param {number[][]} baseRef 
   */
  Container.prototype.IsLocked = function (item, baseRef) {
    let h, w;
    let reference = baseRef.slice(0);

    // Make sure it is in this container.
    if (item.mode !== sdk.items.mode.inStorage || item.location !== this.location) {
      return false;
    }

    // Make sure the item is ours
    if (!item.getParent() || item.getParent().type !== me.type || item.getParent().gid !== me.gid) {
      return false;
    }

    //Insure valid reference.
    if (typeof (reference) !== "object"
      || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
      throw new Error("Storage.IsLocked: Invalid inventory reference");
    }

    try {
      // Check if the item lies in a locked spot.
      for (h = item.y; h < (item.y + item.sizey); h += 1) {
        for (w = item.x; w < (item.x + item.sizex); w += 1) {
          if (reference[h][w] === 0) {
            return true;
          }
        }
      }
    } catch (e2) {
      throw new Error("Storage.IsLocked error! Item info: " + item.name + " " + item.y + " " + item.sizey + " " + item.x + " " + item.sizex + " " + item.mode + " " + item.location);
    }

    return false;
  };

  Container.prototype.Reset = function () {
    for (let h = 0; h < this.height; h += 1) {
      for (let w = 0; w < this.width; w += 1) {
        this.buffer[h][w] = 0;
      }
    }

    this.itemList = [];
    this.openPositions = this.height * this.width;

    return true;
  };

  /**
   * @param {string} name 
   */
  Container.prototype.cubeSpot = function (name) {
    if (name !== "Stash") return true;

    let cube = me.getItem(sdk.quest.item.Cube);
    if (!cube) return false;

    // Cube is in correct location
    if (cube && cube.isInStash && cube.x === 0 && cube.y === 0) {
      return true;
    }

    let makeCubeSpot = this.MakeSpot(cube, { x: 0, y: 0 }, true); // NOTE: passing these in buffer order [h/x][w/y]

    if (makeCubeSpot) {
      // this item cannot be moved
      if (makeCubeSpot === -1) return false;
      // we couldnt move the item
      if (!this.MoveToSpot(cube, makeCubeSpot.y, makeCubeSpot.x)) return false;
    }

    return true;
  };

  /**
   * @param {ItemUnit} item 
   */
  Container.prototype.IsPossibleToFit = function (item) {
    if (!item) return false;
    // only for the inventory as this has to deal with locked spots
    if (this.name !== "Inventory") return true;
    for (let y = 0; y < this.width - (item.sizex - 1); y++) {
      Loop:
      for (let x = 0; x < this.height - (item.sizey - 1); x++) {
        // If spot is locked move on
        if (Config.Inventory[x][y] === 0) continue;

        // Loop the item size to make sure we can fit it in non locked spots.
        for (let nx = 0; nx < item.sizey; nx++) {
          for (let ny = 0; ny < item.sizex; ny++) {
            if (Config.Inventory[x + nx][y + ny] === 0) continue Loop;
          }
        }

        return true;
      }
    }
    return false;
  };

  /**
   * @param {ItemUnit} item 
   */
  Container.prototype.CanFit = function (item) {
    return (!!this.FindSpot(item));
  };

  /**
   * @param {number[]} itemIdsLeft 
   * @param {number[]} itemIdsRight 
   */
  Container.prototype.SortItems = function (itemIdsLeft, itemIdsRight) {
    Storage.Reload();

    this.cubeSpot(this.name);

    itemIdsLeft === undefined && (itemIdsLeft = Config.SortSettings.ItemsSortedFromLeft);
    itemIdsRight === undefined && (itemIdsRight = Config.SortSettings.ItemsSortedFromRight);

    let x, y, item, nPos;

    for (y = this.width - 1; y >= 0; y--) {
      for (x = this.height - 1; x >= 0; x--) {

        delay(1);

        if (this.buffer[x][y] === 0) {
          continue; // nothing on this spot
        }

        item = this.itemList[this.buffer[x][y] - 1];

        if (item.classid === sdk.quest.item.Cube
          && item.isInStash
          && item.x === 0
          && item.y === 0) {
          continue; // dont touch the cube
        }
        
        let [ix, iy] = [item.y, item.x]; // x and y are backwards!

        if (this.location !== item.location) {
          D2Bot.printToConsole("StorageOverrides.js>SortItems WARNING: Detected a non-storage item in the list: " + item.name + " at " + ix + "," + iy, sdk.colors.D2Bot.Gold);
          continue; // dont try to touch non-storage items | TODO: prevent non-storage items from getting this far
        }

        if (this.location === sdk.storage.Inventory && this.IsLocked(item, Config.Inventory)) {
          continue; // locked spot / item
        }

        if (ix < x || iy < y) {
          continue; // not top left part of item
        }

        if (item.type !== sdk.unittype.Item) {
          D2Bot.printToConsole("StorageOverrides.js>SortItems WARNING: Detected a non-item in the list: " + item.name + " at " + ix + "," + iy, sdk.colors.D2Bot.Gold);
          continue; // dont try to touch non-items | TODO: prevent non-items from getting this far
        }

        if (item.mode === sdk.items.mode.onGround) {
          D2Bot.printToConsole("StorageOverrides.js>SortItems WARNING: Detected a ground item in the list: " + item.name + " at " + ix + "," + iy, sdk.colors.D2Bot.Gold);
          continue; // dont try to touch ground items | TODO: prevent ground items from getting this far
        }

        // always sort stash left-to-right
        if (this.location === sdk.storage.Stash) {
          nPos = this.FindSpot(item);
        } else if (this.location === sdk.storage.Inventory && ((!itemIdsLeft && !itemIdsRight) || !itemIdsLeft || itemIdsRight.includes(item.classid) || itemIdsLeft.indexOf(item.classid) === -1)) {
          // sort from right by default or if specified
          nPos = this.FindSpot(item, true, false, Config.SortSettings.ItemsSortedFromRightPriority);
        } else if (this.location === sdk.storage.Inventory && itemIdsRight.indexOf(item.classid) === -1 && itemIdsLeft.includes(item.classid)) {
          // sort from left only if specified
          nPos = this.FindSpot(item, false, false, Config.SortSettings.ItemsSortedFromLeftPriority);
        }

        // skip if no better spot found
        if (!nPos || (nPos.x === ix && nPos.y === iy)) {
          continue;
        }

        if (!this.MoveToSpot(item, nPos.y, nPos.x)) {
          continue; // we couldnt move the item
        }

        // We moved an item so reload & restart
        Storage.Reload();
        y = this.width - 0;

        break; // Loop again from begin
      }
    }

    // this.Dump();

    return true;
  };

  /**
   * @param {ItemUnit | { sizex: number, sizey: number }} item 
   * @param {boolean} reverseX 
   * @param {boolean} reverseY 
   * @param {number[]} priorityClassIds 
   */
  Container.prototype.FindSpot = function (item, reverseX, reverseY, priorityClassIds) {
    // Make sure it's a valid item
    if (!item) return false;

    if (item.sizex && item.sizey && !(item instanceof Unit)) {
      // fake item we are checking if we can fit a certain sized item so mock some props to it
      item.gid = -1;
      item.classid = -1;
      item.quality = -1;
      item.gfx = -1;
    }

    /**
     * @todo review this to see why it sometimes fails when there is actually enough room
     */

    let x, y, nx, ny, makeSpot;
    let xDir = 1, yDir = 1;

    let startX = 0;
    let startY = 0;
    let endX = this.width - (item.sizex - 1);
    let endY = this.height - (item.sizey - 1);

    if (reverseX) { // right-to-left
      startX = endX - 1;
      endX = -1; // stops at 0
      xDir = -1;
    }

    if (reverseY) { // bottom-to-top
      startY = endY - 1;
      endY = -1; // stops at 0
      yDir = -1;
    }

    Storage.Reload();

    //Loop buffer looking for spot to place item.
    for (y = startX; y !== endX; y += xDir) {
      Loop:
      for (x = startY; x !== endY; x += yDir) {
        //Check if there is something in this spot.
        if (this.buffer[x][y] > 0) {

          // TODO: add makespot logic here. priorityClassIds should only be used when sorting -- in town, where it's safe!
          // TODO: collapse this down to just a MakeSpot(item, location) call, and have MakeSpot do the priority checks right at the top
          let bufferItemClass = this.itemList[this.buffer[x][y] - 1].classid;
          let bufferItemGfx = this.itemList[this.buffer[x][y] - 1].gfx;
          let bufferItemQuality = this.itemList[this.buffer[x][y] - 1].quality;

          if (Config.SortSettings.PrioritySorting && priorityClassIds && priorityClassIds.includes(item.classid)
            && !this.IsLocked(this.itemList[this.buffer[x][y] - 1], Config.Inventory) // don't try to make a spot by moving locked items! TODO: move this to the start of loop
            && (priorityClassIds.indexOf(bufferItemClass) === -1
            || priorityClassIds.indexOf(item.classid) < priorityClassIds.indexOf(bufferItemClass))) { // item in this spot needs to move!
            makeSpot = this.MakeSpot(item, { x: x, y: y }); // NOTE: passing these in buffer order [h/x][w/y]

            if (item.classid !== bufferItemClass // higher priority item
              || (item.classid === bufferItemClass && item.quality > bufferItemQuality) // same class, higher quality item
              || (item.classid === bufferItemClass && item.quality === bufferItemQuality && item.gfx > bufferItemGfx) // same quality, higher graphic item
              || (Config.AutoEquip && item.classid === bufferItemClass && item.quality === bufferItemQuality && item.gfx === bufferItemGfx // same graphic, higher tier item
                && NTIP.GetTier(item) > NTIP.GetTier(this.itemList[this.buffer[x][y] - 1]))) {
              makeSpot = this.MakeSpot(item, { x: x, y: y }); // NOTE: passing these in buffer order [h/x][w/y]

              if (makeSpot) {
                // this item cannot be moved
                if (makeSpot === -1) return false;

                return makeSpot;
              }
            }
          }

          if (item.gid === undefined) return false;

          // ignore same gid
          if (item.gid !== this.itemList[this.buffer[x][y] - 1].gid ) {
            continue;
          }
        }

        // Loop the item size to make sure we can fit it.
        for (nx = 0; nx < item.sizey; nx += 1) {
          for (ny = 0; ny < item.sizex; ny += 1) {
            if (this.buffer[x + nx][y + ny]) {
              // ignore same gid
              if (item.gid !== this.itemList[this.buffer[x + nx][y + ny] - 1].gid) {
                continue Loop;
              }
            }
          }
        }

        return ({ x: x, y: y });
      }
    }

    return false;
  };

  /**
   * @param {ItemUnit} item 
   * @param {{x: number, y: number}} location 
   * @param {boolean} force 
   */
  Container.prototype.MakeSpot = function (item, location, force) {
    let x, y, endx, endy, tmpLocation;
    let [itemsToMove, itemsMoved] = [[], []];
    // TODO: test the scenario where all possible items have been moved, but this item still can't be placed
    //		 e.g. if there are many LCs in an inventory and the spot for a GC can't be freed up without
    //			  moving other items that ARE NOT part of the position desired

    // Make sure it's a valid item and item is in a priority sorting list
    if (!item || !item.classid
      || (Config.SortSettings.ItemsSortedFromRightPriority.indexOf(item.classid) === -1
      && Config.SortSettings.ItemsSortedFromLeftPriority.indexOf(item.classid) === -1
      && !force)) {
      return false; // only continue if the item is in the priority sort list
    }

    // Make sure the item could even fit at the desired location
    if (!location //|| !(location.x >= 0) || !(location.y >= 0)
      || ((location.y + (item.sizex - 1)) > (this.width - 1))
      || ((location.x + (item.sizey - 1)) > (this.height - 1))) {
      return false; // location invalid or item could not ever fit in the location
    }

    Storage.Reload();

    // Do not continue if the container doesn't have enough openPositions.
    // TODO: esd1 - this could be extended to use Stash for moving things if inventory is too tightly packed
    if (item.sizex * item.sizey > this.openPositions) {
      return -1; // return a non-false answer to FindSpot so it doesn't keep looking
    }

    endy = location.y + (item.sizex - 1);
    endx = location.x + (item.sizey - 1);

    // Collect a list of all the items in the way of using this position
    for (x = location.x; x <= endx; x += 1) { // item height
      for (y = location.y; y <= endy; y += 1) { // item width
        if ( this.buffer[x][y] === 0 ) {
          continue; // nothing to move from this spot
        } else if (item.gid === this.itemList[this.buffer[x][y] - 1].gid) {
          continue; // ignore same gid
        } else {
          itemsToMove.push(copyUnit(this.itemList[this.buffer[x][y] - 1])); // track items that need to move
        }
      }
    }

    // Move any item(s) out of the way
    if (itemsToMove.length) {
      for (let i = 0; i < itemsToMove.length; i++) {
        let reverseX = !(Config.SortSettings.ItemsSortedFromRight.includes(item.classid));
        tmpLocation = this.FindSpot(itemsToMove[i], reverseX, false);
        // D2Bot.printToConsole(itemsToMove[i].name + " moving from " + itemsToMove[i].x + "," + itemsToMove[i].y + " to "  + tmpLocation.y + "," + tmpLocation.x, sdk.colors.D2Bot.Gold);

        if (this.MoveToSpot(itemsToMove[i], tmpLocation.y, tmpLocation.x)) {
          // D2Bot.printToConsole(itemsToMove[i].name + " moved to " + tmpLocation.y + "," + tmpLocation.x, sdk.colors.D2Bot.Gold);
          itemsMoved.push(copyUnit(itemsToMove[i]));
          Storage.Reload(); // success on this item, reload!
          delay(1); // give reload a moment of time to avoid moving the same item twice
        } else {
          D2Bot.printToConsole(itemsToMove[i].name + " failed to move to " + tmpLocation.y + "," + tmpLocation.x, sdk.colors.D2Bot.Gold);

          return false;
        }
      }
    }

    //D2Bot.printToConsole("MakeSpot success! " + item.name + " can now be placed at " + location.y + "," + location.x, sdk.colors.D2Bot.Gold);
    return ({ x: location.x, y: location.y });
  };

  /**
   * @param {ItemUnit} item 
   * @param {number} mX 
   * @param {number} mY 
   */
  Container.prototype.MoveToSpot = function (item, mX, mY) {
    let cItem, cube;

    // handle opening cube
    if (this.location === sdk.storage.Cube) {
      cube = me.getItem(sdk.quest.item.Cube);
      if (!cube) return false;
      if ((cube.isInStash || item.isInStash) && !getUIFlag(sdk.uiflags.Stash) && !Town.openStash()) {
        return false;
      }
    }

    if (item.location === sdk.storage.Cube/*  && this.location === sdk.storage.Stash && !Storage.Inventory.MoveTo(item) */) {
      if (!getUIFlag(sdk.uiflags.Cube) && !Cubing.openCube()) return false;
      // Cube -> Stash, must place item in inventory first
      if (this.location === sdk.storage.Stash && !Storage.Inventory.MoveTo(item)) return false;
    }

    // Can't deal with items on ground!
    if (item.mode === sdk.items.mode.onGround) return false;
    // Item already on the cursor.
    if (me.itemoncursor && item.mode !== sdk.items.mode.onCursor) return false;

    // Make sure stash is open
    if (this.location === sdk.storage.Stash && !Town.openStash()) return false;

    const [orgX, orgY, orgLoc] = [item.x, item.y, item.location];
    const moveItem = (x, y, location) => {
      for (let n = 0; n < 5; n += 1) {
        switch (location) {
        case sdk.storage.Belt:
          cItem = Game.getCursorUnit();
          cItem !== null && sendPacket(1, sdk.packets.send.ItemToBelt, 4, cItem.gid, 4, y);

          break;
        case sdk.storage.Inventory:
          sendPacket(1, sdk.packets.send.ItemToBuffer, 4, item.gid, 4, x, 4, y, 4, 0x00);

          break;
        case sdk.storage.Cube:
          cItem = Game.getCursorUnit();
          cube = me.getItem(sdk.quest.item.Cube);
          if (cItem !== null && cube !== null) {
            sendPacket(1, sdk.packets.send.ItemToCube, 4, cItem.gid, 4, cube.gid);
          }

          break;
        case sdk.storage.Stash:
          sendPacket(1, sdk.packets.send.ItemToBuffer, 4, item.gid, 4, x, 4, y, 4, 0x04);

          break;
        default:
          clickItemAndWait(sdk.clicktypes.click.item.Left, x, y, location);

          break;
        }

        let nDelay = getTickCount();

        while ((getTickCount() - nDelay) < Math.max(1000, me.ping * 2 + 200)) {
          if (!me.itemoncursor) return true;

          delay(10 + me.ping);
        }
      }

      return false;
    };

    if (Packet.itemToCursor(item)) {
      if (moveItem(mX, mY, this.location)) return true;
      moveItem(orgX, orgY, orgLoc) && console.debug("Failed to move " + item.fname + " to " + mX + "/" + mY);
    }

    return false;
  };

  /**
   * @param {ItemUnit} item 
   */
  Container.prototype.MoveTo = function (item) {
    let nPos;

    try {
      //Can we even fit it in here?
      nPos = this.FindSpot(item);
      if (!nPos) return false;

      return this.MoveToSpot(item, nPos.y, nPos.x);
    } catch (e) {
      console.log("Storage.Container.MoveTo caught error : " + e + " - " + e.toSource());

      return false;
    }
  };

  Container.prototype.Dump = function () {
    let x, y, string;

    if (this.UsedSpacePercent() > 60) {
      for (x = 0; x < this.height; x += 1) {
        string = "";

        for (y = 0; y < this.width; y += 1) {
          string += (this.buffer[x][y] > 0) ? "ÿc1x" : "ÿc0o";
        }

        console.log(string);
      }
    }

    console.log("ÿc9Storageÿc0: " + this.name + " has used " + this.UsedSpacePercent().toFixed(2) + "% of its total space");
  };

  Container.prototype.UsedSpacePercent = function () {
    let usedSpace = 0;
    let totalSpace = this.height * this.width;

    Storage.Reload();

    for (let x = 0; x < this.height; x += 1) {
      for (let y = 0; y < this.width; y += 1) {
        if (this.buffer[x][y] > 0) {
          usedSpace += 1;
        }
      }
    }

    return usedSpace * 100 / totalSpace;
  };

  /**
   * @param {number[][]} baseRef 
   */
  Container.prototype.Compare = function (baseRef) {
    let h, w, n, item, itemList, reference;

    Storage.Reload();

    try {
      itemList = [];
      reference = baseRef.slice(0, baseRef.length);

      //Insure valid reference.
      if (typeof (reference) !== "object" || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
        throw new Error("Unable to compare different containers.");
      }

      for (h = 0; h < this.height; h += 1) {
        Loop:
        for (w = 0; w < this.width; w += 1) {
          item = this.itemList[this.buffer[h][w] - 1];

          if (!item) {
            continue;
          }

          for (n = 0; n < itemList.length; n += 1) {
            if (itemList[n].gid === item.gid) {
              continue Loop;
            }
          }

          //Check if the buffers changed and the current buffer has an item there.
          if (this.buffer[h][w] > 0 && reference[h][w] > 0) {
            itemList.push(copyUnit(item));
          }
        }
      }

      return itemList;
    } catch (e) {
      return false;
    }
  };

  Container.prototype.toSource = function () {
    return this.buffer.toSource();
  };

  /**
   * @type {storage} Storage
   */
  const Storage = new function () {
    this.Init = () => {
      this.StashY = me.classic ? 4 : Config.SortSettings.PlugYStash ? 10 : 8;
      this.Inventory = new Container("Inventory", 10, 4, 3);
      this.TradeScreen = new Container("Inventory", 10, 4, 5);
      this.Stash = new Container("Stash", (Config.SortSettings.PlugYStash ? 10 : 6), this.StashY, 7);
      this.Belt = new Container("Belt", 4 * this.BeltSize(), 1, 2);

      /**
       * @description Return column status (needed potions in each column)
       * @param {0 | 1 | 2 | 3 | 4} beltSize 
       * @returns {[number, number, number, number]}
       */
      this.Belt.checkColumns = function (beltSize) {
        beltSize === undefined && (beltSize = this.width / 4);
        let col = [beltSize, beltSize, beltSize, beltSize];
        let pot = me.getItem(-1, sdk.items.mode.inBelt);

        // No potions
        if (!pot) return col;

        do {
          col[pot.x % 4] -= 1;
        } while (pot.getNext());

        return col;
      };

      this.Cube = new Container("Horadric Cube", 3, 4, 6);
      this.InvRef = [];

      this.Reload();
    };

    this.BeltSize = function () {
      let item = me.getItem(-1, sdk.items.mode.Equipped); // get equipped item
      if (!item) return 1; // nothing equipped

      do {
        if (item.bodylocation === sdk.body.Belt) {
          switch (item.code) {
          case "lbl": // sash
          case "vbl": // light belt
            return 2;
          case "mbl": // belt
          case "tbl": // heavy belt
            return 3;
          default: // everything else
            return 4;
          }
        }
      } while (item.getNext());

      return 1; // no belt
    };

    this.Reload = function () {
      this.Inventory.Reset();
      this.Stash.Reset();
      this.Belt.Reset();
      this.Cube.Reset();
      this.TradeScreen.Reset();

      let item = me.getItem();
      if (!item) return false;

      do {
        switch (item.location) {
        case sdk.storage.Inventory:
          this.Inventory.Mark(item);

          break;
        case sdk.storage.TradeWindow:
          this.TradeScreen.Mark(item);

          break;
        case sdk.storage.Belt:
          this.Belt.Mark(item);

          break;
        case sdk.storage.Cube:
          this.Cube.Mark(item);

          break;
        case sdk.storage.Stash:
          this.Stash.Mark(item);

          break;
        }
      } while (item.getNext());

      return true;
    };
  };

  // export to global scope
  global.Storage = Storage;
})();
