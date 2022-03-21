/**
*	@filename	Cows.js
*	@author		kolton
*	@desc		clear the Moo Moo Farm without killing the Cow King
*/

function Cows() {
	this.buildCowRooms = function () {
		let finalRooms = [],
			indexes = [];

		let kingPreset = getPresetUnit(me.area, 1, 773);
		let badRooms = getRoom(kingPreset.roomx * 5 + kingPreset.x, kingPreset.roomy * 5 + kingPreset.y).getNearby();

		for (let i = 0; i < badRooms.length; i += 1) {
			let badRooms2 = badRooms[i].getNearby();

			for (let j = 0; j < badRooms2.length; j += 1) {
				if (indexes.indexOf(badRooms2[j].x + "" + badRooms2[j].y) === -1) {
					indexes.push(badRooms2[j].x + "" + badRooms2[j].y);
				}
			}
		}

		let room = getRoom();

		do {
			if (indexes.indexOf(room.x + "" + room.y) === -1) {
				finalRooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
			}
		} while (room.getNext());

		return finalRooms;
	};

	this.clearCowLevel = function () {
		if (Config.MFLeader) {
			Pather.makePortal();
			say("cows");
		}

		let room, result, myRoom,
			rooms = this.buildCowRooms();

		function RoomSort(a, b) {
			return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
		}

		while (rooms.length > 0) {
			// get the first room + initialize myRoom var
			!myRoom && (room = getRoom(me.x, me.y));

			if (room) {
				if (room instanceof Array) { // use previous room to calculate distance
					myRoom = [room[0], room[1]];
				} else { // create a new room to calculate distance (first room, done only once)
					myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
				}
			}

			rooms.sort(RoomSort);
			room = rooms.shift();
			result = Pather.getNearestWalkable(room[0], room[1], 10, 2);

			if (result) {
				Pather.moveTo(result[0], result[1], 3);

				if (!Attack.clear(30)) {
					return false;
				}
			}
		}

		return true;
	};

	this.getLeg = function () {
		let portal, wirt, leg, gid;

		if (me.getItem(sdk.items.quest.WirtsLeg)) {
			return me.getItem(sdk.items.quest.WirtsLeg);
		}

		Pather.useWaypoint(sdk.areas.StonyField);
		Precast.doPrecast(true);
		Pather.moveToPreset(me.area, 1, 737, 8, 8);

		for (let i = 0; i < 6; i += 1) {
			portal = Pather.getPortal(sdk.areas.Tristram);

			if (portal) {
				Pather.usePortal(null, null, portal);

				break;
			}

			delay(500);
		}

		if (!portal) {
			throw new Error("Tristram portal not found");
		}

		Pather.moveTo(25048, 5177);

		wirt = getUnit(2, 268);

		for (let i = 0; i < 8; i += 1) {
			wirt.interact();
			delay(500);

			leg = getUnit(4, sdk.items.quest.WirtsLeg);

			if (leg) {
				gid = leg.gid;

				Pickit.pickItem(leg);
				Town.goToTown();

				return me.getItem(-1, -1, gid);
			}
		}

		throw new Error("Failed to get the leg");
	};

	this.getTome = function () {
		let npc, scroll;
		let tpTome = me.findItems(sdk.items.TomeofTownPortal, 0, 3);

		if (tpTome.length < 2) {
			npc = Town.initNPC("Shop", "buyTpTome");

			if (!getInteractedNPC()) {
				throw new Error("Failed to find npc");
			}

			let tome = npc.getItem(sdk.items.TomeofTownPortal);

			if (!!tome && tome.getItemCost(0) < me.gold && tome.buy()) {
				delay(500);
				tpTome = me.findItems(sdk.items.TomeofTownPortal, 0, 3);
				tpTome.forEach(function (book) {
					if (book.isInInventory) {
						while (book.getStat(sdk.stats.Quantity) < 20) {
							scroll = npc.getItem(sdk.items.ScrollofTownPortal);
							
							if (!!scroll && scroll.getItemCost(0) < me.gold) {
								scroll.buy();
							} else {
								break;
							}

							delay(20);
						}
					}
				});
			} else {
				throw new Error("Failed to buy tome");
			}
		}

		return tpTome.first();
	};

	this.openPortal = function (leg, tome) {
		if (!Town.openStash()) {
			throw new Error("Failed to open stash");
		}

		if (!Cubing.emptyCube()) {
			throw new Error("Failed to empty cube");
		}

		if (!Storage.Cube.MoveTo(leg) || !Storage.Cube.MoveTo(tome) || !Cubing.openCube()) {
			throw new Error("Failed to cube leg and tome");
		}

		transmute();
		delay(500);

		for (let i = 0; i < 10; i += 1) {
			if (Pather.getPortal(sdk.areas.MooMooFarm)) {
				return true;
			}

			delay(200);
		}

		throw new Error("Portal not found");
	};


	// we can begin now
	try {
		if (!me.diffCompleted) {
			throw new Error("Final quest incomplete.");
		}

		Town.goToTown(1);
		Town.doChores();
		Town.move("stash");

		// Check to see if portal is already open, if not get the ingredients
		if (!Pather.getPortal(sdk.areas.MooMooFarm)) {
			if (!me.tristram) { throw new Error("Cain quest incomplete"); }
			if (me.cows) { throw new Error("Already killed the Cow King."); }
			
			let leg = this.getLeg();
			let tome = this.getTome();
			this.openPortal(leg, tome);
		}
	} catch (e) {
		print("ÿc1" + e);

		if (Misc.getPlayerCount() > 1) {
			!me.inTown && Town.goToTown(1);
			Town.move("stash");
			print("ÿc9(Cows) :: ÿc0Waiting 1 minute to see if anyone else opens the cow portal");

			let tick = getTickCount();
			let found = false;
			while (getTickCount() - tick > 60e3) {
				found = Pather.getPortal(sdk.areas.MooMooFarm);

				if (found) {
					break;
				}
				delay(250);
			}

			if (!found) {
				throw new Error("No cow portal");
			}
		} else {
			return false;
		}
	}

	if (Config.Cows.MakeCows) {
		if (Pather.getPortal(sdk.areas.MooMooFarm)) {
			return true;
		} else {
			throw new Error("I failed to make cow portal");
		}
	}

	Pather.usePortal(sdk.areas.MooMooFarm);
	Precast.doPrecast(false);
	Config.Cows.KillKing ? Attack.clearLevel() : this.clearCowLevel();

	return true;
}
