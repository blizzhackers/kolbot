/**
*  @filename    Precast.js
*  @author      noah-, kolton, theBGuy
*  @desc        handle player prebuff sequence
*
*/

const Precast = new function () {
	this.haveCTA = -1;
	this.BODuration = 0;
	this.BOTick = 0;
	this.bestSlot = {};

	// TODO: build better method of keeping track of duration based skills so we can reduce resource usage
	// build obj -> figure out which skills we have -> calc duration -> assign tick of last casted -> track tick (background worker maybe?)
	// would reduce checking have skill and state calls, just let tick = getTickCount(); -> obj.some((el) => tick - el.lastTick > el.duration) -> true then cast
	// would probably make sense to just re-cast everything (except summons) if one of our skills is about to run out rather than do this process again 3 seconds later
	this.precastables = {
		// Amazon
		Decoy: false,
		Valkyrie: false,
		InnerSight: false,
		SlowMissiles: false,
		// Sorceress
		ThunderStorm: false,
		EnergyShield: false,
		// Not sure how I want to handle cold armors
		coldArmor: {
			best: false,
			duration: 0
		},
		Enchant: false,
		// Necromancer
		BoneArmor: false,
		ClayGolem: false,
		BloodGolem: false,
		FireGolem: false,
		// Paladin
		HolyShield: false,
		// Barbarian
		Shout: {
			have: false,
			duration: 0
		},
		BattleOrders: {
			have: false,
			duration: 0
		},
		BattleCommand: {
			have: false,
			duration: 0
		},
		// Druid
		CycloneArmor: false,
		Hurricane: false,
		Raven: false,
		SpiritWolf: false,
		DireWolf: false,
		Grizzly: false,
		PoisonCreeper: false,
		CarrionVine: false,
		SolarCreeper: false,
		OakSage: false,
		HeartofWolverine: false,
		SpiritofBarbs: false,
		// Assassin
		Fade: false,
		Venom: false,
		BladeShield: false,
		BurstofSpeed: false,
		ShadowWarrior: false,
		ShadowMaster: false
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

			this.BOTick = getTickCount();
			// does this need to be re-calculated everytime? if no autobuild should really just be done when we initialize
			!this.BODuration && (this.BODuration = Skill.getDuration(sdk.skills.BattleOrders));

			me.switchWeapons(slot);

			return true;
		}

		return false;
	};

	// should be done in init function?
	this.getBetterSlot = function (skillId) {
		if (this.bestSlot[skillId] !== undefined) {
			return this.bestSlot[skillId];
		}

		let classid, skillTab;
		let sumCurr = 0;
		let sumSwap = 0;

		switch (skillId) {
		case sdk.skills.FrozenArmor:
		case sdk.skills.ShiverArmor:
		case sdk.skills.ChillingArmor:
			classid = sdk.charclass.Sorceress;
			skillTab = sdk.skills.tabs.Cold;

			break;
		case sdk.skills.Enchant:
			classid = sdk.charclass.Sorceress;
			skillTab = sdk.skills.tabs.Fire;

			break;
		case sdk.skills.ThunderStorm:
		case sdk.skills.EnergyShield:
			classid = sdk.charclass.Sorceress;
			skillTab = sdk.skills.tabs.Lightning;

			break;
		case sdk.skills.BoneArmor:
			classid = sdk.charclass.Necromancer;
			skillTab = sdk.skills.tabs.PoisonandBone;

			break;
		case sdk.skills.HolyShield:
			classid = sdk.charclass.Paladin;
			skillTab = sdk.skills.tabs.PalaCombat;

			break;
		case sdk.skills.Shout:
		case sdk.skills.BattleOrders:
		case sdk.skills.BattleCommand:
			classid = sdk.charclass.Barbarian;
			skillTab = sdk.skills.tabs.Warcries;

			break;
		case sdk.skills.CycloneArmor:
			classid = sdk.charclass.Druid;
			skillTab = sdk.skills.tabs.Elemental;

			break;
		case sdk.skills.BurstofSpeed:
		case sdk.skills.Fade:
			classid = sdk.charclass.Assassin;
			skillTab = sdk.skills.tabs.ShadowDisciplines;

			break;
		case sdk.skills.BladeShield:
			classid = sdk.charclass.Assassin;
			skillTab = sdk.skills.tabs.MartialArts;

			break;
		default:
			return me.weaponswitch;
		}

		me.weaponswitch !== 0 && me.switchWeapons(0);

		let sumStats = function (item) {
			return (item.getStat(sdk.stats.AllSkills)
				+ item.getStat(sdk.stats.AddClassSkills, classid) + item.getStat(sdk.stats.AddSkillTab, skillTab)
				+ item.getStat(sdk.stats.SingleSkill, skillId) + item.getStat(sdk.stats.NonClassSkill, skillId));
		};

		me.getItemsEx()
			.filter(item => item.isEquipped && [4, 5, 11, 12].includes(item.bodylocation))
			.forEach(function (item) {
				if (item.bodylocation === 4 || item.bodylocation === 5) {
					sumCurr += sumStats(item);
					return;
				}

				if (item.bodylocation === 11 || item.bodylocation === 12) {
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
		let usePacket = ([
			sdk.skills.Valkyrie, sdk.skills.Decoy, sdk.skills.RaiseSkeleton, sdk.skills.ClayGolem, sdk.skills.RaiseSkeletalMage, sdk.skills.BloodGolem, sdk.skills.Shout,
			sdk.skills.IronGolem, sdk.skills.Revive, sdk.skills.Werewolf, sdk.skills.Werebear, sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.PoisonCreeper, sdk.skills.BattleOrders,
			sdk.skills.SummonDireWolf, sdk.skills.Grizzly, sdk.skills.HeartofWolverine, sdk.skills.SpiritofBarbs, sdk.skills.ShadowMaster, sdk.skills.ShadowWarrior, sdk.skills.BattleCommand,
		].indexOf(skillId) === -1);
		typeof x !== "number" && (x = me.x);
		typeof y !== "number" && (y = me.y);

		try {
			!dontSwitch && me.switchWeapons(this.getBetterSlot(skillId));
			if (me.getSkill(2) !== skillId && !me.setSkill(skillId, 0)) throw new Error("Failed to set skill on hand");

			if (Config.PacketCasting > 1 || usePacket) {
				console.debug("Packet casting: " + skillId);
				
				switch (typeof x) {
				case "number":
					Packet.castSkill(0, x, y);

					break;
				case "object":
					Packet.unitCast(0, x);

					break;
				}
				delay(250);
			} else {
				// Right hand + No Shift
				let clickType = 3, shift = 0;

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
					if ([4, 9].includes(me.mode) || me.skillDelay) {
						break;
					}

					delay(10);
				}
			}
		} catch (e) {
			console.errorReport(e);
			success = false;
		}

		!dontSwitch && me.switchWeapons(swap);

		return success;
	};

	// should the config check still be included even though its part of Skill.init?
	// todo: durations
	this.doPrecast = function (force = false) {
		while (!me.gameReady) {
			delay(40);
		}

		let buffSummons = false;
		let forceBo = false;

		// Force BO 30 seconds before it expires
		if (this.haveCTA > -1) {
			forceBo = (force || (getTickCount() - this.BOTick >= this.BODuration - 30000) || !me.getState(sdk.states.BattleCommand));
			forceBo && this.precastCTA(forceBo);
		}

		switch (me.classid) {
		case sdk.charclass.Amazon:
			Config.SummonValkyrie && Precast.precastables.Valkyrie && (buffSummons = this.summon(sdk.skills.Valkyrie, sdk.minions.Valkyrie));

			break;
		case sdk.charclass.Sorceress:
			if (Precast.precastables.ThunderStorm && (!me.getState(sdk.states.ThunderStorm) || force)) {
				this.precastSkill(sdk.skills.ThunderStorm);
			}

			if (Config.UseEnergyShield && Precast.precastables.EnergyShield && (!me.getState(sdk.states.EnergyShield) || force)) {
				this.precastSkill(sdk.skills.EnergyShield);
			}

			if (Config.UseColdArmor) {
				let choosenSkill = (typeof Config.UseColdArmor === "number" && me.getSkill(Config.UseColdArmor, 1)
					? Config.UseColdArmor
					: (Precast.precastables.coldArmor.best || -1));
				switch (choosenSkill) {
				case sdk.skills.FrozenArmor:
					if (!me.getState(sdk.states.FrozenArmor) || force) {
						Precast.precastSkill(sdk.skills.FrozenArmor);
					}

					break;
				case sdk.skills.ChillingArmor:
					if (!me.getState(sdk.states.ChillingArmor) || force) {
						Precast.precastSkill(sdk.skills.ChillingArmor);
					}

					break;
				case sdk.skills.ShiverArmor:
					if (!me.getState(sdk.states.ShiverArmor) || force) {
						Precast.precastSkill(sdk.skills.ShiverArmor);
					}

					break;
				default:
					break;
				}
			}

			if (Precast.precastables.Enchant && (!me.getState(sdk.states.Enchant) || force)) {
				this.enchant();
			}

			break;
		case sdk.charclass.Necromancer:
			if (Precast.precastables.BoneArmor && (!me.getState(sdk.states.BoneArmor) || force)) {
				this.precastSkill(sdk.skills.BoneArmor);
			}

			switch (Config.Golem) {
			case 0:
			case "None":
				break;
			case 1:
			case "Clay":
				this.summon(sdk.skills.ClayGolem, sdk.minions.Golem);

				break;
			case 2:
			case "Blood":
				this.summon(sdk.skills.BloodGolem, sdk.minions.Golem);

				break;
			case 3:
			case "Fire":
				this.summon(sdk.skills.FireGolem, sdk.minions.Golem);

				break;
			}

			break;
		case sdk.charclass.Paladin:
			if (Precast.precastables.HolyShield && (!me.getState(sdk.states.HolyShield) || force)) {
				this.precastSkill(sdk.skills.HolyShield);
			}

			break;
		case sdk.charclass.Barbarian: // - TODO: durations
			let needShout = (Precast.precastables.Shout.have && (!me.getState(sdk.states.Shout) || force));
			let needBo = (Precast.precastables.BattleOrders.have && (!me.getState(sdk.states.BattleOrders) || force));
			let needBc = (Precast.precastables.Shout.have && (!me.getState(sdk.states.Shout) || force));

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
		case sdk.charclass.Druid:
			if (Precast.precastables.CycloneArmor && (!me.getState(sdk.states.CycloneArmor) || force)) {
				this.precastSkill(sdk.skills.CycloneArmor);
			}

			Config.SummonRaven && Precast.precastables.Raven && this.summon(sdk.skills.Raven, sdk.minions.Raven);

			switch (Config.SummonAnimal) {
			case 1:
			case "Spirit Wolf":
				buffSummons = this.summon(sdk.skills.SummonSpiritWolf, sdk.minions.SpiritWolf) || buffSummons;

				break;
			case 2:
			case "Dire Wolf":
				buffSummons = this.summon(sdk.skills.SummonDireWolf, sdk.minions.DireWolf) || buffSummons;

				break;
			case 3:
			case "Grizzly":
				buffSummons = this.summon(sdk.skills.SummonGrizzly, sdk.minions.Grizzly) || buffSummons;

				break;
			}

			switch (Config.SummonVine) {
			case 1:
			case "Poison Creeper":
				buffSummons = this.summon(sdk.skills.PoisonCreeper, sdk.minions.Vine) || buffSummons;

				break;
			case 2:
			case "Carrion Vine":
				buffSummons = this.summon(sdk.skills.CarrionVine, sdk.minions.Vine) || buffSummons;

				break;
			case 3:
			case "Solar Creeper":
				buffSummons = this.summon(sdk.skills.SolarCreeper, sdk.minions.Vine) || buffSummons;

				break;
			}

			switch (Config.SummonSpirit) {
			case 1:
			case "Oak Sage":
				buffSummons = this.summon(sdk.skills.OakSage, sdk.minions.Spirit) || buffSummons;

				break;
			case 2:
			case "Heart of Wolverine":
				buffSummons = this.summon(sdk.skills.HeartofWolverine, sdk.minions.Spirit) || buffSummons;

				break;
			case 3:
			case "Spirit of Barbs":
				buffSummons = this.summon(sdk.skills.SpiritofBarbs, sdk.minions.Spirit) || buffSummons;

				break;
			}

			if (Precast.precastables.Hurricane && (!me.getState(sdk.states.Hurricane) || force)) {
				this.precastSkill(sdk.skills.Hurricane);
			}

			break;
		case sdk.charclass.Assassin:
			if (Config.UseFade && Precast.precastables.Fade && (!me.getState(sdk.states.Fade) || force)) {
				this.precastSkill(sdk.skills.Fade);
			}

			if (Config.UseVenom && Precast.precastables.Venom && Config.UseVenom && (!me.getState(sdk.states.Venom) || force)) {
				this.precastSkill(sdk.skills.Venom);
			}

			if (Config.UseBladeShield && Precast.precastables.BladeShield && (!me.getState(sdk.states.BladeShield) || force)) {
				this.precastSkill(sdk.skills.BladeShield);
			}

			if (!Config.UseFade && Config.UseBoS && Precast.precastables.BurstofSpeed && (!me.getState(sdk.states.BurstofSpeed) || force)) {
				this.precastSkill(sdk.skills.BurstofSpeed);
			}

			switch (Config.SummonShadow) {
			case 1:
			case "Warrior":
				buffSummons = this.summon(sdk.skills.ShadowWarrior, sdk.minions.Shadow);

				break;
			case 2:
			case "Master":
				buffSummons = this.summon(sdk.skills.ShadowMaster, sdk.minions.Shadow);

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
			if (check.item.isOnSwap) {
				this.haveCTA = 1;
			} else {
				this.haveCTA = 0;
			}
		}

		return this.haveCTA > -1;
	};

	this.summon = function (skillId, minionType) {
		if (!me.getSkill(skillId, 1)) return false;

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
					Skill.cast(skillId, 0, me.x, me.y);
				} else {
					let coord = CollMap.getRandCoordinate(me.x, -6, 6, me.y, -6, 6);

					// Keep bots from getting stuck trying to summon
					if (!!coord && Attack.validSpot(coord.x, coord.y)) {
						Pather.moveTo(coord.x, coord.y);
						Skill.cast(skillId, 0, me.x, me.y);
					}
				}

				if (me.getMinionCount(minionType) === count) {
					return true;
				} else {
					console.debug("(Precast) :: Failed to summon minion " + skillId);

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
				Skill.cast(skillId, 0, coord.x, coord.y);

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
		unit = getUnit(0);

		if (unit) {
			do {
				if (!unit.dead && Misc.inMyParty(unit.name) && unit.distance <= 40) {
					Skill.cast(sdk.skills.Enchant, 0, unit);
					chanted.push(unit.name);
				}
			} while (unit.getNext());
		}

		// Minion
		unit = getUnit(1);

		if (unit) {
			do {
				if (unit.getParent() && chanted.indexOf(unit.getParent().name) > -1 && unit.distance <= 40) {
					Skill.cast(sdk.skills.Enchant, 0, unit);
				}
			} while (unit.getNext());
		}

		me.switchWeapons(slot);

		return true;
	};

	this.needOutOfTownCast = function () {
		return Precast.precastables.Shout.have || Precast.precastables.BattleOrders.have || Precast.checkCTA();
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
			console.errorReport(e);
		} finally {
			if (me.area !== returnTo && (!Pather.useWaypoint(returnTo) || !Pather.useWaypoint(sdk.areas.townOf(me.area)))) {
				Pather.journeyTo(returnTo);
			}
		}

		return (me.area === returnTo);
	};
};
