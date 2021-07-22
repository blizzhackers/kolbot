/*
*	@filename	TownOverrides.js
*	@author		isid0re
*	@desc		Town.js fixes and custom tasks to improve functionality
*/

if (!isIncluded("common/Town.js")) {
	include("common/Town.js");
}

//Removed Missle Potions for easy gold
Town.ignoredItemTypes = [ // Items that won't be stashed
	5, // Arrows
	6, // Bolts
	18, // Book (Tome)
	22, // Scroll
	41, // Key
	76, // Healing Potion
	77, // Mana Potion
	78, // Rejuvenation Potion
	79, // Stamina Potion
	80, // Antidote Potion
	81 // Thawing Potion
];

Town.townTasks = function () {
	if (!me.inTown) {
		Town.goToTown();
	}

	let preAct = me.act, i, cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];
	Attack.weaponSwitch(Attack.getPrimarySlot());
	this.unfinishedQuests();
	Runewords.makeRunewords();
	Cubing.doCubing();
	Runewords.makeRunewords();
	this.equipSWAP();
	this.heal();
	this.identify();
	this.clearInventory();
	this.buyBook();
	this.buyPotions();
	this.fillTome(518);
	this.shopItems();
	this.buyKeys();
	this.repair(true);
	this.shopItems();
	this.reviveMerc();
	this.gamble();
	Item.autoEquip();
	Item.autoEquipCharm();
	Merc.hireMerc();
	Merc.equipMerc();
	this.stash();
	this.clearJunk();
	this.sortInventory();
	this.sortStash();
	Quest.characterRespec();

	for (i = 0; i < cancelFlags.length; i += 1) {
		if (getUIFlag(cancelFlags[i])) {
			delay(500);
			me.cancel();

			break;
		}
	}

	me.cancel();

	if (me.area === 40 || me.area === 75) {
		Town.buyPots(8, "Stamina");
		Town.drinkPots();
	}

	if (me.act !== preAct) {
		this.goToTown(preAct);
	}

	if (!me.barbarian && !Precast.checkCTA()) {	//If not a barb and no CTA, do precast. This is good since townchicken calls doChores. If the char has a cta this is ignored since revive merc does precast
		Precast.doPrecast(false);
	}

	Config.NoTele = me.normal && me.gold < 10000 ? true : !me.normal && me.gold < 50000 ? true : false;
	Config.Dodge = (me.getSkill(54, 0) || me.getStat(97, 54)) ? !Config.NoTele : Config.Dodge;

	return true;
};

Town.doChores = function (repair = false) {
	if (!me.inTown) {
		this.goToTown();
	}

	let preAct = me.act, i, cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];
	Attack.weaponSwitch(Attack.getPrimarySlot());
	Runewords.makeRunewords();
	Cubing.doCubing();
	Runewords.makeRunewords();
	this.equipSWAP();
	this.heal();
	this.identify();
	this.clearInventory();
	this.buyBook();
	this.buyPotions();
	this.fillTome(518);
	this.shopItems();
	this.buyKeys();
	this.repair(repair);
	this.shopItems();
	this.reviveMerc();
	this.gamble();
	Item.autoEquip();
	Item.autoEquipCharm();
	Merc.hireMerc();
	Merc.equipMerc();
	this.stash();
	this.clearJunk();

	if (me.getItem(518)) {
		this.clearScrolls();
	}

	this.sortInventory();
	Quest.characterRespec();

	for (i = 0; i < cancelFlags.length; i += 1) {
		if (getUIFlag(cancelFlags[i])) {
			delay(500);
			me.cancel();

			break;
		}
	}

	me.cancel();

	if (me.act !== preAct) {
		this.goToTown(preAct);
	}

	if (me.barbarian && !Precast.checkCTA()) {	//If not a barb and no CTA, do precast. This is good since townchicken calls doChores. If the char has a cta this is ignored since revive merc does precast
		Precast.doPrecast(false);
	}

	Config.NoTele = me.normal && me.gold < 10000 ? true : !me.normal && me.gold < 50000 ? true : false;
	Config.Dodge = me.getSkill(54, 0) && me.sorceress ? !Config.NoTele : false;

	return true;
};

