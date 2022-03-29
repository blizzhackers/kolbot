/**
*	@filename	Endugu.js
*	@author		kolton
*	@desc		kill Witch Doctor Endugu
*/

function Endugu() {
	Town.doChores();
	Pather.useWaypoint(78);
	Precast.doPrecast(true);

	if (!Pather.moveToExit([88, 89, 91], true) || !Pather.moveToPreset(me.area, 2, 406)) {
		throw new Error("Failed to move to Endugu");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.WitchDoctorEndugu));

	return true;
}
