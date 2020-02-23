/**
*	@filename	BoBarbHelper.js
*	@author		nag0k
*	@desc		give Battle Orders buff modded for hardcore, with barbarian waiting whole game on Catacombs 2 wp by default
*				get the required lines for character config files from ...\libs\config\_BaseConfigFile.js
*/

const BoBarbHelper = () => {
	if (me.classid !== 4 && Config.BoBarbHelper.Mode !== 0) {
		return true;
	}

	const townNearbyMonster = true; // go to town if monsters nearby
	const townLowMana = 20; // go refill mana if mana drops below this percent

	const shouldHealMana = amount => me.mp < Math.floor(me.mpmax * amount / 100)

	const healMana = () => {
		Pather.useWaypoint(1);
		Town.initNPC("Heal", "heal");
		Pather.useWaypoint(Config.BoBarbHelper.Wp);
	};

	const shouldBuff = unit => (
		Misc.inMyParty(unit) &&
		getDistance(me, unit) < 10 &&
		unit.name !== me.name &&
		!unit.dead &&
		!unit.inTown
	)	

	const giveBuff = () => {
		const unit = getUnit(0);

		do {
			if (shouldBuff(unit)) {
				Precast.doPrecast(true);
				delay(50);
			}
		} while(unit.getNext());
	};

	const monsterNear = () => {
		const unit = getUnit(1);

		if (unit) {
			do {
				if (Attack.checkMonster(unit) && getDistance(me, unit) < 20) {
					return true;
				}
			} while(unit.getNext());
		}

		return false;
	};

	if (!Config.QuitList) {
		showConsole();
		print('set Config.QuitList in character settings');
		print('if you don\'t I will idle indefinitely');
	}

	if (me.playertype == 1 && Config.LifeChicken <= 0) {
		showConsole();
		print('on HARDCORE');
		print('you should set Config.LifeChicken');
		print('monsters can find their way to wps ...');
		delay(2000);
		hideConsole();
		me.overhead('set LifeChiken to 40');
		Config.LifeChicken = 40;
	}

	if (shouldHealMana(townLowMana)) {
		Town.initNPC("Heal", "heal");
	}

	Town.heal(); // in case our life is low as well
	
	try {
		Pather.useWaypoint(Config.BoBarbHelper.Wp);
	} catch (e) {
		showConsole();
		print('Failed to move to BO WP');
		print('make sure I have ' + Pather.getAreaName(Config.BoBarbHelper.Wp) + ' waypoint');
		delay(20000);

		return true;
	}

	Pather.moveTo(me.x + 4, me.y + 4);

	while (true) {
		giveBuff();

		if (townNearbyMonster && monsterNear()) {
			if (!Pather.useWaypoint(1)) {
				break;
			}
		}

		if (shouldHealMana(townLowMana)) {
			healMana();
		}

		delay(25);
	}

	Town.goToTown();

	return true;
}