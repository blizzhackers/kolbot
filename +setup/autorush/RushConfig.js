/**
*  @filename    RushConfig.js
*  @author      theBGuy
*  @desc        Configuration file for AutoRush system
*
*/

(function (module) {
  // no touchy - need these imports
  const { RushModes } = require("./RushConstants");
  
  /**
   * This is what you edit.
   *
   * Each key is a profile name.
   * The value shape depends on the selected mode (`type`).
   *
   * Rushee modes:
   * - `RushModes.quester`
   * - `RushModes.follower`
   * - `RushModes.bumper`
   *
   * Rusher modes:
   * - `RushModes.rusher`
   * - `RushModes.manual`
   *
   * `create` usage variants:
   * - Account + character creation: provide `account`, `password`, `charName`, and `charInfo`.
   * - Character-only creation: provide only `charName` and `charInfo`. You can skip charName for automatic name generation (uses soloplay's NameGen if available, otherwise will error).
   *
   * Rusher config defaults:
   * - Quest toggles default to `true`.
   * - `Wps` defaults to `false`.
   * - You do not need to define every `config` property when you want default behavior.
   *
   * @example
   * // Quester with account + character creation
   * "quester-profile": {
   *   type: RushModes.quester,
   *   startProfiles: ["bumper-profile", "follower-profile", "rusher-profile"],
   *   create: {
   *     account: "myacc",
   *     password: "mypassword",
   *     charName: "quester",
   *     charInfo: "scl-sorc",
   *   },
   *   config: {
   *     Leader: "my-rusher-char",
   *   },
   * }
   *
   * @example
   * // Follower with character-only creation
   * "follower-profile": {
   *   type: RushModes.follower,
   *   leader: "quester-profile",
   *   create: {
   *     charName: "follower",
   *     charInfo: "scl-zon",
   *   },
   *   config: {
   *     Leader: "my-rusher-char",
   *   },
   * }
   *
   * @example
   * // Bumper with minimal config
   * "bumper-profile": {
   *   type: RushModes.bumper,
   *   leader: "quester-profile",
   *   config: {
   *     Leader: "my-rusher-char",
   *   },
   * }
   *
   * @example
   * // Rusher with minimal config (uses defaults)
   * "rusher-profile": {
   *   type: RushModes.rusher,
   *   leader: "quester-profile",
   *   config: {
   *     Wps: true,
   *     LastRun: "baal",
   *   },
   * }
   *
   * @example
   * // Rusher with explicit full config
   * "rusher-profile-full": {
   *   type: RushModes.rusher,
   *   leader: "quester-profile",
   *   playerWaitTimeout: Time.minutes(1),
   *   config: {
   *     WaitPlayerCount: 1,
   *     Cain: true,
   *     Radament: true,
   *     LamEsen: true,
   *     Izual: true,
   *     Shenk: true,
   *     Anya: true,
   *     Ancients: {
   *       Normal: true,
   *       Nightmare: true,
   *       Hell: false,
   *     },
   *     Wps: false,
   *     LastRun: "",
   *   },
   * }
   *
   * @example
   * // Manual mode (same config shape as rusher)
   * "manual-profile": {
   *   type: RushModes.manual,
   *   leader: "quester-profile",
   *   config: {
   *     Wps: true,
   *   },
   * }
   *
   * @type {Object.<string, DefaultConfig}>}
   */
  const RushConfig = {
    "quester-profile": {
      type: RushModes.quester,
      config: {
        Leader: "my-rusher-char",
      },
    }
  };

  module.exports = {
    RushConfig: RushConfig,
  };
})(module);
