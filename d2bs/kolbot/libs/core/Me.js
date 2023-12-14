/**
*  @filename    Me.js
*  @author      theBGuy
*  @desc        'me' prototypes
*
*/

// Ensure these are in polyfill.js
!isIncluded("Polyfill.js") && include("Polyfill.js");

/**
 * @desciption Set me.runwalk to 0 (walk)
 * @returns {void}
 */
me.walk = function () {
  me.runwalk = sdk.player.move.Walk;
};

/**
 * @desciption Set me.runwalk to 1 (run)
 * @returns {void}
 */
me.run = function () {
  me.runwalk = sdk.player.move.Run;
};

/**
 * @description Calling me.ping can bug sometimes so check if game is in ready state.
 * - Single-Player returns static ping of 25.
 * - Game not ready returns ping of 250
 * - ping < 10 returns 50
 * @returns {number} pingDelay
 */
me.getPingDelay = function () {
  // single-player
  if (!me.gameserverip) return 25;
  let pingDelay = me.gameReady ? me.ping : 250;
  pingDelay < 10 && (pingDelay = 50);
  return pingDelay;
};

/**
 * @description Find an item by classid, mode, loc, quality
 * @param {number} id 
 * @param {number} [mode] 
 * @param {number} [loc] 
 * @param {number} [quality] 
 * @returns {ItemUnit | false}
 */
me.findItem = function (id = -1, mode = -1, loc = -1, quality = -1) {
  let item = me.getItem(id, mode);

  if (item) {
    do {
      if ((loc === -1 || item.location === loc) && (quality === -1 || item.quality === quality)) {
        return item;
      }
    } while (item.getNext());
  }

  return false;
};

me.findItems = function (id = -1, mode = -1, loc = false) {
  let list = [];
  let item = me.getItem(id, mode);

  if (item) {
    do {
      if (!loc || item.location === loc) {
        list.push(copyUnit(item));
      }
    } while (item.getNext());
  }

  return list;
};

me.cancelUIFlags = function () {
  while (!me.gameReady) {
    delay(3);
  }

  const flags = [
    sdk.uiflags.Inventory, sdk.uiflags.StatsWindow,
    sdk.uiflags.SkillWindow, sdk.uiflags.NPCMenu,
    sdk.uiflags.Waypoint, sdk.uiflags.Party,
    sdk.uiflags.Shop, sdk.uiflags.Quest,
    sdk.uiflags.Stash, sdk.uiflags.Cube,
    sdk.uiflags.KeytotheCairnStonesScreen, sdk.uiflags.SubmitItem
  ];

  for (let i = 0; i < flags.length; i++) {
    if (getUIFlag(flags[i]) && me.cancel()) {
      delay(250);
      i = 0; // Reset
    }
  }
};

/**
 * @param {number} slot - 0 (Primary) or 1 (Secondary)
 * @returns {boolean}
 */
me.switchWeapons = function (slot) {
  if (this.gametype === sdk.game.gametype.Classic
    || (slot !== undefined && this.weaponswitch === slot)) {
    return true;
  }

  while (!me.gameReady) {
    delay(25);
  }

  let originalSlot = this.weaponswitch;
  let switched = false;
  /** @param {number[]} bytes */
  const packetHandler = function (bytes) {
    return bytes.length > 0
      && bytes[0] === sdk.packets.recv.WeaponSwitch && (switched = true) && false; // false to not block
  };
  try {
    addEventListener("gamepacket", packetHandler);

    for (let i = 0; i < 10; i += 1) {
      for (let j = 10; --j && me.idle;) {
        delay(3);
      }
      if (me.mode === sdk.player.mode.SkillActionSequence) {
        while (me.mode === sdk.player.mode.SkillActionSequence) {
          delay(3);
        }
      }

      i > 0 && delay(10);
      !switched && sendPacket(1, sdk.packets.send.SwapWeapon); // Swap weapons

      let tick = getTickCount();
      while (getTickCount() - tick < 300) {
        if (switched || originalSlot !== me.weaponswitch) {
          delay(50);
          return true;
        }

        delay(3);
      }
    }
  } finally {
    removeEventListener("gamepacket", packetHandler);
  }

  return false;
};

