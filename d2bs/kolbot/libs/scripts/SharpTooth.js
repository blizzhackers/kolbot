/**
*  @filename    Sharptooth.js
*  @author      loshmi
*  @desc        kill Thresh Socket
*
*/

const SharpTooth = new Runnable(
  function SharpTooth () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.FrigidHighlands);
    Precast.doPrecast(true);

    // FrigidHighlands returns invalid size with getBaseStat('leveldefs', 111, ['SizeX', 'SizeX(N)', 'SizeX(H)'][me.diff]);
    // Could this be causing crashes here?
    if (!Pather.moveToPresetMonster(sdk.areas.FrigidHighlands, sdk.monsters.preset.SharpToothSayer)) {
      throw new Error("Failed to move to Sharptooth Slayer");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.SharpToothSayer));
    Pickit.pickItems();

    return true;
  },
  sdk.areas.FrigidHighlands,
  {
    bossid: getLocaleString(sdk.locale.monsters.SharpToothSayer),
  }
);
