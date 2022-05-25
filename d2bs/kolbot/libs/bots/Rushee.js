/**
*  @filename    Rushee.js
*  @author      kolton, theBGuy
*  @desc        Rushee script that works with Rusher
*
*/

let Overrides = require('../modules/Override');

new Overrides.Override(Town, Town.goToTown, function(orignal, act, wpmenu) {
	try {
		orignal(act, wpmenu);

		return true;
	} catch (e) {
		print(e);
    
		return Pather.useWaypoint(sdk.areas.townOf(me.area));
	}
}).apply();

function Rushee() {
	let act, leader, target, done = false,
		actions = [];

	this.log = function (msg = "", sayMsg = false) {
		print(msg);
		sayMsg && say(msg);
	};

	this.revive = function () {
		while (me.mode === 0) {
			delay(40);
		}

		if (me.mode === 17) {
			me.revive();

			while (!me.inTown) {
				delay(40);
			}
		}
	};

	this.getQuestItem = function (classid, chestid) {
		let tick = getTickCount();

		if (me.getItem(classid)) {
			this.log("Already have: " + classid);
			return true;
		}

		if (me.inTown) return false;

		let chest = getUnit(2, chestid);

		if (!chest) {
			this.log("Couldn't find: " + chestid);
			return false;
		}

		for (let i = 0; i < 5; i++) {
			if (Misc.openChest(chest)) {
				break;
			}
			this.log("Failed to open chest: Attempt[" + (i + 1) + "]");
			let coord = CollMap.getRandCoordinate(chest.x, -4, 4, chest.y, -4, 4);
			coord && Pather.moveTo(coord.x, coord.y);
		}

		let item = getUnit(4, classid);

		if (!item) {
			if (getTickCount() - tick < 500) {
				delay(500);
			}

			return false;
		}

		return Pickit.pickItem(item) && delay(1000);
	};

	this.checkQuestMonster = function (classid) {
		let monster = getUnit(1, classid);

		if (monster) {
			while (monster.mode !== 12 && monster.mode !== 0) {
				delay(500);
			}

			return true;
		}

		return false;
	};

	this.tyraelTalk = function () {
		let npc = getUnit(1, NPC.Tyrael);

		if (!npc) return false;

		for (let i = 0; i < 3; i += 1) {
			if (getDistance(me, npc) > 3) {
				Pather.moveToUnit(npc);
			}

			npc.interact();
			delay(1000 + me.ping);
			me.cancel();

			if (Pather.getPortal(null)) {
				me.cancel();

				break;
			}
		}

		return Pather.usePortal(null) || Pather.usePortal(null, Config.Leader);
	};

	this.cubeStaff = function () {
		let staff = me.getItem("vip"),
			amulet = me.getItem("msf");

		if (!staff || !amulet) return false;

		Storage.Cube.MoveTo(amulet);
		Storage.Cube.MoveTo(staff);
		Cubing.openCube();
		print("making staff");
		transmute();
		delay(750 + me.ping);

		staff = me.getItem(91);

		if (!staff) return false;

		Storage.Inventory.MoveTo(staff);
		me.cancel();

		return true;
	};

	this.placeStaff = function () {
		let tick = getTickCount(),
			orifice = getUnit(2, 152);

		if (!orifice) return false;

		Misc.openChest(orifice);

		let staff = me.getItem(91);

		if (!staff) {
			if (getTickCount() - tick < 500) {
				delay(500);
			}

			return false;
		}

		staff.toCursor();
		submitItem();
		delay(750 + me.ping);

		// unbug cursor
		let item = me.findItem(-1, 0, 3);

		if (item && item.toCursor()) {
			Storage.Inventory.MoveTo(item);
		}

		return true;
	};

	this.changeAct = function (act) {
		let npc,
			preArea = me.area;

		if (me.mode === 17) {
			me.revive();

			while (!me.inTown) {
				delay(500);
			}
		}

		if (me.act === act) return true;

		try {
			switch (act) {
			case 2:
				if (me.act >= 2) {
					break;
				}

				if (!Town.npcInteract("Warriv", false)) return false;

				Misc.useMenu(0x0D36);

				break;
			case 3:
				if (me.act >= 3) {
					break;
				}

				// Non Quester needs to talk to Townsfolk to enable Harem TP
				if (!Config.Rushee.Quester) {
					// Talk to Atma
					if (!Town.npcInteract("Atma")) {
						break;
					}
				}
				
				Pather.usePortal(50, Config.Leader);
				Pather.moveToExit(40, true);

				npc = getUnit(1, NPC.Jerhyn);

				if (!npc || !npc.openMenu()) {
					Pather.moveTo(5166, 5206);

					return false;
				}

				me.cancel();
				Pather.moveToExit(50, true);
				Pather.usePortal(40, Config.Leader);

				if (!Town.npcInteract("Meshif", false)) return false;

				Misc.useMenu(0x0D38);

				break;
			case 4:
				if (me.act >= 4) {
					break;
				}

				if (me.inTown) {
					Town.npcInteract("Cain");
					Pather.usePortal(102, Config.Leader);
				} else {
					delay(1500);
				}

				Pather.moveTo(17591, 8070);
				Pather.usePortal(null);

				break;
			case 5:
				if (me.act >= 5) {
					break;
				}

				Town.npcInteract("Tyrael", false);

				delay(me.ping + 1);

				if (getUnit(2, 566)) {
					me.cancel();
					Pather.useUnit(2, 566, 109);
				} else {
					Misc.useMenu(0x58D2);
				}

				break;
			}

			delay(1000 + me.ping * 2);

			while (!me.area) {
				delay(500);
			}

			if (me.area === preArea) {
				me.cancel();
				Town.move("portalspot");
				this.log("Act change failed.", Config.LocalChat.Enabled);

				return false;
			}

			this.log("Act change done.", Config.LocalChat.Enabled);
		} catch (e) {
			return false;
		}

		return true;
	};

	this.getQuestInfo = function (id) {
		// note: end bosses double printed to match able to go to act flag
		let quests = [
			["cain", 4], ["andariel", 6], ["andariel", 7],
			["radament", 9], ["cube", 10], ["amulet", 11], ["summoner", 12], ["duriel", 14], ["duriel", 15],
			["lamesen", 20], ["travincal", 21], ["mephisto", 22], ["mephisto", 23],
			["izual", 25], ["diablo", 26], ["diablo", 28],
			["shenk", 35], ["anya", 37], ["ancients", 39], ["baal", 40]
		];

		let quest = quests.find(element => element[1] === id);

		return (!!quest ? quest[0] : "");
	};

	addEventListener("chatmsg",
		function (who, msg) {
			if (who === Config.Leader) {
				actions.push(msg);
			}
		});

	// START
	Town.goToTown(me.highestAct);
	me.inTown && Town.move("portalspot");

	while (!leader) {
		leader = Misc.findPlayer(Config.Leader);

		delay(500);
	}

	Config.Rushee.Quester && this.log("Leader found", Config.LocalChat.Enabled);

	while (true) {
		try {
			if (actions.length > 0) {
				switch (actions[0]) {
				case "all in":
					switch (leader.area) {
					case 49: // Pick Book of Skill, use Book of Skill
						Town.move("portalspot");
						Pather.usePortal(49, Config.Leader);
						delay(500);

						while (true) {
							target = getUnit(4, 552);

							if (!target) {
								break;
							}

							Pickit.pickItem(target);
							delay(250);

							if (me.getItem(552)) {
								print("Using book of skill");
								clickItem(1, me.getItem(552));

								break;
							}
						}

						Pather.usePortal(40, Config.Leader);
						actions.shift();

						break;
					}

					actions.shift();

					break;
				case "questinfo":
					if (!Config.Rushee.Quester) {
						actions.shift();

						break;
					}

					say("highestquest " + this.getQuestInfo(me.highestQuestDone));
					actions.shift();

					break;
				case "wpinfo":
					if (!Config.Rushee.Quester) {
						actions.shift();

						break;
					}

					// go activate wp if we don't know our wps yet
					!getWaypoint(1) && Pather.getWP(me.area);

					let myWps = Pather.wpAreas.slice(0).filter(function (area) {
						if (sdk.areas.Towns.includes(area) || area === sdk.areas.HallsofPain) return false;
						if (me.classic && area >= sdk.areas.Harrogath) return false;
						if (getWaypoint(Pather.wpAreas.indexOf(area))) return false;
						return true;
					});

					say("mywps " + JSON.stringify(myWps));
					actions.shift();

					break;
				case "wp":
					if (!me.inTown && !Town.goToTown()) {
						this.log("I can't get to town :(", Config.LocalChat.Enabled);

						break;
					}

					act = Misc.getPlayerAct(leader);

					if (me.act !== act) {
						Town.goToTown(act);
						Town.move("portalspot");
					}

					Town.getDistance("portalspot") > 10 && Town.move("portalspot");
					if (Pather.usePortal(null, Config.Leader) && Pather.getWP(me.area) && Pather.usePortal(sdk.areas.townOf(me.area), Config.Leader) && Town.move("portalspot")) {
						me.inTown && Config.LocalChat.Enabled && say("gotwp");
					} else {
						this.log("Failed to get wp", Config.LocalChat.Enabled);
						!me.inTown && Town.goToTown();
					}

					actions.shift();

					break;
				case "1":
					while (!leader.area) {
						delay(500);
					}

					if (!Config.Rushee.Quester) {
						actions.shift();

						break;
					}

					act = Misc.getPlayerAct(leader);

					if (me.act !== act) {
						Town.goToTown(act);
						Town.move("portalspot");
					}

					switch (leader.area) {
					case sdk.areas.StonyField:
						if (!Pather.usePortal(sdk.areas.StonyField, Config.Leader)) {
							this.log("Failed to us portal to stony field", Config.LocalChat.Enabled);
							break;
						}

						let stones = [getUnit(2, 17), getUnit(2, 18), getUnit(2, 19), getUnit(2, 20), getUnit(2, 21)];

						while (stones.some((stone) => !stone.mode)) {
							for (let i = 0, stone = void 0; i < stones.length; i++) {
								stone = stones[i];

								if (Misc.openChest(stone)) {
									stones.splice(i, 1);
									i--;
								}
								delay(10);
							}
						}

						let tick = getTickCount();
						// wait up to two minutes
						while (getTickCount() - tick < 60 * 1000 * 2) {
							if (Pather.getPortal(sdk.areas.Tristram)) {
								Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
								
								break;
							}
						}
						Town.move("portalspot");
						actions.shift();

						break;
					case sdk.areas.DarkWood:
						if (!Pather.usePortal(sdk.areas.DarkWood, Config.Leader)) {
							this.log("Failed to use portal to dark wood", Config.LocalChat.Enabled);
							break;
						}

						this.getQuestItem(sdk.items.quest.ScrollofInifuss, 30);
						delay(500);
						Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
						
						if (Town.npcInteract("Akara")) {
							this.log("Akara done", Config.LocalChat.Enabled);
						}

						Town.move("portalspot");
						actions.shift();

						break;
					case sdk.areas.Tristram:
						if (!Pather.usePortal(sdk.areas.Tristram, Config.Leader)) {
							this.log("Failed to use portal to Tristram", Config.LocalChat.Enabled);
							break;
						}

						let gibbet = getUnit(2, 26);

						if (gibbet && !gibbet.mode) {
							Pather.moveTo(gibbet.x, gibbet.y);
							if (Misc.poll(() => Misc.openChest(gibbet), 2000, 100)) {
								Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
								Town.npcInteract("Akara") && this.log("Akara done", Config.LocalChat.Enabled);
							}
						}
						Town.move("portalspot");
						actions.shift();

						break;
					case 37: // Catacombs level 4
						if (!Pather.usePortal(37, Config.Leader)) {
							this.log("Failed to use portal to catacombs", Config.LocalChat.Enabled);
							break;
						}

						target = Pather.getPortal(null, Config.Leader);
						target && Pather.walkTo(target.x, target.y);

						actions.shift();

						break;
					case 49:
						Town.move("portalspot");

						if (Pather.usePortal(49, Config.Leader)) {
							actions.shift();
						}

						break;
					case 60: // Halls of the Dead level 3
						Pather.usePortal(60, Config.Leader);
						this.getQuestItem(549, 354);
						Pather.usePortal(40, Config.Leader);

						actions.shift();

						break;
					case 61: // Claw Viper Temple level 2
						Pather.usePortal(61, Config.Leader);
						this.getQuestItem(521, 149);
						Pather.usePortal(40, Config.Leader);
						
						if (Town.npcInteract("Drognan")) {
							actions.shift();
							say("drognan done", Config.LocalChat.Enabled);
						}

						Town.move("portalspot");

						break;
					case 64: // Maggot Lair level 3
						Pather.usePortal(64, Config.Leader);
						this.getQuestItem(92, 356);
						delay(500);
						Pather.usePortal(40, Config.Leader);
						this.cubeStaff();

						actions.shift();

						break;
					case 74: // Arcane Sanctuary
						if (!Pather.usePortal(74, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case 66: // Tal Rasha's Tombs
					case 67:
					case 68:
					case 69:
					case 70:
					case 71:
					case 72:
						Pather.usePortal(null, Config.Leader);
						this.placeStaff();
						Pather.usePortal(40, Config.Leader);
						actions.shift();

						break;
					case 73: // Duriel's Lair
						Pather.usePortal(73, Config.Leader);
						this.tyraelTalk();

						actions.shift();

						break;
					case 83: // Travincal
						if (!Pather.usePortal(83, Config.Leader)) {
							me.cancel();

							break;
						}

						actions.shift();

						break;
					case 94: // Ruined Temple
						if (!Pather.usePortal(94, Config.Leader)) {
							me.cancel();

							break;
						}

						this.getQuestItem(548, 193);
						Pather.usePortal(75, Config.Leader);
						Town.npcInteract("Alkor");
						Town.move("portalspot");
						actions.shift();


						break;
					case 102: // Durance of Hate level 3
						if (!Pather.usePortal(102, Config.Leader)) {
							me.cancel();

							break;
						}

						actions.shift();

						break;
					case 104: // sometimes the portal can be in city of the damned...
					case 105:
						if (Pather.usePortal(null, Config.Leader)) {
							actions.shift();
						}

						break;
					case 108: // Chaos Sanctuary
						Pather.usePortal(108, Config.Leader);
						Pather.moveTo(7762, 5268);
						Packet.flash(me.gid);
						delay(500);
						Pather.walkTo(7763, 5267, 2);

						while (!getUnit(1, 243)) {
							delay(500);
						}

						Pather.moveTo(7763, 5267);
						actions.shift();

						break;
					case 110: // Bloody Foothils
						Pather.usePortal(110, Config.Leader);
						actions.shift();

						break;
					case 114: // Frozen River
						Town.npcInteract("Malah");

						Pather.usePortal(114, Config.Leader);
						delay(500);

						target = getUnit(2, 558);

						if (target) {
							Pather.moveToUnit(target);
							sendPacket(1, 0x13, 4, 0x2, 4, target.gid);
							delay(1000);
							me.cancel();
						}

						actions.shift();

						break;
					default: // unsupported area
						actions.shift();

						break;
					}

					break;
				case "2": // Go back to town and check quest
					if (!Config.Rushee.Quester) {
						switch (leader.area) {
						// Non-questers can piggyback off quester out messages
						case 110: // Shenk
							if (me.act === 5) {
								Town.npcInteract("Larzuk");
							}

							break;
						case 114: // Anya
							if (me.act === 5) {
								Town.npcInteract("Malah");

								if (me.getItem(646)) {
									print("Using scroll of resistance");
									clickItem(1, me.getItem(646));
								}
							}

							break;
						case 104:
						case 105:
							if (me.act === 4 && Misc.checkQuest(25, 1)) {
								Town.npcInteract("Tyrael");
							}

							break;
						}

						actions.shift();

						break;
					}

					this.revive();

					switch (me.area) {
					case 37: // Catacombs level 4
						// Go to town if not there, break if procedure fails
						if (!me.inTown && !Pather.usePortal(1, Config.Leader)) {
							break;
						}

						if (!Misc.checkQuest(6, 4)) {
							D2Bot.printToConsole("Andariel quest failed", 9);
							quit();
						}

						actions.shift();

						break;
					case 49: // Sewers 3
						if (!me.inTown && !Pather.usePortal(40, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case 74: // Arcane Sanctuary
						if (!me.inTown && !Pather.usePortal(40, Config.Leader)) {
							break;
						}

						Town.npcInteract("Atma");

						if (!Misc.checkQuest(13, 0)) {
							D2Bot.printToConsole("Summoner quest failed", 9);
							quit();
						}

						Town.move("portalspot");
						actions.shift();

						break;
					case 83: // Travincal
						if (!me.inTown && !Pather.usePortal(75, Config.Leader)) {
							break;
						}

						Town.npcInteract("Cain");

						if (!Misc.checkQuest(21, 0)) {
							D2Bot.printToConsole("Travincal quest failed", 9);
							quit();
						}

						Town.move("portalspot");
						actions.shift();

						break;
					case 102: // Durance 2
						if (!Pather.usePortal(75, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case 104:
					case 105:
						if (!me.inTown && !Pather.usePortal(103, Config.Leader)) {
							break;
						}

						if (Misc.checkQuest(25, 1)) {
							Town.npcInteract("Tyrael");
							Town.move("portalspot");
						}

						actions.shift();

						break;
					case 108: // Chaos Sanctuary
						me.classic && D2Bot.restart();

						if (!me.inTown && !Pather.usePortal(103, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case 110: // Bloody Foothils
						if (!me.inTown && !Pather.usePortal(109, Config.Leader)) {
							break;
						}

						Town.npcInteract("Larzuk");
						Town.move("portalspot");
						actions.shift();

						break;
					case 114: // Frozen River
						if (!me.inTown && !Pather.usePortal(109, Config.Leader)) {
							break;
						}

						Town.npcInteract("Malah");

						if (me.getItem(646)) {
							print("Using Scroll of Resistance");
							clickItem(1, me.getItem(646));
						}

						Town.move("portalspot");
						actions.shift();

						break;
					default:
						Town.move("portalspot");
						actions.shift();

						break;
					}

					break;
				case "3": // Bumper
					if (!Config.Rushee.Bumper) {
						actions.shift();

						break;
					}

					while (!leader.area) {
						delay(500);
					}

					act = Misc.getPlayerAct(leader);

					if (me.act !== act) {
						Town.goToTown(act);
						Town.move("portalspot");
					}

					switch (leader.area) {
					case 120: // Arreat Summit
						if (!Pather.usePortal(120, Config.Leader)) {
							break;
						}

						// Wait until portal is gone
						while (Pather.getPortal(109, Config.Leader)) {
							delay(500);
						}

						// Wait until portal is up again
						while (!Pather.getPortal(109, Config.Leader)) {
							delay(500);
						}

						if (!Pather.usePortal(109, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case 132: // Worldstone Chamber
						if (!Pather.usePortal(132, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					}

					break;
				case "quit":
					done = true;

					break;
				case "exit":
				case "bye ~":
					D2Bot.restart();

					break;
				case "a2":
				case "a3":
				case "a4":
				case "a5":
					act = actions[0].toString()[1];
					!!act && (act = (parseInt(act, 10) || me.act + 1));

					if (!this.changeAct(act)) {
						break;
					}

					Town.move("portalspot");
					actions.shift();

					break;
				case me.name + " quest":
					say("I am quester.");
					Config.Rushee.Quester = true;

					actions.shift();

					break;
				case "leader":
					print(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now");
					Config.LocalChat.Enabled && say(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now");
					actions.shift();

					break;
				default: // Invalid command
					actions.shift();

					break;
				}
			}
		} catch (e) {
			if (me.mode === 17) {
				me.revive();

				while (!me.inTown) {
					delay(500);
				}
			}
		}

		if (getUIFlag(0x17)) {
			me.cancel();
		}

		if (done) {
			break;
		}

		delay(500);
	}

	done && quit();

	return true;
}
