/**
*  @filename    HeartBeat.js
*  @author      kolton
*  @desc        Keep a link with d2bot#. If it's lost, the d2 window is killed
*
*/

function main () {
  include("critical.js");	// required
  D2Bot.init();
  console.log("Heartbeat loaded");

  /**
   * Pauses every running .dbj thread, or resumes them if already paused. @returns {boolean} always true
   */
  function togglePause () {
    let script = getScript();

    if (script) {
      do {
        if (script.name.includes(".dbj")) {
          if (script.running) {
            console.log("ÿc1Pausing ÿc0" + script.name);
            script.pause();
          } else {
            console.log("ÿc2Resuming ÿc0" + script.name);
            script.resume();
          }
        }
      } while (script.getNext());
    }

    return true;
  }

  // Event functions
  /**
   * keyup listener: Pause/Break toggles all .dbj threads while out of game.
   * @param {number} key
   */
  function KeyEvent (key) {
    switch (key) {
    case sdk.keys.PauseBreak:
      if (me.ingame) {
        break;
      }

      togglePause();

      break;
    }
  }

  addEventListener("keyup", KeyEvent);

  while (true) {
    D2Bot.heartBeat();
    delay(1000);
  }
}
