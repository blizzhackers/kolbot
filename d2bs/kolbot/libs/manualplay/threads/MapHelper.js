/**
*  @filename    MapHelper.js
*  @author      theBGuy
*  @credits     kolton
*  @desc        MapHelper used in conjuction with main.js
*
*  @typedef {import("../../../sdk/globals")}
*/

js_strict(true);
include("critical.js"); // required

// globals needed for core gameplay
includeCoreLibs();

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");

// MapMode
include("manualplay/MapMode.js");
MapMode.include();

/**
 * @typedef {Object} UnitAction
 * @property {string} do - The action to perform ('openChest', 'usePortal')
 * @property {number} [id] - The ID associated with the action
 */

/** @typedef {'area' | 'unit' | 'wp' | 'actChange' | 'portal' | 'qol' | 'drop' |'stack'} EventType */

/**
 * @typedef {Object} ActionEvent
 * @property {EventType} type - The type of action to perform
 * @property {number|string|null} [dest] - The destination area ID, unit ID, or act number
 * @property {UnitAction|string} [action] - Action details or action string
 * @property {string[]} params
 */

function main () {
  // getUnit test
  getUnit(-1) === null && console.warn("getUnit bug detected");
  
  console.log("ÿc9MapHelper loaded");

  /** @type {ActionEvent} */
  const obj = { type: null, dest: null, action: null, params: [] };
  let action, fail = 0, x, y;
  const mapThread = getScript("libs/manualplay/main.js");

  const portalMap = {};
  portalMap[sdk.areas.Abaddon] = {
    14: [12638, 6373],
    15: [12638, 6063],
    20: [12708, 6063],
    25: [12948, 6128],
  };
  portalMap[sdk.areas.PitofAcheron] = {
    14: [12638, 7873],
    15: [12638, 7563],
    20: [12708, 7563],
    25: [12948, 7628],
  };
  portalMap[sdk.areas.InfernalPit] = {
    14: [12638, 9373],
    15: [12638, 9063],
    20: [12708, 9063],
    25: [12948, 9128],
  };

  Config.init();
  Attack.init(false);
  Pickit.init();
  Storage.Init();
  Runewords.init();
  Cubing.init();
  
  addEventListener("scriptmsg", function (msg) {
    action = msg;
  });

  const togglePickThread = function () {
    if (!Config.ManualPlayPick) return;

    const pickThread = getScript("libs/manualplay/threads/pickthread.js");

    if (pickThread) {
      if (pickThread.running) {
        pickThread.pause();
      } else if (!pickThread.running) {
        pickThread.resume();
      }
    }
  };

  const togglePause = function () {
    if (mapThread) {
      if (mapThread.running) {
        console.log("pause mapthread");
        mapThread.pause();
      } else if (!mapThread.running) {
        console.log("resume mapthread");
        mapThread.resume();

        if (!mapThread.running) {
          fail++;

          if (fail % 5 === 0 && !getScript("libs/manualplay/main.js")) {
            console.log("MapThread shut down, exiting MapHelper");
            
            return false;
          }
        }
      }
    } else if (!getScript("libs/manualplay/main.js")) {
      console.log("MapThread shut down, exiting MapHelper");

      return false;
    }

    return true;
  };

  /** @param {number} portalID */
  const openRedPortal = function (portalID) {
    if (!me.getItem(sdk.quest.item.Cube)) return;

    /**
     * Ensures the inventory holds a Tome of Town Portal stocked with scrolls, buying from the shop NPC as needed.
     * @returns {void}
     */
    function getTome () {
      let npc, tome, scroll;
      let tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

      try {
        if (tpTome.length < 2) {
          npc = Town.initNPC("Shop", "buyTpTome");

          if (!getInteractedNPC()) {
            throw new Error("Failed to find npc");
          }

          tome = npc.getItem(sdk.items.TomeofTownPortal);

          if (!!tome && tome.getItemCost(sdk.items.cost.ToBuy) < me.gold && tome.buy()) {
            delay(500);
            tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);
            tpTome.forEach(function (book) {
              while (book.getStat(sdk.stats.Quantity) < 20) {
                scroll = npc.getItem(sdk.items.ScrollofTownPortal);
              
                if (!!scroll && scroll.getItemCost(sdk.items.cost.ToBuy) < me.gold) {
                  scroll.buy();
                } else {
                  break;
                }

                delay(20);
              }
            });
          }
        }
      } finally {
        me.cancel();
      }
    }

    try {
      let materials, validMats = [];

      switch (portalID) {
      case sdk.areas.MooMooFarm:
        if (me.getQuest(sdk.quest.id.TheSearchForCain, 10)) {
          throw new Error("Unable to open cow portal because cow king has been killed");
        }

        materials = [sdk.items.quest.WirtsLeg, sdk.items.TomeofTownPortal];

        break;
      case sdk.areas.UberTristram:
        materials = [sdk.quest.item.DiablosHorn, sdk.quest.item.BaalsEye, sdk.quest.item.MephistosBrain];

        break;
      default:
        materials = [sdk.quest.item.KeyofTerror, sdk.quest.item.KeyofHate, sdk.quest.item.KeyofDestruction];

        break;
      }

      materials.forEach(function (mat) {
        mat === sdk.items.TomeofTownPortal && getTome();
        let item = me.getItem(mat);
        !!item && validMats.push(item);
      });

      if (validMats.length !== materials.length) {
        throw new Error("Missing materials to open portal");
      }

      portalID === sdk.areas.MooMooFarm
        ? !me.inArea(sdk.areas.RogueEncampment) && Town.goToTown(1)
        : !me.inArea(sdk.areas.Harrogath) && Town.goToTown(5);

      Town.move("stash");

      if (portalID && Pather.getPortal(portalID)) {
        throw new Error("Portal is already open");
      }

      Cubing.openCube();

      if (!Cubing.emptyCube()) {
        throw new Error("Failed to empty cube");
      }

      validMats.forEach(function (mat) {
        return Storage.Cube.MoveTo(mat);
      });

      Cubing.openCube() && transmute();
    } catch (e) {
      console.error(e);
    } finally {
      me.cancel();
    }
  };

  const talkToTyrael = function () {
    if (!me.inArea(sdk.areas.DurielsLair)) return false;

    Pather.walkTo(22621, 15711);
    Pather.moveTo(22602, 15705);
    Pather.moveTo(22579, 15704);
    Pather.moveTo(22575, 15675);
    Pather.moveTo(22579, 15655);
    Pather.walkTo(22578, 15642); // walk trough door
    Pather.moveTo(22578, 15618);
    Pather.moveTo(22576, 15591); // tyreal

    let tyrael = Game.getNPC(NPC.Tyrael);

    if (tyrael) {
      for (let i = 0; i < 3; i++) {
        if (getDistance(me, tyrael) > 3) {
          Pather.moveToUnit(tyrael);
        }

        tyrael.interact();
        delay(1000 + me.ping);
        me.cancel();

        if (Pather.getPortal(null)) {
          me.cancel();

          break;
        }
      }
    }

    return Pather.usePortal(null);
  };

  /** @param {number} fromLoc */
  const dropItems = function (fromLoc) {
    try {
      if (!fromLoc) throw new Error("No location given");
      if (fromLoc === sdk.storage.Stash && !Town.openStash()) throw new Error("Failed to open stash");

      let items = me.findItems(-1, sdk.items.mode.inStorage, fromLoc);

      if (items) {
        while (items.length > 0) {
          let item = items.shift();

          if (item.classid === sdk.quest.item.Cube
          || (item.isEquippedCharm && Storage.Inventory.IsLocked(item, Config.Inventory))) {
            continue;
          } else {
            item.drop();
          }
        }
      } else {
        throw new Error("Couldn't find any items");
      }
    } catch (e) {
      console.error(e);
    } finally {
      me.cancel();
    }
  };

  while (true) {
    if (getUIFlag(sdk.uiflags.EscMenu)) {
      delay(100);
      mapThread.running && togglePause();
    } else {
      if (!mapThread.running) {
        if (!togglePause()) {
          return;
        }
      }
    }

    if (action) {
      try {
        let temp = JSON.parse(action);
        temp && Object.assign(obj, temp);
        
        addEventListener("keyup", Pather.stopEvent);
        togglePickThread();

        if (obj) {
          let redPortal, chestLoc, king, unit;

          switch (obj.type) {
          case "area":
            if (obj.dest === sdk.areas.ArreatSummit) {
              Pather.moveToExit(obj.dest, false);
            } else if ([
              sdk.areas.CanyonofMagic, sdk.areas.A2SewersLvl1,
              sdk.areas.PalaceCellarLvl3, sdk.areas.PandemoniumFortress, sdk.areas.BloodyFoothills
            ].includes(obj.dest)) {
              Pather.journeyTo(obj.dest);
            } else if (obj.dest === sdk.areas.DurielsLair) {
              Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricStaffHolder, -11, 3);

              for (let i = 0; i < 3; i++) {
                if (Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair)) {
                  break;
                }
              }
            } else {
              Pather.moveToExit(obj.dest, true);
            }

            break;
          case "unit":
            if (me.inArea(sdk.areas.MooMooFarm)
              || (me.inArea(sdk.areas.DurielsLair) && talkToTyrael())) {
              break;
            }

            Pather.moveToUnit(obj.dest, true);

            switch (me.area) {
            case sdk.areas.ColdPlains:
              Pather.moveToExit(sdk.areas.CaveLvl1, true);

              break;
            case sdk.areas.BlackMarsh:
              Pather.moveToExit(sdk.areas.HoleLvl1, true);

              break;
            case sdk.areas.LutGholein:
              Pather.useUnit(sdk.unittype.Stairs, sdk.exits.preset.A2EnterSewersDoor, sdk.areas.A2SewersLvl1);

              break;
            case sdk.areas.KurastBazaar:
              Pather.useUnit(sdk.unittype.Stairs, sdk.exits.preset.A3EnterSewers, sdk.areas.A3SewersLvl1);

              break;
            }

            if (obj.action && typeof obj.action === "object") {
              if (obj.action.do === "openChest") {
                !!obj.action.id && Misc.openChest(obj.action.id);
              } else if (obj.action.do === "usePortal") {
                !!obj.action.id ? Pather.usePortal(obj.action.id) : Pather.usePortal();
              }
            }

            break;
          case "wp":
            Pather.getWP(me.area);

            break;
          case "actChange":
            console.log("Going to act: " + obj.dest);
            Pather.changeAct(obj.dest);

            break;
          case "portal":
            if (obj.dest === sdk.areas.WorldstoneChamber && Game.getMonster(sdk.monsters.ThroneBaal)) {
              me.overhead("Can't enter Worldstone Chamber yet. Baal still in area");
              
              break;
            } else if (obj.dest === sdk.areas.WorldstoneChamber && !Game.getMonster(sdk.monsters.ThroneBaal)) {
              redPortal = Game.getObject(sdk.objects.WorldstonePortal);
              redPortal && Pather.usePortal(null, null, redPortal);

              break;
            }

            switch (obj.dest) {
            case sdk.areas.RogueEncampment:
              king = Game.getPresetMonster(me.area, sdk.monsters.preset.TheCowKing);

              switch (king.x) {
              case 1:
                Pather.moveTo(25183, 5923);

                break;
              }

              break;
            case sdk.areas.StonyField:
              Pather.moveTo(25173, 5086);
              redPortal = Pather.getPortal(obj.dest);

              break;
            case sdk.areas.MooMooFarm:
              redPortal = Pather.getPortal(obj.dest);

              break;
            case sdk.areas.ArcaneSanctuary:
              if (me.inArea(sdk.areas.CanyonofMagic)) {
                Pather.moveTo(12692, 5195);
                redPortal = Pather.getPortal(obj.dest);
                !redPortal && Pather.useWaypoint(obj.dest);
              } else if (me.inArea(sdk.areas.PalaceCellarLvl3)) {
                Pather.moveTo(10073, 8670);
                Pather.usePortal(null);
              }

              break;
            case sdk.areas.Harrogath:
              Pather.moveTo(20193, 8693);

              break;
            case sdk.areas.FrigidHighlands:
            case sdk.areas.ArreatPlateau:
            case sdk.areas.FrozenTundra:
              chestLoc = Game.getPresetObject(me.area, sdk.objects.SmallSparklyChest);

              if (!chestLoc) {
                break;
              }

              [x, y] = portalMap[me.area][chestLoc.x];

              Pather.moveTo(x, y);
              Pather.usePortal();

              break;
            case sdk.areas.MatronsDen:
            case sdk.areas.ForgottenSands:
            case sdk.areas.FurnaceofPain:
            case sdk.areas.UberTristram:
              redPortal = Pather.getPortal(obj.dest);

              break;
            default:
              Pather.usePortal(obj.dest);
              
              break;
            }

            if (redPortal) {
              Pather.moveToUnit(redPortal);
              Pather.usePortal(null, null, redPortal);
            }

            break;
          case "qol":
            switch (obj.action) {
            case "heal":
              Town.initNPC("Heal", "heal");

              break;
            case "openStash":
              Town.openStash();

              break;
            case "stashItems":
              Town.stash(true, true);

              break;
            case "gamble":
              Config.Gamble ? Town.gamble() : me.overhead("Check your Config. Gambling is disabled.");

              break;
            case "makePortal":
              Pather.makePortal();

              break;
            case "takePortal":
              Town.goToTown();

              break;

            case "clear":
              if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
                showConsole();
                console.warn("No valid attack skill(s) set for clear command. Check your Config.");
              } else {
                Attack.clear(10);
              }
							
              break;
            case "cowportal":
              openRedPortal(sdk.areas.MooMooFarm);

              break;
            case "ubertrist":
              openRedPortal(sdk.areas.UberTristram);

              break;
            case "uberportal":
              openRedPortal();

              break;
            case "filltps":
              Town.fillTome(sdk.items.TomeofTownPortal);
              me.cancel();

              break;
            case "moveItemFromInvoToStash":
            case "moveItemFromStashToInvo":
              unit = Game.getSelectedUnit();

              switch (unit.location) {
              case sdk.storage.Inventory:
                Storage.Stash.CanFit(unit) && Storage.Stash.MoveTo(unit);

                break;
              case sdk.storage.Stash:
                Storage.Inventory.CanFit(unit) && Storage.Inventory.MoveTo(unit);

                break;
              }

              break;
            case "moveItemFromInvoToCube":
            case "moveItemFromCubeToInvo":
              unit = Game.getSelectedUnit();

              switch (unit.location) {
              case sdk.storage.Inventory:
                Storage.Cube.CanFit(unit) && Storage.Cube.MoveTo(unit);

                break;
              case sdk.storage.Cube:
                Storage.Inventory.CanFit(unit) && Storage.Inventory.MoveTo(unit);

                break;
              }

              break;
            case "moveItemFromInvoToTrade":
            case "moveItemFromTradeToInvo":
              unit = Game.getSelectedUnit();

              switch (unit.location) {
              case sdk.storage.Inventory:
                Storage.TradeScreen.CanFit(unit) && Storage.TradeScreen.MoveTo(unit);

                break;
              case sdk.storage.TradeWindow:
                if (Storage.Inventory.CanFit(unit)) {
                  Packet.itemToCursor(unit);
                  Storage.Inventory.MoveTo(unit);
                }

                break;
              }

              break;
            case "pick":
              {
                let range = obj.params.length > 0 && !isNaN(Number(obj.params[0]))
                  ? Number(obj.params[0])
                  : Config.PickRange;
                Config.ManualPlayPick ? Pickit.pickItems(range) : Pickit.basicPickItems(range);
              }

              break;
            case "sellItem":
              unit = Game.getSelectedUnit();

              if (unit.isInInventory && unit.sellable) {
                try {
                  unit.sell();
                } catch (e) {
                  console.error(e);
                }
              }

              break;
            }

            break;
          case "drop":
            switch (obj.action) {
            case "invo":
              dropItems(sdk.storage.Inventory);
              
              break;
            case "stash":
              dropItems(sdk.storage.Stash);

              break;
            }

            break;
          case "stack": {
            let quantity = obj.params.length > 0 && !isNaN(Number(obj.params[0]))
              ? Number(obj.params[0])
              : 10;
            switch (obj.action) {
            case "thawing":
              Town.buyPots(quantity, "Thawing", true, true);

              break;
            case "antidote":
              Town.buyPots(quantity, "Antidote", true, true);

              break;
            case "stamina":
              Town.buyPots(quantity, "Stamina", true, true);

              break;
            }
            break;
          }
          case "makerunewords":
            Runewords.makeRunewords();
            
            break;
          case "docubing":
            Cubing.doCubing();
            
            break;
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        action = false;
        removeEventListener("keyup", Pather.stopEvent);
        togglePickThread();
      }
    }

    delay(20);
  }
}
