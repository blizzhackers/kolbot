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
  /**
   * The TextHooks module
   */
  const TextHooks: {
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
  };
}
