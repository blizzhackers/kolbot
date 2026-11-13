export {};

declare global {
  /**
   * Line/Text/Line triple produced by ItemHooks.newHook() for a single ground-item marker.
   */
  interface ItemHookParts {
    itemLoc: Line[];
    itemName: Text[];
    vector: Line[];
  }

  /**
   * An entry in ItemHooks.hooks tracking a single ground-item marker.
   */
  interface ItemHookEntry {
    item: ItemUnit;
    area: number;
    hook: Line[];
    name: Text[];
    vector: Line[];
  }

  // Value shape of the global `ItemHooks` const in ItemHooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface ItemHooks {
    enabled: boolean;
    pickitEnabled: boolean;
    hooks: ItemHookEntry[];

    check(): void;
    update(): void;
    getName(item: ItemUnit): string;
    newHook(item: ItemUnit): ItemHookParts;
    add(item: ItemUnit): void;
    getHook(item: ItemUnit): Line[] | false;
    remove(item: ItemUnit): boolean;
    flush(): void;
  }
}
