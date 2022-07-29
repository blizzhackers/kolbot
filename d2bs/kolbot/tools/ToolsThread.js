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

let Overrides = require("../modules/Override");

new Overrides.Override(Attack, Attack.getNearestMonster, function (orignal) {
	let monster = orignal({skipBlocked: false, skipImmune: false});
	return (monster ? " to " + monster.name : "");
}).apply();

function main() {
	let ironGolem, debugInfo = {area: 0, currScript: "no entry"};
	let quitFlag = false;
	let quitListDelayTime;
	let antiIdle = false;
	let idleTick = 0;
	let canQuit = true;

	console.log("ÿc3Start ToolsThread script");
	D2Bot.init();
	Config.init(false);
	Pickit.init(false);
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	for (let i = 0; i < 5; i += 1) {
		Common.Toolsthread.timerLastDrink[i] = 0;
	}

	// Reset core chicken
	me.chickenhp = -1;
	me.chickenmp = -1;

	// General functions
	Common.Toolsthread.pauseScripts = [
		"default.dbj", "tools/townchicken.js", "tools/autobuildthread.js", "tools/antihostile.js",
		"tools/party.js", "tools/rushthread.js"
	];
	Common.Toolsthread.stopScripts = [
		"default.dbj", "tools/townchicken.js", "tools/autobuildthread.js", "tools/antihostile.js",
		"tools/party.js", "tools/rushthread.js", "libs//modules/guard.js"
	];

	// Event functions
	this.keyEvent = function (key) {
		switch (key) {
		case sdk.keys.PauseBreak: // pause default.dbj
			Common.Toolsthread.togglePause();

			break;
		case sdk.keys.Delete: // quit current game
			Common.Toolsthread.exit();

			break;
		case sdk.keys.End: // stop profile and log character
			MuleLogger.logChar();
			delay(rand(Time.seconds(Config.QuitListDelay[0]), Time.seconds(Config.QuitListDelay[1])));
			D2Bot.printToConsole(me.profile + " - end run " + me.gamename);
			D2Bot.stop(me.profile, true);

			break;
		case sdk.keys.Insert: // reveal level
			me.overhead("Revealing " + Pather.getAreaName(me.area));
			revealLevel(true);

			break;
		case sdk.keys.NumpadPlus: // log stats
			showConsole();

			console.log("ÿc8My stats :: " + Common.Toolsthread.getStatsString(me));
			let merc = me.getMerc();
			!!merc && console.log("ÿc8Merc stats :: " + Common.Toolsthread.getStatsString(merc));

			break;
		case sdk.keys.Numpad5: // force automule check
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					print("ÿc2Mule triggered");
					scriptBroadcast("mule");
					Common.Toolsthread.exit();
				} else {
					me.overhead("No items to mule.");
				}
			} else {
				me.overhead("Profile not enabled for muling.");
			}

			break;
		case sdk.keys.Numpad6: // log character to char viewer
			MuleLogger.logChar();
			me.overhead("Logged char: " + me.name);

			break;
		case sdk.keys.NumpadDash: // log our items to item log ? should this try to get nearest player? Isn't that what it was meant for
			{
				// check if we are hovering the mouse over somebody
				let selectedUnit = Game.getSelectedUnit();
				if (selectedUnit && selectedUnit.isPlayer) {
					me.overhead("logging " + selectedUnit.name);
					// the unit is a valid player lets log thier stuff...muhahaha
					Misc.spy(selectedUnit.name);
				} else {
					me.overhead("logging my stuff");
					// just log ourselves
					Misc.spy(me.name);
				}
			}

			break;
		case sdk.keys.NumpadDecimal: // dump item info
			{
				let itemString = "";
				let generalString = "";
				let itemToCheck = Game.getSelectedUnit();

				if (!!itemToCheck) {
					itemString = "ÿc4ItemName: ÿc0" + itemToCheck.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "")
						+ "\nÿc4ItemType: ÿc0" + itemToCheck.itemType + "| ÿc4Classid: ÿc0" + itemToCheck.classid + "| ÿc4Quality: ÿc0" + itemToCheck.quality + "| ÿc4Gid: ÿc0" + itemToCheck.gid
						+ "\nÿc4ItemMode: ÿc0" + itemToCheck.mode + "| ÿc4Location: ÿc0" + itemToCheck.location + "| ÿc4Bodylocation: ÿc0" + itemToCheck.bodylocation;
					generalString = "ÿc4Pickit: ÿc0" + Pickit.checkItem(itemToCheck).result + " | ÿc4NTIP.CheckItem: ÿc0" + NTIP.CheckItem(itemToCheck, false, true).result
						+ "\nÿc4Cubing Item: ÿc0" + Cubing.keepItem(itemToCheck) + " | ÿc4Runeword Item: ÿc0" + Runewords.keepItem(itemToCheck) + " | ÿc4Crafting Item: ÿc0" + CraftingSystem.keepItem(itemToCheck);
				}
				
				console.log("ÿc2*************Item Info Start*************");
				console.log(itemString);
				console.log("ÿc2Systems Info Start");
				console.log(generalString);
				console.log("ÿc1****************Info End****************");
			}

			break;
		case sdk.keys.Numpad9: // get nearest preset unit id
			console.log(Common.Toolsthread.getNearestPreset());

			break;
		case sdk.keys.NumpadStar: // precast
			Precast.doPrecast(true);

			break;
		case sdk.keys.NumpadSlash: // re-load default
			console.log("ÿc8ToolsThread :: " + sdk.colors.Red + "Stopping threads and waiting 5 seconds to restart");
			Common.Toolsthread.stopDefault() && delay(Time.seconds(5));
			console.log("Starting default.dbj");
			load("default.dbj");

			break;
		}
	};

	this.gameEvent = function (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x00: // "%Name1(%Name2) dropped due to time out."
		case 0x01: // "%Name1(%Name2) dropped due to errors."
		case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
			Config.DebugMode && mode === 0 && D2Bot.printToConsole(name1 + " timed out, check their logs");

			if ((typeof Config.QuitList === "string" && Config.QuitList.toLowerCase() === "any")
					|| (Config.QuitList instanceof Array && Config.QuitList.includes(name1))) {
				print(name1 + (mode === 0 ? " timed out" : " left"));

				if (typeof Config.QuitListDelay !== "undefined" && typeof quitListDelayTime === "undefined" && Config.QuitListDelay.length > 0) {
					Config.QuitListDelay.sort((a, b) => a - b);
					quitListDelayTime = getTickCount() + rand(Time.seconds(Config.QuitListDelay[0]), Time.seconds(Config.QuitListDelay[1]));
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
				!!me.realm && D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], sdk.colors.D2Bot.DarkGold);
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
				D2Bot.printToConsole("Diablo Walks the Earth", sdk.colors.D2Bot.DarkGold);
				Common.Toolsthread.cloneWalked = true;

				Common.Toolsthread.togglePause();
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
			case "datadump":
				console.log("ÿc8Systems Data Dump: ÿc2Start");
				console.log("ÿc8Cubing");
				console.log("ÿc9Cubing Valid Itemsÿc0", Cubing.validIngredients);
				console.log("ÿc9Cubing Needed Itemsÿc0", Cubing.neededIngredients);
				console.log("ÿc8Runeword");
				console.log("ÿc9Runeword Valid Itemsÿc0", Runewords.validGids);
				console.log("ÿc9Runeword Needed Itemsÿc0", Runewords.needList);
				console.log("ÿc8Systems Data Dump: ÿc1****************Info End****************");

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
					obj.hasOwnProperty("currScript") && (debugInfo.currScript = obj.currScript);
					obj.hasOwnProperty("lastAction") && (debugInfo.lastAction = obj.lastAction);

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

	// Load Fastmod - patched
	// Packet.changeStat(105, Config.FCR);
	// Packet.changeStat(99, Config.FHR);
	// Packet.changeStat(102, Config.FBR);
	// Packet.changeStat(93, Config.IAS);

	Config.QuitListMode > 0 && Common.Toolsthread.initQuitList();

	// Start
	while (true) {
		try {
			if (me.gameReady && !me.inTown) {
				Config.UseHP > 0 && me.hpPercent < Config.UseHP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Health);
				Config.UseRejuvHP > 0 && me.hpPercent < Config.UseRejuvHP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Rejuv);

				if (Config.LifeChicken > 0 && me.hpPercent <= Config.LifeChicken) {
					// takes a moment sometimes for townchicken to actually get to town so re-check that we aren't in town before quitting
					if (!me.inTown) {
						D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + Attack.getNearestMonster() + " in " + Pather.getAreaName(me.area) + ". Ping: " + me.ping, sdk.colors.D2Bot.Red);
						Common.Toolsthread.exit(true);

						break;
					}
				}

				Config.UseMP > 0 && me.mpPercent < Config.UseMP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Mana);
				Config.UseRejuvMP > 0 && me.mpPercent < Config.UseRejuvMP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Rejuv);

				if (Config.ManaChicken > 0 && me.mpPercent <= Config.ManaChicken) {
					D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + Pather.getAreaName(me.area), sdk.colors.D2Bot.Red);
					Common.Toolsthread.exit(true);

					break;
				}

				if (Config.IronGolemChicken > 0 && me.necromancer) {
					if (!ironGolem || copyUnit(ironGolem).x === undefined) {
						ironGolem = Common.Toolsthread.getIronGolem();
					}

					if (ironGolem) {
						// ironGolem.hpmax is bugged with BO
						if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) {
							D2Bot.printToConsole("Irom Golem Chicken in " + Pather.getAreaName(me.area), sdk.colors.D2Bot.Red);
							Common.Toolsthread.exit(true);

							break;
						}
					}
				}

				if (Config.UseMerc) {
					let merc = me.getMerc();
					if (!!merc) {
						let mercHP = getMercHP();

						if (mercHP > 0 && merc.mode !== sdk.monsters.mode.Dead) {
							if (mercHP < Config.MercChicken) {
								D2Bot.printToConsole("Merc Chicken in " + Pather.getAreaName(me.area), sdk.colors.D2Bot.Red);
								Common.Toolsthread.exit(true);

								break;
							}

							mercHP < Config.UseMercHP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.MercHealth);
							mercHP < Config.UseMercRejuv && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.MercRejuv);
						}
					}
				}

				if (Config.ViperCheck && getTickCount() - tick >= 250) {
					Common.Toolsthread.checkVipers() && (quitFlag = true);

					tick = getTickCount();
				}

				Common.Toolsthread.checkPing(true) && (quitFlag = true);
			}

			if (antiIdle) {
				tick = getTickCount();

				while (getTickCount() - tick < Time.minutes(Config.DCloneWaitTime)) {
					if (getTickCount() - idleTick > 0) {
						Packet.questRefresh();
						idleTick += rand(1200, 1500) * 1000;
						let timeStr = Time.format(idleTick - getTickCount());
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
			Common.Toolsthread.checkPing(false); // In case of quitlist triggering first
			Common.Toolsthread.exit();

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
