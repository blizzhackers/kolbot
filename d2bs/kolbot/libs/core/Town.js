/**
*  @filename    Town.js
*  @author      kolton, theBGuy
*  @desc        do town chores like buying, selling and gambling
*
*/

const Town = {
  telekinesis: true,
  sellTimer: getTickCount(), // shop speedup test
  lastChores: 0,

  act: {
    1: {
      spot: (function () {
        const _spot = {};
        _spot.stash = [0, 0];
        _spot[NPC.Warriv] = [0, 0];
        _spot[NPC.Cain] = [0, 0];
        _spot[NPC.Kashya] = [0, 0];
        _spot[NPC.Akara] = [0, 0];
        _spot[NPC.Charsi] = [0, 0];
        _spot[NPC.Gheed] = [0, 0];
        _spot.portalspot = [0, 0];
        _spot.waypoint = [0, 0];
        _spot.initialized = false;
        return _spot;
      })(),
    },
    2: {
      spot: (function () {
        const _spot = {};
        _spot[NPC.Fara] = [5124, 5082];
        _spot[NPC.Cain] = [5124, 5082];
        _spot[NPC.Lysander] = [5118, 5104];
        _spot[NPC.Greiz] = [5033, 5053];
        _spot[NPC.Elzix] = [5032, 5102];
        _spot[NPC.Jerhyn] = [5088, 5153];
        _spot[NPC.Meshif] = [5205, 5058];
        _spot[NPC.Drognan] = [5097, 5035];
        _spot[NPC.Atma] = [5137, 5060];
        _spot[NPC.Warriv] = [5152, 5201];
        _spot.palace = [5088, 5153];
        _spot.sewers = [5221, 5181];
        _spot.portalspot = [5168, 5060];
        _spot.stash = [5124, 5076];
        _spot.waypoint = [5070, 5083];
        _spot.initialized = true;
        return _spot;
      })(),
    },
    3: {
      spot: (function () {
        const _spot = {};
        _spot[NPC.Meshif] = [5118, 5168];
        _spot[NPC.Hratli] = [5223, 5048, 5127, 5172];
        _spot[NPC.Ormus] = [5129, 5093];
        _spot[NPC.Asheara] = [5043, 5093];
        _spot[NPC.Alkor] = [5083, 5016];
        _spot[NPC.Cain] = [5148, 5066];
        _spot.stash = [5144, 5059];
        _spot.portalspot = [5150, 5063];
        _spot.waypoint = [5158, 5050];
        _spot.initialized = true;
        return _spot;
      })(),
    },
    4: {
      spot: (function () {
        const _spot = {};
        _spot[NPC.Cain] = [5027, 5027];
        _spot[NPC.Halbu] = [5089, 5031];
        _spot[NPC.Tyrael] = [5027, 5027];
        _spot[NPC.Jamella] = [5088, 5054];
        _spot.stash = [5022, 5040];
        _spot.portalspot = [5045, 5042];
        _spot.waypoint = [5043, 5018];
        _spot.initialized = true;
        return _spot;
      })(),
    },
    5: {
      spot: (function () {
        const _spot = {};
        _spot[NPC.Larzuk] = [5141, 5045];
        _spot[NPC.Malah] = [5078, 5029];
        _spot[NPC.Cain] = [5119, 5061];
        _spot[NPC.Qual_Kehk] = [5066, 5083];
        _spot[NPC.Anya] = [5112, 5120];
        _spot[NPC.Nihlathak] = [5071, 5111];
        _spot.stash = [5129, 5061];
        _spot.portalspot = [5098, 5019];
        _spot.portal = [5118, 5120];
        _spot.waypoint = [5113, 5068];
        _spot.initialized = true;
        return _spot;
      })(),
    }
  },

  tasks: (function () {
    /**
     * @param {string} heal 
     * @param {string} shop 
     * @param {string} gamble 
     * @param {string} repair 
     * @param {string} merc 
     * @param {string} key 
     */
    let _taskObj = (heal, shop, gamble, repair, merc, key) => (
      { Heal: heal, Shop: shop, Gamble: gamble, Repair: repair, Merc: merc, Key: key, CainID: NPC.Cain }
    );
    return new Map([
      [1, _taskObj(NPC.Akara, NPC.Akara, NPC.Gheed, NPC.Charsi, NPC.Kashya, NPC.Akara)],
      [2, _taskObj(NPC.Fara, NPC.Drognan, NPC.Elzix, NPC.Fara, NPC.Greiz, NPC.Lysander)],
      [3, _taskObj(NPC.Ormus, NPC.Ormus, NPC.Alkor, NPC.Hratli, NPC.Asheara, NPC.Hratli)],
      [4, _taskObj(NPC.Jamella, NPC.Jamella, NPC.Jamella, NPC.Halbu, NPC.Tyrael, NPC.Jamella)],
      [5, _taskObj(NPC.Malah, NPC.Malah, NPC.Anya, NPC.Larzuk, NPC.Qual_Kehk, NPC.Malah)]
    ]);
  })(),

  ignoredItemTypes: [
    // Items that won't be stashed
    sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver, sdk.items.type.Book,
    sdk.items.type.Scroll, sdk.items.type.Key, sdk.items.type.HealingPotion,
    sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion,
    sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
  ],

  /**
   * @description Check if item type is included in the ignore types list
   * @param {number} type 
   * @returns {boolean} If it is an item in the list
   */
  ignoreType: function (type) {
    return Town.ignoredItemTypes.includes(type);
  },

  /**
   * @param {boolean} repair
   */
  doChores: function (repair = false) {
    console.info(true, null, "doChores");

    /**
     * @todo Pre-build task list so we can more efficiently peform our chores
     */

    !me.inTown && Town.goToTown();
    const readyInTown = function () {
      return me.gameReady && me.inTown;
    };
    if (!Misc.poll(readyInTown, 2000, 250)) {
      throw new Error("Failed to go to town for chores");
    }

    try {
      Pather.allowBroadcast = false;
      if (Config.FastPick && new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
        // shopping causes this to bug out sometimes so remove it for duration of chores
        removeEventListener("itemaction", Pickit.itemEvent);
      }

      const preAct = me.act;
      // Burst of speed while in town
      if (Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
        Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.hand.Right);
      }

      me.switchToPrimary();

      Town.heal();
      Town.identify();
      Town.clearInventory();
      Town.fillTome(sdk.items.TomeofTownPortal);
      Town.buyPotions();
      Config.FieldID.Enabled && Town.fillTome(sdk.items.TomeofIdentify);
      Town.shopItems();
      Town.buyKeys();
      Town.repair(repair);
      Town.gamble();
      Town.reviveMerc();
      Cubing.doCubing();
      Runewords.makeRunewords();
      Town.stash(true);
      Town.checkQuestItems();
      !!me.getItem(sdk.items.TomeofTownPortal) && Town.clearScrolls();

      me.act !== preAct && Town.goToTown(preAct);
      me.cancelUIFlags();
      !me.barbarian && Precast.haveCTA === -1 && Precast.doPrecast(false);

      delay(250);
      console.info(false, null, "doChores");

      return true;
    } finally {
      if (Config.FastPick && new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
        addEventListener("itemaction", Pickit.itemEvent);
      }
      
      Pather.allowBroadcast = true;
      Town.lastChores = getTickCount();
    }
  },

  /**
   * @todo Only use names from the NPC object
   * @param {string} name 
   * @param {boolean} cancel 
   * @returns {boolean | Unit}
   */
  npcInteract: function (name = "", cancel = true) {
    // what about finding the closest name in case someone mispells it?
    const npcKey = Object.keys(NPC).find(function (key) {
      return String.isEqual(key, name);
    });
    if (!npcKey) {
      // @todo handle if NPC object key is used instead of common name
      console.warn("Couldn't find " + name + " in NPC object");
      return false;
    }
    const npcName = NPC[npcKey];

    !me.inTown && Town.goToTown();
    
    if (!NPC.getAct(npcName).includes(me.act)) {
      Town.goToTown(NPC.getAct(npcName).first());
    }

    me.cancelUIFlags();

    switch (npcName) {
    case NPC.Jerhyn:
      !Game.getNPC(NPC.Jerhyn) && Town.move("palace");
      break;
    case NPC.Hratli:
      if (!me.getQuest(sdk.quest.id.SpokeToHratli, sdk.quest.states.Completed)) {
        Town.move(NPC.Meshif);
        break;
      }
      // eslint-disable-next-line no-fallthrough
    default:
      Town.move(npcName);
    }

    let npc = Game.getNPC(npcName);

    // In case Jerhyn is by Warriv
    if (npcName === NPC.Jerhyn && !npc) {
      me.cancel();
      Pather.moveTo(5166, 5206);
      npc = Game.getNPC(npcName);
    }

    Packet.flash(me.gid);
    delay(40);

    if (npc && npc.openMenu()) {
      cancel && me.cancel();
      return npc;
    }

    return false;
  },

  /**
   * @description handle quest consumables if we have them
   */
  checkQuestItems: function () {
    // Act 1
    // Tools of the trade
    if (!me.smith) {
      if (me.getItem(sdk.items.quest.HoradricMalus)) {
        Town.goToTown(1) && Town.npcInteract("charsi");
      }
    }

    // Act 2
    // Radament skill book
    if (!me.radament) {
      let book = me.getItem(sdk.quest.item.BookofSkill);
      if (book) {
        book.isInStash && Town.openStash();
        book.use();
      }
    }

    // Act 3
    // Figurine -> Golden Bird
    if (!me.goldenbird) {
      if (me.getItem(sdk.quest.item.AJadeFigurine)) {
        Town.goToTown(3) && Town.npcInteract("meshif");
      }

      // Golden Bird -> Ashes
      if (me.getItem(sdk.items.quest.TheGoldenBird)) {
        Town.goToTown(3) && Town.npcInteract("alkor");
      }

      // Potion of life
      let pol = me.getItem(sdk.quest.item.PotofLife);
      if (pol) {
        pol.isInStash && Town.openStash();
        pol.use();
      }
    }

    // LamEssen's Tome
    if (!me.lamessen) {
      let tome = me.getItem(sdk.quest.item.LamEsensTome);
      if (tome) {
        !me.inTown && Town.goToTown(3);
        tome.isInStash && Town.openStash() && Storage.Inventory.MoveTo(tome);
        Town.npcInteract("alkor");
      }
    }

    // Scroll of resistance
    if (!me.anya) {
      let sor = me.getItem(sdk.items.quest.ScrollofResistance);
      if (sor) {
        sor.isInStash && Town.openStash();
        sor.use();
      }
    }
  },

  /**
   * @description Start a task and return the NPC Unit
   * @param {string} task 
   * @param {string} reason 
   * @returns {boolean | Unit}
   */
  initNPC: function (task = "", reason = "undefined") {
    console.info(true, reason, "initNPC");
    task = task.capitalize(false);

    delay(250);

    /** @type {NPCUnit} */
    let npc = null;
    let wantedNpc = Town.tasks.get(me.act)[task] !== undefined
      ? Town.tasks.get(me.act)[task]
      : "undefined";
    const justUseClosest = (
      ["clearinventory", "sell"].includes(reason.toLowerCase())
      && !me.getUnids().length
    );
    
    if (getUIFlag(sdk.uiflags.NPCMenu)) {
      console.debug("Currently interacting with an npc");
      npc = getInteractedNPC();
    }

    try {
      if (npc) {
        let npcName = npc.name.toLowerCase();
        if (!justUseClosest && ((npcName !== wantedNpc)
          // Jamella gamble fix
          || (task === "Gamble" && npcName === NPC.Jamella))) {
          me.cancelUIFlags();
          npc = null;
        }
      } else {
        me.cancelUIFlags();
      }

      /**
       * we are just trying to clear our inventory, use the closest npc
       * Things to conisder:
       * - what if we have unid items? Should we use cain if he is closer than the npc with scrolls?
       * - what is our next task?
       * - would it be faster to change acts and use the closest npc?
       */
      if (justUseClosest) {
        let choices = new Set();
        let npcs = Town.tasks.get(me.act);
        let _needPots = me.needPotions();
        let _needRepair = me.needRepair().length > 0;
        if (_needPots && _needRepair) {
          if (me.act === 2) {
            choices = new Set([npcs.Key, npcs.Repair]);
          } else {
            choices = new Set([npcs.Key, npcs.Repair, npcs.Gamble, npcs.Shop]);
            // todo - handle when we are in normal and current act < 4
            // if we are going to go to a4 for potions anyway we should go ahead and change act
          }
        } else if (!_needPots && _needRepair) {
          choices.add(npcs.Repair);
        } else if (!_needPots && !_needRepair) {
          choices = new Set([npcs.Key, npcs.Repair, npcs.Gamble, npcs.Shop]);
        }
        if (choices.size) {
          console.log("closest npc choices", choices);
          wantedNpc = Array.from(choices.values()).sort(function (a, b) {
            return Town.getDistance(a) - Town.getDistance(b);
          }).first();
          console.debug("Choosing closest npc", wantedNpc);
        }
      }

      if (task === "Heal" && me.act === 2) {
        // lets see if we are closer to Atma than Fara
        if (Town.getDistance(NPC.Atma) < Town.getDistance(NPC.Fara)) {
          wantedNpc = NPC.Atma;
        }
      }

      if (!npc && wantedNpc !== "undefined") {
        npc = Game.getNPC(wantedNpc);

        if (!npc && Town.move(wantedNpc)) {
          npc = Game.getNPC(wantedNpc);
        }
      }

      if (!npc || npc.area !== me.area
        || (!getUIFlag(sdk.uiflags.NPCMenu) /* && !Town.move(wantedNpc) */ && !npc.openMenu())) {
        throw new Error("Couldn't interact with npc");
      }

      delay(40);

      switch (task) {
      case "Shop":
      case "Repair":
      case "Gamble":
        if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade(task)) {
          throw new Error("Failed to complete " + reason + " at " + npc.name);
        }
        break;
      case "Key":
        if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade(me.act === 3 ? "Repair" : "Shop")) {
          throw new Error("Failed to complete " + reason + " at " + npc.name);
        }
        break;
      case "CainID":
        Misc.useMenu(sdk.menu.IdentifyItems);
        me.cancelUIFlags();

        break;
      case "Heal":
        if (String.isEqual(npc.name, NPC.Atma)) {
          // prevent crash due to atma not being a shoppable npc
          me.cancelUIFlags();
        }
        break;
      }

      console.info(false, "Did " + reason + " at " + npc.name, "initNPC");
    } catch (e) {
      console.error(e);

      if (!!e.message && e.message === "Couldn't interact with npc") {
        // getUnit bug probably, lets see if going to different act helps
        let highestAct = me.highestAct;
        if (highestAct === 1) return false; // can't go to any of the other acts
        let myAct = me.act;
        let potentialActs = [1, 2, 3, 4, 5].filter(a => a <= highestAct && a !== myAct);
        let goTo = potentialActs[rand(0, potentialActs.length - 1)];
        Config.DebugMode.Town && console.debug("Going to Act " + goTo + " to see if it fixes getUnit bug");
        Town.goToTown(goTo);
      }

      return false;
    }

    Misc.poll(function () {
      return me.gameReady;
    }, 2000, 3);

    if (task === "Heal") {
      Config.DebugMode.Town && console.debug("Checking if we are frozen");
      if (me.getState(sdk.states.Frozen)) {
        console.log("We are frozen, lets unfreeze real quick with some thawing pots");
        Town.buyPots(2, sdk.items.ThawingPotion, true, true, npc);
      }
    }

    return npc;
  },

  /**
   * @description Go to a town healer if we are below certain hp/mp percent or have a status effect
   */
  heal: function () {
    if (!me.needHealing()) return true;
    return !!(Town.initNPC("Heal", "heal"));
  },

  buyPotions: function () {
    // Ain't got money fo' dat shyt
    if (me.gold < 1000) return false;

    me.clearBelt();
    const buffer = { hp: 0, mp: 0 };
    const beltSize = Storage.BeltSize();
    let [needPots, needBuffer, specialCheck] = [false, true, false];
    let col = Town.checkColumns(beltSize);

    const getNeededBuffer = function () {
      [buffer.hp, buffer.mp] = [0, 0];
      me.getItemsEx()
        .filter(function (p) {
          if (!p.isInInventory) return false;
          return (p.itemType === sdk.items.type.HealingPotion || p.itemType === sdk.items.type.ManaPotion);
        })
        .forEach(function (p) {
          if (p.itemType === sdk.items.type.HealingPotion) {
            buffer.hp++;
          } else {
            buffer.mp++;
          }
        });
    };

    // HP/MP Buffer
    (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

    // Check if we need to buy potions based on Config.MinColumn
    if (Config.BeltColumn.some(function (c, i) {
      return ["hp", "mp"].includes(c) && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize));
    })) {
      needPots = true;
    }

    // Check if we need any potions for buffers
    if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
      if (Config.BeltColumn.some(function (c, i) {
        return col[i] >= beltSize && (!needPots || c === "rv");
      })) {
        specialCheck = true;
      }
    }

    /**
     * @todo If we are set to cube rejuvs, allow buying potions once we have our gem
     */

    // We have enough potions in inventory
    (buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) && (needBuffer = false);

    // No columns to fill
    if (!needPots && !needBuffer) return true;
    // todo: buy the cheaper potions if we are low on gold or don't need the higher ones i.e have low mana/health pool
    // why buy potion that heals 225 (greater mana) if we only have sub 100 mana
    me.normal && me.highestAct >= 4 && me.act < 4 && Town.goToTown(4);

    let npc = Town.initNPC("Shop", "buyPotions");
    if (!npc) return false;

    // special check, sometimes our rejuv slot is empty but we do still need buffer. Check if we can buy something to slot there
    if (specialCheck && Config.BeltColumn.some(function (c, i) {
      return c === "rv" && col[i] >= beltSize;
    })) {
      let pots = [sdk.items.ThawingPotion, sdk.items.AntidotePotion, sdk.items.StaminaPotion];
      Config.BeltColumn.forEach(function (c, i) {
        if (c === "rv" && col[i] >= beltSize && pots.length) {
          let usePot = pots[0];
          let pot = npc.getItem(usePot);
          if (pot) {
            Storage.Inventory.CanFit(pot) && Packet.buyItem(pot, false);
            pot = me.getItemsEx(usePot, sdk.items.mode.inStorage)
              .filter(function (i) {
                return i.isInInventory;
              })
              .first();
            !!pot && Packet.placeInBelt(pot, i);
            pots.shift();
          } else {
            needBuffer = false; // we weren't able to find any pots to buy
          }
        }
      });
    }

    for (let i = 0; i < 4; i += 1) {
      if (col[i] > 0) {
        const useShift = Town.shiftCheck(col, beltSize);
        let pot = Town.getPotion(npc, Config.BeltColumn[i]);

        if (pot) {
          // console.log("ÿc2column ÿc0" + i + "ÿc2 needs ÿc0" + col[i] + " ÿc2potions");
          // Shift+buy will trigger if there's no empty columns or if only the current column is empty
          if (useShift) {
            pot.buy(true);
          } else {
            for (let j = 0; j < col[i]; j += 1) {
              pot.buy(false);
            }
          }
        }
      }

      col = Town.checkColumns(beltSize); // Re-initialize columns (needed because 1 shift-buy can fill multiple columns)
    }
    
    // re-check
    !needBuffer && (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

    if (needBuffer && buffer.hp < Config.HPBuffer) {
      for (let i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
        let pot = Town.getPotion(npc, "hp");
        !!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
      }
    }

    if (needBuffer && buffer.mp < Config.MPBuffer) {
      for (let i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
        let pot = Town.getPotion(npc, "mp");
        !!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
      }
    }

    return true;
  },

  /**
   * @description Check when to shift-buy potions
   * @param {number} col 
   * @param {0 | 1 | 2 | 3 | 4} beltSize 
   */
  shiftCheck: function (col, beltSize) {
    let fillType;

    for (let i = 0; i < col.length; i += 1) {
      // Set type based on non-empty column
      if (!fillType && col[i] > 0 && col[i] < beltSize) {
        fillType = Config.BeltColumn[i];
      }

      if (col[i] >= beltSize) {
        switch (Config.BeltColumn[i]) {
        case "hp":
          !fillType && (fillType = "hp");
          if (fillType !== "hp") return false;

          break;
        case "mp":
          !fillType && (fillType = "mp");
          if (fillType !== "mp") return false;

          break;
        case "rv": // Empty rejuv column = can't shift-buy
          return false;
        }
      }
    }

    return true;
  },

  /**
   * @description Return column status (needed potions in each column)
   * @param {0 | 1 | 2 | 3 | 4} beltSize 
   * @returns {[number, number, number, number]}
   */
  checkColumns: function (beltSize) {
    (typeof beltSize !== "number" || beltSize < 0 || beltSize > 4) && (beltSize = Storage.BeltSize());
    let col = [beltSize, beltSize, beltSize, beltSize];
    let pot = me.getItem(-1, sdk.items.mode.inBelt);

    // No potions
    if (!pot) return col;

    do {
      col[pot.x % 4] -= 1;
    } while (pot.getNext());

    return col;
  },

  /**
   * @description Get the highest potion from current npc
   * @param {Unit} npc 
   * @param {"hp" | "mp"} type 
   * @param {1 | 2 | 3 | 4 | 5} highestPot 
   * @returns {boolean | ItemUnit}
   */
  getPotion: function (npc, type, highestPot = 5) {
    if (!type) return false;
    if (type !== "hp" && type !== "mp") return false;

    for (let i = highestPot; i > 0; i -= 1) {
      let result = npc.getItem(type + i);

      if (result) {
        return result;
      }
    }

    return false;
  },

  /** 
   * @param {number} classid
   */
  fillTome: function (classid) {
    if (me.gold < 450) return false;
    if (me.checkScrolls(classid) >= 13) return true;

    let npc = Town.initNPC("Shop", "fillTome");
    if (!npc) return false;

    if (classid === sdk.items.TomeofTownPortal && !me.getTome(sdk.items.TomeofTownPortal)) {
      let tome = npc.getItem(sdk.items.TomeofTownPortal);

      if (tome && Storage.Inventory.CanFit(tome)) {
        try {
          tome.buy();
        } catch (e1) {
          console.log(e1);
          // Couldn't buy the tome, don't spam the scrolls
          return false;
        }
      } else {
        return false;
      }
    }

    const scrollID = classid === sdk.items.TomeofTownPortal
      ? sdk.items.ScrollofTownPortal
      : sdk.items.ScrollofIdentify;
    let scroll = npc.getItem(scrollID);
    if (!scroll) return false;

    try {
      scroll.buy(true);
    } catch (e2) {
      console.log(e2.message);

      return false;
    }

    return true;
  },

  /**
   * @deprecated use `me.checkScrolls` instead
   * @param {number} id 
   * @returns {number} quantity of scrolls in tome
   */
  checkScrolls: function (id) {
    return me.checkScrolls(id);
  },

  identify: function () {
    !me.inShop && me.cancelUIFlags();
    if (Town.cainID()) return true;
    
    let list = (Storage.Inventory.Compare(Config.Inventory) || []);
    if (list.length === 0) return false;

    // Avoid unnecessary NPC visits
    // Only unid items or sellable junk (low level) should trigger a NPC visit
    if (!list.some(function (item) {
      const unid = !item.identified;
      const results = [Pickit.Result.UNID, Pickit.Result.TRASH];
      return ((unid || Config.LowGold > 0) && (results.includes(Pickit.checkItem(item).result)));
    })) {
      return false;
    }

    let npc = Town.initNPC("Shop", "identify");
    if (!npc) return false;

    let tome = me.getTome(sdk.items.TomeofIdentify);
    if (!!tome && tome.getStat(sdk.stats.Quantity) < list.length) {
      Town.fillTome(sdk.items.TomeofIdentify);
    }

    MainLoop:
    while (list.length > 0) {
      const item = list.shift();
      if (item.identified || !item.isInInventory || Town.ignoreType(item.itemType)) continue;
      let result = Pickit.checkItem(item);

      switch (result.result) {
      // Items for gold, will sell magics, etc. w/o id, but at low levels
      // magics are often not worth iding.
      case Pickit.Result.TRASH:
        Item.logger("Sold", item);
        item.sell();

        break;
      case Pickit.Result.UNID:
        let idTool = tome ? tome : me.getIdTool();

        if (idTool) {
          Town.identifyItem(item, idTool);
        } else {
          let scroll = npc.getItem(sdk.items.ScrollofIdentify);

          if (scroll) {
            if (!Storage.Inventory.CanFit(scroll)) {
              let tpTome = me.getTome(sdk.items.TomeofTownPortal);

              if (tpTome) {
                tpTome.sell();
              }
            }

            delay(500);

            Storage.Inventory.CanFit(scroll) && scroll.buy();
          }

          scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

          if (!scroll) {
            break MainLoop;
          }

          Town.identifyItem(item, scroll);
        }

        result = Pickit.checkItem(item);

        switch (result.result) {
        case Pickit.Result.WANTED:
          Item.logger("Kept", item);
          Item.logItem("Kept", item, result.line);

          break;
        case Pickit.Result.UNID:
        case Pickit.Result.RUNEWORD: // (doesn't trigger normally)
          break;
        case Pickit.Result.CUBING:
          Item.logger("Kept", item, "Cubing-Town");
          Cubing.update();

          break;
        case Pickit.Result.CRAFTING:
          Item.logger("Kept", item, "CraftSys-Town");
          CraftingSystem.update(item);

          break;
        default:
          Item.logger("Sold", item);
          item.sell();

          let timer = getTickCount() - Town.sellTimer; // shop speedup test

          if (timer > 0 && timer < 500) {
            delay(timer);
          }

          break;
        }

        break;
      }
    }

    Town.fillTome(sdk.items.TomeofTownPortal); // Check for TP tome in case it got sold for ID scrolls

    return true;
  },

  cainID: function () {
    // Not enabled or Check if we may use Cain - minimum gold
    if (!Config.CainID.Enable || me.gold < Config.CainID.MinGold) return false;

    // Check if we're already in a shop. It would be pointless to go to Cain if so.
    let npc = getInteractedNPC();
    if (npc && npc.name.toLowerCase() === Town.tasks.get(me.act).Shop) return false;

    me.cancel();
    Town.stash(false);

    const unids = me.getUnids();
    if (!unids.length) return true;

    // Check if we may use Cain - number of unid items
    if (unids.length < Config.CainID.MinUnids) return false;

    // Check if we may use Cain - kept unid items
    for (let item of unids) {
      if (Pickit.checkItem(item).result > 0) return false;
    }

    let cain = Town.initNPC("CainID", "cainID");
    if (!cain) return false;

    for (let item of unids) {
      let result = Pickit.checkItem(item);

      switch (result.result) {
      case Pickit.Result.UNWANTED:
        Item.logger("Dropped", item, "cainID");
        item.drop();

        break;
      case Pickit.Result.WANTED:
        Item.logger("Kept", item);
        Item.logItem("Kept", item, result.line);

        break;
      default:
        break;
      }
    }
    return true;
  },

  /**
   * @param {ItemUnit} unit 
   * @param {ItemUnit} tome 
   * @param {Boolean} packetID 
   * @returns {boolean}
   */
  identifyItem: function (unit, tome, packetID = false) {
    if (!unit || unit.identified || !tome) return false;
    if (Config.PacketShopping || packetID) return Packet.identifyItem(unit, tome);

    Town.sellTimer = getTickCount(); // shop speedup test

    const idOnCursor = function () {
      return getCursorType() === sdk.cursortype.Identify;
    };
    const unitIdentified = function () {
      return unit.identified;
    };

    for (let i = 0; i < 3; i += 1) {
      clickItem(sdk.clicktypes.click.item.Right, tome);

      if (Misc.poll(idOnCursor, 500, 10)) {
        break;
      }
    }

    if (!idOnCursor()) return false;

    delay(270);

    for (let i = 0; i < 3; i += 1) {
      if (idOnCursor()) {
        clickItem(sdk.clicktypes.click.item.Left, unit);
      }

      if (Misc.poll(unitIdentified, 500, 10)) {
        delay(25);

        return true;
      }

      delay(300);
    }

    return false;
  },

  shopItems: function () {
    if (!Config.MiniShopBot) return true;
    
    let npc = getInteractedNPC();
    if (!npc || !npc.itemcount) return false;

    const items = npc.getItemsEx().filter(function (item) {
      return !Town.ignoreType(item.itemType);
    });
    if (!items.length) return false;

    console.log("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

    for (let item of items) {
      const { result, line } = Pickit.checkItem(item);

      switch (result) {
      case Pickit.Result.WANTED:
      case Pickit.Result.CUBING:
      case Pickit.Result.CRAFTING:
      case Pickit.Result.RUNEWORD:
        try {
          if (Storage.Inventory.CanFit(item) && me.gold >= item.getItemCost(sdk.items.cost.ToBuy)) {
            Item.logger("Shopped", item);
            Item.logItem("Shopped", item, line);
            item.buy();
          }
        } catch (e) {
          console.error(e);
        }
      }

      delay(2);
    }

    return true;
  },

  /** @type {Set<number>} */
  gambleIds: new Set(),

  gamble: function () {
    if (!Town.needGamble() || Config.GambleItems.length === 0) return true;
    if (Town.gambleIds.size === 0) {
      // change text to classid
      for (let item of Config.GambleItems) {
        if (isNaN(item)) {
          if (NTIPAliasClassID.hasOwnProperty(item.replace(/\s+/g, "").toLowerCase())) {
            Town.gambleIds.add(NTIPAliasClassID[item.replace(/\s+/g, "").toLowerCase()]);
          } else {
            Misc.errorReport("ÿc1Invalid gamble entry:ÿc0 " + item);
          }
        } else {
          Town.gambleIds.add(item);
        }
      }
    }

    if (Town.gambleIds.size === 0) return true;

    // avoid Alkor
    me.act === 3 && Town.goToTown(2);
    let npc = Town.initNPC("Gamble", "gamble");

    if (!npc) return false;

    let list = [];
    let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

    while (items && items.length > 0) {
      list.push(items.shift().gid);
    }

    while (me.gold >= Config.GambleGoldStop) {
      !getInteractedNPC() && npc.startTrade("Gamble");

      let item = npc.getItem();
      items = [];

      if (item) {
        do {
          if (Town.gambleIds.has(item.classid)) {
            items.push(copyUnit(item));
          }
        } while (item.getNext());

        for (let item of items) {
          if (!Storage.Inventory.CanFit(item)) {
            return false;
          }

          me.overhead("Buy: " + item.name);
          item.buy(false, true);
          let newItem = Town.getGambledItem(list);

          if (newItem) {
            let result = Pickit.checkItem(newItem);

            switch (result.result) {
            case Pickit.Result.WANTED:
              Item.logger("Gambled", newItem);
              Item.logItem("Gambled", newItem, result.line);
              list.push(newItem.gid);

              break;
            case Pickit.Result.CUBING:
              list.push(newItem.gid);
              Cubing.update();

              break;
            case Pickit.Result.CRAFTING:
              CraftingSystem.update(newItem);

              break;
            default:
              Item.logger("Sold", newItem, "Gambling");
              me.overhead("Sell: " + newItem.name);
              newItem.sell();

              if (!Config.PacketShopping) {
                delay(500);
              }

              break;
            }
          }
        }
      }

      me.cancel();
    }

    return true;
  },

  needGamble: function () {
    return Config.Gamble && me.gold >= Config.GambleGoldStart;
  },

  /**
   * @param {ItemUnit[]} list 
   */
  getGambledItem: function (list = []) {
    let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

    for (let item of items) {
      if (list.indexOf(item.gid) === -1) {
        for (let j = 0; j < 3; j += 1) {
          if (item.identified) {
            break;
          }

          delay(100);
        }

        return item;
      }
    }

    return false;
  },

  /**
   * @param {number} quantity 
   * @param {number | string} type 
   * @param {boolean} [drink=false] 
   * @param {boolean} [force=false] 
   * @param {Unit} [npc=null] 
   */
  buyPots: function (quantity = 0, type = undefined, drink = false, force = false, npc = null) {
    if (!quantity || !type) return false;
    
    // convert to classid if isn't one
    typeof type === "string" && (type = (sdk.items[type.capitalize(true) + "Potion"] || false));
    if (!type) return false;

    // can't buy pots if we are full
    if (!Storage.Inventory.CanFit({ sizex: 1, sizey: 1 })) return false;

    // todo - change act in a3 if we are next to the wp as it's faster than going all the way to Alkor
    // todo - compare distance Ormus -> Alkor compared to Ormus -> WP -> Akara
    const potDealers = new Map([
      [1, NPC.Akara],
      [2, NPC.Lysander],
      [3, NPC.Alkor],
      [4, NPC.Jamella],
      [5, NPC.Malah],
    ]);
    let potDealer = potDealers.get(me.act);

    switch (type) {
    case sdk.items.ThawingPotion:
      // Don't buy if already at max res
      if (!force && me.coldRes >= 75) return true;
      console.info(null, "Current cold resistance: " + me.coldRes);

      break;
    case sdk.items.AntidotePotion:
      // Don't buy if already at max res
      if (!force && me.poisonRes >= 75) return true;
      console.info(null, "Current poison resistance: " + me.poisonRes);

      break;
    case sdk.items.StaminaPotion:
      // Don't buy if teleport or vigor
      if (!force && (Skill.canUse(sdk.skills.Vigor) || Pather.canTeleport())) return true;

      break;
    }

    if (potDealer === NPC.Alkor && Town.getDistance(potDealer) > 10) {
      Town.goToTown(me.highestAct >= 4 ? 4 : 1);
      potDealer = potDealers.get(me.act);
    }

    try {
      if (!!npc && npc.name.toLowerCase() === potDealer && !getUIFlag(sdk.uiflags.Shop)) {
        if (!npc.startTrade("Shop")) throw new Error("Failed to open " + npc.name + " trade menu");
      } else {
        me.cancelUIFlags();
        Town.move(potDealer);
        npc = Game.getNPC(potDealer);

        if (!npc || !npc.openMenu() || !npc.startTrade("Shop")) {
          throw new Error("Failed to open " + npc.name + " trade menu");
        }
      }
    } catch (e) {
      console.error(e);

      return false;
    }

    let pot = npc.getItem(type);
    if (!pot) {
      console.warn("Couldn't find " + type + " from " + npc.name);
      return false;
    }
    let name = (pot.name || "");

    console.info(null, "Buying " + quantity + " " + name + "s");

    for (let pots = 0; pots < quantity; pots++) {
      if (!!pot && Storage.Inventory.CanFit(pot)) {
        Packet.buyItem(pot, false);
      }
    }

    me.cancelUIFlags();
    drink && Town.drinkPots(type);

    return true;
  },

  /**
   * @param {number | string} type 
   * @param {boolean} [log=true] 
   * @returns {{ potName: string, quantity: number }}
   */
  drinkPots: function (type = undefined, log = true) {
    // convert to classid if isn't one
    typeof type === "string" && (type = (sdk.items[type.capitalize(true) + "Potion"] || false));

    let name = "";
    let quantity = 0;
    let chugs = me.getItemsEx(type).filter(pot => pot.isInInventory);

    if (chugs.length > 0) {
      name = chugs.first().name;
      chugs.forEach(function (pot) {
        if (!!pot && pot.use()) {
          quantity++;
        }
      });

      if (log && name) {
        console.info(null, "Drank " + quantity + " " + name + "s. Timer [" + Time.format(quantity * 30 * 1000) + "]");
      }
    } else {
      console.warn("couldn't find my pots");
    }

    return {
      potName: name,
      quantity: quantity
    };
  },

  buyKeys: function () {
    if (me.checkKeys() >= 6) return true;

    // avoid Hratli
    me.act === 3 && Town.goToTown(me.accessToAct(4) ? 4 : 2);

    let npc = Town.initNPC("Key", "buyKeys");
    if (!npc) return false;

    let key = npc.getItem("key");
    if (!key) return false;

    try {
      key.buy(true);
    } catch (e) {
      console.error(e);

      return false;
    }

    return true;
  },

  /** @deprecated Use `me.checkKeys` instead */
  checkKeys: function () {
    console.debug("Town.checkKeys is deprecated, use me.checkKeys instead");
    return me.checkKeys();
  },

  /** @deprecated Use `me.needKeys` instead */
  needKeys: function () {
    return me.needKeys();
  },

  /**
   * @deprecated Use `Cubing.repairIngredientCheck` instead
   * @param {ItemUnit} item - Rune
   */
  repairIngredientCheck: function (item) {
    return Cubing.repairIngredientCheck(item);
  },

  /**
   * @deprecated Use `Cubing.doRepairs` instead
   * @returns {boolean}
   */
  cubeRepair: function () {
    return Cubing.doRepairs();
  },

  /**
   * @deprecated Use `Cubing.repairItem` instead
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  cubeRepairItem: function (item) {
    return Cubing.repairItem(item);
  },

  /**
   * @param {boolean} [force=false] 
   */
  repair: function (force = false) {
    if (Cubing.doRepairs()) return true;

    let npc;
    let repairAction = me.needRepair();
    force && repairAction.indexOf("repair") === -1 && repairAction.push("repair");

    if (!repairAction || !repairAction.length) return true;

    for (let action of repairAction) {
      switch (action) {
      case "repair":
        me.act === 3 && Town.goToTown(me.accessToAct(4) ? 4 : 2);
        npc = Town.initNPC("Repair", "repair");
        if (!npc) return false;
        me.repair();

        break;
      case "buyQuiver":
        let bowCheck = Attack.usingBow();

        if (bowCheck) {
          let quiver = bowCheck === "bow" ? "aqv" : "cqv";
          let myQuiver = me.getItem(quiver, sdk.items.mode.Equipped);
          !!myQuiver && myQuiver.drop();
          
          npc = Town.initNPC("Repair", "repair");
          if (!npc) return false;

          quiver = npc.getItem(quiver);
          !!quiver && quiver.buy();
        }

        break;
      }
    }

    return true;
  },

  /** @deprecated Use `me.needRepair` instead */
  needRepair: function () {
    console.debug("me.needRepair is deprecated. Use me.needRepair instead.");
    return me.needRepair();
  },

  /**
   * @deprecated Use `me.getItemsForRepair` instead
   * @param {number} repairPercent 
   * @param {boolean} chargedItems 
   * @returns {ItemUnit[]}
   */
  getItemsForRepair: function (repairPercent, chargedItems) {
    console.debug("Town.getItemsForRepair is deprecated. Use me.getItemsForRepair instead.");

    return me.getItemsForRepair(repairPercent, chargedItems);
  },

  reviveMerc: function () {
    if (!me.needMerc()) return true;
    let preArea = me.area;

    // avoid Aheara
    me.act === 3 && Town.goToTown(me.accessToAct(4) ? 4 : 2);

    let npc = Town.initNPC("Merc", "reviveMerc");
    if (!npc) return false;

    MainLoop:
    for (let i = 0; i < 3; i += 1) {
      let dialog = getDialogLines();

      for (let lines = 0; lines < dialog.length; lines += 1) {
        if (dialog[lines].text.match(":", "gi")) {
          dialog[lines].handler();
          delay(Math.max(750, me.ping * 2));
        }

        // "You do not have enough gold for that."
        if (dialog[lines].text.match(getLocaleString(sdk.locale.dialog.youDoNotHaveEnoughGoldForThat), "gi")) {
          return false;
        }
      }

      let tick = getTickCount();

      while (getTickCount() - tick < 2000) {
        if (!!me.getMerc()) {
          delay(Math.max(750, me.ping * 2));

          break MainLoop;
        }

        delay(200);
      }
    }

    Attack.checkInfinity();

    if (!!me.getMerc()) {
      // Cast BO on merc so he doesn't just die again. Only do this is you are a barb or actually have a cta. Otherwise its just a waste of time.
      if (Config.MercWatch && Precast.needOutOfTownCast()) {
        console.log("MercWatch precast");
        Precast.doRandomPrecast(true, preArea);
      }

      return true;
    }

    return false;
  },

  /** @deprecated Use `me.needMerc` instead */
  needMerc: function () {
    console.debug("Town.needMerc is deprecated. Use me.needMerc instead.");
    return me.needMerc();
  },

  /**
   * @param {ItemUnit} item 
   */
  canStash: function (item) {
    if (Town.ignoreType(item.itemType)
      || [sdk.items.quest.HoradricStaff, sdk.items.quest.KhalimsWill].includes(item.classid)
      || !Town.canStashGem(item)) {
      return false;
    }
    /**
     * @todo add sorting here first if we can't fit the item
     */
    return Storage.Stash.CanFit(item);
  },

  /**
   * get ordered list of gems in inventory to use with Gem Hunter Script
   * @returns {ItemUnit[]} ordered list of relevant gems
   */
  getGemsInInv: function () {
    let GemList = Config.GemHunter.GemList;
    return me.getItemsEx()
      .filter((p) => p.isInInventory && GemList.includes(p.classid))
      .sort((a, b) => GemList.indexOf(a.classid) - GemList.indexOf(b.classid));
  },

  /**
   * get ordered list of gems in stash to use with Gem Hunter Script
   * @returns {ItemUnit[]} ordered list of relevant gems
   */
  getGemsInStash: function () {
    let GemList = Config.GemHunter.GemList;
    return me.getItemsEx()
      .filter((p) => p.isInStash && GemList.includes(p.classid))
      .sort((a, b) => GemList.indexOf(a.classid) - GemList.indexOf(b.classid));
  },

  /**
   * gem check for use with Gem Hunter Script
   * @param {ItemUnit} item 
   * @returns {boolean} if we should stash this gem
   */
  canStashGem: function (item) {
    // we aren't using the gem hunter script or we aren't scanning for the gem shrines while moving
    // for now we are only going to keep a gem in our invo while the script is active
    if (Loader.scriptName() !== "GemHunter") return true;
    // not in our list
    if (Config.GemHunter.GemList.indexOf(item.classid) === -1) return true;

    let GemList = Config.GemHunter.GemList;
    let gemsInStash = Town.getGemsInStash();
    let bestGeminStash = gemsInStash.length > 0 ? gemsInStash.first().classid : -1;
    let gemsInInvo = Town.getGemsInInv();
    let bestGeminInv = gemsInInvo.length > 0 ? gemsInInvo.first().classid : -1;

    return (
      (GemList.indexOf(bestGeminStash) < GemList.indexOf(bestGeminInv)) // better one in stash
      || (GemList.indexOf(bestGeminInv) < GemList.indexOf(item.classid)) // better one in inv
      || (gemsInInvo.filter((p) => p.classid === item.classid).length > 1));  // another one in inv
  },

  /**
   * move best gem from stash to inventory, if none in inventrory
   * to use with Gem Hunter Script
   * @returns {boolean} if any gem has been moved
   */
  getGem: function () {
    if (Loader.scriptName() === "GemHunter") {
      if (Town.getGemsInInv().length === 0 && Town.getGemsInStash().length > 0) {
        let gem = Town.getGemsInStash().first();
        Storage.Inventory.MoveTo(gem) && Item.logger("Inventoried", gem);
        return true;
      }
    }
    return false;
  },

  /**
   * @param {boolean} [stashGold=true] 
   * @returns {boolean}
   */
  stash: function (stashGold = true) {
    if (!me.needStash()) return true;

    me.cancelUIFlags();

    /** @type {ItemUnit[]} */
    let items = (Storage.Inventory.Compare(Config.Inventory) || [])
      .filter(function (item) {
        return !Town.ignoreType(item.itemType);
      });

    if (items && items.length) {
      Config.SortSettings.SortStash && Storage.Stash.SortItems();
      
      for (let item of items) {
        if (Town.canStash(item)) {
          let result = false;
          let pickResult = Pickit.checkItem(item).result;
          
          switch (true) {
          case pickResult > Pickit.Result.UNWANTED && pickResult < Pickit.Result.TRASH:
          case Cubing.keepItem(item):
          case Runewords.keepItem(item):
          case CraftingSystem.keepItem(item):
            result = true;

            break;
          default:
            break;
          }

          if (result) {
            Storage.Stash.MoveTo(item) && Item.logger("Stashed", item);
          }
        }
      }
    }

    // Stash gold
    if (stashGold) {
      if (me.getStat(sdk.stats.Gold) >= Config.StashGold
        && me.getStat(sdk.stats.GoldBank) < 25e5 && Town.openStash()) {
        gold(me.getStat(sdk.stats.Gold), 3);
        delay(1000); // allow UI to initialize
        me.cancel();
      }
    }

    return true;
  },

  /** @deprecated Use `me.needStash` instead */
  needStash: function () {
    console.debug("Town.needStash is deprecated, use me.needStash instead");
    return me.needStash();
  },

  openStash: function () {
    if (getUIFlag(sdk.uiflags.Cube) && !Cubing.closeCube(true)) return false;
    if (getUIFlag(sdk.uiflags.Stash)) return true;
    const stashOpened = function () {
      return getUIFlag(sdk.uiflags.Stash);
    };

    for (let i = 0; i < 5 && !stashOpened(); i += 1) {
      me.itemoncursor && Cubing.cursorCheck();
      me.cancel();

      if (Town.move("stash")) {
        let stash = Game.getObject(sdk.objects.Stash);

        if (stash) {
          let pingDelay = me.getPingDelay();

          if (Skill.useTK(stash)) {
            // Fix for out of range telek
            if (i > 0 && stash.distance > (23 - (i * 2))) {
              Pather.walkTo(stash.x, stash.y, (23 - (i * 2)));
            }
            Packet.telekinesis(stash);
          } else {
            Misc.click(0, 0, stash);
          }

          if (Misc.poll(stashOpened, Time.seconds(5), 100)) {
            // allow UI to initialize
            delay(100 + pingDelay * (i + 1));

            return true;
          }
        }
      }

      Packet.flash(me.gid);
    }

    return false;
  },

  getCorpse: function () {
    let corpse, corpseList = [];
    let timer = getTickCount();

    // No equipped items - high chance of dying in last game, force retries
    if (!me.getItem(-1, sdk.items.mode.Equipped)) {
      corpse = Misc.poll(() => Game.getPlayer(me.name, sdk.player.mode.Dead), 2500, 500);
    } else {
      corpse = Game.getPlayer(me.name, sdk.player.mode.Dead);
    }

    if (!corpse) return true;

    do {
      if (corpse.dead && corpse.name === me.name
        && (getDistance(me.x, me.y, corpse.x, corpse.y) <= 20 || me.inTown)) {
        corpseList.push(copyUnit(corpse));
      }
    } while (corpse.getNext());

    while (corpseList.length > 0) {
      if (me.dead) return false;

      let gid = corpseList[0].gid;

      Pather.moveToUnit(corpseList[0]);
      Misc.click(0, 0, corpseList[0]);
      delay(500);

      if (getTickCount() - timer > 3000) {
        let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
        !!coord && Pather.moveTo(coord.x, coord.y);
      }

      if (getTickCount() - timer > 30000) {
        D2Bot.console.logToConsole("Failed to get corpse, stopping.", sdk.colors.D2Bot.Red);
        D2Bot.stop();
      }

      !Game.getPlayer(-1, -1, gid) && corpseList.shift();
    }

    me.classic && Town.checkShard();
    // re-init skills since we started off without our body
    Skill.init();

    return true;
  },

  /**
   * @todo Whats the point of this?
   * @deprecated Use `me.checkShard` instead
   * @returns {boolean}
   */
  checkShard: function () {
    return me.checkShard();
  },

  /** @deprecated Use `me.clearBelt` */
  clearBelt: function () {
    console.debug("Town.clearBelt is deprecated, use me.clearBelt instead");

    return me.clearBelt();
  },

  clearScrolls: function () {
    const scrolls = me.getItemsEx()
      .filter(function (scroll) {
        return scroll.isInInventory && scroll.itemType === sdk.items.type.Scroll;
      });
    if (!scrolls.length) return false;
    const tpTome = scrolls.some(function (scroll) {
      return scroll.classid === sdk.items.ScrollofTownPortal;
    }) ? me.getTome(sdk.items.TomeofTownPortal) : false;
    const idTome = scrolls.some(function (scroll) {
      return scroll.classid === sdk.items.ScrollofIdentify;
    }) ? me.getTome(sdk.items.TomeofIdentify) : false;
    let currQuantity;

    for (let i = 0; !!scrolls && i < scrolls.length; i++) {
      switch (scrolls[i].classid) {
      case sdk.items.ScrollofTownPortal:
        if (tpTome && tpTome.getStat(sdk.stats.Quantity) < 20) {
          currQuantity = tpTome.getStat(sdk.stats.Quantity);
          if (scrolls[i].toCursor()) {
            clickItemAndWait(sdk.clicktypes.click.item.Left, tpTome.x, tpTome.y, tpTome.location);

            if (tpTome.getStat(sdk.stats.Quantity) > currQuantity) {
              console.info(null, "Placed scroll in tp tome");

              continue;
            }
          }
        }

        break;
      case sdk.items.ScrollofIdentify:
        if (idTome && idTome.getStat(sdk.stats.Quantity) < 20) {
          currQuantity = idTome.getStat(sdk.stats.Quantity);
          if (scrolls[i].toCursor()) {
            clickItemAndWait(sdk.clicktypes.click.item.Left, idTome.x, idTome.y, idTome.location);

            if (idTome.getStat(sdk.stats.Quantity) > currQuantity) {
              console.info(null, "Placed scroll in id tome");

              continue;
            }
          }
        }

        if (Config.FieldID.Enabled && !idTome) {
          // don't toss scrolls if we need them for field id but don't have a tome yet - low level chars
          continue;
        }

        break;
      }

      // Might as well sell the item if already in shop
      if (getUIFlag(sdk.uiflags.Shop)
        || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
        console.info(null, "Sell " + scrolls[i].name);
        Item.logger("Sold", scrolls[i]);
        scrolls[i].sell();
      } else {
        Item.logger("Dropped", scrolls[i], "clearScrolls");
        scrolls[i].drop();
      }
    }

    return true;
  },

  clearInventory: function () {
    console.info(true, null, "clearInventory");

    // If we are at an npc already, open the window otherwise moving potions around fails
    if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
      try {
        console.debug("Open npc menu");
        !!getInteractedNPC() && Misc.useMenu(sdk.menu.Trade);
      } catch (e) {
        console.error(e);
        me.cancelUIFlags();
      }
    }
    
    // Remove potions in the wrong slot of our belt
    me.clearBelt();

    // Return potions from inventory to belt
    me.cleanUpInvoPotions();

    // Cleanup remaining potions
    Config.DebugMode.Town && console.debug("clearInventory: start clean-up remaining pots");
    let sellOrDrop = [];
    let potsInInventory = me.getItemsEx()
      .filter(function (p) {
        return p.isInInventory && [
          sdk.items.type.HealingPotion, sdk.items.type.ManaPotion,
          sdk.items.type.RejuvPotion, sdk.items.type.ThawingPotion,
          sdk.items.type.AntidotePotion, sdk.items.type.StaminaPotion
        ].includes(p.itemType);
      });

    if (potsInInventory.length > 0) {
      let [hp, mp, rv, specials] = [[], [], [], []];
      while (potsInInventory.length) {
        (function (p) {
          switch (p.itemType) {
          case sdk.items.type.HealingPotion:
            return (hp.push(p));
          case sdk.items.type.ManaPotion:
            return (mp.push(p));
          case sdk.items.type.RejuvPotion:
            return (rv.push(p));
          case sdk.items.type.ThawingPotion:
          case sdk.items.type.AntidotePotion:
          case sdk.items.type.StaminaPotion:
          default: // shuts d2bs up
            return (specials.push(p));
          }
        })(potsInInventory.shift());
      }

      /**
       * @param {ItemUnit} a 
       * @param {ItemUnit} b 
       * @returns {number}
       */
      let sortPots = function (a, b) {
        return a.classid - b.classid;
      };
      // ensures when clearing invo we don't sell high pots before low pots
      hp.sort(sortPots);
      mp.sort(sortPots);
      rv.sort(sortPots);

      // Cleanup healing potions
      while (hp.length > Config.HPBuffer) {
        sellOrDrop.push(hp.shift());
      }

      // Cleanup mana potions
      while (mp.length > Config.MPBuffer) {
        sellOrDrop.push(mp.shift());
      }

      // Cleanup rejuv potions
      while (rv.length > Config.RejuvBuffer) {
        sellOrDrop.push(rv.shift());
      }

      // Clean up special pots
      while (specials.length) {
        specials.shift().interact();
        delay(200);
      }
    }

    // Any leftover items from a failed ID (crashed game, disconnect etc.)
    Config.DebugMode.Town && console.debug("clearInventory: start invo clean-up");
    const ignoreTypes = [
      sdk.items.type.Book, sdk.items.type.Key,
      sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion
    ];
    let items = (Storage.Inventory.Compare(Config.Inventory) || [])
      .filter(function (item) {
        if (!item) return false;
        // Don't drop tomes, keys or potions or quest-items
        // Don't throw cubing/runeword/crafting ingredients
        if (ignoreTypes.indexOf(item.itemType) === -1 && item.sellable
          && !Cubing.keepItem(item) && !Runewords.keepItem(item) && !CraftingSystem.keepItem(item)) {
          return true;
        }
        return false;
      });

    // add leftovers from potion cleanup
    items = (items.length > 0
      ? items.concat(sellOrDrop)
      : sellOrDrop.slice(0)
    );

    if (items.length > 0) {
      /** @type {ItemUnit[]} */
      let sell = [];
      /** @type {ItemUnit[]} */
      let drop = [];
      // lets see if we have any items to sell
      items.forEach(function (item) {
        let result = Pickit.checkItem(item).result;
        switch (result) {
        case Pickit.Result.UNWANTED:
          return drop.push(item);
        case Pickit.Result.TRASH:
          return sell.push(item);
        }
        return false;
      });
      // we have items to sell, might as well sell the dropable items as well
      if (sell.length) {
        // should there be multiple attempts to interact with npc or if we fail should we move everything from the sell list to the drop list?
        let npc;
        for (let i = 0; i < 3 && !npc; i++) {
          npc = Town.initNPC("Shop", "clearInventory");
        }

        // now lets sell them items
        if (npc) {
          [].concat(sell, drop.filter((item) => item.sellable))
            .forEach(function (item) {
              let sold = false; // so we know to delay or not
              try {
                console.info(null, "Sell :: " + item.name);
                Item.logger("Sold", item);
                item.sell() && (sold = true);
              } catch (e) {
                console.error(e);
              }
              sold && delay(250); // would a rand delay be better?
            });
        }
        // now lets see if we need to drop anything, so lets exit the shop
        me.cancelUIFlags();
        drop = drop.filter(function (item) {
          return !!item && me.getItem(-1, sdk.items.mode.inStorage, item.gid);
        });
      }

      if (drop.length) {
        drop.forEach(function (item) {
          let drop = false; // so we know to delay or not
          try {
            console.info(null, "Drop :: " + item.name);
            Item.logger("Dropped", item, "clearInventory");
            item.drop() && (drop = true);
          } catch (e) {
            console.error(e);
          }
          drop && delay(50);
        });
      }
    }

    console.info(false, null, "clearInventory");

    return true;
  },

  initialize: function () {
    // console.log("Initialize town " + me.act);
    if (!Town.act[me.act].spot.initialized && me.act === 1) {
      // act 1 is the only act that needs to be initialized
      let wp = Game.getPresetObject(sdk.areas.RogueEncampment, sdk.objects.A1Waypoint);
      let fireUnit = Game.getPresetObject(sdk.areas.RogueEncampment, sdk.objects.A1TownFire);
      if (!fireUnit) return false;

      const fire = fireUnit.realCoords();
      Town.act[1].spot.stash = [fire.x - 7, fire.y - 12];
      Town.act[1].spot.fire = [fire.x, fire.y];
      Town.act[1].spot[NPC.Warriv] = [fire.x - 5, fire.y - 2];
      Town.act[1].spot[NPC.Cain] = [fire.x + 6, fire.y - 5];
      Town.act[1].spot[NPC.Kashya] = [fire.x + 14, fire.y - 4];
      Town.act[1].spot[NPC.Akara] = [fire.x + 56, fire.y - 30];
      Town.act[1].spot[NPC.Charsi] = [fire.x - 39, fire.y - 25];
      Town.act[1].spot[NPC.Gheed] = [fire.x - 34, fire.y + 36];
      Town.act[1].spot.portalspot = [fire.x + 10, fire.y + 18];
      Town.act[1].spot.waypoint = [wp.roomx * 5 + wp.x, wp.roomy * 5 + wp.y];
      Town.act[1].initialized = true;
    }

    return true;
  },

  /**
   * @param {string} spot 
   * @returns {number} distance to town location
   */
  getDistance: function (spot = "") {
    !me.inTown && Town.goToTown();
    !Town.act[me.act].initialized && Town.initialize();

    // Act 5 wp->portalspot override - ActMap.cpp crash
    if (me.act === 5 && spot === "portalspot"
      && getDistance(me.x, me.y, 5113, 5068) <= 8) {
      return [5098, 5018].distance;
    }

    if (typeof (Town.act[me.act].spot[spot]) === "object") {
      return Town.act[me.act].spot[spot].distance;
    } else {
      return Infinity;
    }
  },

  /**
   * @param {string} spot 
   * @param {boolean} [allowTK] 
   * @returns {boolean}
   */
  move: function (spot = "", allowTK = true) {
    !me.inTown && Town.goToTown();
    !Town.act[me.act].initialized && Town.initialize();

    // act 5 static paths, ActMap.cpp seems to have issues with A5
    // should other towns have static paths?
    if (me.act === 5) {
      /** @type {Array<[number, number]>} */
      let path = [];
      let returnWhenDone = false;
      
      // Act 5 wp->portalspot override - ActMap.cpp crash
      if (spot === "portalspot" && getDistance(me.x, me.y, 5113, 5068) <= 8) {
        path = [[5113, 5068], [5108, 5051], [5106, 5046], [5104, 5041], [5102, 5027], [5098, 5018]];
        returnWhenDone = true;
      }

      if (["stash", "waypoint"].includes(spot)) {
        // malah -> stash/wp
        if (getDistance(me.x, me.y, 5081, 5031) <= 10) {
          path = [[5089, 5029], [5093, 5021], [5101, 5027], [5107, 5043], [5108, 5052]];
        } else if (getDistance(me.x, me.y, 5099, 5020) <= 13) {
          // portalspot -> stash/wp
          path = [[5102, 5031], [5107, 5042], [5108, 5052]];
        }
      }

      if (path.length) {
        path.forEach(function (node) {
          Pather.walkTo(node[0], node[1]);
        });

        if (returnWhenDone) return true;
      }
    } else if (me.act === 2
      && me.x > 5122 && me.y <= 5049
      && !String.isEqual(spot, NPC.Atma)) {
      // we are inside the building, if Atma is blocking the entrance we need the side door
      let atma = Game.getNPC(NPC.Atma);
      console.debug(" me { x: " + me.x + ", y: " + me.y + " } atma { x: " + atma.x + ", y: " + atma.y + " }");
      // todo - might need to consider her targetx/y coords as well
      if (atma && (atma.x === 5136 || atma.x === 5137)
        && (atma.y >= 5048 && atma.y <= 5051)) {
        // yup dumb lady is blocking the door, take side door
        [[5140, 5038], [5148, 5031], [5154, 5025], [5161, 5030]].forEach(function (node) {
          Pather.walkTo(node[0], node[1]);
        });
      }
    }

    for (let i = 0; i < 3; i += 1) {
      i === 2 && (allowTK = false);
      if (Town.moveToSpot(spot, allowTK)) {
        return true;
      }

      Packet.flash(me.gid);
    }

    return false;
  },

  /**
   * @param {string} spot 
   * @param {boolean} [allowTK] 
   * @returns {boolean}
   */
  moveToSpot: function (spot = "", allowTK = true) {
    if (!Town.act[me.act].hasOwnProperty("spot")
      || !Town.act[me.act].spot.hasOwnProperty(spot)
      || typeof (Town.act[me.act].spot[spot]) !== "object") {
      return false;
    }
    if (Town.getDistance(spot) < 5) return true;

    const npcSpot = Object.values(NPC).includes(spot.toLowerCase());
    const longRange = (!Skill.haveTK && spot === "waypoint");
    const tkRange = (Skill.haveTK && allowTK && ["stash", "portalspot", "waypoint"].includes(spot));
    let townSpot = Town.act[me.act].spot[spot];

    if (longRange) {
      let path = getPath(me.area, townSpot[0], townSpot[1], me.x, me.y, 1, 8);

      if (path && path[1]) {
        townSpot = [path[1].x, path[1].y];
      }
    }

    for (let i = 0; i < townSpot.length; i += 2) {
      /** @type {PathNode} */
      const node = { x: townSpot[i], y: townSpot[i + 1] };
      // console.debug("moveToSpot: " + spot + " " + node.x + "/" + node.y + " from " + me.x + "/" + me.y);

      if (tkRange) {
        Pather.moveNear(townSpot[0], townSpot[1], 19);
      } else if (node.distance > 2) {
        if (npcSpot) {
          let npc = Game.getNPC(spot);
          if (npc && npc.distance < 5) return true;
          Pather.move(node, { callback: function () {
            let npc = Game.getNPC(spot);
            return npc && npc.distance < 5;
          } });
        } else {
          Pather.move(node, { retry: 3 });
        }
      }

      switch (spot) {
      case "stash":
        if (Game.getObject(sdk.objects.Stash)) {
          return true;
        }

        break;
      case "palace":
        if (Game.getNPC(NPC.Jerhyn)) {
          return true;
        }

        break;
      case "portalspot":
      case "sewers":
        if (tkRange && spot === "portalspot"
          && getDistance(me, townSpot[0], townSpot[1]) < 21) {
          return true;
        }

        if (node.distance < 10) {
          return true;
        }

        break;
      case "waypoint":
        let wp = Game.getObject("waypoint");
        if (wp) {
          !Skill.haveTK && wp.distance > 5 && Pather.moveToUnit(wp);
          return true;
        }

        break;
      default:
        if (Game.getNPC(spot)) {
          return true;
        }

        break;
      }
    }

    return false;
  },

  /**
   * @param {Act} act 
   * @param {boolean} [wpmenu=false] 
   * @returns {boolean}
   */
  goToTown: function (act = 0, wpmenu = false) {
    if (!me.inTown) {
      try {
        // this can save us spamming portals
        let oldPortal = Pather.getPortal(sdk.areas.townOf(me.area), me.name);
        if ((oldPortal && !Pather.usePortal(null, me.name, oldPortal))
          || !Pather.makePortal(true)) {
          console.warn("Town.goToTown: Failed to make TP");
        }
        if (!me.inTown && !Pather.usePortal(null, me.name)) {
          console.warn("Town.goToTown: Failed to take TP");
          if (!me.inTown && !Pather.usePortal(sdk.areas.townOf(me.area))) {
            throw new Error("Town.goToTown: Failed to take TP");
          }
        }
      } catch (e) {
        let tpTool = me.getTpTool();
        if (!tpTool && Misc.getPlayerCount() <= 1) {
          Misc.errorReport(new Error("Town.goToTown: Failed to go to town and no tps available. Restart."));
          scriptBroadcast("quit");
        } else {
          if (!Misc.poll(() => {
            if (me.inTown || me.dead) return true;
            let p = Game.getObject("portal");
            !!p && Misc.click(0, 0, p) && delay(100);
            Misc.poll(() => me.idle, 1000, 100);
            return me.inTown;
          }, 700, 100)) {
            // don't quit if this is a character that is allowed to die
            if (Config.LifeChicken > 0) {
              Misc.errorReport(new Error("Town.goToTown: Failed to go to town. Quiting."));
              scriptBroadcast("quit");
            }
          }
        }
      }
    }

    if (!act) return true;
    if (act < 1 || act > 5) throw new Error("Town.goToTown: Invalid act");
    if (act > me.highestAct) return false;

    if (act !== me.act) {
      try {
        Pather.useWaypoint(sdk.areas.townOfAct(act), wpmenu);
      } catch (WPError) {
        throw new Error("Town.goToTown: Failed use WP");
      }
    }

    return true;
  },

  /**
   * @param {boolean} [repair] 
   * @returns {boolean}
   */
  visitTown: function (repair = false) {
    console.info(true);

    if (me.inTown) {
      Town.doChores();
      Town.move("stash");

      return true;
    }

    if (!me.canTpToTown()) {
      console.warn("Unable to visit town");
      return false;
    }

    const preArea = me.area;
    const preAct = me.act;

    // not an essential function -> handle thrown errors
    try {
      Town.goToTown();
    } catch (e) {
      return false;
    }

    Town.doChores(repair);

    me.act !== preAct && Town.goToTown(preAct);
    Town.move("portalspot");

    if (!Pather.usePortal(null, me.name)) {
      try {
        Pather.usePortal(preArea, me.name);
      } catch (e) {
        throw new Error("Town.visitTown: Failed to go back from town");
      }
    }

    Config.PublicMode && Pather.makePortal();
    console.info(false, "CurrentArea: " + getAreaName(me.area));

    return true;
  }
};
