/**
*  @filename    Follower.js
*  @author      kolton, theBGuy
*  @desc        Controllable bot to follow around leader like an additonal merc
*  @Commands
*  @Main
*      1 - take leader's tp from town / move to leader's town
*      2 - take leader's tp to town
*      3 - town manager
*      c - get corpse
*      p - pick items
*      r - revive
*      s - toggle stop
*      pre - precast
*      <charname> <action> - tell specific character to perform action
*  @Attack
*      a - attack toggle for all
*      <charname> a - attack toggle for <charname>
*      aon - attack on for all
*      <charname> aon - attack on for <charname>
*      aoff - attack off for all
*      <charname> aoff - attack off for <charname>
*  @Teleport *** characters without teleport skill will ignore tele command ***
*      tele - toggle teleport for all
*      <charname> tele - toggle teleport for <charname>
*      tele on - teleport on for all
*      <charname> tele on - teleport on for <charname>
*      tele off - teleport off for all
*      <charname> tele off - teleport off for <charname>
*  @Skills *** refer to skills.txt ***
*      all skill <skillid> - change skill for all. refer to skills.txt
*      <charname> skill <skillid> - change skill for <charname>
*      <class> skill <skillid> - change skill for all characters of certain class
*      *** any part of class name will do *** for example: "sorc skill 36", "zon skill 0", "din skill 106"
*      Auras: *** refer to skills.txt ***
*      all aura <skillid> - change aura for all paladins
*      <charname> aura <skillid> - change aura for <charname>
*  @Town
*      a2-5 - move to appropriate act (after quest) !NOTE: Disable 'no sound' or game will crash!
*      talk <npc name> - talk to a npc in town
*  @Misc
*      quiet - stop announcing in chat
*      cow - enter red cow portal
*      wp - all players activate a nearby wp
*      <charname> wp - <charname> activates a nearby wp
*      bo - barbarian precast
*      <charname> tp - make a TP. Needs a TP tome if not using custom libs.
*      move - move in a random direction (use if you're stuck by followers)
*      reload - reload script. Use only in case of emergency, or after editing character config.
*      quit - exit game
*  @todo
*      run <scriptname> - run a script
* 		 <charname> run <scriptname> - run a script on <charname>
*      skills - list current attack skills
*      <charname> skills - list current attack skills for <charname>
*
*/

