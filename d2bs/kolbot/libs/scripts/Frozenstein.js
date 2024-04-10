/**
*  @filename    Frozenstein.js
*  @author      kolton
*  @desc        kill Frozenstein and optionally clear Frozen River
*
*/

const Frozenstein = new Runnable(
  function Frozenstein () {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.CrystalizedPassage);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.FrozenRiver, true)
      || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform, -5, -5)) {
      throw new Error("Failed to move to Frozenstein");
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.Frozenstein));
    Config.Frozenstein.ClearFrozenRiver && Attack.clearLevel(Config.ClearType);

    return true;
  },
  sdk.areas.CrystalizedPassage
);
