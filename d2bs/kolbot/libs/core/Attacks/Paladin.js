/**
*  @filename    Paladin.js
*  @author      kolton, theBGuy
*  @desc        Paladin attack sequence
*
*/

const ClassAttack = {
  attackAuras: [sdk.skills.HolyFire, sdk.skills.HolyFreeze, sdk.skills.HolyShock],

  /**
   * @param {Unit} unit 
   * @param {boolean} [preattack] 
   * @returns {AttackResult}
   */
  doAttack: function (unit, preattack) {
    if (!unit) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    let gid = unit.gid;

    if (Config.MercWatch && me.needMerc()) {
      console.log("mercwatch");

      if (Town.visitTown()) {
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

    let mercRevive = 0;
    let [attackSkill, aura] = [-1, -1];
    const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

    if (Attack.getCustomAttack(unit)) {
      [attackSkill, aura] = Attack.getCustomAttack(unit);
    } else {
      attackSkill = Config.AttackSkill[index];
      aura = Config.AttackSkill[index + 1];
    }

    // Classic auradin check
    if (this.attackAuras.includes(aura)) {
      // Monster immune to primary aura
      if (!Attack.checkResist(unit, aura)) {
        // Reset skills
        [attackSkill, aura] = [-1, -1];

        // Set to secondary if not immune, check if using secondary attack aura if not check main skill for immunity
        if (Config.AttackSkill[5] > -1) {
          let _check = (this.attackAuras.includes(Config.AttackSkill[6])
            ? Config.AttackSkill[6]
            : Config.AttackSkill[5]);
          if (Attack.checkResist(unit, _check)) {
            attackSkill = Config.AttackSkill[5];
            aura = Config.AttackSkill[6];
          }
        }
      }
    } else {
      // Monster immune to primary skill
      if (!Attack.checkResist(unit, attackSkill)) {
        // Reset skills
        [attackSkill, aura] = [-1, -1];

        // Set to secondary if not immune
        if (Config.AttackSkill[5] > -1 && Attack.checkResist(unit, Config.AttackSkill[5])) {
          attackSkill = Config.AttackSkill[5];
          aura = Config.AttackSkill[6];
        }
      }
    }

    // Low mana skill
    if (Config.LowManaSkill[0] > -1
      && Skill.getManaCost(attackSkill) > me.mp
      && Attack.checkResist(unit, Config.LowManaSkill[0])) {
      [attackSkill, aura] = Config.LowManaSkill;
    }

    let result = this.doCast(unit, attackSkill, aura);

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
        !!closeMob && this.doCast(closeMob, attackSkill, aura);
      }

      return Attack.Result.SUCCESS;
    }

    return result;
  },

  afterAttack: function () {
    Precast.doPrecast(false);

    // only proceed with other checks if we can use redemption and the config values aren't 0
    if (Skill.canUse(sdk.skills.Redemption) && Config.Redemption.some(v => v > 0)) {
      if ((me.hpPercent < Config.Redemption[0] || me.mpPercent < Config.Redemption[1])
        && Attack.checkNearCorpses(me) > 2 && Skill.setSkill(sdk.skills.Redemption, sdk.skills.hand.Right)) {
        delay(1500);
      }
    }

    /**
     * @todo add config options for these and possibly add to Pather.walkTo 
     */
    // if (Skill.canUse(sdk.skills.Cleansing)
    // 	&& ([sdk.states.AmplifyDamage, sdk.states.Decrepify].some(s => me.getState(s)) || me.hpPercent < 70 && me.getState(sdk.states.Poison))
    // 	&& !me.checkForMobs({range: 12, coll: sdk.collision.BlockWall}) && Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right)) {
    // 	me.overhead("Delaying for a second to get rid of Poison");
    // 	Misc.poll(() => (![sdk.states.AmplifyDamage, sdk.states.Decrepify, sdk.states.Poison].some(s => me.getState(s)) || me.mode === sdk.player.mode.GettingHit), 1500, 50);
    // }

    // if (Skill.canUse(sdk.skills.Meditation) && me.mpPercent < 50 && !me.getState(sdk.states.Meditation)
    // 	&& Skill.setSkill(sdk.skills.Meditation, sdk.skills.hand.Right)) {
    // 	Misc.poll(() => (me.mpPercent >= 50 || me.mode === sdk.player.mode.GettingHit), 1500, 50);
    // }
  },

  doCast: function (unit, attackSkill = -1, aura = -1) {
    if (attackSkill < 0) return Attack.Result.CANTATTACK;
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    
    switch (attackSkill) {
    case sdk.skills.BlessedHammer:
      // todo: add doll avoid to other classes
      if (Config.AvoidDolls && unit.isDoll) {
        this.dollAvoid(unit);
        aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
        Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

        return Attack.Result.SUCCESS;
      }

      // todo: maybe if we are currently surrounded and no tele to just attack from where we are
      // hammers cut a pretty wide arc so likely this would be enough to clear our path
      if (!this.getHammerPosition(unit)) {
        // Fallback to secondary skill if it exists
        if (Config.AttackSkill[5] > -1
          && Config.AttackSkill[5] !== sdk.skills.BlessedHammer
          && Attack.checkResist(unit, Config.AttackSkill[5])) {
          return this.doCast(unit, Config.AttackSkill[5], Config.AttackSkill[6]);
        }

        return Attack.Result.FAILED;
      }

      if (unit.distance > 9 || !unit.attackable) return Attack.Result.SUCCESS;

      aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);

      for (let i = 0; i < 3; i += 1) {
        Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

        if (!unit.attackable || unit.distance > 9 || unit.isPlayer) {
          break;
        }
      }

      return Attack.Result.SUCCESS;
    case sdk.skills.HolyBolt:
      if (unit.distance > Skill.getRange(attackSkill) + 3 || CollMap.checkColl(me, unit, sdk.collision.Ranged)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.Ranged)) {
          return Attack.Result.FAILED;
        }
      }

      CollMap.reset();

      if (unit.distance > Skill.getRange(attackSkill) || CollMap.checkColl(me, unit, sdk.collision.FriendlyRanged, 2)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.FriendlyRanged, true)) {
          return Attack.Result.FAILED;
        }
      }

      if (!unit.dead) {
        aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
        Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);
      }

      return Attack.Result.SUCCESS;
    case sdk.skills.FistoftheHeavens:
      if (!me.skillDelay) {
        if (unit.distance > Skill.getRange(attackSkill)
          || CollMap.checkColl(me, unit, sdk.collision.FriendlyRanged, 2)) {
          if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.FriendlyRanged, true)) {
            return Attack.Result.FAILED;
          }
        }

        if (!unit.dead) {
          aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
          Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

          return Attack.Result.SUCCESS;
        }
      }

      break;
    case sdk.skills.Attack:
    case sdk.skills.Sacrifice:
    case sdk.skills.Zeal:
    case sdk.skills.Vengeance:
      if (!Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) {
        return Attack.Result.FAILED;
      }
      
      // 3591 - wall/line of sight/ranged/items/objects/closeddoor 
      if (unit.distance > 3 || checkCollision(me, unit, sdk.collision.WallOrRanged)) {
        if (!Attack.getIntoPosition(unit, 3, sdk.collision.WallOrRanged, true)) {
          return Attack.Result.FAILED;
        }
      }

      if (unit.attackable) {
        aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
        return (Skill.cast(attackSkill, sdk.skills.hand.LeftNoShift, unit)
          ? Attack.Result.SUCCESS
          : Attack.Result.FAILED);
      }

      break;
    default:
      if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) {
        return Attack.Result.FAILED;
      }

      if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        let walk = (attackSkill !== sdk.skills.Smite
          && Skill.getRange(attackSkill) < 4
          && unit.distance < 10
          && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

        // walk short distances instead of tele for melee attacks. teleport if failed to walk
        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      if (!unit.dead) {
        aura > -1 && Skill.setSkill(aura, sdk.skills.hand.Right);
        Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);
      }

      return Attack.Result.SUCCESS;
    }

    Misc.poll(() => !me.skillDelay, 1000, 40);

    return Attack.Result.SUCCESS;
  },

  dollAvoid: function (unit) {
    let distance = 14;

    for (let i = 0; i < 2 * Math.PI; i += Math.PI / 6) {
      let cx = Math.round(Math.cos(i) * distance);
      let cy = Math.round(Math.sin(i) * distance);

      if (Attack.validSpot(unit.x + cx, unit.y + cy)) {
        // don't clear while trying to reposition
        return Pather.moveToEx(unit.x + cx, unit.y + cy, { clearSettings: { allowClearing: false } });
      }
    }

    return false;
  },

  /**
   * @param {Monster | Player} unit 
   * @returns {boolean}
   */
  getHammerPosition: function (unit) {
    let x, y, positions;
    const canTele = Pather.canTeleport();
    const baseId = getBaseStat("monstats", unit.classid, "baseid");
    let size = getBaseStat("monstats2", baseId, "sizex");

    // in case base stat returns something outrageous
    (typeof size !== "number" || size < 1 || size > 3) && (size = 3);

    switch (unit.type) {
    case sdk.unittype.Player:
      x = unit.x;
      y = unit.y;
      positions = [[x + 2, y], [x + 2, y + 1]];

      break;
    case sdk.unittype.Monster:
      let commonCheck = (unit.isMoving && unit.distance < 10);
      x = commonCheck && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targetx : unit.x;
      y = commonCheck && getDistance(me, unit.targetx, unit.targety) > 5 ? unit.targety : unit.y;
      positions = [[x + 2, y + 1], [x, y + 3], [x + 2, y - 1], [x - 2, y + 2], [x - 5, y]];
      size === 3 && positions.unshift([x + 2, y + 2]);

      break;
    }

    // If one of the valid positions is a position im at already
    for (let i = 0; i < positions.length; i += 1) {
      let check = { x: positions[i][0], y: positions[i][1] };

      if (canTele && [check.x, check.y].distance < 1) {
        return true;
      } else if (!canTele && ([check.x, check.y].distance < 1
        && !CollMap.checkColl(unit, check, sdk.collision.BlockWalk, 0))
        || ([check.x, check.y].distance <= 4 && me.getMobCount(6) > 2)) {
        return true;
      }
    }

    for (let i = 0; i < positions.length; i += 1) {
      let check = { x: positions[i][0], y: positions[i][1] };

      if (Attack.validSpot(check.x, check.y)
        && !CollMap.checkColl(unit, check, sdk.collision.BlockWalk, 0)) {
        if (this.reposition(check.x, check.y)) return true;
      }
    }

    // console.debug("Failed to find a hammer position for " + unit.name + " distance from me: " + unit.distance);

    return false;
  },

  reposition: function (x, y) {
    if (typeof x !== "number" || typeof y !== "number") return false;
    const node = { x: x, y: y };
    if (node.distance > 0) {
      if (Pather.useTeleport()) {
        node.distance > 30
          ? Pather.moveTo(x, y)
          : Pather.teleportTo(x, y, 3);
      } else {
        if (node.distance <= 4) {
          Misc.click(0, 0, x, y);
        } else if (!CollMap.checkColl(me, node, sdk.collision.BlockWalk, 3)) {
          Pather.walkTo(x, y);
        } else {
          // don't clear while trying to reposition
          Pather.move(node, { clearSettings: { allowClearing: false } });
        }

        delay(200);
      }
    }

    return true;
  }
};
