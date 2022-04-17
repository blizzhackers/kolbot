/**
*	@filename	TravincalLeech.js
*	@author		ToS/XxXGoD/YGM/azero
*	@desc		Travincal Leech
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
		if (me.inTown && Pather.getPortal(83, Config.Leader)) {
			Pather.usePortal(83, Config.Leader);
			Town.getCorpse();
		}
		
		if (me.area === 83 && leader.area !== 83 && leader.area !== 75) {
			break;
		}
		
		if (me.mode === 17) {
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
