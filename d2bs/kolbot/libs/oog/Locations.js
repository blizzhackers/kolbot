/**
*  @filename    Locations.js
*  @author      theBGuy
*  @desc        Map of the out of game locations
*
*/

(function (module) {
  const Controls = require("../modules/Control");
  /**
   * @param {Control} control
   * @returns {string}
   */
  const parseControlText = function (control) {
    if (!control) return "";
    let text = control.getText();
    if (!text || !text.length) return "";
    return text.join(" ");
  };
  /**
   * @param {number[]} locations 
   * @param {(location?: number) => any} action 
   */
  const addLocations = function (locations, action) {
    locations.forEach(function (loc) {
      _loc.set(loc, action);
    });
  };
  const pType = Profile().type;
  /**
   * Default locations written as if bot is running d2botlead
   */
  const _loc = new Map([
    [sdk.game.locations.GatewaySelect,
      function () {
        Controls.GatewayCancel.click();
      }
    ],
    [sdk.game.locations.OtherMultiplayer,
      function () {
        const pType = Profile().type;
        if ([sdk.game.profiletype.TcpIpHost, sdk.game.profiletype.TcpIpJoin].includes(pType)) {
          if (Controls.TcpIp.click()) {
            pType === sdk.game.profiletype.TcpIpHost
              ? Controls.TcpIpHost.click()
              : Controls.TcpIpJoin.click();
          }
        } else if (pType === sdk.game.profiletype.OpenBattlenet) {
          Controls.OpenBattleNet.click();
        } else {
          Controls.OtherMultiplayerCancel.click();
        }
      }
    ],
    [sdk.game.locations.TcpIpEnterIp,
      function () {
        Controls.PopupNo.click();
      }
    ],
    [sdk.game.locations.MainMenu,
      function () {
        switch (pType) {
        case sdk.game.profiletype.OpenBattlenet:
        case sdk.game.profiletype.TcpIpHost:
        case sdk.game.profiletype.TcpIpJoin:
          Controls.OtherMultiplayer.click();

          break;
        case sdk.game.profiletype.Battlenet:
          ControlAction.clickRealm(ControlAction.realms[Starter.profileInfo.realm]);
          Controls.BattleNet.click();
          Starter.firstLogin && (Starter.firstLogin = false);

          break;
        case sdk.game.profiletype.SinglePlayer:
        default:
          Controls.SinglePlayer.click();

          break;
        }
      }
    ],
    [sdk.game.locations.MainMenuConnecting,
      function (location) {
        if (!Starter.locationTimeout(Starter.Config.ConnectingTimeout * 1e3, location)) {
          Controls.LoginCancelWait.click();
        }
      }
    ],
    [sdk.game.locations.OkCenteredErrorPopUp,
      function () {
        Controls.OkCentered.click();
        Controls.BottomLeftExit.click();
      }
    ],
    [sdk.game.locations.CharSelectNoChars,
      function () {
        Starter.LocationEvents.charSelectError();
      }
    ],
    [sdk.game.locations.CharSelectConnecting,
      function () {
        Starter.LocationEvents.charSelectError();
      }
    ],
    [sdk.game.locations.CharSelectPleaseWait,
      function (location) {
        if (!Starter.locationTimeout(Starter.Config.PleaseWaitTimeout * 1e3, location)) {
          Controls.OkCentered.click();
        }
      }
    ],
    [sdk.game.locations.SelectDifficultySP,
      function () {
        Starter.LocationEvents.selectDifficultySP();
      }
    ],
    [sdk.game.locations.RealmDown,
      function () {
        Starter.LocationEvents.realmDown();
      }
    ],
    [sdk.game.locations.GameNameExists,
      function () {
        Controls.CreateGameWindow.click();
        Starter.gameCount += 1;
        Starter.lastGameStatus = "ready";
      }
    ],
    [sdk.game.locations.GameDoesNotExist,
      function () {
        Starter.LocationEvents.gameDoesNotExist();
      }
    ],
    [sdk.game.locations.CreateGame,
      function (location) {
        D2Bot.updateStatus("Creating Game");

        if (typeof Starter.Config.CharacterDifference === "number") {
          if (Controls.CharacterDifference.disabled === sdk.game.controls.Disabled) {
            Controls.CharacterDifferenceButton.click();
          }
          Controls.CharacterDifference.setText(Starter.Config.CharacterDifference.toString());
        } else if (!Starter.Config.CharacterDifference && Controls.CharacterDifference.disabled === 5) {
          Controls.CharacterDifferenceButton.click();
        }

        if (typeof Starter.Config.MaxPlayerCount === "number") {
          Controls.MaxPlayerCount.setText(Starter.Config.MaxPlayerCount.toString());
        }

        // Get game name if there is none
        while (!Starter.gameInfo.gameName) {
          D2Bot.requestGameInfo();
          delay(500);
        }

        // FTJ handler
        if (Starter.lastGameStatus === "pending") {
          Starter.isUp = "no";
          D2Bot.printToConsole("Failed to create game");
          ControlAction.timeoutDelay("FTJ delay", Starter.Config.FTJDelay * 1e3);
          D2Bot.updateRuns();
        }

        const gameName = (Starter.gameInfo.gameName === "?"
          ? Starter.randomString(null, true)
          : Starter.gameInfo.gameName + Starter.gameCount);
        const gamePass = (Starter.gameInfo.gamePass === "?"
          ? Starter.randomString(null, true)
          : Starter.gameInfo.gamePass);

        ControlAction.createGame(
          gameName,
          gamePass,
          Starter.gameInfo.difficulty,
          Starter.Config.CreateGameDelay * 1000
        );

        Starter.lastGameStatus = "pending";
        Starter.setNextGame(Starter.gameInfo);
        Starter.locationTimeout(10000, location);
      }
    ],
    [sdk.game.locations.WaitingInLine,
      function () {
        Starter.LocationEvents.waitingInLine();
      }
    ],
    [sdk.game.locations.TcpIp,
      function () {
        pType === sdk.game.profiletype.TcpIpHost
          ? Controls.TcpIpHost.click()
          : Controls.TcpIpCancel.click();
      }
    ],
    [sdk.game.locations.Lobby,
      function () {
        D2Bot.updateStatus("Lobby");

        me.blockKeys = false;
        Starter.loginRetry = 0;
        !Starter.firstLogin && (Starter.firstLogin = true);
        Starter.lastGameStatus === "pending" && (Starter.gameCount += 1);

        if (Starter.Config.PingQuitDelay && Starter.pingQuit) {
          ControlAction.timeoutDelay("Ping Delay", Starter.Config.PingQuitDelay * 1e3);
          Starter.pingQuit = false;
        }

        if (Starter.Config.JoinChannel !== "") {
          Controls.LobbyEnterChat.click();

          return;
        }

        if (Starter.inGame || Starter.gameInfo.error) {
          !Starter.gameStart && (Starter.gameStart = DataFile.getStats().ingameTick);

          Starter.isUp = "no";
          DataFile.updateStats("currentGame", "");
          if (getTickCount() - Starter.gameStart < Starter.Config.MinGameTime * 1e3) {
            ControlAction.timeoutDelay(
              "Min game time wait",
              Starter.Config.MinGameTime * 1e3 + Starter.gameStart - getTickCount()
            );
          }
        }

        if (Starter.inGame) {
          if (AutoMule.outOfGameCheck()
            || TorchSystem.outOfGameCheck()
            || Gambling.outOfGameCheck()
            || CraftingSystem.outOfGameCheck()) {
            return;
          }

          console.log("updating runs");
          D2Bot.updateRuns();

          Starter.gameCount += 1;
          Starter.lastGameStatus = "ready";
          Starter.inGame = false;

          if (Starter.Config.ResetCount && Starter.gameCount > Starter.Config.ResetCount) {
            Starter.gameCount = 1;
            DataFile.updateStats("runs", Starter.gameCount);
          }
        }

        Starter.LocationEvents.openCreateGameWindow();
      }
    ],
    [sdk.game.locations.LobbyChat,
      function () {
        D2Bot.updateStatus("Lobby Chat");
        Starter.lastGameStatus === "pending" && (Starter.gameCount += 1);

        if (Starter.inGame || Starter.gameInfo.error) {
          DataFile.updateStats("currentGame", "");
          !Starter.gameStart && (Starter.gameStart = DataFile.getStats().ingameTick);

          if (getTickCount() - Starter.gameStart < Starter.Config.MinGameTime * 1e3) {
            ControlAction.timeoutDelay("Min game time wait", Starter.Config.MinGameTime * 1e3 + Starter.gameStart - getTickCount());
          }
        }

        if (Starter.inGame) {
          if (AutoMule.outOfGameCheck()
            || TorchSystem.outOfGameCheck()
            || Gambling.outOfGameCheck()
            || CraftingSystem.outOfGameCheck()) {
            return;
          }

          console.log("updating runs");
          D2Bot.updateRuns();

          Starter.gameCount += 1;
          Starter.lastGameStatus = "ready";
          Starter.inGame = false;

          if (Starter.Config.ResetCount && Starter.gameCount > Starter.Config.ResetCount) {
            Starter.gameCount = 1;
            DataFile.updateStats("runs", Starter.gameCount);
          }

          Starter.chanInfo.afterMsg = Starter.Config.AfterGameMessage;

          // check that we are in the channel we are supposed to be in
          if (Starter.chanInfo.joinChannel.length) {
            let chanName = Controls.LobbyChannelName.getText();
            chanName && (chanName = chanName.toString());
            chanName && (chanName = chanName.slice(0, chanName.indexOf("(") - 1));
            Starter.chanInfo.joinChannel.indexOf(chanName) === -1 && (Starter.chatActionsDone = false);
          }

          if (Starter.chanInfo.afterMsg) {
            if (typeof Starter.chanInfo.afterMsg === "string") {
              Starter.chanInfo.afterMsg = [Starter.chanInfo.afterMsg];
            }

            for (let msg of Starter.chanInfo.afterMsg) {
              Starter.sayMsg(msg);
              delay(500);
            }
          }
        }

        if (!Starter.chatActionsDone) {
          Starter.chatActionsDone = true;
          Starter.chanInfo.joinChannel = Starter.Config.JoinChannel;
          Starter.chanInfo.firstMsg = Starter.Config.FirstJoinMessage;

          if (Starter.chanInfo.joinChannel) {
            typeof Starter.chanInfo.joinChannel === "string" && (Starter.chanInfo.joinChannel = [Starter.chanInfo.joinChannel]);
            typeof Starter.chanInfo.firstMsg === "string" && (Starter.chanInfo.firstMsg = [Starter.chanInfo.firstMsg]);

            for (let i = 0; i < Starter.chanInfo.joinChannel.length; i += 1) {
              ControlAction.timeoutDelay("Chat delay", Starter.Config.ChatActionsDelay * 1e3);

              if (ControlAction.joinChannel(Starter.chanInfo.joinChannel[i])) {
                Starter.useChat = true;
              } else {
                print("ÿc1Unable to join channel, disabling chat messages.");
                Starter.useChat = false;
              }

              if (Starter.chanInfo.firstMsg[i] !== "") {
                Starter.sayMsg(Starter.chanInfo.firstMsg[i]);
                delay(500);
              }
            }
          }
        }

        // Announce game
        Starter.chanInfo.announce = Starter.Config.AnnounceGames;

        Starter.LocationEvents.openCreateGameWindow();
      }
    ],
  ]);
  addLocations([sdk.game.locations.PreSplash, sdk.game.locations.SplashScreen],
    function (location) {
      ControlAction.click();
      Starter.locationTimeout(5000, location);
      getLocation() === sdk.game.locations.PreSplash && sendKey(0x0D);
    }
  );
  addLocations(
    [
      sdk.game.locations.JoinGame,
      sdk.game.locations.Ladder,
      sdk.game.locations.ChannelList
    ],
    function () {
      Starter.LocationEvents.openCreateGameWindow();
    }
  );
  addLocations([sdk.game.locations.Login, sdk.game.locations.CharSelect],
    function () {
      const otherMulti = [
        sdk.game.profiletype.TcpIpHost,
        sdk.game.profiletype.OpenBattlenet
      ].includes(pType);
      Starter.LocationEvents.login(otherMulti);
    }
  );
  addLocations([sdk.game.locations.CharSelectConnecting, sdk.game.locations.CharSelectNoChars],
    function () {
      Starter.LocationEvents.charSelectError();
    }
  );
  addLocations([sdk.game.locations.LoginUnableToConnect, sdk.game.locations.TcpIpUnableToConnect],
    function () {
      Starter.LocationEvents.unableToConnect();
    }
  );
  addLocations([sdk.game.locations.CharSelectPleaseWait, sdk.game.locations.LobbyPleaseWait],
    function (location) {
      if (!Starter.locationTimeout(Starter.Config.PleaseWaitTimeout * 1e3, location)) {
        Controls.OkCentered.click();
      }
    }
  );
  addLocations([sdk.game.locations.Disconnected, sdk.game.locations.LobbyLostConnection],
    function () {
      D2Bot.updateStatus("Disconnected/LostConnection");
      delay(1000);
      Controls.OkCentered.click();
    }
  );
  addLocations(
    [
      sdk.game.locations.LoginError,
      sdk.game.locations.InvalidCdKey,
      sdk.game.locations.CdKeyInUse,
    ],
    function () {
      Starter.LocationEvents.loginError();
    }
  );
  addLocations(
    [
      sdk.game.locations.CreateNewAccount,
      sdk.game.locations.CharacterCreate,
      sdk.game.locations.NewCharSelected,
    ],
    function () {
      Controls.BottomLeftExit.click();
    }
  );
  addLocations([sdk.game.locations.GameNameExists, sdk.game.locations.GameIsFull],
    function () {
      Controls.CreateGameWindow.click();
      Starter.gameCount += 1;
      Starter.lastGameStatus = "ready";
    }
  );
  
  module.exports = {
    locations: _loc,
    addLocations: addLocations,
    parseControlText: parseControlText,
  };
})(module);
