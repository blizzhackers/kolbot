export {};
declare global {
  interface CraftingSystemSet {
    /** Base item class ids to craft onto */
    BaseItems: number[];
    /** Recipe ingredient class ids */
    Ingredients: number[];
    /** Number of full sets to gather before transferring */
    SetAmount: number;
    Type: "crafting" | "runewords" | "cubing";
    /** Runtime flag toggled by CraftingSystem.init from worker set-info */
    Enabled?: boolean;
  }

  interface CraftingSystemTeam {
    /** Profiles that collect ingredients */
    Collectors: string[];
    /** Profiles that craft/reroll items */
    Workers: string[];
    /** Worker game names (without the numbers) */
    CraftingGames: string[];
    Sets: CraftingSystemSet[];
  }

  /** getInfo() return: the matched team plus which role the current profile plays */
  interface CraftingSystemTeamInfo extends CraftingSystemTeam {
    collector: boolean;
    worker: boolean;
  }

  interface CraftingSystemWorker {
    /** [gameName, password] once discovered via copydata, else false */
    game: string[] | false;
    name: string | false;
  }

  // Value shape of the global `CraftingSystem` const in CraftingSystem.js (bound there via
  // JSDoc @type). Declaring the const here as well would collide: both files are global scripts.
  interface ICraftingSystem {
    Teams: Record<string, CraftingSystemTeam>;
    check: boolean;
    inGame: boolean;
    neededItems: number[];
    validGids: number[];
    itemList: ItemUnit[];
    /** Completed ingredient sets as gid lists, consumed by dropItems */
    fullSets: number[][];
    getInfo(): CraftingSystemTeamInfo | false;
    outOfGameCheck(): boolean;
    getWorker(): CraftingSystemWorker | false;
    inGameCheck(): boolean;
    validItem(item: ItemUnit): boolean;
    checkItem(item: ItemUnit): boolean;
    keepItem(item: ItemUnit): boolean;
    /** Per-set 0/1 enabled flags fetched from the worker over copydata, or false on timeout */
    getSetInfoFromWorker(workerName: string): number[] | false;
    init(name: string): void;
    buildLists(onlyNeeded?: boolean): boolean;
    checkSet(set: CraftingSystemSet): object;
    update(item: ItemUnit): boolean;
    checkSubrecipes(): boolean;
    checkFullSets(): boolean;
    dropItems(): boolean;
    dropGold(): void;
  }
}
