/**
*  @filename    Misc.js
*  @author      kolton, theBGuy
*  @desc        misc library containing Skill, Misc and Sort classes
*
*/

includeIfNotIncluded("common/Item.js");

const Skill = {
	usePvpRange: false,
	skills: {
		initialized: false,
		all: [],
		addSkills: function (skill, condition = () => true) {
			this.all[skill] = {
				hardpoints: false,
				checked: false,
				condition: condition,
				have: function () {
					if (!this.condition()) return false;
					if (skill === undefined) return false;
					if (this.hardpoints) return true;
					if (!this.checked) {
						this.hardpoints = !!me.getSkill(skill, sdk.skills.subindex.HardPoints);
						this.checked = true;
					}
					return (this.hardpoints || me.getSkill(skill, sdk.skills.subindex.SoftPoints));
				}
			};
		},
		init: function () {
			this.addSkills(sdk.skills.MagicArrow);
			this.addSkills(sdk.skills.FireArrow);
			this.addSkills(sdk.skills.InnerSight, () => Config.UseInnerSight);
			this.addSkills(sdk.skills.Jab);
			this.addSkills(sdk.skills.ColdArrow);
			this.addSkills(sdk.skills.MultipleShot);
			this.addSkills(sdk.skills.PowerStrike);
			this.addSkills(sdk.skills.PoisonJavelin);
			this.addSkills(sdk.skills.ExplodingArrow);
			this.addSkills(sdk.skills.SlowMissiles, () => Config.UseSlowMissiles);
			this.addSkills(sdk.skills.LightningBolt);
			this.addSkills(sdk.skills.IceArrow);
			this.addSkills(sdk.skills.GuidedArrow);
			this.addSkills(sdk.skills.ChargedStrike);
			this.addSkills(sdk.skills.Strafe);
			this.addSkills(sdk.skills.ImmolationArrow);
			this.addSkills(sdk.skills.Decoy, () => Config.UseDecoy);
			this.addSkills(sdk.skills.Fend);
			this.addSkills(sdk.skills.FreezingArrow);
			this.addSkills(sdk.skills.Valkyrie, () => Config.SummonValkyrie);
			this.addSkills(sdk.skills.LightningStrike);
			this.addSkills(sdk.skills.LightningFury);
			// sorceress skills start
			this.addSkills(sdk.skills.FireBolt);
			this.addSkills(sdk.skills.ChargedBolt);
			this.addSkills(sdk.skills.IceBolt);
			this.addSkills(sdk.skills.FrozenArmor);
			this.addSkills(sdk.skills.Inferno);
			this.addSkills(sdk.skills.StaticField);
			this.addSkills(sdk.skills.Telekinesis, () => Config.UseTelekinesis);
			this.addSkills(sdk.skills.FrostNova);
			this.addSkills(sdk.skills.IceBlast);
			this.addSkills(sdk.skills.Blaze);
			this.addSkills(sdk.skills.FireBall);
			this.addSkills(sdk.skills.Nova);
			this.addSkills(sdk.skills.Lightning);
			this.addSkills(sdk.skills.ShiverArmor);
			this.addSkills(sdk.skills.FireWall);
			this.addSkills(sdk.skills.Enchant);
			this.addSkills(sdk.skills.ChainLightning);
			this.addSkills(sdk.skills.Teleport);
			this.addSkills(sdk.skills.GlacialSpike);
			this.addSkills(sdk.skills.Meteor);
			this.addSkills(sdk.skills.ThunderStorm);
			this.addSkills(sdk.skills.EnergyShield, () => Config.UseEnergyShield);
			this.addSkills(sdk.skills.Blizzard);
			this.addSkills(sdk.skills.ChillingArmor);
			this.addSkills(sdk.skills.Hydra);
			this.addSkills(sdk.skills.FrozenOrb);
			// necromancer skills start
			this.addSkills(sdk.skills.AmplifyDamage);
			this.addSkills(sdk.skills.Teeth);
			this.addSkills(sdk.skills.BoneArmor);
			this.addSkills(sdk.skills.RaiseSkeleton);
			this.addSkills(sdk.skills.DimVision);
			this.addSkills(sdk.skills.Weaken);
			this.addSkills(sdk.skills.PoisonDagger);
			this.addSkills(sdk.skills.CorpseExplosion);
			this.addSkills(sdk.skills.ClayGolem);
			this.addSkills(sdk.skills.IronMaiden);
			this.addSkills(sdk.skills.Terror);
			this.addSkills(sdk.skills.BoneWall);
			this.addSkills(sdk.skills.RaiseSkeletalMage);
			this.addSkills(sdk.skills.Confuse);
			this.addSkills(sdk.skills.LifeTap);
			this.addSkills(sdk.skills.PoisonExplosion);
			this.addSkills(sdk.skills.BoneSpear);
			this.addSkills(sdk.skills.BloodGolem);
			this.addSkills(sdk.skills.Attract);
			this.addSkills(sdk.skills.Decrepify);
			this.addSkills(sdk.skills.BonePrison);
			this.addSkills(sdk.skills.IronGolem);
			this.addSkills(sdk.skills.LowerResist);
			this.addSkills(sdk.skills.PoisonNova);
			this.addSkills(sdk.skills.BoneSpirit);
			this.addSkills(sdk.skills.FireGolem);
			this.addSkills(sdk.skills.Revive);
			// paladin skills start
			this.addSkills(sdk.skills.Sacrifice);
			this.addSkills(sdk.skills.Smite);
			this.addSkills(sdk.skills.Might);
			this.addSkills(sdk.skills.Prayer);
			this.addSkills(sdk.skills.ResistFire);
			this.addSkills(sdk.skills.HolyBolt);
			this.addSkills(sdk.skills.HolyFire);
			this.addSkills(sdk.skills.Thorns);
			this.addSkills(sdk.skills.Defiance);
			this.addSkills(sdk.skills.ResistCold);
			this.addSkills(sdk.skills.Zeal);
			this.addSkills(sdk.skills.Charge, () => Config.Charge);
			this.addSkills(sdk.skills.BlessedAim);
			this.addSkills(sdk.skills.Cleansing);
			this.addSkills(sdk.skills.ResistLightning);
			this.addSkills(sdk.skills.Vengeance);
			this.addSkills(sdk.skills.BlessedHammer);
			this.addSkills(sdk.skills.Concentration);
			this.addSkills(sdk.skills.HolyFreeze);
			this.addSkills(sdk.skills.Vigor, () => Config.Vigor || me.inTown);
			this.addSkills(sdk.skills.Conversion);
			this.addSkills(sdk.skills.HolyShield);
			this.addSkills(sdk.skills.HolyShock);
			this.addSkills(sdk.skills.Sanctuary);
			this.addSkills(sdk.skills.Meditation);
			this.addSkills(sdk.skills.FistoftheHeavens);
			this.addSkills(sdk.skills.Fanaticism);
			this.addSkills(sdk.skills.Conviction);
			this.addSkills(sdk.skills.Redemption);
			this.addSkills(sdk.skills.Salvation);
			// barbarian skills start
			this.addSkills(sdk.skills.Bash);
			this.addSkills(sdk.skills.Howl);
			this.addSkills(sdk.skills.FindPotion);
			this.addSkills(sdk.skills.Leap);
			this.addSkills(sdk.skills.DoubleSwing);
			this.addSkills(sdk.skills.Taunt);
			this.addSkills(sdk.skills.Shout);
			this.addSkills(sdk.skills.Stun);
			this.addSkills(sdk.skills.DoubleThrow);
			this.addSkills(sdk.skills.FindItem, () => Config.FindItem);
			this.addSkills(sdk.skills.LeapAttack);
			this.addSkills(sdk.skills.BattleCry);
			this.addSkills(sdk.skills.Frenzy);
			this.addSkills(sdk.skills.BattleOrders);
			this.addSkills(sdk.skills.GrimWard);
			this.addSkills(sdk.skills.Whirlwind);
			this.addSkills(sdk.skills.Berserk);
			this.addSkills(sdk.skills.WarCry);
			this.addSkills(sdk.skills.BattleCommand);
			// druid skills start
			this.addSkills(sdk.skills.Raven, () => Config.SummonRaven);
			this.addSkills(sdk.skills.PoisonCreeper);
			this.addSkills(sdk.skills.Werewolf);
			this.addSkills(sdk.skills.Firestorm);
			this.addSkills(sdk.skills.OakSage);
			this.addSkills(sdk.skills.SpiritWolf);
			this.addSkills(sdk.skills.Werebear);
			this.addSkills(sdk.skills.MoltenBoulder);
			this.addSkills(sdk.skills.ArcticBlast);
			this.addSkills(sdk.skills.CarrionVine);
			this.addSkills(sdk.skills.FeralRage);
			this.addSkills(sdk.skills.Maul);
			this.addSkills(sdk.skills.Fissure);
			this.addSkills(sdk.skills.CycloneArmor);
			this.addSkills(sdk.skills.HeartofWolverine);
			this.addSkills(sdk.skills.SummonDireWolf);
			this.addSkills(sdk.skills.Rabies);
			this.addSkills(sdk.skills.FireClaws);
			this.addSkills(sdk.skills.Twister);
			this.addSkills(sdk.skills.SolarCreeper);
			this.addSkills(sdk.skills.Hunger);
			this.addSkills(sdk.skills.ShockWave);
			this.addSkills(sdk.skills.Volcano);
			this.addSkills(sdk.skills.Tornado);
			this.addSkills(sdk.skills.SpiritofBarbs);
			this.addSkills(sdk.skills.Grizzly);
			this.addSkills(sdk.skills.Fury);
			this.addSkills(sdk.skills.Armageddon);
			this.addSkills(sdk.skills.Hurricane);
			// assassin skills start
			this.addSkills(sdk.skills.FireBlast);
			this.addSkills(sdk.skills.PsychicHammer);
			this.addSkills(sdk.skills.TigerStrike);
			this.addSkills(sdk.skills.DragonTalon);
			this.addSkills(sdk.skills.ShockWeb);
			this.addSkills(sdk.skills.BladeSentinel);
			this.addSkills(sdk.skills.BurstofSpeed, () => !Config.UseBoS && !me.inTown);
			this.addSkills(sdk.skills.FistsofFire);
			this.addSkills(sdk.skills.DragonClaw);
			this.addSkills(sdk.skills.ChargedBoltSentry);
			this.addSkills(sdk.skills.WakeofFire);
			this.addSkills(sdk.skills.CloakofShadows);
			this.addSkills(sdk.skills.CobraStrike);
			this.addSkills(sdk.skills.BladeFury);
			this.addSkills(sdk.skills.Fade, () => Config.UseFade);
			this.addSkills(sdk.skills.ShadowWarrior);
			this.addSkills(sdk.skills.ClawsofThunder);
			this.addSkills(sdk.skills.DragonTail);
			this.addSkills(sdk.skills.LightningSentry);
			this.addSkills(sdk.skills.WakeofInferno);
			this.addSkills(sdk.skills.MindBlast);
			this.addSkills(sdk.skills.BladesofIce);
			this.addSkills(sdk.skills.DragonFlight);
			this.addSkills(sdk.skills.DeathSentry);
			this.addSkills(sdk.skills.BladeShield, () => Config.UseBladeShield);
			this.addSkills(sdk.skills.Venom, () => Config.UseVenom);
			this.addSkills(sdk.skills.ShadowMaster);
			this.addSkills(sdk.skills.PhoenixStrike);
			this.addSkills(sdk.skills.WakeofDestructionSentry);
			this.initialized = true;
		},
		have: function (skill = 0) {
			// ensure the values have been initialized
			!this.initialized && this.init();
			return typeof this.all[skill] !== "undefined" && this.all[skill].have();
		},
		reset: function () {
			let [min, max] = (() => {
				switch (me.classid) {
				case sdk.player.class.Amazon:
					return [sdk.skills.MagicArrow, sdk.skills.LightningFury];
				case sdk.player.class.Sorceress:
					return [sdk.skills.FireBolt, sdk.skills.ColdMastery];
				case sdk.player.class.Necromancer:
					return [sdk.skills.AmplifyDamage, sdk.skills.Revive];
				case sdk.player.class.Paladin:
					return [sdk.skills.Sacrifice, sdk.skills.Salvation];
				case sdk.player.class.Barbarian:
					return [sdk.skills.Bash, sdk.skills.BattleCommand];
				case sdk.player.class.Druid:
					return [sdk.skills.Raven, sdk.skills.Hurricane];
				case sdk.player.class.Assassin:
					return [sdk.skills.FireBlast, sdk.skills.PhoenixStrike];
				default:
					return [0, 0];
				}
			})();

			for (let i = min; i <= max; i++) {
				if (typeof this.all[i] !== "undefined" && !this.all[i].hardpoints) {
					this.all[i].checked = false;
				}
			}
		}
	},

	// initialize our skill data
	init: function () {
		// reset check values
		!Skill.skills.initialized ? Skill.skills.init() : Skill.skills.reset();
		// reset mana values
		Skill.manaCostList = {};

		switch (me.classid) {
		case sdk.player.class.Amazon:
			break;
		case sdk.player.class.Sorceress:
			if (Config.UseColdArmor === true) {
				Precast.skills.coldArmor.best = (function () {
					let coldArmor = [
						{skillId: sdk.skills.ShiverArmor, level: me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.SoftPoints)},
						{skillId: sdk.skills.ChillingArmor, level: me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.SoftPoints)},
						{skillId: sdk.skills.FrozenArmor, level: me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.SoftPoints)},
					].filter(skill => !!skill.level && skill.level > 0).sort((a, b) => b.level - a.level).first();
					return coldArmor !== undefined ? coldArmor.skillId : false;
				})();
				Precast.skills.coldArmor.duration = this.getDuration(Precast.skills.coldArmor.best);
			} else {
				Precast.skills.coldArmor.duration = this.getDuration(Config.UseColdArmor);
			}

			break;
		case sdk.player.class.Necromancer:
			{
				let bMax = me.getStat(sdk.stats.SkillBoneArmorMax);
				bMax > 0 && (Precast.skills.boneArmor.max = bMax);
			}
			if (!!Config.Golem && Config.Golem !== "None") {
				// todo: change Config.Golem to use skillid instead of 0, 1, 2, and 3
			}
			break;
		case sdk.player.class.Paladin:
			// how to handle if someone manually equips a shield during game play, don't want to build entire item list if we don't need to
			// maybe store gid of shield, would still require doing me.getItem(-1, 1, gid) everytime we wanted to cast but that's still less involved
			// than getting every item we have and finding shield, for now keeping this. Checks during init if we have a shield or not
			Precast.skills.holyShield.canUse = me.usingShield();

			break;
		case sdk.player.class.Barbarian:
			Skill.canUse(sdk.skills.Shout) && (Precast.skills.shout.duration = this.getDuration(sdk.skills.Shout));
			Skill.canUse(sdk.skills.BattleOrders) && (Precast.skills.battleOrders.duration = this.getDuration(sdk.skills.BattleOrders));
			Skill.canUse(sdk.skills.BattleCommand) && (Precast.skills.battleCommand.duration = this.getDuration(sdk.skills.BattleCommand));
			
			break;
		case sdk.player.class.Druid:
			if (!!Config.SummonAnimal && Config.SummonAnimal !== "None") {
				// todo: change Config.SummonAnimal to use skillid instead of 0, 1, 2, and 3
			}
			if (!!Config.SummonVine && Config.SummonVine !== "None") {
				// todo: change Config.SummonVine to use skillid instead of 0, 1, 2, and 3
			}
			if (!!Config.SummonSpirit && Config.SummonSpirit !== "None") {
				// todo: change Config.SummonSpirit to use skillid instead of 0, 1, 2, and 3
			}
			break;
		case sdk.player.class.Assassin:
			if (!!Config.SummonShadow) {
				// todo: change Config.SummonShadow to use skillid instead of 0, 1, 2, and 3
			}
			break;
		}
	},

	canUse: function (skillId = -1) {
		try {
			if (skillId === -1) return false;
			if (skillId >= sdk.skills.Attack && skillId <= sdk.skills.LeftHandSwing) return true;
			let valid = Skill.skills.have(skillId);
			
			return valid;
		} catch (e) {
			return false;
		}
	},

	getDuration: function (skillId = -1) {
		switch (skillId) {
		case sdk.skills.Decoy:
			return ((10 + me.getSkill(sdk.skills.Decoy, sdk.skills.subindex.SoftPoints) * 5) * 1000);
		case sdk.skills.FrozenArmor:
			return (((12 * me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.SoftPoints) + 108) + ((me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10)) * 1000);
		case sdk.skills.ShiverArmor:
			return (((12 * me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.SoftPoints) + 108) + ((me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10)) * 1000);
		case sdk.skills.ChillingArmor:
			return (((6 * me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.SoftPoints) + 138) + ((me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10)) * 1000);
		case sdk.skills.EnergyShield:
			return (84 + (60 * me.getSkill(sdk.skills.EnergyShield, sdk.skills.subindex.SoftPoints)) * 1000);
		case sdk.skills.ThunderStorm:
			return (24 + (8 * me.getSkill(sdk.skills.ThunderStorm, sdk.skills.subindex.SoftPoints))) * 1000;
		case sdk.skills.Shout:
			return (((10 + me.getSkill(sdk.skills.Shout, sdk.skills.subindex.SoftPoints) * 10) + ((me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.HardPoints)) * 5)) * 1000);
		case sdk.skills.BattleOrders:
			return (((20 + me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.SoftPoints) * 10) + ((me.getSkill(sdk.skills.Shout, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.HardPoints)) * 5)) * 1000);
		case sdk.skills.BattleCommand:
			return (((10 * me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.SoftPoints) - 5) + ((me.getSkill(sdk.skills.Shout, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.HardPoints)) * 5)) * 1000);
		case sdk.skills.HolyShield:
			return (5 + (25 * me.getSkill(sdk.skills.HolyShield, sdk.skills.subindex.SoftPoints)) * 1000);
		case sdk.skills.Hurricane:
			return (10 + (2 * me.getSkill(sdk.skills.CycloneArmor, sdk.skills.subindex.HardPoints)) * 1000);
		case sdk.skills.Werewolf:
		case sdk.skills.Werebear:
			return (40 + (20 * me.getSkill(sdk.skills.Lycanthropy, sdk.skills.subindex.SoftPoints) + 20) * 1000);
		case sdk.skills.BurstofSpeed:
			return (108 + (12 * me.getSkill(sdk.skills.BurstofSpeed, sdk.skills.subindex.SoftPoints)) * 1000);
		case sdk.skills.Fade:
			return (108 + (12 * me.getSkill(sdk.skills.Fade, sdk.skills.subindex.SoftPoints)) * 1000);
		case sdk.skills.Venom:
			return (116 + (4 * me.getSkill(sdk.skills.Venom, sdk.skills.subindex.SoftPoints)) * 1000);
		case sdk.skills.BladeShield:
			return (15 + (5 * me.getSkill(sdk.skills.BladeShield, sdk.skills.subindex.SoftPoints)) * 1000);
		default:
			return 0;
		}
	},

	getMaxSummonCount: function (skillId) {
		let skillNum = 0;

		switch (skillId) {
		case sdk.skills.Raven:
			return Math.min(me.getSkill(skillId, sdk.skills.subindex.SoftPoints), 5);
		case sdk.skills.SummonSpiritWolf:
			return Math.min(me.getSkill(skillId, sdk.skills.subindex.SoftPoints), 5);
		case sdk.skills.SummonDireWolf:
			return Math.min(me.getSkill(skillId, sdk.skills.subindex.SoftPoints), 3);
		case sdk.skills.RaiseSkeleton:
		case sdk.skills.RaiseSkeletalMage:
			skillNum = me.getSkill(skillId, sdk.skills.subindex.SoftPoints);
			return skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
		case sdk.skills.Revive:
			return me.getSkill(sdk.skills.Revive, sdk.skills.subindex.SoftPoints);
		case sdk.skills.ShadowWarrior:
		case sdk.skills.ShadowMaster:
		case sdk.skills.PoisonCreeper:
		case sdk.skills.CarrionVine:
		case sdk.skills.SolarCreeper:
		case sdk.skills.OakSage:
		case sdk.skills.HeartofWolverine:
		case sdk.skills.SpiritofBarbs:
		case sdk.skills.SummonGrizzly:
		case sdk.skills.ClayGolem:
		case sdk.skills.BloodGolem:
		case sdk.skills.FireGolem:
		case sdk.skills.Valkyrie:
			return 1;
		}

		return 0;
	},

	getRange: function (skillId) {
		switch (skillId) {
		case sdk.skills.Attack:
			return Attack.usingBow() ? 20 : 3;
		case sdk.skills.Kick:
		case sdk.skills.LeftHandSwing:
		case sdk.skills.Jab:
		case sdk.skills.PowerStrike:
		case sdk.skills.ChargedStrike:
		case sdk.skills.LightningStrike:
		case sdk.skills.Impale:
		case sdk.skills.Fend:
		case sdk.skills.Blaze:
		case sdk.skills.PoisonDagger:
		case sdk.skills.Sacrifice:
		case sdk.skills.Smite:
		case sdk.skills.Zeal:
		case sdk.skills.Vengeance:
		case sdk.skills.Conversion:
		case sdk.skills.BlessedHammer:
		case sdk.skills.FindPotion:
		case sdk.skills.FindItem:
		case sdk.skills.GrimWard:
		case sdk.skills.Bash:
		case sdk.skills.DoubleSwing:
		case sdk.skills.Stun:
		case sdk.skills.Concentrate:
		case sdk.skills.Frenzy:
		case sdk.skills.Berserk:
		case sdk.skills.FeralRage:
		case sdk.skills.Maul:
		case sdk.skills.Rabies:
		case sdk.skills.FireClaws:
		case sdk.skills.Hunger:
		case sdk.skills.Fury:
		case sdk.skills.DragonTalon:
		case sdk.skills.DragonClaw:
		case sdk.skills.DragonTail:
			return 3;
		case sdk.skills.BattleCry:
		case sdk.skills.WarCry:
			return 4;
		case sdk.skills.FrostNova:
		case sdk.skills.Twister:
		case sdk.skills.Tornado:
		case sdk.skills.Summoner:
			return 5;
		case sdk.skills.ChargedBolt:
			return 6;
		case sdk.skills.Nova:
		case sdk.skills.Whirlwind:
			return 7;
		case sdk.skills.PoisonNova:
			return 8;
		case sdk.skills.Armageddon:
			return 9;
		case sdk.skills.PoisonJavelin:
		case sdk.skills.PlagueJavelin:
		case sdk.skills.HolyBolt:
		case sdk.skills.Charge:
		case sdk.skills.Howl:
		case sdk.skills.Firestorm:
		case sdk.skills.MoltenBoulder:
		case sdk.skills.ShockWave:
			return 10;
		case sdk.skills.InnerSight:
		case sdk.skills.SlowMissiles:
			return 13;
		case sdk.skills.LightningFury:
		case sdk.skills.FrozenOrb:
		case sdk.skills.Teeth:
		case sdk.skills.Fissure:
		case sdk.skills.Volcano:
		case sdk.skills.FireBlast:
		case sdk.skills.ShockWeb:
		case sdk.skills.BladeSentinel:
		case sdk.skills.BladeFury:
			return 15;
		case sdk.skills.FireArrow:
		case sdk.skills.MultipleShot:
		case sdk.skills.ExplodingArrow:
		case sdk.skills.GuidedArrow:
		case sdk.skills.ImmolationArrow:
		case sdk.skills.FreezingArrow:
		case sdk.skills.IceBolt:
		case sdk.skills.IceBlast:
		case sdk.skills.FireBolt:
		case sdk.skills.Revive:
		case sdk.skills.FistoftheHeavens:
		case sdk.skills.DoubleThrow:
		case sdk.skills.PsychicHammer:
		case sdk.skills.DragonFlight:
			return 20;
		case sdk.skills.LowerResist:
			return 50;
		// Variable range
		case sdk.skills.StaticField:
			return Math.floor((me.getSkill(sdk.skills.StaticField, sdk.skills.subindex.SoftPoints) + 4) * 2 / 3);
		case sdk.skills.Leap:
		{
			let skLvl = me.getSkill(sdk.skills.Leap, sdk.skills.subindex.SoftPoints);
			return Math.floor(Math.min(4 + (26 * ((110 * skLvl / (skLvl + 6)) / 100)), 30) * (2 / 3));
		}
		case sdk.skills.ArcticBlast:
		{
			let skLvl = me.getSkill(sdk.skills.ArcticBlast, sdk.skills.subindex.SoftPoints);
			let range = Math.floor(((33 + (2 * skLvl)) / 4) * (2 / 3));
			// Druid using this on physical immunes needs the monsters to be within range of hurricane
			range > 6 && Config.AttackSkill[5] === sdk.skills.ArcticBlast && (range = 6);
		
			return range;
		}
		case sdk.skills.Lightning:
		case sdk.skills.BoneSpear:
		case sdk.skills.BoneSpirit:
			return !!this.usePvpRange ? 35 : 15;
		case sdk.skills.FireBall:
		case sdk.skills.FireWall:
		case sdk.skills.ChainLightning:
		case sdk.skills.Meteor:
		case sdk.skills.Blizzard:
		case sdk.skills.MindBlast:
			return !!this.usePvpRange ? 35 : 20;
		}

		// Every other skill
		return !!this.usePvpRange ? 30 : 20;
	},

	needFloor: [
		sdk.skills.Blizzard, sdk.skills.Meteor, sdk.skills.Fissure, sdk.skills.Volcano, sdk.skills.ShockWeb, sdk.skills.LeapAttack, sdk.skills.Hydra
	],

	missileSkills: [
		sdk.skills.MagicArrow, sdk.skills.FireArrow, sdk.skills.ColdArrow, sdk.skills.MultipleShot, sdk.skills.PoisonJavelin, sdk.skills.ExplodingArrow,
		sdk.skills.LightningBolt, sdk.skills.IceArrow, sdk.skills.GuidedArrow, sdk.skills.PlagueJavelin, sdk.skills.Strafe, sdk.skills.ImmolationArrow,
		sdk.skills.FreezingArrow, sdk.skills.LightningFury, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.FireBolt, sdk.skills.Inferno,
		sdk.skills.IceBlast, sdk.skills.FireBall, sdk.skills.Lightning, sdk.skills.ChainLightning, sdk.skills.GlacialSpike, sdk.skills.FrozenOrb,
		sdk.skills.Teeth, sdk.skills.BoneSpear, sdk.skills.BoneSpirit, sdk.skills.HolyBolt, sdk.skills.FistoftheHeavens, sdk.skills.DoubleThrow,
		sdk.skills.Firestorm, sdk.skills.MoltenBoulder, sdk.skills.ArcticBlast, sdk.skills.Twister, sdk.skills.Tornado, sdk.skills.FireBlast
	],

	getHand: function (skillId) {
		switch (skillId) {
		case sdk.skills.MagicArrow:
		case sdk.skills.FireArrow:
		case sdk.skills.ColdArrow:
		case sdk.skills.MultipleShot:
		case sdk.skills.PoisonJavelin:
		case sdk.skills.ExplodingArrow:
		case sdk.skills.Impale:
		case sdk.skills.LightningBolt:
		case sdk.skills.IceArrow:
		case sdk.skills.GuidedArrow:
		case sdk.skills.PlagueJavelin:
		case sdk.skills.Strafe:
		case sdk.skills.ImmolationArrow:
		case sdk.skills.Fend:
		case sdk.skills.FreezingArrow:
		case sdk.skills.LightningFury:
		case sdk.skills.FireBolt:
		case sdk.skills.ChargedBolt:
		case sdk.skills.IceBolt:
		case sdk.skills.Inferno:
		case sdk.skills.IceBlast:
		case sdk.skills.FireBall:
		case sdk.skills.Lightning:
		case sdk.skills.ChainLightning:
		case sdk.skills.GlacialSpike:
		case sdk.skills.FrozenOrb:
		case sdk.skills.Teeth:
		case sdk.skills.PoisonDagger:
		case sdk.skills.BoneSpear:
		case sdk.skills.BoneSpirit:
		case sdk.skills.HolyBolt:
		case sdk.skills.Charge:
		case sdk.skills.BlessedHammer:
		case sdk.skills.FistoftheHeavens:
		case sdk.skills.Leap:
		case sdk.skills.DoubleThrow:
		case sdk.skills.LeapAttack:
		case sdk.skills.Whirlwind:
		case sdk.skills.Firestorm:
		case sdk.skills.MoltenBoulder:
		case sdk.skills.ArcticBlast:
		case sdk.skills.Twister:
		case sdk.skills.ShockWave:
		case sdk.skills.Tornado:
		case sdk.skills.FireBlast:
		case sdk.skills.TigerStrike:
		case sdk.skills.ShockWeb:
		case sdk.skills.BladeSentinel:
		case sdk.skills.FistsofFire:
		case sdk.skills.CobraStrike:
		case sdk.skills.BladeFury:
		case sdk.skills.ClawsofThunder:
		case sdk.skills.BladesofIce:
		case sdk.skills.DragonFlight:
			return sdk.skills.hand.Left;
		case sdk.skills.Attack:
		case sdk.skills.Jab:
		case sdk.skills.PowerStrike:
		case sdk.skills.ChargedStrike:
		case sdk.skills.LightningStrike:
		case sdk.skills.Sacrifice:
		case sdk.skills.Smite:
		case sdk.skills.Zeal:
		case sdk.skills.Vengeance:
		case sdk.skills.Conversion:
		case sdk.skills.Bash:
		case sdk.skills.DoubleSwing:
		case sdk.skills.Stun:
		case sdk.skills.Concentrate:
		case sdk.skills.Frenzy:
		case sdk.skills.Berserk:
		case sdk.skills.FeralRage:
		case sdk.skills.Maul:
		case sdk.skills.Rabies:
		case sdk.skills.FireClaws:
		case sdk.skills.Hunger:
		case sdk.skills.Fury:
		case sdk.skills.DragonTalon:
		case sdk.skills.DragonClaw:
		case sdk.skills.DragonTail:
			return sdk.skills.hand.LeftNoShift; // Shift bypass
		}

		// Every other skill
		return sdk.skills.hand.Right;
	},

	charges: [],

	// Cast a skill on self, Unit or coords
	cast: function (skillId, hand, x, y, item) {
		switch (true) {
		case me.inTown && !this.townSkill(skillId):
		case !item && (this.getManaCost(skillId) > me.mp || !this.canUse(skillId)):
		case !this.wereFormCheck(skillId):
			return false;
		case skillId === undefined:
			throw new Error("Unit.cast: Must supply a skill ID");
		}

		if (skillId === sdk.skills.Telekinesis && typeof x === "object" && Packet.telekinesis(x)) {
			delay(250);
			return true;
		}

		hand === undefined && (hand = this.getHand(skillId));
		x === undefined && (x = me.x);
		y === undefined && (y = me.y);

		// Check mana cost, charged skills don't use mana
		if (!item && this.getManaCost(skillId) > me.mp) {
			// Maybe delay on ALL skills that we don't have enough mana for?
			if (Config.AttackSkill.concat([sdk.skills.StaticField, sdk.skills.Teleport]).concat(Config.LowManaSkill).includes(skillId)) {
				delay(300);
			}

			return false;
		}

		if (skillId === sdk.skills.Teleport && typeof x === "number" && Packet.teleport(x, y)) {
			delay(250);
			return true;
		}

		if (!this.setSkill(skillId, hand, item)) return false;

		if (Config.PacketCasting > 1) {
			switch (typeof x) {
			case "number":
				Packet.castSkill(hand, x, y);
				delay(250);

				break;
			case "object":
				Packet.unitCast(hand, x);
				delay(250);

				break;
			}
		} else {
			let clickType, shift;

			// todo - get a better idea of clickType in reference to clickMap
			switch (hand) {
			case sdk.skills.hand.Right: // Right hand + No Shift
				clickType = 3;
				shift = sdk.clicktypes.shift.NoShift;

				break;
			case sdk.skills.hand.Left: // Left hand + Shift
				clickType = 0;
				shift = sdk.clicktypes.shift.Shift;

				break;
			case sdk.skills.hand.LeftNoShift: // Left hand + No Shift
				clickType = 0;
				shift = sdk.clicktypes.shift.NoShift;

				break;
			case sdk.skills.hand.RightShift: // Right hand + Shift
				clickType = 3;
				shift = sdk.clicktypes.shift.Shift;

				break;
			}

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
		if (this.isTimed(skillId)) {
			for (let i = 0; i < 10; i += 1) {
				if ([sdk.player.mode.GettingHit, sdk.player.mode.Blocking].includes(me.mode) || me.skillDelay) {
					break;
				}

				delay(10);
			}
		}

		return true;
	},

	// Put a skill on desired slot
	setSkill: function (skillId, hand, item) {
		// Check if the skill is already set
		if (me.getSkill(hand === sdk.skills.hand.Right ? sdk.skills.get.RightId : sdk.skills.get.LeftId) === skillId) return true;
		if (!item && !Skill.canUse(skillId)) return false;

		// Charged skills must be cast from right hand
		if (hand === undefined || hand === sdk.skills.hand.RightShift || item) {
			item && hand !== sdk.skills.hand.Right && console.warn("[ÿc9Warningÿc0] charged skills must be cast from right hand");
			hand = sdk.skills.hand.Right;
		}

		return (me.setSkill(skillId, hand, item));
	},

	// Timed skills
	isTimed: function (skillId) {
		return [
			sdk.skills.PoisonJavelin, sdk.skills.PlagueJavelin, sdk.skills.ImmolationArrow, sdk.skills.FireWall, sdk.skills.Meteor, sdk.skills.Blizzard,
			sdk.skills.Hydra, sdk.skills.FrozenOrb, sdk.skills.FistoftheHeavens, sdk.skills.Firestorm, sdk.skills.Werewolf, sdk.skills.Werebear, sdk.skills.MoltenBoulder,
			sdk.skills.Fissure, sdk.skills.Volcano, sdk.skills.Grizzly, sdk.skills.Armageddon, sdk.skills.Hurricane, sdk.skills.ShockWeb, sdk.skills.ShadowWarrior,
			sdk.skills.DragonFlight, sdk.skills.BladeShield, sdk.skills.ShadowMaster
		].includes(skillId);
	},

	// Wereform skill check
	wereFormCheck: function (skillId) {
		// we don't even have the skills to transform or we aren't transformed - add handler for wereform given by an item that is on switch
		if (!Skill.canUse(sdk.skills.Werewolf) && !Skill.canUse(sdk.skills.Werebear)) return true;
		if (!me.getState(sdk.states.Wearwolf) && !me.getState(sdk.states.Wearbear)) return true;

		// Can be cast by both
		if ([sdk.skills.Attack, sdk.skills.Kick, sdk.skills.Raven, sdk.skills.PoisonCreeper, sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.CarrionVine,
			sdk.skills.HeartofWolverine, sdk.skills.SummonDireWolf, sdk.skills.FireClaws, sdk.skills.SolarCreeper, sdk.skills.Hunger, sdk.skills.SpiritofBarbs, sdk.skills.SummonGrizzly, sdk.skills.Armageddon].includes(skillId)) {
			return true;
		}

		// Can be cast by werewolf only
		if (me.getState(sdk.states.Wearwolf) && [sdk.skills.Werewolf, sdk.skills.FeralRage, sdk.skills.Rabies, sdk.skills.Fury].includes(skillId)) return true;
		// Can be cast by werebear only
		if (me.getState(sdk.states.Wearbear) && [sdk.skills.Werebear, sdk.skills.Maul, sdk.skills.ShockWave].includes(skillId)) return true;

		return false;
	},

	// Skills that cn be cast in town
	townSkill: function (skillId = -1) {
		return [
			sdk.skills.Valkyrie, sdk.skills.FrozenArmor, sdk.skills.Telekinesis, sdk.skills.ShiverArmor, sdk.skills.Enchant, sdk.skills.ThunderStorm, sdk.skills.EnergyShield, sdk.skills.ChillingArmor,
			sdk.skills.BoneArmor, sdk.skills.ClayGolem, sdk.skills.BloodGolem, sdk.skills.FireGolem, sdk.skills.HolyShield, sdk.skills.Raven, sdk.skills.PoisonCreeper, sdk.skills.Werewolf, sdk.skills.Werebear,
			sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.CarrionVine, sdk.skills.CycloneArmor, sdk.skills.HeartofWolverine, sdk.skills.SummonDireWolf, sdk.skills.SolarCreeper,
			sdk.skills.SpiritofBarbs, sdk.skills.SummonGrizzly, sdk.skills.BurstofSpeed, sdk.skills.Fade, sdk.skills.ShadowWarrior, sdk.skills.BladeShield, sdk.skills.Venom, sdk.skills.ShadowMaster
		].includes(skillId);
	},

	manaCostList: {},

	// Get mana cost of the skill (mBot)
	getManaCost: function (skillId) {
		if (skillId < sdk.skills.MagicArrow) return 0;
		if (this.manaCostList.hasOwnProperty(skillId)) return this.manaCostList[skillId];

		let skillLvl = me.getSkill(skillId, sdk.skills.subindex.SoftPoints);
		let effectiveShift = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
		let lvlmana = getBaseStat("skills", skillId, "lvlmana") === 65535 ? -1 : getBaseStat("skills", skillId, "lvlmana"); // Correction for skills that need less mana with levels (kolton)
		let ret = Math.max((getBaseStat("skills", skillId, "mana") + lvlmana * (skillLvl - 1)) * (effectiveShift[getBaseStat("skills", skillId, "manashift")] / 256), getBaseStat("skills", skillId, "minmana"));

		if (!this.manaCostList.hasOwnProperty(skillId)) {
			this.manaCostList[skillId] = ret;
		}

		return ret;
	},

	useTK: function (unit = undefined) {
		try {
			if (!unit || !Skill.canUse(sdk.skills.Telekinesis)
				|| typeof unit !== "object" || unit.type !== sdk.unittype.Object
				|| unit.name.toLowerCase() === "dummy"
				|| (unit.name.toLowerCase() === "portal" && !me.inTown && unit.classid !== sdk.objects.ArcaneSanctuaryPortal)
				|| [sdk.objects.RedPortalToAct4, sdk.objects.WorldstonePortal, sdk.objects.RedPortal, sdk.objects.RedPortalToAct5].includes(unit.classid)) {
				return false;
			}

			return me.inTown || (me.mpPercent > 25);
		} catch (e) {
			return false;
		}
	}
};

