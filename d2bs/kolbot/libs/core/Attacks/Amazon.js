/**
*  @filename    Amazon.js
*  @author      kolton, theBGuy
*  @desc        Amazon attack sequence
*
*/

const ClassAttack = {
  bowCheck: false,
  lightFuryTick: 0,

  decideSkill: function (unit) {
    let skills = { timed: -1, untimed: -1 };
    if (!unit) return skills;

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

    if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill)) {
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

  doAttack: function (unit, preattack) {
    if (!unit) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    let gid = unit.gid;
    let needRepair = me.needRepair();

    if ((Config.MercWatch && me.needMerc()) || needRepair.length > 0) {
      console.log("towncheck");

      if (Town.visitTown(!!needRepair.length)) {
        // lost reference to the mob we were attacking
        if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
          return Attack.Result.SUCCESS;
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

    if (Skill.canUse(sdk.skills.InnerSight)) {
      if (!unit.getState(sdk.states.InnerSight)
        && unit.distance > 3 && unit.distance < 13
        && !checkCollision(me, unit, sdk.collision.Ranged)) {
        Skill.cast(sdk.skills.InnerSight, sdk.skills.hand.Right, unit);
      }
    }

    if (Skill.canUse(sdk.skills.SlowMissiles)) {
      if (!unit.getState(sdk.states.SlowMissiles)) {
        if ((unit.distance > 3 || unit.getEnchant(sdk.enchant.LightningEnchanted))
          && unit.distance < 13 && !checkCollision(me, unit, sdk.collision.Ranged)) {
          // Act Bosses and mini-bosses are immune to Slow Missles and pointless to use on lister or Cows, Use Inner-Sight instead
          if ([sdk.monsters.HellBovine].includes(unit.classid) || unit.isBoss) {
            // Check if already in this state
            if (!unit.getState(sdk.states.InnerSight) && Config.UseInnerSight && Skill.canUse(sdk.skills.InnerSight)) {
              Skill.cast(sdk.skills.InnerSight, sdk.skills.hand.Right, unit);
            }
          } else {
            Skill.cast(sdk.skills.SlowMissiles, sdk.skills.hand.Right, unit);
          }
        }
      }
    }

    let mercRevive = 0;
    let skills = this.decideSkill(unit);
    let result = this.doCast(unit, skills.timed, skills.untimed);

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
        
        if (!!closeMob) {
          let findSkill = this.decideSkill(closeMob);
          if (this.doCast(closeMob, findSkill.timed, findSkill.untimed) !== Attack.Result.SUCCESS) {
            (Skill.canUse(sdk.skills.Decoy) && Skill.cast(sdk.skills.Decoy, sdk.skills.hand.Right, unit));
          }
        }
      }

      return Attack.Result.SUCCESS;
    }

    return result;
  },

  afterAttack: function () {
    Precast.doPrecast(false);

    let needRepair = (me.needRepair() || []);

    // Repair check, mainly to restock arrows
    needRepair.length > 0 && Town.visitTown(true);

    this.lightFuryTick = 0;
  },

  // Returns: 0 - fail, 1 - success, 2 - no valid attack skills
  doCast: function (unit, timedSkill = -1, untimedSkill = -1) {
    // No valid skills can be found
    if (timedSkill < 0 && untimedSkill < 0) return Attack.Result.CANTATTACK;
    Config.TeleSwitch && me.switchToPrimary();
    
    // Arrow/bolt check
    if (this.bowCheck) {
      switch (true) {
      case this.bowCheck === "bow" && !me.getItem("aqv", sdk.items.mode.Equipped):
      case this.bowCheck === "crossbow" && !me.getItem("cqv", sdk.items.mode.Equipped):
        console.log("Bow check");
        Town.visitTown();

        break;
      }
    }

    let walk;

    if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
      switch (timedSkill) {
      case sdk.skills.LightningFury:
        if (!this.lightFuryTick || getTickCount() - this.lightFuryTick > Config.LightningFuryDelay * 1000) {
          if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
            if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged)) {
              return Attack.Result.FAILED;
            }
          }

          if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
            ClassAttack.lightFuryTick = getTickCount();
          }

          return Attack.Result.SUCCESS;
        }

        break;
      default:
        if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y, timedSkill, unit.classid)) {
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
      if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y, untimedSkill, unit.classid)) {
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

    // Wait for Lightning Fury timeout
    while (timedSkill === sdk.skills.LightningFury
      && this.lightFuryTick && getTickCount() - this.lightFuryTick < Config.LightningFuryDelay * 1000) {
      delay(40);
    }

    return Attack.Result.SUCCESS;
  }
};
