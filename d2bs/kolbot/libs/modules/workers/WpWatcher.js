/**
*  @filename    WpWatcher.js
*  @author      theBGuy
*  @desc        Worker script for cacheing and watching waypoints
*
*/

(function (module, require, Worker) {
  // Only load this in global scope
  if (new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
    let waitTick = getTickCount();
    let done = false;

    // Start
    /**
     * Waits for the waypoint UI to open, caches all waypoints once, and broadcasts them to other scripts.
     * @returns {boolean} always true, to keep the background worker looping
     */
    Worker.runInBackground.WpWatcher = function () {
      if (done) return true;
      if (getTickCount() - waitTick < 100) return true;
      waitTick = getTickCount();
      if (!me.gameReady) return true;

      // Waypoint is open, so lets cache it
      if (!getUIFlag(sdk.uiflags.Waypoint)) {
        return true;
      }

      // Cache the waypoints
      const waypoints = Pather.wpAreas.map(function (area, index) {
        return getWaypoint(index, true);
      });
      me.waypoints = waypoints;
      Pather.initialized = true;
      scriptBroadcast({ type: "cache-waypoints", data: waypoints });
      done = true;

      return true;
    };

    console.log("ÿc2Kolbotÿc0 :: Waypoint Watcher running");
  }
// eslint-disable-next-line no-undef -- typeof-guarded probe: short-circuit means the bare Worker is never evaluated
})(module, require, typeof Worker === "object" && Worker || require("../Worker"));
