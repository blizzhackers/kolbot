/**
*  @filename    StarterConfig.js
*  @author      theBGuy
*  @desc        Global settings for entry scripts
*  @note        For profile specific settings and overrides @see AdvancedConfig.js
*
*/

(function (module) {
  module.exports = {
    MinGameTime: 360, // Minimum game length in seconds. If a game is ended too soon, the rest of the time is waited in the lobby
    PingQuitDelay: 30, // Time in seconds to wait in lobby after quitting due to high ping
    CreateGameDelay: rand(5, 15), // Seconds to wait before creating a new game
    ResetCount: 999, // Reset game count back to 1 every X games.
    CharacterDifference: 99, // Character level difference. Set to false to disable character difference.
    MaxPlayerCount: 8, // Max amount of players in game between 1 and 8
    GameDescription: "", // Game description when creating a game
    StopOnDeadHardcore: true, // Stop profile character has died on hardcore mode

    // ChannelConfig can override these options for individual profiles.
    JoinChannel: "", // Default channel.
    FirstJoinMessage: "", // Default join message. Can be an array of messages
    ChatActionsDelay: 2, // Seconds to wait in lobby before entering a channel
    AnnounceGames: false, // Default value
    AnnounceMessage: "", // Message to announce before making game
    AfterGameMessage: "", // Default message after a finished game. Can be an array of messages

    InvalidPasswordDelay: 10, // Minutes to wait after getting Invalid Password message
    VersionErrorDelay: rand(5, 30), // Seconds to wait after 'unable to identify version' message
    SwitchKeyDelay: 5, // Seconds to wait before switching a used/banned key or after realm down
    CrashDelay: rand(120, 150), // Seconds to wait after a d2 window crash
    FTJDelay: 120, // Seconds to wait after failing to create a game
    RealmDownDelay: 3, // Minutes to wait after getting Realm Down message
    UnableToConnectDelay: 5, // Minutes to wait after Unable To Connect message
    TCPIPNoHostDelay: 5, // Seconds to wait after Cannot Connect To Server message
    CDKeyInUseDelay: 5, // Minutes to wait before connecting again if CD-Key is in use.
    ConnectingTimeout: 60, // Seconds to wait before cancelling the 'Connecting...' screen
    PleaseWaitTimeout: 60, // Seconds to wait before cancelling the 'Please Wait...' screen
    WaitInLineTimeout: 3600, // Seconds to wait before cancelling the 'Waiting in Line...' screen
    WaitOutQueueRestriction: true, // Wait out queue if we are restricted, queue time > 10000
    WaitOutQueueExitToMenu: false, // Wait out queue restriction at D2 Splash screen if true, else wait out in lobby
    GameDoesNotExistTimeout: 30, // Seconds to wait before cancelling the 'Game does not exist.' screen
  };
})(module);