// Returns the number of frames needed to cast a given skill at a given FCR for a given char.
me.castingFrames = function (skillId, fcr, charClass) {
  if (skillId === undefined) return 0;

  fcr === undefined && (fcr = me.FCR);
  charClass === undefined && (charClass = this.classid);

  // https://diablo.fandom.com/wiki/Faster_Cast_Rate
  let effectiveFCR = Math.min(75, Math.floor(fcr * 120 / (fcr + 120)) | 0);
  let isLightning = skillId === sdk.skills.Lightning || skillId === sdk.skills.ChainLightning;
  let baseCastRate = [20, isLightning ? 19 : 14, 16, 16, 14, 15, 17][charClass];
  let animationSpeed = {
    normal: 256,
    human: 208,
    wolf: 229,
    bear: 228
  }[charClass === sdk.player.class.Druid ? (me.getState(sdk.states.Wolf) || me.getState(sdk.states.Bear)) : "normal"];
  return Math.ceil(
    256 * baseCastRate / Math.floor(animationSpeed * (100 + effectiveFCR) / 100) - (isLightning ? 0 : 1)
  );
};

// Returns the duration in seconds needed to cast a given skill at a given FCR for a given char.
me.castingDuration = function (skillId, fcr = me.FCR, charClass = me.classid) {
  return (me.castingFrames(skillId, fcr, charClass) / 25);
};

me.getWeaponQuantity = function (weaponLoc = sdk.body.RightArm) {
  let currItem = me.getItemsEx(-1, sdk.items.mode.Equipped)
    .filter(function (i) {
      return i.bodylocation === weaponLoc;
    })
    .first();
  return !!currItem ? currItem.getStat(sdk.stats.Quantity) : 0;
};

me.clearBelt = function () {
  let item = me.getItem(-1, sdk.items.mode.inBelt);
  let clearList = [];

  if (item) {
    do {
      switch (item.itemType) {
      case sdk.items.type.HealingPotion:
        if (Config.BeltColumn[item.x % 4] !== "hp") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.ManaPotion:
        if (Config.BeltColumn[item.x % 4] !== "mp") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.RejuvPotion:
        if (Config.BeltColumn[item.x % 4] !== "rv") {
          clearList.push(copyUnit(item));
        }

        break;
      case sdk.items.type.StaminaPotion:
      case sdk.items.type.AntidotePotion:
      case sdk.items.type.ThawingPotion:
        clearList.push(copyUnit(item));
      }
    } while (item.getNext());

    if (clearList.length > 0 && me.inShop) {
      console.debug("Currently inShop, canceling UI flags to clear belt");
      me.cancelUIFlags();
    }

    while (clearList.length > 0) {
      let pot = clearList.shift();
      (Storage.Inventory.CanFit(pot) && Storage.Inventory.MoveTo(pot)) || pot.interact();
      delay(200);
    }
  }

  return true;
};

me.cleanUpInvoPotions = function (beltSize) {
  beltSize === undefined && (beltSize = Storage.BeltSize());
  const beltMax = (beltSize * 4);
  /**
   * belt 4x4 locations
   * 12 13 14 15
   * 8  9  10 11
   * 4  5  6  7
   * 0  1  2  3
   */
  const beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];
  // check if we have empty belt slots
  const needCleanup = Storage.Belt.checkColumns(beltSize).some(slot => slot > 0);

  if (needCleanup) {
    const potsInInventory = me.getItemsEx()
      .filter(function (p) {
        return p.isInInventory
          && [
            sdk.items.type.HealingPotion,
            sdk.items.type.ManaPotion,
            sdk.items.type.RejuvPotion
          ].includes(p.itemType);
      })
      .sort(function (a, b) {
        return a.itemType - b.itemType;
      });

    if (potsInInventory.length > 0 && Config.DebugMode.Town) {
      console.debug("We have potions in our invo, put them in belt before we perform townchicken check");
    }
    // Start interating over all the pots we have in our inventory
    beltSize > 1 && potsInInventory.forEach(function (p) {
      let moved = false;
      // get free space in each slot of our belt
      let freeSpace = Storage.Belt.checkColumns(beltSize);
      for (let i = 0; i < 4 && !moved; i += 1) {
        // checking that current potion matches what we want in our belt
        if (freeSpace[i] > 0 && p.code && p.code.startsWith(Config.BeltColumn[i])) {
          // Pick up the potion and put it in belt if the column is empty, and we don't have any other columns empty
          // prevents shift-clicking potion into wrong column
          if (freeSpace[i] === beltSize || freeSpace.some((spot) => spot === beltSize)) {
            const x = freeSpace[i] === beltSize
              ? i
              : (beltCapRef[i] - (freeSpace[i] * 4));
            Packet.placeInBelt(p, x);
          } else {
            clickItemAndWait(sdk.clicktypes.click.item.ShiftLeft, p.x, p.y, p.location);
          }
          Misc.poll(function () {
            return !me.itemoncursor;
          }, 300, 30);
          moved = Storage.Belt.checkColumns(beltSize)[i] === freeSpace[i] - 1;
        }
        Cubing.cursorCheck();
      }
    });
  }

  return true;
};

