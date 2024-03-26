/**
*  @filename    Bonesaw.js
*  @author      kolton
*  @desc        kill Bonesaw Breaker
*
*/

function Bonesaw () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.GlacialTrail);
  Precast.doPrecast(true);

  if (!Pather.moveToPresetObject(sdk.areas.GlacialTrail, sdk.objects.LargeSparklyChest, { offX: 15, offY: 15 })) {
    throw new Error("Failed to move to Bonesaw");
  }

  Attack.kill(getLocaleString(sdk.locale.monsters.BonesawBreaker));
  if (Config.Bonesaw.ClearDrifterCavern && Pather.moveToExit(sdk.areas.DrifterCavern, true)) {
    Attack.clearLevel(Config.ClearType);
  }
  return true;
}
