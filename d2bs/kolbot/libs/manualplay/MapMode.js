/**
*  @filename    MapMode.js
*  @author      theBGuy
*  @desc        Global settings Map-Mode
*
*/

const MapMode = {
  mapHelperFilePath: "libs/manualplay/threads/maphelper.js",
  include: function () {
    let files = dopen("libs/manualplay/libs/").getFiles();
    
    Array.isArray(files) && files
      .filter(file => file.endsWith(".js"))
      .forEach(function (x) {
        if (!isIncluded("manualplay/libs/" + x)) {
          if (!include("manualplay/libs/" + x)) {
            throw new Error("Failed to include " + "manualplay/libs/" + x);
          }
        }
      });
  },

  generalSettings: function () {
    Config.MapMode.UseOwnItemFilter = false; // set to true if you want to start with your own nip files as the loot filter vs starting with default.
    // General
    Config.WaypointMenu = true;
    Config.MiniShopBot = false; // Scan items in NPC shops.
    Config.PacketShopping = true; // Use packets to shop. Improves shopping speed.
    Config.TownCheck = false; // Go to town if out of potions
    
    // Additional item info log settings. All info goes to \logs\ItemLog.txt
    Config.ItemInfo = false; // Log stashed, skipped (due to no space) or sold items.
    Config.ItemInfoQuality = []; // The quality of sold items to log. See core/GameData/NTItemAlias.js for values. Example: Config.ItemInfoQuality = [6, 7, 8];

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

    // Gambling config
    Config.Gamble = false;
    Config.GambleGoldStart = 1000000;
    Config.GambleGoldStop = 500000;

    // List of item names or classids for gambling. Check libs/core/GameData/NTItemAlias.js file for other item classids.
    Config.GambleItems.push("Amulet");
    Config.GambleItems.push("Ring");
    Config.GambleItems.push("Circlet");
    Config.GambleItems.push("Coronet");

    // Party message settings. Each setting represents an array of messages that will be randomly chosen.
    // $name, $level, $class and $killer are replaced by the player's name, level, class and killer
    Config.Greetings = []; // Example: ["Hello, $name (level $level $class)"]
    Config.DeathMessages = []; // Example: ["Watch out for that $killer, $name!"]
    Config.Congratulations = []; // Example: ["Congrats on level $level, $name!"]
    Config.ShitList = false; // Blacklist hostile players so they don't get invited to party.
    Config.UnpartyShitlisted = false; // Leave party if someone invited a blacklisted player.
  },
};
