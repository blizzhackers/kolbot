/**
*  @filename    Eyeback.js
*  @author      kolton
*  @desc        kill Eyeback the Unleashed
*
*/

function Eyeback() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.ArreatPlateau);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(sdk.areas.FrigidHighlands, sdk.unittype.Monster, sdk.monsters.preset.EyebacktheUnleashed)) {
		throw new Error("Failed to move to Eyeback the Unleashed");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.EyebacktheUnleashed));

	return true;
}
