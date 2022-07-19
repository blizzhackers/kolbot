/**
*  @filename    TravincalLeech.js
*  @author      ToS/XxXGoD/YGM/azero
*  @desc        Travincal Leech
*
*/

function TravincalLeech() {
	Town.goToTown(3);
	Town.doChores();
	Town.move("portalspot");

	while (!Misc.inMyParty(Config.Leader)) {
		delay(500);
	}
	
	let leader = Misc.findPlayer(Config.Leader);

	while (Misc.inMyParty(Config.Leader)) {
		if (me.inTown && Pather.getPortal(sdk.areas.Travincal, Config.Leader)) {
			Pather.usePortal(sdk.areas.Travincal, Config.Leader);
			Town.getCorpse();
		}
		
		if (me.area === sdk.areas.Travincal && leader.area !== sdk.areas.Travincal && leader.area !== sdk.areas.KurastDocktown) {
			break;
		}
		
		if (me.mode === sdk.units.player.mode.Dead) {
			me.revive();

			while (!me.inTown) {
				delay(100);
			}

			Town.move("portalspot");
		}

		delay(100);
	}

	return true;
}
