/**
*  @filename    MFHelper.js
*  @author      kolton
*  @desc        help another player kill bosses or clear areas
*
*/

function MFHelper() {
	let player, playerAct, split;
	let oldCommand = "";
	let command = "";

	function chatEvent (name, msg) {
		if (!player) {
			let match = [
				"kill", "clearlevel", "clear", "quit", "cows", "council", "goto", "nextup"
			];

			if (msg) {
				for (let i = 0; i < match.length; i += 1) {
					if (msg.match(match[i])) {
						player = Misc.findPlayer(name);

						break;
					}
				}
			}
		}

		player && name === player.name && (command = msg);
	}

	addEventListener("chatmsg", chatEvent);
	Town.doChores();
	Town.move("portalspot");

	if (Config.Leader) {
		if (!Misc.poll(() => Misc.inMyParty(Config.Leader), 30e4, 1000)) {
			throw new Error("MFHelper: Leader not partied");
		}

		player = Misc.findPlayer(Config.Leader);
	}

	if (player) {
		if (!Misc.poll(() => player.area, 120 * 60, 100 + me.ping)) {
			throw new Error("Failed to wait for player area");
		}

		playerAct = Misc.getPlayerAct(Config.Leader);

		if (playerAct && playerAct !== me.act) {
			Town.goToTown(playerAct);
			Town.move("portalspot");
		}
	}

	// START
	while (true) {
		if (me.softcore && me.mode === sdk.player.mode.Dead) {
			while (!me.inTown) {
				me.revive();
				delay(1000);
			}

			Town.move("portalspot");
			console.log("revived!");
		}

		if (player) {
			if (Config.LifeChicken > 0 && me.hpPercent <= Config.LifeChicken) {
				Town.heal();
				Town.move("portalspot");
			}

			// Finish MFHelper script if leader is running Diablo or Baal
			if ([sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(player.area)) {
				break;
			}

			if (command !== oldCommand) {
				oldCommand = command;
				
				if (command.includes("quit")) {
					break;
				} else if (command.includes("goto")) {
					console.log("ÿc4MFHelperÿc0: Goto");
					split = command.substr(6);

					try {
						if (!!parseInt(split, 10)) {
							split = parseInt(split, 10);
						}

						Town.goToTown(split, true);
						Town.move("portalspot");
					} catch (townerror) {
						console.log(townerror);
					}

					delay(500 + me.ping);
				} else if (command.includes("nextup")) {
					split = command.split("nextup ")[1];

					if (split && ["Diablo", "Baal"].includes(split)) {
						break;
					}

					delay(500 + me.ping);
				} else if (command.includes("cows")) {
					console.log("ÿc4MFHelperÿc0: Clear Cows");

					if (Misc.poll(() => {
						Town.goToTown(1) && Pather.usePortal(sdk.areas.MooMooFarm);
						return me.inArea(sdk.areas.MooMooFarm);
					}, Time.minutes(1), 500 + me.ping)) {
						Precast.doPrecast(false);
						Common.Cows.clearCowLevel();
						delay(1000);

						if (!Pather.getPortal(null, player.name) || !Pather.usePortal(null, player.name)) {
							Town.goToTown();
						}
					} else {
						console.warn("Failed to use portal. Currently in area: " + me.area);
					}
				} else {
					// check that we are in the town of the players act so we can take their portal
					!me.inArea(sdk.areas.townOf(player.area)) && Town.goToTown(sdk.areas.actOf(player.area));
					Misc.poll(() => Pather.usePortal(player.area, player.name), Time.seconds(15), 500 + me.ping);

					delay(1000); // delay to make sure leader's area is accurate

					if (!me.inTown && me.area === player.area) {
						Precast.doPrecast(true);

						if (command.includes("kill")) {
							console.log("ÿc4MFHelperÿc0: Kill");
							split = command.split("kill ")[1];

							try {
								if (!!parseInt(split, 10)) {
									split = parseInt(split, 10);
								}

								Attack.kill(split);
								Pickit.pickItems();
							} catch (killerror) {
								console.error(killerror);
							}
						} else if (command.includes("clearlevel")) {
							console.log("ÿc4MFHelperÿc0: Clear Level " + getArea().name);
							Precast.doPrecast(true);
							Attack.clearLevel(Config.ClearType);
						} else if (command.indexOf("clear") > -1) {
							console.log("ÿc4MFHelperÿc0: Clear");
							split = command.split("clear ")[1];

							try {
								if (!!parseInt(split, 10)) {
									split = parseInt(split, 10);
								}

								Attack.clear(15, 0, split);
							} catch (killerror2) {
								console.error(killerror2);
							}
						} else if (command.includes("council")) {
							console.log("ÿc4MFHelperÿc0: Kill Council");
							Attack.clearList(Attack.getMob([sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3], 0, 40));
						}

						delay(100);

						if (!Pather.getPortal(null, player.name) || !Pather.usePortal(null, player.name)) {
							Town.goToTown();
						}
					} else if (!me.inTown && !me.inArea(player.area)) {
						Town.goToTown(sdk.areas.actOf(player.area));
					}
				}
			}
		}

		delay(100);
	}

	return true;
}
