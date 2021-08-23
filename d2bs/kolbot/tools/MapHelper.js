/*
*	@filename	MapHelper.js
*	@author		theBGuy
*	@desc		MapHelper used in conjuction with MapThread.js
*	@credits 	kolton for orginal MapHelper
*/

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("TorchSystem.js");
include("MuleLogger.js");
include("common/Attack.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/Loader.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");

function sortPickList(a, b) {
	// Same size - sort by distance
	if (b.sizex === a.sizex && b.sizey === a.sizey) {
		return getDistance(me, a) - getDistance(me, b);

	}
	
	return b.sizex * b.sizey - a.sizex * a.sizey;
}

function openCowPortal (portalID) {
	this.getTome = function () {
		let tome,
			myTome = me.findItem("tbk", 0, 3),
			akara = Town.initNPC("Shop", "buyTome");

		tome = me.getItem("tbk");

		if (tome) {
			do {
				if (!myTome || tome.gid !== myTome.gid) {
					return copyUnit(tome);
				}
			} while (tome.getNext());
		}

		if (!akara) {
			print("Failed to buy tome");
		}

		tome = akara.getItem("tbk");

		if (tome.buy()) {
			tome = me.getItem("tbk");

			if (tome) {
				do {
					if (!myTome || tome.gid !== myTome.gid) {
						return copyUnit(tome);
					}
				} while (tome.getNext());
			}
		}

		print("Failed to buy tome");

		return false;
	};

	if (me.area !== 1) {
		Town.goToTown(1);
	}

	if (Pather.getPortal(39)) {
		me.overhead("Portal already opened");

		return false;
	}

	let leg = me.getItem(88);

	if (!leg) {
		me.overhead("Missing leg");

		return false;
	}

	let tome = this.getTome();

	if (!tome) {
		me.overhead("Missing tome");

		return false;
	}

	if (!Town.openStash()) {
		print("Failed to open stash. (openCowPortal)");

		return false;
	}

	if (!Cubing.emptyCube()) {
		print("Failed to empty cube. (openCowPortal)");

		return false;
	}

	let cubingItem, classIDS = [88, 518];

	for (let classID of classIDS) {
		cubingItem = me.getItem(classID);

		if (!cubingItem || !Storage.Cube.MoveTo(cubingItem)) {
			return false;
		}
	}

	while (!Cubing.openCube()) {
		delay(1 + me.ping * 2);
		Packet.flash(me.gid);
	}

	let cowPortal;
	let tick = getTickCount();

	while (getTickCount() - tick < 5000) {
		if (Cubing.openCube()) {
			transmute();
			delay(750 + me.ping);
			cowPortal = Pather.getPortal(portalID);

			if (cowPortal) {
				break;
			}
		}
	}

	me.cancel();

	return true;
}

function uberPortals () {
	let tkeys = me.findItems("pk1", 0).length || 0;
	let hkeys = me.findItems("pk2", 0).length || 0;
	let dkeys = me.findItems("pk3", 0).length || 0;
	let brains = me.findItems("mbr", 0).length || 0;
	let eyes = me.findItems("bey", 0).length || 0;
	let horns = me.findItems("dhn", 0).length || 0;

	// End the script if we don't have enough keys nor organs
	if ((tkeys < 3 || hkeys < 3 || dkeys < 3) && (brains < 1 || eyes < 1 || horns < 1)) {
		me.overhead("Not enough keys or organs.");

		return false;
	}

	if (!Pather.accessToAct(5)) {
		me.overhead("No access to act 5");

		return false;
	}

	if (me.area !== 109) {
		Town.goToTown(5);
	}

	let key1 = me.findItem("pk1", 0);
	let key2 = me.findItem("pk2", 0);
	let key3 = me.findItem("pk3", 0);
	let org1 = me.findItem("mbr", 0);
	let org2 = me.findItem("mbr", 0);
	let org3 = me.findItem("mbr", 0);

	if (!!org1 && !!org2 && !!org3) {
		Town.move("stash");

		if (Pather.getPortal(136)) {
			me.overhead("Uber tristram already made");
			return false;
		}

		if (Town.openStash() && Cubing.emptyCube()) {
			if (!Storage.Cube.MoveTo(org1) || !Storage.Cube.MoveTo(org2) || !Storage.Cube.MoveTo(org3)) {
				return false;
			}

			if (!Cubing.openCube()) {
				return false;
			}

			transmute();
			delay(1000);
		}
		
		return true;
	}

	if (!!key1 && !!key2 && !!key3) {
		Town.move("stash");

		if (Pather.getPortal(133) && Pather.getPortal(134) && Pather.getPortal(135)) {
			me.overhead("All portals already made");
			return false;
		}

		if (Town.openStash() && Cubing.emptyCube()) {
			if (!Storage.Cube.MoveTo(key1) || !Storage.Cube.MoveTo(key2) || !Storage.Cube.MoveTo(key3)) {
				return false;
			}

			if (!Cubing.openCube()) {
				return false;
			}

			transmute();
			delay(1000);
		}

		return true;
	}

	return true;
}

