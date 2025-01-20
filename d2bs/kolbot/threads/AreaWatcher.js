/**
*  @filename    AreaWatcher.js
*  @author      dzik, theBGuy
*  @desc        suicide walk prevention
*
*/
js_strict(true);
include("critical.js");
includeCoreLibs();

/**
 * @todo redo this, feels messy
 */

function main() {
  let _default = getScript("default.dbj");
  console.log("ÿc3Start AreaWatcher");
  
  while (true) {
    try {
      if (me.gameReady && me.ingame && !me.inTown) {
        // additonal check for wierd behavior - it shouldn't be possbile to run out of town in less than 30 seconds in game
        if (getTickCount() - me.gamestarttime < Time.seconds(30)) continue;
        !!_default && _default.stop();
        D2Bot.printToConsole("Saved from suicide walk!");
        !!_default && !_default.running ? quit() : D2Bot.restart();
      }
    } catch (e) {
      console.warn("AreaWatcher failed somewhere. ", e);
    }
    delay(1000);
  }
}
