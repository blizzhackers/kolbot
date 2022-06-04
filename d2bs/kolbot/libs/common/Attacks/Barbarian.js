/**
*  @filename    Barbarian.js
*  @author      kolton
*  @desc        Barbarian attack sequence
*
*/

const ClassAttack = {
	doAttack: function (unit, preattack) {
		if (!unit) return 1;
		let gid = unit.gid;
		let needRepair = Town.needRepair();

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			print("towncheck");

			if (Town.visitTown(!!needRepair.length)) {
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					return 1; // lost reference to the mob we were attacking
				}
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0])) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;
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

	afterAttack: function (pickit) {
		Precast.doPrecast(false);

		let needRepair = (Town.needRepair() || []);

		// Repair check
		needRepair.length > 0 && Town.visitTown(true);
		pickit && this.findItem(me.area === 83 ? 60 : 20);
	},

	doCast: function (unit, attackSkill) {
		let walk;

		if (attackSkill < 0) {
			return 2;
		}

		switch (attackSkill) {
		case 151:
			if (Math.ceil(getDistance(me, unit)) > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x1)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x1, 2)) {
					return 0;
				}
			}

			!unit.dead && Attack.whirlwind(unit);

			return 1;
		default:
			if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x4)) {
				walk = Skill.getRange(attackSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);
			}

			return 1;
		}
	},

	checkCloseMonsters: function (range = 10) {
		let monster = getUnit(1);

		if (monster) {
			do {
				if (getDistance(me, monster) <= range && monster.attackable && !checkCollision(me, monster, 0x4) &&
						(Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[(monster.spectype & 0x7) ? 1 : 3])) ||
						(Config.AttackSkill[3] > -1 && Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[3]))))) {
					return true;
				}
			} while (monster.getNext());
		}

		return false;
	},

	findItem: function (range = 10) {
		if (!Config.FindItem || !me.getSkill(142, 1)) {
			return false;
		}

		let i, j, tick, corpse, orgX, orgY, retry,
			corpseList = [];

		orgX = me.x;
		orgY = me.y;

		MainLoop:
		for (i = 0; i < 3; i += 1) {
			corpse = getUnit(1);

			if (corpse) {
				do {
					if ((corpse.mode === 0 || corpse.mode === 12) && getDistance(corpse, orgX, orgY) <= range && this.checkCorpse(corpse)) {
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

			while (corpseList.length > 0) {
				if (this.checkCloseMonsters(5)) {
					if (Config.FindItemSwitch) {
						me.switchWeapons(Attack.getPrimarySlot());
					}

					Attack.clear(10, false, false, false, false);

					retry = true;

					break MainLoop;
				}

				corpseList.sort(Sort.units);

				corpse = corpseList.shift();

				if (this.checkCorpse(corpse)) {
					if (getDistance(me, corpse) > 30 || checkCollision(me, corpse, 0x1)) {
						Pather.moveToUnit(corpse);
					}

					if (Config.FindItemSwitch) {
						me.switchWeapons(Attack.getPrimarySlot() ^ 1);
					}

					CorpseLoop:
					for (j = 0; j < 3; j += 1) {
						Skill.cast(142, 0, corpse);

						tick = getTickCount();

						while (getTickCount() - tick < 1000) {
							if (corpse.getState(118)) {
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
			return this.findItem(me.area === 83 ? 60 : 20);
		}

		if (Config.FindItemSwitch) {
			me.switchWeapons(Attack.getPrimarySlot());
		}

		Pickit.pickItems();

		return true;
	},

	checkCorpse: function (unit) {
		if (!unit || unit.mode !== sdk.units.monsters.monstermode.Death && unit.mode !== sdk.units.monsters.monstermode.Dead) return false;
		if ([sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3].indexOf(unit.classid) === -1 && unit.spectype === 0) return false;

		// monstats2 doesn't contain guest monsters info. sigh..
		if (unit.classid <= 575 && !getBaseStat("monstats2", unit.classid, "corpseSel")) {
			return false;
		}

		let states = [
			sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
			sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
		];

		return !!(getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) && states.every(state => !unit.getState(state)));
	}
};
