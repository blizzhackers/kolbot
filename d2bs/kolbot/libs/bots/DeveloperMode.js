/**
*  @filename    Developermode.js
*  @author      theBGuy
*  @desc        developer mode made easy - run commands or scripts from chat commands. View packets. See unit info
*
*/
include("UnitInfo.js");

function DeveloperMode() {
	let done = false, action = false, command = false, userAddon = false, test = false;
	let watchSent = [], watchRecv = [], blockSent = [], blockRecv = [];
	let unitInfo;
	let runCommand = function (msg) {
		if (msg.length <= 1) return;

		let cmd = msg.split(" ")[0].split(".")[1];
		let msgList = msg.split(" ");

		switch (cmd.toLowerCase()) {
		case "me":
			print("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);
			me.overhead("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);

			break;
		case "useraddon":
			userAddon = !userAddon;
			me.overhead("userAddon set to " + userAddon);

			break;
		case "run":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
			} else {
				action = msgList[1];
			}

			break;
		case "done":
			done = true;

			break;
		case "testing":
			test = true;

			break;
		case "command":
			if (msgList.length < 2) {
				print("ÿc1Missing arguments");
			} else {
				command = msgList.splice(1).join(" ");
			}

			break;
		case "watch":
			if (msgList.length < 3) {
				print("ÿc1Missing arguments");
				break;
			}

			switch (msgList[1].toLowerCase()) {
			case "sent":
				if (msgList[2] === "list") {
					print("Watching sent packets : ÿc8" + watchSent.join(", "));
					break;
				}

				watchSent.push(msgList[2]);
				print("Added ÿc80x" + msgList[2] + "ÿc0 (sent) to watch list");
				break;

			case "recv":
				if (msgList[2] === "list") {
					print("Watching received packets : ÿc8" + watchRecv.join(", "));
					break;
				}

				watchRecv.push(msgList[2]);
				print("Added ÿc80x" + msgList[2] + "ÿc0 (recv) to watch list");
				break;

			default:
				print("ÿc1Invalid argument : " + msgList[1]);
				break;
			}

			break;

		case "!watch":
			if (msgList.length < 3) {
				print("ÿc1Missing arguments");
				break;
			}

			switch (msgList[1].toLowerCase()) {
			case "sent":
				if (watchSent.indexOf(msgList[2]) > -1) watchSent.splice(watchSent.indexOf(msgList[2]), 1);
				print("Removed packet ÿc80x" + msgList[2] + "ÿc0 (sent) from watch list");
				break;

			case "recv":
				if (watchRecv.indexOf(msgList[2]) > -1) watchRecv.splice(watchRecv.indexOf(msgList[2]), 1);
				print("Removed packet ÿc80x" + msgList[2] + "ÿc0 (recv) from watch list");
				break;

			default:
				print("ÿc1Invalid argument : " + msgList[1]);
				break;
			}

			break;

		case "block":
			if (msgList.length < 3) {
				print("ÿc1Missing arguments");
				break;
			}

			switch (msgList[1].toLowerCase()) {
			case "sent":
				if (msgList[2] === "list") {
					print("Blocking sent packets : ÿc8" + blockSent.join(", "));
					break;
				}

				blockSent.push(msgList[2]);
				print("Added ÿc80x" + msgList[2] + "ÿc0 (sent) to block list");
				break;

			case "recv":
				if (msgList[2] === "list") {
					print("Blocking received packets : ÿc8" + blockRecv.join(", "));
					break;
				}

				blockRecv.push(msgList[2]);
				print("Added ÿc80x" + msgList[2] + "ÿc0 (recv) to block list");
				break;

			default:
				print("ÿc1Invalid argument : " + msgList[1]);
				break;
			}

			break;

		case "!block":
			if (msgList.length < 3) {
				print("ÿc1Missing arguments");
				break;
			}

			switch (msgList[1].toLowerCase()) {
			case "sent":
				if (blockSent.indexOf(msgList[2]) > -1) blockSent.splice(blockSent.indexOf(msgList[2]), 1);
				print("Removed packet ÿc80x" + msgList[2] + "ÿc0 (sent) from block list");
				break;

			case "recv":
				if (blockRecv.indexOf(msgList[2]) > -1) blockRecv.splice(blockRecv.indexOf(msgList[2]), 1);
				print("Removed packet ÿc80x" + msgList[2] + "ÿc0 (recv) from block list");
				break;

			default:
				print("ÿc1Invalid argument : " + msgList[1]);
				break;
			}

			break;
		}
	};

	// Received packet handler
	let packetReceived = function(pBytes) {
		let ID = pBytes[0].toString(16);

		// Block received packets from list
		if (blockRecv.includes(ID)) return true;

		if (watchRecv.includes(ID)) {
			let size = pBytes.length;
			let array = [].slice.call(pBytes);
			array.shift();
			console.log("ÿc2S  ÿc8" + ID + "ÿc0 " + array.join(" ") + "  ÿc5(" + size + " Bytes)");
		}

		return false;
	};

	// Sent packet handler
	let packetSent = function (pBytes) {
		let ID = pBytes[0].toString(16);

		// Block all commands or irc chat from being sent to server
		if (ID === "15") {
			if (pBytes[3] === 46) {
				let str = "";

				for (let b = 3; b < pBytes.length - 3; b++) {
					str += String.fromCharCode(pBytes[b]);
				}

				if (pBytes[3] === 46) {
					runCommand(str);
					return true;
				}
			}
		}

		// Block sent packets from list
		if (blockSent.includes(ID)) return true;

		if (watchSent.includes(ID)) {
			let size = pBytes.length;
			let array = [].slice.call(pBytes);
			array.shift();
			console.log("ÿc2C  ÿc8" + ID + "ÿc0 " + array.join(" ") + "  ÿc5(" + size + " Bytes)");
		}

		return false;
	};

	const copiedConfig = Misc.copy(Config);

	try {
		console.log("starting developermode");
		me.overhead("Started developer mode");
		addEventListener("gamepacketsent", packetSent);
		addEventListener("gamepacket", packetReceived);
		Config.Silence = false;

		while (!done) {
			if (action) {
				includeIfNotIncluded("bots/" + action + ".js");

				if (!UnitInfo.cleared) {
					UnitInfo.remove();
					userAddon = false;
				}

				if (isIncluded("bots/" + action + ".js")) {
					try {
						Loader.runScript(action);
					} catch (e) {
						console.error(e);
					}
				} else {
					console.warn("Failed to include: " + action);
				}

				me.overhead("Done with action");
				action = false;
			}

			if (command) {
				if (!UnitInfo.cleared) {
					UnitInfo.remove();
					userAddon = false;
				}

				try {
					eval(command);
				} catch (e) {
					console.error(e);
				}

				me.overhead("Done with action");
				command = false;
			}

			if (userAddon) {
				!UnitInfo.cleared && !Game.getSelectedUnit() && UnitInfo.remove();
				unitInfo = Game.getSelectedUnit();
				UnitInfo.createInfo(unitInfo);
			}

			if (test) {
				me.overhead("done");
				test = false;
			}

			delay(100);
		}
	} finally {
		removeEventListener("gamepacketsent", packetSent);
		removeEventListener("gamepacket", packetReceived);
		Config = copiedConfig;
	}
	
	return true;
}
