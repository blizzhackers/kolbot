/**
*	@filename	MuleLogger.js
*	@author		kolton
*	@desc		Log items and perm configurable accounts/characters
*/

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
	LogEquipped: false, // include equipped items
	LogMerc: false, // include items merc has equipped (if alive)
	SaveScreenShot: false, // Save pictures in jpg format (saved in 'Images' folder)
	IngameTime: rand(180, 210), // (180, 210) to avoid RD, increase it to (7230, 7290) for mule perming

	// don't edit
	getItemDesc: function (unit, logIlvl) {
		logIlvl === undefined && (logIlvl = this.LogItemLevel);
		
		let stringColor = "";
		let desc = unit.description.split("\n");

		// Lines are normally in reverse. Add color tags if needed and reverse order.
		for (let i = 0; i < desc.length; i += 1) {
			// Remove sell value
			if (desc[i].includes(getLocaleString(3331))) {
				desc.splice(i, 1);

				i -= 1;
			} else {
				// Add color info
				!desc[i].match(/^(y|ÿ)c/) && (desc[i] = stringColor + desc[i]);

				// Find and store new color info
				let index = desc[i].lastIndexOf("ÿc");

				index > -1 && (stringColor = desc[i].substring(index, index + "ÿ".length + 2));
			}

			desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2").replace("ÿ", "\\xff", "g");
		}

		if (logIlvl && desc[desc.length - 1]) {
			desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
		}

		desc = desc.reverse().join("\\n");

		return desc;
	},

	inGameCheck: function () {
		if (getScript("D2BotMuleLog.dbj") && this.LogGame[0] && me.gamename.match(this.LogGame[0], "i")) {
			print("ÿc4MuleLoggerÿc0: Logging items on " + me.account + " - " + me.name + ".");
			D2Bot.printToConsole("MuleLogger: Logging items on " + me.account + " - " + me.name + ".", 7);
			this.logChar();
			let tick = getTickCount() + rand(1500, 1750) * 1000; // trigger anti-idle every ~30 minutes

			while ((getTickCount() - me.gamestarttime) < this.IngameTime * 1000) {
				me.overhead("ÿc2Log items done. ÿc4Stay in " + "ÿc4game more:ÿc0 " + Math.floor(this.IngameTime - (getTickCount() - me.gamestarttime) / 1000) + " sec");

				delay(1000);

				if ((getTickCount() - tick) > 0) {
					sendPacket(1, 0x40); // quest status refresh, working as anti-idle
					tick += rand(1500, 1750) * 1000;
				}
			}

			quit();

			return true;
		}

		return false;
	},

	load: function (hash) {
		let filename = "data/secure/" + hash + ".txt";

		if (!FileTools.exists(filename)) {
			throw new Error("File " + filename + " does not exist!");
		}

		return FileTools.readText(filename);
	},

	save: function (hash, data) {
		let filename = "data/secure/" + hash + ".txt";
		FileTools.writeText(filename, data);
	},

	// Log kept item stats in the manager.
	logItem: function (unit, logIlvl) {
		if (!isIncluded("common/misc.js")) {
			include("common/misc.js");
			include("common/util.js");
		}

		logIlvl === undefined && (logIlvl = this.LogItemLevel);

		let code,
			header = "",
			name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();

		let desc = this.getItemDesc(unit, logIlvl) + "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(0x400000) ? ":eth" : "");
		let color = unit.getColor();

		switch (unit.quality) {
		case 5: // Set
			switch (unit.classid) {
			case 27: // Angelic sabre
				code = "inv9sbu";

				break;
			case 74: // Arctic short war bow
				code = "invswbu";

				break;
			case 308: // Berserker's helm
				code = "invhlmu";

				break;
			case 330: // Civerb's large shield
				code = "invlrgu";

				break;
			case 31: // Cleglaw's long sword
			case 227: // Szabi's cryptic sword
				code = "invlsdu";

				break;
			case 329: // Cleglaw's small shield
				code = "invsmlu";

				break;
			case 328: // Hsaru's buckler
				code = "invbucu";

				break;
			case 306: // Infernal cap / Sander's cap
				code = "invcapu";

				break;
			case 30: // Isenhart's broad sword
				code = "invbsdu";

				break;
			case 309: // Isenhart's full helm
				code = "invfhlu";

				break;
			case 333: // Isenhart's gothic shield
				code = "invgtsu";

				break;
			case 326: // Milabrega's ancient armor
			case 442: // Immortal King's sacred armor
				code = "invaaru";

				break;
			case 331: // Milabrega's kite shield
				code = "invkitu";

				break;
			case 332: // Sigon's tower shield
				code = "invtowu";

				break;
			case 325: // Tancred's full plate mail
				code = "invfulu";

				break;
			case 3: // Tancred's military pick
				code = "invmpiu";

				break;
			case 113: // Aldur's jagged star
				code = "invmstu";

				break;
			case 234: // Bul-Kathos' colossus blade
				code = "invgsdu";

				break;
			case 372: // Grizwold's ornate plate
				code = "invxaru";

				break;
			case 366: // Heaven's cuirass
			case 215: // Heaven's reinforced mace
			case 449: // Heaven's ward
			case 426: // Heaven's spired helm
				code = "inv" + unit.code + "s";

				break;
			case 357: // Hwanin's grand crown
				code = "invxrnu";

				break;
			case 195: // Nalya's scissors suwayyah
				code = "invskru";

				break;
			case 395: // Nalya's grim helm
			case 465: // Trang-Oul's bone visage
				code = "invbhmu";

				break;
			case 261: // Naj's elder staff
				code = "invcstu";

				break;
			case 375: // Orphan's round shield
				code = "invxmlu";

				break;
			case 12: // Sander's bone wand
				code = "invbwnu";

				break;
			}

			break;
		case 7: // Unique
			for (let i = 0; i < 401; i += 1) {
				if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
					code = getBaseStat(17, i, "invfile");

					break;
				}
			}

			break;
		}

		if (!code) {
			// Tiara/Diadem
			code = ["ci2", "ci3"].includes(unit.code) ? unit.code : (getBaseStat(0, unit.classid, 'normcode') || unit.code);
			code = code.replace(" ", "");
			[10, 12, 58, 82, 83, 84].includes(unit.itemType) && (code += (unit.gfx + 1));
		}

		let sock = unit.getItemsEx();

		if (sock.length) {
			for (let i = 0; i < sock.length; i += 1) {
				if (sock[i].itemType === 58) {
					desc += "\n\n";
					desc += this.getItemDesc(sock[i]);
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

	logChar: function (logIlvl, logName, saveImg) {
		while (!me.gameReady) {
			delay(100);
		}

		let items = me.getItemsEx();

		if (!items.length) return;

		logIlvl === undefined && (logIlvl = this.LogItemLevel);
		logName === undefined && (logName = this.LogNames);
		saveImg === undefined && (saveImg = this.SaveScreenShot);

		let folder, realm = me.realm || "Single Player",
			finalString = "";

		if (!FileTools.exists("mules/" + realm)) {
			folder = dopen("mules");

			folder.create(realm);
		}

		if (!FileTools.exists("mules/" + realm + "/" + me.account)) {
			folder = dopen("mules/" + realm);

			folder.create(me.account);
		}

		items.sort((a, b) => b.itemType - a.itemType);

		for (let i = 0; i < items.length; i += 1) {
			if ((this.LogEquipped || items[i].mode === 0) && (items[i].quality !== 2 || !Misc.skipItem(items[i].classid))) {
				let parsedItem = this.logItem(items[i], logIlvl);

				// Log names to saved image
				logName && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
				// Save image to kolbot/images/
				saveImg && D2Bot.saveItem(parsedItem);
				// Always put name on Char Viewer items
				!parsedItem.header && (parsedItem.header = (me.account || "Single Player") + " / " + me.name);
				// Remove itemtype_ prefix from the name
				parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);
				items[i].mode === 1 && (parsedItem.title += " (equipped)");

				let string = JSON.stringify(parsedItem);
				finalString += (string + "\n");
			}
		}

		if (this.LogMerc) {
			let merc = Misc.poll(() => me.getMerc(), 1000, 100);

			if (merc) {
				let mercTtems = merc.getItemsEx();

				for (let i = 0; i < mercTtems.length; i += 1) {
					let parsedItem = this.logItem(mercTtems[i]);
					parsedItem.title += " (merc)";
					let string = JSON.stringify(parsedItem);
					finalString += (string + "\n");
					this.SaveScreenShot && D2Bot.saveItem(parsedItem);
				}
			}
		}

		// hcl = hardcore class ladder
		// sen = softcore expan nonladder
		FileTools.writeText("mules/" + realm + "/" + me.account + "/" + me.name + "." + ( me.playertype ? "h" : "s" ) + (me.gametype ? "e" : "c" ) + ( me.ladder > 0 ? "l" : "n" ) + ".txt", finalString);
		print("Item logging done.");
	}
};
