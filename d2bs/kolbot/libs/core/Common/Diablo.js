/**
*  @filename    Diablo.js
*  @author      theBGuy
*  @desc        Handle Diablo related functions
*
*/

(function (module) {
  const Events = new (require("../../modules/Events"));
  
  const _Diablo = {
    on: Events.on,
    off: Events.off,
    once: Events.once,
    emit: Events.emit,

    diabloSpawned: false,
    diaWaitTime: Time.seconds(30),
    clearRadius: 30,
    clearType: sdk.monsters.spectype.All,
    done: false,
    waitForGlow: false,
    sealOrder: [],
    openedSeals: [],
    vizLayout: -1,
    seisLayout: -1,
    infLayout: -1,
    entranceCoords: new PathNode(7790, 5544),
    starCoords: new PathNode(7791, 5293),
    // path coordinates
    entranceToStar: [
      [7794, 5517], [7791, 5491], [7768, 5459],
      [7775, 5424], [7817, 5458], [7777, 5408],
      [7769, 5379], [7777, 5357], [7809, 5359],
      [7805, 5330], [7780, 5317], [7791, 5293]],
    starToVizA: [
      [7759, 5295], [7734, 5295], [7716, 5295], [7718, 5276],
      [7697, 5292], [7678, 5293], [7665, 5276], [7662, 5314]
    ],
    starToVizB: [
      [7759, 5295], [7734, 5295], [7716, 5295],
      [7701, 5315], [7666, 5313], [7653, 5284]
    ],
    starToSeisA: [
      [7781, 5259], [7805, 5258], [7802, 5237], [7776, 5228],
      [7775, 5205], [7804, 5193], [7814, 5169], [7788, 5153]
    ],
    starToSeisB: [
      [7781, 5259], [7805, 5258], [7802, 5237], [7776, 5228],
      [7811, 5218], [7807, 5194], [7779, 5193], [7774, 5160], [7803, 5154]
    ],
    starToInfA: [
      [7809, 5268], [7834, 5306], [7852, 5280],
      [7852, 5310], [7869, 5294], [7895, 5295], [7919, 5290]
    ],
    starToInfB: [
      [7809, 5268], [7834, 5306], [7852, 5280], [7852, 5310],
      [7869, 5294], [7895, 5274], [7927, 5275], [7932, 5297], [7923, 5313]
    ],
    // check for strays array
    cleared: [],

    /** @param {number[]} bytes */
    diabloLightsEvent: function (bytes = []) {
      if (!bytes || bytes.length !== 2) {
        return;
      }
      if (me.act !== 4) {
        return;
      }
      if (bytes[0] === 0x89 && bytes[1] === 0x0C) {
        console.debug("Diablo lights event detected");
        _Diablo.diabloSpawned = true;
        Misc._diabloSpawned = true;
        _Diablo.emit("diablospawned");
      }
    },

    addLightsEventListener: function () {
      addEventListener("gamepacket", _Diablo.diabloLightsEvent);
    },

    removeLightsEventListener: function () {
      removeEventListener("gamepacket", _Diablo.diabloLightsEvent);
    },

    diaSpawnWatcher: (
      /** @param {null | (() => void)} onSpawn */
      function (onSpawn = null) {
        let diaTick = 0;
      
        return function () {
          if (Common.Diablo.done) return false;
          // don't throw if we are doing chores
          if (Town.choresActive) return true;
          // check every 1/4 second
          if (getTickCount() - diaTick < 250) return true;
          diaTick = getTickCount();

          if (Common.Diablo.diabloSpawned) {
            if (typeof onSpawn === "function") {
              onSpawn();
            }
            throw new ScriptError("Diablo spawned");
          }
          return true;
        };
      }
    ),

    /**
      * @param {Monster} a 
      * @param {Monster} b 
      * @returns {number}
      */
    sort: function (a, b) {
      if (Config.BossPriority) {
        if ((a.isSuperUnique) && (b.isSuperUnique)) return getDistance(me, a) - getDistance(me, b);
        if (a.isSuperUnique) return -1;
        if (b.isSuperUnique) return 1;
      }

      // Entrance to Star / De Seis
      if (me.y > 5325 || me.y < 5260) return (a.y > b.y ? -1 : 1);
      // Vizier
      if (me.x < 7765) return (a.x > b.x ? -1 : 1);
      // Infector
      if (me.x > 7825) return (!checkCollision(me, a, sdk.collision.BlockWall) && a.x < b.x ? -1 : 1);

      return getDistance(me, a) - getDistance(me, b);
    },

    /**
      * @param {number} seal 
      * @param {number} value 
      * @returns {number}
      */
    getLayout: function (seal, value) {
      let sealPreset = Game.getPresetObject(sdk.areas.ChaosSanctuary, seal);
      if (!sealPreset) throw new Error("Seal preset not found. Can't continue.");
      let _seal = sealPreset.realCoords();

      if (_seal.y === value || _seal.x === value) {
        return 1;
      }

      return 2;
    },

    /**
      * - VizLayout - 1 = "Y", 2 = "L"
      * - SeisLayout - 1 = "2", 2 = "5"
      * - InfLayout - 1 = "I", 2 = "J"
      */
    initLayout: function () {
      // 1 = "Y", 2 = "L"
      _Diablo.vizLayout = this.getLayout(sdk.objects.DiabloSealVizier, 5275);
      // 1 = "2", 2 = "5"
      _Diablo.seisLayout = this.getLayout(sdk.objects.DiabloSealSeis, 7773);
      // 1 = "I", 2 = "J"
      _Diablo.infLayout = this.getLayout(sdk.objects.DiabloSealInfector, 7893);
    },

    /**
     * @param {number} classid 
     * @returns {number}
     */
    getSealDistance: function (classid) {
      let sealPreset = Game.getPresetObject(sdk.areas.ChaosSanctuary, classid);
      if (!sealPreset) throw new Error("Seal preset not found. Can't continue.");
      let seal = sealPreset.realCoords();
      return seal.distance;
    },

    /**
      * Follow static path
      * @param {number[][]} path 
      * @returns {void}
      */
    followPath: function (path) {
      if (Config.Diablo.Fast) {
        let last = path.last();
        let lastNode = new PathNode(last[0], last[1]);
        Pather.moveToUnit(lastNode);
        return;
      }

      const canTele = Pather.canTeleport();
      
      for (let i = 0; i < path.length; i++) {
        this.cleared.length > 0 && this.clearStrays();

        // no monsters at the next node, skip it
        let next = i + 1 !== path.length ? path[i + 1] : null;
        if (next && next.distance < 40 && next.mobCount({ range: 35 }) === 0) {
          continue;
        }

        let node = new PathNode(path[i][0], path[i][1]);
        Pather.moveTo(node.x, node.y, 3, node.distance > 50);
        Attack.clear(this.clearRadius, this.clearType, false, _Diablo.sort);

        // Push cleared positions so they can be checked for strays
        this.cleared.push(path[i]);

        // After 5 nodes go back 2 nodes to check for monsters - only think we should do this with tele chars
        if (canTele && i === 5 && path.length > 8) {
          path = path.slice(3);
          i = 0;
        }
      }
    },

    clearStrays: function () {
      const startPos = new PathNode(me.x, me.y);
      let monster = Game.getMonster();

      if (monster) {
        do {
          if (!monster || !monster.attackable) continue;
          for (let i = 0; i < this.cleared.length; i += 1) {
            let node = new PathNode(this.cleared[i][0], this.cleared[i][1]);
            if (node.distanceTo(monster) < 30
              && Attack.validSpot(monster.x, monster.y)
            ) {
              Pather.moveToUnit(monster);
              Attack.clear(15, this.clearType, false, _Diablo.sort);

              break;
            }
          }
        } while (monster.getNext());
      }

      startPos.distance > 5 && Pather.move(startPos);

      return true;
    },

    /**
      * @param {number[] | string[]} sealOrder 
      * @param {boolean} openSeals 
      */
    runSeals: function (sealOrder, openSeals = true) {
      console.log("seal order: " + sealOrder);
      _Diablo.sealOrder = sealOrder;
      const seals = {
        1: () => this.vizierSeal(openSeals),
        2: () => this.seisSeal(openSeals),
        3: () => this.infectorSeal(openSeals),
        "vizier": () => this.vizierSeal(openSeals),
        "seis": () => this.seisSeal(openSeals),
        "infector": () => this.infectorSeal(openSeals),
      };
      sealOrder.forEach(function (seal) {
        if (_Diablo.diabloSpawned) return;
        try {
          seals[seal]();
        } catch (e) {
          if (e instanceof ScriptError) {
            throw e;
          }

          if (e instanceof Error && e.message.includes("Failed to kill")) {
            if (Loader.scriptName() === "DiabloHelper") {
              console.warn(e);
            } else {
              throw e;
            }
          }
        }
      });
    },

    /**
      * Attempt casting telekinesis on seal to activate it
      * @param {Unit} seal 
      * @returns {boolean}
      */
    tkSeal: function (seal) {
      if (!Skill.useTK(seal)) return false;

      const checkSeal = function () {
        return seal.mode;
      };

      for (let i = 0; i < 5; i++) {
        seal.distance > 20 && Attack.getIntoPosition(seal, 18, sdk.collision.WallOrRanged);
        
        if (Packet.telekinesis(seal) && Misc.poll(checkSeal, 1000, 100)) {
          break;
        }
      }

      return !!seal.mode;
    },

    /**
      * Open one of diablos seals
      * @param {number} classid 
      * @returns {boolean}
      */
    openSeal: function (classid) {
      let seal;
      const mainSeal = [
        sdk.objects.DiabloSealVizier,
        sdk.objects.DiabloSealSeis,
        sdk.objects.DiabloSealInfector
      ].includes(classid);
      const warn = Config.PublicMode && mainSeal && Loader.scriptName() === "Diablo";
      const seisSeal = classid === sdk.objects.DiabloSealSeis;
      const infSeal = [sdk.objects.DiabloSealInfector, sdk.objects.DiabloSealInfector2].includes(classid);
      let usetk = (Skill.haveTK && (!seisSeal || this.seisLayout !== 1));

      for (let i = 0; i < 5; i++) {
        if (!seal) {
          usetk
            ? Pather.moveNearPreset(sdk.areas.ChaosSanctuary, sdk.unittype.Object, classid, 15)
            : Pather.moveToPresetObject(
              sdk.areas.ChaosSanctuary,
              classid,
              { offX: seisSeal ? 5 : 2, offY: seisSeal ? 5 : 0 }
            );
          seal = Misc.poll(() => Game.getObject(classid), 1000, 100);
        }

        if (!seal) {
          console.debug("Couldn't find seal: " + classid);
          return false;
        }

        if (seal.mode) {
          console.debug("Seal " + classid + " is already open.");
          warn && say(Config.Diablo.SealWarning);
          return true;
        }

        // Clear around Infector seal, Any leftover abyss knights casting decrep is bad news with Infector
        if ((infSeal || i > 1) && me.getMobCount() > 1) {
          Attack.clear(15);
          // Move back to seal
          usetk ? Pather.moveNearUnit(seal, 15) : Pather.moveToUnit(seal, seisSeal ? 5 : 2, seisSeal ? 5 : 0);
        }

        if (usetk && this.tkSeal(seal)) {
          return seal.mode;
        } else {
          usetk && (usetk = false);

          if (classid === sdk.objects.DiabloSealInfector && me.assassin && this.infLayout === 1) {
            if (Config.UseTraps && me.classid === sdk.player.class.Assassin) {
              let check = ClassAttack[me.classid].checkTraps({ x: 7899, y: 5293 });
              check && ClassAttack[me.classid].placeTraps({ x: 7899, y: 5293 }, check);
            }
          }

          seisSeal ? Misc.poll(function () {
            // stupid diablo shit, walk around the de-seis seal clicking it until we find "the spot"...sigh
            if (!seal.mode) {
              Pather.walkTo(seal.x + (rand(-1, 1)), seal.y + (rand(-1, 1)));
              clickUnitAndWait(0, 0, seal) || seal.interact();
            }
            return !!seal.mode;
          }, 3000, 60) : seal.interact();

          // de seis optimization
          if (seisSeal && Attack.validSpot(seal.x + 15, seal.y)) {
            Pather.walkTo(seal.x + 15, seal.y);
          } else {
            Pather.walkTo(seal.x - 5, seal.y - 5);
          }
        }

        delay(seisSeal ? 1000 + me.ping : 500 + me.ping);

        if (seal.mode) {
          break;
        }
      }

      return (!!seal && seal.mode);
    },

    /**
      * @param {boolean} openSeal 
      * @returns {boolean}
      */
    vizierSeal: function (openSeal = true) {
      const vizier = getLocaleString(sdk.locale.monsters.GrandVizierofChaos);
      if (Attack.haveKilled(vizier)) {
        return true;
      }
      console.log("Viz layout " + _Diablo.vizLayout);
      const path = (_Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB);
      const distCheck = path.last();

      if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
        _Diablo.vizLayout === 1 ? Pather.moveTo(7708, 5269) : Pather.moveTo(7647, 5267);
        Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, { range: 35, duration: 3000, skipBlocked: true });
        Config.Diablo.SealLeader && Pather.makePortal() && say("in");
      }

      if (distCheck.distance > 30) {
        this.followPath(path);
      }

      const seals = [sdk.objects.DiabloSealVizier2, sdk.objects.DiabloSealVizier];
      
      const tryOpenSeals = function () {
        if (!openSeal) return true;
        for (let s of seals) {
          if (!_Diablo.openSeal(s)) {
            return false;
          }
        }
        return true;
      };
      
      if (!tryOpenSeals()) {
        throw new Error("Failed to open Vizier seals.");
      }

      delay(1 + me.ping);
      const cb = function () {
        let viz = Game.getMonster(vizier);
        return viz && (viz.distance < Skill.getRange(Config.AttackSkill[1]) || viz.dead);
      };
      /**
        * @todo better coords or maybe a delay, viz appears in different locations and sometimes its right where we are moving to
        * which is okay for hammerdins or melee chars but not for soft chars like sorcs
        */
      _Diablo.vizLayout === 1
        ? Pather.moveToEx(7691, 5292, { callback: cb })
        : Pather.moveToEx(7695, 5316, { callback: cb });

      
      try {
        if (!_Diablo.getBoss(vizier)) {
          throw new Error("Failed to kill Vizier");
        }
      } catch (e) {
        if (e instanceof ScriptError) {
          throw e;
        }
        // sometimes we fail just because we aren't in range, move back towards star while checking
        Pather.moveToEx(this.starCoords.x, this.starCoords.y, { minDist: 15, callback: cb });
        if (!_Diablo.getBoss(vizier)) {
          throw new Error("Failed to kill Vizier - " + e.message);
        }
      }

      Config.Diablo.SealLeader && say("out");

      return true;
    },

    /**
      * @param {boolean} openSeal 
      * @returns {boolean}
      */
    seisSeal: function (openSeal = true) {
      const deSeis = getLocaleString(sdk.locale.monsters.LordDeSeis);
      if (Attack.haveKilled(deSeis)) {
        return true;
      }
      console.log("Seis layout " + _Diablo.seisLayout);
      const path = (_Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);
      const distCheck = path.last();

      if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
        _Diablo.seisLayout === 1 ? Pather.moveTo(7767, 5147) : Pather.moveTo(7820, 5147);
        Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, { range: 35, duration: 3000, skipBlocked: true });
        Config.Diablo.SealLeader && Pather.makePortal() && say("in");
      }

      if (distCheck.distance > 30) {
        this.followPath(path);
      }

      if (openSeal && !_Diablo.openSeal(sdk.objects.DiabloSealSeis)) {
        throw new Error("Failed to open de Seis seal.");
      }

      const cb = function () {
        let seis = Game.getMonster(deSeis);
        return seis && (seis.distance < Skill.getRange(Config.AttackSkill[1]) || seis.dead);
      };

      _Diablo.seisLayout === 1
        ? Pather.moveToEx(7798, 5194, { callback: cb })
        : Pather.moveToEx(7796, 5155, { callback: cb });
      
      try {
        if (!_Diablo.getBoss(deSeis)) {
          throw new Error("Failed to kill de Seis");
        }
      } catch (e) {
        if (e instanceof ScriptError) {
          throw e;
        }
        // sometimes we fail just because we aren't in range,
        Pather.moveToEx(this.starCoords.x, this.starCoords.y, { minDist: 15, callback: () => {
          let seis = Game.getMonster(deSeis);
          return seis && (seis.distance < 30 || seis.dead);
        } });
        if (!_Diablo.getBoss(deSeis)) {
          throw new Error("Failed to kill de Seis - " + e.message);
        }
      }

      Config.Diablo.SealLeader && say("out");

      return true;
    },

    /**
      * @param {boolean} openSeal 
      * @returns {boolean}
      */
    infectorSeal: function (openSeal = true) {
      const infector = getLocaleString(sdk.locale.monsters.InfectorofSouls);
      if (Attack.haveKilled(infector)) {
        return true;
      }
      Precast.doPrecast(true);
      console.log("Inf layout " + _Diablo.infLayout);
      const path = (_Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB);
      const distCheck = path.last();
      const seals = [sdk.objects.DiabloSealInfector2, sdk.objects.DiabloSealInfector];

      if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
        _Diablo.infLayout === 1 ? Pather.moveTo(7860, 5314) : Pather.moveTo(7909, 5317);
        Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, { range: 35, duration: 3000, skipBlocked: true });
        Config.Diablo.SealLeader && Pather.makePortal() && say("in");
      }

      if (distCheck.distance > 70) {
        this.followPath(path);
      }
      
      const cb = function () {
        let inf = Game.getMonster(infector);
        return inf && (inf.distance < Skill.getRange(Config.AttackSkill[1]) || inf.dead);
      };

      const moveToLoc = function () {
        if (_Diablo.infLayout === 1) {
          if (me.sorceress || me.assassin) {
            Pather.moveToEx(7876, 5296, { callback: cb });
          }
          delay(1 + me.ping);
        } else {
          delay(1 + me.ping);
          Pather.moveToEx(7928, 5295, { callback: cb });
        }
      };

      const tryOpenSeals = function () {
        if (!openSeal) return true;
        for (let s of seals) {
          if (!_Diablo.openSeal(s)) {
            return false;
          }
        }
        return true;
      };

      try {
        if (Config.Diablo.Fast) {
          if (!tryOpenSeals()) {
            throw new Error("Failed to open Infector seals.");
          }
          moveToLoc();

          if (!_Diablo.getBoss(infector)) {
            throw new Error("Failed to kill Infector");
          }
        } else {
          if (openSeal && !_Diablo.openSeal(sdk.objects.DiabloSealInfector)) {
            throw new Error("Failed to open Infector seals.");
          }
          moveToLoc();

          if (!_Diablo.getBoss(infector)) {
            throw new Error("Failed to kill Infector");
          }
          if (openSeal && !_Diablo.openSeal(sdk.objects.DiabloSealInfector2)) {
            throw new Error("Failed to open Infector seals.");
          }
          // wait until seal has been popped to avoid missing diablo due to wait time ending before he spawns, happens if leader does town chores after seal boss
          !openSeal && [3, "infector"].includes(_Diablo.sealOrder.last()) && Misc.poll(() => {
            if (_Diablo.diabloSpawned) return true;

            let lastSeal = Game.getObject(sdk.objects.DiabloSealInfector2);
            if (lastSeal && lastSeal.mode) {
              return true;
            }
            return false;
          }, Time.minutes(3), 1000);
        }
      } catch (e) {
        if (e instanceof ScriptError) {
          throw e;
        }
        if (e instanceof Error && e.message === "Diablo not found") {
          throw e;
        }
        if (e instanceof Error && e.message === "Failed to kill Infector") {
          // sometimes we fail just because we aren't in range,
          Pather.moveToEx(this.starCoords.x, this.starCoords.y, { minDist: 15, callback: () => {
            let inf = Game.getMonster(infector);
            return inf && (inf.distance < 30 || inf.dead);
          } });
          if (!_Diablo.getBoss(infector)) {
            // e.message is provably identical to this literal (guarded above) - chaining would duplicate
            throw new Error("Failed to kill Infector");
          }
        }
      }

      Config.Diablo.SealLeader && say("out");

      return true;
    },

    /**
      * @param {string | number} name 
      * @param {number} [amount=5] 
      * @returns {boolean}
      */
    hammerdinPreAttack: function (name, amount = 5) {
      if (!me.paladin || !me.getSkill(sdk.skills.BlessedHammer)) return false;
      
      let target = Game.getMonster(name);
      if (!target || !target.attackable) return true;

      let positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

      for (let pos of positions) {
        const [offX, offY] = pos;
        // check if we can move there
        if (Attack.validSpot(target.x + offX, target.y + offY)) {
          Pather.moveTo(target.x + offX, target.y + offY);
          Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);

          for (let n = 0; n < amount; n += 1) {
            Skill.cast(sdk.skills.BlessedHammer, sdk.skills.hand.Left);
            target = Game.getMonster(name);
            if (!target || !target.attackable) return true;
          }

          return true;
        }
      }
      
      return false;
    },

    /**
      * @param {string} id 
      * @returns {boolean}
      */
    preattack: function (id) {
      const coords = (function () {
        switch (id) {
        case getLocaleString(sdk.locale.monsters.GrandVizierofChaos):
          return _Diablo.vizLayout === 1 ? [7676, 5295] : [7684, 5318];
        case getLocaleString(sdk.locale.monsters.LordDeSeis):
          return _Diablo.seisLayout === 1 ? [7778, 5216] : [7775, 5208];
        case getLocaleString(sdk.locale.monsters.InfectorofSouls):
          return _Diablo.infLayout === 1 ? [7913, 5292] : [7915, 5280];
        default:
          return [];
        }
      })();
      if (!coords.length) return false;
      
      let boss = Game.getMonster(id);
      if (boss && boss.dead) return true;

      switch (me.classid) {
      case sdk.player.class.Sorceress:
        if ([
          sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb, sdk.skills.FireWall
        ].includes(Config.AttackSkill[1])) {
          me.skillDelay && delay(500);
          Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, coords[0], coords[1]);

          return true;
        }

        break;
      case sdk.player.class.Paladin:
        return this.hammerdinPreAttack(id, 8);
      case sdk.player.class.Assassin:
        if (Config.UseTraps) {
          let trapCheck = ClassAttack[me.classid].checkTraps({ x: coords[0], y: coords[1] });

          if (trapCheck) {
            ClassAttack[me.classid].placeTraps({ x: coords[0], y: coords[1] }, 5);

            return true;
          }
        }

        break;
      }

      return false;
    },

    /**
      * @param {string | number} name 
      * @returns {boolean}
      */
    getBoss: function (name) {
      // reasonable timeout to find boss before assuming something went wrong
      const timeout = getTickCount() + Time.minutes(3);
      
      let glow = Game.getObject(sdk.objects.SealGlow);

      if (this.waitForGlow) {
        while (true) {
          if (!this.preattack(name)) {
            delay(500);
          }

          glow = Game.getObject(sdk.objects.SealGlow);

          if (glow) {
            break;
          }

          if (getTickCount() > timeout) {
            throw new Error(name + " not found");
          }
        }
      }

      for (let i = 0; i < 16; i += 1) {
        let boss = Game.getMonster(name);

        if (boss) {
          _Diablo.hammerdinPreAttack(name, 8);
          if (!Config.Diablo.Fast && boss.distance > 40) {
            //
          }
          return (Config.Diablo.Fast ? Attack.kill(boss) : Attack.clear(40, 0, boss, this.sort));
        }

        delay(250);
      }

      return !!glow;
    },

    moveToStar: function () {
      switch (me.classid) {
      case sdk.player.class.Amazon:
      case sdk.player.class.Sorceress:
      case sdk.player.class.Necromancer:
      case sdk.player.class.Assassin:
        return Pather.moveNear(7791, 5293, (me.sorceress ? 35 : 25), { returnSpotOnError: true });
      case sdk.player.class.Paladin:
      case sdk.player.class.Druid:
      case sdk.player.class.Barbarian:
        return Pather.moveTo(7788, 5292);
      }

      return false;
    },

    diabloPrep: function () {
      if (!me.inArea(sdk.areas.ChaosSanctuary)) {
        if (!me.inArea(sdk.areas.PandemoniumFortress)) {
          Town.goToTown(4);
        }

        Town.move("portalspot");
        
        let tookPortalToChaos = getUnits(sdk.unittype.Object, "portal").filter(function (portal) {
          return portal.objtype === sdk.areas.ChaosSanctuary;
        }).sort(function (a, b) {
          let aParent = a.getParent ? a.getParent() : null;
          let bParent = b.getParent ? b.getParent() : null;
          if (aParent === me.name) return -1;
          if (bParent === me.name) return 1;
          return getDistance(me, a) - getDistance(me, b);
        }).some(function (portal) {
          return Pather.usePortal(null, null, portal);
        });

        if (!tookPortalToChaos) {
          throw new Error("Failed to go to Chaos Sanctuary");
        }
      }
      
      if (Config.Diablo.SealLeader) {
        Pather.moveTo(7763, 5267);
        Pather.makePortal() && say("in");
        Pather.moveTo(7788, 5292);
      }

      this.moveToStar();

      let tick = getTickCount();

      while (getTickCount() - tick < this.diaWaitTime) {
        if (getTickCount() - tick >= Time.seconds(8)) {
          switch (me.classid) {
          case sdk.player.class.Sorceress:
            if ([
              sdk.skills.Meteor,
              sdk.skills.Blizzard,
              sdk.skills.FrozenOrb,
              sdk.skills.FireWall
            ].includes(Config.AttackSkill[1])
            ) {
              Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, 7793 + rand(-1, 1), 5293);
            }

            delay(500);

            break;
          case sdk.player.class.Paladin:
            Skill.setSkill(Config.AttackSkill[2]);
            if (Config.AttackSkill[1] === sdk.skills.BlessedHammer) {
              Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Left);
            }

            break;
          case sdk.player.class.Druid:
            if ([sdk.skills.Tornado, sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
              Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, 7793 + rand(-1, 1), 5293);

              break;
            }

            delay(500);

            break;
          case sdk.player.class.Assassin:
            if (Config.UseTraps) {
              let trapCheck = ClassAttack[me.classid].checkTraps({ x: 7793, y: 5293 });
              if (trapCheck) {
                ClassAttack[me.classid].placeTraps({ x: 7793, y: 5293, classid: sdk.monsters.Diablo }, trapCheck);
              }
            }

            if (Config.AttackSkill[1] === sdk.skills.ShockWeb) {
              Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, 7793, 5293);
            }

            delay(500);

            break;
          default:
            delay(500);

            break;
          }
        } else {
          delay(500);
        }

        if (Game.getMonster(sdk.monsters.Diablo)) {
          return true;
        }
      }

      throw new Error("Diablo not found");
    },
  };

  module.exports = _Diablo;
})(module);