me.needPotions = function () {
  // we aren't using MinColumn if none of the values are set
  if (!Config.MinColumn.some(el => el > 0)) return false;
  // no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
  if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
  
  // Start
  if (me.charlvl > 2 && me.gold > 1000) {
    const pots = {
      hp: [],
      mp: [],
    };
    me.getItemsEx(-1, sdk.items.mode.inBelt)
      .filter(p => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType) && p.x < 4)
      .forEach(p => {
        if (p.itemType === sdk.items.type.HealingPotion) {
          pots.hp.push(p);
        } else if (p.itemType === sdk.items.type.ManaPotion) {
          pots.mp.push(p);
        }
      });

    // quick check
    if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
      || (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
      return true;
    }

    // if we have no belt what should qualify is to go to town at this point?
    // we've confirmed having at least some potions in the above check
    // if (!me.inTown && Storage.BeltSize() === 1) return false;

    // should we check the actual amount in the column?
    // For now just keeping the way it was and checking if a column is empty
    for (let i = 0; i < 4; i += 1) {
      if (Config.MinColumn[i] <= 0) {
        continue;
      }

      switch (Config.BeltColumn[i]) {
      case "hp":
        if (!pots.hp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs hp pots");
          return true;
        }
        break;
      case "mp":
        if (!pots.mp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs mp pots");
          return true;
        }
        break;
      }
    }
  }

  return false;
};

me.needBeltPots = function () {
  // we aren't using MinColumn if none of the values are set
  if (!Config.MinColumn.some(el => el > 0)) return false;
  // no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
  if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
  
  // Start
  if (me.charlvl > 2 && me.gold > 1000) {
    let pots = { hp: [], mp: [], };
    const beltSize = Storage.BeltSize();
    
    // only run this bit if we aren't wearing a belt for now
    beltSize === 1 && me.cleanUpInvoPotions(beltSize);
    // now check what's in our belt
    me.getItemsEx(-1, sdk.items.mode.inBelt)
      .filter(function (p) {
        return p.x < 4
          && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
      })
      .forEach(function (p) {
        if (p.itemType === sdk.items.type.HealingPotion) {
          pots.hp.push(copyUnit(p));
        } else if (p.itemType === sdk.items.type.ManaPotion) {
          pots.mp.push(copyUnit(p));
        }
      });

    // quick check
    if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
      || (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
      return true;
    }

    // should we check the actual amount in the column?
    // For now just keeping the way it was and checking if a column is empty
    for (let i = 0; i < 4; i += 1) {
      if (Config.MinColumn[i] <= 0) {
        continue;
      }

      switch (Config.BeltColumn[i]) {
      case "hp":
        if (!pots.hp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs hp pots");
          return true;
        }
        break;
      case "mp":
        if (!pots.mp.some(p => p.x === i)) {
          console.debug("Column: " + (i + 1) + " needs mp pots");
          return true;
        }
        break;
      }
    }
  }

  return false;
};

me.needBufferPots = function () {
  // not using buffers
  if (Config.HPBuffer < 0 && Config.MPBuffer < 0) return false;
  
  // Start
  if (me.charlvl > 2 && me.gold > 1000) {
    const pots = { hp: 0, mp: 0, };
    const beltSize = Storage.BeltSize();
    
    // only run this bit if we aren't wearing a belt for now
    beltSize === 1 && me.cleanUpInvoPotions(beltSize);
    // now check what's in our belt
    me.getItemsEx()
      .filter(function (p) {
        return p.isInInventory
          && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
      })
      .forEach(function (p) {
        if (p.itemType === sdk.items.type.HealingPotion) {
          pots.hp++;
        } else if (p.itemType === sdk.items.type.ManaPotion) {
          pots.mp++;
        }
      });

    return (pots.mp < Config.MPBuffer || pots.hp < Config.HPBuffer);
  }

  return false;
};

// me.needPotions = function () {
//   return me.needBeltPots() || me.needBufferPots();
// };

/** @returns {ItemUnit | null} */
me.getTpTool = function () {
  const items = me.getItemsEx(-1, sdk.items.mode.inStorage)
    .filter(function (item) {
      return item.isInInventory
        && [
          sdk.items.ScrollofTownPortal,
          sdk.items.TomeofTownPortal
        ].includes(item.classid);
    });
  if (!items.length) return null;
  let tome = items.find(function (i) {
    return i.classid === sdk.items.TomeofTownPortal && i.getStat(sdk.stats.Quantity) > 0;
  });
  if (tome) return tome;
  let scroll = items.find(function (i) {
    return i.classid === sdk.items.ScrollofTownPortal;
  });
  return scroll ? scroll : null;
};

