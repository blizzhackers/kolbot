/**
*  @filename    Prototypes.js
*  @author      kolton, theBGuy
*  @credit      Jaenster
*  @desc        various 'Unit' and 'me' prototypes
*
*/

// Ensure these are in polyfill.js
!isIncluded("Polyfill.js") && include("Polyfill.js");
// Make sure we have our util functions
!isIncluded("common/Util.js") && include("common/Util.js");

let sdk = require("../modules/sdk");

(function (global, original) {
	let firstRun = true;
	global.getUnit = function (...args) {
		if (firstRun) {
			delay(1500);
			firstRun = false;
		}

		// Stupid reference thing
		// eslint-disable-next-line no-unused-vars
		const test = original(-1);

		let [first] = args, second = args.length >= 2 ? args[1] : undefined;

		const ret = original.apply(this, args);

		// deal with bug
		if (first === 1 && typeof second === "string" && ret
			&& ((me.act === 1 && ret.classid === sdk.monsters.Dummy1) || me.act === 2 && ret.classid === sdk.monsters.Dummy2)) {
			return null;
		}

		return original.apply(this, args);
	};
})([].filter.constructor("return this")(), getUnit);

// Check if unit is idle
Unit.prototype.__defineGetter__("idle", function () {
	if (this.type > sdk.unittype.Player) throw new Error("Unit.idle: Must be used with player units.");
	// Dead is pretty idle too
	return (this.mode === sdk.player.mode.StandingOutsideTown || this.mode === sdk.player.mode.StandingInTown || this.mode === sdk.player.mode.Dead);
});

Unit.prototype.__defineGetter__("gold", function () {
	return this.getStat(sdk.stats.Gold) + this.getStat(sdk.stats.GoldBank);
});

// Death check
Unit.prototype.__defineGetter__("dead", function () {
	switch (this.type) {
	case sdk.unittype.Player:
		return this.mode === sdk.player.mode.Death || this.mode === sdk.player.mode.Dead;
	case sdk.unittype.Monster:
		return this.mode === sdk.monsters.mode.Death || this.mode === sdk.monsters.mode.Dead;
	default:
		return false;
	}
});

// Check if unit is in town
Unit.prototype.__defineGetter__("inTown", function () {
	if (this.type > sdk.unittype.Player) throw new Error("Unit.inTown: Must be used with player units.");
	return sdk.areas.Towns.includes(this.area);
});

// Check if party unit is in town
Party.prototype.__defineGetter__("inTown", function () {
	return sdk.areas.Towns.includes(this.area);
});

Unit.prototype.__defineGetter__("attacking", function () {
	if (this.type > sdk.unittype.Monster) throw new Error("Unit.attacking: Must be used with Monster or Player units.");
	switch (this.type) {
	case sdk.unittype.Player:
		return [
			sdk.player.mode.Attacking1, sdk.player.mode.Attacking2, sdk.player.mode.CastingSkill, sdk.player.mode.ThrowingItem,
			sdk.player.mode.Kicking, sdk.player.mode.UsingSkill1, sdk.player.mode.UsingSkill2, sdk.player.mode.UsingSkill3,
			sdk.player.mode.UsingSkill4, sdk.player.mode.SkillActionSequence
		].includes(this.mode);
	case sdk.unittype.Monster:
		return [
			sdk.monsters.mode.Attacking1, sdk.monsters.mode.Attacking2, sdk.monsters.mode.CastingSkill,
			sdk.monsters.mode.UsingSkill1, sdk.monsters.mode.UsingSkill2, sdk.monsters.mode.UsingSkill3, sdk.monsters.mode.UsingSkill4
		].includes(this.mode);
	default:
		return false;
	}
});

Unit.prototype.__defineGetter__("durabilityPercent", function () {
	if (this.type !== sdk.unittype.Item) throw new Error("Unit.durabilityPercent: Must be used on items.");
	if (this.getStat(sdk.stats.Quantity) || !this.getStat(sdk.stats.MaxDurability)) return 100;
	return Math.round(this.getStat(sdk.stats.Durability) * 100 / this.getStat(sdk.stats.MaxDurability));
});

// Open NPC menu
Unit.prototype.openMenu = function (addDelay) {
	if (Config.PacketShopping) return Packet.openMenu(this);
	if (this.type !== sdk.unittype.NPC) throw new Error("Unit.openMenu: Must be used on NPCs.");
	if (getUIFlag(sdk.uiflags.NPCMenu)) return true;

	addDelay === undefined && (addDelay = 0);
	let pingDelay = (me.gameReady ? me.ping : 125);

	for (let i = 0; i < 5; i += 1) {
		getDistance(me, this) > 4 && Pather.moveToUnit(this);

		Misc.click(0, 0, this);
		let tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (getUIFlag(sdk.uiflags.NPCMenu)) {
				delay(Math.max(700 + pingDelay, 500 + pingDelay * 2 + addDelay * 500));

				return true;
			}

			if (getInteractedNPC() && getTickCount() - tick > 1000) {
				me.cancel();
			}

			delay(100);
		}

		sendPacket(1, sdk.packets.send.NPCInit, 4, 1, 4, this.gid);
		delay(pingDelay * 2 + 1);
		Packet.cancelNPC(this);
		delay(pingDelay * 2 + 1);
		Packet.flash(me.gid);
	}

	return false;
};

// mode = "Gamble", "Repair" or "Shop"
Unit.prototype.startTrade = function (mode) {
	if (Config.PacketShopping) return Packet.startTrade(this, mode);
	if (this.type !== sdk.unittype.NPC) throw new Error("Unit.startTrade: Must be used on NPCs.");
	console.log("Starting " + mode + " at " + this.name);
	if (getUIFlag(sdk.uiflags.Shop)) return true;

	let menuId = mode === "Gamble" ? sdk.menu.Gamble : mode === "Repair" ? sdk.menu.TradeRepair : sdk.menu.Trade;

	for (let i = 0; i < 3; i += 1) {
		// Incremental delay on retries
		if (this.openMenu(i)) {
			Misc.useMenu(menuId);

			let tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				if (getUIFlag(sdk.uiflags.Shop) && this.itemcount > 0) {
					delay(200);
					console.log("Successfully started " + mode + " at " + this.name);

					return true;
				}

				delay(25);
			}

			me.cancel();
		}
	}

	return false;
};

Unit.prototype.buy = function (shiftBuy, gamble) {
	if (Config.PacketShopping) return Packet.buyItem(this, shiftBuy, gamble);
	// Check if it's an item we want to buy
	if (this.type !== sdk.unittype.Item) throw new Error("Unit.buy: Must be used on items.");

	// Check if it's an item belonging to a NPC
	if (!getUIFlag(sdk.uiflags.Shop) || (this.getParent() && this.getParent().gid !== getInteractedNPC().gid)) {
		throw new Error("Unit.buy: Must be used in shops.");
	}

	// Can we afford the item?
	if (me.gold < this.getItemCost(sdk.items.cost.ToBuy)) return false;

	let oldGold = me.gold;
	let itemCount = me.itemcount;

	for (let i = 0; i < 3; i += 1) {
		this.shop(shiftBuy ? 6 : 2);

		let tick = getTickCount();

		while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
			if ((shiftBuy && me.gold < oldGold) || itemCount !== me.itemcount) {
				delay(500);

				return true;
			}

			delay(10);
		}
	}

	return false;
};

// Item owner name
Unit.prototype.__defineGetter__("parentName",
	function () {
		if (this.type !== sdk.unittype.Item) throw new Error("Unit.parentName: Must be used with item units.");

		let parent = this.getParent();

		return parent ? parent.name : false;
	});

// You MUST use a delay after Unit.sell() if using custom scripts. delay(500) works best, dynamic delay is used when identifying/selling (500 - item id time)
Unit.prototype.sell = function () {
	if (Config.PacketShopping) return Packet.sellItem(this);

	// Check if it's an item we want to buy
	if (this.type !== sdk.unittype.Item) throw new Error("Unit.sell: Must be used on items.");
	if (!this.sellable) {
		console.error((new Error("Item is unsellable")));
		return false;
	}

	// Check if it's an item belonging to a NPC
	if (!getUIFlag(sdk.uiflags.Shop)) throw new Error("Unit.sell: Must be used in shops.");

	let itemCount = me.itemcount;

	for (let i = 0; i < 5; i += 1) {
		this.shop(1);

		let tick = getTickCount();

		while (getTickCount() - tick < 2000) {
			if (me.itemcount !== itemCount) {
				//delay(500);

				return true;
			}

			delay(10);
		}
	}

	return false;
};

Unit.prototype.toCursor = function (usePacket = false) {
	if (this.type !== sdk.unittype.Item) throw new Error("Unit.toCursor: Must be used with items.");
	if (me.itemoncursor && this.mode === sdk.items.mode.onCursor) return true;

	this.location === sdk.storage.Stash && Town.openStash();
	this.location === sdk.storage.Cube && Cubing.openCube();

	if (usePacket) return Packet.itemToCursor(this);

	for (let i = 0; i < 3; i += 1) {
		try {
			if (this.mode === sdk.items.mode.Equipped) {
				// fix for equipped items (cubing viper staff for example)
				clickItem(sdk.clicktypes.click.Left, this.bodylocation);
			} else {
				clickItem(sdk.clicktypes.click.Left, this);
			}
		} catch (e) {
			return false;
		}

		let tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (me.itemoncursor) {
				delay(200);

				return true;
			}

			delay(10);
		}
	}

	return false;
};

Unit.prototype.drop = function () {
	if (this.type !== sdk.unittype.Item) throw new Error("Unit.drop: Must be used with items. Unit Name: " + this.name);
	if (!this.toCursor()) return false;

	let tick = getTickCount();
	let timeout = Math.max(1000, me.ping * 6);

	while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash) || !me.gameReady) {
		if (getTickCount() - tick > timeout) return false;

		if (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
			me.cancel(0);
		}

		delay(me.ping * 2 + 100);
	}

	for (let i = 0; i < 3; i += 1) {
		clickMap(0, 0, me.x, me.y);
		delay(40);
		clickMap(2, 0, me.x, me.y);

		tick = getTickCount();

		while (getTickCount() - tick < 500) {
			if (!me.itemoncursor) {
				delay(200);

				return true;
			}

			delay(10);
		}
	}

	return false;
};

me.walk = () => me.runwalk = 0;
me.run = () => me.runwalk = 1;

// calling me.ping can cause issues, use this instead to assign a value
// might need work to be more accurate but works for now
me.getPingDelay = function () {
	// single-player
	if (!me.gameserverip) return 25;
	let pingDelay = me.gameReady ? me.ping : 250;
	pingDelay < 10 && (pingDelay = 50);
	return pingDelay;
};

/**
 * @description use consumable item, fixes issue with interact() returning false even if we used an item
 * @returns boolean
 */
