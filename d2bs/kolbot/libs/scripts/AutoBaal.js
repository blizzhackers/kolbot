/**
*  @filename    AutoBaal.js
*  @author      kolton
*  @desc        Universal Baal leecher by Kolton with Autoleader by Ethic
*               Pure leech script for throne and Baal
*               Reenters throne/chamber upon death and picks the corpse back up
*               Make sure you setup safeMsg and baalMsg accordingly
*
*/

/**
*  @todo:
*   - add silent follow support
*      - needs to be in a way that doesn't interfere with normal following
*   - should this listen for baal death packet?
*/

function AutoBaal () {
  // internal variables
  let baalCheck, throneCheck, hotCheck, leader; // internal variables
  let hotTick = 0;
  const safeMsg = ["safe", "throne clear", "leechers can come", "tp is up", "1 clear"]; // safe message - casing doesn't matter
  const baalMsg = ["baal"]; // baal message - casing doesn't matter
  const hotMsg = ["hot", "warm", "dangerous", "lethal"]; // used for shrine hunt

  [safeMsg, baalMsg, hotMsg].forEach((function (arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].toLowerCase();
    }
  }));

  /**
   * chat event handler function, listen to what leader says
   * @param {string} nick 
   * @param {string} msg 
   */
  const chatEvent = function (nick, msg) {
    // filter leader messages
    if (!nick || !msg || nick !== leader) return;
    msg = msg.toLowerCase();

    // loop through all predefined messages to find a match
    for (let str of hotMsg) {
      // leader says a hot tp message
      if (msg.includes(str)) {
        hotCheck = true; // not safe to enter baal chamber
        hotTick = getTickCount();

        return;
      }
    }

    // loop through all predefined messages to find a match
    for (let str of safeMsg) {
      // leader says a safe tp message
      if (msg.includes(str)) {
        throneCheck = true; // safe to enter throne

        return;
      }
    }

    // loop through all predefined messages to find a match
    for (let str of baalMsg) {
      // leader says a baal message
      if (msg.includes(str)) {
        baalCheck = true; // safe to enter baal chamber

        return;
      }
    }
  };

  /**
   * @todo maybe factor this out and make it useable for other leecher scripts?
   */
  const longRangeSupport = function () {
    switch (me.classid) {
    case sdk.player.class.Necromancer:
      ClassAttack.raiseArmy(50);

      if (Config.Curse[1] > 0) {
        let monster = Game.getMonster();

        if (monster) {
          do {
            if (monster.attackable && monster.distance < 50 && !checkCollision(me, monster, sdk.collision.Ranged)
              && monster.curseable && !monster.isSpecial && ClassAttack.canCurse(monster, Config.Curse[1])) {
              Skill.cast(Config.Curse[1], sdk.skills.hand.Right, monster);
            }
          } while (monster.getNext());
        }
      }

      break;
    case sdk.player.class.Assassin:
      if (Config.UseTraps && ClassAttack.checkTraps({ x: 15095, y: 5037 })) {
        ClassAttack.placeTraps({ x: 15095, y: 5037 }, 5);
      }

      break;
    default:
      break;
    }

    let skills = [
      sdk.skills.ChargedStrike, sdk.skills.Lightning, sdk.skills.FireWall, sdk.skills.Meteor, sdk.skills.Blizzard,
      sdk.skills.BoneSpear, sdk.skills.BoneSpirit, sdk.skills.DoubleThrow, sdk.skills.Volcano
    ];

    if (!skills.some(skill => Config.AttackSkill[1] === skill || Config.AttackSkill[3] === skill)) {
      return false;
    }

    let monster = Game.getMonster();
    let monList = [];

    if (monster) {
      do {
        if (monster.attackable && monster.distance < 50 && !checkCollision(me, monster, sdk.collision.Ranged)) {
          monList.push(copyUnit(monster));
        }
      } while (monster.getNext());
    }

    if (me.inArea(sdk.areas.ThroneofDestruction)) {
      [15116, 5026].distance > 10 && Pather.moveTo(15116, 5026);
    }

    let oldVal = Skill.usePvpRange;
    Skill.usePvpRange = true;

    try {
      while (monList.length) {
        monList.sort(Sort.units);
        monster = copyUnit(monList[0]);

        if (monster && monster.attackable) {
          let index = monster.isSpecial ? 1 : 3;

          if (Config.AttackSkill[index] > -1
            && Attack.checkResist(monster, Attack.getSkillElement(Config.AttackSkill[index]))) {
            ClassAttack.doCast(monster, Config.AttackSkill[index], Config.AttackSkill[index + 1]);
          } else {
            monList.shift();
          }
        } else {
          monList.shift();
        }

        delay(5);
      }
    } finally {
      Skill.usePvpRange = oldVal;
    }

    return true;
  };

  // critical error - can't reach harrogath
  if (!Town.goToTown(5)) throw new Error("Town.goToTown failed.");

  if (Config.Leader) {
    leader = Config.Leader;
    if (!Misc.poll(() => Misc.inMyParty(leader), Time.seconds(30), Time.seconds(1))) {
      throw new Error("AutoBaal: Leader not partied");
    }
  }

  try {
    addEventListener("chatmsg", chatEvent);
    Config.AutoBaal.FindShrine === 2 && (hotCheck = true);

    Town.doChores();
    Town.move("portalspot");

    // find the first player in throne of destruction
    if (leader || (leader = Misc.autoLeaderDetect({
      destination: sdk.areas.ThroneofDestruction,
      quitIf: (area) => [sdk.areas.WorldstoneChamber].includes(area)
    }))) {
      // do our stuff while partied
      while (Misc.inMyParty(leader)) {
        if (hotCheck) {
          if (Config.AutoBaal.FindShrine) {
            let i;
            Pather.useWaypoint(sdk.areas.StonyField);
            Precast.doPrecast(true);

            for (i = sdk.areas.StonyField; i > 1; i--) {
              if (Misc.getShrinesInArea(i, sdk.shrines.Experience, true)) {
                break;
              }
            }

            if (i === 1) {
              Town.goToTown();
              Pather.useWaypoint(sdk.areas.DarkWood);

              for (i = sdk.areas.DarkWood; i < sdk.areas.DenofEvil; i++) {
                if (Misc.getShrinesInArea(i, sdk.shrines.Experience, true)) {
                  break;
                }
              }
            }
            Town.goToTown(5);
            Town.move("portalspot");

            hotCheck = false;
          } else if (getTickCount() - hotTick > Time.seconds(30)) {
            // maybe we missed the message, go ahead and enter throne
            if (!throneCheck && !baalCheck) {
              throneCheck = true;
              hotCheck = false;
            }
          }
        }

        // wait for throne signal - leader's safe message
        if ((throneCheck || baalCheck) && me.inArea(sdk.areas.Harrogath)) {
          console.log("ÿc4AutoBaal: ÿc0Trying to take TP to throne.");
          Pather.usePortal(sdk.areas.ThroneofDestruction, null);
          // move to a safe spot
          Pather.moveTo(Config.AutoBaal.LeechSpot[0], Config.AutoBaal.LeechSpot[1]);
          Precast.doPrecast(true);
          Town.getCorpse();
        }

        if (!baalCheck && me.inArea(sdk.areas.ThroneofDestruction) && Config.AutoBaal.LongRangeSupport) {
          longRangeSupport();
        }
        // wait for baal signal - leader's baal message
        if (baalCheck && me.inArea(sdk.areas.ThroneofDestruction)) {
          // move closer to chamber portal
          Pather.moveTo(15092, 5010);
          Precast.doPrecast(false);

          // wait for baal to go through the portal
          while (Game.getMonster(sdk.monsters.ThroneBaal)) {
            delay(500);
          }

          let portal = Game.getObject(sdk.objects.WorldstonePortal);

          delay(2000); // wait for others to enter first - helps with curses and tentacles from spawning around you
          console.log("ÿc4AutoBaal: ÿc0Entering chamber.");
          Pather.usePortal(null, null, portal) && Pather.moveTo(15166, 5903); // go to a safe position
          Town.getCorpse();
        }

        let baal = Game.getMonster(sdk.monsters.Baal);

        if (baal) {
          if (baal.dead) {
            break;
          }

          longRangeSupport();
        }

        me.mode === sdk.player.mode.Dead && me.revive();

        delay(500);
      }
    } else {
      throw new Error("Empty game.");
    }
  } finally {
    removeEventListener("chatmsg", chatEvent);
  }

  return true;
}
