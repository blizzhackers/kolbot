export {};
declare global {
  interface PickitResultMap {
    UNID: -1;
    UNWANTED: 0;
    WANTED: 1;
    CUBING: 2;
    RUNEWORD: 3;
    TRASH: 4;
    CRAFTING: 5;
    UTILITY: 6;
  }
  /** A single pickit verdict (one value out of PickitResultMap), e.g. the value of Pickit.Result.WANTED. */
  type PickitResult = PickitResultMap[keyof PickitResultMap];

  // Value shape of the global `Pickit` const in Pickit.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Ambient value declaration - load-bearing, not decoration: top-level `Pickit.member = ...`
  // assignments elsewhere in the tree turn the js const into an expando/module symbol whose
  // members all widen to any (hover shows "module Pickit"). Declaring the const pins the
  // interface as the authority. Re-add if it ever disappears; see tools/audit/type-surface.mjs.
  const Pickit: Pickit;

  interface Pickit {
    enabled: boolean;
    gidList: Set<number>;
    invoLocked: boolean;
    beltSize: 1 | 2 | 3 | 4;
    /** Ignored item types for item logging */
    ignoreLog: number[];
    Result: PickitResultMap;
    tkable: number[];
    essentials: number[];
    systemKeep: { reason: string, gid: number }[];
    pickList: ItemUnit[];
    ignoreList: Set<number>;
    track: { lastItem: number | null };

    init(notify: boolean): void;
    itemEvent(gid?: number, mode?: number, code?: number, global?: number): void;
    sortItems(unitA: ItemUnit, unitB: ItemUnit): number;
    sortFastPickItems(unitA: ItemUnit, unitB: ItemUnit): number;
    checkBelt(): boolean;
    canPick(unit: ItemUnit): boolean;
    checkItem(unit: ItemUnit): { result: PickitResult, line: string | null };
    pickItem(
      unit: ItemUnit,
      status?: PickitResult,
      keptLine?: string,
      retry?: number
    ): boolean;
    canMakeRoom(): boolean;
    pickItems(range?: number): boolean;
    fastPick(retry?: number): boolean;
  }
}
