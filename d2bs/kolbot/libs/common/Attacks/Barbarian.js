/**
*  @filename    Barbarian.js
*  @author      kolton, theBGuy
*  @desc        Barbarian attack sequence
*
*/

// todo - add howl

const ClassAttack = {
	doAttack: function (unit, preattack = false) {
		if (!unit) return Attack.Result.SUCCESS;
		let gid = unit.gid;
		let needRepair = Town.needRepair();

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			print("towncheck");

			if (Town.visitTown(!!needRepair.length)) {
				if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
					return Attack.Result.SUCCESS; // lost reference to the mob we were attacking
				}
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, sdk.collision.Ranged)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.Ranged)) {
					return Attack.Result.FAILED;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return Attack.Result.SUCCESS;
		}

		let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
		let attackSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

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
	},

	afterAttack: function (pickit = true) {
		Precast.doPrecast(false);

		let needRepair = (Town.needRepair() || []);

		// Repair check
		needRepair.length > 0 && Town.visitTown(true);
		pickit && this.findItem(me.inArea(sdk.areas.Travincal) ? 60 : 20);
	},

	doCast: function (unit, attackSkill = -1) {
		if (attackSkill < 0) return Attack.Result.CANTATTACK;
		// check if unit became invalidated
		if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
		
		switch (attackSkill) {
		case sdk.skills.Whirlwind:
			if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.BlockWall)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.BlockWall, 2)) {
					return Attack.Result.FAILED;
				}
			}

			!unit.dead && Attack.whirlwind(unit);

			return Attack.Result.SUCCESS;
		default:
			if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) {
				return Attack.Result.FAILED;
			}

			if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
				let walk = Skill.getRange(attackSkill) < 4 && unit.distance < 10 && !checkCollision(me, unit, sdk.collision.BlockWall);

				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.Ranged, walk)) {
					return Attack.Result.FAILED;
				}
			}

			!unit.dead && Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

			return Attack.Result.SUCCESS;
		}
	},

	checkCloseMonsters: function (range = 10) {
		let monster = Game.getMonster();

		if (monster) {
			do {
				if (monster.distance <= range && monster.attackable && !checkCollision(me, monster, sdk.collision.Ranged)
						&& (Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[monster.isSpecial ? 1 : 3]))
							|| (Config.AttackSkill[3] > -1 && Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[3]))))) {
					return true;
				}
			} while (monster.getNext());
		}

		return false;
	},

	findItem: function (range = 10) {
		if (!Skill.canUse(sdk.skills.FindItem)) return false;

		let retry = false;
		let corpseList = [];
		let orgX = me.x;
		let orgY = me.y;

		MainLoop:
		for (let i = 0; i < 3; i += 1) {
			let corpse = Game.getMonster();

			if (corpse) {
				do {
					if (corpse.dead && getDistance(corpse, orgX, orgY) <= range && this.checkCorpse(corpse)) {
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

			while (corpseList.length > 0) {
				if (this.checkCloseMonsters(5)) {
					Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot());
					Attack.clear(10, false, false, false, false);
					retry = true;

					break MainLoop;
				}

				corpseList.sort(Sort.units);
				corpse = corpseList.shift();

				if (this.checkCorpse(corpse)) {
					(corpse.distance > 30 || checkCollision(me, corpse, sdk.collision.BlockWall)) && Pather.moveToUnit(corpse);
					Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

					CorpseLoop:
					for (let j = 0; j < 3; j += 1) {
						Skill.cast(sdk.skills.FindItem, sdk.skills.hand.Right, corpse);

						let tick = getTickCount();

						while (getTickCount() - tick < 1000) {
							if (corpse.getState(sdk.states.CorpseNoSelect)) {
								Pickit.fastPick();

								break CorpseLoop;
							}

							delay(10);
						}
					}
				}
			}
		}

		if (retry) {
			return this.findItem(me.inArea(sdk.areas.Travincal) ? 60 : 20);
		}

		Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot());
		Pickit.pickItems();

		return true;
	},

	checkCorpse: function (unit) {
		if (!unit || unit.mode !== sdk.monsters.mode.Death && unit.mode !== sdk.monsters.mode.Dead) return false;
		if ([sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3].indexOf(unit.classid) === -1
			&& unit.spectype === sdk.monsters.spectype.All) {
			return false;
		}

		// monstats2 doesn't contain guest monsters info. sigh..
		if (unit.classid <= sdk.monsters.BurningDeadArcher2 && !getBaseStat("monstats2", unit.classid, "corpseSel")) {
			return false;
		}

		let states = [
			sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
			sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
		];

		return !!(unit.distance <= 25 && !checkCollision(me, unit, sdk.collision.Ranged) && states.every(state => !unit.getState(state)));
	}
};
