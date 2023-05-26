/**
*  @filename    CraftingSystem.js
*  @author      kolton
*  @desc        Multi-profile crafting system
*  @notes       This system is experimental, there will be no support offered for it.
*               If you can't get it to work, leave it be.
*               This is the main driver file, for the Teams config @see TeamsConfig.js
*
*/

const CraftingSystem = {};

// load configuration file
CraftingSystem.Teams = Object.assign({}, require("./TeamsConfig", null, false));

// ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

// Get the Crafting System information for current profile
CraftingSystem.getInfo = function () {
  for (let i in CraftingSystem.Teams) {
    if (CraftingSystem.Teams.hasOwnProperty(i)) {
      for (let j = 0; j < CraftingSystem.Teams[i].Collectors.length; j += 1) {
        if (CraftingSystem.Teams[i].Collectors[j].toLowerCase() === me.profile.toLowerCase()) {
          let info = CraftingSystem.Teams[i];
          info.collector = true;
          info.worker = false;

          return info;
        }
      }

      for (let j = 0; j < CraftingSystem.Teams[i].Workers.length; j += 1) {
        if (CraftingSystem.Teams[i].Workers[j].toLowerCase() === me.profile.toLowerCase()) {
          let info = CraftingSystem.Teams[i];
          info.collector = false;
          info.worker = true;

          return info;
        }
      }
    }
  }

  return false;
};

// #################################################
// # Item collector out of game specific functions #
// #################################################

CraftingSystem.check = false;
CraftingSystem.inGame = false;

CraftingSystem.outOfGameCheck = function () {
  if (!CraftingSystem.check) return false;

  let info = CraftingSystem.getInfo();

  function scriptMsg(msg) {
    let obj;

    try {
      obj = JSON.parse(msg);
    } catch (e) {
      return false;
    }

    obj.name === "RequestWorker" && scriptBroadcast(JSON.stringify({ name: "WorkerName", value: worker.name }));

    return true;
  }

  if (info && info.collector) {
    let worker = CraftingSystem.getWorker();

    if (worker && worker.game) {
      D2Bot.printToConsole("CraftingSystem: Transfering items.", sdk.colors.D2Bot.DarkGold);
      D2Bot.updateStatus("CraftingSystem: In game.");
      addEventListener("scriptmsg", scriptMsg);

      CraftingSystem.inGame = true;
      me.blockMouse = true;

      delay(2000);
      joinGame(worker.game[0], worker.game[1]);

      me.blockMouse = false;

      delay(5000);

      while (me.ingame) {
        delay(1000);
      }

      CraftingSystem.inGame = false;
      CraftingSystem.check = false;

      removeEventListener("scriptmsg", scriptMsg);

      return true;
    }
  }

  return false;
};

CraftingSystem.getWorker = function () {
  let rval = {
    game: false,
    name: false
  };
  let info = CraftingSystem.getInfo();

  function checkEvent(mode, msg) {
    if (mode === 4) {
      for (let i = 0; i < info.CraftingGames.length; i += 1) {
        if (info.CraftingGames[i] && msg.match(info.CraftingGames[i], "i")) {
          rval.game = msg.split("/");

          break;
        }
      }
    }
  }

  if (info && info.collector) {
    addEventListener("copydata", checkEvent);

    rval.game = false;

    for (let i = 0; i < info.Workers.length; i += 1) {
      sendCopyData(null, info.Workers[i], 0, JSON.stringify({ name: "GetGame", profile: me.profile }));
      delay(100);

      if (rval.game) {
        rval.name = info.Workers[i];

        break;
      }
    }

    removeEventListener("copydata", checkEvent);

    return rval;
  }

  return false;
};

// #############################################
// # Item collector in-game specific functions #
// #############################################

CraftingSystem.inGameCheck = function () {
  let info = CraftingSystem.getInfo();

  if (info && info.collector) {
    for (let i = 0; i < info.CraftingGames.length; i += 1) {
      if (info.CraftingGames[i] && me.gamename.match(info.CraftingGames[i], "i")) {
        CraftingSystem.dropItems();
        me.cancel();
        delay(5000);
        quit();

        return true;
      }
    }
  }

  return false;
};

