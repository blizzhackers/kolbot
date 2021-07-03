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

function main() {
	include("json2.js");

	var obj, action,
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
					switch (obj.type) {
					case "area":
						if (obj.dest === 120) {
							Pather.moveToExit(obj.dest, false);	
						} else {
							Pather.moveToExit(obj.dest, true);
						}

						break;
					case "unit":
						if (me.area === 39) { break; }
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
						case getRoom().correcttomb:
							for (let i = 0; i < 3; i++) {
								if (Pather.useUnit(2, 100, 73)) {
									break;
								}
							}
							
							break;
						case 80: 	// Kurast Bazaar -> A3 Sewers Level 1
							Pather.useUnit(5, 57, 92);

							break;
						}

						let chest;

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

						if ([4, 54, 109, 111, 112, 117, 133, 134, 135, 136].indexOf(me.area) > -1) {
							Pather.usePortal();
						}

						break;
					case "wp":
						Pather.getWP(me.area);

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

						let redPortal, chestLoc;

						switch (obj.dest) {
						case 1:
							let king = getPresetUnit(me.area, 1, 773);

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
						case 133:
							redPortal = Pather.getPortal(133);

							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}

							break;
						case 134:
							redPortal = Pather.getPortal(134);
							
							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}
							
							break;
						case 135:
							redPortal = Pather.getPortal(135);
							
							if (redPortal) {
								Pather.moveToUnit(redPortal);
								Pather.usePortal(null, null, redPortal);
							}
							
							break;
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
						}

						break;
					}
				}
			} catch (e) {

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

	var i, path, adjustedNode, cleared, useTeleport,
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
}
