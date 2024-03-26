/**
*  @filename    ClassicChaosAssistant.js
*  @author      YGM
*  @desc        Assistant to help sorcs in public chaos runs games on classic.
*
*/

// redo this, maybe different keys or chat commands instead?

function ClassicChaosAssistant () {
  include("core/Common/Diablo.js");
  let stargo, infgo, seisgo, vizgo, infseal, seisseal, vizseal, diablopickup, normalpickup = false;

  addEventListener("keyup",
    function (key) {
      switch (key) {
      case sdk.keys.Numpad1:
        stargo = true;
          
        break;
      case sdk.keys.Numpad2:
        infgo = true;
          
        break;
      case sdk.keys.Numpad3:
        infseal = true;
          
        break;
      case sdk.keys.Numpad4:
        seisgo = true;
          
        break;
      case sdk.keys.Numpad5:
        seisseal = true;
          
        break;
      case sdk.keys.Numpad6:
        vizgo = true;
          
        break;
      case sdk.keys.Numpad7:
        vizseal = true;
          
        break;
      case sdk.keys.Numpad8: // (Open last seal, teleport to star and pickup for 30 seconds)
        diablopickup = true;
          
        break;
      case sdk.keys.Numpad9: // (Pickup at current location)
        normalpickup = true;
          
        break;
      default:
        break;
      }
    });

  while (true) {
    switch (me.area) {
    case sdk.areas.ChaosSanctuary:
      if (infgo) {
        Common.Diablo.infLayout === 1 ? Pather.moveTo(7893, 5306) : Pather.moveTo(7929, 5294);
        Pather.makePortal() && say("Infector of Souls TP Up!");
        infgo = false;
      }

      if (seisgo) {
        Common.Diablo.seisLayout === 1 ? Pather.moveTo(7773, 5191) : Pather.moveTo(7794, 5189);
        Pather.makePortal() && say("Lord De Seis TP Up!");
        seisgo = false;
      }

      if (vizgo) {
        Common.Diablo.vizLayout === 1 ? Pather.moveTo(7681, 5302) : Pather.moveTo(7675, 5305);
        Pather.makePortal() && say("Grand Vizier of Chaos TP Up!");
        vizgo = false;
      }

      if (infseal) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealInfector2);
        Common.Diablo.openSeal(sdk.objects.DiabloSealInfector) && say("Infector of Souls spawned!");
        Common.Diablo.infLayout === 1 ? Pather.moveTo(7893, 5306) : Pather.moveTo(7929, 5294);
        infseal = false;
      }

      if (seisseal) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealSeis) && say("Lord De Seis spawned!");
        Common.Diablo.seisLayout === 1 ? Pather.moveTo(7773, 5191) : Pather.moveTo(7794, 5189);
        seisseal = false;
      }

      if (vizseal) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealVizier2) && say("Grand Vizier of Chaos spawned!");
        Common.Diablo.vizLayout === 1 ? Pather.moveTo(7681, 5302) : Pather.moveTo(7675, 5305);
        vizseal = false;
      }

      if (diablopickup) {
        Common.Diablo.openSeal(sdk.objects.DiabloSealVizier);
        Pather.moveToPreset(sdk.areas.ChaosSanctuary, sdk.unittype.Object, 255);
        for (let i = 0; i < 300; i += 1) {
          Pickit.pickItems();
          delay(100);
        }
        diablopickup = false;
      }

      if (normalpickup) {
        Pickit.pickItems();
        normalpickup = false;
      }

      break;
    default:
      if (stargo) {
        if (me.inArea(sdk.areas.RiverofFlame)) {
          Precast.doPrecast(true);
          Pather.moveToPreset(sdk.areas.ChaosSanctuary, sdk.unittype.Object, 255);
          Common.Diablo.initLayout();
          break;
        }
        stargo = false;
      }

      break;
    }
    
    delay(10);
  }
}
