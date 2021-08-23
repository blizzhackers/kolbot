/* eslint-disable no-extra-boolean-cast */
/*
*	@filename	MapThread.js
*	@author		theBGuy
*	@desc		MapThread used with D2BotMap.dbj
*	@credits 	kolton for orginal MapThread, isid0re for the box/frame style, laz for gamepacketsent event handler
*/

const Hooks = {
	dashboardX: 400,
	dashboardY: 490,
	portalX: 12,
	portalY: 432,
	statBoxAX: 151,
	statBoxAY: 520,
	statBoxBX: 645,
	statBoxBY: 520,
	qolBoxX: 715,
	qolBoxY: 442,
	statBoxAResFixX: me.screensize ? 0 : -111,
	statBoxAResFixY: me.screensize ? 0 : -445,
	statBoxBResFixX: me.screensize ? 0 : -605,
	statBoxBResFixY: me.screensize ? 0 : -413,
	statBoxBTextResFixX: me.screensize ? 0 : -5,
	statBoxBWidthResFixX: me.screensize ? 0 : 10,
	qolBoxResFixX: me.screensize ? 0 : -645,
	qolBoxResFixY: me.screensize ? 0 : -304,
	resfixX: me.screensize ? 0 : -85,
	resfixY: me.screensize ? 0 : -120,
	upperRightResfixX: me.screensize ? 0 : -160,
	lowerRightResfixX: me.screensize ? 0 : -85,
	lowerLeftResfixX: me.screensize ? 0 : -85,
	dashboardWidthResfixX: me.screensize ? 0 : -5,
	pickitEnabled: false,
	saidMessage: false,
	userAddon: false,

	items: {
		hooks: [],
		enabled: true,
		ignoreItemTypes: [4, 5, 6, 18, 20, 22, 38, 41, 76, 77, 78, 79, 80, 81, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 15, 19, 44, 42, 43],

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			let i, item;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (!copyUnit(this.hooks[i].item).x) {
					for (let j = 0; j < this.hooks[i].hook.length; j++) {
						this.hooks[i].hook[j].remove();
					}

					if (this.hooks[i].name[0]) {
						this.hooks[i].name[0].remove();
					}

					if (this.hooks[i].vector[0]) {
						this.hooks[i].vector[0].remove();
					}
					
					this.hooks.splice(i, 1);
					i -= 1;
					this.flush();
				}
			}

			item = getUnit(4);

			if (item) {
				do {
					if ((item.mode === 3 || item.mode === 5) && (item.quality >= 5 || item.quality === 4 || ([2, 3].indexOf(item.quality) > -1 && this.ignoreItemTypes.indexOf(item.itemType) === -1))) {
						if (Hooks.pickitEnabled) {
							if ([0, 4].indexOf(Pickit.checkItem(item).result) === -1) {
								if (!this.getHook(item)) {
									this.add(item);
								}
							}
						} else {
							if (!this.getHook(item)) {
								this.add(item);
							}
						}

						if (this.getHook(item)) {
							this.update();
						}
					} else {
						this.remove(item);
					}
				} while (item.getNext());
			}
		},

		update: function () {
			for (let i = 0; i < this.hooks.length; i += 1) {
				this.hooks[i].vector[0].x = me.x;
				this.hooks[i].vector[0].y = me.y;
			}
		},

		newHook: function (item) {
			let color = 0, code = "", arr = [], name = [], vector = [];
			// White: ÿc0, Red: ÿc1, Light Green: ÿc2, Blue: ÿc3, Gold: ÿc4, Gray: ÿc5, Black: ÿc6, Lighter Gold?: ÿc7, Orange: ÿc8, Tan?: ÿc9, Dark Green: ÿc:, Purple: ÿc;, Green: ÿc<"

			switch (item.quality) {
			case 2:
			case 3:
				switch (item.itemType) {
				case 39:
					switch (item.classid) {
					case 653:
						color = 0x9A;
						code = "ÿc8Token";
						break;
					case 654:
						color = 0x9A;
						code = "ÿc3Ess-Of-Suffering";
						break;
					case 655:
						color = 0x9A;
						code = "ÿc7Ess-Of-Hatred";
						break;
					case 656:
						color = 0x9A;
						code = "ÿc1Ess-Of-Terror";
						break;
					case 657:
						color = 0x9A;
						code = "ÿc3Ess-Of-Destruction";
						break;
					default:
						color = 0x9A;
						code = "ÿc8" + item.fname;

						break;
					}

					name.push(new Text(code, 665 + Hooks.upperRightResfixX, 104 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)) + (this.hooks.length * 14), color, 0, 0));

					break;
				case 74:
					if (item.classid >= 635) {
						color = 0x9B;
						code = "ÿc;";
					} else if (item.classid >= 626) {
						color = 0x9A;
						code = "ÿc8";
					} else {
						color = 0xA1;
						code = "";
					}

					name.push(new Text(code + item.fname, 665 + Hooks.upperRightResfixX, 104 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)) + (this.hooks.length * 14), color, 0, 0));

					break;
				default:
					if (item.name) {
						if (item.getStat(194) === 1) {
							break;
						}

						color = 0x20;
						code = "ÿc0" + (item.getFlag(0x400000) ? "Eth: " : "") + (item.getStat(194) > 0 ? "[" + item.getStat(194) + "]" : "");
						let abbr = item.name.split(" ");
						let abbrName = "";

						if (abbr[1]) {
							abbrName += abbr[0] + "-";

							for (let i = 1; i < abbr.length; i++) {
								abbrName += abbr[i].substring(0, 1);
							}

							code += abbrName;
						} else {
							code += item.name;
						}

						if (item.itemType === 70) {
							code += "[R: " + item.getStat(39) + "]";
						}

						name.push(new Text(code + "(" + item.ilvl + ")", 665 + Hooks.upperRightResfixX, 104 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)) + (this.hooks.length * 14), color, 0, 0));
					}

					break;
				}

				break;
			case 5: 	// Set
			case 7: 	// Unique
				if (item.quality === 5) {
					color = 0x84;
					code = "ÿc2";
				}
				
				if (item.quality === 7) {
					color = 0xA8;
					code = "ÿc4";
				}

				switch (item.classid) {
				//Uniques
				//----Charms/Jewels----//
				case 603:
					code += "Annihilus";
					break;
				case 604:
					code += "Hellfire Torch";
					break;
				case 605:
					code += "Gheed's";
					break;
				case 643:
					code += "Facet";
					break;
				case 522: 	// Amulet's
				case 520: 	// Ring's
					code += item.name + "(" + item.ilvl + ")";
					
					break;
				//--------Sorc--------//
				case 300:
					code += item.quality === 5 ? "" : "Death's Fathom";
					break;
				case 297:
					code += item.quality === 5 ? "" : "Eschuta's";
					break;
				//--------Barb--------//
				case 477:
					code += item.quality === 5 ? "" : "Arreat's Face";
					break;
				case 495:
					code += item.quality === 5 ? "" : "Demonhorn's";
					break;
				case 496:
					code += item.quality === 5 ? "" : "Halaberd's";
					break;
				case 494:
					code += item.quality === 5 ? "" : "Wolfhowl";
					break;
				//--------Druid--------//
				case 472:
					code += item.quality === 5 ? "" : "Jalal's";
					break;
				case 488:
					code += item.quality === 5 ? "" : "Cerebus";
					break;
				case 490:
					code += item.quality === 5 ? "" : "Spirit Keeper";
					break;
				//--------Paladin--------//
				case 481:
					code += item.quality === 5 ? "" : "HoZ";
					break;
				case 499:
					code += item.quality === 5 ? "" : "Alma Negra";
					break;
				case 501:
					code += item.quality === 5 ? "" : "Dragonscale";
					break;
				//--------Amazon--------//
				case 292:
					code += item.quality === 5 ? "" : "Lycander's Aim";
					break;
				case 295:
					code += item.quality === 5 ? "" : "Titan's Revenge";
					break;
				case 294:
					code += item.quality === 5 ? "" : "Lycander's Pike";
					break;
				case 301:
					code += item.quality === 5 ? "" : "Bloodraven's";
					break;
				case 305:
					code += item.quality === 5 ? "" : "T-Stroke";
					break;
				case 303:
					code += item.quality === 5 ? "" : "Stoneraven";
					break;
				//--------Assassin--------//
				case 187:
					code += item.quality === 5 ? "" : "Bartuc's";
					break;
				case 193:
					code += item.quality === 5 ? "" : "Firelizard's";
					break;
				case 190:
					code += item.quality === 5 ? "" : "Jade Talon";
					break;
				case 192:
					code += item.quality === 5 ? "" : "Shadow Killer";
					break;
				//--------Necromancer--------//
				case 487:
					code += item.quality === 5 ? "" : "Homunculus";
					break;
				case 506:
					code += item.quality === 5 ? "" : "Boneflame";
					break;
				case 209:
					code += item.quality === 5 ? "" : "Death's Web";
					break;
				case 208:
					code += item.quality === 5 ? "" : "Boneshade";
					break;
				case 105:
					code += item.quality === 5 ? "" : "King Leoric";
					break;
				case 104:
					code += item.quality === 5 ? "" : "Carin Shard";
					break;
				case 103:
					code += item.quality === 5 ? "" : "Suicide Branch";
					break;
				//--------Helms--------//
				case 417:
					code += item.quality === 5 ? "" : "Andariel's";
					break;
				case 507:
					code += item.quality === 5 ? "" : "Darkforce";
					break;
				case 422:
					code += item.quality === 5 ? "" : "Shako";
					break;
				case 353:
					code += item.quality === 5 ? "" : "Rockstopper";
					break;
				case 420:
					code += item.quality === 5 ? "" : "Kira's";
					break;
				//--------Polearms--------//
				case 258:
					code += item.quality === 5 ? "" : "Stormspire";
					break;
				case 256:
					code += item.quality === 5 ? "" : "Tomb Reaver";
					break;
				case 255:
					code += item.quality === 5 ? "" : "Reaper's Toll";
					break;
				//--------Axes--------//
				case 198:
					code += item.quality === 5 ? "" : "Rune Master";
					break;
				case 240:
					code += item.quality === 5 ? "" : "Gimmershred";
					break;
				case 241:
					code += item.quality === 5 ? "" : "Warshrike";
					break;
				case 242:
					code += item.quality === 5 ? "" : "Lacerator";
					break;
				//--------Bows--------//
				case 271:
					code += item.quality === 5 ? "" : "Windforce";
					break;
				case 270:
					code += item.quality === 5 ? "" : "Ward Bow";
					break;
				case 269:
					code += item.quality === 5 ? "" : "Eaglehorn";
					break;
				//--------Staffs--------//
				case 263:
					code += item.quality === 5 ? "" : "Mang Song's";
					break;
				case 157:
					code += item.quality === 5 ? "" : "Ribcracker";
					break;
				//--------Boots--------//
				case 457:
					code += item.quality === 5 ? "" : "Marrowwalk";
					break;
				case 459:
					code += item.quality === 5 ? "" : "Shadow Dancer";
					break;
				case 456:
					code += item.quality === 5 ? "" : "Sandstorm Trek's";
					break;
				case 386:
					code += item.quality === 5 ? "" : "Waterwalk";
					break;
				case 342:
					code += item.quality === 5 ? "" : "Goblin Toe";
					break;
				//--------Armor--------//
				case 432:
					code += item.quality === 5 ? "" : "Gladiator's Bane";
					break;
				case 373:
					code += item.quality === 5 ? "" : "Que-Hegan's";
					break;
				case 367:
					code += item.quality === 5 ? "" : "Skullder's";
					break;
				case 365:
					code += item.quality === 5 ? "" : "Shaftstop";
					break;
				case 360:
					code += item.quality === 5 ? "" : "Vipermagi's";
					break;
				case 359:
					code += item.quality === 5 ? "" : "Spirit Shroud";
					break;
				//Set Items/Uniques
				//----------------------------Elite Sets----------------------------//
				//--------Set Aldurs--------//
				case 113:
					code += item.quality === 5 ? "Aldur's Wep" : "Moonfall";
					break;
				case 470:
					code += item.quality === 5 ? "Aldur's Helm" : item.name;
					break;
				case 441:
					code += item.quality === 5 ? "Aldur's Armor" : "Steel Carapace";
					break;
				case 388:
					code += item.quality === 5 ? "Aldur's Boots" : "War Trav's";
					break;
				//--------Set Griswold's--------//
				case 213:
					code += item.quality === 5 ? "Griswold's Wep" : "Moonfall";
					break;
				case 427:
					code += item.quality === 5 ? "Griswold's Helm" : "CoA";
					break;
				case 372:
					code += item.quality === 5 ? "Griswold's Armor" : "Corpsemourn";
					break;
				case 502:
					code += item.quality === 5 ? "Griswold's Shield" : item.name;
					break;
				//--------Set Immortal Kings--------//
				case 219:
					code += item.quality === 5 ? "IK Maul" : "Windhammer";
					break;
				case 407:
					code += item.quality === 5 ? "IK Helm" : item.name;
					break;
				case 442:
					code += item.quality === 5 ? "IK Armor" : item.name;
					break;
				case 384:
					code += item.quality === 5 ? "IK Gloves" : "HellMouth";
					break;
				case 389:
					code += item.quality === 5 ? "IK Boots" : "Gore Rider";
					break;
				//--------Set Mavina's--------//
				case 302:
					code += item.quality === 5 ? "Mavina's Bow" : item.name;
					break;
				case 439:
					code += item.quality === 5 ? "Mavina's Armor" : "Leviathan";
					break;
				case 421:
					code += item.quality === 5 ? "Mavina's Helm" : "Griffon's Eye";
					break;
				case 391:
					code += item.quality === 5 ? "Mavina's Belt" : "Razortail";
					break;
				case 383:
					code += item.quality === 5 ? "Mavina's Gloves" : "Lava Gout";
					break;
				//--------Set Natalya's--------//
				case 181:
					code += item.quality === 5 ? "Natalya's Wep" : item.name;
					break;
				case 434:
					code += item.quality === 5 ? "Natalya's Armor" : item.name;
					break;
				case 395:
					code += item.quality === 5 ? "Natalya's Helm" : "Vamp Gaze";
					break;
				case 387:
					code += item.quality === 5 ? "Natalya's Boots" : "Silkweave";
					break;
				//--------Set Tal Rasha--------//
				case 290:
					code += item.quality === 5 ? "Tal Orb" : "Occulus";
					break;
				case 440:
					code += item.quality === 5 ? "Tal Armor" : item.name;
					break;
				case 358:
					code += item.quality === 5 ? "Tal Helm" : "Blackhorn's";
					break;
				case 392:
					code += item.quality === 5 ? "Tal Belt" : "Gloom's Trap";
					break;
				//--------Set Trang Ouls--------//
				case 465:
					code += item.quality === 5 ? "Trang Helm" : "Giant Skull";
					break;
				case 371:
					code += item.quality === 5 ? "Trang Armor" : "Black Hades";
					break;
				case 463:
					code += item.quality === 5 ? "Trang Belt" : item.name;
					break;
				case 382:
					code += item.quality === 5 ? "Trang Gloves" : "Ghoulhide";
					break;
				case 486:
					code += item.quality === 5 ? "Trang Shield" : item.name;
					break;
				//----------------------------Exceptional Sets----------------------------//
				//--------Set Bul-Kathos's--------//
				case 234:
					code += item.quality === 5 ? "Bul-Kathos' Blade" : "Grandfather";
					break;
				case 228:
					code += item.quality === 5 ? "Bul-Kathos' Sword" : "";
					break;
				//--------Set Cow King's--------//
				case 352:
					code += item.quality === 5 ? "Cow King's Helm" : "Peasant Crown";
					break;
				case 316:
					code += item.quality === 5 ? "Cow King's Armor" : "Twitchthroe";
					break;
				case 340:
					code += item.quality === 5 ? item.name : "Gorefoot";
					break;
				//--------Set Heavens's--------//
				case 19:
					code += item.quality === 5 ? "Heavens's Wep" : "Crushflange";
					break;
				case 426:
					code += item.quality === 5 ? "Heavens's Helm" : "Nightwing's";
					break;
				case 366:
					code += item.quality === 5 ? "Heavens's Armor" : "Duriel's Shell";
					break;
				case 449:
					code += item.quality === 5 ? "Heavens's Shield" : item.name;
					break;
				//--------Set Hwanin's--------//
				case 151:
					code += item.quality === 5 ? "Hwanin's Bill" : "Blackleach";
					break;
				case 364:
					code += item.quality === 5 ? "Hwanin's Armor" : "Crow Caw";
					break;
				case 357:
					code += item.quality === 5 ? "Hwanin's Helm" : "Crown of Thieves";
					break;
				case 346:
					code += item.quality === 5 ? item.name : "Nightsmoke";
					break;
				//--------Set Naj's--------//
				case 438:
					code += item.quality === 5 ? "Naj's Armor" : "";
					break;
				case 261:
					code += item.quality === 5 ? "Naj's Staff" : "Ondal's";
					break;
				case 418:
					code += item.quality === 5 ? "Naj's Helm" : "Moonfall";
					break;
				//--------Set Orphan's Call--------//
				case 329:
					code += item.quality === 5 ? item.name : "Umbral Disk";
					break;
				case 356:
					code += item.quality === 5 ? "G-Face" : "Valk Wing";
					break;
				case 347:
					code += item.quality === 5 ? "Orphan's Belt" : item.name;
					break;
				case 335:
					code += item.quality === 5 ? item.name : "Bloodfist";
					break;
				//--------Set Sander's Folly--------//
				//--------Set Sazabi's--------//
				case 227:
					code += item.quality === 5 ? "Sazabi's Wep" : "Frostwind";
					break;
				case 437:
					code += item.quality === 5 ? "Sazabi's Armor" : "Arkaine's";
					break;
				case 320:
					code += item.quality === 5 ? item.name : "Venom Ward";
					break;
				case 333:
					code += item.quality === 5 ? item.name : "The Ward";
					break;
				//--------Set The Disciples--------//
				case 429:
					code += item.quality === 5 ? "Disciple's Armor" : "Ormus Robe's";
					break;
				case 462:
					code += item.quality === 5 ? "Disciple's Belt" : "Verdungo's";
					break;
				case 450:
					code += item.quality === 5 ? "Disciple's Gloves" : "";
					break;
				case 385:
					code += item.quality === 5 ? "Disciple's Boots" : "Infernostride";
					break;
				//----------------------------Normal Sets----------------------------//
				//--------Set Angelics's--------//
				case 317:
					code += item.quality === 5 ? "Angelic's Armor" : "Darkglow";
					break;
				case 27:
					code += item.quality === 5 ? "Angelic's Wep" : "Krintiz";
					break;
				//--------Set Arcanna's--------//
				case 307:
					code += item.quality === 5 ? "Arcanna's Helm" : "Tarnhelm";
					break;
				case 327:
					code += item.quality === 5 ? "Arcanna's Armor" : "Heavenly Garb";
					break;
				case 67:
					code += item.quality === 5 ? "Arcanna's Staff" : "Iron Jang Bong";
					break;
				//--------Set Artics's--------//
				case 337:
					code += item.quality === 5 ? "Artic's Gloves" : "Magefist";
					break;
				case 345:
					code += item.quality === 5 ? "Artic's Belt" : "Snakecord";
					break;
				case 313:
					code += item.quality === 5 ? "Artic's Armor" : "Greyform";
					break;
				case 74:
					code += item.quality === 5 ? "Artic's Bow" : "Hellclap";
					break;
				//--------Set Berserker's--------//
				case 2:
					code += item.quality === 5 ? "Beserker's Wep" : "Bladebone";
					break;
				case 321:
					code += item.quality === 5 ? "Beserker's Armor" : "Iceblink";
					break;
				case 308:
					code += item.quality === 5 ? "Beserker's Helm" : "Coif of Glory";
					break;
				default:
					code += item.name;
					break;
				}

				name.push(new Text(code, 665 + Hooks.upperRightResfixX, 104 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)) + (this.hooks.length * 14), color, 0, 0));
	
				break;
			case 4: 	// Magic
			case 6: 	// Rare
				if (item.name) {
					if (item.quality === 4) {
						color = 0x97;
						code = "ÿc3" + (item.getFlag(0x400000) ? "Eth: " : "") + (item.getStat(194) > 0 ? "[" + item.getStat(194) + "]" : "");
					} else {
						color = 0x6F;
						code = "ÿc9" + (item.getFlag(0x400000) ? "Eth: " : "") + (item.getStat(194) > 0 ? "[" + item.getStat(194) + "]" : "");
					}
					
					let abbr = item.name.split(" ");
					let abbrName = "";

					if (abbr[1]) {
						abbrName += abbr[0] + "-";

						for (let i = 1; i < abbr.length; i++) {
							abbrName += abbr[i].substring(0, 1);
						}

						code += abbrName;
					} else {
						code += item.name;
					}

					name.push(new Text(code + "(" + item.ilvl + ")", 665 + Hooks.upperRightResfixX, 104 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)) + (this.hooks.length * 14), color, 0, 0));
				}
				
				break;
			}

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
				hook: temp.itemLoc,
				name: temp.itemName,
				vector: temp.vector,
			});
		},

		getHook: function (item) {
			for (let i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].item.gid === item.gid) {
					return this.hooks[i].hook;
				}
			}

			return false;
		},

		remove: function (item) {
			for (let i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].item.gid === item.gid) {
					for (let j = 0; j < this.hooks[i].hook.length; j++) {
						this.hooks[i].hook[j].remove();
					}
					
					if (this.hooks[i].name[0]) {
						this.hooks[i].name[0].remove();
					}

					if (this.hooks[i].vector[0]) {
						this.hooks[i].vector[0].remove();
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

				if (this.hooks[0].name[0]) {
					this.hooks[0].name[0].remove();
				}

				if (this.hooks[0].vector[0]) {
					this.hooks[0].vector[0].remove();
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

			let i, unit;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (!copyUnit(this.hooks[i].unit).x) {
					this.hooks[i].hook[0].remove();
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
			let arr = [];

			if (unit.spectype & 0xF) {
				arr.push(new Text("O", unit.x, unit.y, this.specTypeColor(unit), 1, null, true));
			} else {
				arr.push(new Text("X", unit.x, unit.y, this.specTypeColor(unit), 1, null, true));
			}

			return arr;
		},

		// credit DetectiveSquirrel from his maphack https://github.com/DetectiveSquirrel/Kolbot-MapThread/blob/9c721a72a934518cfca1d1a05211b5e03b5b624f/kolbot/tools/MapThread.js#L2353
		specTypeColor: function (unit) {
			let UnitSpecType 			= unit.spectype,
				UniqueBossSpecType 		= 0x04,
				UniqueQuestModSpecType 	= 0x05,
				MagicSpecType		 	= 0x06,
				BossMinionSpecType		= 0x08;

			switch (UnitSpecType) {
			case BossMinionSpecType:
				return 3;
			case MagicSpecType:
				return 9;
			case UniqueBossSpecType:
				return 11;
			case UniqueQuestModSpecType:
				return 2;
			default:
				return 8;
			}
		},

		add: function (unit) {
			this.hooks.push({
				unit: copyUnit(unit),
				hook: this.newHook(unit)
			});
		},

		updateCoords: function (unit) {
			let hook = this.getHook(unit);

			if (!hook) {
				return false;
			}

			hook[0].x = unit.x;
			hook[0].y = unit.y;

			return true;
		},

		getHook: function (unit) {
			for (let i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].unit.gid === unit.gid) {
					return this.hooks[i].hook;
				}
			}

			return false;
		},

		remove: function (unit) {
			for (let i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].unit.gid === unit.gid) {
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

	shrines: {
		hooks: [],
		enabled: true,

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			let i, shrine;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (!copyUnit(this.hooks[i].shrine).objtype) {
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
			let arr = [];

			switch (shrine.objtype) {
			case 0:
				arr.push(new Text("Health", shrine.x, shrine.y, 4, 6, 2, true));
				break;
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
			if (!shrine.objtype) {
				return;
			}

			this.hooks.push({
				shrine: copyUnit(shrine),
				hook: this.newHook(shrine)
			});
		},

		getHook: function (shrine) {
			for (let i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].shrine.gid === shrine.gid) {
					return this.hooks[i].hook;
				}
			}

			return false;
		},

		remove: function (shrine) {
			for (let i = 0; i < this.hooks.length; i += 1) {
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
		frameYSizeScale: 0,
		frameYLocScale: 0,
		displayTitle: true,

		getScale: function () {
			switch (me.area) {
			case 75:
			case 103:
			case 8:
			case 9:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 16:
			case 18:
			case 19:
			case 20:
			case 21:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 30:
			case 31:
			case 33:
			case 34:
			case 36:
			case 37:
			case 38:
			case 39:
			case 45:
			case 46:
			case 47:
			case 49:
			case 50:
			case 51:
			case 53:
			case 54:
			case 55:
			case 56:
			case 58:
			case 59:
			case 60:
			case 61:
			case 62:
			case 63:
			case 64:
			case 65:
			case 66:
			case 67:
			case 68:
			case 69:
			case 70:
			case 71:
			case 72:
			case 73:
			case 84:
			case 85:
			case 86:
			case 87:
			case 88:
			case 89:
			case 90:
			case 91:
			case 93:
			case 94:
			case 95:
			case 96:
			case 97:
			case 98:
			case 99:
			case 100:
			case 102:
			case 104:
			case 114:
			case 116:
			case 119:
			case 120:
			case 121:
			case 124:
			case 125:
			case 126:
			case 127:
			case 128:
			case 130:
			case 132:
			case 133:
			case 134:
			case 135:
			case 136:
			case 7:
			case 10:
			case 27:
			case 28:
			case 29:
			case 32:
			case 35:
			case 41:
			case 48:
			case 52:
			case 57:
			case 77:
			case 79:
			case 92:
			case 101:
			case 105:
			case 106:
			case 109:
			case 110:
			case 122:
			case 129:
			case 131:
				this.frameYSizeScale = -20;
				this.frameYLocScale = 20;
				break;
			case 1:
			case 2:
			case 4:
			case 5:
			case 17:
			case 42:
			case 43:
			case 44:
			case 74:
			case 83:
			case 107:
			case 111:
			case 112:
			case 113:
			case 117:
			case 118:
			case 123:
				this.frameYSizeScale = -10;
				this.frameYLocScale = 10;
				break;
			case 40:
			case 76:
			case 78:
			case 80:
			case 81:
				this.frameYSizeScale = 10;
				this.frameYLocScale = -10;
				break;
			default:
				this.frameYSizeScale = 0;
				this.frameYLocScale = 0;
			}
		},

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			this.getScale();

			if (!this.getHook("credits")) {
				this.add("credits");
			}

			if (!this.getHook("title") && this.displayTitle) {
				this.add("title");
			}

			if (!this.getHook("dashboard")) {
				this.add("dashboard");
			}

			if (!this.getHook("dashboardframe")) {
				this.add("dashboardframe");
			}

			if (!this.getHook("qolBox")) {
				this.add("qolBox");
			}

			if (!this.getHook("qolFrame")) {
				this.add("qolFrame");
			}

			if (!this.getHook("nonTownQolsA") && !me.inTown) {
				this.add("nonTownQolsA");
			}

			if (!this.getHook("nonTownQolsB") && !me.inTown) {
				this.add("nonTownQolsB");
			}

			if (!this.getHook("townQolsA") && me.inTown) {
				this.add("townQolsA");
			}

			if (!this.getHook("townQolsB") && me.inTown) {
				this.add("townQolsB");
			}

			if (!this.getHook("killPather")) {
				this.add("killPather");
			}

			if (!this.getHook("pickitEnabled")) {
				this.add("pickitEnabled");
			}

			if (!this.getHook("statBoxA")) {
				this.add("statBoxA");
			}

			if (!this.getHook("statFrameA")) {
				this.add("statFrameA");
			}

			if (!this.getHook("statBoxB")) {
				this.add("statBoxB");
			}

			if (!this.getHook("statFrameB")) {
				this.add("statFrameB");
			}

			if (!this.getHook("statlineA")) {
				this.add("statlineA");
			}

			if (!this.getHook("statlineB")) {
				this.add("statlineB");
			}

			if (!this.getHook("statlineC")) {
				this.add("statlineC");
			}

			if (!this.getHook("statlineD")) {
				this.add("statlineD");
			}

			if (!this.getHook("itemStatus")) {
				this.add("itemStatus");
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

		update: function () {
			this.getScale();

			this.hooks.push({
				name: "dashboard",
				hook: new Box(Hooks.dashboardX + Hooks.resfixX, Hooks.dashboardY + Hooks.resfixY + this.frameYLocScale, 415 + Hooks.dashboardWidthResfixX, 60 + this.frameYSizeScale, 0x0, 1, 2)
			});

			this.hooks.push({
				name: "dashboardframe",
				hook: new Frame(Hooks.dashboardX + Hooks.resfixX, Hooks.dashboardY + Hooks.resfixY + this.frameYLocScale, 415 + Hooks.dashboardWidthResfixX, 60 + this.frameYSizeScale, 2)
			});
		},

		getBlock: function () {
			let shield = false,
				item = me.getItem(-1, 1);

			// make sure character has shield equipped
			if (item) {
				do {
					if ([4, 5].indexOf(item.bodylocation) > -1 && [2, 51, 69, 70].indexOf(item.itemType) > -1) {
						shield = true;
					}
				} while (item.getNext());
			}

			if (!shield) {
				return 0;
			}

			if (me.gametype === 0) { // classic
				return Math.floor(me.getStat(20) + getBaseStat(15, me.classid, 23));
			}

			return Math.min(75, Math.floor((me.getStat(20) + getBaseStat(15, me.classid, 23)) * (me.getStat(2) - 15) / (me.charlvl * 2)));
		},

		add: function (name) {
			switch (name) {
			case "ping":
				this.hooks.push({
					name: "ping",
					hook: new Text("Ping: " + me.ping, 785 + Hooks.upperRightResfixX, 56 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm)), 4, 1, 1)
				});

				break;
			case "time":
				this.hooks.push({
					name: "time",
					hook: new Text(this.timer(), 785 + Hooks.upperRightResfixX, 72 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm)), 4, 1, 1)
				});

				break;
			case "ip":
				this.hooks.push({
					name: "ip",
					hook: new Text("IP: " + (me.gameserverip.length > 0 ? me.gameserverip.split(".")[3] : "0"), 785 + Hooks.upperRightResfixX, 88 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm)), 4, 1, 1)
				});

				break;
			case "itemStatus":
				this.hooks.push({
					name: "itemStatus",
					hook: new Text("Key 7: Disable Item Filter", 445 + Hooks.lowerRightResfixX, 525 + Hooks.resfixY)
				});

				break;
			case "monsterStatus":
				this.hooks.push({
					name: "monsterStatus",
					hook: new Text("Key 8: Disable Monsters", 445 + Hooks.lowerRightResfixX, 535 + Hooks.resfixY)
				});

				break;
			case "vectorStatus":
				this.hooks.push({
					name: "vectorStatus",
					hook: new Text("Key 9: Disable Vectors", 445 + Hooks.lowerRightResfixX, 545 + Hooks.resfixY)
				});

				break;
			case "dashboard":
				this.hooks.push({
					name: "dashboard",
					hook: new Box(Hooks.dashboardX + Hooks.resfixX, Hooks.dashboardY + Hooks.resfixY + this.frameYLocScale, 415 + Hooks.dashboardWidthResfixX, 60 + this.frameYSizeScale, 0x0, 1, 2)
				});

				break;
			case "dashboardframe":
				this.hooks.push({
					name: "dashboardframe",
					hook: new Frame(Hooks.dashboardX + Hooks.resfixX, Hooks.dashboardY + Hooks.resfixY + this.frameYLocScale, 415 + Hooks.dashboardWidthResfixX, 60 + this.frameYSizeScale, 2)
				});

				break;
			case "statBoxA":
				this.hooks.push({
					name: "statBoxA",
					hook: new Box(Hooks.statBoxAX + Hooks.statBoxAResFixX, Hooks.statBoxAY + Hooks.statBoxAResFixY, 80, 30, 0x0, 1, 2)
				});

				break;
			case "statFrameA":
				this.hooks.push({
					name: "statFrameA",
					hook: new Frame(Hooks.statBoxAX + Hooks.statBoxAResFixX, Hooks.statBoxAY + Hooks.statBoxAResFixY, 80, 30, 2)
				});

				break;
			case "statBoxB":
				this.hooks.push({
					name: "statBoxB",
					hook: new Box(Hooks.statBoxBX + Hooks.statBoxBResFixX, Hooks.statBoxBY + Hooks.statBoxBResFixY, 70 + Hooks.statBoxBWidthResFixX, 30, 0x0, 1, 2)
				});

				break;
			case "statFrameB":
				this.hooks.push({
					name: "statFrameB",
					hook: new Frame(Hooks.statBoxBX + Hooks.statBoxBResFixX, Hooks.statBoxBY + Hooks.statBoxBResFixY, 70 + Hooks.statBoxBWidthResFixX, 30, 2)
				});

				break;
			case "statlineA":
				this.hooks.push({
					name: "statlineA",
					hook: new Text("ÿc4Block%: ÿc0" + this.getBlock(), 117 + Hooks.statBoxAResFixX, 535 + Hooks.statBoxAResFixY)
				});

				break;
			case "statlineB":
				this.hooks.push({
					name: "statlineB",
					hook: new Text("ÿc4MF: ÿc0" + me.getStat(80), 117 + Hooks.statBoxAResFixX, 545 + Hooks.statBoxAResFixY)
				});

				break;
			case "statlineC":
				this.hooks.push({
					name: "statlineC",
					hook: new Text("ÿc4FCR: ÿc0" + me.getStat(105), 617 + Hooks.statBoxBResFixX + Hooks.statBoxBTextResFixX, 535 + Hooks.statBoxBResFixY)
				});

				break;
			case "statlineD":
				this.hooks.push({
					name: "statlineD",
					hook: new Text("ÿc4FHR: ÿc0" + me.getStat(99), 617 + Hooks.statBoxBResFixX + Hooks.statBoxBTextResFixX, 545 + Hooks.statBoxBResFixY)
				});

				break;
			case "credits":
				this.hooks.push({
					name: "credits",
					hook: new Text("MH by theBGuy", 0, 600 + Hooks.resfixY, 4, 0, 0)
				});

				break;
			case "title":
				this.hooks.push({
					name: "title",
					hook: new Text(":: Welcome to MapHack, enter .help to see more commands ::", 400 + Hooks.resfixX, 25, 4, 0, 2)
				});

				break;
			case "qolBox":
				this.hooks.push({
					name: "qolBox",
					hook: new Box(Hooks.qolBoxX + Hooks.qolBoxResFixX, Hooks.qolBoxY + Hooks.qolBoxResFixY, 140, 47, 0x0, 1, 2)
				});

				break;
			case "qolFrame":
				this.hooks.push({
					name: "qolFrame",
					hook: new Frame(Hooks.qolBoxX + Hooks.qolBoxResFixX, Hooks.qolBoxY + Hooks.qolBoxResFixY, 140, 47, 2)
				});

				break;
			case "nonTownQolsA":
				this.hooks.push({
					name: "nonTownQolsA",
					hook: new Text("Key 5: Make Portal", 653 + Hooks.qolBoxResFixX, 455 + Hooks.qolBoxResFixY, 4)
				});

				break;
			case "nonTownQolsB":
				this.hooks.push({
					name: "nonTownQolsB",
					hook: new Text("Key 6: Go To Town", 653 + Hooks.qolBoxResFixX, 465 + Hooks.qolBoxResFixY, 4)
				});

				break;
			case "townQolsA":
				this.hooks.push({
					name: "townQolsA",
					hook: new Text("Key 5: Go To Healer", 653 + Hooks.qolBoxResFixX, 455 + Hooks.qolBoxResFixY, 4)
				});

				break;
			case "townQolsB":
				this.hooks.push({
					name: "townQolsB",
					hook: new Text("Key 6: Open Stash", 653 + Hooks.qolBoxResFixX, 465 + Hooks.qolBoxResFixY, 4)
				});

				break;
			case "killPather":
				this.hooks.push({
					name: "killPather",
					hook: new Text("Num 9: ÿc1Stop Action", 653 + Hooks.qolBoxResFixX, 475 + Hooks.qolBoxResFixY, 4)
				});

				break;
			case "pickitEnabled":
				this.hooks.push({
					name: "pickitEnabled",
					hook: new Text((Hooks.pickitEnabled ? "Num -: ÿc<Your Filter" : "Num -: ÿc1Default Filter"), 653 + Hooks.qolBoxResFixX, 485 + Hooks.qolBoxResFixY, 4)
				});

				break;
			}
		},

		getHook: function (name) {
			for (let i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].name === name) {
					return this.hooks[i];
				}
			}

			return false;
		},

		timer: function () {
			let min, sec;

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

				let i, exits, wp, poi,
					nextAreas = [];

				// Specific area override
				nextAreas[7] = 26;
				nextAreas[76] = 78;
				nextAreas[77] = 78;
				nextAreas[113] = 115;
				nextAreas[115] = 117;
				nextAreas[118] = 120;
				nextAreas[131] = 132;

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
			for (let i = 0; i < this.hooks.length; i += 1) {
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

			let i, preset,
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
			let unit, name;

			switch (me.area) {
			case 13: // Cave Level 2
			case 15: // Hole Level 2
			case 16: // Pit Level 2
			case 18: // Crypt
			case 19: // Mausoleum
			case 59: // Stony Tomb Level 2
			case 65: // Ancient Tunnels
			case 77: // Great Marsh
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
				unit = getPresetUnit(me.area, 2, 397);
				name = "SuperChest";

				break;
			case 115: // Glacial Trail
			case 122: // Halls of Anguish
			case 123: // Halls of Pain
				unit = getPresetUnit(me.area, 2, 455);
				name = "SuperChest";

				break;
			case 3: // Cold Plains
				unit = getPresetUnit(me.area, 5, 2);

				if (!unit) {
					unit = getPresetUnit(me.area, 5, 3);
				}

				name = "Cave Level 1";

				break;
			case 4: // Stony Field
				unit = getPresetUnit(me.area, 1, 737);
				name = "Cairn Stones";

				break;
			case 5: // Dark Wood
				unit = getPresetUnit(me.area, 2, 30);
				name = "Tree";

				break;
			case 6: // Black Marsh
				unit = getPresetUnit(me.area, 5, 2);

				if (!unit) {
					unit = getPresetUnit(me.area, 5, 3);

					if (!unit) {
						unit = getPresetUnit(me.area, 5, 1);
					}
				}

				name = "Hole Level 1";

				break;
			case 8: // Den of Evil
				unit = getPresetUnit(me.area, 1, 774);
				name = "Corpsefire";

				break;
			case 17: // Bloodraven
				unit = getPresetUnit(me.area, 1, 805);
				name = "Bloodraven";

				break;
			case 25: // Countess
				unit = getPresetUnit(me.area, 2, 580);
				name = "Countess";

				break;
			case 28: // Smith
				unit = getPresetUnit(me.area, 2, 108);
				name = "Smith";

				break;
			case 33: // BoneAsh
				unit = {x: 20047, y: 4898};
				name = "BoneAsh";

				break;
			case 37: // Andariel
				unit = {x: 22549, y: 9520};
				name = "Andariel";

				break;
			case 38: // Griswold
				if (getUnit(1, 365)) {
					unit = getUnit(1, 365);
				} else {
					unit = {x: 25163, y: 5170};
				}

				name = "Griswold";

				break;
			case 39: // Cow King
				if (getUnit(1, 743)) {
					unit = getUnit(1, 743);
				} else {
					unit = getPresetUnit(me.area, 1, 773);
				}
				
				name = "Cow King";

				break;
			case 40: // Lut Gholein
				unit = getPresetUnit(me.area, 5, 20);
				name = "Sewer's Level 1";

				break;
			case 49: // Sewers 3
				unit = getPresetUnit(me.area, 2, 355);
				name = "Radament";

				break;
			case 54: // Arcane Sanctuary
				unit = {x: 10073, y: 8670};
				name = "Arcane Sanctuary";

				break;
			case 60: // Halls of the Dead 3
				unit = getPresetUnit(me.area, 2, 354);
				name = "Cube";

				break;
			case 61: // Claw Viper Temple 2
				unit = getPresetUnit(me.area, 2, 149);
				name = "Amulet";

				break;
			case 74: // Arcane Sanctuary
				unit = getPresetUnit(me.area, 2, 357);
				name = "Summoner";

				break;
			case 64: // Maggot Lair 3
				unit = getPresetUnit(me.area, 2, 356);
				name = "Staff";

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

				if (!unit) {
					unit = getPresetUnit(me.area, 2, 397);
					name = "SuperChest";
				}

				break;
			case 73: // Duriels Lair
				unit = {x: 22577, y: 15609},
				name = "Tyrael";

				break;
			case 78: // Flayer Jungle
				unit = getPresetUnit(me.area, 2, 252);
				name = "Gidbinn";

				break;
			case 80: // Sewer's Level 1
				unit = getPresetUnit(me.area, 5, 57);
				name = "Sewer's Level 1";

				break;
			case 85: // Spider Cavern
				unit = getPresetUnit(me.area, 2, 407);
				name = "Eye";

				break;
			case 91: // Flayer Dungeon Level 3
				unit = getPresetUnit(me.area, 2, 406);
				name = "Brain";

				break;
			case 93: // A3 Sewer's Level 2
				unit = getPresetUnit(me.area, 2, 405);
				name = "Heart";

				break;
			case 94: // Ruined Temple
				unit = getPresetUnit(me.area, 2, 193);
				name = "Lam Esen";

				break;
			case 83: // Travincal
				unit = getPresetUnit(me.area, 2, 404);
				name = "Orb";

				break;
			case 102: // Durance of Hate 3
				unit = {x: 17588, y: 8069};
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
			case 109: // Anya Portal
				unit = {x: 5112, y: 5120};
				name = "Anya Portal";

				break;
			case 110: // Bloody Foothills
				unit = {x: 3899, y: 5113};
				name = "Shenk";

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
			case 121: // Nihlathaks Temple
				unit = {x: 10058, y: 13234};
				name = "Pindle";

				break;
			case 124: // Halls of Vaught
				unit = getPresetUnit(me.area, 2, 462);
				name = "Nihlathak";

				break;
			case 131: // Throne of Destruction
				unit = {x: 15118, y: 5002};
				name = "Throne Room";

				break;
			case 132: // Worldstone Chamber
				if (getUnit(1, 544)) {
					unit = getUnit(1, 544);
				} else {
					unit = {x: 15134, y: 5923};
				}
				
				name = "Baal";

				break;
			case 133: // Matron's Den
				unit = getPresetUnit(me.area, 2, 397);
				name = "Lilith";

				break;
			case 134: // Forgotten Sands
				unit = getUnit(1, 708);
				name = "Duriel";

				break;
			case 135: // Furnace of Pain
				unit = getPresetUnit(me.area, 2, 397);
				name = "Izual";

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
		portals: [],
		frame: [],
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

			let hook,
				obj = {
					type: false,
					dest: false
				};

			if (this.action) {
				switch (this.action) {
				case 96: // Numpad 0

					if (me.area === 131) {
						hook = this.getHook("Worldstone Chamber");
						obj.type = "portal";
					} else {
						hook = this.getHook("Next Area");
						obj.type = "area";
					}

					break;
				case 97: // Numpad 1
					hook = this.getHook("Previous Area");

					if ([74, 121, 133, 135, 136].indexOf(me.area) > -1) {
						obj.type = "unit";
					} else if ([38, 39, 46, 125, 126, 127, 134].indexOf(me.area) > -1) {
						obj.type = "portal";
					} else {
						obj.type = "area";
					}

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
				case 101: // Numpad 5
					switch (me.area) {
					case 1:
						hook = this.getHook("Moo Moo Farm");
						obj.type = "portal";
						break;
					case 38:
						hook = this.getHook("Wirt's Leg");
						obj.type = "unit";
						break;
					case 76:
						hook = this.getHook("Spider Cave");
						obj.type = "area";
						break;
					case 78:
						hook = this.getHook("Swampy Pit Level 1");
						obj.type = "area";
						break;
					case 80:
						hook = this.getHook("Disused Fane");
						obj.type = "area";
						break;
					case 81:
						hook = this.getHook("Forgotten Reliquary");
						obj.type = "area";
						break;
					case 82:
						hook = this.getHook("Disused Reliquary");
						obj.type = "area";
						break;
					case 108:
						hook = this.getHook("Viz Seal");
						obj.type = "unit";
						break;
					case 109:
						hook = this.getPortalHook("Matron's Den");
						obj.type = "portal";
						break;
					}

					break;
				case 102: // Numpad 6
					switch (me.area) {
					case 1:
					case 40:
					case 103:
						hook = this.getHook("Next Act");
						obj.type = "npc";
						break;
					case 76:
						hook = this.getHook("Great Marsh");
						obj.type = "area";
						break;
					case 81:
						hook = this.getHook("Forgotten Temple");
						obj.type = "area";
						break;
					case 82:
						hook = this.getHook("Ruined Fane");
						obj.type = "area";
						break;
					case 108:
						hook = this.getHook("Seis Seal");
						obj.type = "unit";
						break;
					case 109:
						hook = this.getPortalHook("Sands");
						obj.type = "portal";
						break;
					}

					break;
				case 103: // Numpad 7
					switch (me.area) {
					case 40:
					case 75:
						hook = this.getHook("Previous Act");
						obj.type = "npc";
						break;
					case 108:
						hook = this.getHook("Infector Seal");
						obj.type = "unit";
						break;
					case 109:
						hook = this.getPortalHook("Furnace");
						obj.type = "portal";
						break;
					}
					
					break;
				case 104: // Numpad 8
					hook = this.getPortalHook("Uber Tristam");
					obj.type = "portal";

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
				Hooks.text.update();
				this.add(me.area);
				addEventListener("keyup", this.event);

				this.currArea = me.area;
			}
		},

		add: function (area) {
			let i, exits, wp, poi, nextCheck, infSeal, seisSeal, vizSeal,
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

			if (me.inTown) {
				switch (me.area) {
				case 1:
					this.hooks.push({
						name: "Next Act",
						destination: 2,
						hook: new Text("ÿc7Num 6: " + Pather.getAreaName(40), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 40:
					this.hooks.push({
						name: "Previous Act",
						destination: 1,
						hook: new Text("ÿc8Num 7: " + Pather.getAreaName(1), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					this.hooks.push({
						name: "Next Act",
						destination: 3,
						hook: new Text("ÿc7Num 6: " + Pather.getAreaName(75), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 75:
					this.hooks.push({
						name: "Previous Act",
						destination: 2,
						hook: new Text("ÿc8Num 7: " + Pather.getAreaName(40), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 103:
					this.hooks.push({
						name: "Next Act",
						destination: 5,
						hook: new Text("ÿc7Num 6: " + Pather.getAreaName(109), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				}
			}

			switch (me.area) {
			case 38:
				this.hooks.push({
					name: "Wirt's Leg",
					destination: {x: 25048, y: 5177},
					hook: new Text("ÿc<Num 5: Wirt's Leg", 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 76:
				this.hooks.push({
					name: "Great Marsh",
					destination: 77,
					hook: new Text("ÿc<Num 6: " + Pather.getAreaName(77), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				this.hooks.push({
					name: "Spider Cave",
					destination: 84,
					hook: new Text("ÿc<Num 5: " + Pather.getAreaName(84), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 78:
				this.hooks.push({
					name: "Swampy Pit Level 1",
					destination: 86,
					hook: new Text("ÿc<Num 5: Swampy Pit Level 1", 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 80:
				this.hooks.push({
					name: "Disused Fane",
					destination: 95,
					hook: new Text("ÿc<Num 5: " + Pather.getAreaName(95), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 81:
				this.hooks.push({
					name: "Forgotten Temple",
					destination: 97,
					hook: new Text("ÿc<Num 6: " + Pather.getAreaName(97), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				this.hooks.push({
					name: "Forgotten Reliquary",
					destination: 96,
					hook: new Text("ÿc<Num 5: " + Pather.getAreaName(96), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 82:
				this.hooks.push({
					name: "Ruined Fane",
					destination: 98,
					hook: new Text("ÿc<Num 6: " + Pather.getAreaName(98), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				this.hooks.push({
					name: "Disused Reliquary",
					destination: 99,
					hook: new Text("ÿc<Num 5: " + Pather.getAreaName(99), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 108:
				infSeal = this.getDiabloSeals(392);

				if (infSeal) {
					this.hooks.push({
						name: "Infector Seal",
						destination: {x: infSeal.x, y: infSeal.y},
						hook: new Text("ÿc<Num 7: Infector Seal", 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});
				}

				seisSeal = this.getDiabloSeals(394);

				if (seisSeal) {
					this.hooks.push({
						name: "Seis Seal",
						destination: {x: seisSeal.x, y: seisSeal.y},
						hook: new Text("ÿc<Num 6: Seis Seal", 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});
				}

				vizSeal = this.getDiabloSeals(396);

				if (vizSeal) {
					this.hooks.push({
						name: "Viz Seal",
						destination: {x: vizSeal.x, y: vizSeal.y},
						hook: new Text("ÿc<Num 5: Viz Seal", 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});
				}

				break;
			}

			let cowPortal = me.area === 1 ? getUnit(2, 60) : false;

			if (cowPortal && cowPortal.objtype === 39) {
				this.hooks.push({
					name: "Moo Moo Farm",
					destination: 39,
					hook: new Text("ÿc<Num 5: " + Pather.getAreaName(39), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			switch (me.area) {
			case 2: // Blood Moor
				this.hooks.push({
					name: "Side Area",
					destination: 8, // Den of Evil
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(8), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 3: // Cold Plains
				this.hooks.push({
					name: "Side Area",
					destination: 17, // Burial Grounds
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(17), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 6: // Black Marsh
				this.hooks.push({
					name: "Side Area",
					destination: 20, // Forgotten Tower
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(20), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 7: // Tamoe Highlands
				this.hooks.push({
					name: "Side Area",
					destination: 12, // Pit Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(12), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 10: // Underground Passage Level 1
				this.hooks.push({
					name: "Side Area",
					destination: 14, // Underground Passage Level 2
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(14), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 17: // Burial Grounds
				this.hooks.push({
					name: "Side Area",
					destination: 19, // Mausoleum
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(19), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 40: // Lut Gholein
				this.hooks.push({
					name: "Side Area",
					destination: 50, // Harem Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(50), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 41: // Rocky Waste
				this.hooks.push({
					name: "Side Area",
					destination: 55, // Stony Tomb Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(55), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 42: // Dry Hills
				this.hooks.push({
					name: "Side Area",
					destination: 56, // Halls of the Dead Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(56), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 43: // Far Oasis
				this.hooks.push({
					name: "Side Area",
					destination: 62, // Maggot Lair Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(62), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 44: // Lost City
				this.hooks.push({
					name: "Side Area",
					destination: 65, // Ancient Tunnels
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(65), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 76: // Spider Forest
				this.hooks.push({
					name: "Side Area",
					destination: 85, // Spider Cavern
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(85), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 78: // Flayer Jungle
				this.hooks.push({
					name: "Side Area",
					destination: 88, // Flayer Dungeon Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(88), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 80: // Kurast Bazaar
				this.hooks.push({
					name: "Side Area",
					destination: 94, // Ruined Temple
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(94), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 81: // Upper Kurast
				this.hooks.push({
					name: "Side Area",
					destination: 92, // Sewers Level 1
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(92), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 82: // Kurast Causeway
				this.hooks.push({
					name: "Side Area",
					destination: 99, // Disused Reliquary
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(92), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 92: // Sewers Level 1
				this.hooks.push({
					name: "Side Area",
					destination: 80, // Kurast Bazaar
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(80), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 113: // Crystalline Passage
				this.hooks.push({
					name: "Side Area",
					destination: 114, // Frozen River
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(114), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 115: // Glacial Trail
				this.hooks.push({
					name: "Side Area",
					destination: 116, // Drifter Cavern
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(116), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			case 118: // Ancient's Way
				this.hooks.push({
					name: "Side Area",
					destination: 119, // Icy Cellar
					hook: new Text("ÿc3Num 4: " + Pather.getAreaName(119), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});

				break;
			}

			poi = Hooks.vector.getPOI();

			if (poi) {
				this.hooks.push({
					name: "POI",
					destination: {x: poi.x, y: poi.y},
					hook: new Text("ÿc<Num 3: " + poi.name, 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			wp = Hooks.vector.getWP();

			if (wp) {
				this.hooks.push({
					name: "Waypoint",
					destination: {x: wp.x, y: wp.y},
					hook: new Text("ÿc9Num 2: WP", 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			let uberPortals = (me.area === 109 && me.diff === 2) ? getUnit(2, "portal") : false;

			if (uberPortals && [133, 134, 135, 136].indexOf(uberPortals.objtype) > -1) {
				this.frame.push({
					name: "portalbox",
					hook: new Box (Hooks.portalX - 8, Hooks.portalY + Hooks.resfixY - 17, 190, 70, 0x0, 1, 0)
				});

				this.frame.push({
					name: "portalframe",
					hook: new Frame(Hooks.portalX - 8, Hooks.portalY + Hooks.resfixY - 17, 190, 70, 0)
				});

				if (Pather.getPortal(133)) {
					this.portals.push({
						name: "Matron's Den",
						destination: 133,
						hook: new Text("ÿc1Num 5: Matron's Den", Hooks.portalX, Hooks.portalY + Hooks.resfixY)
					});
				}

				if (Pather.getPortal(134)) {
					this.portals.push({
						name: "Sands",
						destination: 134,
						hook: new Text("ÿc1Num 6: Forgotten Sands", Hooks.portalX, Hooks.portalY + Hooks.resfixY + 15)
					});
				}

				if (Pather.getPortal(135)) {
					this.portals.push({
						name: "Furnace",
						destination: 135,
						hook: new Text("ÿc1Num 7: Furnace of Pain", Hooks.portalX, Hooks.portalY + Hooks.resfixY + 30)
					});
				}

				if (Pather.getPortal(136)) {
					this.portals.push({
						name: "Uber Tristam",
						destination: 136,
						hook: new Text("ÿc1Num 8: " + Pather.getAreaName(136), Hooks.portalX, Hooks.portalY + Hooks.resfixY + 45)
					});
				}

			}

			if ([38, 39, 46, 74, 121, 125, 126, 127, 133, 134, 135, 136].indexOf(me.area) > -1) {
				let entrance = {x: 0, y: 0};

				switch (me.area) {
				case 38:
					this.hooks.push({
						name: "Previous Area",
						destination: 4,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(4), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 39:
					this.hooks.push({
						name: "Previous Area",
						destination: 1,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(1), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 46: 	// Canyon of Magic
					this.hooks.push({
						name: "Previous Area",
						destination: 74,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(74), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 74: 	// Arcane Sanctuary
					this.hooks.push({
						name: "Previous Area",
						destination: {x: 25427, y: 5427},
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(54), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					this.hooks.push({
						name: "Next Area",
						destination: 46,
						hook: new Text("Num 0: " + Pather.getAreaName(46), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 121: 	// Nithathak's Temple
					this.hooks.push({
						name: "Previous Area",
						destination: {x: 10071, y: 13305},
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(109), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 125: 	// Abadon
					this.hooks.push({
						name: "Previous Area",
						destination: 111,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(111), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 126:
					this.hooks.push({
						name: "Previous Area",
						destination: 112,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(112), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				case 127:
					this.hooks.push({
						name: "Previous Area",
						destination: 117,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(117), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				// Forgotten sands
				case 134:
					this.hooks.push({
						name: "Previous Area",
						destination: 109,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(109), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				// Matron's
				case 133:
					if (me.area === 133) {
						let lilith = getPresetUnit(me.area, 2, 397);

						switch (lilith.x) {
						case 11:
							entrance = {x: 20023, y: 7643};
							break;
						case 20:
							entrance = {x: 20303, y: 7803};
							break;
						case 21:
							entrance = {x: 20263, y: 7683};
							break;
						}
					}
				// Furnace
				case 135:
					if (me.area === 135) {
						let izual = getPresetUnit(me.area, 2, 397);

						switch (izual.x) {
						case 14:
							entrance = {x: 20138, y: 14873};
							break;
						case 15:
							entrance = {x: 20138, y: 14563};
							break;
						}
					}
				// Tristram
				case 136:
					if (me.area === 136) {
						entrance = {x: 25105, y: 5140};
					}

					this.hooks.push({
						name: "Previous Area",
						destination: entrance,
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(109), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
					});

					break;
				}

			}

			exits = getArea(area).exits;

			if (exits) {
				for (i = 0; i < exits.length; i += 1) {
					if (exits[i].target === this.prevAreas[me.area]) {
						this.hooks.push({
							name: "Previous Area",
							destination: this.prevAreas[me.area],
							hook: new Text("ÿc1Num 1: " + Pather.getAreaName(this.prevAreas[me.area]), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
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
							hook: new Text("ÿc3Num 0: " + Pather.getAreaName(nextAreas[me.area]), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
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
								hook: new Text("Num 0: " + Pather.getAreaName(this.prevAreas.indexOf(me.area)), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
							});

							break;
						}
					}
				}
			}

			if (me.area === getRoom().correcttomb) {
				this.hooks.push({
					name: "Next Area",
					destination: 73,
					hook: new Text("Num 0: " + Pather.getAreaName(73), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			if (me.area === 102) {
				this.hooks.push({
					name: "Next Area",
					destination: 103,
					hook: new Text("Num 0: " + Pather.getAreaName(103), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
				});
			}

			if (me.area === 131) {
				this.hooks.push({
					name: "Worldstone Chamber",
					destination: 132,
					hook: new Text("ÿc3Num 0: " + Pather.getAreaName(132), 200 + Hooks.lowerLeftResfixX, 545 - (this.hooks.length * 10) + Hooks.resfixY)
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

			Hooks.text.flush();

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

function helpMenu() {
	let hooks = [];
	let box = [];
	this.cleared = true;
	let helpBoxX = 715 + (me.screensize ? 0 : -160);
	let helpBoxY = 88 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm));
	let helpBoxTextX = 647 + (me.screensize ? 0 : -160);
	let helpBoxTextY = 88 + 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename) + Number(!!me.gameserverip && !me.realm)) + 15;

	function hookHandler (click, x, y) {
		// Get the hook closest to the clicked location
		function sortHooks(h1, h2) {
			return Math.abs(h1.y - y) - Math.abs(h2.y - y);
		}

		// Left click
		if (click === 0) {
			// Sort hooks
			hooks.sort(sortHooks);

			let cmd = hooks[0].text.split(" ")[0].split(".")[1];
			let msgList = hooks[0].text.split(" ");

			if (!hooks[0].text.includes(".")) {
				cmd = hooks[0].text.split(" ")[1];
			}

			switch (cmd) {
			case "me":
				me.overhead("Displays Character level, Area, and x/y coordinates");

				break;
			case "pick":
				me.overhead("Pick items from the ground to inventory");

				break;
			case "hide":
				me.overhead("Hide this menu");

				break;
			case "stash":
				me.overhead("Calls Town.stash() to stash items/gold from inventory");

				break;
			case "filltps":
				me.overhead("Fill tp tome");

				break;
			case "cowportal":
				me.overhead("Make cow portal as long as bot already has leg");

				break;
			case "uberportal":
				me.overhead("Make uber portal as long as bot already has ingrediants. Whole keyset or whole organ set");

				break;
			case "useraddon":
				me.overhead("Toggles useraddon mode");

				break;
			case "drop":
				switch (msgList[1]) {
				case "invo":
					me.overhead("Drop all items in the inventory");

					break;
				case "stash":
					me.overhead("Drop all items in the stash excluding the cube");

					break;
				}

				break;
			case "Ctrl":
				me.overhead("Hover over an item then press Ctrl to move that item from one area to the next. In example: Stash to Inventory, Cube to Inventory, Inventory to TradeScreen, or Inventory to Shop (sellItem)");

				break;
			default:
				me.overhead(cmd);

				break;
			}

			// Block click
			return true;
		}

		return false;
	}

	function addHook (text) {
		hooks.push(new Text("ÿc4." + text, helpBoxTextX, helpBoxTextY + 12 * hooks.length, 0, 0, 0, false, hookHandler));
	}

	this.showMenu = function () {
		this.cleared = false;

		let commands = [
			"me",
			"pick",
			"hide",
			"stash",
			"filltps",
			"cowportal",
			"uberportal",
			"useraddon",
			"drop invo",
			"drop stash",
		];

		box.push(new Box(helpBoxX, helpBoxY, 150, 165, 0x0, 1, 2));
		box.push(new Frame(helpBoxX, helpBoxY, 150, 165, 2));
		hooks.push(new Text("ÿc2Chat Commands:", helpBoxTextX, helpBoxTextY, 0, 0, 0));

		for (let i = 0; i < commands.length; i++) {
			addHook(commands[i]);
		}

		hooks.push(new Text("ÿc2Key Commands:", helpBoxTextX, helpBoxTextY + 12 * hooks.length, 0, 0, 0));
		hooks.push(new Text("ÿc4 Ctrl Key", helpBoxTextX, helpBoxTextY + 12 * hooks.length, 0, 0, 0, false, hookHandler));
	};

	this.hideMenu = function () {
		let kill;

		this.cleared = true;

		while (hooks.length) {
			kill = hooks.shift();
			kill.remove();
		}

		while (box.length) {
			kill = box.shift();
			kill.remove();
		}

		return;
	};
}

function UnitInfo() {
	this.x = 200;
	this.y = 250;
	this.hooks = [];
	this.cleared = true;

	this.createInfo = function (unit) {
		if (typeof unit === "undefined") {
			this.remove();

			return;
		}

		switch (unit.type) {
		case 0:
			this.playerInfo(unit);

			break;
		case 1:
			this.monsterInfo(unit);

			break;
		case 2:
		case 5:
			this.objectInfo(unit);

			break;
		case 4:
			this.itemInfo(unit);

			break;
		}
	};

	this.playerInfo = function (unit) {
		let i, items, string,
			frameXsize = 0,
			frameYsize = 20,
			quality = ["ÿc0", "ÿc0", "ÿc0", "ÿc0", "ÿc3", "ÿc2", "ÿc9", "ÿc4", "ÿc8"];

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));

		items = unit.getItems();

		if (items) {
			this.hooks.push(new Text("Equipped items:", this.x, this.y + 15, 4, 13, 2));
			frameYsize += 15;

			for (i = 0; i < items.length; i += 1) {
				if (items[i].getFlag(0x4000000)) {
					string = items[i].fname.split("\n")[1] + "ÿc0 " + items[i].fname.split("\n")[0];
				} else {
					string = quality[items[i].quality] + (items[i].quality > 4 && items[i].getFlag(0x10) ? items[i].fname.split("\n").reverse()[0].replace("ÿc4", "") : items[i].name);
				}

				this.hooks.push(new Text(string, this.x, this.y + (i + 2) * 15, 0, 13, 2));

				if (string.length > frameXsize) {
					frameXsize = string.length;
				}

				frameYsize += 15;
			}
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, Math.round(frameXsize * 7.5) - 4, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, Math.round(frameXsize * 7.5), frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.monsterInfo = function (unit) {
		let frameYsize = 125;

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("HP percent: ÿc0" + Math.round(unit.hp * 100 / 128), this.x, this.y + 15, 4, 13, 2));
		this.hooks.push(new Text("Fire resist: ÿc0" + unit.getStat(39), this.x, this.y + 30, 4, 13, 2));
		this.hooks.push(new Text("Cold resist: ÿc0" + unit.getStat(43), this.x, this.y + 45, 4, 13, 2));
		this.hooks.push(new Text("Lightning resist: ÿc0" + unit.getStat(41), this.x, this.y + 60, 4, 13, 2));
		this.hooks.push(new Text("Poison resist: ÿc0" + unit.getStat(45), this.x, this.y + 75, 4, 13, 2));
		this.hooks.push(new Text("Physical resist: ÿc0" + unit.getStat(36), this.x, this.y + 90, 4, 13, 2));
		this.hooks.push(new Text("Magic resist: ÿc0" + unit.getStat(37), this.x, this.y + 105, 4, 13, 2));

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 136, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 140, frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.itemInfo = function (unit) {
		let i = 0, xpos = 60, ypos = (me.getMerc() ? 80 : 20) + (-1 * Hooks.resfixY),
			frameYsize = 50;

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Code: ÿc0" + unit.code, xpos, ypos + 0, 4, 13, 2));
		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, xpos, ypos + 15, 4, 13, 2));
		this.hooks.push(new Text("Item Type: ÿc0" + unit.itemType, xpos, ypos + 30, 4, 13, 2));
		this.hooks.push(new Text("Item level: ÿc0" + unit.ilvl, xpos, ypos + 45, 4, 13, 2));

		this.cleared = false;
		this.socketedItems = unit.getItems();

		if (this.socketedItems) {
			this.hooks.push(new Text("Socketed with:", xpos, ypos + 60, 4, 13, 2));
			frameYsize += 30;

			for (i = 0; i < this.socketedItems.length; i += 1) {
				this.hooks.push(new Text(this.socketedItems[i].fname.split("\n").reverse().join(" "), xpos, ypos + (i + 5) * 15, 0, 13, 2));

				frameYsize += 15;
			}
		}

		if (unit.quality === 4 && unit.getFlag(0x10)) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));
			this.hooks.push(new Text("Suffix: ÿc0" + unit.suffixnum, xpos, ypos + frameYsize + 10, 4, 13, 2));

			frameYsize += 30;
		}

		if (unit.getFlag(0x4000000)) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));

			frameYsize += 15;
		}

		this.hooks.push(new Box(xpos + 2, ypos - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(xpos, ypos - 15, 120, frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.objectInfo = function (unit) {
		let frameYsize = 35;

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Type: ÿc0" + unit.type, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y + 15, 4, 13, 2));

		if (!!unit.objtype) {
			this.hooks.push(new Text("Destination: ÿc0" + unit.objtype, this.x, this.y + 30, 4, 13, 2));

			frameYsize += 15;
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 120, frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.remove = function () {
		while (this.hooks.length > 0) {
			this.hooks.shift().remove();
		}

		this.cleared = true;
	};
}

function main() {
	include("json2.js");
	include("NTItemParser.dbl");
	include("OOG.js");
	include("AutoMule.js");
	include("Gambling.js");
	include("CraftingSystem.js");
	include("TorchSystem.js");
	include("common/Attack.js");
	include("common/Cubing.js");
	include("common/Config.js");
	include("common/misc.js");
	include("common/util.js");
	include("common/Pickit.js");
	include("common/Pather.js");
	include("common/Precast.js");
	include("common/Prototypes.js");
	include("common/Runewords.js");
	include("common/Storage.js");
	include("common/Town.js");
	load("tools/maphelper.js");
	print("ÿc9Map Thread Loaded.");
	Config.init(false);
	Pickit.init(true);

	let i,
		hideFlags = [0x09, 0x0C, 0x01, 0x02, 0x03, 0x04, 0x0F, 0x17, 0x18, 0x19, 0x1A, 0x21, 0x05, 0x14, 0x24];

	let help = new helpMenu();

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

	this.getOnScreenLocation = function () {
		let possibleLocs = [0x17, 0x19, 0x1A, 0x0C];

		for (i = 0; i < possibleLocs.length; i++) {
			if (getUIFlag(possibleLocs[i])) {
				return possibleLocs.indexOf(possibleLocs[i]);
			}
		}

		return -1;
	};

	this.keyEvent = function (key) {
		let book, unit, qolObj = {type: false, dest: false, action: false};

		switch (key) {
		case 17: // Ctrl
			unit = getUnit(101);

			switch (this.getOnScreenLocation()) {
			case 0: // Trade screen
				if (!!unit) {
					switch (unit.location) {
					case 3:
						qolObj.type = "qol";
						qolObj.action = "moveItemFromInvoToTrade";
						scriptBroadcast(JSON.stringify(qolObj));

						break;
					case 5:
						qolObj.type = "qol";
						qolObj.action = "moveItemFromTradeToInvo";
						scriptBroadcast(JSON.stringify(qolObj));

						break;
					}
				}

				break;
			case 1: // Stash
				if (!!unit) {
					switch (unit.location) {
					case 3:
						qolObj.type = "qol";
						qolObj.action = "moveItemFromInvoToStash";
						scriptBroadcast(JSON.stringify(qolObj));

						break;
					case 7:
						qolObj.type = "qol";
						qolObj.action = "moveItemFromStashToInvo";
						scriptBroadcast(JSON.stringify(qolObj));

						break;
					}
				}

				break;
			case 2: // Cube
				if (!!unit) {
					switch (unit.location) {
					case 3:
						qolObj.type = "qol";
						qolObj.action = "moveItemFromInvoToCube";
						scriptBroadcast(JSON.stringify(qolObj));

						break;
					case 6:
						qolObj.type = "qol";
						qolObj.action = "moveItemFromCubeToInvo";
						scriptBroadcast(JSON.stringify(qolObj));

						break;
					}
				}

				break;
			case 3: // Shop
				if (!!unit) {
					qolObj.type = "qol";
					qolObj.action = "sellItem";
					scriptBroadcast(JSON.stringify(qolObj));
				}

				break;
			default:
				break;
			}

			break;
		case 53: // Numkey 5
			if (!me.inTown) {
				book = me.getItem(518);

				if (book && book.getStat(70) > 1) {
					me.overhead("Making portal...tp's left: " + book.getStat(70));
					Pather.makePortal();
				}

				break;
			}

			if (me.inTown) {
				qolObj.type = "qol";
				qolObj.action = "heal";

				if (getUIFlag(0x19) || getUIFlag(0x17) || getUIFlag(0x01)) {
					break;
				}

				scriptBroadcast(JSON.stringify(qolObj));
			}

			break;
		case 54: // Numkey 6
			if (!me.inTown) {
				book = me.getItem(518);

				if (book && book.getStat(70) > 1) {
					me.overhead("Going to town...tp's left: " + book.getStat(70));
					Pather.makePortal(true);
				}

				break;
			}

			if (me.inTown) {
				qolObj.type = "qol";
				qolObj.action = "openStash";

				if (getUIFlag(0x19) || getUIFlag(0x17) || getUIFlag(0x01)) {
					break;
				}

				scriptBroadcast(JSON.stringify(qolObj));
			}

			break;
		case 55: // Numkey 7
			if (getUIFlag(0x19) || getUIFlag(0x17) || getUIFlag(0x01) || getUIFlag(0x01) || getUIFlag(0x19) || getUIFlag(0x1A) ||
				getUIFlag(0x09) || getUIFlag(0x0C) || getUIFlag(0x02) || getUIFlag(0x0F) || getUIFlag(0x18) || getUIFlag(0x21) ||
				getUIFlag(0x05) || getUIFlag(0x14) || getUIFlag(0x24)) {
				break;
			}

			if (Hooks.items.enabled) {
				Hooks.items.enabled = false;
				Hooks.text.getHook("itemStatus").hook.text = "Key 7: Enable Item Filter";
			} else {
				Hooks.items.enabled = true;
				Hooks.text.getHook("itemStatus").hook.text = "Key 7: Disable Item Filter";
			}

			break;
		case 56: // Numkey 8
			if (getUIFlag(0x19) || getUIFlag(0x17) || getUIFlag(0x01) || getUIFlag(0x01) || getUIFlag(0x19) || getUIFlag(0x1A) ||
				getUIFlag(0x09) || getUIFlag(0x0C) || getUIFlag(0x02) || getUIFlag(0x0F) || getUIFlag(0x18) || getUIFlag(0x21) ||
				getUIFlag(0x05) || getUIFlag(0x14) || getUIFlag(0x24)) {
				break;
			}

			if (Hooks.monsters.enabled) {
				Hooks.monsters.enabled = false;
				Hooks.text.getHook("monsterStatus").hook.text = "Key 8: Enable Monsters";
			} else {
				Hooks.monsters.enabled = true;
				Hooks.text.getHook("monsterStatus").hook.text = "Key 8: Disable Monsters";
			}

			break;
		case 57: // Numkey 9
			if (getUIFlag(0x19) || getUIFlag(0x17) || getUIFlag(0x01) || getUIFlag(0x01) || getUIFlag(0x19) || getUIFlag(0x1A) ||
				getUIFlag(0x09) || getUIFlag(0x0C) || getUIFlag(0x02) || getUIFlag(0x0F) || getUIFlag(0x18) || getUIFlag(0x21) ||
				getUIFlag(0x05) || getUIFlag(0x14) || getUIFlag(0x24)) {
				break;
			}

			if (Hooks.vector.enabled) {
				Hooks.vector.enabled = false;
				Hooks.text.getHook("vectorStatus").hook.text = "Key 9: Enable Vectors";
			} else {
				Hooks.vector.enabled = true;
				Hooks.text.getHook("vectorStatus").hook.text = "Key 9: Disable Vectors";
			}

			break;
		case 109: // Numpad -
			if (getUIFlag(0x19) || getUIFlag(0x17) || getUIFlag(0x01) || getUIFlag(0x01) || getUIFlag(0x19) || getUIFlag(0x1A) ||
				getUIFlag(0x09) || getUIFlag(0x0C) || getUIFlag(0x02) || getUIFlag(0x0F) || getUIFlag(0x18) || getUIFlag(0x21) ||
				getUIFlag(0x05) || getUIFlag(0x14) || getUIFlag(0x24)) {
				break;
			}

			if (Hooks.pickitEnabled) {
				Hooks.pickitEnabled = false;
				Hooks.text.getHook("pickitEnabled").hook.text = "Num -: ÿc1Default Filter";
			} else {
				Hooks.pickitEnabled = true;
				Hooks.items.flush();
				Hooks.text.getHook("pickitEnabled").hook.text = "Num -: ÿc<Your Filter";

				if (!Hooks.saidMessage) {
					showConsole();
					print("ÿc<Notify :: ÿc0Item filter has switched to using your Pickit files, this is just to notify you of that. If you didn't add any nip files you probably should switch back.");
					print("ÿc<Notify :: ÿc0Close this console by pressing Ctrl + Home. You will not see this message again.");
					Hooks.saidMessage = true;
				}
			}

			break;
		}
	};

	//Run commands from chat
	function runCommand(msg) {
		if (msg.length <= 1) {
			return true;
		}

		let cmd = msg.split(" ")[0].split(".")[1];
		let msgList = msg.split(" ");
		let qolObj = {type: false, dest: false, action: false};

		switch (cmd.toLowerCase()) {
		case "useraddon":
			Hooks.userAddon = !Hooks.userAddon;
			me.overhead("userAddon set to " + Hooks.userAddon);

			break;
		case "me":
			print("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);
			me.overhead("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);

			break;
		case "stash":
			if (me.inTown) {
				qolObj.type = "qol";
				qolObj.action = "stashItems";
				scriptBroadcast(JSON.stringify(qolObj));
			}

			break;
		case "pick":
			qolObj.type = "qol";
			qolObj.action = "pickItems";
			scriptBroadcast(JSON.stringify(qolObj));

			break;
		case "cowportal":
			qolObj.type = "qol";
			qolObj.action = "cowportal";
			scriptBroadcast(JSON.stringify(qolObj));

			break;
		case "uberportal":
			qolObj.type = "qol";
			qolObj.action = "uberportal";
			scriptBroadcast(JSON.stringify(qolObj));

			break;
		case "filltps":
			qolObj.type = "qol";
			qolObj.action = "filltps";
			scriptBroadcast(JSON.stringify(qolObj));

			break;
		case "drop":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
				break;
			}

			qolObj.type = "drop";
			qolObj.action = msgList[1].toLowerCase();
			scriptBroadcast(JSON.stringify(qolObj));

			/*switch (msgList[1].toLowerCase()) {
			case "gold":
				if (typeof msgList[2] === 'number') {

				} else if (msgList[2].toLowerCase() === "all") {

				}

				break;
			}*/

			break;
		case "help":
			if (help.cleared) {
				help.showMenu();
			}

			break;
		case "hide":
			hideConsole();
			//Hooks.text.displayTitle = false;
			help.hideMenu();

			break;
		default:
			print("ÿc1Invalid command : " + cmd);

			break;
		}

		return true;
	}

	// Sent packet handler
	let PacketSent = function(pBytes) {
		let ID = pBytes[0].toString(16);

		if (ID === "15") { //Block all commands or irc chat from being sent to server
			if (pBytes[3] === 46) {
				let str = "";

				for (let b = 3; b < pBytes.length - 3; b++) {
					str += String.fromCharCode(pBytes[b]);
				}

				if (pBytes[3] === 46) {
					runCommand(str);
					return true;
				}
			}
		}

		return false;
	};

	let unitInfo, unit = new UnitInfo();

	addEventListener("keyup", this.keyEvent);
	addEventListener("gamepacketsent", PacketSent);

	while (true) {
		while (!me.area || !me.gameReady) {
			delay(100);
		}

		this.revealArea(me.area);

		if (getUIFlag(0x0A)) {
			Hooks.update();
		} else {
			Hooks.flush();

			if (!help.cleared) {
				help.hideMenu();
			}
		}

		if ((!getUIFlag(0x01) || !getUIFlag(0x19) || !getUIFlag(0x1A) || !getUIFlag(0x17)) && !Hooks.userAddon) {
			if (!unit.cleared) {
				unit.remove();
			}
		}

		delay(20);

		for (i = 0; i < hideFlags.length; i += 1) {
			while (getUIFlag(hideFlags[i])) {
				Hooks.flush();

				if (!help.cleared && !getUIFlag(0x05)) {
					help.hideMenu();
				}

				if ((getUIFlag(0x01) || getUIFlag(0x19) || getUIFlag(0x1A) || getUIFlag(0x17)) && Hooks.userAddon) {
					unitInfo = getUnit(101);
					unit.createInfo(unitInfo);
					delay(20);
				} else {
					if (!unit.cleared) {
						unit.remove();
					}
				}

				delay(100);
			}
		}

		if (Hooks.userAddon) {
			unitInfo = getUnit(101);
			unit.createInfo(unitInfo);
		}

		while (getUIFlag(0x0D)) {
			Hooks.items.flush();
		}
	}
}
