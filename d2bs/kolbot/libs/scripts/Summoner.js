/**
*  @filename    Summoner.js
*  @author      kolton, theBGuy
*  @desc        kill the Summoner
*
*/

function Summoner () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
  Precast.doPrecast(true);

  if (Config.Summoner.FireEye) {
    try {
      if (!Pather.usePortal(null)) throw new Error("Failed to move to Fire Eye");
      Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.FireEye));
    } catch (e) {
      console.error(e);
    }
  }

  if (me.inArea(sdk.areas.PalaceCellarLvl3) && !Pather.usePortal(null)) {
    throw new Error("Failed to move back to arcane");
  }
  if (!Pather.moveToPresetObject(me.area, sdk.quest.chest.Journal, { offX: -3, offY: -3 })) {
    throw new Error("Failed to move to Summoner");
  }

  Attack.clear(15, 0, sdk.monsters.TheSummoner);

  // always take portal, faster access to wp
  // first check if portal is already up
  let portal = Game.getObject(sdk.objects.RedPortal);

  if (!portal || !Pather.usePortal(null, null, portal)) {
    for (let i = 0; i < 5; i++) {
      // couldn't find portal, attempt to interact with journal
      let journal = Game.getObject(sdk.objects.Journal);

      // couldnt find journal? Move to it's preset
      if (!journal) {
        Pather.moveToPresetObject(me.area, sdk.objects.Journal);
        continue;
      } else if (journal && journal.distance > (18 - i)) {
        Pather.moveNearUnit(journal, 13);
      }

      Packet.entityInteract(journal);
      Misc.poll(() => getIsTalkingNPC() || Game.getObject(sdk.objects.RedPortal), 2000, 200);
      me.cancel() && me.cancel();

      if (Pather.usePortal(sdk.areas.CanyonofMagic)) {
        break;
      }
    }
  }

  if (me.inArea(sdk.areas.CanyonofMagic)) {
    Loader.scriptName(1) === "Duriel"
      ? Loader.skipTown.push("Duriel")
      : Pather.useWaypoint(sdk.areas.LutGholein);
  }

  return true;
}
