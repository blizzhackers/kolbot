export {};

declare global {
  /**
   * An entry in ShrineHooks.hooks tracking a single inactive-shrine marker.
   */
  interface ShrineHookEntry {
    shrine: ObjectUnit;
    hook: Text | null;
  }

  // Value shape of the global `ShrineHooks` const in ShrineHooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface ShrineHooks {
    enabled: boolean;
    hooks: ShrineHookEntry[];
    shrines: Map<number, string>;
    check(): void;
    newHook(shrine: ObjectUnit): Text | null;
    add(shrine: ObjectUnit): void;
    getHook(shrine: ObjectUnit): Text | null | false;
    remove(shrine: ObjectUnit): boolean;
    flush(): void;
  }
}
