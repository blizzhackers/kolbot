/**
*  @filename    UserAddon.js
*  @author      kolton
*  @desc        Allows you to see more information about items, NPCs and players by placing the cursor over them.
*               Shows item level, items in sockets, classid, code and magic item prefix/suffix numbers.
*               Shows monster's classid, HP percent and resistances.
*               Shows other players' gear.
*
*/

include("UnitInfo.js");

function UserAddon () {
	let i, title, dummy, command = "";
	const className = sdk.player.class.nameOf(me.classid);
	const flags = [
		sdk.uiflags.Inventory, sdk.uiflags.StatsWindow, sdk.uiflags.QuickSkill, sdk.uiflags.SkillWindow, sdk.uiflags.ChatBox,
		sdk.uiflags.Quest, sdk.uiflags.Msgs, sdk.uiflags.Stash, sdk.uiflags.Shop, sdk.uiflags.EscMenu, sdk.uiflags.Cube
	];

	const keyEvent = function (key) {
		switch (key) {
		case sdk.keys.Spacebar:
			FileTools.copy("libs/config/" + className + ".js", "libs/config/" + className + "." + me.name + ".js");
			D2Bot.printToConsole("libs/config/" + className + "." + me.name + ".js has been created.");
			D2Bot.printToConsole("Please configure your bot and start it again.");
			D2Bot.stop();

			break;
		}
	};

	const onChatInput = (speaker, msg) => {
		if (msg.length && msg[0] === ".") {
			command = str.split(" ")[0].split(".")[1];

			return true;
		}

		return false;
	};

	// Make sure the item event is loaded
	!Config.FastPick && addEventListener("itemaction", Pickit.itemEvent);
	addEventListener("chatinputblocker", onChatInput);

	if (!FileTools.exists("libs/config/" + className + "." + me.name + ".js")) {
		showConsole();
		print("ÿc4UserAddonÿc0: Press HOME and then press SPACE if you want to create character config.");
		addEventListener("keyup", keyEvent);
	}

	while (true) {
		for (i = 0; i < flags.length; i += 1) {
			if (getUIFlag(flags[i])) {
				if (title) {
					title.remove();
					dummy.remove();

					title = false;
					dummy = false;
				}

				break;
			}
		}

		if (i === flags.length && !title) {
			title = new Text(":: kolbot user addon ::", 400, 525, 4, 0, 2);
			dummy = new Text("`", 1, 1); // Prevents crash
		}

		!UnitInfo.cleared && !Game.getSelectedUnit() && UnitInfo.remove();

		if (command && command.toLowerCase() === "done") {
			print("ÿc4UserAddon ÿc1ended");
			removeEventListener("keyup", keyEvent);
			removeEventListener("itemaction", Pickit.itemEvent);
			removeEventListener("chatinputblocker", onChatInput);

			return;
		} else {
			print(command);
			command = "";
		}

		Pickit.fastPick();

		let unit = Game.getSelectedUnit();
		!!unit && UnitInfo.createInfo(unit);

		delay(20);
	}
}
