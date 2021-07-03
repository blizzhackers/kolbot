/**
*	@filename	PickThread.js
*	@author		stffdtiger
*	@desc		a loop that runs Pickit.FastPick() intended to be used with D2BotMap entry script
*/

js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("CraftingSystem.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");

function main() {
	print("ÿc9Pick Thread Loaded.");
	Config.init(false);
	Pickit.init(false);
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	var ii, noPick = false,
		UIFlagList = [0x01, 0x02, 0x03, 0x04, 0x05, 0x09, 0x0B, 0x0E, 0x0F, 0x14, 0x16, 0x1A, 0x24];

	this.itemEvent = function (gid, mode, code, global) {
		if (gid > 0 && mode === 0) {
			Pickit.gidList.push(gid);
		}
	};

	addEventListener("itemaction", this.itemEvent);

	while (true) {
		for (ii = 0 ; ii < UIFlagList.length ; ii++) {
			if (getUIFlag(UIFlagList[ii])) {
				noPick = true;
				break;
			}
		}
		if (!me.inTown && !noPick) {
			Pickit.fastPick();
		}
		noPick = false;
		delay(50);
	}
	return true;
}

Pickit.pickItem = function (unit, status, keptLine) {
	function ItemStats(unit) {
		this.ilvl = unit.ilvl;
		this.type = unit.itemType;
		this.classid = unit.classid;
		this.name = unit.name;
		this.color = Pickit.itemColor(unit);
		this.gold = unit.getStat(14);
		this.useTk = Config.UseTelekinesis && me.classid === 1 && me.getSkill(43, 1) && (this.type === 4 || this.type === 22 || (this.type > 75 && this.type < 82)) &&
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

		let preSkill = me.getSkill(2);

		if (stats.useTk) {
			Skill.cast(43, 0, item);
		} else {
			if (getDistance(me, item) > (Config.FastPick === 2 && i < 1 ? 6 : 4) || checkCollision(me, item, 0x1)) {
				if (Pather.useTeleport()) {
					Pather.moveToUnit(item);
				} else if (!Pather.moveTo(item.x, item.y, 0)) {
					continue MainLoop;
				}
			}

			if (Config.FastPick < 2) {
				Misc.click(0, 0, item);
			} else {
				sendPacket(1, 0x16, 4, 0x4, 4, item.gid, 4, 0);
			}
		}

		if (me.getSkill(2) !== preSkill) {
			Skill.setSkill(preSkill, 0);
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
}