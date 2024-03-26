/**
*  @filename    Crafting.js
*  @author      kolton
*  @desc        Part of CraftingSystem
*
*/

let info;
let gameRequest = false;

function Crafting () {
  info = CraftingSystem.getInfo();

  if (!info || !info.worker) throw new Error("Bad Crafting System config.");

  me.maxgametime = 0;
  Town.goToTown(1);
  Town.doChores();
  Town.move("stash");
  updateInfo();
  pickItems();

  addEventListener("copydata",
    function (mode, msg) {
      let obj, rval;

      if (mode === 0) {
        try {
          obj = JSON.parse(msg);
        } catch (e) {
          return false;
        }

        if (obj) {
          switch (obj.name) {
          case "GetGame":
            if (info.Collectors.includes(obj.profile)) {
              print("GetGame: " + obj.profile);
              sendCopyData(null, obj.profile, 4, me.gamename + "/" + me.gamepassword);

              gameRequest = true;
            }

            break;
          case "GetSetInfo":
            if (info.Collectors.includes(obj.profile)) {
              print("GetSetInfo: " + obj.profile);

              rval = [];

              for (let i = 0; i < info.Sets.length; i += 1) {
                rval.push(info.Sets[i].Enabled ? 1 : 0);
              }

              print(rval);

              sendCopyData(null, obj.profile, 4, JSON.stringify({ name: "SetInfo", value: rval }));
            }

            break;
          }
        }
      }

      return true;
    });

  for (let i = 0; i < Cubing.recipes.length; i += 1) {
    Cubing.recipes[i].Level = 0;
  }

  while (true) {
    for (let i = 0; i < info.Sets.length; i += 1) {
      switch (info.Sets[i].Type) {
      case "crafting":
        let num = 0;
        let npcName = getNPCName(info.Sets[i].BaseItems);

        if (npcName) {
          num = countItems(info.Sets[i].BaseItems, 4);

          if (num < info.Sets[i].SetAmount) {
            shopStuff(npcName, info.Sets[i].BaseItems, info.Sets[i].SetAmount);
          }
        }

        break;
      case "cubing": // Nothing to do currently
        break;
      case "runewords": // Nothing to do currently
        break;
      }
    }

    me.act !== 1 && Town.goToTown(1) && Town.move("stash");

    if (gameRequest) {
      for (let i = 0; i < 10; i += 1) {
        if (Misc.getPlayerCount() > 1) {
          while (Misc.getPlayerCount() > 1) {
            delay(200);
          }

          break;
        } else {
          break;
        }
      }

      gameRequest = false;
    }

    pickItems();
    Cubing.update();
    Runewords.buildLists();
    Cubing.doCubing();
    Runewords.makeRunewords();
    delay(2000);
  }
}

function getNPCName (idList) {
  for (let i = 0; i < idList.length; i += 1) {
    switch (idList[i]) {
    case sdk.items.LightBelt:
    case sdk.items.SharkskinBelt:
      return "elzix";
    case sdk.items.Belt:
    case sdk.items.MeshBelt:
    case sdk.items.LightPlatedBoots:
    case sdk.items.BattleBoots:
      return "fara";
    }
  }

  return false;
}

function countItems (idList, quality) {
  let count = 0;
  let item = me.getItem(-1, sdk.items.mode.inStorage);

  if (item) {
    do {
      if (idList.includes(item.classid) && item.quality === quality) {
        count += 1;
      }
    } while (item.getNext());
  }

  return count;
}

