/**
*  @filename    PubJoinConfig.js
*  @author      theBGuy
*  @desc        Configuration file for D2BotPubJoin system
*
*/

(function (module) {
  /**
   * @description D2BotPubJoin specific settings - for global settings see libs/starter/StarterConfig.js
   * @type {Partial<StarterConfig>}
   */
  const StarterConfig = {
    MinGameTime: 0, // Minimum game length in seconds. If a game is ended too soon, the rest of the time is waited in the lobby
    ResetCount: 0, // Reset game count back to 1 every X games.
    JoinDelay: 10, // Seconds to wait between join attempts
    AttemptNextGame: true, // after joining a game, attempt incrementing game count and joining next game rather than looking for it in game list
    AttemptNextGameRetrys: 5,
    MinPlayers: 1, // Minimum players in game to join
  };
  
  /**
   * @description includeFilter format
   * @example <caption>Multiple entries in the same array mean AND</caption>
   *  // game has to contain "baal" and "-"
   *  const includeFilter = ["baal", "-"];
   * 
   * @example <caption>Multiple entries in different arrays mean OR</caption>
   *  // will join games with either "baal" or "diablo" in their name
   *  const includeFilter = [
   *    ["baal"],
   *    ["diablo"]
   *  ];
   * @type {Array<Array<string>>}
   */
  const includeFilter = [
    [""]
  ];

  /**
   * @description excludeFilter format
   * @example <caption>Multiple entries in the same array mean AND</caption>
   *  // ignores games that contain "baal" and "-"
   *  const includeFilter = ["baal", "-"];
   * 
   * @example <caption>Multiple entries in different arrays mean OR</caption>
   *  // will ignore games with either "baal" or "diablo" in their name
   *  const includeFilter = [
   *    ["baal"],
   *    ["diablo"]
   *  ];
   * @type {Array<Array<string>>}
   */
  const excludeFilter = [
    [""]
  ];

  /**
   * @type {Record<string, { includeFilter?: Array<Array<string>>, excludeFilter?: Array<Array<string>>}>}
   */
  const profileOverides = {
    // "test": {
    //   includeFilter: [["trist"], ["tombs"]]
    // }
  };

  module.exports = {
    includeFilter: includeFilter,
    excludeFilter: excludeFilter,
    profileOverides: profileOverides,
    StarterConfig: StarterConfig
  };
})(module);