function main() {
	include("json2.js");

	let obj, action,
		mapThread = getScript("tools/mapthread.js");

	Config.init();
	Pickit.init();
	Storage.Init();
	addEventListener("scriptmsg", function (msg) {
		action = msg;
	});

	while (true) {
		if (getUIFlag(0x09)) {
			delay(100);

			if (mapThread.running) {
				print("pause mapthread");
				mapThread.pause();
			}
		} else {
			if (!mapThread.running) {
				print("resume mapthread");
				mapThread.resume();
			}
		}

		if (action) {
			try {
				obj = JSON.parse(action);

				if (obj) {
					let chest, redPortal, chestLoc, king, unit;

					switch (obj.type) {
					case "area":
						if (obj.dest === 120) {
							Pather.moveToExit(obj.dest, false);
						} else if (obj.dest === 46) {
							Pather.journeyTo(46);
						} else if (obj.dest === 73) {
							Pather.moveToPreset(me.area, 2, 152, -11, 3);

							for (let i = 0; i < 3; i++) {
								if (Pather.useUnit(2, 100, 73)) {
									break;
								}
							}
						} else if (obj.dest === 103) {
							Pather.moveTo(17581, 8070);

							for (let i = 0; i < 3; i++) {
								if (Pather.useUnit(2, 342, 103)) {
									break;
								}
							}
						} else {
							Pather.moveToExit(obj.dest, true);
						}

						break;
					case "unit":
						if (me.area === 39) {
							break;
						}

						if (me.area === 73) {
							let teleport = Pather.teleport;
							Pather.teleport = false;
							Pather.moveTo(22629, 15714);
							Pather.moveTo(22609, 15707);
							Pather.moveTo(22579, 15704);
							Pather.moveTo(22577, 15649, 10);
							Pather.moveTo(22577, 15609, 10);

							let tyrael = getUnit(1, NPC.Tyrael);

							if (!tyrael) {
								return false;
							}

							for (let talk = 0; talk < 3; talk += 1) {
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

							Pather.teleport = teleport;

							break;
						}

						Pather.moveToUnit(obj.dest, true);

						if (me.area === 74) {
							let journal = getUnit(2, 357);

							if (journal) {
								while (!Pather.getPortal(46)) {
									Misc.openChest(journal);
									delay(1000 + me.ping);
									me.cancel();
								}
							}

							let prevPortal = getUnit(2, 298);

							if (prevPortal) {
								Pather.useUnit(2, 298, 54);
								break;
							}
						}

						switch (me.area) {
						case 3: 	// Cold Plains -> Cave Level 1
							Pather.moveToExit(9, true);

							break;
						case 6: 	// Black Marsh -> Hole Level 1
							Pather.moveToExit(11, true);

							break;
						case 40: 	// Lut Gholein -> Sewers Level  1
							Pather.useUnit(5, 20, 47);

							break;
						case 80: 	// Kurast Bazaar -> A3 Sewers Level 1
							Pather.useUnit(5, 57, 92);

							break;
						}

						switch (me.area) {
						case 13: // Cave Level 2
						case 15: // Hole Level 2
						case 16: // Pit Level 2
						case 18: // Crypt
						case 19: // Mausoleum
						case 59: // Stony Tomb Level 2
						case 65: // Ancient Tunnels
						case 84: // Spider Cave
						case 90: // Swampy Pit Level 3
						case 95: // Disused Fane
						case 96: // Forgotten Reliquary
						case 97: // Forgotten Temple
						case 99: // Disused Reliquary
						case 116: // Drifter Cavern
						case 119: // Icy Cellar
						case 125: // Abadon
						case 126: // Pit of Acheron
						case 127: // Infernal Pit
							chest = getUnit(2, 397);

							break;
						case 115: // Glacial Trail
						case 122: // Halls of Anguish
						case 123: // Halls of Pain
							chest = getUnit(2, 455);

							break;
						case 38:
							chest = getUnit(2, 268);

							break;
						case 60: // Halls of the Dead 3
							chest = getUnit(2, 354);

							break;
						case 61: // Claw Viper Temple 2
							chest = getUnit(2, 149);

							break;
						case 64: // Maggot Lair 3
							chest = getUnit(2, 356);

							break;
						case 85: // Spider Cavern
							chest = getUnit(2, 407);

							break;
						case 91: // Flayer Dungeon Level 3
							chest = getUnit(2, 406);

							break;
						case 93: // A3 Sewer's Level 2
							chest = getUnit(2, 405);

							break;
						case 94: // Ruined Temple
							chest = getUnit(2, 193);

							break;
						}

						if (chest) {
							Misc.openChest(chest);
						}

						if ([4, 54, 109, 111, 112, 117, 121, 133, 135, 136].indexOf(me.area) > -1) {
							Pather.usePortal();
						}

						break;
					case "wp":
						Pather.getWP(me.area);

						break;
					case "npc":
						print("Going to act: " + obj.dest);
						Pather.changeAct(obj.dest);

						break;
					case "portal":
						if (obj.dest === 132 && getUnit(1, 543)) {
							me.overhead("Can't enter Worldstone Chamber yet. Baal still in area");
							break;
						} else if (obj.dest === 132 && !getUnit(1, 543)) {
							let portal = getUnit(2, 563);

							if (portal) {
								Pather.usePortal(null, null, portal);
							}

							break;
						}

						switch (obj.dest) {
						case 1:
							king = getPresetUnit(me.area, 1, 773);

							switch (king.x) {
							case 1:
								Pather.moveTo(25183, 5923);

								break;
							}

							redPortal = Pather.getPortal(1);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						case 4:
							Pather.moveTo(25173, 5086);
							redPortal = Pather.getPortal(4);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						case 39:
							redPortal = Pather.getPortal(39);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						case 74:
							Pather.moveTo(12692, 5195);
							redPortal = Pather.getPortal(74);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						case 109:
							Pather.moveTo(20193, 8693);

							redPortal = Pather.getPortal(109);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						case 111:
							chestLoc = getPresetUnit(me.area, 2, 397);

							switch (chestLoc.x) {
							case 14:
								Pather.moveTo(12638, 6373);

								break;
							case 15:
								Pather.moveTo(12638, 6063);

								break;
							case 20:
								Pather.moveTo(12708, 6063);

								break;
							case 25:
								Pather.moveTo(12948, 6128);

								break;
							}

							Pather.usePortal();

							break;
						case 112:
							chestLoc = getPresetUnit(me.area, 2, 397);

							switch (chestLoc.x) {
							case 14:
								Pather.moveTo(12638, 7873);

								break;
							case 15:
								Pather.moveTo(12638, 7563);

								break;
							case 20:
								Pather.moveTo(12708, 7563);

								break;
							case 25:
								Pather.moveTo(12948, 7628);

								break;
							}

							Pather.usePortal();

							break;
						case 117:
							chestLoc = getPresetUnit(me.area, 2, 397);

							switch (chestLoc.x) {
							case 14:
								Pather.moveTo(12638, 9373);

								break;
							case 20:
								Pather.moveTo(12708, 9063);

								break;
							case 25:
								Pather.moveTo(12948, 9128);

								break;
							}

							Pather.usePortal();

							break;
						// Matron's
						case 133:
							redPortal = Pather.getPortal(133);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						// Forgotten Sands
						case 134:
							redPortal = Pather.getPortal(134);
							
							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}
							
							break;
						// Furnace
						case 135:
							redPortal = Pather.getPortal(135);
							
							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}
							
							break;
						// Tristram
						case 136:
							redPortal = Pather.getPortal(136);
							
							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}
							
							break;
						default:
							Pather.usePortal(obj.dest);
							break;
						}

						break;
					case "qol":

						switch (obj.action) {
						case "heal":
							Town.initNPC("Heal", "heal");

							break;
						case "openStash":
							Town.openStash();

							break;
						case "stashItems":
							Town.stash(true, true);

							break;
						case "cowportal":
							openCowPortal(39);

							break;
						case "uberportal":
							uberPortals();

							break;
						case "filltps":
							Town.fillTome(518);
							me.cancel();

							break;
						case "moveItemFromInvoToStash":
						case "moveItemFromStashToInvo":
							unit = getUnit(101);

							switch (unit.location) {
							case 3:
								if (Storage.Stash.CanFit(unit)) {
									Storage.Stash.MoveTo(unit);
								}

								break;
							case 7:
								if (Storage.Inventory.CanFit(unit)) {
									Storage.Inventory.MoveTo(unit);
								}

								break;
							}

							break;
						case "moveItemFromInvoToCube":
						case "moveItemFromCubeToInvo":
							unit = getUnit(101);

							switch (unit.location) {
							case 3:
								if (Storage.Cube.CanFit(unit)) {
									Storage.Cube.MoveTo(unit);
								}

								break;
							case 6:
								if (Storage.Inventory.CanFit(unit)) {
									Storage.Inventory.MoveTo(unit);
								}

								break;
							}

							break;
						case "moveItemFromInvoToTrade":
						case "moveItemFromTradeToInvo":
							unit = getUnit(101);

							switch (unit.location) {
							case 3:
								if (Storage.TradeScreen.CanFit(unit)) {
									Storage.TradeScreen.MoveTo(unit);
								}

								break;
							case 5:
								if (Storage.Inventory.CanFit(unit)) {
									Packet.itemToCursor(unit);
									Storage.Inventory.MoveTo(unit);
								}

								break;
							}

							break;
						case "pickItems":
							let item = getUnit(4, -1, 3), items = [],
								cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];

							for (let i = 0; i < cancelFlags.length; i++) {
								if (getUIFlag(cancelFlags[i])) {
									me.cancel();
								}
							}

							if (item) {
								do {
									items.push(copyUnit(item));
								} while (item.getNext());
							}

							while (items.length > 0) {
								items.sort(sortPickList);

								item = items.shift();

								if (Town.ignoredItemTypes.indexOf(item.itemType) === -1 && Storage.Inventory.CanFit(item)) {
									Pickit.pickItem(item);
								}
							}

							break;
						case "sellItem":
							unit = getUnit(101);

							if (unit.location === 3 && Town.questItemClassids.indexOf(unit.classid) === -1 && Town.unsellablesClassids.indexOf(unit.classid) === -1) {
								try {
									unit.sell();
								} catch (e) {
									print(e);
								}
							}

							break;
						}

						break;
					case "drop":
						let item;

						switch (obj.action) {
						case "invo":
							let invo = me.findItems(-1, 0, 3);

							if (invo) {
								while (invo.length > 0) {
									item = invo.shift();
									item.drop();
								}
							}

							me.cancel();

							break;
						case "stash":
							if (!me.inTown || !Town.openStash()) {
								me.overhead("Failed to open stash");

								break;
							}

							let stash = me.findItems(-1, 0, 7);

							if (stash) {
								while (stash.length > 0) {
									item = stash.shift();

									if (item.classid !== 549) { // Don't drop the cube
										item.drop();
									}
								}
							}

							me.cancel();

							break;
						}

						break;
					}
				}
			} catch (e) {
				print(e);
			}

			action = false;
		}

		delay(20);
	}
}

