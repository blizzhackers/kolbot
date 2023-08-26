/**
*  @filename    CrushTele.js
*  @author      kolton
*  @desc        Auto tele for classic rush only. Hit the "-" numpad in strategic areas.
*
*/

function CrushTele () {
  let go = false;

  addEventListener("keyup",
    function (key) {
      key === sdk.keys.NumpadDash && (go = true);
    }
  );

  while (true) {
    if (go) {
      switch (me.area) {
      case sdk.areas.CatacombsLvl2:
        Pather.moveToExit([sdk.areas.CatacombsLvl3, sdk.areas.CatacombsLvl4], true);
        break;
      case sdk.areas.HallsoftheDeadLvl2:
        Pather.moveToExit(sdk.areas.HallsoftheDeadLvl3, true);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricCubeChest);
        break;
      case sdk.areas.FarOasis:
        Pather.moveToExit([sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3], true);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.ShaftoftheHoradricStaffChest);
        break;
      case sdk.areas.LostCity:
        Pather.moveToExit([
          sdk.areas.ValleyofSnakes, sdk.areas.ClawViperTempleLvl1, sdk.areas.ClawViperTempleLvl2
        ], true);
        break;
      case sdk.areas.CanyonofMagic:
        Pather.moveToExit(getRoom().correcttomb, true);
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricStaffHolder);
        break;
      case sdk.areas.ArcaneSanctuary:
        Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.Journal, 0, 0, false, true);
        break;
      case sdk.areas.DuranceofHateLvl2:
        Pather.moveToExit(sdk.areas.DuranceofHateLvl3, true);
        break;
      case sdk.areas.RiverofFlame:
        Pather.moveToPreset(sdk.areas.ChaosSanctuary, sdk.unittype.Object, sdk.objects.DiabloStar);
        break;
      }

      go = false;
    }

    delay(10);
  }
}