function updateInfo () {
  if (info) {
    let items = me.findItems(-1, sdk.items.mode.inStorage);

    for (let i = 0; i < info.Sets.length; i += 1) {
      MainSwitch:
      switch (info.Sets[i].Type) {
      // Always enable crafting because the base can be shopped
      // Recipes with bases that can't be shopped don't need to be used with CraftingSystem
      case "crafting":
        info.Sets[i].Enabled = true;

        break;
        // Enable only if we have a viable item to cube
        // Currently the base needs to be added manually to the crafter
      case "cubing":
        !items && (items = []);

        // Enable the recipe if we have an item that matches both bases list and Cubing list
        // This is not a perfect check, it might not handle every case
        for (let j = 0; j < items.length; j += 1) {
          if (info.Sets[i].BaseItems.includes(items[j].classid) // Item is on the bases list
              && AutoMule.cubingIngredient(items[j])) { // Item is a valid Cubing ingredient
            print("Base found: " + items[j].classid);

            info.Sets[i].Enabled = true;

            break MainSwitch;
          }
        }

        info.Sets[i].Enabled = false;

        break;
        // Enable only if we have a viable runeword base
        // Currently the base needs to be added manually to the crafter
      case "runewords":
        !items && (items = []);

        // Enable the recipe if we have an item that matches both bases list and Cubing list
        // This is not a perfect check, it might not handle every case
        for (let j = 0; j < items.length; j += 1) {
          if (info.Sets[i].BaseItems.includes(items[j].classid) // Item is on the bases list
              && runewordIngredient(items[j])) { // Item is a valid Runeword ingredient
            print("Base found: " + items[j].classid);

            info.Sets[i].Enabled = true;

            break MainSwitch;
          }
        }

        info.Sets[i].Enabled = false;

        break;
      }
    }

    return true;
  }

  return false;
}

function runewordIngredient (item) {
  if (Runewords.validGids.includes(item.gid)) return true;

  let baseGids = [];

  for (let i = 0; i < Config.Runewords.length; i += 1) {
    let base = (Runewords.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0))
      || Runewords.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0), true));

    base && baseGids.push(base.gid);
  }

  return baseGids.includes(item.gid);
}

function pickItems () {
  let items = [];
  let item = Game.getItem(-1, sdk.items.mode.onGround);

  if (item) {
    updateInfo();

    do {
      if (checkItem(item) || item.classid === sdk.items.Gold || Pickit.checkItem(item).result > 0) {
        items.push(copyUnit(item));
      }
    } while (item.getNext());
  }

  while (items.length) {
    if (Pickit.canPick(items[0]) && Storage.Inventory.CanFit(items[0])) {
      Pickit.pickItem(items[0]);
    }

    items.shift();
    delay(1);
  }

  Town.stash();
}

function checkItem (item) {
  for (let i = 0; i < info.Sets.length; i += 1) {
    if (info.Sets[i].Enabled) {
      switch (info.Sets[i].Type) {
      case "crafting":
        // Magic item
        // Valid crafting base
        if (item.magic && info.Sets[i].BaseItems.includes(item.classid)) return true;
        // Valid crafting ingredient
        if (info.Sets[i].Ingredients.includes(item.classid)) return true;

        break;
      case "cubing":
        // There is no base check, item has to be put manually on the character
        if (info.Sets[i].Ingredients.includes(item.classid)) return true;

        break;
      case "runewords":
        // There is no base check, item has to be put manually on the character
        if (info.Sets[i].Ingredients.includes(item.classid)) return true;

        break;
      }
    }
  }

  return false;
}

