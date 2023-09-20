/**
*  @filename    Assassin.js
*  @author      kolton, theBGuy
*  @desc        Assassin attack sequence
*
*/

const ClassAttack = {
  lastTrapPos: {},
  trapRange: 20,

  /**
   * @param {Monster} unit 
   * @param {boolean} preattack 
   * @returns {AttackResult}
   */
  doAttack: function (unit, preattack) {
    if (!unit) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    let gid = unit.gid;

    if (Config.MercWatch && me.needMerc()) {
      console.log("mercwatch");

      if (Town.visitTown()) {
        if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
          return Attack.Result.SUCCESS; // lost reference to the mob we were attacking
        }
      }
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

    let mercRevive = 0;
    let timedSkill = -1;
    let untimedSkill = -1;
    let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
    let classid = unit.classid;

    // Cloak of Shadows (Aggressive) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
    if (Config.AggressiveCloak && Skill.canUse(sdk.skills.CloakofShadows)
      && !me.skillDelay && !me.getState(sdk.states.CloakofShadows)) {
      if (unit.distance < 20) {
        Skill.cast(sdk.skills.CloakofShadows, sdk.skills.hand.Right);
      } else if (!Attack.getIntoPosition(unit, 20, sdk.collision.Ranged)) {
        return Attack.Result.FAILED;
      }
    }

    let checkTraps = this.checkTraps(unit);

    if (checkTraps) {
      if (unit.distance > this.trapRange || checkCollision(me, unit, sdk.collision.Ranged)) {
        if (!Attack.getIntoPosition(unit, this.trapRange, sdk.collision.Ranged)
          || (checkCollision(me, unit, sdk.collision.BlockWall)
          && (getCollision(me.area, unit.x, unit.y) & sdk.collision.BlockWall))) {
          return Attack.Result.FAILED;
        }
      }

      this.placeTraps(unit, checkTraps);
    }

    // Cloak of Shadows (Defensive; default) - can't be cast again until previous one runs out and next to useless if cast in precast sequence (won't blind anyone)
    if (!Config.AggressiveCloak && Skill.canUse(sdk.skills.CloakofShadows)
      && unit.distance < 20 && !me.skillDelay && !me.getState(sdk.states.CloakofShadows)) {
      Skill.cast(sdk.skills.CloakofShadows, sdk.skills.hand.Right);
    }

    // Get timed skill
    let checkSkill = Attack.getCustomAttack(unit)
      ? Attack.getCustomAttack(unit)[0]
      : Config.AttackSkill[index];

    if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill, classid)) {
      timedSkill = checkSkill;
    } else if (Config.AttackSkill[5] > -1
      && Attack.checkResist(unit, Config.AttackSkill[5])
      && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5], classid)) {
      timedSkill = Config.AttackSkill[5];
    }

    // Get untimed skill
    checkSkill = Attack.getCustomAttack(unit)
      ? Attack.getCustomAttack(unit)[1]
      : Config.AttackSkill[index + 1];

    if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill, classid)) {
      untimedSkill = checkSkill;
    } else if (Config.AttackSkill[6] > -1
      && Attack.checkResist(unit, Config.AttackSkill[6])
      && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[6], classid)) {
      untimedSkill = Config.AttackSkill[6];
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

    let result = this.doCast(unit, timedSkill, untimedSkill);

    if (result === Attack.Result.CANTATTACK && Attack.canTeleStomp(unit)) {
      let merc = me.getMerc();

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

        if (!!merc && getDistance(merc, unit) > 5) {
          Pather.moveToUnit(unit);

          let spot = Attack.findSafeSpot(unit, 10, 5, 9);
          !!spot && !!spot.x && Pather.walkTo(spot.x, spot.y);
        }

        let closeMob = Attack.getNearestMonster({ skipGid: gid });
        !!closeMob && this.doCast(closeMob, timedSkill, untimedSkill);
      }

      return Attack.Result.SUCCESS;
    }

    return result;
  },

  afterAttack: function () {
    Precast.doPrecast(false);
  },

  /**
   * @param {Monster} unit 
   * @param {number} timedSkill 
   * @param {number} untimedSkill 
   * @returns {AttackResult}
   */
  doCast: function (unit, timedSkill = -1, untimedSkill = -1) {
    // No valid skills can be found
    if (timedSkill < 0 && untimedSkill < 0) return Attack.Result.CANTATTACK;
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    
    let walk;
    let classid = unit.classid;

    if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
      switch (timedSkill) {
      case sdk.skills.Whirlwind:
        if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.BlockWall)) {
          if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.BlockWall)) {
            return Attack.Result.FAILED;
          }
        }

        !unit.dead && Attack.whirlwind(unit);

        return Attack.Result.SUCCESS;
      default:
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

        !unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);

        return Attack.Result.SUCCESS;
      }
    }

    if (untimedSkill > -1) {
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
    }

    Misc.poll(() => !me.skillDelay, 1000, 40);

    return Attack.Result.SUCCESS;
  },

  checkTraps: function (unit) {
    if (!Config.UseTraps || !unit) return false;

    // getDistance crashes when using an object with x, y props, that's why it's unit.x, unit.y and not unit
    // is this still a thing ^^? todo: test it
    if (me.getMinionCount(sdk.summons.type.AssassinTrap) === 0 || !this.lastTrapPos.hasOwnProperty("x")
      || getDistance(unit.x, unit.y, this.lastTrapPos.x, this.lastTrapPos.y) > 15) {
      return 5;
    }

    return 5 - me.getMinionCount(sdk.summons.type.AssassinTrap);
  },

  // todo - either import soloplays immune to trap check or add config option for immune to traps
  // since this is the base file probably better to leave the option available rather than hard code it
  // check if unit is still attackable after each cast?
  placeTraps: function (unit, amount = 5) {
    let traps = 0;
    this.lastTrapPos = { x: unit.x, y: unit.y };

    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        // used for X formation
        if (Math.abs(i) === Math.abs(j)) {
          // unit can be an object with x, y props too, that's why having "mode" prop is checked
          if (traps >= amount || (unit.hasOwnProperty("mode") && unit.dead)) return true;

          // Duriel, Mephisto, Diablo, Baal, other players - why not andy?
          if ((unit.hasOwnProperty("classid")
            && [
              sdk.monsters.Duriel, sdk.monsters.Mephisto, sdk.monsters.Diablo, sdk.monsters.Baal
            ].includes(unit.classid))
            || (unit.hasOwnProperty("type") && unit.isPlayer)) {
            if (traps >= Config.BossTraps.length) return true;

            Skill.cast(Config.BossTraps[traps], sdk.skills.hand.Right, unit.x + i, unit.y + j);
          } else {
            if (traps >= Config.Traps.length) return true;

            Skill.cast(Config.Traps[traps], sdk.skills.hand.Right, unit.x + i, unit.y + j);
          }

          traps += 1;
        }
      }
    }

    return true;
  },
};
