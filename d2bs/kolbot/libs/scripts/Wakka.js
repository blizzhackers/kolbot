/**
*  @filename    Wakka.js
*  @author      kolton, theBGuy
*  @desc        walking Chaos Sanctuary leecher
*
*/

function Wakka () {
  include("core/Common/Diablo.js");
  const timeout = Config.Wakka.Wait;
  const [minDist, maxDist] = [50, 80];
  const internals = {
    died: false,
    safeTP: false,
    coordsInit: false,
    vizCoords: [],
    seisCoords: [],
    infCoords: [],
    vizClear: false,
    seisClear: false,
    infClear: false,
  };

  let tick;
  let leader = "";
  let [leaderUnit, leaderPartyUnit] = [null, null];

  const checkMonsters = function (range = 15, dodge = false) {
    let monList = [];
    let monster = Game.getMonster();

    if (monster) {
      do {
        if (monster.y < 5565 && monster.attackable && monster.distance <= range) {
          if (!dodge) return true;
          monList.push(copyUnit(monster));
        }
      } while (monster.getNext());
    }

    if (!monList.length) return false;

    monList.sort(Sort.units);

    if (monList[0].distance < 25 && !checkCollision(me, monList[0], sdk.collision.Ranged)) {
      Attack.deploy(monList[0], 25, 5, 15);
    }

    return true;
  };

  const getCoords = function () {
    if (!internals.coordsInit) {
      Common.Diablo.initLayout();
      internals.vizCoords = Common.Diablo.vizLayout === 1
        ? [7707, 5274]
        : [7708, 5298];
      internals.seisCoords = Common.Diablo.seisLayout === 1
        ? [7812, 5223]
        : [7809, 5193];
      internals.infCoords = Common.Diablo.infLayout === 1
        ? [7868, 5294]
        : [7882, 5306];
      internals.coordsInit = true;
    }
  };

  /** @param {string} name */
  const checkBoss = function (name) {
    let glow = Game.getObject(sdk.objects.SealGlow);
    if (!glow) return false;

    for (let i = 0; i < 10; i += 1) {
      let boss = Game.getMonster(name);

      if (boss) {
        while (!boss.dead) {
          delay(500);
        }
        
        return true;
      }

      delay(500);
    }

    return true;
  };

  const revive = function () {
    if (me.mode === sdk.player.mode.Death) {
      while (me.mode !== sdk.player.mode.Dead) {
        delay(3);
      }
    } else if (me.dead) {
      if (Config.LifeChicken <= 0) {
        console.log("I Died...reviving");
        internals.died = true;
        me.revive();
      } else {
        scriptBroadcast("quit");
      }
    }
  };

  const getCorpse = function () {
    revive();

    let rval = false;
    let corpse = Game.getPlayer(me.name, sdk.player.mode.Dead);

    if (corpse) {
      do {
        if (corpse.distance <= 15) {
          Pather.moveToUnit(corpse);
          corpse.interact();
          delay(500);

          rval = true;
        }
      } while (corpse.getNext());
    }

    return rval;
  };

  /** @param {[number, number]} dest */
  const followPath = function (dest) {
    let path = getPath(me.area, me.x, me.y, dest[0], dest[1], 0, 10);
    if (!path) throw new Error("Failed go get path");

    while (path.length > 0) {
      if (me.mode === sdk.player.mode.Dead || me.inTown) return false;
      if (!leaderUnit || !copyUnit(leaderUnit).x) {
        leaderUnit = Game.getPlayer(leader);
      }

      if (leaderUnit) {
        // monsters nearby - don't move
        if (checkMonsters(45, true) && leaderUnit.distance <= maxDist) {
          path = getPath(me.area, me.x, me.y, dest[0], dest[1], 0, 15);
          delay(200);

          continue;
        }

        // leader within minDist range - don't move
        if (leaderUnit.distance <= minDist) {
          delay(200);

          continue;
        }

        // make sure distance to next node isn't too hot
        if ([path[0].x, path[0].y].mobCount({ range: 15 }) !== 0) {
          console.log("Mobs at next node");
          // mobs, stay where we are
          delay(200);

          continue;
        }
      } else {
        // leaderUnit out of getUnit range but leader is still within reasonable distance - check party unit's coords!
        leaderPartyUnit = getParty(leader);

        if (leaderPartyUnit) {
          // leader went to town - don't move
          if (leaderPartyUnit.area !== me.area) {
            delay(200);

            continue;
          }

          // if there's monsters between the leecher and leader, wait until monsters are dead or leader is out of maxDist range
          if (checkMonsters(45, true) && getDistance(me, leaderPartyUnit.x, leaderPartyUnit.y) <= maxDist) {
            path = getPath(me.area, me.x, me.y, dest[0], dest[1], 0, 15);

            delay(200);

            continue;
          }
        }
      }

      Pather.moveTo(path[0].x, path[0].y) && path.shift();
      // no mobs around us, so it's safe to pick
      !me.checkForMobs({
        range: 10,
        coll: (sdk.collision.BlockWall | sdk.collision.Objects | sdk.collision.ClosedDoor)
      }) && Pickit.pickItems(5);
      getCorpse();
    }

    return true;
  };

  /** @returns {number} */
  const getLeaderUnitArea = function () {
    if (!leaderUnit || !copyUnit(leaderUnit).x) {
      leaderUnit = Game.getPlayer(leader);
    }
    return !!leaderUnit
      ? leaderUnit.area
      : getParty(leader).area;
  };

  const log = function (msg = "") {
    me.overhead(msg);
    console.log(msg);
  };

  // START
  Town.goToTown(4);
  Town.move("portalspot");

  if (Config.Leader) {
    leader = Config.Leader;
    if (!Misc.poll(() => Misc.inMyParty(leader), 30e3, 1000)) {
      console.warn("Wakka: Leader not partied. Using autodetect");
      leader = "";
    }
  }

  !leader && (leader = Misc.autoLeaderDetect({
    destination: sdk.areas.ChaosSanctuary,
    quitIf: (area) => [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(area),
    timeout: timeout * 60e3
  }));
  Town.doChores();
  if (!leader) throw new Error("Wakka: Leader not found");

  addEventListener("gamepacket", Common.Diablo.diabloLightsEvent);
  const Worker = require("../modules/Worker");

  try {
    if (Config.Wakka.SkipIfBaal) {
      let leadTick = getTickCount();
      let killLeaderTracker = false;

      Worker.runInBackground.leaderTracker = function () {
        if (Common.Diablo.done || killLeaderTracker) return false;
        // check every 3 seconds
        if (getTickCount() - leadTick < 3000) return true;
        leadTick = getTickCount();

        // check again in another 3 seconds if game wasn't ready
        if (!me.gameReady) return true;
        if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");

        // Player is in Throne of Destruction or Worldstone Chamber
        if ([sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(getLeaderUnitArea())) {
          if (Loader.scriptName() === "Wakka") {
            killLeaderTracker = true;
            throw new Error("Party leader is running baal");
          } else {
            // kill process
            return false;
          }
        }

        return true;
      };
    }

    let levelTick = getTickCount();
    let killLevelTracker = false;

    Worker.runInBackground.levelTracker = function () {
      if (Common.Diablo.done || killLevelTracker) return false;
      // check every 3 seconds
      if (getTickCount() - levelTick < 3000) return true;
      levelTick = getTickCount();

      // check again in another 3 seconds if game wasn't ready
      if (!me.gameReady) return true;

      if (me.charlvl >= Config.Wakka.StopAtLevel) {
        Config.Wakka.StopProfile && D2Bot.stop();

        if (Loader.scriptName() === "Wakka") {
          killLevelTracker = true;
          throw new Error("Reached wanted level");
        } else {
          // kill process
          return false;
        }
      }

      return true;
    };

    let diaTick = getTickCount();

    Worker.runInBackground.diaSpawned = function () {
      if (Common.Diablo.done || (internals.vizClear && internals.seisClear && internals.infClear)) {
        return false;
      }
      // check every 1/4 second
      if (getTickCount() - diaTick < 250) return true;
      diaTick = getTickCount();

      if (Common.Diablo.diabloSpawned) {
        internals.vizClear = true;
        internals.seisClear = true;
        internals.infClear = true;
        throw new Error("Diablo spawned");
      }

      return true;
    };

    while (Misc.inMyParty(leader)) {
      try {
        if (me.inArea(sdk.areas.PandemoniumFortress)) {
          let portal = Pather.getPortal(sdk.areas.ChaosSanctuary, null);

          if (portal) {
            !internals.safeTP && delay(5000);
            Pather.usePortal(sdk.areas.ChaosSanctuary, null);
            Precast.doPrecast(true);
          }
        } else if (me.inArea(sdk.areas.ChaosSanctuary)) {
          try {
            if (!internals.safeTP) {
              if (checkMonsters(25, false)) {
                log("hot tp");
                Pather.usePortal(sdk.areas.PandemoniumFortress, null);

                continue;
              } else {
                getCoords();
                internals.safeTP = true;
              }
            }

            if (!internals.vizClear) {
              if (followPath(internals.vizCoords)) {
                if (checkBoss(getLocaleString(sdk.locale.monsters.GrandVizierofChaos))) {
                  log("vizier dead");
                  internals.vizClear = true;
                  Precast.doPrecast(true);
                  tick = getTickCount();

                  while (getTickCount() - tick >= 5000) {
                    delay(100);
                  }
                }
              } else {
                console.debug("Failed to move to viz");
              }
            }

            if (internals.vizClear && !internals.seisClear) {
              if (followPath(internals.seisCoords)) {
                if (checkBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) {
                  log("seis dead");
                  internals.seisClear = true;
                  Precast.doPrecast(true);
                  tick = getTickCount();

                  while (getTickCount() - tick >= 7000) {
                    delay(100);
                  }
                }
              } else {
                console.debug("Failed to move to seis");
              }
            }

            if (internals.vizClear && internals.seisClear && !internals.infClear) {
              if (followPath(internals.infCoords)) {
                if (checkBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) {
                  log("infector dead");
                  internals.infClear = true;
                  Precast.doPrecast(true);
                  tick = getTickCount();

                  while (getTickCount() - tick >= 2000) {
                    delay(100);
                  }
                }
              } else {
                console.debug("Failed to move to infector");
              }
            }

            if (internals.vizClear && internals.seisClear && internals.infClear) {
              Pather.moveTo(7767, 5263);
              Misc.poll(function () {
                if (Common.Diablo.diabloSpawned) return true;
                if (Game.getMonster(sdk.monsters.Diablo)) return true;
                return false;
              }, Time.minutes(2), 500);
            }
          } catch (e) {
            console.error((e.message ? e.message : e));
          }

          if (internals.vizClear && internals.seisClear && internals.infClear) {
            Pather.moveTo(7767, 5263);

            let diablo = Misc.poll(function () {
              return Game.getMonster(sdk.monsters.Diablo);
            }, Time.minutes(3), 500);

            if (diablo) {
              while (!diablo.dead) {
                delay(100);
              }
              log("Diablo is dead");

              if (!me.canTpToTown() || !Town.goToTown()) {
                Pather.usePortal(sdk.areas.PandemoniumFortress);
              }

              return true;
            } else {
              log("Couldn't find diablo");
            }
          }
        }

        revive();

        delay(200);
      } catch (e) {
        console.error(e);

        return true;
      }
    }
  } catch (e) {
    // console.error(e);
  } finally {
    Common.Diablo.done;
    removeEventListener("gamepacket", Common.Diablo.diabloLightsEvent);
  }

  log("Wakka complete");

  return true;
}
