/**
*	@filename	TownChicken.js
*	@author		kolton
*	@desc		handle town chicken
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
	let townCheck = false;

	this.togglePause = function () {
		let i,	script,
			scripts = ["default.dbj", "tools/antihostile.js", "tools/rushthread.js", "tools/CloneKilla.js"];

		for (i = 0; i < scripts.length; i += 1) {
			script = getScript(scripts[i]);

			if (script) {
				if (script.running) {
					if (i === 0) { // default.dbj
						print("ÿc1Pausing.");
					}

					script.pause();
				} else {
					if (i === 0) { // default.dbj
						if (!getScript("tools/clonekilla.js")) { // resume only if clonekilla isn't running
							print("ÿc2Resuming.");
							script.resume();
						}
					} else {
						script.resume();
					}
				}
			}
		}

		return true;
	};

	addEventListener("scriptmsg",
		function (msg) {
			if (typeof msg !== "string") return;
			if (msg === "townCheck" && Town.canTpToTown()) {
				townCheck = true;
			}
		});

	// Init config and attacks
	print("ÿc3Start TownChicken thread");
	D2Bot.init();
	Config.init();
	Pickit.init();
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	let checkHP = Config.TownHP > 0;
	let checkMP = Config.TownMP > 0;

	while (true) {
		if (!me.inTown && (townCheck
			|| ((checkHP && me.hpPercent < Config.TownHP) || (checkMP && me.mpPercent < Config.TownMP)) && Town.canTpToTown())) {
			this.togglePause();

			while (!me.gameReady) {
				if (me.dead) {
					return;
				}

				delay(100);
			}

			try {
				me.overhead("Going to town");
				Town.visitTown();
			} catch (e) {
				Misc.errorReport(e, "TownChicken.js");
				scriptBroadcast("quit");

				return;
			} finally {
				this.togglePause();

				townCheck = false;
			}
		}

		delay(50);
	}
}
