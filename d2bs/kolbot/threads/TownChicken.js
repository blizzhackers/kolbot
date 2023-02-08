/**
*  @filename    TownChicken.js
*  @author      kolton, theBGuy
*  @desc        handle town chicken
*
*/
js_strict(true);
include("critical.js");

// add core library
includeCoreLibs();

// handle systems
includeSystemLibs();

function main() {
	let townCheck = false;
	const scripts = ["default.dbj", "threads/antihostile.js", "threads/rushthread.js", "threads/CloneKilla.js"];

	// override broadCastIntent - shouldn't be called at all in this thread
	Pather.broadcastIntent = () => null;

	this.pause = function () {
		for (let i = 0; i < scripts.length; i += 1) {
			let script = getScript(scripts[i]);

			if (scripts[i] === "default.dbj" && !script) {
				!!getScript("threads/toolsthread.js") ? scriptBroadcast("quit") : quit();
			}

			if (script && script.running) {
				script.pause();
				scripts[i] === "default.dbj" && print("ÿc1Pausing.");
			}
		}

		return true;
	};

	this.resume = function () {
		for (let i = 0; i < scripts.length; i += 1) {
			let script = getScript(scripts[i]);

			if (script && !script.running && scripts[i] !== "default.dbj") {
				script.resume();
			} else if (scripts[i] === "default.dbj") {
				// resume only if clonekilla isn't running
				if (!getScript("threads/clonekilla.js")) {
					if (script && !script.running) {
						console.log("ÿc2Resuming.");
						script.resume();
					} else {
						if (!script) {
							// default has crashed? We shouldn't be running then. Is toolsthread still up?
							// if yes try to still quit normally, otherwise quit from here
							!!getScript("threads/toolsthread.js") ? scriptBroadcast("quit") : quit();
						}
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
	Game.getMonster() === null && console.warn("getUnit is bugged");

	while (true) {
		if (!me.inTown && (townCheck
			// should TownHP/MP check be in toolsthread?
			// We would then be able to remove all game interaction checks until we get a townCheck msg
			|| ((checkHP && me.hpPercent < Config.TownHP) || (checkMP && me.mpPercent < Config.TownMP)))) {
			// canTpToTown should maybe be overrided here to quit if we can't tp to town but isn't just because we are in non-tp-able area
			if (!me.canTpToTown()) {
				townCheck = false;

				continue;
			}
			this.pause();

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
				this.resume();

				townCheck = false;
			}
		}

		delay(50);
	}
}
