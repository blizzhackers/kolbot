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
	itemCodeByClassId: [],
	itemCodeByClassIdAndQuality: [],
	itemColorCode: [],

	addToCodeByClassIdAndQuality: function (id, setName = "", uniqueName = "") {
		if (!id) return;
		if (setName) {
			this.itemCodeByClassIdAndQuality[id] = [sdk.items.quality.Set];
			this.itemCodeByClassIdAndQuality[id][sdk.items.quality.Set] = setName;
		}
		if (uniqueName) {
			this.itemCodeByClassIdAndQuality[id] = [sdk.items.quality.Unique];
			this.itemCodeByClassIdAndQuality[id][sdk.items.quality.Unique] = uniqueName;
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

	newHook: function (item) {
		let color = 0, code = "", arr = [], name = [], vector = [];
		let eth = (item.ethereal ? "Eth: " : "");

		switch (item.quality) {
		case sdk.items.quality.Normal:
		case sdk.items.quality.Superior:
			switch (item.itemType) {
			case sdk.items.type.Quest:
				color = 0x9A;
				code += (!!this.itemCodeByClassId[item.classid] ? this.itemCodeByClassId[item.classid] : "ÿc8" + item.fname);

				break;
			case sdk.items.type.Rune:
				if (item.classid >= sdk.items.runes.Vex) {
					color = 0x9B;
					code = "ÿc;" + item.fname;
				} else if (item.classid >= sdk.items.runes.Lum) {
					color = 0x9A;
					code = "ÿc8" + item.fname;
				} else {
					color = 0xA1;
					code = item.fname;
				}

				break;
			default:
				if (item.name) {
					if (item.sockets === 1) {
						break;
					}

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

			if (!this.itemCodeByClassId[item.classid]) {
				switch (item.classid) {
				case sdk.items.Ring:
				case sdk.items.Amulet:
					code += item.name + "(" + item.ilvl + ")";
					
					break;
				default:
					code += (!!this.itemCodeByClassIdAndQuality[item.classid] ? this.itemCodeByClassIdAndQuality[item.classid][item.quality] : item.name);
					
					break;
				}
			} else {
				code += this.itemCodeByClassId[item.classid];
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

	getHook: function (item) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].item.gid === item.gid) {
				return this.hooks[i].hook;
			}
		}

		return false;
	},

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

// have to be set after ItemHooks is created
ItemHooks.itemCodeByClassId[sdk.items.BattleAxe] = "The Chieftain";
ItemHooks.itemCodeByClassId[sdk.items.Falchion] = "Gleamscythe";
ItemHooks.itemCodeByClassId[sdk.items.BurntWand] = "Suicide Branch";
ItemHooks.itemCodeByClassId[sdk.items.PetrifiedWand] = "Carin Shard";
ItemHooks.itemCodeByClassId[sdk.items.TombWand] = "King Leoric's Arm";
ItemHooks.itemCodeByClassId[sdk.items.Quarterstaff] = "Ribcracker";
ItemHooks.itemCodeByClassId[sdk.items.EdgeBow] = "Skystrike";
ItemHooks.itemCodeByClassId[sdk.items.GreaterTalons] = "Bartuc's";
ItemHooks.itemCodeByClassId[sdk.items.WristSword] = "Jade Talon";
ItemHooks.itemCodeByClassId[sdk.items.BattleCestus] = "Shadow Killer";
ItemHooks.itemCodeByClassId[sdk.items.FeralClaws] = "Firelizard's";
ItemHooks.itemCodeByClassId[sdk.items.EttinAxe] = "Rune Master";
ItemHooks.itemCodeByClassId[sdk.items.LichWand] = "Boneshade";
ItemHooks.itemCodeByClassId[sdk.items.UnearthedWand] = "Death's Web";
ItemHooks.itemCodeByClassId[sdk.items.FlyingAxe] = "Gimmershred";
ItemHooks.itemCodeByClassId[sdk.items.WingedKnife] = "Warshrike";
ItemHooks.itemCodeByClassId[sdk.items.WingedAxe] = "Lacerator";
ItemHooks.itemCodeByClassId[sdk.items.Thresher] = "Reaper's Toll";
ItemHooks.itemCodeByClassId[sdk.items.CrypticAxe] = "Tomb Reaver";
ItemHooks.itemCodeByClassId[sdk.items.GiantThresher] = "Stormspire";
ItemHooks.itemCodeByClassId[sdk.items.ArchonStaff] = "Mang Song's";
ItemHooks.itemCodeByClassId[sdk.items.CrusaderBow] = "Eaglehorn";
ItemHooks.itemCodeByClassId[sdk.items.WardBow] = "Ward Bow";
ItemHooks.itemCodeByClassId[sdk.items.HydraBow] = "Windforce";
ItemHooks.itemCodeByClassId[sdk.items.CeremonialBow] = "Lycander's Aim";
ItemHooks.itemCodeByClassId[sdk.items.CeremonialPike] = "Lycander's Pike";
ItemHooks.itemCodeByClassId[sdk.items.CeremonialJavelin] = "Titan's Revenge";
ItemHooks.itemCodeByClassId[sdk.items.EldritchOrb] = "Eschuta's";
ItemHooks.itemCodeByClassId[sdk.items.DimensionalShard] = "Death's Fathom";
ItemHooks.itemCodeByClassId[sdk.items.MatriarchalBow] = "Bloodraven's";
ItemHooks.itemCodeByClassId[sdk.items.MatriarchalSpear] = "Stoneraven";
ItemHooks.itemCodeByClassId[sdk.items.MatriarchalJavelin] = "Thunder Stroke";
ItemHooks.itemCodeByClassId[sdk.items.LightPlatedBoots] = "Goblin Toe";
ItemHooks.itemCodeByClassId[sdk.items.Sallet] = "Rockstopper";
ItemHooks.itemCodeByClassId[sdk.items.GhostArmor] = "Spirit Shroud";
ItemHooks.itemCodeByClassId[sdk.items.SerpentskinArmor] = "Vipermagi's";
ItemHooks.itemCodeByClassId[sdk.items.MeshArmor] = "Shaftstop";
ItemHooks.itemCodeByClassId[sdk.items.RussetArmor] = "Skullder's";
ItemHooks.itemCodeByClassId[sdk.items.MagePlate] = "Que-Hegan's";
ItemHooks.itemCodeByClassId[sdk.items.SharkskinBoots] = "Waterwalk";
ItemHooks.itemCodeByClassId[sdk.items.DemonHead] = "Andariel's Vis";
ItemHooks.itemCodeByClassId[sdk.items.Tiara] = "Kira's";
ItemHooks.itemCodeByClassId[sdk.items.Shako] = "Harlequin Crest";
ItemHooks.itemCodeByClassId[sdk.items.WireFleece] = "Gladiator's Bane";
ItemHooks.itemCodeByClassId[sdk.items.ScarabshellBoots] = "Sandstorm Trek's";
ItemHooks.itemCodeByClassId[sdk.items.BoneweaveBoots] = "Marrowwalk";
ItemHooks.itemCodeByClassId[sdk.items.MyrmidonGreaves] = "Shadow Dancer";
ItemHooks.itemCodeByClassId[sdk.items.TotemicMask] = "Jalal's";
ItemHooks.itemCodeByClassId[sdk.items.SlayerGuard] = "Arreat's Face";
ItemHooks.itemCodeByClassId[sdk.items.GildedShield] = "HoZ";
ItemHooks.itemCodeByClassId[sdk.items.HierophantTrophy] = "Homunculus";
ItemHooks.itemCodeByClassId[sdk.items.BloodSpirit] = "Cerebus";
ItemHooks.itemCodeByClassId[sdk.items.EarthSpirit] = "Spirit Keeper";
ItemHooks.itemCodeByClassId[sdk.items.FuryVisor] = "Wolfhowl";
ItemHooks.itemCodeByClassId[sdk.items.DestroyerHelm] = "Demonhorn's";
ItemHooks.itemCodeByClassId[sdk.items.ConquerorCrown] = "Halaberd's";
ItemHooks.itemCodeByClassId[sdk.items.SacredRondache] = "Alma Negra";
ItemHooks.itemCodeByClassId[sdk.items.ZakarumShield] = "Dragonscale";
ItemHooks.itemCodeByClassId[sdk.items.BloodlordSkull] = "Darkforce";
ItemHooks.itemCodeByClassId[sdk.items.SuccubusSkull] = "Boneflame";
ItemHooks.itemCodeByClassId[sdk.items.SmallCharm] = "Annihilus";
ItemHooks.itemCodeByClassId[sdk.items.LargeCharm] = "Hellfire Torch";
ItemHooks.itemCodeByClassId[sdk.items.GrandCharm] = "Gheed's";
ItemHooks.itemCodeByClassId[sdk.items.Jewel] = "Facet";
ItemHooks.itemCodeByClassId[sdk.items.quest.TokenofAbsolution] = "ÿc8Token";
ItemHooks.itemCodeByClassId[sdk.items.quest.TwistedEssenceofSuffering] = "ÿc3Ess-Of-Suffering";
ItemHooks.itemCodeByClassId[sdk.items.quest.ChargedEssenceofHatred] = "ÿc7Ess-Of-Hatred";
ItemHooks.itemCodeByClassId[sdk.items.quest.BurningEssenceofTerror] = "ÿc1Ess-Of-Terror";
ItemHooks.itemCodeByClassId[sdk.items.quest.FesteringEssenceofDestruction] = "ÿc3Ess-Of-Destruction";

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

ItemHooks.itemColorCode[sdk.items.quality.Magic] = { color: 0x97, code: "ÿc3" };
ItemHooks.itemColorCode[sdk.items.quality.Set] = { color: 0x84, code: "ÿc2" };
ItemHooks.itemColorCode[sdk.items.quality.Rare] = { color: 0x6F, code: "ÿc9" };
ItemHooks.itemColorCode[sdk.items.quality.Unique] = { color: 0xA8, code: "ÿc4" };
