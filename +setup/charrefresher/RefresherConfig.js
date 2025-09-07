/**
*  @filename    RefresherConfig.js
*  @author      theBGuy
*  @desc        Configuration file for CharRefresher system
*
*/

(function (module) {
  module.exports = {
    LobbyTime: [15, 30], // (30, 60) to if you want to be less likely to get disconnected in the lobby
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
    RefreshAccounts: {
      /* Format:
        "account1/password1/realm": ["charname1", "charname2 etc"],
        "account2/password2/realm": ["charnameX", "charnameY etc"],
        "account3/password3/realm": ["all"]

        To refresh a full account, put "account/password/realm": ["all"]

        realm = useast, uswest, europe or asia

        Enter Individual entries are separated with a comma below
      */
      "exampleAcc/pa33word3/realm": ["all"],
    },
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

    // D2BotCharRefresher specific settings - for global settings see libs/starter/StarterConfig.js
    StarterConfig: {
      // none needed right now
    }
  };
})(module);
