/**
*  @filename    Nihlathak.js
*  @author      kolton, theBGuy
*  @desc        kill Nihlathak
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Nihlathak = new Runnable(
  function Nihlathak () {
    Town.goToTown(5);

    !Pather.initialized && Pather.useWaypoint(null, true);

    // UseWaypoint if set to or if we already have it
    if (Config.Nihlathak.UseWaypoint || me.haveWaypoint(sdk.areas.HallsofPain)) {
      Pather.useWaypoint(sdk.areas.HallsofPain);
    } else {
      if (Pather.journeyTo(sdk.areas.NihlathaksTemple)) {
        Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain], true);
      }
    }

    Precast.doPrecast(false);

    if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) throw new Error("Failed to go to Nihlathak");

    // faster detection of TombVipers
    /** @returns {void} Throws a ScriptError to abort if Tomb Vipers are found and ViperQuit is enabled. */
    Pather.moveToPresetObject(me.area, sdk.objects.NihlathaksPlatform, { callback: () => {
      if (Config.Nihlathak.ViperQuit && Game.getMonster(sdk.monsters.TombViper2)) {
        console.log("Tomb Vipers found.");
        throw new ScriptError("Tomb Vipers found.");
      }
    } });

    Attack.kill(sdk.monsters.Nihlathak);
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.Harrogath,
    bossid: sdk.monsters.Nihlathak,
  }
);
