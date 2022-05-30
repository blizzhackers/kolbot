/**
*  @filename    Vizier.js
*  @author      kolton
*  @desc        kill Grand Vizier of Chaos
*
*/

function Vizier() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.RiverofFlame);
	Precast.doPrecast(true);

	if (!Common.Diablo.openSeal(sdk.units.DiabloSealVizier) || !Common.Diablo.openSeal(sdk.units.DiabloSealVizier2)) throw new Error("Failed to open seals");

	Pather.moveToPreset(sdk.areas.ChaosSanctuary, 2, sdk.units.DiabloSealVizier2, 4);
	let viz = Misc.poll(() => monster(getLocaleString(sdk.locale.monsters.GrandVizierofChaos), 2500, 250));
	Attack.kill(viz);
	Pickit.pickItems();

	return true;
}
