/**
*  @filename    Town.js
*  @author      kolton, theBGuy
*  @desc        do town chores like buying, selling and gambling
*
*/

const NPC = {
	Akara: getLocaleString(2892).toLowerCase(),
	Gheed: getLocaleString(2891).toLowerCase(),
	Charsi: getLocaleString(2894).toLowerCase(),
	Kashya: getLocaleString(2893).toLowerCase(),
	Warriv: getLocaleString(2895).toLowerCase(),

	Fara: getLocaleString(3025).toLowerCase(),
	Drognan: getLocaleString(3023).toLowerCase(),
	Elzix: getLocaleString(3030).toLowerCase(),
	Greiz: getLocaleString(3031).toLowerCase(),
	Lysander: getLocaleString(3026).toLowerCase(),
	Jerhyn: getLocaleString(3027).toLowerCase(),
	Meshif: getLocaleString(3032).toLowerCase(),
	Atma: getLocaleString(3024).toLowerCase(),

	Ormus: getLocaleString(1011).toLowerCase(),
	Alkor: getLocaleString(1010).toLowerCase(),
	Hratli: getLocaleString(1009).toLowerCase(),
	Asheara: getLocaleString(1008).toLowerCase(),

	Jamella: getLocaleString(1016).toLowerCase(),
	Halbu: getLocaleString(1017).toLowerCase(),
	Tyrael: getLocaleString(1013).toLowerCase(),

	Malah: getLocaleString(22478).toLowerCase(),
	Anya: getLocaleString(22477).toLowerCase(),
	Larzuk: getLocaleString(22476).toLowerCase(),
	Qual_Kehk: getLocaleString(22480).toLowerCase(),
	Nihlathak: getLocaleString(22483).toLowerCase(),

	Cain: getLocaleString(2890).toLowerCase()
};

