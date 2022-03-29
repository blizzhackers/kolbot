/**
*	@filename	Treehead.js
*	@author		kolton
*	@desc		kill Treehead
*/

function Treehead() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.DarkWood);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 2, 30, 5, 5)) {
		throw new Error("Failed to move to Treehead");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.TreeheadWoodFist));

	return true;
}
