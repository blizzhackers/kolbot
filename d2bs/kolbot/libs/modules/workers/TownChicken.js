/**
*  @filename    TownChicken.js
*  @author      theBGuy
*  @desc        TownChicken background worker thread
*
*/

(function (module, require, Worker) {
  // Only load this in global scope
  if (new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
    /**
     * @param {number} [targetArea] 
     * @param {string} [owner] 
     * @param {ObjectUnit} [unit] 
     * @param {Unit} [dummy] 
     * @returns {boolean}
     */
    const usePortal = function (targetArea, owner, unit, dummy) {
      if (targetArea && me.inArea(targetArea)) return true;

      me.cancelUIFlags();

      const townAreaCheck = (area = 0) => sdk.areas.Towns.includes(area);
      const preArea = me.area;
      const leavingTown = townAreaCheck(preArea);

      for (let i = 0; i < 13; i += 1) {
        if (me.dead) return false;
        if (targetArea ? me.inArea(targetArea) : me.area !== preArea) return true;

        (i > 0 && owner && me.inTown) && Town.move("portalspot");

        const portal = unit
          ? copyUnit(unit)
          : Pather.getPortal(targetArea, owner);

        if (portal && portal.area === me.area) {
          const useTk = me.inTown && Skill.useTK(portal) && i < 3;
          if (useTk) {
            if (portal.distance > 21) {
              me.inTown && me.act === 5
                ? Town.move("portalspot")
                : Pather.moveNearUnit(portal, 20);
            }
            if (Packet.telekinesis(portal)
              && Misc.poll(function () {
                return targetArea ? me.inArea(targetArea) : me.area !== preArea;
              })) {
              Pather.lastPortalTick = getTickCount();
              delay(100);

              return true;
            }
          } else {
            if (portal.distance > 5) {
              i < 3
                ? Pather.moveNearUnit(portal, 4, false)
                : Pather.moveToUnit(portal);
            }

            if (getTickCount() - Pather.lastPortalTick > (leavingTown ? 2500 : 1000)) {
              i < 2
                ? Packet.entityInteract(portal)
                : Misc.click(0, 0, portal);
            } else {
              // only delay if we are in town and leaving town, don't delay if we are attempting to portal from out of town since this is the chicken thread
              // and we are likely being attacked
              leavingTown && delay(300);
              
              continue;
            }
          }

          let tick = getTickCount();

          while (getTickCount() - tick < 500) {
            if (me.area !== preArea) {
              Pather.lastPortalTick = getTickCount();
              delay(100);

              return true;
            }

            delay(10);
          }
          // try clicking dummy portal
          !!dummy && portal.area === 1 && Misc.click(0, 0, portal);

          i > 1 && (i % 3) === 0 && Packet.flash(me.gid);
        } else {
          console.log("Didn't find portal, retry: " + i);
          i > 3 && me.inTown && Town.move("portalspot", false);
          if (i === 12) {
            let p = Game.getObject("portal");
            console.debug(p);
            if (!!p && Misc.click(0, 0, p) && Misc.poll(function () {
              return me.area !== preArea, 1000, 100;
            })) {
              Pather.lastPortalTick = getTickCount();
              delay(100);

              return true;
            }
          }
          Packet.flash(me.gid);
        }

        delay(250);
      }

      return (targetArea ? me.inArea(targetArea) : me.area !== preArea);
    };

    /**
     * @param {boolean} use 
     * @returns {boolean}
     */
    const makePortal = function (use = false) {
      if (me.inTown) return true;

      let oldGid = -1;

      for (let i = 0; i < 5; i += 1) {
        if (me.dead) return false;

        let tpTool = me.getTpTool();
        if (!tpTool) return false;

        let oldPortal = Game.getObject(sdk.objects.BluePortal);
        if (oldPortal) {
          do {
            if (oldPortal.getParent() === me.name) {
              oldGid = oldPortal.gid;
              break;
            }
          } while (oldPortal.getNext());
          
          // old portal is close to use, we should try to use it
          if (oldPortal.getParent() === me.name && oldPortal.distance < 4) {
            if (use) {
              if (usePortal(null, null, copyUnit(oldPortal))) return true;
              break; // don't spam usePortal
            } else {
              return copyUnit(oldPortal);
            }
          }
        }

        let pingDelay = me.getPingDelay();

        if (tpTool.use() || Game.getObject("portal")) {
          let tick = getTickCount();

          while (getTickCount() - tick < Math.max(500 + i * 100, pingDelay * 2 + 100)) {
            const portal = getUnits(sdk.unittype.Object, "portal")
              .filter(function (p) {
                return p.getParent() === me.name && p.gid !== oldGid;
              }).first();

            if (portal) {
              if (use) {
                if (usePortal(null, null, copyUnit(portal))) return true;
                break; // don't spam usePortal
              } else {
                return copyUnit(portal);
              }
            } else {
              // check dummy
              let dummy = getUnits(sdk.unittype.Object, "portal")
                .filter(function (p) {
                  return p.name === "Dummy";
                }).first();
              if (dummy) {
                console.debug(dummy);
                if (use) return usePortal(null, null, dummy, true);
                return copyUnit(dummy);
              }
            }

            delay(10);
          }
        } else {
          console.log("Failed to use tp tool");
          Packet.flash(me.gid, pingDelay);
          delay(200 + pingDelay);
        }

        delay(40);
      }

      return false;
    };

    /**
     * @param {Act} act 
     * @param {boolean} wpmenu 
     * @returns {boolean}
     */
    const goToTown = function (act = 0, wpmenu = false) {
      if (!me.inTown) {
        const townArea = sdk.areas.townOf(me.act);
        try {
          !makePortal(true) && console.warn("Town.goToTown: Failed to make TP");
          if (!me.inTown && !usePortal(townArea, me.name)) {
            console.warn("Town.goToTown: Failed to take TP");
            if (!me.inTown && !usePortal(sdk.areas.townOf(me.area))) {
              throw new Error("Town.goToTown: Failed to take TP");
            }
          }
        } catch (e) {
          let tpTool = me.getTpTool();
          if (!tpTool && Misc.getPlayerCount() <= 1) {
            Misc.errorReport(new Error("Town.goToTown: Failed to go to town and no tps available. Restart."));
            scriptBroadcast("quit");
          } else {
            if (!Misc.poll(function () {
              if (me.inTown) return true;
              let p = Game.getObject("portal");
              console.debug(p);
              !!p && Misc.click(0, 0, p) && delay(100);
              Misc.poll(function () {
                return me.idle;
              }, 1000, 100);
              console.debug("inTown? " + me.inTown);
              return me.inTown;
            }, 700, 100)) {
              Misc.errorReport(new Error("Town.goToTown: Failed to go to town. Quiting."));
              scriptBroadcast("quit");
            }
          }
        }
      }

      if (!act) return true;
      if (act < 1 || act > 5) throw new Error("Town.goToTown: Invalid act");
      if (act > me.highestAct) return false;

      if (act !== me.act) {
        try {
          Pather.useWaypoint(sdk.areas.townOfAct(act), wpmenu);
        } catch (WPError) {
          throw new Error("Town.goToTown: Failed use WP");
        }
      }

      return true;
    };

    const threads = ["threads/antihostile.js", "threads/rushthread.js", "threads/CloneKilla.js"];
    const togglePause = function () {
      for (let thread of threads) {
        let script = getScript(thread);

        if (script) {
          script.running
            ? script.pause()
            : script.resume();
        }
      }

      return true;
    };

    const visitTown = function () {
      console.log("ÿc8Start ÿc0:: ÿc8visitTown");
    
      const preArea = me.area;
      const preAct = sdk.areas.actOf(preArea);

      if (!me.inTown && !me.getTpTool()) {
        console.warn("Can't chicken to town. Quit");
        scriptBroadcast("quit");
        return false;
      }

      let tick = getTickCount();

      // not an essential function -> handle thrown errors
      me.cancelUIFlags();
      try {
        goToTown();
        while (!me.area) delay (3);
        if (!me.inTown) return false;
      } catch (e) {
        return false;
      }

      const { x, y } = me;

      Town.doChores();

      console.debug("Current act: " + me.act + " Prev Act: " + preAct);
      me.act !== preAct && goToTown(preAct);
      Town.move("portalspot");
      Pather.moveTo(x, y);

      while (getTickCount() - tick < 4500) {
        delay(10);
      }

      if (!usePortal(preArea, me.name)) {
        try {
          usePortal(null, me.name);
        } catch (e) {
          throw new Error("Town.visitTown: Failed to go back from town");
        }
      }
      Config.PublicMode && Pather.makePortal();
      console.log("ÿc8End ÿc0:: ÿc8visitTown - currentArea: " + getAreaName(me.area));

      return me.area === preArea;
    };

    let townCheck = false;

    Misc.townCheck = function () {
      return false;
    };

    let waitTick = getTickCount();
    let potTick = getTickCount();
    let _recursion = false;

    // Start
    Worker.runInBackground.TownChicken = function () {
      if (getTickCount() - waitTick < 100) return true;
      if (_recursion) return true;
      waitTick = getTickCount();
      if (me.inTown) return true;

      let shouldChicken = (
        (townCheck || me.hpPercent < Config.TownHP || me.mpPercent < Config.TownMP)
      );

      if (shouldChicken && !me.canTpToTown()) {
        // we should probably quit?
        return true;
      }

      if (!shouldChicken) {
        if (getTickCount() - potTick < 300) return true;
        potTick = getTickCount();
        // do we need potions?
        if (!Config.TownCheck) return true;
        // can we chicken?
        if (!me.canTpToTown()) return true;
        if (me.needBeltPots() || (Config.OpenChests.Enabled && me.needKeys())) {
          shouldChicken = true;
        }
      }

      if (shouldChicken) {
        let t4 = getTickCount();
        try {
          _recursion = true;
          togglePause();
          console.log("ÿc8(TownChicken) :: ÿc0Going to town");
          me.overhead("ÿc8(TownChicken) :: ÿc0Going to town");
          Attack.stopClear = true;
            
          visitTown();
        } catch (e) {
          Misc.errorReport(e, "TownChicken.js");
          scriptBroadcast("quit");

          return false;
        } finally {
          _recursion = false;
          togglePause();
          Packet.flash(me.gid, 100);
          console.log("ÿc8(TownChicken) :: ÿc0Took: " + Time.format(getTickCount() - t4) + " to visit town.");
          [Attack.stopClear, townCheck] = [false, false];
        }
      }

      return true;
    };

    console.log("ÿc2Kolbotÿc0 :: TownChicken running");
  }
})(module, require, typeof Worker === "object" && Worker || require("../Worker"));
