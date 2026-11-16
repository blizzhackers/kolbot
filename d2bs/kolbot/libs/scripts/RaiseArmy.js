/**
*  @filename    RaiseArmy.js
*  @author      theBGuy
*  @desc        go through pindle portal and raise an army of skeletons, then return to town
*
*/

const RaiseArmy = new Runnable(
  function RaiseArmy () {
    if (!me.necromancer || (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0)) {
      console.warn("This script is only meant to be used with a necromancer configured to raise an army of skeletons and/or revives.");
      return true;
    }
    
    Town.goToTown(5);

    if (!Pather.journeyTo(sdk.areas.NihlathaksTemple)) {
      throw new Error("Failed to use portal.");
    }
    Precast.doPrecast(true);
    Pather.moveTo(10053, 13278);

    ClassAttack[sdk.player.class.Necromancer].raiseArmy();
    Town.goToTown();

    return true;
  },
  {
    startArea: sdk.areas.Harrogath,
  }
);

Loader.register("RaiseArmy", RaiseArmy);
