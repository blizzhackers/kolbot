/**
*  @filename    Hephasto.js
*  @author      kolton
*  @desc        kill Hephasto the Armorer - optionally clear river
*
*/

function Hephasto () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.RiverofFlame);
  Precast.doPrecast(true);

  if (!Pather.moveToPresetObject(me.area, sdk.quest.chest.HellForge)) {
    throw new Error("Failed to move to Hephasto");
  }

  try {
    Attack.kill(getLocaleString(sdk.locale.monsters.HephastoTheArmorer));
  } catch (e) {
    print("Heph not found. Carry on");
  }

  Pickit.pickItems();
  Config.Hephasto.ClearRiver && Attack.clearLevel(Config.Hephasto.ClearType);

  return true;
}
