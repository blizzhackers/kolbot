/**
*  @filename    Rakanishu.js
*  @author      kolton
*  @desc        kill Rakanishu and optionally Griswold
*
*/

function Rakanishu () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.StonyField);
  Precast.doPrecast(true);

  if (!Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 0, 0, false, true)) {
    throw new Error("Failed to move to Rakanishu");
  }
  Attack.kill(getLocaleString(sdk.locale.monsters.Rakanishu));

  if (Config.Rakanishu.KillGriswold && Pather.getPortal(sdk.areas.Tristram)) {
    if (!Pather.usePortal(sdk.areas.Tristram)) throw new Error("Failed to move to Tristram");

    Pather.moveTo(25149, 5180);
    Attack.clear(20, 0xF, sdk.monsters.Griswold);
  }

  return true;
}