/** @returns {ItemUnit | null} */
me.getIdTool = function () {
  const items = me.getItemsEx()
    .filter(function (i) {
      return i.isInInventory
        && [
          sdk.items.ScrollofIdentify,
          sdk.items.TomeofIdentify
        ].includes(i.classid);
    });
  if (!items.length) return null;
  let tome = items.find(function (i) {
    return i.classid === sdk.items.TomeofIdentify && i.getStat(sdk.stats.Quantity) > 0;
  });
  if (tome) return tome;
  let scroll = items.find(function (i) {
    return i.classid === sdk.items.ScrollofIdentify;
  });
  return scroll ? scroll : null;
};

/** @returns {boolean} */
me.canTpToTown = function () {
  // can't tp if dead
  if (me.dead) return false;
  let badAreas = [
    sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.KurastDocktown,
    sdk.areas.PandemoniumFortress, sdk.areas.Harrogath, sdk.areas.ArreatSummit, sdk.areas.UberTristram
  ];
  // can't tp from town or Uber Trist, and shouldn't tp from arreat summit
  if (badAreas.includes(me.area)) return false;
  // If we made it this far, we can only tp if we even have a tp
  return !!me.getTpTool();
};

/**
 * @description Check if healing is needed, based on character config
 * @returns {boolean}
 */
me.needHealing = function () {
  if (me.hpPercent <= Config.HealHP || me.mpPercent <= Config.HealMP) return true;
  if (!Config.HealStatus) return false;
  // Status effects
  return ([
    sdk.states.Poison,
    sdk.states.AmplifyDamage,
    sdk.states.Frozen,
    sdk.states.Weaken,
    sdk.states.Decrepify,
    sdk.states.LowerResist
  ].some(function (state) {
    return me.getState(state);
  }));
};

/**
 * @description Check if stashing is needed, based on character config
 * @returns {boolean}
 */
me.needStash = function () {
  if (Config.StashGold
    && me.getStat(sdk.stats.Gold) >= Config.StashGold
    && me.getStat(sdk.stats.GoldBank) < 25e5) {
    return true;
  }

  return (Storage.Inventory.Compare(Config.Inventory) || [])
    .some(function (item) {
      return Storage.Stash.CanFit(item);
    });
};

/**
 * @description Check if reviving merc is needed, based on character config
 * @returns {boolean}
 */
me.needMerc = function () {
  if (me.classic || !Config.UseMerc || me.gold < me.mercrevivecost || me.mercrevivecost === 0) {
    return false;
  }

  Misc.poll(function () {
    return me.gameReady;
  }, 1000, 100);
  // me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
  for (let i = 0; i < 3; i += 1) {
    let merc = me.getMerc();

    if (!!merc && !merc.dead) {
      return false;
    }

    delay(100);
  }

  // In case we never had a merc and Config.UseMerc is still set to true for some odd reason
  return true;
};

me.needRepair = function () {
  const repairAction = [];
  if (getInteractedNPC() && !getUIFlag(sdk.uiflags.Shop)) {
    console.debug("Checking need repair: Currently at NPC");
    // fix crash with d2bs
    me.cancel();
  }
  const canAfford = me.gold >= me.getRepairCost();
  const quiverType = { bow: "aqv", crossbow: "cqv" };

  // Arrow/Bolt check
  const bowCheck = Attack.usingBow();

  if (bowCheck) {
    let quiver;
    if (quiverType[bowCheck]) {
      quiver = me.getItem(quiverType[bowCheck], sdk.items.mode.Equipped);
    }

    if (!quiver) { // Out of arrows/bolts
      repairAction.push("buyQuiver");
    } else {
      let quantity = quiver.getStat(sdk.stats.Quantity);

      if (typeof quantity === "number"
        && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
        repairAction.push("buyQuiver");
      }
    }
  }

  // Repair durability/quantity/charges
  if (canAfford) {
    if (me.getItemsForRepair(Config.RepairPercent, true).length > 0) {
      repairAction.push("repair");
    }
  } else {
    console.warn("Can't afford repairs.");
  }

  return repairAction;
};

/**
 * @description Check if buying keys is needed, based on character config
 * @returns {boolean}
 */
me.needKeys = function () {
  return me.checkKeys() <= 0;
};

