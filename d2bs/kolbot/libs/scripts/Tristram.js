/**
*  @filename    Tristram.js
*  @author      kolton, cuss, theBGuy
*  @desc        clear Tristram
*
*/

function Tristram () {
  Pather._teleport = Pather.teleport;

  // complete quest if its not complete
  if (!me.getQuest(sdk.quest.id.TheSearchForCain, 4)
    && !me.getQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed)) {
    include("core/Common/Cain.js");
    Common.Cain.run();
  }

  MainLoop:
  while (true) {
    switch (true) {
    case me.inTown:
      Town.doChores();
      Pather.useWaypoint(sdk.areas.StonyField);
      Precast.doPrecast(true);

      break;
    case me.inArea(sdk.areas.StonyField):
      if (!Pather.moveToPreset(
        sdk.areas.StonyField,
        sdk.unittype.Monster,
        sdk.monsters.preset.Rakanishu,
        0, 0,
        false,
        true)
      ) {
        throw new Error("Failed to move to Rakanishu");
      }

      Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Rakanishu));

      while (!Pather.usePortal(sdk.areas.Tristram)) {
        Attack.securePosition(me.x, me.y, 10, 1000);
      }

      break;
    case me.inArea(sdk.areas.Tristram):
      let redPortal = Game.getObject(sdk.objects.RedPortal);
      !!redPortal && Pather.moveTo(redPortal.x, redPortal.y + 6);

      if (Config.Tristram.PortalLeech) {
        Pather.makePortal();
        delay(1000);
        Pather.teleport = !Config.Tristram.WalkClear && Pather._teleport;
      }

      Config.Tristram.PortalLeech ? Attack.clearLevel(0) : Attack.clearLevel(Config.ClearType);

      break MainLoop;
    default:
      break MainLoop;
    }
  }

  Config.MFLeader && Config.PublicMode && say("tristdone");
  Pather.teleport = Pather._teleport;

  return true;
}
