/**
*  @filename    GetEssences.js
*  @author      magace
*  @credits     kolton for the original GetKeys
*  @desc        get essences for Token of Absolution
*
*/

const GetEssences = new Runnable(
  function GetEssences () {
    /**
     * @param {number} essence 
     * @returns {number}
     */
    const count = function (essence) {
      return me.getItemsEx(essence, sdk.items.mode.inStorage).length;
    };

    if (count(sdk.quest.item.TwistedEssenceofSuffering) < 1) {
      try {
        Loader.runScript("Andariel");
      } catch (e) {
        console.error("ÿc1Andariel failed :: ", e);
      }
    }

    if (Config.GetEssences.RunDuriel && count(sdk.quest.item.TwistedEssenceofSuffering) < 1) {
      try {
        Loader.runScript("Duriel");
      } catch (e) {
        console.error("ÿc1Duriel failed :: ", e);
      }
    }

    if (count(sdk.quest.item.ChargedEssenceofHatred) < 1) {
      try {
        Config.Mephisto.MoatTrick = Config.GetEssences.MoatMeph;
        Loader.runScript("Mephisto");
      } catch (e) {
        console.error("ÿc1Mephisto failed :: ", e);
      }
    }
    
    if (count(sdk.quest.item.BurningEssenceofTerror) < 1) {
      try {
        Config.Diablo.Fast = Config.GetEssences.FastDiablo;
        Loader.runScript("Diablo");
      } catch (e) {
        console.error("ÿc1Diablo failed :: ", e);
      }
    }

    if (count(sdk.quest.item.FesteringEssenceofDestruction) < 1) {
      try {
        Loader.runScript("Baal");
      } catch (e) {
        console.error("ÿc1Baal failed :: ", e);
      }
    }

    return true;
  }
);
