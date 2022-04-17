/**
*	@filename	Coldcrow.js
*	@author		njomnjomnjom
*	@desc		kill Coldcrow
*/

function Coldcrow() {
	Town.doChores();
	Pather.useWaypoint(3);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(9, true, false)) throw new Error("Failed to move to Cave");
	if (!Pather.moveToPreset(me.area, 1, 736, 0, 0, false)) throw new Error("Failed to move to Coldcrow");

	Attack.kill(getLocaleString(sdk.locale.monsters.Coldcrow));

	return true;
}
