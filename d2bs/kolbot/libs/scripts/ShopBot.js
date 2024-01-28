/**
*  @filename    ShopBot.js
*  @author      kolton, theBGuy
*  @desc        shop for items continually
*
*/

function ShopBot () {
  const overlayText = {
    title: new Text("kolbot shopbot", 50, 245, 2, 1),
    cycles: new Text("Cycles in last minute: 0", 50, 260, 2, 1),
    frequency: new Text("Valid item frequency: 0", 50, 275, 2, 1),
    totalCycles: new Text("Total cycles: 0", 50, 290, 2, 1),
  };

  let tickCount;
  let cycles = 0;
  let validItems = 0;
  let totalCycles = 0;

  /** @type {Array<[(item: ItemUnit) => boolean, (item: ItemUnit) => boolean, (item: ItemUnit) => boolean]>} */
  const pickEntries = [];
  /** @type {Object<string, NPCUnit>} */
  const npcs = {};
  const wpPresets = {
    1: sdk.objects.A1Waypoint,
    2: sdk.objects.A2Waypoint,
    3: sdk.objects.A3Waypoint,
    4: sdk.objects.A4Waypoint,
    5: sdk.objects.A5Waypoint
  };
  const outOfTownWps = {
    1: sdk.areas.CatacombsLvl2,
    2: sdk.areas.A2SewersLvl2,
    3: sdk.areas.DuranceofHateLvl2,
    4: sdk.areas.RiverofFlame,
    5: sdk.areas.CrystalizedPassage
  };
  const shopableNPCS = new Map([
    // Act 1
    [NPC.Charsi, { town: sdk.areas.RogueEncampment, menuId: "Repair" }],
    [NPC.Akara, { town: sdk.areas.RogueEncampment, menuId: "Shop" }],
    [NPC.Gheed, { town: sdk.areas.RogueEncampment, menuId: "Shop" }],
    // Act 2
    [NPC.Fara, { town: sdk.areas.LutGholein, menuId: "Repair" }],
    [NPC.Elzix, { town: sdk.areas.LutGholein, menuId: "Shop" }],
    [NPC.Drognan, { town: sdk.areas.LutGholein, menuId: "Shop" }],
    // Act 3
    [NPC.Hratli, { town: sdk.areas.KurastDocktown, menuId: "Repair" }],
    [NPC.Asheara, { town: sdk.areas.KurastDocktown, menuId: "Shop" }],
    [NPC.Ormus, { town: sdk.areas.KurastDocktown, menuId: "Shop" }],
    // Act 4
    [NPC.Halbu, { town: sdk.areas.PandemoniumFortress, menuId: "Repair" }],
    [NPC.Jamella, { town: sdk.areas.PandemoniumFortress, menuId: "Shop" }],
    // Act 5
    [NPC.Larzuk, { town: sdk.areas.Harrogath, menuId: "Repair" }],
    [NPC.Malah, { town: sdk.areas.Harrogath, menuId: "Shop" }],
    [NPC.Anya, { town: sdk.areas.Harrogath, menuId: "Shop" }],
    [NPC.Nihlathak, { town: sdk.areas.Harrogath, menuId: "Shop" }]
  ]);

  const buildPickList = function () {
    let nipfile, filepath = "pickit/shopbot.nip";
    let filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);

    if (!FileTools.exists(filepath)) {
      Misc.errorReport("ÿc1NIP file doesn't exist: ÿc0" + filepath);
      return false;
    }

    try {
      nipfile = File.open(filepath, 0);
    } catch (fileError) {
      Misc.errorReport("ÿc1Failed to load NIP: ÿc0" + filename);
    }

    if (!nipfile) return false;

    let lines = nipfile.readAllLines();
    nipfile.close();

    for (let i = 0; i < lines.length; i += 1) {
      let info = {
        line: i + 1,
        file: filename,
        string: lines[i]
      };

      let line = NTIP.ParseLineInt(lines[i], info);
      line && pickEntries.push(line);
    }

    return true;
  };

  /**
   * Interact and open the menu of an NPC unit
   * @param {NPCUnit} npc 
   * @returns {boolean}
   */
  const openMenu = function (npc) {
    if (!npc || npc.type !== sdk.unittype.NPC) throw new Error("Unit.openMenu: Must be used on NPCs.");

    let interactedNPC = getInteractedNPC();

    if (interactedNPC && interactedNPC.name !== npc.name) {
      Packet.cancelNPC(interactedNPC);
      me.cancel();
    }

    if (getUIFlag(sdk.uiflags.NPCMenu)) return true;

    for (let i = 0; i < 10; i += 1) {
      npc.distance > 5 && Pather.walkTo(npc.x, npc.y);

      if (!getUIFlag(sdk.uiflags.NPCMenu)) {
        Packet.entityInteract(npc);
        Packet.initNPC(npc);
      }

      let tick = getTickCount();

      while (getTickCount() - tick < Math.max(Math.round((i + 1) * 250 / (i / 3 + 1)), me.ping + 1)) {
        if (getUIFlag(sdk.uiflags.NPCMenu)) {
          return true;
        }

        delay(10);
      }
    }

    me.cancel();

    return false;
  };

  /**
   * @param {NPCUnit} npc 
   * @param {number} menuId 
   * @returns {boolean}
   */
  const shopItems = function (npc, menuId) {
    if (!Storage.Inventory.CanFit({ sizex: 2, sizey: 4 }) && AutoMule.getMuleItems().length > 0) {
      D2Bot.printToConsole("Mule triggered");
      scriptBroadcast("mule");
      scriptBroadcast("quit");
      return true;
    }

    if (!npc) return false;

    for (let i = 0; i < 10; i += 1) {
      delay(150);

      i % 2 === 0 && sendPacket(1, sdk.packets.send.EntityAction, 4, 1, 4, npc.gid, 4, 0);

      if (npc.itemcount > 0) {
        break;
      }
    }

    let items = npc.getItemsEx().filter(function (item) {
      return (Config.ShopBot.ScanIDs.includes(item.classid) || Config.ShopBot.ScanIDs.length === 0);
    });
    if (!items.length) return false;

    me.overhead(npc.itemcount + " items, " + items.length + " valid");

    let bought;
    validItems += items.length;
    overlayText.frequency.text = "Valid base items / cycle: " + ((validItems / totalCycles).toFixed(2).toString());

    for (let i = 0; i < items.length; i += 1) {
      if (Storage.Inventory.CanFit(items[i]) && Pickit.canPick(items[i]) &&
          me.gold >= items[i].getItemCost(sdk.items.cost.ToBuy) &&
          NTIP.CheckItem(items[i], pickEntries)
      ) {
        beep();
        D2Bot.printToConsole("Match found!", sdk.colors.D2Bot.DarkGold);
        delay(1000);

        if (npc.startTrade(menuId)) {
          Item.logItem("Shopped", items[i]);
          items[i].buy();
          bought = true;
        }

        Config.ShopBot.QuitOnMatch && scriptBroadcast("quit");
      }
    }

    if (bought) {
      me.cancelUIFlags();
      Town.stash();
    }

    return true;
  };

  /**
   * @param {string} name 
   * @returns {boolean}
   */
  const shopAtNPC = function (name) {
    if (!shopableNPCS.has(name)) {
      throw new Error("Invalid NPC");
    }

    const { town, menuId } = shopableNPCS.get(name);

    if (!me.inArea(town) && !Pather.useWaypoint(town)) return false;

    let npc = npcs[name] || Game.getNPC(name);

    if (!npc || npc.type !== sdk.unittype.NPC || npc.distance > 5) {
      npc = Town.npcInteract(name);
    }

    if (!npc) return false;

    !npcs[name] && (npcs[name] = copyUnit(npc));
    Config.ShopBot.CycleDelay && delay(Config.ShopBot.CycleDelay);
    openMenu(npc) && shopItems(npc, menuId);

    return true;
  };

  // START
  for (let i = 0; i < Config.ShopBot.ScanIDs.length; i += 1) {
    if (isNaN(Config.ShopBot.ScanIDs[i])) {
      if (NTIPAliasClassID.hasOwnProperty(Config.ShopBot.ScanIDs[i].replace(/\s+/g, "").toLowerCase())) {
        Config.ShopBot.ScanIDs[i] = NTIPAliasClassID[Config.ShopBot.ScanIDs[i].replace(/\s+/g, "").toLowerCase()];
      } else {
        Misc.errorReport("ÿc1Invalid ShopBot entry:ÿc0 " + Config.ShopBot.ScanIDs[i]);
        Config.ShopBot.ScanIDs.splice(i, 1);
        i -= 1;
      }
    }
  }

  typeof Config.ShopBot.ShopNPC === "string" && (Config.ShopBot.ShopNPC = [Config.ShopBot.ShopNPC]);

  for (let i = 0; i < Config.ShopBot.ShopNPC.length; i += 1) {
    Config.ShopBot.ShopNPC[i] = Config.ShopBot.ShopNPC[i].toLowerCase();
  }

  if (Config.ShopBot.MinGold && me.gold < Config.ShopBot.MinGold) return true;

  buildPickList();
  console.log("Shopbot: Pickit entries: " + pickEntries.length);
  Town.doChores();

  Pather.teleport = false;
  tickCount = getTickCount();

  while (!Config.ShopBot.Cycles || totalCycles < Config.ShopBot.Cycles) {
    if (getTickCount() - tickCount >= 60 * 1000) {
      overlayText.cycles.text = "Cycles in last minute: " + cycles.toString();
      overlayText.totalCycles.text = "Total cycles: " + totalCycles.toString();
      cycles = 0;
      tickCount = getTickCount();
    }

    for (let i = 0; i < Config.ShopBot.ShopNPC.length; i += 1) {
      shopAtNPC(Config.ShopBot.ShopNPC[i]);
    }

    if (me.inTown) {
      let area = getArea();
      const wp = Game.getPresetObject(me.area, wpPresets[me.act]).realCoords();
      const redPortal = (getUnits(sdk.unittype.Object, sdk.objects.RedPortal)
        .sort((a, b) => a.distance - b.distance))
        .first();
      let exit = area.exits[0];

      for (let i = 1; i < area.exits.length; i++) {
        if (getDistance(me, exit) > getDistance(me, area.exits[i])) {
          exit = area.exits[i];
        }
      }

      if (!!redPortal && redPortal.distance < 20 && Pather.usePortal(null, null, redPortal)) {
        delay(3000);
        Pather.usePortal(sdk.areas.townOf(me.area));

        if (totalCycles === 0) {
          delay(10000);
        }

        delay(1500);
      } else if (getDistance(me, exit) < (getDistance(me, wp.x, wp.y) + 6)) {
        Pather.moveToExit(me.area + 1, true);
        Pather.moveToExit(me.area - 1, true);
      } else {
        Pather.useWaypoint(outOfTownWps[me.act]);
      }
    }

    cycles += 1;
    totalCycles += 1;
  }

  return true;
}