Town.identify = function () {
	var i, item, tome, scroll, npc, list, timer, tpTome, result,
		tpTomePos = {};

	this.cainID();

	list = Storage.Inventory.Compare(Config.Inventory);

	if (!list) {
		return false;
	}

	// Avoid unnecessary NPC visits
	for (i = 0; i < list.length; i += 1) {
		// Only unid items or sellable junk (low level) should trigger a NPC visit
		if ((!list[i].getFlag(0x10) || Config.LowGold > 0) && ([-1, 4].indexOf(Pickit.checkItem(list[i]).result) > -1 || (!list[i].getFlag(0x10) && (Item.hasTier(list[i]) || Item.hasCharmTier(list[i]) || Item.hasMercTier(list[i]))))) {
			break;
		}
	}

	if (i === list.length) {
		return false;
	}

	npc = this.initNPC("Shop", "identify");

	if (!npc) {
		return false;
	}

	tome = me.findItem(519, 0, 3);

	if (tome && tome.getStat(70) < list.length) {
		this.fillTome(519);
	}

	MainLoop:
	while (list.length > 0) {
		item = list.shift();

		if (!item.getFlag(0x10) && item.location === 3 && this.ignoredItemTypes.indexOf(item.itemType) === -1) {
			result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			if (result.result === 1 && !item.getFlag(0x10) && (Item.hasTier(item) || Item.hasCharmTier(item) || Item.hasMercTier(item))) {
				result.result = -1;
			}

			switch (result.result) {
			// Items for gold, will sell magics, etc. w/o id, but at low levels
			// magics are often not worth iding.
			case 4:
				Misc.itemLogger("Sold", item);
				item.sell();

				break;
			case -1:
				if (tome) {
					this.identifyItem(item, tome);
				} else {
					scroll = npc.getItem(530);

					if (scroll) {
						if (!Storage.Inventory.CanFit(scroll)) {
							tpTome = me.findItem(518, 0, 3);

							if (tpTome) {
								tpTomePos = {x: tpTome.x, y: tpTome.y};

								tpTome.sell();
								delay(500);
							}
						}

						delay(500);

						if (Storage.Inventory.CanFit(scroll)) {
							scroll.buy();
						}
					}

					scroll = me.findItem(530, 0, 3);

					if (!scroll) {
						break MainLoop;
					}

					this.identifyItem(item, scroll);
				}

				result = Pickit.checkItem(item);

				switch (result.result) {
				case 1:
					Misc.itemLogger("Kept", item);
					Misc.logItem("Kept", item, result.line);

					break;
				case -1: // unidentified
					break;
				case 2: // cubing
					Misc.itemLogger("Kept", item, "Cubing-Town");
					Cubing.update();

					break;
				case 3: // runeword (doesn't trigger normally)
					break;
				case 5: // Crafting System
					Misc.itemLogger("Kept", item, "CraftSys-Town");
					CraftingSystem.update(item);

					break;
				default:
					Misc.itemLogger("Sold", item);
					item.sell();

					timer = getTickCount() - this.sellTimer; // shop speedup test

					if (timer > 0 && timer < 500) {
						delay(timer);
					}

					break;
				}

				break;
			}
		}
	}

	this.fillTome(518); // Check for TP tome in case it got sold for ID scrolls

	return true;
};

Town.buyBook = function () {
	if (me.findItem(518, 0, 3)) {
		return true;
	}

	var tpBook, tpScroll, idBook, npc;

	switch (me.area) {
	case 1:
		Town.move(NPC.Akara);
		npc = getUnit(1, NPC.Akara);
		break;
	case 40:
		Town.move(NPC.Lysander);
		npc = getUnit(1, NPC.Lysander);
		break;
	case 75:
		Town.move(NPC.Alkor);
		npc = getUnit(1, NPC.Alkor);
		break;
	case 103:
		Town.move(NPC.Jamella);
		npc = getUnit(1, NPC.Jamella);
		break;
	case 109:
		Town.move(NPC.Malah);
		npc = getUnit(1, NPC.Malah);
		break;
	}

	if (!npc || !npc.openMenu()) {
		return false;
	}

	Misc.useMenu(0x0D44);

	delay(500);

	if (!me.findItem(518, 0, 3)) {
		tpBook = npc.getItem(518);
		tpScroll = npc.getItem(529);

		if (tpBook && me.getStat(14) + me.getStat(15) >= tpBook.getItemCost(0) && Storage.Inventory.CanFit(tpBook)) {
			try {
				if (tpBook.buy()) {
					print('ÿc9SoloLevelingÿc0: bought Tome of Town Portal');
					this.fillTome(518);
				}
			} catch (e1) {
				print(e1);

				return false;
			}
		} else {
			if (tpScroll && me.getStat(14) + me.getStat(15) >= tpScroll.getItemCost(0) && Storage.Inventory.CanFit(tpScroll)) {
				try {
					if (tpScroll.buy()) {
						print('ÿc9SoloLevelingÿc0: bought Scroll of Town Portal');
					}
				} catch (e1) {
					print(e1);

					return false;
				}
			}
		}
	}

	return true;
};

