/**
*  @filename    Izual.js
*  @author      kolton
*  @desc        kill Izual
*
*/

function Izual () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.CityoftheDamned);
  Precast.doPrecast(true);

  if (!Pather.moveToPresetMonster(sdk.areas.PlainsofDespair, sdk.monsters.Izual)) {
    throw new Error("Failed to move to Izual.");
  }

  Attack.kill(sdk.monsters.Izual);
  Pickit.pickItems();

  return true;
}
