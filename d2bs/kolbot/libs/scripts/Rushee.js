/* eslint-disable max-len */
/**
*  @filename    Rushee.js
*  @author      kolton, theBGuy
*  @desc        Rushee script that works with Rusher
*
*/

let Overrides = require("../modules/Override");

new Overrides.Override(Town, Town.goToTown, function(orignal, act, wpmenu) {
  try {
    orignal(act, wpmenu);

    return true;
  } catch (e) {
    print(e);
    
    return Pather.useWaypoint(sdk.areas.townOf(me.area));
  }
}).apply();

new Overrides.Override(Pather, Pather.getWP, function(orignal, area, clearPath) {
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

function Rushee() {
  let act, leader, target, done = false;
  let actions = [];

  this.log = function (msg = "", sayMsg = false) {
    print(msg);
    sayMsg && say(msg);
  };

  this.useScrollOfRes = function () {
    let scroll = me.scrollofresistance;
    if (scroll) {
      clickItem(sdk.clicktypes.click.item.Right, scroll);
      print("Using scroll of resistance");
    }
  };

  this.revive = function () {
    while (me.mode === sdk.player.mode.Death) {
      delay(40);
    }

    if (me.mode === sdk.player.mode.Dead) {
      me.revive();

      while (!me.inTown) {
        delay(40);
      }
    }
  };

  // todo - map the chest to classid so we only need to pass in one value
  this.getQuestItem = function (classid, chestid) {
    let tick = getTickCount();

    if (me.getItem(classid)) {
      this.log("Already have: " + classid);
      return true;
    }

    if (me.inTown) return false;

    let chest = Game.getObject(chestid);

    if (!chest) {
      this.log("Couldn't find: " + chestid);
      return false;
    }

    for (let i = 0; i < 5; i++) {
      if (Misc.openChest(chest)) {
        break;
      }
      this.log("Failed to open chest: Attempt[" + (i + 1) + "]");
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

  this.checkQuestMonster = function (classid) {
    let monster = Game.getMonster(classid);

    if (monster) {
      while (!monster.dead) {
        delay(500);
      }

      return true;
    }

    return false;
  };

  this.tyraelTalk = function () {
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

  this.cubeStaff = function () {
    let shaft = me.shaft;
    let amulet = me.amulet;

    if (!shaft || !amulet) return false;

    Storage.Cube.MoveTo(amulet);
    Storage.Cube.MoveTo(shaft);
    Cubing.openCube();
    print("making staff");
    transmute();
    delay(750 + me.ping);

    let staff = me.completestaff;

    if (!staff) return false;

    Storage.Inventory.MoveTo(staff);
    me.cancel();

    return true;
  };

  this.placeStaff = function () {
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

  this.changeAct = function (act) {
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
        this.log("Act change failed.", Config.LocalChat.Enabled);

        return false;
      }

      this.log("Act change done.", Config.LocalChat.Enabled);
    } catch (e) {
      return false;
    }

    return true;
  };

  this.getQuestInfo = function (id) {
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

    return (!!quest ? quest[0] : "");
  };

  this.nonQuesterNPCTalk = false;

  addEventListener("chatmsg",
    function (who, msg) {
      if (who === Config.Leader) {
        actions.push(msg);
      }
    });

  // START
  Town.goToTown(me.highestAct);
  me.inTown && Town.move("portalspot");

  // if we can't find our leader after 5 minutes, I'm thinking they aren't showing up. Lets not wait around forever
  leader = Misc.poll(() => Misc.findPlayer(Config.Leader), Time.minutes(5), 1000);
  if (!leader) throw new Error("Failed to find my rusher");

  Config.Rushee.Quester
    ? this.log("Leader found", Config.LocalChat.Enabled)
    : console.log("Leader Found: " + Config.Leader);

  // lets figure out if we either are the bumper or have a bumper so we know if we need to stop at the end of the rush
  let bumperLevelReq = [20, 40, 60][me.diff];
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

  while (true) {
    // todo - clean all this up so there is clear distinction between quester/non-quester and no repeat sequnces
    try {
      if (actions.length > 0) {
        switch (actions[0]) {
        case "all in":
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
                print("Using book of skill");
                clickItem(sdk.clicktypes.click.item.Right, target);

                break;
              }
            }

            Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
            actions.shift();

            break;
          }

          actions.shift();

          break;
        case "questinfo":
          if (!Config.Rushee.Quester) {
            actions.shift();

            break;
          }

          say("highestquest " + this.getQuestInfo(me.highestQuestDone));
          actions.shift();

          break;
        case "wpinfo":
          if (!Config.Rushee.Quester) {
            actions.shift();

            break;
          }

          // go activate wp if we don't know our wps yet
          !getWaypoint(1) && Pather.getWP(me.area);

          let myWps = Pather.nonTownWpAreas.slice(0).filter(function (area) {
            if (area === sdk.areas.HallsofPain) return false;
            if (me.classic && area >= sdk.areas.Harrogath) return false;
            if (getWaypoint(Pather.wpAreas.indexOf(area))) return false;
            return true;
          });

          say("mywps " + JSON.stringify(myWps));
          actions.shift();

          break;
        case "wp":
          if (!me.inTown && !Town.goToTown()) {
            this.log("I can't get to town :(", Config.LocalChat.Enabled);

            break;
          }

          act = Misc.getPlayerAct(leader);

          if (me.act !== act) {
            Town.goToTown(act);
            Town.move("portalspot");
          }

          // make sure we talk to cain to access durance
          leader.area === sdk.areas.DuranceofHateLvl2 && (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)) && Town.npcInteract("Cain");
          
          // we aren't the quester but need to talk to npcs in order to be able to get wps from certain areas 
          (!Config.Rushee.Quester && !this.nonQuesterNPCTalk) && (this.nonQuesterNPCTalk = true);

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
              this.log("Failed to get wp", Config.LocalChat.Enabled);
              !me.inTown && Town.goToTown();
            }
          }

          actions.shift();

          break;
        case "1":
          while (!leader.area) {
            delay(500);
          }

          act = Misc.getPlayerAct(leader);

          if (me.act !== act) {
            Town.goToTown(act);
            Town.move("portalspot");
          }

          // we need to talk to certain npcs in order to be able to grab waypoints as a non-quester
          if (this.nonQuesterNPCTalk) {
            console.debug("Leader Area: " + getAreaName(leader.area));

            switch (leader.area) {
            case sdk.areas.ClawViperTempleLvl2:
              Misc.poll(() => !!(Misc.checkQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.ReqComplete) || Misc.checkQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.PartyMemberComplete), Time.seconds(20), 1000));
              if (Town.npcInteract("Drognan")) {
                actions.shift();
                console.debug("drognan done");
              }

              break;
            case sdk.areas.ArcaneSanctuary:
              Misc.poll(() => !!(Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.ReqComplete) || Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.PartyMemberComplete), Time.seconds(20), 1000));
              if (Town.npcInteract("Atma")) {
                actions.shift();
                console.debug("atma done");
              }

              break;
            case sdk.areas.Travincal:
              Misc.poll(() => !!(Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, 4) || Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.PartyMemberComplete) || Misc.checkQuest(sdk.quest.id.TheGuardian, 8), Time.seconds(20), 1000));
              if (Town.npcInteract("Cain")) {
                actions.shift();
                console.debug("cain done");
              }

              break;
            case sdk.areas.ArreatSummit:
              Misc.poll(() => (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.ReqComplete) || Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.PartyMemberComplete), Time.seconds(20), 1000));
              if (Town.npcInteract("Malah")) {
                actions.shift();
                console.debug("malah done");
              }

              break;
            }

            me.inTown && Town.move("portalspot");
          }

          if (!Config.Rushee.Quester) {
            actions.shift();

            break;
          }

          switch (leader.area) {
          case sdk.areas.StonyField:
            if (!Pather.usePortal(sdk.areas.StonyField, Config.Leader)) {
              this.log("Failed to us portal to stony field", Config.LocalChat.Enabled);
              break;
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
            actions.shift();

            break;
          case sdk.areas.DarkWood:
            if (!Pather.usePortal(sdk.areas.DarkWood, Config.Leader)) {
              this.log("Failed to use portal to dark wood", Config.LocalChat.Enabled);
              break;
            }

            this.getQuestItem(sdk.items.quest.ScrollofInifuss, sdk.quest.chest.InifussTree);
            delay(500);
            Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
            
            if (Town.npcInteract("Akara")) {
              this.log("Akara done", Config.LocalChat.Enabled);
            }

            Town.move("portalspot");
            actions.shift();

            break;
          case sdk.areas.Tristram:
            if (!Pather.usePortal(sdk.areas.Tristram, Config.Leader)) {
              this.log("Failed to use portal to Tristram", Config.LocalChat.Enabled);
              break;
            }

            let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

            if (gibbet && !gibbet.mode) {
              Pather.moveTo(gibbet.x, gibbet.y);
              if (Misc.poll(() => Misc.openChest(gibbet), 2000, 100)) {
                Pather.usePortal(sdk.areas.RogueEncampment, Config.Leader);
                Town.npcInteract("Akara") && this.log("Akara done", Config.LocalChat.Enabled);
              }
            }
            Town.move("portalspot");
            actions.shift();

            break;
          case sdk.areas.CatacombsLvl4:
            if (!Pather.usePortal(sdk.areas.CatacombsLvl4, Config.Leader)) {
              this.log("Failed to use portal to catacombs", Config.LocalChat.Enabled);
              break;
            }

            target = Pather.getPortal(null, Config.Leader);
            target && Pather.walkTo(target.x, target.y);

            actions.shift();

            break;
          case sdk.areas.A2SewersLvl3:
            Town.move("portalspot");

            if (Pather.usePortal(sdk.areas.A2SewersLvl3, Config.Leader)) {
              actions.shift();
            }

            break;
          case sdk.areas.HallsoftheDeadLvl3:
            Pather.usePortal(sdk.areas.HallsoftheDeadLvl3, Config.Leader);
            this.getQuestItem(sdk.quest.item.Cube, sdk.quest.chest.HoradricCubeChest);
            Pather.usePortal(sdk.areas.LutGholein, Config.Leader);

            actions.shift();

            break;
          case sdk.areas.ClawViperTempleLvl2:
            Pather.usePortal(sdk.areas.ClawViperTempleLvl2, Config.Leader);
            this.getQuestItem(sdk.quest.item.ViperAmulet, sdk.quest.chest.ViperAmuletChest);
            Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
            
            if (Town.npcInteract("Drognan")) {
              actions.shift();
              say("drognan done", Config.LocalChat.Enabled);
            }

            Town.move("portalspot");

            break;
          case sdk.areas.MaggotLairLvl3:
            Pather.usePortal(sdk.areas.MaggotLairLvl3, Config.Leader);
            this.getQuestItem(sdk.quest.item.ShaftoftheHoradricStaff, sdk.quest.chest.ShaftoftheHoradricStaffChest);
            delay(500);
            Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
            this.cubeStaff();

            actions.shift();

            break;
          case sdk.areas.ArcaneSanctuary:
            if (!Pather.usePortal(sdk.areas.ArcaneSanctuary, Config.Leader)) {
              break;
            }

            actions.shift();

            break;
          case sdk.areas.TalRashasTomb1:
          case sdk.areas.TalRashasTomb2:
          case sdk.areas.TalRashasTomb3:
          case sdk.areas.TalRashasTomb4:
          case sdk.areas.TalRashasTomb5:
          case sdk.areas.TalRashasTomb6:
          case sdk.areas.TalRashasTomb7:
            Pather.usePortal(null, Config.Leader);
            this.placeStaff();
            Pather.usePortal(sdk.areas.LutGholein, Config.Leader);
            actions.shift();

            break;
          case sdk.areas.DurielsLair:
            Pather.usePortal(sdk.areas.DurielsLair, Config.Leader);
            this.tyraelTalk();

            actions.shift();

            break;
          case sdk.areas.Travincal:
            if (!Pather.usePortal(sdk.areas.Travincal, Config.Leader)) {
              me.cancel();

              break;
            }

            actions.shift();

            break;
          case sdk.areas.RuinedTemple:
            if (!Pather.usePortal(sdk.areas.RuinedTemple, Config.Leader)) {
              me.cancel();

              break;
            }

            this.getQuestItem(sdk.quest.item.LamEsensTome, sdk.quest.chest.LamEsensTomeHolder);
            Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader);
            Town.npcInteract("Alkor");
            Town.move("portalspot");
            actions.shift();


            break;
          case sdk.areas.DuranceofHateLvl3:
            if (!Pather.usePortal(sdk.areas.DuranceofHateLvl3, Config.Leader)) {
              me.cancel();

              break;
            }

            actions.shift();

            break;
          case sdk.areas.OuterSteppes:
          case sdk.areas.PlainsofDespair:
            if (Pather.usePortal(null, Config.Leader)) {
              actions.shift();
            }

            break;
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
            actions.shift();

            break;
          case sdk.areas.BloodyFoothills:
            Pather.usePortal(sdk.areas.BloodyFoothills, Config.Leader);
            actions.shift();

            break;
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

            actions.shift();

            break;
          default: // unsupported area
            actions.shift();

            break;
          }

          break;
        case "2": // Go back to town and check quest
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
                this.useScrollOfRes();
              }

              break;
            }

            actions.shift();

            break;
          }

          this.revive();

          switch (me.area) {
          case sdk.areas.CatacombsLvl4:
            // Go to town if not there, break if procedure fails
            if (!me.inTown && !Pather.usePortal(sdk.areas.RogueEncampment)) {
              break;
            }

            if (!Misc.checkQuest(sdk.quest.id.SistersToTheSlaughter, 4)) {
              D2Bot.printToConsole("Andariel quest failed", sdk.colors.D2Bot.Red);
              quit();
            }

            actions.shift();

            break;
          case sdk.areas.A2SewersLvl3:
            if (!me.inTown && !Pather.usePortal(sdk.areas.LutGholein, Config.Leader)) {
              break;
            }

            actions.shift();

            break;
          case sdk.areas.ArcaneSanctuary:
            if (!me.inTown && !Pather.usePortal(sdk.areas.LutGholein, Config.Leader)) {
              break;
            }

            Town.npcInteract("Atma");

            if (!Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.Completed)) {
              D2Bot.printToConsole("Summoner quest failed", sdk.colors.D2Bot.Red);
              quit();
            }

            Town.move("portalspot");
            actions.shift();

            break;
          case sdk.areas.Travincal:
            if (!me.inTown && !Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader)) {
              break;
            }

            Town.npcInteract("Cain");

            if (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)) {
              D2Bot.printToConsole("Travincal quest failed", sdk.colors.D2Bot.Red);
              quit();
            }

            Town.move("portalspot");
            actions.shift();

            break;
          case sdk.areas.DuranceofHateLvl3:
            if (!Pather.usePortal(sdk.areas.KurastDocktown, Config.Leader)) {
              break;
            }

            actions.shift();

            break;
          case sdk.areas.OuterSteppes:
          case sdk.areas.PlainsofDespair:
            if (!me.inTown && !Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader)) {
              break;
            }

            if (Misc.checkQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.ReqComplete)) {
              Town.npcInteract("Tyrael");
              Town.move("portalspot");
            }

            actions.shift();

            break;
          case sdk.areas.ChaosSanctuary:
            me.classic && D2Bot.restart();

            if (!me.inTown && !Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader)) {
              break;
            }

            actions.shift();

            break;
          case sdk.areas.BloodyFoothills:
            if (!me.inTown && !Pather.usePortal(sdk.areas.Harrogath, Config.Leader)) {
              break;
            }

            Town.npcInteract("Larzuk");
            Town.move("portalspot");
            actions.shift();

            break;
          case sdk.areas.FrozenRiver:
            if (!me.inTown && !Pather.usePortal(sdk.areas.FrozenRiver, Config.Leader)) {
              break;
            }

            Town.npcInteract("Malah");
            this.useScrollOfRes();
            Town.move("portalspot");

            actions.shift();

            break;
          default:
            Town.move("portalspot");
            actions.shift();

            break;
          }

          break;
        case "3": // Bumper
          if (!Config.Rushee.Bumper) {
            actions.shift();

            break;
          }

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
              break;
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
              break;
            }

            actions.shift();

            break;
          case sdk.areas.WorldstoneChamber:
            if (!Pather.usePortal(sdk.areas.WorldstoneChamber, Config.Leader)) {
              break;
            }

            actions.shift();

            break;
          }

          break;
        case "quit":
          done = true;

          break;
        case "exit":
        case "bye ~":
          if (!nextGame) {
            D2Bot.printToConsole("Rush Complete");
            D2Bot.stop();
          } else {
            D2Bot.restart();
          }

          break;
        case "a2":
        case "a3":
        case "a4":
        case "a5":
          act = actions[0].toString()[1];
          !!act && (act = (parseInt(act, 10) || me.act + 1));

          if (!this.changeAct(act)) {
            break;
          }

          Town.move("portalspot");
          actions.shift();

          break;
        case me.name + " quest":
          say("I am quester.");
          Config.Rushee.Quester = true;

          actions.shift();

          break;
        case "leader":
          console.log(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now");
          Config.LocalChat.Enabled && say(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now");
          actions.shift();

          break;
        default: // Invalid command
          actions.shift();

          break;
        }
      }
    } catch (e) {
      if (me.mode === sdk.player.mode.Dead) {
        me.revive();

        while (!me.inTown) {
          delay(500);
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
