/**
*  @filename    GetKeys.js
*  @author      kolton
*  @desc        get them keys
*
*/

function GetKeys () {
  Town.doChores();

  if (me.getItemsEx(sdk.items.quest.KeyofTerror, sdk.items.mode.inStorage).length < 3) {
    try {
      Loader.runScript("Countess");
    } catch (e) {
      console.error("ÿc1Countess failed :: ", e);
    }
  }

  if (me.getItemsEx(sdk.items.quest.KeyofHate, sdk.items.mode.inStorage).length < 3) {
    try {
      Loader.runScript("Summoner", () => Config.Summoner.FireEye = false);
    } catch (e) {
      console.error("ÿc1Summoner failed :: ", e);
    }
  }

  if (me.getItemsEx(sdk.items.quest.KeyofDestruction, sdk.items.mode.inStorage).length < 3) {
    try {
      Loader.runScript("Nihlathak");
    } catch (e) {
      console.error("ÿc1Nihlathak failed :: ", e);
    }
  }

  return true;
}
