export {};

declare global {
  /**
   * A point of interest returned by `VectorHooks.getPOI()`: quest chest, boss, or other notable spot.
   */
  interface VectorHooksPOI {
    name: string;
    x: number;
    y: number;
    action?: { do: string; id?: number };
  }

  // Value shape of the global `VectorHooks` const in VectorHooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface VectorHooks {
    enabled: boolean;
    currArea: number;
    lastLoc: { x: number; y: number };
    names: Text[];
    hooks: Line[];

    /**
     * Redraw the exit vectors/labels on area change, or reposition them as the player moves.
     */
    check(): void;

    /**
     * Reposition all vector lines to originate from the player's current location.
     */
    update(): void;

    flush(): void;

    /**
     * Find the current area's waypoint object, if any.
     */
    getWP(): { id: number; area: number; x: number; y: number } | false;

    /**
     * Find the current area's point of interest (quest chest, boss, etc.), if any.
     */
    getPOI(): VectorHooksPOI | false;
  }
}
