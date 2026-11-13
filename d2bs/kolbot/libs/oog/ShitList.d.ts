export {};
declare global {
  interface ShitListData {
    shitlist: string[];
  }

  // Value shape of the global `ShitList` const in ShitList.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Named `ShitListInstance` (not `ShitList`) because sdk/types/Config.d.ts already
  // declares a boolean `ShitList` member on `Config`, and reusing the name would confuse readers.
  interface ShitListInstance {
    _default: ShitListData;
    _path: string;
    _list: Set<string>;

    create(): ShitListData;
    reset(): ShitListData;
    getObj(): ShitListData;
    read(): string[];
    add(name: string): void;
    remove(name: string): boolean;
    has(name: string): boolean;
  }
}
