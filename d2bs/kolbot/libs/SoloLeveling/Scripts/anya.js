/*
*	@filename	anya.js
*	@author		isid0re
*	@desc		Anya rescue from frozen river
*/

function anya () {
	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting anya');
	me.overhead("anya");

	if (!me.anya) {
		if (!Pather.checkWP(113)) {
			Pather.getWP(113);
		} else {
			Pather.useWaypoint(113);
		}

		Precast.doPrecast(true);

		if (!Pather.moveToExit(114, true) || !Pather.moveToPreset(me.area, 2, 460)) {
			print("ÿc9SoloLevelingÿc0: Failed to move to Anya");
		}

		let frozenanya = getUnit(2, 558);

		if (frozenanya) {
			Pather.moveToUnit(frozenanya);
			sendPacket(1, 0x13, 4, 0x2, 4, frozenanya.gid);
			delay(1200 + me.ping);
			me.cancel();
		}

		Town.npcInteract("malah");
		Town.doChores();
		Pather.usePortal(114, me.name);

		if (frozenanya) {
			while (!frozenanya.mode) {
				sendPacket(1, 0x13, 4, 0x2, 4, frozenanya.gid);
				delay(300 + me.ping);
			}
		}

		Town.npcInteract("malah");
		Town.unfinishedQuests();
		Town.doChores();
		Town.npcInteract("anya");
	}

	if (me.anya) {
		if (!Pather.getPortal(121)) {
			Town.npcInteract("anya");
		}

		if (!Pather.usePortal(121)) {
			return true;
		}

		Precast.doPrecast(true);
		Pather.moveTo(10058, 13234);
		Attack.killTarget(getLocaleString(22497)); // pindleskin
		Pickit.pickItems();
	}

	return true;
}
