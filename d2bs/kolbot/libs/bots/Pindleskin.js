/**
*  @filename    Pindleskin.js
*  @author      kolton
*  @desc        kill Pindleskin and optionally Nihlathak
*
*/

function Pindleskin() {
	Town.goToTown(Config.Pindleskin.UseWaypoint ? undefined : 5);
	Town.doChores();

	if (Config.Pindleskin.UseWaypoint) {
		Pather.useWaypoint(sdk.areas.HallsofPain);
		Precast.doPrecast(true);

		if (!Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.NihlathaksTemple], true)) {
			throw new Error("Failed to move to Nihlahak's Temple");
		}
	} else {
		Town.move(NPC.Anya);

		if (!Pather.getPortal(sdk.areas.NihlathaksTemple) && me.getQuest(37, 1)) {
			Town.npcInteract("Anya");
		}

		if (!Pather.usePortal(sdk.areas.NihlathaksTemple)) throw new Error("Failed to use portal.");

		Precast.doPrecast(true);
	}

	Pather.moveTo(10058, 13234);

	try {
		Attack.kill(getLocaleString(sdk.locale.monsters.Pindleskin));
	} catch (e) {
		console.errorReport(e);
	}

	if (Config.Pindleskin.KillNihlathak) {
		if (!Pather.moveToExit([sdk.areas.HallsofAnguish, sdk.areas.HallsofPain, sdk.areas.HallsofVaught], true)) throw new Error("Failed to move to Halls of Vaught");

		Pather.moveToPreset(me.area, 2, sdk.units.NihlathakPlatform, 10, 10);

		if (Config.Pindleskin.ViperQuit && monster(sdk.monsters.TombViper2)) {
			console.log("Tomb Vipers found.");

			return true;
		}

		Config.Pindleskin.ClearVipers && Attack.clearList(Attack.getMob(sdk.monsters.TombViper2, 0, 20));

		Attack.kill(sdk.monsters.Nihlathak);
		Pickit.pickItems();
	}

	return true;
}
