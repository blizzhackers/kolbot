/**
*  @filename    ChestMania.js
*  @author      kolton
*  @desc        Open chests in configured areas
*
*/

// todo - if we have run ghostsbusters before this then some of these areas don't need to be re-run

function ChestMania() {
	Town.doChores();

	for (let prop in Config.ChestMania) {
		if (Config.ChestMania.hasOwnProperty(prop)) {
			for (let i = 0; i < Config.ChestMania[prop].length; i += 1) {
				const nextArea = Config.ChestMania[prop][i];
				if ([sdk.areas.BloodMoor, sdk.areas.RockyWaste, sdk.areas.SpiderForest, sdk.areas.OuterSteppes, sdk.areas.BloodyFoothills].includes(nextArea)) {
					// if we precast as soon as we step out of town it sometimes crashes - so do precast somewhere else first
					Precast.doRandomPrecast(false);
				}
				Pather.journeyTo(Config.ChestMania[prop][i]);
				Precast.doPrecast(false);
				Misc.openChestsInArea(Config.ChestMania[prop][i]);
			}

			Town.doChores();
		}
	}

	return true;
}
