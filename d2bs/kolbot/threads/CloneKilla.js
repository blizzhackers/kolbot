/**
*  @filename    CloneKilla.js
*  @author      kolton
*  @desc        Kill Diablo Clone when he walks in game. Uses Fire Eye location.
*  @todo
*  - handle if fire eye location isn't possible
*
*/
js_strict(true);
include("critical.js");

// globals needed for core gameplay
includeCoreLibs();

// system libs
includeSystemLibs();
include("systems/mulelogger/MuleLogger.js");
include("systems/gameaction/GameAction.js");

function main() {
  D2Bot.init();
  Config.init();
  Pickit.init();
  Attack.init();
  Storage.Init();
  CraftingSystem.buildLists();
  Runewords.init();
  Cubing.init();
  include("scripts/KillDclone.js");

  if (typeof KillDclone === "function") {
    try {
      D2Bot.printToConsole("Trying to kill DClone.", sdk.colors.D2Bot.DarkGold);
      KillDclone.call();
    } catch (e) {
      Misc.errorReport(e, "CloneKilla.js");
    }
  }

  try {
    quit();
  } finally {
    while (me.ingame) {
      delay(100);
    }
  }

  return true;
}
