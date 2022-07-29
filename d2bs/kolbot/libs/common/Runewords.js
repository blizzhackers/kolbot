/**
*  @filename    Runewords.js
*  @author      kolton
*  @desc        make and reroll runewords
*
*/

// TODO: Config.Runewords[i][0] can be false, but array methods can be used on it

const Runeword = {
	// 1.09
	AncientsPledge: [sdk.items.runes.Ral, sdk.items.runes.Ort, sdk.items.runes.Tal], // Ral + Ort + Tal
	Black: [sdk.items.runes.Thul, sdk.items.runes.Io, sdk.items.runes.Nef], // Thul + Io + Nef
	Fury: [sdk.items.runes.Jah, sdk.items.runes.Gul, sdk.items.runes.Eth], // Jah + Gul + Eth
	HolyThunder: [sdk.items.runes.Eth, sdk.items.runes.Ral, sdk.items.runes.Ort, sdk.items.runes.Tal], // Eth + Ral + Ort + Tal
	Honor: [sdk.items.runes.Amn, sdk.items.runes.El, sdk.items.runes.Ith, sdk.items.runes.Tir, sdk.items.runes.Sol], // Amn + El + Ith + Tir + Sol
	KingsGrace: [sdk.items.runes.Amn, sdk.items.runes.Ral, sdk.items.runes.Thul], // Amn + Ral + Thul
	Leaf: [sdk.items.runes.Tir, sdk.items.runes.Ral], // Tir + Ral
	Lionheart: [sdk.items.runes.Hel, sdk.items.runes.Lum, sdk.items.runes.Fal], // Hel + Lum + Fal
	Lore: [sdk.items.runes.Ort, sdk.items.runes.Sol], // Ort + Sol
	Malice: [sdk.items.runes.Ith, sdk.items.runes.El, sdk.items.runes.Eth], // Ith + El + Eth
	Melody: [sdk.items.runes.Shael, sdk.items.runes.Ko, sdk.items.runes.Nef], // Shael + Ko + Nef
	Memory: [sdk.items.runes.Lum, sdk.items.runes.Io, sdk.items.runes.Sol, sdk.items.runes.Eth], // Lum + Io + Sol + Eth
	Nadir: [sdk.items.runes.Nef, sdk.items.runes.Tir], // Nef + Tir
	Radiance: [sdk.items.runes.Nef, sdk.items.runes.Sol, sdk.items.runes.Ith], // Nef + Sol + Ith
	Rhyme: [sdk.items.runes.Shael, sdk.items.runes.Eth], // Shael + Eth
	Silence: [sdk.items.runes.Dol, sdk.items.runes.Eld, sdk.items.runes.Hel, sdk.items.runes.Ist, sdk.items.runes.Tir, sdk.items.runes.Vex], // Dol + Eld + Hel + Ist + Tir + Vex
	Smoke: [sdk.items.runes.Nef, sdk.items.runes.Lum], // Nef + Lum
	Stealth: [sdk.items.runes.Tal, sdk.items.runes.Eth], // Tal + Eth
	Steel: [sdk.items.runes.Tir, sdk.items.runes.El], // Tir + El
	Strength: [sdk.items.runes.Amn, sdk.items.runes.Tir], // Amn + Tir
	Venom: [sdk.items.runes.Tal, sdk.items.runes.Dol, sdk.items.runes.Mal], // Tal + Dol + Mal
	Wealth: [sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.runes.Tir], // Lem + Ko + Tir
	White: [sdk.items.runes.Dol, sdk.items.runes.Io], // Dol + Io
	Zephyr: [sdk.items.runes.Ort, sdk.items.runes.Eth], // Ort + Eth

	// 1.10
	Beast: [sdk.items.runes.Ber, sdk.items.runes.Tir, sdk.items.runes.Um, sdk.items.runes.Mal, sdk.items.runes.Lum], // Ber + Tir + Um + Mal + Lum
	Bramble: [sdk.items.runes.Ral, sdk.items.runes.Ohm, sdk.items.runes.Sur, sdk.items.runes.Eth], // Ral + Ohm + Sur + Eth
	BreathoftheDying: [sdk.items.runes.Vex, sdk.items.runes.Hel, sdk.items.runes.El, sdk.items.runes.Eld, sdk.items.runes.Zod, sdk.items.runes.Eth], // Vex + Hel + El + Eld + Zod + Eth
	CallToArms: [sdk.items.runes.Amn, sdk.items.runes.Ral, sdk.items.runes.Mal, sdk.items.runes.Ist, sdk.items.runes.Ohm], // Amn + Ral + Mal + Ist + Ohm
	ChainsofHonor: [sdk.items.runes.Dol, sdk.items.runes.Um, sdk.items.runes.Ber, sdk.items.runes.Ist], // Dol + Um + Ber + Ist
	Chaos: [sdk.items.runes.Fal, sdk.items.runes.Ohm, sdk.items.runes.Um], // Fal + Ohm + Um
	CrescentMoon: [sdk.items.runes.Shael, sdk.items.runes.Um, sdk.items.runes.Tir], // Shael + Um + Tir
	Delirium: [sdk.items.runes.Lem, sdk.items.runes.Ist, sdk.items.runes.Io], // Lem + Ist + Io
	Doom: [sdk.items.runes.Hel, sdk.items.runes.Ohm, sdk.items.runes.Um, sdk.items.runes.Lo, sdk.items.runes.Cham], // Hel + Ohm + Um + Lo + Cham
	Duress: [sdk.items.runes.Shael, sdk.items.runes.Um, sdk.items.runes.Thul], // Shael + Um + Thul
	Enigma: [sdk.items.runes.Jah, sdk.items.runes.Ith, sdk.items.runes.Ber], // Jah + Ith + Ber
	Eternity: [sdk.items.runes.Amn, sdk.items.runes.Ber, sdk.items.runes.Ist, sdk.items.runes.Sol, sdk.items.runes.Sur], // Amn + Ber + Ist + Sol + Sur
	Exile: [sdk.items.runes.Vex, sdk.items.runes.Ohm, sdk.items.runes.Ist, sdk.items.runes.Dol], // Vex + Ohm + Ist + Dol
	Famine: [sdk.items.runes.Fal, sdk.items.runes.Ohm, sdk.items.runes.Ort, sdk.items.runes.Jah], // Fal + Ohm + Ort + Jah
	Gloom: [sdk.items.runes.Fal, sdk.items.runes.Um, sdk.items.runes.Pul], // Fal + Um + Pul
	HandofJustice: [sdk.items.runes.Sur, sdk.items.runes.Cham, sdk.items.runes.Amn, sdk.items.runes.Lo], // Sur + Cham + Amn + Lo
	HeartoftheOak: [sdk.items.runes.Ko, sdk.items.runes.Vex, sdk.items.runes.Pul, sdk.items.runes.Thul], // Ko + Vex + Pul + Thul
	Kingslayer: [sdk.items.runes.Mal, sdk.items.runes.Um, sdk.items.runes.Gul, sdk.items.runes.Fal], // Mal + Um + Gul + Fal
	Passion: [sdk.items.runes.Dol, sdk.items.runes.Ort, sdk.items.runes.Eld, sdk.items.runes.Lem], // Dol + Ort + Eld + Lem
	Prudence: [sdk.items.runes.Mal, sdk.items.runes.Tir], // Mal + Tir
	Sanctuary: [sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.runes.Mal], // Ko + Ko + Mal
	Splendor: [sdk.items.runes.Eth, sdk.items.runes.Lum], // Eth + Lum
	Stone: [sdk.items.runes.Shael, sdk.items.runes.Um, sdk.items.runes.Pul, sdk.items.runes.Lum], // Shael + Um + Pul + Lum
	Wind: [sdk.items.runes.Sur, sdk.items.runes.El], // Sur + El

	// Don't use ladder-only on NL
	Brand: me.ladder ? [sdk.items.runes.Jah, sdk.items.runes.Lo, sdk.items.runes.Mal, sdk.items.runes.Gul] : false, // Jah + Lo + Mal + Gul
	Death: me.ladder ? [sdk.items.runes.Hel, sdk.items.runes.El, sdk.items.runes.Vex, sdk.items.runes.Ort, sdk.items.runes.Gul] : false, // Hel + El + Vex + Ort + Gul
	Destruction: me.ladder ? [sdk.items.runes.Vex, sdk.items.runes.Lo, sdk.items.runes.Ber, sdk.items.runes.Jah, sdk.items.runes.Ko] : false, // Vex + Lo + Ber + Jah + Ko
	Dragon: me.ladder ? [sdk.items.runes.Sur, sdk.items.runes.Lo, sdk.items.runes.Sol] : false, // Sur + Lo + Sol
	Dream: me.ladder ? [sdk.items.runes.Io, sdk.items.runes.Jah, sdk.items.runes.Pul] : false, // Io + Jah + Pul
	Edge: me.ladder ? [sdk.items.runes.Tir, sdk.items.runes.Tal, sdk.items.runes.Amn] : false, // Tir + Tal + Amn
	Faith: me.ladder ? [sdk.items.runes.Ohm, sdk.items.runes.Jah, sdk.items.runes.Lem, sdk.items.runes.Eld] : false, // Ohm + Jah + Lem + Eld
	Fortitude: me.ladder ? [sdk.items.runes.El, sdk.items.runes.Sol, sdk.items.runes.Dol, sdk.items.runes.Lo] : false, // El + Sol + Dol + Lo
	Grief: me.ladder ? [sdk.items.runes.Eth, sdk.items.runes.Tir, sdk.items.runes.Lo, sdk.items.runes.Mal, sdk.items.runes.Ral] : false, // Eth + Tir + Lo + Mal + Ral
	Harmony: me.ladder ? [sdk.items.runes.Tir, sdk.items.runes.Ith, sdk.items.runes.Sol, sdk.items.runes.Ko] : false, // Tir + Ith + Sol + Ko
	Ice: me.ladder ? [sdk.items.runes.Amn, sdk.items.runes.Shael, sdk.items.runes.Jah, sdk.items.runes.Lo] : false, // Amn + Shael + Jah + Lo
	"Infinity": me.ladder ? [sdk.items.runes.Ber, sdk.items.runes.Mal, sdk.items.runes.Ber, sdk.items.runes.Ist] : false, // Ber + Mal + Ber + Ist
	Insight: me.ladder ? [sdk.items.runes.Ral, sdk.items.runes.Tir, sdk.items.runes.Tal, sdk.items.runes.Sol] : false, // Ral + Tir + Tal + Sol
	LastWish: me.ladder ? [sdk.items.runes.Jah, sdk.items.runes.Mal, sdk.items.runes.Jah, sdk.items.runes.Sur, sdk.items.runes.Jah, sdk.items.runes.Ber] : false, // Jah + Mal + Jah + Sur + Jah + Ber
	Lawbringer: me.ladder ? [sdk.items.runes.Amn, sdk.items.runes.Lem, sdk.items.runes.Ko] : false, // Amn + Lem + Ko
	Oath: me.ladder ? [sdk.items.runes.Shael, sdk.items.runes.Pul, sdk.items.runes.Mal, sdk.items.runes.Lum] : false, // Shael + Pul + Mal + Lum
	Obedience: me.ladder ? [sdk.items.runes.Hel, sdk.items.runes.Ko, sdk.items.runes.Thul, sdk.items.runes.Eth, sdk.items.runes.Fal] : false, // Hel + Ko + Thul + Eth + Fal
	Phoenix: me.ladder ? [sdk.items.runes.Vex, sdk.items.runes.Vex, sdk.items.runes.Lo, sdk.items.runes.Jah] : false, // Vex + Vex + Lo + Jah
	Pride: me.ladder ? [sdk.items.runes.Cham, sdk.items.runes.Sur, sdk.items.runes.Io, sdk.items.runes.Lo] : false, // Cham + Sur + Io + Lo
	Rift: me.ladder ? [sdk.items.runes.Hel, sdk.items.runes.Ko, sdk.items.runes.Lem, sdk.items.runes.Gul] : false, // Hel + Ko + Lem + Gul
	Spirit: me.ladder ? [sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.runes.Ort, sdk.items.runes.Amn] : false, // Tal + Thul + Ort + Amn
	VoiceofReason: me.ladder ? [sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.runes.El, sdk.items.runes.Eld] : false, // Lem + Ko + El + Eld
	Wrath: me.ladder ? [sdk.items.runes.Pul, sdk.items.runes.Lum, sdk.items.runes.Ber, sdk.items.runes.Mal] : false, // Pul + Lum + Ber + Mal

	// 1.11
	Bone: [sdk.items.runes.Sol, sdk.items.runes.Um, sdk.items.runes.Um], // Sol + Um + Um
	Enlightenment: [sdk.items.runes.Pul, sdk.items.runes.Ral, sdk.items.runes.Sol], // Pul + Ral + Sol
	Myth: [sdk.items.runes.Hel, sdk.items.runes.Amn, sdk.items.runes.Nef], // Hel + Amn + Nef
	Peace: [sdk.items.runes.Shael, sdk.items.runes.Thul, sdk.items.runes.Amn], // Shael + Thul + Amn
	Principle: [sdk.items.runes.Ral, sdk.items.runes.Gul, sdk.items.runes.Eld], // Ral + Gul + Eld
	Rain: [sdk.items.runes.Ort, sdk.items.runes.Mal, sdk.items.runes.Ith], // Ort + Mal + Ith
	Treachery: [sdk.items.runes.Shael, sdk.items.runes.Thul, sdk.items.runes.Lem], // Shael + Thul + Lem

	Test: [sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.runes.Hel]
};

