/**
*  @filename    PickThread.js
*  @author      stffdtiger
*  @desc        a loop that runs Pickit.FastPick() intended to be used with D2BotMap entry script
*
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

	let noPick = false;
	const UIFlagList = [
		sdk.uiflags.Inventory, sdk.uiflags.StatsWindow, sdk.uiflags.QuickSkill, sdk.uiflags.SkillWindow,
		sdk.uiflags.ChatBox, sdk.uiflags.EscMenu, sdk.uiflags.ConfigControls, sdk.uiflags.SubmitItem,
		sdk.uiflags.Quest, sdk.uiflags.Waypoint, sdk.uiflags.Party, sdk.uiflags.Cube, sdk.uiflags.MercScreen
	];

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
