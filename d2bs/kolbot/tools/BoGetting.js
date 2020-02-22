/**
*	@filename	BoGetting.js
*	@author		blizzhackers
*	@desc		handle moving to BO area of other HC players, in combination with libs/bots/BoBarbHelper.js
*/

js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("Gambling.js");
include("CraftingSystem.js");
include("common/Attack.js");
include("common/Cubing.js");
include("common/Config.js");
include("common/CollMap.js");
include("common/Loader.js");
include("common/misc.js");
include("common/util.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");

function main() {

	// Init config and attacks
	D2Bot.init();
	Config.init();
	Pickit.init();
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	while (true) {
		var BoTick, myTown,
			myArea = 0;

		if (BoTick === undefined) {
			BoTick = 0;
		}

		if (!me.getState(32) || (getTickCount() - BoTick > Config.BoBarbHelper.BoDuration * 1e3 - 3e4)) {
			if (!me.inTown) {
				myArea = me.area;
				me.overhead("moving to BO area");
				Town.goToTown();
			}

			myTown = me.area;
			Pather.useWaypoint(Config.BoBarbHelper.Wp, true);
			Pather.moveTo(me.x + 5, me.y + 5);
			delay(3000);

			if (me.getState(32)) {
				BoTick = getTickCount();
				Precast.doPrecast();
			}

			me.overhead("moving back from BO area");
			Pather.useWaypoint(myTown, true);
			Town.move("portalspot");

			if (myArea > 0) {
				Pather.usePortal(myArea, me.name);
			}
		}

		delay(100);
	}
}