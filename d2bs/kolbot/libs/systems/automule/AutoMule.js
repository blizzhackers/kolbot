/* eslint-disable max-len */
/**
*  @filename    AutoMule.js
*  @author      kolton, theBGuy
*  @desc        Main driver for Mule system
*               For Mules setup @see MuleConfig.js
*               For TorchAnniMules setup @see TorchAnniMules.js
*
*/

const AutoMule = {
  /** @type {Object.<string, muleObj>} */
  Mules: Object.assign({},
    require("./config/MuleConfig", null, false)
  ),
  
  /** @type {Object.<string, muleObj>} */
  TorchAnniMules: Object.assign({},
    require("./config/TorchAnniMules", null, false)
  ),

  inGame: false,
  check: false,
  torchAnniCheck: false,
  gids: new Set(),
  baseGids: new Set(),

  // ################################## //
  /* ##### Master/Muler Functions ##### */
  // ################################## //

  /**
   * Get mule and torchanni mule info if it exists
   * @returns {muleObj | {}}
   */
  getInfo: function () {
    let info;

    for (let i in this.Mules) {
      if (this.Mules.hasOwnProperty(i)) {
        for (let profile of this.Mules[i].enabledProfiles) {
          if (String.isEqual(profile, "all") || String.isEqual(profile, me.profile)) {
            !info && (info = {});
            info.muleInfo = this.Mules[i];

            break;
          }
        }
      }
    }

    for (let i in this.TorchAnniMules) {
      if (this.TorchAnniMules.hasOwnProperty(i)) {
        for (let profile of this.TorchAnniMules[i].enabledProfiles) {
          if (String.isEqual(profile, "all") || String.isEqual(profile, me.profile)) {
            !info && (info = {});
            info.torchMuleInfo = this.TorchAnniMules[i];

            break;
          }
        }
      }
    }

    return info;
  },

  muleCheck: function () {
    let info = this.getInfo();

    if (info && info.hasOwnProperty("muleInfo")) {
      let items = this.getMuleItems();

      if (info.muleInfo.hasOwnProperty("usedStashTrigger") && info.muleInfo.hasOwnProperty("usedInventoryTrigger")
        && Storage.Inventory.UsedSpacePercent() >= info.muleInfo.usedInventoryTrigger
        && Storage.Stash.UsedSpacePercent() >= info.muleInfo.usedStashTrigger && items.length > 0) {
        D2Bot.printToConsole("MuleCheck triggered!", sdk.colors.D2Bot.DarkGold);

        return true;
      }

      for (let i = 0; i < items.length; i += 1) {
        if (this.matchItem(items[i], Config.AutoMule.Trigger)) {
          D2Bot.printToConsole("MuleCheck triggered!", sdk.colors.D2Bot.DarkGold);
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Find a mule that matches our wanted check
   * @returns {muleObj | false}
   */
  getMule: function () {
    let info = this.getInfo();

    if (info) {
      if (this.check && info.hasOwnProperty("muleInfo")) return info.muleInfo;
      if (this.torchAnniCheck && info.hasOwnProperty("torchMuleInfo")) return info.torchMuleInfo;
    }

    return false;
  },

  outOfGameCheck: function () {
    if (!this.check && !this.torchAnniCheck) return false;

    let muleObj = this.getMule();
    if (!muleObj) return false;

    function muleCheckEvent (mode, msg) {
      mode === 10 && (muleInfo = JSON.parse(msg));
    }

    let stopCheck = false;
    let once = false;
    let muleInfo = { status: "" };
    let failCount = 0;
    let Controls = require("../../modules/Control");

    if (!muleObj.continuousMule || !muleObj.skipMuleResponse) {
      addEventListener("copydata", muleCheckEvent);
    }

    if (muleObj.continuousMule) {
      D2Bot.printToConsole("Starting mule.", sdk.colors.D2Bot.DarkGold);
      D2Bot.start(muleObj.muleProfile);
    } else {
      D2Bot.printToConsole(
        "Starting " + (this.torchAnniCheck === 2 ? "anni " : this.torchAnniCheck === 1 ? "torch " : "")
        + "mule profile: " + muleObj.muleProfile,
        sdk.colors.D2Bot.DarkGold
      );
    }

    const mulePayload = JSON.stringify({ profile: me.profile, mode: this.torchAnniCheck || 0 });

    MainLoop:
    while (true) {
      // Set status to ready if using continuous mule with no response check
      if (muleObj.continuousMule && muleObj.skipMuleResponse) {
        muleInfo.status = "ready";
        
        // If nothing received our copy data start the mule profile
      } else if (!sendCopyData(null, muleObj.muleProfile, 10, mulePayload) && !muleObj.continuousMule) {
        // if the mule profile isn't already running and there is a profile to be stopped, stop it before starting the mule profile
        if (!stopCheck && muleObj.stopProfile && !String.isEqual(me.profile, muleObj.stopProfile)) {
          D2Bot.stop(muleObj.stopProfile, muleObj.stopProfileKeyRelease);
          stopCheck = true;
          delay(2000); // prevents cd-key in use error if using -skiptobnet on mule profile
        }

        D2Bot.start(muleObj.muleProfile);
      }

      delay(1000);

      switch (muleInfo.status) {
      case "loading":
        if (!muleObj.continuousMule && !stopCheck && muleObj.stopProfile
          && !String.isEqual(me.profile, muleObj.stopProfile)) {
          D2Bot.stop(muleObj.stopProfile, muleObj.stopProfileKeyRelease);

          stopCheck = true;
        }

        failCount += 1;

        break;
      case "busy":
      case "begin":
        D2Bot.printToConsole("Mule profile is busy.", sdk.colors.D2Bot.Red);

        break MainLoop;
      case "ready":
        Starter.LocationEvents.openJoinGameWindow();

        delay(2000);

        AutoMule.inGame = true;
        me.blockMouse = true;

        try {
          joinGame(muleObj.muleGameName[0], muleObj.muleGameName[1]);
        } catch (joinError) {
          delay(100);
        }

        me.blockMouse = false;

        // Untested change 11.Feb.14.
        for (let i = 0; i < 8; i += 1) {
          delay(1000);

          if (me.ingame && me.gameReady) {
            break MainLoop;
          }
        }

        if (!once && getLocation() === sdk.game.locations.GameIsFull) {
          Controls.CreateGameWindow.click();
          Starter.LocationEvents.openJoinGameWindow();
          // how long should we wait?
          once = true;
          let date = new Date();
          let dateString = "[" + new Date(
            date.getTime() + Time.minutes(3) - (date.getTimezoneOffset() * 60000)
          ).toISOString().slice(0, -5).replace(/-/g, "/").replace("T", " ") + "]";
          console.log("Game is full so lets hangout for a bit before we try again. Next attempt at " + dateString);
        }

        if (muleObj.continuousMule && muleObj.skipMuleResponse && !me.ingame) {
          D2Bot.printToConsole("Unable to join mule game", sdk.colors.D2Bot.Red);

          break MainLoop;
        }

        break;
      default:
        failCount += 1;

        break;
      }

      if (failCount >= 260) {
        D2Bot.printToConsole("No response from mule profile.", sdk.colors.D2Bot.Red);

        break;
      }
    }

    removeEventListener("copydata", muleCheckEvent);

    while (me.ingame) {
      delay(1000);
    }

    AutoMule.inGame = false;
    AutoMule.check = false;
    AutoMule.torchAnniCheck = false;

    // No response - stop mule profile
    if (!muleObj.continuousMule) {
      if (failCount >= 60) {
        D2Bot.stop(muleObj.muleProfile, true);
        delay(1000);
      }

      if (stopCheck && muleObj.stopProfile) {
        D2Bot.start(muleObj.stopProfile);
      }
    }

    return true;
  },

  inGameCheck: function () {
    let muleObj, tick;
    let begin = false;
    let timeout = Time.minutes(4); // Ingame mule timeout
    let status = "muling";

    // Single player
    if (!me.gamename) return false;

    let info = this.getInfo();

    // Profile is not a part of AutoMule
    if (!info) return false;

    // Profile is not in mule or torch mule game
    if (!((info.hasOwnProperty("muleInfo") && String.isEqual(me.gamename, info.muleInfo.muleGameName[0]))
        || (info.hasOwnProperty("torchMuleInfo") && String.isEqual(me.gamename, info.torchMuleInfo.muleGameName[0])))) {
      return false;
    }

    function dropStatusEvent (mode, msg) {
      if (mode === 10) {
        switch (JSON.parse(msg).status) {
        case "report": // reply to status request
          sendCopyData(null, muleObj.muleProfile, 12, JSON.stringify({ status: status }));

          break;
        case "quit": // quit command
          status = "quit";

          break;
        }
      }
    }

    function muleModeEvent (msg) {
      switch (msg) {
      case "2":
      case "1":
        AutoMule.torchAnniCheck = Number(msg);

        break;
      case "0":
        AutoMule.check = true;
      }
    }

    try {
      addEventListener("scriptmsg", muleModeEvent);
      scriptBroadcast("getMuleMode");
      delay(500);

      if (!this.check && !this.torchAnniCheck) {
        throw new Error("Error - Unable to determine mule mode");
      }

      muleObj = this.getMule();
      me.maxgametime = 0;

      !muleObj.continuousMule && addEventListener("copydata", dropStatusEvent);

      if (!Town.goToTown(1)) {
        throw new Error("Error - Failed to go to Act 1");
      }

      Town.move("stash");

      if (muleObj.continuousMule) {
        console.log("ÿc4AutoMuleÿc0: Looking for valid mule");
        tick = getTickCount();

        while (getTickCount() - tick < timeout) {
          if (this.verifyMulePrefix(muleObj.charPrefix)) {
            console.log("ÿc4AutoMuleÿc0: Found valid mule");
            begin = true;

            break;
          }

          delay(2000);
        }

        if (!begin) {
          throw new Error("Error - Unable to find mule character");
        }
      } else {
        console.debug("MuleProfile :: " + muleObj.muleProfile);
        sendCopyData(null, muleObj.muleProfile, 11, "begin");
      }

      let gameType = this.torchAnniCheck === 2
        ? " anni"
        : this.torchAnniCheck === 1
          ? " torch"
          : "";
      console.log("ÿc4AutoMuleÿc0: In" + gameType + " mule game.");
      D2Bot.updateStatus("AutoMule: In" + gameType + " mule game.");
      
      if (this.torchAnniCheck === 2) {
        this.dropCharm(true);
      } else if (this.torchAnniCheck === 1) {
        this.dropCharm(false);
      } else {
        this.dropStuff();
      }

      status = "done";
      tick = getTickCount();

      while (true) {
        if (muleObj.continuousMule) {
          if (this.isFinished()) {
            D2Bot.printToConsole("Done muling.", sdk.colors.D2Bot.DarkGold);
            status = "quit";
          } else {
            delay(5000);
          }
        }

        if (status === "quit") {
          break;
        }

        if (getTickCount() - tick > timeout) {
          if (Misc.getPlayerCount() > 1) {
            // we aren't alone currently so chill for a bit longer
            tick = getTickCount();
            Packet.questRefresh(); // to prevent disconnect from idleing
          } else {
            D2Bot.printToConsole("Mule didn't rejoin. Picking up items.", sdk.colors.D2Bot.Red);
            Misc.useItemLog = false; // Don't log items picked back up in town.
            Pickit.pickItems();

            break;
          }
        }

        delay(500);
      }
      
      return true;
    } catch (e) {
      console.error(e);

      return false;
    } finally {
      removeEventListener("scriptmsg", muleModeEvent);
      removeEventListener("copydata", dropStatusEvent);
      
      if (muleObj && !muleObj.continuousMule) {
        D2Bot.stop(muleObj.muleProfile, true);
        delay(1000);
        muleObj.stopProfile && D2Bot.start(muleObj.stopProfile);
      }

      delay(2000);
      quit();
    }
  },

  /**
   * finished if no items are on ground
   */
  isFinished: function () {
    let item = Game.getItem();

    if (item) {
      do {
        // check if the items we dropped are on the ground still
        if (getDistance(me, item) < 20
          && item.onGroundOrDropping
          && AutoMule.gids.has(item.gid)) {
          return false;
        }
      } while (item.getNext());
    }

    // we are finished so reset gid list
    AutoMule.gids.clear();

    return true;
  },

  /**
   * make sure mule character is in game
   * @param {string} mulePrefix 
   */
  verifyMulePrefix: function (mulePrefix) {
    try {
      let player = getParty();

      if (player) {
        let regex = new RegExp(mulePrefix, "i");

        do {
          // case insensitive matching
          if (player.name.match(regex)) {
            return true;
          }
        } while (player.getNext());
      }
    } catch (e) {
      delay(100);
    }

    return false;
  },

  /**
   * Transfer items to waiting mule
   * @returns {boolean}
   */
  dropStuff: function () {
    if (!Town.openStash()) return false;

    let items = (this.getMuleItems() || []);
    if (items.length === 0) return false;
    items.forEach(item => AutoMule.gids.add(item.gid));

    D2Bot.printToConsole("AutoMule: Transfering " + items.length + " items.", sdk.colors.D2Bot.DarkGold);
    D2Bot.printToConsole("AutoMule: " + JSON.stringify(items.map(i => i.prettyPrint)), sdk.colors.D2Bot.DarkGold);
    
    items.forEach(item => item.drop());
    delay(1000);
    me.cancel();

    // clean up stash
    Storage.Stash.SortItems();
    me.cancelUIFlags();

    return true;
  },

  /**
   * @param {ItemUnit} item 
   * @param {string[] | number[]} list 
   * @returns {boolean}
   */
  matchItem: function (item, list) {
    let parsedPickit = [], classIDs = [];

    for (let i = 0; i < list.length; i += 1) {
      let info = {
        file: "Character Config",
        line: list[i]
      };

      // classids
      if (typeof list[i] === "number") {
        classIDs.push(list[i]);
      } else if (typeof list[i] === "string") {
        // pickit entries
        let parsedLine = NTIP.ParseLineInt(list[i], info);
        parsedLine && parsedPickit.push(parsedLine);
      }
    }

    return (classIDs.includes(item.classid) || NTIP.CheckItem(item, parsedPickit));
  },

  /**
   * get a list of items to mule
   * @returns {ItemUnit[] | false}
   */
  getMuleItems: function () {
    let info = this.getInfo();
    if (!info || !info.hasOwnProperty("muleInfo")) return false;

    const muleOrphans = !!(info.muleInfo.hasOwnProperty("muleOrphans") && info.muleInfo.muleOrphans);

    /** @param {ItemUnit} item */
    const isAKey = function (item) {
      return [
        sdk.items.quest.KeyofTerror,
        sdk.items.quest.KeyofHate,
        sdk.items.quest.KeyofDestruction
      ].includes(item.classid);
    };
    
    /**
     * check if wanted by any of the systems
     * @param {ItemUnit} item
     * @returns {boolean} if item is wanted by various systems
     */
    const isWanted = function (item) {
      return (AutoMule.cubingIngredient(item)
        || AutoMule.runewordIngredient(item)
        || AutoMule.utilityIngredient(item)
      );
    };

    let items = me.getItemsEx()
      .filter(function (item) {
        // we don't mule items that are equipped or are junk
        if (!item.isInStorage || Town.ignoreType(item.itemType)) return false;
        // don't mule excluded items
        if (AutoMule.matchItem(item, Config.AutoMule.Exclude)) return false;
        // Don't mule cube/torch/annihilus
        if (item.isAnni || item.isTorch || item.classid === sdk.quest.item.Cube) return false;
        // don't mule items in locked spots
        if (item.isInInventory && Storage.Inventory.IsLocked(item, Config.Inventory)) return false;
        // don't mule items wanted by one of the various systems - checks that it's not on the force mule list
        if (isWanted(item) && !AutoMule.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger))) {
          return false;
        }
        // don't mule keys if part of torchsystem
        if (isAKey(item) && TorchSystem.getFarmers() && TorchSystem.isFarmer()) return false;
        // we've gotten this far, mule items that are on the force list
        if (AutoMule.matchItem(item, Config.AutoMule.Force.concat(Config.AutoMule.Trigger))) return true;
        // alright that handles the basics -- now normal pickit check
        let pResult = Pickit.checkItem(item).result;
        // if it's a junk item, we don't want it
        if ([Pickit.Result.UNID, Pickit.Result.UNWANTED, Pickit.Result.TRASH].includes(pResult)) {
          return (item.isInStash && muleOrphans);
        }
        // we've made it this far, we want it
        return true;
      });

    return items;
  },

  /**
   * Wanted by CraftingSystem
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  utilityIngredient: function (item) {
    if (!item) return false;
    return CraftingSystem.validGids.includes(item.gid);
  },

  /**
   * check if an item is a cubing ingredient
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  cubingIngredient: function (item) {
    if (!item) return false;

    return Cubing.validIngredients.some(function (ingred) {
      return (item.gid === ingred.gid);
    });
  },

  /**
   * check if an item is a runeword ingredient - rune, empty base or bad rolled base
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  runewordIngredient: function (item) {
    if (!item) return false;
    if (Runewords.validGids.includes(item.gid)) return true;

    if (!this.baseGids.size) {
      for (let i = 0; i < Config.Runewords.length; i += 1) {
        const [runeword, base, ethFlag] = Config.Runewords[i];
        let baseItem = (Runewords.getBase(runeword, base, (ethFlag || 0))
          || Runewords.getBase(runeword, base, (ethFlag || 0), true)
        );
        baseItem && this.baseGids.add(baseItem.gid);
      }
    }

    return this.baseGids.has(item.gid);
  },

  /**
   * Drop Anni or Torch
   * @param {boolean} dropAnni 
   * @returns {boolean}
   */
  dropCharm: function (dropAnni) {
    if (!Town.openStash()) return false;

    let item;
    let items = me.getItemsEx()
      .filter(function (item) {
        return item.isInStorage && item.isCharm && item.unique;
      });
    if (!items.length) return false;

    if (dropAnni) {
      item = items.find(function (item) {
        return item.isAnni && !Storage.Inventory.IsLocked(item, Config.Inventory);
      });
      if (!item) return false;

      D2Bot.printToConsole("AutoMule: Transfering Anni.", sdk.colors.D2Bot.DarkGold);
    } else {
      item = items.find(function (item) {
        return item.isTorch;
      });
      if (!item) return false;

      D2Bot.printToConsole("AutoMule: Transfering Torch.", sdk.colors.D2Bot.DarkGold);
    }

    item.drop();
    delay(1000);
    me.cancel() && me.cancel();

    return true;
  },
};
