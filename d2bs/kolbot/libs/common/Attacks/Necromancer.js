/**
*  @filename    Necromancer.js
*  @author      kolton, theBGuy
*  @desc        Necromancer attack sequence
*
*/

const ClassAttack = {
	novaTick: 0,
	maxSkeletons: 0,
	maxMages: 0,
	maxRevives: 0,

	setArmySize: function () {
		this.maxSkeletons = Config.Skeletons === "max" ? Skill.getMaxSummonCount(sdk.skills.RaiseSkeleton) : Config.Skeletons;
		this.SkeletonMages = Config.SkeletonMages === "max" ? Skill.getMaxSummonCount(sdk.skills.RaiseSkeletalMage) : Config.SkeletonMages;
		this.maxRevives = Config.Revives === "max" ? Skill.getMaxSummonCount(sdk.skills.Revive) : Config.Revives;
	},

	// Returns: true - doesn't use summons or has all he can summon, false - not full of summons yet
	isArmyFull: function () {
		// This necro doesn't summon anything so assume he's full
		if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
			return true;
		}

		// Make sure we have a current count of summons needed
		this.setArmySize();

		// See if we're at full army count
		if ((me.getMinionCount(sdk.minions.Skeleton) < this.maxSkeletons)
			&& (me.getMinionCount(sdk.minions.SkeletonMage) < this.maxMages)
			&& (me.getMinionCount(sdk.minions.Revive) < this.maxRevives)) {
			return false;
		}

		// If we got this far this necro has all the summons he needs
		return true;
	},

	canCurse: function (unit, curseID) {
		if (unit === undefined || unit.dead || !me.getSkill(curseID, 1)) return false;

		let state = 0;

		switch (curseID) {
		case sdk.skills.AmplifyDamage:
			state = sdk.states.AmplifyDamage;

			break;
		case sdk.skills.DimVision:
			// dim doesn't work on oblivion knights
			if ([sdk.monsters.OblivionKnight1, sdk.monsters.OblivionKnight2, sdk.monsters.OblivionKnight3].includes(unit.classid)) return false;
			state = sdk.states.DimVision;

			break;
		case sdk.skills.Weaken:
			state = sdk.states.Weaken;

			break;
		case sdk.skills.IronMaiden:
			state = sdk.states.IronMaiden;

			break;
		case sdk.skills.Terror:
			if (!unit.scareable) return false;
			state = sdk.states.Terror;

			break;
		case sdk.skills.Confuse:
			// doens't work on specials
			if (!unit.scareable) return false;
			state = sdk.states.Confuse;

			break;
		case sdk.skills.LifeTap:
			state = sdk.states.LifeTap;

			break;
		case sdk.skills.Attract:
			// doens't work on specials
			if (!unit.scareable) return false;
			state = sdk.states.Attract;

			break;
		case sdk.skills.Decrepify:
			state = sdk.states.Decrepify;

			break;
		case sdk.skills.LowerResist:
			state = sdk.states.LowerResist;

			break;
		default:
			print("(ÿc9canCurse) :: ÿc1Invalid Curse ID: " + curseID);
			
			return false;
		}

		return !unit.getState(state);
	},

	getCustomCurse: function (unit) {
		if (Config.CustomCurse.length <= 0) return false;

		let curse = Config.CustomCurse
			.findIndex(function (unitID) {
				if ((typeof unitID[0] === "number" && unit.classid && unit.classid === unitID[0])
						|| (typeof unitID[0] === "string" && unit.name && unit.name.toLowerCase() === unitID[0].toLowerCase())) {
					return true;
				}
				return false;
			});
		if (curse > -1) {
			// format [id, curse, spectype]
			if (Config.CustomCurse[curse].length === 3) {
				return ((unit.spectype & Config.CustomCurse[curse][2]) ? Config.CustomCurse[curse][1] : false);
			} else {
				return Config.CustomCurse[curse][1];
			}
		}

		return false;
	},

	doAttack: function (unit, preattack) {
		if (!unit || unit.dead) return 1;

		let mercRevive = 0;
		let timedSkill = -1;
		let untimedSkill = -1;
		let customCurse = -1;
		let gid = unit.gid;
		let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");

			if (Town.visitTown()) {
				if (!unit || !copyUnit(unit).x || !getUnit(1, -1, -1, gid) || unit.dead) {
					return 1; // lost reference to the mob we were attacking
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

		// only continue if we can actually curse the unit otherwise its a waste of time
		if (unit.curseable) {
			customCurse = this.getCustomCurse(unit);

			if (customCurse && this.canCurse(unit, customCurse)) {
				if (unit.distance > 25 || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, 25, 0x4)) {
						return 0;
					}
				}

				Skill.cast(customCurse, 0, unit);

				return 1;
			} else if (!customCurse) {
				if (Config.Curse[0] > 0 && (unit.spectype & 0x7) && this.canCurse(unit, Config.Curse[0])) {
					if (unit.distance > 25 || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, 25, 0x4)) {
							return 0;
						}
					}

					Skill.cast(Config.Curse[0], 0, unit);

					return 1;
				}

				if (Config.Curse[1] > 0 && !(unit.spectype & 0x7) && this.canCurse(unit, Config.Curse[1])) {
					if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, 25, 0x4)) {
							return 0;
						}
					}

					Skill.cast(Config.Curse[1], 0, unit);

					return 1;
				}
			}
		}

		// Get timed skill
		let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

		if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5])) {
			timedSkill = Config.AttackSkill[5];
		}

		// Get untimed skill
		checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

		if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
			untimedSkill = checkSkill;
		} else if (Config.AttackSkill[6] > -1 && Attack.checkResist(unit, Config.AttackSkill[6]) && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6])) {
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

		if (result === 1) {
			Config.ActiveSummon && this.raiseArmy();
			this.explodeCorpses(unit);
		} else if (result === 2 && Config.TeleStomp && Config.UseMerc && Pather.canTeleport() && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
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

				Config.ActiveSummon && this.raiseArmy();
				this.explodeCorpses(unit);
				let closeMob = Attack.getNearestMonster({skipGid: gid});
				!!closeMob && this.doCast(closeMob, timedSkill, untimedSkill);
			}

			return 1;
		}

		return result;
	},

	afterAttack: function () {
		Precast.doPrecast(false);
		this.raiseArmy();
		this.novaTick = 0;
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, timedSkill = -1, untimedSkill = -1) {
		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) return 2;
		
		let walk;

		// Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
		this.isArmyFull() && this.checkCorpseNearMonster(unit) && this.explodeCorpses(unit);

		if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case sdk.skills.PoisonNova:
				if (!this.novaTick || getTickCount() - this.novaTick > Config.PoisonNovaDelay * 1000) {
					if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
							return 0;
						}
					}

					if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
						this.novaTick = getTickCount();
					}
				}

				break;
			case 500: // Pure Summoner
				if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
						return 0;
					}
				}

				delay(300);

				break;
			default:
				if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) return 0;

				if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					// Allow short-distance walking for melee skills
					let walk = Skill.getRange(timedSkill) < 4 && unit.distance < 10 && !checkCollision(me, unit, 0x1);

					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, walk)) {
						return 0;
					}
				}

				!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);

				break;
			}
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) return 0;

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

		// Delay for Poison Nova
		while (this.novaTick && getTickCount() - this.novaTick < Config.PoisonNovaDelay * 1000) {
			delay(40);
		}

		return 1;
	},

	raiseArmy: function (range = 25) {
		let tick, count;

		this.setArmySize();

		for (let i = 0; i < 3; i += 1) {
			let corpse = getUnit(1, -1, 12);
			let corpseList = [];

			if (corpse) {
				do {
					// within casting distance
					if (corpse.distance <= range && this.checkCorpse(corpse)) {
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

			while (corpseList.length > 0) {
				corpse = corpseList.shift();

				if (me.getMinionCount(sdk.minions.Skeleton) < this.maxSkeletons) {
					if (!Skill.cast(sdk.skills.RaiseSkeleton, 0, corpse)) {
						return false;
					}

					count = me.getMinionCount(sdk.minions.Skeleton);
					tick = getTickCount();

					while (getTickCount() - tick < 200) {
						if (me.getMinionCount(sdk.minions.Skeleton) > count) {
							break;
						}

						delay(10);
					}
				} else if (me.getMinionCount(sdk.minions.SkeletonMage) < this.maxMages) {
					if (!Skill.cast(sdk.skills.RaiseSkeletalMage, 0, corpse)) {
						return false;
					}

					count = me.getMinionCount(sdk.minions.SkeletonMage);
					tick = getTickCount();

					while (getTickCount() - tick < 200) {
						if (me.getMinionCount(sdk.minions.SkeletonMage) > count) {
							break;
						}

						delay(10);
					}
				} else if (me.getMinionCount(sdk.minions.Revive) < this.maxRevives) {
					if (this.checkCorpse(corpse, true)) {
						print("Reviving " + corpse.name);

						if (!Skill.cast(sdk.skills.Revive, 0, corpse)) {
							return false;
						}

						count = me.getMinionCount(sdk.minions.Revive);
						tick = getTickCount();

						while (getTickCount() - tick < 200) {
							if (me.getMinionCount(sdk.minions.Revive) > count) {
								break;
							}

							delay(10);
						}
					}
				} else {
					return true;
				}
			}
		}

		return true;
	},

	explodeCorpses: function (unit) {
		if (Config.ExplodeCorpses === 0 || unit.mode === 0 || unit.mode === 12) {
			return false;
		}

		let corpseList = [];
		let range = Math.floor((me.getSkill(Config.ExplodeCorpses, 1) + 7) / 3);
		let corpse = getUnit(1, -1, 12);

		if (corpse) {
			do {
				if (getDistance(unit, corpse) <= range && this.checkCorpse(corpse)) {
					corpseList.push(copyUnit(corpse));
				}
			} while (corpse.getNext());

			// Shuffle the corpseList so if running multiple necrobots they explode separate corpses not the same ones
			corpseList.length > 1 && (corpseList = corpseList.shuffle());

			if (this.isArmyFull()) {
				// We don't need corpses as we are not a Summoner Necro, Spam CE till monster dies or we run out of bodies.
				do {
					corpse = corpseList.shift();

					if (corpse) {
						if (!unit.dead && this.checkCorpse(corpse) && getDistance(corpse, unit) <= range) {
							// Added corpse ID so I can see when it blows another monster with the same ClassID and Name
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid);

							if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
								delay(me.ping + 1);
							}
						}
					}
				} while (corpseList.length > 0);
			} else {
				// We are a Summoner Necro, we should conserve corpses, only blow 2 at a time so we can check for needed re-summons.
				for (let i = 0; i <= 1; i += 1) {
					if (corpseList.length > 0) {
						corpse = corpseList.shift();

						if (corpse) {
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name);

							if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
								delay(200);
							}
						}
					} else {
						break;
					}
				}
			}
		}

		return true;
	},

	checkCorpseNearMonster: function (monster, range) {
		let corpse = getUnit(1, -1, 12);

		// Assume CorpseExplosion if no range specified
		range === undefined && (range = Math.floor((me.getSkill(Config.ExplodeCorpses, 1) + 7) / 3));

		if (corpse) {
			do {
				if (getDistance(corpse, monster) <= range) {
					return true;
				}
			} while (corpse.getNext());
		}

		return false;
	},

	checkCorpse: function (unit, revive = false) {
		if (!unit || unit.mode !== 12) return false;

		let baseId = getBaseStat("monstats", unit.classid, "baseid"), badList = [312, 571];
		let	states = [
			sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
			sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
		];

		if (revive && ((unit.spectype & 0x7) || badList.indexOf(baseId) > -1 || (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3))) {
			return false;
		}

		if (!getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")) return false;

		return !!(unit.distance <= 25 && !checkCollision(me, unit, 0x4) && states.every(state => !unit.getState(state)));
	}
};
