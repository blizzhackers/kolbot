/*
*	@filename	AttackOverrides.js
*	@author		isid0re
*	@desc		Attack.js fixes to improve functionality
*/

if (!isIncluded("common/Attack.js")) {
	include("common/Attack.js");
}

Attack.killTarget = function (name) {
	var target,	attackCount = 0;

	for (let i = 0; !target && i < 5; i += 1) {
		target = getUnit(1, name);

		if (target) {
			break;
		}

		delay(200);
	}

	if (!target) {
		print("ÿc9SoloLevelingÿc0: Target not found. Performing Attack.Clear(25)");
		Attack.clear(25);
		Pickit.pickItems();

		return true;
	}

	if (target && !Attack.canAttack(target)) { // exit if target is immune
		print("ÿc9SoloLevelingÿc0: Attack failed. " + target.name + " is immune.");

		return true;
	}

	while (attackCount < Config.MaxAttackCount) {
		if (Misc.townCheck()) {
			for (let i = 0; !target && i < 5; i += 1) {
				target = getUnit(1, name);

				if (target) {
					break;
				}

				delay(200);
			}
		}

		if (!target || !copyUnit(target).x) { // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
			target = getUnit(1, name);

			if (!target) {
				break;
			}
		}

		if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
			this.deploy(target, Config.DodgeRange, 5, 9);
		}

		if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
			Packet.flash(me.gid);
		}

		if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
			Packet.flash(me.gid);
		}

		attackCount += 1;
		ClassAttack.afterAttack();

		if (!target || !copyUnit(target).x || target.dead || target.spectype === 0) {
			break;
		}
	}

	if (!target || !copyUnit(target).x || target.dead || target.spectype === 0) {
		Pickit.pickItems();
	}

	return true;
};

Attack.clearLocations = function (list) {
	for (let x = 0; x < list.length; x++) {
		Attack.clear(20);
		Pather.moveTo(list[x][0], list[x][1]);
		Attack.clear(20);
		Pickit.pickItems();
	}

	return true;
};

Attack.getSkillElement = function (skillId) {
	this.elements = ["physical", "fire", "lightning", "magic", "cold", "poison", "none"];

	switch (skillId) {
	case 74: // Corpse Explosion
	case 139: // Stun
	case 144: // Concentrate
	case 147: // Frenzy
	case 273: // Minge Blast
	case 500: // Summoner
		return "physical";
	case 101: // Holy Bolt
		return "holybolt"; // no need to use this.elements array because it returns before going over the array
	}

	var eType = getBaseStat("skills", skillId, "etype");

	if (typeof (eType) === "number") {
		return this.elements[eType];
	}

	return false;
};

Attack.clearList = function (mainArg, sortFunc, refresh) {
	var i, target, result, monsterList, coord,
		retry = 0,
		gidAttack = [],
		attackCount = 0;

	switch (typeof mainArg) {
	case "function":
		monsterList = mainArg.call();

		break;
	case "object":
		monsterList = mainArg.slice(0);

		break;
	case "boolean": // false from Attack.getMob()
		return false;
	default:
		throw new Error("clearList: Invalid argument");
	}

	if (!sortFunc) {
		sortFunc = this.sortMonsters;
	}

	while (monsterList.length > 0 && attackCount < 300) {
		if (refresh && attackCount > 0 && attackCount % refresh === 0) {
			monsterList = mainArg.call();
		}

		if (me.dead) {
			return false;
		}

		monsterList.sort(sortFunc);

		target = copyUnit(monsterList[0]);

		if (target.x !== undefined && this.checkMonster(target)) {
			if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
				Pather.moveToUnit(target);
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			Misc.townCheck(true);
			//me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

			result = ClassAttack.doAttack(target, attackCount % 15 === 0);

			if (result) {
				retry = 0;

				if (result === 2) {
					monsterList.shift();

					continue;
				}

				for (i = 0; i < gidAttack.length; i += 1) {
					if (gidAttack[i].gid === target.gid) {
						break;
					}
				}

				if (i === gidAttack.length) {
					gidAttack.push({gid: target.gid, attacks: 0});
				}

				gidAttack[i].attacks += 1;

				// Desync/bad position handler
				switch (Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) {
				case 112:
					// Tele in random direction with Blessed Hammer
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 5 : 15) === 0) {
						coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
						Pather.moveTo(coord.x, coord.y);
					}

					break;
				default:
					// Flash with melee skills
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 5 : 15) === 0 && Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) < 4) {
						Packet.flash(me.gid);
					}

					break;
				}

				// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
				if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
					print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
					monsterList.shift();
				}

				attackCount += 1;

				if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
					Pickit.fastPick();
				}
			} else {
				if (retry++ > 3) {
					monsterList.shift();
					retry = 0;
				}

				Packet.flash(me.gid);
			}
		} else {
			monsterList.shift();
		}
	}

	ClassAttack.afterAttack(true);
	this.openChests(30);

	if (attackCount > 0) {
		Pickit.pickItems();
	}

	return true;
};

