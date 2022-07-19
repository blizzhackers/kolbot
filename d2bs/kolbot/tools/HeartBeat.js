/**
*  @filename    HeartBeat.js
*  @author      kolton
*  @desc        Keep a link with d2bot#. If it's lost, the d2 window is killed
*
*/

function main() {
	include("oog.js");
	include("json2.js");
	include("common/misc.js");
	include("common/util.js");
	D2Bot.init();
	print("Heartbeat loaded");

	function togglePause() {
		let script = getScript();

		if (script) {
			do {
				if (script.name.includes(".dbj")) {
					if (script.running) {
						print("ÿc1Pausing ÿc0" + script.name);
						script.pause();
					} else {
						print("ÿc2Resuming ÿc0" + script.name);
						script.resume();
					}
				}
			} while (script.getNext());
		}

		return true;
	}

	// Event functions
	function KeyEvent(key) {
		switch (key) {
		case sdk.keys.PauseBreak:
			if (me.ingame) {
				break;
			}

			togglePause();

			break;
		}
	}

	addEventListener("keyup", KeyEvent);

	while (true) {
		D2Bot.heartBeat();
		delay(1000);
	}
}
