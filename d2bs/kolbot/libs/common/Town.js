/**
*  @filename    Town.js
*  @author      kolton, theBGuy
*  @desc        do town chores like buying, selling and gambling
*
*/

const NPC = {
	Akara: getLocaleString(sdk.locale.npcs.Akara).toLowerCase(),
	Gheed: getLocaleString(sdk.locale.npcs.Gheed).toLowerCase(),
	Charsi: getLocaleString(sdk.locale.npcs.Charsi).toLowerCase(),
	Kashya: getLocaleString(sdk.locale.npcs.Kashya).toLowerCase(),
	Warriv: getLocaleString(sdk.locale.npcs.Warriv).toLowerCase(),

	Fara: getLocaleString(sdk.locale.npcs.Fara).toLowerCase(),
	Drognan: getLocaleString(sdk.locale.npcs.Drognan).toLowerCase(),
	Elzix: getLocaleString(sdk.locale.npcs.Elzix).toLowerCase(),
	Greiz: getLocaleString(sdk.locale.npcs.Greiz).toLowerCase(),
	Lysander: getLocaleString(sdk.locale.npcs.Lysander).toLowerCase(),
	Jerhyn: getLocaleString(sdk.locale.npcs.Jerhyn).toLowerCase(),
	Meshif: getLocaleString(sdk.locale.npcs.Meshif).toLowerCase(),
	Atma: getLocaleString(sdk.locale.npcs.Atma).toLowerCase(),

	Ormus: getLocaleString(sdk.locale.npcs.Ormus).toLowerCase(),
	Alkor: getLocaleString(sdk.locale.npcs.Alkor).toLowerCase(),
	Hratli: getLocaleString(sdk.locale.npcs.Hratli).toLowerCase(),
	Asheara: getLocaleString(sdk.locale.npcs.Asheara).toLowerCase(),

	Jamella: getLocaleString(sdk.locale.npcs.Jamella).toLowerCase(),
	Halbu: getLocaleString(sdk.locale.npcs.Halbu).toLowerCase(),
	Tyrael: getLocaleString(sdk.locale.npcs.Tyrael).toLowerCase(),

	Malah: getLocaleString(sdk.locale.npcs.Malah).toLowerCase(),
	Anya: getLocaleString(sdk.locale.npcs.Anya).toLowerCase(),
	Larzuk: getLocaleString(sdk.locale.npcs.Larzuk).toLowerCase(),
	Qual_Kehk: getLocaleString(sdk.locale.npcs.QualKehk).toLowerCase(),
	Nihlathak: getLocaleString(sdk.locale.npcs.Nihlathak2).toLowerCase(),

	Cain: getLocaleString(sdk.locale.npcs.DeckardCain).toLowerCase()
};

