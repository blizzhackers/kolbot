/**
*  @filename    AntiIdle.js
*  @author      theBGuy
*  @desc        Worker script for idleing in town to prevent disconnects
*
*/

(function (module, require, Worker) {
  // Only load this in global scope
  if (new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
    Worker.runInBackground.antiIdle = (function () {
      let idleTick = 0;
      return function () {
        if (!me.ingame || getTickCount() - me.gamestarttime < Time.minutes(1) || !me.gameReady) return true;
        if (idleTick === 0) {
          idleTick = getTickCount() + Time.seconds(rand(1200, 1500));
          console.log("Anti-idle refresh in: (" + Time.format(idleTick - getTickCount()) + ")");
        }
        if (me.gameReady) {
          if (getTickCount() - idleTick > 0) {
            Packet.questRefresh();
            idleTick += Time.seconds(rand(1200, 1500));
            console.log("Sent anti-idle packet, next refresh in: (" + Time.format(idleTick - getTickCount()) + ")");
          }
        } else if (getLocation() !== null) {
          idleTick = 0;
        }

        return true;
      };
    })();

    console.log("ÿc2Kolbotÿc0 :: AntiIdle running");
  }
// eslint-disable-next-line no-undef -- typeof-guarded probe: short-circuit means the bare Worker is never evaluated
})(module, require, typeof Worker === "object" && Worker || require("../Worker"));
