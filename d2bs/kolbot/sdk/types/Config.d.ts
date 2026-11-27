export type DiabloSeal = "vizier" | "seis" | "infector";

declare global {
  // interface Scripts { [data: string]: Partial<Config> | boolean }
  type ExtendedCubingOpts = { Ethereal: number; MaxQuantity: number; condition: () => boolean };
  type CubingRecipe = [number, string] | [number, string, number] | [number, string, ExtendedCubingOpts];

  // Value shape of the global `Config` const in Config.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface IConfig {
    init(notify: boolean): void;
    Loaded: boolean;
    DebugMode: {
      Path: boolean;
      Stack: boolean;
      Memory: boolean;
      Skill: boolean;
      Town: boolean;
      Shrines: boolean;
    };

    // Experimental
    FastParty: boolean;
    AutoEquip: boolean;
    UseExperimentalAvoid: boolean;
    /**
     * Enables experimental walk clear level feature for non-teleporters
     */
    UseExperimentalClearLevel: boolean;

    StartDelay: number;
    PickDelay: number;
    AreaDelay: number;
    MinGameTime: number;
    MaxGameTime: number;
    UnpartyForMinGameTimeWait: boolean;
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
      /** Item quality codes to announce, see NTIPAliasQuality in core/GameData/NTItemAlias.js (e.g. [6, 7, 8]) */
      Quality: number[];
      LogToOOG: boolean;
      /** Item quality codes to announce to OOG, see NTIPAliasQuality in core/GameData/NTItemAlias.js */
      OOGQuality: number[];
    };
    CainID: {
      Enable: boolean;
      MinGold: number;
      MinUnids: number;
    };
    Inventory: number[][];
    SortSettings: {
      SortInventory: boolean;
      SortStash: boolean;
      PlugYStash: boolean;
      ItemsSortedFromLeft: number[];
      ItemsSortedFromRight: number[];
      PrioritySorting: boolean;
      ItemsSortedFromLeftPriority: number[];
      ItemsSortedFromRightPriority: number[];
    };
    LocalChat: {
      Enabled: boolean;
      Toggle: boolean;
      Mode: number;
    };
    Silence: boolean;
    PublicMode: boolean;
    PartyAfterScript: boolean;
    /** Random greeting messages; $name, $level, $class, $killer are substituted */
    Greetings: string[];
    /** Random death messages; $name, $level, $class, $killer are substituted */
    DeathMessages: string[];
    /** Random level-up congratulation messages; $name, $level, $class, $killer are substituted */
    Congratulations: string[];
    AnnounceGameTimeRemaing: boolean;
    ShitList: boolean;
    UnpartyShitlisted: boolean;
    Leader: string;
    /** Character names to quit with (or profile names if QuitListMode === 1) */
    QuitList: string[];
    QuitListMode: number;
    /** [min, max] random delay in seconds before quitting when using QuitList */
    QuitListDelay: number[];
    HPBuffer: number;
    MPBuffer: number;
    RejuvBuffer: number;
    PickRange: number;
    MakeRoom: boolean;
    ClearInvOnStart: boolean;
    FastPick: boolean;
    /** Range to use for FastPick; falls back to PickRange when unset/0 */
    FastPickRange: number;
    ManualPlayPick: boolean;
    OpenChests: {
      Enabled: boolean;
      Range: number;
      Types: string[];
    };
    /**
     * Each entry should be a tuple of [nipline, filename]
     * @example [["[name] == ThulRune # # [maxquantity] == 1", "HeartOfTheOak"]]
     */
    PickitLines: [string, string][];
    PickitFiles: string[];
    /** Potion type for each belt column, left to right; rejuvenation ("rv") must always be rightmost */
    BeltColumn: ("hp" | "mp" | "rv")[];
    /** Minimum amount of potions per belt column, left to right; rejuv columns must be 0 (can't be bought) */
    MinColumn: number[];
    SkipId: number[];
    SkipEnchant: string[];
    SkipImmune: string[];
    SkipAura: string[];
    SkipException: (number | string)[];
    AdvancedSkipCheck: (
      | {
          classid?: number;
          name?: string;
          spectype?: number;
          enchant?: number[];
          aura?: number[];
          immunity?: DamageType[];
        }
      | ((unit: Monster) => boolean)
    )[];
    ImmunityException: DamageType[];
    ScanShrines: number[];
    AutoShriner: boolean;
    UseWells: {
      HpPercent: number,
      MpPercent: number,
      StaminaPercent: number,
      StatusEffects: boolean,
    };
    Debug: boolean;
    AutoMule: {
      Trigger: (number | string | ((item: ItemUnit) => boolean))[];
      /** Items muled even if they're cubing ingredients; pickit-format string or item classid */
      Force: (number | string)[];
      /** Items ignored during muling; pickit-format string or item classid */
      Exclude: (number | string)[];
    };
    ItemInfo: boolean;
    /** Item quality codes to log, see NTIPAliasQuality in core/GameData/NTItemAlias.js (e.g. [6, 7, 8]) */
    ItemInfoQuality: number[];
    LogKeys: boolean;
    LogOrgans: boolean;
    LogLowRunes: boolean;
    LogMiddleRunes: boolean;
    LogHighRunes: boolean;
    LogLowGems: boolean;
    LogHighGems: boolean;
    /** Item codes (3-char) or classids to exclude from item logging */
    SkipLogging: (number | string)[];
    ShowCubingInfo: boolean;
    Cubing: boolean;
    CubeRepair: boolean;
    RepairPercent: number;
    Recipes: CubingRecipe[];
    MakeRunewords: boolean;
    /**
     * runeword, item name or id, ethereal (Roll.Eth, Roll.NonEth, Roll.Any or undefined), priority (number or undefined)
     * @example [Runeword.Enigma, 'Archon Plate', Roll.NonEth, 100]
     */
    Runewords: [runeword, string | number, boolean | undefined, number | undefined][];
    /** Keep-runeword nip lines; any matching runeword is kept regardless of which recipe produced it */
    KeepRunewords: string[];
    LadderOverride: boolean;
    Gamble: boolean;
    /** Item type names or classids to gamble for */
    GambleItems: (string | number)[];
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
    ChampionBias: number;
    UseCta: boolean;
    /** Anti-PK measure: force precast sequence (used by Baal/BaalHelper/BaalAssistant) */
    ForcePrecast: boolean;
    Dodge: boolean;
    DodgeRange: number;
    DodgeHP: number;
    /** Skill ids: [preAttack, primaryBoss, primaryBossUntimed, primaryOther, primaryOtherUntimed, secondary, secondaryUntimed]; -1 disables an entry */
    AttackSkill: number[];
    /** Skill ids used when main skills can't be cast: [timed, untimed]; -1 disables an entry */
    LowManaSkill: number[];
    CustomAttack: Record<string | number, [number, number]>;
    CustomPreAttack: Record<string | number, [number, number]>;
    AdvancedCustomAttack: { check: (unit: Monster) => boolean; attack: [number, number]; preAttack: number }[];
    TeleStomp: boolean;
    NoTele: boolean;
    /** Monster spectype to kill in level-clear scripts (ie. Mausoleum). 0xF = skip normal, 0x7 = champions/bosses, 0 = all */
    ClearType: number;
    /**
     * Monster spectype to kill while traveling, or a per-area config object.
     * A bare number applies everywhere with the default range (30). The object form limits
     * clearing to Areas (if given), using Range and Spectype; if Areas is omitted, all areas clear.
     */
    ClearPath: number | { Areas?: number[]; Range: number; Spectype: number };
    BossPriority: boolean;
    MaxAttackCount: number;
    LightningFuryDelay: number;
    UseInnerSight: boolean;
    UseSlowMissiles: boolean;
    UseDecoy: boolean;
    SummonValkyrie: boolean;
    UseTelekinesis: boolean;
    CastStatic: boolean;
    /** Monster names or classids to static */
    StaticList: (string | number)[];
    UseEnergyShield: boolean;
    UseColdArmor: boolean;
    /** 0/"None" = don't summon, 1/"Clay", 2/"Blood", 3/"Fire"; normalized to a skill id at runtime */
    Golem: number | string;
    ActiveSummon: boolean;
    Skeletons: number;
    SkeletonMages: number;
    Revives: number;
    ReviveUnstackable: boolean;
    PoisonNovaDelay: number;
    /** [bossCurseSkill, otherCurseSkill]; 0 disables an entry */
    Curse: number[];
    /**
     * [monsterNameOrClassid, skillId, spectype?] entries; spectype is a bitmask
     * (0x00 normal, 0x01 super unique, 0x02 champion, 0x04 boss, 0x08 minion)
     */
    CustomCurse: [string | number, number, number?][];
    ExplodeCorpses: number;
    /** [lifePercent, manaPercent] threshold to switch to Redemption after clearing an area */
    Redemption: number[];
    Charge: boolean;
    Vigor: boolean;
    /** Switch to Vigor only when stamina is low, instead of always while running */
    UseVigorOnLowStam: boolean;
    /** Aura skill id to use while running; ignored when Vigor is enabled */
    RunningAura: number;
    AvoidDolls: boolean;
    FindItem: boolean;
    /** Switch to non-primary weapon slot when using Find Item skills */
    FastFindItem: boolean;
    FindItemSwitch: boolean;
    UseWarcries: boolean;
    /** 0/false = don't shapeshift, 1/"Werewolf", 2/"Werebear" */
    Wereform: number | string | boolean;
    SummonRaven: number | boolean;
    /** 0/"None" = disabled, 1/"Spirit Wolf", 2/"Dire Wolf", 3/"Grizzly"; normalized to a skill id at runtime */
    SummonAnimal: number | string;
    /** 0/"None" = disabled, 1/"Poison Creeper", 2/"Carrion Vine", 3/"Solar Creeper"; normalized to a skill id at runtime */
    SummonVine: number | string;
    /** 0/"None" = disabled, 1/"Oak Sage", 2/"Heart of Wolverine", 3/"Spirit of Barbs"; normalized to a skill id at runtime */
    SummonSpirit: number | string;
    UseTraps: boolean;
    /** Skill ids for traps cast on all monsters except act bosses */
    Traps: number[];
    /** Skill ids for traps cast on act bosses */
    BossTraps: number[];
    UseFade: boolean;
    UseBoS: boolean;
    UseVenom: boolean;
    UseBladeShield: boolean;
    UseCloakofShadows: boolean;
    AggressiveCloak: boolean;
    /** 0/false = don't summon, 1/"Warrior", 2/"Master"; normalized to a skill id at runtime */
    SummonShadow: number | string | boolean;
    ChargeCast: {
      skill: number;
      spectype: number;
      classids: (number | string)[];
    };
    CustomClassAttack: string;
    MapMode: {
      UseOwnItemFilter: boolean;
    };

    Advertise: {
      Enabled: boolean;
      Message: string | string[];
      Interval: [number, number] | number;
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
      WalkClear: boolean;
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
      Silent: boolean;
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
      HotTPMessage: string[];
      SafeTPMessage: string[];
      BaalMessage: string[];
      NextGameMessage: string[];
      HurtBaal: number;
    };
    BaalHelper: {
      Wait: number;
      KillNihlathak: boolean;
      FastChaos: boolean;
      DollQuit: boolean;
      SoulQuit: boolean;
      KillBaal: boolean;
      SkipTP: boolean;
      HurtBaal: number;
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
      /** Monster spectype to kill while following path to seals. 0xF = skip normal, 0x7 = champions/bosses, 0 = all */
      ClearType: number;
      SealOrder: DiabloSeal[];
    };
    DiabloHelper: {
      Wait: number;
      Entrance: boolean;
      SkipIfBaal: boolean;
      SkipTP: boolean;
      OpenSeals: boolean;
      SafePrecast: boolean;
      ClearRadius: number;
      SealOrder: DiabloSeal[];
      RecheckSeals: boolean;
      HurtDiablo: number;
    };
    AutoChaos: {
      Leader: string;
      /**
       * -1 = go to town during diablo, 0 = kill to death, x > 0 = kill to x%
       */
      Diablo: number;
      Taxi: boolean;
      /**
       * set true to search for shrine only
       */
      FindShrine: boolean;
      /**
       * true = get shrine from act 1 (requires another character running FindShrine)
       */
      UseShrine: boolean;
      /**
       * set true for low level EXP glitcher (unimplemented)
       */
      Glitcher: boolean;
      /**
       * true = don't enter seals after boing at river, false = normal character that fights
       */
      BO: boolean;
      /**
       * true = hide during diablo, false = stay at star
       */
      Leech: boolean;
      /**
       * true = ranged character, false = melee character
       */
      Ranged: boolean;
      /**
       * Classes required to start the chaos run set to true to require that class
       */
      RequireClass: Record<keyof SDK["player"]["class"], boolean>;
      /**
       * true = does precast sequence at every seal, false = does not precast at seal
       */
      SealPrecast: boolean;
      /**
       * preattack count at each seal, useful for clearing tp's for safer entry,
       * enter values in the following order: [/vizier/, /seis/, /infector/]
       */
      PreAttack: number[];
      /**
       * order in which the taxi will go through cs: 1 = vizier, 2 = seis, 3 = infector
       */
      SealOrder: number[];
      /**
       * number of seconds to wait before entering hot tp
       */
      SealDelay: number;
    };
    MFHelper: {
      BreakClearLevel: boolean;
      BreakOnDiaBaal: boolean;
    };
    Wakka: {
      Wait: number;
      StopAtLevel: number;
      StopProfile: boolean;
      SkipIfBaal: boolean;
    };
    BattleOrders: {
      Mode: number;
      /** Player names to wait for before casting Battle Orders (mode 0) */
      Getters: string[];
      Idle: boolean;
      QuitOnFailure: boolean;
      SkipIfTardy: boolean;
      Wait: number;
    };
    BoBarbHelper: {
      Mode: number;
      Wp: number;
    };
    Idle: {
      Advertise: boolean;
      AdvertiseMessage: string;
      MaxGameLength: number;
    };
    ControlBot: {
      WelcomePlayers: boolean;
      Bo: boolean;
      DropGold: boolean;
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
        Gidbinn: boolean;
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
      MinGameLength: number;
      NGVoting: boolean;
      NGVoteCooldown: number;
    };
    IPHunter: {
      /** IP address octets to look for, e.g. [165, 201, 64] */
      IPList: number[];
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
      /** Item classids to scan, or item names (case/whitespace-insensitive, resolved via NTIPAliasClassID); empty scans all */
      ScanIDs: (string | number)[];
      ShopNPC: string | string[];
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
          /** Area ids to chug thawing pots before entering, see sdk/txt/areas.txt */
          At: number[];
        };
        Antidote: {
          Drink: number;
          /** Area ids to chug antidote pots before entering, see sdk/txt/areas.txt */
          At: number[];
        };
      };
    };
    OrgTorchHelper: {
      Taxi: boolean;
      Helper: boolean;
      SkipTp: boolean;
      GetFade: boolean;
      UseWalkPath: boolean;
    };
    Synch: {
      /** Character names to wait for (legacy/unused - see libs/scripts/Synch.js) */
      WaitFor: string[];
    };
    TristramLeech: {
      Leader: string;
      Helper: boolean;
      Wait: number;
    };
    TombLeech: {
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
      /** Skill ids (legacy/unused field) */
      Skills: number[];
    };
    Bonesaw: {
      ClearDrifterCavern: boolean;
    };
    ChestMania: {
      /** Area ids to open chests in, see sdk/txt/areas.txt */
      Act1: number[];
      Act2: number[];
      Act3: number[];
      Act4: number[];
      Act5: number[];
    };
    ClearAnyArea: {
      /** Area ids to clear, see sdk/txt/areas.txt */
      AreaList: number[];
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
      RunDuriel: boolean;
    };
    GemHunter: {
      /** Area ids to hunt gem shrines in, see sdk/txt/areas.txt */
      AreaList: number[];
      /** Priority-ordered gem classids to keep in inventory, highest priority first */
      GemList: number[];
    };
    AutoSkill: {
      Enabled: boolean;
      Build: AutoSkillBuildEntry[];
      Save: number;
    };
    AutoStat: {
      Enabled: boolean;
      Build: AutoStatBuildEntry[];
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

  // Ambient value declaration (Skill/Attack/Misc precedent, but load-bearing here for a
  // different reason): without it, the hundreds of top-level `Config.X = ...` assignment
  // declarations in _BaseConfigFile.js and the config override files become Config's value
  // symbol, which TS widens into a module-flavored any ("module Config" on hover, any members).
  const Config: IConfig;
}
