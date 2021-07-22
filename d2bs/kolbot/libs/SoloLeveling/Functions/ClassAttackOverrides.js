/*
*	@filename	ClassAttackOverides.js
*	@author		isid0re
*	@desc		fixes to improve class attack functionality per class
*/

// Class Specific Attacks
switch (me.classid) {
case 0: // Amazon

	break;
case 1: // Sorceress
	if (!isIncluded("common/Attacks/Sorceress.js")) {
		include("common/Attacks/Sorceress.js");
	}

	ClassAttack.doAttack = function (unit, preattack) {
		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");
			Town.visitTown();
		}

		if (!me.getState(30) && me.getSkill(58, 1)) {
			Skill.cast(58, 0);
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return false;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			if (me.getSkill(42, 1)) {
				for (let castStatic = 0; castStatic < 2; castStatic++) {
					if ((Skill.getManaCost(42) * 3) < me.mp) {
						Skill.cast(42, 0);
					}
				}
			}

			return true;
		}

		var index, staticRange, checkSkill, mark,
			merc = Merc.getMercFix(),
			timedSkill = -1,
			untimedSkill = -1;

		// Static
		if (Config.CastStatic < 100 && me.getSkill(42, 1) && Attack.checkResist(unit, "lightning") && Config.StaticList.some(
			function (id) {
				if (unit) {
					switch (typeof id) {
					case "number":
						if (unit.classid && unit.classid === id) {
							return 1;
						}

						break;
					case "string":
						if (unit.name && unit.name.toLowerCase() === id.toLowerCase()) {
							return 1;
						}

						break;
					default:
						throw new Error("Bad Config.StaticList settings.");
					}
				}

				return 0;
			}
		) && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic) {
			staticRange = Math.floor((me.getSkill(42, 1) + 3) * 2 / 3); // adjusted static range (CuteBeast)

			while (!me.dead && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic && Attack.checkMonster(unit)) {
				Misc.townCheck();
				ClassAttack.doCast(unit, Config.AttackSkill[1], -1);

				if (getDistance(me, unit) > staticRange || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, staticRange, 0x4)) {
						return false;

					}
				}

				if (!Skill.cast(42, 0)) {
					break;
				}
			}
		}

		index = (unit.spectype !== 0 || unit.type === 0) ? 1 : 3;

		// Get timed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.checkResist(unit, checkSkill) && ([56, 59].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = Config.AttackSkill[5];
		}

		// Get untimed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[1];
		} else {
			checkSkill = Config.AttackSkill[index + 1];
		}

		if (Attack.checkResist(unit, checkSkill) && ([56, 59].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			untimedSkill = checkSkill;
		} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && ([56, 59].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			untimedSkill = Config.AttackSkill[6];
		}

		// Low mana timed skill
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(timedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			timedSkill = Config.LowManaSkill[0];
		}

		// Low mana untimed skill
		if (Config.LowManaSkill[1] > -1 && Skill.getManaCost(untimedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[1])) {
			untimedSkill = Config.LowManaSkill[1];
		}

		switch (ClassAttack.doCast(unit, timedSkill, untimedSkill)) {
		case 0: // Fail
			break;
		case 1: // Success
			return true;
		case 2: // Try to telestomp
			if (Config.TeleStomp && Attack.checkResist(unit, "physical") && Config.UseMerc) {
				while (Attack.checkMonster(unit)) {
					Misc.townCheck();

					if (!merc) {
						Town.visitTown();
					}

					if (getDistance(me, unit) > 3) {
						Pather.moveToUnit(unit);
					}

					if (Attack.checkResist(unit, "lightning") && me.getSkill(42, 1) && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic) {
						Skill.cast(42, 0);
					}

					mark = Attack.getNearestMonster();

					if (mark) {
						ClassAttack.doCast(mark, Config.AttackSkill[1], Config.AttackSkill[2]);
					} else if (me.getSkill(43, 0)) {
						Skill.cast(43, 0, unit.x, unit.y);
					}
				}

				return true;
			}

			break;
		}

		return false;
	};

	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		var i, walk, tick;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
			if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(timedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (Skill.getManaCost(timedSkill) > me.mp) {
				tick = getTickCount();

				while (getTickCount() - tick < 1500) {
					if (Skill.getManaCost(timedSkill) < me.mp) {
						break;
					}

					delay(25);
				}
			}

			if (!unit.dead && !checkCollision(me, unit, 0x4)) {
				Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
			}

			return 1;
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (Skill.getManaCost(untimedSkill) > me.mp) {
				tick = getTickCount();

				while (getTickCount() - tick < 1500) {
					if (Skill.getManaCost(untimedSkill) < me.mp) {
						break;
					}

					delay(25);
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(121)) {
				break;
			}

			delay(40);
		}

		return 1;
	};

	break;
