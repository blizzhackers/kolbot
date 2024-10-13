export {};
declare global {
  type PickitResult = {
      UNID: -1,
      UNWANTED: 0,
      WANTED: 1,
      CUBING: 2,
      RUNEWORD: 3,
      TRASH: 4,
      CRAFTING: 5,
      UTILITY: 6
  };
  namespace Pickit {
    const gidList: number[];
    let invoLocked: boolean;
    let beltSize: 1 | 2 | 3 | 4;
    const ignoreLog: number[]; // Ignored item types for item logging
    const Result: PickitResult;
    const tkable: number[];
    const essentials: number[];

    function init(notify: any): void;
    function itemEvent(gid?: number, mode?: number, code?: number, global?: number): void;
    function sortItems(unitA: Unit, unitB: Unit): number;
    function sortFastPickItems(unitA: Unit, unitB: Unit): number;
    function checkBelt(): boolean;
    function canPick(unit: ItemUnit): boolean;
    function checkItem(unit: ItemUnit): { result: PickitResult, line: null | number };
    function pickItem(
      unit: ItemUnit,
      status?: PickitResult,
      keptLine?: any, retry?: number
    ): { result: PickitResult, line: string | null };
    function canMakeRoom(): boolean;
    function pickItems(range?: number): boolean;
    function fastPick(): boolean;
  }
}