CraftingSystem.neededItems = [];
CraftingSystem.validGids = [];
CraftingSystem.itemList = [];
CraftingSystem.fullSets = [];

// Check whether item can be used for crafting
CraftingSystem.validItem = function (item) {
  switch (item.itemType) {
  case sdk.items.type.Jewel:
    // Use junk jewels only
    return NTIP.CheckItem(item) === Pickit.Result.UNWANTED;
  }

  return true;
};

// Check if the item should be picked for crafting
CraftingSystem.checkItem = function (item) {
  let info = CraftingSystem.getInfo();

  if (info) {
    for (let i = 0; i < CraftingSystem.neededItems.length; i += 1) {
      if (item.classid === CraftingSystem.neededItems[i] && CraftingSystem.validItem(item)) {
        return true;
      }
    }
  }

  return false;
};

// Check if the item should be kept or dropped
CraftingSystem.keepItem = function (item) {
  let info = CraftingSystem.getInfo();

  if (info) {
    if (info.collector) return CraftingSystem.validGids.includes(item.gid);

    if (info.worker) {
      // Let pickit decide whether to keep crafted
      return item.crafted ? false : true;
    }
  }

  return false;
};

// Collect ingredients only if a worker needs them
CraftingSystem.getSetInfoFromWorker = function (workerName) {
  let setInfo = false;
  let info = CraftingSystem.getInfo();

  function copyData(mode, msg) {
    let obj;

    if (mode === 4) {
      try {
        obj = JSON.parse(msg);
      } catch (e) {
        return false;
      }

      obj && obj.name === "SetInfo" && (setInfo = obj.value);
    }

    return true;
  }

  if (info && info.collector) {
    addEventListener("copydata", copyData);
    sendCopyData(null, workerName, 0, JSON.stringify({ name: "GetSetInfo", profile: me.profile }));
    delay(100);

    if (setInfo !== false) {
      removeEventListener("copydata", copyData);

      return setInfo;
    }

    removeEventListener("copydata", copyData);
  }

  return false;
};

CraftingSystem.init = function (name) {
  let info = CraftingSystem.getInfo();

  if (info && info.collector) {
    for (let i = 0; i < info.Sets.length; i += 1) {
      info.Sets[i].Enabled = false;
    }

    let setInfo = CraftingSystem.getSetInfoFromWorker(name);

    if (setInfo) {
      for (let i = 0; i < setInfo.length; i += 1) {
        if (setInfo[i] === 1 && info.Sets[i].Enabled === false) {
          info.Sets[i].Enabled = true;
        }
      }
    }
  }
};

// Build global lists of needed items and valid ingredients
CraftingSystem.buildLists = function (onlyNeeded) {
  let info = CraftingSystem.getInfo();

  if (info && info.collector) {
    CraftingSystem.neededItems = [];
    CraftingSystem.validGids = [];
    CraftingSystem.fullSets = [];
    CraftingSystem.itemList = me.findItems(-1, sdk.items.mode.inStorage);

    for (let i = 0; i < info.Sets.length; i += 1) {
      if (!onlyNeeded || info.Sets[i].Enabled) {
        CraftingSystem.checkSet(info.Sets[i]);
      }
    }

    return true;
  }

  return false;
};

// Check which ingredients a set needs and has
CraftingSystem.checkSet = function (set) {
  let rval = {};
  let setNeeds = [];
  let setHas = [];

  // Get what set needs
  // Multiply by SetAmount
  for (let amount = 0; amount < set.SetAmount; amount += 1) {
    for (let i = 0; i < set.Ingredients.length; i += 1) {
      setNeeds.push(set.Ingredients[i]);
    }
  }

  // Remove what set already has
  for (let i = 0; i < setNeeds.length; i += 1) {
    for (let j = 0; j < CraftingSystem.itemList.length; j += 1) {
      if (CraftingSystem.itemList[j].classid === setNeeds[i]) {
        setHas.push(CraftingSystem.itemList[j].gid);
        setNeeds.splice(i, 1);
        CraftingSystem.itemList.splice(j, 1);

        i -= 1;
        j -= 1;
      }
    }
  }

  // The set is complete
  setNeeds.length === 0 && CraftingSystem.fullSets.push(setHas.slice());

  CraftingSystem.neededItems = CraftingSystem.neededItems.concat(setNeeds);
  CraftingSystem.validGids = CraftingSystem.validGids.concat(setHas);

  CraftingSystem.neededItems.sort(Sort.numbers);
  CraftingSystem.validGids.sort(Sort.numbers);

  return rval;
};