case 2: // Necromancer
	if (!isIncluded("common/Attacks/Necromancer.js")) {
		include("common/Attacks/Necromancer.js");
	}

	ClassAttack.isCursable = function (unit) {
		if (copyUnit(unit).name === undefined || unit.name.indexOf(getLocaleString(11086)) > -1) { // "Possessed"
			return false;
		}

		if (unit.getState(57)) { // attract can't be overridden
			return false;
		}

		switch (unit.classid) {
		case 190: // maggotegg1
		case 191: // maggotegg1
		case 192: // maggotegg1
		case 193: // maggotegg1
		case 194: // maggotegg1
		case 206: // Foul Crow Nest
		case 207: // BloodHawkNest
		case 208: // BlackVultureNest
		case 228: // sarcophagus
		case 258: // Water Watcher
		case 261: // Water Watcher
		case 266: // Flavie
		case 273: // gargoyle trap
		case 348: // Turret
		case 349: // Turret
		case 350: // Turret
		case 371: // lightning spire
		case 372: // firetower
		case 432: // Barricade Door
		case 433: // Barricade Door
		case 434: // Prison Door
		case 435: // Barricade Tower
		case 524: // Barricade Wall Right
		case 525: // Barricade Wall Left
		case 528: // Evil Demon Hut
		case 681: // maggotegg1 (WSK)
			return false;
		}

		return true;
	};

	ClassAttack.checkCorpse = function (unit, revive) {
		if (unit.mode !== 12) {
			return false;
		}

		if (revive === undefined) {
			revive = false;
		}

		var baseId = getBaseStat("monstats", unit.classid, "baseid"),
			badList = [312, 571];

		if (revive && ((unit.spectype & 0x7) || badList.indexOf(baseId) > -1 || (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3))) {
			return false;
		}

		if (!getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")) {
			return false;
		}

		if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
                    !unit.getState(1) && // freeze
                    !unit.getState(96) && // revive
                    !unit.getState(99) && // redeemed
                    !unit.getState(104) && // nodraw
                    !unit.getState(107) && // shatter
                    !unit.getState(172) && // rest in peace
                    !unit.getState(118) // noselect
		) {
			return true;
		}

		return false;
	};

	ClassAttack.doAttack = function (unit, preattack) {
		Misc.townCheck();

		if (!this.cursesSet) {
			this.initCurses();
		}

		if (Config.MercWatch && Town.needMerc()) {
			Town.visitTown();
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		var index, checkSkill, result,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1;

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (Config.Curse[0] > 0 && this.isCursable(unit) && (unit.spectype & 0x7) && !unit.getState(this.curseState[0])) {
			if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, 25, 0x4)) {
					return 0;
				}
			}

			if (me.normal && me.area === 73 && me.getSkill(76, 0)) { // iron maiden curse on normal duriel only
				Skill.cast(76, 0, unit);
			} else {
				Skill.cast(Config.Curse[0], 0, unit);
			}

			return 1;
		}

		if (Config.Curse[1] > 0 && this.isCursable(unit) && !(unit.spectype & 0x7) && !unit.getState(this.curseState[1])) {
			if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, 25, 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.Curse[1], 0, unit);

			return 1;
		}

		// Get timed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.checkResist(unit, checkSkill)) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = Config.AttackSkill[5];
		}

		// Get untimed skill
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[1];
		} else {
			checkSkill = Config.AttackSkill[index + 1];
		}

		if (Attack.checkResist(unit, checkSkill)) {
			untimedSkill = checkSkill;
		} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && ([56, 59].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			untimedSkill = Config.AttackSkill[6];
		}

		// Low mana timed skill
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(timedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			timedSkill = Config.LowManaSkill[0];
		}

		// Low mana untimed skill
		if (Config.LowManaSkill[1] > -1 && Skill.getManaCost(untimedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[1])) {
			untimedSkill = Config.LowManaSkill[1];
		}

		Precast.doPrecast(false);
		result = this.doCast(unit, timedSkill, untimedSkill);

		if (result === 1) {
			if (Config.ActiveSummon) {
				this.raiseArmy();
			}

			this.explodeCorpses(unit);
		} else if (result === 2 && Config.TeleStomp && Attack.checkResist(unit, "physical") && !!me.getMerc()) {
			while (Attack.checkMonster(unit)) {
				if (Town.needMerc()) {
					if (Config.MercWatch && mercRevive++ < 1) {
						Town.visitTown();
					} else {
						return 2;
					}
				}

				if (getDistance(me, unit) > 3) {
					Pather.moveToUnit(unit);
				}

				this.doCast(unit, Config.AttackSkill[1], Config.AttackSkill[2]);

				if (Config.ActiveSummon) {
					this.raiseArmy();
				}

				this.explodeCorpses(unit);
			}

			return 1;
		}

		return result;
	};

	break;
