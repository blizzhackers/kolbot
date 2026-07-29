/**
*  @filename    VectorHooks.js
*  @author      theBGuy
*  @desc        Vector hooks for MapThread
*
*/

const VectorHooks = (function () {
  const nextAreas = new Map([
    [sdk.areas.TamoeHighland, sdk.areas.MonasteryGate],
    [sdk.areas.SpiderForest, sdk.areas.FlayerJungle],
    [sdk.areas.GreatMarsh, sdk.areas.FlayerJungle],
    [sdk.areas.CrystalizedPassage, sdk.areas.GlacialTrail],
    [sdk.areas.GlacialTrail, sdk.areas.FrozenTundra],
    [sdk.areas.AncientsWay, sdk.areas.ArreatSummit],
    [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber],
  ]);

  /**
   * Areas that contain super chests
   */
  const superChestAreas = new Set([
    sdk.areas.CaveLvl2,
    sdk.areas.HoleLvl2,
    sdk.areas.PitLvl2,
    sdk.areas.UndergroundPassageLvl2,
    sdk.areas.Crypt,
    sdk.areas.Mausoleum,
    sdk.areas.StonyTombLvl2,
    sdk.areas.AncientTunnels,
    sdk.areas.GreatMarsh,
    sdk.areas.SpiderCave,
    sdk.areas.SwampyPitLvl3,
    sdk.areas.DisusedFane,
    sdk.areas.ForgottenReliquary,
    sdk.areas.ForgottenTemple,
    sdk.areas.DisusedReliquary,
    sdk.areas.DrifterCavern,
    sdk.areas.IcyCellar,
    sdk.areas.Abaddon,
    sdk.areas.PitofAcheron,
    sdk.areas.InfernalPit
  ]);
  
  /**
   * Areas that contain large sparkly chests
   */
  const largeSparklyChestAreas = new Set([
    sdk.areas.GlacialTrail,
    sdk.areas.HallsofAnguish,
    sdk.areas.HallsofPain
  ]);

  const hellEntranceAreas = new Set([
    sdk.areas.FrigidHighlands,
    sdk.areas.ArreatPlateau,
    sdk.areas.FrozenTundra
  ]);

  /**
   * Helper function to create a POI from a preset unit
   * @description This function takes a preset unit (like a monster or object), a name, and an optional action,
   * and returns a POI object with the unit's coordinates and the provided name and action. If the unit is not found, it returns false.
   * @param {PresetUnit} unit 
   * @param {string} name 
   * @param {*} action 
   * @returns {{ name: string, x: number, y: number, action?: * }}
   */
  function createPOIFromPresetUnit(unit, name, action = null) {
    const coords = unit.realCoords();
    const poi = {
      name: name,
      x: coords.x,
      y: coords.y
    };

    if (action) {
      poi.action = action;
    }

    return poi;
  }

  /**
   * Helper function to create a POI from a preset object
   * @param {number} objectId - The ID of the preset object to find
   * @param {string} name - Name to display
   * @param {Object} [action] - Optional action
   * @return {Object|false} POI information or false if not found
   */
  function createPOIFromPreset(objectId, name, action = null) {
    const unit = Game.getPresetObject(me.area, objectId);
    if (!unit) return false;
    
    return createPOIFromPresetUnit(unit, name, action);
  }
  
  /**
   * Helper to create POI from preset monster
   * @param {number} monsterId - The ID of the preset monster to find
   * @param {string} name - Name to display
   * @param {Object} [action] - Optional action
   * @return {Object|false} POI information or false if not found
   */
  function createPOIFromMonster(monsterId, name, action = null) {
    const unit = Game.getPresetMonster(me.area, monsterId);
    if (!unit) return false;
    
    return createPOIFromPresetUnit(unit, name, action);
  }
  
  /**
   * Helper to create POI from preset stairs
   * @param {number} stairId - The ID of the preset stair to find
   * @param {string} name - Name to display
   * @param {Object} [action] - Optional action
   * @return {Object|false} POI information or false if not found
   */
  function createPOIFromStair(stairId, name, action = null) {
    const unit = Game.getPresetStair(me.area, stairId);
    if (!unit) return false;
    
    return createPOIFromPresetUnit(unit, name, action);
  }
  
  /**
   * Helper to create a POI from fixed coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} name - Name to display
   * @param {Object} [action] - Optional action
   * @return {Object} POI information
   */
  function createFixedPOI(x, y, name, action = null) {
    const poi = {
      name: name,
      x: x,
      y: y
    };
    
    if (action) {
      poi.action = action;
    }
    
    return poi;
  }
  
  /**
   * Helper to create a POI from a live monster
   * @param {number} monsterId - Monster ID to look for
   * @param {number} x - Default X coordinate if monster not found
   * @param {number} y - Default Y coordinate if monster not found
   * @param {string} name - Name to display
   * @param {Object} [action] - Optional action
   * @return {Object} POI information
   */
  function createMonsterPOI(monsterId, x, y, name, action = null) {
    const monster = Game.getMonster(monsterId);
    const poi = {
      name: name,
      x: monster ? monster.x : x,
      y: monster ? monster.y : y
    };
    
    if (action) {
      poi.action = action;
    }
    
    return poi;
  }

  /**
   * Handlers for specific locations
   */
  const poiHandlers = {
    superChest: function() {
      return createPOIFromPreset(
        sdk.objects.SmallSparklyChest,
        "SuperChest",
        { do: "openChest", id: sdk.objects.SmallSparklyChest }
      );
    },
    
    largeSparklyChest: function() {
      return createPOIFromPreset(
        sdk.objects.LargeSparklyChest,
        "SuperChest",
        { do: "openChest", id: sdk.objects.LargeSparklyChest }
      );
    },
    
    talRashaTomb: function() {
      let poi = createPOIFromPreset(sdk.quest.chest.HoradricStaffHolder, "Orifice");
      if (poi) return poi;
      
      return createPOIFromPreset(sdk.objects.SmallSparklyChest, "SuperChest");
    },

    getHellEntrance: function () {
      return createPOIFromPreset(
        sdk.objects.RedPortal,
        "Hell Entrance",
        { do: "usePortal" }
      );
    },
  };
  
  poiHandlers[sdk.areas.ColdPlains] = function() {
    return createPOIFromStair(sdk.exits.preset.AreaEntrance, "Cave Level 1");
  };
  
  poiHandlers[sdk.areas.StonyField] = function() {
    return createPOIFromMonster(
      sdk.monsters.preset.Rakanishu,
      "Cairn Stones",
      { do: "usePortal", id: sdk.areas.Tristram }
    );
  };
  
  poiHandlers[sdk.areas.DarkWood] = function() {
    return createPOIFromPreset(sdk.quest.chest.InifussTree, "Tree");
  };
  
  poiHandlers[sdk.areas.BlackMarsh] = function() {
    return createPOIFromStair(sdk.exits.preset.AreaEntrance, "Hole Level 1");
  };
  
  poiHandlers[sdk.areas.DenofEvil] = function() {
    return createPOIFromMonster(sdk.monsters.preset.Corpsefire, "Corpsefire");
  };
  
  poiHandlers[sdk.areas.BurialGrounds] = function() {
    return createPOIFromMonster(sdk.monsters.preset.BloodRaven, "Bloodraven");
  };
  
  poiHandlers[sdk.areas.TowerCellarLvl5] = function() {
    return createPOIFromPreset(sdk.objects.SuperChest, "Countess");
  };
  
  poiHandlers[sdk.areas.Barracks] = function() {
    return createPOIFromPreset(sdk.quest.chest.MalusHolder, "Smith");
  };
  
  poiHandlers[sdk.areas.Cathedral] = function() {
    return createFixedPOI(20047, 4898, "BoneAsh");
  };
  
  poiHandlers[sdk.areas.CatacombsLvl4] = function() {
    return createFixedPOI(22549, 9520, "Andariel");
  };
  
  poiHandlers[sdk.areas.Tristram] = function() {
    return createMonsterPOI(sdk.monsters.Griswold, 25163, 5170, "Griswold");
  };
  
  poiHandlers[sdk.areas.MooMooFarm] = function() {
    const monster = Game.getMonster(sdk.monsters.TheCowKing);
    if (monster) {
      return createFixedPOI(monster.x, monster.y, "Cow King");
    }
    const preset = Game.getPresetMonster(me.area, sdk.monsters.preset.TheCowKing);
    if (preset) {
      return createFixedPOI(preset.x, preset.y, "Cow King");
    }
    return false;
  };
  
  poiHandlers[sdk.areas.LutGholein] = function() {
    return createPOIFromStair(sdk.exits.preset.A2EnterSewersDoor, "Sewer's Level 1");
  };
  
  poiHandlers[sdk.areas.A2SewersLvl3] = function() {
    return createPOIFromPreset(sdk.quest.chest.HoradricScrollChest, "Radament");
  };
  
  poiHandlers[sdk.areas.HallsoftheDeadLvl3] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.HoradricCubeChest,
      "Cube",
      { do: "openChest", id: sdk.quest.chest.HoradricCubeChest }
    );
  };
  
  poiHandlers[sdk.areas.ClawViperTempleLvl2] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.ViperAmuletChest,
      "Amulet",
      { do: "openChest", id: sdk.quest.chest.ViperAmuletChest }
    );
  };
  
  poiHandlers[sdk.areas.MaggotLairLvl3] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.ShaftoftheHoradricStaffChest,
      "Staff",
      { do: "openChest", id: sdk.quest.chest.ShaftoftheHoradricStaffChest }
    );
  };
  
  poiHandlers[sdk.areas.ArcaneSanctuary] = function() {
    return createPOIFromPreset(sdk.quest.chest.Journal, "Summoner");
  };
  
  poiHandlers[sdk.areas.DurielsLair] = function() {
    return createFixedPOI(22577, 15609, "Tyrael");
  };
  
  poiHandlers[sdk.areas.FlayerJungle] = function() {
    return createPOIFromPreset(sdk.quest.chest.GidbinnAltar, "Gidbinn");
  };
  
  poiHandlers[sdk.areas.KurastBazaar] = function() {
    return createPOIFromStair(sdk.exits.preset.A3EnterSewers, "Sewer's Level 1");
  };

  poiHandlers[sdk.areas.SpiderCavern] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.KhalimsEyeChest,
      "Eye",
      { do: "openChest", id: sdk.quest.chest.KhalimsEyeChest }
    );
  };
  
  poiHandlers[sdk.areas.FlayerDungeonLvl3] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.KhalimsBrainChest,
      "Brain",
      { do: "openChest", id: sdk.quest.chest.KhalimsBrainChest }
    );
  };
  
  poiHandlers[sdk.areas.A3SewersLvl2] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.KhalimsHeartChest,
      "Heart",
      { do: "openChest", id: sdk.quest.chest.KhalimsHeartChest }
    );
  };
  
  poiHandlers[sdk.areas.RuinedTemple] = function() {
    return createPOIFromPreset(
      sdk.quest.chest.LamEsensTomeHolder,
      "Lam Esen",
      { do: "openChest", id: sdk.quest.chest.LamEsensTomeHolder }
    );
  };
  
  poiHandlers[sdk.areas.Travincal] = function() {
    return createPOIFromPreset(sdk.objects.CompellingOrb, "Orb");
  };
  
  poiHandlers[sdk.areas.DuranceofHateLvl3] = function() {
    return createFixedPOI(17588, 8069, "Mephisto");
  };
  
  poiHandlers[sdk.areas.PlainsofDespair] = function() {
    return createPOIFromMonster(sdk.monsters.Izual, "Izual");
  };
  
  poiHandlers[sdk.areas.RiverofFlame] = function() {
    return createPOIFromPreset(sdk.quest.chest.HellForge, "Hephasto");
  };
  
  poiHandlers[sdk.areas.ChaosSanctuary] = function() {
    return createPOIFromPreset(sdk.objects.DiabloStar, "Star");
  };
  
  poiHandlers[sdk.areas.Harrogath] = function() {
    return createFixedPOI(
      5112, 5120,
      "Anya Portal",
      { do: "usePortal", id: sdk.areas.NihlathaksTemple }
    );
  };
  
  poiHandlers[sdk.areas.BloodyFoothills] = function() {
    return createFixedPOI(3899, 5113, "Shenk");
  };

  poiHandlers[sdk.areas.FrozenRiver] = function() {
    return createPOIFromPreset(sdk.objects.FrozenAnyasPlatform, "Frozen Anya");
  };
  
  poiHandlers[sdk.areas.NihlathaksTemple] = function() {
    return createFixedPOI(10058, 13234, "Pindle");
  };
  
  poiHandlers[sdk.areas.HallsofVaught] = function() {
    return createPOIFromPreset(sdk.objects.NihlathaksPlatform, "Nihlathak");
  };
  
  poiHandlers[sdk.areas.ThroneofDestruction] = function() {
    return createFixedPOI(15118, 5002, "Throne Room");
  };
  
  poiHandlers[sdk.areas.WorldstoneChamber] = function() {
    const baal = Game.getMonster(sdk.monsters.Baal);
    return createFixedPOI(
      baal ? baal.x : 15134,
      baal ? baal.y : 5923,
      "Baal"
    );
  };
  
  poiHandlers[sdk.areas.MatronsDen] = function() {
    return createPOIFromPreset(sdk.objects.SmallSparklyChest, "Lilith");
  };
  
  poiHandlers[sdk.areas.ForgottenSands] = function() {
    const duriel = Game.getMonster(sdk.monsters.UberDuriel);
    if (!duriel) return false;
    return createFixedPOI(duriel.x, duriel.y, "Duriel");
  };
  
  poiHandlers[sdk.areas.FurnaceofPain] = function() {
    return createPOIFromPreset(sdk.objects.SmallSparklyChest, "Izual");
  };

  /**
   * Add a vector line from player to the specified coordinates
   * @param {number} x - destination x coordinate
   * @param {number} y - destination y coordinate
   * @param {number} color - line color
   */
  function addVector(x, y, color) {
    VectorHooks.hooks.push(new Line(me.x, me.y, x, y, color, true));
  }

  /**
   * Add area name text at specified coordinates
   * @param {Object} area - area information
   */
  function addAreaName(area) {
    VectorHooks.names.push(new Text(getAreaName(area.target), area.x, area.y, 0, 6, 2, true));
  }
  
  return {
    enabled: true,
    currArea: 0,
    lastLoc: { x: 0, y: 0 },
    /** @type {Text[]} */
    names: [],
    /** @type {Line[]} */
    hooks: [],

    check: function () {
      if (!this.enabled) {
        this.flush();

        return;
      }

      if (me.area !== this.currArea) {
        this.flush();

        if (!me.area || !me.gameReady) return;

        try {
          /** @type {Area["exits"]} */
          const exits = getArea().exits;
          VectorHooks.currArea = me.area;

          if (exits) {
            for (let exit of exits) {
              if (me.inArea(sdk.areas.CanyonofMagic)) {
                addVector(exit.x, exit.y, exit.target === getRoom().correcttomb ? 0x69 : 0x99);
              } else if (nextAreas.has(me.area) && exit.target === nextAreas.get(me.area)) {
                addVector(exit.x, exit.y, 0x1F);
              } else if (exit.target === ActionHooks.prevAreas.indexOf(me.area) && nextAreas.get(me.area)) {
                addVector(exit.x, exit.y, 0x99);
              } else if (exit.target === ActionHooks.prevAreas.indexOf(me.area)) {
                addVector(exit.x, exit.y, 0x1F);
              } else if (exit.target === ActionHooks.prevAreas[me.area]) {
                addVector(exit.x, exit.y, 0x0A);
              } else {
                addVector(exit.x, exit.y, 0x99);
              }

              addAreaName(exit);
            }
          }

          let wp = this.getWP();
          wp && addVector(wp.x, wp.y, 0xA8);
          let poi = this.getPOI();
          poi && addVector(poi.x, poi.y, 0x7D);
        } catch (e) {
          console.error(e);
        }
      } else if (me.x !== this.lastLoc.x || me.y !== this.lastLoc.y) {
        VectorHooks.update();
      }
    },

    update: function () {
      VectorHooks.lastLoc = { x: me.x, y: me.y };

      for (let i = 0; i < this.hooks.length; i++) {
        this.hooks[i].x = me.x;
        this.hooks[i].y = me.y;
      }
    },

    flush: function () {
      while (this.hooks.length) {
        this.hooks.pop().remove();
      }

      while (this.names.length) {
        this.names.pop().remove();
      }

      VectorHooks.currArea = 0;
    },

    getWP: function () {
      if (Pather.wpAreas.indexOf(me.area) === -1) return false;

      for (let i = 0; i < sdk.waypoints.Ids.length; i++) {
        let preset = Game.getPresetObject(me.area, sdk.waypoints.Ids[i]);

        if (preset) {
          return preset.realCoords();
        }
      }

      return false;
    },

    getPOI: function () {
      if (superChestAreas.has(me.area)) {
        let result = poiHandlers.superChest();
        if (result) return result;
      }
    
      if (largeSparklyChestAreas.has(me.area)) {
        let result = poiHandlers.largeSparklyChest();
        if (result) return result;
      }

      if (hellEntranceAreas.has(me.area)) {
        let result = poiHandlers.getHellEntrance();
        if (result) return result;
      }
    
      if (me.area >= sdk.areas.TalRashasTomb1 && me.area <= sdk.areas.TalRashasTomb7) {
        return poiHandlers.talRashaTomb();
      }
    
      if (poiHandlers[me.area]) {
        try {
          return poiHandlers[me.area]();
        } catch (e) {
          console.error("Error in POI handler for area " + me.area + ": " + e);
        }
      }

      return false;
    }
  };
})();
