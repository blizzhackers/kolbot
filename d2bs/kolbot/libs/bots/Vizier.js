/**
*	@filename	Vizier.js
*	@author		kolton
*	@desc		kill Grand Vizier of Chaos
*/

function Vizier() {
	Town.doChores();
	Pather.useWaypoint(107);
	Precast.doPrecast(true);

	if (!Common.Diablo.openSeal(396) || !Common.Diablo.openSeal(395)) throw new Error("Failed to open seals");

	Pather.moveToPreset(108, 2, 396, 4);
	Misc.poll(() => getUnit(1, getLocaleString(2851), 2500, 250));
	Attack.kill(getLocaleString(2851)); // Grand Vizier of Chaos
	Pickit.pickItems();

	return true;
}