Unit.prototype.use = function () {
	if (this === undefined || !this.type) return false;
	if (this.type !== sdk.unittype.Item) throw new Error("Unit.use: Must be used with items. Unit Name: " + this.name);
	if (!getBaseStat("items", this.classid, "useable")) throw new Error("Unit.use: Must be used with consumable items. Unit Name: " + this.name);
	
	let gid = this.gid;
	let pingDelay = me.getPingDelay();
	let quantity = 0;
	let iType = this.itemType;
	let checkQuantity = false;

	switch (this.location) {
	case sdk.storage.Stash:
	case sdk.storage.Inventory:
		if (this.isInStash && !Town.openStash()) return false;
		// doesn't work, not sure why but it's missing something 
		//new PacketBuilder().byte(sdk.packets.send.UseItem).dword(gid).dword(this.x).dword(this.y).send();
		checkQuantity = iType === sdk.items.type.Book;
		checkQuantity && (quantity = this.getStat(sdk.stats.Quantity));
		this.interact(); // use interact instead, was hoping to skip this since its really just doing the same thing over but oh well

		break;
	case sdk.storage.Belt:
		new PacketBuilder().byte(sdk.packets.send.UseBeltItem).dword(gid).dword(0).dword(0).send();

		break;
	default:
		return false;
	}

	if (checkQuantity) {
		return Misc.poll(() => this.getStat(sdk.stats.Quantity) < quantity, 200 + pingDelay, 50);
	} else {
		return Misc.poll(() => !Game.getItem(-1, -1, gid), 200 + pingDelay, 50);
	}
};

me.findItem = function (id = -1, mode = -1, loc = -1, quality = -1) {
	let item = me.getItem(id, mode);

	if (item) {
		do {
			if ((loc === -1 || item.location === loc) && (quality === -1 || item.quality === quality)) {
				return item;
			}
		} while (item.getNext());
	}

	return false;
};

me.findItems = function (id = -1, mode = -1, loc = false) {
	let list = [];
	let item = me.getItem(id, mode);

	if (item) {
		do {
			if (loc) {
				if (item.location === loc) {
					list.push(copyUnit(item));
				}
			} else {
				list.push(copyUnit(item));
			}
		} while (item.getNext());
	}

	return list;
};

me.cancelUIFlags = function () {
	while (!me.gameReady) {
		delay(25);
	}

	const flags = [
		sdk.uiflags.Inventory, sdk.uiflags.StatsWindow, sdk.uiflags.SkillWindow, sdk.uiflags.NPCMenu,
		sdk.uiflags.Waypoint, sdk.uiflags.Party, sdk.uiflags.Shop, sdk.uiflags.Quest, sdk.uiflags.Stash,
		sdk.uiflags.Cube, sdk.uiflags.KeytotheCairnStonesScreen, sdk.uiflags.SubmitItem
	];

	for (let i = 0; i < flags.length; i++) {
		if (getUIFlag(flags[i]) && me.cancel()) {
			delay(250);
			i = 0; // Reset
		}
	}
};

me.switchWeapons = function (slot) {
	if (this.gametype === sdk.game.gametype.Classic || (slot !== undefined && this.weaponswitch === slot)) {
		return true;
	}

	while (typeof me !== "object") {
		delay(10);
	}

	while (!me.gameReady) {
		delay(25);
	}

	let originalSlot = this.weaponswitch;
	let switched = false;
	let packetHandler = (bytes) => bytes.length > 0 && bytes[0] === sdk.packets.recv.WeaponSwitch && (switched = true) && false; // false to not block
	addEventListener("gamepacket", packetHandler);
	try {
		for (let i = 0; i < 10; i += 1) {
			for (let j = 10; --j && me.idle;) {
				delay(3);
			}

			i > 0 && delay(10);
			!switched && sendPacket(1, sdk.packets.send.SwapWeapon); // Swap weapons

			let tick = getTickCount();
			while (getTickCount() - tick < 300) {
				if (switched || originalSlot !== me.weaponswitch) {
					delay(50);
					return true;
				}

				delay(3);
			}
			// Retry
		}
	} finally {
		removeEventListener("gamepacket", packetHandler);
	}

	return false;
};

// Returns the number of frames needed to cast a given skill at a given FCR for a given char.
me.castingFrames = function (skillId, fcr, charClass) {
	if (skillId === undefined) return 0;

	fcr === undefined && (fcr = me.FCR);
	charClass === undefined && (charClass = this.classid);

	// https://diablo.fandom.com/wiki/Faster_Cast_Rate
	let effectiveFCR = Math.min(75, Math.floor(fcr * 120 / (fcr + 120)) | 0);
	let isLightning = skillId === sdk.skills.Lightning || skillId === sdk.skills.ChainLightning;
	let baseCastRate = [20, isLightning ? 19 : 14, 16, 16, 14, 15, 17][charClass];
	let animationSpeed = {
		normal: 256,
		human: 208,
		wolf: 229,
		bear: 228
	}[charClass === sdk.player.class.Druid ? (me.getState(sdk.states.Wolf) || me.getState(sdk.states.Bear)) : "normal"];
	return Math.ceil(256 * baseCastRate / Math.floor(animationSpeed * (100 + effectiveFCR) / 100) - (isLightning ? 0 : 1));
};

// Returns the duration in seconds needed to cast a given skill at a given FCR for a given char.
me.castingDuration = function (skillId, fcr = me.FCR, charClass = me.classid) {
	return (me.castingFrames(skillId, fcr, charClass) / 25);
};

me.getWeaponQuantity = function (weaponLoc = sdk.body.RightArm) {
	let currItem = me.getItemsEx(-1, sdk.items.mode.Equipped).filter(i => i.bodylocation === weaponLoc).first();
	return !!currItem ? currItem.getStat(sdk.stats.Quantity) : 0;
};

/**
 * @description Returns item given by itemInfo
 * @param itemInfo object -
 * 	{
 * 		classid: Number,
 * 		itemtype: Number,
 * 		quality: Number,
 * 		runeword: Boolean,
 * 		ethereal: Boolean,
 * 		name: getLocaleString(id) || localeStringId,
 * 		equipped: Boolean || Number (bodylocation)
 * 	}
 * @returns Unit[]
 */
Unit.prototype.checkItem = function (itemInfo) {
	if (this === undefined || this.type > 1 || typeof itemInfo !== "object") return {have: false, item: null};

	const itemObj = Object.assign({}, {
		classid: -1,
		itemtype: -1,
		quality: -1,
		runeword: null,
		ethereal: null,
		equipped: null,
		basetype: null,
		name: ""
	}, itemInfo);

	// convert id into string
	typeof itemObj.name === "number" && (itemObj.name = getLocaleString(itemObj.name));

	let items = this.getItemsEx()
		.filter(function (item) {
			return (!item.questItem
				&& (itemObj.classid === -1 || item.classid === itemObj.classid)
				&& (itemObj.itemtype === -1 || item.itemType === itemObj.itemtype)
				&& (itemObj.quality === -1 || item.quality === itemObj.quality)
				&& (itemObj.runeword === null || (item.runeword === itemObj.runeword))
				&& (itemObj.ethereal === null || (item.ethereal === itemObj.ethereal))
				&& (itemObj.equipped === null || (typeof itemObj.equipped === "number" ? item.bodylocation === itemObj.equipped : item.isEquipped === itemObj.equipped))
				&& (itemObj.basetype === null || ((item.normal || item.superior) === itemObj.basetype))
				&& (!itemObj.name || item.fname.toLowerCase().includes(itemObj.name.toLowerCase()))
			);
		});
	if (items.length > 0) {
		return {
			have: true,
			item: copyUnit(items.first())
		};
	} else {
		return {
			have: false,
			item: null
		};
	}
};

/**
 * @description Returns first item given by itemInfo
 * @param itemInfo array of objects -
 * 	{
 * 		classid: Number,
 * 		itemtype: Number,
 * 		quality: Number,
 * 		runeword: Boolean,
 * 		ethereal: Boolean,
 * 		name: getLocaleString(id) || localeStringId,
 * 		equipped: Boolean || Number (bodylocation)
 * 	}
 * @returns Unit[]
 */
Unit.prototype.findFirst = function (itemInfo = []) {
	if (this === undefined || this.type > 1) return {have: false, item: null};
	if (!Array.isArray(itemInfo) || typeof itemInfo[0] !== "object") return {have: false, item: null};
	let itemList = this.getItemsEx();

	for (let i = 0; i < itemInfo.length; i++) {
		const itemObj = Object.assign({}, {
			classid: -1,
			itemtype: -1,
			quality: -1,
			runeword: null,
			ethereal: null,
			equipped: null,
			name: ""
		}, itemInfo[i]);

		// convert id into string
		typeof itemObj.name === "number" && (itemObj.name = getLocaleString(itemObj.name));

		let items = itemList
			.filter(function (item) {
				return (!item.questItem
					&& (itemObj.classid === -1 || item.classid === itemObj.classid)
					&& (itemObj.itemtype === -1 || item.itemType === itemObj.itemtype)
					&& (itemObj.quality === -1 || item.quality === itemObj.quality)
					&& (itemObj.runeword === null || (item.runeword === itemObj.runeword))
					&& (itemObj.ethereal === null || (item.ethereal === itemObj.ethereal))
					&& (itemObj.equipped === null || (typeof itemObj.equipped === "number" ? item.bodylocation === itemObj.equipped : item.isEquipped === itemObj.equipped))
					&& (!itemObj.name || item.fname.toLowerCase().includes(itemObj.name.toLowerCase()))
				);
			});
		if (items.length > 0) {
			return {
				have: true,
				item: copyUnit(items.first())
			};
		}
	}

	return {
		have: false,
		item: null
	};
};

/**
 * @description Returns boolean if we have all the items given by itemInfo
 * @param itemInfo array of objects -
 * 	{
 * 		classid: Number,
 * 		itemtype: Number,
 * 		quality: Number,
 * 		runeword: Boolean,
 * 		ethereal: Boolean,
 * 		name: getLocaleString(id) || localeStringId,
 * 		equipped: Boolean || Number (bodylocation)
 * 	}
 * @returns Boolean
 */
Unit.prototype.haveAll = function (itemInfo = [], returnIfSome = false) {
	if (this === undefined || this.type > 1) return false;
	// if an object but not an array convert to array
	!Array.isArray(itemInfo) && typeof itemInfo === "object" && (itemInfo = [itemInfo]);
	if (!Array.isArray(itemInfo) || typeof itemInfo[0] !== "object") return false;
	let itemList = this.getItemsEx();
	let haveAll = false;
	let checkedGids = [];

	for (let i = 0; i < itemInfo.length; i++) {
		const itemObj = Object.assign({}, {
			classid: -1,
			itemtype: -1,
			quality: -1,
			runeword: null,
			ethereal: null,
			equipped: null,
			basetype: null,
			name: ""
		}, itemInfo[i]);

		// convert id into string
		typeof itemObj.name === "number" && (itemObj.name = getLocaleString(itemObj.name));

		let items = itemList
			.filter(function (item) {
				return (!item.questItem
					&& (checkedGids.indexOf(item.gid) === -1)
					&& (itemObj.classid === -1 || item.classid === itemObj.classid)
					&& (itemObj.itemtype === -1 || item.itemType === itemObj.itemtype)
					&& (itemObj.quality === -1 || item.quality === itemObj.quality)
					&& (itemObj.runeword === null || (item.runeword === itemObj.runeword))
					&& (itemObj.ethereal === null || (item.ethereal === itemObj.ethereal))
					&& (itemObj.equipped === null || (typeof itemObj.equipped === "number" ? item.bodylocation === itemObj.equipped : item.isEquipped === itemObj.equipped))
					&& (itemObj.basetype === null || ((item.normal || item.superior) === itemObj.basetype))
					&& (!itemObj.name.length || item.fname.toLowerCase().includes(itemObj.name.toLowerCase()))
				);
			});
		if (items.length > 0) {
			if (returnIfSome) return true;
			checkedGids.push(items.first().gid);
			haveAll = true;
		} else {
			if (returnIfSome) continue;
			return false;
		}
	}

	return haveAll;
};

