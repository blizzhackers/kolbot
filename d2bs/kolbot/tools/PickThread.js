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
