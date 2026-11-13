export {};

declare global {
  /**
   * An action to perform when a hook is triggered, e.g. open a chest/portal or use/take a portal.
   */
  interface ActionHookAction {
    do: string;
    id?: number;
  }

  /**
   * An entry in the ActionHooks `hooks`/`portals`/`frame` arrays.
   */
  interface ActionHookEntry {
    name: string;
    type?: string;
    dest?: number | { x: number; y: number };
    action?: ActionHookAction;
    hook: Hook;
  }

  // Value shape of the global `ActionHooks` const in ActionHooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface ActionHooks {
    enabled: boolean;
    hooks: ActionHookEntry[];
    portals: ActionHookEntry[];
    frame: ActionHookEntry[];
    action: number | null;
    currArea: number;
    prevAreas: number[];

    /**
     * Record a key press to be processed on the next `checkAction` call.
     */
    event(keycode: number): void;

    /**
     * Process the last recorded key press, dispatching the matching hook or action.
     */
    checkAction(): void;

    /**
     * Poll for area changes and uber-portal availability, refreshing hooks as needed.
     */
    check(): void;

    /**
     * Y coordinate for the next hook, stacked above the previously added ones.
     */
    yHookLoc(): number;

    /**
     * Build the hook set (side areas, POIs, waypoint, prev/next area) for the given area.
     */
    add(area: number): void;

    getHook(name: string): ActionHookEntry | false;
    getPortalHook(name: string): ActionHookEntry | false;
    flush(): void;
  }
}
