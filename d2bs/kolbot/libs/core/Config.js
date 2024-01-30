/**
*  @filename    Config.js
*  @author      kolton, theBGuy
*  @desc        config loading and default config values storage
*
*/

const Scripts = {};

let Config = {
  init: function (notify = true) {
    const className = sdk.player.class.nameOf(me.classid);
    const formats = ((className, profile, charname, realm) => ({
      // Class.Profile.js
      1: className + "." + profile + ".js",
      // Realm.Class.Charname.js
      2: realm + "." + className + "." + charname + ".js",
      // Class.Charname.js
      3: className + "." + charname + ".js",
      // Profile.js
      4: profile + ".js",
      // Class.js
      5: className + ".js",
    }))(className, me.profile, me.charname, me.realm);
    let configFilename = "";

    for (let i = 0; i < 5; i++) {
      switch (i) {
      case 0: // Custom config
        includeIfNotIncluded("config/_customconfig.js");

        for (let n in CustomConfig) {
          if (CustomConfig.hasOwnProperty(n) && CustomConfig[n].includes(me.profile)) {
            notify && console.log("ÿc2Loading custom config: ÿc9" + n + ".js");
            configFilename = n + ".js";

            break;
          }
        }

        break;
      default:
        configFilename = formats[i];

        break;
      }

      if (configFilename && FileTools.exists("libs/config/" + configFilename)) {
        break;
      }
    }

    if (FileTools.exists("libs/config/" + configFilename)) {
      try {
        if (!include("config/" + configFilename)) {
          throw new Error();
        }
      } catch (e1) {
        throw new Error("Failed to load character config.");
      }
    } else {
      if (notify) {
        console.log("ÿc1" + className + "." + me.charname + ".js not found!"); // Use the primary format
        console.log("ÿc1Loading default config.");
      }

      // Try to find default config
      if (!FileTools.exists("libs/config/" + className + ".js")) {
        D2Bot.printToConsole("Not going well? Read the guides: https://github.com/blizzhackers/documentation");
        throw new Error("ÿc1Default config not found. \nÿc9     Try reading the kolbot guides.");
      }

      try {
        if (!include("config/" + className + ".js")) {
          throw new Error();
        }
        Config._defaultLoaded = true;
      } catch (e) {
        throw new Error("ÿc1Failed to load default config.");
      }
    }

    try {
      LoadConfig.call();
      Config.Loaded = true;
    } catch (e2) {
      if (notify) {
        // console.log("ÿc8Error in " + e2.fileName.substring(e2.fileName.lastIndexOf("\\") + 1, e2.fileName.length) + "(line " + e2.lineNumber + "): " + e2.message);
        console.error(e2);

        throw new Error("Config.init: Error in character config.");
      }
    }

    if (Config.Silence && !Config.LocalChat.Enabled) {
      // Override the say function with print, so it just gets printed to console
      global._say = global.say;
      global.say = (what) => console.log("Tryed to say: " + what);
    }

    try {
      if (Config.AutoBuild.Enabled === true && includeIfNotIncluded("core/Auto/AutoBuild.js")) {
        AutoBuild.initialize();
      }
    } catch (e3) {
      console.log("ÿc8Error in libs/core/AutoBuild.js (AutoBuild system is not active!)");
      console.error(e3);
    }
  },

  // dev
  _defaultLoaded: false,
  Loaded: false,
  DebugMode: {
    Path: false,
    Stack: false,
    Memory: false,
    Skill: false,
    Town: false,
  },

  // Time
  StartDelay: 0,
  PickDelay: 0,
  AreaDelay: 0,
  MinGameTime: 0,
  MaxGameTime: 0,

  // Healing and chicken
  LifeChicken: 0,
  ManaChicken: 0,
  UseHP: 0,
  UseMP: 0,
  UseRejuvHP: 0,
  UseRejuvMP: 0,
  UseMercHP: 0,
  UseMercRejuv: 0,
  MercChicken: 0,
  IronGolemChicken: 0,
  HealHP: 0,
  HealMP: 0,
  HealStatus: false,
  TownHP: 0,
  TownMP: 0,

  // special pots
  StackThawingPots: {
    enabled: false,
    quantity: 12,
  },
  StackAntidotePots: {
    enabled: false,
    quantity: 12,
  },
  StackStaminaPots: {
    enabled: false,
    quantity: 12,
  },

  // General
  AutoMap: false,
  LastMessage: "",
  UseMerc: false,
  MercWatch: false,
  LowGold: 0,
  StashGold: 0,
  FieldID: {
    Enabled: false,
    PacketID: true,
    UsedSpace: 90,
  },
  DroppedItemsAnnounce: {
    Enable: false,
    Quality: [],
    LogToOOG: false,
    OOGQuality: []
  },
  CainID: {
    Enable: false,
    MinGold: 0,
    MinUnids: 0
  },
  Inventory: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  SortSettings: {
    SortInventory: true,
    SortStash: true,
    PlugYStash: false,
    ItemsSortedFromLeft: [], // default: everything not in Config.ItemsSortedFromRight
    ItemsSortedFromRight: [
      // (NOTE: default pickit is fastest if the left side is open)
      sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm, // sort charms from the right
      sdk.items.TomeofIdentify, sdk.items.TomeofTownPortal, sdk.items.Key, // sort tomes and keys to the right
      // sort all inventory potions from the right
      sdk.items.RejuvenationPotion, sdk.items.FullRejuvenationPotion,
      sdk.items.MinorHealingPotion, sdk.items.LightHealingPotion,
      sdk.items.HealingPotion, sdk.items.GreaterHealingPotion, sdk.items.SuperHealingPotion,
      sdk.items.MinorManaPotion, sdk.items.LightManaPotion,
      sdk.items.ManaPotion, sdk.items.GreaterManaPotion, sdk.items.SuperManaPotion
    ],
    PrioritySorting: true,
    ItemsSortedFromLeftPriority: [/*605, 604, 603, 519, 518*/], // (NOTE: the earlier in the index, the further to the Left)
    ItemsSortedFromRightPriority: [
      // (NOTE: the earlier in the index, the further to the Right)
      // sort charms from the right, GC > LC > SC
      sdk.items.GrandCharm, sdk.items.LargeCharm, sdk.items.SmallCharm,
      sdk.items.TomeofIdentify, sdk.items.TomeofTownPortal, sdk.items.Key
    ],
  },
  LocalChat: {
    Enabled: false,
    Toggle: false,
    Mode: 0
  },
  Silence: false,
  PublicMode: false,
  PartyAfterScript: false,

  /** @type {string[]} */
  Greetings: [],

  /** @type {string[]} */
  DeathMessages: [],

  /** @type {string[]} */
  Congratulations: [],
  ShitList: false,
  UnpartyShitlisted: false,
  Leader: "",
  QuitList: [],
  QuitListMode: 0,
  QuitListDelay: [],
  HPBuffer: 0,
  MPBuffer: 0,
  RejuvBuffer: 0,
  PickRange: 40,
  MakeRoom: true,
  ClearInvOnStart: false,
  FastPick: false,
  ManualPlayPick: false,
  OpenChests: {
    Enabled: false,
    Range: 15,
    Types: ["chest", "chest3", "armorstand", "weaponrack"]
  },
  PickitFiles: [],
  BeltColumn: [],
  MinColumn: [],
  SkipId: [],
  SkipEnchant: [],
  SkipImmune: [],
  SkipAura: [],
  SkipException: [],
  ScanShrines: [],
  Debug: false,

  AutoMule: {
    Trigger: [],
    Force: [],
    Exclude: []
  },

  ItemInfo: false,
  ItemInfoQuality: [],

  LogKeys: false,
  LogOrgans: true,
  LogLowRunes: false,
  LogMiddleRunes: false,
  LogHighRunes: true,
  LogLowGems: false,
  LogHighGems: false,
  SkipLogging: [],
  ShowCubingInfo: true,

  Cubing: false,
  CubeRepair: false,
  RepairPercent: 40,
  Recipes: [],
  MakeRunewords: false,
  /**
   * @type {[runeword, string | number, ?boolean][]}
   */
  Runewords: [],
  KeepRunewords: [],
  LadderOveride: false,
  Gamble: false,
  GambleItems: [],
  GambleGoldStart: 0,
  GambleGoldStop: 0,
  MiniShopBot: false,
  TeleSwitch: false,
  MFSwitchPercent: 0,
  PrimarySlot: -1,
  LogExperience: false,
  TownCheck: false,
  PingQuit: [{ Ping: 0, Duration: 0 }],
  PacketShopping: false,

  // Fastmod
  FCR: 0,
  FHR: 0,
  FBR: 0,
  IAS: 0,
  PacketCasting: 0,
  WaypointMenu: true,

  // Anti-hostile
  AntiHostile: false,
  RandomPrecast: false,
  HostileAction: 0,
  TownOnHostile: false,
  ViperCheck: false,

  // DClone
  StopOnDClone: false,
  SoJWaitTime: 0,
  KillDclone: false,
  DCloneQuit: false,
  DCloneWaitTime: 30,

  // Experimental
  FastParty: false,
  AutoEquip: false,

  // GameData
  ChampionBias: 60,

  UseCta: true,
  ForcePrecast: false,

  // Attack specific
  Dodge: false,
  DodgeRange: 15,
  DodgeHP: 100,
  AttackSkill: [],
  LowManaSkill: [],
  CustomAttack: {},
  TeleStomp: false,
  NoTele: false,
  ClearType: false,
  ClearPath: false,
  BossPriority: false,
  MaxAttackCount: 300,
  ChargeCast: {
    skill: -1,
    spectype: 0x7,
  },

  // Amazon specific
  LightningFuryDelay: 0,
  UseInnerSight: false,
  UseSlowMissiles: false,
  UseDecoy: false,
  SummonValkyrie: false,

  // Sorceress specific
  UseTelekinesis: false,
  CastStatic: false,
  StaticList: [],
  UseEnergyShield: false,
  UseColdArmor: true,

  // Necromancer specific
  Golem: 0,
  ActiveSummon: false,
  Skeletons: 0,
  SkeletonMages: 0,
  Revives: 0,
  ReviveUnstackable: false,
  PoisonNovaDelay: 2000,
  Curse: [],
  CustomCurse: [],
  ExplodeCorpses: 0,

  // Paladin speficic
  Redemption: [0, 0],
  Charge: false,
  Vigor: false,
  AvoidDolls: false,

  // Barbarian specific
  FindItem: false,
  FastFindItem: false,
  FindItemSwitch: false,
  UseWarcries: true,

  // Druid specific
  Wereform: 0,
  SummonRaven: 0,
  SummonAnimal: 0,
  SummonVine: 0,
  SummonSpirit: 0,

  // Assassin specific
  UseTraps: false,
  Traps: [],
  BossTraps: [],
  UseFade: false,
  UseBoS: false,
  UseVenom: false,
  UseBladeShield: false,
  UseCloakofShadows: false,
  AggressiveCloak: false,
  SummonShadow: false,

  // Custom Attack
  CustomClassAttack: "", // If set it loads core/Attack/[CustomClassAttack].js

  MapMode: {
    UseOwnItemFilter: false,
  },

  // Script specific
  MFLeader: false,
  Mausoleum: {
    KillBishibosh: false,
    KillBloodRaven: false,
    ClearCrypt: false
  },
  Cows: {
    DontMakePortal: false,
    JustMakePortal: false,
    KillKing: false
  },
  Tombs: {
    KillDuriel: false,
    WalkClear: false,
  },
  Eldritch: {
    OpenChest: false,
    KillSharptooth: false,
    KillShenk: false,
    KillDacFarren: false
  },
  Pindleskin: {
    UseWaypoint: false,
    KillNihlathak: false,
    ViperQuit: false
  },
  Nihlathak: {
    ViperQuit: false,
    UseWaypoint: false,
  },
  Pit: {
    ClearPath: false,
    ClearPit1: false
  },
  Snapchip: {
    ClearIcyCellar: false
  },
  Frozenstein: {
    ClearFrozenRiver: false
  },
  Rakanishu: {
    KillGriswold: false
  },
  AutoBaal: {
    Leader: "",
    FindShrine: false,
    LeechSpot: [15115, 5050],
    LongRangeSupport: false
  },
  KurastChests: {
    LowerKurast: false,
    Bazaar: false,
    Sewers1: false,
    Sewers2: false
  },
  Countess: {
    KillGhosts: false
  },
  Baal: {
    DollQuit: false,
    SoulQuit: false,
    KillBaal: false,
    HotTPMessage: "Hot TP!",
    SafeTPMessage: "Safe TP!",
    BaalMessage: "Baal!"
  },
  BaalAssistant: {
    KillNihlathak: false,
    FastChaos: false,
    Wait: 120,
    Helper: false,
    GetShrine: false,
    GetShrineWaitForHotTP: false,
    DollQuit: false,
    SoulQuit: false,
    SkipTP: false,
    WaitForSafeTP: false,
    KillBaal: false,
    HotTPMessage: [],
    SafeTPMessage: [],
    BaalMessage: [],
    NextGameMessage: []
  },
  BaalHelper: {
    Wait: 120,
    KillNihlathak: false,
    FastChaos: false,
    DollQuit: false,
    KillBaal: false,
    SkipTP: false
  },
  Corpsefire: {
    ClearDen: false
  },
  Hephasto: {
    ClearRiver: false,
    ClearType: false
  },
  Diablo: {
    WalkClear: false,
    Entrance: false,
    JustViz: false,
    SealLeader: false,
    Fast: false,
    SealWarning: "Leave the seals alone!",
    EntranceTP: "Entrance TP up",
    StarTP: "Star TP up",
    DiabloMsg: "Diablo",
    ClearRadius: 30,
    SealOrder: ["vizier", "seis", "infector"]
  },
  DiabloHelper: {
    Wait: 120,
    Entrance: false,
    SkipIfBaal: false,
    SkipTP: false,
    OpenSeals: false,
    SafePrecast: true,
    ClearRadius: 30,
    SealOrder: ["vizier", "seis", "infector"],
    RecheckSeals: false
  },
  MFHelper: {
    BreakClearLevel: false
  },
  Wakka: {
    Wait: 1,
    StopAtLevel: 99,
    StopProfile: false,
    SkipIfBaal: true,
  },
  BattleOrders: {
    Mode: 0,
    Getters: [],
    Idle: false,
    QuitOnFailure: false,
    SkipIfTardy: true,
    Wait: 10
  },
  BoBarbHelper: {
    Mode: -1,
    Wp: 35
  },
  Idle: {
    Advertise: false,
    AdvertiseMessage: "",
    MaxGameLength: 0,
  },
  ControlBot: {
    Bo: false,
    DropGold: false,
    Cows: {
      MakeCows: false,
      GetLeg: false,
    },
    Chant: {
      Enchant: false,
      AutoEnchant: false,
    },
    Wps: {
      GiveWps: false,
      SecurePortal: false,
    },
    Rush: {
      Bloodraven: false,
      Smith: false,
      Andy: false,
      Cube: false,
      Radament: false,
      Amulet: false,
      Staff: false,
      Summoner: false,
      Duriel: false,
      LamEsen: false,
      Eye: false,
      Heart: false,
      Brain: false,
      Travincal: false,
      Mephisto: false,
      Izual: false,
      Diablo: false,
      Shenk: false,
      Anya: false,
      Ancients: false,
      Baal: false,
    },
    EndMessage: "",
    GameLength: 20
  },
  IPHunter: {
    IPList: [],
    GameLength: 3
  },
  Follower: {
    Leader: ""
  },
  Mephisto: {
    MoatTrick: false,
    KillCouncil: false,
    TakeRedPortal: false
  },
  ShopBot: {
    ScanIDs: [],
    ShopNPC: "anya",
    CycleDelay: 0,
    QuitOnMatch: false
  },
  Coldworm: {
    KillBeetleburst: false,
    ClearMaggotLair: false
  },
  Summoner: {
    FireEye: false
  },
  AncientTunnels: {
    OpenChest: false,
    KillDarkElder: false
  },
  OrgTorch: {
    WaitForKeys: false,
    WaitTimeout: 0,
    UseSalvation: false,
    GetFade: false,
    MakeTorch: true,
    PreGame: {
      Thawing: { Drink: 0, At: [] },
      Antidote: { Drink: 0, At: [] },
    }
  },
  Synch: {
    WaitFor: []
  },
  TristramLeech: {
    Leader: "",
    Helper: false,
    Wait: 5
  },
  TombLeech: {
    Leader: "",
    Helper: false,
    Wait: 5
  },
  TravincalLeech: {
    Leader: "",
    Helper: false,
    Wait: 5
  },
  Tristram: {
    PortalLeech: false,
    WalkClear: false
  },
  Travincal: {
    PortalLeech: false
  },
  SkillStat: {
    Skills: []
  },
  Bonesaw: {
    ClearDrifterCavern: false
  },
  ChestMania: {
    Act1: [],
    Act2: [],
    Act3: [],
    Act4: [],
    Act5: []
  },
  ClearAnyArea: {
    AreaList: []
  },
  Rusher: {
    WaitPlayerCount: 0,
    Cain: false,
    Radament: false,
    LamEsen: false,
    Izual: false,
    Shenk: false,
    Anya: false,
    HellAncients: false,
    GiveWps: false,
    LastRun: ""
  },
  Rushee: {
    Quester: false,
    Bumper: false
  },
  Questing: {
    StopProfile: false
  },
  GetEssences: {
    MoatMeph: false,
    FastDiablo: false,
  },
  GemHunter: {
    AreaList: [],
    GemList: []
  },
  AutoSkill: {
    Enabled: false,
    Build: [],
    Save: 0
  },
  AutoStat: {
    Enabled: false,
    Build: [],
    Save: 0,
    BlockChance: 0,
    UseBulk: true
  },
  AutoBuild: {
    Enabled: false,
    Template: "",
    Verbose: false,
    DebugMode: false
  }
};
