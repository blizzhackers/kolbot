/**
*  @filename    Misc.js
*  @author      kolton, theBGuy
*  @desc        Misc library for functions that don't fit neatly into another namespace
*  contains clickhandling, shrine/chest/player locating, ect 
*
*/

const Misc = {
  /**
   * Click something
   * @param {number} button 
   * @param {number} shift 
   * @param {number | Unit} [x] 
   * @param {number} [y] 
   * @returns {boolean}
   */
  click: function (button, shift, x, y) {
    if (arguments.length < 2) throw new Error("Misc.click: Needs at least 2 arguments.");

    while (!me.gameReady) {
      delay(100);
    }

    switch (arguments.length) {
    case 2:
      me.blockMouse = true;
      clickMap(button, shift, me.x, me.y);
      delay(20);
      clickMap(button + 2, shift, me.x, me.y);
      me.blockMouse = false;

      break;
    case 3:
      if (typeof (x) !== "object") throw new Error("Misc.click: Third arg must be a Unit.");

      me.blockMouse = true;
      clickMap(button, shift, x);
      delay(20);
      clickMap(button + 2, shift, x);
      me.blockMouse = false;

      break;
    case 4:
      me.blockMouse = true;
      clickMap(button, shift, x, y);
      delay(20);
      clickMap(button + 2, shift, x, y);
      me.blockMouse = false;

      break;
    }

    return true;
  },

  /**
   * Check if a player is in your party
   * @param {string} name 
   * @returns {boolean}
   */
  inMyParty: function (name) {
    if (me.name === name) return true;

    while (!me.gameReady) {
      delay(100);
    }

    let player, myPartyId;

    try {
      player = getParty();
      if (!player) return false;

      myPartyId = player.partyid;
      player = getParty(name); // May throw an error

      if (player && player.partyid !== sdk.party.NoParty && player.partyid === myPartyId) {
        return true;
      }
    } catch (e) {
      player = getParty();

      if (player) {
        myPartyId = player.partyid;

        while (player.getNext()) {
          if (player.partyid !== sdk.party.NoParty && player.partyid === myPartyId) {
            return true;
          }
        }
      }
    }

    return false;
  },

  // Find a player
  findPlayer: function (name) {
    let player = getParty();

    if (player) {
      do {
        if (player.name !== me.name && player.name === name) {
          return player;
        }
      } while (player.getNext());
    }

    return false;
  },

  // Get player unit
  getPlayerUnit: function (name) {
    let player = Game.getPlayer(name);

    if (player) {
      do {
        if (!player.dead) {
          return player;
        }
      } while (player.getNext());
    }

    return false;
  },

  // Get the player act, accepts party unit or name
  getPlayerAct: function (player) {
    if (!player) return false;

    let unit = (typeof player === "object" ? player : this.findPlayer(player));

    return unit ? sdk.areas.actOf(unit.area) : false;
  },

  // Get number of players within getUnit distance
  getNearbyPlayerCount: function () {
    let count = 0;
    let player = Game.getPlayer();

    if (player) {
      do {
        if (player.name !== me.name && !player.dead) {
          count += 1;
        }
      } while (player.getNext());
    }

    return count;
  },

  // Get total number of players in game
  getPlayerCount: function () {
    let count = 0;
    let party = getParty();

    if (party) {
      do {
        count += 1;
      } while (party.getNext());
    }

    return count;
  },

  // Get total number of players in game and in my party
  getPartyCount: function () {
    let count = 0;
    let party = getParty();

    if (party) {
      let myPartyId = party.partyid;
      
      do {
        if (party.partyid !== sdk.party.NoParty
          && party.partyid === myPartyId
          && party.name !== me.name) {
          print(party.name);
          count += 1;
        }
      } while (party.getNext());
    }

    return count;
  },

  // check if any member of our party meets a certain level req
  checkPartyLevel: function (levelCheck = 1, exclude = []) {
    !Array.isArray(exclude) && (exclude = [exclude]);
    let party = getParty();

    if (party) {
      let myPartyId = party.partyid;

      do {
        if (party.partyid !== sdk.party.NoParty && party.partyid === myPartyId
          && party.name !== me.name && !exclude.includes(party.name)) {
          if (party.level >= levelCheck) {
            return true;
          }
        }
      } while (party.getNext());
    }

    return false;
  },

  getPlayerArea: function (player) {
    if (!player) return false;

    let unit = (typeof player === "object" ? player : this.findPlayer(player));

    return !!unit ? unit.area : 0;
  },

  /**
   * autoleader by Ethic - refactored by theBGuy
   * Autodetect leader for leech scripts by looking to see who first enters a certain area
   * @param {{ destination: number | number[], quitIf?: Function, timeout?: number }} givenSettings 
   * @returns 
   */
  autoLeaderDetect: function (givenSettings = {}) {
    const settings = Object.assign({}, {
      destination: -1,
      quitIf: false,
      timeout: Infinity
    }, givenSettings);

    // make destination an array so it's easier to handle both cases
    !Array.isArray(settings.destination) && (settings.destination = [settings.destination]);

    let leader;
    let startTick = getTickCount();
    let check = typeof settings.quitIf === "function";
    do {
      let solofail = 0;
      let suspect = getParty(); // get party object (players in game)

      do {
        // player isn't alone
        suspect.name !== me.name && (solofail += 1);

        if (check && settings.quitIf(suspect.area)) return false;

        // first player not hostile found in destination area...
        if (settings.destination.includes(suspect.area) && !getPlayerFlag(me.gid, suspect.gid, 8)) {
          leader = suspect.name; // ... is our leader
          console.log("ÿc4Autodetected " + leader);

          return leader;
        }
      } while (suspect.getNext());

      // empty game, nothing left to do. Or we exceeded our wait time
      if (solofail === 0 || (getTickCount() - startTick > settings.timeout)) {
        return false;
      }

      delay(500);
    } while (!leader); // repeat until leader is found (or until game is empty)

    return false;
  },

  /**
  * @description Open a chest Unit (takes chestID or unit)
  * @param {Unit | number} unit 
  * @returns {boolean} If we opened the chest
  */
  openChest: function (unit) {
    typeof unit === "number" && (unit = Game.getObject(unit));
    
    // Skip invalid/open and Countess chests
    if (!unit || unit.x === 12526 || unit.x === 12565 || unit.mode) return false;
    // locked chest, no keys
    if (!me.assassin && unit.islocked
      && !me.findItem(sdk.items.Key, sdk.items.mode.inStorage, sdk.storage.Inventory)) {
      return false;
    }

    let specialChest = sdk.quest.chests.includes(unit.classid);

    for (let i = 0; i < 7; i++) {
      // don't use tk if we are right next to it
      let useTK = (unit.distance > 5 && Skill.useTK(unit) && i < 3);
      if (useTK) {
        unit.distance > 13 && Attack.getIntoPosition(unit, 13, sdk.collision.WallOrRanged);
        if (!Packet.telekinesis(unit)) {
          console.debug("Failed to tk: attempt: " + i);
          continue;
        }
      } else {
        [(unit.x + 1), (unit.y + 2)].distance > 5 && Pather.moveTo(unit.x + 1, unit.y + 2, 3);
        (specialChest || i > 2) ? Misc.click(0, 0, unit) : Packet.entityInteract(unit);
      }

      if (Misc.poll(() => unit.mode, 1000, 50)) {
        return true;
      }
      Packet.flash(me.gid);
    }

    // Click to stop walking in case we got stuck
    !me.idle && Misc.click(0, 0, me.x, me.y);

    return false;
  },

  // Open all chests that have preset units in an area
  openChestsInArea: function (area, chestIds = []) {
    !area && (area = me.area);
    area !== me.area && Pather.journeyTo(area);
    
    let presetUnits = Game.getPresetObjects(area);
    if (!presetUnits) return false;

    if (!chestIds.length) {
      chestIds = [
        5, 6, 87, 104, 105, 106, 107, 143, 140, 141, 144, 146, 147, 148, 176, 177, 181, 183, 198, 240, 241,
        242, 243, 329, 330, 331, 332, 333, 334, 335, 336, 354, 355, 356, 371, 387, 389, 390, 391, 397, 405,
        406, 407, 413, 420, 424, 425, 430, 431, 432, 433, 454, 455, 501, 502, 504, 505, 580, 581
      ];
    }

    let coords = [];

    while (presetUnits.length > 0) {
      if (chestIds.includes(presetUnits[0].id)) {
        coords.push({
          x: presetUnits[0].roomx * 5 + presetUnits[0].x,
          y: presetUnits[0].roomy * 5 + presetUnits[0].y
        });
      }

      presetUnits.shift();
    }

    while (coords.length) {
      coords.sort(Sort.units);
      Pather.moveToUnit(coords[0], 1, 2);
      this.openChests(20);

      for (let i = 0; i < coords.length; i += 1) {
        if (getDistance(coords[i].x, coords[i].y, coords[0].x, coords[0].y) < 20) {
          coords.shift();
        }
      }
    }

    return true;
  },

  openChests: function (range = 15) {
    if (!Config.OpenChests.Enabled) return true;

    let unitList = [];
    let containers = [];

    // Testing all container code
    if (Config.OpenChests.Types.some((el) => el.toLowerCase() === "all")) {
      containers = [
        "chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick",
        "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2",
        "tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn",
        "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2",
        "cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar",
        "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl",
        "woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest",
        "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2",
        "icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
      ];
    } else {
      containers = Config.OpenChests.Types;
    }

    let unit = Game.getObject();

    if (unit) {
      do {
        if (unit.name && unit.mode === sdk.objects.mode.Inactive
          && getDistance(me.x, me.y, unit.x, unit.y) <= range
          && containers.includes(unit.name.toLowerCase())) {
          unitList.push(copyUnit(unit));
        }
      } while (unit.getNext());
    }

    while (unitList.length > 0) {
      unitList.sort(Sort.units);
      unit = unitList.shift();

      if (unit) {
        const chest = Game.getObject(-1, -1, unit.gid);
        if (chest && (Pather.useTeleport() || !checkCollision(me, chest, sdk.collision.WallOrRanged))
          && this.openChest(chest)) {
          Pickit.pickItems();
        }
      }
    }

    return true;
  },

  shrineStates: false,

  scanShrines: function (range, ignore = []) {
    if (!Config.ScanShrines.length) return false;

    !range && (range = Pather.useTeleport() ? 25 : 15);
    !Array.isArray(ignore) && (ignore = [ignore]);

    let shrineList = [];

    // Initiate shrine states
    if (!this.shrineStates) {
      Misc.shrineStates = [];

      for (let i = 0; i < Config.ScanShrines.length; i += 1) {
        switch (Config.ScanShrines[i]) {
        case sdk.shrines.None:
        case sdk.shrines.Refilling:
        case sdk.shrines.Health:
        case sdk.shrines.Mana:
        case sdk.shrines.HealthExchange: // (doesn't exist)
        case sdk.shrines.ManaExchange: // (doesn't exist)
        case sdk.shrines.Enirhs: // (doesn't exist)
        case sdk.shrines.Portal:
        case sdk.shrines.Gem:
        case sdk.shrines.Fire:
        case sdk.shrines.Monster:
        case sdk.shrines.Exploding:
        case sdk.shrines.Poison:
          this.shrineStates[i] = 0; // no state

          break;
        case sdk.shrines.Armor:
        case sdk.shrines.Combat:
        case sdk.shrines.ResistFire:
        case sdk.shrines.ResistCold:
        case sdk.shrines.ResistLightning:
        case sdk.shrines.ResistPoison:
        case sdk.shrines.Skill:
        case sdk.shrines.ManaRecharge:
        case sdk.shrines.Stamina:
        case sdk.shrines.Experience:
          // Both states and shrines are arranged in same order with armor shrine starting at 128
          this.shrineStates[i] = Config.ScanShrines[i] + 122;

          break;
        }
      }
    }

    let shrine = Game.getObject("shrine");

    if (shrine) {
      let index = -1;
      // Build a list of nearby shrines
      do {
        if (shrine.mode === sdk.objects.mode.Inactive && !ignore.includes(shrine.objtype)
          && getDistance(me.x, me.y, shrine.x, shrine.y) <= range) {
          shrineList.push(copyUnit(shrine));
        }
      } while (shrine.getNext());

      // Check if we have a shrine state, store its index if yes
      for (let i = 0; i < this.shrineStates.length; i += 1) {
        if (me.getState(this.shrineStates[i])) {
          index = i;

          break;
        }
      }

      for (let i = 0; i < Config.ScanShrines.length; i += 1) {
        for (let j = 0; j < shrineList.length; j += 1) {
          // Get the shrine if we have no active state or to refresh current state or if the shrine has no state
          // Don't override shrine state with a lesser priority shrine
          // todo - check to make sure we can actually get the shrine for ones without states
          // can't grab a health shrine if we are in perfect health, can't grab mana shrine if our mana is maxed
          if (index === -1 || i <= index || this.shrineStates[i] === 0) {
            if (shrineList[j].objtype === Config.ScanShrines[i]
              && (Pather.useTeleport() || !checkCollision(me, shrineList[j], sdk.collision.WallOrRanged))) {
              this.getShrine(shrineList[j]);

              // Gem shrine - pick gem
              if (Config.ScanShrines[i] === sdk.shrines.Gem) {
                Pickit.pickItems();
              }
            }
          }
        }
      }
    }

    return true;
  },

  // Use a shrine Unit
  getShrine: function (unit) {
    if (unit.mode === sdk.objects.mode.Active) return false;

    for (let i = 0; i < 3; i++) {
      if (Skill.useTK(unit) && i < 2) {
        unit.distance > 21 && Pather.moveNearUnit(unit, 20);
        if (!Packet.telekinesis(unit)) {
          Attack.getIntoPosition(unit, 20, sdk.collision.WallOrRanged);
        }
      } else {
        if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
          Misc.click(0, 0, unit);
        }
      }

      if (Misc.poll(() => unit.mode, 1000, 40)) {
        return true;
      }
    }

    return false;
  },

  /**
   * Check all shrines in area and get the first one of specified type
   * @param {number} area 
   * @param {number} type 
   * @param {boolean} use 
   * @returns {boolean} Sucesfully found shrine(s)
   * @todo 
   * - Sometimes it seems like calling getPresetObjects to quickly after taking an exit causes a crash, only anecdotal evidence though. Test delays
   * - Add the rest of the preset shrine id's to look for
   */
  getShrinesInArea: function (area, type, use) {
    let shrineLocs = [];
    let shrineIds = [2, 81, 83];
    let unit = Game.getPresetObjects(area);
    let result = false;

    if (unit) {
      for (let i = 0; i < unit.length; i += 1) {
        if (shrineIds.includes(unit[i].id)) {
          shrineLocs.push([unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y]);
        }
      }
    }

    try {
      NodeAction.shrinesToIgnore.push(type);

      while (shrineLocs.length > 0) {
        shrineLocs.sort(Sort.points);
        let coords = shrineLocs.shift();

        // Skill.haveTK ? Pather.moveNear(coords[0], coords[1], 20) : Pather.moveTo(coords[0], coords[1], 2);
        Pather.moveToEx(coords[0], coords[1], { minDist: Skill.haveTK ? 20 : 5, callback: () => {
          let shrine = Game.getObject("shrine");
          return !!shrine && shrine.x === coords[0] && shrine.y === coords[1];
        } });

        let shrine = Game.getObject("shrine");

        if (shrine) {
          do {
            if (shrine.objtype === type && shrine.mode === sdk.objects.mode.Inactive) {
              (!Skill.haveTK || !use) && Pather.moveTo(shrine.x - 2, shrine.y - 2);

              if (!use || this.getShrine(shrine)) {
                result = true;

                if (type === sdk.shrines.Gem) {
                  Pickit.pickItems();
                }
                return true;
              }
            }
          } while (shrine.getNext());
        }
      }
    } finally {
      NodeAction.shrinesToIgnore.remove(type);
    }

    return result;
  },

  // Go to town when low on hp/mp or when out of potions. can be upgraded to check for curses etc.
  townCheck: function () {
    if (!me.canTpToTown()) return false;

    let tTick = getTickCount();
    let check = false;

    if (Config.TownCheck && !me.inTown) {
      try {
        if (me.needPotions() || (Config.OpenChests.Enabled && me.needKeys())) {
          check = true;
        }
      } catch (e) {
        return false;
      }

      if (check) {
        // check that townchicken is running - so we don't spam needing potions if it isn't
        let townChick = getScript("threads/TownChicken.js");
        if (!townChick || townChick && !townChick.running) {
          return false;
        }

        townChick.send("townCheck");
        console.log("townCheck check Duration: " + (getTickCount() - tTick));

        return true;
      }
    }

    return false;
  },

  // Log someone's gear
  spy: function (name) {
    let unit = getUnit(-1, name);

    if (!unit) {
      console.warn("player not found");
      return false;
    }

    let item = unit.getItem();

    if (item) {
      do {
        this.logItem(unit.name, item);
      } while (item.getNext());
    }

    return true;
  },

  errorConsolePrint: true,
  screenshotErrors: true,

  /**
   * Report script errors to logs/ScriptErrorLog.txt
   * @param {Error | string} error 
   * @param {string} [script] 
   */
  errorReport: function (error, script) {
    let msg, oogmsg, filemsg, source, stack;
    let stackLog = "";

    let date = new Date();
    const dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString().slice(0, -5).replace(/-/g, "/").replace("T", " ") + "]";

    if (typeof error === "string") {
      msg = error;
      oogmsg = error.replace(/ÿc[0-9!"+<:;.*]/gi, "");
      filemsg = dateString + " <" + me.profile + "> " + error.replace(/ÿc[0-9!"+<:;.*]/gi, "") + "\n";
    } else {
      source = error.fileName.substring(error.fileName.lastIndexOf("\\") + 1, error.fileName.length);
      msg = "ÿc1Error in ÿc0" + script + " ÿc1(" + source + " line ÿc1" + error.lineNumber + "): ÿc1" + error.message;
      oogmsg = (
        "Error in " + script + " (" + source + " #" + error.lineNumber + ") " + error.message
        + " (Area: " + me.area + ", Ping:" + me.ping + ", Game: " + me.gamename + ")"
      );
      filemsg = dateString + " <" + me.profile + "> " + msg.replace(/ÿc[0-9!"+<:;.*]/gi, "") + "\n";

      if (error.hasOwnProperty("stack")) {
        stack = error.stack;

        if (stack) {
          stack = stack.split("\n");

          if (stack && typeof stack === "object") {
            stack.reverse();
          }

          for (let i = 0; i < stack.length; i += 1) {
            if (stack[i]) {
              stackLog += stack[i].substr(
                0,
                stack[i].indexOf("@") + 1) + stack[i].substr(stack[i].lastIndexOf("\\") + 1, stack[i].length - 1
              );

              if (i < stack.length - 1) {
                stackLog += ", ";
              }
            }
          }
        }
      }

      stackLog && (filemsg += "Stack: " + stackLog + "\n");
    }

    this.errorConsolePrint && D2Bot.printToConsole(oogmsg, sdk.colors.D2Bot.Gray);
    showConsole();
    console.log(msg);
    FileAction.append("logs/ScriptErrorLog.txt", filemsg);

    if (this.screenshotErrors) {
      takeScreenshot();
      delay(500);
    }
  },

  /**
   * @param {string} msg 
   * @returns {void}
   */
  debugLog: function (msg) {
    if (!Config.Debug) return;
    debugLog(me.profile + ": " + msg);
  },

  /**
   * Use a NPC menu. Experimental function, subject to change
   * @param {number} id - string number (with exception of Ressurect merc).
   * @returns {boolean}
   */
  useMenu: function (id) {
    //print("useMenu " + getLocaleString(id));

    let npc;

    switch (id) {
    case sdk.menu.RessurectMerc: // (non-English dialog)
    case sdk.menu.Trade: // (crash dialog)
      npc = getInteractedNPC();

      if (npc) {
        npc.useMenu(id);
        delay(750);

        return true;
      }

      break;
    }

    let lines = getDialogLines();
    if (!lines) return false;

    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].selectable && lines[i].text.includes(getLocaleString(id))) {
        getDialogLines()[i].handler();
        delay(750);

        return true;
      }
    }

    return false;
  },

  /**
   * @template T
   * @param {function(): T} check 
   * @param {number} [timeout=6000] 
   * @param {number} [sleep=40] 
   * @returns {T | false}
   */
  poll: function (check, timeout = 6000, sleep = 40) {
    let ret, start = getTickCount();

    while (getTickCount() - start <= timeout) {
      if ((ret = check())) {
        return ret;
      }

      delay(sleep);
    }

    return false;
  },

  /**
   * @param {number[]} excluded 
   * @returns {number[] | null} array of UI flags that are set, or null if none are set
   */
  getUIFlags: function (excluded = []) {
    if (!me.gameReady) return null;

    const MAX_FLAG = 37; // anything over 37 crashes
    let flags = [];

    if (typeof excluded !== "object" || excluded.length === undefined) {
      // not an array-like object, make it an array
      excluded = [excluded];
    }

    for (let c = 1; c <= MAX_FLAG; c++) {
      // 0x23 is always set in-game
      if (c !== 0x23 && excluded.indexOf(c) === -1 && getUIFlag(c)) {
        flags.push(c);
      }
    }

    return flags.length ? flags : null;
  },

  /**
   * @param {number} id 
   * @param {number} state 
   * @returns {0 | 1}
   */
  checkQuest: function (id, state) {
    Packet.questRefresh();
    delay(500);
    return me.getQuest(id, state);
  },

  /**
   * @param {number} questID 
   * @returns {number[]} List of set quest states
   */
  getQuestStates: function (questID) {
    if (!me.gameReady) return [];
    Packet.questRefresh();
    delay(500);
    const MAX_STATE = 16;
    let questStates = [];

    for (let i = 0; i < MAX_STATE; i++) {
      if (me.getQuest(questID, i)) {
        questStates.push(i);
      }

      delay(50);
    }

    return questStates;
  }
};