/**
 * @param {number} id 
 * @returns {ItemUnit | null}
 */
me.getTome = function (id) {
  if (!id) return null;
  let tome = me.findItem(id, sdk.items.mode.inStorage, sdk.storage.Inventory);
  return tome ? tome : null;
};

me.getUnids = function () {
  return me.getItemsEx(-1, sdk.items.mode.inStorage)
    .filter(function (item) {
      return item.isInInventory && !item.identified;
    });
};

/**
 * @param {number} repairPercent 
 * @param {boolean} chargedItems 
 * @returns {ItemUnit[]}
 */
me.getItemsForRepair = function (repairPercent, chargedItems) {
  let itemList = [];
  let item = me.getItem(-1, sdk.items.mode.Equipped);

  if (item) {
    do {
      // Skip ethereal items
      if (item.ethereal) continue;
      // Skip indestructible items
      if (!item.getStat(sdk.stats.Indestructible)) {
        switch (item.itemType) {
        // Quantity check
        case sdk.items.type.ThrowingKnife:
        case sdk.items.type.ThrowingAxe:
        case sdk.items.type.Javelin:
        case sdk.items.type.AmazonJavelin:
          let quantity = item.getStat(sdk.stats.Quantity);

          // Stat 254 = increased stack size
          if (typeof quantity === "number") {
            let _maxStack = (getBaseStat("items", item.classid, "maxstack") + item.getStat(sdk.stats.ExtraStack));
            if (quantity * 100 / _maxStack <= repairPercent) {
              itemList.push(copyUnit(item));
            }
          }

          break;
          // Durability check
        default:
          if (item.durabilityPercent <= repairPercent) {
            itemList.push(copyUnit(item));
          }

          break;
        }
      }

      if (chargedItems) {
        // Charged item check
        let charge = item.getStat(-2)[sdk.stats.ChargedSkill];

        if (typeof (charge) === "object") {
          if (charge instanceof Array) {
            for (let i = 0; i < charge.length; i += 1) {
              if (charge[i] !== undefined && charge[i].hasOwnProperty("charges")
                && charge[i].charges * 100 / charge[i].maxcharges <= repairPercent) {
                itemList.push(copyUnit(item));
              }
            }
          } else if (charge.charges * 100 / charge.maxcharges <= repairPercent) {
            itemList.push(copyUnit(item));
          }
        }
      }
    } while (item.getNext());
  }

  return itemList;
};

/**
 * @param {number} id 
 * @returns {number} quantity of scrolls in tome
 */
me.checkScrolls = function (id) {
  let tome = me.getTome(id);

  if (!tome) {
    switch (id) {
    case sdk.items.TomeofIdentify:
    case "ibk":
      return Config.FieldID.Enabled ? 0 : 20; // Ignore missing ID tome if we aren't using field ID
    case sdk.items.TomeofTownPortal:
    case "tbk":
      return 0; // Force TP tome check
    }
  }

  return tome.getStat(sdk.stats.Quantity);
};

me.checkKeys = function () {
  if (!Config.OpenChests.Enabled || me.assassin || me.gold < 540
    || (!me.getItem("key") && !Storage.Inventory.CanFit({ sizex: 1, sizey: 1 }))) {
    return 12;
  }

  return me.getItemsEx()
    .filter(function (item) {
      return item.classid === sdk.items.Key && item.isInInventory;
    })
    .reduce(function (acc, curr) {
      return acc + curr.getStat(sdk.stats.Quantity);
    }, 0);
};

/**
 * @todo Whats the point of this?
 * @returns {boolean}
 */
me.checkShard = function () {
  let shard;
  let check = { left: false, right: false };
  let item = me.getItem("bld", sdk.items.mode.inStorage);

  if (item) {
    do {
      if (item.isInInventory && item.unique) {
        shard = copyUnit(item);

        break;
      }
    } while (item.getNext());
  }

  if (!shard) return true;

  item = me.getItem(-1, sdk.items.mode.Equipped);

  if (item) {
    do {
      item.bodylocation === sdk.body.RightArm && (check.right = true);
      item.bodylocation === sdk.body.LeftArm && (check.left = true);
    } while (item.getNext());
  }

  if (!check.right) {
    shard.toCursor();

    while (me.itemoncursor) {
      clickItem(sdk.clicktypes.click.item.Left, sdk.body.RightArm);
      delay(500);
    }
  } else if (!check.left) {
    shard.toCursor();

    while (me.itemoncursor) {
      clickItem(sdk.clicktypes.click.item.Left, sdk.body.LeftArm);
      delay(500);
    }
  }

  return true;
};

