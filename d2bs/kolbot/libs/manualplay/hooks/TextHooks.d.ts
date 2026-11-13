/**
 * An entry in the hook arrays
 */
export interface HookEntry {
  name: string;
  hook: Hook;
  dest?: number;
  type?: string;
}

declare global {
  // Value shape of the global `TextHooks` const in TextHooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Ambient value declaration (Skill/Attack/Misc precedent): the checker leaves some
  // @type-bound js consts unresolved or any (cause undiagnosed); the ambient const
  // restores resolution and empirically does not collide with the js declaration.
  const TextHooks: TextHooks;

  interface TextHooks {
    events: typeof import("../../modules/Events");
    enabled: boolean;
    displayTitle: boolean;
    displaySettings: boolean;
    frameworkDisplayed: boolean;
    frameYSizeScale: number;
    frameYLocScale: number;
    settingsModifer: number;
    dashBoardWidthScale: number;
    statusFrameYSize: number;
    qolFrameYSize: number;
    /** Set on area change (in the `qolBoard` special case); absent before the first area change. */
    lastAct?: number;
    statusHooks: HookEntry[];
    dashBoard: HookEntry[];
    qolHooks: HookEntry[];
    hooks: HookEntry[];

    /**
     * Check and update the hooks
     */
    check(): void;

    /**
     * Update a hook's text or add it if it doesn't exist
     * @param name - The hook identifier
     * @param hookArr - The array containing the hooks
     * @param text - The text to update
     */
    updateHook(name: string, hookArr: HookEntry[], text: string): void;

    /**
     * Add a hook to the specified array
     * @param name - The hook identifier
     * @param hookArr - The array to add the hook to
     * @returns Whether the hook was added
     */
    add(name: string, hookArr: HookEntry[]): boolean;

    /**
     * Find a hook in the specified array
     * @param name - The hook identifier
     * @param hookArr - The array to search in
     * @returns The found hook entry or false if not found
     */
    getHook(name: string, hookArr: HookEntry[]): HookEntry | boolean;

    /**
     * Remove all hooks
     */
    flush(): void;
  }
}
