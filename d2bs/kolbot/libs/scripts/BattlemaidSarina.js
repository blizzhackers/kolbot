/**
*  @filename    BattlemaidSarina.js
*  @author      theBGuy
*  @desc        kill Battlemaid Sarina
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var BattlemaidSarina = new Runnable(
  function BattlemaidSarina () {
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
  {
    startArea: sdk.areas.KurastBazaar,
    bossid: getLocaleString(sdk.locale.monsters.BattlemaidSarina),
  }
);