Pather.stop = false;

Pather.stopEvent = function (key) {
	switch (key) {
	case 105: // Numpad 9
		if (!me.idle) {
			Pather.stop = true;
		}
		
		break;
	}
};

Pather.moveTo = function (x, y, retry, clearPath, pop) {
	if (me.dead) { // Abort if dead
		return false;
	}

	addEventListener("keyup", Pather.stopEvent);

	let i, path, adjustedNode, cleared, useTeleport,
		node = {x: x, y: y},
		fail = 0;

	for (i = 0; i < this.cancelFlags.length; i += 1) {
		if (getUIFlag(this.cancelFlags[i])) {
			me.cancel();
		}
	}

	if (getDistance(me, x, y) < 2) {
		return true;
	}

	if (x === undefined || y === undefined) {
		throw new Error("moveTo: Function must be called with at least 2 arguments.");
	}

	if (typeof x !== "number" || typeof y !== "number") {
		throw new Error("moveTo: Coords must be numbers");
	}

	if (retry === undefined) {
		retry = 3;
	}

	if (clearPath === undefined) {
		clearPath = false;
	}

	if (pop === undefined) {
		pop = false;
	}

	useTeleport = this.useTeleport();

	let preSkill = me.getSkill(2);

	path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? ([62, 63, 64].indexOf(me.area) > -1 ? 30 : this.teleDistance) : this.walkDistance);

	if (!path) {
		throw new Error("moveTo: Failed to generate path.");
	}

	path.reverse();

	if (pop) {
		path.pop();
	}

	PathDebug.drawPath(path);

	if (useTeleport && Config.TeleSwitch && path.length > 5) {
		Attack.weaponSwitch(Attack.getPrimarySlot() ^ 1);
	}

	while (path.length > 0) {
		if (me.dead || Pather.stop) { // Abort if dead
			Pather.stop = false;	// Reset value
			return false;
		}

		for (i = 0; i < this.cancelFlags.length; i += 1) {
			if (getUIFlag(this.cancelFlags[i])) {
				me.cancel();
			}
		}

		node = path.shift();

		/* Right now getPath's first node is our own position so it's not necessary to take it into account
			This will be removed if getPath changes
		*/
		if (getDistance(me, node) > 2) {
			// Make life in Maggot Lair easier
			if ([62, 63, 64].indexOf(me.area) > -1) {
				adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

				if (adjustedNode) {
					node.x = adjustedNode[0];
					node.y = adjustedNode[1];
				}
			}

			if (useTeleport ? this.teleportTo(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
				if (!me.inTown) {
					if (this.recursion) {
						this.recursion = false;

						NodeAction.go({clearPath: clearPath});

						if (getDistance(me, node.x, node.y) > 5) {
							this.moveTo(node.x, node.y);
						}

						this.recursion = true;
					}

					Misc.townCheck();
				}
			} else {
				if (fail > 0 && !useTeleport && !me.inTown) {
					// Don't go berserk on longer paths
					if (!cleared) {
						Attack.clear(5);

						cleared = true;
					}

					if (fail > 1 && me.getSkill(143, 1)) {
						Skill.cast(143, 0, node.x, node.y);
					}
				}

				// Reduce node distance in new path
				path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? rand(25, 35) : rand(10, 15));
				fail += 1;

				if (!path) {
					throw new Error("moveTo: Failed to generate path.");
				}

				path.reverse();
				PathDebug.drawPath(path);

				if (pop) {
					path.pop();
				}

				print("move retry " + fail);

				if (fail > 0) {
					Packet.flash(me.gid);

					if (fail >= retry) {
						break;
					}
				}
			}
		}

		delay(5);
	}

	if (useTeleport && Config.TeleSwitch) {
		Attack.weaponSwitch(Attack.getPrimarySlot());
	}

	if (me.getSkill(2) !== preSkill) {
		Skill.setSkill(preSkill, 0);
	}

	PathDebug.removeHooks();

	removeEventListener("keyup", Pather.stopEvent);

	return getDistance(me, node.x, node.y) < 5;
};