function Follower() {
  const QuestData = require("../core/GameData/QuestData");
  const commanders = [];
  Config.Leader && commanders.push(Config.Leader);
  let piece, skill;
  let [allowSay, attack, openContainers, stop] = [true, true, true, false];
  let [leader, leaderUnit] = [null, null];
  let action = "";

  const announce = function (msg = "") {
    if (!allowSay) return;
    say(msg);
  };

  /**
	 * Change areas to where leader is
	 * @param {Player} unit 
	 * @param {number} area 
	 * @returns {boolean}
	 */
  const checkExit = function (unit, area) {
    if (unit.inTown) return false;

    let target;
    let exits = getArea().exits;

    for (let i = 0; i < exits.length; i += 1) {
      if (exits[i].target === area) {
        return 1;
      }
    }

    if (unit.inTown) {
      target = Game.getObject("waypoint");

      if (target && getDistance(me, target) < 20) {
        return 3;
      }
    }

    target = Game.getObject("portal");

    if (target) {
      do {
        if (target.objtype === area) {
          Pather.usePortal(null, null, target);

          return 2;
        }
      } while (target.getNext());
    }

    // Arcane<->Cellar portal
    if ((me.inArea(sdk.areas.ArcaneSanctuary) && area === sdk.areas.PalaceCellarLvl3)
			|| (me.inArea(sdk.areas.PalaceCellarLvl3) && area === sdk.areas.ArcaneSanctuary)) {
      Pather.usePortal(null);

      return 4;
    }

    // Tal-Rasha's tomb->Duriel's lair
    if (me.area >= sdk.areas.TalRashasTomb1 && me.area <= sdk.areas.TalRashasTomb7 && area === sdk.areas.DurielsLair) {
      Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, area);

      return 4;
    }

    // Throne->Chamber
    if (me.inArea(sdk.areas.ThroneofDestruction) && area === sdk.areas.WorldstoneChamber) {
      target = Game.getObject(sdk.objects.WorldstonePortal);

      if (target) {
        Pather.usePortal(null, null, target);

        return 4;
      }
    }

    return false;
  };

  /**
	 * Talk to a NPC
	 * @param {string} name 
	 * @returns {boolean}
	 */
  const talk = function (name) {
    try {
      if (!me.inTown) throw new Error("I'm not in town!");
      if (typeof name !== "string") throw new Error("No NPC name given.");
      Town.npcInteract(name);

      return true;
    } catch (e) {
      console.error(e);
      announce(
        (typeof e === "object" && e.message
          ? e.message
          : typeof e === "string"
            ? e
            : "Failed to talk to " + name)
      );

      return false;
    } finally {
      Town.move("portalspot");
    }
  };

  /**
	 * Change act after completing last act quest
	 * @param {number} act 
	 * @returns {boolean}
	 */
  const changeAct = function (act) {
    let preArea = me.area;

    if (me.area >= sdk.areas.townOfAct(act)) {
      announce("My current act is higher than " + act);
      return false;
    }

    const npcTravel = new Map([
      [1, ["Warriv", sdk.areas.RogueEncampment]],
      [2, [(me.act === 1 ? "Warriv" : "Meshif"), sdk.areas.LutGholein]],
      [3, ["Meshif", sdk.areas.KurastDocktown]],
      [4, ["", sdk.areas.PandemoniumFortress]],
      [5, ["Tyrael", sdk.areas.Harrogath]],
    ]);

    const preCheck = new Map([
      [
        2,
        () => QuestData.get(sdk.quest.id.SistersToTheSlaughter).complete(true)
      ],
      [
        3,
        () => {
          if (QuestData.get(sdk.quest.id.TheSevenTombs).complete()) return true;
          if (!QuestData.get(sdk.quest.id.TheSevenTombs).checkState(4/*talked to jerhyn*/)) {
            Town.npcInteract("Jerhyn");
            if (me.getTpTool()) {
              Pather.moveToExit(sdk.areas.HaremLvl1, true);
              Pather.usePortal(null) || Pather.makePortal(true);
            }
          }
          return QuestData.get(sdk.quest.id.TheSevenTombs).checkState(4/*talked to jerhyn*/);
        }
      ],
      [
        4,
        () => {
          if (me.inTown) {
            if (!QuestData.get(sdk.quest.id.TheBlackenedTemple).complete()) {
              Town.npcInteract("Cain");
            }
            Town.move("portalspot");
            Pather.usePortal(sdk.areas.DuranceofHateLvl3, null);
          }
          return me.inArea(sdk.areas.DuranceofHateLvl3);
        }
      ],
      [
        5,
        () => {
          if (!QuestData.get(sdk.quest.id.TerrorsEnd).checkState(9/*talked to tyrael*/)) {
            Town.npcInteract("Tyrael");
          }
          return QuestData.get(sdk.quest.id.TerrorsEnd).checkState(9/*talked to tyrael*/);
        }
      ]
    ]);

    if (!preCheck.get(act)()) {
      announce("Failed act " + act + " precheck");
      return false;
    }

    if (act !== 4) {
      let [npc, loc] = npcTravel.get(act);
      if (!npc) return false;

      !me.inTown && Town.goToTown();
      let npcUnit = Town.npcInteract(npc);
      let timeout = getTickCount() + 3000;
      let pingDelay = me.getPingDelay();

      if (!npcUnit) {
        while (!npcUnit && timeout < getTickCount()) {
          Town.move(NPC[npc]);
          Packet.flash(me.gid, pingDelay);
          delay(pingDelay * 2 + 100);
          npcUnit = Game.getNPC(npc);
        }
      }

      if (npcUnit) {
        for (let i = 0; i < 5; i++) {
          new PacketBuilder()
            .byte(sdk.packets.send.EntityAction)
            .dword(0)
            .dword(npcUnit.gid)
            .dword(loc)
            .send();
          delay(1000);

          if (me.act === act) {
            break;
          }
        }
      }
    } else {
      if (me.inArea(sdk.areas.DuranceofHateLvl3)) {
        let target = Game.getObject(sdk.objects.RedPortalToAct4);
        target && Pather.moveTo(target.x - 3, target.y - 1);

        Pather.usePortal(null);
      }
    }

    while (!me.gameReady) {
      delay(100);
    }

    if (me.area === preArea) {
      me.cancel();
      Town.move("portalspot");
      announce("Act change failed.");

      return false;
    }

    Town.move("portalspot");
    announce("Act change successful.");
    act === 2 && announce("Don't forget to talk to Drognan after getting the Viper Amulet!");

    return true;
  };

  const pickPotions = function (range = 5) {
    if (me.dead) return false;

    Town.clearBelt();

    while (!me.idle) {
      delay(40);
    }

    let pickList = [];
    let item = Game.getItem();

    if (item) {
      do {
        if (item.onGroundOrDropping && item.itemType >= sdk.items.type.HealingPotion
					&& item.itemType <= sdk.items.type.RejuvPotion && item.distance <= range) {
          pickList.push(copyUnit(item));
        }
      } while (item.getNext());
    }

    pickList.sort(Pickit.sortItems);

    while (pickList.length > 0) {
      item = pickList.shift();

      if (item && copyUnit(item).x) {
        let status = Pickit.checkItem(item).result;

        if (status && Pickit.canPick(item)) {
          Pickit.pickItem(item, status);
        }
      }
    }

    return true;
  };

  /**
	 * @param {string} nick 
	 * @param {string} msg 
	 */
  const chatEvent = function (nick, msg) {
    if (msg && nick === Config.Leader) {
      switch (msg) {
      case "tele":
      case me.name + " tele":
        Pather.teleport = !Pather.teleport;
        announce("Teleport " + (Pather.teleport ? "on" : "off"));

        break;
      case "tele off":
      case me.name + " tele off":
        Pather.teleport = false;
        announce("Teleport off.");

        break;
      case "tele on":
      case me.name + " tele on":
        Pather.teleport = true;
        announce("Teleport on.");

        break;
      case "a":
      case me.name + " a":
        attack = !attack;
        announce("Attack " + (attack ? "on" : "off"));

        break;
      case "flash":
        Packet.flash(me.gid);

        break;
      case "quiet":
        allowSay = !allowSay;

        break;
      case "aoff":
      case me.name + " aoff":
        attack = false;
        announce("Attack off.");

        break;
      case "aon":
      case me.name + " aon":
        attack = true;
        announce("Attack on.");

        break;
      case "quit":
      case me.name + " quit":
        quit();

        break;
      case "s":
      case me.name + " s":
        stop = !stop;
        announce((stop ? "Stopping." : "Resuming."));

        break;
      case "r":
        me.dead && me.revive();

        break;
      default:
        let piecewise = msg.split(" ");
        let who = piecewise.length > 1 && piecewise.first() || "";

        if (me.paladin && msg.includes("aura ")) {
          if (who === me.name || piece === "all") {
            skill = parseInt(msg.split(" ")[2], 10);

            if (me.getSkill(skill, sdk.skills.subindex.SoftPoints)) {
              announce("Active aura is: " + skill);

              Config.AttackSkill[2] = skill;
              Config.AttackSkill[4] = skill;

              Skill.setSkill(skill, sdk.skills.hand.Right);
            } else {
              announce("I don't have that aura.");
            }
          }
        } else if (msg.includes("skill ")) {
          if (charClass.includes(who) || who === me.name || who === "all") {
            skill = parseInt(msg.split(" ")[2], 10);

            if (me.getSkill(skill, sdk.skills.subindex.SoftPoints)) {
              announce("Attack skill is: " + skill);

              Config.AttackSkill[1] = skill;
              Config.AttackSkill[3] = skill;
            } else {
              announce("I don't have that skill.");
            }
          }
        } else {
          if (who && who !== me.name && who !== "all") {
            return;
          }
          who && (msg = msg.replace(who, "").trim());
          action = msg;
        }

        break;
      }
    }

    if (msg && msg.split(" ")[0] === "leader" && (commanders.includes(nick) || !commanders.length)) {
      piece = msg.split(" ")[1];

      if (typeof piece === "string") {
        if (commanders.indexOf(piece) === -1) {
          commanders.push(piece);
        }

        announce("Switching leader to " + piece);

        Config.Leader = piece;
        leader = Misc.findPlayer(Config.Leader);
        leaderUnit = Misc.getPlayerUnit(Config.Leader);
      }
    }
  };


  // START
  addEventListener("chatmsg", chatEvent);
  openContainers && Config.OpenChests.enabled && Config.OpenChests.Types.push("all");
	
  // Override config values that use TP
  Config.TownCheck = false;
  Config.TownHP = 0;
  Config.TownMP = 0;
  const charClass = sdk.player.class.nameOf(me.classid).toLowerCase();
  leader = Misc.poll(() => Misc.findPlayer(Config.Leader), Time.seconds(20), Time.seconds(1));

  if (!leader) {
    announce("Leader not found.");
    delay(1000);
    quit();
  } else {
    announce("Leader found.");
  }

  while (!Misc.inMyParty(Config.Leader)) {
    delay(500);
  }

  announce("Partied.");

  me.inTown && Town.move("portalspot");

  // Main Loop
  while (Misc.inMyParty(Config.Leader)) {
    if (me.mode === sdk.player.mode.Dead) {
      while (!me.inTown) {
        me.revive();
        delay(1000);
      }

      Town.move("portalspot");
      announce("I'm alive!");
    }

    while (stop) {
      delay(500);
    }

    if (!me.inTown) {
      if (!leaderUnit || !copyUnit(leaderUnit).x) {
        leaderUnit = Misc.getPlayerUnit(Config.Leader);

        if (leaderUnit) {
          announce("Leader unit found.");
        }
      }

      if (!leaderUnit) {
        let player = Game.getPlayer();

        if (player) {
          do {
            if (player.name !== me.name) {
              Pather.moveToUnit(player);

              break;
            }
          } while (player.getNext());
        }
      }

      if (leaderUnit && getDistance(me.x, me.y, leaderUnit.x, leaderUnit.y) <= 60) {
        if (getDistance(me.x, me.y, leaderUnit.x, leaderUnit.y) > 4) {
          Pather.moveToUnit(leaderUnit);
        }
      }

      if (attack) {
        Attack.clear(20, false, false, false, true);
        pickPotions(20);
      }

      me.paladin && Config.AttackSkill[2] > 0 && Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);

      if (leader.area !== me.area && !me.inTown) {
        while (leader.area === 0) {
          delay(100);
        }

        let result = checkExit(leader, leader.area);

        switch (result) {
        case 1:
          announce("Taking exit.");
          delay(500);
          Pather.moveToExit(leader.area, true);

          break;
        case 2:
          announce("Taking portal.");

          break;
        case 3:
          announce("Taking waypoint.");
          delay(500);
          Pather.useWaypoint(leader.area, true);

          break;
        case 4:
          announce("Special transit.");

          break;
        }

        while (me.area === 0) {
          delay(100);
        }

        leaderUnit = Misc.getPlayerUnit(Config.Leader);
      }
    }

    MainSwitch:
    switch (action) {
    case "cow":
      if (me.inArea(sdk.areas.RogueEncampment)) {
        Town.move("portalspot");
        !Pather.usePortal(sdk.areas.MooMooFarm) && announce("Failed to use cow portal.");
      }

      break;
    case "move":
      let coord = CollMap.getRandCoordinate(me.x, -5, 5, me.y, -5, 5);
      Pather.moveTo(coord.x, coord.y);

      break;
    case "wp":
    case me.name + "wp":
      if (me.inTown) {
        break;
      }

      delay(rand(1, 3) * 500);

      if (Game.getObject("waypoint")) {
        for (let retry = 0; retry < 3; retry++) {
          if (Pather.getWP(me.area)) {
            announce("Got wp.");
            break MainSwitch;
          }
        }

        announce("Failed to get wp.");
      }

      me.cancel();

      break;
    case "c":
      !me.inTown && Town.getCorpse();

      break;
    case "p":
      announce("!Picking items.");
      Pickit.pickItems();
      openContainers && Misc.openChests(20);
      announce("!Done picking.");

      break;
    case "1":
      if (me.inTown && leader.inTown && Misc.getPlayerAct(Config.Leader) !== me.act) {
        announce("Going to leader's town.");
        Town.goToTown(Misc.getPlayerAct(Config.Leader));
        Town.move("portalspot");
      } else if (me.inTown) {
        announce("Going outside.");
        Town.goToTown(Misc.getPlayerAct(Config.Leader));
        Town.move("portalspot");

        if (!Pather.usePortal(null, leader.name)) {
          break;
        }

        while (!Misc.getPlayerUnit(Config.Leader) && !me.dead) {
          Attack.clear(10);
          delay(200);
        }
      }

      break;
    case "2":
      if (!me.inTown) {
        delay(150);
        announce("Going to town.");
        Pather.usePortal(null, leader.name);
      }

      break;
    case "3":
      if (me.inTown) {
        announce("Running town chores");
        Town.doChores();
        Town.move("portalspot");
        announce("Ready");
      }

      break;
    case "h":
      me.barbarian && Skill.cast(sdk.skills.Howl);

      break;
    case "pre":
      Precast.doPrecast(true);

      break;
    case "bo":
      // checks if we have cta or warcries
      Precast.needOutOfTownCast() && Precast.doPrecast(true);

      break;
    case "a2":
    case "a3":
    case "a4":
    case "a5":
      changeAct(parseInt(action[1], 10));

      break;
    case me.name + " tp":
      if (!Pather.makePortal()) {
        announce("No TP scrolls or tomes.");
      }

      break;
    }

    if (action.includes("talk")) {
      talk(action.split(" ")[1]);
    }

    action = "";

    delay(100);
  }

  return true;
}
