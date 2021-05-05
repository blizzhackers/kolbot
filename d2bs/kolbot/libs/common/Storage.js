/**
*	@filename	Storage.js
*	@author		McGod, kolton (small kolbot related edits)
*	@desc		manage inventory, belt, stash, cube
*/

var Container = function (name, width, height, location) {
	var h, w;

	this.name = name;
	this.width = width;
	this.height = height;
	this.location = location;
	this.buffer = [];
	this.itemList = [];
	this.openPositions = this.height * this.width;

	// Initalize the buffer array for use, set all as empty.
	for (h = 0; h < this.height; h += 1) {
		this.buffer.push([]);

		for (w = 0; w < this.width; w += 1) {
			this.buffer[h][w] = 0;
		}
	}

	/* Container.Mark(item)
	 *	Marks the item in the buffer, and adds it to the item list.
	 */
	this.Mark = function (item) {
		var x, y;

		//Make sure it is in this container.
		if (item.location !== this.location || item.mode !== 0) {
			return false;
		}

		//Mark item in buffer.
		for (x = item.x; x < (item.x + item.sizex); x += 1) {
			for (y = item.y; y < (item.y + item.sizey); y += 1) {
				this.buffer[y][x] = this.itemList.length + 1;
				this.openPositions -= 1;
			}
		}

		//Add item to list.
		this.itemList.push(copyUnit(item));

		return true;
	};

	/* Container.isLocked(item)
	 *	Checks if the item is in a locked spot
	 */
	this.IsLocked = function (item, baseRef) {
		var h, w, reference;

		reference = baseRef.slice(0);

		//Make sure it is in this container.
		if (item.mode !== 0 || item.location !== this.location) {
			return false;
		}

		// Make sure the item is ours
		if (!item.getParent() || item.getParent().type !== me.type || item.getParent().gid !== me.gid) {
			return false;
		}

		//Insure valid reference.
		if (typeof (reference) !== "object" || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
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

	this.Reset = function () {
		var h, w;

		for (h = 0; h < this.height; h += 1) {
			for (w = 0; w < this.width; w += 1) {
				this.buffer[h][w] = 0;
			}
		}

		this.itemList = [];
		this.openPositions = this.height * this.width;
		return true;
	};

	/* Container.CanFit(item)
	 *	Checks to see if we can fit the item in the buffer.
	 */
	this.CanFit = function (item) {
		return (!!this.FindSpot(item));
	};

	/* Container.SortItems(Ids, Ids)
	 *	sorts items to the left [and right] based on classid.
	 *  default: all items go left
	 */
	this.SortItems = function (itemIdsLeft, itemIdsRight) {
		print("Sorting " + this.name + " ... ");

		// var tick = getTickCount(),
		// 	cube = me.findItem(549);

		//Town.openStash();

		//if (this.location === 7 && cube) sendPacket(1, 0x27, 4, me.findItem(-1, -1, me.findItems(-1, -1, 3) == false ? 1 : 3).gid, 4, cube.gid);
		//if (this.location === 7 && !cube) Town.openStash();

		Storage.Reload();

		var x, y, item, nPos;

		for ( y = this.width - 1 ; y >= 0 ; y-- ) {
			for ( x = this.height - 1 ; x >= 0 ; x-- ) {

				delay(1);

				if ( this.buffer[x][y] === 0 ) {
					continue; // nothing on this spot
				}

				item = this.itemList[this.buffer[x][y] - 1];

				if ( item.classid === 549 ) {
					continue; // dont touch the cube
				}

				var ix = item.y, iy = item.x; // x and y are backwards!

				if ( this.location !== item.location ) {
					D2Bot.printToConsole("Storage.js>SortItems WARNING: Detected a non-storage item in the list: " + item.name + " at " + ix + "," + iy, 6);
					continue; // dont try to touch non-storage items | TODO: prevent non-storage items from getting this far
				}

				if ( this.location === 3 && this.IsLocked(item, Config.Inventory)) {
					continue; // locked spot / item
				}

				if ( ix < x || iy < y ) {
					continue; // not top left part of item
				}

				if ( item.type !== 4 ) {
					D2Bot.printToConsole("Storage.js>SortItems WARNING: Detected a non-item in the list: " + item.name + " at " + ix + "," + iy, 6);
					continue; // dont try to touch non-items | TODO: prevent non-items from getting this far
				}

				if ( item.mode === 3 ) {
					D2Bot.printToConsole("Storage.js>SortItems WARNING: Detected a ground item in the list: " + item.name + " at " + ix + "," + iy, 6);
					continue; // dont try to touch ground items | TODO: prevent ground items from getting this far
				}

				if (this.location === 7) { // always sort stash left-to-right
					nPos = this.FindSpot(item);
				} else if (this.location === 3 && ((!itemIdsLeft && !itemIdsRight) || !itemIdsLeft || itemIdsRight.indexOf(item.classid) > -1 || itemIdsLeft.indexOf(item.classid) === -1)) { // sort from right by default or if specified
					nPos = this.FindSpot(item, true, false, Config.ItemsSortedFromRightPriority);
				} else if (this.location === 3 && itemIdsRight.indexOf(item.classid) === -1 && itemIdsLeft.indexOf(item.classid) > -1) { // sort from left only if specified
					nPos = this.FindSpot(item, false, false, Config.ItemsSortedFromLeftPriority);
				}

				if ( !nPos || (nPos.x === ix && nPos.y === iy)) {
					continue; // skip if no better spot found
				}

				// print("Move " + item.name + " from " + ix + "," + iy + " to " + nPos.y + "," + nPos.x);

				if (!this.MoveToSpot(item, nPos.y, nPos.x)) {
					continue; // we couldnt move the item
				}

				// We moved an item so reload & restart
				Storage.Reload();
				y = this.width - 0;
				break; // Loop again from begin

			}
		}

		print("Sorting " + this.name + " done ");
		//me.cancel();

		return true;
	};

	/* Container.FindSpot(item, reverseX, reverseY, priorityClassIds)
	 *	Finds a spot available in the buffer to place the item.
	 *  reverseX - find a spot from right-to-left instead of left-to-right
	 *  reverseY - find a spot from bottom-to-top instead of top-to-bottom
	 *  priorityClassIds - uses MakeSpot to shift items around to meet sort expectations
	 */
	this.FindSpot = function (item, reverseX, reverseY, priorityClassIds) {
		var x, y, nx, ny,
			startX, startY, endX, endY, xDir = 1, yDir = 1;

		//Make sure it's a valid item
		if (!item) {
			return false;
		}

		startX = 0;
		startY = 0;
		endX = this.width - (item.sizex - 1);
		endY = this.height - (item.sizey - 1);

		Storage.Reload();

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

		//Loop buffer looking for spot to place item.
		for (y = startX; y !== endX; y += xDir) {
			Loop:
			for (x = startY; x !== endY; x += yDir) {
				//Check if there is something in this spot.
				if (this.buffer[x][y] > 0) {

					// TODO: add makespot logic here. priorityClassIds should only be used when sorting -- in town, where it's safe!
					// TODO: collapse this down to just a MakeSpot(item, location) call, and have MakeSpot do the priority checks right at the top
					var bufferItemClass = this.itemList[this.buffer[x][y] - 1].classid;


					// if ( this.location === 3 && this.IsLocked(item, Config.Inventory)) {
					// 	continue; // locked spot / item
					// }

					if (Config.PrioritySorting && priorityClassIds && priorityClassIds.indexOf(item.classid) > -1
						&& !this.IsLocked(this.itemList[this.buffer[x][y] - 1], Config.Inventory) // don't try to make a spot by moving locked items! TODO: move this to the start of loop
						&& (priorityClassIds.indexOf(bufferItemClass) === -1
						|| priorityClassIds.indexOf(item.classid) < priorityClassIds.indexOf(bufferItemClass))) { // item in this spot needs to move!
						D2Bot.printToConsole("Storage.js>FindSpot Trying to make spot for: " + item.name + " at " + y + "," + x, 6);
						var makeSpot = this.MakeSpot(item, {x: x, y: y}); // NOTE: passing these in buffer order [h/x][w/y]

						if (makeSpot) {
							if (makeSpot === -1) {
								return false; // this item cannot be moved
							}

							return makeSpot;
						}
					}

					if (item.gid === undefined) {
						return false;
						break Loop; // this item disappeared? perhaps picked by another bot
					}

					if (item.gid !== this.itemList[this.buffer[x][y] - 1].gid ) { // ignore same gid
						continue;
					}
				}

				//Loop the item size to make sure we can fit it.
				for (nx = 0; nx < item.sizey; nx += 1) {
					for (ny = 0; ny < item.sizex; ny += 1) {
						if (this.buffer[x + nx][y + ny]) {
							if (item.gid !== this.itemList[this.buffer[x + nx][y + ny] - 1].gid ) { // ignore same gid
								continue Loop;
							}
						}
					}
				}

				return ({x: x, y: y});
			}
		}

		return false;
	};

	/* Container.MakeSpot(item, location)
	 *	Makes a spot available in the buffer to place the item.
	 *  NOTE: [x][y] is used in this function to match the the buffer [h][w]
	 * 		  as being iterated in FindSpot, and sizex and sizey are reversed
	 */
	this.MakeSpot = function (item, location, force) {
		var x, y, endx, endy, tmpLocation,
			itemsToMove = [],
			itemsMoved = [];
		// TODO: test the scenario where all possible items have been moved, but this item still can't be placed
		//		 e.g. if there are many LCs in an inventory and the spot for a GC can't be freed up without
		//			  moving other items that ARE NOT part of the position desired

		// Make sure it's a valid item and item is in a priority sorting list
		if (!item || !item.classid
			|| (Config.ItemsSortedFromRightPriority.indexOf(item.classid) === -1
			&& Config.ItemsSortedFromLeftPriority.indexOf(item.classid) === -1
			&& !force)) {
			return false; // only continue if the item is in the priority sort list
		}

		// Make sure the item could even fit at the desired location
		if (!location //|| !(location.x >= 0) || !(location.y >= 0)
			|| ((location.y + (item.sizex - 1)) > (this.width  - 1))
			|| ((location.x + (item.sizey - 1)) > (this.height - 1))) {
			// print(item.name + " could never fit at " + location.y + "," + location.x, 6);

			return false; // location invalid or item could not ever fit in the location
		}

		Storage.Reload();

		// Do not continue if the container doesn't have enough openPositions.
		// TODO: esd1 - this could be extended to use Stash for moving things if inventory is too tightly packed
		if (item.sizex * item.sizey > this.openPositions) {
			// print(item.name + " is too big to fit/move in container: " + this.name + " (openPositions: " + this.openPositions + ")", 6);
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
					// print(this.itemList[this.buffer[x][y] - 1].name + " needs to move from " + y + "," + x, 6);
					itemsToMove.push(copyUnit(this.itemList[this.buffer[x][y] - 1])); // track items that need to move
				}
			}
		}

		// Move any item(s) out of the way
		if (itemsToMove) {
			var i;

			for (i = 0; i < itemsToMove.length; i++) {
				var reverseX = !(Config.ItemsSortedFromRight.indexOf(item.classid) > -1);
				tmpLocation = this.FindSpot(itemsToMove[i], reverseX, false);
				// D2Bot.printToConsole(itemsToMove[i].name + " moving from " + itemsToMove[i].x + "," + itemsToMove[i].y + " to "  + tmpLocation.y + "," + tmpLocation.x, 6);

				if (this.MoveToSpot(itemsToMove[i], tmpLocation.y, tmpLocation.x)) {
					// D2Bot.printToConsole(itemsToMove[i].name + " moved to " + tmpLocation.y + "," + tmpLocation.x, 6);
					itemsMoved.push(copyUnit(itemsToMove[i]));
					Storage.Reload(); // success on this item, reload!
					delay(1); // give reload a moment of time to avoid moving the same item twice
				} else {
					D2Bot.printToConsole(itemsToMove[i].name + " failed to move to " + tmpLocation.y + "," + tmpLocation.x, 6);

					return false;
				}
			}
		}

		return ({x: location.x, y: location.y});
	};

	this.MoveToSpot = function(item, x, y) {
		var n, nDelay, cItem, cube;

		//Cube -> Stash, must place item in inventory first
		if (item.location === 6 && this.location === 7 && !Storage.Inventory.MoveTo(item)) {
			return false;
		}

		//Can't deal with items on ground!
		if (item.mode === 3) {
			return false;
		}

		//Item already on the cursor.
		if (me.itemoncursor && item.mode !== 4) {
			return false;
		}

		//Make sure stash is open
		if (this.location === 7 && !Town.openStash()) {
			return false;
		}

		//Pick to cursor if not already.
		if (!item.toCursor()) {
			return false;
		}

		//Loop three times to try and place it.
		for (n = 0; n < 5; n += 1) {
			if (this.location === 6) { // place item into cube
				cItem = getUnit(100);
				cube = me.getItem(549);

				if (cItem !== null && cube !== null) {
					sendPacket(1, 0x2a, 4, cItem.gid, 4, cube.gid);
				}
			} else {
				clickItem(0, x, y, this.location);
			}

			nDelay = getTickCount();

			while ((getTickCount() - nDelay) < Math.max(1000, me.ping * 3 + 500)) {
				if (!me.itemoncursor) {
					print("Successfully placed " + item.name + " at X: " + x + " Y: " + y);
					delay(200);

					return true;
				}

				delay(10);
			}
		}

		return true;
	};

	/* Container.MoveTo(item)
	 *	Takes any item and moves it into given buffer.
	 */
	this.MoveTo = function (item) {
		var nPos, n, nDelay, cItem, cube;

		try {
			//Can we even fit it in here?
			nPos = this.FindSpot(item);

			if (!nPos) {
				return false;
			}

			return this.MoveToSpot(item, nPos.y, nPos.x);
		} catch (e) {
			print("Storage.Container.MoveTo catched error : "  + e + " - " +e.toSource());

			return false;
		}
	};

	/* Container.Dump()
	 *	Prints all known information about container.
	 */
	this.Dump = function () {
		var x, y, string;

		print(this.name + " has the width of " + this.width + " and the height of " + this.height);
		print(this.name + " has " + this.itemList.length + " items inside, and has " + this.openPositions + " spots left.");

		for (x = 0; x < this.height; x += 1) {
			string = "";

			for (y = 0; y < this.width; y += 1) {
				string += (this.buffer[x][y] > 0) ? "ÿc1x" : "ÿc0o";
			}

			print(string);
		}
	};

	/* Container.UsedSpacePercent()
	 *	Returns percentage of the container used.
	 */
	this.UsedSpacePercent = function () {
		var x, y,
			usedSpace = 0,
			totalSpace = this.height * this.width;

		Storage.Reload();

		for (x = 0; x < this.height; x += 1) {
			for (y = 0; y < this.width; y += 1) {
				if (this.buffer[x][y] > 0) {
					usedSpace += 1;
				}
			}
		}

		return usedSpace * 100 / totalSpace;
	};

	/* Container.compare(reference)
	 *	Compare given container versus the current one, return all new items in current buffer.
	 */
	this.Compare = function (baseRef) {
		var h, w, n, item, itemList, reference;

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

	this.toSource = function () {
		return this.buffer.toSource();
	};
};

var Storage = new function () {
	this.Init = function () {
		this.StashY = me.gametype === 0 ? 4 : 8;
		this.Inventory = new Container("Inventory", 10, 4, 3);
		this.TradeScreen = new Container("Inventory", 10, 4, 5);
		this.Stash = new Container("Stash", 6, this.StashY, 7);
		this.Belt = new Container("Belt", 4 * this.BeltSize(), 1, 2);
		this.Cube = new Container("Horadric Cube", 3, 4, 6);
		this.InvRef = [];

		this.Reload();
	};

	this.BeltSize = function () {
		var item = me.getItem(-1, 1); // get equipped item

		if (!item) { // nothing equipped
			return 1;
		}

		do {
			if (item.bodylocation === 8) { // belt slot
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

		var item = me.getItem();

		if (!item) {
			return false;
		}

		do {
			switch (item.location) {
			case 3:
				this.Inventory.Mark(item);

				break;
			case 5:
				this.TradeScreen.Mark(item);

				break;
			case 2:
				this.Belt.Mark(item);

				break;
			case 6:
				this.Cube.Mark(item);

				break;
			case 7:
				this.Stash.Mark(item);

				break;
			}
		} while (item.getNext());

		return true;
	};
};