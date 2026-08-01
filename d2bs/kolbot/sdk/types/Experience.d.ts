export {};

declare global {
  // Value shape of the global `Experience` const in libs/core/Experience.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Experience {
    totalExp: number[];
    nextExp: number[];
    expCurve: number[];
    expPenalty: number[];
    monsterExp: [number, number, number][];
    /** Percent progress into the current level. Format: xx.xx% */
    progress(): number | string;
    /** Total experience gained in current run */
    gain(): number;
    /** Percent experience gained in current run */
    gainPercent(): number | string;
    /** Runs until next level */
    runsToLevel(): number;
    /** Total runs needed for next level (not counting current progress) */
    totalRunsToLevel(): number;
    /** Total time till next level */
    timeToLevel(): string;
    /** Get Game Time */
    getGameTime(): string;
    /** Log to manager */
    log(): void;
  }
}
