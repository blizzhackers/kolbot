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

	this.precastCTA = function (force) {
		if (this.haveCTA === -1 || me.classic || me.barbarian || me.inTown || me.shapeshifted) {
			return false;
		}

		if (!force && me.getState(32)) {
			return true;
		}

		if (this.haveCTA > -1) {
			let slot = me.weaponswitch;

			Attack.weaponSwitch(this.haveCTA);
			Skill.cast(sdk.skills.BattleCommand, 0); // Battle Command
			Skill.cast(sdk.skills.BattleCommand, 0); // Battle Command
			Skill.cast(sdk.skills.BattleOrders, 0); // Battle Orders

			this.BODuration = (20 + me.getSkill(sdk.skills.BattleOrders, 1) * 10 + (me.getSkill(sdk.skills.Shout, 0) + me.getSkill(sdk.skills.BattleCommand, 0)) * 5) * 1000;
			this.BOTick = getTickCount();

			Attack.weaponSwitch(slot);

			return true;
		}

		return false;
	};

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

		me.weaponswitch !== 0 && Attack.weaponswitch(0);

		me.getItemsEx()
			.filter(item => [4, 5, 11, 12].includes(item.bodylocation))
			.forEach(function (item) {
				if (item.bodylocation === 4 || item.bodylocation === 5) {
					sumCurr += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
				}

				if (item.bodylocation === 11 || item.bodylocation === 12) {
					sumSwap += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
				}
			});

		this.bestSlot[skillId] = (sumSwap > sumCurr) ? me.weaponswitch ^ 1 : me.weaponswitch;
		return this.bestSlot[skillId];
	};

	this.precastSkill = function (skillId) {
		if (!skillId || !Skill.wereFormCheck(skillId)) return false;

		let swap = me.weaponswitch;

		Attack.weaponSwitch(this.getBetterSlot(skillId));
		Skill.cast(skillId, 0);
		Attack.weaponSwitch(swap);

		return true;
	};

	this.doPrecast = function (force) {
		let buffSummons = false;

		// Force BO 30 seconds before it expires
		if (this.haveCTA > -1) {
			this.precastCTA(!me.getState(sdk.states.BattleCommand) || force || (getTickCount() - this.BOTick >= this.BODuration - 30000));
		}

		switch (me.classid) {
		case sdk.charclass.Amazon:
			Config.SummonValkyrie && (buffSummons = this.summon(sdk.skills.Valkyrie, sdk.minions.Valkyrie));
			buffSummons && this.precastCTA(force);

			break;
		case sdk.charclass.Sorceress:
			if (me.getSkill(sdk.skills.ThunderStorm, 1) && (!me.getState(sdk.states.ThunderStorm) || force)) {
				this.precastSkill(sdk.skills.ThunderStorm);
			}

			if (Config.UseEnergyShield && me.getSkill(sdk.skills.EnergyShield, 0) && (!me.getState(sdk.states.EnergyShield) || force)) {
				this.precastSkill(sdk.skills.EnergyShield);
			}

			if (Config.UseColdArmor) {
				let choosenSkill = (typeof Config.UseColdArmor === "number" && me.getSkill(Config.UseColdArmor, 1)
					? Config.UseColdArmor
					: (function () {
						let coldArmor = [
							{skillId: sdk.skills.ShiverArmor, level: me.getSkill(sdk.skills.ShiverArmor, 1)},
							{skillId: sdk.skills.ChillingArmor, level: me.getSkill(sdk.skills.ChillingArmor, 1)},
							{skillId: sdk.skills.FrozenArmor, level: me.getSkill(sdk.skills.FrozenArmor, 1)},
						].filter(skill => skill.level > 0).sort((a, b) => b.level - a.level).first();
						return coldArmor !== undefined ? coldArmor.skillId : false;
					})());
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
				}
			}

			if (me.getSkill(sdk.skills.Enchant, 1) && (!me.getState(sdk.states.Enchant) || force)) {
				this.enchant();
			}

			break;
		case sdk.charclass.Necromancer:
			if (me.getSkill(sdk.skills.BoneArmor, 1) && (!me.getState(sdk.states.BoneArmor) || force)) {
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
			if (me.getSkill(sdk.skills.HolyShield, 1) && (!me.getState(sdk.states.HolyShield) || force)) {
				this.precastSkill(sdk.skills.HolyShield);
			}

			break;
		case sdk.charclass.Barbarian: // - TODO: BO duration
			if (((!me.getState(sdk.states.Shout) || force) && me.getSkill(sdk.skills.Shout, 1))
				|| ((!me.getState(sdk.states.BattleOrders) || force) && me.getSkill(sdk.skills.BattleOrders, 1))
				|| ((!me.getState(sdk.states.BattleCommand) || force) && me.getSkill(sdk.skills.BattleCommand, 1))) {
				let swap = me.weaponswitch;

				if (!me.getState(sdk.states.BattleCommand) || force) {
					this.precastSkill(sdk.skills.BattleCommand, 0);
				}

				if (!me.getState(sdk.states.BattleOrders) || force) {
					this.precastSkill(sdk.skills.BattleOrders, 0);
				}

				if (!me.getState(sdk.states.Shout) || force) {
					this.precastSkill(sdk.skills.Shout, 0);
				}

				Attack.weaponSwitch(swap);
			}

			break;
		case sdk.charclass.Druid:
			if (me.getSkill(sdk.skills.CycloneArmor, 1) && (!me.getState(sdk.states.CycloneArmor) || force)) {
				this.precastSkill(sdk.skills.CycloneArmor);
			}

			Config.SummonRaven && this.summon(sdk.skills.Raven, sdk.minions.Raven);

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

			if (me.getSkill(sdk.skills.Hurricane, 1) && (!me.getState(sdk.states.Hurricane) || force)) {
				this.precastSkill(sdk.skills.Hurricane);
			}

			buffSummons && this.precastCTA(force);

			break;
		case sdk.charclass.Assassin:
			if (me.getSkill(sdk.skills.Fade, 0) && Config.UseFade && (!me.getState(sdk.states.Fade) || force)) {
				this.precastSkill(sdk.skills.Fade);
			}

			if (me.getSkill(sdk.skills.Venom, 0) && Config.UseVenom && (!me.getState(sdk.states.Venom) || force)) {
				this.precastSkill(sdk.skills.Venom);
			}

			if (me.getSkill(sdk.skills.BladeShield, 0) && (!me.getState(sdk.states.BladeShield) || force)) {
				this.precastSkill(sdk.skills.BladeShield);
			}

			if (me.getSkill(sdk.skills.BurstofSpeed, 0) && !Config.UseFade && Config.UseBoS && (!me.getState(sdk.states.BurstofSpeed) || force)) {
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

		Attack.weaponSwitch(Attack.getPrimarySlot());
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
		if (!me.getSkill(skillId, 1)) {
			return false;
		}

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
						me.cancel();
					}
					
					Town.move("portalspot");
					Skill.cast(skillId, 0, me.x, me.y);
				} else {
					coord = CollMap.getRandCoordinate(me.x, -6, 6, me.y, -6, 6);

					// Keep bots from getting stuck trying to summon
					if (coord && Attack.validSpot(coord.x, coord.y)) {
						Pather.moveTo(coord.x, coord.y);
						Skill.cast(skillId, 0, me.x, me.y);
					}
				}

				if (me.getMinionCount(minionType) === count) {
					return true;
				} else {
					print("(Precast) :: Failed to summon minion " + skillId);
					return false;
				}
			}

			if (Skill.getManaCost(skillId) > me.mp) {
				delay(500);
				retry++;
				continue;
			}

			let coord = CollMap.getRandCoordinate(me.x, -4, 4, me.y, -4, 4);

			if (coord && Attack.validSpot(coord.x, coord.y)) {
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

		Attack.weaponSwitch(this.getBetterSlot(52));

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

		Attack.weaponSwitch(slot);

		return true;
	};
};
