/**
*  @filename    BattlemaidSarina.js
*  @author      theBGuy
*  @desc        kill Battlemaid Sarina
*
*/

const BattlemaidSarina = new Runnable(
  function BattlemaidSarina () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.KurastBazaar);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.RuinedTemple, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.LamEsensTomeHolder)) {
      throw new Error("Failed to move near Sarina");
    }

    Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.BattlemaidSarina));
    Pickit.pickItems();

    return true;
  },
  sdk.areas.KurastBazaar,
  {
    bossid: getLocaleString(sdk.locale.monsters.BattlemaidSarina),
  }
);
