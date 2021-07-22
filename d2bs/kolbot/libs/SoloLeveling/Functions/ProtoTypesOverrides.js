/*
*	@filename	ProtoTypesOverrides.js
*	@author		isid0re
*	@desc		additions for improved SoloLeveling functionality and code readability
*/

Unit.prototype.getItems = function (...args) {
	let items = this.getItems.apply(this, args);

	if (!items.length) {
		return [];
	}

	return items;
};

Unit.prototype.getStatEx = function (id, subid) {
	var i, temp, rval, regex;


	switch (id) {
	case 555: //calculates all res, doesnt exists trough
	{ // Block scope due to the variable declaration
		// Get all res
		let allres = [this.getStatEx(39), this.getStatEx(41), this.getStatEx(43), this.getStatEx(45)];

		// What is the minimum of the 4?
		let min = Math.min.apply(null, allres);

		// Cap all res to the minimum amount of res
		allres = allres.map(res => res > min ? min : res);

		// Get it in local variables, its more easy to read
		let [fire, cold, light, psn] = allres;

		return fire === cold && cold === light && light === psn ? min : 0;
	}

	case 9: // Max mana
		rval = this.getStat(9);

		if (rval > 446) {
			return rval - 16777216; // Fix for negative values (Gull knife)
		}

		return rval;
	case 20: // toblock
		switch (this.classid) {
		case 328: // buckler
			return this.getStat(20);
		case 413: // preserved
		case 483: // mummified
		case 503: // minion
			return this.getStat(20) - 3;
		case 329: // small
		case 414: // zombie
		case 484: // fetish
		case 504: // hellspawn
			return this.getStat(20) - 5;
		case 331: // kite
		case 415: // unraveller
		case 485: // sexton
		case 505: // overseer
			return this.getStat(20) - 8;
		case 351: // spiked
		case 374: // deefender
		case 416: // gargoyle
		case 486: // cantor
		case 506: // succubus
		case 408: // targe
		case 478: // akaran t
			return this.getStat(20) - 10;
		case 330: // large
		case 375: // round
		case 417: // demon
		case 487: // hierophant
		case 507: // bloodlord
			return this.getStat(20) - 12;
		case 376: // scutum
			return this.getStat(20) - 14;
		case 409: // rondache
		case 479: // akaran r
			return this.getStat(20) - 15;
		case 333: // goth
		case 379: // ancient
			return this.getStat(20) - 16;
		case 397: // barbed
			return this.getStat(20) - 17;
		case 377: // dragon
			return this.getStat(20) - 18;
		case 502: // vortex
			return this.getStat(20) - 19;
		case 350: // bone
		case 396: // grim
		case 445: // luna
		case 467: // blade barr
		case 466: // troll
		case 410: // heraldic
		case 480: // protector
			return this.getStat(20) - 20;
		case 444: // heater
		case 447: // monarch
		case 411: // aerin
		case 481: // gilded
		case 501: // zakarum
			return this.getStat(20) - 22;
		case 332: // tower
		case 378: // pavise
		case 446: // hyperion
		case 448: // aegis
		case 449: // ward
			return this.getStat(20) - 24;
		case 412: // crown
		case 482: // royal
		case 500: // kurast
			return this.getStat(20) - 25;
		case 499: // sacred r
			return this.getStat(20) - 28;
		case 498: // sacred t
			return this.getStat(20) - 30;
		}

		break;
	case 21: // plusmindamage
	case 22: // plusmaxdamage
		if (subid === 1) {
			temp = this.getStat(-1);
			rval = 0;

			for (i = 0; i < temp.length; i += 1) {
				switch (temp[i][0]) {
				case id: // plus one handed dmg
				case id + 2: // plus two handed dmg
					// There are 2 occurrences of min/max if the item has +damage. Total damage is the sum of both.
					// First occurrence is +damage, second is base item damage.

					if (rval) { // First occurence stored, return if the second one exists
						return rval;
					}

					if (this.getStat(temp[i][0]) > 0 && this.getStat(temp[i][0]) > temp[i][2]) {
						rval = temp[i][2]; // Store the potential +dmg value
					}

					break;
				}
			}

			return 0;
		}

		break;
	case 31: // plusdefense
		if (subid === 0) {
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			switch (this.itemType) {
			case 58: // jewel
			case 82: // charms
			case 83:
			case 84:
				// defense is the same as plusdefense for these items
				return this.getStat(31);
			}

			if (!this.desc) {
				this.desc = this.description;
			}

			temp = this.desc.split("\n");
			regex = new RegExp("\\+\\d+ " + getLocaleString(3481).replace(/^\s+|\s+$/g, ""));

			for (i = 0; i < temp.length; i += 1) {
				if (temp[i].match(regex, "i")) {
					return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
				}
			}

			return 0;
		}

		break;
	case 57:
		if (subid === 1) {
			return Math.round(this.getStat(57) * this.getStat(59) / 256);
		}

		break;
	case 83: // itemaddclassskills
		if (subid === undefined) {
			for (i = 0; i < 7; i += 1) {
				if (this.getStat(83, i)) {
					return this.getStat(83, i);
				}
			}

			return 0;
		}

		break;
	case 188: // itemaddskilltab
		if (subid === undefined) {
			temp = [0, 1, 2, 8, 9, 10, 16, 17, 18, 24, 25, 26, 32, 33, 34, 40, 41, 42, 48, 49, 50];

			for (i = 0; i < temp.length; i += 1) {
				if (this.getStat(188, temp[i])) {
					return this.getStat(188, temp[i]);
				}
			}

			return 0;
		}

		break;
	case 195: // itemskillonattack
	case 196: // itemskillonkill
	case 197: // itemskillondeath
	case 198: // itemskillonhit
	case 199: // itemskillonlevelup
	case 201: // itemskillongethit
	case 204: // itemchargedskill
		if (subid === 1) {
			temp = this.getStat(-2);

			if (temp.hasOwnProperty(id)) {
				if (temp[id] instanceof Array) {
					for (i = 0; i < temp[id].length; i += 1) {
						if (temp[id][i] !== undefined && temp[id][i].skill !== undefined) { // fix reference to undefined property temp[id][i].skill.
							return temp[id][i].skill;
						}
					}
				} else {
					return temp[id].skill;
				}
			}

			return 0;
		}

		if (subid === 2) {
			temp = this.getStat(-2);

			if (temp.hasOwnProperty(id)) {
				if (temp[id] instanceof Array) {
					for (i = 0; i < temp[id].length; i += 1) {
						if (temp[id][i] !== undefined) {
							return temp[id][i].level;
						}
					}
				} else {
					return temp[id].level;
				}
			}

			return 0;
		}

		break;
	case 216: // itemhpperlevel (for example Fortitude with hp per lvl can be defined now with 1.5)
		return this.getStat(216) / 2048;
	}

	if (this.getFlag(0x04000000)) { // Runeword
		switch (id) {
		case 16: // enhanceddefense
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			if (!this.desc) {
				this.desc = this.description;
			}

			temp = this.desc.split("\n");

			for (i = 0; i < temp.length; i += 1) {
				if (temp[i].match(getLocaleString(3520).replace(/^\s+|\s+$/g, ""), "i")) {
					return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
				}
			}

			return 0;
		case 18: // enhanceddamage
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			if (!this.desc) {
				this.desc = this.description;
			}

			temp = this.desc.split("\n");

			for (i = 0; i < temp.length; i += 1) {
				if (temp[i].match(getLocaleString(10038).replace(/^\s+|\s+$/g, ""), "i")) {
					return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
				}
			}

			return 0;
		}
	}

	if (subid === undefined) {
		return this.getStat(id);
	}

	return this.getStat(id, subid);
};

