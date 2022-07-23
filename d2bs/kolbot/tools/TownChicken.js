/**
*  @filename    TownChicken.js
*  @author      kolton
*  @desc        handle town chicken
*
*/
js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("Gambling.js");
include("CraftingSystem.js");
include("common/util.js");

includeCommonLibs();

function main() {
	let townCheck = false;

	this.togglePause = function () {
		let scripts = ["default.dbj", "tools/antihostile.js", "tools/rushthread.js", "tools/CloneKilla.js"];

		for (let i = 0; i < scripts.length; i += 1) {
			let script = getScript(scripts[i]);

			if (script) {
				if (script.running) {
					scripts[i] === "default.dbj" && print("ÿc1Pausing.");
					script.pause();
				} else {
					if (scripts[i] === "default.dbj") {
						// resume only if clonekilla isn't running
						if (!getScript("tools/clonekilla.js")) {
							console.log("ÿc2Resuming.");
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
			if (typeof msg === "string" && msg === "townCheck") {
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

	// START
	// test for getUnit bug
	let test = Game.getMonster();
	test === null && console.warn("getUnit is bugged");

	while (true) {
		if (!me.inTown && (townCheck
			// should TownHP/MP check be in toolsthread?
			// We would then be able to remove all game interaction checks until we get a townCheck msg
			|| ((checkHP && me.hpPercent < Config.TownHP) || (checkMP && me.mpPercent < Config.TownMP)))) {
			// canTpToTown should maybe be overrided here to quit if we can't tp to town but isn't just because we are in non-tp-able area
			if (!Town.canTpToTown()) {
				townCheck = false;

				continue;
			}
			this.togglePause();

			while (!me.gameReady) {
				if (me.dead) return;

				delay(100);
			}

			try {
				console.log("(TownChicken) :: Going to town");
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
