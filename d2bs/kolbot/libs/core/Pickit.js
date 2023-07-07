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

    let tome, potion, needPots, buffers, pottype, myKey, key;

    switch (unit.itemType) {
    case sdk.items.type.Gold:
      // Check current gold vs max capacity (cLvl*10000)
      if (me.getStat(sdk.stats.Gold) === me.getStat(sdk.stats.Level) * 10000) {
        return false; // Skip gold if full
      }

      break;
    case sdk.items.type.Scroll:
      // 518 - Tome of Town Portal or 519 - Tome of Identify
      tome = me.getItem(unit.classid - 11, sdk.items.mode.inStorage);

      if (tome) {
        do {
          // In inventory, contains 20 scrolls
          if (tome.isInInventory && tome.getStat(sdk.stats.Quantity) === 20) {
            return false; // Skip a scroll if its tome is full
          }
        } while (tome.getNext());
      } else {
        return false; // Don't pick scrolls if there's no tome
      }

      break;
    case sdk.items.type.Key:
      // Assassins don't ever need keys
      if (me.assassin) return false;

      myKey = me.getItem(sdk.items.Key, sdk.items.mode.inStorage);
      key = Game.getItem(-1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

      if (myKey && key) {
        do {
          if (myKey.isInInventory && myKey.getStat(sdk.stats.Quantity) + key.getStat(sdk.stats.Quantity) > 12) {
            return false;
          }
        } while (myKey.getNext());
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
      needPots = 0;

      for (let i = 0; i < 4; i += 1) {
        if (typeof unit.code === "string" && unit.code.includes(Config.BeltColumn[i])) {
          needPots += this.beltSize;
        }
      }

      potion = me.getItem(-1, sdk.items.mode.inBelt);

      if (potion) {
        do {
          if (potion.itemType === unit.itemType) {
            needPots -= 1;
          }
        } while (potion.getNext());
      }

      if (needPots < 1 && this.checkBelt()) {
        buffers = ["HPBuffer", "MPBuffer", "RejuvBuffer"];

        for (let i = 0; i < buffers.length; i += 1) {
          if (Config[buffers[i]]) {
            pottype = (() => {
              switch (buffers[i]) {
              case "HPBuffer":
                return sdk.items.type.HealingPotion;
              case "MPBuffer":
                return sdk.items.type.ManaPotion;
              case "RejuvBuffer":
                return sdk.items.type.RejuvPotion;
              default:
                return -1;
              }
            })();

            if (unit.itemType === pottype) {
              if (!Storage.Inventory.CanFit(unit)) return false;

              needPots = Config[buffers[i]];
              potion = me.getItem(-1, sdk.items.mode.inStorage);

              if (potion) {
                do {
                  if (potion.itemType === pottype && potion.isInInventory) {
                    needPots -= 1;
                  }
                } while (potion.getNext());
              }
            }
          }
        }
      }

      if (needPots < 1) {
        potion = me.getItem();

        if (potion) {
          do {
            if (potion.itemType === unit.itemType && (potion.isInInventory || potion.isInBelt)) {
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
    case undefined: // Yes, it does happen
      console.warn("undefined item (!?)");

      return false;
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
    let rval = NTIP.CheckItem(unit, false, true);
    const resultObj = (result, line = null) => ({
      result: result,
      line: line
    });

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
          .filter(i => i.gid !== unit.gid
            && !CraftingSystem.checkItem(i) && !Cubing.checkItem(i) && !Runewords.checkItem(i));
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
    const gid = unit.gid;
    
    let item = Game.getItem(-1, -1, gid);
    if (!item) return false;

    if (cancelFlags.some(function (flag) { return getUIFlag(flag); })) {
      delay(500);
      me.cancel(0);
    }

    const stats = new ItemStats(item);
    const tkMana = stats.useTk
      ? Skill.getManaCost(sdk.skills.Telekinesis) * 2
      : Infinity;

    MainLoop:
    for (let i = 0; i < retry; i += 1) {
      if (me.dead) return false;
      // recursion appeared
      if (this.track.lastItem === gid) return true;
      // can't find the item
      if (!Game.getItem(-1, -1, gid)) return false;

      if (me.getItem(item.classid, -1, item.gid)) {
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
        if (item.distance > (Config.FastPick || i < 1 ? 6 : 4) || checkCollision(me, item, sdk.collision.BlockWall)) {
          if (!Pather.moveToEx(item.x, item.y, { retry: 3, allowPicking: false, minDist: 4 })) {
            continue;
          }
          // we had to move, lets check to see if it's still there
          if (me.getItem(-1, -1, gid)) {
            // we picked the item during another process - recursion happened
            // this has pontential to skip logging an item
            return true;
          }
          if (!Game.getItem(-1, -1, gid)) {
            // it's gone so don't continue, 
            return false;
          }
        }

        // use packet first, if we fail and not using fast pick use click
        (Config.FastPick || i < 1) ? Packet.click(item) : Misc.click(0, 0, item);
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
            console.log("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

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

    stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

    if (stats.picked) {
      DataFile.updateStats("lastArea");
      let _common = "ÿc7Picked up " + stats.color + stats.name + " ÿc0(ilvl " + stats.ilvl + ")";

      switch (status) {
      case Pickit.Result.WANTED:
        console.log(_common + (keptLine ? " (" + keptLine + ")" : ""));
        if (this.ignoreLog.indexOf(stats.type) === -1) {
          Item.logger("Kept", item);
          Item.logItem("Kept", item, keptLine);
        }

        break;
      case Pickit.Result.CUBING:
        console.log(_common + " (Cubing)");
        Item.logger("Kept", item, "Cubing " + me.findItems(item.classid).length);
        Cubing.update();

        break;
      case Pickit.Result.RUNEWORD:
        console.log(_common + " (Runewords)");
        Item.logger("Kept", item, "Runewords");
        Runewords.update(stats.classid, gid);

        break;
      case Pickit.Result.CRAFTING:
        console.log(_common + " (Crafting System)");
        CraftingSystem.update(item);

        break;
      default:
        console.log(_common + (keptLine ? " (" + keptLine + ")" : ""));

        break;
      }
      
      this.track.lastItem = item.gid;
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
      return items.some(item => {
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

    // why wait for idle?
    while (!me.idle) {
      delay(40);
    }

    let item = Game.getItem();

    if (item) {
      do {
        if (Pickit.ignoreList.has(item.gid)) continue;
        if (Pickit.pickList.some(el => el.gid === item.gid)) continue;
        if (item.onGroundOrDropping && item.distance <= range) {
          Pickit.pickList.push(copyUnit(item));
        }
      } while (item.getNext());
    }

    if (Pickit.pickList.some(function (el) {
      return _pots.includes(el.itemType);
    })) {
      Town.clearBelt();
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
      const _item = Game.getItem(-1, -1, currItem.gid);
      if (!_item || copyUnit(_item).x === undefined) {
        Pickit.pickList.shift();
        
        continue;
      }

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
              if (Town.visitTown() && Storage.Inventory.UsedSpacePercent() < usedSpace) {
                // Recursive check after going to town. We need to remake item list because gids can change.
                // Called only if room can be made so it shouldn't error out or block anything.
                Pickit.ignoreList.clear();
                return this.pickItems();
              }

              // Town visit failed - abort
              console.warn("Failed to visit town. ÿc7Not enough room for " + Item.color(_item) + _item.name);

              return false;
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
              console.warn("Failed to pick item " + _item.prettyPrint);

              break;
            }
          }
        }
      }
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
