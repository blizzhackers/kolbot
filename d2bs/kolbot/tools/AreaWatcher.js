/**
*  @filename    AreaWatcher.js
*  @author      dzik, theBGuy
*  @desc        suicide walk prevention
*
*/
include("OOG.js");
include("common/Prototypes.js");

function main() {
	let _default = getScript("default.dbj");
	print("ÿc3Start AreaWatcher");
	
	while (true) {
		try {
			if (me.gameReady && me.ingame && !me.inTown) {
				!!_default && _default.stop();
				D2Bot.printToConsole("Saved from suicide walk!");
				!!_default && !_default.running ? quit() : D2Bot.restart();
			}
		} catch (e) {
			console.warn("AreaWatcher failed somewhere. ", e);
		}
		delay(1000);
	}
}
