export {};
declare global {
  // Value shape of the global `AutoBuild` const in libs/core/Auto/AutoBuild.js (bound there via
  // JSDoc @type). Declaring the const here as well would collide: both files are global scripts.
  // Named `AutoBuildInstance` (not `AutoBuild`) because libs/SoloPlay/Core/AutoBuild.js declares
  // its own unrelated global also named `AutoBuild`, and libs/SoloPlay/globals.d.ts already has
  // an unrelated `Build.AutoBuildTemplate` member.
  interface AutoBuildInstance {
    /**
     * Prints to console when Config.AutoBuild.Verbose is set, and logs to file when
     * Config.AutoBuild.DebugMode is set. Only autobuildthread.js prints to console.
     */
    print(...args: unknown[]): void;

    /**
     * Includes the character's build template, wires up the level-up listener (all scripts
     * except autobuildthread.js), loads autobuildthread.js from default.dbj if needed, and
     * resynchronizes Config with all past AutoBuild updates.
     */
    initialize(): void;

    /**
     * Reapplies every build template Update() from the last-applied level up to me.charlvl,
     * resynchronizing this thread's Config object without altering the saved char config.
     */
    applyConfigUpdates(): void;
  }
}
