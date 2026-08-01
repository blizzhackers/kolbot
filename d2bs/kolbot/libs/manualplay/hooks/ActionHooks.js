/**
 *  @filename    ActionHooks.js
 *  @author      theBGuy
 *  @desc        Action hooks for MapThread
 *
 */

/** @type {ActionHooks} */
const ActionHooks = (function () {
  /**
   * @typedef {Object} ActionHookEntry
   * @property {string} name - The name of the hook
   * @property {string} type - The type of the hook (unit, area, portal)
   * @property {string} action - The action to perform (openChest, openPortal, etc.)
   * @property {Object} dest - The destination coordinates (x, y) or area ID
   * @property {Hook} hook
   */
  
  /** @param {ActionHookEntry[]} hooks */
  const clearHooks = function (hooks) {
    while (hooks.length) {
      hooks.pop().hook.remove();
    }
  };

  /**
   * @param {string} name - Hook name
   * @param {string} type - Hook type (area, unit, portal, wp)
   * @param {number|PathNode} dest - Destination area ID or coordinates
   * @param {string} [text] - Custom text (defaults to standard by hook type)
   * @param {{ do: string, id: number }} [action] - Optional action object
   * @returns {ActionHookEntry}
   */
  const createActionHook = function (name, type, dest, text, action = false) {
    if (!text) {
      text = (function () {
        switch (name) {
        case "Next Area":
          return "Num 0: " + getAreaName(dest).replace("Level", "Lvl");
        case "Previous Area":
          return "ÿc1Num 1: " + getAreaName(dest).replace("Level", "Lvl");
        case "Waypoint":
          return "ÿc9Num 2: WP";
        case "POI":
          return "ÿc<Num 3: " + (dest.name || getAreaName(dest));
        case "Side Area":
          return "ÿc3Num 4: " + getAreaName(dest).replace("Level", "Lvl");
        case "POI2":
          return "ÿc<Num 5: " + getAreaName(dest);
        case "POI3":
          return "ÿc<Num 6: " + getAreaName(dest);
        case "POI4":
          return "ÿc<Num 7: " + getAreaName(dest);
        case "POI5":
          return "ÿc<Num 8: " + getAreaName(dest);
        default:
          return name + ": " + getAreaName(dest);
        }
      })();
    }
  
    /** @type {Partial<ActionHookEntry>} */
    const hookObj = {
      name: name,
      type: type,
      dest: dest
    };
  
    if (action) {
      hookObj.action = action;
    }
  
    hookObj.hook = new Text(text, Hooks.dashBoard.x + 5, ActionHooks.yHookLoc());
  
    return hookObj;
  };

  /**
   * @type {Map<number, ActionHookEntry[]>}
   */
  const specialAreaConfigs = new Map([
    [sdk.areas.BloodMoor, [
      { name: "Side Area", type: "area", dest: sdk.areas.DenofEvil },
    ]],
    [sdk.areas.ColdPlains, [
      { name: "Side Area", type: "area", dest: sdk.areas.BurialGrounds },
    ]],
    [sdk.areas.BurialGrounds, [
      { name: "Side Area", type: "area", dest: sdk.areas.Mausoleum },
    ]],
    [sdk.areas.Tristram, [
      {
        name: "POI2",
        type: "unit",
        action: { do: "openChest", id: sdk.quest.chest.Wirt },
        dest: { x: 25048, y: 5177 },
        text: "ÿc<Num 5: Wirt's Leg"
      },
    ]],
    [sdk.areas.UndergroundPassageLvl1, [
      { name: "Side Area", type: "area", dest: sdk.areas.UndergroundPassageLvl2 },
    ]],
    [sdk.areas.BlackMarsh, [
      { name: "Side Area", type: "area", dest: sdk.areas.ForgottenTower },
    ]],
    [sdk.areas.TamoeHighland, [
      { name: "Side Area", type: "area", dest: sdk.areas.PitLvl1 },
    ]],
    [sdk.areas.LutGholein, [
      { name: "Side Area", type: "area", dest: sdk.areas.HaremLvl1 },
    ]],
    [sdk.areas.RockyWaste, [
      { name: "Side Area", type: "area", dest: sdk.areas.StonyTombLvl1 },
    ]],
    [sdk.areas.DryHills, [
      { name: "Side Area", type: "area", dest: sdk.areas.HallsoftheDeadLvl1 },
    ]],
    [sdk.areas.FarOasis, [
      { name: "Side Area", type: "area", dest: sdk.areas.MaggotLairLvl1 },
    ]],
    [sdk.areas.LostCity, [
      { name: "Side Area", type: "area", dest: sdk.areas.AncientTunnels },
    ]],
    [sdk.areas.SpiderForest, [
      { name: "POI3", type: "area", dest: sdk.areas.GreatMarsh },
      { name: "POI2", type: "area", dest: sdk.areas.SpiderCave },
    ]],
    [sdk.areas.FlayerJungle, [
      { name: "POI2", type: "area", dest: sdk.areas.SwampyPitLvl1 },
      { name: "Side Area", type: "area", dest: sdk.areas.FlayerDungeonLvl1 },
    ]],
    [sdk.areas.A3SewersLvl1, [
      { name: "Side Area", type: "area", dest: sdk.areas.KurastBazaar },
    ]],
    [sdk.areas.KurastBazaar, [
      { name: "POI2", type: "area", dest: sdk.areas.DisusedFane },
      { name: "Side Area", type: "area", dest: sdk.areas.RuinedTemple },
    ]],
    [sdk.areas.UpperKurast, [
      { name: "POI3", type: "area", dest: sdk.areas.ForgottenTemple },
      { name: "POI2", type: "area", dest: sdk.areas.ForgottenReliquary },
      { name: "Side Area", type: "area", dest: sdk.areas.A3SewersLvl1 },
    ]],
    [sdk.areas.KurastCauseway, [
      { name: "POI3", type: "area", dest: sdk.areas.RuinedFane },
      { name: "POI2", type: "area", dest: sdk.areas.DisusedReliquary },
      { name: "Side Area", type: "area", dest: sdk.areas.DisusedReliquary },
    ]],
    [sdk.areas.CrystalizedPassage, [
      { name: "Side Area", type: "area", dest: sdk.areas.FrozenRiver },
    ]],
    [sdk.areas.GlacialTrail, [
      { name: "Side Area", type: "area", dest: sdk.areas.DrifterCavern },
    ]],
    [sdk.areas.AncientsWay, [
      { name: "Side Area", type: "area", dest: sdk.areas.IcyCellar },
    ]],
  ]);

  /**
   * area configurations for next/prev areas
   * @type {Map<number, ActionHookEntry[]>}
   */
  const areaConfigs = new Map([
    [sdk.areas.Tristram, [
      { name: "Previous Area", type: "portal", dest: sdk.areas.StonyField },
    ]],

    [sdk.areas.MooMooFarm, [
      { name: "Previous Area", type: "portal", dest: sdk.areas.RogueEncampment },
    ]],

    [sdk.areas.PalaceCellarLvl3, [
      { name: "Previous Area", type: "area", dest: sdk.areas.PalaceCellarLvl2 },
      { name: "Next Area", type: "portal", dest: sdk.areas.ArcaneSanctuary },
    ]],

    [sdk.areas.ArcaneSanctuary, [
      { name: "Previous Area", type: "area", dest: sdk.areas.PalaceCellarLvl3 },
      { name: "Next Area", type: "area", dest: sdk.areas.CanyonofMagic },
    ]],
    
    [sdk.areas.CanyonofMagic, [
      { name: "Previous Area", type: "portal", dest: sdk.areas.ArcaneSanctuary },
    ]],

    [sdk.areas.DuranceofHateLvl3, [
      { name: "Previous Area", type: "area", dest: sdk.areas.DuranceofHateLvl2 },
      { name: "Next Area", type: "area", dest: sdk.areas.PandemoniumFortress },
    ]],

    [sdk.areas.NihlathaksTemple, [
      {
        name: "Previous Area",
        type: "unit",
        dest: { x: 10071, y: 13305 },
        action: { do: "openPortal", id: sdk.areas.Harrogath }
      },
    ]],

    [sdk.areas.Abaddon, [
      { name: "Previous Area", type: "portal", dest: sdk.areas.FrigidHighlands },
    ]],

    [sdk.areas.PitofAcheron, [
      { name: "Previous Area", type: "portal", dest: sdk.areas.ArreatPlateau },
    ]],

    [sdk.areas.InfernalPit, [
      { name: "Previous Area", type: "portal", dest: sdk.areas.FrozenTundra },
    ]],

    [sdk.areas.ThroneofDestruction, [
      { name: "Previous Area", type: "area", dest: sdk.areas.WorldstoneLvl3 },
      { name: "Next Area", type: "area", dest: sdk.areas.WorldstoneChamber },
    ]],
  ]);

  const areaInfo = new Map([
    [sdk.areas.MatronsDen, {
      11: { x: 20023, y: 7643 },
      20: { x: 20303, y: 7803 },
      21: { x: 20263, y: 7683 },
    }],
    
    [sdk.areas.FurnaceofPain, {
      14: { x: 20138, y: 14873 },
      15: { x: 20138, y: 14563 },
    }],
  ]);

  const nextAreas = new Map([
    [sdk.areas.TamoeHighland, sdk.areas.MonasteryGate],
    [sdk.areas.SpiderForest, sdk.areas.FlayerJungle],
    [sdk.areas.GreatMarsh, sdk.areas.FlayerJungle],
    [sdk.areas.CrystalizedPassage, sdk.areas.GlacialTrail],
    [sdk.areas.GlacialTrail, sdk.areas.FrozenTundra],
    [sdk.areas.AncientsWay, sdk.areas.ArreatSummit],
  ]);

  const prevAreas = [
    sdk.areas.None,
    sdk.areas.None,
    sdk.areas.RogueEncampment,
    sdk.areas.BloodMoor,
    sdk.areas.ColdPlains,
    sdk.areas.UndergroundPassageLvl1,
    sdk.areas.DarkWood,
    sdk.areas.BlackMarsh,
    sdk.areas.BloodMoor,
    sdk.areas.ColdPlains,
    sdk.areas.StonyField,
    sdk.areas.BlackMarsh,
    sdk.areas.TamoeHighland,
    sdk.areas.CaveLvl1,
    sdk.areas.UndergroundPassageLvl1,
    sdk.areas.HoleLvl1,
    sdk.areas.PitLvl1,
    sdk.areas.ColdPlains,
    sdk.areas.BurialGrounds,
    sdk.areas.BurialGrounds,
    sdk.areas.BlackMarsh,
    sdk.areas.ForgottenTower,
    sdk.areas.TowerCellarLvl1,
    sdk.areas.TowerCellarLvl2,
    sdk.areas.TowerCellarLvl3,
    sdk.areas.TowerCellarLvl4,
    sdk.areas.TamoeHighland,
    sdk.areas.MonasteryGate,
    sdk.areas.OuterCloister,
    sdk.areas.Barracks,
    sdk.areas.JailLvl1,
    sdk.areas.JailLvl2,
    sdk.areas.JailLvl3,
    sdk.areas.InnerCloister,
    sdk.areas.Cathedral,
    sdk.areas.CatacombsLvl1,
    sdk.areas.CatacombsLvl2,
    sdk.areas.CatacombsLvl3,
    sdk.areas.StonyField,
    sdk.areas.RogueEncampment,
    sdk.areas.RogueEncampment,
    sdk.areas.LutGholein,
    sdk.areas.RockyWaste,
    sdk.areas.DryHills,
    sdk.areas.FarOasis,
    sdk.areas.LostCity,
    sdk.areas.ArcaneSanctuary,
    sdk.areas.LutGholein,
    sdk.areas.A2SewersLvl1,
    sdk.areas.A2SewersLvl2,
    sdk.areas.LutGholein,
    sdk.areas.HaremLvl1,
    sdk.areas.HaremLvl2,
    sdk.areas.PalaceCellarLvl1,
    sdk.areas.PalaceCellarLvl2,
    sdk.areas.RockyWaste,
    sdk.areas.DryHills,
    sdk.areas.HallsoftheDeadLvl1,
    sdk.areas.ValleyofSnakes,
    sdk.areas.StonyTombLvl1,
    sdk.areas.HallsoftheDeadLvl2,
    sdk.areas.ClawViperTempleLvl1,
    sdk.areas.FarOasis,
    sdk.areas.MaggotLairLvl1,
    sdk.areas.MaggotLairLvl2,
    sdk.areas.LostCity,
    sdk.areas.CanyonofMagic,
    sdk.areas.CanyonofMagic,
    sdk.areas.CanyonofMagic,
    sdk.areas.CanyonofMagic,
    sdk.areas.CanyonofMagic,
    sdk.areas.CanyonofMagic,
    sdk.areas.CanyonofMagic,
    sdk.areas.RogueEncampment,
    sdk.areas.PalaceCellarLvl3,
    sdk.areas.RogueEncampment,
    sdk.areas.KurastDocktown,
    sdk.areas.SpiderForest,
    sdk.areas.SpiderForest,
    sdk.areas.FlayerJungle,
    sdk.areas.LowerKurast,
    sdk.areas.KurastBazaar,
    sdk.areas.UpperKurast,
    sdk.areas.KurastCauseway,
    sdk.areas.SpiderForest,
    sdk.areas.SpiderForest,
    sdk.areas.FlayerJungle,
    sdk.areas.SwampyPitLvl1,
    sdk.areas.FlayerJungle,
    sdk.areas.FlayerDungeonLvl1,
    sdk.areas.SwampyPitLvl2,
    sdk.areas.FlayerDungeonLvl2,
    sdk.areas.UpperKurast,
    sdk.areas.A3SewersLvl1,
    sdk.areas.KurastBazaar,
    sdk.areas.KurastBazaar,
    sdk.areas.UpperKurast,
    sdk.areas.UpperKurast,
    sdk.areas.KurastCauseway,
    sdk.areas.KurastCauseway,
    sdk.areas.Travincal,
    sdk.areas.DuranceofHateLvl1,
    sdk.areas.DuranceofHateLvl2,
    sdk.areas.DuranceofHateLvl3,
    sdk.areas.PandemoniumFortress,
    sdk.areas.OuterSteppes,
    sdk.areas.PlainsofDespair,
    sdk.areas.CityoftheDamned,
    sdk.areas.RiverofFlame,
    sdk.areas.PandemoniumFortress,
    sdk.areas.Harrogath,
    sdk.areas.BloodyFoothills,
    sdk.areas.FrigidHighlands,
    sdk.areas.ArreatPlateau,
    sdk.areas.CrystalizedPassage,
    sdk.areas.CrystalizedPassage,
    sdk.areas.GlacialTrail,
    sdk.areas.GlacialTrail,
    sdk.areas.FrozenTundra,
    sdk.areas.AncientsWay,
    sdk.areas.AncientsWay,
    sdk.areas.Harrogath,
    sdk.areas.NihlathaksTemple,
    sdk.areas.HallsofAnguish,
    sdk.areas.HallsofPain,
    sdk.areas.FrigidHighlands,
    sdk.areas.ArreatPlateau,
    sdk.areas.FrozenTundra,
    sdk.areas.ArreatSummit,
    sdk.areas.WorldstoneLvl1,
    sdk.areas.WorldstoneLvl2,
    sdk.areas.WorldstoneLvl3,
    sdk.areas.ThroneofDestruction,
    sdk.areas.Harrogath,
    sdk.areas.Harrogath,
    sdk.areas.Harrogath,
    sdk.areas.Harrogath,
  ];

  const addTombs = function () {
    if (!me.inArea(sdk.areas.CanyonofMagic)) {
      return;
    }

    const correctTomb = getRoom().correcttomb;
    const currExits = getArea()
      .exits.filter((ex) => ex.target !== correctTomb)
      .sort(function (a, b) {
        return a.target - b.target;
      })
      .reverse();

    let curr;
    
    for (let i = 8; i > 4; i--) {
      curr = currExits.shift();
      ActionHooks.hooks.push(createActionHook(
        "POI" + (i - 3),
        "area",
        curr.target
      ));
    }

    curr = currExits.shift();
    ActionHooks.hooks.push(createActionHook(
      "Side Area",
      "area",
      curr.target
    ));

    curr = currExits.shift();
    ActionHooks.hooks.push(createActionHook(
      "POI",
      "area",
      curr.target
    ));
  };
  
  const addUberPortals = function () {
    // Only check for portals if we're in Harrogath in Hell difficulty
    if (!me.inArea(sdk.areas.Harrogath) || !me.hell) {
      return;
    }

    const portalConfig = [
      { area: sdk.areas.MatronsDen, name: "Matron's Den", key: 5, yOffset: 0 },
      { area: sdk.areas.ForgottenSands, name: "Forgotten Sands", key: 6, yOffset: 15 },
      { area: sdk.areas.FurnaceofPain, name: "Furnace of Pain", key: 7, yOffset: 30 },
      { area: sdk.areas.UberTristram, name: "Uber Tristam", key: 8, yOffset: 45 }
    ];

    const openPortals = portalConfig.filter(function (config) {
      return !!Pather.getPortal(config.area);
    });

    if (!openPortals.length) {
      return;
    }

    // draw the box/frame once, when the first portal appears
    if (!ActionHooks.frame.some(function (f) { return f.name === "portalbox"; })) {
      TextHooks.displaySettings = false;
      ActionHooks.frame.push({
        name: "portalbox",
        hook: new Box(Hooks.portalBoard.x - 8, Hooks.portalBoard.y + Hooks.resfix.y - 17, 190, 70, 0x0, 1, 0),
      });
      ActionHooks.frame.push({
        name: "portalframe",
        hook: new Frame(Hooks.portalBoard.x - 8, Hooks.portalBoard.y + Hooks.resfix.y - 17, 190, 70, 0),
      });
    }

    // add a hook only for portals we haven't hooked yet (fixed key/offset per type)
    openPortals.forEach(function (config) {
      if (ActionHooks.getPortalHook(config.name)) return;
      ActionHooks.portals.push({
        name: config.name,
        type: "portal",
        dest: config.area,
        hook: new Text(
          "ÿc1Num " + config.key + ": " + config.name,
          Hooks.portalBoard.x,
          Hooks.portalBoard.y + Hooks.resfix.y + config.yOffset
        ),
      });
    });
  };

  const addChaosSeals = function () {
    if (!me.inArea(sdk.areas.ChaosSanctuary)) {
      return;
    }
    const sealIds = [sdk.objects.DiabloSealInfector, sdk.objects.DiabloSealSeis, sdk.objects.DiabloSealVizier];
    const seals = Game.getPresetObjects(sdk.areas.ChaosSanctuary).filter(function (seal) {
      return sealIds.includes(seal.id);
    }).map(function (seal) {
      return seal.realCoords();
    });

    const infSeal = seals.find(function (seal) {
      return seal.id === sdk.objects.DiabloSealInfector;
    });
    const seisSeal = seals.find(function (seal) {
      return seal.id === sdk.objects.DiabloSealSeis;
    });
    const vizSeal = seals.find(function (seal) {
      return seal.id === sdk.objects.DiabloSealVizier;
    });
    
    if (infSeal) {
      ActionHooks.hooks.push(createActionHook(
        "POI4",
        "unit",
        { x: infSeal.x, y: infSeal.y },
        "ÿc<Num 7: Infector Seal"
      ));
    }

    if (seisSeal) {
      ActionHooks.hooks.push(createActionHook(
        "POI3",
        "unit",
        { x: seisSeal.x, y: seisSeal.y },
        "ÿc<Num 6: Seis Seal"
      ));
    }

    if (vizSeal) {
      ActionHooks.hooks.push(createActionHook(
        "POI2",
        "unit",
        { x: vizSeal.x, y: vizSeal.y },
        "ÿc<Num 5: Viz Seal"
      ));
    }
  };

  const addCowPortal = function () {
    if (!me.inArea(sdk.areas.RogueEncampment)) {
      return;
    }
    
    const cowPortal = Game.getObject(sdk.objects.RedPortal);
    if (cowPortal) {
      ActionHooks.hooks.push(createActionHook(
        "POI2",
        "portal",
        sdk.areas.MooMooFarm,
        "ÿc<Num 5: Cow Portal"
      ));
    }
  };

  const blockKeyEvent = function () {
    return [
      sdk.uiflags.Inventory,
      sdk.uiflags.StatsWindow,
      sdk.uiflags.ChatBox,
      sdk.uiflags.EscMenu,
      sdk.uiflags.Shop,
      sdk.uiflags.Quest,
      sdk.uiflags.Waypoint,
      sdk.uiflags.TradePrompt,
      sdk.uiflags.Msgs,
      sdk.uiflags.Stash,
      sdk.uiflags.Cube,
      sdk.uiflags.Help,
      sdk.uiflags.MercScreen
    ].some(getUIFlag);
  };

  const getOnScreenLocation = function () {
    let possibleLocs = [
      sdk.uiflags.TradePrompt,
      sdk.uiflags.Stash,
      sdk.uiflags.Cube,
      sdk.uiflags.Shop
    ];
  
    for (let i = 0; i < possibleLocs.length; i++) {
      if (getUIFlag(possibleLocs[i])) {
        return possibleLocs.indexOf(possibleLocs[i]);
      }
    }
  
    return -1;
  };

  /**
   * Toggle between default and custom pickit filter
   */
  const togglePickitMode = function() {
    if (ItemHooks.pickitEnabled) {
      ItemHooks.pickitEnabled = false;
    } else {
      ItemHooks.pickitEnabled = true;
      ItemHooks.flush();

      if (!Hooks.saidMessage) {
        showConsole();
        console.log(
          "ÿc<Notify :: ÿc0Item filter has switched to using your Pickit files, this is just to notify you of that. If you didn't add any nip files you probably should switch back."
        );
        console.log(
          "ÿc<Notify :: ÿc0Close this console by pressing Home. You will not see this message again."
        );
        Hooks.saidMessage = true;
      }
    }

    if (TextHooks.displaySettings) {
      TextHooks.getHook("pickitStatus", TextHooks.statusHooks).hook.text
        = "ÿc4N-Pad - ÿc0: " + (ItemHooks.pickitEnabled ? "ÿc<Your Filter" : "ÿc1Default Filter");
    }
  };

  /**
   * Process toggle keys (7, 8, 9, NumpadDash)
   * @returns {boolean} Whether a toggle key was processed
   */
  const processToggleKeys = function() {
    if (blockKeyEvent()) return false;
  
    switch (ActionHooks.action) {
    case sdk.keys.Seven:
      if (TextHooks.displaySettings) {
        TextHooks.getHook("itemStatus", TextHooks.statusHooks).hook.text
          = "ÿc4Key 7ÿc0: " + (ItemHooks.enabled ? "Enable" : "Disable") + " Item Filter";
      }
      ItemHooks.enabled = !ItemHooks.enabled;
      
      return true;
    case sdk.keys.Eight:
      if (TextHooks.displaySettings) {
        TextHooks.getHook("monsterStatus", TextHooks.statusHooks).hook.text
          = "ÿc4Key 8ÿc0: " + (MonsterHooks.enabled ? "Enable" : "Disable") + " Monsters";
      }
      MonsterHooks.enabled = !MonsterHooks.enabled;
      
      return true;
    case sdk.keys.Nine:
      if (TextHooks.displaySettings) {
        TextHooks.getHook("vectorStatus", TextHooks.statusHooks).hook.text
          = "ÿc4Key 9ÿc0: " + (VectorHooks.enabled ? "Enable" : "Disable") + " Vectors";
      }
      VectorHooks.enabled = !VectorHooks.enabled;
      
      return true;
    case sdk.keys.NumpadDash:
      togglePickitMode();
      
      return true;
    }
  
    return false;
  };

  /**
   * Process numpad keys 5 through 8 based on current area
   * @returns {ActionHookEntry|false} The hook to use or false if none
   */
  const processPOIKey = function() {
    if (!ActionHooks.action) return false;
  
    const poi2Areas = [
      sdk.areas.RogueEncampment,
      sdk.areas.Tristram,
      sdk.areas.CanyonofMagic,
      sdk.areas.SpiderForest,
      sdk.areas.FlayerJungle,
      sdk.areas.KurastBazaar,
      sdk.areas.UpperKurast,
      sdk.areas.KurastCauseway,
      sdk.areas.ChaosSanctuary
    ];
  
    const poi3Areas = [
      sdk.areas.CanyonofMagic,
      sdk.areas.SpiderForest,
      sdk.areas.UpperKurast,
      sdk.areas.KurastCauseway,
      sdk.areas.ChaosSanctuary
    ];
  
    const poi4Areas = [
      sdk.areas.CanyonofMagic,
      sdk.areas.ChaosSanctuary
    ];
  
    switch (ActionHooks.action) {
    case sdk.keys.Numpad5:
      if (me.inArea(sdk.areas.Harrogath)) {
        return ActionHooks.getPortalHook("Matron's Den");
      } else if (poi2Areas.includes(me.area)) {
        return ActionHooks.getHook("POI2");
      }
      break;
    case sdk.keys.Numpad6:
      if (me.inArea(sdk.areas.Harrogath)) {
        return ActionHooks.getPortalHook("Sands");
      } else if (poi3Areas.includes(me.area)) {
        return ActionHooks.getHook("POI3");
      }
      break;
    case sdk.keys.Numpad7:
      if (me.inArea(sdk.areas.Harrogath)) {
        return ActionHooks.getPortalHook("Furnace");
      } else if (poi4Areas.includes(me.area)) {
        return ActionHooks.getHook("POI4");
      }
      break;
    case sdk.keys.Numpad8:
      return me.inArea(sdk.areas.CanyonofMagic)
        ? ActionHooks.getHook("POI5")
        : ActionHooks.getPortalHook("Uber Tristam");
    }
  
    return false;
  };

  /**
   * Process the control key with selected item
   * @returns {Object|false} Action object or false
   */
  const processCtrlKey = function() {
    if (ActionHooks.action !== sdk.keys.Ctrl) return false;
  
    const unit = Game.getSelectedUnit();
    if (!unit) return false;
  
    const validLocations = [0, 1, 2];
    const ctrlObj = {
      0: {
        3: "moveItemFromInvoToTrade",
        5: "moveItemFromTradeToInvo",
      },
      1: {
        3: "moveItemFromInvoToStash",
        7: "moveItemFromStashToInvo",
      },
      2: {
        3: "moveItemFromInvoToCube",
        6: "moveItemFromCubeToInvo",
      },
      3: "sellItem",
    };
    const screenLoc = getOnScreenLocation();
    if (validLocations.includes(screenLoc) && ctrlObj[screenLoc] && ctrlObj[screenLoc][unit.location]) {
      return { type: "qol", action: ctrlObj[screenLoc][unit.location] };
    }
  
    return false;
  };

  /**
   * Process special action keys (5, 6, Insert)
   * @returns {Object|false} Action object or false
   */
  const processActionKey = function() {
    if (!ActionHooks.action) return false;
  
    const validUIState = function () {
      return (
        !getUIFlag(sdk.uiflags.Stash)
        && !getUIFlag(sdk.uiflags.TradePrompt)
        && !getUIFlag(sdk.uiflags.Inventory)
      );
    };

    const result = { type: "qol", dest: false, action: false };
  
    switch (ActionHooks.action) {
    case sdk.keys.Five:
      if (!me.inTown) {
        if (me.getTpTool()) {
          result.action = "makePortal";
          return result;
        }
      } else if (validUIState()) {
        result.action = "heal";
        return result;
      }
      break;
    case sdk.keys.Six:
      if (!me.inTown) {
        if (me.getTpTool()) {
          result.action = "takePortal";
          return result;
        }
      } else if (validUIState()) {
        result.action = "openStash";
        return result;
      }
      break;
    case sdk.keys.Insert:
      if (!me.inTown) {
        result.action = "clear";
        return result;
      }
      break;
    }
  
    return false;
  };
  
  return {
    enabled: true,
    /** @type {ActionHookEntry[]} */
    hooks: [],
    /** @type {ActionHookEntry[]} */
    portals: [],
    /** @type {ActionHookEntry[]} */
    frame: [],
    action: null,
    currArea: 0,
    prevAreas: prevAreas,

    /**
     * Set action based on key input
     * @param {number} keycode
     * @returns {void}
     * @todo this would probably be better as pushing to an action stack and implementing a timeout to prevent spamming the same action
     */
    event: function (keycode) {
      if ([sdk.keys.Shift, sdk.keys.Alt].some((k) => k === keycode)) {
        return;
      }

      ActionHooks.action = keycode;
    },

    checkAction: function () {
      if (!ActionHooks.action) {
        return;
      }
      
      const obj = { type: false, dest: false, action: false };

      try {
        // quick ones first - ends checkAction if one of these was true
        if ([sdk.keys.Seven, sdk.keys.Eight, sdk.keys.Nine, sdk.keys.NumpadDash].includes(this.action)) {
          processToggleKeys();

          return;
        }

        const qolObj = processActionKey();
        if (qolObj && qolObj.action) {
          Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(qolObj));

          return;
        }
        
        const ctrlObj = processCtrlKey();
        if (ctrlObj && ctrlObj.action) {
          Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(ctrlObj));

          return;
        }

        let hook = processPOIKey();
        if (hook) {
          Object.assign(obj, hook);
          Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(obj));

          return;
        }
        
        hook = ((action) => {
          switch (action) {
          case sdk.keys.Numpad0:
            return ActionHooks.getHook("Next Area");
          case sdk.keys.Numpad1:
            return ActionHooks.getHook("Previous Area");
          case sdk.keys.Numpad2:
            return ActionHooks.getHook("Waypoint");
          case sdk.keys.Numpad3:
            return ActionHooks.getHook("POI");
          case sdk.keys.Numpad4:
            return ActionHooks.getHook("Side Area");
          case 188: // shift <
            return TextHooks.getHook("Previous Act", TextHooks.qolHooks);
          case 190: // shift >
            return TextHooks.getHook("Next Act", TextHooks.qolHooks);
          default:
            return null;
          }
        })(this.action);

        if (hook) {
          Object.assign(obj, hook);
          Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(obj));
        }
      } catch (e) {
        console.error(e);
      } finally {
        ActionHooks.action = null;
      }
    },

    check: function () {
      if (!this.enabled) return;

      ActionHooks.checkAction();

      if (me.area !== this.currArea) {
        this.flush();

        while (!me.area || !me.gameReady) {
          delay(150);
        }

        ActionHooks.add(me.area);
        TextHooks.events.emit("areachange", me.area);
        ActionHooks.currArea = me.area;
      }

      addUberPortals(); // poll - crafted portals appear without an area change
    },

    yHookLoc: function () {
      return 545 - this.hooks.length * 10 + Hooks.resfix.y;
    },

    /**
     * Creates new action hook based on our current area
     * @param {number} area
     */
    add: function (area) {
      let bossX;

      // Specific area override
      if (me.inArea(sdk.areas.CanyonofMagic) && !nextAreas.has(sdk.areas.CanyonofMagic)) {
        nextAreas.set(sdk.areas.CanyonofMagic, getRoom().correcttomb);
      }

      if (specialAreaConfigs.has(area)) {
        for (let config of specialAreaConfigs.get(area)) {
          this.hooks.push(createActionHook(
            config.name,
            config.type,
            config.dest,
            Object.hasOwn(config, "text") ? config.text : "",
            Object.hasOwn(config, "action") ? config.action : false
          ));
        }
      }

      addTombs();
      addChaosSeals();
      addCowPortal();

      const poi = VectorHooks.getPOI();

      if (poi) {
        this.hooks.push(createActionHook(
          "POI",
          "unit",
          { x: poi.x, y: poi.y },
          "ÿc<Num 3: " + poi.name,
          poi.action || false
        ));
      }

      const wp = VectorHooks.getWP();

      if (wp) {
        this.hooks.push(createActionHook("Waypoint", "wp", { x: wp.x, y: wp.y }));
      }

      if (areaConfigs.has(area)) {
        for (let config of areaConfigs.get(area)) {
          this.hooks.push(createActionHook(
            config.name,
            config.type,
            config.dest,
            Object.hasOwn(config, "text") ? config.text : "",
            Object.hasOwn(config, "action") ? config.action : false
          ));
        }
      }

      if (
        me.inArea(sdk.areas.DuranceofHateLvl3)
        || me.inArea(sdk.areas.PalaceCellarLvl3)
        || me.inArea(sdk.areas.ThroneofDestruction)
      ) {
        // hacky but this is the only way to get the correct ordering
        return;
      }
      
      let entrance = { x: 0, y: 0 };

      switch (me.area) {
      case sdk.areas.ForgottenSands:
        me.inArea(sdk.areas.ForgottenSands) && (entrance = { x: 20193, y: 8693 });
      // eslint-disable-next-line no-fallthrough
      case sdk.areas.MatronsDen:
      case sdk.areas.FurnaceofPain:
        bossX = Game.getPresetObject(me.area, sdk.objects.SmallSparklyChest);
        bossX && (entrance = areaInfo.get(me.area)[bossX.x]);
      // eslint-disable-next-line no-fallthrough
      case sdk.areas.UberTristram:
        me.inArea(sdk.areas.UberTristram) && (entrance = { x: 25105, y: 5140 });

        this.hooks.push(createActionHook(
          "Previous Area",
          "unit",
          entrance,
          "ÿc1Num 1: " + getAreaName(sdk.areas.Harrogath),
          { do: "usePortal", id: sdk.areas.Harrogath }
        ));

        break;
      }

      let nextCheck = false;
      /** @type {Area["exits"]} */
      const exits = getArea(area).exits;

      if (exits) {
        for (let exit of exits) {
          if (exit.target === prevAreas[me.area]) {
            this.hooks.push(createActionHook("Previous Area", "area", prevAreas[me.area]));

            break;
          }
        }

        // Check nextAreas first
        for (let exit of exits) {
          if (exit.target === nextAreas.get(me.area)) {
            this.hooks.push(createActionHook("Next Area", "area", nextAreas.get(me.area)));
            nextCheck = true;

            break;
          }
        }

        // In case the area isn't in nextAreas array, use prevAreas array
        if (!nextCheck) {
          for (let exit of exits) {
            if (exit.target === prevAreas.indexOf(me.area)) {
              this.hooks.push(createActionHook("Next Area", "area", prevAreas.indexOf(me.area)));

              break;
            }
          }
        }
      }

      if (poi && poi.name === "Orifice") {
        this.hooks.push(createActionHook("Next Area", "area", sdk.areas.DurielsLair));
      }
    },

    getHook: function (name) {
      for (let i = 0; i < this.hooks.length; i += 1) {
        if (this.hooks[i].name === name) {
          return this.hooks[i];
        }
      }

      return false;
    },

    getPortalHook: function (name) {
      for (let i = 0; i < this.portals.length; i += 1) {
        if (this.portals[i].name === name) {
          return this.portals[i];
        }
      }

      return false;
    },

    flush: function () {
      clearHooks(ActionHooks.hooks);
      clearHooks(ActionHooks.portals);
      clearHooks(ActionHooks.frame);

      ActionHooks.currArea = 0;
    },
  };
})();