Town.buyPotions = function () {
	let TPtomes = me.getItem(518);

	if (!TPtomes) { // no town portal book
		return false;
	}

	var i, j, npc, useShift, col, beltSize, pot,
		needPots = false,
		needBuffer = true,
		buffer = {
			hp: 0,
			mp: 0
		};

	this.clearBelt(); // fix wrong pot on pickup before town in belt
	beltSize = Storage.BeltSize();
	col = this.checkColumns(beltSize);

	if (Config.HPBuffer > 0 || Config.MPBuffer > 0) {
		pot = me.getItem(-1, 0);

		if (pot) {
			do {
				if (pot.location === 3) {
					switch (pot.itemType) {
					case 76:
						buffer.hp += 1;

						break;
					case 77:
						buffer.mp += 1;

						break;
					}
				}
			} while (pot.getNext());
		}
	}

	for (i = 0; i < 4; i += 1) {
		if (["hp", "mp"].indexOf(Config.BeltColumn[i]) > -1 && col[i] > (beltSize - Math.min(Config.MinColumn[i], beltSize))) {
			needPots = true;
		}
	}

	if (buffer.mp < Config.MPBuffer || buffer.hp < Config.HPBuffer) {
		for (i = 0; i < 4; i += 1) {
			if (col[i] >= beltSize && (!needPots || Config.BeltColumn[i] === "rv")) {
				needBuffer = false;

				break;
			}
		}
	}

	if (buffer.mp >= Config.MPBuffer && buffer.hp >= Config.HPBuffer) {
		needBuffer = false;
	}

	if (!needPots && !needBuffer) {
		return true;
	}

	if (me.normal && Pather.accessToAct(2) && !Pather.accessToAct(3) && me.act < 2) {
		this.goToTown(2);
	}

	if (me.normal && Pather.accessToAct(3) && !Pather.accessToAct(4) && me.act < 3) {
		this.goToTown(3);
	}

	if (me.normal && Pather.accessToAct(4) && me.act < 4) {
		this.goToTown(4);
	}

	npc = this.initNPC("Shop", "buyPotions");

	if (!npc) {
		return false;
	}

	for (i = 0; i < 4; i += 1) {
		if (col[i] > 0) {
			useShift = this.shiftCheck(col, beltSize);
			pot = this.getPotion(npc, Config.BeltColumn[i]);

			if (pot) {
				if (useShift) {
					pot.buy(true);
				} else {
					for (j = 0; j < col[i]; j += 1) {
						pot.buy(false);
					}
				}
			}
		}

		col = this.checkColumns(beltSize);
	}

	if (needBuffer && buffer.hp < Config.HPBuffer) {
		for (i = 0; i < Config.HPBuffer - buffer.hp; i += 1) {
			pot = this.getPotion(npc, "hp");

			if (Storage.Inventory.CanFit(pot)) {
				pot.buy(false);
			}
		}
	}

	if (needBuffer && buffer.mp < Config.MPBuffer) {
		for (i = 0; i < Config.MPBuffer - buffer.mp; i += 1) {
			pot = this.getPotion(npc, "mp");

			if (Storage.Inventory.CanFit(pot)) {
				pot.buy(false);
			}
		}
	}

	return true;
};

