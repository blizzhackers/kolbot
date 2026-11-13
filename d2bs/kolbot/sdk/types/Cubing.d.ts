export {};

declare global {
  // Shape of the global `Roll` const in libs/core/Cubing.js (bound there via JSDoc @type);
  // global so the JSDoc can reference it. Declaring the const here too would collide.
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

  // Value shape of the global `Recipe` const in libs/core/Cubing.js (bound there via JSDoc
  // @type). Declaring the const here as well would collide: both files are global scripts.
  interface IRecipe {
    Gem: number;
    HitPower: RecipeHitPower;
    Blood: RecipeBlood;
    Caster: RecipeCaster;
    Safety: RecipeSafety;
    Unique: RecipeUnique;
    Rare: RecipeRare;
    Socket: RecipeSocket;
    Reroll: RecipeReroll;
    Rune: number;
    Token: number;
    LowToNorm: RecipeLowToNorm;
    Rejuv: number;
    FullRejuv: number;
    /**
     * Ingredient list for a recipe index - numeric classids mixed with "cgem"/"gem"/"fgem"/
     * "pgem"/"hpot"/"mpot" wildcard entries resolved later by Cubing.checkRecipe/validItem.
     */
    ingredients(index: number, keyItem?: number): (number | string)[];
    /** Minimum ilvl/clvl gate for a recipe index, or undefined if the index has none defined. */
    itemLevel(index: number): number | undefined;
  }

  interface CubingRecipeObj {
    Ingredients: (number | string)[];
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

  interface CubingGemList {
    chipped: number[];
    flawed: number[];
    normal: number[];
    flawless: number[];
    perfect: number[];
  }

  interface CubingPotList {
    healing: number[];
    mana: number[];
  }

  interface CubingValidIngredient {
    classid: number;
    gid: number;
  }

  interface CubingNeededIngredient {
    classid: number | string;
    recipe: CubingRecipeObj;
  }

  // Value shape of the global `Cubing` const in libs/core/Cubing.js (bound there via JSDoc
  // @type). Declaring the const here as well would collide: both files are global scripts.
  interface ICubing {
    recipes: CubingRecipeObj[];
    gemList: number[];
    gems: CubingGemList;
    pots: CubingPotList;
    validIngredients: CubingValidIngredient[];
    neededIngredients: CubingNeededIngredient[];
    subRecipes: number[];

    init(): void;
    buildGemList(): boolean;
    buildRecipes(): void;
    buildLists(): void;
    clearSubRecipes(): void;
    update(): void;
    checkRecipe(recipe: CubingRecipeObj): ItemUnit[] | false;
    getRecipeNeeds(index: number): string;
    checkItem(unit: ItemUnit): boolean;
    keepItem(unit: ItemUnit): boolean;
    validItem(unit: ItemUnit, recipe: CubingRecipeObj): boolean;
    doCubing(): boolean;
    cursorCheck(): boolean;
    openCube(): boolean;
    closeCube(closeToStash?: boolean): boolean;
    emptyCube(): boolean;
    makeRevPots(): void;
    repairIngredientCheck(item: ItemUnit): boolean;
    repairItem(item: ItemUnit): boolean;
    doRepairs(): boolean;
  }
}
