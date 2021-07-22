/*
*	@filename	Sorceress.SoloLeveling.js
*	@author		isid0re
*	@desc		Config Settings for SoloLeveling Sorceress
*
*	Profile settings
*		To setup the profile.
*		1. Add a profile in D2Bot.exe console
*		2. Name the profile one of the following:
*			SCL-SORC  // for softcore ladder
*			SCNL-SORC  // for softcore nonladder
*			SCCL-SORC  // for softcore classic ladder
*			SCCNL-SORC  // for softcore classic nonladder
*			HCL-SORC  // for hardcore ladder
*			HCNL-SORC  // for hardcore nonladder
*			HCCL-SORC  // for hardcore classic ladder
*			HCCNL-SORC  // for hardcore classic nonladder
*
*	FinalBuild choices
*		To select your finalbuild.
*		1. Go into the D2BS console manager.
*		2. Select the Bots profile
*		3. In the info tag box enter one of the following choices:
*			Meteorb
*			Cold
*			BlizzBaller
*			Blova
*			Lightning
*			Bumper
*
*	Selecting the entry script and run the bot
*		1. Select D2Bot.SoloLevelingEntry.dbj
*		2. Save the profile and start
*/

function LoadConfig () {
	if (!isIncluded("common/Storage.js")) {
		include("common/Storage.js");
	}

	if (!isIncluded("common/Misc.js")) {
		include("common/Misc.js");
	}

	if (!isIncluded("NTItemParser.dbl")) {
		include("NTItemParser.dbl");
	}

	if (!isIncluded("SoloLeveling/Functions/Globals.js")) {
		include("SoloLeveling/Functions/Globals.js");
	}

	SetUp.include();

	/* Script */
	Scripts.UserAddon = false;
	Scripts.SoloLeveling = true;

	/* General configuration. */
	Config.MinGameTime = 400;
	Config.MaxGameTime = 7200;
	Config.MiniShopBot = true;
	Config.PacketShopping = true;
	Config.TownCheck = me.findItem("tbk", 0, 3);
	Config.LogExperience = false;
	Config.PingQuit = [{Ping: 600, Duration: 10}];
	Config.Silence = true;
	Config.OpenChests = me.hell ? 2 : true;
	Config.LowGold = me.normal ? 25000 : me.nightmare ? 50000 : 100000;
	Config.PrimarySlot = 0;
	Config.PacketCasting = 1;
	Config.WaypointMenu = true;
	Config.Cubing = !me.classic ? me.getItem(549) : false;
	Config.MakeRunewords = !me.classic ? true : false;

	/* General logging. */
	Config.ItemInfo = false;
	Config.LogKeys = false;
	Config.LogOrgans = false;
	Config.LogMiddleRunes = true;
	Config.LogHighRunes = true;
	Config.ShowCubingInfo = true;

	/* Town configuration. */
	Config.HealHP = 99;
	Config.HealMP = 99;
	Config.HealStatus = true;
	Config.UseMerc = true;
	Config.MercWatch = true;
	Config.StashGold = me.charlvl * 100;
	Config.ClearInvOnStart = me.findItem("tbk", 0, 3);

	/* Chicken configuration. */
	Config.LifeChicken = me.playertype ? 60 : 10;
	Config.ManaChicken = 0;
	Config.MercChicken = 0;
	Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
	Config.TownMP = 0;

	/* Potions configuration. */
	Config.UseHP = me.playertype ? 90 : 75;
	Config.UseRejuvHP = me.playertype ? 65 : 50;
	Config.UseMP = me.playertype ? 75 : 65;
	Config.UseMercHP = 75;

	/* Belt configuration. */
	Config.BeltColumn = ["hp", "mp", "mp", "rv"];
	Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
	Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
	Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
	Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;

	/* Inventory buffers and lock configuration. */
	Config.HPBuffer = 0;
	Config.MPBuffer = 0;
	Config.RejuvBuffer = 4;
	Config.Inventory[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	Config.Inventory[1] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	Config.Inventory[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	Config.Inventory[3] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

	/* Pickit configuration. */
	Config.PickRange = 40;
	Config.FastPick = false;
	Config.CainID.Enable = false;
	Config.FieldID = false;
	NTIP.arrayLooping(nipItems.Quest);
	NTIP.arrayLooping(nipItems.General);
	NTIP.arrayLooping(nipItems.Selling);

	/* Pickit Files */
	//	Config.PickitFiles.push("kolton.nip");
	//	Config.PickitFiles.push("LLD.nip");

	/* Gambling configuration. */
	Config.Gamble = true;
	Config.GambleGoldStart = 1250000;
	Config.GambleGoldStop = 750000;
	Config.GambleItems.push("Amulet");
	Config.GambleItems.push("Ring");
	Config.GambleItems.push("Circlet");
	Config.GambleItems.push("Coronet");

	/* AutoMule configuration. */
	Config.AutoMule.Trigger = [];
	Config.AutoMule.Force = [];
	Config.AutoMule.Exclude = [
		"[name] >= elrune && [name] <= lemrune",
		"[Name] == Mephisto'sSoulstone",
		"[Name] == HellForgeHammer",
		"[Name] == ScrollOfInifuss",
		"[Name] == KeyToTheCairnStones",
		"[name] == BookOfSkill",
		"[Name] == HoradricCube",
		"[Name] == ShaftOfTheHoradricStaff",
		"[Name] == TopOfTheHoradricStaff",
		"[Name] == HoradricStaff",
		"[Name] == ajadefigurine",
		"[Name] == TheGoldenBird",
		"[Name] == potionoflife",
		"[Name] == lamesen'stome",
		"[Name] == Khalim'sEye",
		"[Name] == Khalim'sHeart",
		"[Name] == Khalim'sBrain",
		"[Name] == Khalim'sFlail",
		"[Name] == Khalim'sWill",
		"[Name] == ScrollofResistance",
	];

	/* AutoEquip configuration. */
	Config.AutoEquip = true;

	var levelingTiers = [ // autoequip setup
		//weapon
		"[Name] == CrystalSword && [flag] == runeword # [plusskillbattleorders] >= 1", // CTA for swap
		"me.charlvl > 1 && ([type] == orb || [type] == wand && [Quality] >= Magic || [type] == sword && ([Quality] >= Magic || [flag] == runeword) || [type] == knife && [Quality] >= Magic) && [flag] != ethereal # [secondarymindamage] == 0 && [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//Helmet
		"([type] == helm || [type] == circlet) && ([Quality] >= Magic || [flag] == runeword) && [flag] != ethereal #  [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//belt
		"[type] == belt && [Quality] >= Magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//boots
		"[Type] == Boots && [Quality] >= Magic && [Flag] != Ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//armor
		"[type] == armor && ([Quality] >= Magic || [flag] == runeword) && [Flag] != Ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//shield
		"[type] == shield && ([Quality] >= Magic || [flag] == runeword) && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//gloves
		"[Type] == Gloves && [Quality] >= Magic && [flag] != ethereal # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//ammy
		"[Type] == Amulet && [Quality] >= Magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//rings
		"[Type] == Ring && [Quality] >= Magic # [itemchargedskill] >= 0 # [tier] == tierscore(item)",
		//merc
		"([type] == circlet || [type] == helm) && ([Quality] >= Magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"[Type] == armor && ([Quality] >= Magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		"me.charlvl > 14 && [Type] == Polearm && ([Quality] >= Magic || [flag] == runeword) # [itemchargedskill] >= 0 # [Merctier] == mercscore(item)",
		//charms
		"[Name] == smallcharm && [Quality] >= Magic # [itemchargedskill] >= 0 # [charmtier] == charmscore(item)",
		"[Name] == largecharm && [Quality] >= Magic # [itemchargedskill] >= 0 # [charmtier] == charmscore(item)",
		"me.charlvl > 39 && [Name] == grandcharm && [Quality] >= Magic # [itemchargedskill] >= 0 # [charmtier] == charmscore(item)",
	];
	NTIP.arrayLooping(levelingTiers);

	/* FastMod configuration. */
	Config.FCR = 255;
	Config.FHR = 255;
	Config.FBR = 255;
	Config.IAS = 255;

	/* Attack configuration. */
	Skill.usePvpRange = true;
	Config.AttackSkill = [0, 0, 0, 0, 0, 0, 0];
	Config.LowManaSkill = [-1, -1];
	Config.MaxAttackCount = 1000;
	Config.BossPriority = me.normal ? true : false;
	Config.ClearType = 0;
	Config.ClearPath = {
		Range: 30,
		Spectype: 0xF,
	};

	/* Monster skip configuration. */
	Config.SkipException = [];
	Config.SkipEnchant = [];
	Config.SkipAura = [];

	/* Shrine scan configuration. */
	Config.ScanShrines = [15, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];

	/* AutoStat configuration. */
	Config.AutoStat.Enabled = true;
	Config.AutoStat.Save = 0;
	Config.AutoStat.BlockChance = 57;
	Config.AutoStat.UseBulk = true;
	Config.AutoStat.Build = SetUp.specPush("stats");

	/* AutoSkill configuration. */
	Config.AutoSkill.Enabled = true;
	Config.AutoSkill.Save = 0;
	Config.AutoSkill.Build = SetUp.specPush("skills");

	/* AutoBuild configuration. */
	Config.AutoBuild.Enabled = true;
	Config.AutoBuild.Verbose = false;
	Config.AutoBuild.DebugMode = false;
	Config.AutoBuild.Template = SetUp.getBuild();

	/* Class specific configuration. */
	Config.UseTelekinesis = !!me.getSkill(43, 0); // use telekinesis if have skill
	Config.Dodge = me.charlvl >= SetUp.respecOne ? true : false; // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
	Config.DodgeRange = 15; // Distance to keep from monsters.
	Config.DodgeHP = 90; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
	Config.TeleStomp = false; // Use merc to attack bosses if they're immune to attacks, but not to physical damage
	Config.CastStatic = me.normal ? 25 : me.nightmare ? 33 : 50;
	Config.StaticList = me.normal ? ["Andariel", "Duriel", "Mephisto", "Izual", "Diablo", "Talic", "Madawc", "Korlic", "Baal"] : ["Andariel", "Duriel", "Mephisto", "Izual", "Diablo", "Baal"];

	/* LOD gear */
	if (!me.classic) {
		let finalGear = Check.Build().finalGear;
		NTIP.arrayLooping(finalGear);

		switch (SetUp.finalBuild) { // finalbuilld autoequip setup
		case 'Blova':
		case 'Lightning':
			if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).prefixnum !== 20566) { //infinity
				var Inf = [
					"[Name] == BerRune",
					"[Name] == MalRune",
					"[Name] == IstRune",
					"([Name] == thresher || [Name] == crypticaxe || [Name] == greatpoleaxe || [Name] == giantthresher) && [flag] != runeword && [Flag] == Ethereal && [Quality] == Normal # [Sockets] == 0 # [MaxQuantity] == 1",
					"([Name] == thresher || [Name] == crypticaxe || [Name] == greatpoleaxe || [Name] == giantthresher) && [flag] != runeword && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(Inf);

				if (!me.getItem(639)) {
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]); // sur to ber
				}

				Config.Recipes.push([Recipe.Socket.Weapon, "Giant Thresher"]);
				Config.Recipes.push([Recipe.Socket.Weapon, "Great Poleaxe"]);
				Config.Recipes.push([Recipe.Socket.Weapon, "Cryptic Axe"]);
				Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

				Config.Runewords.push([Runeword.Infinity, "Giant Thresher"]);
				Config.Runewords.push([Runeword.Infinity, "Great Poleaxe"]);
				Config.Runewords.push([Runeword.Infinity, "Cryptic Axe"]);
				Config.Runewords.push([Runeword.Infinity, "Thresher"]);
				Config.KeepRunewords.push("[type] == polearm # [convictionaura] >= 12");
			}

			if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(5).tier < 1000) { // Spirit shield
				if (!Check.haveItem("shield", "runeword", "Spirit") && me.hell) {
					var SpiritShield = [
						"[Name] == TalRune # # [MaxQuantity] == 1",
						"[Name] == ThulRune # # [MaxQuantity] == 1",
						"[Name] == OrtRune # # [MaxQuantity] == 1",
						"[Name] == AmnRune # # [MaxQuantity] == 1",
						"[Name] == Monarch && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # ([Sockets] == 0 || [Sockets] == 4) # [MaxQuantity] == 1",
					];
					NTIP.arrayLooping(SpiritShield);
				}

				Config.Recipes.push([Recipe.Socket.Shield, "Monarch", Roll.NonEth]);
				Config.Runewords.push([Runeword.Spirit, "Monarch"]);
				Config.KeepRunewords.push("([type] == shield || [type] == auricshields) # [fcr] >= 35 && [maxmana] >= 89");
			}

			if (!Check.haveItem("armor", "runeword", "Chains of Honor")) { // CoH
				var CoH = [
					"[Name] == DolRune # # [MaxQuantity] == 1",
					"[Name] == UmRune",
					"[Name] == BerRune",
					"[Name] == IstRune",
					"([Name] == ArchonPlate || [Name] == DuskShroud || [Name] == WyrmHide) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # ([Sockets] == 0 || [Sockets] == 4) # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(CoH);

				if (!me.getItem(639)) {
					Config.Recipes.push([Recipe.Rune, "Sur Rune"]); // sur to ber
				}

				Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Armor, "Dusk Shroud", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Armor, "WyrmHide", Roll.NonEth]);

				Config.Runewords.push([Runeword.ChainsofHonor, "Archon Plate"]);
				Config.Runewords.push([Runeword.ChainsofHonor, "Dusk Shroud"]);
				Config.Runewords.push([Runeword.ChainsofHonor, "WyrmHide"]);

				Config.KeepRunewords.push("[type] == armor # [fireresist] == 65 && [hpregen] == 7");
			}

			if (!Check.haveItem("mace", "runeword", "Heart of the Oak")) {
				var HotO = [
					"[Name] == ThulRune # # [MaxQuantity] == 1",
					"[Name] == PulRune",
					"[Name] == KoRune # # [MaxQuantity] == 1",
					"[Name] == VexRune",
				];
				NTIP.arrayLooping(HotO);

				if (me.getItem(635)) {
					NTIP.addLine("([Name] == Flail || [Name] == Knout) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1");
				}

				if (!me.getItem(635)) {
					Config.Recipes.push([Recipe.Rune, "Um Rune"]);
					Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
					Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
				}

				Config.Runewords.push([Runeword.HeartoftheOak, "Knout"]);
				Config.Runewords.push([Runeword.HeartoftheOak, "Flail"]);
				Config.KeepRunewords.push("[Type] == mace # [FCR] == 40");
			}

			break;
		default:
			break;
		}

		if (!Check.haveItem("sword", "runeword", "Call To Arms")) {
			var CTA = [
				"[Name] == AmnRune # # [MaxQuantity] == 1",
				"[Name] == RalRune # # [MaxQuantity] == 1",
				"[Name] == MalRune",
				"[Name] == IstRune",
				"[Name] == OhmRune",
			];
			NTIP.arrayLooping(CTA);

			if (me.getItem(636)) { // have Ohm before collecting base
				NTIP.addLine("[Name] == CrystalSword && [flag] != runeword && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 5 # [MaxQuantity] == 1");
			}

			Config.Runewords.push([Runeword.CallToArms, "Crystal Sword"]);
			Config.KeepRunewords.push("[type] == sword # [plusskillbattleorders] >= 1");
		}

		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItem(4).tier < 777) { // Spirit Sword
			if (!Check.haveItem("sword", "runeword", "Spirit") && !me.hell) {
				var SpiritSword = [
					"[Name] == TalRune # # [MaxQuantity] == 1",
					"[Name] == ThulRune # # [MaxQuantity] == 1",
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == AmnRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(SpiritSword);

				if (!me.getItem(620)) { //Amn Rune
					Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
					Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
					Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
				}

				NTIP.addLine("([Name] == BroadSword || [Name] == CrystalSword) && [flag] != runeword && [flag] != ethereal && [Quality] == Normal && [Level] >= 26 && [Level] <= 40 # [Sockets] == 0 # [MaxQuantity] == 1");

				Config.Recipes.push([Recipe.Socket.Weapon, "Crystal Sword", Roll.NonEth]);
				Config.Recipes.push([Recipe.Socket.Weapon, "Broad Sword", Roll.NonEth]);
			}

			NTIP.addLine("([Name] == BroadSword || [Name] == CrystalSword) && [flag] != runeword && [flag] != ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1");
			Config.Runewords.push([Runeword.Spirit, "Crystal Sword"]);
			Config.Runewords.push([Runeword.Spirit, "Broad Sword"]);

			Config.KeepRunewords.push("[type] == sword # [fcr] >= 25 && [maxmana] >= 89");
		}

		if ((me.ladder || Developer.addLadderRW) && Item.getEquippedItemMerc(4).tier < 3600) { // Merc Insight
			var Insight = [
				"([Name] == thresher || [Name] == crypticaxe || [Name] == greatpoleaxe || [Name] == giantthresher) && [flag] != runeword && [Flag] == Ethereal && [Quality] == Normal # [Sockets] == 0 # [MaxQuantity] == 1",
				"!me.hell && ([Name] == voulge || [Name] == scythe || [Name] == poleaxe || [Name] == halberd || [Name] == warscythe || [Name] == bill || [Name] == battlescythe || [Name] == partizan || [Name] == grimscythe) && [flag] != runeword && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1",
				"([Name] == thresher || [Name] == crypticaxe || [Name] == greatpoleaxe || [Name] == giantthresher) && [flag] != runeword && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 4 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(Insight);

			if (!me.hell && Item.getEquippedItemMerc(4).prefixnum !== 20568) {
				NTIP.addLine("[Name] == voulge && [flag] != runeword && [flag] != ethereal && [Quality] == Normal && [Level] >= 26 && [Level] <= 40 # [Sockets] == 0 # [MaxQuantity] == 1");
			}

			Config.Recipes.push([Recipe.Socket.Weapon, "Giant Thresher"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "Great Poleaxe"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "Cryptic Axe"]);
			Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

			Config.Runewords.push([Runeword.Insight, "Giant Thresher"]);
			Config.Runewords.push([Runeword.Insight, "Great Poleaxe"]);
			Config.Runewords.push([Runeword.Insight, "Cryptic Axe"]);
			Config.Runewords.push([Runeword.Insight, "Thresher"]);
			Config.Runewords.push([Runeword.Insight, "Grim Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Partizan"]);
			Config.Runewords.push([Runeword.Insight, "Battle Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Bill"]);
			Config.Runewords.push([Runeword.Insight, "War Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Halberd"]);
			Config.Runewords.push([Runeword.Insight, "Poleaxe"]);
			Config.Runewords.push([Runeword.Insight, "Scythe"]);
			Config.Runewords.push([Runeword.Insight, "Voulge"]);

			Config.KeepRunewords.push("[type] == polearm # [meditationaura] >= 12");
		}

		if (Item.getEquippedItem(1).tier < 315) { // Lore
			if (!Check.haveItem("helm", "runeword", "Lore")) {
				var loreRunes = [
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == SolRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(loreRunes);

				Config.Recipes.push([Recipe.Rune, "Ort Rune"]);
				Config.Recipes.push([Recipe.Rune, "Thul Rune"]);
				Config.Recipes.push([Recipe.Rune, "Amn Rune"]);
			}

			var loreHelm = [
				"!me.hell && ([Name] == Crown || [Name] == BoneHelm || [Name] == FullHelm) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
				"([Name] == Casque || [Name] == Sallet || [Name] == DeathMask || [Name] == GrimHelm) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(loreHelm);

			Config.Runewords.push([Runeword.Lore, "Grim Helm"]);
			Config.Runewords.push([Runeword.Lore, "Bone Helm"]);
			Config.Runewords.push([Runeword.Lore, "Sallet"]);
			Config.Runewords.push([Runeword.Lore, "Casque"]);
			Config.Runewords.push([Runeword.Lore, "Death Mask"]);
			Config.Runewords.push([Runeword.Lore, "Full Helm"]);
			Config.KeepRunewords.push("([type] == circlet || [type] == helm) # [LightResist] >= 25");
		}

		if (Item.getEquippedItem(5).tier < 500) { // Ancients' Pledge
			if (!Check.haveItem("shield", "runeword", "Ancients' Pledge") && !me.hell) {
				if (me.normal && !me.getItem(618)) {
					Config.Recipes.push([Recipe.Rune, "Ral Rune"]);
				}

				var apRunes = [
					"[Name] == RalRune # # [MaxQuantity] == 1",
					"[Name] == OrtRune # # [MaxQuantity] == 1",
					"[Name] == TalRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(apRunes);
			}

			var apShields = [
				"me.normal && [Name] == LargeShield && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
				"[Name] == Scutum && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(apShields);

			Config.Runewords.push([Runeword.AncientsPledge, "Scutum"]);
			Config.Runewords.push([Runeword.AncientsPledge, "Large Shield"]);

			Config.KeepRunewords.push("([type] == shield || [type] == auricshields) # [fireresist]+[lightresist]+[coldresist]+[poisonresist] >= 187");
		}

		if (Item.getEquippedItemMerc(3).prefixnum !== 20547) { // Merc Fortitude
			var fort = [
				"[Name] == ElRune # # [MaxQuantity] == 1",
				"[Name] == SolRune # # [MaxQuantity] == 1",
				"[Name] == DolRune # # [MaxQuantity] == 1",
				"[Name] == LoRune",
				"([Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [flag] != runeword && [Quality] == Normal && [Flag] == Ethereal # [Defense] >= 1000 && [Sockets] == 4 # [MaxQuantity] == 1",
				"([Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [flag] != runeword && [Quality] == Normal && [Flag] == Ethereal # [Defense] >= 700 && [Sockets] == 0 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(fort);

			Config.Recipes.push([Recipe.Socket.Armor, "Hellforge Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Kraken Shell"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Balrog Skin"]);
			Config.Recipes.push([Recipe.Socket.Armor, "BoneWeave"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Great Hauberk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Loricated Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Diamond Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Wire Fleece"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Scarab Husk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "WyrmHide"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Dusk Shroud"]);

			Config.Runewords.push([Runeword.Fortitude, "Breast Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Mage Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Hellforge Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Kraken Shell"]);
			Config.Runewords.push([Runeword.Fortitude, "Archon Plate"]);
			Config.Runewords.push([Runeword.Fortitude, "Balrog Skin"]);
			Config.Runewords.push([Runeword.Fortitude, "BoneWeave"]);
			Config.Runewords.push([Runeword.Fortitude, "Great Hauberk"]);
			Config.Runewords.push([Runeword.Fortitude, "Loricated Mail"]);
			Config.Runewords.push([Runeword.Fortitude, "Diamond Mail"]);
			Config.Runewords.push([Runeword.Fortitude, "Wire Fleece"]);
			Config.Runewords.push([Runeword.Fortitude, "Scarab Husk"]);
			Config.Runewords.push([Runeword.Fortitude, "WyrmHide"]);
			Config.Runewords.push([Runeword.Fortitude, "Dusk Shroud"]);

			Config.KeepRunewords.push("[type] == armor # [enhanceddefense] >= 200 && [enhanceddamage] >= 300");
		}

		if (Item.getEquippedItemMerc(3).tier < 15000) { // Merc Treachery
			var Treachery = [
				"([Name] == BreastPlate || [Name] == MagePlate || [Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [flag] != runeword && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 3 # [MaxQuantity] == 1",
				"!me.normal && ([Name] == HellforgePlate || [Name] == KrakenShell || [Name] == ArchonPlate || [Name] == BalrogSkin || [Name] == BoneWeave || [Name] == GreatHauberk || [Name] == LoricatedMail || [Name] == DiamondMail || [Name] == WireFleece || [Name] == ScarabHusk || [Name] == WyrmHide || [Name] == DuskShroud) && [Quality] == Normal && [flag] != runeword && [Flag] == Ethereal # [Sockets] == 0 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(Treachery);

			Config.Recipes.push([Recipe.Socket.Armor, "Hellforge Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Kraken Shell"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Balrog Skin"]);
			Config.Recipes.push([Recipe.Socket.Armor, "BoneWeave"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Great Hauberk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Loricated Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Diamond Mail"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Wire Fleece"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Scarab Husk"]);
			Config.Recipes.push([Recipe.Socket.Armor, "WyrmHide"]);
			Config.Recipes.push([Recipe.Socket.Armor, "Dusk Shroud"]);

			Config.Runewords.push([Runeword.Treachery, "Breast Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Mage Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Hellforge Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Kraken Shell"]);
			Config.Runewords.push([Runeword.Treachery, "Archon Plate"]);
			Config.Runewords.push([Runeword.Treachery, "Balrog Skin"]);
			Config.Runewords.push([Runeword.Treachery, "BoneWeave"]);
			Config.Runewords.push([Runeword.Treachery, "Great Hauberk"]);
			Config.Runewords.push([Runeword.Treachery, "Loricated Mail"]);
			Config.Runewords.push([Runeword.Treachery, "Diamond Mail"]);
			Config.Runewords.push([Runeword.Treachery, "Wire Fleece"]);
			Config.Runewords.push([Runeword.Treachery, "Scarab Husk"]);
			Config.Runewords.push([Runeword.Treachery, "WyrmHide"]);
			Config.Runewords.push([Runeword.Treachery, "Dusk Shroud"]);

			Config.KeepRunewords.push("[Type] == armor # [ias] == 45 && [coldresist] == 30");
		}

		if (Item.getEquippedItem(3).tier < 634) { // Smoke
			if (!Check.haveItem("armor", "runeword", "Smoke") && !me.hell) {
				if (!me.getItem(626)) { // Cube to Lum Rune
					Config.Recipes.push([Recipe.Rune, "Io Rune"]); // cube Io to Lum
				}

				var smokeRunes = [
					"[Name] == NefRune # # [MaxQuantity] == 1",
					"[Name] == LumRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(smokeRunes);
			}

			NTIP.addLine("([Name] == demonhidearmor || [Name] == DuskShroud || [Name] == GhostArmor || [Name] == LightPlate || [Name] == MagePlate || [Name] == SerpentskinArmor || [Name] == trellisedarmor || [Name] == WyrmHide) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1");

			Config.Runewords.push([Runeword.Smoke, "demonhide armor"]);
			Config.Runewords.push([Runeword.Smoke, "Dusk Shroud"]);
			Config.Runewords.push([Runeword.Smoke, "Ghost Armor"]);
			Config.Runewords.push([Runeword.Smoke, "Light Plate"]);
			Config.Runewords.push([Runeword.Smoke, "Mage Plate"]);
			Config.Runewords.push([Runeword.Smoke, "Serpentskin Armor"]);
			Config.Runewords.push([Runeword.Smoke, "trellised armor"]);
			Config.Runewords.push([Runeword.Smoke, "WyrmHide"]);

			Config.KeepRunewords.push("[type] == armor # [fireresist] == 50");
		}

		if (Item.getEquippedItem(3).tier < 233) { // Stealth
			if (!Check.haveItem("armor", "runeword", "Stealth") && me.normal) {
				var stealthRunes = [
					"[Name] == TalRune # # [MaxQuantity] == 1",
					"[Name] == EthRune # # [MaxQuantity] == 1",
				];
				NTIP.arrayLooping(stealthRunes);
			}

			var stealthArmor = [
				"!me.hell && ([Name] == StuddedLeather || [Name] == BreastPlate || [Name] == LightPlate) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
				"([Name] == GhostArmor || [Name] == SerpentskinArmor || [Name] == MagePlate) && [flag] != runeword && [Flag] != Ethereal && [Quality] >= Normal && [Quality] <= Superior # [Sockets] == 2 # [MaxQuantity] == 1",
			];
			NTIP.arrayLooping(stealthArmor);

			Config.Runewords.push([Runeword.Stealth, "Mage Plate"]);
			Config.Runewords.push([Runeword.Stealth, "Serpentskin Armor"]);
			Config.Runewords.push([Runeword.Stealth, "Ghost Armor"]);
			Config.Runewords.push([Runeword.Stealth, "Light Plate"]);
			Config.Runewords.push([Runeword.Stealth, "Breast Plate"]);
			Config.Runewords.push([Runeword.Stealth, "Studded Leather"]);

			Config.KeepRunewords.push("[type] == armor # [frw] == 25");
		}
	}
}
