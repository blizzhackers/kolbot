// @ts-nocheck
export {};
declare global {
  export type muleObj = {
      /**
      * - The name of mule profile in d2bot#. It will be started and stopped when needed.
      */
      muleProfile: string;
      /**
      * - Account prefix. Numbers added automatically when making accounts.
      */
      accountPrefix: string;
      /**
      * - Account password
      */
      accountPassword: string;
      /**
      * - Character prefix. Suffix added automatically when making characters.
      */
      charPrefix: string;
      /**
      * - Available options: "useast", "uswest", "europe", "asia"
      */
      realm: string;
      /**
      * - expansion character
      */
      expansion: boolean;
      /**
      * - ladder character
      */
      ladder: boolean;
      /**
      * - Maximum number of mules to create per account (between 1 to 18)
      */
      charsPerAcc: number;
      /**
      * - Game name and password of the mule game. Never use the same game name as for mule logger.
      */
      muleGameName: string[];
      /**
      * - List of profiles that will mule items. Example: enabledProfiles: ["profile 1", "profile 2"]
      */
      enabledProfiles: string[];
      /**
      * - Stop a profile prior to muling. Useful when running 8 bots without proxies.
      */
      stopProfile: string;
      /**
      * - true = stopProfile key will get released on stop. useful when using 100% of your keys for botting.
      */
      stopProfileKeyRelease: boolean;
      /**
      * - Trigger muling at the end of a game if used space in stash greater than or equal to given percent.
      */
      usedStashTrigger: number;
      /**
      * - Trigger muling at the end of a game if used space in inventory greater than or equal to given percent.
      */
      usedInventoryTrigger: number;
      /**
      * - Mule items that have been stashed at some point but are no longer in pickit.
      */
      muleOrphans: boolean;
      /**
      * - Mule stays in game for continuous muling. muleProfile must be dedicated and started manually.
      */
      continuousMule: boolean;
      /**
      * - Skip mule response check and attempt to join mule game. Useful if mule is shared and/or ran on different system.
      */
      skipMuleResponse: boolean;
      /**
      * - Only log character when full, solves an issue with droppers attempting to use characters who are already in game
      */
      onlyLogWhenFull: boolean;
  };

  /** Result of {@link AutoMule.getInfo} - the matching mule/torch-mule config for the current profile, if any. */
  type MuleProfileInfo = {
    muleInfo?: muleObj;
    torchMuleInfo?: muleObj;
  };

  // Value shape of the global `AutoMule` const in AutoMule.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Ambient value declaration (Skill/Attack/Misc precedent): the checker leaves some
  // @type-bound js consts unresolved or any (cause undiagnosed); the ambient const
  // restores resolution and empirically does not collide with the js declaration.
  const AutoMule: AutoMule;

  interface AutoMule {
    Mules: { [profileKey: string]: muleObj };
    TorchAnniMules: { [profileKey: string]: muleObj };
    inGame: boolean;
    check: boolean;
    torchAnniCheck: boolean | 1 | 2;
    gids: Set<number>;
    baseGids: Set<number>;
    getInfo(): MuleProfileInfo | undefined;
    muleCheck(): boolean;
    getMule(): muleObj | false;
    outOfGameCheck(): boolean;
    inGameCheck(): boolean;
    isFinished(): boolean;
    verifyMulePrefix(mulePrefix: string): boolean;
    dropStuff(): boolean;
    matchItem(item: ItemUnit, list: (number | string | ((item: ItemUnit) => boolean))[]): boolean;
    getMuleItems(): ItemUnit[] | false;
    utilityIngredient(item: ItemUnit): boolean;
    cubingIngredient(item: ItemUnit): boolean;
    runewordIngredient(item: ItemUnit): boolean;
    dropCharm(dropAnni: boolean): boolean;
  }

  // Value shape of the global `Mule` const in Mule.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Mule {
    obj: muleObj | null;
    minGameTime: number;
    maxGameTime: number;
    continuous: boolean;
    makeNext: boolean;
    next: boolean;
    refresh: boolean;
    master: string;
    mode: number;
    fileName: string;
    startTick: number;
    status: string;
    statusString: string;
    masterStatus: { status: string };
    droppedGids: Set<number>;
    /** Set on first {@link Mule.pickItems} call; not part of the initial object literal. */
    clearedJunk?: boolean;
    waitForMaster(): void;
    done(): void;
    nextChar(): void;
    quit(): boolean;
    foreverAlone(): boolean;
    checkAnniTorch(): boolean;
    stashItems(): boolean;
    cursorCheck(): boolean;
    getGroundItems(): ItemUnit[];
    pickItems(): string;
    ingameTimeout(time: number): boolean;
    getMaster(info: { profile: string, mode: number }): { profile: string, mode: number } | false;
    getMuleFilename(mode: number, master: string, continuous?: boolean): string;
    getMuleInfo(): { mode: number, obj: muleObj }[];
  }

  type MuleDataObj = {
    account: string;
    accNum: number;
    character: string;
    charNum: number;
    realm: string;
    expansion: boolean;
    ladder: boolean;
    fullChars: number[];
    torchChars: number[];
  };

  // Value shape of the global `MuleData` const in Mule.js (bound there via JSDoc @type).
  // Named MuleDataType (not the bare "MuleData") - reusing the const's own name here reproducibly
  // triggers TS2451 "cannot redeclare block-scoped variable" in this program (verified via the
  // compiler API; AutoMule/Mule right above do NOT hit it with a bare name, cause not isolated).
  interface MuleDataType {
    _default: MuleDataObj;
    fileName: string;
    create(): void;
    read(): MuleDataObj;
    write(data: Partial<MuleDataObj>): void;
    nextAccount(): string;
    nextChar(): string;
  }
}
