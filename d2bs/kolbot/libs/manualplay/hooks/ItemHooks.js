/**
*  @filename    ItemHooks.js
*  @author      theBGuy
*  @desc        Item hooks for MapThread
*
*/

// todo - clean up all the map stuff
const ItemHooks = {
	enabled: true,
	pickitEnabled: false,
	modifier: 16 * (Number(!!me.diff) + Number(!!me.gamepassword) + Number(!!me.gametype) + Number(!!me.gamename)),
	hooks: [],
	ignoreItemTypes: [
		sdk.items.type.Gold, sdk.items.type.BowQuiver, sdk.items.type.CrossbowQuiver, sdk.items.type.Book, sdk.items.type.Gem, sdk.items.type.Scroll,
		sdk.items.type.MissilePotion, sdk.items.type.Key, sdk.items.type.Boots, sdk.items.type.Gloves, sdk.items.type.ThrowingKnife, sdk.items.type.ThrowingAxe,
		sdk.items.type.HealingPotion, sdk.items.type.ManaPotion, sdk.items.type.RejuvPotion, sdk.items.type.StaminaPotion, sdk.items.type.AntidotePotion,
		sdk.items.type.ThawingPotion, sdk.items.type.ChippedGem, sdk.items.type.FlawedGem, sdk.items.type.StandardGem, sdk.items.type.FlawlessGem, sdk.items.type.PerfectgGem,
		sdk.items.type.Amethyst, sdk.items.type.Diamond, sdk.items.type.Emerald, sdk.items.type.Ruby, sdk.items.type.Sapphire, sdk.items.type.Topaz, sdk.items.type.Skull
	],
	codeById: new Map(),
	codeByIdAndQuality: new Map(),
	itemColorCode: [],

	/**
	 * @param {number} id - classID of item 
	 * @param {string} setName 
	 * @param {string} uniqueName 
	 */
	addToCodeByClassIdAndQuality: function (id, setName = "", uniqueName = "") {
		if (!id || (!setName && !uniqueName)) return;
		// create our map structure
		if (!this.codeByIdAndQuality.get(id)) {
			let temp = [];
			setName && temp.push([sdk.items.quality.Set, setName]);
			uniqueName && temp.push([sdk.items.quality.Unique, uniqueName]);
			this.codeByIdAndQuality.set(id, new Map(temp));
		}
	},

	check: function () {
		if (!this.enabled) {
			this.flush();

			return;
		}

		for (let i = 0; i < this.hooks.length; i++) {
			if (!copyUnit(this.hooks[i].item).x) {
				for (let j = 0; j < this.hooks[i].hook.length; j++) {
					this.hooks[i].hook[j].remove();
				}

				this.hooks[i].name[0] && this.hooks[i].name[0].remove();
				this.hooks[i].vector[0] && this.hooks[i].vector[0].remove();
				this.hooks.splice(i, 1);
				i -= 1;
				this.flush();
			}
		}

		let item = Game.getItem();

		if (item) {
			try {
				do {
					if (item.area === ActionHooks.currArea && item.onGroundOrDropping
						&& (item.quality >= sdk.items.quality.Magic || ((item.normal || item.superior) && !this.ignoreItemTypes.includes(item.itemType)))) {
						if (this.pickitEnabled) {
							if ([Pickit.Result.UNWANTED, Pickit.Result.TRASH].indexOf(Pickit.checkItem(item).result) === -1) {
								!this.getHook(item) && this.add(item);
							}
						} else {
							!this.getHook(item) && this.add(item);
						}

						this.getHook(item) && this.update();
					} else {
						this.remove(item);
					}
				} while (item.getNext());
			} catch (e) {
				console.error(e);
				this.flush();
			}
		}
	},

	update: function () {
		for (let i = 0; i < this.hooks.length; i++) {
			this.hooks[i].vector[0].x = me.x;
			this.hooks[i].vector[0].y = me.y;
		}
	},

	/**
	 * @param {ItemUnit} item 
	 * @returns {string}
	 */
	getName: function (item) {
		let abbr = item.name.split(" ");
		let abbrName = "";

		if (abbr[1]) {
			abbrName += abbr[0] + "-";

			for (let i = 1; i < abbr.length; i++) {
				abbrName += abbr[i].substring(0, 1);
			}
		}

		return !!abbrName ? abbrName : item.name;
	},

	/**
	 * @description Create a new hook for a item with custom color and code based on type/quality/classid
	 * @param {ItemUnit} item 
	 * @todo maybe make class wrappers for hooks and turn the hook array into a map?
	 */
	newHook: function (item) {
		let color = 0, code = "", arr = [], name = [], vector = [];
		let eth = (item.ethereal ? "Eth: " : "");

		switch (item.quality) {
		case sdk.items.quality.Normal:
		case sdk.items.quality.Superior:
			switch (item.itemType) {
			case sdk.items.type.Quest:
				color = 0x9A;
				code += (this.codeById.get(item.classid) || "ÿc8" + item.fname);

				break;
			case sdk.items.type.Rune:
				if (item.classid >= sdk.items.runes.Vex) {
					[color, code] = [0x9B, "ÿc;" + item.fname];
				} else if (item.classid >= sdk.items.runes.Lum) {
					[color, code] = [0x9A, "ÿc8" + item.fname];
				} else {
					[color, code] = [0xA1, item.fname];
				}

				break;
			default:
				if (item.name && item.sockets !== 1) {
					color = 0x20;

					if (item.runeword) {
						code = item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "");
					} else {
						code = "ÿc0" + (item.sockets > 0 ? "[" + item.sockets + "]" : "");
						code += this.getName(item);
						item.itemType === sdk.items.type.AuricShields && (code += "[R: " + item.getStat(sdk.stats.FireResist) + "]");
						code += "(" + item.ilvl + ")";
					}
				}

				break;
			}

			break;
		case sdk.items.quality.Set:
		case sdk.items.quality.Unique:
			({color, code} = this.itemColorCode[item.quality]);

			if (this.codeById.has(item.classid)) {
				code += this.codeById.get(item.classid);
			}

			switch (item.classid) {
			case sdk.items.Ring:
			case sdk.items.Amulet:
				code += item.name + "(" + item.ilvl + ")";
				
				break;
			default:
				{
					let check = this.codeByIdAndQuality.get(item.classid);
					code += ((check && check.get(item.quality)) || item.name);
				}
				
				break;
			}

			break;
		case sdk.items.quality.Magic:
		case sdk.items.quality.Rare:
			if (item.name) {
				({color, code} = this.itemColorCode[item.quality]);

				code += (item.sockets > 0 ? "[" + item.sockets + "]" : "");
				code += this.getName(item);
				code += "(" + item.ilvl + ")";
			}
			
			break;
		}

		!!code && name.push(new Text(eth + code, 665 + Hooks.resfix.x, 104 + this.modifier + (this.hooks.length * 14), color, 0, 0));
		vector.push(new Line(me.x, me.y, item.x, item.y, color, true));
		arr.push(new Line(item.x - 3, item.y, item.x + 3, item.y, color, true));
		arr.push(new Line(item.x, item.y - 3, item.x, item.y + 3, color, true));

		return {
			itemLoc: arr,
			itemName: name,
			vector: vector,
		};
	},

	/**
	 * Add new item hook to our hook array
	 * @param {ItemUnit} item 
	 */
	add: function (item) {
		if (item === undefined || !item.classid) {
			return;
		}

		let temp = this.newHook(item);

		this.hooks.push({
			item: copyUnit(item),
			area: item.area,
			hook: temp.itemLoc,
			name: temp.itemName,
			vector: temp.vector,
		});
	},

	/**
	 * Get item hook if it exists based on item parameters gid
	 * @param {ItemUnit} item 
	 * @returns {{ item: ItemUnit, area: number, hook: Line, name: Text, vector: Line} | false}
	 */
	getHook: function (item) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].item.gid === item.gid) {
				return this.hooks[i].hook;
			}
		}

		return false;
	},

	/**
	 * @param {ItemUnit} item 
	 * @returns {boolean}
	 */
	remove: function (item) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].item.gid === item.gid) {
				for (let j = 0; j < this.hooks[i].hook.length; j++) {
					this.hooks[i].hook[j].remove();
				}
				
				this.hooks[i].name[0] && this.hooks[i].name[0].remove();
				this.hooks[i].vector[0] && this.hooks[i].vector[0].remove();
				this.hooks.splice(i, 1);

				return true;
			}
		}

		return false;
	},

	flush: function () {
		while (this.hooks.length) {
			for (let j = 0; j < this.hooks[0].hook.length; j++) {
				this.hooks[0].hook[j].remove();
			}

			this.hooks[0].name[0] && this.hooks[0].name[0].remove();
			this.hooks[0].vector[0] && this.hooks[0].vector[0].remove();
			this.hooks.shift();
		}
	}
};

