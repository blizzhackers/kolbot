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
include("common/util.js");

includeCommonLibs();

// MapMode
include("manualplay/MapMode.js");
MapMode.include();

function main() {
	print("ÿc9Pick Thread Loaded.");
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	let noPick = false,
		UIFlagList = [0x01, 0x02, 0x03, 0x04, 0x05, 0x09, 0x0B, 0x0E, 0x0F, 0x14, 0x16, 0x1A, 0x24];

	addEventListener("itemaction", Pickit.itemEvent);

	while (true) {
		for (let i = 0; i < UIFlagList.length; i++) {
			if (getUIFlag(UIFlagList[i])) {
				noPick = true;
				break;
			}
		}

		if (!me.inTown && !noPick && !me.itemoncursor && Pickit.gidList.length > 0) {
			Pickit.fastPick(1);
		}

		noPick = false;
		delay(100);
	}
}
