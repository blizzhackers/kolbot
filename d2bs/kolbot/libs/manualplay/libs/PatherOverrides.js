/* eslint-disable max-len */
/**
*  @filename    PatherOverides.js
*  @author      theBGuy
*  @desc        Pather.js additions to improve functionality for map mode
*
*/

includeIfNotIncluded("core/Pather.js");

Pather.stop = false;
Pather.stopEvent = function (key) {
  key === sdk.keys.Numpad9 && !me.idle && (Pather.stop = true);
};

Pather.changeAct = function (act) {
  let npc, npcUnit, loc;
  let wp, useWp = false;

  switch (act) {
  case 1:
    npc = "Warriv";
    loc = sdk.areas.RogueEncampment;

    break;
  case 2:
    loc = sdk.areas.LutGholein;
    npc = me.act === 1 ? "Warriv" : "Meshif";

    break;
  case 3:
    npc = "Meshif";
    loc = sdk.areas.KurastDocktown;

    break;
  case 5:
    npc = "Tyrael";
    loc = sdk.areas.Harrogath;

    break;
  }

  !me.inTown && Town.goToTown();
  
  if (npc) {
    npcUnit = Game.getNPC(NPC[npc]);
    wp = Game.getObject("waypoint");

    if (me.accessToAct(act)
      && ((wp && !npcUnit)
        || (wp && npcUnit && getDistance(me, wp) < getDistance(me, npcUnit))
        || (Town.getDistance("waypoint") < Town.getDistance(NPC[npc])))) {
      useWp = true;
    }
  } else {
    useWp = true;
  }

  if (!npcUnit && !useWp) {
    let timeout = getTickCount() + 3000;

    while (!npcUnit) {
      if (timeout < getTickCount()) {
        break;
      }

      Town.move(NPC[npc]);
      Packet.flash(me.gid);
      delay(me.ping * 2 + 100);
      npcUnit = Game.getNPC(NPC[npc]);
    }
  }

  if (npcUnit && !useWp) {
    getDistance(me, npcUnit) > 5 && Town.move(NPC[npc]);

    for (let i = 0; i < 5; i += 1) {
      sendPacket(1, sdk.packets.send.EntityAction, 4, 0, 4, npcUnit.gid, 4, loc);
      delay(500 + me.ping);

      if (me.act === act) {
        break;
      }
    }
  } else if (useWp) {
    Town.goToTown(act);
  } else {
    print("Failed to move to " + npc);
    me.overhead("Failed to move to " + npc);
  }

  while (!me.gameReady) {
    delay(100);
  }

  return me.act === act;
};

Pather.getWP = function (area, clearPath) {
  area !== me.area && this.journeyTo(area);

  for (let i = 0; i < sdk.waypoints.Ids.length; i++) {
    let preset = Game.getPresetObject(me.area, sdk.waypoints.Ids[i]);

    if (preset) {
      Skill.haveTK ? this.moveNearUnit(preset, 20, { clearSettings: { clearPath: clearPath } }) : this.moveToUnit(preset, 0, 0, clearPath);

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

          if (getUIFlag(sdk.uiflags.Waypoint)) {
            delay(500);

            // Keep wp menu open in town
            !me.inTown && me.cancel();

            return true;
          }

          delay(500);
        }
      }
    }
  }

  return false;
};