/**
 * Unique Items
 */
ItemHooks.codeById.set(sdk.items.BattleAxe, "The Chieftain");
ItemHooks.codeById.set(sdk.items.Falchion, "Gleamscythe");
ItemHooks.codeById.set(sdk.items.BurntWand, "Suicide Branch");
ItemHooks.codeById.set(sdk.items.PetrifiedWand, "Carin Shard");
ItemHooks.codeById.set(sdk.items.TombWand, "King Leoric's Arm");
ItemHooks.codeById.set(sdk.items.Quarterstaff, "Ribcracker");
ItemHooks.codeById.set(sdk.items.EdgeBow, "Skystrike");
ItemHooks.codeById.set(sdk.items.GreaterTalons, "Bartuc's");
ItemHooks.codeById.set(sdk.items.WristSword, "Jade Talon");
ItemHooks.codeById.set(sdk.items.BattleCestus, "Shadow Killer");
ItemHooks.codeById.set(sdk.items.FeralClaws, "Firelizard's");
ItemHooks.codeById.set(sdk.items.EttinAxe, "Rune Master");
ItemHooks.codeById.set(sdk.items.LichWand, "Boneshade");
ItemHooks.codeById.set(sdk.items.UnearthedWand, "Death's Web");
ItemHooks.codeById.set(sdk.items.FlyingAxe, "Gimmershred");
ItemHooks.codeById.set(sdk.items.WingedKnife, "Warshrike");
ItemHooks.codeById.set(sdk.items.WingedAxe, "Lacerator");
ItemHooks.codeById.set(sdk.items.Thresher, "Reaper's Toll");
ItemHooks.codeById.set(sdk.items.CrypticAxe, "Tomb Reaver");
ItemHooks.codeById.set(sdk.items.GiantThresher, "Stormspire");
ItemHooks.codeById.set(sdk.items.ArchonStaff, "Mang Song's");
ItemHooks.codeById.set(sdk.items.CrusaderBow, "Eaglehorn");
ItemHooks.codeById.set(sdk.items.WardBow, "Ward Bow");
ItemHooks.codeById.set(sdk.items.HydraBow, "Windforce");
ItemHooks.codeById.set(sdk.items.CeremonialBow, "Lycander's Aim");
ItemHooks.codeById.set(sdk.items.CeremonialPike, "Lycander's Pike");
ItemHooks.codeById.set(sdk.items.CeremonialJavelin, "Titan's Revenge");
ItemHooks.codeById.set(sdk.items.EldritchOrb, "Eschuta's");
ItemHooks.codeById.set(sdk.items.DimensionalShard, "Death's Fathom");
ItemHooks.codeById.set(sdk.items.MatriarchalBow, "Bloodraven's");
ItemHooks.codeById.set(sdk.items.MatriarchalSpear, "Stoneraven");
ItemHooks.codeById.set(sdk.items.MatriarchalJavelin, "Thunder Stroke");
ItemHooks.codeById.set(sdk.items.LightPlatedBoots, "Goblin Toe");
ItemHooks.codeById.set(sdk.items.Sallet, "Rockstopper");
ItemHooks.codeById.set(sdk.items.GhostArmor, "Spirit Shroud");
ItemHooks.codeById.set(sdk.items.SerpentskinArmor, "Vipermagi's");
ItemHooks.codeById.set(sdk.items.MeshArmor, "Shaftstop");
ItemHooks.codeById.set(sdk.items.RussetArmor, "Skullder's");
ItemHooks.codeById.set(sdk.items.MagePlate, "Que-Hegan's");
ItemHooks.codeById.set(sdk.items.SharkskinBoots, "Waterwalk");
ItemHooks.codeById.set(sdk.items.DemonHead, "Andariel's Vis");
ItemHooks.codeById.set(sdk.items.Tiara, "Kira's");
ItemHooks.codeById.set(sdk.items.Shako, "Harlequin Crest");
ItemHooks.codeById.set(sdk.items.WireFleece, "Gladiator's Bane");
ItemHooks.codeById.set(sdk.items.ScarabshellBoots, "Sandstorm Trek's");
ItemHooks.codeById.set(sdk.items.BoneweaveBoots, "Marrowwalk");
ItemHooks.codeById.set(sdk.items.MyrmidonGreaves, "Shadow Dancer");
ItemHooks.codeById.set(sdk.items.TotemicMask, "Jalal's");
ItemHooks.codeById.set(sdk.items.SlayerGuard, "Arreat's Face");
ItemHooks.codeById.set(sdk.items.GildedShield, "HoZ");
ItemHooks.codeById.set(sdk.items.HierophantTrophy, "Homunculus");
ItemHooks.codeById.set(sdk.items.BloodSpirit, "Cerebus");
ItemHooks.codeById.set(sdk.items.EarthSpirit, "Spirit Keeper");
ItemHooks.codeById.set(sdk.items.FuryVisor, "Wolfhowl");
ItemHooks.codeById.set(sdk.items.DestroyerHelm, "Demonhorn's");
ItemHooks.codeById.set(sdk.items.ConquerorCrown, "Halaberd's");
ItemHooks.codeById.set(sdk.items.SacredRondache, "Alma Negra");
ItemHooks.codeById.set(sdk.items.ZakarumShield, "Dragonscale");
ItemHooks.codeById.set(sdk.items.BloodlordSkull, "Darkforce");
ItemHooks.codeById.set(sdk.items.SuccubusSkull, "Boneflame");
ItemHooks.codeById.set(sdk.items.SmallCharm, "Annihilus");
ItemHooks.codeById.set(sdk.items.LargeCharm, "Hellfire Torch");
ItemHooks.codeById.set(sdk.items.GrandCharm, "Gheed's");
ItemHooks.codeById.set(sdk.items.Jewel, "Facet");

