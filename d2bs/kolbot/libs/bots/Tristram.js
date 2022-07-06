/**
*  @filename    Tristram.js
*  @author      kolton, cuss, theBGuy
*  @desc        clear Tristram
*
*/

function Tristram() {
	Pather._teleport = Pather.teleport;

	// complete quest if its not complete
	if (!me.getQuest(4, 4) && !me.getQuest(4, 0)) {
		Common.Questing.cain();
	}

	MainLoop:
	while (true) {
		switch (true) {
		case me.inTown:
			Town.doChores();
			Pather.useWaypoint(sdk.areas.StonyField);
			Precast.doPrecast(true);

			break;
		case me.area === sdk.areas.StonyField:
			if (!Pather.moveToPreset(sdk.areas.StonyField, 1, 737, 0, 0, false, true)) {
				throw new Error("Failed to move to Rakanishu");
			}

			Attack.clear(15, 0, getLocaleString(sdk.locale.monsters.Rakanishu));

			while (!Pather.usePortal(sdk.areas.Tristram)) {
				Attack.securePosition(me.x, me.y, 10, 1000);
			}

			break;
		case me.area === sdk.areas.Tristram:
			let redPortal = Game.getObject(sdk.units.RedPortal);
			!!redPortal && Pather.moveTo(redPortal.x, redPortal.y + 6);

			if (Config.Tristram.PortalLeech) {
				Pather.makePortal();
				delay(1000);
				Pather.teleport = !Config.Tristram.WalkClear && Pather._teleport;
			}

			Config.Tristram.PortalLeech ? Attack.clearLevel(0) : Attack.clearLevel(Config.ClearType);

			break MainLoop;
		default:
			break MainLoop;
		}
	}

	Pather.teleport = Pather._teleport;

	return true;
}