Unit.prototype.haveSome = function (itemInfo = []) {
	return this.haveAll(itemInfo, true);
};

/**
 * @description Return the items of a player, or an empty array
 * @param args
 * @returns Unit[]
 */
Unit.prototype.getItems = function (...args) {
	let items = [];
	let item = this.getItem.apply(this, args);

	if (item) {
		do {
			items.push(copyUnit(item));
		} while (item.getNext());
	}

	return Array.isArray(items) ? items : [];
};

Unit.prototype.getItemsEx = function (...args) {
	let items = [];
	let item = this.getItem.apply(this, args);

	if (item) {
		do {
			items.push(copyUnit(item));
		} while (item.getNext());
	}

	return items;
};

Unit.prototype.getPrefix = function (id) {
	switch (typeof id) {
	case "number":
		if (typeof this.prefixnums !== "object") return this.prefixnum === id;

		for (let i = 0; i < this.prefixnums.length; i += 1) {
			if (id === this.prefixnums[i]) {
				return true;
			}
		}

		break;
	case "string":
		if (typeof this.prefixes !== "object") {
			return this.prefix.replace(/\s+/g, "").toLowerCase() === id.replace(/\s+/g, "").toLowerCase();
		}

		for (let i = 0; i < this.prefixes.length; i += 1) {
			if (id.replace(/\s+/g, "").toLowerCase() === this.prefixes[i].replace(/\s+/g, "").toLowerCase()) {
				return true;
			}
		}

		break;
	}

	return false;
};

Unit.prototype.getSuffix = function (id) {
	switch (typeof id) {
	case "number":
		if (typeof this.suffixnums !== "object") return this.suffixnum === id;

		for (let i = 0; i < this.suffixnums.length; i += 1) {
			if (id === this.suffixnums[i]) {
				return true;
			}
		}

		break;
	case "string":
		if (typeof this.suffixes !== "object") {
			return this.suffix.replace(/\s+/g, "").toLowerCase() === id.replace(/\s+/g, "").toLowerCase();
		}

		for (let i = 0; i < this.suffixes.length; i += 1) {
			if (id.replace(/\s+/g, "").toLowerCase() === this.suffixes[i].replace(/\s+/g, "").toLowerCase()) {
				return true;
			}
		}

		break;
	}

	return false;
};

Unit.prototype.__defineGetter__("dexreq",
	function () {
		let ethereal = this.getFlag(sdk.items.flags.Ethereal);
		let reqModifier = this.getStat(sdk.stats.ReqPercent);
		let baseReq = getBaseStat("items", this.classid, "reqdex");
		let finalReq = baseReq + Math.floor(baseReq * reqModifier / 100) - (ethereal ? 10 : 0);

		return Math.max(finalReq, 0);
	});

Unit.prototype.__defineGetter__("strreq",
	function () {
		let ethereal = this.getFlag(sdk.items.flags.Ethereal);
		let reqModifier = this.getStat(sdk.stats.ReqPercent);
		let baseReq = getBaseStat("items", this.classid, "reqstr");
		let finalReq = baseReq + Math.floor(baseReq * reqModifier / 100) - (ethereal ? 10 : 0);

		return Math.max(finalReq, 0);
	});

Unit.prototype.__defineGetter__("itemclass",
	function () {
		if (getBaseStat("items", this.classid, "code") === undefined) return 0;
		if (getBaseStat("items", this.classid, "code") === getBaseStat(0, this.classid, "ultracode")) return 2;
		if (getBaseStat("items", this.classid, "code") === getBaseStat(0, this.classid, "ubercode")) return 1;

		return 0;
	});

