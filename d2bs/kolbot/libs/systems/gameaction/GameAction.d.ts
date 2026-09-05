export {};
declare global {
  type GameActionDropItem = {
    title: string;
    character: string;
    realm: string;
    account: string;
    itemid: string;
  };

  type DoDropGameActionData = {
    items: GameActionDropItem[];
    gameName: string;
    gamePass: string;
    realm: string;
    account: string;
    chars: string[];
  };

  type GameActionLadderConvertEntry = {
    realm: string;
    account: string;
    character: string;
  };

  // Matches the shapes `GameAction.task.data` actually takes across the different task actions
  // (doDrop/mule-log fields, doConvertNL's array form, or the raw JSON string before init() parses it).
  type GameActionData = Partial<DoDropGameActionData> | GameActionLadderConvertEntry[] | string;

  type GameActionTask = {
    hash: string;
    profile: string;
    action: string;
    data: GameActionData;
  };

  // Value shape of the global `GameAction` const in GameAction.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface GameAction {
    LogNames: boolean;
    LogItemLevel: boolean;
    LogEquipped: boolean;
    LogMerc: boolean;
    SaveScreenShot: boolean;
    IngameTime: number;
    task: GameActionTask | null;

    // Methods
    init(task: string): boolean;
    update(action: string, data: string | object): void;
    gameInfo(): { gameName: string; gamePass: string } | null;
    getLogin(): { realm: string | null; account: string | null; password: string | null };
    getCharacters(): string[];
    inGameCheck(): boolean;
    load(hash: string): string;
    save(hash: string, data: string): void;
    dropItems(droplist: GameActionDropItem[]): void;
    convertLadderFiles(): void;
  }
}