case 3: // Paladin
	break;
case 4: // Barbarian
	if (!isIncluded("common/Attacks/Barbarian.js")) {
		include("common/Attacks/Barbarian.js");
	}

	ClassAttack.doAttack = function (unit, preattack) {
		var needRepair = Town.needRepair();

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			Town.visitTown(!!needRepair.length);
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			if (Config.AttackSkill[0] !== 146 && me.getSkill(146, 1)) {
				for (let castBC = 0; castBC < 1; castBC++) {
					if ((Skill.getManaCost(146) * 3) < me.mp) {
						Skill.cast(146, Skill.getHand(146, unit));
					}
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		var index,
			attackSkill = -1;

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (Attack.getCustomAttack(unit)) {
			attackSkill = Attack.getCustomAttack(unit)[0];
		} else {
			attackSkill = Config.AttackSkill[index];
		}

		if (!Attack.checkResist(unit, attackSkill)) {
			attackSkill = -1;

			if (Config.AttackSkill[index + 1] > -1 && Attack.checkResist(unit, Config.AttackSkill[index + 1])) {
				attackSkill = Config.AttackSkill[index + 1];
			}
		}

		// Low mana skill
		if (Skill.getManaCost(attackSkill) > me.mp && Config.LowManaSkill[0] > -1 && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			attackSkill = Config.LowManaSkill[0];
		}

		// Telestomp with barb is pointless
		return this.doCast(unit, attackSkill);
	};

	break;
case 5: // Druid
	if (!isIncluded("common/Attacks/Druid.js")) {
		include("common/Attacks/Druid.js");
	}

	ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
		var i, walk;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case 245: // Tornado
				if (Math.ceil(getDistance(me, unit)) > (Skill.getRange(timedSkill)) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, (Skill.getRange(timedSkill)), 0x4)) {
						return 0;
					}
				}

				// Randomized x coord changes tornado path and prevents constant missing
				if (!unit.dead) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit.x + rand(-1, 1), unit.y);
				}

				return 1;
			default:
				if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				if (Math.ceil(getDistance(me, unit)) > (Skill.getRange(timedSkill)) || checkCollision(me, unit, 0x4)) {
					// Allow short-distance walking for melee skills
					walk = Skill.getRange(timedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

					if (!Attack.getIntoPosition(unit, (Skill.getRange(timedSkill)), 0x4, walk)) {
						return 0;
					}
				}

				if (!unit.dead) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
				}

				return 1;
			}
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.ceil(getDistance(me, unit)) > (Skill.getRange(untimedSkill)) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, (Skill.getRange(untimedSkill)), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(121)) {
				break;
			}

			delay(40);
		}

		return 1;
	};

	if (["Plaguewolf", "Wolf"].indexOf(SetUp.finalBuild) > -1 && me.charlvl >= SetUp.respecTwo()) {	//Make sure to only load this after finalBuild respec
		if (!isIncluded("common/Attacks/Wereform.js")) {
			include("common/Attacks/Wereform.js");
		}

		ClassAttack.doCast = function (unit, timedSkill, untimedSkill) {
			var i;

			// No valid skills can be found
			if (timedSkill < 0 && untimedSkill < 0) {
				return 2;
			}

			if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
				if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				// Teleport closer
				if (Math.ceil(getDistance(me, unit)) > 10) {
					if (Pather.useTeleport()) {
						Misc.unShift();
					}

					if (!Attack.getIntoPosition(unit, 10, 0x4)) {
						return 0;
					}
				}

				Misc.shapeShift(Config.Wereform);

				if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, true)) {
						return 0;
					}
				}

				if (!unit.dead) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
				}

				if (untimedSkill > -1 && (untimedSkill === 232 || untimedSkill === 238)) {		//Feral rage or Rabies
					if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, true)) {
							return 0;
						}
					}

					if (!unit.dead) {
						Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
					}

					return 1;
				}

				return 1;
			}

			if (untimedSkill > -1) {
				if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				// Teleport closer
				if (Math.ceil(getDistance(me, unit)) > 10) {
					if (Pather.useTeleport()) {
						Misc.unShift();
					}

					if (!Attack.getIntoPosition(unit, 10, 0x4)) {
						return 0;
					}
				}

				Misc.shapeShift(Config.Wereform);

				if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, true)) {
						return 0;
					}
				}

				if (!unit.dead) {
					Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
				}

				return 1;
			}

			for (i = 0; i < 25; i += 1) {
				if (!me.getState(121)) {
					break;
				}

				delay(40);
			}

			return 1;
		};
	}

	break;
case 6: // Assassin
	break;
}
