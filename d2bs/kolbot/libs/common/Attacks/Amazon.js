/**
*  @filename    Amazon.js
*  @author      kolton, theBGuy
*  @desc        Amazon attack sequence
*
*/

const ClassAttack = {
	bowCheck: false,
	lightFuryTick: 0,

	decideSkill: function (unit) {
		let skills = {timed: -1, untimed: -1};
		if (!unit) return skills;

		let index = (unit.isSpecial || unit.type === 0) ? 1 : 3;

		// Get timed skill
		let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

		if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
			skills.timed = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5])) {
			skills.timed = Config.AttackSkill[5];
		}

		// Get untimed skill
		checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

		if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
			skills.untimed = checkSkill;
		} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6])) {
			skills.untimed = Config.AttackSkill[6];
		}

		// Low mana timed skill
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(skills.untimed) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			skills.timed = Config.LowManaSkill[0];
		}

		// Low mana untimed skill
		if (Config.LowManaSkill[1] > -1 && Skill.getManaCost(skills.untimed) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[1])) {
			skills.untimed = Config.LowManaSkill[1];
		}

		return skills;
	},

	doAttack: function (unit, preattack) {
		if (!unit) return 1;
		let gid = unit.gid;
		let needRepair = Town.needRepair();

		if ((Config.MercWatch && Town.needMerc()) || needRepair.length > 0) {
			print("towncheck");

			if (Town.visitTown(!!needRepair.length)) {
				// lost reference to the mob we were attacking
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					return 1;
				}
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		if (Config.UseInnerSight && Precast.precastables.InnerSight) {
			if (!unit.getState(sdk.states.InnerSight) && unit.distance > 3 && unit.distance < 13 && !checkCollision(me, unit, 0x4)) {
				Skill.cast(sdk.skills.InnerSight, 0, unit);
			}
		}

		if (Config.UseSlowMissiles && Precast.precastables.SlowMissiles) {
			if (!unit.getState(sdk.states.SlowMissiles)) {
				if ((unit.distance > 3 || unit.getEnchant(sdk.enchant.LightningEnchanted)) && unit.distance < 13 && !checkCollision(me, unit, 0x4)) {
					// Act Bosses and mini-bosses are immune to Slow Missles and pointless to use on lister or Cows, Use Inner-Sight instead
					if ([sdk.monsters.HellBovine].includes(unit.classid) || unit.boss) {
						// Check if already in this state
						if (!unit.getState(sdk.states.InnerSight) && Config.UseInnerSight && Precast.precastables.InnerSight) {
							Skill.cast(sdk.skills.InnerSight, 0, unit);
						}
					} else {
						Skill.cast(sdk.skills.SlowMissiles, 0, unit);
					}
				}
			}
		}

		let mercRevive = 0;
		let skills = this.decideSkill(unit);
		let result = this.doCast(unit, skills.timed, skills.untimed);

		if (result === 2 && Config.TeleStomp && Config.UseMerc && Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
			let merc = me.getMerc();

			while (unit.attackable) {
				if (Misc.townCheck()) {
					if (!unit || !copyUnit(unit).x) {
						unit = Misc.poll(() => getUnit(1, -1, -1, gid), 1000, 80);
					}
				}

				if (!unit) return 1;

				if (Town.needMerc()) {
					if (Config.MercWatch && mercRevive++ < 1) {
						Town.visitTown();
					} else {
						return 2;
					}

					(merc === undefined || !merc) && (merc = me.getMerc());
				}

				if (!!merc && getDistance(merc, unit) > 5) {
					Pather.moveToUnit(unit);

					let spot = Attack.findSafeSpot(unit, 10, 5, 9);
					!!spot && Pather.walkTo(spot.x, spot.y);
				}

				let closeMob = Attack.getNearestMonster({skipGid: gid});
				
				if (!!closeMob) {
					let findSkill = this.decideSkill(closeMob);
					(this.doCast(closeMob, findSkill.timed, findSkill.untimed) === 1) || (Config.UseDecoy && Precast.precastables.Decoy && Skill.cast(sdk.skills.Decoy, 0, unit));
				}
			}

			return 1;
		}

		return result;
	},

	afterAttack: function () {
		Precast.doPrecast(false);

		let needRepair = (Town.needRepair() || []);

		// Repair check, mainly to restock arrows
		needRepair.length > 0 && Town.visitTown(true);

		this.lightFuryTick = 0;
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, timedSkill, untimedSkill) {
		let walk;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		// Arrow/bolt check
		if (this.bowCheck) {
			switch (true) {
			case this.bowCheck === "bow" && !me.getItem("aqv", 1):
			case this.bowCheck === "crossbow" && !me.getItem("cqv", 1):
				console.log("Bow check");
				Town.visitTown();

				break;
			}
		}

		if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case sdk.skills.LightningFury:
				if (!this.lightFuryTick || getTickCount() - this.lightFuryTick > Config.LightningFuryDelay * 1000) {
					if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
							return 0;
						}
					}

					if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
						this.lightFuryTick = getTickCount();
					}

					return 1;
				}

				break;
			default:
				if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					// Allow short-distance walking for melee skills
					walk = Skill.getRange(timedSkill) < 4 && unit.distance < 10 && !checkCollision(me, unit, 0x1);

					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, walk)) {
						return 0;
					}
				}

				!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);

				return 1;
			}
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (unit.distance > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(untimedSkill) < 4 && unit.distance < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, walk)) {
					return 0;
				}
			}

			!unit.dead && Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);

			return 1;
		}

		Misc.poll(() => !me.skillDelay, 1000, 40);

		// Wait for Lightning Fury timeout
		while (this.lightFuryTick && getTickCount() - this.lightFuryTick < Config.LightningFuryDelay * 1000) {
			delay(40);
		}

		return 1;
	}
};
