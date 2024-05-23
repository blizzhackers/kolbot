/**
*  @filename    GetKeys.js
*  @author      kolton, theBGuy
*  @desc        get them keys
*
*/

const GetKeys = new Runnable(
  function GetKeys () {
    /**
     * @param {number} id 
     * @returns {number}
     */
    const count = function (id) {
      return me.getItemsEx(id, sdk.items.mode.inStorage).length;
    };

    if (count(sdk.items.quest.KeyofTerror) < 3) {
      try {
        Loader.runScript("Countess");
      } catch (e) {
        console.error("ÿc1Countess failed :: ", e);
      }
    }

    if (count(sdk.items.quest.KeyofHate) < 3) {
      try {
        Loader.runScript("Summoner", () => Config.Summoner.FireEye = false);
      } catch (e) {
        console.error("ÿc1Summoner failed :: ", e);
      }
    }

    if (count(sdk.items.quest.KeyofDestruction) < 3) {
      try {
        Loader.runScript("Nihlathak");
      } catch (e) {
        console.error("ÿc1Nihlathak failed :: ", e);
      }
    }

    return true;
  }
);
