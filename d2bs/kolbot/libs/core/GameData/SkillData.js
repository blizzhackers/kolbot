/**
*  @filename    SkillData.js
*  @author      theBGuy
*  @desc        skill data library
*
*/


(function (module) {
	/**
	 * @typedef {Object} SkillInterface
	 * @property {number} hand
	 * @property {boolean} [missile]
	 * @property {number | () => number} range
	 * @property {number} [state]
	 * @property {() => boolean} [condition]
	 * @property {() => number} [summonCount]
	 */

	/** @type {Map<number, SkillInterface>} */
	const skillMap = new Map();
	// basics
	{
		skillMap.set(sdk.skills.Attack, {
			hand: sdk.skills.hand.LeftNoShift,
			range: () => Attack.usingBow() ? 20 : 3,
		});
		skillMap.set(sdk.skills.Kick, {
			hand: sdk.skills.hand.Right,
			range: 3,
		});
		skillMap.set(sdk.skills.Throw, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Unsummon, {
			hand: sdk.skills.hand.Right,
			range: 20,
		});
		skillMap.set(sdk.skills.LeftHandThrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.LeftHandSwing, {
			hand: sdk.skills.hand.Right,
			range: 3,
		});
	}
	// ~~~ start of amazon skills ~~~ //
	{
		skillMap.set(sdk.skills.MagicArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
		});
		skillMap.set(sdk.skills.FireArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.InnerSight, {
			hand: sdk.skills.hand.Right,
			range: 13,
			state: sdk.states.InnerSight,
			condition: () => Config.UseInnerSight,
		});
		skillMap.set(sdk.skills.CriticalStrike, {
			hand: -1,
			range: -1,
			state: sdk.states.CriticalStrike,
		});
		skillMap.set(sdk.skills.Jab, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.ColdArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.MultipleShot, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Dodge, {
			hand: -1,
			range: -1,
			state: sdk.states.Dodge,
		});
		skillMap.set(sdk.skills.PowerStrike, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.PoisonJavelin, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.ExplodingArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.SlowMissiles, {
			hand: sdk.skills.hand.Right,
			range: 13,
			state: sdk.states.SlowMissiles,
			condition: () => Config.UseSlowMissiles,
		});
		skillMap.set(sdk.skills.Avoid, {
			hand: -1,
			range: -1,
			state: sdk.states.Avoid,
		});
		skillMap.set(sdk.skills.Impale, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.LightningBolt, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.IceArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.GuidedArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Penetrate, {
			hand: -1,
			range: -1,
			state: sdk.states.Penetrate,
		});
		skillMap.set(sdk.skills.ChargedStrike, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.PlagueJavelin, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Strafe, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.ImmolationArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Decoy, {
			hand: sdk.skills.hand.Right,
			range: 30,
			duration: () => ((10 + me.getSkill(sdk.skills.Decoy, sdk.skills.subindex.SoftPoints) * 5)),
			condition: () => Config.UseDecoy,
		});
		skillMap.set(sdk.skills.Evade, {
			hand: -1,
			range: -1,
			state: sdk.states.Evade,
		});
		skillMap.set(sdk.skills.Fend, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.FreezingArrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Valkyrie, {
			hand: sdk.skills.hand.Right,
			range: 30,
			summonCount: () => 1,
			condition: () => Config.UseValkyrie,
		});
		skillMap.set(sdk.skills.Pierce, {
			hand: -1,
			range: -1,
			state: sdk.states.Pierce,
		});
		skillMap.set(sdk.skills.LightningStrike, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.LightningFury, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
	}
	// ~~~ start of sorc skills ~~~ //
	{
		skillMap.set(sdk.skills.FireBolt, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Warmth, {
			hand: -1,
			range: -1,
			state: sdk.states.Warmth,
		});
		skillMap.set(sdk.skills.ChargedBolt, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 10,
		});
		skillMap.set(sdk.skills.IceBolt, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.FrozenArmor, {
			hand: sdk.skills.hand.Right,
			range: 1,
			duration: () => (
				((12 * me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.SoftPoints) + 108)
				+ ((me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10))
			),
		});
		skillMap.set(sdk.skills.Inferno, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: ((17 + (me.getSkill(sdk.skills.Inferno, sdk.skills.subindex.SoftPoints) * 3) / 4) * 2 / 3),
		});
		skillMap.set(sdk.skills.StaticField, {
			hand: sdk.skills.hand.Right,
			range: () => Math.floor((me.getSkill(sdk.skills.StaticField, sdk.skills.subindex.SoftPoints) + 4) * 2 / 3),
		});
		skillMap.set(sdk.skills.Telekinesis, {
			hand: sdk.skills.hand.Right,
			range: 40,
			condition: () => Config.UseTelekinesis,
		});
		skillMap.set(sdk.skills.FrostNova, {
			hand: sdk.skills.hand.Right,
			range: 5,
		});
		skillMap.set(sdk.skills.IceBlast, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Blaze, {
			hand: sdk.skills.hand.Right,
			range: 1,
		});
		skillMap.set(sdk.skills.FireBall, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: (pvpRange) => pvpRange ? 40 : 20,
		});
		skillMap.set(sdk.skills.Nova, {
			hand: sdk.skills.hand.Right,
			range: 7,
		});
		skillMap.set(sdk.skills.Lightning, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 25,
		});
		skillMap.set(sdk.skills.ShiverArmor, {
			hand: sdk.skills.hand.Right,
			range: 1,
			duration: () => (
				((12 * me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.SoftPoints) + 108)
				+ ((me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10))
			),
		});
		skillMap.set(sdk.skills.FireWall, {
			hand: sdk.skills.hand.Right,
			range: (pvpRange) => pvpRange ? 40 : 30,
		});
		skillMap.set(sdk.skills.Enchant, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Enchant,
		});
		skillMap.set(sdk.skills.ChainLightning, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 25,
		});
		skillMap.set(sdk.skills.Teleport, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.GlacialSpike, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.Meteor, {
			hand: sdk.skills.hand.Right,
			range: (pvpRange) => pvpRange ? 40 : 30,
		});
		skillMap.set(sdk.skills.ThunderStorm, {
			hand: sdk.skills.hand.Right,
			range: 1,
			townSkill: true,
			duration: () => (24 + (8 * me.getSkill(sdk.skills.ThunderStorm, sdk.skills.subindex.SoftPoints))),
		});
		skillMap.set(sdk.skills.EnergyShield, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.EnergyShield,
			duration: () => (84 + (60 * me.getSkill(sdk.skills.EnergyShield, sdk.skills.subindex.SoftPoints))),
			condition: () => Config.UseEnergyShield,
		});
		skillMap.set(sdk.skills.Blizzard, {
			hand: sdk.skills.hand.Right,
			range: (pvpRange) => pvpRange ? 40 : 30,
		});
		skillMap.set(sdk.skills.ChillingArmor, {
			hand: sdk.skills.hand.Right,
			range: 1,
			duration: () => (
				((6 * me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.SoftPoints) + 138)
				+ ((me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.HardPoints)) * 10))
			),
		});
		skillMap.set(sdk.skills.FireMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.FireMastery,
		});
		skillMap.set(sdk.skills.Hydra, {
			hand: sdk.skills.hand.Right,
			range: 30,
		});
		skillMap.set(sdk.skills.LightningMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.LightningMastery,
		});
		skillMap.set(sdk.skills.FrozenOrb, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.ColdMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.ColdMastery,
		});
	}
	// ~~~ start of necro skills ~~~ //
	{
		skillMap.set(sdk.skills.AmplifyDamage, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.AmplifyDamage,
		});
		skillMap.set(sdk.skills.Teeth, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 15,
		});
		skillMap.set(sdk.skills.BoneArmor, {
			hand: sdk.skills.hand.Right,
			range: 1,
		});
		skillMap.set(sdk.skills.SkeletonMastery, {
			hand: -1,
			range: -1,
		});
		skillMap.set(sdk.skills.RaiseSkeleton, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => {
				let skillNum = me.getSkill(sdk.skills.RaiseSkeleton, sdk.skills.subindex.SoftPoints);
				return skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
			},
		});
		skillMap.set(sdk.skills.DimVision, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.DimVision,
		});
		skillMap.set(sdk.skills.Weaken, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Weaken,
		});
		skillMap.set(sdk.skills.PoisonDagger, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.CorpseExplosion, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.ClayGolem, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.IronMaiden, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.IronMaiden,
		});
		skillMap.set(sdk.skills.Terror, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Terror,
		});
		skillMap.set(sdk.skills.BoneWall, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.GolemMastery, {
			hand: -1,
			range: -1,
		});
		skillMap.set(sdk.skills.RaiseSkeletalMage, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => {
				let skillNum = me.getSkill(sdk.skills.RaiseSkeletalMage, sdk.skills.subindex.SoftPoints);
				return skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
			},
		});
		skillMap.set(sdk.skills.Confuse, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Confuse,
		});
		skillMap.set(sdk.skills.LifeTap, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.LifeTap,
		});
		skillMap.set(sdk.skills.PoisonExplosion, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.BoneSpear, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: (pvpRange) => pvpRange ? 35 : 25,
		});
		skillMap.set(sdk.skills.BloodGolem, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.Attract, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Attract,
		});
		skillMap.set(sdk.skills.Decrepify, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Decrepify,
		});
		skillMap.set(sdk.skills.BonePrison, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.SummonResist, {
			hand: -1,
			range: -1,
		});
		skillMap.set(sdk.skills.IronGolem, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.LowerResist, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.LowerResist,
		});
		skillMap.set(sdk.skills.PoisonNova, {
			hand: sdk.skills.hand.Right,
			range: 20,
			state: sdk.states.Poison,
		});
		skillMap.set(sdk.skills.BoneSpirit, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: (pvpRange) => pvpRange ? 40 : 30,
		});
		skillMap.set(sdk.skills.FireGolem, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.Revive, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => me.getSkill(sdk.skills.Revive, sdk.skills.subindex.SoftPoints),
		});
	}
	// ~~~ start of paladin skills ~~~ //
	{
		skillMap.set(sdk.skills.Sacrifice, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.Smite, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.Might, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Might,
		});
		skillMap.set(sdk.skills.Prayer, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Prayer,
		});
		skillMap.set(sdk.skills.ResistFire, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.ResistFire,
		});
		skillMap.set(sdk.skills.HolyBolt, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.HolyFire, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.HolyFire,
		});
		skillMap.set(sdk.skills.Thorns, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Thorns,
		});
		skillMap.set(sdk.skills.Defiance, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Defiance,
		});
		skillMap.set(sdk.skills.ResistCold, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.ResistCold,
		});
		skillMap.set(sdk.skills.Zeal, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.Charge, {
			hand: sdk.skills.hand.Left,
			range: 10,
			condition: () => Config.Charge,
		});
		skillMap.set(sdk.skills.BlessedAim, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.BlessedAim,
		});
		skillMap.set(sdk.skills.Cleansing, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Cleansing,
		});
		skillMap.set(sdk.skills.ResistLightning, {
			range: 1,
			state: sdk.states.ResistLightning,
		});
		skillMap.set(sdk.skills.Vengeance, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.BlessedHammer, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.Concentration, {
			range: 1,
			state: sdk.states.Concentration,
		});
		skillMap.set(sdk.skills.HolyFreeze, {
			range: 1,
			state: sdk.states.HolyFreeze,
		});
		skillMap.set(sdk.skills.Vigor, {
			range: 1,
			state: sdk.states.Stamina,
			condition: () => Config.Vigor || me.inTown,
		});
		skillMap.set(sdk.skills.Conversion, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.HolyShield, {
			range: 1,
			state: sdk.states.HolyShield,
			duration: () => (5 + (25 * me.getSkill(sdk.skills.HolyShield, sdk.skills.subindex.SoftPoints))),
		});
		skillMap.set(sdk.skills.HolyShock, {
			range: 1,
			state: sdk.states.HolyShock,
		});
		skillMap.set(sdk.skills.Sanctuary, {
			range: 1,
			state: sdk.states.Sanctuary,
		});
		skillMap.set(sdk.skills.Meditation, {
			range: 1,
			state: sdk.states.Meditation,
		});
		skillMap.set(sdk.skills.FistoftheHeavens, {
			hand: sdk.skills.hand.Left,
			range: 30,
		});
		skillMap.set(sdk.skills.Fanaticism, {
			range: 1,
			state: sdk.states.Fanaticism,
		});
		skillMap.set(sdk.skills.Conviction, {
			range: 1,
			state: sdk.states.Conviction,
		});
		skillMap.set(sdk.skills.Redemption, {
			range: 1,
			state: sdk.states.Redemption,
		});
		skillMap.set(sdk.skills.Salvation, {
			range: 1,
			state: sdk.states.ResistAll,
		});
	}
	// ~~~ start of barbarian skills ~~~ //
	{
		skillMap.set(sdk.skills.Bash, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.SwordMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.SwordMastery,
		});
		skillMap.set(sdk.skills.AxeMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.AxeMastery,
		});
		skillMap.set(sdk.skills.MaceMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.MaceMastery,
		});
		skillMap.set(sdk.skills.Howl, {
			range: 5,
			state: sdk.states.Terror,
		});
		skillMap.set(sdk.skills.FindPotion, {
			hand: sdk.skills.hand.RightShift,
			range: 30,
		});
		skillMap.set(sdk.skills.Leap, {
			hand: sdk.skills.hand.Left,
			range: () => {
				let skLvl = me.getSkill(sdk.skills.Leap, sdk.skills.subindex.SoftPoints);
				return Math.floor(Math.min(4 + (26 * ((110 * skLvl / (skLvl + 6)) / 100)), 30) * (2 / 3));
			},
		});
		skillMap.set(sdk.skills.DoubleSwing, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.PoleArmMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.PoleArmMastery,
		});
		skillMap.set(sdk.skills.ThrowingMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.ThrowingMastery,
		});
		skillMap.set(sdk.skills.SpearMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.SpearMastery,
		});
		skillMap.set(sdk.skills.Taunt, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Taunt,
		});
		skillMap.set(sdk.skills.Shout, {
			hand: sdk.skills.hand.Right,
			range: 20,
			state: sdk.states.Shout,
			duration: () => (
				((10 + me.getSkill(sdk.skills.Shout, sdk.skills.subindex.SoftPoints) * 10)
				+ ((me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.HardPoints)) * 5))
			),
		});
		skillMap.set(sdk.skills.Stun, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.Stunned,
		});
		skillMap.set(sdk.skills.DoubleThrow, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 20,
		});
		skillMap.set(sdk.skills.IncreasedStamina, {
			hand: -1,
			range: -1,
			state: sdk.states.IncreasedStamina,
		});
		skillMap.set(sdk.skills.FindItem, {
			hand: sdk.skills.hand.RightShift,
			range: 30,
			condition: () => Config.FindItem,
		});
		skillMap.set(sdk.skills.LeapAttack, {
			hand: sdk.skills.hand.Left,
			range: 10,
		});
		skillMap.set(sdk.skills.Concentrate, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.Concentrate,
		});
		skillMap.set(sdk.skills.IronSkin, {
			hand: -1,
			range: -1,
			state: sdk.states.IronSkin,
		});
		skillMap.set(sdk.skills.BattleCry, {
			hand: sdk.skills.hand.Right,
			range: 5,
			state: sdk.states.BattleCry,
			duration: () => (
				(9.6 + me.getSkill(sdk.skills.BattleCry, sdk.skills.subindex.SoftPoints) * 2.4)
			),
		});
		skillMap.set(sdk.skills.Frenzy, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.Frenzy,
		});
		skillMap.set(sdk.skills.IncreasedSpeed, {
			hand: -1,
			range: -1,
			state: sdk.states.IncreasedSpeed,
		});
		skillMap.set(sdk.skills.BattleOrders, {
			hand: sdk.skills.hand.Right,
			range: 20,
			state: sdk.states.BattleOrders,
			duration: () => (
				((20 + me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.SoftPoints) * 10)
				+ ((me.getSkill(sdk.skills.Shout, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.HardPoints)) * 5))
			),
		});
		skillMap.set(sdk.skills.GrimWard, {
			hand: sdk.skills.hand.RightShift,
			range: 40,
			state: sdk.states.Terror,
			duration: () => 40,
		});
		skillMap.set(sdk.skills.Whirlwind, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.Berserk, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.Berserk,
		});
		skillMap.set(sdk.skills.NaturalResistance, {
			hand: -1,
			range: -1,
			state: sdk.states.NaturalResistance,
		});
		skillMap.set(sdk.skills.WarCry, {
			hand: sdk.skills.hand.Right,
			range: 5,
			state: sdk.states.Stunned,
			duration: () => (
				Math.min(0.8 + me.getSkill(sdk.skills.WarCry, sdk.skills.subindex.SoftPoints) * 0.2, 10)
			),
		});
		skillMap.set(sdk.skills.BattleCommand, {
			hand: sdk.skills.hand.Right,
			range: 20,
			state: sdk.states.BattleCommand,
			duration: () => (
				((10 * me.getSkill(sdk.skills.BattleCommand, sdk.skills.subindex.SoftPoints) - 5)
				+ ((me.getSkill(sdk.skills.Shout, sdk.skills.subindex.HardPoints) + me.getSkill(sdk.skills.BattleOrders, sdk.skills.subindex.HardPoints)) * 5))
			),
		});
	}
	// misc skills - scrolls and books
	{
		skillMap.set(sdk.skills.IdentifyScroll, {
			hand: sdk.skills.hand.Right,
			range: 1,
		});
		skillMap.set(sdk.skills.BookofIdentify, {
			hand: sdk.skills.hand.Right,
			range: 1,
		});
		skillMap.set(sdk.skills.TownPortalScroll, {
			hand: sdk.skills.hand.Right,
			range: 1,
		});
		skillMap.set(sdk.skills.BookofTownPortal, {
			hand: sdk.skills.hand.Right,
			range: 1,
		});
	}
	// ~~~ start of druid skills ~~~ //
	{
		skillMap.set(sdk.skills.Raven, {
			hand: sdk.skills.hand.Right,
			range: 40,
			summonCount: () => Math.min(me.getSkill(sdk.skills.Raven, sdk.skills.subindex.SoftPoints), 5),
			condition: () => Config.SummonRaven,
		});
		skillMap.set(sdk.skills.PoisonCreeper, {
			hand: sdk.skills.hand.Right,
			range: 40,
			// condition: () => (typeof Config.SummonVine === "string"
			// 	? Config.SummonVine.toLowerCase() === "poison"
			// 	: Config.SummonVine === sdk.skills.PoisonCreeper),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.Werewolf, {
			hand: sdk.skills.hand.Right,
			range: 1,
			duration: () => (40 + (20 * me.getSkill(sdk.skills.Lycanthropy, sdk.skills.subindex.SoftPoints) + 20)),
		});
		skillMap.set(sdk.skills.Lycanthropy, {
			hand: -1,
			range: -1,
		});
		skillMap.set(sdk.skills.Firestorm, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 10,
		});
		skillMap.set(sdk.skills.OakSage, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.OakSage,
			// condition: () => (typeof Config.SummonSpirit === "string"
			// 	? Config.SummonSpirit.toLowerCase() === "oak"
			// 	: Config.SummonSpirit === sdk.skills.OakSage),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.SpiritWolf, {
			hand: sdk.skills.hand.Right,
			range: 40,
			// condition: () => (typeof Config.SummonAnimal === "string"
			// 	? Config.SummonAnimal.toLowerCase() === "spirit wolf"
			// 	: Config.SummonAnimal === sdk.skills.SpiritWolf),
			summonCount: () => Math.min(me.getSkill(sdk.skills.SpiritWolf, sdk.skills.subindex.SoftPoints), 5),
		});
		skillMap.set(sdk.skills.Werebear, {
			hand: sdk.skills.hand.Right,
			range: 1,
			duration: () => (40 + (20 * me.getSkill(sdk.skills.Lycanthropy, sdk.skills.subindex.SoftPoints) + 20)),
		});
		skillMap.set(sdk.skills.MoltenBoulder, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 10,
		});
		skillMap.set(sdk.skills.ArcticBlast, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: () => {
				let skLvl = me.getSkill(sdk.skills.ArcticBlast, sdk.skills.subindex.SoftPoints);
				let range = Math.floor(((33 + (2 * skLvl)) / 4) * (2 / 3));
				// Druid using this on physical immunes needs the monsters to be within range of hurricane
				range > 6 && Config.AttackSkill[5] === sdk.skills.ArcticBlast && (range = 6);
			
				return range;
			},
		});
		skillMap.set(sdk.skills.CarrionVine, {
			hand: sdk.skills.hand.Right,
			range: 40,
			// condition: () => (typeof Config.SummonVine === "string"
			// 	? Config.SummonVine.toLowerCase() === "carion"
			// 	: Config.SummonVine === sdk.skills.CarrionVine),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.FeralRage, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.FeralRage,
		});
		skillMap.set(sdk.skills.Maul, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.Maul,
		});
		skillMap.set(sdk.skills.Fissure, {
			hand: sdk.skills.hand.Right,
			range: 20,
		});
		skillMap.set(sdk.skills.CycloneArmor, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.CycloneArmor,
			// todo - armor percent like I did for bonearmor
		});
		skillMap.set(sdk.skills.HeartofWolverine, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.HeartofWolverine,
			// condition: () => (typeof Config.SummonSpirit === "string"
			// 	? Config.SummonSpirit.toLowerCase() === "wolverine"
			// 	: Config.SummonSpirit === sdk.skills.HeartofWolverine),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.SummonDireWolf, {
			hand: sdk.skills.hand.Right,
			range: 40,
			// condition: () => (typeof Config.SummonAnimal === "string"
			// 	? Config.SummonAnimal.toLowerCase() === "dire wolf"
			// 	: Config.SummonAnimal === sdk.skills.SummonDireWolf),
			summonCount: () => Math.min(me.getSkill(sdk.skills.SummonDireWolf, sdk.skills.subindex.SoftPoints), 3),
		});
		skillMap.set(sdk.skills.Rabies, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
			state: sdk.states.Rabies,
		});
		skillMap.set(sdk.skills.FireClaws, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.Twister, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 5,
		});
		skillMap.set(sdk.skills.SolarCreeper, {
			hand: sdk.skills.hand.Right,
			range: 40,
			// condition: () => (typeof Config.SummonVine === "string"
			// 	? Config.SummonVine.toLowerCase() === "solar"
			// 	: Config.SummonVine === sdk.skills.SolarCreeper),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.Hunger, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.ShockWave, {
			hand: sdk.skills.hand.Left,
			range: 8,
		});
		skillMap.set(sdk.skills.Volcano, {
			hand: sdk.skills.hand.Right,
			range: 30,
		});
		skillMap.set(sdk.skills.Tornado, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 5,
		});
		skillMap.set(sdk.skills.SpiritofBarbs, {
			hand: sdk.skills.hand.Right,
			range: 40,
			state: sdk.states.Barbs,
			// condition: () => (typeof Config.SummonSpirit === "string"
			// 	? Config.SummonSpirit.toLowerCase() === "barbs"
			// 	: Config.SummonSpirit === sdk.skills.SpiritofBarbs),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.SummonGrizzly, {
			hand: sdk.skills.hand.Right,
			range: 40,
			timed: true,
			// condition: () => (typeof Config.SummonAnimal === "string"
			// 	? Config.SummonAnimal.toLowerCase() === "grizzly"
			// 	: Config.SummonAnimal === sdk.skills.SummonGrizzly),
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.Fury, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.Armageddon, {
			hand: sdk.skills.hand.Right,
			range: 10,
			state: sdk.states.Armageddon,
			duration: () => (10 + me.getSkill(sdk.skills.Fissure, sdk.skills.subindex.HardPoints) * 2),
		});
		skillMap.set(sdk.skills.Hurricane, {
			hand: sdk.skills.hand.Right,
			range: 10,
			state: sdk.states.Hurricane,
			duration: () => (10 + me.getSkill(sdk.skills.CycloneArmor, sdk.skills.subindex.HardPoints) * 2),
		});
	}
	// ~~~ start of assassin skills ~~~ //
	{
		skillMap.set(sdk.skills.FireBlast, {
			hand: sdk.skills.hand.Left,
			missile: true,
			range: 15,
		});
		skillMap.set(sdk.skills.ClawMastery, {
			hand: -1,
			range: -1,
			state: sdk.states.ClawMastery,
		});
		skillMap.set(sdk.skills.PsychicHammer, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.TigerStrike, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.DragonTalon, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.ShockWeb, {
			hand: sdk.skills.hand.Left,
			range: 15,
		});
		skillMap.set(sdk.skills.BladeSentinel, {
			hand: sdk.skills.hand.Left,
			range: 15,
		});
		skillMap.set(sdk.skills.BurstofSpeed, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.BurstofSpeed,
			duration: () => (108 + (12 * me.getSkill(sdk.skills.BurstofSpeed, sdk.skills.subindex.SoftPoints))),
			condition: () => !Config.UseBoS && !me.inTown,
		});
		skillMap.set(sdk.skills.FistsofFire, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.DragonClaw, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.ChargedBoltSentry, {
			hand: sdk.skills.hand.Right,
			range: 30,
			summonCount: () => 5,
		});
		skillMap.set(sdk.skills.WakeofFireSentry, {
			hand: sdk.skills.hand.Right,
			range: 30,
			summonCount: () => 5,
		});
		skillMap.set(sdk.skills.WeaponBlock, {
			hand: -1,
			range: -1,
			state: sdk.states.WeaponBlock,
		});
		skillMap.set(sdk.skills.CloakofShadows, {
			hand: sdk.skills.hand.Right,
			range: 30,
			state: sdk.states.CloakofShadows,
			duration: () => (7 + me.getSkill(sdk.skills.CloakofShadows, sdk.skills.subindex.SoftPoints)),
		});
		skillMap.set(sdk.skills.CobraStrike, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.BladeFury, {
			hand: sdk.skills.hand.Left,
			range: 15,
		});
		skillMap.set(sdk.skills.Fade, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Fade,
			duration: () => (108 + (12 * me.getSkill(sdk.skills.Fade, sdk.skills.subindex.SoftPoints))),
			condition: () => Config.UseFade,
		});
		skillMap.set(sdk.skills.ShadowWarrior, {
			hand: sdk.skills.hand.Right,
			range: 30,
			// condition: () => Config.UseValkyrie,
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.ClawsofThunder, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.DragonTail, {
			hand: sdk.skills.hand.LeftNoShift,
			range: 3,
		});
		skillMap.set(sdk.skills.LightningSentry, {
			hand: sdk.skills.hand.Right,
			range: 30,
			summonCount: () => 5,
		});
		skillMap.set(sdk.skills.InfernoSentry, {
			hand: sdk.skills.hand.Right,
			range: 30,
			summonCount: () => 5,
		});
		skillMap.set(sdk.skills.MindBlast, {
			hand: sdk.skills.hand.Right,
			range: 40,
		});
		skillMap.set(sdk.skills.BladesofIce, {
			hand: sdk.skills.hand.Left,
			range: 3,
		});
		skillMap.set(sdk.skills.DragonFlight, {
			hand: sdk.skills.hand.Left,
			range: 10,
		});
		skillMap.set(sdk.skills.DeathSentry, {
			hand: sdk.skills.hand.Right,
			range: 30,
			summonCount: () => 5,
		});
		skillMap.set(sdk.skills.BladeShield, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.BladeShield,
			timed: true,
			duration: () => (15 + (5 * me.getSkill(sdk.skills.BladeShield, sdk.skills.subindex.SoftPoints))),
			condition: () => Config.UseBladeShield,
		});
		skillMap.set(sdk.skills.Venom, {
			hand: sdk.skills.hand.Right,
			range: 1,
			state: sdk.states.Venom,
			duration: () => (116 + (4 * me.getSkill(sdk.skills.Venom, sdk.skills.subindex.SoftPoints))),
			condition: () => Config.UseVenom,
		});
		skillMap.set(sdk.skills.ShadowMaster, {
			hand: sdk.skills.hand.Right,
			range: 30,
			// condition: () => Config.UseValkyrie,
			summonCount: () => 1,
		});
		skillMap.set(sdk.skills.RoyalStrike, {
			hand: sdk.skills.hand.Right,
			range: 3,
		});
	}

	const damageTypes = [
		"Physical", "Fire", "Lightning",
		"Magic", "Cold", "Poison", "None",
		"None", "None", "Physical"
	];

	/**
	 * @constructor
	 * @param {number} skillId 
	 */
	function Skill (skillId) {
		let _skillData = skillMap.get(skillId);
		/** @type {number} */
		this.skillId = skillId;
		/** @type {number} */
		this.hand = (_skillData.hand || sdk.skills.hand.Right);
		/** @type {number} */
		this.state = (_skillData.state || sdk.states.None);
		/** @type {() => number} */
		this.summonCount = (_skillData.summonCount || (() => 0));
		/** @type {() => boolean} */
		this.condition = (_skillData.condition || (() => true));
		/** @type {boolean} */
		this.townSkill = (_skillData.townSkill || getBaseStat("skills", skillId, "InTown") === 1);
		/** @type {boolean} */
		this.timed = (_skillData.timed || getBaseStat("skills", skillId, "delay") > 0);
		/** @type {boolean} */
		this.missleSkill = (_skillData.missile || false);
		/** @type {number} */
		this.charClass = getBaseStat("skills", skillId, "charClass");
		/** @type {number} */
		this.reqLevel = getBaseStat("skills", skillId, "reqlevel");
		/** @type {number[]} */
		this.preReqs = (() => {
			let preReqs = [];

			for (let t = sdk.stats.PreviousSkillLeft; t >= sdk.stats.PreviousSkillRight; t--) {
				let preReq = (getBaseStat("skills", skillId, t));

				if (preReq > sdk.skills.Attack && preReq < sdk.skills.RoyalStrike) {
					return preReqs.push(preReq);
				}
			}

			return preReqs;
		})();
		this.damageType = damageTypes[getBaseStat("skills", skillId, "EType")];

		/**
		 * @private
		 * @type {number | () => number}
		 */
		this._range = (_skillData.range || 1);
		/**
		 * @private
		 * @type {() => number}
		 */
		this._duration = (_skillData.duration || (() => 0));
		/**
		 * @private
		 * @type {number}
		 */
		this._manaCost = Infinity;
		/**
		 * @private
		 * @type {number}
		 */
		this._mana = getBaseStat("skills", this.skillId, "mana");
		/**
		 * @private
		 * @type {number}
		 */
		this._minMana = getBaseStat("skills", this.skillId, "minmana");
		/**
		 * @private
		 * @type {number}
		 */
		this._lvlMana = getBaseStat("skills", this.skillId, "lvlmana");
		let effectiveShift = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
		/**
		 * @private
		 * @type {number}
		 */
		this._manaShift = (effectiveShift[getBaseStat("skills", this.skillId, "manashift")] / 256);
		/**
		 * @private
		 * @type {number}
		 */
		this._bestSlot = 0;
		/**
		 * @private
		 * @type {number}
		 */
		this._dmg = 0;
		/**
		 * @private
		 * @type {number}
		 */
		this._hardPoints = 0;
		/**
		 * @private
		 * @type {number}
		 */
		this._softPoints = 0;
		/**
		 * @private
		 * @type {boolean}
		 */
		this._checked = false;
	}

	/**
	 * @this Skill
	 * @returns {number}
	 */
	Skill.prototype.duration = function () {
		return Time.seconds(this._duration());
	};

	/**
	 * @this Skill
	 * @returns {number}
	 */
	Skill.prototype.manaCost = function () {
		if (this._manaCost !== Infinity) return this._manaCost;
		if (this.skillId < sdk.skills.MagicArrow) {
			return (this._manaCost = 0);
		}
		let skillLvl = me.getSkill(this.skillId, sdk.skills.subindex.SoftPoints);
		if (skillLvl !== this._softPoints) {
			this._softPoints = skillLvl;
			this._hardPoints = me.getSkill(this.skillId, sdk.skills.subindex.HardPoints);
		}
		// Decoy wasn't reading from skill bin
		if (this.skillId === sdk.skills.Decoy) {
			return (this._manaCost = Math.max(19.75 - (0.75 * skillLvl), 1));
		}
		let lvlmana = this._lvlMana === 65535
			? -1
			: this._lvlMana; // Correction for skills that need less mana with levels (kolton)
		let ret = Math.max((this._mana + lvlmana * (skillLvl - 1)) * this._manaShift, this._minMana);
		return (this._manaCost = ret);
	};

	/**
	 * @this Skill
	 * @property {boolean} pvpRange
	 * @returns {number}
	 */
	Skill.prototype.range = function (pvpRange = false) {
		return typeof this._range === "function" ? this._range(pvpRange) : this._range;
	};

	/**
	 * @this Skill
	 * @returns {boolean}
	 */
	Skill.prototype.have = function () {
		if (!this.condition()) return false;
		if (this._hardPoints > 0) return true;
		if (!this._checked) {
			this._checked = true;
			this._hardPoints = me.getSkill(this.skillId, sdk.skills.subindex.HardPoints);
			// this._softPoints = me.getSkill(this.skillId, sdk.skills.subindex.SoftPoints);
		}
		return this._hardPoints > 0 || (this._softPoints = me.getSkill(this.skillId, sdk.skills.subindex.SoftPoints)) > 0;
	};

	Skill.prototype.reset = function () {
		this._manaCost = Infinity;
		this._dmg = 0;
		this._hardPoints = 0;
		this._softPoints = 0;
		this._checked = false;
	};

	/**
	 * @todo Damage calculations, best slot, etc.
	 */

	/** @type {Map<number, Skill} */
	const SkillData = new Map();

	// Initialize SkillData
	for (let i = sdk.skills.Attack; i <= sdk.skills.RoyalStrike; i++) {
		if (!skillMap.has(i)) continue;
		SkillData.set(i, new Skill(i));
	}

	// Export
	module.exports = SkillData;
})(module);
