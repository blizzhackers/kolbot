/**
*  @filename    TristramLeech.js
*  @author      ToS/XxXGoD/YGM, theBGuy
*  @desc        Tristram Leech (Helper)
*
*/

function TristramLeech () {
  include("core/Common/Leecher.js");
  let done = false;
  let whereisleader, leader;
  
  const chatEvent = function (nick, msg) {
    if (nick === leader && msg.toLowerCase() === "tristdone") {
      done = true;
    }
  };
  
  Town.doChores();
  Town.goToTown(1);
  Town.move("portalspot");

  if (Config.Leader) {
    leader = (Config.Leader || Config.TristramLeech.Leader);
    if (!Misc.poll(() => Misc.inMyParty(leader), Time.seconds(30), 1000)) {
      throw new Error("TristramLeech: Leader not partied");
    }
  }

  !leader && (leader = Misc.autoLeaderDetect({
    destination: sdk.areas.Tristram,
    quitIf: (area) => Common.Leecher.nextScriptAreas.includes(area),
    timeout: Time.minutes(5)
  }));

  if (leader) {
    try {
      const Worker = require("../modules/Worker");
      addEventListener("chatmsg", chatEvent);

      Common.Leecher.leader = leader;
      Common.Leecher.currentScript = Loader.scriptName();
      Common.Leecher.killLeaderTracker = false;
      Worker.runInBackground.leaderTracker = Common.Leecher.leaderTracker;

      if (!Misc.poll(() => {
        if (done) return true;
        if (Pather.getPortal(sdk.areas.Tristram, Config.Leader || null)
          && Pather.usePortal(sdk.areas.Tristram, Config.Leader || null)) {
          return true;
        }

        return false;
      }, Time.minutes(5), 1000)) {
        throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
      }

      Precast.doPrecast(true);
      delay(3000);

      whereisleader = Misc.poll(() => {
        let lead = getParty(leader);

        if (lead.area === sdk.areas.Tristram) {
          return lead;
        }

        return false;
      }, Time.minutes(3), 1000);
      
      while (true) {
        if (done) return true;

        whereisleader = getParty(leader);
        let leaderUnit = Misc.getPlayerUnit(leader);

        if (whereisleader.area !== sdk.areas.Tristram && !Misc.poll(() => {
          let lead = getParty(leader);

          if (lead.area === sdk.areas.Tristram) {
            return true;
          }

          return false;
        }, Time.minutes(3), 1000)) {
          console.log("Leader wasn't in tristram for longer than 3 minutes, End script");

          break;
        }

        if (whereisleader.area === me.area) {
          try {
            if (copyUnit(leaderUnit).x) {
              if (Config.TristramLeech.Helper && leaderUnit.distance > 4) {
                Pather.moveToUnit(leaderUnit) && Attack.clear(10);
              }
              !Config.TristramLeech.Helper && leaderUnit.distance > 20 && Pather.moveNearUnit(leaderUnit, 15);
            } else {
              if (Config.TristramLeech.Helper) {
                Pather.moveTo(copyUnit(leaderUnit).x, copyUnit(leaderUnit).y) && Attack.clear(10);
              }
              !Config.TristramLeech.Helper && Pather.moveNear(copyUnit(leaderUnit).x, copyUnit(leaderUnit).y, 15);
            }
          } catch (err) {
            if (whereisleader.area === me.area) {
              Config.TristramLeech.Helper && Pather.moveTo(whereisleader.x, whereisleader.y) && Attack.clear(10);
              !Config.TristramLeech.Helper && Pather.moveNear(whereisleader.x, whereisleader.y, 15);
            }
          }
        }

        delay(100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      removeEventListener("chatmsg", chatEvent);
      Common.Leecher.killLeaderTracker = true;
    }
  }

  if (!me.inTown && Town.goToTown()) throw new Error("Failed to get back to town");

  return true;
}
