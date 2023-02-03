/**
*  @filename    Radament.js
*  @author      kolton
*  @desc        kill Radament
*
*/

function Radament() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.A2SewersLvl2);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(sdk.areas.A2SewersLvl3, true) || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricScrollChest)) {
		throw new Error("Failed to move to Radament");
	}

	Attack.kill(sdk.monsters.Radament);
	Pickit.pickItems();
	Attack.openChests(20);

	return true;
}
