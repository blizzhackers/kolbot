/**
*  @filename    AutoChaos.js
*  @author      noah-@github.com, theBGuy
*  @desc        AutoChaos is an anonymous Team CS script without any explicit in-game communication.
*               This script is designed for running Classic Taxi CS.
*  @note this has been experimentally updated to work with current kolbot and has not been fully tested.
*/


const AutoChaos = new Runnable(
  function AutoChaos() {
    let taxi = "";
    let tpID = 0;
    let lastCall = 0;
    let lastUpdate = 0;

    /**
     * @param {string} message 
     * @param {boolean} overhead 
     */
    function notify(message, overhead) {
      if (overhead) {
        me.overhead(overhead);
      }

      takeScreenshot();
      return message;
    }

    function setTaxi() {
      if (Config.AutoChaos.Leader !== "" && getParty(Config.AutoChaos.Leader)) {
        taxi = Config.AutoChaos.Leader;
      } else if (taxi === "" || !getParty(taxi)) {
        taxi = detectTaxi();
      }
    }

    function detectTaxi() {
      let player = getParty();
      let current = taxi;
      let lvl = 0;

      if (!player) {
        return current;
      }

      do {
        if (player.name !== me.name && player.classid === sdk.player.class.Sorceress && lvl < player.level) {
          let tick = getTickCount();

          while (player.area === sdk.areas.None && getTickCount() - tick < 5000) {
            delay(100);
          }

          if (player.area !== sdk.areas.None && player.area < sdk.areas.PandemoniumFortress) {
            continue;
          }

          current = player.name;
          lvl = player.level;

          if (Pather.getPortal(108, current) && !Pather.getPortal(sdk.areas.ChaosSanctuary, player.name)) {
            break;
          }
        }
      } while (player.getNext());

      return current;
    }

    function doNext() {
      let portal, gid, tick;

      if (taxi === "" || (lastCall >= 3 && Config.AutoChaos.Diablo === -1)) {
        Town.doChores();
        return true;
      }

      if (lastCall >= 3 && Config.AutoChaos.UseShrine) {
        Town.goToTown(1);
        Town.move("portalspot");

        if ((portal = Pather.getPortal(sdk.areas.StonyField, null)) ||
          (portal = Pather.getPortal(sdk.areas.ColdPlains, null)) ||
          (portal = Pather.getPortal(sdk.areas.BloodMoor, null))) {
          Pather.usePortal(null, null, portal);
          getShrine(sdk.shrines.Experience, 8, 10);

          if (!Pather.usePortal(sdk.areas.RogueEncampment, null)) {
            Town.goToTown();
          }
        }

        Pather.useWaypoint(sdk.areas.PandemoniumFortress, true);
        Town.move("portalspot");
        Config.AutoChaos.UseShrine = false;
      }

      portal = Pather.getPortal(null, taxi);

      if (!portal || portal.gid === tpID) {
        tick = getTickCount();

        if (lastCall < 3 && (tick - lastUpdate) > 10000) {
          taxi = "";
          lastUpdate = tick;
        }

        return true;
      }

      gid = portal.gid;

      if (Config.AutoChaos.BO && portal.objtype !== 107) {
        return true;
      }

      if (Config.AutoChaos.SealDelay) {
        delay(Config.AutoChaos.SealDelay * 1000);
      }

      if (!Pather.usePortal(null, null, portal)) {
        return true;
      }

      tpID = gid;
      lastUpdate = getTickCount();

      if (me.inArea(sdk.areas.RiverofFlame)) {
        precast();
      } else if (me.inArea(sdk.areas.ChaosSanctuary)) {
        if (Config.AutoChaos.SealPrecast) {
          Precast.doPrecast(true);
        }

        Common.Diablo.initLayout();

        if (Common.Diablo.getSealDistance(sdk.objects.DiabloSealVizier) < 60) {
          vizier();
        } else if (Common.Diablo.getSealDistance(sdk.objects.DiabloSealInfector) < 60) {
          infector();
        } else if (Common.Diablo.getSealDistance(sdk.objects.DiabloSealSeis) < 80) {
          seis();
        } else if (getDistance(me, 7795, 5293) < 30) {
          diablo();
          return false;
        } else {
          notify("", "I should not be here...");
        }
      }

      Town.goToTown();
      return true;
    }

    /**
     * @param {number} area 
     */
    function waitForParty(area = 0) {
      let time = getTickCount();
      let classes = copyObj(Config.AutoChaos.RequireClass);

      while (Object.values(classes).indexOf(true) >= 0 && (getTickCount() - time < 25000)) {
        let party = getParty();

        if (party) {
          do {
            if (classes[sdk.player.class.nameOf(party.classid)] && party.level >= 30) {
              if (area > 0 && party.area !== me.area) {
                time = getTickCount();
                continue;
              }

              classes[sdk.player.class.nameOf(party.classid)] = false;
            }
          } while (party.getNext());
        }

        delay(250);
      }

      if (Object.values(classes).indexOf(true) >= 0) {
        throw new Error(notify("Not enough players."));
      }
    }

    function precast() {
      let sorc = getParty(taxi);

      while (
        sorc
        && sorc.area !== sdk.areas.ChaosSanctuary
        && (!me.getState(sdk.states.BattleOrders) || Game.getPlayer(taxi))
      ) {
        Precast.doPrecast(true);
        delay(500);
      }

      if (!Pather.usePortal(null, taxi)) {
        Pather.useWaypoint(sdk.areas.PandemoniumFortress, true);
      }

      if (Town.needHealing() || (Town.checkScrolls("tbk") < 10)) {
        Town.doChores();
      }

      Town.move("portalspot");
    }

    /**
     * @param {number} type 
     * @param {number} distance 
     * @param {number} retry 
     */
    function getShrine(type, distance, retry) {
      let shrine = getUnit(2);

      if (!shrine) {
        return;
      }

      do {
        if (getDistance(me.x, me.y, shrine.x, shrine.y) < distance && shrine.objtype === type) {
          while (retry-- > 0) {
            if (Misc.getShrine(shrine)) {
              break;
            }
          }

          return;
        }
      } while (shrine.getNext());
    }

    function sealDelay() {
      if (!Config.AutoChaos.SealDelay) {
        return;
      }

      const time = Config.AutoChaos.SealDelay * 1000 + getTickCount();
      const loc = new PathNode(me.x, me.y);

      while (getTickCount() < time) {
        if (me.inTown) {
          delay(Config.AutoChaos.SealDelay * 1000);
        } else {
          doPreattack(loc);
        }
      }
    }

    function clearOut() {
      Pickit.pickItems();
      Town.goToTown();
      lastCall += 1;
      Town.move("portalspot");
    }

    function vizier() {
      slayBoss(sdk.locale.monsters.GrandVizierofChaos, Config.AutoChaos.PreAttack[0], 20);
      clearOut();
    }

    function seis() {
      slayBoss(sdk.locale.monsters.LordDeSeis, Config.AutoChaos.PreAttack[1], 30);
      clearOut();
    }

    function infector() {
      slayBoss(sdk.locale.monsters.InfectorofSouls, Config.AutoChaos.PreAttack[2], 20);
      clearOut();
    }

    /**
     * @param {number} amount 
     */
    function taxiInit(amount = 0) {
      if (amount > 0) {
        delay(amount);
      }

      const pos = new PathNode(me.x, me.y);
      const time = getTickCount();
      let count = time;

      Precast.doPrecast();

      while (!me.getState(sdk.states.BattleOrders)) {
        if (getTickCount() - count > 5000) {
          count = getTickCount();
          Pather.moveTo(pos.x + rand(-4, 4), pos.y + rand(-4, 4));
        }

        if (getTickCount() - time > 50000) {
          console.log("Game timed out.");
          return false;
        }

        delay(100);
      }

      return true;
    }

    /**
     * @param {boolean} last 
     */
    function taxiVizier(last) {
      const viz = Common.Diablo.vizLayout === 1 ? new PathNode(7683, 5302) : new PathNode(7687, 5315);

      Pather.moveTo(viz.x, viz.y);
      Pather.makePortal(false);
      Common.Diablo.openSeal(sdk.objects.DiabloSealVizier);

      if (!last) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealVizier2);
      }

      Pather.moveTo(viz.x, viz.y);
      sealDelay();
      slayBoss(sdk.locale.monsters.GrandVizierofChaos, Config.AutoChaos.PreAttack[0], 25, 0);

      if (last) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealVizier2);
        Pather.moveTo(viz.x, viz.y);
      }

      Pickit.pickItems();
    }

    function taxiSeis() {
      const seis = Common.Diablo.seisLayout === 1 ? new PathNode(7782, 5224) : new PathNode(7775, 5193);

      Pather.moveTo(seis.x, seis.y, 10);
      Pather.makePortal(false);
      Common.Diablo.openSeal(sdk.objects.DiabloSealSeis);
      sealDelay();
      Pather.moveTo(seis.x, seis.y, 10);
      Pather.teleDistance = 45;
      slayBoss(sdk.locale.monsters.LordDeSeis, Config.AutoChaos.PreAttack[1], 30, 0);
      Pickit.pickItems();
    }

    /**
     * @param {boolean} last 
     */
    function taxiInfector(last) {
      const inf = Common.Diablo.infLayout === 1 ? new PathNode(7926, 5300) : new PathNode(7924, 5282);

      Pather.moveTo(inf.x, inf.y);
      Pather.makePortal(false);
      Common.Diablo.openSeal(sdk.objects.DiabloSealInfector);

      if (!last) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealInfector2);
      }

      Pather.moveTo(inf.x, inf.y);
      slayBoss(sdk.locale.monsters.InfectorofSouls, Config.AutoChaos.PreAttack[2], 25, 0);

      if (last) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealInfector2);
        Pather.moveTo(inf.x, inf.y);
      }

      Pickit.pickItems();
    }

    function diablo() {
      let maxTime = 0;
      let preCount = 1;
      let postCount = 1;
      let party = getParty();

      if (party) {
        do {
          if (party.level >= 30) {
            preCount += 1;
          }
        } while (party.getNext());
      }

      if (Config.AutoChaos.Leech) {
        Pather.moveTo(7767, 5263);
      } else {
        if (Config.AutoChaos.Diablo >= 0) {
          Pather.moveTo(7798, 5293);
          slayBoss(sdk.locale.monsters.Diablo, 0, 30, Config.AutoChaos.Diablo);

          if (Config.AutoChaos.Diablo === 0) {
            let pick = getTickCount();

            while (getTickCount() - pick < 1500) {
              Pickit.pickItems();
              delay(me.ping + 100);
            }

            return;
          }
        }

        if (!Pather.usePortal(sdk.areas.PandemoniumFortress, null)) {
          Town.goToTown();
        }

        Town.doChores();
      }

      while (maxTime < 180000) {
        party = getParty();

        if (party) {
          postCount = 1;
          do {
            if (party.level >= 30) {
              postCount += 1;
            }
          } while (party.getNext());

          if (postCount < preCount || (!Config.AutoChaos.Taxi && !getParty(taxi))) {
            break;
          }
        }

        maxTime += 3000;
        delay(3000);
      }
    }

    /**
     * @param {PathNode} loc 
     */
    function doPreattack(loc) {
      switch (me.classid) {
      case sdk.player.class.Amazon:
      case sdk.player.class.Sorceress:
      case sdk.player.class.Necromancer: {
        if (me.getState(sdk.states.SkillDelay)) {
          let player = Game.getPlayer();
          Skill.cast(Config.AttackSkill[2], 0, player.x, player.y);
        } else {
          Skill.cast(Config.AttackSkill[1], 0, me.x, me.y);
        }

        if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
          Attack.deploy(loc, Config.DodgeRange, 5, 15);
        }

        return true;
      }
      case sdk.player.class.Paladin:
        if (Config.AttackSkill[3] !== sdk.skills.BlessedHammer) {
          return false;
        }

        if (Config.AttackSkill[4] > 0) {
          Skill.setSkill(Config.AttackSkill[4], 0);
        }

        for (let i = 0; i < 3; i++) {
          Skill.cast(Config.AttackSkill[3], 1);
        }
        return true;
      case sdk.player.class.Barbarian:
        Skill.cast(Config.AttackSkill[3], Skill.getHand(Config.AttackSkill[3]));
        return true;
      case sdk.player.class.Druid:
        if (Config.AttackSkill[3] === sdk.skills.Tornado) {
          return Skill.cast(Config.AttackSkill[3], 0, me.x, me.y);
        }

        break;
      case sdk.player.class.Assassin: {
        if (Config.UseTraps) {
          let check = ClassAttack[me.classid].checkTraps({ x: me.x, y: me.y });

          if (check) {
            return ClassAttack[me.classid].placeTraps({ x: me.x, y: me.y }, 5);
          }
        }

        break;
      }
      default:
        delay(2000);
      }

      return false;
    }

    /**
     * @param {number} classid 
     * @param {number} [preattack] 
     * @param {number} [retry] 
     * @param {number} [stop] 
     */
    function slayBoss(classid, preattack, retry, stop = 0) {
      /** @type {Monster | null} */
      let boss = null;
      let bosshp = 0;
      let reposition = 0;
      let checkPosition = 0;
      let tick = 0;
      let time = getTickCount() + (retry * 1000);
      let loc = new PathNode(me.x, me.y);
      
      const name = getLocaleString(classid);

      while (getTickCount() < time) {
        if (!boss) {
          boss = Game.getMonster(name);
        } else if (boss && boss.attackable && preattack > 0) {
          preattack -= 1;
        } else {
          break;
        }

        if (me.paladin || classid !== sdk.locale.monsters.Diablo) {
          doPreattack(loc);
        }

        delay(me.ping + 10);
      }

      if (!boss) {
        console.log("Unable to find: " + name);
        return;
      }

      if (!Config.AutoChaos.Ranged) {
        for (let i = 0; i < 10; i++) {
          if (Pather.moveTo(boss.x + rand(-3, 3), boss.y + rand(0, 3), 0)) {
            break;
          } else {
            doPreattack(loc);
          }
        }
      }

      time = getTickCount() + (retry * 1000);

      do {
        if (!boss || !boss.attackable) {
          return;
        }

        bosshp = parseInt((boss.hp * 100) / 128, 10);

        if (bosshp < stop) {
          return;
        }

        if (tick - checkPosition >= 3000) {
          if (Pather.useTeleport || bosshp >= reposition) {
            if (Config.AutoChaos.Ranged) {
              Attack.deploy(boss, 15, 5, 9);
            } else {
              if (Pather.useTeleport) {
                Attack.deploy(boss, 3, 5, 9);
              } else {
                if (time - tick < 10000) {
                  notify("", name + " loc:" + boss.x + "," + boss.y + " me loc:" + me.x + "," + me.y);
                  loc.update(boss.x + rand(-5, 5), boss.y + rand(0, 5));
                } else {
                  loc.update(boss.x + rand(-3, 3), boss.y + rand(0, 3));
                }

                Pather.moveTo(loc.x, loc.y, 0);
                Misc.click(0, 0, loc.x, loc.y);
              }
            }
          }

          checkPosition = tick;
          reposition = bosshp;
        }

        try {
          if (!ClassAttack[me.classid].doAttack(boss, false)) {
            Skill.cast(Config.AttackSkill[3], Skill.getHand(Config.AttackSkill[3]), boss);
          }
        } catch (e) {
          console.error(e);
        }

        tick = getTickCount();
      } while (tick < time);

      throw new Error(notify("Failed to kill: " + name + " in " + retry + " sec", "Failed to kill:" + name + " loc:" + boss.x + "," + boss.y + " me loc:" + me.x + "," + me.y));
    }

    // START -------------------------------------------------------------------------------------------------------------
    Common.Diablo.addLightsEventListener();
    Common.Diablo.on("diablospawned", function () {
      lastCall = 3;
    });

    if (me.area !== sdk.areas.PandemoniumFortress) {
      Pather.useWaypoint(sdk.areas.PandemoniumFortress, true);
    }

    Pather.walkTo(me.x + rand(-5, 5), me.y + rand(-5, 5));
    Town.doChores();

    if (Config.AutoChaos.Taxi) {
      waitForParty();

      Pather.useWaypoint(sdk.areas.RiverofFlame, true);
      Pather.makePortal(false);
      Pather.moveTo(me.x, me.y - 5);

      waitForParty(sdk.areas.RiverofFlame);

      if (!taxiInit()) {
        return false;
      }

      Pather.moveTo(7797, 5606);
      Pather.moveTo(7797, 5590);

      for (let i = 0; i < 3; i += 1) {
        if (Config.AutoChaos.SealOrder[i] === 1) {
          taxiVizier(i === 2);
        } else if (Config.AutoChaos.SealOrder[i] === 2) {
          taxiSeis(i === 2);
        } else if (Config.AutoChaos.SealOrder[i] === 3) {
          taxiInfector(i === 2);
        } else {
          throw new Error(notify("Invalid Config.AutoChaos.SealOrder setting."));
        }
      }

      Pather.moveTo(7786, 5285);
      Pather.makePortal(false);
      diablo();
    } else if (Config.AutoChaos.FindShrine) {
      Pather.useWaypoint(sdk.areas.StonyField, true);

      const foundShrine = [sdk.areas.StonyField, sdk.areas.ColdPlains, sdk.areas.BloodMoor].some(function (area) {
        return Misc.getShrinesInArea(area, 15, false);
      });

      if (foundShrine) {
        console.log("Exp shrine found.");
        Town.goToTown();
      } else {
        Pather.journeyTo(sdk.areas.RogueEncampment);
      }

      Pather.useWaypoint(sdk.areas.PandemoniumFortress, true);
      Town.doChores();
      let time = getTickCount();

      while (me.ingame) {
        if (getTickCount() - time > 5000) {
          time = getTickCount();
          Pickit.pickItems(); // find stray gold on ground
          setTaxi();

          if (taxi === "" || !getParty(taxi)) {
            break;
          }
        }

        delay(100);
      }
    } else if (Config.AutoChaos.Glitcher) {
      // Glitcher mode
    } else {
      Town.move("portalspot");
      let time = getTickCount();

      while (me.ingame) {
        delay(100);
        setTaxi();

        if (getTickCount() - time > 25000) {
          if (taxi === "" || !getParty(taxi)) {
            break;
          }

          time = getTickCount();
        }

        if (!doNext()) {
          break;
        }
      }
    }

    return true;
  },
  {
    startArea: sdk.areas.PandemoniumFortress,
    preAction: null,
    cleanup: function () {
      Common.Diablo.off("diablospawned");
      Common.Diablo.removeLightsEventListener();
    }
  }
);
