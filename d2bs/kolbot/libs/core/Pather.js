/**
*  @filename    Pather.js
*  @author      kolton, theBGuy
*  @desc        handle player movement
*
*/

/**
 * Perform certain actions after moving to each node
 * @todo this needs to be re-worked
 */
const NodeAction = {
  /** @type {number[]} */
  shrinesToIgnore: [],
  enabled: true,

  /**
   * Run all the functions within NodeAction (except for itself)
   * @param {clearSettings} arg 
   */
  go: function (arg) {
    if (!this.enabled) return;
    for (let i in this) {
      if (this.hasOwnProperty(i) && typeof this[i] === "function" && i !== "go") {
        this[i](arg);
      }
    }
  },

  /**
   * Kill monsters while pathing
   * @param {clearSettings} arg 
   * @returns {void}
   */
  killMonsters: function (arg = {}) {
    if (arg.hasOwnProperty("allowClearing") && !arg.allowClearing) return;

    const killSettings = Object.assign({}, {
      clearPath: false,
      specType: sdk.monsters.spectype.All,
      range: 10,
      overrideConfig: false,
    }, arg);

    if (Config.Countess.KillGhosts && me.act === 1) {
      if (me.area >= sdk.areas.TowerCellarLvl1 && me.area <= sdk.areas.TowerCellarLvl5) {
        let monList = (Attack.getMob(sdk.monsters.Ghost1, sdk.monsters.spectype.All, 30) || []);
        monList.length > 0 && Attack.clearList(monList);
      }
    }

    if ((typeof Config.ClearPath === "number" || typeof Config.ClearPath === "object")
      && killSettings.clearPath === false && !killSettings.overrideConfig) {
      switch (typeof Config.ClearPath) {
      case "number":
        Attack.clear(30, Config.ClearPath);

        break;
      case "object":
        if (!Config.ClearPath.hasOwnProperty("Areas")
          || !Config.ClearPath.Areas.length
          || Config.ClearPath.Areas.includes(me.area)) {
          Attack.clear(Config.ClearPath.Range, Config.ClearPath.Spectype);
        }

        break;
      }

      return;
    }

    if (killSettings.clearPath !== false) {
      Attack.clear(killSettings.range, killSettings.specType);
    }
  },

  /**
   * Open chests while pathing
   */
  popChests: function () {
    // fastPick check? should only open chests if surrounding monsters have been cleared or if fastPick is active
    // note: clear of surrounding monsters of the spectype we are set to clear
    Config.OpenChests.Enabled && Misc.openChests(Config.OpenChests.Range);
  },

  /**
   * Scan shrines while pathing
   */
  getShrines: function () {
    Config.ScanShrines.length > 0 && Misc.scanShrines(null, this.shrinesToIgnore);
  }
};

