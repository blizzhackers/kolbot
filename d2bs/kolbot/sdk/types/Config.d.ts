/**
*  @filename    Config.js
*  @author      kolton
*  @desc        config loading and default config values storage
*
*/

declare global {
  // interface Scripts { [data: string]: Partial<Config> | boolean }
  namespace Config {
    function init(notify: any): void;
    const Loaded: boolean;
    const DebugMode: boolean;
    const StartDelay: number;
    const PickDelay: number;
    const AreaDelay: number;
    const MinGameTime: number;
    const MaxGameTime: number;
    const LifeChicken: number;
    const ManaChicken: number;
    const UseHP: number;
    const UseMP: number;
    const UseRejuvHP: number;
    const UseRejuvMP: number;
    const UseMercHP: number;
    const UseMercRejuv: number;
    const MercChicken: number;
    const IronGolemChicken: number;
    const HealHP: number;
    const HealMP: number;
    const HealStatus: boolean;
    const TownHP: number;
    const TownMP: number;
    namespace StackThawingPots {
      const enabled: boolean;
      const quantity: number;
    }
    namespace StackAntidotePots {
      const enabled_1: boolean;
      export { enabled_1 as enabled };
      const quantity_1: number;
      export { quantity_1 as quantity };
    }
    namespace StackStaminaPots {
      const enabled_2: boolean;
      export { enabled_2 as enabled };
      const quantity_2: number;
      export { quantity_2 as quantity };
    }
    const AutoMap: boolean;
    const LastMessage: string;
    const UseMerc: boolean;
    const MercWatch: boolean;
    const LowGold: number;
    const StashGold: number;
    namespace FieldID {
      const Enabled: boolean;
      const PacketID: boolean;
      const UsedSpace: number;
    }
    namespace DroppedItemsAnnounce {
      const Enable: boolean;
      const Quality: any[];
      const LogToOOG: boolean;
      const OOGQuality: any[];
    }
    namespace CainID {
      const Enable_1: boolean;
      export { Enable_1 as Enable };
      export const MinGold: number;
      export const MinUnids: number;
    }
    const Inventory: number[][];
    namespace LocalChat {
      const Enabled_1: boolean;
      export { Enabled_1 as Enabled };
      export const Toggle: boolean;
      export const Mode: number;
    }
    const Silence: boolean;
    const PublicMode: boolean;
    const PartyAfterScript: boolean;
    const Greetings: any[];
    const DeathMessages: any[];
    const Congratulations: any[];
    const ShitList: boolean;
    const UnpartyShitlisted: boolean;
    const Leader: string;
    const QuitList: any[];
    const QuitListMode: number;
    const QuitListDelay: any[];
    const HPBuffer: number;
    const MPBuffer: number;
    const RejuvBuffer: number;
    const PickRange: number;
    const MakeRoom: boolean;
    const ClearInvOnStart: boolean;
    const FastPick: boolean;
    const ManualPlayPick: boolean;
    namespace OpenChests {
      const Enabled_2: boolean;
      export { Enabled_2 as Enabled };
      export const Range: number;
      export const Types: string[];
    }
    const PickitFiles: any[];
    const BeltColumn: any[];
    const MinColumn: any[];
    const SkipId: any[];
    const SkipEnchant: any[];
    const SkipImmune: any[];
    const SkipAura: any[];
    const SkipException: any[];
    const ScanShrines: any[];
    const Debug: boolean;
    namespace AutoMule {
      const Trigger: any[];
      const Force: any[];
      const Exclude: any[];
    }
    const ItemInfo: boolean;
    const ItemInfoQuality: any[];
    const LogKeys: boolean;
    const LogOrgans: boolean;
    const LogLowRunes: boolean;
    const LogMiddleRunes: boolean;
    const LogHighRunes: boolean;
    const LogLowGems: boolean;
    const LogHighGems: boolean;
    const SkipLogging: any[];
    const ShowCubingInfo: boolean;
    const Cubing: boolean;
    const CubeRepair: boolean;
    const RepairPercent: number;
    const Recipes: any[];
    const MakeRunewords: boolean;
    const Runewords: any[][];
    const KeepRunewords: any[];
    const Gamble: boolean;
    const GambleItems: any[];
    const GambleGoldStart: number;
    const GambleGoldStop: number;
    const MiniShopBot: boolean;
    const TeleSwitch: boolean;
    const MFSwitchPercent: number;
    const PrimarySlot: number;
    const LogExperience: boolean;
    const TownCheck: boolean;
    const PingQuit: {
      Ping: number;
      Duration: number;
    }[];
    const PacketShopping: boolean;
    const FCR: number;
    const FHR: number;
    const FBR: number;
    const IAS: number;
    const PacketCasting: number;
    const WaypointMenu: boolean;
    const AntiHostile: boolean;
    const RandomPrecast: boolean;
    const HostileAction: number;
    const TownOnHostile: boolean;
    const ViperCheck: boolean;
    const StopOnDClone: boolean;
    const SoJWaitTime: number;
    const KillDclone: boolean;
    const DCloneQuit: boolean;
    const DCloneWaitTime: number;
    const FastParty: boolean;
    const AutoEquip: boolean;
    const ChampionBias: number;
    const UseCta: boolean;
    const Dodge: boolean;
    const DodgeRange: number;
    const DodgeHP: number;
    const AttackSkill: any[];
    const LowManaSkill: any[];
    const CustomAttack: {};
    const TeleStomp: boolean;
    const NoTele: boolean;
    const ClearType: boolean;
    const ClearPath: boolean;
    const BossPriority: boolean;
    const MaxAttackCount: number;
    const LightningFuryDelay: number;
    const UseInnerSight: boolean;
    const UseSlowMissiles: boolean;
    const UseDecoy: boolean;
    const SummonValkyrie: boolean;
    const UseTelekinesis: boolean;
    const CastStatic: boolean;
    const StaticList: any[];
    const UseEnergyShield: boolean;
    const UseColdArmor: boolean;
    const Golem: number;
    const ActiveSummon: boolean;
    const Skeletons: number;
    const SkeletonMages: number;
    const Revives: number;
    const ReviveUnstackable: boolean;
    const PoisonNovaDelay: number;
    const Curse: any[];
    const CustomCurse: any[];
    const ExplodeCorpses: number;
    const Redemption: number[];
    const Charge: boolean;
    const Vigor: boolean;
    const AvoidDolls: boolean;
    const FindItem: boolean;
    const FindItemSwitch: boolean;
    const UseWarcries: boolean;
    const Wereform: number;
    const SummonRaven: number;
    const SummonAnimal: number;
    const SummonVine: number;
    const SummonSpirit: number;
    const UseTraps: boolean;
    const Traps: any[];
    const BossTraps: any[];
    const UseFade: boolean;
    const UseBoS: boolean;
    const UseVenom: boolean;
    const UseBladeShield: boolean;
    const UseCloakofShadows: boolean;
    const AggressiveCloak: boolean;
    const SummonShadow: boolean;
    const CustomClassAttack: string;
    namespace MapMode {
      const UseOwnItemFilter: boolean;
    }
    const MFLeader: boolean;
    namespace Mausoleum {
      const KillBishibosh: boolean;
      const KillBloodRaven: boolean;
      const ClearCrypt: boolean;
    }
    namespace Cows {
      const DontMakePortal: boolean;
      const JustMakePortal: boolean;
      const KillKing: boolean;
    }
    namespace Tombs {
      const KillDuriel: boolean;
    }
    namespace Eldritch {
      const OpenChest: boolean;
      const KillSharptooth: boolean;
      const KillShenk: boolean;
      const KillDacFarren: boolean;
    }
    namespace Pindleskin {
      const UseWaypoint: boolean;
      const KillNihlathak: boolean;
      const ViperQuit: boolean;
    }
    namespace Nihlathak {
      const ViperQuit_1: boolean;
      export { ViperQuit_1 as ViperQuit };
      const UseWaypoint_1: boolean;
      export { UseWaypoint_1 as UseWaypoint };
    }
    namespace Pit {
      const ClearPath_1: boolean;
      export { ClearPath_1 as ClearPath };
      export const ClearPit1: boolean;
    }
    namespace Snapchip {
      const ClearIcyCellar: boolean;
    }
    namespace Frozenstein {
      const ClearFrozenRiver: boolean;
    }
    namespace Rakanishu {
      const KillGriswold: boolean;
    }
    namespace AutoBaal {
      const Leader_1: string;
      export { Leader_1 as Leader };
      export const FindShrine: boolean;
      export const LeechSpot: number[];
      export const LongRangeSupport: boolean;
    }
    namespace KurastChests {
      const LowerKurast: boolean;
      const Bazaar: boolean;
      const Sewers1: boolean;
      const Sewers2: boolean;
    }
    namespace Countess {
      const KillGhosts: boolean;
    }
    namespace Baal {
      const DollQuit: boolean;
      const SoulQuit: boolean;
      const KillBaal: boolean;
      const HotTPMessage: string;
      const SafeTPMessage: string;
      const BaalMessage: string;
    }
    namespace BaalAssistant {
      const KillNihlathak_1: boolean;
      export { KillNihlathak_1 as KillNihlathak };
      export const FastChaos: boolean;
      export const Wait: number;
      export const Helper: boolean;
      export const GetShrine: boolean;
      export const GetShrineWaitForHotTP: boolean;
      const DollQuit_1: boolean;
      export { DollQuit_1 as DollQuit };
      const SoulQuit_1: boolean;
      export { SoulQuit_1 as SoulQuit };
      export const SkipTP: boolean;
      export const WaitForSafeTP: boolean;
      const KillBaal_1: boolean;
      export { KillBaal_1 as KillBaal };
      const HotTPMessage_1: any[];
      export { HotTPMessage_1 as HotTPMessage };
      const SafeTPMessage_1: any[];
      export { SafeTPMessage_1 as SafeTPMessage };
      const BaalMessage_1: any[];
      export { BaalMessage_1 as BaalMessage };
      export const NextGameMessage: any[];
    }
    namespace BaalHelper {
      const Wait_1: number;
      export { Wait_1 as Wait };
      const KillNihlathak_2: boolean;
      export { KillNihlathak_2 as KillNihlathak };
      const FastChaos_1: boolean;
      export { FastChaos_1 as FastChaos };
      const DollQuit_2: boolean;
      export { DollQuit_2 as DollQuit };
      const KillBaal_2: boolean;
      export { KillBaal_2 as KillBaal };
      const SkipTP_1: boolean;
      export { SkipTP_1 as SkipTP };
    }
    namespace Corpsefire {
      const ClearDen: boolean;
    }
    namespace Hephasto {
      export const ClearRiver: boolean;
      const ClearType_1: boolean;
      export { ClearType_1 as ClearType };
    }
    namespace Diablo {
      const WalkClear: boolean;
      const Entrance: boolean;
      const JustViz: boolean;
      const SealLeader: boolean;
      const Fast: boolean;
      const SealWarning: string;
      const EntranceTP: string;
      const StarTP: string;
      const DiabloMsg: string;
      const ClearRadius: number;
      const SealOrder: string[];
    }
    namespace DiabloHelper {
      const Wait_2: number;
      export { Wait_2 as Wait };
      const Entrance_1: boolean;
      export { Entrance_1 as Entrance };
      export const SkipIfBaal: boolean;
      const SkipTP_2: boolean;
      export { SkipTP_2 as SkipTP };
      export const OpenSeals: boolean;
      export const SafePrecast: boolean;
      const ClearRadius_1: number;
      export { ClearRadius_1 as ClearRadius };
      const SealOrder_1: string[];
      export { SealOrder_1 as SealOrder };
      export const RecheckSeals: boolean;
    }
    namespace MFHelper {
      const BreakClearLevel: boolean;
    }
    namespace Wakka {
      const Wait_3: number;
      export { Wait_3 as Wait };
      export const StopAtLevel: number;
      export const StopProfile: boolean;
      const SkipIfBaal_1: boolean;
      export { SkipIfBaal_1 as SkipIfBaal };
    }
    namespace BattleOrders {
      const Mode_1: number;
      export { Mode_1 as Mode };
      export const Getters: any[];
      export const Idle: boolean;
      export const QuitOnFailure: boolean;
      export const SkipIfTardy: boolean;
      const Wait_4: number;
      export { Wait_4 as Wait };
    }
    namespace BoBarbHelper {
      const Mode_2: number;
      export { Mode_2 as Mode };
      export const Wp: number;
    }
    interface ControlBot {
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
    }
    namespace IPHunter {
      export const IPList: any[];
      const GameLength_1: number;
      export { GameLength_1 as GameLength };
    }
    namespace Follower {
      const Leader_2: string;
      export { Leader_2 as Leader };
    }
    namespace Mephisto {
      const MoatTrick: boolean;
      const KillCouncil: boolean;
      const TakeRedPortal: boolean;
    }
    namespace ShopBot {
      const ScanIDs: any[];
      const ShopNPC: string;
      const CycleDelay: number;
      const QuitOnMatch: boolean;
    }
    namespace Coldworm {
      const KillBeetleburst: boolean;
      const ClearMaggotLair: boolean;
    }
    namespace Summoner {
      const FireEye: boolean;
    }
    namespace AncientTunnels {
      const OpenChest_1: boolean;
      export { OpenChest_1 as OpenChest };
      export const KillDarkElder: boolean;
    }
    namespace OrgTorch {
      const WaitForKeys: boolean;
      const WaitTimeout: boolean;
      const UseSalvation: boolean;
      const GetFade: boolean;
      const MakeTorch: boolean;
      namespace PreGame {
        namespace Thawing {
          const Drink: number;
          const At: any[];
        }
        namespace Antidote {
          const Drink_1: number;
          export { Drink_1 as Drink };
          const At_1: any[];
          export { At_1 as At };
        }
      }
    }
    namespace Synch {
      const WaitFor: any[];
    }
    namespace TristramLeech {
      const Leader_3: string;
      export { Leader_3 as Leader };
      const Helper_1: boolean;
      export { Helper_1 as Helper };
      const Wait_5: number;
      export { Wait_5 as Wait };
    }
    namespace TravincalLeech {
      const Leader_4: string;
      export { Leader_4 as Leader };
      const Helper_2: boolean;
      export { Helper_2 as Helper };
      const Wait_6: number;
      export { Wait_6 as Wait };
    }
    namespace Tristram {
      export const PortalLeech: boolean;
      const WalkClear_1: boolean;
      export { WalkClear_1 as WalkClear };
    }
    namespace Travincal {
      const PortalLeech_1: boolean;
      export { PortalLeech_1 as PortalLeech };
    }
    namespace SkillStat {
      const Skills: any[];
    }
    namespace Bonesaw {
      const ClearDrifterCavern: boolean;
    }
    namespace ChestMania {
      const Act1: any[];
      const Act2: any[];
      const Act3: any[];
      const Act4: any[];
      const Act5: any[];
    }
    namespace ClearAnyArea {
      const AreaList: any[];
    }
    namespace Rusher {
      export const WaitPlayerCount: number;
      export const Cain: boolean;
      export const Radament: boolean;
      export const LamEsen: boolean;
      export const Izual: boolean;
      export const Shenk: boolean;
      export const Anya: boolean;
      export const HellAncients: boolean;
      const GiveWps_1: boolean;
      export { GiveWps_1 as GiveWps };
      export const LastRun: string;
    }
    namespace Rushee {
      const Quester: boolean;
      const Bumper: boolean;
    }
    namespace Questing {
      const StopProfile_1: boolean;
      export { StopProfile_1 as StopProfile };
    }
    interface GetEssences {
      MoatMeph: boolean;
      FastDiablo: boolean;
    }
    namespace AutoSkill {
      const Enabled_3: boolean;
      export { Enabled_3 as Enabled };
      export const Build: any[];
      export const Save: number;
    }
    namespace AutoStat {
      const Enabled_4: boolean;
      export { Enabled_4 as Enabled };
      const Build_1: any[];
      export { Build_1 as Build };
      const Save_1: number;
      export { Save_1 as Save };
      export const BlockChance: number;
      export const UseBulk: boolean;
    }
    namespace AutoBuild {
      const Enabled_5: boolean;
      export { Enabled_5 as Enabled };
      export const Template: string;
      export const Verbose: boolean;
      const DebugMode_1: boolean;
      export { DebugMode_1 as DebugMode };
    }
  }
}
export {};
