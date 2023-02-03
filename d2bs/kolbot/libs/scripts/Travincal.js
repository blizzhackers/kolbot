/**
*  @filename    Travincal.js
*  @author      kolton
*  @desc        kill Council members in Travincal
*
*/

function Travincal() {
	this.buildList = function (checkColl) {
		let monsterList = [];
		let monster = Game.getMonster();

		if (monster) {
			do {
				if ([sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3].includes(monster.classid)
					&& monster.attackable && (!checkColl || !checkCollision(me, monster, sdk.collision.BlockWall))) {
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

	if (Skill.canUse(sdk.skills.LeapAttack) && !Pather.canTeleport()) {
		let coords = [60, -53, 64, -72, 78, -72, 74, -88];

		for (let i = 0; i < coords.length; i += 2) {
			if (i % 4 === 0) {
				Pather.moveTo(orgX + coords[i], orgY + coords[i + 1]);
			} else {
				Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, orgX + coords[i], orgY + coords[i + 1]);
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

	Config.MFLeader && Config.PublicMode && say("travdone");

	return true;
}
