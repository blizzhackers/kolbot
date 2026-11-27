export {};

declare global {
  // A [stat, value] entry of AutoStat.statBuildOrder. `stat` accepts the numeric
  // sdk.stats id or one of its string aliases; `value` is a hard-point target, "all"
  // to spend the remainder, or "block" (dexterity only) to stat to AutoStat.block.
  type AutoStatBuildEntry = [
    number | "s" | "str" | "strength" | "e" | "enr" | "energy" | "d" | "dex" | "dexterity" | "v" | "vit" | "vitality",
    number | "all" | "block"
  ];

  // Value shape of the global `AutoStat` const in AutoStat.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface AutoStat {
    statBuildOrder: AutoStatBuildEntry[];
    save: number;
    block: number;
    bulkStat: boolean;
    remaining: number;
    count: number;
    getBlock(): number;
    verifySetStats(unit: ItemUnit, type: number, stats: number): boolean;
    validItem(item: ItemUnit): boolean;
    setBonus(type: number): number;
    getHardStats(type: number): number;
    requiredDex(): number;
    useStats(type: number, goal?: number | false): boolean;
    addStatPoint(): boolean;
    init(statBuildOrder: AutoStatBuildEntry[], save?: number, block?: number, bulkStat?: boolean): boolean;
  }
}
