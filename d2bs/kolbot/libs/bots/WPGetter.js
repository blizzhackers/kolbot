/**
*  @filename    WPGetter.js
*  @author      kolton
*  @desc        Get wps we don't have
*
*/

function WPGetter() {
	Town.doChores();
	Town.goToTown();
	Pather.getWP(me.area);

	let highestAct = me.highestAct;
	let lastWP = sdk.areas.townOfAct((highestAct === 5 ? highestAct : highestAct + 1));
	lastWP === sdk.areas.Harrogath && (lastWP = me.baal ? sdk.areas.WorldstoneLvl2 : sdk.areas.AncientsWay);
	let wpsToGet = Pather.nonTownWpAreas.filter((wp) => wp < lastWP && wp !== 123 && !getWaypoint(Pather.wpAreas.indexOf(wp)));

	console.debug(wpsToGet);

	for (let i = 0; i < wpsToGet.length; i += 1) {
		Pather.getWP(wpsToGet[i]);
		delay(500);
		Town.checkScrolls(sdk.items.TomeofTownPortal) < 10 && Town.doChores();
	}

	return true;
}
