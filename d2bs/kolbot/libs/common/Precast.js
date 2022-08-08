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
	this.precastables = {
		// Not sure how I want to handle cold armors
		coldArmor: {
			best: false,
			duration: 0,
			tick: 0
		},
		HolyShield: {
			canUse: false,
			duration: 0,
			tick: 0
		},
		Shout: {
			duration: 0,
			tick: 0
		},
		BattleOrders: {
			duration: 0,
			tick: 0
		},
		BattleCommand: {
			duration: 0,
			tick: 0
		},
	};

	this.precastCTA = function (force = false) {
		if (this.haveCTA === -1 || me.classic || me.barbarian || me.inTown || me.shapeshifted) return false;
		if (!force && me.getState(sdk.states.BattleOrders)) return true;

		if (this.haveCTA > -1) {
			let slot = me.weaponswitch;
			let {x, y} = me;

			me.switchWeapons(this.haveCTA);
			this.precastSkill(sdk.skills.BattleCommand, x, y, true);
			this.precastSkill(sdk.skills.BattleCommand, x, y, true);
			this.precastSkill(sdk.skills.BattleOrders, x, y, true);

			this.precastables.BattleOrders.tick = getTickCount();
			// does this need to be re-calculated everytime? if no autobuild should really just be done when we initialize
			!this.precastables.BattleOrders.duration && (this.precastables.BattleOrders.duration = Skill.getDuration(sdk.skills.BattleOrders));

			me.switchWeapons(slot);

			return true;
		}

		return false;
	};

	// should be done in init function?
	// should this be part of the skill class instead?
	this.getBetterSlot = function (skillId) {
		if (this.bestSlot[skillId] !== undefined) {
			return this.bestSlot[skillId];
		}

		let classid, skillTab;

		switch (skillId) {
		case sdk.skills.FrozenArmor:
		case sdk.skills.ShiverArmor:
		case sdk.skills.ChillingArmor:
			classid = sdk.player.class.Sorceress;
			skillTab = sdk.skills.tabs.Cold;

			break;
		case sdk.skills.Enchant:
			classid = sdk.player.class.Sorceress;
			skillTab = sdk.skills.tabs.Fire;

			break;
		case sdk.skills.ThunderStorm:
		case sdk.skills.EnergyShield:
			classid = sdk.player.class.Sorceress;
			skillTab = sdk.skills.tabs.Lightning;

			break;
		case sdk.skills.BoneArmor:
			classid = sdk.player.class.Necromancer;
			skillTab = sdk.skills.tabs.PoisonandBone;

			break;
		case sdk.skills.HolyShield:
			classid = sdk.player.class.Paladin;
			skillTab = sdk.skills.tabs.PalaCombat;

			break;
		case sdk.skills.Taunt:
		case sdk.skills.FindItem:
		case sdk.skills.BattleCry:
		case sdk.skills.WarCry:
		case sdk.skills.Shout:
		case sdk.skills.BattleOrders:
		case sdk.skills.BattleCommand:
			classid = sdk.player.class.Barbarian;
			skillTab = sdk.skills.tabs.Warcries;

			break;
		case sdk.skills.CycloneArmor:
			classid = sdk.player.class.Druid;
			skillTab = sdk.skills.tabs.Elemental;

			break;
		case sdk.skills.Werewolf:
		case sdk.skills.Werebear:
			classid = sdk.player.class.Druid;
			skillTab = sdk.skills.tabs.ShapeShifting;
			
			break;
		case sdk.skills.BurstofSpeed:
		case sdk.skills.Fade:
			classid = sdk.player.class.Assassin;
			skillTab = sdk.skills.tabs.ShadowDisciplines;

			break;
		case sdk.skills.BladeShield:
			classid = sdk.player.class.Assassin;
			skillTab = sdk.skills.tabs.MartialArts;

			break;
		default:
			return me.weaponswitch;
		}

		me.weaponswitch !== 0 && me.switchWeapons(0);

		let sumCurr = 0;
		let sumSwap = 0;
		let sumStats = function (item) {
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

	this.precastSkill = function (skillId, x = me.x, y = me.y, dontSwitch = false) {
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

	// should the config check still be included even though its part of Skill.init?
	// todo: durations
	this.doPrecast = function (force = false) {
		if (!this.enabled) return false;

		while (!me.gameReady) {
			delay(40);
		}

		let buffSummons = false;
		let forceBo = false;

		// Force BO 30 seconds before it expires
		if (this.haveCTA > -1) {
			forceBo = (force
				|| (getTickCount() - this.precastables.BattleOrders.tick >= this.precastables.BattleOrders.duration - 30000)
				|| !me.getState(sdk.states.BattleCommand));
			forceBo && this.precastCTA(forceBo);
		}

		switch (me.classid) {
		case sdk.player.class.Amazon:
			Skill.canUse(sdk.skills.Valkyrie) && (buffSummons = this.summon(sdk.skills.Valkyrie, sdk.summons.type.Valkyrie));

			break;
		case sdk.player.class.Sorceress:
			if (Skill.canUse(sdk.skills.ThunderStorm) && (force || !me.getState(sdk.states.ThunderStorm))) {
				this.precastSkill(sdk.skills.ThunderStorm);
			}

			if (Skill.canUse(sdk.skills.EnergyShield) && (force || !me.getState(sdk.states.EnergyShield))) {
				this.precastSkill(sdk.skills.EnergyShield);
			}

			if (Config.UseColdArmor) {
				let choosenSkill = (typeof Config.UseColdArmor === "number" && Skill.canUse(Config.UseColdArmor)
					? Config.UseColdArmor
					: (Precast.precastables.coldArmor.best || -1));
				
				if (Precast.precastables.coldArmor.tick > 0 && Precast.precastables.coldArmor.duration > Time.seconds(45)) {
					if (getTickCount() - Precast.precastables.coldArmor.tick >= Precast.precastables.coldArmor.duration - Time.seconds(30)) {
						force = true;
					}
				}
				switch (choosenSkill) {
				case sdk.skills.FrozenArmor:
					if (force || !me.getState(sdk.states.FrozenArmor)) {
						Precast.precastSkill(sdk.skills.FrozenArmor) && (Precast.precastables.coldArmor.tick = getTickCount());
					}

					break;
				case sdk.skills.ChillingArmor:
					if (force || !me.getState(sdk.states.ChillingArmor)) {
						Precast.precastSkill(sdk.skills.ChillingArmor) && (Precast.precastables.coldArmor.tick = getTickCount());
					}

					break;
				case sdk.skills.ShiverArmor:
					if (force || !me.getState(sdk.states.ShiverArmor)) {
						Precast.precastSkill(sdk.skills.ShiverArmor) && (Precast.precastables.coldArmor.tick = getTickCount());
					}

					break;
				default:
					break;
				}
			}

			if (Skill.canUse(sdk.skills.Enchant) && (force || !me.getState(sdk.states.Enchant))) {
				this.enchant();
			}

			break;
		case sdk.player.class.Necromancer:
			if (Skill.canUse(sdk.skills.BoneArmor) && (force || !me.getState(sdk.states.BoneArmor))) {
				this.precastSkill(sdk.skills.BoneArmor);
			}

			switch (Config.Golem) {
			case 0:
			case "None":
				break;
			case 1:
			case "Clay":
				this.summon(sdk.skills.ClayGolem, sdk.summons.type.Golem);

				break;
			case 2:
			case "Blood":
				this.summon(sdk.skills.BloodGolem, sdk.summons.type.Golem);

				break;
			case 3:
			case "Fire":
				this.summon(sdk.skills.FireGolem, sdk.summons.type.Golem);

				break;
			}

			break;
		case sdk.player.class.Paladin:
			if (Skill.canUse(sdk.skills.HolyShield) && Precast.precastables.HolyShield.canUse && (force || !me.getState(sdk.states.HolyShield))) {
				this.precastSkill(sdk.skills.HolyShield);
			}

			break;
		case sdk.player.class.Barbarian: // - TODO: durations
			let needShout = (Skill.canUse(sdk.skills.Shout) && (force || !me.getState(sdk.states.Shout)));
			let needBo = (Skill.canUse(sdk.skills.BattleOrders) && (force || !me.getState(sdk.states.BattleOrders)));
			let needBc = (Skill.canUse(sdk.skills.BattleCommand) && (force || !me.getState(sdk.states.BattleCommand)));

			if (needShout || needBo || needBc) {
				let primary = Attack.getPrimarySlot();
				let {x, y} = me;
				(needBo || needBc) && me.switchWeapons(this.getBetterSlot(sdk.skills.BattleOrders));

				needBc && this.precastSkill(sdk.skills.BattleCommand, x, y, true);
				needBo && this.precastSkill(sdk.skills.BattleOrders, x, y, true);
				needShout && this.precastSkill(sdk.skills.Shout, x, y, true);

				me.weaponswitch !== primary && me.switchWeapons(primary);
			}

			break;
		case sdk.player.class.Druid:
			if (Skill.canUse(sdk.skills.CycloneArmor) && (force || !me.getState(sdk.states.CycloneArmor))) {
				this.precastSkill(sdk.skills.CycloneArmor);
			}

			Skill.canUse(sdk.skills.Raven) && this.summon(sdk.skills.Raven, sdk.summons.type.Raven);

			switch (Config.SummonAnimal) {
			case 1:
			case "Spirit Wolf":
				buffSummons = this.summon(sdk.skills.SummonSpiritWolf, sdk.summons.type.SpiritWolf) || buffSummons;

				break;
			case 2:
			case "Dire Wolf":
				buffSummons = this.summon(sdk.skills.SummonDireWolf, sdk.summons.type.DireWolf) || buffSummons;

				break;
			case 3:
			case "Grizzly":
				buffSummons = this.summon(sdk.skills.SummonGrizzly, sdk.summons.type.Grizzly) || buffSummons;

				break;
			}

			switch (Config.SummonVine) {
			case 1:
			case "Poison Creeper":
				buffSummons = this.summon(sdk.skills.PoisonCreeper, sdk.summons.type.Vine) || buffSummons;

				break;
			case 2:
			case "Carrion Vine":
				buffSummons = this.summon(sdk.skills.CarrionVine, sdk.summons.type.Vine) || buffSummons;

				break;
			case 3:
			case "Solar Creeper":
				buffSummons = this.summon(sdk.skills.SolarCreeper, sdk.summons.type.Vine) || buffSummons;

				break;
			}

			switch (Config.SummonSpirit) {
			case 1:
			case "Oak Sage":
				buffSummons = this.summon(sdk.skills.OakSage, sdk.summons.type.Spirit) || buffSummons;

				break;
			case 2:
			case "Heart of Wolverine":
				buffSummons = this.summon(sdk.skills.HeartofWolverine, sdk.summons.type.Spirit) || buffSummons;

				break;
			case 3:
			case "Spirit of Barbs":
				buffSummons = this.summon(sdk.skills.SpiritofBarbs, sdk.summons.type.Spirit) || buffSummons;

				break;
			}

			if (Skill.canUse(sdk.skills.Hurricane) && (force || !me.getState(sdk.states.Hurricane))) {
				this.precastSkill(sdk.skills.Hurricane);
			}

			break;
		case sdk.player.class.Assassin:
			if (Skill.canUse(sdk.skills.Fade) && (force || !me.getState(sdk.states.Fade))) {
				this.precastSkill(sdk.skills.Fade);
			}

			if (Skill.canUse(sdk.skills.Venom) && (force || !me.getState(sdk.states.Venom))) {
				this.precastSkill(sdk.skills.Venom);
			}

			if (Skill.canUse(sdk.skills.BladeShield) && (force || !me.getState(sdk.states.BladeShield))) {
				this.precastSkill(sdk.skills.BladeShield);
			}

			if (!Config.UseFade && Skill.canUse(sdk.skills.BurstofSpeed) && (force || !me.getState(sdk.states.BurstofSpeed))) {
				this.precastSkill(sdk.skills.BurstofSpeed);
			}

			switch (Config.SummonShadow) {
			case 1:
			case "Warrior":
				buffSummons = this.summon(sdk.skills.ShadowWarrior, sdk.summons.type.Shadow);

				break;
			case 2:
			case "Master":
				buffSummons = this.summon(sdk.skills.ShadowMaster, sdk.summons.type.Shadow);

				break;
			}

			break;
		}

		buffSummons && this.haveCTA > -1 && this.precastCTA(force);
		me.switchWeapons(Attack.getPrimarySlot());

		return true;
	};

	this.checkCTA = function () {
		if (this.haveCTA > -1) return true;

		let check = me.checkItem({name: sdk.locale.items.CalltoArms, equipped: true});

		if (check.have) {
			this.haveCTA = check.item.isOnSwap ? 1 : 0;
		}

		return this.haveCTA > -1;
	};

	this.summon = function (skillId, minionType) {
		if (!Skill.canUse(skillId)) return false;

		let rv, retry = 0;
		let count = Skill.getMaxSummonCount(skillId);

		while (me.getMinionCount(minionType) < count) {
			rv = true;

			if (retry > count * 2) {
				if (me.inTown) {
					if (Town.heal()) {
						delay(100 + me.ping);
						me.cancelUIFlags();
					}
					
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

			if (Skill.getManaCost(skillId) > me.mp) {
				delay(500);
				retry++;
				continue;
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
