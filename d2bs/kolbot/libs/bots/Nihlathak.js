/**
*  @filename    Nihlathak.js
*  @author      kolton, theBGuy
*  @desc        kill Nihlathak
*
*/

function Nihlathak() {
	Town.doChores();

	// UseWaypoint if set to or if we already have it
	if (Config.Nihlathak.UseWaypoint || getWaypoint(Pather.wpAreas.indexOf(sdk.areas.HallsofPain))) {
		Pather.useWaypoint(sdk.areas.HallsofPain);
	} else {
		Pather.journeyTo(sdk.areas.NihlathaksTemple) && Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain], true);
	}

	Precast.doPrecast(false);

	if (!Pather.moveToExit(sdk.areas.HallsofVaught, true)) throw new Error("Failed to go to Nihlathak");

	Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.NihlathaksPlatform, 0, 0, false, true);

	if (Config.Nihlathak.ViperQuit && Game.getMonster(sdk.monsters.TombViper2)) {
		print("Tomb Vipers found.");

		return true;
	}

	Attack.kill(sdk.monsters.Nihlathak);
	Pickit.pickItems();

	return true;
}