Unit.prototype.getStatEx = function (id, subid) {
	let temp, rval, regex;

	switch (id) {
	case sdk.stats.AllRes:
	// calculates all res, doesn't exist though
	// Block scope due to the variable declaration
	{
		// Get all res
		let allres = [
			this.getStatEx(sdk.stats.FireResist),
			this.getStatEx(sdk.stats.ColdResist),
			this.getStatEx(sdk.stats.LightningResist),
			this.getStatEx(sdk.stats.PoisonResist)
		];

		// What is the minimum of the 4?
		let min = Math.min.apply(null, allres);

		// Cap all res to the minimum amount of res
		allres = allres.map(res => res > min ? min : res);

		// Get it in local variables, its more easy to read
		let [fire, cold, light, psn] = allres;

		return fire === cold && cold === light && light === psn ? min : 0;
	}
	case sdk.stats.ToBlock:
		switch (this.classid) {
		case sdk.items.Buckler:
			return this.getStat(sdk.stats.ToBlock);
		case sdk.items.PreservedHead:
		case sdk.items.MummifiedTrophy:
		case sdk.items.MinionSkull:
			return this.getStat(sdk.stats.ToBlock) - 3;
		case sdk.items.SmallShield:
		case sdk.items.ZombieHead:
		case sdk.items.FetishTrophy:
		case sdk.items.HellspawnSkull:
			return this.getStat(sdk.stats.ToBlock) - 5;
		case sdk.items.KiteShield:
		case sdk.items.UnravellerHead:
		case sdk.items.SextonTrophy:
		case sdk.items.OverseerSkull:
			return this.getStat(sdk.stats.ToBlock) - 8;
		case sdk.items.SpikedShield:
		case sdk.items.Defender:
		case sdk.items.GargoyleHead:
		case sdk.items.CantorTrophy:
		case sdk.items.SuccubusSkull:
		case sdk.items.Targe:
		case sdk.items.AkaranTarge:
			return this.getStat(sdk.stats.ToBlock) - 10;
		case sdk.items.LargeShield:
		case sdk.items.RoundShield:
		case sdk.items.DemonHead:
		case sdk.items.HierophantTrophy:
		case sdk.items.BloodlordSkull:
			return this.getStat(sdk.stats.ToBlock) - 12;
		case sdk.items.Scutum:
			return this.getStat(sdk.stats.ToBlock) - 14;
		case sdk.items.Rondache:
		case sdk.items.AkaranRondache:
			return this.getStat(sdk.stats.ToBlock) - 15;
		case sdk.items.GothicShield:
		case sdk.items.AncientShield:
			return this.getStat(sdk.stats.ToBlock) - 16;
		case sdk.items.BarbedShield:
			return this.getStat(sdk.stats.ToBlock) - 17;
		case sdk.items.DragonShield:
			return this.getStat(sdk.stats.ToBlock) - 18;
		case sdk.items.VortexShield:
			return this.getStat(sdk.stats.ToBlock) - 19;
		case sdk.items.BoneShield:
		case sdk.items.GrimShield:
		case sdk.items.Luna:
		case sdk.items.BladeBarrier:
		case sdk.items.TrollNest:
		case sdk.items.HeraldicShield:
		case sdk.items.ProtectorShield:
			return this.getStat(sdk.stats.ToBlock) - 20;
		case sdk.items.Heater:
		case sdk.items.Monarch:
		case sdk.items.AerinShield:
		case sdk.items.GildedShield:
		case sdk.items.ZakarumShield:
			return this.getStat(sdk.stats.ToBlock) - 22;
		case sdk.items.TowerShield:
		case sdk.items.Pavise:
		case sdk.items.Hyperion:
		case sdk.items.Aegis:
		case sdk.items.Ward:
			return this.getStat(sdk.stats.ToBlock) - 24;
		case sdk.items.CrownShield:
		case sdk.items.RoyalShield:
		case sdk.items.KurastShield:
			return this.getStat(sdk.stats.ToBlock) - 25;
		case sdk.items.SacredRondache:
			return this.getStat(sdk.stats.ToBlock) - 28;
		case sdk.items.SacredTarge:
			return this.getStat(sdk.stats.ToBlock) - 30;
		}

		break;
	case sdk.stats.MinDamage:
	case sdk.stats.MaxDamage:
		if (subid === 1) {
			temp = this.getStat(-1);
			rval = 0;

			for (let i = 0; i < temp.length; i += 1) {
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
	case sdk.stats.Defense:
		if (subid === 0) {
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			switch (this.itemType) {
			case sdk.items.type.Jewel:
			case sdk.items.type.SmallCharm:
			case sdk.items.type.LargeCharm:
			case sdk.items.type.GrandCharm:
				// defense is the same as plusdefense for these items
				return this.getStat(sdk.stats.Defense);
			}

			// can fail sometimes
			!this.desc && (this.desc = this.description);

			if (this.desc) {
				temp = this.desc.split("\n");
				regex = new RegExp("\\+\\d+ " + getLocaleString(sdk.locale.text.Defense).replace(/^\s+|\s+$/g, ""));

				for (let i = 0; i < temp.length; i += 1) {
					if (temp[i].match(regex, "i")) {
						return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
					}
				}
			}

			return 0;
		}

		break;
	case sdk.stats.PoisonMinDamage:
		if (subid === 1) {
			return Math.round(this.getStat(sdk.stats.PoisonMinDamage) * this.getStat(sdk.stats.PoisonLength) / 256);
		}

		break;
	case sdk.stats.AddClassSkills:
		if (subid === undefined) {
			for (let i = 0; i < 7; i += 1) {
				let cSkill = this.getStat(sdk.stats.AddClassSkills, i);
				if (cSkill) return cSkill;
			}

			return 0;
		}

		break;
	case sdk.stats.AddSkillTab:
		if (subid === undefined) {
			temp = Object.values(sdk.skills.tabs);

			for (let i = 0; i < temp.length; i += 1) {
				let sTab = this.getStat(sdk.stats.AddSkillTab, temp[i]);
				if (sTab) return sTab;
			}

			return 0;
		}

		break;
	case sdk.stats.SkillOnAttack:
	case sdk.stats.SkillOnKill:
	case sdk.stats.SkillOnDeath:
	case sdk.stats.SkillOnStrike:
	case sdk.stats.SkillOnLevelUp:
	case sdk.stats.SkillWhenStruck:
	case sdk.stats.ChargedSkill:
		if (subid === 1) {
			temp = this.getStat(-2);

			if (temp.hasOwnProperty(id)) {
				if (temp[id] instanceof Array) {
					for (let i = 0; i < temp[id].length; i += 1) {
						if (temp[id][i] !== undefined) {
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
					for (let i = 0; i < temp[id].length; i += 1) {
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
	case sdk.stats.PerLevelHp: // (for example Fortitude with hp per lvl can be defined now with 1.5)
		return this.getStat(sdk.stats.PerLevelHp) / 2048;
	}

	if (this.getFlag(sdk.items.flags.Runeword)) {
		switch (id) {
		case sdk.stats.ArmorPercent:
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			!this.desc && (this.desc = this.description);

			if (this.desc) {
				temp = this.desc.split("\n");

				for (let i = 0; i < temp.length; i += 1) {
					if (temp[i].match(getLocaleString(sdk.locale.text.EnhancedDefense).replace(/^\s+|\s+$/g, ""), "i")) {
						return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
					}
				}
			}

			return 0;
		case sdk.stats.EnhancedDamage:
			if ([0, 1].indexOf(this.mode) < 0) {
				break;
			}

			!this.desc && (this.desc = this.description);

			if (this.desc) {
				temp = this.desc.split("\n");

				for (let i = 0; i < temp.length; i += 1) {
					if (temp[i].match(getLocaleString(sdk.locale.text.EnhancedDamage).replace(/^\s+|\s+$/g, ""), "i")) {
						return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
					}
				}
			}

			return 0;
		}
	}

	return (subid === undefined ? this.getStat(id) : this.getStat(id, subid));
};

/*
	_NTIPAliasColor["black"] = 3;
	_NTIPAliasColor["lightblue"] = 4;
	_NTIPAliasColor["darkblue"] = 5;
	_NTIPAliasColor["crystalblue"] = 6;
	_NTIPAliasColor["lightred"] = 7;
	_NTIPAliasColor["darkred"] = 8;
	_NTIPAliasColor["crystalred"] = 9;
	_NTIPAliasColor["darkgreen"] = 11;
	_NTIPAliasColor["crystalgreen"] = 12;
	_NTIPAliasColor["lightyellow"] = 13;
	_NTIPAliasColor["darkyellow"] = 14;
	_NTIPAliasColor["lightgold"] = 15;
	_NTIPAliasColor["darkgold"] = 16;
	_NTIPAliasColor["lightpurple"] = 17;
	_NTIPAliasColor["orange"] = 19;
	_NTIPAliasColor["white"] = 20;
*/

Unit.prototype.getColor = function () {
	let colors;
	let Color = {
		black: 3,
		lightblue: 4,
		darkblue: 5,
		crystalblue: 6,
		lightred: 7,
		darkred: 8,
		crystalred: 9,
		darkgreen: 11,
		crystalgreen: 12,
		lightyellow: 13,
		darkyellow: 14,
		lightgold: 15,
		darkgold: 16,
		lightpurple: 17,
		orange: 19,
		white: 20
	};

	// check type
	switch (this.itemType) {
	case sdk.items.type.Shield:
	case sdk.items.type.Armor:
	case sdk.items.type.Boots:
	case sdk.items.type.Gloves:
	case sdk.items.type.Belt:
	case sdk.items.type.AuricShields:
	case sdk.items.type.VoodooHeads:
	case sdk.items.type.Helm:
	case sdk.items.type.PrimalHelm:
	case sdk.items.type.Circlet:
	case sdk.items.type.Pelt:
	case sdk.items.type.Scepter:
	case sdk.items.type.Wand:
	case sdk.items.type.Staff:
	case sdk.items.type.Bow:
	case sdk.items.type.Axe:
	case sdk.items.type.Club:
	case sdk.items.type.Sword:
	case sdk.items.type.Hammer:
	case sdk.items.type.Knife:
	case sdk.items.type.Spear:
	case sdk.items.type.Polearm:
	case sdk.items.type.Crossbow:
	case sdk.items.type.Mace:
	case sdk.items.type.ThrowingKnife:
	case sdk.items.type.ThrowingAxe:
	case sdk.items.type.Javelin:
	case sdk.items.type.Orb:
	case sdk.items.type.AmazonBow:
	case sdk.items.type.AmazonSpear:
	case sdk.items.type.AmazonJavelin:
	case sdk.items.type.MissilePotion:
	case sdk.items.type.HandtoHand:
	case sdk.items.type.AssassinClaw:
		break;
	default:
		return -1;
	}

	// check quality
	if ([sdk.items.quality.Magic, sdk.items.quality.Set, sdk.items.quality.Rare, sdk.items.quality.Unique].indexOf(this.quality) === -1) {
		return -1;
	}

	if (this.quality === sdk.items.quality.Magic || this.quality === sdk.items.quality.Rare) {
		colors = {
			"Screaming": Color.orange,
			"Howling": Color.orange,
			"Wailing": Color.orange,
			"Sapphire": Color.lightblue,
			"Snowy": Color.lightblue,
			"Shivering": Color.lightblue,
			"Boreal": Color.lightblue,
			"Hibernal": Color.lightblue,
			"Ruby": Color.lightred,
			"Amber": Color.lightyellow,
			"Static": Color.lightyellow,
			"Glowing": Color.lightyellow,
			"Buzzing": Color.lightyellow,
			"Arcing": Color.lightyellow,
			"Shocking": Color.lightyellow,
			"Emerald": Color.crystalgreen,
			"Saintly": Color.darkgold,
			"Holy": Color.darkgold,
			"Godly": Color.darkgold,
			"Visionary": Color.white,
			"Mnemonic": Color.crystalblue,
			"Bowyer's": Color.lightgold,
			"Gymnastic": Color.lightgold,
			"Spearmaiden's": Color.lightgold,
			"Archer's": Color.lightgold,
			"Athlete's": Color.lightgold,
			"Lancer's": Color.lightgold,
			"Charged": Color.lightgold,
			"Blazing": Color.lightgold,
			"Freezing": Color.lightgold,
			"Glacial": Color.lightgold,
			"Powered": Color.lightgold,
			"Volcanic": Color.lightgold,
			"Blighting": Color.lightgold,
			"Noxious": Color.lightgold,
			"Mojo": Color.lightgold,
			"Cursing": Color.lightgold,
			"Venomous": Color.lightgold,
			"Golemlord's": Color.lightgold,
			"Warden's": Color.lightgold,
			"Hawk Branded": Color.lightgold,
			"Commander's": Color.lightgold,
			"Marshal's": Color.lightgold,
			"Rose Branded": Color.lightgold,
			"Guardian's": Color.lightgold,
			"Veteran's": Color.lightgold,
			"Resonant": Color.lightgold,
			"Raging": Color.lightgold,
			"Echoing": Color.lightgold,
			"Furious": Color.lightgold,
			"Master's": Color.lightgold, // there's 2x masters...
			"Caretaker's": Color.lightgold,
			"Terrene": Color.lightgold,
			"Feral": Color.lightgold,
			"Gaean": Color.lightgold,
			"Communal": Color.lightgold,
			"Keeper's": Color.lightgold,
			"Sensei's": Color.lightgold,
			"Trickster's": Color.lightgold,
			"Psychic": Color.lightgold,
			"Kenshi's": Color.lightgold,
			"Cunning": Color.lightgold,
			"Shadow": Color.lightgold,
			"Faithful": Color.white,
			"Priest's": Color.crystalgreen,
			"Dragon's": Color.crystalblue,
			"Vulpine": Color.crystalblue,
			"Shimmering": Color.lightpurple,
			"Rainbow": Color.lightpurple,
			"Scintillating": Color.lightpurple,
			"Prismatic": Color.lightpurple,
			"Chromatic": Color.lightpurple,
			"Hierophant's": Color.crystalgreen,
			"Berserker's": Color.crystalgreen,
			"Necromancer's": Color.crystalgreen,
			"Witch-hunter's": Color.crystalgreen,
			"Arch-Angel's": Color.crystalgreen,
			"Valkyrie's": Color.crystalgreen,
			"Massive": Color.darkgold,
			"Savage": Color.darkgold,
			"Merciless": Color.darkgold,
			"Ferocious": Color.black,
			"Grinding": Color.white,
			"Cruel": Color.black,
			"Gold": Color.lightgold,
			"Platinum": Color.lightgold,
			"Meteoric": Color.lightgold,
			"Strange": Color.lightgold,
			"Weird": Color.lightgold,
			"Knight's": Color.darkgold,
			"Lord's": Color.darkgold,
			"Fool's": Color.white,
			"King's": Color.darkgold,
			//"Master's": Color.darkgold,
			"Elysian": Color.darkgold,
			"Fiery": Color.darkred,
			"Smoldering": Color.darkred,
			"Smoking": Color.darkred,
			"Flaming": Color.darkred,
			"Condensing": Color.darkred,
			"Septic": Color.darkgreen,
			"Foul": Color.darkgreen,
			"Corrosive": Color.darkgreen,
			"Toxic": Color.darkgreen,
			"Pestilent": Color.darkgreen,
			"of Quickness": Color.darkyellow,
			"of the Glacier": Color.darkblue,
			"of Winter": Color.darkblue,
			"of Burning": Color.darkred,
			"of Incineration": Color.darkred,
			"of Thunder": Color.darkyellow,
			"of Storms": Color.darkyellow,
			"of Carnage": Color.black,
			"of Slaughter": Color.black,
			"of Butchery": Color.black,
			"of Evisceration": Color.black,
			"of Performance": Color.black,
			"of Transcendence": Color.black,
			"of Pestilence": Color.darkgreen,
			"of Anthrax": Color.darkgreen,
			"of the Locust": Color.crystalred,
			"of the Lamprey": Color.crystalred,
			"of the Wraith": Color.crystalred,
			"of the Vampire": Color.crystalred,
			"of Icebolt": Color.lightblue,
			"of Nova": Color.crystalblue,
			"of the Mammoth": Color.crystalred,
			"of Frost Shield": Color.lightblue,
			"of Nova Shield": Color.crystalblue,
			"of Wealth": Color.lightgold,
			"of Fortune": Color.lightgold,
			"of Luck": Color.lightgold,
			"of Perfection": Color.darkgold,
			"of Regrowth": Color.crystalred,
			"of Spikes": Color.orange,
			"of Razors": Color.orange,
			"of Swords": Color.orange,
			"of Stability": Color.darkyellow,
			"of the Colosuss": Color.crystalred,
			"of the Squid": Color.crystalred,
			"of the Whale": Color.crystalred,
			"of Defiance": Color.darkred,
			"of the Titan": Color.darkgold,
			"of Atlas": Color.darkgold,
			"of Wizardry": Color.darkgold
		};

		switch (this.itemType) {
		case sdk.items.type.Boots:
			colors["of Precision"] = Color.darkgold;

			break;
		case sdk.items.type.Gloves:
			colors["of Alacrity"] = Color.darkyellow;
			colors["of the Leech"] = Color.crystalred;
			colors["of the Bat"] = Color.crystalred;
			colors["of the Giant"] = Color.darkgold;

			break;
		}
	} else if (this.set) {
		if (this.identified) {
			for (let i = 0; i < 127; i += 1) {
				if (this.fname.split("\n").reverse()[0].includes(getLocaleString(getBaseStat(16, i, 3)))) {
					return getBaseStat(16, i, 12) > 20 ? -1 : getBaseStat(16, i, 12);
				}
			}
		} else {
			return Color.lightyellow; // Unidentified set item
		}
	} else if (this.unique) {
		for (let i = 0; i < 401; i += 1) {
			if (this.code === getBaseStat(17, i, 4).replace(/^\s+|\s+$/g, "") && this.fname.split("\n").reverse()[0].includes(getLocaleString(getBaseStat(17, i, 2)))) {
				return getBaseStat(17, i, 13) > 20 ? -1 : getBaseStat(17, i, 13);
			}
		}
	}

	for (let i = 0; i < this.suffixes.length; i += 1) {
		if (colors.hasOwnProperty(this.suffixes[i])) {
			return colors[this.suffixes[i]];
		}
	}

	for (let i = 0; i < this.prefixes.length; i += 1) {
		if (colors.hasOwnProperty(this.prefixes[i])) {
			return colors[this.prefixes[i]];
		}
	}

	return -1;
};

/**
 * @description Used upon item units like ArachnidMesh.castChargedSkill([skillId]) or directly on the "me" unit me.castChargedSkill(278);
 * @param {int} skillId = undefined
 * @param {int} x = undefined
 * @param {int} y = undefined
 * @return boolean
 * @throws Error
 */
Unit.prototype.castChargedSkill = function (...args) {
	let skillId, x, y, unit, chargedItem, charge;
	let chargedItems = [];
	let validCharge = function (itemCharge) {
		return itemCharge.skill === skillId && itemCharge.charges;
	};

	switch (args.length) {
	case 0: // item.castChargedSkill()
		break;
	case 1:
		if (args[0] instanceof Unit) { // hellfire.castChargedSkill(monster);
			unit = args[0];
		} else {
			skillId = args[0];
		}

		break;
	case 2:
		if (typeof args[0] === "number") {
			if (args[1] instanceof Unit) { // me.castChargedSkill(skillId,unit)
				[skillId, unit] = [...args];
			} else if (typeof args[1] === "number") { // item.castChargedSkill(x,y)
				[x, y] = [...args];
			}
		} else {
			throw new Error(" invalid arguments, expected (skillId, unit) or (x, y)");
		}

		break;
	case 3:
		// If all arguments are numbers
		if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number") {
			[skillId, x, y] = [...args];
		}

		break;
	default:
		throw new Error("invalid arguments, expected 'me' object or 'item' unit");
	}

	// Charged skills can only be casted on x, y coordinates
	unit && ([x, y] = [unit.x, unit.y]);

	if (this !== me && this.type !== sdk.unittype.Item) {
		throw Error("invalid arguments, expected 'me' object or 'item' unit");
	}

	// Called the function the unit, me.
	if (this === me) {
		if (!skillId) throw Error("Must supply skillId on me.castChargedSkill");

		chargedItems = [];

		// Item must be equipped, or a charm in inventory
		this.getItemsEx(-1)
			.filter(item => item && (item.isEquipped || (item.isInInventory && item.isCharm)))
			.forEach(function (item) {
				let stats = item.getStat(-2);

				if (stats.hasOwnProperty(sdk.stats.ChargedSkill)) {
					if (stats[sdk.stats.ChargedSkill] instanceof Array) {
						stats = stats[sdk.stats.ChargedSkill].filter(validCharge);
						stats.length && chargedItems.push({
							charge: stats.first(),
							item: item
						});
					} else {
						if (stats[sdk.stats.ChargedSkill].skill === skillId && stats[sdk.stats.ChargedSkill].charges > 1) {
							chargedItems.push({
								charge: stats[sdk.stats.ChargedSkill].charges,
								item: item
							});
						}
					}
				}
			});

		if (chargedItems.length === 0) throw Error("Don't have the charged skill (" + skillId + "), or not enough charges");

		chargedItem = chargedItems.sort((a, b) => a.charge.level - b.charge.level).first().item;

		return chargedItem.castChargedSkill.apply(chargedItem, args);
	} else if (this.type === sdk.unittype.Item) {
		charge = this.getStat(-2)[sdk.stats.ChargedSkill]; // WARNING. Somehow this gives duplicates

		if (!charge) throw Error("No charged skill on this item");

		if (skillId) {
			// Filter out all other charged skills
			charge = charge.filter(item => (skillId && item.skill === skillId) && !!item.charges);
		} else if (charge.length > 1) {
			throw new Error("multiple charges on this item without a given skillId");
		}

		charge = charge.first();

		if (charge) {
			// Setting skill on hand
			if (!Config.PacketCasting || Config.PacketCasting === 1 && skillId !== sdk.skills.Teleport) {
				return Skill.cast(skillId, sdk.skills.hand.Right, x || me.x, y || me.y, this); // Non packet casting
			}

			// Packet casting
			sendPacket(1, sdk.packets.send.SelectSkill, 2, charge.skill, 1, 0x0, 1, 0x00, 4, this.gid);
			// No need for a delay, since its TCP, the server recv's the next statement always after the send cast skill packet

			// The result of "successfully" casted is different, so we cant wait for it here. We have to assume it worked
			sendPacket(1, sdk.packets.send.RightSkillOnLocation, 2, x || me.x, 2, y || me.y); // Cast the skill

			return true;
		}
	}

	return false;
};

/**
 * @description equip an item.
 */
Unit.prototype.equip = function (destLocation = undefined) {
	if (this.isEquipped) return true; // Item already equiped

	const findspot = function (item) {
		let tempspot = Storage.Stash.FindSpot(item);

		if (getUIFlag(sdk.uiflags.Stash) && tempspot) {
			return {location: Storage.Stash.location, coord: tempspot};
		}

		tempspot = Storage.Inventory.FindSpot(item);

		return tempspot ? {location: Storage.Inventory.location, coord: tempspot} : false;
	};
	const doubleHanded = [
		sdk.items.type.Staff, sdk.items.type.Bow, sdk.items.type.Polearm, sdk.items.type.Crossbow,
		sdk.items.type.HandtoHand, sdk.items.type.AmazonBow, sdk.items.type.AmazonSpear
	];

	// Not an item, or unidentified, or not enough stats
	if (this.type !== sdk.unittype.Item || !this.getFlag(sdk.items.flags.Identified)
		|| this.getStat(sdk.stats.LevelReq) > me.getStat(sdk.stats.Level)
		|| this.dexreq > me.getStat(sdk.stats.Dexterity)
		|| this.strreq > me.getStat(sdk.stats.Strength)) {
		return false;
	}

	// If not a specific location is given, figure it out (can be useful to equip a double weapon)
	!destLocation && (destLocation = this.getBodyLoc());
	// If destLocation isnt an array, make it one
	!Array.isArray(destLocation) && (destLocation = [destLocation]);

	console.log("equiping " + this.name + " to bodylocation: " + destLocation.first());

	let currentEquiped = me.getItemsEx(-1).filter(item =>
		destLocation.indexOf(item.bodylocation) !== -1
		|| ( // Deal with double handed weapons

			(item.isOnMain)
			&& [sdk.body.RightArm, sdk.body.LeftArm].indexOf(destLocation) // in case destination is on the weapon/shield slot
			&& (
				doubleHanded.indexOf(this.itemType) !== -1 // this item is a double handed item
				|| doubleHanded.indexOf(item.itemType) !== -1 // current item is a double handed item
			)
		)
	).sort((a, b) => b - a); // shields first

	// if nothing is equipped at the moment, just equip it
	if (!currentEquiped.length) {
		clickItemAndWait(sdk.clicktypes.click.Left, this);
		clickItemAndWait(sdk.clicktypes.click.Left, destLocation.first());
	} else {
		// unequip / swap items
		currentEquiped.forEach((item, index) => {
			// Last item, so swap instead of putting off first
			if (index === (currentEquiped.length - 1)) {
				print("swap " + this.name + " for " + item.name);
				let oldLoc = {x: this.x, y: this.y, location: this.location};
				clickItemAndWait(sdk.clicktypes.click.Left, this); // Pick up current item
				clickItemAndWait(sdk.clicktypes.click.Left, destLocation.first()); // the swap of items
				// Find a spot for the current item
				let	spot = findspot(item);

				if (!spot) { // If no spot is found for the item, rollback
					clickItemAndWait(sdk.clicktypes.click.Left, destLocation.first()); // swap again
					clickItemAndWait(sdk.clicktypes.click.Left, oldLoc.x, oldLoc.y, oldLoc.location); // put item back on old spot
					throw Error("cant find spot for unequipped item");
				}

				clickItemAndWait(sdk.clicktypes.click.Left, spot.coord.y, spot.coord.x, spot.location); // put item on the found spot

				return;
			}

			print("Unequip item first " + item.name);
			// Incase multiple items are equipped
			let spot = findspot(item); // Find a spot for the current item

			if (!spot) throw Error("cant find spot for unequipped item");

			clickItemAndWait(sdk.clicktypes.click.Left, item.bodylocation);
			clickItemAndWait(sdk.clicktypes.click.Left, spot.coord.x, spot.coord.y, spot.location);
		});
	}

	return {
		success: this.bodylocation === destLocation.first(),
		unequiped: currentEquiped,
		rollback: () => currentEquiped.forEach(item => item.equip()) // Note; rollback only works if you had other items equipped before.
	};
};

Unit.prototype.getBodyLoc = function () {
	const types = {};
	types[sdk.body.Head] = [sdk.items.type.Helm, sdk.items.type.Pelt, sdk.items.type.PrimalHelm]; // helm
	types[sdk.body.Neck] = [sdk.items.type.Amulet]; // amulet
	types[sdk.body.Armor] = [sdk.items.type.Armor]; // armor
	types[sdk.body.RightArm] = [
		sdk.items.type.Scepter, sdk.items.type.Wand, sdk.items.type.Staff, sdk.items.type.Bow, sdk.items.type.Axe, sdk.items.type.Club, sdk.items.type.Sword, sdk.items.type.Hammer,
		sdk.items.type.Knife, sdk.items.type.Spear, sdk.items.type.Polearm, sdk.items.type.Crossbow, sdk.items.type.Mace, sdk.items.type.ThrowingKnife, sdk.items.type.ThrowingAxe,
		sdk.items.type.Javelin, sdk.items.type.HandtoHand, sdk.items.type.Orb, sdk.items.type.AmazonBow, sdk.items.type.AmazonSpear, sdk.items.type.AmazonJavelin, sdk.items.type.AssassinClaw
	]; // weapons
	types[sdk.body.LeftArm] = [sdk.items.type.Shield, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver, sdk.items.type.AuricShields, sdk.items.type.VoodooHeads], // shields / Arrows / bolts
	types[sdk.body.RingRight] = [sdk.items.type.Ring]; // ring slot 1
	types[sdk.body.RingLeft] = [sdk.items.type.Ring]; // ring slot 2
	types[sdk.body.Belt] = [sdk.items.type.Belt]; // belt
	types[sdk.body.Feet] = [sdk.items.type.Boots]; // boots
	types[sdk.body.Gloves] = [sdk.items.type.Gloves]; // gloves
	//types[sdk.body.RightArmSecondary] = types[sdk.body.RightArm];
	//types[sdk.body.LeftArmSecondary] = types[sdk.body.LeftArm];
	let bodyLoc = [];

	for (let i in types) {
		this.itemType && types[i].indexOf(this.itemType) !== -1 && bodyLoc.push(i);
	}

	// Strings are hard to calculate with, parse to int
	return bodyLoc.map(parseInt);
};

Unit.prototype.getRes = function (type, difficulty) {
	if (!type || ![sdk.stats.FireResist, sdk.stats.ColdResist, sdk.stats.PoisonResist, sdk.stats.LightningResist].includes(type)) {
		return -1;
	}
	
	difficulty === undefined || difficulty < 0 && (difficulty = 0);
	difficulty > 2 && (difficulty = 2);

	let modifier = me.classic ? [0, 20, 50][difficulty] : [0, 40, 100][difficulty];
	if (this === me) {
		switch (type) {
		case sdk.stats.FireResist:
			me.getState(sdk.states.ShrineResFire) && (modifier += 75);

			break;
		case sdk.stats.ColdResist:
			me.getState(sdk.states.ShrineResCold) && (modifier += 75);
			me.getState(sdk.states.Thawing) && (modifier += 50);

			break;
		case sdk.stats.LightningResist:
			me.getState(sdk.states.ShrineResLighting) && (modifier += 75);

			break;
		case sdk.stats.PoisonResist:
			me.getState(sdk.states.ShrineResPoison) && (modifier += 75);
			me.getState(sdk.states.Antidote) && (modifier += 50);

			break;
		}
	}
	return this.getStat(type) - modifier;
};

{
	let coords = function () {
		if (Array.isArray(this) && this.length > 1) {
			return [this[0], this[1]];
		}

		if (typeof this.x !== "undefined" && typeof this.y !== "undefined") {
			return this instanceof PresetUnit && [this.roomx * 5 + this.x, this.roomy * 5 + this.y] || [this.x, this.y];
		}

		return [undefined, undefined];
	};

	Object.defineProperties(Object.prototype, {
		distance: {
			get: function () {
				return !me.gameReady ? NaN : /* Math.round */(getDistance.apply(null, [me, ...coords.apply(this)]));
			},
			enumerable: false,
		},
	});

	Object.prototype.mobCount = function (givenSettings = {}) {
		let [x, y] = coords.apply(this);
		const settings = Object.assign({}, {
			range: 5,
			coll: (sdk.collision.BlockWall | sdk.collision.LineOfSight | sdk.collision.BlockMissile),
			type: 0,
			ignoreClassids: [],
		}, givenSettings);
		return getUnits(sdk.unittype.Monster)
			.filter(function (mon) {
				return mon.attackable && getDistance(x, y, mon.x, mon.y) < settings.range
					&& (!settings.type || (settings.type & mon.spectype))
					&& (settings.ignoreClassids.indexOf(mon.classid) === -1)
					&& !CollMap.checkColl({x: x, y: y}, mon, settings.coll, 1);
			}).length;
	};
	Object.defineProperty(Object.prototype, "mobCount", {enumerable: false});
}

Object.defineProperties(Unit.prototype, {
	isChampion: {
		get: function () {
			return (this.spectype & sdk.monsters.spectype.Champion) > 0;
		},
	},
	isUnique: {
		get: function () {
			return (this.spectype & sdk.monsters.spectype.Unique) > 0;
		},
	},
	isMinion: {
		get: function () {
			return (this.spectype & sdk.monsters.spectype.Minion) > 0;
		},
	},
	isSuperUnique: {
		get: function () {
			return (this.spectype & (sdk.monsters.spectype.Super | sdk.monsters.spectype.Unique)) > 0;
		},
	},
	isSpecial: {
		get: function () {
			return (this.isChampion || this.isUnique || this.isSuperUnique);
		},
	},
	isPlayer: {
		get: function () {
			return this.type === sdk.unittype.Player;
		},
	},
	isMonster: {
		get: function () {
			return this.type === sdk.unittype.Monster;
		},
	},
	isNPC: {
		get: function () {
			return this.type === sdk.unittype.Monster && this.getStat(sdk.stats.Alignment) === 2;
		},
	},
	// todo - monster types
	isPrimeEvil: {
		get: function () {
			return [
				sdk.monsters.Andariel, sdk.monsters.Duriel, sdk.monsters.Mephisto, sdk.monsters.Diablo,
				sdk.monsters.Baal, sdk.monsters.BaalClone, sdk.monsters.UberDuriel, sdk.monsters.UberIzual,
				sdk.monsters.UberMephisto, sdk.monsters.UberDiablo, sdk.monsters.UberBaal, sdk.monsters.Lilith, sdk.monsters.DiabloClone
			].includes(this.classid) || getBaseStat("monstats", this.classid, "primeevil");
		},
	},
	isBoss: {
		get: function () {
			return this.isPrimeEvil
				||
				[
					sdk.monsters.TheSmith, sdk.monsters.BloodRaven, sdk.monsters.Radament, sdk.monsters.Griswold,
					sdk.monsters.TheSummoner, sdk.monsters.Izual, sdk.monsters.Hephasto, sdk.monsters.KorlictheProtector,
					sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian, sdk.monsters.ListerTheTormenter,
					sdk.monsters.TheCowKing, sdk.monsters.ColdwormtheBurrower, sdk.monsters.Nihlathak
				].includes(this.classid);
		},
	},
	isGhost: {
		get: function () {
			return [
				sdk.monsters.Ghost1, sdk.monsters.Wraith1, sdk.monsters.Specter1,
				sdk.monsters.Apparition, sdk.monsters.DarkShape, sdk.monsters.Ghost2, sdk.monsters.Wraith2, sdk.monsters.Specter2
			].includes(this.classid) || getBaseStat("monstats", this.classid, "MonType") === sdk.monsters.type.Wraith;
		},
	},
	isDoll: {
		get: function () {
			return [
				sdk.monsters.BoneFetish1, sdk.monsters.BoneFetish2, sdk.monsters.BoneFetish3,
				sdk.monsters.SoulKiller3, sdk.monsters.StygianDoll2, sdk.monsters.StygianDoll6, sdk.monsters.SoulKiller
			].includes(this.classid);
		},
	},
	isMonsterObject: {
		get: function () {
			return [
				sdk.monsters.Turret1, sdk.monsters.Turret2, sdk.monsters.Turret3, sdk.monsters.MummyGenerator,
				sdk.monsters.GargoyleTrap, sdk.monsters.LightningSpire, sdk.monsters.FireTower,
				sdk.monsters.BarricadeDoor1, sdk.monsters.BarricadeDoor2, sdk.monsters.BarricadeWall1, sdk.monsters.BarricadeWall2,
				sdk.monsters.CatapultS, sdk.monsters.CatapultE, sdk.monsters.CatapultSiege, sdk.monsters.CatapultW,
				sdk.monsters.BarricadeTower, sdk.monsters.PrisonDoor, sdk.monsters.DiablosBoneCage, sdk.monsters.Hut,
			].includes(this.classid);
		},
	},
	isMonsterEgg: {
		get: function () {
			return [
				sdk.monsters.SandMaggotEgg, sdk.monsters.RockWormEgg, sdk.monsters.DevourerEgg, sdk.monsters.GiantLampreyEgg,
				sdk.monsters.WorldKillerEgg1, sdk.monsters.WorldKillerEgg2
			].includes(this.classid);
		},
	},
	isMonsterNest: {
		get: function () {
			return [
				sdk.monsters.FoulCrowNest, sdk.monsters.BlackVultureNest, sdk.monsters.BloodHawkNest, sdk.monsters.BloodHookNest,
				sdk.monsters.BloodWingNest, sdk.monsters.CloudStalkerNest, sdk.monsters.FeederNest, sdk.monsters.SuckerNest
			].includes(this.classid);
		},
	},
	isBaalTentacle: {
		get: function () {
			return [
				sdk.monsters.Tentacle1, sdk.monsters.Tentacle2,
				sdk.monsters.Tentacle3, sdk.monsters.Tentacle4, sdk.monsters.Tentacle5
			].includes(this.classid);
		},
	},
	isShaman: {
		get: function () {
			return [
				sdk.monsters.FallenShaman, sdk.monsters.CarverShaman2, sdk.monsters.DevilkinShaman2, sdk.monsters.DarkShaman1,
				sdk.monsters.WarpedShaman, sdk.monsters.CarverShaman, sdk.monsters.DevilkinShaman, sdk.monsters.DarkShaman2
			].includes(this.classid);
		},
	},
	isUnraveler: {
		get: function () {
			return getBaseStat("monstats", this.classid, "MonType") === sdk.monsters.type.Unraveler;
		},
	},
	isFallen: {
		get: function () {
			return [
				sdk.monsters.Fallen, sdk.monsters.Carver2, sdk.monsters.Devilkin2, sdk.monsters.DarkOne1, sdk.monsters.WarpedFallen,
				sdk.monsters.Carver1, sdk.monsters.Devilkin, sdk.monsters.DarkOne2
			].includes(this.classid);
		},
	},
	isBeetle: {
		get: function () {
			return getBaseStat("monstats", this.classid, "MonType") === sdk.monsters.type.Scarab;
		},
	},
	isWalking: {
		get: function () {
			return (this.mode === sdk.monsters.mode.Walking && (this.targetx !== this.x || this.targety !== this.y));
		}
	},
	isRunning: {
		get: function () {
			return (this.mode === sdk.monsters.mode.Running && (this.targetx !== this.x || this.targety !== this.y));
		}
	},
	isMoving: {
		get: function () {
			return (this.isWalking || this.isRunning);
		},
	},
	isFrozen: {
		get: function () {
			return this.getState(sdk.states.FrozenSolid);
		},
	},
	isChilled: {
		get: function () {
			return this.getState(sdk.states.Frozen);
		},
	},
	extraStrong: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.ExtraStrong);
		},
	},
	extraFast: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.ExtraFast);
		},
	},
	cursed: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.Cursed);
		},
	},
	magicResistant: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.MagicResistant);
		},
	},
	fireEnchanted: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.FireEnchanted);
		},
	},
	lightningEnchanted: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.LightningEnchanted);
		},
	},
	coldEnchanted: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.ColdEnchanted);
		},
	},
	manBurn: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.ManaBurn);
		},
	},
	teleportation: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.Teleportation);
		},
	},
	spectralHit: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.SpectralHit);
		},
	},
	stoneSkin: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.StoneSkin);
		},
	},
	multiShot: {
		get: function () {
			if (!this.isMonster) return false;
			return this.getEnchant(sdk.enchant.MultipleShots);
		},
	},
	resPenalty: {
		value: me.classic ? [0, 20, 50][me.diff] : [0, 40, 100][me.diff],
		writable: true
	},
	fireRes: {
		get: function () {
			let modifier = 0;
			if (this === me) {
				me.getState(sdk.states.ShrineResFire) && (modifier += 75);
			}
			return this.getStat(sdk.stats.FireResist) - me.resPenalty - modifier;
		}
	},
	coldRes: {
		get: function () {
			let modifier = 0;
			if (this === me) {
				me.getState(sdk.states.ShrineResCold) && (modifier += 75);
				me.getState(sdk.states.Thawing) && (modifier += 50);
			}
			return this.getStat(sdk.stats.ColdResist) - me.resPenalty - modifier;
		}
	},
	lightRes: {
		get: function () {
			let modifier = 0;
			if (this === me) {
				me.getState(sdk.states.ShrineResLighting) && (modifier += 75);
			}
			return this.getStat(sdk.stats.LightResist) - me.resPenalty - modifier;
		}
	},
	poisonRes: {
		get: function () {
			let modifier = 0;
			if (this === me) {
				me.getState(sdk.states.ShrineResPoison) && (modifier += 75);
				me.getState(sdk.states.Antidote) && (modifier += 50);
			}
			return this.getStat(sdk.stats.PoisonResist) - me.resPenalty - modifier;
		}
	},
	hpPercent: {
		get: function () {
			return Math.round(this.hp * 100 / this.hpmax);
		}
	},
	isEquipped: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.location === sdk.storage.Equipped;
		}
	},
	isEquippedCharm: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return (this.location === sdk.storage.Inventory && [sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(this.itemType));
		}
	},
	isInInventory: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.location === sdk.storage.Inventory && this.mode === sdk.items.mode.inStorage;
		}
	},
	isInStash: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.location === sdk.storage.Stash && this.mode === sdk.items.mode.inStorage;
		}
	},
	isInCube: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.location === sdk.storage.Cube && this.mode === sdk.items.mode.inStorage;
		}
	},
	isInStorage: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.mode === sdk.items.mode.inStorage && [sdk.storage.Inventory, sdk.storage.Cube, sdk.storage.Stash].includes(this.location);
		}
	},
	isInBelt: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.location === sdk.storage.Belt && this.mode === sdk.items.mode.inBelt;
		}
	},
	isOnMain: {
		get: function () {
			if (this.type !== sdk.unittype.Item || this.location !== sdk.storage.Equipped) return false;
			return [sdk.body.RightArm, sdk.body.LeftArm].includes(this.bodylocation);
		}
	},
	isOnSwap: {
		get: function () {
			if (this.type !== sdk.unittype.Item || this.location !== sdk.storage.Equipped) return false;
			return ((me.weaponswitch === sdk.player.slot.Main && [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary].includes(this.bodylocation))
				|| (me.weaponswitch === sdk.player.slot.Secondary && [sdk.body.RightArm, sdk.body.LeftArm].includes(this.bodylocation)));
		}
	},
	identified: {
		get: function () {
			// Can't tell, as it isn't an item
			if (this.type !== sdk.unittype.Item) return undefined;
			// Is also true for white items
			return this.getFlag(sdk.items.flags.Identified);
		}
	},
	ethereal: {
		get: function () {
			// Can't tell, as it isn't an item
			if (this.type !== sdk.unittype.Item) return undefined;
			return this.getFlag(sdk.items.flags.Ethereal);
		}
	},
	twoHanded: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return getBaseStat("items", this.classid, "2handed") === 1;
		}
	},
	oneOrTwoHanded: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return getBaseStat("items", this.classid, "1or2handed") === 1;
		}
	},
	strictlyTwoHanded: {
		get: function () {
			return this.twoHanded && !this.oneOrTwoHanded;
		}
	},
	runeword: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return !!this.getFlag(sdk.items.flags.Runeword);
		}
	},
	questItem: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return (this.itemType === sdk.items.type.Quest
			|| [
				sdk.items.quest.HoradricMalus, sdk.items.quest.WirtsLeg, sdk.items.quest.HoradricStaff, sdk.items.quest.ShaftoftheHoradricStaff,
				sdk.items.quest.ViperAmulet, sdk.items.quest.DecoyGidbinn, sdk.items.quest.TheGidbinn, sdk.items.quest.KhalimsFlail,
				sdk.items.quest.KhalimsWill, sdk.items.quest.HellForgeHammer, sdk.items.quest.StandardofHeroes
			].includes(this.classid));
		}
	},
	sellable: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			if (this.getItemCost(sdk.items.cost.ToSell) <= 1) return false;
			return (!this.questItem
				&& [
					sdk.items.quest.KeyofTerror, sdk.items.quest.KeyofHate, sdk.items.quest.KeyofDestruction, sdk.items.quest.DiablosHorn,
					sdk.items.quest.BaalsEye, sdk.items.quest.MephistosBrain, sdk.items.quest.TokenofAbsolution, sdk.items.quest.TwistedEssenceofSuffering,
					sdk.items.quest.ChargedEssenceofHatred, sdk.items.quest.BurningEssenceofTerror, sdk.items.quest.FesteringEssenceofDestruction
				].indexOf(this.classid) === -1);
		}
	},
	lowquality: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.LowQuality;
		},
	},
	normal: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Normal;
		},
	},
	superior: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Superior;
		},
	},
	magic: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Magic;
		},
	},
	set: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Set;
		},
	},
	rare: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Rare;
		},
	},
	unique: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Unique;
		},
	},
	crafted: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.quality === sdk.items.quality.Crafted;
		},
	},
	sockets: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return this.getStat(sdk.stats.NumSockets);
		},
	},
	onGroundOrDropping: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return (this.mode === sdk.items.mode.onGround || this.mode === sdk.items.mode.Dropping);
		},
	},
	isShield: {
		get: function () {
			if (this.type !== sdk.unittype.Item) return false;
			return [sdk.items.type.Shield, sdk.items.type.AuricShields, sdk.items.type.VoodooHeads].includes(this.itemType);
		},
	},
});

