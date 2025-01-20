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
})(module, require, typeof Worker === "object" && Worker || require("../Worker"));
