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
      if (!Pather.moveToPresetMonster(sdk.areas.StonyField, sdk.monsters.preset.Rakanishu, { pop: true })) {
        // sometime bad map seed will not allow us to find Rakanishu to use stone preset
        if (!Pather.moveToPresetObject(sdk.areas.StonyField, sdk.quest.chest.StoneAlpha)) {
          throw new Error("Failed to move to Rakanishu");
        }
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
