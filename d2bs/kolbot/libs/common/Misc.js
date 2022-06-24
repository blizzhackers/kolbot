/**
*  @filename    Misc.js
*  @author      kolton, theBGuy
*  @desc        misc library containing Skill, Misc and Sort classes
*
*/

const Skill = {
	usePvpRange: false,
	skills: {
		6: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.MagicArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.MagicArrow, 1));
			}
		},
		7: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireArrow, 1));
			}
		},
		8: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseInnerSight) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.InnerSight, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.InnerSight, 1));
			}
		},
		10: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Jab, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Jab, 1));
			}
		},
		11: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ColdArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ColdArrow, 1));
			}
		},
		12: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.MultipleShot, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.MultipleShot, 1));
			}
		},
		14: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PowerStrike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PowerStrike, 1));
			}
		},
		15: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PoisonJavelin, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PoisonJavelin, 1));
			}
		},
		16: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ExplodingArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ExplodingArrow, 1));
			}
		},
		17: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseSlowMissiles) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.SlowMissiles, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.SlowMissiles, 1));
			}
		},
		19: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Impale, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Impale, 1));
			}
		},
		20: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LightningBolt, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LightningBolt, 1));
			}
		},
		21: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.IceArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.IceArrow, 1));
			}
		},
		22: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.GuidedArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.GuidedArrow, 1));
			}
		},
		24: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ChargedStrike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ChargedStrike, 1));
			}
		},
		25: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PlagueJavelin, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PlagueJavelin, 1));
			}
		},
		26: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Strafe, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Strafe, 1));
			}
		},
		27: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ImmolationArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ImmolationArrow, 1));
			}
		},
		28: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseDecoy) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Decoy, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Decoy, 1));
			}
		},
		30: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Fend, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Fend, 1));
			}
		},
		31: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FreezingArrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FreezingArrow, 1));
			}
		},
		32: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.SummonValkyrie) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Valkyrie, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Valkyrie, 1));
			}
		},
		34: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LightningStrike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LightningStrike, 1));
			}
		},
		35: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LightningFury, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LightningFury, 1));
			}
		},
		// sorceress skills start
		36: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireBolt, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireBolt, 1));
			}
		},
		// skip warmth
		38: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ChargedBolt, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ChargedBolt, 1));
			}
		},
		39: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.IceBolt, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.IceBolt, 1));
			}
		},
		40: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FrozenArmor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FrozenArmor, 1));
			}
		},
		41: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Inferno, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Inferno, 1));
			}
		},
		42: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.StaticField, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.StaticField, 1));
			}
		},
		43: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseTelekinesis) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Telekinesis, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Telekinesis, 1));
			}
		},
		44: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FrostNova, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FrostNova, 1));
			}
		},
		45: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.IceBlast, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.IceBlast, 1));
			}
		},
		46: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Blaze, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Blaze, 1));
			}
		},
		47: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireBall, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireBall, 1));
			}
		},
		48: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Nova, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Nova, 1));
			}
		},
		49: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Lightning, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Lightning, 1));
			}
		},
		50: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ShiverArmor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ShiverArmor, 1));
			}
		},
		51: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireWall, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireWall, 1));
			}
		},
		52: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Enchant, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Enchant, 1));
			}
		},
		53: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ChainLightning, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ChainLightning, 1));
			}
		},
		54: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Teleport, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Teleport, 1));
			}
		},
		55: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.GlacialSpike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.GlacialSpike, 1));
			}
		},
		56: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Meteor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Meteor, 1));
			}
		},
		57: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ThunderStorm, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ThunderStorm, 1));
			}
		},
		58: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseEnergyShield) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.EnergyShield, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.EnergyShield, 1));
			}
		},
		59: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Blizzard, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Blizzard, 1));
			}
		},
		60: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ChillingArmor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ChillingArmor, 1));
			}
		},
		62: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Hydra, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Hydra, 1));
			}
		},
		64: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FrozenOrb, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FrozenOrb, 1));
			}
		},
		// necromancer skills start
		66: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.AmplifyDamage, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.AmplifyDamage, 1));
			}
		},
		67: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Teeth, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Teeth, 1));
			}
		},
		68: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BoneArmor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BoneArmor, 1));
			}
		},
		70: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.RaiseSkeleton, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.RaiseSkeleton, 1));
			}
		},
		71: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DimVision, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DimVision, 1));
			}
		},
		72: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Weaken, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Weaken, 1));
			}
		},
		73: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PoisonDagger, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PoisonDagger, 1));
			}
		},
		74: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.CorpseExplosion, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.CorpseExplosion, 1));
			}
		},
		75: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ClayGolem, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ClayGolem, 1));
			}
		},
		76: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.IronMaiden, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.IronMaiden, 1));
			}
		},
		77: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Terror, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Terror, 1));
			}
		},
		78: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BoneWall, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BoneWall, 1));
			}
		},
		80: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.RaiseSkeletalMage, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.RaiseSkeletalMage, 1));
			}
		},
		81: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Confuse, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Confuse, 1));
			}
		},
		82: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LifeTap, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LifeTap, 1));
			}
		},
		83: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PoisonExplosion, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PoisonExplosion, 1));
			}
		},
		84: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BoneSpear, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BoneSpear, 1));
			}
		},
		85: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BloodGolem, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BloodGolem, 1));
			}
		},
		86: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Attract, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Attract, 1));
			}
		},
		87: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Decrepify, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Decrepify, 1));
			}
		},
		88: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BonePrison, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BonePrison, 1));
			}
		},
		90: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.IronGolem, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.IronGolem, 1));
			}
		},
		91: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LowerResist, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LowerResist, 1));
			}
		},
		92: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PoisonNova, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PoisonNova, 1));
			}
		},
		93: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BoneSpirit, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BoneSpirit, 1));
			}
		},
		94: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireGolem, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireGolem, 1));
			}
		},
		95: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Revive, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Revive, 1));
			}
		},
		// paladin skills start
		96: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Sacrifice, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Sacrifice, 1));
			}
		},
		97: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Smite, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Smite, 1));
			}
		},
		98: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Might, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Might, 1));
			}
		},
		99: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Prayer, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Prayer, 1));
			}
		},
		100: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ResistFire, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ResistFire, 1));
			}
		},
		101: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.HolyBolt, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.HolyBolt, 1));
			}
		},
		102: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.HolyFire, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.HolyFire, 1));
			}
		},
		103: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Thorns, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Thorns, 1));
			}
		},
		104: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Defiance, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Defiance, 1));
			}
		},
		105: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ResistCold, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ResistCold, 1));
			}
		},
		106: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Zeal, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Zeal, 1));
			}
		},
		107: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Charge, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Charge, 1));
			}
		},
		108: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BlessedAim, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BlessedAim, 1));
			}
		},
		109: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Cleansing, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Cleansing, 1));
			}
		},
		110: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ResistLightning, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ResistLightning, 1));
			}
		},
		111: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Vengeance, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Vengeance, 1));
			}
		},
		112: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BlessedHammer, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BlessedHammer, 1));
			}
		},
		113: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Concentration, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Concentration, 1));
			}
		},
		114: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.HolyFreeze, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.HolyFreeze, 1));
			}
		},
		115: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Vigor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Vigor, 1));
			}
		},
		116: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Conversion, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Conversion, 1));
			}
		},
		117: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.HolyShield, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.HolyShield, 1));
			}
		},
		118: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.HolyShock, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.HolyShock, 1));
			}
		},
		119: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Sanctuary, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Sanctuary, 1));
			}
		},
		120: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Meditation, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Meditation, 1));
			}
		},
		121: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FistoftheHeavens, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FistoftheHeavens, 1));
			}
		},
		122: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Fanaticism, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Fanaticism, 1));
			}
		},
		123: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Conviction, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Conviction, 1));
			}
		},
		124: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Redemption, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Redemption, 1));
			}
		},
		125: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Salvation, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Salvation, 1));
			}
		},
		// barbarian skills start
		126: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Bash, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Bash, 1));
			}
		},
		130: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Howl, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Howl, 1));
			}
		},
		131: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FindPotion, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FindPotion, 1));
			}
		},
		132: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Leap, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Leap, 1));
			}
		},
		133: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DoubleSwing, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DoubleSwing, 1));
			}
		},
		137: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Taunt, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Taunt, 1));
			}
		},
		138: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Shout, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Shout, 1));
			}
		},
		139: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Stun, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Stun, 1));
			}
		},
		140: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DoubleThrow, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DoubleThrow, 1));
			}
		},
		142: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.FindItem) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FindItem, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FindItem, 1));
			}
		},
		143: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LeapAttack, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LeapAttack, 1));
			}
		},
		144: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Concentrate, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Concentrate, 1));
			}
		},
		146: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BattleCry, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BattleCry, 1));
			}
		},
		147: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Frenzy, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Frenzy, 1));
			}
		},
		149: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BattleOrders, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BattleOrders, 1));
			}
		},
		150: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.GrimWard, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.GrimWard, 1));
			}
		},
		151: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Whirlwind, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Whirlwind, 1));
			}
		},
		152: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Berserk, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Berserk, 1));
			}
		},
		154: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.WarCry, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.WarCry, 1));
			}
		},
		155: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BattleCommand, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BattleCommand, 1));
			}
		},
		221: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.SummonRaven) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Raven, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Raven, 1));
			}
		},
		222: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PoisonCreeper, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PoisonCreeper, 1));
			}
		},
		223: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Werewolf, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Werewolf, 1));
			}
		},
		225: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Firestorm, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Firestorm, 1));
			}
		},
		226: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.OakSage, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.OakSage, 1));
			}
		},
		227: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.SpiritWolf, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.SpiritWolf, 1));
			}
		},
		228: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Werebear, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Werebear, 1));
			}
		},
		229: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.MoltenBoulder, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.MoltenBoulder, 1));
			}
		},
		230: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ArcticBlast, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ArcticBlast, 1));
			}
		},
		231: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.CarrionVine, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.CarrionVine, 1));
			}
		},
		232: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FeralRage, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FeralRage, 1));
			}
		},
		233: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Maul, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Maul, 1));
			}
		},
		234: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Fissure, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Fissure, 1));
			}
		},
		235: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.CycloneArmor, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.CycloneArmor, 1));
			}
		},
		236: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.HeartofWolverine, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.HeartofWolverine, 1));
			}
		},
		237: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.SummonDireWolf, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.SummonDireWolf, 1));
			}
		},
		238: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Rabies, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Rabies, 1));
			}
		},
		239: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireClaws, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireClaws, 1));
			}
		},
		240: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Twister, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Twister, 1));
			}
		},
		241: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.SolarCreeper, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.SolarCreeper, 1));
			}
		},
		242: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Hunger, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Hunger, 1));
			}
		},
		243: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ShockWave, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ShockWave, 1));
			}
		},
		244: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Volcano, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Volcano, 1));
			}
		},
		245: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Tornado, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Tornado, 1));
			}
		},
		246: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.SpiritofBarbs, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.SpiritofBarbs, 1));
			}
		},
		247: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Grizzly, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Grizzly, 1));
			}
		},
		248: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Fury, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Fury, 1));
			}
		},
		249: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Armageddon, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Armageddon, 1));
			}
		},
		250: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Hurricane, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Hurricane, 1));
			}
		},
		// start of assassin
		251: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FireBlast, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FireBlast, 1));
			}
		},
		253: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PsychicHammer, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PsychicHammer, 1));
			}
		},
		254: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.TigerStrike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.TigerStrike, 1));
			}
		},
		255: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DragonTalon, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DragonTalon, 1));
			}
		},
		256: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ShockWeb, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ShockWeb, 1));
			}
		},
		257: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BladeSentinel, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BladeSentinel, 1));
			}
		},
		258: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseBoS && !me.inTown) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BurstofSpeed, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BurstofSpeed, 1));
			}
		},
		259: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.FistsofFire, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.FistsofFire, 1));
			}
		},
		260: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DragonClaw, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DragonClaw, 1));
			}
		},
		261: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ChargedBoltSentry, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ChargedBoltSentry, 1));
			}
		},
		262: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.WakeofFire, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.WakeofFire, 1));
			}
		},
		264: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.CloakofShadows, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.CloakofShadows, 1));
			}
		},
		265: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.CobraStrike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.CobraStrike, 1));
			}
		},
		266: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BladeFury, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BladeFury, 1));
			}
		},
		267: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseFade) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Fade, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Fade, 1));
			}
		},
		268: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ShadowWarrior, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ShadowWarrior, 1));
			}
		},
		269: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ClawsofThunder, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ClawsofThunder, 1));
			}
		},
		270: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DragonTail, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DragonTail, 1));
			}
		},
		271: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.LightningSentry, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.LightningSentry, 1));
			}
		},
		272: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.WakeofInferno, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.WakeofInferno, 1));
			}
		},
		273: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.MindBlast, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.MindBlast, 1));
			}
		},
		274: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BladesofIce, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BladesofIce, 1));
			}
		},
		275: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DragonFlight, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DragonFlight, 1));
			}
		},
		276: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.DeathSentry, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.DeathSentry, 1));
			}
		},
		277: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseBladeShield) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.BladeShield, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.BladeShield, 1));
			}
		},
		278: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (!Config.UseVenom) return false;
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.Venom, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.Venom, 1));
			}
		},
		279: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.ShadowMaster, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.ShadowMaster, 1));
			}
		},
		280: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.PhoenixStrike, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.PhoenixStrike, 1));
			}
		},
		281: {
			hardpoints: false,
			checked: false,
			have: function () {
				if (this.hardpoints) return true;
				if (!this.checked) {
					this.hardpoints = !!me.getSkill(sdk.skills.WakeofDestructionSentry, 0);
					this.checked = true;
				}
				return (this.hardpoints || me.getSkill(sdk.skills.WakeofDestructionSentry, 1));
			}
		},
	},

	// initialize our skill data - todo: change precastables to be an object of Skill instead - map all skills to it
	init: function () {
		// reset check values
		let skKeys = Object.keys(Skill.skills);
		let min = 0, max = 999;

		switch (me.classid) {
		case sdk.charclass.Amazon:
			min = sdk.skills.MagicArrow;
			max = sdk.skills.LightningFury;
			
			break;
		case sdk.charclass.Sorceress:
			min = sdk.skills.FireBolt;
			max = sdk.skills.ColdMastery;
			
			break;
		case sdk.charclass.Necromancer:
			min = sdk.skills.AmplifyDamage;
			max = sdk.skills.Revive;
			
			break;
		case sdk.charclass.Paladin:
			min = sdk.skills.Sacrifice;
			max = sdk.skills.Salvation;
			
			break;
		case sdk.charclass.Barbarian:
			min = sdk.skills.Bash;
			max = sdk.skills.BattleCommand;
			
			break;
		case sdk.charclass.Druid:
			min = sdk.skills.Raven;
			max = sdk.skills.Hurricane;
			
			break;
		case sdk.charclass.Assassin:
			min = sdk.skills.FireBlast;
			max = sdk.skills.PhoenixStrike;
			
			break;
		default:
			break;
		}

		skKeys
			.filter(k => (k >= min && k <= max))
			.forEach(key => {
				if (!Skill.skills[key].hardpoints) {
					Skill.skills[key].checked = false;
				}
			});

		switch (me.classid) {
		case sdk.charclass.Amazon:
			break;
		case sdk.charclass.Sorceress:
			if (Config.UseColdArmor === true) {
				Precast.precastables.coldArmor.best = (function () {
					let coldArmor = [
						{skillId: sdk.skills.ShiverArmor, level: me.getSkill(sdk.skills.ShiverArmor, 1)},
						{skillId: sdk.skills.ChillingArmor, level: me.getSkill(sdk.skills.ChillingArmor, 1)},
						{skillId: sdk.skills.FrozenArmor, level: me.getSkill(sdk.skills.FrozenArmor, 1)},
					].filter(skill => !!skill.level && skill.level > 0).sort((a, b) => b.level - a.level).first();
					return coldArmor !== undefined ? coldArmor.skillId : false;
				})();
				Precast.precastables.coldArmor.duration = this.getDuration(Precast.precastables.coldArmor.best);
			} else {
				Precast.precastables.coldArmor.duration = this.getDuration(Config.UseColdArmor);
			}

			break;
		case sdk.charclass.Necromancer:
			if (!!Config.Golem && Config.Golem !== "None") {
				// todo: change Config.Golem to use skillid instead of 0, 1, 2, and 3
			}
			break;
		case sdk.charclass.Paladin:
			break;
		case sdk.charclass.Barbarian:
			Skill.canUse(sdk.skills.Shout) && (Precast.precastables.Shout.duration = this.getDuration(sdk.skills.Shout));
			Skill.canUse(sdk.skills.BattleOrders) && (Precast.precastables.BattleOrders.duration = this.getDuration(sdk.skills.BattleOrders));
			Skill.canUse(sdk.skills.BattleCommand) && (Precast.precastables.BattleCommand.duration = this.getDuration(sdk.skills.BattleCommand));
			
			break;
		case sdk.charclass.Druid:
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
		case sdk.charclass.Assassin:
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
			let valid = Skill.skills[skillId].have();
			
			return valid;
		} catch (e) {
			return false;
		}
	},

	getDuration: function (skillId = -1) {
		switch (skillId) {
		case sdk.skills.Decoy:
			return ((10 + me.getSkill(sdk.skills.Decoy, 1) * 5) * 1000);
		case sdk.skills.FrozenArmor:
			return (((12 * me.getSkill(sdk.skills.FrozenArmor, 1) + 108) + ((me.getSkill(sdk.skills.ShiverArmor, 0) + me.getSkill(sdk.skills.ChillingArmor, 0)) * 10)) * 1000);
		case sdk.skills.ShiverArmor:
			return (((12 * me.getSkill(sdk.skills.ShiverArmor, 1) + 108) + ((me.getSkill(sdk.skills.FrozenArmor, 0) + me.getSkill(sdk.skills.ChillingArmor, 0)) * 10)) * 1000);
		case sdk.skills.ChillingArmor:
			return (((6 * me.getSkill(sdk.skills.ChillingArmor, 1) + 138) + ((me.getSkill(sdk.skills.FrozenArmor, 0) + me.getSkill(sdk.skills.ChillingArmor, 0)) * 10)) * 1000);
		case sdk.skills.EnergyShield:
			return (84 + (60 * me.getSkill(sdk.skills.EnergyShield, 1)) * 1000);
		case sdk.skills.ThunderStorm:
			return (24 + (8 * me.getSkill(sdk.skills.ThunderStorm, 1))) * 1000;
		case sdk.skills.Shout:
			return (((10 + me.getSkill(sdk.skills.Shout, 1) * 10) + ((me.getSkill(sdk.skills.BattleOrders, 0) + me.getSkill(sdk.skills.BattleCommand, 0)) * 5)) * 1000);
		case sdk.skills.BattleOrders:
			return (((20 + me.getSkill(sdk.skills.BattleOrders, 1) * 10) + ((me.getSkill(sdk.skills.Shout, 0) + me.getSkill(sdk.skills.BattleCommand, 0)) * 5)) * 1000);
		case sdk.skills.BattleCommand:
			return (((10 * me.getSkill(sdk.skills.BattleCommand, 1) - 5) + ((me.getSkill(sdk.skills.Shout, 0) + me.getSkill(sdk.skills.BattleOrders, 0)) * 5)) * 1000);
		case sdk.skills.HolyShield:
			return (5 + (25 * me.getSkill(sdk.skills.HolyShield, 1)) * 1000);
		case sdk.skills.Hurricane:
			return (10 + (2 * me.getSkill(sdk.skills.CycloneArmor, 0)) * 1000);
		case sdk.skills.Werewolf:
		case sdk.skills.Werebear:
			return (40 + (20 * me.getSkill(sdk.skills.Lycanthropy, 1) + 20) * 1000);
		case sdk.skills.BurstofSpeed:
			return (108 + (12 * me.getSkill(sdk.skills.BurstofSpeed, 1)) * 1000);
		case sdk.skills.Fade:
			return (108 + (12 * me.getSkill(sdk.skills.Fade, 1)) * 1000);
		case sdk.skills.Venom:
			return (116 + (4 * me.getSkill(sdk.skills.Venom, 1)) * 1000);
		case sdk.skills.BladeShield:
			return (15 + (5 * me.getSkill(sdk.skills.BladeShield, 1)) * 1000);
		default:
			return 0;
		}
	},

	getMaxSummonCount: function (skillId) {
		let skillNum = 0;

		switch (skillId) {
		case sdk.skills.Raven:
			return Math.min(me.getSkill(skillId, 1), 5);
		case sdk.skills.SummonSpiritWolf:
			return Math.min(me.getSkill(skillId, 1), 5);
		case sdk.skills.SummonDireWolf:
			return Math.min(me.getSkill(skillId, 1), 3);
		case sdk.skills.RaiseSkeleton:
		case sdk.skills.RaiseSkeletalMage:
			skillNum = me.getSkill(skillId, 1);
			return skillNum < 4 ? skillNum : (Math.floor(skillNum / 3) + 2);
		case sdk.skills.Revive:
			return me.getSkill(sdk.skills.Revive, 1);
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
		case 0: // Normal Attack
			return Attack.usingBow() ? 20 : 3;
		case 1: // Kick
		case 5: // Left Hand Swing
		case 10: // Jab
		case 14: // Power Strike
		case 19: // Impale
		case 24: // Charged Strike
		case 30: // Fend
		case 34: // Lightning Strike
		case 46: // Blaze
		case 73: // Poison Dagger
		case 96: // Sacrifice
		case 97: // Smite
		case 106: // Zeal
		case 111: // Vengeance
		case 112: // Blessed Hammer
		case 116: // Conversion
		case 126: // Bash
		case 131: // Find Potion
		case 133: // Double Swing
		case 139: // Stun
		case 142: // Find Item
		case 144: // Concentrate
		case 147: // Frenzy
		case 150: // Grim Ward
		case 152: // Berserk
		case 232: // Feral Rage
		case 233: // Maul
		case 238: // Rabies
		case 239: // Fire Claws
		case 242: // Hunger
		case 248: // Fury
		case 255: // Dragon Talon
		case 260: // Dragon Claw
		case 270: // Dragon Tail
			return 3;
		case 146: // Battle Cry
		case 154: // War Cry
			return 4;
		case 44: // Frost Nova
		case 240: // Twister
		case 245: // Tornado
		case 500: // Summoner
			return 5;
		case 38: // Charged Bolt
			return 6;
		case 48: // Nova
		case 151: // Whirlwind
			return 7;
		case 92: // Poison Nova
			return 8;
		case 249: // Armageddon
			return 9;
		case 15: // Poison Javelin
		case 25: // Plague Javelin
		case 101: // Holy Bolt
		case 107: // Charge
		case 130: // Howl
		case 225: // Firestorm
		case 229: // Molten Boulder
		case 243: // Shock Wave
			return 10;
		case 8: // Inner Sight
		case 17: // Slow Missiles
			return 13;
		case 35: // Lightning Fury
		case 64: // Frozen Orb
		case 67: // Teeth
		case 234: // Fissure
		case 244: // Volcano
		case 251: // Fire Blast
		case 256: // Shock Web
		case 257: // Blade Sentinel
		case 266: // Blade Fury
			return 15;
		case 7: // Fire Arrow
		case 12: // Multiple Shot
		case 16: // Exploding Arrow
		case 22: // Guided Arrow
		case 27: // Immolation Arrow
		case 31: // Freezing Arrow
		case sdk.skills.IceBolt:
		case sdk.skills.IceBlast:
		case sdk.skills.FireBolt:
		case sdk.skills.FireBall:
		case 95: // Revive
		case 121: // Fist of the Heavens
		case 140: // Double Throw
		case 253: // Psychic Hammer
		case 275: // Dragon Flight
			return 20;
		case 91: // Lower Resist
			return 50;
		// Variable range
		case 42: // Static Field
			return Math.floor((me.getSkill(sdk.skills.StaticField, 1) + 3) * 2 / 3);
		case 132: // Leap
		{
			let skLvl = me.getSkill(sdk.skills.Leap, 1);
			return Math.floor(Math.min(4 + (26 * ((110 * skLvl / (skLvl + 6)) / 100)), 30) * (2 / 3));
		}
		case 230: // Arctic Blast
		{
			let skLvl = me.getSkill(sdk.skills.ArcticBlast, 1);
			let range = Math.floor(((33 + (2 * skLvl)) / 4) * (2 / 3));
			// Druid using this on physical immunes needs the monsters to be within range of hurricane
			range > 6 && Config.AttackSkill[5] === sdk.skills.ArcticBlast && (range = 6);
		
			return range;
		}
		case 49: // Lightning
		case 84: // Bone Spear
		case 93: // Bone Spirit
			return !!this.usePvpRange ? 35 : 15;
		case 47: // Fire Ball
		case 51: // Fire Wall
		case 53: // Chain Lightning
		case 56: // Meteor
		case 59: // Blizzard
		case 273: // Mind Blast
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
		case 6: // Magic Arrow
		case 7: // Fire Arrow
		case 9: // Critical Strike
		case 11: // Cold Arrow
		case 12: // Multiple Shot
		case 13: // Dodge
		case 15: // Poison Javelin
		case 16: // Exploding Arrow
		case 18: // Avoid
		case 19: // Impale
		case 20: // Lightning Bolt
		case 21: // Ice Arrow
		case 22: // Guided Arrow
		case 23: // Penetrate
		case 25: // Plague Javelin
		case 26: // Strafe
		case 27: // Immolation Arrow
		case 29: // Evade
		case 30: // Fend
		case 31: // Freezing Arrow
		case 33: // Pierce
		case 35: // Lightning Fury
		case 36: // Fire Bolt
		case 37: // Warmth
		case 38: // Charged Bolt
		case 39: // Ice Bolt
		case 41: // Inferno
		case 45: // Ice Blast
		case 47: // Fire Ball
		case 49: // Lightning
		case 53: // Chain Lightning
		case 55: // Glacial Spike
		case 61: // Fire Mastery
		case 63: // Lightning Mastery
		case 64: // Frozen Orb
		case 65: // Cold Mastery
		case 67: // Teeth
		case 73: // Poison Dagger
		case 79: // Golem Mastery
		case 84: // Bone Spear
		case 89: // Summon Resist
		case 93: // Bone Spirit
		case 101: // Holy Bolt
		case 107: // Charge
		case 112: // Blessed Hammer
		case 121: // Fist of the Heavens
		case 132: // Leap
		case 140: // Double Throw
		case 143: // Leap Attack
		case 151: // Whirlwind
		case 225: // Firestorm
		case 229: // Molten Boulder
		case 230: // Arctic Blast
		case 240: // Twister
		case 243: // Shock Wave
		case 245: // Tornado
		case 251: // Fire Trauma
		case 254: // Tiger Strike
		case 256: // Shock Field
		case 257: // Blade Sentinel
		case 259: // Fists of Fire
		case 263: // Weapon Block
		case 265: // Cobra Strike
		case 266: // Blade Fury
		case 269: // Claws of Thunder
		case 274: // Blades of Ice
		case 275: // Dragon Flight
			return 1;
		case 0: // Normal Attack
		case 10: // Jab
		case 14: // Power Strike
		case 24: // Charged Strike
		case 34: // Lightning Strike
		case 96: // Sacrifice
		case 97: // Smite
		case 106: // Zeal
		case 111: // Vengeance
		case 116: // Conversion
		case 126: // Bash
		case 133: // Double Swing
		case 139: // Stun
		case 144: // Concentrate
		case 147: // Frenzy
		case 152: // Berserk
		case 232: // Feral Rage
		case 233: // Maul
		case 238: // Rabies
		case 239: // Fire Claws
		case 242: // Hunger
		case 248: // Fury
		case 255: // Dragon Talon
		case 260: // Dragon Claw
		case 270: // Dragon Tail
			return 2; // Shift bypass
		}

		// Every other skill
		return 0;
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

			switch (hand) {
			case 0: // Right hand + No Shift
				clickType = 3;
				shift = 0;

				break;
			case 1: // Left hand + Shift
				clickType = 0;
				shift = 1;

				break;
			case 2: // Left hand + No Shift
				clickType = 0;
				shift = 0;

				break;
			case 3: // Right hand + Shift
				clickType = 3;
				shift = 1;

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
				if ([4, 9].includes(me.mode) || me.skillDelay) {
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
		if (me.getSkill(hand === 0 ? 2 : 3) === skillId) return true;
		if (!item && !Skill.canUse(skillId)) return false;

		// Charged skills must be cast from right hand
		if (hand === undefined || hand === 3 || item) {
			item && hand !== 0 && console.warn('[ÿc9Warningÿc0] charged skills must be cast from right hand');
			hand = 0;
		}

		return (me.setSkill(skillId, hand, item));
	},

	// Timed skills
	isTimed: function (skillId) {
		return [15, 25, 27, 51, 56, 59, 62, 64, 121, 225, 223, 228, 229, 234, 244, 247, 249, 250, 256, 268, 275, 277, 279].includes(skillId);
	},

	// Wereform skill check
	wereFormCheck: function (skillId) {
		// we don't even have the skills to transform or we aren't transformed
		if (!Skill.canUse(sdk.skills.Werewolf) && !Skill.canUse(sdk.skills.Werebear)) return true;
		if (!me.getState(139) && !me.getState(140)) return true;

		// Can be cast by both
		if ([sdk.skills.Attack, sdk.skills.Kick, sdk.skills.Raven, sdk.skills.PoisonCreeper, sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.CarrionVine,
			sdk.skills.HeartofWolverine, sdk.skills.SummonDireWolf, sdk.skills.FireClaws, sdk.skills.SolarCreeper, sdk.skills.Hunger, sdk.skills.SpiritofBarbs, sdk.skills.SummonGrizzly, sdk.skills.Armageddon].includes(skillId)) {
			return true;
		}

		// Can be cast by werewolf only
		if (me.getState(139) && [sdk.skills.Werewolf, sdk.skills.FeralRage, sdk.skills.Rabies, sdk.skills.Fury].includes(skillId)) return true;

		// Can be cast by werebear only
		if (me.getState(140) && [sdk.skills.Werebear, sdk.skills.Maul, sdk.skills.ShockWave].includes(skillId)) return true;

		return false;
	},

	// Skills that cn be cast in town
	townSkill: function (skillId = -1) {
		return ([sdk.skills.Valkyrie, sdk.skills.FrozenArmor, sdk.skills.Telekinesis, sdk.skills.ShiverArmor, sdk.skills.Enchant, sdk.skills.ThunderStorm, sdk.skills.EnergyShield, sdk.skills.ChillingArmor,
			sdk.skills.BoneArmor, sdk.skills.ClayGolem, sdk.skills.BloodGolem, sdk.skills.FireGolem, sdk.skills.HolyShield, sdk.skills.Raven, sdk.skills.PoisonCreeper, sdk.skills.Werewolf, sdk.skills.Werebear,
			sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.CarrionVine, sdk.skills.CycloneArmor, sdk.skills.HeartofWolverine, sdk.skills.SummonDireWolf, sdk.skills.SolarCreeper,
			sdk.skills.SpiritofBarbs, sdk.skills.SummonGrizzly, sdk.skills.BurstofSpeed, sdk.skills.Fade, sdk.skills.ShadowWarrior, sdk.skills.BladeShield, sdk.skills.Venom, sdk.skills.ShadowMaster].includes(skillId));
	},

	manaCostList: {},

	// Get mana cost of the skill (mBot)
	getManaCost: function (skillId) {
		if (skillId < 6) return 0;
		if (this.manaCostList.hasOwnProperty(skillId)) return this.manaCostList[skillId];

		let skillLvl = me.getSkill(skillId, 1);
		let effectiveShift = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
		let lvlmana = getBaseStat(3, skillId, "lvlmana") === 65535 ? -1 : getBaseStat(3, skillId, "lvlmana"); // Correction for skills that need less mana with levels (kolton)
		let ret = Math.max((getBaseStat(3, skillId, "mana") + lvlmana * (skillLvl - 1)) * (effectiveShift[getBaseStat(3, skillId, "manashift")] / 256), getBaseStat(3, skillId, "minmana"));

		if (!this.manaCostList.hasOwnProperty(skillId)) {
			this.manaCostList[skillId] = ret;
		}

		return ret;
	},

	useTK: function (unit = undefined) {
		if (!unit || !Skill.canUse(sdk.skills.Telekinesis)
			|| typeof unit !== 'object' || unit.type !== sdk.unittype.Object
			|| unit.name.toLowerCase() === 'dummy'
			|| (unit.name.toLowerCase() === 'portal' && !me.inTown && unit.classid !== 298)
			|| [sdk.units.RedPortalToAct4, sdk.units.WorldstonePortal, sdk.units.RedPortal, sdk.units.RedPortalToAct5].includes(unit.classid)) {
			return false;
		}

		return me.inTown || (me.mpPercent > 25);
	}
};

Object.defineProperties(Skill, {
	haveTK: {
		get: function () {
			return Skill.canUse(sdk.skills.Telekinesis);
		},
	},
});

// whole section should be moved
const Item = {
	hasTier: function (item) {
		return Config.AutoEquip && NTIP.GetTier(item) > 0;
	},

	canEquip: function (item) {
		// Not an item or unid
		if (item.type !== 4 || !item.identified) return false;
		// Higher requirements
		if (item.getStat(92) > me.getStat(12) || item.dexreq > me.getStat(2) || item.strreq > me.getStat(0)) return false;

		return true;
	},

	// Equips an item and throws away the old equipped item
	equip: function (item, bodyLoc) {
		if (!this.canEquip(item)) return false;

		// Already equipped in the right slot
		if (item.mode === 1 && item.bodylocation === bodyLoc) return true;
		if (item.location === 7 && !Town.openStash()) return false;

		for (let i = 0; i < 3; i += 1) {
			if (item.toCursor()) {
				clickItemAndWait(0, bodyLoc);


				if (item.bodylocation === bodyLoc) {
					if (getCursorType() === 3) {
						let cursorItem = getUnit(100);

						if (cursorItem) {
							if (!Storage.Inventory.CanFit(cursorItem) || !Storage.Inventory.MoveTo(cursorItem)) {
								cursorItem.drop();
							}
						}
					}

					return true;
				}
			}
		}

		return false;
	},

	getEquippedItem: function (bodyLoc) {
		let item = me.getItem();

		if (item) {
			do {
				if (item.bodylocation === bodyLoc) {
					return {
						classid: item.classid,
						tier: NTIP.GetTier(item)
					};
				}
			} while (item.getNext());
		}

		// Don't have anything equipped in there
		return {
			classid: -1,
			tier: -1
		};
	},

	getBodyLoc: function (item) {
		let bodyLoc;

		switch (item.itemType) {
		case sdk.itemtype.Shield:
		case sdk.itemtype.AuricShields:
		case sdk.itemtype.VoodooHeads:
		case sdk.itemtype.BowQuiver:
		case sdk.itemtype.CrossbowQuiver:
			bodyLoc = 5;

			break;
		case sdk.itemtype.Armor:
			bodyLoc = 3;

			break;
		case sdk.itemtype.Ring:
			bodyLoc = [6, 7];

			break;
		case sdk.itemtype.Amulet:
			bodyLoc = 2;

			break;
		case sdk.itemtype.Boots:
			bodyLoc = 9;

			break;
		case sdk.itemtype.Gloves:
			bodyLoc = 10;

			break;
		case sdk.itemtype.Belt:
			bodyLoc = 8;

			break;
		case sdk.itemtype.Helm:
		case sdk.itemtype.PrimalHelm:
		case sdk.itemtype.Circlet:
		case sdk.itemtype.Pelt:
			bodyLoc = 1;

			break;
		case sdk.itemtype.Scepter:
		case sdk.itemtype.Wand:
		case sdk.itemtype.Staff:
		case sdk.itemtype.Bow:
		case sdk.itemtype.Axe:
		case sdk.itemtype.Club:
		case sdk.itemtype.Sword:
		case sdk.itemtype.Hammer:
		case sdk.itemtype.Knife:
		case sdk.itemtype.Spear:
		case sdk.itemtype.Polearm:
		case sdk.itemtype.Crossbow:
		case sdk.itemtype.Mace:
		case sdk.itemtype.ThrowingKnife:
		case sdk.itemtype.ThrowingAxe:
		case sdk.itemtype.Javelin:
		case sdk.itemtype.Orb:
		case sdk.itemtype.AmazonBow:
		case sdk.itemtype.AmazonSpear:
		case sdk.itemtype.AmazonJavelin:
		case sdk.itemtype.MissilePotion:
			bodyLoc = me.barbarian ? [4, 5] : 4;

			break;
		case sdk.itemtype.HandtoHand:
		case sdk.itemtype.AssassinClaw:
			bodyLoc = me.assassin ? [4, 5] : 4;

			break;
		default:
			return false;
		}

		!Array.isArray(bodyLoc) && (bodyLoc = [bodyLoc]);

		return bodyLoc;
	},

	autoEquipCheck: function (item) {
		if (!Config.AutoEquip) return true;

		let tier = NTIP.GetTier(item);
		let bodyLoc = this.getBodyLoc(item);

		if (tier > 0 && bodyLoc) {
			for (let i = 0; i < bodyLoc.length; i += 1) {
				// Low tier items shouldn't be kept if they can't be equipped
				if (tier > this.getEquippedItem(bodyLoc[i]).tier && (this.canEquip(item) || !item.getFlag(0x10))) {
					return true;
				}
			}
		}

		// Sell/ignore low tier items, keep high tier
		if (tier > 0 && tier < 100) return false;

		return true;
	},

	// returns true if the item should be kept+logged, false if not
	autoEquip: function () {
		if (!Config.AutoEquip) return true;

		let items = me.findItems(-1, 0);

		if (!items) return false;

		function sortEq(a, b) {
			if (Item.canEquip(a)) return -1;
			if (Item.canEquip(b)) return 1;

			return 0;
		}

		me.cancel();

		// Remove items without tier
		for (let i = 0; i < items.length; i += 1) {
			if (NTIP.GetTier(items[i]) === 0) {
				items.splice(i, 1);

				i -= 1;
			}
		}

		while (items.length > 0) {
			items.sort(sortEq);

			let tier = NTIP.GetTier(items[0]);
			let bodyLoc = this.getBodyLoc(items[0]);

			if (tier > 0 && bodyLoc) {
				for (let j = 0; j < bodyLoc.length; j += 1) {
					// khalim's will adjustment
					if ([3, 7].indexOf(items[0].location) > -1 && tier > this.getEquippedItem(bodyLoc[j]).tier && this.getEquippedItem(bodyLoc[j]).classid !== 174) {
						if (!items[0].getFlag(0x10)) { // unid
							let tome = me.findItem(519, 0, 3);

							if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
								if (items[0].location === 7) {
									Town.openStash();
								}

								Town.identifyItem(items[0], tome);
							}
						}

						let gid = items[0].gid;
						console.log(items[0].name);

						if (this.equip(items[0], bodyLoc[j])) {
							Misc.logItem("Equipped", me.getItem(-1, -1, gid));
						}

						break;
					}
				}
			}

			items.shift();
		}

		return true;
	}
};

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

			if (player && player.partyid !== 65535 && player.partyid === myPartyId) {
				return true;
			}
		} catch (e) {
			player = getParty();

			if (player) {
				myPartyId = player.partyid;

				while (player.getNext()) {
					if (player.partyid !== 65535 && player.partyid === myPartyId) {
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
		let player = getUnit(0, name);

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
		let player = getUnit(0);

		if (player) {
			do {
				if (!player.dead) {
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
				if (party.partyid !== 65535 && party.partyid === myPartyId && party.name !== me.name) {
					print(party.name);
					count += 1;
				}
			} while (party.getNext());
		}

		return count;
	},

	// autoleader by Ethic - refactored by theBGuy
	autoLeaderDetect: function (givenSettings = {}) {
		let settings = Object.assign({}, {
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
		typeof unit === "number" && (unit = getUnit(2, unit));
		
		// Skip invalid/open and Countess chests
		if (!unit || unit.x === 12526 || unit.x === 12565 || unit.mode) return false;

		// locked chest, no keys
		if (!me.assassin && unit.islocked && !me.findItem(543, 0, 3)) return false;

		let specialChest = sdk.quest.chests.includes(unit.classid);

		for (let i = 0; i < 7; i++) {
			if (Skill.useTK(unit) && i < 3) {
				unit.distance > 13 && Attack.getIntoPosition(unit, 13, 0x4);
				Skill.cast(sdk.skills.Telekinesis, 0, unit);
			} else {
				getDistance(me.x, me.y, unit.x + 1, unit.y + 2) > 5 && Pather.moveTo(unit.x + 1, unit.y + 2, 3);

				if (getDistance(me.x, me.y, unit.x + 1, unit.y + 2) < 5) {
					specialChest && i > 2 ? Misc.click(0, 0, unit) : sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
				}
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
		
		let coords = [];
		let presetUnits = getPresetUnits(area, 2);

		if (!presetUnits) return false;

		if (!chestIds.length) {
			chestIds = [
				5, 6, 87, 104, 105, 106, 107, 143, 140, 141, 144, 146, 147, 148, 176, 177, 181, 183, 198, 240, 241,
				242, 243, 329, 330, 331, 332, 333, 334, 335, 336, 354, 355, 356, 371, 387, 389, 390, 391, 397, 405,
				406, 407, 413, 420, 424, 425, 430, 431, 432, 433, 454, 455, 501, 502, 504, 505, 580, 581
			];
		}

		while (presetUnits.length > 0) {
			if (chestIds.indexOf(presetUnits[0].id) > -1) {
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

		let unit = getUnit(2);

		if (unit) {
			do {
				if (unit.name && unit.mode === 0 && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.includes(unit.name.toLowerCase())) {
					unitList.push(copyUnit(unit));
				}
			} while (unit.getNext());
		}

		while (unitList.length > 0) {
			unitList.sort(Sort.units);
			unit = unitList.shift();

			if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x5)) && this.openChest(unit)) {
				Pickit.pickItems();
			}
		}

		return true;
	},

	shrineStates: false,

	scanShrines: function (range) {
		if (!Config.ScanShrines.length) return false;

		!range && (range = Pather.useTeleport() ? 25 : 15);

		let shrineList = [];

		// Initiate shrine states
		if (!this.shrineStates) {
			this.shrineStates = [];

			for (let i = 0; i < Config.ScanShrines.length; i += 1) {
				switch (Config.ScanShrines[i]) {
				case 0: // None
				case 1: // Refilling
				case 2: // Health
				case 3: // Mana
				case 4: // Health Exchange (doesn't exist)
				case 5: // Mana Exchange (doesn't exist)
				case 16: // Enirhs (doesn't exist)
				case 17: // Portal
				case 18: // Gem
				case 19: // Fire
				case 20: // Monster
				case 21: // Exploding
				case 22: // Poison
					this.shrineStates[i] = 0; // no state

					break;
				case 6: // Armor
				case 7: // Combat
				case 8: // Resist Fire
				case 9: // Resist Cold
				case 10: // Resist Lightning
				case 11: // Resist Poison
				case 12: // Skill
				case 13: // Mana recharge
				case 14: // Stamina
				case 15: // Experience
					// Both states and shrines are arranged in same order with armor shrine starting at 128
					this.shrineStates[i] = Config.ScanShrines[i] + 122;

					break;
				}
			}
		}

		let shrine = getUnit(2, "shrine");

		if (shrine) {
			let index = -1;
			// Build a list of nearby shrines
			do {
				if (shrine.mode === 0 && getDistance(me.x, me.y, shrine.x, shrine.y) <= range) {
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
					if (index === -1 || i <= index || this.shrineStates[i] === 0) {
						if (shrineList[j].objtype === Config.ScanShrines[i] && (Pather.useTeleport() || !checkCollision(me, shrineList[j], 0x5))) {
							this.getShrine(shrineList[j]);

							// Gem shrine - pick gem
							if (Config.ScanShrines[i] === 18) {
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
		if (unit.mode === 2) return false;

		for (let i = 0; i < 3; i++) {
			if (Skill.useTK(unit) && i < 2) {
				unit.distance > 21 && Pather.moveNearUnit(unit, 20);
				!Skill.cast(sdk.skills.Telekinesis, 0, unit) && Attack.getIntoPosition(unit, 20, 0x5);
			} else {
				if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
					Misc.click(0, 0, unit);
				}
			}

			if (Misc.poll(() => unit.mode, 1000, 20 + me.ping)) {
				return true;
			}
		}

		return false;
	},

	// Check all shrines in area and get the first one of specified type
	getShrinesInArea: function (area, type, use) {
		let shrineLocs = [];
		let shrineIds = [2, 81, 83];
		let unit = getPresetUnits(area);

		if (unit) {
			for (let i = 0; i < unit.length; i += 1) {
				if (shrineIds.includes(unit[i].id)) {
					shrineLocs.push([unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y]);
				}
			}
		}

		while (shrineLocs.length > 0) {
			shrineLocs.sort(Sort.points);
			let coords = shrineLocs.shift();

			Skill.haveTK ? Pather.moveNear(coords[0], coords[1], 20) : Pather.moveTo(coords[0], coords[1], 2);

			let shrine = getUnit(2, "shrine");

			if (shrine) {
				do {
					if (shrine.objtype === type && shrine.mode === 0) {
						(!Skill.haveTK || !use) && Pather.moveTo(shrine.x - 2, shrine.y - 2);

						if (!use || this.getShrine(shrine)) {
							return true;
						}
					}
				} while (shrine.getNext());
			}
		}

		return false;
	},

	getItemDesc: function (unit, logILvl = true) {
		let stringColor = "";
		let desc = unit.description;

		if (!desc) return "";
		desc = desc.split("\n");

		// Lines are normally in reverse. Add color tags if needed and reverse order.
		for (let i = 0; i < desc.length; i += 1) {
			// Remove sell value
			if (desc[i].indexOf(getLocaleString(3331)) > -1) {
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
		let code = "";
		
		if (unit === undefined) return code;

		switch (unit.quality) {
		case 5: // Set
			switch (unit.classid) {
			case 27: // Angelic sabre
				code = "inv9sbu";

				break;
			case 74: // Arctic short war bow
				code = "invswbu";

				break;
			case 308: // Berserker's helm
				code = "invhlmu";

				break;
			case 330: // Civerb's large shield
				code = "invlrgu";

				break;
			case 31: // Cleglaw's long sword
			case 227: // Szabi's cryptic sword
				code = "invlsdu";

				break;
			case 329: // Cleglaw's small shield
				code = "invsmlu";

				break;
			case 328: // Hsaru's buckler
				code = "invbucu";

				break;
			case 306: // Infernal cap / Sander's cap
				code = "invcapu";

				break;
			case 30: // Isenhart's broad sword
				code = "invbsdu";

				break;
			case 309: // Isenhart's full helm
				code = "invfhlu";

				break;
			case 333: // Isenhart's gothic shield
				code = "invgtsu";

				break;
			case 326: // Milabrega's ancient armor
			case 442: // Immortal King's sacred armor
				code = "invaaru";

				break;
			case 331: // Milabrega's kite shield
				code = "invkitu";

				break;
			case 332: // Sigon's tower shield
				code = "invtowu";

				break;
			case 325: // Tancred's full plate mail
				code = "invfulu";

				break;
			case 3: // Tancred's military pick
				code = "invmpiu";

				break;
			case 113: // Aldur's jagged star
				code = "invmstu";

				break;
			case 234: // Bul-Kathos' colossus blade
				code = "invgsdu";

				break;
			case 372: // Grizwold's ornate plate
				code = "invxaru";

				break;
			case 366: // Heaven's cuirass
			case 215: // Heaven's reinforced mace
			case 449: // Heaven's ward
			case 426: // Heaven's spired helm
				code = "inv" + unit.code + "s";

				break;
			case 357: // Hwanin's grand crown
				code = "invxrnu";

				break;
			case 195: // Nalya's scissors suwayyah
				code = "invskru";

				break;
			case 395: // Nalya's grim helm
			case 465: // Trang-Oul's bone visage
				code = "invbhmu";

				break;
			case 261: // Naj's elder staff
				code = "invcstu";

				break;
			case 375: // Orphan's round shield
				code = "invxmlu";

				break;
			case 12: // Sander's bone wand
				code = "invbwnu";

				break;
			}

			break;
		case 7: // Unique
			for (let i = 0; i < 401; i += 1) {
				if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
					code = getBaseStat(17, i, "invfile");

					break;
				}
			}

			break;
		}

		if (!code) {
			// Tiara/Diadem
			code = ["ci2", "ci3"].includes(unit.code) ? unit.code : (getBaseStat(0, unit.classid, 'normcode') || unit.code);
			code = code.replace(" ", "");
			[10, 12, 58, 82, 83, 84].includes(unit.itemType) && (code += (unit.gfx + 1));
		}

		return code;
	},

	getItemSockets: function (unit) {
		let code,
			sockets = unit.sockets,
			subItems = unit.getItemsEx(),
			tempArray = [];

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

				if ([10, 12, 58, 82, 83, 84].includes(tempArray[i].itemType)) {
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

		let desc,
			date = new Date(),
			dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace(/-/g, '/').replace('T', ' ') + "]";

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
				if (sock.itemType === 58) {
					desc += "\n\n";
					desc += this.getItemDesc(sock);
				}
			} while (sock.getNext());
		}

		keptLine && (desc += ("\n\\xffc0Line: " + keptLine));
		desc += "$" + (unit.getFlag(0x400000) ? ":eth" : "");

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
		switch (id) {
		//case 549: // horadric cube
		case 0: // hand axe
		case 10: // wand
		case 14: // club
		case 25: // shortsword
		case 47: // javelin
		case 63: // shortstaff
		case 175: // katar
		case 328: // buckler
		case 513: // stamina potion
		case 514: // antidote potion
		case 515: // rejuvenationpotion
		case 516: // fullrejuvenationpotion
		case 517: // thawing potion
		case 518: // tomeoftownportal
		case 519: // tomeofidentify
		case 529: // scrolloftownportal
		case 530: // scrollofidentify
		case 543: // key
		case 587: // minorhealingpotion
		case 588: // lighthealingpotion
		case 589: // healingpotion
		case 590: // greathealingpotion
		case 591: // superhealingpotion
		case 592: // minormanapotion
		case 593: // lightmanapotion
		case 594: // manapotion
		case 595: // greatermanapotion
		case 596: // supermanapotion
			return true;
		}

		return false;
	},

	// Change into werewolf or werebear
	shapeShift: function (mode) {
		let skill, state;

		switch (mode.toString().toLowerCase()) {
		case "0":
			return false;
		case "1":
		case "werewolf":
			state = 139;
			skill = 223;

			break;
		case "2":
		case "werebear":
			state = 140;
			skill = 228;

			break;
		default:
			throw new Error("shapeShift: Invalid parameter");
		}

		// don't have wanted skill
		if (Skill.canUse(skill)) return false;
		// already in wanted state
		if (me.getState(state)) return true;

		let slot = Attack.getPrimarySlot();
		me.switchWeapons(Precast.getBetterSlot(skill));

		for (let i = 0; i < 3; i += 1) {
			Skill.cast(skill, 0);
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
		if (me.getState(139) || me.getState(140)) {
			for (let i = 0; i < 3; i += 1) {
				Skill.cast(me.getState(139) ? 223 : 228);

				let tick = getTickCount();

				while (getTickCount() - tick < 2000) {
					if (!me.getState(139) && !me.getState(140)) {
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
		let potion, check;
		let needhp = true;
		let needmp = true;

		if (Config.TownCheck && !me.inTown) {
			try {
				if (me.gold > 1000) {
					for (let i = 0; i < 4; i += 1) {
						if (Config.BeltColumn[i] === "hp" && Config.MinColumn[i] > 0) {
							potion = me.getItem(-1, 2); // belt item

							if (potion) {
								do {
									if (potion.code.indexOf("hp") > -1) {
										needhp = false;

										break;
									}
								} while (potion.getNext());
							}

							if (needhp) {
								print("We need healing potions");

								check = true;
							}
						}

						if (Config.BeltColumn[i] === "mp" && Config.MinColumn[i] > 0) {
							potion = me.getItem(-1, 2); // belt item

							if (potion) {
								do {
									if (potion.code.indexOf("mp") > -1) {
										needmp = false;

										break;
									}
								} while (potion.getNext());
							}

							if (needmp) {
								print("We need mana potions");

								check = true;
							}
						}
					}
				}

				if (Config.OpenChests.Enabled && Town.needKeys()) {
					check = true;
				}
			} catch (e) {
				check = false;
			}
		}

		if (check) {
			// check that townchicken is running - so we don't spam needing potions if it isn't
			let townChick = getScript("tools/TownChicken.js");
			if (!townChick || townChick && !townChick.running) {
				return false;
			}

			townChick.send("townCheck");
			console.log("townCheck check Duration: " + (getTickCount() - tTick));
			delay(100);

			return true;
		}

		return false;
	},

	// Log someone's gear
	spy: function (name) {
		!isIncluded("oog.js") && include("oog.js");
		!isIncluded("common/prototypes.js") && include("common/prototypes.js");

		let unit = getUnit(-1, name);

		if (!unit) {
			print("player not found");

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
		let dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace(/-/g, '/').replace('T', ' ') + "]";

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

			if (stackLog) {
				filemsg += "Stack: " + stackLog + "\n";
			}
		}

		if (this.errorConsolePrint) {
			D2Bot.printToConsole(oogmsg, 10);
		}

		showConsole();
		print(msg);
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
		case 0x1507: // Resurrect (non-English dialog)
		case 0x0D44: // Trade (crash dialog)
			npc = getInteractedNPC();

			if (npc) {
				npc.useMenu(id);
				delay(750);

				return true;
			}

			break;
		}

		let lines = getDialogLines();

		if (!lines) {
			return false;
		}

		for (let i = 0; i < lines.length; i += 1) {
			if (lines[i].selectable && lines[i].text.indexOf(getLocaleString(id)) > -1) {
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

		if (typeof excluded !== 'object' || excluded.length === undefined) {
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
		sendPacket(1, 0x40);
		delay(500 + me.ping);

		return me.getQuest(id, state);
	},

	getQuestStates: function (questID) {
		if (!me.gameReady) return [];
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
		return me.getStat(12) === 99 ? 0 : (((me.getStat(13) - this.totalExp[me.getStat(12)]) / this.nextExp[me.getStat(12)]) * 100).toFixed(2);
	},

	// Total experience gained in current run
	gain: function () {
		return (me.getStat(13) - DataFile.getStats().experience);
	},

	// Percent experience gained in current run
	gainPercent: function () {
		return me.getStat(12) === 99 ? 0 : (this.gain() * 100 / this.nextExp[me.getStat(12)]).toFixed(6);
	},

	// Runs until next level
	runsToLevel: function () {
		return Math.round(((100 - this.progress()) / 100) * this.nextExp[me.getStat(12)] / this.gain());
	},

	// Total runs needed for next level (not counting current progress)
	totalRunsToLevel: function () {
		return Math.round(this.nextExp[me.getStat(12)] / this.gain());
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
		let string = "[Game: " + me.gamename + (me.gamepassword ? "//" + me.gamepassword : "") + getGameTime + "] [Level: " + me.getStat(12) + " (" + progress + "%)] [XP: " + gain + "] [Games ETA: " + runsToLevel + "]";

		if (gain) {
			D2Bot.printToConsole(string, 4);

			if (me.getStat(12) > DataFile.getStats().level) {
				D2Bot.printToConsole("Congrats! You gained a level. Current level:" + me.getStat(12), 5);
			}
		}
	}
};

const Packet = {
	openMenu: function (unit) {
		if (unit.type !== 1) throw new Error("openMenu: Must be used on NPCs.");
		if (getUIFlag(sdk.uiflags.NPCMenu)) return true;

		for (let i = 0; i < 5; i += 1) {
			unit.distance > 4 && Pather.moveToUnit(unit);
			sendPacket(1, 0x13, 4, 1, 4, unit.gid);
			let tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUIFlag(sdk.uiflags.NPCMenu)) {
					delay(Math.max(500, me.ping * 2));

					return true;
				}

				if (getInteractedNPC() && getTickCount() - tick > 1000) {
					me.cancel();
				}

				delay(100);
			}

			sendPacket(1, 0x2f, 4, 1, 4, unit.gid);
			delay(me.ping + 1 * 2);
			sendPacket(1, 0x30, 4, 1, 4, unit.gid);
			delay(me.ping + 1 * 2);
			this.flash(me.gid);
		}

		return false;
	},

	startTrade: function (unit, mode) {
		if (unit.type !== 1) throw new Error("Unit.startTrade: Must be used on NPCs.");
		if (getUIFlag(0x0C)) return true;

		let gamble = mode === "Gamble";

		if (this.openMenu(unit)) {
			for (let i = 0; i < 10; i += 1) {
				delay(200);

				i % 2 === 0 && sendPacket(1, 0x38, 4, gamble ? 2 : 1, 4, unit.gid, 4, 0);

				if (unit.itemcount > 0) {
					delay(200);

					return true;
				}
			}
		}

		return false;
	},

	buyItem: function (unit, shiftBuy, gamble) {
		let oldGold = me.getStat(14) + me.getStat(15);
		let itemCount = me.itemcount;
		let npc = getInteractedNPC();

		try {
			if (!npc) throw new Error("buyItem: No NPC menu open.");

			// Can we afford the item?
			if (oldGold < unit.getItemCost(0)) return false;

			for (let i = 0; i < 3; i += 1) {
				sendPacket(1, 0x32, 4, npc.gid, 4, unit.gid, 4, shiftBuy ? 0x80000000 : gamble ? 0x2 : 0x0, 4, 0);

				let tick = getTickCount();

				while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
					if (shiftBuy && me.getStat(14) + me.getStat(15) < oldGold) return true;
					if (itemCount !== me.itemcount) return true;

					delay(10);
				}
			}
		} catch (e) {
			console.warn(e);
		}

		return false;
	},

	sellItem: function (unit) {
		// Check if it's an item we want to buy
		if (unit.type !== 4) throw new Error("Unit.sell: Must be used on items.");

		let itemCount = me.itemcount;
		let npc = getInteractedNPC();

		if (!npc) return false;

		for (let i = 0; i < 5; i += 1) {
			sendPacket(1, 0x33, 4, npc.gid, 4, unit.gid, 4, 0, 4, 0);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (me.itemcount !== itemCount) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	identifyItem: function (unit, tome) {
		if (!unit || unit.identified) return false;

		CursorLoop:
		for (let i = 0; i < 3; i += 1) {
			sendPacket(1, 0x27, 4, unit.gid, 4, tome.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (getCursorType() === 6) {
					break CursorLoop;
				}

				delay(10);
			}
		}

		if (getCursorType() !== 6) {
			return false;
		}

		for (let i = 0; i < 3; i += 1) {
			getCursorType() === 6 && sendPacket(1, 0x27, 4, unit.gid, 4, tome.gid);

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
			// Return true if the item is already on cursor
			if (getUnit(100).gid === item.gid) {
				return true;
			}
			this.dropItem(getUnit(100)); // If another item is on cursor, drop it
		}

		for (let i = 0; i < 15; i += 1) {
			// equipped
			item.mode === 1 ? sendPacket(1, 0x1c, 2, item.bodylocation) : sendPacket(1, 0x19, 4, item.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (me.itemoncursor) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	dropItem: function (item) {
		if (!this.itemToCursor(item)) return false;

		for (let i = 0; i < 15; i += 1) {
			sendPacket(1, 0x17, 4, item.gid);

			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (!me.itemoncursor) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	givePotToMerc: function (item) {
		if (!!item
			&& [sdk.itemtype.HealingPotion, sdk.itemtype.RejuvPotion, sdk.itemtype.ThawingPotion, sdk.itemtype.AntidotePotion].includes(item.itemType)) {
			switch (item.location) {
			case sdk.storage.Belt:
				sendPacket(1, 0x26, 4, item.gid, 4, 1, 4, 0);

				return true;
			case sdk.storage.Inventory:
				if (this.itemToCursor(item)) {
					sendPacket(1, 0x61, 2, 0);

					return true;
				}

				break;
			default:
				break;
			}
		}

		return false;
	},

	castSkill: function (hand, wX, wY) {
		hand = (hand === 0) ? 0x0c : 0x05;
		sendPacket(1, hand, 2, wX, 2, wY);
	},

	unitCast: function (hand, who) {
		hand = (hand === 0) ? 0x11 : 0x0a;
		sendPacket(1, hand, 4, who.type, 4, who.gid);
	},

	// moveNPC: function (npc, dwX, dwY) { // commented the patched packet
	// 	//sendPacket(1, 0x59, 4, npc.type, 4, npc.gid, 4, dwX, 4, dwY);
	// },

	teleWalk: function (x, y, maxDist = 5) {
		!this.telewalkTick && (this.telewalkTick = 0);

		if (getDistance(me, x, y) > 10 && getTickCount() - this.telewalkTick > 3000 && Attack.validSpot(x, y)) {
			for (let i = 0; i < 5; i += 1) {
				sendPacket(1, 0x5f, 2, x + rand(-1, 1), 2, y + rand(-1, 1));
				delay(me.ping + 1);
				sendPacket(1, 0x4b, 4, me.type, 4, me.gid);
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

	flash: function (gid, wait = 300 + 2 * me.ping) {
		sendPacket(1, 0x4b, 4, 0, 4, gid);

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
		if (typeof packetType === 'number') {
			packetType = [packetType];
		}

		if (typeof packetType === 'object' && packetType.length) {
			addEventListener('gamepacket', packet => (packetType.indexOf(packet[0]) > -1 ? callback(packet) : false));

			return callback;
		}

		return null;
	},

	removeListener: callback => removeEventListener('gamepacket', callback), // just a wrapper
};

/*

new PacketBuilder() - create new packet object

Example (Spoof 'reassign player' packet to client):
	new PacketBuilder().byte(0x15).byte(0).dword(me.gid).word(x).word(y).byte(1).get();

Example (Spoof 'player move' packet to server):
	new PacketBuilder().byte(0x3).word(x).word(y).send();
*/

function PacketBuilder () {
	// globals DataView ArrayBuffer
	if (this.__proto__.constructor !== PacketBuilder) throw new Error("PacketBuilder must be called with 'new' operator!");

	let queue = [], count = 0;

	// accepts any number of arguments
	let enqueue = (type, size) => (...args) => {
		args.forEach(arg => {
			if (type === 'String') {
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
				dv['set' + field.type](i, field.data, true);
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
			toggle = typeof Config.LocalChat.Toggle === 'string' ? Config.LocalChat.Toggle.charCodeAt(0) : Config.LocalChat.Toggle;
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
