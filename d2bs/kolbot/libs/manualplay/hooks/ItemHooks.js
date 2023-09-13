/* eslint-disable max-len */
/**
*  @filename    ItemHooks.js
*  @author      theBGuy
*  @desc        Item hooks for MapThread
*
*/

// todo - clean up all the map stuff
const ItemHooks = (function () {
  const modifier = (
    16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename))
  );
  const ignoreItemTypes = [
    sdk.items.type.Gold, sdk.items.type.BowQuiver,
    sdk.items.type.CrossbowQuiver, sdk.items.type.Book,
    sdk.items.type.Gem, sdk.items.type.Scroll,
    sdk.items.type.MissilePotion, sdk.items.type.Key,
    sdk.items.type.Boots, sdk.items.type.Gloves,
    sdk.items.type.ThrowingKnife, sdk.items.type.ThrowingAxe,
    sdk.items.type.HealingPotion, sdk.items.type.ManaPotion,
    sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion,
    sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion,
    sdk.items.type.ChippedGem, sdk.items.type.FlawedGem,
    sdk.items.type.StandardGem, sdk.items.type.FlawlessGem,
    sdk.items.type.PerfectgGem, sdk.items.type.Amethyst,
    sdk.items.type.Diamond, sdk.items.type.Emerald,
    sdk.items.type.Ruby, sdk.items.type.Sapphire,
    sdk.items.type.Topaz, sdk.items.type.Skull
  ];
  /**
   * Unique Items
   */
  const codeById = new Map([
    [sdk.items.BattleAxe, "The Chieftain"],
    [sdk.items.Falchion, "Gleamscythe"],
    [sdk.items.BurntWand, "Suicide Branch"],
    [sdk.items.PetrifiedWand, "Carin Shard"],
    [sdk.items.TombWand, "King Leoric's Arm"],
    [sdk.items.Quarterstaff, "Ribcracker"],
    [sdk.items.EdgeBow, "Skystrike"],
    [sdk.items.GreaterTalons, "Bartuc's"],
    [sdk.items.WristSword, "Jade Talon"],
    [sdk.items.BattleCestus, "Shadow Killer"],
    [sdk.items.FeralClaws, "Firelizard's"],
    [sdk.items.EttinAxe, "Rune Master"],
    [sdk.items.LichWand, "Boneshade"],
    [sdk.items.UnearthedWand, "Death's Web"],
    [sdk.items.FlyingAxe, "Gimmershred"],
    [sdk.items.WingedKnife, "Warshrike"],
    [sdk.items.WingedAxe, "Lacerator"],
    [sdk.items.Thresher, "Reaper's Toll"],
    [sdk.items.CrypticAxe, "Tomb Reaver"],
    [sdk.items.GiantThresher, "Stormspire"],
    [sdk.items.ArchonStaff, "Mang Song's"],
    [sdk.items.CrusaderBow, "Eaglehorn"],
    [sdk.items.WardBow, "Ward Bow"],
    [sdk.items.HydraBow, "Windforce"],
    [sdk.items.CeremonialBow, "Lycander's Aim"],
    [sdk.items.CeremonialPike, "Lycander's Pike"],
    [sdk.items.CeremonialJavelin, "Titan's Revenge"],
    [sdk.items.EldritchOrb, "Eschuta's"],
    [sdk.items.DimensionalShard, "Death's Fathom"],
    [sdk.items.MatriarchalBow, "Bloodraven's"],
    [sdk.items.MatriarchalSpear, "Stoneraven"],
    [sdk.items.MatriarchalJavelin, "Thunder Stroke"],
    [sdk.items.LightPlatedBoots, "Goblin Toe"],
    [sdk.items.Sallet, "Rockstopper"],
    [sdk.items.GhostArmor, "Spirit Shroud"],
    [sdk.items.SerpentskinArmor, "Vipermagi's"],
    [sdk.items.MeshArmor, "Shaftstop"],
    [sdk.items.RussetArmor, "Skullder's"],
    [sdk.items.MagePlate, "Que-Hegan's"],
    [sdk.items.SharkskinBoots, "Waterwalk"],
    [sdk.items.DemonHead, "Andariel's Vis"],
    [sdk.items.Tiara, "Kira's"],
    [sdk.items.Shako, "Harlequin Crest"],
    [sdk.items.WireFleece, "Gladiator's Bane"],
    [sdk.items.ScarabshellBoots, "Sandstorm Trek's"],
    [sdk.items.BoneweaveBoots, "Marrowwalk"],
    [sdk.items.MyrmidonGreaves, "Shadow Dancer"],
    [sdk.items.TotemicMask, "Jalal's"],
    [sdk.items.SlayerGuard, "Arreat's Face"],
    [sdk.items.GildedShield, "HoZ"],
    [sdk.items.HierophantTrophy, "Homunculus"],
    [sdk.items.BloodSpirit, "Cerebus"],
    [sdk.items.EarthSpirit, "Spirit Keeper"],
    [sdk.items.FuryVisor, "Wolfhowl"],
    [sdk.items.DestroyerHelm, "Demonhorn's"],
    [sdk.items.ConquerorCrown, "Halaberd's"],
    [sdk.items.SacredRondache, "Alma Negra"],
    [sdk.items.ZakarumShield, "Dragonscale"],
    [sdk.items.BloodlordSkull, "Darkforce"],
    [sdk.items.SuccubusSkull, "Boneflame"],
    [sdk.items.SmallCharm, "Annihilus"],
    [sdk.items.LargeCharm, "Hellfire Torch"],
    [sdk.items.GrandCharm, "Gheed's"],
    [sdk.items.Jewel, "Facet"],
    /** Misc Items */
    [sdk.items.quest.TokenofAbsolution, "ÿc8Token"],
    [sdk.items.quest.TwistedEssenceofSuffering, "ÿc3Ess-Of-Suffering"],
    [sdk.items.quest.ChargedEssenceofHatred, "ÿc7Ess-Of-Hatred"],
    [sdk.items.quest.BurningEssenceofTerror, "ÿc1Ess-Of-Terror"],
    [sdk.items.quest.FesteringEssenceofDestruction, "ÿc3Ess-Of-Destruction"],
  ]);
  /**
  * @param {string} setName 
  * @param {string} uniqueName 
  * @returns {Map<number, string>}
  */
  const buildClassIdAndQuality = function (id, setName = "", uniqueName = "") {
    let temp = new Map();
    setName && temp.set(sdk.items.quality.Set, setName);
    uniqueName && temp.set(sdk.items.quality.Unique, uniqueName);
    return temp;
  };
  /**
   * Set/Unique Items
   */
  const codeByIdAndQuality = new Map([
    [sdk.items.JaggedStar, buildClassIdAndQuality("Aldur's Wep", "Moonfall")],
    [sdk.items.HuntersGuise, buildClassIdAndQuality("Aldur's Helm")],
    [sdk.items.ShadowPlate, buildClassIdAndQuality("Aldur's Armor", "Steel Carapace")],
    [sdk.items.BattleBoots, buildClassIdAndQuality("Aldur's Boots", "War Trav's")],
    [sdk.items.Caduceus, buildClassIdAndQuality("Griswold's Wep", "Astreon's")],
    [sdk.items.Crown, buildClassIdAndQuality("Griswold's Helm", "Crown of Ages")],
    [sdk.items.OrnatePlate, buildClassIdAndQuality("Griswold's Armor", "Corpsemourn")],
    [sdk.items.VortexShield, buildClassIdAndQuality("Griswold's Shield")],
    [sdk.items.OgreMaul, buildClassIdAndQuality("IK Maul", "Windhammer")],
    [sdk.items.AvengerGuard, buildClassIdAndQuality("IK Helm")],
    [sdk.items.SacredArmor, buildClassIdAndQuality("IK Armor")],
    [sdk.items.WarGauntlets, buildClassIdAndQuality("IK Gloves", "HellMouth")],
    [sdk.items.WarBoots, buildClassIdAndQuality("IK Boots", "Gore Rider")],
    [sdk.items.GrandMatronBow, buildClassIdAndQuality("Mavina's Bow")],
    [sdk.items.KrakenShell, buildClassIdAndQuality("Mavina's Armor", "Leviathan")],
    [sdk.items.Diadem, buildClassIdAndQuality("Mavina's Helm", "Griffon's Eye")],
    [sdk.items.SharkskinBelt, buildClassIdAndQuality("Mavina's Belt", "Razortail")],
    [sdk.items.BattleGauntlets, buildClassIdAndQuality("Mavina's Gloves", "Lava Gout")],
    [sdk.items.ScissorsKatar, buildClassIdAndQuality("Natalya's Wep")],
    [sdk.items.LoricatedMail, buildClassIdAndQuality("Natalya's Armor")],
    [sdk.items.GrimHelm, buildClassIdAndQuality("Natalya's Helm", "Vamp Gaze")],
    [sdk.items.MeshBoots, buildClassIdAndQuality("Natalya's Boots", "Silkweave")],
    [sdk.items.SwirlingCrystal, buildClassIdAndQuality("Tal Orb", "Occulus")],
    [sdk.items.LacqueredPlate, buildClassIdAndQuality("Tal Armor")],
    [sdk.items.DeathMask, buildClassIdAndQuality("Tal Helm", "Blackhorn's")],
    [sdk.items.MeshBelt, buildClassIdAndQuality("Tal Belt", "Gloom's Trap")],
    [sdk.items.BoneVisage, buildClassIdAndQuality("Trang Helm", "Giant Skull")],
    [sdk.items.ChaosArmor, buildClassIdAndQuality("Trang Armor", "Black Hades")],
    [sdk.items.TrollBelt, buildClassIdAndQuality("Trang Belt")],
    [sdk.items.HeavyBracers, buildClassIdAndQuality("Trang Gloves", "Ghoulhide")],
    [sdk.items.CantorTrophy, buildClassIdAndQuality("Trang Shield")],
    [sdk.items.ColossusBlade, buildClassIdAndQuality("Bul-Kathos Blade", "Grandfather")],
    [sdk.items.MythicalSword, buildClassIdAndQuality("Bul-Kathos Sword")],
    [sdk.items.WarHat, buildClassIdAndQuality("Cow King's Helm", "Peasant Crown")],
    [sdk.items.StuddedLeather, buildClassIdAndQuality("Cow King's Armor", "Twitchthroe")],
    [sdk.items.HeavyBoots, buildClassIdAndQuality(null, "Gorefoot")],
    [sdk.items.Mace, buildClassIdAndQuality("Heavens's Wep", "Crushflange")],
    [sdk.items.SpiredHelm, buildClassIdAndQuality("Heavens's Helm", "Nightwing's")],
    [sdk.items.Cuirass, buildClassIdAndQuality("Heavens's Armor", "Duriel's Shell")],
    [sdk.items.Ward, buildClassIdAndQuality("Heavens's Shield")],
    [sdk.items.Bill, buildClassIdAndQuality("Hwanin's Bill", "Blackleach")],
    [sdk.items.TigulatedMail, buildClassIdAndQuality("Hwanin's Armor", "Crow Caw")],
    [sdk.items.GrandCrown, buildClassIdAndQuality("Hwanin's Helm", "Crown of Thieves")],
    [sdk.items.Belt, buildClassIdAndQuality(null, "Nightsmoke")],
    [sdk.items.HellforgePlate, buildClassIdAndQuality("Naj's Armor")],
    [sdk.items.ElderStaff, buildClassIdAndQuality("Naj's Staff", "Ondal's Wisdom")],
    [sdk.items.Circlet, buildClassIdAndQuality("Naj's Helm")],
    [sdk.items.SmallShield, buildClassIdAndQuality(null, "Umbral Disk")],
    [sdk.items.WingedHelm, buildClassIdAndQuality("G-Face", "Valk Wing")],
    [sdk.items.HeavyBelt, buildClassIdAndQuality("Orphan's Belt")],
    [sdk.items.HeavyGloves, buildClassIdAndQuality(null, "Bloodfist")],
    [sdk.items.CrypticSword, buildClassIdAndQuality("Sazabi's Wep", "Frostwind")],
    [sdk.items.BalrogSkin, buildClassIdAndQuality("Sazabi's Armor", "Arkaine's")],
    [sdk.items.BreastPlate, buildClassIdAndQuality(null, "Venom Ward")],
    [sdk.items.GothicShield, buildClassIdAndQuality(null, "The Ward")],
    [sdk.items.DuskShroud, buildClassIdAndQuality("Disciple's Armor", "Ormus Robe's")],
    [sdk.items.MithrilCoil, buildClassIdAndQuality("Disciple's Belt", "Verdungo's")],
    [sdk.items.BrambleMitts, buildClassIdAndQuality("Disciple's Gloves")],
    [sdk.items.DemonhideBoots, buildClassIdAndQuality("Disciple's Boots", "Infernostride")],
    [sdk.items.RingMail, buildClassIdAndQuality("Angelic's Armor", "Darkglow")],
    [sdk.items.Sabre, buildClassIdAndQuality("Angelic's Wep", "Krintiz")],
    [sdk.items.SkullCap, buildClassIdAndQuality("Arcanna's Helm", "Tarnhelm")],
    [sdk.items.LightPlate, buildClassIdAndQuality("Arcanna's Armor", "Heavenly Garb")],
    [sdk.items.WarStaff, buildClassIdAndQuality("Arcanna's Staff", "Iron Jang Bong")],
    [sdk.items.LightGauntlets, buildClassIdAndQuality("Artic's Gloves", "Magefist")],
    [sdk.items.LightBelt, buildClassIdAndQuality("Artic's Belt", "Snakecord")],
    [sdk.items.QuiltedArmor, buildClassIdAndQuality("Artic's Armor", "Greyform")],
    [sdk.items.ShortWarBow, buildClassIdAndQuality("Artic's Bow", "Hellclap")],
    /** Berserker's */
    [sdk.items.DoubleAxe, buildClassIdAndQuality("Beserker's Axe", "Bladebone")],
    [sdk.items.SplintMail, buildClassIdAndQuality("Beserker's Armor", "Iceblink")],
    [sdk.items.Helm, buildClassIdAndQuality("Beserker's Helm", "Coif of Glory")],
    /** Tancred's */
    [sdk.items.BoneHelm, buildClassIdAndQuality("Tancred's Skull", "Wormskull")],
    [sdk.items.FullPlateMail, buildClassIdAndQuality("Tancred's Spine", "Goldskin")],
    [sdk.items.MilitaryPick, buildClassIdAndQuality("Tancred's Crowbill", "Skull Splitter")],
    [sdk.items.Boots, buildClassIdAndQuality("Tancred's Hobnails", "Hotspur")],
  ]);
  const itemColorCode = {};
  itemColorCode[sdk.items.quality.Magic] = { color: 0x97, code: "ÿc3" };
  itemColorCode[sdk.items.quality.Set] = { color: 0x84, code: "ÿc2" };
  itemColorCode[sdk.items.quality.Rare] = { color: 0x6F, code: "ÿc9" };
  itemColorCode[sdk.items.quality.Unique] = { color: 0xA8, code: "ÿc4" };

  
  return {
    enabled: true,
    pickitEnabled: false,
    hooks: [],

    check: function () {
      if (!this.enabled) {
        this.flush();

        return;
      }

      for (let i = 0; i < this.hooks.length; i++) {
        if (!copyUnit(this.hooks[i].item).x) {
          for (let j = 0; j < this.hooks[i].hook.length; j++) {
            this.hooks[i].hook[j].remove();
          }

          this.hooks[i].name[0] && this.hooks[i].name[0].remove();
          this.hooks[i].vector[0] && this.hooks[i].vector[0].remove();
          this.hooks.splice(i, 1);
          i -= 1;
          this.flush();
        }
      }

      let item = Game.getItem();

      if (item) {
        try {
          do {
            if (item.area === ActionHooks.currArea && item.onGroundOrDropping
              && (item.quality >= sdk.items.quality.Magic || ((item.normal || item.superior) && !ignoreItemTypes.includes(item.itemType)))) {
              if (this.pickitEnabled) {
                if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].indexOf(Pickit.checkItem(item).result) === -1) {
                  !this.getHook(item) && this.add(item);
                }
              } else {
                !this.getHook(item) && this.add(item);
              }

              this.getHook(item) && this.update();
            } else {
              this.remove(item);
            }
          } while (item.getNext());
        } catch (e) {
          console.error(e);
          this.flush();
        }
      }
    },

    update: function () {
      for (let i = 0; i < this.hooks.length; i++) {
        this.hooks[i].vector[0].x = me.x;
        this.hooks[i].vector[0].y = me.y;
      }
    },

    /**
    * @param {ItemUnit} item 
    * @returns {string}
    */
    getName: function (item) {
      let abbr = item.name.split(" ");
      let abbrName = "";

      if (abbr[1]) {
        abbrName += abbr[0] + "-";

        for (let i = 1; i < abbr.length; i++) {
          abbrName += abbr[i].substring(0, 1);
        }
      }

      return !!abbrName ? abbrName : item.name;
    },

    /**
    * @description Create a new hook for a item with custom color and code based on type/quality/classid
    * @param {ItemUnit} item 
    * @todo maybe make class wrappers for hooks and turn the hook array into a map?
    */
    newHook: function (item) {
      let color = 0, code = "", arr = [], name = [], vector = [];
      let eth = (item.ethereal ? "Eth: " : "");

      switch (item.quality) {
      case sdk.items.quality.Normal:
      case sdk.items.quality.Superior:
        switch (item.itemType) {
        case sdk.items.type.Quest:
          color = 0x9A;
          code += (codeById.get(item.classid) || "ÿc8" + item.fname);

          break;
        case sdk.items.type.Rune:
          if (item.classid >= sdk.items.runes.Vex) {
            [color, code] = [0x9B, "ÿc;" + item.fname];
          } else if (item.classid >= sdk.items.runes.Lum) {
            [color, code] = [0x9A, "ÿc8" + item.fname];
          } else {
            [color, code] = [0xA1, item.fname];
          }

          break;
        default:
          if (item.name && item.sockets !== 1) {
            color = 0x20;

            if (item.runeword) {
              code = item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "");
            } else {
              code = "ÿc0" + (item.sockets > 0 ? "[" + item.sockets + "]" : "");
              code += this.getName(item);
              item.itemType === sdk.items.type.AuricShields && (code += "[R: " + item.getStat(sdk.stats.FireResist) + "]");
              code += "(" + item.ilvl + ")";
            }
          }

          break;
        }

        break;
      case sdk.items.quality.Set:
      case sdk.items.quality.Unique:
        ({ color, code } = itemColorCode[item.quality]);

        if (codeById.has(item.classid)) {
          code += codeById.get(item.classid);
        }

        switch (item.classid) {
        case sdk.items.Ring:
        case sdk.items.Amulet:
          code += item.name + "(" + item.ilvl + ")";
          
          break;
        default:
          {
            let check = codeByIdAndQuality.get(item.classid);
            code += ((check && check.get(item.quality)) || item.name);
          }
          
          break;
        }

        break;
      case sdk.items.quality.Magic:
      case sdk.items.quality.Rare:
        if (item.name) {
          ({ color, code } = itemColorCode[item.quality]);

          code += (item.sockets > 0 ? "[" + item.sockets + "]" : "");
          code += this.getName(item);
          code += "(" + item.ilvl + ")";
        }
        
        break;
      }

      !!code && name.push(new Text(eth + code, 665 + Hooks.resfix.x, 104 + modifier + (this.hooks.length * 14), color, 0, 0));
      vector.push(new Line(me.x, me.y, item.x, item.y, color, true));
      arr.push(new Line(item.x - 3, item.y, item.x + 3, item.y, color, true));
      arr.push(new Line(item.x, item.y - 3, item.x, item.y + 3, color, true));

      return {
        itemLoc: arr,
        itemName: name,
        vector: vector,
      };
    },

    /**
    * Add new item hook to our hook array
    * @param {ItemUnit} item 
    */
    add: function (item) {
      if (item === undefined || !item.classid) {
        return;
      }

      let temp = this.newHook(item);

      this.hooks.push({
        item: copyUnit(item),
        area: item.area,
        hook: temp.itemLoc,
        name: temp.itemName,
        vector: temp.vector,
      });
    },

    /**
    * Get item hook if it exists based on item parameters gid
    * @param {ItemUnit} item 
    * @returns {{ item: ItemUnit, area: number, hook: Line, name: Text, vector: Line} | false}
    */
    getHook: function (item) {
      for (let i = 0; i < this.hooks.length; i++) {
        if (this.hooks[i].item.gid === item.gid) {
          return this.hooks[i].hook;
        }
      }

      return false;
    },

    /**
    * @param {ItemUnit} item 
    * @returns {boolean}
    */
    remove: function (item) {
      for (let i = 0; i < this.hooks.length; i++) {
        if (this.hooks[i].item.gid === item.gid) {
          for (let j = 0; j < this.hooks[i].hook.length; j++) {
            this.hooks[i].hook[j].remove();
          }
          
          this.hooks[i].name[0] && this.hooks[i].name[0].remove();
          this.hooks[i].vector[0] && this.hooks[i].vector[0].remove();
          this.hooks.splice(i, 1);

          return true;
        }
      }

      return false;
    },

    flush: function () {
      while (this.hooks.length) {
        for (let j = 0; j < this.hooks[0].hook.length; j++) {
          this.hooks[0].hook[j].remove();
        }

        this.hooks[0].name[0] && this.hooks[0].name[0].remove();
        this.hooks[0].vector[0] && this.hooks[0].vector[0].remove();
        this.hooks.shift();
      }
    }
  };
})();
