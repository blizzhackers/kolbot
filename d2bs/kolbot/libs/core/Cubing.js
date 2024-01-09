/**
*  @filename    Cubing.js
*  @author      kolton, theBGuy
*  @desc        transmute Horadric Cube recipes
*
*/

const Roll = {
  All: 0,
  Eth: 1,
  NonEth: 2
};

/**
 * @todo Fix/refactor this, these numbers are all arbitrary anyway
 */
const Recipe = {
  Gem: 0,
  HitPower: {
    Helm: 1,
    Boots: 2,
    Gloves: 3,
    Belt: 4,
    Shield: 5,
    Body: 6,
    Amulet: 7,
    Ring: 8,
    Weapon: 9
  },
  Blood: {
    Helm: 10,
    Boots: 11,
    Gloves: 12,
    Belt: 13,
    Shield: 14,
    Body: 15,
    Amulet: 16,
    Ring: 17,
    Weapon: 18
  },
  Caster: {
    Helm: 19,
    Boots: 20,
    Gloves: 21,
    Belt: 22,
    Shield: 23,
    Body: 24,
    Amulet: 25,
    Ring: 26,
    Weapon: 27
  },
  Safety: {
    Helm: 28,
    Boots: 29,
    Gloves: 30,
    Belt: 31,
    Shield: 32,
    Body: 33,
    Amulet: 34,
    Ring: 35,
    Weapon: 36
  },
  Unique: {
    Weapon: {
      ToExceptional: 37,
      ToElite: 38
    },
    Armor: {
      ToExceptional: 39,
      ToElite: 40
    }
  },
  Rare: {
    Weapon: {
      ToExceptional: 41,
      ToElite: 42
    },
    Armor: {
      ToExceptional: 43,
      ToElite: 44
    }
  },
  Socket: {
    Shield: 45,
    Weapon: 46,
    Armor: 47,
    Helm: 48,
    Magic: {
      LowWeapon: 59,
      HighWeapon: 60,
    },
    Rare: 61,
  },
  Reroll: {
    Magic: 49,
    Rare: 50,
    HighRare: 51,
    Charm: {
      Small: 56,
      Large: 57,
      Grand: 58,
    },
  },
  Rune: 52,
  Token: 53,
  LowToNorm: {
    Armor: 54,
    Weapon: 55
  },
  Rejuv: 62,
  FullRejuv: 63,
};

/**
 * @memberof Recipe
 * @function ingredients
 * @returns {number[]}
 */
