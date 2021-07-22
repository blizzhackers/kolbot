/*
*	@filename	smith.js
*	@author		isid0re
*	@desc		Tools of the Trade quest for imbue reward.
*/

function smith () {
	NTIP.addLine("[name] == horadricmalus");
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting smith');
	me.overhead("smith");

	if (!Pather.checkWP(27)) {
		Pather.getWP(27);
	} else {
		Pather.useWaypoint(27);
	}

	Precast.doPrecast(true);
	Pather.moveToExit(28);

	if (!Pather.moveToPreset(28, 2, 108)) {
		throw new Error("ÿc9SoloLevelingÿc0: Failed to move to the Smith");
	}

	try {
		Attack.clear(20, 0, getLocaleString(2889)); // The Smith
	} catch (err) {
		print('ÿc9SoloLevelingÿc0: Failed to kill Smith');
	}

	Quest.collectItem(89, 108);
	Pickit.pickItems();
	Town.goToTown();
	Town.npcInteract("charsi");
	Pather.usePortal(null, me.name);
	Pather.getWP(29);
	Pather.useWaypoint(1);

	return true;
}
