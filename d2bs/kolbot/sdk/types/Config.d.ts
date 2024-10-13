/**
*  @filename    Config.js
*  @author      kolton
*  @desc        config loading and default config values storage
*
*/

declare global {
  // interface Scripts { [data: string]: Partial<Config> | boolean }
  interface Config {
    init(notify: any): void;
    Loaded: boolean;
    DebugMode: {
      Path: boolean,
      Stack: boolean,
      Memory: boolean,
      Skill: boolean,
      Town: boolean,
    };
    StartDelay: number;
    PickDelay: number;
    AreaDelay: number;
    MinGameTime: number;
    MaxGameTime: number;
    LifeChicken: number;
    ManaChicken: number;
    UseHP: number;
    UseMP: number;
    UseRejuvHP: number;
    UseRejuvMP: number;
    UseMercHP: number;
    UseMercRejuv: number;
    MercChicken: number;
    IronGolemChicken: number;
    HealHP: number;
    HealMP: number;
    HealStatus: boolean;
    TownHP: number;
    TownMP: number;
    StackThawingPots: {
      enabled: boolean;
      quantity: number;
    };
    StackAntidotePots: {
      enabled: boolean;
      quantity: number;
    };
    StackStaminaPots: {
      enabled: boolean;
      quantity: number;
    };
    AutoMap: boolean;
    LastMessage: string;
    UseMerc: boolean;
    MercWatch: boolean;
    LowGold: number;
    StashGold: number;
    FieldID: {
      Enabled: boolean;
      PacketID: boolean;
      UsedSpace: number;
    };
    DroppedItemsAnnounce: {
      Enable: boolean;
      Quality: any[];
      LogToOOG: boolean;
      OOGQuality: any[];
    };
    CainID: {
      Enable: boolean;
      MinGold: number;
      MinUnids: number;
    };
    Inventory: number[][];
    LocalChat: {
      Enabled: boolean;
      Toggle: boolean;
      Mode: number;
    };
    Silence: boolean;
    PublicMode: boolean;
    PartyAfterScript: boolean;
    Greetings: any[];
    DeathMessages: any[];
    Congratulations: any[];
    ShitList: boolean;
    UnpartyShitlisted: boolean;
    Leader: string;
    QuitList: any[];
    QuitListMode: number;
    QuitListDelay: any[];
    HPBuffer: number;
    MPBuffer: number;
    RejuvBuffer: number;
    PickRange: number;
    MakeRoom: boolean;
    ClearInvOnStart: boolean;
    FastPick: boolean;
    ManualPlayPick: boolean;
    OpenChests: {
      Enabled: boolean;
      Range: number;
      Types: string[];
    };
    PickitLines: [string, string][];
    PickitFiles: string[];
    BeltColumn: any[];
    MinColumn: any[];
    SkipId: any[];
    SkipEnchant: any[];
    SkipImmune: any[];
    SkipAura: any[];
    SkipException: any[];
    ScanShrines: any[];
    Debug: boolean;
    AutoMule: {
      Trigger: any[];
      Force: any[];
      Exclude: any[];
    };
    ItemInfo: boolean;
    ItemInfoQuality: any[];
    LogKeys: boolean;
    LogOrgans: boolean;
    LogLowRunes: boolean;
    LogMiddleRunes: boolean;
    LogHighRunes: boolean;
    LogLowGems: boolean;
    LogHighGems: boolean;
    SkipLogging: any[];
    ShowCubingInfo: boolean;
    Cubing: boolean;
    CubeRepair: boolean;
    RepairPercent: number;
    Recipes: any[];
    MakeRunewords: boolean;
    Runewords: any[][];
    KeepRunewords: any[];
    Gamble: boolean;
    GambleItems: any[];
    GambleGoldStart: number;
    GambleGoldStop: number;
    MiniShopBot: boolean;
    TeleSwitch: boolean;
    MFSwitchPercent: number;
    PrimarySlot: number;
    LogExperience: boolean;
    TownCheck: boolean;
    PingQuit: {
      Ping: number;
      Duration: number;
    }[];
    PacketShopping: boolean;
    FCR: number;
    FHR: number;
    FBR: number;
    IAS: number;
    PacketCasting: number;
    WaypointMenu: boolean;
    AntiHostile: boolean;
    RandomPrecast: boolean;
    HostileAction: number;
    TownOnHostile: boolean;
    ViperCheck: boolean;
    StopOnDClone: boolean;
    SoJWaitTime: number;
    KillDclone: boolean;
    DCloneQuit: boolean;
    DCloneWaitTime: number;
    FastParty: boolean;
    AutoEquip: boolean;
    ChampionBias: number;
    UseCta: boolean;
    Dodge: boolean;
    DodgeRange: number;
    DodgeHP: number;
    AttackSkill: any[];
    LowManaSkill: any[];
    CustomAttack: {};
    TeleStomp: boolean;
    NoTele: boolean;
    ClearType: boolean;
    ClearPath: boolean;
    BossPriority: boolean;
    MaxAttackCount: number;
    LightningFuryDelay: number;
    UseInnerSight: boolean;
    UseSlowMissiles: boolean;
    UseDecoy: boolean;
    SummonValkyrie: boolean;
    UseTelekinesis: boolean;
    CastStatic: boolean;
    StaticList: any[];
    UseEnergyShield: boolean;
    UseColdArmor: boolean;
    Golem: number;
    ActiveSummon: boolean;
    Skeletons: number;
    SkeletonMages: number;
    Revives: number;
    ReviveUnstackable: boolean;
    PoisonNovaDelay: number;
    Curse: any[];
    CustomCurse: any[];
    ExplodeCorpses: number;
    Redemption: number[];
    Charge: boolean;
    Vigor: boolean;
    AvoidDolls: boolean;
    FindItem: boolean;
    FindItemSwitch: boolean;
    UseWarcries: boolean;
    Wereform: number;
    SummonRaven: number;
    SummonAnimal: number;
    SummonVine: number;
    SummonSpirit: number;
    UseTraps: boolean;
    Traps: any[];
    BossTraps: any[];
    UseFade: boolean;
    UseBoS: boolean;
    UseVenom: boolean;
    UseBladeShield: boolean;
    UseCloakofShadows: boolean;
    AggressiveCloak: boolean;
    SummonShadow: boolean;
    ChargeCast: {
      skill: number;
      spectype: number;
      classids: (number | string)[];
    };
    CustomClassAttack: string;
    MapMode: {
      UseOwnItemFilter: boolean;
    };
    MFLeader: boolean;
    Mausoleum: {
      KillBishibosh: boolean;
      KillBloodRaven: boolean;
      ClearCrypt: boolean;
    };
    Cows: {
      DontMakePortal: boolean;
      JustMakePortal: boolean;
      KillKing: boolean;
    };
    Tombs: {
      KillDuriel: boolean;
    };
    Eldritch: {
      OpenChest: boolean;
      KillSharptooth: boolean;
      KillShenk: boolean;
      KillDacFarren: boolean;
    };
    Pindleskin: {
      UseWaypoint: boolean;
      KillNihlathak: boolean;
      ViperQuit: boolean;
    };
    Nihlathak: {
      ViperQuit: boolean;
      UseWaypoint: boolean;
    };
    Pit: {
      ClearPath: boolean;
      ClearPit1: boolean;
    };
    Snapchip: {
      ClearIcyCellar: boolean;
    };
    Frozenstein: {
      ClearFrozenRiver: boolean;
    };
    Rakanishu: {
      KillGriswold: boolean;
    };
    AutoBaal: {
      Leader: string;
      FindShrine: boolean;
      LeechSpot: number[];
      LongRangeSupport: boolean;
    };
    KurastChests: {
      LowerKurast: boolean;
      Bazaar: boolean;
      Sewers1: boolean;
      Sewers2: boolean;
    };
    Countess: {
      KillGhosts: boolean;
    };
    Baal: {
      DollQuit: boolean;
      SoulQuit: boolean;
      KillBaal: boolean;
      HotTPMessage: string;
      SafeTPMessage: string;
      BaalMessage: string;
    };
    BaalAssistant: {
      KillNihlathak: boolean;
      FastChaos: boolean;
      Wait: number;
      Helper: boolean;
      GetShrine: boolean;
      GetShrineWaitForHotTP: boolean;
      DollQuit: boolean;
      SoulQuit: boolean;
      SkipTP: boolean;
      WaitForSafeTP: boolean;
      KillBaal: boolean;
      HotTPMessage: any[];
      SafeTPMessage: any[];
      BaalMessage: any[];
      NextGameMessage: any[];
    };
    BaalHelper: {
      Wait: number;
      KillNihlathak: boolean;
      FastChaos: boolean;
      DollQuit: boolean;
      KillBaal: boolean;
      SkipTP: boolean;
    };
    Corpsefire: {
      ClearDen: boolean;
    };
    Hephasto: {
      ClearRiver: boolean;
      ClearType: boolean;
    };
    Diablo: {
      WalkClear: boolean;
      Entrance: boolean;
      JustViz: boolean;
      SealLeader: boolean;
      Fast: boolean;
      SealWarning: string;
      EntranceTP: string;
      StarTP: string;
      DiabloMsg: string;
      ClearRadius: number;
      SealOrder: string[];
    };
    DiabloHelper: {
      Wait: number;
      Entrance: boolean;
      SkipIfBaal: boolean;
      SkipTP: boolean;
      OpenSeals: boolean;
      SafePrecast: boolean;
      ClearRadius: number;
      SealOrder: string[];
      RecheckSeals: boolean;
    };
    MFHelper: {
      BreakClearLevel: boolean;
    };
    Wakka: {
      Wait: number;
      StopAtLevel: number;
      StopProfile: boolean;
      SkipIfBaal: boolean;
    };
    BattleOrders: {
      Mode: number;
      Getters: any[];
      Idle: boolean;
      QuitOnFailure: boolean;
      SkipIfTardy: boolean;
      Wait: number;
    };
    BoBarbHelper: {
      Mode: number;
      Wp: number;
    };
    ControlBot: {
      Bo: boolean;
      Cows: {
        MakeCows: boolean;
        GetLeg: boolean;
      };
      Chant: {
        Enchant: boolean;
        AutoEnchant: boolean;
      };
      Wps: {
        GiveWps: boolean;
        SecurePortal: boolean;
      };
      Rush: {
        Bloodraven: boolean;
        Smith: boolean;
        Andy: boolean;
        Cube: boolean;
        Radament: boolean;
        Amulet: boolean;
        Staff: boolean;
        Summoner: boolean;
        Duriel: boolean;
        LamEsen: boolean;
        Eye: boolean;
        Heart: boolean;
        Brain: boolean;
        Travincal: boolean;
        Mephisto: boolean;
        Izual: boolean;
        Diablo: boolean;
        Shenk: boolean;
        Anya: boolean;
        Ancients: boolean;
        Baal: boolean;
      };
      EndMessage: string;
      GameLength: number;
    };
    IPHunter: {
      IPList: any[];
      GameLength: number;
    };
    Follower: {
      Leader: string;
    };
    Mephisto: {
      MoatTrick: boolean;
      KillCouncil: boolean;
      TakeRedPortal: boolean;
    };
    ShopBot: {
      ScanIDs: any[];
      ShopNPC: string;
      CycleDelay: number;
      QuitOnMatch: boolean;
    };
    Coldworm: {
      KillBeetleburst: boolean;
      ClearMaggotLair: boolean;
    };
    Summoner: {
      FireEye: boolean;
    };
    AncientTunnels: {
      OpenChest: boolean;
      KillDarkElder: boolean;
    };
    OrgTorch: {
      WaitForKeys: boolean;
      WaitTimeout: boolean;
      UseSalvation: boolean;
      GetFade: boolean;
      MakeTorch: boolean;
      PreGame: {
        Thawing: {
          Drink: number;
          At: any[];
        };
        Antidote: {
          Drink: number;
          At: any[];
        };
      };
    };
    Synch: {
      WaitFor: any[];
    };
    TristramLeech: {
      Leader: string;
      Helper: boolean;
      Wait: number;
    };
    TravincalLeech: {
      Leader: string;
      Helper: boolean;
      Wait: number;
    };
    Tristram: {
      PortalLeech: boolean;
      WalkClear: boolean;
    };
    Travincal: {
      PortalLeech: boolean;
    };
    SkillStat: {
      Skills: any[];
    };
    Bonesaw: {
      ClearDrifterCavern: boolean;
    };
    ChestMania: {
      Act1: any[];
      Act2: any[];
      Act3: any[];
      Act4: any[];
      Act5: any[];
    };
    ClearAnyArea: {
      AreaList: any[];
    };
    Rusher: {
      WaitPlayerCount: number;
      Cain: boolean;
      Radament: boolean;
      LamEsen: boolean;
      Izual: boolean;
      Shenk: boolean;
      Anya: boolean;
      HellAncients: boolean;
      GiveWps: boolean;
      LastRun: string;
    };
    Rushee: {
      Quester: boolean;
      Bumper: boolean;
      Protector: boolean;
    };
    Questing: {
      StopProfile: boolean;
    };
    GetEssences: {
      MoatMeph: boolean;
      FastDiablo: boolean;
    };
    AutoSkill: {
      Enabled: boolean;
      Build: any[];
      Save: number;
    };
    AutoStat: {
      Enabled: boolean;
      Build: any[];
      Save: number;
      BlockChance: number;
      UseBulk: boolean;
    };
    AutoBuild: {
      Enabled: boolean;
      Template: string;
      Verbose: boolean;
      DebugMode: boolean;
    };
  }
  const Config: Config;
}
export {};
