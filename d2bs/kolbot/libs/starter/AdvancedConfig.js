/**
*  @filename    AdvancedConfig.js
*  @author      theBGuy
*  @desc        Profile specific settings for entry scripts.
*  @note        For general and global settings @see StarterConfig.js
*
*/

(function (module) {
  module.exports = {
    /* Features:
    Override channel for each profile, Override join delay for each profile
    Override default values for JoinChannel, FirstJoinMessage, AnnounceGames and AfterGameMessage per profile

    * Format *:
      "Profile Name": {JoinDelay: number_of_seconds}
    or
      "Profile Name": {JoinChannel: "channel name"}
    or
      "Profile Name": {JoinChannel: "channel name", JoinDelay: number_of_seconds}

    * Example * (don't edit this - it's just an example):

      "MyProfile1": {JoinDelay: 3},
      "MyProfile2": {JoinChannel: "some channel"},
      "MyProfile3": {JoinChannel: "some other channel", JoinDelay: 11}
      "MyProfile4": {AnnounceGames: true, AnnounceMessage: "Joining game"} // announce game you are joining

      "Profile Name": {
        JoinChannel: "channel name",
        FirstJoinMessage: "first message", -OR- ["join msg 1", "join msg 2"],
        AnnounceGames: true,
        AfterGameMessage: "message after a finished run" -OR- ["msg 1", msg 2"]
      }
    */
    
    // Put your lines under this one. Multiple entries are separated by commas. No comma after the last one.

    "Test": {
      JoinChannel: "op nnqry",
      JoinDelay: 3,
      AnnounceGames: true,
      AnnounceMessage: "Joining game" // output: Joining game Baals-23
    },
  };
})(module);