// Identify items while in the field if we have a id tome
me.fieldID = function () {
  let list = me.getUnids();
  if (!list.length) return false;

  let tome = me.getTome(sdk.items.TomeofIdentify);
  if (!tome || tome.getStat(sdk.stats.Quantity) < list.length) return false;

  while (list.length > 0) {
    let item = list.shift();
    let result = Pickit.checkItem(item);

    // unid item that should be identified
    if (result.result === Pickit.Result.UNID) {
      Town.identifyItem(item, tome, Config.FieldID.PacketID);
      delay(me.ping + 1);
      result = Pickit.checkItem(item);

      switch (result.result) {
      case Pickit.Result.UNWANTED:
        Item.logger("Dropped", item, "fieldID");

        if (Config.DroppedItemsAnnounce.Enable && Config.DroppedItemsAnnounce.Quality.includes(item.quality)) {
          say(
            "Dropped: [" + Item.qualityToName(item.quality).capitalize() + "] "
            + item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim()
          );
          if (Config.DroppedItemsAnnounce.LogToOOG && Config.DroppedItemsAnnounce.OOGQuality.includes(item.quality)) {
            Item.logItem("Field Dropped", item, result.line);
          }
        }

        item.drop();

        break;
      case Pickit.Result.WANTED:
        Item.logger("Field Kept", item);
        Item.logItem("Field Kept", item, result.line);

        break;
      default:
        break;
      }
    }
  }

  delay(200);
  me.cancel();

  return true;
};

me.switchToPrimary = function () {
  if (me.classic) return true;
  return me.switchWeapons(Attack.getPrimarySlot());
};

/**
 * Misc functions, stats/modes/states/ etc
 */
Object.defineProperties(me, {
  maxNearMonsters: {
    get: function () {
      return Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
    },
    configurable: true
  },
  maxgold: {
    /** max capacity (cLvl * 10000) */
    get: function () {
      return me.getStat(sdk.stats.Level) * 10000;
    },
  },
  inShop: {
    get: function () {
      if (getUIFlag(sdk.uiflags.Shop)) return true;
      if (!Config.PacketShopping) return false;
      let npc = getInteractedNPC();
      return !!(npc && npc.itemcount > 0);
    }
  },
  walking: {
    get: function () {
      return me.runwalk === sdk.player.move.Walk;
    }
  },
  running: {
    get: function () {
      return me.runwalk === sdk.player.move.Run;
    }
  },
  deadOrInSequence: {
    get: function () {
      return me.dead || me.mode === sdk.player.mode.SkillActionSequence;
    }
  },
  moving: {
    get: function () {
      return [sdk.player.mode.Walking, sdk.player.mode.Running, sdk.player.mode.WalkingInTown].includes(me.mode);
    }
  },
  staminaPercent: {
    get: function () {
      return Math.round((me.stamina / me.staminamax) * 100);
    }
  },
  staminaDrainPerSec: {
    get: function () {
      let bonusReduction = me.getStat(sdk.stats.StaminaRecoveryBonus);
      let armorMalusReduction = 0; // TODO
      return 25 * Math.max(40 * (1 + armorMalusReduction / 10) * (100 - bonusReduction) / 100, 1) / 256;
    }
  },
  staminaTimeLeft: {
    get: function () {
      return me.stamina / me.staminaDrainPerSec;
    }
  },
  staminaMaxDuration: {
    get: function () {
      return me.staminamax / me.staminaDrainPerSec;
    }
  },
  FCR: {
    get: function () {
      return me.getStat(sdk.stats.FCR) - (!!Config ? Config.FCR : 0);
    }
  },
  FHR: {
    get: function () {
      return me.getStat(sdk.stats.FHR) - (!!Config ? Config.FHR : 0);
    }
  },
  FBR: {
    get: function () {
      return me.getStat(sdk.stats.FBR) - (!!Config ? Config.FBR : 0);
    }
  },
  IAS: {
    get: function () {
      return me.getStat(sdk.stats.IAS) - (!!Config ? Config.IAS : 0);
    }
  },
  shapeshifted: {
    get: function () {
      return me.getState(sdk.states.Wolf) || me.getState(sdk.states.Bear) || me.getState(sdk.states.Delerium);
    }
  },
  mpPercent: {
    get: function () {
      return Math.round(me.mp * 100 / me.mpmax);
    }
  },
  skillDelay: {
    get: function () {
      return me.getState(sdk.states.SkillDelay);
    }
  },
});

/**
 * Game type, difficulty, classtype, etc
 */
