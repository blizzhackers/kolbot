/**
*  @filename    Rushee.js
*  @author      kolton, theBGuy
*  @desc        Rushee script that works with Rusher
*
*/


const Rushee = new Runnable(
  function Rushee () {
    const Overrides = require("../modules/Override");
    const { log, getBumperLvlReq } = require("../systems/autorush/AutoRush");
    const {
      RushConfig
    } = require("../systems/autorush/RushConfig");
    const { sequenceCheck, RushModes, AutoRush } = require("../systems/autorush/RushConstants");
    const rushConfig = RushConfig[me.profile];

    if (!rushConfig) {
      throw new Error("No rush config found for profile: " + me.profile);
    }

    /**
     * Installs Town.goToTown and Pather.getWP overrides tailored to rushee waypoint/portal behavior.
     */
    function applyOverrides() {
      new Overrides.Override(Town, Town.goToTown, function (orignal, act, wpmenu) {
        try {
          return orignal(act, wpmenu);
        } catch (e) {
          console.error(e);
          
          return Pather.useWaypoint(sdk.areas.townOf(me.area));
        }
      }).apply();

      new Overrides.Override(Pather, Pather.getWP, function (orignal, area, clearPath) {
        if (area !== me.area) return false;

        for (let i = 0; i < sdk.waypoints.Ids.length; i++) {
          let preset = Game.getPresetObject(me.area, sdk.waypoints.Ids[i]);
          if (!preset) continue;
          
          let coords = preset.realCoords();
          if (!me.inTown && coords.distance > 15) {
            return false;
          }

          Skill.haveTK
            ? this.moveNearUnit(coords, 20, { clearSettings: { clearPath: clearPath } })
            : this.moveToUnit(coords, 0, 0, clearPath);

          let wp = Game.getObject("waypoint");
          if (!wp) continue;

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

        return false;
      }).apply();
    }

    /**
    * @param {string} who
    * @param {string} msg
    */
    function chatEvent (who, msg) {
      if (msg === "i am rusher") {
        Config.Leader = who;
        console.debug("Assigned Leader: " + Config.Leader);
      }
      if (!Config.Leader && msg.includes("questinfo")) {
        Config.Leader = who;
        console.debug("Assigned Leader: " + Config.Leader);
      }
      if (who === Config.Leader) {
        // we can ignore starting <action> messages as they are just for the rusher to log what they are doing
        if (msg.toLowerCase().startsWith("starting")) return;
        if (msg.toLowerCase().includes("rush complete")) {
          commands.push("exit");
        } else {
          console.debug("Leader: " + msg);
          commands.push(msg);
        }
      }
    }

    /** @param {number | null} area */
    const usePortal = function (area) {
      return Pather.usePortal(area, Config.Leader);
    };
    
    const useScrollOfRes = function () {
      let scroll = me.scrollofresistance;
      if (scroll) {
        clickItem(sdk.clicktypes.click.item.Right, scroll);
        console.log("Using scroll of resistance");
      }
    };

    const revive = function () {
      while (me.mode === sdk.player.mode.Death) {
        nativeDelay(40);
      }

      if (me.mode === sdk.player.mode.Dead) {
        me.revive();

        while (!me.inTown) {
          nativeDelay(3);
        }
      }
    };

    // todo - map the chest to classid so we only need to pass in one value
    /**
    * @param {number} classid
    * @param {number} chestid
    */
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
        if (Game.getItem(classid)) {
          break;
        }
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

    const tyraelTalk = function () {
      const bridgeNode = new PathNode(22577, 15609);
      if (me.inArea(sdk.areas.DurielsLair) && bridgeNode.distance > 10) {
        /** @returns {boolean} true once Tyrael has spawned, stopping the move early */
        Pather.move(bridgeNode, { callback: function () {
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

      return Pather.usePortal(null) || usePortal(null);
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
        const ingreds = item.ingreds.map(function (itemId) {
          return me.getItem(itemId);
        });
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
        /** @returns {boolean} true if the Horadric Staff exists or was successfully cubed */
        Staff: function () {
          log("Making staff", Config.LocalChat.Enabled);
          return make(staff);
        },
        /** @returns {boolean} true if Khalim's Will exists or was successfully cubed */
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

    /** @param {Act} act */
    const changeAct = function (act) {
      revive();

      const actGoal = Number(act);
      if (me.act === actGoal || me.act > actGoal) return true;
      const preArea = me.area;
      console.debug("Changing act to: " + actGoal);

      try {
        switch (actGoal) {
        case 2:
          if (!Town.npcInteract("Warriv", false)) return false;
          Misc.useMenu(sdk.menu.GoEast);

          break;
        case 3:
          // Non Quester needs to talk to Townsfolk to enable Harem TP
          if (rushConfig.type !== RushModes.quester) {
            // Talk to Atma
            if (!Town.npcInteract("Atma")) {
              break;
            }
          }
          
          usePortal(sdk.areas.HaremLvl1);
          Pather.moveToExit(sdk.areas.LutGholein, true);
          
          if (!Town.npcInteract("Jerhyn")) {
            Pather.moveTo(5166, 5206);

            return false;
          }

          me.cancel();
          Pather.moveToExit(sdk.areas.HaremLvl1, true);
          usePortal(sdk.areas.LutGholein);

          if (!Town.npcInteract("Meshif", false)) return false;
          Misc.useMenu(sdk.menu.SailEast);

          break;
        case 4:
          if (me.inTown) {
            Town.npcInteract("Cain");
            usePortal(sdk.areas.DuranceofHateLvl3);
          } else {
            delay(1500);
          }

          Pather.moveTo(17591, 8070);
          // Pather.usePortal(null);
          Pather.useUnit(sdk.unittype.Object, sdk.objects.RedPortalToAct4, sdk.areas.PandemoniumFortress);

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
        default:
          console.warn("Invalid act: " + act);
          return false;
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

    const getQuestInfo = function () {
      return Object.keys(sequenceCheck).reverse().find(function (key) {
        return sequenceCheck[key].check();
      }) || "none";
    };

    const syncToLeaderAct = function () {
      while (!leader.area) {
        delay(500);
      }

      act = Misc.getPlayerAct(leader);

      if (me.act !== act) {
        Town.goToTown(act);
        Town.move("portalspot");
      }
    };

    /**
     * @param {() => boolean} checkQuestReady
     * @param {string} npcName
     * @param {string} doneLog
     */
    const waitForQuestAndTalkToNpc = function (checkQuestReady, npcName, doneLog) {
      Misc.poll(function () {
        return !!checkQuestReady();
      }, Time.seconds(20), 1000);

      if (Town.npcInteract(npcName)) {
        console.debug(doneLog + " done");
        return true;
      }

      return false;
    };

    const handleNonQuesterNpcTalk = function () {
      if (!nonQuesterNPCTalk) {
        return null;
      }

      console.debug("Leader Area: " + getAreaName(leader.area));

      switch (leader.area) {
      case sdk.areas.ClawViperTempleLvl2:
        return waitForQuestAndTalkToNpc(function () {
          return (Misc.checkQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.ReqComplete)
            || Misc.checkQuest(sdk.quest.id.TheTaintedSun, sdk.quest.states.PartyMemberComplete));
        }, "Drognan", "drognan");
      case sdk.areas.ArcaneSanctuary:
        return waitForQuestAndTalkToNpc(function () {
          return (Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.ReqComplete)
            || Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.PartyMemberComplete));
        }, "Atma", "atma");
      case sdk.areas.Travincal:
        return waitForQuestAndTalkToNpc(function () {
          return (Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, 4)
            || Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.PartyMemberComplete)
            || Misc.checkQuest(sdk.quest.id.TheGuardian, 8));
        }, "Cain", "cain");
      case sdk.areas.ArreatSummit:
        return waitForQuestAndTalkToNpc(function () {
          return (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.ReqComplete)
            || Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.PartyMemberComplete));
        }, "Malah", "malah");
      default:
        me.inTown && Town.move("portalspot");
        return null;
      }
    };

    const goToPortalSpot = function () {
      if (me.inTown) {
        Town.move("portalspot");
      }

      return true;
    };

    /**
     * @param {number} townArea
     * @param {string} [leaderName]
     */
    const returnToTown = function (townArea, leaderName) {
      if (me.inTown) {
        return true;
      }

      if (leaderName) {
        if (leaderName === Config.Leader) {
          return usePortal(townArea);
        }

        return Pather.usePortal(townArea, leaderName);
      }

      return Pather.usePortal(townArea);
    };

    const handlePlayersOutNonQuester = function () {
      // Non-questers can piggyback off quester out messages
      switch (leader.area) {
      case sdk.areas.OuterSteppes:
      case sdk.areas.PlainsofDespair:
        if (me.act === 4 && Misc.checkQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.ReqComplete)) {
          Town.npcInteract("Tyrael");
        }
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
    };

    const handlePlayersOutQuester = function () {
      revive();

      switch (me.area) {
      case sdk.areas.CatacombsLvl4:
        // Go to town if not there, break if procedure fails
        if (!returnToTown(sdk.areas.RogueEncampment)) {
          return false;
        }

        if (!Misc.checkQuest(sdk.quest.id.SistersToTheSlaughter, 4)) {
          D2Bot.printToConsole("Andariel quest failed", sdk.colors.D2Bot.Red);
          scriptBroadcast("quit");
        }

        return true;
      case sdk.areas.A2SewersLvl3:
        if (!returnToTown(sdk.areas.LutGholein, Config.Leader)) {
          return false;
        }

        return true;
      case sdk.areas.ArcaneSanctuary:
        if (!returnToTown(sdk.areas.LutGholein, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Atma");

        if (!Misc.checkQuest(sdk.quest.id.TheSummoner, sdk.quest.states.Completed)) {
          D2Bot.printToConsole("Summoner quest failed", sdk.colors.D2Bot.Red);
          scriptBroadcast("quit");
        }

        goToPortalSpot();
        return true;
      case sdk.areas.Travincal:
        if (!returnToTown(sdk.areas.KurastDocktown, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Cain");

        if (!Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)) {
          D2Bot.printToConsole("Travincal quest failed", sdk.colors.D2Bot.Red);
          scriptBroadcast("quit");
        }

        goToPortalSpot();
        
        return true;
      case sdk.areas.DuranceofHateLvl3:
        return usePortal(sdk.areas.KurastDocktown);
      case sdk.areas.OuterSteppes:
      case sdk.areas.PlainsofDespair:
        if (!returnToTown(sdk.areas.PandemoniumFortress, Config.Leader)) {
          return false;
        }

        if (Misc.checkQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.ReqComplete)) {
          Town.npcInteract("Tyrael");
          goToPortalSpot();
        }

        return true;
      case sdk.areas.ChaosSanctuary:
        me.classic && D2Bot.restart();

        if (!returnToTown(sdk.areas.PandemoniumFortress, Config.Leader)) {
          return false;
        }

        return true;
      case sdk.areas.BloodyFoothills:
        if (!returnToTown(sdk.areas.Harrogath, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Larzuk");
        goToPortalSpot();
        return true;
      case sdk.areas.FrozenRiver:
        if (!returnToTown(sdk.areas.FrozenRiver, Config.Leader)) {
          return false;
        }

        Town.npcInteract("Malah");
        useScrollOfRes();
        goToPortalSpot();

        return true;
      default:
        if (!returnToTown(sdk.areas.townOf(me.area))) {
          return false;
        }
        goToPortalSpot();
        return true;
      }
    };

    const tryGetLeaderWaypoint = function () {
      if (usePortal(null)
        && Pather.getWP(me.area)
        && usePortal(sdk.areas.townOf(me.area))
        && goToPortalSpot()) {
        me.inTown && Config.LocalChat.Enabled && say("gotwp");
        return true;
      }

      // check for bugged portal
      let p = Game.getObject("portal");
      let preArea = me.area;

      if (!!p
        && Misc.click(0, 0, p)
        && Misc.poll(function () {
          return me.area !== preArea;
        }, 1000, 100)
        && Pather.getWP(me.area)
        && (usePortal(sdk.areas.townOf(me.area))
          || Pather.useWaypoint(sdk.areas.townOf(me.area)))) {
        me.inTown && Config.LocalChat.Enabled && say("gotwp");
        return true;
      }

      log("Failed to get wp", Config.LocalChat.Enabled);
      !me.inTown && Town.goToTown();

      return false;
    };

    /** @param {number} area */
    const isTalRashasTombArea = function (area) {
      return [
        sdk.areas.TalRashasTomb1,
        sdk.areas.TalRashasTomb2,
        sdk.areas.TalRashasTomb3,
        sdk.areas.TalRashasTomb4,
        sdk.areas.TalRashasTomb5,
        sdk.areas.TalRashasTomb6,
        sdk.areas.TalRashasTomb7,
      ].includes(area);
    };

    const handlePlayersInStonyField = function () {
      if (!me.getItem(sdk.quest.item.KeytotheCairnStones)) {
        log("Failed to pick up scroll", Config.LocalChat.Enabled);
        return false;
      }
      
      if (!usePortal(sdk.areas.StonyField)) {
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

      let stoneTick = getTickCount();
      for (let i = 0; i < 5; i++) {
        for (let stone of stones) {
          if (!stone || stone.mode) continue;
          clickUnitAndWait(sdk.clicktypes.click.map.LeftDown, sdk.clicktypes.shift.NoShift, stone);
        }
      }
      
      while (stones.some(function (stone) {
        return !stone.mode;
      })) {
        if (getTickCount() - stoneTick > Time.minutes(2)) {
          log("Failed to activate stones", Config.LocalChat.Enabled);
          return false;
        }
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
          usePortal(sdk.areas.RogueEncampment);
          
          break;
        }
      }
      Town.move("portalspot");

      return true;
    };

    const handlePlayersInDarkWood = function () {
      if (!usePortal(sdk.areas.DarkWood)) {
        log("Failed to use portal to dark wood", Config.LocalChat.Enabled);
        return false;
      }

      getQuestItem(sdk.items.quest.ScrollofInifuss, sdk.quest.chest.InifussTree);
      delay(500);
      usePortal(sdk.areas.RogueEncampment);
      
      if (Town.npcInteract("Akara")) {
        log("Akara done", Config.LocalChat.Enabled);
      }

      Town.move("portalspot");

      return true;
    };

    const handlePlayersInTristram = function () {
      if (!usePortal(sdk.areas.Tristram)) {
        log("Failed to use portal to Tristram", Config.LocalChat.Enabled);
        return true;
      }

      let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

      if (gibbet && !gibbet.mode) {
        Pather.moveTo(gibbet.x, gibbet.y);
        if (Misc.poll(function () {
          return Misc.openChest(gibbet);
        }, 2000, 100)) {
          usePortal(sdk.areas.RogueEncampment);
          Town.npcInteract("Akara") && log("Akara done", Config.LocalChat.Enabled);
        }
      }
      Town.move("portalspot");
      commands.shift();

      return true;
    };

    const handlePlayersInFrozenRiver = function () {
      Town.npcInteract("Malah");

      usePortal(sdk.areas.FrozenRiver);
      delay(500);

      target = Game.getObject(sdk.objects.FrozenAnya);

      if (target) {
        Pather.moveToUnit(target);
        Misc.poll(function () {
          Packet.entityInteract(target);
          delay(100);
          return !Game.getObject(sdk.objects.FrozenAnya);
        }, 1000, 200);
        delay(1000);
        me.cancel();
      }

      return true;
    };

    const handlePlayersInArea = function () {
      switch (leader.area) {
      case sdk.areas.StonyField:
        return handlePlayersInStonyField();
      case sdk.areas.DarkWood:
        return handlePlayersInDarkWood();
      case sdk.areas.Tristram:
        return handlePlayersInTristram();
      case sdk.areas.CatacombsLvl4:
        if (!usePortal(sdk.areas.CatacombsLvl4)) {
          log("Failed to use portal to catacombs", Config.LocalChat.Enabled);
          return false;
        }

        target = Pather.getPortal(null, Config.Leader);
        target && Pather.walkTo(target.x, target.y);

        return true;
      case sdk.areas.A2SewersLvl3:
        Town.move("portalspot");

        return usePortal(sdk.areas.A2SewersLvl3);
      case sdk.areas.HallsoftheDeadLvl3:
        usePortal(sdk.areas.HallsoftheDeadLvl3);
        getQuestItem(sdk.quest.item.Cube, sdk.quest.chest.HoradricCubeChest);
        return usePortal(sdk.areas.LutGholein);
      case sdk.areas.ClawViperTempleLvl2:
        usePortal(sdk.areas.ClawViperTempleLvl2);
        getQuestItem(sdk.quest.item.ViperAmulet, sdk.quest.chest.ViperAmuletChest);
        usePortal(sdk.areas.LutGholein);
        
        if (Town.npcInteract("Drognan")) {
          log("drognan done", Config.LocalChat.Enabled);
          Town.move("portalspot");
          return true;
        }

        return false;
      case sdk.areas.MaggotLairLvl3:
        usePortal(sdk.areas.MaggotLairLvl3);
        getQuestItem(sdk.quest.item.ShaftoftheHoradricStaff, sdk.quest.chest.ShaftoftheHoradricStaffChest);
        delay(500);
        usePortal(sdk.areas.LutGholein);
        
        return cube.Staff();
      case sdk.areas.ArcaneSanctuary:
        return usePortal(sdk.areas.ArcaneSanctuary);
      case sdk.areas.DurielsLair:
        usePortal(sdk.areas.DurielsLair);
        tyraelTalk();

        return true;
      case sdk.areas.Travincal:
        if (!usePortal(sdk.areas.Travincal)) {
          me.cancel();

          return false;
        }

        return true;
      case sdk.areas.RuinedTemple:
        if (!usePortal(sdk.areas.RuinedTemple)) {
          me.cancel();

          return false;
        }

        getQuestItem(sdk.quest.item.LamEsensTome, sdk.quest.chest.LamEsensTomeHolder);
        usePortal(sdk.areas.KurastDocktown);
        Town.npcInteract("Alkor");
        Town.move("portalspot");
        return true;
      case sdk.areas.DuranceofHateLvl3:
        if (!usePortal(sdk.areas.DuranceofHateLvl3)) {
          me.cancel();

          return false;
        }

        return true;
      case sdk.areas.OuterSteppes:
      case sdk.areas.PlainsofDespair:
        return usePortal(null);
      case sdk.areas.ChaosSanctuary:
        usePortal(sdk.areas.ChaosSanctuary);
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
        return usePortal(sdk.areas.BloodyFoothills);
      case sdk.areas.FrozenRiver:
        return handlePlayersInFrozenRiver();
      default:
        if (isTalRashasTombArea(leader.area)) {
          usePortal(null);
          placeStaff();
          usePortal(sdk.areas.LutGholein);
        }

        return true;
      }
    };

    const actions = new Map([
      [AutoRush.allIn, function () {
        switch (leader.area) {
        case sdk.areas.A2SewersLvl3:
          // Pick Book of Skill, use Book of Skill
          Town.move("portalspot");
          usePortal(sdk.areas.A2SewersLvl3);
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

          usePortal(sdk.areas.LutGholein);

          return true;
        default:
          if (!weAreBumper) {
            if (!me.hell || me.charlvl < bumperLevelReq) {
              console.debug("Not bumper, waiting for leader to enter area");
              return true;
            }
          }

          syncToLeaderAct();

          switch (leader.area) {
          case sdk.areas.ArreatSummit:
            if (!usePortal(sdk.areas.ArreatSummit)) {
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

            if (!usePortal(sdk.areas.Harrogath)) {
              return false;
            }

            return true;
          case sdk.areas.WorldstoneChamber:
            if (!usePortal(sdk.areas.WorldstoneChamber)) {
              return false;
            }

            return true;
          }
        }
        return true;
      }],
      [AutoRush.playersIn, function () {
        syncToLeaderAct();

        // we need to talk to certain npcs in order to be able to grab waypoints as a non-quester
        let npcTalkResult = handleNonQuesterNpcTalk();
        if (npcTalkResult !== null) {
          return npcTalkResult;
        }

        if (rushConfig.type !== RushModes.quester) {
          return true;
        }

        return handlePlayersInArea();
      }],
      [AutoRush.playersOut, function () {
        if (rushConfig.type !== RushModes.quester) {
          return handlePlayersOutNonQuester();
        }

        return handlePlayersOutQuester();
      }],
      ["flail", function () {
        if (rushConfig.type !== RushModes.quester) {
          return true;
        }
        return true;
      }],
      ["questinfo", function () {
        if (rushConfig.type !== RushModes.quester) {
          return true;
        }
        say("qinfo " + getQuestInfo());
        return true;
      }],
      ["wpinfo", function () {
        if (rushConfig.type !== RushModes.quester) {
          return true;
        }
        // go activate wp if we don't know our wps yet
        !Pather.initialized && Pather.init(true);
        const includeWorldstone = me.ancients;
        const highestAct = me.highestAct;

        let myWps = Pather.nonTownWpAreas.slice(0).filter(function (area) {
          if (area === sdk.areas.HallsofPain) return false;
          if (me.classic && area >= sdk.areas.Harrogath) return false;
          if (me.haveWaypoint(area)) return false;
          switch (highestAct) {
          case 1:
            return (area < sdk.areas.LutGholein);
          case 2:
            return (area < sdk.areas.KurastDocktown);
          case 3:
            return (area < sdk.areas.PandemoniumFortress);
          case 4:
            return (area < sdk.areas.Harrogath);
          }
          if (!includeWorldstone && area === sdk.areas.WorldstoneLvl2) return false;
          return true; // this returns a list of what we don't have
        });

        // say("wpinfo " + JSON.stringify({ areas: myWps }));
        say("wpinfo " + JSON.stringify(myWps));
        return true;
      }],
      ["wp", function () {
        if (!me.inTown && !Town.goToTown()) {
          log("I can't get to town :(", Config.LocalChat.Enabled);
          return false;
        }

        let leaderArea = Misc.getPlayerArea(leader);
        if (leaderArea && me.haveWaypoint(leaderArea)) {
          say("alreadyhave");
          return true;
        }

        syncToLeaderAct();

        // make sure we talk to cain to access durance
        if (
          leader.area === sdk.areas.DuranceofHateLvl2
          && !Misc.checkQuest(sdk.quest.id.TheBlackenedTemple, sdk.quest.states.Completed)
        ) {
          Town.npcInteract("Cain");
        }
        
        // we aren't the quester but need to talk to npcs in order to be able to get wps from certain areas 
        (rushConfig.type !== RushModes.quester && !nonQuesterNPCTalk) && (nonQuesterNPCTalk = true);

        Town.getDistance("portalspot") > 10 && Town.move("portalspot");
        tryGetLeaderWaypoint();

        return true;
      }],
      ["changeact", /** @param {number} act */ function (act) {
        if (!changeAct(act)) {
          return false;
        }

        Town.move("portalspot");
        return true;
      }],
      ["quit", function () {
        return (done = true);
      }],
      ["exit", function () {
        if (!nextGame) {
          D2Bot.printToConsole("Rush Complete");
          D2Bot.stop();
        } else {
          // if (rushConfig && rushConfig.create && rushConfig.create.charsPerAcc > 1) {
          //   const charNumbers = "abcdefghijklmnopqrstuvwxyz";
          //   let currName = me.charname;
          //   let suffix = currName.slice(-2);
            
          //   if (suffix[1] === "z") {
          //     if (suffix[0] === "z") {
          //       // both characters were z, so wrap around
          //       D2Bot.setProfile(null, null, currName.slice(0, -2) + "aa");
          //     } else {
          //       let nextCharIdx = charNumbers.indexOf(suffix[0]);
          //       let newSuffix = charNumbers[nextCharIdx + 1] + "a";
          //       D2Bot.setProfile(null, null, currName.slice(0, -2) + newSuffix);
          //     }
          //   } else {
          //     let nextCharIdx = charNumbers.indexOf(suffix[1]);
          //     let newSuffix = suffix[0] + charNumbers[nextCharIdx + 1];
          //     D2Bot.setProfile(null, null, currName.slice(0, -2) + newSuffix);
          //   }
          // }
          D2Bot.restart();
        }
        return true;
      }],
      ["leader", function () {
        log(Config.Leader + " is my leader in my config. " + leader.name + " is my leader right now", Config.LocalChat.Enabled);
        return true;
      }],
      [me.name + "-quest", function () {
        say("I am quester.");
        rushConfig.type = RushModes.quester;

        return true;
      }],
    ]);

    // --------------------------------------------------
    // START MAIN SCRIPT EXECUTION
    // --------------------------------------------------
    
    // Apply overrides
    applyOverrides();
    addEventListener("chatmsg", chatEvent);
    
    const curr = {
      cmd: "",
      retry: 0
    };
    let nonQuesterNPCTalk = false;
    let act, target, done = false;
    /** @type {string[]} */
    const commands = [];
    
    if (Misc.checkQuest(sdk.quest.id.SistersToTheSlaughter, sdk.quest.states.ReqComplete)) {
      changeAct(2);
    }

    if (Misc.checkQuest(sdk.quest.id.TheSevenTombs, sdk.quest.states.ReqComplete)) {
      changeAct(3);
    }

    if (Misc.checkQuest(sdk.quest.id.TerrorsEnd, sdk.quest.states.ReqComplete)) {
      changeAct(5);
    }
    
    Town.goToTown(me.highestAct);
    me.inTown && Town.move("portalspot");

    if (me.inArea(sdk.areas.RogueEncampment)
      && !me.getQuest(sdk.quest.id.SpokeToWarriv, sdk.quest.states.Completed)
    ) {
      Town.npcInteract("Warriv");
      Town.move("portalspot");
    }

    // if we can't find our leader after 5 minutes, I'm thinking they aren't showing up. Lets not wait around forever
    let checkIn = getTickCount() + Time.minutes(1);
    const leader = Misc.poll(function () {
      if (getTickCount() > checkIn) {
        say("who is rusher");
        checkIn = getTickCount() + Time.minutes(1);
      }
      return Misc.findPlayer(Config.Leader);
    }, Time.minutes(5), 1000);
    if (!leader) throw new Error("Failed to find my rusher");

    const maybeBumper = [RushModes.bumper, RushModes.quester].includes(rushConfig.type);
    (rushConfig.type === RushModes.quester)
      ? log("(Quester) Leader Found: " + Config.Leader, Config.LocalChat.Enabled)
      : console.log("(NonQuester) Leader Found: " + Config.Leader);

    // lets figure out if we either are the bumper or have a bumper so we know if we need to stop at the end of the rush
    const bumperLevelReq = getBumperLvlReq();
    const weAreBumper = maybeBumper && me.charlvl >= bumperLevelReq;
    // ensure we are the right level to go to next difficulty if not on classic
    let nextGame = (
      (maybeBumper && (me.classic || me.charlvl >= bumperLevelReq))
      // || (rushConfig && rushConfig.create && rushConfig.create.charsPerAcc > 1) // unsupported currentlly
    );
    if (!nextGame) {
      // we aren't the bumper, lets figure out if anyone else is a bumper
      // hell is the end of a rush so always end profile after
      if (Misc.getPlayerCount() > 2 && !me.hell) {
        // there is more than just us and the rusher in game - so check party level
        nextGame = Misc.checkPartyLevel(bumperLevelReq, leader.name);
      }
    }
    console.debug("Is this our last run? " + (nextGame ? "No" : "Yes"));

    const processNextCommand = function () {
      if (commands.length < 1) {
        return;
      }

      /** @type {string[]} */
      let args = commands[0].toLowerCase().split(" ");
      let command = args.shift();

      if (!actions.has(command)) {
        console.debug("Command not found: " + command);
        commands.shift();

        return;
      }

      curr.cmd = command;

      if (actions.get(command).apply(null, args)) {
        commands.shift();
        curr.retry = 0;
      } else {
        console.debug("Command retry: " + command);
        curr.retry++;
        if (curr.retry > 3) {
          log("Failed to do " + command, Config.LocalChat.Enabled);
          if (command === "changeact") {
            // well that's no good
            scriptBroadcast("quit");
          }
          commands.shift();
        }
      }
    };

    while (true) {
      // todo - clean all this up so there is clear distinction between quester/non-quester and no repeat sequnces
      try {
        if (me.inTown && me.needHealing()) {
          Town.heal();
          Town.move("portalspot");
        }

        processNextCommand();
      } catch (e) {
        console.error(e);
        commands.shift();
        if (me.mode === sdk.player.mode.Dead) {
          revive();
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
    done && scriptBroadcast("quit");

    return true;
  }
);
