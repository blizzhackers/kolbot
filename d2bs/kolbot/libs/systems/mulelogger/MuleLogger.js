/**
*  @filename    MuleLogger.js
*  @author      kolton, theBGuy
*  @desc        Log items and perm accounts/characters, for setup @see LoggerConfig.js
*
*/

const MuleLogger = {
	// configuration file loaded at bottom
	inGameCheck: function () {
		if (getScript("D2BotMuleLog.dbj") && this.LogGame[0] && me.gamename.match(this.LogGame[0], "i")) {
			print("ÿc4MuleLoggerÿc0: Logging items on " + me.account + " - " + me.name + ".");
			D2Bot.printToConsole("MuleLogger: Logging items on " + me.account + " - " + me.name + ".", sdk.colors.D2Bot.DarkGold);
			this.logChar();
			let stayInGame = this.IngameTime;
			let tick = getTickCount() + rand(1500, 1750) * 1000; // trigger anti-idle every ~30 minutes

			if (this.AutoPerm) {
				let permInfo = this.loadPermedStatus();

				if (!!permInfo.charname) {
					if (permInfo.charname === me.charname && !permInfo.perm) {
						stayInGame = rand(7230, 7290);
					}
				}
			}

			while ((getTickCount() - me.gamestarttime) < Time.seconds(stayInGame)) {
				me.overhead("ÿc2Log items done. ÿc4Stay in " + "ÿc4game more:ÿc0 " + Math.floor(stayInGame - (getTickCount() - me.gamestarttime) / 1000) + " sec");

				delay(1000);

				if ((getTickCount() - tick) > 0) {
					Packet.questRefresh(); // quest status refresh, working as anti-idle
					tick += rand(1500, 1750) * 1000;
				}
			}

			try {
				quit();
			} finally {
				while (me.ingame) {
					delay(100);
				}
			}

			return true;
		}

		return false;
	},

	savePermedStatus: function (charPermInfo = {}) {
		FileTools.writeText("logs/MuleLogPermInfo.json", JSON.stringify(charPermInfo));
	},

	loadPermedStatus: function () {
		if (!FileTools.exists("logs/MuleLogPermInfo.json")) throw new Error("File logs/MuleLogPermInfo.json does not exist!");
		let info = (FileTools.readText("logs/MuleLogPermInfo.json"));
		return info ? JSON.parse(info) : {};
	},

	load: function (hash) {
		let filename = "data/secure/" + hash + ".txt";
		if (!FileTools.exists(filename)) throw new Error("File " + filename + " does not exist!");
		return FileTools.readText(filename);
	},

	save: function (hash, data) {
		let filename = "data/secure/" + hash + ".txt";
		FileTools.writeText(filename, data);
	},

	remove: function () {
		FileTools.remove("logs/MuleLog.json");
		FileTools.remove("logs/MuleLogPermInfo.json");
	},

	// Log kept item stats in the manager.
	logItem: function (unit, logIlvl = this.LogItemLevel) {
		if (!isIncluded("core/misc.js")) {
			include("core/misc.js");
		}

		let header = "";
		let name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();
		let desc = Item.getItemDesc(unit, logIlvl) + "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(sdk.items.flags.Ethereal) ? ":eth" : "");
		let color = unit.getColor();
		let code = Item.getItemCode(unit);
		let sock = unit.getItemsEx();

		if (sock.length) {
			for (let i = 0; i < sock.length; i += 1) {
				if (sock[i].itemType === sdk.items.type.Jewel) {
					desc += "\n\n";
					desc += Item.getItemDesc(sock[i], logIlvl);
				}
			}
		}

		return {
			itemColor: color,
			image: code,
			title: name,
			description: desc,
			header: header,
			sockets: Item.getItemSockets(unit)
		};
	},

	logChar: function (logIlvl = this.LogItemLevel, logName = this.LogNames, saveImg = this.SaveScreenShot) {
		while (!me.gameReady) {
			delay(100);
		}

		// try again if db is locked!! - ItemDB is from https://github.com/dzik87/D2Dropper
		// maybe just add it to the core? It's not going to work without an update
		if (FileTools.exists("libs/ItemDB.js") && (isIncluded("ItemDB.js") || include("ItemDB.js"))) {
			while (!ItemDB.init(false)) {
				delay(1000);
			}
		}

		let items = me.getItemsEx();
		if (!items.length) return;

		let folder, realm = me.realm || "Single Player";
		let finalString = "";

		if (!FileTools.exists("mules/" + realm)) {
			folder = dopen("mules");

			folder.create(realm);
		}

		if (!FileTools.exists("mules/" + realm + "/" + me.account)) {
			folder = dopen("mules/" + realm);

			folder.create(me.account);
		}

		// from bottom up: merc, equipped, inventory, stash, cube
		items.sort(function (a, b) {
			if (a.mode < b.mode) return -1;
			if (a.mode > b.mode) return 1;
			if (a.location === sdk.storage.Cube) return -1;
			if (b.location === sdk.storage.Cube) return 1;
			return b.location - a.location;
		});

		for (let i = 0; i < items.length; i += 1) {
			if ((this.LogEquipped || items[i].isInStorage) && (items[i].quality > sdk.items.quality.Normal || !Item.skipItem(items[i].classid))) {
				let parsedItem = this.logItem(items[i], logIlvl);

				// Log names to saved image
				logName && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
				// Save image to kolbot/images/
				saveImg && D2Bot.saveItem(parsedItem);
				// Always put name on Char Viewer items
				!parsedItem.header && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
				// Remove itemtype_ prefix from the name
				parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);

				items[i].isEquipped && (parsedItem.title += (items[i].isOnSwap ? " (secondary equipped)" : " (equipped)"));
				items[i].isInInventory && (parsedItem.title += " (inventory)");
				items[i].isInStash && (parsedItem.title += " (stash)");
				items[i].isInCube && (parsedItem.title += " (cube)");

				let string = JSON.stringify(parsedItem);
				finalString += (string + "\n");
			}
		}

		if (this.LogMerc) {
			let merc = Misc.poll(() => me.getMerc(), 1000, 100);

			if (merc) {
				let mercItems = merc.getItemsEx();

				for (let i = 0; i < mercItems.length; i += 1) {
					let parsedItem = this.logItem(mercItems[i]);
					parsedItem.title += " (merc)";
					let string = JSON.stringify(parsedItem);
					finalString += (string + "\n");
					saveImg && D2Bot.saveItem(parsedItem);
				}
			}
		}

		// hcl = hardcore class ladder
		// sen = softcore expan nonladder
		FileTools.writeText("mules/" + realm + "/" + me.account + "/" + me.name + "." + ( me.playertype ? "h" : "s" ) + (me.gametype ? "e" : "c" ) + ( me.ladder > 0 ? "l" : "n" ) + ".txt", finalString);
		print("Item logging done.");
	}
};

// load configuration file and apply settings to MuleLogger, has to be after the namespace is created
(function() {
	Object.assign(MuleLogger, require("./LoggerConfig", null, false));
})();
