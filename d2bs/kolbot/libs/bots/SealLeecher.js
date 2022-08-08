/**
*  @filename    SealLeecher.js
*  @author      probably kolton, theBGuy
*  @desc        Leecher script. Works in conjuction with SealLeader script.
*
*/

function SealLeecher() {
	let monster;
	let commands = [];

	Town.goToTown(4);
	Town.doChores();
	Town.move("portalspot");

	if (!Config.Leader) {
		D2Bot.printToConsole("You have to set Config.Leader");
		D2Bot.stop();

		return false;
	}

	addEventListener("chatmsg",
		function (nick, msg) {
			if (nick === Config.Leader) {
				commands.push(msg);
			}
		});

	// Wait until leader is partied
	while (!Misc.inMyParty(Config.Leader)) {
		delay(1000);
	}

	while (Misc.inMyParty(Config.Leader)) {
		if (commands.length > 0) {
			switch (commands[0]) {
			case "in":
				if (me.inTown) {
					Pather.usePortal(sdk.areas.ChaosSanctuary, Config.Leader);
					delay(250);
				}

				if (getDistance(me, 7761, 5267) < 10) {
					Pather.walkTo(7761, 5267, 2);
				}

				commands.shift();

				break;
			case "out":
				if (!me.inTown) {
					Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader);
				}

				commands.shift();

				break;
			case "done":
				if (!me.inTown) {
					Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader);
				}

				return true; // End script
			}
		}

		while (me.mode === sdk.player.mode.Death) {
			delay(40);
		}

		if (me.mode === sdk.player.mode.Dead) {
			me.revive();

			while (!me.inTown) {
				delay(40);
			}
		}

		if (!me.inTown) {
			monster = Game.getMonster();

			if (monster) {
				do {
					if (monster.attackable && getDistance(me, monster) < 20) {
						me.overhead("HOT");
						Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader);
					}
				} while (monster.getNext());
			}
		}

		delay(100);
	}

	return true;
}
