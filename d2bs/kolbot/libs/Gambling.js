/**
*  @filename    Gambling.js
*  @author      kolton
*  @desc        multi-profile gambling system
*
*/

const Gambling = {
	Teams: {
		//####################################################################################################
		/* Gambling system for kolbot

			Allows lower level characters to get a steady income of gold to gamble LLD/VLLD items
			Not recommended for rings/amulets because of their high price (unless you want 3 gold finders to supply one gambler)
			It's possible to have multiple teams of gamblers/gold finders. Individual entries are separated by commas.

			Setting up:

			"Gamble Team 1": { // Put a unique team name here.

				goldFinders: ["GF Profile 1", "GF Profile 2"], // List of gold finder PROFILE names. They will join gamble games to drop gold

				gamblers: ["Gambler 1", "Gambler 2"], // List of gambler PROFILE names. They will keep gambling and picking up gold from gold finders.

				gambleGames: ["Gambling-", "HeyIGamble-"], // Games that gold finders will join, don't use numbers.

				goldTrigger: 2500000, // Minimum amount of gold before giving it to gamblers.

				goldReserve: 200000 // Amount of gold to keep after dropping.
			}

			Once set up properly, the gold finders will run their own games and join gamblers' games when they're out of gold.
		*/

		"Gamble Team 1": {
			goldFinders: [""],
			gamblers: [""],
			gambleGames: [""],

			goldTrigger: 2500000,
			goldReserve: 200000
		}

		//####################################################################################################
	},

	inGame: false,

	getInfo: function (profile) {
		!profile && (profile = me.profile);

		for (let i in this.Teams) {
			if (this.Teams.hasOwnProperty(i)) {
				for (let j = 0; j < this.Teams[i].goldFinders.length; j += 1) {
					if (this.Teams[i].goldFinders[j].toLowerCase() === profile.toLowerCase()) {
						this.Teams[i].goldFinder = true;
						this.Teams[i].gambler = false;

						return this.Teams[i];
					}
				}

				for (let j = 0; j < this.Teams[i].gamblers.length; j += 1) {
					if (this.Teams[i].gamblers[j].toLowerCase() === profile.toLowerCase()) {
						this.Teams[i].goldFinder = false;
						this.Teams[i].gambler = true;

						return this.Teams[i];
					}
				}
			}
		}

		return false;
	},

	inGameCheck: function () {
		let info = this.getInfo();

		if (info && info.goldFinder) {
			for (let i = 0; i < info.gambleGames.length; i += 1) {
				if (info.gambleGames[i] && me.gamename.match(info.gambleGames[i], "i")) {
					this.dropGold();
					DataFile.updateStats("gold");
					delay(5000);
					quit();

					return true;
				}
			}
		}

		return false;
	},

	dropGold: function () {
		let info = this.getInfo();

		if (info && info.goldFinder) {
			Town.goToTown(1);
			Town.move("stash");

			while (me.getStat(sdk.stats.Gold) + me.getStat(sdk.stats.GoldBank) > info.goldReserve) {
				gold(me.getStat(sdk.stats.Gold)); // drop current gold
				Town.openStash();

				// check stashed gold vs max carrying capacity
				if (me.getStat(sdk.stats.GoldBank) <= me.getStat(sdk.stats.Level) * 1e4) {
					// leave minGold in stash, pick the rest
					gold(me.getStat(sdk.stats.GoldBank) - info.goldReserve, 4);
				} else {
					// pick max carrying capacity
					gold(me.getStat(sdk.stats.Level) * 1e4, 4);
				}

				delay(1000);
			}
		}
	},

	outOfGameCheck: function () {
		let info = this.getInfo();

		if (info && info.goldFinder && DataFile.getStats().gold >= info.goldTrigger) {
			let game = this.getGame();

			if (game) {
				D2Bot.printToConsole("Joining gold drop game.", sdk.colors.D2Bot.DarkGold);

				this.inGame = true;
				me.blockMouse = true;

				delay(2000);
				joinGame(game[0], game[1]);

				me.blockMouse = false;

				delay(5000);

				while (me.ingame) {
					delay(1000);
				}

				this.inGame = false;

				return true;
			}
		}

		return false;
	},

	getGame: function () {
		let game;
		let info = this.getInfo();

		if (!info || !info.goldFinder) {
			return false;
		}

		function checkEvent(mode, msg) {
			if (mode === 4) {
				for (let i = 0; i < info.gambleGames.length; i += 1) {
					if (info.gambleGames[i] && msg.match(info.gambleGames[i], "i")) {
						game = msg.split("/");

						break;
					}
				}
			}
		}

		addEventListener("copydata", checkEvent);

		game = null;

		for (let i = 0; i < info.gamblers.length; i += 1) {
			sendCopyData(null, info.gamblers[i], 0, me.profile);
			delay(100);

			if (game) {
				break;
			}
		}

		removeEventListener("copydata", checkEvent);

		return game;
	}
};
