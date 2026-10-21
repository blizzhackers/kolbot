/**
*  @filename    FollowConfig.js
*  @author      theBGuy
*  @desc        Configuration file for D2BotFollow system
*
*/

(function (module) {
  /**
   * @description D2BotFollow specific settings - for global settings see libs/starter/StarterConfig.js
   * @type {Partial<StarterConfig>}
   */
  const StarterConfig = {
    JoinRetryDelay: 5, // Time in seconds to wait before next join attempt
  };

  /**
   * @description Join game settings
   * - Format: "leader's profile": ["leecher 1 profile", "leecher 2 profile", ...]
   * - If you want everyone to join the same leader, use "leader's profile": ["all"]
   * - NOTE: Use *PROFILE* names (profile matches window title), NOT character/account names
   * - leader:leecher groups need to be divided by a comma
   * @example
   *  const JoinSettings = {
   *    "lead1": ["follow1", "follow2"],
   *    "lead2": ["follow3", "follow4"]
   *  };
   */
  const JoinSettings = {
    "Leader": ["Leecher"],
  };

  module.exports = {
    JoinSettings: JoinSettings,
    StarterConfig: StarterConfig,
  };
})(module);
