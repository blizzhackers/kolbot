/**
*
* Instructions:	See /d2bs/kolbot/libs/config/Builds/README.txt
*
* Skill IDs:	See /d2bs/kolbot/sdk/skills.txt for a list of skill IDs.
*
* Stat IDs:
*
* 	Strength	= 0
* 	Energy		= 1
* 	Dexterity	= 2
* 	Vitality	= 3
*
*/

// Barbarian config file

/* Brief instructions:
 * Use any IDE to modify these files, Sublime Text 3, Visual Studio Code, NotePad++
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

//SimoneFerita refactoring

js_strict(true);

if (!isIncluded("common/Cubing.js")) { include("common/Cubing.js"); };
if (!isIncluded("common/Prototypes.js")) { include("common/Prototypes.js"); };
if (!isIncluded("common/Runewords.js")) { include("common/Runewords.js"); };
if (!isIncluded("common/Town.js")) { include("common/Town.js"); };

var AutoBuildTemplate = {

	1:	{
			//SkillPoints: [-1],											// This doesn't matter. We don't have skill points to spend at lvl 1
			//StatPoints: [-1,-1,-1,-1,-1],								// This doesn't matter. We don't have stat points to spend at lvl 1
			Update: function () {

				Scripts.ClearAnyArea = true;							// We are only level 1 so we will start by clearing Blood Moor
					Config.ClearAnyArea.AreaList = [2];
				Config.ClearType = 0; 									// Monster spectype to kill in level clear scripts (0 = all)

				// Config.PickitFiles.push("level/1.nip");				// File "level/1.nip" is not included, it's just an example.

				Config.OpenChests		= true; 						// Open chests. Controls key buying.
				Config.LogExperience	= true; 						// Print experience statistics in the manager.
				Config.StashGold 		= 200;							// Minimum amount of gold to stash.
				Config.AttackSkill		= [-1, 0, -1, 0, -1, 0, -1];	// At level 1 we start with a +1 Fire Bolt staff
				Config.LowManaSkill		= [0, 0];
				Config.PublicMode		= 1;
				Config.ScanShrines		= [15, 13, 12, 14, 7, 6, 2];
				Config.BeltColumn		= ["hp", "hp", "hp", "mp"];		// Keep tons of health potions!
			}
		},

	2:	{
			SkillPoints: [36], 											// Fire Bolt + 1
			StatPoints: [0, 3, 3, 3, 3],								// Strength + 1 , Vitality + 4
			Update: function () {
				// Config.PickitFiles.splice(Config.PickitFiles.indexOf("level/1.nip"), 1);	// Will remove index "level/1.nip" from Config.PickitFiles
				// Config.PickitFiles.push("level/2.nip");
				Config.BeltColumn = ["hp", "hp", "mp", "mp"];
				Config.MinColumn = [1, 1, 1, 1];
			}
		},

	3:	{
			SkillPoints: [39], 										// Ice Bolt + 1
			StatPoints: [0, 0, 3, 3, 3],							// Strength + 2 , Vitality + 3
			Update: function () {
				Config.AttackSkill = [-1, 0, -1, 0, -1, 0, -1];		// Ice Bolt and Fire Bolt
			}
		},

	4:	{
			SkillPoints: [37],											// Warmth + 1
			StatPoints: [0, 0, 0, 3, 3],							// Strength + 3 , Vitality + 2
			Update: function () {
				Scripts.Corpsefire = true;							// Lets try Corpsefire now that we're level 4
					Config.Corpsefire.ClearDen = true;

				Scripts.ClearAnyArea = false;						// Don't want to clear Blood Moor anymore (See lvl 1 above)
					Config.ClearAnyArea.AreaList = [];

				Config.BeltColumn = ["hp", "hp", "hp", "mp"]; 		// Start keeping rejuvs since we have +1 Warmth
				Config.MinColumn	= [1, 1, 1, 0];
			}
		},

	5:	{
			SkillPoints: [38],											// Charged Bolt + 1
			StatPoints: [0, 0, 0, 0, 3],							// Strength + 4 , Vitality + 1
			Update: function () {

				Scripts.ClearAnyArea = true;						// Now we'll try enabling it again Cold Plains and Stony Field
					Config.ClearAnyArea.AreaList = [3, 4];

				Config.ScanShrines	= [15, 13, 12];
				Config.AttackSkill 	= [-1, 0, -1, 0, 0, 0, 0];	// All the bolts!
			}
		},

	6:	{
			SkillPoints: [36],											// Fire Bolt + 1
			StatPoints: [0, 0, 3, 3, 2],							// Strength + 2 , Vitality + 2, Dexterity + 1
			Update: function () {
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];	// All the bolts!
			}
		},

	7:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	8:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	9:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	10:	{
			SkillPoints: [36],											// Fire Bolt + 1
			StatPoints: [0, 0, 3, 3, 2],
			Update: function () {

				Scripts.ClearAnyArea = true;							// We are only level 1 so we will start by clearing Blood Moor
					Config.ClearAnyArea.AreaList = [19];
				Config.ClearType = 0;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
			}
		},

	11:	{

			StatPoints: [0, 0, 3, 3, 2],
			Update: function () {
				
				Scripts.ClearAnyArea = true;							// We are only level 1 so we will start by clearing Blood Moor
					Config.ClearAnyArea.AreaList = [3,4];
				Config.ClearType = 0;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
			}
		},

	12:	{
		
			StatPoints: [0, 0, 3, 3, 2],
			Update: function () {
					
				Scripts.ClearAnyArea = true;							// We are only level 1 so we will start by clearing Blood Moor
					Config.ClearAnyArea.AreaList = [3,4];
				Config.ClearType = 0;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
			}
		},

	13:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				Scripts.ClearAnyArea = true;							// We are only level 1 so we will start by clearing Blood Moor
				Config.ClearAnyArea.AreaList = [20,21,22,23,24,25];
				Config.ClearType = 0;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				Config.BeltColumn = ["hp", "hp", "hp", "mp"];
				
			}
		},

	14:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	15:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	16:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},


	17:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	18:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	19:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},


	20:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
											// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},
		
	21:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				
				
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	22:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	23:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	24:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
								// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to false to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [-1, 0, -1, 0, 0, 0, 0];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	25:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79,129,130,131];	
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				
				
				Config.AttackSkill = [149, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	26:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79,129,130,131];	
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				
				
				Config.AttackSkill = [149, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	27:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79,129,130,131];	
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				
				
				Config.AttackSkill = [149, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	28:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79,129,130,131];	
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				
				
				Config.AttackSkill = [149, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	29:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79,129,130,131];	
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				
				
				Config.AttackSkill = [149, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	30:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79,129,130,131];	
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				
				
				Config.AttackSkill = [149, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	31:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [39, 36, -1, 36, 0, 39, 38];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	32:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [39, 36, -1, 36, 0, 39, 38];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	33:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [39, 36, -1, 36, 0, 39, 38];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	34:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = true;
					Config.Corpsefire.ClearDen = true;
				Scripts.Mausoleum = true;
					Config.Mausoleum.KillBloodRaven = true;
					Config.Mausoleum.ClearCrypt = true;
				Scripts.Rakanishu = true;
					Config.Rakanishu.KillGriswold = true;
				Scripts.UndergroundPassage = true;
				Scripts.Coldcrow = true;
				Scripts.Tristram = true;
					Config.Tristram.WalkClear = true; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = true; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = true;
				Scripts.Smith = true;
				Scripts.BoneAsh = true;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = true;
				Scripts.Cows = true;
				
				Config.AttackSkill = [39, 36, -1, 36, 0, 39, 38];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	35:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},
		
	36:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	37:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	38:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	39:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	40:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	41:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},
		
	42:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	43:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	44:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	45:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	46:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	47:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	48:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	49:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	50:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	51:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	52:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	53:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	54:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	55:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	56:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	57:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	58:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	59:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	60:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	61:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},
		
	62:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	63:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	64:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	65:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	66:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	67:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	68:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	69:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	70:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	71:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	72:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	73:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	74:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},
		
	75:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	76:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	77:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	78:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	79:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	80:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	81:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	82:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	83:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},
		
	84:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	85:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	86:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	87:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	88:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	89:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	90:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	91:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	92:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	93:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				// *** act 2 ***
	Scripts.Radament = false;
	Scripts.Coldworm = false;
		Config.Coldworm.KillBeetleburst = false;
		Config.Coldworm.ClearMaggotLair = false; // Clear all 3 levels
	Scripts.AncientTunnels = false;
		Config.AncientTunnels.OpenChest = false; // Open special chest in Lost City
		Config.AncientTunnels.KillDarkElder = false;
	Scripts.Summoner = false;
		Config.Summoner.FireEye = false;
	Scripts.Tombs = false;
	Scripts.Duriel = false;

	// *** act 3 ***
	Scripts.Stormtree = false;
	Scripts.KurastTemples = false;
	Scripts.Icehawk = false;
	Scripts.Endugu = false;
	Scripts.Travincal = false;
		Config.Travincal.PortalLeech = false; // Set to false to open a portal for leechers.
	Scripts.Mephisto = false;
		Config.Mephisto.MoatTrick = false;
		Config.Mephisto.KillCouncil = false;
		Config.Mephisto.TakeRedPortal = false;

	// *** act 4 ***
	Scripts.OuterSteppes = false;
	Scripts.Izual = false;
	Scripts.Hephasto = false;
	Scripts.Vizier = false; // Intended for classic sorc, kills Vizier only.
	Scripts.FastDiablo = false;
	Scripts.Diablo = false;
		Config.Diablo.WalkClear = false; // Disable teleport while clearing to protect leechers
		Config.Diablo.Entrance = false; // Start from entrance
		Config.Diablo.SealWarning = "Leave the seals alone!";
		Config.Diablo.EntranceTP = "Entrance TP up";
		Config.Diablo.StarTP = "Star TP up";
		Config.Diablo.DiabloMsg = "Diablo";
	Scripts.SealLeader = false; // Clear a safe spot around seals and invite leechers in. Leechers should run SealLeecher script. Don't run with Diablo or FastDiablo.

	// *** act 5 ***
	Scripts.Pindleskin = false;
		Config.Pindleskin.UseWaypoint = false;
		Config.Pindleskin.KillNihlathak = false;
		Config.Pindleskin.ViperQuit = false; // End script if Tomb Vipers are found.
	Scripts.Nihlathak = false;
		Config.Nihlathak.ViperQuit = false; // End script if Tomb Vipers are found.
	Scripts.Eldritch = false;
		Config.Eldritch.OpenChest = false;
		Config.Eldritch.KillShenk = false;
		Config.Eldritch.KillDacFarren = false;
	Scripts.Eyeback = false;
	Scripts.SharpTooth = false;
	Scripts.ThreshSocket = false;
	Scripts.Abaddon = false;
	Scripts.Frozenstein = false;
		Config.Frozenstein.ClearFrozenRiver = false;
	Scripts.Bonesaw = false;
		Config.Bonesaw.ClearDrifterCavern = false;
	Scripts.Snapchip = false;
		Config.Snapchip.ClearIcyCellar = false;
	Scripts.Worldstone = false;
	Scripts.Baal = false;
		Config.Baal.HotTPMessage = "  ";
		Config.Baal.SafeTPMessage = "  ";
		Config.Baal.BaalMessage = "  ";
		Config.Baal.SoulQuit = false; // End script if Souls (Burning Souls) are found.
		Config.Baal.DollQuit = false; // End script if Dolls (Undead Soul Killers) are found.
		Config.Baal.KillBaal = false; // Kill Baal. Leaves game after wave 5 if false.

				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	94:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
				
				Config.MaxGameTime = 300;
				
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = false;
					Config.Pit.ClearPit1 = false;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				/* Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [79]; */
					
				Scripts.ClearAnyArea = true;						
					Config.ClearAnyArea.AreaList = [129,130,131];	
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	95:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	96:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	97:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	98:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		},

	99:	{
			
			StatPoints: [0, 3, 2],
			Update: function () {
						
				// *** act 1 ***
				Scripts.Corpsefire = false;
					Config.Corpsefire.ClearDen = false;
				Scripts.Mausoleum = false;
					Config.Mausoleum.KillBloodRaven = false;
					Config.Mausoleum.ClearCrypt = false;
				Scripts.Rakanishu = false;
					Config.Rakanishu.KillGriswold = false;
				Scripts.UndergroundPassage = false;
				Scripts.Coldcrow = false;
				Scripts.Tristram = false;
					Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
					Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
				Scripts.Pit = true;
					Config.Pit.ClearPit1 = true;
				Scripts.Treehead = false;
				Scripts.Smith = false;
				Scripts.BoneAsh = false;
				Scripts.Countess = true;
					Config.Countess.KillGhosts = true;
				Scripts.Andariel = false;
				Scripts.Cows = false;
				
				Config.AttackSkill = [137, 147, 147, 147, 147, 147, 147];
				Config.LowManaSkill = [-1,-1];
				
			}
		}
};
