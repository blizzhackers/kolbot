/**
*  @filename    Pickit.js
*  @author      kolton, theBGuy
*  @desc        handle item pickup
*
*/

/**
 * @namespace Pickit
 */
const Pickit = {
  gidList: new Set(),
  invoLocked: true,
  beltSize: 1,
  /** @enum */
  Result: {
    UNID: -1,
    UNWANTED: 0,
    WANTED: 1,
    CUBING: 2,
    RUNEWORD: 3,
    TRASH: 4,
    CRAFTING: 5,
    UTILITY: 6
  },
  /**
   * Ignored item types for item logging
   */
  ignoreLog: [
    sdk.items.type.Gold, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver,
    sdk.items.type.Scroll, sdk.items.type.Key, sdk.items.type.HealingPotion,
    sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion,
    sdk.items.type.StaminaPotion, sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
  ],
  tkable: [
    sdk.items.type.Gold, sdk.items.type.Scroll, sdk.items.type.HealingPotion,
    sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion,
    sdk.items.type.StaminaPotion, sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
  ],
  essentials: [
    sdk.items.type.Gold, sdk.items.type.Scroll,
    sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion
  ],

  /** 
   * @param {boolean} notify
   */
  init: function (notify) {
    Config.PickitFiles.forEach((file) => NTIP.OpenFile("pickit/" + file, notify));
    // check if we can pick up items, only do this is our inventory slots aren't completly locked
    Pickit.invoLocked = !Config.Inventory.some(row => row.some(el => el > 0));

    // sometime Storage isn't loaded?
    if (typeof Storage !== "undefined") {
      Pickit.beltSize = Storage.BeltSize();
      // If MinColumn is set to be more than our current belt size, set it to be 1 less than the belt size 4x3 belt will give us Config.MinColumn = [2, 2, 2, 2]
      Config.MinColumn.forEach((el, index) => {
        el >= Pickit.beltSize && (Config.MinColumn[index] = Math.max(1, Pickit.beltSize - 1));
      });
    }
  },

  // eslint-disable-next-line no-unused-vars
  itemEvent: function (gid, mode, code, global) {
    // console.log("gid: " + gid, " mode: " + mode, " code: " + code, " global: " + global);
    if (gid > 0 && mode === 0) {
      Pickit.gidList.add(gid);
    }
  },

  /**
   * Just sort by distance for general item pickup
   * @param {ItemUnit} unitA 
   * @param {ItemUnit} unitB 
   */
  sortItems: function (unitA, unitB) {
    return getDistance(me, unitA) - getDistance(me, unitB);
  },

  /**
   * Prioritize runes and unique items for fast pick
   * @param {ItemUnit} unitA 
   * @param {ItemUnit} unitB 
   */
  sortFastPickItems: function (unitA, unitB) {
    if (unitA.itemType === sdk.items.type.Rune || unitA.unique) return -1;
    if (unitB.itemType === sdk.items.type.Rune || unitB.unique) return 1;

    return getDistance(me, unitA) - getDistance(me, unitB);
  },

  checkBelt: function () {
    let check = 0;
    let item = me.getItem(-1, sdk.items.mode.inBelt);

    if (item) {
      do {
        if (item.x < 4) {
          check += 1;
        }
      } while (item.getNext());
    }

    return check === 4;
  },

  /**
   * @param {ItemUnit} unit 
   */
  canPick: function (unit) {
    if (!unit) return false;
    if (sdk.quest.items.includes(unit.classid) && me.getItem(unit.classid)) return false;

    switch (unit.itemType) {
    case sdk.items.type.Gold:
      // Check current gold vs max capacity (cLvl*10000)
      if (me.getStat(sdk.stats.Gold) === me.maxgold) {
        return false; // Skip gold if full
      }
      return true;
    case sdk.items.type.Scroll:
      {
        // 518 - Tome of Town Portal or 519 - Tome of Identify
        let tome = me.getItem(unit.classid - 11, sdk.items.mode.inStorage);
        // Don't pick scrolls if there's no tome
        if (!tome) return false;
        do {
          if (tome.isInInventory && tome.getStat(sdk.stats.Quantity) < 20) {
            return true;
          }
        } while (tome.getNext());
      }
      // Couldn't find a tome that wasn't full. Skipping scroll
      return false;
    case sdk.items.type.Key:
      {
        // Assassins don't ever need keys
        if (me.assassin) return false;

        let myKey = me.getItem(sdk.items.Key, sdk.items.mode.inStorage);
        let key = Game.getItem(-1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

        if (myKey && key) {
          do {
            if (myKey.isInInventory && myKey.getStat(sdk.stats.Quantity) + key.getStat(sdk.stats.Quantity) > 12) {
              return false;
            }
          } while (myKey.getNext());
        }
      }
      break;
    case sdk.items.type.SmallCharm:
    case sdk.items.type.LargeCharm:
    case sdk.items.type.GrandCharm:
      if (unit.unique) {
        let charm = me.getItem(unit.classid, sdk.items.mode.inStorage);

        if (charm) {
          do {
            // Skip Gheed's Fortune, Hellfire Torch or Annihilus if we already have one
            if (charm.unique) return false;
          } while (charm.getNext());
        }
      }

      break;
    case sdk.items.type.HealingPotion:
    case sdk.items.type.ManaPotion:
    case sdk.items.type.RejuvPotion:
    {
      let needPots = 0;
      const _pots = new Map([
        [sdk.items.type.HealingPotion, { count: 0 }],
        [sdk.items.type.ManaPotion, { count: 0 }],
        [sdk.items.type.RejuvPotion, { count: 0 }],
        [sdk.items.type.AntidotePotion, { count: 0 }],
        [sdk.items.type.StaminaPotion, { count: 0 }],
        [sdk.items.type.ThawingPotion, { count: 0 }],
      ]);

      for (let column of Config.BeltColumn) {
        if (unit.code.includes(column)) {
          needPots += Pickit.beltSize;
        }
      }

      let potion = me.getItem(-1, sdk.items.mode.inBelt);

      if (potion) {
        do {
          _pots.get(potion.itemType).count += 1;
          if (potion.itemType === unit.itemType) {
            needPots -= 1;
          }
        } while (potion.getNext());
      }

      if (needPots < 1 && this.checkBelt()) {
        const _buffers = new Map([
          ["HPBuffer", { type: sdk.items.type.HealingPotion, amount: Config.HPBuffer }],
          ["MPBuffer", { type: sdk.items.type.ManaPotion, amount: Config.MPBuffer }],
          ["RejuvBuffer", { type: sdk.items.type.RejuvPotion, amount: Config.RejuvBuffer }]
        ]);

        for (let buffer of _buffers) {
          if (buffer[1].amount <= 0) continue;
          if (buffer[1].type !== unit.itemType) continue;
          needPots = buffer[1].amount;
          potion = me.getItem(-1, sdk.items.mode.inStorage);

          if (potion) {
            do {
              if (potion.isInInventory && _pots.has(potion.itemType)) {
                _pots.get(potion.itemType).count += 1;
                if (potion.itemType === buffer[1].type) {
                  needPots -= 1;
                }
              }
            } while (potion.getNext());
          }
        }
      }

      if (needPots < 1) {
        potion = me.getItem();

        if (potion) {
          do {
            if (potion.itemType === unit.itemType
              && (potion.isInInventory || potion.isInBelt)) {
              if (potion.classid < unit.classid) {
                potion.use();
                needPots += 1;

                break;
              }
            }
          } while (potion.getNext());
        }
      }

      return (needPots > 0);
    }
    case undefined: // Yes, it does happen
      console.warn("undefined item (!?)");

      return false;
    default:
      // don't attempt items we are simply unable to pick up
      return Storage.Inventory.IsPossibleToFit(unit);
    }

    return true;
  },

  /**
   * @param {ItemUnit} unit
   * @returns { { result: PickitResult, line: string } }
   *	-1 : Needs iding,
   *	 0 : Unwanted,
   *	 1 : NTIP wants,
   *	 2 : Cubing wants,
   *	 3 : Runeword wants,
   * 	 4 : Pickup to sell (triggered when low on gold)
   */
  checkItem: function (unit) {
    const rval = NTIP.CheckItem(unit, false, true);
    const resultObj = function (result, line = null) {
      return {
        result: result,
        line: line
      };
    };

    // make sure we have essentials - no pickit files loaded
    if (rval.result === Pickit.Result.UNWANTED && Config.PickitFiles.length === 0
      && Pickit.essentials.includes(unit.itemType) && this.canPick(unit)) {
      return resultObj(Pickit.Result.WANTED);
    }

    if ((unit.classid === sdk.items.runes.Ort || unit.classid === sdk.items.runes.Ral)
      && Town.repairIngredientCheck(unit)) {
      return resultObj(Pickit.Result.UTILITY);
    }

    if (CraftingSystem.checkItem(unit)) return resultObj(Pickit.Result.CRAFTING);
    if (Cubing.checkItem(unit)) return resultObj(Pickit.Result.CUBING);
    if (Runewords.checkItem(unit)) return resultObj(Pickit.Result.RUNEWORD);

    // if Gemhunting, pick Item for Cubing, if no other system needs it
    if (Scripts.GemHunter && rval.result === Pickit.Result.UNWANTED) {
      // gemhunter active
      if (Config.GemHunter.GemList.some((p) => [unit.classid - 1, unit.classid].includes(p))) {
        // base and upgraded gem will be kept
        let _items = me.getItemsEx(unit.classid, sdk.items.mode.inStorage)
          .filter(function (i) {
            return i.gid !== unit.gid
              && !CraftingSystem.checkItem(i)
              && !Cubing.checkItem(i)
              && !Runewords.checkItem(i);
          });
        if (_items.length === 0) return resultObj(Pickit.Result.WANTED, "GemHunter");
      }
    }

    if (rval.result === Pickit.Result.UNWANTED && !Town.ignoreType(unit.itemType) && !unit.questItem
      && ((unit.isInInventory && (me.inTown || !Config.FieldID.Enabled))
      || (me.gold < Config.LowGold || (me.gold < 500000 && Config.PickitFiles.length === 0)))) {
      // Gold doesn't take up room, just pick it up
      if (unit.classid === sdk.items.Gold) return resultObj(Pickit.Result.TRASH);

      if (!this.invoLocked) {
        const itemValue = unit.getItemCost(sdk.items.cost.ToSell);
        const itemValuePerSquare = itemValue / (unit.sizex * unit.sizey);

        if (itemValuePerSquare >= 2000) {
          // If total gold is less than 500k pick up anything worth 2k gold per square to sell in town.
          return resultObj(Pickit.Result.TRASH, "Valuable LowGold Item: " + itemValue);
        } else if (itemValuePerSquare >= 10) {
          // If total gold is less than LowGold setting pick up anything worth 10 gold per square to sell in town.
          return resultObj(Pickit.Result.TRASH, "LowGold Item: " + itemValue);
        }
      }
    }

    return rval;
  },

  track: {
    lastItem: null,
  },

  /**
   * @param {ItemUnit} unit 
   * @param {PickitResult} status 
   * @param {string} keptLine 
   * @param {number} retry 
   * @todo figure out why sometimes we double print picking up an item, gut feeling is recursion somewhere
   */
  pickItem: function (unit, status, keptLine, retry = 3) {
    /**
     * @constructor
     * @param {ItemUnit} unit 
     */
    function ItemStats (unit) {
      this.gid = unit.gid;
      this.ilvl = unit.ilvl;
      this.type = unit.itemType;
      this.classid = unit.classid;
      this.name = unit.name;
      this.color = Item.color(unit);
      this.gold = unit.getStat(sdk.stats.Gold);
      this.dist = (unit.distance || Infinity);
      this.useTk = (Skill.haveTK && Pickit.tkable.includes(this.type)
        && this.dist > 5 && this.dist < 20 && !checkCollision(me, unit, sdk.collision.WallOrRanged));
      this.picked = false;
    }

    const itemCount = me.itemcount;
    const cancelFlags = [
      sdk.uiflags.Inventory, sdk.uiflags.NPCMenu,
      sdk.uiflags.Waypoint, sdk.uiflags.Shop,
      sdk.uiflags.Stash, sdk.uiflags.Cube
    ];
    
    if (!unit.gid) return false;
    let item = Game.getItem(-1, -1, unit.gid);
    if (!item) return false;
    if (!item.onGroundOrDropping) return false;

    if (cancelFlags.some(getUIFlag)) {
      delay(500);
      me.cancel(0);
    }

    const stats = new ItemStats(item);
    const tkMana = stats.useTk
      ? Skill.getManaCost(sdk.skills.Telekinesis) * 2
      : Infinity;

    MainLoop:
    for (let i = 0; i < retry; i++) {
      if (me.dead) return false;
      // recursion appeared
      if (this.track.lastItem === stats.gid) return true;
      // can't find the item
      if (!Game.getItem(-1, -1, stats.gid)) return false;

      if (me.getItem(stats.classid, -1, stats.gid)) {
        console.debug("Already picked item");
        return true;
      }

      while (!me.idle) {
        delay(40);
      }

      if (!item.onGroundOrDropping) {
        break;
      }

      // fastPick check? should only pick items if surrounding monsters have been cleared or if fastPick is active
      // note: clear of surrounding monsters of the spectype we are set to clear
      if (stats.useTk && me.mp > tkMana) {
        if (!Packet.telekinesis(item)) {
          i > 1 && (stats.useTk = false);
          continue;
        }
      } else {
        if (item.distance > (Config.FastPick || i < 1 ? 6 : 4)
          || checkCollision(me, item, sdk.collision.BlockWall)) {
          if (!Pather.move(item, { retry: 3, allowPicking: false, minDist: 4 })) {
            continue;
          }
          // we had to move, lets check to see if it's still there
          if (me.getItem(stats.classid, -1, stats.gid)) {
            // we picked the item during another process - recursion happened
            // this has pontential to skip logging an item
            return true;
          }
          if (!Game.getItem(stats.classid, -1, stats.gid)) {
            // it's gone so don't continue, 
            return false;
          }
        }

        // use packet first, if we fail and not using fast pick use click
        (Config.FastPick || i < 1)
          ? Packet.click(item)
          : Misc.click(0, 0, item);
      }

      let tick = getTickCount();

      while (getTickCount() - tick < 1000) {
        // why the use of copyUnit here?
        item = copyUnit(item);

        if (stats.classid === sdk.items.Gold) {
          if (!item.getStat(sdk.stats.Gold) || item.getStat(sdk.stats.Gold) < stats.gold) {
            console.log(
              "ÿc7Picked up " + stats.color
              + (item.getStat(sdk.stats.Gold) ? (item.getStat(sdk.stats.Gold) - stats.gold) : stats.gold)
              + " " + stats.name
            );
            return true;
          }
        }

        if (!item.onGroundOrDropping) {
          switch (stats.classid) {
          case sdk.items.Key:
            console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + me.checkKeys() + "/12)");

            return true;
          case sdk.items.ScrollofTownPortal:
          case sdk.items.ScrollofIdentify:
            console.log(
              "ÿc7Picked up " + stats.color + stats.name
              + " ÿc7(" + Town.checkScrolls(stats.classid === sdk.items.ScrollofTownPortal ? "tbk" : "ibk") + "/20)"
            );
            return true;
          }

          break MainLoop;
        }

        delay(20);
      }

      // TK failed, disable it
      stats.useTk = false;
    }

    stats.picked = me.itemcount > itemCount || !!me.getItem(stats.classid, -1, stats.gid);

    if (stats.picked) {
      DataFile.updateStats("lastArea");
      const _common = "ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")";
      const pickedItem = me.getItem(stats.classid, -1, stats.gid);
      if (!pickedItem) return false;

      switch (status) {
      case Pickit.Result.WANTED:
        console.log(_common + (keptLine ? " (" + keptLine + ")" : ""));
        if (Pickit.ignoreLog.indexOf(pickedItem.itemType) === -1) {
          Item.logger("Kept", pickedItem);
          Item.logItem("Kept", pickedItem, keptLine);
        }

        break;
      case Pickit.Result.CUBING:
        console.log(_common + " (Cubing)");
        Item.logger("Kept", pickedItem, "Cubing " + me.findItems(pickedItem.classid).length);
        Cubing.update();

        break;
      case Pickit.Result.RUNEWORD:
        console.log(_common + " (Runewords)");
        Item.logger("Kept", pickedItem, "Runewords");
        Runewords.update(pickedItem.classid, pickedItem.gid);

        break;
      case Pickit.Result.CRAFTING:
        console.log(_common + " (Crafting System)");
        CraftingSystem.update(pickedItem);

        break;
      default:
        console.log(_common + (keptLine ? " (" + keptLine + ")" : ""));

        break;
      }
      
      this.track.lastItem = pickedItem.gid;
    }

    return true;
  },

  /**
   * Check if we can even free up the inventory
   */
  canMakeRoom: function () {
    if (!Config.MakeRoom) return false;

    let items = Storage.Inventory.Compare(Config.Inventory) || [];

    if (items.length) {
      return items.some(function (item) {
        switch (Pickit.checkItem(item).result) {
        case Pickit.Result.UNID:
          // For low level chars that can't actually get id scrolls -> prevent an infinite loop
          return (me.gold > 100);
        case Pickit.Result.UNWANTED:
        case Pickit.Result.TRASH:
          // if we've got items to sell then we can make room as long as we can get to town
          return me.canTpToTown();
        default: // Check if a kept item can be stashed
          return Town.canStash(item);
        }
      });
    }

    return false;
  },

  /** @type {ItemUnit[]} */
  pickList: [],
  /** @type {Set<number>} */
  ignoreList: new Set(),

  /**
   * @param {number} range
   * @returns {boolean} If we picked items
   */
  pickItems: function (range = Config.PickRange) {
    if (me.dead) return false;
    
    let needMule = false;
    const canUseMule = AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo");
    const _pots = [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion];
    /** @param {ItemUnit} item */
    const copyItem = function (item) {
      return {
        gid: item.gid,
        x: item.x,
        y: item.y,
        classid: item.classid,
        itemType: item.itemType,
      };
    };

    // why wait for idle?
    while (!me.idle) {
      delay(40);
    }

    let item = Game.getItem();

    if (item) {
      do {
        if (Pickit.ignoreList.has(item.gid)) continue;
        if (item.classid === sdk.items.Gold && item.distance <= 4 && Pickit.canPick(item)) {
          if (Pickit.pickItem(item, Pickit.Result.WANTED, "gold", 1)) continue;
        }
        if (Pickit.pickList.some(el => el.gid === item.gid)) continue;
        if (item.onGroundOrDropping && item.distance <= range) {
          Pickit.pickList.push(copyItem(item));
        }
      } while (item.getNext());
    }

    if (Pickit.pickList.some(function (el) {
      return _pots.includes(el.itemType);
    })) {
      me.clearBelt();
    }

    while (Pickit.pickList.length > 0) {
      if (me.dead) return false;
      Pickit.pickList.sort(this.sortItems);
      const currItem = Pickit.pickList[0];

      if (Pickit.ignoreList.has(currItem.gid)) {
        Pickit.pickList.shift();
        
        continue;
      }
      
      // get the real item
      const _item = Game.getItem(currItem.classid, -1, currItem.gid);
      if (!_item || copyUnit(_item).x === undefined) {
        Pickit.pickList.shift();
        
        continue;
      }
      const itemName = _item.prettyPrint;

      // Check if the item unit is still valid and if it's on ground or being dropped
      // Don't pick items behind walls/obstacles when walking
      if (_item.onGroundOrDropping
          && (Pather.useTeleport() || me.inTown || !checkCollision(me, _item, sdk.collision.BlockWall))) {
        // Check if the item should be picked
        let status = this.checkItem(_item);

        if (status.result && this.canPick(_item)) {
          // Override canFit for scrolls, potions and gold
          let canFit = (Storage.Inventory.CanFit(_item) || Pickit.essentials.includes(_item.itemType));

          // Field id when our used space is above a certain percent or if we are full try to make room with FieldID
          if (Config.FieldID.Enabled && (!canFit || Storage.Inventory.UsedSpacePercent() > Config.FieldID.UsedSpace)) {
            me.fieldID() && (canFit = (_item.gid !== undefined && Storage.Inventory.CanFit(_item)));
          }

          // Try to make room by selling items in town
          if (!canFit) {
            let usedSpace = Storage.Inventory.UsedSpacePercent();
            // Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
            if (this.canMakeRoom()) {
              console.log("ÿc7Trying to make room for " + Item.color(_item) + _item.name);

              // Go to town and do town chores
              if (Town.visitTown()) {
                // Recursive check after going to town. We need to remake item list because gids can change.
                // Called only if room can be made so it shouldn't error out or block anything.
                if (Storage.Inventory.UsedSpacePercent() < usedSpace) {
                  console.log(
                    "ÿc7Made room for " + Item.color(_item) + _item.prettyPrint
                    + " (" + usedSpace + "% -> " + Storage.Inventory.UsedSpacePercent() + "%)"
                  );
                  Pickit.ignoreList.clear();
                  return this.pickItems();
                }
              } else {
                // Town visit failed - abort
                console.warn("Failed to visit town. ÿc7Not enough room for " + Item.color(_item) + _item.name);

                return false;
              }
            }

            // Can't make room - trigger automule
            if (copyUnit(_item).x !== undefined) {
              Item.logger("No room for", _item);
              console.warn("ÿc7Not enough room for " + Item.color(_item) + _item.name);
              Pickit.ignoreList.add(_item.gid);
              if (canUseMule) {
                console.debug("Attempt to trigger automule");
                needMule = true;
              }

              break;
            }
          }

          // Item can fit - pick it up
          if (canFit) {
            let picked = this.pickItem(_item, status.result, status.line);
            if (!picked) {
              console.warn("Failed to pick item " + itemName);

              break;
            }
          }
        }
      }
      Pickit.pickList.shift();
    }

    // Quit current game and transfer the items to mule
    if (needMule && canUseMule && AutoMule.getMuleItems().length > 0) {
      scriptBroadcast("mule");
      scriptBroadcast("quit");

      return false;
    }

    return true;
  },

  /**
   * @param {number} retry 
   */
  fastPick: function (retry = 3) {
    let item;
    const _removeList = [];
    const itemList = [];

    for (let gid of this.gidList) {
      _removeList.push(gid);
      item = Game.getItem(-1, -1, gid);
      if (item && item.onGroundOrDropping
        && (!Town.ignoreType(item.itemType) || (item.itemType >= sdk.items.type.HealingPotion
        && item.itemType <= sdk.items.type.RejuvPotion))
        && item.itemType !== sdk.items.type.Gold
        && getDistance(me, item) <= Config.PickRange) {
        itemList.push(copyUnit(item));
      }
    }

    while (_removeList.length > 0) {
      this.gidList.delete(_removeList.shift());
    }

    while (itemList.length > 0) {
      itemList.sort(this.sortFastPickItems);
      let check = itemList.shift();
      // we were passed the copied unit, lets find the real thing
      item = Game.getItem(check.classid, -1, check.gid);

      // Check if the item unit is still valid
      if (item && item.x !== undefined) {
        let status = this.checkItem(item);

        if (status.result && this.canPick(item)
          && (Storage.Inventory.CanFit(item) || Pickit.essentials.includes(item.itemType))) {
          this.pickItem(item, status.result, status.line, retry);
        }
      }
    }

    return true;
  },
};
