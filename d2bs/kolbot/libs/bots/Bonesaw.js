/**
*	@filename	Bonesaw.js
*	@author		kolton
*	@desc		kill Bonesaw Breaker
*/

function Bonesaw() {
	Town.doChores();
	Pather.useWaypoint(115);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(115, 2, 455, 15, 15)) {
		throw new Error("Failed to move to Bonesaw");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.BonesawBreaker));

	if (Config.Bonesaw.ClearDrifterCavern && Pather.moveToExit(116, true)) {
		Attack.clearLevel(Config.ClearType);
	}

	return true;
}
