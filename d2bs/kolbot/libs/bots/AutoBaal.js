/**
*	@filename	AutoBaal.js
*	@author		kolton
*	@desc		Universal Baal leecher by Kolton with Autoleader by Ethic
*				Pure leech script for throne and Baal
*				Reenters throne/chamber upon death and picks the corpse back up
*				Make sure you setup safeMsg and baalMsg accordingly
*/

function AutoBaal() {
	// editable variables
	let i, baalCheck, throneCheck, hotCheck, leader, // internal variables
		safeMsg = ["safe", "throne clear", "leechers can come", "tp is up", "1 clear"], // safe message - casing doesn't matter
		baalMsg = ["baal"], // baal message - casing doesn't matter
		hotMsg = ["hot", "warm", "dangerous", "lethal"]; // used for shrine hunt

	// chat event, listen to what leader says
	// handler function
	addEventListener('chatmsg', function (nick, msg) {
		// filter leader messages
		if (nick === leader) {
			// loop through all predefined messages to find a match
			for (let i = 0; i < hotMsg.length; i += 1) {
				// leader says a hot tp message
				if (msg.toLowerCase().indexOf(hotMsg[i].toLowerCase()) > -1 && Config.AutoBaal.FindShrine === 1) {
					hotCheck = true; // safe to enter baal chamber

					break;
				}
			}

			// loop through all predefined messages to find a match
			for (let i = 0; i < safeMsg.length; i += 1) {
				// leader says a safe tp message
				if (msg.toLowerCase().indexOf(safeMsg[i].toLowerCase()) > -1) {
					throneCheck = true; // safe to enter throne

					break;
				}
			}

			// loop through all predefined messages to find a match
			for (let i = 0; i < baalMsg.length; i += 1) {
				// leader says a baal message
				if (msg.toLowerCase().indexOf(baalMsg[i].toLowerCase()) > -1) {
					baalCheck = true; // safe to enter baal chamber

					break;
				}
			}
		}
	});

	// test
	this.longRangeSupport = function () {
		switch (me.classid) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			ClassAttack.raiseArmy(50);

			if (Config.Curse[1] > 0) {
				let monster = getUnit(1);

				if (monster) {
					do {
						if (monster.attackable && getDistance(me, monster) < 50 && !checkCollision(me, monster, 0x4) &&
								ClassAttack.isCursable(monster) && !(monster.spectype & 0x7) && !monster.getState(ClassAttack.curseState[1])) {
							Skill.cast(Config.Curse[1], 0, monster);
						}
					} while (monster.getNext());
				}
			}

			break;
		case 3:
			break;
		case 4:
			break;
		case 5:
			break;
		case 6: // assasin
			if (Config.UseTraps && ClassAttack.checkTraps({x: 15095, y: 5037})) {
				ClassAttack.placeTraps({x: 15095, y: 5037}, 5);
			}
			break;
		}

		if ([24, 49, 51, 56, 59, 84, 93, 140, 244].indexOf(Config.AttackSkill[1]) === -1 &&
				[24, 49, 51, 56, 59, 84, 93, 140, 244].indexOf(Config.AttackSkill[3]) === -1) {
			return false;
		}

		let monster = getUnit(1);
		let monList = [];

		if (monster) {
			do {
				if (monster.attackable && getDistance(me, monster) < 50 && !checkCollision(me, monster, 0x4)) {
					monList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		while (monList.length) {
			monList.sort(Sort.units);
			monster = copyUnit(monList[0]);

			if (monster && monster.attackable) {
				let index = monster.spectype & 0x7 ? 1 : 3;

				if (Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[index]))) {
					if (Config.AttackSkill[index] > -1) {
						ClassAttack.doCast(monster, Config.AttackSkill[index], Config.AttackSkill[index + 1]);
					}
				} else {
					monList.shift();
				}
			} else {
				monList.shift();
			}

			delay(5);
		}

		return true;
	};

	// critical error - can't reach harrogath
	if (!Town.goToTown(5)) throw new Error("Town.goToTown failed.");

	if (Config.Leader) {
		leader = Config.Leader;
		if (!Misc.poll(() => Misc.inMyParty(leader), 30e3, 1000)) throw new Error("AutoBaal: Leader not partied");
	}

	Config.AutoBaal.FindShrine === 2 && (hotCheck = true);

	Town.doChores();
	Town.move("portalspot");

	// find the first player in area 131 - throne of destruction
	if (leader || (leader = Misc.autoLeaderDetect({destination: 131}))) {
		// do our stuff while partied
		while (Misc.inMyParty(leader)) {
			if (hotCheck) {
				Pather.useWaypoint(4);
				Precast.doPrecast(true);

				for (i = 4; i > 1; i -= 1) {
					if (Misc.getShrinesInArea(i, 15, true)) {
						break;
					}
				}

				if (i === 1) {
					Town.goToTown();
					Pather.useWaypoint(5);

					for (i = 5; i < 8; i += 1) {
						if (Misc.getShrinesInArea(i, 15, true)) {
							break;
						}
					}
				}

				Town.goToTown(5);
				Town.move("portalspot");

				hotCheck = false;
			}

			// wait for throne signal - leader's safe message
			if (throneCheck && me.area === 109) {
				print("ÿc4AutoBaal: ÿc0Trying to take TP to throne.");
				Pather.usePortal(131, null); // take TP to throne
				Pather.moveTo(Config.AutoBaal.LeechSpot[0], Config.AutoBaal.LeechSpot[1]); // move to a safe spot
				Precast.doPrecast(true);
				Town.getCorpse(); // check for corpse - happens if you die and reenter
			}

			!baalCheck && me.area === 131 && Config.AutoBaal.LongRangeSupport && this.longRangeSupport();

			// wait for baal signal - leader's baal message
			if (baalCheck && me.area === 131) {
				Pather.moveTo(15092, 5010); // move closer to chamber portal
				Precast.doPrecast(false);

				// wait for baal to go through the portal
				while (getUnit(1, 543)) {
					delay(500);
				}

				let portal = getUnit(2, 563);

				delay(2000); // wait for others to enter first - helps with curses and tentacles from spawning around you
				print("ÿc4AutoBaal: ÿc0Entering chamber.");

				if (Pather.usePortal(null, null, portal)) { // enter chamber
					Pather.moveTo(15166, 5903); // go to a safe position
				}

				Town.getCorpse(); // check for corpse - happens if you die and reenter
			}

			let baal = getUnit(1, 544);

			if (baal) {
				if (baal.mode === 0 || baal.mode === 12) {
					break;
				}

				this.longRangeSupport();
			}

			me.mode === 17 && me.revive(); // revive if dead

			delay(500);
		}
	} else {
		throw new Error("Empty game.");
	}

	return true;
}
