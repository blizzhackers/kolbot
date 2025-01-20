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
  export const AutoMule: {
    Mules: {
      [x: string]: muleObj;
    };
    TorchAnniMules: {
      [x: string]: muleObj;
    };
    getInfo(): boolean | muleObj
    muleCheck(): void
    getMule(): void
    outOfGameCheck(): void
    inGameCheck(): void
    dropStuff(): void
    matchItem(item: ItemUnit, list: any): void
    getMuleItems(): ItemUnit[]
    utilityIngredient(item: ItemUnit): void
    cubingIngredient(item: ItemUnit): void
    runewordIngredient(item: ItemUnit): void
    dropCharm(dropAnni: any): void
  };
  export namespace Mule {
    let obj: muleObj;
    let minGameTime: number;
    let maxGameTime: number;
    let continuous: boolean;
    let makeNext: boolean;
    let refresh: boolean;
    let master: string;
    let mode: number;
    let startTick: number;
    let status: string;
    let statusString: string;
    let masterStatus: { status: string };

    function init(): void;
    function gameRefresh(): void;
    function ingameTimeout(): boolean;
    function getMaster(info: { profile: string, mode: number }): { profile: string, mode: number }
    function getMuleFilename(mode?: number, master: string): string;
    function getMuleInfo(master?: string): { mode: number, obj: muleObj }[];
  };
  export namespace MuleData {
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
    const _default: MuleDataObj;
    let fileName: string;
    function create(): void;
    function read(): MuleDataObj;
    function write(data: Partial<MuleDataObj>): void;
    function nextAccount(): string;
    function nextChar(): string;
  };
  export namespace LocationAction {
    function run(): void;
  };
}
