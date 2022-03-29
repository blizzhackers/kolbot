/**
*	@filename	Smith.js
*	@author		kolton
*	@desc		kill the Smith
*/

function Smith() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.OuterCloister);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(sdk.areas.Barracks, 2, 108)) {
		throw new Error("Failed to move to the Smith");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.TheSmith));
	Pickit.pickItems();

	return true;
}
