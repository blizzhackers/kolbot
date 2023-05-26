/**
*  @filename    MiscOverrides.js
*  @author      theBGuy
*  @desc        Misc.js additions to improve functionality for map mode
*
*/

includeIfNotIncluded("core/Misc.js");

Misc.openRedPortal = function (portalID) {
  if (!me.getItem(sdk.quest.item.Cube)) return;

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

    if (validMats.length !== materials.length) throw new Error("Missing materials to open portal");

    portalID === sdk.areas.MooMooFarm
      ? !me.inArea(sdk.areas.RogueEncampment) && Town.goToTown(1)
      : !me.inArea(sdk.areas.Harrogath) && Town.goToTown(5);

    Town.move("stash");

    if (portalID && Pather.getPortal(portalID)) throw new Error("Portal is already open");

    Cubing.openCube();

    if (!Cubing.emptyCube()) throw new Error("Failed to empty cube");

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

Misc.talkToTyrael = function () {
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

Misc.dropItems = function (fromLoc) {
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
