/**
*  @filename    Paladin.js
*  @author      kolton, theBGuy
*  @desc        Paladin attack sequence
*
*/

const ClassAttack = {
	doAttack: function (unit, preattack) {
		if (!unit) return 1;
		let gid = unit.gid;

		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");

			if (Town.visitTown()) {
				// lost reference to the mob we were attacking
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					return 1;
				}
			}
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return 0;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return 1;
		}

		let mercRevive = 0;
		let attackSkill = -1;
		let aura = -1;
		let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

		if (Attack.getCustomAttack(unit)) {
			attackSkill = Attack.getCustomAttack(unit)[0];
			aura = Attack.getCustomAttack(unit)[1];
		} else {
			attackSkill = Config.AttackSkill[index];
			aura = Config.AttackSkill[index + 1];
		}

		// Classic auradin check
		if ([sdk.skills.HolyFire, sdk.skills.HolyFreeze, sdk.skills.HolyShock].includes(aura)) {
			// Monster immune to primary aura
			if (!Attack.checkResist(unit, aura)) {
				// Reset skills
				attackSkill = -1;
				aura = -1;

				// Set to secondary if not immune, check if using secondary attack aura if not check main skill for immunity
				if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, ([sdk.skills.HolyFire, sdk.skills.HolyFreeze, sdk.skills.HolyShock].includes(Config.AttackSkill[6]) ? Config.AttackSkill[6] : Config.AttackSkill[5]))) {
					attackSkill = Config.AttackSkill[5];
					aura = Config.AttackSkill[6];
				}
			}
		} else {
			// Monster immune to primary skill
			if (!Attack.checkResist(unit, attackSkill)) {
				// Reset skills
				attackSkill = -1;
				aura = -1;

				// Set to secondary if not immune
				if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5])) {
					attackSkill = Config.AttackSkill[5];
					aura = Config.AttackSkill[6];
				}
			}
		}

		// Low mana skill
		if (Config.LowManaSkill[0] > -1 && Skill.getManaCost(attackSkill) > me.mp && Attack.checkResist(unit, Config.LowManaSkill[0])) {
			attackSkill = Config.LowManaSkill[0];
			aura = Config.LowManaSkill[1];
		}

		let result = this.doCast(unit, attackSkill, aura);

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
				!!closeMob && this.doCast(closeMob, attackSkill, aura);
			}

			return 1;
		}

		return result;
	},

	afterAttack: function () {
		Precast.doPrecast(false);

		if (Config.Redemption instanceof Array
			&& (me.hpPercent < Config.Redemption[0] || me.mpPercent < Config.Redemption[1])
			&& Attack.checkNearCorpses(me) > 2 && Skill.setSkill(sdk.skills.Redemption, 0)) {
			delay(1500);
		}
	},

	doCast: function (unit, attackSkill, aura) {
		if (attackSkill < 0) return 2;
		
		switch (attackSkill) {
		case sdk.skills.BlessedHammer:
			// todo: add doll avoid to other classes
			if (Config.AvoidDolls && unit.dolls) {
				this.dollAvoid(unit);
				aura > -1 && Skill.setSkill(aura, 0);
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

				return 1;
			}

			// todo: maybe if we are currently surrounded and no tele to just attack from where we are
			// hammers cut a pretty wide arc so likely this would be enough to clear our path
			if (!this.getHammerPosition(unit)) {
				// Fallback to secondary skill if it exists
				if (Config.AttackSkill[5] > -1 && Config.AttackSkill[5] !== sdk.skills.BlessedHammer && Attack.checkResist(unit, Config.AttackSkill[5])) {
					return this.doCast(unit, Config.AttackSkill[5], Config.AttackSkill[6]);
				}

				return 0;
			}

			if (unit.distance > 9 || !unit.attackable) return 1;

			aura > -1 && Skill.setSkill(aura, 0);

			for (let i = 0; i < 3; i += 1) {
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

				if (!unit.attackable || unit.distance > 9 || unit.isPlayer) {
					break;
				}
			}

			return 1;
		case sdk.skills.HolyBolt:
			if (unit.distance > Skill.getRange(attackSkill) + 3 || CollMap.checkColl(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4)) {
					return 0;
				}
			}

			CollMap.reset();

			if (unit.distance > Skill.getRange(attackSkill) || CollMap.checkColl(me, unit, 0x2004, 2)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x2004, true)) {
					return 0;
				}
			}

			if (!unit.dead) {
				aura > -1 && Skill.setSkill(aura, 0);
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);
			}

			return 1;
		case sdk.skills.FistoftheHeavens:
			if (!me.skillDelay) {
				if (unit.distance > Skill.getRange(attackSkill) || CollMap.checkColl(me, unit, 0x2004, 2)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x2004, true)) {
						return 0;
					}
				}

				if (!unit.dead) {
					aura > -1 && Skill.setSkill(aura, 0);
					Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

					return 1;
				}
			}

			break;
		case sdk.skills.Attack:
		case sdk.skills.Sacrifice:
		case sdk.skills.Zeal:
		case sdk.skills.Vengeance:
			if (!Attack.validSpot(unit.x, unit.y)) {
				if (Attack.monsterObjects.indexOf(unit.classid) === -1) {
					return 0;
				}
			}
			
			// 3591 - wall/line of sight/ranged/items/objects/closeddoor 
			if (unit.distance > 3 || checkCollision(me, unit, 0x5)) {
				if (!Attack.getIntoPosition(unit, 3, 0x5, true)) {
					return 0;
				}
			}

			if (unit.attackable) {
				aura > -1 && Skill.setSkill(aura, 0);
				return (Skill.cast(attackSkill, 2, unit) ? 1 : 0);
			}

			break;
		default:
			if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) return 0;

			if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, 0x4)) {
				let walk = (attackSkill !== 97 && Skill.getRange(attackSkill) < 4 && unit.distance < 10 && !checkCollision(me, unit, 0x1));

				// walk short distances instead of tele for melee attacks. teleport if failed to walk
				if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), 0x4, walk)) return 0;
			}

			if (!unit.dead) {
				aura > -1 && Skill.setSkill(aura, 0);
				Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);
			}

			return 1;
		}

		Misc.poll(() => !me.skillDelay, 1000, 40);

		return 1;
	},

	dollAvoid: function (unit) {
		let distance = 14;

		for (let i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
			let cx = Math.round(Math.cos(i) * distance);
			let cy = Math.round(Math.sin(i) * distance);

			if (Attack.validSpot(unit.x + cx, unit.y + cy)) {
				// don't clear while trying to reposition
				return Pather.moveToEx(unit.x + cx, unit.y + cy, {clearSettings: {allowClearing: false}});
			}
		}

		return false;
	},

	getHammerPosition: function (unit) {
		let x, y, positions, baseId = getBaseStat("monstats", unit.classid, "baseid");
		let	size = getBaseStat("monstats2", baseId, "sizex");

		// in case base stat returns something outrageous
		(typeof size !== "number" || size < 1 || size > 3) && (size = 3);

		switch (unit.type) {
		case sdk.unittype.Player:
			x = unit.x;
			y = unit.y;
			positions = [[x + 2, y], [x + 2, y + 1]];

			break;
		case sdk.unittype.Monster:
			let commonCheck = ((unit.mode === 2 || unit.mode === 15) && unit.distance < 10);
			x = commonCheck && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targetx : unit.x;
			y = commonCheck && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targety : unit.y;
			positions = [[x + 2, y + 1], [x, y + 3], [x + 2, y - 1], [x - 2, y + 2], [x - 5, y]];
			size === 3 && positions.unshift([x + 2, y + 2]);

			break;
		}

		// If one of the valid positions is a position im at already
		for (let i = 0; i < positions.length; i += 1) {
			if ((getDistance(me, positions[i][0], positions[i][1]) < 1
				&& !CollMap.checkColl(unit, {x: positions[i][0], y: positions[i][1]}, 0x5 | 0x400 | 0x1000, 0))
				|| (getDistance(me, positions[i][0], positions[i][1]) <= 4 && me.getMobCount(6) > 2)) {
				return true;
			}
		}

		for (let i = 0; i < positions.length; i += 1) {
			let check = {
				x: positions[i][0],
				y: positions[i][1]
			};

			if (Attack.validSpot(check.x, check.y) && !CollMap.checkColl(unit, check, 0x5 | 0x400 | 0x1000, 0)) {
				if (this.reposition(positions[i][0], positions[i][1])) return true;
			}
		}

		return false;
	},

	reposition: function (x, y) {
		if ([x, y].distance > 0) {
			if (Pather.useTeleport()) {
				[x, y].distance > 30 ? Pather.moveTo(x, y) : Pather.teleportTo(x, y, 3);
			} else {
				if ([x, y].distance <= 4) {
					Misc.click(0, 0, x, y);
				} else if (!CollMap.checkColl(me, {x: x, y: y}, 0x5 | 0x400 | 0x1000, 3)) {
					Pather.walkTo(x, y);
				} else {
					// don't clear while trying to reposition
					Pather.moveToEx(x, y, {clearSettings: {allowClearing: false}});
				}

				delay(200);
			}
		}

		return true;
	}
};
