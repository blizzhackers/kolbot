/**
*  @filename    Wereform.js
*  @author      kolton, theBGuy
*  @desc        Wereform attack sequence
*
*/

// todo - handle a Bear necro summonmancer

const ClassAttack = (function () {
  const baseLL = me.getStat(sdk.stats.LifeLeech);
  const baseED = me.getStat(sdk.stats.DamagePercent);
  const feralBoost = () => (
    ((Math.floor(me.getSkill(sdk.skills.FeralRage, sdk.skills.subindex.SoftPoints) / 2) + 3) * 4) + baseLL
  );
  const maulBoost = () => (
    ((Math.floor(me.getSkill(sdk.skills.Maul, sdk.skills.subindex.SoftPoints) / 2) + 3) * 20) + baseED
  );

  const wereform = {
    rage: 0,
    maul: 0,
    duration: 0, // todo - handle duration, if we are about to lose our form, recast it before attacking
  };
  
  return {
    feralBoost: 0,
    maulBoost: 0,

    doAttack: function (unit, preattack) {
      if (!unit) return Attack.Result.SUCCESS;
      let gid = unit.gid;

      if (Config.MercWatch && me.needMerc()) {
        console.debug("mercwatch");

        if (Town.visitTown()) {
          if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
            return Attack.Result.SUCCESS; // lost reference to the mob we were attacking
          }
        }
      }

      if (!wereform.rage && Config.AttackSkill.includes(sdk.skills.FeralRage)) {
        // amount of life leech with max rage
        wereform.rage = feralBoost();
      }

      if (!wereform.maul && Config.AttackSkill.includes(sdk.skills.Maul)) {
        // amount of enhanced damage with max maul
        wereform.maul = maulBoost();
      }

      Skill.shapeShift(Config.Wereform);

      if (((Config.AttackSkill[0] === sdk.skills.FeralRage
        && (!me.getState(sdk.states.FeralRage) || me.getStat(sdk.stats.LifeLeech) < wereform.rage))
        || (Config.AttackSkill[0] === sdk.skills.Maul
        && (!me.getState(sdk.states.Maul) || me.getStat(sdk.stats.DamagePercent) < wereform.maul))
        || (Config.AttackSkill[0] === sdk.skills.ShockWave && !unit.isSpecial && !unit.getState(sdk.states.Stunned))
        || (preattack && Config.AttackSkill[0] > 0))
        && Attack.checkResist(unit, Config.AttackSkill[0])
        && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))
        && (Skill.wereFormCheck(Config.AttackSkill[0]) || !me.shapeshifted)) {
        if (unit.distance > Skill.getRange(Config.AttackSkill[0])
          || checkCollision(me, unit, sdk.collision.WallOrRanged)) {
          if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.WallOrRanged, true)) {
            return Attack.Result.FAILED;
          }
        }

        Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

        return Attack.Result.SUCCESS;
      }

      // Rebuff Armageddon
      if (Skill.canUse(sdk.skills.Armageddon) && !me.getState(sdk.states.Armageddon)) {
        Skill.cast(sdk.skills.Armageddon, sdk.skills.hand.Right);
      }

      let timedSkill = -1;
      let untimedSkill = -1;
      let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

      // Get timed skill
      let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

      if (Attack.checkResist(unit, checkSkill) && Skill.wereFormCheck(checkSkill) && Attack.validSpot(unit.x, unit.y)) {
        timedSkill = checkSkill;
      } else if (Config.AttackSkill[5] > -1
        && Attack.checkResist(unit, Config.AttackSkill[5])
        && Attack.validSpot(unit.x, unit.y)) {
        timedSkill = Config.AttackSkill[5];
      }

      // Get untimed skill
      checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

      if (Attack.checkResist(unit, checkSkill) && Skill.wereFormCheck(checkSkill) && Attack.validSpot(unit.x, unit.y)) {
        untimedSkill = checkSkill;
      } else if (Config.AttackSkill[6] > -1
        && Attack.checkResist(unit, Config.AttackSkill[6])
        && Attack.validSpot(unit.x, unit.y)) {
        untimedSkill = Config.AttackSkill[6];
      }

      // eval skills
      switch (true) {
      case timedSkill === sdk.skills.Fury && untimedSkill === sdk.skills.FeralRage:
        if (!me.getState(sdk.states.FeralRage) || me.getStat(sdk.stats.LifeLeech) < wereform.rage) {
          timedSkill = sdk.skills.FeralRage;
        }

        break;
      case timedSkill === sdk.skills.Fury && untimedSkill === sdk.skills.Rabies:
      case timedSkill === sdk.skills.FireClaws && untimedSkill === sdk.skills.Rabies:
        if (!unit.getState(sdk.states.Rabies)) {
          timedSkill = sdk.skills.Rabies;
        }

        break;
      case timedSkill === sdk.skills.ShockWave && untimedSkill === sdk.skills.Maul:
      case timedSkill === sdk.skills.Maul && untimedSkill === sdk.skills.ShockWave:
      case timedSkill === sdk.skills.Maul && untimedSkill === sdk.skills.FireClaws:
        if (!me.getState(sdk.states.Maul)) {
          timedSkill = sdk.skills.Maul;
        }

        break;
      }

      // Low mana timed skill
      if (Config.LowManaSkill[0] > -1
        && Skill.getManaCost(timedSkill) > me.mp
        && Attack.checkResist(unit, Config.LowManaSkill[0])) {
        timedSkill = Config.LowManaSkill[0];
      }

      // Low mana untimed skill
      if (Config.LowManaSkill[1] > -1
        && Skill.getManaCost(untimedSkill) > me.mp
        && Attack.checkResist(unit, Config.LowManaSkill[1])) {
        untimedSkill = Config.LowManaSkill[1];
      }

      // use our secondary skill if we can't use our primary
      let choosenSkill = (Skill.isTimed(timedSkill) && me.skillDelay && untimedSkill > -1 ? untimedSkill : timedSkill);

      return this.doCast(unit, choosenSkill);
    },

    afterAttack: function () {
      Precast.doPrecast(false);
    },

    // Returns: 0 - fail, 1 - success, 2 - no valid attack skills
    doCast: function (unit, skill) {
      // unit reference no longer valid or it died
      if (!unit || unit.dead) return Attack.Result.SUCCESS;
      // No valid skills can be found
      if (skill < 0) return Attack.Result.CANTATTACK;

      if (Skill.getRange(skill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
        return Attack.Result.FAILED;
      }

      if (unit.distance > Skill.getRange(skill) || checkCollision(me, unit, sdk.collision.WallOrRanged)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(skill), sdk.collision.WallOrRanged, true)) {
          return Attack.Result.FAILED;
        }
      }

      unit.attackable && Skill.cast(skill, Skill.getHand(skill), unit);

      Misc.poll(() => !me.skillDelay, 1000, 40);

      return Attack.Result.SUCCESS;
    }
  };
})();
