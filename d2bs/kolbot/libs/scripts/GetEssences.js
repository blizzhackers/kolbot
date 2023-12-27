/**
*  @filename    GetEssences.js
*  @author      magace
*  @credits     Kolton for the origional GetKeys.JS
*  @desc        get them essences
*
*/

function GetEssences () {
  Town.doChores();

  if (me.getItemsEx(sdk.quest.item.TwistedEssenceofSuffering, sdk.items.mode.inStorage).length < 1) {
    try {
      Loader.runScript("Andariel");
    } catch (e) {
      console.error("ÿc1Andariel failed :: ", e);
    }
  }

  if (me.getItemsEx(sdk.quest.item.ChargedEssenceofHatred, sdk.items.mode.inStorage).length < 1) {
    try {
      Loader.runScript("Mephisto", Config.GetEssences.MoatTrick ? (Config.Mephisto.MoatTrick = true) : (Config.Mephisto.MoatTrick = false));
    } catch (e) {
      console.error("ÿc1Mephisto failed :: ", e);
    }
  }
  
  if (me.getItemsEx(sdk.quest.item.BurningEssenceofTerror, sdk.items.mode.inStorage).length < 1) {
    try {
      Loader.runScript("Diablo", Config.GetEssences.FastDiablo ? (Config.Diablo.Fast = true) : (Config.Diablo.Fast = false));
    } catch (e) {
      console.error("ÿc1Diablo failed :: ", e);
    }
  }

  if (me.getItemsEx(sdk.quest.item.FesteringEssenceofDestruction, sdk.items.mode.inStorage).length < 1) {
    try {
      Loader.runScript("Baal");
    } catch (e) {
      console.error("ÿc1Baal failed :: ", e);
    }
  }

  return true;
}