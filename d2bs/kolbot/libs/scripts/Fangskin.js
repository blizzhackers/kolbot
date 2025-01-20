/**
*  @filename    Fangskin.js
*  @author      theBGuy
*  @desc        kill Fangskin
*
*/

const Fangskin = new Runnable(
  function Fangskin () {
    Pather.useWaypoint(sdk.areas.LostCity);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([
      sdk.areas.ValleyofSnakes, sdk.areas.ClawViperTempleLvl1, sdk.areas.ClawViperTempleLvl2
    ], true)) {
      throw new Error("Failed to move to Fangskin");
    }

    // casters can kill fangskin from the altar spot for better safety
    Pather.canTeleport() && Skill.getRange(Config.AttackSkill[1] > 10) && Pather.moveTo(15044, 14045);

    Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Fangskin));
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.LostCity,
    bossid: getLocaleString(sdk.locale.monsters.Fangskin),
  }
);
