/**
*  @filename    TorchAnniMules.js
*  @author      theBGuy
*  @desc        Torch/Anni specific mule profiles for AutoMule system
*
*/

/**
 * @description Torch/Anni mules:
 * - Torch is muled in OrgTorch script after finishing uber Tristram successfully or when starting OrgTorch script with a Torch already on the character.
 * - Anni is muled after successfully killing Diablo in Palace Cellar level 3 using Config.KillDclone option or KillDClone script.
 * - If a profile is listed in Torch/Anni mule's enabledProfiles list, it will also do a check to mule Anni at the end of each game.
 * @note Anni that is in locked inventory slot will not be muled.
 * @note Each mule will hold either a Torch or an Anni, but not both. As soon as the current mule has either one, a new one will be created.
 */
(function (module) {
  module.exports = {
    "Mule1": {
      muleProfile: "", // The name of mule profile in d2bot#. It will be started and stopped when needed.
      accountPrefix: "", // Account prefix. Numbers added automatically when making accounts.
      accountPassword: "", // Account password.
      charPrefix: "", // Character prefix. Suffix added automatically when making characters.
      realm: "", // Available options: "useast", "uswest", "europe", "asia"
      expansion: true,
      ladder: true,
      hardcore: false,
      charsPerAcc: 8, // Maximum number of mules to create per account (between 1 to 18)

      // Game name and password of the mule game. Never use the same game name as for mule logger.
      muleGameName: ["", ""], // ["gamename", "password"]

      // List of profiles that will mule items. Example: enabledProfiles: ["profile 1", "profile 2"],
      enabledProfiles: [""],

      // Stop a profile prior to muling. Useful when running 8 bots without proxies.
      stopProfile: "",
      stopProfileKeyRelease: false, // true = stopProfile key will get released on stop. useful when using 100% of your keys for botting.

      // Continuous Mule settings
      continuousMule:	true, // Mule stays in game for continuous muling. muleProfile must be dedicated and started manually.
      skipMuleResponse: true, // Skip mule response check and attempt to join mule game. Useful if mule is shared and/or ran on different system.
      onlyLogWhenFull: true // Only log character when full, solves an issue with droppers attempting to use characters who are already in game
    },
  };
})(module);
