/**
*	@filename	WPGetter.js
*	@author		kolton (probably), theBGuy
*	@desc		Get wps we don't have
*/

function WPGetter() {
	Town.doChores();
	Town.goToTown();
	Pather.getWP(me.area);

	let lastWP = [40, 75, 103, 109, 129][me.highestAct - 1];
	let wpsToGet = Pather.nonTownWpAreas.filter((wp) => wp < lastWP && wp !== 123 && !getWaypoint(Pather.wpAreas.indexOf(wp)));

	for (let i = 0; i < wpsToGet.length; i += 1) {
		!getWaypoint(Pather.wpAreas.indexOf(wpsToGet[i])) && Pather.getWP(wpsToGet[i]);
		delay(500);
		Town.checkScrolls(sdk.items.TomeofTownPortal) < 10 && Town.doChores();
	}

	return true;
}