const Town = {
	telekinesis: true,
	sellTimer: getTickCount(), // shop speedup test
	lastInteractedNPC: {
		unit: null,
		tick: 0,
		set: function (npc) {
			this.unit = npc;
			this.tick = getTickCount();
		},
		get: function () {
			try {
				if (!!this.unit && getTickCount() - this.tick < Time.seconds(15)
					&& this.unit.name.toLowerCase() !== "an evil force" && this.unit.area === me.area) {
					Config.DebugMode && console.debug("used stored value");
					return this.unit;
				} else {
					this.reset();
					Config.DebugMode && console.debug("getting new npc");
					return getInteractedNPC();
				}
			} catch (e) {
				Config.DebugMode && console.error(e);
				this.reset();
				Config.DebugMode && console.debug("getting new npc");
				return getInteractedNPC();
			}
		},
		reset: function () {
			this.unit = null;
			this.tick = 0;
		}
	},

	tasks: [
		{Heal: NPC.Akara, Shop: NPC.Akara, Gamble: NPC.Gheed, Repair: NPC.Charsi, Merc: NPC.Kashya, Key: NPC.Akara, CainID: NPC.Cain},
		{Heal: NPC.Fara, Shop: NPC.Drognan, Gamble: NPC.Elzix, Repair: NPC.Fara, Merc: NPC.Greiz, Key: NPC.Lysander, CainID: NPC.Cain},
		{Heal: NPC.Ormus, Shop: NPC.Ormus, Gamble: NPC.Alkor, Repair: NPC.Hratli, Merc: NPC.Asheara, Key: NPC.Hratli, CainID: NPC.Cain},
		{Heal: NPC.Jamella, Shop: NPC.Jamella, Gamble: NPC.Jamella, Repair: NPC.Halbu, Merc: NPC.Tyrael, Key: NPC.Jamella, CainID: NPC.Cain},
		{Heal: NPC.Malah, Shop: NPC.Malah, Gamble: NPC.Anya, Repair: NPC.Larzuk, Merc: NPC.Qual_Kehk, Key: NPC.Malah, CainID: NPC.Cain}
	],

	ignoredItemTypes: [
		// Items that won't be stashed
		sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver, sdk.items.type.Book,
		sdk.items.type.Scroll, sdk.items.type.Key, sdk.items.type.HealingPotion,
		sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion,
		sdk.items.type.AntidotePotion, sdk.items.type.ThawingPotion
	],

	needPotions: function () {
		// we aren't using MinColumn if none of the values are set
		if (!Config.MinColumn.some(el => el > 0)) return false;
		// no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
		if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
		
		// Start
		if (me.charlvl > 2 && me.gold > 1000) {
			let pots = {
				hp: [],
				mp: [],
			};
			me.getItemsEx(-1, sdk.items.mode.inBelt)
				.filter(p => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType) && p.x < 4)
				.forEach(p => {
					if (p.itemType === sdk.items.type.HealingPotion) {
						pots.hp.push(copyUnit(p));
					} else if (p.itemType === sdk.items.type.ManaPotion) {
						pots.mp.push(copyUnit(p));
					}
				});

			// quick check
			if ((Config.BeltColumn.includes("hp") && !pots.hp.length)
				|| (Config.BeltColumn.includes("mp") && !pots.mp.length)) {
				return true;
			}

			// if we have no belt what should qualify is to go to town at this point?
			// we've confirmed having at least some potions in the above check
			// if (!me.inTown && Storage.BeltSize() === 1) return false;

			// should we check the actual amount in the column?
			// For now just keeping the way it was and checking if a column is empty
			for (let i = 0; i < 4; i += 1) {
				if (Config.MinColumn[i] <= 0) {
					continue;
				}

				switch (Config.BeltColumn[i]) {
				case "hp":
					if (!pots.hp.some(p => p.x === i)) {
						console.debug("Column: " + (i + 1) + " needs hp pots");
						return true;
					}
					break;
				case "mp":
					if (!pots.mp.some(p => p.x === i)) {
						console.debug("Column: " + (i + 1) + " needs mp pots");
						return true;
					}
					break;
				}
			}
		}

		return false;
	},

	// Do town chores
	doChores: function (repair = false) {
		delay(250);

		console.time("doChores");
		console.info(true);

		!me.inTown && this.goToTown();
		if (!Misc.poll(() => me.gameReady && me.inTown, 2000, 250)) throw new Error("Failed to go to town for chores");

		let preAct = me.act;

		// Burst of speed while in town
		if (Skill.canUse(sdk.skills.BurstofSpeed) && !me.getState(sdk.states.BurstofSpeed)) {
			Skill.cast(sdk.skills.BurstofSpeed, sdk.skills.hand.Right);
		}

		me.switchWeapons(Attack.getPrimarySlot());

		this.heal();
		this.identify();
		this.clearInventory();
		this.fillTome(sdk.items.TomeofTownPortal);
		this.buyPotions();
		Config.FieldID.Enabled && this.fillTome(sdk.items.TomeofIdentify);
		this.shopItems();
		this.buyKeys();
		this.repair(repair);
		this.gamble();
		this.reviveMerc();
		Cubing.doCubing();
		Runewords.makeRunewords();
		this.stash(true);
		!!me.getItem(sdk.items.TomeofTownPortal) && this.clearScrolls();

		me.act !== preAct && this.goToTown(preAct);
		me.cancelUIFlags();
		!me.barbarian && Precast.haveCTA === -1 && Precast.doPrecast(false);

		delay(250);
		console.info(false, null, "doChores");

		return true;
	},

	npcInteract: function (name = "", cancel = true) {
		!name.includes("_") && (name = name.capitalize(true));
		name.includes("_") && (name = "Qual_Kehk");

		!me.inTown && Town.goToTown();
		me.cancelUIFlags();

		switch (NPC[name]) {
		case NPC.Jerhyn:
			!Game.getNPC(NPC.Jerhyn) && Town.move("palace");
			break;
		case NPC.Hratli:
			if (!me.getQuest(sdk.quest.id.SpokeToHratli, sdk.quest.states.Completed)) {
				Town.move(NPC.Meshif);
				break;
			}
			// eslint-disable-next-line no-fallthrough
		default:
			Town.move(NPC[name]);
		}

		let npc = Game.getNPC(NPC[name]);

		// In case Jerhyn is by Warriv
		if (name === "Jerhyn" && !npc) {
			me.cancel();
			Pather.moveTo(5166, 5206);
			npc = Game.getNPC(NPC[name]);
		}

		Packet.flash(me.gid);
		delay(40);

		if (npc && npc.openMenu()) {
			cancel && me.cancel();
			this.lastInteractedNPC.set(npc);
			return npc;
		}

		return false;
	},

	// just consumables
	checkQuestItems: function () {
		// Radament skill book
		let book = me.getItem(sdk.quest.item.BookofSkill);
		if (book) {
			book.isInStash && this.openStash() && delay(300 + me.ping);
			book.use();
		}

		// Act 3
		// Figurine -> Golden Bird
		if (me.getItem(sdk.quest.item.AJadeFigurine)) {
			Town.goToTown(3) && Town.npcInteract("meshif");
		}

		// Golden Bird -> Ashes
		if (me.getItem(sdk.items.quest.TheGoldenBird)) {
			Town.goToTown(3) && Town.npcInteract("alkor");
		}

		// Potion of life
		let pol = me.getItem(sdk.quest.item.PotofLife);
		if (pol) {
			pol.isInStash && this.openStash() && delay(300 + me.ping);
			pol.use();
		}

		// LamEssen's Tome
		let tome = me.getItem(sdk.quest.item.LamEsensTome);
		if (tome) {
			!me.inTown && Town.goToTown(3);
			tome.isInStash && Town.openStash() && Storage.Inventory.MoveTo(tome);
			Town.npcInteract("alkor");
		}

		// Scroll of resistance
		let sor = me.getItem(sdk.items.quest.ScrollofResistance);
		if (sor) {
			sor.isInStash && this.openStash() && delay(300 + me.ping);
			sor.use();
		}
	},

	getTpTool: function () {
		let items = me.getItemsEx(-1, sdk.items.mode.inStorage).filter((item) => item.isInInventory && [sdk.items.ScrollofTownPortal, sdk.items.TomeofTownPortal].includes(item.classid));
		if (!items.length) return null;
		let tome = items.find((i) => i.classid === sdk.items.TomeofTownPortal && i.getStat(sdk.stats.Quantity) > 0);
		if (tome) return tome;
		let scroll = items.find((i) => i.classid === sdk.items.ScrollofTownPortal);
		if (scroll) return scroll;
		return null;
	},

	getIdTool: function () {
		let items = me.getItemsEx().filter((i) => i.isInInventory && [sdk.items.ScrollofIdentify, sdk.items.TomeofIdentify].includes(i.classid));
		if (!items.length) return null;
		let tome = items.find((i) => i.isInInventory && i.classid === sdk.items.TomeofIdentify && i.getStat(sdk.stats.Quantity) > 0);
		if (tome) return tome;
		let scroll = items.find((i) => i.isInInventory && i.classid === sdk.items.ScrollofIdentify);
		if (scroll) return scroll;
		return null;
	},

	canTpToTown: function () {
		// can't tp if dead
		if (me.dead) return false;
		let badAreas = [
			sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.KurastDocktown,
			sdk.areas.PandemoniumFortress, sdk.areas.Harrogath, sdk.areas.ArreatSummit, sdk.areas.UberTristram
		];
		let myArea = me.area;
		// can't tp from town or Uber Trist, and shouldn't tp from arreat summit
		if (badAreas.includes(myArea)) return false;
		// If we made it this far, we can only tp if we even have a tp
		return !!this.getTpTool();
	},

	// Start a task and return the NPC Unit
	initNPC: function (task = "", reason = "undefined") {
		console.time("initNPC");
		console.info(true, reason);
		task = task.capitalize(false);

		delay(250);

		let npc = this.lastInteractedNPC.get();
		let justUseClosest = (["clearInventory", "sell"].includes(reason) && !Town.getUnids());

		try {
			if (!!npc) {
				if (!justUseClosest && ((npc.name.toLowerCase() !== this.tasks[me.act - 1][task])
					// Jamella gamble fix
					|| (task === "Gamble" && npc.name.toLowerCase() === NPC.Jamella))) {
					me.cancelUIFlags();
					npc = null;
					this.lastInteractedNPC.reset();
				}
			}

			// we are just trying to clear our inventory, use the closest npc
			// what if we have unid items? Should we use cain if he is closer than the npc with scrolls?
			// for now it won't get here with unids
			// need to also take into account what our next task is
			if (justUseClosest) {
				let npcs = this.tasks[me.act - 1];
				npc = getUnits(sdk.unittype.NPC)
					.sort((a, b) => a.distance - b.distance)
					.find(unit => [npcs.Shop, npcs.Repair].includes(unit.name.toLowerCase()));
			}

			if (!npc) {
				npc = Game.getNPC(this.tasks[me.act - 1][task]);

				if (!npc) {
					this.move(this.tasks[me.act - 1][task]);
					npc = Game.getNPC(this.tasks[me.act - 1][task]);
				}
			}

			if (!npc || npc.area !== me.area || (!getUIFlag(sdk.uiflags.NPCMenu) && !npc.openMenu())) {
				throw new Error("Couldn't interact with npc");
			}

			delay(40);

			switch (task) {
			case "Shop":
			case "Repair":
			case "Gamble":
				if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade(task)) {
					throw new Error("Failed to complete " + reason + " at " + npc.name);
				}
				break;
			case "Key":
				if (!getUIFlag(sdk.uiflags.Shop) && !npc.startTrade(me.act === 3 ? "Repair" : "Shop")) {
					throw new Error("Failed to complete " + reason + " at " + npc.name);
				}
				break;
			case "CainID":
				Misc.useMenu(sdk.menu.IdentifyItems);
				me.cancelUIFlags();

				break;
			case "Heal":
				break;
			}

			console.info(false, "Did " + reason + " at " + npc.name, "initNPC");
		} catch (e) {
			console.error(e);

			if (!!e.message && e.message === "Couldn't interact with npc") {
				// getUnit bug probably, lets see if going to different act helps
				let highestAct = me.highestAct;
				if (highestAct === 1) return false; // can't go to any of the other acts
				let myAct = me.act;
				let potentialActs = [1, 2, 3, 4, 5].filter(a => a <= highestAct && a !== myAct);
				let goTo = potentialActs[rand(0, potentialActs.length - 1)];
				Config.DebugMode && console.debug("Going to Act " + goTo + " to see if it fixes getUnit bug");
				Town.goToTown(goTo);
			}

			return false;
		}

		Misc.poll(() => me.gameReady, 2000, 250);
		this.lastInteractedNPC.set(npc);

		if (task === "Heal") {
			Config.DebugMode && console.debug("Checking if we are frozen");
			if (me.getState(sdk.states.Frozen)) {
				console.log("We are frozen, lets unfreeze real quick with some thawing pots");
				Town.buyPots(2, sdk.items.ThawingPotion, true, true, npc);
			}
		}

		return npc;
	},

	// Go to a town healer
	heal: function () {
		if (!this.needHealing()) return true;
		return !!(this.initNPC("Heal", "heal"));
	},

	// Check if healing is needed, based on character config
	needHealing: function () {
		if (me.hpPercent <= Config.HealHP || me.mpPercent <= Config.HealMP) return true;

		// Status effects
		return (Config.HealStatus
			&& [
				sdk.states.Poison,
				sdk.states.AmplifyDamage,
				sdk.states.Frozen,
				sdk.states.Weaken,
				sdk.states.Decrepify,
				sdk.states.LowerResist
			].some((state) => me.getState(state)));
	},

	buyPotions: function () {
		// Ain't got money fo' dat shyt
		if (me.gold < 1000) return false;

		this.clearBelt();
		const buffer = { hp: 0, mp: 0 };
		const beltSize = Storage.BeltSize();
		let [needPots, needBuffer, specialCheck] = [false, true, false];
		let col = this.checkColumns(beltSize);

		const getNeededBuffer = () => {
			[buffer.hp, buffer.mp] = [0, 0];
			me.getItemsEx().filter(function (p) {
				return p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType);
			}).forEach(function (p) {
				switch (p.itemType) {
				case sdk.items.type.HealingPotion:
					return (buffer.hp++);
				case sdk.items.type.ManaPotion:
					return (buffer.mp++);
				}
				return false;
			});
		};

		// HP/MP Buffer
		(Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

		// Check if we need to buy potions based on Config.MinColumn
		if (Config.BeltColumn.some((c, i) => ["hp", "mp"].includes(c) && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize)))) {
			needPots = true;
		}

		// Check if we need any potions for buffers
		if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
			if (Config.BeltColumn.some((c, i) => col[i] >= beltSize && (!needPots || c === "rv"))) {
				specialCheck = true;
			}
		}

		// We have enough potions in inventory
		(buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) && (needBuffer = false);

		// No columns to fill
		if (!needPots && !needBuffer) return true;
		// todo: buy the cheaper potions if we are low on gold or don't need the higher ones i.e have low mana/health pool
		// why buy potion that heals 225 (greater mana) if we only have sub 100 mana
		me.normal && me.highestAct >= 4 && me.act < 4 && this.goToTown(4);

		let npc = this.initNPC("Shop", "buyPotions");
		if (!npc) return false;

		// special check, sometimes our rejuv slot is empty but we do still need buffer. Check if we can buy something to slot there
		if (specialCheck && Config.BeltColumn.some((c, i) => c === "rv" && col[i] >= beltSize)) {
			let pots = [sdk.items.ThawingPotion, sdk.items.AntidotePotion, sdk.items.StaminaPotion];
			Config.BeltColumn.forEach((c, i) => {
				if (c === "rv" && col[i] >= beltSize && pots.length) {
					let usePot = pots[0];
					let pot = npc.getItem(usePot);
					if (pot) {
						Storage.Inventory.CanFit(pot) && Packet.buyItem(pot, false);
						pot = me.getItemsEx(usePot, sdk.items.mode.inStorage).filter(i => i.isInInventory).first();
						!!pot && Packet.placeInBelt(pot, i);
						pots.shift();
					} else {
						needBuffer = false; // we weren't able to find any pots to buy
					}
				}
			});
		}

		for (let i = 0; i < 4; i += 1) {
			if (col[i] > 0) {
				let useShift = this.shiftCheck(col, beltSize);
				let pot = this.getPotion(npc, Config.BeltColumn[i]);

				if (pot) {
					//print("ÿc2column ÿc0" + i + "ÿc2 needs ÿc0" + col[i] + " ÿc2potions");
					// Shift+buy will trigger if there's no empty columns or if only the current column is empty
					if (useShift) {
						pot.buy(true);
					} else {
						for (let j = 0; j < col[i]; j += 1) {
							pot.buy(false);
						}
					}
				}
			}

			col = this.checkColumns(beltSize); // Re-initialize columns (needed because 1 shift-buy can fill multiple columns)
		}
		
		// re-check
		!needBuffer && (Config.HPBuffer > 0 || Config.MPBuffer > 0) && getNeededBuffer();

		if (needBuffer && buffer.hp < Config.HPBuffer) {
			for (let i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
				let pot = this.getPotion(npc, "hp");
				!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
			}
		}

		if (needBuffer && buffer.mp < Config.MPBuffer) {
			for (let i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
				let pot = this.getPotion(npc, "mp");
				!!pot && Storage.Inventory.CanFit(pot) && pot.buy(false);
			}
		}

		return true;
	},

	// Check when to shift-buy potions
	shiftCheck: function (col, beltSize) {
		let fillType;

		for (let i = 0; i < col.length; i += 1) {
			// Set type based on non-empty column
			if (!fillType && col[i] > 0 && col[i] < beltSize) {
				fillType = Config.BeltColumn[i];
			}

			if (col[i] >= beltSize) {
				switch (Config.BeltColumn[i]) {
				case "hp":
					!fillType && (fillType = "hp");
					if (fillType !== "hp") return false;

					break;
				case "mp":
					!fillType && (fillType = "mp");
					if (fillType !== "mp") return false;

					break;
				case "rv": // Empty rejuv column = can't shift-buy
					return false;
				}
			}
		}

		return true;
	},

	// Return column status (needed potions in each column)
	checkColumns: function (beltSize) {
		let col = [beltSize, beltSize, beltSize, beltSize];
		let pot = me.getItem(-1, sdk.items.mode.inBelt);

		// No potions
		if (!pot) return col;

		do {
			col[pot.x % 4] -= 1;
		} while (pot.getNext());

		return col;
	},

	// Get the highest potion from current npc
	getPotion: function (npc, type, highestPot = 5) {
		if (!type) return false;

		if (type === "hp" || type === "mp") {
			for (let i = highestPot; i > 0; i -= 1) {
				let result = npc.getItem(type + i);

				if (result) {
					return result;
				}
			}
		}

		return false;
	},

	fillTome: function (classid) {
		if (me.gold < 450) return false;
		if (this.checkScrolls(classid) >= 13) return true;

		let npc = this.initNPC("Shop", "fillTome");
		if (!npc) return false;

		delay(500);

		if (classid === sdk.items.TomeofTownPortal && !me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory)) {
			let tome = npc.getItem(sdk.items.TomeofTownPortal);

			if (tome && Storage.Inventory.CanFit(tome)) {
				try {
					tome.buy();
				} catch (e1) {
					print(e1);
					// Couldn't buy the tome, don't spam the scrolls
					return false;
				}
			} else {
				return false;
			}
		}

		let scroll = npc.getItem(classid === sdk.items.TomeofTownPortal ? sdk.items.ScrollofTownPortal : sdk.items.ScrollofIdentify);
		if (!scroll) return false;

		try {
			scroll.buy(true);
		} catch (e2) {
			print(e2.message);

			return false;
		}

		return true;
	},

	checkScrolls: function (id) {
		let tome = me.findItem(id, sdk.items.mode.inStorage, sdk.storage.Inventory);

		if (!tome) {
			switch (id) {
			case sdk.items.TomeofIdentify:
			case "ibk":
				return Config.FieldID.Enabled ? 0 : 20; // Ignore missing ID tome if we aren't using field ID
			case sdk.items.TomeofTownPortal:
			case "tbk":
				return 0; // Force TP tome check
			}
		}

		return tome.getStat(sdk.stats.Quantity);
	},

	identify: function () {
		me.cancelUIFlags();

		if (this.cainID()) return true;
		
		let list = (Storage.Inventory.Compare(Config.Inventory) || []);
		if (list.length === 0) return false;

		// Avoid unnecessary NPC visits
		// Only unid items or sellable junk (low level) should trigger a NPC visit
		if (!list.some(item => {
			let identified = item.identified;
			return ((!identified || Config.LowGold > 0) && ([Pickit.Result.UNID, Pickit.Result.TRASH].includes(Pickit.checkItem(item).result)/*  || (!identified && AutoEquip.hasTier(item)) */));
		})) {
			return false;
		}

		let npc = this.initNPC("Shop", "identify");
		if (!npc) return false;

		let tome = me.findItem(sdk.items.TomeofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);
		!!tome && tome.getStat(sdk.stats.Quantity) < list.length && this.fillTome(sdk.items.TomeofIdentify);

		MainLoop:
		while (list.length > 0) {
			let item = list.shift();

			if (!item.identified && item.isInInventory && !this.ignoredItemTypes.includes(item.itemType)) {
				let result = Pickit.checkItem(item);

				// Force ID for unid items matching autoEquip criteria
				//result.result === 1 && !item.identified && Item.hasTier(item) && (result.result = -1);

				switch (result.result) {
				// Items for gold, will sell magics, etc. w/o id, but at low levels
				// magics are often not worth iding.
				case Pickit.Result.TRASH:
					Misc.itemLogger("Sold", item);
					item.sell();

					break;
				case Pickit.Result.UNID:
					let idTool = tome ? tome : Town.getIdTool();

					if (idTool) {
						this.identifyItem(item, idTool);
					} else {
						let scroll = npc.getItem(sdk.items.ScrollofIdentify);

						if (scroll) {
							if (!Storage.Inventory.CanFit(scroll)) {
								let tpTome = me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

								if (tpTome) {
									tpTome.sell();
									delay(500);
								}
							}

							delay(500);

							Storage.Inventory.CanFit(scroll) && scroll.buy();
						}

						scroll = me.findItem(sdk.items.ScrollofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

						if (!scroll) {
							break MainLoop;
						}

						this.identifyItem(item, scroll);
					}

					result = Pickit.checkItem(item);

					// should autoequip even be checked by default?
					//!Item.autoEquipCheck(item) && (result.result = 0);

					switch (result.result) {
					case Pickit.Result.WANTED:
						// Couldn't id autoEquip item. Don't log it.
						// if (result.result === 1 && Config.AutoEquip && !item.indentifed && Item.autoEquipCheck(item)) {
						// 	break;
						// }

						Misc.itemLogger("Kept", item);
						Misc.logItem("Kept", item, result.line);

						break;
					case Pickit.Result.UNID:
					case Pickit.Result.RUNEWORD: // (doesn't trigger normally)
						break;
					case Pickit.Result.CUBING:
						Misc.itemLogger("Kept", item, "Cubing-Town");
						Cubing.update();

						break;
					case Pickit.Result.CRAFTING:
						Misc.itemLogger("Kept", item, "CraftSys-Town");
						CraftingSystem.update(item);

						break;
					default:
						Misc.itemLogger("Sold", item);
						item.sell();

						let timer = getTickCount() - this.sellTimer; // shop speedup test

						if (timer > 0 && timer < 500) {
							delay(timer);
						}

						break;
					}

					break;
				}
			}
		}

		this.fillTome(sdk.items.TomeofTownPortal); // Check for TP tome in case it got sold for ID scrolls

		return true;
	},

	cainID: function () {
		// Not enabled or Check if we may use Cain - minimum gold
		if (!Config.CainID.Enable || me.gold < Config.CainID.MinGold) return false;

		// Check if we're already in a shop. It would be pointless to go to Cain if so.
		let npc = getInteractedNPC();
		if (npc && npc.name.toLowerCase() === this.tasks[me.act - 1].Shop) return false;

		me.cancel();
		this.stash(false);

		let unids = this.getUnids();

		if (unids) {
			// Check if we may use Cain - number of unid items
			if (unids.length < Config.CainID.MinUnids) return false;

			// Check if we may use Cain - kept unid items
			for (let i = 0; i < unids.length; i += 1) {
				if (Pickit.checkItem(unids[i]).result > 0) return false;
			}

			let cain = this.initNPC("CainID", "cainID");
			if (!cain) return false;

			for (let i = 0; i < unids.length; i += 1) {
				let result = Pickit.checkItem(unids[i]);

				//!Item.autoEquipCheck(unids[i]) && (result = 0);

				switch (result.result) {
				case Pickit.Result.UNWANTED:
					Misc.itemLogger("Dropped", unids[i], "cainID");
					unids[i].drop();

					break;
				case Pickit.Result.WANTED:
					Misc.itemLogger("Kept", unids[i]);
					Misc.logItem("Kept", unids[i], result.line);

					break;
				default:
					break;
				}
			}
		}

		return true;
	},

	// Identify items while in the field if we have a id tome
	fieldID: function () {
		let list = this.getUnids();
		if (!list) return false;

		let tome = me.findItem(sdk.items.TomeofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);
		if (!tome || tome.getStat(sdk.stats.Quantity) < list.length) return false;

		while (list.length > 0) {
			let item = list.shift();
			let result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			//result.result === 1 && !item.getFlag(sdk.items.flags.Identified) && Item.hasTier(item) && (result.result = -1);

			// unid item that should be identified
			if (result.result === Pickit.Result.UNID) {
				this.identifyItem(item, tome, Config.FieldID.PacketID);
				delay(me.ping + 1);
				result = Pickit.checkItem(item);

				//!Item.autoEquipCheck(item) && (result.result = 0);

				switch (result.result) {
				case Pickit.Result.UNWANTED:
					Misc.itemLogger("Dropped", item, "fieldID");

					if (Config.DroppedItemsAnnounce.Enable && Config.DroppedItemsAnnounce.Quality.includes(item.quality)) {
						say("Dropped: [" + Pickit.itemQualityToName(item.quality).charAt(0).toUpperCase() + Pickit.itemQualityToName(item.quality).slice(1) + "] " + item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim());

						if (Config.DroppedItemsAnnounce.LogToOOG && Config.DroppedItemsAnnounce.OOGQuality.includes(item.quality)) {
							Misc.logItem("Field Dropped", item, result.line);
						}
					}

					item.drop();

					break;
				case Pickit.Result.WANTED:
					Misc.itemLogger("Field Kept", item);
					Misc.logItem("Field Kept", item, result.line);

					break;
				default:
					break;
				}
			}
		}

		delay(200);
		me.cancel();

		return true;
	},

	getUnids: function () {
		let list = [];
		let item = me.getItem(-1, sdk.items.mode.inStorage);

		if (!item) return false;

		do {
			if (item.isInInventory && !item.identified) {
				list.push(copyUnit(item));
			}
		} while (item.getNext());

		if (!list.length) return false;

		return list;
	},

	identifyItem: function (unit, tome, packetID = false) {
		if (Config.PacketShopping || packetID) return Packet.identifyItem(unit, tome);
		if (!unit || unit.identified) return false;

		this.sellTimer = getTickCount(); // shop speedup test

		CursorLoop:
		for (let i = 0; i < 3; i += 1) {
			clickItem(sdk.clicktypes.click.Right, tome);

			let tick = getTickCount();

			while (getTickCount() - tick < 500) {
				if (getCursorType() === sdk.cursortype.Identify) {
					break CursorLoop;
				}

				delay(10);
			}
		}

		if (getCursorType() !== sdk.cursortype.Identify) return false;

		delay(270);

		for (let i = 0; i < 3; i += 1) {
			if (getCursorType() === sdk.cursortype.Identify) {
				clickItem(sdk.clicktypes.click.Left, unit);
			}

			let tick = getTickCount();

			while (getTickCount() - tick < 500) {
				if (unit.identified) {
					delay(50);

					return true;
				}

				delay(10);
			}

			delay(300);
		}

		return false;
	},

	shopItems: function () {
		if (!Config.MiniShopBot) return true;
		
		let npc = getInteractedNPC();
		if (!npc || !npc.itemcount) return false;

		let items = npc.getItemsEx().filter((item) => Town.ignoredItemTypes.indexOf(item.itemType) === -1);
		if (!items.length) return false;

		print("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

		for (let i = 0; i < items.length; i += 1) {
			let result = Pickit.checkItem(items[i]);

			if (result.result === Pickit.Result.WANTED/*  && Item.autoEquipCheck(items[i]) */) {
				try {
					if (Storage.Inventory.CanFit(items[i]) && me.gold >= items[i].getItemCost(sdk.items.cost.ToBuy)) {
						Misc.itemLogger("Shopped", items[i]);
						Misc.logItem("Shopped", items[i], result.line);
						items[i].buy();
					}
				} catch (e) {
					print(e);
				}
			}

			delay(2);
		}

		return true;
	},

	gambleIds: [],

	gamble: function () {
		if (!this.needGamble() || Config.GambleItems.length === 0) return true;
		if (this.gambleIds.length === 0) {
			// change text to classid
			for (let i = 0; i < Config.GambleItems.length; i += 1) {
				if (isNaN(Config.GambleItems[i])) {
					if (NTIPAliasClassID.hasOwnProperty(Config.GambleItems[i].replace(/\s+/g, "").toLowerCase())) {
						this.gambleIds.push(NTIPAliasClassID[Config.GambleItems[i].replace(/\s+/g, "").toLowerCase()]);
					} else {
						Misc.errorReport("ÿc1Invalid gamble entry:ÿc0 " + Config.GambleItems[i]);
					}
				} else {
					this.gambleIds.push(Config.GambleItems[i]);
				}
			}
		}

		if (this.gambleIds.length === 0) return true;

		// avoid Alkor
		me.act === 3 && this.goToTown(2);
		let npc = this.initNPC("Gamble", "gamble");

		if (!npc) return false;

		let list = [];
		let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

		while (items && items.length > 0) {
			list.push(items.shift().gid);
		}

		while (me.gold >= Config.GambleGoldStop) {
			!getInteractedNPC() && npc.startTrade("Gamble");

			let item = npc.getItem();
			items = [];

			if (item) {
				do {
					if (this.gambleIds.includes(item.classid)) {
						items.push(copyUnit(item));
					}
				} while (item.getNext());

				for (let i = 0; i < items.length; i += 1) {
					if (!Storage.Inventory.CanFit(items[i])) {
						return false;
					}

					//me.overhead("Buy: " + items[i].name);
					items[i].buy(false, true);
					let newItem = this.getGambledItem(list);

					if (newItem) {
						let result = Pickit.checkItem(newItem);

						//!Item.autoEquipCheck(newItem) && (result = 0);

						switch (result.result) {
						case Pickit.Result.WANTED:
							Misc.itemLogger("Gambled", newItem);
							Misc.logItem("Gambled", newItem, result.line);
							list.push(newItem.gid);

							break;
						case Pickit.Result.CUBING:
							list.push(newItem.gid);
							Cubing.update();

							break;
						case Pickit.Result.CRAFTING:
							CraftingSystem.update(newItem);

							break;
						default:
							Misc.itemLogger("Sold", newItem, "Gambling");
							me.overhead("Sell: " + newItem.name);
							newItem.sell();

							if (!Config.PacketShopping) {
								delay(500);
							}

							break;
						}
					}
				}
			}

			me.cancel();
		}

		return true;
	},

	needGamble: function () {
		return Config.Gamble && me.gold >= Config.GambleGoldStart;
	},

	getGambledItem: function (list = []) {
		let items = me.findItems(-1, sdk.items.mode.inStorage, sdk.storage.Inventory);

		for (let i = 0; i < items.length; i += 1) {
			if (list.indexOf(items[i].gid) === -1) {
				for (let j = 0; j < 3; j += 1) {
					if (items[i].identified) {
						break;
					}

					delay(100);
				}

				return items[i];
			}
		}

		return false;
	},

	buyPots: function (quantity = 0, type = undefined, drink = false, force = false, npc = null) {
		if (!quantity || !type) return false;
		
		// convert to classid if isn't one
		typeof type === "string" && (type = (sdk.items[type.capitalize(true) + "Potion"] || false));
		if (!type) return false;

		// todo - change act in a3 if we are next to the wp as it's faster than going all the way to Alkor
		// todo - compare distance Ormus -> Alkor compared to Ormus -> WP -> Akara
		let potDealer = ["Akara", "Lysander", "Alkor", "Jamella", "Malah"][me.act - 1];

		switch (type) {
		case sdk.items.ThawingPotion:
			// Don't buy if already at max res
			if (!force && me.coldRes >= 75) return true;
			console.info(null, "Current cold resistance: " + me.coldRes);

			break;
		case sdk.items.AntidotePotion:
			// Don't buy if already at max res
			if (!force && me.poisonRes >= 75) return true;
			console.info(null, "Current poison resistance: " + me.poisonRes);

			break;
		case sdk.items.StaminaPotion:
			// Don't buy if teleport or vigor
			if (!force && (Skill.canUse(sdk.skills.Vigor) || Pather.canTeleport())) return true;

			break;
		}

		npc = !!npc ? npc : Town.lastInteractedNPC.get();

		try {
			if (!!npc && npc.name.toLowerCase() === NPC[potDealer] && !getUIFlag(sdk.uiflags.Shop)) {
				if (!npc.startTrade("Shop")) throw new Error("Failed to open " + npc.name + " trade menu");
			} else {
				me.cancelUIFlags();
				npc = null;
				Town.lastInteractedNPC.reset();

				Town.move(NPC[potDealer]);
				npc = Game.getNPC(NPC[potDealer]);

				if (!npc || !npc.openMenu() || !npc.startTrade("Shop")) throw new Error("Failed to open " + npc.name + " trade menu");
				Town.lastInteractedNPC.set(npc);
			}
		} catch (e) {
			console.error(e);

			return false;
		}

		let pot = npc.getItem(type);
		if (!pot) {
			console.warn("Couldn't find " + type + " from " + npc.name);
			return false;
		}
		let name = (pot.name || "");

		console.info(null, "Buying " + quantity + " " + name + "s");

		for (let pots = 0; pots < quantity; pots++) {
			if (!!pot && Storage.Inventory.CanFit(pot)) {
				Packet.buyItem(pot, false);
			}
		}

		me.cancelUIFlags();
		drink && Town.drinkPots(type);

		return true;
	},

	drinkPots: function (type = undefined, log = true) {
		// convert to classid if isn't one
		typeof type === "string" && (type = (sdk.items[type.capitalize(true) + "Potion"] || false));

		let name = "";
		let quantity = 0;
		let chugs = me.getItemsEx(type).filter(pot => pot.isInInventory);

		if (chugs.length > 0) {
			name = chugs.first().name;
			let pingDelay = me.getPingDelay();

			chugs.forEach(function (pot) {
				if (!!pot && pot.use()) {
					quantity++;
					delay(100 + pingDelay);
				}
			});

			log && name && console.info(null, "Drank " + quantity + " " + name + "s. Timer [" + Time.format(quantity * 30 * 1000) + "]");
		} else {
			console.warn("couldn't find my pots");
		}

		return {
			potName: name,
			quantity: quantity
		};
	},

	buyKeys: function () {
		if (!this.wantKeys()) return true;

		// avoid Hratli
		me.act === 3 && this.goToTown(Pather.accessToAct(4) ? 4 : 2);

		let npc = this.initNPC("Key", "buyKeys");
		if (!npc) return false;

		let key = npc.getItem("key");
		if (!key) return false;

		try {
			key.buy(true);
		} catch (e) {
			console.error(e);

			return false;
		}

		return true;
	},

	checkKeys: function () {
		if (!Config.OpenChests.Enabled || me.assassin || me.gold < 540 || (!me.getItem("key") && !Storage.Inventory.CanFit({sizex: 1, sizey: 1}))) {
			return 12;
		}

		let count = 0;
		let key = me.findItems(sdk.items.Key, sdk.items.mode.inStorage, sdk.storage.Inventory);

		if (key) {
			for (let i = 0; i < key.length; i += 1) {
				count += key[i].getStat(sdk.stats.Quantity);
			}
		}

		return count;
	},

	needKeys: function () {
		return this.checkKeys() <= 0;
	},

	wantKeys: function () {
		return this.checkKeys() <= 6;
	},

	repairIngredientCheck: function (item) {
		if (!Config.CubeRepair) return false;

		let needRal = 0;
		let needOrt = 0;
		let have = 0;
		let items = this.getItemsForRepair(Config.RepairPercent, false);

		if (items && items.length) {
			while (items.length > 0) {
				switch (items.shift().itemType) {
				case sdk.items.type.Shield:
				case sdk.items.type.Armor:
				case sdk.items.type.Boots:
				case sdk.items.type.Gloves:
				case sdk.items.type.Belt:
				case sdk.items.type.VoodooHeads:
				case sdk.items.type.AuricShields:
				case sdk.items.type.PrimalHelm:
				case sdk.items.type.Pelt:
				case sdk.items.type.Circlet:
					needRal += 1;

					break;
				default:
					needOrt += 1;

					break;
				}
			}
		}

		switch (item.classid) {
		case sdk.items.runes.Ral:
			needRal && (have = me.findItems(sdk.items.runes.Ral).length);

			return (!have || have < needRal);
		case sdk.items.runes.Ort:
			needOrt && (have = me.findItems(sdk.items.runes.Ort).length);

			return (!have || have < needOrt);
		}

		return false;
	},

	cubeRepair: function () {
		if (!Config.CubeRepair || !me.cube) return false;

		let items = this.getItemsForRepair(Config.RepairPercent, false)
			.sort((a, b) => a.durabilityPercent - b.durabilityPercent);

		while (items.length > 0) {
			this.cubeRepairItem(items.shift());
		}

		return true;
	},

	cubeRepairItem: function (item) {
		if (!item.isInStorage) return false;

		let rune, cubeItems;
		let bodyLoc = item.bodylocation;

		switch (item.itemType) {
		case sdk.items.type.Shield:
		case sdk.items.type.Armor:
		case sdk.items.type.Boots:
		case sdk.items.type.Gloves:
		case sdk.items.type.Belt:
		case sdk.items.type.VoodooHeads:
		case sdk.items.type.AuricShields:
		case sdk.items.type.PrimalHelm:
		case sdk.items.type.Pelt:
		case sdk.items.type.Circlet:
			rune = me.getItem(sdk.items.runes.Ral);

			break;
		default:
			rune = me.getItem(sdk.items.runes.Ort);

			break;
		}

		if (rune && Town.openStash() && Cubing.openCube() && Cubing.emptyCube()) {
			for (let i = 0; i < 100; i += 1) {
				if (!me.itemoncursor) {
					if (Storage.Cube.MoveTo(item) && Storage.Cube.MoveTo(rune)) {
						transmute();
						delay(1000 + me.ping);
					}

					cubeItems = me.findItems(-1, -1, sdk.storage.Cube); // Get cube contents

					// We expect only one item in cube
					cubeItems.length === 1 && cubeItems[0].toCursor();
				}

				if (me.itemoncursor) {
					for (let i = 0; i < 3; i += 1) {
						clickItem(sdk.clicktypes.click.Left, bodyLoc);
						delay(me.ping * 2 + 500);

						if (cubeItems[0].bodylocation === bodyLoc) {
							print(cubeItems[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim() + " successfully repaired and equipped.");
							D2Bot.printToConsole(cubeItems[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim() + " successfully repaired and equipped.", sdk.colors.D2Bot.Green);

							return true;
						}
					}
				}

				delay(200);
			}

			Misc.errorReport("Failed to put repaired item back on.");
			D2Bot.stop();
		}

		return false;
	},

	repair: function (force = false) {
		if (this.cubeRepair()) return true;

		let npc;
		let repairAction = this.needRepair();
		force && repairAction.indexOf("repair") === -1 && repairAction.push("repair");

		if (!repairAction || !repairAction.length) return true;

		for (let i = 0; i < repairAction.length; i += 1) {
			switch (repairAction[i]) {
			case "repair":
				me.act === 3 && this.goToTown(Pather.accessToAct(4) ? 4 : 2);
				npc = this.initNPC("Repair", "repair");
				if (!npc) return false;
				me.repair();

				break;
			case "buyQuiver":
				let bowCheck = Attack.usingBow();

				if (bowCheck) {
					let quiver = bowCheck === "bow" ? "aqv" : "cqv";
					let myQuiver = me.getItem(quiver, sdk.items.mode.Equipped);
					!!myQuiver && myQuiver.drop();
					
					npc = this.initNPC("Repair", "repair");
					if (!npc) return false;

					quiver = npc.getItem(quiver);
					!!quiver && quiver.buy();
				}

				break;
			}
		}

		return true;
	},

	needRepair: function () {
		let quiver, repairAction = [];
		let canAfford = me.gold >= me.getRepairCost();

		// Arrow/Bolt check
		let bowCheck = Attack.usingBow();

		if (bowCheck) {
			switch (bowCheck) {
			case "bow":
				quiver = me.getItem("aqv", sdk.items.mode.Equipped); // Equipped arrow quiver

				break;
			case "crossbow":
				quiver = me.getItem("cqv", sdk.items.mode.Equipped); // Equipped bolt quiver

				break;
			}

			if (!quiver) { // Out of arrows/bolts
				repairAction.push("buyQuiver");
			} else {
				let quantity = quiver.getStat(sdk.stats.Quantity);

				if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
					repairAction.push("buyQuiver");
				}
			}
		}

		// Repair durability/quantity/charges
		if (canAfford) {
			if (this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
				repairAction.push("repair");
			}
		} else {
			console.warn("Can't afford repairs.");
		}

		return repairAction;
	},

	getItemsForRepair: function (repairPercent, chargedItems) {
		let itemList = [];
		let item = me.getItem(-1, sdk.items.mode.Equipped);

		if (item) {
			do {
				// Skip ethereal items
				if (!item.ethereal) {
					// Skip indestructible items
					if (!item.getStat(sdk.stats.Indestructible)) {
						switch (item.itemType) {
						// Quantity check
						case sdk.items.type.ThrowingKnife:
						case sdk.items.type.ThrowingAxe:
						case sdk.items.type.Javelin:
						case sdk.items.type.AmazonJavelin:
							let quantity = item.getStat(sdk.stats.Quantity);

							// Stat 254 = increased stack size
							if (typeof quantity === "number" && quantity * 100 / (getBaseStat("items", item.classid, "maxstack") + item.getStat(sdk.stats.ExtraStack)) <= repairPercent) {
								itemList.push(copyUnit(item));
							}

							break;
						// Durability check
						default:
							if (item.durabilityPercent <= repairPercent) {
								itemList.push(copyUnit(item));
							}

							break;
						}
					}

					if (chargedItems) {
						// Charged item check
						let charge = item.getStat(-2)[sdk.stats.ChargedSkill];

						if (typeof (charge) === "object") {
							if (charge instanceof Array) {
								for (let i = 0; i < charge.length; i += 1) {
									if (charge[i] !== undefined && charge[i].hasOwnProperty("charges") && charge[i].charges * 100 / charge[i].maxcharges <= repairPercent) {
										itemList.push(copyUnit(item));
									}
								}
							} else if (charge.charges * 100 / charge.maxcharges <= repairPercent) {
								itemList.push(copyUnit(item));
							}
						}
					}
				}
			} while (item.getNext());
		}

		return itemList;
	},

	reviveMerc: function () {
		if (!this.needMerc()) return true;
		let preArea = me.area;

		// avoid Aheara
		me.act === 3 && this.goToTown(Pather.accessToAct(4) ? 4 : 2);

		let npc = this.initNPC("Merc", "reviveMerc");
		if (!npc) return false;

		MainLoop:
		for (let i = 0; i < 3; i += 1) {
			let dialog = getDialogLines();

			for (let lines = 0; lines < dialog.length; lines += 1) {
				if (dialog[lines].text.match(":", "gi")) {
					dialog[lines].handler();
					delay(Math.max(750, me.ping * 2));
				}

				// "You do not have enough gold for that."
				if (dialog[lines].text.match(getLocaleString(sdk.locale.dialog.youDoNotHaveEnoughGoldForThat), "gi")) {
					return false;
				}
			}

			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!!me.getMerc()) {
					delay(Math.max(750, me.ping * 2));

					break MainLoop;
				}

				delay(200);
			}
		}

		Attack.checkInfinity();

		if (!!me.getMerc()) {
			// Cast BO on merc so he doesn't just die again. Only do this is you are a barb or actually have a cta. Otherwise its just a waste of time.
			if (Config.MercWatch && Precast.needOutOfTownCast()) {
				console.log("MercWatch precast");
				Precast.doRandomPrecast(true, preArea);
			}

			return true;
		}

		return false;
	},

	needMerc: function () {
		if (me.classic || !Config.UseMerc || me.gold < me.mercrevivecost || me.mercrevivecost === 0) return false;

		Misc.poll(() => me.gameReady, 1000, 100);
		// me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
		for (let i = 0; i < 3; i += 1) {
			let merc = me.getMerc();

			if (!!merc && !merc.dead) {
				return false;
			}

			delay(100);
		}

		// In case we never had a merc and Config.UseMerc is still set to true for some odd reason
		return true;
	},

	canStash: function (item) {
		// Some quest items that have to be in inventory or equipped
		let questClassids = [sdk.items.quest.HoradricStaff, sdk.items.quest.KhalimsWill];
		return !(this.ignoredItemTypes.includes(item.itemType) || questClassids.includes(item.classid) || !Storage.Stash.CanFit(item));
	},

	stash: function (stashGold = true) {
		if (!this.needStash()) return true;

		me.cancelUIFlags();

		let items = Storage.Inventory.Compare(Config.Inventory);

		if (items) {
			for (let i = 0; i < items.length; i += 1) {
				if (this.canStash(items[i])) {
					let result = false;
					let pickResult = Pickit.checkItem(items[i]).result;
					
					switch (true) {
					case pickResult > Pickit.Result.UNWANTED && pickResult < Pickit.Result.TRASH:
					case Cubing.keepItem(items[i]):
					case Runewords.keepItem(items[i]):
					case CraftingSystem.keepItem(items[i]):
						result = true;

						break;
					default:
						break;
					}

					if (result) {
						Storage.Stash.MoveTo(items[i]) && Misc.itemLogger("Stashed", items[i]);
					}
				}
			}
		}

		// Stash gold
		if (stashGold) {
			if (me.getStat(sdk.stats.Gold) >= Config.StashGold && me.getStat(sdk.stats.GoldBank) < 25e5 && this.openStash()) {
				gold(me.getStat(sdk.stats.Gold), 3);
				delay(1000); // allow UI to initialize
				me.cancel();
			}
		}

		return true;
	},

	needStash: function () {
		if (Config.StashGold && me.getStat(sdk.stats.Gold) >= Config.StashGold && me.getStat(sdk.stats.GoldBank) < 25e5) {
			return true;
		}

		let items = Storage.Inventory.Compare(Config.Inventory);

		for (let i = 0; i < items.length; i += 1) {
			if (Storage.Stash.CanFit(items[i])) {
				return true;
			}
		}

		return false;
	},

	openStash: function () {
		if (getUIFlag(sdk.uiflags.Cube) && !Cubing.closeCube()) return false;
		if (getUIFlag(sdk.uiflags.Stash)) return true;

		for (let i = 0; i < 5; i += 1) {
			me.cancel();

			if (this.move("stash")) {
				let stash = Game.getObject(sdk.objects.Stash);

				if (stash) {
					let pingDelay = me.getPingDelay();

					if (Skill.useTK(stash)) {
						// Fix for out of range telek
						i > 0 && stash.distance > (23 - (i * 2)) && Pather.walkTo(stash.x, stash.y, (23 - (i * 2)));
						Skill.cast(sdk.skills.Telekinesis, sdk.skills.hand.Right, stash);
					} else {
						Misc.click(0, 0, stash);
					}

					let tick = getTickCount();

					while (getTickCount() - tick < 5000) {
						if (getUIFlag(sdk.uiflags.Stash)) {
							// allow UI to initialize
							delay(100 + pingDelay * 2);

							return true;
						}

						delay(100);
					}
				}
			}

			Packet.flash(me.gid);
		}

		return false;
	},

	getCorpse: function () {
		let corpse, corpseList = [];
		let timer = getTickCount();

		// No equipped items - high chance of dying in last game, force retries
		if (!me.getItem(-1, sdk.items.mode.Equipped)) {
			corpse = Misc.poll(() => Game.getPlayer(me.name, sdk.player.mode.Dead), 2500, 500);
		} else {
			corpse = Game.getPlayer(me.name, sdk.player.mode.Dead);
		}

		if (!corpse) return true;

		do {
			if (corpse.dead && corpse.name === me.name && (getDistance(me.x, me.y, corpse.x, corpse.y) <= 20 || me.inTown)) {
				corpseList.push(copyUnit(corpse));
			}
		} while (corpse.getNext());

		while (corpseList.length > 0) {
			if (me.dead) return false;

			let gid = corpseList[0].gid;

			Pather.moveToUnit(corpseList[0]);
			Misc.click(0, 0, corpseList[0]);
			delay(500);

			if (getTickCount() - timer > 3000) {
				let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
				!!coord && Pather.moveTo(coord.x, coord.y);
			}

			if (getTickCount() - timer > 30000) {
				D2Bot.printToConsole("Failed to get corpse, stopping.", sdk.colors.D2Bot.Red);
				D2Bot.stop();
			}

			!Game.getPlayer(-1, -1, gid) && corpseList.shift();
		}

		me.classic && this.checkShard();

		return true;
	},

	checkShard: function () {
		let shard;
		let check = {left: false, right: false};
		let item = me.getItem("bld", sdk.items.mode.inStorage);

		if (item) {
			do {
				if (item.isInInventory && item.unique) {
					shard = copyUnit(item);

					break;
				}
			} while (item.getNext());
		}

		if (!shard) return true;

		item = me.getItem(-1, sdk.items.mode.Equipped);

		if (item) {
			do {
				item.bodylocation === sdk.body.RightArm && (check.right = true);
				item.bodylocation === sdk.body.LeftArm && (check.left = true);
			} while (item.getNext());
		}

		if (!check.right) {
			shard.toCursor();

			while (me.itemoncursor) {
				clickItem(sdk.clicktypes.click.Left, sdk.body.RightArm);
				delay(500);
			}
		} else if (!check.left) {
			shard.toCursor();

			while (me.itemoncursor) {
				clickItem(sdk.clicktypes.click.Left, sdk.body.LeftArm);
				delay(500);
			}
		}

		return true;
	},

	clearBelt: function () {
		let item = me.getItem(-1, sdk.items.mode.inBelt);
		let clearList = [];

		if (item) {
			do {
				switch (item.itemType) {
				case sdk.items.type.HealingPotion:
					if (Config.BeltColumn[item.x % 4] !== "hp") {
						clearList.push(copyUnit(item));
					}

					break;
				case sdk.items.type.ManaPotion:
					if (Config.BeltColumn[item.x % 4] !== "mp") {
						clearList.push(copyUnit(item));
					}

					break;
				case sdk.items.type.RejuvPotion:
					if (Config.BeltColumn[item.x % 4] !== "rv") {
						clearList.push(copyUnit(item));
					}

					break;
				case sdk.items.type.StaminaPotion:
				case sdk.items.type.AntidotePotion:
				case sdk.items.type.ThawingPotion:
					clearList.push(copyUnit(item));
				}
			} while (item.getNext());

			while (clearList.length > 0) {
				clearList.shift().interact();
				delay(200);
			}
		}

		return true;
	},

	clearScrolls: function () {
		let scrolls = me.getItemsEx().filter((scroll) => scroll.isInInventory && scroll.itemType === sdk.items.type.Scroll);
		let tpTome = scrolls.some(function (scroll) {
			return scroll.classid === sdk.items.ScrollofTownPortal;
		}) ? me.findItem(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory) : false;
		let idTome = scrolls.some(function (scroll) {
			return scroll.classid === sdk.items.ScrollofIdentify;
		}) ? me.findItem(sdk.items.TomeofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory) : false;
		let currQuantity;

		for (let i = 0; !!scrolls && i < scrolls.length; i++) {
			switch (scrolls[i].classid) {
			case sdk.items.ScrollofTownPortal:
				if (tpTome && tpTome.getStat(sdk.stats.Quantity) < 20) {
					currQuantity = tpTome.getStat(sdk.stats.Quantity);
					if (scrolls[i].toCursor()) {
						clickItemAndWait(sdk.clicktypes.click.Left, tpTome.x, tpTome.y, tpTome.location);

						if (tpTome.getStat(sdk.stats.Quantity) > currQuantity) {
							console.info(null, "Placed scroll in tp tome");

							continue;
						}
					}
				}

				break;
			case sdk.items.ScrollofIdentify:
				if (idTome && idTome.getStat(sdk.stats.Quantity) < 20) {
					currQuantity = idTome.getStat(sdk.stats.Quantity);
					if (scrolls[i].toCursor()) {
						clickItemAndWait(sdk.clicktypes.click.Left, idTome.x, idTome.y, idTome.location);

						if (idTome.getStat(sdk.stats.Quantity) > currQuantity) {
							console.info(null, "Placed scroll in id tome");

							continue;
						}
					}
				}

				if (Config.FieldID.Enabled && !idTome) {
					// don't toss scrolls if we need them for field id but don't have a tome yet - low level chars
					continue;
				}

				break;
			}

			// Might as well sell the item if already in shop
			if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
				console.info(null, "Sell " + scrolls[i].name);
				Misc.itemLogger("Sold", scrolls[i]);
				scrolls[i].sell();
			} else {
				Misc.itemLogger("Dropped", scrolls[i], "clearScrolls");
				scrolls[i].drop();
			}
		}

		return true;
	},

	clearInventory: function () {
		console.info(true);
		console.time("clearInventory");
		this.checkQuestItems(); // only golden bird quest for now

		// If we are at an npc already, open the window otherwise moving potions around fails
		if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
			try {
				!!getInteractedNPC() && Misc.useMenu(sdk.menu.Trade);
			} catch (e) {
				console.error(e);
				me.cancelUIFlags();
			}
		}
		
		// Remove potions in the wrong slot of our belt
		this.clearBelt();

		// Return potions from inventory to belt
		let beltSize = Storage.BeltSize();
		// belt 4x4 locations
		/**
		 * 12 13 14 15
		 * 8  9  10 11
		 * 4  5  6  7
		 * 0  1  2  3
		 */
		let beltMax = (beltSize * 4);
		let beltCapRef = [(0 + beltMax), (1 + beltMax), (2 + beltMax), (3 + beltMax)];
		let potsInInventory = me.getItemsEx()
			.filter((p) => p.isInInventory && [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion].includes(p.itemType))
			.sort((a, b) => a.itemType - b.itemType);

		Config.DebugMode && potsInInventory.length > 0 && console.debug("clearInventory: start pots clean-up");
		// Start interating over all the pots we have in our inventory
		potsInInventory.forEach(function (p) {
			let moved = false;
			// get free space in each slot of our belt
			let freeSpace = Town.checkColumns(beltSize);
			for (let i = 0; i < 4 && !moved; i++) {
				// checking that current potion matches what we want in our belt
				if (freeSpace[i] > 0 && p.code && p.code.startsWith(Config.BeltColumn[i])) {
					// Pick up the potion and put it in belt if the column is empty, and we don't have any other columns empty
					// prevents shift-clicking potion into wrong column
					if (freeSpace[i] === beltSize || freeSpace.some((spot) => spot === beltSize)) {
						let x = freeSpace[i] === beltSize ? i : (beltCapRef[i] - (freeSpace[i] * 4));
						Packet.placeInBelt(p, x);
					} else {
						clickItemAndWait(sdk.clicktypes.click.ShiftLeft, p.x, p.y, p.location);
					}
					Misc.poll(() => !me.itemoncursor, 300, 30);
					moved = Town.checkColumns(beltSize)[i] === freeSpace[i] - 1;
				}
				Cubing.cursorCheck();
			}
		});

		// Cleanup remaining potions
		Config.DebugMode && console.debug("clearInventory: start clean-up remaining pots");
		let sellOrDrop = [];
		potsInInventory = me.getItemsEx()
			.filter((p) => p.isInInventory && [
				sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion,
				sdk.items.type.ThawingPotion, sdk.items.type.AntidotePotion, sdk.items.type.StaminaPotion
			].includes(p.itemType));

		if (potsInInventory.length > 0) {
			let hp = [], mp = [], rv = [], specials = [];
			potsInInventory.forEach(function (p) {
				if (!p || p === undefined) return false;

				switch (p.itemType) {
				case sdk.items.type.HealingPotion:
					return (hp.push(copyUnit(p)));
				case sdk.items.type.ManaPotion:
					return (mp.push(copyUnit(p)));
				case sdk.items.type.RejuvPotion:
					return (rv.push(copyUnit(p)));
				case sdk.items.type.ThawingPotion:
				case sdk.items.type.AntidotePotion:
				case sdk.items.type.StaminaPotion:
					return (specials.push(copyUnit(p)));
				}

				return false;
			});

			// Cleanup healing potions
			while (hp.length > Config.HPBuffer) {
				sellOrDrop.push(hp.shift());
			}

			// Cleanup mana potions
			while (mp.length > Config.MPBuffer) {
				sellOrDrop.push(mp.shift());
			}

			// Cleanup rejuv potions
			while (rv.length > Config.RejuvBuffer) {
				sellOrDrop.push(rv.shift());
			}

			// Clean up special pots
			while (specials.length) {
				specials.shift().interact();
				delay(200);
			}
		}

		// Any leftover items from a failed ID (crashed game, disconnect etc.)
		Config.DebugMode && console.debug("clearInventory: start invo clean-up");
		let ignoreTypes = [
			sdk.items.type.Book, sdk.items.type.Key, sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion
		];
		let items = (Storage.Inventory.Compare(Config.Inventory) || [])
			.filter(function (item) {
				if (!item) return false;
				// Don't drop tomes, keys or potions or quest-items
				// Don't throw cubing/runeword/crafting ingredients
				if (ignoreTypes.indexOf(item.itemType) === -1 && item.sellable && !Cubing.keepItem(item) && !Runewords.keepItem(item) && !CraftingSystem.keepItem(item)) {
					return true;
				}
				return false;
			});

		// add leftovers from potion cleanup
		items = (items.length > 0 ? items.concat(sellOrDrop) : sellOrDrop.slice(0));

		if (items.length > 0) {
			let sell = [], drop = [];
			// lets see if we have any items to sell
			items.forEach(function (item) {
				let result = Pickit.checkItem(item).result;
				switch (result) {
				case Pickit.Result.UNWANTED:
					return drop.push(item);
				case Pickit.Result.TRASH:
					return sell.push(item);
				}
				return false;
			});
			// we have items to sell, might as well sell the dropable items as well
			if (sell.length) {
				Config.DebugMode && console.debug("PreSellLen: " + sell.length + " PreDropLen: " + drop.length);
				drop.filter(function (item) {
					// add to sellable array
					if (item.sellable && sell.push(item)) return false;
					return true;
				});
				Config.DebugMode && console.debug("AfterSellLen: " + sell.length + " AfterDropLen: " + drop.length);
				// should there be multiple attempts to interact with npc or if we fail should we move everything from the sell list to the drop list?
				Town.initNPC("Shop", "clearInventory");
				// now lets sell them items
				sell.forEach(function (item) {
					let sold = false; // so we know to delay or not
					try {
						console.info(null, "Sell :: " + item.name);
						Misc.itemLogger("Sold", item);
						item.sell() && (sold = true);
					} catch (e) {
						console.error(e);
					}
					sold && delay(250); // would a rand delay be better?
				});
				// now lets see if we need to drop anything, so lets exit the shop
				me.cancelUIFlags();
			}

			if (drop.length) {
				drop.forEach(function (item) {
					let drop = false; // so we know to delay or not
					try {
						console.info(null, "Drop :: " + item.name);
						Misc.itemLogger("Dropped", item, "clearInventory");
						item.drop() && (drop = true);
					} catch (e) {
						console.error(e);
					}
					drop && delay(50);
				});
			}
		}

		console.info(false, null, "clearInventory");

		return true;
	},

	act: [{}, {}, {}, {}, {}],

	initialize: function () {
		//print("Initialize town " + me.act);

		switch (me.act) {
		case 1:
			let wp = Game.getPresetObject(sdk.areas.RogueEncampment, sdk.objects.A1Waypoint);
			let fireUnit = Game.getPresetObject(sdk.areas.RogueEncampment, sdk.objects.A1TownFire);
			if (!fireUnit) return false;

			let fire = [fireUnit.roomx * 5 + fireUnit.x, fireUnit.roomy * 5 + fireUnit.y];

			this.act[0].spot = {};
			this.act[0].spot.stash = [fire[0] - 7, fire[1] - 12];
			this.act[0].spot[NPC.Warriv] = [fire[0] - 5, fire[1] - 2];
			this.act[0].spot[NPC.Cain] = [fire[0] + 6, fire[1] - 5];
			this.act[0].spot[NPC.Kashya] = [fire[0] + 14, fire[1] - 4];
			this.act[0].spot[NPC.Akara] = [fire[0] + 56, fire[1] - 30];
			this.act[0].spot[NPC.Charsi] = [fire[0] - 39, fire[1] - 25];
			this.act[0].spot[NPC.Gheed] = [fire[0] - 34, fire[1] + 36];
			this.act[0].spot.portalspot = [fire[0] + 10, fire[1] + 18];
			this.act[0].spot.waypoint = [wp.roomx * 5 + wp.x, wp.roomy * 5 + wp.y];
			this.act[0].initialized = true;

			break;
		case 2:
			this.act[1].spot = {};
			this.act[1].spot[NPC.Fara] = [5124, 5082];
			this.act[1].spot[NPC.Cain] = [5124, 5082];
			this.act[1].spot[NPC.Lysander] = [5118, 5104];
			this.act[1].spot[NPC.Greiz] = [5033, 5053];
			this.act[1].spot[NPC.Elzix] = [5032, 5102];
			this.act[1].spot.palace = [5088, 5153];
			this.act[1].spot.sewers = [5221, 5181];
			this.act[1].spot[NPC.Meshif] = [5205, 5058];
			this.act[1].spot[NPC.Drognan] = [5097, 5035];
			this.act[1].spot[NPC.Atma] = [5137, 5060];
			this.act[1].spot[NPC.Warriv] = [5152, 5201];
			this.act[1].spot.portalspot = [5168, 5060];
			this.act[1].spot.stash = [5124, 5076];
			this.act[1].spot.waypoint = [5070, 5083];
			this.act[1].initialized = true;

			break;
		case 3:
			this.act[2].spot = {};
			this.act[2].spot[NPC.Meshif] = [5118, 5168];
			this.act[2].spot[NPC.Hratli] = [5223, 5048, 5127, 5172];
			this.act[2].spot[NPC.Ormus] = [5129, 5093];
			this.act[2].spot[NPC.Asheara] = [5043, 5093];
			this.act[2].spot[NPC.Alkor] = [5083, 5016];
			this.act[2].spot[NPC.Cain] = [5148, 5066];
			this.act[2].spot.stash = [5144, 5059];
			this.act[2].spot.portalspot = [5150, 5063];
			this.act[2].spot.waypoint = [5158, 5050];
			this.act[2].initialized = true;

			break;
		case 4:
			this.act[3].spot = {};
			this.act[3].spot[NPC.Cain] = [5027, 5027];
			this.act[3].spot[NPC.Halbu] = [5089, 5031];
			this.act[3].spot[NPC.Tyrael] = [5027, 5027];
			this.act[3].spot[NPC.Jamella] = [5088, 5054];
			this.act[3].spot.stash = [5022, 5040];
			this.act[3].spot.portalspot = [5045, 5042];
			this.act[3].spot.waypoint = [5043, 5018];
			this.act[3].initialized = true;

			break;
		case 5:
			this.act[4].spot = {};
			this.act[4].spot.portalspot = [5098, 5019];
			this.act[4].spot.stash = [5129, 5061];
			this.act[4].spot[NPC.Larzuk] = [5141, 5045];
			this.act[4].spot[NPC.Malah] = [5078, 5029];
			this.act[4].spot[NPC.Cain] = [5119, 5061];
			this.act[4].spot[NPC.Qual_Kehk] = [5066, 5083];
			this.act[4].spot[NPC.Anya] = [5112, 5120];
			this.act[4].spot.portal = [5118, 5120];
			this.act[4].spot.waypoint = [5113, 5068];
			this.act[4].spot[NPC.Nihlathak] = [5071, 5111];
			this.act[4].initialized = true;

			break;
		}

		return true;
	},

	getDistance: function (spot = "") {
		!me.inTown && this.goToTown();
		!this.act[me.act - 1].initialized && this.initialize();

		// Act 5 wp->portalspot override - ActMap.cpp crash
		if (me.act === 5 && spot === "portalspot" && getDistance(me.x, me.y, 5113, 5068) <= 8) {
			return [5098, 5018].distance;
		}

		if (typeof (this.act[me.act - 1].spot[spot]) === "object") {
			return this.act[me.act - 1].spot[spot].distance;
		} else {
			return Infinity;
		}
	},

	move: function (spot = "", allowTK = true) {
		!me.inTown && this.goToTown();
		!this.act[me.act - 1].initialized && this.initialize();

		// act 5 static paths, ActMap.cpp seems to have issues with A5
		// should other towns have static paths?
		if (me.act === 5) {
			let path = [];
			let returnWhenDone = false;
			
			// Act 5 wp->portalspot override - ActMap.cpp crash
			if (spot === "portalspot" && getDistance(me.x, me.y, 5113, 5068) <= 8) {
				path = [5113, 5068, 5108, 5051, 5106, 5046, 5104, 5041, 5102, 5027, 5098, 5018];
				returnWhenDone = true;
			}

			if (["stash", "waypoint"].includes(spot)) {
				// malah -> stash/wp
				if (getDistance(me.x, me.y, 5081, 5031) <= 10) {
					path = [5089, 5029, 5093, 5021, 5101, 5027, 5107, 5043, 5108, 5052];
				} else if (getDistance(me.x, me.y, 5099, 5020) <= 13) {
					// portalspot -> stash/wp
					path = [5102, 5031, 5107, 5042, 5108, 5052];
				}
			}

			if (path.length) {
				for (let i = 0; i < path.length; i += 2) {
					Pather.walkTo(path[i], path[i + 1]);
				}

				if (returnWhenDone) return true;
			}
		}

		for (let i = 0; i < 3; i += 1) {
			i === 2 && (allowTK = false);
			if (this.moveToSpot(spot, allowTK)) {
				return true;
			}

			Packet.flash(me.gid);
		}

		return false;
	},

	moveToSpot: function (spot = "", allowTK = true) {
		let townSpot;
		let longRange = (!Skill.haveTK && spot === "waypoint");
		let tkRange = (Skill.haveTK && allowTK && ["stash", "portalspot", "waypoint"].includes(spot));

		if (!this.act[me.act - 1].hasOwnProperty("spot") || !this.act[me.act - 1].spot.hasOwnProperty(spot)) {
			return false;
		}

		if (typeof (this.act[me.act - 1].spot[spot]) === "object") {
			townSpot = this.act[me.act - 1].spot[spot];
		} else {
			return false;
		}

		if (longRange) {
			let path = getPath(me.area, townSpot[0], townSpot[1], me.x, me.y, 1, 8);

			if (path && path[1]) {
				townSpot = [path[1].x, path[1].y];
			}
		}

		for (let i = 0; i < townSpot.length; i += 2) {
			//console.debug("moveToSpot: " + spot + " from " + me.x + ", " + me.y);

			if (tkRange) {
				Pather.moveNear(townSpot[0], townSpot[1], 19);
			} else if (getDistance(me, townSpot[i], townSpot[i + 1]) > 2) {
				Pather.moveTo(townSpot[i], townSpot[i + 1], 3, false, true);
			}

			switch (spot) {
			case "stash":
				if (!!Game.getObject(sdk.objects.Stash)) {
					return true;
				}

				break;
			case "palace":
				if (!!Game.getNPC(NPC.Jerhyn)) {
					return true;
				}

				break;
			case "portalspot":
			case "sewers":
				if (tkRange && spot === "portalspot" && getDistance(me, townSpot[0], townSpot[1]) < 21) {
					return true;
				}

				if (getDistance(me, townSpot[i], townSpot[i + 1]) < 10) {
					return true;
				}

				break;
			case "waypoint":
				let wp = Game.getObject("waypoint");
				if (!!wp) {
					!Skill.haveTK && wp.distance > 5 && Pather.moveToUnit(wp);
					return true;
				}

				break;
			default:
				if (!!Game.getNPC(spot)) {
					return true;
				}

				break;
			}
		}

		return false;
	},

	goToTown: function (act = 0, wpmenu = false) {
		if (!me.inTown) {
			try {
				if (!Pather.makePortal(true)) {
					console.warn("Town.goToTown: Failed to make TP");
				}
				if (!me.inTown && !Pather.usePortal(null, me.name)) {
					console.warn("Town.goToTown: Failed to take TP");
					if (!me.inTown && !Pather.usePortal(sdk.areas.townOf(me.area))) throw new Error("Town.goToTown: Failed to take TP");
				}
			} catch (e) {
				let tpTool = Town.getTpTool();
				if (!tpTool && Misc.getPlayerCount() <= 1) {
					Misc.errorReport(new Error("Town.goToTown: Failed to go to town and no tps available. Restart."));
					scriptBroadcast("quit");
				} else {
					if (!Misc.poll(() => {
						if (me.inTown) return true;
						let p = Game.getObject("portal");
						console.debug(p);
						!!p && Misc.click(0, 0, p) && delay(100);
						Misc.poll(() => me.idle, 1000, 100);
						console.debug("inTown? " + me.inTown);
						return me.inTown;
					}, 700, 100)) {
						Misc.errorReport(new Error("Town.goToTown: Failed to go to town. Quiting."));
						scriptBroadcast("quit");
					}
				}
			}
		}

		if (!act) return true;
		if (act < 1 || act > 5) throw new Error("Town.goToTown: Invalid act");
		if (act > me.highestAct) return false;

		if (act !== me.act) {
			try {
				Pather.useWaypoint(sdk.areas.townOfAct(act), wpmenu);
			} catch (WPError) {
				throw new Error("Town.goToTown: Failed use WP");
			}
		}

		return true;
	},

	visitTown: function (repair = false) {
		console.info(true);

		if (me.inTown) {
			this.doChores();
			this.move("stash");

			return true;
		}

		if (!this.canTpToTown()) return false;

		let preArea = me.area;
		let preAct = me.act;

		// not an essential function -> handle thrown errors
		try {
			this.goToTown();
		} catch (e) {
			return false;
		}

		this.doChores(repair);

		me.act !== preAct && this.goToTown(preAct);
		this.move("portalspot");

		if (!Pather.usePortal(null, me.name)) {
			try {
				Pather.usePortal(preArea, me.name);
			} catch (e) {
				throw new Error("Town.visitTown: Failed to go back from town");
			}
		}

		Config.PublicMode && Pather.makePortal();
		console.info(false, "CurrentArea: " + Pather.getAreaName(me.area));

		return true;
	}
};
