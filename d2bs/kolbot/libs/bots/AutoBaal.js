/**
*  @filename    AutoBaal.js
*  @author      kolton
*  @desc        Universal Baal leecher by Kolton with Autoleader by Ethic
*               Pure leech script for throne and Baal
*               Reenters throne/chamber upon death and picks the corpse back up
*               Make sure you setup safeMsg and baalMsg accordingly
*
*/

function AutoBaal() {
	// editable variables
	let i, baalCheck, throneCheck, hotCheck, leader; // internal variables
	let safeMsg = ["safe", "throne clear", "leechers can come", "tp is up", "1 clear"]; // safe message - casing doesn't matter
	let baalMsg = ["baal"]; // baal message - casing doesn't matter
	let hotMsg = ["hot", "warm", "dangerous", "lethal"]; // used for shrine hunt

	// chat event handler function, listen to what leader says
	addEventListener('chatmsg', function (nick, msg) {
		// filter leader messages
		if (nick === leader) {
			// loop through all predefined messages to find a match
			for (let i = 0; i < hotMsg.length; i += 1) {
				// leader says a hot tp message
				if (msg.toLowerCase().includes(hotMsg[i].toLowerCase()) && Config.AutoBaal.FindShrine === 1) {
					hotCheck = true; // safe to enter baal chamber

					break;
				}
			}

			// loop through all predefined messages to find a match
			for (let i = 0; i < safeMsg.length; i += 1) {
				// leader says a safe tp message
				if (msg.toLowerCase().includes(safeMsg[i].toLowerCase())) {
					throneCheck = true; // safe to enter throne

					break;
				}
			}

			// loop through all predefined messages to find a match
			for (let i = 0; i < baalMsg.length; i += 1) {
				// leader says a baal message
				if (msg.toLowerCase().includes(baalMsg[i].toLowerCase())) {
					baalCheck = true; // safe to enter baal chamber

					break;
				}
			}
		}
	});

	// test
	this.longRangeSupport = function () {
		switch (me.classid) {
		case sdk.charclass.Necromancer:
			ClassAttack.raiseArmy(50);

			if (Config.Curse[1] > 0) {
				let monster = getUnit(1);

				if (monster) {
					do {
						if (monster.attackable && monster.distance < 50 && !checkCollision(me, monster, 0x4)
							&& monster.curseable && !monster.isSpecial && !monster.getState(ClassAttack.curseState[1])) {
							Skill.cast(Config.Curse[1], 0, monster);
						}
					} while (monster.getNext());
				}
			}

			break;
		case sdk.charclass.Assassin:
			if (Config.UseTraps && ClassAttack.checkTraps({x: 15095, y: 5037})) {
				ClassAttack.placeTraps({x: 15095, y: 5037}, 5);
			}

			break;
		default:
			break;
		}

		let skills = [
			sdk.skills.ChargedStrike, sdk.skills.Lightning, sdk.skills.FireWall, sdk.skills.Meteor, sdk.skills.Blizzard,
			sdk.skills.BoneSpear, sdk.skills.BoneSpirit, sdk.skills.DoubleThrow, sdk.skills.Volcano
		];

		if (!skills.some(skill => Config.AttackSkill[1] === skill || Config.AttackSkill[3] === skill)) {
			return false;
		}

		let monster = getUnit(1);
		let monList = [];

		if (monster) {
			do {
				if (monster.attackable && monster.distance < 50 && !checkCollision(me, monster, 0x4)) {
					monList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		while (monList.length) {
			monList.sort(Sort.units);
			monster = copyUnit(monList[0]);

			if (monster && monster.attackable) {
				let index = monster.isSpecial ? 1 : 3;

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
				Pather.useWaypoint(sdk.areas.StonyField);
				Precast.doPrecast(true);

				for (i = sdk.areas.StonyField; i > 1; i--) {
					if (Misc.getShrinesInArea(i, sdk.shrines.Experience, true)) {
						break;
					}
				}

				if (i === 1) {
					Town.goToTown();
					Pather.useWaypoint(sdk.areas.DarkWood);

					for (i = sdk.areas.DarkWood; i < sdk.areas.DenofEvil; i++) {
						if (Misc.getShrinesInArea(i, sdk.shrines.Experience, true)) {
							break;
						}
					}
				}

				Town.goToTown(5);
				Town.move("portalspot");

				hotCheck = false;
			}

			// wait for throne signal - leader's safe message
			if (throneCheck && me.area === sdk.areas.Harrogath) {
				print("ÿc4AutoBaal: ÿc0Trying to take TP to throne.");
				Pather.usePortal(sdk.areas.ThroneofDestruction, null);
				// move to a safe spot
				Pather.moveTo(Config.AutoBaal.LeechSpot[0], Config.AutoBaal.LeechSpot[1]);
				Precast.doPrecast(true);
				Town.getCorpse();
			}

			!baalCheck && me.area === sdk.areas.ThroneofDestruction && Config.AutoBaal.LongRangeSupport && this.longRangeSupport();

			// wait for baal signal - leader's baal message
			if (baalCheck && me.area === sdk.areas.ThroneofDestruction) {
				// move closer to chamber portal
				Pather.moveTo(15092, 5010);
				Precast.doPrecast(false);

				// wait for baal to go through the portal
				while (monster(sdk.monsters.ThroneBaal)) {
					delay(500);
				}

				let portal = object(sdk.units.WorldstonePortal);

				delay(2000); // wait for others to enter first - helps with curses and tentacles from spawning around you
				print("ÿc4AutoBaal: ÿc0Entering chamber.");
				Pather.usePortal(null, null, portal) && Pather.moveTo(15166, 5903); // go to a safe position
				Town.getCorpse();
			}

			let baal = monster(sdk.monsters.Baal);

			if (baal) {
				if (baal.mode === 0 || baal.mode === 12) {
					break;
				}

				this.longRangeSupport();
			}

			me.mode === 17 && me.revive();

			delay(500);
		}
	} else {
		throw new Error("Empty game.");
	}

	return true;
}