Pather.getWP = function (area, clearPath) {
	let i, j, wp, preset,
		wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

	if (area !== me.area) {
		this.journeyTo(area);
	}

	for (i = 0; i < wpIDs.length; i += 1) {
		preset = getPresetUnit(area, 2, wpIDs[i]);

		if (preset) {
			this.moveToUnit(preset, 0, 0, clearPath);

			wp = getUnit(2, "waypoint");

			if (wp) {
				for (j = 0; j < 10; j += 1) {
					Misc.click(0, 0, wp);

					if (getUIFlag(0x14)) {
						delay(500);

						if (me.inTown) {
							return true;	// Keep wp menu open in town
						}

						me.cancel();

						return true;
					}

					delay(500);
				}
			}
		}
	}

	return false;
};

Pather.changeAct = function (act) {
	let npc;
	let loc;

	switch (act) {
	case 1:
		npc = "warriv";
		loc = 1;

		Town.move(NPC.Warriv);

		break;
	case 2:
		switch (me.act) {
		case 1:
			npc = "warriv";
			loc = 40;

			if (!Misc.checkQuest(6, 0)) {
				me.overhead("Incomplete Quest");
				return false;
			}

			Town.move(NPC.Warriv);
			
			break;
		case 3:
			npc = "meshif";
			loc = 40;

			Town.move(NPC.Meshif);
			
			break;
		}

		break;
	case 3:
		npc = "meshif";
		loc = 75;

		if (!Misc.checkQuest(22, 0)) {
			me.overhead("Incomplete Quest");
			return false;
		}

		Town.move(NPC.Meshif);

		break;
	case 5:
		npc = "tyrael";
		loc = 109;

		if (!Misc.checkQuest(26, 0)) {
			me.overhead("Incomplete Quest");
			return false;
		}

		Town.move(NPC.Tyrael);

		break;
	}

	let npcUnit = getUnit(1, npc);
	let timeout = getTickCount() + 3000;

	while (!npcUnit && timeout < getTickCount()) {
		Town.move(npc);
		Packet.flash(me.gid);
		delay(me.ping * 2 + 100);
		npcUnit = getUnit(1, npc);
	}

	if (npcUnit) {
		for (let i = 0; i < 5; i += 1) {
			sendPacket(1, 56, 4, 0, 4, npcUnit.gid, 4, loc);
			delay(500 + me.ping);

			if (me.act === act) {
				break;
			}
		}
	} else {
		print("Failed to move to " + npc);
		me.overhead("Failed to move to " + npc);
	}

	return me.act === act;
};

