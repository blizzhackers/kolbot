var Hooks = {
	dashboardX: 400,
	dashboardY: 490,
	resfixX: me.screensize ? 0 : -85,
	resfixY: me.screensize ? 0 : -120,
	upperRightResfixX: me.screensize ? 0 : -160,
	lowerRightResfixX: me.screensize ? 0 : -85,
	lowerLeftResfixX: me.screensize ? 0 : -85,
	dashboardWidthResfixX: me.screensize ? 0 : -5,

	items: {
		hooks: [],
		enabled: true,

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			var i, item;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (!copyUnit(this.hooks[i].item).x) {
					for (let j = 0; j < this.hooks[i].hook.length; j++) {
						this.hooks[i].hook[j].remove();
					}
					
					this.hooks.splice(i, 1);
					i -= 1;
				}
			}

			item = getUnit(4);

			if (item) {
				do {
					if ((item.mode === 3 || item.mode === 5) && item.quality >= 5 || (item.quality === 4 && [58, 82].indexOf(item.itemType) > -1) || item.itemType === 74) {
						if (!this.getHook(item)) {
							this.add(item);
						} 
					} else {
						this.remove(item);
					}
				} while (item.getNext());
			}
		},

		newHook: function (item) {
			var color, arr = [];

			switch (item.quality) {
			case 2: 	// Runes
				if (item.classid >= 635) {
					color = 0x9B;
				} else if (item.classid >= 626) {
					color = 0x9A;
				} else {
					color = 0xFF;
				}
				//arr.push(new Image("d2bs\\kolbot\\images\\expansion.png", item.x, item.y, color, 2, true));
				//arr.push(new Line(item.x - 3, item.y, item.x + 3, item.y, color, true));
				//arr.push(new Line(item.x, item.y - 3, item.x, item.y + 3, color, true));

				break;
			case 4: 	// Magic
				color = 0x97;
				break;
			case 5: 	// Set
				color = 0x84;
				//arr.push(new Line(item.x - 3, item.y, item.x + 3, item.y, color, true));
				//arr.push(new Line(item.x - 3, item.y, item.x, item.y + 3, color, true));
				//arr.push(new Line(item.x + 3, item.y, item.x, item.y + 3, color, true));
				break;
			case 6: 	// Rare
				color = 0x6F;
				break;
			case 7: 	// Unique
				color = 0xA8;
				break;
			}

			arr.push(new Line(item.x - 3, item.y, item.x + 3, item.y, color, true));
			arr.push(new Line(item.x, item.y - 3, item.x, item.y + 3, color, true));

			return arr;
		},

		add: function (item) {
			this.hooks.push({
				item: copyUnit(item),
				hook: this.newHook(item)
			});
		},

		getHook: function (item) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].item.gid === item.gid) {
					return this.hooks[i].hook;
				}
			}

			return false;
		},

		remove: function (item) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].item.gid === item.gid) {
					for (let j = 0; j < this.hooks[i].hook.length; j++) {
						this.hooks[i].hook[j].remove();
					}
					this.hooks.splice(i, 1);

					return true;
				}
			}

			return false;
		},

		flush: function () {
			while (this.hooks.length) {
				for (let j = 0; j < this.hooks[0].hook.length; j++) {
					this.hooks[0].hook[j].remove();
				}
				this.hooks.shift();
			}
		}
	},

	monsters: {
		hooks: [],
		enabled: true,

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			var i, unit;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (!copyUnit(this.hooks[i].unit).x) {
					this.hooks[i].hook[0].remove();
					this.hooks[i].hook[1].remove();
					this.hooks.splice(i, 1);

					i -= 1;
				}
			}

			unit = getUnit(1);

			if (unit) {
				do {
					if (Attack.checkMonster(unit)) {
						if (!this.getHook(unit)) {
							this.add(unit);
						} else {
							this.updateCoords(unit);
						}
					} else {
						this.remove(unit);
					}
				} while (unit.getNext());
			}
		},

		newHook: function (unit) {
			var arr = [];

			arr.push(new Line(unit.x - 5, unit.y, unit.x + 5, unit.y, (unit.spectype & 0xF) ? 0x68 : 0x62, true));
			arr.push(new Line(unit.x, unit.y - 5, unit.x, unit.y + 5, (unit.spectype & 0xF) ? 0x68 : 0x62, true));

			return arr;
		},

		add: function (unit) {
			this.hooks.push({
				unit: copyUnit(unit),
				hook: this.newHook(unit)
			});
		},

		updateCoords: function (unit) {
			var hook = this.getHook(unit);

			if (!hook) {
				return false;
			}

			hook[0].x = unit.x - 5;
			hook[0].x2 = unit.x + 5;
			hook[0].y = unit.y;
			hook[0].y2 = unit.y;
			hook[1].x = unit.x;
			hook[1].x2 = unit.x;
			hook[1].y = unit.y - 5;
			hook[1].y2 = unit.y + 5;

			return true;
		},

		getHook: function (unit) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].unit.gid === unit.gid) {
					return this.hooks[i].hook;
				}
			}

			return false;
		},

		remove: function (unit) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].unit.gid === unit.gid) {
					this.hooks[i].hook[0].remove();
					this.hooks[i].hook[1].remove();
					this.hooks.splice(i, 1);

					return true;
				}
			}

			return false;
		},

		flush: function () {
			while (this.hooks.length) {
				this.hooks[0].hook[0].remove();
				this.hooks[0].hook[1].remove();
				this.hooks.shift();
			}
		}
	},

	shrines: {
		hooks: [],
		enabled: true,

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			var i, shrine;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (!copyUnit(this.hooks[i].shrine).x) {
					this.hooks[i].hook[0].remove();
					this.hooks.splice(i, 1);

					i -= 1;
				}
			}

			shrine = getUnit(2, "shrine");

			if (shrine) {
				do {
					if (shrine.mode === 0) {
						if (!this.getHook(shrine)) {
							this.add(shrine);
						} 
					} else {
						this.remove(shrine);
					}
				} while (shrine.getNext());
			}
		},

		newHook: function (shrine) {
			var arr = [];

			switch (shrine.objtype) {
				case 1:
					arr.push(new Text("Refilling", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 2:
					arr.push(new Text("Health", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 3:
					arr.push(new Text("Mana", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 4:
					arr.push(new Text("Health Exchange", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 5:
					arr.push(new Text("Mana Exchange", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 6:
					arr.push(new Text("Armor", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 7:
					arr.push(new Text("Combat", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 8:
					arr.push(new Text("Resist Fire", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 9:
					arr.push(new Text("Resist Cold", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 10:
					arr.push(new Text("Resist Lightning", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 11:
					arr.push(new Text("Resist Poison", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 12:
					arr.push(new Text("Skill", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 13:
					arr.push(new Text("Mana Recharge", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 14:
					arr.push(new Text("Stamina", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 15:
					arr.push(new Text("Experience", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 16:
					arr.push(new Text("Enirhs", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 17:
					arr.push(new Text("Portal", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 18:
					arr.push(new Text("Gem", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 19:
					arr.push(new Text("Fire", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 20:
					arr.push(new Text("Monster", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 21:
					arr.push(new Text("Exploding", shrine.x, shrine.y, 4, 6, 2, true));
					break;
				case 22:
					arr.push(new Text("Poison", shrine.x, shrine.y, 4, 6, 2, true));
					break;
			}

			return arr;
		},

		add: function (shrine) {
			this.hooks.push({
				shrine: copyUnit(shrine),
				hook: this.newHook(shrine)
			});
		},

		getHook: function (shrine) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].shrine.gid === shrine.gid) {
					return this.hooks[i].hook;
				}
			}

			return false;
		},

		remove: function (shrine) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].shrine.gid === shrine.gid) {
					this.hooks[i].hook[0].remove();
					this.hooks.splice(i, 1);

					return true;
				}
			}

			return false;
		},

		flush: function () {
			while (this.hooks.length) {
				this.hooks[0].hook[0].remove();
				this.hooks.shift();
			}
		}
	},

	text: {
		hooks: [],
		enabled: true,

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			if (!this.getHook("dashboard")) {
				this.add("dashboard");
			}

			if (!this.getHook("dashboardframe")) {
				this.add("dashboardframe");
			}

			if (!this.getHook("monsterStatus")) {
				this.add("monsterStatus");
			}

			if (!this.getHook("vectorStatus")) {
				this.add("vectorStatus");
			}

			if (!this.getHook("ping")) {
				this.add("ping");
			} else {
				this.getHook("ping").hook.text = "Ping: " + me.ping;
			}

			if (!this.getHook("time")) {
				this.add("time");
			} else {
				this.getHook("time").hook.text = this.timer();
			}

			if (!this.getHook("ip")) {
				this.add("ip");
			}

		},

		add: function (name) {
			switch (name) {
			case "ping":
				this.hooks.push({
					name: "ping",
					hook: new Text("Ping: " + me.ping, 785 + Hooks.upperRightResfixX, 56 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)), 4, 1, 1)
				});

				break;
			case "time":
				this.hooks.push({
					name: "time",
					hook: new Text(this.timer(), 785 + Hooks.upperRightResfixX, 72 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)), 4, 1, 1)
				});

				break;
			case "ip":
				this.hooks.push({
					name: "ip",
					hook: new Text("IP: " + (me.gameserverip.length > 0 ? me.gameserverip.split(".")[3] : "0"), 785 + Hooks.upperRightResfixX, 88 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)), 4, 1, 1)
				});

				break;
			case "monsterStatus":
				this.hooks.push({
					name: "monsterStatus",
					hook: new Text("Num 7: Disable Monsters", 445 + Hooks.lowerRightResfixX, 525 + Hooks.resfixY)
				});

				break;
			case "vectorStatus":
				this.hooks.push({
					name: "vectorStatus",
					hook: new Text("Num 8: Disable Vectors", 445 + Hooks.lowerRightResfixX, 535 + Hooks.resfixY)
				});

				break;
			case "dashboard":
				this.hooks.push({
					name: "dashboard",
					hook: new Box(Hooks.dashboardX + Hooks.resfixX, Hooks.dashboardY + Hooks.resfixY, 415 + Hooks.dashboardWidthResfixX, 55, 0x0, 1, 2)
				});

				break;
			case "dashboardframe":
				this.hooks.push({
					name: "dashboardframe",
					hook: new Frame(Hooks.dashboardX + Hooks.resfixX, Hooks.dashboardY + Hooks.resfixY, 415 + Hooks.dashboardWidthResfixX, 55, 2)
				});

				break;
			}
		},

		getHook: function (name) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].name === name) {
					return this.hooks[i];
				}
			}

			return false;
		},

		timer: function () {
			var min, sec;

			min = Math.floor((getTickCount() - me.gamestarttime) / 60000).toString();

			if (min <= 9) {
				min = "0" + min;
			}

			sec = (Math.floor((getTickCount() - me.gamestarttime) / 1000) % 60).toString();

			if (sec <= 9) {
				sec = "0" + sec;
			}

			return min + ":" + sec;
		},

		flush: function () {
			if (getUIFlag(0x0D)) {
				return;
			}

			while (this.hooks.length) {
				this.hooks.shift().hook.remove();
			}
		}
	},

	vector: {
		hooks: [],
		names: [],
		currArea: 0,
		enabled: true,

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			if (me.area !== this.currArea) {
				this.flush();

				var i, exits, wp, poi,
					nextAreas = [];

				// Specific area override
				nextAreas[7] = 26;
				nextAreas[76] = 78;
				nextAreas[77] = 78;
				nextAreas[113] = 115;
				nextAreas[115] = 117;
				nextAreas[118] = 120;

				this.currArea = me.area;
				exits = getArea().exits;

				if (exits) {
					for (i = 0; i < exits.length; i += 1) {
						if (me.area === 46) {
							this.add(exits[i].x, exits[i].y, exits[i].target === getRoom().correcttomb ? 0x69 : 0x99);
						} else if (exits[i].target === nextAreas[me.area] && nextAreas[me.area]) {
							this.add(exits[i].x, exits[i].y, 0x1F);
						} else if (exits[i].target === Hooks.tele.prevAreas.indexOf(me.area) && nextAreas[me.area]) {
							this.add(exits[i].x, exits[i].y, 0x99);
						} else if (exits[i].target === Hooks.tele.prevAreas.indexOf(me.area)) {
							this.add(exits[i].x, exits[i].y, 0x1F);
						} else if (exits[i].target === Hooks.tele.prevAreas[me.area]) {
							this.add(exits[i].x, exits[i].y, 0x0A);
						} else {
							this.add(exits[i].x, exits[i].y, 0x99);
						}

						this.addNames(exits[i]);
					}
				}

				wp = this.getWP();

				if (wp) {
					this.add(wp.x, wp.y, 0xA8);
				}

				poi = this.getPOI();

				if (poi) {
					this.add(poi.x, poi.y, 0x7D);
				}
			} else {
				this.update();
			}
		},

		add: function (x, y, color) {
			this.hooks.push(new Line(me.x, me.y, x, y, color, true));
		},

		addNames: function (area) {
			this.names.push(new Text(Pather.getAreaName(area.target), area.x, area.y, 0, 6, 2, true));
		},

		update: function () {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				this.hooks[i].x = me.x;
				this.hooks[i].y = me.y;
			}
		},

		flush: function () {
			while (this.hooks.length) {
				this.hooks.shift().remove();
			}

			while (this.names.length) {
				this.names.shift().remove();
			}

			this.currArea = 0;
		},

		getWP: function () {
			if (Pather.wpAreas.indexOf(me.area) === -1) {
				return false;
			}

			var i, preset,
				wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

			for (i = 0; i < wpIDs.length; i += 1) {
				preset = getPresetUnit(me.area, 2, wpIDs[i]);

				if (preset) {
					return {
						x: preset.roomx * 5 + preset.x,
						y: preset.roomy * 5 + preset.y
					};
				}
			}

			return false;
		},

		getPOI: function () {
			var unit, name;

			switch (me.area) {
			case 4: // Stony Field
				unit = getPresetUnit(me.area, 1, 737);
				name = "Cairn Stones";

				break;
			case 5: // Dark Wood
				unit = getPresetUnit(me.area, 2, 30);
				name = "Tree";

				break;
			case 49: // Sewers 3
				unit = getPresetUnit(me.area, 2, 355);
				name = "Radament";

				break;
			case 60: // Halls of the Dead 3
				unit = getPresetUnit(me.area, 2, 354);
				name = "Cube";

				break;
			case 74: // Arcane Sanctuary
				unit = getPresetUnit(me.area, 2, 357);
				name = "Summoner";

				break;
			case 64: // Maggot Lair 3
				unit = getPresetUnit(me.area, 1, 749);
				name = "Fat Worm";

				break;
			case 66: // Tal Rasha's Tombs
			case 67:
			case 68:
			case 69:
			case 70:
			case 71:
			case 72:
				unit = getPresetUnit(me.area, 2, 152);
				name = "Orifice";

				break;
			case 78: // Flayer Jungle
				unit = getPresetUnit(me.area, 2, 252);
				name = "Gidbinn";

				break;
			case 102: // Durance of Hate 3
				unit = {
					x: 17588,
					y: 8069
				};
				name = "Mephisto";

				break;
			case 105: // Plains of Despair
				unit = getPresetUnit(me.area, 1, 256);
				name = "Izual";

				break;
			case 107: // River of Flame
				unit = getPresetUnit(me.area, 2, 376);
				name = "Hephasto";

				break;
			case 108: // Chaos Sanctuary
				unit = getPresetUnit(me.area, 2, 255);
				name = "Star";

				break;
			case 111: // Frigid Highlands
			case 112: // Arreat Plateau
			case 117: // Frozen Tundra
				unit = getPresetUnit(me.area, 2, 60);
				name = "Hell Entrance";

				break;
			case 114: // Frozen River
				unit = getPresetUnit(me.area, 2, 460);
				name = "Frozen Anya";

				break;
			case 124: // Halls of Vaught
				unit = getPresetUnit(me.area, 2, 462);
				name = "Nihlathak";

				break;
			}

			if (unit) {
				if (unit instanceof PresetUnit) {
					return {
						x: unit.roomx * 5 + unit.x,
						y: unit.roomy * 5 + unit.y,
						name: name
					};
				}

				return {
					x: unit.x,
					y: unit.y,
					name: name
				};
			}

			return false;
		}
	},

	tele: {
		hooks: [],
		action: null,
		currArea: 0,
		enabled: true,
		prevAreas: [0, 0, 1, 2, 3, 10, 5, 6, 2, 3, 4, 6, 7, 9, 10, 11, 12, 3, 17, 17, 6, 20, 21, 22, 23, 24, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
					36, 4, 1, 1, 40, 41, 42, 43, 44, 74, 40, 47, 48, 40, 50, 51, 52, 53, 41, 42, 56, 45, 55, 57, 58, 43, 62, 63, 44, 46, 46, 46, 46, 46,
					46, 46, 1, 54, 1, 75, 76, 76, 78, 79, 80, 81, 82, 76, 76, 78, 86, 78, 88, 87, 89, 81, 92, 80, 80, 81, 81, 82, 82, 83, 100, 101, 102,
					103, 104, 105, 106, 107, 103, 109, 110, 111, 112, 113, 113, 115, 115, 117, 118, 118, 109, 121, 122, 123, 111, 112, 117, 120, 128, 129,
					130, 131, 109, 109, 109, 109],

		event: function (keycode) {
			Hooks.tele.action = keycode;
		},

		check: function () {
			if (!this.enabled) {
				return;
			}

			var hook,
				obj = {
					type: false,
					dest: false
				};

			if (this.action) {
				switch (this.action) {
				case 96: // Numpad 0
					hook = this.getHook("Next Area");
					obj.type = "area";

					break;
				case 97: // Numpad 1
					hook = this.getHook("Previous Area");
					obj.type = "area";

					break;
				case 98: // Numpad 2
					hook = this.getHook("Waypoint");
					obj.type = "wp";

					break;
				case 99: // Numpad 3
					hook = this.getHook("POI");
					obj.type = "unit";

					break;
				case 100: // Numpad 4
					hook = this.getHook("Side Area");
					obj.type = "area";

					break;
				}

				if (hook) {
					obj.dest = hook.destination;

					scriptBroadcast(JSON.stringify(obj));
				}

				this.action = null;
			}

			if (me.area !== this.currArea) {
				this.flush();
				this.add(me.area);
				addEventListener("keyup", this.event);

				this.currArea = me.area;
			}
		},

		add: function (area) {
			var i, exits, wp, poi, nextCheck,
				nextAreas = [];

			// Specific area override
			nextAreas[7] = 26;
			nextAreas[76] = 78;
			nextAreas[77] = 78;
			nextAreas[113] = 115;
			nextAreas[115] = 117;
			nextAreas[118] = 120;

			if (me.area === 46) {
				nextAreas[46] = getRoom().correcttomb;
			}

			switch (me.area) {
			case 2: // Blood Moor
				this.hooks.push({
					name: "Side Area",
					destination: 8, // Den of Evil
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(8), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 3: // Cold Plains
				this.hooks.push({
					name: "Side Area",
					destination: 17, // Burial Grounds
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(17), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 6: // Black Marsh
				this.hooks.push({
					name: "Side Area",
					destination: 20, // Forgotten Tower
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(20), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 7: // Tamoe Highlands
				this.hooks.push({
					name: "Side Area",
					destination: 12, // Pit Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(12), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 10: // Underground Passage Level 1
				this.hooks.push({
					name: "Side Area",
					destination: 14, // Underground Passage Level 2
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(14), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 17: // Burial Grounds
				this.hooks.push({
					name: "Side Area",
					destination: 19, // Mausoleum
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(19), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 41: // Rocky Waste
				this.hooks.push({
					name: "Side Area",
					destination: 55, // Stony Tomb Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(55), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 42: // Dry Hills
				this.hooks.push({
					name: "Side Area",
					destination: 56, // Halls of the Dead Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(56), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 43: // Far Oasis
				this.hooks.push({
					name: "Side Area",
					destination: 62, // Maggot Lair Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(62), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 44: // Lost City
				this.hooks.push({
					name: "Side Area",
					destination: 65, // Ancient Tunnels
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(65), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 76: // Spider Forest
				this.hooks.push({
					name: "Side Area",
					destination: 85, // Spider Cavern
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(85), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 78: // Flayer Jungle
				this.hooks.push({
					name: "Side Area",
					destination: 88, // Flayer Dungeon Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(88), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 80: // Kurast Bazaar
				this.hooks.push({
					name: "Side Area",
					destination: 94, // Ruined Temple
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(94), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 81: // Upper Kurast
				this.hooks.push({
					name: "Side Area",
					destination: 92, // Sewers Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(92), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 92: // Sewers Level 1
				this.hooks.push({
					name: "Side Area",
					destination: 80, // Kurast Bazaar
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(80), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 113: // Crystalline Passage
				this.hooks.push({
					name: "Side Area",
					destination: 114, // Frozen River
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(114), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 115: // Glacial Trail
				this.hooks.push({
					name: "Side Area",
					destination: 116, // Drifter Cavern
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(116), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 118: // Ancient's Way
				this.hooks.push({
					name: "Side Area",
					destination: 119, // Icy Cellar
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(119), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			}

			poi = Hooks.vector.getPOI();

			if (poi) {
				this.hooks.push({
					name: "POI",
					destination: {x: poi.x, y: poi.y},
					hook: new Text("ÿc<Num 3: " + poi.name, 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			wp = Hooks.vector.getWP();

			if (wp) {
				this.hooks.push({
					name: "Waypoint",
					destination: {x: wp.x, y: wp.y},
					hook: new Text("ÿc9Num 2: WP", 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			exits = getArea(area).exits;

			if (exits) {
				for (i = 0; i < exits.length; i += 1) {
					if (exits[i].target === this.prevAreas[me.area]) {
						this.hooks.push({
							name: "Previous Area",
							destination: this.prevAreas[me.area],
							hook: new Text("ÿc1Num 1: " + Pather.getAreaName(this.prevAreas[me.area]), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
						});

						break;
					}
				}

				// Check nextAreas first
				for (i = 0; i < exits.length; i += 1) {
					if (exits[i].target === nextAreas[me.area]) {
						this.hooks.push({
							name: "Next Area",
							destination: nextAreas[me.area],
							hook: new Text("ÿc3Num 0: " + Pather.getAreaName(nextAreas[me.area]), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
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
								destination: this.prevAreas.indexOf(me.area),
								hook: new Text("Num 0: " + Pather.getAreaName(this.prevAreas.indexOf(me.area)), 200 + Hooks.lowerLeftResfixX, 535 - (this.hooks.length * 10) + Hooks.resfixY)
							});

							break;
						}
					}
				}
			}
		},

		getHook: function (name) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].name === name) {
					return this.hooks[i];
				}
			}

			return false;
		},

		flush: function () {
			while (this.hooks.length) {
				this.hooks.shift().hook.remove();
			}

			removeEventListener("keyup", this.event);

			this.currArea = 0;
		}
	},

	update: function () {
		while (!me.gameReady) {
			delay(100);
		}

		this.monsters.check();
		this.shrines.check();
		this.text.check();
		this.vector.check();
		this.tele.check();
		this.items.check();
	},

	flush: function () {
		this.monsters.flush();
		this.shrines.flush();
		this.text.flush();
		this.vector.flush();
		this.tele.flush();
		this.items.flush();

		return true;
	}
};

function main() {
	include("json2.js");
	include("common/attack.js");
	include("common/pather.js");
	load("tools/maphelper.js");
	print("ÿc9Map Thread Loaded.");

	this.revealArea = function (area) {
		if (!this.revealedAreas) {
			this.revealedAreas = [];
		}

		if (this.revealedAreas.indexOf(area) === -1) {
			delay(500);
			revealLevel(true);
			this.revealedAreas.push(area);
		}
	};

	this.keyEvent = function (key) {
		switch (key) {
		case 103: // Numpad 7
			if (Hooks.monsters.enabled) {
				Hooks.monsters.enabled = false;
				Hooks.text.getHook("monsterStatus").hook.text = "Num 7: Enable Monsters";
			} else {
				Hooks.monsters.enabled = true;
				Hooks.text.getHook("monsterStatus").hook.text = "Num 7: Disable Monsters";
			}

			break;
		case 104: // Numpad 8
			if (Hooks.vector.enabled) {
				Hooks.vector.enabled = false;
				Hooks.text.getHook("vectorStatus").hook.text = "Num 8: Enable Vectors";
			} else {
				Hooks.vector.enabled = true;
				Hooks.text.getHook("vectorStatus").hook.text = "Num 8: Disable Vectors";
			}

			break;
		}
	};

	var i,
		hideFlags = [0x09, 0x0C, 0x0D, 0x01, 0x02, 0x0F, 0x18, 0x19, 0x1A, 0x21, 0x05, 0x14, 0x24];

	addEventListener("keyup", this.keyEvent);

	while (true) {
		while (!me.area || !me.gameReady) {
			delay(100);
		}

		this.revealArea(me.area);

		if (getUIFlag(0x0A)) {
			Hooks.update();
		} else {
			Hooks.flush();
		}

		delay(20);

		for (i = 0; i < hideFlags.length; i += 1) {
			while (getUIFlag(hideFlags[i])) {
				Hooks.flush();
				delay(100);
			}
		}
	}
}
