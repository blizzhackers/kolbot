/*
*	@filename	MapThread.js
*	@author		theBGuy
*	@desc		MapThread used with D2BotMap.dbj
*	@credits 	kolton for orginal MapThread, isid0re for the box/frame style, laz for gamepacketsent event handler
*/

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("CraftingSystem.js");
include("TorchSystem.js");
include("MuleLogger.js");
include("common/Attack.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/Loader.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");
include("manualplay/MapMode.js");
MapMode.include();

const Hooks = {
	dashBoard: {x: 113, y: 490},
	portalBoard: {x: 12, y: 432},
	qolBoard: {x: 545, y: 490},
	resfix: {x: (me.screensize ? 0 : -160), y: (me.screensize ? 0 : -120)},
	saidMessage: false,
	userAddon: false,
	enabled: true,

	init: function () {
		let files = dopen("libs/manualplay/hooks/").getFiles();
		
		Array.isArray(files) && files
			.filter(file => file.endsWith('.js'))
			.forEach(function (x) {
				if (!isIncluded("manualplay/hooks/" + x)) {
					if (!include("manualplay/hooks/" + x)) {
						throw new Error("Failed to include " + "manualplay/hooks/" + x);
					}
				}
			});
	},

	update: function () {
		while (!me.gameReady) {
			delay(100);
		}

		if (!this.enabled) {
			this.enabled = getUIFlag(sdk.uiflags.AutoMap);

			return;
		}

		ActionHooks.check();
		VectorHooks.check();
		MonsterHooks.check();
		ShrineHooks.check();
		ItemHooks.check();
		TextHooks.check();
	},

	flush: function (flag) {
		if (flag === true) {
			this.enabled = false;

			MonsterHooks.flush();
			ShrineHooks.flush();
			TextHooks.flush();
			VectorHooks.flush();
			ActionHooks.flush();
			ItemHooks.flush();
		} else {
			if (sdk.uiflags.Waypoint === flag) {
				VectorHooks.flush();
				TextHooks.displaySettings = false;
				TextHooks.check();
			} else {
				MonsterHooks.flush();
				ShrineHooks.flush();
				TextHooks.flush();
				VectorHooks.flush();
				ActionHooks.flush();
				ItemHooks.flush();
			}
		}

		return true;
	}
};

function main() {
	print("ÿc9Map Thread Loaded.");
	Config.init(false);
	Pickit.init(true);
	Hooks.init();

	const Worker = require('../../modules/Worker');

	Worker.runInBackground.unitInfo = function () {
		if (!Hooks.userAddon || (!UserAddon.cleared && !getUnit(101))) {
			UserAddon.remove();
			return true;
		}

		let unitInfo = getUnit(101);
		!!unitInfo && UserAddon.createInfo(unitInfo);

		return true;
	};

	const hideFlags = [
		0x01, 0x02, 0x03, 0x04, 0x05, 0x09, 0x0C, 0x0F, 0x14,
		0x17, 0x18, 0x19, 0x1A, 0x21, 0x24
	];

	this.revealArea = function (area) {
		!this.revealedAreas && (this.revealedAreas = []);

		if (this.revealedAreas.indexOf(area) === -1) {
			delay(500);
			
			if (!getRoom()) {
				return;
			}
			
			revealLevel(true);
			this.revealedAreas.push(area);
		}
	};

	// Run commands from chat
	this.runCommand = function (msg) {
		if (msg.length <= 1) {
			return true;
		}

		msg = msg.toLowerCase();
		let cmd = msg.split(" ")[0].split(".")[1];
		let msgList = msg.split(" ");
		let qolObj = {type: "qol", dest: false, action: false};

		switch (cmd) {
		case "useraddon":
			Hooks.userAddon = !Hooks.userAddon;
			me.overhead("userAddon set to " + Hooks.userAddon);

			break;
		case "me":
			print("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);
			me.overhead("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);

			break;
		case "stash":
			me.inTown && (qolObj.action = "stashItems");

			break;
		case "pick":
		case "cowportal":
		case "uberportal":
		case "filltps":
			qolObj.action = cmd;

			break;
		case "drop":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
				break;
			}

			qolObj.type = "drop";
			qolObj.action = msgList[1];

			break;
		case "help":
			if (HelpMenu.cleared) {
				HelpMenu.showMenu();
				me.overhead("Click each command for more info");
			}

			break;
		case "hide":
			hideConsole();
			HelpMenu.hideMenu();

			break;
		case "make":
			FileTools.copy("libs/manualplay/config/" + sdk.charclass.nameOf(me.classid) + ".js", "libs/manualplay/config/" + sdk.charclass.nameOf(me.classid) + "." + me.name + ".js");
			D2Bot.printToConsole("libs/manualplay/config/" + sdk.charclass.nameOf(me.classid) + "." + me.name + ".js has been created. Configure the bot and reload to apply changes");
			print("libs/manualplay/config/" + sdk.charclass.nameOf(me.classid) + "." + me.name + ".js has been created. Configure the bot and reload to apply changes");
			me.overhead("libs/manualplay/config/" + sdk.charclass.nameOf(me.classid) + "." + me.name + ".js has been created. Configure the bot and reload to apply changes");

			break;
		default:
			print("ÿc1Invalid command : " + cmd);

			break;
		}

		qolObj.action && Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(qolObj));

		return true;
	};

	// Sent packet handler
	this.packetSent = function (pBytes) {
		let ID = pBytes[0].toString(16);

		// Block all commands or irc chat from being sent to server
		if (ID === "15") {
			if (pBytes[3] === 46) {
				let str = "";

				for (let b = 3; b < pBytes.length - 3; b++) {
					str += String.fromCharCode(pBytes[b]);
				}

				if (pBytes[3] === 46) {
					this.runCommand(str);

					return true;
				}
			}
		}

		return false;
	};

	addEventListener("gamepacketsent", this.packetSent);
	addEventListener("keyup", ActionHooks.event);

	while (true) {
		while (!me.area || !me.gameReady) {
			delay(100);
		}

		this.revealArea(me.area);
		
		for (let i = 0; i < hideFlags.length; i++) {
			while (getUIFlag(hideFlags[i])) {
				Hooks.flush(hideFlags[i]);
				ActionHooks.checkAction();

				delay(100);
			}
		}

		getUIFlag(0x0A) ? Hooks.update() : Hooks.flush(true) && (!HelpMenu.cleared && HelpMenu.hideMenu());

		delay(20);

		while (getUIFlag(0x0D)) {
			ItemHooks.flush();
		}
	}
}
