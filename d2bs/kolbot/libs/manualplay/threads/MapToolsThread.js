/* eslint-disable max-len */
/**
*  @filename    MapToolsThread.js
*  @author      theBGuy
*  @credits     kolton
*  @desc        several tools to help the player - potion use, chicken, Diablo clone stop, map reveal, quit with player
*
*/
js_strict(true);
include("critical.js"); // required

// globals needed for core gameplay
includeCoreLibs();
include("core/Common/Tools.js");

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");

// MapMode
include("manualplay/MapMode.js");
MapMode.include();

function main () {
  // getUnit test
  getUnit(-1) === null && console.warn("getUnit bug detected");
  
  console.log("ÿc9MapToolsThread loaded");

  let ironGolem, debugInfo = { area: 0, currScript: "no entry" };
  let quitFlag = false;
  let quitListDelayTime;
  let canQuit = true;

  D2Bot.init();
  Config.init(false);
  Pickit.init(false);
  Attack.init();
  Storage.Init();
  CraftingSystem.buildLists();
  Runewords.init();
  Cubing.init();

  for (let i = 0; i < 5; i += 1) {
    Common.Toolsthread.timerLastDrink[i] = 0;
  }

  // Reset core chicken
  me.chickenhp = -1;
  me.chickenmp = -1;

  // General functions
  Common.Toolsthread.pauseScripts = [
    "libs/manualplay/main.js",
    "libs/manualplay/threads/pickthread.js",
    "libs/manualplay/threads/maphelper.js",
    "threads/antihostile.js",
    "threads/party.js",
  ];
  Common.Toolsthread.stopScripts = [
    "libs/manualplay/main.js",
    "libs/manualplay/threads/pickthread.js",
    "libs/manualplay/threads/maphelper.js",
    "threads/antihostile.js",
    "threads/party.js",
  ];

  // Event functions
  const keyEvent = function (key) {
    switch (key) {
    case sdk.keys.PauseBreak: // pause main.dbj
      Common.Toolsthread.togglePause();

      break;
    case sdk.keys.Delete: // quit current game
      Common.Toolsthread.exit();

      break;
    case sdk.keys.End: // stop profile and log character
      MuleLogger.logChar();
      delay(rand(Time.seconds(Config.QuitListDelay[0]), Time.seconds(Config.QuitListDelay[1])));
      D2Bot.printToConsole(me.profile + " - end run " + me.gamename);
      D2Bot.stop(me.profile, true);

      break;
    case sdk.keys.NumpadPlus: // log stats
      showConsole();

      console.log("ÿc8My stats :: " + Common.Toolsthread.getStatsString(me));
      let merc = me.getMerc();
      !!merc && console.log("ÿc8Merc stats :: " + Common.Toolsthread.getStatsString(merc));

      break;
    case sdk.keys.NumpadDecimal:
      MuleLogger.logChar();
      me.overhead("Logged char: " + me.name);

      break;
    case sdk.keys.NumpadSlash: // re-load default
      console.log("ÿc8ToolsThread :: " + sdk.colors.Red + "Stopping threads and waiting 5 seconds to restart");
      Common.Toolsthread.stopDefault() && delay(Time.seconds(5));
      console.log("Starting default.dbj");
      load("default.dbj");

      break;
    case sdk.keys.NumpadStar: // precast
      {
        let preSkill = me.getSkill(sdk.skills.get.RightId);

        Precast.doPrecast(true);
        Skill.setSkill(preSkill, sdk.skills.hand.Right);
      }
      
      break;
    }
  };

  const gameEvent = function (mode, param1, param2, name1, name2) {
    switch (mode) {
    case 0x00: // "%Name1(%Name2) dropped due to time out."
    case 0x01: // "%Name1(%Name2) dropped due to errors."
    case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
      if (Config.QuitList.includes(name1) || Config.QuitList.some(str => String.isEqual(str, "all"))) {
        console.log(name1 + (mode === 0 ? " timed out" : " left"));

        if (typeof quitListDelayTime === "undefined" && Config.QuitListDelay.length > 0) {
          let [min, max] = Config.QuitListDelay.sort((a, b) => a - b).map(s => Time.seconds(s));

          quitListDelayTime = getTickCount() + rand(min, max);
        } else {
          quitListDelayTime = getTickCount();
        }

        quitFlag = true;
      }

      if (Config.AntiHostile) {
        scriptBroadcast("remove " + name1);
      }

      break;
    case 0x06: // "%Name1 was Slain by %Name2"
      if (Config.AntiHostile && param2 === 0x00 && name2 === me.name) {
        scriptBroadcast("mugshot " + name1);
      }

      break;
    case 0x07:
      if (Config.AntiHostile && param2 === 0x03) { // "%Player has declared hostility towards you."
        scriptBroadcast("findHostiles");
      }

      break;
    case 0x11: // "%Param1 Stones of Jordan Sold to Merchants"
      if (Config.DCloneQuit === 2) {
        D2Bot.printToConsole("SoJ sold in game. Leaving.");

        quitFlag = true;

        break;
      }

      if (Config.SoJWaitTime && me.expansion) {
        !!me.realm && D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], sdk.colors.D2Bot.DarkGold);
        // Messaging.sendToScript("default.dbj", "soj");
      }

      break;
    case 0x12: // "Diablo Walks the Earth"
      me.expansion && !!me.realm && D2Bot.printToConsole("Diablo Walks the Earth. " + me.gameserverip.split(".")[3], sdk.colors.D2Bot.DarkGold);

      break;
    }
  };

  const scriptEvent = function (msg) {
    switch (msg) {
    case "toggleQuitlist":
      canQuit = !canQuit;

      break;
    case "quit":
      quitFlag = true;

      break;
    }
  };

  // Cache variables to prevent a bug where d2bs loses the reference to Config object
  Config = copyObj(Config);
  let tick = getTickCount();

  addEventListener("keyup", keyEvent);
  addEventListener("gameevent", gameEvent);
  addEventListener("scriptmsg", scriptEvent);

  Config.QuitListMode > 0 && Common.Toolsthread.initQuitList();
  !Array.isArray(Config.QuitList) && (Config.QuitList = [Config.QuitList]); // make it an array for simpler checks

  // Start
  while (true) {
    try {
      if (me.gameReady && !me.inTown) {
        Config.UseHP > 0 && me.hpPercent < Config.UseHP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Health);
        Config.UseRejuvHP > 0 && me.hpPercent < Config.UseRejuvHP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Rejuv);

        if (Config.LifeChicken > 0 && me.hpPercent <= Config.LifeChicken) {
          // takes a moment sometimes for townchicken to actually get to town so re-check that we aren't in town before quitting
          if (!me.inTown) {
            D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + Attack.getNearestMonster() + " in " + getAreaName(me.area) + ". Ping: " + me.ping, sdk.colors.D2Bot.Red);
            Common.Toolsthread.exit(true);

            break;
          }
        }

        Config.UseMP > 0 && me.mpPercent < Config.UseMP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Mana);
        Config.UseRejuvMP > 0 && me.mpPercent < Config.UseRejuvMP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.Rejuv);

        if (Config.ManaChicken > 0 && me.mpPercent <= Config.ManaChicken) {
          D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + getAreaName(me.area), sdk.colors.D2Bot.Red);
          Common.Toolsthread.exit(true);

          break;
        }

        if (Config.IronGolemChicken > 0 && me.necromancer) {
          if (!ironGolem || copyUnit(ironGolem).x === undefined) {
            ironGolem = Common.Toolsthread.getIronGolem();
          }

          if (ironGolem) {
            // ironGolem.hpmax is bugged with BO
            if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) {
              D2Bot.printToConsole("Irom Golem Chicken in " + getAreaName(me.area), sdk.colors.D2Bot.Red);
              Common.Toolsthread.exit(true);

              break;
            }
          }
        }

        if (Config.UseMerc) {
          let merc = me.getMerc();
          if (!!merc) {
            let mercHP = getMercHP();

            if (mercHP > 0 && merc.mode !== sdk.monsters.mode.Dead) {
              if (mercHP < Config.MercChicken) {
                D2Bot.printToConsole("Merc Chicken in " + getAreaName(me.area), sdk.colors.D2Bot.Red);
                Common.Toolsthread.exit(true);

                break;
              }

              mercHP < Config.UseMercHP && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.MercHealth);
              mercHP < Config.UseMercRejuv && Common.Toolsthread.drinkPotion(Common.Toolsthread.pots.MercRejuv);
            }
          }
        }

        if (Config.ViperCheck && getTickCount() - tick >= 250) {
          Common.Toolsthread.checkVipers() && (quitFlag = true);

          tick = getTickCount();
        }

        Common.Toolsthread.checkPing(true) && (quitFlag = true);
      }
    } catch (e) {
      Misc.errorReport(e, "MapToolsThread");
      takeScreenshot();

      quitFlag = true;
    }

    if (quitFlag && canQuit) {
      if (typeof quitListDelayTime !== "undefined" && getTickCount() < quitListDelayTime) {
        me.overhead("Quitting in " + Math.round((quitListDelayTime - getTickCount()) / 1000) + " Seconds");
        continue;
      }
      Common.Toolsthread.checkPing(false); // In case of quitlist triggering first
      Common.Toolsthread.exit();

      break;
    }

    if (debugInfo.area !== getAreaName(me.area)) {
      debugInfo.area = getAreaName(me.area);
      DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
    }

    delay(20);
  }

  return true;
}
