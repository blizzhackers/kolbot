/**
*  @filename    ClearAnyArea.js
*  @author      kolton
*  @desc        Clears any area
*
*/

function ClearAnyArea() {
	Town.doChores();

	for (let i = 0; i < Config.ClearAnyArea.AreaList.length; i += 1) {
		try {
			Pather.journeyTo(Config.ClearAnyArea.AreaList[i]) && Attack.clearLevel(Config.ClearType);
		} catch (e) {
			console.error(e);
		}
	}

	return true;
}
