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
		sdk.items.type.Gold, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver,
		sdk.items.type.Scroll, sdk.items.type.Key, sdk.items.type.HealingPotion, sdk.items.type.ManaPotion,
		sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion, sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
	],
	tkable: [
		sdk.items.type.Gold, sdk.items.type.Scroll, sdk.items.type.HealingPotion, sdk.items.type.ManaPotion,
		sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion, sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
	],
	essentials: [sdk.items.type.Gold, sdk.items.type.Scroll, sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion],

	init: function (notify) {
		for (let i = 0; i < Config.PickitFiles.length; i += 1) {
			let filename = "pickit/" + Config.PickitFiles[i];

			NTIP.OpenFile(filename, notify);
		}

		// check if we can pick up items, only do this is our inventory slots aren't completly locked
		this.invoLocked = !Config.Inventory.some(row => row.some(el => el > 0));

		// sometime Storage isn't loaded?
		if (typeof Storage !== "undefined") {
			this.beltSize = Storage.BeltSize();
			// If MinColumn is set to be more than our current belt size, set it to be 1 less than the belt size 4x3 belt will give us Config.MinColumn = [2, 2, 2, 2]
			Config.MinColumn.forEach((el, index) => {
				el >= this.beltSize && (Config.MinColumn[index] = Math.max(0, this.beltSize - 1));
			});
		}
	},

	Result: {
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

		// make sure we have essentials - no pickit files loaded
		if (rval.result === Pickit.Result.UNWANTED && Config.PickitFiles.length === 0 && Pickit.essentials.includes(unit.itemType) && this.canPick(unit)) {
			return {
				result: Pickit.Result.WANTED,
				line: null
			};
		}

		if ((unit.classid === sdk.items.runes.Ort || unit.classid === sdk.items.runes.Ral) && Town.repairIngredientCheck(unit)) {
			return {
				result: Pickit.Result.UTILITY,
				line: null
			};
		}

		if (CraftingSystem.checkItem(unit)) {
			return {
				result: Pickit.Result.CRAFTING,
				line: null
			};
		}

		if (Cubing.checkItem(unit)) {
			return {
				result: Pickit.Result.CUBING,
				line: null
			};
		}

		if (Runewords.checkItem(unit)) {
			return {
				result: Pickit.Result.RUNEWORD,
				line: null
			};
		}

		if (rval.result === Pickit.Result.UNWANTED && !getBaseStat("items", unit.classid, "quest") && !Town.ignoredItemTypes.includes(unit.itemType)
			&& !unit.questItem && (unit.isInInventory || (me.gold < Config.LowGold || (me.gold < 500000 && Config.PickitFiles.length === 0)))) {
			// Gold doesn't take up room, just pick it up
			if (unit.classid === sdk.items.Gold) {
				return {
					result: Pickit.Result.TRASH,
					line: null
				};
			}

			if (!this.invoLocked) {
				const itemValue = unit.getItemCost(sdk.items.cost.ToSell);
				const itemValuePerSquare = itemValue / (unit.sizex * unit.sizey);

				if (itemValuePerSquare >= 2000) {
					// If total gold is less than 500k pick up anything worth 2k gold per square to sell in town.
					return {
						result: Pickit.Result.TRASH,
						line: "Valuable Item: " + itemValue
					};
				} else if (itemValuePerSquare >= 10) {
					// If total gold is less than LowGold setting pick up anything worth 10 gold per square to sell in town.
					return {
						result: Pickit.Result.TRASH,
						line: "LowGold Item: " + itemValue
					};
				}
			}
		}

		return rval;
	},

	pickItems: function (range = Config.PickRange) {
		if (me.dead) return false;
		
		let needMule = false;
		let pickList = [];

		Town.clearBelt();

		while (!me.idle) {
			delay(40);
		}

		let item = Game.getItem();

		if (item) {
			do {
				if (item.onGroundOrDropping && getDistance(me, item) <= range) {
					pickList.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		while (pickList.length > 0) {
			if (me.dead) return false;
			pickList.sort(this.sortItems);

			const itemToPick = pickList.shift();

			// Check if the item unit is still valid and if it's on ground or being dropped
			// Don't pick items behind walls/obstacles when walking
			if (copyUnit(itemToPick).x !== undefined && itemToPick.onGroundOrDropping
					&& (Pather.useTeleport() || me.inTown || !checkCollision(me, itemToPick, sdk.collision.BlockWall))) {
				// Check if the item should be picked
				let status = this.checkItem(itemToPick);

				if (status.result && this.canPick(itemToPick)) {
					// Override canFit for scrolls, potions and gold
					let canFit = (Storage.Inventory.CanFit(itemToPick) || Pickit.essentials.includes(itemToPick.itemType));

					// Field id when our used space is above a certain percent or if we are full try to make room with FieldID
					if (Config.FieldID.Enabled && (!canFit || Storage.Inventory.UsedSpacePercent() > Config.FieldID.UsedSpace)) {
						Town.fieldID() && (canFit = (itemToPick.gid !== undefined && Storage.Inventory.CanFit(itemToPick)));
					}

					// Try to make room by selling items in town
					if (!canFit) {
						// Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
						if (this.canMakeRoom()) {
							console.log("ÿc7Trying to make room for " + this.itemColor(itemToPick) + itemToPick.name);

							// Go to town and do town chores
							if (Town.visitTown()) {
								// Recursive check after going to town. We need to remake item list because gids can change.
								// Called only if room can be made so it shouldn't error out or block anything.

								return this.pickItems();
							}

							// Town visit failed - abort
							console.log("ÿc7Not enough room for " + this.itemColor(itemToPick) + itemToPick.name);

							return false;
						}

						// Can't make room - trigger automule
						Misc.itemLogger("No room for", itemToPick);
						console.log("ÿc7Not enough room for " + this.itemColor(itemToPick) + itemToPick.name);
						
						if (copyUnit(itemToPick).x !== undefined) {
							needMule = true;

							break;
						}
					}

					// Item can fit - pick it up
					canFit && this.pickItem(itemToPick, status.result, status.line);
				}
			}
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
				case Pickit.Result.UNID:
					// For low level chars that can't actually get id scrolls -> prevent an infinite loop
					return (me.gold > 100);
				case Pickit.Result.UNWANTED:
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
			this.gold = unit.getStat(sdk.stats.Gold);
			this.dist = (unit.distance || Infinity);
			this.useTk = (Skill.haveTK && Pickit.tkable.includes(this.type)
				&& this.dist > 5 && this.dist < 20 && !checkCollision(me, unit, sdk.collision.WallOrRanged));
			this.picked = false;
		}

		let gid = (unit.gid || -1);
		let cancelFlags = [sdk.uiflags.Inventory, sdk.uiflags.NPCMenu, sdk.uiflags.Waypoint, sdk.uiflags.Shop, sdk.uiflags.Stash, sdk.uiflags.Cube];
		let itemCount = me.itemcount;
		let item = gid > -1 ? Game.getItem(-1, -1, gid) : false;

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
			if (!Game.getItem(-1, -1, gid)) {
				break;
			}

			if (me.dead) return false;

			while (!me.idle) {
				delay(40);
			}

			if (!item.onGroundOrDropping) {
				break;
			}

			// fastPick check? should only pick items if surrounding monsters have been cleared or if fastPick is active
			// note: clear of surrounding monsters of the spectype we are set to clear
			if (stats.useTk && me.mp > tkMana) {
				Packet.telekinesis(item);
			} else {
				if (item.distance > (Config.FastPick || i < 1 ? 6 : 4) || checkCollision(me, item, sdk.collision.BlockWall)) {
					if (!Pather.moveToUnit(item)) {
						continue;
					}
				}

				// use packet first, if we fail and not using fast pick use click
				(Config.FastPick || i < 1) ? Packet.click(item) : Misc.click(0, 0, item);
			}

			let tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				item = copyUnit(item);

				if (stats.classid === sdk.items.Gold) {
					if (!item.getStat(sdk.stats.Gold) || item.getStat(sdk.stats.Gold) < stats.gold) {
						console.log("ÿc7Picked up " + stats.color + (item.getStat(sdk.stats.Gold) ? (item.getStat(sdk.stats.Gold) - stats.gold) : stats.gold) + " " + stats.name);

						return true;
					}
				}

				if (!item.onGroundOrDropping) {
					switch (stats.classid) {
					case sdk.items.Key:
						console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

						return true;
					case sdk.items.ScrollofTownPortal:
					case sdk.items.ScrollofIdentify:
						console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkScrolls(stats.classid === sdk.items.ScrollofTownPortal ? "tbk" : "ibk") + "/20)");

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
			case Pickit.Result.WANTED:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

				if (this.ignoreLog.indexOf(stats.type) === -1) {
					Misc.itemLogger("Kept", item);
					Misc.logItem("Kept", item, keptLine);
				}

				break;
			case Pickit.Result.CUBING:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
				Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
				Cubing.update();

				break;
			case Pickit.Result.RUNEWORD:
				console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
				Misc.itemLogger("Kept", item, "Runewords");
				Runewords.update(stats.classid, gid);

				break;
			case Pickit.Result.CRAFTING:
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
			case sdk.items.type.Gold:
				return "ÿc4";
			case sdk.items.type.Rune:
				return "ÿc8";
			case sdk.items.type.HealingPotion:
				return "ÿc1";
			case sdk.items.type.ManaPotion:
				return "ÿc3";
			case sdk.items.type.RejuvPotion:
				return "ÿc;";
			}
		}

		switch (unit.quality) {
		case sdk.items.quality.Magic:
			return "ÿc3";
		case sdk.items.quality.Set:
			return "ÿc2";
		case sdk.items.quality.Rare:
			return "ÿc9";
		case sdk.items.quality.Unique:
			return "ÿc4";
		case sdk.items.quality.Crafted:
			return "ÿc8";
		}

		return "ÿc0";
	},

	canPick: function (unit) {
		if (!unit) return false;

		if (sdk.quest.items.includes(unit.classid) && me.getItem(unit.classid)) {
			return false;
		}

		let tome, charm, potion, needPots, buffers, pottype, myKey, key;

		switch (unit.itemType) {
		case sdk.items.type.Gold:
			// Check current gold vs max capacity (cLvl*10000)
			if (me.getStat(sdk.stats.Gold) === me.getStat(sdk.stats.Level) * 10000) {
				return false; // Skip gold if full
			}

			break;
		case sdk.items.type.Scroll:
			// 518 - Tome of Town Portal or 519 - Tome of Identify
			tome = me.getItem(unit.classid - 11, sdk.items.mode.inStorage);

			if (tome) {
				do {
					// In inventory, contains 20 scrolls
					if (tome.isInInventory && tome.getStat(sdk.stats.Quantity) === 20) {
						return false; // Skip a scroll if its tome is full
					}
				} while (tome.getNext());
			} else {
				return false; // Don't pick scrolls if there's no tome
			}

			break;
		case sdk.items.type.Key:
			// Assassins don't ever need keys
			if (me.assassin) return false;

			myKey = me.getItem(sdk.items.Key, sdk.items.mode.inStorage);
			key = Game.getItem(-1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

			if (myKey && key) {
				do {
					if (myKey.isInInventory && myKey.getStat(sdk.stats.Quantity) + key.getStat(sdk.stats.Quantity) > 12) {
						return false;
					}
				} while (myKey.getNext());
			}

			break;
		case sdk.items.type.SmallCharm:
		case sdk.items.type.LargeCharm:
		case sdk.items.type.GrandCharm:
			if (unit.unique) {
				charm = me.getItem(unit.classid, sdk.items.mode.inStorage);

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
		case sdk.items.type.HealingPotion:
		case sdk.items.type.ManaPotion:
		case sdk.items.type.RejuvPotion:
			needPots = 0;

			for (let i = 0; i < 4; i += 1) {
				if (typeof unit.code === "string" && unit.code.includes(Config.BeltColumn[i])) {
					needPots += this.beltSize;
				}
			}

			potion = me.getItem(-1, sdk.items.mode.inBelt);

			if (potion) {
				do {
					if (potion.itemType === unit.itemType) {
						needPots -= 1;
					}
				} while (potion.getNext());
			}

			if (needPots < 1 && this.checkBelt()) {
				buffers = ["HPBuffer", "MPBuffer", "RejuvBuffer"];

				for (let i = 0; i < buffers.length; i += 1) {
					if (Config[buffers[i]]) {
						switch (buffers[i]) {
						case "HPBuffer":
							pottype = sdk.items.type.HealingPotion;

							break;
						case "MPBuffer":
							pottype = sdk.items.type.ManaPotion;

							break;
						case "RejuvBuffer":
							pottype = sdk.items.type.RejuvPotion;

							break;
						}

						if (unit.itemType === pottype) {
							if (!Storage.Inventory.CanFit(unit)) return false;

							needPots = Config[buffers[i]];
							potion = me.getItem(-1, sdk.items.mode.inStorage);

							if (potion) {
								do {
									if (potion.itemType === pottype && potion.location === sdk.storage.Inventory) {
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
						if (potion.itemType === unit.itemType && (potion.isInInventory || potion.isInBelt)) {
							if (potion.classid < unit.classid) {
								potion.use();
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
			console.warn("undefined item (!?)");

			return false;
		}

		return true;
	},

	checkBelt: function () {
		let check = 0;
		let item = me.getItem(-1, sdk.items.mode.inBelt);

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
		if (unitA.itemType === sdk.items.type.Rune || unitA.unique) return -1;
		if (unitB.itemType === sdk.items.type.Rune || unitB.unique) return 1;

		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	fastPick: function (retry = 3) {
		let item, itemList = [];

		while (this.gidList.length > 0) {
			let gid = this.gidList.shift();
			item = Game.getItem(-1, -1, gid);

			if (item && item.onGroundOrDropping
				&& (Town.ignoredItemTypes.indexOf(item.itemType) === -1 || (item.itemType >= sdk.items.type.HealingPotion && item.itemType <= sdk.items.type.RejuvPotion))
				&& item.itemType !== sdk.items.type.Gold && getDistance(me, item) <= Config.PickRange) {
				itemList.push(copyUnit(item));
			}
		}

		while (itemList.length > 0) {
			itemList.sort(this.sortFastPickItems);
			item = copyUnit(itemList.shift());

			// Check if the item unit is still valid
			if (item.x !== undefined) {
				let status = this.checkItem(item);

				if (status.result && this.canPick(item) && (Storage.Inventory.CanFit(item) || Pickit.essentials.includes(item.itemType))) {
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
