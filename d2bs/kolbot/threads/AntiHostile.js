/* eslint-disable max-len */
/**
*  @filename    AntiHostile.js
*  @author      kolton
*  @desc        handle hostile threats
*
*/
js_strict(true);
include("critical.js");	// required

// globals needed for core gameplay
includeCoreLibs();

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");

include("oog/ShitList.js");

function main () {
  // Variables and functions
  let player, attackCount, prevPos, check, missile, outside;
  let charClass = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"];
  let hostiles = [];

  // AntiHostile gets game event info from ToolsThread
  this.scriptEvent = function (msg) {
    if (!msg || typeof msg !== "string") return;
    
    switch (msg.split(" ")[0]) {
    case "remove": // Remove a hostile player that left the game
      if (hostiles.indexOf(msg.split(" ")[1]) > -1) {
        hostiles.splice(hostiles.indexOf(msg.split(" ")[1]), 1);
      }

      break;
    case "mugshot": // Take a screenshot and log the kill
      D2Bot.printToConsole(msg.split(" ")[1] + " has been neutralized.", sdk.colors.D2Bot.Blue);
      hideConsole();
      delay(500);
      takeScreenshot();

      break;
    }
  };

  // Find all hostile players and add their names to the 'hostiles' list
  this.findHostiles = function () {
    let party = getParty();

    if (party) {
      do {
        if (party.name !== me.name
          && getPlayerFlag(me.gid, party.gid, 8)
          && hostiles.indexOf(party.name) === -1) {
          D2Bot.printToConsole(party.name + " (Level " + party.level + " " + charClass[party.classid] + ")" + " has declared hostility.", sdk.colors.D2Bot.Orange);
          hostiles.push(party.name);
          if (Config.ShitList) {
            ShitList.add(party.name);
          }
        }
      } while (party.getNext());
    }

    return true;
  };

  // Pause default so actions don't conflict
  this.pause = function () {
    let script = getScript("default.dbj");

    if (script && script.running) {
      console.log("ÿc1Pausing.");
      script.pause();
    }
  };

  // Resume default
  this.resume = function () {
    let script = getScript("default.dbj");

    if (script && !script.running) {
      console.log("ÿc2Resuming.");
      script.resume();
    }
  };

  // Find hostile player Units
  this.findPlayer = function () {
    for (let i = 0; i < hostiles.length; i += 1) {
      let player = Game.getPlayer(hostiles[i]);

      if (player) {
        do {
          if (!player.dead && getPlayerFlag(me.gid, player.gid, 8) && !player.inTown && !me.inTown) {
            return player;
          }
        } while (player.getNext());
      }
    }

    return false;
  };

  // Find a missile type
  this.findMissile = function (owner, id, range) {
    range === undefined && (range = 999);

    let missile = Game.getMissile(id);
    if (!missile) return false;

    do {
      if (missile.owner === owner.gid && getDistance(owner, missile) < range) {
        return missile;
      }
    } while (missile.getNext());

    return false;
  };

  this.checkSummons = function (player) {
    if (!player) return false;
    let name = player.name;
    let unit = Game.getMonster();

    if (unit) {
      do {
        // Revives and spirit wolves
        if (unit.getParent() && unit.getParent().name === name && (unit.getState(sdk.states.Revive) || unit.classid === sdk.monsters.Wolf2)) {
          return true;
        }
      } while (unit.getNext());
    }

    return false;
  };

  // Init config and attacks
  D2Bot.init();
  Config.init();
  Attack.init();
  Storage.Init();

  // Use PVP range for attacks
  Skill.usePvpRange = true;

  // Attack sequence adjustments - this only affects the AntiHostile thread
  if (Skill.canUse(sdk.skills.MindBlast)
    && [sdk.skills.FireBlast, sdk.skills.ShockWeb].includes(Config.AttackSkill[1])) {
    Config.AttackSkill[1] = sdk.skills.MindBlast;
    ClassAttack.trapRange = 40;
  }

  // A simple but fast player dodge function
  this.moveAway = function (unit, range) {
    let angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);
    let angles = [0, 45, -45, 90, -90, 135, -135, 180];

    for (let i = 0; i < angles.length; i += 1) {
      // Avoid the position where the player actually tries to move to
      let coordx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * range + unit.x); // unit.targetx
      let coordy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * range + unit.y); // unit.targety

      if (Attack.validSpot(coordx, coordy)) {
        return Pather.moveTo(coordx, coordy);
      }
    }

    return false;
  };

  addEventListener("scriptmsg", this.scriptEvent);
  console.log("ÿc2Anti-Hostile thread loaded.");

  // Main Loop
  while (true) {
    if (me.gameReady) {
      // Scan for hostiles
      this.findHostiles();

      if (hostiles.length > 0 && (Config.HostileAction === 0 || (Config.HostileAction === 1 && me.inTown))) {
        if (Config.TownOnHostile) {
          console.log("ÿc1Hostility detected, going to town.");
          this.pause();

          if (!me.inTown) {
            outside = true;
          }

          try {
            Town.goToTown();
          } catch (e) {
            console.error(e + " Failed to go to town. Quitting.");
            scriptBroadcast("quit"); // quit if failed to go to town
          }

          while (hostiles.length > 0) {
            delay(500);
          }

          if (outside) {
            outside = false;
            Pather.usePortal(null, me.name);
          }

          this.resume();
        } else {
          scriptBroadcast("quit");
        }

        delay(500);

        continue;
      }

      // Mode 3 - Spam entrance (still experimental)
      if (Config.HostileAction === 3 && hostiles.length > 0 && me.inArea(sdk.areas.ThroneofDestruction)) {
        switch (me.classid) {
        case sdk.player.class.Sorceress:
          prevPos = { x: me.x, y: me.y };
          this.pause();
          Pather.moveTo(15103, 5247);

          while (!this.findPlayer() && hostiles.length > 0) {
            if (!me.skillDelay) {
              Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), 15099, 5237);
            } else {
              if (Config.AttackSkill[2] > -1) {
                Skill.cast(Config.AttackSkill[2], Skill.getHand(Config.AttackSkill[2]), 15099, 5237);
              } else {
                while (me.skillDelay) {
                  delay(40);
                }
              }
            }
          }

          break;
        case sdk.player.class.Druid:
          // Don't bother if it's not a tornado druid
          if (Config.AttackSkill[1] !== sdk.skills.Tornado) {
            break;
          }

          prevPos = { x: me.x, y: me.y };
          this.pause();
          Pather.moveTo(15103, 5247);

          while (!this.findPlayer() && hostiles.length > 0) {
            // Tornado path is a function of target x. Slight randomization will make sure it can't always miss
            Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), 15099 + rand(-2, 2), 5237);
          }

          break;
        case sdk.player.class.Assassin:
          prevPos = { x: me.x, y: me.y };
          this.pause();
          Pather.moveTo(15103, 5247);

          while (!this.findPlayer() && hostiles.length > 0) {
            if (Config.UseTraps) {
              check = ClassAttack.checkTraps({ x: 15099, y: 5242, classid: 544 });

              if (check) {
                ClassAttack.placeTraps({ x: 15099, y: 5242, classid: 544 }, 5);
              }
            }

            Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), 15099, 5237);

            while (me.skillDelay) {
              delay(40);
            }
          }

          break;
        }
      }

      // Player left, return to old position
      if (!hostiles.length && prevPos) {
        Pather.moveTo(prevPos.x, prevPos.y);
        this.resume();

        // Reset position
        prevPos = false;
      }

      player = this.findPlayer();

      if (player) {
        // Mode 1 - Quit if hostile player is nearby
        if (Config.HostileAction === 1) {
          if (Config.TownOnHostile) {
            console.log("ÿc1Hostile player nearby, going to town.");
            this.pause();

            if (!me.inTown) {
              outside = true;
            }

            try {
              Town.goToTown();
            } catch (e) {
              console.log(e + " Failed to go to town. Quitting.");
              scriptBroadcast("quit"); // quit if failed to go to town
            }

            while (hostiles.length > 0) {
              delay(500);
            }

            if (outside) {
              outside = false;
              Pather.usePortal(null, me.name);
            }

            this.resume();
          } else {
            scriptBroadcast("quit");
          }

          delay(500);

          continue;
        }

        // Kill the hostile player
        if (!prevPos) {
          prevPos = { x: me.x, y: me.y };
        }

        this.pause();

        Config.UseMerc = false; // Don't go revive the merc mid-fight
        attackCount = 0;

        while (attackCount < 100) {
          // Invalidated Unit (out of getUnit range) or player in town
          if (!copyUnit(player).x || player.inTown || me.mode === sdk.player.mode.Dead) {
            break;
          }

          ClassAttack.doAttack(player, false);

          // Specific attack additions
          switch (me.classid) {
          case sdk.player.class.Sorceress:
          case sdk.player.class.Necromancer:
            // Dodge missiles - experimental
            missile = Game.getMissile();

            if (missile) {
              do {
                if (getPlayerFlag(me.gid, missile.owner, 8) && (getDistance(me, missile) < 15 || (missile.targetx && getDistance(me, missile.targetx, missile.targety) < 15))) {
                  this.moveAway(missile, Skill.getRange(Config.AttackSkill[1]));

                  break;
                }
              } while (missile.getNext());
            }

            // Move away if the player is too close or if he tries to move too close (telestomp)
            if (Skill.getRange(Config.AttackSkill[1]) > 20 && (getDistance(me, player) < 30 || (player.targetx && getDistance(me, player.targetx, player.targety) < 15))) {
              this.moveAway(player, Skill.getRange(Config.AttackSkill[1]));
            }

            break;
          case sdk.player.class.Paladin:
            // Smite summoners
            if (Config.AttackSkill[1] === sdk.skills.BlessedHammer && Skill.canUse(sdk.skills.Smite)) {
              if ([sdk.player.class.Necromancer, sdk.player.class.Druid].includes(player.classid) && getDistance(me, player) < 4 && this.checkSummons(player)) {
                Skill.cast(sdk.skills.Smite, sdk.skills.hand.Left, player);
              }
            }

            break;
          }

          attackCount += 1;

          if (player.dead) {
            break;
          }
        }

        Pather.moveTo(prevPos.x, prevPos.y);
        this.resume();
      }
    }

    delay(200);
  }
}
