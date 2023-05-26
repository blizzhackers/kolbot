/**
*  @filename    MuleConfig.js
*  @author      theBGuy
*  @desc        Configuration profiles for AutoMule system, for TorchAnni specific @see TorchAnniMules.js
*
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
      charsPerAcc: 18, // Maximum number of mules to create per account (between 1 to 18)

      // Game name and password of the mule game. Never use the same game name as for mule logger.
      muleGameName: ["", ""], // ["gamename", "password"]

      // List of profiles that will mule items. Example: enabledProfiles: ["profile 1", "profile 2"],
      enabledProfiles: [""],

      // Stop a profile prior to muling. Useful when running 8 bots without proxies.
      stopProfile: "",
      stopProfileKeyRelease: false, // true = stopProfile key will get released on stop. useful when using 100% of your keys for botting.

      // Trigger muling at the end of a game if used space in stash and inventory is equal to or more than given percent.
      usedStashTrigger: 80,
      usedInventoryTrigger: 80,

      // Mule items that have been stashed at some point but are no longer in pickit.
      muleOrphans: true,
      // Continuous Mule settings
      continuousMule:	false, // Mule stays in game for continuous muling. muleProfile must be dedicated and started manually.
      skipMuleResponse: false, // Skip mule response check and attempt to join mule game. Useful if mule is shared and/or ran on different system.
      onlyLogWhenFull: false // Only log character when full, solves an issue with droppers attempting to use characters who are already in game
    },
  };
})(module);
