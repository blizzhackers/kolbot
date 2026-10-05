/**
*  @filename    Frozenstein.js
*  @author      kolton, theBGuy
*  @desc        kill Frozenstein and optionally clear Frozen River
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var Frozenstein = new Runnable(
  function Frozenstein () {
    Pather.useWaypoint(sdk.areas.CrystalizedPassage);
    Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.FrozenRiver, true)) {
      throw new Error("Failed to move to frozen river");
    }

    if (!Attack.haveKilled(getLocaleString(sdk.locale.monsters.Frozenstein))) {
      if (!Pather.moveToExit(sdk.areas.FrozenRiver, true)
        || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform, -5, -5)) {
        throw new Error("Failed to move to Frozenstein");
      }

      Attack.kill(getLocaleString(sdk.locale.monsters.Frozenstein));
    } else {
      console.log("Frozenstein already dead");
    }
    Config.Frozenstein.ClearFrozenRiver && Attack.clearLevel(Config.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.CrystalizedPassage
  }
);
