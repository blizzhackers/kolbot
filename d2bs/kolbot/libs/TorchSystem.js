/**
*	@filename	TorchSystem.js
*	@author		kolton
*	@desc		Works in conjunction with OrgTorch script. Allows the uber killer to get keys from other profiles.
*/

const TorchSystem = {
	FarmerProfiles: {
		// ############################ S E T U P ##########################################

		/* Each uber killer profile can have their own army of key finders
			Multiple entries are separated with a comma
			Example config:

			"Farmer 1": { // Farmer profile name
				// Put key finder profiles here. Example - KeyFinderProfiles: ["MF 1", "MF 2"],
				KeyFinderProfiles: ["mf 1", "mf 2"],

				// Put the game name of uber killer here (without numbers). Key finders will join this game to drop keys. Example - FarmGame: "Ubers-",
				FarmGame: "torch1-"
			},

			"Farmer 2": { // Farmer profile name
				// Put key finder profiles here. Example - KeyFinderProfiles: ["MF 1", "MF 2"],
				KeyFinderProfiles: ["mf 3", "mf 4"],

				// Put the game name of uber killer here (without numbers). Key finders will join this game to drop keys. Example - FarmGame: "Ubers-",
				FarmGame: "torch2-"
			}
		*/

		// Edit here!

		"PROFILE NAME": { // Farmer profile name
			// Put key finder profiles here. Example - KeyFinderProfiles: ["MF 1", "MF 2"],
			KeyFinderProfiles: [""],

			// Put the game name of uber killer here (without numbers). Key finders will join this game to drop keys. Example - FarmGame: "Ubers-",
			FarmGame: ""
		}

		// #################################################################################
	},

	// Don't touch
	inGame: false,
	check: false,

	getFarmers: function () {
		let list = [];

		for (let i in this.FarmerProfiles) {
			if (this.FarmerProfiles.hasOwnProperty(i)) {
				for (let j = 0; j < this.FarmerProfiles[i].KeyFinderProfiles.length; j += 1) {
					if (this.FarmerProfiles[i].KeyFinderProfiles[j].toLowerCase() === me.profile.toLowerCase()) {
						this.FarmerProfiles[i].profile = i;

						list.push(this.FarmerProfiles[i]);
					}
				}
			}
		}

		return list.length > 0 ? list : false;
	},

	isFarmer: function () {
		if (this.FarmerProfiles.hasOwnProperty(me.profile)) {
			this.FarmerProfiles[me.profile].profile = me.profile;

			return this.FarmerProfiles[me.profile];
		}

		return false;
	},

	inGameCheck: function () {
		let farmers = this.getFarmers();

		if (!farmers) return false;

		for (let i = 0; i < farmers.length; i += 1) {
			if (farmers[i].FarmGame.length > 0 && me.gamename.toLowerCase().match(farmers[i].FarmGame.toLowerCase())) {
				print("ÿc4Torch Systemÿc0: In Farm game.");
				D2Bot.printToConsole("Torch System: Transfering keys.", 7);
				D2Bot.updateStatus("Torch System: In game.");
				Town.goToTown(1);

				if (Town.openStash()) {
					let neededItems = this.keyCheck();

					if (neededItems) {
						for (let n in neededItems) {
							if (neededItems.hasOwnProperty(n)) {
								while (neededItems[n].length) {
									neededItems[n].shift().drop();
								}
							}
						}
					}
				}

				if (me.getStat(14) >= 100000) {
					gold(100000);
				}

				delay(5000);
				quit();

				return true;
			}
		}

		return false;
	},

	keyCheck: function () {
		let neededItems = {},
			farmers = this.getFarmers();

		if (!farmers) return false;

		function keyCheckEvent(mode, msg) {
			if (mode === 6) {
				let obj = JSON.parse(msg);
				
				if (obj.name === "neededItems") {
					let item;

					for (let i in obj.value) {
						if (obj.value.hasOwnProperty(i) && obj.value[i] > 0) {
							switch (i) {
							case "pk1":
							case "pk2":
							case "pk3":
								item = me.getItem(i);

								if (item) {
									do {
										if (!neededItems[i]) {
											neededItems[i] = [];
										}

										neededItems[i].push(copyUnit(item));

										if (neededItems[i].length >= obj.value[i]) {
											break;
										}
									} while (item.getNext());
								}

								break;
							case "rv":
								item = me.getItem();

								if (item) {
									do {
										if (item.code === "rvs" || item.code === "rvl") {
											if (!neededItems[i]) {
												neededItems[i] = [];
											}

											neededItems[i].push(copyUnit(item));

											if (neededItems[i].length >= Math.min(2, obj.value[i])) {
												break;
											}
										}
									} while (item.getNext());
								}

								break;
							}
						}
					}
				}
			}
		}

		addEventListener("copydata", keyCheckEvent);

		// TODO: one mfer for multiple farmers handling
		for (let i = 0; i < farmers.length; i += 1) {
			sendCopyData(null, farmers[i].profile, 6, JSON.stringify({name: "keyCheck", profile: me.profile}));
			delay(250);

			if (neededItems.hasOwnProperty("pk1") || neededItems.hasOwnProperty("pk2") || neededItems.hasOwnProperty("pk3")) {
				removeEventListener("copydata", keyCheckEvent);

				return neededItems;
			}
		}

		removeEventListener("copydata", keyCheckEvent);

		return false;
	},

	outOfGameCheck: function () {
		if (!this.check) return false;

		let game;
		this.check = false;

		function checkEvent(mode, msg) {
			let farmers = TorchSystem.getFarmers();

			if (mode === 6) {
				let obj = JSON.parse(msg);

				if (obj && obj.name === "gameName") {
					for (let i = 0; i < farmers.length; i += 1) {
						if (obj.value.gameName.toLowerCase().match(farmers[i].FarmGame.toLowerCase())) {
							game = [obj.value.gameName, obj.value.password];
						}
					}
				}
			}

			return true;
		}

		let farmers = this.getFarmers();

		if (!farmers) return false;

		addEventListener('copydata', checkEvent);

		for (let i = 0; i < farmers.length; i += 1) {
			sendCopyData(null, farmers[i].profile, 6, JSON.stringify({name: "gameCheck", profile: me.profile}));
			delay(500);

			if (game) {
				break;
			}
		}

		removeEventListener('copydata', checkEvent);

		if (game) {
			delay(2000);

			this.inGame = true;
			me.blockMouse = true;

			joinGame(game[0], game[1]);

			me.blockMouse = false;

			delay(5000);

			while (me.ingame) {
				delay(1000);
			}

			this.inGame = false;

			return true;
		}

		return false;
	}
};
