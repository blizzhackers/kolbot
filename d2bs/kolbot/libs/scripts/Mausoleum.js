/**
*  @filename    Mausoleum.js
*  @author      kolton, theBGuy
*  @desc        clear Mausoleum - optionally kill Bishibosh and Bloodraven along the way. Also optionally clear crypt
*
*/

function Mausoleum () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.ColdPlains);
  Precast.doPrecast(true);

  if (Config.Mausoleum.KillBishibosh) {
    Pather.moveToPresetMonster(sdk.areas.ColdPlains, sdk.monsters.preset.Bishibosh);
    Attack.kill(getLocaleString(sdk.locale.monsters.Bishibosh));
    Pickit.pickItems();
  }

  if (!Pather.moveToExit(sdk.areas.BurialGrounds, true)) throw new Error("Failed to move to Burial Grounds");

  if (Config.Mausoleum.KillBloodRaven) {
    Pather.moveToPresetMonster(sdk.areas.BurialGrounds, sdk.monsters.preset.BloodRaven, {
      minDist: me.sorceress && Pather.canTeleport() ? 30 : 5
    });
    Attack.kill(getLocaleString(sdk.locale.monsters.BloodRaven));
    Pickit.pickItems();
  }

  try {
    Pather.moveToExit(sdk.areas.Mausoleum, true) && Attack.clearLevel(Config.ClearType);
  } catch (e) {
    console.error(e);
  }

  if (Config.Mausoleum.ClearCrypt) {
    // Crypt exit is... awkward
    if (!(Pather.moveToExit(sdk.areas.BurialGrounds, true)
      && Pather.moveToPreset(sdk.areas.BurialGrounds, sdk.unittype.Stairs, sdk.exits.preset.Crypt)
      && Pather.moveToExit(sdk.areas.Crypt, true))) {
      throw new Error("Failed to move to Crypt");
    }

    Attack.clearLevel(Config.ClearType);
  }

  return true;
}
