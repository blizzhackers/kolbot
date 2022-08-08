/**
*  @filename    MuleLogger.js
*  @author      kolton, theBGuy
*  @desc        Log items and perm configurable accounts/characters
*
*/
!isIncluded("common/prototypes.js") && include("common/prototypes.js");

const MuleLogger = {
	LogAccounts: {
		/* Format:
			"account1/password1/realm": ["charname1", "charname2 etc"],
			"account2/password2/realm": ["charnameX", "charnameY etc"],
			"account3/password3/realm": ["all"]

			To log a full account, put "account/password/realm": ["all"]

			realm = useast, uswest, europe or asia

			Individual entries are separated with a comma.
		*/
	},

	LogGame: ["", ""], // ["gamename", "password"]
	LogNames: true, // Put account/character name on the picture
	LogItemLevel: true, // Add item level to the picture
	LogEquipped: true, // include equipped items
	LogMerc: true, // include items merc has equipped (if alive)
	SaveScreenShot: false, // Save pictures in jpg format (saved in 'Images' folder)
	AutoPerm: true, // override InGameTime to perm character
	IngameTime: rand(60, 120), // (180, 210) to avoid RD, increase it to (7230, 7290) for mule perming

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

			quit();

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
		if (!isIncluded("common/misc.js")) {
			include("common/misc.js");
			include("common/util.js");
		}

		let header = "";
		let name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();
		let desc = Misc.getItemDesc(unit, logIlvl) + "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(sdk.items.flags.Ethereal) ? ":eth" : "");
		let color = unit.getColor();
		let code = Misc.getItemCode(unit);
		let sock = unit.getItemsEx();

		if (sock.length) {
			for (let i = 0; i < sock.length; i += 1) {
				if (sock[i].itemType === sdk.items.type.Jewel) {
					desc += "\n\n";
					desc += Misc.getItemDesc(sock[i], logIlvl);
				}
			}
		}

		return {
			itemColor: color,
			image: code,
			title: name,
			description: desc,
			header: header,
			sockets: Misc.getItemSockets(unit)
		};
	},

	logChar: function (logIlvl = this.LogItemLevel, logName = this.LogNames, saveImg = this.SaveScreenShot) {
		while (!me.gameReady) {
			delay(100);
		}

		// try again if db is locked!!
		if (isIncluded("ItemDB.js") || include("ItemDB.js")) {
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
			if ((this.LogEquipped || items[i].isInStorage) && (items[i].quality > sdk.items.quality.Normal || !Misc.skipItem(items[i].classid))) {
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
