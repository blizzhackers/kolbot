/// <reference path="../../sdk/globals.d.ts" />
/**
 *  @filename    Attack.js
 *  @author      kolton, theBGuy
 *  @desc        handle player attacks
 *
 */


const Attack = {
  infinity: false,
  auradin: false,
  monsterObjects: new Set([
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
  ]),
  Result: {
    FAILED: 0,
    SUCCESS: 1,
    CANTATTACK: 2, // need to fix the ambiguity between this result and Failed
    NEEDMANA: 3,
    NOOP: 4, // used for clearing, if we didn't find any monsters to clear it's not exactly a success or fail
    FAILED_POSITION: 5,
  },
  /**
   * Track bosses killed
   * @type {Set<number | string>}
   */
  _killed: new Set(),

  /**
   * @param {number | string} id 
   * @returns {boolean}
   */
  haveKilled: function (id) {
    return this._killed.has(id);
  },

  // Initialize attacks
  /**
   * Load the class attack file and prime attack state (primary slot, skills, infinity/auradin flags)
   * @param {boolean} [notify] Warn on console when the configured attack skills are unusable
   */
  init: function (notify = true) {
    // TODO: properly handle loading wereform and custom files so they work with LazyLoader and get the correct types
    if (Config.Wereform) {
      ClassAttack.load(me.classid, require("./Attacks/Wereform"));
    } else if (Config.CustomClassAttack && FileTools.exists("libs/core/Attacks/" + Config.CustomClassAttack + ".js")) {
      console.log("Loading custom attack file");
      ClassAttack.load(me.classid, require("./Attacks/" + Config.CustomClassAttack));
    } else {
      ClassAttack.load(me.classid);
    }

    if (notify && (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0)) {
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
   * @param {Monster} unit 
   * @returns {[number, number] | boolean}
   * @todo add checking for other options than just name/classid
   *  - option for based on spectype
   *  - option for based on enchant/aura
   */
  getCustomAttack: function (unit) {
    // Check if unit got invalidated
    if (!unit || !unit.name || !copyUnit(unit).x) return false;
    
    for (let el of Config.AdvancedCustomAttack) {
      if (el.hasOwnProperty("check") && el.hasOwnProperty("attack")) {
        if (typeof el.check === "function" && el.check(unit)) {
          return el.attack;
        }
      }
    }
    
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
   * @param {Monster} unit 
   * @returns {[number, number] | boolean}
   * @todo add checking for other options than just name/classid
   *  - option for based on spectype
   *  - option for based on enchant/aura
   */
  getCustomPreAttack: function (unit) {
    // Check if unit got invalidated
    if (!unit || !unit.name || !copyUnit(unit).x) return false;
    
    for (let el of Config.AdvancedCustomAttack) {
      if (el.hasOwnProperty("check") && el.hasOwnProperty("preAttack")) {
        if (typeof el.check === "function" && el.check(unit)) {
          return el.preAttack;
        }
      }
    }
    
    for (let i in Config.CustomPreAttack) {
      if (Config.CustomPreAttack.hasOwnProperty(i)) {
        // if it contains numbers but is a string, convert to an int
        if (typeof i === "string" && i.match(/\d+/g)) {
          // @ts-ignore
          i = parseInt(i, 10);
        }

        switch (typeof i) {
        case "string":
          if (unit.name.toLowerCase() === i.toLowerCase()) {
            return Config.CustomPreAttack[i];
          }

          break;
        case "number":
          if (unit.classid === i) {
            return Config.CustomPreAttack[i];
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
   * @param {Monster | number | string} classId 
   * @returns {boolean} If we managed to kill the unit
   */
  kill: function (classId) {
    if (!classId || Config.AttackSkill[1] < 0) return false;
    let target = (typeof classId === "object"
      ? classId
      : Misc.poll(() => Game.getMonster(classId), 2000, 100));

    if (!target) {
      if (Attack._killed.has(classId)) {
        console.log("ÿc7Killed ÿc0:: " + classId);
        return true;
      }
      console.warn("Attack.kill: Target not found");
      return Attack.clear(10);
    }

    /**
     * @param {number} gid 
     * @param {PathNode} loc 
     * @returns {Monster | boolean}
     */
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
    const primarySlot = Attack.getPrimarySlot(); // for mfswitch
    const currentScript = Loader.scriptName(0).toLowerCase();

    let retry = 0;
    let errorInfo = "";
    let attackCount = 0;

    let lastLoc = { x: me.x, y: me.y };
    let tick = getTickCount();
    console.log("ÿc7Kill ÿc0:: " + who);

    if (Config.MFLeader
      // mfhelper is disabled for these scripts so announcing is pointless
      && !currentScript.includes("diablo")
      && !currentScript.includes("baal")
      && !me.inArea(sdk.areas.UberTristram)
      && Pather.makePortal()) {
      say("kill " + classId);
    }

    try {
      while (attackCount < Config.MaxAttackCount && target.attackable && !Attack.skipCheck(target)) {
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
        if (Config.MFSwitchPercent && target.hpPercent < Config.MFSwitchPercent) {
          me.switchWeapons(primarySlot ^ 1);
        }

        if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
          Packet.flash(me.gid);
        }

        let result = ClassAttack[me.classid].doAttack(target, attackCount % 15 === 0);

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
      Config.MFSwitchPercent && me.switchWeapons(primarySlot);
      ClassAttack[me.classid].afterAttack();
      Pickit.pickItems();

      if (!!target && target.attackable) {
        console.warn("ÿc1Failed to kill ÿc0" + who + errorInfo);
      } else {
        if (target.dead && (target.isBoss || target.uniqueid > -1)) {
          // a little obnoxious, but we need to track bosses killed and this handles if we are attempting to check by id or name
          target.isBoss && Attack._killed.add(target.classid);
          target.uniqueid > -1 && Attack._killed.add(target.name);
        }
        console.log("ÿc7Killed ÿc0:: " + who + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick));
      }

      return (!target || !copyUnit(target).x || target.dead || !target.attackable);
    } finally {
      // make sure we switch back to primary weapon
      if (Config.MFSwitchPercent) {
        me.switchWeapons(primarySlot);
      }
    }
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
      let result = ClassAttack[me.classid].doAttack(target, attackCount % 15 === 0);

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
   * @typedef {Object} ClearOptions
   * @property {number} spectype
   * @property {number | Unit} bossId
   * @property {(a: T, b: T) => number} sortfunc
   * @property {boolean} pickit
   * @property {(unit: Monster) => boolean} filter
   * @property {() => any} onLoop - Called on each iteration of the main loop
   * @property {() => boolean} earlyExit - If returns true, exit the clearing loop. Called on each iteration of the main loop
   * @property {() => void} onCleared - Called after all clearing is complete
   */

  /**
   * @description Clear monsters in a section based on range and spectype or clear monsters around a boss monster
   * @param {number} range
   * @param {Partial<ClearOptions>} opts
   * @returns {boolean}
   */
  clearEx: function (range, opts = {}) {
    if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
      return false;
    }

    if (typeof (range) !== "number") {
      throw new Error("Attack.clear: range must be a number.");
    }

    while (!me.gameReady) {
      delay(40);
    }

    range === undefined && (range = 25);
    
    const { spectype, bossId, sortfunc, filter, onLoop, pickit, earlyExit, onCleared } = Object.assign({
      spectype: sdk.monsters.spectype.All,
      bossId: undefined,
      sortfunc: Attack.sortMonsters,
      pickit: true,
      filter: undefined,
      onLoop: undefined,
      earlyExit: undefined,
      onCleared: undefined,
    }, opts);

    /**
     * @param {unknown} unit 
     * @returns {boolean}
     */
    const isMonsterUnit = function (unit) {
      return unit && typeof unit === "object" && unit.type === sdk.unittype.Monster;
    };
    
    /** @type {Map<number, { attacks: number, name: string }} */
    const attacks = new Map();
    let boss, orgx, orgy, start, skillCheck;
    let tick = getTickCount();
    let [killedBoss, logged] = [false, false];
    let [retry, attackCount] = [0, 0];

    if (bossId) {
      if (Attack.haveKilled(bossId)) {
        console.log("ÿc7Cleared ÿc0:: " + (isMonsterUnit(bossId) ? bossId.name : bossId));
        return true;
      }
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
        // bypass UberTristram check, we can't make a portal there
        && (me.inArea(sdk.areas.UberTristram) || Pather.makePortal())) {
        say("clear " + (["number", "string"].includes(typeof bossId) ? bossId : bossId.name));
      }
    } else {
      ({ orgx, orgy } = { orgx: me.x, orgy: me.y });
    }

    /** @type {Monster[]} */
    let monsterList = [];
    let target = Game.getMonster();

    if (target) {
      do {
        if (typeof filter === "function" && !filter(target)) continue;
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

    // sometimes boss doesn't get added to monsterList due to distance but we want them in it anyway
    if (boss && !monsterList.some((mon) => mon.gid === boss.gid)) {
      console.log("Adding boss to monsterList");
      monsterList.push(copyUnit(boss));
    }

    while (start && monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
      if (me.dead) return false;
      if (typeof onLoop === "function") {
        onLoop();
      }

      if (typeof earlyExit === "function" && earlyExit()) {
        console.log("ÿc7Cleared ÿc0:: Early exit condition met");
        break;
      }
      
      boss && (({ orgx, orgy } = { orgx: boss.x, orgy: boss.y }));
      monsterList.sort(sortfunc);
      target = Game.getMonster(-1, -1, monsterList[0].gid);

      if (
        (target && target.x !== undefined)
        && (
          getDistance(target, orgx, orgy) <= range
          || (this.getScarinessLevel(target) > 7 && target.distance <= range)
        )
          && target.attackable
      ) {
        Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
        tick = getTickCount();

        if (!logged && boss && boss.gid === target.gid) {
          logged = true;
          console.log("ÿc7Clear ÿc0:: " + (!!target.name ? target.name : bossId));
        }

        let _currMon = attacks.get(target.gid);
        const checkAttackSkill = (!!_currMon && _currMon.attacks % 15 === 0);
        const result = ClassAttack[me.classid].doAttack(target, checkAttackSkill);

        if (result) {
          retry = 0;

          if (result === this.Result.CANTATTACK) {
            monsterList.shift();

            continue;
          } else if (result === this.Result.NEEDMANA) {
            continue;
          }

          if (!_currMon) {
            _currMon = { attacks: 0, name: target.name };
            attacks.set(target.gid, _currMon);
          }

          _currMon.attacks += 1;
          attackCount += 1;
          const isSpecial = target.isSpecial;
          const secAttack = me.barbarian ? (isSpecial ? 2 : 4) : 5;
          const checkSkill = Config.AttackSkill[isSpecial ? 1 : 3];
          const hammerCheck = me.classid === sdk.player.class.Paladin && checkSkill === sdk.skills.BlessedHammer;

          if (Config.AttackSkill[secAttack] > -1
            && (
              !Attack.checkResist(target, checkSkill)
              || (hammerCheck && !ClassAttack[me.classid].getHammerPosition(target)))
          ) {
            skillCheck = Config.AttackSkill[secAttack];
          } else {
            skillCheck = checkSkill;
          }

          // Desync/bad position handler
          switch (skillCheck) {
          case sdk.skills.BlessedHammer:
            // Tele in random direction with Blessed Hammer
            if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 4 : 2) === 0) {
              Pather.randMove(-1, 1, -1, 1, 5);
            }

            break;
          default:
            // Flash with melee skills
            if (_currMon.attacks > 0
              && _currMon.attacks % (isSpecial ? 15 : 5) === 0
              && Skill.getRange(skillCheck) < 4) {
              Packet.flash(me.gid);
              // It'd be helpful to get a position in the opposite direction of the monster move there and then move back
              // Pather.moveTo(me.x + (me.x - target.x), me.y + (me.y - target.y));
              console.debug("ÿc1Flashing " + target.name + " " + target.gid + " " + _currMon.attacks);
              // Pather.randMove(-1, 1, -1, 1, 3);
              
            }

            break;
          }

          // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
          if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && _currMon.attacks > 15) {
            console.log("ÿc1Skipping " + target.name + " " + target.gid + " " + _currMon.attacks);
            monsterList.shift();
          }

          /** @todo allow for more aggressive horking here */
          if (target.dead || Config.FastPick || Config.FastFindItem) {
            if ((target.isBoss || target.uniqueid > 0) && target.dead) {
              // TODO: add uniqueids to sdk
              target.isBoss && Attack._killed.add(target.classid);
              target.uniqueid > -1 && Attack._killed.add(target.name);
            }
            if (boss && boss.gid === target.gid && target.dead) {
              killedBoss = true;
              console.log(
                "ÿc7Cleared ÿc0:: " + (!!target.name ? target.name : bossId)
                + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
              );
            }
            if (Config.FastFindItem && pickit && me.classid === sdk.player.class.Barbarian) {
              ClassAttack[me.classid].findItem();
            }
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
      ClassAttack[me.classid].afterAttack(pickit);
      Attack.openChests(range, orgx, orgy);
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

    if (typeof onCleared === "function") {
      onCleared();
    }

    return true;
  },

  /**
   * @todo Refactor so this can accept prebuilt monsterlist, we have repeat logic with this and clearList
   * @description Clear monsters in a section based on range and spectype or clear monsters around a boss monster
   * @param {number} [range=25] 
   * @param {number} [spectype=0] 
   * @param {number | Unit} [bossId] 
   * @param {(a: T, b: T) => number} [sortfunc] 
   * @param {boolean} [pickit] 
   * @param {(unit: Monster) => boolean} [shouldAttackCb]
   * @returns {AttackResult}
   * @todo change to passing an object
   */
  clear: function (range, spectype, bossId, sortfunc, pickit = true, shouldAttackCb = () => true) {
    while (!me.gameReady) {
      delay(40);
    }

    if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
      return Attack.Result.FAILED;
    }

    range === undefined && (range = 25);
    spectype === undefined && (spectype = 0);
    bossId === undefined && (bossId = false);
    sortfunc === undefined && (sortfunc = false);
    !sortfunc && (sortfunc = this.sortMonsters);

    if (typeof (range) !== "number") {
      throw new Error("Attack.clear: range must be a number.");
    }

    /** @type {Map<number, { attacks: number, name: string }} */
    const attacks = new Map();
    let boss, orgx, orgy, start, skillCheck;
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
        // bypass UberTristram check, we can't make a portal there
        && (me.inArea(sdk.areas.UberTristram) || Pather.makePortal())
      ) {
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

    // sometimes boss doesn't get added to monsterList due to distance but we want them in it anyway
    if (boss && !monsterList.some((mon) => mon.gid === boss.gid)) {
      monsterList.push(copyUnit(boss));
    }

    while (start && monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
      if (me.dead) return Attack.Result.FAILED;
      
      boss && (({ orgx, orgy } = { orgx: boss.x, orgy: boss.y }));
      monsterList.sort(sortfunc);
      target = Game.getMonster(-1, -1, monsterList[0].gid);

      if (
        target
        && target.x !== undefined
        && shouldAttackCb(target)
        && (
          getDistance(target, orgx, orgy) <= range
          || (this.getScarinessLevel(target) > 7 && target.distance <= range)
        )
        && target.attackable
      ) {
        Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
        tick = getTickCount();

        if (!logged && boss && boss.gid === target.gid) {
          logged = true;
          console.log("ÿc7Clear ÿc0:: " + (!!target.name ? target.name : bossId));
        }
        // me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

        let _currMon = attacks.get(target.gid);
        const checkAttackSkill = (!!_currMon && _currMon.attacks % 15 === 0);
        
        if (Config.ChargeCast.skill > -1
          && Config.ChargeCast.spectype
          && !(target.spectype & Config.ChargeCast.spectype)) {
          // custom handling here, we want to find a valid monster to use our skill on
          // if we wait until they are the current target, it may be pointless
          let cRange = Skill.getRange(Config.ChargeCast.skill);
          let cState = Skill.getState(Config.ChargeCast.skill);
          let chargeTarget = monsterList.find(function (mon) {
            return (
              (mon.spectype & Config.ChargeCast.spectype)
              && (mon.distance <= cRange)
              && (!cState || !mon.getState(cState))
              && !checkCollision(me, mon, sdk.collision.LineOfSight)
            );
          });
          if (chargeTarget && chargeTarget.gid !== target.gid) {
            Attack.doChargeCast(chargeTarget);
          }
        }
        
        const result = ClassAttack[me.classid].doAttack(target, checkAttackSkill);

        if (result) {
          retry = 0;

          if (result === this.Result.CANTATTACK) {
            monsterList.shift();

            continue;
          } else if (result === this.Result.NEEDMANA) {
            continue;
          }

          if (!_currMon) {
            _currMon = { attacks: 0, name: target.name };
            attacks.set(target.gid, _currMon);
          }

          _currMon.attacks += 1;
          attackCount += 1;

          if (result === this.Result.FAILED_POSITION && _currMon.attacks < 15) {
            // push to the end of the list to try later
            monsterList.push(monsterList.shift());
            console.debug("ÿc1Requeuing " + target.name + " " + target.gid + " " + _currMon.attacks);
            continue;
          }

          const isSpecial = target.isSpecial;
          const secAttack = me.barbarian ? (isSpecial ? 2 : 4) : 5;
          const checkSkill = Config.AttackSkill[isSpecial ? 1 : 3];
          const hammerCheck = me.classid === sdk.player.class.Paladin && checkSkill === sdk.skills.BlessedHammer;

          if (Config.AttackSkill[secAttack] > -1
            && (
              !Attack.checkResist(target, checkSkill)
              || (hammerCheck && !ClassAttack[me.classid].getHammerPosition(target)))
          ) {
            skillCheck = Config.AttackSkill[secAttack];
          } else {
            skillCheck = checkSkill;
          }

          // Desync/bad position handler
          switch (skillCheck) {
          case sdk.skills.BlessedHammer:
            // Tele in random direction with Blessed Hammer
            if (_currMon.attacks > 0 && _currMon.attacks % (isSpecial ? 4 : 2) === 0 && Pather.useTeleport()) {
              Pather.randMove(-1, 1, -1, 1, 5);
            }

            break;
          default:
            // Flash with melee skills
            if (_currMon.attacks > 0
              && _currMon.attacks % (isSpecial ? 15 : 5) === 0
              && Skill.getRange(skillCheck) < 4
            ) {
              // It'd be helpful to get a position in the opposite direction of the monster move there and then move back
              Packet.flash(me.gid);
            }

            break;
          }

          // Skip non-unique monsters after 15 attacks, except in Throne of Destruction
          if (!me.inArea(sdk.areas.ThroneofDestruction) && !isSpecial && _currMon.attacks > 15) {
            console.log("ÿc1Skipping " + target.name + " " + target.gid + " " + _currMon.attacks);
            monsterList.shift();
          }

          /** @todo allow for more aggressive horking here */
          if (target.dead || Config.FastPick || Config.FastFindItem) {
            if ((target.isBoss || target.uniqueid > 0) && target.dead) {
              // TODO: add uniqueids to sdk
              target.isBoss && Attack._killed.add(target.classid);
              target.uniqueid > -1 && Attack._killed.add(target.name);
            }
            if (boss && boss.gid === target.gid && target.dead) {
              killedBoss = true;
              console.log(
                "ÿc7Cleared ÿc0:: " + (!!target.name ? target.name : bossId)
                + "ÿc0 - ÿc7Duration: ÿc0" + Time.format(getTickCount() - tick)
              );
            }
            if (Config.FastFindItem && pickit && me.classid === sdk.player.class.Barbarian) {
              ClassAttack[me.classid].findItem();
            }
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
      ClassAttack[me.classid].afterAttack(pickit);
      Misc.openChests(range, orgx, orgy);
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
        
        return Attack.Result.FAILED;
      }
    }

    return attackCount > 0 ? Attack.Result.SUCCESS : Attack.Result.NOOP;
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
    /** @type {Monster} */
    let monster;

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
        let result = ClassAttack[me.classid].doAttack(target, attackCount % 15 === 0);

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

          if (target.dead || Config.FastPick || Config.FastFindItem) {
            if ((target.isBoss || target.uniqueid > 0) && target.dead) {
              // TODO: add uniqueids to sdk
              target.isBoss && Attack._killed.add(target.classid);
              target.uniqueid > -1 && Attack._killed.add(target.name);
            }
            if (Config.FastFindItem && me.classid === sdk.player.class.Barbarian) {
              ClassAttack[me.classid].findItem();
            }
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
      ClassAttack[me.classid].afterAttack(true);
      Misc.openChests(Config.OpenChests.Range);
      Pickit.pickItems();
    } else {
      Precast.doPrecast(false); // we didn't attack anything but check if we need to precast. TODO: better method of keeping track of precast skills
    }

    return true;
  },

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {Attack.SecurePositionOptions} [options]
   * @returns {boolean}
   */
  securePosition: function (x, y, options = {}) {
    let tick;

    (typeof x !== "number" || typeof y !== "number") && ({ x, y } = me);
    const node = new PathNode(x, y);
    /** @type {Required<Attack.SecurePositionOptions>} */
    const clearOptions = Object.assign({
      range: 15,
      timer: 3000,
      skipBlocked: true,
      useRedemption: false,
      skipIds: [],
      timeout: Time.minutes(5),
    }, options);
    clearOptions.skipBlocked === true && (clearOptions.skipBlocked = sdk.collision.Ranged);

    const startTime = getTickCount();
    const { range, timer, skipBlocked, useRedemption, skipIds, timeout } = clearOptions;

    while (true) {
      node.distance > 5 && Pather.moveTo(node.x, node.y);

      let monster = Game.getMonster();
      let monList = [];

      if (monster) {
        do {
          if (skipIds.includes(monster.classid)) continue;
          if (getDistance(monster, node.x, node.y) <= range && monster.attackable && this.canAttack(monster)
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
          return true;
        }
      } else {
        this.clearList(monList);

        // reset the timer when there's monsters in range
        tick && (tick = false);
      }

      if (useRedemption) {
        if (me.paladin && Skill.canUse(sdk.skills.Redemption)
          && Skill.setSkill(sdk.skills.Redemption, sdk.skills.hand.Right)) {
          delay(1000);
        }
      }

      if (timeout && getTickCount() - startTime >= timeout) {
        console.warn("ÿc1Attack.securePosition: Timeout reached, giving up.");
        return false;
      }

      delay(100);
    }
  },

  /** @description Count uniques in current area within getUnit range */
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
   * @description Clear an entire area based on monster spectype using nearestNeighbourSearch
   * @param {number} spectype 
   * @param {() => boolean} [cb] callback to end clearing early
   * @returns {boolean}
   */
  clearLevelWalk: function (spectype, cb = null) {
    const Graph = require("../modules/Graph");
    
    try {
      console.info(true, getAreaName(me.area), "clearLevelWalk-nearestNeighbourSearch");
      let graph = new Graph();
      Graph.adaptiveSearch(graph, function (room) {
        if (typeof cb === "function" && cb()) {
          throw new ScriptError("Clearing stopped by callback");
        }
        const roomNode = new PathNode(room.walkableX, room.walkableY);
        Pather.move(roomNode, { callback: cb, clearSettings: { clearPath: true } });
        Attack.clearEx(room.xsize, {
          spectype: spectype || 0,
          /**
           * Restrict this clear to monsters standing inside the room currently being explored
           * @param {Monster} unit
           * @returns {boolean}
           */
          filter: function (unit) {
            return unit && room.coordsInRoom(unit.x, unit.y);
          }
        });
      }, "walk");
    } catch (e) {
      if (!(e instanceof ScriptError)) {
        console.error(e);
      }
    } finally {
      CollMap.removeHooks();
      console.info(false, getAreaName(me.area), "clearLevelWalk-nearestNeighbourSearch");
    }
  },

  /**
   * @description Clear a single room based on monster spectype
   * @param {Room} room - The room to clear
   * @param {number} spectype - The monster spectype to clear
   * @returns {boolean}
   */
  clearRoom: function (room, spectype = 0) {
    /**
     * Walkable center of a room, falling back to the geometric center when nothing walkable is near
     * @param {Room} room
     * @returns {[number, number]}
     */
    function getCenter(room) {
      let centerX = room.x * 5 + room.xsize / 2;
      let centerY = room.y * 5 + room.ysize / 2;

      let adjusted = Pather.getNearestWalkable(centerX, centerY, 18, 3);
      return adjusted ? [adjusted[0], adjusted[1]] : [centerX, centerY];
    }

    const currentArea = getArea().id;

    const myRoom = getCenter(room);
    const result = Pather.getNearestWalkable(myRoom[0], myRoom[1], 18, 3);
    /** @param {Monster} unit */
    const shouldAttack = function (unit) {
      return CollMap.coordsInRoom(unit.x, unit.y, room);
    };

    if (result) {
      if (Config.DebugMode.Path) {
        CollMap.drawRoom(room, "green", true);
      }
      let node = new PathNode(result[0], result[1]);

      Pather.move(
        node,
        { retry: 3, clearSettings: { specType: spectype, clearPath: (!Pather.canTeleport()) } }
      );

      if (!this.clear(60, spectype, undefined, undefined, undefined, shouldAttack)) {
        return false;
      }
    } else if (currentArea !== getArea().id) {
      // Make sure bot does not get stuck in different area.
      Pather.moveToEx(
        myRoom[0], myRoom[1],
        { retry: 3, clearSettings: { specType: spectype, clearPath: (!Pather.canTeleport()) } }
      );
    }

    CollMap.removeHookForRoom(room);

    return true;
  },

  /**
   * @description Clear an entire area based on monster spectype
   * @param {number} spectype 
   * @param {() => boolean} [cb] callback to end clearing early
   * @returns {boolean}
   */
  clearLevel: function (spectype = 0, cb = null) {
    /**
     * Order rooms by straight-line distance from the room we are standing in
     * @param {[number, number, Room]} a
     * @param {[number, number, Room]} b
     * @returns {number} comparator: negative if a is closer, positive if b is closer, 0 if equal
     */
    function RoomSort (a, b) {
      return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
    }

    /**
     * Order rooms by walking distance from the room we are standing in
     * @param {[number, number, Room]} a
     * @param {[number, number, Room]} b
     * @returns {number} comparator: negative if a is closer, positive if b is closer, 0 if equal
     */
    function _walkingRoomSort (a, b) {
      let aDist = Pather.getWalkDistance(a[0], a[1], me.area, myRoom[0], myRoom[1]);
      let bDist = Pather.getWalkDistance(b[0], b[1], me.area, myRoom[0], myRoom[1]);
      return aDist - bDist;
    }

    /**
     * @param {Room} room 
     * @returns {[number, number]}
     */
    function getCenter (room) {
      let centerX = room.x * 5 + room.xsize / 2;
      let centerY = room.y * 5 + room.ysize / 2;

      let adjusted = Pather.getNearestWalkable(centerX, centerY, 18, 3);
      return adjusted ? [adjusted[0], adjusted[1]] : [centerX, centerY];
    }

    let room = getRoom();
    if (!room) return false;

    const canTele = Pather.canTeleport();
    const currentArea = getArea().id;
    const dungeons = [
      sdk.areas.DenofEvil,
      sdk.areas.HoleLvl1,
      sdk.areas.HoleLvl2,
      sdk.areas.PitLvl1,
      sdk.areas.PitLvl2,
      sdk.areas.CaveLvl1,
      sdk.areas.CaveLvl2,
      sdk.areas.UndergroundPassageLvl1,
      sdk.areas.UndergroundPassageLvl2,
      sdk.areas.TowerCellarLvl1,
      sdk.areas.TowerCellarLvl2,
      sdk.areas.TowerCellarLvl3,
      sdk.areas.TowerCellarLvl4,
      sdk.areas.TowerCellarLvl5,
      sdk.areas.Crypt,
      sdk.areas.Mausoleum,
      sdk.areas.A2SewersLvl1,
      sdk.areas.A2SewersLvl2,
      sdk.areas.A2SewersLvl3,
      sdk.areas.StonyTombLvl1,
      sdk.areas.StonyTombLvl2,
      sdk.areas.HallsoftheDeadLvl1,
      sdk.areas.HallsoftheDeadLvl2,
      sdk.areas.HallsoftheDeadLvl3,
      sdk.areas.MaggotLairLvl1,
      sdk.areas.MaggotLairLvl2,
      sdk.areas.MaggotLairLvl3,
      sdk.areas.AncientTunnels,
      sdk.areas.ClawViperTempleLvl1,
      sdk.areas.ClawViperTempleLvl2,
      sdk.areas.TalRashasTomb1,
      sdk.areas.TalRashasTomb2,
      sdk.areas.TalRashasTomb3,
      sdk.areas.TalRashasTomb4,
      sdk.areas.TalRashasTomb5,
      sdk.areas.TalRashasTomb6,
      sdk.areas.TalRashasTomb7,
    ];

    if (!canTele && dungeons.includes(me.area) && (Config.DebugMode.Path || Config.UseExperimentalClearLevel)) {
      return Attack.clearLevelWalk(spectype, cb);
    }
    console.time("clearLevel");
    console.info(true, getAreaName(me.area));

    let myRoom, previousArea;
    let rooms = [];
    let count = 0;
    /** @type {Text[]} */
    let hooks = [];

    /** @param {Text} hook */
    const clearHook = function (hook) {
      hook && hook.remove();
    };

    do {
      rooms.push([...getCenter(room), copyObj(room)]);
    } while (room.getNext());
    
    if (Config.MFLeader && rooms.length > 0) {
      Pather.makePortal();
      console.log("clearlevel " + getAreaName(currentArea));
      say("clearlevel " + me.area);
    }

    while (rooms.length > 0) {
      // get the first room + initialize myRoom var
      !myRoom && (room = getRoom(me.x, me.y));

      if (typeof cb === "function" && cb()) {
        break;
      }

      if (room) {
        // use previous room to calculate distance
        if (room instanceof Array) {
          myRoom = [room[0], room[1]];
        } else {
          // create a new room to calculate distance (first room, done only once)
          myRoom = getCenter(room);
        }
      }

      rooms.sort(RoomSort);
      room = rooms.shift();

      let result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

      if (result) {
        if (Config.DebugMode.Path) {
          CollMap.drawRoom(room[2], "green");
          hooks.push(new Text((++count).toString(), room[0], room[1], 2, 1, null, true));
        }
        let node = new PathNode(result[0], result[1]);
        
        if (node.distance < 20 && !canTele && node.mobCount() === 0) {
          if (Config.DebugMode.Path) {
            console.debug("ÿc1Skipping room " + room[0] + " " + room[1]);
            CollMap.drawRoom(room[2], "red", true);
          }
        } else {
          Pather.move(
            node,
            { retry: 3, clearSettings: { specType: spectype, clearPath: (!Pather.canTeleport()) } }
          );
        }
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
    CollMap.removeHooks();
    hooks.forEach(clearHook);
    console.info(false, getAreaName(currentArea), "clearLevel");

    return true;
  },

  /**
   * @description Sort monsters based on distance, spectype and classId (summoners are attacked first)
   * @param {Monster} unitA 
   * @param {Monster} unitB 
   * @returns {number} comparator: negative if unitA should be attacked first, positive if unitB, 0 if equal
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
    let mObject = Attack.monsterObjects.has(unitid);
    let nonFloorAreas = [
      sdk.areas.ArcaneSanctuary, sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary,
      sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit
    ];

    // Treat thrown errors as invalid spot
    try {
      result = getCollision(me.area, x, y);
    } catch (e) {
      if (e instanceof ScriptError) {
        throw e;
      }
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
   * @deprecated - Use Misc.openChests instead
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
   * @returns {PathNode} x/y coords of safe spot
   */
  findSafeSpot: function (unit, distance, spread, range) {
    if (arguments.length < 4) throw new Error("deploy: Not enough arguments supplied");

    let index;
    let count = 999;

    let monList = this.buildMonsterList();
    monList.sort(Sort.units);
    
    if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) {
      return new PathNode(me.x, me.y);
    }

    CollMap.getNearbyRooms(unit.x, unit.y);
    const grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

    if (!grid.length) return false;
    grid.sort(Sort.makeComparator(function (a) {
      return -getDistance(a.x, a.y, unit.x, unit.y);
    }));

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
      return new PathNode(grid[index].x, grid[index].y);
    }

    return false;
  },

  /**
   * Move to the least crowded spot around a unit
   * @param {Unit} unit
   * @param {number} distance Max offset from the unit the spot may be
   * @param {number} spread Grid step used when sampling candidate spots
   * @param {number} range Radius each candidate spot is scored for nearby monsters
   * @returns {boolean} Successfully moved to a safe spot
   */
  deploy: function (unit, distance, spread, range) {
    if (arguments.length < 4) {
      throw new Error("deploy: Not enough arguments supplied");
    }

    let safeLoc = this.findSafeSpot(unit, distance, spread, range);

    return (typeof safeLoc === "object" ? Pather.moveToUnit(safeLoc, 0) : false);
  },

  /**
   * Count attackable monsters within range of a spot, heavily penalizing spots standing in fire
   * @param {number} x
   * @param {number} y
   * @param {number} range
   * @param {Monster[]} list Pre-built monster list to check against
   * @returns {number}
   */
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

  /**
   * Build evenly spaced coords over a rectangle, keeping only those with known collision data
   * @param {number} xmin
   * @param {number} xmax
   * @param {number} ymin
   * @param {number} ymax
   * @param {number} spread Distance between sampled coords
   * @returns {(PathNode & { coll: number })[]}
   * @throws {Error} If the rectangle is inverted or spread is less than 1
   */
  buildGrid: function (xmin, xmax, ymin, ymax, spread) {
    if (xmin >= xmax || ymin >= ymax || spread < 1) {
      throw new Error("buildGrid: Bad parameters");
    }

    /** @type {(PathNode & { coll: number })[]} */
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
  * @param {Monster} unit
  * @returns {Boolean} If we should skip this monster
  */
  skipCheck: function (unit) {
    if (me.inArea(sdk.areas.ThroneofDestruction)) return false;
    if (unit.isSpecial && Config.SkipException.length && Config.SkipException.includes(unit.name)) {
      console.log("ÿc1Skip Exception: " + unit.name);
      return false;
    }

    if (Config.SkipId.includes(unit.classid)) {
      return true;
    }

    if (Config.AdvancedSkipCheck.length) {
      for (let check of Config.AdvancedSkipCheck) {
        if (typeof check === "function") {
          if (check(unit)) {
            return true;
          }
        } else if (typeof check === "object") {
          let shouldSkip = Object.keys(check).length > 0;

          for (let key in check) {
            switch (key) {
            case "classid":
              if (check[key] === (unit.classid)) {
                shouldSkip = shouldSkip && true;
              } else {
                shouldSkip = false;
              }
              break;
            case "name":
              if (check[key].includes(unit.name.toLowerCase())) {
                shouldSkip = shouldSkip && true;
              } else {
                shouldSkip = false;
              }
              break;
            case "spectype":
              if (check[key] === (unit.spectype)) {
                shouldSkip = shouldSkip && true;
              } else {
                shouldSkip = false;
              }
              break;
            case "enchant":
              if (Array.isArray(check[key])) {
                let skipEnchant = check[key].every(function (enchant) {
                  return unit.getEnchant(enchant);
                });
                if (skipEnchant) {
                  shouldSkip = shouldSkip && true;
                } else {
                  shouldSkip = false;
                }
              }
              break;
            case "aura":
              if (Array.isArray(check[key])) {
                let skipAura = check[key].every(function (aura) {
                  return unit.getState(aura);
                });
                if (skipAura) {
                  shouldSkip = shouldSkip && true;
                } else {
                  shouldSkip = false;
                }
              }
              break;
            case "immunity":
              if (Array.isArray(check[key])) {
                let skipImmune = check[key].every(function (immune) {
                  return !Attack.checkResist(unit, immune);
                });
                if (skipImmune) {
                  shouldSkip = shouldSkip && true;
                } else {
                  shouldSkip = false;
                }
              }
              break;
            }

            if (!shouldSkip) {
              break;
            }
          }

          if (shouldSkip) {
            console.log("ÿc1Skip Advanced Check: " + unit.name);
            return true;
          }
        }
      }
    }

    let tempArray;

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
   * @returns {DamageType | "none" | false}
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
   * @param {DamageType | "none"} type 
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

  /**
   * Resistance reduction our Lower Resist curse applies, 0 when we can't cast it
   * @returns {number} Percent of resistance lowered
   */
  getLowerResistPercent: function () {
    const calc = (level) => Math.floor(Math.min(25 + (45 * ((110 * level) / (level + 6)) / 100), 70));
    if (Skill.canUse(sdk.skills.LowerResist)) {
      return calc(me.getSkill(sdk.skills.LowerResist, sdk.skills.subindex.SoftPoints));
    }
    return 0;
  },

  /**
   * Resistance reduction our Conviction aura applies, treating an equipped Infinity as level 12
   * @returns {number} Percent of resistance lowered
   */
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

  /**
   * Check if a monster is immune to specified attack type
   * @param {Monster | Player} unit 
   * @param {number} val 
   * @param {number} maxres 
   * @returns {boolean}
   */
  checkResist: function (unit, val, maxres = 100) {
    if (!unit || !unit.type || unit.isPlayer) return true;

    const damageType = typeof val === "number" ? this.getSkillElement(val) : val;
    const addLowerRes = !!(Skill.canUse(sdk.skills.LowerResist) && unit.curseable);

    // Static handler
    if (val === sdk.skills.StaticField && this.getResist(unit, damageType) < 100) {
      return unit.hpPercent > Config.CastStatic;
    }

    if (Config.ImmunityException.includes(damageType)) {
      return true;
    }

    // TODO: sometimes unit is out of range of conviction so need to check that
    // baal in throne room doesn't have getState
    if (Attack.infinity && ["fire", "lightning", "cold"].includes(damageType) && unit.getState) {
      if (!unit.getState(sdk.states.Conviction)) {
        if (addLowerRes && !unit.getState(sdk.states.LowerResist)) {
          let lowerResPercent = this.getLowerResistPercent();
          return (this.getResist(unit, damageType) - (Math.floor((lowerResPercent + 85) / 5))) < 100;
        }
        return this.getResist(unit, damageType) < 117;
      }

      return this.getResist(unit, damageType) < maxres;
    }

    if (
      Attack.auradin
      && ["physical", "fire", "cold", "lightning"].includes(damageType)
      && me.getState(sdk.states.Conviction)
      && unit.getState
    ) {
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
    if (!unit || !unit.type || !unit.isMonster) return false;
    const skillElems = Config.AttackSkill.map(function (skill) {
      return Attack.getSkillElement(skill);
    });
    // Unique/Champion
    if (unit.isSpecial) {
      if (Attack.checkResist(unit, skillElems[1])
        || Attack.checkResist(unit, skillElems[2])) {
        return true;
      }
    } else {
      if (Attack.checkResist(unit, skillElems[3])
        || Attack.checkResist(unit, skillElems[4])) {
        return true;
      }
    }

    if (skillElems.length === 7) {
      if (Attack.checkResist(unit, skillElems[5])
        || Attack.checkResist(unit, skillElems[6])) {
        return true;
      }
    }

    // Secondary if monster is immune to our existing backup skill
    // i.e. Hammerdins having holybolt as main backup but using smite here as third backup
    if (skillElems.length === 9) {
      if (Attack.checkResist(unit, skillElems[7])
        || Attack.checkResist(unit, skillElems[8])) {
        return true;
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

    /** @todo If we've disabled tele for walking clear, allow use of tele specifically for repositioning */
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
    const canTele = !walk && Pather.useTeleport();
    const { x: orgX, y: orgY } = me;

    /** @param {PathNode} node */
    const handleMove = function (node) {
      switch (walk) {
      case 1:
        return Pather.walkTo(node.x, node.y, 2);
      case 2:
        if (node.distance < 6 && !CollMap.checkColl(me, node, sdk.collision.WallOrRanged)) {
          return Pather.walkTo(node.x, node.y, 2);
        } else {
          return Pather.move(node, { retry: 1, allowPicking: !force });
        }
      default:
        return Pather.move(node, { retry: 1, allowPicking: !force });
      }
    };

    for (let n = 0; n < 3; n++) {
      /** @type {PathNode[]} */
      const coords = [];
      n > 0 && (distance -= Math.floor(fullDistance / 3 - 1));

      for (let currAngle of angles) {
        const _angle = ((angle + currAngle) * Math.PI / 180);
        let cx = Math.round((Math.cos(_angle)) * distance + unit.x);
        let cy = Math.round((Math.sin(_angle)) * distance + unit.y);
        let node = new PathNode(cx, cy);

        // ignore this spot as it's too close to our current position when we are forcing a new location
        if (force && node.distance < distance) continue;
        if (Pather.checkSpot(node.x, node.y, sdk.collision.BlockWall, false)) {
          coords.push(node);
        }
      }
      if (!coords.length) continue;

      coords.sort(Sort.units);

      for (let coord of coords) {
        // check if position is valid
        if (CollMap.checkColl(coord, unit, coll, 1)) {
          continue;
        }
        if (!canTele) {
          if (Config.DebugMode.Path) {
            console.debug("coord", coord, " dist", coord.distance);
            new Line(coord.x - 3, coord.y, coord.x + 3, coord.y, 0x9B, true);
            new Line(coord.x, coord.y - 3, coord.x, coord.y + 3, 0x9B, true);
          }
          
          let walkDist = Pather.getWalkDistance(coord.x, coord.y);
          if (walkDist > unit.distance) {
            if (Config.DebugMode.Path) {
              console.debug(
                "Skipping position due to walk distance being too far."
                + "\n - DistanceToMonster: " + unit.distance
                + "\n - DistanceToPosition: " + walkDist
              );
              continue;
            }
          }
        }
        if (handleMove(coord)) {
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
    ].every(function (state) {
      return !unit.getState(state);
    }));
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
  },

  /**
   * @param {Monster} unit 
   * @returns {AttackResult}
   */
  doPreAttack: function (unit) {
    const preAttackInfo = Attack.getCustomPreAttack(unit)
      ? Attack.getCustomPreAttack(unit)
      : [Config.AttackSkill[0], Attack.getPrimarySlot()];
    preAttackInfo.length < 2 && preAttackInfo.push(Attack.getPrimarySlot());
    const [skill, slot] = preAttackInfo;
    const cState = Skill.getState(skill);

    if (skill > 0
      && Attack.checkResist(unit, skill)
      && (!cState || !unit.getState(cState))
      && (!me.skillDelay || !Skill.isTimed(skill))) {
      if (unit.distance > Skill.getRange(skill) || checkCollision(me, unit, sdk.collision.Ranged)) {
        if (!Attack.getIntoPosition(unit, Skill.getRange(skill), sdk.collision.Ranged)) {
          return Attack.Result.FAILED;
        }
      }

      // Check if we need to charge cast - TODO: better check for charge vs not
      if (Skill.charges.find(c => c.skill === skill)) {
        Skill.castCharges(skill, unit);
      } else {
        Skill.cast(skill, Skill.getHand(skill), unit, null, null, slot);
      }

      return Attack.Result.SUCCESS;
    }
    return Attack.Result.NOOP;
  },

  /**
   * @param {Monster} unit 
   * @returns {boolean}
   */
  doChargeCast: function (unit) {
    const { skill, spectype, classids } = Config.ChargeCast;
    const cRange = Skill.getRange(skill);
    const cState = Skill.getState(skill);

    if (classids.length) {
      /**
       * @param {string | number} id 
       * @returns {boolean}
       */
      const validId = function (id) {
        return typeof id === "number"
          ? unit.classid === id
          : unit.name.toLowerCase().includes(id);
      };
      if (!classids.some(validId)) {
        return false;
      }
    }

    if ((!spectype || (unit.spectype & spectype))
      && (!cState || !unit.getState(cState))
      && (unit.distance < cRange || !checkCollision(me, unit, sdk.collision.LineOfSight))) {
      return Skill.castCharges(skill, unit);
    }
    return false;
  },
};
