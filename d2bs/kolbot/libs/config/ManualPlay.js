function LoadConfig () {
	// User addon script. Read the description in libs/bots/UserAddon.js
	Scripts.UserAddon = false; // !!!YOU MUST SET THIS TO FALSE IF YOU WANT TO RUN BOSS/AREA SCRIPTS!!!

	// Wereform setup. Make sure you read Templates/Attacks.txt for attack skill format.
	Config.Wereform = false; // 0 / false - don't shapeshift, 1 / "Werewolf" - change to werewolf, 2 / "Werebear" - change to werebear

	Config.ManualPlayPick = false; // If set to true and D2BotMap or D2BotManualPlay entry script is used, will enable picking in manual play.

	// Town settings
	Config.HealHP = 50; // Go to a healer if under designated percent of life.
	Config.HealMP = 0; // Go to a healer if under designated percent of mana.
	Config.HealStatus = false; // Go to a healer if poisoned or cursed
	Config.UseMerc = true; // Use merc. This is ignored and always false in d2classic.
	Config.MercWatch = false; // Instant merc revive during battle.

	// Potion settings
	Config.UseHP = 75; // Drink a healing potion if life is under designated percent.
	Config.UseRejuvHP = 40; // Drink a rejuvenation potion if life is under designated percent.
	Config.UseMP = 30; // Drink a mana potion if mana is under designated percent.
	Config.UseRejuvMP = 0; // Drink a rejuvenation potion if mana is under designated percent.
	Config.UseMercHP = 75; // Give a healing potion to your merc if his/her life is under designated percent.
	Config.UseMercRejuv = 0; // Give a rejuvenation potion to your merc if his/her life is under designated percent.
	Config.HPBuffer = 0; // Number of healing potions to keep in inventory.
	Config.MPBuffer = 0; // Number of mana potions to keep in inventory.
	Config.RejuvBuffer = 0; // Number of rejuvenation potions to keep in inventory.

	// Chicken settings
	Config.LifeChicken = 30; // Exit game if life is less or equal to designated percent.
	Config.ManaChicken = 0; // Exit game if mana is less or equal to designated percent.
	Config.MercChicken = 0; // Exit game if merc's life is less or equal to designated percent.
	Config.TownHP = 0; // Go to town if life is under designated percent.
	Config.TownMP = 0; // Go to town if mana is under designated percent.

	/* Inventory lock configuration. !!!READ CAREFULLY!!!
	 * 0 = item is locked and won't be moved. If item occupies more than one slot, ALL of those slots must be set to 0 to lock it in place.
	 * Put 0s where your torch, annihilus and everything else you want to KEEP is.
	 * 1 = item is unlocked and will be dropped, stashed or sold.
	 * If you don't change the default values, the bot won't stash items.
	 */
	Config.Inventory[0] = [0,0,0,0,0,0,0,0,0,0];
	Config.Inventory[1] = [0,0,0,0,0,0,0,0,0,0];
	Config.Inventory[2] = [0,0,0,0,0,0,0,0,0,0];
	Config.Inventory[3] = [0,0,0,0,0,0,0,0,0,0];

	Config.StashGold = 100000; // Minimum amount of gold to stash.

	/* Potion types for belt columns from left to right.
	 * Rejuvenation potions must always be rightmost.
	 * Supported potions - Healing ("hp"), Mana ("mp") and Rejuvenation ("rv")
	 */
	Config.BeltColumn[0] = "hp";
	Config.BeltColumn[1] = "mp";
	Config.BeltColumn[2] = "rv";
	Config.BeltColumn[3] = "rv";

	/* Minimum amount of potions. If we have less, go to vendor to purchase more.
	 * Set rejuvenation columns to 0, because they can't be bought.
	 */
	Config.MinColumn[0] = 3;
	Config.MinColumn[1] = 3;
	Config.MinColumn[2] = 0;
	Config.MinColumn[3] = 0;

	// Pickit config. Default folder is kolbot/pickit.
	Config.PickitFiles.push("kolton.nip");
	Config.PickitFiles.push("LLD.nip");
	Config.PickRange = 40; // Pick radius
	Config.FastPick = false; // Check and pick items between attacks

	/* Advanced automule settings
	 * Trigger - Having an item that is on the list will initiate muling. Useful if you want to mule something immediately upon finding.
	 * Force - Items listed here will be muled even if they are ingredients for cubing.
	 * Exclude - Items listed here will be ignored and will not be muled. Items on Trigger or Force lists are prioritized over this list.
	 *
	 * List can either be set as string in pickit format and/or as number referring to item classids. Each entries are separated by commas.
	 * Example :
	 *  Config.AutoMule.Trigger = [639, 640, "[type] == ring && [quality] == unique # [maxmana] == 20"];
	 *  	This will initiate muling when your character finds Ber, Jah, or SOJ.
	 *  Config.AutoMule.Force = [561, 566, 571, 576, 581, 586, 601];
	 *  	This will mule perfect gems/skull during muling.
	 *  Config.AutoMule.Exclude = ["[name] >= talrune && [name] <= solrune", "[name] >= 654 && [name] <= 657"];
	 *  	This will exclude muling of runes from tal through sol, and any essences.
	 */
	Config.AutoMule.Trigger = [];
	Config.AutoMule.Force = [];
	Config.AutoMule.Exclude = [];

	// Manager Item Log Screen
	Config.LogKeys = false; // Log keys on item viewer
	Config.LogOrgans = true; // Log organs on item viewer
	Config.LogLowRunes = false; // Log low runes (El - Dol) on item viewer
	Config.LogMiddleRunes = false; // Log middle runes (Hel - Mal) on item viewer
	Config.LogHighRunes = true; // Log high runes (Ist - Zod) on item viewer
	Config.LogLowGems = false; // Log low gems (chipped, flawed, normal) on item viewer
	Config.LogHighGems = false; // Log high gems (flawless, perfect) on item viewer
	Config.SkipLogging = []; // Custom log skip list. Set as three digit item code or classid. Example: ["tes", "ceh", 656, 657] will ignore logging of essences.
	Config.ShowCubingInfo = true; // Show cubing messages on console

	// Public game options

	// If LocalChat is enabled, chat can be sent via 'sendCopyData' instead of BNET
	// To allow 'say' to use BNET, use 'say("msg", true)', the 2nd parameter will force BNET
	// LocalChat messages will only be visible on clients running on the same PC
	Config.LocalChat.Enabled = false; // enable the LocalChat system
	Config.LocalChat.Toggle = false; // optional, set to KEY value to toggle through modes 0, 1, 2
	Config.LocalChat.Mode = 0; // 0 = disabled, 1 = chat from 'say' (recommended), 2 = all chat (for manual play)

	// If Config.Leader is set, the bot will only accept invites from leader. If Config.PublicMode is not 0, Baal and Diablo script will open Town Portals.
	// If set on true, it simply parties.
	Config.PublicMode = 0; // 1 = invite and accept, 2 = accept only, 3 = invite only, 0 = disable.

	// Party message settings. Each setting represents an array of messages that will be randomly chosen.
	// $name, $level, $class and $killer are replaced by the player's name, level, class and killer
	Config.Greetings = []; // Example: ["Hello, $name (level $level $class)"]
	Config.DeathMessages = []; // Example: ["Watch out for that $killer, $name!"]
	Config.Congratulations = []; // Example: ["Congrats on level $level, $name!"]
	Config.ShitList = false; // Blacklist hostile players so they don't get invited to party.
	Config.UnpartyShitlisted = false; // Leave party if someone invited a blacklisted player.

	// General config
	Config.AutoMap = false; // Set to true to open automap at the beginning of the game.
	Config.LastMessage = ""; // Message or array of messages to say at the end of the run. Use $nextgame to say next game - "Next game: $nextgame" (works with lead entry point)
	Config.MinGameTime = 60; // Min game time in seconds. Bot will TP to town and stay in game if the run is completed before.
	Config.MaxGameTime = 0; // Maximum game time in seconds. Quit game when limit is reached.
	Config.TeleSwitch = false; // Switch to secondary (non-primary) slot when teleporting more than 5 nodes.
	Config.OpenChests = false; // Open chests. Controls key buying.
	Config.MiniShopBot = true; // Scan items in NPC shops.
	Config.PacketShopping = false; // Use packets to shop. Improves shopping speed.
	Config.TownCheck = false; // Go to town if out of potions
	Config.LogExperience = false; // Print experience statistics in the manager.
	Config.PingQuit = [{Ping: 0, Duration: 0}]; // Quit if ping is over the given value for over the given time period in seconds.
	Config.Silence = false; // Make the bot not say a word. Do not use in combination with LocalChat

	// Shrine Scanner - scan for shrines while moving.
	// Put the shrine types in order of priority (from highest to lowest). For a list of types, see sdk/shrines.txt
	Config.ScanShrines = [];

	// MF Switch
	Config.MFSwitchPercent = 0; // Boss life % to switch to non-primary weapon slot. Set to 0 to disable.

	// Primary Slot - Bot will try to determine primary slot if not used (non-cta slot that's not empty)
	Config.PrimarySlot = -1; // Set to use specific weapon slot as primary weapon slot: -1 = disabled, 0 = slot I, 1 = slot II

	// Fastmod config
	Config.FCR = 0; // 0 - disable, 1 to 255 - set value of faster cast rate 		- Doesn't work on realms
	Config.FHR = 0; // 0 - disable, 1 to 255 - set value of faster hit recovery		- Doesn't work on realms
	Config.FBR = 0; // 0 - disable, 1 to 255 - set value of faster block recovery	- Doesn't work on realms
	Config.IAS = 0; // 0 - disable, 1 to 255 - set value of increased attack speed 	- Doesn't work on realms
	Config.PacketCasting = 0; // 0 = disable, 1 = packet teleport, 2 = full packet casting.	- Reduce Crashes
	Config.WaypointMenu = true;

	// Monster skip config
	// Skip immune monsters. Possible options: "fire", "cold", "lightning", "poison", "physical", "magic".
	// You can combine multiple resists with "and", for example - "fire and cold", "physical and cold and poison"
	Config.SkipImmune = [];
	// Skip enchanted monsters. Possible options: "extra strong", "extra fast", "cursed", "magic resistant", "fire enchanted", "lightning enchanted", "cold enchanted", "mana burn", "teleportation", "spectral hit", "stone skin", "multiple shots".
	// You can combine multiple enchantments with "and", for example - "cursed and extra fast", "mana burn and extra strong and lightning enchanted"
	Config.SkipEnchant = [];
	// Skip monsters with auras. Possible options: "fanaticism", "might", "holy fire", "blessed aim", "holy freeze", "holy shock". Conviction is bugged, don't use it.
	Config.SkipAura = [];
	// Uncomment the following line to always attempt to kill these bosses despite immunities and mods
	Config.SkipException = [getLocaleString(2851), getLocaleString(2852), getLocaleString(2853)]; // vizier, de seis, infector

	/* Advanced Attack config. Allows custom skills to be used on custom monsters.
	 *	Format: "Monster Name": [timed skill id, untimed skill id]
	 *	Example: "Baal": [38, -1] to use charged bolt on Baal
	 *	Multiple entries are separated by commas
	 */
	Config.CustomAttack = {
		//"Monster Name": [-1, -1]
	};

	Config.NoTele = false; // Restrict char from teleporting. Useful for low level/low mana chars
	Config.Dodge = false; // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
	Config.DodgeRange = 15; // Distance to keep from monsters.
	Config.DodgeHP = 100; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
	Config.BossPriority = false; // Set to true to attack Unique/SuperUnique monsters first when clearing
	Config.ClearType = 0xF; // Monster spectype to kill in level clear scripts (ie. Mausoleum). 0xF = skip normal, 0x7 = champions/bosses, 0 = all
	Config.TeleStomp = false; // Use merc to attack bosses if they're immune to attacks, but not to physical damage

	// Clear while traveling during bot scripts
	// You have two methods to configure clearing. First is simply a spectype to always clear, in any area, with a default range of 30
	// The second method allows you to specify the areas in which to clear while traveling, a range, and a spectype. If area is excluded from this method,
	// all areas will be cleared using the specified range and spectype
	Config.ClearPath = 0; // Monster spectype to kill while traveling. 0xF = skip normal, 0x7 = champions/bosses, 0 = all
	/*Config.ClearPath = {
		Areas: [74], // Specific areas to clear while traveling in. Comment out to clear in all areas
		Range: 30, // Range to clear while traveling
		Spectype: 0, // Monster spectype to kill while traveling. 0xF = skip normal, 0x7 = champions/bosses, 0 = all
		};
	*/
	// AUTOBUILD SETTINGS------------------------------------------------------------------------------------------------------------------//
	/* AutoSkill builds character based on array defined by the user and it replaces AutoBuild's skill system.
	 * AutoSkill will automatically spend skill points and it can also allocate any prerequisite skills as required.
	 *
	 * Format: Config.AutoSkill.Build = [[skillID, count, satisfy], [skillID, count, satisfy], ... [skillID, count, satisfy]];
	 *	skill - skill id number (see /sdk/skills.txt)
	 *	count - maximum number of skill points to allocate for that skill
	 *	satisfy - boolean value to stop(true) or continue(false) further allocation until count is met. Defaults to true if not specified.
	 *
	 *	See libs/config/Templates/AutoSkillExampleBuilds.txt for Config.AutoSkill.Build examples.
	 */
	Config.AutoSkill.Enabled = false; // Enable or disable AutoSkill system
	
	/* AutoStat builds character based on array defined by the user and this will replace AutoBuild's stat system.
	 * AutoStat will stat Build array order. You may want to stat strength or dexterity first to meet item requirements.
	 *
	 * Format: Config.AutoStat.Build = [[statType, stat], [statType, stat], ... [statType, stat]];
	 *	statType - defined as string, or as corresponding stat integer. "strength" or 0, "dexterity" or 2, "vitality" or 3, "energy" or 1
	 *	stat - set to an integer value, and it will spend stat points until it reaches desired *hard stat value (*+stats from items are ignored).
	 *	You can also set stat to string value "all", and it will spend all the remaining points.
	 *	Dexterity can be set to "block" and it will stat dexterity up the the desired block value specified in arguemnt (ignored in classic).
	 *
	 *	See libs/config/Templates/AutoStatExampleBuilds.txt for Config.AutoStat.Build examples.
	 */
	Config.AutoStat.Enabled = false; // Enable or disable AutoStat system

	// AutoBuild System ( See /d2bs/kolbot/libs/config/Builds/README.txt for instructions )
	Config.AutoBuild.Enabled = false;			//	This will enable or disable the AutoBuild system
	Config.AutoBuild.Verbose = true;			//	Allows script to print messages in console
	Config.AutoBuild.DebugMode = true;			//	Debug mode prints a little more information to console and
												//	logs activity to /logs/AutoBuild.CharacterName._MM_DD_YYYY.log
												//	It automatically enables Config.AutoBuild.Verbose

	// CLASS SPECIFIC OPTIONS-----------------------------------------------------------------------------------------------------------//

	// AMAZON
	if (me.classid === 0) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill to bosses.
		Config.AttackSkill[2] = -1; // Primary untimed skill to bosses. Keep at -1 if Config.AttackSkill[1] is untimed skill.
		Config.AttackSkill[3] = -1; // Primary skill to others.
		Config.AttackSkill[4] = -1; // Primary untimed skill to others. Keep at -1 if Config.AttackSkill[3] is untimed skill.
		Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
		Config.AttackSkill[6] = -1; // Secondary untimed skill if monster is immune to primary untimed.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Timed low mana skill.
		Config.LowManaSkill[1] = -1; // Untimed low mana skill.

		Config.LightningFuryDelay = 10; // Lightning fury interval in seconds. LF is treated as timed skill.
		Config.SummonValkyrie = true; // Summon Valkyrie

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}

	// SORCERESS
	if (me.classid === 1) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill to bosses.
		Config.AttackSkill[2] = -1; // Primary untimed skill to bosses. Keep at -1 if Config.AttackSkill[1] is untimed skill.
		Config.AttackSkill[3] = -1; // Primary skill to others.
		Config.AttackSkill[4] = -1; // Primary untimed skill to others. Keep at -1 if Config.AttackSkill[3] is untimed skill.
		Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
		Config.AttackSkill[6] = -1; // Secondary untimed skill if monster is immune to primary untimed.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Timed low mana skill.
		Config.LowManaSkill[1] = -1; // Untimed low mana skill.

		Config.CastStatic = 60; // Cast static until the target is at designated life percent. 100 = disabled.
		Config.StaticList = []; // List of monster NAMES or CLASSIDS to static. Example: Config.StaticList = ["Andariel", 243];

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}

	//	NECROMANCER
	if (me.classid === 2) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill to bosses.
		Config.AttackSkill[2] = -1; // Primary untimed skill to bosses. Keep at -1 if Config.AttackSkill[1] is untimed skill.
		Config.AttackSkill[3] = -1; // Primary skill to others.
		Config.AttackSkill[4] = -1; // Primary untimed skill to others. Keep at -1 if Config.AttackSkill[3] is untimed skill.
		Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
		Config.AttackSkill[6] = -1; // Secondary untimed skill if monster is immune to primary untimed.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Timed low mana skill.
		Config.LowManaSkill[1] = -1; // Untimed low mana skill.

		Config.Curse[0] = 0; // Boss curse. Use skill number or set to 0 to disable.
		Config.Curse[1] = 0; // Other monsters curse. Use skill number or set to 0 to disable.

		Config.ExplodeCorpses = 0; // Explode corpses. Use skill number or 0 to disable. 74 = Corpse Explosion, 83 = Poison Explosion
		Config.Golem = "None"; // Golem. 0 or "None" = don't summon, 1 or "Clay" = Clay Golem, 2 or "Blood" = Blood Golem, 3 or "Fire" = Fire Golem
		Config.Skeletons = 0; // Number of skeletons to raise. Set to "max" to auto detect, set to 0 to disable.
		Config.SkeletonMages = 0; // Number of skeleton mages to raise. Set to "max" to auto detect, set to 0 to disable.
		Config.Revives = 0; // Number of revives to raise. Set to "max" to auto detect, set to 0 to disable.
		Config.PoisonNovaDelay = 2; // Delay between two Poison Novas in seconds.
		Config.ActiveSummon = false; // Raise dead between each attack. If false, it will raise after clearing a spot.
		Config.ReviveUnstackable = true; // Revive monsters that can move freely after you teleport.
		Config.IronGolemChicken = 30; // Exit game if Iron Golem's life is less or equal to designated percent.

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}

	//	PALADIN
	if (me.classid === 3) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill to bosses.
		Config.AttackSkill[2] = -1; // Primary aura to bosses
		Config.AttackSkill[3] = -1; // Primary skill to others.
		Config.AttackSkill[4] = -1; // Primary aura to others.
		Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
		Config.AttackSkill[6] = -1; // Secondary aura.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Timed low mana skill.
		Config.LowManaSkill[1] = -1; // Secondary aura.

		Config.AvoidDolls = false; // Try to attack dolls from a greater distance with hammerdins.
		Config.Vigor = true; // Swith to Vigor when running
		Config.Charge = true; // Use Charge when running
		Config.Redemption = [50, 50]; // Switch to Redemption after clearing an area if under designated life or mana. Format: [lifepercent, manapercent]

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}

	//	BARBARIAN
	if (me.classid === 4) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill for bosses.
		Config.AttackSkill[2] = -1; // Backup/Immune skill for bosses.
		Config.AttackSkill[3] = -1; // Primary skill for others.
		Config.AttackSkill[4] = -1; // Backup/Immune skill for others.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Low mana skill.

		Config.FindItem = false; // Use Find Item skill on corpses after clearing.
		Config.FindItemSwitch = false; // Switch to non-primary slot when using Find Item skills

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}

	//	DRUID
	if (me.classid === 5) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill to bosses.
		Config.AttackSkill[2] = -1; // Primary untimed skill to bosses. Keep at -1 if Config.AttackSkill[1] is untimed skill.
		Config.AttackSkill[3] = -1; // Primary skill to others.
		Config.AttackSkill[4] = -1; // Primary untimed skill to others. Keep at -1 if Config.AttackSkill[3] is untimed skill.
		Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
		Config.AttackSkill[6] = -1; // Secondary untimed skill if monster is immune to primary untimed.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Timed low mana skill.
		Config.LowManaSkill[1] = -1; // Untimed low mana skill.

		Config.SummonRaven = false;
		Config.SummonAnimal = "Grizzly"; // 0 = disabled, 1 or "Spirit Wolf" = summon spirit wolf, 2 or "Dire Wolf" = summon dire wolf, 3 or "Grizzly" = summon grizzly
		Config.SummonSpirit = "Oak Sage"; // 0 = disabled, 1 / "Oak Sage", 2 / "Heart of Wolverine", 3 / "Spirit of Barbs"
		Config.SummonVine = "Poison Creeper"; // 0 = disabled, 1 / "Poison Creeper", 2 / "Carrion Vine", 3 / "Solar Creeper"

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}

	//	ASSASSIN
	if (me.classid === 6) {
		/* Attack config
		 * To disable an attack, set it to -1
		 * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
		 */
		Config.AttackSkill[0] = -1; // Preattack skill.
		Config.AttackSkill[1] = -1; // Primary skill to bosses.
		Config.AttackSkill[2] = -1; // Primary untimed skill to bosses. Keep at -1 if Config.AttackSkill[1] is untimed skill.
		Config.AttackSkill[3] = -1; // Primary skill to others.
		Config.AttackSkill[4] = -1; // Primary untimed skill to others. Keep at -1 if Config.AttackSkill[3] is untimed skill.
		Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
		Config.AttackSkill[6] = -1; // Secondary untimed skill if monster is immune to primary untimed.

		// Low mana skills - these will be used if main skills can't be cast.
		Config.LowManaSkill[0] = -1; // Timed low mana skill.
		Config.LowManaSkill[1] = -1; // Untimed low mana skill.

		Config.UseTraps = true; // Set to true to use traps
		Config.Traps = [271, 271, 271, 276, 276]; // Skill IDs for traps to be cast on all mosters except act bosses.
		Config.BossTraps = [271, 271, 271, 271, 271]; // Skill IDs for traps to be cast on act bosses.

		Config.SummonShadow = "Master"; // 0 = don't summon, 1 or "Warrior" = summon Shadow Warrior, 2 or "Master" = summon Shadow Master
		Config.UseFade = true; // Set to true to use Fade prebuff.
		Config.UseBoS = false; // Set to true to use Burst of Speed prebuff. TODO: Casting in town + UseFade compatibility
		Config.UseVenom = false; // Set to true to use Venom prebuff. Set to false if you don't have the skill and have Arachnid Mesh - it will cause connection drop otherwise.
		Config.UseCloakofShadows = true; // Set to true to use Cloak of Shadows while fighting. Useful for blinding regular monsters/minions.
		Config.AggressiveCloak = false; // Move into Cloak range or cast if already close

		Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
		Config.AutoSkill.Build = [];

		Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
		Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
		Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
		Config.AutoStat.Build = [];

		Config.AutoBuild.Template = "BuildName";	//	The name of the build associated with an existing template filename located in libs/config/Builds/
	}
}
