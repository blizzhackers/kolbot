/**
*  @filename    Sorceress.js
*  @author      kolton, theBGuy
*  @desc        Sorceress attack sequence
*
*/

const ClassAttack = {
	decideSkill: function (unit) {
		let skills = {timed: -1, untimed: -1};
		if (!unit) return skills;

		let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

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
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(skills.timed) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
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

		if (Config.MercWatch && Town.needMerc()) {
			if (Town.visitTown()) {
				print("mercwatch");
				
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					console.debug("Lost reference to unit");
					return 1;
				}
			}
		}

		// Keep Energy Shield active
		Config.UseEnergyShield && Precast.precastables.EnergyShield && !me.getState(sdk.states.EnergyShield) && Skill.cast(sdk.skills.EnergyShield, 0);

		// Keep Thunder-Storm active
		Precast.precastables.ThunderStorm && !me.getState(sdk.states.ThunderStorm) && Skill.cast(sdk.skills.ThunderStorm, 0);

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		let useStatic = (Config.StaticList.length > 0 && Config.CastStatic < 100 && me.getSkill(42, 1) && Attack.checkResist(unit, "lightning"));
		let idCheck = function (id) {
			if (unit) {
				switch (true) {
				case typeof id === "number" && unit.classid && unit.classid === id:
				case typeof id === "string" && unit.name && unit.name.toLowerCase() === id.toLowerCase():
				case typeof id === "function" && id(unit):
					return true;
				default:
					return false;
				}
			}

			return false;
		};
 
		// Static - needs to be re-done
		if (useStatic && Config.StaticList.some(id => idCheck(id)) && unit.hpPercent > Config.CastStatic) {
			let staticRange = Skill.getRange(sdk.skills.StaticField);
			let casts = 0;

			while (!me.dead && unit.hpPercent > Config.CastStatic && unit.attackable) {
				if (unit.distance > staticRange || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, staticRange, 0x4)) {
						return 0;
					}
				}

				// if we fail to cast or we've casted 3 or more times - do something else
				if (!Skill.cast(sdk.skills.StaticField, 0) || casts >= 3) {
					break;
				} else {
					casts++;
				}
			}

			// re-check mob after static
			if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
				console.debug("Lost reference to unit");
				return 1;
			}
		}

		let skills = this.decideSkill(unit);
		let result = this.doCast(unit, skills.timed, skills.untimed);

		if (result === 2 && Config.TeleStomp && Config.UseMerc && Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
			let merc = me.getMerc();
			let mercRevive = 0;
			let haveTK = !!(me.getSkill(sdk.skills.Telekinesis, 1));

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

				if (!!merc && getDistance(merc, unit) > 7) {
					Pather.moveToUnit(unit);

					let spot = Attack.findSafeSpot(unit, 10, 5, 9);
					!!spot && Pather.walkTo(spot.x, spot.y);
				}

				let closeMob = Attack.getNearestMonster({skipGid: gid});
				
				if (!!closeMob) {
					let findSkill = this.decideSkill(closeMob);
					(this.doCast(closeMob, findSkill.timed, findSkill.untimed) === 1) || (haveTK && Skill.cast(sdk.skills.Telekinesis, 0, unit));
				}
			}

			return 1;
		}

		return result;
	},

	afterAttack: function () {
		Precast.doPrecast(false);
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, timedSkill = -1, untimedSkill = -1) {
		let walk, noMana = false;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) return 2;

		if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill)) && Skill.getManaCost(timedSkill) < me.mp) {
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

			!unit.dead && !checkCollision(me, unit, 0x4) && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);

			return 1;
		} else {
			noMana = !me.skillDelay;
		}

		if (untimedSkill > -1 && Skill.getManaCost(untimedSkill) < me.mp) {
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
		} else {
			noMana = true;
		}

		// don't count as failed
		if (noMana) return 3;

		Misc.poll(() => !me.skillDelay, 1000, 40);

		return 1;
	}
};
