declare global {
  namespace sdk {
    export namespace waypoints {
      const Ids: [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];
      const Act1: number[];
      const Act2: number[];
      const Act3: number[];
      const Act4: number[];
      const Act5: number[];
    }

    export namespace difficulty {
      const Normal: 0;
      const Nightmare: 1;
      const Hell: 2;
      const Difficulties: ["Normal", "Nightmare", "Hell"];

      const nameOf: (diff: 0 | 1 | 2) => "Normal" | "Nightmare" | "Hell" | false;
    }

    export namespace party {
      const NoParty: 65535
      namespace flag {
        const Invite: 0;
        const InParty: 1;
        const Accept: 2;
        const Cancel: 4;
      }
      namespace controls {
        const Hostile: 1;
        const InviteOrCancel: 2;
        const Leave: 3;
        const Ignore: 4;
        const Squelch: 5;
      }
    }

    export namespace clicktypes {
      namespace click {
        namespace item {
          const Left: 0;
          const Right: 1;
          const ShiftLeft: 2; // For belt
          const MercFromBelt: 3; // For belt
          const Mercenary: 4 // Give to merc
        }
        namespace map {
          const LeftDown: 0;
          const LeftHold: 1;
          const LeftUp: 2;
          const RightDown: 3;
          const RightHold: 4;
          const RightUp: 5;
        }
      }
      namespace shift {
        const NoShift: 0;
        const Shift: 1
      }
    }

    export namespace cursortype {
      const Empty: 1;
      const ItemOnUnitHover: 3; // see notes
      const ItemOnCursor: 4; // see notes
      const Identify: 6;
      const Repair: 7;
    }

    export namespace collision {
      const BlockWall: 0x01;
      const LineOfSight: 0x02;
      const Ranged: 0x04;
      const PlayerToWalk: 0x08;
      const DarkArea: 0x10;
      const Casting: 0x20;
      const Unknown: 0x40;
      const Players: 0x80;
      const Monsters: 0x100;
      const Items: 0x200;
      const Objects: 0x400;
      const ClosedDoor: 0x800;
      const IsOnFloor: 0x1000;
      const MonsterIsOnFloor: 0x1100;
      const MonsterIsOnFloorDarkArea: 0x1110; // in doorway
      const FriendlyNPC: 0x2000;
      const Unknown2: 0x4000;
      const DeadBodies: 0x8000;
      const MonsterObject: 0xFFFF;
      const BlockMissile: 0x80E;
      const WallOrRanged: 0x5;
      const BlockWalk: 0x1805;
      const FriendlyRanged: 0x2004;
      const BoneWall: 4352;
    }

    export namespace areas {
      const Towns: [1, 40, 75, 103, 109];
      const None: 0;

      // Act 1
      const RogueEncampment: 1;
      const BloodMoor: 2;
      const ColdPlains: 3;
      const StonyField: 4;
      const DarkWood: 5;
      const BlackMarsh: 6;
      const TamoeHighland: 7;
      const DenofEvil: 8;
      const CaveLvl1: 9;
      const UndergroundPassageLvl1: 10;
      const HoleLvl1: 11;
      const PitLvl1: 12;
      const CaveLvl2: 13;
      const UndergroundPassageLvl2: 14;
      const HoleLvl2: 15;
      const PitLvl2: 16;
      const BurialGrounds: 17;
      const Crypt: 18;
      const Mausoleum: 19;
      const ForgottenTower: 20;
      const TowerCellarLvl1: 21;
      const TowerCellarLvl2: 22;
      const TowerCellarLvl3: 23;
      const TowerCellarLvl4: 24;
      const TowerCellarLvl5: 25;
      const MonasteryGate: 26;
      const OuterCloister: 27;
      const Barracks: 28;
      const JailLvl1: 29;
      const JailLvl2: 30;
      const JailLvl3: 31;
      const InnerCloister: 32;
      const Cathedral: 33;
      const CatacombsLvl1: 34;
      const CatacombsLvl2: 35;
      const CatacombsLvl3: 36;
      const CatacombsLvl4: 37;
      const Tristram: 38;
      const MooMooFarm: 39;

      // Act 2
      const LutGholein: 40;
      const RockyWaste: 41;
      const DryHills: 42;
      const FarOasis: 43;
      const LostCity: 44;
      const ValleyofSnakes: 45;
      const CanyonofMagic: 46;
      const A2SewersLvl1: 47;
      const A2SewersLvl2: 48;
      const A2SewersLvl3: 49;
      const HaremLvl1: 50;
      const HaremLvl2: 51;
      const PalaceCellarLvl1: 52;
      const PalaceCellarLvl2: 53;
      const PalaceCellarLvl3: 54;
      const StonyTombLvl1: 55;
      const HallsoftheDeadLvl1: 56;
      const HallsoftheDeadLvl2: 57;
      const ClawViperTempleLvl1: 58;
      const StonyTombLvl2: 59;
      const HallsoftheDeadLvl3: 60;
      const ClawViperTempleLvl2: 61;
      const MaggotLairLvl1: 62;
      const MaggotLairLvl2: 63;
      const MaggotLairLvl3: 64;
      const AncientTunnels: 65;
      const TalRashasTomb1: 66;
      const TalRashasTomb2: 67;
      const TalRashasTomb3: 68;
      const TalRashasTomb4: 69;
      const TalRashasTomb5: 70;
      const TalRashasTomb6: 71;
      const TalRashasTomb7: 72;
      const DurielsLair: 73;
      const ArcaneSanctuary: 74;

      // Act 3
      const KurastDocktown: 75;
      const SpiderForest: 76;
      const GreatMarsh: 77;
      const FlayerJungle: 78;
      const LowerKurast: 79;
      const KurastBazaar: 80;
      const UpperKurast: 81;
      const KurastCauseway: 82;
      const Travincal: 83;
      const SpiderCave: 84;
      const SpiderCavern: 85;
      const SwampyPitLvl1: 86;
      const SwampyPitLvl2: 87;
      const FlayerDungeonLvl1: 88;
      const FlayerDungeonLvl2: 89;
      const SwampyPitLvl3: 90;
      const FlayerDungeonLvl3: 91;
      const A3SewersLvl1: 92;
      const A3SewersLvl2: 93;
      const RuinedTemple: 94;
      const DisusedFane: 95;
      const ForgottenReliquary: 96;
      const ForgottenTemple: 97;
      const RuinedFane: 98;
      const DisusedReliquary: 99;
      const DuranceofHateLvl1: 100;
      const DuranceofHateLvl2: 101;
      const DuranceofHateLvl3: 102;

      // Act 4
      const PandemoniumFortress: 103;
      const OuterSteppes: 104;
      const PlainsofDespair: 105;
      const CityoftheDamned: 106;
      const RiverofFlame: 107;
      const ChaosSanctuary: 108;

      // Act 5
      const Harrogath: 109;
      const BloodyFoothills: 110;
      const FrigidHighlands: 111;
      const ArreatPlateau: 112;
      const CrystalizedPassage: 113;
      const FrozenRiver: 114;
      const GlacialTrail: 115;
      const DrifterCavern: 116;
      const FrozenTundra: 117;
      const AncientsWay: 118;
      const IcyCellar: 119;
      const ArreatSummit: 120;
      const NihlathaksTemple: 121;
      const HallsofAnguish: 122;
      const HallsofPain: 123;
      const HallsofVaught: 124;
      const Abaddon: 125;
      const PitofAcheron: 126;
      const InfernalPit: 127;
      const WorldstoneLvl1: 128;
      const WorldstoneLvl2: 129;
      const WorldstoneLvl3: 130;
      const ThroneofDestruction: 131;
      const WorldstoneChamber: 132;

      // Ubers
      const MatronsDen: 133;
      const ForgottenSands: 134;
      const FurnaceofPain: 135;
      const UberTristram: 136;

      const actOf: (act: number) => 1 | 2 | 3 | 4 | 5;
      const townOf: (townArea: number) => 1 | 40 | 75 | 103 | 109;
      const townOfAct: (act: 1 | 2 | 3 | 4 | 5) => 1 | 40 | 75 | 103 | 109;
    }
    
    export namespace skills {
      namespace get {
        const RightName: 0;
        const LeftName: 1;
        const RightId: 2;
        const LeftId: 3;
        const AllSkills: 4
      }
      namespace hand {
        const Right: 0;
        const Left: 1;
        const LeftNoShift: 2;
        const RightShift: 3;
      }
      namespace subindex {
        const HardPoints: 0;
        const SoftPoints: 1
      }
      // General
      const Attack: 0;
      const Kick: 1;
      const Throw: 2;
      const Unsummon: 3;
      const LeftHandThrow: 4;
      const LeftHandSwing: 5;

      // Amazon
      const MagicArrow: 6;
      const FireArrow: 7;
      const InnerSight: 8;
      const CriticalStrike: 9;
      const Jab: 10;
      const ColdArrow: 11;
      const MultipleShot: 12;
      const Dodge: 13;
      const PowerStrike: 14;
      const PoisonJavelin: 15;
      const ExplodingArrow: 16;
      const SlowMissiles: 17;
      const Avoid: 18;
      const Impale: 19;
      const LightningBolt: 20;
      const IceArrow: 21;
      const GuidedArrow: 22;
      const Penetrate: 23;
      const ChargedStrike: 24;
      const PlagueJavelin: 25;
      const Strafe: 26;
      const ImmolationArrow: 27;
      const Dopplezon: 28;
      const Decoy: 28;
      const Evade: 29;
      const Fend: 30;
      const FreezingArrow: 31;
      const Valkyrie: 32;
      const Pierce: 33;
      const LightningStrike: 34;
      const LightningFury: 35;

      // Sorc
      const FireBolt: 36;
      const Warmth: 37;
      const ChargedBolt: 38;
      const IceBolt: 39;
      const FrozenArmor: 40;
      const Inferno: 41;
      const StaticField: 42;
      const Telekinesis: 43;
      const FrostNova: 44;
      const IceBlast: 45;
      const Blaze: 46;
      const FireBall: 47;
      const Nova: 48;
      const Lightning: 49;
      const ShiverArmor: 50;
      const FireWall: 51;
      const Enchant: 52;
      const ChainLightning: 53;
      const Teleport: 54;
      const GlacialSpike: 55;
      const Meteor: 56;
      const ThunderStorm: 57;
      const EnergyShield: 58;
      const Blizzard: 59;
      const ChillingArmor: 60;
      const FireMastery: 61;
      const Hydra: 62;
      const LightningMastery: 63;
      const FrozenOrb: 64;
      const ColdMastery: 65;

      // Necro
      const AmplifyDamage: 66;
      const Teeth: 67;
      const BoneArmor: 68;
      const SkeletonMastery: 69;
      const RaiseSkeleton: 70;
      const DimVision: 71;
      const Weaken: 72;
      const PoisonDagger: 73;
      const CorpseExplosion: 74;
      const ClayGolem: 75;
      const IronMaiden: 76;
      const Terror: 77;
      const BoneWall: 78;
      const GolemMastery: 79;
      const RaiseSkeletalMage: 80;
      const Confuse: 81;
      const LifeTap: 82;
      const PoisonExplosion: 83;
      const BoneSpear: 84;
      const BloodGolem: 85;
      const Attract: 86;
      const Decrepify: 87;
      const BonePrison: 88;
      const SummonResist: 89;
      const IronGolem: 90;
      const LowerResist: 91;
      const PoisonNova: 92;
      const BoneSpirit: 93;
      const FireGolem: 94;
      const Revive: 95;

      // Paladin
      const Sacrifice: 96;
      const Smite: 97;
      const Might: 98;
      const Prayer: 99;
      const ResistFire: 100;
      const HolyBolt: 101;
      const HolyFire: 102;
      const Thorns: 103;
      const Defiance: 104;
      const ResistCold: 105;
      const Zeal: 106;
      const Charge: 107;
      const BlessedAim: 108;
      const Cleansing: 109;
      const ResistLightning: 110;
      const Vengeance: 111;
      const BlessedHammer: 112;
      const Concentration: 113;
      const HolyFreeze: 114;
      const Vigor: 115;
      const Conversion: 116;
      const HolyShield: 117;
      const HolyShock: 118;
      const Sanctuary: 119;
      const Meditation: 120;
      const FistoftheHeavens: 121;
      const Fanaticism: 122;
      const Conviction: 123;
      const Redemption: 124;
      const Salvation: 125;

      // Barb
      const Bash: 126;
      const SwordMastery: 127;
      const AxeMastery: 128;
      const MaceMastery: 129;
      const Howl: 130;
      const FindPotion: 131;
      const Leap: 132;
      const DoubleSwing: 133;
      const PoleArmMastery: 134;
      const ThrowingMastery: 135;
      const SpearMastery: 136;
      const Taunt: 137;
      const Shout: 138;
      const Stun: 139;
      const DoubleThrow: 140;
      const IncreasedStamina: 141;
      const FindItem: 142;
      const LeapAttack: 143;
      const Concentrate: 144;
      const IronSkin: 145;
      const BattleCry: 146;
      const Frenzy: 147;
      const IncreasedSpeed: 148;
      const BattleOrders: 149;
      const GrimWard: 150;
      const Whirlwind: 151;
      const Berserk: 152;
      const NaturalResistance: 153;
      const WarCry: 154;
      const BattleCommand: 155;

      // General stuff
      const IdentifyScroll: 217;
      const BookofIdentify: 218;
      const TownPortalScroll: 219;
      const BookofTownPortal: 220;

      // Druid
      const Raven: 221;
      const PoisonCreeper: 222; // External
      const PlaguePoppy: 222; // Internal
      const Werewolf: 223; // External
      const Wearwolf: 223; // Internal
      const Lycanthropy: 224; // External
      const ShapeShifting: 224; // Internal
      const Firestorm: 225;
      const OakSage: 226;
      const SpiritWolf: 227; // External
      const SummonSpiritWolf: 227; // Internal
      const Werebear: 228; // External
      const Wearbear: 228; // Internal
      const MoltenBoulder: 229;
      const ArcticBlast: 230;
      const CarrionVine: 231; // External
      const CycleofLife: 231; // Internal
      const FeralRage: 232;
      const Maul: 233;
      const Fissure: 234; // Internal
      const Eruption: 234; // Internal
      const CycloneArmor: 235;
      const HeartofWolverine: 236;
      const SummonDireWolf: 237; // External
      const SummonFenris: 237; // Internal
      const Rabies: 238;
      const FireClaws: 239;
      const Twister: 240;
      const SolarCreeper: 241; // External
      const Vines: 241; // Internal
      const Hunger: 242;
      const ShockWave: 243;
      const Volcano: 244;
      const Tornado: 245;
      const SpiritofBarbs: 246;
      const Grizzly: 247; // External
      const SummonGrizzly: 247; // Internal
      const Fury: 248;
      const Armageddon: 249;
      const Hurricane: 250;

      // Assa
      const FireBlast: 251; // External
      const FireTrauma: 251; // Internal
      const ClawMastery: 252;
      const PsychicHammer: 253;
      const TigerStrike: 254;
      const DragonTalon: 255;
      const ShockWeb: 256; // External
      const ShockField: 256; // Internal
      const BladeSentinel: 257;
      const Quickness: 258; // Internal name
      const BurstofSpeed: 258; // Shown name
      const FistsofFire: 259;
      const DragonClaw: 260;
      const ChargedBoltSentry: 261;
      const WakeofFire: 262; // External
      const WakeofFireSentry: 262; // Internal
      const WeaponBlock: 263;
      const CloakofShadows: 264;
      const CobraStrike: 265;
      const BladeFury: 266;
      const Fade: 267;
      const ShadowWarrior: 268;
      const ClawsofThunder: 269;
      const DragonTail: 270;
      const LightningSentry: 271;
      const WakeofInferno: 272; // External
      const InfernoSentry: 272; // Internal
      const MindBlast: 273;
      const BladesofIce: 274;
      const DragonFlight: 275;
      const DeathSentry: 276;
      const BladeShield: 277;
      const Venom: 278;
      const ShadowMaster: 279;
      const PhoenixStrike: 280; // External
      const RoyalStrike: 280; // Internal
      const WakeofDestructionSentry: 281; // Not used?
      const Summoner: 500; // special
      namespace tabs {
        // Ama
        const BowandCrossbow: 0;
        const PassiveandMagic: 1;
        const JavelinandSpear: 2;

        // Sorc
        const Fire: 8;
        const Lightning: 9;
        const Cold: 10;

        // Necro
        const Curses: 16;
        const PoisonandBone: 17;
        const NecroSummoning: 18;

        // Pala
        const PalaCombat: 24;
        const Offensive: 25;
        const Defensive: 26;

        // Barb
        const BarbCombat: 32;
        const Masteries: 33;
        const Warcries: 34;

        // Druid
        const DruidSummon: 40;
        const ShapeShifting: 41;
        const Elemental: 42;

        // Assa
        const Traps: 48;
        const ShadowDisciplines: 49;
        const MartialArts: 50;
      }
    }
    export const skillTabs: undefined

    export namespace quest {
      export namespace item {
        // Act 1
        const WirtsLeg: 88;
        const HoradricMalus: 89;
        const ScrollofInifuss: 524;
        const KeytotheCairnStones: 525;
        // Act 2
        const FinishedStaff: 91;
        const HoradricStaff: 91;
        const IncompleteStaff: 92;
        const ShaftoftheHoradricStaff: 92;
        const ViperAmulet: 521;
        const TopoftheHoradricStaff: 521;
        const Cube: 549;
        const BookofSkill: 552;
        // Act 3
        const DecoyGidbinn: 86;
        const TheGidbinn: 87;
        const KhalimsFlail: 173;
        const KhalimsWill: 174;
        const PotofLife: 545;
        const AJadeFigurine: 546;
        const JadeFigurine: 546;
        const TheGoldenBird: 547;
        const LamEsensTome: 548;
        const KhalimsEye: 553;
        const KhalimsHeart: 554;
        const KhalimsBrain: 555;
        // Act 4
        const HellForgeHammer: 90;
        const Soulstone: 551;
        const MephistosSoulstone: 551;
        // Act 5
        const MalahsPotion: 644;
        const ScrollofKnowledge: 645;
        const ScrollofResistance: 646;
        // Pandemonium Event
        const KeyofTerror: 647;
        const KeyofHate: 648;
        const KeyofDestruction: 649;
        const DiablosHorn: 650;
        const BaalsEye: 651;
        const MephistosBrain: 652;
        const StandardofHeroes: 658;
        // Essences/Token
        const TokenofAbsolution: 653;
        const TwistedEssenceofSuffering: 654;
        const ChargedEssenceofHatred: 655;
        const BurningEssenceofTerror: 656;
        const FesteringEssenceofDestruction: 657;
        // Misc
        const TheBlackTowerKey: 544;
      }
      const items: [
        // act 1
        88, 89, 524, 525,
        // act 2
        91, 92, 521, 549, 552,
        // act 3
        86, 87, 173, 174, 545, 546, 547, 548, 553, 554, 555,
        // act 4
        90, 551,
        // act 5
        644, 645, 646,
      ];
      export namespace chest {
        // act1
        const StoneAlpha: 17;
        const StoneBeta: 18;
        const StoneGamma: 19;
        const StoneDelta: 20;
        const StoneLambda: 21;
        const StoneTheta: 22; // ?
        const CainsJail: 26;
        const InifussTree: 30;
        const MalusHolder: 108;
        const Wirt: 268;

        // act 2
        const ViperAmuletChest: 149;
        const HoradricStaffHolder: 152;
        const HoradricCubeChest: 354;
        const HoradricScrollChest: 355;
        const ShaftoftheHoradricStaffChest: 356;
        const Journal: 357;

        // act 3
        const ForestAltar: 81;
        const LamEsensTomeHolder: 193;
        const GidbinnAltar: 252;
        const KhalimsHeartChest: 405;
        const KhalimsBrainChest: 406;
        const KhalimsEyeChest: 407;

        // act 4
        const HellForge: 376;

        // act 5
        const BarbCage: 473;
        const FrozenAnya: 558;
        const AncientsAltar: 546;
      }
      const chests: [
        // act 1
        17, 18, 19, 20, 21, 22, 26, 30, 108,
        // act 2
        149, 152, 354, 355, 356, 357,
        // act 3
        81, 193, 405, 406, 407,
        // act 4
        376,
        // act 5
        434, 558, 546
      ];
      export namespace id {
        const SpokeToWarriv: 0;
        const DenofEvil: 1;
        const SistersBurialGrounds: 2;
        const TheSearchForCain: 4;
        const ForgottenTower: 5;
        const ToolsoftheTrade: 3;
        const SistersToTheSlaughter: 6;
        const AbleToGotoActII: 7;
        const SpokeToJerhyn: 8;
        const RadamentsLair: 9;
        const TheHoradricStaff: 10;
        const TheTaintedSun: 11;
        const TheArcaneSanctuary: 12;
        const TheSummoner: 13;
        const TheSevenTombs: 14;
        const AbleToGotoActIII: 15;
        const SpokeToHratli: 16;
        const TheGoldenBird: 20;
        const BladeoftheOldReligion: 19;
        const KhalimsWill: 18;
        const LamEsensTome: 17;
        const TheBlackenedTemple: 21;
        const TheGuardian: 22;
        const AbleToGotoActIV: 23;
        const SpokeToTyrael: 24;
        const TheFallenAngel: 25;
        const HellsForge: 27;
        const TerrorsEnd: 26;
        const AbleToGotoActV: 28;
        const SiegeOnHarrogath: 35;
        const RescueonMountArreat: 36;
        const PrisonofIce: 37;
        const BetrayalofHarrogath: 38;
        const RiteofPassage: 39;
        const EyeofDestruction: 40;
        const Respec: 41;
      }
      // just common states for now
      namespace states {
        const Completed: 0;
        const ReqComplete: 1;
        const GreyedOut: 12;
        const PartyMemberComplete: 13;
        const CannotComplete: 14;
      }
    }

    // in game data
    export namespace uiflags {
      const Inventory: 0x01;
      const StatsWindow: 0x02;
      const QuickSkill: 0x03;
      const SkillWindow: 0x04;
      const ChatBox: 0x05;
      const NPCMenu: 0x08;
      const EscMenu: 0x09;
      const KeytotheCairnStonesScreen: 0x10;
      const AutoMap: 0x0A;
      const ConfigControls: 0x0B;
      const Shop: 0x0C;
      const ShowItem: 0x0D;
      const SubmitItem: 0x0E;
      const Quest: 0x0F;
      const QuestLog: 0x11;
      const StatusArea: 0x12;
      const Waypoint: 0x14;
      const MiniPanel: 0x15;
      const Party: 0x16;
      const TradePrompt: 0x17;
      const Msgs: 0x18;
      const Stash: 0x19;
      const Cube: 0x1A;
      const ShowBelt: 0x1F;
      const Help: 0x21;
      const MercScreen: 0x24;
      const ScrollWindow: 0x25
    }

    export namespace menu {
      const Respec: 0x2BA0;
      const Ok: 0x0D49;
      const Talk: 0x0D35;
      const Trade: 0x0D44;
      const TradeRepair: 0x0D06;
      const Imbue: 0x0FB1;
      const Gamble: 0x0D46;
      const Hire: 0x0D45;
      const GoEast: 0x0D36;
      const GoWest: 0x0D37;
      const IdentifyItems: 0x0FB4;
      const SailEast: 0x0D38;
      const SailWest: 0x0D39;
      const RessurectMerc: 0x1507;
      const AddSockets: 0x58DC;
      const Personalize: 0x58DD;
      const TravelToHarrogath: 0x58D2;
    }

    // shrine types
    export namespace shrines {
      const Presets: [2, 81, 83, 170, 344, 197, 202];
      const Ids: [
        2, 77, 81, 83, 84, 85, 93, 96, 97, 109, 116, 123, 124,
        133, 134, 135, 136, 150, 151, 164, 165, 166, 167, 168,
        170, 172, 173, 184, 190, 191, 197, 199, 200, 201, 202,
        206, 226, 231, 232, 236, 249, 260, 262, 263, 264, 265,
        275, 276, 277, 278, 279, 280, 281, 282, 299, 300, 302,
        303, 320, 325, 343, 344, 361, 414, 415, 421, 422, 423,
        427, 428, 464, 465, 472, 479, 483, 484, 488, 491, 492,
        495, 497, 499, 503, 509, 512, 520, 521, 522
      ];
      const None: 0;
      const Refilling: 1;
      const Health: 2;
      const Mana: 3;
      const HealthExchange: 4;
      const ManaExchange: 5;
      const Armor: 6;
      const Combat: 7;
      const ResistFire: 8;
      const ResistCold: 9;
      const ResistLightning: 10;
      const ResistPoison: 11;
      const Skill: 12;
      const ManaRecharge: 13;
      const Stamina: 14;
      const Experience: 15;
      const Enirhs: 16;
      const Portal: 17;
      const Gem: 18;
      const Fire: 19;
      const Monster: 20;
      const Exploding: 21;
      const Poison: 22
    }

    // unit states
    export namespace states {
      const None: 0;
      const FrozenSolid: 1;
      const Poison: 2;
      const ResistFire: 3;
      const ResistCold: 4;
      const ResistLightning: 5;
      const ResistMagic: 6;
      const PlayerBody: 7;
      const ResistAll: 8;
      const AmplifyDamage: 9;
      const FrozenArmor: 10;
      const Frozen: 11;
      const Inferno: 12;
      const Blaze: 13;
      const BoneArmor: 14;
      const Concentrate: 15;
      const Enchant: 16;
      const InnerSight: 17;
      const SkillMove: 18;
      const Weaken: 19;
      const ChillingArmor: 20;
      const Stunned: 21;
      const SpiderLay: 22;
      const DimVision: 23;
      const Slowed: 24;
      const FetishAura: 25;
      const Shout: 26;
      const Taunt: 27;
      const Conviction: 28;
      const Convicted: 29;
      const EnergyShield: 30;
      const Venom: 31;
      const BattleOrders: 32;
      const Might: 33;
      const Prayer: 34;
      const HolyFire: 35;
      const Thorns: 36;
      const Defiance: 37;
      const ThunderStorm: 38;
      const LightningBolt: 39;
      const BlessedAim: 40;
      const Stamina: 41;
      const Concentration: 42;
      const Holywind: 43;
      const HolyFreeze: 43;
      const HolywindCold: 44;
      const HolyFreezeCold: 44;
      const Cleansing: 45;
      const HolyShock: 46;
      const Sanctuary: 47;
      const Meditation: 48;
      const Fanaticism: 49;
      const Redemption: 50;
      const BattleCommand: 51;
      const PreventHeal: 52;
      const Conversion: 53;
      const Uninterruptable: 54;
      const IronMaiden: 55;
      const Terror: 56;
      const Attract: 57;
      const LifeTap: 58;
      const Confuse: 59;
      const Decrepify: 60;
      const LowerResist: 61;
      const OpenWounds: 62;
      const Dopplezon: 63;
      const Decoy: 63;
      const CriticalStrike: 64;
      const Dodge: 65;
      const Avoid: 66;
      const Penetrate: 67;
      const Evade: 68;
      const Pierce: 69;
      const Warmth: 70;
      const FireMastery: 71;
      const LightningMastery: 72;
      const ColdMastery: 73;
      const SwordMastery: 74;
      const AxeMastery: 75;
      const MaceMastery: 76;
      const PoleArmMastery: 77;
      const ThrowingMastery: 78;
      const SpearMastery: 79;
      const IncreasedStamina: 80;
      const IronSkin: 81;
      const IncreasedSpeed: 82;
      const NaturalResistance: 83;
      const FingerMageCurse: 84;
      const NoManaReg: 85;
      const JustHit: 86;
      const SlowMissiles: 87;
      const ShiverArmor: 88;
      const BattleCry: 89;
      const Blue: 90;
      const Red: 91;
      const DeathDelay: 92;
      const Valkyrie: 93;
      const Frenzy: 94;
      const Berserk: 95;
      const Revive: 96;
      const ItemFullSet: 97;
      const SourceUnit: 98;
      const Redeemed: 99;
      const HealthPot: 100;
      const HolyShield: 101;
      const JustPortaled: 102;
      const MonFrenzy: 103;
      const CorpseNoDraw: 104;
      const Alignment: 105;
      const ManaPot: 106;
      const Shatter: 107;
      const SyncWarped: 108;
      const ConversionSave: 109;
      const Pregnat: 110;
      const Rabies: 112;
      const DefenceCurse: 113;
      const BloodMana: 114;
      const Burning: 115;
      const DragonFlight: 116;
      const Maul: 117;
      const CorpseNoSelect: 118;
      const ShadowWarrior: 119;
      const FeralRage: 120;
      const SkillDelay: 121;
      const ProgressiveDamage: 122;
      const ProgressiveSteal: 123;
      const ProgressiveOther: 124;
      const ProgressiveFire: 125;
      const ProgressiveCold: 126;
      const ProgressiveLighting: 127;
      const ShrineArmor: 128;
      const ShrineCombat: 129;
      const ShrineResLighting: 130;
      const ShrineResFire: 131;
      const ShrineResCold: 132;
      const ShrineResPoison: 133;
      const ShrineSkill: 134;
      const ShrineManaRegen: 135;
      const ShrineStamina: 136;
      const ShrineExperience: 137;
      const FenrisRage: 138;
      const Wolf: 139;
      const Wearwolf: 139;
      const Bear: 140;
      const Wearbear: 140;
      const Bloodlust: 141;
      const ChangeClass: 142;
      const Attached: 143;
      const Hurricane: 144;
      const Armageddon: 145;
      const Invis: 146;
      const Barbs: 147;
      const HeartofWolverine: 148;
      const OakSage: 149;
      const VineBeast: 150;
      const CycloneArmor: 151;
      const ClawMastery: 152;
      const CloakofShadows: 153;
      const Recyled: 154;
      const WeaponBlock: 155;
      const Cloaked: 156;
      const Quickness: 157; // Internal name
      const BurstofSpeed: 157; // External name
      const BladeShield: 158;
      const Fade: 159;
      const RestInPeace: 172;
      const Glowing: 175;
      const Delerium: 177;
      const Antidote: 178;
      const Thawing: 179;
      const StaminaPot: 180;
    }

    export namespace enchant {
      const RandName: 1;
      const HpMultiply: 2;
      const AddLightRadius: 3;
      const AddMLvl: 4;
      const ExtraStrong: 5;
      const ExtraFast: 6;
      const Cursed: 7;
      const MagicResistant: 8;
      const FireEnchanted: 9;
      const PoisonDeath: 10;
      const InsectDeath: 11;
      const ChainLightingDeath: 12;
      const IgnoreTargetDefense: 13;
      const UnknownMod: 14;
      const KillMinionsDeath: 15;
      const ChampMods: 16;
      const LightningEnchanted: 17;
      const ColdEnchanted: 18;
      const UnusedMercMod: 19;
      const ChargedBoltWhenStruck: 20;
      const TempSummoned: 21;
      const QuestMod: 22;
      const PoisonField: 23;
      const Thief: 24;
      const ManaBurn: 25;
      const Teleportation: 26;
      const SpectralHit: 27;
      const StoneSkin: 28;
      const MultipleShots: 29;
      const Aura: 30;
      const CorpseExplosion: 31;
      const FireExplosionOnDeath: 32; // not sure what the difference is between this and 9
      const FreezeOnDeath: 33;
      const SelfResurrect: 34;
      const IceShatter: 35;
      const ChampStoned: 36;
      const ChampStats: 37;
      const ChampCurseImmune: 38;
    }

    // unit stats
    export namespace stats {
      const StunLength: 66;
      const VelocityPercent: 67;
      const OtherAnimrate: 69;
      const HpRegen: 74;

      const LastBlockFrame: 95;
      const State: 98;
      const MonsterPlayerCount: 100;

      const CurseResistance: 109;
      const IronMaidenLevel: 129;
      const LifeTapLevel: 130;

      const Alignment: 172;
      const Target0: 173;
      const Target1: 174;
      const GoldLost: 175;
      const MinimumRequiredLevel: 176;
      const ConversionLevel: 176;
      const ConversionMaxHp: 177;
      const UnitDooverlay: 178;
      const AttackVsMontype: 179;
      const DamageVsMontype: 180;

      const ArmorOverridePercent: 182;
      const FireLength: 315;
      const BurningMin: 316;
      const BurningMax: 317;
      const ProgressiveDamage: 318;
      const ProgressiveSteal: 319;
      const ProgressiveOther: 320;
      const ProgressiveFire: 321;
      const ProgressiveCold: 322;
      const ProgressiveLightning: 323;
      const ProgressiveTohit: 325;
      const PoisonCount: 326;
      const DamageFramerate: 327;
      const PierceIdx: 328;

      const ModifierListSkill: 350;
      const ModifierListLevel: 351;

      const LastSentHpPct: 352;
      const SourceUnitType: 353;
      const SourceUnitId: 354;

      const SkillThornsPercent: 131;
      const SkillBoneArmor: 132;
      const SkillCycloneArmor: 132;
      const SkillBoneArmorMax: 133;
      const SkillCycloneArmorMax: 133;
      const SkillFade: 181;
      const SkillPoisonOverrideLength: 101;
      const SkillBypassUndead: 103;
      const SkillBypassDemons: 104;
      const SkillBypassBeasts: 106;
      const SkillHandofAthena: 161;
      const SkillStaminaPercent: 162;
      const SkillPassiveStaminaPercent: 163;
      const SkillConcentration: 164;
      const SkillEnchant: 165;
      const SkillPierce: 166;
      const SkillConviction: 167;
      const SkillChillingArmor: 168;
      const SkillFrenzy: 169;
      const SkillDecrepify: 170;
      const SkillArmorPercent: 171;

      const Strength: 0;
      const Energy: 1;
      const Dexterity: 2;
      const Vitality: 3;
      const StatPts: 4;
      const NewSkills: 5;
      const HitPoints: 6;
      const MaxHp: 7;
      const Mana: 8;
      const MaxMana: 9;
      const Stamina: 10;
      const MaxStamina: 11;
      const Level: 12;
      const Experience: 13;
      const Gold: 14;
      const GoldBank: 15;
      const ArmorPercent: 16;
      const MaxDamagePercent: 17;
      const MinDamagePercent: 18;
      const EnhancedDamage: 18;
      const ToHit: 19;
      const ToBlock: 20;
      const MinDamage: 21;
      const MaxDamage: 22;
      const SecondaryMinDamage: 23;
      const SecondaryMaxDamage: 24;
      const DamagePercent: 25;
      const ManaRecovery: 26;
      const ManaRecoveryBonus: 27;
      const StaminaRecoveryBonus: 28;
      const LastExp: 29;
      const NextExp: 30;
      const ArmorClass: 31;
      const Defense: 31;
      const ArmorClassVsMissile: 32;
      const ArmorClassVsHth: 33;
      const NormalDamageReduction: 34;
      const MagicDamageReduction: 35;
      const DamageResist: 36;
      const MagicResist: 37;
      const MaxMagicResist: 38;
      const FireResist: 39;
      const MaxFireResist: 40;
      const LightResist: 41;
      const LightningResist: 41;
      const MaxLightResist: 42;
      const ColdResist: 43;
      const MaxColdResist: 44;
      const PoisonResist: 45;
      const MaxPoisonResist: 46;
      const DamageAura: 47;
      const FireMinDamage: 48;
      const FireMaxDamage: 49;
      const LightMinDamage: 50;
      const LightMaxDamage: 51;
      const MagicMinDamage: 52;
      const MagicMaxDamage: 53;
      const ColdMinDamage: 54;
      const ColdMaxDamage: 55;
      const ColdLength: 56;
      const PoisonMinDamage: 57;
      const PoisonMaxDamage: 58;
      const PoisonLength: 59;
      const LifeDrainMinDamage: 60;
      const LifeLeech: 60;
      const LifeDrainMaxDamage: 61;
      const ManaDrainMinDamage: 62;
      const ManaLeech: 62;
      const ManaDrainMaxDamage: 63;
      const StaminaDrainMinDamage: 64;
      const StaminaDrainMaxDamage: 65;
      const AttackRate: 68;
      const PreviousSkillRight: 181;
      const PreviousSkillMiddle: 182;
      const PreviousSkillLeft: 183;
      const PassiveFireMastery: 329;
      const PassiveLightningMastery: 330;
      const PassiveColdMastery: 331;
      const PassivePoisonMastery: 332;
      const PassiveFirePierce: 333;
      const PassiveLightningPierce: 334;
      const PassiveColdPierce: 335;
      const PassivePoisonPierce: 336;
      const PassiveCriticalStrike: 337;
      const PassiveDodge: 338;
      const PassiveAvoid: 339;
      const PassiveEvade: 340;
      const PassiveWarmth: 341;
      const PassiveMasteryMeleeTh: 342;
      const PassiveMasteryMeleeDmg: 343;
      const PassiveMasteryMeleeCrit: 344;
      const PassiveMasteryThrowTh: 345;
      const PassiveMasteryThrowDmg: 346;
      const PassiveMasteryThrowCrit: 347;
      const PassiveWeaponBlock: 348;
      const PassiveSummonResist: 349;
      const PassiveMagMastery: 357;
      const PassiveMagPierce: 358;
      const Quantity: 70;
      const Value: 71;
      const Durability: 72;
      const MaxDurability: 73;
      const MaxDurabilityPercent: 75;
      const MaxHpPercent: 76;
      const MaxManaPercent: 77;
      const AttackerTakesDamage: 78;
      const GoldBonus: 79;
      const MagicBonus: 80;
      const Knockback: 81;
      const TimeDuration: 82;
      const AddClassSkills: 83;
      const AddExperience: 85;
      const HealAfterKill: 86;
      const ReducedPrices: 87;
      const DoubleHerbDuration: 88;
      const LightRadius: 89;
      const LightColor: 90;
      const ReqPercent: 91;
      const LevelReq: 92;
      const FasterAttackRate: 93;
      const IAS: 93;
      const LevelReqPct: 94;
      const FasterMoveVelocity: 96;
      const FRW: 96;
      const NonClassSkill: 97;
      const OSkill: 97;
      const FasterGetHitRate: 99;
      const FHR: 99;
      const FasterBlockRate: 102;
      const FBR: 102;
      const FasterCastRate: 105;
      const FCR: 105;
      const SingleSkill: 107;
      const RestinPeace: 108;
      const PoisonLengthResist: 110;
      const NormalDamage: 111;
      const Howl: 112;
      const Stupidity: 113;
      const DamagetoMana: 114;
      const IgnoreTargetAc: 115;
      const IgnoreTargetDefense: 115;
      const FractionalTargetAc: 116;
      const PreventHeal: 117;
      const HalfFreezeDuration: 118;
      const ToHitPercent: 119;
      const DamageTargetAc: 120;
      const DemonDamagePercent: 121;
      const UndeadDamagePercent: 122;
      const DemontoHit: 123;
      const UndeadtoHit: 124;
      const Throwable: 125;
      const ElemSkill: 126;
      const AllSkills: 127;
      const AttackerTakesLightDamage: 128;
      const Freeze: 134;
      const OpenWounds: 135;
      const CrushingBlow: 136;
      const KickDamage: 137;
      const ManaAfterKill: 138;
      const HealAfterDemonKill: 139;
      const ExtraBlood: 140;
      const DeadlyStrike: 141;
      const AbsorbFirePercent: 142;
      const AbsorbFire: 143;
      const AbsorbLightPercent: 144;
      const AbsorbLight: 145;
      const AbsorbMagicPercent: 146;
      const AbsorbMagic: 147;
      const AbsorbColdPercent: 148;
      const AbsorbCold: 149;
      const AbsorbSlash: 262;
      const AbsorbCrush: 263;
      const AbsorbThrust: 264;
      const AbsorbSlashPercent: 265;
      const AbsorbCrushPercent: 266;
      const AbsorbThrustPercent: 267;
      const Slow: 150;
      const Indestructible: 152;
      const CannotbeFrozen: 153;
      const StaminaDrainPct: 154;
      const Reanimate: 155;
      const Pierce: 156;
      const MagicArrow: 157;
      const ExplosiveArrow: 158;
      const ThrowMinDamage: 159;
      const ThrowMaxDamage: 160;
      const AddSkillTab: 188;
      const NumSockets: 194;
      const SkillOnAura: 151;
      const SkillOnAttack: 195;
      const SkillOnKill: 196;
      const SkillOnDeath: 197;
      const SkillOnHit: 198;
      const SkillOnStrike: 198;
      const SkillOnLevelUp: 199;
      const SkillOnGetHit: 201;
      const SkillWhenStruck: 201;
      const ChargedSkill: 204;
      const PerLevelArmor: 214;
      const PerLevelArmorPercent: 215;
      const PerLevelHp: 216;
      const PerLevelMana: 217;
      const PerLevelMaxDamage: 218;
      const PerLevelMaxDamagePercent: 219;
      const PerLevelStrength: 220;
      const PerLevelDexterity: 221;
      const PerLevelEnergy: 222;
      const PerLevelVitality: 223;
      const PerLevelTohit: 224;
      const PerLevelTohitPercent: 225;
      const PerLevelColdDamageMax: 226;
      const PerLevelFireDamageMax: 227;
      const PerLevelLtngDamageMax: 228;
      const PerLevelPoisDamageMax: 229;
      const PerLevelResistCold: 230;
      const PerLevelResistFire: 231;
      const PerLevelResistLtng: 232;
      const PerLevelResistPois: 233;
      const PerLevelAbsorbCold: 234;
      const PerLevelAbsorbFire: 235;
      const PerLevelAbsorbLtng: 236;
      const PerLevelAbsorbPois: 237;
      const PerLevelThorns: 238;
      const PerLevelFindGold: 239;
      const PerLevelFindMagic: 240;
      const PerLevelRegenstamina: 241;
      const PerLevelStamina: 242;
      const PerLevelDamageDemon: 243;
      const PerLevelDamageUndead: 244;
      const PerLevelTohitDemon: 245;
      const PerLevelTohitUndead: 246;
      const PerLevelCrushingblow: 247;
      const PerLevelOpenwounds: 248;
      const PerLevelKickDamage: 249;
      const PerLevelDeadlystrike: 250;
      const PerLevelFindGems: 251;
      const ReplenishDurability: 252;
      const ReplenishQuantity: 253;
      const ExtraStack: 254;
      const Find: 255;
      const SlashDamage: 256;
      const SlashDamagePercent: 257;
      const CrushDamage: 258;
      const CrushDamagePercent: 259;
      const ThrustDamage: 260;
      const ThrustDamagePercent: 261;
      const ArmorByTime: 268;
      const ArmorPercentByTime: 269;
      const HpByTime: 270;
      const ManaByTime: 271;
      const MaxDamageByTime: 272;
      const MaxDamagePercentByTime: 273;
      const StrengthByTime: 274;
      const DexterityByTime: 275;
      const EnergyByTime: 276;
      const VitalityByTime: 277;
      const TohitByTime: 278;
      const TohitPercentByTime: 279;
      const ColdDamageMaxByTime: 280;
      const FireDamageMaxByTime: 281;
      const LtngDamageMaxByTime: 282;
      const PoisDamageMaxByTime: 283;
      const ResistColdByTime: 284;
      const ResistFireByTime: 285;
      const ResistLtngByTime: 286;
      const ResistPoisByTime: 287;
      const AbsorbColdByTime: 288;
      const AbsorbFireByTime: 289;
      const AbsorbLtngByTime: 290;
      const AbsorbPoisByTime: 291;
      const FindGoldByTime: 292;
      const FindMagicByTime: 293;
      const RegenstaminaByTime: 294;
      const StaminaByTime: 295;
      const DamageDemonByTime: 296;
      const DamageUndeadByTime: 297;
      const TohitDemonByTime: 298;
      const TohitUndeadByTime: 299;
      const CrushingBlowByTime: 300;
      const OpenWoundsByTime: 301;
      const KickDamageByTime: 302;
      const DeadlyStrikeByTime: 303;
      const FindGemsByTime: 304;
      const PierceCold: 305;
      const PierceFire: 306;
      const PierceLtng: 307;
      const PiercePois: 308;
      const DamageVsMonster: 309;
      const DamagePercentVsMonster: 310;
      const TohitVsMonster: 311;
      const TohitPercentVsMonster: 312;
      const AcVsMonster: 313;
      const AcPercentVsMonster: 314;
      const ExtraCharges: 324;
      const QuestDifficulty: 356;

      // doesn't exist but define for prototypes
      const AllRes: 555;
    }

    // unit info
    export namespace unittype {
      const Player: 0;
      const NPC: 1;
      const Monster: 1;
      const Object: 2;
      const Missile: 3;
      const Item: 4;
      const Stairs: 5; // const ToDo: might be more as stairs
    }

    export namespace player {
      export namespace flag {
        const Ignore: 2;
        const Hostile: 8;
      }
      export namespace slot {
        const Main: 0;
        const Secondary: 1
      }
      export namespace move {
        const Walk: 0;
        const Run: 1
      }
      export namespace mode { // sdk.player.mode.
        const Death: 0;
        const StandingOutsideTown: 1;
        const Walking: 2;
        const Running: 3;
        const GettingHit: 4;
        const StandingInTown: 5;
        const WalkingInTown: 6;
        const Attacking1: 7;
        const Attacking2: 8;
        const Blocking: 9;
        const CastingSkill: 10;
        const ThrowingItem: 11;
        const Kicking: 12;
        const UsingSkill1: 13;
        const UsingSkill2: 14;
        const UsingSkill3: 15;
        const UsingSkill4: 16;
        const Dead: 17;
        const SkillActionSequence: 18;
        const KnockedBack: 19;
      }
      namespace _class {
        const Amazon: 0;
        const Sorceress: 1;
        const Necromancer: 2;
        const Paladin: 3;
        const Barbarian: 4;
        const Druid: 5;
        const Assassin: 6;

        const nameOf: (classid: 0 | 1 | 2 | 3 | 4 | 5 | 6) => "Amazon" | "Sorceress" | "Necromancer" | "Paladin" | "Barbarian" | "Druid" | "Assassin" | false;
      }
      export { _class as class };
    }

    export namespace npcs {
      // same as monsters but more clear to use units.npcs.mode
      namespace mode {
        const Death: 0;
        const Standing: 1;
        const Walking: 2;
        const GettingHit: 3;
        const Attacking1: 4;
        const Attacking2: 5;
        const Blocking: 6;
        const CastingSkill: 7;
        const UsingSkill1: 8;
        const UsingSkill2: 9;
        const UsingSkill3: 10;
        const UsingSkill4: 11;
        const Dead: 12;
        const KnockedBack: 13;
        const Spawning: 14;
        const Running: 15
      }

      const Akara: 148;
      const Alkor: 254;
      const Asheara: 252;
      const WarrivAct1: 155;
      const WarrivAct2: 175;
      const Atma: 176;
      const Tyrael: 367;
      const Tyrael2: 251;
      const Tyrael3: 521;
      const Charsi: 154;
      const DeckardCain1: 146;
      const DeckardCain2: 244;
      const DeckardCain3: 245;
      const DeckardCain4: 246;
      const DeckardCain5: 265;
      const DeckardCain6: 520;
      const Drognan: 177;
      const Elzix: 199;
      const Fara: 178;
      const Gheed: 147;
      const Greiz: 198;
      const Halbu: 257;
      const Hratli: 253;
      const Jamella: 405;
      const Jerhyn: 201;
      const Kaelan: 331;
      const Kashya: 150;
      const Larzuk: 511;
      const Lysander: 202;
      const Malah: 513;
      const Meshif: 210;
      const Meshif2: 264;
      const Natalya: 297;
      const Ormus: 255;
      const NihlathakNPC: 526;
      const Qualkehk: 515;
      const RogueScout: 270;
      const TempleGuard1: 52;
      const TempleGuard2: 665;
      const TempleGuard3: 666;
      const Townguard1: 535;
      const Townguard2: 536;
    }

    export namespace objects {
      namespace mode {
        const Inactive: 0;
        const Interacted: 1;
        const Active: 2;
      }

      const chestIds: [
        5, 6, 87, 104, 105, 106, 107, 143, 140, 141, 144, 146, 147, 148, 176, 177, 181, 183, 198, 240, 241,
        242, 243, 329, 330, 331, 332, 333, 334, 335, 336, 354, 355, 356, 371, 387, 389, 390, 391, 397, 405,
        406, 407, 413, 420, 424, 425, 430, 431, 432, 433, 454, 455, 501, 502, 504, 505, 580, 581
      ];

      // act1
      const MoldyTome: 8;
      const A1TownFire: 39;
      const A1Waypoint: 119;
      const StoneAlpha: 17;
      const StoneBeta: 18;
      const StoneGamma: 19;
      const StoneDelta: 20;
      const StoneLambda: 21;
      const StoneTheta: 22;
      const CainsJail: 26;
      const InifussTree: 30;
      const Malus: 108;

      // act 2
      const A2Waypoint: 156;
      const A2UndergroundUpStairs: 22;
      const TrapDoorA2: 74; // ancienttunnel/sewers act 2
      const DoorbyDockAct2: 75; // incorrect ? const TODO: figure out what 75 really corresponds to since the door is obj type 5 with classid 20
      const PortaltoDurielsLair: 100;
      const HoradricStaffHolder: 152;
      const ArcaneSanctuaryPortal: 298;
      const HoradricCubeChest: 354;
      const HoradricScrollChest: 355;
      const Journal: 357;

      // act 3
      const A3Waypoint: 237;
      const ForestAltar: 81;
      const LamEsensTome: 193;
      const SewerStairsA3: 366;
      const SewerLever: 367;
      const DuranceEntryStairs: 386;
      const RedPortalToAct4: 342;
      const CompellingOrb: 404;

      // act 4
      const A4Waypoint: 398;
      const SealGlow: 131;
      const DiabloStar: 255;
      const DiabloSealInfector: 392;
      const DiabloSealInfector2: 393;
      const DiabloSealSeis: 394;
      const DiabloSealVizier: 396;
      const DiabloSealVizier2: 395;
      const RedPortalToAct5: 566; // The one of tyreal

      // act 5
      const A5Waypoint: 429;
      const SideCavesA5: 75; // FrozenRiver, DrifterCavern; IcyCellar
      const Act5Gate: 449;
      const KorlictheProtectorStatue: 474;
      const TalictheDefenderStatue: 475;
      const MadawctheGuardianStatue: 476;
      const AncientsAltar: 546;
      const ArreatEnterAncientsWay: 564;
      const ArreatEnterWorldstone: 547;
      //const AncientsDoor: 547;
      const AncientsDoor: 547; // Worldstone keep lvl 1
      const FrozenAnya: 558;
      const FrozenAnyasPlatform: 460;
      const NihlathaksPlatform: 462;
      const WorldstonePortal: 563;

      const FrigidHighlandsChest: 455;
      const IcyCellarChest: 397;

      const SmallSparklyChest: 397;
      const LargeSparklyChest: 455;
      const SuperChest: 580;

      // misc
      const BubblingPoolofBlood: 82;
      const HornShrine: 83;
      const Stash: 267;
      const BluePortal: 59;
      const RedPortal: 60;
      const Smoke: 401;
    }

    export namespace exits {
      namespace type {
        const WalkThrough: 1;
        const Stairs: 2;
        const RedPortal: 60;
      }
      namespace preset {
        const AreaEntrance: 0; // special
        // act 1
        const CaveHoleUp: 4;
        const CaveHoleLvl2: 5;
        const Crypt: 6;
        const Mausoleum: 7;
        const CryptMausExit: 8;
        const JailUpStairs: 13;
        const JailDownStairs: 14;
        const CathedralDownStairs: 15;
        const CathedralUpStairs: 16;
        const CatacombsUpStairs: 17;
        const CatacombsDownStairs: 18;

        // act 2
        const A2SewersTrapDoor: 19;
        const A2EnterSewersDoor: 20;
        const A2ExitSewersDoor: 21;
        const A2UndergroundUpStairs: 22;
        const A2DownStairs: 23;
        const EnterHaremStairs: 24;
        const ExitHaremStairs: 25;
        const PreviousLevelHaremRight: 26;
        const PreviousLevelHaremLeft: 27;
        const NextLevelHaremRight: 28;
        const NextLevelHaremLeft: 29;
        const PreviousPalaceRight: 30;
        const PreviousPalaceLeft: 31;
        const NextLevelPalace: 32;
        const EnterStonyTomb: 33;
        const EnterHalls: 36;
        const EnterTalTomb1: 38;
        const EnterTalTomb2: 39;
        const EnterTalTomb3: 40;
        const EnterTalTomb4: 41;
        const EnterTalTomb5: 42;
        const EnterTalTomb6: 43;
        const EnterTalTomb7: 44;
        const PreviousAreaTomb: 45;
        const NextLevelTomb: 46;
        const EnterMaggotLair: 47;
        const PreviousAreaMaggotLair: 48;
        const NextLevelMaggotLair: 49;
        const AncientTunnelsTrapDoor: 50;
        const EntrancetoDurielsLair: 100;

        // act 3
        const EnterSpiderHole: 51;
        const ExitSpiderHole: 52;
        const EnterPit: 53;
        const EnterDungeon: 54;
        const PreviousAreaDungeon: 55;
        const NextLevelDungeon: 56;
        const A3EnterSewers: 57;
        const A3ExitSewersUpperK: 58;
        const A3SewersPreviousArea: 58;
        const A3ExitSewers: 59;
        const A3NextLevelSewers: 60;
        const EnterTemple: 61;
        const ExitTemple: 63;
        const EnterDurance: 64;
        const PreviousLevelDurance: 65;
        const NextLevelDurance: 68;
        const SewerStairsA3: 366;
        const DuranceEntryStairs: 386;

        // act 4
        const EnterRiverStairs: 69;
        const ExitRiverStairs: 70;
        // act 5
        const EnterCrystal: 71;
        const A5ExitCave: 73;
        const A5NextLevelCave: 74;
        const EnterSubLevelCave: 75;
        const EnterNithsTemple: 76;
        const PreviousAreaNithsTemple: 77;
        const NextAreaNithsTemple: 78;
        const ArreatEnterAncientsWay: 79;
        const ArreatEnterWorldstone: 80;
        const PreviousAreaWorldstone: 81;
        const NextAreaWorldstone: 82;
      }
    }
    
    export namespace monsters {
      namespace preset {
        // Confirmed
        const Izual: 256;
        const Bishibosh: 734;
        const Bonebreak: 735;
        const Coldcrow: 736;
        const Rakanishu: 737;
        const TreeheadWoodFist: 738;
        const Griswold: 739;
        const TheCountess: 740;
        const PitspawnFouldog: 741;
        const FlamespiketheCrawler: 742;
        const BoneAsh: 743;
        const Radament: 744;
        const BloodwitchtheWild: 745;
        const Fangskin: 746;
        const Beetleburst: 747;
        const CreepingFeature: 748;
        const ColdwormtheBurrower: 749;
        const FireEye: 750;
        const DarkElder: 751;
        const TheSummoner: 752;
        const AncientKaatheSoulless: 753;
        const TheSmith: 754;
        const SszarktheBurning: 755;
        const WitchDoctorEndugu: 756;
        const Stormtree: 757;
        const BattlemaidSarina: 758;
        const IcehawkRiftwing: 759;
        const IsmailVilehand: 760;
        const GelebFlamefinger: 761;
        const BremmSparkfist: 762;
        const ToorcIcefist: 763;
        const WyandVoidfinger: 764;
        const MafferDragonhand: 765;
        const WingedDeath: 766;
        const Taintbreeder: 768;
        const RiftwraiththeCannibal: 769;
        const InfectorofSouls: 770;
        const LordDeSeis: 771;
        const GrandVizierofChaos: 772;
        const TheCowKing: 773;
        const Corpsefire: 774;
        const Hephasto: 775;
        const ShenktheOverseer: 776;
        const TalictheDefender: 777;
        const MadawctheGuardian: 778;
        const KorlictheProtector: 779;
        const AxeDweller: 780;
        const BonesawBreaker: 781;
        const DacFarren: 782;
        const EldritchtheRectifier: 783;
        const EyebacktheUnleashed: 784;
        const ThreshSocket: 785;
        const Pindleskin: 786;
        const SnapchipShatter: 787;
        const AnodizedElite: 788;
        const VinvearMolech: 789;
        const SharpToothSayer: 790;
        const MagmaTorquer: 791;
        const BlazeRipper: 792;
        const Frozenstein: 793;
        const Nihlathak: 794;
        const ColenzotheAnnihilator: 795;
        const AchmeltheCursed: 796;
        const BartuctheBloody: 797;
        const VentartheUnholy: 798;
        const ListertheTormentor: 799;
        const BloodRaven: 805;

        // Unconfirmed
        // Questionable
        const GriefGrumble: 741; // JailLvl2
        const UniqueJailLvl3: 273;
        const UniqueArcaneSanctuary: 371;
      }
      namespace mode {
        const Death: 0;
        const Standing: 1;
        const Walking: 2;
        const GettingHit: 3;
        const Attacking1: 4;
        const Attacking2: 5;
        const Blocking: 6;
        const CastingSkill: 7;
        const UsingSkill1: 8;
        const UsingSkill2: 9;
        const UsingSkill3: 10;
        const UsingSkill4: 11;
        const Dead: 12;
        const KnockedBack: 13;
        const Spawning: 14;
        const Running: 15
      }
      namespace spectype {
        const All: 0;
        const Super: 1;
        const Champion: 2;
        const Unique: 4;
        const SuperUnique: 5;
        const Magic: 6;
        const Minion: 8;
      }
      // todo - determine what all these correlate to
      namespace type {
        const Undead: 1;
        const Demon: 2;
        const Insect: 3;
        const Human: 4;
        const Construct: 5;
        const LowUndead: 6;
        const HighUndead: 7;
        const Skeleton: 8;
        const Zombie: 9;
        const BigHead: 10;
        const FoulCrow: 11;
        const Fallen: 12;
        const Brute: 13;
        const SandRaider: 14;
        const Wraith: 15;
        const CorruptRogue: 16;
        const Baboon: 17;
        const GoatMan: 18;
        const QuillRat: 19;
        const SandMaggot: 20;
        const Viper: 21;
        const SandLeaper: 22;
        const PantherWoman: 23;
        const Swarm: 24;
        const Scarab: 25;
        const Mummy: 26;
        const Unraveler: 27;
        const Vulture: 28;
        const Mosquito: 29;
        const WillowWisp: 30;
        const Arach: 31;
        const ThornHulk: 32;
        const Vampire: 33;
        const BatDemon: 34;
        const Fetish: 35;
        const Blunderbore: 36;
        const UndeadFetish: 37;
        const Zakarum: 38;
        const FrogDemon: 39;
        const Tentacle: 40;
        const FingerMage: 41;
        const Golem: 42;
        const Vilekind: 43;
        const Regurgitator: 44;
        const DoomKnight: 45;
        const CouncilMember: 46;
        const MegaDemon: 47;
        const Bovine: 48;
        const SeigeBeast: 49;
        const SnowYeti: 50;
        const Minion: 51;
        const Succubus: 52;
        const Overseer: 53;
        const Imp: 54;
        const FrozenHorror: 55;
        const BloodLord: 56;
        const DeathMauler: 57;
        const PutridDefiler: 58;
      }
      const DiablosBoneCage: 340;
      const DiablosBoneCage2: 342;
      const Dummy1: 149;
      const Dummy2: 268;
      const AbyssKnight: 311;
      const Afflicted: 10;
      const Afflicted2: 580;
      const AlbinoRoach: 95;
      const Ancient1: 104;
      const Ancient2: 669;
      const Ancient3: 670;
      const Apparition: 41;
      const Arach1: 122;
      const Arach2: 685;
      const Assailant: 33;
      const Assailant2: 603;
      const BaalColdMage: 381;
      const Balrog1: 360;
      const Balrog2: 686;
      const Banished: 135;
      const Barbs: 422;
      const Bear1: 428;
      const Bear2: 431;
      const Beast: 441;
      const BerserkSlayer: 462;
      const BlackArcher: 163;
      const BlackLancer1: 168;
      const BlackLancer2: 617;
      const BlackLocusts: 88;
      const BlackRaptor1: 17;
      const BlackRaptor2: 592;
      const BlackRogue: 46;
      const BlackSoul1: 121;
      const BlackSoul2: 640;
      const BlackVultureNest: 208;
      const BloodBoss: 482;
      const BloodBringer: 443;
      const BloodClan1: 55;
      const BloodClan2: 588;
      const BloodDiver: 139;
      const BloodGolem: 290;
      const BloodHawk1: 16;
      const BloodHawk2: 591;
      const BloodHawkNest: 207;
      const BloodHook: 116;
      const BloodHookNest: 336;
      const BloodLord1: 134;
      const BloodLord2: 695;
      const BloodWing: 117;
      const BloodWingNest: 337;
      const Blunderbore1: 186;
      const Blunderbore2: 618;
      const BoneArcher1: 172;
      const BoneArcher2: 576;
      const BoneMage1: 275;
      const BoneMage2: 380;
      const BoneMage3: 384;
      const BoneMage4: 388;
      const BoneMage5: 624;
      const BoneWarrior1: 2;
      const BoneWarrior2: 648;
      const HellBovine: 391;
      const BrambleHulk: 128;
      const Brute: 24;
      const Bunny: 556;
      const BurningDead: 3;
      const BurningDeadArcher1: 173;
      const BurningDeadArcher2: 575;
      const BurningDeadArcher3: 577;
      const BurningDeadMage1: 276;
      const BurningDeadMage2: 385;
      const BurningDeadMage3: 389;
      const BurningDeadMage4: 621;
      const BurningSoul1: 641;
      const BurningSoul2: 120;
      const Cadaver1: 100;
      const Cadaver2: 703;
      const Cantor: 239;
      const CarrionBird1: 110;
      const CarrionBird2: 608;
      const Carver1: 642;
      const Carver2: 20;
      const CarverShaman: 645;
      const CarverShaman2: 59;
      const CaveLeaper1: 79;
      const CaveLeaper2: 629;
      const ClawViper1: 74;
      const ClawViper2: 594;
      const CloudStalker1: 18;
      const CloudStalker2: 593;
      const CloudStalkerNest: 209;
      const Combatant1: 522;
      const Combatant2: 523;
      const ConsumedFireBoar: 464;
      const ConsumedIceBoar: 463;
      const CorpseSpitter: 308;
      const Corpulent: 307;
      const Creature1: 248;
      const Creature2: 427;
      const Creeper: 413;
      const CrushBiest: 442;
      const Crusher: 26;
      const Damned1: 14;
      const Damned2: 584;
      const DarkArcher1: 162;
      const DarkArcher2: 614;
      const DarkFamiliar: 140;
      const DarkHunter: 43;
      const DarkLancer1: 167;
      const DarkLancer2: 616;
      const DarkLord1: 133;
      const DarkLord2: 697;
      const DarkOne1: 22;
      const DarkOne2: 644;
      const DarkRanger: 160;
      const DarkShaman1: 61;
      const DarkShaman2: 647;
      const DarkShape: 42;
      const DarkSpearwoman: 165;
      const DarkStalker: 45;
      const DeamonSteed: 445;
      const DeathClan1: 57;
      const DeathClan2: 589;
      const Decayed: 97;
      const DefiledWarrior: 440;
      const Defiler1: 546;
      const Defiler2: 547;
      const Defiler3: 548;
      const Defiler4: 549;
      const Defiler5: 550;
      const DesertWing: 136;
      const Destruction: 410;
      const Devilkin: 643;
      const Devilkin2: 21;
      const DevilkinShaman: 646;
      const DevilkinShaman2: 60;
      const Devourer: 70;
      const DevourerEgg: 192;
      const DevourerQueen: 286;
      const DevourerYoung: 182;
      const Disfigured: 13;
      const Disfigured2: 583;
      const Dominus1: 474;
      const Dominus2: 636;
      const DoomApe: 51;
      const DoomKnight: 310;
      const DoomKnight1: 699;
      const DoomKnight2: 700;
      const Drehya1: 512;
      const Drehya2: 527;
      const DriedCorpse: 96;
      const DrownedCarcass: 8;
      const DuneBeast: 48;
      const DungSoldier: 91;
      const Dweller: 247;
      const Eagle: 429;
      const Embalmed: 98;
      const Faithful: 236;
      const Fallen: 19;
      const FallenShaman: 58;
      const FanaticMinion: 461;
      const Feeder: 115;
      const FeederNest: 335;
      const Fenris: 421;
      const Fetish1: 142;
      const BoneFetish2: 213;
      const Fetish3: 397;
      const FetishShaman: 279;
      const Fiend1: 137;
      const Fiend2: 651;
      const FireBoar: 456;
      const FireTower: 372;
      const FlameSpider: 125;
      const Flayer1: 143;
      const BoneFetish3: 214;
      const Flayer3: 398;
      const Flayer4: 659;
      const Flayer5: 656;
      const FlayerShaman1: 280;
      const FlayerShaman2: 662;
      const FleshArcher: 164;
      const FleshBeast1: 301;
      const FleshBeast2: 678;
      const FleshHunter: 47;
      const FleshLancer: 169;
      const FleshSpawner1: 298;
      const FleshSpawner2: 676;
      const FlyingScimitar: 234;
      const FoulCrow: 15;
      const FoulCrow2: 590;
      const FoulCrowNest: 206;
      const FrenziedHellSpawn: 465;
      const FrenziedIceSpawn: 466;
      const GargantuanBeast: 28;
      const Geglash: 200;
      const Ghost1: 38;
      const Ghost2: 631;
      const Ghoul: 7;
      const GhoulLord1: 131;
      const GhoulLord2: 696;
      const GiantLamprey: 71;
      const GiantLampreyEgg: 193;
      const GiantLampreyQueen: 287;
      const GiantLampreyYoung: 183;
      const GiantUrchin: 317;
      const Gloam1: 118;
      const Gloam2: 639;
      const Gloombat1: 138;
      const Gloombat2: 650;
      const Gorbelly: 187;
      const GoreBearer: 444;
      const GreaterHellSpawn1: 459;
      const GreaterHellSpawn2: 684;
      const GreaterIceSpawn: 460;
      const Groper: 304;
      const Grotesque1: 300;
      const Grotesque2: 675;
      const GrotesqueWyrm1: 303;
      const GrotesqueWyrm2: 677;
      const Guardian1: 102;
      const Guardian2: 667;
      const Hawk: 419;
      const Heirophant1: 240;
      const Heirophant2: 241;
      const Heirophant3: 673;
      const Heirophant4: 674;
      const HellBuzzard: 112;
      const HellCat: 86;
      const HellClan1: 56;
      const HellClan2: 587;
      const HellSlinger: 376;
      const HellSpawn1: 457;
      const HellSpawn2: 683;
      const HellSwarm: 90;
      const HellWhip: 483;
      const HollowOne: 101;
      const Horror: 4;
      const Horror1: 501;
      const Horror2: 502;
      const Horror3: 503;
      const Horror4: 504;
      const Horror5: 505;
      const HorrorArcher1: 174;
      const HorrorArcher2: 579;
      const HorrorMage1: 277;
      const HorrorMage2: 382;
      const HorrorMage3: 386;
      const HorrorMage4: 390;
      const HorrorMage5: 623;
      const HorrorMage6: 625;
      const HorrorMage7: 626;
      const Hs1: 560;
      const HungryDead: 6;
      const Huntress1: 83;
      const Huntress2: 627;
      const Hut: 528;
      const Hydra1: 351;
      const Hydra2: 352;
      const Hydra3: 353;
      const IceBoar: 455;
      const IceSpawn: 458;
      const Imp1: 492;
      const Imp2: 493;
      const Imp3: 494;
      const Imp4: 495;
      const Imp5: 496;
      const Imp6: 688;
      const Imp7: 689;
      const Infidel1: 32;
      const Infidel2: 600;
      const InsaneHellSpawn: 467;
      const InsaneIceSpawn: 468;
      const Invader1: 31;
      const Invader2: 602;
      const Itchies: 87;
      const JungleHunter: 50;
      const JungleUrchin: 67;
      const Larva: 283;
      const Lasher: 480;
      const LightningSpire: 371;
      const Lord1: 506;
      const Lord2: 507;
      const Lord3: 508;
      const Lord4: 509;
      const Lord5: 510;
      const Lord6: 652;
      const Lord7: 653;
      const Maggot: 227;
      const Malachai: 408;
      const Marauder: 30;
      const Marauder2: 599;
      const Master: 418;
      const Mauler: 188;
      const Mauler1: 529;
      const Mauler12: 604;
      const Mauler2: 530;
      const Mauler3: 531;
      const Mauler4: 532;
      const Mauler5: 533;
      const Mauler6: 619;
      const MawFiend: 694;
      const MawFiend2: 309;
      const Council1: 345;
      const Council2: 346;
      const Council3: 347;
      const Council4: 557;
      const Minion1: 572;
      const Minion2: 573;
      const Enslaved: 453;
      const MinionSlayerSpawner: 485;
      const MinionSpawner: 484;
      const Misshapen1: 12;
      const Misshapen2: 582;
      const MoonClan1: 53;
      const MoonClan2: 585;
      const BaalSubjectMummy: 105;
      const Navi: 266;
      const Flavie: 266;
      const NightClan1: 54;
      const NightClan2: 586;
      const NightLord: 132;
      const NightMarauder: 295;
      const NightSlinger1: 375;
      const NightSlinger2: 395;
      const NightTiger: 85;
      const OblivionKnight1: 312;
      const OblivionKnight2: 701;
      const OblivionKnight3: 702;
      const OverLord: 481;
      const OverSeer: 479;
      const PitLord1: 361;
      const PitLord2: 687;
      const PitViper1: 76;
      const PitViper2: 595;
      const PlagueBearer: 9;
      const PlagueBugs: 89;
      const PoisonSpinner: 124;
      const PreservedDead: 99;
      const ProwlingDead: 438;
      const QuillBear: 313;
      const QuillRat1: 63;
      const QuillRat2: 605;
      const RatMan1: 141;
      const RatMan2: 396;
      const BoneFetish1: 212;
      const RatMan4: 407;
      const RatManShaman: 278;
      const RazorBeast: 316;
      const RazorPitDemon: 82;
      const RazorSpine1: 66;
      const RazorSpine2: 607;
      const ReanimatedHorde: 437;
      const Returned1: 1;
      const Returned2: 649;
      const ReturnedArcher1: 171;
      const ReturnedArcher2: 578;
      const ReturnedMage: 274;
      const ReturnedMage1: 379;
      const ReturnedMage2: 383;
      const ReturnedMage3: 387;
      const ReturnedMage4: 620;
      const ReturnedMage5: 622;
      const RiverStalkerHead: 262;
      const RiverStalkerLimb: 259;
      const RockDweller: 49;
      const RockWorm: 69;
      const RockWormEgg: 191;
      const RockWormQueen: 285;
      const RockWormYoung: 181;
      const RotWalker: 436;
      const SaberCat1: 84;
      const SaberCat2: 628;
      const Salamander1: 75;
      const Salamander2: 596;
      const SandFisher: 123;
      const SandLeaper: 78;
      const SandMaggot: 68;
      const SandMaggotEgg: 190;
      const SandMaggotYoung: 180;
      const SandRaider1: 29;
      const SandRaider2: 601;
      const DeathBeetle: 92;
      const Scarab1: 93;
      const Scarab2: 654;
      const Sentry1: 411;
      const Sentry2: 412;
      const Sentry3: 415;
      const Sentry4: 416;
      const SerpentMagus1: 77;
      const SerpentMagus2: 598;
      const Sexton: 238;
      const Skeleton: 0;
      const SkeletonArcher: 170;
      const Slayerexp1: 454;
      const Slayerexp2: 682;
      const Slinger1: 373;
      const Slinger2: 610;
      const Slinger3: 611;
      const Slinger4: 612;
      const SnowYeti1: 446;
      const SnowYeti2: 447;
      const SnowYeti3: 448;
      const SnowYeti4: 449;
      const SoulKiller: 691;
      const SoulKiller1: 399;
      const SoulKiller2: 144;
      const SoulKiller3: 215;
      const SoulKiller4: 658;
      const SoulKiller5: 661;
      const SoulKillerShaman1: 664;
      const SoulKillerShaman2: 281;
      const SpearCat: 394;
      const SpearCat1: 374;
      const Specter1: 40;
      const Specter2: 633;
      const SpiderMagus: 126;
      const SpikeFiend1: 64;
      const SpikeFiend2: 606;
      const Spikefist: 130;
      const SpikeGiant: 314;
      const SteelWeevil1: 94;
      const SteelWeevil2: 655;
      const StormCaster1: 306;
      const StormCaster2: 693;
      const Strangler1: 305;
      const Strangler2: 692;
      const StygianDog: 302;
      const StygianDoll1: 145;
      const StygianDoll2: 216;
      const StygianDoll3: 400;
      const StygianDoll4: 660;
      const StygianDoll5: 657;
      const StygianDoll6: 690;
      const StygianDollShaman1: 663;
      const StygianDollShaman2: 282;
      const StygianFury: 476;
      const StygianHag: 299;
      const StygianHarlot: 471;
      const StygianWatcherHead: 263;
      const StygianWatcherLimb: 260;
      const Succubusexp1: 469;
      const Succubusexp2: 634;
      const Sucker: 114;
      const SuckerNest: 334;
      const Summoner: 250;
      const SwampGhost: 119;
      const Tainted: 11;
      const Tainted2: 581;
      const Taunt: 545;
      const Temptress1: 472;
      const Temptress2: 473;
      const Temptress3: 635;
      const Tentacle1: 562;
      const Tentacle2: 563;
      const Tentacle3: 564;
      const Tentacle4: 565;
      const Tentacle5: 566;
      const ThornBeast: 65;
      const ThornBrute: 315;
      const ThornedHulk1: 127;
      const ThornedHulk2: 609;
      const Thrasher: 129;
      const TombCreeper1: 80;
      const TombCreeper2: 630;
      const TombViper1: 73;
      const TombViper2: 597;
      const TrappedSoul1: 403;
      const TrappedSoul2: 404;
      const TreeLurker: 81;
      const UndeadScavenger: 111;
      const UnholyCorpse1: 439;
      const UnholyCorpse2: 698;
      const Unraveler1: 103;
      const Unraveler2: 668;
      const Urdar: 189;
      const VenomLord1: 362;
      const VenomLord2: 558;
      const VileArcher1: 161;
      const VileArcher2: 613;
      const VileHunter: 44;
      const VileLancer1: 166;
      const VileLancer2: 615;
      const VileTemptress: 470;
      const VileWitch1: 475;
      const VileWitch2: 638;
      const WailingBeast: 27;
      const WarpedFallen: 23;
      const WarpedShaman: 62;
      const Warrior: 417;
      const WaterWatcherHead: 261;
      const WaterWatcherLimb: 258;
      const WingedNightmare: 113;
      const Witch1: 637;
      const Witch2: 477;
      const Witch3: 478;
      const Wolf1: 359;
      const Wolf2: 420;
      const Wolf3: 430;
      const WolfRider1: 450;
      const WolfRider2: 451;
      const WolfRider3: 452;
      const WorldKiller1: 679;
      const WorldKiller2: 72;
      const WorldKillerEgg1: 681;
      const WorldKillerEgg2: 194;
      const WorldKillerQueen: 288;
      const WorldKillerYoung1: 680;
      const WorldKillerYoung2: 184;
      const Worm1: 551;
      const Worm2: 552;
      const Worm3: 553;
      const Worm4: 554;
      const Worm5: 555;
      const Wraith1: 39;
      const Wraith2: 632;
      const Yeti: 25;
      const Zakarumite: 235;
      const Zealot1: 237;
      const Zealot2: 671;
      const Zealot3: 672;
      const Zombie: 5;

      // Bosses/Ubers
      const Andariel: 156;
      const Duriel: 211;
      const Mephisto: 242;
      const Diablo: 243;
      const DiabloClone: 333;
      const ThroneBaal: 543;
      const Baal: 544;
      const BaalClone: 570;
      const UberMephisto: 704;
      const UberBaal: 705;
      const UberIzual: 706;
      const Lilith: 707;
      const UberDuriel: 708;
      const UberDiablo: 709;

      // Mini-Bosses
      const TheSmith: 402;
      const BloodRaven: 267;
      const Radament: 229;
      const TheSummoner: 250;
      const Griswold: 365;
      const Izual: 256;
      const Hephasto: 409;
      const KorlictheProtector: 540;
      const TalictheDefender: 541;
      const MadawctheGuardian: 542;
      const ListerTheTormenter: 571;
      const TheCowKing: 743;
      const ColdwormtheBurrower: 284;
      const Nihlathak: 526;

      // Objects
      const Turret1: 348;
      const Turret2: 349;
      const Turret3: 350;
      const CatapultS: 497;
      const CatapultE: 498;
      const CatapultSiege: 499;
      const CatapultW: 500;
      const Compellingorb: 366;
      const GargoyleTrap: 273;
      const MummyGenerator: 228;
      const Stairs: 559;
      const BarricadeDoor1: 432;
      const BarricadeDoor2: 433;
      const PrisonDoor: 434;
      const BarricadeTower: 435;
      const BarricadeWall1: 524;
      const BarricadeWall2: 525;

      // Misc?
      const Youngdiablo: 368;
      const Left: 525;
      const Life: 426;
      const Effect: 574;
      const Pet: 414;
      const Prince: 249;
      const POW: 534;
      const Right: 524;
      const Sage: 424;
      const Town: 514;
      const Cow: 179;
    }

    export namespace summons {
      namespace type {
        const Valkyrie: 2;
        const Golem: 3;
        const Skeleton: 4;
        const SkeletonMage: 5;
        const Revive: 6;
        const Mercenary: 7;
        const Dopplezon: 8;
        const Raven: 10;
        const SpiritWolf: 11;
        const Fenris: 12;
        const DireWolf: 12;
        const Totem: 13;
        const Spirit: 13;
        const Vine: 14;
        const Grizzly: 15;
        const ShadowWarrior: 16;
        const Shadow: 16;
        const AssassinTrap: 17;
        const Hydra: 19;
      }

      namespace mode {
        const Death: 0;
        const Standing: 1;
        const Walking: 2;
        const GettingHit: 3;
        const Attacking1: 4;
        const Attacking2: 5;
        const Blocking: 6;
        const CastingSkill: 7;
        const UsingSkill1: 8;
        const UsingSkill2: 9;
        const UsingSkill3: 10;
        const UsingSkill4: 11;
        const Dead: 12;
        const KnockedBack: 13;
        const Spawning: 14;
        const Running: 15
      }

      const ClayGolem: 289;
      const Dopplezon: 356;
      const Valkyrie: 357;
      const FireGolem: 292;
      const IronGolem: 291;
      const NecroMage: 364;
      const NecroSkeleton: 363;
      const Poppy: 425;
      const Wolverine: 423;
    }

    export namespace mercs {
      namespace mode {
        const Death: 0;
        const Standing: 1;
        const Walking: 2;
        const GettingHit: 3;
        const Attacking1: 4;
        const Attacking2: 5;
        const Blocking: 6;
        const CastingSkill: 7;
        const UsingSkill1: 8;
        const UsingSkill2: 9;
        const UsingSkill3: 10;
        const UsingSkill4: 11;
        const Dead: 12;
        const KnockedBack: 13;
        const Spawning: 14;
        const Running: 15
      }

      const Rogue: 271;
      const Guard: 338;
      const IronWolf: 359;
      const A5Barb: 561;
    }

    export namespace missiles {
      const DiabloLightning: 172;
      const FissureCrack1: 462;
      const FissureCrack2: 463;
    }

    export namespace storage {
      const Equipped: 1;
      const Belt: 2;
      const Inventory: 3;
      const TradeWindow: 5;
      const Cube: 6;
      const Stash: 7;
    }

    export namespace node {
      const NotOnPlayer: 0;
      const Storage: 1;
      const Belt: 2;
      const Equipped: 3;
      const Cursor: 4;
    }

    // Same apply's for merc with less things available
    export namespace body {
      const None: 0;
      const Head: 1;
      const Neck: 2;
      const Torso: 3;
      const Armor: 3;
      const RightArm: 4;
      const LeftArm: 5;
      const RingRight: 6;
      const RingLeft: 7;
      const Belt: 8;
      const Feet: 9;
      const Gloves: 10;
      const RightArmSecondary: 11;
      const LeftArmSecondary: 12
    }

    export namespace items {
      export namespace cost {
        const ToBuy: 0;
        const ToSell: 1;
        const ToRepair: 2;
      }
      export namespace flags {
        const Equipped: 0x00000001;
        const InSocket: 0x00000008;
        const Identified: 0x00000010;
        const OnActiveWeaponSlot: 0x00000040;
        const OnSwapWeaponSlot: 0x00000080;
        const Broken: 0x00000100;
        const FullRejuv: 0x00000400;
        const Socketed: 0x00000800;
        const InTradeGamble: 0x00002000;
        const NotInSocket: 0x00004000;
        const Ear: 0x00010000;
        const StartingItem: 0x00020000;
        const RuneQuestPotion: 0x00200000;
        const Ethereal: 0x00400000;
        const IsAnItem: 0x00800000;
        const Personalized: 0x01000000;
        const Runeword: 0x04000000;
      }
      export namespace mode {
        const inStorage: 0; //Item inven stash cube store = Item inven stash cube store
        const Equipped: 1; // Item equipped self or merc
        const inBelt: 2; // Item in belt
        const onGround: 3; // Item on ground
        const onCursor: 4; // Item on cursor
        const Dropping: 5; // Item being dropped
        const Socketed: 6 // Item socketed in item
      }
      export namespace quality {
        const LowQuality: 1;
        const Normal: 2;
        const Superior: 3;
        const Magic: 4;
        const Set: 5;
        const Rare: 6;
        const Unique: 7;
        const Crafted: 8;
      }
      export namespace _class1 {
        const Normal: 0;
        const Exceptional: 1;
        const Elite: 2;
      }
      export { _class1 as class };
      export namespace type {
        const Shield: 2;
        const Armor: 3;
        const Gold: 4;
        const BowQuiver: 5;
        const CrossbowQuiver: 6;
        const PlayerBodyPart: 7;
        const Herb: 8;
        const Potion: 9;
        const Ring: 10;
        const Elixir: 11;
        const Amulet: 12;
        const Charm: 13;
        const notused0: 14;
        const Boots: 15;
        const Gloves: 16;
        const notused1: 17;
        const Book: 18;
        const Belt: 19;
        const Gem: 20;
        const Torch: 21;
        const Scroll: 22;
        const notused2: 23;
        const Scepter: 24;
        const Wand: 25;
        const Staff: 26;
        const Bow: 27;
        const Axe: 28;
        const Club: 29;
        const Sword: 30;
        const Hammer: 31;
        const Knife: 32;
        const Spear: 33;
        const Polearm: 34;
        const Crossbow: 35;
        const Mace: 36;
        const Helm: 37;
        const MissilePotion: 38;
        const Quest: 39;
        const Bodypart: 40;
        const Key: 41;
        const ThrowingKnife: 42;
        const ThrowingAxe: 43;
        const Javelin: 44;
        const Weapon: 45;
        const MeleeWeapon: 46;
        const MissileWeapon: 47;
        const ThrownWeapon: 48;
        const ComboWeapon: 49;
        const AnyArmor: 50;
        const AnyShield: 51;
        const Miscellaneous: 52;
        const SocketFiller: 53;
        const Secondhand: 54;
        const StavesandRods: 55;
        const Missile: 56;
        const Blunt: 57;
        const Jewel: 58;
        const ClassSpecific: 59;
        const AmazonItem: 60;
        const BarbarianItem: 61;
        const NecromancerItem: 62;
        const PaladinItem: 63;
        const SorceressItem: 64;
        const AssassinItem: 65;
        const DruidItem: 66;
        const HandtoHand: 67;
        const Orb: 68;
        const VoodooHeads: 69;
        const AuricShields: 70;
        const PrimalHelm: 71;
        const Pelt: 72;
        const Cloak: 73;
        const Rune: 74;
        const Circlet: 75;
        const HealingPotion: 76;
        const ManaPotion: 77;
        const RejuvPotion: 78;
        const StaminaPotion: 79;
        const AntidotePotion: 80;
        const ThawingPotion: 81;
        const SmallCharm: 82;
        const LargeCharm: 83;
        const GrandCharm: 84;
        const AmazonBow: 85;
        const AmazonSpear: 86;
        const AmazonJavelin: 87;
        const AssassinClaw: 88;
        const MagicBowQuiv: 89;
        const MagicxBowQuiv: 90;
        const ChippedGem: 91;
        const FlawedGem: 92;
        const StandardGem: 93;
        const FlawlessGem: 94;
        const PerfectgGem: 95;
        const Amethyst: 96;
        const Diamond: 97;
        const Emerald: 98;
        const Ruby: 99;
        const Sapphire: 100;
        const Topaz: 101;
        const Skull: 102;
      }
      
      // Weapons
      export const HandAxe: 0;
      export const Axe: 1;
      export const DoubleAxe: 2;
      export const MilitaryPick: 3;
      export const WarAxe: 4;
      export const LargeAxe: 5;
      export const BroadAxe: 6;
      export const BattleAxe: 7;
      export const GreatAxe: 8;
      export const GiantAxe: 9;
      export const Wand: 10;
      export const YewWand: 11;
      export const BoneWand: 12;
      export const GrimWand: 13;
      export const Club: 14;
      export const Scepter: 15;
      export const GrandScepter: 16;
      export const WarScepter: 17;
      export const SpikedClub: 18;
      export const Mace: 19;
      export const MorningStar: 20;
      export const Flail: 21;
      export const WarHammer: 22;
      export const Maul: 23;
      export const GreatMaul: 24;
      export const ShortSword: 25;
      export const Scimitar: 26;
      export const Sabre: 27;
      export const Falchion: 28;
      export const CrystalSword: 29;
      export const BroadSword: 30;
      export const LongSword: 31;
      export const WarSword: 32;
      export const Two_HandedSword: 33;
      export const Claymore: 34;
      export const GiantSword: 35;
      export const BastardSword: 36;
      export const Flamberge: 37;
      export const GreatSword: 38;
      export const Dagger: 39;
      export const Dirk: 40;
      export const Kris: 41;
      export const Blade: 42;
      export const ThrowingKnife: 43;
      export const ThrowingAxe: 44;
      export const BalancedKnife: 45;
      export const BalancedAxe: 46;
      export const Javelin: 47;
      export const Pilum: 48;
      export const ShortSpear: 49;
      export const Glaive: 50;
      export const ThrowingSpear: 51;
      export const Spear: 52;
      export const Trident: 53;
      export const Brandistock: 54;
      export const Spetum: 55;
      export const Pike: 56;
      export const Bardiche: 57;
      export const Voulge: 58;
      export const Scythe: 59;
      export const Poleaxe: 60;
      export const Halberd: 61;
      export const WarScythe: 62;
      export const ShortStaff: 63;
      export const LongStaff: 64;
      export const GnarledStaff: 65;
      export const BattleStaff: 66;
      export const WarStaff: 67;
      export const ShortBow: 68;
      export const HuntersBow: 69;
      export const LongBow: 70;
      export const CompositeBow: 71;
      export const ShortBattleBow: 72;
      export const LongBattleBow: 73;
      export const ShortWarBow: 74;
      export const LongWarBow: 75;
      export const LightCrossbow: 76;
      export const Crossbow: 77;
      export const HeavyCrossbow: 78;
      export const RepeatingCrossbow: 79;
      export const Hatchet: 93;
      export const Cleaver: 94;
      export const TwinAxe: 95;
      export const Crowbill: 96;
      export const Naga: 97;
      export const MilitaryAxe: 98;
      export const BeardedAxe: 99;
      export const Tabar: 100;
      export const GothicAxe: 101;
      export const AncientAxe: 102;
      export const BurntWand: 103;
      export const PetrifiedWand: 104;
      export const TombWand: 105;
      export const GraveWand: 106;
      export const Cudgel: 107;
      export const RuneScepter: 108;
      export const HolyWaterSprinkler: 109;
      export const DivineScepter: 110;
      export const BarbedClub: 111;
      export const FlangedMace: 112;
      export const JaggedStar: 113;
      export const Knout: 114;
      export const BattleHammer: 115;
      export const WarClub: 116;
      export const MarteldeFer: 117;
      export const Gladius: 118;
      export const Cutlass: 119;
      export const Shamshir: 120;
      export const Tulwar: 121;
      export const DimensionalBlade: 122;
      export const BattleSword: 123;
      export const RuneSword: 124;
      export const AncientSword: 125;
      export const Espandon: 126;
      export const DacianFalx: 127;
      export const TuskSword: 128;
      export const GothicSword: 129;
      export const Zweihander: 130;
      export const ExecutionerSword: 131;
      export const Poignard: 132;
      export const Rondel: 133;
      export const Cinquedeas: 134;
      export const Stiletto: 135;
      export const BattleDart: 136;
      export const Francisca: 137;
      export const WarDart: 138;
      export const Hurlbat: 139;
      export const WarJavelin: 140;
      export const GreatPilum: 141;
      export const Simbilan: 142;
      export const Spiculum: 143;
      export const Harpoon: 144;
      export const WarSpear: 145;
      export const Fuscina: 146;
      export const WarFork: 147;
      export const Yari: 148;
      export const Lance: 149;
      export const LochaberAxe: 150;
      export const Bill: 151;
      export const BattleScythe: 152;
      export const Partizan: 153;
      export const Bec_de_Corbin: 154;
      export const GrimScythe: 155;
      export const JoStaff: 156;
      export const Quarterstaff: 157;
      export const CedarStaff: 158;
      export const GothicStaff: 159;
      export const RuneStaff: 160;
      export const EdgeBow: 161;
      export const RazorBow: 162;
      export const CedarBow: 163;
      export const DoubleBow: 164;
      export const ShortSiegeBow: 165;
      export const LargeSiegeBow: 166;
      export const RuneBow: 167;
      export const GothicBow: 168;
      export const Arbalest: 169;
      export const SiegeCrossbow: 170;
      export const Ballista: 171;
      export const Chu_Ko_Nu: 172;
      export const Katar: 175;
      export const WristBlade: 176;
      export const HatchetHands: 177;
      export const Cestus: 178;
      export const Claws: 179;
      export const BladeTalons: 180;
      export const ScissorsKatar: 181;
      export const Quhab: 182;
      export const WristSpike: 183;
      export const Fascia: 184;
      export const HandScythe: 185;
      export const GreaterClaws: 186;
      export const GreaterTalons: 187;
      export const ScissorsQuhab: 188;
      export const Suwayyah: 189;
      export const WristSword: 190;
      export const WarFist: 191;
      export const BattleCestus: 192;
      export const FeralClaws: 193;
      export const RunicTalons: 194;
      export const ScissorsSuwayyah: 195;
      export const Tomahawk: 196;
      export const SmallCrescent: 197;
      export const EttinAxe: 198;
      export const WarSpike: 199;
      export const BerserkerAxe: 200;
      export const FeralAxe: 201;
      export const Silver_edgedAxe: 202;
      export const Decapitator: 203;
      export const ChampionAxe: 204;
      export const GloriousAxe: 205;
      export const PolishedWand: 206;
      export const GhostWand: 207;
      export const LichWand: 208;
      export const UnearthedWand: 209;
      export const Truncheon: 210;
      export const MightyScepter: 211;
      export const SeraphRod: 212;
      export const Caduceus: 213;
      export const TyrantClub: 214;
      export const ReinforcedMace: 215;
      export const DevilStar: 216;
      export const Scourge: 217;
      export const LegendaryMallet: 218;
      export const OgreMaul: 219;
      export const ThunderMaul: 220;
      export const Falcata: 221;
      export const Ataghan: 222;
      export const ElegantBlade: 223;
      export const HydraEdge: 224;
      export const PhaseBlade: 225;
      export const ConquestSword: 226;
      export const CrypticSword: 227;
      export const MythicalSword: 228;
      export const LegendSword: 229;
      export const HighlandBlade: 230;
      export const BalrogBlade: 231;
      export const ChampionSword: 232;
      export const ColossusSword: 233;
      export const ColossusBlade: 234;
      export const BoneKnife: 235;
      export const MithrilPoint: 236;
      export const FangedKnife: 237;
      export const LegendSpike: 238;
      export const FlyingKnife: 239;
      export const FlyingAxe: 240;
      export const WingedKnife: 241;
      export const WingedAxe: 242;
      export const HyperionJavelin: 243;
      export const StygianPilum: 244;
      export const BalrogSpear: 245;
      export const GhostGlaive: 246;
      export const WingedHarpoon: 247;
      export const HyperionSpear: 248;
      export const StygianPike: 249;
      export const Mancatcher: 250;
      export const GhostSpear: 251;
      export const WarPike: 252;
      export const OgreAxe: 253;
      export const ColossusVoulge: 254;
      export const Thresher: 255;
      export const CrypticAxe: 256;
      export const GreatPoleaxe: 257;
      export const GiantThresher: 258;
      export const WalkingStick: 259;
      export const Stalagmite: 260;
      export const ElderStaff: 261;
      export const Shillelagh: 262;
      export const ArchonStaff: 263;
      export const SpiderBow: 264;
      export const BladeBow: 265;
      export const ShadowBow: 266;
      export const GreatBow: 267;
      export const DiamondBow: 268;
      export const CrusaderBow: 269;
      export const WardBow: 270;
      export const HydraBow: 271;
      export const PelletBow: 272;
      export const GorgonCrossbow: 273;
      export const ColossusCrossbow: 274;
      export const DemonCrossbow: 275;
      export const EagleOrb: 276;
      export const SacredGlobe: 277;
      export const SmokedSphere: 278;
      export const ClaspedOrb: 279;
      export const JaredsStone: 280;
      export const StagBow: 281;
      export const ReflexBow: 282;
      export const MaidenSpear: 283;
      export const MaidenPike: 284;
      export const MaidenJavelin: 285;
      export const GlowingOrb: 286;
      export const CrystallineGlobe: 287;
      export const CloudySphere: 288;
      export const SparklingBall: 289;
      export const SwirlingCrystal: 290;
      export const AshwoodBow: 291;
      export const CeremonialBow: 292;
      export const CeremonialSpear: 293;
      export const CeremonialPike: 294;
      export const CeremonialJavelin: 295;
      export const HeavenlyStone: 296;
      export const EldritchOrb: 297;
      export const DemonHeart: 298;
      export const VortexOrb: 299;
      export const DimensionalShard: 300;
      export const MatriarchalBow: 301;
      export const GrandMatronBow: 302;
      export const MatriarchalSpear: 303;
      export const MatriarchalPike: 304;
      export const MatriarchalJavelin: 305;
      export const Cap: 306;
      export const SkullCap: 307;
      export const Helm: 308;
      export const FullHelm: 309;
      export const GreatHelm: 310;
      export const Crown: 311;
      export const Mask: 312;
      export const QuiltedArmor: 313;
      export const LeatherArmor: 314;
      export const HardLeatherArmor: 315;
      export const StuddedLeather: 316;
      export const RingMail: 317;
      export const ScaleMail: 318;
      export const ChainMail: 319;
      export const BreastPlate: 320;
      export const SplintMail: 321;
      export const PlateMail: 322;
      export const FieldPlate: 323;
      export const GothicPlate: 324;
      export const FullPlateMail: 325;
      export const AncientArmor: 326;
      export const LightPlate: 327;
      export const Buckler: 328;
      export const SmallShield: 329;
      export const LargeShield: 330;
      export const KiteShield: 331;
      export const TowerShield: 332;
      export const GothicShield: 333;
      export const LeatherGloves: 334;
      export const HeavyGloves: 335;
      export const ChainGloves: 336;
      export const LightGauntlets: 337;
      export const Gauntlets: 338;
      export const Boots: 339;
      export const HeavyBoots: 340;
      export const ChainBoots: 341;
      export const LightPlatedBoots: 342;
      export const Greaves: 343;
      export const Sash: 344;
      export const LightBelt: 345;
      export const Belt: 346;
      export const HeavyBelt: 347;
      export const PlatedBelt: 348;
      export const BoneHelm: 349;
      export const BoneShield: 350;
      export const SpikedShield: 351;
      export const WarHat: 352;
      export const Sallet: 353;
      export const Casque: 354;
      export const Basinet: 355;
      export const WingedHelm: 356;
      export const GrandCrown: 357;
      export const DeathMask: 358;
      export const GhostArmor: 359;
      export const SerpentskinArmor: 360;
      export const DemonhideArmor: 361;
      export const TrellisedArmor: 362;
      export const LinkedMail: 363;
      export const TigulatedMail: 364;
      export const MeshArmor: 365;
      export const Cuirass: 366;
      export const RussetArmor: 367;
      export const TemplarCoat: 368;
      export const SharktoothArmor: 369;
      export const EmbossedPlate: 370;
      export const ChaosArmor: 371;
      export const OrnatePlate: 372;
      export const MagePlate: 373;
      export const Defender: 374;
      export const RoundShield: 375;
      export const Scutum: 376;
      export const DragonShield: 377;
      export const Pavise: 378;
      export const AncientShield: 379;
      export const DemonhideGloves: 380;
      export const SharkskinGloves: 381;
      export const HeavyBracers: 382;
      export const BattleGauntlets: 383;
      export const WarGauntlets: 384;
      export const DemonhideBoots: 385;
      export const SharkskinBoots: 386;
      export const MeshBoots: 387;
      export const BattleBoots: 388;
      export const WarBoots: 389;
      export const DemonhideSash: 390;
      export const SharkskinBelt: 391;
      export const MeshBelt: 392;
      export const BattleBelt: 393;
      export const WarBelt: 394;
      export const GrimHelm: 395;
      export const GrimShield: 396;
      export const BarbedShield: 397;
      export const WolfHead: 398;
      export const HawkHelm: 399;
      export const Antlers: 400;
      export const FalconMask: 401;
      export const SpiritMask: 402;
      export const JawboneCap: 403;
      export const FangedHelm: 404;
      export const HornedHelm: 405;
      export const AssaultHelmet: 406;
      export const AvengerGuard: 407;
      export const Targe: 408;
      export const Rondache: 409;
      export const HeraldicShield: 410;
      export const AerinShield: 411;
      export const CrownShield: 412;
      export const PreservedHead: 413;
      export const ZombieHead: 414;
      export const UnravellerHead: 415;
      export const GargoyleHead: 416;
      export const DemonHead: 417;
      export const Circlet: 418;
      export const Coronet: 419;
      export const Tiara: 420;
      export const Diadem: 421;
      export const Shako: 422;
      export const Hydraskull: 423;
      export const Armet: 424;
      export const GiantConch: 425;
      export const SpiredHelm: 426;
      export const Corona: 427;
      export const Demonhead: 428;
      export const DuskShroud: 429;
      export const Wyrmhide: 430;
      export const ScarabHusk: 431;
      export const WireFleece: 432;
      export const DiamondMail: 433;
      export const LoricatedMail: 434;
      export const Boneweave: 435;
      export const GreatHauberk: 436;
      export const BalrogSkin: 437;
      export const HellforgePlate: 438;
      export const KrakenShell: 439;
      export const LacqueredPlate: 440;
      export const ShadowPlate: 441;
      export const SacredArmor: 442;
      export const ArchonPlate: 443;
      export const Heater: 444;
      export const Luna: 445;
      export const Hyperion: 446;
      export const Monarch: 447;
      export const Aegis: 448;
      export const Ward: 449;
      export const BrambleMitts: 450;
      export const VampireboneGloves: 451;
      export const Vambraces: 452;
      export const CrusaderGauntlets: 453;
      export const OgreGauntlets: 454;
      export const WyrmhideBoots: 455;
      export const ScarabshellBoots: 456;
      export const BoneweaveBoots: 457;
      export const MirroredBoots: 458;
      export const MyrmidonGreaves: 459;
      export const SpiderwebSash: 460;
      export const VampirefangBelt: 461;
      export const MithrilCoil: 462;
      export const TrollBelt: 463;
      export const ColossusGirdle: 464;
      export const BoneVisage: 465;
      export const TrollNest: 466;
      export const BladeBarrier: 467;
      export const AlphaHelm: 468;
      export const GriffonHeaddress: 469;
      export const HuntersGuise: 470;
      export const SacredFeathers: 471;
      export const TotemicMask: 472;
      export const JawboneVisor: 473;
      export const LionHelm: 474;
      export const RageMask: 475;
      export const SavageHelmet: 476;
      export const SlayerGuard: 477;
      export const AkaranTarge: 478;
      export const AkaranRondache: 479;
      export const ProtectorShield: 480;
      export const GildedShield: 481;
      export const RoyalShield: 482;
      export const MummifiedTrophy: 483;
      export const FetishTrophy: 484;
      export const SextonTrophy: 485;
      export const CantorTrophy: 486;
      export const HierophantTrophy: 487;
      export const BloodSpirit: 488;
      export const SunSpirit: 489;
      export const EarthSpirit: 490;
      export const SkySpirit: 491;
      export const DreamSpirit: 492;
      export const CarnageHelm: 493;
      export const FuryVisor: 494;
      export const DestroyerHelm: 495;
      export const ConquerorCrown: 496;
      export const GuardianCrown: 497;
      export const SacredTarge: 498;
      export const SacredRondache: 499;
      export const KurastShield: 500;
      export const ZakarumShield: 501;
      export const VortexShield: 502;
      export const MinionSkull: 503;
      export const HellspawnSkull: 504;
      export const OverseerSkull: 505;
      export const SuccubusSkull: 506;
      export const BloodlordSkull: 507;
      export const Amulet: 520;
      export const Ring: 522;
      export const Arrows: 526;
      export const Bolts: 528;
      export const Jewel: 643;

      // Misc?
      const Elixir: 508;
      const Torch: 527;
      const Heart: 531;
      const Brain: 532;
      const Jawbone: 533;
      const Eye: 534;
      const Horn: 535;
      const Tail: 536;
      const Flag: 537;
      const Fang: 538;
      const Quill: 539;
      const Soul: 540;
      const Scalp: 541;
      const Spleen: 542;
      const Ear: 556;
      const Herb: 602;
      const anevilforce: 609;
      // Potions, tomes/scrolls, gold
      export const Key: 543;
      export const TomeofTownPortal: 518;
      export const TomeofIdentify: 519;
      export const ScrollofTownPortal: 529;
      export const ScrollofIdentify: 530;
      export const RancidGasPotion: 80;
      export const OilPotion: 81;
      export const ChokingGasPotion: 82;
      export const ExplodingPotion: 83;
      export const StranglingGasPotion: 84;
      export const FulminatingPotion: 85;
      export const StaminaPotion: 513;
      export const AntidotePotion: 514;
      export const RejuvenationPotion: 515;
      export const FullRejuvenationPotion: 516;
      export const ThawingPotion: 517;
      export const MinorHealingPotion: 587;
      export const LightHealingPotion: 588;
      export const HealingPotion: 589;
      export const GreaterHealingPotion: 590;
      export const SuperHealingPotion: 591;
      export const MinorManaPotion: 592;
      export const LightManaPotion: 593;
      export const ManaPotion: 594;
      export const GreaterManaPotion: 595;
      export const SuperManaPotion: 596;
      export const Gold: 523;
      // Charms
      export const SmallCharm: 603;
      export const LargeCharm: 604;
      export const GrandCharm: 605;

      export namespace quest {
        // Act 1
        const WirtsLeg: 88;
        const HoradricMalus: 89;
        const ScrollofInifuss: 524;
        const KeytotheCairnStones: 525;
        // Act 2
        const FinishedStaff: 91;
        const HoradricStaff: 91;
        const IncompleteStaff: 92;
        const ShaftoftheHoradricStaff: 92;
        const ViperAmulet: 521;
        const TopoftheHoradricStaff: 521;
        const Cube: 549;
        const BookofSkill: 552;
        // Act 3
        const DecoyGidbinn: 86;
        const TheGidbinn: 87;
        const KhalimsFlail: 173;
        const KhalimsWill: 174;
        const PotofLife: 545;
        const AJadeFigurine: 546;
        const JadeFigurine: 546;
        const TheGoldenBird: 547;
        const LamEsensTome: 548;
        const KhalimsEye: 553;
        const KhalimsHeart: 554;
        const KhalimsBrain: 555;
        // Act 4
        const HellForgeHammer: 90;
        const Soulstone: 551;
        const MephistosSoulstone: 551;
        // Act 5
        const MalahsPotion: 644;
        const ScrollofKnowledge: 645;
        const ScrollofResistance: 646;
        // Pandemonium Event
        const KeyofTerror: 647;
        const KeyofHate: 648;
        const KeyofDestruction: 649;
        const DiablosHorn: 650;
        const BaalsEye: 651;
        const MephistosBrain: 652;
        const StandardofHeroes: 658;
        // Essences/Token
        const TokenofAbsolution: 653;
        const TwistedEssenceofSuffering: 654;
        const ChargedEssenceofHatred: 655;
        const BurningEssenceofTerror: 656;
        const FesteringEssenceofDestruction: 657;
        // Misc
        const TheBlackTowerKey: 544;
      }
      export namespace runes {
        const El: 610;
        const Eld: 611;
        const Tir: 612;
        const Nef: 613;
        const Eth: 614;
        const Ith: 615;
        const Tal: 616;
        const Ral: 617;
        const Ort: 618;
        const Thul: 619;
        const Amn: 620;
        const Sol: 621;
        const Shael: 622;
        const Dol: 623;
        const Hel: 624;
        const Io: 625;
        const Lum: 626;
        const Ko: 627;
        const Fal: 628;
        const Lem: 629;
        const Pul: 630;
        const Um: 631;
        const Mal: 632;
        const Ist: 633;
        const Gul: 634;
        const Vex: 635;
        const Ohm: 636;
        const Lo: 637;
        const Sur: 638;
        const Ber: 639;
        const Jah: 640;
        const Cham: 641;
        const Zod: 642;
      }
      export namespace gems {
        export namespace Perfect {
          const Amethyst: 561;
          const Topaz: 566;
          const Sapphire: 571;
          const Emerald: 576;
          const Ruby: 581;
          const Diamond: 586;
          const Skull: 601;
        }
        export namespace Flawless {
          const Amethyst: 560;
          const Topaz: 565;
          const Sapphire: 570;
          const Emerald: 575;
          const Ruby: 580;
          const Diamond: 585;
          const Skull: 600;
        }
        export namespace Normal {
          const Amethyst: 559;
          const Topaz: 564;
          const Sapphire: 569;
          const Emerald: 574;
          const Ruby: 579;
          const Diamond: 584;
          const Skull: 599;
        }
        export namespace Flawed {
          const Amethyst: 558;
          const Topaz: 563;
          const Sapphire: 568;
          const Emerald: 573;
          const Ruby: 578;
          const Diamond: 583;
          const Skull: 598;
        }
        export namespace Chipped {
          const Amethyst: 557;
          const Topaz: 562;
          const Sapphire: 567;
          const Emerald: 572;
          const Ruby: 577;
          const Diamond: 582;
          const Skull: 597;
        }
      }
    }

    // locale strings
    export namespace locale {
      export namespace monsters {
        // bosses
        const Andariel: 3021;
        const Duriel: 3054;
        const Mephisto: 3062;
        const Diablo: 3060;
        const Baal: 3061;
        // Mini bosses
        const BloodRaven: 3111;
        const TreeheadWoodFist: 2873;
        const TheCountess: 2875;
        const TheSmith: 2889;
        const Radament: 2879;
        const TheSummoner: 3099;
        const HephastoTheArmorer: 1067;
        const Izual: 1014;
        const ShenktheOverseer: 22435;
        // Uniques
        const Corpsefire: 3319;
        const TheCowKing: 2850;
        const GrandVizierofChaos: 2851;
        const LordDeSeis: 2852;
        const InfectorofSouls: 2853;
        const RiftwraiththeCannibal: 2854;
        const Taintbreeder: 2855;
        const TheTormentor: 2856;
        const Darkwing: 2857;
        const MafferDragonhand: 2858;
        const WyandVoidbringer: 2859;
        const ToorcIcefist: 2860;
        const BremmSparkfist: 2861;
        const GelebFlamefinger: 2862;
        const IsmailVilehand: 2863;
        const IcehawkRiftwing: 2864;
        const BattlemaidSarina: 2865;
        const Stormtree: 2866;
        const WitchDoctorEndugu: 2867;
        const SszarkTheBurning: 2868;
        const Bishibosh: 2869;
        const Bonebreaker: 2870;
        const Coldcrow: 2871;
        const Rakanishu: 2872;
        const Griswold: 2874;
        const PitspawnFouldog: 2876;
        const FlamespiketheCrawler: 2877;
        const BoneAsh: 2878;
        const BloodwitchtheWild: 2880;
        const Fangskin: 2881;
        const Beetleburst: 2882;
        const CreepingFeature: 2883;
        const ColdwormtheBurrower: 2884;
        const FireEye: 2885;
        const DarkElder: 2886;
        const AncientKaatheSoulless: 2888;
        const SharpToothSayer: 22493;
        const SnapchipShatter: 22496;
        const Pindleskin: 22497;
        const ThreshSocket: 22498;
        const EyebacktheUnleashed: 22499;
        const EldritchtheRectifier: 22500;
        const DacFarren: 22501;
        const BonesawBreaker: 22502;
        const Frozenstein: 22504;
        const Rogue: 2897;
        const StygianDoll: 2898;
        const SoulKiller: 2899;
        const Flayer: 2900;
        const Fetish: 2901;
        const RatMan: 2902;
        const UndeadStygianDoll: 2903;
        const UndeadSoulKiller: 2904;
        const UndeadFlayer: 2905;
        const UndeadFetish: 2906;
        const UndeadRatMan: 2907;
        const DarkFamiliar: 2908;
        const BloodDiver: 2909;
        const Gloombat: 2910;
        const DesertWing: 2911;
        const TheBanished: 2912;
        const BloodLord: 2913;
        const DarkLord: 2914;
        const NightLord: 2915;
        const GhoulLord: 2916;
        const Spikefist: 2917;
        const Thrasher: 2918;
        const BrambleHulk: 2919;
        const ThornedHulk: 2920;
        const SpiderMagus: 2921;
        const FlameSpider: 2922;
        const PoisonSpinner: 2923;
        const SandFisher: 2924;
        const Arach: 2925;
        const BloodWing: 2926;
        const BloodHook: 2927;
        const Feeder: 2928;
        const Sucker: 2929;
        const WingedNightmare: 2930;
        const HellBuzzard: 2931;
        const UndeadScavenger: 2932;
        const CarrionBird: 2933;
        const Unraveler: 2934;
        const Guardian: 2935;
        const HollowOne: 2936;
        const HoradrimAncient: 2937;
        const BoneScarab: 2938;
        const SteelScarab: 2939;
        const Scarab: 2940;
        const DeathBeetle: 2941;
        const DungSoldier: 2942;
        const HellSwarm: 2943;
        const PlagueBugs: 2944;
        const BlackLocusts: 2945;
        const Itchies: 2946;
        const HellCat: 2947;
        const NightTiger: 2948;
        const SaberCat: 2949;
        const Huntress: 2950;
        const CliffLurker: 2951;
        const TreeLurker: 2952;
        const CaveLeaper: 2953;
        const TombCreeper: 2954;
        const SandLeaper: 2955;
        const TombViper: 2956;
        const PitViper: 2957;
        const Salamander: 2958;
        const ClawViper: 2959;
        const SerpentMagus: 2960;
        const BloodMaggot: 2961;
        const GiantLamprey: 2962;
        const Devourer: 2963;
        const RockWorm: 2964;
        const SandMaggot: 2965;
        const BushBarb: 2966;
        const RazorSpine: 2967;
        const ThornBeast: 2968;
        const SpikeFiend: 2969;
        const QuillRat: 2970;
        const HellClan: 2971;
        const MoonClan: 2972;
        const NightClan: 2973;
        const DeathClan: 2974;
        const BloodClan: 2975;
        const TempleGuard: 2976;
        const DoomApe: 2977;
        const JungleHunter: 2978;
        const RockDweller: 2979;
        const DuneBeast: 2980;
        const FleshHunter: 2981;
        const BlackRogue: 2982;
        const DarkStalker: 2983;
        const VileHunter: 2984;
        const DarkHunter: 2985;
        const DarkShape: 2986;
        const Apparition: 2987;
        const Specter: 2988;
        const Wraith: 2989;
        const Ghost: 2990;
        const Assailant: 2991;
        const Infidel: 2992;
        const Invader: 2993;
        const Marauder: 2994;
        const SandRaider: 2995;
        const GargantuanBeast: 2996;
        const WailingBeast: 2997;
        const Yeti: 2998;
        const Crusher: 2999;
        const Brute: 3000;
        const CloudStalker: 3001;
        const BlackVulture: 3002;
        const BlackRaptor: 3003;
        const BloodHawk: 3004;
        const FoulCrow: 3005;
        const PlagueBearer: 3006;
        const Ghoul: 3007;
        const DrownedCarcass: 3008;
        const HungryDead: 3009;
        const Zombie: 3010;
        const Horror: 3012;
        const Returned: 3013;
        const BurningDead: 3014;
        const BoneWarrior: 3015;
        const Damned: 3016;
        const Disfigured: 3017;
        const Misshapen: 3018;
        const Tainted: 3019;
        const Afflicted: 3020;
        const Camel: 3033;
        const Cadaver: 3034;
        const PreservedDead: 3035;
        const Embalmed: 3036;
        const DriedCorpse: 3037;
        const Decayed: 3038;
        const Urdar: 3039;
        const Mauler: 3040;
        const Gorebelly: 3041;
        const Blunderbore: 3042;
        const BloodMaggotYoung: 3043;
        const GiantLampreyYoung: 3044;
        const DevourerYoung: 3045;
        const RockWormYoung: 3046;
        const SandMaggotYoung: 3047;
        const BloodMaggotEgg: 3048;
        const GiantLampreyEgg: 3049;
        const DevourerEgg: 3050;
        const RockWormEgg: 3051;
        const SandMaggotEgg: 3052;
        const Maggot: 3053;
        const BloodHawkNest: 3055;
        const FlyingScimitar: 3056;
        const CloudStalkerNest: 3057;
        const BlackRaptorNest: 3058;
        const FoulCrowNest: 3059;
        const Cantor: 3063;
        const Heirophant: 3064;
        const Sexton: 3065;
        const Zealot: 3066;
        const Faithful: 3067;
        const Zakarumite: 3068;
        const BlackSoul: 3069;
        const BurningSoul: 3070;
        const SwampGhost: 3071;
        const Gloam: 3072;
        const WarpedShaman: 3073;
        const DarkShaman: 3074;
        const DevilkinShaman: 3075;
        const CarverShaman: 3076;
        const FallenShaman: 3077;
        const WarpedOne: 3078;
        const DarkOne: 3079;
        const Devilkin: 3080;
        const Carver: 3081;
        const Fallen: 3082;
        const ReturnedArcher: 3083;
        const HorrorArcher: 3084;
        const BurningDeadArcher: 3085;
        const BoneArcher: 3086;
        const CorpseArcher: 3087;
        const SkeletonArcher: 3088;
        const FleshLancer: 3089;
        const BlackLancer: 3090;
        const DarkLancer: 3091;
        const VileLancer: 3092;
        const DarkSpearwoman: 3093;
        const FleshArcher: 3094;
        const BlackArcher: 3095;
        const DarkRanger: 3096;
        const VileArcher: 3097;
        const DarkArcher: 3098;
        const StygianDollShaman: 3100;
        const SoulKillerShaman: 3101;
        const FlayerShaman: 3102;
        const FetishShaman: 3103;
        const RatManShaman: 3104;
        const HorrorMage: 3105;
        const BurningDeadMage: 3106;
        const BoneMage: 3107;
        const CorpseMage: 3108;
        const ReturnedMage: 3109;
        const GargoyleTrap: 3110;
        const NightMarauder: 3121;
        const FireGolem: 3122;
        const IronGolem: 3123;
        const BloodGolem: 3124;
        const ClayGolem: 3125;
        const BloodMaggotQueen: 3126;
        const GiantLampreyQueen: 3127;
        const DevourerQueen: 3128;
        const RockWormQueen: 3129;
        const SandMaggotQueen: 3130;
        const SlimePrince: 3131;
        const BogCreature: 3132;
        const SwampDweller: 3133;
        const BarbedGiant: 3134;
        const RazorBeast: 3135;
        const ThornBrute: 3136;
        const SpikeGiant: 3137;
        const QuillBear: 3138;
        const CouncilMember: 3139;
        const DarkWanderer: 3141;
        const HellSlinger: 3142;
        const NightSlinger: 3143;
        const SpearCat: 3144;
        const Slinger: 3145;
        const FireTower: 3146;
        const LightningSpire: 3147;
        const PitLord: 3148;
        const Balrog: 3149;
        const VenomLord: 3150;
        const IronWolf: 3151;
        const InvisoSpawner: 3152;
        const OblivionKnight: 3153;
        const Mage: 3154;
        const AbyssKnight: 3155;
        const FighterMage: 3156;
        const DoomKnight: 3157;
        const Fighter: 3158;
        const MawFiend: 3159;
        const CorpseSpitter: 3160;
        const Corpulent: 3161;
        const StormCaster: 3162;
        const Strangler: 3163;
        const DoomCaster: 3164;
        const GrotesqueWyrm: 3165;
        const StygianDog: 3166;
        const FleshBeast: 3167;
        const Grotesque: 3168;
        const StygianHag: 3169;
        const FleshSpawner: 3170;
        const RogueScout: 3171;
        const BloodWingNest: 3172;
        const BloodHookNest: 3173;
        const FeederNest: 3174;
        const SuckerNest: 3175;
        const Hydra: 3325;
      }
      namespace npcs {
        const Asheara: 1008;
        const Hratli: 1009;
        const Alkor: 1010;
        const Ormus: 1011;
        const Natalya: 1012;
        const Tyrael: 1013;
        const Izual1: 1014;
        const Izual2: 1015;
        const Jamella: 1016;
        const Halbu: 1017;
        const Hadriel: 1018;
        const Hazade: 1019;
        const Alhizeer: 1020;
        const Azrael: 1021;
        const Ahsab: 1022;
        const Chalan: 1023;
        const Haseen: 1024;
        const Razan: 1025;
        const Emilio: 1026;
        const Pratham: 1027;
        const Fazel: 1028;
        const Jemali: 1029;
        const Kasim: 1030;
        const Gulzar: 1031;
        const Mizan: 1032;
        const Leharas: 1033;
        const Durga: 1034;
        const Neeraj: 1035;
        const Ilzan: 1036;
        const Zanarhi: 1037;
        const Waheed: 1038;
        const Vikhyat: 1039;
        const Jelani: 1040;
        const Barani: 1041;
        const Jabari: 1042;
        const Devak: 1043;
        const Raldin: 1044;
        const Telash: 1045;
        const Ajheed: 1046;
        const Narphet: 1047;
        const Khaleel: 1048;
        const Phaet: 1049;
        const Geshef: 1050;
        const Vanji: 1051;
        const Haphet: 1052;
        const Thadar: 1053;
        const Yatiraj: 1054;
        const Rhadge: 1055;
        const Yashied: 1056;
        const Lharhad: 1057;
        const Flux: 1058;
        const Scorch: 1059;
        //const Natalya: 3022; both 1012 and 3022 return Natalya?
        const DeckardCain: 2890;
        const Gheed: 2891;
        const Akara: 2892;
        const Kashya: 2893;
        const Charsi: 2894;
        const Warriv: 2895;
        const Drognan: 3023;
        const Atma: 3024;
        const Fara: 3025;
        const Lysander: 3026;
        const Jerhyn: 3028;
        const Geglash: 3029;
        const Elzix: 3030;
        const Greiz: 3031;
        const Flavie: 3112;
        const Kaelan: 3113;
        const Meshif: 3114;
        const Larzuk: 22476;
        const Anya: 22477;
        const Malah: 22478;
        const Nihlathak1: 22479;
        const QualKehk: 22480;
        const Guard: 22481;
        const Combatant: 22482;
        const Nihlathak2: 22483;
      }
      namespace items {
        const KhalimsFlail: 1060;
        const KhalimsWill1: 1061;
        const KhalimsFlail2: 1062;
        const KhalimsWill2: 1063;
        const KhalimsEye: 1064;
        const KhalimsBrain: 1065;
        const KhalimsHeart: 1066;
        const ScrollofInifuss: 2216;
        const KeytotheCairnStones: 2217;
        const AJadeFigurine: 2227;
        const TheGoldenBird: 2228;
        const LamEsensTome1: 2229;
        const LamEsensTome2: 2230;
        const HoradricCube: 2231;
        const HoradricScroll: 2232;
        const MephistosSoulstone: 2233;
        const Ear: 2235;
        const AmuletoftheViper: 2697;
        const StaffofKings: 2698;
        const HoradricStaff: 2699;

        // Sets
        // Angelic Rainment
        const AngelicsSword: 10172;
        const AngelicsArmor: 10173;
        const AngelicsRing: 10174;
        const AngelicsAmulet: 10175;
        // Arcannas Tricks
        const ArcannasAmulet: 10180;
        const ArcannasStaff: 10181;
        const ArcannasHelmet: 10182;
        const ArcannasArmor: 10183;
        // Artic Gear
        const ArticsBow: 10176;
        const ArticsArmor: 10177;
        const ArticsBelt: 10178;
        const ArticsGloves: 10179;
        // Berserkers Gear
        const BerserkersHelmet: 10166;
        const BerserkersAxe: 10167;
        const BerserkersArmor: 10168;
        // Cathans Traps
        const CathansRing: 10147;
        const CathansAmulet: 10148;
        const CathansHelmet: 10149;
        const CathansArmor: 10150;
        const CathansStaff: 10151;
        // Civerbs Gear
        const CiverbsShield: 10122;
        const CiverbsAmulet: 10123;
        const CiverbsScepter: 10124;
        // Clegaws Brace
        const ClegawsSword: 10128;
        const ClegawsShield: 10129;
        const ClegawsGloves: 10130;
        // Deaths Disguise
        const DeathsGloves: 10169;
        const DeathsBelt: 10170;
        const DeathsSword: 10171;
        // Hsarus Defense
        const HsarusBoots: 10125;
        const HsarusShield: 10126;
        const HsarusBelt: 10127;
        // Infernal Tools
        const InfernalsHelmet: 10163;
        const InfernalsWand: 10164;
        const InfernalsBelt: 10165;
        // Irathas Finery
        const IrathasBelt: 10131;
        const IrathasHelmet: 10132;
        const IrathasGloves: 10133;
        const IrathasAmulet: 10134;
        // Isenharts Armory
        const IsenhartsHelmet: 10135;
        const IsenhartsArmor: 10136;
        const IsenhartsShield: 10137;
        const IsenhartsSword: 10138;
        // Milabrega Regalia
        const MilabregasArmor: 10143;
        const MilabregasHelmet: 10144;
        const MilabregasScepter: 10145;
        const MilabregasShield: 10146;
        // Sigons
        const SigonsHelmet: 10157;
        const SigonsArmor: 10158;
        const SigonsGloves: 10159;
        const SigonsBoots: 10160;
        const SigonsBelt: 10161;
        const SigonsShield: 10162;
        // Tancreds
        const TancredsPick: 10152;
        const TancredsArmor: 10153;
        const TancredsBoots: 10154;
        const TancredsAmulet: 10155;
        const TancredsHelmet: 10156;
        // Vidalas
        const VidalasAmulet: 10139;
        const VidalasArmor: 10140;
        const VidalasBoots: 10141;
        const VidalasBow: 10142;

        // LoD Sets
        // Aldurs's Legacy
        const AldursHelmet: 21697;
        const AldursArmor: 21698;
        const AldursBoots: 21700;
        const AldursMace: 21847;
        // Bul-Kathos's Children
        const BulKathosBlade: 21688;
        const BulKathoSword: 21689;
        // Cow Kings's Leathers
        const CowKingsHelmet: 21723;
        const CowKingsArmor: 21724;
        const CowKingsBoots: 21725;
        // Disciples
        const DisciplesAmulet: 21717;
        const DisciplesGloves: 21718;
        const DisciplesBoots: 21719;
        const DisciplesArmor: 21720;
        const DisciplesBelt: 21721;
        // Griswolds's Legacy
        const GriswoldsScepter: 21673;
        const GriswoldsShield: 21674;
        const GriswoldsArmor: 21675;
        const GriswoldsHelmet: 21676;
        // Heaven's Brethren
        const HeavensMace: 21823;
        const HeavensHelmet: 21824;
        const HeavensShield: 21825;
        const HeavensArmor: 21826;
        // Hwanin's
        const HwaninsHelmet: 21712;
        const HwaninsPolearm: 21713;
        const HwaninsArmor: 21714;
        const HwaninsBelt: 21821;
        // IK
        const ImmortalKingsMaul: 21840;
        const ImmortalKingsBoots: 21841;
        const ImmortalKingsGloves: 21842;
        const ImmortalKingsBelt: 21843;
        const ImmortalKingsArmor: 21844;
        const ImmortalKingsHelmet: 21845;
        // M'avina's
        const MavinasHelmet: 21702;
        const MavinasArmor: 21703;
        const MavinasGloves: 21704;
        const MavinasBelt: 21705;
        const MavinasBow: 21706;
        // Natalya's
        const NatalyasHelmet: 21668;
        const NatalyasClaw: 21669;
        const NatalyasArmor: 21670;
        const NatalyasBoots: 21671;
        // Naj's
        const NajsStaff: 21640;
        const NajsArmor: 21831;
        const NajsHelmet: 21832;
        // Orphan's
        const OrphansHelmet: 21731;
        const OrphansBelt: 21732;
        const OrphansGloves: 21733;
        const OrphansShield: 21734;
        // Sanders's
        const SandersGloves: 21876;
        const SandersBoots: 21877;
        const SandersHelmet: 21878;
        const SandersWand: 21879;
        // Sazabi's
        const SazabisSword: 21708;
        const SazabisArmor: 21709;
        const SazabisHelmet: 21710;
        // Tal
        const TalRashasBelt: 21816;
        const TalRashasAmulet: 21817;
        const TalRashasArmor: 21818;
        const TalRashasOrb: 21819;
        const TalRashasHelmet: 21820;
        // Trang-Ouls
        const TrangOulsHelmet: 21661;
        const TrangOulsShield: 21662;
        const TrangOulsArmor: 21664;
        const TrangOulsGloves: 21665;
        const TrangOulsBelt: 21666;

        // Uniques
        // Quest/Misc
        const KeyofTerror: 11146;
        const KeyofHate: 11147;
        const KeyofDestruction: 11148;
        const DiablosHorn: 11149;
        const BaalsEye: 11150;
        const MephistosBrain: 11151;
        const StandardofHeroes: 11152;
        const HellfireTorch: 11153;
        const Annihilus: 21743;

        // Unique Items
        const WitchwildString: 10911;
        const TitansRevenge: 21735;
        const LycandersAim: 21737;
        const ArreatsFace: 21744;
        const Homunculus: 21755;
        const JalalsMane: 21750;
        const HeraldofZakarum: 21758;
        const BloodRavensCharge: 21508;
        const Gimmershred: 21637;
        const MedusasGaze: 21516;
        const Rockstopper: 21519;
        const CrownofThieves: 21522;
        const BlackhornsFace: 21523;
        const TheSpiritShroud: 21524;
        const SkinoftheFlayedOne: 21525;
        const IronPelt: 21526;
        const SpiritForge: 21527;
        const CrowCaw: 21528;
        const DurielsShell: 21529;
        const SkulldersIre: 21530;
        const Toothrow: 21531;
        const AtmasWail: 21532;
        const BlackHades: 21533;
        const Corpsemourn: 21534;
        const QueHegans: 21535;
        const QueHegansWisdom: 21535;
        const Mosers: 21536;
        const MosersBlessedCircle: 21536;
        const Stormchaser: 21537;
        const TiamatsRubuke: 21538;
        const GerkesSanctuary: 21539;
        const RadamentsSphere: 21540;
        const Gravepalm: 21541;
        const Ghoulhide: 21542;
        const Hellmouth: 21543;
        const Infernostride: 21544;
        const Waterwalk: 21545;
        const Silkweave: 21546;
        const WarTraveler: 21547;
        const Razortail: 21548;
        const GloomsTrap: 21549;
        const Snowclash: 21550;
        const ThundergodsVigor: 21551;
        const LidlessWall: 21552;
        const LanceGuard: 21553;
        const Boneflame: 21555;
        const SteelPillar: 21556;
        const NightwingsVeil: 21557;
        const CrownofAges: 21559;
        const AndarielsVisage: 21560;
        const Dragonscale: 21562;
        const SteelCarapace: 21563;
        const RainbowFacet: 21565;
        const Ravenlore: 21566;
        const Boneshade: 21567;
        const Flamebellow: 21570;
        const DeathsFathom: 21571;
        const Wolfhowl: 21572;
        const SpiritWard: 21573;
        const KirasGuardian: 21574;
        const OrmusRobe: 21575;
        const GheedsFortune: 21576;
        const HalberdsReign: 21579;
        const DraculsGrasp: 21583;
        const Frostwind: 21584;
        const TemplarsMight: 21585;
        const EschutasTemper: 21586; // also 21620?
        const FirelizardsTalons: 21587;
        const SandstormTrek: 21588;
        const Marrowwalk: 21589;
        const HeavensLight: 21590;
        const ArachnidMesh: 21592;
        const NosferatusCoil: 21593;
        const Verdungos: 21595;
        const VerdungosHeartyCord: 21595;
        const CarrionWind: 21597;
        const GiantSkull: 21598;
        const AstreonsIronWard: 21599;
        const SaracensChance: 21608;
        const HighlordsWrath: 21609;
        const Ravenfrost: 21610;
        const Dwarfstar: 21611;
        const AtmasScarab: 21612;
        const Maras: 21613;
        const MarasKaleidoscope: 21613;
        const CrescentMoonAmulet: 21614;
        const TheRisingSun: 21615;
        const TheCatsEye: 21616;
        const BulKathosWeddingBand: 21617;
        const Metalgrid: 21619;
        const Stormshield: 21621;
        const BlackoakShield: 21622;
        const ArkainesValor: 21624;
        const TheGladiatorsBane: 21625;
        const HarlequinsCrest: 21627;
        const GuardianAngel: 21632;
        const TheGrandfather: 21643;
        const Doombringer: 21644;
        const TyraelsMight: 21645;
        const Lightsabre: 21646;
        const TheCraniumBasher: 21647;
        const DeathsWeb: 21650;
        const TheAtlantean: 21654;
        const CarinShard: 21658;
        const Coldkill: 21286;
        const ButchersCleaver: 21287;
        const Islestrike: 21289;
        const GuardianNaga: 21291;
        const SpellSteel: 21293;
        const SuicideBranch: 21297;
        const ArmofKingLeoric: 21299;
        const BlackhandKey: 21300;
        const DarkClanCrusher: 21301;
        const TheFetidSprinkler: 21304;
        const HandofBlessedLight: 21305;
        const Fleshrender: 21306;
        const SureshrillFrost: 21307;
        const Moonfall: 21308;
        const BaezilsVortex: 21309;
        const Earthshaker: 21310;
        const TheGavelofPain: 21312;
        const Bloodletter: 21313;
        const ColdstealEye: 21314;
        const Hexfire: 21315;
        const BladeofAliBaba: 21316;
        const Riftslash: 21317;
        const Headstriker: 21318;
        const PlagueBearer: 21319;
        //const TheAtlantean: 21320;
        const CrainteVomir: 21321;
        const BingSzWang: 21322;
        const TheVileHusk: 21323;
        const Cloudcrack: 21324;
        const TodesfaelleFlamme: 21325;
        const Swordguard: 21326;
        const Spineripper: 21327;
        const HeartCarver: 21328;
        const BlackbogsSharp: 21329;
        const Stormspike: 21330;
        const TheImpaler: 21331;
        const HoneSudan: 21334;
        const SpireofHonor: 21335;
        const TheMeatScraper: 21336;
        const BlackleachBlade: 21337;
        const AthenasWrath: 21338;
        const PierreTombaleCouant: 21339;
        const GrimsBurningDead: 21341;
        const Ribcracker: 21342;
        const ChromaticIre: 21343;
        const Warspear: 21344;
        const SkullCollector: 21345;
        const Skystrike: 21346;
        //const WitchwildString: 21349;
        const GoldstrikeArch: 21350;
        const PusSpitter: 21352;
        const VampireGaze: 21354;
        const StringofEars: 21355;
        const GoreRider: 21356;
        const LavaGout: 21357;
        const VenomGrip: 21358;
        const Visceratuant: 21359;
        //const GuardianAngel: 21360;
        const Shaftstop: 21361;
        const SkinofVipermagi: 21362;
        const Blackhorn: 21363;
        const ValkyrieWing: 21364;
        const PeasantCrown: 21365;
        const DemonMachine: 21366;
        const Riphook: 21369;
        const Razorswitch: 21370;
        const OndalsWisdom: 21375;
        const Deathbit: 21379;
        const Warshrike: 21380;
        const DemonLimb: 21387;
        const SteelShade: 21388;
        const TombReaver: 21389;
        //const DeathsWeb: 21390;
        const AngelsSong: 21393;
        const TheRedeemer: 21394;
        const Bonehew: 21398;
        const Steelrend: 21399;
        const AriocsNeedle: 21402;
        const SoulDrainer: 21407;
        const RuneMaster: 21408;
        const DeathCleaver: 21409;
        const ExecutionersJustice: 21410;
        const Leviathan: 21412;
        const WispProjector: 21417;
        const Lacerator: 21419;
        const MangSongsLesson: 21420;
        const Viperfork: 21421;
        const TheReapersToll: 21427;
        const SpiritKeeper: 21428;
        const Hellrack: 21429;
        const AlmaNegra: 21430;
        const DarkforceSpawn: 21431;
        const Ghostflame: 21438;
        const ShadowKiller: 21439;
        const GriffonsEye: 21442;
        const Thunderstroke: 21445;
        const DemonsArch: 21447;
        const DjinnSlayer: 21450;
        const Windforce: 21635;
        const GinthersRift: 21829;

        // Runewords
        const AncientsPledge: 20507;
        const Armageddon: 20508;
        const Authority: 20509;
        const Beast: 20510;
        const Beauty: 20511;
        const Black: 20512;
        const Blood: 20513;
        const Bone: 20514;
        const Bramble: 20515;
        const Brand: 20516;
        const BreathoftheDying: 20517;
        const BrokenPromise: 20518;
        const CalltoArms: 20519;
        const ChainsofHonor: 20520;
        const Chance: 20521;
        const Chaos: 20522;
        const CrescentMoon: 20523;
        const Darkness: 20524;
        const Daylight: 20525;
        const Death: 20526;
        const Deception: 20527;
        const Delerium: 20528;
        const Desire: 20529;
        const Despair: 20530;
        const Destruction: 20531;
        const Doom: 20532;
        const Dragon: 20533;
        const Dread: 20534;
        const Dream: 20535;
        const Duress: 20536;
        const Edge: 20537;
        const Elation: 20538;
        const Enigma: 20539;
        const Enlightenment: 20540;
        const Envy: 20541;
        const Eternity: 20542;
        const Exile: 20543;
        const Faith: 20544;
        const Famine: 20545;
        const Flame: 20546;
        const Fortitude: 20547;
        const Fortune: 20548;
        const Friendship: 20549;
        const Fury: 20550;
        const Gloom: 20551;
        const Grief: 20553;
        const HandofJustice: 20554;
        const Harmony: 20555;
        const HeartoftheOak: 20557;
        const HolyThunder: 20560;
        const Honor: 20561;
        const Revenge: 20562;
        const Humility: 20563;
        const Hunger: 20564;
        const Ice: 20565;
        const Infinity: 20566;
        const Innocence: 20567;
        const Insight: 20568;
        const Jealousy: 20569;
        const Judgement: 20570;
        const KingsGrace: 20571;
        const Kingslayer: 20572;
        const KnightsVigil: 20573;
        const Knowledge: 20574;
        const LastWish: 20575;
        const Law: 20576;
        const Lawbringer: 20577;
        const Leaf: 20578;
        const Lightning: 20579;
        const Lionheart: 20580;
        const Lore: 20581;
        const Love: 20582;
        const Loyalty: 20583;
        const Lust: 20584;
        const Madness: 20585;
        const Malice: 20586;
        const Melody: 20587;
        const Memory: 20588;
        const Mist: 20589;
        const Morning: 20590;
        const Mystery: 20591;
        const Myth: 20592;
        const Nadir: 20593;
        const NaturesKingdom: 20594;
        const Night: 20595;
        const Oath: 20596;
        const Obedience: 20597;
        const Oblivion: 20598;
        const Obsession: 20599;
        const Passion: 20600;
        const Patience: 20601;
        const Patter: 20602;
        const Peace: 20603;
        const VoiceofReason: 20604;
        const Penitence: 20605;
        const Peril: 20606;
        const Pestilence: 20607;
        const Phoenix: 20608;
        const Piety: 20609;
        const PillarofFaith: 20610;
        const Plague: 20611;
        const Praise: 20612;
        const Prayer: 20613;
        const Pride: 20614;
        const Principle: 20615;
        const ProwessinBattle: 20616;
        const Prudence: 20617;
        const Punishment: 20618;
        const Purity: 20619;
        const Question: 20620;
        const Radiance: 20621;
        const Rain: 20622;
        const Reason: 20623;
        const Red: 20624;
        const Rhyme: 20625;
        const Rift: 20626;
        const Sanctuary: 20627;
        const Serendipity: 20628;
        const Shadow: 20629;
        const ShadowofDoubt: 20630;
        const Silence: 20631;
        const SirensSong: 20632;
        const Smoke: 20633;
        const Sorrow: 20634;
        const Spirit: 20635;
        const Splendor: 20636;
        const Starlight: 20637;
        const Stealth: 20638;
        const Steel: 20639;
        const StillWater: 20640;
        const Sting: 20641;
        const Stone: 20642;
        const Storm: 20643;
        const Strength: 20644;
        const Tempest: 20645;
        const Temptation: 20646;
        const Terror: 20647;
        const Thirst: 20648;
        const Thought: 20649;
        const Thunder: 20650;
        const Time: 20651;
        const Tradition: 20652;
        const Treachery: 20653;
        const Trust: 20654;
        const Truth: 20655;
        const UnbendingWill: 20656;
        const Valor: 20657;
        const Vengeance: 20658;
        const Venom: 20659;
        const Victory: 20660;
        const Voice: 20661;
        const Void: 20662;
        const War: 20663;
        const Water: 20664;
        const Wealth: 20665;
        const Whisper: 20666;
        const White: 20667;
        const Wind: 20668;
        const WingsofHope: 20669;
        const Wisdom: 20670;
        const Woe: 20671;
        const Wonder: 20672;
        const Wrath: 20673;
        const Youth: 20674;
        const Zephyr: 20675;
      }
      namespace dialog {
        const youDoNotHaveEnoughGoldForThat: 3362
      }

      namespace text {
        const RepairCost: 3330;
        const SellValue: 3331;
        const IdentifyCost: 3332;
        const ItemCannotBeTradedHere: 3333;
        const TradeRepair: 3334;
        const Buy: 3335;
        const Sell: 3336;
        const Heal: 3337;
        const Repair: 3338;
        const NextPage: 3339;
        const PreviousPage: 3340;
        const Transmute: 3341;
        const YourGold: 3342;
        const WhichItemShouldBeImbued: 3343;
        const Yes: 3344;
        const No: 3345;
        const Gold2: 3346;
        const Sell2: 3347;
        const Buy2: 3358;
        const Hire: 3349;
        const ToStrength: 3473;
        const ToDexterity: 3474;
        const Defense: 3481;
        const Identify: 3350;
        const Repair2: 3351;
        const EnhancedDefense: 3520;
        const Strength: 4060;
        const Dexterity: 4062;
        const Vitality: 4066;
        const Energy: 4069;
        const DoNotMeetLevelReqForThisGame: 5162;
        const CdKeyDisabled: 5199;
        const CdKeyInUseBy: 5200;
        const OnlyOneInstanceAtATime: 5201;
        const CdKeyIntendedForAnotherProduct: 5202;
        const InvalidPassword: 5207;
        const AccountDoesNotExist: 5208;
        const AccountIsCorrupted: 5209;
        const AccountMustBeAtLeast: 5217;
        const AccountCantBeMoreThan: 5218;
        const PasswordMustBeAtLeast: 5219;
        const PasswordCantBeMoreThan: 5220;
        const LoginError: 5224;
        const UsernameMustBeAtLeast: 5231;
        const UsernameIncludedIllegalChars: 5232;
        const UsernameIncludedDisallowedwords: 5233;
        const AccountNameAlreadyExist: 5239;
        const UnableToCreateAccount: 5249;
        const CannotCreateGamesDeadHCChar: 5304;
        const Disconnected: 5347;
        const UnableToIndentifyVersion: 5245;
        const BattlenetNotResponding: 5353;
        const BattlenetNotResponding2: 5354;
        const HcCannotPlayWithSc: 5361;
        const ScCannotPlayWithHc: 5362;
        const CannotPlayInHellClassic: 5363;
        const CannotPlayInNightmareClassic: 5364;
        const EnhancedDamage: 10038;
        const ClassicCannotPlayWithXpac: 10101;
        const XpacCannotPlayWithClassic: 10102;
        const LoDKeyDisabled: 10913;
        const LodKeyInUseBy: 10914;
        const LoDKeyIntendedForAnotherProduct: 10915;
        const NonLadderCannotPlayWithLadder: 10929;
        const LadderCannotPlayWithNonLadder: 10930;
        const YourPositionInLineIs: 11026;
        const Gateway: 11049;
        const Ghostly: 11084;
        const Fanatic: 11085;
        const Possessed: 11086;
        const Berserker: 11087;
        const ExpiresIn: 11133;
        const CdKeyDisabledFromRealm: 11161;
        const CannotPlayInHellXpac: 21793;
        const CannotPlayInNightmareXpac: 21794;
      }

      namespace areas {
        // Act 1
        const RogueEncampment: 5055;
        const BloodMoor: 5054;
        const ColdPlains: 5053;
        const StonyField: 5052;
        const DarkWood: 5051;
        const BlackMarsh: 5050;
        const TamoeHighland: 5049;
        const DenofEvil: 5048;
        const CaveLvl1: 5047;
        const UndergroundPassageLvl1: 5046;
        const HoleLvl1: 5045;
        const PitLvl1: 5044;
        const CaveLvl2: 5043;
        const UndergroundPassageLvl2: 5042;
        const HoleLvl2: 5041;
        const PitLvl2: 5040;
        const BurialGrounds: 5039;
        const Crypt: 5038;
        const Mausoleum: 5037;
        const ForgottenTower: 5036;
        const TowerCellarLvl1: 5035;
        const TowerCellarLvl2: 5034;
        const TowerCellarLvl3: 5033;
        const TowerCellarLvl4: 5032;
        const TowerCellarLvl5: 5031;
        const MonasteryGate: 5030;
        const OuterCloister: 5029;
        const Barracks: 5038;
        const JailLvl1: 5027;
        const JailLvl2: 5026;
        const JailLvl3: 5025;
        const InnerCloister: 5024;
        const Cathedral: 5023;
        const CatacombsLvl1: 5022;
        const CatacombsLvl2: 5021;
        const CatacombsLvl3: 5020;
        const CatacombsLvl4: 5019;
        const Tristram: 5018;
        const MooMooFarm: 788;

        // Act 2
        const LutGholein: 852;
        const RockyWaste: 851;
        const DryHills: 850;
        const FarOasis: 849;
        const LostCity: 848;
        const ValleyofSnakes: 847;
        const CanyonofMagic: 846;
        const A2SewersLvl1: 845;
        const A2SewersLvl2: 844;
        const A2SewersLvl3: 843;
        const HaremLvl1: 842;
        const HaremLvl2: 841;
        const PalaceCellarLvl1: 840;
        const PalaceCellarLvl2: 839;
        const PalaceCellarLvl3: 838;
        const StonyTombLvl1: 837;
        const HallsoftheDeadLvl1: 836;
        const HallsoftheDeadLvl2: 835;
        const ClawViperTempleLvl1: 834;
        const StonyTombLvl2: 833;
        const HallsoftheDeadLvl3: 832;
        const ClawViperTempleLvl2: 831;
        const MaggotLairLvl1: 830;
        const MaggotLairLvl2: 829;
        const MaggotLairLvl3: 828;
        const AncientTunnels: 827;
        const TalRashasTomb1: 826;
        const TalRashasTomb2: 826;
        const TalRashasTomb3: 826;
        const TalRashasTomb4: 826;
        const TalRashasTomb5: 826;
        const TalRashasTomb6: 826;
        const TalRashasTomb7: 826;
        const DurielsLair: 825;
        const ArcaneSanctuary: 824;

        // Act 3
        const KurastDocktown: 820;
        const SpiderForest: 819;
        const GreatMarsh: 818;
        const FlayerJungle: 817;
        const LowerKurast: 816;
        const KurastBazaar: 815;
        const UpperKurast: 814;
        const KurastCauseway: 813;
        const Travincal: 812;
        const SpiderCave: 810;
        const SpiderCavern: 811;
        const SwampyPitLvl1: 809;
        const SwampyPitLvl2: 808;
        const FlayerDungeonLvl1: 806;
        const FlayerDungeonLvl2: 805;
        const SwampyPitLvl3: 807;
        const FlayerDungeonLvl3: 804;
        const A3SewersLvl1: 845;
        const A3SewersLvl2: 844;
        const RuinedTemple: 803;
        const DisusedFane: 802;
        const ForgottenReliquary: 801;
        const ForgottenTemple: 800;
        const RuinedFane: 799;
        const DisusedReliquary: 798;
        const DuranceofHateLvl1: 797;
        const DuranceofHateLvl2: 796;
        const DuranceofHateLvl3: 795;

        // Act 4
        const PandemoniumFortress: 790;
        const OuterSteppes: 792;
        const PlainsofDespair: 793;
        const CityoftheDamned: 794;
        const RiverofFlame: 791;
        const ChaosSanctuary: 789;

        // Act 5
        const Harrogath: 22646;
        const BloodyFoothills: 22647;
        const FrigidHighlands: 22648;
        const ArreatPlateau: 22649;
        const CrystalizedPassage: 22650;
        const FrozenRiver: 22651;
        const GlacialTrail: 22652;
        const DrifterCavern: 22653;
        const FrozenTundra: 22654;
        const AncientsWay: 22655;
        const IcyCellar: 22656;
        const ArreatSummit: 22657;
        const NihlathaksTemple: 22658;
        const HallsofAnguish: 22659;
        const HallsofPain: 22660;
        const HallsofVaught: 22662;
        const Abaddon: 21865;
        const PitofAcheron: 21866;
        const InfernalPit: 21867;
        const WorldstoneLvl1: 22663;
        const WorldstoneLvl2: 22664;
        const WorldstoneLvl3: 22665;
        const ThroneofDestruction: 22667;
        const WorldstoneChamber: 22666;

        // Ubers
        const MatronsDen: 5389;
        const ForgottenSands: 5389;
        const FurnaceofPain: 5389;
        const UberTristram: 5018;
      }
    }

    export namespace game {
      namespace profiletype {
        const SinglePlayer: 1;
        const Battlenet: 2;
        const OpenBattlenet: 3;
        const TcpIpHost: 4;
        const TcpIpJoin: 5
      }

      namespace controls {
        const Disabled: 4;
      }

      namespace gametype {
        const Classic: 0;
        const Expansion: 1;
      }

      // out of game locations
      namespace locations {
        const PreSplash: 0;
        const Lobby: 1;
        const WaitingInLine: 2;
        const LobbyChat: 3;
        const CreateGame: 4;
        const JoinGame: 5;
        const Ladder: 6;
        const ChannelList: 7;
        const MainMenu: 8;
        const Login: 9;
        const LoginError: 10;
        const LoginUnableToConnect: 11;
        const CharSelect: 12;
        const RealmDown: 13;
        const Disconnected: 14;
        const NewCharSelected: 15;
        const CharSelectPleaseWait: 16;
        const LobbyLostConnection: 17;
        const SplashScreen: 18;
        const CdKeyInUse: 19;
        const SelectDifficultySP: 20;
        const MainMenuConnecting: 21;
        const InvalidCdKey: 22;
        const CharSelectConnecting: 23;
        const ServerDown: 24;
        const LobbyPleaseWait: 25;
        const GameNameExists: 26;
        const GatewaySelect: 27;
        const GameDoesNotExist: 28;
        const CharacterCreate: 29;
        const OkCenteredErrorPopUp: 30;
        const TermsOfUse: 31;
        const CreateNewAccount: 32;
        const PleaseRead: 33;
        const RegisterEmail: 34;
        const Credits: 35;
        const Cinematics: 36;
        const CharChangeRealm: 37;
        const GameIsFull: 38;
        const OtherMultiplayer: 39;
        const TcpIp: 40;
        const TcpIpEnterIp: 41;
        const CharSelectNoChars: 42;
        const CharSelectChangeRealm: 43;
        const TcpIpUnableToConnect: 44;
      }
    }
    
    export namespace colors {
      const White: "ÿc0";
      const Red: "ÿc1";
      const NeonGreen: "ÿc2";
      const Blue: "ÿc3";
      const DarkGold: "ÿc4";
      const Gray: "ÿc5";
      const Black: "ÿc6";
      const LightGold: "ÿc7";
      const Orange: "ÿc8";
      const Yellow: "ÿc9";
      const DarkGreen: "ÿconst c:";
      const Purple: "ÿc;";
      const Green: "ÿc<";
      namespace D2Bot {
        const Black: 0;
        const Blue: 4;
        const Green: 5;
        const Gold: 6;
        const DarkGold: 7;
        const Orange: 8;
        const Red: 9;
        const Gray: 10
      }
    }

    export namespace keys {
      const Backspace: 8;
      const Tab: 9;
      const Enter: 13;
      const Shift: 16;
      const Ctrl: 17;
      const Alt: 18;
      const PauseBreak: 19;
      const CapsLock: 20;
      const Escape: 27;
      const Spacebar: 32;
      const PageUp: 33;
      const PageDown: 34;
      const End: 35;
      const Home: 36;
      const LeftArrow: 37;
      const UpArrow: 38;
      const RightArrow: 39;
      const DownArrow: 40;
      const Insert: 45;
      const Delete: 46;
      const Zero: 48;
      const One: 49;
      const Two: 50;
      const Three: 51;
      const Four: 52;
      const Five: 53;
      const Six: 54;
      const Seven: 55;
      const Eight: 56;
      const Nine: 57;
      const LeftWindowKey: 91;
      const RightWindowKey: 92;
      const SelectKey: 93;
      const Numpad0: 96;
      const Numpad1: 97;
      const Numpad2: 98;
      const Numpad3: 99;
      const Numpad4: 100;
      const Numpad5: 101;
      const Numpad6: 102;
      const Numpad7: 103;
      const Numpad8: 104;
      const Numpad9: 105;
      const NumpadStar: 106;
      const NumpadPlus: 107;
      const NumpadDash: 109;
      const NumpadDecimal: 110;
      const NumpadSlash: 111;
      const F1: 112;
      const F2: 113;
      const F3: 114;
      const F4: 115;
      const F5: 116;
      const F6: 117;
      const F7: 118;
      const F8: 119;
      const F9: 120;
      const F10: 121;
      const F11: 122;
      const F12: 123;
      const NumLock: 144;
      const ScrollLock: 145;
      const SemiColon: 186;
      const EqualSign: 187;
      const Comma: 188;
      const Dash: 189;
      const Period: 190;
      const ForwardSlash: 191;
      const GraveAccent: 192;
      const OpenBracket: 219;
      const BackSlash: 220;
      const CloseBracket: 221;
      const SingleQuote: 222;
      namespace code {
        const Backspace: 0x08;
        const Tab: 0x09;
        const Clear: 0x0C;
        const Enter: 0x0D;
        const Shift: 0x10;
        const Ctrl: 0x11;
        const Alt: 0x12;
        const PauseBreak: 0x13;
        const CapsLock: 0x14;
        const Esc: 0x1B;
        const Space: 0x20;
        const PageUp: 0x21;
        const PageDown: 0x22;
        const End: 0x23;
        const Home: 0x24;
        const LeftArrow: 0x25;
        const UpArrow: 0x26;
        const RightArrow: 0x27;
        const DownArrow: 0x28;
        const Select: 0x29;
        const Print: 0x2A;
        const PrintScreen: 0x2C;
        const Insert: 0x2D;
        const Delete: 0x2E;
      }
    }

    export namespace controls {
      const TextBox: 1;
      const Image1: 2;
      const Image2: 3;
      const LabelBox: 4;
      const ScrollBar: 5;
      const Button: 6;
      const List: 7;
      const Timer: 8;
      const Smack: 9;
      const ProgressBar: 10;
      const Popup: 11;
      const AccountList: 12
    }

    export namespace packets {
      namespace send {
        const WalkToLocation: 0x01;
        const WalkToEntity: 0x02;
        const RunToLocation: 0x03;
        const RunToEntity: 0x04;
        const LeftSkillOnLocation: 0x05;
        const LeftSkillOnEntity: 0x06;
        const LeftSkillOnEntityEx: 0x07;
        const LeftSkillOnLocationEx: 0x08;
        const LeftSkillOnEntityEx2: 0x09;
        const LeftSkillOnEntityEx3: 0x0A;
        const RightSkillOnLocation: 0x0C;
        const RightSkillOnEntity: 0x0D;
        const RightSkillOnEntityEx: 0x0E;
        const RightSkillOnLocationEx: 0x0F;
        const RightSkillOnEntityEx2: 0x10;
        const RightSkillOnEntityEx3: 0x11;
        const SetInfernoState: 0x12;
        const InteractWithEntity: 0x13;
        const OverheadMessage: 0x14;
        const Chat: 0x15;
        const PickupItem: 0x16;
        const DropItem: 0x17;
        const ItemToBuffer: 0x18;
        const PickupBufferItem: 0x19;
        const ItemToBody: 0x1A;
        const Swap2HandedItem: 0x1B;
        const PickupBodyItem: 0x1C;
        const SwitchBodyItem: 0x1D;
        const Switch1HandWith2Hand: 0x1E;
        const SwitchInventoryItem: 0x1F;
        const UseItem: 0x20;
        const StackItem: 0x21;
        const RemoveStackItem: 0x22;
        const ItemToBelt: 0x23;
        const RemoveBeltItem: 0x24;
        const SwitchBeltItem: 0x25;
        const UseBeltItem: 0x26;
        const IndentifyItem: 0x27;
        const InsertSocketItem: 0x28;
        const ScrollToMe: 0x29;
        const ItemToCube: 0x2A;
        const NPCInit: 0x2F;
        const NPCCancel: 0x30;
        const QuestMessage: 0x31;
        const NPCBuy: 0x32;
        const NPCSell: 0x33;
        const NPCIndentifyItems: 0x34;
        const Repair: 0x35;
        const HireMerc: 0x36;
        const IndentifyGamble: 0x37;
        const EntityAction: 0x38;
        const AddStat: 0x3A;
        const AddSkill: 0x3B;
        const SelectSkill: 0x3C;
        const ActivateItem: 0x3E;
        const CharacterPhrase: 0x3F;
        const UpdateQuests: 0x40;
        const Resurrect: 0x41;
        const StaffInOrifice: 0x44;
        const MercInteract: 0x46;
        const MercMove: 0x47;
        const BusyStateOff: 0x48;
        const Waypoint: 0x49;
        const RequestEntityUpdate: 0x4B;
        const Transmorgify: 0x4C;
        const PlayNPCMessage: 0x4D;
        const ClickButton: 0x4F;
        const DropGold: 0x50;
        const BindHotkey: 0x51;
        const StaminaOn: 0x53;
        const StaminaOff: 0x54;
        const QuestCompleted: 0x58;
        const MakeEntityMove: 0x59;
        const SquelchHostile: 0x5D;
        const Party: 0x5E;
        const UpdatePlayerPos: 0x5F;
        const SwapWeapon: 0x60;
        const MercItem: 0x61;
        const MercRessurect: 0x62;
        const LeaveGame: 0x69;
      }
      namespace recv {
        const GameExit: 0x06;
        const MapReveal: 0x07;
        const MapHide: 0x08;
        const ReassignPlayer: 0x15;
        const SetSkill: 0x23;
        const Chat: 0x26;
        const UniqueEvents: 0x89;
        const WeaponSwitch: 0x97;
      }
    }
  }
}
export {};
