/**
*  @filename    Wereform.js
*  @author      kolton, theBGuy
*  @desc        Wereform attack sequence
*
*/

const ClassAttack = {
	feralBoost: 0,
	baseLL: me.getStat(sdk.stats.LifeLeech),
	useArmageddon: false,

	canUseArmageddon: function () {
		if (this.useArmageddon) return true;
		this.useArmageddon = me.getSkill(sdk.skills.Armageddon, 0);
		return (this.useArmageddon || me.getSkill(sdk.skills.Armageddon, 1));
	},

	doAttack: function (unit, preattack) {
		if (!unit) return 1;
		let gid = unit.gid;

		if (Config.MercWatch && Town.needMerc()) {
			console.debug("mercwatch");

			if (Town.visitTown()) {
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					return 1; // lost reference to the mob we were attacking
				}
			}
		}

		if (!this.feralBoost && Config.AttackSkill.includes(sdk.skills.FeralRage)) {
			// amount of life leech with max rage
			this.feralBoost = ((Math.floor(me.getSkill(sdk.skills.FeralRage, 1) / 2) + 3) * 4) + this.baseLL;
		}

		if (((Config.AttackSkill[0] === sdk.skills.FeralRage && (!me.getState(sdk.states.FeralRage) || me.getStat(sdk.stats.LifeLeech) < this.feralBoost))
			|| (Config.AttackSkill[0] === sdk.skills.Maul && !me.getState(sdk.states.Maul))
			|| (preattack && Config.AttackSkill[0] > 0))
			&& Attack.checkResist(unit, Config.AttackSkill[0])
			&& (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))
			&& (Skill.wereFormCheck(Config.AttackSkill[0]) || !me.shapeshifted)) {
			if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x5)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x5, true)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		Misc.shapeShift(Config.Wereform);

		// Rebuff Armageddon
		this.canUseArmageddon() && !me.getState(sdk.states.Armageddon) && Skill.cast(sdk.skills.Armageddon, 0);

		let timedSkill = -1;
		let untimedSkill = -1;
		let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		// Get timed skill
		let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

		if (Attack.checkResist(unit, checkSkill) && Skill.wereFormCheck(checkSkill) && Attack.validSpot(unit.x, unit.y)) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && Attack.validSpot(unit.x, unit.y)) {
			timedSkill = Config.AttackSkill[5];
		}

		// Get untimed skill
		checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

		if (Attack.checkResist(unit, checkSkill) && Skill.wereFormCheck(checkSkill) && Attack.validSpot(unit.x, unit.y)) {
			untimedSkill = checkSkill;
		} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && Attack.validSpot(unit.x, unit.y)) {
			untimedSkill = Config.AttackSkill[6];
		}

		// eval skills
		switch (true) {
		case timedSkill === sdk.skills.Fury && untimedSkill === sdk.skills.FeralRage:
			if (!me.getState(sdk.states.FeralRage) || me.getStat(sdk.stats.LifeLeech) < this.feralBoost) {
				timedSkill = sdk.skills.FeralRage;
			}

			break;
		case timedSkill === sdk.skills.Fury && untimedSkill === sdk.skills.Rabies:
		case timedSkill === sdk.skills.FireClaws && untimedSkill === sdk.skills.Rabies:
			if (!unit.getState(sdk.states.Rabies)) {
				timedSkill = sdk.skills.Rabies;
			}

			break;
		case timedSkill === sdk.skills.ShockWave && untimedSkill === sdk.skills.Maul:
			if (!me.getState(sdk.states.Maul)) {
				timedSkill = sdk.skills.Maul;
			}

			break;
		}

		// Low mana timed skill
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(timedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			timedSkill = Config.LowManaSkill[0];
		}

		// Low mana untimed skill
		if (Config.LowManaSkill[1] > -1 && Skill.getManaCost(untimedSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[1])) {
			untimedSkill = Config.LowManaSkill[1];
		}

		// use our secondary skill if we can't use our primary
		let choosenSkill = (Skill.isTimed(timedSkill) && me.skillDelay && untimedSkill > -1 ? untimedSkill : timedSkill);

		return this.doCast(unit, choosenSkill);
	},

	afterAttack: function () {
		Precast.doPrecast(false);
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, skill) {
		// unit reference no longer valid or it died
		if (!unit || unit.dead) return 1;
		// No valid skills can be found
		if (skill < 0) return 2;

		if (Skill.getRange(skill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
			return 0;
		}

		if (unit.distance > Skill.getRange(skill) || checkCollision(me, unit, 0x5)) {
			if (!Attack.getIntoPosition(unit, Skill.getRange(skill), 0x5, true)) {
				return 0;
			}
		}

		unit.attackable && Skill.cast(skill, Skill.getHand(skill), unit);

		Misc.poll(() => !me.skillDelay, 1000, 40);

		return 1;
	}
};
