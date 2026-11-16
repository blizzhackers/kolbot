/**
*  @filename    Tombs.js
*  @author      kolton, theBGuy
*  @desc        clear Tal Rasha's Tombs, optionally kill duriel as well
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Tombs = new Runnable(
  function Tombs() {
    Pather.useWaypoint(sdk.areas.CanyonofMagic);
    Precast.doPrecast(true);
    const correctTomb = getRoom().correcttomb;

    for (let i = sdk.areas.TalRashasTomb1; i <= sdk.areas.TalRashasTomb7; i++) {
      try {
        if (!Pather.journeyTo(i, true)) throw new Error("Failed to move to tomb");
    
        Attack.clearLevel(Config.ClearType);
    
        if (Config.Tombs.KillDuriel && me.inArea(correctTomb)) {
          Pather.journeyTo(sdk.areas.DurielsLair) && Attack.kill(sdk.monsters.Duriel);
          Pather.journeyTo(sdk.areas.CanyonofMagic);
        }
    
        if (!Pather.moveToExit(sdk.areas.CanyonofMagic, true)) throw new Error("Failed to move to Canyon");
      } catch (e) {
        console.error(e);
      }
    }

    return true;
  },
  {
    startArea: sdk.areas.CanyonofMagic
  }
);
