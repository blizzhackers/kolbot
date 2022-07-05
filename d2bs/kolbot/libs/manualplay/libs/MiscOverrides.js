/*
*	@filename	MiscOverrides.js
*	@author		theBGuy
*	@desc		Misc.js fixes to improve functionality for map mode
*/

if (!isIncluded("common/Misc.js")) { include("common/Misc.js"); }

Misc.openRedPortal = function (portalID) {
	if (!me.getItem(549)) return;

	function getTome () {
		let npc, tome, scroll;
		let tpTome = me.findItems(518, 0, 3);

		try {
			if (tpTome.length < 2) {
				npc = Town.initNPC("Shop", "buyTpTome");

				if (!getInteractedNPC()) {
					throw new Error("Failed to find npc");
				}

				tome = npc.getItem(518);

				if (!!tome && tome.getItemCost(0) < me.gold && tome.buy()) {
					delay(500);
					tpTome = me.findItems(518, 0, 3);
					tpTome.forEach(function (book) {
						while (book.getStat(sdk.stats.Quantity) < 20) {
							scroll = npc.getItem(529);
							
							if (!!scroll && scroll.getItemCost(0) < me.gold) {
								scroll.buy();
							} else {
								break;
							}

							delay(20);
						}
					});
				}
			}
		} finally {
			me.cancel();
		}
	}

	try {
		let materials, validMats = [];

		switch (portalID) {
		case 39:
			if (me.getQuest(4, 10)) {
				throw new Error("Unable to open cow portal because cow king has been killed");
			}

			materials = [88, 518];

			break;
		case 136:
			materials = [650, 651, 652];

			break;
		default:
			materials = [647, 648, 649];

			break;
		}

		materials.forEach(function (mat) {
			mat === 518 && getTome();
			let item = me.getItem(mat);
			!!item && validMats.push(item);
		});

		if (validMats.length !== materials.length) {
			throw new Error("Missing materials to open portal");
		}

		if (portalID === 39) {
			me.area !== 1 && Town.goToTown(1);
		} else {
			me.area !== 109 && Town.goToTown(5);
		}

		Town.move("stash");

		if (portalID && Pather.getPortal(portalID)) {
			throw new Error("Portal is already open");
		}

		Cubing.openCube();

		if (!Cubing.emptyCube()) {
			throw new Error("Failed to empty cube");
		}

		validMats.forEach(function (mat) {
			return Storage.Cube.MoveTo(mat);
		});

		Cubing.openCube() && transmute();
	} catch (e) {
		print(e);

	} finally {
		me.cancel();
	}
};

Misc.talkToTyrael = function () {
	if (me.area !== 73) return false;

	Pather.walkTo(22621, 15711);
	Pather.moveTo(22602, 15705);
	Pather.moveTo(22579, 15704);
	Pather.moveTo(22575, 15675);
	Pather.moveTo(22579, 15655);
	Pather.walkTo(22578, 15642); // walk trough door
	Pather.moveTo(22578, 15618);
	Pather.moveTo(22576, 15591); // tyreal

	let tyrael = getUnit(1, NPC.Tyrael);

	if (tyrael) {
		for (let i = 0; i < 3; i++) {
			if (getDistance(me, tyrael) > 3) {
				Pather.moveToUnit(tyrael);
			}

			tyrael.interact();
			delay(1000 + me.ping);
			me.cancel();

			if (Pather.getPortal(null)) {
				me.cancel();

				break;
			}
		}
	}

	return Pather.usePortal(null);
};

Misc.dropItems = function (fromLoc) {
	try {
		if (!fromLoc) throw new Error("No location given");
		if (fromLoc === sdk.storage.Stash && !Town.openStash()) throw new Error("Failed to open stash");

		let items = me.findItems(-1, 0, fromLoc);

		if (items) {
			while (items.length > 0) {
				let item = items.shift();

				if (item.classid === sdk.items.quest.Cube
					|| (item.isInInventory && [sdk.itemtype.SmallCharm, sdk.itemtype.MediumCharm, sdk.itemtype.LargeCharm].includes(item.itemType) && Storage.Inventory.IsLocked(item, Config.Inventory))) {
					continue;
				} else {
					item.drop();
				}
			}
		} else {
			throw new Error("Couldn't find any items");
		}
	} catch (e) {
		print(e);
	} finally {
		me.cancel();
	}
};