Unit.prototype.hasEnchant = function (...enchants) {
	if (!this.isMonster) return false;
	for (let enchant of enchants) {
		if (this.getEnchant(enchant)) return true;
	}
	return false;
};

Unit.prototype.usingShield = function () {
	if (this.type > sdk.unittype.Monster) return false;
	// always switch to main hand if we are checking ourselves
	this === me && me.weaponswitch !== sdk.player.slot.Main && me.switchWeapons(sdk.player.slot.Main);
	let shield = this.getItemsEx(-1, sdk.items.mode.Equipped).filter(s => s.isShield).first();
	return !!shield;
};

Object.defineProperties(me, {
	inShop: {
		get: function () {
			if (getUIFlag(sdk.uiflags.Shop)) return true;
			if (!Config.PacketShopping) return false;
			let npc = getInteractedNPC();
			return !!(npc && npc.itemcount > 0);
		}
	},
	walking: {
		get: function () {
			return me.runwalk === sdk.player.move.Walk;
		}
	},
	running: {
		get: function () {
			return me.runwalk === sdk.player.move.Run;
		}
	},
	deadOrInSequence: {
		get: function () {
			return me.dead || me.mode === sdk.player.mode.SkillActionSequence;
		}
	},
	moving: {
		get: function () {
			return [sdk.player.mode.Walking, sdk.player.mode.Running, sdk.player.mode.WalkingInTown].includes(me.mode);
		}
	},
	highestAct: {
		get: function () {
			let acts = [true,
				me.getQuest(sdk.quest.id.AbleToGotoActII, sdk.quest.states.Completed),
				me.getQuest(sdk.quest.id.AbleToGotoActIII, sdk.quest.states.Completed),
				me.getQuest(sdk.quest.id.AbleToGotoActIV, sdk.quest.states.Completed),
				me.getQuest(sdk.quest.id.AbleToGotoActV, sdk.quest.states.Completed)];
			let index = acts.findIndex((i) => !i); // find first false, returns between 1 and 5
			return index === -1 ? 5 : index;
		}
	},
	highestQuestDone: {
		get: function () {
			for (let i = sdk.quest.id.Respec; i >= sdk.quest.id.SpokeToWarriv; i--) {
				if (me.getQuest(i, sdk.quest.states.Completed)) {
					return i;
				}

				// check if we've completed main part but not used our reward
				if ([sdk.quest.id.RescueonMountArreat, sdk.quest.id.SiegeOnHarrogath, sdk.quest.id.ToolsoftheTrade].includes(i) && me.getQuest(i, sdk.quest.states.ReqComplete)) {
					return i;
				}
			}
			return undefined;
		}
	},
	staminaPercent: {
		get: function () {
			return Math.round((me.stamina / me.staminamax) * 100);
		}
	},
	staminaDrainPerSec: {
		get: function () {
			let bonusReduction = me.getStat(sdk.stats.StaminaRecoveryBonus);
			let armorMalusReduction = 0; // TODO
			return 25 * Math.max(40 * (1 + armorMalusReduction / 10) * (100 - bonusReduction) / 100, 1) / 256;
		}
	},
	staminaTimeLeft: {
		get: function () {
			return me.stamina / me.staminaDrainPerSec;
		}
	},
	staminaMaxDuration: {
		get: function () {
			return me.staminamax / me.staminaDrainPerSec;
		}
	},
	FCR: {
		get: function () {
			return me.getStat(sdk.stats.FCR) - (!!Config ? Config.FCR : 0);
		}
	},
	FHR: {
		get: function () {
			return me.getStat(sdk.stats.FHR) - (!!Config ? Config.FHR : 0);
		}
	},
	FBR: {
		get: function () {
			return me.getStat(sdk.stats.FBR) - (!!Config ? Config.FBR : 0);
		}
	},
	IAS: {
		get: function () {
			return me.getStat(sdk.stats.IAS) - (!!Config ? Config.IAS : 0);
		}
	},
	shapeshifted: {
		get: function () {
			return me.getState(sdk.states.Wolf) || me.getState(sdk.states.Bear) || me.getState(sdk.states.Delerium);
		}
	},
	mpPercent: {
		get: function () {
			return Math.round(me.mp * 100 / me.mpmax);
		}
	},
	skillDelay: {
		get: function () {
			return me.getState(sdk.states.SkillDelay);
		}
	},
	classic: {
		get: function () {
			return me.gametype === sdk.game.gametype.Classic;
		}
	},
	expansion: {
		get: function () {
			return me.gametype === sdk.game.gametype.Expansion;
		}
	},
	softcore: {
		get: function () {
			return me.playertype === false;
		}
	},
	hardcore: {
		get: function () {
			return me.playertype === true;
		}
	},
	normal: {
		get: function () {
			return me.diff === sdk.difficulty.Normal;
		}
	},
	nightmare: {
		get: function () {
			return me.diff === sdk.difficulty.Nightmare;
		}
	},
	hell: {
		get: function () {
			return me.diff === sdk.difficulty.Hell;
		}
	},
	amazon: {
		get: function () {
			return me.classid === sdk.player.class.Amazon;
		}
	},
	sorceress: {
		get: function () {
			return me.classid === sdk.player.class.Sorceress;
		}
	},
	necromancer: {
		get: function () {
			return me.classid === sdk.player.class.Necromancer;
		}
	},
	paladin: {
		get: function () {
			return me.classid === sdk.player.class.Paladin;
		}
	},
	barbarian: {
		get: function () {
			return me.classid === sdk.player.class.Barbarian;
		}
	},
	druid: {
		get: function () {
			return me.classid === sdk.player.class.Druid;
		}
	},
	assassin: {
		get: function () {
			return me.classid === sdk.player.class.Assassin;
		}
	},
	// quest items
	wirtsleg: {
		get: function () {
			return me.getItem(sdk.quest.item.WirtsLeg);
		}
	},
	cube: {
		get: function () {
			return me.getItem(sdk.quest.item.Cube);
		}
	},
	shaft: {
		get: function () {
			return me.getItem(sdk.quest.item.ShaftoftheHoradricStaff);
		}
	},
	amulet: {
		get: function () {
			return me.getItem(sdk.quest.item.ViperAmulet);
		}
	},
	staff: {
		get: function () {
			return me.getItem(sdk.quest.item.HoradricStaff);
		}
	},
	completestaff: {
		get: function () {
			return me.getItem(sdk.quest.item.HoradricStaff);
		}
	},
	eye: {
		get: function () {
			return me.getItem(sdk.items.quest.KhalimsEye);
		}
	},
	brain: {
		get: function () {
			return me.getItem(sdk.quest.item.KhalimsBrain);
		}
	},
	heart: {
		get: function () {
			return me.getItem(sdk.quest.item.KhalimsHeart);
		}
	},
	khalimswill: {
		get: function () {
			return me.getItem(sdk.quest.item.KhalimsWill);
		}
	},
	khalimsflail: {
		get: function () {
			return me.getItem(sdk.quest.item.KhalimsFlail);
		}
	},
	malahspotion: {
		get: function () {
			return me.getItem(sdk.quest.item.MalahsPotion);
		}
	},
	scrollofresistance: {
		get: function () {
			return me.getItem(sdk.quest.item.ScrollofResistance);
		}
	},
	// quests
	den: {
		get: function () {
			return me.getQuest(sdk.quest.id.DenofEvil, sdk.quest.states.Completed);
		}
	},
	bloodraven: {
		get: function () {
			return me.getQuest(sdk.quest.id.SistersBurialGrounds, sdk.quest.states.Completed);
		}
	},
	smith: {
		get: function () {
			return me.getQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.Completed);
		}
	},
	cain: {
		get: function () {
			return me.getQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
		}
	},
	tristram: {
		get: function () {
			// update where this is used and change the state to be portal opened and me.cain to be quest completed
			return me.getQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed);
		}
	},
	countess: {
		get: function () {
			return me.getQuest(sdk.quest.id.ForgottenTower, sdk.quest.states.Completed);
		}
	},
	andariel: {
		get: function () {
			return me.getQuest(sdk.quest.id.AbleToGotoActII, sdk.quest.states.Completed);
		}
	},
	radament: {
		get: function () {
			return me.getQuest(sdk.quest.id.RadamentsLair, sdk.quest.states.Completed);
		}
	},
	horadricstaff: {
		get: function () {
			return me.getQuest(sdk.quest.id.TheHoradricStaff, sdk.quest.states.Completed);
		}
	},
	summoner: {
		get: function () {
			return me.getQuest(sdk.quest.id.TheSummoner, sdk.quest.states.Completed);
		}
	},
	duriel: {
		get: function () {
			return me.getQuest(sdk.quest.id.AbleToGotoActIII, sdk.quest.states.Completed);
		}
	},
	goldenbird: {
		get: function () {
			return me.getQuest(sdk.quest.id.TheGoldenBird, sdk.quest.states.Completed);
		}
	},
	lamessen: {
		get: function () {
			return me.getQuest(sdk.quest.id.LamEsensTome, sdk.quest.states.Completed);
		}
	},
	gidbinn: {
		get: function () {
			return me.getQuest(sdk.quest.id.BladeoftheOldReligion, sdk.quest.states.Completed);
		}
	},
	travincal: {
		get: function () {
			return me.getQuest(sdk.quest.id.KhalimsWill, sdk.quest.states.Completed);
		}
	},
	mephisto: {
		get: function () {
			return me.getQuest(sdk.quest.id.AbleToGotoActIV, sdk.quest.states.Completed);
		}
	},
	izual: {
		get: function () {
			return me.getQuest(sdk.quest.id.TheFallenAngel, sdk.quest.states.Completed);
		}
	},
	hellforge: {
		get: function () {
			return me.getQuest(sdk.quest.id.HellsForge, sdk.quest.states.Completed);
		}
	},
	diablo: {
		get: function () {
			return me.getQuest(sdk.quest.id.TerrorsEnd, sdk.quest.states.Completed);
		}
	},
	shenk: {
		get: function () {
			return me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.Completed);
		}
	},
	larzuk: {
		get: function () {
			return me.getQuest(sdk.quest.id.SiegeOnHarrogath, sdk.quest.states.ReqComplete);
		}
	},
	savebarby: {
		get: function () {
			return me.getQuest(sdk.quest.id.RescueonMountArreat, sdk.quest.states.Completed);
		}
	},
	barbrescue: {
		get: function () {
			return me.getQuest(sdk.quest.id.RescueonMountArreat, sdk.quest.states.Completed);
		}
	},
	anya: {
		get: function () {
			return me.getQuest(sdk.quest.id.PrisonofIce, sdk.quest.states.Completed);
		}
	},
	ancients: {
		get: function () {
			return me.getQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.Completed);
		}
	},
	baal: {
		get: function () {
			return me.getQuest(sdk.quest.id.EyeofDestruction, sdk.quest.states.Completed);
		}
	},
	// Misc
	cows: {
		get: function () {
			return me.getQuest(sdk.quest.id.TheSearchForCain, 10);
		}
	},
	respec: {
		get: function () {
			return me.getQuest(sdk.quest.id.Respec, sdk.quest.states.Completed);
		}
	},
	diffCompleted: {
		get: function () {
			return !!((me.classic && me.diablo) || me.baal);
		}
	},
});

