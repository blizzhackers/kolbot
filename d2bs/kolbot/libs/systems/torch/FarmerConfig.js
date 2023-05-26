/**
*  @filename    FarmerConfig.js
*  @author      theBGuy
*  @desc        Configuration file for TorchSystem system
*
*/

(function (module) {
  module.exports = {
    // ############################ S E T U P ##########################################

    /* Each uber killer profile can have their own army of key finders
      Multiple entries are separated with a comma
      Example config:

      "Farmer 1": { // Farmer profile name
        // Put key finder profiles here. Example - KeyFinderProfiles: ["MF 1", "MF 2"],
        KeyFinderProfiles: ["mf 1", "mf 2"],

        // Put the game name of uber killer here (without numbers). Key finders will join this game to drop keys. Example - FarmGame: "Ubers-",
        FarmGame: "torch1-"
      },

      "Farmer 2": { // Farmer profile name
        // Put key finder profiles here. Example - KeyFinderProfiles: ["MF 1", "MF 2"],
        KeyFinderProfiles: ["mf 3", "mf 4"],

        // Put the game name of uber killer here (without numbers). Key finders will join this game to drop keys. Example - FarmGame: "Ubers-",
        FarmGame: "torch2-"
      }
    */

    // Edit here!

    "PROFILE NAME": { // Farmer profile name
      // Put key finder profiles here. Example - KeyFinderProfiles: ["MF 1", "MF 2"],
      KeyFinderProfiles: [""],

      // Put the game name of uber killer here (without numbers). Key finders will join this game to drop keys. Example - FarmGame: "Ubers-",
      FarmGame: ""
    },

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  };
})(module);
