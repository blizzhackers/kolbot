/*
*	@filename	PickitOverrides.js
*	@author		isid0re
*	@desc		modified pickit.js based on from PBP autoplays (Sonic, AutoSorc, etc)
*	@credits	theBGuy (for customized logging from pbp pickit.js), kolton
*/

if (!isIncluded("common/Pickit.js")) {
	include("common/Pickit.js");
}

if (!isIncluded("SoloLeveling/Functions/NTIPOverrides.js")) {
	include("SoloLeveling/Functions/NTIPOverrides.js");
}

if (!isIncluded("SoloLeveling/Functions/MiscOverrides.js")) {
	include("SoloLeveling/Functions/MiscOverrides.js");
}

if (!isIncluded("SoloLeveling/Functions/ProtoTypesOverrides.js")) {
	include("SoloLeveling/Functions/ProtoTypesOverrides.js");
}

Pickit.checkItem = function (unit) {
	var rvalTier = NTIP.CheckItem(unit, false, true),
		rvalNoTier = NTIP.CheckItem(unit, NTIP_CheckListNoTier, true);

	if ((unit.classid === 617 || unit.classid === 618) && Town.repairIngredientCheck(unit)) {
		return {
			result: 6,
			line: null
		};
	}

	if (CraftingSystem.checkItem(unit)) {
		return {
			result: 5,
			line: null
		};
	}

	if (Cubing.checkItem(unit)) {
		return {
			result: 2,
			line: null
		};
	}

	if (Runewords.checkItem(unit)) {
		return {
			result: 3,
			line: null
		};
	}

	if ((NTIP.GetCharmTier(unit) > -1 || NTIP.GetMercTier(unit) > -1 || NTIP.GetTier(unit) > -1) && !unit.getFlag(0x10)) {
		return {
			result: -1,
			line: null
		};
	}

	if ((NTIP.GetCharmTier(unit) > -1 || NTIP.GetMercTier(unit) > -1 || NTIP.GetTier(unit) > -1) && unit.getFlag(0x10)) {
		if (Item.autoEquipCheck(unit)) {
			return {
				result: 1,
				line: "Autoequip Tier: " + NTIP.GetTier(unit)
			};
		}

		if (Item.autoEquipCheckMerc(unit)) {
			return {
				result: 1,
				line: "Autoequip MercTier: " + NTIP.GetMercTier(unit)
			};
		}

		if (Item.autoEquipCheckCharm(unit)) {
			return {
				result: 1,
				line: "Autoequip CharmTier: " + NTIP.GetCharmTier(unit)
			};
		}

		return rvalNoTier;
	}

	if (rvalNoTier.result === 1) { // if no_tier wanted
		return rvalNoTier;
	}

	if (rvalTier.result === 0 && rvalNoTier.result === 0 && !getBaseStat("items", unit.classid, "quest") && Town.ignoredItemTypes.indexOf(unit.itemType) === -1 && unit.itemType !== 39 && (unit.location === 3 || me.gold < Config.LowGold)) {
		// Gold doesn't take up room, just pick it up
		if (unit.classid === 523) {
			return {
				result: 4,
				line: null
			};
		}

		if (unit.getItemCost(1) / (unit.sizex * unit.sizey) >= 10) {
			return {
				result: 4,
				line: null
			};
		}
	}

	return rvalTier;
};

