/**
*  @filename    TravincalLeech.js
*  @author      ToS/XxXGoD/YGM/azero, theBGuy
*  @desc        Travincal Leech
*
*/

/**
*  @todo:
*   - add help option
*      - keep within 40 of leader for just leeching
*      - long range help for helper?
*   - add dodge if position is too hot (hydras can kill a low level quickly)
*/

function TravincalLeech () {
  include("core/Common/Leecher.js");
  let leader;
  let done = false;

  const chatEvent = function (nick, msg) {
    if (nick === leader && msg.toLowerCase() === "travdone") {
      done = true;
    }
  };

  Town.goToTown(3);
  Town.doChores();
  Town.move("portalspot");

  if (Config.Leader) {
    leader = Config.Leader;
    if (!Misc.poll(() => Misc.inMyParty(leader), Time.minutes(2), 1000)) {
      throw new Error("TristramLeech: Leader not partied");
    }
  }

  !leader && (leader = Misc.autoLeaderDetect({
    destination: sdk.areas.Travincal,
    quitIf: (area) => Common.Leecher.nextScriptAreas.includes(area),
    timeout: Time.minutes(5)
  }));

  if (leader) {
    try {
      const Worker = require("../modules/Worker");
      addEventListener("chatmsg", chatEvent);

      Common.Leecher.killLeaderTracker = false;
      Common.Leecher.leader = leader;
      Common.Leecher.currentScript = Loader.scriptName();
      Worker.runInBackground.leaderTracker = Common.Leecher.leaderTracker;
      
      while (Misc.inMyParty(Common.Leecher.leader)) {
        if (done) return true;

        if (me.inTown && Pather.getPortal(sdk.areas.Travincal, Common.Leecher.leader)) {
          Pather.usePortal(sdk.areas.Travincal, Common.Leecher.leader);
          Town.getCorpse();
        }
        
        if (me.mode === sdk.player.mode.Dead) {
          me.revive();

          while (!me.inTown) {
            delay(100);
          }

          Town.move("portalspot");
        }

        delay(100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      removeEventListener("chatmsg", chatEvent);
      Common.Leecher.killLeaderTracker = true;
    }
  } else {
    console.warn("No leader found");
  }

  return true;
}
