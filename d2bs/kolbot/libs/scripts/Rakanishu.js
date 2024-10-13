/**
*  @filename    Rakanishu.js
*  @author      kolton, theBGuy
*  @desc        kill Rakanishu and optionally Griswold
*
*/

const Rakanishu = new Runnable(
  function Rakanishu () {
    Pather.useWaypoint(sdk.areas.StonyField);
    Precast.doPrecast(true);

    if (!Attack.haveKilled(getLocaleString(sdk.locale.monsters.Rakanishu))) {
      if (!Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 0, 0, false, true)) {
        throw new Error("Failed to move to Rakanishu");
      }
      Attack.kill(getLocaleString(sdk.locale.monsters.Rakanishu));
    }

    if (Config.Rakanishu.KillGriswold
      && !Attack.haveKilled(sdk.monsters.Griswold)
      && Pather.getPortal(sdk.areas.Tristram)) {
      if (!Pather.usePortal(sdk.areas.Tristram)) throw new Error("Failed to move to Tristram");

      Pather.moveTo(25149, 5180);
      Attack.clear(20, 0xF, sdk.monsters.Griswold);
    }

    return true;
  },
  {
    startArea: sdk.areas.StonyField
  }
);
