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
    /** @type {ChargedSkill[]} */
    charges: [],
    needFloor: [
      sdk.skills.Blizzard, sdk.skills.Meteor, sdk.skills.Fissure,
      sdk.skills.Volcano, sdk.skills.ShockWeb, sdk.skills.LeapAttack, sdk.skills.Hydra
    ],
    missileSkills: [
      sdk.skills.MagicArrow, sdk.skills.FireArrow, sdk.skills.ColdArrow,
      sdk.skills.MultipleShot, sdk.skills.PoisonJavelin, sdk.skills.ExplodingArrow,
      sdk.skills.LightningBolt, sdk.skills.IceArrow, sdk.skills.GuidedArrow,
      sdk.skills.PlagueJavelin, sdk.skills.Strafe, sdk.skills.ImmolationArrow,
      sdk.skills.FreezingArrow, sdk.skills.LightningFury, sdk.skills.ChargedBolt,
      sdk.skills.IceBolt, sdk.skills.FireBolt, sdk.skills.Inferno,
      sdk.skills.IceBlast, sdk.skills.FireBall, sdk.skills.Lightning,
      sdk.skills.ChainLightning, sdk.skills.GlacialSpike, sdk.skills.FrozenOrb,
      sdk.skills.Teeth, sdk.skills.BoneSpear, sdk.skills.BoneSpirit,
      sdk.skills.HolyBolt, sdk.skills.FistoftheHeavens, sdk.skills.DoubleThrow,
      sdk.skills.Firestorm, sdk.skills.MoltenBoulder, sdk.skills.ArcticBlast,
      sdk.skills.Twister, sdk.skills.Tornado, sdk.skills.FireBlast
    ],

    /**
     * @param {number} skillId 
     * @returns {SkillDataInfo}
     */
    get: function (skillId = -1) {
      if (!_SkillData.has(skillId)) return null;
      return _SkillData.get(skillId);
    },
    
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

    /**
     * @description Get items with charges
     * @returns {boolean}
     */
    getCharges: function () {
      Skill.charges = [];
      /**
       * @constructor
       * @param {Charge} charge
       * @param {ItemUnit} unit
       */
      function ChargedSkill (charge, unit) {
        this.skill = charge.skill;
        this.level = charge.level;
        this.charges = charge.charges;
        this.maxcharges = charge.maxcharges;
        this.gid = unit.gid;
        this.unit = copyUnit(unit);
      }

      /** @param {ItemUnit} [item] */
      ChargedSkill.prototype.update = function (item) {
        if (!item) {
          item = me.getItem(-1, -1, this.gid);
        }
        if (!item) return;
        let charges = item.getStat(-2)[sdk.stats.ChargedSkill];
        if (!(charges instanceof Array)) charges = [charges];
        let charge = charges.find(c => !!c && c.skill === this.skill);
        if (charge) {
          this.level = charge.level;
          this.charges = charge.charges;
          this.maxcharges = charge.maxcharges;
          this.unit = copyUnit(item);
        }
      };

      let item = me.getItem(-1, sdk.items.mode.Equipped);

      if (item) {
        do {
          let stats = item.getStat(-2);
          if (!stats.hasOwnProperty(sdk.stats.ChargedSkill)) continue;

          /** @type {Array<Charge> | Charge} */
          let charges = stats[sdk.stats.ChargedSkill];
          // simplfy calc by making it an array if it isn't already
          if (!(charges instanceof Array)) charges = [charges];

          for (let charge of charges) {
            // handle wierd case were we get undefined charge
            if (!charge || !charge.skill) continue;
            if (Skill.charges.find(c => c.gid === item.gid && c.skill === charge.skill)) {
              continue;
            }
            Skill.charges.push(new ChargedSkill(charge, item));
          }
        } while (item.getNext());
      }

      return true;
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
      if (me.expansion) {
        // redo cta check
        Precast.checkCTA();
        Skill.getCharges();
      }

      switch (me.classid) {
      case sdk.player.class.Amazon:
        break;
      case sdk.player.class.Sorceress:
        if (Config.UseColdArmor === true) {
          Precast.coldArmor = (function () {
            const _coldSkill = (id) => ({ skillId: id, level: me.getSkill(id, sdk.skills.subindex.SoftPoints) });
            let coldArmor = [
              _coldSkill(sdk.skills.ShiverArmor),
              _coldSkill(sdk.skills.ChillingArmor),
              _coldSkill(sdk.skills.FrozenArmor),
            ].filter(skill => !!skill.level && skill.level > 0).sort((a, b) => b.level - a.level).first();
            return coldArmor !== undefined ? coldArmor.skillId : -1;
          })();
          if (Precast.coldArmor > 0) {
            Precast.skills.get(Precast.coldArmor).duration = this.getDuration(Precast.coldArmor);
          }
        } else if (Precast.skills.has(Config.UseColdArmor)) {
          Precast.skills.get(Config.UseColdArmor).duration = this.getDuration(Config.UseColdArmor);
        }

        break;
      case sdk.player.class.Necromancer:
        {
          let bMax = me.getStat(sdk.stats.SkillBoneArmorMax);
          bMax > 0 && (Precast.skills.get(sdk.skills.BoneArmor).max = bMax);
        }
        if (!!Config.Golem && Config.Golem !== "None") {
          Config.Golem = (function () {
            switch (Config.Golem) {
            case 1:
            case "Clay":
              return sdk.skills.ClayGolem;
            case 2:
            case "Blood":
              return sdk.skills.BloodGolem;
            case 3:
            case "Fire":
              return sdk.skills.FireGolem;
            default:
              return Config.Golem;
            }
          })();
        }
        break;
      case sdk.player.class.Paladin:
        // how to handle if someone manually equips a shield during game play, don't want to build entire item list if we don't need to
        // maybe store gid of shield, would still require doing me.getItem(-1, 1, gid) everytime we wanted to cast but that's still less involved
        // than getting every item we have and finding shield, for now keeping this. Checks during init if we have a shield or not
        let shield = me.usingShield();
        if (shield) {
          Precast.shieldGid = shield.gid;
        }
        Precast.skills.get(sdk.skills.HolyShield).duration = this.getDuration(sdk.skills.HolyShield);

        break;
      case sdk.player.class.Barbarian:
        if (Skill.canUse(sdk.skills.Shout)) {
          Precast.skills.get(sdk.skills.Shout).duration = this.getDuration(sdk.skills.Shout);
        }
        if (Skill.canUse(sdk.skills.BattleOrders)) {
          Precast.skills.get(sdk.skills.BattleOrders).duration = this.getDuration(sdk.skills.BattleOrders);
        }
        if (Skill.canUse(sdk.skills.BattleCommand)) {
          Precast.skills.get(sdk.skills.BattleCommand).duration = this.getDuration(sdk.skills.BattleCommand);
        }
        
        break;
      case sdk.player.class.Druid:
        {
          let cMax = me.getStat(sdk.stats.SkillCycloneArmorMax);
          cMax > 0 && (Precast.skills.get(sdk.skills.CycloneArmor).max = cMax);
        }
        if (!!Config.SummonAnimal && Config.SummonAnimal !== "None") {
          Config.SummonAnimal = (function () {
            switch (Config.SummonAnimal) {
            case 1:
            case "Spirit Wolf":
              return sdk.skills.SummonSpiritWolf;
            case 2:
            case "Dire Wolf":
              return sdk.skills.SummonDireWolf;
            case 3:
            case "Grizzly":
              return sdk.skills.SummonGrizzly;
            default:
              return Config.SummonAnimal;
            }
          })();
        }
        if (!!Config.SummonVine && Config.SummonVine !== "None") {
          Config.SummonVine = (function () {
            switch (Config.SummonVine) {
            case 1:
            case "Poison Creeper":
              return sdk.skills.PoisonCreeper;
            case 2:
            case "Carrion Vine":
              return sdk.skills.CarrionVine;
            case 3:
            case "Solar Creeper":
              return sdk.skills.SolarCreeper;
            default:
              return Config.SummonVine;
            }
          })();
        }
        if (!!Config.SummonSpirit && Config.SummonSpirit !== "None") {
          Config.SummonSpirit = (function () {
            switch (Config.SummonSpirit) {
            case 1:
            case "Oak Sage":
              return sdk.skills.OakSage;
            case 2:
            case "Heart of Wolverine":
              return sdk.skills.HeartofWolverine;
            case 3:
            case "Spirit of Barbs":
              return sdk.skills.SpiritofBarbs;
            default:
              return Config.SummonSpirit;
            }
          })();
        }
        break;
      case sdk.player.class.Assassin:
        if (!!Config.SummonShadow && !!Config.SummonShadow !== "None") {
          Config.SummonShadow = (function () {
            switch (Config.SummonShadow) {
            case 1:
            case "Warrior":
              return sdk.skills.ShadowWarrior;
            case 2:
            case "Master":
              return sdk.skills.ShadowMaster;
            default:
              return Config.SummonShadow;
            }
          })();
        }
        break;
      }
    },

    /**
     * @param {number} skillId 
     * @returns {boolean}
     */
    canUse: function (skillId = -1) {
      if (!_SkillData.has(skillId)) return false;
      if (skillId <= sdk.skills.LeftHandSwing) return true;
      return _SkillData.get(skillId).have();
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getDuration: function (skillId = -1) {
      if (!_SkillData.has(skillId)) return 0;
      return _SkillData.get(skillId).duration();
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getMaxSummonCount: function (skillId) {
      if (!_SkillData.has(skillId)) return 0;
      return _SkillData.get(skillId).summonCount();
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getSummonType: function (skillId) {
      if (!_SkillData.has(skillId)) return 0;
      return _SkillData.get(skillId).summonType;
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getRange: function (skillId) {
      if (!_SkillData.has(skillId)) return 0;
      return _SkillData.get(skillId).range(this.usePvpRange);
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getAoE: function (skillId) {
      if (!_SkillData.has(skillId)) return 0;
      return _SkillData.get(skillId).AoE();
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getHand: function (skillId) {
      if (!_SkillData.has(skillId)) return -1;
      return _SkillData.get(skillId).hand;
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getState: function (skillId) {
      if (!_SkillData.has(skillId)) return 0;
      return _SkillData.get(skillId).state;
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getCharClass: function (skillId) {
      if (!_SkillData.has(skillId)) return -1;
      return _SkillData.get(skillId).charClass;
    },

    /**
     * @param {number} skillId 
     * @returns {number}
     */
    getSkillTab: function (skillId) {
      if (!_SkillData.has(skillId)) return -1;
      return _SkillData.get(skillId).skillTab;
    },

    /**
     * Get mana cost of the skill (mBot)
     * @param {number} skillId 
     * @returns {number}
     */
    getManaCost: function (skillId) {
      if (!_SkillData.has(skillId)) return 0;
      if (skillId < sdk.skills.MagicArrow) return 0;
      return _SkillData.get(skillId).manaCost();
    },

    /**
     * Timed skills
     * @param {number} skillId 
     * @returns {boolean}
     */
    isTimed: function (skillId) {
      if (!_SkillData.has(skillId)) return false;
      return _SkillData.get(skillId).timed;
    },

    /**
     * Skills that cn be cast in town
     * @param {number} skillId 
     * @returns {boolean}
     */
    townSkill: function (skillId = -1) {
      if (!_SkillData.has(skillId)) return false;
      return _SkillData.get(skillId).townSkill;
    },

    /**
     * @param {number} skillId 
     * @returns {boolean}
     */
    missileSkill: function (skillId = -1) {
      if (!_SkillData.has(skillId)) return false;
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
        sdk.skills.Attack, sdk.skills.Kick,
        sdk.skills.Raven, sdk.skills.Werewolf,
        sdk.skills.Werebear, sdk.skills.PoisonCreeper,
        sdk.skills.OakSage, sdk.skills.SpiritWolf,
        sdk.skills.CarrionVine, sdk.skills.HeartofWolverine,
        sdk.skills.SummonDireWolf, sdk.skills.FireClaws,
        sdk.skills.SolarCreeper, sdk.skills.Hunger,
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
      const checkHand = (hand === sdk.skills.hand.Right
        ? sdk.skills.get.RightId
        : sdk.skills.get.LeftId);
      // Check if the skill is already set
      if (me.getSkill(checkHand) === skillId) {
        return true;
      }
      if (!item && !Skill.canUse(skillId)) return false;

      // Charged skills must be cast from right hand
      if (hand === undefined || hand === sdk.skills.hand.RightShift || item) {
        if (item && hand !== sdk.skills.hand.Right) {
          console.warn("[ÿc9Warningÿc0] charged skills must be cast from right hand");
        }
        hand = sdk.skills.hand.Right;
      }

      return (me.setSkill(skillId, hand, item));
    },

    // Change into werewolf or werebear
    shapeShift: function (mode) {
      const [skill, state] = (() => {
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
      const _stateCheck = function () {
        return me.getState(state);
      };

      const slot = Attack.getPrimarySlot();
      me.switchWeapons(Precast.getBetterSlot(skill));

      try {
        for (let i = 0; i < 3; i += 1) {
          Skill.cast(skill, sdk.skills.hand.Right);
          
          if (Misc.poll(_stateCheck, 2000, 50)) {
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
      const [state, skill] = me.getState(sdk.states.Wearwolf)
        ? [sdk.states.Wearwolf, sdk.skills.Werewolf]
        : me.getState(sdk.states.Wearbear)
          ? [sdk.states.Wearbear, sdk.skills.Werebear]
          : [0, 0];
      if (!state) return true;
      const _stateCheck = function () {
        return !me.getState(state);
      };
      for (let i = 0; i < 3; i++) {
        Skill.cast(skill);

        if (Misc.poll(_stateCheck, 2000, 50)) {
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
          || (String.isEqual(unit.name, "portal")
          && !me.inTown && unit.classid !== sdk.objects.ArcaneSanctuaryPortal)
          || [
            sdk.objects.RedPortalToAct4, sdk.objects.WorldstonePortal,
            sdk.objects.RedPortal, sdk.objects.RedPortalToAct5
          ].includes(unit.classid)) {
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

      hand === undefined && (hand = this.getHand(skillId));
      x === undefined && (x = me.x);
      y === undefined && (y = me.y);

      // Check mana cost, charged skills don't use mana
      if (!item && this.getManaCost(skillId) > me.mp) {
        // Maybe delay on ALL skills that we don't have enough mana for?
        if (Config.AttackSkill
          .concat([sdk.skills.StaticField, sdk.skills.Teleport])
          .concat(Config.LowManaSkill).includes(skillId)) {
          delay(300);
        }

        return false;
      }

      if (skillId === sdk.skills.Teleport) {
        if (typeof x === "number") {
          const orgDist = [x, y].distance;
          if (Packet.teleport(x, y)) {
            return Misc.poll(function () {
              return [x, y].distance < orgDist;
            }, 300, 25);
          }
        }
      }

      if (!this.setSkill(skillId, hand, item)) return false;

      if (Config.PacketCasting > 1) {
        if (typeof x === "number") {
          Packet.castSkill(hand, x, y);
        } else if (typeof x === "object") {
          Packet.unitCast(hand, x);
        }
        delay(250);
      } else {
        let [clickType, shift] = (function () {
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
          typeof x === "object"
            ? clickMap(clickType, shift, x)
            : clickMap(clickType, shift, x, y);
          delay(20);
          typeof x === "object"
            ? clickMap(clickType + 2, shift, x)
            : clickMap(clickType + 2, shift, x, y);

          if (Misc.poll(function () {
            return me.attacking;
          }, 200, 20)) {
            break;
          }
        }

        while (me.attacking) {
          delay(10);
        }
      }

      // account for lag, state 121 doesn't kick in immediately
      if (this.isTimed(skillId)) {
        Misc.poll(function () {
          return (
            me.skillDelay
            || me.mode === sdk.player.mode.GettingHit
            || me.mode === sdk.player.mode.Blocking
          );
        }, 100, 10);
      }

      return true;
    },

    /**
     * Basic use of charged skill casting
     * @param {number} skillId 
     * @param {Unit | { x: number, y: number }} unit 
     * @returns {boolean}
     */
    castCharges: function (skillId, unit) {
      if (!Skill.charges.length) return false;
      const charge = Skill.charges
        .filter(function (c) {
          return c.skill === skillId && c.charges > 0;
        })
        .sort(function (a, b) {
          return b.level - a.level;
        }).find(function (charge) {
          return me.getItem(-1, sdk.items.mode.Equipped, charge.gid);
        });
      if (!charge) return false;
      const item = me.getItem(-1, sdk.items.mode.Equipped, charge.gid);
      if (!item) return false;
      if (!unit) unit = me;
      const weaponSwitch = me.weaponswitch;
      if ([sdk.body.RightArmSecondary, sdk.body.RightArmSecondary].includes(item.bodylocation)) {
        me.switchWeapons(weaponSwitch ^ 1);
      }
      try {
        return item.castChargedSkill(skillId, unit.x, unit.y);
      } catch (e) {
        console.error(e);
        // maybe rebuild list?
        // Skill.getCharges();
        return false;
      } finally {
        if (weaponSwitch !== me.weaponswitch) {
          me.switchWeapons(weaponSwitch);
        }
        if (item) {
          charge.update(item);
        }
      }
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