const Runewords = {
	needList: [],
	pickitEntries: [],
	validGids: [],

	init: function () {
		if (!Config.MakeRunewords) return;

		this.pickitEntries = [];

		// initiate pickit entries
		for (let i = 0; i < Config.KeepRunewords.length; i += 1) {
			let info = {
				file: "Character Config",
				line: Config.KeepRunewords[i]
			};

			let parsedLine = NTIP.ParseLineInt(Config.KeepRunewords[i], info);
			parsedLine && this.pickitEntries.push(NTIP.ParseLineInt(Config.KeepRunewords[i], info));
		}

		// change text to classid
		for (let i = 0; i < Config.Runewords.length; i += 1) {
			if (Config.Runewords[i][0] !== false) {
				if (isNaN(Config.Runewords[i][1])) {
					if (NTIPAliasClassID.hasOwnProperty(Config.Runewords[i][1].replace(/\s+/g, "").toLowerCase())) {
						Config.Runewords[i][1] = NTIPAliasClassID[Config.Runewords[i][1].replace(/\s+/g, "").toLowerCase()];
					} else {
						Misc.errorReport("ÿc1Invalid runewords entry:ÿc0 " + Config.Runewords[i][1]);
						Config.Runewords.splice(i, 1);

						i -= 1;
					}
				}
			}
		}

		this.buildLists();
	},

	validItem: function (item) {
		return CraftingSystem.validGids.indexOf(item.gid) === -1;
	},

	// build a list of needed runes. won't count runes until the base item is found for a given runeword
	buildLists: function () {
		this.validGids = [];
		this.needList = [];
		let baseCheck;
		let items = me.findItems(-1, sdk.items.mode.inStorage);

		for (let i = 0; i < Config.Runewords.length; i += 1) {
			if (!baseCheck) {
				baseCheck = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0)) || this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0), true);
			}

			if (this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0))) {
				RuneLoop:
				for (let j = 0; j < Config.Runewords[i][0].length; j += 1) {
					for (let k = 0; k < items.length; k += 1) {
						if (items[k].classid === Config.Runewords[i][0][j] && this.validItem(items[k])) {
							this.validGids.push(items[k].gid);
							items.splice(k, 1);

							k -= 1;

							continue RuneLoop;
						}
					}

					this.needList.push(Config.Runewords[i][0][j]);
				}
			}
		}

		// hel rune for rerolling purposes
		if (baseCheck) {
			let hel = me.getItem(sdk.items.runes.Hel, sdk.items.mode.inStorage);

			if (hel) {
				do {
					if (this.validGids.indexOf(hel.gid) === -1 && this.validItem(hel)) {
						this.validGids.push(hel.gid);

						return;
					}
				} while (hel.getNext());
			}

			this.needList.push(sdk.items.runes.Hel);
		}
	},

	update: function (classid, gid) {
		for (let i = 0; i < this.needList.length; i += 1) {
			if (this.needList[i] === classid) {
				this.needList.splice(i, 1);

				i -= 1;

				break;
			}
		}

		this.validGids.push(gid);
	},

	// returns an array of items that make a runeword if found, false if we don't have enough items for any
	checkRunewords: function () {
		let items = me.findItems(-1, sdk.items.mode.inStorage);

		for (let i = 0; i < Config.Runewords.length; i += 1) {
			let itemList = []; // reset item list
			let base = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0)); // check base

			if (base) {
				itemList.push(base); // push the base

				for (let j = 0; j < Config.Runewords[i][0].length; j += 1) {
					for (let k = 0; k < items.length; k += 1) {
						if (items[k].classid === Config.Runewords[i][0][j]) { // rune matched
							itemList.push(items[k]); // push into the item list
							items.splice(k, 1); // remove from item list as to not count it twice

							k -= 1;

							break; // stop item cycle - we found the item
						}
					}

					// can't complete runeword - go to next one
					if (itemList.length !== j + 2) {
						break;
					}

					if (itemList.length === Config.Runewords[i][0].length + 1) { // runes + base
						return itemList; // these items are our runeword
					}
				}
			}
		}

		return false;
	},

	// for pickit
	checkItem: function (unit) {
		if (!Config.MakeRunewords) return false;
		return (unit.itemType === sdk.items.type.Rune && this.needList.includes(unit.classid));
	},

	// for clearInventory - don't drop runes that are a part of runeword recipe
	keepItem: function (unit) {
		return this.validGids.includes(unit.gid);
	},

	/* get the base item based on classid and runeword recipe
		optional reroll argument = gets a runeword that needs rerolling
		rigged to accept item or classid as 2nd arg
	*/
	getBase: function (runeword, base, ethFlag, reroll) {
		let item = typeof base === "object" ? base : me.getItem(base, sdk.items.mode.inStorage);

		if (item) {
			do {
				if (item && item.quality < sdk.items.quality.Magic && item.sockets === runeword.length) {
					/* check if item has items socketed in it
						better check than getFlag(sdk.items.flags.Runeword) because randomly socketed items return false for it
					*/

					if ((!reroll && !item.getItem()) || (reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries))) {
						if (!ethFlag || (ethFlag === Roll.Eth && item.ethereal) || (ethFlag === Roll.NonEth && !item.ethereal)) {
							return copyUnit(item);
						}
					}
				}
			} while (typeof base !== "object" && item.getNext());
		}

		return false;
	},

	// args named this way to prevent confusion
	socketItem: function (base, rune) {
		if (!rune.toCursor()) return false;

		for (let i = 0; i < 3; i += 1) {
			clickItem(sdk.clicktypes.click.Left, base.x, base.y, base.location);

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!me.itemoncursor) {
					delay(300);

					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	getScroll: function () {
		let scroll = me.getItem(sdk.items.ScrollofTownPortal, sdk.items.mode.inStorage); // check if we already have the scroll
		if (scroll) return scroll;

		let npc = Town.initNPC("Shop");
		if (!npc) return false;

		scroll = npc.getItem(sdk.items.ScrollofTownPortal);

		if (scroll) {
			for (let i = 0; i < 3; i += 1) {
				scroll.buy(true);

				if (me.getItem(sdk.items.ScrollofTownPortal)) {
					break;
				}
			}
		}

		me.cancel();

		return me.getItem(sdk.items.ScrollofTownPortal, sdk.items.mode.inStorage);
	},

	makeRunewords: function () {
		if (!Config.MakeRunewords) return false;

		while (true) {
			this.buildLists();

			let items = this.checkRunewords(); // get a runeword. format = [base, runes...]

			// can't make runewords - exit loop
			if (!items) {
				break;
			}

			if (!Town.openStash()) return false;

			for (let i = 1; i < items.length; i += 1) {
				this.socketItem(items[0], items[i]);
			}

			print("ÿc4Runewords: ÿc0Made runeword: " + items[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""));
			D2Bot.printToConsole("Made runeword: " + items[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""), sdk.colors.D2Bot.Green);

			if (NTIP.CheckItem(items[0], this.pickitEntries)) {
				Misc.itemLogger("Runeword Kept", items[0]);
				Misc.logItem("Runeword Kept", items[0]);
			}
		}

		me.cancel();

		this.rerollRunewords();

		return true;
	},

	rerollRunewords: function () {
		for (let i = 0; i < Config.Runewords.length; i += 1) {
			let hel = me.getItem(sdk.items.runes.Hel, sdk.items.mode.inStorage);
			if (!hel) return false;

			let base = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2] || 0), true); // get a bad runeword

			if (base) {
				let scroll = this.getScroll();

				// failed to get scroll or open stash most likely means we're stuck somewhere in town, so it's better to return false
				if (!scroll || !Town.openStash() || !Cubing.emptyCube()) return false;

				// not a fatal error, if the cube can't be emptied, the func will return false on next cycle
				if (!Storage.Cube.MoveTo(base) || !Storage.Cube.MoveTo(hel) || !Storage.Cube.MoveTo(scroll)) {
					continue;
				}

				// probably only happens on server crash
				if (!Cubing.openCube()) return false;

				print("ÿc4Runewords: ÿc0Rerolling runeword: " + base.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""));
				D2Bot.printToConsole("Rerolling runeword: " + base.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""), sdk.colors.D2Bot.Green);
				transmute();
				delay(500);

				// can't pull the item out = no space = fail
				if (!Cubing.emptyCube()) return false;
			}
		}

		this.buildLists();

		while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
			me.cancel();
			delay(300);
		}

		return true;
	}
};
