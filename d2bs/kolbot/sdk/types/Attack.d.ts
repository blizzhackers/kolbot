export {};
declare global {
  interface AttackResult {
    FAILED: 0,
    SUCCESS: 1,
    CANTATTACK: 2, // need to fix the ambiguity between this result and Failed
    NEEDMANA: 3
  }
  namespace Attack {
    const infinity: boolean;
    const auradin: boolean;
    const monsterObjects: number[];
    const Result: AttackResult;
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
    function clear(range?: number, spectype?: number, bossId?: number | Unit, sortfunc?: Function, pickit?: boolean): boolean;
    function clearClassids(...ids: number[]): boolean;
    function getMob(classid: number, spectype: number, range: number, center: Unit | {
      x: number;
      y: number;
    }): Monster[];
    function clearList(mainArg: Function | Unit[], sortFunc?: Function, refresh?: boolean): boolean;
    function securePosition(x: number, y: number, range?: number, timer?: number, skipBlocked?: boolean, special?: boolean): void;
    function markRoom(room: Room, color: number): void;
    function countUniques(): void;
    function storeStatistics(area: number): void;
    function clearLevel(spectype?: number): boolean;
    function sortMonsters(unitA: Unit, unitB: Unit): boolean;
    function validSpot(x: number, y: number, skill?: number, unitid?: number): boolean;
    function openChests(range: number, x?: number, y?: number): boolean;
    function buildMonsterList(): [] | Monster[];
    function findSafeSpot(unit: Unit, distance: number, spread: number, range: number, ...args: any[]): {
      x: number;
      y: number;
    };
    function deploy(unit: Monster, distance: any, spread: any, range: any, ...args: any[]): boolean;
    function getMonsterCount(x: any, y: any, range: any, list: any): number;
    function buildGrid(xmin: any, xmax: any, ymin: any, ymax: any, spread: any): {
      x: any;
      y: any;
      coll: number;
    }[];
    function skipCheck(unit: Monster): boolean;
    function getSkillElement(skillId: number): false | "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none";
    function getResist(unit: Monster, type: "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none"): boolean;
    function getLowerResistPercent(): number;
    function getConvictionPercent(): number;
    function checkResist(unit: Monster, val: any, maxres?: number): boolean;
    function canAttack(unit: Monster): boolean;
    function usingBow(): false | "bow" | "crossbow";
    function getIntoPosition(unit: Monster, distance: any, coll: any, walk: any): boolean;
    function getNearestMonster(givenSettings?: {}): any;
    function checkCorpse(unit: Monster): boolean;
    function checkNearCorpses(unit: Monster, range?: number): any;
    function whirlwind(unit: Monster | Player): boolean;
  }
}
