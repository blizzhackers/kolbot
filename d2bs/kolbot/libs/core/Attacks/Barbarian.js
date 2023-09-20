/**
*  @filename    Barbarian.js
*  @author      kolton, theBGuy
*  @desc        Barbarian attack sequence
*
*/

/**
 * @todo
 * - Add howl
 */

const ClassAttack = {
  /**
   * @param {Monster} unit 
   * @param {boolean} preattack 
   * @returns {AttackResult}
   */
  doAttack: function (unit, preattack = false) {
    if (!unit) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    let gid = unit.gid;
    let needRepair = me.needRepair();

    if ((Config.MercWatch && me.needMerc()) || needRepair.length > 0) {
      console.log("towncheck");

      if (Town.visitTown(!!needRepair.length)) {
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
      && Attack.checkResist(unit, Attack.getSkillElement(Config.AttackSkill[0]))
      && (!me.skillDelay || !Skill.isTimed(Config.AttackSkill[0]))) {
      if (unit.distance > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, sdk.collision.Ranged)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), sdk.collision.Ranged)) {
          return Attack.Result.FAILED;
        }
      }

      Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

      return Attack.Result.SUCCESS;
    }

    let index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;
    let attackSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

    if (!Attack.checkResist(unit, attackSkill)) {
      attackSkill = -1;

      if (Config.AttackSkill[index + 1] > -1 && Attack.checkResist(unit, Config.AttackSkill[index + 1])) {
        attackSkill = Config.AttackSkill[index + 1];
      }
    }

    // Low mana skill
    if (Skill.getManaCost(attackSkill) > me.mp
      && Config.LowManaSkill[0] > -1
      && Attack.checkResist(unit, Config.LowManaSkill[0])) {
      attackSkill = Config.LowManaSkill[0];
    }
    
    // low weapon-quantity -> use secondary skill if we can
    if (attackSkill === sdk.skills.DoubleThrow
      && (me.getWeaponQuantity() <= 3 || me.getWeaponQuantity(sdk.body.LeftArm) <= 3)
      && Skill.canUse(Config.AttackSkill[index + 1]) && Attack.checkResist(unit, Config.AttackSkill[index + 1])) {
      attackSkill = Config.AttackSkill[index + 1];
    }

    // Telestomp with barb is pointless
    return this.doCast(unit, attackSkill);
  },

  /**
   * Check if we need to precast, repair items, or perform findItem
   * @param {boolean} pickit - determines if we use findItem or not
   */
  afterAttack: function (pickit = true) {
    Precast.doPrecast(false);

    let needRepair = (me.needRepair() || []);

    // Repair check
    needRepair.length > 0 && Town.visitTown(true);
    pickit && this.findItem(me.inArea(sdk.areas.Travincal) ? 60 : 20);
  },

  /**
   * @param {Monster} unit 
   * @param {number} attackSkill 
   * @returns {AttackResult}
   */
  doCast: function (unit, attackSkill = -1) {
    if (attackSkill < 0) return Attack.Result.CANTATTACK;
    // check if unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    (Config.TeleSwitch || Config.FindItemSwitch) && me.switchToPrimary();
    
    switch (attackSkill) {
    case sdk.skills.Whirlwind:
      /**
       * @todo we sometimes struggle getting into position because of monsters which is dumb since we can
       * just whirl through them, so that needs to be fixed
       */
      if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.BlockWall)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.BlockWall, 2)) {
          return Attack.Result.FAILED;
        }
      }

      !unit.dead && Attack.whirlwind(unit);

      return Attack.Result.SUCCESS;
    default:
      if (Skill.getRange(attackSkill) < 4 && !Attack.validSpot(unit.x, unit.y, attackSkill, unit.classid)) {
        return Attack.Result.FAILED;
      }

      if (unit.distance > Skill.getRange(attackSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        let walk = (Skill.getRange(attackSkill) < 4
          && unit.distance < 10
          && !checkCollision(me, unit, sdk.collision.BlockWall)
        );

        if (!Attack.getIntoPosition(unit, Skill.getRange(attackSkill), sdk.collision.Ranged, walk)) {
          return Attack.Result.FAILED;
        }
      }

      !unit.dead && Skill.cast(attackSkill, Skill.getHand(attackSkill), unit);

      return Attack.Result.SUCCESS;
    }
  },

  /**
   * Check whether there are any monsters in range that are attackable
   * @param {number} range 
   * @returns {boolean}
   */
  checkCloseMonsters: function (range = 10) {
    const [mainAttElm, secAttElm] = [
      Attack.getSkillElement(Config.AttackSkill[1]),
      Attack.getSkillElement(Config.AttackSkill[3]),
    ];
    let monster = Game.getMonster();

    if (monster) {
      do {
        if (monster.distance <= range
          && monster.attackable
          && !checkCollision(me, monster, sdk.collision.Ranged)
          && (
            Attack.checkResist(monster, monster.isSpecial ? mainAttElm : secAttElm)
            || (Config.AttackSkill[3] > -1 && Attack.checkResist(monster, secAttElm))
          )
        ) {
          return true;
        }
      } while (monster.getNext());
    }

    return false;
  },

  /**
   * Use findItem skill to hork bodies
   * @param {number} range 
   * @returns {boolean}
   */
  findItem: function (range = 10) {
    if (!Skill.canUse(sdk.skills.FindItem)) return false;

    let corpseList = [];
    const { x: orgX, y: orgY } = me;

    MainLoop:
    for (let i = 0; i < 3; i += 1) {
      let corpse = Game.getMonster();

      if (corpse) {
        do {
          if (corpse.dead && getDistance(corpse, orgX, orgY) <= range && this.checkCorpse(corpse)) {
            corpseList.push(copyUnit(corpse));
          }
        } while (corpse.getNext());
      }

      while (corpseList.length > 0) {
        if (this.checkCloseMonsters(5)) {
          console.debug("Monsters nearby, clearing");
          Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot());
          Attack.clear(10, false, false, false, false);
          Pather.moveToEx(orgX, orgY, { allowPicking: false });

          continue MainLoop;
        }

        corpseList.sort(Sort.units);
        const check = corpseList.shift();
        let attempted = false;
        let invalidated = false;
        // get the actual corpse rather than the copied unit
        corpse = Game.getMonster(check.classid, sdk.monsters.mode.Dead, check.gid);

        if (this.checkCorpse(corpse)) {
          if (corpse.distance > 30 || checkCollision(me, corpse, sdk.collision.BlockWall)) {
            Pather.moveNearUnit(corpse, 5);
          }
          Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

          CorpseLoop:
          for (let j = 0; j < 3; j += 1) {
            // sometimes corpse can become invalidated - necro summoned from it or baal wave clearing, ect
            // this still doesn't seem to capture baal wave clearing
            if (j > 0) {
              corpse = Game.getMonster(check.classid, sdk.monsters.mode.Dead, check.gid);
              if (!this.checkCorpse(corpse)) {
                invalidated = true;
                break;
              }
            }
            // see if we can find a new position if we failed the first time - sometimes findItem is bugged
            j > 0 && Attack.getIntoPosition(corpse, 5, sdk.collision.BlockWall, Pather.useTeleport(), true);
            // only delay if we actually casted the skill
            if (Skill.cast(sdk.skills.FindItem, sdk.skills.hand.Right, corpse)) {
              let tick = getTickCount();
              attempted = true;

              while (getTickCount() - tick < 1000) {
                if (corpse.getState(sdk.states.CorpseNoSelect)) {
                  Config.FastPick ? Pickit.fastPick() : Pickit.pickItems(range);

                  break CorpseLoop;
                }

                delay(10);
              }
            }
          }

          if (attempted && !invalidated && corpse && !corpse.getState(sdk.states.CorpseNoSelect)) {
            // if (!me.inArea(sdk.areas.ThroneofDestruction)) {
            //   D2Bot.printToConsole("Failed to hork " + JSON.stringify(corpse) + " at " + getAreaName(me.area));
            // }
            console.debug("Failed to hork " + JSON.stringify(corpse) + " at " + getAreaName(me.area));
          }
        }
      }
    }

    Config.FindItemSwitch && me.switchWeapons(Attack.getPrimarySlot());

    return true;
  },

  /**
   * Check if corpse is horkable
   * @param {Monster} unit 
   * @returns {boolean}
   */
  checkCorpse: function (unit) {
    if (!unit || !copyUnit(unit).x || !unit.dead) {
      return false;
    }
    if ([sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3].indexOf(unit.classid) === -1
      && unit.spectype === sdk.monsters.spectype.All) {
      // why ignore all normal monsters?
      return false;
    }

    // monstats2 doesn't contain guest monsters info. sigh..
    if (unit.classid <= sdk.monsters.BurningDeadArcher2
      && !getBaseStat("monstats2", unit.classid, "corpseSel")) {
      return false;
    }

    let states = [
      sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
      sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
    ];

    return (unit.distance <= 25
      && !checkCollision(me, unit, sdk.collision.Ranged)
      && states.every(function (state) {
        return !unit.getState(state);
      }));
  }
};
