/**
*  @filename    Hephasto.js
*  @author      kolton
*  @desc        kill Hephasto the Armorer - optionally clear river
*
*/

const Hephasto = new Runnable(
  function Hephasto () {
    Pather.useWaypoint(sdk.areas.RiverofFlame);
    Precast.doPrecast(true);

    if (!Attack.haveKilled(sdk.monsters.Hephasto)) {
      if (!Pather.moveToPresetObject(me.area, sdk.quest.chest.HellForge)) {
        throw new Error("Failed to move to Hephasto");
      }

      try {
        Attack.kill(sdk.monsters.Hephasto);
      } catch (e) {
        console.log("Heph not found. Carry on");
      }

      Pickit.pickItems();
    }
    
    Config.Hephasto.ClearRiver && Attack.clearLevel(Config.Hephasto.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.RiverofFlame
  }
);
