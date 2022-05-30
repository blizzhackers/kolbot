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

	let lastWP = sdk.areas.townOfAct(me.highestAct);
	let wpsToGet = Pather.nonTownWpAreas.filter((wp) => wp < lastWP && wp !== 123 && !getWaypoint(Pather.wpAreas.indexOf(wp)));

	for (let i = 0; i < wpsToGet.length; i += 1) {
		!getWaypoint(Pather.wpAreas.indexOf(wpsToGet[i])) && Pather.getWP(wpsToGet[i]);
		delay(500);
		Town.checkScrolls(sdk.items.TomeofTownPortal) < 10 && Town.doChores();
	}

	return true;
}
