/**
*  @filename    KurastTemples.js
*  @author      kolton, theBGuy
*  @desc        clear Kurast Temples
*
*/

function KurastTemples() {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.KurastBazaar);

  [
    { base: sdk.areas.KurastBazaar, temples: [sdk.areas.RuinedTemple, sdk.areas.DisusedFane] },
    { base: sdk.areas.UpperKurast, temples: [sdk.areas.ForgottenReliquary, sdk.areas.ForgottenTemple] },
    { base: sdk.areas.KurastCauseway, temples: [sdk.areas.RuinedFane, sdk.areas.DisusedReliquary] },
  ].forEach(area => {
    try {
      if (!me.inArea(area.base)) {
        // maybe journeyTo instead?
        if (!Pather.moveToExit(area.base, true)) throw new Error("Failed to change area");
      }
      let precastTimeout = getTickCount() + Time.minutes(2);
      // @todo sort by distance
      area.temples.forEach(temple => {
        if (!Pather.moveToExit(temple, true)) throw new Error("Failed to move to the temple");
        Attack.clearLevel(Config.ClearType);
        if (!Pather.moveToExit(area.base, true)) throw new Error("Failed to move out of the temple");
        Precast.doPrecast((getTickCount() > precastTimeout));
      });

    } catch (e) {
      console.error(e);
    }
  });

  return true;
}