Object.defineProperties(me, {
  classic: {
    get: function () {
      return me.gametype === sdk.game.gametype.Classic;
    }
  },
  expansion: {
    get: function () {
      return me.gametype === sdk.game.gametype.Expansion;
    }
  },
  softcore: {
    get: function () {
      return me.playertype === false;
    }
  },
  hardcore: {
    get: function () {
      return me.playertype === true;
    }
  },
  normal: {
    get: function () {
      return me.diff === sdk.difficulty.Normal;
    }
  },
  nightmare: {
    get: function () {
      return me.diff === sdk.difficulty.Nightmare;
    }
  },
  hell: {
    get: function () {
      return me.diff === sdk.difficulty.Hell;
    }
  },
  amazon: {
    get: function () {
      return me.classid === sdk.player.class.Amazon;
    }
  },
  sorceress: {
    get: function () {
      return me.classid === sdk.player.class.Sorceress;
    }
  },
  necromancer: {
    get: function () {
      return me.classid === sdk.player.class.Necromancer;
    }
  },
  paladin: {
    get: function () {
      return me.classid === sdk.player.class.Paladin;
    }
  },
  barbarian: {
    get: function () {
      return me.classid === sdk.player.class.Barbarian;
    }
  },
  druid: {
    get: function () {
      return me.classid === sdk.player.class.Druid;
    }
  },
  assassin: {
    get: function () {
      return me.classid === sdk.player.class.Assassin;
    }
  },
});

/**
 * Quest items
 */
Object.defineProperties(me, {
  wirtsleg: {
    get: function () {
      return me.getItem(sdk.quest.item.WirtsLeg);
    }
  },
  cube: {
    get: function () {
      return me.getItem(sdk.quest.item.Cube);
    }
  },
  shaft: {
    get: function () {
      return me.getItem(sdk.quest.item.ShaftoftheHoradricStaff);
    }
  },
  amulet: {
    get: function () {
      return me.getItem(sdk.quest.item.ViperAmulet);
    }
  },
  staff: {
    get: function () {
      return me.getItem(sdk.quest.item.HoradricStaff);
    }
  },
  completestaff: {
    get: function () {
      return me.getItem(sdk.quest.item.HoradricStaff);
    }
  },
  eye: {
    get: function () {
      return me.getItem(sdk.items.quest.KhalimsEye);
    }
  },
  brain: {
    get: function () {
      return me.getItem(sdk.quest.item.KhalimsBrain);
    }
  },
  heart: {
    get: function () {
      return me.getItem(sdk.quest.item.KhalimsHeart);
    }
  },
  khalimswill: {
    get: function () {
      return me.getItem(sdk.quest.item.KhalimsWill);
    }
  },
  khalimsflail: {
    get: function () {
      return me.getItem(sdk.quest.item.KhalimsFlail);
    }
  },
  malahspotion: {
    get: function () {
      return me.getItem(sdk.quest.item.MalahsPotion);
    }
  },
  scrollofresistance: {
    get: function () {
      return me.getItem(sdk.quest.item.ScrollofResistance);
    }
  },
});

/**
 * Quests
 */
