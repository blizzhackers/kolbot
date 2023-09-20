/**
 *  @filename    Attack.js
 *  @author      kolton, theBGuy
 *  @desc        handle player attacks
 *
 */


const Attack = {
  infinity: false,
  auradin: false,
  monsterObjects: [
    sdk.monsters.Turret1, sdk.monsters.Turret2,
    sdk.monsters.Turret3, sdk.monsters.MummyGenerator,
    sdk.monsters.GargoyleTrap, sdk.monsters.LightningSpire,
    sdk.monsters.FireTower, sdk.monsters.BarricadeDoor1,
    sdk.monsters.BarricadeDoor2, sdk.monsters.BarricadeWall1,
    sdk.monsters.BarricadeWall2, sdk.monsters.CatapultS,
    sdk.monsters.CatapultE, sdk.monsters.CatapultSiege,
    sdk.monsters.CatapultW, sdk.monsters.BarricadeTower,
    sdk.monsters.PrisonDoor, sdk.monsters.DiablosBoneCage,
    sdk.monsters.DiablosBoneCage2, sdk.monsters.Hut,
  ],
  Result: {
    FAILED: 0,
    SUCCESS: 1,
    CANTATTACK: 2, // need to fix the ambiguity between this result and Failed
    NEEDMANA: 3,
    NOOP: 4, // used for clearing, if we didn't find any monsters to clear it's not exactly a success or fail
  },

  // Initialize attacks
  init: function () {
    if (Config.Wereform) {
      include("core/Attacks/wereform.js");
    } else if (Config.CustomClassAttack && FileTools.exists("libs/core/Attacks/" + Config.CustomClassAttack + ".js")) {
      console.log("Loading custom attack file");
      include("core/Attacks/" + Config.CustomClassAttack + ".js");
    } else {
      include("core/Attacks/" + sdk.player.class.nameOf(me.classid) + ".js");
    }

    if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
      showConsole();
      console.warn(
        "ÿc1Bad attack config. Don't expect your bot to attack." + "\n"
        + "ÿc0AttackSkills: ", Config.AttackSkill
      );
    }

    this.getPrimarySlot();
    Skill.init();

    if (me.expansion) {
      Precast.checkCTA();
      this.checkInfinity();
      this.checkAuradin();
    }
  },

  /**
   * @description check if slot has items
   * @param {0 | 1} slot 
   * @returns {boolean} If weapon slot has an item equipped
   */
  checkSlot: function (slot = me.weaponswitch) {
    let item = me.getItem(-1, sdk.items.mode.Equipped);

    if (item) {
      do {
        if (me.weaponswitch !== slot) {
          if (item.bodylocation === sdk.body.RightArmSecondary || item.bodylocation === sdk.body.LeftArmSecondary) {
            return true;
          }
        } else {
          if (item.isOnMain) {
            return true;
          }
        }
      } while (item.getNext());
    }

    return false;
  },

  /**
   * @description Automatically determine primary weapon slot, Weapon slot with items that isn't a CTA
   * @returns {0 | 1 | -1} Primary weapon slot
   */
  getPrimarySlot: function () {
    // determine primary slot if not set
    if (Config.PrimarySlot === -1) {
      if (me.classic) {
        Config.PrimarySlot = sdk.player.slot.Main;
      } else {
        // Always start on main-hand
        me.switchWeapons(sdk.player.slot.Main);
        // have cta
        if ((Precast.haveCTA > -1) || Precast.checkCTA()) {
          // have item on non-cta slot - set non-cta slot as primary
          if (this.checkSlot(Precast.haveCTA ^ 1)) {
            Config.PrimarySlot = Precast.haveCTA ^ 1;
          } else {
            // other slot is empty - set cta as primary slot
            Config.PrimarySlot = Precast.haveCTA;
          }
        } else if (!this.checkSlot(sdk.player.slot.Main) && this.checkSlot(sdk.player.slot.Secondary)) {
          // only slot II has items
          Config.PrimarySlot = sdk.player.slot.Secondary;
        } else {
          // both slots have items, both are empty, or only slot I has items
          Config.PrimarySlot = sdk.player.slot.Main;
        }
      }
    }

    return Config.PrimarySlot;
  },

  /**
   * 
   * @param {Monster} unit 
   * @returns {[number, number] | boolean}
   * @todo add checking for other options than just name/classid
   *  - option for based on spectype
   *  - option for based on enchant/aura
   */
  getCustomAttack: function (unit) {
    // Check if unit got invalidated
    if (!unit || !unit.name || !copyUnit(unit).x) return false;
    
    for (let i in Config.CustomAttack) {
      if (Config.CustomAttack.hasOwnProperty(i)) {
        // if it contains numbers but is a string, convert to an int
        if (typeof i === "string" && i.match(/\d+/g)) {
          // @ts-ignore
          i = parseInt(i, 10);
        }

        switch (typeof i) {
        case "string":
          if (unit.name.toLowerCase() === i.toLowerCase()) {
            return Config.CustomAttack[i];
          }

          break;
        case "number":
          if (unit.classid === i) {
            return Config.CustomAttack[i];
          }
        }
      }
    }

    return false;
  },

  /**
   * @description Check if player or his merc are using Infinity, and adjust resistance checks based on that
   * @returns {boolean}
   */
  checkInfinity: function () {
    // don't check if classic or under 63 - not possibile to either equip or have merc use
    if (me.classic || me.charlvl < 63) return false;

    // check if we have a merc and they aren't dead
    if (Config.UseMerc && me.mercrevivecost === 0) {
      let merc = Misc.poll(function () {
        return me.getMerc();
      }, 1000, 100);
      // only merc who can use it
      if (merc && merc.classid === sdk.mercs.Guard) {
        Attack.infinity = merc.checkItem({ name: sdk.locale.items.Infinity }).have;
        if (Attack.infinity) return true;
      }
    }

    // Check player infinity - only check if merc doesn't have
    if (!Attack.infinity) {
      Attack.infinity = me.checkItem({ name: sdk.locale.items.Infinity, equipped: true }).have;
    }

    return Attack.infinity;
  },

  /**
   * @description Check if player is using Dragon, Dream, HoJ, or Ice, and adjust resistance checks based on that
   * @returns {boolean}
   */
  checkAuradin: function () {
    // dragon lvl 61, dream lvl 65, hoj lvl 67, ice lvl 65
    if (me.charlvl < 61) return false;
    Attack.auradin = me.haveSome([
      { name: sdk.locale.items.Dragon, equipped: true },
      { name: sdk.locale.items.Dream, equipped: true },
      { name: sdk.locale.items.HandofJustice, equipped: true },
      { name: sdk.locale.items.Ice, equipped: true },
    ]);
  
    return Attack.auradin;
  },

  /**
   * @description check if we can telestomp a unit
   * @param {Unit} unit 
   * @returns {boolean}
   */
  canTeleStomp: function (unit) {
    if (!unit || !unit.attackable) return false;
    return (
      Config.TeleStomp && Config.UseMerc
      && Pather.canTeleport()
      && Attack.checkResist(unit, "physical")
      && !!me.getMerc()
      && Attack.validSpot(unit.x, unit.y)
    );
  },

  /**
   * @description Kill a monster based on its classId, can pass a unit as well
   * @param {Unit | number} classId 
   * @returns {boolean} If we managed to kill the unit
   */
  kill: function (classId) {
    if (!classId || Config.AttackSkill[1] < 0) return false;
    let target = (typeof classId === "object"
      ? classId
      : Misc.poll(() => Game.getMonster(classId), 2000, 100));

    if (!target) {
      console.warn("Attack.kill: Target not found");
      return Attack.clear(10);
    }

    const findTarget = function (gid, loc) {
      let path = getPath(me.area, me.x, me.y, loc.x, loc.y, 1, 5);
      if (!path) return false;

      if (path.some(function (node) {
        Pather.walkTo(node.x, node.y);
        return Game.getMonster(-1, -1, gid);
      })) {
        return Game.getMonster(-1, -1, gid);
      } else {
        return false;
      }
    };

    const who = (!!target.name ? target.name : classId);
    const gid = target.gid;

    let retry = 0;
    let errorInfo = "";
    let attackCount = 0;

    let lastLoc = { x: me.x, y: me.y };
    let tick = getTickCount();
    console.log("ÿc7Kill ÿc0:: " + who);
    if (Config.MFLeader
      // mfhelper is disabled for these scripts so announcing is pointless
      && !Loader.scriptName(0).toLowerCase().includes("diablo")
      && !Loader.scriptName(0).toLowerCase().includes("baal")
      && Pather.makePortal()) {
      say("kill " + classId);
    }

    while (attackCount < Config.MaxAttackCount && target.attackable && !this.skipCheck(target)) {
      // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
      if (!target || !copyUnit(target).x) {
        target = Game.getMonster(-1, -1, gid);
        !target && (target = findTarget(gid, lastLoc));

        if (!target) {
          console.warn("ÿc1Failed to kill " + who + " (couldn't relocate unit)");
          break;
        }
      }

      // todo - dodge boss missiles
      Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
      Config.MFSwitchPercent && target.hpPercent < Config.MFSwitchPercent && me.switchToPrimary();

      if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
        Packet.flash(me.gid);
      }

      let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

      if (result === this.Result.FAILED) {
        if (retry++ > 3) {
          errorInfo = " (doAttack failed)";

          break;
        }

        Packet.flash(me.gid);
      } else if (result === this.Result.CANTATTACK) {
        errorInfo = " (No valid attack skills)";

        break;
      } else if (result === this.Result.NEEDMANA) {
        continue;
      } else {
        retry = 0;
      }

      lastLoc = { x: me.x, y: me.y };
      attackCount++;
    }

    attackCount === Config.MaxAttackCount && (errorInfo = " (attackCount exceeded: " + attackCount + ")");
    Config.MFSwitchPercent && me.switchWeapons(this.getPrimarySlot());
    ClassAttack.afterAttack();
    Pickit.pickItems();

    if (!!target && target.attackable) {
      console.warn("ÿc1Failed to kill ÿc0" + who + errorInfo);
    } else {
      console.log("ÿc7Killed ÿc0:: " + who + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick));
    }

    return (!target || !copyUnit(target).x || target.dead || !target.attackable);
  },

  /**
   * @description hurt a unit to a certain percentage of life left
   * @param {string | number | Unit} classId 
   * @param {number} percent 
   * @returns {boolean}
   */
  hurt: function (classId, percent) {
    if (!classId || !percent) return false;
    const target = (typeof classId === "object"
      ? classId
      : Misc.poll(function () {
        return Game.getMonster(classId);
      }, 2000, 100));

    if (!target) {
      console.warn("Attack.hurt: Target not found");
      return false;
    }

    let retry = 0, attackCount = 0;
    let tick = getTickCount();
    const who = (!!target.name ? target.name : classId);

    while (attackCount < Config.MaxAttackCount && target.attackable && !Attack.skipCheck(target)) {
      let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

      if (result === this.Result.FAILED) {
        if (retry++ > 3) {
          break;
        }

        Packet.flash(me.gid);
      } else if (result === this.Result.CANTATTACK) {
        break;
      } else if (result === this.Result.NEEDMANA) {
        continue;
      } else {
        retry = 0;
      }

      if (!copyUnit(target).x) {
        return true;
      }

      attackCount += 1;

      if (target.hpPercent <= percent) {
        console.log(
          "ÿc7Hurt ÿc0:: " + who + "ÿc7HpPercent: ÿc0" + target.hpPercent
          + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
        );
        break;
      }
    }

    return true;
  },

  /**
   * @description Determine scariness of monster for monster sorting
   * @param {Monster} unit 
   * @returns {number} scariness
   */
  getScarinessLevel: function (unit) {
    // todo - define summonertype prototype
    let scariness = 0;
    const ids = [
      sdk.monsters.FallenShaman, sdk.monsters.CarverShaman, sdk.monsters.CarverShaman2,
      sdk.monsters.DevilkinShaman, sdk.monsters.DevilkinShaman2, sdk.monsters.DarkShaman1,
      sdk.monsters.DarkShaman2, sdk.monsters.WarpedShaman, sdk.monsters.HollowOne, sdk.monsters.Guardian1,
      sdk.monsters.Guardian2, sdk.monsters.Unraveler1, sdk.monsters.Unraveler2,
      sdk.monsters.Ancient1, sdk.monsters.Ancient2, sdk.monsters.Ancient3,
      sdk.monsters.BaalSubjectMummy, sdk.monsters.RatManShaman, sdk.monsters.FetishShaman,
      sdk.monsters.FlayerShaman1, sdk.monsters.FlayerShaman2, sdk.monsters.SoulKillerShaman1,
      sdk.monsters.SoulKillerShaman2, sdk.monsters.StygianDollShaman1, sdk.monsters.StygianDollShaman2,
      sdk.monsters.FleshSpawner1, sdk.monsters.FleshSpawner2,
      sdk.monsters.StygianHag, sdk.monsters.Grotesque1, sdk.monsters.Grotesque2
    ];

    // Only handling monsters for now
    if (!unit || unit.type !== sdk.unittype.Monster) return undefined;
    // Minion
    (unit.isMinion) && (scariness += 1);
    // Champion
    (unit.isChampion) && (scariness += 2);
    // Boss
    (unit.isUnique) && (scariness += 4);
    // Summoner or the like
    ids.includes(unit.classid) && (scariness += 8);

    return scariness;
  },

  /**
   * @description Clear monsters in a section based on range and spectype or clear monsters around a boss monster
   * @param {number} [range=25] 
   * @param {number} [spectype=0] 
   * @param {number | Unit} [bossId] 
   * @param {(a: T, b: T) => number} [sortfunc] 
   * @param {boolean} [pickit] 
   * @returns {boolean}
   * @todo change to passing an object
   */
  clear: function (range, spectype, bossId, sortfunc, pickit = true) {
    while (!me.gameReady) {
      delay(40);
    }

    if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) return false;

    range === undefined && (range = 25);
    spectype === undefined && (spectype = 0);
    bossId === undefined && (bossId = false);
    sortfunc === undefined && (sortfunc = false);
    !sortfunc && (sortfunc = this.sortMonsters);

    if (typeof (range) !== "number") throw new Error("Attack.clear: range must be a number.");

    let i, boss, orgx, orgy, start, skillCheck;
    let gidAttack = [];
    let tick = getTickCount();
    let [killedBoss, logged] = [false, false];
    let [retry, attackCount] = [0, 0];

    if (bossId) {
      boss = Misc.poll(function () {
        switch (true) {
        case typeof bossId === "object":
          return bossId;
        case ((typeof bossId === "number" && bossId > 999)):
          return Game.getMonster(-1, -1, bossId);
        default:
          return Game.getMonster(bossId);
        }
      }, 2000, 100);

      if (!boss) {
        console.warn("Attack.clear: " + bossId + " not found");
        return Attack.clear(10);
      }

      ({ orgx, orgy } = { orgx: boss.x, orgy: boss.y });
      if (Config.MFLeader
        && !!bossId
        // mfhelper is disabled for these scripts so announcing is pointless
        && !Loader.scriptName(0).toLowerCase().includes("diablo")
        && !Loader.scriptName(0).toLowerCase().includes("baal")
        && Pather.makePortal()) {
        say("clear " + (["number", "string"].includes(typeof bossId) ? bossId : bossId.name));
      }
    } else {
      ({ orgx, orgy } = { orgx: me.x, orgy: me.y });
    }

    let monsterList = [];
    let target = Game.getMonster();

    if (target) {
      do {
        if ((!spectype || (target.spectype & spectype)) && target.attackable && !this.skipCheck(target)) {
          // Speed optimization - don't go through monster list until there's at least one within clear range
          if (!start && getDistance(target, orgx, orgy) <= range
            && (Pather.canTeleport() || !checkCollision(me, target, sdk.collision.WallOrRanged))) {
            start = true;
          }

          monsterList.push(copyUnit(target));
        }
      } while (target.getNext());
    }

    while (start && monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
      if (me.dead) return false;
      
      boss && (({ orgx, orgy } = { orgx: boss.x, orgy: boss.y }));
      monsterList.sort(sortfunc);
      // target = copyUnit(monsterList[0]);
      target = Game.getMonster(-1, -1, monsterList[0].gid);

      if (target && target.x !== undefined && (getDistance(target, orgx, orgy) <= range
        || (this.getScarinessLevel(target) > 7 && target.distance <= range))
        && target.attackable) {
        Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
        tick = getTickCount();

        if (!logged && boss && boss.gid === target.gid) {
          logged = true;
          console.log("ÿc7Clear ÿc0:: " + (!!target.name ? target.name : bossId));
        }
        // me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

        let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

        if (result) {
          retry = 0;

          if (result === this.Result.CANTATTACK) {
            monsterList.shift();

            continue;
          } else if (result === this.Result.NEEDMANA) {
            continue;
          }

          for (i = 0; i < gidAttack.length; i += 1) {
            if (gidAttack[i].gid === target.gid) {
              break;
            }
          }

          if (i === gidAttack.length) {
            gidAttack.push({ gid: target.gid, attacks: 0, name: target.name });
          }

          gidAttack[i].attacks += 1;
          attackCount += 1;
          let isSpecial = target.isSpecial;
          let secAttack = me.barbarian ? (isSpecial ? 2 : 4) : 5;
          let checkSkill = Config.AttackSkill[isSpecial ? 1 : 3];
          let hammerCheck = me.paladin && checkSkill === sdk.skills.BlessedHammer;

          if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, checkSkill)
              || (hammerCheck && !ClassAttack.getHammerPosition(target)))) {
            skillCheck = Config.AttackSkill[secAttack];
          } else {
            skillCheck = checkSkill;
          }

          // Desync/bad position handler
          switch (skillCheck) {
          case sdk.skills.BlessedHammer:
            // Tele in random direction with Blessed Hammer
            if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % (isSpecial ? 4 : 2) === 0) {
              let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
              Pather.moveTo(coord.x, coord.y);
            }

            break;
          default:
            // Flash with melee skills
            if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % (isSpecial ? 15 : 5) === 0
              && Skill.getRange(skillCheck) < 4) {
              Packet.flash(me.gid);
            }

            break;
          }

          // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
          if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && gidAttack[i].attacks > 15) {
            console.log("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
            monsterList.shift();
          }

          /**
           * @todo allow for more aggressive horking here
           */
          if (target.dead || Config.FastPick || Config.FastFindItem) {
            if (boss && boss.gid === target.gid && target.dead) {
              killedBoss = true;
              console.log(
                "ÿc7Cleared ÿc0:: " + (!!target.name ? target.name : bossId)
                + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
              );
            }
            Config.FastFindItem && pickit && ClassAttack.findItem();
            Pickit.fastPick();
          }
        } else {
          if (me.inArea(sdk.areas.ChaosSanctuary) && target.classid === sdk.monsters.StormCaster1) {
            // probably behind the wall - skip them
            monsterList.shift();
            retry = 0;
          }
          if (retry++ > 3) {
            monsterList.shift();
            retry = 0;
          }

          Packet.flash(me.gid);
        }
      } else {
        monsterList.shift();
      }
    }

    if (attackCount > 0) {
      ClassAttack.afterAttack(pickit);
      this.openChests(range, orgx, orgy);
      pickit && Pickit.pickItems();
    } else {
      Precast.doPrecast(false); // we didn't attack anything but check if we need to precast. TODO: better method of keeping track of precast skills
    }

    if (boss && !killedBoss) {
      // check if boss corpse is around
      if (boss.dead) {
        console.log(
          "ÿc7Cleared ÿc0:: " + (!!boss.name ? boss.name : bossId)
          + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
        );
      } else {
        console.log("ÿc7Clear ÿc0:: ÿc1Failed to clear ÿc0:: " + (!!boss.name ? boss.name : bossId));
      }
    }

    return true;
  },

  /**
   * @description clear all monsters based on classid arguments
   * @param  {...number} ids 
   * @returns {boolean}
   * @todo
   * - Should there be a range parameter for this?
   * - Should we keep track of where we started from?
   */
  clearClassids: function (...ids) {
    // lets keep track of where we started from and move back when done
    const { x, y } = me;
    let cleared = false;

    for (let i = 0; i < 3; i++) {
      let monster = Game.getMonster();

      if (monster) {
        let list = [];

        do {
          if (ids.includes(monster.classid) && monster.attackable) {
            list.push(copyUnit(monster));
          }
        } while (monster.getNext());

        if (!list.length) {
          break;
        }
        // if we cleared, return to our starting position
        if (Attack.clearList(list)) {
          Pather.moveTo(x, y);
          cleared = true;
        }
      } else {
        // if no monsters were found should that be a pass or fail?
        return false; // fail for now
      }
    }

    return cleared;
  },

  /**
   * @description Filter monsters based on classId, spectype and range
   * @param {number} classid 
   * @param {number} spectype 
   * @param {number} range 
   * @param {Unit | {x: number, y: number}} center 
   * @returns {Monster[]}
   */
  getMob: function (classid, spectype, range, center) {
    let monsterList = [];
    let monster = Game.getMonster();

    range === undefined && (range = 25);
    !center && (center = me);

    switch (typeof classid) {
    case "number":
    case "string":
      monster = Game.getMonster(classid);

      if (monster) {
        do {
          if (getDistance(center.x, center.y, monster.x, monster.y) <= range
              && (!spectype || (monster.spectype & spectype)) && monster.attackable) {
            monsterList.push(copyUnit(monster));
          }
        } while (monster.getNext());
      }

      break;
    case "object":
      monster = Game.getMonster();

      if (monster) {
        do {
          if (classid.includes(monster.classid) && getDistance(center.x, center.y, monster.x, monster.y) <= range
              && (!spectype || (monster.spectype & spectype)) && monster.attackable) {
            monsterList.push(copyUnit(monster));
          }
        } while (monster.getNext());
      }

      break;
    }

    return monsterList;
  },

  /**
   * @description Clear an already formed array of monstas
   * @param {Function | Array<Unit>} mainArg 
   * @param {Function} [sortFunc] 
   * @param {boolean} [refresh] 
   * @returns {boolean}
   */
  clearList: function (mainArg, sortFunc, refresh) {
    /** @type {Monster[]} */
    let monsterList;
    /** @type {{ gid: number, attacks: number }[]} */
    let gidAttack = [];
    let [retry, attackCount] = [0, 0];

    switch (typeof mainArg) {
    case "function":
      monsterList = mainArg.call(this);

      break;
    case "object":
      monsterList = mainArg.slice(0);

      break;
    case "boolean": // false from Attack.getMob()
      return false;
    default:
      throw new Error("clearList: Invalid argument");
    }

    !sortFunc && (sortFunc = this.sortMonsters);

    while (monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
      if (me.dead) return false;

      if (refresh && attackCount > 0 && attackCount % refresh === 0) {
        monsterList = mainArg.call();
      }

      monsterList.sort(sortFunc);
      let target = copyUnit(monsterList[0]);

      if (target.x !== undefined && target.attackable) {
        Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
        // me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);
        let i;
        let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

        if (result) {
          retry = 0;

          if (result === this.Result.CANTATTACK) {
            monsterList.shift();

            continue;
          } else if (result === this.Result.NEEDMANA) {
            continue;
          }

          for (i = 0; i < gidAttack.length; i += 1) {
            if (gidAttack[i].gid === target.gid) {
              break;
            }
          }

          if (i === gidAttack.length) {
            gidAttack.push({ gid: target.gid, attacks: 0 });
          }

          gidAttack[i].attacks += 1;
          let isSpecial = target.isSpecial;

          // Desync/bad position handler
          switch (Config.AttackSkill[isSpecial ? 1 : 3]) {
          case sdk.skills.BlessedHammer:
            // Tele in random direction with Blessed Hammer
            if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % (isSpecial ? 5 : 15) === 0) {
              let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
              Pather.moveTo(coord.x, coord.y);
            }

            break;
          default:
            // Flash with melee skills
            if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % (isSpecial ? 5 : 15) === 0
              && Skill.getRange(Config.AttackSkill[isSpecial ? 1 : 3]) < 4) {
              Packet.flash(me.gid);
            }

            break;
          }

          // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
          if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && gidAttack[i].attacks > 15) {
            console.log("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
            monsterList.shift();
          }

          attackCount += 1;

          if (target.dead || Config.FastPick) {
            Pickit.fastPick();
          }
        } else {
          if (retry++ > 3) {
            monsterList.shift();
            retry = 0;
          }

          Packet.flash(me.gid);
        }
      } else {
        monsterList.shift();
      }
    }

    if (attackCount > 0) {
      ClassAttack.afterAttack(true);
      this.openChests(Config.OpenChests.Range);
      Pickit.pickItems();
    } else {
      Precast.doPrecast(false); // we didn't attack anything but check if we need to precast. TODO: better method of keeping track of precast skills
    }

    return true;
  },

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {number} [range=15] 
   * @param {number} [timer=3000] - time in ms 
   * @param {boolean} [skipBlocked=true] 
   * @param {boolean} [special=false] 
   * @returns {void}
   */
  securePosition: function (x, y, range = 15, timer = 3000, skipBlocked = true, special = false) {
    let tick;

    (typeof x !== "number" || typeof y !== "number") && ({ x, y } = me);
    skipBlocked === true && (skipBlocked = sdk.collision.Ranged);

    while (true) {
      [x, y].distance > 5 && Pather.moveTo(x, y);

      let monster = Game.getMonster();
      let monList = [];

      if (monster) {
        do {
          if (getDistance(monster, x, y) <= range && monster.attackable && this.canAttack(monster)
              && (!skipBlocked || !checkCollision(me, monster, skipBlocked))
              && (Pather.canTeleport() || !checkCollision(me, monster, sdk.collision.BlockWall))) {
            monList.push(copyUnit(monster));
          }
        } while (monster.getNext());
      }

      if (!monList.length) {
        !tick && (tick = getTickCount());

        // only return if it's been safe long enough
        if (getTickCount() - tick >= timer) {
          return;
        }
      } else {
        this.clearList(monList);

        // reset the timer when there's monsters in range
        tick && (tick = false);
      }

      if (special) {
        if (me.paladin && Skill.canUse(sdk.skills.Redemption)
          && Skill.setSkill(sdk.skills.Redemption, sdk.skills.hand.Right)) {
          delay(1000);
        }
      }

      delay(100);
    }
  },

  /**
   * @description Draw lines around a room on minimap
   * @param {Room} room 
   * @param {number} color 
   */
  markRoom: function (room, color) {
    let arr = [];
    const [rX, rY] = [room.x * 5, room.y * 5];

    arr.push(new Line(rX, rY, rX, rY + room.ysize, color, true));
    arr.push(new Line(rX, rY, rX + room.xsize, rY, color, true));
    arr.push(new Line(rX + room.xsize, rY, rX + room.xsize, rY + room.ysize, color, true));
    arr.push(new Line(rX, rY + room.ysize, rX + room.xsize, rY + room.ysize, color, true));
  },

  /**
   * @description Count uniques in current area within getUnit range
   */
  countUniques: function () {
    !Attack.uniques && (Attack.uniques = 0);
    !Attack.ignoredGids && (Attack.ignoredGids = []);

    let monster = Game.getMonster();

    if (monster) {
      do {
        if ((monster.isSuperUnique) && Attack.ignoredGids.indexOf(monster.gid) === -1) {
          Attack.uniques += 1;
          Attack.ignoredGids.push(monster.gid);
        }
      } while (monster.getNext());
    }
  },

  /**
   * @description Store average unique monsters counted in area during run
   * @param {number} area 
   */
  storeStatistics: function (area) {
    !FileTools.exists("statistics.json") && FileAction.write("statistics.json", "{}");

    let obj = JSON.parse(FileAction.read("statistics.json"));

    if (obj) {
      if (obj[area] === undefined) {
        obj[area] = {
          runs: 1,
          averageUniques: (Attack.uniques).toFixed(4)
        };
      } else {
        let { averageUniques, runs } = obj[area];
        obj[area].averageUniques = ((averageUniques * runs + Attack.uniques) / (runs + 1)).toFixed(4);
        obj[area].runs += 1;
      }

      FileAction.write("statistics.json", JSON.stringify(obj));
    }

    Attack.uniques = 0;
    Attack.ignoredGids = [];
  },

  /**
   * @description Clear an entire area based on monster spectype
   * @param {number} spectype 
   * @returns {boolean}
   */
  clearLevel: function (spectype = 0) {
    function RoomSort (a, b) {
      return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
    }

    let room = getRoom();
    if (!room) return false;

    console.time("clearLevel");
    console.info(true, getAreaName(me.area));

    let myRoom, previousArea;
    let rooms = [];
    const currentArea = getArea().id;
    const breakClearLevelCheck = !!(Loader.scriptName() === "MFHelper"
      && Config.MFHelper.BreakClearLevel && Config.Leader !== "");

    do {
      rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
    } while (room.getNext());
    
    if (Config.MFLeader && rooms.length > 0) {
      Pather.makePortal();
      console.log("clearlevel " + getAreaName(currentArea));
      say("clearlevel " + me.area);
    }

    while (rooms.length > 0) {
      // get the first room + initialize myRoom var
      !myRoom && (room = getRoom(me.x, me.y));

      if (breakClearLevelCheck) {
        let leader = Misc.findPlayer(Config.Leader);

        if (leader && leader.area !== me.area && !leader.inTown) {
          me.overhead("break the clearing in " + getArea().name);

          return true;
        }
      }

      if (room) {
        // use previous room to calculate distance
        if (room instanceof Array) {
          myRoom = [room[0], room[1]];
        } else {
          // create a new room to calculate distance (first room, done only once)
          myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
        }
      }

      rooms.sort(RoomSort);
      room = rooms.shift();

      let result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

      if (result) {
        Pather.moveToEx(
          result[0], result[1],
          { retry: 3, clearSettings: { specType: spectype, clearPath: (!Pather.canTeleport()) } }
        );
        previousArea = result;

        if (!this.clear(40, spectype)) {
          break;
        }
      } else if (currentArea !== getArea().id) {
        // Make sure bot does not get stuck in different area.
        Pather.moveToEx(
          previousArea[0], previousArea[1],
          { retry: 3, clearSettings: { specType: spectype, clearPath: (!Pather.canTeleport()) } }
        );
      }
    }

    //this.storeStatistics(getAreaName(me.area));
    console.info(false, getAreaName(currentArea), "clearLevel");

    return true;
  },

  /**
   * @description Sort monsters based on distance, spectype and classId (summoners are attacked first)
   * @param {Monster} unitA 
   * @param {Monster} unitB 
   * @returns {boolean}
   * @todo Think this needs a collison check included for non tele chars, might prevent choosing 
   * closer mob that is actually behind a wall vs the one we pass trying to get behind the wall
   */
  sortMonsters: function (unitA, unitB) {
    // No special sorting for were-form
    if (Config.Wereform) return getDistance(me, unitA) - getDistance(me, unitB);

    // sort main bosses first
    // Andy
    if (me.inArea(sdk.areas.CatacombsLvl4)) {
      if (unitA.distance < 5 && unitA.classid === sdk.monsters.Andariel
        && !checkCollision(me, unitA, sdk.collision.Ranged)) {
        return -1;
      }
    }

    // Meph
    if (me.inArea(sdk.areas.DuranceofHateLvl3)) {
      if (unitA.distance < 5 && unitA.classid === sdk.monsters.Mephisto
        && !checkCollision(me, unitA, sdk.collision.Ranged)) {
        return -1;
      }
    }

    // Baal
    if (me.inArea(sdk.areas.WorldstoneChamber)) {
      if (unitA.classid === sdk.monsters.Baal) return -1;
    }

    // Barb optimization
    if (me.barbarian) {
      if (!Attack.checkResist(unitA, Attack.getSkillElement(Config.AttackSkill[(unitA.isSpecial) ? 1 : 3]))) {
        return 1;
      }

      if (!Attack.checkResist(unitB, Attack.getSkillElement(Config.AttackSkill[(unitB.isSpecial) ? 1 : 3]))) {
        return -1;
      }
    }

    // Put monsters under Attract curse at the end of the list - They are helping us
    if (unitA.getState(sdk.states.Attract)) return 1;
    if (unitB.getState(sdk.states.Attract)) return -1;

    const ids = [
      sdk.monsters.OblivionKnight1, sdk.monsters.OblivionKnight2, sdk.monsters.OblivionKnight3,
      sdk.monsters.FallenShaman, sdk.monsters.CarverShaman, sdk.monsters.CarverShaman2,
      sdk.monsters.DevilkinShaman, sdk.monsters.DevilkinShaman2, sdk.monsters.DarkShaman1,
      sdk.monsters.DarkShaman2, sdk.monsters.WarpedShaman, sdk.monsters.HollowOne, sdk.monsters.Guardian1,
      sdk.monsters.Guardian2, sdk.monsters.Unraveler1, sdk.monsters.Unraveler2,
      sdk.monsters.Ancient1, sdk.monsters.BaalSubjectMummy, sdk.monsters.BloodRaven, sdk.monsters.RatManShaman,
      sdk.monsters.FetishShaman, sdk.monsters.FlayerShaman1, sdk.monsters.FlayerShaman2,
      sdk.monsters.SoulKillerShaman1, sdk.monsters.SoulKillerShaman2, sdk.monsters.StygianDollShaman1,
      sdk.monsters.StygianDollShaman2, sdk.monsters.FleshSpawner1, sdk.monsters.FleshSpawner2,
      sdk.monsters.StygianHag, sdk.monsters.Grotesque1, sdk.monsters.Ancient2, sdk.monsters.Ancient3,
      sdk.monsters.Grotesque2
    ];

    if (!me.inArea(sdk.areas.ClawViperTempleLvl2) && ids.includes(unitA.classid) && ids.includes(unitB.classid)) {
      // Kill "scary" uniques first (like Bishibosh)
      if ((unitA.isUnique) && (unitB.isUnique)) return getDistance(me, unitA) - getDistance(me, unitB);
      if (unitA.isUnique) return -1;
      if (unitB.isUnique) return 1;

      return getDistance(me, unitA) - getDistance(me, unitB);
    }

    if (ids.includes(unitA.classid)) return -1;
    if (ids.includes(unitB.classid)) return 1;

    if (Config.BossPriority) {
      if ((unitA.isSuperUnique) && (unitB.isSuperUnique)) return getDistance(me, unitA) - getDistance(me, unitB);

      if (unitA.isSuperUnique) return -1;
      if (unitB.isSuperUnique) return 1;
    }

    return getDistance(me, unitA) - getDistance(me, unitB);
  },

  /**
   * @description Check if a set of coords is valid/accessable
   * @param {number} x 
   * @param {number} y 
   * @param {number} [skill=-1] 
   * @param {number} [unitid=0] 
   * @returns {boolean} If the spot is a valid location for walking/casting/attack
   * @todo re-work this for more info:
   *  - casting skills can go over non-floors - excluding bliz/meteor - not sure if any others
   *  - physical skills can't, need to exclude monster objects though
   *  - splash skills can go through some objects, however some objects are cast blockers
   */
  validSpot: function (x, y, skill = -1, unitid = 0) {
    // Just in case
    if (!me.area || !x || !y) return false;
    // for now this just returns true and we leave getting into position to the actual class attack files
    if (Skill.missileSkills.includes(skill)
      || ([sdk.skills.Blizzard, sdk.skills.Meteor].includes(skill)
      && unitid > 0 && !getBaseStat("monstats", unitid, "flying"))) {
      return true;
    }

    let result;
    let mObject = Attack.monsterObjects.includes(unitid);
    let nonFloorAreas = [
      sdk.areas.ArcaneSanctuary, sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary,
      sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit
    ];

    // Treat thrown errors as invalid spot
    try {
      result = getCollision(me.area, x, y);
    } catch (e) {
      return false;
    }

    if (result === undefined) return false;

    switch (true) {
    case Skill.needFloor.includes(skill) && nonFloorAreas.includes(me.area):
      let isFloor = !!(result & (0 | sdk.collision.IsOnFloor));
      // this spot is not on the floor (lava (river/chaos, space (arcane), ect))
      if (!isFloor) {
        return false;
      }

      return !(result & sdk.collision.BlockWall); // outside lava area in abaddon returns coll 1
    case (mObject && (!!(result & sdk.collision.MonsterIsOnFloor) || !!(result & sdk.collision.MonsterObject))):
      // kinda dumb - monster objects have a collision that causes them to not be attacked
      // this should fix that
      return true;
    default:
      // Avoid non-walkable spots, objects - this preserves the orignal function and also physical attack skills will get here
      if ((result & sdk.collision.BlockWall) || (result & sdk.collision.Objects)) return false;

      break;
    }

    return true;
  },

  /**
   * @description Open chests when clearing
   * @param {number} range 
   * @param {number} [x=me.x] 
   * @param {number} [y=me.y] 
   * @returns {boolean}
   */
  openChests: function (range, x, y) {
    if (!Config.OpenChests.Enabled) return false;
    (typeof x !== "number" || typeof y !== "number") && ({ x, y } = me);
    range === undefined && (range = 10);

    let list = [];
    let ids = ["chest", "chest3", "weaponrack", "armorstand"];
    let unit = Game.getObject();

    if (unit) {
      do {
        if (unit.name && getDistance(unit, x, y) <= range
          && ids.includes(unit.name.toLowerCase())) {
          list.push(copyUnit(unit));
        }
      } while (unit.getNext());
    }

    while (list.length) {
      list.sort(Sort.units);

      if (Misc.openChest(list.shift())) {
        Pickit.pickItems();
      }
    }

    return true;
  },

  /**
   * @description build list of attackable monsters currently around us
   * @param {function(): boolean} check - callback function to build list
   * @returns {Array<Monster> | []}
   */
  buildMonsterList: function (check = () => true) {
    let monList = [];
    let monster = Game.getMonster();

    if (monster) {
      do {
        if (monster.attackable && check(monster)) {
          monList.push(copyUnit(monster));
        }
      } while (monster.getNext());
    }

    return monList;
  },

  /**
   * @param {Unit} unit 
   * @param {number} distance 
   * @param {number} spread 
   * @param {number} range 
   * @returns {{x: number, y: number}} x/y coords of safe spot
   */
  findSafeSpot: function (unit, distance, spread, range) {
    if (arguments.length < 4) throw new Error("deploy: Not enough arguments supplied");

    let index;
    let monList = [];
    let count = 999;

    monList = this.buildMonsterList();
    monList.sort(Sort.units);
    if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) return true;

    CollMap.getNearbyRooms(unit.x, unit.y);
    let grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

    if (!grid.length) return false;
    grid.sort((a, b) => getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y));

    for (let i = 0; i < grid.length; i += 1) {
      if (!(CollMap.getColl(grid[i].x, grid[i].y, true) & sdk.collision.BlockWall)
        && !CollMap.checkColl(unit, { x: grid[i].x, y: grid[i].y }, sdk.collision.Ranged)) {
        let currCount = this.getMonsterCount(grid[i].x, grid[i].y, range, monList);

        if (currCount < count) {
          index = i;
          count = currCount;
        }

        if (currCount === 0) {
          break;
        }
      }
    }

    if (typeof index === "number") {
      return {
        x: grid[index].x,
        y: grid[index].y,
      };
    }

    return false;
  },

  deploy: function (unit, distance, spread, range) {
    if (arguments.length < 4) throw new Error("deploy: Not enough arguments supplied");

    let safeLoc = this.findSafeSpot(unit, distance, spread, range);

    return (typeof safeLoc === "object" ? Pather.moveToUnit(safeLoc, 0) : false);
  },

  getMonsterCount: function (x, y, range, list) {
    let count = 0;
    let ignored = [sdk.monsters.Diablo]; // why is diablo ignored?

    for (let i = 0; i < list.length; i += 1) {
      if (ignored.indexOf(list[i].classid) === -1 && list[i].attackable
        && getDistance(x, y, list[i].x, list[i].y) <= range) {
        count += 1;
      }
    }

    // missile check?
    let fire = Game.getObject("fire");

    if (fire) {
      do {
        if (getDistance(x, y, fire.x, fire.y) <= 4) {
          count += 100;
        }
      } while (fire.getNext());
    }

    return count;
  },

  buildGrid: function (xmin, xmax, ymin, ymax, spread) {
    if (xmin >= xmax || ymin >= ymax || spread < 1) {
      throw new Error("buildGrid: Bad parameters");
    }

    let grid = [];

    for (let i = xmin; i <= xmax; i += spread) {
      for (let j = ymin; j <= ymax; j += spread) {
        let coll = CollMap.getColl(i, j, true);

        if (typeof coll === "number") {
          grid.push({ x: i, y: j, coll: coll });
        }
      }
    }

    return grid;
  },

  /**
  * @description checks if we should skip a monster
  * @param {Unit} unit
  * @returns {Boolean} If we should skip this monster
  */
  skipCheck: function (unit) {
    if (me.inArea(sdk.areas.ThroneofDestruction)) return false;
    if (unit.isSpecial && Config.SkipException && Config.SkipException.includes(unit.name)) {
      console.log("ÿc1Skip Exception: " + unit.name);
      return false;
    }

    if (Config.SkipId.includes(unit.classid)) return true;

    let tempArray = [];

    // EnchantLoop: // Skip enchanted monsters
    for (let i = 0; i < Config.SkipEnchant.length; i += 1) {
      tempArray = Config.SkipEnchant[i].toLowerCase().split(" and ");

      for (let j = 0; j < tempArray.length; j += 1) {
        switch (tempArray[j]) {
        case "extra strong":
          tempArray[j] = sdk.enchant.ExtraStrong;

          break;
        case "extra fast":
          tempArray[j] = sdk.enchant.ExtraFast;

          break;
        case "cursed":
          tempArray[j] = sdk.enchant.Cursed;

          break;
        case "magic resistant":
          tempArray[j] = sdk.enchant.MagicResistant;

          break;
        case "fire enchanted":
          tempArray[j] = sdk.enchant.FireEnchanted;

          break;
        case "lightning enchanted":
          tempArray[j] = sdk.enchant.LightningEnchanted;

          break;
        case "cold enchanted":
          tempArray[j] = sdk.enchant.ColdEnchanted;

          break;
        case "mana burn":
          tempArray[j] = sdk.enchant.ManaBurn;

          break;
        case "teleportation":
          tempArray[j] = sdk.enchant.Teleportation;

          break;
        case "spectral hit":
          tempArray[j] = sdk.enchant.SpectralHit;

          break;
        case "stone skin":
          tempArray[j] = sdk.enchant.StoneSkin;

          break;
        case "multiple shots":
          tempArray[j] = sdk.enchant.MultipleShots;

          break;
        }
      }

      if (tempArray.every(enchant => unit.getEnchant(enchant))) {
        return true;
      }
    }

    // ImmuneLoop: // Skip immune monsters
    for (let i = 0; i < Config.SkipImmune.length; i += 1) {
      tempArray = Config.SkipImmune[i].toLowerCase().split(" and ");

      // Infinity calculations are built-in
      if (tempArray.every(immnue => !Attack.checkResist(unit, immnue))) {
        return true;
      }
    }

    // AuraLoop: // Skip monsters with auras
    for (let i = 0; i < Config.SkipAura.length; i += 1) {
      let aura = Config.SkipAura[i].toLowerCase();

      switch (true) {
      case aura === "might" && unit.getState(sdk.states.Might):
      case aura === "blessed aim" && unit.getState(sdk.states.BlessedAim):
      case aura === "fanaticism" && unit.getState(sdk.states.Fanaticism):
      case aura === "conviction" && unit.getState(sdk.states.Conviction):
      case aura === "holy fire" && unit.getState(sdk.states.HolyFire):
      case aura === "holy freeze" && unit.getState(sdk.states.HolyFreeze):
      case aura === "holy shock" && unit.getState(sdk.states.HolyShock):
        return true;
      default:
        break;
      }
    }

    return false;
  },

  /**
   * @description Get element by skill number
   * @param {number} skillId 
   * @returns {"physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none" | false}
   */
  getSkillElement: function (skillId) {
    let elements = ["physical", "fire", "lightning", "magic", "cold", "poison", "none"];

    switch (skillId) {
    case sdk.skills.HolyFire:
      return "fire";
    case sdk.skills.HolyFreeze:
      return "cold";
    case sdk.skills.HolyShock:
      return "lightning";
    case sdk.skills.CorpseExplosion:
    case sdk.skills.Stun:
    case sdk.skills.Concentrate:
    case sdk.skills.Frenzy:
    case sdk.skills.MindBlast:
    case sdk.skills.Summoner:
      return "physical";
    case sdk.skills.HolyBolt:
      // no need to use this.elements array because it returns before going over the array
      return "holybolt";
    }

    let eType = getBaseStat("skills", skillId, "etype");

    return typeof (eType) === "number" ? elements[eType] : false;
  },

  /**
   * @description Get a monster's resistance to specified element
   * @param {Unit | Monster} unit 
   * @param {"physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none"} type 
   * @returns {number}
   */
  getResist: function (unit, type) {
    // some scripts pass empty units in throne room
    if (!unit || !unit.getStat) return 100;
    if (unit.isPlayer) return 0;

    switch (type) {
    case "physical":
      return unit.getStat(sdk.stats.DamageResist);
    case "fire":
      return unit.getStat(sdk.stats.FireResist);
    case "lightning":
      return unit.getStat(sdk.stats.LightningResist);
    case "magic":
      return unit.getStat(sdk.stats.MagicResist);
    case "cold":
      return unit.getStat(sdk.stats.ColdResist);
    case "poison":
      return unit.getStat(sdk.stats.PoisonResist);
    case "none":
      return 0;
    case "holybolt": // check if a monster is undead
      if (getBaseStat("monstats", unit.classid, "lUndead") || getBaseStat("monstats", unit.classid, "hUndead")) {
        return 0;
      }
      // eslint-disable-next-line no-fallthrough
    default:
      return 100;
    }
  },

  getLowerResistPercent: function () {
    const calc = (level) => Math.floor(Math.min(25 + (45 * ((110 * level) / (level + 6)) / 100), 70));
    if (Skill.canUse(sdk.skills.LowerResist)) {
      return calc(me.getSkill(sdk.skills.LowerResist, sdk.skills.subindex.SoftPoints));
    }
    return 0;
  },

  getConvictionPercent: function () {
    const calc = (level) => Math.floor(Math.min(25 + (5 * level), 150));
    if (me.expansion && this.checkInfinity()) {
      return calc(12);
    }
    if (Skill.canUse(sdk.skills.Conviction)) {
      return calc(me.getSkill(sdk.skills.Conviction, sdk.skills.subindex.SoftPoints));
    }
    return 0;
  },

  // Check if a monster is immune to specified attack type
  checkResist: function (unit, val, maxres = 100) {
    if (!unit || !unit.type || unit.isPlayer) return true;

    const damageType = typeof val === "number" ? this.getSkillElement(val) : val;
    const addLowerRes = !!(Skill.canUse(sdk.skills.LowerResist) && unit.curseable);

    // Static handler
    if (val === sdk.skills.StaticField && this.getResist(unit, damageType) < 100) {
      return unit.hpPercent > Config.CastStatic;
    }

    // TODO: sometimes unit is out of range of conviction so need to check that
    // baal in throne room doesn't have getState
    if (this.infinity && ["fire", "lightning", "cold"].includes(damageType) && unit.getState) {
      if (!unit.getState(sdk.states.Conviction)) {
        if (addLowerRes && !unit.getState(sdk.states.LowerResist)) {
          let lowerResPercent = this.getLowerResistPercent();
          return (this.getResist(unit, damageType) - (Math.floor((lowerResPercent + 85) / 5))) < 100;
        }
        return this.getResist(unit, damageType) < 117;
      }

      return this.getResist(unit, damageType) < maxres;
    }

    if (this.auradin && ["physical", "fire", "cold", "lightning"].includes(damageType)
      && me.getState(sdk.states.Conviction) && unit.getState) {
      let valid = false;

      // our main dps is not physical despite using zeal
      if (damageType === "physical") return true;

      if (!unit.getState(sdk.states.Conviction)) {
        return (this.getResist(unit, damageType) - (this.getConvictionPercent() / 5) < 100);
      }

      // check unit's fire resistance
      if (me.getState(sdk.states.HolyFire)) {
        valid = this.getResist(unit, "fire") < maxres;
      }

      // check unit's light resistance but only if the above check failed
      if (me.getState(sdk.states.HolyShock) && !valid) {
        valid = this.getResist(unit, "lightning") < maxres;
      }

      // check unit's cold resistance but only if the above checks failed - we might be using an Ice Bow
      if (me.getState(sdk.states.HolyFreeze) && !valid) {
        valid = this.getResist(unit, "cold") < maxres;
      }

      // TODO: maybe if still invalid at this point check physical resistance? Although if we are an auradin our physcial dps is low

      return valid;
    }

    if (addLowerRes && ["fire", "lightning", "cold", "poison"].includes(damageType) && unit.getState) {
      let lowerResPercent = this.getLowerResistPercent();
      if (!unit.getState(sdk.states.LowerResist)) {
        return (this.getResist(unit, damageType) - (Math.floor(lowerResPercent / 5)) < 100);
      }
    }

    return this.getResist(unit, damageType) < maxres;
  },

  /**
   * Check if we have valid skills to attack a monster
   * @param {Monster} unit 
   * @returns {boolean}
   */
  canAttack: function (unit) {
    if (unit.isMonster) {
      // Unique/Champion
      if (unit.isSpecial) {
        if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[1]))
          || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[2]))) {
          return true;
        }
      } else {
        if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[3]))
          || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[4]))) {
          return true;
        }
      }

      if (Config.AttackSkill.length === 7) {
        return Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[5]))
          || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[6]));
      }
    }

    return false;
  },

  /**
   * Detect use of bows/crossbows
   * @returns {string | false}
   */
  usingBow: function () {
    let item = me.getItem(-1, sdk.items.mode.Equipped);

    if (item) {
      do {
        if (item.isOnMain) {
          switch (item.itemType) {
          case sdk.items.type.Bow:
          case sdk.items.type.AmazonBow:
            return "bow";
          case sdk.items.type.Crossbow:
            return "crossbow";
          }
        }
      } while (item.getNext());
    }

    return false;
  },

  /**
   * Find an optimal attack position and move or walk to it
   * @param {Unit} unit 
   * @param {number} distance 
   * @param {number} coll 
   * @param {boolean} walk 
   * @param {boolean} force 
   * @returns {boolean} sucessfully found and moved into position
   */
  getIntoPosition: function (unit, distance, coll, walk, force) {
    if (!unit || !unit.x || !unit.y) return false;

    walk === true && (walk = 1);

    force && console.debug("Forcing new position");

    /**
     * @todo If we've disabled tele for walking clear, allow use of tele specifically for repositioning
     */
    if (distance < 4 && (!unit.hasOwnProperty("mode") || !unit.dead)) {
      if (walk) {
        if (unit.distance > 8 || checkCollision(me, unit, coll)) {
          Pather.walkTo(unit.x, unit.y, 3);
        }
      } else {
        Pather.moveTo(unit.x, unit.y, 0);
      }

      return !CollMap.checkColl(me, unit, coll);
    }

    let fullDistance = distance;
    const name = unit.hasOwnProperty("name") ? unit.name : "";
    const angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);
    const angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];
    const { x: orgX, y: orgY } = me;

    for (let n = 0; n < 3; n++) {
      const coords = [];
      n > 0 && (distance -= Math.floor(fullDistance / 3 - 1));

      for (let currAngle of angles) {
        const _angle = ((angle + currAngle) * Math.PI / 180);
        let cx = Math.round((Math.cos(_angle)) * distance + unit.x);
        let cy = Math.round((Math.sin(_angle)) * distance + unit.y);

        // ignore this spot as it's too close to our current position when we are forcing a new location
        if (force && [cx, cy].distance < distance) continue;
        if (Pather.checkSpot(cx, cy, sdk.collision.BlockWall, false)) {
          coords.push({ x: cx, y: cy });
        }
      }
      if (!coords.length) continue;

      coords.sort(Sort.units);

      for (let i = 0; i < coords.length; i += 1) {
        // Valid position found
        if (!CollMap.checkColl({ x: coords[i].x, y: coords[i].y }, unit, coll, 1)) {
          if ((() => {
            switch (walk) {
            case 1:
              return Pather.walkTo(coords[i].x, coords[i].y, 2);
            case 2:
              if (coords[i].distance < 6 && !CollMap.checkColl(me, coords[i], sdk.collision.WallOrRanged)) {
                return Pather.walkTo(coords[i].x, coords[i].y, 2);
              } else {
                return Pather.moveToEx(coords[i].x, coords[i].y, { retry: 1, allowPicking: !force });
              }
            default:
              return Pather.moveToEx(coords[i].x, coords[i].y, { retry: 1, allowPicking: !force });
            }
          })()) {
            if (Config.DebugMode.Path && force) {
              console.debug(
                "Sucessfully got into position. orginal Loc: " + orgX + "/" + orgY
                + " new loc " + me.x + "/" + me.y + " distance: " + [orgX, orgY].distance
              );
            }
            return true;
          }
        }
      }
    }

    !!name && console.log("ÿc4Attackÿc0: No valid positions for: " + name);

    return false;
  },

  /**
   * Find the nearest monster to us with optional exception parameters
   * @param {{ skipBlocked?: boolean, skipImmune?: boolean, skipGid?: number}} givenSettings 
   * @returns {Monster | false}
   */
  getNearestMonster: function (givenSettings = {}) {
    const settings = Object.assign({}, {
      skipBlocked: true,
      skipImmune: true,
      skipGid: -1,
    }, givenSettings);

    let gid;
    let monster = Game.getMonster();
    let range = 30;

    if (monster) {
      do {
        if (monster.attackable && !monster.getParent()) {
          let distance = getDistance(me, monster);

          if (distance < range
            && (settings.skipGid === -1 || monster.gid !== settings.skipGid)
            && (!settings.skipBlocked || !checkCollision(me, monster, sdk.collision.WallOrRanged))
            && (!settings.skipImmune || Attack.canAttack(monster))) {
            range = distance;
            gid = monster.gid;
          }
        }
      } while (monster.getNext());
    }

    return !!gid ? Game.getMonster(-1, -1, gid) : false;
  },

  /**
   * Check valid corpse for Redemption/Horking/Summoning
   * @param {Monster} unit 
   * @returns {boolean} valid corpse
   */
  checkCorpse: function (unit) {
    if (!unit || (unit.mode !== sdk.monsters.mode.Death && unit.mode !== sdk.monsters.mode.Dead)) return false;
    if (unit.classid <= sdk.monsters.BurningDeadArcher2 && !getBaseStat("monstats2", unit.classid, "corpseSel")) {
      return false;
    }
    return ([
      sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
      sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
    ].every(state => !unit.getState(state)));
  },

  /**
   * Get valid corpses for Redemption/Horking/Summoning
   * @param {Monster} unit 
   * @param {number} range 
   * @returns {Monster[]}
   */
  checkNearCorpses: function (unit, range = 15) {
    let corpses = getUnits(sdk.unittype.Monster).filter(function (corpse) {
      return getDistance(corpse, unit) <= range && Attack.checkCorpse(corpse);
    });
    return corpses.length > 0 ? corpses : [];
  },

  /**
   * @param {Monster} unit 
   * @returns {boolean}
   */
  whirlwind: function (unit) {
    if (!unit.attackable) return true;

    let angles = [180, 175, -175, 170, -170, 165, -165, 150, -150, 135, -135, 45, -45, 90, -90];

    unit.isSpecial && angles.unshift(120);

    me.runwalk = me.gametype;
    let angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);

    // get a better spot
    for (let i = 0; i < angles.length; i += 1) {
      let coords = [
        Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * 4 + unit.x),
        Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * 4 + unit.y)
      ];

      if (!CollMap.checkColl(me, { x: coords[0], y: coords[1] }, sdk.collision.BlockWall, 1)) {
        return Skill.cast(sdk.skills.Whirlwind, sdk.skills.hand.Right, coords[0], coords[1]);
      }
    }

    return (Attack.validSpot(unit.x, unit.y)
      && Skill.cast(sdk.skills.Whirlwind, Skill.getHand(sdk.skills.Whirlwind), me.x, me.y));
  }
};
