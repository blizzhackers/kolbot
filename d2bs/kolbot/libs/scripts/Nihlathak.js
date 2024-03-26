/**
*  @filename    Nihlathak.js
*  @author      kolton, theBGuy
*  @desc        kill Nihlathak
*
*/

function Nihlathak () {
  Town.goToTown(5);
  Town.doChores();

  !Pather.initialized && Pather.useWaypoint(null, true);

  // UseWaypoint if set to or if we already have it
  if (Config.Nihlathak.UseWaypoint || getWaypoint(Pather.wpAreas.indexOf(sdk.areas.HallsofPain))) {
    Pather.useWaypoint(sdk.areas.HallsofPain);
  } else {
    if (Pather.journeyTo(sdk.areas.NihlathaksTemple)) {
      Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain], true);
    }
  }

  Precast.doPrecast(false);

  if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) throw new Error("Failed to go to Nihlathak");

  // faster detection of TombVipers
  Pather.moveToPresetObject(me.area, sdk.objects.NihlathaksPlatform, { callback: () => {
    if (Config.Nihlathak.ViperQuit && Game.getMonster(sdk.monsters.TombViper2)) {
      console.log("Tomb Vipers found.");
      throw new ScriptError("Tomb Vipers found.");
    }
  } });

  Attack.kill(sdk.monsters.Nihlathak);
  Pickit.pickItems();

  return true;
}
