/**
*  @filename    Endugu.js
*  @author      kolton
*  @desc        kill Witch Doctor Endugu
*
*/

const Endugu = new Runnable(
  function Endugu () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.FlayerJungle);
    Precast.doPrecast(true);

    const exits = [
      sdk.areas.FlayerDungeonLvl1,
      sdk.areas.FlayerDungeonLvl2,
      sdk.areas.FlayerDungeonLvl3
    ];

    if (!Pather.moveToExit(exits, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsBrainChest)) {
      throw new Error("Failed to move to Endugu");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.WitchDoctorEndugu));

    return true;
  },
  sdk.areas.FlayerJungle
);