Attack.clear = function (range, spectype, bossId, sortfunc, pickit) { // probably going to change to passing an object
	while (!me.gameReady) {
		delay(40);
	}

	if (Config.MFLeader && !!bossId) {
		Pather.makePortal();
		say("clear " + bossId);
	}

	if (range === undefined) {
		range = 25;
	}

	if (spectype === undefined) {
		spectype = 0;
	}

	if (bossId === undefined) {
		bossId = false;
	}

	if (sortfunc === undefined) {
		sortfunc = false;
	}

	if (pickit === undefined) {
		pickit = true;
	}

	if (typeof (range) !== "number") {
		throw new Error("Attack.clear: range must be a number.");
	}

	var i, boss, orgx, orgy, target, result, monsterList, start, coord, skillCheck, secAttack,
		retry = 0,
		gidAttack = [],
		attackCount = 0;

	if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
		return false;
	}

	if (!sortfunc) {
		sortfunc = this.sortMonsters;
	}

	if (bossId) {
		for (i = 0; !boss && i < 5; i += 1) {
			boss = bossId > 999 ? getUnit(1, -1, -1, bossId) : getUnit(1, bossId);

			delay(200);
		}

		if (!boss) {
			throw new Error("Attack.clear: " + bossId + " not found");
		}

		orgx = boss.x;
		orgy = boss.y;
	} else {
		orgx = me.x;
		orgy = me.y;
	}

	monsterList = [];
	target = getUnit(1);

	if (target) {
		do {
			if ((!spectype || (target.spectype & spectype)) && this.checkMonster(target) && this.skipCheck(target)) {
				// Speed optimization - don't go through monster list until there's at least one within clear range
				if (!start && getDistance(target, orgx, orgy) <= range &&
						(me.getSkill(54, 1) || !Scripts.Follower || !checkCollision(me, target, 0x1))) {
					start = true;
				}

				monsterList.push(copyUnit(target));
			}
		} while (target.getNext());
	}

	while (start && monsterList.length > 0 && attackCount < 300) {
		if (boss) {
			orgx = boss.x;
			orgy = boss.y;
		}

		if (me.dead) {
			return false;
		}

		//monsterList.sort(Sort.units);
		monsterList.sort(sortfunc);

		target = copyUnit(monsterList[0]);

		if (target.x !== undefined && (getDistance(target, orgx, orgy) <= range || (this.getScarinessLevel(target) > 7 && getDistance(me, target) <= range)) && this.checkMonster(target)) {
			if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
				Pather.moveToUnit(target);
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			Misc.townCheck(true);
			//me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

			result = ClassAttack.doAttack(target, attackCount % 15 === 0);

			if (result) {
				retry = 0;

				if (result === 2) {
					monsterList.shift();

					continue;
				}

				for (i = 0; i < gidAttack.length; i += 1) {
					if (gidAttack[i].gid === target.gid) {
						break;
					}
				}

				if (i === gidAttack.length) {
					gidAttack.push({gid: target.gid, attacks: 0, name: target.name});
				}

				gidAttack[i].attacks += 1;
				attackCount += 1;

				if (me.classid === 4) {
					secAttack = (target.spectype & 0x7) ? 2 : 4;
				} else {
					secAttack = 5;
				}

				if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) ||
						(me.classid === 3 && Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3] === 112 && !ClassAttack.getHammerPosition(target)))) {
					skillCheck = Config.AttackSkill[secAttack];
				} else {
					skillCheck = Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3];
				}

				// Desync/bad position handler
				switch (skillCheck) {
				case 112:
					//print(gidAttack[i].name + " " + gidAttack[i].attacks);

					// Tele in random direction with Blessed Hammer
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
						//print("random move m8");
						coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
						Pather.moveTo(coord.x, coord.y);
					}

					break;
				default:
					// Flash with melee skills
					if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(skillCheck) < 4) {
						Packet.flash(me.gid);
					}

					break;
				}

				// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
				if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
					print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
					monsterList.shift();
				}

				if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
					Pickit.fastPick();
				}
			} else {
				if (retry++ > 3) {
					monsterList.shift();
					retry = 0;
				}

				Packet.flash(me.gid);
			}
		} else {
			monsterList.shift();
		}
	}

	ClassAttack.afterAttack(pickit);
	this.openChests(range, orgx, orgy);

	if (attackCount > 0 && pickit) {
		Pickit.pickItems();
	}

	return true;
};
