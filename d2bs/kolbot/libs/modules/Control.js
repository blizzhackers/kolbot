/**
 * @description Some abstraction around the control functions.
 * @author Jaenster, theBGuy(added the rest of the controls)
 */
(function (module) {
  /**
   * Not callable as a function
   * @constructor
   * @method Control.click(targetx, targety)
   * @method Control.setText(text)
   * @method Control.getText(text)
   * @param {number} type
   * @param {number} x
   * @param {number} y
   * @param {number} xsize
   * @param {number} ysize
   */
  function Control (type, x, y, xsize, ysize) {
    /**
     * @private
     * @type {number}
     */
    this.type = type;

    /**
     * @private
     * @type {number}
     */
    this.x = x;

    /**
     * @private
     * @type {number}
     */
    this.y = y;

    /**
     * @private
     * @type {number}
     */
    this.xsize = xsize;

    /**
     * @private
     * @type {number}
     */
    this.ysize = ysize;

    return new Proxy(this, {
      get: function (target, p) {
        const passthroughFunc = ["click", "setText", "getText"];

        if (p === "valueOf") {
          return target;
        }

        const control = getControl(target.type, target.x, target.y, target.xsize, target.ysize);
        if (p === "control") {
          return control;
        }

        // Relay on old ControlAction functions
        if (passthroughFunc.indexOf(p) !== -1) {
          return (...args) => ControlAction[p]
            .apply(ControlAction, [target.type, target.x, target.y, target.xsize, target.ysize].concat(args));
        }

        // if control is found, and it's a property of the control
        if (typeof control === "object" && control && control.hasOwnProperty(p)) {
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

  // General Controls - Still non-exhaustive
  Control.BottomLeftExit = new Control(sdk.controls.Button, 33, 572, 128, 35);
  Control.BottomRightOk = new Control(sdk.controls.Button, 627, 572, 128, 35);
  Control.OkCentered = new Control(sdk.controls.Button, 351, 337, 96, 32);
  Control.OkCenteredText = new Control(sdk.controls.LabelBox, 268, 300, 264, 100);
  Control.EnterAccountName = new Control(sdk.controls.TextBox, 322, 342, 162, 19);
  Control.EnterAccountPassword = new Control(sdk.controls.TextBox, 322, 396, 162, 19);
  Control.PopupYes = new Control(sdk.controls.Button, 421, 337, 96, 32);
  Control.PopupNo = new Control(sdk.controls.Button, 281, 337, 96, 32);

  // Main Menu Controls
  {
    Control.SplashScreen = new Control(sdk.controls.TextBox, 0, 599, 800, 600);
    Control.D2SplashCopyright = new Control(sdk.controls.LabelBox, 100, 580, 600, 80);
    Control.MainMenuD2Version = new Control(sdk.controls.LabelBox, 0, 599, 200, 40);
    Control.MainMenuCredits = new Control(sdk.controls.Button, 264, 528, 135, 25);
    Control.MainMenuCinematics = new Control(sdk.controls.Button, 402, 528, 135, 25);
    Control.MainMenuExit = new Control(sdk.controls.Button, 264, 568, 272, 35);
    Control.SinglePlayer = new Control(-1, 264, 324, 272, 35);
    Control.BattleNet = new Control(-1, 264, 366, 272, 35);
    Control.Gateway = new Control(sdk.controls.Button, 264, 391, 272, 25);
    Control.OtherMultiplayer = new Control(-1, 264, 433, 272, 35);
  }

  // Login Menu Controls
  {
    Control.Login = new Control(-1, 264, 484, 272, 35);
    Control.LoginHeading = new Control(sdk.controls.LabelBox, 200, 350, 400, 100);
    Control.LoginErrorOk = new Control(sdk.controls.Button, 335, 412, 128, 35);
    Control.LoginCancelWait = new Control(sdk.controls.Button, 330, 416, 128, 35);
    Control.LoginCdKeyInUseBy = new Control(sdk.controls.LabelBox, 162, 270, 477, 50);
    Control.LoginLodKeyInUseBy = new Control(sdk.controls.LabelBox, 158, 310, 485, 40);
    Control.LoginInvalidCdKey = new Control(sdk.controls.LabelBox, 4, 162, 320, 477, 100);
    Control.LoginUnableToConnect = new Control(sdk.controls.LabelBox, 158, 220, 485, 40);
    Control.LoginErrorText = new Control(sdk.controls.LabelBox, 199, 377, 402, 140);
    Control.LoginAccountSettings = new Control(sdk.controls.Button, 264, 528, 272, 35);
    Control.UnableToConnectOk = new Control(sdk.controls.Button, 335, 450, 128, 35);
  }

  // Account Settings Menu Controls
  {
    Control.AccountSettingsLabel = new Control(sdk.controls.LabelBox, 0, 310, 800, 50);
    Control.ChangePassword = new Control(sdk.controls.Button, 264, 335, 272, 35);
    Control.GetNewPassword = new Control(sdk.controls.Button, 264, 420, 272, 35);
    Control.ChangeEmail = new Control(sdk.controls.Button, 264, 505, 272, 35);
  }

  // Change Password
  {
    Control.ChangePasswordAccount = new Control(sdk.controls.TextBox, 322, 342, 162, 19);
    Control.ChangePasswordCurrent = new Control(sdk.controls.TextBox, 322, 396, 162, 19);
    Control.ChangePasswordNew = new Control(sdk.controls.TextBox, 322, 450, 162, 19);
    Control.ChangePasswordConfirm = new Control(sdk.controls.TextBox, 322, 504, 162, 19);
  }

  // Get New Password
  {
    Control.GetNewPasswordAccount = new Control(sdk.controls.TextBox, 251, 422, 293, 19);
    Control.GetNewPasswordEmail = new Control(sdk.controls.TextBox, 251, 472, 293, 19);
  }

  // Change Email
  {
    Control.ChangeEmailAccount = new Control(sdk.controls.TextBox, 251, 397, 293, 19);
    Control.ChangeEmailCurrent = new Control(sdk.controls.TextBox, 251, 447, 293, 19);
    Control.ChangeEmailNew = new Control(sdk.controls.TextBox, 251, 497, 293, 19);
    Control.ChangeEmailConfirm = new Control(sdk.controls.TextBox, 251, 547, 293, 19);
  }

  // Other Multiplayer Menu Controls
  {
    Control.OpenBattleNet = new Control(-1, 264, 310, 272, 35);
    Control.TcpIp = new Control(-1, 264, 350, 272, 35);
    Control.OtherMultiplayerCancel = new Control(sdk.controls.Button, 264, 568, 272, 35);
  }

  // Gateway Menu Controls
  {
    Control.GatewayOk = new Control(sdk.controls.Button, 281, 538, 96, 32);
    Control.GatewayCancel = new Control(sdk.controls.Button, 436, 538, 96, 32);
  }

  // TCP/IP Menu Controls
  {
    Control.TcpIpHost = new Control(-1, 265, 206, 272, 35);
    Control.TcpIpJoin = new Control(-1, 265, 264, 272, 35);
    Control.TcpIpCancel = new Control(sdk.controls.Button, 39, 571, 128, 35);

    Control.IPAdress = new Control(-1, 300, 268, -1, -1);
    Control.IPAdressOk = new Control(-1, 421, 337, 96, 32);
  }

  // Create Account Menu Controls
  {
    Control.CreateNewAccount = new Control(sdk.controls.Button, 264, 572, 272, 35);
    Control.ConfirmPassword = new Control(sdk.controls.TextBox, 322, 450, 162, 19);
  }

  // Terms of Use Menu Controls
  {
    Control.TermsOfUseAgree = new Control(sdk.controls.Button, 525, 513, 128, 35);
    Control.TermsOfUseDisagree = new Control(sdk.controls.Button, 133, 513, 128, 35);

    Control.PleaseReadOk = new Control(sdk.controls.Button, 525, 513, 128, 35);
    Control.PleaseReadCancel = new Control(sdk.controls.Button, 133, 513, 128, 35);
  }

  // Email Menu Controls
  {
    Control.EmailSetEmail = new Control(sdk.controls.TextBox, 253, 342, 293, 19);
    Control.EmailVerifyEmail = new Control(sdk.controls.TextBox, 253, 396, 293, 19);
    Control.EmailRegister = new Control(sdk.controls.Button, 265, 527, 272, 35);
    Control.EmailDontRegister = new Control(sdk.controls.Button, 265, 572, 272, 35);
    Control.EmailDontRegisterContinue = new Control(sdk.controls.Button, 415, 412, 128, 35);
  }

  // Character Select Menu Controls
  {
    Control.CharSelectCreate = new Control(sdk.controls.Button, 33, 528, 168, 60);
    Control.CharSelectDelete = new Control(sdk.controls.Button, 433, 528, 168, 60);
    Control.CharSelectConvert = new Control(sdk.controls.Button, 233, 528, 168, 60);
    Control.CharSelectError = new Control(sdk.controls.LabelBox, 45, 318, 531, 140);
    Control.CharSelectCharInfo0 = new Control(sdk.controls.LabelBox, 37, 178, 200, 92);
    Control.CharSelectChar4 = new Control(sdk.controls.LabelBox, 237, 364, 72, 93);
    Control.CharSelectChar6 = new Control(sdk.controls.LabelBox, 237, 457, 72, 93);
    Control.CharSelectCurrentRealm = new Control(sdk.controls.LabelBox, 626, 100, 151, 44);
  }

  // Character Create Menu Controls
  {
    Control.CharCreateCharName = new Control(sdk.controls.TextBox, 318, 510, 157, 16);
    Control.CharCreateExpansion = new Control(sdk.controls.Button, 319, 540, 15, 16);
    Control.CharCreateLadder = new Control(sdk.controls.Button, 319, 580, 15, 16);
    Control.CharCreateHardcore = new Control(sdk.controls.Button, 319, 560, 15, 16);
    // these two are the same as popup yes/no, should they be kept seperate or merged?
    Control.CharCreateHCWarningOk = new Control(sdk.controls.Button, 421, 337, 96, 32);
    Control.CharCreateHCWarningCancel = new Control(sdk.controls.Button, 281, 337, 96, 32);
  }

  // Lobby Menu Controls
  {
    Control.LobbyCharacterInfo = new Control(sdk.controls.LabelBox, 143, 588, 230, 87);
    Control.LobbyEnterChat = new Control(sdk.controls.Button, 27, 480, 120, 20);
    Control.LobbyChat = new Control(sdk.controls.LabelBox, 28, 410, 354, 298);
    Control.LobbyServerDown = new Control(sdk.controls.LabelBox, 438, 300, 326, 150);
    Control.LobbyLadder = new Control(sdk.controls.Button, 614, 490, 80, 20);
    Control.LobbyHelp = new Control(sdk.controls.Button, 146, 480, 120, 20);
    Control.LobbyQuit = new Control(sdk.controls.Button, 693, 490, 80, 20);
  }

  // Ladder menu controls
  {
    Control.StandardLadder = new Control(sdk.controls.Button, 463, 188, 272, 32);
    Control.HardcoreLadder = new Control(sdk.controls.Button, 463, 238, 272, 32);
    Control.ExpansionLadder = new Control(sdk.controls.Button, 463, 288, 272, 32);
    Control.ExpansionHardcoreLadder = new Control(sdk.controls.Button, 463, 338, 272, 32);
    Control.LadderTab = new Control(sdk.controls.LabelBox, 421, 136, 350, 50);
    Control.LadderOverall = new Control(sdk.controls.LabelBox, 427, 157, 85, 29);
    Control.LadderAmazon = new Control(sdk.controls.LabelBox, 513, 157, 36, 29);
    Control.LadderSorceress = new Control(sdk.controls.LabelBox, 550, 157, 36, 29);
    Control.LadderNecromancer = new Control(sdk.controls.LabelBox, 587, 157, 36, 29);
    Control.LadderPaladin = new Control(sdk.controls.LabelBox, 624, 157, 36, 29);
    Control.LadderBarbarian = new Control(sdk.controls.LabelBox, 661, 157, 36, 29);
    Control.LadderDruid = new Control(sdk.controls.LabelBox, 698, 157, 36, 29);
    Control.LadderAssassin = new Control(sdk.controls.LabelBox, 735, 157, 36, 29);
    Control.LadderRank = new Control(sdk.controls.LabelBox, 434, 162, 217, 12);
    Control.LadderName = new Control(sdk.controls.LabelBox, 468, 162, 217, 12);
    Control.LadderClass = new Control(sdk.controls.LabelBox, 596, 162, 217, 12);
    Control.LadderLevel = new Control(sdk.controls.LabelBox, 640, 162, 217, 12);
    Control.LadderExperience = new Control(sdk.controls.LabelBox, 703, 162, 217, 12);
    Control.LadderList = new Control(sdk.controls.LabelBox, 434, 391, 313, 218);
    Control.LadderScrollDown = new Control(sdk.controls.ScrollBar, 756, 391, 10, 238);
  }

  // Join Game Menu Controls
  {
    Control.JoinGameWindow = new Control(sdk.controls.Button, 652, 469, 120, 20);
    Control.JoinGame = new Control(sdk.controls.Button, 594, 433, 172, 32);
    Control.JoinGameName = new Control(sdk.controls.TextBox, 432, 148, 155, 20);
    Control.JoinGamePass = new Control(sdk.controls.TextBox, 606, 148, 155, 20);
    Control.JoinGameList = new Control(sdk.controls.LabelBox, 432, 393, 160, 173);
    Control.JoinGameDetails = new Control(sdk.controls.LabelBox, 609, 393, 143, 194);
    Control.CancelJoinGame = new Control(sdk.controls.Button, 433, 433, 96, 32);
  }

  // Create Game Menu Controls
  {
    Control.CreateGameWindow = new Control(sdk.controls.Button, 533, 469, 120, 20);
    Control.CreateGame = new Control(sdk.controls.Button, 594, 433, 172, 32);
    Control.CreateGameName = new Control(sdk.controls.TextBox, 432, 162, 158, 20);
    Control.CreateGamePass = new Control(sdk.controls.TextBox, 432, 217, 158, 20);
    Control.CreateGameDescription = new Control(sdk.controls.TextBox, 432, 268, 333, 20);
    Control.CharacterDifferenceButton = new Control(sdk.controls.Button, 431, 341, 15, 16);
    Control.CharacterDifference = new Control(sdk.controls.TextBox, 657, 342, 27, 20);
    Control.MaxPlayerCount = new Control(sdk.controls.TextBox, 657, 308, 27, 20);
    Control.Normal = new Control(sdk.controls.Button, 430, 381, 16, 16);
    Control.Nightmare = new Control(sdk.controls.Button, 555, 381, 16, 16);
    Control.Hell = new Control(sdk.controls.Button, 698, 381, 16, 16);
    Control.CreateGameInLine = new Control(sdk.controls.LabelBox, 427, 234, 300, 100);
    Control.CancelCreateGame = new Control(sdk.controls.Button, 433, 433, 96, 32);
  }

  // Channel Menu Controls
  {
    Control.LobbyChannel = new Control(sdk.controls.Button, 535, 490, 80, 20);
    Control.LobbyChannelName = new Control(sdk.controls.LabelBox, 28, 138, 354, 60);
    Control.LobbyChannelText = new Control(sdk.controls.TextBox, 432, 162, 155, 20);
    Control.LobbyChannelOk = new Control(sdk.controls.Button, 671, 433, 96, 32);
    Control.LobbyChannelCancel = new Control(sdk.controls.Button, 433, 433, 96, 32);
    Control.LobbyChannelSend = new Control(sdk.controls.Button, 27, 470, 80, 20);
    Control.LobbyChannelWhisper = new Control(sdk.controls.Button, 107, 470, 80, 20);
    Control.LobbyChannelSquelch = new Control(sdk.controls.Button, 27, 490, 72, 20);
    Control.LobbyChannelUnsquelch = new Control(sdk.controls.Button, 99, 490, 96, 20);
    Control.LobbyChannelEmote = new Control(sdk.controls.Button, 195, 490, 72, 20);
    Control.LobbyChannelChar0 = new Control(sdk.controls.Button, 40, 591, 60, 100);
    Control.LobbyChannelChar1 = new Control(sdk.controls.Button, 100, 591, 60, 100);
    Control.LobbyChannelChar2 = new Control(sdk.controls.Button, 160, 591, 60, 100);
    Control.LobbyChannelChar3 = new Control(sdk.controls.Button, 220, 591, 60, 100);
    Control.LobbyChannelChar4 = new Control(sdk.controls.Button, 280, 591, 60, 100);
    Control.LobbyChannelChar5 = new Control(sdk.controls.Button, 340, 591, 60, 100);
    Control.LobbyChannelChar6 = new Control(sdk.controls.Button, 400, 591, 60, 100);
    Control.LobbyChannelChar7 = new Control(sdk.controls.Button, 460, 591, 60, 100);
    Control.LobbyChannelChar8 = new Control(sdk.controls.Button, 520, 591, 60, 100);
    Control.LobbyChannelChar9 = new Control(sdk.controls.Button, 580, 591, 60, 100);
    Control.LobbyChannelChar10 = new Control(sdk.controls.Button, 640, 591, 60, 100);
  }
  
  // Single Player Difficulty Controls
  {
    Control.HellSP = new Control(-1, 264, 383, 272, 35);
    Control.NightmareSP = new Control(-1, 264, 340, 272, 35);
    Control.NormalSP = new Control(-1, 264, 297, 272, 35);
  }

  module.exports = Control;
})(module);
