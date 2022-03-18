/**
*	@filename	ChestMania.js
*	@author		kolton
*	@desc		Open chests in configured areas
*/

function ChestMania() {
	Town.doChores();

	for (let prop in Config.ChestMania) {
		if (Config.ChestMania.hasOwnProperty(prop)) {
			for (let i = 0; i < Config.ChestMania[prop].length; i += 1) {
				Pather.journeyTo(Config.ChestMania[prop][i]);
				Precast.doPrecast(false);
				Misc.openChestsInArea(Config.ChestMania[prop][i]);
			}

			Town.doChores();
		}
	}

	return true;
}
