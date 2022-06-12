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

	this.useScrollOfRes = function () {
		let scroll = me.scrollofresistance;
		if (scroll) {
			clickItem(1, scroll);
			print("Using scroll of resistance");
		}
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

	// todo - map the chest to classid so we only need to pass in one value
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
			npc.distance > 3 && Pather.moveToUnit(npc);
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
		let shaft = me.shaft;
		let amulet = me.amulet;

		if (!shaft || !amulet) return false;

		Storage.Cube.MoveTo(amulet);
		Storage.Cube.MoveTo(shaft);
		Cubing.openCube();
		print("making staff");
		transmute();
		delay(750 + me.ping);

		let staff = me.completestaff;

		if (!staff) return false;

		Storage.Inventory.MoveTo(staff);
		me.cancel();

		return true;
	};

	this.placeStaff = function () {
		let tick = getTickCount();
		let orifice = object(sdk.quest.chest.HoradricStaffHolder);

		if (!orifice) return false;

		Misc.openChest(orifice);

		let staff = me.completestaff;

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
		let npc;
		let preArea = me.area;

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

				if (object(sdk.units.RedPortalToAct5)) {
					me.cancel();
					Pather.useUnit(2, sdk.units.RedPortalToAct5, 109);
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
					case sdk.areas.A2SewersLvl3:
						// Pick Book of Skill, use Book of Skill
						Town.move("portalspot");
						Pather.usePortal(sdk.areas.A2SewersLvl3, Config.Leader);
						delay(500);

						while (true) {
							target = item(sdk.quest.item.BookofSkill);

							if (!target) {
								break;
							}

							Pickit.pickItem(target);
							delay(250);
							target = me.getItem(sdk.quest.item.BookofSkill);

							if (target) {
								print("Using book of skill");
								clickItem(1, target);

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

					let myWps = Pather.nonTownWpAreas.slice(0).filter(function (area) {
						if (area === sdk.areas.HallsofPain) return false;
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

						let stones = [
							object(sdk.quest.chest.StoneAlpha),
							object(sdk.quest.chest.StoneBeta),
							object(sdk.quest.chest.StoneGamma),
							object(sdk.quest.chest.StoneDelta),
							object(sdk.quest.chest.StoneLambda)
						];

						while (stones.some((stone) => !stone.mode)) {
							for (let i = 0; i < stones.length; i++) {
								let stone = stones[i];

								if (Misc.openChest(stone)) {
									stones.splice(i, 1);
									i--;
								}
								delay(10);
							}
						}

						let tick = getTickCount();
						// wait up to two minutes
						while (getTickCount() - tick < minutes(2)) {
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

						let gibbet = object(sdk.quest.chest.CainsJail);

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
					case sdk.areas.CatacombsLvl4:
						if (!Pather.usePortal(sdk.areas.CatacombsLvl4, Config.Leader)) {
							this.log("Failed to use portal to catacombs", Config.LocalChat.Enabled);
							break;
						}

						target = Pather.getPortal(null, Config.Leader);
						target && Pather.walkTo(target.x, target.y);

						actions.shift();

						break;
					case sdk.areas.A2SewersLvl3:
						Town.move("portalspot");

						if (Pather.usePortal(sdk.areas.A2SewersLvl3, Config.Leader)) {
							actions.shift();
						}

						break;
					case sdk.areas.HallsoftheDeadLvl3:
						Pather.usePortal(sdk.areas.HallsoftheDeadLvl3, Config.Leader);
						this.getQuestItem(549, 354);
						Pather.usePortal(sdk.areas.LutGholein, Config.Leader);

						actions.shift();

						break;
					case sdk.areas.ClawViperTempleLvl2:
						Pather.usePortal(sdk.areas.ClawViperTempleLvl2, Config.Leader);
						this.getQuestItem(521, 149);
						Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
						
						if (Town.npcInteract("Drognan")) {
							actions.shift();
							say("drognan done", Config.LocalChat.Enabled);
						}

						Town.move("portalspot");

						break;
					case sdk.areas.MaggotLairLvl3:
						Pather.usePortal(sdk.areas.MaggotLairLvl3, Config.Leader);
						this.getQuestItem(92, 356);
						delay(500);
						Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
						this.cubeStaff();

						actions.shift();

						break;
					case sdk.areas.ArcaneSanctuary:
						if (!Pather.usePortal(sdk.areas.ArcaneSanctuary, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case sdk.areas.TalRashasTomb1:
					case sdk.areas.TalRashasTomb2:
					case sdk.areas.TalRashasTomb3:
					case sdk.areas.TalRashasTomb4:
					case sdk.areas.TalRashasTomb5:
					case sdk.areas.TalRashasTomb6:
					case sdk.areas.TalRashasTomb7:
						Pather.usePortal(null, Config.Leader);
						this.placeStaff();
						Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
						actions.shift();

						break;
					case sdk.areas.DurielsLair:
						Pather.usePortal(sdk.areas.DurielsLair, Config.Leader);
						this.tyraelTalk();

						actions.shift();

						break;
					case sdk.areas.Travincal:
						if (!Pather.usePortal(sdk.areas.Travincal, Config.Leader)) {
							me.cancel();

							break;
						}

						actions.shift();

						break;
					case sdk.areas.RuinedTemple:
						if (!Pather.usePortal(94, Config.Leader)) {
							me.cancel();

							break;
						}

						this.getQuestItem(548, 193);
						Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader);
						Town.npcInteract("Alkor");
						Town.move("portalspot");
						actions.shift();


						break;
					case sdk.areas.DuranceofHateLvl3:
						if (!Pather.usePortal(sdk.areas.DuranceofHateLvl3, Config.Leader)) {
							me.cancel();

							break;
						}

						actions.shift();

						break;
					case sdk.areas.OuterSteppes:
					case sdk.areas.PlainsofDespair:
						if (Pather.usePortal(null, Config.Leader)) {
							actions.shift();
						}

						break;
					case sdk.areas.ChaosSanctuary:
						Pather.usePortal(sdk.areas.ChaosSanctuary, Config.Leader);
						Pather.moveTo(7762, 5268);
						Packet.flash(me.gid);
						delay(500);
						Pather.walkTo(7763, 5267, 2);

						while (!monster(sdk.monsters.Diablo)) {
							delay(500);
						}

						Pather.moveTo(7763, 5267);
						actions.shift();

						break;
					case sdk.areas.BloodyFoothills:
						Pather.usePortal(sdk.areas.BloodyFoothills, Config.Leader);
						actions.shift();

						break;
					case sdk.areas.FrozenRiver:
						Town.npcInteract("Malah");

						Pather.usePortal(sdk.areas.FrozenRiver, Config.Leader);
						delay(500);

						target = object(sdk.units.FrozenAnya);

						if (target) {
							Pather.moveToUnit(target);
							Misc.poll(() => {
								sendPacket(1, 0x13, 4, 0x2, 4, target.gid);
								delay(100);
								return !object(sdk.units.FrozenAnya);
							}, 1000, 200);
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
						case sdk.areas.OuterSteppes:
						case sdk.areas.PlainsofDespair:
							me.act === 4 && Misc.checkQuest(25, 1) && Town.npcInteract("Tyrael");

							break;
						case sdk.areas.BloodyFoothills:
							me.act === 5 && Town.npcInteract("Larzuk");

							break;
						case sdk.areas.FrozenRiver:
							if (me.act === 5) {
								Town.npcInteract("Malah");
								this.useScrollOfRes();
							}

							break;
						}

						actions.shift();

						break;
					}

					this.revive();

					switch (me.area) {
					case sdk.areas.CatacombsLvl4: // Catacombs level 4
						// Go to town if not there, break if procedure fails
						if (!me.inTown && !Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader)) {
							break;
						}

						if (!Misc.checkQuest(6, 4)) {
							D2Bot.printToConsole("Andariel quest failed", 9);
							quit();
						}

						actions.shift();

						break;
					case sdk.areas.A2SewersLvl3:
						if (!me.inTown && !Pather.usePortal(sdk.areas.LutGholein, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case sdk.areas.ArcaneSanctuary:
						if (!me.inTown && !Pather.usePortal(sdk.areas.LutGholein, Config.Leader)) {
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
					case sdk.areas.Travincal:
						if (!me.inTown && !Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader)) {
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
					case sdk.areas.DuranceofHateLvl3:
						if (!Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case sdk.areas.OuterSteppes:
					case sdk.areas.PlainsofDespair:
						if (!me.inTown && !Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader)) {
							break;
						}

						if (Misc.checkQuest(25, 1)) {
							Town.npcInteract("Tyrael");
							Town.move("portalspot");
						}

						actions.shift();

						break;
					case sdk.areas.ChaosSanctuary:
						me.classic && D2Bot.restart();

						if (!me.inTown && !Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case sdk.areas.BloodyFoothills:
						if (!me.inTown && !Pather.usePortal(sdk.areas.Harrogath, Config.Leader)) {
							break;
						}

						Town.npcInteract("Larzuk");
						Town.move("portalspot");
						actions.shift();

						break;
					case sdk.areas.FrozenRiver:
						if (!me.inTown && !Pather.usePortal(109, Config.Leader)) {
							break;
						}

						Town.npcInteract("Malah");
						this.useScrollOfRes();
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
					case sdk.areas.ArreatSummit:
						if (!Pather.usePortal(sdk.areas.ArreatSummit, Config.Leader)) {
							break;
						}

						// Wait until portal is gone
						while (Pather.getPortal(sdk.areas.Harrogath, Config.Leader)) {
							delay(500);
						}

						// Wait until portal is up again
						while (!Pather.getPortal(sdk.areas.Harrogath, Config.Leader)) {
							delay(500);
						}

						if (!Pather.usePortal(sdk.areas.Harrogath, Config.Leader)) {
							break;
						}

						actions.shift();

						break;
					case sdk.areas.WorldstoneChamber:
						if (!Pather.usePortal(sdk.areas.WorldstoneChamber, Config.Leader)) {
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
