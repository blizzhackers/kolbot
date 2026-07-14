declare global {
  type DamageType = "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt";

  interface AttackResult {
    FAILED: 0;
    SUCCESS: 1;
    CANTATTACK: 2; // need to fix the ambiguity between this result and Failed
    NEEDMANA: 3;
    NOOP: 4; // used for clearing, if we didn't find any monsters to clear it's not exactly a success or fail
    FAILED_POSITION: 5;
  }

  namespace Attack {
    const infinity: boolean;
    const auradin: boolean;
    const monsterObjects: Set<number>;
    const Result: AttackResult;
    const _killed: Set<number>;
    function haveKilled(id: number | string): boolean;
    function init(): void;
    function checkSlot(slot?: 0 | 1): boolean;
    function getPrimarySlot(): 0 | 1;
    function getCustomAttack(unit: Unit): boolean | [number, number];
    function getCharges(): boolean;
    function checkInfinity(): boolean;
    function checkAuradin(): boolean;
    function canTeleStomp(unit: Monster | Player): boolean;
    function kill(classId: number | Unit): boolean;
    function hurt(classId: string | number | Unit, percent: number): boolean;
    function getScarinessLevel(unit: Unit): number;
    function clear(
      range?: number,
      spectype?: number,
      bossId?: number | Unit,
      sortfunc?: Function,
      pickit?: boolean,
    ): boolean;
    function clearClassids(...ids: number[]): boolean;
    function getMob(
      classid: number,
      spectype: number,
      range: number,
      center:
        | Unit
        | {
            x: number;
            y: number;
          },
    ): Monster[];
    function clearList(mainArg: Function | Unit[], sortFunc?: Function, refresh?: boolean): boolean;

    interface SecurePositionOptions {
      range?: number;
      timer?: number;
      skipBlocked?: boolean;
      useRedemption?: boolean;
      skipIds?: number[];
      /**
       * @default 300000 (5 minutes)
       * @description Timeout in milliseconds for attempting to secure area.
       */
      timeout?: number;
    }
    function securePosition(x: number, y: number, options: SecurePositionOptions): boolean;
    function countUniques(): void;
    function storeStatistics(area: number): void;
    function clearRoom(room: Room, spectype?: number): boolean;
    function clearLevel(spectype?: number): boolean;
    function sortMonsters(unitA: Unit, unitB: Unit): boolean;
    function validSpot(x: number, y: number, skill?: number, unitid?: number): boolean;
    /** @deprecated Use Misc.openChests instead */
    function openChests(range: number, x?: number, y?: number): boolean;
    function buildMonsterList(): [] | Monster[];
    function findSafeSpot(
      unit: Unit,
      distance: number,
      spread: number,
      range: number,
      ...args: any[]
    ): {
      x: number;
      y: number;
    };
    function deploy(unit: Monster, distance: any, spread: any, range: any, ...args: any[]): boolean;
    function getMonsterCount(x: any, y: any, range: any, list: any): number;
    function buildGrid(
      xmin: number,
      xmax: number,
      ymin: number,
      ymax: number,
      spread: number,
    ): {
      x: number;
      y: number;
      coll: number;
    }[];
    function skipCheck(unit: Monster): boolean;
    function getSkillElement(
      skillId: number,
    ): false | "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none";
    function getResist(
      unit: Monster,
      type: "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none",
    ): boolean;
    function getLowerResistPercent(): number;
    function getConvictionPercent(): number;
    function checkResist(unit: Monster, val: any, maxres?: number): boolean;
    function canAttack(unit: Monster): boolean;
    function usingBow(): false | "bow" | "crossbow";
    function getIntoPosition(unit: Monster, distance: any, coll: any, walk: any): boolean;
    function getNearestMonster(givenSettings?: {
      skipBlocked?: boolean;
      skipImmune?: boolean;
      skipGid?: number;
    }): Monster | false;
    function checkCorpse(unit: Monster): boolean;
    function checkNearCorpses(unit: Monster, range?: number): Monster[];
    function whirlwind(unit: Monster | Player): boolean;
    function doPreAttack(unit: Monster): AttackResult;
    function doChargeCast(unit: Monster): boolean;
  }
}
export {};
