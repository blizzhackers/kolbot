/**
*  @filename    Icehawk.js
*  @author      kolton, theBGuy
*  @desc        kill Icehawk Riftwing
*
*/

const Icehawk = new Runnable(
  function Icehawk () {
    Pather.useWaypoint(sdk.areas.KurastBazaar);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.A3SewersLvl1, sdk.areas.A3SewersLvl2], false)) {
      throw new Error("Failed to move to Icehawk");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.IcehawkRiftwing));

    return true;
  },
  {
    startArea: sdk.areas.KurastBazaar,
    bossid: getLocaleString(sdk.locale.monsters.IcehawkRiftwing),
  }
);