const PathDebug = {
  /** @type {Line[]} */
  hooks: [],
  enableHooks: false,

  /**
   * Draw our path on the screen
   * @param {PathNode[]} path 
   * @returns {void}
   */
  drawPath: function (path) {
    if (!this.enableHooks) return;

    this.removeHooks();

    if (path.length < 2) return;

    for (let i = 0; i < path.length - 1; i += 1) {
      this.hooks.push(new Line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y, 0x84, true));
    }
  },

  removeHooks: function () {
    for (let i = 0; i < this.hooks.length; i += 1) {
      PathDebug.hooks[i].remove();
    }

    PathDebug.hooks = [];
  },

  /**
   * Check if a set of coords are a set path
   * @param {PathNode[]} path 
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  coordsInPath: function (path, x, y) {
    for (let i = 0; i < path.length; i += 1) {
      if (getDistance(x, y, path[i].x, path[i].y) < 5) {
        return true;
      }
    }

    return false;
  }
};

// todo - test path generating in a dedicated thread to prevent lagging main thread
const Pather = {
  initialized: false,
  teleport: true,
  recursion: true,
  walkDistance: 5,
  teleDistance: 40,
  lastPortalTick: 0,
  cancelFlags: [
    sdk.uiflags.Inventory, sdk.uiflags.StatsWindow,
    sdk.uiflags.SkillWindow, sdk.uiflags.NPCMenu,
    sdk.uiflags.Waypoint, sdk.uiflags.Party,
    sdk.uiflags.Shop, sdk.uiflags.Quest,
    sdk.uiflags.TradePrompt, sdk.uiflags.Stash, sdk.uiflags.Cube
  ],
  wpAreas: [
    sdk.areas.RogueEncampment, sdk.areas.ColdPlains, sdk.areas.StonyField,
    sdk.areas.DarkWood, sdk.areas.BlackMarsh, sdk.areas.OuterCloister,
    sdk.areas.JailLvl1, sdk.areas.InnerCloister, sdk.areas.CatacombsLvl2,
    sdk.areas.LutGholein, sdk.areas.A2SewersLvl2, sdk.areas.DryHills,
    sdk.areas.HallsoftheDeadLvl2, sdk.areas.FarOasis, sdk.areas.LostCity,
    sdk.areas.PalaceCellarLvl1, sdk.areas.ArcaneSanctuary, sdk.areas.CanyonofMagic,
    sdk.areas.KurastDocktown, sdk.areas.SpiderForest, sdk.areas.GreatMarsh,
    sdk.areas.FlayerJungle, sdk.areas.LowerKurast, sdk.areas.KurastBazaar,
    sdk.areas.UpperKurast, sdk.areas.Travincal, sdk.areas.DuranceofHateLvl2,
    sdk.areas.PandemoniumFortress, sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame,
    sdk.areas.Harrogath, sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau,
    sdk.areas.CrystalizedPassage, sdk.areas.GlacialTrail, sdk.areas.HallsofPain,
    sdk.areas.FrozenTundra, sdk.areas.AncientsWay, sdk.areas.WorldstoneLvl2
  ],
  nonTownWpAreas: [
    sdk.areas.ColdPlains, sdk.areas.StonyField, sdk.areas.DarkWood,
    sdk.areas.BlackMarsh, sdk.areas.OuterCloister,
    sdk.areas.JailLvl1, sdk.areas.InnerCloister, sdk.areas.CatacombsLvl2,
    sdk.areas.A2SewersLvl2, sdk.areas.DryHills,
    sdk.areas.HallsoftheDeadLvl2, sdk.areas.FarOasis, sdk.areas.LostCity,
    sdk.areas.PalaceCellarLvl1, sdk.areas.ArcaneSanctuary, sdk.areas.CanyonofMagic,
    sdk.areas.SpiderForest, sdk.areas.GreatMarsh, sdk.areas.FlayerJungle,
    sdk.areas.LowerKurast, sdk.areas.KurastBazaar,
    sdk.areas.UpperKurast, sdk.areas.Travincal, sdk.areas.DuranceofHateLvl2,
    sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame,
    sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau, sdk.areas.CrystalizedPassage,
    sdk.areas.GlacialTrail, sdk.areas.HallsofPain,
    sdk.areas.FrozenTundra, sdk.areas.AncientsWay, sdk.areas.WorldstoneLvl2
  ],
  nextAreas: {},

  init: function () {
    if (!this.initialized) {
      me.classic && (Pather.nonTownWpAreas = this.nonTownWpAreas.filter((wp) => wp < sdk.areas.Harrogath));
      if (!Config.WaypointMenu) {
        !getWaypoint(1) && this.getWP(me.area);
        me.cancelUIFlags();
        Pather.initialized = true;
      }
    }
  },

  /**
   * @todo Handle rare bug where teleport skill dissapears from enigma
   */
  canTeleport: function () {
    return this.teleport && (Skill.canUse(sdk.skills.Teleport) || me.getStat(sdk.stats.OSkill, sdk.skills.Teleport));
  },

  useTeleport: function () {
    let manaTP = Skill.getManaCost(sdk.skills.Teleport);
    let numberOfTeleport = ~~(me.mpmax / manaTP);
    return !me.inTown && !Config.NoTele && !me.shapeshifted && this.canTeleport() && numberOfTeleport > 2;
  },

  /**
   * @typedef {object} spotOnDistanceSettings
   * @property {number} [area]
   * @property {number} [reductionType]
   * @property {number} [coll]
   * @property {boolean} [returnSpotOnError] 
   *
   * @param {PathNode} spot 
   * @param {number} distance 
   * @param {spotOnDistanceSettings} givenSettings 
   * @returns {PathNode}
   */
  spotOnDistance: function (spot, distance, givenSettings = {}) {
    const spotSettings = Object.assign({}, {
      area: me.area,
      reductionType: 2,
      coll: (sdk.collision.BlockWalk),
      returnSpotOnError: true
    }, givenSettings);

    let nodes = (getPath(spotSettings.area, me.x, me.y, spot.x, spot.y, spotSettings.reductionType, 4) || []);
    
    if (!nodes.length) {
      if (spotSettings.reductionType === 2) {
        // try again with walking reduction
        nodes = getPath(spotSettings.area, me.x, me.y, spot.x, spot.y, 0, 4);
      }
      if (!nodes.length) return (spotSettings.returnSpotOnError ? spot : { x: me.x, y: me.y });
    }

    return (nodes.find((node) => getDistance(spot.x, spot.y, node.x, node.y) < distance
      && Pather.checkSpot(node.x, node.y, spotSettings.coll))
      || (spotSettings.returnSpotOnError ? spot : { x: me.x, y: me.y }));
  },

  /**
   * @typedef {object} pathSettings
   * @property {boolean} [allowNodeActions]
   * @property {boolean} [allowTeleport]
   * @property {boolean} [allowClearing]
   * @property {boolean} [allowTown]
   * @property {boolean} [allowPicking]
   * @property {number} [minDist]
   * @property {number} [retry]
   * @property {boolean} [pop]
   * @property {boolean} [returnSpotOnError]
   * @property {Function} [callback]
   * @property {clearSettings} [clearSettings]
   * 
   * @typedef {object} clearSettings
   * @property {boolean} [clearSettings.clearPath]
   * @property {number} [clearSettings.range]
   * @property {number} [clearSettings.specType]
   * @property {Function} [clearSettings.sort]
   *
   * @param {PathNode | Unit | PresetUnit} target 
   * @param {pathSettings} givenSettings 
   * @returns {boolean}
   */
  move: function (target, givenSettings = {}) {
    // Abort if dead
    if (me.dead) return false;
    /**
     * assign settings
     * @type {pathSettings}
     */
    const settings = Object.assign({}, {
      clearSettings: {
      },
      allowNodeActions: true,
      allowTeleport: true,
      allowClearing: true,
      allowTown: true,
      allowPicking: true,
      minDist: 3,
      retry: 5,
      pop: false,
      returnSpotOnError: true,
      callback: null,
    }, givenSettings);
    // assign clear settings becasue object.assign was removing the default properties of settings.clearSettings
    const clearSettings = Object.assign({
      clearPath: false,
      range: 10,
      specType: 0,
      sort: Attack.sortMonsters,
    }, settings.clearSettings);
    // set settings.clearSettings equal to the now properly asssigned clearSettings
    settings.clearSettings = clearSettings;

    if (!settings.allowClearing && settings.allowClearing !== undefined) {
      settings.clearSettings.allowClearing = false;
    }
    (target instanceof PresetUnit) && (target = target.realCoords());

    if (settings.minDist > 3) {
      target = this.spotOnDistance(
        target,
        settings.minDist,
        { returnSpotOnError: settings.returnSpotOnError, reductionType: (me.inTown ? 0 : 2) }
      );
    }

    /** @constructor */
    function PathAction () {
      this.at = 0;
      /** @type {PathNode} */
      this.node = { x: null, y: null };
    }

    /** @param {PathNode} node */
    PathAction.prototype.update = function (node) {
      this.at = getTickCount();
      this.node.x = node.x;
      this.node.y = node.y;
    };

    let fail = 0;
    let invalidCheck = false;
    let node = { x: target.x, y: target.y };
    const leaped = new PathAction();
    const whirled = new PathAction();
    const cleared = new PathAction();

    for (let i = 0; i < this.cancelFlags.length; i += 1) {
      getUIFlag(this.cancelFlags[i]) && me.cancel();
    }

    if (typeof target.x !== "number" || typeof target.y !== "number") {
      throw new Error("move: Coords must be numbers");
    }
    if (getDistance(me, target) < 2 && !CollMap.checkColl(me, target, sdk.collision.BlockMissile, 5)) return true;

    let useTeleport = settings.allowTeleport && this.useTeleport();
    const tpMana = useTeleport ? Skill.getManaCost(sdk.skills.Teleport) : Infinity;
    const annoyingArea = [
      sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3
    ].includes(me.area);
    let path = getPath(
      me.area,
      target.x, target.y,
      me.x, me.y,
      useTeleport ? 1 : 0,
      useTeleport ? (annoyingArea ? 30 : this.teleDistance) : this.walkDistance
    );
    if (!path) throw new Error("move: Failed to generate path.");

    if (settings.retry <= 3 && target.distance > useTeleport ? 120 : 60) {
      settings.retry = 10;
    }

    path.reverse();
    settings.pop && path.pop();
    PathDebug.drawPath(path);
    useTeleport && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

    while (path.length > 0) {
      // Abort if dead
      if (me.dead) return false;
      // main path
      Pather.recursion && (Pather.currentWalkingPath = path);

      for (let i = 0; i < this.cancelFlags.length; i += 1) {
        if (getUIFlag(this.cancelFlags[i])) me.cancel();
      }

      node = path.shift();

      if (typeof settings.callback === "function" && settings.callback()) {
        console.debug("Callback function passed. Ending path.");
        useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
        PathDebug.removeHooks();
        return true;
      }

      if (getDistance(me, node) > 2) {
        // Make life in Maggot Lair easier
        fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y) && (invalidCheck = true);
        // Make life in Maggot Lair easier - should this include arcane as well?
        if (annoyingArea || invalidCheck) {
          let adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, sdk.collision.BlockWalk);

          if (adjustedNode) {
            [node.x, node.y] = adjustedNode;
            invalidCheck && (invalidCheck = false);
          }

          annoyingArea && ([settings.clearSettings.overrideConfig, settings.clearSettings.range] = [true, 5]);
          settings.retry <= 3 && !useTeleport && (settings.retry = 15);
        }

        if (useTeleport && tpMana <= me.mp
          ? this.teleportTo(node.x, node.y)
          : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
          if (settings.allowNodeActions && !me.inTown) {
            if (Pather.recursion) {
              Pather.recursion = false;
              try {
                NodeAction.go(settings.clearSettings);
                node.distance > 5 && this.move(node, settings);
              } finally {
                Pather.recursion = true;
              }
            }

            // settings.allowTown && Misc.townCheck();
          }
        } else {
          if (!me.inTown) {
            if (!useTeleport && (this.kickBarrels(node.x, node.y) || this.openDoors(node.x, node.y))) {
              continue;
            }

            if (/* fail > 0 &&  */(!useTeleport || tpMana > me.mp)) {
              // if we are allowed to clear
              if (settings.allowClearing) {
                // Don't go berserk on longer paths - also check that there are even mobs blocking us
                if (cleared.at === 0 || getTickCount() - cleared.at > Time.seconds(3)
                  && cleared.node.distance > 5 && me.checkForMobs({ range: 10 })) {
                  // only set that we cleared if we actually killed at least 1 mob
                  if (Attack.clear(10, null, null, null, settings.allowPicking) === Attack.Result.SUCCESS) {
                    cleared.update(node);
                  }
                }
              }

              // Leap can be helpful on long paths but make sure we don't spam it
              if (Skill.canUse(sdk.skills.LeapAttack)) {
                // we can use leapAttack, now lets see if we should - either haven't used it yet or it's been long enough since last time
                if (leaped.at === 0 || getTickCount() - leaped.at > Time.seconds(3)
                  || leaped.node.distance > 5 || me.checkForMobs({ range: 6 })) {
                  // alright now if we have actually casted it set the values so we know
                  if (Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, node.x, node.y)) {
                    leaped.update(node);
                  }
                }
              }

              /**
               * whirlwind can be useful as well, implement it.
               * Things to consider:
               * 1) Can we cast whirlwind on the node? Is it blocked by something other than monsters.
               * 2) If we can't cast on that node, is there another node between us and it that would work?
               */
              if (Skill.canUse(sdk.skills.Whirlwind)) {
                // we can use whirlwind, now lets see if we should - either haven't used it yet or it's been long enough since last time
                if (whirled.at === 0 || getTickCount() - whirled.at > Time.seconds(3)
                  || whirled.node.distance > 5 || me.checkForMobs({ range: 6 })) {
                  // alright now if we have actually casted it set the values so we know
                  if (Skill.cast(sdk.skills.Whirlwind, sdk.skills.hand.Right, node.x, node.y)) {
                    whirled.update(node);
                  }
                }
              }
            }
          } else if (fail > 0 && me.inArea(sdk.areas.LutGholein) && me.x > 5122 && me.y <= 5049) {
            // dislike have this here but handle atma blocking us from inside the tavern
            if (me.inArea(sdk.areas.LutGholein) && me.x > 5122 && me.y <= 5049) {
              let atma = Game.getNPC(NPC.Atma);
              if (atma && (atma.x === 5136 || atma.x === 5137)
                && (atma.y >= 5048 && atma.y <= 5051)) {
                // yup dumb lady is blocking the door, take side door
                [[5140, 5038], [5148, 5031], [5154, 5025], [5161, 5030]].forEach(function (node) {
                  Pather.walkTo(node[0], node[1]);
                });
              }
            }
          }

          // Reduce node distance in new path
          path = getPath(
            me.area,
            target.x, target.y,
            me.x, me.y,
            useTeleport ? 1 : 0,
            useTeleport ? rand(25, 35) : rand(10, 15)
          );
          if (!path) throw new Error("move: Failed to generate path.");

          path.reverse();
          PathDebug.drawPath(path);
          settings.pop && path.pop();

          if (fail > 0) {
            console.debug("move retry " + fail);
            Packet.flash(me.gid);

            if (fail >= settings.retry) {
              console.log("Failed move: Retry = " + settings.retry);
              break;
            }
          }
          fail++;
        }
      }

      delay(5);
    }

    useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
    PathDebug.removeHooks();

    return getDistance(me, node.x, node.y) < 5;
  },

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} minDist 
   * @param {pathSettings} givenSettings 
   * @returns {boolean}
   */
  moveNear: function (x, y, minDist, givenSettings = {}) {
    return Pather.move({ x: x, y: y }, Object.assign({ minDist: minDist }, givenSettings));
  },

  /**
   * @param {number} x - the x coord to move to
   * @param {number} y - the y coord to move to
   * @param {number} retry - number of attempts before aborting
   * @param {boolean} clearPath - kill monsters while moving
   * @param {boolean} pop - remove last node
   * @returns {boolean}
   */
  moveTo: function (x, y, retry, clearPath, pop) {
    return Pather.move({ x: x, y: y }, { retry: retry, pop: pop, allowClearing: clearPath });
  },

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {pathSettings} givenSettings 
   * @returns 
   */
  moveToEx: function (x, y, givenSettings = {}) {
    return Pather.move({ x: x, y: y }, givenSettings);
  },

  /**
   * @param {number} x - the x coord to teleport to
   * @param {number} y - the y coord to teleport to
   * @param {number} [maxRange] - max acceptable distance from node
   * @returns {boolean}
   * @todo does this need a validLocation check? - maybe if we fail once check the spot
   */
  teleportTo: function (x, y, maxRange = 5) {
    for (let i = 0; i < 3; i += 1) {
      Config.PacketCasting > 0
        ? Packet.teleport(x, y)
        : Skill.cast(sdk.skills.Teleport, sdk.skills.hand.Right, x, y);
      let tick = getTickCount();
      let pingDelay = i === 0 ? 150 : me.getPingDelay();

      while (getTickCount() - tick < Math.max(500, pingDelay * 2 + 200)) {
        if ([x, y].distance < maxRange) {
          return true;
        }

        delay(10);
      }
    }

    return false;
  },

  /**
   * @param {number} x - the x coord to teleport to
   * @param {number} y - the y coord to teleport to
   * @param {number} [minDist] - minimal distance from x/y before returning true
   * @returns {boolean} - sucessfully moved within minDist
   */
  walkTo: function (x, y, minDist) {
    while (!me.gameReady) {
      delay(100);
    }

    if (x === undefined || y === undefined || me.dead) return false;
    minDist === undefined && (minDist = me.inTown ? 2 : 4);

    let nTimer;
    let [nFail, attemptCount] = [0, 0];

    /**
     * @todo add cleansing/meditation here as well
     */
    // credit @Jaenster
    // Stamina handler and Charge
    if (!me.inTown) {
      // Check if I have a stamina potion and use it if I do
      if (me.staminaPercent <= 20) {
        let stam = me.getItemsEx(-1, sdk.items.mode.inStorage)
          .filter(function (i) {
            return i.classid === sdk.items.StaminaPotion && i.isInInventory;
          })
          .first();
        !!stam && !me.deadOrInSequence && stam.use();
      }
      (me.running && me.staminaPercent <= 15) && me.walk();
      // the less stamina you have, the more you wait to recover
      let recover = me.staminaMaxDuration < 30 ? 80 : 50;
      (me.walking && me.staminaPercent >= recover) && me.run();
      if (Skill.canUse(sdk.skills.Charge) && me.paladin
        && me.mp >= 9 && [x, y].distance > 8
        && Skill.setSkill(sdk.skills.Charge, sdk.skills.hand.Left)) {
        if (Skill.canUse(sdk.skills.Vigor)) {
          Skill.setSkill(sdk.skills.Vigor, sdk.skills.hand.Right);
        } else if (!Config.Vigor && !Attack.auradin && Skill.canUse(sdk.skills.HolyFreeze)) {
          // Useful in classic to keep mobs cold while you rush them
          Skill.setSkill(sdk.skills.HolyFreeze, sdk.skills.hand.Right);
        }
        Misc.click(0, 1, x, y);
        while (!me.idle) {
          delay(40);
        }
      }

      if (Precast.enabled && Skill.canUse(sdk.skills.Blaze)
        && me.mp > (Skill.getManaCost(sdk.skills.Blaze) * 2)
        && !me.getState(sdk.states.Blaze)) {
        Skill.cast(sdk.skills.Blaze);
      }
    } else {
      me.walking && me.run();
      Skill.canUse(sdk.skills.Vigor) && Skill.setSkill(sdk.skills.Vigor, sdk.skills.hand.Right);
    }

    MainLoop:
    while (getDistance(me.x, me.y, x, y) > minDist && !me.dead) {
      if (me.paladin && !me.inTown) {
        Skill.canUse(sdk.skills.Vigor)
          ? Skill.setSkill(sdk.skills.Vigor, sdk.skills.hand.Right)
          : Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);
      }

      if (this.openDoors(x, y) && getDistance(me.x, me.y, x, y) <= minDist) {
        return true;
      }

      if (attemptCount > 1
        && CollMap.checkColl(me, { x: x, y: y }, sdk.collision.BlockWall | sdk.collision.ClosedDoor)) {
        this.openDoors(me.x, me.y);
      }

      Misc.click(0, 0, x, y);

      attemptCount += 1;
      nTimer = getTickCount();

      while (!me.moving) {
        if (me.dead) return false;

        if ((getTickCount() - nTimer) > 500) {
          if (nFail >= 3) {
            break MainLoop;
          }

          nFail += 1;
          let angle = Math.atan2(me.y - y, me.x - x);
          let angles = [Math.PI / 2, -Math.PI / 2];

          for (let i = 0; i < angles.length; i += 1) {
            // TODO: might need rework into getnearestwalkable
            let whereToClick = {
              x: Math.round(Math.cos(angle + angles[i]) * 5 + me.x),
              y: Math.round(Math.sin(angle + angles[i]) * 5 + me.y)
            };

            if (Attack.validSpot(whereToClick.x, whereToClick.y)) {
              Misc.click(0, 0, whereToClick.x, whereToClick.y);

              let tick = getTickCount();

              while (getDistance(me, whereToClick) > 2 && getTickCount() - tick < 1000) {
                delay(40);
              }

              break;
            }
          }

          break;
        }

        delay(10);
      }

      attemptCount > 1 && this.kickBarrels(x, y);

      // Wait until we're done walking - idle or dead
      while (getDistance(me.x, me.y, x, y) > minDist && !me.idle) {
        delay(10);
      }

      if (attemptCount >= 3) {
        break;
      }
    }
    return (!me.dead && getDistance(me.x, me.y, x, y) <= minDist);
  },

  /**
   * If there is a door in our path, open it so we can continue moving
   * @param {number} x - the x coord of the node close to the door
   * @param {number} y - the y coord of the node close to the door
   * @returns {boolean} true if we opened any doors that were in our way
   */
  openDoors: function (x, y) {
    if (me.inTown && me.act !== 5) return false;

    (typeof x !== "number" || typeof y !== "number") && ({ x, y } = me);

    // Regular doors
    let door = Game.getObject("door", sdk.objects.mode.Inactive);

    if (door) {
      do {
        if ((getDistance(door, x, y) < 4 && door.distance < 9) || door.distance < 4) {
          for (let i = 0; i < 3; i++) {
            Misc.click(0, 0, door);

            if (Misc.poll(() => door.mode === sdk.objects.mode.Active, 1000, 30)) {
              return true;
            }

            i === 2 && Packet.flash(me.gid);
          }
        }
      } while (door.getNext());
    }

    // handle act 5 gate
    if ([sdk.areas.Harrogath, sdk.areas.BloodyFoothills].includes(me.area)) {
      let gate = Game.getObject("gate", sdk.objects.mode.Inactive);

      if (gate) {
        if ((getDistance(gate, x, y) < 4 && gate.distance < 9) || gate.distance < 4) {
          for (let i = 0; i < 3; i++) {
            Misc.click(0, 0, gate);

            if (Misc.poll(() => gate.mode, 1000, 50)) {
              return true;
            }

            i === 2 && Packet.flash(me.gid);
          }
        }
      }
    }

    // Monsta doors (Barricaded) - not sure if this is really needed anymore
    let monstadoor = Game.getMonster("barricaded door");

    if (monstadoor) {
      do {
        if (monstadoor.hp > 0 && (getDistance(monstadoor, x, y) < 4
          && monstadoor.distance < 9) || monstadoor.distance < 4) {
          for (let p = 0; p < 20 && monstadoor.hp; p++) {
            Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), monstadoor);
          }
        }
      } while (monstadoor.getNext());
    }

    let monstawall = Game.getMonster("barricade");
    
    if (monstawall) {
      do {
        if (monstawall.hp > 0 && (getDistance(monstawall, x, y) < 4
          && monstawall.distance < 9) || monstawall.distance < 4) {
          for (let p = 0; p < 20 && monstawall.hp; p++) {
            Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), monstawall);
          }
        }
      } while (monstawall.getNext());
    }

    return false;
  },

  /**
   * Small and annoying things like barrels can block our path, open them if they are near us
   * @param {number} x - the x coord of the node close to the barrel
   * @param {number} y - the y coord of the node close to the barrel
   * @returns {boolean} true if we kicked any barrels that were in our way
   */
  kickBarrels: function (x, y) {
    if (me.inTown) return false;

    (typeof x !== "number" || typeof y !== "number") && ({ x, y } = me);

    // anything small and annoying really
    let _things = [
      "ratnest", "goo pile", "barrel", "basket",
      "largeurn", "jar3", "jar2", "jar1",
      "urn", "jug", "barrel wilderness", "cocoon"
    ];
    let barrels = getUnits(sdk.unittype.Object)
      .filter(function (el) {
        return (el.name && el.mode === sdk.objects.mode.Inactive
        && _things.includes(el.name.toLowerCase())
        && ((getDistance(el, x, y) < 4 && el.distance < 9) || el.distance < 4));
      });
    let brokeABarrel = false;

    while (barrels.length > 0) {
      barrels.sort(Sort.units);
      let unit = barrels.shift();

      if (unit && !checkCollision(me, unit, sdk.collision.WallOrRanged)) {
        try {
          for (let i = 0; i < 5; i++) {
            i < 3 ? Packet.entityInteract(unit) : Misc.click(0, 0, unit);

            if (unit.mode) {
              brokeABarrel = true;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    return brokeABarrel;
  },

  /**
   * Move to unit
   * @param {Unit} unit - unit to move to
   * @param {number} [offX] - offset from unit's x coord
   * @param {number} [offY] - offset from unit's x coord
   * @param {boolean} [clearPath] - kill monsters while moving
   * @param {boolean} [pop] - remove last node
   * @returns {boolean} Sucessfully moved to unit
   */
  moveToUnit: function (unit, offX, offY, clearPath, pop) {
    const useTeleport = this.useTeleport();

    offX === undefined && (offX = 0);
    offY === undefined && (offY = 0);
    clearPath === undefined && (clearPath = false);
    pop === undefined && (pop = false);

    if (!unit || !unit.hasOwnProperty("x") || !unit.hasOwnProperty("y")) {
      throw new Error("moveToUnit: Invalid unit.");
    }
    (unit instanceof PresetUnit) && (unit = { x: unit.roomx * 5 + unit.x, y: unit.roomy * 5 + unit.y });

    let [x, y] = [unit.x + offX, unit.y + offY];

    if (!useTeleport) {
      // The unit will most likely be moving so call the first walk with 'pop' parameter
      this.moveTo(x, y, 0, clearPath, true);
    }

    return this.moveTo(x, y, useTeleport && unit.type && unit.isMonster ? 3 : 0, clearPath, pop);
  },

  /**
   * Move near unit
   * @param {Unit} unit - unit to move near
   * @param {boolean} [clearPath] - kill monsters while moving
   * @param {boolean} [pop] - remove last node
   * @returns {boolean} Sucessfully moved near unit
   */
  moveNearUnit: function (unit, minDist, clearPath, pop = false) {
    const useTeleport = this.useTeleport();
    minDist === undefined && (minDist = me.inTown ? 2 : 5);

    if (!unit || !unit.hasOwnProperty("x") || !unit.hasOwnProperty("y")) throw new Error("moveNearUnit: Invalid unit.");

    (unit instanceof PresetUnit) && (unit = { x: unit.roomx * 5 + unit.x, y: unit.roomy * 5 + unit.y });

    if (!useTeleport) {
      // The unit will most likely be moving so call the first walk with 'pop' parameter
      this.moveNear(unit.x, unit.y, minDist, { clearSettings: { clearPath: clearPath }, pop: true });
    }

    return this.moveNear(unit.x, unit.y, minDist, { clearSettings: { clearPath: clearPath }, pop: pop });
  },

  /**
   * Move near preset unit
   * @param {number} area - area of the preset unit
   * @param {number} unitType - type of the preset unit
   * @param {number} unitId - preset unit id
   * @param {number} [minDist] - minimum distance from unit
   * @param {boolean} [clearPath] - kill monsters while moving
   * @param {boolean} [pop] - remove last node
   * @returns {boolean} Sucessfully moved near unit
   */
  moveNearPreset: function (area, unitType, unitId, minDist, clearPath = false, pop = false) {
    if (area === undefined || unitType === undefined || unitId === undefined) {
      throw new Error("moveNearPreset: Invalid parameters.");
    }

    me.area !== area && Pather.journeyTo(area);
    let presetUnit = getPresetUnit(area, unitType, unitId);

    if (!presetUnit) {
      throw new Error(
        "moveNearPreset: Couldn't find preset unit - id: " + unitId
        + " unitType: " + unitType + " in area: " + getAreaName(area)
      );
    }

    delay(40);
    Misc.poll(() => me.gameReady, 500, 100);

    let unit = presetUnit.realCoords();

    return this.moveNear(unit.x, unit.y, minDist, { clearSettings: { clearPath: clearPath }, pop: pop });
  },

  /**
   * Move to preset unit
   * @param {number} area - area of the preset unit
   * @param {number} unitType - type of the preset unit
   * @param {number} unitId - preset unit id
   * @param {number} [offX] - offset from unit's x coord
   * @param {number} [offY] - offset from unit's x coord
   * @param {boolean} [clearPath] - kill monsters while moving
   * @param {boolean} [pop] - remove last node
   * @returns {boolean} Sucessfully moved to unit
   */
  moveToPreset: function (area, unitType, unitId, offX, offY, clearPath, pop) {
    if (area === undefined || unitType === undefined || unitId === undefined) {
      throw new Error("moveToPreset: Invalid parameters.");
    }

    offX === undefined && (offX = 0);
    offY === undefined && (offY = 0);
    clearPath === undefined && (clearPath = false);
    pop === undefined && (pop = false);

    me.area !== area && Pather.journeyTo(area);
    let presetUnit = getPresetUnit(area, unitType, unitId);

    if (!presetUnit) {
      throw new Error(
        "moveToPreset: Couldn't find preset unit - id: " + unitId
        + " unitType: " + unitType + " in area: " + getAreaName(area)
      );
    }

    delay(40);
    Misc.poll(() => me.gameReady, 500, 100);
    let { x, y } = presetUnit.realCoords();

    return this.moveTo(x + offX, y + offY, 3, clearPath, pop);
  },

  /**
   * @todo
   * moveTo/NearPresetTile
   */
  
  /**
   * 
   * @param {number} area 
   * @param {number} unitId 
   * @param {pathSettings} givenSettings 
   */
  moveToPresetObject: function (area, unitId, givenSettings = {}) {
    if (area === undefined || unitId === undefined) {
      throw new Error("moveToPreset: Invalid parameters.");
    }

    let offX = givenSettings.hasOwnProperty("offX") ? givenSettings.offX : 0;
    let offY = givenSettings.hasOwnProperty("offY") ? givenSettings.offY : 0;

    me.area !== area && Pather.journeyTo(area);
    let presetUnit = Game.getPresetObject(area, unitId);

    if (!presetUnit) {
      throw new Error(
        "moveToPresetObject: Couldn't find preset unit - id: " + unitId
        + " in area: " + getAreaName(area)
      );
    }

    delay(40);
    Misc.poll(() => me.gameReady, 500, 100);
    let { x, y } = presetUnit.realCoords();

    return this.moveToEx(x + offX, y + offY, givenSettings);
  },

  /**
   * 
   * @param {number} area 
   * @param {number} unitId 
   * @param {pathSettings} givenSettings 
   */
  moveToPresetMonster: function (area, unitId, givenSettings = {}) {
    if (area === undefined || unitId === undefined) {
      throw new Error("moveToPreset: Invalid parameters.");
    }

    let offX = givenSettings.hasOwnProperty("offX") ? givenSettings.offX : 0;
    let offY = givenSettings.hasOwnProperty("offY") ? givenSettings.offY : 0;

    me.area !== area && Pather.journeyTo(area);
    let presetUnit = Game.getPresetMonster(area, unitId);

    if (!presetUnit) {
      throw new Error(
        "moveToPresetMonster: Couldn't find preset unit - id: " + unitId
        + " in area: " + getAreaName(area)
      );
    }

    delay(40);
    Misc.poll(() => me.gameReady, 500, 100);
    let { x, y } = presetUnit.realCoords();

    return this.moveToEx(x + offX, y + offY, givenSettings);
  },

  /**
   * @param {number} targetArea - area id or array of area ids to move to
   * @param {boolean} [use] - enter target area or last area in the array
   * @param {pathSettings} givenSettings
   */
  moveToExit: function (targetArea, use, givenSettings = {}) {
    if (targetArea === undefined) return false;

    const areas = Array.isArray(targetArea)
      ? targetArea
      : [targetArea];
    const finalDest = areas.last();
    const finalDestName = getAreaName(finalDest);
    console.info(true, "ÿc7MyArea: ÿc0" + getAreaName(me.area) + " ÿc7TargetArea: ÿc0" + finalDestName, "moveToExit");

    me.inArea(areas.first()) && areas.shift();

    for (let currTarget of areas) {
      console.info(null, getAreaName(me.area) + "ÿc8 --> ÿc0" + getAreaName(currTarget));
      
      const area = Misc.poll(() => getArea(me.area));
      if (!area) throw new Error("moveToExit: error in getArea()");
      
      /** @type {Array<Exit>} */
      const exits = (area.exits || []);
      if (!exits.length) return false;

      let checkExits = [];
      for (let exit of exits) {
        if (!exit.hasOwnProperty("target") || exit.target !== currTarget) continue;
        checkExits.push(exit);
      }

      if (checkExits.length > 0) {
        // if there are multiple exits to the same location find the closest one
        let currExit = checkExits.length > 1
          ? (() => {
            let useExit = checkExits.shift(); // assign the first exit as a possible result
            let dist = getDistance(me.x, me.y, useExit.x, useExit.y);
            while (checkExits.length > 0) {
              let exitDist = getDistance(me.x, me.y, checkExits[0].x, checkExits[0].y);
              if (exitDist < dist) {
                useExit = checkExits[0];
                dist = exitDist;
              }
              checkExits.shift();
            }
            return useExit;
          })()
          : checkExits[0];
        let dest = this.getNearestWalkable(currExit.x, currExit.y, 5, 1);
        if (!dest) return false;

        for (let retry = 0; retry < 3; retry++) {
          if (this.moveToEx(dest[0], dest[1], givenSettings)) {
            break;
          }

          delay(200);
          console.log("ÿc7(moveToExit) :: ÿc0Retry: " + (retry + 1));
          Misc.poll(() => me.gameReady, 1000, 200);
        }

        if (use || currTarget !== finalDest) {
          switch (currExit.type) {
          case 1: // walk through
            let targetRoom = this.getNearestRoom(currTarget);
            // might need adjustments
            if (!targetRoom) return false;
            this.moveToEx(targetRoom[0], targetRoom[1], givenSettings);

            break;
          case 2: // stairs
            if (!this.openExit(currTarget) && !this.useUnit(sdk.unittype.Stairs, currExit.tileid, currTarget)) {
              return false;
            }

            break;
          }
        }
      }
    }

    console.info(false, "ÿc7targetArea: ÿc0" + finalDestName + " ÿc7myArea: ÿc0" + getAreaName(me.area), "moveToExit");
    delay(300);

    return (use && finalDest ? me.area === finalDest : true);
  },

  /**
   * @param {number} area 
   * @param {number} exit 
   * @returns {number}
   */
  getDistanceToExit: function (area, exit) {
    area === undefined && (area = me.area);
    exit === undefined && (exit = me.area + 1);
    let areaToCheck = Misc.poll(() => getArea(area));
    if (!areaToCheck) throw new Error("Couldn't get area info for " + getAreaName(area));
    let exits = areaToCheck.exits;
    if (!exits.length) throw new Error("Failed to find exits");
    let loc = exits.find(a => a.target === exit);
    console.debug(area, exit, loc);
    return loc ? [loc.x, loc.y].distance : Infinity;
  },

  /**
   * @param {number} area 
   * @param {number} exit 
   * @returns {PathNode | false}
   */
  getExitCoords: function (area, exit) {
    area === undefined && (area = me.area);
    exit === undefined && (exit = me.area + 1);
    let areaToCheck = Misc.poll(() => getArea(area));
    if (!areaToCheck) throw new Error("Couldn't get area info for " + getAreaName(area));
    let exits = areaToCheck.exits;
    if (!exits.length) throw new Error("Failed to find exits");
    let loc = exits.find(a => a.target === exit);
    console.debug(area, exit, loc);
    return loc ? { x: loc.x, y: loc.y } : false;
  },


  /**
   * @param {number} area - the id of area to search for the room nearest to the player character
   * @returns {[number, number] | false}
   */
  getNearestRoom: function (area) {
    let x, y, minDist = 10000;

    let room = Misc.poll(() => getRoom(area), 1000, 200);
    if (!room) return false;

    do {
      let dist = getDistance(me, room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2);

      if (dist < minDist) {
        x = room.x * 5 + room.xsize / 2;
        y = room.y * 5 + room.ysize / 2;
        minDist = dist;
      }
    } while (room.getNext());

    room = getRoom(area, x, y);
    !!Config.DebugMode.Path && console.log(room);

    if (room) {
      CollMap.addRoom(room);

      return this.getNearestWalkable(x, y, 20, 4);
    }

    return [x, y];
  },

  /**
   * @param {number} targetArea - area id of where the unit leads to
   * @returns {boolean}
   */
  openExit: function (targetArea) {
    switch (true) {
    case targetArea === sdk.areas.AncientTunnels:
    case targetArea === sdk.areas.A2SewersLvl1 && !(me.inArea(sdk.areas.LutGholein) && [5218, 5180].distance < 20):
      return this.useUnit(sdk.unittype.Object, sdk.objects.TrapDoorA2, targetArea);
    case targetArea === sdk.areas.A3SewersLvl2:
      return this.useUnit(sdk.unittype.Object, sdk.objects.SewerStairsA3, targetArea);
    case targetArea === sdk.areas.RuinedTemple:
    case targetArea === sdk.areas.DisusedFane:
    case targetArea === sdk.areas.ForgottenReliquary:
    case targetArea === sdk.areas.ForgottenTemple:
    case targetArea === sdk.areas.RuinedFane:
    case targetArea === sdk.areas.DisusedReliquary:
      return this.useUnit(sdk.unittype.Object, "stair", targetArea);
    case targetArea === sdk.areas.DuranceOfHateLvl1 && me.inArea(sdk.areas.Travincal):
      return this.useUnit(sdk.unittype.Object, sdk.objects.DuranceEntryStairs, targetArea);
    case targetArea === sdk.areas.WorldstoneLvl1 && me.inArea(sdk.areas.ArreatSummit):
      return this.useUnit(sdk.unittype.Object, sdk.objects.AncientsDoor, targetArea);
    }

    return false;
  },

  /**
   * @param {UnitType} type - type of the unit to open
   * @param {number} id - id of the unit to open
   * @returns {boolean}
   */
  openUnit: function (type, id) {
    /** @type {ObjectUnit | Tile} */
    let unit = Misc.poll(() => getUnit(type, id), 1000, 200);
    if (!unit) throw new Error("openUnit: Unit not found. ID: " + unit);
    if (unit.mode !== sdk.objects.mode.Inactive) return true;

    return unit.openUnit();
  },

  /**
   * @param {UnitType} type - type of the unit to use
   * @param {number} id - id of the unit to use
   * @param {number} targetArea - area id of where the unit leads to
   * @returns {boolean}
   * @todo should use an object as param, or be changed to able to take an already found unit as a param
   */
  useUnit: function (type, id, targetArea) {
    /** @type {ObjectUnit | Tile} */
    let unit = Misc.poll(() => getUnit(type, id), 2000, 200);
    if (!unit) {
      throw new Error(
        "useUnit: Unit not found. TYPE: " + type + " ID: " + id
        + " MyArea: " + getAreaName(me.area)
        + (!!targetArea ? " TargetArea: " + getAreaName(targetArea) : "")
      );
    }
    
    return unit.useUnit(targetArea);
  },

  allowBroadcast: true,
  /**
   * Meant for use as a MfLeader to let MfHelpers know where to go next
   * @param {number} targetArea - area id
   */
  broadcastIntent: function broadcastIntent (targetArea) {
    if (Config.MFLeader
      && Pather.allowBroadcast
      // mfhelper is disabled for these scripts so announcing is pointless
      && !Loader.scriptName(0).toLowerCase().includes("diablo")
      && !Loader.scriptName(0).toLowerCase().includes("baal")) {
      let targetAct = sdk.areas.actOf(targetArea);
      me.act !== targetAct && say("goto A" + targetAct);
    }
  },

  /**
   * @param {number} targetArea - id of the area to enter
   * @param {boolean} check - force the waypoint menu
   * @returns {boolean}
   */
  useWaypoint: function useWaypoint (targetArea, check = false) {
    switch (targetArea) {
    case undefined:
      throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
    case null:
    case "random":
      check = true;

      break;
    default:
      if (typeof targetArea !== "number") throw new Error("useWaypoint: Invalid targetArea parameter");
      if (this.wpAreas.indexOf(targetArea) < 0) throw new Error("useWaypoint: Invalid area");

      break;
    }

    const destName = targetArea ? getAreaName(targetArea) : targetArea;
    Pather.broadcastIntent(targetArea);
    console.info(
      true,
      "ÿc7targetArea: ÿc0" + destName + " ÿc7myArea: ÿc0" + getAreaName(me.area),
      "useWaypoint"
    );

    MainLoop:
    for (let i = 0; i < 12; i += 1) {
      if (me.area === targetArea || me.dead) {
        break;
      }

      if (me.inTown) {
        if (me.inArea(sdk.areas.LutGholein)) {
          let npc = Game.getNPC(NPC.Warriv);

          if (!!npc && npc.distance < 50) {
            if (npc && npc.openMenu()) {
              Misc.useMenu(sdk.menu.GoWest);

              if (!Misc.poll(() => me.gameReady && me.inArea(sdk.areas.RogueEncampment), 2000, 100)) {
                throw new Error("Failed to go to act 1 using Warriv");
              }
              if (me.inArea(targetArea)) {
                break;
              }
            }
          }
        }

        /**
         * @todo If we start in a3 and want to go to a2, use Meshif
         * somehow need to take into account reason for wanting to change act though, e.g. If we were
         * going to a2 to revive a merc then running to the a3 waypoint takes us close to our goal.
         * On the other hand though if we are going to a2 to take a portal then using meshif makes sense
         * extending so far as not just starting next to him but finishing chores anywhere around ormus/wp
         * if we are all the way at Alkor then it wouldn't make sense
         */

        if (!getUIFlag(sdk.uiflags.Waypoint) && Town.getDistance("waypoint") > (Skill.haveTK ? 20 : 5)) {
          Town.move("waypoint");
        }
      }

      let wp = Game.getObject("waypoint");

      if (!!wp && wp.area === me.area) {
        let useTK = (Skill.useTK(wp) && i < 3);
        let pingDelay = me.getPingDelay();

        if (useTK && !getUIFlag(sdk.uiflags.Waypoint)) {
          wp.distance > 21 && Pather.moveNearUnit(wp, 20);
          Packet.telekinesis(wp);
        } else if (!me.inTown && wp.distance > 7) {
          this.moveToUnit(wp);
        }

        if (check || Config.WaypointMenu || !this.initialized) {
          if (!useTK && (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint))) {
            this.moveToUnit(wp) && Misc.click(0, 0, wp);
          }

          // handle getUnit bug
          if (me.inTown && !getUIFlag(sdk.uiflags.Waypoint) && wp.name.toLowerCase() === "dummy") {
            Town.getDistance("waypoint") > 5 && Town.move("waypoint");
            Misc.click(0, 0, wp);
          }

          let tick = getTickCount();

          while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), pingDelay * 2)) {
            // Waypoint screen is open
            if (getUIFlag(sdk.uiflags.Waypoint)) {
              delay(500);
              !Pather.initialized && (Pather.initialized = true);

              switch (targetArea) {
              case "random":
                let validWps = this.nonTownWpAreas
                  .filter(area => getWaypoint(this.wpAreas.indexOf(area)));
                if (!validWps.length) {
                  if (me.inTown && Pather.moveToExit(me.area + 1, true)) {
                    break;
                  }
                  throw new Error("Pather.useWaypoint: Failed to go to waypoint " + targetArea);
                }
                targetArea = validWps.random();

                break;
              case null:
                me.cancel();

                return true;
              }

              if (!getWaypoint(this.wpAreas.indexOf(targetArea))) {
                me.cancel();
                console.log("Trying to get the waypoint: " + getAreaName(targetArea));
                me.overhead("Trying to get the waypoint");
                if (this.getWP(targetArea)) return true;

                throw new Error("Pather.useWaypoint: Failed to go to waypoint " + getAreaName(targetArea));
              }

              break;
            }

            delay(10);
          }

          if (!getUIFlag(sdk.uiflags.Waypoint)) {
            console.warn("waypoint retry " + (i + 1));
            let retry = Math.min(i + 1, 5);
            let coord = CollMap.getRandCoordinate(me.x, -5 * retry, 5 * retry, me.y, -5 * retry, 5 * retry);
            !!coord && this.moveTo(coord.x, coord.y);
            delay(200);
            Packet.flash(me.gid, pingDelay);

            continue;
          }
        }

        if (!check || getUIFlag(sdk.uiflags.Waypoint)) {
          delay(200);
          wp.interact(targetArea);
          let tick = getTickCount();

          while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), pingDelay * 2)) {
            if (me.area === targetArea) {
              delay(1500);

              break MainLoop;
            }

            delay(20);
          }

          while (!me.gameReady) {
            delay(1000);
          }

          // In case lag causes the wp menu to stay open
          Misc.poll(() => me.gameReady, 2000, 100) && getUIFlag(sdk.uiflags.Waypoint) && me.cancelUIFlags();
        }

        Packet.flash(me.gid, pingDelay);
        // Activate check if we fail direct interact twice
        i > 1 && (check = true);
      } else {
        Packet.flash(me.gid);
      }

      // We can't seem to get the wp maybe attempt portal to town instead and try to use that wp
      i >= 10 && !me.inTown && Town.goToTown();
      delay(200);
    }

    if (me.area === targetArea) {
      // delay to allow act to init - helps with crashes
      delay(500);
      console.info(
        false,
        "ÿc7targetArea: ÿc0" + getAreaName(targetArea) + " ÿc7myArea: ÿc0" + getAreaName(me.area),
        "useWaypoint"
      );
      return true;
    }

    throw new Error("useWaypoint: Failed to use waypoint");
  },

  /**
   * @param {boolean} use - use the portal that was made
   * @returns {Unit | boolean}
   */
  makePortal: function (use = false) {
    if (me.inTown) return true;

    let oldGid;

    for (let i = 0; i < 5; i += 1) {
      if (me.dead) return false;

      const tpTool = me.getTpTool();
      const pingDelay = i === 0 ? 100 : me.gameReady ? (me.ping + 25) : 350;
      if (!tpTool) return false;

      let oldPortal = getUnits(sdk.unittype.Object, "portal")
        .filter(function (p) {
          return p.getParent() === me.name;
        })
        .first();

      !!oldPortal && (oldGid = oldPortal.gid);
      
      if (tpTool.use() || Game.getObject("portal")) {
        let tick = getTickCount();

        while (getTickCount() - tick < Math.max(500 + i * 100, pingDelay * 2 + 100)) {
          let portal = getUnits(sdk.unittype.Object, "portal")
            .filter(function (p) {
              return p.getParent() === me.name && p.gid !== oldGid;
            })
            .first();

          if (portal) {
            // getUnits returns a copied version, get the actual portal so we don't copy a copy
            const realPortal = Game.getObject(-1, -1, portal.gid);
            if (realPortal) {
              if (use) {
                if (this.usePortal(null, null, copyUnit(realPortal))) {
                  return true;
                }
                break; // don't spam usePortal
              } else {
                return copyUnit(realPortal);
              }
            }
          }

          delay(10);
        }
      } else {
        console.log("Failed to use tp tool");
        Packet.flash(me.gid, pingDelay);
        delay(200);
      }

      delay(40);
    }

    return false;
  },

  /**
   * @param {number} [targetArea] - id of the area the portal leads to
   * @param {string} [owner] - name of the portal's owner
   * @param {ObjectUnit} [unit] - use existing portal unit
   * @returns {boolean}
   */
  usePortal: function (targetArea, owner, unit) {
    if (targetArea && me.area === targetArea) return true;

    me.cancelUIFlags();

    const preArea = me.area;
    const changedArea = function () {
      return me.area !== preArea;
    };

    for (let i = 0; i < 10; i += 1) {
      if (me.dead) return false;
      i > 0 && me.inTown && Town.move("portalspot");

      const portal = unit
        ? copyUnit(unit)
        : this.getPortal(targetArea, owner);

      if (portal) {
        if (portal.objtype === sdk.areas.DuranceofHateLvl3 && portal.getParent() !== me.name
          && !Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)) {
          throw new Error("Cannot access meph through someone elses portal without first completing Travincal");
        }
        let redPortal = portal.classid === sdk.objects.RedPortal;

        if (portal.area === me.area) {
          if (Skill.useTK(portal) && i < 3) {
            if (portal.distance > 21) {
              me.inArea(sdk.areas.Harrogath)
                ? Town.move("portalspot")
                : Pather.moveNearUnit(portal, 20);
            }
            if (Packet.telekinesis(portal)) {
              if (Misc.poll(changedArea, 500, 50)) {
                Pather.lastPortalTick = getTickCount();
                delay(100);
                return true;
              }
            }
          } else {
            portal.distance > 5 && this.moveToUnit(portal);

            if (getTickCount() - this.lastPortalTick > 2500) {
              i < 2 ? Packet.entityInteract(portal) : Misc.click(0, 0, portal);
              !!redPortal && delay(150);
            } else {
              let timeTillNextPortal = Math.max(3, Math.round(2500 - (getTickCount() - this.lastPortalTick)));
              delay(timeTillNextPortal);
              
              continue;
            }
          }
        }

        // Portal to/from Arcane
        if (portal.classid === sdk.objects.ArcaneSanctuaryPortal && portal.mode !== sdk.objects.mode.Active) {
          Misc.click(0, 0, portal);
          let tick = getTickCount();

          while (getTickCount() - tick < 2000) {
            if (portal.mode === sdk.objects.mode.Active || me.inArea(sdk.areas.ArcaneSanctuary)) {
              break;
            }

            delay(10);
          }
        }

        if (Misc.poll(changedArea, 500, 3)) {
          Pather.lastPortalTick = getTickCount();
          delay(100);

          break;
        }

        i > 1 && Packet.flash(me.gid);
      } else {
        Packet.flash(me.gid);
      }

      delay(250);
    }

    return (targetArea ? me.area === targetArea : me.area !== preArea);
  },

  /**
   * @param {number} targetArea - id of the area the portal leads to
   * @param {string} owner - name of the portal's owner
   * @returns {ObjectUnit | false}
   */
  getPortal: function (targetArea, owner) {
    let portal = Game.getObject("portal");

    if (portal) {
      do {
        if (typeof targetArea !== "number" || portal.objtype === targetArea) {
          switch (owner) {
          case undefined: // Pather.usePortal(area) - red portal
            if (!portal.getParent() || portal.getParent() === me.name) {
              return copyUnit(portal);
            }

            break;
          case null: // Pather.usePortal(area, null) - any blue portal leading to area
            if (portal.getParent() === me.name || Misc.inMyParty(portal.getParent())) {
              return copyUnit(portal);
            }

            break;
          default: // Pather.usePortal(null, owner) - any blue portal belonging to owner OR Pather.usePortal(area, owner) - blue portal matching area and owner
            if (portal.getParent() === owner && (owner === me.name || Misc.inMyParty(owner))) {
              return copyUnit(portal);
            }

            break;
          }
        }
      } while (portal.getNext());
    }

    return false;
  },

  /**
   * @param {number} x - the starting x coord
   * @param {number} y - the starting y coord
   * @param {number} range - maximum allowed range from the starting coords
   * @param {number} step - distance between each checked dot on the grid
   * @param {number} coll - collision flag to avoid
   * @param {number} size 
   * @returns {[number, number] | false}
   */
  getNearestWalkable: function (x, y, range, step, coll, size) {
    !step && (step = 1);
    coll === undefined && (coll = sdk.collision.BlockWall);

    let distance = 1;
    let result = false;

    // Check if the original spot is valid
    if (this.checkSpot(x, y, coll, false, size)) {
      result = [x, y];
    }

    MainLoop:
    while (!result && distance < range) {
      for (let i = -distance; i <= distance; i += 1) {
        for (let j = -distance; j <= distance; j += 1) {
          // Check outer layer only (skip previously checked)
          if (Math.abs(i) >= Math.abs(distance) || Math.abs(j) >= Math.abs(distance)) {
            if (this.checkSpot(x + i, y + j, coll, false, size)) {
              result = [x + i, y + j];

              break MainLoop;
            }
          }
        }
      }

      distance += step;
    }

    CollMap.reset();

    return result;
  },

  /**
   * @param {number} x - the x coord to check
   * @param {number} y - the y coord to check
   * @param {number} coll - collision flag to search for
   * @param {boolean} cacheOnly - use only cached room data
   * @param {number} size 
   * @returns {boolean}
   */
  checkSpot: function (x, y, coll, cacheOnly, size) {
    coll === undefined && (coll = sdk.collision.BlockWall);
    !size && (size = 1);

    for (let dx = -size; dx <= size; dx += 1) {
      for (let dy = -size; dy <= size; dy += 1) {
        if (Math.abs(dx) !== Math.abs(dy)) {
          let value = CollMap.getColl(x + dx, y + dy, cacheOnly);

          if (value & coll) {
            return false;
          }
        }
      }
    }

    return true;
  },

  /**
   * @deprecated use `me.accessToAct(act)` instead
   * @param {number} act - the act number to check for access
   * @returns {boolean}
   */
  accessToAct: function (act) {
    return me.accessToAct(act);
  },

  /**
   * @param {number} area - the id of area to get the waypoint in
   * @param {boolean} [clearPath] 
   * @returns {boolean}
   */
  getWP: function (area, clearPath) {
    area !== me.area && this.journeyTo(area);

    for (let i = 0; i < sdk.waypoints.Ids.length; i++) {
      let preset = Game.getPresetObject(me.area, sdk.waypoints.Ids[i]);

      if (preset) {
        Skill.haveTK
          ? Pather.moveNearUnit(preset, 20, clearPath)
          : Pather.moveToUnit(preset, 0, 0, clearPath);

        let wp = Game.getObject("waypoint");

        if (wp) {
          for (let j = 0; j < 10; j++) {
            if (!getUIFlag(sdk.uiflags.Waypoint)) {
              if (wp.distance > 5 && Skill.useTK(wp) && j < 3) {
                wp.distance > 21 && Attack.getIntoPosition(wp, 20, sdk.collision.Ranged);
                Packet.telekinesis(wp);
              } else if (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint)) {
                this.moveToUnit(wp) && Misc.click(0, 0, wp);
              }
            }

            if (Misc.poll(() => me.gameReady && getUIFlag(sdk.uiflags.Waypoint), 1000, 150)) {
              delay(500);
              !Pather.initialized && (Pather.initialized = true);
              me.cancelUIFlags();

              return true;
            }

            // handle getUnit bug
            if (!getUIFlag(sdk.uiflags.Waypoint) && me.inTown && wp.name.toLowerCase() === "dummy") {
              Town.getDistance("waypoint") > 5 && Town.move("waypoint");
              Misc.click(0, 0, wp);
            }

            delay(500);
          }
        }
      }
    }

    return false;
  },

  /**
   * @param {number} area - the id of area to move to
   * @returns {boolean}
   * @todo refactor this, it's rather messy
   */
  journeyTo: function (area) {
    if (area === undefined) return false;
    let target, retry = 0;

    if (area !== sdk.areas.DurielsLair) {
      target = this.plotCourse(area, me.area);
    } else {
      target = { course: [sdk.areas.CanyonofMagic, sdk.areas.DurielsLair], useWP: false };
      this.wpAreas.indexOf(me.area) === -1 && (target.useWP = true);
    }

    console.info(true, "Course :: " + target.course, "journeyTo");
    if (area === sdk.areas.PandemoniumFortress && me.inArea(sdk.areas.DuranceofHateLvl3)) {
      target.useWP = false;
    }
    target.useWP && Town.goToTown();

    // handle variable flayer jungle entrances
    if (target.course.includes(sdk.areas.FlayerJungle)) {
      Town.goToTown(3); // without initiated act, getArea().exits will crash
      let special = getArea(sdk.areas.FlayerJungle);

      if (special) {
        special = special.exits;

        for (let i = 0; i < special.length; i += 1) {
          if (special[i].target === sdk.areas.GreatMarsh) {
            // add great marsh if needed
            target.course.splice(target.course.indexOf(sdk.areas.FlayerJungle), 0, sdk.areas.GreatMarsh);

            break;
          }
        }
      }
    }

    while (target.course.length) {
      const currArea = me.area;
      const targetArea = target.course[0];
      let unit;

      if (currArea === targetArea && target.course.shift()) {
        continue;
      }

      console.info(null, "ÿc0Moving from: " + getAreaName(currArea) + " to " + getAreaName(targetArea));

      if (!me.inTown) {
        Precast.doPrecast(false);
        
        if (this.wpAreas.includes(currArea)
          && !getWaypoint(this.wpAreas.indexOf(currArea))) {
          this.getWP(currArea);
        }
      }

      if (me.inTown && this.nextAreas[currArea] !== targetArea
        && this.wpAreas.includes(targetArea) && getWaypoint(this.wpAreas.indexOf(targetArea))) {
        this.useWaypoint(targetArea, !this.plotCourse_openedWpMenu);
        Precast.doPrecast(false);
      } else if (currArea === sdk.areas.StonyField && targetArea === sdk.areas.Tristram) {
        // Stony Field -> Tristram
        this.moveToPreset(currArea, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 0, 0, false, true);
        Misc.poll(() => this.usePortal(sdk.areas.Tristram), 5000, 1000);
      } else if (currArea === sdk.areas.LutGholein && targetArea === sdk.areas.A2SewersLvl1) {
        // Lut Gholein -> Sewers Level 1 (use Trapdoor)
        this.moveToPreset(currArea, sdk.unittype.Stairs, sdk.exits.preset.A2SewersTrapDoor);
        this.useUnit(sdk.unittype.Object, sdk.objects.TrapDoorA2, sdk.areas.A2SewersLvl1);
      } else if (currArea === sdk.areas.A2SewersLvl2 && targetArea === sdk.areas.A2SewersLvl1) {
        // Sewers Level 2 -> Sewers Level 1
        Pather.moveToExit(targetArea, false);
        this.useUnit(sdk.unittype.Stairs, sdk.objects.A2UndergroundUpStairs, sdk.areas.A2SewersLvl1);
      } else if (currArea === sdk.areas.PalaceCellarLvl3 && targetArea === sdk.areas.ArcaneSanctuary) {
        // Palace -> Arcane
        this.moveTo(10073, 8670);
        this.usePortal(null);
      } else if (currArea === sdk.areas.ArcaneSanctuary && targetArea === sdk.areas.PalaceCellarLvl3) {
        // Arcane Sanctuary -> Palace Cellar 3
        this.moveNearPreset(
          currArea,
          sdk.unittype.Object,
          sdk.objects.ArcaneSanctuaryPortal,
          (Skill.haveTK ? 20 : 5)
        );
        unit = Misc.poll(() => Game.getObject(sdk.objects.ArcaneSanctuaryPortal));
        unit && Pather.useUnit(sdk.unittype.Object, sdk.objects.ArcaneSanctuaryPortal, sdk.areas.PalaceCellarLvl3);
      } else if (currArea === sdk.areas.ArcaneSanctuary && targetArea === sdk.areas.CanyonofMagic) {
        // Arcane Sanctuary -> Canyon of the Magic
        this.moveToPreset(currArea, sdk.unittype.Object, sdk.objects.Journal);
        unit = Game.getObject(sdk.objects.RedPortal);

        if (!unit || !this.usePortal(null, null, unit)) {
          for (let i = 0; i < 5; i++) {
            unit = Game.getObject(sdk.objects.Journal);

            // couldnt find journal? Move to it's preset
            if (!unit) {
              Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.Journal);
              continue;
            } else if (unit && unit.distance > 20) {
              Pather.moveNearUnit(unit, 13);
            }

            Packet.entityInteract(unit);
            Misc.poll(() => getIsTalkingNPC(), 1000, 50);
            me.cancel();

            if (this.usePortal(sdk.areas.CanyonofMagic)) {
              break;
            }
          }
        }
      } else if (currArea === sdk.areas.CanyonofMagic && targetArea === sdk.areas.DurielsLair) {
        // Canyon -> Duriels Lair
        this.moveToExit(getRoom().correcttomb, true);
        this.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.HoradricStaffHolder);
        unit = Misc.poll(() => Game.getObject(sdk.objects.PortaltoDurielsLair));
        unit && Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair);
      } else if (currArea === sdk.areas.Travincal && targetArea === sdk.areas.DuranceofHateLvl1) {
        // Trav -> Durance Lvl 1
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.DuranceEntryStairs);
        this.useUnit(sdk.unittype.Object, sdk.objects.DuranceEntryStairs, sdk.areas.DuranceofHateLvl1);
      } else if (currArea === sdk.areas.DuranceofHateLvl3 && targetArea === sdk.areas.PandemoniumFortress) {
        // Durance Lvl 3 -> Pandemonium Fortress
        if (me.getQuest(sdk.quest.id.TheGuardian, sdk.quest.states.Completed) !== 1) {
          console.log(sdk.colors.Red + "(journeyTo) :: Incomplete Quest");
          return false;
        }

        Pather.moveTo(17581, 8070);
        delay(250 + me.ping * 2);
        this.useUnit(sdk.unittype.Object, sdk.objects.RedPortalToAct4, sdk.areas.PandemoniumFortress);
      } else if (currArea === sdk.areas.Harrogath && targetArea === sdk.areas.BloodyFoothills) {
        // Harrogath -> Bloody Foothills
        this.moveTo(5026, 5095);
        this.openUnit(sdk.unittype.Object, sdk.objects.Act5Gate);
        this.moveToExit(targetArea, true);
      } else if (currArea === sdk.areas.Harrogath && targetArea === sdk.areas.NihlathaksTemple) {
        // Harrogath -> Nihlathak's Temple
        Town.move(NPC.Anya);
        if (!Pather.getPortal(sdk.areas.NihlathaksTemple)
          && Misc.checkQuest(sdk.quest.id.PrisonofIce, sdk.quest.states.ReqComplete)) {
          Town.npcInteract("Anya");
        }
        this.usePortal(sdk.areas.NihlathaksTemple);
      } else if (currArea === sdk.areas.FrigidHighlands && targetArea === sdk.areas.Abaddon) {
        // Abaddon
        this.moveToPreset(sdk.areas.FrigidHighlands, sdk.unittype.Object, sdk.objects.RedPortal);
        this.usePortal(sdk.areas.Abaddon);
      } else if (currArea === sdk.areas.ArreatPlateau && targetArea === sdk.areas.PitofAcheron) {
        // Pits of Archeon
        this.moveToPreset(sdk.areas.ArreatPlateau, sdk.unittype.Object, sdk.objects.RedPortal);
        this.usePortal(sdk.areas.PitofAcheron);
      } else if (currArea === sdk.areas.FrozenTundra && targetArea === sdk.areas.InfernalPit) {
        // Infernal Pit
        this.moveToPreset(sdk.areas.FrozenTundra, sdk.unittype.Object, sdk.objects.RedPortal);
        this.usePortal(sdk.areas.InfernalPit);
      } else if (targetArea === sdk.areas.MooMooFarm) {
        // Moo Moo farm
        currArea !== sdk.areas.RogueEncampment && Town.goToTown(1);
        Town.move("stash") && (unit = this.getPortal(targetArea));
        unit && this.usePortal(null, null, unit);
      } else if ([
        sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain, sdk.areas.UberTristram
      ].includes(targetArea)) {
        // Uber Portals
        currArea !== sdk.areas.Harrogath && Town.goToTown(5);
        Town.move("stash") && (unit = this.getPortal(targetArea));
        unit && this.usePortal(null, null, unit);
      } else {
        this.moveToExit(targetArea, true);
      }

      // give time for act to load, increases stabilty of changing acts
      delay(500);

      if (me.area === targetArea) {
        target.course.shift();
        retry = 0;
      } else {
        if (retry > 3) {
          console.warn("Failed to journeyTo " + getAreaName(area) + " currentarea: " + getAreaName(me.area));
          return false;
        }
        retry++;
      }
    }

    console.info(false, "ÿc4MyArea: ÿc0" + getAreaName(me.area), "journeyTo");
    return me.area === area;
  },

  plotCourse_openedWpMenu: false,

  /**
   * Plot a course to a specific area
   * @param {number} src - starting area id
   * @param {number} dest - destination area id
   * @returns {{ course: number[], useWP: boolean } | false}
   * @todo this needs more checks
   */
  plotCourse: function (dest, src) {
    let node, prevArea;
    let useWP = false;
    let arr = [];
    // need to redo this...that's gonna be a pain
    const previousAreas = [
      sdk.areas.None, sdk.areas.None, sdk.areas.RogueEncampment, sdk.areas.BloodMoor, sdk.areas.ColdPlains,
      sdk.areas.UndergroundPassageLvl1, sdk.areas.DarkWood, sdk.areas.BlackMarsh,
      sdk.areas.BloodMoor, sdk.areas.ColdPlains, sdk.areas.StonyField,
      sdk.areas.BlackMarsh, sdk.areas.TamoeHighland, sdk.areas.CaveLvl1,
      sdk.areas.UndergroundPassageLvl1, sdk.areas.HoleLvl1,
      sdk.areas.PitLvl1, sdk.areas.ColdPlains, sdk.areas.BurialGrounds,
      sdk.areas.BurialGrounds, sdk.areas.BlackMarsh, sdk.areas.ForgottenTower,
      sdk.areas.TowerCellarLvl1, sdk.areas.TowerCellarLvl2,
      sdk.areas.TowerCellarLvl3, sdk.areas.TowerCellarLvl4, sdk.areas.TamoeHighland,
      sdk.areas.MonasteryGate, sdk.areas.OuterCloister, sdk.areas.Barracks,
      sdk.areas.JailLvl1, sdk.areas.JailLvl2,
      sdk.areas.JailLvl3, sdk.areas.InnerCloister, sdk.areas.Cathedral,
      sdk.areas.CatacombsLvl1, sdk.areas.CatacombsLvl2, sdk.areas.CatacombsLvl3,
      sdk.areas.StonyField, sdk.areas.RogueEncampment,
      sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.RockyWaste,
      sdk.areas.DryHills, sdk.areas.FarOasis, sdk.areas.LostCity,
      sdk.areas.ArcaneSanctuary, sdk.areas.LutGholein,
      sdk.areas.A2SewersLvl1, sdk.areas.A2SewersLvl2, sdk.areas.LutGholein,
      sdk.areas.HaremLvl1, sdk.areas.HaremLvl2, sdk.areas.PalaceCellarLvl1,
      sdk.areas.PalaceCellarLvl2, sdk.areas.RockyWaste,
      sdk.areas.DryHills, sdk.areas.HallsoftheDeadLvl1, sdk.areas.ValleyofSnakes,
      sdk.areas.StonyTombLvl1, sdk.areas.HallsoftheDeadLvl2, sdk.areas.ClawViperTempleLvl1, sdk.areas.FarOasis,
      sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.LostCity,
      sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic,
      sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic,
      sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic, sdk.areas.RogueEncampment,
      sdk.areas.PalaceCellarLvl3, sdk.areas.RogueEncampment, sdk.areas.KurastDocktown, sdk.areas.SpiderForest,
      sdk.areas.SpiderForest, sdk.areas.FlayerJungle, sdk.areas.LowerKurast,
      sdk.areas.KurastBazaar, sdk.areas.UpperKurast, sdk.areas.KurastCauseway,
      sdk.areas.SpiderForest, sdk.areas.SpiderForest, sdk.areas.FlayerJungle,
      sdk.areas.SwampyPitLvl1, sdk.areas.FlayerJungle, sdk.areas.FlayerDungeonLvl1,
      sdk.areas.SwampyPitLvl2, sdk.areas.FlayerDungeonLvl2,
      sdk.areas.UpperKurast, sdk.areas.A3SewersLvl1, sdk.areas.KurastBazaar,
      sdk.areas.KurastBazaar, sdk.areas.UpperKurast, sdk.areas.UpperKurast,
      sdk.areas.KurastCauseway, sdk.areas.KurastCauseway,
      sdk.areas.Travincal, sdk.areas.DuranceofHateLvl1, sdk.areas.DuranceofHateLvl2,
      sdk.areas.DuranceofHateLvl3, sdk.areas.PandemoniumFortress, sdk.areas.OuterSteppes, sdk.areas.PlainsofDespair,
      sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame, sdk.areas.PandemoniumFortress,
      sdk.areas.Harrogath, sdk.areas.BloodyFoothills, sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau,
      sdk.areas.CrystalizedPassage, sdk.areas.CrystalizedPassage, sdk.areas.GlacialTrail,
      sdk.areas.GlacialTrail, sdk.areas.FrozenTundra, sdk.areas.AncientsWay,
      sdk.areas.AncientsWay, sdk.areas.Harrogath,
      sdk.areas.NihlathaksTemple, sdk.areas.HallsofAnguish, sdk.areas.HallsofPain,
      sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau, sdk.areas.FrozenTundra,
      sdk.areas.ArreatSummit, sdk.areas.WorldstoneLvl1,
      sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction,
      sdk.areas.Harrogath, sdk.areas.Harrogath, sdk.areas.Harrogath, sdk.areas.Harrogath
    ];
    let visitedNodes = [];
    let toVisitNodes = [{ from: dest, to: null }];

    !src && (src = me.area);

    if (!this.plotCourse_openedWpMenu && me.inTown && this.nextAreas[me.area] !== dest && Pather.useWaypoint(null)) {
      Pather.plotCourse_openedWpMenu = true;
    }

    while (toVisitNodes.length > 0) {
      node = toVisitNodes[0];

      // If we've already visited it, just move on
      if (visitedNodes[node.from] === undefined) {
        visitedNodes[node.from] = node.to;

        if (this.areasConnected(node.from, node.to)) {
          // If we have this wp we can start from there
          if ((me.inTown // check wp in town
            || ((src !== previousAreas[dest] && dest !== previousAreas[src]) // check wp if areas aren't linked
              && previousAreas[src] !== previousAreas[dest])) // check wp if areas aren't linked with a common area
              && Pather.wpAreas.indexOf(node.from) > 0 && getWaypoint(Pather.wpAreas.indexOf(node.from))
          ) {
            if (node.from !== src) {
              useWP = true;
            }

            src = node.from;
          }

          // We found it, time to go
          if (node.from === src) {
            break;
          }

          if ((prevArea = previousAreas[node.from]) !== 0 && visitedNodes.indexOf(prevArea) === -1) {
            toVisitNodes.push({ from: prevArea, to: node.from });
          }

          for (prevArea = 1; prevArea < previousAreas.length; prevArea += 1) {
            // Only interested in those connected to node
            if (previousAreas[prevArea] === node.from && visitedNodes.indexOf(prevArea) === -1) {
              toVisitNodes.push({ from: prevArea, to: node.from });
            }
          }
        }

        toVisitNodes.shift();
      } else {
        useWP = true;
      }
    }

    arr.push(src);

    node = src;

    while (node !== dest && node !== undefined) {
      arr.push(node = visitedNodes[node]);
    }

    // Something failed
    if (node === undefined) {
      return false;
    }

    return { course: arr, useWP: useWP };
  },

  /**
   * Check if two areas are connected
   * @param {number} src - starting area id
   * @param {number} dest - destination area id
   * @returns {boolean}
   * @todo this needs more checks
   */
  areasConnected: function (src, dest) {
    if (src === sdk.areas.CanyonofMagic && dest === sdk.areas.ArcaneSanctuary) {
      return false;
    }

    return true;
  },
};

Pather.nextAreas[sdk.areas.RogueEncampment] = sdk.areas.BloodMoor;
Pather.nextAreas[sdk.areas.LutGholein] = sdk.areas.RockyWaste;
Pather.nextAreas[sdk.areas.KurastDocktown] = sdk.areas.SpiderForest;
Pather.nextAreas[sdk.areas.PandemoniumFortress] = sdk.areas.OuterSteppes;
Pather.nextAreas[sdk.areas.Harrogath] = sdk.areas.BloodyFoothills;