// Update lists when a valid ingredient is picked
CraftingSystem.update = function (item) {
  CraftingSystem.neededItems.splice(CraftingSystem.neededItems.indexOf(item.classid), 1);
  CraftingSystem.validGids.push(item.gid);

  return true;
};

// Cube flawless gems if the ingredient is a perfect gem
CraftingSystem.checkSubrecipes = function () {
  for (let i = 0; i < CraftingSystem.neededItems.length; i += 1) {
    switch (CraftingSystem.neededItems[i]) {
    case sdk.items.gems.Perfect.Amethyst:
    case sdk.items.gems.Perfect.Topaz:
    case sdk.items.gems.Perfect.Sapphire:
    case sdk.items.gems.Perfect.Emerald:
    case sdk.items.gems.Perfect.Ruby:
    case sdk.items.gems.Perfect.Diamond:
    case sdk.items.gems.Perfect.Skull:
      if (Cubing.subRecipes.indexOf(CraftingSystem.neededItems[i]) === -1) {
        Cubing.subRecipes.push(CraftingSystem.neededItems[i]);
        Cubing.recipes.push({
          Ingredients: [
            CraftingSystem.neededItems[i] - 1,
            CraftingSystem.neededItems[i] - 1,
            CraftingSystem.neededItems[i] - 1
          ],
          Index: 0,
          AlwaysEnabled: true,
          MainRecipe: "Crafting"
        });
      }

      break;
    }
  }

  return true;
};

// Check if there are any complete ingredient sets
CraftingSystem.checkFullSets = function () {
  let info = CraftingSystem.getInfo();

  if (info && info.collector) {
    for (let i = 0; i < info.Workers.length; i += 1) {
      CraftingSystem.init(info.Workers[i]);
      CraftingSystem.buildLists(true);

      if (CraftingSystem.fullSets.length) {
        return true;
      }
    }
  }

  return false;
};

// Drop complete ingredient sets
CraftingSystem.dropItems = function () {
  Town.goToTown(1);
  Town.move("stash");
  Town.openStash();

  let worker;

  function scriptMsg(msg) {
    let obj;

    try {
      obj = JSON.parse(msg);
    } catch (e) {
      return false;
    }

    !!obj && obj.name === "WorkerName" && (worker = obj.value);

    return true;
  }

  addEventListener("scriptmsg", scriptMsg);
  scriptBroadcast(JSON.stringify({ name: "RequestWorker" }));
  delay(100);

  if (worker) {
    CraftingSystem.init(worker);
    CraftingSystem.buildLists(true);
    removeEventListener("scriptmsg", scriptMsg);

    while (CraftingSystem.fullSets.length) {
      let gidList = CraftingSystem.fullSets.shift();

      while (gidList.length) {
        let item = me.getItem(-1, -1, gidList.shift());
        !!item && item.drop();
      }
    }

    CraftingSystem.dropGold();
    delay(1000);
    me.cancel();
  }

  return true;
};

CraftingSystem.dropGold = function () {
  Town.goToTown(1);
  Town.move("stash");

  if (me.getStat(sdk.stats.Gold) >= 10000) {
    gold(10000);
  } else if (me.getStat(sdk.stats.GoldBank) + me.getStat(sdk.stats.Gold) >= 10000) {
    Town.openStash();
    gold(10000 - me.getStat(sdk.stats.Gold), 4);
    gold(10000);
  }
};
