/**
*	@filename	Abaddon.js
*	@author		probably kolton
*	@desc		clear OuterSteppes
*/

function OuterSteppes() {
	if (!Town.goToTown(4)) throw new Error("Failed to go to act 4");

	Town.doChores();

	if (!Pather.journeyTo(sdk.areas.OuterSteppes)) throw new Error("Failed to move to Outer Steppes");

	Precast.doPrecast(true);
	Attack.clearLevel(Config.ClearType);

	return true;
}
