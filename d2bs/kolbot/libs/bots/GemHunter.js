/**
*  @filename    GemHunter.js
*  @author      icommitdesnet
*  @desc        hunt gem shrines
*
*/

function GemHunter () {
	Town.doChores();
	if (Town.getGemsInInv().length === 0) {
		print("ÿc4GemHunterÿc0: no gems in inventory - aborting.");
		return false;
	}

	// let GemHunter Pick the shrines and not the Pather
	let initalScanShrines = Config.ScanShrines;
	Config.ScanShrines = Config.ScanShrines.filter((p) => p !== sdk.shrines.Gem);

	for (let i = 0; i < Config.GemHunter.AreaList.length; i++) {
		if (Town.getGemsInInv().length > 0) {
			print("ÿc4GemHunterÿc0: Moving to " + Pather.getAreaName(Config.GemHunter.AreaList[i]));
			Pather.journeyTo(Config.GemHunter.AreaList[i]);
			if (i === 0) Precast.doPrecast(true);
			if (Misc.getShrinesInArea(Config.GemHunter.AreaList[i], sdk.shrines.Gem, true)) {
				Pickit.pickItems();
				print("ÿc4GemHunterÿc0: found a gem Shrine");
				if ((Town.getGemsInInv().length === 0) && (Town.getGemsInStash().length > 0)) {
					print("ÿc4GemHunterÿc0: Getting a new Gem in Town.");
					Town.visitTown(); // Go to Town and do chores. Will throw an error if it fails to return from Town.
				}
			}
		}
	}
	Config.ScanShrines = initalScanShrines;
	return true;
}
