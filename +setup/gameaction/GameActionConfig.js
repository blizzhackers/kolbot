/**
*  @filename    GameActionConfig.js
*  @author      theBGuy
*  @desc        Configuration file for GameAction system
*
*/

(function (module) {
  module.exports = {
    LogNames: true, // Put account/character name on the picture
    LogItemLevel: true, // Add item level to the picture
    LogEquipped: false, // include equipped items
    LogMerc: false, // include items merc has equipped (if alive)
    SaveScreenShot: false, // Save pictures in jpg format (saved in 'Images' folder)
    IngameTime: 60, // Time to wait before leaving game

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    /**
     * @description D2BotGameAction specific settings - for global settings see libs/starter/StarterConfig.js
     * @type {Partial<StarterConfig>}
     */
    StarterConfig: {
      MinGameTime: 0, // Minimum game length in seconds. If a game is ended too soon, the rest of the time is waited in the lobby
      CreateGameDelay: 5, // Seconds to wait before creating a new game
      SwitchKeyDelay: 0, // Seconds to wait before switching a used/banned key or after realm down
    },
  };
})(module);