// something in here is causing demon imps in barricade towers to be skipped - todo: figure out what
Unit.prototype.__defineGetter__("attackable", function () {
	if (this === undefined || !copyUnit(this).x) return false;
	if (this.type > sdk.unittype.Monster) return false;
	// must be in same area
	if (this.area !== me.area) return false;
	// player and they are hostile
	if (this.type === sdk.unittype.Player && getPlayerFlag(me.gid, this.gid, 8) && !this.dead) return true;
	// Dead monster
	if (this.hp === 0 || this.mode === sdk.monsters.mode.Death || this.mode === sdk.monsters.mode.Dead) return false;
	// Friendly monster/NPC
	if (this.getStat(sdk.stats.Alignment) === 2) return false;
	// catapults were returning a level of 0 and hanging up clear scripts
	if (this.charlvl < 1) return false;
	// neverCount base stat - hydras, traps etc.
	if (!this.isMonsterObject && getBaseStat("monstats", this.classid, "neverCount")) {
		return false;
	}
	// Monsters that are in flight
	if ([
		sdk.monsters.CarrionBird1, sdk.monsters.UndeadScavenger, sdk.monsters.HellBuzzard,
		sdk.monsters.WingedNightmare, sdk.monsters.SoulKiller2/*feel like this one is wrong*/,
		sdk.monsters.CarrionBird2].includes(this.classid) && this.mode === sdk.monsters.mode.UsingSkill1) {
		return false;
	}
	// Monsters that are Burrowed/Submerged
	if ([
		sdk.monsters.SandMaggot, sdk.monsters.RockWorm, sdk.monsters.Devourer, sdk.monsters.GiantLamprey, sdk.monsters.WorldKiller2,
		sdk.monsters.WaterWatcherLimb, sdk.monsters.RiverStalkerLimb, sdk.monsters.StygianWatcherLimb,
		sdk.monsters.WaterWatcherHead, sdk.monsters.RiverStalkerHead, sdk.monsters.StygianWatcherHead].includes(this.classid) && this.mode === sdk.monsters.mode.Spawning) {
		return false;
	}

	return [sdk.monsters.ThroneBaal, sdk.monsters.Cow/*an evil force*/].indexOf(this.classid) === -1;
});

