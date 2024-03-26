/**
*  @filename    Questing.js
*  @author      kolton, theBGuy
*  @desc        Do simple quests, the ones that don't have a lot of pre-reqs for now
*
*/

// @notes: can't do duriel or meph because all the extra tasks. this is not meant to be autoplay or self rush

function Questing () {
  const log = (msg = "", errorMsg = false) => {
    me.overhead(msg);
    console.log("ÿc9(Questing) :: " + (errorMsg ? "ÿc1" : "ÿc0") + msg);
  };

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  const getQuestItem = (item) => {
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

  const den = function () {
    log("starting den");

    Town.doChores();
    if (!Pather.journeyTo(sdk.areas.DenofEvil)) throw new Error("den failed");
    Precast.doPrecast(true);
    Attack.clearLevel();
    Town.goToTown() && Town.npcInteract("Akara");
  };

  const smith = function () {
    log("starting smith");
    include("core/Common/Smith.js");
    Common.Smith();
  };

  const cain = function () {
    include("core/Common/Cain.js");
    log("starting cain");

    Town.doChores();
    Common.Cain.run();
  };

  const andy = function () {
    log("starting andy");

    Town.doChores();
    if (!Pather.journeyTo(sdk.areas.CatacombsLvl4)) throw new Error("andy failed");
    Pather.moveTo(22582, 9612);

    let coords = [
      { x: 22572, y: 9635 }, { x: 22554, y: 9618 },
      { x: 22542, y: 9600 }, { x: 22572, y: 9582 },
      { x: 22554, y: 9566 }
    ];

    if (Pather.useTeleport()) {
      Pather.moveTo(22571, 9590);
    } else {
      while (coords.length) {
        let andy = Game.getMonster(sdk.monsters.Andariel);

        if (andy && andy.distance < 15) {
          break;
        }

        Pather.moveToUnit(coords[0]);
        Attack.clearClassids(sdk.monsters.DarkShaman1);
        coords.shift();
      }
    }

    Attack.kill(sdk.monsters.Andariel);
    Town.goToTown();
    Town.npcInteract("Warriv", false);
    Misc.useMenu(sdk.menu.GoEast);
  };

  const radament = function () {
    log("starting radament");

    if (!Pather.journeyTo(sdk.areas.A2SewersLvl3)) {
      throw new Error("radament failed");
    }

    Precast.doPrecast(true);

    if (!Pather.moveToPreset(sdk.areas.A2SewersLvl3, sdk.unittype.Object, sdk.quest.chest.HoradricScrollChest)) {
      throw new Error("radament failed");
    }

    Attack.kill(sdk.monsters.Radament);

    let book = Game.getItem(sdk.quest.item.BookofSkill);
    getQuestItem(book);

    Town.goToTown();
    Town.npcInteract("Atma");
  };

  const lamEssen = function () {
    log("starting lam essen");

    if (!Pather.journeyTo(sdk.areas.RuinedTemple)) {
      throw new Error("Lam Essen quest failed");
    }

    Precast.doPrecast(true);

    if (!Pather.moveToPreset(sdk.areas.RuinedTemple, sdk.unittype.Object, sdk.quest.chest.LamEsensTomeHolder)) {
      throw new Error("Lam Essen quest failed");
    }

    Misc.openChest(sdk.quest.chest.LamEsensTomeHolder);
    let book = Misc.poll(() => Game.getItem(sdk.quest.item.LamEsensTome), 1000, 100);
    getQuestItem(book);
    Town.goToTown();
    Town.npcInteract("Alkor");
  };

  const izual = function () {
    log("starting izual");
    if (!Loader.runScript("Izual")) throw new Error("izual failed");
    Town.goToTown();
    Town.npcInteract("Tyrael");
  };

  const diablo = function () {
    log("starting diablo");
    if (!Loader.runScript("Diablo")) throw new Error();
    Town.goToTown(4);

    Game.getObject(sdk.objects.RedPortalToAct5)
      ? Pather.useUnit(sdk.unittype.Object, sdk.objects.RedPortalToAct5, sdk.areas.Harrogath)
      : Town.npcInteract("Tyrael", false) && Misc.useMenu(sdk.menu.TravelToHarrogath);
  };

  const shenk = function () {
    log("starting shenk");

    if (!Pather.useWaypoint(sdk.areas.FrigidHighlands, true)) {
      throw new Error("shenk failed");
    }

    Precast.doPrecast(true);
    Pather.moveTo(3883, 5113);
    Attack.kill(getLocaleString(sdk.locale.monsters.ShenktheOverseer));
    Town.goToTown();
    Town.npcInteract("Larzuk");
  };

  const barbs = function () {
    log("starting barb rescue");

    if (!Pather.useWaypoint(sdk.areas.FrigidHighlands, true)) {
      throw new Error("barbs failed");
    }
    Precast.doPrecast(true);

    let barbs = (Game.getPresetObjects(me.area, sdk.quest.chest.BarbCage) || []);
    if (!barbs.length) throw new Error("Couldn't find the barbs");

    let coords = [];

    // Dark-f: x-3
    for (let cage = 0; cage < barbs.length; cage += 1) {
      coords.push({
        x: barbs[cage].roomx * 5 + barbs[cage].x - 3,
        y: barbs[cage].roomy * 5 + barbs[cage].y
      });
    }

    for (let i = 0; i < coords.length; i += 1) {
      log((i + 1) + "/" + coords.length);
      Pather.moveToUnit(coords[i], 2, 0);
      let door = Game.getMonster(sdk.monsters.PrisonDoor);

      if (door) {
        Pather.moveToUnit(door, 1, 0);
        Attack.kill(door);
      }

      delay(1500 + me.ping);
    }

    Town.npcInteract("qual_kehk");
  };

  const anya = function () {
    log("starting anya");

    if (!Misc.checkQuest(sdk.quest.id.PrisonofIce, 8/** Recieved the scroll */)) {
      if (!Pather.journeyTo(sdk.areas.FrozenRiver)) {
        throw new Error("anya failed");
      }

      Precast.doPrecast(true);

      if (!Pather.moveToPreset(sdk.areas.FrozenRiver, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform)) {
        throw new Error("Anya quest failed");
      }

      delay(1000);

      let frozenanya = Game.getObject(sdk.objects.FrozenAnya);

      /**
       * Here we have issues sometimes
       * Including a check for her unfreezing in case we already have malah's potion
       * @todo
       * - tele char can lure frozenstein away from anya as he can be hard to kill
       * aggro the pack then move back until there isn't any monster around anya (note) we can only detect mobs around 40 yards of us
       * then should use a static location behind anya as our destination to tele to
       */
      if (frozenanya) {
        if (me.sorceress && Skill.haveTK) {
          Attack.getIntoPosition(frozenanya, 15, sdk.collision.LineOfSight, Pather.canTeleport(), true);
          Packet.telekinesis(frozenanya);
        } else {
          Pather.moveToUnit(frozenanya);
          Packet.entityInteract(frozenanya);
        }
        Misc.poll(() => getIsTalkingNPC() || frozenanya.mode, 2000, 50);
        me.cancel() && me.cancel();
      }

      Town.npcInteract("malah");

      /**
       * Now this should prevent us from re-entering if we either failed to interact with anya in the first place
       * or if we had malah's potion because this is our second attempt and we managed to unfreeze her
       */
      if (me.getItem(sdk.quest.item.MalahsPotion)) {
        console.log("Got potion, lets go unfreeze anya");

        if (!Misc.poll(() => {
          Pather.usePortal(sdk.areas.FrozenRiver, me.name);
          return me.inArea(sdk.areas.FrozenRiver);
        }, Time.seconds(30), 1000)) throw new Error("Anya quest failed - Failed to return to frozen river");

        frozenanya = Game.getObject(sdk.objects.FrozenAnya);	// Check again in case she's no longer there from first intereaction
        
        if (frozenanya) {
          for (let i = 0; i < 3; i++) {
            frozenanya.distance > 5 && Pather.moveToUnit(frozenanya, 1, 2);
            Packet.entityInteract(frozenanya);
            if (Misc.poll(() => frozenanya.mode, Time.seconds(2), 50)) {
              me.cancel() && me.cancel();
              break;
            }
            if (getIsTalkingNPC()) {
              // in case we failed to interact the first time this prevent us from crashing if her dialog is going
              me.cancel() && me.cancel();
            }
          }
        }
      }
    }

    /**
     * Now lets handle completing the quest as we have freed anya
     */
    if (Misc.checkQuest(sdk.quest.id.PrisonofIce, sdk.quest.states.ReqComplete)) {
      /**
       * Here we haven't talked to malah to recieve the scroll yet so lets do that
       */
      if (!Misc.checkQuest(sdk.quest.id.PrisonofIce, 8/** Recieved the scroll */)) {
        Town.npcInteract("malah");
      }

      /**
       * Here we haven't talked to anya to open the red portal
       */
      if (!Misc.checkQuest(sdk.quest.id.PrisonofIce, 9/** Talk to anya in town */)) {
        Town.npcInteract("anya");
      }

      /** Handles using the scroll, no need to repeat the same code here */
      let scroll = me.scrollofresistance;
      !!scroll && scroll.use();
    }
  };

  // @theBGuy
  const ancients = function () {
    include("core/Common/Ancients.js");
    log("starting ancients");
    Town.doChores();

    if (!Pather.journeyTo(sdk.areas.ArreatSummit)) throw new Error("ancients failed");

    // ancients prep
    Town.doChores();
    [sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.ThawingPotion]
      .forEach(p => Town.buyPots(10, p, true));

    let tempConfig = copyObj(Config); // save and update config settings
    let townChicken = getScript("threads/townchicken.js");
    townChicken && townChicken.running && townChicken.stop();

    Config.TownCheck = false;
    Config.MercWatch = false;
    Config.TownHP = 0;
    Config.TownMP = 0;
    Config.HPBuffer = 15;
    Config.MPBuffer = 15;
    Config.LifeChicken = 10;

    log("updated settings");

    Town.buyPotions();
    // re-enter Arreat Summit
    if (!Pather.usePortal(sdk.areas.ArreatSummit, me.name)) {
      log("Failed to take portal back to Arreat Summit", true);
      Pather.journeyTo(sdk.areas.ArreatSummit);
    }
    
    Precast.doPrecast(true);

    // move to altar
    if (!Pather.moveToPreset(sdk.areas.ArreatSummit, sdk.unittype.Object, sdk.quest.chest.AncientsAltar)) {
      log("Failed to move to ancients' altar", true);
    }

    Common.Ancients.touchAltar();
    Common.Ancients.startAncients(true);
    
    me.cancel();
    Config = tempConfig;
    log("restored settings");
    Precast.doPrecast(true);

    // reload town chicken in case we are doing others scripts after this one finishes
    let townChick = getScript("threads/TownChicken.js");
    if ((Config.TownHP > 0 || Config.TownMP > 0) && (townChick && !townChick.running || !townChick)) {
      load("threads/TownChicken.js");
    }

    try {
      if (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.Completed)) {
        Pather.moveToExit([sdk.areas.WorldstoneLvl1, sdk.areas.WorldstoneLvl2], true);
        Pather.getWP(sdk.areas.WorldstoneLvl2);
      }
    } catch (err) {
      log("Cleared Ancients. Failed to get WSK Waypoint", true);
    }
  };

  const baal = function () {
    log("starting baal");
    // just run baal script? I mean why re-invent the wheel here
    Loader.runScript("Baal");
    Town.goToTown(5);
  };

  const tasks = (function () {
    /**
     * @constructor
     * @param {function(): void} task 
     * @param {() => boolean} preReq 
     * @param {() => boolean} complete 
     */
    function Task (task, preReq, complete) {
      this.run = task;
      this.preReq = (preReq || (() => true));
      this.complete = (complete || (() => false));
    }
    return [
      new Task(den, () => true, () => me.den),
      new Task(smith, () => me.charlvl > 9, () => me.smith || me.imbue),
      new Task(cain, () => true, () => me.cain),
      new Task(andy, () => true, () => me.andariel),
      new Task(radament, () => me.accessToAct(2), () => me.radament),
      new Task(lamEssen, () => me.accessToAct(3), () => me.lamessen),
      new Task(izual, () => me.accessToAct(4), () => me.izual),
      new Task(diablo, () => me.accessToAct(4), () => me.diablo),
      new Task(shenk, () => me.accessToAct(5), () => me.shenk || me.larzuk),
      new Task(barbs, () => me.accessToAct(5), () => me.barbrescue),
      new Task(anya, () => me.accessToAct(5), () => me.anya),
      new Task(ancients, () => me.accessToAct(5) && me.charlvl > [20, 40, 60][me.diff], () => me.ancients),
      new Task(baal, () => me.accessToAct(5) && me.ancients, () => me.baal),
    ];
  })();

  !me.inTown && Town.doChores();

  for (let task of tasks) {
    if (task.preReq() && !task.complete()) {
      try {
        task.run();
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (Config.Questing.StopProfile || Loader.scriptList.length === 1) {
    D2Bot.printToConsole("All quests done. Stopping profile.", sdk.colors.D2Bot.Green);
    D2Bot.stop();
  } else {
    log("ÿc9(Questing) :: ÿc2Complete");
  }

  return true;
}
