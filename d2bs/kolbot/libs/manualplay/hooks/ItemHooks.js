/*
*	@filename	ItemHooks.js
*	@author		theBGuy
*	@desc		Item hooks for MapThread
*/

const ItemHooks = {
	enabled: true,
	pickitEnabled: false,
	modifier: 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)),
	hooks: [],
	ignoreItemTypes: [
		4, 5, 6, 18, 20, 22, 38, 41, 76, 77, 78, 79, 80,
		81, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 15, 19, 44, 42, 43
	],
	itemCodeByClassId: {
		7: "The Chieftain",
		28: "Gleamscythe",
		103: "Suicide Branch",
		104: "Carin Shard",
		105: "King Leoric's Arm",
		157: "Ribcracker",
		161: "Skystrike",
		187: "Bartuc's",
		190: "Jade Talon",
		192: "Shadow Killer",
		193: "Firelizard's",
		198: "Rune Master",
		208: "Boneshade",
		209: "Death's Web",
		240: "Gimmershred",
		241: "Warshrike",
		242: "Lacerator",
		255: "Reaper's Toll",
		256: "Tomb Reaver",
		258: "Stormspire",
		263: "Mang Song's",
		269: "Eaglehorn",
		270: "Ward Bow",
		271: "Windforce",
		292: "Lycander's Aim",
		294: "Lycander's Pike",
		295: "Titan's Revenge",
		297: "Eschuta's",
		300: "Death's Fathom",
		301: "Bloodraven's",
		303: "Stoneraven",
		305: "Thunder Stroke",
		342: "Goblin Toe",
		353: "Rockstopper",
		359: "Spirit Shroud",
		360: "Vipermagi's",
		365: "Shaftstop",
		367: "Skullder's",
		373: "Que-Hegan's",
		386: "Waterwalk",
		417: "Andariel's Vis",
		420: "Kira's",
		422: "Harlequin Crest",
		432: "Gladiator's Bane",
		456: "Sandstorm Trek's",
		457: "Marrowwalk",
		549: "Shadow Dancer",
		472: "Jalal's",
		477: "Arreat's Face",
		481: "HoZ",
		487: "Homunculus",
		488: "Cerebus",
		490: "Spirit Keeper",
		494: "Wolfhowl",
		495: "Demonhorn's",
		496: "Halaberd's",
		499: "Alma Negra",
		501: "Dragonscale",
		507: "Darkforce",
		506: "Boneflame",
		603: "Annihilus",
		604: "Hellfire Torch",
		605: "Gheed's",
		643: "Facet",
		653: "ÿc8Token",
		654: "ÿc3Ess-Of-Suffering",
		655: "ÿc7Ess-Of-Hatred",
		656: "ÿc1Ess-Of-Terror",
		657: "ÿc3Ess-Of-Destruction",
	},
	itemCodeByClassIdAndQuality: {
		113: {5: "Aldur's Wep", 7: "Moonfall"},
		470: {5: "Aldur's Helm"},
		441: {5: "Aldur's Armor", 7: "Steel Carapace"},
		388: {5: "Aldur's Boots", 7: "War Trav's"},
		213: {5: "Griswold's Wep", 7: "Moonfall"},
		427: {5: "Griswold's Helm", 7: "Crown of Ages"},
		372: {5: "Griswold's Armor", 7: "Corpsemourn"},
		502: {5: "Griswold's Shield"},
		219: {5: "IK Maul", 7: "Windhammer"},
		407: {5: "IK Helm"},
		442: {5: "IK Armor"},
		384: {5: "IK Gloves", 7: "HellMouth"},
		389: {5: "IK Boots", 7: "Gore Rider"},
		302: {5: "Mavina's Bow"},
		439: {5: "Mavina's Armor", 7: "Leviathan"},
		421: {5: "Mavina's Helm", 7: "Griffon's Eye"},
		391: {5: "Mavina's Belt", 7: "Razortail"},
		383: {5: "Mavina's Gloves", 7: "Lava Gout"},
		181: {5: "Natalya's Wep"},
		434: {5: "Natalya's Armor"},
		395: {5: "Natalya's Helm", 7: "Vamp Gaze"},
		387: {5: "Natalya's Boots", 7: "Silkweave"},
		290: {5: "Tal Orb", 7: "Occulus"},
		440: {5: "Tal Armor"},
		358: {5: "Tal Helm", 7: "Blackhorn's"},
		392: {5: "Tal Belt", 7: "Gloom's Trap"},
		465: {5: "Trang Helm", 7: "Giant Skull"},
		371: {5: "Trang Armor", 7: "Black Hades"},
		463: {5: "Trang Belt"},
		382: {5: "Trang Gloves", 7: "Ghoulhide"},
		486: {5: "Trang Shield"},
		234: {5: "Bul-Kathos Blade", 7: "Grandfather"},
		228: {5: "Bul-Kathos Sword"},
		352: {5: "Cow King's Helm", 7: "Peasant Crown"},
		316: {5: "Cow King's Armor", 7: "Twitchthroe"},
		340: {7: "Gorefoot"},
		19: {5: "Heavens's Wep", 7: "Crushflange"},
		426: {5: "Heavens's Helm", 7: "Nightwing's"},
		366: {5: "Heavens's Armor", 7: "Duriel's Shell"},
		449: {5: "Heavens's Shield"},
		151: {5: "Hwanin's Bill", 7: "Blackleach"},
		364: {5: "Hwanin's Armor", 7: "Crow Caw"},
		357: {5: "Hwanin's Helm", 7: "Crown of Thieves"},
		346: {7: "Nightsmoke"},
		438: {5: "Naj's Armor"},
		261: {5: "Naj's Staff", 7: "Ondal's Wisdom"},
		418: {5: "Naj's Helm", 7: "Moonfall"},
		329: {7: "Umbral Disk"},
		356: {5: "G-Face", 7: "Valk Wing"},
		347: {5: "Orphan's Belt"},
		335: {7: "Bloodfist"},
		227: {5: "Sazabi's Wep", 7: "Frostwind"},
		437: {5: "Sazabi's Armor", 7: "Arkaine's"},
		320: {7: "Venom Ward"},
		333: {7: "The Ward"},
		429: {5: "Disciple's Armor", 7: "Ormus Robe's"},
		462: {5: "Disciple's Belt", 7: "Verdungo's"},
		450: {5: "Disciple's Gloves"},
		385: {5: "Disciple's Boots", 7: "Infernostride"},
		317: {5: "Angelic's Armor", 7: "Darkglow"},
		27: {5: "Angelic's Wep", 7: "Krintiz"},
		307: {5: "Arcanna's Helm", 7: "Tarnhelm"},
		327: {5: "Arcanna's Armor", 7: "Heavenly Garb"},
		67: {5: "Arcanna's Staff", 7: "Iron Jang Bong"},
		337: {5: "Artic's Gloves", 7: "Magefist"},
		345: {5: "Artic's Belt", 7: "Snakecord"},
		313: {5: "Artic's Armor", 7: "Greyform"},
		74: {5: "Artic's Bow", 7: "Hellclap"},
		2: {5: "Beserker's Axe", 7: "Bladebone"},
		321: {5: "Beserker's Armor", 7: "Iceblink"},
		308: {5: "Beserker's Helm", 7: "Coif of Glory"}
	},
	itemColorCode: {
		// item quality
		4: {
			color: 0x97, code: "ÿc3"
		},
		5: {
			color: 0x84, code: "ÿc2"
		},
		6: {
			color: 0x6F, code: "ÿc9"
		},
		7: {
			color: 0xA8, code: "ÿc4"
		},
	},

	check: function () {
		if (!this.enabled) {
			this.flush();

			return;
		}

		for (let i = 0; i < this.hooks.length; i++) {
			if (!copyUnit(this.hooks[i].item).x) {
				for (let j = 0; j < this.hooks[i].hook.length; j++) {
					this.hooks[i].hook[j].remove();
				}

				this.hooks[i].name[0] && this.hooks[i].name[0].remove();
				this.hooks[i].vector[0] && this.hooks[i].vector[0].remove();
				this.hooks.splice(i, 1);
				i -= 1;
				this.flush();
			}
		}

		let item = getUnit(4);

		if (item) {
			do {
				if (item.area === ActionHooks.currArea && [2, 3].includes(item.mode) && (item.quality >= 4 || ([2, 3].includes(item.quality) && !this.ignoreItemTypes.includes(item.itemType)))) {
					if (this.pickitEnabled) {
						if ([0, 4].indexOf(Pickit.checkItem(item).result) === -1) {
							!this.getHook(item) && this.add(item);
						}
					} else {
						!this.getHook(item) && this.add(item);
					}

					this.getHook(item) && this.update();
				} else {
					this.remove(item);
				}
			} while (item.getNext());
		}
	},

	update: function () {
		for (let i = 0; i < this.hooks.length; i++) {
			this.hooks[i].vector[0].x = me.x;
			this.hooks[i].vector[0].y = me.y;
		}
	},

	getName: function (item) {
		let abbr = item.name.split(" ");
		let abbrName = "";

		if (abbr[1]) {
			abbrName += abbr[0] + "-";

			for (let i = 1; i < abbr.length; i++) {
				abbrName += abbr[i].substring(0, 1);
			}
		}

		return !!abbrName ? abbrName : item.name;
	},

	newHook: function (item) {
		let color = 0, code = "", arr = [], name = [], vector = [];
		let eth = (item.getFlag(0x400000) ? "Eth: " : "");

		switch (item.quality) {
		case 2:
		case 3:
			switch (item.itemType) {
			case 39:
				color = 0x9A;
				code += (!!this.itemCodeByClassId[item.classid] ? this.itemCodeByClassId[item.classid] : "ÿc8" + item.fname);

				break;
			case 74:
				if (item.classid >= 635) {
					color = 0x9B;
					code = "ÿc;" + item.fname;
				} else if (item.classid >= 626) {
					color = 0x9A;
					code = "ÿc8" + item.fname;
				} else {
					color = 0xA1;
					code = item.fname;
				}

				break;
			default:
				if (item.name) {
					if (item.sockets === 1) {
						break;
					}

					color = 0x20;
					code = "ÿc0" + (item.sockets > 0 ? "[" + item.sockets + "]" : "");
					code += this.getName(item);
					item.itemType === 70 && (code += "[R: " + item.getStat(39) + "]");
					code += "(" + item.ilvl + ")";
				}

				break;
			}

			break;
		case 5: 	// Set
		case 7: 	// Unique
			({color, code} = this.itemColorCode[item.quality]);

			if (!this.itemCodeByClassId[item.classid]) {
				switch (item.classid) {
				case 522: 	// Amulet's
				case 520: 	// Ring's
					code += item.name + "(" + item.ilvl + ")";
					
					break;
				default:
					code += (!!this.itemCodeByClassIdAndQuality[item.classid] ? this.itemCodeByClassIdAndQuality[item.classid][item.quality] : item.name);
					
					break;
				}
			} else {
				code += this.itemCodeByClassId[item.classid];
			}

			break;
		case 4: 	// Magic
		case 6: 	// Rare
			if (item.name) {
				({color, code} = this.itemColorCode[item.quality]);

				code += (item.sockets > 0 ? "[" + item.sockets + "]" : "");
				code += this.getName(item);
				code += "(" + item.ilvl + ")";
			}
			
			break;
		}

		!!code && name.push(new Text(eth + code, 665 + Hooks.resfix.x, 104 + this.modifier + (this.hooks.length * 14), color, 0, 0));
		vector.push(new Line(me.x, me.y, item.x, item.y, color, true));
		arr.push(new Line(item.x - 3, item.y, item.x + 3, item.y, color, true));
		arr.push(new Line(item.x, item.y - 3, item.x, item.y + 3, color, true));

		return {
			itemLoc: arr,
			itemName: name,
			vector: vector,
		};
	},

	add: function (item) {
		if (item === undefined || !item.classid) {
			return;
		}

		let temp = this.newHook(item);

		this.hooks.push({
			item: copyUnit(item),
			area: item.area,
			hook: temp.itemLoc,
			name: temp.itemName,
			vector: temp.vector,
		});
	},

	getHook: function (item) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].item.gid === item.gid) {
				return this.hooks[i].hook;
			}
		}

		return false;
	},

	remove: function (item) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].item.gid === item.gid) {
				for (let j = 0; j < this.hooks[i].hook.length; j++) {
					this.hooks[i].hook[j].remove();
				}
				
				this.hooks[i].name[0] && this.hooks[i].name[0].remove();
				this.hooks[i].vector[0] && this.hooks[i].vector[0].remove();
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

			this.hooks[0].name[0] && this.hooks[0].name[0].remove();
			this.hooks[0].vector[0] && this.hooks[0].vector[0].remove();
			this.hooks.shift();
		}
	}
};