Unit.prototype.__defineGetter__("curseable", function () {
	// must be player or monster
	if (this === undefined || !copyUnit(this).x || this.type > 1) return false;
	// Dead monster
	if (this.hp === 0 || this.mode === sdk.monsters.mode.Death || this.mode === sdk.monsters.mode.Dead) return false;
	// attract can't be overridden
	if (this.getState(sdk.states.Attract)) return false;
	// "Possessed"
	if (!!this.name && !!this.name.includes(getLocaleString(sdk.locale.text.Possessed))) return false;
	if (this.type === sdk.unittype.Player && getPlayerFlag(me.gid, this.gid, 8) && !this.dead) return true;
	// Friendly monster/NPC
	if (this.getStat(sdk.stats.Alignment) === 2) return false;
	// catapults were returning a level of 0 and hanging up clear scripts
	if (this.charlvl < 1) return false;
	// Monsters that are in flight
	if ([
		sdk.monsters.CarrionBird1, sdk.monsters.UndeadScavenger, sdk.monsters.HellBuzzard,
		sdk.monsters.WingedNightmare, sdk.monsters.SoulKiller2/*feel like this one is wrong*/,
		sdk.monsters.CarrionBird2].includes(this.classid) && this.mode === sdk.monsters.mode.UsingSkill1) {
		return false;
	}
	// Monsters that are Burrowed/Submerged
	if ([
		sdk.monsters.SandMaggot, sdk.monsters.RockWorm, sdk.monsters.Devourer, sdk.monsters.GiantLamprey, sdk.monsters.WorldKiller2,
		sdk.monsters.WaterWatcherLimb, sdk.monsters.RiverStalkerLimb, sdk.monsters.StygianWatcherLimb,
		sdk.monsters.WaterWatcherHead, sdk.monsters.RiverStalkerHead, sdk.monsters.StygianWatcherHead].includes(this.classid) && this.mode === sdk.monsters.mode.Spawning) {
		return false;
	}

	return (!this.isMonsterObject && !this.isMonsterEgg && !this.isMonsterNest && !this.isBaalTentacle && [
		sdk.monsters.WaterWatcherLimb, sdk.monsters.WaterWatcherHead, sdk.monsters.Flavie, sdk.monsters.ThroneBaal, sdk.monsters.Cow
	].indexOf(this.classid) === -1);
});

