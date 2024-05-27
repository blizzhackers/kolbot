/* eslint-disable max-len */
/**
*  @filename    Rushee.js
*  @author      kolton, theBGuy
*  @desc        Rushee script that works with Rusher
*
*/


function Rushee () {
  const Overrides = require("../modules/Override");

  new Overrides.Override(Town, Town.goToTown, function (orignal, act, wpmenu) {
    try {
      orignal(act, wpmenu);

      return true;
    } catch (e) {
      console.log(e);
      
      return Pather.useWaypoint(sdk.areas.townOf(me.area));
    }
  }).apply();

  new Overrides.Override(Pather, Pather.getWP, function (orignal, area, clearPath) {
    if (area !== me.area) return false;

    for (let i = 0; i < sdk.waypoints.Ids.length; i++) {
      let preset = Game.getPresetObject(me.area, sdk.waypoints.Ids[i]);

      if (preset) {
        let x = (preset.roomx * 5 + preset.x);
        let y = (preset.roomy * 5 + preset.y);
        if (!me.inTown && [x, y].distance > 15) return false;

        Skill.haveTK
          ? this.moveNearUnit(preset, 20, { clearSettings: { clearPath: clearPath } })
          : this.moveToUnit(preset, 0, 0, clearPath);

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

            if (Misc.poll(() => me.gameReady && getUIFlag(sdk.uiflags.Waypoint), 1000, 150)) {
              delay(500);
              me.cancelUIFlags();

              return true;
            }

            // handle getUnit bug
            if (!getUIFlag(sdk.uiflags.Waypoint) && me.inTown && wp.name.toLowerCase() === "dummy") {
              Town.getDistance("waypoint") > 5 && Town.move("waypoint");
              Misc.click(0, 0, wp);
            }

            delay(500);
          }
        }
      }
    }

    return false;
  }).apply();
  const { log } = require("../systems/autorush/AutoRush");
  const {
    AutoRush,
    // RushModes,
  } = require("../systems/autorush/RushConfig");

  const useScrollOfRes = function () {
    let scroll = me.scrollofresistance;
    if (scroll) {
      clickItem(sdk.clicktypes.click.item.Right, scroll);
      console.log("Using scroll of resistance");
    }
  };

  const revive = function () {
    while (me.mode === sdk.player.mode.Death) {
      delay(40);
    }

    if (me.mode === sdk.player.mode.Dead) {
      me.revive();

      while (!me.inTown) {
        delay(3);
      }
    }
  };

  // todo - map the chest to classid so we only need to pass in one value
  const getQuestItem = function (classid, chestid) {
    let tick = getTickCount();

    if (me.getItem(classid)) {
      log("Already have: " + classid);
      return true;
    }

    if (me.inTown) return false;

    let chest = Game.getObject(chestid);

    if (!chest) {
      log("Couldn't find: " + chestid);
      return false;
    }

    for (let i = 0; i < 5; i++) {
      if (Misc.openChest(chest)) {
        break;
      }
      log("Failed to open chest: Attempt[" + (i + 1) + "]");
      let coord = CollMap.getRandCoordinate(chest.x, -4, 4, chest.y, -4, 4);
      coord && Pather.moveTo(coord.x, coord.y);
    }

    let item = Game.getItem(classid);

    if (!item) {
      if (getTickCount() - tick < 500) {
        delay(500);
      }

      return false;
    }

    return Pickit.pickItem(item) && delay(1000);
  };

  const checkQuestMonster = function (classid) {
    let monster = Game.getMonster(classid);

    if (monster) {
      while (!monster.dead) {
        delay(500);
      }

      return true;
    }

    return false;
  };

  const tyraelTalk = function () {
    if (me.inArea(sdk.areas.DurielsLair) && [22577, 15609].distance > 10) {
      Pather.move({ x: 22577, y: 15609 }, { callback: function () {
        return Game.getNPC(NPC.Tyrael);
      } });
    }
    let npc = Game.getNPC(NPC.Tyrael);
    if (!npc) return false;

    for (let i = 0; i < 3; i += 1) {
      npc.distance > 3 && Pather.moveToUnit(npc);
      npc.interact();
      delay(1000 + me.ping);
      me.cancel();

      if (Pather.getPortal(null)) {
        me.cancel();

        break;
      }
    }

    return Pather.usePortal(null) || Pather.usePortal(null, Config.Leader);
  };

  const cube = (function () {
    const staff = {
      ingreds: [sdk.quest.item.ShaftoftheHoradricStaff, sdk.quest.item.ViperAmulet],
      outcome: sdk.quest.item.HoradricStaff,
    };
    const flail = {
      ingreds: [
        sdk.quest.item.KhalimsFlail, sdk.quest.item.KhalimsEye,
        sdk.quest.item.KhalimsBrain, sdk.quest.item.KhalimsHeart
      ],
      outcome: sdk.quest.item.KhalimsWill,
    };
    /** @param {{ ingreds: number[], outcome: number }} item */
    const make = function (item) {
      if (me.getItem(item.outcome)) return true;
      let ingreds = item.ingreds.map(id => me.getItem(id));
      if (!ingreds.every(i => i)) return false;
      ingreds.forEach(i => Storage.Cube.MoveTo(i));
      Cubing.openCube();
      transmute();
      delay(750 + me.ping);

      let outcome = me.getItem(item.outcome);
      if (!outcome) return false;

      Storage.Inventory.MoveTo(outcome);
      me.cancel();

      return true;
    };
    return {
      Staff: function () {
        log("Making staff", Config.LocalChat.Enabled);
        return make(staff);
      },
      Flail: function () {
        log("Making flail", Config.LocalChat.Enabled);
        return make(flail);
      },
    };
  })();

  const placeStaff = function () {
    let tick = getTickCount();
    let orifice = Game.getObject(sdk.quest.chest.HoradricStaffHolder);
    if (!orifice) return false;

    Misc.openChest(orifice);

    let staff = me.completestaff;

    if (!staff) {
      if (getTickCount() - tick < 500) {
        delay(500);
      }

      return false;
    }

    staff.toCursor();
    submitItem();
    delay(750 + me.ping);

    // unbug cursor
    let item = me.findItem(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

    if (item && item.toCursor()) {
      Storage.Inventory.MoveTo(item);
    }

    return true;
  };

  const changeAct = function (act) {
    let preArea = me.area;

    if (me.mode === sdk.player.mode.Dead) {
      me.revive();

      while (!me.inTown) {
        delay(500);
      }
    }

    if (me.act === act || me.act > act) return true;

    try {
      switch (act) {
      case 2:
        if (!Town.npcInteract("Warriv", false)) return false;
        Misc.useMenu(sdk.menu.GoEast);

        break;
      case 3:
        // Non Quester needs to talk to Townsfolk to enable Harem TP
        if (!Config.Rushee.Quester) {
          // Talk to Atma
          if (!Town.npcInteract("Atma")) {
            break;
          }
        }
        
        Pather.usePortal(sdk.areas.HaremLvl1, Config.Leader);
        Pather.moveToExit(sdk.areas.LutGholein, true);
        
        if (!Town.npcInteract("Jerhyn")) {
          Pather.moveTo(5166, 5206);

          return false;
        }

        me.cancel();
        Pather.moveToExit(sdk.areas.HaremLvl1, true);
        Pather.usePortal(sdk.areas.LutGholein, Config.Leader);

        if (!Town.npcInteract("Meshif", false)) return false;
        Misc.useMenu(sdk.menu.SailEast);

        break;
      case 4:
        if (me.inTown) {
          Town.npcInteract("Cain");
          Pather.usePortal(sdk.areas.DuranceofHateLvl3, Config.Leader);
        } else {
          delay(1500);
        }

        Pather.moveTo(17591, 8070);
        Pather.usePortal(null);

        break;
      case 5:
        Town.npcInteract("Tyrael", false);
        delay(me.ping + 1);

        if (Game.getObject(sdk.objects.RedPortalToAct5)) {
          me.cancel();
          Pather.useUnit(sdk.unittype.Object, sdk.objects.RedPortalToAct5, sdk.areas.Harrogath);
        } else {
          Misc.useMenu(sdk.menu.TravelToHarrogath);
        }

        break;
      }

      delay(1000 + me.ping * 2);

      while (!me.area) {
        delay(500);
      }

      if (me.area === preArea) {
        me.cancel();
        Town.move("portalspot");
        log("Act change failed.", Config.LocalChat.Enabled);

        return false;
      }

      if (me.act === 2 && Game.getNPC(NPC.Jerhyn)) {
        Town.npcInteract("Jerhyn");
      } else if (me.act === 3) {
        Town.npcInteract("Hratli");
      }

      log("Act change done.", Config.LocalChat.Enabled);
    } catch (e) {
      return false;
    }

    return true;
  };

  const getQuestInfo = function (id) {
    // note: end bosses double printed to match able to go to act flag
    let quests = [
      ["cain", sdk.quest.id.TheSearchForCain],
      ["andariel", sdk.quest.id.SistersToTheSlaughter],
      ["andariel", sdk.quest.id.AbleToGotoActII],
      ["radament", sdk.quest.id.RadamentsLair],
      ["cube", sdk.quest.id.TheHoradricStaff],
      ["amulet", sdk.quest.id.TheTaintedSun],
      ["summoner", sdk.quest.id.TheArcaneSanctuary],
      ["duriel", sdk.quest.id.TheSevenTombs],
      ["duriel", sdk.quest.id.AbleToGotoActIII],
      ["lamesen", sdk.quest.id.LamEsensTome],
      ["travincal", sdk.quest.id.TheBlackenedTemple],
      ["mephisto", sdk.quest.id.TheGuardian],
      ["mephisto", sdk.quest.id.AbleToGotoActIV],
      ["izual", sdk.quest.id.TheFallenAngel],
      ["diablo", sdk.quest.id.TerrorsEnd],
      ["diablo", sdk.quest.id.AbleToGotoActV],
      ["shenk", sdk.quest.id.SiegeOnHarrogath],
      ["anya", sdk.quest.id.PrisonofIce],
      ["ancients", sdk.quest.id.RiteofPassage],
      ["baal", sdk.quest.id.EyeofDestruction]
    ];

    let quest = quests.find(element => element[1] === id);
    console.debug("Quest: " + quest + " ID: " + id);

    return (!!quest ? quest[0] : "");
  };

  let nonQuesterNPCTalk = false;
  let act, target, done = false;
  const commands = [];

  addEventListener("chatmsg",
    function (who, msg) {
      if (!Config.Leader && msg.includes("questinfo")) {
        Config.Leader = who;
        console.debug("Assigned Leader: " + Config.Leader);
      }
      if (who === Config.Leader) {
        commands.push(msg);
      }
    });

  // START
  Town.goToTown(me.highestAct);
  me.inTown && Town.move("portalspot");

  if (me.inArea(sdk.areas.RogueEncampment)
    && !me.getQuest(sdk.quest.id.SpokeToWarriv, sdk.quest.states.Completed)) {
    Town.npcInteract("Warriv");
    Town.move("portalspot");
  }

  // if we can't find our leader after 5 minutes, I'm thinking they aren't showing up. Lets not wait around forever
  const leader = Misc.poll(() => Misc.findPlayer(Config.Leader), Time.minutes(5), 1000);
  if (!leader) throw new Error("Failed to find my rusher");

  Config.Rushee.Quester
    ? log("(Quester) Leader Found: " + Config.Leader, Config.LocalChat.Enabled)
    : console.log("(NonQuester) Leader Found: " + Config.Leader);

  // lets figure out if we either are the bumper or have a bumper so we know if we need to stop at the end of the rush
  const bumperLevelReq = [20, 40, 60][me.diff];
  // ensure we are the right level to go to next difficulty if not on classic
  let nextGame = (Config.Rushee.Bumper && (me.classic || me.charlvl >= bumperLevelReq));
  if (!nextGame) {
    // we aren't the bumper, lets figure out if anyone else is a bumper
    // hell is the end of a rush so always end profile after
    if (Misc.getPlayerCount() > 2 && !me.hell) {
      // there is more than just us and the rusher in game - so check party level
      nextGame = Misc.checkPartyLevel(bumperLevelReq, leader.name);
    }
  }
  console.debug("Is this our last run? " + (nextGame ? "No" : "Yes"));

  const actions = new Map([
    [AutoRush.allIn, function () {
      switch (leader.area) {
      case sdk.areas.A2SewersLvl3:
        // Pick Book of Skill, use Book of Skill
        Town.move("portalspot");
        Pather.usePortal(sdk.areas.A2SewersLvl3, Config.Leader);
        delay(500);

        while (true) {
          target = Game.getItem(sdk.quest.item.BookofSkill);

          if (!target) {
            break;
          }

          Pickit.pickItem(target);
          delay(250);
          target = me.getItem(sdk.quest.item.BookofSkill);

          if (target) {
            console.log("Using book of skill");
            clickItem(sdk.clicktypes.click.item.Right, target);

            break;
          }
        }

        Pather.usePortal(sdk.areas.LutGholein, Config.Leader);

        return true;
      default:
        if (!Config.Rushee.Bumper) return true;

        while (!leader.area) {
          delay(500);
        }

        act = Misc.getPlayerAct(leader);

        if (me.act !== act) {
          Town.goToTown(act);
          Town.move("portalspot");
        }

        switch (leader.area) {
        case sdk.areas.ArreatSummit:
          if (!Pather.usePortal(sdk.areas.ArreatSummit, Config.Leader)) {
            return false;
          }

          // Wait until portal is gone
          while (Pather.getPortal(sdk.areas.Harrogath, Config.Leader)) {
            delay(500);
          }

          // Wait until portal is up again
          while (!Pather.getPortal(sdk.areas.Harrogath, Config.Leader)) {
            delay(500);
          }

          if (!Pather.usePortal(sdk.areas.Harrogath, Config.Leader)) {
            return false;
          }

          return true;
        case sdk.areas.WorldstoneChamber:
          if (!Pather.usePortal(sdk.areas.WorldstoneChamber, Config.Leader)) {
            return false;
          }

          return true;
        }
      }
      return true;
    }],
    [AutoRush.playersIn, function () {
      while (!leader.area) {
        delay(500);
      }

      act = Misc.getPlayerAct(leader);

      if (me.act !== act) {
        Town.goToTown(act);
        Town.move("portalspot");
      }

      // we need to talk to certain npcs in order to be able to grab waypoints as a non-quester
      if (nonQuesterNPCTalk) {
        console.debug("Leader Area: " + getAreaName(leader.area));

        switch (leader.area) {
        case sdk.areas.ClawViperTempleLvl2:
          Misc.poll(function () {
            return !!(Misc.checkQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.ReqComplete)
              || Misc.checkQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.PartyMemberComplete));
          }, Time.seconds(20), 1000);
          if (Town.npcInteract("Drognan")) {
            console.debug("drognan done");
            return true;
          }

          return false;
        case sdk.areas.ArcaneSanctuary:
          Misc.poll(function () {
            return !!(Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.ReqComplete)
              || Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.PartyMemberComplete));
          }, Time.seconds(20), 1000);
          if (Town.npcInteract("Atma")) {
            console.debug("atma done");
            return true;
          }
          return false;
        case sdk.areas.Travincal:
          Misc.poll(() => !!(Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, 4) || Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.PartyMemberComplete) || Misc.checkQuest(sdk.quest.id.TheGuardian, 8), Time.seconds(20), 1000));
          if (Town.npcInteract("Cain")) {
            console.debug("cain done");
            return true;
          }

          return false;
        case sdk.areas.ArreatSummit:
          Misc.poll(() => (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.ReqComplete) || Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.PartyMemberComplete), Time.seconds(20), 1000));
          if (Town.npcInteract("Malah")) {
            console.debug("malah done");
            return true;
          }

          return false;
        }

        me.inTown && Town.move("portalspot");
      }

      if (!Config.Rushee.Quester) {
        return true;
      }

      switch (leader.area) {
      case sdk.areas.StonyField:
        if (!Pather.usePortal(sdk.areas.StonyField, Config.Leader)) {
          log("Failed to use portal to stony field", Config.LocalChat.Enabled);
          return false;
        }

        let stones = [
          Game.getObject(sdk.quest.chest.StoneAlpha),
          Game.getObject(sdk.quest.chest.StoneBeta),
          Game.getObject(sdk.quest.chest.StoneGamma),
          Game.getObject(sdk.quest.chest.StoneDelta),
          Game.getObject(sdk.quest.chest.StoneLambda)
        ];

        while (stones.some((stone) => !stone.mode)) {
          for (let i = 0; i < stones.length; i++) {
            let stone = stones[i];

            if (Misc.openChest(stone)) {
              stones.splice(i, 1);
              i--;
            }
            delay(10);
          }
        }

        let tick = getTickCount();
        // wait up to two minutes
        while (getTickCount() - tick < Time.minutes(2)) {
          if (Pather.getPortal(sdk.areas.Tristram)) {
            Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
            
            break;
          }
        }
        Town.move("portalspot");

        return true;
      case sdk.areas.DarkWood:
        if (!Pather.usePortal(sdk.areas.DarkWood, Config.Leader)) {
          log("Failed to use portal to dark wood", Config.LocalChat.Enabled);
          return false;
        }

        getQuestItem(sdk.items.quest.ScrollofInifuss, sdk.quest.chest.InifussTree);
        delay(500);
        Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
        
        if (Town.npcInteract("Akara")) {
          log("Akara done", Config.LocalChat.Enabled);
        }

        Town.move("portalspot");

        return true;
      case sdk.areas.Tristram:
        if (!Pather.usePortal(sdk.areas.Tristram, Config.Leader)) {
          log("Failed to use portal to Tristram", Config.LocalChat.Enabled);
          break;
        }

        let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

        if (gibbet && !gibbet.mode) {
          Pather.moveTo(gibbet.x, gibbet.y);
          if (Misc.poll(() => Misc.openChest(gibbet), 2000, 100)) {
            Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
            Town.npcInteract("Akara") && log("Akara done", Config.LocalChat.Enabled);
          }
        }
        Town.move("portalspot");
        commands.shift();

        break;
      case sdk.areas.CatacombsLvl4:
        if (!Pather.usePortal(sdk.areas.CatacombsLvl4, Config.Leader)) {
          log("Failed to use portal to catacombs", Config.LocalChat.Enabled);
          return false;
        }

        target = Pather.getPortal(null, Config.Leader);
        target && Pather.walkTo(target.x, target.y);

        return true;
      case sdk.areas.A2SewersLvl3:
        Town.move("portalspot");

        return Pather.usePortal(sdk.areas.A2SewersLvl3, Config.Leader);
      case sdk.areas.HallsoftheDeadLvl3:
        Pather.usePortal(sdk.areas.HallsoftheDeadLvl3, Config.Leader);
        getQuestItem(sdk.quest.item.Cube, sdk.quest.chest.HoradricCubeChest);
        return Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
      case sdk.areas.ClawViperTempleLvl2:
        Pather.usePortal(sdk.areas.ClawViperTempleLvl2, Config.Leader);
        getQuestItem(sdk.quest.item.ViperAmulet, sdk.quest.chest.ViperAmuletChest);
        Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
        
        if (Town.npcInteract("Drognan")) {
          say("drognan done", Config.LocalChat.Enabled);
          Town.move("portalspot");
          return true;
        }

        return false;
      case sdk.areas.MaggotLairLvl3:
        Pather.usePortal(sdk.areas.MaggotLairLvl3, Config.Leader);
        getQuestItem(sdk.quest.item.ShaftoftheHoradricStaff, sdk.quest.chest.ShaftoftheHoradricStaffChest);
        delay(500);
        Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
        return cube.Staff();
      case sdk.areas.ArcaneSanctuary:
        return Pather.usePortal(sdk.areas.ArcaneSanctuary, Config.Leader);
      case sdk.areas.TalRashasTomb1:
      case sdk.areas.TalRashasTomb2:
      case sdk.areas.TalRashasTomb3:
      case sdk.areas.TalRashasTomb4:
      case sdk.areas.TalRashasTomb5:
      case sdk.areas.TalRashasTomb6:
      case sdk.areas.TalRashasTomb7:
        Pather.usePortal(null, Config.Leader);
        placeStaff();
        Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
        return true;
      case sdk.areas.DurielsLair:
        Pather.usePortal(sdk.areas.DurielsLair, Config.Leader);
        tyraelTalk();

        return true;
      case sdk.areas.Travincal:
        if (!Pather.usePortal(sdk.areas.Travincal, Config.Leader)) {
          me.cancel();

          return false;
        }

        return true;
      case sdk.areas.RuinedTemple:
        if (!Pather.usePortal(sdk.areas.RuinedTemple, Config.Leader)) {
          me.cancel();

          return false;
        }

        getQuestItem(sdk.quest.item.LamEsensTome, sdk.quest.chest.LamEsensTomeHolder);
        Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader);
        Town.npcInteract("Alkor");
        Town.move("portalspot");
        return true;
      case sdk.areas.DuranceofHateLvl3:
        if (!Pather.usePortal(sdk.areas.DuranceofHateLvl3, Config.Leader)) {
          me.cancel();

          return false;
        }

        return true;
      case sdk.areas.OuterSteppes:
      case sdk.areas.PlainsofDespair:
        return Pather.usePortal(null, Config.Leader);
      case sdk.areas.ChaosSanctuary:
        Pather.usePortal(sdk.areas.ChaosSanctuary, Config.Leader);
        Pather.moveTo(7762, 5268);
        Packet.flash(me.gid);
        delay(500);
        Pather.walkTo(7763, 5267, 2);

        while (!Game.getMonster(sdk.monsters.Diablo)) {
          delay(500);
        }

        Pather.moveTo(7763, 5267);
        return true;
      case sdk.areas.BloodyFoothills:
        return Pather.usePortal(sdk.areas.BloodyFoothills, Config.Leader);
      case sdk.areas.FrozenRiver:
        Town.npcInteract("Malah");

        Pather.usePortal(sdk.areas.FrozenRiver, Config.Leader);
        delay(500);

        target = Game.getObject(sdk.objects.FrozenAnya);

        if (target) {
          Pather.moveToUnit(target);
          Misc.poll(() => {
            Packet.entityInteract(target);
            delay(100);
            return !Game.getObject(sdk.objects.FrozenAnya);
          }, 1000, 200);
          delay(1000);
          me.cancel();
        }

        return true;
      default: // unsupported area
        return true;
      }
      return true;
    }],
    [AutoRush.playersOut, function () {
      if (!Config.Rushee.Quester) {
        // Non-questers can piggyback off quester out messages
        switch (leader.area) {
        case sdk.areas.OuterSteppes:
        case sdk.areas.PlainsofDespair:
          me.act === 4 && Misc.checkQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.ReqComplete) && Town.npcInteract("Tyrael");

          break;
        case sdk.areas.BloodyFoothills:
          me.act === 5 && Town.npcInteract("Larzuk");

          break;
        case sdk.areas.FrozenRiver:
          if (me.act === 5) {
            Town.npcInteract("Malah");
            useScrollOfRes();
          }

          break;
        }

        commands.shift();

        return true;
      }

      revive();

      switch (me.area) {
      case sdk.areas.CatacombsLvl4:
        // Go to town if not there, break if procedure fails
        if (!me.inTown && !Pather.usePortal(sdk.areas.RogueEncampment)) {
          return false;
        }

        if (!Misc.checkQuest(sdk.quest.id.SistersToTheSlaughter, 4)) {
          D2Bot.printToConsole("Andariel quest failed", sdk.colors.D2Bot.Red);
          quit();
        }

        return true;
      case sdk.areas.A2SewersLvl3:
        if (!me.inTown && !Pather.usePortal(sdk.areas.LutGholein, Config.Leader)) {
          return false;
        }

        return true;
      case sdk.areas.ArcaneSanctuary:
        if (!me.inTown && !Pather.usePortal(sdk.areas.LutGholein, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Atma");

        if (!Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.Completed)) {
          D2Bot.printToConsole("Summoner quest failed", sdk.colors.D2Bot.Red);
          quit();
        }

        Town.move("portalspot");
        return true;
      case sdk.areas.Travincal:
        if (!me.inTown && !Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Cain");

        if (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)) {
          D2Bot.printToConsole("Travincal quest failed", sdk.colors.D2Bot.Red);
          quit();
        }

        Town.move("portalspot");
        return true;
      case sdk.areas.DuranceofHateLvl3:
        return Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader);
      case sdk.areas.OuterSteppes:
      case sdk.areas.PlainsofDespair:
        if (!me.inTown && !Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader)) {
          return false;
        }

        if (Misc.checkQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.ReqComplete)) {
          Town.npcInteract("Tyrael");
          Town.move("portalspot");
        }

        return true;
      case sdk.areas.ChaosSanctuary:
        me.classic && D2Bot.restart();

        if (!me.inTown && !Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader)) {
          return false;
        }

        return true;
      case sdk.areas.BloodyFoothills:
        if (!me.inTown && !Pather.usePortal(sdk.areas.Harrogath, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Larzuk");
        Town.move("portalspot");
        return true;
      case sdk.areas.FrozenRiver:
        if (!me.inTown && !Pather.usePortal(sdk.areas.FrozenRiver, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Malah");
        useScrollOfRes();
        Town.move("portalspot");

        return true;
      default:
        Town.move("portalspot");
        return true;
      }
    }],
    ["flail", function () {
      if (!Config.Rushee.Quester) {
        return true;
      }
      
    }],
    ["questinfo", function () {
      if (!Config.Rushee.Quester) {
        return true;
      }
      say("highestquest " + getQuestInfo(me.highestQuestDone));
      return true;
    }],
    ["wpinfo", function () {
      if (!Config.Rushee.Quester) {
        return true;
      }

      // go activate wp if we don't know our wps yet
      !me.haveWaypoint(1) && Pather.getWP(me.area);

      let myWps = Pather.nonTownWpAreas.slice(0).filter(function (area) {
        if (area === sdk.areas.HallsofPain) return false;
        if (me.classic && area >= sdk.areas.Harrogath) return false;
        if (me.haveWaypoint(area)) return false;
        return true;
      });

      say("mywps " + JSON.stringify(myWps));
      return true;
    }],
    ["wp", function () {
      if (!me.inTown && !Town.goToTown()) {
        log("I can't get to town :(", Config.LocalChat.Enabled);
        return false;
      }

      act = Misc.getPlayerAct(leader);

      if (me.act !== act) {
        Town.goToTown(act);
        Town.move("portalspot");
      }

      // make sure we talk to cain to access durance
      leader.area === sdk.areas.DuranceofHateLvl2 && (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)) && Town.npcInteract("Cain");
      
      // we aren't the quester but need to talk to npcs in order to be able to get wps from certain areas 
      (!Config.Rushee.Quester && !nonQuesterNPCTalk) && (nonQuesterNPCTalk = true);

      Town.getDistance("portalspot") > 10 && Town.move("portalspot");
      if (Pather.usePortal(null, Config.Leader) && Pather.getWP(me.area) && Pather.usePortal(sdk.areas.townOf(me.area), Config.Leader) && Town.move("portalspot")) {
        me.inTown && Config.LocalChat.Enabled && say("gotwp");
      } else {
        // check for bugged portal
        let p = Game.getObject("portal");
        let preArea = me.area;
        if (!!p && Misc.click(0, 0, p) && Misc.poll(() => me.area !== preArea, 1000, 100)
          && Pather.getWP(me.area) && (Pather.usePortal(sdk.areas.townOf(me.area), Config.Leader) || Pather.useWaypoint(sdk.areas.townOf(me.area)))) {
          me.inTown && Config.LocalChat.Enabled && say("gotwp");
        } else {
          log("Failed to get wp", Config.LocalChat.Enabled);
          !me.inTown && Town.goToTown();
        }
      }

      return true;
    }],
    ["a2", function () {
      if (!changeAct(2)) {
        return false;
      }

      Town.move("portalspot");
      return true;
    }],
    ["a3", function () {
      if (!changeAct(3)) {
        return false;
      }

      Town.move("portalspot");
      return true;
    }],
    ["a4", function () {
      if (!changeAct(4)) {
        return false;
      }

      Town.move("portalspot");
      return true;
    }],
    ["a5", function () {
      if (!changeAct(5)) {
        return false;
      }

      Town.move("portalspot");
      return true;
    }],
    ["quit", function () {
      done = true;
      return true;
    }],
    ["exit", function () {
      if (!nextGame) {
        D2Bot.printToConsole("Rush Complete");
        D2Bot.stop();
      } else {
        D2Bot.restart();
      }
      return true;
    }],
    ["leader", function () {
      console.log(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now");
      Config.LocalChat.Enabled && say(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now");
      return true;
    }],
    [me.name + " quest", function () {
      say("I am quester.");
      Config.Rushee.Quester = true;

      return true;
    }]
  ]);
  const curr = {
    cmd: "",
    retry: 0
  };

  while (true) {
    // todo - clean all this up so there is clear distinction between quester/non-quester and no repeat sequnces
    try {
      if (commands.length > 0) {
        let command = commands[0].toLowerCase();

        if (actions.has(command)) {
          curr.cmd = command;
          if (actions.get(command)()) {
            commands.shift();
            curr.retry = 0;
          } else {
            console.debug("Command retry: " + command);
            curr.retry++;
            if (curr.retry > 3) {
              log("Failed to do " + command, Config.LocalChat.Enabled);
              commands.shift();
            }
          }
        } else {
          commands.shift();
        }
      }
    } catch (e) {
      console.error(e);
      commands.shift();
      if (me.mode === sdk.player.mode.Dead) {
        me.revive();

        while (!me.inTown) {
          delay(3);
        }
      }
    }

    if (getUIFlag(sdk.uiflags.TradePrompt)) {
      me.cancel();
    }

    if (done) {
      break;
    }

    delay(500);
  }

  done && quit();

  return true;
}
