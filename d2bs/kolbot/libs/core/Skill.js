/**
*  @filename    Skill.js
*  @author      kolton, theBGuy
*  @desc        Skill library
*
*/

(function() {
	/**
	 * @constructor
	 * @param {number} skillId
	 */
	function SkillData(skillId) {
		/** @type {boolean} */
		this.hardpoints = false;
		/** @type {boolean} */
		this.checked = false;
		/** @type {number} */
		this.manaCost = null;
		// this part feels kinda ugly to me, todo is figure out a better method for conditon
		/** @type {Function} */
		this.condition = typeof skillConditions[skillId] === "function"
			? skillConditions[skillId]
			: () => true;
	}

	/**
	 * @param {number} skill 
	 */
	SkillData.prototype.have = function (skill) {
		if (!this.condition()) return false;
		if (this.hardpoints) return true;
		if (!this.checked) {
			this.hardpoints = !!me.getSkill(skill, sdk.skills.subindex.HardPoints);
			this.checked = true;
		}
		
		return (this.hardpoints || me.getSkill(skill, sdk.skills.subindex.SoftPoints));
	};

	const skillConditions = {};
	skillConditions[sdk.skills.InnerSight] = () => Config.UseInnerSight;
	skillConditions[sdk.skills.SlowMissiles] = () => Config.UseSlowMissiles;
	skillConditions[sdk.skills.Decoy] = () => Config.UseDecoy;
	skillConditions[sdk.skills.Valkyrie] = () => Config.SummonValkyrie;
	skillConditions[sdk.skills.Telekinesis] = () => Config.UseTelekinesis;
	skillConditions[sdk.skills.EnergyShield] = () => Config.UseEnergyShield;
	skillConditions[sdk.skills.Charge] = () => Config.Charge;
	skillConditions[sdk.skills.Vigor] = () => Config.Vigor || me.inTown;
	skillConditions[sdk.skills.FindItem] = () => Config.FindItem;
	skillConditions[sdk.skills.Raven] = () => Config.SummonRaven;
	skillConditions[sdk.skills.BurstofSpeed] = () => !Config.UseBoS && !me.inTown;
	skillConditions[sdk.skills.Fade] = () => Config.UseFade;
	skillConditions[sdk.skills.BladeShield] = () => Config.UseBladeShield;
	skillConditions[sdk.skills.Venom] = () => Config.UseVenom;

	const Skill = {
		usePvpRange: false,
		charges: [],
		manaCostList: {},
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

		getClassSkillRange: function (classid = me.classid) {
			switch (classid) {
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
		},

		skills: {
			/** @type {Object.<number, SkillData>} */
			all: {},
			initialized: false,

			init: function () {
				// should all skills for all classes be initialized? We really only care about ours?
				for (let i = sdk.player.class.Amazon; i <= sdk.player.class.Assassin; i++) {
					let [min, max] = Skill.getClassSkillRange(i);

					for (let skill = min; skill <= max; skill++) {
						// should this just be on the Skill object itself?
						Skill.skills.all[skill] = new SkillData(skill);
					}
				}

				Skill.skills.initialized = true;
			},
			have: function (skill = 0) {
				// ensure the values have been initialized
				!this.initialized && this.init();
				return typeof this.all[skill] !== "undefined" && this.all[skill].have(skill);
			},
			reset: function () {
				let [min, max] = Skill.getClassSkillRange();

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
			return Time.seconds((() => {
				switch (skillId) {
				case sdk.skills.Decoy:
					return ((10 + me.getSkill(sdk.skills.Decoy, sdk.skills.subindex.SoftPoints) * 5));
				case sdk.skills.FrozenArmor:
					return (((12 * me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.SoftPoints) + 108) + ((me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10)));
				case sdk.skills.ShiverArmor:
					return (((12 * me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.SoftPoints) + 108) + ((me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10)));
				case sdk.skills.ChillingArmor:
					return (((6 * me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.SoftPoints) + 138) + ((me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10)));
				case sdk.skills.EnergyShield:
					return (84 + (60 * me.getSkill(sdk.skills.EnergyShield, sdk.skills.subindex.SoftPoints)));
				case sdk.skills.ThunderStorm:
					return (24 + (8 * me.getSkill(sdk.skills.ThunderStorm, sdk.skills.subindex.SoftPoints)));
				case sdk.skills.Shout:
					return (((10 + me.getSkill(sdk.skills.Shout, sdk.skills.subindex.SoftPoints) * 10) + ((me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.HardPoints)) * 5)));
				case sdk.skills.BattleOrders:
					return (((20 + me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.SoftPoints) * 10) + ((me.getSkill(sdk.skills.Shout, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.HardPoints)) * 5)));
				case sdk.skills.BattleCommand:
					return (((10 * me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.SoftPoints) - 5) + ((me.getSkill(sdk.skills.Shout, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.HardPoints)) * 5)));
				case sdk.skills.HolyShield:
					return (5 + (25 * me.getSkill(sdk.skills.HolyShield, sdk.skills.subindex.SoftPoints)));
				case sdk.skills.Hurricane:
					return (10 + (2 * me.getSkill(sdk.skills.CycloneArmor, sdk.skills.subindex.HardPoints)));
				case sdk.skills.Werewolf:
				case sdk.skills.Werebear:
					return (40 + (20 * me.getSkill(sdk.skills.Lycanthropy, sdk.skills.subindex.SoftPoints) + 20));
				case sdk.skills.BurstofSpeed:
					return (108 + (12 * me.getSkill(sdk.skills.BurstofSpeed, sdk.skills.subindex.SoftPoints)));
				case sdk.skills.Fade:
					return (108 + (12 * me.getSkill(sdk.skills.Fade, sdk.skills.subindex.SoftPoints)));
				case sdk.skills.Venom:
					return (116 + (4 * me.getSkill(sdk.skills.Venom, sdk.skills.subindex.SoftPoints)));
				case sdk.skills.BladeShield:
					return (15 + (5 * me.getSkill(sdk.skills.BladeShield, sdk.skills.subindex.SoftPoints)));
				default:
					return 0;
				}
			})());
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

		// Skills that cn be cast in town
		townSkill: function (skillId = -1) {
			return [
				sdk.skills.Valkyrie, sdk.skills.FrozenArmor, sdk.skills.Telekinesis, sdk.skills.ShiverArmor, sdk.skills.Enchant, sdk.skills.ThunderStorm, sdk.skills.EnergyShield, sdk.skills.ChillingArmor,
				sdk.skills.BoneArmor, sdk.skills.ClayGolem, sdk.skills.BloodGolem, sdk.skills.FireGolem, sdk.skills.HolyShield, sdk.skills.Raven, sdk.skills.PoisonCreeper, sdk.skills.Werewolf, sdk.skills.Werebear,
				sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.CarrionVine, sdk.skills.CycloneArmor, sdk.skills.HeartofWolverine, sdk.skills.SummonDireWolf, sdk.skills.SolarCreeper,
				sdk.skills.SpiritofBarbs, sdk.skills.SummonGrizzly, sdk.skills.BurstofSpeed, sdk.skills.Fade, sdk.skills.ShadowWarrior, sdk.skills.BladeShield, sdk.skills.Venom, sdk.skills.ShadowMaster
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
		},

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

			if (skillId === sdk.skills.Teleport) {
				if (typeof x === "number") {
					const orgDist = [x, y].distance;
					if (Packet.teleport(x, y)) {
						return Misc.poll(() => [x, y].distance < orgDist, 300, 25);
					}
				}
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
				let [clickType, shift] = (() => {
					switch (hand) {
					case sdk.skills.hand.Left: // Left hand + Shift
						return [sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.Shift];
					case sdk.skills.hand.LeftNoShift: // Left hand + No Shift
						return [sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.NoShift];
					case sdk.skills.hand.RightShift: // Right hand + Shift
						return [sdk.clicktypes.click.map.RightDown, sdk.clicktypes.shift.Shift];
					case sdk.skills.hand.Right: // Right hand + No Shift
					default:
						return [sdk.clicktypes.click.map.RightDown, sdk.clicktypes.shift.NoShift];
					}
				})();

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
	};

	Object.defineProperties(Skill, {
		haveTK: {
			get: function () {
				return Skill.canUse(sdk.skills.Telekinesis);
			},
		},
	});

	// export to the global scope
	global.Skill = Skill;
})();
