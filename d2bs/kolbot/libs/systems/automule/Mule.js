/**
*  @filename    Mule.js
*  @author      theBGuy
*  @desc        Main lib for the Mule
*
*  @typedef {import("./sdk/globals")}
*  @typedef {import("./libs/systems/mulelogger/MuleLogger")}
*/

/**
 * Mule Data object manipulates external mule datafile
 */
const MuleData = {
  _default: {
    account: "",
    accNum: 0,
    character: "",
    charNum: 0,
    fullChars: [],
    torchChars: []
  },
  fileName: "",
  // create a new mule datafile
  create: function () {
    let string = JSON.stringify(this._default);
    FileTools.writeText(this.fileName, string);
  },

  // read data from the mule datafile and return the data object
  read: function () {
    try {
      let string = FileTools.readText(this.fileName);
      let obj = JSON.parse(string);
      
      return obj;
    } catch (e) {
      console.error(e);
      this.create();

      return this._default;
    }
  },

  // write a data object to the mule datafile
  write: function (obj) {
    let string = JSON.stringify(obj);
    FileTools.writeText(this.fileName, string);
  },

  // set next account - increase account number in mule datafile
  nextAccount: function () {
    let obj = MuleData.read();

    obj.accNum += 1;
    obj.account = Mule.obj.accountPrefix + obj.accNum;

    MuleData.write(Object.assign(this._default, { accNum: obj.accNum, account: obj.account }));

    return obj.account;
  },

  nextChar: function () {
    console.trace();
    let charSuffix = "";
    const charNumbers = "abcdefghijklmnopqrstuvwxyz";
    const obj = MuleData.read();

    // dirty
    obj.charNum > 25 && (obj.charNum = 0);
    let num = obj.accNum.toString();

    for (let i = 0; i < num.length; i++) {
      charSuffix += charNumbers[parseInt(num[i], 10)];
    }

    charSuffix += charNumbers[obj.charNum];
    obj.charNum = obj.charNum + 1;
    obj.character = Mule.obj.charPrefix + charSuffix;

    MuleData.write(obj);

    return obj.character;
  },
};