Unit.prototype.__defineGetter__("scareable", function () {
	return this.curseable && !(this.isSpecial) && this.classid !== sdk.monsters.ListerTheTormenter;
});

Unit.prototype.getMobCount = function (range = 10, coll = 0, type = 0, noSpecialMobs = false) {
	if (this === undefined) return 0;
	const _this = this;
	return getUnits(sdk.unittype.Monster)
		.filter(function (mon) {
			return mon.attackable && getDistance(_this, mon) < range
				&& (!type || ((type & mon.spectype) && !noSpecialMobs))
				&& (!coll || !checkCollision(_this, mon, coll));
		}).length;
};

Unit.prototype.checkForMobs = function (givenSettings = {}) {
	if (this === undefined) return 0;
	const _this = this;
	const settings = Object.assign({
		range: 10,
		count: 1,
		coll: 0,
		spectype: sdk.monsters.spectype.All
	}, givenSettings);
	let mob = Game.getMonster();
	let count = 0;
	if (mob) {
		do {
			if (getDistance(_this, mob) < settings.range && mob.attackable
				&& (!settings.spectype || ((settings.spectype & mob.spectype)))
				&& (!settings.coll || !checkCollision(_this, mob, settings.coll))) {
				count++;
			}
			if (count >= settings.count) {
				return true;
			}
		} while (mob.getNext());
	}
	return false;
};

/**
 * @description check if unit is in an area
 * @param {number} area
 * @returns {boolean} if unit is in specified area
 */
Unit.prototype.inArea = function (area = 0) {
	if (this === undefined) return false;
	return this.area === area;
};

// should this be broken into two functions for item vs unit (player, monster, ect)
/**
 * @description check if unit is a certain unit by classid
 * @param {number} classid
 * @returns {boolean} if unit matches the specified classid
 */
Unit.prototype.isUnit = function (classid = -1) {
	if (this === undefined) return false;
	return this.classid === classid;
};

/**
 * 
 * @param {any} key
 * @returns value of key if it exists
 * @description replicate .? operator of modern js since d2bs doesn't have it
 */
Object.prototype.test = function (key, last = false) {
	if (this === undefined) return false;
	return this[key] !== undefined ? this[key] : last ? null : {};
};
Object.defineProperty(Object.prototype, "test", { enumerable: false });

PresetUnit.prototype.realCoords = function () {
	return {
		area: this.level, // for some reason, preset units names the area "level"
		x: this.roomx * 5 + this.x,
		y: this.roomy * 5 + this.y,
	};
};
