export {};

interface Roll {
  All: number;
  Eth: number;
  NonEth: number;
}

interface RecipeHitPower {
  Helm: number;
  Boots: number;
  Gloves: number;
  Belt: number;
  Shield: number;
  Body: number;
  Amulet: number;
  Ring: number;
  Weapon: number;
}

interface RecipeBlood {
  Helm: number;
  Boots: number;
  Gloves: number;
  Belt: number;
  Shield: number;
  Body: number;
  Amulet: number;
  Ring: number;
  Weapon: number;
}

interface RecipeCaster {
  Helm: number;
  Boots: number;
  Gloves: number;
  Belt: number;
  Shield: number;
  Body: number;
  Amulet: number;
  Ring: number;
  Weapon: number;
}

interface RecipeSafety {
  Helm: number;
  Boots: number;
  Gloves: number;
  Belt: number;
  Shield: number;
  Body: number;
  Amulet: number;
  Ring: number;
  Weapon: number;
}

interface RecipeUniqueWeapon {
  ToExceptional: number;
  ToElite: number;
}

interface RecipeUniqueArmor {
  ToExceptional: number;
  ToElite: number;
}

interface RecipeUnique {
  Weapon: RecipeUniqueWeapon;
  Armor: RecipeUniqueArmor;
}

interface RecipeRareWeapon {
  ToExceptional: number;
  ToElite: number;
}

interface RecipeRareArmor {
  ToExceptional: number;
  ToElite: number;
}

interface RecipeRare {
  Weapon: RecipeRareWeapon;
  Armor: RecipeRareArmor;
}

interface RecipeSocketMagic {
  LowWeapon: number;
  HighWeapon: number;
}

interface RecipeSocket {
  Shield: number;
  Weapon: number;
  Armor: number;
  Helm: number;
  Magic: RecipeSocketMagic;
  Rare: number;
}

interface RecipeRerollCharm {
  Small: number;
  Large: number;
  Grand: number;
  LowGrand: number;
}

interface RecipeReroll {
  Magic: number;
  Rare: number;
  HighRare: number;
  Charm: RecipeRerollCharm;
}

interface RecipeLowToNorm {
  Armor: number;
  Weapon: number;
}

declare global {
  const Roll: Roll;
  const Recipe: RecipeHitPower | RecipeBlood | RecipeCaster | RecipeSafety | RecipeUnique | RecipeRare | RecipeSocket | RecipeReroll | RecipeLowToNorm;
  
  namespace Cubing {
    interface RecipeObj {
      Ingredients: (number[] | string[]);
      Index: number;
      KeyItem: number;
      Level?: number;
      Ethereal?: number;
      Enabled?: boolean;
      AlwaysEnabled?: boolean;
      MainRecipe?: number;
      MaxQuantity?: number;
      condition?(): boolean;
      pickLine?: string;
    }

    interface GemList {
      chipped: number[];
      flawed: number[];
      normal: number[];
      flawless: number[];
      perfect: number[];
    }

    interface PotList {
      healing: number[];
      mana: number[];
    }

    interface ValidIngredient {
      classid: number;
      gid: number;
    }

    interface NeededIngredient {
      classid: number | string;
      recipe: RecipeObj;
    }

    function init(): void;
    function buildGemList(): void;
    function getCube(): void;
    function buildRecipes(): void;
    function buildLists(): void;
    function clearSubRecipes(): void;
    function update(): void;
    function checkRecipe(recipe: RecipeObj): ItemUnit[] | boolean;
    function getRecipeNeeds(index: number): string;
    function checkItem(unit: ItemUnit): boolean;
    function keepItem(unit: ItemUnit): boolean;
    function validItem(unit: ItemUnit, recipe: RecipeObj): boolean;
    function doCubing(): boolean;
    function cursorCheck(): boolean;
    function openCube(): boolean;
    function closeCube(closeToStash?: boolean): boolean;
    function emptyCube(): boolean;
    function makeRevPots(): void;
    function repairItem(item: ItemUnit): boolean;
  }
}
