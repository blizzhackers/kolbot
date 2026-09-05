/**
*  @filename    BoneAsh.js
*  @author      kolton, theBGuy
*  @desc        kill Bone Ash
*
*/

const BoneAsh = new Runnable(
  function BoneAsh () {
    Pather.useWaypoint(sdk.areas.InnerCloister);
    Precast.doPrecast(true);

    if (!Pather.moveTo(20047, 4898)) throw new Error("Failed to move to Bone Ash");

    Attack.kill(getLocaleString(sdk.locale.monsters.BoneAsh));
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.InnerCloister,
    bossid: getLocaleString(sdk.locale.monsters.BoneAsh),
  }
);