const Town = {
	telekinesis: true,
	sellTimer: getTickCount(), // shop speedup test

	tasks: [
		{Heal: NPC.Akara, Shop: NPC.Akara, Gamble: NPC.Gheed, Repair: NPC.Charsi, Merc: NPC.Kashya, Key: NPC.Akara, CainID: NPC.Cain},
		{Heal: NPC.Fara, Shop: NPC.Drognan, Gamble: NPC.Elzix, Repair: NPC.Fara, Merc: NPC.Greiz, Key: NPC.Lysander, CainID: NPC.Cain},
		{Heal: NPC.Ormus, Shop: NPC.Ormus, Gamble: NPC.Alkor, Repair: NPC.Hratli, Merc: NPC.Asheara, Key: NPC.Hratli, CainID: NPC.Cain},
		{Heal: NPC.Jamella, Shop: NPC.Jamella, Gamble: NPC.Jamella, Repair: NPC.Halbu, Merc: NPC.Tyrael, Key: NPC.Jamella, CainID: NPC.Cain},
		{Heal: NPC.Malah, Shop: NPC.Malah, Gamble: NPC.Anya, Repair: NPC.Larzuk, Merc: NPC.Qual_Kehk, Key: NPC.Malah, CainID: NPC.Cain}
	],

	ignoredItemTypes: [
		// Items that won't be stashed
		sdk.itemtype.BowQuiver, sdk.itemtype.CrossbowQuiver, sdk.itemtype.Book,
		sdk.itemtype.Scroll, sdk.itemtype.Key, sdk.itemtype.HealingPotion,
		sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion, sdk.itemtype.StaminaPotion,
		sdk.itemtype.AntidotePotion, sdk.itemtype.ThawingPotion
	],

	// Do town chores
	doChores: function (repair = false) {
		delay(250);

		console.log("ÿc8Start ÿc0:: ÿc8TownChores");
		let tick = getTickCount();

		!me.inTown && this.goToTown();

		if (!Misc.poll(() => me.gameReady && me.inTown, 2000, 250)) {
			throw new Error("Failed to go to town for chores");
		}

		let preAct = me.act;

		// Burst of speed while in town
		if (me.inTown && Precast.precastables.BurstofSpeed && !me.getState(sdk.states.BurstofSpeed)) {
			Skill.cast(sdk.skills.BurstofSpeed, 0);
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

		delay(200 + me.ping * 2);

		console.log("ÿc8Finish TownChores ÿc0- ÿc7Duration: ÿc0" + formatTime(getTickCount() - tick));

		return true;
	},

	npcInteract: function (name, cancel = true) {
		!name.includes("_") && (name = name.capitalize(true));
		name.includes("_") && (name = "Qual_Kehk");

		!me.inTown && Town.goToTown();
		me.cancelUIFlags();

		switch (NPC[name]) {
		case NPC.Jerhyn:
			Town.move('palace');
			break;
		case NPC.Hratli:
			if (!me.getQuest(sdk_1.default.quests.SpokeToHratli, 0)) {
				Town.move(NPC.Meshif);
				break;
			}
			// eslint-disable-next-line no-fallthrough
		default:
			Town.move(NPC[name]);
		}

		let npc = getUnit(1, NPC[name]);

		// In case Jerhyn is by Warriv
		if (name === "Jerhyn" && !npc) {
			me.cancel();
			Pather.moveTo(5166, 5206);
			npc = getUnit(1, NPC[name]);
		}

		Packet.flash(me.gid);
		delay(1 + me.ping * 2);

		if (npc && npc.openMenu()) {
			cancel && me.cancel();

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
		let items = me.getItemsEx().filter((item) => item.isInInventory && [sdk.items.ScrollofTownPortal, sdk.items.TomeofTownPortal].includes(item.classid));
		let scroll = items.find((i) => i.isInInventory && i.classid === sdk.items.ScrollofTownPortal);
		if (scroll) return scroll;
		let tome = items.find((i) => i.isInInventory && i.classid === sdk.items.TomeofTownPortal);
		if (tome && tome.getStat(sdk.stats.Quantity) > 0) return tome;
		return null;
	},

	canTpToTown: function () {
		// If we are not dead or in town, no TP tome or scrolls, shouldn't tp from arreatsummit and can't tp from UberTristram
		return !(me.dead || me.inTown || !this.getTpTool() || [sdk.areas.ArreatSummit, sdk.areas.UberTristram].includes(me.area));
	},

	// Start a task and return the NPC Unit
	initNPC: function (task, reason) {
		print("initNPC: " + reason);

		let npc = getInteractedNPC();

		try {
			if (!!npc && npc.name.toLowerCase() !== this.tasks[me.act - 1][task]) {
				me.cancelUIFlags();
				npc = null;
			}

			// Jamella gamble fix
			if (task === "Gamble" && !!npc && npc.name.toLowerCase() === NPC.Jamella) {
				me.cancelUIFlags();
				npc = null;
			}

			if (!npc) {
				npc = getUnit(1, this.tasks[me.act - 1][task]);

				if (!npc) {
					this.move(this.tasks[me.act - 1][task]);
					npc = getUnit(1, this.tasks[me.act - 1][task]);
				}
			}

			if (!npc || npc.area !== me.area || (!getUIFlag(0x08) && !npc.openMenu())) throw new Error("Couldn't interact with npc");

			switch (task) {
			case "Shop":
			case "Repair":
			case "Gamble":
				if (!getUIFlag(0x0C) && !npc.startTrade(task)) throw new Error("Failed to complete " + reason + " at " + npc.name);

				break;
			case "Key":
				if (!getUIFlag(0x0C) && !npc.startTrade(me.act === 3 ? "Repair" : "Shop")) throw new Error("Failed to complete " + reason + " at " + npc.name);

				break;
			case "CainID":
				Misc.useMenu(0x0FB4);
				me.cancelUIFlags();

				break;
			case "Heal":
				me.getState(sdk.states.Frozen) && this.buyPots(2, "Thawing", true, true);

				break;
			}

			console.log("Did " + reason + " at " + npc.name);
		} catch (e) {
			console.errorReport(e);

			return false;
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

		let needPots = false;
		let needBuffer = true;
		let buffer = {
			hp: 0,
			mp: 0
		};

		this.clearBelt();
		let beltSize = Storage.BeltSize();
		let col = this.checkColumns(beltSize);

		// HP/MP Buffer
		if (Config.HPBuffer > 0 || Config.MPBuffer > 0) {
			me.getItemsEx().filter(function (p) {
				return p.isInInventory && [sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion].includes(p.itemType);
			}).forEach(function (p) {
				switch (p.itemType) {
				case sdk.itemtype.HealingPotion:
					buffer.hp++;

					break;
				case sdk.itemtype.ManaPotion:
					buffer.mp++;

					break;
				}
			});
		}

		// Check if we need to buy potions based on Config.MinColumn
		for (let i = 0; i < 4; i += 1) {
			if (["hp", "mp"].includes(Config.BeltColumn[i]) && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize))) {
				needPots = true;
			}
		}

		// Check if we need any potions for buffers
		if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
			for (let i = 0; i < 4; i += 1) {
				// We can't buy potions because they would go into belt instead
				if (col[i] >= beltSize && (!needPots || Config.BeltColumn[i] === "rv")) {
					needBuffer = false;

					break;
				}
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
		let pot = me.getItem(-1, 2); // Mode 2 = in belt

		// No potions
		if (!pot) return col;

		do {
			col[pot.x % 4] -= 1;
		} while (pot.getNext());

		return col;
	},

	// Get the highest potion from current npc
	getPotion: function (npc, type) {
		if (!type) return false;

		if (type === "hp" || type === "mp") {
			for (let i = 5; i > 0; i -= 1) {
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

		if (classid === sdk.items.TomeofTownPortal && !me.findItem(sdk.items.TomeofTownPortal, 0, 3)) {
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
		let tome = me.findItem(id, 0, 3);

		if (!tome) {
			switch (id) {
			case sdk.items.TomeofIdentify:
			case "ibk":
				return 20; // Ignore missing ID tome
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
		
		let i;
		let list = (Storage.Inventory.Compare(Config.Inventory) || []);

		if (list.length === 0) return false;

		// Avoid unnecessary NPC visits
		for (i = 0; i < list.length; i += 1) {
			// Only unid items or sellable junk (low level) should trigger a NPC visit
			if ((!list[i].identified || Config.LowGold > 0)
				&& ([-1, 4].includes(Pickit.checkItem(list[i]).result) || (!list[i].identified && Item.hasTier(list[i])))) {
				break;
			}
		}

		if (i === list.length) return false;

		let npc = this.initNPC("Shop", "identify");
		if (!npc) return false;

		let tome = me.findItem(sdk.items.TomeofIdentify, 0, 3);
		!!tome && tome.getStat(sdk.stats.Quantity) < list.length && this.fillTome(sdk.items.TomeofIdentify);

		MainLoop:
		while (list.length > 0) {
			let item = list.shift();

			if (!item.identified && item.location === sdk.storage.Inventory && !this.ignoredItemTypes.includes(item.itemType)) {
				let result = Pickit.checkItem(item);

				// Force ID for unid items matching autoEquip criteria
				result.result === 1 && !item.identified && Item.hasTier(item) && (result.result = -1);

				switch (result.result) {
				// Items for gold, will sell magics, etc. w/o id, but at low levels
				// magics are often not worth iding.
				case Pickit.result.TRASH:
					Misc.itemLogger("Sold", item);
					item.sell();

					break;
				case Pickit.result.UNID:
					if (tome) {
						this.identifyItem(item, tome);
					} else {
						let scroll = npc.getItem(sdk.items.ScrollofIdentify);

						if (scroll) {
							if (!Storage.Inventory.CanFit(scroll)) {
								let tpTome = me.findItem(sdk.items.TomeofTownPortal, 0, 3);

								if (tpTome) {
									tpTome.sell();
									delay(500);
								}
							}

							delay(500);

							Storage.Inventory.CanFit(scroll) && scroll.buy();
						}

						scroll = me.findItem(sdk.items.ScrollofIdentify, 0, 3);

						if (!scroll) {
							break MainLoop;
						}

						this.identifyItem(item, scroll);
					}

					result = Pickit.checkItem(item);

					// should autoequip even be checked by default?
					//!Item.autoEquipCheck(item) && (result.result = 0);

					switch (result.result) {
					case Pickit.result.WANTED:
						// Couldn't id autoEquip item. Don't log it.
						// if (result.result === 1 && Config.AutoEquip && !item.indentifed && Item.autoEquipCheck(item)) {
						// 	break;
						// }

						Misc.itemLogger("Kept", item);
						Misc.logItem("Kept", item, result.line);

						break;
					case Pickit.result.UNID:
					case Pickit.result.RUNEWORD: // (doesn't trigger normally)
						break;
					case Pickit.result.CUBING:
						Misc.itemLogger("Kept", item, "Cubing-Town");
						Cubing.update();

						break;
					case Pickit.result.CRAFTING:
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
		if (!Config.CainID.Enable) return false;

		// Check if we're already in a shop. It would be pointless to go to Cain if so.
		let npc = getInteractedNPC();
		if (npc && npc.name.toLowerCase() === this.tasks[me.act - 1].Shop) return false;

		// Check if we may use Cain - minimum gold
		if (me.gold < Config.CainID.MinGold) return false;

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
				case Pickit.result.UNWANTED:
					Misc.itemLogger("Dropped", unids[i], "cainID");
					unids[i].drop();

					break;
				case Pickit.result.WANTED:
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

		let tome = me.findItem(sdk.items.TomeofIdentify, 0, 3);
		if (!tome || tome.getStat(sdk.stats.Quantity) < list.length) return false;

		while (list.length > 0) {
			let item = list.shift();
			let result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			//result.result === 1 && !item.getFlag(0x10) && Item.hasTier(item) && (result.result = -1);

			// unid item that should be identified
			if (result.result === Pickit.result.UNID) {
				this.identifyItem(item, tome, Config.FieldID.PacketID);
				delay(me.ping + 1);
				result = Pickit.checkItem(item);

				//!Item.autoEquipCheck(item) && (result.result = 0);

				switch (result.result) {
				case Pickit.result.UNWANTED:
					Misc.itemLogger("Dropped", item, "fieldID");

					if (Config.DroppedItemsAnnounce.Enable && Config.DroppedItemsAnnounce.Quality.includes(item.quality)) {
						say("Dropped: [" + Pickit.itemQualityToName(item.quality).charAt(0).toUpperCase() + Pickit.itemQualityToName(item.quality).slice(1) + "] " + item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim());

						if (Config.DroppedItemsAnnounce.LogToOOG && Config.DroppedItemsAnnounce.OOGQuality.includes(item.quality)) {
							Misc.logItem("Field Dropped", item, result.line);
						}
					}

					item.drop();

					break;
				case Pickit.result.WANTED:
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
		let item = me.getItem(-1, 0);

		if (!item) return false;

		do {
			if (item.location === 3 && !item.identified) {
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
			clickItem(1, tome);

			let tick = getTickCount();

			while (getTickCount() - tick < 500) {
				if (getCursorType() === 6) {
					break CursorLoop;
				}

				delay(10);
			}
		}

		if (getCursorType() !== 6) return false;

		delay(270);

		for (let i = 0; i < 3; i += 1) {
			if (getCursorType() === 6) {
				clickItem(0, unit);
			}

			let tick = getTickCount();

			while (getTickCount() - tick < 500) {
				if (unit.getFlag(0x10)) {
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

			if (result.result === Pickit.result.WANTED/*  && Item.autoEquipCheck(items[i]) */) {
				try {
					if (Storage.Inventory.CanFit(items[i]) && me.getStat(14) + me.getStat(15) >= items[i].getItemCost(0)) {
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
		let items = me.findItems(-1, 0, 3);

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
						case Pickit.result.WANTED:
							Misc.itemLogger("Gambled", newItem);
							Misc.logItem("Gambled", newItem, result.line);
							list.push(newItem.gid);

							break;
						case Pickit.result.CUBING:
							list.push(newItem.gid);
							Cubing.update();

							break;
						case Pickit.result.CRAFTING:
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
		let items = me.findItems(-1, 0, 3);

		for (let i = 0; i < items.length; i += 1) {
			if (list.indexOf(items[i].gid) === -1) {
				for (let j = 0; j < 3; j += 1) {
					if (items[i].getFlag(0x10)) {
						break;
					}

					delay(100);
				}

				return items[i];
			}
		}

		return false;
	},

	buyPots: function (quantity = 0, type = undefined, drink = false, force = false) {
		if (!quantity || !type) return false;
		
		// convert to classid if isn't one
		typeof type === "string" && (type = (sdk.items[type.capitalize(true) + "Potion"] || false));
		if (!type) return false;

		let potDealer = ["Akara", "Lysander", "Alkor", "Jamella", "Malah"][me.act - 1];

		switch (type) {
		case sdk.items.ThawingPotion:
			// Don't buy if already at max res
			if (!force && me.coldRes >= 75) return true;
			console.log("ÿc9BuyPotsÿc0 :: Current cold resistance: " + me.coldRes);

			break;
		case sdk.items.AntidotePotion:
			// Don't buy if already at max res
			if (!force && me.poisonRes >= 75) return true;
			console.log("ÿc9BuyPotsÿc0 :: Current poison resistance: " + me.poisonRes);

			break;
		case sdk.items.StaminaPotion:
			// Don't buy if teleport or vigor
			if (!force && (Config.Vigor && me.getSkill(sdk.skills.Vigor, 0) || Pather.canTeleport())) return true;

			break;
		}

		let npc = getInteractedNPC();

		try {
			if (!!npc && npc.name.toLowerCase() === NPC[potDealer] && !getUIFlag(sdk.uiflags.Shop)) {
				if (!npc.startTrade("Shop")) throw new Error("Failed to open " + npc.name + " trade menu");
			} else {
				me.cancelUIFlags();
				npc = null;

				Town.move(NPC[potDealer]);
				npc = getUnit(sdk.unittype.NPC, NPC[potDealer]);

				if (!npc || !npc.openMenu() || !npc.startTrade("Shop")) throw new Error("Failed to open " + npc.name + " trade menu");
			}
		} catch (e) {
			console.errorReport(e);

			return false;
		}

		let pot = npc.getItem(type);
		let name = (pot.name || "");

		console.log('ÿc9BuyPotsÿc0 :: buying ' + quantity + ' ' + name + ' Potions');

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

			chugs.forEach(function (pot) {
				if (!!pot && pot.use()) {
					quantity++;
					delay(100 + me.ping);
				}
			});

			log && name && console.log('ÿc9DrinkPotsÿc0 :: drank ' + quantity + " " + name + "s. Timer [" + formatTime(quantity * 30 * 1000) + "]");
		} else {
			console.log("ÿc9DrinkPotsÿc0 :: couldn't find my pots");
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
			console.errorReport(e);

			return false;
		}

		return true;
	},

	checkKeys: function () {
		if (!Config.OpenChests.Enabled || me.assassin || me.gold < 540 || (!me.getItem("key") && !Storage.Inventory.CanFit({sizex: 1, sizey: 1}))) {
			return 12;
		}

		let count = 0;
		let key = me.findItems(543, 0, 3);

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
				case sdk.itemtype.Shield:
				case sdk.itemtype.Armor:
				case sdk.itemtype.Boots:
				case sdk.itemtype.Gloves:
				case sdk.itemtype.Belt:
				case sdk.itemtype.VoodooHeads:
				case sdk.itemtype.AuricShields:
				case sdk.itemtype.PrimalHelm:
				case sdk.itemtype.Pelt:
				case sdk.itemtype.Circlet:
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
		if (item.mode !== 1) return false;

		let rune, cubeItems;
		let bodyLoc = item.bodylocation;

		switch (item.itemType) {
		case sdk.itemtype.Shield:
		case sdk.itemtype.Armor:
		case sdk.itemtype.Boots:
		case sdk.itemtype.Gloves:
		case sdk.itemtype.Belt:
		case sdk.itemtype.VoodooHeads:
		case sdk.itemtype.AuricShields:
		case sdk.itemtype.PrimalHelm:
		case sdk.itemtype.Pelt:
		case sdk.itemtype.Circlet:
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

					cubeItems = me.findItems(-1, -1, 6); // Get cube contents

					// We expect only one item in cube
					cubeItems.length === 1 && cubeItems[0].toCursor();
				}

				if (me.itemoncursor) {
					for (let i = 0; i < 3; i += 1) {
						clickItem(0, bodyLoc);
						delay(me.ping * 2 + 500);

						if (cubeItems[0].bodylocation === bodyLoc) {
							print(cubeItems[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim() + " successfully repaired and equipped.");
							D2Bot.printToConsole(cubeItems[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim() + " successfully repaired and equipped.", 5);

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
					let myQuiver = me.getItem(quiver, 1);
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
				quiver = me.getItem("aqv", 1); // Equipped arrow quiver

				break;
			case "crossbow":
				quiver = me.getItem("cqv", 1); // Equipped bolt quiver

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
			print("ÿc4Town: ÿc1Can't afford repairs.");
		}

		return repairAction;
	},

	getItemsForRepair: function (repairPercent, chargedItems) {
		let itemList = [];
		let item = me.getItem(-1, 1);

		if (item) {
			do {
				// Skip ethereal items
				if (!item.getFlag(0x400000)) {
					// Skip indestructible items
					if (!item.getStat(sdk.stats.Indestructible)) {
						switch (item.itemType) {
						// Quantity check
						case sdk.itemtype.ThrowingKnife:
						case sdk.itemtype.ThrowingAxe:
						case sdk.itemtype.Javelin:
						case sdk.itemtype.AmazonJavelin:
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
				if (dialog[lines].text.match(getLocaleString(3362), "gi")) {
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
		if (me.classic || !Config.UseMerc || me.gold < me.mercrevivecost || !me.mercrevivecost) return false;

		Misc.poll(() => me.gameReady, 1000, 100);
		// me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
		for (let i = 0; i < 3; i += 1) {
			let merc = me.getMerc();

			if (!!merc && merc.mode !== 0 && merc.mode !== 12) {
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
					case pickResult > 0 && pickResult < 4:
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
			if (me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5 && this.openStash()) {
				gold(me.getStat(14), 3);
				delay(1000); // allow UI to initialize
				me.cancel();
			}
		}

		return true;
	},

	needStash: function () {
		if (Config.StashGold && me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5) {
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
				let stash = getUnit(2, 267);

				if (stash) {
					if (Skill.useTK(stash)) {
						// Fix for out of range telek
						i > 0 && stash.distance > (23 - (i * 2)) && Pather.walkTo(stash.x, stash.y, (23 - (i * 2)));
						Skill.cast(sdk.skills.Telekinesis, 0, stash);
					} else {
						Misc.click(0, 0, stash);
					}

					let tick = getTickCount();

					while (getTickCount() - tick < 5000) {
						if (getUIFlag(sdk.uiflags.Stash)) {
							// allow UI to initialize
							delay(100 + me.ping * 2);

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
		if (!me.getItem(-1, 1)) {
			corpse = Misc.poll(() => getUnit(0, me.name, 17), 2500, 500);
		} else {
			corpse = getUnit(0, me.name, 17);
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
				D2Bot.printToConsole("Failed to get corpse, stopping.", 9);
				D2Bot.stop();
			}

			!getUnit(0, -1, -1, gid) && corpseList.shift();
		}

		me.classic && this.checkShard();

		return true;
	},

	checkShard: function () {
		let shard;
		let check = {left: false, right: false};
		let item = me.getItem("bld", 0);

		if (item) {
			do {
				if (item.location === 3 && item.unique) {
					shard = copyUnit(item);

					break;
				}
			} while (item.getNext());
		}

		if (!shard) return true;

		item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.bodylocation === 4) {
					check.right = true;
				}

				if (item.bodylocation === 5) {
					check.left = true;
				}
			} while (item.getNext());
		}

		if (!check.right) {
			shard.toCursor();

			while (me.itemoncursor) {
				clickItem(0, 4);
				delay(500);
			}
		} else if (!check.left) {
			shard.toCursor();

			while (me.itemoncursor) {
				clickItem(0, 5);
				delay(500);
			}
		}

		return true;
	},

	clearBelt: function () {
		let item = me.getItem(-1, 2);
		let clearList = [];

		if (item) {
			do {
				switch (item.itemType) {
				case sdk.itemtype.HealingPotion:
					if (Config.BeltColumn[item.x % 4] !== "hp") {
						clearList.push(copyUnit(item));
					}

					break;
				case sdk.itemtype.ManaPotion:
					if (Config.BeltColumn[item.x % 4] !== "mp") {
						clearList.push(copyUnit(item));
					}

					break;
				case sdk.itemtype.RejuvPotion:
					if (Config.BeltColumn[item.x % 4] !== "rv") {
						clearList.push(copyUnit(item));
					}

					break;
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
		let scrolls = me.getItemsEx().filter((scroll) => scroll.isInInventory && scroll.itemType === sdk.itemtype.Scroll);
		let tpTome = scrolls.some(function (scroll) {
			return scroll.classid === sdk.items.ScrollofTownPortal;
		}) ? me.findItem(sdk.items.TomeofTownPortal, sdk.itemmode.inStorage, sdk.storage.Inventory) : false;
		let idTome = scrolls.some(function (scroll) {
			return scroll.classid === sdk.items.ScrollofIdentify;
		}) ? me.findItem(sdk.items.TomeofIdentify, sdk.itemmode.inStorage, sdk.storage.Inventory) : false;
		let currQuantity;

		for (let i = 0; !!scrolls && i < scrolls.length; i++) {
			switch (scrolls[i].classid) {
			case sdk.items.ScrollofTownPortal:
				if (tpTome && tpTome.getStat(sdk.stats.Quantity) < 20) {
					currQuantity = tpTome.getStat(sdk.stats.Quantity);
					if (scrolls[i].toCursor()) {
						clickItemAndWait(0, tpTome.x, tpTome.y, tpTome.location);

						if (tpTome.getStat(sdk.stats.Quantity) > currQuantity) {
							console.log('ÿc9clearScrollsÿc0 :: placed scroll in tp tome');

							continue;
						}
					}
				}

				break;
			case sdk.items.ScrollofIdentify:
				if (idTome && idTome.getStat(sdk.stats.Quantity) < 20) {
					currQuantity = idTome.getStat(sdk.stats.Quantity);
					if (scrolls[i].toCursor()) {
						clickItemAndWait(0, idTome.x, idTome.y, idTome.location);

						if (idTome.getStat(sdk.stats.Quantity) > currQuantity) {
							console.log('ÿc9clearScrollsÿc0 :: placed scroll in id tome');

							continue;
						}
					}
				}

				break;
			}

			// Might as well sell the item if already in shop
			if (getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
				console.log("clearInventory sell " + scrolls[i].name);
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
		console.log("ÿc8Start ÿc0:: ÿc8clearInventory");
		let clearInvoTick = getTickCount();
		this.checkQuestItems(); // only golden bird quest for now

		// If we are at an npc already, open the window otherwise moving potions around fails
		if (getUIFlag(sdk.uiflags.NPCMenu) && !getUIFlag(sdk.uiflags.Shop)) {
			try {
				!!getInteractedNPC() && Misc.useMenu(sdk.menu.Trade);
			} catch (e) {
				console.errorReport(e);
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
			.filter((p) => p.isInInventory && [sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion].includes(p.itemType))
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
						p.toCursor(true) && new PacketBuilder().byte(0x23).dword(p.gid).dword(x).send();
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
				sdk.itemtype.HealingPotion, sdk.itemtype.ManaPotion, sdk.itemtype.RejuvPotion,
				sdk.itemtype.ThawingPotion, sdk.itemtype.AntidotePotion, sdk.itemtype.StaminaPotion
			].includes(p.itemType));

		if (potsInInventory.length > 0) {
			let hp = [], mp = [], rv = [], specials = [];
			potsInInventory.forEach(function (p) {
				if (!p || p === undefined) return false;

				switch (p.itemType) {
				case sdk.itemtype.HealingPotion:
					return (hp.push(copyUnit(p)));
				case sdk.itemtype.ManaPotion:
					return (mp.push(copyUnit(p)));
				case sdk.itemtype.RejuvPotion:
					return (rv.push(copyUnit(p)));
				case sdk.itemtype.ThawingPotion:
				case sdk.itemtype.AntidotePotion:
				case sdk.itemtype.StaminaPotion:
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
		let items = (Storage.Inventory.Compare(Config.Inventory) || []);
		items.length > 0 && (items = items.filter(function (item) {
			return (!!item
					&& ([18, 41, 76, 77, 78].indexOf(item.itemType) === -1 // Don't drop tomes, keys or potions
					&& item.sellable // Don't try to sell/drop quest-items
					&& !Cubing.keepItem(item) // Don't throw cubing ingredients
					&& !Runewords.keepItem(item) // Don't throw runeword ingredients
					&& !CraftingSystem.keepItem(item) // Don't throw crafting system ingredients
					));
		}));

		items = (items.length > 0 ? items.concat(sellOrDrop) : sellOrDrop.slice(0));
		items.length > 0 && items.forEach(function (item) {
			if (!item || item === undefined) return;
			let result = Pickit.checkItem(item).result;
			let sold = false;
			
			switch (result) {
			case Pickit.result.UNWANTED:
				// Quest items and such, just a double check
				if (!item.sellable) return;

				try {
					// Might as well sell the item if already in shop
					if (getUIFlag(sdk.uiflags.Shop) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) {
						console.log("clearInventory sell " + item.name);
						Misc.itemLogger("Sold", item);
						item.sell() && (sold = true);
					} else {
						Misc.itemLogger("Dropped", item, "clearInventory");
						item.drop();
					}
				} catch (e) {
					console.errorReport(e);
				}

				break;
			case Pickit.result.TRASH:
				try {
					console.log("LowGold sell " + item.name);
					Town.initNPC("Shop", "clearInventory");
					Misc.itemLogger("Sold", item);
					item.sell() && (sold = true);
				} catch (e) {
					console.errorReport(e);
				}

				break;
			}

			!!sold && delay(250 + me.ping);
		});

		console.log("ÿc8Exit clearInventory ÿc0- ÿc7Duration: ÿc0" + formatTime(getTickCount() - clearInvoTick));

		return true;
	},

	act: [{}, {}, {}, {}, {}],

	initialize: function () {
		//print("Initialize town " + me.act);

		switch (me.act) {
		case 1:
			let wp = getPresetUnit(1, 2, 119);
			let fireUnit = getPresetUnit(1, 2, 39);

			if (!fireUnit) {
				return false;
			}

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

	getDistance: function (spot) {
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

	move: function (spot) {
		!me.inTown && this.goToTown();
		!this.act[me.act - 1].initialized && this.initialize();

		// Act 5 wp->portalspot override - ActMap.cpp crash
		if (me.act === 5 && spot === "portalspot" && getDistance(me.x, me.y, 5113, 5068) <= 8) {
			let path = [5113, 5068, 5108, 5051, 5106, 5046, 5104, 5041, 5102, 5027, 5098, 5018];

			for (let i = 0; i < path.length; i += 2) {
				Pather.walkTo(path[i], path[i + 1]);
			}

			return true;
		}

		for (let i = 0; i < 3; i += 1) {
			if (this.moveToSpot(spot)) {
				return true;
			}

			Packet.flash(me.gid);
		}

		return false;
	},

	moveToSpot: function (spot) {
		let townSpot;
		let longRange = (!Skill.haveTK && spot === "waypoint");
		let tkRange = (Skill.haveTK && ["stash", "portalspot", "waypoint"].includes(spot));

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
				if (!!getUnit(2, 267)) {
					return true;
				}

				break;
			case "palace":
				if (!!getUnit(1, NPC.Jerhyn)) {
					return true;
				}

				break;
			case "portalspot":
			case "sewers":
				if (getDistance(me, townSpot[i], townSpot[i + 1]) < 10) {
					return true;
				}

				break;
			case "waypoint":
				if (!!getUnit(2, "waypoint")) {
					!Skill.haveTK && getUnit(2, "waypoint").distance > 5 && Pather.moveToUnit(getUnit(2, "waypoint"));
					return true;
				}

				break;
			default:
				if (!!getUnit(1, spot)) {
					return true;
				}

				break;
			}
		}

		return false;
	},

	goToTown: function (act, wpmenu) {
		if (!me.inTown) {
			if (!me.inTown) {
				try {
					if (!Pather.makePortal(true)) console.errorReport("Town.goToTown: Failed to make TP");
					if (!me.inTown && !Pather.usePortal(null, me.name)) console.errorReport("Town.goToTown: Failed to take TP");
					if (!me.inTown && !Pather.usePortal(sdk.areas.townOf(me.area))) throw new Error("Town.goToTown: Failed to take TP");
				} catch (e) {
					let tpTool = this.getTpTool();
					if (!tpTool && Misc.getPlayerCount() <= 1) {
						Misc.errorReport(new Error("Town.goToTown: Failed to go to town and no tps available. Restart."));
						scriptBroadcast("quit");
					} else {
						let p = getUnit(2, "portal");
						console.debug(p);
						!!p && Misc.click(0, 0, p) && delay(100);
						console.log("inTown? " + me.inTown);
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
		console.log("ÿc8Start ÿc0:: ÿc8visitTown");
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
		console.log("ÿc8End ÿc0:: ÿc8visitTown - currentArea: " + Pather.getAreaName(me.area));

		return true;
	}
};
