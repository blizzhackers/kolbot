/**
*	@filename	WPGetter.js
*	@author		kolton (probably), theBGuy
*	@desc		Get wps we don't have
*/

function WPGetter() {
	Town.doChores();
	Town.goToTown(1);
	Pather.getWP(me.area);

	let wpsToGet = [];

	switch (me.highestAct) {
	case 5:
		wpsToGet = Pather.wpAreas.filter((wp) => !sdk.areas.Towns.includes(wp) && wp !== 123);

		break;
	case 4:
		wpsToGet = Pather.wpAreas.filter((wp) => wp < 109 && !sdk.areas.Towns.includes(wp));

		break;
	case 3:
		wpsToGet = Pather.wpAreas.filter((wp) => wp < 103 && !sdk.areas.Towns.includes(wp));

		break;
	case 2:
		wpsToGet = Pather.wpAreas.filter((wp) => wp < 75 && !sdk.areas.Towns.includes(wp));

		break;
	case 1:
		wpsToGet = Pather.wpAreas.filter((wp) => wp < 40 && !sdk.areas.Towns.includes(wp));

		break;
	}

	for (let i = 0; i < wpsToGet.length; i += 1) {
		!getWaypoint(i) && Pather.getWP(wpsToGet[i]);
	}

	return true;
}