/**
 * Misc Items
 */
ItemHooks.codeById.set(sdk.items.quest.TokenofAbsolution, "ÿc8Token");
ItemHooks.codeById.set(sdk.items.quest.TwistedEssenceofSuffering, "ÿc3Ess-Of-Suffering");
ItemHooks.codeById.set(sdk.items.quest.ChargedEssenceofHatred, "ÿc7Ess-Of-Hatred");
ItemHooks.codeById.set(sdk.items.quest.BurningEssenceofTerror, "ÿc1Ess-Of-Terror");
ItemHooks.codeById.set(sdk.items.quest.FesteringEssenceofDestruction, "ÿc3Ess-Of-Destruction");

/**
 * Set/Unique Items
 */
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.JaggedStar, "Aldur's Wep", "Moonfall");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.HuntersGuise, "Aldur's Helm");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.ShadowPlate, "Aldur's Armor", "Steel Carapace");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BattleBoots, "Aldur's Boots", "War Trav's");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Caduceus, "Griswold's Wep", "Moonfall");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Corona, "Griswold's Helm", "Crown of Ages");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.OrnatePlate, "Griswold's Armor", "Corpsemourn");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.VortexShield, "Griswold's Shield");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.OgreMaul, "IK Maul", "Windhammer");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.AvengerGuard, "IK Helm");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SacredArmor, "IK Armor");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.WarGauntlets, "IK Gloves", "HellMouth");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.WarBoots, "IK Boots", "Gore Rider");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.GrandMatronBow, "Mavina's Bow");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.KrakenShell, "Mavina's Armor", "Leviathan");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Diadem, "Mavina's Helm", "Griffon's Eye");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SharkskinBelt, "Mavina's Belt", "Razortail");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BattleGauntlets, "Mavina's Gloves", "Lava Gout");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.ScissorsKatar, "Natalya's Wep");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.LoricatedMail, "Natalya's Armor");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.GrimHelm, "Natalya's Helm", "Vamp Gaze");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.MeshBoots, "Natalya's Boots", "Silkweave");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SwirlingCrystal, "Tal Orb", "Occulus");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.LacqueredPlate, "Tal Armor");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.DeathMask, "Tal Helm", "Blackhorn's");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.MeshBelt, "Tal Belt", "Gloom's Trap");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BoneVisage, "Trang Helm", "Giant Skull");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.ChaosArmor, "Trang Armor", "Black Hades");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.TrollBelt, "Trang Belt");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.HeavyBracers, "Trang Gloves", "Ghoulhide");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.CantorTrophy, "Trang Shield");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.ColossusBlade, "Bul-Kathos Blade", "Grandfather");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.MythicalSword, "Bul-Kathos Sword");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.WarHat, "Cow King's Helm", "Peasant Crown");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.StuddedLeather, "Cow King's Armor", "Twitchthroe");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.HeavyBoots, null, "Gorefoot");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Mace, "Heavens's Wep", "Crushflange");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SpiredHelm, "Heavens's Helm", "Nightwing's");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Cuirass, "Heavens's Armor", "Duriel's Shell");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Ward, "Heavens's Shield");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Bill, "Hwanin's Bill", "Blackleach");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.TigulatedMail, "Hwanin's Armor", "Crow Caw");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.GrandCrown, "Hwanin's Helm", "Crown of Thieves");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Belt, null, "Nightsmoke");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.HellforgePlate, "Naj's Armor");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.ElderStaff, "Naj's Staff", "Ondal's Wisdom");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Circlet, "Naj's Helm", "Moonfall");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SmallShield, null, "Umbral Disk");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.WingedHelm, "G-Face", "Valk Wing");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.HeavyBelt, "Orphan's Belt");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.HeavyGloves, null, "Bloodfist");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.CrypticSword, "Sazabi's Wep", "Frostwind");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BalrogSkin, "Sazabi's Armor", "Arkaine's");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BreastPlate, null, "Venom Ward");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.GothicShield, null, "The Ward");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.DuskShroud, "Disciple's Armor", "Ormus Robe's");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.MithrilCoil, "Disciple's Belt", "Verdungo's");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BrambleMitts, "Disciple's Gloves");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.DemonhideBoots, "Disciple's Boots", "Infernostride");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.RingMail, "Angelic's Armor", "Darkglow");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Sabre, "Angelic's Wep", "Krintiz");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SkullCap, "Arcanna's Helm", "Tarnhelm");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.LightPlate, "Arcanna's Armor", "Heavenly Garb");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.WarStaff, "Arcanna's Staff", "Iron Jang Bong");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.LightGauntlets, "Artic's Gloves", "Magefist");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.LightBelt, "Artic's Belt", "Snakecord");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.QuiltedArmor, "Artic's Armor", "Greyform");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.ShortWarBow, "Artic's Bow", "Hellclap");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.DoubleAxe, "Beserker's Axe", "Bladebone");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.SplintMail, "Beserker's Armor", "Iceblink");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Helm, "Beserker's Helm", "Coif of Glory");

/**
 * Tancred's
 */
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.BoneHelm, "Tancred's Skull", "Wormskull");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.FullPlateMail, "Tancred's Spine", "Goldskin");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.MilitaryPick, "Tancred's Crowbill", "Skull Splitter");
ItemHooks.addToCodeByClassIdAndQuality(sdk.items.Boots, "Tancred's Hobnails", "Hotspur");

/**
 * @todo the rest of the sets/uniques
 */

ItemHooks.itemColorCode[sdk.items.quality.Magic] = { color: 0x97, code: "ÿc3" };
ItemHooks.itemColorCode[sdk.items.quality.Set] = { color: 0x84, code: "ÿc2" };
ItemHooks.itemColorCode[sdk.items.quality.Rare] = { color: 0x6F, code: "ÿc9" };
ItemHooks.itemColorCode[sdk.items.quality.Unique] = { color: 0xA8, code: "ÿc4" };