Pather.walkTo = function (x = undefined, y = undefined, minDist = undefined) {
  while (!me.gameReady) {
    delay(100);
  }

  if (!x || !y) return false;
  minDist === undefined && (minDist = me.inTown ? 2 : 4);

  let angle, angles, nTimer, whereToClick;
  let nFail = 0;
  let attemptCount = 0;

  // credit @Jaenster
  // Stamina handler and Charge
  if (!me.inTown && !me.dead) {
    // Check if I have a stamina potion and use it if I do
    if (me.staminaPercent <= 20) {
      let stam = me.getItemsEx(-1, sdk.items.mode.inStorage).filter((i) => i.classid === sdk.items.StaminaPotion && i.isInInventory).first();
      !!stam && !me.deadOrInSequence && stam.use();
    }
    (me.running && me.staminaPercent <= 15) && me.walk();
    // the less stamina you have, the more you wait to recover
    let recover = me.staminaMaxDuration < 30 ? 80 : 50;
    (me.walking && me.staminaPercent >= recover) && me.run();
    if (Skill.canUse(sdk.skills.Charge) && me.mp >= 9 && getDistance(me.x, me.y, x, y) > 8 && Skill.setSkill(sdk.skills.Charge, sdk.skills.hand.Left)) {
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
  }

  (me.inTown && me.walking) && me.run();

  while (getDistance(me.x, me.y, x, y) > minDist && !me.dead && !Pather.stop) {
    if (me.paladin) {
      Skill.canUse(sdk.skills.Vigor) ? Skill.setSkill(sdk.skills.Vigor, sdk.skills.hand.Right) : Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);
    }

    if (this.openDoors(x, y) && getDistance(me.x, me.y, x, y) <= minDist) {
      return true;
    }

    Misc.click(0, 0, x, y);

    attemptCount += 1;
    nTimer = getTickCount();

    while (!me.moving) {
      if (me.dead || Pather.stop) return false;

      if ((getTickCount() - nTimer) > 500) {
        if (nFail >= 3) return false;

        nFail += 1;
        angle = Math.atan2(me.y - y, me.x - x);
        angles = [Math.PI / 2, -Math.PI / 2];

        for (let i = 0; i < angles.length; i += 1) {
          // TODO: might need rework into getnearestwalkable
          whereToClick = {
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

    if (attemptCount >= 3) return false;
  }

  return !me.dead && getDistance(me.x, me.y, x, y) <= minDist;
};

Pather.teleportTo = function (x, y, maxRange = 5) {
  for (let i = 0; i < 3; i++) {
    Config.PacketCasting > 0 ? Packet.teleport(x, y) : Skill.cast(sdk.skills.Teleport, sdk.skills.hand.Right, x, y);
    let tick = getTickCount();
    let pingDelay = i === 0 ? 150 : me.getPingDelay();

    while (getTickCount() - tick < Math.max(500, pingDelay * 2 + 200)) {
      if ([x, y].distance < maxRange || Pather.stop) {
        return true;
      }

      delay(10);
    }
  }

  return false;
};

Pather.moveTo = function (x, y, retry, clearPath, pop) {
  // Abort if dead
  if (me.dead) return false;

  if (!x || !y) return false; // I don't think this is a fatal error so just return false
  if (typeof x !== "number" || typeof y !== "number") throw new Error("moveTo: Coords must be numbers");
  if ([x, y].distance < 2) return true;

  for (let i = 0; i < this.cancelFlags.length; i += 1) {
    getUIFlag(this.cancelFlags[i]) && me.cancel();
  }

  let fail = 0;
  let node = { x: x, y: y };
  let cleared = false;
  let leaped = false;
  let invalidCheck = false;
  let useTeleport = this.useTeleport();
  let tpMana = Skill.getManaCost(sdk.skills.Teleport);
  let preSkill = me.getSkill(sdk.skills.get.RightId);
  let annoyingArea = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].includes(me.area);
  let clearSettings = {
    clearPath: (!!clearPath || !useTeleport), // walking characters need to clear in front of them
    range: 10,
    specType: (typeof clearPath === "number" ? clearPath : 0),
  };

  retry === undefined && (retry = useTeleport ? 3 : 15);
  clearPath === undefined && (clearPath = Config.AttackSkill.some(skillId => skillId > 0) && !useTeleport ? true : false);
  pop === undefined && (pop = false);
  let path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? (annoyingArea ? 30 : this.teleDistance) : this.walkDistance);
  if (!path) throw new Error("moveTo: Failed to generate path.");

  path.reverse();
  pop && path.pop();
  PathDebug.drawPath(path);
  useTeleport && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

  while (path.length > 0) {
    // Abort if dead
    if (me.dead || Pather.stop) {
      Pather.stop = false;	// Reset value
      
      return false;
    }

    for (let i = 0; i < this.cancelFlags.length; i++) {
      getUIFlag(this.cancelFlags[i]) && me.cancel();
    }

    node = path.shift();

    /* Right now getPath's first node is our own position so it's not necessary to take it into account
      This will be removed if getPath changes
    */
    if (getDistance(me, node) > 2) {
      fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y) && (invalidCheck = true);
      // Make life in Maggot Lair easier - should this include arcane as well?
      if (annoyingArea || invalidCheck) {
        let adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, sdk.collision.BlockWalk);

        if (adjustedNode) {
          node.x = adjustedNode[0];
          node.y = adjustedNode[1];
          invalidCheck && (invalidCheck = false);
        }

        if (annoyingArea) {
          clearSettings.overrideConfig = true;
          clearSettings.range = 5;
        }

        retry <= 3 && !useTeleport && (retry = 15);
      }

      if (useTeleport && tpMana < me.mp ? Pather.teleportTo(node.x, node.y) : Pather.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
        if (Pather.stop) {
          continue; // stops on next interation
        }
        
        if (!me.inTown) {
          if (this.recursion) {
            this.recursion = false;
            try {
              NodeAction.go(clearSettings);

              if (getDistance(me, node.x, node.y) > 5) {
                this.moveTo(node.x, node.y);
              }
            } finally {
              this.recursion = true;
            }
          }
        }
      } else {
        if (Pather.stop) {
          continue; // stops on next interation
        }

        if (!me.inTown) {
          if (!useTeleport && ((me.checkForMobs({ range: 10 }) && Attack.clear(8)) || Pather.kickBarrels(node.x, node.y) || Pather.openDoors(node.x, node.y))) {
            continue;
          }

          if (fail > 0 && (!useTeleport || tpMana > me.mp)) {
            // Don't go berserk on longer paths
            if (!cleared && me.checkForMobs({ range: 6 }) && Attack.clear(5)) {
              cleared = true;
            }

            // Only do this once
            if (fail > 1 && !leaped && Skill.canUse(sdk.skills.LeapAttack) && Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, node.x, node.y)) {
              leaped = true;
            }
          }
        }

        // Reduce node distance in new path
        path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? rand(25, 35) : rand(10, 15));
        if (!path) throw new Error("moveNear: Failed to generate path.");

        path.reverse();
        PathDebug.drawPath(path);
        pop && path.pop();

        if (fail > 0) {
          console.debug("move retry " + fail);
          Packet.flash(me.gid);

          if (fail >= retry) {
            break;
          }
        }
        fail++;
      }
    }

    delay(5);
  }

  useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot());
  me.getSkill(sdk.skills.get.RightId) !== preSkill && Skill.setSkill(preSkill, sdk.skills.hand.Right);
  PathDebug.removeHooks();

  return getDistance(me, node.x, node.y) < 5;
};
