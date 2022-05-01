/**
*	@filename	Precast.js
*	@author		noah-, kolton, theBGuy
*	@desc		handle player prebuff sequence
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
		Valkyrie: false,
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

	this.precastCTA = function (force) {
		if (this.haveCTA === -1 || me.classic || me.barbarian || me.inTown || me.shapeshifted) return false;
		if (!force && me.getState(sdk.states.BattleOrders)) return true;

		if (this.haveCTA > -1) {
			let slot = me.weaponswitch;
			let x = me.x, y = me.y;

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

		let classid, skillTab,
			sumCurr = 0,
			sumSwap = 0;

		switch (skillId) {
		case 40: // Frozen Armor
		case 50: // Shiver Armor
		case 60: // Chilling Armor
			classid = 1;
			skillTab = 10;

			break;
		case 52: // Enchant
			classid = 1;
			skillTab = 8;

			break;
		case 57: // Thunder Storm
		case 58: // Energy Shield
			classid = 1;
			skillTab = 9;

			break;
		case 68: // Bone Armor
			classid = 2;
			skillTab = 17;

			break;
		case 117: // Holy Shield
			classid = 3;
			skillTab = 24;

			break;
		case 138: // Shout
		case 149: // Battle Orders
		case 155: // Battle Command
			classid = 4;
			skillTab = 34;

			break;
		case 235: // Cyclone Armor
			classid = 5;
			skillTab = 42;

			break;
		case 258: // Burst of Speed
		case 267: // Fade
			classid = 6;
			skillTab = 49;

			break;
		case 277: // Blade Shield
			classid = 6;
			skillTab = 48;

			break;
		default:
			return me.weaponswitch;
		}

		me.weaponswitch !== 0 && me.switchWeapons(0);

		me.getItemsEx()
			.filter(item => item.isEquipped && [4, 5, 11, 12].includes(item.bodylocation))
			.forEach(function (item) {
				if (item.bodylocation === 4 || item.bodylocation === 5) {
					sumCurr += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
					return;
				}

				if (item.bodylocation === 11 || item.bodylocation === 12) {
					sumSwap += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
					return;
				}
			});

		this.bestSlot[skillId] = (sumSwap > sumCurr) ? me.weaponswitch ^ 1 : me.weaponswitch;
		return this.bestSlot[skillId];
	};

	// re-wrote this, as we've already established
	// - we have this skill and wereform check. If we call Skill.cast -> calling cast -> we do this again -> calling setSkill -> we do this again
	// which is just a waste
	this.precastSkill = function (skillId, x, y, dontSwitch = false) {
		if (!skillId || !Skill.wereFormCheck(skillId) || (me.inTown && !Skill.townSkill(skillId))) return false;
		if (Skill.getManaCost(skillId) > me.mp) return false;

		let swap = me.weaponswitch;
		let success = true;
		// don't use packet casting with summons
		let usePacket = ([
			sdk.skills.Valkyrie, sdk.skills.Decoy, sdk.skills.RaiseSkeleton, sdk.skills.ClayGolem, sdk.skills.RaiseSkeletalMage, sdk.skills.BloodGolem,
			sdk.skills.IronGolem, sdk.skills.Revive, sdk.skills.Werewolf, sdk.skills.Werebear, sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.PoisonCreeper,
			sdk.skills.SummonDireWolf, sdk.skills.Grizzly, sdk.skills.HeartofWolverine, sdk.skills.SpiritofBarbs, sdk.skills.ShadowMaster, sdk.skills.ShadowWarrior
		].indexOf(skillId) === -1);
		x === undefined && (x = me.x);
		y === undefined && (y = me.y);

		try {
			!dontSwitch && me.switchWeapons(this.getBetterSlot(skillId));
			if (me.getSkill(2) !== skillId && !me.setSkill(skillId, 0)) throw new Error("Failed to set skill on hand");

			if (Config.PacketCasting > 1 || usePacket) {
				switch (typeof x) {
				case "number":
					Packet.castSkill(0, x, y);

					break;
				case "object":
					Packet.unitCast(0, x);

					break;
				}
				// make sure we give enough time back so we don't fail our next cast
				delay(1 + seconds(me.castingDuration(skillId)));
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
			console.warn(e);
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

		// Force BO 30 seconds before it expires
		this.haveCTA > -1 && this.precastCTA(!me.getState(sdk.states.BattleCommand) || force || (getTickCount() - this.BOTick >= this.BODuration - 30000));

		switch (me.classid) {
		case sdk.charclass.Amazon:
			Config.SummonValkyrie && Precast.precastables.Valkyrie && (buffSummons = this.summon(sdk.skills.Valkyrie, sdk.minions.Valkyrie));
			buffSummons && this.precastCTA(force);

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
			if ((Precast.precastables.Shout.have && (!me.getState(sdk.states.Shout) || force))
				|| (Precast.precastables.BattleOrders.have && (!me.getState(sdk.states.BattleOrders) || force))
				|| (Precast.precastables.BattleCommand.have && (!me.getState(sdk.states.BattleCommand) || force))) {
				let swap = me.weaponswitch;

				if (Precast.precastables.BattleCommand.have && (!me.getState(sdk.states.BattleCommand) || force)) {
					this.precastSkill(sdk.skills.BattleCommand, 0);
				}

				if (Precast.precastables.BattleOrders.have && (!me.getState(sdk.states.BattleOrders) || force)) {
					this.precastSkill(sdk.skills.BattleOrders, 0);
				}

				if (Precast.precastables.Shout.have && (!me.getState(sdk.states.Shout) || force)) {
					this.precastSkill(sdk.skills.Shout, 0);
				}

				me.switchWeapons(swap);
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

			buffSummons && this.precastCTA(force);

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

			buffSummons && this.precastCTA(force);

			break;
		}

		me.switchWeapons(Attack.getPrimarySlot());

		return true;
	};

	this.checkCTA = function () {
		if (this.haveCTA > -1 || me.barbarian) return true;

		let check = me.checkItem({name: sdk.locale.items.CalltoArms, equipped: true});

		if (check.have) {
			switch (check.item.bodylocation) {
			case 4:
			case 5:
				this.haveCTA = me.weaponswitch;

				return true;
			case 11:
			case 12:
				this.haveCTA = me.weaponswitch ^ 1;

				return true;
			}
		}

		return false;
	};

	this.summon = function (skillId, minionType) {
		if (!me.getSkill(skillId, 1)) return false;

		let rv, retry = 0, count = 1;

		switch (skillId) {
		case sdk.skills.Raven:
			count = Math.min(me.getSkill(skillId, 1), 5);

			break;
		case sdk.skills.SummonSpiritWolf:
			count = Math.min(me.getSkill(skillId, 1), 5);

			break;
		case sdk.skills.SummonDireWolf:
			count = Math.min(me.getSkill(skillId, 1), 3);

			break;
		}

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

		me.switchWeapons(this.getBetterSlot(52));

		// Player
		unit = getUnit(0);

		if (unit) {
			do {
				if (!unit.dead && Misc.inMyParty(unit.name) && getDistance(me, unit) <= 40) {
					Skill.cast(52, 0, unit);
					chanted.push(unit.name);
				}
			} while (unit.getNext());
		}

		// Minion
		unit = getUnit(1);

		if (unit) {
			do {
				if (unit.getParent() && chanted.indexOf(unit.getParent().name) > -1 && getDistance(me, unit) <= 40) {
					Skill.cast(52, 0, unit);
				}
			} while (unit.getNext());
		}

		me.switchWeapons(slot);

		return true;
	};

	this.doRandomPrecast = function (force = false, goToWhenDone = undefined) {
		let returnTo = (goToWhenDone && typeof goToWhenDone === "number" ? goToWhenDone : me.area);

		try {
			Pather.useWaypoint("random") && Precast.doPrecast(force);
			Pather.useWaypoint(returnTo);
		} catch (e) {
			console.warn(e);
		} finally {
			if (me.area !== returnTo && (!Pather.useWaypoint(returnTo) || !Pather.useWaypoint(sdk.areas.townOf(me.area)))) {
				Pather.journeyTo(returnTo);
			}
		}

		return (me.area === returnTo);
	};
};
