/**
*  @filename    Pickit.js
*  @author      kolton, theBGuy
*  @desc        handle item pickup
*
*/

const Pickit = {
	gidList: [],
	invoLocked: true,
	beltSize: 1,
	// Ignored item types for item logging
	ignoreLog: [
		sdk.itemtype.Gold, sdk.itemtype.BowQuiver, sdk.itemtype.CrossbowQuiver,
		sdk.itemtype.Scroll, sdk.itemtype.Key, sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion,
		sdk.itemtype.RejuvPotion, sdk.itemtype.StaminaPotion, sdk.itemtype.AntidotePotion, sdk.itemtype.ThawingPotion
	],
	essentials: [sdk.itemtype.Gold, sdk.itemtype.Scroll, sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion],

	init: function (notify) {
		for (let i = 0; i < Config.PickitFiles.length; i += 1) {
			let filename = "pickit/" + Config.PickitFiles[i];

			NTIP.OpenFile(filename, notify);
		}

		// check if we can pick up items, only do this is our inventory slots aren't completly locked
		this.invoLocked = !Config.Inventory.some(row => row.some(el => el > 0));
		this.beltSize = Storage.BeltSize();
		// If MinColumn is set to be more than our current belt size, set it to be 1 less than the belt size 4x3 belt will give us Config.MinColumn = [2, 2, 2, 2]
		Config.MinColumn.forEach((el, index) => {
			el >= this.beltSize && (Config.MinColumn[index] = Math.max(0, this.beltSize - 2));
		});
	},

	result: {
		UNID: -1,
		UNWANTED: 0,
		WANTED: 1,
		CUBING: 2,
		RUNEWORD: 3,
		TRASH: 4,
		CRAFTING: 5,
		UTILITY: 6
	},

	// Returns:
	// -1 - Needs iding
	// 0 - Unwanted
	// 1 - NTIP wants
	// 2 - Cubing wants
	// 3 - Runeword wants
	// 4 - Pickup to sell (triggered when low on gold)
	checkItem: function (unit) {
		let rval = NTIP.CheckItem(unit, false, true);

		if ((unit.classid === sdk.items.runes.Ort || unit.classid === sdk.items.runes.Ral) && Town.repairIngredientCheck(unit)) {
			return {
				result: Pickit.result.UTILITY,
				line: null
			};
		}

		if (CraftingSystem.checkItem(unit)) {
			return {
				result: Pickit.result.CRAFTING,
				line: null
			};
		}

		if (Cubing.checkItem(unit)) {
			return {
				result: Pickit.result.CUBING,
				line: null
			};
		}

		if (Runewords.checkItem(unit)) {
			return {
				result: Pickit.result.RUNEWORD,
				line: null
			};
		}

		if (rval.result === 0 && !getBaseStat("items", unit.classid, "quest") && !Town.ignoredItemTypes.includes(unit.itemType)
			&& !unit.questItem && (unit.isInInventory || (me.gold < Config.LowGold || me.gold < 500000))) {
			// Gold doesn't take up room, just pick it up
			if (unit.classid === sdk.items.Gold) {
				return {
					result: 4,
					line: null
				};
			}

			if (!this.invoLocked) {
				let itemValuePerSquare = unit.getItemCost(1) / (unit.sizex * unit.sizey);

				if (itemValuePerSquare >= 2000) {
					// If total gold is less than 500k pick up anything worth 2k gold per square to sell in town.
					return {
						result: 4,
						line: "Valuable Item: " + unit.getItemCost(1)
					};
				} else if (itemValuePerSquare >= 10) {
					// If total gold is less than LowGold setting pick up anything worth 10 gold per square to sell in town.
					return {
						result: 4,
						line: "LowGold Item: " + unit.getItemCost(1)
					};
				}
			}
		}

		// make sure we have essentials - no pickit files loaded
		if (rval.result === 0 && Config.PickitFiles.length === 0 && Pickit.essentials.includes(unit.itemType) && this.canPick(unit)) {
			return {
				result: Pickit.result.WANTED,
				line: null
			};
		}

		return rval;
	},

	pickItems: function (range = Config.PickRange) {
		let needMule = false;
		let pickList = [];

		Town.clearBelt();

		if (me.dead) return false;

		while (!me.idle) {
			delay(40);
		}

		let item = getUnit(4);

		if (item) {
			do {
				if ((item.mode === 3 || item.mode === 5) && getDistance(me, item) <= range) {
					pickList.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		while (pickList.length > 0) {
			if (me.dead) return false;

			pickList.sort(this.sortItems);

			// Check if the item unit is still valid and if it's on ground or being dropped
			// Don't pick items behind walls/obstacles when walking
			if (copyUnit(pickList[0]).x !== undefined && (pickList[0].mode === 3 || pickList[0].mode === 5)
					&& (Pather.useTeleport() || me.inTown || !checkCollision(me, pickList[0], 0x1))) {
				// Check if the item should be picked
				let status = this.checkItem(pickList[0]);

				if (status.result && this.canPick(pickList[0])) {
					// Override canFit for scrolls, potions and gold
					let canFit = (Storage.Inventory.CanFit(pickList[0]) || Pickit.essentials.includes(pickList[0].itemType));

					// Field id when our used space is above a certain percent or if we are full try to make room with FieldID
					if (Config.FieldID.Enabled && (!canFit || Storage.Inventory.UsedSpacePercent() > Config.FieldID.UsedSpace)) {
						Town.fieldID() && (canFit = (pickList[0].gid !== undefined && Storage.Inventory.CanFit(pickList[0])));
					}

					// Try to make room by selling items in town
					if (!canFit) {
						// Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
						if (this.canMakeRoom()) {
							print("ÿc7Trying to make room for " + this.itemColor(pickList[0]) + pickList[0].name);

							// Go to town and do town chores
							if (Town.visitTown()) {
								// Recursive check after going to town. We need to remake item list because gids can change.
								// Called only if room can be made so it shouldn't error out or block anything.

								return this.pickItems();
							}

							// Town visit failed - abort
							print("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

							return false;
						}

						// Can't make room - trigger automule
						Misc.itemLogger("No room for", pickList[0]);
						print("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

						needMule = true;
					}

					// Item can fit - pick it up
					canFit && this.pickItem(pickList[0], status.result, status.line);
				}
			}

			pickList.shift();
		}

		// Quit current game and transfer the items to mule
		if (needMule && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo") && AutoMule.getMuleItems().length > 0) {
			scriptBroadcast("mule");
			scriptBroadcast("quit");
		}

		return true;
	},

	// Check if we can even free up the inventory
	canMakeRoom: function () {
		if (!Config.MakeRoom) return false;

		let items = Storage.Inventory.Compare(Config.Inventory);

		if (items) {
			for (let i = 0; i < items.length; i += 1) {
				switch (this.checkItem(items[i]).result) {
				case Pickit.result.UNID:
					// For low level chars that can't actually get id scrolls -> prevent an infinite loop
					return (me.gold > 100);
				case Pickit.result.UNWANTED:
					break;
				default: // Check if a kept item can be stashed
					if (Town.canStash(items[i])) {
						return true;
					}

					break;
				}
			}
		}

		return false;
	},

	pickItem: function (unit, status, keptLine, retry = 3) {
		function ItemStats (unit) {
			this.ilvl = unit.ilvl;
			this.type = unit.itemType;
			this.classid = unit.classid;
			this.name = unit.name;
			this.color = Pickit.itemColor(unit);
			this.gold = unit.getStat(14);
			this.dist = (unit.distance || Infinity);
			this.useTk = (Skill.haveTK && Config.UseTelekinesis
				&& (this.type === 4 || this.type === 22 || (this.type > 75 && this.type < 82))
				&& this.dist > 5 && this.dist < 20 && !checkCollision(me, unit, 0x5));
			this.picked = false;
		}

		let gid = (unit.gid || -1);
		let cancelFlags = [sdk.uiflags.Inventory, sdk.uiflags.NPCMenu, sdk.uiflags.Waypoint, sdk.uiflags.Shop, sdk.uiflags.Stash, sdk.uiflags.Cube];
		let itemCount = me.itemcount;
		let item = gid > -1 ? getUnit(4, -1, -1, gid) : false;

		if (!item) return false;

		for (let i = 0; i < cancelFlags.length; i += 1) {
			if (getUIFlag(cancelFlags[i])) {
				delay(500);
				me.cancel(0);

				break;
			}
		}

		let stats = new ItemStats(item);
		let tkMana = stats.useTk ? Skill.getManaCost(sdk.skills.Telekinesis) * 2 : Infinity;

		MainLoop:
		for (let i = 0; i < retry; i += 1) {
			if (!getUnit(4, -1, -1, gid)) {
				break;
			}

			if (me.dead) return false;

			while (!me.idle) {
				delay(40);
			}

			if (item.mode !== 3 && item.mode !== 5) {
				break;
			}

			// fastPick check? should only pick items if surrounding monsters have been cleared or if fastPick is active
			// note: clear of surrounding monsters of the spectype we are set to clear
			if (stats.useTk && me.mp > tkMana) {
				Skill.setSkill(sdk.skills.Telekinesis, 0) && Packet.unitCast(0, item);
			} else {
				if (item.distance > (Config.FastPick || i < 1 ? 6 : 4) || checkCollision(me, item, 0x1)) {
					if (!Pather.moveToUnit(item)) {
						continue;
					}
				}

				// use packet first, if we fail and not using fast pick use click
				(Config.FastPick || i < 1) ? sendPacket(1, 0x16, 4, 0x4, 4, gid, 4, 0) : Misc.click(0, 0, item);
			}

			let tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				item = copyUnit(item);

				if (stats.classid === sdk.items.Gold) {
					if (!item.getStat(14) || item.getStat(14) < stats.gold) {
						print("ÿc7Picked up " + stats.color + (item.getStat(14) ? (item.getStat(14) - stats.gold) : stats.gold) + " " + stats.name);

						return true;
					}
				}

				if (item.mode !== 3 && item.mode !== 5) {
					switch (stats.classid) {
					case sdk.items.Key:
						print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

						return true;
					case sdk.items.ScrollofTownPortal:
					case sdk.items.ScrollofIdentify:
						print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkScrolls(stats.classid === sdk.items.ScrollofTownPortal ? "tbk" : "ibk") + "/20)");

						return true;
					}

					break MainLoop;
				}

				delay(20);
			}

			// TK failed, disable it
			stats.useTk = false;
		}

		stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

		if (stats.picked) {
			DataFile.updateStats("lastArea");

			switch (status) {
			case Pickit.result.WANTED:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

				if (this.ignoreLog.indexOf(stats.type) === -1) {
					Misc.itemLogger("Kept", item);
					Misc.logItem("Kept", item, keptLine);
				}

				break;
			case Pickit.result.CUBING:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
				Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
				Cubing.update();

				break;
			case Pickit.result.RUNEWORD:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
				Misc.itemLogger("Kept", item, "Runewords");
				Runewords.update(stats.classid, gid);

				break;
			case Pickit.result.CRAFTING:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Crafting System)");
				CraftingSystem.update(item);

				break;
			default:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

				break;
			}
		}

		return true;
	},

	itemQualityToName: function (quality) {
		let qualNames = ["", "lowquality", "normal", "superior", "magic", "set", "rare", "unique", "crafted"];
		return qualNames[quality];
	},

	itemColor: function (unit, type) {
		type === undefined && (type = true);

		if (type) {
			switch (unit.itemType) {
			case sdk.itemtype.Gold:
				return "ÿc4";
			case sdk.itemtype.Rune:
				return "ÿc8";
			case sdk.itemtype.HealingPotion:
				return "ÿc1";
			case sdk.itemtype.ManaPotion:
				return "ÿc3";
			case sdk.itemtype.RejuvPotion:
				return "ÿc;";
			}
		}

		switch (unit.quality) {
		case sdk.itemquality.Magic:
			return "ÿc3";
		case sdk.itemquality.Set:
			return "ÿc2";
		case sdk.itemquality.Rare:
			return "ÿc9";
		case sdk.itemquality.Unique:
			return "ÿc4";
		case sdk.itemquality.Crafted:
			return "ÿc8";
		}

		return "ÿc0";
	},

	canPick: function (unit) {
		if (!unit) return false;

		let tome, charm, i, potion, needPots, buffers, pottype, myKey, key;

		if (sdk.quest.items.includes(unit.classid)) {
			if (me.getItem(unit.classid)) {
				return false;
			}
		}

		switch (unit.itemType) {
		case sdk.itemtype.Gold:
			// Check current gold vs max capacity (cLvl*10000)
			if (me.getStat(14) === me.getStat(12) * 10000) {
				return false; // Skip gold if full
			}

			break;
		case sdk.itemtype.Scroll:
			tome = me.getItem(unit.classid - 11, 0); // 518 - Tome of Town Portal or 519 - Tome of Identify, mode 0 - inventory/stash

			if (tome) {
				do {
					// In inventory, contains 20 scrolls
					if (tome.location === 3 && tome.getStat(sdk.stats.Quantity) === 20) {
						return false; // Skip a scroll if its tome is full
					}
				} while (tome.getNext());
			} else {
				return false; // Don't pick scrolls if there's no tome
			}

			break;
		case sdk.itemtype.Key:
			// Assassins don't ever need keys
			if (me.assassin) return false;

			myKey = me.getItem(543, 0);
			key = getUnit(4, -1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

			if (myKey && key) {
				do {
					if (myKey.location === 3 && myKey.getStat(sdk.stats.Quantity) + key.getStat(sdk.stats.Quantity) > 12) {
						return false;
					}
				} while (myKey.getNext());
			}

			break;
		case sdk.itemtype.SmallCharm: // Small Charm
		case sdk.itemtype.MediumCharm: // Large Charm
		case sdk.itemtype.LargeCharm: // Grand Charm
			if (unit.unique) {
				charm = me.getItem(unit.classid, 0);

				if (charm) {
					do {
						// Skip Gheed's Fortune, Hellfire Torch or Annihilus if we already have one
						if (charm.unique) {
							return false;
						}
					} while (charm.getNext());
				}
			}

			break;
		case sdk.itemtype.HealingPotion:
		case sdk.itemtype.ManaPotion:
		case sdk.itemtype.RejuvPotion:
			needPots = 0;

			for (i = 0; i < 4; i += 1) {
				if (typeof unit.code === "string" && unit.code.indexOf(Config.BeltColumn[i]) > -1) {
					needPots += this.beltSize;
				}
			}

			potion = me.getItem(-1, 2);

			if (potion) {
				do {
					if (potion.itemType === unit.itemType) {
						needPots -= 1;
					}
				} while (potion.getNext());
			}

			if (needPots < 1 && this.checkBelt()) {
				buffers = ["HPBuffer", "MPBuffer", "RejuvBuffer"];

				for (i = 0; i < buffers.length; i += 1) {
					if (Config[buffers[i]]) {
						switch (buffers[i]) {
						case "HPBuffer":
							pottype = sdk.itemtype.HealingPotion;

							break;
						case "MPBuffer":
							pottype = sdk.itemtype.ManaPotion;

							break;
						case "RejuvBuffer":
							pottype = sdk.itemtype.RejuvPotion;

							break;
						}

						if (unit.itemType === pottype) {
							if (!Storage.Inventory.CanFit(unit)) return false;

							needPots = Config[buffers[i]];
							potion = me.getItem(-1, 0);

							if (potion) {
								do {
									if (potion.itemType === pottype && potion.location === 3) {
										needPots -= 1;
									}
								} while (potion.getNext());
							}
						}
					}
				}
			}

			if (needPots < 1) {
				potion = me.getItem();

				if (potion) {
					do {
						if (potion.itemType === unit.itemType && ((potion.mode === 0 && potion.location === 3) || potion.mode === 2)) {
							if (potion.classid < unit.classid) {
								potion.interact();
								needPots += 1;

								break;
							}
						}
					} while (potion.getNext());
				}
			}

			if (needPots < 1) {
				return false;
			}

			break;
		case undefined: // Yes, it does happen
			print("undefined item (!?)");

			return false;
		}

		return true;
	},

	checkBelt: function () {
		let check = 0;
		let item = me.getItem(-1, 2);

		if (item) {
			do {
				if (item.x < 4) {
					check += 1;
				}
			} while (item.getNext());
		}

		return check === 4;
	},

	// Just sort by distance for general item pickup
	sortItems: function (unitA, unitB) {
		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	// Prioritize runes and unique items for fast pick
	sortFastPickItems: function (unitA, unitB) {
		if (unitA.itemType === sdk.itemtype.Rune || unitA.unique) return -1;
		if (unitB.itemType === sdk.itemtype.Rune || unitB.unique) return 1;

		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	fastPick: function (retry = 3) {
		let item, itemList = [];

		while (this.gidList.length > 0) {
			let gid = this.gidList.shift();
			item = getUnit(4, -1, -1, gid);

			if (item && (item.mode === 3 || item.mode === 5)
				&& (Town.ignoredItemTypes.indexOf(item.itemType) === -1 || (item.itemType >= sdk.itemtype.HealingPotion && item.itemType <= sdk.itemtype.RejuvPotion))
				&& item.itemType !== sdk.itemtype.Gold && getDistance(me, item) <= Config.PickRange) {
				itemList.push(copyUnit(item));
			}
		}

		while (itemList.length > 0) {
			itemList.sort(this.sortFastPickItems);
			item = copyUnit(itemList.shift());

			// Check if the item unit is still valid
			if (item.x !== undefined) {
				let status = this.checkItem(item);

				if (status.result && this.canPick(item) && (Storage.Inventory.CanFit(item) || Pickit.essentials.includes(unit.itemType))) {
					this.pickItem(item, status.result, status.line, retry);
				}
			}
		}

		return true;
	},

	// eslint-disable-next-line no-unused-vars
	itemEvent: function (gid, mode, code, global) {
		if (gid > 0 && mode === 0) {
			Pickit.gidList.push(gid);
		}
	}
};
