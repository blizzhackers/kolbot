(function (module) {
  const RunesData = (function () {
    /** @type {Array<runeword>} runewords - Array of runeword objects. */
    const runewords = [];
    const ladder = me.ladder > 0;
    const RUNES_COUNT = 169;

    const validRunes = Object.values(sdk.items.runes).filter(v => !isNaN(v));
    const validInsertable = (id) => {
      if (validRunes.includes(id)) return true;
      if (id === sdk.items.Jewel) return true;
      return id >= sdk.items.gems.Chipped.Amethyst && id <= sdk.items.gems.Perfect.Skull;
    };
    const anyShield = [sdk.items.type.Shield, sdk.items.type.AuricShields, sdk.items.type.VoodooHeads];
    const missileWeapon = [sdk.items.type.Bow, sdk.items.type.Crossbow, sdk.items.type.AmazonBow];
    const meleeWeapons = [
      sdk.items.type.Scepter, sdk.items.type.Wand, sdk.items.type.AmazonSpear,
      sdk.items.type.Axe, sdk.items.type.Hammer, sdk.items.type.Mace,
      sdk.items.type.Sword, sdk.items.type.Knife, sdk.items.type.AssassinClaw,
      sdk.items.type.Polearm, sdk.items.type.Scepter, sdk.items.type.HandtoHand
    ];
    const ladderRws = [
      "Brand", "Death", "Destruction", "Dragon", "Edge", "Fortitude", "Grief",
      "Ice", "Infinity", "Insight", "LastWish", "Lawbringer", "Oath", "Obedience",
      "Phoenix", "Pride", "Rift", "Spirit", "VoiceofReason", "White",
    ];

    function getItemType (iType) {
      switch (iType) {
      case sdk.items.type.AnyShield:
        return anyShield;
      case sdk.items.type.Weapon:
        return [].concat(missileWeapon, meleeWeapons);
      case sdk.items.type.MissileWeapon:
        return missileWeapon;
      case sdk.items.type.MeleeWeapon:
        return meleeWeapons;
      case sdk.items.type.Helm:
        return [sdk.items.type.Helm, sdk.items.type.Circlet, sdk.items.type.Pelt, sdk.items.type.PrimalHelm];
      default:
        return [iType];
      }
    }
    
    /**
     * @constructor
     * @param {string} name - The name of the recipe.
     * @param {number} sockets - The number of sockets required for the recipe.
     * @param {number[]} runes - Array of insertable IDs required for the recipe.
     * @param {number[]} itemTypes - Array of item type IDs the recipe can be applied to.
     */
    function RunewordObj (name, sockets, runes, itemTypes) {
      this.name = name;
      this.sockets = sockets;
      this.runes = runes;
      this.itemTypes = itemTypes;
      this._ladder = ladderRws.includes(name);
      let highestItem = runes.toSorted((a, b) => b - a).first();
      let reqLvl = getBaseStat("items", highestItem, "levelreq");
      this.reqLvl = reqLvl > 0 ? reqLvl : 1;
    }

    RunewordObj.prototype.ladderRestricted = function () {
      // not ladder restricted or we are on ladder
      if (!this._ladder || ladder) return false;
      // ladder restricted and we have enabled ladder override
      if (Config.LadderOveride) return false;
      // ladder restricted
      return true;
    };

    /**
     * Finds a runeword by name.
     * @param {string} name - The name of the runeword.
     * @returns {Runeword} - The runeword object.
     */
    const findByName = function (name) {
      return runewords.find(r => String.isEqual(r.name, name));
    };

    /**
     * Find all runewords that have the given rune.
     * @param {number} rune - classid of rune
     * @returns {Array<runeword>}
     */
    const findByRune = function (rune) {
      return runewords.filter(r => r.runes.includes(rune));
    };

    /**
     * Find all runewords that can be applied to the given item type.
     * @param {number} type - item type
     * @returns {Array<runeword>}
     */
    const findByType = function (type) {
      return runewords.filter(r => r.itemTypes.includes(type));
    };

    /**
     * Create a new non standard runeword.
     * @param {string} name - The name of the recipe.
     * @param {number} sockets - The number of sockets required for the recipe.
     * @param {number[]} runes - Array of insertable IDs required for the recipe.
     * @param {number[]} itemTypes - Array of item type IDs the recipe can be applied to.
     * @returns {runeword} - The new runeword object.
     */
    const addRuneword = function (name, sockets, runes, itemTypes) {
      if (!name || !sockets || !runes || !itemTypes) return false;
      !Array.isArray(runes) && (runes = [runes]);
      if (!runes.every(validInsertable)) return false;
      !Array.isArray(itemTypes) && (itemTypes = [itemTypes]);

      let rw = new RunewordObj(name, runes.length, runes, itemTypes.map(getItemType).flat());
      runewords.push(rw);

      return rw;
    };

    for (let i = 0; i < RUNES_COUNT; i++) {
      const index = i;
      if (!getBaseStat("runes", index, "complete")) continue;

      const runes = [];

      for (let r = 1; r < 7; r++) {
        const rune = getBaseStat("runes", index, "rune" + r);
        if (rune > -1 && validRunes.includes(rune)) {
          runes.push(rune);
        } else {
          break;
        }
      }

      const itemTypes = [
        getBaseStat("runes", index, "itype1"),
        getBaseStat("runes", index, "itype2"),
        getBaseStat("runes", index, "itype3"),
        getBaseStat("runes", index, "itype4"),
        getBaseStat("runes", index, "itype5"),
        getBaseStat("runes", index, "itype6"),
      ].filter(el => el && el !== 65535).map(getItemType).flat();

      const name = (() => {
        let temp = getBaseStat("runes", index, "rune name");

        switch (temp) {
        case "The Beast":
          return "Beast";
        case "Bound by Duty":
          return "ChainsofHonor";
        case "Doomsayer":
          return "Doom";
        case "Exile's Path":
          return "Exile";
        case "Widowmaker":
          return "Grief";
        case "Winter":
          return "VoiceofReason";
        default:
          return temp.replace(/[^a-zA-Z0-9]/g, "");
        }
      })();

      runewords.push(new RunewordObj(name, runes.length, runes, itemTypes));
    }

    return {
      // runewords: runewords, // other files don't actually need this
      // 1.09
      AncientsPledge: findByName("AncientsPledge"),
      Black: findByName("Black"),
      Fury: findByName("Fury"),
      HolyThunder: findByName("HolyThunder"),
      Honor: findByName("Honor"),
      KingsGrace: findByName("KingsGrace"),
      Leaf: findByName("Leaf"),
      Lionheart: findByName("Lionheart"),
      Lore: findByName("Lore"),
      Malice: findByName("Malice"),
      Melody: findByName("Melody"),
      Memory: findByName("Memory"),
      Nadir: findByName("Nadir"),
      Radiance: findByName("Radiance"),
      Rhyme: findByName("Rhyme"),
      Silence: findByName("Silence"),
      Smoke: findByName("Smoke"),
      Stealth: findByName("Stealth"),
      Steel: findByName("Steel"),
      Strength: findByName("Strength"),
      Venom: findByName("Venom"),
      Wealth: findByName("Wealth"),
      White: findByName("White"),
      Zephyr: findByName("Zephyr"),

      // 1.10
      Beast: findByName("Beast"),
      Bramble: findByName("Bramble"),
      BreathoftheDying: findByName("BreathoftheDying"),
      CallToArms: findByName("CallToArms"),
      ChainsofHonor: findByName("ChainsofHonor"),
      Chaos: findByName("Chaos"),
      CrescentMoon: findByName("CrescentMoon"),
      Delirium: findByName("Delirium"),
      Doom: findByName("Doom"),
      Duress: findByName("Duress"),
      Enigma: findByName("Enigma"),
      Eternity: findByName("Eternity"),
      Exile: findByName("Exile"),
      Famine: findByName("Famine"),
      Gloom: findByName("Gloom"),
      HandofJustice: findByName("HandofJustice"),
      HeartoftheOak: findByName("HeartoftheOak"),
      Kingslayer: findByName("Kingslayer"),
      Passion: findByName("Passion"),
      Prudence: findByName("Prudence"),
      Sanctuary: findByName("Sanctuary"),
      Splendor: findByName("Splendor"),
      Stone: findByName("Stone"),
      Wind: findByName("Wind"),

      // ladder only
      Brand: findByName("Brand"),
      Death: findByName("Death"),
      Destruction: findByName("Destruction"),
      Dragon: findByName("Dragon"),
      Dream: findByName("Dream"),
      Edge: findByName("Edge"),
      Faith: findByName("Faith"),
      Fortitude: findByName("Fortitude"),
      Grief: findByName("Grief"),
      Harmony: findByName("Harmony"),
      Ice: findByName("Ice"),
      Infinity: findByName("Infinity"),
      Insight: findByName("Insight"),
      LastWish: findByName("LastWish"),
      Lawbringer: findByName("Lawbringer"),
      Oath: findByName("Oath"),
      Obedience: findByName("Obedience"),
      Phoenix: findByName("Phoenix"),
      Pride: findByName("Pride"),
      Rift: findByName("Rift"),
      Spirit: findByName("Spirit"),
      VoiceofReason: findByName("VoiceofReason"),
      Wrath: findByName("Wrath"),

      // 1.11
      Bone: findByName("Bone"),
      Enlightenment: findByName("Enlightenment"),
      Myth: findByName("Myth"),
      Peace: findByName("Peace"),
      Principle: findByName("Principle"),
      Rain: findByName("Rain"),
      Treachery: findByName("Treachery"),

      Test: (() => {
        addRuneword("Test", 3,
          [sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.runes.Hel],
          [sdk.items.type.Armor, sdk.items.type.AnyShield, sdk.items.type.Weapon, sdk.items.type.Helm]
        );
        return findByName("Test");
      })(),

      addRuneword: addRuneword,
      findByName: findByName,
      findByRune: findByRune,
      findByType: findByType,
    };
  })();

  Object.defineProperties(RunesData, {
    "addRuneword": { enumerable: false },
    "findByName": { enumerable: false },
    "findByRune": { enumerable: false },
    "findByType": { enumerable: false },
  });

  module.exports = RunesData;
})(module);