Pickit.pickItems = function () {
	var status, item, canFit,
		needMule = false,
		pickList = [];

	Town.clearBelt();

	if (me.dead) {
		return false;
	}

	while (!me.idle) {
		delay(40);
	}

	item = getUnit(4);

	if (item) {
		do {
			if ((item.mode === 3 || item.mode === 5) && getDistance(me, item) <= Config.PickRange) {
				pickList.push(copyUnit(item));
			}
		} while (item.getNext());
	}

	while (pickList.length > 0) {
		if (me.dead) {
			return false;
		}

		pickList.sort(this.sortItems);

		// Check if the item unit is still valid and if it's on ground or being dropped
		if (copyUnit(pickList[0]).x !== undefined && (pickList[0].mode === 3 || pickList[0].mode === 5) && (Pather.useTeleport() || me.inTown || !checkCollision(me, pickList[0], 0x1))) { // Don't pick items behind walls/obstacles when walking
			// Check if the item should be picked
			status = this.checkItem(pickList[0]);

			if (status.result && Pickit.canPick(pickList[0])) {
				// Override canFit for scrolls, potions and gold
				canFit = Storage.Inventory.CanFit(pickList[0]) || [4, 22, 76, 77, 78].indexOf(pickList[0].itemType) > -1;

				// Try to make room with FieldID
				if (!canFit && Config.FieldID && Town.fieldID()) {
					canFit = Storage.Inventory.CanFit(pickList[0]) || [4, 22, 76, 77, 78].indexOf(pickList[0].itemType) > -1;
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
				if (canFit) {
					this.pickItem(pickList[0], status.result, status.line);
				}
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
};

Pickit.pickItem = function (unit, status, keptLine) {
	function ItemStats (unit) {
		this.ilvl = unit.ilvl;
		this.type = unit.itemType;
		this.classid = unit.classid;
		this.name = unit.name;
		this.color = Pickit.itemColor(unit);
		this.gold = unit.getStat(14);
		this.useTk = Config.UseTelekinesis && me.sorceress && me.getSkill(43, 1) && (this.type === 4 || this.type === 22 || (this.type > 75 && this.type < 82)) &&
					getDistance(me, unit) > 5 && getDistance(me, unit) < 20 && !checkCollision(me, unit, 0x4);
		this.picked = false;
	}

	var i, item, tick, gid, stats,
		cancelFlags = [0x01, 0x08, 0x14, 0x0c, 0x19, 0x1a],
		itemCount = me.itemcount;

	if (unit.gid) {
		gid = unit.gid;
		item = getUnit(4, -1, -1, gid);
	}

	if (!item) {
		return false;
	}

	for (i = 0; i < cancelFlags.length; i += 1) {
		if (getUIFlag(cancelFlags[i])) {
			delay(500);
			me.cancel(0);

			break;
		}
	}

	stats = new ItemStats(item);

	MainLoop:
	for (i = 0; i < 3; i += 1) {
		if (!getUnit(4, -1, -1, gid)) {
			break MainLoop;
		}

		if (me.dead) {
			return false;
		}

		while (!me.idle) {
			delay(40);
		}

		if (item.mode !== 3 && item.mode !== 5) {
			break MainLoop;
		}

		if (stats.useTk) {
			Skill.cast(43, 0, item);
		} else {
			if (getDistance(me, item) > (i < 1 ? 6 : 4) || checkCollision(me, item, 0x1)) {
				if (Pather.useTeleport()) {
					Pather.moveToUnit(item);
				} else if (!Pather.moveTo(item.x, item.y, 0)) {
					continue MainLoop;
				}
			}

			sendPacket(1, 0x16, 4, 0x4, 4, item.gid, 4, 0);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			item = copyUnit(item);

			if (stats.classid === 523) {
				if (!item.getStat(14) || item.getStat(14) < stats.gold) {
					print("ÿc7Picked up " + stats.color + (item.getStat(14) ? (item.getStat(14) - stats.gold) : stats.gold) + " " + stats.name);

					return true;
				}
			}

			if (item.mode !== 3 && item.mode !== 5) {
				switch (stats.classid) {
				case 543: // Key
					print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

					return true;
				case 529: // Scroll of Town Portal
				case 530: // Scroll of Identify
					print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkScrolls(stats.classid === 529 ? "tbk" : "ibk") + "/20)");

					return true;
				}

				break MainLoop;
			}

			delay(20);
		}

		// TK failed, disable it
		stats.useTk = false;

		//print("pick retry");
	}

	stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

	if (stats.picked) {
		DataFile.updateStats("lastArea");

		switch (status) {
		case 1:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

			if (this.ignoreLog.indexOf(stats.type) === -1) {
				Misc.itemLogger("Kept", item);
				Misc.logItem("Kept", item, keptLine);
			}

			break;
		case 2:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
			Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
			Cubing.update();

			break;
		case 3:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
			Misc.itemLogger("Kept", item, "Runewords");
			Runewords.update(stats.classid, gid);

			break;
		case 5: // Crafting System
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")" + " (Crafting System)");
			CraftingSystem.update(item);

			break;
		default:
			print("ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

			break;
		}
	}

	return true;
};
