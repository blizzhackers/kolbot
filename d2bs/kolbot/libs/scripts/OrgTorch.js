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

function OrgTorch () {
  let currentGameInfo = null;

  const portalMode = {
    MiniUbers: 0,
    UberTristram: 1
  };

  const OrgTorchData = {
    filePath: "logs/OrgTorch-" + me.profile + ".json",
    _default: { gamename: me.gamename, doneAreas: [] },

    create: function () {
      FileTools.writeText(this.filePath, JSON.stringify(this._default));
      return this._default;
    },

    read: function () {
      let obj = {};
      try {
        let string = FileTools.readText(this.filePath);
        obj = JSON.parse(string);
      } catch (e) {
        return this._default;
      }

      return obj;
    },

    update: function (newData) {
      let data = this.read();
      Object.assign(data, newData);
      FileTools.writeText(this.filePath, JSON.stringify(data));
    },

    remove: function () {
      return FileTools.remove(this.filePath);
    }
  };

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

    if (!Config.OrgTorch.MakeTorch) return false;

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

    if (unit) {
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
    let [horns, brains, eyes] = [0, 0, 0];
    me.getItemsEx()
      .filter(i => i.isInInventory && !Town.ignoreType(i.itemType) && i.quality === sdk.items.quality.Normal)
      .forEach(i => {
        switch (i.classid) {
        case sdk.items.quest.DiablosHorn:
          return (horns++);
        case sdk.items.quest.MephistosBrain:
          return (brains++);
        case sdk.items.quest.BaalsEye:
          return (eyes++);
        default: return 0;
        }
      });

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
    if (Config.OrgTorch.GetFade && !me.getState(sdk.states.Fade)
      && me.haveSome([
        { name: sdk.locale.items.Treachery, equipped: true },
        { name: sdk.locale.items.LastWish, equipped: true },
        { name: sdk.locale.items.SpiritWard, equipped: true }
      ])) {
      console.log(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.White + "Getting Fade");
      // lets figure out what fade item we have before we leave town
      let fadeItem = me.findFirst([
        { name: sdk.locale.items.Treachery, equipped: true },
        { name: sdk.locale.items.LastWish, equipped: true },
        { name: sdk.locale.items.SpiritWard, equipped: true }
      ]);

      Pather.useWaypoint(sdk.areas.RiverofFlame);
      Precast.doPrecast(true);
      // check if item is on switch
      let mainSlot;

      Pather.moveTo(7811, 5872);
        
      if (fadeItem.have && fadeItem.item.isOnSwap && me.weaponswitch !== sdk.player.slot.Secondary) {
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

    let nodes = [
      { x: 20196, y: 8694 },
      { x: 20308, y: 8588 },
      { x: 20187, y: 8639 },
      { x: 20100, y: 8550 },
      { x: 20103, y: 8688 },
      { x: 20144, y: 8709 },
      { x: 20263, y: 8811 },
      { x: 20247, y: 8665 },
    ];

    try {
      for (let i = 0; i < nodes.length; i++) {
        Pather.moveTo(nodes[i].x, nodes[i].y);
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

    Precast.doPrecast(true);
    Pather.moveToPreset(sdk.areas.FurnaceofPain, sdk.unittype.Object, sdk.objects.SmallSparklyChest, 2, 2);
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
    let skillBackup;
    let useSalvation = Config.OrgTorch.UseSalvation && Skill.canUse(sdk.skills.Salvation);

    Pather.moveTo(25068, 5078);
    Precast.doPrecast(true);

    let nodes = [
      { x: 25040, y: 5101 },
      { x: 25040, y: 5166 },
      { x: 25122, y: 5170 },
    ];

    for (let i = 0; i < nodes.length; i++) {
      Pather.moveTo(nodes[i].x, nodes[i].y);
    }

    useSalvation && Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);
    lure(sdk.monsters.UberMephisto);
    Pather.moveTo(25129, 5198);
    useSalvation && Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);
    lure(sdk.monsters.UberMephisto);

    if (!Game.getMonster(sdk.monsters.UberMephisto)) {
      Pather.moveTo(25122, 5170);
    }

    if (useSalvation) {
      skillBackup = Config.AttackSkill[2];
      Config.AttackSkill[2] = sdk.skills.Salvation;

      Attack.init();
    }

    Attack.kill(sdk.monsters.UberMephisto);

    if (skillBackup && useSalvation) {
      Config.AttackSkill[2] = skillBackup;

      Attack.init();
    }

    Pather.moveTo(25162, 5141);
    delay(3250);

    if (!Game.getMonster(sdk.monsters.UberDiablo)) {
      Pather.moveTo(25122, 5170);
    }

    Attack.kill(sdk.monsters.UberDiablo);

    if (!Game.getMonster(sdk.monsters.UberBaal)) {
      Pather.moveTo(25122, 5170);
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
    if (portal) {
      if (Config.OrgTorch.PreGame.Antidote.At.includes(portal.objtype) && Config.OrgTorch.PreGame.Antidote.Drink > 0) {
        Town.buyPots(Config.OrgTorch.PreGame.Antidote.Drink, "Antidote", true, true);
      }
      if (Config.OrgTorch.PreGame.Thawing.At.includes(portal.objtype) && Config.OrgTorch.PreGame.Thawing.Drink > 0) {
        Town.buyPots(Config.OrgTorch.PreGame.Thawing.Drink, "Thawing", true, true);
      }
      Town.move("stash");
      console.log("taking portal: " + portal.objtype);
      Pather.usePortal(null, null, portal);
      pandemoniumRun(portal.objtype);
    }
  };

  // ################# //
  /* ##### START ##### */
  // ################# //

  // make sure we are picking the organs
  Config.PickitFiles.length === 0 && NTIP.OpenFile("pickit/keyorg.nip", true);

  FileTools.exists(OrgTorchData.filePath) && (currentGameInfo = OrgTorchData.read());

  if (!currentGameInfo || currentGameInfo.gamename !== me.gamename) {
    currentGameInfo = OrgTorchData.create();
  }

  let portal;
  let [tkeys, hkeys, dkeys] = [0, 0, 0];
  let [brains, eyes, horns] = [0, 0, 0];
  
  me.getItemsEx()
    .filter(i => i.isInStorage && !Town.ignoreType(i.itemType) && i.quality === sdk.items.quality.Normal)
    .forEach(i => {
      switch (i.classid) {
      case sdk.items.quest.KeyofTerror:
        return (tkeys++);
      case sdk.items.quest.KeyofHate:
        return (hkeys++);
      case sdk.items.quest.KeyofDestruction:
        return (dkeys++);
      case sdk.items.quest.DiablosHorn:
        return (horns++);
      case sdk.items.quest.MephistosBrain:
        return (brains++);
      case sdk.items.quest.BaalsEye:
        return (eyes++);
      default: return 0;
      }
    });

  // Do town chores and quit if MakeTorch is true and we have a torch.
  checkTorch();

  // Wait for other bots to drop off their keys. This works only if TorchSystem.js is configured properly.
  Config.OrgTorch.WaitForKeys && TorchSystem.waitForKeys();

  Town.goToTown(5);
  Town.move("stash");

  let redPortals = getUnits(sdk.unittype.Object, sdk.objects.RedPortal)
    .filter(el => [
      sdk.areas.MatronsDen, sdk.areas.ForgottenSands,
      sdk.areas.FurnaceofPain, sdk.areas.UberTristram
    ].includes(el.objtype));
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

  // End the script if we don't have enough keys nor organs
  if ((tkeys < keySetsReq || hkeys < keySetsReq || dkeys < keySetsReq)
    && (brains < 1 || eyes < 1 || horns < 1) && !tristOpen) {
    console.log("Not enough keys or organs.");
    OrgTorchData.remove();

    return true;
  }

  Config.UseMerc = false;

  // We have enough keys, do mini ubers
  if (tkeys >= keySetsReq && hkeys >= keySetsReq && dkeys >= keySetsReq) {
    getFade();
    Town.goToTown(5);
    console.log("Making organs.");
    D2Bot.printToConsole("OrgTorch: Making organs.", sdk.colors.D2Bot.DarkGold);
    Town.move("stash");

    // there are already open portals lets check our info on them
    if (miniPortals > 0) {
      for (let i = 0; i < miniPortals; i++) {
        // mini-portal is up but its not in our done areas, probably chickend during it, lets try again
        if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain].includes(redPortals[i].objtype)
          && !currentGameInfo.doneAreas.includes(redPortals[i].objtype)) {
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
  brains = me.findItems("mbr", sdk.items.mode.inStorage).length || 0;
  eyes = me.findItems("bey", sdk.items.mode.inStorage).length || 0;
  horns = me.findItems("dhn", sdk.items.mode.inStorage).length || 0;

  // We have enough organs, do Tristram - or trist is open we may have chickened and came back so check it
  // if trist was already open when we joined should we run that first?
  if ((brains && eyes && horns) || tristOpen) {
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
}
