/**
*  @filename    Me.js
*  @author      theBGuy
*  @desc        'me' prototypes
*
*/

// Ensure these are in polyfill.js
!isIncluded("Polyfill.js") && include("Polyfill.js");

/**
 * @desciption Set me.runwalk to 0 (walk)
 * @returns {void}
 */
me.walk = () => me.runwalk = sdk.player.move.Walk;

/**
 * @desciption Set me.runwalk to 1 (run)
 * @returns {void}
 */
me.run = () => me.runwalk = sdk.player.move.Run;

/**
 * @description Calling me.ping can bug sometimes so check if game is in ready state.
 * - Single-Player returns static ping of 25.
 * - Game not ready returns ping of 250
 * - ping < 10 returns 50
 * @returns {number} pingDelay
 */
me.getPingDelay = function () {
	// single-player
	if (!me.gameserverip) return 25;
	let pingDelay = me.gameReady ? me.ping : 250;
	pingDelay < 10 && (pingDelay = 50);
	return pingDelay;
};

/**
 * @description Find an item by classid, mode, loc, quality
 * @param {number} id 
 * @param {number} [mode] 
 * @param {number} [loc] 
 * @param {number} [quality] 
 * @returns {ItemUnit | false}
 */
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
			if (!loc || item.location === loc) {
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

/**
 * @param {number} slot - 0 (Primary) or 1 (Secondary)
 * @returns {boolean}
 */
me.switchWeapons = function (slot) {
	if (this.gametype === sdk.game.gametype.Classic || (slot !== undefined && this.weaponswitch === slot)) {
		return true;
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
			if (me.mode === sdk.player.mode.SkillActionSequence) {
				while (me.mode === sdk.player.mode.SkillActionSequence) {
					delay(3);
				}
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

me.needPotions = function () {
	// we aren't using MinColumn if none of the values are set
	if (!Config.MinColumn.some(el => el > 0)) return false;
	// no hp pots or mp pots in Config.BeltColumn (who uses only rejuv pots?)
	if (!Config.BeltColumn.some(el => ["hp", "mp"].includes(el))) return false;
	
	// Start
	if (me.charlvl > 2 && me.gold > 1000) {
		const pots = {
			hp: [],
			mp: [],
		};
		me.getItemsEx(-1, sdk.items.mode.inBelt)
			.filter(p => [sdk.items.type.HealingPotion, sdk.items.type.ManaPotion].includes(p.itemType) && p.x < 4)
			.forEach(p => {
				if (p.itemType === sdk.items.type.HealingPotion) {
					pots.hp.push(p);
				} else if (p.itemType === sdk.items.type.ManaPotion) {
					pots.mp.push(p);
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
};

/** @returns {ItemUnit | null} */
me.getTpTool = function () {
	const items = me.getItemsEx(-1, sdk.items.mode.inStorage)
		.filter((item) => item.isInInventory && [sdk.items.ScrollofTownPortal, sdk.items.TomeofTownPortal].includes(item.classid));
	if (!items.length) return null;
	let tome = items.find((i) => i.classid === sdk.items.TomeofTownPortal && i.getStat(sdk.stats.Quantity) > 0);
	if (tome) return tome;
	let scroll = items.find((i) => i.classid === sdk.items.ScrollofTownPortal);
	return scroll ? scroll : null;
};

/** @returns {ItemUnit | null} */
me.getIdTool = function () {
	const items = me.getItemsEx()
		.filter((i) => i.isInInventory && [sdk.items.ScrollofIdentify, sdk.items.TomeofIdentify].includes(i.classid));
	if (!items.length) return null;
	let tome = items.find((i) => i.isInInventory && i.classid === sdk.items.TomeofIdentify && i.getStat(sdk.stats.Quantity) > 0);
	if (tome) return tome;
	let scroll = items.find((i) => i.isInInventory && i.classid === sdk.items.ScrollofIdentify);
	return scroll ? scroll : null;
};

/** @returns {boolean} */
me.canTpToTown = function () {
	// can't tp if dead
	if (me.dead) return false;
	const myArea = me.area;
	let badAreas = [
		sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.KurastDocktown,
		sdk.areas.PandemoniumFortress, sdk.areas.Harrogath, sdk.areas.ArreatSummit, sdk.areas.UberTristram
	];
	// can't tp from town or Uber Trist, and shouldn't tp from arreat summit
	if (badAreas.includes(myArea)) return false;
	// If we made it this far, we can only tp if we even have a tp
	return !!me.getTpTool();
};

/**
 * @description Check if healing is needed, based on character config
 * @returns {boolean}
 */
me.needHealing = function () {
	if (me.hpPercent <= Config.HealHP || me.mpPercent <= Config.HealMP) return true;
	if (!Config.HealStatus) return false;
	// Status effects
	return ([
		sdk.states.Poison,
		sdk.states.AmplifyDamage,
		sdk.states.Frozen,
		sdk.states.Weaken,
		sdk.states.Decrepify,
		sdk.states.LowerResist
	].some((state) => me.getState(state)));
};

me.getTome = function (id) {
	const tome = me.findItem(id, sdk.items.mode.inStorage, sdk.storage.Inventory);
	return tome ? tome : null;
};

me.getUnids = function () {
	let list = [];
	let item = me.getItem(-1, sdk.items.mode.inStorage);

	if (!item) return [];

	do {
		if (item.isInInventory && !item.identified) {
			list.push(copyUnit(item));
		}
	} while (item.getNext());

	return list;
};

// Identify items while in the field if we have a id tome
me.fieldID = function () {
	let list = me.getUnids();
	if (!list) return false;

	let tome = me.getTome(sdk.items.TomeofIdentify);
	if (!tome || tome.getStat(sdk.stats.Quantity) < list.length) return false;

	while (list.length > 0) {
		let item = list.shift();
		let result = Pickit.checkItem(item);

		// unid item that should be identified
		if (result.result === Pickit.Result.UNID) {
			Town.identifyItem(item, tome, Config.FieldID.PacketID);
			delay(me.ping + 1);
			result = Pickit.checkItem(item);

			switch (result.result) {
			case Pickit.Result.UNWANTED:
				Item.logger("Dropped", item, "fieldID");

				if (Config.DroppedItemsAnnounce.Enable && Config.DroppedItemsAnnounce.Quality.includes(item.quality)) {
					say("Dropped: [" + Item.qualityToName(item.quality).capitalize() + "] " + item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim());

					if (Config.DroppedItemsAnnounce.LogToOOG && Config.DroppedItemsAnnounce.OOGQuality.includes(item.quality)) {
						Item.logItem("Field Dropped", item, result.line);
					}
				}

				item.drop();

				break;
			case Pickit.Result.WANTED:
				Item.logger("Field Kept", item);
				Item.logItem("Field Kept", item, result.line);

				break;
			default:
				break;
			}
		}
	}

	delay(200);
	me.cancel();

	return true;
};

me.switchToPrimary = function () {
	if (me.classic) return true;
	return me.switchWeapons(Attack.getPrimarySlot());
};

Object.defineProperties(me, {
	maxNearMonsters: {
		get: function () {
			return Math.floor((4 * (1 / me.hpmax * me.hp)) + 1);
		}
	},
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
