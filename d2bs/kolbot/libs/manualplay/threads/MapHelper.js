/*
*	@filename	MapHelper.js
*	@author		theBGuy
*	@desc		MapHelper used in conjuction with MapThread.js
*	@credits 	kolton for orginal MapHelper
*/

// Basic
include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("TorchSystem.js");
include("CraftingSystem.js");
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

// MapMode
include("manualplay/MapMode.js");
MapMode.include();

function main() {
	let obj = {type: false, dest: false, action: false};
	let action, fail = 0, x, y,
		mapThread = getScript("libs/manualplay/threads/mapthread.js");

	const portalMap = {
		125: {
			14: [12638, 6373],
			15: [12638, 6063],
			20: [12708, 6063],
			25: [12948, 6128],
		},
		126: {
			14: [12638, 7873],
			15: [12638, 7563],
			20: [12708, 7563],
			25: [12948, 7628],
		},
		127: {
			14: [12638, 9373],
			20: [12708, 9063],
			25: [12948, 9128],
		},
	};

	print("ÿc9MapHelper loaded");
	Config.init();
	Attack.init(true);
	Pickit.init();
	Storage.Init();
	addEventListener("scriptmsg", function (msg) {
		action = msg;
	});

	this.togglePickThread = function () {
		if (!Config.ManualPlayPick) return;

		let pickThread = getScript("tools/pickthread.js");

		if (pickThread) {
			if (pickThread.running) {
				pickThread.pause();
			} else if (!pickThread.running) {
				pickThread.resume();
			}
		}
	};

	this.togglePause = function () {
		if (mapThread) {
			if (mapThread.running) {
				print("pause mapthread");
				mapThread.pause();
			} else if (!mapThread.running) {
				print("resume mapthread");
				mapThread.resume();

				if (!mapThread.running) {
					fail++;

					if (fail % 5 === 0 && !getScript("libs/manualplay/threads/mapthread.js")) {
						print("MapThread shut down, exiting MapHelper");
						
						return false;
					}
				}
			}
		} else if (!getScript("libs/manualplay/threads/mapthread.js")) {
			print("MapThread shut down, exiting MapHelper");

			return false;
		}

		return true;
	};

	while (true) {
		if (getUIFlag(sdk.uiflags.EscMenu)) {
			delay(100);
			mapThread.running && this.togglePause();

		} else {
			if (!mapThread.running) {
				if (!this.togglePause()) {
					return;
				}
			}
		}

		if (action) {
			try {
				let temp = JSON.parse(action);
				temp && Object.assign(obj, temp);
				
				addEventListener("keyup", Pather.stopEvent);
				this.togglePickThread();

				if (obj) {
					let redPortal, chestLoc, king, unit;

					switch (obj.type) {
					case "area":
						if (obj.dest === 120) {
							Pather.moveToExit(obj.dest, false);
						} else if ([46, 47, 54, 103, 110].includes(obj.dest)) {
							Pather.journeyTo(obj.dest);
						} else if (obj.dest === 73) {
							Pather.moveToPreset(me.area, 2, 152, -11, 3);

							for (let i = 0; i < 3; i++) {
								if (Pather.useUnit(2, 100, 73)) {
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

						if (me.area === 73 && Misc.talkToTyrael()) {
							break;
						}

						Pather.moveToUnit(obj.dest, true);

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

						if (obj.action && typeof obj.action === "object") {
							if (obj.action.do === "openChest") {
								!!obj.action.id && Misc.openChest(obj.action.id);
							} else if (obj.action.do === "usePortal") {
								!!obj.action.id ? Pather.usePortal(obj.action.id) : Pather.usePortal();
							}
						}

						break;
					case "wp":
						Pather.getWP(me.area);

						break;
					case "actChange":
						print("Going to act: " + obj.dest);
						Pather.changeAct(obj.dest);

						break;
					case "portal":
						if (obj.dest === 132 && getUnit(1, 543)) {
							me.overhead("Can't enter Worldstone Chamber yet. Baal still in area");
							
							break;
						} else if (obj.dest === 132 && !getUnit(1, 543)) {
							redPortal = getUnit(2, 563);
							redPortal && Pather.usePortal(null, null, redPortal);

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

							break;
						case 4:
							Pather.moveTo(25173, 5086);
							redPortal = Pather.getPortal(4);

							break;
						case 39:
							redPortal = Pather.getPortal(39);

							break;
						case 74:
							Pather.moveTo(12692, 5195);
							redPortal = Pather.getPortal(74);
							!redPortal && Pather.useWaypoint(74);

							break;
						case 109:
							Pather.moveTo(20193, 8693);

							break;
						case 111:
						case 112:
						case 117:
							chestLoc = getPresetUnit(me.area, 2, 397);

							if (!chestLoc) {
								break;
							}

							[x, y] = portalMap[me.area][chestLoc.x];

							Pather.moveTo(x, y);
							Pather.usePortal();

							break;
						// Matron's
						case 133:
						// Forgotten Sands
						case 134:
						// Furnace
						case 135:
						// Uber Tristram
						case 136:
							redPortal = Pather.getPortal(obj.dest);

							break;
						default:
							Pather.usePortal(obj.dest);
							
							break;
						}

						if (redPortal) {
							Pather.moveToUnit(redPortal);
							Pather.usePortal(null, null, redPortal);
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
						case "makePortal":
							Pather.makePortal();

							break;
						case "takePortal":
							Town.goToTown();

							break;
						case "cowportal":
							Misc.openRedPortal(sdk.areas.MooMooFarm);

							break;
						case "ubertrist":
							Misc.openRedPortal(sdk.areas.UberTristram);

							break;
						case "uberportal":
							Misc.openRedPortal();

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
								Storage.Stash.CanFit(unit) && Storage.Stash.MoveTo(unit);

								break;
							case 7:
								Storage.Inventory.CanFit(unit) && Storage.Inventory.MoveTo(unit);

								break;
							}

							break;
						case "moveItemFromInvoToCube":
						case "moveItemFromCubeToInvo":
							unit = getUnit(101);

							switch (unit.location) {
							case 3:
								Storage.Cube.CanFit(unit) && Storage.Cube.MoveTo(unit);

								break;
							case 6:
								Storage.Inventory.CanFit(unit) && Storage.Inventory.MoveTo(unit);

								break;
							}

							break;
						case "moveItemFromInvoToTrade":
						case "moveItemFromTradeToInvo":
							unit = getUnit(101);

							switch (unit.location) {
							case 3:
								Storage.TradeScreen.CanFit(unit) && Storage.TradeScreen.MoveTo(unit);

								break;
							case 5:
								if (Storage.Inventory.CanFit(unit)) {
									Packet.itemToCursor(unit);
									Storage.Inventory.MoveTo(unit);
								}

								break;
							}

							break;
						case "pick":
							Config.ManualPlayPick ? Pickit.pickItems() : Pickit.basicPickItems();

							break;
						case "sellItem":
							unit = getUnit(101);

							if (unit.location === 3 && unit.sellable) {
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
						switch (obj.action) {
						case "invo":
							Misc.dropItems(sdk.storage.Inventory);
							
							break;
						case "stash":
							Misc.dropItems(sdk.storage.Stash);

							break;
						}

						break;
					case "stack":
						switch (obj.action) {
						case "thawing":
							Town.buyPots(10, "Thawing", true, true);
							
							break;
						case "antidote":
							Town.buyPots(10, "Antidote", true, true);

							break;
						case "stamina":
							Town.buyPots(10, "Stamina", true, true);

							break;
						}

						break;
					}
				}
			} catch (e) {
				print(e);
			} finally {
				action = false;
				removeEventListener("keyup", Pather.stopEvent);
				this.togglePickThread();
			}
		}

		delay(20);
	}
}
