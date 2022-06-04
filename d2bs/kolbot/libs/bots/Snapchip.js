/**
*  @filename    Snapchip.js
*  @author      kolton
*  @desc        kill Snapchip and optionally clear Icy Cellar
*
*/

function Snapchip() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.AncientsWay);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(sdk.areas.IcyCellar, true) || !Pather.moveToPreset(me.area, 2, sdk.units.IcyCellarChest)) {
		throw new Error("Failed to move to Snapchip Shatter");
	}

	Attack.kill(getLocaleString(sdk.locale.monsters.SnapchipShatter));
	Config.Snapchip.ClearIcyCellar && Attack.clearLevel(Config.ClearType);

	return true;
}
