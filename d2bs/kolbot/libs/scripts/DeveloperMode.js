/**
*  @filename    Developermode.js
*  @author      theBGuy
*  @desc        developer mode made easy - run commands or scripts from chat commands. View packets. See unit info
*
*/

const DeveloperMode = new Runnable(
  function DeveloperMode () {
    const className = sdk.player.class.nameOf(me.classid);
    
    /**
     * @param {string} str 
     * @param {boolean} [toConsole=false] 
     * @param {number | string} [color=0] 
     */
    const log = function (str = "", toConsole = false, color = 0) {
      console.log("ÿc8Dev Modeÿc0: " + str);
      me.overhead(str);

      if (toConsole && typeof color === "string") {
        color = color.capitalize(true);
        color = !!sdk.colors.D2Bot[color] ? sdk.colors.D2Bot[color] : 0;
      }
      toConsole && D2Bot.printToConsole("Dev Mode :: " + str, color);
    };

    let [done, action, command, userAddon, test] = [false, false, false, false, false];
    let [watchSent, watchRecv, blockSent, blockRecv] = [[], [], [], []];
    
    /**
     * @param {string} msg 
     * @returns {void}
     */
    const runCommand = function (msg) {
      if (msg.length <= 1) return;

      let cmd = msg.split(" ")[0].split(".")[1];
      let msgList = msg.split(" ");

      switch (cmd.toLowerCase()) {
      case "me":
        log("Character Level: " + me.charlvl + " | Area: " + me.area + " | x: " + me.x + ", y: " + me.y);

        break;
      case "useraddon":
        userAddon = !userAddon;
        me.overhead("userAddon set to " + userAddon);

        break;
      case "run":
        if (msgList.length < 2) {
          console.log("ÿc1Missing arguments");
        } else {
          action = msgList[1];
        }

        break;
      case "done":
        done = true;

        break;
      case "testing":
        test = true;

        break;
      case "command":
        if (msgList.length < 2) {
          console.log("ÿc1Missing arguments");
        } else {
          command = msgList.splice(1).join(" ");
        }

        break;
      case "watch":
        if (msgList.length < 3) {
          console.log("ÿc1Missing arguments");
          break;
        }

        switch (msgList[1].toLowerCase()) {
        case "sent":
          if (msgList[2] === "list") {
            console.log("Watching sent packets : ÿc8" + watchSent.join(", "));
            break;
          }

          watchSent.push(msgList[2]);
          console.log("Added ÿc80x" + msgList[2] + "ÿc0 (sent) to watch list");
          break;

        case "recv":
          if (msgList[2] === "list") {
            console.log("Watching received packets : ÿc8" + watchRecv.join(", "));
            break;
          }

          watchRecv.push(msgList[2]);
          console.log("Added ÿc80x" + msgList[2] + "ÿc0 (recv) to watch list");
          break;

        default:
          console.log("ÿc1Invalid argument : " + msgList[1]);
          break;
        }

        break;

      case "!watch":
        if (msgList.length < 3) {
          console.log("ÿc1Missing arguments");
          break;
        }

        switch (msgList[1].toLowerCase()) {
        case "sent":
          if (watchSent.indexOf(msgList[2]) > -1) watchSent.splice(watchSent.indexOf(msgList[2]), 1);
          console.log("Removed packet ÿc80x" + msgList[2] + "ÿc0 (sent) from watch list");
          break;

        case "recv":
          if (watchRecv.indexOf(msgList[2]) > -1) watchRecv.splice(watchRecv.indexOf(msgList[2]), 1);
          console.log("Removed packet ÿc80x" + msgList[2] + "ÿc0 (recv) from watch list");
          break;

        default:
          console.log("ÿc1Invalid argument : " + msgList[1]);
          break;
        }

        break;

      case "block":
        if (msgList.length < 3) {
          console.log("ÿc1Missing arguments");
          break;
        }

        switch (msgList[1].toLowerCase()) {
        case "sent":
          if (msgList[2] === "list") {
            console.log("Blocking sent packets : ÿc8" + blockSent.join(", "));
            break;
          }

          blockSent.push(msgList[2]);
          console.log("Added ÿc80x" + msgList[2] + "ÿc0 (sent) to block list");
          break;

        case "recv":
          if (msgList[2] === "list") {
            console.log("Blocking received packets : ÿc8" + blockRecv.join(", "));
            break;
          }

          blockRecv.push(msgList[2]);
          console.log("Added ÿc80x" + msgList[2] + "ÿc0 (recv) to block list");
          break;

        default:
          console.log("ÿc1Invalid argument : " + msgList[1]);
          break;
        }

        break;

      case "!block":
        if (msgList.length < 3) {
          console.log("ÿc1Missing arguments");
          break;
        }

        switch (msgList[1].toLowerCase()) {
        case "sent":
          if (blockSent.indexOf(msgList[2]) > -1) blockSent.splice(blockSent.indexOf(msgList[2]), 1);
          console.log("Removed packet ÿc80x" + msgList[2] + "ÿc0 (sent) from block list");
          break;

        case "recv":
          if (blockRecv.indexOf(msgList[2]) > -1) blockRecv.splice(blockRecv.indexOf(msgList[2]), 1);
          console.log("Removed packet ÿc80x" + msgList[2] + "ÿc0 (recv) from block list");
          break;

        default:
          console.log("ÿc1Invalid argument : " + msgList[1]);
          break;
        }

        break;
      }
    };

    // Received packet handler
    const packetReceived = function (pBytes) {
      let ID = pBytes[0].toString(16);

      // Block received packets from list
      if (blockRecv.includes(ID)) return true;

      if (watchRecv.includes(ID)) {
        let size = pBytes.length;
        let array = [].slice.call(pBytes);
        array.shift();
        console.log("ÿc2S  ÿc8" + ID + "ÿc0 " + array.join(" ") + "  ÿc5(" + size + " Bytes)");
      }

      return false;
    };

    // Sent packet handler
    const packetSent = function (pBytes) {
      let ID = pBytes[0].toString(16);

      // Block all commands or irc chat from being sent to server
      if (ID === "15") {
        if (pBytes[3] === 46) {
          let str = "";

          for (let b = 3; b < pBytes.length - 3; b++) {
            str += String.fromCharCode(pBytes[b]);
          }

          if (pBytes[3] === 46) {
            runCommand(str);
            return true;
          }
        }
      }

      // Block sent packets from list
      if (blockSent.includes(ID)) return true;

      if (watchSent.includes(ID)) {
        let size = pBytes.length;
        let array = [].slice.call(pBytes);
        array.shift();
        console.log("ÿc2C  ÿc8" + ID + "ÿc0 " + array.join(" ") + "  ÿc5(" + size + " Bytes)");
      }

      return false;
    };

    /**
     * @param {number} key 
     */
    const keyEvent = function (key) {
      switch (key) {
      case sdk.keys.Spacebar:
        FileTools.copy("libs/config/" + className + ".js", "libs/config/" + className + "." + me.name + ".js");
        log("libs/config/" + className + "." + me.name + ".js has been created.", true);
        log("Please configure your bot and reload or restart", true);

        break;
      }
    };

    const copiedConfig = copyObj(Config);
    const UnitInfo = new (require("../modules/UnitInfo"));

    try {
      console.log("starting developermode");
      me.overhead("Started developer mode");
      addEventListener("gamepacketsent", packetSent);
      addEventListener("gamepacket", packetReceived);

      if (!FileTools.exists("libs/config/" + className + "." + me.name + ".js")) {
        console.log("ÿc4UserAddonÿc0: Press HOME and then press SPACE if you want to create character config.");
        addEventListener("keyup", keyEvent);
      }
      Config.Silence = false;

      while (!done) {
        if (action) {
          try {
            let script = Loader.fileList.find(function (el) {
              return String.isEqual(el, action);
            });

            if (!script) {
              throw new Error("Failed to find script: " + action);
            }
            includeIfNotIncluded("scripts/" + script + ".js");

            UnitInfo.check();

            if (isIncluded("scripts/" + script + ".js")) {
              try {
                Loader.runScript(script);
              } catch (e) {
                console.error(e);
              }
            } else {
              console.warn("Failed to include: " + script);
            }
          } catch (e) {
            console.error(e);
          }

          me.overhead("Done with action");
          action = false;
        }

        if (command) {
          UnitInfo.check();

          try {
            eval(command);
          } catch (e) {
            console.error(e);
          }

          me.overhead("Done with action");
          command = false;
        }

        if (userAddon) {
          UnitInfo.createInfo(Game.getSelectedUnit());
        }

        if (test) {
          me.overhead("done");
          test = false;
        }

        delay(100);
      }
    } finally {
      removeEventListener("keyup", keyEvent);
      removeEventListener("gamepacketsent", packetSent);
      removeEventListener("gamepacket", packetReceived);
      Config = copiedConfig;
      UnitInfo.remove();
    }
    
    return true;
  },
  {
    preAction: null
  }
);
