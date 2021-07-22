/*
*	@filename	MuleloggerOverrides.js
*	@author		theBguy
*	@desc		Added tiers to mulelogging
*/

if (!isIncluded("MuleLogger.js")) {
	include("MuleLogger.js");
}

if (!isIncluded("SoloLeveling/Functions/NTIPOverrides.js")) {
	include("SoloLeveling/Functions/NTIPOverrides.js");
}

if (!isIncluded("SoloLeveling/Functions/MiscOverrides.js")) {
	include("SoloLeveling/Functions/MiscOverrides.js");
}

MuleLogger.getItemDesc = function (unit, logIlvl) {
	var i, desc, index,
		stringColor = "";

	if (logIlvl === undefined) {
		logIlvl = this.LogItemLevel;
	}

	try {
		//Try a few times, sometimes it fails
		for (let u = 0; u < 5; u++) {
			desc = unit.description.split("\n");

			if (desc) {
				break;
			}

			delay(250 + me.ping * 2);
		}
	} catch (e) {
		print("Failed to get description of " + unit.fname);	//This isn't a fatal error just log and move on

		return false;
	}

	// Lines are normally in reverse. Add color tags if needed and reverse order.
	for (i = 0; i < desc.length; i += 1) {
		if (desc[i].indexOf(getLocaleString(3331)) > -1) { // Remove sell value
			desc.splice(i, 1);

			i -= 1;
		} else {
			// Add color info
			if (!desc[i].match(/^(y|ÿ)c/)) {
				desc[i] = stringColor + desc[i];
			}

			// Find and store new color info
			index = desc[i].lastIndexOf("ÿc");

			if (index > -1) {
				stringColor = desc[i].substring(index, index + "ÿ".length + 2);
			}
		}

		desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2").replace("ÿ", "\\xff", "g");
	}

	if (logIlvl && desc[desc.length - 1]) {
		desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
	}

	desc = desc.reverse().join("\\n");

	return desc;
};

//Added type parameter and logging tier value under picture on char viewer tab
MuleLogger.logItem = function (unit, logIlvl, type) {
	if (!isIncluded("common/misc.js")) {
		include("common/misc.js");
		include("common/util.js");
	}

	if (logIlvl === undefined) {
		logIlvl = this.LogItemLevel;
	}

	if (type === undefined) {
		type = "Player";
	}

	var i, code, desc, sock,
		header = "",
		color = -1,
		name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();

	desc = this.getItemDesc(unit, logIlvl);/* + "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(0x400000) ? ":eth" : "");*/
	color = unit.getColor();

	if (NTIP.GetMercTier(unit) > 0 || NTIP.GetTier(unit) > 0) {
		if (unit.mode === 1 && type === "Player") {
			desc += ("\n\\xffc0Autoequip tier: " + NTIP.GetTier(unit));

		} else if (unit.mode === 1 && type === "Merc") {
			desc += ("\n\\xffc0Autoequip merctier: " + NTIP.GetMercTier(unit));

		}
	}

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
		for (i = 0; i < 401; i += 1) {
			if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
				code = getBaseStat(17, i, "invfile");

				break;
			}
		}

		break;
	}

	if (!code) {
		if (["ci2", "ci3"].indexOf(unit.code) > -1) { // Tiara/Diadem
			code = unit.code;
		} else {
			code = getBaseStat(0, unit.classid, 'normcode') || unit.code;
		}

		code = code.replace(" ", "");

		if ([10, 12, 58, 82, 83, 84].indexOf(unit.itemType) > -1) {
			code += (unit.gfx + 1);
		}
	}

	sock = unit.getItems();

	if (sock) {
		for (i = 0; i < sock.length; i += 1) {
			if (sock[i].itemType === 58) {
				desc += "\n\n";
				desc += this.getItemDesc(sock[i]);
			}
		}
	}

	desc += "$" + unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y + (unit.getFlag(0x400000) ? ":eth" : "");

	return {
		itemColor: color,
		image: code,
		title: name,
		description: desc,
		header: header,
		sockets: Misc.getItemSockets(unit)
	};
};

MuleLogger.logEquippedItems = function () {
	while (!me.gameReady) {
		delay(100);
	}

	var i, folder, string, parsedItem,
		items = me.getItems(),
		realm = me.realm || "Single Player",
		merc, charClass,
		finalString = "";

	if (!FileTools.exists("mules/" + realm)) {
		folder = dopen("mules");

		folder.create(realm);
	}

	if (!FileTools.exists("mules/" + realm + "/" + "SoloLeveling")) {
		folder = dopen("mules/" + realm);

		folder.create("SoloLeveling");
	}

	if (!FileTools.exists("mules/" + realm + "/" + "SoloLeveling/" + me.account)) {
		folder = dopen("mules/" + realm + "/SoloLeveling");

		folder.create(me.account);
	}

	if (!items || !items.length) {
		return;
	}

	function itemSort (a, b) {
		return b.itemType - a.itemType;
	}

	items.sort(itemSort);

	for (i = 0; i < items.length; i += 1) {
		if ((items[i].mode === 1 && (items[i].quality !== 2 || !Misc.skipItem(items[i].classid))) || (items[i].mode === 0 && items[i].itemType === 74) || (items[i].location === 3 && [603, 604, 605].indexOf(items[i].classid) > -1) ) {
			parsedItem = this.logItem(items[i], true, "Player");

			// Always put name on Char Viewer items
			if (!parsedItem.header) {
				parsedItem.header = (me.account || "Single Player") + " / " + me.name;
			}

			// Remove itemtype_ prefix from the name
			parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);

			if (items[i].mode === 1 && (items[i].location !== 11 && items[i].location !== 12)) {
				parsedItem.title += " (equipped)";
			}

			if (items[i].mode === 1 && (items[i].location === 11 || items[i].location === 12)) {
				parsedItem.title += " (secondary equipped)";
			}

			if (items[i].mode === 0 && [603, 604, 605].indexOf(items[i].classid) === -1) {
				parsedItem.title += " (in stash)";
			}

			if (items[i].mode === 0 && [603, 604, 605].indexOf(items[i].classid) > -1) {
				parsedItem.title += " (equipped charm)";
			}

			string = JSON.stringify(parsedItem);
			finalString += (string + "\n");
		}

	}

	if (Config.UseMerc) {
		merc = Merc.getMercFix();

		if (merc) {
			items = merc.getItems();

			for (i = 0; i < items.length; i += 1) {
				parsedItem = this.logItem(items[i], true, "Merc");
				parsedItem.title += " (merc)";

				string = JSON.stringify(parsedItem);
				finalString += (string + "\n");
			}
		}

	}

	charClass = ["amazon.", "sorceress.", "necromancer.", "paladin.", "barbarian.", "druid.", "assassin."][me.classid];

	// hccl = hardcore classic ladder
	// scnl = softcore expan nonladder
	FileTools.writeText("mules/" + realm + "/" + "SoloLeveling/" + me.account + "/" + charClass + "." + me.profile + "-" + me.name + "." + ( me.playertype ? "hc" : "sc" ) + (me.classic ? "c" : "" ) + ( me.ladder > 0 ? "l" : "nl" ) + ".txt", finalString);
	print("Item logging done.");
};