const Mule = {
  /** @type {muleObj} */
  obj: null,
  minGameTime: 0,
  maxGameTime: 0,
  continuous: false,
  makeNext: false,
  next: false,
  refresh: false,
  master: "",
  mode: -1,
  fileName: "",
  startTick: 0,
  status: "loading",
  statusString: "",
  masterStatus: { status: "" },
  droppedGids: new Set(),

  waitForMaster: function () {
    console.log("Waiting for muler");
    // forever alone check?
    Misc.poll(() => Mule.status === "begin", Time.minutes(3), 100);

    if (Mule.status !== "begin") {
      if (Mule.foreverAlone() && !getUnits(sdk.unittype.Item).filter(i => i.onGroundOrDropping).length) {
        D2Bot.printToConsole("Nobody joined - stopping.", sdk.colors.D2Bot.Red);
        D2Bot.stop(me.profile, true);
      } else {
        console.debug("No response from master, but items on ground. Setting status to begin.");
        Mule.status = "begin";
      }
    }

    me.overhead("begin");
    console.debug("begin");
  },
  /**
   * @todo check if there are any other profiles that need to mule while we are already in game?
   */
  done: function () {
    !Mule.obj.onlyLogWhenFull && MuleLogger.logChar();

    let obj = MuleData.read();

    if (Mule.checkAnniTorch() && obj.torchChars.indexOf(me.name) === -1) {
      obj.torchChars.push(me.name);
    }

    MuleData.write(obj);
    D2Bot.printToConsole("Done muling.", sdk.colors.D2Bot.DarkGold);
    console.log("Done muling");
    sendCopyData(null, Mule.master, 10, JSON.stringify({ status: "quit" }));
    D2Bot.stop(me.profile, true);
  },

  nextChar: function () {
    MuleLogger.logChar();
    delay(500);

    // Mule.makeNext = true;
    let obj = MuleData.read();

    if (Mule.checkAnniTorch() && obj.torchChars.indexOf(me.name) === -1) {
      obj.torchChars.push(me.name);
    }

    if (obj.fullChars.indexOf(me.name) === -1) {
      obj.fullChars.push(me.name);
      MuleData.write(obj);
    }
    let nextMule = MuleData.nextChar();
    D2Bot.printToConsole("Mule full, getting next character (" + nextMule + " )", sdk.colors.D2Bot.DarkGold);

    if (Mule.minGameTime && getTickCount() - Mule.startTick < Mule.minGameTime * 1000) {
      while (getTickCount() - Mule.startTick < Mule.minGameTime * 1000) {
        me.overhead(
          "Stalling for " + Math.round(((Mule.startTick + (Mule.minGameTime * 1000)) - getTickCount()) / 1000)
          + " Seconds"
        );
        delay(1000);
      }
    }

    Mule.quit();
  },
  
  quit: function () {
    Mule.cursorCheck();
    console.log("ÿc8Mule game duration ÿc2" + (Time.format(getTickCount() - me.gamestarttime)));

    try {
      quit();
    } finally {
      while (me.ingame) {
        delay(100);
      }
    }

    return true;
  },
  foreverAlone: function () {
    let party = getParty();

    if (party) {
      do {
        if (party.name !== me.name) return false;
      } while (party.getNext());
    }

    return true;
  },

  checkAnniTorch: function () {
    while (!me.gameReady) {
      delay(500);
    }

    return me.getItemsEx()
      .some(i => i.isInStorage && (i.isAnni || i.isTorch));
  },

  stashItems: function () {
    me.getItemsEx()
      .filter(item => item.isInInventory)
      .sort((a, b) => (b.sizex * b.sizey - a.sizex * a.sizey))
      .forEach(item => {
        Storage.Stash.CanFit(item) && Storage.Stash.MoveTo(item);
      });

    return true;
  },

  cursorCheck: function () {
    let cursorItem = Game.getCursorUnit();

    if (cursorItem) {
      if (!Storage.Inventory.CanFit(cursorItem) || !Storage.Inventory.MoveTo(cursorItem)) {
        console.warn("Can't place " + cursorItem.prettyPrint + " in inventory");
        cursorItem.drop();
      }
    }
    
    return true;
  },

  getGroundItems: function () {
    return getUnits(sdk.unittype.Item)
      .filter(i => i.distance < 20 && i.onGroundOrDropping && !Town.ignoreType(i.itemType));
  },

  pickItems: function () {
    /** @type {ItemUnit[]} */
    let list = [];
    let waitTick = getTickCount();
    let rval = "ready";
    let override = false;

    if (!Mule.clearedJunk) {
      me.getItemsEx()
        .filter(function (item) {
          return (item.isInInventory
            && Town.ignoreType(item.itemType)
            && (Mule.mode === 0 || item.classid !== sdk.items.ScrollofIdentify)
          );
        })
        .forEach(function (item) {
          try {
            item.drop();
          } catch (e) {
            console.warn("Failed to drop an item.");
          }
        });
      Mule.clearedJunk = true; // only do this once
    }

    while (me.gameReady) {
      if (Mule.masterStatus.status === "done" || Mule.continuous || override) {
        override = false;
        let item = Game.getItem();

        if (item) {
          list = Mule.getGroundItems();
          Mule.droppedGids.forEach(function (gid) {
            if (gid > 0 && !list.some(i => i.gid === gid)) {
              item = Game.getItem(-1, -1, gid);
              if (item && !Town.ignoreType(item.itemType)) {
                list.push(item);
              }
            }
          });
          Mule.droppedGids.clear();
        }

        // If and only if there is nothing left are we "done"
        if (list.length === 0) {
          rval = Mule.continuous ? "ready" : "done";

          break;
        }

        /**
         * pick large items first by sorting items by size in descending order
         * and move gheed's charm to the end of the list
         */
        list.sort(function (a, b) {
          if (a.isGheeds && !Pickit.canPick(a)) return 1;
          if (b.isGheeds && !Pickit.canPick(b)) return -1;

          return (b.sizex * b.sizey - a.sizex * a.sizey);
        });

        while (list.length > 0) {
          item = list.shift();
          let canFit = Storage.Inventory.CanFit(item);

          // Torch and Anni handling
          if (Mule.mode > 0 && (item.isAnni || item.isTorch) && !Pickit.canPick(item)) {
            let msg = item.classid === sdk.items.LargeCharm
              ? "Mule already has a Torch."
              : "Mule already has a Anni.";
            D2Bot.printToConsole(msg, sdk.colors.D2Bot.DarkGold);
            rval = "next";
          }

          // Gheed's Fortune handling
          if (item.isGheeds && !Pickit.canPick(item)) {
            D2Bot.printToConsole("Mule already has Gheed's.", sdk.colors.D2Bot.DarkGold);
            rval = "next";
          }

          if (!canFit && Mule.stashItems()) {
            canFit = Storage.Inventory.CanFit(item);
          }

          canFit
            ? Pickit.pickItem(item)
            : (rval = "next");
        }

        if (rval === "next") {
          break;
        }
      } else {
        if (!Mule.continuous) {
          sendCopyData(null, Mule.master, 10, JSON.stringify({ status: "report" }));
          Misc.poll(() => Mule.masterStatus.status === "done", Time.seconds(5), 50);
        } else {
          if (getTickCount() - waitTick > Time.minutes(10)) {
            break;
          }
        }
        // safety check
        if (getTickCount() - waitTick > Time.minutes(3) && Mule.getGroundItems().length) {
          override = true;
        }
      }

      delay(500);
    }

    return rval;
  },

  /**
   * @param {number} time 
   */
  ingameTimeout: function (time) {
    let tick = getTickCount();

    while (getTickCount() - tick < time) {
      if (me.ingame && me.gameReady && !!me.area) break;

      // game doesn't exist, might need more locs
      if (getLocation() === sdk.game.locations.GameDoesNotExist) {
        break;
      }

      delay(100);
    }

    return (me.ingame && me.gameReady && !!me.area);
  },

  /**
   * @param {{ profile: string, mode: number }} info 
   * @returns {{ profile: string, mode: number }} master info
   */
  getMaster: function (info) {
    const muleObj = info.mode === 1
      ? AutoMule.TorchAnniMules
      : AutoMule.Mules;

    for (let i in muleObj) {
      if (muleObj.hasOwnProperty(i)) {
        const { enabledProfiles } = muleObj[i];
        if (!enabledProfiles.length) continue;
        for (let profile of enabledProfiles) {
          if (String.isEqual(profile, info.profile)) {
            return {
              profile: profile,
              mode: info.mode
            };
          } else if (profile === "all") {
            return {
              profile: info.profile, // set whoever is asking as master
              mode: info.mode
            };
          }
        }
      }
    }

    return false;
  },

  /**
   * @param {number} mode 
   * @param {string} master 
   * @param {boolean} continuous 
   * @returns {string}
   */
  getMuleFilename: function (mode, master, continuous = false) {
    mode = mode || 0;
    let file;
    const mule = mode > 0 ? AutoMule.TorchAnniMules : AutoMule.Mules;

    // Iterate through mule object
    for (let i in mule) {
      if (mule.hasOwnProperty(i)) {
        const {
          muleProfile,
          enabledProfiles,
          accountPrefix,
          continuousMule,
        } = mule[i];
        // Mule profile matches config
        if (muleProfile && String.isEqual(muleProfile, me.profile)
          && (continuous || enabledProfiles.includes(master) || enabledProfiles.includes("all"))) {
          if (continuous && !continuousMule) continue;
          file = mode === 0
            ? "logs/AutoMule." + i + ".json"
            : "logs/TorchMule." + i + ".json";
          
          // If file exists check for valid info
          if (FileTools.exists(file)) {
            try {
              let jsonStr = FileTools.readText(file);
              let jsonObj = JSON.parse(jsonStr);

              // Return filename containing correct mule info
              if (accountPrefix && jsonObj.account && jsonObj.account.match(accountPrefix)) {
                return file;
              }
            } catch (e) {
              console.error(e);
            }
          } else {
            return file;
          }
        }
      }
    }

    // File exists but doesn't contain valid info - remake
    FileTools.remove(file);

    return file;
  },

  /** @returns {{ mode: number, obj: muleObj }[]} */
  getMuleInfo: function () {
    const data = [];
    /**
     * @param {muleObj} muleObj 
     * @param {number} mode 
     */
    const checkObj = function (muleObj, mode) {
      let { muleProfile } = muleObj;
      if (muleProfile && String.isEqual(muleProfile, me.profile)) {
        data.push({
          mode: mode,
          obj: muleObj,
        });
      }
    };
    
    for (let i in AutoMule.Mules) {
      if (AutoMule.Mules.hasOwnProperty(i)) {
        checkObj(AutoMule.Mules[i], 0);
      }
    }
    
    for (let i in AutoMule.TorchAnniMules) {
      if (AutoMule.TorchAnniMules.hasOwnProperty(i)) {
        checkObj(AutoMule.TorchAnniMules[i], 1);
      }
    }
    return data;
  },
};
