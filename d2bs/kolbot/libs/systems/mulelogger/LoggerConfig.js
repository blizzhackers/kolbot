/**
*  @filename    LoggerConfig.js
*  @author      theBGuy
*  @desc        Configuration file for MuleLogger system
*
*/

(function (module) {
  module.exports = {
    LogGame: ["", ""], // ["gamename", "password"]
    LogNames: true, // Put account/character name on the picture
    LogItemLevel: true, // Add item level to the picture
    LogEquipped: true, // include equipped items
    LogMerc: true, // include items merc has equipped (if alive)
    SaveScreenShot: false, // Save pictures in jpg format (saved in 'Images' folder)
    AutoPerm: true, // override InGameTime to perm character
    IngameTime: rand(60, 120), // (180, 210) to avoid RD, increase it to (7230, 7290) for mule perming
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    LogAccounts: {
      /* Format:
        "account1/password1/realm": ["charname1", "charname2 etc"],
        "account2/password2/realm": ["charnameX", "charnameY etc"],
        "account3/password3/realm": ["all"]

        To log a full account, put "account/password/realm": ["all"]

        realm = useast, uswest, europe or asia

        Enter Individual entries are separated with a comma below
      */
      "exampleAcc/pa33word3/realm": ["all"],
    },
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  };
})(module);