Town.shopItems = function () {
	if (!Config.MiniShopBot) {
		return true;
	}

	var i, item, result,
		items = [],
		npc = getInteractedNPC();

	if (!npc || !npc.itemcount) {
		return false;
	}

	item = npc.getItem();

	if (!item) {
		return false;
	}

	print("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

	do {
		if (this.ignoredItemTypes.indexOf(item.itemType) === -1) {
			items.push(copyUnit(item));
		}
	} while (item.getNext());

	print("ÿc9SoloLevelingÿc0: Evaluating " + npc.itemcount + " items.");

	for (i = 0; i < items.length; i += 1) {
		result = Pickit.checkItem(items[i]);

		// no tier'ed items
		if (result.result === 1 && NTIP.CheckItem(items[i], NTIP_CheckListNoTier, true).result !== 0) {
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

		// tier'ed items
		if (result.result === 1 && (Item.autoEquipCheck(items[i]) || Item.autoEquipCheckMerc(items[i]))) {
			try {
				if (Storage.Inventory.CanFit(items[i]) && me.getStat(14) + me.getStat(15) >= items[i].getItemCost(0)) {
					if (Item.hasTier(items[i]) &&
					Item.getBodyLoc(items[i])[0] !== undefined &&
					Item.canEquip(items[i]) &&
					NTIP.GetTier(items[i]) > Item.getEquippedItem(Item.getBodyLoc(items[i])[0]).tier) {
						Misc.itemLogger("AutoEquip Shopped", items[i]);
						Misc.logItem("AutoEquip Shopped", items[i], result.line);
						items[i].buy();
					}

					if (Item.hasMercTier(items[i]) &&
					Item.getBodyLocMerc(items[i])[0] !== undefined &&
					Item.canEquipMerc(items[i], Item.getBodyLocMerc(items[i])[0]) &&
					NTIP.GetMercTier(items[i]) > Item.getEquippedItemMerc(Item.getBodyLocMerc(items[i])[0]).tier) {
						Misc.itemLogger("AutoEquipMerc Shopped", items[i]);
						Misc.logItem("AutoEquipMerc Shopped", items[i], result.line);
						items[i].buy();
					}
				}
			} catch (e) {
				print(e);
			}
		}

		delay(2);
	}

	return true;
};

Town.unfinishedQuests = function () {
	let malus = me.getItem(89), leg = me.getItem(88), book = me.getItem(552), tome = me.getItem(548), kw = me.getItem(174), hammer = me.getItem(90), soulstone = me.getItem(551);

	//Act 1
	if (malus) { //tools of the trade
		Town.goToTown(1);
		Town.npcInteract("charsi");
	}

	if (leg) { // drop wirts leg at startup to avoid selling and d/c
		Town.goToTown(1);

		if (leg.location === 7) {
			Town.move('stash');
			Storage.Inventory.MoveTo(leg);
			delay(300 + me.ping);
			me.cancel();
		}

		leg.drop();
	}

	//Act 2
	if (book) { //Radament skill book
		if (book.location === 7) {
			this.openStash();
			delay(300 + me.ping);
		}

		book.interact();
		print('ÿc9SoloLevelingÿc0: used Radament skill book');
	}

	//Act 3
	if (me.getItem(546)) { // golden bird
		print("ÿc9SoloLevelingÿc0: starting jade figurine");
		me.overhead('jade figurine');
		Town.goToTown(3);
		Town.npcInteract("meshif");
	}

	if (me.getItem(547)) { // ashes
		Town.goToTown(3);
		Town.npcInteract("alkor");
	}

	if (me.getItem(545)) { // potion of life
		let pol = me.getItem(545);

		if (pol.location === 7) {
			this.openStash();
			delay(300 + me.ping);
		}

		pol.interact();
		print('ÿc9SoloLevelingÿc0: used potion of life');
	}

	if (tome) { //LamEssen's Tome
		if (tome.location === 7) {
			Town.move('stash');
			Storage.Inventory.MoveTo(tome);
			delay(300 + me.ping);
		}

		Town.goToTown(3);
		Town.npcInteract("alkor");
		print('ÿc9SoloLevelingÿc0: LamEssen Tome completed');
	}

	if (kw) { //remove Khalim's Will if quest not completed and restarting run.
		if (Item.getEquippedItem(4).classid === 174) {
			Town.clearInventory();
			delay(500 + me.ping * 2);
			Quest.stashItem(174);
			print('ÿc9SoloLevelingÿc0: removed khalims will');
			Item.autoEquip();
		}
	}

	//Act 4
	if (hammer) { // drop hellforge hammer and soulstone at startup to avoid selling and d/c
		Town.goToTown(1);

		if (hammer.location === 7) {
			Town.move('stash');
			Storage.Inventory.MoveTo(hammer);
			delay(300 + me.ping);
			me.cancel();
		}

		hammer.drop();
	}

	if (soulstone) {
		Town.goToTown(1);

		if (soulstone.location === 7) {
			Town.move('stash');
			Storage.Inventory.MoveTo(soulstone);
			delay(300 + me.ping);
			me.cancel();
		}

		soulstone.drop();
	}

	//Act 5
	if (!Item.getEquippedItemMerc(3).prefixnum === 20568 && me.getItem(58)) { // Larzuk reward
		Quest.holePunch(58); // insight voulge
	}

	if (!Check.haveItem("sword", "runeword", "Spirit") && (me.getItem(29) || me.getItem(30))) {
		if (me.getItem(29)) { // spirit crystal sword
			Quest.holePunch(29);
		}

		if (me.getItem(30)) { // spirit broad sword
			Quest.holePunch(30);
		}
	}

	if (me.getItem(646)) {
		let sor = me.getItem(646);

		if (sor.location === 7) { // anya scroll of resistance
			this.openStash();
			delay(300 + me.ping);
		}

		sor.interact();
		print('ÿc9SoloLevelingÿc0: used scroll of resistance');
	}

	return true;
};

Town.equipSWAP = function () {
	let spirit = me.getItems()
		.filter(item =>
			item.getPrefix(20635) // The spirit shield prefix
			&& item.classid !== 29 // no broad sword
			&& item.classid !== 30 // no crystal sword
			&& item.classid !== 31 // no long sword
			&& [3, 6, 7].indexOf(item.location) > -1 // Needs to be on either of these locations
		)
		.sort((a, b) => a.location - b.location) // Sort on location, low to high. So if you have one already equiped, it comes first
		.first();

	if (spirit) {
		if (Item.getEquippedItem(12).tier < 0) {
			Town.move('stash');
			Storage.Inventory.MoveTo(spirit);
			Attack.weaponSwitch(); // switch to slot 2
			spirit.equip();
			Attack.weaponSwitch();
		}
	}

	let cta = me.getItems()
		.filter(item =>
			item.getPrefix(20519) // The call to arms prefix
			&& [1, 3, 6, 7].indexOf(item.location) > -1 // Needs to be on one these locations
		)
		.sort((a, b) => a.location - b.location) // Sort on location, low to high. So if you have one already equiped, it comes first
		.first();

	if (cta) {
		if (cta.location === 1) {
			return true;
		} else {
			Town.move('stash');
			Storage.Inventory.MoveTo(cta);
			Attack.weaponSwitch(); // switch to slot 2
			cta.equip();
			Attack.weaponSwitch();
		}
	}

	return true;
};

Town.buyPots = function (quantity, type) {
	let npc, jugs;

	if (type === "Thawing" && Check.Resistance().CR >= 75) {	// Don't buy if already at max res
		return true;
	}

	if (type === "Antidote" && Check.Resistance().PR >= 75) {	// Don't buy if already at max res
		return true;
	}

	if (type === "Stamina" && (me.paladin && me.getSkill(115, 0) || me.sorceress && me.getSkill(54, 0))) {	// Don't buy if teleport or vigor
		return true;
	}

	switch (me.area) {
	case 1:
		Town.move(NPC.Akara);
		npc = getUnit(1, NPC.Akara);
		break;
	case 40:
		Town.move(NPC.Lysander);
		npc = getUnit(1, NPC.Lysander);
		break;
	case 75:
		Town.move(NPC.Alkor);
		npc = getUnit(1, NPC.Alkor);
		break;
	case 103:
		Town.move(NPC.Jamella);
		npc = getUnit(1, NPC.Jamella);
		break;
	case 109:
		Town.move(NPC.Malah);
		npc = getUnit(1, NPC.Malah);
		break;
	}

	if (!npc || !npc.openMenu()) {
		return false;
	}

	Misc.useMenu(0x0D44);

	switch (type) {
	case "Thawing":
		jugs = npc.getItem("wms");

		break;
	case "Stamina":
		jugs = npc.getItem("vps");

		break;
	case "Antidote":
		jugs = npc.getItem("yps");

		break;
	}

	print('ÿc9SoloLevelingÿc0: buying ' + quantity + ' ' + type + ' Potions');

	for (let totalspecialpotions = 0; totalspecialpotions < quantity; totalspecialpotions++) {

		if (jugs) {
			jugs.buy(false);
		}
	}

	me.cancel();

	return true;
};

Town.drinkPots = function () {
	let classIds = ["yps", "wms", "vps", ];

	for (let totalpots = 0; totalpots < classIds.length; totalpots++) {
		let chugs = me.getItem(classIds[totalpots]);

		if (chugs) {
			do {
				delay(10 + me.ping);
				chugs.interact();
			} while (chugs.getNext());

			print('ÿc9SoloLevelingÿc0: drank Special Potions');
		}
	}

	return true;
};

Town.canStash = function (item) {
	var ignoredClassids = [91, 174]; // Some quest items that have to be in inventory or equipped

	if (!item.getFlag(0x10) || !Item.canStashCharm(item) || this.ignoredItemTypes.indexOf(item.itemType) > -1 || ignoredClassids.indexOf(item.classid) > -1) {
		return false;
	}

	if (!Storage.Stash.CanFit(item)) {
		this.sortStash(true);	//Force sort

		if (!Storage.Stash.CanFit(item)) {	//Re-check after sorting
			return false;
		}
	}

	return true;
};

Town.stash = function (stashGold) {
	if (stashGold === undefined) {
		stashGold = true;
	}

	if (!this.needStash()) {
		return true;
	}

	me.cancel();

	var i, result, items = Storage.Inventory.Compare(Config.Inventory);

	if (items) {
		for (i = 0; i < items.length; i += 1) {
			if (this.canStash(items[i])) {
				result = (Pickit.checkItem(items[i]).result > 0 && Pickit.checkItem(items[i]).result < 4) || Cubing.keepItem(items[i]) || Runewords.keepItem(items[i]) || CraftingSystem.keepItem(items[i]);

				if (result) {
					Misc.itemLogger("Stashed", items[i]);
					Storage.Stash.MoveTo(items[i]);
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
};

Town.sortInventory = function () {
	Storage.Inventory.SortItems(SetUp.sortSettings.ItemsSortedFromLeft, SetUp.sortSettings.ItemsSortedFromRight);

	return true;
};

Town.sortStash = function (force) {
	if (force === undefined) {
		force = false;
	}

	if (Storage.Stash.UsedSpacePercent() < 50 && !force) {
		return true;
	}

	Storage.Stash.SortItems();

	return true;
};

Town.clearInventory = function () {
	var i, col, result, item, beltSize,
		items = [];

	// Return potions to belt
	item = me.getItem(-1, 0);

	if (item) {
		do {
			if (item.location === 3 && [76, 77, 78].indexOf(item.itemType) > -1) {
				items.push(copyUnit(item));
			}
		} while (item.getNext());

		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);

		// Sort from HP to RV
		items.sort(function (a, b) {
			return a.itemType - b.itemType;
		});

		while (items.length) {
			item = items.shift();

			for (i = 0; i < 4; i += 1) {
				if (item.code.indexOf(Config.BeltColumn[i]) > -1 && col[i] > 0) {
					if (col[i] === beltSize) { // Pick up the potion and put it in belt if the column is empty
						if (item.toCursor()) {
							clickItem(0, i, 0, 2);
						}
					} else {
						clickItem(2, item.x, item.y, item.location); // Shift-click potion
					}

					delay(me.ping + 200);

					col = this.checkColumns(beltSize);
					break;
				}
			}
		}
	}

	// Cleanup remaining potions
	item = me.getItem(-1, 0);

	if (item) {
		items = [
			[], // array for hp
			[] // array for mp
		];

		do {
			if (item.itemType === 76) {
				items[0].push(copyUnit(item));
			}

			if (item.itemType === 77) {
				items[1].push(copyUnit(item));
			}
		} while (item.getNext());

		// Cleanup healing potions
		while (items[0].length > Config.HPBuffer) {
			items[0].shift().interact();
			delay(200 + me.ping);
		}

		// Cleanup mana potions
		while (items[1].length > Config.MPBuffer) {
			items[1].shift().interact();
			delay(200 + me.ping);
		}
	}

	// Any leftover items from a failed ID (crashed game, disconnect etc.)
	items = Storage.Inventory.Compare(Config.Inventory);

	for (i = 0; !!items && i < items.length; i += 1) {
		if ([18, 41, 76, 77, 78].indexOf(items[i].itemType) === -1 && // Don't drop tomes, keys or potions
			items[i].classid !== 88 && // wirt's leg
			items[i].classid !== 89 && // horadric malus
			items[i].classid !== 524 && // Scroll of Inifuss
			items[i].classid !== 525 && // Key to Cairn Stones
			items[i].classid !== 549 && // Horadric Cube
			items[i].classid !== 92 && // Staff of Kings
			items[i].classid !== 521 && // Viper Amulet
			items[i].classid !== 91 && // Horadric Staff
			items[i].classid !== 552 && // Book of Skill
			items[i].classid !== 545 && // Potion of Life
			items[i].classid !== 546 && // A Jade Figurine
			items[i].classid !== 547 && // The Golden Bird
			items[i].classid !== 548 && // Lam Esen's Tome
			items[i].classid !== 553 && // Khalim's Eye
			items[i].classid !== 554 && // Khalim's Heart
			items[i].classid !== 555 && // Khalim's Brain
			items[i].classid !== 173 && // Khalim's Flail
			items[i].classid !== 174 && // Khalim's Will
			items[i].classid !== 551 && // Mephisto's Soulstone
			items[i].classid !== 90 && // Hellforge Hammer
			items[i].classid !== 644 && // Malah's Potion
			items[i].classid !== 646 && // Scroll of Resistance
			(items[i].classid !== 603 && items[i].quality !== 7) && // Anni
			(items[i].classid !== 604 && items[i].quality !== 7) && // Torch
			(items[i].classid !== 605 && items[i].quality !== 7) && // Gheeds
			(items[i].code !== 529 || !!me.findItem(518, 0, 3)) && // Don't throw scrolls if no tome is found (obsolete code?)
			(items[i].code !== 530 || !!me.findItem(519, 0, 3)) && // Don't throw scrolls if no tome is found (obsolete code?)
			!Cubing.keepItem(items[i]) && // Don't throw cubing ingredients
			!Runewords.keepItem(items[i]) && // Don't throw runeword ingredients
			!CraftingSystem.keepItem(items[i]) // Don't throw crafting system ingredients
		) {
			result = Pickit.checkItem(items[i]).result;

			if (!items[i].getFlag(0x10)) {
				result = -1;
			}

			switch (result) {
			case 0: // Drop item
				if ((getUIFlag(0x0C) || getUIFlag(0x08)) && (items[i].getItemCost(1) <= 1 || items[i].itemType === 39)) { // Quest items and such
					me.cancel();
					delay(200);
				}

				this.initNPC("Shop", "clearInventory");

				if (getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0)) { // Might as well sell the item if already in shop
					print("clearInventory sell " + items[i].name);
					Misc.itemLogger("Sold", items[i]);
					items[i].sell();
				} else {
					print("clearInventory dropped " + items[i].name);
					Misc.itemLogger("Dropped", items[i], "clearInventory");
					items[i].drop();
				}

				break;
			case 4: // Sell item
				try {
					print("LowGold sell " + items[i].name);
					this.initNPC("Shop", "clearInventory");
					Misc.itemLogger("Sold", items[i]);
					items[i].sell();
				} catch (e) {
					print(e);
				}

				break;
			}
		}
	}

	return true;
};

Town.clearJunk = function () {
	let junk = me.findItems(-1, 0);

	if (!junk) {
		return false;
	}

	while (junk.length > 0) {
		if ((junk[0].location === 7 || junk[0].location === 3) // stash or inventory
			&& [-1, 1, 2, 3, 5, 6].indexOf(Pickit.checkItem(junk[0]).result) < 0 // only drop unwanted
			&& !Cubing.keepItem(junk[0]) // Don't throw cubing ingredients
			&& !Runewords.keepItem(junk[0]) // Don't throw runeword ingredients
			&& !CraftingSystem.keepItem(junk[0]) // Don't throw crafting system ingredients
		) {
			if (junk[0].drop()) {
				me.overhead('cleared junk');
				print("ÿc9SoloLevelingÿc0: Cleared junk - " + junk[0].name);
				delay(50 + me.ping);
			}
		}

		let rwBase = me.getItems()
			.filter(item =>
				item.itemType === junk[0].itemType// same item type as current
				&& !item.getFlag(NTIPAliasFlag["ethereal"]) // only noneth runeword bases
				&& item.getStat(194) === junk[0].getStat(194) // sockets match junk in review
				&& [3, 7].indexOf(item.location) > -1 // locations
			)
			.sort((a, b) => a.getStatEx(31) - b.getStatEx(31)) // Sort on defense, low to high.
			.last(); // select last

		if (junk[0].getStat(194) > 0) {
			if ((junk[0].location === 7 || junk[0].location === 3) &&
				!junk[0].getFlag(NTIPAliasFlag["ethereal"]) &&
				junk[0].itemType !== 30 && junk[0].getStatEx(31) < rwBase.getStatEx(31)) { // only drop noneth armors helms shields
				if (junk[0].drop()) {
					me.overhead('cleared runeword junk');
					print("ÿc9SoloLevelingÿc0: Cleared runeword junk - " + junk[0].name);
					delay(50 + me.ping);
				}
			}
		}

		junk.shift();
	}

	return true;
};

Town.npcInteract = function (name) {
	let npc;

	if (!me.inTown) {
		Town.goToTown();
	}

	switch (name) {
	case "akara":
		Town.move(NPC.Akara);
		npc = getUnit(1, NPC.Akara);

		break;
	case "charsi":
		Town.move(NPC.Charsi);
		npc = getUnit(1, NPC.Charsi);

		break;
	case "warriv":
		Town.move(NPC.Warriv);
		npc = getUnit(1, NPC.Warriv);

		break;
	case "meshif":
		Town.move(NPC.Meshif);
		npc = getUnit(1, NPC.Meshif);

		break;
	case "tyrael":
		Town.move(NPC.Tyrael);
		npc = getUnit(1, NPC.Tyrael);

		break;
	case "jerhyn":
		Town.move(NPC.Jerhyn);
		npc = getUnit(1, NPC.Jerhyn);

		if (!npc) {
			me.cancel();
			Pather.moveTo(5166, 5206);
		}

		break;
	case "alkor":
		Town.move(NPC.Alkor);
		npc = getUnit(1, NPC.Alkor);

		break;
	case "atma":
		Town.move(NPC.Atma);
		npc = getUnit(1, NPC.Atma);

		break;
	case "kashya":
		Town.move(NPC.Kashya);
		npc = getUnit(1, NPC.Kashya);

		break;
	case "drognan":
		Town.move(NPC.Drognan);
		npc = getUnit(1, NPC.Drognan);

		break;
	case "cain":
		Town.move(NPC.Cain);
		npc = getUnit(1, NPC.Cain);

		break;
	case "larzuk":
		Town.move(NPC.Larzuk);
		npc = getUnit(1, NPC.Larzuk);

		break;
	case "qual_kehk":
		Town.move(NPC.Qual_Kehk);
		npc = getUnit(1, NPC.Qual_Kehk);

		break;
	case "malah":
		Town.move(NPC.Malah);
		npc = getUnit(1, NPC.Malah);

		break;
	case "anya":
		Town.move(NPC.Anya);
		npc = getUnit(1, NPC.Anya);

		break;
	}

	Packet.flash(me.gid);
	delay(1 + me.ping * 2);

	if (!npc || !npc.openMenu()) {
		me.cancel();
	}

	Packet.flash(me.gid);

	return true;
};

Town.reviveMerc = function () {
	if (!this.needMerc()) {
		return true;
	}

	// avoid Aheara
	if (me.act === 3) {
		this.goToTown(2);
	}

	var i, tick, dialog, lines,
		preArea = me.area,
		npc = this.initNPC("Merc", "reviveMerc");

	if (!npc) {
		return false;
	}

	MainLoop:
	for (i = 0; i < 3; i += 1) {
		dialog = getDialogLines();

		for (lines = 0; lines < dialog.length; lines += 1) {
			if (dialog[lines].text.match(":", "gi")) {
				dialog[lines].handler();
				delay(Math.max(750, me.ping * 2));
			}

			// "You do not have enough gold for that."
			if (dialog[lines].text.match(getLocaleString(3362), "gi")) {
				return false;
			}
		}

		while (getTickCount() - tick < 2000) {
			if (!!Merc.getMercFix()) {
				delay(Math.max(750, me.ping * 2));

				break MainLoop;
			}

			delay(200);
		}
	}

	Attack.checkInfinity();

	if (!!Merc.getMercFix()) {
		if (Config.MercWatch && (me.barbarian || Precast.checkCTA())) { // Cast BO on merc so he doesn't just die again. Only Do this is you are a barb or actually have a cta. Otherwise its just a waste of time.
			print("MercWatch precast");
			Pather.useWaypoint("random");
			Precast.doPrecast(true);
			Pather.useWaypoint(preArea);
		}

		return true;
	}

	return false;
};

Town.visitTown = function (repair = false) {
	if (me.inTown) {
		this.doChores();
		this.move("stash");

		return true;
	}

	var preArea = me.area,
		preAct = me.act;

	try { // not an essential function -> handle thrown errors
		this.goToTown();
	} catch (e) {
		return false;
	}

	this.doChores(repair);

	if (me.act !== preAct) {
		this.goToTown(preAct);
	}

	this.move("portalspot");

	if (!Pather.usePortal(null, me.name)) { // this part is essential
		try {
			Pather.usePortal(preArea, me.name);
		} catch (e) {
			throw new Error("Town.visitTown: Failed to go back from town");
		}
	}

	if (Config.PublicMode) {
		Pather.makePortal();
	}

	return true;
};

Town.needRepair = function () {
	var quiver, bowCheck, quantity, inventoryQuiver,
		repairAction = [],
		canAfford = me.gold >= me.getRepairCost();

	// Arrow/Bolt check
	bowCheck = Attack.usingBow();

	if (bowCheck) {
		switch (bowCheck) {
		case "bow":
			quiver = me.getItem("aqv", 1); // Equipped arrow quiver
			inventoryQuiver = me.getItem("aqv");

			break;
		case "crossbow":
			quiver = me.getItem("cqv", 1); // Equipped bolt quiver
			inventoryQuiver = me.getItem("cqv");

			break;
		}

		if (!quiver) { // Out of arrows/bolts
			if (inventoryQuiver) {
				Item.equip(inventoryQuiver, 5);
			} else {
				repairAction.push("buyQuiver"); // equip
				repairAction.push("buyQuiver"); // inventory
			}
		} else {
			quantity = quiver.getStat(70);

			if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
				if (inventoryQuiver) {
					Item.equip(inventoryQuiver, 5);
				} else {
					repairAction.push("buyQuiver"); // equip
					repairAction.push("buyQuiver"); // inventory
				}
			}
		}
	}

	if (canAfford) { // Repair durability/quantity/charges
		if (this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
			repairAction.push("repair");
		}
	} else {
		print("ÿc4Town: ÿc1Can't afford repairs.");
	}

	return repairAction;
};
