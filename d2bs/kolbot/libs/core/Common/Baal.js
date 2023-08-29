/**
*  @filename    Cows.js
*  @author      theBGuy
*  @desc        Handle Baal functions
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Baal", {
    value: new function Baal () {
      this.throneCoords = {
        bottomLeft: { x: 15072, y: 5073 },
        bottomRight: { x: 15118, y: 5073 },
        bottomCenter: { x: 15093, y: 5073 },
        entraceArchway: { x: 15097, y: 5099 },
        topLeft: { x: 15072, y: 5002 },
        topRight: { x: 15118, y: 5002 },
        baal: { x: 15090, y: 5014 },
      };

      this.checkHydra = function () {
        let hydra = Game.getMonster(getLocaleString(sdk.locale.monsters.Hydra));
        if (hydra) {
          do {
            if (hydra.mode !== sdk.monsters.mode.Dead
              && hydra.getStat(sdk.stats.Alignment) !== 2) {
              let _pos = [
                this.throneCoords.bottomLeft, this.throneCoords.bottomRight,
                this.throneCoords.topRight, this.throneCoords.topLeft,
              ].sort(function (a, b) {
                return getDistance(me, a) - getDistance(me, b);
              }).first();
              Pather.moveTo(_pos.x, _pos.y);
              while (hydra.mode !== sdk.monsters.mode.Dead) {
                delay(500);
                if (!copyUnit(hydra).x) {
                  break;
                }
              }

              break;
            }
          } while (hydra.getNext());
        }

        return true;
      };

      this.checkThrone = function (clear = true) {
        let monster = Game.getMonster();

        if (monster) {
          do {
            if (monster.attackable
              && monster.y < 5080
              && (monster.x > 15072 && monster.x < 15118)) {
              switch (monster.classid) {
              case sdk.monsters.WarpedFallen:
              case sdk.monsters.WarpedShaman:
                return 1;
              case sdk.monsters.BaalSubjectMummy:
              case sdk.monsters.BaalColdMage:
                return 2;
              case sdk.monsters.Council4:
                return 3;
              case sdk.monsters.VenomLord2:
                return 4;
              case sdk.monsters.ListerTheTormenter:
                return 5;
              default:
                if (clear) {
                  Attack.getIntoPosition(monster, 10, sdk.collision.Ranged);
                  Attack.clear(15);
                }

                return false;
              }
            }
          } while (monster.getNext());
        }

        return false;
      };

      this.clearThrone = function () {
        if (!Game.getMonster(sdk.monsters.ThroneBaal)) return true;

        let monList = [];

        if (Config.AvoidDolls) {
          let mon = Game.getMonster(sdk.monsters.SoulKiller);

          if (mon) {
            do {
              // exclude dolls from the list
              if (!mon.isDoll && mon.x >= 15072 && mon.x <= 15118
                && mon.y >= 5002 && mon.y <= 5079
                && mon.attackable && !Attack.skipCheck(mon)) {
                monList.push(copyUnit(mon));
              }
            } while (mon.getNext());
          }

          if (monList.length > 0) {
            return Attack.clearList(monList);
          }
        }

        let pos = [
          { x: 15097, y: 5054 }, { x: 15079, y: 5014 },
          { x: 15085, y: 5053 }, { x: 15085, y: 5040 },
          { x: 15098, y: 5040 }, { x: 15099, y: 5022 },
          { x: 15086, y: 5024 }, { x: 15079, y: 5014 }
        ];
        return pos.forEach(function (node) {
          // no mobs at that next, skip it
          if ([node.x, node.y].distance < 35
            && [node.x, node.y].mobCount({ range: 30 }) === 0) {
            return;
          }
          Pather.moveTo(node.x, node.y);
          Attack.clear(30);
        });
      };

      this.preattack = function () {
        switch (me.classid) {
        case sdk.player.class.Sorceress:
          if ([
            sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb, sdk.skills.FireWall
          ].includes(Config.AttackSkill[1])) {
            if (me.getState(sdk.states.SkillDelay)) {
              delay(50);
            } else {
              Skill.cast(Config.AttackSkill[1], sdk.skills.hand.Right, 15094 + rand(-1, 1), 5024);
            }
          }

          break;
        case sdk.player.class.Paladin:
          if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
            Config.AttackSkill[4] > 0 && Skill.setSkill(Config.AttackSkill[4], sdk.skills.hand.Right);

            return Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Left);
          }

          break;
        case sdk.player.class.Druid:
          if ([sdk.skills.Tornado, sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
            Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Right, 15094 + rand(-1, 1), 5029);

            return true;
          }

          break;
        case sdk.player.class.Assassin:
          if (Config.UseTraps) {
            let check = ClassAttack.checkTraps({ x: 15094, y: 5028 });

            if (check) {
              return ClassAttack.placeTraps({ x: 15094, y: 5028 }, 5);
            }
          }

          if (Config.AttackSkill[3] === sdk.skills.ShockWeb) {
            return Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Right, 15094, 5028);
          }

          break;
        }

        return false;
      };

      this.clearWaves = function () {
        Pather.moveTo(15094, me.paladin ? 5029 : 5038);

        let tick = getTickCount();
        let totalTick = getTickCount();

        MainLoop:
        while (true) {
          if (!Game.getMonster(sdk.monsters.ThroneBaal)) return true;

          switch (this.checkThrone()) {
          case 1:
            Attack.clearClassids(sdk.monsters.WarpedFallen, sdk.monsters.WarpedShaman) && (tick = getTickCount());

            break;
          case 2:
            Attack.clearClassids(sdk.monsters.BaalSubjectMummy, sdk.monsters.BaalColdMage) && (tick = getTickCount());

            break;
          case 3:
            Attack.clearClassids(sdk.monsters.Council4) && (tick = getTickCount());
            this.checkHydra() && (tick = getTickCount());

            break;
          case 4:
            Attack.clearClassids(sdk.monsters.VenomLord2) && (tick = getTickCount());

            break;
          case 5:
            if (Attack.clearClassids(sdk.monsters.ListerTheTormenter, sdk.monsters.Minion1, sdk.monsters.Minion2)) {
              tick = getTickCount();
            }

            break MainLoop;
          default:
            if (getTickCount() - tick < Time.seconds(7)) {
              if (Skill.canUse(sdk.skills.Cleansing) && me.getState(sdk.states.Poison)) {
                Skill.setSkill(sdk.skills.Cleansing, sdk.skills.hand.Right);
                Misc.poll(function () {
                  if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
                    Skill.cast(Config.AttackSkill[3], sdk.skills.hand.Left);
                  }
                  return !me.getState(sdk.states.Poison) || me.mode === sdk.player.mode.GettingHit;
                }, Time.seconds(3), 100);
              }
            }

            if (getTickCount() - tick > Time.seconds(20)) {
              this.clearThrone();
              tick = getTickCount();
            }

            if (!this.preattack()) {
              delay(100);
            }

            break;
          }

          switch (me.classid) {
          case sdk.player.class.Amazon:
          case sdk.player.class.Sorceress:
          case sdk.player.class.Necromancer:
          case sdk.player.class.Assassin:
            [15116, 5026].distance > 3 && Pather.moveTo(15116, 5026);

            break;
          case sdk.player.class.Paladin:
            if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
              [15094, 5029].distance > 3 && Pather.moveTo(15094, 5029);
              
              break;
            }
            // eslint-disable-next-line no-fallthrough
          case sdk.player.class.Druid:
            if ([sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
              [15116, 5026].distance > 3 && Pather.moveTo(15116, 5026);

              break;
            }

            if (Config.AttackSkill[3] === sdk.skills.Tornado) {
              [15094, 5029].distance > 3 && Pather.moveTo(15106, 5041);
              
              break;
            }
            // eslint-disable-next-line no-fallthrough
          case sdk.player.class.Barbarian:
            [15101, 5045].distance > 3 && Pather.moveTo(15101, 5045);

            break;
          }

          // If we've been in the throne for 30 minutes that's way too long
          if (getTickCount() - totalTick > Time.minutes(30)) {
            return false;
          }

          delay(10);
        }

        this.clearThrone();

        return true;
      };

      this.killBaal = function () {
        if (me.inArea(sdk.areas.ThroneofDestruction)) {
          Config.PublicMode && Loader.scriptName() === "Baal" && say(Config.Baal.BaalMessage);
          me.checkForMobs({ range: 30 }) && this.clearWaves(); // ensure waves are actually done
          Pather.moveTo(15090, 5008);
          Misc.poll(function () {
            return !Game.getMonster(sdk.monsters.ThroneBaal);
          }, Time.seconds(5), 100);
          Precast.doPrecast(true);
          Misc.poll(function () {
            if (me.mode === sdk.player.mode.GettingHit || me.checkForMobs({ range: 15 })) {
              Common.Baal.clearThrone();
              Pather.moveTo(15090, 5008);
            }
            return !Game.getMonster(sdk.monsters.ThroneBaal);
          }, Time.minutes(3), 1000);

          let portal = Game.getObject(sdk.objects.WorldstonePortal);

          if (portal) {
            Pather.usePortal(null, null, portal);
          } else {
            throw new Error("Couldn't find portal.");
          }
        }

        if (me.inArea(sdk.areas.WorldstoneChamber)) {
          Pather.moveTo(15134, 5923);
          Attack.kill(sdk.monsters.Baal);
          Pickit.pickItems();

          return true;
        }

        return false;
      };
    },
    configurable: true,
  });
})(Common);
