/**
*  @filename    VectorHooks.js
*  @author      theBGuy
*  @desc        Vector hooks for MapThread
*
*/

const VectorHooks = {
  enabled: true,
  currArea: 0,
  lastLoc: { x: 0, y: 0 },
  names: [],
  hooks: [],
  nextAreas: (function () {
    let nextAreas = [];

    // Specific area override
    nextAreas[sdk.areas.TamoeHighland] = sdk.areas.MonasteryGate;
    nextAreas[sdk.areas.SpiderForest] = sdk.areas.FlayerJungle;
    nextAreas[sdk.areas.GreatMarsh] = sdk.areas.FlayerJungle;
    nextAreas[sdk.areas.CrystalizedPassage] = sdk.areas.GlacialTrail;
    nextAreas[sdk.areas.GlacialTrail] = sdk.areas.FrozenTundra;
    nextAreas[sdk.areas.AncientsWay] = sdk.areas.ArreatSummit;
    nextAreas[sdk.areas.ThroneofDestruction] = sdk.areas.WorldstoneChamber;

    return nextAreas;
  })(),

  check: function () {
    if (!this.enabled) {
      this.flush();

      return;
    }

    if (me.area !== this.currArea) {
      this.flush();

      if (!me.area || !me.gameReady) return;

      try {
        let exits = getArea().exits;
        VectorHooks.currArea = me.area;

        if (exits) {
          for (let i = 0; i < exits.length; i++) {
            if (me.inArea(sdk.areas.CanyonofMagic)) {
              this.add(exits[i].x, exits[i].y, exits[i].target === getRoom().correcttomb ? 0x69 : 0x99);
            } else if (exits[i].target === this.nextAreas[me.area] && this.nextAreas[me.area]) {
              this.add(exits[i].x, exits[i].y, 0x1F);
            } else if (exits[i].target === ActionHooks.prevAreas.indexOf(me.area) && this.nextAreas[me.area]) {
              this.add(exits[i].x, exits[i].y, 0x99);
            } else if (exits[i].target === ActionHooks.prevAreas.indexOf(me.area)) {
              this.add(exits[i].x, exits[i].y, 0x1F);
            } else if (exits[i].target === ActionHooks.prevAreas[me.area]) {
              this.add(exits[i].x, exits[i].y, 0x0A);
            } else {
              this.add(exits[i].x, exits[i].y, 0x99);
            }

            this.addNames(exits[i]);
          }
        }

        let wp = this.getWP();
        wp && this.add(wp.x, wp.y, 0xA8);
        let poi = this.getPOI();
        poi && this.add(poi.x, poi.y, 0x7D);
      } catch (e) {
        console.error(e);
      }
    } else if (me.x !== this.lastLoc.x || me.y !== this.lastLoc.y) {
      this.update();
    }
  },

  add: function (x, y, color) {
    this.hooks.push(new Line(me.x, me.y, x, y, color, true));
  },

  addNames: function (area) {
    this.names.push(new Text(getAreaName(area.target), area.x, area.y, 0, 6, 2, true));
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
      this.hooks.shift().remove();
    }

    while (this.names.length) {
      this.names.shift().remove();
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
    let unit, name;
    let poi = {};

    switch (me.area) {
    case sdk.areas.CaveLvl2:
    case sdk.areas.HoleLvl2:
    case sdk.areas.PitLvl2:
    case sdk.areas.Crypt:
    case sdk.areas.Mausoleum:
    case sdk.areas.StonyTombLvl2:
    case sdk.areas.AncientTunnels:
    case sdk.areas.GreatMarsh:
    case sdk.areas.SpiderCave:
    case sdk.areas.SwampyPitLvl3:
    case sdk.areas.DisusedFane:
    case sdk.areas.ForgottenReliquary:
    case sdk.areas.ForgottenTemple:
    case sdk.areas.DisusedReliquary:
    case sdk.areas.DrifterCavern:
    case sdk.areas.IcyCellar:
    case sdk.areas.Abaddon:
    case sdk.areas.PitofAcheron:
    case sdk.areas.InfernalPit:
      unit = Game.getPresetObject(me.area, sdk.objects.SmallSparklyChest);
      poi = { name: "SuperChest", action: { do: "openChest", id: sdk.objects.SmallSparklyChest } };

      break;
    case sdk.areas.GlacialTrail:
    case sdk.areas.HallsofAnguish:
    case sdk.areas.HallsofPain:
      unit = Game.getPresetObject(me.area, sdk.objects.LargeSparklyChest);
      poi = { name: "SuperChest", action: { do: "openChest", id: sdk.objects.LargeSparklyChest } };

      break;
    case sdk.areas.ColdPlains:
      unit = Game.getPresetStair(me.area, sdk.exits.preset.AreaEntrance);
      name = "Cave Level 1";

      break;
    case sdk.areas.StonyField:
      unit = Game.getPresetMonster(me.area, sdk.monsters.preset.Rakanishu);
      poi = { name: "Cairn Stones", action: { do: "usePortal", id: sdk.areas.Tristram } };

      break;
    case sdk.areas.DarkWood:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.InifussTree);
      name = "Tree";

      break;
    case sdk.areas.BlackMarsh:
      unit = Game.getPresetStair(me.area, sdk.exits.preset.AreaEntrance);
      name = "Hole Level 1";

      break;
    case sdk.areas.DenofEvil:
      unit = Game.getPresetMonster(me.area, sdk.monsters.preset.Corpsefire);
      name = "Corpsefire";

      break;
    case sdk.areas.BurialGrounds:
      unit = Game.getPresetMonster(me.area, sdk.monsters.preset.BloodRaven);
      name = "Bloodraven";

      break;
    case sdk.areas.TowerCellarLvl5:
      unit = Game.getPresetObject(me.area, sdk.objects.SuperChest);
      name = "Countess";

      break;
    case sdk.areas.Barracks:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.MalusHolder);
      name = "Smith";

      break;
    case sdk.areas.Cathedral:
      unit = { x: 20047, y: 4898 };
      name = "BoneAsh";

      break;
    case sdk.areas.CatacombsLvl4:
      unit = { x: 22549, y: 9520 };
      name = "Andariel";

      break;
    case sdk.areas.Tristram:
      unit = Game.getMonster(sdk.monsters.Griswold) ? Game.getMonster(sdk.monsters.Griswold) : { x: 25163, y: 5170 };
      name = "Griswold";

      break;
    case sdk.areas.MooMooFarm:
      unit = Game.getMonster(sdk.monsters.TheCowKing)
        ? Game.getMonster(sdk.monsters.TheCowKing)
        : Game.getPresetMonster(me.area, sdk.monsters.preset.TheCowKing);
      name = "Cow King";

      break;
    case sdk.areas.LutGholein:
      unit = Game.getPresetStair(me.area, sdk.exits.preset.A2EnterSewersDoor);
      name = "Sewer's Level 1";

      break;
    case sdk.areas.A2SewersLvl3:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.HoradricScrollChest);
      name = "Radament";

      break;
    case sdk.areas.PalaceCellarLvl3:
      unit = { x: 10073, y: 8670 };
      poi = { name: "Arcane Sanctuary", action: { do: "usePortal" } };

      break;
    case sdk.areas.HallsoftheDeadLvl3:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.HoradricCubeChest);
      poi = { name: "Cube", action: { do: "openChest", id: sdk.quest.chest.HoradricCubeChest } };

      break;
    case sdk.areas.ClawViperTempleLvl2:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.ViperAmuletChest);
      poi = { name: "Amulet", action: { do: "openChest", id: sdk.quest.chest.ViperAmuletChest } };

      break;
    case sdk.areas.MaggotLairLvl3:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.ShaftoftheHoradricStaffChest);
      poi = { name: "Staff", action: { do: "openChest", id: sdk.quest.chest.ShaftoftheHoradricStaffChest } };

      break;
    case sdk.areas.ArcaneSanctuary:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.Journal);
      name = "Summoner";

      break;
    case sdk.areas.TalRashasTomb1:
    case sdk.areas.TalRashasTomb2:
    case sdk.areas.TalRashasTomb3:
    case sdk.areas.TalRashasTomb4:
    case sdk.areas.TalRashasTomb5:
    case sdk.areas.TalRashasTomb6:
    case sdk.areas.TalRashasTomb7:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.HoradricStaffHolder);
      name = "Orifice";

      if (!unit) {
        unit = Game.getPresetObject(me.area, sdk.objects.SmallSparklyChest);
        name = "SuperChest";
      }

      break;
    case sdk.areas.DurielsLair:
      unit = { x: 22577, y: 15609 };
      name = "Tyrael";

      break;
    case sdk.areas.FlayerJungle:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.GidbinnAltar);
      name = "Gidbinn";

      break;
    case sdk.areas.KurastBazaar:
      unit = Game.getPresetStair(me.area, sdk.exits.preset.A3EnterSewers);
      name = "Sewer's Level 1";

      break;
    case sdk.areas.SpiderCavern:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.KhalimsEyeChest);
      poi = { name: "Eye", action: { do: "openChest", id: sdk.quest.chest.KhalimsEyeChest } };

      break;
    case sdk.areas.FlayerDungeonLvl3:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.KhalimsBrainChest);
      poi = { name: "Brain", action: { do: "openChest", id: sdk.quest.chest.KhalimsBrainChest } };

      break;
    case sdk.areas.A3SewersLvl2:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.KhalimsHeartChest);
      poi = { name: "Heart", action: { do: "openChest", id: sdk.quest.chest.KhalimsHeartChest } };

      break;
    case sdk.areas.RuinedTemple:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.LamEsensTomeHolder);
      poi = { name: "Lam Esen", action: { do: "openChest", id: sdk.quest.chest.LamEsensTomeHolder } };

      break;
    case sdk.areas.Travincal:
      unit = Game.getPresetObject(me.area, sdk.objects.CompellingOrb);
      name = "Orb";

      break;
    case sdk.areas.DuranceofHateLvl3:
      unit = { x: 17588, y: 8069 };
      name = "Mephisto";

      break;
    case sdk.areas.PlainsofDespair:
      unit = Game.getPresetMonster(me.area, sdk.monsters.Izual);
      name = "Izual";

      break;
    case sdk.areas.RiverofFlame:
      unit = Game.getPresetObject(me.area, sdk.quest.chest.HellForge);
      name = "Hephasto";

      break;
    case sdk.areas.ChaosSanctuary:
      unit = Game.getPresetObject(me.area, sdk.objects.DiabloStar);
      name = "Star";

      break;
    case sdk.areas.Harrogath:
      unit = { x: 5112, y: 5120 };
      poi = { name: "Anya Portal", action: { do: "usePortal", id: sdk.areas.NihlathaksTemple } };

      break;
    case sdk.areas.BloodyFoothills:
      unit = { x: 3899, y: 5113 };
      name = "Shenk";

      break;
    case sdk.areas.FrigidHighlands:
    case sdk.areas.ArreatPlateau:
    case sdk.areas.FrozenTundra:
      unit = Game.getPresetObject(me.area, sdk.objects.RedPortal);
      poi = { name: "Hell Entrance", action: { do: "usePortal" } };

      break;
    case sdk.areas.FrozenRiver:
      unit = Game.getPresetObject(me.area, sdk.objects.FrozenAnyasPlatform);
      name = "Frozen Anya";

      break;
    case sdk.areas.NihlathaksTemple:
      unit = { x: 10058, y: 13234 };
      name = "Pindle";

      break;
    case sdk.areas.HallsofVaught:
      unit = Game.getPresetObject(me.area, sdk.objects.NihlathaksPlatform);
      name = "Nihlathak";

      break;
    case sdk.areas.ThroneofDestruction:
      unit = { x: 15118, y: 5002 };
      name = "Throne Room";

      break;
    case sdk.areas.WorldstoneChamber:
      unit = Game.getMonster(sdk.monsters.Baal) ? Game.getMonster(sdk.monsters.Baal) : { x: 15134, y: 5923 };
      name = "Baal";

      break;
    case sdk.areas.MatronsDen:
      unit = Game.getPresetObject(me.area, sdk.objects.SmallSparklyChest);
      name = "Lilith";

      break;
    case sdk.areas.ForgottenSands:
      unit = Game.getMonster(sdk.monsters.UberDuriel);
      name = "Duriel";

      break;
    case sdk.areas.FurnaceofPain:
      unit = Game.getPresetObject(me.area, sdk.objects.SmallSparklyChest);
      name = "Izual";

      break;
    }

    if (unit) {
      name && !poi.name && (poi.name = name);
      (unit instanceof PresetUnit) && (unit = unit.realCoords());
      [poi.x, poi.y] = [unit.x, unit.y];

      return poi;
    }

    return false;
  }
};
