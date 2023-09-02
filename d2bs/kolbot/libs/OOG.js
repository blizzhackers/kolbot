/* eslint-disable max-len */
/**
*  @filename    OOG.js
*  @author      kolton, D3STROY3R, theBGuy
*  @desc        handle out of game operations, interacting with controls, location actions, and starter settings
*
*/

!isIncluded("Polyfill.js") && include("Polyfill.js");
includeIfNotIncluded("oog/D2Bot.js"); // required

/**
 * ControlAction and Starter are very closely related, how should this be handled?
 * Starter can probably be cleaned up, maybe taking out LocationEvents as that is mostly what
 * interfaces with ControlAction
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "./modules/Control"], factory);
  } else {
    Object.assign(root, factory());
  }
}([].filter.constructor("return this")(), function () {
  const Controls = require("./modules/Control");

  const ControlAction = {
    mutedKey: false,
    realms: {
      "uswest": 0,
      "west": 0,
      "useast": 1,
      "east": 1,
      "asia": 2,
      "europe": 3
    },

    /**
     * @param {string} text 
     * @param {number} time - in milliseconds 
     * @param {(arg: any) => boolean} [stopfunc] 
     * @param {any} [arg] 
     */
    timeoutDelay: function (text, time, stopfunc, arg) {
      let currTime = 0;
      let endTime = getTickCount() + time;
      Starter.delay = time;

      while (getTickCount() < endTime) {
        if (typeof stopfunc === "function" && stopfunc(arg)) {
          break;
        }

        Starter.delay = Math.max(0, (endTime - getTickCount()));
        if (currTime !== Math.floor((endTime - getTickCount()) / 1000)) {
          currTime = Math.floor((endTime - getTickCount()) / 1000);

          D2Bot.updateStatus(text + " (" + Math.max(currTime, 0) + "s)");
        }

        delay(10);
      }

      Starter.delay = 0;
    },

    /**
     * @param {number} type 
     * @param {number} x 
     * @param {number} y 
     * @param {number} xsize 
     * @param {number} ysize 
     * @param {number} targetx 
     * @param {number} targety 
     * @returns {boolean}
     */
    click: function (type, x, y, xsize, ysize, targetx, targety) {
      let control = getControl(type, x, y, xsize, ysize);

      if (!control) {
        console.error(
          "control not found " + type + " "
          + x + " " + y + " " + xsize + " " + ysize
          + " location " + getLocation()
        );
        return false;
      }

      control.click(targetx, targety);

      return true;
    },

    /**
     * @param {number} type 
     * @param {number} x 
     * @param {number} y 
     * @param {number} xsize 
     * @param {number} ysize 
     * @param {string} text 
     * @returns {boolean}
     */
    setText: function (type, x, y, xsize, ysize, text) {
      if (!text) return false;

      let control = getControl(type, x, y, xsize, ysize);
      if (!control) return false;

      let currText = control.text;
      if (currText && currText === text) return true;

      currText = control.getText();

      if (currText) {
        if ((typeof currText === "string" && currText === text)
          || (typeof currText === "object" && currText.includes(text))) {
          return true;
        }
      }

      control.setText(text);

      return true;
    },

    /**
     * @param {number} type 
     * @param {number} x 
     * @param {number} y 
     * @param {number} xsize 
     * @param {number} ysize 
     * @returns {string[] | false}
     */
    getText: function (type, x, y, xsize, ysize) {
      let control = getControl(type, x, y, xsize, ysize);

      return (!!control ? control.getText() : false);
    },

    /**
     * @param {number} type 
     * @param {number} x 
     * @param {number} y 
     * @param {number} xsize 
     * @param {number} ysize 
     * @returns {string}
     */
    parseText: function (type, x, y, xsize, ysize) {
      let control = getControl(type, x, y, xsize, ysize);
      if (!control) return "";
      let text = control.getText();
      if (!text || !text.length) return "";
      return text.join(" ");
    },

    // ~~~ Start of general functions ~~~ //
    scrollDown: function () {
      me.blockMouse = true;
      for (let i = 0; i < 4; i++) {
        sendKey(sdk.keys.code.DownArrow);
      }
      me.blockMouse = false;
    },

    clickRealm: function (realm) {
      if (realm === undefined || typeof realm !== "number" || realm < 0 || realm > 3) {
        throw new Error("clickRealm: Invalid realm!");
      }

      let retry = 0;

      me.blockMouse = true;

      MainLoop:
      while (true) {
        switch (getLocation()) {
        case sdk.game.locations.MainMenu:
          let control = Controls.Gateway.control;
          if (!control) {
            if (retry > 3) return false;
            retry++;

            break;
          }

          let gateText = getLocaleString(sdk.locale.text.Gateway);
          let currentRealm = (() => {
            switch (control.text.split(gateText.substring(0, gateText.length - 2))[1]) {
            case "U.S. WEST":
              return 0;
            case "ASIA":
              return 2;
            case "EUROPE":
              return 3;
            case "U.S. EAST":
            default:
              return 1;
            }
          })();

          if (currentRealm === realm) {
            break MainLoop;
          }

          Controls.Gateway.click();

          break;
        case sdk.game.locations.GatewaySelect:
          this.click(4, 257, 500, 292, 160, 403, 350 + realm * 25);
          Controls.GatewayOk.click();

          break;
        }

        delay(500);
      }

      me.blockMouse = false;

      return true;
    },

    /**
     * @typedef {Object} CharacterInfo
     * @property {string} charName
     * @property {string} charClass
     * @property {number} charLevel
     * @property {boolean} expansion
     * @property {boolean} hardcore
     * @property {boolean} ladder
     */

    /**
     * @param {CharacterInfo} info 
     * @param {boolean} [startFromTop]
     * @returns {Control | false}
     */
    findCharacter: function (info, startFromTop = true) {
      let count = 0;
      let tick = getTickCount();

      while (getLocation() !== sdk.game.locations.CharSelect) {
        if (getTickCount() - tick >= 5000) {
          break;
        }

        delay(25);
      }

      // start from beginning of the char list
      startFromTop && sendKey(sdk.keys.code.Home);

      while (getLocation() === sdk.game.locations.CharSelect && count < 24) {
        let control = Controls.CharSelectCharInfo0.control;

        if (control) {
          do {
            let text = control.getText();

            if (Array.isArray(text) && typeof text[1] === "string") {
              count++;

              if (String.isEqual(text[1], info.charName)) {
                if (info.ladder && !text.some(el => el.includes("LADDER"))) continue;
                // how to check hardcore?
                return control;
              }
            }
          } while (count < 24 && control.getNext());
        }

        // check for additional characters up to 24
        if (count === 8 || count === 16) {
          Controls.CharSelectChar6.click() && this.scrollDown();
        } else {
          // no further check necessary
          break;
        }
      }

      return false;
    },

    getCharacters: function () {
      let count = 0;
      let list = [];

      // start from beginning of the char list
      sendKey(sdk.keys.code.Home);

      while (getLocation() === sdk.game.locations.CharSelect && count < 24) {
        let control = Controls.CharSelectCharInfo0.control;

        if (control) {
          do {
            let text = control.getText();

            if (text instanceof Array && typeof text[1] === "string") {
              count++;

              if (list.indexOf(text[1]) === -1) {
                list.push(text[1]);
              }
            }
          } while (count < 24 && control.getNext());
        }

        // check for additional characters up to 24
        if (count === 8 || count === 16) {
          Controls.CharSelectChar6.click() && this.scrollDown();
        } else {
          // no further check necessary
          break;
        }
      }

      // back to beginning of the char list
      sendKey(sdk.keys.code.Home);

      return list;
    },

    /**
     * @param {CharacterInfo} info 
     * @returns {boolean}
     */
    getPermStatus: function (info) {
      let expireStr = getLocaleString(sdk.locale.text.ExpiresIn);
      expireStr = expireStr.slice(0, expireStr.indexOf("%")).trim();

      let control = this.findCharacter(info);
      if (!control) return false;

      let text = control.getText();
      if (!Array.isArray(text) || typeof text[1] !== "string") return false;

      return !text.some(el => el.includes(expireStr));
    },

    /**
     * get character position - useless? this doesn't take any arguments to even check the character
     * @returns {number}
     */
    getPosition: function () {
      let position = 0;

      if (getLocation() === sdk.game.locations.CharSelect) {
        let control = Controls.CharSelectCharInfo0.control;

        if (control) {
          do {
            let text = control.getText();

            if (text instanceof Array && typeof text[1] === "string") {
              position += 1;
            }
          } while (control.getNext());
        }
      }

      return position;
    },

    /**
     * @param {CharacterInfo} info 
     * @param {boolean} [randNameOnFail]
     * @returns {boolean}
     */
    makeCharacter: function (info, randNameOnFail = false) {
      try {
        me.blockMouse = true;
        !info.charClass && (info.charClass = "barbarian");
        if (!info.charName || info.charName.length < 2 || info.charName.length > 15) {
          info.charName = Starter.randomString(8, false);
        }
        info.charName.match(/\d+/g) && (info.charName.replace(/\d+/g, ""));
        if (!info.expansion && ["druid", "assassin"].includes(info.charClass)) {
          info.expansion = true;
        }

        let clickCoords = [];
        /** @type {Map<string, [number, number]} */
        const coords = new Map([
          ["barbarian", [400, 280]],
          ["amazon", [100, 280]],
          ["necromancer", [300, 290]],
          ["sorceress", [620, 270]],
          ["assassin", [200, 280]],
          ["druid", [700, 280]],
          ["paladin", [521, 260]]
        ]);

        // cycle until in lobby
        while (getLocation() !== sdk.game.locations.Lobby) {
          if (me.ingame) return true;

          switch (getLocation()) {
          case sdk.game.locations.CharSelect:
          case sdk.game.locations.CharSelectNoChars:
            // Create Character greyed out
            if (Controls.CharSelectCreate.disabled === sdk.game.controls.Disabled) {
              return false;
            }

            Controls.CharSelectCreate.click();

            break;
          case sdk.game.locations.CharacterCreate:
            clickCoords = coords.get(info.charClass.toLowerCase()) || coords.get("paladin");
            getControl().click(clickCoords[0], clickCoords[1]);
            delay(500);

            break;
          case sdk.game.locations.NewCharSelected:
            if (Controls.CharCreateHCWarningOk.control) {
              Controls.CharCreateHCWarningOk.click();
            } else {
              Controls.CharCreateCharName.setText(info.charName);

              !info.expansion && Controls.CharCreateExpansion.click();
              !info.ladder && Controls.CharCreateLadder.click();
              info.hardcore && Controls.CharCreateHardcore.click();

              Controls.BottomRightOk.click();
            }

            break;
          case sdk.game.locations.OkCenteredErrorPopUp:
            // char name exists (text box 4, 268, 320, 264, 120)
            Controls.OkCentered.click();
            Controls.BottomLeftExit.click();
            if (randNameOnFail) {
              console.log("char name exists - randomizing a new one");
              info.charName = Starter.randomString(8, false);
              
              continue;
            }

            return false;
          default:
            break;
          }

          delay(500);
        }

        return true;
      } finally {
        me.blockMouse = false;
      }
    },

    /**
     * @param {CharacterInfo} info 
     * @returns {boolean}
     */
    deleteCharacter: function (info) {
      let control = this.findCharacter(info);
      if (!control) return false;

      try {
        me.blockMouse = true;
        console.log("delete character " + info.charName);
        control.click();
        Controls.CharSelectDelete.click();
        delay(500);
        Controls.PopupYes.click();
        delay(500);

        return true;
      } catch (e) {
        console.error(e);

        return false;
      } finally {
        me.blockMouse = false;
      }
    },

    /**
     * @param {CharacterInfo} info 
     * @returns {boolean}
     */
    convertCharacter: function (info) {
      let control = this.findCharacter(info);
      if (!control) return false;

      if (control.getText().find(el => el.toLowerCase().includes("expansion"))) {
        console.warn(info.charName + " already expansion");
        console.debug(control, "\n", control.getText());
        
        return false;
      }

      try {
        me.blockMouse = true;
        console.log("converting character to expansion " + info.charName);
        control.click();
        Controls.CharSelectConvert.click();
        delay(500);
        Controls.PopupYes.click();
        delay(500);

        return true;
      } catch (e) {
        console.error(e);

        return false;
      } finally {
        me.blockMouse = false;
      }
    },

    /**
     * @param {CharacterInfo} info 
     * @param {boolean} startFromTop
     * @returns {boolean}
     */
    loginCharacter: function (info, startFromTop = true) {
      me.blockMouse = true;
      
      try {
        MainLoop:
        // cycle until in lobby or in game
        while (getLocation() !== sdk.game.locations.Lobby) {
          switch (getLocation()) {
          case sdk.game.locations.CharSelect:
            let control = this.findCharacter(info, startFromTop);
            if (!control) return false;
            
            control.click();
            Controls.BottomRightOk.click();
            Starter.locationTimeout(sdk.game.locations.CharSelect, 5000);

            return getLocation() === sdk.game.locations.SelectDifficultySP
              ? login(info.profile)
              : true;
          case sdk.game.locations.CharSelectNoChars:
            Controls.BottomLeftExit.click();

            break;
          case sdk.game.locations.Disconnected:
          case sdk.game.locations.OkCenteredErrorPopUp:
            break MainLoop;
          default:
            break;
          }

          delay(100);
        }

        return true;
      } catch (e) {
        console.error(e);

        return false;
      } finally {
        me.blockMouse = false;
      }
    },

    setEmail: function (email = "", domain = "@email.com") {
      if (getLocation() !== sdk.game.locations.RegisterEmail) return false;
      if (!email || !email.length) {
        email = Starter.randomString(null, true);
      }
      
      while (getLocation() !== sdk.game.locations.CharSelect) {
        switch (getLocation()) {
        case sdk.game.locations.RegisterEmail:
          if (Controls.EmailSetEmail.setText(email + domain)
            && Controls.EmailVerifyEmail.setText(email + domain)) {
            Controls.EmailRegister.click();
            delay(100);
          }

          break;
        case sdk.game.locations.LoginError:
          // todo test what conditions get here other than email not matching
          D2Bot.printToConsole("Failed to set email");
          Controls.LoginErrorOk.click();
          
          return false;
        case sdk.game.locations.CharSelectNoChars:
          // fresh acc
          return true;
        }
      }

      return true;
    },

    makeAccount: function (info) {
      me.blockMouse = true;

      let openBnet = Profile().type === sdk.game.profiletype.OpenBattlenet;
      
      // cycle until in empty char screen
      MainLoop:
      while (getLocation() !== sdk.game.locations.CharSelectNoChars) {
        switch (getLocation()) {
        case sdk.game.locations.MainMenu:
          ControlAction.clickRealm(this.realms[info.realm]);
          if (openBnet) {
            Controls.OtherMultiplayer.click() && Controls.OpenBattleNet.click();
          } else {
            Controls.BattleNet.click();
          }

          break;
        case sdk.game.locations.Login:
          Controls.CreateNewAccount.click();

          break;
        case sdk.game.locations.SplashScreen:
          Controls.SplashScreen.click();

          break;
        case sdk.game.locations.CharacterCreate:
          Controls.BottomLeftExit.click();

          break;
        case sdk.game.locations.TermsOfUse:
          Controls.TermsOfUseAgree.click();

          break;
        case sdk.game.locations.CreateNewAccount:
          Controls.EnterAccountName.setText(info.account);
          Controls.EnterAccountPassword.setText(info.password);
          Controls.ConfirmPassword.setText(info.password);
          Controls.BottomRightOk.click();

          break;
        case sdk.game.locations.PleaseRead:
          Controls.PleaseReadOk.click();

          break;
        case sdk.game.locations.RegisterEmail:
          Controls.EmailDontRegisterContinue.control
            ? Controls.EmailDontRegisterContinue.click()
            : Controls.EmailDontRegister.click();

          break;
        case sdk.game.locations.CharSelect:
          if (openBnet) {
            break MainLoop;
          }

          break;
        case sdk.game.locations.LoginError:
          Controls.LoginErrorOk.click();
          
          return false;
        default:
          break;
        }

        delay(100);
      }

      me.blockMouse = false;

      return true;
    },

    loginAccount: function (info) {
      me.blockMouse = true;

      let locTick;
      let tick = getTickCount();

      MainLoop:
      while (true) {
        switch (getLocation()) {
        case sdk.game.locations.PreSplash:
          break;
        case sdk.game.locations.MainMenu:
          info.realm && ControlAction.clickRealm(this.realms[info.realm]);
          Controls.BattleNet.click();

          break;
        case sdk.game.locations.Login:
          Controls.EnterAccountName.setText(info.account);
          Controls.EnterAccountPassword.setText(info.password);
          Controls.Login.click();

          break;
        case sdk.game.locations.CreateNewAccount:
          Controls.BottomLeftExit.click();

          break;
        case sdk.game.locations.LoginUnableToConnect:
        case sdk.game.locations.RealmDown:
          // Unable to connect, let the caller handle it.
          me.blockMouse = false;

          return false;
        case sdk.game.locations.CharSelect:
          break MainLoop;
        case sdk.game.locations.SplashScreen:
          Controls.SplashScreen.click();

          break;
        case sdk.game.locations.CharSelectPleaseWait:
        case sdk.game.locations.MainMenuConnecting:
        case sdk.game.locations.CharSelectConnecting:
          break;
        case sdk.game.locations.CharSelectNoChars:
          // make sure we're not on connecting screen
          locTick = getTickCount();

          while (getTickCount() - locTick < 3000 && getLocation() === sdk.game.locations.CharSelectNoChars) {
            delay(25);
          }

          if (getLocation() === sdk.game.locations.CharSelectConnecting) {
            break;
          }

          break MainLoop; // break if we're sure we're on empty char screen
        default:
          print(getLocation());

          me.blockMouse = false;

          return false;
        }

        if (getTickCount() - tick >= 20000) {
          return false;
        }

        delay(100);
      }

      delay(1000);

      me.blockMouse = false;

      return getLocation() === sdk.game.locations.CharSelect || getLocation() === sdk.game.locations.CharSelectNoChars;
    },

    joinChannel: function (channel) {
      me.blockMouse = true;

      let tick;
      let rval = false;
      let timeout = 5000;

      MainLoop:
      while (true) {
        switch (getLocation()) {
        case sdk.game.locations.Lobby:
          Controls.LobbyEnterChat.click();

          break;
        case sdk.game.locations.LobbyChat:
          let currChan = Controls.LobbyChannelName.getText(); // returns array

          if (currChan) {
            for (let i = 0; i < currChan.length; i += 1) {
              if (currChan[i].split(" (") && String.isEqual(currChan[i].split(" (")[0], channel)) {
                rval = true;

                break MainLoop;
              }
            }
          }

          !tick && Controls.LobbyChannel.click() && (tick = getTickCount());

          break;
        case sdk.game.locations.ChannelList: // Channel
          Controls.LobbyChannelText.setText(channel);
          Controls.LobbyChannelOk.click();

          break;
        }

        if (getTickCount() - tick >= timeout) {
          break;
        }

        delay(100);
      }

      me.blockMouse = false;

      return rval;
    },

    createGame: function (name, pass, diff, delay) {
      Controls.CreateGameName.setText(name);
      Controls.CreateGamePass.setText(pass);
      Controls.CreateGameDescription.setText(Starter.Config.GameDescription);

      switch (diff) {
      case "Normal":
        Controls.Normal.click();

        break;
      case "Nightmare":
        Controls.Nightmare.click();

        break;
      case "Highest":
        if (Controls.Hell.disabled !== 4 && Controls.Hell.click()) {
          break;
        }

        if (Controls.Nightmare.disabled !== 4 && Controls.Nightmare.click()) {
          break;
        }

        Controls.Normal.click();

        break;
      default:
        Controls.Hell.click();

        break;
      }

      !!delay && this.timeoutDelay("Make Game Delay", delay);

      if (Starter.chanInfo.announce) {
        Starter.sayMsg("Next game is " + name + (pass === "" ? "" : "//" + pass));
      }

      me.blockMouse = true;

      print("Creating Game: " + name);
      Controls.CreateGame.click();

      me.blockMouse = false;
    },
    
    getGameList: function () {
      let text = Controls.JoinGameList.getText();

      if (text) {
        let gameList = [];

        for (let i = 0; i < text.length; i += 1) {
          gameList.push({
            gameName: text[i][0],
            players: text[i][1]
          });
        }

        return gameList;
      }

      return false;
    },

    getQueueTime: function () {
      // You are in line to create a game.,Try joining a game to avoid waiting.,,Your position in line is: ÿc02912
      const text = Controls.CreateGameInLine.getText();
      if (text && text.indexOf(getLocaleString(sdk.locale.text.YourPositionInLineIs)) > -1) {
        const result = /ÿc0(\d*)/gm.exec(text);
        if (result && typeof result[1] === "string") {
          return parseInt(result[1]) || 0;
        }
      }

      return 0; // You're in line 0, aka no queue
    },

    loginOtherMultiplayer: function () {
      MainLoop:
      while (true) {
        switch (getLocation()) {
        case sdk.game.locations.CharSelect:
          if (Controls.CharSelectCurrentRealm.control) {
            console.log("Not in single player character select screen");
            Controls.BottomLeftExit.click();

            break;
          }

          Starter.LocationEvents.login(false);

          break;
        case sdk.game.locations.SelectDifficultySP:
          Starter.LocationEvents.selectDifficultySP();
          
          break;
        case sdk.game.locations.SplashScreen:
          ControlAction.click();

          break;
        case sdk.game.locations.MainMenu:
          if (Profile().type === sdk.game.profiletype.OpenBattlenet) {
            // check we are on the correct gateway
            let realms = { "west": 0, "east": 1, "asia": 2, "europe": 3 };
            ControlAction.clickRealm(realms[Profile().gateway.toLowerCase()]);
            try {
              login(me.profile);
            } catch (e) {
              print(e);
            }

            break;
          }
          
          Controls.OtherMultiplayer.click();

          break;
        case sdk.game.locations.OtherMultiplayer:
          Starter.LocationEvents.otherMultiplayerSelect();

          break;
        case sdk.game.locations.TcpIp:
          // handle this in otherMultiplayerSelect
          // not sure how to handle enter ip though, should that be left to the starter to decide?
          Controls.TcpIpCancel.click();

          break;
        case sdk.game.locations.TcpIpEnterIp:
          break MainLoop;
        case sdk.game.locations.Login:
          login(me.profile);

          break;
        case sdk.game.locations.LoginUnableToConnect:
        case sdk.game.locations.TcpIpUnableToConnect:
          Starter.LocationEvents.unableToConnect();

          break;
        case sdk.game.locations.Lobby:
        case sdk.game.locations.LobbyChat:
          D2Bot.updateStatus("Lobby");

          if (me.charname !== Starter.profileInfo.charName) {
            Controls.LobbyQuit.click();
            
            break;
          }

          me.blockKeys = false;
          !Starter.firstLogin && (Starter.firstLogin = true);

          break MainLoop;
        default:
          if (me.ingame) {
            break MainLoop;
          }

          break;
        }
      }
      
      // handling Enter Ip inside entry for now so that location === sucess
      return (me.ingame || getLocation() === [sdk.game.locations.TcpIpEnterIp]);
    }
  };

  const Starter = {
    Config: require("./starter/StarterConfig"),
    AdvancedConfig: require("./starter/AdvancedConfig"),
    useChat: false,
    pingQuit: false,
    inGame: false,
    firstLogin: true,
    firstRun: false,
    isUp: "no",
    delay: 0,
    loginRetry: 0,
    deadCheck: false,
    chatActionsDone: false,
    gameStart: 0,
    gameCount: 0,
    lastGameStatus: "ready",
    handle: null,
    connectFail: false,
    connectFailRetry: 0,
    makeAccount: false,
    channelNotify: false,
    chanInfo: {
      joinChannel: "",
      firstMsg: "",
      afterMsg: "",
      announce: false
    },
    gameInfo: {},
    joinInfo: {},
    profileInfo: {},

    sayMsg: function (string) {
      if (!this.useChat) return;
      say(string);
    },

    timer: function (tick) {
      return " (" + new Date(getTickCount() - tick).toISOString().slice(11, -5) + ")";
    },

    locationTimeout: function (time, location) {
      let endtime = getTickCount() + time;

      while (!me.ingame && getLocation() === location && endtime > getTickCount()) {
        delay(500);
      }

      return (getLocation() !== location);
    },

    setNextGame: function (gameInfo = {}) {
      let nextGame = (gameInfo.gameName || this.randomString(null, true));
      
      if ((this.gameCount + 1 >= Starter.Config.ResetCount)
        || (nextGame.length + this.gameCount + 1 > 15)) {
        nextGame += "1";
      } else {
        nextGame += (this.gameCount + 1);
      }

      DataFile.updateStats("nextGame", nextGame);
    },

    updateCount: function () {
      D2Bot.updateCount();
      delay(1000);
      Controls.BattleNet.click();

      try {
        login(me.profile);
      } catch (e) {
        return;
      }

      delay(1000);
      Controls.BottomLeftExit.click();
    },

    scriptMsgEvent: function (msg) {
      if (msg && typeof msg !== "string") return;
      switch (msg) {
      case "mule":
        AutoMule.check = true;

        break;
      case "muleTorch":
        AutoMule.torchAnniCheck = 1;

        break;
      case "muleAnni":
        AutoMule.torchAnniCheck = 2;

        break;
      case "torch":
        TorchSystem.check = true;

        break;
      case "crafting":
        CraftingSystem.check = true;

        break;
      case "getMuleMode":
        if (AutoMule.torchAnniCheck === 2) {
          scriptBroadcast("2");
        } else if (AutoMule.torchAnniCheck === 1) {
          scriptBroadcast("1");
        } else if (AutoMule.check) {
          scriptBroadcast("0");
        }

        break;
      case "pingquit":
        Starter.pingQuit = true;

        break;
      }
    },

    /**
     * Handle copy data event
     * @param {number} mode 
     * @param {object | string} msg 
     */
    receiveCopyData: function (mode, msg) {
      if (msg === "Handle" && typeof mode === "number") {
        // console.debug("Recieved Handle :: " + mode);
        Starter.handle = mode;

        return;
      }

      let obj = null;

      switch (mode) {
      case 1: // JoinInfo
        obj = JSON.parse(msg);
        Object.assign(Starter.joinInfo, obj);

        break;
      case 2: // Game info
        obj = JSON.parse(msg);
        Object.assign(Starter.gameInfo, obj);

        break;
      case 3: // Game request
        // in case someone is using a lightweight entry like blank/map to play manually and these aren't included
        if (typeof AutoMule !== "undefined") {
          // Don't let others join mule/torch/key/gold drop game
          if (AutoMule.inGame || Gambling.inGame || TorchSystem.inGame || CraftingSystem.inGame) {
            break;
          }
        }

        if (Starter.gameInfo.hasOwnProperty("gameName")) {
          obj = JSON.parse(msg);
          console.debug("Recieved Game Request :: ", obj.profile);

          if ([sdk.game.profiletype.TcpIpHost, sdk.game.profiletype.TcpIpJoin].includes(Profile().type)) {
            me.gameReady && D2Bot.joinMe(obj.profile, me.gameserverip.toString(), "", "", Starter.isUp);
          } else {
            if (me.gameReady) {
              D2Bot.joinMe(obj.profile, me.gamename, "", me.gamepassword, Starter.isUp);
            } else {
              // If we haven't made it to the lobby yet but are already getting game requests, stop the spam by telling followers to delay
              let delay = (Starter.delay === 0 && !me.ingame && getLocation() !== sdk.game.locations.CreateGame)
                ? 3000
                : Starter.delay;
              D2Bot.joinMe(
                obj.profile,
                Starter.gameInfo.gameName,
                Starter.gameCount,
                Starter.gameInfo.gamePass,
                Starter.isUp,
                delay
              );
            }
          }
        }

        break;
      case 4: // Heartbeat ping
        msg === "pingreq" && sendCopyData(null, me.windowtitle, 4, "pingrep");

        break;
      case 61732: // Cached info retreival
        obj = JSON.parse(msg);
        msg !== "null" && (Starter.gameInfo.crashInfo = obj);

        break;
      case 1638: // getProfile
        try {
          /**
           * @typedef {object} ProfileInfo
           * @property {string} Name
           * @property {string} Status
           * @property {string} Account
           * @property {string} Character
           * @property {string} Difficulty
           * @property {string} Realm
           * @property {string} Game
           * @property {string} Entry
           * @property {string} Tag
           */
          /** @type {ProfileInfo} */
          let pObj = JSON.parse(msg);
          Starter.profileInfo.profile = me.profile;
          Starter.profileInfo.account = pObj.Account || "";
          Starter.profileInfo.charName = pObj.Character || "";
          Starter.profileInfo.difficulty = pObj.Difficulty || "";
          Starter.profileInfo.tag = pObj.Tag || "";
          pObj.Realm = pObj.Realm.toLowerCase();
          Starter.profileInfo.realm = ["east", "west"].includes(pObj.Realm)
            ? "us" + pObj.Realm
            : pObj.Realm;
        } catch (e) {
          console.error(e);
        }

        break;
      }
    },

    randomString: function (len, useNumbers = false) {
      !len && (len = rand(5, 14));

      let rval = "";
      let letters = useNumbers
        ? "abcdefghijklmnopqrstuvwxyz0123456789"
        : "abcdefghijklmnopqrstuvwxyz";

      for (let i = 0; i < len; i += 1) {
        rval += letters[rand(0, letters.length - 1)];
      }

      return rval;
    },

    randomNumberString: function (len) {
      !len && (len = rand(2, 5));

      let rval = "";
      let vals = "0123456789";

      for (let i = 0; i < len; i += 1) {
        rval += vals[rand(0, vals.length - 1)];
      }

      return rval;
    },

    LocationEvents: (function () {
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

      const _locMap = new Map([
        [sdk.game.locations.LoginError, function () {
          let string = parseControlText(Controls.LoginErrorText);

          switch (string) {
          case getLocaleString(sdk.locale.text.UsernameIncludedIllegalChars):
          case getLocaleString(sdk.locale.text.UsernameIncludedDisallowedwords):
            D2Bot.updateStatus("Invalid Account Name");
            D2Bot.printToConsole("Invalid Account Name :: " + Starter.profileInfo.account);
            D2Bot.stop(true);

            return false;
          case getLocaleString(sdk.locale.text.UnableToCreateAccount):
          case getLocaleString(5239): // An account name already exists
            if (!Starter.accountExists) {
              Starter.accountExists = true;
              Controls.LoginErrorOk.click();
              Starter.locationTimeout(1000, sdk.game.locations.LoginError);
              Controls.BottomLeftExit.click();
              Starter.locationTimeout(1000, sdk.game.locations.CreateNewAccount);
              return true;
            }
            D2Bot.updateStatus("Account name already exists :: " + Starter.profileInfo.account);
            D2Bot.printToConsole("Account name already exists :: " + Starter.profileInfo.account);
            D2Bot.stop(true);

            return false;
          case getLocaleString(sdk.locale.text.InvalidPassword):
          case getLocaleString(5208): // Invalid account
          case getLocaleString(sdk.locale.text.AccountDoesNotExist):
            if (!!Starter.Config.MakeAccountOnFailure) {
              Starter.makeAccount = true;
              Controls.LoginErrorOk.click();

              return true;
            }
            D2Bot.printToConsole(string);
            D2Bot.updateStatus(string);
            D2Bot.stop(true);

            return false;
          case getLocaleString(sdk.locale.text.CdKeyIntendedForAnotherProduct):
          case getLocaleString(sdk.locale.text.LoDKeyIntendedForAnotherProduct):
          case getLocaleString(sdk.locale.text.CdKeyDisabled):
          case getLocaleString(sdk.locale.text.LoDKeyDisabled):
            D2Bot.updateStatus("Disabled CDKey");
            D2Bot.printToConsole("Disabled CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
            D2Bot.CDKeyDisabled();

            if (Starter.gameInfo.switchKeys) {
              ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
              D2Bot.restart(true);
            } else {
              D2Bot.stop();
            }

            break;
          case getLocaleString(sdk.locale.text.Disconnected):
            ControlAction.timeoutDelay("Disconnected from battle.net", Time.minutes(1));
            return Controls.LoginErrorOk.click();
          case getLocaleString(sdk.locale.text.BattlenetNotResponding):
          case getLocaleString(sdk.locale.text.BattlenetNotResponding2):
            ControlAction.timeoutDelay("[R/D] - " + string, Time.minutes(10));
            return Controls.LoginErrorOk.click();
          default:
            D2Bot.updateStatus("Login Error");
            D2Bot.printToConsole("Login Error - " + string);

            if (Starter.gameInfo.switchKeys) {
              ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
              D2Bot.restart(true);
            } else {
              D2Bot.stop();
            }

            break;
          }

          return Controls.LoginErrorOk.click();
        }],
        [sdk.game.locations.OkCenteredErrorPopUp, function () {
          let string = parseControlText(Controls.OkCenteredText);

          switch (string) {
          case getLocaleString(sdk.locale.text.CannotCreateGamesDeadHCChar):
            Starter.deadCheck = true;
            return Controls.OkCentered.click();
          case getLocaleString(sdk.locale.text.UsernameMustBeAtLeast):
          case getLocaleString(sdk.locale.text.PasswordMustBeAtLeast):
          case getLocaleString(sdk.locale.text.AccountMustBeAtLeast):
          case getLocaleString(sdk.locale.text.PasswordCantBeMoreThan):
          case getLocaleString(sdk.locale.text.AccountCantBeMoreThan):
          case getLocaleString(sdk.locale.text.InvalidPassword):
            D2Bot.printToConsole(string);
            D2Bot.stop();

            break;
          default:
            D2Bot.updateStatus("Error");
            D2Bot.printToConsole("Error - " + string);

            break;
          }
          Controls.OkCentered.click();
          ControlAction.timeoutDelay("Error", Time.minutes(1));

          return true;
        }],
        [sdk.game.locations.CdKeyInUse, function () {
          let string = parseControlText(Controls.LoginCdKeyInUseBy);

          if (string === getLocaleString(sdk.locale.text.CdKeyInUseBy)) {
            let who = Controls.LoginCdKeyInUseBy.getText();
            D2Bot.printToConsole(Starter.gameInfo.mpq + " " + string + " " + who, sdk.colors.D2Bot.Gold);
            D2Bot.CDKeyInUse();
            Controls.UnableToConnectOk.click();

            if (Starter.gameInfo.switchKeys) {
              ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
              D2Bot.restart(true);
            } else {
              ControlAction.timeoutDelay("Cd key in use by: " + who, Starter.Config.CDKeyInUseDelay * 6e4);
            }
          }
          return true;
        }],
        [sdk.game.locations.InvalidCdKey, function () {
          let string = parseControlText(Controls.LoginInvalidCdKey);

          if (string === getLocaleString(sdk.locale.text.CdKeyIntendedForAnotherProduct)
            || string === getLocaleString(sdk.locale.text.LoDKeyIntendedForAnotherProduct)) {
            D2Bot.updateStatus("Invalid CDKey");
            D2Bot.printToConsole("Invalid CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
            D2Bot.CDKeyDisabled();

            if (Starter.gameInfo.switchKeys) {
              ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
              D2Bot.restart(true);
            } else {
              D2Bot.stop();
            }
          }
          return true;
        }],
      ]);

      return {
        selectDifficultySP: function () {
          let diff = (Starter.gameInfo.difficulty || "Highest");
          diff === "Highest" && (diff = "Hell"); // starts from top with fall-through to select highest

          switch (diff) {
          case "Hell":
            if (Controls.HellSP.click()
              && Starter.locationTimeout(1e3, sdk.game.locations.SelectDifficultySP)) {
              break;
            }
          // eslint-disable-next-line no-fallthrough
          case "Nightmare":
            if (Controls.NightmareSP.click()
              && Starter.locationTimeout(1e3, sdk.game.locations.SelectDifficultySP)) {
              break;
            }
          // eslint-disable-next-line no-fallthrough
          case "Normal":
            Controls.NormalSP.click();

            break;
          }
          return Starter.locationTimeout(5e3, sdk.game.locations.SelectDifficultySP);
        },

        loginError: function () {
          let _loc = getLocation();

          if (_locMap.has(_loc)) {
            _locMap.get(_loc)();
          } else {
            D2Bot.printToConsole("Unhandled location: " + _loc);
            ControlAction.timeoutDelay("Unhandled location: " + _loc, Time.minutes(10));
            D2Bot.restart();
          }
        },

        charSelectError: function () {
          let string = parseControlText(Controls.CharSelectError);
          let currentLoc = getLocation();

          if (string) {
            if (string === getLocaleString(sdk.locale.text.CdKeyDisabledFromRealm)) {
              D2Bot.updateStatus("Realm Disabled CDKey");
              D2Bot.printToConsole("Realm Disabled CDKey: " + Starter.gameInfo.mpq, sdk.colors.D2Bot.Gold);
              D2Bot.CDKeyDisabled();

              if (Starter.gameInfo.switchKeys) {
                ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
                D2Bot.restart(true);
              } else {
                D2Bot.stop();
              }
            }
          }

          if (!Starter.locationTimeout(Starter.Config.ConnectingTimeout * 1e3, currentLoc)) {
            // Click create char button on infinite "connecting" screen
            Controls.CharSelectCreate.click();
            delay(1000);
            
            Controls.BottomLeftExit.click();
            delay(1000);
            
            if (getLocation() !== sdk.game.locations.CharSelectConnecting) return true;
            
            Controls.BottomLeftExit.click();
            Starter.gameInfo.rdBlocker && D2Bot.restart();

            return false;
          }

          return true;
        },

        realmDown: function () {
          D2Bot.updateStatus("Realm Down");
          delay(1000);

          if (!Controls.BottomLeftExit.click()) return;

          Starter.updateCount();
          ControlAction.timeoutDelay("Realm Down", Starter.Config.RealmDownDelay * 6e4);
          D2Bot.CDKeyRD();

          if (Starter.gameInfo.switchKeys && !Starter.gameInfo.rdBlocker) {
            D2Bot.printToConsole("Realm Down - Changing CD-Key");
            ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
            D2Bot.restart(true);
          } else {
            D2Bot.printToConsole("Realm Down - Restart");
            D2Bot.restart();
          }
        },

        waitingInLine: function () {
          let queue = ControlAction.getQueueTime();
          let currentLoc = getLocation();

          if (queue > 0) {
            switch (true) {
            case (queue < 10000):
              D2Bot.updateStatus("Waiting line... Queue: " + queue);

              // If stuck here for too long, game creation likely failed. Exit to char selection and try again.
              if (queue < 10) {
                if (!Starter.locationTimeout(Starter.Config.WaitInLineTimeout * 1e3, currentLoc)) {
                  print("Failed to create game");
                  Controls.CancelCreateGame.click();
                  Controls.LobbyQuit.click();
                  delay(1000);
                }
              }

              break;
            case (queue > 10000):
              if (Starter.Config.WaitOutQueueRestriction) {
                D2Bot.updateStatus("Waiting out Queue restriction: " + queue);
              } else {
                print("Restricted... Queue: " + queue);
                D2Bot.printToConsole("Restricted... Queue: " + queue, sdk.colors.D2Bot.Red);
                Controls.CancelCreateGame.click();

                if (Starter.Config.WaitOutQueueExitToMenu) {
                  Controls.LobbyQuit.click();
                  delay(1000);
                  Controls.BottomLeftExit.click();
                }

                // Wait out each queue as 1 sec and add extra 10 min
                ControlAction.timeoutDelay("Restricted", (queue + 600) * 1000);
              }

              break;
            }
          }
        },

        gameDoesNotExist: function () {
          let currentLoc = getLocation();
          console.log("Game doesn't exist");

          if (Starter.gameInfo.rdBlocker) {
            D2Bot.printToConsole(Starter.gameInfo.mpq + " is probably flagged.", sdk.colors.D2Bot.Gold);

            if (Starter.gameInfo.switchKeys) {
              ControlAction.timeoutDelay("Key switch delay", Starter.Config.SwitchKeyDelay * 1000);
              D2Bot.restart(true);
            }
          } else {
            Starter.locationTimeout(Starter.Config.GameDoesNotExistTimeout * 1e3, currentLoc);
          }

          Starter.lastGameStatus = "ready";
        },

        unableToConnect: function () {
          let currentLoc = getLocation();

          if (getLocation() === sdk.game.locations.TcpIpUnableToConnect) {
            D2Bot.updateStatus("Unable To Connect TCP/IP");
            Starter.connectFail && ControlAction.timeoutDelay("Unable to Connect", Starter.Config.TCPIPNoHostDelay * 1e3);
            Controls.OkCentered.click();
            Starter.connectFail = !Starter.connectFail;
          } else {
            D2Bot.updateStatus("Unable To Connect");

            if (Starter.connectFailRetry < 2) {
              Starter.connectFailRetry++;
              Controls.UnableToConnectOk.click();

              return;
            }

            Starter.connectFailRetry >= 2 && (Starter.connectFail = true);

            if (Starter.connectFail && !Starter.locationTimeout(10e4, currentLoc)) {
              let string = parseControlText(Controls.LoginUnableToConnect);
              
              switch (string) {
              case getLocaleString(sdk.locale.text.UnableToIndentifyVersion):
                Controls.UnableToConnectOk.click();
                ControlAction.timeoutDelay("Version error", Starter.Config.VersionErrorDelay * 1000);
                
                break;
              default: // Regular UTC and everything else
                Controls.UnableToConnectOk.click();
                ControlAction.timeoutDelay("Unable to Connect", Starter.Config.UnableToConnectDelay * 1000 * 60);
                
                break;
              }

              Starter.connectFail = false;
            }

            if (!Controls.UnableToConnectOk.click()) {
              return;
            }

            Starter.connectFail = true;
            Starter.connectFailRetry = 0;
          }
        },

        openCreateGameWindow: function () {
          let currentLoc = getLocation();

          if (!Controls.CreateGameWindow.click()) {
            return true;
          }

          // dead HC character
          if (Controls.CreateGameWindow.control
            && Controls.CreateGameWindow.disabled === sdk.game.controls.Disabled) {
            if (Starter.Config.StopOnDeadHardcore) {
              D2Bot.printToConsole(
                Profile().character + " has died. They shall be remembered...maybe. Shutting down, better luck next time",
                sdk.colors.D2Bot.Gold
              );
              D2Bot.stop();
            } else {
              D2Bot.printToConsole(
                Profile().character + " has died. They shall be remembered...maybe. Better luck next time",
                sdk.colors.D2Bot.Gold
              );
              D2Bot.updateStatus(Profile().character + " has died. They shall be remembered...maybe. Better luck next time");
              Starter.deadCheck = true;
              Controls.LobbyQuit.click();
            }

            return false;
          }

          // in case create button gets bugged
          if (!Starter.locationTimeout(5000, currentLoc)) {
            if (!Controls.CreateGameWindow.click()) {
              return true;
            }

            if (!Controls.JoinGameWindow.click()) {
              return true;
            }
          }

          return (getLocation() === sdk.game.locations.CreateGame);
        },

        openJoinGameWindow: function () {
          let currentLoc = getLocation();

          if (!Controls.JoinGameWindow.click()) {
            return;
          }

          // in case create button gets bugged
          if (!Starter.locationTimeout(5000, currentLoc)) {
            if (!Controls.CreateGameWindow.click()) {
              return;
            }

            if (!Controls.JoinGameWindow.click()) {
              return;
            }
          }
        },

        login: function (otherMultiCheck = false) {
          Starter.inGame && (Starter.inGame = false);
          let currLocation = getLocation();
          
          if (otherMultiCheck && currLocation === sdk.game.locations.OtherMultiplayer) {
            return ControlAction.loginOtherMultiplayer();
          }

          if (currLocation === sdk.game.locations.MainMenu) {
            if (Profile().type === sdk.game.profiletype.SinglePlayer
              && Starter.firstRun
              && Controls.SinglePlayer.click()) {
              return true;
            }
          }

          // Wrong char select screen fix
          if (getLocation() === sdk.game.locations.CharSelect) {
            hideConsole(); // seems to fix odd crash with single-player characters if the console is open to type in
            if ((Profile().type === sdk.game.profiletype.Battlenet && !Controls.CharSelectCurrentRealm.control)
              || ((Profile().type !== sdk.game.profiletype.Battlenet && Controls.CharSelectCurrentRealm.control))) {
              Controls.BottomLeftExit.click();
            
              return false;
            }
          }

          // Multiple realm botting fix in case of R/D or disconnect
          if (Starter.firstLogin && getLocation() === sdk.game.locations.Login) {
            Controls.BottomLeftExit.click();
          }
      
          D2Bot.updateStatus("Logging In");
              
          try {
            login(me.profile);
          } catch (e) {
            if (getLocation() === sdk.game.locations.CharSelect && Starter.loginRetry < 2) {
              if (!ControlAction.findCharacter(Starter.profileInfo)) {
                // dead hardcore character on sp
                if (getLocation() === sdk.game.locations.OkCenteredErrorPopUp) {
                  // Exit from that pop-up
                  Controls.OkCentered.click();
                  D2Bot.printToConsole("Character died", sdk.colors.D2Bot.Red);
                  D2Bot.stop();
                } else {
                  Starter.loginRetry++;
                }
              } else {
                login(me.profile);
              }
            } else if (getLocation() === sdk.game.locations.TcpIpEnterIp && Profile().type === sdk.game.profiletype.TcpIpJoin) {
              return true; // handled in its own case
            } else {
              console.error(e, " " + getLocation());
            }
          }

          return true;
        },

        otherMultiplayerSelect: function () {
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
      };
    })(),
  };

  return {
    ControlAction: ControlAction,
    Starter: Starter,
  };
}));
