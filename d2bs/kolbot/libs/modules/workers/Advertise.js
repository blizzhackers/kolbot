/**
*  @filename    Advertise.js
*  @author      theBGuy
*  @desc        Worker script for advertising in chat
*
*/

(function (module, require, Worker) {
  // Only load this in global scope
  if (new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
    // handle invalid interval input
    if (!Array.isArray(Config.Advertise.Interval)) {
      if (typeof Config.Advertise.Interval === "number") {
        Config.Advertise.Interval = [Config.Advertise.Interval, Config.Advertise.Interval];
      } else {
        Config.Advertise.Interval = [30, 60];
      }
    } else if (Config.Advertise.Interval.length < 2) {
      if (typeof Config.Advertise.Interval[0] === "number") {
        Config.Advertise.Interval.push(Config.Advertise.Interval[0] + rand(0, 30));
      } else {
        Config.Advertise.Interval = [30, 60];
      }
    }
    const [min, max] = Config.Advertise.Interval;
    let waitTick = getTickCount() + Time.seconds(rand(min, max));

    // Start
    Worker.runInBackground.Advertise = function () {
      if (getTickCount() - waitTick < 0) return true;
      waitTick += Time.seconds(rand(min, max));
      
      say("!" + Config.Advertise.Message, true);

      return true;
    };

    console.log("ÿc2Kolbotÿc0 :: Advertise running");
  }
})(module, require, typeof Worker === "object" && Worker || require("../Worker"));
