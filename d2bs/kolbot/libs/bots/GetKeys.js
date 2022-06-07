/**
*  @filename    GetKeys.js
*  @author      kolton
*  @desc        get them keys
*
*/

function GetKeys() {
	Town.doChores();

	if (!me.findItems("pk1") || me.findItems("pk1").length < 3) {
		try {
			Loader.runScript("Countess");
		} catch (countessError) {
			print("ÿc1Countess failed");
		}
	}

	if (!me.findItems("pk2") || me.findItems("pk2").length < 3) {
		try {
			Loader.runScript("Summoner", () => Config.Summoner.FireEye = false);
		} catch (summonerError) {
			print("ÿc1Summoner failed");
		}
	}

	if (!me.findItems("pk3") || me.findItems("pk3").length < 3) {
		try {
			Loader.runScript("Nihlathak");
		} catch (nihlathakError) {
			print("ÿc1Nihlathak failed");
		}
	}

	return true;
}