Object.defineProperty(Unit.prototype, 'classic', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.classic: Must be used with player units.");
		}

		return this.gametype === 0;
	}
});

Object.defineProperty(Unit.prototype, 'normal', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.normal: Must be used with player units.");
		}

		return this.diff === 0;
	}
});

Object.defineProperty(Unit.prototype, 'nightmare', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.nightmare: Must be used with player units.");
		}

		return this.diff === 1;
	}
});

Object.defineProperty(Unit.prototype, 'hell', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.hell: Must be used with player units.");
		}

		return this.diff === 2;
	}
});

Object.defineProperty(Unit.prototype, 'amazon', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.amazon: Must be used with player units.");
		}

		return this.classid === 0;
	}
});

Object.defineProperty(Unit.prototype, 'sorceress', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.sorceress: Must be used with player units.");
		}

		return this.classid === 1;
	}
});

Object.defineProperty(Unit.prototype, 'necromancer', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.necromancer: Must be used with player units.");
		}

		return this.classid === 2;
	}
});

Object.defineProperty(Unit.prototype, 'paladin', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.paladin: Must be used with player units.");
		}

		return this.classid === 3;
	}
});

Object.defineProperty(Unit.prototype, 'barbarian', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.barbarian: Must be used with player units.");
		}

		return this.classid === 4;
	}
});

Object.defineProperty(Unit.prototype, 'druid', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.druid: Must be used with player units.");
		}

		return this.classid === 5;
	}
});

Object.defineProperty(Unit.prototype, 'assassin', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.assassin: Must be used with player units.");
		}

		return this.classid === 6;
	}
});

Object.defineProperty(Unit.prototype, 'den', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.den: Must be used with player units.");
		}

		return this.getQuest(1, 0);
	}
});

Object.defineProperty(Unit.prototype, 'bloodraven', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.bloodraven: Must be used with player units.");
		}

		return this.getQuest(2, 0);
	}
});

Object.defineProperty(Unit.prototype, 'smith', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.smith: Must be used with player units.");
		}

		return this.getQuest(3, 0);
	}
});

