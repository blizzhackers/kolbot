/**
*  @filename    Nihlathak.js
*  @author      kolton, theBGuy
*  @desc        kill Nihlathak
*
*/

function Nihlathak() {
	Town.doChores();

	if (Config.Nihlathak.UseWaypoint) {
		Pather.useWaypoint(sdk.areas.HallsofPain);
	} else {
		Pather.journeyTo(sdk.areas.NihlathaksTemple) && Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain], true);
	}

	Precast.doPrecast(false);

	if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) throw new Error("Failed to go to Nihlathak");

	Pather.moveToPreset(me.area, 2, sdk.units.NihlathakPlatform, 0, 0, false, true);

	if (Config.Nihlathak.ViperQuit && monster(sdk.monsters.TombViper2)) {
		print("Tomb Vipers found.");

		return true;
	}

	Attack.kill(sdk.monsters.Nihlathak);
	Pickit.pickItems();

	return true;
}
