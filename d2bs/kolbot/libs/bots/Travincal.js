/**
*  @filename    Travincal.js
*  @author      kolton
*  @desc        kill Council members in Travincal
*
*/

function Travincal() {
	this.buildList = function (checkColl) {
		let monsterList = [],
			monster = getUnit(1);

		if (monster) {
			do {
				if ([345, 346, 347].includes(monster.classid) && monster.attackable && (!checkColl || !checkCollision(me, monster, 0x1))) {
					monsterList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		return monsterList;
	};

	Town.doChores();
	Pather.useWaypoint(sdk.areas.Travincal);
	Precast.doPrecast(true);

	let orgX = me.x;
	let orgY = me.y;

	if (Config.Travincal.PortalLeech) {
		Pather.moveTo(orgX + 85, orgY - 139);
		Attack.securePosition(orgX + 70, orgY - 139, 25, 2000);
		Attack.securePosition(orgX + 100, orgY - 139, 25, 2000);
		Attack.securePosition(orgX + 85, orgY - 139, 25, 5000);
		Pather.moveTo(orgX + 85, orgY - 139);
		Pather.makePortal();
		delay(1000);
		Precast.doPrecast(true);
	}

	if (me.getSkill(sdk.skills.LeapAttack, 0) && !Pather.canTeleport()) {
		let coords = [60, -53, 64, -72, 78, -72, 74, -88];

		for (let i = 0; i < coords.length; i += 2) {
			if (i % 4 === 0) {
				Pather.moveTo(orgX + coords[i], orgY + coords[i + 1]);
			} else {
				Skill.cast(sdk.skills.LeapAttack, 0, orgX + coords[i], orgY + coords[i + 1]);
				Attack.clearList(this.buildList(1));
			}
		}

		Attack.clearList(this.buildList(0));
	} else {
		Pather.moveTo(orgX + 101, orgY - 56);

		// Stack Merc
		if (me.barbarian && !Pather.canTeleport() && me.expansion) {
			Pather.moveToExit([sdk.areas.DuranceofHateLvl1, sdk.areas.Travincal], true);
		}

		if (Config.MFLeader) {
			Pather.makePortal();
			say("council " + me.area);
		}

		Attack.clearList(this.buildList(0));
	}

	return true;
}
