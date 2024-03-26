/**
*  @filename    Eldritch.js
*  @author      kolton, theBGuy
*  @desc        kill Eldritch the Rectifier, optionally kill Shenk the Overseer, Dac Farren and open chest
*
*/

function Eldritch () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.FrigidHighlands);
  Precast.doPrecast(true);
  let { x, y } = me;
  Pather.moveTo(3745, 5084);
  Attack.kill(getLocaleString(sdk.locale.monsters.EldritchtheRectifier));
  
  try {
    // FrigidHighlands returns invalid size with getBaseStat('leveldefs', 111, ['SizeX', 'SizeX(N)', 'SizeX(H)'][me.diff]);
    // Could this be causing crashes here?
    if (Config.Eldritch.OpenChest
      && Pather.moveNearPreset(sdk.areas.FrigidHighlands, sdk.unittype.Object, sdk.objects.LargeSparklyChest, 10)) {
      Misc.openChest(sdk.objects.FrigidHighlandsChest) && Pickit.pickItems();
      // check distance from current location to shenk and if far tp to town and use wp instead
      if ([x, y].distance > 120 || !Pather.canTeleport()) {
        Town.goToTown() && Pather.useWaypoint(sdk.areas.FrigidHighlands);
      }
    }
  } catch (e) {
    console.warn("(Eldritch) :: Failed to open chest. " + e);
  }

  try {
    if (Config.Eldritch.KillShenk && Pather.moveToExit(sdk.areas.BloodyFoothills, false) && Pather.moveTo(3876, 5130)) {
      Attack.kill(getLocaleString(sdk.locale.monsters.ShenktheOverseer));
    }
  } catch (e) {
    console.warn("(Eldritch) :: Failed to Kill Shenk. " + e);
  }

  if (Config.Eldritch.KillDacFarren
    && Pather.moveNearPreset(sdk.areas.BloodyFoothills, sdk.unittype.Monster, sdk.monsters.preset.DacFarren, 10)
    && Pather.moveTo(4478, 5108)) {
    Attack.kill(getLocaleString(sdk.locale.monsters.DacFarren));
  }

  return true;
}
