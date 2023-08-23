/**
*  @filename    ChannelConfig.js
*  @author      theBGuy
*  @desc        Configuration file for D2BotChannel system
*
*/

(function (module) {
  const ChannelConfig = {
    SkipMutedKey: true,
    MutedKeyTrigger: "Your account has had all chat privileges suspended.",
    JoinDelay: 10, // Seconds to wait between announcement and clicking join
    JoinRetry: 5, // Amount of times to re-attempt joining game
    // watch for whisper event instead?
    FriendListQuery: 0, // Seconds between "/f l" retries. 0 = disable. To prevent spamming when using set time rand(80, 160)
    /**
    * @typedef {Object} GameInfo
    * @property {string} game
    * @property {string} password
    *
    * @type {GameInfo[]}
    * @example
    * Games: [
    *   { game: "baal-", password: "" },
    * ],
    */
    Games: [
      { game: "", password: "" },
    ],
    /**
    * Leaders in game character name, only use this if the leader is using announce in the chat.
    * Can be an array or names ["somename", "somename2"]
    * @type {string[]}
    */
    Follow: [],
  };

  module.exports = {
    ChannelConfig: ChannelConfig,
  };
})(module);
