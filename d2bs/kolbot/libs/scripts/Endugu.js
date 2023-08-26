/**
*  @filename    Endugu.js
*  @author      kolton
*  @desc        kill Witch Doctor Endugu
*
*/

function Endugu () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.FlayerJungle);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([sdk.areas.FlayerDungeonLvl1, sdk.areas.FlayerDungeonLvl2, sdk.areas.FlayerDungeonLvl3], true)
    || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsBrainChest)) {
    throw new Error("Failed to move to Endugu");
  }

  Attack.kill(getLocaleString(sdk.locale.monsters.WitchDoctorEndugu));

  return true;
}
