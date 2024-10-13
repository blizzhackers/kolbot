/**
*  @filename    Runewords.js
*  @author      kolton, theBGuy
*  @desc        make and reroll runewords
*
*/

const Runeword = require("./GameData/RuneData");

const Runewords = {
  needList: [],
  pickitEntries: [],
  validGids: [],

  init: function () {
    if (!Config.MakeRunewords) return;

    Runewords.pickitEntries = [];

    // initiate pickit entries
    for (let entry of Config.KeepRunewords) {
      let info = {
        file: "Character Config",
        line: entry
      };

      let parsedLine = NTIP.ParseLineInt(entry, info);
      if (parsedLine) {
        this.pickitEntries.push(parsedLine);
      }
    }

    // change text to classid
    for (let i = 0; i < Config.Runewords.length; i += 1) {
      const [runeword, base] = Config.Runewords[i];

      if (!runeword.ladderRestricted()) {
        if (isNaN(base)) {
          if (NTIPAliasClassID.hasOwnProperty(base.replace(/\s+/g, "").toLowerCase())) {
            Config.Runewords[i][1] = NTIPAliasClassID[base.replace(/\s+/g, "").toLowerCase()];
          } else {
            Misc.errorReport("ÿc1Invalid runewords entry:ÿc0 " + base);
            Config.Runewords.splice(i, 1);

            i -= 1;
          }
        }
      }
    }

    this.buildLists();
  },

  /**
   * Ensures this item isn't wanted by the CraftingSystem
   * @param {ItemUnit} item 
   * @returns {boolean}
   * @todo Why only the crafting system?
   */
  validItem: function (item) {
    return CraftingSystem.validGids.indexOf(item.gid) === -1;
  },

  /**
   * build a list of needed runes. won't count runes until the base item is found for a given runeword
   * @returns {void}
   */
  buildLists: function () {
    Runewords.validGids = [];
    Runewords.needList = [];
    let baseCheck;
    let items = me.findItems(-1, sdk.items.mode.inStorage);

    for (let i = 0; i < Config.Runewords.length; i += 1) {
      const [runeword, base, ethFlag] = Config.Runewords[i];

      if (!baseCheck) {
        baseCheck = this.getBase(runeword, base, (ethFlag || 0)) || this.getBase(runeword, base, (ethFlag || 0), true);
      }

      if (this.getBase(runeword, base, (ethFlag || 0))) {
        RuneLoop:
        for (let j = 0; j < runeword.runes.length; j += 1) {
          for (let k = 0; k < items.length; k += 1) {
            if (items[k].classid === runeword.runes[j] && this.validItem(items[k])) {
              this.validGids.push(items[k].gid);
              items.splice(k, 1);

              k -= 1;

              continue RuneLoop;
            }
          }

          this.needList.push(runeword.runes[j]);
        }
      }
    }

    // hel rune for rerolling purposes
    if (baseCheck) {
      let hel = me.getItem(sdk.items.runes.Hel, sdk.items.mode.inStorage);

      if (hel) {
        do {
          if (this.validGids.indexOf(hel.gid) === -1 && this.validItem(hel)) {
            this.validGids.push(hel.gid);

            return;
          }
        } while (hel.getNext());
      }

      this.needList.push(sdk.items.runes.Hel);
    }
  },

  /**
   * @param {number} classid 
   * @param {number} gid 
   */
  update: function (classid, gid) {
    for (let i = 0; i < this.needList.length; i += 1) {
      if (this.needList[i] === classid) {
        this.needList.splice(i, 1);

        i -= 1;

        break;
      }
    }

    this.validGids.push(gid);
  },

  /**
   * returns an array of items that make a runeword if found, false if we don't have enough items for any
   * @returns {ItemUnit[] | boolean}
   */
  checkRunewords: function () {
    // keep a const reference of our items so failed checks don't remove items from the list
    const itemsRef = me.findItems(-1, sdk.items.mode.inStorage);

    for (let i = 0; i < Config.Runewords.length; i += 1) {
      let itemList = []; // reset item list
      let items = itemsRef.slice(); // copy itemsRef

      const [runeword, wantedBase, ethFlag] = Config.Runewords[i];
      let base = this.getBase(runeword, wantedBase, (ethFlag || 0)); // check base

      if (base) {
        itemList.push(base); // push the base

        for (let j = 0; j < runeword.runes.length; j += 1) {
          for (let k = 0; k < items.length; k += 1) {
            if (items[k].classid === runeword.runes[j]) { // rune matched
              itemList.push(items[k]); // push into the item list
              items.splice(k, 1); // remove from item list as to not count it twice

              k -= 1;

              break; // stop item cycle - we found the item
            }
          }

          // can't complete runeword - go to next one
          if (itemList.length !== j + 2) {
            break;
          }

          if (itemList.length === runeword.runes.length + 1) { // runes + base
            return itemList; // these items are our runeword
          }
        }
      }
    }

    return false;
  },

  /**
   * for pickit
   * @param {ItemUnit} unit 
   * @returns {boolean}
   */
  checkItem: function (unit) {
    if (!Config.MakeRunewords) return false;
    return (unit.itemType === sdk.items.type.Rune && this.needList.includes(unit.classid));
  },

  /**
   * for clearInventory - don't drop runes that are a part of runeword recipe
   * @param {ItemUnit} unit 
   * @returns {boolean}
   */
  keepItem: function (unit) {
    return this.validGids.includes(unit.gid);
  },

  /**
   * Get the base item based on classid and runeword recipe
   * @param {runeword} runeword 
   * @param {ItemUnit | number} base - item or classid
   * @param {number} [ethFlag] 
   * @param {boolean} [reroll] - optional reroll argument = gets a runeword that needs rerolling
   * @returns {ItemUnit | false}
   */
  getBase: function (runeword, base, ethFlag, reroll) {
    let item = typeof base === "object"
      ? base
      : me.getItem(base, sdk.items.mode.inStorage);

    if (item) {
      do {
        if (item && item.quality < sdk.items.quality.Magic
          && item.sockets === runeword.sockets && runeword.itemTypes.includes(item.itemType)) {
          /**
           * check if item has items socketed in it
           * better check than getFlag(sdk.items.flags.Runeword) because randomly socketed items return false for it
           */

          if ((!reroll && !item.getItem()) || (reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries))) {
            if (!ethFlag || (ethFlag === Roll.Eth && item.ethereal) || (ethFlag === Roll.NonEth && !item.ethereal)) {
              return copyUnit(item);
            }
          }
        }
      } while (typeof base !== "object" && item.getNext());
    }

    return false;
  },

  /** 
   * @param {ItemUnit} base 
   * @param {ItemUnit} rune 
   * @returns {boolean}
   */
  socketItem: function (base, rune) {
    if (!rune.toCursor()) return false;

    for (let i = 0; i < 3; i += 1) {
      clickItem(sdk.clicktypes.click.item.Left, base.x, base.y, base.location);

      let tick = getTickCount();

      while (getTickCount() - tick < 2000) {
        if (!me.itemoncursor) {
          delay(300);

          return true;
        }

        delay(10);
      }
    }

    return false;
  },

  getScroll: function () {
    let scroll = me.getItem(sdk.items.ScrollofTownPortal, sdk.items.mode.inStorage); // check if we already have the scroll
    if (scroll) return scroll;

    let npc = Town.initNPC("Shop");
    if (!npc) return false;

    scroll = npc.getItem(sdk.items.ScrollofTownPortal);

    if (scroll) {
      for (let i = 0; i < 3; i += 1) {
        scroll.buy(true);

        if (me.getItem(sdk.items.ScrollofTownPortal)) {
          break;
        }
      }
    }

    me.cancel();

    return me.getItem(sdk.items.ScrollofTownPortal, sdk.items.mode.inStorage);
  },

  makeRunewords: function () {
    if (!Config.MakeRunewords) return false;

    while (true) {
      this.buildLists();

      let items = this.checkRunewords(); // get a runeword. format = [base, runes...]

      // can't make runewords - exit loop
      if (!items) {
        break;
      }

      if (!Town.openStash()) return false;

      for (let i = 1; i < items.length; i += 1) {
        this.socketItem(items[0], items[i]);
      }

      const madeItem = items[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "");

      console.log("ÿc4Runewords: ÿc0Made runeword: " + madeItem);
      D2Bot.printToConsole("Made runeword: " + madeItem, sdk.colors.D2Bot.Green);

      if (NTIP.CheckItem(items[0], this.pickitEntries)) {
        Item.logger("Runeword Kept", items[0]);
        Item.logItem("Runeword Kept", items[0]);
      }
    }

    me.cancel();

    this.rerollRunewords();

    return true;
  },

  rerollRunewords: function () {
    for (let i = 0; i < Config.Runewords.length; i += 1) {
      let hel = me.getItem(sdk.items.runes.Hel, sdk.items.mode.inStorage);
      if (!hel) return false;

      const [runeword, wantedBase, ethFlag] = Config.Runewords[i];
      let base = this.getBase(runeword, wantedBase, (ethFlag || 0), true); // get a bad runeword

      if (base) {
        let scroll = this.getScroll();

        // failed to get scroll or open stash most likely means we're stuck somewhere in town, so it's better to return false
        if (!scroll || !Town.openStash() || !Cubing.emptyCube()) return false;

        // not a fatal error, if the cube can't be emptied, the func will return false on next cycle
        if (!Storage.Cube.MoveTo(base) || !Storage.Cube.MoveTo(hel) || !Storage.Cube.MoveTo(scroll)) {
          continue;
        }

        // probably only happens on server crash
        if (!Cubing.openCube()) return false;

        let baseRw = base.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "");

        console.log("ÿc4Runewords: ÿc0Rerolling runeword: " + baseRw);
        D2Bot.printToConsole("Rerolling runeword: " + baseRw, sdk.colors.D2Bot.Green);
        transmute();
        delay(500);

        // can't pull the item out = no space = fail
        if (!Cubing.emptyCube()) return false;
      }
    }

    this.buildLists();

    while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
      me.cancel();
      delay(300);
    }

    return true;
  }
};
