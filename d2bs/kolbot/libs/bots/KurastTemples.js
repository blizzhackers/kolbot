/**
*  @filename    KurastTemples.js
*  @author      kolton
*  @desc        clear Kurast Temples
*
*/

function KurastTemples() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.KurastBazaar);
	Precast.doPrecast(true);

	let areas = [
		sdk.areas.RuinedTemple, sdk.areas.DisusedFane, sdk.areas.ForgottenReliquary,
		sdk.areas.ForgottenTemple, sdk.areas.RuinedFane, sdk.areas.DisusedReliquary
	];

	areas.forEach((area, i) => {
		if (!me.inArea(sdk.areas.KurastBazaar) + Math.floor(i / 2)) {
			if (!Pather.moveToExit(sdk.areas.KurastBazaar + Math.floor(i / 2), true)) throw new Error("Failed to change area");
		}

		if (!Pather.moveToExit(area, true)) throw new Error("Failed to move to the temple");

		i === 3 && Precast.doPrecast(true);
		Attack.clearLevel(Config.ClearType);

		if (i < 5 && !Pather.moveToExit(sdk.areas.KurastBazaar + Math.floor(i / 2), true)) {
			throw new Error("Failed to move out of the temple");
		}
	});

	return true;
}
