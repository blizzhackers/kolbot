/**
*  @filename    Sorceress.js
*  @author      kolton, theBGuy
*  @desc        Sorceress attack sequence
*
*/

const ClassAttack = {
  decideSkill: function (unit) {
    let skills = { timed: -1, untimed: -1 };
    if (!unit || !unit.attackable) return skills;

    let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
    let classid = unit.classid;

    // Get timed skill
    let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

    if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill, classid)) {
      skills.timed = checkSkill;
    } else if (Config.AttackSkill[5] > -1
      && Attack.checkResist(unit, Config.AttackSkill[5])
      && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5], classid)) {
      skills.timed = Config.AttackSkill[5];
    }

    // Get untimed skill
    checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

    if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill, classid)) {
      skills.untimed = checkSkill;
    } else if (Config.AttackSkill[6] > -1
      && Attack.checkResist(unit, Config.AttackSkill[6])
      && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6], classid)) {
      skills.untimed = Config.AttackSkill[6];
    }

    // Low mana timed skill
    if (Config.LowManaSkill[0] > -1
      && Skill.getManaCost(skills.timed) > me.mp
      && Attack.checkResist(unit, Config.LowManaSkill[0])) {
      skills.timed = Config.LowManaSkill[0];
    }

    // Low mana untimed skill
    if (Config.LowManaSkill[1] > -1
      && Skill.getManaCost(skills.untimed) > me.mp
      && Attack.checkResist(unit, Config.LowManaSkill[1])) {
      skills.untimed = Config.LowManaSkill[1];
    }

    return skills;
  },

  /**
   * @param {Monster} unit 
   * @param {boolean} preattack 
   * @returns {AttackResult}
   */
  doAttack: function (unit, preattack = false) {
    if (!unit) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    let gid = unit.gid;

    if (Config.MercWatch && me.needMerc()) {
      if (Town.visitTown()) {
        console.log("mercwatch");
        
        if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
          console.debug("Lost reference to unit");
          return Attack.Result.SUCCESS;
        }
      }
    }

    // Keep Energy Shield active
    if (Skill.canUse(sdk.skills.EnergyShield) && !me.getState(sdk.states.EnergyShield)) {
      Skill.cast(sdk.skills.EnergyShield, sdk.skills.hand.Right);
    }

    // Keep Thunder-Storm active
    if (Skill.canUse(sdk.skills.ThunderStorm) && !me.getState(sdk.states.ThunderStorm)) {
      Skill.cast(sdk.skills.ThunderStorm, sdk.skills.hand.Right);
    }

    if (Config.ChargeCast.skill > -1) {
      let cRange = Skill.getRange(Config.ChargeCast.skill);
      let cState = Skill.getState(Config.ChargeCast.skill);
      if ((!Config.ChargeCast.spectype || (unit.spectype & Config.ChargeCast.spectype))
        && (!cState || !unit.getState(cState))
        && (unit.distance < cRange || !checkCollision(me, unit, sdk.collision.LineOfSight))) {
        Skill.castCharges(Config.ChargeCast.skill, unit);
      }
    }

    if (preattack && Config.AttackSkill[0] > 0
      && Attack.checkResist(unit, Config.AttackSkill[0])
      && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
      if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, sdk.collision.Ranged)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.Ranged)) {
          return Attack.Result.FAILED;
        }
      }

      Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

      return Attack.Result.SUCCESS;
    }

    let useStatic = (Config.StaticList.length > 0
      && Config.CastStatic < 100
      && Skill.canUse(sdk.skills.StaticField)
      && Attack.checkResist(unit, "lightning"));
    let idCheck = function (id) {
      if (unit) {
        switch (true) {
        case typeof id === "number" && unit.classid && unit.classid === id:
        case typeof id === "string" && unit.name && unit.name.toLowerCase() === id.toLowerCase():
        case typeof id === "function" && id(unit):
          return true;
        default:
          return false;
        }
      }

      return false;
    };
 
    // Static - needs to be re-done
    if (useStatic && Config.StaticList.some(id => idCheck(id)) && unit.hpPercent > Config.CastStatic) {
      let staticRange = Skill.getRange(sdk.skills.StaticField);
      let casts = 0;

      while (!me.dead && unit.hpPercent > Config.CastStatic && unit.attackable) {
        if (unit.distance > staticRange || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, staticRange, sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        // if we fail to cast or we've casted 3 or more times - do something else
        if (!Skill.cast(sdk.skills.StaticField, sdk.skills.hand.Right) || casts >= 3) {
          break;
        } else {
          casts++;
        }
      }

      // re-check mob after static
      if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
        console.debug("Lost reference to unit");
        return Attack.Result.SUCCESS;
      }
    }

    let skills = this.decideSkill(unit);
    let result = this.doCast(unit, skills.timed, skills.untimed);

    if (result === Attack.Result.CANTATTACK && Attack.canTeleStomp(unit)) {
      let merc = me.getMerc();
      let mercRevive = 0;

      while (unit.attackable) {
        if (!unit || !copyUnit(unit).x) {
          unit = Misc.poll(() => Game.getMonster(-1, -1, gid), 1000, 80);
        }
        if (!unit) return Attack.Result.SUCCESS;

        if (me.needMerc()) {
          if (Config.MercWatch && mercRevive++ < 1) {
            Town.visitTown();
          } else {
            return Attack.Result.CANTATTACK;
          }

          (merc === undefined || !merc) && (merc = me.getMerc());
        }

        if (!!merc && getDistance(merc, unit) > 7) {
          Pather.moveToUnit(unit);

          let spot = Attack.findSafeSpot(unit, 10, 5, 9);
          !!spot && !!spot.x && Pather.walkTo(spot.x, spot.y);
        }

        let closeMob = Attack.getNearestMonster({ skipGid: gid });
        
        if (!!closeMob) {
          let findSkill = this.decideSkill(closeMob);
          if (this.doCast(closeMob, findSkill.timed, findSkill.untimed) !== Attack.Result.SUCCESS) {
            (Skill.haveTK && Packet.telekinesis(unit));
          }
        }
      }

      return Attack.Result.SUCCESS;
    }

    return result;
  },

  afterAttack: function () {
    Precast.doPrecast(false);
  },

  // Returns: 0 - fail, 1 - success, 2 - no valid attack skills
  doCast: function (unit, timedSkill = -1, untimedSkill = -1) {
    // No valid skills can be found
    if (timedSkill < 0 && untimedSkill < 0) return Attack.Result.CANTATTACK;
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    
    let walk, noMana = false;
    let classid = unit.classid;

    if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill)) && Skill.getManaCost(timedSkill) < me.mp) {
      if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y, timedSkill, classid)) {
        return Attack.Result.FAILED;
      }

      if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        // Allow short-distance walking for melee skills
        walk = (Skill.getRange(timedSkill) < 4
            && unit.distance < 10
            && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

        if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      if (!unit.dead && !checkCollision(me, unit, sdk.collision.Ranged)) {
        Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
      }
      return Attack.Result.SUCCESS;
    } else {
      noMana = !me.skillDelay;
    }

    if (untimedSkill > -1 && Skill.getManaCost(untimedSkill) < me.mp) {
      if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y, untimedSkill, classid)) {
        return Attack.Result.FAILED;
      }

      if (unit.distance > Skill.getRange(untimedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        // Allow short-distance walking for melee skills
        walk = (Skill.getRange(untimedSkill) < 4
          && unit.distance < 10
          && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

        if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      !unit.dead && Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);

      return Attack.Result.SUCCESS;
    } else {
      noMana = true;
    }

    // don't count as failed
    if (noMana) return Attack.Result.NEEDMANA;

    Misc.poll(() => !me.skillDelay, 1000, 40);

    return Attack.Result.SUCCESS;
  }
};
