/**
*  @filename    ControlBot.js
*  @author      theBGuy
*  @credits     kolton
*  @desc        Chat controlled bot for other players. Can open cow portal, give waypoints on command, bo, or enchant
*
*/

function ControlBot() {
	let command, nick;
	let startTime = getTickCount();
	let shitList = [];
	let greet = [];

	let controlCommands = ["help", "timeleft", "cows", "wps", "chant", "bo"];
	let commandDesc = {
		"help": "Display commands",
		"timeleft": "Remaining time left for this game",
		"cows": "Open cow level",
		"chant": "Enchant. AutoChant is " + (Config.ControlBot.Chant.AutoEnchant ? "ON" : "OFF"),
		"wps": "Give waypoints",
		"bo": "Bo at waypoint",
	};

	// remove commands we can't/aren't using
	for (let i = 0; i < controlCommands.length; i++) {
		switch (controlCommands[i]) {
		case "cows":
			if (!Config.ControlBot.Cows.MakeCows) {
				controlCommands.splice(i, 1);
				i--;
			}

			break;
		case "chant":
			if (!Config.ControlBot.Chant.Enchant || !me.getSkill(sdk.skills.Enchant, sdk.skills.subindex.SoftPoints)) {
				Config.ControlBot.Chant.Enchant = false;
				Config.ControlBot.Chant.AutoEnchant = false;
				controlCommands.splice(i, 1);
				i--;
			}

			break;
		case "wps":
			if (!Config.ControlBot.Wps.GiveWps) {
				controlCommands.splice(i, 1);
				i--;
			}

			break;
		case "bo":
			if (!Config.ControlBot.Bo || (!me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.SoftPoints) && Precast.haveCTA === -1)) {
				Config.ControlBot.Bo = false;
				controlCommands.splice(i, 1);
				i--;
			}

			break;
		}
	}

	this.enchant = function (nick) {
		if (!Config.ControlBot.Chant.Enchant) return false;

		if (!Misc.inMyParty(nick)) {
			say("Accept party invite, noob.");

			return false;
		}

		let unit = Game.getPlayer(nick);

		if (unit.distance > 35) {
			say("Get closer.");

			return false;
		}

		if (!unit) {
			let partyUnit = getParty(nick);

			// wait until party area is readable?
			if (partyUnit.inTown) {
				say("Wait for me at waypoint.");
				Town.goToTown(sdk.areas.townOf(partyUnit.area));

				unit = Game.getPlayer(nick);
			} else {
				say("You need to be in one of the towns.");

				return false;
			}
		}

		if (unit) {
			do {
				// player is alive
				if (!unit.dead) {
					if (unit.distance >= 35) {
						say("You went too far away.");

						return false;
					}

					Packet.enchant(unit);
					delay(500);
				}
			} while (unit.getNext());
		} else {
			say("I don't see you");
		}

		unit = Game.getMonster();

		if (unit) {
			do {
				// merc or any other owned unit
				if (unit.getParent() && unit.getParent().name === nick) {
					Packet.enchant(unit);
					delay(500);
				}
			} while (unit.getNext());
		}

		return true;
	};

	this.bo = function (nick) {
		if (!Config.ControlBot.Bo) return false;

		if (!Misc.inMyParty(nick)) {
			say("Accept party invite, noob.");

			return false;
		}

		let partyUnit = getParty(nick);

		// wait until party area is readable?
		if (partyUnit.inTown) {
			say("Can't bo you in town noob, go to a waypoint");

			return false;
		} else if (Pather.wpAreas.includes(partyUnit.area)) {
			Pather.useWaypoint(partyUnit.area);
		} else {
			say("Can't find you or you're not somewhere with a waypoint");

			return false;
		}

		let unit = Game.getPlayer(nick);

		if (unit && unit.distance > 15) {
			say("Get closer.");
			let waitTick = getTickCount();

			while (unit && unit.distance > 15) {
				if (getTickCount() - waitTick > 30e3) {
					say("You took to long. Going back to town");
					return false;
				}
				delay(150);
			}
		}

		if (unit && unit.distance <= 15 && !unit.dead) {
			Misc.poll(function () {
				Precast.doPrecast(true);
				return unit.getState(sdk.states.BattleOrders);
			}, 5000, 1000);
			Pather.useWaypoint(sdk.areas.RogueEncampment);
		} else {
			say("I don't see you");
		}

		return true;
	};

	this.autoChant = function () {
		if (!Config.ControlBot.Chant.Enchant) return false;

		let chanted = [];
		let unit = Game.getPlayer();

		if (unit) {
			do {
				if (unit.name !== me.name && !unit.dead && shitList.indexOf(unit.name) === -1 && Misc.inMyParty(unit.name) && !unit.getState(sdk.states.Enchant) && unit.distance <= 40) {
					Packet.enchant(unit);
					delay(500);
					chanted.push(unit.name);
				}
			} while (unit.getNext());
		}

		unit = Game.getMonster();

		if (unit) {
			do {
				if (unit.getParent() && chanted.includes(unit.getParent().name) && !unit.getState(sdk.states.Enchant) && unit.distance <= 40) {
					Packet.enchant(unit);
					delay(500);
				}
			} while (unit.getNext());
		}

		return true;
	};

	this.getLeg = function () {
		if (me.getItem(sdk.items.quest.WirtsLeg)) {
			return me.getItem(sdk.items.quest.WirtsLeg);
		}

		let leg, gid, wrongLeg;

		if (!Config.ControlBot.Cows.GetLeg) {
			leg = Game.getItem(sdk.items.quest.WirtsLeg);

			if (leg) {
				do {
					if (leg.name.includes("ÿc1")) {
						wrongLeg = true;
					} else if (leg.distance <= 15) {
						gid = leg.gid;
						Pickit.pickItem(leg);

						return me.getItem(-1, -1, gid);
					}
				} while (leg.getNext());
			}

			say("Bring the leg " + (wrongLeg ? "from this difficulty" : "") + " close to me.");

			return false;
		}

		if (!Pather.journeyTo(sdk.areas.Tristram)) {
			say("Failed to enter Tristram :(");
			Town.goToTown();

			return false;
		}

		Pather.moveTo(25048, 5177);

		let wirt = Game.getObject(sdk.quest.chest.Wirt);

		for (let i = 0; i < 8; i += 1) {
			wirt.interact();
			delay(500);

			leg = Game.getItem(sdk.quest.item.WirtsLeg);

			if (leg) {
				gid = leg.gid;

				Pickit.pickItem(leg);
				Town.goToTown();

				return me.getItem(-1, -1, gid);
			}
		}

		Town.goToTown();
		say("Failed to get the leg :(");

		return false;
	};

	this.getTome = function () {
		let tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

		if (tpTome.length < 2) {
			let npc = Town.initNPC("Shop", "buyTpTome");

			if (!getInteractedNPC()) {
				throw new Error("Failed to find npc");
			}

			let tome = npc.getItem(sdk.items.TomeofTownPortal);

			if (!!tome && tome.getItemCost(sdk.items.cost.ToBuy) < me.gold && tome.buy()) {
				delay(500);
				tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);
				tpTome.forEach(function (book) {
					if (book.isInInventory) {
						let scroll = npc.getItem(sdk.items.ScrollofTownPortal);

						while (book.getStat(sdk.stats.Quantity) < 20) {
							if (!!scroll && scroll.getItemCost(sdk.items.cost.ToBuy) < me.gold) {
								scroll.buy(true);
							} else {
								break;
							}

							delay(20);
						}
					}
				});
			} else {
				throw new Error("Failed to buy tome");
			}
		}

		return tpTome.last();
	};

	this.openPortal = function (nick) {
		if (!Config.ControlBot.Cows.MakeCows) return false;
		if (!Misc.inMyParty(nick)) {
			say("Accept party invite, noob.");

			return true;
		}

		if (Pather.getPortal(sdk.areas.MooMooFarm)) {
			say("Cow portal already open.");

			return true;
		}

		// king dead or cain not saved
		if (me.cows) {
			say("Can't open the portal because I killed Cow King.");

			return false;
		}

		if (Config.ControlBot.Cows.GetLeg && !me.tristram && !!Config.Leader && !getParty(Config.Leader)) {
			say("Can't get leg because I don't have Cain quest.");

			return false;
		}

		if (!me.diffCompleted) {
			say("Final quest incomplete.");

			return false;
		}

		let leg = this.getLeg();
		if (!leg) return false;

		let tome = this.getTome();
		if (!tome) return false;

		if (!Town.openStash() || !Cubing.emptyCube() || !Storage.Cube.MoveTo(leg) || !Storage.Cube.MoveTo(tome) || !Cubing.openCube()) {
			return false;
		}

		transmute();
		delay(500);

		for (let i = 0; i < 10; i += 1) {
			if (Pather.getPortal(sdk.areas.MooMooFarm)) {
				return true;
			}

			delay(200);
		}

		say("Failed to open cow portal.");

		return false;
	};

	this.getWpNick = function (nick) {
		!this.wpNicks && (this.wpNicks = {});

		if (this.wpNicks.hasOwnProperty(nick)) {
			if (this.wpNicks[nick].requests > 4) {
				return "maxrequests";
			}

			if (getTickCount() - this.wpNicks[nick].timer < 60000) {
				return "mintime";
			}

			return true;
		}

		return false;
	};

	this.addWpNick = function (nick) {
		this.wpNicks[nick] = {timer: getTickCount(), requests: 0};
	};

	this.giveWps = function (nick) {
		if (!Config.ControlBot.Wps.GiveWps) return false;
		if (!Misc.inMyParty(nick)) {
			say("Accept party invite, noob.");

			return false;
		}

		switch (this.getWpNick(nick)) {
		case "maxrequests":
			say(nick + ", you have spent all your waypoint requests for this game.");

			return false;
		case "mintime":
			say(nick + ", you may request waypoints every 60 seconds.");

			return false;
		case false:
			this.addWpNick(nick);

			break;
		}

		let wpList;
		let act = Misc.getPlayerAct(nick);

		switch (act) {
		case 1:
			wpList = [
				sdk.areas.ColdPlains, sdk.areas.StonyField, sdk.areas.DarkWood, sdk.areas.BlackMarsh,
				sdk.areas.OuterCloister, sdk.areas.JailLvl1, sdk.areas.InnerCloister, sdk.areas.CatacombsLvl2
			];

			break;
		case 2:
			wpList = [
				sdk.areas.A2SewersLvl2, sdk.areas.DryHills, sdk.areas.HallsoftheDeadLvl2, sdk.areas.FarOasis,
				sdk.areas.LostCity, sdk.areas.PalaceCellarLvl1, sdk.areas.ArcaneSanctuary, sdk.areas.CanyonofMagic
			];

			break;
		case 3:
			wpList = [
				sdk.areas.SpiderForest, sdk.areas.GreatMarsh, sdk.areas.FlayerJungle, sdk.areas.LowerKurast,
				sdk.areas.KurastBazaar, sdk.areas.UpperKurast, sdk.areas.Travincal, sdk.areas.DuranceofHateLvl2
			];

			break;
		case 4:
			wpList = [sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame];

			break;
		case 5:
			wpList = [
				sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau, sdk.areas.CrystalizedPassage,
				sdk.areas.GlacialTrail, sdk.areas.FrozenTundra, sdk.areas.AncientsWay, sdk.areas.WorldstoneLvl2
			];

			break;
		}

		for (let i = 0; i < wpList.length; i++) {
			if (this.checkHostiles()) {
				break;
			}

			try {
				Pather.useWaypoint(wpList[i], true);

				if (Config.ControlBot.Wps.SecurePortal) {
					Attack.securePosition(me.x, me.y, 20, 1000);
				}

				Pather.makePortal();
				say(Pather.getAreaName(me.area) + " TP up");

				for (let timeout = 0; timeout < 20; timeout++) {
					if (Game.getPlayer(nick)) {
						break;
					}

					delay(1000);
				}

				if (timeout >= 20) {
					say("Aborting wp giving.");

					break;
				}

				delay(5000);
			} catch (error) {
				continue;
			}
		}

		Town.doChores();
		Town.goToTown(1);
		Town.move("portalspot");

		this.wpNicks[nick].requests += 1;
		this.wpNicks[nick].timer = getTickCount();

		return true;
	};

	this.checkHostiles = function () {
		let rval = false;
		let party = getParty();

		if (party) {
			do {
				if (party.name !== me.name && getPlayerFlag(me.gid, party.gid, 8)) {
					rval = true;

					if (Config.ShitList && shitList.indexOf(party.name) === -1) {
						shitList.push(party.name);
					}
				}
			} while (party.getNext());
		}

		return rval;
	};

	this.floodCheck = function (command) {
		if (!command || command.length < 2) return false;
		let cmd = command[0], nick = command[1];
			
		// ignore overhead messages
		if (!nick) return true;
		// ignore messages not related to our commands
		if (controlCommands.indexOf(cmd.toLowerCase()) === -1) return false;

		!this.cmdNicks && (this.cmdNicks = {});

		if (!this.cmdNicks.hasOwnProperty(nick)) {
			this.cmdNicks[nick] = {
				firstCmd: getTickCount(),
				commands: 0,
				ignored: false
			};
		}

		if (this.cmdNicks[nick].ignored) {
			if (getTickCount() - this.cmdNicks[nick].ignored < 60000) {
				return true; // ignore flooder
			}

			// unignore flooder
			this.cmdNicks[nick].ignored = false;
			this.cmdNicks[nick].commands = 0;
		}

		this.cmdNicks[nick].commands += 1;

		if (getTickCount() - this.cmdNicks[nick].firstCmd < 10000) {
			if (this.cmdNicks[nick].commands > 5) {
				this.cmdNicks[nick].ignored = getTickCount();

				say(nick + ", you are being ignored for 60 seconds because of flooding.");
			}
		} else {
			this.cmdNicks[nick].firstCmd = getTickCount();
			this.cmdNicks[nick].commands = 0;
		}

		return false;
	};

	function chatEvent(nick, msg) {
		if (shitList.includes(nick)) {
			say("No commands for the shitlisted.");

			return;
		}

		command = [msg, nick];
	}

	// eslint-disable-next-line no-unused-vars
	function gameEvent(mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x02:
			// idle in town
			me.inTown && me.mode === sdk.player.mode.StandingInTown && greet.push(name1);

			break;
		}
	}

	// START
	Config.ShitList && (shitList = ShitList.read());

	addEventListener("chatmsg", chatEvent);
	addEventListener("gameevent", gameEvent);
	Town.doChores();
	Town.goToTown(1);
	Town.move("portalspot");

	let spot = {
		x: me.x,
		y: me.y
	};

	while (true) {
		while (greet.length > 0) {
			nick = greet.shift();

			if (shitList.indexOf(nick) === -1) {
				say("Welcome, " + nick + "! For a list of commands say 'help'");
			}
		}

		spot && spot.distance > 10 && Pather.moveTo(spot.x, spot.y);

		if (command && !this.floodCheck(command)) {
			let hostile = this.checkHostiles();

			switch (command[0].toLowerCase()) {
			case "help":
				let str = "";
				controlCommands.forEach((cmd) => {
					str += (cmd + " (" + commandDesc[cmd] + "), ");
				});

				say("Commands:");
				say(str);

				break;
			case "timeleft":
				let tick = Config.ControlBot.GameLength * 6e4 - getTickCount() + startTime;
				let m = Math.floor(tick / 60000);
				let s = Math.floor((tick / 1000) % 60);

				say("Time left: " + (m ? m + " minute" + (m > 1 ? "s" : "") + ", " : "") + s + " second" + (s > 1 ? "s." : "."));

				break;
			case "chant":
				this.enchant(command[1]);

				break;
			case "cows":
				if (hostile) {
					say("Command disabled because of hostiles.");

					break;
				}

				this.openPortal(command[1]);
				me.cancel();

				break;
			case "wps":
				if (hostile) {
					say("Command disabled because of hostiles.");

					break;
				}

				this.giveWps(command[1]);

				break;
			case "bo":
				if (hostile) {
					say("Command disabled because of hostiles.");

					break;
				}

				this.bo(command[1]);

				break;
			}
		}

		command = "";

		me.act > 1 && Town.goToTown(1);
		Config.ControlBot.Chant.AutoEnchant && this.autoChant();

		if (getTickCount() - startTime >= Config.ControlBot.GameLength * 6e4) {
			say((Config.ControlBot.EndMessage ? Config.ControlBot.EndMessage : "Bye"));
			delay(1000);

			break;
		}

		delay(200);
	}

	return true;
}
