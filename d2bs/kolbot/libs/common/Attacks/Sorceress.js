/**
*	@filename	Sorceress.js
*	@author		kolton, theBGuy
*	@desc		Sorceress attack sequence
*/

const ClassAttack = {
	doAttack: function (unit, preattack) {
		if (!unit) return 1;
		let gid = unit.gid;

		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");

			if (Town.visitTown()) {
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					console.debug("Lost reference to unit");
					return 1; // lost reference to the mob we were attacking
				}
			}
		}

		// Keep Energy Shield active
		if (Config.UseEnergyShield && !me.getState(sdk.states.EnergyShield) && me.getSkill(sdk.skills.EnergyShield, 1)) {
			Skill.cast(sdk.skills.EnergyShield, 0);
		}

		// Keep Thunder-Storm active
		if (!me.getState(sdk.states.ThunderStorm) && me.getSkill(sdk.skills.ThunderStorm, 1)) {
			Skill.cast(sdk.skills.ThunderStorm, 0);
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

		let checkSkill,
			mercRevive = 0,
			timedSkill = -1,
			untimedSkill = -1;
		let useStatic = (Config.StaticList.length > 0 && Config.CastStatic < 100 && me.getSkill(42, 1) && Attack.checkResist(unit, "lightning"));

		// Static
		if (useStatic && Config.StaticList.some(
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
		) && unit.hpPercent > Config.CastStatic) {
			let staticRange = Math.floor((me.getSkill(42, 1) + 4) * 2 / 3);

			while (!me.dead && unit.hpPercent > Config.CastStatic && unit.attackable) {
				if (unit.distance > staticRange || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, staticRange, 0x4)) {
						return 0;
					}
				}

				if (!Skill.cast(42, 0)) {
					break;
				}
			}

			// re-check mob after static
			if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) return 1; // lost reference to the mob we were attacking or its dead
		}

		let index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		// Get timed skill
		checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

		if (Attack.checkResist(unit, checkSkill) && ([56, 59].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = Config.AttackSkill[5];
		}

		// Get untimed skill
		checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

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

		let result = this.doCast(unit, timedSkill, untimedSkill);

		if (result === 2 && Config.TeleStomp && Config.UseMerc && Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
			let merc = me.getMerc();
			let haveTK = !!(me.getSkill(sdk.skills.Telekinesis, 1));

			while (unit.attackable) {
				if (Misc.townCheck()) {
					if (!unit || !copyUnit(unit).x) {
						unit = Misc.poll(function () { return getUnit(1, -1, -1, gid); }, 1000, 80);
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
				!!closeMob ? this.doCast(closeMob, timedSkill, untimedSkill) : haveTK && Skill.cast(sdk.skills.Telekinesis, 0, unit);
			}

			return 1;
		}

		return result;
	},

	afterAttack: function () {
		Precast.doPrecast(false);
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, timedSkill, untimedSkill) {
		let walk, noMana = false;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) return 2;

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill)) && Skill.getManaCost(timedSkill) < me.mp) {
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

			if (!unit.dead && !checkCollision(me, unit, 0x4)) {
				Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
			}

			return 1;
		} else {
			noMana = !me.skillDelay;
		}

		if (untimedSkill > -1 && Skill.getManaCost(untimedSkill) < me.mp) {
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

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

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
