/**
*  @filename    OuterSteppes.js
*  @author      kolton
*  @desc        clear OuterSteppes
*
*/

function OuterSteppes() {
  if (!Town.goToTown(4)) throw new Error("Failed to go to act 4");
  Town.doChores();
  // force random precast because currently bugs if we precast as soon as we go from inTown to out of town
  Precast.doRandomPrecast(true);
  if (!Pather.journeyTo(sdk.areas.OuterSteppes)) throw new Error("Failed to move to Outer Steppes");

  Attack.clearLevel(Config.ClearType);

  return true;
}
