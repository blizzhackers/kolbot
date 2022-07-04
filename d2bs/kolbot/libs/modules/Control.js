/**
 * @description Some abstraction around the control functions.
 * @author Jaenster, theBGuy(added the rest of the controls)
 */
(function (module) {

	/**
     * @constructor - Not callable as a function
     *
     * @method Control.click(targetx, targety)
     * @method Control.setText(text)
     * @method Control.getText(text)
     */
	function Control(type, x, y, xsize, ysize) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.xsize = xsize;
		this.ysize = ysize;

		return new Proxy(this, {
			get: function (target, p) {
				const passthroughFunc = ['click', 'setText', 'getText'];

				if (p === 'valueOf') {
					return target;
				}

				const control = getControl(target.type, target.x, target.y, target.xsize, target.ysize);
				if (p === 'control') {
					return control;
				}

				// Relay on old ControlAction functions
				if (passthroughFunc.indexOf(p) !== -1) {
					return (...args) => ControlAction[p].apply(ControlAction, [target.type, target.x, target.y, target.xsize, target.ysize].concat(args));
				}

				// if control is found, and it's a property of the control
				if (typeof control === 'object' && control && control.hasOwnProperty(p)) {
					return control[p];
				}

				// The target has it
				if (target.hasOwnProperty(p)) {
					return target[p];
				}

				return null;
			}
		});

	}

	Control.SplashScreen = new Control(2, 0, 599, 800, 600);
	Control.D2SplashCopyright = new Control(4, 100, 580, 600, 80);
	Control.MainMenuD2Version = new Control(4, 0, 599, 200, 40);
	Control.MainMenuCredits = new Control(6, 264, 528, 135, 25);
	Control.MainMenuCinematics = new Control(6, 402, 528, 135, 25);
	Control.MainMenuExit = new Control(6, 264, 568, 272, 35);

	Control.SinglePlayer = new Control(-1, 264, 324, 272, 35);
	Control.BattleNet = new Control(-1, 264, 366, 272, 35);
	Control.Gateway = new Control(6, 264, 391, 272, 25);
	Control.OtherMultiplayer = new Control(-1, 264, 433, 272, 35);

	Control.Login = new Control(-1, 264, 484, 272, 35);
	Control.LoginHeading = new Control(4, 200, 350, 400, 100);
	Control.LoginUsername = new Control(-1, 322, 342, 162, 19);
	Control.LoginPassword = new Control(-1, 322, 396, 162, 19);
	Control.LoginErrorOk = new Control(6, 335, 412, 128, 35);
	Control.LoginCancelWait = new Control(6, 330, 416, 128, 35);
	Control.LoginInvalidCdKey = new Control(4, 162, 270, 477, 50);
	Control.LoginCdKeyInUseBy = new Control(4, 158, 310, 485, 40);
	Control.LoginUnableToConnect = new Control(4, 158, 220, 485, 40);
	Control.LoginErrorText = new Control(4, 199, 377, 402, 140);
	Control.LoginAccountSettings = new Control(6, 264, 528, 272, 35);
	Control.LoginExit = new Control(6, 33, 572, 128, 35);

	Control.UnableToConnectOk = new Control(6, 335, 450, 128, 35);
    
	Control.OpenBattleNet = new Control(-1, 264, 310, 272, 35);
	Control.TcpIp = new Control(-1, 264, 350, 272, 35);
	Control.OtherMultiplayerCancel = new Control(6, 264, 568, 272, 35);

	Control.GatewayOk = new Control(6, 281, 538, 96, 32);
	Control.GatewayCancel = new Control(6, 436, 538, 96, 32);

	Control.TcpIpHost = new Control(-1, 265, 206, 272, 35);
	Control.TcpIpJoin = new Control(-1, 265, 264, 272, 35);
	Control.TcpIpCancel = new Control(6, 39, 571, 128, 35);

	Control.IPAdress = new Control(-1, 300, 268, -1, -1);
	Control.IPAdressOk = new Control(-1, 421, 337, 96, 32);

	Control.CreateNewAccount = new Control(6, 264, 572, 272, 35);
	Control.CreateNewAccountName = new Control(1, 322, 342, 162, 19);
	Control.CreateNewAccountPassword = new Control(1, 322, 396, 162, 19);
	Control.CreateNewAccountConfirmPassword = new Control(1, 322, 450, 162, 19);
	Control.CreateNewAccountOk = new Control(6, 627, 572, 128, 35);
	Control.CreateNewAccountExit = new Control(6, 33, 572, 128, 35);

	Control.TermsOfUseAgree = new Control(6, 525, 513, 128, 35);
	Control.TermsOfUseDisagree = new Control(6, 133, 513, 128, 35);

	Control.PleaseReadOk = new Control(6, 525, 513, 128, 35);
	Control.PleaseReadCancel = new Control(6, 133, 513, 128, 35);

	Control.EmailSetEmail = new Control(1, 253, 342, 293, 19);
	Control.EmailVerifyEmail = new Control(1, 253, 396, 293, 19);
	Control.EmailRegister = new Control(6, 265, 527, 272, 35);
	Control.EmailDontRegister = new Control(6, 265, 572, 272, 35);
	Control.EmailDontRegisterContinue = new Control(6, 415, 412, 128, 35);

	Control.CharSelectCreate = new Control(6, 33, 528, 168, 60);
	Control.CharSelectExit = new Control(6, 33, 572, 128, 35);
	Control.CharSelectDelete = new Control(6, 433, 528, 168, 60);
	Control.CharSelectConvert = new Control(6, 233, 528, 168, 60);
	Control.CharDeleteYes = new Control(6, 421, 337, 96, 32);
	Control.CharSelectError = new Control(4, 45, 318, 531, 140);
	Control.CharSelectCharInfo0 = new Control(4, 37, 178, 200, 92);
	Control.CharSelectChar4 = new Control(4, 237, 364, 72, 93);
	Control.CharSelectChar6 = new Control(4, 237, 457, 72, 93);
	Control.CharSelectCurrentRealm = new Control(4, 626, 100, 151, 44);

	Control.CharCreateCharName = new Control(1, 318, 510, 157, 16);
	Control.CharCreateExpansion = new Control(6, 319, 540, 15, 16);
	Control.CharCreateLadder = new Control(6, 319, 580, 15, 16);
	Control.CharCreateHardcore = new Control(6, 319, 560, 15, 16);
	Control.CharCreateHCWarningOk = new Control(6, 421, 337, 96, 32);
	Control.CharCreateHCWarningCancel = new Control(6, 281, 337, 96, 32);

	Control.SinglePlayerNormal = new Control(-1, 264, 297, 272, 35);
	Control.SinglePlayerNightmare = new Control(-1, 264, 340, 272, 35);
	Control.SinglePlayerHell = new Control(-1, 264, 383, 272, 35);

	Control.LobbyCharacterInfo = new Control(4, 143, 588, 230, 87);
	Control.LobbyEnterChat = new Control(6, 27, 480, 120, 20);
	Control.LobbyLadder = new Control(6, 614, 490, 80, 20);
	Control.LobbyHelp = new Control(6, 146, 480, 120, 20);
	Control.LobbyQuit = new Control(6, 693, 490, 80, 20);

	Control.JoinGameWindow = new Control(6, 652, 469, 120, 20);
	Control.JoinGame = new Control(6, 594, 433, 172, 32);
	Control.JoinGameName = new Control(1, 432, 148, 155, 20);
	Control.JoinGamePass = new Control(1, 606, 148, 155, 20);
	Control.JoinGameList = new Control(4, 432, 393, 160, 173);
	Control.JoinGameDetails = new Control(4, 609, 393, 143, 194);
	Control.CancelJoinGame = new Control(6, 433, 433, 96, 32);

	Control.CreateGameWindow = new Control(6, 533, 469, 120, 20);
	Control.CreateGame = new Control(6, 594, 433, 172, 32);
	Control.CreateGameName = new Control(1, 432, 162, 158, 20);
	Control.CreateGamePass = new Control(1, 432, 217, 158, 20);
	Control.CharacterDifferenceButton = new Control(6, 431, 341, 15, 16);
	Control.CharacterDifference = new Control(1, 657, 342, 27, 20);
	Control.MaxPlayerCount = new Control(1, 657, 308, 27, 20);
	Control.Normal = new Control(6, 430, 381, 16, 16);
	Control.Nightmare = new Control(6, 555, 381, 16, 16);
	Control.Hell = new Control(6, 698, 381, 16, 16);
	Control.CreateGameInLine = new Control(4, 427, 234, 300, 100);
	Control.CancelCreateGame = new Control(6, 433, 433, 96, 32);

	Control.LobbyChannel = new Control(6, 535, 490, 80, 20);
	Control.LobbyChannelName = new Control(4, 28, 138, 354, 60);
	Control.LobbyChannelText = new Control(1, 432, 162, 155, 20);
	Control.LobbyChannelOk = new Control(6, 671, 433, 96, 32);
	Control.LobbyChannelCancel = new Control(6, 433, 433, 96, 32);
	Control.LobbyChannelSend = new Control(6, 27, 470, 80, 20);
	Control.LobbyChannelWhisper = new Control(6, 107, 470, 80, 20);
	Control.LobbyChannelSquelch = new Control(6, 27, 490, 72, 20);
	Control.LobbyChannelUnsquelch = new Control(6, 99, 490, 96, 20);
	Control.LobbyChannelEmote = new Control(6, 195, 490, 72, 20);
	Control.LobbyChannelChar0 = new Control(6, 40, 591, 60, 100);
	Control.LobbyChannelChar1 = new Control(6, 100, 591, 60, 100);
	Control.LobbyChannelChar2 = new Control(6, 160, 591, 60, 100);
	Control.LobbyChannelChar3 = new Control(6, 220, 591, 60, 100);
	Control.LobbyChannelChar4 = new Control(6, 280, 591, 60, 100);
	Control.LobbyChannelChar5 = new Control(6, 340, 591, 60, 100);
	Control.LobbyChannelChar6 = new Control(6, 400, 591, 60, 100);
	Control.LobbyChannelChar7 = new Control(6, 460, 591, 60, 100);
	Control.LobbyChannelChar8 = new Control(6, 520, 591, 60, 100);
	Control.LobbyChannelChar9 = new Control(6, 580, 591, 60, 100);
	Control.LobbyChannelChar10 = new Control(6, 640, 591, 60, 100);

	Control.LobbyChat = new Control(4, 28, 410, 354, 298);
	Control.LobbyServerDown = new Control(4, 438, 300, 326, 150);

	Control.OkCentered = new Control(6, 351, 337, 96, 32);
	Control.HellSP = new Control(-1, 264, 383, 272, 35);
	Control.NightmareSP = new Control(-1, 264, 340, 272, 35);
	Control.NormalSP = new Control(-1, 264, 297, 272, 35);

	module.exports = Control;
})(module);
