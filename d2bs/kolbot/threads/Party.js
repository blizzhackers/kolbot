/**
*  @filename    Party.js
*  @author      kolton, theBGuy
*  @desc        handle party procedure ingame
*
*/
js_strict(true);

include("json2.js");     // required?
include("polyfill.js");  // required
include("oog/D2Bot.js"); // required

// globals needed for core gameplay
include("core/NTItemParser.js");
include("core/Util.js");
includeCoreLibs();

// system libs
include("systems/automule/AutoMule.js");
include("systems/gambling/Gambling.js");
include("systems/crafting/CraftingSystem.js");
include("systems/torch/TorchSystem.js");
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");

// party thread specific
include("oog/ShitList.js");

function main() {
	Config.init();

	let myPartyId, player, shitList, currScript, scriptList;
	let playerLevels = {};
	let partyTick = getTickCount();

	/**
	 * Format the event message here to prevent repetitive code
	 * @param {string[]} arr 
	 * @param {Player | string} player
	 * @param {string} [killer] 
	 */
	const eventMsg = (arr, player, killer) => {
		try {
			typeof player === "string" && (player = getParty(player));

			if (!player || player.name === me.name) return "";
			return (arr
				.random()
				.format(
					["$name", player.name],
					["$level", player.level],
					["$class", sdk.player.class.nameOf(player.classid)],
					["$killer", killer]
				)
			);
		} catch (e1) {
			return "";
		}
	};

	const gameEvent = function (mode, param1, param2, name1, name2) {
		let msg = "";

		switch (mode) {
		case 0x02: // "%Name1(%Name2) joined our world. Diablo's minions grow stronger."
			if (Config.Greetings.length > 0) {
				msg = eventMsg(Config.Greetings, name1);
			}

			break;
		case 0x06: // "%Name1 was Slain by %Name2"
			if (Config.DeathMessages.length > 0) {
				msg = eventMsg(Config.DeathMessages, name1, name2);
			}

			break;
		}

		if (msg) {
			say(msg);
		}
	};

	if (Config.Greetings.length > 0 || Config.DeathMessages.length > 0) {
		addEventListener("gameevent", gameEvent);
	}

	addEventListener("scriptmsg",
		function (msg) {
			let obj;

			try {
				obj = JSON.parse(msg);

				if (obj && obj.hasOwnProperty("currScript")) {
					currScript = obj.currScript;
				}
			} catch (e3) {
				return;
			}
		});

	print("ÿc2Party thread loaded. Mode: " + (Config.PublicMode === 2 ? "Accept" : "Invite"));

	if (Config.ShitList || Config.UnpartyShitlisted) {
		shitList = ShitList.read();

		print(shitList.length + " entries in shit list.");
	}

	if (Config.PartyAfterScript) {
		scriptList = [];

		for (let i in Scripts) {
			if (Scripts.hasOwnProperty(i) && !!Scripts[i]) {
				scriptList.push(i);
			}
		}
	}

	// Main loop
	while (true) {
		if (me.gameReady && (!Config.PartyAfterScript || scriptList.indexOf(currScript) > scriptList.indexOf(Config.PartyAfterScript))) {
			player = getParty();

			if (player) {
				myPartyId = player.partyid;

				while (player.getNext()) {
					switch (Config.PublicMode) {
					case 1: // Invite others
					case 3: // Invite others but never accept
						if (getPlayerFlag(me.gid, player.gid, 8)) {
							if (Config.ShitList && shitList.indexOf(player.name) === -1) {
								say(player.name + " has been shitlisted.");
								shitList.push(player.name);
								ShitList.add(player.name);
							}

							if (player.partyflag === 4) {
								clickParty(player, 2); // cancel invitation
								delay(100);
							}

							break;
						}

						if (Config.ShitList && shitList.indexOf(player.name) > -1) {
							break;
						}

						if (player.partyflag !== 4 && player.partyflag !== 2 && player.partyid === sdk.party.NoParty) {
							clickParty(player, 2);
							delay(100);
						}

						if (Config.PublicMode === 3) {
							break;
						}
					// eslint-disable-next-line no-fallthrough
					case 2: // Accept invites
						if (myPartyId === sdk.party.NoParty) {
							if (Config.Leader && player.name !== Config.Leader) {
								break;
							}

							if (player.partyflag === 2 && (getTickCount() - partyTick >= 2000 || Config.FastParty)) {
								clickParty(player, 2);
								delay(100);
							}
						}

						break;
					}

					if (Config.UnpartyShitlisted) {
						// Add new hostile players to temp shitlist, leader should have Config.ShitList set to true to update the permanent list.
						if (getPlayerFlag(me.gid, player.gid, 8) && shitList.indexOf(player.name) === -1) {
							shitList.push(player.name);
						}

						if (shitList.indexOf(player.name) > -1 && myPartyId !== sdk.party.NoParty && player.partyid === myPartyId) {
							// Only the one sending invites should say this.
							if ([1, 3].indexOf(Config.PublicMode) > -1) {
								say(player.name + " is shitlisted. Do not invite them.");
							}

							clickParty(player, 3);
							delay(100);
						}
					}
				}
			}

			if (Config.Congratulations.length > 0) {
				player = getParty();

				if (player) {
					do {
						if (player.name !== me.name) {
							if (!playerLevels[player.name]) {
								playerLevels[player.name] = player.level;
							}

							if (player.level > playerLevels[player.name]) {
								let msg = eventMsg(Config.Congratulations, player);
								msg && say(msg);
								
								playerLevels[player.name] = player.level;
							}
						}
					} while (player.getNext());
				}
			}
		}

		delay(500);
	}
}
