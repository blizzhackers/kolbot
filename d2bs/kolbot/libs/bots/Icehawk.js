/**
*	@filename	Icehawk.js
*	@author		kolton
*	@desc		kill Icehawk Riftwing
*/

function Icehawk() {
	Town.doChores();
	Pather.useWaypoint(80);
	Precast.doPrecast(true);

	if (!Pather.moveToExit([92, 93], false)) {
		throw new Error("Failed to move to Icehawk");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.IcehawkRiftwing));

	return true;
}
