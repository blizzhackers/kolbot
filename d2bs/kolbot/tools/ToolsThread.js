/**
*  @filename    ToolsThread.js
*  @author      kolton
*  @desc        several tools to help the player - potion use, chicken, Diablo clone stop, map reveal, quit with player
*
*/
js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("CraftingSystem.js");
include("TorchSystem.js");
include("MuleLogger.js");
include("common/util.js");

includeCommonLibs();

let Overrides = require('../modules/Override');

new Overrides.Override(Attack, Attack.getNearestMonster, function (orignal) {
	let monster = orignal({skipBlocked: false, skipImmune: false});
	return (monster ? " to " + monster.name : "");
}).apply();

function main() {
	let ironGolem, debugInfo = {area: 0, currScript: "no entry"},
		pingTimer = [],
		quitFlag = false,
		quitListDelayTime,
		cloneWalked = false,
		antiIdle = false,
		idleTick = 0,
		canQuit = true,
		timerLastDrink = [];

	print("ÿc3Start ToolsThread script");
	D2Bot.init();
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	for (let i = 0; i < 5; i += 1) {
		timerLastDrink[i] = 0;
	}

	// Reset core chicken
	me.chickenhp = -1;
	me.chickenmp = -1;

	// General functions
	this.checkPing = function (print = true) {
		// Quit after at least 5 seconds in game
		if (getTickCount() - me.gamestarttime < 5000) {
			return false;
		}

		for (let i = 0; i < Config.PingQuit.length; i += 1) {
			if (Config.PingQuit[i].Ping > 0) {
				if (me.ping >= Config.PingQuit[i].Ping) {
					me.overhead("High Ping");

					if (pingTimer[i] === undefined || pingTimer[i] === 0) {
						pingTimer[i] = getTickCount();
					}

					if (getTickCount() - pingTimer[i] >= Config.PingQuit[i].Duration * 1000) {
						print && D2Bot.printToConsole("High ping (" + me.ping + "/" + Config.PingQuit[i].Ping + ") - leaving game.", 9);
						scriptBroadcast("pingquit");

						return true;
					}
				} else {
					pingTimer[i] = 0;
				}
			}
		}

		return false;
	};

	this.initQuitList = function () {
		let temp = [];

		for (let i = 0; i < Config.QuitList.length; i += 1) {
			if (FileTools.exists("data/" + Config.QuitList[i] + ".json")) {
				let string = Misc.fileAction("data/" + Config.QuitList[i] + ".json", 0);

				if (string) {
					let obj = JSON.parse(string);

					if (obj && obj.hasOwnProperty("name")) {
						temp.push(obj.name);
					}
				}
			}
		}

		Config.QuitList = temp.slice(0);
	};

	this.getPotion = function (pottype, type) {
		if (!pottype) return false;

		let items = me.getItemsEx().filter((item) => item.itemType === pottype);
		if (items.length === 0) return false;

		// Get highest id = highest potion first
		items.sort(function (a, b) {
			return b.classid - a.classid;
		});

		for (let i = 0; i < items.length; i += 1) {
			if (type < 3 && items[i].isInInventory && items[i].itemType === pottype) {
				console.log("ÿc2Drinking potion from inventory.");
				return copyUnit(items[i]);
			}

			if (items[i].mode === 2 && items[i].itemType === pottype) {
				console.log("ÿc2" + (type > 2 ? "Giving Merc" : "Drinking") + " potion from belt.");
				return copyUnit(items[i]);
			}
		}

		return false;
	};

	this.togglePause = function () {
		let scripts = [
			"default.dbj", "tools/townchicken.js", "tools/autobuildthread.js", "tools/antihostile.js",
			"tools/party.js", "tools/rushthread.js"
		];

		for (let i = 0; i < scripts.length; i++) {
			let script = getScript(scripts[i]);

			if (script) {
				if (script.running) {
					scripts[i] === "default.dbj" && console.log("ÿc1Pausing.");

					// don't pause townchicken during clone walk
					if (scripts[i] !== "tools/townchicken.js" || !cloneWalked) {
						script.pause();
					}
				} else {
					scripts[i] === "default.dbj" && console.log("ÿc2Resuming.");
					script.resume();
				}
			}
		}

		return true;
	};

	this.stopDefault = function () {
		let scripts = [
			"default.dbj", "tools/townchicken.js", "tools/autobuildthread.js", "tools/antihostile.js",
			"tools/party.js", "tools/rushthread.js", "libs//modules/guard.js"
		];
		
		for (let i = 0; i < scripts.length; i++) {
			let script = getScript(scripts[i]);
			!!script && script.running && script.stop();
		}

		return true;
	};

	this.exit = function (chickenExit = false) {
		chickenExit && D2Bot.updateChickens();
		Config.LogExperience && Experience.log();
		this.stopDefault();
		quit();
	};

	this.drinkPotion = function (type) {
		if (type === undefined) return false;
		let pottype, tNow = getTickCount();

		switch (type) {
		case 0:
		case 1:
			if ((timerLastDrink[type] && (tNow - timerLastDrink[type] < 1000)) || me.getState(type === 0 ? 100 : 106)) {
				return false;
			}

			break;
		case 2:
			// small delay for juvs just to prevent using more at once
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 300)) {
				return false;
			}

			break;
		case 4:
			// larger delay for juvs just to prevent using more at once, considering merc update rate
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 2000)) {
				return false;
			}

			break;
		default:
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 8000)) {
				return false;
			}

			break;
		}

		// mode 18 - can't drink while leaping/whirling etc.
		if (me.mode === 0 || me.mode === 17 || me.mode === 18) return false;

		switch (type) {
		case 0:
		case 3:
			pottype = 76;

			break;
		case 1:
			pottype = 77;

			break;
		default:
			pottype = 78;

			break;
		}

		let potion = this.getPotion(pottype, type);

		if (!!potion) {
			if (me.mode === 0 || me.mode === 17 || me.mode === 18) return false;

			try {
				if (type < 3) {
					potion.interact();
				} else {
					sendPacket(1, 0x26, 4, potion.gid, 4, 1, 4, 0);
				}
			} catch (e) {
				console.errorReport(e);
			}

			timerLastDrink[type] = getTickCount();

			return true;
		}

		return false;
	};

	this.checkVipers = function () {
		let monster = getUnit(1, 597);

		if (monster) {
			do {
				if (monster.getState(96)) {
					let owner = monster.getParent();

					if (owner && owner.name !== me.name) {
						D2Bot.printToConsole("Revived Tomb Vipers found. Leaving game.", 9);

						return true;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.getIronGolem = function () {
		let golem = getUnit(1, 291);

		if (golem) {
			do {
				let owner = golem.getParent();

				if (owner && owner.name === me.name) {
					return copyUnit(golem);
				}
			} while (golem.getNext());
		}

		return false;
	};

	this.getNearestPreset = function () {
		let id;
		let unit = getPresetUnits(me.area);
		let dist = 99;

		for (let i = 0; i < unit.length; i += 1) {
			if (getDistance(me, unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y) < dist) {
				dist = getDistance(me, unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y);
				id = unit[i].type + " " + unit[i].id;
			}
		}

		return id || "";
	};

	this.getStatsString = function (unit) {
		let realFCR = unit.getStat(sdk.stats.FCR);
		let realIAS = unit.getStat(sdk.stats.IAS);
		let realFBR = unit.getStat(sdk.stats.FBR);
		let realFHR = unit.getStat(sdk.stats.FHR);
		// me.getStat(105) will return real FCR from gear + Config.FCR from char cfg

		if (unit === me) {
			realFCR -= Config.FCR;
			realIAS -= Config.IAS;
			realFBR -= Config.FBR;
			realFHR -= Config.FHR;
		}

		let maxHellFireRes = 75 + unit.getStat(sdk.stats.MaxFireResist);
		let hellFireRes = unit.getRes(sdk.stats.FireResist, sdk.difficulty.Hell);
		hellFireRes > maxHellFireRes && (hellFireRes = maxHellFireRes);

		let maxHellColdRes = 75 + unit.getStat(sdk.stats.MaxColdResist);
		let hellColdRes = unit.getRes(sdk.stats.ColdResist, sdk.difficulty.Hell);
		hellColdRes > maxHellColdRes && (hellColdRes = maxHellColdRes);

		let maxHellLightRes = 75 + unit.getStat(sdk.stats.MaxLightResist);
		let hellLightRes = unit.getRes(sdk.stats.LightResist, sdk.difficulty.Hell);
		hellLightRes > maxHellLightRes && (hellLightRes = maxHellLightRes);

		let maxHellPoisonRes = 75 + unit.getStat(sdk.stats.MaxPoisonResist);
		let hellPoisonRes = unit.getRes(sdk.stats.PoisonResist, sdk.difficulty.Hell);
		hellPoisonRes > maxHellPoisonRes && (hellPoisonRes = maxHellPoisonRes);

		let str =
		"ÿc4Character Level: ÿc0" + unit.charlvl + (unit === me ? " ÿc4Difficulty: ÿc0" + sdk.difficulty.nameOf(me.diff) + " ÿc4HighestActAvailable: ÿc0" + me.highestAct : "") + "\n" +
		"ÿc1FR: ÿc0" + unit.getStat(sdk.stats.FireResist) + "ÿc1 Applied FR: ÿc0" + unit.fireRes +
		"/ÿc3 CR: ÿc0" + unit.getStat(sdk.stats.ColdResist) + "ÿc3 Applied CR: ÿc0" + unit.coldRes +
		"/ÿc9 LR: ÿc0" + unit.getStat(sdk.stats.LightResist) + "ÿc9 Applied LR: ÿc0" + unit.lightRes +
		"/ÿc2 PR: ÿc0" + unit.getStat(sdk.stats.PoisonResist) + "ÿc2 Applied PR: ÿc0" + unit.poisonRes + "\n" +
		(!me.hell ? "Hell res: ÿc1" + hellFireRes + "ÿc0/ÿc3" + hellColdRes + "ÿc0/ÿc9" + hellLightRes + "ÿc0/ÿc2" + hellPoisonRes + "ÿc0\n" : "") +
		"ÿc4MF: ÿc0" + unit.getStat(sdk.stats.MagicBonus) + "ÿc4 GF: ÿc0" + unit.getStat(sdk.stats.GoldBonus) +
		" ÿc4FCR: ÿc0" + realFCR + " ÿc4IAS: ÿc0" + realIAS + " ÿc4FBR: ÿc0" + realFBR +
		" ÿc4FHR: ÿc0" + realFHR + " ÿc4FRW: ÿc0" + unit.getStat(sdk.stats.FRW) + "\n" +
		"ÿc4CB: ÿc0" + unit.getStat(sdk.stats.CrushingBlow) + " ÿc4DS: ÿc0" + unit.getStat(sdk.stats.DeadlyStrike) +
		" ÿc4OW: ÿc0" + unit.getStat(sdk.stats.OpenWounds) +
		" ÿc1LL: ÿc0" + unit.getStat(sdk.stats.LifeLeech) + " ÿc3ML: ÿc0" + unit.getStat(sdk.stats.ManaLeech) +
		" ÿc8DR: ÿc0" + unit.getStat(sdk.stats.DamageResist) + "% + " + unit.getStat(sdk.stats.NormalDamageReduction) +
		" ÿc8MDR: ÿc0" + unit.getStat(sdk.stats.MagicResist) + "% + " + unit.getStat(sdk.stats.MagicDamageReduction) + "\n" +
		(unit.getStat(sdk.stats.CannotbeFrozen) > 0 ? "ÿc3Cannot be Frozenÿc1\n" : "\n");

		return str;
	};

	// Event functions
	this.keyEvent = function (key) {
		switch (key) {
		case 19: // Pause/Break key
			this.togglePause();

			break;
		case 35: // End key
			MuleLogger.logChar();
			delay(rand(Config.QuitListDelay[0] * 1e3, Config.QuitListDelay[1] * 1e3));
			D2Bot.printToConsole(me.profile + " - end run " + me.gamename);
			D2Bot.stop(me.profile, true);

			break;
		case 45: // Ins key
			me.overhead("Revealing " + Pather.getAreaName(me.area));
			revealLevel(true);

			break;
		case 107: // Numpad +
			showConsole();

			print("ÿc8My stats :: " + this.getStatsString(me));
			let merc = me.getMerc();
			!!merc && print("ÿc8Merc stats :: " + this.getStatsString(merc));

			break;
		case 101: // numpad 5
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					print("ÿc2Mule triggered");
					scriptBroadcast("mule");
					this.exit();
				} else {
					me.overhead("No items to mule.");
				}
			} else {
				me.overhead("Profile not enabled for muling.");
			}

			break;
		case 102: // Numpad 6
			MuleLogger.logChar();
			me.overhead("Logged char: " + me.name);

			break;
		case 109: // Numpad -
			Misc.spy(me.name);

			break;
		case 110: // decimal point
			say("/fps");

			break;
		case 105: // numpad 9 - get nearest preset unit id
			console.log(this.getNearestPreset());

			break;
		case 106: // numpad * - precast
			Precast.doPrecast(true);

			break;
		case 111: // numpad / - re-load default
			print("ÿc8ToolsThread :: " + sdk.colors.Red + "Stopping threads and waiting 5 seconds to restart");
			this.stopDefault() && delay(5e3);
			print('Starting default.dbj');
			load('default.dbj');

			break;
		}
	};

	this.gameEvent = function (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x00: // "%Name1(%Name2) dropped due to time out."
		case 0x01: // "%Name1(%Name2) dropped due to errors."
		case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
			Config.DebugMode && mode === 0 && D2Bot.printToConsole(name1 + " timed out, check their logs");

			if ((typeof Config.QuitList === "string" && Config.QuitList.toLowerCase() === "any") ||
					(Config.QuitList instanceof Array && Config.QuitList.indexOf(name1) > -1)) {
				print(name1 + (mode === 0 ? " timed out" : " left"));

				if (typeof Config.QuitListDelay !== "undefined" && typeof quitListDelayTime === "undefined" && Config.QuitListDelay.length > 0) {
					Config.QuitListDelay.sort(function(a, b) { return a - b; });
					quitListDelayTime = getTickCount() + rand(Config.QuitListDelay[0] * 1e3, Config.QuitListDelay[1] * 1e3);
				} else {
					quitListDelayTime = getTickCount();
				}

				quitFlag = true;
			}

			if (Config.AntiHostile) {
				scriptBroadcast("remove " + name1);
			}

			break;
		case 0x06: // "%Name1 was Slain by %Name2"
			if (Config.AntiHostile && param2 === 0x00 && name2 === me.name) {
				scriptBroadcast("mugshot " + name1);
			}

			break;
		case 0x07:
			if (Config.AntiHostile && param2 === 0x03) { // "%Player has declared hostility towards you."
				scriptBroadcast("findHostiles");
			}

			break;
		case 0x11: // "%Param1 Stones of Jordan Sold to Merchants"
			if (Config.DCloneQuit === 2) {
				D2Bot.printToConsole("SoJ sold in game. Leaving.");

				quitFlag = true;

				break;
			}

			if (Config.SoJWaitTime && me.expansion) {
				!!me.realm && D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], 7);
				Messaging.sendToScript("default.dbj", "soj");
			}

			break;
		case 0x12: // "Diablo Walks the Earth"
			if (Config.DCloneQuit > 0) {
				D2Bot.printToConsole("Diablo walked in game. Leaving.");

				quitFlag = true;

				break;
			}

			if (Config.StopOnDClone && me.expansion) {
				D2Bot.printToConsole("Diablo Walks the Earth", 7);
				cloneWalked = true;

				this.togglePause();
				Town.goToTown();
				showConsole();
				print("ÿc4Diablo Walks the Earth");

				me.maxgametime = 0;

				if (Config.KillDclone && load("tools/clonekilla.js")) {
					break;
				} else {
					antiIdle = true;
				}
			}

			break;
		}
	};

	this.scriptEvent = function (msg) {
		if (!!msg && typeof msg === "string") {
			switch (msg) {
			case "toggleQuitlist":
				canQuit = !canQuit;

				break;
			case "quit":
				quitFlag = true;

				break;
			// ignore common scriptBroadcast messages that aren't relevent to this thread
			case "mule":
			case "muleTorch":
			case "muleAnni":
			case "torch":
			case "crafting":
			case "getMuleMode":
			case "pingquit":
			case "townCheck":
				break;
			default:
				let obj;

				try {
					obj = JSON.parse(msg);
				} catch (e) {
					return;
				}

				if (obj) {
					if (obj.hasOwnProperty("currScript")) {
						debugInfo.currScript = obj.currScript;
					}

					if (obj.hasOwnProperty("lastAction")) {
						debugInfo.lastAction = obj.lastAction;
					}

					DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
				}

				break;
			}
		}
	};

	// Cache variables to prevent a bug where d2bs loses the reference to Config object
	Config = Misc.copy(Config);
	let tick = getTickCount();

	addEventListener("keyup", this.keyEvent);
	addEventListener("gameevent", this.gameEvent);
	addEventListener("scriptmsg", this.scriptEvent);

	// Load Fastmod
	Packet.changeStat(105, Config.FCR);
	Packet.changeStat(99, Config.FHR);
	Packet.changeStat(102, Config.FBR);
	Packet.changeStat(93, Config.IAS);

	Config.QuitListMode > 0 && this.initQuitList();

	// Start
	while (true) {
		try {
			if (me.gameReady && !me.inTown) {
				Config.UseHP > 0 && me.hpPercent < Config.UseHP && this.drinkPotion(0);
				Config.UseRejuvHP > 0 && me.hpPercent < Config.UseRejuvHP && this.drinkPotion(2);

				if (Config.LifeChicken > 0 && me.hpPercent <= Config.LifeChicken) {
					// takes a moment sometimes for townchicken to actually get to town so re-check that we aren't in town before quitting
					if (!me.inTown) {
						D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + Attack.getNearestMonster() + " in " + Pather.getAreaName(me.area) + ". Ping: " + me.ping, 9);
						this.exit(true);

						break;
					}
				}

				Config.UseMP > 0 && me.mpPercent < Config.UseMP && this.drinkPotion(1);
				Config.UseRejuvMP > 0 && me.mpPercent < Config.UseRejuvMP && this.drinkPotion(2);

				if (Config.ManaChicken > 0 && me.mpPercent <= Config.ManaChicken) {
					D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + Pather.getAreaName(me.area), 9);
					this.exit(true);

					break;
				}

				if (Config.IronGolemChicken > 0 && me.necromancer) {
					if (!ironGolem || copyUnit(ironGolem).x === undefined) {
						ironGolem = this.getIronGolem();
					}

					if (ironGolem) {
						// ironGolem.hpmax is bugged with BO
						if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) {
							D2Bot.printToConsole("Irom Golem Chicken in " + Pather.getAreaName(me.area), 9);
							this.exit(true);

							break;
						}
					}
				}

				if (Config.UseMerc) {
					let merc = me.getMerc();
					if (!!merc) {
						let mercHP = getMercHP();

						if (mercHP > 0 && merc.mode !== 12) {
							if (mercHP < Config.MercChicken) {
								D2Bot.printToConsole("Merc Chicken in " + Pather.getAreaName(me.area), 9);
								this.exit(true);

								break;
							}

							mercHP < Config.UseMercHP && this.drinkPotion(3);
							mercHP < Config.UseMercRejuv && this.drinkPotion(4);
						}
					}
				}

				if (Config.ViperCheck && getTickCount() - tick >= 250) {
					this.checkVipers() && (quitFlag = true);

					tick = getTickCount();
				}

				this.checkPing(true) && (quitFlag = true);
			}

			if (antiIdle) {
				tick = getTickCount();

				while (getTickCount() - tick < (Config.DCloneWaitTime * 60 * 1000)) {
					if (getTickCount() - idleTick > 0) {
						sendPacket(1, 0x40);
						idleTick += rand(1200, 1500) * 1000;
						let timeStr = formatTime(idleTick - getTickCount());
						me.overhead("Diablo Walks the Earth! - Next packet in: (" + timeStr + ")");
						print("Sent anti-idle packet, next refresh in: (" + timeStr + ")");
					}
				}
			}
		} catch (e) {
			Misc.errorReport(e, "ToolsThread");

			quitFlag = true;
		}

		if (quitFlag && canQuit && (typeof quitListDelayTime === "undefined" || getTickCount() >= quitListDelayTime)) {
			print("ÿc8Run duration ÿc2" + (formatTime(getTickCount() - me.gamestarttime)));
			this.checkPing(false); // In case of quitlist triggering first
			this.exit();

			break;
		}

		if (debugInfo.area !== Pather.getAreaName(me.area)) {
			debugInfo.area = Pather.getAreaName(me.area);
			DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
		}

		delay(20);
	}

	return true;
}