Object.defineProperty(Recipe, "ingredients", {
  /**
   * Get list of ingredients needed for certain recipe
   * @param {number} index - Index of recipe to check
   * @param {number} [keyItem] - Key item in cubing recipe
   * @returns {number[]}
   */
  value: function (index, keyItem) {
    switch (index) {
    case Recipe.Gem:
      return [keyItem - 1, keyItem - 1, keyItem - 1];
      // Crafting Recipes---------------------------------------------------------------------//
    case Recipe.HitPower.Helm:
      return [keyItem, sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Boots:
      return [keyItem, sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Gloves:
      return [keyItem, sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Belt:
      return [keyItem, sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Shield:
      return [keyItem, sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Body:
      return [keyItem, sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Amulet:
      return [sdk.items.Amulet, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Ring:
      return [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.HitPower.Weapon:
      return [keyItem, sdk.items.runes.Tir, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire];
    case Recipe.Blood.Helm:
      return [keyItem, sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Boots:
      return [keyItem, sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Gloves:
      return [keyItem, sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Belt:
      return [keyItem, sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Shield:
      return [keyItem, sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Body:
      return [keyItem, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Amulet:
      return [sdk.items.Amulet, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Ring:
      return [sdk.items.Ring, sdk.items.runes.Sol, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Blood.Weapon:
      return [keyItem, sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby];
    case Recipe.Caster.Helm:
      return [keyItem, sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Boots:
      return [keyItem, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Gloves:
      return [keyItem, sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Belt:
      return [keyItem, sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Shield:
      return [keyItem, sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Body:
      return [keyItem, sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Amulet:
      return [sdk.items.Amulet, sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Ring:
      return [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Caster.Weapon:
      return [keyItem, sdk.items.runes.Tir, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Safety.Helm:
      return [keyItem, sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Boots:
      return [keyItem, sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Gloves:
      return [keyItem, sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Belt:
      return [keyItem, sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Shield:
      return [keyItem, sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Body:
      return [keyItem, sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Amulet:
      return [sdk.items.Amulet, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Ring:
      return [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
    case Recipe.Safety.Weapon:
      return [keyItem, sdk.items.runes.Sol, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald];
      // Upgrading Recipes-----------------------------------------------------------------------------//
    case Recipe.Unique.Weapon.ToExceptional:
      return [keyItem, sdk.items.runes.Ral, sdk.items.runes.Sol, sdk.items.gems.Perfect.Emerald];
    case Recipe.Unique.Weapon.ToElite: // Ladder only
      return [keyItem, sdk.items.runes.Lum, sdk.items.runes.Pul, sdk.items.gems.Perfect.Emerald];
    case Recipe.Unique.Armor.ToExceptional:
      return [keyItem, sdk.items.runes.Tal, sdk.items.runes.Shael, sdk.items.gems.Perfect.Diamond];
    case Recipe.Unique.Armor.ToElite: // Ladder only
      return [keyItem, sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.gems.Perfect.Diamond];
    case Recipe.Rare.Weapon.ToExceptional:
      return [keyItem, sdk.items.runes.Ort, sdk.items.runes.Amn, sdk.items.gems.Perfect.Sapphire];
    case Recipe.Rare.Weapon.ToElite:
      return [keyItem, sdk.items.runes.Fal, sdk.items.runes.Um, sdk.items.gems.Perfect.Sapphire];
    case Recipe.Rare.Armor.ToExceptional:
      return [keyItem, sdk.items.runes.Ral, sdk.items.runes.Thul, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Rare.Armor.ToElite:
      return [keyItem, sdk.items.runes.Ko, sdk.items.runes.Pul, sdk.items.gems.Perfect.Amethyst];
      // Socketing Recipes-------------------------------------------------------------------------------//
    case Recipe.Socket.Shield:
      return [keyItem, sdk.items.runes.Tal, sdk.items.runes.Amn, sdk.items.gems.Perfect.Ruby];
    case Recipe.Socket.Weapon:
      return [keyItem, sdk.items.runes.Ral, sdk.items.runes.Amn, sdk.items.gems.Perfect.Amethyst];
    case Recipe.Socket.Armor:
      return [keyItem, sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.gems.Perfect.Topaz];
    case Recipe.Socket.Helm:
      return [keyItem, sdk.items.runes.Ral, sdk.items.runes.Thul, sdk.items.gems.Perfect.Sapphire];
    case Recipe.Socket.Magic.LowWeapon:
      return [keyItem, "cgem", "cgem", "cgem"];
    case Recipe.Socket.Magic.HighWeapon:
      return [keyItem, "fgem", "fgem", "fgem"];
    case Recipe.Socket.Rare:
      return [
        keyItem, sdk.items.Ring, sdk.items.gems.Perfect.Skull,
        sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull
      ];
      // Re-rolling Recipes-------------------------------------------------------------------------------//
    case Recipe.Reroll.Charm.Small:
      return [sdk.items.SmallCharm, "pgem", "pgem", "pgem"];
    case Recipe.Reroll.Charm.Large:
      return [sdk.items.LargeCharm, "pgem", "pgem", "pgem"];
    case Recipe.Reroll.Charm.Grand:
      return [sdk.items.GrandCharm, "pgem", "pgem", "pgem"];
    case Recipe.Reroll.Magic: // Hacky solution ftw
      return [keyItem, "pgem", "pgem", "pgem"];
    case Recipe.Reroll.Rare:
      return [
        keyItem, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull,
        sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull,
        sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull
      ];
    case Recipe.Reroll.HighRare:
      return [keyItem, sdk.items.gems.Perfect.Skull, sdk.items.Ring];
    case Recipe.LowToNorm.Weapon:
      return [keyItem, sdk.items.runes.Eld, "cgem"];
    case Recipe.LowToNorm.Armor:
      return [keyItem, sdk.items.runes.El, "cgem"];
      // Rune Recipes--------------------------------------------------------------------------------------//
    case Recipe.Rune:
      switch (keyItem) {
      case sdk.items.runes.Eld:
      case sdk.items.runes.Tir:
      case sdk.items.runes.Nef:
      case sdk.items.runes.Eth:
      case sdk.items.runes.Ith:
      case sdk.items.runes.Tal:
      case sdk.items.runes.Ral:
      case sdk.items.runes.Ort:
        return [keyItem - 1, keyItem - 1, keyItem - 1];
      case sdk.items.runes.Amn: // thul->amn
        return [sdk.items.runes.Thul, sdk.items.runes.Thul, sdk.items.runes.Thul, sdk.items.gems.Chipped.Topaz];
      case sdk.items.runes.Sol: // amn->sol
        return [sdk.items.runes.Amn, sdk.items.runes.Amn, sdk.items.runes.Amn, sdk.items.gems.Chipped.Amethyst];
      case sdk.items.runes.Shael: // sol->shael
        return [sdk.items.runes.Sol, sdk.items.runes.Sol, sdk.items.runes.Sol, sdk.items.gems.Chipped.Sapphire];
      case sdk.items.runes.Dol: // shael->dol
        return [sdk.items.runes.Shael, sdk.items.runes.Shael, sdk.items.runes.Shael, sdk.items.gems.Chipped.Ruby];
      case sdk.items.runes.Hel: // dol->hel
        return [sdk.items.runes.Dol, sdk.items.runes.Dol, sdk.items.runes.Dol, sdk.items.gems.Chipped.Emerald];
      case sdk.items.runes.Io: // hel->io
        return [sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.gems.Chipped.Diamond];
      case sdk.items.runes.Lum: // io->lum
        return [sdk.items.runes.Io, sdk.items.runes.Io, sdk.items.runes.Io, sdk.items.gems.Flawed.Topaz];
      case sdk.items.runes.Ko: // lum->ko
        return [sdk.items.runes.Lum, sdk.items.runes.Lum, sdk.items.runes.Lum, sdk.items.gems.Flawed.Amethyst];
      case sdk.items.runes.Fal: // ko->fal
        return [sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.gems.Flawed.Sapphire];
      case sdk.items.runes.Lem: // fal->lem
        return [sdk.items.runes.Fal, sdk.items.runes.Fal, sdk.items.runes.Fal, sdk.items.gems.Flawed.Ruby];
      case sdk.items.runes.Pul: // lem->pul
        return [sdk.items.runes.Lem, sdk.items.runes.Lem, sdk.items.runes.Lem, sdk.items.gems.Flawed.Emerald];
      case sdk.items.runes.Um: // pul->um
        return [sdk.items.runes.Pul, sdk.items.runes.Pul, sdk.items.gems.Flawed.Diamond];
      case sdk.items.runes.Mal: // um->mal
        return [sdk.items.runes.Um, sdk.items.runes.Um, sdk.items.gems.Normal.Topaz];
      case sdk.items.runes.Ist: // mal->ist
        return [sdk.items.runes.Mal, sdk.items.runes.Mal, sdk.items.gems.Normal.Amethyst];
      case sdk.items.runes.Gul: // ist->gul
        return [sdk.items.runes.Ist, sdk.items.runes.Ist, sdk.items.gems.Normal.Sapphire];
      case sdk.items.runes.Vex: // gul->vex
        return [sdk.items.runes.Gul, sdk.items.runes.Gul, sdk.items.gems.Normal.Ruby];
      case sdk.items.runes.Ohm: // vex->ohm
        return [sdk.items.runes.Vex, sdk.items.runes.Vex, sdk.items.gems.Normal.Emerald];
      case sdk.items.runes.Lo: // ohm->lo
        return [sdk.items.runes.Ohm, sdk.items.runes.Ohm, sdk.items.gems.Normal.Diamond];
      case sdk.items.runes.Sur: // lo->sur
        return [sdk.items.runes.Lo, sdk.items.runes.Lo, sdk.items.gems.Flawless.Topaz];
      case sdk.items.runes.Ber: // sur->ber
        return [sdk.items.runes.Sur, sdk.items.runes.Sur, sdk.items.gems.Flawless.Amethyst];
      case sdk.items.runes.Jah: // ber->jah
        return [sdk.items.runes.Ber, sdk.items.runes.Ber, sdk.items.gems.Flawless.Sapphire];
      case sdk.items.runes.Cham: // jah->cham
        return [sdk.items.runes.Jah, sdk.items.runes.Jah, sdk.items.gems.Flawless.Ruby];
      case sdk.items.runes.Zod: // cham->zod
        return [sdk.items.runes.Cham, sdk.items.runes.Cham, sdk.items.gems.Flawless.Emerald];
      }

      break;
    case Recipe.Token:
      return [
        sdk.quest.item.TwistedEssenceofSuffering, sdk.quest.item.ChargedEssenceofHatred,
        sdk.quest.item.BurningEssenceofTerror, sdk.quest.item.FesteringEssenceofDestruction
      ];
    case Recipe.Rejuv:
      return ["cgem", "hpot", "hpot", "hpot", "mpot", "mpot", "mpot"];
    case Recipe.FullRejuv:
      return ["gem", "hpot", "hpot", "hpot", "mpot", "mpot", "mpot"];
    }
    return [];
  },
  enumerable: false,
});

const Cubing = {
  /** @type {recipeObj[]} */
  recipes: [],
  gemList: [],
  gems: (() => ({
    chipped: Object.values(sdk.items.gems.Chipped),
    flawed: Object.values(sdk.items.gems.Flawed),
    normal: Object.values(sdk.items.gems.Normal),
    flawless: Object.values(sdk.items.gems.Flawless),
    perfect: Object.values(sdk.items.gems.Perfect),
  }))(),
  pots: {
    healing: [
      sdk.items.MinorHealingPotion, sdk.items.LightHealingPotion,
      sdk.items.HealingPotion, sdk.items.GreaterHealingPotion
    ],
    mana: [
      sdk.items.MinorManaPotion, sdk.items.LightManaPotion,
      sdk.items.ManaPotion, sdk.items.GreaterManaPotion
    ],
  },

  init: function () {
    if (!Config.Cubing) return;

    // console.log("We have " + Config.Recipes.length + " cubing recipe(s).");

    for (let i = 0; i < Config.Recipes.length; i += 1) {
      if (Config.Recipes[i].length > 1 && isNaN(Config.Recipes[i][1])) {
        if (NTIPAliasClassID.hasOwnProperty(Config.Recipes[i][1].replace(/\s+/g, "").toLowerCase())) {
          Config.Recipes[i][1] = NTIPAliasClassID[Config.Recipes[i][1].replace(/\s+/g, "").toLowerCase()];
        } else {
          Misc.errorReport("ÿc1Invalid cubing entry:ÿc0 " + Config.Recipes[i][1]);
          Config.Recipes.splice(i, 1);

          i -= 1;
        }
      }
    }

    this.buildRecipes();
    this.buildGemList();
    this.buildLists();
  },

  buildGemList: function () {
    let gemList = Cubing.gems.perfect.slice();

    for (let i = 0; i < this.recipes.length; i += 1) {
      // Skip gems and other magic rerolling recipes
      if ([Recipe.Gem, Recipe.Reroll.Magic].indexOf(this.recipes[i].Index) === -1) {
        for (let j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
          if (gemList.includes(this.recipes[i].Ingredients[j])) {
            gemList.splice(gemList.indexOf(this.recipes[i].Ingredients[j]), 1);
          }
        }
      }
    }

    Cubing.gemList = gemList.slice(0);

    return true;
  },

  /**
   * @typedef recipeObj
   * @property {number[] | string[]} Ingredients
   * @property {number} Index
   * @property {number} [Level]
   * @property {number} [Ethereal]
   * @property {boolean} [Enabled]
   * @property {boolean} [AlwaysEnabled]
   *
   *
   * @todo
   * - Allow passing in ilvl
   */
  buildRecipes: function () {
    Cubing.recipes = [];

    for (let i = 0; i < Config.Recipes.length; i += 1) {
      if (typeof Config.Recipes[i] !== "object"
        || (Config.Recipes[i].length > 2 && typeof Config.Recipes[i][2] !== "number")
        || Config.Recipes[i].length < 1) {
        throw new Error("Cubing.buildRecipes: Invalid recipe format.");
      }

      /** @type {number[]} */
      let [index, keyItem] = Config.Recipes[i];
      const ingredients = Recipe.ingredients(index, keyItem);

      switch (index) {
      case Recipe.Gem:
        this.recipes.push({ Ingredients: ingredients, Index: index, AlwaysEnabled: true });

        break;
        // Crafting Recipes--------------------------------------------------------------//
      case Recipe.HitPower.Helm:
        this.recipes.push({ Ingredients: ingredients, Level: 84, Index: index });

        break;
      case Recipe.HitPower.Boots:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.HitPower.Gloves:
        this.recipes.push({ Ingredients: ingredients, Level: 79, Index: index });

        break;
      case Recipe.HitPower.Belt:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.HitPower.Shield:
        this.recipes.push({ Ingredients: ingredients, Level: 82, Index: index });

        break;
      case Recipe.HitPower.Body:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.HitPower.Amulet:
        this.recipes.push({ Ingredients: ingredients, Level: 90, Index: index });

        break;
      case Recipe.HitPower.Ring:
        this.recipes.push({ Ingredients: ingredients, Level: 77, Index: index });

        break;
      case Recipe.HitPower.Weapon:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.Blood.Helm:
        this.recipes.push({ Ingredients: ingredients, Level: 84, Index: index });

        break;
      case Recipe.Blood.Boots:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.Blood.Gloves:
        this.recipes.push({ Ingredients: ingredients, Level: 79, Index: index });

        break;
      case Recipe.Blood.Belt:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.Blood.Shield:
        this.recipes.push({ Ingredients: ingredients, Level: 82, Index: index });

        break;
      case Recipe.Blood.Body:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.Blood.Amulet:
        this.recipes.push({ Ingredients: ingredients, Level: 90, Index: index });

        break;
      case Recipe.Blood.Ring:
        this.recipes.push({ Ingredients: ingredients, Level: 77, Index: index });

        break;
      case Recipe.Blood.Weapon:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.Caster.Helm:
        this.recipes.push({ Ingredients: ingredients, Level: 84, Index: index });

        break;
      case Recipe.Caster.Boots:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.Caster.Gloves:
        this.recipes.push({ Ingredients: ingredients, Level: 79, Index: index });

        break;
      case Recipe.Caster.Belt:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.Caster.Shield:
        this.recipes.push({ Ingredients: ingredients, Level: 82, Index: index });

        break;
      case Recipe.Caster.Body:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.Caster.Amulet:
        this.recipes.push({ Ingredients: ingredients, Level: 90, Index: index });

        break;
      case Recipe.Caster.Ring:
        this.recipes.push({ Ingredients: ingredients, Level: 77, Index: index });

        break;
      case Recipe.Caster.Weapon:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.Safety.Helm:
        this.recipes.push({ Ingredients: ingredients, Level: 84, Index: index });

        break;
      case Recipe.Safety.Boots:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.Safety.Gloves:
        this.recipes.push({ Ingredients: ingredients, Level: 79, Index: index });

        break;
      case Recipe.Safety.Belt:
        this.recipes.push({ Ingredients: ingredients, Level: 71, Index: index });

        break;
      case Recipe.Safety.Shield:
        this.recipes.push({ Ingredients: ingredients, Level: 82, Index: index });

        break;
      case Recipe.Safety.Body:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
      case Recipe.Safety.Amulet:
        this.recipes.push({ Ingredients: ingredients, Level: 90, Index: index });

        break;
      case Recipe.Safety.Ring:
        this.recipes.push({ Ingredients: ingredients, Level: 77, Index: index });

        break;
      case Recipe.Safety.Weapon:
        this.recipes.push({ Ingredients: ingredients, Level: 85, Index: index });

        break;
        // Upgrading Recipes------------------------------------------------------------------------//
      case Recipe.Unique.Weapon.ToExceptional:
        this.recipes.push({ Ingredients: ingredients, Index: index, Ethereal: Config.Recipes[i][2] });

        break;
      case Recipe.Unique.Weapon.ToElite: // Ladder only
        if (me.ladder) {
          this.recipes.push({ Ingredients: ingredients, Index: index, Ethereal: Config.Recipes[i][2] });
        }

        break;
      case Recipe.Unique.Armor.ToExceptional:
        this.recipes.push({ Ingredients: ingredients, Index: index, Ethereal: Config.Recipes[i][2] });

        break;
      case Recipe.Unique.Armor.ToElite: // Ladder only
        if (me.ladder) {
          this.recipes.push({ Ingredients: ingredients, Index: index, Ethereal: Config.Recipes[i][2] });
        }

        break;
      case Recipe.Rare.Weapon.ToExceptional:
      case Recipe.Rare.Weapon.ToElite:
      case Recipe.Rare.Armor.ToExceptional:
      case Recipe.Rare.Armor.ToElite:
      case Recipe.Socket.Shield:
      case Recipe.Socket.Weapon:
      case Recipe.Socket.Armor:
      case Recipe.Socket.Helm:
      case Recipe.Socket.Rare:
        this.recipes.push({ Ingredients: ingredients, Index: index, Ethereal: Config.Recipes[i][2] });

        break;
      case Recipe.Socket.Magic.LowWeapon:
        // ilvl < 30
        this.recipes.push({ Ingredients: ingredients, Level: 30, Index: index, Ethereal: Config.Recipes[i][2] });

        break;
      case Recipe.Socket.Magic.HighWeapon:
        // ilvl >= 30
        this.recipes.push({ Ingredients: ingredients, Level: 30, Index: index, Ethereal: Config.Recipes[i][2] });

        break;
      case Recipe.Reroll.Charm.Small:
      case Recipe.Reroll.Charm.Large:
      case Recipe.Reroll.Charm.Grand:
      case Recipe.Reroll.Magic: // Hacky solution ftw
        /**
         * Charm ilvls based on https://diablo2.diablowiki.net/Guide:Charms_v1.10,_by_Kronos
         */
        if (index === Recipe.Reroll.Charm.Small) {
          this.recipes.push({ Ingredients: ingredients, Level: 94, Index: index });
        } else if (index === Recipe.Reroll.Charm.Large) {
          this.recipes.push({ Ingredients: ingredients, Level: 76, Index: index });
        } else if (index === Recipe.Reroll.Charm.Grand) {
          this.recipes.push({ Ingredients: ingredients, Level: 77, Index: index });
        } else {
          this.recipes.push({ Ingredients: ingredients, Level: 91, Index: index });
        }

        break;
      case Recipe.Reroll.Rare:
        this.recipes.push({ Ingredients: ingredients, Index: index });

        break;
      case Recipe.Reroll.HighRare:
        this.recipes.push({ Ingredients: ingredients, Index: index, Enabled: false });

        break;
      case Recipe.LowToNorm.Weapon:
      case Recipe.LowToNorm.Armor:
        this.recipes.push({ Ingredients: ingredients, Index: index });

        break;
      case Recipe.Rune:
        switch (Config.Recipes[i][1]) {
        case sdk.items.runes.Eld:
        case sdk.items.runes.Tir:
        case sdk.items.runes.Nef:
        case sdk.items.runes.Eth:
        case sdk.items.runes.Ith:
        case sdk.items.runes.Tal:
        case sdk.items.runes.Ral:
        case sdk.items.runes.Ort:
          this.recipes.push({ Ingredients: ingredients, Index: index, AlwaysEnabled: true });

          break;
        case sdk.items.runes.Thul:
        case sdk.items.runes.Amn:
        case sdk.items.runes.Sol:
        case sdk.items.runes.Shael:
        case sdk.items.runes.Dol:
          this.recipes.push({ Ingredients: ingredients, Index: index });

          break;
        case sdk.items.runes.Hel:
        case sdk.items.runes.Io:
        case sdk.items.runes.Lum:
        case sdk.items.runes.Ko:
        case sdk.items.runes.Fal:
        case sdk.items.runes.Lem:
        case sdk.items.runes.Pul:
        case sdk.items.runes.Um:
        case sdk.items.runes.Mal:
        case sdk.items.runes.Ist:
        case sdk.items.runes.Gul:
        case sdk.items.runes.Vex:
        case sdk.items.runes.Ohm:
        case sdk.items.runes.Lo:
        case sdk.items.runes.Sur:
        case sdk.items.runes.Ber:
        case sdk.items.runes.Jah:
        case sdk.items.runes.Cham:
        case sdk.items.runes.Zod:
          if (me.ladder) {
            this.recipes.push({ Ingredients: ingredients, Index: index });
          }

          break;
        }

        break;
      case Recipe.Token:
        this.recipes.push({ Ingredients: ingredients, Index: index, AlwaysEnabled: true });

        break;
      case Recipe.Rejuv:
      case Recipe.FullRejuv:
        this.recipes.push({ Ingredients: ingredients, Index: index });

        break;
      }
    }
  },

  validIngredients: [], // What we have
  neededIngredients: [], // What we need
  subRecipes: [],

  buildLists: function () {
    CraftingSystem.checkSubrecipes();

    Cubing.validIngredients = [];
    Cubing.neededIngredients = [];
    let items = me.findItems(-1, sdk.items.mode.inStorage);

    for (let i = 0; i < this.recipes.length; i += 1) {
      // Set default Enabled property - true if recipe is always enabled, false otherwise
      this.recipes[i].Enabled = this.recipes[i].hasOwnProperty("AlwaysEnabled");

      IngredientLoop:
      for (let j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
        for (let k = 0; k < items.length; k += 1) {
          if (((this.recipes[i].Ingredients[j] === "pgem" && this.gemList.includes(items[k].classid))
            || (this.recipes[i].Ingredients[j] === "fgem" && this.gems.flawless.includes(items[k].classid))
            || (this.recipes[i].Ingredients[j] === "gem" && this.gems.normal.includes(items[k].classid))
            || (this.recipes[i].Ingredients[j] === "cgem" && this.gems.chipped.includes(items[k].classid))
            || (this.recipes[i].Ingredients[j] === "hpot" && this.pots.healing.includes(items[k].classid))
            || (this.recipes[i].Ingredients[j] === "mpot" && this.pots.mana.includes(items[k].classid))
            || items[k].classid === this.recipes[i].Ingredients[j]) && this.validItem(items[k], this.recipes[i])) {

            // push the item's info into the valid ingredients array. this will be used to find items when checking recipes
            this.validIngredients.push({ classid: items[k].classid, gid: items[k].gid });

            // Remove from item list to prevent counting the same item more than once
            items.splice(k, 1);
            k -= 1;

            // Enable recipes for gem/jewel pickup
            if (this.recipes[i].Index !== Recipe.Rune
              || ([Recipe.Rune, Recipe.Rejuv, Recipe.FullRejuv].includes(this.recipes[i].Index) && j >= 1)) {
              // Enable rune recipe after 2 bases are found
              this.recipes[i].Enabled = true;
            }

            continue IngredientLoop;
          }
        }

        // add the item to needed list - enable pickup
        this.neededIngredients.push({ classid: this.recipes[i].Ingredients[j], recipe: this.recipes[i] });

        // skip flawless gems adding if we don't have the main item (Recipe.Gem and Recipe.Rune for el-ort are always enabled)
        if (!this.recipes[i].Enabled) {
          break;
        }

        // if the recipe is enabled (we have the main item), add gem recipes (if needed)
        if (!this.recipes[i].hasOwnProperty("MainRecipe")) {
          // make sure we don't add a subrecipe to a subrecipe
          for (let gType of Object.values(Cubing.gems)) {
            // skip over cgems - can't cube them
            if (gType.includes(sdk.items.gems.Chipped.Amethyst)) continue;
            for (let gem of gType) {
              if (this.subRecipes.indexOf(gem) === -1
                && (this.recipes[i].Ingredients[j] === gem
                || (this.recipes[i].Ingredients[j] === "pgem" && Cubing.gemList.includes(gem)))) {
                this.recipes.push({
                  Ingredients: [gem - 1, gem - 1, gem - 1],
                  Index: Recipe.Gem,
                  AlwaysEnabled: true,
                  MainRecipe: this.recipes[i].Index
                });
                this.subRecipes.push(gem);
              }
            }
          }
        }
      }
    }
  },

  // Remove unneeded flawless gem recipes
  clearSubRecipes: function () {
    Cubing.subRecipes = [];

    for (let i = 0; i < this.recipes.length; i += 1) {
      if (this.recipes[i].hasOwnProperty("MainRecipe")) {
        this.recipes.splice(i, 1);

        i -= 1;
      }
    }
  },

  update: function () {
    this.clearSubRecipes();
    this.buildLists();
  },

  /**
   * @param {recipeObj} recipe 
   * @returns {boolean}
   */
  checkRecipe: function (recipe) {
    let usedGids = [];
    let matchList = [];

    for (let i = 0; i < recipe.Ingredients.length; i += 1) {
      for (let ingredient of Cubing.validIngredients) {
        if (usedGids.indexOf(ingredient.gid) === -1 && (
          ingredient.classid === recipe.Ingredients[i]
            || (recipe.Ingredients[i] === "pgem" && Cubing.gemList.includes(ingredient.classid))
            || (recipe.Ingredients[i] === "fgem" && Cubing.gems.flawless.includes(ingredient.classid))
            || (recipe.Ingredients[i] === "gem" && Cubing.gems.normal.includes(ingredient.classid))
            || (recipe.Ingredients[i] === "cgem" && Cubing.gems.chipped.includes(ingredient.classid))
            || (recipe.Ingredients[i] === "hpot" && Cubing.pots.healing.includes(ingredient.classid))
            || (recipe.Ingredients[i] === "mpot" && Cubing.pots.mana.includes(ingredient.classid))
        )) {
          let item = me.getItem(ingredient.classid, -1, ingredient.gid);

          // 26.11.2012. check if the item actually belongs to the given recipe
          if (item && Cubing.validItem(item, recipe)) {
            // don't repeat the same item
            usedGids.push(ingredient.gid);
            // push the item into the match list
            matchList.push(copyUnit(item));

            break;
          }
        }
      }

      // no new items in the match list = not enough ingredients
      if (matchList.length !== i + 1) return false;
    }

    // return the match list. these items go to cube
    return matchList;
  },

  /**
   * debug function - get what each recipe needs
   * @param {number} index 
   * @returns {string}
   */
  getRecipeNeeds: function (index) {
    let rval = " [";

    for (let i = 0; i < this.neededIngredients.length; i += 1) {
      if (this.neededIngredients[i].recipe.Index === index) {
        rval += this.neededIngredients[i].classid + (i === this.neededIngredients.length - 1 ? "" : " ");
      }
    }

    rval += "]";

    return rval;
  },

  /**
   * Check an item on ground for pickup
   * @param {ItemUnit} unit 
   * @returns {boolean}
   */
  checkItem: function (unit) {
    if (!Config.Cubing) return false;
    if (this.keepItem(unit)) return true;

    for (let i = 0; i < this.neededIngredients.length; i += 1) {
      if (unit.classid === this.neededIngredients[i].classid
        && this.validItem(unit, this.neededIngredients[i].recipe)) {
        //debugLog("Cubing: " + unit.name + " " + this.neededIngredients[i].recipe.Index + " " + (this.neededIngredients[i].recipe.hasOwnProperty("MainRecipe") ? this.neededIngredients[i].recipe.MainRecipe : "") + this.getRecipeNeeds(this.neededIngredients[i].recipe.Index));
        return true;
      }
    }

    return false;
  },

  /**
   * Don't drop an item from inventory if it's a part of cubing recipe
   * @param {ItemUnit} unit 
   * @returns {boolean}
   */
  keepItem: function (unit) {
    if (!Config.Cubing) return false;

    for (let i = 0; i < this.validIngredients.length; i += 1) {
      if (unit.mode === sdk.items.mode.inStorage && unit.gid === this.validIngredients[i].gid) {
        return true;
      }
    }

    return false;
  },

  /**
   * Check if this item is valid for a given recipe
   * @param {ItemUnit} unit 
   * @param {recipeObj} recipe 
   * @returns {boolean}
   */
  validItem: function (unit, recipe) {
    // Excluded items
    // Don't use items in locked inventory space - or wanted by other systems
    if ((unit.isInInventory && Storage.Inventory.IsLocked(unit, Config.Inventory)
      || Runewords.validGids.includes(unit.gid) || CraftingSystem.validGids.includes(unit.gid))) {
      return false;
    }

    const rIndex = recipe.Index;

    // Pots and Gems - for Rejuv recipes
    if ([Recipe.Rejuv, Recipe.FullRejuv].includes(rIndex)) {
      /**
       * @todo do this better, hacky fix for now
       */
      if (!recipe.Enabled) {
        if (rIndex === Recipe.Rejuv && this.gems.chipped.includes(unit.classid)) return true;
        if (rIndex === Recipe.FullRejuv && this.gems.normal.includes(unit.classid)) return true;
        return false;
      }
      
      if (rIndex === Recipe.Rejuv && this.gems.chipped.includes(unit.classid)) return true;
      if (rIndex === Recipe.FullRejuv && this.gems.normal.includes(unit.classid)) return true;
      if ([].concat(Cubing.pots.healing, Cubing.pots.mana).includes(unit.classid)) {
        return true;
      }

      return false;
    }

    // Gems and runes
    if ((unit.itemType >= sdk.items.type.Amethyst
      && unit.itemType <= sdk.items.type.Skull) || unit.itemType === sdk.items.type.Rune) {
      if (!recipe.Enabled && recipe.Ingredients[0] !== unit.classid && recipe.Ingredients[1] !== unit.classid) {
        return false;
      }

      return true;
    }
    
    // Token
    if (rIndex === Recipe.Token) return true;

    // START
    const ntipResult = NTIP.CheckItem(unit);

    if (rIndex >= Recipe.HitPower.Helm && rIndex <= Recipe.Safety.Weapon) {
      // Junk jewels (NOT matching a pickit entry)
      if (unit.itemType === sdk.items.type.Jewel) {
        if (recipe.Enabled && ntipResult === Pickit.Result.UNWANTED) {
          return true;
        }
        // Main item, NOT matching a pickit entry
      } else if (unit.magic && Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) >= recipe.Level
        && ntipResult === Pickit.Result.UNWANTED) {
        return true;
      }

      return false;
    }

    let upgradeUnique = rIndex >= Recipe.Unique.Weapon.ToExceptional && rIndex <= Recipe.Unique.Armor.ToElite;
    let upgradeRare = rIndex >= Recipe.Rare.Weapon.ToExceptional && rIndex <= Recipe.Rare.Armor.ToElite;
    let socketNormal = rIndex >= Recipe.Socket.Shield && rIndex <= Recipe.Socket.Helm;
    let socketMagic = [Recipe.Socket.Magic.LowWeapon, Recipe.Socket.Magic.HighWeapon].includes(rIndex);
    let socketRare = rIndex === Recipe.Socket.Rare;

    if (socketRare && recipe.Enabled && recipe.Ingredients[2] === unit.classid && unit.itemType === sdk.items.type.Ring
      && unit.getStat(sdk.stats.MaxManaPercent) && !Storage.Inventory.IsLocked(unit, Config.Inventory)) {
      return true;
    }

    if (upgradeUnique || upgradeRare || socketNormal || socketRare) {
      switch (true) {
      case upgradeUnique && unit.unique && ntipResult === Pickit.Result.WANTED: // Unique item matching pickit entry
      case upgradeRare && unit.rare && ntipResult === Pickit.Result.WANTED: // Rare item matching pickit entry
      case socketNormal && unit.normal && unit.sockets === 0: // Normal item matching pickit entry, no sockets
      case socketMagic && unit.magic && unit.sockets === 0: // Magic item matching pickit entry, no sockets
      case socketRare && unit.rare && unit.sockets === 0: // Rare item matching pickit entry, no sockets
        if (socketMagic) {
          if (rIndex === Recipe.Socket.Magic.LowWeapon && unit.ilvl > recipe.Level) return false;
          if (rIndex === Recipe.Socket.Magic.HighWeapon && unit.ilvl < recipe.Level) return false;
        }
        if (recipe.Ethereal === undefined) return ntipResult === Pickit.Result.WANTED;
        switch (recipe.Ethereal) {
        case Roll.All:
          return ntipResult === Pickit.Result.WANTED;
        case Roll.Eth:
          return unit.ethereal && ntipResult === Pickit.Result.WANTED;
        case Roll.NonEth:
          return !unit.ethereal && ntipResult === Pickit.Result.WANTED;
        }

        return false;
      }

      return false;
    }

    if (rIndex === Recipe.Reroll.Magic
      || (rIndex >= Recipe.Reroll.Charm.Small && rIndex <= Recipe.Reroll.Charm.Grand)) {
      return (unit.magic && unit.ilvl >= recipe.Level && ntipResult === Pickit.Result.UNWANTED);
    }

    if (rIndex === Recipe.Reroll.Rare) {
      return (unit.rare && ntipResult === Pickit.Result.UNWANTED);
    }

    if (rIndex === Recipe.Reroll.HighRare) {
      if (recipe.Ingredients[0] === unit.classid && unit.rare && ntipResult === Pickit.Result.UNWANTED) {
        recipe.Enabled = true;

        return true;
      }

      if (recipe.Enabled && recipe.Ingredients[2] === unit.classid && unit.itemType === sdk.items.type.Ring
        && unit.getStat(sdk.stats.MaxManaPercent) && !Storage.Inventory.IsLocked(unit, Config.Inventory)) {
        return true;
      }

      return false;
    }

    if (rIndex === Recipe.LowToNorm.Armor || rIndex === Recipe.LowToNorm.Weapon) {
      return (unit.lowquality && ntipResult === Pickit.Result.UNWANTED);
    }

    return false;
  },

  doCubing: function () {
    if (!Config.Cubing) return false;
    if (!me.getItem(sdk.quest.item.Cube)) return false;

    this.update();
    // Randomize the recipe array to prevent recipe blocking (multiple caster items etc.)
    let tempArray = this.recipes.slice().shuffle();

    for (let i = 0; i < tempArray.length; i += 1) {
      let string = "Transmuting: ";
      let items = this.checkRecipe(tempArray[i]);
      if (!Array.isArray(items) || !items.length) continue;

      // If cube isn't open, attempt to open stash (the function returns true if stash is already open)
      if ((!getUIFlag(sdk.uiflags.Cube) && !Town.openStash()) || !this.emptyCube()) return false;

      this.cursorCheck();

      i = -1;

      let itemsToCubeCount = items.length;

      while (items.length) {
        string += (items[0].name.trim() + (items.length > 1 ? " + " : ""));
        Storage.Cube.MoveTo(items[0]);
        items.shift();
      }

      const itemsInCube = me.getItemsEx().filter(function (el) {
        return el.isInCube;
      });
      if (itemsInCube.length !== itemsToCubeCount) {
        console.warn("Failed to move all necesary items to cube");
        itemsInCube.forEach(function (item) {
          if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) return;
          if (Storage.Stash.CanFit(item) && Storage.Stash.MoveTo(item)) return;
        });
        return false;
      }

      if (!this.openCube()) return false;

      transmute();
      delay(700 + me.ping);
      console.log("ÿc4Cubing: " + string);
      Config.ShowCubingInfo && D2Bot.printToConsole(string, sdk.colors.D2Bot.Green);
      this.update();

      let cubeItems = me.findItems(-1, -1, sdk.storage.Cube);

      if (items) {
        for (let cubeItem of cubeItems) {
          let result = Pickit.checkItem(cubeItem);

          /**
            * @todo
            * - build better method of updating cubelist so if a item we cube is wanted by cubing we
            * can update our list without clearing and rebuilding the whole thing
            */

          switch (result.result) {
          case Pickit.Result.UNWANTED:
            Item.logger("Dropped", cubeItem, "doCubing");
            cubeItem.drop();

            break;
          case Pickit.Result.WANTED:
            Item.logger("Cubing Kept", cubeItem);
            Item.logItem("Cubing Kept", cubeItem, result.line);

            break;
          case Pickit.Result.RUNEWORD:
            Runewords.update(cubeItem.classid, cubeItem.gid);

            break;
          case Pickit.Result.CRAFTING:
            CraftingSystem.update(cubeItem);

            break;
          }
        }
      }

      if (!this.emptyCube()) {
        break;
      }
    }

    /**
     * For now, until I write a better update method, give a recursive call to doCubing if after building list
     * we find we can still cube
     */
    Cubing.update();
    let checkList = this.recipes.slice().shuffle();
    if (checkList.some(Cubing.checkRecipe)) {
      // we can still cube so recursive call to doCubing
      return Cubing.doCubing();
    }

    if (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
      delay(1000);

      while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
        me.cancel();
        delay(300);
      }
    }

    return true;
  },

  cursorCheck: function () {
    if (me.itemoncursor) {
      let item = Game.getCursorUnit();

      if (item) {
        if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) return true;
        if (Storage.Stash.CanFit(item) && Storage.Stash.MoveTo(item)) return true;

        if (item.drop()) {
          Item.logger("Dropped", item, "cursorCheck");
          return true;
        }
      }

      return false;
    }

    return true;
  },

  openCube: function () {
    if (getUIFlag(sdk.uiflags.Cube)) return true;

    let cube = me.getItem(sdk.quest.item.Cube);
    if (!cube) return false;

    if (cube.isInStash && !Town.openStash()) return false;
    const cubeOpened = function () {
      return getUIFlag(sdk.uiflags.Cube);
    };

    for (let i = 0; i < 5 && !cubeOpened(); i++) {
      cube.interact();

      if (Misc.poll(cubeOpened, (Time.seconds(1) * (i + 1)), 100)) {
        delay(100 + me.ping * 2); // allow UI to initialize

        return true;
      }
    }

    return cubeOpened();
  },

  closeCube: function (closeToStash = false) {
    if (!getUIFlag(sdk.uiflags.Cube)) return true;
    const cubeClosed = function () {
      return !getUIFlag(sdk.uiflags.Cube);
    };

    const closeBtn = me.screensize
      ? { x: 373, y: 469 }
      : { x: 285, y: 394 };

    for (let i = 0; i < 5 && !cubeClosed(); i++) {
      closeToStash ? sendClick(closeBtn.x, closeBtn.y) : me.cancel();
      
      if (Misc.poll(cubeClosed, (Time.seconds(1) * (i + 1)), 100)) {
        delay(250 + me.ping * 2); // allow UI to initialize

        return true;
      }
    }

    return cubeClosed();
  },

  emptyCube: function () {
    let cube = me.getItem(sdk.quest.item.Cube);
    if (!cube) return false;

    let items = me.findItems(-1, -1, sdk.storage.Cube);
    if (!items) return true;

    /** @param {ItemUnit} item */
    const prettyPrint = function (item) {
      return item && item.prettyPrint;
    };

    let sorted = false;

    while (items.length) {
      !getUIFlag(sdk.uiflags.Cube) && Cubing.openCube();

      if (!Storage.Stash.MoveTo(items[0]) && !Storage.Inventory.MoveTo(items[0])) {
        // attempt to sort inventory first then try again
        if (!sorted && Storage.Inventory.SortItems()) {
          sorted = true;
          continue;
        }
        
        console.warn("Failed to empty cube. Items still in cube :: ", items.map(prettyPrint));
        return false;
      }

      items.shift();
    }

    this.closeCube();

    return true;
  },

  makeRevPots: function () {
    let locations = {
      Belt: 2,
      Inventory: 3,
      Cube: 6,
      Stash: 7,
    };
    let origin = [], cube = me.getItem(sdk.quest.item.Cube), cubeInStash;

    // Get a list of all items - Filter out all those rev pots
    let revpots = me.getItemsEx().filter(item => item.classid === sdk.items.RejuvenationPotion);

    // Stop if less as 3 pots
    if (revpots.length < 3) {
      return;
    }

    // Go to town and open stash
    Town.goToTown() && Town.moveToSpot("stash");
    Town.openStash();

    // For reasons unclear, cubing goes wrong in stash in my test, so for ease, i put cube in inventory
    (cubeInStash = cube.location !== locations.Inventory) && Storage.Inventory.MoveTo(cube);
    me.cancel();
    me.cancel();

    // clear the cube, otherwise we cant transmute
    Cubing.emptyCube();

    // Remove excessive pots from the list. (only groups of 3)
    revpots.length -= revpots.length % 3;

    // Call this function for each pot
    revpots.forEach(function (pot, index) {

      // Add this to the original location array
      origin.push({ location: pot.location, x: pot.x, y: pot.y });

      Town.openStash();

      // Move to inventory first (to avoid bugs)
      Storage.Inventory.MoveTo(pot);
      me.cancel(); // remove inventory/cube window
      me.cancel(); // remove inventory window (if it was cube)

      // Move the current pot to the cube
      Storage.Cube.MoveTo(pot);
      // For every third pot, excluding the first
      if (!index || (1 + index) % 3 !== 0) {
        me.cancel(); // remove cube window
        me.cancel(); // remove stash window
      } else {
        // press the transmute button
        Cubing.openCube() && transmute();

        // high delay here to avoid issues with ping spikes
        delay(me.ping * 5 + 1000); // <-- probably can be less

        // Find all items in the cube. (the full rev pot)
        let fullrev = me.findItem(-1, -1, sdk.storage.Cube);

        // Sort the original locations of the pots. Put a low location first (belt = 2, rest is higher).
        origin.sort((a, b) => a.location - b.location).some(function (orgin) { // Loop over all the original spots.

          // Loop trough all possible locations
          for (let i in locations) {
            // If location is matched with its orgin, we know the name of the spot
            locations[i] === orgin.location && (orgin.location = i); // Store the name of the location
          }

          Storage.Inventory.MoveTo(fullrev); // First put to inventory;
          me.cancel(); // cube
          me.cancel(); // inventory

          // If the storage location is known, put the pot to this location
          Storage[orgin.location] && Storage[orgin.location].MoveTo(fullrev);

          // If returned true, the prototype some stops looping.
          return fullrev.location !== locations.Cube;
        });

        // empty the array
        origin.length = 0;

        // Cube should be empty, but lets be sure
        Cubing.emptyCube();
      }
    });
    // Put cube back in stash, if it was when we started
    cubeInStash && Storage.Stash.MoveTo(cube);

    me.cancel();
    me.cancel();
  },

  /**
   * @todo Add chipped/flawed gems for recharging a item
   * @param {ItemUnit} item - Rune
   */
  repairIngredientCheck: function (item) {
    if (!Config.CubeRepair) return false;
    if (item.classid !== sdk.items.runes.Ral && item.classid !== sdk.items.runes.Ort) {
      return false;
    }

    let [have, needRal, needOrt] = [0, 0, 0];
    let items = me.getItemsForRepair(Config.RepairPercent, false);

    if (items.length) {
      while (items.length > 0) {
        let runeNeeded = Item.getRepairIngred(items.shift());

        if (runeNeeded === sdk.items.runes.Ral) {
          needRal += 1;
        } else if (runeNeeded === sdk.items.runes.Ort) {
          needOrt += 1;
        }
      }
    }

    switch (item.classid) {
    case sdk.items.runes.Ral:
      needRal && (have = me.findItems(sdk.items.runes.Ral).length);

      return (!have || have < needRal);
    case sdk.items.runes.Ort:
      needOrt && (have = me.findItems(sdk.items.runes.Ort).length);

      return (!have || have < needOrt);
    default:
      return false;
    }
  },

  /**
   * @todo Allow cube-repairing items from stash/invo
   * @todo Repair & Recharge
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  repairItem: function (item) {
    if (!item || !item.isEquipped) return false;

    const neededRune = Item.repairIngred(item);
    const rune = me.getItem(neededRune);
    const bodyLoc = item.bodylocation;

    if (!rune || !Cubing.emptyCube()) return false;

    for (let i = 0; i < 5; i++) {
      if (!rune.isInCube) {
        console.log("Moving rune to cube...");
        if (!Storage.Cube.MoveTo(rune)) continue;
      }
      if (!item.isInCube) {
        console.log("Moving item to cube...");
        Storage.Cube.MoveTo(item);
      }
      if (rune.isInCube && item.isInCube && Cubing.openCube()) break;
    }

    if (!rune.isInCube || !item.isInCube) {
      console.log("Failed to move rune or item to cube.");
      // If item was equipped try reequipping it
      if (bodyLoc && !item.isEquipped) {
        item.isInCube && Cubing.openCube();
        item.equip(bodyLoc);
        delay(me.ping * 2 + 500);
        me.cancelUIFlags();
      }
      return false;
    }

    for (let i = 0; i < 100; i += 1) {
      let cubeItems = me.findItems(-1, -1, sdk.storage.Cube);

      if (!me.itemoncursor && cubeItems.length === 2) {
        console.log("Transmuting..." + i);
        transmute();
        delay(1000 + me.ping);

        cubeItems = me.findItems(-1, -1, sdk.storage.Cube);

        // We expect only one item in cube
        console.log("Cube contents: " + cubeItems.map(i => i.name).join(", "));
        cubeItems.length === 1 && cubeItems[0].toCursor();
      }

      if (me.itemoncursor) {
        const cubeItem = Game.getCursorUnit();
        for (let i = 0; i < 3; i++) {
          clickItem(sdk.clicktypes.click.item.Left, bodyLoc);
          delay(me.ping * 2 + 500);

          if (cubeItem.bodylocation === bodyLoc) {
            console.log(cubeItem.prettyPrint + " successfully repaired and equipped.");
            D2Bot.printToConsole(cubeItem.prettyPrint + " successfully repaired and equipped.", sdk.colors.D2Bot.Green);
            me.cancelUIFlags();

            return true;
          }
        }
      }

      delay(200);
    }

    // error report is good but do we really need to stop?
    Misc.errorReport("Failed to put repaired item back on.");
    D2Bot.stop();

    return false;
  },

  doRepairs: function () {
    if (!Config.CubeRepair || !me.cube) return false;

    let items = me.getItemsForRepair(Config.RepairPercent, false)
      .sort(function (a, b) {
        return a.durabilityPercent - b.durabilityPercent;
      });

    while (items.length > 0) {
      Cubing.repairItem(items.shift());
    }

    return true;
  },
};