Misc.checkQuest = function (id, state) {
	sendPacket(1, 0x40);
	delay(500 + me.ping);

	return me.getQuest(id, state);
};

Town.questItemClassids = [87, 88, 89, 90, 91, 92, 173, 174, 521, 524, 525, 545, 546, 547, 548, 549, 552, 553, 554, 555, 644];
Town.unsellablesClassids = [647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658];

Town.stash = function (stashGold, force) {
	if (stashGold === undefined) {
		stashGold = true;
	}

	if (force === undefined) {
		force = false;
	}

	if (!this.needStash() && !force) {
		return true;
	}

	me.cancel();

	let i, result, tier, bodyLoc,
		items = Storage.Inventory.Compare(Config.Inventory);

	if (items) {
		for (i = 0; i < items.length; i += 1) {
			if (this.canStash(items[i])) {
				result = (Pickit.checkItem(items[i]).result > 0 && Pickit.checkItem(items[i]).result < 4) || Cubing.keepItem(items[i]) || Runewords.keepItem(items[i]) || CraftingSystem.keepItem(items[i]);

				// Don't stash low tier autoequip items.
				if (Config.AutoEquip && Pickit.checkItem(items[i]).result === 1) {
					tier = NTIP.GetTier(items[i]);
					bodyLoc = Item.getBodyLoc(items[i]);

					if (tier > 0 && tier <= Item.getEquippedItem(bodyLoc).tier) {
						result = false;
					}
				}

				if (result) {
					Misc.itemLogger("Stashed", items[i]);
					Storage.Stash.MoveTo(items[i]);
				}
			}
		}
	}

	// Stash gold
	if (stashGold) {
		if (me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5 && this.openStash()) {
			gold(me.getStat(14), 3);
			delay(1000); // allow UI to initialize
			me.cancel();
		}
	}

	return true;
};