function shopStuff (npcId, classids, amount) {
  print("shopStuff: " + npcId + " " + amount);

  let wpArea, town, path, menuId, npc;
  let leadTimeout = 30;
  let leadRetry = 3;

  this.mover = function (npc, path) {
    path = this.processPath(npc, path);

    for (let i = 0; i < path.length; i += 2) {
      let j;

      Pather.moveTo(path[i] - 3, path[i + 1] - 3);
      moveNPC(npc, path[i], path[i + 1]); // moving npc doesn't work, probably should be removed?

      for (j = 0; j < leadTimeout; j += 1) {
        while (npc.mode === sdk.npcs.mode.Walking) {
          delay(100);
        }

        if (getDistance(npc.x, npc.y, path[i], path[i + 1]) < 4) {
          break;
        }

        if (j > 0 && j % leadRetry === 0) {
          moveNPC(npc, path[i], path[i + 1]);
        }

        delay(1000);
      }

      if (j === leadTimeout) {
        return false;
      }
    }

    delay(1000);

    return true;
  };

  this.processPath = function (npc, path) {
    let cutIndex = 0;
    let dist = 100;

    for (let i = 0; i < path.length; i += 2) {
      if (getDistance(npc, path[i], path[i + 1]) < dist) {
        cutIndex = i;
        dist = getDistance(npc, path[i], path[i + 1]);
      }
    }

    return path.slice(cutIndex);
  };

  this.shopItems = function (classids, amount) {
    let npc = getInteractedNPC();

    if (npc) {
      let items = npc.getItemsEx();

      if (items.length) {
        for (let i = 0; i < items.length; i += 1) {
          if (Storage.Inventory.CanFit(items[i])
              && Pickit.canPick(items[i])
              && me.gold >= items[i].getItemCost(sdk.items.cost.ToBuy)
              && classids.includes(items[i].classid)) {

            //print("Bought " + items[i].name);
            items[i].buy();

            let num = countItems(classids, sdk.items.quality.Magic);

            if (num >= amount) {
              return true;
            }
          }
        }
      }
    }

    return gameRequest;
  };

  Town.doChores();

  switch (npcId.toLowerCase()) {
  case "fara":
    if (!Town.goToTown(2) || !Town.move(NPC.Fara)) throw new Error("Failed to get to NPC");
    
    wpArea = sdk.areas.A2SewersLvl2;
    town = sdk.areas.LutGholein;
    path = [5112, 5094, 5092, 5096, 5078, 5098, 5070, 5085];
    menuId = "Repair";
    npc = Game.getNPC(NPC.Fara);

    break;
  case "elzix":
    if (!Town.goToTown(2) || !Town.move(NPC.Elzix)) throw new Error("Failed to get to NPC");

    wpArea = sdk.areas.A2SewersLvl2;
    town = sdk.areas.LutGholein;
    path = [5038, 5099, 5059, 5102, 5068, 5090, 5067, 5086];
    menuId = "Shop";
    npc = Game.getNPC(NPC.Elzix);

    break;
  case "drognan":
    if (!Town.goToTown(2) || !Town.move(NPC.Drognan)) throw new Error("Failed to get to NPC");
    
    wpArea = sdk.areas.A2SewersLvl2;
    town = sdk.areas.LutGholein;
    path = [5093, 5049, 5088, 5060, 5093, 5079, 5078, 5087, 5070, 5085];
    menuId = "Shop";
    npc = Game.getNPC(NPC.Drognan);

    break;
  case "ormus":
    if (!Town.goToTown(3) || !Town.move(NPC.Ormus)) throw new Error("Failed to get to NPC");
    
    wpArea = sdk.areas.DuranceofHateLvl2;
    town = sdk.areas.KurastDocktown;
    path = [5147, 5089, 5156, 5075, 5157, 5063, 5160, 5050];
    menuId = "Shop";
    npc = Game.getNPC(NPC.Ormus);

    break;
  case "anya":
    if (!Town.goToTown(5) || !Town.move(NPC.Anya)) throw new Error("Failed to get to NPC");
    
    wpArea = sdk.areas.WorldstoneLvl2;
    town = sdk.areas.Harrogath;
    path = [5122, 5119, 5129, 5105, 5123, 5087, 5115, 5068];
    menuId = "Shop";
    npc = Game.getNPC(NPC.Anya);

    break;
  case "malah":
    if (!Town.goToTown(5) || !Town.move(NPC.Malah)) throw new Error("Failed to get to NPC");
    
    wpArea = sdk.areas.CrystalizedPassage;
    town = sdk.areas.Harrogath;
    path = [5077, 5032, 5089, 5025, 5100, 5021, 5106, 5051, 5116, 5071];
    menuId = "Shop";
    npc = Game.getNPC(NPC.Malah);

    break;
  default:
    throw new Error("Invalid shopbot NPC.");
  }

  if (!npc) throw new Error("Failed to find NPC.");
  if (!this.mover(npc, path)) throw new Error("Failed to move NPC");

  Town.move("waypoint");

  let tickCount = getTickCount();

  while (true) {
    if (me.area === town) {
      if (npc.startTrade(menuId)) {
        if (this.shopItems(classids, amount)) return true;
      }

      me.cancel();
    }

    me.area === town && Pather.useWaypoint(wpArea);
    me.area === wpArea && Pather.useWaypoint(town);

    // end script 5 seconds before we need to exit
    if (getTickCount() - tickCount > me.maxgametime - 5000) {
      break;
    }

    delay(5);
  }

  return true;
}
