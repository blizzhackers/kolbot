/**
*  @filename    Icehawk.js
*  @author      kolton
*  @desc        kill Icehawk Riftwing
*
*/

function Icehawk () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.KurastBazaar);
  Precast.doPrecast(true);

  if (!Pather.moveToExit([sdk.areas.A3SewersLvl1, sdk.areas.A3SewersLvl2], false)) {
    throw new Error("Failed to move to Icehawk");
  }

  Attack.kill(getLocaleString(sdk.locale.monsters.IcehawkRiftwing));

  return true;
}
