/**
*  @filename    KillDclone.js
*  @author      kolton
*  @desc        Go to Palace Cellar level 3 and kill Diablo Clone.
*
*/

function KillDclone () {
  Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
  Precast.doPrecast(true);

  if (!Pather.usePortal(null)) {
    throw new Error("Failed to move to Palace Cellar");
  }

  Attack.kill(sdk.monsters.DiabloClone);
  Pickit.pickItems();

  if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
    scriptBroadcast("muleAnni");
  }

  return true;
}
