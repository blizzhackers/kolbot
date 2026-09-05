/**
*  @filename    LeadConfig.js
*  @author      theBGuy
*  @desc        Configuration file for D2BotLead system
*
*/

(function (module) {
  /**
   * @description D2BotLead specific settings - for global settings see libs/starter/StarterConfig.js
   * @type {Partial<StarterConfig>}
   */
  const StarterConfig = {
    MinGameTime: 360, // Minimum game length in seconds. If a game is ended too soon, the rest of the time is waited in the lobby
  };

  module.exports = {
    StarterConfig: StarterConfig,
  };
})(module);
