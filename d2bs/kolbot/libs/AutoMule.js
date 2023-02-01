/**
*  @filename    AutoMule.js
*  @author      kolton, theBGuy
*  @desc        Configuration file for Mule system
*
*/

const AutoMule = {
	Mules: {
		"Mule1": {
			muleProfile: "", // The name of mule profile in d2bot#. It will be started and stopped when needed.
			accountPrefix: "", // Account prefix. Numbers added automatically when making accounts.
			accountPassword: "", // Account password.
			charPrefix: "", // Character prefix. Suffix added automatically when making characters.
			realm: "", // Available options: "useast", "uswest", "europe", "asia"
			expansion: true,
			ladder: true,
			hardcore: false,
			charsPerAcc: 18, // Maximum number of mules to create per account (between 1 to 18)

			// Game name and password of the mule game. Never use the same game name as for mule logger.
			muleGameName: ["", ""], // ["gamename", "password"]

			// List of profiles that will mule items. Example: enabledProfiles: ["profile 1", "profile 2"],
			enabledProfiles: [""],

			// Stop a profile prior to muling. Useful when running 8 bots without proxies.
			stopProfile: "",
			stopProfileKeyRelease: false, // true = stopProfile key will get released on stop. useful when using 100% of your keys for botting.

			// Trigger muling at the end of a game if used space in stash and inventory is equal to or more than given percent.
			usedStashTrigger: 80,
			usedInventoryTrigger: 80,

			// Mule items that have been stashed at some point but are no longer in pickit.
			muleOrphans: true,
			// Continuous Mule settings
			continuousMule:	false, // Mule stays in game for continuous muling. muleProfile must be dedicated and started manually.
			skipMuleResponse: false, // Skip mule response check and attempt to join mule game. Useful if mule is shared and/or ran on different system.
			onlyLogWhenFull: false // Only log character when full, solves an issue with droppers attempting to use characters who are already in game
		}
	},

	/** Torch/Anni mules
		- Torch is muled in OrgTorch script after finishing uber Tristram successfully or when starting OrgTorch script with a Torch already on the character.
		- Anni is muled after successfully killing Diablo in Palace Cellar level 3 using Config.KillDclone option or KillDClone script.
			If a profile is listed in Torch/Anni mule's enabledProfiles list, it will also do a check to mule Anni at the end of each game.
			Anni that is in locked inventory slot will not be muled.

		* Each mule will hold either a Torch or an Anni, but not both. As soon as the current mule has either one, a new one will be created.
	*/
	TorchAnniMules: {
		"Mule1": {
			muleProfile: "", // The name of mule profile in d2bot#. It will be started and stopped when needed.
			accountPrefix: "", // Account prefix. Numbers added automatically when making accounts.
			accountPassword: "", // Account password.
			charPrefix: "", // Character prefix. Suffix added automatically when making characters.
			realm: "", // Available options: "useast", "uswest", "europe", "asia"
			expansion: true,
			ladder: true,
			hardcore: false,
			charsPerAcc: 8, // Maximum number of mules to create per account (between 1 to 18)

			// Game name and password of the mule game. Never use the same game name as for mule logger.
			muleGameName: ["", ""], // ["gamename", "password"]

			// List of profiles that will mule items. Example: enabledProfiles: ["profile 1", "profile 2"],
			enabledProfiles: [""],

			// Stop a profile prior to muling. Useful when running 8 bots without proxies.
			stopProfile: "",
			stopProfileKeyRelease: false, // true = stopProfile key will get released on stop. useful when using 100% of your keys for botting.

			// Continuous Mule settings
			continuousMule:	true, // Mule stays in game for continuous muling. muleProfile must be dedicated and started manually.
			skipMuleResponse: true, // Skip mule response check and attempt to join mule game. Useful if mule is shared and/or ran on different system.
			onlyLogWhenFull: true // Only log character when full, solves an issue with droppers attempting to use characters who are already in game
		}
		//##########################################################################################
	},

	inGame: false,
	check: false,
	torchAnniCheck: false,
	gids: [],

	// *** Master functions ***
	getInfo: function () {
		let info;

		for (let i in this.Mules) {
			if (this.Mules.hasOwnProperty(i)) {
				for (let j = 0; j < this.Mules[i].enabledProfiles.length; j += 1) {
					if (this.Mules[i].enabledProfiles[j].toLowerCase() === me.profile.toLowerCase()) {
						!info && (info = {});
						info.muleInfo = this.Mules[i];

						break;
					}
				}
			}
		}

		for (let i in this.TorchAnniMules) {
			if (this.TorchAnniMules.hasOwnProperty(i)) {
				for (let j = 0; j < this.TorchAnniMules[i].enabledProfiles.length; j += 1) {
					if (this.TorchAnniMules[i].enabledProfiles[j].toLowerCase() === me.profile.toLowerCase()) {
						!info && (info = {});
						info.torchMuleInfo = this.TorchAnniMules[i];

						break;
					}
				}
			}
		}

		return info;
	},

	muleCheck: function () {
		let info = this.getInfo();

		if (info && info.hasOwnProperty("muleInfo")) {
			let items = this.getMuleItems();

			if (info.muleInfo.hasOwnProperty("usedStashTrigger") && info.muleInfo.hasOwnProperty("usedInventoryTrigger")
				&& Storage.Inventory.UsedSpacePercent() >= info.muleInfo.usedInventoryTrigger
				&& Storage.Stash.UsedSpacePercent() >= info.muleInfo.usedStashTrigger && items.length > 0) {
				D2Bot.printToConsole("MuleCheck triggered!", sdk.colors.D2Bot.DarkGold);

				return true;
			}

			for (let i = 0; i < items.length; i += 1) {
				if (this.matchItem(items[i], Config.AutoMule.Trigger)) {
					D2Bot.printToConsole("MuleCheck triggered!", sdk.colors.D2Bot.DarkGold);
					return true;
				}
			}
		}

		return false;
	},

	getMule: function () {
		let info = this.getInfo();

		if (info) {
			if (this.check && info.hasOwnProperty("muleInfo")) return info.muleInfo;
			if (this.torchAnniCheck && info.hasOwnProperty("torchMuleInfo")) return info.torchMuleInfo;
		}

		return false;
	},

	outOfGameCheck: function () {
		if (!this.check && !this.torchAnniCheck) return false;

		let muleObj = this.getMule();
		if (!muleObj) return false;

		function muleCheckEvent(mode, msg) {
			mode === 10 && (muleInfo = JSON.parse(msg));
		}

		let stopCheck = false;
		let once = false;
		let muleInfo = {status: ""};
		let failCount = 0;
		let Controls = require("./modules/Control");

		if (!muleObj.continuousMule || !muleObj.skipMuleResponse) {
			addEventListener("copydata", muleCheckEvent);
		}

		if (muleObj.continuousMule) {
			D2Bot.printToConsole("Starting mule.", sdk.colors.D2Bot.DarkGold);
			D2Bot.start(muleObj.muleProfile);
		} else {
			D2Bot.printToConsole("Starting " + (this.torchAnniCheck === 2 ? "anni " : this.torchAnniCheck === 1 ? "torch " : "") + "mule profile: " + muleObj.muleProfile, sdk.colors.D2Bot.DarkGold);
		}

		MainLoop:
		while (true) {
			// Set status to ready if using continuous mule with no response check
			if (muleObj.continuousMule && muleObj.skipMuleResponse) {
				muleInfo.status = "ready";
				
			// If nothing received our copy data start the mule profile
			} else if (!sendCopyData(null, muleObj.muleProfile, 10, JSON.stringify({profile: me.profile, mode: this.torchAnniCheck || 0})) && !muleObj.continuousMule) {
				// if the mule profile isn't already running and there is a profile to be stopped, stop it before starting the mule profile
				if (!stopCheck && muleObj.stopProfile && !String.isEqual(me.profile, muleObj.stopProfile)) {
					D2Bot.stop(muleObj.stopProfile, muleObj.stopProfileKeyRelease);
					stopCheck = true;
					delay(2000); // prevents cd-key in use error if using -skiptobnet on mule profile
				}

				D2Bot.start(muleObj.muleProfile);
			}

			delay(1000);

			switch (muleInfo.status) {
			case "loading":
				if (!muleObj.continuousMule && !stopCheck && muleObj.stopProfile && !String.isEqual(me.profile, muleObj.stopProfile)) {
					D2Bot.stop(muleObj.stopProfile, muleObj.stopProfileKeyRelease);

					stopCheck = true;
				}

				failCount += 1;

				break;
			case "busy":
			case "begin":
				D2Bot.printToConsole("Mule profile is busy.", sdk.colors.D2Bot.Red);

				break MainLoop;
			case "ready":
				Starter.LocationEvents.openJoinGameWindow();

				delay(2000);

				this.inGame = true;
				me.blockMouse = true;

				try {
					joinGame(muleObj.muleGameName[0], muleObj.muleGameName[1]);
				} catch (joinError) {
					delay(100);
				}

				me.blockMouse = false;

				// Untested change 11.Feb.14.
				for (let i = 0; i < 8; i += 1) {
					delay(1000);

					if (me.ingame && me.gameReady) {
						break MainLoop;
					}
				}

				if (!once && getLocation() === sdk.game.locations.GameIsFull) {
					Controls.CreateGameWindow.click();
					Starter.LocationEvents.openJoinGameWindow();
					// how long should we wait?
					once = true;
					let date = new Date();
					let dateString = "[" + new Date(
						date.getTime() + Time.minutes(3) - (date.getTimezoneOffset() * 60000)
					).toISOString().slice(0, -5).replace(/-/g, "/").replace("T", " ") + "]";
					console.log("Game is full so lets hangout for a bit before we try again. Next attempt at " + dateString);
				}

				if (muleObj.continuousMule && muleObj.skipMuleResponse && !me.ingame) {
					D2Bot.printToConsole("Unable to join mule game", sdk.colors.D2Bot.Red);

					break MainLoop;
				}

				break;
			default:
				failCount += 1;

				break;
			}

			if (failCount >= 260) {
				D2Bot.printToConsole("No response from mule profile.", sdk.colors.D2Bot.Red);

				break;
			}
		}

		removeEventListener("copydata", muleCheckEvent);

		while (me.ingame) {
			delay(1000);
		}

		this.inGame = false;
		this.check = false;
		this.torchAnniCheck = false;

		// No response - stop mule profile
		if (!muleObj.continuousMule) {
			if (failCount >= 60) {
				D2Bot.stop(muleObj.muleProfile, true);
				delay(1000);
			}

			if (stopCheck && muleObj.stopProfile) {
				D2Bot.start(muleObj.stopProfile);
			}
		}

		return true;
	},

	inGameCheck: function () {
		let muleObj, tick;
		let begin = false;
		let timeout = Time.minutes(4); // Ingame mule timeout
		let status = "muling";

		// Single player
		if (!me.gamename) return false;

		let info = this.getInfo();

		// Profile is not a part of AutoMule
		if (!info) return false;

		// Profile is not in mule or torch mule game
		if (!((info.hasOwnProperty("muleInfo") && String.isEqual(me.gamename, info.muleInfo.muleGameName[0]))
				|| (info.hasOwnProperty("torchMuleInfo") && String.isEqual(me.gamename, info.torchMuleInfo.muleGameName[0])))) {
			return false;
		}

		function dropStatusEvent (mode, msg) {
			if (mode === 10) {
				switch (JSON.parse(msg).status) {
				case "report": // reply to status request
					sendCopyData(null, muleObj.muleProfile, 12, JSON.stringify({status: status}));

					break;
				case "quit": // quit command
					status = "quit";

					break;
				}
			}
		}

		function muleModeEvent (msg) {
			switch (msg) {
			case "2":
			case "1":
				AutoMule.torchAnniCheck = Number(msg);

				break;
			case "0":
				AutoMule.check = true;
			}
		}

		try {
			addEventListener("scriptmsg", muleModeEvent);
			scriptBroadcast("getMuleMode");
			delay(500);

			if (!this.check && !this.torchAnniCheck) {
				throw new Error("Error - Unable to determine mule mode");
			}

			muleObj = this.getMule();
			me.maxgametime = 0;

			!muleObj.continuousMule && addEventListener("copydata", dropStatusEvent);

			if (!Town.goToTown(1)) {
				throw new Error("Error - Failed to go to Act 1");
			}

			Town.move("stash");

			if (muleObj.continuousMule) {
				print("ÿc4AutoMuleÿc0: Looking for valid mule");
				tick = getTickCount();

				while (getTickCount() - tick < timeout) {
					if (this.verifyMulePrefix(muleObj.charPrefix)) {
						print("ÿc4AutoMuleÿc0: Found valid mule");
						begin = true;

						break;
					}

					delay(2000);
				}

				if (!begin) {
					throw new Error("Error - Unable to find mule character");
				}
			} else {
				sendCopyData(null, muleObj.muleProfile, 11, "begin");
			}

			let gameType = this.torchAnniCheck === 2 ? " anni" : this.torchAnniCheck === 1 ? " torch" : "";
			print("ÿc4AutoMuleÿc0: In" + gameType + " mule game.");
			D2Bot.updateStatus("AutoMule: In" + gameType + " mule game.");
			
			if (this.torchAnniCheck === 2) {
				this.dropCharm(true);
			} else if (this.torchAnniCheck === 1) {
				this.dropCharm(false);
			} else {
				this.dropStuff();
			}

			status = "done";
			tick = getTickCount();

			while (true) {
				if (muleObj.continuousMule) {
					if (this.isFinished()) {
						D2Bot.printToConsole("Done muling.", sdk.colors.D2Bot.DarkGold);
						status = "quit";
					} else {
						delay(5000);
					}
				}

				if (status === "quit") {
					break;
				}

				if (getTickCount() - tick > timeout) {
					if (Misc.getPlayerCount() > 1) {
						// we aren't alone currently so chill for a bit longer
						tick = getTickCount();
						Packet.questRefresh(); // to prevent disconnect from idleing
					} else {
						D2Bot.printToConsole("Mule didn't rejoin. Picking up items.", sdk.colors.D2Bot.Red);
						Misc.useItemLog = false; // Don't log items picked back up in town.
						Pickit.pickItems();

						break;
					}
				}

				delay(500);
			}
			
			return true;
		} catch (e) {
			console.error(e);

			return false;
		} finally {
			removeEventListener("scriptmsg", muleModeEvent);
			removeEventListener("copydata", dropStatusEvent);
			
			if (!muleObj.continuousMule) {
				D2Bot.stop(muleObj.muleProfile, true);
				delay(1000);
				muleObj.stopProfile && D2Bot.start(muleObj.stopProfile);
			}

			delay(2000);
			quit();
		}
	},

	// finished if no items are on ground
	isFinished: function () {
		let item = Game.getItem();

		if (item) {
			do {
				// check if the items we dropped are on the ground still
				if (getDistance(me, item) < 20 && item.onGroundOrDropping && AutoMule.gids.includes(item.gid)) {
					return false;
				}
			} while (item.getNext());
		}

		// we are finished so reset gid list
		AutoMule.gids.length = 0;

		return true;
	},

	// make sure mule character is in game
	verifyMulePrefix: function (mulePrefix) {
		try {
			let player = getParty();

			if (player) {
				let regex = new RegExp(mulePrefix, "i");

				do {
					// case insensitive matching
					if (player.name.match(regex)) {
						return true;
					}
				} while (player.getNext());
			}
		} catch (e) {
			delay(100);
		}

		return false;
	},

	dropStuff: function () {
		if (!Town.openStash()) return false;

		let items = (this.getMuleItems() || []);
		if (items.length === 0) return false;
		AutoMule.gids = items.map(i => i.gid);

		D2Bot.printToConsole("AutoMule: Transfering " + items.length + " items.", sdk.colors.D2Bot.DarkGold);
		D2Bot.printToConsole("AutoMule: " + JSON.stringify(items.map(i => i.prettyPrint)), sdk.colors.D2Bot.DarkGold);
		
		items.forEach(item => item.drop());
		delay(1000);
		me.cancel();

		return true;
	},

	matchItem: function (item, list) {
		let parsedPickit = [], classIDs = [];

		for (let i = 0; i < list.length; i += 1) {
			let info = {
				file: "Character Config",
				line: list[i]
			};

			// classids
			if (typeof list[i] === "number") {
				classIDs.push(list[i]);
			} else if (typeof list[i] === "string") {
				// pickit entries
				let parsedLine = NTIP.ParseLineInt(list[i], info);
				parsedLine && parsedPickit.push(parsedLine);
			}
		}

		return (classIDs.includes(item.classid) || NTIP.CheckItem(item, parsedPickit));
	},

	// get a list of items to mule
	getMuleItems: function () {
		let info = this.getInfo();

		if (!info || !info.hasOwnProperty("muleInfo")) return false;

		let items = [];
		let item = me.getItem(-1, sdk.items.mode.inStorage);
		const muleOrphans = !!(info.muleInfo.hasOwnProperty("muleOrphans") && info.muleInfo.muleOrphans);

		/**
		 * @param {ItemUnit} item 
		 */
		const isAKey = (item) => [sdk.items.quest.KeyofTerror, sdk.items.quest.KeyofHate, sdk.items.quest.KeyofDestruction].includes(item.classid);
		
		/**
		 * check if wanted by any of the systems
		 * @param {ItemUnit} item
		 * @returns {boolean} if item is wanted by various systems
		 */
		const isWanted = (item) => (AutoMule.cubingIngredient(item) || AutoMule.runewordIngredient(item) || AutoMule.utilityIngredient(item));

		if (item) {
			do {
				if (Town.ignoredItemTypes.indexOf(item.itemType) === -1
						&& (![Pickit.Result.UNID, Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(Pickit.checkItem(item).result) || (item.isInStash && muleOrphans))
						&& item.classid !== sdk.quest.item.Cube // Don't drop Horadric Cube
						&& (!item.isAnni) // Don't drop Annihilus
						&& (!item.isTorch) // Don't drop Hellfire Torch
						&& (item.isInStash || (item.isInInventory && !Storage.Inventory.IsLocked(item, Config.Inventory))) // Don't drop items in locked slots
						&& ((!TorchSystem.getFarmers() && !TorchSystem.isFarmer()) || isAKey(item))) { // Don't drop Keys if part of TorchSystem
					// Always drop items on Force or Trigger list
					if (this.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger))
						// Don't drop Excluded items or Runeword/Cubing/CraftingSystem ingredients
						|| (!this.matchItem(item, Config.AutoMule.Exclude) && !isWanted(item))) {
						items.push(copyUnit(item));
					}
				}
			} while (item.getNext());
		}

		return items;
	},

	utilityIngredient: function (item) {
		return (!!item && CraftingSystem.validGids.includes(item.gid));
	},

	// check if an item is a cubing ingredient
	cubingIngredient: function (item) {
		if (!item) return false;

		for (let i = 0; i < Cubing.validIngredients.length; i += 1) {
			if (item.gid === Cubing.validIngredients[i].gid) {
				return true;
			}
		}

		return false;
	},

	// check if an item is a runeword ingrediend - rune, empty base or bad rolled base
	runewordIngredient: function (item) {
		if (!item) return false;
		if (Runewords.validGids.includes(item.gid)) return true;

		if (!this.baseGids) {
			this.baseGids = [];

			for (let i = 0; i < Config.Runewords.length; i += 1) {
				let base = Runewords.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0)) || Runewords.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0), true);
				base && this.baseGids.push(base.gid);
			}
		}

		return this.baseGids.includes(item.gid);
	},

	dropCharm: function (dropAnni) {
		if (!Town.openStash()) return false;

		let item;

		if (dropAnni) {
			item = me.findItem(sdk.items.SmallCharm, sdk.items.mode.inStorage, -1, sdk.items.quality.Unique);

			if (item && !Storage.Inventory.IsLocked(item, Config.Inventory)) {
				D2Bot.printToConsole("AutoMule: Transfering Anni.", sdk.colors.D2Bot.DarkGold);
			} else {
				return false;
			}
		} else {
			item = me.findItem(sdk.items.LargeCharm, sdk.items.mode.inStorage, -1, sdk.items.quality.Unique);

			if (item) {
				D2Bot.printToConsole("AutoMule: Transfering Torch.", sdk.colors.D2Bot.DarkGold);
			} else {
				return false;
			}
		}

		item.drop();
		delay(1000);
		me.cancel() && me.cancel();

		return true;
	},

	// *** Mule functions ***
	getMaster: function (info) {
		let muleObj = info.mode === 1 ? this.TorchAnniMules : this.Mules;

		for (let i in muleObj) {
			if (muleObj.hasOwnProperty(i)) {
				for (let j in muleObj[i]) {
					if (muleObj[i].hasOwnProperty(j) && j === "enabledProfiles") {
						for (let k = 0; k < muleObj[i][j].length; k += 1) {
							if (String.isEqual(muleObj[i][j][k], info.profile)) {
								return {
									profile: muleObj[i][j][k],
									mode: info.mode
								};
							}
						}
					}
				}
			}
		}

		return false;
	},

	/**
	 * @param {number} mode - mule mode
	 * @param {string} master - profile that whats to mule
	 * @param {boolean} continuous - whether we are continuous or not
	 * @returns {muleObj | boolean}
	 */
	getMuleObject: function (mode, master, continuous = false) {
		mode = mode || 0;
		let mule = mode > 0 ? this.TorchAnniMules : this.Mules;

		for (let i in mule) {
			if (mule.hasOwnProperty(i)) {
				if (mule[i].muleProfile && mule[i].enabledProfiles && String.isEqual(mule[i].muleProfile, me.profile)
					&& (continuous || mule[i].enabledProfiles.includes(master))) {
					return mule[i];
				}
			}
		}

		return false;
	},

	getMuleFilename: function (mode, master, continuous = false) {
		mode = mode || 0;
		let mule = mode > 0 ? this.TorchAnniMules : this.Mules;
		let file;

		// Iterate through mule object
		for (let i in mule) {
			if (mule.hasOwnProperty(i)) {
				// Mule profile matches config
				if (mule[i].muleProfile && String.isEqual(mule[i].muleProfile, me.profile) && (continuous || mule[i].enabledProfiles.includes(master))) {
					file = mode === 0 ? "logs/AutoMule." + i + ".json" : "logs/TorchMule." + i + ".json";
					
					// If file exists check for valid info
					if (FileTools.exists(file)) {
						try {
							let jsonStr = FileTools.readText(file);
							let jsonObj = JSON.parse(jsonStr);

							// Return filename containing correct mule info
							if (mule[i].accountPrefix && jsonObj.account && jsonObj.account.match(mule[i].accountPrefix)) {
								return file;
							}
						} catch (e) {
							print(e);
						}
					} else {
						return file;
					}
				}
			}
		}

		// File exists but doesn't contain valid info - remake
		FileTools.remove(file);

		return file;
	},

	getMuleMode: function() {
		for (let i in this.Mules) {
			if (this.Mules.hasOwnProperty(i)) {
				if (this.Mules[i].muleProfile && String.isEqual(this.Mules[i].muleProfile, me.profile)) {
					return 0;
				}
			}
		}
		
		for (let i in this.TorchAnniMules) {
			if (this.TorchAnniMules.hasOwnProperty(i)) {
				if (this.TorchAnniMules[i].muleProfile && String.isEqual(this.TorchAnniMules[i].muleProfile, me.profile)) {
					return 1;
				}
			}
		}

		return 0;
	},

	isContinousMule: function () {
		for (let i in this.Mules) {
			if (this.Mules.hasOwnProperty(i)) {
				if (this.Mules[i].muleProfile && String.isEqual(this.Mules[i].muleProfile, me.profile)) {
					return this.Mules[i].continuousMule;
				}
			}
		}
		
		for (let i in this.TorchAnniMules) {
			if (this.TorchAnniMules.hasOwnProperty(i)) {
				if (this.TorchAnniMules[i].muleProfile && String.isEqual(this.TorchAnniMules[i].muleProfile, me.profile)) {
					return this.TorchAnniMules[i].continuousMule;
				}
			}
		}

		return false;
	}
};
