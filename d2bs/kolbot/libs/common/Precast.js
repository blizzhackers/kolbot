/**
*  @filename    Precast.js
*  @author      noah-, kolton, theBGuy
*  @desc        handle player prebuff sequence
*
*/

const Precast = new function () {
	this.enabled = true;
	this.haveCTA = -1;
	this.bestSlot = {};

	// TODO: build better method of keeping track of duration based skills so we can reduce resource usage
	// build obj -> figure out which skills we have -> calc duration -> assign tick of last casted -> track tick (background worker maybe?)
	// would reduce checking have skill and state calls, just let tick = getTickCount(); -> obj.some((el) => tick - el.lastTick > el.duration) -> true then cast
	// would probably make sense to just re-cast everything (except summons) if one of our skills is about to run out rather than do this process again 3 seconds later
	this.skills = {
		// Not sure how I want to handle cold armors
		coldArmor: {
			best: false,
			duration: 0,
			tick: 0
		},
		boneArmor: {
			max: 0,
			armorPercent: function () {
				return this.max > 0 ? Math.round(me.getStat(sdk.stats.SkillBoneArmor) * 100 / this.max) : 100;
			},
		},
		holyShield: {
			canUse: false,
			duration: 0,
			tick: 0
		},
		shout: {
			duration: 0,
			tick: 0
		},
		battleOrders: {
			duration: 0,
			tick: 0
		},
		battleCommand: {
			duration: 0,
			tick: 0
		},
	};

	this.warCries = function (skillId, x, y) {
		if (!skillId || x === undefined) return false;
		const states = {};
		states[sdk.skills.Shout] = sdk.states.Shout;
		states[sdk.skills.BattleOrders] = sdk.states.BattleOrders;
		states[sdk.skills.BattleCommand] = sdk.states.BattleCommand;
		if (states[skillId] === undefined) return false;

		for (let i = 0; i < 3; i++) {
			try {
				if (me.getSkill(sdk.skills.get.RightId) !== skillId && !me.setSkill(skillId, sdk.skills.hand.Right)) throw new Error("Failed to set " + getSkillById(skillId) + " on hand");
				// Right hand + No Shift
				let clickType = 3, shift = sdk.clicktypes.shift.NoShift;

				MainLoop:
				for (let n = 0; n < 3; n += 1) {
					typeof x === "object" ? clickMap(clickType, shift, x) : clickMap(clickType, shift, x, y);
					delay(20);
					typeof x === "object" ? clickMap(clickType + 2, shift, x) : clickMap(clickType + 2, shift, x, y);

					for (let i = 0; i < 8; i += 1) {
						if (me.attacking) {
							break MainLoop;
						}

						delay(20);
					}
				}

				while (me.attacking) {
					delay(10);
				}

				if (Misc.poll(() => me.getState(states[skillId]), 300, 50)) return true;
			} catch (e) {
				console.error(e);
				return false;
			}
		}
		return false;
	};

	this.checkCTA = function () {
		if (this.haveCTA > -1) return true;

		let check = me.checkItem({name: sdk.locale.items.CalltoArms, equipped: true});

		if (check.have) {
			this.haveCTA = check.item.isOnSwap ? 1 : 0;
		}

		return this.haveCTA > -1;
	};

	this.precastCTA = function (force = false) {
		if (!Config.UseCta || this.haveCTA === -1 || me.classic || me.barbarian || me.inTown || me.shapeshifted) return false;
		if (!force && me.getState(sdk.states.BattleOrders)) return true;

		if (this.haveCTA > -1) {
			let slot = me.weaponswitch;
			let {x, y} = me;

			me.switchWeapons(this.haveCTA);
			this.cast(sdk.skills.BattleCommand, x, y, true);
			this.cast(sdk.skills.BattleCommand, x, y, true);
			this.cast(sdk.skills.BattleOrders, x, y, true);

			this.skills.battleOrders.tick = getTickCount();
			// does this need to be re-calculated everytime? if no autobuild should really just be done when we initialize
			!this.skills.battleOrders.duration && (this.skills.battleOrders.duration = Skill.getDuration(sdk.skills.BattleOrders));

			me.switchWeapons(slot);

			return true;
		}

		return false;
	};

	// should be done in init function?
	// should this be part of the skill class instead?
	this.getBetterSlot = function (skillId) {
		if (this.bestSlot[skillId] !== undefined) return this.bestSlot[skillId];

		let [classid, skillTab] = (() => {
			switch (skillId) {
			case sdk.skills.FrozenArmor:
			case sdk.skills.ShiverArmor:
			case sdk.skills.ChillingArmor:
				return [sdk.player.class.Sorceress, sdk.skills.tabs.Cold];
			case sdk.skills.Enchant:
				return [sdk.player.class.Sorceress, sdk.skills.tabs.Fire];
			case sdk.skills.ThunderStorm:
			case sdk.skills.EnergyShield:
				return [sdk.player.class.Sorceress, sdk.skills.tabs.Lightning];
			case sdk.skills.BoneArmor:
				return [sdk.player.class.Necromancer, sdk.skills.tabs.PoisonandBone];
			case sdk.skills.HolyShield:
				return [sdk.player.class.Paladin, sdk.skills.tabs.PalaCombat];
			case sdk.skills.Taunt:
			case sdk.skills.FindItem:
			case sdk.skills.BattleCry:
			case sdk.skills.WarCry:
			case sdk.skills.Shout:
			case sdk.skills.BattleOrders:
			case sdk.skills.BattleCommand:
				return [sdk.player.class.Barbarian, sdk.skills.tabs.Warcries];
			case sdk.skills.CycloneArmor:
				return [sdk.player.class.Druid, sdk.skills.tabs.Elemental];
			case sdk.skills.Werewolf:
			case sdk.skills.Werebear:
				return [sdk.player.class.Druid, sdk.skills.tabs.ShapeShifting];
			case sdk.skills.BurstofSpeed:
			case sdk.skills.Fade:
				return [sdk.player.class.Assassin, sdk.skills.tabs.ShadowDisciplines];
			case sdk.skills.BladeShield:
				return [sdk.player.class.Assassin, sdk.skills.tabs.MartialArts];
			default:
				return [-1, -1];
			}
		})();

		if (classid < 0) return me.weaponswitch;

		me.weaponswitch !== 0 && me.switchWeapons(0);

		let [sumCurr, sumSwap] = [0, 0];
		const sumStats = function (item) {
			return (item.getStat(sdk.stats.AllSkills)
				+ item.getStat(sdk.stats.AddClassSkills, classid) + item.getStat(sdk.stats.AddSkillTab, skillTab)
				+ item.getStat(sdk.stats.SingleSkill, skillId) + item.getStat(sdk.stats.NonClassSkill, skillId));
		};

		me.getItemsEx()
			.filter(item => item.isEquipped && [sdk.body.RightArm, sdk.body.LeftArm, sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary].includes(item.bodylocation))
			.forEach(function (item) {
				if (item.isOnMain) {
					sumCurr += sumStats(item);
					return;
				}

				if (item.isOnSwap) {
					sumSwap += sumStats(item);
					return;
				}
			});
		this.bestSlot[skillId] = (sumSwap > sumCurr) ? me.weaponswitch ^ 1 : me.weaponswitch;
		return this.bestSlot[skillId];
	};

	this.cast = function (skillId, x = me.x, y = me.y, dontSwitch = false) {
		if (!skillId || !Skill.wereFormCheck(skillId) || (me.inTown && !Skill.townSkill(skillId))) return false;
		if (Skill.getManaCost(skillId) > me.mp) return false;

		let swap = me.weaponswitch;
		let success = true;
		// don't use packet casting with summons - or boing
		const usePacket = ([
			sdk.skills.Valkyrie, sdk.skills.Decoy, sdk.skills.RaiseSkeleton, sdk.skills.ClayGolem, sdk.skills.RaiseSkeletalMage, sdk.skills.BloodGolem, sdk.skills.Shout,
			sdk.skills.IronGolem, sdk.skills.Revive, sdk.skills.Werewolf, sdk.skills.Werebear, sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.PoisonCreeper, sdk.skills.BattleOrders,
			sdk.skills.SummonDireWolf, sdk.skills.Grizzly, sdk.skills.HeartofWolverine, sdk.skills.SpiritofBarbs, sdk.skills.ShadowMaster, sdk.skills.ShadowWarrior, sdk.skills.BattleCommand,
		].indexOf(skillId) === -1);
		(typeof x !== "number" || typeof y !== "number") && ({x, y} = me);

		try {
			!dontSwitch && me.switchWeapons(this.getBetterSlot(skillId));
			if (me.getSkill(sdk.skills.get.RightId) !== skillId && !me.setSkill(skillId, sdk.skills.hand.Right)) throw new Error("Failed to set " + getSkillById(skillId) + " on hand");
			if ([sdk.skills.Shout, sdk.skills.BattleOrders, sdk.skills.BattleCommand].includes(skillId)) return this.warCries(skillId, x, y);

			if (Config.PacketCasting > 1 || usePacket) {
				Config.DebugMode && console.debug("Packet casting: " + skillId);
				
				switch (typeof x) {
				case "number":
					Packet.castSkill(sdk.skills.hand.Right, x, y);

					break;
				case "object":
					Packet.unitCast(sdk.skills.hand.Right, x);

					break;
				}
				delay(250);
			} else {
				// Right hand + No Shift
				let clickType = 3, shift = sdk.clicktypes.shift.NoShift;

				MainLoop:
				for (let n = 0; n < 3; n += 1) {
					typeof x === "object" ? clickMap(clickType, shift, x) : clickMap(clickType, shift, x, y);
					delay(20);
					typeof x === "object" ? clickMap(clickType + 2, shift, x) : clickMap(clickType + 2, shift, x, y);

					for (let i = 0; i < 8; i += 1) {
						if (me.attacking) {
							break MainLoop;
						}

						delay(20);
					}
				}

				while (me.attacking) {
					delay(10);
				}
			}

			// account for lag, state 121 doesn't kick in immediately
			if (Skill.isTimed(skillId)) {
				for (let i = 0; i < 10; i += 1) {
					if ([sdk.player.mode.GettingHit, sdk.player.mode.Blocking].includes(me.mode) || me.skillDelay) {
						break;
					}

					delay(10);
				}
			}
		} catch (e) {
			console.error(e);
			success = false;
		}

		!dontSwitch && me.switchWeapons(swap);

		return success;
	};

	this.summon = function (skillId, minionType) {
		if (!Skill.canUse(skillId)) return false;

		let rv, retry = 0;
		let count = Skill.getMaxSummonCount(skillId);

		while (me.getMinionCount(minionType) < count) {
			rv = true;

			if (retry > count * 2) {
				if (me.inTown) {
					Town.heal() && me.cancelUIFlags();
					Town.move("portalspot");
					Skill.cast(skillId, sdk.skills.hand.Right, me.x, me.y);
				} else {
					let coord = CollMap.getRandCoordinate(me.x, -6, 6, me.y, -6, 6);

					// Keep bots from getting stuck trying to summon
					if (!!coord && Attack.validSpot(coord.x, coord.y)) {
						Pather.moveTo(coord.x, coord.y);
						Skill.cast(skillId, sdk.skills.hand.Right, me.x, me.y);
					}
				}

				if (me.getMinionCount(minionType) === count) {
					return true;
				} else {
					console.warn("Failed to summon minion " + skillId);

					return false;
				}
			}

			// todo - only delay if we are close to the mana amount we need based on our mana regen rate or potion state
			// also take into account surrounding mobs so we don't delay for mana in the middle of a mob pack
			if (Skill.getManaCost(skillId) > me.mp) {
				if (!Misc.poll(() => me.mp >= Skill.getManaCost(skillId), 500, 100)) {
					retry++;
					continue;
				}
			}

			let coord = CollMap.getRandCoordinate(me.x, -4, 4, me.y, -4, 4);

			if (!!coord && Attack.validSpot(coord.x, coord.y)) {
				Skill.cast(skillId, sdk.skills.hand.Right, coord.x, coord.y);

				if (me.getMinionCount(minionType) === count) {
					break;
				} else {
					retry++;
				}
			}

			delay(200);
		}

		return !!rv;
	};

	this.enchant = function () {
		let unit, slot = me.weaponswitch, chanted = [];

		me.switchWeapons(this.getBetterSlot(sdk.skills.Enchant));

		// Player
		unit = Game.getPlayer();

		if (unit) {
			do {
				if (!unit.dead && Misc.inMyParty(unit.name) && unit.distance <= 40) {
					Skill.cast(sdk.skills.Enchant, sdk.skills.hand.Right, unit);
					chanted.push(unit.name);
				}
			} while (unit.getNext());
		}

		// Minion
		unit = Game.getMonster();

		if (unit) {
			do {
				if (unit.getParent() && chanted.includes(unit.getParent().name) && unit.distance <= 40) {
					Skill.cast(sdk.skills.Enchant, sdk.skills.hand.Right, unit);
				}
			} while (unit.getNext());
		}

		me.switchWeapons(slot);

		return true;
	};

	// should the config check still be included even though its part of Skill.init?
	// todo: durations
	this.doPrecast = function (force = false) {
		if (!this.enabled) return false;

		while (!me.gameReady) {
			delay(40);
		}

		let [buffSummons, forceBo] = [false, false];

		// Force BO 30 seconds before it expires
		if (this.haveCTA > -1) {
			forceBo = (force
				|| (getTickCount() - this.skills.battleOrders.tick >= this.skills.battleOrders.duration - 30000)
				|| !me.getState(sdk.states.BattleCommand));
			forceBo && this.precastCTA(forceBo);
		}

		const needToCast = (state) => (force || !me.getState(state));

		switch (me.classid) {
		case sdk.player.class.Amazon:
			Skill.canUse(sdk.skills.Valkyrie) && (buffSummons = this.summon(sdk.skills.Valkyrie, sdk.summons.type.Valkyrie));

			break;
		case sdk.player.class.Sorceress:
			if (Skill.canUse(sdk.skills.ThunderStorm) && needToCast(sdk.states.ThunderStorm)) {
				this.cast(sdk.skills.ThunderStorm);
			}

			if (Skill.canUse(sdk.skills.EnergyShield) && needToCast(sdk.states.EnergyShield)) {
				this.cast(sdk.skills.EnergyShield);
			}

			if (Config.UseColdArmor) {
				let choosenSkill = (typeof Config.UseColdArmor === "number" && Skill.canUse(Config.UseColdArmor)
					? Config.UseColdArmor
					: (Precast.skills.coldArmor.best || -1));
				
				if (Precast.skills.coldArmor.tick > 0 && Precast.skills.coldArmor.duration > Time.seconds(45)) {
					if (getTickCount() - Precast.skills.coldArmor.tick >= Precast.skills.coldArmor.duration - Time.seconds(30)) {
						force = true;
					}
				}
				switch (choosenSkill) {
				case sdk.skills.FrozenArmor:
					if (needToCast(sdk.states.FrozenArmor)) {
						Precast.cast(sdk.skills.FrozenArmor) && (Precast.skills.coldArmor.tick = getTickCount());
					}

					break;
				case sdk.skills.ChillingArmor:
					if (needToCast(sdk.states.ChillingArmor)) {
						Precast.cast(sdk.skills.ChillingArmor) && (Precast.skills.coldArmor.tick = getTickCount());
					}

					break;
				case sdk.skills.ShiverArmor:
					if (needToCast(sdk.states.ShiverArmor)) {
						Precast.cast(sdk.skills.ShiverArmor) && (Precast.skills.coldArmor.tick = getTickCount());
					}

					break;
				default:
					break;
				}
			}

			if (Skill.canUse(sdk.skills.Enchant) && needToCast(sdk.states.Enchant)) {
				this.enchant();
			}

			break;
		case sdk.player.class.Necromancer:
			if (Skill.canUse(sdk.skills.BoneArmor)
				&& (force || this.skills.boneArmor.armorPercent() < 75 || !me.getState(sdk.states.BoneArmor))) {
				this.cast(sdk.skills.BoneArmor);
				this.skills.boneArmor.max === 0 && (this.skills.boneArmor.max = me.getStat(sdk.stats.SkillBoneArmorMax));
			}

			(() => {
				switch (Config.Golem) {
				case 1:
				case "Clay":
					return this.summon(sdk.skills.ClayGolem, sdk.summons.type.Golem);
				case 2:
				case "Blood":
					return this.summon(sdk.skills.BloodGolem, sdk.summons.type.Golem);
				case 3:
				case "Fire":
					return this.summon(sdk.skills.FireGolem, sdk.summons.type.Golem);
				case 0:
				case "None":
				default:
					return false;
				}
			})();

			break;
		case sdk.player.class.Paladin:
			if (Skill.canUse(sdk.skills.HolyShield) && Precast.skills.holyShield.canUse && needToCast(sdk.states.HolyShield)) {
				this.cast(sdk.skills.HolyShield);
			}

			break;
		case sdk.player.class.Barbarian: // - TODO: durations
			if (!Config.UseWarcries) {
				break;
			}
			let needShout = (Skill.canUse(sdk.skills.Shout) && needToCast(sdk.states.Shout));
			let needBo = (Skill.canUse(sdk.skills.BattleOrders) && needToCast(sdk.states.BattleOrders));
			let needBc = (Skill.canUse(sdk.skills.BattleCommand) && needToCast(sdk.states.BattleCommand));

			if (needShout || needBo || needBc) {
				let primary = Attack.getPrimarySlot();
				let { x, y } = me;
				(needBo || needBc) && me.switchWeapons(this.getBetterSlot(sdk.skills.BattleOrders));

				needBc && this.cast(sdk.skills.BattleCommand, x, y, true);
				needBo && this.cast(sdk.skills.BattleOrders, x, y, true);
				needShout && this.cast(sdk.skills.Shout, x, y, true);

				me.weaponswitch !== primary && me.switchWeapons(primary);
			}

			break;
		case sdk.player.class.Druid:
			if (Skill.canUse(sdk.skills.CycloneArmor) && needToCast(sdk.states.CycloneArmor)) {
				this.cast(sdk.skills.CycloneArmor);
			}

			Skill.canUse(sdk.skills.Raven) && this.summon(sdk.skills.Raven, sdk.summons.type.Raven);

			buffSummons = (() => {
				switch (Config.SummonAnimal) {
				case 1:
				case "Spirit Wolf":
					return (this.summon(sdk.skills.SummonSpiritWolf, sdk.summons.type.SpiritWolf) || buffSummons);
				case 2:
				case "Dire Wolf":
					return (this.summon(sdk.skills.SummonDireWolf, sdk.summons.type.DireWolf) || buffSummons);
				case 3:
				case "Grizzly":
					return (this.summon(sdk.skills.SummonGrizzly, sdk.summons.type.Grizzly) || buffSummons);
				default:
					return buffSummons;
				}
			})();

			buffSummons = (() => {
				switch (Config.SummonVine) {
				case 1:
				case "Poison Creeper":
					return (this.summon(sdk.skills.PoisonCreeper, sdk.summons.type.Vine) || buffSummons);
				case 2:
				case "Carrion Vine":
					return (this.summon(sdk.skills.CarrionVine, sdk.summons.type.Vine) || buffSummons);
				case 3:
				case "Solar Creeper":
					return (this.summon(sdk.skills.SolarCreeper, sdk.summons.type.Vine) || buffSummons);
				default:
					return buffSummons;
				}
			})();

			buffSummons = (() => {
				switch (Config.SummonSpirit) {
				case 1:
				case "Oak Sage":
					return (this.summon(sdk.skills.OakSage, sdk.summons.type.Spirit) || buffSummons);
				case 2:
				case "Heart of Wolverine":
					return (this.summon(sdk.skills.HeartofWolverine, sdk.summons.type.Spirit) || buffSummons);
				case 3:
				case "Spirit of Barbs":
					return this.summon(sdk.skills.SpiritofBarbs, sdk.summons.type.Spirit) || buffSummons;
				default:
					return buffSummons;
				}
			})();

			if (Skill.canUse(sdk.skills.Hurricane) && needToCast(sdk.states.Hurricane)) {
				this.cast(sdk.skills.Hurricane);
			}

			break;
		case sdk.player.class.Assassin:
			if (Skill.canUse(sdk.skills.Fade) && needToCast(sdk.states.Fade)) {
				this.cast(sdk.skills.Fade);
			}

			if (Skill.canUse(sdk.skills.Venom) && needToCast(sdk.states.Venom)) {
				this.cast(sdk.skills.Venom);
			}

			if (Skill.canUse(sdk.skills.BladeShield) && needToCast(sdk.states.BladeShield)) {
				this.cast(sdk.skills.BladeShield);
			}

			if (!Config.UseFade && Skill.canUse(sdk.skills.BurstofSpeed) && needToCast(sdk.states.BurstofSpeed)) {
				this.cast(sdk.skills.BurstofSpeed);
			}

			buffSummons = (() => {
				switch (Config.SummonShadow) {
				case 1:
				case "Warrior":
					return this.summon(sdk.skills.ShadowWarrior, sdk.summons.type.Shadow);
				case 2:
				case "Master":
					return this.summon(sdk.skills.ShadowMaster, sdk.summons.type.Shadow);
				default:
					return false;
				}
			})();

			break;
		}

		buffSummons && this.haveCTA > -1 && this.precastCTA(force);
		me.switchWeapons(Attack.getPrimarySlot());

		return true;
	};

	this.needOutOfTownCast = function () {
		return Skill.canUse(sdk.skills.Shout) || Skill.canUse(sdk.skills.BattleOrders) || Precast.checkCTA();
	};

	this.doRandomPrecast = function (force = false, goToWhenDone = undefined) {
		let returnTo = (goToWhenDone && typeof goToWhenDone === "number" ? goToWhenDone : me.area);

		try {
			// Only do this is you are a barb or actually have a cta. Otherwise its just a waste of time and you can precast in town
			if (Precast.needOutOfTownCast()) {
				Pather.useWaypoint("random") && Precast.doPrecast(force);
			} else {
				Precast.doPrecast(force);
			}
			Pather.useWaypoint(returnTo);
		} catch (e) {
			console.error(e);
		} finally {
			if (me.area !== returnTo && (!Pather.useWaypoint(returnTo) || !Pather.useWaypoint(sdk.areas.townOf(me.area)))) {
				Pather.journeyTo(returnTo);
			}
		}

		return (me.area === returnTo);
	};
};
