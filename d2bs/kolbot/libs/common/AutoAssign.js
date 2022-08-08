/**
*  @filename    AutoAssign.js
*  @author      ?
*  @desc        ?
*
*/
let answer = false;
let request = false;

const AutoAssign = {
	recursion: true,
	Barbs: [],
	Sorcs: [],
	Pallys: [],
	Jobs: {
		Barb: "",
		Sorc: "",
		Pally: "",
		Mine: 0
	},

	init: function () {
		AutoAssign.updateNames(); // initiates all scripts
		// Do something else? What else do we need to do...

		return true;
	},

	receiveCopyData: function (mode, msg) {
		switch (mode) {
		case 69: // request
			msg === me.name && D2Bot.shoutGlobal("bot", 70);

			break;
		case 70: // Received answer
			msg === "bot" && request === true && (answer = true);

			break;
		default:
			break;
		}
	},

	// eslint-disable-next-line no-unused-vars
	gameEvent: function (mode, param1, param2, name1) {
		switch (mode) {
		case 0x00: // Left game due to time-out
			AutoAssign.updateNames(name1);

			break;
		case 0x02: // Joined game
			AutoAssign.updateNames();

			break;
		case 0x03: //left game
			AutoAssign.updateNames(name1);

			break;

		}
		delay(250);
	},

	getJobs: function () {
		let quitCheck;
		let array = [this.Barbs, this.Pallys, this.Sorcs];

		for (let i = 0; i < array.length; i++) {
			let current = array[i];

			switch (i) {
			case 0:
				quitCheck = getParty(this.Jobs.Barb);
				!quitCheck && (this.Jobs.Barb = "");

				if (current.length > 0) {
					this.Jobs.Barb = current[0].name;
					//print ("setting leader Barb to: " + AutoAssign.Jobs.Barb);
				}
				break;
			case 1:
				quitCheck = getParty(this.Jobs.Pally);
				!quitCheck && (this.Jobs.Pally = "");

				if (current.length > 0) {
					this.Jobs.Pally = current[0].name;
					//print ("setting leader Pally to: " + AutoAssign.Jobs.Pally);
				}
				break;
			case 2:
				quitCheck = getParty(this.Jobs.Sorc);
				!quitCheck && (this.Jobs.Sorc = "");

				if (current.length > 0) {
					this.Jobs.Sorc = current[0].name;
					//print ("setting leader Sorc to: " + AutoAssign.Jobs.Sorc);
				}
				break;
			}

			for (let y = 0; y < current.length; y++) {
				if (current[y].name === me.name) {
					this.Jobs.Mine = y;
				}
			}
		}
		return true;
	},

	pushNames: function (name, level, classid) {
		let obj = {name: name, level: level};

		switch (classid) {
		case sdk.player.class.Sorceress:
			this.Sorcs.push(obj);
			break;
		case sdk.player.class.Paladin:
			this.Pallys.push(obj);
			break;
		case sdk.player.class.Barbarian:
			this.Barbs.push(obj);
			break;
		}
		return true;
	},

	checkNames: function (name, type) {
		let	i, timeout = 1000;

		for (i = 0; i < type.length; i++) {
			if (type[i].name === name) {
				break;
			}
		}

		if (i === type.length) {
			D2Bot.shoutGlobal(name, 69);
			let tick = getTickCount();
			request = true;

			while (!answer) {
				if (getTickCount() - tick > timeout) {
					break;
				}
				delay (100);
			}
		}

		if (answer) {
			answer = false;
			request = false;
			return true;
		}

		answer = false;
		request = false;

		return false;
	},

	sortNames: function () {
		let arrays = [this.Barbs, this.Pallys, this.Sorcs];

		for (let i = 0; i < arrays.length; i++) {
			let type = arrays[i];

			type.sort(function (a, b) {
				if (a.name > b.name) return 1;
				if (a.name < b.name) return -1;
				return 0;
			});

			type.sort(function (a, b) {
				return b.level - a.level;
			});

		}
		return true;
	},

	removeNames: function (quitter) {
		print(quitter + " has left. updating..");
		let arrays = [this.Barbs, this.Pallys, this.Sorcs];

		for (let i = 0; i < arrays.length; i++) {
			let currentClass = arrays[i];

			for (let y = 0; y < currentClass.length; y++) {
				if (currentClass[y].name === quitter) {
					currentClass.splice(y, 1);
				}
			}
		}
		return true;
	},

	getNames: function () {
		print("Updating names.");

		for (let i = 0; i < 3; i++) {
			let party = getParty();

			if (party) {
				do {
					switch (party.classid) {
					case sdk.player.class.Sorceress:
						if (this.checkNames(party.name, this.Sorcs)) {
							this.pushNames(party.name, party.level, party.classid);
						}

						break;
					case sdk.player.class.Paladin:
						if (this.checkNames(party.name, this.Pallys)) {
							this.pushNames(party.name, party.level, party.classid);
						}

						break;
					case sdk.player.class.Barbarian:
						if (this.checkNames(party.name, this.Barbs)) {
							this.pushNames(party.name, party.level, party.classid);
						}

						break;
					default:
						break;
					}
				} while (party.getNext());
			}
		}

		this.sortNames();
		this.getJobs();

		return this.Jobs;
	},

	updateNames: function (quitter) {
		if (this.recursion) {
			this.recursion = false;
			quitter && this.removeNames(quitter);
			this.getNames();
			this.recursion = true;
		}
		return true;
	}
};
	//addEventListener("scriptmsg", AutoAssign.ScriptMsgEvent);
addEventListener("copydata", AutoAssign.receiveCopyData);
addEventListener("gameevent", AutoAssign.gameEvent);
