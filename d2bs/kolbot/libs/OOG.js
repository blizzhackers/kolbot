/**
*  @filename    OOG.js
*  @author      kolton, D3STROY3R, theBGuy
*  @desc        handle out of game operations like creating characters/accounts, maintaining profile datafiles, d2bot# logging etc.
*
*/
!isIncluded('Polyfill.js') && include('Polyfill.js');

let sdk = require('./modules/sdk');
let Controls = require('./modules/Control');

const D2Bot = {
	handle: 0,

	init: function () {
		let handle = DataFile.getStats().handle;

		if (handle) {
			this.handle = handle;
		}

		return this.handle;
	},

	sendMessage: function (handle, mode, msg) {
		sendCopyData(null, handle, mode, msg);
	},

	printToConsole: function (msg, color, tooltip, trigger) {
		let printObj = {
			msg: msg,
			color: color || 0,
			tooltip: tooltip || "",
			trigger: trigger || ""
		};

		let obj = {
			profile: me.profile,
			func: "printToConsole",
			args: [JSON.stringify(printObj)]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	printToItemLog: function (itemObj) {
		let obj = {
			profile: me.profile,
			func: "printToItemLog",
			args: [JSON.stringify(itemObj)]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	uploadItem: function (itemObj) {
		let obj = {
			profile: me.profile,
			func: "uploadItem",
			args: [JSON.stringify(itemObj)]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	writeToFile: function (filename, msg) {
		let obj = {
			profile: me.profile,
			func: "writeToFile",
			args: [filename, msg]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	postToIRC: function (ircProfile, recepient, msg) {
		let obj = {
			profile: me.profile,
			func: "postToIRC",
			args: [ircProfile, recepient, msg]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	ircEvent: function (mode) {
		let obj = {
			profile: me.profile,
			func: "ircEvent",
			args: [mode ? "true" : "false"]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	notify: function (msg) {
		let obj = {
			profile: me.profile,
			func: "notify",
			args: [msg]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	saveItem: function (itemObj) {
		let obj = {
			profile: me.profile,
			func: "saveItem",
			args: [JSON.stringify(itemObj)]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	updateStatus: function (msg) {
		let obj = {
			profile: me.profile,
			func: "updateStatus",
			args: [msg]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	updateRuns: function () {
		let obj = {
			profile: me.profile,
			func: "updateRuns",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	updateChickens: function () {
		let obj = {
			profile: me.profile,
			func: "updateChickens",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	updateDeaths: function () {
		let obj = {
			profile: me.profile,
			func: "updateDeaths",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	requestGameInfo: function () {
		let obj = {
			profile: me.profile,
			func: "requestGameInfo",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	restart: function (keySwap) {
		let obj = {
			profile: me.profile,
			func: "restartProfile",
			args: arguments.length > 0 ? [me.profile, keySwap] : [me.profile]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	CDKeyInUse: function () {
		let obj = {
			profile: me.profile,
			func: "CDKeyInUse",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	CDKeyDisabled: function () {
		let obj = {
			profile: me.profile,
			func: "CDKeyDisabled",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	CDKeyRD: function () {
		let obj = {
			profile: me.profile,
			func: "CDKeyRD",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	stop: function (profile, release) {
		!profile && (profile = me.profile);

		let obj = {
			profile: me.profile,
			func: "stop",
			args: [profile, release ? "True" : "False"]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	start: function (profile) {
		let obj = {
			profile: me.profile,
			func: "start",
			args: [profile]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	startSchedule: function (profile) {
		let obj = {
			profile: me.profile,
			func: "startSchedule",
			args: [profile]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	stopSchedule: function (profile) {
		let obj = {
			profile: me.profile,
			func: "stopSchedule",
			args: [profile]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	updateCount: function () {
		let obj = {
			profile: me.profile,
			func: "updateCount",
			args: ["1"]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	shoutGlobal: function (msg, mode) {
		let obj = {
			profile: me.profile,
			func: "shoutGlobal",
			args: [msg, mode]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	heartBeat: function () {
		let obj = {
			profile: me.profile,
			func: "heartBeat",
			args: []
		};

		//print("ÿc1Heart beat " + this.handle);
		sendCopyData(null, this.handle, 0xbbbb, JSON.stringify(obj));
	},

	sendWinMsg: function (wparam, lparam) {
		let obj = {
			profile: me.profile,
			func: "winmsg",
			args: [wparam, lparam]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	ingame: function () {
		this.sendWinMsg(0x0086, 0x0000);
		this.sendWinMsg(0x0006, 0x0002);
		this.sendWinMsg(0x001c, 0x0000);
	},

	// Profile to profile communication
	joinMe: function (profile, gameName, gameCount, gamePass, isUp) {
		let obj = {
			gameName: gameName + gameCount,
			gamePass: gamePass,
			inGame: isUp === "yes"
		};

		sendCopyData(null, profile, 1, JSON.stringify(obj));
	},

	requestGame: function (profile) {
		let obj = {
			profile: me.profile
		};

		sendCopyData(null, profile, 3, JSON.stringify(obj));
	},

	getProfile: function () {
		let obj = {
			profile: me.profile,
			func: "getProfile",
			args: []
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	setProfile: function (account, password, character, difficulty, realm, infoTag, gamePath) {
		let obj = {
			profile: me.profile,
			func: "setProfile",
			args: [account, password, character, difficulty, realm, infoTag, gamePath]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	setTag: function (tag) {
		let obj = {
			profile: me.profile,
			func: "setTag",
			args: [JSON.stringify(tag)]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	// Store info in d2bot# cache
	store: function (info) {
		this.remove();

		let obj = {
			profile: me.profile,
			func: "store",
			args: [me.profile, info]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	// Get info from d2bot# cache
	retrieve: function () {
		let obj = {
			profile: me.profile,
			func: "retrieve",
			args: [me.profile]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	},

	// Delete info from d2bot# cache
	remove: function () {
		let obj = {
			profile: me.profile,
			func: "delete",
			args: [me.profile]
		};

		sendCopyData(null, this.handle, 0, JSON.stringify(obj));
	}
};

const DataFile = {
	create: function () {
		let obj = {
			runs: 0,
			experience: 0,
			deaths: 0,
			lastArea: "",
			gold: 0,
			level: 0,
			name: "",
			gameName: "",
			ingameTick: 0,
			handle: 0,
			nextGame: ""
		};

		let string = JSON.stringify(obj);

		Misc.fileAction("data/" + me.profile + ".json", 1, string);

		return obj;
	},

	getObj: function () {
		!FileTools.exists("data/" + me.profile + ".json") && DataFile.create();
		
		let obj;
		let string = Misc.fileAction("data/" + me.profile + ".json", 0);

		try {
			obj = JSON.parse(string);
		} catch (e) {
			// If we failed, file might be corrupted, so create a new one
			obj = this.create();
		}

		if (obj) {
			return obj;
		}

		print("Error reading DataFile. Using null values.");

		return {runs: 0, experience: 0, lastArea: "", gold: 0, level: 0, name: "", gameName: "", ingameTick: 0, handle: 0, nextGame: ""};
	},

	getStats: function () {
		let obj = this.getObj();

		return Misc.clone(obj);
	},

	updateStats: function (arg, value) {
		while (me.ingame && !me.gameReady) {
			delay(100);
		}

		let statArr = [];

		typeof arg === "object" && (statArr = arg.slice());
		typeof arg === "string" && statArr.push(arg);

		let obj = this.getObj();

		for (let i = 0; i < statArr.length; i += 1) {
			switch (statArr[i]) {
			case "experience":
				obj.experience = me.getStat(13);
				obj.level = me.getStat(12);

				break;
			case "lastArea":
				if (obj.lastArea === Pather.getAreaName(me.area)) {
					return;
				}

				obj.lastArea = Pather.getAreaName(me.area);

				break;
			case "gold":
				if (!me.gameReady) {
					break;
				}

				obj.gold = me.getStat(14) + me.getStat(15);

				break;
			case "name":
				obj.name = me.name;

				break;
			case "ingameTick":
				obj.ingameTick = getTickCount();

				break;
			case "deaths":
				obj.deaths = (obj.deaths || 0) + 1;

				break;
			default:
				obj[statArr[i]] = value;

				break;
			}
		}

		let string = JSON.stringify(obj);

		Misc.fileAction("data/" + me.profile + ".json", 1, string);
	}
};

const ControlAction = {
	mutedKey: false,

	timeoutDelay: function (text, time, stopfunc, arg) {
		let currTime = 0;
		let endTime = getTickCount() + time;

		while (getTickCount() < endTime) {
			if (typeof stopfunc === "function" && stopfunc(arg)) {
				break;
			}

			if (currTime !== Math.floor((endTime - getTickCount()) / 1000)) {
				currTime = Math.floor((endTime - getTickCount()) / 1000);

				D2Bot.updateStatus(text + " (" + Math.max(currTime, 0) + "s)");
			}

			delay(10);
		}
	},

	click: function (type, x, y, xsize, ysize, targetx, targety) {
		let control = getControl(type, x, y, xsize, ysize);

		if (!control) {
			print("control not found " + type + " " + x + " " + y + " " + xsize + " " + ysize + " location " + getLocation());

			return false;
		}

		control.click(targetx, targety);

		return true;
	},

	setText: function (type, x, y, xsize, ysize, text) {
		if (!text) return false;

		let control = getControl(type, x, y, xsize, ysize);
		if (!control) return false;

		let currText = control.text;
		if (currText && currText === text) return true;

		currText = control.getText();

		if (currText && ((typeof currText === "string" && currText === text) || (typeof currText === "object" && currText.includes(text)))) {
			return true;
		}

		control.setText(text);

		return true;
	},

	getText: function (type, x, y, xsize, ysize) {
		let control = getControl(type, x, y, xsize, ysize);

		return (!!control ? control.getText() : false);
	},

	joinChannel: function (channel) {
		me.blockMouse = true;

		let tick;
		let rval = false;
		let timeout = 5000;

		MainLoop:
		while (true) {
			switch (getLocation()) {
			case sdk.game.locations.Lobby:
				Controls.LobbyEnterChat.click();

				break;
			case sdk.game.locations.LobbyChat:
				let currChan = Controls.LobbyChannelName.getText(); // returns array

				if (currChan) {
					for (let i = 0; i < currChan.length; i += 1) {
						if (currChan[i].split(" (") && currChan[i].split(" (")[0].toLowerCase() === channel.toLowerCase()) {
							rval = true;

							break MainLoop;
						}
					}
				}

				!tick && Controls.LobbyChannel.click() && (tick = getTickCount());

				break;
			case sdk.game.locations.ChannelList: // Channel
				Controls.LobbyChannelText.setText(channel);
				Controls.LobbyChannelOk.click();

				break;
			}

			if (getTickCount() - tick >= timeout) {
				break;
			}

			delay(100);
		}

		me.blockMouse = false;

		return rval;
	},

	createGame: function (name, pass, diff, delay) {
		Controls.CreateGameName.setText(name);
		Controls.CreateGamePass.setText(pass);

		switch (diff) {
		case "Normal":
			Controls.Normal.click();

			break;
		case "Nightmare":
			Controls.Nightmare.click();

			break;
		case "Highest":
			if (Controls.Hell.disabled !== 4 && Controls.Hell.click()) {
				break;
			}

			if (Controls.Nightmare.disabled !== 4 && Controls.Nightmare.click()) {
				break;
			}

			Controls.Normal.click();

			break;
		default:
			Controls.Hell.click();

			break;
		}

		!!delay && this.timeoutDelay("Make Game Delay", delay);

		if (Starter.chanInfo.announce) {
			Starter.sayMsg("Next game is " + name + (pass === "" ? "" : "//" + pass));
		}

		me.blockMouse = true;

		print("Creating Game: " + name);
		Controls.CreateGame.click();

		me.blockMouse = false;
	},

	clickRealm: function (realm) {
		if (realm === undefined || typeof realm !== "number" || realm < 0 || realm > 3) {
			throw new Error("clickRealm: Invalid realm!");
		}

		let currentRealm, retry = 0;

		me.blockMouse = true;

		MainLoop:
		while (true) {
			switch (getLocation()) {
			case sdk.game.locations.MainMenu:
				let control = Controls.Gateway.control;
				if (!control) {
					if (retry > 3) return false;
					retry++;

					break;
				}

				switch (control.text.split(getLocaleString(11049).substring(0, getLocaleString(11049).length - 2))[1]) {
				case "U.S. EAST":
					currentRealm = 1;

					break;
				case "U.S. WEST":
					currentRealm = 0;

					break;
				case "ASIA":
					currentRealm = 2;

					break;
				case "EUROPE":
					currentRealm = 3;

					break;
				}

				if (currentRealm === realm) {
					break MainLoop;
				}

				Controls.Gateway.click();

				break;
			case sdk.game.locations.GatewaySelect:
				this.click(4, 257, 500, 292, 160, 403, 350 + realm * 25);
				Controls.GatewayOk.click();

				break;
			}

			delay(500);
		}

		me.blockMouse = false;

		return true;
	},

	loginAccount: function (info) {
		me.blockMouse = true;

		let locTick;
		let realms = {
			"uswest": 0,
			"useast": 1,
			"asia": 2,
			"europe": 3
		};

		let tick = getTickCount();

		MainLoop:
		while (true) {
			switch (getLocation()) {
			case sdk.game.locations.PreSplash:
				break;
			case sdk.game.locations.MainMenu:
				info.realm && ControlAction.clickRealm(realms[info.realm]);
				Controls.BattleNet.click();

				break;
			case sdk.game.locations.Login:
				Controls.LoginUsername.setText(info.account);
				Controls.LoginPassword.setText(info.password);
				Controls.Login.click();

				break;
			case sdk.game.locations.LoginUnableToConnect:
			case sdk.game.locations.RealmDown:
				// Unable to connect, let the caller handle it.
				me.blockMouse = false;

				return false;
			case sdk.game.locations.CharSelect:
				break MainLoop;
			case sdk.game.locations.SplashScreen:
				Controls.SplashScreen.click();

				break;
			case sdk.game.locations.CharSelectPleaseWait:
			case sdk.game.locations.MainMenuConnecting:
			case sdk.game.locations.CharSelectConnecting:
				break;
			case sdk.game.locations.CharSelectNoChars:
				// make sure we're not on connecting screen
				locTick = getTickCount();

				while (getTickCount() - locTick < 3000 && getLocation() === sdk.game.locations.CharSelectNoChars) {
					delay(25);
				}

				if (getLocation() === sdk.game.locations.CharSelectConnecting) {
					break;
				}

				break MainLoop; // break if we're sure we're on empty char screen
			default:
				print(getLocation());

				me.blockMouse = false;

				return false;
			}

			if (getTickCount() - tick >= 20000) {
				return false;
			}

			delay(100);
		}

		delay(1000);

		me.blockMouse = false;

		return getLocation() === sdk.game.locations.CharSelect || getLocation() === sdk.game.locations.CharSelectNoChars;
	},

	setEmail: function (email = "", domain = "@email.com") {
		if (getLocation() !== sdk.game.locations.RegisterEmail) return false;
		!email && (email = Starter.randomString(null, true));
		
		while (getLocation() !== sdk.game.locations.CharSelect) {
			switch (getLocation()) {
			case sdk.game.locations.RegisterEmail:
				if (Controls.EmailSetEmail.setText(email + domain) && Controls.EmailVerifyEmail.setText(email + domain)) {
					Controls.EmailRegister.click();
					delay(100);
				}

				break;
			case sdk.game.locations.LoginError:
				// todo test what conditions get here other than email not matching
				D2Bot.printToConsole("Failed to set email");
				Controls.LoginErrorOk.click();
				
				return false;
			}
		}

		return true;
	},

	makeAccount: function (info) {
		me.blockMouse = true;

		let realms = {
			"uswest": 0,
			"useast": 1,
			"asia": 2,
			"europe": 3
		};
		// cycle until in empty char screen
		while (getLocation() !== sdk.game.locations.CharSelectNoChars) {
			switch (getLocation()) {
			case sdk.game.locations.MainMenu:
				ControlAction.clickRealm(realms[info.realm]);
				Controls.BattleNet.click();

				break;
			case sdk.game.locations.Login:
				Controls.CreateNewAccount.click();

				break;
			case sdk.game.locations.SplashScreen:
				Controls.SplashScreen.click();

				break;
			case sdk.game.locations.CharacterCreate:
				Controls.CharSelectExit.click();

				break;
			case sdk.game.locations.TermsOfUse:
				Controls.TermsOfUseAgree.click();

				break;
			case sdk.game.locations.CreateNewAccount:
				Controls.CreateNewAccountName.setText(info.account);
				Controls.CreateNewAccountPassword.setText(info.password);
				Controls.CreateNewAccountConfirmPassword.setText(info.password);
				Controls.CreateNewAccountOk.click();

				break;
			case sdk.game.locations.PleaseRead:
				Controls.PleaseReadOk.click();

				break;
			case sdk.game.locations.RegisterEmail:
				Controls.EmailDontRegisterContinue.control ? Controls.EmailDontRegisterContinue.click() : Controls.EmailDontRegister.click();

				break;
			default:
				break;
			}

			delay(100);
		}

		me.blockMouse = false;

		return true;
	},

	findCharacter: function (info) {
		let count = 0;
		let tick = getTickCount();

		while (getLocation() !== sdk.game.locations.CharSelect) {
			if (getTickCount() - tick >= 5000) {
				break;
			}

			delay(25);
		}

		// start from beginning of the char list
		sendKey(0x24);

		while (getLocation() === sdk.game.locations.CharSelect && count < 24) {
			let control = Controls.CharSelectCharInfo0.control;

			if (control) {
				do {
					let text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						count++;

						if (text[1].toLowerCase() === info.charName.toLowerCase()) {
							return true;
						}
					}
				} while (count < 24 && control.getNext());
			}

			// check for additional characters up to 24
			if (count === 8 || count === 16) {
				if (Controls.CharSelectChar6.click()) {
					me.blockMouse = true;

					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);

					me.blockMouse = false;
				}
			} else {
				// no further check necessary
				break;
			}
		}

		return false;
	},

	// get all characters
	getCharacters: function () {
		let count = 0;
		let list = [];

		// start from beginning of the char list
		sendKey(0x24);

		while (getLocation() === sdk.game.locations.CharSelect && count < 24) {
			let control = Controls.CharSelectCharInfo0.control;

			if (control) {
				do {
					let text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						count++;

						if (list.indexOf(text[1]) === -1) {
							list.push(text[1]);
						}
					}
				} while (count < 24 && control.getNext());
			}

			// check for additional characters up to 24
			if (count === 8 || count === 16) {
				if (Controls.CharSelectChar6.click()) {
					me.blockMouse = true;
					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);

					me.blockMouse = false;
				}
			} else {
				// no further check necessary
				break;
			}
		}

		// back to beginning of the char list
		sendKey(0x24);

		return list;
	},

	getPermStatus: function (info) {
		let count = 0;
		let tick = getTickCount();
		let expireStr = getLocaleString(11133);
		expireStr = expireStr.slice(0, expireStr.indexOf("%")).trim();

		while (getLocation() !== sdk.game.locations.CharSelect) {
			if (getTickCount() - tick >= 5000) {
				break;
			}

			delay(25);
		}

		// start from beginning of the char list
		sendKey(0x24);

		while (getLocation() === sdk.game.locations.CharSelect && count < 24) {
			let control = Controls.CharSelectCharInfo0.control;

			if (control) {
				do {
					let text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						count++;

						if (text[1].toLowerCase() === info.charName.toLowerCase()) {
							return !text.some(el => el.includes(expireStr));
						}
					}
				} while (count < 24 && control.getNext());
			}

			// check for additional characters up to 24
			if (count === 8 || count === 16) {
				if (Controls.CharSelectChar6.click()) {
					me.blockMouse = true;

					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);

					me.blockMouse = false;
				}
			} else {
				// no further check necessary
				break;
			}
		}

		return false;
	},

	// get character position
	getPosition: function () {
		let position = 0;

		if (getLocation() === sdk.game.locations.CharSelect) {
			let control = Controls.CharSelectCharInfo0.control;

			if (control) {
				do {
					let text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						position += 1;
					}
				} while (control.getNext());
			}
		}

		return position;
	},

	loginCharacter: function (info, startFromTop = true) {
		me.blockMouse = true;

		let count = 0;

		// start from beginning of the char list
		startFromTop && sendKey(0x24);

		MainLoop:
		// cycle until in lobby or in game
		while (getLocation() !== sdk.game.locations.Lobby) {
			switch (getLocation()) {
			case sdk.game.locations.CharSelect:
				let control = Controls.CharSelectCharInfo0.control;

				if (control) {
					do {
						let text = control.getText();

						if (text instanceof Array && typeof text[1] === "string") {
							count++;

							if (text[1].toLowerCase() === info.charName.toLowerCase()) {
								control.click();
								Controls.CreateNewAccountOk.click();
								me.blockMouse = false;

								if (getLocation() === sdk.game.locations.SelectDifficultySP) {
									try {
										login(info.profile);
									} catch (err) {
										break MainLoop;
									}

									if (me.ingame) {
										return true;
									}
								}

								return true;
							}
						}
					} while (control.getNext());
				}

				// check for additional characters up to 24
				if (count === 8 || count === 16) {
					if (Controls.CharSelectChar6.click()) {
						sendKey(0x28);
						sendKey(0x28);
						sendKey(0x28);
						sendKey(0x28);
					}
				} else {
					// no further check necessary
					break MainLoop;
				}

				break;
			case sdk.game.locations.CharSelectNoChars:
				Controls.CharSelectExit.click();

				break;
			case sdk.game.locations.Disconnected:
			case sdk.game.locations.OkCenteredErrorPopUp:
				break MainLoop;
			default:
				break;
			}

			delay(100);
		}

		me.blockMouse = false;

		return false;
	},

	makeCharacter: function (info) {
		me.blockMouse = true;
		!info.charClass && (info.charClass = "barbarian");
		
		if (info.charName.match(/\d+/g)) {
			console.warn("Invalid character name, cannot contain numbers");

			return false;
		}

		let clickCoords = [];

		// cycle until in lobby
		while (getLocation() !== sdk.game.locations.Lobby) {
			switch (getLocation()) {
			case sdk.game.locations.CharSelect:
			case sdk.game.locations.CharSelectNoChars:
				// Create Character greyed out
				if (Controls.CharSelectCreate.disabled === sdk.game.controls.Disabled) {
					me.blockMouse = false;

					return false;
				}

				Controls.CharSelectCreate.click();

				break;
			case sdk.game.locations.CharacterCreate:
				switch (info.charClass) {
				case "barbarian":
					clickCoords = [400, 280];

					break;
				case "amazon":
					clickCoords = [100, 280];

					break;
				case "necromancer":
					clickCoords = [300, 290];

					break;
				case "sorceress":
					clickCoords = [620, 270];

					break;
				case "assassin":
					clickCoords = [200, 280];

					break;
				case "druid":
					clickCoords = [700, 280];

					break;
				case "paladin":
					clickCoords = [521, 260];

					break;
				}

				// coords:
				// zon: 100, 280
				// barb: 400, 280
				// necro: 300, 290
				// sin: 200, 280
				// paladin: 521 260
				// sorc: 620, 270
				// druid: 700, 280

				getControl().click(clickCoords[0], clickCoords[1]);
				delay(500);

				break;
			case sdk.game.locations.NewCharSelected:
				if (Controls.CharCreateHCWarningOk.control) {
					Controls.CharCreateHCWarningOk.click();
				} else {
					Controls.CharCreateCharName.setText(info.charName);

					!info.expansion && Controls.CharCreateExpansion.click();
					!info.ladder && Controls.CharCreateLadder.click();
					info.hardcore && Controls.CharCreateHardcore.click();

					Controls.CreateNewAccountOk.click();
				}

				break;
			case sdk.game.locations.OkCenteredErrorPopUp:
				// char name exists (text box 4, 268, 320, 264, 120)
				Controls.OkCentered.click();
				Controls.CharSelectExit.click();

				me.blockMouse = false;

				return false;
			default:
				break;
			}

			// Singleplayer loop break fix.
			if (me.ingame) {
				break;
			}

			delay(500);
		}

		me.blockMouse = false;

		return true;
	},

	// Test version - modified core only
	getGameList: function () {
		let text = Controls.JoinGameList.getText();

		if (text) {
			let gameList = [];

			for (let i = 0; i < text.length; i += 1) {
				gameList.push({
					gameName: text[i][0],
					players: text[i][1]
				});
			}

			return gameList;
		}

		return false;
	},

	deleteCharacter: function (info) {
		me.blockMouse = true;

		// start from beginning of the char list
		sendKey(0x24);
		
		// cycle until in lobby
		while (getLocation() === sdk.game.locations.CharSelect) {
			let count = 0;
			let control = Controls.CharSelectCharInfo0.control;

			if (control) {
				do {
					let text = control.getText();

					if (text instanceof Array && typeof text[1] === "string") {
						count++;

						if (text[1].toLowerCase() === info.charName.toLowerCase()) {
							print("delete character " + info.charName);
							
							control.click();
							Controls.CharSelectDelete.click();
							delay(500);
							Controls.CharDeleteYes.click();
							delay(500);
							me.blockMouse = false;
							
							return true;
						}
					}
				} while (control.getNext());
			}

			// check for additional characters up to 24
			if (count === 8 || count === 16) {
				if (Controls.CharSelectChar6.click()) {
					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);
					sendKey(0x28);
				}
			} else {
				// no further check necessary
				break;
			}

			delay(100);
		}

		me.blockMouse = false;

		return false;
	},

	getQueueTime: function() {
		// You are in line to create a game.,Try joining a game to avoid waiting.,,Your position in line is: ÿc02912
		const text = Controls.CreateGameInLine.getText();
		if (text && text.indexOf(getLocaleString(11026)) > -1) {
			const result = /ÿc0(\d*)/gm.exec(text);
			if (result && typeof result[1] === 'string') {
				return parseInt(result[1]) || 0;
			}
		}

		return 0; // You're in line 0, aka no queue
	},

	loginOtherMultiplayer: function () {
		MainLoop:
		while (true) {
			switch (getLocation()) {
			case sdk.game.locations.CharSelect:
				if (Controls.CharSelectCurrentRealm.control) {
					console.log("Not in single player character select screen");
					Controls.CharSelectExit.click();

					break;
				}

				Starter.LocationEvents.login(false);

				break;
			case sdk.game.locations.SelectDifficultySP:
				Starter.LocationEvents.selectDifficultySP();
				
				break;
			case sdk.game.locations.SplashScreen:
				ControlAction.click();

				break;
			case sdk.game.locations.MainMenu:
				if (Profile().type === sdk.game.profiletype.OpenBattlenet) {
					// check we are on the correct gateway
					let realms = {"west": 0, "east": 1, "asia": 2, "europe": 3};
					ControlAction.clickRealm(realms[Profile().gateway.toLowerCase()]);
					try {
						login(me.profile);
					} catch (e) {
						print(e);
					}

					break;
				}
				
				Controls.OtherMultiplayer.click();

				break;
			case sdk.game.locations.OtherMultiplayer:
				Starter.LocationEvents.otherMultiplayerSelect();

				break;
			case sdk.game.locations.TcpIp:
				// handle this in otherMultiplayerSelect
				// not sure how to handle enter ip though, should that be left to the starter to decide?
				Controls.TcpIpCancel.click();

				break;
			case sdk.game.locations.TcpIpEnterIp:
				break MainLoop;
			case sdk.game.locations.Login:
				login(me.profile);

				break;
			case sdk.game.locations.LoginUnableToConnect:
			case sdk.game.locations.TcpIpUnableToConnect:
				Starter.LocationEvents.unableToConnect();

				break;
			case sdk.game.locations.Lobby:
			case sdk.game.locations.LobbyChat:
				D2Bot.updateStatus("Lobby");

				if (me.charname !== Starter.profileInfo.charName) {
					Controls.LobbyQuit.click();
					
					break;
				}

				me.blockKeys = false;
				!Starter.firstLogin && (Starter.firstLogin = true);

				break MainLoop;
			default:
				if (me.ingame) {
					break MainLoop;
				}

				break;
			}
		}
		
		// handling Enter Ip inside entry for now so that location === sucess
		return (me.ingame || getLocation() === [sdk.game.locations.TcpIpEnterIp]);
	}
};

const ShitList = {
	create: function () {
		let obj = {
			shitlist: []
		};

		let string = JSON.stringify(obj);

		//FileTools.writeText("shitlist.json", string);
		Misc.fileAction("shitlist.json", 1, string);

		return obj;
	},

	getObj: function () {
		let obj;
		let string = Misc.fileAction("shitlist.json", 0);
		//string = FileTools.readText("shitlist.json");

		try {
			obj = JSON.parse(string);
		} catch (e) {
			obj = this.create();
		}

		if (obj) {
			return obj;
		}

		print("Failed to read ShitList. Using null values");

		return {shitlist: []};
	},

	read: function () {
		!FileTools.exists("shitlist.json") && this.create();
		
		let obj = this.getObj();

		return obj.shitlist;
	},

	add: function (name) {
		let obj = this.getObj();

		obj.shitlist.push(name);

		let string = JSON.stringify(obj);

		//FileTools.writeText("shitlist.json", string);
		Misc.fileAction("shitlist.json", 1, string);
	}
};

const Starter = {
	Config: {},
	useChat: false,
	pingQuit: false,
	inGame: false,
	firstLogin: true,
	firstRun: false,
	isUp: "no",
	loginRetry: 0,
	deadCheck: false,
	chatActionsDone: false,
	gameStart: 0,
	gameCount: 0,
	lastGameStatus: "ready",
	handle: undefined,
	connectFail: false,
	connectFailRetry: 0,
	makeAccount: false,
	channelNotify: false,
	chanInfo: {
		joinChannel: "",
		firstMsg: "",
		afterMsg: "",
		announce: false
	},
	gameInfo: {},
	joinInfo: {},
	profileInfo: {},

	sayMsg: function (string) {
		if (!this.useChat) return;
		say(string);
	},

	timer: function (tick) {
		return " (" + new Date(getTickCount() - tick).toISOString().slice(11, -5) + ")";
	},

	locationTimeout: function (time, location) {
		let endtime = getTickCount() + time;

		while (!me.ingame && getLocation() === location && endtime > getTickCount()) {
			delay(500);
		}

		return (getLocation() !== location);
	},

	setNextGame: function (gameInfo = {}) {
		let nextGame = (gameInfo.gameName || this.randomString(null, true));
		
		if ((this.gameCount + 1 >= Starter.Config.ResetCount) || (nextGame.length + this.gameCount + 1 > 15)) {
			nextGame += "1";
		} else {
			nextGame += (this.gameCount + 1);
		}

		DataFile.updateStats("nextGame", nextGame);
	},

	updateCount: function () {
		D2Bot.updateCount();
		delay(1000);
		Controls.BattleNet.click();

		try {
			login(me.profile);
		} catch (e) {
			return;
		}

		delay(1000);
		Controls.CharSelectExit.click();
	},

	scriptMsgEvent: function (msg) {
		if (msg && typeof msg !== "string") return;
		switch (msg) {
		case "mule":
			AutoMule.check = true;

			break;
		case "muleTorch":
			AutoMule.torchAnniCheck = 1;

			break;
		case "muleAnni":
			AutoMule.torchAnniCheck = 2;

			break;
		case "torch":
			TorchSystem.check = true;

			break;
		case "crafting":
			CraftingSystem.check = true;

			break;
		case "getMuleMode":
			if (AutoMule.torchAnniCheck === 2) {
				scriptBroadcast("2");
			} else if (AutoMule.torchAnniCheck === 1) {
				scriptBroadcast("1");
			} else if (AutoMule.check) {
				scriptBroadcast("0");
			}

			break;
		case "pingquit":
			this.pingQuit = true;

			break;
		}
	},

	receiveCopyData: function (mode, msg) {
		let obj;

		msg === "Handle" && typeof mode === "number" && (Starter.handle = mode);

		switch (mode) {
		case 1: // JoinInfo
			obj = JSON.parse(msg);
			Object.assign(Starter.joinInfo, obj);

			break;
		case 2: // Game info
			print("Recieved Game Info");
			obj = JSON.parse(msg);
			Object.assign(Starter.gameInfo, obj);

			break;
		case 3: // Game request
			// Don't let others join mule/torch/key/gold drop game
			if (AutoMule.inGame || Gambling.inGame || TorchSystem.inGame || CraftingSystem.inGame) {
				break;
			}

			if (Object.keys(Starter.gameInfo).length) {
				obj = JSON.parse(msg);

				if ([sdk.game.profiletype.TcpIpHost, sdk.game.profiletype.TcpIpJoin].includes(Profile().type)) {
					me.gameReady && D2Bot.joinMe(obj.profile, me.gameserverip.toString(), "", "", Starter.isUp);
				} else {
					if (me.gameReady) {
						D2Bot.joinMe(obj.profile, me.gamename.toLowerCase(), "", me.gamepassword.toLowerCase(), Starter.isUp);
					} else {
						D2Bot.joinMe(obj.profile, Starter.gameInfo.gameName.toLowerCase(), Starter.gameCount, Starter.gameInfo.gamePass.toLowerCase(), Starter.isUp);
					}
				}
			}

			break;
		case 4: // Heartbeat ping
			msg === "pingreq" && sendCopyData(null, me.windowtitle, 4, "pingrep");

			break;
		case 61732: // Cached info retreival
			msg !== "null" && (Starter.gameInfo.crashInfo = JSON.parse(msg));

			break;
		case 1638: // getProfile
			try {
				obj = JSON.parse(msg);
				Starter.profileInfo.profile = me.profile;
				Starter.profileInfo.account = obj.account;
				Starter.profileInfo.charName = obj.Character;
				obj.Realm = obj.Realm.toLowerCase();
				Starter.profileInfo.realm = ["east", "west"].includes(obj.Realm) ? "us" + obj.Realm : obj.Realm;
			} catch (e) {
				print(e);
			}

			break;
		}
	},

	randomString: function (len, useNumbers = false) {
		len === undefined && (len = rand(5, 14));

		let rval = "";
		let letters = useNumbers ? "abcdefghijklmnopqrstuvwxyz0123456789" : "abcdefghijklmnopqrstuvwxyz";

		for (let i = 0; i < len; i += 1) {
			rval += letters[rand(0, letters.length - 1)];
		}

		return rval;
	},

	randomNumberString: function (len) {
		len === undefined && (len = rand(2, 5));

		let rval = "";
		let vals = "0123456789";

		for (let i = 0; i < len; i += 1) {
			rval += vals[rand(0, vals.length - 1)];
		}

		return rval;
	},

	LocationEvents: {
		selectDifficultySP: function () {
			let diff = (Starter.gameInfo.difficulty || "Highest");
			diff === "Highest" && (diff = "Hell"); // starts from top with fall-through to select highest

			switch (diff) {
			case "Hell":
				if (Controls.HellSP.click() && Starter.locationTimeout(1e3, sdk.game.locations.SelectDifficultySP)) {
					break;
				}
			// eslint-disable-next-line no-fallthrough
			case "Nightmare":
				if (Controls.NightmareSP.click() && Starter.locationTimeout(1e3, sdk.game.locations.SelectDifficultySP)) {
					break;
				}
			// eslint-disable-next-line no-fallthrough
			case "Normal":
				Controls.NormalSP.click();

				break;
			}
			return Starter.locationTimeout(5e3, sdk.game.locations.SelectDifficultySP);
		},

		loginError: function () {
			let cdkeyError = false;
			let defaultPrint = true;
			let string = "";
			let text = (Controls.LoginErrorText.getText() || Controls.LoginInvalidCdKey.getText());

			if (text) {
				for (let i = 0; i < text.length; i += 1) {
					string += text[i];
					i !== text.length - 1 && (string += " ");
				}

				switch (string) {
				case getLocaleString(sdk.locale.text.UsenameIncludedIllegalChars):
				case getLocaleString(sdk.locale.text.UsenameIncludedDisallowedwords):
				case getLocaleString(sdk.locale.text.UsernameMustBeAtLeast):
				case getLocaleString(sdk.locale.text.PasswordMustBeAtLeast):
				case getLocaleString(sdk.locale.text.AccountMustBeAtLeast):
				case getLocaleString(sdk.locale.text.PasswordCantBeMoreThan):
				case getLocaleString(sdk.locale.text.AccountCantBeMoreThan):
					D2Bot.printToConsole(string);
					D2Bot.stop();

					break;
				case getLocaleString(sdk.locale.text.InvalidPassword):
					D2Bot.printToConsole("Invalid Password");
					ControlAction.timeoutDelay("Invalid password delay", Starter.Config.InvalidPasswordDelay * 6e4);
					D2Bot.printToConsole("Invalid Password - Restart");
					D2Bot.restart();

					break;
				case getLocaleString(sdk.locale.text.AccountDoesNotExist):
					if (!!Starter.Config.MakeAccountOnFailure) {
						Starter.makeAccount = true;
						Controls.LoginErrorOk.click();

						return;
					} else {
						D2Bot.printToConsole(string);
						D2Bot.updateStatus(string);
					}

					break;
				case getLocaleString(sdk.locale.text.AccountIsCorrupted):
				case getLocaleString(sdk.locale.text.UnableToCreateAccount):
					D2Bot.printToConsole(string);
					D2Bot.updateStatus(string);

					break;
				case getLocaleString(sdk.locale.text.Disconnected):
					D2Bot.updateStatus("Disconnected");
					D2Bot.printToConsole("Disconnected");
					Controls.OkCentered.click();
					Controls.LoginErrorOk.click();

					return;
				case getLocaleString(sdk.locale.text.CdKeyIntendedForAnotherProduct):
				case getLocaleString(sdk.locale.text.LoDKeyIntendedForAnotherProduct):
				case getLocaleString(sdk.locale.text.CdKeyDisabled):
				case getLocaleString(sdk.locale.text.LoDKeyDisabled):
					cdkeyError = true;

					break;
				case getLocaleString(sdk.locale.text.CdKeyInUseBy):
					string += (" " + Controls.LoginCdKeyInUseBy.getText());
					D2Bot.printToConsole(Starter.gameInfo.mpq + " " + string, 6);
					D2Bot.CDKeyInUse();

					if (Starter.gameInfo.switchKeys) {
						cdkeyError = true;
					} else {
						Controls.UnableToConnectOk.click();
						ControlAction.timeoutDelay("LoD key in use", Starter.Config.CDKeyInUseDelay * 6e4);
						
						return;
					}

					break;
				case getLocaleString(sdk.locale.text.LoginError):
				case getLocaleString(sdk.locale.text.OnlyOneInstanceAtATime):
					Controls.LoginErrorOk.click();
					Controls.LoginExit.click();
					D2Bot.printToConsole(string);
					ControlAction.timeoutDelay("Login Error Delay", 5 * 6e4);
					D2Bot.printToConsole("Login Error - Restart");
					D2Bot.restart();

					break;
				default:
					D2Bot.updateStatus("Login Error");
					D2Bot.printToConsole("Login Error - " + string);
					cdkeyError = true;
					defaultPrint = false;

					break;
				}

				if (cdkeyError) {
					defaultPrint && D2Bot.printToConsole(string + Starter.gameInfo.mpq, 6);
					defaultPrint && D2Bot.updateStatus(string);
					D2Bot.CDKeyDisabled();
					if (Starter.gameInfo.switchKeys) {
						ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
						D2Bot.restart(true);
					} else {
						D2Bot.stop();
					}
				}

				Controls.LoginErrorOk.click();
				delay(1000);
				Controls.CharSelectExit.click();
		
				while (true) {
					delay(1000);
				}
			}
		},

		charSelectError: function () {
			let string = "";
			let text = Controls.CharSelectError.getText();
			let currentLoc = getLocation();

			if (text) {
				for (let i = 0; i < text.length; i += 1) {
					string += text[i];
					i !== text.length - 1 && (string += " ");
				}

				if (string === getLocaleString(sdk.locale.text.CdKeyDisabledFromRealm)) {
					D2Bot.updateStatus("Realm Disabled CDKey");
					D2Bot.printToConsole("Realm Disabled CDKey: " + Starter.gameInfo.mpq, 6);
					D2Bot.CDKeyDisabled();

					if (Starter.gameInfo.switchKeys) {
						ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
						D2Bot.restart(true);
					} else {
						D2Bot.stop();
					}
				}
			}

			if (!Starter.locationTimeout(Starter.Config.ConnectingTimeout * 1e3, currentLoc)) {
				// Click create char button on infinite "connecting" screen
				Controls.CharSelectCreate.click();
				delay(1000);
				
				Controls.CharSelectExit.click();
				delay(1000);
				
				if (getLocation() !== sdk.game.locations.CharSelectConnecting) return true;
				
				Controls.CharSelectExit.click();
				Starter.gameInfo.rdBlocker && D2Bot.restart();

				return false;
			}

			return true;
		},

		realmDown: function () {
			D2Bot.updateStatus("Realm Down");
			delay(1000);

			if (!Controls.CharSelectExit.click()) return;

			Starter.updateCount();
			ControlAction.timeoutDelay("Realm Down", Starter.Config.RealmDownDelay * 6e4);
			D2Bot.CDKeyRD();

			if (Starter.gameInfo.switchKeys && !Starter.gameInfo.rdBlocker) {
				D2Bot.printToConsole("Realm Down - Changing CD-Key");
				ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
				D2Bot.restart(true);
			} else {
				D2Bot.printToConsole("Realm Down - Restart");
				D2Bot.restart();
			}
		},

		waitingInLine: function () {
			let queue = ControlAction.getQueueTime();
			let currentLoc = getLocation();

			if (queue > 0) {
				switch (true) {
				case (queue < 10000):
					D2Bot.updateStatus("Waiting line... Queue: " + queue);

					// If stuck here for too long, game creation likely failed. Exit to char selection and try again.
					if (queue < 10) {
						if (!Starter.locationTimeout(Starter.Config.WaitInLineTimeout * 1e3, currentLoc)) {
							print("Failed to create game");
							Controls.CancelCreateGame.click();
							Controls.LobbyQuit.click();
							delay(1000);
						}
					}

					break;
				case (queue > 10000):
					if (Starter.Config.WaitOutQueueRestriction) {
						D2Bot.updateStatus("Waiting out Queue restriction: " + queue);
					} else {
						print("Restricted... Queue: " + queue);
						D2Bot.printToConsole("Restricted... Queue: " + queue, 9);
						Controls.CancelCreateGame.click();

						if (Starter.Config.WaitOutQueueExitToMenu) {
							Controls.LobbyQuit.click();
							delay(1000);
							Controls.CharSelectExit.click();
						}

						// Wait out each queue as 1 sec and add extra 10 min
						ControlAction.timeoutDelay("Restricted", (queue + 600) * 1000);
					}

					break;
				}
			}
		},

		gameDoesNotExist: function () {
			let currentLoc = getLocation();
			console.log("Game doesn't exist");

			if (Starter.gameInfo.rdBlocker) {
				D2Bot.printToConsole(Starter.gameInfo.mpq + " is probably flagged.", 6);

				if (Starter.gameInfo.switchKeys) {
					ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
					D2Bot.restart(true);
				}
			} else {
				Starter.locationTimeout(Starter.Config.GameDoesNotExistTimeout * 1e3, currentLoc);
			}

			Starter.lastGameStatus = "ready";
		},

		unableToConnect: function () {
			let currentLoc = getLocation();

			if (getLocation() === sdk.game.locations.TcpIpUnableToConnect) {
				D2Bot.updateStatus("Unable To Connect TCP/IP");
				Starter.connectFail && ControlAction.timeoutDelay("Unable to Connect", Starter.Config.TCPIPNoHostDelay * 1e3);
				Controls.OkCentered.click();
				Starter.connectFail = !Starter.connectFail;
			} else {
				D2Bot.updateStatus("Unable To Connect");

				if (Starter.connectFailRetry < 2) {
					Starter.connectFailRetry++;
					Controls.UnableToConnectOk.click();

					return;
				}

				Starter.connectFailRetry >= 2 && (Starter.connectFail = true);

				if (Starter.connectFail && !Starter.locationTimeout(10e4, currentLoc)) {
					let string = "";
					let text = Controls.LoginUnableToConnect.getText();

					if (text) {
						for (let i = 0; i < text.length; i++) {
							string += text[i];
							i !== text.length - 1 && (string += " ");
						}
					}
					
					switch (string) {
					case getLocaleString(sdk.locale.text.UnableToIndentifyVersion):
						Controls.UnableToConnectOk.click();
						ControlAction.timeoutDelay("Version error", Starter.Config.VersionErrorDelay * 1000);
						
						break;
					default: // Regular UTC and everything else
						Controls.UnableToConnectOk.click();
						ControlAction.timeoutDelay("Unable to Connect", Starter.Config.UnableToConnectDelay * 1000 * 60);
						
						break;
					}

					Starter.connectFail = false;
				}

				if (!Controls.UnableToConnectOk.click()) {
					return;
				}

				Starter.connectFail = true;
				Starter.connectFailRetry = 0;
			}
		},

		openCreateGameWindow: function () {
			let currentLoc = getLocation();

			if (!Controls.CreateGameWindow.click()) {
				return true;
			}

			// dead HardCore character
			if (Controls.CreateGameWindow.control && Controls.CreateGameWindow.disabled === sdk.game.controls.Disabled) {
				if (Starter.Config.StopOnDeadHardcore) {
					D2Bot.printToConsole(Profile().character + " has died. They shall be remembered...maybe. Shutting down, better luck next time", 6);
					D2Bot.stop();
				} else {
					D2Bot.printToConsole(Profile().character + " has died. They shall be remembered...maybe. Better luck next time", 6);
					D2Bot.updateStatus(Profile().character + " has died. They shall be remembered...maybe. Better luck next time");
					Starter.deadCheck = true;
					Controls.LobbyQuit.click();
				}

				return false;
			}

			// in case create button gets bugged
			if (!Starter.locationTimeout(5000, currentLoc)) {
				if (!Controls.CreateGameWindow.click()) {
					return true;
				}

				if (!Controls.JoinGameWindow.click()) {
					return true;
				}
			}

			return (getLocation() === sdk.game.locations.CreateGame);
		},

		openJoinGameWindow: function () {
			let currentLoc = getLocation();

			if (!Controls.JoinGameWindow.click()) {
				return;
			}

			// in case create button gets bugged
			if (!Starter.locationTimeout(5000, currentLoc)) {
				if (!Controls.CreateGameWindow.click()) {
					return;
				}

				if (!Controls.JoinGameWindow.click()) {
					return;
				}
			}
		},

		login: function (otherMultiCheck = false) {
			Starter.inGame && (Starter.inGame = false);
			if (otherMultiCheck && [sdk.game.gametype.SinglePlayer, sdk.game.gametype.BattleNet].indexOf(Profile().type) === -1) {
				return ControlAction.loginOtherMultiplayer();
			}

			if (getLocation() === sdk.game.locations.MainMenu) {
				if (Profile().type === sdk.game.profiletype.SinglePlayer
					&& Starter.firstRun
					&& Controls.SinglePlayer.click()) {
					return true;
				}
			}

			// Wrong char select screen fix
			if (getLocation() === sdk.game.locations.CharSelect) {
				hideConsole(); // seems to fix odd crash with single-player characters if the console is open to type in
				if ((Profile().type === sdk.game.profiletype.Battlenet && !Controls.CharSelectCurrentRealm.control)
					|| ((Profile().type !== sdk.game.profiletype.Battlenet && Controls.CharSelectCurrentRealm.control))) {
					Controls.CharSelectExit.click();
				
					return false;
				}
			}

			// Multiple realm botting fix in case of R/D or disconnect
			Starter.firstLogin && getLocation() === sdk.game.locations.Login && Controls.CharSelectExit.click();
	
			D2Bot.updateStatus("Logging In");
					
			try {
				login(me.profile);
			} catch (e) {
				if (getLocation() === sdk.game.locations.CharSelect && Starter.loginRetry < 2) {
					if (!ControlAction.findCharacter(Starter.profileInfo)) {
						// dead hardcore character on sp
						if (getLocation() === sdk.game.locations.OkCenteredErrorPopUp) {
							// Exit from that pop-up
							Controls.OkCentered.click();
							D2Bot.printToConsole("Character died", 9);
							D2Bot.stop();
						} else {
							Starter.loginRetry++;
						}
					} else {
						login(me.profile);
					}
				} else if (getLocation() === sdk.game.locations.TcpIpEnterIp && Profile().type === sdk.game.profiletype.TcpIpJoin) {
					return true; // handled in its own case
				} else {
					print(e + " " + getLocation());
				}
			}

			return true;
		},

		otherMultiplayerSelect: function () {
			if ([sdk.game.profiletype.TcpIpHost, sdk.game.profiletype.TcpIpJoin].includes(Profile().type)) {
				Controls.TcpIp.click() && (Profile().type === sdk.game.profiletype.TcpIpHost ? Controls.TcpIpHost.click() : Controls.TcpIpJoin.click());
			} else if (Profile().type === sdk.game.profiletype.OpenBattlenet) {
				Controls.OpenBattleNet.click();
			} else {
				Controls.OtherMultiplayerCancel.click();
			}
		}
	},
};
