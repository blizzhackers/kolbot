/**
*  @filename    Leecher.js
*  @author      theBGuy
*  @desc        Leecher tools
*
*/

(function (module) {
  const Leecher = {
    leadTick: 0,
    leader: null,
    killLeaderTracker: false,
    currentScript: "",
    nextScriptAreas: [sdk.areas.TowerCellarLvl5, sdk.areas.PitLvl1, sdk.areas.PitLvl2, sdk.areas.BurialGrounds,
      sdk.areas.CatacombsLvl4, sdk.areas.MooMooFarm, sdk.areas.DuranceofHateLvl3,
      sdk.areas.ChaosSanctuary, sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber
    ],

    /**
     * Polled every 3 seconds; throws if the game is empty or the leader has moved on to a new script.
     * @returns {boolean} false to signal the caller to kill the tracking process, true to keep polling.
     */
    leaderTracker: function () {
      if (Leecher.killLeaderTracker) return false;
      // check every 3 seconds
      if (getTickCount() - Leecher.leadTick < 3000) return true;
      Leecher.leadTick = getTickCount();

      // check again in another 3 seconds if game wasn't ready
      if (!me.gameReady) return true;
      if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");

      let party = getParty(Leecher.leader);

      if (party) {
        // Player has moved on to another script
        if (Leecher.nextScriptAreas.includes(party.area)) {
          if (Loader.scriptName() === Leecher.currentScript) {
            Leecher.killLeaderTracker = true;
            throw new Error("Party leader is running a new script");
          } else {
            // kill process
            return false;
          }
        }
      }

      return true;
    }
  };

  module.exports = Leecher;
})(module);
