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
*      aon - attack on for all
*      aoff - attack off for all
*      <charname> <action> - tell specific character to perform action
*  @Teleport *** characters without teleport skill will ignore tele command ***
*      tele - toggle teleport for all
*      tele on - teleport on for all
*      tele off - teleport off for all
*      <charname> <action> - tell specific character to perform action
*  @Skills *** refer to skills.txt or modules/sdk.js ***
*      <class || charname || all> skill <skillid> - change skill character(s)
*      ~~~~~~~~~~~~~~~~~~~ Examples ~~~~~~~~~~~~~~~~~~~~~~
*      | NOTE: *** any part of class name will do ***    |
*      | "sorc skill 36", "zon skill 0", "din skill 106" |
*      | "all skill 0", "myhdin skill 112"               |
*      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*      Auras: *** refer to skills.txt or modules/sdk.js ***
*      all aura <skillid> - change aura for all paladins
*      <charname> aura <skillid> - change aura for <charname>
*  @Town
*      a2-5 - move to appropriate act (after quest) !NOTE: Disable 'no sound' or game will crash!
*      talk <npc name> - talk to a npc in town
*      chug <type> <amount> - buy and drink special potions potions from Akara
*      ~~~~~~~~~~~~~~~~~~~ Examples ~~~~~~~~~~~~~~~~~~~~~~
*      | NOTE: *** type can be: a, antidote, t, thawing, s, stamina *** |
*      | "chug a 20" will buy and drink 20 antidote potions             |
*      | "chug t" will buy and drink 10 thawing potions                 |
*      | "slowpoke chug s 5" slowpoke to buy and drink 5 stamina potions|
*      |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
*      <charname> <action> - tell specific character to perform action
*  @Misc
*      <charname> tp - make a TP. Needs a TP tome if not using custom libs.
*      quiet - stop announcing in chat
*      cow - enter red cow portal
*      wp - all players activate a nearby wp
*      bo - barbarian precast
*      move - move in a random direction (use if you're stuck by followers)
*      reload - reload script. Use only in case of emergency, or after editing character config.
*      taxi <areaid> - travels to area and makes portal.
*      taxi <taxiMap key> - travels to area and makes portal. See taxiMap below or use "taxi list" for list of areas.
*      taxi list - list of areas for taxi command
*      quit - exit game
*      <charname> <action> - tell specific character to perform action
*  @todo
*      run <scriptname> - run a script
*      <charname> run <scriptname> - run a script on <charname>
*      skills - list current attack skills
*      <charname> skills - list current attack skills for <charname>
*
*/

function Follower () {
  const QuestData = require("../core/GameData/QuestData");
  /** @type {Map<number, Area>} */
  const areas = new Map();
  /** @type {Set<string>} */
  const _players = new Set();
  /** @type {Array<string>} */
  const actions = [];
  /** @type {Set<string>} */
  const commanders = new Set();
  Config.Leader && commanders.add(Config.Leader);
  let [allowSay, attack, openContainers, stop] = [true, true, true, false];

  /** @type {Map<string, function(): void} */
  const toggleActions = (function () {
    const _actions = new Map();
    
    ["tele", (me.name + " tele")]
      .forEach(key => _actions.set(key, () => {
        Pather.teleport = !Pather.teleport;
        announce("Teleport " + (Pather.teleport ? "on" : "off"));
      }));
    ["tele off", (me.name + " tele off")]
      .forEach(key => _actions.set(key, () => {
        Pather.teleport = false;
        announce("Teleport off.");
      }));
    ["tele on", (me.name + " tele on")]
      .forEach(key => _actions.set(key, () => {
        Pather.teleport = true;
        announce("Teleport on.");
      }));
    ["a", (me.name + " a")]
      .forEach(key => _actions.set(key, () => {
        attack = !attack;
        announce("Attack " + (attack ? "on" : "off"));
      }));
    ["aon", (me.name + " aon")]
      .forEach(key => _actions.set(key, () => {
        attack = true;
        announce("Attack on.");
      }));
    ["aoff", (me.name + " aoff")]
      .forEach(key => _actions.set(key, () => {
        attack = false;
        announce("Attack off.");
      }));
    ["s", (me.name + " s")]
      .forEach(key => _actions.set(key, () => {
        stop = !stop;
        announce((stop ? "Stopping." : "Resuming."));
      }));
    ["quiet", (me.name + " quiet")]
      .forEach(key => _actions.set(key, () => {
        allowSay = !allowSay;
        console.log("Allow say: " + allowSay);
      }));
    
    return _actions;
  })();

  /** @type {Map<string, function(): void} */
  const quickActions = (function () {
    const _actions = new Map();
    
    ["flash", (me.name + " flash")]
      .forEach(key => _actions.set(key, () => {
        Packet.flash(me.gid, me.getPingDelay());
      }));
    ["quit", (me.name + " quit")]
      .forEach(key => _actions.set(key, () => {
        quit();
      }));
    ["r", (me.name + " r")]
      .forEach(key => _actions.set(key, () => {
        revive();
      }));
    ["move", (me.name + " move")]
      .forEach(key => _actions.set(key, () => {
        let coord = CollMap.getRandCoordinate(me.x, -5, 5, me.y, -5, 5);
        Pather.moveTo(coord.x, coord.y);
      }));
    ["pre", (me.name + " pre")]
      .forEach(key => _actions.set(key, () => {
        Precast.doPrecast(true);
      }));
    ["bo", (me.name + " bo")]
      .forEach(key => _actions.set(key, () => {
        !me.inTown && Precast.doPrecast(true);
      }));
    ["h", (me.name + " h")]
      .forEach(key => _actions.set(key, () => {
        !me.inTown && Skill.cast(sdk.skills.Howl);
      }));
    
    return _actions;
  })();

  /** @type {Map<string, function(): void} */
  const specialActions = (function () {
    const _actions = new Map();

    ["cow", (me.name + " cow")]
      .forEach(key => _actions.set(key, () => {
        if (me.inArea(sdk.areas.MooMooFarm)) return;
        Town.goToTown(1);
        Town.move("portalspot");
        if (!Pather.usePortal(sdk.areas.MooMooFarm)) {
          announce("Failed to enter red cow portal.");
        }
      }));
    ["wp", (me.name + " wp")]
      .forEach(key => _actions.set(key, () => {
        if (me.inTown) return;
        if (getWaypoint(Pather.wpAreas.indexOf(me.area))) return;
        if (!Pather.wpAreas.includes(me.area)) return;
        if (Pather.getWP(me.area)) {
          announce("Got Wp in " + getAreaName(me.area));
        }
      }));
    ["c", (me.name + " c")]
      .forEach(key => _actions.set(key, () => {
        !me.inTown && Town.getCorpse();
      }));
    ["p", (me.name + " p")]
      .forEach(key => _actions.set(key, () => {
        announce("!Picking items.");
        Pickit.pickItems();
        openContainers && Misc.openChests(20);
        announce("!Done picking.");
      }));
    ["1", (me.name + " 1")]
      .forEach(key => _actions.set(key, () => {
        if (me.inTown && Leader.partyUnit.inTown && Misc.getPlayerAct(Config.Leader) !== me.act) {
          announce("Going to leader's town.");
          Town.goToTown(Misc.getPlayerAct(Config.Leader));
          Town.move("portalspot");
        } else if (me.inTown) {
          announce("Going outside.");
          Town.goToTown(Misc.getPlayerAct(Config.Leader));
          Town.move("portalspot");

          if (!Pather.usePortal(null, Leader.partyUnit.name)) {
            if (!checkExit(Leader.partyUnit, Leader.partyUnit.area)) {
              return;
            }
          }

          let _timeout = getTickCount() + Time.minutes(2);
          while (!Misc.getPlayerUnit(Config.Leader) && !me.dead) {
            if (getTickCount() > _timeout) {
              announce("Leader not found.");
              Town.goToTown();
              break;
            }
            Attack.clear(10);
            delay(200);
          }
        }
      }));
    ["2", (me.name + " 2")]
      .forEach(key => _actions.set(key, () => {
        if (!me.inTown) {
          delay(150);
          announce("Going to town.");
          getUnits(sdk.unittype.Object)
            .filter(unit => unit.classid === sdk.objects.BluePortal
              && unit.area === me.area && [Leader.partyUnit.name, me.name].includes(unit.getParent()))
            .sort((a, b) => a.distance - b.distance)
            .some(portal => Pather.usePortal(null, null, portal));
          // Pather.usePortal(null, Leader.unit.name) || Pather.usePortal(sdk.areas.townOf(me.area));
        }
      }));
    ["3", (me.name + " 3")]
      .forEach(key => _actions.set(key, () => {
        if (!me.inTown) return;
        announce("Running town chores");
        Town.doChores();
        Town.move("portalspot");
        announce("Ready");
      }));
    ["a2", "a3", "a4", "a5"]
      .forEach((key, index) => {
        _actions.set(key, () => { changeAct(index + 2); });
        _actions.set(me.name + " " + key, () => { changeAct(index + 2); });
      });
    _actions.set(me.name + " tp", () => {
      if (!Pather.makePortal()) {
        announce("No TP scrolls or tomes.");
      }
    });

    return _actions;
  })();

  /** @type {Map<string, function(): void} */
  const taxiMap = new Map([
    [
      "den", () => {
        Pather.journeyTo(sdk.areas.DenofEvil);
      }
    ],
    [
      "bloodraven", () => {
        Pather.journeyTo(sdk.areas.BurialGrounds);
        Pather.moveNearPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.BloodRaven, 15);
      }
    ],
    [
      "tree", () => {
        Pather.journeyTo(sdk.areas.DarkWood);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.InifussTree, 5, 5);
      }
    ],
    [
      "trist", () => {
        Pather.journeyTo(sdk.areas.Tristram);
      }
    ],
    [
      "pit", () => {
        Pather.journeyTo(sdk.areas.PitLvl1);
      }
    ],
    [
      "countess", () => {
        Pather.journeyTo(sdk.areas.TowerCellarLvl5);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.SuperChest);
      }
    ],
    [
      "andy", () => {
        Pather.journeyTo(sdk.areas.CatacombsLvl4);
      }
    ],
    [
      "rad", () => {
        Pather.journeyTo(sdk.areas.A2SewersLvl3);
        Pather.moveNearPreset(me.area, sdk.unittype.Object, sdk.objects.HoradricScrollChest, 5);
      }
    ],
    [
      "cube", () => {
        Pather.journeyTo(sdk.areas.HallsoftheDeadLvl3);
        Pather.moveNearPreset(me.area, sdk.unittype.Object, sdk.objects.HoradricCubeChest, 15);
      }
    ],
    [
      "amulet", () => {
        Pather.journeyTo(sdk.areas.ClawViperTempleLvl2);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.ViperAmuletChest);
      }
    ],
    [
      "staff", () => {
        Pather.journeyTo(sdk.areas.HallsoftheDeadLvl3);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.ShaftoftheHoradricStaffChest);
      }
    ],
    [
      "summoner", () => {
        Pather.journeyTo(sdk.areas.ArcaneSanctuary);
        Pather.moveNearPreset(me.area, sdk.unittype.Object, sdk.objects.Journal, 15);
      }
    ],
    [
      "staff-altar", () => {
        Pather.journeyTo(sdk.areas.CanyonofMagic);
        Pather.moveToExit(getRoom().correcttomb, true);
        Pather.moveNearPreset(me.area, sdk.unittype.Object, sdk.objects.HoradricStaffHolder, 5);
      }
    ],
    [
      "duriel", () => {
        Pather.journeyTo(sdk.areas.DurielsLair);
      }
    ],
    [
      "eye", () => {
        Pather.journeyTo(sdk.areas.SpiderCavern);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.KhalimsEyeChest);
      }
    ],
    [
      "brain", () => {
        Pather.journeyTo(sdk.areas.FlayerDungeonLvl3);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.KhalimsBrainChest);
      }
    ],
    [
      "heart", () => {
        Pather.journeyTo(sdk.areas.A3SewersLvl2);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.KhalimsHeartChest);
      }
    ],
    [
      "council", () => {
        Pather.journeyTo(sdk.areas.Travincal);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.CompellingOrb);
      }
    ],
    [
      "meph", () => {
        Pather.journeyTo(sdk.areas.DuranceofHateLvl3);
        Pather.moveTo(17590, 8068);
      }
    ],
    [
      "izual", () => {
        Pather.journeyTo(sdk.areas.PlainsofDespair);
        Pather.moveNearPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Izual, 20);
      }
    ],
    [
      "forge", () => {
        Pather.journeyTo(sdk.areas.RiverofFlame);
        Pather.moveNearPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HellForge, 5);
      }
    ],
    [
      "chaos", () => {
        Pather.journeyTo(sdk.areas.ChaosSanctuary);
      }
    ],
    [
      "viz", () => {
        Pather.journeyTo(sdk.areas.ChaosSanctuary);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.DiabloSealVizier);
      }
    ],
    [
      "seis", () => {
        Pather.journeyTo(sdk.areas.ChaosSanctuary);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.DiabloSealSeis);
      }
    ],
    [
      "infector", () => {
        Pather.journeyTo(sdk.areas.ChaosSanctuary);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.DiabloSealInfector);
      }
    ],
    [
      "anya", () => {
        Pather.journeyTo(sdk.areas.FrozenRiver);
        Pather.moveNearPreset(me.area, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform, 5);
      }
    ],
    [
      "ancients", () => {
        Pather.journeyTo(sdk.areas.ArreatSummit);
      }
    ],
    [
      "nith", () => {
        Pather.journeyTo(sdk.areas.HallsofVaught);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.NihlathaksPlatform);
      }
    ],
    [
      "throne", () => {
        Pather.journeyTo(sdk.areas.ThroneofDestruction);
      }
    ],
  ]);

  /**
   * @todo allow user to use skill name and try to match it to skill id
   */
  const skillsMap = (function () {
    const _skills = new Map();

    for (let value of Object.values(sdk.skills)) {
      if (typeof value === "number") {
        _skills.set(getSkillById(value), value);
      }
    }

    return _skills;
  })();

  const announce = function (msg = "") {
    if (!allowSay) return;
    say(msg);
  };

  const revive = function () {
    while (!me.inTown) {
      me.revive();
      delay(1000);
    }

    Town.move("portalspot");
    announce("I'm alive!");
  };

  const playerInGame = function (name = "") {
    if (!name) return false;
    if (_players.has(name.toLowerCase())) return true;
    let player = getParty();

    if (player) {
      do {
        _players.add(player.name.toLowerCase());
      } while (player.getNext());
    }
    return _players.has(name.toLowerCase());
  };

  /**
   * Change areas to where leader is
   * @param {Party} unit 
   * @param {number} area 
   * @returns {boolean}
   */
  const checkExit = function (unit, area) {
    if (unit.inTown && me.inTown) return false;

    /** @type {Exit[]} */
    let exits = [];
    if (areas.has(me.area)) {
      exits = areas.get(me.area).exits;
    } else {
      let _area = getArea(me.area);
      if (_area) {
        exits = _area.exits;
        areas.set(me.area, _area);
      }
    }
    
    for (let exit of exits) {
      if (exit.target === area) {
        announce("Taking exit to " + getAreaName(exit.target));
        return Pather.moveToExit(area, true);
      }
    }

    if (unit.inTown) {
      let wp = Game.getObject("waypoint");

      if (wp && wp.distance < 30) {
        announce("Taking waypoint to " + getAreaName(area));
        return Pather.useWaypoint(area, true);
      }
    }

    let target = Game.getObject("portal");

    if (target) {
      do {
        if (target.objtype === area) {
          announce("Taking portal to " + getAreaName(area));
          return Pather.usePortal(null, null, target);
        }
      } while (target.getNext());
    }

    // Arcane<->Cellar portal
    if ((me.inArea(sdk.areas.ArcaneSanctuary) && area === sdk.areas.PalaceCellarLvl3)
      || (me.inArea(sdk.areas.PalaceCellarLvl3) && area === sdk.areas.ArcaneSanctuary)) {
      announce("Special transit to " + getAreaName(area));
      return Pather.usePortal(null);
    }

    // Tal-Rasha's tomb->Duriel's lair
    if (me.area >= sdk.areas.TalRashasTomb1
      && me.area <= sdk.areas.TalRashasTomb7
      && area === sdk.areas.DurielsLair) {
      announce("Special transit to " + getAreaName(area));
      return Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, area);
    }

    // durance 3 -> pandemonium fortress
    if (me.inArea(sdk.areas.DuranceofHateLvl3) && area === sdk.areas.PandemoniumFortress) {
      announce("Special transit to " + getAreaName(area));
      return Pather.useUnit(sdk.unittype.Object, sdk.objects.RedPortalToAct4, sdk.areas.PandemoniumFortress);
    }

    // Throne->Chamber
    if (me.inArea(sdk.areas.ThroneofDestruction) && area === sdk.areas.WorldstoneChamber) {
      let wsp = Game.getObject(sdk.objects.WorldstonePortal);

      if (wsp) {
        announce("Special transit to " + getAreaName(area));
        return Pather.usePortal(null, null, wsp);
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

    me.clearBelt();

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
      if (toggleActions.has(msg)) {
        toggleActions.get(msg)();

        return;
      } else if (quickActions.has(msg)) {
        quickActions.get(msg)();

        return;
      } else if (specialActions.has(msg)) {
        actions.push(msg);

        return;
      }
      let piecewise = msg.split(" ");
      let who = piecewise.length > 1 && piecewise.first() || "";
      const isForMe = (charClass.includes(who) || who === me.name || who === "all");

      if (me.paladin && isForMe && msg.includes("aura ")) {
        let aura = parseInt(msg.split(" ")[2], 10);

        if (me.getSkill(aura, sdk.skills.subindex.SoftPoints)) {
          announce("Active aura is: " + aura);

          Config.AttackSkill[2] = aura;
          Config.AttackSkill[4] = aura;

          Skill.setSkill(aura, sdk.skills.hand.Right);
        } else {
          announce("I don't have that aura.");
        }
      } else if (isForMe && msg.includes("skill ")) {
        let skill = parseInt(msg.split(" ")[2], 10);

        if (me.getSkill(skill, sdk.skills.subindex.SoftPoints)) {
          announce("Attack skill is: " + skill);

          Config.AttackSkill[1] = skill;
          Config.AttackSkill[3] = skill;
        } else {
          announce("I don't have that skill.");
        }
      } else {
        if (who) {
          if (isForMe) {
            msg = msg.replace(who, "").trim();
          } else if (playerInGame(who)) {
            return;
          }
        }
        actions.push(msg);
      }
    } else if (msg && msg.split(" ")[0] === "leader" && (commanders.has(nick) || !commanders.size)) {
      let piece = msg.split(" ")[1];

      if (typeof piece === "string") {
        commanders.add(piece);
        announce("Switching leader to " + piece);

        Config.Leader = piece;
        Leader.partyUnit = Misc.findPlayer(Config.Leader);
        Leader.unit = Misc.getPlayerUnit(Config.Leader);
      }
    }
  };

  const gameEvent = function (mode, param1, param2, name1, name2) {
    console.log("gameevent", mode, param1, param2, name1, name2);
    if (name1 === Config.Leader
      && mode === 0x07
      && param1 === 0x02
      && param2 === 0x09) {
      recheck = true;
    }
  };

  // START
  let recheck = false;
  addEventListener("chatmsg", chatEvent);
  addEventListener("gameevent", gameEvent);
  openContainers && Config.OpenChests.enabled && Config.OpenChests.Types.push("all");
  
  // Override config values that use TP
  Config.TownCheck = false;
  Config.TownHP = 0;
  Config.TownMP = 0;
  const charClass = sdk.player.class.nameOf(me.classid).toLowerCase();
  const Leader = new function () {
    /** @type {Party} */
    this.partyUnit = null;
    /** @type {Player} */
    this.unit = null;
  };

  Leader.partyUnit = Misc.poll(
    () => Misc.findPlayer(Config.Leader),
    Time.minutes(3),
    Time.seconds(1)
  );

  if (!Leader.partyUnit) {
    announce("Leader not found.");
    scriptBroadcast("quit");

    return true;
  }

  announce("Leader found :: " + Leader.partyUnit.name);

  while (!Misc.inMyParty(Config.Leader)) {
    delay(500);
  }

  announce("Partied.");

  if (Leader.partyUnit.inTown && !me.inTown) {
    announce("Going to leader's town.");
    Town.goToTown(sdk.areas.actOf(Leader.partyUnit.area));
  }
  me.inTown && Town.move("portalspot");
  Leader.unit = Misc.getPlayerUnit(Config.Leader);

  // Main Loop
  while (true) {
    if (recheck) {
      if (!Misc.poll(() => Misc.inMyParty(Config.Leader), Time.minutes(1), Time.seconds(1))) {
        announce("Leader left party.");
        
        break;
      }
      recheck = false;
    }
    if (me.mode === sdk.player.mode.Dead) {
      revive();
    }

    while (stop) {
      delay(500);
    }

    if (!me.inTown) {
      try {
        if (!Leader.unit) throw new Error("Leader not found.");
        if (!Leader.partyUnit) throw new Error("party unit not found.");
        if (me.inArea(Leader.partyUnit.area) && copyUnit(Leader.unit).x) {
          if (Leader.unit.distance > 10) {
            // Pather.moveToUnit(Leader.unit);
            Pather.moveToEx(
              Leader.unit.x, Leader.unit.y, { callback: () => (
                Leader.unit && Leader.unit.distance < 10
              ) }
            );
          }
        } else {
          if (!me.inArea(Leader.partyUnit.area) && !me.inTown) {
            while (Leader.partyUnit.area === 0) delay(100);
            checkExit(Leader.partyUnit, Leader.partyUnit.area);

            while (me.area === 0) {
              delay(100);
            }
          }
        }
      } catch (e) {
        console.error(e);
        if (Leader.partyUnit) {
          if (me.inArea(Leader.partyUnit.area)) {
            Pather.moveToEx(
              Leader.partyUnit.x, Leader.partyUnit.y, { callback: () => {
                Leader.unit = Misc.getPlayerUnit(Config.Leader);
                return Leader.unit && Leader.unit.distance < 10;
              } }
            );
          } else if (Leader.partyUnit.inTown) {
            // go back to town if there are there for awhile
            if (!Misc.poll(
              () => (Leader.unit = Misc.getPlayerUnit(Config.Leader)),
              Time.seconds(45),
              Time.seconds(1))
            ) {
              Town.goToTown(sdk.areas.actOf(Leader.partyUnit.area));
              Town.move("portalspot");
            }
          }
        } else {
          Leader.partyUnit = Misc.findPlayer(Config.Leader);
        }
      }

      if (attack) {
        // custom attack needs to be done so we can keep track of leader while we attack in break
        // early if leader moves on
        Attack.clear(20, false, false, false, true);
        pickPotions(20);
      }

      if (me.paladin && Config.AttackSkill[2] > 0) {
        Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);
      }
    } else if (!actions.length && getTickCount() - Town.lastChores > Time.minutes(3)) {
      // no actions currently, lets do some town chores
      if (me.gold > 1000
        && (me.needPotions() || Town.checkScrolls(sdk.items.TomeofTownPortal) < 5)) {
        Town.doChores();
      }
      Town.getDistance("portalspot") > 5 && Town.move("portalspot");
    }

    if (actions.length) {
      let action = actions.shift();

      if (specialActions.has(action)) {
        specialActions.get(action)();
      } else {
        switch (action) {
        case "reload":
        case me.name + "reload":
          scriptBroadcast("reload");
          
          return true;
        default:
          console.log(action);
          if (action.includes("talk")) {
            talk(action.split(" ")[1]);
          } else if (action.includes("chug")) {
            let temp = action.toLowerCase().split(" ");
            let [, type, amount] = temp;
            amount === undefined && (amount = 10);
            typeof amount === "string" && (amount = parseInt(amount, 10));

            if (type === "a" || type === "antidote") {
              Town.buyPots(amount, sdk.items.AntidotePotion, true, true);
            } else if (type === "t" || type === "thawing") {
              Town.buyPots(amount, sdk.items.ThawingPotion, true, true);
            } else if (type === "s" || type === "stamina") {
              Town.buyPots(amount, sdk.items.StaminaPotion, true, true);
            }
          } else if (action.includes("taxi")) {
            let [, where] = action.split(" ");
            console.log(where);
            if (where) {
              try {
                if (taxiMap.has(where)) {
                  taxiMap.get(where)();
                } else {
                  let _areaId = parseInt(where, 10);
                  Pather.journeyTo(_areaId);
                }
                Pather.makePortal();
              } catch (e) {
                console.error(e);
                announce("Failed to taxi to " + where);
                Town.goToTown();
              }
            } else if (action === "taxi list") {
              announce("Taxi destinations: " + Array.from(taxiMap.keys()).join(", "));
            }
          }
        }
      }
    }

    delay(100);
  }

  removeEventListener("chatmsg", chatEvent);
  removeEventListener("gameevent", gameEvent);

  return true;
}
