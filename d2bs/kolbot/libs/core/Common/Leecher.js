/**
*  @filename    Leecher.js
*  @author      theBGuy
*  @desc        Leecher tools
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Leecher", {
    value: {
      leadTick: 0,
      leader: null,
      killLeaderTracker: false,
      currentScript: "",
      nextScriptAreas: [sdk.areas.TowerCellarLvl5, sdk.areas.PitLvl1, sdk.areas.PitLvl2, sdk.areas.BurialGrounds,
        sdk.areas.CatacombsLvl4, sdk.areas.MooMooFarm, sdk.areas.DuranceofHateLvl3,
        sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber
      ],

      leaderTracker: function () {
        if (Common.Leecher.killLeaderTracker) return false;
        // check every 3 seconds
        if (getTickCount() - Common.Leecher.leadTick < 3000) return true;
        Common.Leecher.leadTick = getTickCount();

        // check again in another 3 seconds if game wasn't ready
        if (!me.gameReady) return true;
        if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");

        let party = getParty(Common.Leecher.leader);

        if (party) {
          // Player has moved on to another script
          if (Common.Leecher.nextScriptAreas.includes(party.area)) {
            if (Loader.scriptName() === Common.Leecher.currentScript) {
              Common.Leecher.killLeaderTracker = true;
              throw new Error("Party leader is running a new script");
            } else {
              // kill process
              return false;
            }
          }
        }

        return true;
      }
    },
    configurable: true,
  });
})(Common);
