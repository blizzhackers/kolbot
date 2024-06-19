/**
*  @filename    Misc.js
*  @author      kolton, theBGuy
*  @desc        Misc library for functions that don't fit neatly into another namespace
*  contains clickhandling, shrine/chest/player locating, ect 
*
*/

const Misc = (function () {
  const ShrineData = require("./GameData/ShrineData");
  
  return {
    _diabloSpawned: false,
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

    /**
     * Find a player
     * @param {string} name 
     * @returns {Party | false}
     */
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

    /**
     * Get player unit
     * @param {string} name 
     * @returns {Player | false}
     */
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

    /**
     * Get the player act, accepts party unit or name
     * @param {Party | string} player 
     * @returns {number | false}
     */
    getPlayerAct: function (player) {
      if (!player) return false;

      let unit = (typeof player === "object" ? player : this.findPlayer(player));

      return unit ? sdk.areas.actOf(unit.area) : false;
    },

    /**
     * Get number of players within getUnit distance
     * @returns {number}
     */
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

    /**
     * Get total number of players in game
     * @returns {number}
     */
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

    /**
     * Get total number of players in game and in my party
     * @returns {number}
     */
    getPartyCount: function () {
      let count = 0;
      let party = getParty();

      if (party) {
        let myPartyId = party.partyid;
        
        do {
          if (party.partyid !== sdk.party.NoParty
            && party.partyid === myPartyId
            && party.name !== me.name) {
            console.log(party.name);
            count += 1;
          }
        } while (party.getNext());
      }

      return count;
    },

    /**
     * Check if any member of our party meets a certain level req
     * @param {number} levelCheck 
     * @param {string | string[]} exclude 
     * @returns {boolean}
     */
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

    /**
     * @param {Player | string} player 
     * @returns {number | false}
     */
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
      const check = typeof settings.quitIf === "function";
      do {
        /** @type {Party[]} */
        let suspects = [];
        let solofail = 0;
        let suspect = getParty(); // get party object (players in game)

        do {
          // player isn't alone
          suspect.name !== me.name && (solofail += 1);

          if (check && settings.quitIf(suspect.area)) return false;

          // players not hostile found in destination area...
          if (settings.destination.includes(suspect.area)
            && !getPlayerFlag(me.gid, suspect.gid, sdk.player.flag.Hostile)) {
            suspects.push(copyObj(suspect));
            console.log("ÿc4Autodetected ÿc0" + suspect.name + " (level " + suspect.level + ")");
          }
        } while (suspect.getNext());

        if (suspects.length > 1) {
          // if we have more than one suspect, sort by level and they are generally the leaders
          suspects.sort((a, b) => b.level - a.level);

          // look for tps from the suspect to the destination area. Sometimes we come in late, happens a lot with pubjoin
          for (let suspect of suspects) {
            let portal = Pather.getPortal(null, suspect.name);
            if (!portal) continue;

            if (portal && settings.destination.includes(portal.objtype)) {
              leader = suspect.name;
              console.log("ÿc4Autodetect Selecting: ÿc0" + leader + " (Portal found)");
              return leader;
            }
          }
        }

        if (suspects.length) {
          leader = suspects[0].name;
          console.log("ÿc4Autodetect Selecting: ÿc0" + leader);
          
          return leader;
        }

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

    /**
     * Open all chests that have preset units in an area
     * @param {number} area 
     * @param {number[]} chestIds 
     * @returns {boolean}
     */
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

    /**
     * @param {number} range 
     * @returns {boolean}
     */
    openChests: function (range = 15) {
      if (!Config.OpenChests.Enabled) return true;

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

      /** @type {Set<number>} */
      const seenGids = new Set();

      /**
       * @param {number} range 
       * @returns {ObjectUnit[]}
       */
      const buildChestList = function (range) {
        let unitList = [];
        let unit = Game.getObject();

        if (unit) {
          do {
            if (unit.name && unit.mode === sdk.objects.mode.Inactive
              && !seenGids.has(unit.gid)
              && getDistance(me.x, me.y, unit.x, unit.y) <= range
              && containers.includes(unit.name.toLowerCase())) {
              seenGids.add(unit.gid);
              unitList.push(copyUnit(unit));
            }
          } while (unit.getNext());
        }
        return unitList;
      };
      
      const startPos = new PathNode(me.x, me.y);
      let unitList = buildChestList(range);

      while (unitList.length > 0) {
        unitList.sort(Sort.units);
        let unit = unitList.shift();

        if (unit) {
          const chest = Game.getObject(-1, -1, unit.gid);
          if (chest && (Pather.useTeleport() || !checkCollision(me, chest, sdk.collision.WallOrRanged))
            && this.openChest(chest)) {
            Pickit.pickItems();
          }
        }

        if (startPos.distance > 5) {
          // rebuid chest list every 5 chests in case we've moved and add any new chests to our list
          let _unitList = buildChestList(Math.round(range / 2));
          // console.debug("Rescanning for chests: " + _unitList.length + " chests found.");
          unitList = unitList.concat(_unitList);
        }
      }

      return true;
    },

    /** @type {number[] | null} */
    shrineStates: null,

    lastShrine: new function () {
      this.tick = 0;
      this.duration = 0;
      this.type = -1;
      this.state = 0;

      /** @param {ObjectUnit} unit */
      this.update = function (unit) {
        if (!unit || !unit.hasOwnProperty("objtype")) return;
        // we only care about tracking shrines with states
        if (!ShrineData.getState(unit.objtype)) return;
        this.tick = getTickCount();
        this.type = unit.objtype;
        this.duration = ShrineData.getDuration(unit.objtype);
        this.state = ShrineData.getState(unit.objtype);
      };

      this.remaining = function () {
        return this.duration - (getTickCount() - this.tick);
      };

      this.isMyCurrentState = function () {
        if (this.state <= 0) return false;
        return me.getState(this.state);
      };
    },

    /** @type {Set<number>} */
    _shrinerIgnore: new Set(),

    shriner: function () {
      if (!Config.AutoShriner) return false;

      let shrineList = [];
      let shrine = Game.getObject();

      /**
       * TODO: Handle stateful shrines
       * TODO: Track last shrine used - should tier based on shrine type
       * @param {ObjectUnit} shrine 
       * @returns {boolean}
       */
      const wantShrine = function (shrine) {
        if (ShrineData.getState(shrine.objtype)
          && Misc.lastShrine.type === shrine.objtype
          && Misc.lastShrine.isMyCurrentState()
          && Misc.lastShrine.remaining() > Time.seconds(30)) {
          return false;
        }
        switch (shrine.objtype) {
        case sdk.shrines.Health:
          // we only want if its dire or its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 10) {
            return me.hpPercent <= 50;
          }
          return me.hpPercent < 80;
        case sdk.shrines.Mana:
          // we only want if its dire or its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 10) {
            return me.mpPercent <= 50;
          }
          return me.mpPercent < 80;
        case sdk.shrines.Refilling:
          // we only want if its dire or its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 10) {
            return me.hpPercent <= 50 || me.mpPercent <= 50;
          }
          return me.hpPercent < 85 || me.mpPercent < 85;
        case sdk.shrines.Experience:
          return me.charlvl < 99;
        case sdk.shrines.Skill:
          return !me.getState(sdk.states.ShrineExperience);
        case sdk.shrines.ManaRecharge:
        case sdk.shrines.Stamina:
          // we only want if its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 15) {
            return false;
          }
          // for now, only grab if we have nothing else active
          return !Misc.lastShrine.state || !me.getState(Misc.lastShrine.state);
        case sdk.shrines.ResistFire:
        case sdk.shrines.ResistCold:
        case sdk.shrines.ResistLightning:
        case sdk.shrines.ResistPoison:
        {
          /** @type {Record<number, number>} */
          let resistances = {};
          resistances[sdk.shrines.ResistFire] = me.fireRes;
          resistances[sdk.shrines.ResistCold] = me.coldRes;
          resistances[sdk.shrines.ResistLightning] = me.lightRes;
          resistances[sdk.shrines.ResistPoison] = me.poisonRes;

          // we only want if its dire or its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 15) {
            return resistances[shrine.objtype] <= 0;
          }
          
          if (!Misc.lastShrine.state || !me.getState(Misc.lastShrine.state)) {
            return true;
          }

          // first check if the lasts shrine was a resist shrine
          if (resistances[Misc.lastShrine.type] === undefined) {
            // evaluate whether we should overwrite the last shrine
            if (Misc.lastShrine.type === sdk.shrines.Experience) {
              // never overwrite experience shrine
              return false;
            }

            if (Misc.lastShrine.type === sdk.shrines.Skill) {
              if (resistances[shrine.objtype] <= 25) {
                // makes sense if we have a low resistance
                return true;
              }

              return false;
            }
          }

          // check that the current shrine benefits our lowest resistance better than the last shrine
          if (resistances[shrine.objtype] < resistances[Misc.lastShrine.type]) {
            // how much better? If it's at least a 5% difference, we should take it
            // otherwise only do it if the distance is convenient
            
            return true;
          }
          break;
        }
        // TODO: handle armor and combat shrines
        case sdk.shrines.Armor:
        case sdk.shrines.Combat:
          // we only want if its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 15) {
            return false;
          }
          
          if (!Misc.lastShrine.state || !me.getState(Misc.lastShrine.state)) {
            return true;
          }
          return false;
        case sdk.shrines.Monster:
          // we only want if its close to us if we can't teleport
          if (!Pather.useTeleport() && Pather.getWalkDistance(shrine.x, shrine.y) > 15) {
            return false;
          }
          
          return true; // why not?
        case sdk.shrines.Gem:
          // for now we ignore if we are gem hunting later on
          // TODO: add gem hunting logic, get gem from stash if we have one
          return !Scripts.GemHunter;
        }
        return false;
      };

      const wantWell = function () {
        if (me.hpPercent < 75) return true;
        if (me.mpPercent < 75) return true;
        if (me.staminaPercent < 50) return true;
        return [
          sdk.states.Frozen,
          sdk.states.Poison,
          sdk.states.AmplifyDamage,
          sdk.states.Decrepify
        ].some(function (state) {
          return me.getState(state);
        });
      };

      if (shrine) {
        do {
          let _name = shrine.name.toLowerCase();
          if ((_name.includes("shrine") && ShrineData.has(shrine.objtype) || (_name.includes("well")))
            && ShrineData.has(shrine.objtype)
            && shrine.mode === sdk.objects.mode.Inactive) {
            shrineList.push(copyUnit(shrine));
          }
        } while (shrine.getNext());
      }

      while (shrineList.length > 0) {
        shrineList.sort(Sort.units);
        shrine = shrineList.shift();

        if (shrine) {
          if (me.inArea(sdk.areas.ChaosSanctuary)) {
            // stateful shrines are pointless in CS unless we are running wakka or diablo has spawned so no more oblivion knights
            if (!this._diabloSpawned && Loader.scriptName() !== "Wakka" && ShrineData.getState(shrine.objtype)) {
              continue;
            }
          }
          
          if (ShrineData.has(shrine.objtype) ? wantShrine(shrine) : wantWell()) {
            // need to take distance into account.
            // How far away is this shrine?
            // Can we teleport to it?
            // Is it closer to our path at a later point?
            // Is it a really good shrine or just a meh one? So we know if we should go out of our way for it.
            if (shrine.distance > Skill.haveTK ? 20 : 10) {
              if (Pather.currentWalkingPath.some((point) => getDistance(point.x, point.y, shrine.x, shrine.y) < 10)) {
                if (Config.DebugMode.Path) {
                  new Line(shrine.x - 3, shrine.y, shrine.x + 3, shrine.y, 0x9B, true);
                  new Line(shrine.x, shrine.y - 3, shrine.x, shrine.y + 3, 0x9B, true);
                }
                continue;
              }
            }
            this.getShrine(shrine);
          }
        }
      }

      return true;
    },

    /**
     * @param {number} range 
     * @param {number[]} ignore 
     * @returns {boolean}
     */
    scanShrines: function (range, ignore) {
      if (Config.AutoShriner) {
        return this.shriner();
      }
      if (!Config.ScanShrines.length) return false;

      !range && (range = Pather.useTeleport() ? 25 : 15);
      !Array.isArray(ignore) && (ignore = [ignore]);

      /** @type {ObjectUnit[]} */
      let shrineList = [];

      // Initiate shrine states
      if (!this.shrineStates) {
        Misc.shrineStates = [];

        for (let i = 0; i < Config.ScanShrines.length; i += 1) {
          this.shrineStates[i] = ShrineData.getState(Config.ScanShrines[i]);
        }
      }

      const needWell = function () {
        if (me.hpPercent < Config.UseWells.HpPercent) return true;
        if (me.mpPercent < Config.UseWells.MpPercent) return true;
        if (me.staminaPercent < Config.UseWells.StaminaPercent) return true;
        if (Config.UseWells.StatusEffects) {
          return [
            sdk.states.Frozen,
            sdk.states.Poison,
            sdk.states.AmplifyDamage,
            sdk.states.Decrepify
          ].some(function (state) {
            return me.getState(state);
          });
        }
        return false;
      };

      /**
       * Fix for a3/a5 shrines
       */
      let shrine = Game.getObject();

      if (shrine) {
        let index = -1;
        
        // Build a list of nearby shrines
        do {
          if (!shrine.name) continue;
          let _name = shrine.name.toLowerCase();
          if ((_name.includes("shrine") && ShrineData.has(shrine.objtype) || (_name.includes("well")))
            && shrine.mode === sdk.objects.mode.Inactive
            && !ignore.includes(shrine.objtype)
            && getDistance(me.x, me.y, shrine.x, shrine.y) <= range) {
            shrineList.push(copyUnit(shrine));
          }
        } while (shrine.getNext());
        if (!shrineList.length) return false;

        // Check if we have a shrine state, store its index if yes
        for (let i = 0; i < this.shrineStates.length; i += 1) {
          if (me.getState(this.shrineStates[i])) {
            index = i;

            break;
          }
        }

        for (let i = 0; i < Config.ScanShrines.length; i += 1) {
          for (let shrine of shrineList) {
            // Get the shrine if we have no active state or to refresh current state or if the shrine has no state
            // Don't override shrine state with a lesser priority shrine
            // todo - check to make sure we can actually get the shrine for ones without states
            // can't grab a health shrine if we are in perfect health, can't grab mana shrine if our mana is maxed
            if (index === -1 || i <= index || this.shrineStates[i] === 0) {
              if ((
                shrine.objtype === Config.ScanShrines[i]
                || (Config.ScanShrines[i] === "well" && shrine.name.toLowerCase().includes("well") && needWell())
              ) && (Pather.useTeleport() || !checkCollision(me, shrine, sdk.collision.WallOrRanged))) {
                this.getShrine(shrine);

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

    /**
     * Use a shrine Unit
     * @param {ObjectUnit} unit 
     * @returns {boolean}
     */
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
          Misc.lastShrine.update(unit);
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

    /**
     * Go to town when low on hp/mp or when out of potions. can be upgraded to check for curses etc.
     * @deprecated - will be removed in future versions
     * @returns {boolean}
     */
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

    /**
     * Log someone's gear
     * @param {string} name 
     * @returns {boolean}
     */
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
})();
