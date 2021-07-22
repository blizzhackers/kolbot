/**
*	@filename	ToolsThread.js
*	@author		kolton
*	@desc		several tools to help the player - potion use, chicken, Diablo clone stop, map reveal, quit with player
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

if (!isIncluded("SoloLeveling/Tools/Developer.js")) {
	include("SoloLeveling/Tools/Developer.js");
}

if (!isIncluded("SoloLeveling/Tools/Tracker.js")) {
	include("SoloLeveling/Tools/Tracker.js");
}

if (!isIncluded("SoloLeveling/Functions/globals.js")) {
	include("SoloLeveling/Functions/globals.js");
}

const sdk = require('../../libs/modules/sdk');

function main () {
	var i, mercHP, ironGolem, tick, merc,
		debugInfo = {area: 0, currScript: "no entry"},
		pingTimer = [],
		quitFlag = false,
		quitListDelayTime,
		cloneWalked = false,
		canQuit = true,
		timerLastDrink = [];

	print("ÿc9SoloLeveling:ÿc3 Start Custom ToolsThread script");
	D2Bot.init();
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	if (Developer.Overlay) {
		include("SoloLeveling/Tools/Overlay.js");
	}

	for (i = 0; i < 5; i += 1) {
		timerLastDrink[i] = 0;
	}

	// Reset core chicken
	me.chickenhp = -1;
	me.chickenmp = -1;

	// General functions
	this.checkPing = function (print) {
		// Quit after at least 5 seconds in game
		if (getTickCount() - me.gamestarttime < 5000) {
			return false;
		}

		var m;

		for (m = 0; m < Config.PingQuit.length; m += 1) {
			if (Config.PingQuit[m].Ping > 0) {
				if (me.ping >= Config.PingQuit[m].Ping) {
					me.overhead("High Ping");

					if (pingTimer[m] === undefined || pingTimer[m] === 0) {
						pingTimer[m] = getTickCount();
					}

					if (getTickCount() - pingTimer[m] >= Config.PingQuit[m].Duration * 1000) {
						if (print) {
							D2Bot.printToConsole("High ping (" + me.ping + "/" + Config.PingQuit[m].Ping + ") - leaving game.", 9);
						}

						scriptBroadcast("pingquit");

						return true;
					}
				} else {
					pingTimer[m] = 0;
				}
			}
		}

		return false;
	};

	this.initQuitList = function () {
		var j, string, obj,
			temp = [];

		for (j = 0; j < Config.QuitList.length; j += 1) {
			if (FileTools.exists("data/" + Config.QuitList[j] + ".json")) {
				string = Misc.fileAction("data/" + Config.QuitList[j] + ".json", 0);

				if (string) {
					obj = JSON.parse(string);

					if (obj && obj.hasOwnProperty("name")) {
						temp.push(obj.name);
					}
				}
			}
		}

		Config.QuitList = temp.slice(0);
	};

	this.getPotion = function (pottype, type) {
		var k,
			items = me.getItems();

		if (!items || items.length === 0) {
			return false;
		}

		// Get highest id = highest potion first
		items.sort(function (a, b) {
			return b.classid - a.classid;
		});

		for (k = 0; k < items.length; k += 1) {
			if (type < 3 && items[k].mode === 0 && items[k].location === 3 && items[k].itemType === pottype) {
				print("ÿc2Drinking potion from inventory.");

				return copyUnit(items[k]);
			}

			if (items[k].mode === 2 && items[k].itemType === pottype) {
				return copyUnit(items[k]);
			}
		}

		return false;
	};

	this.togglePause = function () {
		var l,	script,
			scripts = ["default.dbj", "tools/townchicken.js", "tools/antihostile.js", "tools/party.js", "tools/rushthread.js"];

		for (l = 0; l < scripts.length; l += 1) {
			script = getScript(scripts[l]);

			if (script) {
				if (script.running) {
					if (l === 0) { // default.dbj
						print("ÿc1Pausing.");
					}

					// don't pause townchicken during clone walk
					if (scripts[l] !== "tools/townchicken.js" || !cloneWalked) {
						script.pause();
					}
				} else {
					if (l === 0) { // default.dbj
						print("ÿc2Resuming.");
					}

					script.resume();
				}
			}
		}

		return true;
	};

	this.stopDefault = function () {
		var script = getScript("default.dbj");

		if (script && script.running) {
			script.stop();
		}

		return true;
	};

	this.exit = function () {
		this.stopDefault();
		quit();
	};

	this.drinkPotion = function (type) {
		var pottype, potion,
			tNow = getTickCount();

		switch (type) {
		case 0:
		case 1:
			if ((timerLastDrink[type] && (tNow - timerLastDrink[type] < 1000)) || me.getState(type === 0 ? 100 : 106)) {
				return false;
			}

			break;
		case 2:
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 300)) { // small delay for juvs just to prevent using more at once
				return false;
			}

			break;
		case 4:
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 2000)) { // larger delay for juvs just to prevent using more at once, considering merc update rate
				return false;
			}

			break;
		default:
			if (timerLastDrink[type] && (tNow - timerLastDrink[type] < 8000)) {
				return false;
			}

			break;
		}

		if (me.mode === 0 || me.mode === 17 || me.mode === 18) { // mode 18 - can't drink while leaping/whirling etc.
			return false;
		}

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

		potion = this.getPotion(pottype, type);

		if (potion) {
			if (me.mode === 0 || me.mode === 17) {
				return false;
			}

			if (type < 3) {
				potion.interact();
			} else {
				try {
					clickItem(2, potion);
				} catch (e) {
					print("Couldn't give the potion to merc.");
				}
			}

			timerLastDrink[type] = getTickCount();

			return true;
		}

		return false;
	};

	this.getNearestMonster = function () {
		var gid, distance,
			monster = getUnit(1),
			range = 30;

		if (monster) {
			do {
				if (monster.hp > 0 && Attack.checkMonster(monster) && !monster.getParent()) {
					distance = getDistance(me, monster);

					if (distance < range) {
						range = distance;
						gid = monster.gid;
					}
				}
			} while (monster.getNext());
		}

		if (gid) {
			monster = getUnit(1, -1, -1, gid);
		} else {
			monster = false;
		}

		if (monster) {
			return " to " + monster.name;
		}

		return "";
	};

	this.checkVipers = function () {
		var owner,
			monster = getUnit(1, 597);

		if (monster) {
			do {
				if (monster.getState(96)) {
					owner = monster.getParent();

					if (owner && owner.name !== me.name) {
						return true;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.getIronGolem = function () {
		var owner,
			golem = getUnit(1, 291);

		if (golem) {
			do {
				owner = golem.getParent();

				if (owner && owner.name === me.name) {
					return copyUnit(golem);
				}
			} while (golem.getNext());
		}

		return false;
	};

	this.getNearestPreset = function () {
		var n, unit, dist, id;

		unit = getPresetUnits(me.area);
		dist = 99;

		for (n = 0; n < unit.length; n += 1) {
			if (getDistance(me, unit[n].roomx * 5 + unit[n].x, unit[n].roomy * 5 + unit[n].y) < dist) {
				dist = getDistance(me, unit[n].roomx * 5 + unit[n].x, unit[n].roomy * 5 + unit[n].y);
				id = unit[n].type + " " + unit[n].id;
			}
		}

		return id || "";
	};

	this.getStatsString = function (unit) {
		var realFCR = unit.getStat(sdk.stats.Fastercastrate);
		var realIAS = unit.getStat(sdk.stats.Fasterattackrate);
		var realFBR = unit.getStat(sdk.stats.Fasterblockrate);
		var realFHR = unit.getStat(sdk.stats.Fastergethitrate);
		// me.getStat(105) will return real FCR from gear + Config.FCR from char cfg

		if (unit === me) {
			realFCR -= Config.FCR;
			realIAS -= Config.IAS;
			realFBR -= Config.FBR;
			realFHR -= Config.FHR;
		}

		var maxHellFireRes = 75 + unit.getStat(sdk.stats.Maxfireresist);
		var hellFireRes = unit.getStat(sdk.stats.Fireresist) - 100;

		if (hellFireRes > maxHellFireRes) {
			hellFireRes = maxHellFireRes;
		}

		var maxHellColdRes = 75 + unit.getStat(sdk.stats.Maxcoldresist);
		var hellColdRes = unit.getStat(sdk.stats.Coldresist) - 100;

		if (hellColdRes > maxHellColdRes) {
			hellColdRes = maxHellColdRes;
		}

		var maxHellLightRes = 75 + unit.getStat(sdk.stats.Maxlightresist);
		var hellLightRes = unit.getStat(sdk.stats.Lightresist) - 100;

		if (hellLightRes > maxHellLightRes) {
			hellLightRes = maxHellLightRes;
		}

		var maxHellPoisonRes = 75 + unit.getStat(sdk.stats.Maxpoisonresist);
		var hellPoisonRes = unit.getStat(sdk.stats.Poisonresist) - 100;

		if (hellPoisonRes > maxHellPoisonRes) {
			hellPoisonRes = maxHellPoisonRes;
		}

		var str = "ÿc4MF: ÿc0" + unit.getStat(sdk.stats.Magicbonus) + "ÿc4 GF: ÿc0" + unit.getStat(sdk.stats.Goldbonus) +
		"ÿc1 FR: ÿc0" + unit.getStat(sdk.stats.Fireresist) + "ÿc1 Max FR: ÿc0" + unit.getStat(sdk.stats.Maxfireresist) +
		"ÿc3 CR: ÿc0" + unit.getStat(sdk.stats.Coldresist) + "ÿc3 Max CR: ÿc0" + unit.getStat(sdk.stats.Maxcoldresist) +
		"ÿc9 LR: ÿc0" + unit.getStat(sdk.stats.Lightresist) + "ÿc9 Max LR: ÿc0" + unit.getStat(sdk.stats.Maxlightresist) +
		"ÿc2 PR: ÿc0" + unit.getStat(sdk.stats.Poisonresist) + "ÿc2 Max PR: ÿc0" + unit.getStat(sdk.stats.Maxpoisonresist) +
		"\n" +
		"Hell res: ÿc1" + hellFireRes + "ÿc0/ÿc3" + hellColdRes + "ÿc0/ÿc9" + hellLightRes + "ÿc0/ÿc2" + hellPoisonRes +
		"ÿc0\n" +
		"FCR: " + realFCR + " IAS: " + realIAS + " FBR: " + realFBR +
		" FHR: " + realFHR + " FRW: " + unit.getStat(sdk.stats.Fastermovevelocity) +
		"\n" +
		"CB: " + unit.getStat(sdk.stats.Crushingblow) + " DS: " + unit.getStat(sdk.stats.Deadlystrike) +
		" OW: " + unit.getStat(sdk.stats.Openwounds) +
		" ÿc1LL: ÿc0" + unit.getStat(sdk.stats.Lifedrainmindam) + " ÿc3ML: ÿc0" + unit.getStat(sdk.stats.Manadrainmindam) +
		" DR: " + unit.getStat(sdk.stats.Damageresist) + "% + " + unit.getStat(sdk.stats.NormalDamageReduction) +
		" MDR: " + unit.getStat(sdk.stats.Magicresist) + "% + " + unit.getStat(sdk.stats.MagicDamageReduction) +
		"\n" +
		(unit.getStat(sdk.stats.Cannotbefrozen) > 0 ? "ÿc3Cannot be Frozenÿc1\n" : "\n");

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

			merc = me.getMerc();
			print(this.getStatsString(me));

			if (merc) {
				print("Merc stats:\n" + this.getStatsString(merc));
			}

			break;
		case 101: // numpad 5
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					print("ÿc2Mule triggered");
					scriptBroadcast("mule");

					if (Developer.logPerformance) {
						Tracker.Update();
					}

					this.exit();
				} else {
					me.overhead("No items to mule.");
				}
			} else {
				me.overhead("Profile not enabled for muling.");
			}

			break;
		case 102: // Numpad 6
			if (logEquipped) {
				MuleLogger.logEquippedItems();
			} else {
				MuleLogger.logChar();
			}

			me.overhead("Logged char: " + me.name);

			break;
		case 189: // Dash - (for laptops without numberpad)
		case 109: // Numpad -
			D2Bot.printToConsole(getUnit(101).name + ' getTier: ' + NTIP.GetTier(getUnit(101)) + ' tierscore: ' + tierscore(getUnit(101)));
			D2Bot.printToConsole(getUnit(101).name + ' getCharmTier: ' + NTIP.GetCharmTier(getUnit(101)) + ' charmscore: ' + charmscore(getUnit(101)));
			D2Bot.printToConsole(getUnit(101).name + ' getMercTier: ' + NTIP.GetMercTier(getUnit(101)) + ' mercscore: ' + mercscore(getUnit(101)));
			D2Bot.printToConsole(getUnit(101).name + ' Pickit.checkItem: ' + Pickit.checkItem(getUnit(101)).result);

			break;
		case 110: // decimal point
			say("/fps");

			break;
		case 105: // numpad 9 - get nearest preset unit id
			print(this.getNearestPreset());

			break;
		case 106: // numpad * - precast
			Precast.doPrecast(true);

			break;
		}
	};

	this.gameEvent = function (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x00: // "%Name1(%Name2) dropped due to time out."
		case 0x01: // "%Name1(%Name2) dropped due to errors."
		case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
			if ((typeof Config.QuitList === "string" && Config.QuitList.toLowerCase() === "any") ||
					(Config.QuitList instanceof Array && Config.QuitList.indexOf (name1) > -1)) {
				print(name1 + (mode === 0 ? " timed out" : " left"));

				if (typeof Config.QuitListDelay !== "undefined" && typeof quitListDelayTime === "undefined" && Config.QuitListDelay.length > 0) {
					Config.QuitListDelay.sort(function (a, b) {
						return a - b;
					});
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

			if (Config.SoJWaitTime && me.gametype === 1) { // only do this in expansion
				D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], 7);
				Messaging.sendToScript("default.dbj", "soj");
			}

			break;
		case 0x12: // "Diablo Walks the Earth"
			if (Config.DCloneQuit > 0) {
				D2Bot.printToConsole("Diablo walked in game. Leaving.");

				quitFlag = true;

				break;
			}

			if (Config.StopOnDClone && me.gametype === 1) { // only do this in expansion
				D2Bot.printToConsole("Diablo Walks the Earth", 7);

				cloneWalked = true;

				this.togglePause();
				Town.goToTown();
				showConsole();
				print("ÿc4Diablo Walks the Earth");

				me.maxgametime = 0;

				if (Config.KillDclone) {
					load("tools/clonekilla.js");
				}
			}

			break;
		}
	};

	this.scriptEvent = function (msg) {
		var obj;

		switch (msg) {
		case "toggleQuitlist":
			canQuit = !canQuit;

			break;
		case "quit":
			quitFlag = true;

			break;
		default:
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

				//D2Bot.store(JSON.stringify(debugInfo));
				DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
			}

			break;
		}
	};

	// Cache variables to prevent a bug where d2bs loses the reference to Config object
	Config = Misc.copy(Config);
	tick = getTickCount();

	addEventListener("keyup", this.keyEvent);
	addEventListener("gameevent", this.gameEvent);
	addEventListener("scriptmsg", this.scriptEvent);
	addEventListener("gamepacket", Misc.gamePacket);
	addEventListener("scriptmsg", Tracker.logLeveling);

	// Load Fastmod
	Packet.changeStat(105, Config.FCR);
	Packet.changeStat(99, Config.FHR);
	Packet.changeStat(102, Config.FBR);
	Packet.changeStat(93, Config.IAS);

	if (Config.QuitListMode > 0) {
		this.initQuitList();
	}

	var myAct = me.act;

	// Start
	while (true) {
		try {
			if (me.gameReady && !me.inTown) {
				if (Config.UseHP > 0 && me.hp < Math.floor(me.hpmax * Config.UseHP / 100)) {
					this.drinkPotion(0);
				}

				if (Config.UseRejuvHP > 0 && me.hp < Math.floor(me.hpmax * Config.UseRejuvHP / 100)) {
					this.drinkPotion(2);
				}

				if (Config.LifeChicken > 0 && me.hp <= Math.floor(me.hpmax * Config.LifeChicken / 100)) {
					if (!Developer.hideChickens) {
						D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + this.getNearestMonster() + " in " + Pather.getAreaName(me.area) + ". Ping: " + me.ping, 9);
					}

					if (Developer.logPerformance) {
						Tracker.Update();
					}

					D2Bot.updateChickens();
					this.exit();

					break;
				}

				if (Config.UseMP > 0 && me.mp < Math.floor(me.mpmax * Config.UseMP / 100)) {
					this.drinkPotion(1);
				}

				if (Config.UseRejuvMP > 0 && me.mp < Math.floor(me.mpmax * Config.UseRejuvMP / 100)) {
					this.drinkPotion(2);
				}

				if (Config.ManaChicken > 0 && me.mp <= Math.floor(me.mpmax * Config.ManaChicken / 100)) {
					if (!Developer.hideChickens) {
						D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + Pather.getAreaName(me.area), 9);
					}

					if (Developer.logPerformance) {
						Tracker.Update();
					}

					D2Bot.updateChickens();
					this.exit();

					break;
				}

				if (Config.IronGolemChicken > 0 && me.classid === 2) {
					if (!ironGolem || copyUnit(ironGolem).x === undefined) {
						ironGolem = this.getIronGolem();
					}

					if (ironGolem) {
						if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) { // ironGolem.hpmax is bugged with BO
							if (!Developer.hideChickens) {
								D2Bot.printToConsole("Irom Golem Chicken in " + Pather.getAreaName(me.area), 9);
							}

							if (Developer.logPerformance) {
								Tracker.Update();
							}

							D2Bot.updateChickens();
							this.exit();

							break;
						}
					}
				}

				if (Config.UseMerc) {
					mercHP = getMercHP();
					merc = me.getMerc();

					if (mercHP > 0 && merc && merc.mode !== 12) {
						if (mercHP < Config.MercChicken) {
							if (!Developer.hideChickens) {
								D2Bot.printToConsole("Merc Chicken in " + Pather.getAreaName(me.area), 9);
							}

							if (Developer.logPerformance) {
								Tracker.Update();
							}

							D2Bot.updateChickens();
							this.exit();

							break;
						}

						if (mercHP < Config.UseMercHP) {
							this.drinkPotion(3);
						}

						if (mercHP < Config.UseMercRejuv) {
							this.drinkPotion(4);
						}
					}
				}

				if (Config.ViperCheck && getTickCount() - tick >= 250) {
					if (this.checkVipers()) {
						D2Bot.printToConsole("Revived Tomb Vipers found. Leaving game.", 9);

						quitFlag = true;
					}

					tick = getTickCount();
				}

				if (this.checkPing(true)) {
					quitFlag = true;
				}
			}
		} catch (e) {
			Misc.errorReport(e, "ToolsThread");

			quitFlag = true;
		}

		if (Developer.Overlay) {
			if (Developer.logPerformance) {
				Overlay.update(quitFlag);

				if (me.act !== myAct) {
					Overlay.flush();
					myAct = me.act;
				}
			} else {
				D2Bot.printToConsole('Overlay cannot work without Developer.logPerformance = true;', 4);
			}
		}

		if (quitFlag && canQuit && (typeof quitListDelayTime === "undefined" || getTickCount() >= quitListDelayTime)) {
			print("ÿc8Run duration ÿc2" + ((getTickCount() - me.gamestarttime) / 1000));

			if (Config.LogExperience) {
				Experience.log();
			}

			if (Developer.logPerformance) {
				Tracker.Update();
			}

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
