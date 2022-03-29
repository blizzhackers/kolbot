/**
*	@filename	Sharptooth.js
*	@author		loshmi
*	@desc		kill Thresh Socket
*/

function SharpTooth() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.FrigidHighlands);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(me.area, 1, 790)) {
		throw new Error("Failed to move to Sharptooth Slayer");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.SharpToothSayer));
	Pickit.pickItems();

	return true;
}
