/*
*	@filename	ActionHooks.js
*	@author		theBGuy
*	@desc		Action hooks for MapThread
*/

const ActionHooks = {
	hooks: [],
	portals: [],
	frame: [],
	action: null,
	currArea: 0,
	enabled: true,
	prevAreas: [0, 0, 1, 2, 3, 10, 5, 6, 2, 3, 4, 6, 7, 9, 10, 11, 12, 3, 17, 17, 6, 20, 21, 22, 23, 24, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
		36, 4, 1, 1, 40, 41, 42, 43, 44, 74, 40, 47, 48, 40, 50, 51, 52, 53, 41, 42, 56, 45, 55, 57, 58, 43, 62, 63, 44, 46, 46, 46, 46, 46,
		46, 46, 1, 54, 1, 75, 76, 76, 78, 79, 80, 81, 82, 76, 76, 78, 86, 78, 88, 87, 89, 81, 92, 80, 80, 81, 81, 82, 82, 83, 100, 101, 102,
		103, 104, 105, 106, 107, 103, 109, 110, 111, 112, 113, 113, 115, 115, 117, 118, 118, 109, 121, 122, 123, 111, 112, 117, 120, 128, 129,
		130, 131, 109, 109, 109, 109
	],
	areaInfo: {
		133: {
			11: {x: 20023, y: 7643},
			20: {x: 20303, y: 7803},
			21: {x: 20263, y: 7683},
		},
		135: {
			14: {x: 20138, y: 14873},
			15: {x: 20138, y: 14563},
		},
	},
	ctrlObj: {
		0: {
			3: "moveItemFromInvoToTrade",
			5: "moveItemFromTradeToInvo"
		},
		1: {
			3: "moveItemFromInvoToStash",
			7: "moveItemFromStashToInvo"
		},
		2: {
			3: "moveItemFromInvoToCube",
			6: "moveItemFromCubeToInvo"
		},
		3: "sellItem"
	},
	blockKeyEventFlags: [
		0x01, 0x02, 0x05, 0x09, 0x0C, 0x0F, 0x14,
		0x17, 0x18, 0x19, 0x1A, 0x21, 0x24
	],

	event: function (keycode) {
		if ([16, 18].some(k => k === keycode)) {
			return;
		}

		ActionHooks.action = keycode;
	},

	getOnScreenLocation: function () {
		let possibleLocs = [0x17, 0x19, 0x1A, 0x0C];

		for (let i = 0; i < possibleLocs.length; i++) {
			if (getUIFlag(possibleLocs[i])) {
				return possibleLocs.indexOf(possibleLocs[i]);
			}
		}

		return -1;
	},

	checkAction: function () {
		let hook,
			unit, screenLoc,
			obj = { type: false, dest: false, action: false },
			qolObj = { type: "qol", dest: false, action: false };

		if (this.action) {
			switch (this.action) {
			case 96: // Numpad 0
				hook = this.getHook("Next Area");

				break;
			case 97: // Numpad 1
				hook = this.getHook("Previous Area");

				break;
			case 98: // Numpad 2
				hook = this.getHook("Waypoint");

				break;
			case 99: // Numpad 3
				hook = this.getHook("POI");

				break;
			case 100: // Numpad 4
				hook = this.getHook("Side Area");

				break;
			case 101: // Numpad 5
				switch (me.area) {
				case 1:
				case 38:
				case 46:
				case 76:
				case 78:
				case 80:
				case 81:
				case 82:
				case 108:
					hook = this.getHook("POI2");

					break;
				case 109:
					hook = this.getPortalHook("Matron's Den");

					break;
				}

				break;
			case 102: // Numpad 6
				switch (me.area) {
				case 46:
				case 76:
				case 81:
				case 82:
				case 108:
					hook = this.getHook("POI3");

					break;
				case 109:
					hook = this.getPortalHook("Sands");

					break;
				}

				break;
			case 103: // Numpad 7
				switch (me.area) {
				case 46:
				case 108:
					hook = this.getHook("POI4");

					break;
				case 109:
					hook = this.getPortalHook("Furnace");

					break;
				}
				
				break;
			case 104: // Numpad 8
				hook = me.area === 46 ? this.getHook("POI5") : this.getPortalHook("Uber Tristam");

				break;
			case 188: // shift <
				hook = TextHooks.getHook("Previous Act", TextHooks.qolHooks);

				break;
			case 190: // shift >
				hook = TextHooks.getHook("Next Act", TextHooks.qolHooks);

				break;
			case 17: // Ctrl
				unit = getUnit(101);

				if (!!unit) {
					screenLoc = this.getOnScreenLocation();

					switch (screenLoc) {
					case 0: // Trade screen
					case 1: // Stash
					case 2: // Cube
						qolObj.action = this.ctrlObj[screenLoc][unit.location];

						break;
					case 3: // Shop
						qolObj.action = "sellItem";

						break;
					default:
						break;
					}
				}

				break;
			case 53: // Numkey 5
				if (!me.inTown) {
					Town.getTpTool() && (qolObj.action = "makePortal");
				} else if (me.inTown) {
					if (!getUIFlag(0x19) && !getUIFlag(0x17) && !getUIFlag(0x01)) {
						qolObj.action = "heal";
					}
				}

				break;
			case 54: // Numkey 6
				if (!me.inTown) {
					Town.getTpTool() && (qolObj.action = "takePortal");
				} else if (me.inTown) {
					if (!getUIFlag(0x19) && !getUIFlag(0x17) && !getUIFlag(0x01)) {
						qolObj.action = "openStash";
					}
				}

				break;
			case 55: // Numkey 7
				if (this.blockKeyEventFlags.some(function(flag) { return getUIFlag(flag); })) {
					break;
				}

				TextHooks.getHook("itemStatus", TextHooks.statusHooks).hook.text = "ÿc4Key 7ÿc0: " + (ItemHooks.enabled ? "Enable" : "Disable") + " Item Filter";
				ItemHooks.enabled = !ItemHooks.enabled;

				break;
			case 56: // Numkey 8
				if (this.blockKeyEventFlags.some(function(flag) { return getUIFlag(flag); })) {
					break;
				}

				TextHooks.getHook("monsterStatus", TextHooks.statusHooks).hook.text = "ÿc4Key 8ÿc0: " + (MonsterHooks.enabled ? "Enable" : "Disable") + " Monsters";
				MonsterHooks.enabled = !MonsterHooks.enabled;

				break;
			case 57: // Numkey 9
				if (this.blockKeyEventFlags.some(function(flag) { return getUIFlag(flag); })) {
					break;
				}

				TextHooks.getHook("vectorStatus", TextHooks.statusHooks).hook.text = "ÿc4Key 9ÿc0: " + (VectorHooks.enabled ? "Enable" : "Disable") + " Vectors";
				VectorHooks.enabled = !VectorHooks.enabled;

				break;
			case 109: // Numpad -
				if (this.blockKeyEventFlags.some(function(flag) { return getUIFlag(flag); })) {
					break;
				}

				if (ItemHooks.pickitEnabled) {
					ItemHooks.pickitEnabled = false;
					TextHooks.getHook("pickitStatus", TextHooks.statusHooks).hook.text = "ÿc4Num -ÿc0: ÿc1Default Filter";
				} else {
					ItemHooks.pickitEnabled = true;
					ItemHooks.flush();
					TextHooks.getHook("pickitStatus", TextHooks.statusHooks).hook.text = "ÿc4Num -ÿc0: ÿc<Your Filter";

					if (!Hooks.saidMessage) {
						showConsole();
						print("ÿc<Notify :: ÿc0Item filter has switched to using your Pickit files, this is just to notify you of that. If you didn't add any nip files you probably should switch back.");
						print("ÿc<Notify :: ÿc0Close this console by pressing Home. You will not see this message again.");
						Hooks.saidMessage = true;
					}
				}

				break;
			case 45: // Ins key
				if (me.inTown) {
					break;
				}

				qolObj.action = "clear";

				break;
			}

			if (hook) {
				Object.assign(obj, hook);
				Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(obj));
			} else if (qolObj.action) {
				Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(qolObj));
			}

			this.action = null;
		}
	},

	check: function () {
		if (!this.enabled) {
			return;
		}

		this.checkAction();

		if (me.area !== this.currArea) {
			this.flush();

			while (!me.area || !me.gameReady) {
				delay(150);
			}

			this.add(me.area);
			TextHooks.update(this.hooks.length);
			this.currArea = me.area;
		}
	},

	add: function (area) {
		let i, exits, wp, poi, nextCheck, infSeal, seisSeal, vizSeal, bossX,
			nextAreas = [];

		// Specific area override
		nextAreas[7] = 26;
		nextAreas[76] = 78;
		nextAreas[77] = 78;
		nextAreas[113] = 115;
		nextAreas[115] = 117;
		nextAreas[118] = 120;
		me.area === 46 && (nextAreas[46] = getRoom().correcttomb);

		switch (me.area) {
		case 38:
			this.hooks.push({
				name: "POI2",
				type: "unit",
				action: {do: "openChest", id: 268},
				dest: {x: 25048, y: 5177},
				hook: new Text("ÿc<Num 5: Wirt's Leg", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 46:
			{
				let correctTomb = getRoom().correcttomb;
				let currExits = getArea().exits
					.filter(function (ex) { return ex.target !== correctTomb; })
					.sort(function(a, b) {
						return a.target - b.target;
					}).reverse();
				
				let curr;
				for (let i = 8; i > 4; i--) {
					curr = currExits.shift();
					this.hooks.push({
						name: "POI" + (i - 3),
						type: "area",
						dest: curr.target,
						hook: new Text("ÿc<Num " + i + ": " + Pather.getAreaName(curr.target), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
					});
				}

				curr = currExits.shift();
				this.hooks.push({
					name: "Side Area",
					type: "area",
					dest: curr.target,
					hook: new Text("ÿc<Num 4: " + Pather.getAreaName(curr.target), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});

				curr = currExits.shift();
				this.hooks.push({
					name: "POI",
					type: "area",
					dest: curr.target,
					hook: new Text("ÿc<Num 3: " + Pather.getAreaName(curr.target), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			break;
		case 76:
			this.hooks.push({
				name: "POI3",
				type: "area",
				dest: 77,
				hook: new Text("ÿc<Num 6: " + Pather.getAreaName(77), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 84,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(84), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 78:
			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 86,
				hook: new Text("ÿc<Num 5: Swampy Pit Level 1", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 80:
			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 95,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(95), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 81:
			this.hooks.push({
				name: "POI3",
				type: "area",
				dest: 97,
				hook: new Text("ÿc<Num 6: " + Pather.getAreaName(97), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 96,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(96), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 82:
			this.hooks.push({
				name: "POI3",
				type: "area",
				dest: 98,
				hook: new Text("ÿc<Num 6: " + Pather.getAreaName(98), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 99,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(99), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 108:
			infSeal = this.getDiabloSeals(392);

			if (infSeal) {
				this.hooks.push({
					name: "POI4",
					type: "unit",
					dest: {x: infSeal.x, y: infSeal.y},
					hook: new Text("ÿc<Num 7: Infector Seal", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			seisSeal = this.getDiabloSeals(394);

			if (seisSeal) {
				this.hooks.push({
					name: "POI3",
					type: "unit",
					dest: {x: seisSeal.x, y: seisSeal.y},
					hook: new Text("ÿc<Num 6: Seis Seal", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			vizSeal = this.getDiabloSeals(396);

			if (vizSeal) {
				this.hooks.push({
					name: "POI2",
					type: "unit",
					dest: {x: vizSeal.x, y: vizSeal.y},
					hook: new Text("ÿc<Num 5: Viz Seal", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			break;
		}

		let cowPortal = me.area === 1 ? getUnit(2, 60) : false;

		if (cowPortal && cowPortal.objtype === 39) {
			this.hooks.push({
				name: "POI2",
				type: "portal",
				dest: 39,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(39), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		switch (me.area) {
		case 2: // Blood Moor
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 8, // Den of Evil
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(8), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 3: // Cold Plains
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 17, // Burial Grounds
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(17), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 6: // Black Marsh
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 20, // Forgotten Tower
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(20), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 7: // Tamoe Highlands
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 12, // Pit Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(12), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 10: // Underground Passage Level 1
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 14, // Underground Passage Level 2
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(14), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 17: // Burial Grounds
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 19, // Mausoleum
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(19), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 40: // Lut Gholein
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 50, // Harem Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(50), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 41: // Rocky Waste
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 55, // Stony Tomb Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(55), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 42: // Dry Hills
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 56, // Halls of the Dead Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(56), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 43: // Far Oasis
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 62, // Maggot Lair Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(62), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 44: // Lost City
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 65, // Ancient Tunnels
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(65), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 76: // Spider Forest
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 85, // Spider Cavern
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(85), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 78: // Flayer Jungle
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 88, // Flayer Dungeon Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(88), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 80: // Kurast Bazaar
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 94, // Ruined Temple
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(94), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 81: // Upper Kurast
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 92, // Sewers Level 1
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(92), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 82: // Kurast Causeway
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 99, // Disused Reliquary
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(92), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 92: // Sewers Level 1
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 80, // Kurast Bazaar
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(80), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 113: // Crystalline Passage
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 114, // Frozen River
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(114), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 115: // Glacial Trail
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 116, // Drifter Cavern
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(116), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 118: // Ancient's Way
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: 119, // Icy Cellar
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(119), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		}

		poi = VectorHooks.getPOI();

		if (poi) {
			this.hooks.push({
				name: "POI",
				type: "unit",
				action: poi.action || false,
				dest: {x: poi.x, y: poi.y},
				hook: new Text("ÿc<Num 3: " + poi.name, Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		wp = VectorHooks.getWP();

		if (wp) {
			this.hooks.push({
				name: "Waypoint",
				type: "wp",
				dest: {x: wp.x, y: wp.y},
				hook: new Text("ÿc9Num 2: WP", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		let uberPortals = (me.area === 109 && me.hell) ? getUnits(2, 60) : false;

		if (uberPortals && uberPortals.some((portal) => [133, 134, 135, 136].includes(portal.objtype))) {
			TextHooks.displaySettings = false;
			this.frame.push({
				name: "portalbox",
				hook: new Box (Hooks.portalBoard.x - 8, Hooks.portalBoard.y + Hooks.resfix.y - 17, 190, 70, 0x0, 1, 0)
			});

			this.frame.push({
				name: "portalframe",
				hook: new Frame(Hooks.portalBoard.x - 8, Hooks.portalBoard.y + Hooks.resfix.y - 17, 190, 70, 0)
			});

			Pather.getPortal(133) && this.portals.push({
				name: "Matron's Den",
				type: "portal",
				dest: 133,
				hook: new Text("ÿc1Num 5: Matron's Den", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y)
			});

			Pather.getPortal(134) && this.portals.push({
				name: "Sands",
				type: "portal",
				dest: 134,
				hook: new Text("ÿc1Num 6: Forgotten Sands", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y + 15)
			});

			Pather.getPortal(135) && this.portals.push({
				name: "Furnace",
				type: "portal",
				dest: 135,
				hook: new Text("ÿc1Num 7: Furnace of Pain", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y + 30)
			});

			Pather.getPortal(136) && this.portals.push({
				name: "Uber Tristam",
				type: "portal",
				dest: 136,
				hook: new Text("ÿc1Num 8: Uber Tristam", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y + 45)
			});
		}

		let entrance = {x: 0, y: 0};

		switch (me.area) {
		case 38:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: 4,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(4), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 39:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: 1,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 46: 	// Canyon of Magic
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: 74,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(74), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 74: 	// Arcane Sanctuary
			this.hooks.push({
				name: "Previous Area",
				type: "area",
				dest: 54,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(54), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "Next Area",
				type: "area",
				dest: 46,
				hook: new Text("Num 0: " + Pather.getAreaName(46), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 121: 	// Nithathak's Temple
			this.hooks.push({
				name: "Previous Area",
				type: "unit",
				action: {do: "usePortal", id: 109},
				dest: {x: 10071, y: 13305},
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(109), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 125: 	// Abadon
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: 111,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(111), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 126:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: 112,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(112), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case 127:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: 117,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(117), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		// Forgotten sands
		case 134:
			me.area === 134 && (entrance = {x: 20193, y: 8693});
		// Matron's
		case 133:
		// Furnace
		case 135:
			bossX = getPresetUnit(me.area, 2, 397);
			bossX && (entrance = this.areaInfo[me.area][bossX.x]);
		// Tristram
		case 136:
			me.area === 136 && (entrance = {x: 25105, y: 5140});

			this.hooks.push({
				name: "Previous Area",
				type: "unit",
				action: {do: "usePortal", id: 109},
				dest: entrance,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(109), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		}

		exits = getArea(area).exits;

		if (exits) {
			for (i = 0; i < exits.length; i += 1) {
				if (exits[i].target === this.prevAreas[me.area]) {
					this.hooks.push({
						name: "Previous Area",
						type: "area",
						dest: this.prevAreas[me.area],
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(this.prevAreas[me.area]), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
					});

					break;
				}
			}

			// Check nextAreas first
			for (i = 0; i < exits.length; i += 1) {
				if (exits[i].target === nextAreas[me.area]) {
					this.hooks.push({
						name: "Next Area",
						type: "area",
						dest: nextAreas[me.area],
						hook: new Text("ÿc3Num 0: " + Pather.getAreaName(nextAreas[me.area]), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
					});

					nextCheck = true;

					break;
				}
			}

			// In case the area isn't in nextAreas array, use this.prevAreas array
			if (!nextCheck) {
				for (i = 0; i < exits.length; i += 1) {
					if (exits[i].target === this.prevAreas.indexOf(me.area)) {
						this.hooks.push({
							name: "Next Area",
							type: "area",
							dest: this.prevAreas.indexOf(me.area),
							hook: new Text("Num 0: " + Pather.getAreaName(this.prevAreas.indexOf(me.area)), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
						});

						break;
					}
				}
			}
		}

		if (poi && poi.name === "Orifice") {
			this.hooks.push({
				name: "Next Area",
				dest: 73,
				type: "area",
				hook: new Text("Num 0: " + Pather.getAreaName(73), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		if (me.area === 102) {
			this.hooks.push({
				name: "Next Area",
				dest: 103,
				type: "area",
				hook: new Text("Num 0: " + Pather.getAreaName(103), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		if (me.area === 131) {
			this.hooks.push({
				name: "Next Area",
				dest: 132,
				type: "portal",
				hook: new Text("ÿc3Num 0: " + Pather.getAreaName(132), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}
	},

	getDiabloSeals: function (seal) {
		let unit = getPresetUnit(108, 2, seal);

		if (unit) {
			if (unit instanceof PresetUnit) {
				return {
					x: unit.roomx * 5 + unit.x,
					y: unit.roomy * 5 + unit.y,
				};
			}
			
			return {
				x: unit.x,
				y: unit.y,
			};
		}

		return false;
	},

	getHook: function (name) {
		for (let i = 0; i < this.hooks.length; i += 1) {
			if (this.hooks[i].name === name) {
				return this.hooks[i];
			}
		}

		return false;
	},

	getPortalHook: function (name) {
		for (let i = 0; i < this.portals.length; i += 1) {
			if (this.portals[i].name === name) {
				return this.portals[i];
			}
		}

		return false;
	},

	flush: function () {
		while (this.hooks.length) {
			this.hooks.shift().hook.remove();
		}

		while (this.portals.length) {
			this.portals.shift().hook.remove();
		}

		while (this.frame.length) {
			this.frame.shift().hook.remove();
		}

		this.currArea = 0;
	}
};
