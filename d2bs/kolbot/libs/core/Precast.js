/**
*  @filename    Precast.js
*  @author      noah-, kolton, theBGuy
*  @desc        handle player prebuff sequence
*
*/

const Precast = (function () {
  includeIfNotIncluded("core/Skill.js");
  /**
   * @constructor
   * @param {number} skillId 
   */
  function PrecastSkill (skillId) {
    this.skillId = skillId;
    this.state = Skill.getState(skillId);
    this.lastCast = 0;
    this.duration = 0;
  }
  PrecastSkill.prototype.canUse = function () {
    return Skill.canUse(this.skillId);
  };
  PrecastSkill.prototype.remaining = function () {
    if (!this.duration) {
      this.duration = Skill.getDuration(this.skillId);
    }
    const pRemaining = 100 * (1 - (getTickCount() - this.lastCast) / this.duration);
    return Math.max(0, Math.min(100, pRemaining));
  };
  PrecastSkill.prototype.needSoon = function (percent = 25) {
    return this.remaining() < percent;
  };
  PrecastSkill.prototype.needToCast = function (force = false, percent = 25) {
    if (!this.canUse()) return false;
    return force || !me.getState(this.state) || this.needSoon(percent);
  };
  PrecastSkill.prototype.update = function () {
    this.lastCast = getTickCount();
  };

  /**
   * @constructor
   * @augments PrecastSkill
   * @param {number} skillId 
   */
  function PrecastArmorSkill (skillId) {
    PrecastSkill.call(this, skillId);
    this.max = 0;
  }
  PrecastArmorSkill.prototype = Object.create(PrecastSkill.prototype);
  PrecastArmorSkill.prototype.constructor = PrecastArmorSkill;

  PrecastArmorSkill.prototype.remaining = function () {
    return this.max > 0
      ? Math.round(me.getStat(sdk.stats.SkillBoneArmor) * 100 / this.max)
      : 0;
  };
  PrecastArmorSkill.prototype.update = function () {
    this.lastCast = getTickCount();
    this.max = me.getStat(sdk.stats.SkillBoneArmorMax);
  };
  return {
    enabled: true,
    /** @type {number} */
    coldArmor: null,
    shieldGid: 0,
    haveCTA: -1,
    bestSlot: {},

    // TODO: build better method of keeping track of duration based skills so we can reduce resource usage
    // build obj -> figure out which skills we have -> calc duration -> assign tick of last casted -> track tick (background worker maybe?)
    // would reduce checking have skill and state calls, just let tick = getTickCount(); -> obj.some((el) => tick - el.lastTick > el.duration) -> true then cast
    // would probably make sense to just re-cast everything (except summons) if one of our skills is about to run out rather than do this process again 3 seconds later
    skills: new Map([
      [sdk.skills.FrozenArmor, new PrecastSkill(sdk.skills.FrozenArmor)],
      [sdk.skills.ShiverArmor, new PrecastSkill(sdk.skills.ShiverArmor)],
      [sdk.skills.ChillingArmor, new PrecastSkill(sdk.skills.ChillingArmor)],
      [sdk.skills.Enchant, new PrecastSkill(sdk.skills.Enchant)],
      [sdk.skills.ThunderStorm, new PrecastSkill(sdk.skills.ThunderStorm)],
      [sdk.skills.EnergyShield, new PrecastSkill(sdk.skills.EnergyShield)],
      [sdk.skills.HolyShield, new PrecastSkill(sdk.skills.HolyShield)],
      [sdk.skills.Shout, new PrecastSkill(sdk.skills.Shout)],
      [sdk.skills.BattleOrders, new PrecastSkill(sdk.skills.BattleOrders)],
      [sdk.skills.BattleCommand, new PrecastSkill(sdk.skills.BattleCommand)],
      [sdk.skills.Hurricane, new PrecastSkill(sdk.skills.Hurricane)],
      [sdk.skills.Armageddon, new PrecastSkill(sdk.skills.Armageddon)],
      [sdk.skills.Fade, new PrecastSkill(sdk.skills.Fade)],
      [sdk.skills.BurstofSpeed, new PrecastSkill(sdk.skills.BurstofSpeed)],
      [sdk.skills.BladeShield, new PrecastSkill(sdk.skills.BladeShield)],
      [sdk.skills.Venom, new PrecastSkill(sdk.skills.Venom)],
      [sdk.skills.BoneArmor, new PrecastArmorSkill(sdk.skills.BoneArmor)],
      [sdk.skills.CycloneArmor, new PrecastArmorSkill(sdk.skills.CycloneArmor)],
    ]),
    nonPacketSkills: new Set([
      sdk.skills.Valkyrie, sdk.skills.Decoy, sdk.skills.RaiseSkeleton,
      sdk.skills.ClayGolem, sdk.skills.RaiseSkeletalMage, sdk.skills.BloodGolem,
      sdk.skills.Shout, sdk.skills.IronGolem, sdk.skills.Revive,
      sdk.skills.Werewolf, sdk.skills.Werebear, sdk.skills.OakSage,
      sdk.skills.SpiritWolf, sdk.skills.PoisonCreeper, sdk.skills.BattleOrders,
      sdk.skills.SummonDireWolf, sdk.skills.Grizzly, sdk.skills.HeartofWolverine,
      sdk.skills.SpiritofBarbs, sdk.skills.ShadowMaster,
      sdk.skills.ShadowWarrior, sdk.skills.BattleCommand,
    ]),

    checkCTA: function () {
      if (this.haveCTA > -1) return true;

      let check = me.checkItem({ name: sdk.locale.items.CalltoArms, equipped: true });

      if (check.have) {
        Precast.haveCTA = check.item.isOnSwap ? 1 : 0;
      }

      return this.haveCTA > -1;
    },

    /**
    * @param {boolean} force 
    * @returns {boolean}
    */
    precastCTA: function (force = false) {
      if (!Config.UseCta || this.haveCTA === -1 || me.classic || me.barbarian || me.inTown || me.shapeshifted) {
        return false;
      }
      if (!force && me.getState(sdk.states.BattleOrders)) return true;

      if (this.haveCTA > -1) {
        const slot = me.weaponswitch;
        const { x, y } = me;

        me.switchWeapons(this.haveCTA);
        this.cast(sdk.skills.BattleCommand, x, y, false);
        this.cast(sdk.skills.BattleCommand, x, y, false);
        this.cast(sdk.skills.BattleOrders, x, y, false);

        // does this need to be re-calculated everytime? if no autobuild should really just be done when we initialize
        if (!Precast.skills.get(sdk.skills.BattleOrders).duration) {
          this.skills.get(sdk.skills.BattleOrders).duration = Skill.getDuration(sdk.skills.BattleOrders);
        }

        me.switchWeapons(slot);

        return true;
      }

      return false;
    },

    /**
    * Check which slot (primary or secondary) gives us the most skillpoints in a skill
    * @param {number} skillId 
    * @returns {0 | 1} best slot to give us the most skillpoints in a skill
    * @todo Move this to be part of the SkillData class
    */
    getBetterSlot: function (skillId) {
      if (this.bestSlot[skillId] !== undefined) return this.bestSlot[skillId];

      const [classid, skillTab] = [
        Skill.getCharClass(skillId), Skill.getSkillTab(skillId)
      ];

      if (classid < 0 || classid === 255) return me.weaponswitch;

      me.weaponswitch !== 0 && me.switchWeapons(0);

      let [sumCurr, sumSwap] = [0, 0];
      const sumStats = function (item) {
        return (item.getStat(sdk.stats.AllSkills)
          + item.getStat(sdk.stats.AddClassSkills, classid) + item.getStat(sdk.stats.AddSkillTab, skillTab)
          + item.getStat(sdk.stats.SingleSkill, skillId) + item.getStat(sdk.stats.NonClassSkill, skillId));
      };

      me.getItemsEx()
        .filter(item => item.isEquipped && [
          sdk.body.RightArm, sdk.body.LeftArm, sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary
        ].includes(item.bodylocation))
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
    },

    cast: function (skillId, x = me.x, y = me.y, allowSwitch = true) {
      if (!skillId || !Skill.wereFormCheck(skillId) || (me.inTown && !Skill.townSkill(skillId))) {
        return false;
      }
      if (Skill.getManaCost(skillId) > me.mp) return false;

      const swap = me.weaponswitch;
      // don't use packet casting with summons - or boing
      const usePacket = !Precast.nonPacketSkills.has(skillId);
      const state = Precast.skills.has(skillId)
        ? Precast.skills.get(skillId).state
        : 0;
      (typeof x !== "number" || typeof y !== "number") && ({ x, y } = me);

      try {
        allowSwitch && me.switchWeapons(this.getBetterSlot(skillId));
        if (me.getSkill(sdk.skills.get.RightId) !== skillId
          && !me.setSkill(skillId, sdk.skills.hand.Right)) {
          throw new Error(
            "Failed to set " + getSkillById(skillId) + " on hand."
            + "Current: " + getSkillById(me.getSkill(sdk.skills.get.RightId)));
        }

        if (Config.PacketCasting > 1 || usePacket) {
          Config.DebugMode.Skill && console.debug("Packet casting: " + skillId);
          
          if (typeof x === "number") {
            Packet.castSkill(sdk.skills.hand.Right, x, y);
          } else if (typeof x === "object") {
            Packet.unitCast(sdk.skills.hand.Right, x);
          }
          delay(250);
        } else {
          // Right hand + No Shift
          const clickType = sdk.clicktypes.click.map.RightDown;
          const shift = sdk.clicktypes.shift.NoShift;

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
        if (Skill.isTimed(skillId)) {
          Misc.poll(function () {
            return (
              me.skillDelay
              || me.mode === sdk.player.mode.GettingHit
              || me.mode === sdk.player.mode.Blocking
            );
          }, 100, 10);
        }
        if (Precast.skills.has(skillId)) {
          Precast.skills.get(skillId).update();
        }
        return state ? me.getState(state) : true;
      } catch (e) {
        console.error(e);

        return false;
      } finally {
        allowSwitch && me.switchWeapons(swap);
      }
    },

    summon: function (skillId, minionType) {
      if (!Skill.canUse(skillId)) return false;

      let rv, retry = 0;
      let count = Skill.getMaxSummonCount(skillId);

      while (me.getMinionCount(minionType) < count) {
        rv = true;

        if (retry > count * 2) {
          if (me.inTown) {
            Town.heal() && me.cancelUIFlags();
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

        // todo - only delay if we are close to the mana amount we need based on our mana regen rate or potion state
        // also take into account surrounding mobs so we don't delay for mana in the middle of a mob pack
        if (Skill.getManaCost(skillId) > me.mp) {
          if (!Misc.poll(() => me.mp >= Skill.getManaCost(skillId), 500, 100)) {
            retry++;
            continue;
          }
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
    },

    enchant: (function () {
      let chantDuration = 0;

      /** @constructor */
      function ChantTracker () {
        this.lastChant = getTickCount();
      }

      ChantTracker.prototype.reChant = function () {
        return getTickCount() - this.lastChant >= chantDuration - Time.seconds(10);
      };

      ChantTracker.prototype.update = function () {
        this.lastChant = getTickCount();
      };

      /** @type {Map<string, ChantTracker} */
      const chantList = new Map();

      return function () {
        chantDuration = Skill.getDuration(sdk.skills.Enchant);
        const slot = me.weaponswitch;
        const chanted = [];

        me.switchWeapons(Precast.getBetterSlot(sdk.skills.Enchant));

        // Player
        let unit = Game.getPlayer();

        if (unit) {
          do {
            if (unit.dead) continue;
            if (!Misc.inMyParty(unit.name) || unit.distance > 40) continue;
            if (!unit.getState(sdk.states.Enchant)
              || (chantList.has(unit.name) && chantList.get(unit.name).reChant())) {
              Skill.cast(sdk.skills.Enchant, sdk.skills.hand.Right, unit);
              if (Misc.poll(() => unit.getState(sdk.states.Enchant), 500, 100)) {
                chanted.push(unit.name);
                chantList.has(unit.name)
                  ? chantList.get(unit.name).update()
                  : chantList.set(unit.name, new ChantTracker());
              }
            }
          } while (unit.getNext());
        }

        // Minion
        unit = Game.getMonster();

        if (unit) {
          do {
            if (unit.getParent()
              && chanted.includes(unit.getParent().name)
              && unit.distance <= 40
              && !unit.getState(sdk.states.Enchant)) {
              Skill.cast(sdk.skills.Enchant, sdk.skills.hand.Right, unit);
            }
          } while (unit.getNext());
        }

        me.switchWeapons(slot);

        return true;
      };
    })(),

    // should the config check still be included even though its part of Skill.init?
    /**
    * @description Handle precast related skills
    * @param {boolean} force - force re-cast of all precast skills
    * @param {boolean} partial - force re-cast of all state related precast skills
    * @returns {boolean} sucessfully casted
    * @todo durations
    */
    doPrecast: function (force = false, partial = false) {
      if (!this.enabled) return false;

      while (!me.gameReady) {
        delay(40);
      }

      let [buffSummons, forceBo] = [false, false];

      // Force BO 30 seconds before it expires
      if (Precast.haveCTA > -1) {
        forceBo = (force || partial
          || Precast.skills.get(sdk.skills.BattleOrders).remaining() < 25
          || !me.getState(sdk.states.BattleCommand));
        forceBo && this.precastCTA(forceBo);
      }

      switch (me.classid) {
      case sdk.player.class.Amazon:
        if (Skill.canUse(sdk.skills.Valkyrie)) {
          buffSummons = Precast.summon(sdk.skills.Valkyrie, sdk.summons.type.Valkyrie);
        }
        break;
      case sdk.player.class.Sorceress:
        if (Precast.skills.get(sdk.skills.ThunderStorm).needToCast(force || partial)) {
          this.cast(sdk.skills.ThunderStorm);
        }

        if (Precast.skills.get(sdk.skills.EnergyShield).needToCast(force || partial)) {
          this.cast(sdk.skills.EnergyShield);
        }

        if (Config.UseColdArmor) {
          let choosenSkill = (typeof Config.UseColdArmor === "number" && Skill.canUse(Config.UseColdArmor)
            ? Config.UseColdArmor
            : (Precast.coldArmor || -1));
          
          if (choosenSkill && Precast.skills.has(choosenSkill)) {
            if (Precast.skills.get(choosenSkill).needToCast(force || partial)) {
              Precast.cast(choosenSkill);
            }
          }
        }

        if (Precast.skills.get(sdk.skills.Enchant).needToCast(force || partial)) {
          this.enchant();
        }

        break;
      case sdk.player.class.Necromancer:
        if (Precast.skills.get(sdk.skills.BoneArmor).needToCast(force, 75)) {
          this.cast(sdk.skills.BoneArmor);
          if (Precast.skills.get(sdk.skills.BoneArmor).max === 0) {
            Precast.skills.get(sdk.skills.BoneArmor).max = me.getStat(sdk.stats.SkillBoneArmorMax);
          }
        }

        if (!!Config.Golem && Config.Golem !== "None") {
          Precast.summon(Config.Golem, sdk.summons.type.Golem);
        }

        Config.ActiveSummon && ClassAttack.raiseArmy();

        break;
      case sdk.player.class.Paladin:
        if (Precast.skills.get(sdk.skills.HolyShield).needToCast(force || partial, 15)) {
          let _wearingShield = me.getItem(-1, sdk.items.mode.Equipped, Precast.shieldGid);
          if (!_wearingShield) {
            // try once to locate, in case we just swapped
            _wearingShield = me.usingShield();
            Precast.shieldGid = _wearingShield ? _wearingShield.gid : 0;
            if (!_wearingShield) {
              break;
            }
          }
          if (Precast.shieldGid > 0) {
            Precast.cast(sdk.skills.HolyShield);
          }
        }

        break;
      case sdk.player.class.Barbarian: // - TODO: durations
        if (!Config.UseWarcries) {
          break;
        }
        let needShout = (Precast.skills.get(sdk.skills.Shout).needToCast(force || partial));
        let needBo = (Precast.skills.get(sdk.skills.BattleOrders).needToCast(force || partial));
        let needBc = (Precast.skills.get(sdk.skills.BattleCommand).needToCast(force || partial));

        if (needShout || needBo || needBc) {
          let primary = Attack.getPrimarySlot();
          let { x, y } = me;
          (needBo || needBc) && me.switchWeapons(this.getBetterSlot(sdk.skills.BattleOrders));

          needBc && this.cast(sdk.skills.BattleCommand, x, y, false);
          needBo && this.cast(sdk.skills.BattleOrders, x, y, false);
          needShout && this.cast(sdk.skills.Shout, x, y, false);

          me.weaponswitch !== primary && me.switchWeapons(primary);
        }

        break;
      case sdk.player.class.Druid:
        if (Precast.skills.get(sdk.skills.CycloneArmor).needToCast(force || partial)) {
          this.cast(sdk.skills.CycloneArmor);
        }

        Skill.canUse(sdk.skills.Raven) && Precast.summon(sdk.skills.Raven, sdk.summons.type.Raven);

        if (!!Config.SummonAnimal && Config.SummonAnimal !== "None") {
          buffSummons = Precast.summon(Config.SummonAnimal, Skill.getSummonType(Config.SummonAnimal));
        }

        if (!!Config.SummonVine && Config.SummonVine !== "None") {
          buffSummons = Precast.summon(Config.SummonVine, sdk.summons.type.Vine);
        }

        if (!!Config.SummonSpirit && Config.SummonSpirit !== "None") {
          buffSummons = (
            Config.SummonSpirit === sdk.skills.OakSage
            && me.hardcore
            && !me.getState(sdk.states.BattleOrders)
            && me.inTown
          )
            ? buffSummons
            : Precast.summon(Config.SummonSpirit, sdk.summons.type.Spirit);
        }

        if (Precast.skills.get(sdk.skills.Hurricane).needToCast(force || partial)) {
          this.cast(sdk.skills.Hurricane);
        }

        break;
      case sdk.player.class.Assassin:
        if (Precast.skills.get(sdk.skills.Fade).needToCast(force || partial)) {
          this.cast(sdk.skills.Fade);
        }

        if (Precast.skills.get(sdk.skills.Venom).needToCast(force || partial)) {
          this.cast(sdk.skills.Venom);
        }

        if (Precast.skills.get(sdk.skills.BladeShield).needToCast(force || partial)) {
          this.cast(sdk.skills.BladeShield);
        }

        if (!Config.UseFade && Precast.skills.get(sdk.skills.BurstofSpeed).needToCast(force || partial)) {
          this.cast(sdk.skills.BurstofSpeed);
        }

        if (!!Config.SummonShadow && !!Config.SummonShadow !== "None") {
          buffSummons = Precast.summon(Config.SummonShadow, sdk.summons.type.Shadow);
        }

        break;
      }

      buffSummons && this.haveCTA > -1 && this.precastCTA(force);
      me.switchWeapons(Attack.getPrimarySlot());

      return true;
    },

    needOutOfTownCast: function () {
      return Skill.canUse(sdk.skills.Shout) || Skill.canUse(sdk.skills.BattleOrders) || Precast.checkCTA();
    },

    doRandomPrecast: function (force = false, goToWhenDone = undefined) {
      const returnTo = (goToWhenDone && typeof goToWhenDone === "number"
        ? goToWhenDone
        : me.area);
      
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
    },
  };
})();