(function () {
  const QuestData = require("./GameData/QuestData");

  /**
   * @param {number} act 
   * @returns {boolean}
   */
  me.accessToAct = function (act) {
    if (act === 1) return true;
    return me.highestAct >= act;
  };

  /**
   * Easier way to check if you have a waypoint
   * @param {number} area 
   * @returns {boolean}
   */
  me.haveWaypoint = function (area) {
    let areaIndex = Pather.wpAreas.indexOf(area);
    if (areaIndex === -1) return false;
    return getWaypoint(areaIndex);
  };

  me.checkQuest = function (questId, state) {
    const quest = QuestData.get(questId);
    if (!quest) return false;
    return quest.checkState(state);
  };

  Object.defineProperties(me, {
    highestAct: {
      get: function () {
        let acts = [true,
          QuestData.get(sdk.quest.id.AbleToGotoActII).complete(),
          QuestData.get(sdk.quest.id.AbleToGotoActIII).complete(),
          QuestData.get(sdk.quest.id.AbleToGotoActIV).complete(),
          QuestData.get(sdk.quest.id.AbleToGotoActV).complete()];
        let index = acts.findIndex(function (i) {
          return !i;
        }); // find first false, returns between 1 and 5
        return index === -1 ? 5 : index;
      }
    },
    highestQuestDone: {
      get: function () {
        for (let i = sdk.quest.id.Respec; i >= sdk.quest.id.SpokeToWarriv; i--) {
          if (!QuestData.has(i)) continue;
          if (QuestData.get(i).complete()) return i;

          // check if we've completed main part but not used our reward
          if ([
            sdk.quest.id.RescueonMountArreat,
            sdk.quest.id.SiegeOnHarrogath,
            sdk.quest.id.ToolsoftheTrade
          ].includes(i) && QuestData.get(i).complete(true)) {
            return i;
          }
        }
        return undefined;
      }
    },
    den: {
      get: function () {
        return QuestData.get(sdk.quest.id.DenofEvil).complete();
      }
    },
    bloodraven: {
      get: function () {
        return QuestData.get(sdk.quest.id.SistersBurialGrounds).complete();
      }
    },
    smith: {
      get: function () {
        return QuestData.get(sdk.quest.id.ToolsoftheTrade).complete();
      }
    },
    imbue: {
      get: function () {
        return QuestData.get(sdk.quest.id.ToolsoftheTrade).checkState(sdk.quest.states.ReqComplete, true);
      }
    },
    cain: {
      get: function () {
        return QuestData.get(sdk.quest.id.TheSearchForCain).complete();
      }
    },
    tristram: {
      get: function () {
        // update where this is used and change the state to be portal opened and me.cain to be quest completed
        return QuestData.get(sdk.quest.id.TheSearchForCain).complete();
      }
    },
    countess: {
      get: function () {
        return QuestData.get(sdk.quest.id.ForgottenTower).complete();
      }
    },
    andariel: {
      get: function () {
        return QuestData.get(sdk.quest.id.AbleToGotoActII).complete();
      }
    },
    radament: {
      get: function () {
        return QuestData.get(sdk.quest.id.RadamentsLair).complete();
      }
    },
    horadricstaff: {
      get: function () {
        return QuestData.get(sdk.quest.id.TheHoradricStaff).complete();
      }
    },
    summoner: {
      get: function () {
        return QuestData.get(sdk.quest.id.TheSummoner).complete();
      }
    },
    duriel: {
      get: function () {
        return QuestData.get(sdk.quest.id.AbleToGotoActIII).complete();
      }
    },
    goldenbird: {
      get: function () {
        return QuestData.get(sdk.quest.id.TheGoldenBird).complete();
      }
    },
    lamessen: {
      get: function () {
        return QuestData.get(sdk.quest.id.LamEsensTome).complete();
      }
    },
    gidbinn: {
      get: function () {
        return QuestData.get(sdk.quest.id.BladeoftheOldReligion).complete();
      }
    },
    travincal: {
      get: function () {
        return QuestData.get(sdk.quest.id.KhalimsWill).complete();
      }
    },
    blackendTemple: {
      get: function () {
        return QuestData.get(sdk.quest.id.TheBlackenedTemple).complete();
      }
    },
    mephisto: {
      get: function () {
        return QuestData.get(sdk.quest.id.AbleToGotoActIV).complete();
      }
    },
    izual: {
      get: function () {
        return QuestData.get(sdk.quest.id.TheFallenAngel).complete();
      }
    },
    hellforge: {
      get: function () {
        return QuestData.get(sdk.quest.id.HellsForge).complete();
      }
    },
    diablo: {
      get: function () {
        return QuestData.get(sdk.quest.id.TerrorsEnd).complete();
      }
    },
    shenk: {
      get: function () {
        return QuestData.get(sdk.quest.id.SiegeOnHarrogath).complete(true);
      }
    },
    larzuk: {
      get: function () {
        return QuestData.get(sdk.quest.id.SiegeOnHarrogath).checkState(sdk.quest.states.ReqComplete, true);
      }
    },
    savebarby: {
      get: function () {
        return QuestData.get(sdk.quest.id.RescueonMountArreat).complete();
      }
    },
    barbrescue: {
      get: function () {
        return QuestData.get(sdk.quest.id.RescueonMountArreat).complete();
      }
    },
    anya: {
      get: function () {
        return QuestData.get(sdk.quest.id.PrisonofIce).complete();
      }
    },
    ancients: {
      get: function () {
        return QuestData.get(sdk.quest.id.RiteofPassage).complete();
      }
    },
    baal: {
      get: function () {
        return QuestData.get(sdk.quest.id.EyeofDestruction).complete();
      }
    },
    // Misc
    cows: {
      get: function () {
        return me.getQuest(sdk.quest.id.TheSearchForCain, 10);
      }
    },
    respec: {
      get: function () {
        return QuestData.get(sdk.quest.id.Respec).complete();
      }
    },
    diffCompleted: {
      get: function () {
        return !!((me.classic && me.diablo) || me.baal);
      }
    },
  });
})();
