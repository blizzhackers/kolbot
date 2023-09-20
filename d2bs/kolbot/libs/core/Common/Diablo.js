/**
*  @filename    Diablo.js
*  @author      theBGuy
*  @desc        Handle Diablo related functions
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  /**
   * @todo
   * - keep track of seals opened and bosses killed to
   * - improve targetting when using getBoss, sometimes we run to the location we want to attack from while running past the boss
   * I see this mostly with viz, also have seen seis fail due to not being close enough, even though he spawned
   */
  Object.defineProperty(Common, "Diablo", {
    /**
     * @namespace Common
     * 
     * @typedef Diablo
     * @property {boolean} diabloSpawned
     * 
     */
    value: {
      diabloSpawned: false,
      diaWaitTime: Time.seconds(30),
      clearRadius: 30,
      done: false,
      waitForGlow: false,
      sealOrder: [],
      openedSeals: [],
      vizLayout: -1,
      seisLayout: -1,
      infLayout: -1,
      entranceCoords: { x: 7790, y: 5544 },
      starCoords: { x: 7791, y: 5293 },
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

      diabloLightsEvent: function (bytes = []) {
        if (me.inArea(sdk.areas.ChaosSanctuary)
          && bytes && bytes.length === 2 && bytes[0] === 0x89 && bytes[1] === 0x0C) {
          Common.Diablo.diabloSpawned = true;
        }
      },

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

      getLayout: function (seal, value) {
        let sealPreset = Game.getPresetObject(sdk.areas.ChaosSanctuary, seal);
        if (!seal) throw new Error("Seal preset not found. Can't continue.");

        if (sealPreset.roomy * 5 + sealPreset.y === value
          || sealPreset.roomx * 5 + sealPreset.x === value) {
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
        Common.Diablo.vizLayout = this.getLayout(sdk.objects.DiabloSealVizier, 5275);
        // 1 = "2", 2 = "5"
        Common.Diablo.seisLayout = this.getLayout(sdk.objects.DiabloSealSeis, 7773);
        // 1 = "I", 2 = "J"
        Common.Diablo.infLayout = this.getLayout(sdk.objects.DiabloSealInfector, 7893);
      },

      /**
       * Follow static path
       * @param {number[][]} path 
       * @returns {void}
       */
      followPath: function (path) {
        if (Config.Diablo.Fast) {
          let last = path.last();
          let lastNode = { x: last[0], y: last[1] };
          Pather.moveToUnit(lastNode);
          return;
        }
        
        for (let i = 0; i < path.length; i++) {
          this.cleared.length > 0 && this.clearStrays();

          // no monsters at the next node, skip it
          let next = i + 1 !== path.length ? path[i + 1] : null;
          if (next && next.distance < 40 && next.mobCount({ range: 35 }) === 0) {
            continue;
          }

          Pather.moveTo(path[i][0], path[i][1], 3, getDistance(me, path[i][0], path[i][1]) > 50);
          Attack.clear(this.clearRadius, 0, false, Common.Diablo.sort);

          // Push cleared positions so they can be checked for strays
          this.cleared.push(path[i]);

          // After 5 nodes go back 2 nodes to check for monsters
          if (i === 5 && path.length > 8) {
            path = path.slice(3);
            i = 0;
          }
        }
      },

      clearStrays: function () {
        let oldPos = { x: me.x, y: me.y };
        let monster = Game.getMonster();

        if (monster) {
          do {
            if (monster.attackable) {
              for (let i = 0; i < this.cleared.length; i += 1) {
                if (getDistance(monster, this.cleared[i][0], this.cleared[i][1]) < 30
                  && Attack.validSpot(monster.x, monster.y)) {
                  Pather.moveToUnit(monster);
                  Attack.clear(15, 0, false, Common.Diablo.sort);

                  break;
                }
              }
            }
          } while (monster.getNext());
        }

        getDistance(me, oldPos.x, oldPos.y) > 5 && Pather.moveTo(oldPos.x, oldPos.y);

        return true;
      },

      /**
       * @param {number[] | string[]} sealOrder 
       * @param {boolean} openSeals 
       */
      runSeals: function (sealOrder, openSeals = true, recheck = false) {
        console.log("seal order: " + sealOrder);
        Common.Diablo.sealOrder = sealOrder;
        let seals = {
          1: () => this.vizierSeal(openSeals),
          2: () => this.seisSeal(openSeals),
          3: () => this.infectorSeal(openSeals),
          "vizier": () => this.vizierSeal(openSeals),
          "seis": () => this.seisSeal(openSeals),
          "infector": () => this.infectorSeal(openSeals),
        };
        try {
          recheck && addEventListener("gamepacket", Common.Diablo.diabloLightsEvent);
          sealOrder.forEach(seal => {
            if (recheck && Common.Diablo.diabloSpawned) throw new ScriptError("Diablo spawned");
            seals[seal]();
          });
        } catch (e) {
          if (!(e instanceof ScriptError)) {
            throw e; // it wasn't the custom error so throw it to the next handler
          }
        } finally {
          recheck && removeEventListener("gamepacket", Common.Diablo.diabloLightsEvent);
        }
      },

      /**
       * Attempt casting telekinesis on seal to activate it
       * @param {Unit} seal 
       * @returns {boolean}
       */
      tkSeal: function (seal) {
        if (!Skill.useTK(seal)) return false;

        for (let i = 0; i < 5; i++) {
          seal.distance > 20 && Attack.getIntoPosition(seal, 18, sdk.collision.WallOrRanged);
          
          if (Packet.telekinesis(seal)
            && Misc.poll(() => seal.mode, 1000, 100)) {
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
          sdk.objects.DiabloSealVizier, sdk.objects.DiabloSealSeis, sdk.objects.DiabloSealInfector
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
              if (Config.UseTraps) {
                let check = ClassAttack.checkTraps({ x: 7899, y: 5293 });
                check && ClassAttack.placeTraps({ x: 7899, y: 5293 }, check);
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
        console.log("Viz layout " + Common.Diablo.vizLayout);
        let path = (Common.Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB);
        let distCheck = path.last();

        if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
          Common.Diablo.vizLayout === 1 ? Pather.moveTo(7708, 5269) : Pather.moveTo(7647, 5267);
          Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, 35, 3000, true);
          Config.Diablo.SealLeader && Pather.makePortal() && say("in");
        }

        distCheck.distance > 30 && this.followPath(Common.Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB);

        if (openSeal
          && ![sdk.objects.DiabloSealVizier2, sdk.objects.DiabloSealVizier].every(s => Common.Diablo.openSeal(s))) {
          throw new Error("Failed to open Vizier seals.");
        }

        delay(1 + me.ping);
        let cb = () => {
          let viz = Game.getMonster(getLocaleString(sdk.locale.monsters.GrandVizierofChaos));
          return viz && (viz.distance < Skill.getRange(Config.AttackSkill[1]) || viz.dead);
        };
        /**
         * @todo better coords or maybe a delay, viz appears in different locations and sometimes its right where we are moving to
         * which is okay for hammerdins or melee chars but not for soft chars like sorcs
         */
        Common.Diablo.vizLayout === 1
          ? Pather.moveToEx(7691, 5292, { callback: cb })
          : Pather.moveToEx(7695, 5316, { callback: cb });

        if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.GrandVizierofChaos))) {
          throw new Error("Failed to kill Vizier");
        }

        Config.Diablo.SealLeader && say("out");

        return true;
      },

      /**
       * @param {boolean} openSeal 
       * @returns {boolean}
       */
      seisSeal: function (openSeal = true) {
        console.log("Seis layout " + Common.Diablo.seisLayout);
        let path = (Common.Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);
        let distCheck = path.last();

        if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
          Common.Diablo.seisLayout === 1 ? Pather.moveTo(7767, 5147) : Pather.moveTo(7820, 5147);
          Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, 35, 3000, true);
          Config.Diablo.SealLeader && Pather.makePortal() && say("in");
        }

        if (distCheck.distance > 30) {
          this.followPath(Common.Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);
        }

        if (openSeal && !Common.Diablo.openSeal(sdk.objects.DiabloSealSeis)) {
          throw new Error("Failed to open de Seis seal.");
        }
        let cb = () => {
          let seis = Game.getMonster(getLocaleString(sdk.locale.monsters.LordDeSeis));
          return seis && (seis.distance < Skill.getRange(Config.AttackSkill[1]) || seis.dead);
        };
        Common.Diablo.seisLayout === 1
          ? Pather.moveToEx(7798, 5194, { callback: cb })
          : Pather.moveToEx(7796, 5155, { callback: cb });
        try {
          if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) {
            throw new Error("Failed to kill de Seis");
          }
        } catch (e) {
          // sometimes we fail just because we aren't in range,
          Pather.moveToEx(this.starCoords.x, this.starCoords.y, { minDist: 15, callback: () => {
            let seis = Game.getMonster(getLocaleString(sdk.locale.monsters.LordDeSeis));
            return seis && (seis.distance < 30 || seis.dead);
          } });
        }

        Config.Diablo.SealLeader && say("out");

        return true;
      },

      /**
       * @param {boolean} openSeal 
       * @returns {boolean}
       */
      infectorSeal: function (openSeal = true) {
        Precast.doPrecast(true);
        console.log("Inf layout " + Common.Diablo.infLayout);
        let path = (Common.Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB);
        let distCheck = path.last();

        if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
          Common.Diablo.infLayout === 1 ? Pather.moveTo(7860, 5314) : Pather.moveTo(7909, 5317);
          Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, 35, 3000, true);
          Config.Diablo.SealLeader && Pather.makePortal() && say("in");
        }

        distCheck.distance > 70 && this.followPath(Common.Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB);
        
        let cb = () => {
          let inf = Game.getMonster(getLocaleString(sdk.locale.monsters.InfectorofSouls));
          return inf && (inf.distance < Skill.getRange(Config.AttackSkill[1]) || inf.dead);
        };

        let moveToLoc = () => {
          if (Common.Diablo.infLayout === 1) {
            (me.sorceress || me.assassin) && Pather.moveToEx(7876, 5296, { callback: cb });
            delay(1 + me.ping);
          } else {
            delay(1 + me.ping);
            Pather.moveToEx(7928, 5295, { callback: cb });
          }
        };

        if (Config.Diablo.Fast) {
          if (openSeal
            && ![
              sdk.objects.DiabloSealInfector2, sdk.objects.DiabloSealInfector
            ].every(s => Common.Diablo.openSeal(s))) {
            throw new Error("Failed to open Infector seals.");
          }
          moveToLoc();

          if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) {
            throw new Error("Failed to kill Infector");
          }
        } else {
          if (openSeal && !Common.Diablo.openSeal(sdk.objects.DiabloSealInfector)) {
            throw new Error("Failed to open Infector seals.");
          }
          moveToLoc();

          if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) {
            throw new Error("Failed to kill Infector");
          }
          if (openSeal && !Common.Diablo.openSeal(sdk.objects.DiabloSealInfector2)) {
            throw new Error("Failed to open Infector seals.");
          }
          // wait until seal has been popped to avoid missing diablo due to wait time ending before he spawns, happens if leader does town chores after seal boss
          !openSeal && [3, "infector"].includes(Common.Diablo.sealOrder.last()) && Misc.poll(() => {
            if (Common.Diablo.diabloSpawned) return true;

            let lastSeal = Game.getObject(sdk.objects.DiabloSealInfector2);
            if (lastSeal && lastSeal.mode) {
              return true;
            }
            return false;
          }, Time.minutes(3), 1000);
        }

        Config.Diablo.SealLeader && say("out");

        return true;
      },

      hammerdinPreAttack: function (name, amount = 5) {
        if (me.paladin && Config.AttackSkill[1] === sdk.skills.BlessedHammer) {
          let target = Game.getMonster(name);

          if (!target || !target.attackable) return true;

          let positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

          for (let i = 0; i < positions.length; i += 1) {
            // check if we can move there
            if (Attack.validSpot(target.x + positions[i][0], target.y + positions[i][1])) {
              Pather.moveTo(target.x + positions[i][0], target.y + positions[i][1]);
              Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);

              for (let n = 0; n < amount; n += 1) {
                Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Left);
              }

              return true;
            }
          }
        }
        
        return false;
      },

      preattack: function (id) {
        let coords = (() => {
          switch (id) {
          case getLocaleString(sdk.locale.monsters.GrandVizierofChaos):
            return Common.Diablo.vizLayout === 1 ? [7676, 5295] : [7684, 5318];
          case getLocaleString(sdk.locale.monsters.LordDeSeis):
            return Common.Diablo.seisLayout === 1 ? [7778, 5216] : [7775, 5208];
          case getLocaleString(sdk.locale.monsters.InfectorofSouls):
            return Common.Diablo.infLayout === 1 ? [7913, 5292] : [7915, 5280];
          default:
            return [];
          }
        })();
        if (!coords.length) return false;

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
            let trapCheck = ClassAttack.checkTraps({ x: coords[0], y: coords[1] });

            if (trapCheck) {
              ClassAttack.placeTraps({ x: coords[0], y: coords[1] }, 5);

              return true;
            }
          }

          break;
        }

        return false;
      },

      getBoss: function (name) {
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
          }
        }

        for (let i = 0; i < 16; i += 1) {
          let boss = Game.getMonster(name);

          if (boss) {
            Common.Diablo.hammerdinPreAttack(name, 8);
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
                sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb, sdk.skills.FireWall
              ].includes(Config.AttackSkill[1])) {
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
                let trapCheck = ClassAttack.checkTraps({ x: 7793, y: 5293 });
                trapCheck && ClassAttack.placeTraps({ x: 7793, y: 5293, classid: sdk.monsters.Diablo }, trapCheck);
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
    },
    configurable: true,
  });
})(Common);
