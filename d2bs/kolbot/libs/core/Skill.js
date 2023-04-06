/**
*  @filename    Skill.js
*  @author      theBGuy
*  @credit      kolton
*  @desc        Skill library
*
*/

(function () {
	const _SkillData = require("./GameData/SkillData");

	/**
	 * @todo Move some of the precast functions here
	 */
	const Skill = {
		usePvpRange: false,
		charges: [],
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

		// initialize our skill data
		init: function () {
			// reset check values
			{
				let [min, max] = Skill.getClassSkillRange();

				for (let i = min; i <= max; i++) {
					_SkillData.get(i).reset();
				}
			}
			// redo cta check
			Precast.checkCTA();

			switch (me.classid) {
			case sdk.player.class.Amazon:
				break;
			case sdk.player.class.Sorceress:
				if (Config.UseColdArmor === true) {
					Precast.skills.coldArmor.best = (function () {
						let coldArmor = [
							{ skillId: sdk.skills.ShiverArmor, level: me.getSkill(sdk.skills.ShiverArmor, sdk.skills.subindex.SoftPoints) },
							{ skillId: sdk.skills.ChillingArmor, level: me.getSkill(sdk.skills.ChillingArmor, sdk.skills.subindex.SoftPoints) },
							{ skillId: sdk.skills.FrozenArmor, level: me.getSkill(sdk.skills.FrozenArmor, sdk.skills.subindex.SoftPoints) },
						].filter(skill => !!skill.level && skill.level > 0).sort((a, b) => b.level - a.level).first();
						return coldArmor !== undefined ? coldArmor.skillId : -1;
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

		/**
		 * @param {number} skillId 
		 * @returns {boolean}
		 */
		canUse: function (skillId = -1) {
			if (skillId < 0) return false;
			if (skillId <= sdk.skills.LeftHandSwing) return true;
			return _SkillData.get(skillId).have();
		},

		/**
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getDuration: function (skillId = -1) {
			if (skillId < 0) return 0;
			return _SkillData.get(skillId).duration();
		},

		/**
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getMaxSummonCount: function (skillId) {
			if (skillId < 0) return 0;
			return _SkillData.get(skillId).summonCount();
		},

		/**
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getRange: function (skillId) {
			if (skillId < 0) return 0;
			return _SkillData.get(skillId).range(this.usePvpRange);
		},

		/**
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getHand: function (skillId) {
			if (skillId < 0) return -1;
			return _SkillData.get(skillId).hand;
		},

		/**
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getState: function (skillId) {
			if (skillId < 0) return 0;
			return _SkillData.get(skillId).state;
		},

		/**
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getCharClass: function (skillId) {
			if (skillId < 0) return 0;
			return _SkillData.get(skillId).charClass;
		},

		/**
		 * Get mana cost of the skill (mBot)
		 * @param {number} skillId 
		 * @returns {number}
		 */
		getManaCost: function (skillId) {
			if (skillId < sdk.skills.MagicArrow) return 0;
			return _SkillData.get(skillId).manaCost();
		},

		/**
		 * Timed skills
		 * @param {number} skillId 
		 * @returns {boolean}
		 */
		isTimed: function (skillId) {
			if (skillId < 0) return false;
			return _SkillData.get(skillId).timed;
		},

		/**
		 * Skills that cn be cast in town
		 * @param {number} skillId 
		 * @returns {boolean}
		 */
		townSkill: function (skillId = -1) {
			if (skillId < 0) return false;
			return _SkillData.get(skillId).townSkill;
		},

		/**
		 * @param {number} skillId 
		 * @returns {boolean}
		 */
		missileSkill: function (skillId = -1) {
			if (skillId < 0) return false;
			return _SkillData.get(skillId).missleSkill;
		},

		/**
		 * Wereform skill check
		 * @param {number} skillId 
		 * @returns {number}
		 */
		wereFormCheck: function (skillId) {
			// we don't even have the skills to transform or we aren't transformed - add handler for wereform given by an item that is on switch
			if (!Skill.canUse(sdk.skills.Werewolf) && !Skill.canUse(sdk.skills.Werebear)) return true;
			const shared = new Set([
				sdk.skills.Attack, sdk.skills.Kick, sdk.skills.Raven, sdk.skills.PoisonCreeper,
				sdk.skills.OakSage, sdk.skills.SpiritWolf, sdk.skills.CarrionVine, sdk.skills.HeartofWolverine,
				sdk.skills.SummonDireWolf, sdk.skills.FireClaws, sdk.skills.SolarCreeper, sdk.skills.Hunger,
				sdk.skills.SpiritofBarbs, sdk.skills.SummonGrizzly, sdk.skills.Armageddon
			]);
			const wolfOnly = new Set([sdk.skills.FeralRage, sdk.skills.Rabies, sdk.skills.Fury]);
			const bearOnly = new Set([sdk.skills.Maul, sdk.skills.ShockWave]);
			
			let wolfForm = me.getState(sdk.states.Wearwolf);
			if (wolfForm) return shared.has(skillId) || wolfOnly.has(skillId);

			let bearForm = me.getState(sdk.states.Wearbear);
			if (bearForm) return shared.has(skillId) || bearOnly.has(skillId);

			// if we are not in either form, we can use any skill
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

			try {
				for (let i = 0; i < 3; i += 1) {
					Skill.cast(skill, sdk.skills.hand.Right);
					
					if (Misc.poll(() => me.getState(state), 2000, 50)) {
						return true;
					}
				}

				return false;
			} finally {
				me.weaponswitch !== slot && me.switchWeapons(slot);
			}
		},

		// Change back to human shape
		unShift: function () {
			let [state, skill] = me.getState(sdk.states.Wearwolf)
				? [sdk.states.Wearwolf, sdk.skills.Werewolf]
				: me.getState(sdk.states.Wearbear)
					? [sdk.states.Wearbear, sdk.skills.Werebear]
					: [0, 0];
			if (!state) return true;
			for (let i = 0; i < 3; i++) {
				Skill.cast(skill);

				if (Misc.poll(() => !me.getState(state), 2000, 50)) {
					return true;
				}
			}

			return false;
		},
		
		/**
		 * @param {Unit} unit 
		 * @returns {boolean}
		 */
		useTK: function (unit) {
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
			if (skillId === undefined) throw new Error("Unit.cast: Must supply a skill ID");
			switch (true) {
			case me.inTown && !this.townSkill(skillId):
			case !item && (this.getManaCost(skillId) > me.mp || !this.canUse(skillId)):
			case !this.wereFormCheck(skillId):
				return false;
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

				for (let n = 0; n < 3; n += 1) {
					typeof x === "object" ? clickMap(clickType, shift, x) : clickMap(clickType, shift, x, y);
					delay(20);
					typeof x === "object" ? clickMap(clickType + 2, shift, x) : clickMap(clickType + 2, shift, x, y);

					if (Misc.poll(() => me.attacking, 200, 20)) {
						break;
					}
				}

				while (me.attacking) {
					delay(10);
				}
			}

			// account for lag, state 121 doesn't kick in immediately
			if (this.isTimed(skillId)) {
				Misc.poll(() => me.skillDelay || [sdk.player.mode.GettingHit, sdk.player.mode.Blocking].includes(me.mode), 100, 10);
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