Object.defineProperty(Unit.prototype, 'tristram', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.tristram: Must be used with player units.");
		}

		return this.getQuest(4, 0);
	}
});

Object.defineProperty(Unit.prototype, 'countess', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.countess: Must be used with player units.");
		}

		return this.getQuest(5, 0);
	}
});

Object.defineProperty(Unit.prototype, 'andariel', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.andariel: Must be used with player units.");
		}

		return this.getQuest(7, 0);
	}
});

Object.defineProperty(Unit.prototype, 'cube', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.cube: Must be used with player units.");
		}

		return !!this.getItem(549);
	}
});

Object.defineProperty(Unit.prototype, 'radament', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.radament: Must be used with player units.");
		}

		return this.getQuest(9, 0);
	}
});

Object.defineProperty(Unit.prototype, 'shaft', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.shaft: Must be used with player units.");
		}

		return this.getItem(92);
	}
});

Object.defineProperty(Unit.prototype, 'amulet', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.amulet: Must be used with player units.");
		}

		return this.getItem(521);
	}
});

Object.defineProperty(Unit.prototype, 'staff', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.staff: Must be used with player units.");
		}

		return this.getItem(91);
	}
});

Object.defineProperty(Unit.prototype, 'horadricstaff', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.horadricstaff: Must be used with player units.");
		}

		return this.getQuest(10, 0);
	}
});


Object.defineProperty(Unit.prototype, 'summoner', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.summoner: Must be used with player units.");
		}

		return this.getQuest(13, 0);
	}
});

Object.defineProperty(Unit.prototype, 'duriel', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.duriel: Must be used with player units.");
		}

		return this.getQuest(15, 0);
	}
});

Object.defineProperty(Unit.prototype, 'goldenbird', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.goldenbird: Must be used with player units.");
		}

		return this.getQuest(20, 0);
	}
});

Object.defineProperty(Unit.prototype, 'eye', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.eye: Must be used with player units.");
		}

		return this.getItem(553);
	}
});

Object.defineProperty(Unit.prototype, 'brain', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.brain: Must be used with player units.");
		}

		return this.getItem(555);
	}
});

Object.defineProperty(Unit.prototype, 'heart', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.heart: Must be used with player units.");
		}

		return this.getItem(554);
	}
});

Object.defineProperty(Unit.prototype, 'khalimswill', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.khalimswill: Must be used with player units.");
		}

		return this.getItem(174);
	}
});

Object.defineProperty(Unit.prototype, 'lamessen', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.lamessen: Must be used with player units.");
		}

		return this.getQuest(17, 0);
	}
});

Object.defineProperty(Unit.prototype, 'gidbinn', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.gidbinn: Must be used with player units.");
		}

		return this.getQuest(19, 0);
	}
});

Object.defineProperty(Unit.prototype, 'travincal', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.travincal: Must be used with player units.");
		}

		return this.getQuest(18, 0);
	}
});

Object.defineProperty(Unit.prototype, 'mephisto', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.mephisto: Must be used with player units.");
		}

		return this.getQuest(23, 0);
	}
});

Object.defineProperty(Unit.prototype, 'izual', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.izual: Must be used with player units.");
		}

		return this.getQuest(25, 0);
	}
});

Object.defineProperty(Unit.prototype, 'diablo', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.diablo: Must be used with player units.");
		}

		return this.getQuest(26, 0);
	}
});

Object.defineProperty(Unit.prototype, 'hellforge', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.hellforge: Must be used with player units.");
		}

		return this.getQuest(27, 0);
	}
});

Object.defineProperty(Unit.prototype, 'shenk', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.shenk: Must be used with player units.");
		}

		return this.getQuest(35, 0);
	}
});

Object.defineProperty(Unit.prototype, 'larzuk', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.larzuk: Must be used with player units.");
		}

		return this.getQuest(35, 1);
	}
});

Object.defineProperty(Unit.prototype, 'savebarby', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.savebarby: Must be used with player units.");
		}

		return this.getQuest(36, 0);
	}
});

Object.defineProperty(Unit.prototype, 'anya', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.anya: Must be used with player units.");
		}

		return this.getQuest(37, 0);
	}
});

Object.defineProperty(Unit.prototype, 'ancients', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.ancients: Must be used with player units.");
		}

		return this.getQuest(39, 0);
	}
});

Object.defineProperty(Unit.prototype, 'baal', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.baal: Must be used with player units.");
		}

		return this.getQuest(40, 0);
	}
});

Object.defineProperty(Unit.prototype, 'cows', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.cows: Must be used with player units.");
		}

		return this.getQuest(4, 10);
	}
});

Object.defineProperty(Unit.prototype, 'respec', {
	get: function () {
		if (this.type > 0) {
			throw new Error("Unit.respec: Must be used with player units.");
		}

		return this.getQuest(41, 0);
	}
});
