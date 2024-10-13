/* eslint-disable indent */
// Druid config file

/* Brief instructions:
 * Use any IDE to modify these files, Visual Studio Code (recommended), Atom, Sublime Text 3 (good), NotePad++ (not recommended)
 * 
 * Basic JS Rules:
 * To comment out something, put // in front of that line
 * !!!Never comment out something you're not sure about, set it to false or disable as noted in description if you don't want to use it.
 * true and false are case sensitive. Good: Config.SomeVar = true; Bad: Config.SomeVar = True;
 * Arrayname = [1, 0, 1] is an array. Elements in an Array need commas seperatings them
 * Array Example: Good: Config.QuitList = ["sorcCharname", "bobarbCharname"]; Bad: Config.QuitList = ["sorcCharname" "bobarbCharname"];
 * Types: "sorcCharname" is an example of a string. String elements need " " around them.
 * Continuing with QuitList this is Bad: Config.QuitList = [sorcCharname, bobarbCharname];
 * Javascript statements need to end with a semi-colon; Good: Scripts.Corpsefire = false; Bad: Scripts.Corpsefire = false
 */

include("manualplay/MapMode.js");

function LoadConfig() {
  MapMode.generalSettings();

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
  Config.LifeChicken = 0; // Exit game if life is less or equal to designated percent.
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
  Config.Inventory[0] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  Config.Inventory[1] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  Config.Inventory[2] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  Config.Inventory[3] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  /* Potion types for belt columns from left to right.
   * Rejuvenation potions must always be rightmost.
   * Supported potions - Healing ("hp"), Mana ("mp") and Rejuvenation ("rv")
   */
  Config.BeltColumn = ["hp", "mp", "mp", "rv"];

  // Pickit config. Default folder is kolbot/pickit.
  Config.PickitFiles.push("kolton.nip");
  Config.PickitFiles.push("LLD.nip");
  Config.ManualPlayPick = false; // If set to true and D2BotMap entry script is used, will enable picking in manual play.

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

  // General config
  Config.TeleSwitch = false; // Switch to secondary (non-primary) slot when teleporting more than 5 nodes.
  Config.OpenChests.Enabled = false; // Open chests. Controls key buying.
  Config.PingQuit = [{ Ping: 0, Duration: 0 }]; // Quit if ping is over the given value for over the given time period in seconds.

  // Shrine Scanner - scan for shrines while moving.
  // Put the shrine types in order of priority (from highest to lowest). For a list of types, see sdk/txt/shrines.txt
  Config.ScanShrines = [];

  // MF Switch
  Config.MFSwitchPercent = 0; // Boss life % to switch to non-primary weapon slot. Set to 0 to disable.

  // Anti-hostile config
  Config.AntiHostile = false; // Enable anti-hostile
  Config.HostileAction = 0; // 0 - quit immediately, 1 - quit when hostile player is sighted, 2 - attack hostile
  Config.TownOnHostile = false; // Go to town instead of quitting when HostileAction is 0 or 1
  Config.ViperCheck = false; // Quit if revived Tomb Vipers are sighted

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
  //Config.SkipException = [getLocaleString(sdk.locale.monsters.GrandVizierofChaos), getLocaleString(sdk.locale.monsters.LordDeSeis), getLocaleString(sdk.locale.monsters.InfectorofSouls)]; // vizier, de seis, infector

  /* Attack config
   * To disable an attack, set it to -1
   * Skills MUST be POSITIVE numbers. For reference see ...\kolbot\sdk\skills.txt
   * DO NOT LEAVE THE NEGATIVE SIGN IN FRONT OF THE SKILLID. GOOD: Config.AttackSkill[1] = 245; BAD: Config.AttackSkill[1] = -245;
   */

  Config.PrimarySlot = -1; // Set to use specific weapon slot as primary weapon slot: -1 = disabled, 0 = slot I, 1 = slot II
  Config.PacketCasting = 0; // 0 = disable, 1 = packet teleport, 2 = full packet casting.

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

  /* Advanced Attack config. Allows custom skills to be used on custom monsters.
   *	Format: "Monster Name": [timed skill id, untimed skill id]
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
  // Config.ClearPath = 0; // Monster spectype to kill while traveling. 0xF = skip normal, 0x7 = champions/bosses, 0 = all
  // Config.ClearPath = {
  // 	Areas: [74], // Specific areas to clear while traveling in. Comment out to clear in all areas
  // 	Range: 30, // Range to clear while traveling
  // 	Spectype: 0, // Monster spectype to kill while traveling. 0xF = skip normal, 0x7 = champions/bosses, 0 = all
  // };

  // Wereform setup. Make sure you read Templates/Attacks.txt for attack skill format.
  Config.Wereform = false; // 0 / false - don't shapeshift, 1 / "Werewolf" - change to werewolf, 2 / "Werebear" - change to werebear

  // Class specific config
  Config.SummonRaven = false;
  Config.SummonAnimal = "Grizzly"; // 0 = disabled, 1 or "Spirit Wolf" = summon spirit wolf, 2 or "Dire Wolf" = summon dire wolf, 3 or "Grizzly" = summon grizzly
  Config.SummonSpirit = "Oak Sage"; // 0 = disabled, 1 / "Oak Sage", 2 / "Heart of Wolverine", 3 / "Spirit of Barbs"
  Config.SummonVine = "Poison Creeper"; // 0 = disabled, 1 / "Poison Creeper", 2 / "Carrion Vine", 3 / "Solar Creeper"

  /* AutoSkill builds character based on array defined by the user and it replaces AutoBuild's skill system.
   * AutoSkill will automatically spend skill points and it can also allocate any prerequisite skills as required.
   *
   * Format: Config.AutoSkill.Build = [[skillID, count, satisfy], [skillID, count, satisfy], ... [skillID, count, satisfy]];
   *	skill - skill id number (see /sdk/txt/skills.txt)
   *	count - maximum number of skill points to allocate for that skill
   *	satisfy - boolean value to stop(true) or continue(false) further allocation until count is met. Defaults to true if not specified.
   *
   *	See libs/config/Templates/AutoSkillExampleBuilds.txt for Config.AutoSkill.Build examples.
   */
  Config.AutoSkill.Enabled = false; // Enable or disable AutoSkill system
  Config.AutoSkill.Save = 0; // Number of skill points that will not be spent and saved
  Config.AutoSkill.Build = [];

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
  Config.AutoStat.Save = 0; // Number stat points that will not be spent and saved.
  Config.AutoStat.BlockChance = 0; // An integer value set to desired block chance. This is ignored in classic.
  Config.AutoStat.UseBulk = true; // Set true to spend multiple stat points at once (up to 100), or false to spend singe point at a time.
  Config.AutoStat.Build = [];

  // AutoBuild System ( See /d2bs/kolbot/libs/config/Builds/README.txt for instructions )
  Config.AutoBuild.Enabled = false;	//	This will enable or disable the AutoBuild system

  //	The name of the build associated with an existing
  //	template filename located in libs/config/Builds/
  Config.AutoBuild.Template = "BuildName";
  //	Allows script to print messages in console
  Config.AutoBuild.Verbose = true;
  //	Debug mode prints a little more information to console and
  //	logs activity to /logs/AutoBuild.CharacterName._MM_DD_YYYY.log
  //	It automatically enables Config.AutoBuild.Verbose
  Config.AutoBuild.DebugMode = true;
}
