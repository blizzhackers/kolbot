/**
*  @filename    Necromancer.js
*  @author      kolton, theBGuy
*  @desc        Necromancer attack sequence
*
*/

const ClassAttack = {
  novaTick: 0,
  maxSkeletons: 0,
  maxMages: 0,
  maxRevives: 0,

  setArmySize: function () {
    ClassAttack.maxSkeletons = Config.Skeletons === "max"
      ? Skill.getMaxSummonCount(sdk.skills.RaiseSkeleton)
      : Config.Skeletons;
    ClassAttack.maxMages = Config.SkeletonMages === "max"
      ? Skill.getMaxSummonCount(sdk.skills.RaiseSkeletalMage)
      : Config.SkeletonMages;
    ClassAttack.maxRevives = Config.Revives === "max"
      ? Skill.getMaxSummonCount(sdk.skills.Revive)
      : Config.Revives;
  },

  /**
   * @returns {boolean} true - doesn't use summons or has all he can summon, false - not full of summons yet
   */
  isArmyFull: function () {
    // This necro doesn't summon anything so assume he's full
    if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
      return true;
    }

    // Make sure we have a current count of summons needed
    this.setArmySize();

    // See if we're at full army count
    if ((me.getMinionCount(sdk.summons.type.Skeleton) < this.maxSkeletons)
      && (me.getMinionCount(sdk.summons.type.SkeletonMage) < this.maxMages)
      && (me.getMinionCount(sdk.summons.type.Revive) < this.maxRevives)) {
      return false;
    }

    // If we got this far this necro has all the summons he needs
    return true;
  },

  /**
   * Check if we can use specific curse on monster
   * @param {Monster} unit 
   * @param {number} curseID 
   * @returns {boolean}
   */
  canCurse: function (unit, curseID) {
    if (unit === undefined || unit.dead || !Skill.canUse(curseID)) return false;

    let state = (() => {
      switch (curseID) {
      case sdk.skills.AmplifyDamage:
        return sdk.states.AmplifyDamage;
      case sdk.skills.DimVision:
        // dim doesn't work on oblivion knights
        if ([
          sdk.monsters.OblivionKnight1, sdk.monsters.OblivionKnight2, sdk.monsters.OblivionKnight3
        ].includes(unit.classid)) {
          return false;
        }
        return sdk.states.DimVision;
      case sdk.skills.Weaken:
        return sdk.states.Weaken;
      case sdk.skills.IronMaiden:
        return sdk.states.IronMaiden;
      case sdk.skills.Terror:
        return unit.scareable ? sdk.states.Terror : false;
      case sdk.skills.Confuse:
        // doens't work on specials
        return unit.scareable ? sdk.states.Confuse : false;
      case sdk.skills.LifeTap:
        return sdk.states.LifeTap;
      case sdk.skills.Attract:
        // doens't work on specials
        return unit.scareable ? sdk.states.Attract : false;
      case sdk.skills.Decrepify:
        return sdk.states.Decrepify;
      case sdk.skills.LowerResist:
        return sdk.states.LowerResist;
      default:
        console.warn("(ÿc9canCurse) :: ÿc1Invalid Curse ID: " + curseID);
        
        return false;
      }
    })();

    return state ? !unit.getState(state) : false;
  },

  /**
   * @param {Monster} unit 
   * @returns {number | boolean}
   */
  getCustomCurse: function (unit) {
    if (Config.CustomCurse.length <= 0) return false;

    let curse = Config.CustomCurse
      .findIndex(function (unitID) {
        if ((typeof unitID[0] === "number" && unit.classid && unit.classid === unitID[0])
            || (typeof unitID[0] === "string" && unit.name && unit.name.toLowerCase() === unitID[0].toLowerCase())) {
          return true;
        }
        return false;
      });
    if (curse > -1) {
      // format [id, curse, spectype]
      if (Config.CustomCurse[curse].length === 3) {
        return ((unit.spectype & Config.CustomCurse[curse][2]) ? Config.CustomCurse[curse][1] : false);
      } else {
        return Config.CustomCurse[curse][1];
      }
    }

    return false;
  },

  /**
   * @param {Monster} unit 
   * @param {boolean} preattack 
   * @returns {number} 0 - fail, 1 - success, 2 - no valid attack skills
   */
  doAttack: function (unit, preattack = false) {
    if (!unit || unit.dead) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    
    let mercRevive = 0;
    let gid = unit.gid;
    let classid = unit.classid;
    let [timedSkill, untimedSkill, customCurse] = [-1, -1, -1];
    const index = (unit.isSpecial || unit.isPlayer) ? 1 : 3;

    if (Config.MercWatch && me.needMerc()) {
      console.log("mercwatch");

      if (Town.visitTown()) {
        if (!unit || !copyUnit(unit).x || !Game.getMonster(-1, -1, gid) || unit.dead) {
          return Attack.Result.SUCCESS; // lost reference to the mob we were attacking
        }
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

    // only continue if we can actually curse the unit otherwise its a waste of time
    if (unit.curseable) {
      customCurse = this.getCustomCurse(unit);

      if (customCurse && this.canCurse(unit, customCurse)) {
        if (unit.distance > 25 || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, 25, sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        Skill.cast(customCurse, sdk.skills.hand.Right, unit);

        return Attack.Result.SUCCESS;
      } else if (!customCurse) {
        if (Config.Curse[0] > 0 && unit.isSpecial && this.canCurse(unit, Config.Curse[0])) {
          if (unit.distance > 25 || checkCollision(me, unit, sdk.collision.Ranged)) {
            if (!Attack.getIntoPosition(unit, 25, sdk.collision.Ranged)) {
              return Attack.Result.FAILED;
            }
          }

          Skill.cast(Config.Curse[0], sdk.skills.hand.Right, unit);

          return Attack.Result.SUCCESS;
        }

        if (Config.Curse[1] > 0 && !unit.isSpecial && this.canCurse(unit, Config.Curse[1])) {
          if (unit.distance > 25 || checkCollision(me, unit, sdk.collision.Ranged)) {
            if (!Attack.getIntoPosition(unit, 25, sdk.collision.Ranged)) {
              return Attack.Result.FAILED;
            }
          }

          Skill.cast(Config.Curse[1], sdk.skills.hand.Right, unit);

          return Attack.Result.SUCCESS;
        }
      }
    }

    // Get timed skill
    let checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[0] : Config.AttackSkill[index];

    if (Attack.checkResist(unit, checkSkill) && Attack.validSpot(unit.x, unit.y, checkSkill, classid)) {
      timedSkill = checkSkill;
    } else if (Config.AttackSkill[5] > -1
      && Attack.checkResist(unit, Config.AttackSkill[5])
      && Attack.validSpot(unit.x, unit.y, Config.AttackSkill[5], classid)) {
      timedSkill = Config.AttackSkill[5];
    }

    // Get untimed skill
    checkSkill = Attack.getCustomAttack(unit) ? Attack.getCustomAttack(unit)[1] : Config.AttackSkill[index + 1];

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

    if (result === 1) {
      Config.ActiveSummon && this.raiseArmy();
      this.explodeCorpses(unit);
    } else if (result === Attack.Result.CANTATTACK && Attack.canTeleStomp(unit)) {
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

        Config.ActiveSummon && this.raiseArmy();
        this.explodeCorpses(unit);
        let closeMob = Attack.getNearestMonster({ skipGid: gid });
        !!closeMob && this.doCast(closeMob, timedSkill, untimedSkill);
      }

      return Attack.Result.SUCCESS;
    }

    return result;
  },

  afterAttack: function () {
    Precast.doPrecast(false);
    this.raiseArmy();
    this.novaTick = 0;
  },

  /**
   * @param {Monster} unit 
   * @param {number} timedSkill 
   * @param {number} untimedSkill 
   * @returns {number} 0 - fail, 1 - success, 2 - no valid attack skills
   */
  doCast: function (unit, timedSkill = -1, untimedSkill = -1) {
    // No valid skills can be found
    if (timedSkill < 0 && untimedSkill < 0) return Attack.Result.CANTATTACK;
    // unit became invalidated
    if (!unit || !unit.attackable) return Attack.Result.SUCCESS;
    Config.TeleSwitch && me.switchToPrimary();
    
    let walk;
    let classid = unit.classid;

    // Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
    this.isArmyFull() && this.checkCorpseNearMonster(unit) && this.explodeCorpses(unit);

    if (timedSkill > -1 && (!me.skillDelay || !Skill.isTimed(timedSkill))) {
      switch (timedSkill) {
      case sdk.skills.PoisonNova:
        if (!this.novaTick || getTickCount() - this.novaTick > Config.PoisonNovaDelay * 1000) {
          if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
            if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged)) {
              return Attack.Result.FAILED;
            }
          }

          if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
            this.novaTick = getTickCount();
          }
        }

        break;
      case sdk.skills.Summoner: // Pure Summoner
        if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
          if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged)) {
            return Attack.Result.FAILED;
          }
        }

        delay(300);

        break;
      default:
        if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y, timedSkill, classid)) {
          return Attack.Result.FAILED;
        }

        if (unit.distance > Skill.getRange(timedSkill) || checkCollision(me, unit, sdk.collision.Ranged)) {
          // Allow short-distance walking for melee skills
          let walk = (Skill.getRange(timedSkill) < 4
            && unit.distance < 10
            && !checkCollision(me, unit, sdk.collision.BlockWall)
          );

          if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), sdk.collision.Ranged, walk)) {
            return Attack.Result.FAILED;
          }
        }

        !unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);

        break;
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

    // Delay for Poison Nova
    while (timedSkill === sdk.skills.PoisonNova
      && this.novaTick && getTickCount() - this.novaTick < Config.PoisonNovaDelay * 1000) {
      delay(40);
    }

    return Attack.Result.SUCCESS;
  },

  /**
   * @param {number} range 
   */
  raiseArmy: function (range = 25) {
    let tick, count;

    this.setArmySize();

    for (let i = 0; i < 3; i += 1) {
      let corpse = Game.getMonster(-1, sdk.monsters.mode.Dead);
      let corpseList = [];

      if (corpse) {
        do {
          // within casting distance
          if (corpse.distance <= range && this.checkCorpse(corpse)) {
            corpseList.push(copyUnit(corpse));
          }
        } while (corpse.getNext());
      }

      while (corpseList.length > 0) {
        corpse = corpseList.shift();

        // should probably have a way to priortize which ones we summon first
        if (me.getMinionCount(sdk.summons.type.Skeleton) < this.maxSkeletons) {
          if (!Skill.cast(sdk.skills.RaiseSkeleton, sdk.skills.hand.Right, corpse)) {
            return false;
          }

          count = me.getMinionCount(sdk.summons.type.Skeleton);
          tick = getTickCount();

          while (getTickCount() - tick < 200) {
            if (me.getMinionCount(sdk.summons.type.Skeleton) > count) {
              break;
            }

            delay(10);
          }
        } else if (me.getMinionCount(sdk.summons.type.SkeletonMage) < this.maxMages) {
          if (!Skill.cast(sdk.skills.RaiseSkeletalMage, sdk.skills.hand.Right, corpse)) {
            return false;
          }

          count = me.getMinionCount(sdk.summons.type.SkeletonMage);
          tick = getTickCount();

          while (getTickCount() - tick < 200) {
            if (me.getMinionCount(sdk.summons.type.SkeletonMage) > count) {
              break;
            }

            delay(10);
          }
        } else if (me.getMinionCount(sdk.summons.type.Revive) < this.maxRevives) {
          if (this.checkCorpse(corpse, true)) {
            console.log("Reviving " + corpse.name);

            if (!Skill.cast(sdk.skills.Revive, sdk.skills.hand.Right, corpse)) {
              return false;
            }

            count = me.getMinionCount(sdk.summons.type.Revive);
            tick = getTickCount();

            while (getTickCount() - tick < 200) {
              if (me.getMinionCount(sdk.summons.type.Revive) > count) {
                break;
              }

              delay(10);
            }
          }
        } else {
          return true;
        }
      }
    }

    return true;
  },

  /**
   * @param {Monster} unit 
   */
  explodeCorpses: function (unit) {
    if (Config.ExplodeCorpses === 0 || unit.dead) return false;

    let corpseList = [];
    let range = Math.floor((me.getSkill(Config.ExplodeCorpses, sdk.skills.subindex.SoftPoints) + 7) / 3);
    let corpse = Game.getMonster(-1, sdk.monsters.mode.Dead);

    if (corpse) {
      do {
        if (getDistance(unit, corpse) <= range && this.checkCorpse(corpse)) {
          corpseList.push(copyUnit(corpse));
        }
      } while (corpse.getNext());

      // Shuffle the corpseList so if running multiple necrobots they explode separate corpses not the same ones
      corpseList.length > 1 && (corpseList = corpseList.shuffle());

      if (this.isArmyFull()) {
        // We don't need corpses as we are not a Summoner Necro, Spam CE till monster dies or we run out of bodies.
        do {
          corpse = corpseList.shift();

          if (corpse) {
            if (!unit.dead && this.checkCorpse(corpse) && getDistance(corpse, unit) <= range) {
              // Added corpse ID so I can see when it blows another monster with the same ClassID and Name
              me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid);

              if (Skill.cast(Config.ExplodeCorpses, sdk.skills.hand.Right, corpse)) {
                delay(me.ping + 1);
              }
            }
          }
        } while (corpseList.length > 0);
      } else {
        // We are a Summoner Necro, we should conserve corpses, only blow 2 at a time so we can check for needed re-summons.
        for (let i = 0; i <= 1; i += 1) {
          if (corpseList.length > 0) {
            corpse = corpseList.shift();

            if (corpse) {
              me.overhead("Exploding: " + corpse.classid + " " + corpse.name);

              if (Skill.cast(Config.ExplodeCorpses, sdk.skills.hand.Right, corpse)) {
                delay(200);
              }
            }
          } else {
            break;
          }
        }
      }
    }

    return true;
  },

  /**
   * @param {Monster} monster 
   * @param {number} range 
   */
  checkCorpseNearMonster: function (monster, range) {
    let corpse = Game.getMonster(-1, sdk.monsters.mode.Dead);

    // Assume CorpseExplosion if no range specified
    if (range === undefined) {
      range = Math.floor((me.getSkill(Config.ExplodeCorpses, sdk.skills.subindex.SoftPoints) + 7) / 3);
    }

    if (corpse) {
      do {
        if (getDistance(corpse, monster) <= range) {
          return true;
        }
      } while (corpse.getNext());
    }

    return false;
  },

  /**
   * @param {Unit} unit 
   * @param {boolean} revive 
   */
  checkCorpse: function (unit, revive = false) {
    if (!unit || unit.mode !== sdk.monsters.mode.Dead) return false;

    let baseId = getBaseStat("monstats", unit.classid, "baseid"), badList = [312, 571];
    let	states = [
      sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
      sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
    ];

    if (revive
      && (unit.isSpecial || badList.includes(baseId)
      || (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3))) {
      return false;
    }

    if (!getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")) return false;

    return !!(unit.distance <= 25
      && !checkCollision(me, unit, sdk.collision.Ranged)
      && states.every(state => !unit.getState(state)));
  }
};
