/**
 *	@filename	BoBot.js
 *	@author		casualBotter
 *	@desc		Meant to run alongside Enchant to Bo players
 */

function BoBot () {
	var command, nick, spot,
		shitList = [],
		greet = [];

	this.Bo = function (player) {
		if (!Misc.inMyParty(player)) {
			say("Accept party invite, noob.");

			return false;
		}

		var unit,
			partyUnit = getParty(player);

		// wait until party area is readable?
		if ([1, 40, 75, 103, 109].indexOf(partyUnit.area) > -1) {
			say("Cannot Bo in town.");

			return false;
		} else if ([3, 4, 5, 6, 27, 29, 32, 35, 48, 42, 57, 43, 44, 52, 74, 46, 76, 77, 78, 79, 80, 81, 83, 101, 106, 107, 111, 112, 113, 115, 117, 118, 129].indexOf(partyUnit.area) > -1) { //excludes halls of pain
			print(partyUnit.area); //for debug
			Pather.useWaypoint(partyUnit.area);
			unit = getUnit(0, player);

			if (unit) {
				do {
					if (!unit.dead) { // player is alive
						if (getDistance(me, unit) >= 15) {
							say("You went too far away.");

							return false;
						}

						Precast.doPrecast(true);
					}
				} while (unit.getNext());
			} else {
				say("Couldn't find you, champ. Are you on a Waypoint?");
			}
		} else {
			say("Go to nearest Waypoint, then try again.");

			return false;
		}

		Pather.useWaypoint(1);

		return true;
	};

	this.checkHostiles = function () {
		var rval = false,
			party = getParty();

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

	this.floodCheck = function () {
		var cmd = this.command[0],
			player = this.command[1];

		if (!player) { // ignore overhead messages
			return true;
		}

		if (["barbhelp", Config.BoBot.Trigger[0].toLowerCase()].indexOf(cmd.toLowerCase()) === -1) {
			return false;
		}

		if (!this.cmdPlayers) {
			this.cmdPlayers = {};
		}

		if (!this.cmdPlayers.hasOwnProperty(player)) {
			this.cmdPlayers[player] = {
				firstCmd: getTickCount(),
				commands: 0,
				ignored: false
			};
		}

		if (this.cmdPlayers[player].ignored) {
			if (getTickCount() - this.cmdPlayers[player].ignored < 60000) {
				return true; // ignore flooder
			}

			// unignore flooder
			this.cmdPlayers[player].ignored = false;
			this.cmdPlayers[player].commands = 0;
		}

		this.cmdPlayers[player].commands += 1;

		if (getTickCount() - this.cmdPlayers[player].firstCmd < 10000) {
			if (this.cmdPlayers[player].commands > 5) {
				this.cmdPlayers[player].ignored = getTickCount();

				say(player + ", you are being ignored for 60 seconds because of flooding.");
			}
		} else {
			this.cmdPlayers[player].firstCmd = getTickCount();
			this.cmdPlayers[player].commands = 0;
		}

		return false;
	};

	function ChatEvent (player, msg) {
		command = [msg, player];
	}

	function GreetEvent (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x02:
			if (me.inTown && me.mode === 5) { // idle in town
				greet.push(name1);
			}

			break;
		}
	}

	//start
	if (Config.ShitList) {
		shitList = ShitList.read();
	}

	addEventListener("chatmsg", ChatEvent);
	addEventListener("gameevent", GreetEvent);
	Town.doChores();
	Town.goToTown(1);
	Town.move("portalspot");

	spot = {
		x: me.x,
		y: me.y
	};

	while (true) {
		while (greet.length > 0) {
			nick = greet.shift();

			if (shitList.indexOf(nick) === -1) {
				say("Welcome, " + nick + "! For a list of commands say 'barbhelp'");
			}
		}

		if (spot && getDistance(me, spot) > 10) {
			Pather.moveTo(spot.x, spot.y);
		}

		if (command && !this.floodCheck()) {
			switch (command[0].toLowerCase()) {
			case "barbhelp":
				this.checkHostiles();

				if (shitList.indexOf(command[1]) > -1) {
					say("No " + command[0] + " for the shitlisted.");

					break;
				}

				say("Commands" + (Config.BoBot.Trigger[0] ? " | Bo: " + Config.BoBot.Trigger[0] : "") + "| You must go to a Waypoint, stand on the square then say 'bo'.");

				break;
			case Config.BoBot.Trigger[0].toLowerCase(): // Bo
				this.checkHostiles();

				if (shitList.indexOf(command[1]) > -1) {
					say("No chant for the shitlisted.");

					break;
				}

				this.Bo(command[1]);

				break;
			}
		}

		command = "";
		Pather.useWaypoint(1);
		delay(200);
	}

	return true;
}
