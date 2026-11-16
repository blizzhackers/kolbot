export {};

declare global {
  /**
   * A per-monster hook entry (instance of the closure-private MonsterHook constructor in MonsterHooks.js).
   */
  interface MonsterHookEntry {
    unit: Monster;
    hook: Text;
    update(): void;
  }

  // Value shape of the global `MonsterHooks` const in MonsterHooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface MonsterHooks {
    hooks: { [gid: number]: MonsterHookEntry };
    enabled: boolean;
    check(): void;
    remove(unit: Monster): boolean;
    flush(): void;
  }
}