Object.defineProperties(Skill, {
	haveTK: {
		get: function () {
			return Skill.canUse(sdk.skills.Telekinesis);
		},
	},
});

const Misc = {
	// Click something
	click: function (button, shift, x, y) {
		if (arguments.length < 2) throw new Error("Misc.click: Needs at least 2 arguments.");

		while (!me.gameReady) {
			delay(100);
		}

		switch (arguments.length) {
		case 2:
			me.blockMouse = true;
			clickMap(button, shift, me.x, me.y);
			delay(20);
			clickMap(button + 2, shift, me.x, me.y);
			me.blockMouse = false;

			break;
		case 3:
			if (typeof (x) !== "object") throw new Error("Misc.click: Third arg must be a Unit.");

			me.blockMouse = true;
			clickMap(button, shift, x);
			delay(20);
			clickMap(button + 2, shift, x);
			me.blockMouse = false;

			break;
		case 4:
			me.blockMouse = true;
			clickMap(button, shift, x, y);
			delay(20);
			clickMap(button + 2, shift, x, y);
			me.blockMouse = false;

			break;
		}

		return true;
	},

	// Check if a player is in your party
	inMyParty: function (name) {
		if (me.name === name) return true;

		while (!me.gameReady) {
			delay(100);
		}

		let player, myPartyId;

		try {
			player = getParty();
			if (!player) return false;

			myPartyId = player.partyid;
			player = getParty(name); // May throw an error

			if (player && player.partyid !== sdk.party.NoParty && player.partyid === myPartyId) {
				return true;
			}
		} catch (e) {
			player = getParty();

			if (player) {
				myPartyId = player.partyid;

				while (player.getNext()) {
					if (player.partyid !== sdk.party.NoParty && player.partyid === myPartyId) {
						return true;
					}
				}
			}
		}

		return false;
	},

	// Find a player
	findPlayer: function (name) {
		let player = getParty();

		if (player) {
			do {
				if (player.name !== me.name && player.name === name) {
					return player;
				}
			} while (player.getNext());
		}

		return false;
	},

	// Get player unit
	getPlayerUnit: function (name) {
		let player = Game.getPlayer(name);

		if (player) {
			do {
				if (!player.dead) {
					return player;
				}
			} while (player.getNext());
		}

		return false;
	},

	// Get the player act, accepts party unit or name
	getPlayerAct: function (player) {
		if (!player) return false;

		let unit = (typeof player === "object" ? player : this.findPlayer(player));

		if (!unit) {
			return false;
		} else {
			return sdk.areas.actOf(unit.area);
		}
	},

	// Get number of players within getUnit distance
	getNearbyPlayerCount: function () {
		let count = 0;
		let player = Game.getPlayer();

		if (player) {
			do {
				if (player.name !== me.name && !player.dead) {
					count += 1;
				}
			} while (player.getNext());
		}

		return count;
	},

	// Get total number of players in game
	getPlayerCount: function () {
		let count = 0;
		let party = getParty();

		if (party) {
			do {
				count += 1;
			} while (party.getNext());
		}

		return count;
	},

	// Get total number of players in game and in my party
	getPartyCount: function () {
		let count = 0;
		let party = getParty();

		if (party) {
			let myPartyId = party.partyid;
			
			do {
				if (party.partyid !== sdk.party.NoParty && party.partyid === myPartyId && party.name !== me.name) {
					print(party.name);
					count += 1;
				}
			} while (party.getNext());
		}

		return count;
	},

	// check if any member of our party meets a certain level req
	checkPartyLevel: function (levelCheck = 1, exclude = []) {
		!Array.isArray(exclude) && (exclude = [exclude]);
		let party = getParty();

		if (party) {
			let myPartyId = party.partyid;

			do {
				if (party.partyid !== sdk.party.NoParty && party.partyid === myPartyId && party.name !== me.name && !exclude.includes(party.name)) {
					if (party.level >= levelCheck) {
						return true;
					}
				}
			} while (party.getNext());
		}

		return false;
	},

	getPlayerArea: function (player) {
		if (!player) return false;

		let unit = (typeof player === "object" ? player : this.findPlayer(player));

		return !!unit ? unit.area : 0;
	},

	// autoleader by Ethic - refactored by theBGuy
	autoLeaderDetect: function (givenSettings = {}) {
		const settings = Object.assign({}, {
			destination: -1,
			quitIf: false,
			timeout: Infinity
		}, givenSettings);

		let leader;
		let startTick = getTickCount();
		let check = typeof settings.quitIf === "function";
		do {
			let solofail = 0;
			let suspect = getParty(); // get party object (players in game)

			do {
				// player isn't alone
				suspect.name !== me.name && (solofail += 1);

				if (check && settings.quitIf(suspect.area)) return false;

				// first player not hostile found in destination area...
				if (suspect.area === settings.destination && !getPlayerFlag(me.gid, suspect.gid, 8)) {
					leader = suspect.name; // ... is our leader
					console.log("ÿc4Autodetected " + leader);

					return leader;
				}
			} while (suspect.getNext());

			// empty game, nothing left to do. Or we exceeded our wait time
			if (solofail === 0 || (getTickCount() - startTick > settings.timeout)) {
				return false;
			}

			delay(500);
		} while (!leader); // repeat until leader is found (or until game is empty)

		return false;
	},

	// Open a chest Unit (takes chestID or unit)
	openChest: function (unit) {
		typeof unit === "number" && (unit = Game.getObject(unit));
		
		// Skip invalid/open and Countess chests
		if (!unit || unit.x === 12526 || unit.x === 12565 || unit.mode) return false;
		// locked chest, no keys
		if (!me.assassin && unit.islocked && !me.findItem(sdk.items.Key, sdk.items.mode.inStorage, sdk.storage.Inventory)) return false;

		let specialChest = sdk.quest.chests.includes(unit.classid);

		for (let i = 0; i < 7; i++) {
			// don't use tk if we are right next to it
			let useTK = (unit.distance > 5 && Skill.useTK(unit) && i < 3);
			if (useTK) {
				unit.distance > 13 && Attack.getIntoPosition(unit, 13, sdk.collision.WallOrRanged);
				if (!Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, unit)) {
					console.debug("Failed to tk: attempt: " + i);
					continue;
				}
			} else {
				[(unit.x + 1), (unit.y + 2)].distance > 5 && Pather.moveTo(unit.x + 1, unit.y + 2, 3);
				(specialChest || i > 2) ? Misc.click(0, 0, unit) : Packet.entityInteract(unit);
			}

			if (Misc.poll(() => unit.mode, 1000, 50)) {
				return true;
			} else {
				Packet.flash(me.gid);
			}
		}

		// Click to stop walking in case we got stuck
		!me.idle && Misc.click(0, 0, me.x, me.y);

		return false;
	},

	// Open all chests that have preset units in an area
	openChestsInArea: function (area, chestIds = []) {
		!area && (area = me.area);
		area !== me.area && Pather.journeyTo(area);
		
		let presetUnits = Game.getPresetObjects(area);
		if (!presetUnits) return false;

		if (!chestIds.length) {
			chestIds = [
				5, 6, 87, 104, 105, 106, 107, 143, 140, 141, 144, 146, 147, 148, 176, 177, 181, 183, 198, 240, 241,
				242, 243, 329, 330, 331, 332, 333, 334, 335, 336, 354, 355, 356, 371, 387, 389, 390, 391, 397, 405,
				406, 407, 413, 420, 424, 425, 430, 431, 432, 433, 454, 455, 501, 502, 504, 505, 580, 581
			];
		}

		let coords = [];

		while (presetUnits.length > 0) {
			if (chestIds.includes(presetUnits[0].id)) {
				coords.push({
					x: presetUnits[0].roomx * 5 + presetUnits[0].x,
					y: presetUnits[0].roomy * 5 + presetUnits[0].y
				});
			}

			presetUnits.shift();
		}

		while (coords.length) {
			coords.sort(Sort.units);
			Pather.moveToUnit(coords[0], 1, 2);
			this.openChests(20);

			for (let i = 0; i < coords.length; i += 1) {
				if (getDistance(coords[i].x, coords[i].y, coords[0].x, coords[0].y) < 20) {
					coords.shift();
				}
			}
		}

		return true;
	},

	openChests: function (range = 15) {
		if (!Config.OpenChests.Enabled) return true;

		let unitList = [];
		let containers = [];

		// Testing all container code
		if (Config.OpenChests.Types.some((el) => el.toLowerCase() === "all")) {
			containers = [
				"chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2",
				"tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2",
				"cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl",
				"woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2",
				"icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
			];
		} else {
			containers = Config.OpenChests.Types;
		}

		let unit = Game.getObject();

		if (unit) {
			do {
				if (unit.name && unit.mode === sdk.objects.mode.Inactive && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.includes(unit.name.toLowerCase())) {
					unitList.push(copyUnit(unit));
				}
			} while (unit.getNext());
		}

		while (unitList.length > 0) {
			unitList.sort(Sort.units);
			unit = unitList.shift();

			if (unit && (Pather.useTeleport() || !checkCollision(me, unit, sdk.collision.WallOrRanged)) && this.openChest(unit)) {
				Pickit.pickItems();
			}
		}

		return true;
	},

	shrineStates: false,

	scanShrines: function (range, ignore = []) {
		if (!Config.ScanShrines.length) return false;

		!range && (range = Pather.useTeleport() ? 25 : 15);
		!Array.isArray(ignore) && (ignore = [ignore]);

		let shrineList = [];

		// Initiate shrine states
		if (!this.shrineStates) {
			this.shrineStates = [];

			for (let i = 0; i < Config.ScanShrines.length; i += 1) {
				switch (Config.ScanShrines[i]) {
				case sdk.shrines.None:
				case sdk.shrines.Refilling:
				case sdk.shrines.Health:
				case sdk.shrines.Mana:
				case sdk.shrines.HealthExchange: // (doesn't exist)
				case sdk.shrines.ManaExchange: // (doesn't exist)
				case sdk.shrines.Enirhs: // (doesn't exist)
				case sdk.shrines.Portal:
				case sdk.shrines.Gem:
				case sdk.shrines.Fire:
				case sdk.shrines.Monster:
				case sdk.shrines.Exploding:
				case sdk.shrines.Poison:
					this.shrineStates[i] = 0; // no state

					break;
				case sdk.shrines.Armor:
				case sdk.shrines.Combat:
				case sdk.shrines.ResistFire:
				case sdk.shrines.ResistCold:
				case sdk.shrines.ResistLightning:
				case sdk.shrines.ResistPoison:
				case sdk.shrines.Skill:
				case sdk.shrines.ManaRecharge:
				case sdk.shrines.Stamina:
				case sdk.shrines.Experience:
					// Both states and shrines are arranged in same order with armor shrine starting at 128
					this.shrineStates[i] = Config.ScanShrines[i] + 122;

					break;
				}
			}
		}

		let shrine = Game.getObject("shrine");

		if (shrine) {
			let index = -1;
			// Build a list of nearby shrines
			do {
				if (shrine.mode === sdk.objects.mode.Inactive && !ignore.includes(shrine.objtype) && getDistance(me.x, me.y, shrine.x, shrine.y) <= range) {
					shrineList.push(copyUnit(shrine));
				}
			} while (shrine.getNext());

			// Check if we have a shrine state, store its index if yes
			for (let i = 0; i < this.shrineStates.length; i += 1) {
				if (me.getState(this.shrineStates[i])) {
					index = i;

					break;
				}
			}

			for (let i = 0; i < Config.ScanShrines.length; i += 1) {
				for (let j = 0; j < shrineList.length; j += 1) {
					// Get the shrine if we have no active state or to refresh current state or if the shrine has no state
					// Don't override shrine state with a lesser priority shrine
					// todo - check to make sure we can actually get the shrine for ones without states
					// can't grab a health shrine if we are in perfect health, can't grab mana shrine if our mana is maxed
					if (index === -1 || i <= index || this.shrineStates[i] === 0) {
						if (shrineList[j].objtype === Config.ScanShrines[i] && (Pather.useTeleport() || !checkCollision(me, shrineList[j], sdk.collision.WallOrRanged))) {
							this.getShrine(shrineList[j]);

							// Gem shrine - pick gem
							if (Config.ScanShrines[i] === sdk.shrines.Gem) {
								Pickit.pickItems();
							}
						}
					}
				}
			}
		}

		return true;
	},

	// Use a shrine Unit
	getShrine: function (unit) {
		if (unit.mode === sdk.objects.mode.Active) return false;

		for (let i = 0; i < 3; i++) {
			if (Skill.useTK(unit) && i < 2) {
				unit.distance > 21 && Pather.moveNearUnit(unit, 20);
				!Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, unit) && Attack.getIntoPosition(unit, 20, sdk.collision.WallOrRanged);
			} else {
				if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
					Misc.click(0, 0, unit);
				}
			}

			if (Misc.poll(() => unit.mode, 1000, 40)) {
				return true;
			}
		}

		return false;
	},

	// Check all shrines in area and get the first one of specified type
	getShrinesInArea: function (area, type, use) {
		let shrineLocs = [];
		let shrineIds = [2, 81, 83];
		let unit = Game.getPresetObjects(area);
		let result = false;

		if (unit) {
			for (let i = 0; i < unit.length; i += 1) {
				if (shrineIds.includes(unit[i].id)) {
					shrineLocs.push([unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y]);
				}
			}
		}

		try {
			NodeAction.shrinesToIgnore.push(type);

			while (shrineLocs.length > 0) {
				shrineLocs.sort(Sort.points);
				let coords = shrineLocs.shift();

				Skill.haveTK ? Pather.moveNear(coords[0], coords[1], 20) : Pather.moveTo(coords[0], coords[1], 2);

				let shrine = Game.getObject("shrine");

				if (shrine) {
					do {
						if (shrine.objtype === type && shrine.mode === sdk.objects.mode.Inactive) {
							(!Skill.haveTK || !use) && Pather.moveTo(shrine.x - 2, shrine.y - 2);

							if (!use || this.getShrine(shrine)) {
								result = true;
								return true;
							}
						}
					} while (shrine.getNext());
				}
			}
		} finally {
			NodeAction.shrinesToIgnore.remove(type);
		}

		return result;
	},

	getItemDesc: function (unit, logILvl = true) {
		let stringColor = "";
		let desc = unit.description;

		if (!desc) return "";
		desc = desc.split("\n");

		// Lines are normally in reverse. Add color tags if needed and reverse order.
		for (let i = 0; i < desc.length; i += 1) {
			// Remove sell value
			if (desc[i].includes(getLocaleString(sdk.locale.text.SellValue))) {
				desc.splice(i, 1);

				i -= 1;
			} else {
				// Add color info
				if (!desc[i].match(/^(y|ÿ)c/)) {
					desc[i] = stringColor + desc[i];
				}

				// Find and store new color info
				let index = desc[i].lastIndexOf("ÿc");

				if (index > -1) {
					stringColor = desc[i].substring(index, index + "ÿ".length + 2);
				}
			}

			desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2");
		}

		if (logILvl && desc[desc.length - 1]) {
			desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
		}

		desc = desc.reverse().join("\n");

		return desc;
	},

	getItemCode: function (unit) {
		if (unit === undefined) return "";
		
		let code = (() => {
			switch (unit.quality) {
			case sdk.items.quality.Set:
				switch (unit.classid) {
				case sdk.items.Sabre:
					return "inv9sbu";
				case sdk.items.ShortWarBow:
					return "invswbu";
				case sdk.items.Helm:
					return "invhlmu";
				case sdk.items.LargeShield:
					return "invlrgu";
				case sdk.items.LongSword:
				case sdk.items.CrypticSword:
					return "invlsdu";
				case sdk.items.SmallShield:
					return "invsmlu";
				case sdk.items.Buckler:
					return "invbucu";
				case sdk.items.Cap:
					return "invcapu";
				case sdk.items.BroadSword:
					return "invbsdu";
				case sdk.items.FullHelm:
					return "invfhlu";
				case sdk.items.GothicShield:
					return "invgtsu";
				case sdk.items.AncientArmor:
				case sdk.items.SacredArmor:
					return "invaaru";
				case sdk.items.KiteShield:
					return "invkitu";
				case sdk.items.TowerShield:
					return "invtowu";
				case sdk.items.FullPlateMail:
					return "invfulu";
				case sdk.items.MilitaryPick:
					return "invmpiu";
				case sdk.items.JaggedStar:
					return "invmstu";
				case sdk.items.ColossusBlade:
					return "invgsdu";
				case sdk.items.OrnatePlate:
					return "invxaru";
				case sdk.items.Cuirass:
				case sdk.items.ReinforcedMace:
				case sdk.items.Ward:
				case sdk.items.SpiredHelm:
					return "inv" + unit.code + "s";
				case sdk.items.GrandCrown:
					return "invxrnu";
				case sdk.items.ScissorsSuwayyah:
					return "invskru";
				case sdk.items.GrimHelm:
				case sdk.items.BoneVisage:
					return "invbhmu";
				case sdk.items.ElderStaff:
					return "invcstu";
				case sdk.items.RoundShield:
					return "invxmlu";
				case sdk.items.BoneWand:
					return "invbwnu";
				default:
					return "";
				}
			case sdk.items.quality.Unique:
				for (let i = 0; i < 401; i += 1) {
					if (unit.code === getBaseStat("uniqueitems", i, 4).trim()
						&& unit.fname.split("\n").reverse()[0].includes(getLocaleString(getBaseStat("uniqueitems", i, 2)))) {
						return getBaseStat("uniqueitems", i, "invfile");
					}
				}
				return "";
			default:
				return "";
			}
		})();

		if (!code) {
			// Tiara/Diadem
			code = ["ci2", "ci3"].includes(unit.code) ? unit.code : (getBaseStat("items", unit.classid, "normcode") || unit.code);
			code = code.replace(" ", "");
			[sdk.items.type.Ring, sdk.items.type.Amulet, sdk.items.type.Jewel, sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(unit.itemType) && (code += (unit.gfx + 1));
		}

		return code;
	},

	getItemSockets: function (unit) {
		let code;
		let sockets = unit.sockets;
		let subItems = unit.getItemsEx();
		let tempArray = [];

		if (subItems.length) {
			switch (unit.sizex) {
			case 2:
				switch (unit.sizey) {
				case 3: // 2 x 3
					switch (sockets) {
					case 4:
						tempArray = [subItems[0], subItems[3], subItems[2], subItems[1]];

						break;
					case 5:
						tempArray = [subItems[1], subItems[4], subItems[0], subItems[3], subItems[2]];

						break;
					case 6:
						tempArray = [subItems[0], subItems[3], subItems[1], subItems[4], subItems[2], subItems[5]];

						break;
					}

					break;
				case 4: // 2 x 4
					switch (sockets) {
					case 5:
						tempArray = [subItems[1], subItems[4], subItems[0], subItems[3], subItems[2]];

						break;
					case 6:
						tempArray = [subItems[0], subItems[3], subItems[1], subItems[4], subItems[2], subItems[5]];

						break;
					}

					break;
				}

				break;
			}

			if (tempArray.length === 0 && subItems.length > 0) {
				tempArray = subItems.slice(0);
			}
		}

		for (let i = 0; i < sockets; i += 1) {
			if (tempArray[i]) {
				code = tempArray[i].code;

				if ([sdk.items.type.Ring, sdk.items.type.Amulet, sdk.items.type.Jewel, sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(tempArray[i].itemType)) {
					code += (tempArray[i].gfx + 1);
				}
			} else {
				code = "gemsocket";
			}

			tempArray[i] = code;
		}

		return tempArray;
	},

	useItemLog: true, // Might be a bit dirty

	itemLogger: function (action, unit, text) {
		if (!Config.ItemInfo || !this.useItemLog) return false;

		let desc;
		let date = new Date();
		let dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace(/-/g, "/").replace("T", " ") + "]";

		switch (action) {
		case "Sold":
			if (Config.ItemInfoQuality.indexOf(unit.quality) === -1) {
				return false;
			}

			desc = this.getItemDesc(unit).split("\n").join(" | ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]/gi, "").trim();

			break;
		case "Kept":
		case "Field Kept":
		case "Runeword Kept":
		case "Cubing Kept":
		case "Shopped":
		case "Gambled":
		case "Dropped":
			desc = this.getItemDesc(unit).split("\n").join(" | ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]|\/|\\/gi, "").trim();

			break;
		case "No room for":
			desc = unit.name;

			break;
		default:
			desc = unit.fname.split("\n").reverse().join(" ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]|\/|\\/gi, "").trim();

			break;
		}

		return this.fileAction("logs/ItemLog.txt", 2, dateString + " <" + me.profile + "> <" + action + "> (" + Pickit.itemQualityToName(unit.quality) + ") " + desc + (text ? " {" + text + "}" : "") + "\n");
	},

	// Log kept item stats in the manager.
	logItem: function (action, unit, keptLine) {
		if (!this.useItemLog) return false;
		if (!Config.LogKeys && ["pk1", "pk2", "pk3"].includes(unit.code)) return false;
		if (!Config.LogOrgans && ["dhn", "bey", "mbr"].includes(unit.code)) return false;
		if (!Config.LogLowRunes && ["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "r10", "r11", "r12", "r13", "r14"].includes(unit.code)) return false;
		if (!Config.LogMiddleRunes && ["r15", "r16", "r17", "r18", "r19", "r20", "r21", "r22", "r23"].includes(unit.code)) return false;
		if (!Config.LogHighRunes && ["r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32", "r33"].includes(unit.code)) return false;
		if (!Config.LogLowGems && ["gcv", "gcy", "gcb", "gcg", "gcr", "gcw", "skc", "gfv", "gfy", "gfb", "gfg", "gfr", "gfw", "skf", "gsv", "gsy", "gsb", "gsg", "gsr", "gsw", "sku"].includes(unit.code)) return false;
		if (!Config.LogHighGems && ["gzv", "gly", "glb", "glg", "glr", "glw", "skl", "gpv", "gpy", "gpb", "gpg", "gpr", "gpw", "skz"].includes(unit.code)) return false;

		for (let i = 0; i < Config.SkipLogging.length; i++) {
			if (Config.SkipLogging[i] === unit.classid || Config.SkipLogging[i] === unit.code) return false;
		}

		let lastArea;
		let name = unit.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<:;.*]|\/|\\/g, "").trim();
		let desc = this.getItemDesc(unit);
		let color = (unit.getColor() || -1);

		if (action.match("kept", "i")) {
			lastArea = DataFile.getStats().lastArea;
			lastArea && (desc += ("\n\\xffc0Area: " + lastArea));
		}

		let code = this.getItemCode(unit);
		let sock = unit.getItem();

		if (sock) {
			do {
				if (sock.itemType === sdk.items.type.Jewel) {
					desc += "\n\n";
					desc += this.getItemDesc(sock);
				}
			} while (sock.getNext());
		}

		keptLine && (desc += ("\n\\xffc0Line: " + keptLine));
		desc += "$" + (unit.ethereal ? ":eth" : "");

		let itemObj = {
			title: action + " " + name,
			description: desc,
			image: code,
			textColor: unit.quality,
			itemColor: color,
			header: "",
			sockets: this.getItemSockets(unit)
		};

		D2Bot.printToItemLog(itemObj);

		return true;
	},

	// skip low items: MuleLogger
	skipItem: function (id) {
		return [
			sdk.items.HandAxe, sdk.items.Wand, sdk.items.Club, sdk.items.ShortSword, sdk.items.Javelin, sdk.items.ShortStaff, sdk.items.Katar,
			sdk.items.Buckler, sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.RejuvenationPotion, sdk.items.FullRejuvenationPotion,
			sdk.items.ThawingPotion, sdk.items.TomeofTownPortal, sdk.items.TomeofIdentify, sdk.items.ScrollofIdentify, sdk.items.ScrollofTownPortal,
			sdk.items.Key, sdk.items.MinorHealingPotion, sdk.items.LightHealingPotion, sdk.items.HealingPotion, sdk.items.GreaterHealingPotion,
			sdk.items.SuperHealingPotion, sdk.items.MinorManaPotion, sdk.items.LightManaPotion, sdk.items.ManaPotion, sdk.items.GreaterManaPotion,
			sdk.items.SuperManaPotion
		].includes(id);
	},

	// Change into werewolf or werebear
	shapeShift: function (mode) {
		let [skill, state] = (() => {
			switch (mode.toString().toLowerCase()) {
			case "0":
				return [-1, -1];
			case "1":
			case "werewolf":
				return [sdk.skills.Werewolf, sdk.states.Wearwolf];
			case "2":
			case "werebear":
				return [sdk.skills.Werebear, sdk.states.Wearbear];
			default:
				throw new Error("shapeShift: Invalid parameter");
			}
		})();

		// don't have wanted skill
		if (!Skill.canUse(skill)) return false;
		// already in wanted state
		if (me.getState(state)) return true;

		let slot = Attack.getPrimarySlot();
		me.switchWeapons(Precast.getBetterSlot(skill));

		for (let i = 0; i < 3; i += 1) {
			Skill.cast(skill, sdk.skills.hand.Right);
			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (me.getState(state)) {
					delay(250);
					me.weaponswitch !== slot && me.switchWeapons(slot);

					return true;
				}

				delay(10);
			}
		}

		me.weaponswitch !== slot && me.switchWeapons(slot);

		return false;
	},

	// Change back to human shape
	unShift: function () {
		if (me.getState(sdk.states.Wearwolf) || me.getState(sdk.states.Wearbear)) {
			for (let i = 0; i < 3; i += 1) {
				Skill.cast(me.getState(sdk.states.Wearwolf) ? sdk.skills.Werewolf : sdk.skills.Werebear);

				let tick = getTickCount();

				while (getTickCount() - tick < 2000) {
					if (!me.getState(sdk.states.Wearwolf) && !me.getState(sdk.states.Wearbear)) {
						delay(250);

						return true;
					}

					delay(10);
				}
			}
		} else {
			return true;
		}

		return false;
	},

	// Go to town when low on hp/mp or when out of potions. can be upgraded to check for curses etc.
	townCheck: function () {
		if (!Town.canTpToTown()) return false;

		let tTick = getTickCount();
		let check = false;

		if (Config.TownCheck && !me.inTown) {
			try {
				if (Town.needPotions() || (Config.OpenChests.Enabled && Town.needKeys())) {
					check = true;
				}
			} catch (e) {
				return false;
			}

			if (check) {
				// check that townchicken is running - so we don't spam needing potions if it isn't
				let townChick = getScript("tools/TownChicken.js");
				if (!townChick || townChick && !townChick.running) {
					return false;
				}

				townChick.send("townCheck");
				console.log("townCheck check Duration: " + (getTickCount() - tTick));

				return true;
			}
		}

		return false;
	},

	// Log someone's gear
	spy: function (name) {
		includeIfNotIncluded("oog.js");
		includeIfNotIncluded("common/prototypes.js");

		let unit = getUnit(-1, name);

		if (!unit) {
			console.warn("player not found");
			return false;
		}

		let item = unit.getItem();

		if (item) {
			do {
				this.logItem(unit.name, item);
			} while (item.getNext());
		}

		return true;
	},

	fileAction: function (path, mode, msg) {
		let contents = "";

		MainLoop:
		for (let i = 0; i < 30; i += 1) {
			try {
				switch (mode) {
				case 0: // read
					contents = FileTools.readText(path);

					break MainLoop;
				case 1: // write
					FileTools.writeText(path, msg);

					break MainLoop;
				case 2: // append
					FileTools.appendText(path, msg);

					break MainLoop;
				}
			} catch (e) {
				continue;
			}

			delay(100);
		}

		return mode === 0 ? contents : true;
	},

	errorConsolePrint: true,
	screenshotErrors: true,

	// Report script errors to logs/ScriptErrorLog.txt
	errorReport: function (error, script) {
		let msg, oogmsg, filemsg, source, stack;
		let stackLog = "";

		let date = new Date();
		let dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace(/-/g, "/").replace("T", " ") + "]";

		if (typeof error === "string") {
			msg = error;
			oogmsg = error.replace(/ÿc[0-9!"+<:;.*]/gi, "");
			filemsg = dateString + " <" + me.profile + "> " + error.replace(/ÿc[0-9!"+<:;.*]/gi, "") + "\n";
		} else {
			source = error.fileName.substring(error.fileName.lastIndexOf("\\") + 1, error.fileName.length);
			msg = "ÿc1Error in ÿc0" + script + " ÿc1(" + source + " line ÿc1" + error.lineNumber + "): ÿc1" + error.message;
			oogmsg = " Error in " + script + " (" + source + " #" + error.lineNumber + ") " + error.message + " (Area: " + me.area + ", Ping:" + me.ping + ", Game: " + me.gamename + ")";
			filemsg = dateString + " <" + me.profile + "> " + msg.replace(/ÿc[0-9!"+<:;.*]/gi, "") + "\n";

			if (error.hasOwnProperty("stack")) {
				stack = error.stack;

				if (stack) {
					stack = stack.split("\n");

					if (stack && typeof stack === "object") {
						stack.reverse();
					}

					for (let i = 0; i < stack.length; i += 1) {
						if (stack[i]) {
							stackLog += stack[i].substr(0, stack[i].indexOf("@") + 1) + stack[i].substr(stack[i].lastIndexOf("\\") + 1, stack[i].length - 1);

							if (i < stack.length - 1) {
								stackLog += ", ";
							}
						}
					}
				}
			}

			stackLog && (filemsg += "Stack: " + stackLog + "\n");
		}

		this.errorConsolePrint && D2Bot.printToConsole(oogmsg, sdk.colors.D2Bot.Gray);
		showConsole();
		console.log(msg);
		this.fileAction("logs/ScriptErrorLog.txt", 2, filemsg);

		if (this.screenshotErrors) {
			takeScreenshot();
			delay(500);
		}
	},

	debugLog: function (msg) {
		if (!Config.Debug) return;
		debugLog(me.profile + ": " + msg);
	},

	// Use a NPC menu. Experimental function, subject to change
	// id = string number (with exception of Ressurect merc).
	useMenu: function (id) {
		//print("useMenu " + getLocaleString(id));

		let npc;

		switch (id) {
		case sdk.menu.RessurectMerc: // (non-English dialog)
		case sdk.menu.Trade: // (crash dialog)
			npc = getInteractedNPC();

			if (npc) {
				npc.useMenu(id);
				delay(750);

				return true;
			}

			break;
		}

		let lines = getDialogLines();
		if (!lines) return false;

		for (let i = 0; i < lines.length; i += 1) {
			if (lines[i].selectable && lines[i].text.includes(getLocaleString(id))) {
				getDialogLines()[i].handler();
				delay(750);

				return true;
			}
		}

		return false;
	},

	clone: function (obj) {
		let copy;

		// Handle the 3 simple types, and null or undefined
		if (null === obj || "object" !== typeof obj) {
			return obj;
		}

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());

			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];

			for (let i = 0; i < obj.length; i += 1) {
				copy[i] = this.clone(obj[i]);
			}

			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};

			for (let attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = this.clone(obj[attr]);
				}
			}

			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	},

	copy: function (from) {
		let obj = {};

		for (let i in from) {
			if (from.hasOwnProperty(i)) {
				obj[i] = this.clone(from[i]);
			}
		}

		return obj;
	},

	poll: function (check, timeout = 6000, sleep = 40) {
		let ret, start = getTickCount();

		while (getTickCount() - start <= timeout) {
			if ((ret = check())) {
				return ret;
			}

			delay(sleep);
		}

		return false;
	},

	// returns array of UI flags that are set, or null if none are set
	getUIFlags: function (excluded = []) {
		if (!me.gameReady) return null;

		const MAX_FLAG = 37; // anything over 37 crashes
		let flags = [];

		if (typeof excluded !== "object" || excluded.length === undefined) {
			// not an array-like object, make it an array
			excluded = [excluded];
		}

		for (let c = 1; c <= MAX_FLAG; c++) {
			// 0x23 is always set in-game
			if (c !== 0x23 && excluded.indexOf(c) === -1 && getUIFlag(c)) {
				flags.push(c);
			}
		}

		return flags.length ? flags : null;
	},

	checkQuest: function (id, state) {
		Packet.questRefresh();
		delay(500);
		return me.getQuest(id, state);
	},

	getQuestStates: function (questID) {
		if (!me.gameReady) return [];
		Packet.questRefresh();
		delay(500);
		const MAX_STATE = 16;
		let questStates = [];

		for (let i = 0; i < MAX_STATE; i++) {
			if (me.getQuest(questID, i)) {
				questStates.push(i);
			}

			delay(50);
		}

		return questStates;
	}
};

const Sort = {
	// Sort units by comparing distance between the player
	units: function (a, b) {
		return Math.round(getDistance(me.x, me.y, a.x, a.y)) - Math.round(getDistance(me.x, me.y, b.x, b.y));
	},

	// Sort preset units by comparing distance between the player (using preset x/y calculations)
	presetUnits: function (a, b) {
		return getDistance(me, a.roomx * 5 + a.x, a.roomy * 5 + a.y) - getDistance(me, b.roomx * 5 + b.x, b.roomy * 5 + b.y);
	},

	// Sort arrays of x,y coords by comparing distance between the player
	points: function (a, b) {
		return getDistance(me, a[0], a[1]) - getDistance(me, b[0], b[1]);
	},

	numbers: function (a, b) {
		return a - b;
	}
};

const Experience = {
	totalExp: [0, 0, 500, 1500, 3750, 7875, 14175, 22680, 32886, 44396, 57715, 72144, 90180, 112725, 140906, 176132, 220165, 275207, 344008, 430010, 537513, 671891, 839864, 1049830, 1312287, 1640359, 2050449, 2563061, 3203826, 3902260, 4663553, 5493363, 6397855, 7383752, 8458379, 9629723, 10906488, 12298162, 13815086, 15468534, 17270791, 19235252, 21376515, 23710491, 26254525, 29027522, 32050088, 35344686, 38935798, 42850109, 47116709, 51767302, 56836449, 62361819, 68384473, 74949165, 82104680, 89904191, 98405658, 107672256, 117772849, 128782495, 140783010, 153863570, 168121381, 183662396, 200602101, 219066380, 239192444, 261129853, 285041630, 311105466, 339515048, 370481492, 404234916, 441026148, 481128591, 524840254, 572485967, 624419793, 681027665, 742730244, 809986056, 883294891, 963201521, 1050299747, 1145236814, 1248718217, 1361512946, 1484459201, 1618470619, 1764543065, 1923762030, 2097310703, 2286478756, 2492671933, 2717422497, 2962400612, 3229426756, 3520485254, 0, 0],
	nextExp: [0, 500, 1000, 2250, 4125, 6300, 8505, 10206, 11510, 13319, 14429, 18036, 22545, 28181, 35226, 44033, 55042, 68801, 86002, 107503, 134378, 167973, 209966, 262457, 328072, 410090, 512612, 640765, 698434, 761293, 829810, 904492, 985897, 1074627, 1171344, 1276765, 1391674, 1516924, 1653448, 1802257, 1964461, 2141263, 2333976, 2544034, 2772997, 3022566, 3294598, 3591112, 3914311, 4266600, 4650593, 5069147, 5525370, 6022654, 6564692, 7155515, 7799511, 8501467, 9266598, 10100593, 11009646, 12000515, 13080560, 14257811, 15541015, 16939705, 18464279, 20126064, 21937409, 23911777, 26063836, 28409582, 30966444, 33753424, 36791232, 40102443, 43711663, 47645713, 51933826, 56607872, 61702579, 67255812, 73308835, 79906630, 87098226, 94937067, 103481403, 112794729, 122946255, 134011418, 146072446, 159218965, 173548673, 189168053, 206193177, 224750564, 244978115, 267026144, 291058498, 0, 0],
	expCurve: [13, 16, 110, 159, 207, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 225, 174, 92, 38, 5],
	expPenalty: [1024, 976, 928, 880, 832, 784, 736, 688, 640, 592, 544, 496, 448, 400, 352, 304, 256, 192, 144, 108, 81, 61, 46, 35, 26, 20, 15, 11, 8, 6, 5],
	monsterExp: [
		[1, 1, 1], [30, 78, 117], [40, 104, 156], [50, 131, 197], [60, 156, 234], [70, 182, 273], [80, 207, 311], [90, 234, 351], [100, 260, 390], [110, 285, 428], [120, 312, 468],
		[130, 338, 507], [140, 363, 545], [154, 401, 602], [169, 440, 660], [186, 482, 723], [205, 533, 800], [225, 584, 876], [248, 644, 966], [273, 708, 1062], [300, 779, 1169],
		[330, 857, 1286], [363, 942, 1413], [399, 1035, 1553], [439, 1139, 1709], [470, 1220, 1830], [503, 1305, 1958], [538, 1397, 2096], [576, 1494, 2241], [616, 1598, 2397],
		[659, 1709, 2564], [706, 1832, 2748], [755, 1958, 2937], [808, 2097, 3146], [864, 2241, 3362], [925, 2399, 3599], [990, 2568, 3852], [1059, 2745, 4118], [1133, 2939, 4409],
		[1212, 3144, 4716], [1297, 3365, 5048], [1388, 3600, 5400], [1485, 3852, 5778], [1589, 4121, 6182], [1693, 4409, 6614], [1797, 4718, 7077], [1901, 5051, 7577],
		[2005, 5402, 8103], [2109, 5783, 8675], [2213, 6186, 9279], [2317, 6618, 9927], [2421, 7080, 10620], [2525, 7506, 11259], [2629, 7956, 11934], [2733, 8435, 12653],
		[2837, 8942, 13413], [2941, 9477, 14216], [3045, 10044, 15066], [3149, 10647, 15971], [3253, 11286, 16929], [3357, 11964, 17946], [3461, 12680, 19020],
		[3565, 13442, 20163], [3669, 14249, 21374], [3773, 15104, 22656], [3877, 16010, 24015], [3981, 16916, 25374], [4085, 17822, 26733], [4189, 18728, 28092],
		[4293, 19634, 29451], [4397, 20540, 30810], [4501, 21446, 32169], [4605, 22352, 33528], [4709, 23258, 34887], [4813, 24164, 36246], [4917, 25070, 37605],
		[5021, 25976, 38964], [5125, 26882, 40323], [5229, 27788, 41682], [5333, 28694, 43041], [5437, 29600, 44400], [5541, 30506, 45759], [5645, 31412, 47118],
		[5749, 32318, 48477], [5853, 33224, 49836], [5957, 34130, 51195], [6061, 35036, 52554], [6165, 35942, 53913], [6269, 36848, 55272], [6373, 37754, 56631],
		[6477, 38660, 57990], [6581, 39566, 59349], [6685, 40472, 60708], [6789, 41378, 62067], [6893, 42284, 63426], [6997, 43190, 64785], [7101, 44096, 66144],
		[7205, 45002, 67503], [7309, 45908, 68862], [7413, 46814, 70221], [7517, 47720, 71580], [7621, 48626, 72939], [7725, 49532, 74298], [7829, 50438, 75657],
		[7933, 51344, 77016], [8037, 52250, 78375], [8141, 53156, 79734], [8245, 54062, 81093], [8349, 54968, 82452], [8453, 55874, 83811], [160000, 160000, 160000]
	],
	// Percent progress into the current level. Format: xx.xx%
	progress: function () {
		return me.getStat(sdk.stats.Level) === 99 ? 0 : (((me.getStat(sdk.stats.Experience) - this.totalExp[me.getStat(sdk.stats.Level)]) / this.nextExp[me.getStat(sdk.stats.Level)]) * 100).toFixed(2);
	},

	// Total experience gained in current run
	gain: function () {
		return (me.getStat(sdk.stats.Experience) - DataFile.getStats().experience);
	},

	// Percent experience gained in current run
	gainPercent: function () {
		return me.getStat(sdk.stats.Level) === 99 ? 0 : (this.gain() * 100 / this.nextExp[me.getStat(sdk.stats.Level)]).toFixed(6);
	},

	// Runs until next level
	runsToLevel: function () {
		return Math.round(((100 - this.progress()) / 100) * this.nextExp[me.getStat(sdk.stats.Level)] / this.gain());
	},

	// Total runs needed for next level (not counting current progress)
	totalRunsToLevel: function () {
		return Math.round(this.nextExp[me.getStat(sdk.stats.Level)] / this.gain());
	},

	// Total time till next level
	timeToLevel: function () {
		let tTLrawSeconds = (Math.floor((getTickCount() - me.gamestarttime) / 1000)).toString();
		let tTLrawtimeToLevel = this.runsToLevel() * tTLrawSeconds;
		let tTLDays = Math.floor(tTLrawtimeToLevel / 86400);
		let tTLHours = Math.floor((tTLrawtimeToLevel % 86400) / 3600);
		let tTLMinutes = Math.floor(((tTLrawtimeToLevel % 86400) % 3600) / 60);
		//let tTLSeconds = ((tTLrawtimeToLevel % 86400) % 3600) % 60;

		//return tDays + "d " + tTLHours + "h " + tTLMinutes + "m " + tTLSeconds + "s";
		//return tTLDays + "d " + tTLHours + "h " + tTLMinutes + "m";
		return (tTLDays ? tTLDays + " d " : "") + (tTLHours ? tTLHours + " h " : "") + (tTLMinutes ? tTLMinutes + " m" : "");
	},

	// Get Game Time
	getGameTime: function () {
		let rawMinutes = Math.floor((getTickCount() - me.gamestarttime) / 60000).toString();
		let rawSeconds = (Math.floor((getTickCount() - me.gamestarttime) / 1000) % 60).toString();

		rawMinutes <= 9 && (rawMinutes = "0" + rawMinutes);
		rawSeconds <= 9 && (rawSeconds = "0" + rawSeconds);

		return " (" + rawMinutes + ":" + rawSeconds + ")";
	},

	// Log to manager
	log: function () {
		let gain = this.gain();
		let progress = this.progress();
		let runsToLevel = this.runsToLevel();
		let getGameTime = this.getGameTime();
		let string = "[Game: " + me.gamename + (me.gamepassword ? "//" + me.gamepassword : "") + getGameTime + "] [Level: " + me.getStat(sdk.stats.Level) + " (" + progress + "%)] [XP: " + gain + "] [Games ETA: " + runsToLevel + "]";

		if (gain) {
			D2Bot.printToConsole(string, sdk.colors.D2Bot.Blue);

			if (me.getStat(sdk.stats.Level) > DataFile.getStats().level) {
				D2Bot.printToConsole("Congrats! You gained a level. Current level:" + me.getStat(sdk.stats.Level), sdk.colors.D2Bot.Green);
			}
		}
	}
};

const Packet = {
	openMenu: function (unit) {
		if (unit.type !== sdk.unittype.NPC) throw new Error("openMenu: Must be used on NPCs.");
		if (getUIFlag(sdk.uiflags.NPCMenu)) return true;
		let pingDelay = (me.gameReady ? me.ping : 125);

		for (let i = 0; i < 5; i += 1) {
			unit.distance > 4 && Pather.moveToUnit(unit);
			Packet.entityInteract(unit);
			let tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUIFlag(sdk.uiflags.NPCMenu)) {
					delay(Math.max(500, pingDelay * 2));

					return true;
				}

				if (getInteractedNPC() && getTickCount() - tick > 1000) {
					me.cancel();
				}

				delay(100);
			}

			sendPacket(1, sdk.packets.send.NPCInit, 4, 1, 4, unit.gid);
			delay(pingDelay + 1 * 2);
			Packet.cancelNPC(unit);
			delay(pingDelay + 1 * 2);
			this.flash(me.gid);
		}

		return false;
	},

	startTrade: function (unit, mode) {
		if (unit.type !== sdk.unittype.NPC) throw new Error("Unit.startTrade: Must be used on NPCs.");
		if (getUIFlag(sdk.uiflags.Shop)) return true;

		const gamble = mode === "Gamble";
		console.info(true, mode + " at " + unit.name);

		if (this.openMenu(unit)) {
			for (let i = 0; i < 10; i += 1) {
				delay(200);

				i % 2 === 0 && sendPacket(1, sdk.packets.send.EntityAction, 4, gamble ? 2 : 1, 4, unit.gid, 4, 0);

				if (unit.itemcount > 0) {
					delay(200);
					console.info(false, "Successfully started " + mode + " at " + unit.name);
					return true;
				}
			}
		}

		return false;
	},

	buyItem: function (unit, shiftBuy, gamble) {
		let oldGold = me.gold;
		let itemCount = me.itemcount;
		let npc = getInteractedNPC();

		try {
			if (!npc) throw new Error("buyItem: No NPC menu open.");

			// Can we afford the item?
			if (oldGold < unit.getItemCost(sdk.items.cost.ToBuy)) return false;

			for (let i = 0; i < 3; i += 1) {
				sendPacket(1, sdk.packets.send.NPCBuy, 4, npc.gid, 4, unit.gid, 4, shiftBuy ? 0x80000000 : gamble ? 0x2 : 0x0, 4, 0);

				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
					if (shiftBuy && me.gold < oldGold) return true;
					if (itemCount !== me.itemcount) return true;

					delay(10);
				}
			}
		} catch (e) {
			console.error(e);
		}

		return false;
	},

	buyScroll: function (unit, tome, shiftBuy) {
		let oldGold = me.gold;
		let itemCount = me.itemcount;
		let npc = getInteractedNPC();
		tome === undefined && (tome = me.findItem(
			(unit.classid === sdk.items.ScrollofTownPortal ? sdk.items.TomeofTownPortal : sdk.items.TomeofIdentify),
			sdk.items.mode.inStorage, sdk.storage.Inventory
		));
		let preCount = !!tome ? tome.getStat(sdk.stats.Quantity) : 0;

		try {
			if (!npc) throw new Error("buyItem: No NPC menu open.");

			// Can we afford the item?
			if (oldGold < unit.getItemCost(sdk.items.cost.ToBuy)) return false;

			for (let i = 0; i < 3; i += 1) {
				sendPacket(1, sdk.packets.send.NPCBuy, 4, npc.gid, 4, unit.gid, 4, shiftBuy ? 0x80000000 : 0x0, 4, 0);

				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
					if (shiftBuy && me.gold < oldGold) return true;
					if (itemCount !== me.itemcount) return true;
					if (tome && tome.getStat(sdk.stats.Quantity) > preCount) return true;
					delay(10);
				}
			}
		} catch (e) {
			console.error(e);
		}

		return false;
	},

	sellItem: function (unit) {
		// Check if it's an item we want to buy
		if (unit.type !== sdk.unittype.Item) throw new Error("Unit.sell: Must be used on items.");
		if (!unit.sellable) {
			console.error((new Error("Item is unsellable")));
			return false;
		}

		let itemCount = me.itemcount;
		let npc = getInteractedNPC();

		if (!npc) return false;

		for (let i = 0; i < 5; i += 1) {
			sendPacket(1, sdk.packets.send.NPCSell, 4, npc.gid, 4, unit.gid, 4, 0, 4, 0);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (me.itemcount !== itemCount) return true;
				delay(10);
			}
		}

		return false;
	},

	identifyItem: function (unit, tome) {
		if (!unit || unit.identified) return false;

		CursorLoop:
		for (let i = 0; i < 3; i += 1) {
			sendPacket(1, sdk.packets.send.IndentifyItem, 4, unit.gid, 4, tome.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (getCursorType() === sdk.cursortype.Identify) {
					break CursorLoop;
				}

				delay(10);
			}
		}

		if (getCursorType() !== sdk.cursortype.Identify) {
			return false;
		}

		for (let i = 0; i < 3; i += 1) {
			getCursorType() === sdk.cursortype.Identify && sendPacket(1, sdk.packets.send.IndentifyItem, 4, unit.gid, 4, tome.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (unit.identified) {
					delay(50);
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	itemToCursor: function (item) {
		// Something already on cursor
		if (me.itemoncursor) {
			let cursorItem = Game.getCursorUnit();
			// Return true if the item is already on cursor
			if (cursorItem.gid === item.gid) {
				return true;
			}
			this.dropItem(cursorItem); // If another item is on cursor, drop it
		}

		for (let i = 0; i < 15; i += 1) {
			// equipped
			item.isEquipped ? sendPacket(1, sdk.packets.send.PickupBodyItem, 2, item.bodylocation) : sendPacket(1, sdk.packets.send.PickupBufferItem, 4, item.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (me.itemoncursor) return true;
				delay(10);
			}
		}

		return false;
	},

	dropItem: function (item) {
		if (!this.itemToCursor(item)) return false;

		for (let i = 0; i < 15; i += 1) {
			sendPacket(1, sdk.packets.send.DropItem, 4, item.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (!me.itemoncursor) return true;
				delay(10);
			}
		}

		return false;
	},

	givePotToMerc: function (item) {
		if (!!item
			&& [sdk.items.type.HealingPotion, sdk.items.type.RejuvPotion, sdk.items.type.ThawingPotion, sdk.items.type.AntidotePotion].includes(item.itemType)) {
			switch (item.location) {
			case sdk.storage.Belt:
				return this.useBeltItemForMerc(item);
			case sdk.storage.Inventory:
				if (this.itemToCursor(item)) {
					sendPacket(1, sdk.packets.send.MercItem, 2, 0);

					return true;
				}

				break;
			default:
				break;
			}
		}

		return false;
	},

	placeInBelt: function (item, xLoc) {
		item.toCursor(true) && new PacketBuilder().byte(sdk.packets.send.ItemToBelt).dword(item.gid).dword(xLoc).send();
		return Misc.poll(() => item.isInBelt, 500, 100);
	},

	click: function (who, toCursor = false) {
		if (!who || !copyUnit(who).x) return false;
		new PacketBuilder().byte(sdk.packets.send.PickupItem).dword(sdk.unittype.Item).dword(who.gid).dword(toCursor ? 1 : 0).send();
		return true;
	},

	entityInteract: function (who) {
		if (!who || !copyUnit(who).x) return false;
		sendPacket(1, sdk.packets.send.InteractWithEntity, 4, who.type, 4, who.gid);
		return true;
	},

	cancelNPC: function (who) {
		if (!who || !copyUnit(who).x) return false;
		sendPacket(1, sdk.packets.send.NPCCancel, 4, who.type, 4, who.gid);
		return true;
	},

	useBeltItemForMerc: function (who) {
		if (!who) return false;
		sendPacket(1, sdk.packets.send.UseBeltItem, 4, who.gid, 4, 1, 4, 0);
		return true;
	},

	castSkill: function (hand, wX, wY) {
		hand = (hand === sdk.skills.hand.Right) ? sdk.packets.send.RightSkillOnLocation : sdk.packets.send.LeftSkillOnLocation;
		sendPacket(1, hand, 2, wX, 2, wY);
	},

	unitCast: function (hand, who) {
		hand = (hand === sdk.skills.hand.Right) ? sdk.packets.send.RightSkillOnEntityEx3 : sdk.packets.send.LeftSkillOnEntityEx3;
		sendPacket(1, hand, 4, who.type, 4, who.gid);
	},

	telekinesis: function (who) {
		if (!who || !Skill.setSkill(sdk.skills.Telekinesis, sdk.skills.hand.Right)) return false;
		sendPacket(1, sdk.packets.send.RightSkillOnEntityEx3, 4, who.type, 4, who.gid);
		return true;
	},

	enchant: function (who) {
		if (!who || !Skill.setSkill(sdk.skills.Enchant, sdk.skills.hand.Right)) return false;
		sendPacket(1, sdk.packets.send.RightSkillOnEntityEx3, 4, who.type, 4, who.gid);
		return true;
	},

	teleport: function (wX, wY) {
		if (![wX, wY].every(n => typeof n === "number") || !Skill.setSkill(sdk.skills.Teleport, sdk.skills.hand.Right)) return false;
		sendPacket(1, sdk.packets.send.RightSkillOnLocation, 2, wX, 2, wY);
		return true;
	},

	// moveNPC: function (npc, dwX, dwY) { // commented the patched packet
	// 	//sendPacket(1, sdk.packets.send.MakeEntityMove, 4, npc.type, 4, npc.gid, 4, dwX, 4, dwY);
	// },

	teleWalk: function (x, y, maxDist = 5) {
		!this.telewalkTick && (this.telewalkTick = 0);

		if (getDistance(me, x, y) > 10 && getTickCount() - this.telewalkTick > 3000 && Attack.validSpot(x, y)) {
			for (let i = 0; i < 5; i += 1) {
				sendPacket(1, sdk.packets.send.UpdatePlayerPos, 2, x + rand(-1, 1), 2, y + rand(-1, 1));
				delay(me.ping + 1);
				sendPacket(1, sdk.packets.send.RequestEntityUpdate, 4, me.type, 4, me.gid);
				delay(me.ping + 1);

				if (getDistance(me, x, y) < maxDist) {
					delay(200);

					return true;
				}
			}

			this.telewalkTick = getTickCount();
		}

		return false;
	},

	questRefresh: function () {
		sendPacket(1, sdk.packets.send.UpdateQuests);
	},

	flash: function (gid, wait = 0) {
		wait === 0 && (wait = 300 + (me.gameReady ? 2 * me.ping : 300));
		sendPacket(1, sdk.packets.send.RequestEntityUpdate, 4, 0, 4, gid);

		if (wait > 0) {
			delay(wait);
		}
	},

	changeStat: function (stat, value) {
		if (value > 0) {
			getPacket(1, 0x1d, 1, stat, 1, value);
		}
	},

	// specialized wrapper for addEventListener
	addListener: function (packetType, callback) {
		if (typeof packetType === "number") {
			packetType = [packetType];
		}

		if (typeof packetType === "object" && packetType.length) {
			addEventListener("gamepacket", packet => (packetType.indexOf(packet[0]) > -1 ? callback(packet) : false));

			return callback;
		}

		return null;
	},

	removeListener: callback => removeEventListener("gamepacket", callback), // just a wrapper
};

/*

new PacketBuilder() - create new packet object

Example (Spoof 'reassign player' packet to client):
	new PacketBuilder().byte(sdk.packets.recv.ReassignPlayer).byte(0).dword(me.gid).word(x).word(y).byte(1).get();

Example (Spoof 'player move' packet to server):
	new PacketBuilder().byte(sdk.packets.send.RunToLocation).word(x).word(y).send();
*/

function PacketBuilder () {
	// globals DataView ArrayBuffer
	if (this.__proto__.constructor !== PacketBuilder) throw new Error("PacketBuilder must be called with 'new' operator!");

	let queue = [], count = 0;

	// accepts any number of arguments
	let enqueue = (type, size) => (...args) => {
		args.forEach(arg => {
			if (type === "String") {
				arg = stringToEUC(arg);
				size = arg.length + 1;
			}

			queue.push({type: type, size: size, data: arg});
			count += size;
		});

		return this;
	};

	this.float = enqueue("Float32", 4);
	this.dword = enqueue("Uint32", 4);
	this.word = enqueue("Uint16", 2);
	this.byte = enqueue("Uint8", 1);
	this.string = enqueue("String");

	this.buildDataView = () => {
		let dv = new DataView(new ArrayBuffer(count)), i = 0;
		queue.forEach(field => {
			if (field.type === "String") {
				for (let l = 0; l < field.data.length; l++) {
					dv.setUint8(i++, field.data.charCodeAt(l), true);
				}

				i += field.size - field.data.length; // fix index for field.size !== field.data.length
			} else {
				dv["set" + field.type](i, field.data, true);
				i += field.size;
			}
		});

		return dv;
	};

	this.send = () => (sendPacket(this.buildDataView().buffer), this);
	this.spoof = () => (getPacket(this.buildDataView().buffer), this);
	this.get = this.spoof; // same thing but spoof has clearer intent than get
}

const LocalChat = new function () {
	const LOCAL_CHAT_ID = 0xD2BAAAA;
	let toggle, proxy = say;

	let relay = (msg) => D2Bot.shoutGlobal(JSON.stringify({ msg: msg, realm: me.realm, charname: me.charname, gamename: me.gamename }), LOCAL_CHAT_ID);

	let onChatInput = (speaker, msg) => {
		relay(msg);
		return true;
	};

	let onChatRecv = (mode, msg) => {
		if (mode !== LOCAL_CHAT_ID) {
			return;
		}

		msg = JSON.parse(msg);

		if (me.gamename === msg.gamename && me.realm === msg.realm) {
			new PacketBuilder().byte(38).byte(1, me.locale).word(2, 0, 0).byte(90).string(msg.charname, msg.msg).get();
		}
	};

	let onKeyEvent = (key) => {
		if (toggle === key) {
			this.init(true);
		}
	};

	this.init = (cycle = false) => {
		if (!Config.LocalChat.Enabled) return;

		Config.LocalChat.Mode = (Config.LocalChat.Mode + cycle) % 3;
		print("ÿc2LocalChat enabled. Mode: " + Config.LocalChat.Mode);

		switch (Config.LocalChat.Mode) {
		case 2:
			removeEventListener("chatinputblocker", onChatInput);
			addEventListener("chatinputblocker", onChatInput);
		// eslint-disable-next-line no-fallthrough
		case 1:
			removeEventListener("copydata", onChatRecv);
			addEventListener("copydata", onChatRecv);
			say = (msg, force = false) => force ? proxy(msg) : relay(msg);
			break;
		case 0:
			removeEventListener("chatinputblocker", onChatInput);
			removeEventListener("copydata", onChatRecv);
			say = proxy;
			break;
		}

		if (Config.LocalChat.Toggle) {
			toggle = typeof Config.LocalChat.Toggle === "string" ? Config.LocalChat.Toggle.charCodeAt(0) : Config.LocalChat.Toggle;
			Config.LocalChat.Toggle = false;
			addEventListener("keyup", onKeyEvent);
		}
	};
};

const Messaging = {
	sendToScript: function (name, msg) {
		let script = getScript(name);

		if (script && script.running) {
			script.send(msg);

			return true;
		}

		return false;
	},

	sendToProfile: function (profileName, mode, message, getResponse = false) {
		let response;

		function copyDataEvent(mode2, msg) {
			if (mode2 === mode) {
				let obj;

				try {
					obj = JSON.parse(msg);
				} catch (e) {
					return false;
				}

				if (obj.hasOwnProperty("sender") && obj.sender === profileName) {
					response = Misc.copy(obj);
				}

				return true;
			}

			return false;
		}

		getResponse && addEventListener("copydata", copyDataEvent);

		if (!sendCopyData(null, profileName, mode, JSON.stringify({message: message, sender: me.profile}))) {
			//print("sendToProfile: failed to get response from " + profileName);
			getResponse && removeEventListener("copydata", copyDataEvent);

			return false;
		}

		if (getResponse) {
			delay(200);
			removeEventListener("copydata", copyDataEvent);

			if (!!response) {
				return response;
			}

			return false;
		}

		return true;
	}
};

// Unused anywhere
// var Events = {
// 	// gamepacket
// 	gamePacket: function (bytes) {
// 		let temp;

// 		switch (bytes[0]) {
// 		// Block movement after using TP/WP/Exit
// 		case 0x0D: // Player Stop
// 			// This can mess up death screen so disable for characters that are allowed to die
// 			if (Config.LifeChicken > 0) {
// 				return true;
// 			}

// 			break;
// 		// Block poison skills that might crash the client
// 		case 0x4C: // Cast skill on target
// 		case 0x4D: // Cast skill on coords
// 			temp = Number("0x" + bytes[7].toString(16) + bytes[6].toString(16));

// 			// Match Poison Javelin, Plague Javelin or Poison Nova
// 			if (temp && [15, 25, 92].indexOf(temp) > -1) {
// 				return true;
// 			}

// 			break;
// 		}

// 		return false;
// 	}
// };
