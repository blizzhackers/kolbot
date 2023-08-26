/**
*  @filename    Pindleskin.js
*  @author      kolton, theBGuy
*  @desc        kill Pindleskin and optionally Nihlathak
*
*/

function Pindleskin () {
  Town.goToTown((Config.Pindleskin.UseWaypoint ? undefined : 5));
  Town.doChores();

  if (Config.Pindleskin.UseWaypoint) {
    Pather.useWaypoint(sdk.areas.HallsofPain);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.NihlathaksTemple], true)) {
      throw new Error("Failed to move to Nihlahak's Temple");
    }
  } else {
    if (!Pather.journeyTo(sdk.areas.NihlathaksTemple)) throw new Error("Failed to use portal.");
    Precast.doPrecast(true);
  }

  Pather.moveTo(10058, 13234);

  try {
    Attack.kill(getLocaleString(sdk.locale.monsters.Pindleskin));
  } catch (e) {
    console.error(e);
  }

  if (Config.Pindleskin.KillNihlathak) {
    if (!Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain, sdk.areas.HallsofVaught], true)) {
      throw new Error("Failed to move to Halls of Vaught");
    }

    // faster detection of TombVipers
    Pather.moveToPresetObject(me.area, sdk.objects.NihlathaksPlatform, { offX: 10, offY: 10, callback: () => {
      if (Config.Pindleskin.ViperQuit && Game.getMonster(sdk.monsters.TombViper2)) {
        console.log("Tomb Vipers found.");
        throw new ScriptError("Tomb Vipers found.");
      }
    } });

    Config.Pindleskin.ClearVipers && Attack.clearList(Attack.getMob(sdk.monsters.TombViper2, 0, 20));

    Attack.kill(sdk.monsters.Nihlathak);
    Pickit.pickItems();
  }

  return true;
}
