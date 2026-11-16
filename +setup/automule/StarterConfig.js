/**
*  @filename    StarterConfig.js
*  @author      theBGuy
*  @desc        Starter Configuration file for D2BotAutoMule system
*
*/

(function (module) {
  /**
   * @description D2BotAutoMule specific settings - for global settings see libs/starter/StarterConfig.js
   * @type {Partial<StarterConfig>}
   */
  const StarterConfig = {
    MinGameTime: 30, // Minimum game length in seconds. If a game is ended too soon, the rest of the time is waited in the lobby
    MaxGameTime: 60, // Maximum game length in minutes, only for continuous muling
    CreateGameDelay: 5, // Seconds to wait before creating a new game
    SwitchKeyDelay: 0, // Seconds to wait before switching a used/banned key or after realm down
    ExitToMenu: false, // Set to true to wait out restriction in main menu or false to wait in lobby.
    VersionErrorDelay: rand(15, 30), // Seconds to wait after 'unable to identify version' message
    MakeAccountOnFailure: true
  };

  module.exports = {
    StarterConfig: StarterConfig
  };
})(module);
