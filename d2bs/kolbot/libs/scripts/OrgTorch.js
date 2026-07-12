/**
*  @filename    OrgTorch.js
*  @author      kolton, theBGuy
*  @desc        Convert keys to organs and organs to torches. It can work with TorchSystem to get keys from other characters
*  @notes       Search for the word "START" and follow the comments if you want to know what this script does and when.
*
*/

/**
*  @todo:
*   - override Town.buyPots, usually uber killers have only a little invo space so they fail to buy/drink all the pregame pots
*      change method to buy/drink one pot at a time
*   - add ability to team this, possible roles being:
*      - taxi (just tele killer around)
*      - helper (goes in tp and actuallys kills mob), maybe config for specifc areas like if we use salvation to kill meph
*         but have a helper who comes in with max fanat or conviction
*      - bo barb or war cry barb would make killing main boss easier with all the surrounding mobs being stunned
*/

const OrgTorch = new Runnable(
  function OrgTorch () {
    if (Config.OrgTorch.UseSalvation) {
      Config.AdvancedCustomAttack.push({
        check: function (unit) {
          return (
            unit.classid === sdk.monsters.UberMephisto
            || (me.inArea(sdk.areas.UberTristram) && Game.getMonster(sdk.monsters.UberMephisto))
          );
        },
        attack: [Config.AttackSkill[1], sdk.skills.Salvation]
      });
    }
    
    Config.MFLeader = true;
    let currentGameInfo = null;
    /** @type {Player | null} */
    let taxiPlayer = null;
    let taxiUp = false;

    const OrgTorchData = require("../systems/torch/OrgTorchData");
    const portalMode = {
      MiniUbers: 0,
      UberTristram: 1
    };

    /**
     * @param {string} nick 
     * @param {string} msg 
     */
    function chatEvent (nick, msg) {
      if (!nick || !msg) return;
      if (msg !== "up") return;

      if (!taxiPlayer && String.isEqual(Config.OrgTorch.TaxiChar, nick)) {
        taxiPlayer = Misc.findPlayer(nick);
      }

      if (taxiPlayer && taxiPlayer.name === nick) {
        taxiUp = true;
        console.log("ÿc7OrgTorch :: Taxi is up");
      }
    }

    /**
    * @param {ItemUnit} item 
    * @returns {boolean}
    */
    const getQuestItem = function (item) {
      if (item) {
        let id = item.classid;
        let canFit = Storage.Inventory.CanFit(item);
        if (!canFit && Pickit.canMakeRoom()) {
          console.log("ÿc7Trying to make room for " + Item.color(item) + item.name);
          Town.visitTown();
          !copyUnit(item).x && (item = Misc.poll(() => Game.getItem(id)));
        }
      }
      return Pickit.pickItem(item);
    };

    // Identify & mule
    const checkTorch = function () {
      if (me.inArea(sdk.areas.UberTristram)) {
        Pather.moveTo(25105, 5140);
        Pather.usePortal(sdk.areas.Harrogath);
      }

      Town.doChores();

      if (!Config.OrgTorch.MakeTorch) {
        return false;
      }
      
      let torch = me.checkItem({ classid: sdk.items.LargeCharm, quality: sdk.items.quality.Unique });

      if (torch.have && Pickit.checkItem(torch.item).result === Pickit.Result.WANTED) {
        if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
          scriptBroadcast("muleTorch");
          scriptBroadcast("quit");
        }

        return true;
      }

      return false;
    };

    /**
    * Try to lure a monster - wait until it's close enough
    * @param {number} bossId 
    * @returns {boolean}
    * @todo redo this
    * - should, lure boss AWAY from the others and to us
    * - create path to boss, move some -> wait to see if aggroed -> if yes - move back and make sure it follows until its safely away from other bosses
    */
    const lure = function (bossId) {
      let unit = Game.getMonster(bossId);

      // 25121/5157 - bottom left corner of top left building
      // 25141/5175 - top left corner of bottom left building
      // 25131/5187 - area we want to lure meph to
      if (unit && !unit.dead) {
        let tick = getTickCount();

        while (getTickCount() - tick < 2000) {
          if (unit.distance <= 10) {
            return true;
          }

          delay(50);
        }
      }

      return false;
    };

    /**
    * Check if we have complete sets of organs
    * @returns {boolean}
    */
    const completeSetCheck = function () {
      const organs = new Map([
        [sdk.items.quest.DiablosHorn, 0],
        [sdk.items.quest.MephistosBrain, 0],
        [sdk.items.quest.BaalsEye, 0]
      ]);
      /** @param {ItemUnit} item */
      const filterInvo = function (item) {
        return item.isInStorage && organs.has(item.classid) && item.normal;
      };
      /** @param {ItemUnit} item */
      const countOrgans = function (item) {
        if (organs.has(item.classid)) {
          organs.set(item.classid, organs.get(item.classid) + 1);
        }
      };
      me.getItemsEx()
        .filter(filterInvo)
        .forEach(countOrgans);

      const horns = organs.get(sdk.items.quest.DiablosHorn);
      const brains = organs.get(sdk.items.quest.MephistosBrain);
      const eyes = organs.get(sdk.items.quest.BaalsEye);
      
      if (!horns || !brains || !eyes) {
        return false;
      }

      // We just need one set to make a torch
      if (Config.OrgTorch.MakeTorch) {
        return horns > 0 && brains > 0 && eyes > 0;
      }

      return horns === brains && horns === eyes && brains === eyes;
    };

    /**
    * Get fade in River of Flames - only works if we are wearing an item with ctc Fade
    * @returns {boolean}
    * @todo equipping an item from storage if we have it
    */
    const getFade = function () {
      if (!Config.OrgTorch.GetFade) return true;
      if (me.getState(sdk.states.Fade)) return true;

      // lets figure out what fade item we have before we leave town
      const fadeItem = me.findFirst([
        { name: sdk.locale.items.Treachery, equipped: true },
        { name: sdk.locale.items.LastWish, equipped: true },
        { name: sdk.locale.items.SpiritWard, equipped: true }
      ]);
      
      if (fadeItem.have) {
        console.log(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.White + "Getting Fade");

        Pather.useWaypoint(sdk.areas.RiverofFlame);
        Precast.doPrecast(true);
        // check if item is on switch
        let mainSlot;

        Pather.moveTo(7811, 5872);
          
        if (fadeItem.item.isOnSwap && me.weaponswitch !== sdk.player.slot.Secondary) {
          mainSlot = me.weaponswitch;
          me.switchWeapons(sdk.player.slot.Secondary);
        }

        Skill.canUse(sdk.skills.Salvation) && Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);

        while (!me.getState(sdk.states.Fade)) {
          delay(100);
        }

        mainSlot !== undefined && me.weaponswitch !== mainSlot && me.switchWeapons(mainSlot);

        console.log(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.Green + "Fade Achieved");
      }

      return true;
    };

    /**
    * Open a red portal. Mode 0 = mini ubers, mode 1 = Tristram
    * @param {number} mode 
    * @returns {ObjectUnit | false}
    */
    const openPortal = function (mode) {
      let item1 = mode === portalMode.MiniUbers
        ? me.findItem("pk1", sdk.items.mode.inStorage)
        : me.findItem("dhn", sdk.items.mode.inStorage);
      let item2 = mode === portalMode.MiniUbers
        ? me.findItem("pk2", sdk.items.mode.inStorage)
        : me.findItem("bey", sdk.items.mode.inStorage);
      let item3 = mode === portalMode.MiniUbers
        ? me.findItem("pk3", sdk.items.mode.inStorage)
        : me.findItem("mbr", sdk.items.mode.inStorage);

      Town.goToTown(5);
      Town.doChores();

      if (Town.openStash() && Cubing.emptyCube()) {
        if (!Storage.Cube.MoveTo(item1)
          || !Storage.Cube.MoveTo(item2)
          || !Storage.Cube.MoveTo(item3)
          || !Cubing.openCube()) {
          return false;
        }

        transmute();
        delay(1000);

        let portal = Game.getObject(sdk.objects.RedPortal);

        if (portal) {
          do {
            switch (mode) {
            case portalMode.MiniUbers:
              if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain].includes(portal.objtype)
                && currentGameInfo.doneAreas.indexOf(portal.objtype) === -1) {
                return copyUnit(portal);
              }

              break;
            case portalMode.UberTristram:
              if (portal.objtype === sdk.areas.UberTristram) {
                return copyUnit(portal);
              }

              break;
            }
          } while (portal.getNext());
        }
      }

      return false;
    };

    const matronsDen = function () {
      let dHorns = me.findItems(sdk.items.quest.DiablosHorn, sdk.items.mode.inStorage).length;

      Precast.doPrecast(true);
      Pather.moveToPreset(sdk.areas.MatronsDen, sdk.unittype.Object, sdk.objects.SmallSparklyChest, 2, 2);
      Attack.kill(sdk.monsters.Lilith);
      Pickit.pickItems();
      getQuestItem(Game.getItem(sdk.items.quest.DiablosHorn));
      Town.goToTown();

      // we sucessfully picked up the horn
      return (me.findItems(sdk.items.quest.DiablosHorn, sdk.items.mode.inStorage).length > dHorns);
    };

    const forgottenSands = function () {
      let bEyes = me.findItems(sdk.items.quest.BaalsEye, sdk.items.mode.inStorage).length;

      Precast.doPrecast(true);

      const nodes = [
        new PathNode(20196, 8694),
        new PathNode(20308, 8588),
        new PathNode(20187, 8639),
        new PathNode(20100, 8550),
        new PathNode(20103, 8688),
        new PathNode(20144, 8709),
        new PathNode(20263, 8811),
        new PathNode(20247, 8665),
      ];

      const foundDuriel = function () {
        return !!Game.getMonster(sdk.monsters.UberDuriel);
      };

      try {
        for (let node of nodes) {
          Pather.move(node, { callback: foundDuriel });
          delay(500);

          if (Game.getMonster(sdk.monsters.UberDuriel)) {
            break;
          }

          let eye = Game.getItem(sdk.items.quest.BaalsEye, sdk.items.mode.onGround);

          if (eye && Pickit.pickItem(eye)) {
            throw new Error("Found an picked wanted organ");
          }
        }

        Attack.kill(sdk.monsters.UberDuriel);
        Pickit.pickItems();
        getQuestItem(Game.getItem(sdk.items.quest.BaalsEye));
        Town.goToTown();
      } catch (e) {
        //
      }

      // we sucessfully picked up the eye
      return (me.findItems(sdk.items.quest.BaalsEye, sdk.items.mode.inStorage).length > bEyes);
    };

    const furnance = function () {
      let mBrain = me.findItems(sdk.items.quest.MephistosBrain, sdk.items.mode.inStorage).length;

      const foundIzual = function () {
        return !!Game.getMonster(sdk.monsters.UberIzual) || Attack.haveKilled(sdk.monsters.UberIzual);
      };
      Precast.doPrecast(true);
      Pather.moveToPresetObject(
        sdk.areas.FurnaceofPain,
        sdk.objects.SmallSparklyChest,
        { offX: 2, offY: 2, callback: foundIzual }
      );
      Attack.kill(sdk.monsters.UberIzual);
      Pickit.pickItems();
      getQuestItem(Game.getItem(sdk.items.quest.MephistosBrain));
      Town.goToTown();

      // we sucessfully picked up the brain
      return (me.findItems(sdk.items.quest.MephistosBrain, sdk.items.mode.inStorage).length > mBrain);
    };

    /**
    * @todo re-write this, lure doesn't always work and other classes can do ubers
    */
    const uberTrist = function () {
      Pather.moveTo(25068, 5078);
      
      if (Precast.checkCTA() && !me.getState(sdk.states.BattleOrders) && Misc.getNearbyPlayerCount() === 0) {
        Config.UseCta = true; // override
      }
      Precast.doPrecast(true);

      const nodes = [
        new PathNode(25040, 5101),
        new PathNode(25040, 5166),
        new PathNode(25131, 5187),
        // new PathNode(25122, 5170),
        new PathNode(25131, 5187),
      ];

      for (let node of nodes) {
        Pather.move(node, { callback: function () {
          let meph = Game.getMonster(sdk.monsters.UberMephisto);
          let diablo = Game.getMonster(sdk.monsters.UberDiablo);
          let baal = Game.getMonster(sdk.monsters.UberBaal);
          return (
            (meph && meph.distance < 10)
            || (diablo && diablo.distance < 10)
            || (baal && baal.distance < 10)
          );
        } });
      }

      lure(sdk.monsters.UberMephisto, 25131, 5187);

      if (!Game.getMonster(sdk.monsters.UberMephisto)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.kill(sdk.monsters.UberMephisto);

      Pather.move(new PathNode(25162, 5141), { callback: function () {
        return Attack.haveKilled(sdk.monsters.UberDiablo);
      } });
      
      const uberDiableCB = function () {
        if (Attack.haveKilled(sdk.monsters.UberDiablo)) {
          return true;
        }
        let diablo = Game.getMonster(sdk.monsters.UberDiablo);
        return diablo && (diablo.distance < 10 || diablo.dead);
      };
      Misc.poll(uberDiableCB, 3250, 50);

      if (!Game.getMonster(sdk.monsters.UberDiablo)) {
        Pather.move(new PathNode(25122, 5170), { callback: uberDiableCB });
      }

      Attack.kill(sdk.monsters.UberDiablo);

      if (!Game.getMonster(sdk.monsters.UberBaal)) {
        Pather.move(new PathNode(25122, 5170), { callback: function () {
          if (Attack.haveKilled(sdk.monsters.UberBaal)) {
            return true;
          }
          let baal = Game.getMonster(sdk.monsters.UberBaal);
          return baal && (baal.distance < 10 || baal.dead);
        } });
      }

      Attack.kill(sdk.monsters.UberBaal);
      Pickit.pickItems();
      currentGameInfo.doneAreas.push(sdk.areas.UberTristram) && OrgTorchData.update(currentGameInfo);
      checkTorch();
    };

    /**
    * Do mini ubers or Tristram based on area we're already in
    * @param {number} portalId 
    */
    const pandemoniumRun = function (portalId) {
      switch (me.area) {
      case sdk.areas.MatronsDen:
        if (matronsDen()) {
          currentGameInfo.doneAreas.push(portalId) && OrgTorchData.update(currentGameInfo);
        }

        break;
      case sdk.areas.ForgottenSands:
        if (forgottenSands()) {
          currentGameInfo.doneAreas.push(portalId) && OrgTorchData.update(currentGameInfo);
        }

        break;
      case sdk.areas.FurnaceofPain:
        if (furnance()) {
          currentGameInfo.doneAreas.push(portalId) && OrgTorchData.update(currentGameInfo);
        }

        break;
      case sdk.areas.UberTristram:
        uberTrist();

        break;
      }
    };

    /**
    * @param {ObjectUnit} portal 
    */
    const runEvent = function (portal) {
      if (!portal) return;
      const portalArea = portal.objtype;
      const { Antidote, Thawing } = Config.OrgTorch.PreGame;
      if (Antidote.At.includes(portal.objtype) && Antidote.Drink > 0) {
        Town.buyPots(Antidote.Drink, "Antidote", true, true);
      }
      if (Thawing.At.includes(portal.objtype) && Thawing.Drink > 0) {
        Town.buyPots(Thawing.Drink, "Thawing", true, true);
      }
      say("Starting " + portal.objtype);
      
      if (Config.OrgTorch.TaxiChar && portalArea !== sdk.areas.UberTristram) {
        Town.move("portalspot");

        const taxiReady = function () {
          return taxiUp && Pather.usePortal(portalArea, taxiPlayer.name);
        };

        if (Misc.poll(taxiReady, Time.minutes(1), 1000)) {
          taxiUp = false;
          console.log("taking portal: " + portalArea);
          pandemoniumRun(portalArea);

          return;
        } else {
          console.log("OrgTorch :: Taxi not ready, taking red portal.");
          Town.move("stash");
        }
      } else {
        Town.move("stash");
      }
      console.log("taking portal: " + portal.objtype);
      Pather.usePortal(null, null, portal);
      pandemoniumRun(portal.objtype);
    };

    // ################# //
    /* ##### START ##### */
    // ################# //

    // make sure we are picking the organs
    Config.PickitFiles.length === 0 && NTIP.OpenFile("pickit/keyorg.nip", true);

    OrgTorchData.exists() && (currentGameInfo = OrgTorchData.read());

    if (!currentGameInfo || currentGameInfo.gamename !== me.gamename) {
      currentGameInfo = OrgTorchData.create();
    }

    let portal;

    const ingredients = new Map([
      [sdk.items.quest.KeyofTerror, 0],
      [sdk.items.quest.KeyofHate, 0],
      [sdk.items.quest.KeyofDestruction, 0],
      [sdk.items.quest.DiablosHorn, 0],
      [sdk.items.quest.MephistosBrain, 0],
      [sdk.items.quest.BaalsEye, 0]
    ]);

    const checkIngredients = function () {
      /** @param {ItemUnit} item */
      const filterIngredients = function (item) {
        return item.isInStorage && ingredients.has(item.classid) && item.normal;
      };
      /** @param {ItemUnit} item */
      const countIngredients = function (item) {
        if (ingredients.has(item.classid)) {
          ingredients.set(item.classid, ingredients.get(item.classid) + 1);
        }
      };

      me.getItemsEx()
        .filter(filterIngredients)
        .forEach(countIngredients);
    };

    // Initialize our ingredients map
    checkIngredients();

    // Do town chores and quit if MakeTorch is true and we have a torch.
    checkTorch();

    // Wait for other bots to drop off their keys. This works only if TorchSystem.js is configured properly.
    Config.OrgTorch.WaitForKeys && TorchSystem.waitForKeys();

    Town.goToTown(5);
    Town.move("stash");

    const uberPortals = [
      sdk.areas.MatronsDen,
      sdk.areas.ForgottenSands,
      sdk.areas.FurnaceofPain,
      sdk.areas.UberTristram
    ];
    const redPortals = getUnits(sdk.unittype.Object, sdk.objects.RedPortal)
      .filter(function (el) {
        return uberPortals.includes(el.objtype);
      });
    let miniPortals = 0;
    let keySetsReq = 3;
    let tristOpen = false;

    if (redPortals.length > 0) {
      redPortals.forEach(function (portal) {
        if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain].includes(portal.objtype)) {
          miniPortals++;
          keySetsReq--;
        } else if (portal.objtype === sdk.areas.UberTristram) {
          tristOpen = true;
        }
      });
    } else {
      // possible same game name but different day and data file never got deleted
      currentGameInfo.doneAreas.length > 0 && (currentGameInfo = OrgTorchData.create());
    }

    /**
     * @param {number} req 
     * @returns {boolean}
     */
    const validKeyCount = function (req) {
      return ingredients.get(sdk.items.quest.KeyofTerror) >= req
        && ingredients.get(sdk.items.quest.KeyofHate) >= req
        && ingredients.get(sdk.items.quest.KeyofDestruction) >= req;
    };

    const validOrganCount = function () {
      return ingredients.get(sdk.items.quest.DiablosHorn) >= 1
        && ingredients.get(sdk.items.quest.MephistosBrain) >= 1
        && ingredients.get(sdk.items.quest.BaalsEye) >= 1;
    };

    // End the script if we don't have enough keys nor organs
    if (!validKeyCount(keySetsReq) && !validOrganCount() && !tristOpen) {
      console.log("Not enough keys or organs.");
      OrgTorchData.remove();

      return true;
    }

    Config.UseMerc = false;

    // We have enough keys, do mini ubers
    if (validKeyCount(keySetsReq)) {
      getFade();
      Town.goToTown(5);
      console.log("Making organs.");
      D2Bot.printToConsole("OrgTorch: Making organs.", sdk.colors.D2Bot.DarkGold);
      Town.move("stash");

      if (Config.OrgTorch.TaxiChar) {
        addEventListener("chatmsg", chatEvent);

        if (!taxiPlayer) {
          taxiPlayer = Misc.findPlayer(Config.OrgTorch.TaxiChar);
        }
      }

      // there are already open portals lets check our info on them
      if (miniPortals > 0) {
        for (let i = 0; i < miniPortals; i++) {
          // mini-portal is up but its not in our done areas, probably chickend during it, lets try again
          if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain].includes(redPortals[i].objtype)
            && !currentGameInfo.doneAreas.includes(redPortals[i].objtype)
          ) {
            portal = redPortals[i];
            runEvent(portal);
          }
        }
      }

      for (let i = 0; i < keySetsReq; i += 1) {
        // Abort if we have a complete set of organs
        // If Config.OrgTorch.MakeTorch is false, check after at least one portal is made
        if ((Config.OrgTorch.MakeTorch || i > 0) && completeSetCheck()) {
          break;
        }

        portal = openPortal(portalMode.MiniUbers);
        runEvent(portal);
      }
    }

    // Don't make torches if not configured to OR if the char already has one
    if (!Config.OrgTorch.MakeTorch || checkTorch()) {
      OrgTorchData.remove();

      return true;
    }

    // Count organs
    checkIngredients();

    // We have enough organs, do Tristram - or trist is open we may have chickened and came back so check it
    // if trist was already open when we joined should we run that first?
    if (validOrganCount() || tristOpen) {
      getFade();
      Town.goToTown(5);
      Town.move("stash");

      if (!tristOpen) {
        console.log("Making torch");
        D2Bot.printToConsole("OrgTorch: Making torch.", sdk.colors.D2Bot.DarkGold);
        portal = openPortal(portalMode.UberTristram);
      } else {
        portal = Pather.getPortal(sdk.areas.UberTristram);
      }

      runEvent(portal);
      OrgTorchData.remove();
    }

    return true;
  },
  {
    startArea: sdk.areas.Harrogath
  }
);
