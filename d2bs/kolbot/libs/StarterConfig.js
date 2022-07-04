/**
*  @filename    StarterConfig.js
*  @author      theBGuy
*  @desc        Global settings for entry scripts
*
*/
!isIncluded("OOG.js") && include("OOG.js");

Starter.Config = {
	MinGameTime: 360, // Minimum game length in seconds. If a game is ended too soon, the rest of the time is waited in the lobby
	PingQuitDelay: 30, // Time in seconds to wait in lobby after quitting due to high ping
	CreateGameDelay: rand(5, 15), // Seconds to wait before creating a new game
	ResetCount: 999, // Reset game count back to 1 every X games.
	CharacterDifference: 99, // Character level difference. Set to false to disable character difference.
	MaxPlayerCount: 8, // Max amount of players in game between 1 and 8
	StopOnDeadHardcore: true, // Stop profile character has died on hardcore mode

	// ChannelConfig can override these options for individual profiles.
	JoinChannel: "", // Default channel.
	FirstJoinMessage: "", // Default join message. Can be an array of messages
	ChatActionsDelay: 2, // Seconds to wait in lobby before entering a channel
	AnnounceGames: false, // Default value
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

// Advanced config - you don't have to edit this unless you need some of the features provided
const AdvancedConfig = {
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
