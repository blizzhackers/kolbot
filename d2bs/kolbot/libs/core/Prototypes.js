/**
*  @filename    Prototypes.js
*  @author      kolton, theBGuy
*  @credit      Jaenster
*  @desc        various 'Unit' prototypes
*
*/

// Ensure these are in polyfill.js
!isIncluded("Polyfill.js") && include("Polyfill.js");
!isIncluded("core/Me.js") && include("core/Me.js");

(function (global, original) {
  let firstRun = true;
  global.getUnit = function (...args) {
    if (firstRun) {
      delay(1500);
      firstRun = false;
    }

    // Stupid reference thing
    // eslint-disable-next-line no-unused-vars
    const test = original(-1);

    let [first] = args, second = args.length >= 2 ? args[1] : undefined;

    const ret = original.apply(this, args);

    // deal with bug
    if (first === 1 && typeof second === "string" && ret
      && ((me.act === 1 && ret.classid === sdk.monsters.Dummy1)
      || me.act === 2 && ret.classid === sdk.monsters.Dummy2)) {
      return null;
    }

    return original.apply(this, args);
  };
})([].filter.constructor("return this")(), getUnit);

// Check if party unit is in town
Party.prototype.__defineGetter__("inTown", function () {
  return sdk.areas.Towns.includes(this.area);
});

Object.defineProperties(Unit.prototype, {
  isChampion: {
    get: function () {
      return (this.spectype & sdk.monsters.spectype.Champion) > 0;
    },
  },
  isUnique: {
    get: function () {
      return (this.spectype & sdk.monsters.spectype.Unique) > 0;
    },
  },
  isMinion: {
    get: function () {
      return (this.spectype & sdk.monsters.spectype.Minion) > 0;
    },
  },
  isSuperUnique: {
    get: function () {
      return (this.spectype & (sdk.monsters.spectype.Super | sdk.monsters.spectype.Unique)) > 0;
    },
  },
  isSpecial: {
    get: function () {
      return (this.isChampion || this.isUnique || this.isSuperUnique);
    },
  },
  isPlayer: {
    get: function () {
      return this.type === sdk.unittype.Player;
    },
  },
  isMonster: {
    get: function () {
      return this.type === sdk.unittype.Monster;
    },
  },
  isNPC: {
    get: function () {
      return this.type === sdk.unittype.Monster && this.getStat(sdk.stats.Alignment) === 2;
    },
  },
  // todo - monster types
  isPrimeEvil: {
    get: function () {
      return [
        sdk.monsters.Andariel, sdk.monsters.Duriel, sdk.monsters.Mephisto,
        sdk.monsters.Diablo, sdk.monsters.Baal, sdk.monsters.BaalClone,
        sdk.monsters.UberDuriel, sdk.monsters.UberIzual, sdk.monsters.UberMephisto,
        sdk.monsters.UberDiablo, sdk.monsters.UberBaal, sdk.monsters.Lilith, sdk.monsters.DiabloClone
      ].includes(this.classid) || getBaseStat("monstats", this.classid, "primeevil");
    },
  },
  isBoss: {
    get: function () {
      return this.isPrimeEvil
        || [
          sdk.monsters.TheSmith, sdk.monsters.BloodRaven, sdk.monsters.Radament, sdk.monsters.Griswold,
          sdk.monsters.TheSummoner, sdk.monsters.Izual, sdk.monsters.Hephasto, sdk.monsters.KorlictheProtector,
          sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian, sdk.monsters.ListerTheTormenter,
          sdk.monsters.TheCowKing, sdk.monsters.ColdwormtheBurrower, sdk.monsters.Nihlathak
        ].includes(this.classid);
    },
  },
  isGhost: {
    get: function () {
      return [
        sdk.monsters.Ghost1, sdk.monsters.Wraith1, sdk.monsters.Specter1,
        sdk.monsters.Apparition, sdk.monsters.DarkShape, sdk.monsters.Ghost2,
        sdk.monsters.Wraith2, sdk.monsters.Specter2
      ].includes(this.classid) || getBaseStat("monstats", this.classid, "MonType") === sdk.monsters.type.Wraith;
    },
  },
  isDoll: {
    get: function () {
      return [
        sdk.monsters.BoneFetish1, sdk.monsters.BoneFetish2, sdk.monsters.BoneFetish3,
        sdk.monsters.SoulKiller3, sdk.monsters.StygianDoll2, sdk.monsters.StygianDoll6, sdk.monsters.SoulKiller
      ].includes(this.classid);
    },
  },
  isMonsterObject: {
    get: function () {
      return [
        sdk.monsters.Turret1, sdk.monsters.Turret2, sdk.monsters.Turret3, sdk.monsters.MummyGenerator,
        sdk.monsters.GargoyleTrap, sdk.monsters.LightningSpire, sdk.monsters.FireTower,
        sdk.monsters.BarricadeDoor1, sdk.monsters.BarricadeDoor2,
        sdk.monsters.BarricadeWall1, sdk.monsters.BarricadeWall2,
        sdk.monsters.CatapultS, sdk.monsters.CatapultE, sdk.monsters.CatapultSiege, sdk.monsters.CatapultW,
        sdk.monsters.BarricadeTower, sdk.monsters.PrisonDoor, sdk.monsters.DiablosBoneCage, sdk.monsters.Hut,
      ].includes(this.classid);
    },
  },
  isMonsterEgg: {
    get: function () {
      return [
        sdk.monsters.SandMaggotEgg, sdk.monsters.RockWormEgg, sdk.monsters.DevourerEgg, sdk.monsters.GiantLampreyEgg,
        sdk.monsters.WorldKillerEgg1, sdk.monsters.WorldKillerEgg2
      ].includes(this.classid);
    },
  },
  isMonsterNest: {
    get: function () {
      return [
        sdk.monsters.FoulCrowNest, sdk.monsters.BlackVultureNest,
        sdk.monsters.BloodHawkNest, sdk.monsters.BloodHookNest,
        sdk.monsters.BloodWingNest, sdk.monsters.CloudStalkerNest,
        sdk.monsters.FeederNest, sdk.monsters.SuckerNest
      ].includes(this.classid);
    },
  },
  isBaalTentacle: {
    get: function () {
      return [
        sdk.monsters.Tentacle1, sdk.monsters.Tentacle2,
        sdk.monsters.Tentacle3, sdk.monsters.Tentacle4, sdk.monsters.Tentacle5
      ].includes(this.classid);
    },
  },
  isShaman: {
    get: function () {
      return [
        sdk.monsters.FallenShaman, sdk.monsters.CarverShaman2, sdk.monsters.DevilkinShaman2, sdk.monsters.DarkShaman1,
        sdk.monsters.WarpedShaman, sdk.monsters.CarverShaman, sdk.monsters.DevilkinShaman, sdk.monsters.DarkShaman2
      ].includes(this.classid);
    },
  },
  isUnraveler: {
    get: function () {
      return getBaseStat("monstats", this.classid, "MonType") === sdk.monsters.type.Unraveler;
    },
  },
  isFallen: {
    get: function () {
      return [
        sdk.monsters.Fallen, sdk.monsters.Carver2, sdk.monsters.Devilkin2,
        sdk.monsters.DarkOne1, sdk.monsters.WarpedFallen,
        sdk.monsters.Carver1, sdk.monsters.Devilkin, sdk.monsters.DarkOne2
      ].includes(this.classid);
    },
  },
  isBeetle: {
    get: function () {
      return getBaseStat("monstats", this.classid, "MonType") === sdk.monsters.type.Scarab;
    },
  },
  isWalking: {
    get: function () {
      return (this.mode === sdk.monsters.mode.Walking && (this.targetx !== this.x || this.targety !== this.y));
    }
  },
  isRunning: {
    get: function () {
      return (this.mode === sdk.monsters.mode.Running && (this.targetx !== this.x || this.targety !== this.y));
    }
  },
  isMoving: {
    get: function () {
      return (this.isWalking || this.isRunning);
    },
  },
  isFrozen: {
    get: function () {
      return this.getState(sdk.states.FrozenSolid);
    },
  },
  isChilled: {
    get: function () {
      return this.getState(sdk.states.Frozen);
    },
  },
  extraStrong: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.ExtraStrong);
    },
  },
  extraFast: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.ExtraFast);
    },
  },
  cursed: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.Cursed);
    },
  },
  magicResistant: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.MagicResistant);
    },
  },
  fireEnchanted: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.FireEnchanted);
    },
  },
  lightningEnchanted: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.LightningEnchanted);
    },
  },
  coldEnchanted: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.ColdEnchanted);
    },
  },
  manBurn: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.ManaBurn);
    },
  },
  teleportation: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.Teleportation);
    },
  },
  spectralHit: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.SpectralHit);
    },
  },
  stoneSkin: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.StoneSkin);
    },
  },
  multiShot: {
    get: function () {
      if (!this.isMonster) return false;
      return this.getEnchant(sdk.enchant.MultipleShots);
    },
  },
  resPenalty: {
    value: me.classic ? [0, 20, 50][me.diff] : [0, 40, 100][me.diff],
    writable: true
  },
  fireRes: {
    get: function () {
      let modifier = 0;
      if (this === me) {
        me.getState(sdk.states.ShrineResFire) && (modifier += 75);
      }
      return this.getStat(sdk.stats.FireResist) - me.resPenalty - modifier;
    }
  },
  coldRes: {
    get: function () {
      let modifier = 0;
      if (this === me) {
        me.getState(sdk.states.ShrineResCold) && (modifier += 75);
        me.getState(sdk.states.Thawing) && (modifier += 50);
      }
      return this.getStat(sdk.stats.ColdResist) - me.resPenalty - modifier;
    }
  },
  lightRes: {
    get: function () {
      let modifier = 0;
      if (this === me) {
        me.getState(sdk.states.ShrineResLighting) && (modifier += 75);
      }
      return this.getStat(sdk.stats.LightResist) - me.resPenalty - modifier;
    }
  },
  poisonRes: {
    get: function () {
      let modifier = 0;
      if (this === me) {
        me.getState(sdk.states.ShrineResPoison) && (modifier += 75);
        me.getState(sdk.states.Antidote) && (modifier += 50);
      }
      return this.getStat(sdk.stats.PoisonResist) - me.resPenalty - modifier;
    }
  },
  hpPercent: {
    get: function () {
      return Math.round(this.hp * 100 / this.hpmax);
    }
  },
  attacking: {
    get: function () {
      if (this.type > sdk.unittype.Monster) {
        throw new Error("Unit.attacking: Must be used with Monster or Player units.");
      }
      switch (this.type) {
      case sdk.unittype.Player:
        return [
          sdk.player.mode.Attacking1, sdk.player.mode.Attacking2,
          sdk.player.mode.CastingSkill, sdk.player.mode.ThrowingItem,
          sdk.player.mode.Kicking, sdk.player.mode.UsingSkill1,
          sdk.player.mode.UsingSkill2, sdk.player.mode.UsingSkill3,
          sdk.player.mode.UsingSkill4, sdk.player.mode.SkillActionSequence
        ].includes(this.mode);
      case sdk.unittype.Monster:
        return [
          sdk.monsters.mode.Attacking1, sdk.monsters.mode.Attacking2,
          sdk.monsters.mode.CastingSkill, sdk.monsters.mode.UsingSkill1,
          sdk.monsters.mode.UsingSkill2, sdk.monsters.mode.UsingSkill3, sdk.monsters.mode.UsingSkill4
        ].includes(this.mode);
      default:
        return false;
      }
    }
  },
  idle: {
    get: function () {
      if (this.type > sdk.unittype.Player) throw new Error("Unit.idle: Must be used with player units.");
      // Dead is pretty idle too
      return (this.mode === sdk.player.mode.StandingOutsideTown
        || this.mode === sdk.player.mode.StandingInTown || this.mode === sdk.player.mode.Dead);
    }
  },
  gold: {
    get: function () {
      return this.getStat(sdk.stats.Gold) + this.getStat(sdk.stats.GoldBank);
    }
  },
  dead: {
    get: function () {
      switch (this.type) {
      case sdk.unittype.Player:
        return this.mode === sdk.player.mode.Death || this.mode === sdk.player.mode.Dead;
      case sdk.unittype.Monster:
        return this.mode === sdk.monsters.mode.Death || this.mode === sdk.monsters.mode.Dead;
      default:
        return false;
      }
    }
  },
  inTown: {
    get: function () {
      if (this.type > sdk.unittype.Player) throw new Error("Unit.inTown: Must be used with player units.");
      return sdk.areas.Towns.includes(this.area);
    }
  }
});

/**
 * @extends ItemUnit
 */
Object.defineProperties(Unit.prototype, {
  strreq: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let ethereal = this.getFlag(sdk.items.flags.Ethereal);
      let reqModifier = this.getStat(sdk.stats.ReqPercent);
      let baseReq = getBaseStat("items", this.classid, "reqstr");
      let finalReq = baseReq + Math.floor(baseReq * reqModifier / 100) - (ethereal ? 10 : 0);

      return Math.max(finalReq, 0);
    }
  },
  dexreq: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let ethereal = this.getFlag(sdk.items.flags.Ethereal);
      let reqModifier = this.getStat(sdk.stats.ReqPercent);
      let baseReq = getBaseStat("items", this.classid, "reqdex");
      let finalReq = baseReq + Math.floor(baseReq * reqModifier / 100) - (ethereal ? 10 : 0);

      return Math.max(finalReq, 0);
    }
  },
  parentName: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let parent = this.getParent();

      return parent ? parent.name : false;
    }
  },
  itemclass: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      const itemCode = getBaseStat("items", this.classid, "code");
      if (itemCode === undefined) return 0;
      if (itemCode === getBaseStat(0, this.classid, "ultracode")) return 2;
      if (itemCode === getBaseStat(0, this.classid, "ubercode")) return 1;

      return 0;
    }
  },
  charclass: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      let charclass = getBaseStat("itemtypes", this.itemType, "class");
      // hacky? Essentially just using this to check if we can use the item and if the item doesn't have a specific
      // class requirement, we'll just assume it's for our class. As this makes the actualy checks easy
      return charclass === 255 ? me.classid : charclass;
    }
  },
  isEquipped: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.location === sdk.storage.Equipped;
    }
  },
  isEquippedCharm: {
    // todo - fix this for storage checks
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return (this.location === sdk.storage.Inventory
        && [sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(this.itemType));
    }
  },
  isInInventory: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.location === sdk.storage.Inventory && this.mode === sdk.items.mode.inStorage;
    }
  },
  isInStash: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.location === sdk.storage.Stash && this.mode === sdk.items.mode.inStorage;
    }
  },
  isInCube: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.location === sdk.storage.Cube && this.mode === sdk.items.mode.inStorage;
    }
  },
  isInStorage: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.mode === sdk.items.mode.inStorage
        && [sdk.storage.Inventory, sdk.storage.Cube, sdk.storage.Stash].includes(this.location);
    }
  },
  isInBelt: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.location === sdk.storage.Belt && this.mode === sdk.items.mode.inBelt;
    }
  },
  isOnMain: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item || this.location !== sdk.storage.Equipped) return false;
      switch (me.weaponswitch) {
      case sdk.player.slot.Secondary:
        return [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary].includes(this.bodylocation);
      case sdk.player.slot.Main:
      default:
        return [sdk.body.RightArm, sdk.body.LeftArm].includes(this.bodylocation);
      }
    }
  },
  isOnSwap: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item || this.location !== sdk.storage.Equipped) return false;
      switch (me.weaponswitch) {
      case sdk.player.slot.Main:
        return [sdk.body.RightArmSecondary, sdk.body.LeftArmSecondary].includes(this.bodylocation);
      case sdk.player.slot.Secondary:
      default:
        return [sdk.body.RightArm, sdk.body.LeftArm].includes(this.bodylocation);
      }
    }
  },
  identified: {
    /** @this {ItemUnit} */
    get: function () {
      // Can't tell, as it isn't an item
      if (this.type !== sdk.unittype.Item) return undefined;
      // Is also true for white items
      return this.getFlag(sdk.items.flags.Identified);
    }
  },
  ethereal: {
    /** @this {ItemUnit} */
    get: function () {
      // Can't tell, as it isn't an item
      if (this.type !== sdk.unittype.Item) return undefined;
      return this.getFlag(sdk.items.flags.Ethereal);
    }
  },
  twoHanded: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return getBaseStat("items", this.classid, "2handed") === 1;
    }
  },
  oneOrTwoHanded: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return getBaseStat("items", this.classid, "1or2handed") === 1;
    }
  },
  strictlyTwoHanded: {
    /** @this {ItemUnit} */
    get: function () {
      return this.twoHanded && !this.oneOrTwoHanded;
    }
  },
  runeword: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return !!this.getFlag(sdk.items.flags.Runeword);
    }
  },
  questItem: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return (this.itemType === sdk.items.type.Quest
      || [
        sdk.items.quest.HoradricMalus, sdk.items.quest.WirtsLeg,
        sdk.items.quest.HoradricStaff, sdk.items.quest.ShaftoftheHoradricStaff,
        sdk.items.quest.ViperAmulet, sdk.items.quest.DecoyGidbinn,
        sdk.items.quest.TheGidbinn, sdk.items.quest.KhalimsFlail,
        sdk.items.quest.KhalimsWill, sdk.items.quest.HellForgeHammer, sdk.items.quest.StandardofHeroes
      ].includes(this.classid));
    }
  },
  sellable: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      if (this.getItemCost(sdk.items.cost.ToSell) <= 1) return false;
      return (!this.questItem
        && [
          sdk.items.quest.KeyofTerror, sdk.items.quest.KeyofHate,
          sdk.items.quest.KeyofDestruction, sdk.items.quest.DiablosHorn,
          sdk.items.quest.BaalsEye, sdk.items.quest.MephistosBrain,
          sdk.items.quest.TokenofAbsolution, sdk.items.quest.TwistedEssenceofSuffering,
          sdk.items.quest.ChargedEssenceofHatred, sdk.items.quest.BurningEssenceofTerror,
          sdk.items.quest.FesteringEssenceofDestruction
        ].indexOf(this.classid) === -1);
    }
  },
  lowquality: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.LowQuality;
    },
  },
  normal: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Normal;
    },
  },
  superior: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Superior;
    },
  },
  magic: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Magic;
    },
  },
  set: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Set;
    },
  },
  rare: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Rare;
    },
  },
  unique: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Unique;
    },
  },
  crafted: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.quality === sdk.items.quality.Crafted;
    },
  },
  sockets: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.getStat(sdk.stats.NumSockets);
    },
  },
  onGroundOrDropping: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return (this.mode === sdk.items.mode.onGround || this.mode === sdk.items.mode.Dropping);
    },
  },
  isShield: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return [sdk.items.type.Shield, sdk.items.type.AuricShields, sdk.items.type.VoodooHeads].includes(this.itemType);
    },
  },
  isCharm: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return [sdk.items.SmallCharm, sdk.items.LargeCharm, sdk.items.GrandCharm].includes(this.classid);
    }
  },
  isAnni: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.unique && this.itemType === sdk.items.type.SmallCharm;
    },
  },
  isTorch: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.unique && this.itemType === sdk.items.type.LargeCharm;
    },
  },
  isGheeds: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return false;
      return this.unique && this.itemType === sdk.items.type.GrandCharm;
    },
  },
  prettyPrint: {
    /** @this {ItemUnit} */
    get: function () {
      if (this.type !== sdk.unittype.Item) return this.name;
      if (this.fname === undefined) return typeof this.name === "string" ? this.name : "undefined";
      return this.fname.split("\n").reverse().join(" ");
    }
  },
  durabilityPercent: {
    get: function () {
      if (this.type !== sdk.unittype.Item) throw new Error("Unit.durabilityPercent: Must be used on items.");
      if (this.getStat(sdk.stats.Quantity) || !this.getStat(sdk.stats.MaxDurability)) return 100;
      return Math.round(this.getStat(sdk.stats.Durability) * 100 / this.getStat(sdk.stats.MaxDurability));
    }
  },
});

/**
 * Open NPC menu
 * @this {NPCUnit}
 * @param {number} [addDelay] 
 * @returns {boolean}
 */
Unit.prototype.openMenu = function (addDelay) {
  if (this.type !== sdk.unittype.NPC) throw new Error("Unit.openMenu: Must be used on NPCs.");
  if (getUIFlag(sdk.uiflags.NPCMenu)) return true;

  addDelay === undefined && (addDelay = 0);
  const pingDelay = (me.gameReady ? me.ping : 125);

  for (let i = 0; i < 5; i += 1) {
    if (getDistance(me, this) > 4) {
      Pather.moveNearUnit(this, 4);
    }

    Config.PacketShopping
      ? Packet.entityInteract(this)
      : Misc.click(0, 0, this);
    let tick = getTickCount();

    while (getTickCount() - tick < 5000) {
      if (getUIFlag(sdk.uiflags.NPCMenu)) {
        delay(Math.max(700 + pingDelay, 500 + pingDelay * 2 + addDelay * 500));

        return true;
      }

      if ((getTickCount() - tick > 1000 && getInteractedNPC())
        || (getTickCount() - tick > 500 && getIsTalkingNPC())) {
        me.cancel();
        break;
      }

      delay(100);
    }

    new PacketBuilder()
      .byte(sdk.packets.send.NPCInit)
      .dword(1)
      .dword(this.gid)
      .send();
    delay(pingDelay * 2 + 1);
    Packet.cancelNPC(this);
    delay(pingDelay * 2 + 1);
    Packet.flash(me.gid);
  }

  return false;
};

/**
 * @this {NPCUnit}
 * @param {string} mode "Gamble", "Repair" or "Shop"
 * @returns {boolean}
 */
Unit.prototype.startTrade = function (mode) {
  if (Config.PacketShopping) return Packet.startTrade(this, mode);
  if (this.type !== sdk.unittype.NPC) throw new Error("Unit.startTrade: Must be used on NPCs.");
  console.log("Starting " + mode + " at " + this.name);
  if (getUIFlag(sdk.uiflags.Shop)) return true;

  const menuId = mode === "Gamble"
    ? sdk.menu.Gamble
    : mode === "Repair"
      ? sdk.menu.TradeRepair
      : sdk.menu.Trade;

  for (let i = 0; i < 3; i += 1) {
    // Incremental delay on retries
    if (this.openMenu(i)) {
      Misc.useMenu(menuId);

      let tick = getTickCount();

      while (getTickCount() - tick < 1000) {
        if (getUIFlag(sdk.uiflags.Shop) && this.itemcount > 0) {
          delay(200);
          console.log("Successfully started " + mode + " at " + this.name);

          return true;
        }

        delay(25);
      }

      me.cancel();
    }
  }

  return false;
};

/**
 * optionally repair all or a single item
 * @todo improve this, at the moment it's here as more of a proof of concept
 */
Unit.prototype.repairItem = function () {
  // lets check if we have and can afford to repair this item
  if (me.gold < this.getItemCost(2)) return false;
  let npc = getInteractedNPC();
  if (!npc || npc.name.toLowerCase() !== Town.tasks.get(me.act).Repair) return false;
  // if (!this.startTrade("Repair")) return false;
  let preDurability = this.getStat(sdk.stats.Durability);
  new PacketBuilder()
    .byte(0x35)
    .dword(npc.gid)
    .dword(this.gid)
    .dword(1/* 1 for single item | 0 for all*/)
    .dword(0)
    .send();
  return Misc.poll(() => this.getStat(sdk.stats.Durability) !== preDurability, 500, 50);
};

Unit.prototype.buy = function (shiftBuy, gamble) {
  if (Config.PacketShopping) return Packet.buyItem(this, shiftBuy, gamble);
  // Check if it's an item we want to buy
  if (this.type !== sdk.unittype.Item) throw new Error("Unit.buy: Must be used on items.");

  // Check if it's an item belonging to a NPC
  if (!getUIFlag(sdk.uiflags.Shop) || (this.getParent() && this.getParent().gid !== getInteractedNPC().gid)) {
    throw new Error("Unit.buy: Must be used in shops.");
  }

  // Can we afford the item?
  if (me.gold < this.getItemCost(sdk.items.cost.ToBuy)) return false;

  let oldGold = me.gold;
  let itemCount = me.itemcount;

  for (let i = 0; i < 3; i += 1) {
    this.shop(shiftBuy ? 6 : 2);

    let tick = getTickCount();

    while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
      if ((shiftBuy && me.gold < oldGold) || itemCount !== me.itemcount) {
        delay(500);

        return true;
      }

      delay(10);
    }
  }

  return false;
};

// You MUST use a delay after Unit.sell() if using custom scripts. delay(500) works best, dynamic delay is used when identifying/selling (500 - item id time)
Unit.prototype.sell = function () {
  if (Config.PacketShopping) return Packet.sellItem(this);

  // Check if it's an item we want to buy
  if (this.type !== sdk.unittype.Item) throw new Error("Unit.sell: Must be used on items.");
  if (!this.sellable) {
    console.error((new Error("Item is unsellable")));
    return false;
  }

  // Check if it's an item belonging to a NPC
  if (!getUIFlag(sdk.uiflags.Shop)) throw new Error("Unit.sell: Must be used in shops.");

  let itemCount = me.itemcount;

  for (let i = 0; i < 5; i += 1) {
    this.shop(1);

    let tick = getTickCount();

    while (getTickCount() - tick < 2000) {
      if (me.itemcount !== itemCount) {
        return true;
      }

      delay(10);
    }
  }

  return false;
};

/**
 * @this ItemUnit
 * @param {boolean} usePacket 
 */
Unit.prototype.toCursor = function (usePacket = false) {
  if (this.type !== sdk.unittype.Item) throw new Error("Unit.toCursor: Must be used with items.");
  if (me.itemoncursor && this.mode === sdk.items.mode.onCursor) return true;

  this.location === sdk.storage.Stash && Town.openStash();
  this.location === sdk.storage.Cube && Cubing.openCube();

  if (usePacket) return Packet.itemToCursor(this);

  for (let i = 0; i < 3; i += 1) {
    try {
      if (this.mode === sdk.items.mode.Equipped) {
        if (this.isOnSwap) {
          // fix crash when item is equipped on switch and we try to move it directly to cursor
          me.switchWeapons(sdk.player.slot.Secondary);
        }
        // fix for equipped items (cubing viper staff for example)
        clickItem(sdk.clicktypes.click.item.Left, this.bodylocation);
      } else {
        clickItem(sdk.clicktypes.click.item.Left, this);
      }
    } catch (e) {
      return false;
    }

    let tick = getTickCount();

    while (getTickCount() - tick < 1000) {
      if (me.itemoncursor) {
        delay(200);

        return true;
      }

      delay(10);
    }
  }

  return false;
};

Unit.prototype.drop = function () {
  if (this.type !== sdk.unittype.Item) {
    throw new Error("Unit.drop: Must be used with items. Unit Name: " + this.name);
  }
  if (!this.toCursor()) return false;

  let tick = getTickCount();
  let timeout = Math.max(1000, me.ping * 6);

  while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash) || !me.gameReady) {
    if (getTickCount() - tick > timeout) return false;

    if (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
      me.cancel(0);
    }

    delay(me.ping * 2 + 100);
  }

  for (let i = 0; i < 3; i += 1) {
    clickMap(0, 0, me.x, me.y);
    delay(40);
    clickMap(2, 0, me.x, me.y);

    tick = getTickCount();

    while (getTickCount() - tick < 500) {
      if (!me.itemoncursor) {
        delay(200);

        return true;
      }

      delay(10);
    }
  }

  return false;
};

/**
 * @description use consumable item, fixes issue with interact() returning false even if we used an item
 */
Unit.prototype.use = function () {
  if (this === undefined || !this.type) return false;
  if (this.type !== sdk.unittype.Item) throw new Error("Unit.use: Must be used with items. Unit Name: " + this.name);
  if (!getBaseStat("items", this.classid, "useable")) {
    throw new Error("Unit.use: Must be used with consumable items. Unit Name: " + this.name);
  }

  let gid = this.gid;
  let pingDelay = me.getPingDelay();
  let quantity = 0;
  let iType = this.itemType;
  let checkQuantity = false;

  if (me.mode === sdk.player.mode.SkillActionSequence) {
    while (me.mode === sdk.player.mode.SkillActionSequence) {
      delay (25);
    }
  }

  // make sure we don't have anything on cursor
  if (me.itemoncursor) {
    if (!Game.getCursorUnit().drop()) return false;
  }

  switch (this.location) {
  case sdk.storage.Stash:
  case sdk.storage.Inventory:
    if (this.isInStash && !Town.openStash()) return false;
    // doesn't work, not sure why but it's missing something 
    // new PacketBuilder().byte(sdk.packets.send.UseItem).dword(gid).dword(this.x).dword(this.y).send();
    checkQuantity = iType === sdk.items.type.Book;
    checkQuantity && (quantity = this.getStat(sdk.stats.Quantity));
    this.interact(); // use interact instead, was hoping to skip this since its really just doing the same thing over but oh well

    break;
  case sdk.storage.Belt:
    new PacketBuilder()
      .byte(sdk.packets.send.UseBeltItem)
      .dword(gid)
      .dword(0)
      .dword(0)
      .send();
    break;
  default:
    return false;
  }

  if (checkQuantity) {
    return Misc.poll(() => this.getStat(sdk.stats.Quantity) < quantity, 200 + pingDelay, 50);
  } else {
    return Misc.poll(() => !Game.getItem(-1, -1, gid), 200 + pingDelay, 50);
  }
};

/**
 * @typedef {Object} ItemInfo
 * @property {number} [classid]
 * @property {number} [itemtype]
 * @property {number} [quality]
 * @property {boolean} [runeword]
 * @property {boolean} [ethereal]
 * @property {boolean | number} [equipped]
 * @property {boolean} [basetype]
 * @property {string | number} [name]
 */

/**
 * @description Returns item given by itemInfo
 * @param {ItemInfo} itemInfo
 * @returns {ItemUnit[]}
 */
Unit.prototype.checkItem = function (itemInfo) {
  if (this === undefined || this.type > 1 || typeof itemInfo !== "object") {
    return { have: false, item: null };
  }

  const itemObj = Object.assign({}, {
    classid: -1,
    itemtype: -1,
    quality: -1,
    runeword: null,
    ethereal: null,
    equipped: null,
    basetype: null,
    name: ""
  }, itemInfo);

  // convert id into string
  typeof itemObj.name === "number" && (itemObj.name = getLocaleString(itemObj.name));

  let items = this.getItemsEx()
    .filter(function (item) {
      return (!item.questItem
        && (itemObj.classid === -1 || item.classid === itemObj.classid)
        && (itemObj.itemtype === -1 || item.itemType === itemObj.itemtype)
        && (itemObj.quality === -1 || item.quality === itemObj.quality)
        && (itemObj.runeword === null || (item.runeword === itemObj.runeword))
        && (itemObj.ethereal === null || (item.ethereal === itemObj.ethereal))
        && (itemObj.equipped === null || (
          typeof itemObj.equipped === "number"
            ? item.bodylocation === itemObj.equipped
            : item.isEquipped === itemObj.equipped)
        )
        && (itemObj.basetype === null || ((item.normal || item.superior) === itemObj.basetype))
        && (!itemObj.name || item.fname.toLowerCase().includes(itemObj.name.toLowerCase()))
      );
    });
  if (items.length > 0) {
    return {
      have: true,
      item: copyUnit(items.first())
    };
  } else {
    return {
      have: false,
      item: null
    };
  }
};

/**
 * @description Returns first item given by itemInfo
 * @param {ItemInfo} itemInfo
 * @returns {ItemUnit[]}
 */
Unit.prototype.findFirst = function (itemInfo = []) {
  if (this === undefined || this.type > 1) return { have: false, item: null };
  if (!Array.isArray(itemInfo) || typeof itemInfo[0] !== "object") return { have: false, item: null };
  let itemList = this.getItemsEx();

  for (let i = 0; i < itemInfo.length; i++) {
    const itemObj = Object.assign({}, {
      classid: -1,
      itemtype: -1,
      quality: -1,
      runeword: null,
      ethereal: null,
      equipped: null,
      name: ""
    }, itemInfo[i]);

    // convert id into string
    typeof itemObj.name === "number" && (itemObj.name = getLocaleString(itemObj.name));

    let items = itemList
      .filter(function (item) {
        return (!item.questItem
          && (itemObj.classid === -1 || item.classid === itemObj.classid)
          && (itemObj.itemtype === -1 || item.itemType === itemObj.itemtype)
          && (itemObj.quality === -1 || item.quality === itemObj.quality)
          && (itemObj.runeword === null || (item.runeword === itemObj.runeword))
          && (itemObj.ethereal === null || (item.ethereal === itemObj.ethereal))
          && (itemObj.equipped === null || (
            typeof itemObj.equipped === "number"
              ? item.bodylocation === itemObj.equipped
              : item.isEquipped === itemObj.equipped)
          )
          && (!itemObj.name || item.fname.toLowerCase().includes(itemObj.name.toLowerCase()))
        );
      });
    if (items.length > 0) {
      return {
        have: true,
        item: copyUnit(items.first())
      };
    }
  }

  return {
    have: false,
    item: null
  };
};

/**
 * @description Check if we have all the items given by itemInfo
 * @param {ItemInfo} itemInfo
 * @returns {boolean}
 */
Unit.prototype.haveAll = function (itemInfo = [], returnIfSome = false) {
  if (this === undefined || this.type > 1) return false;
  // if an object but not an array convert to array
  !Array.isArray(itemInfo) && typeof itemInfo === "object" && (itemInfo = [itemInfo]);
  if (!Array.isArray(itemInfo) || typeof itemInfo[0] !== "object") return false;
  let itemList = this.getItemsEx();
  let haveAll = false;
  let checkedGids = [];

  for (let i = 0; i < itemInfo.length; i++) {
    const itemObj = Object.assign({}, {
      classid: -1,
      itemtype: -1,
      quality: -1,
      runeword: null,
      ethereal: null,
      equipped: null,
      basetype: null,
      name: ""
    }, itemInfo[i]);

    // convert id into string
    typeof itemObj.name === "number" && (itemObj.name = getLocaleString(itemObj.name));

    let items = itemList
      .filter(function (item) {
        return (!item.questItem
          && (checkedGids.indexOf(item.gid) === -1)
          && (itemObj.classid === -1 || item.classid === itemObj.classid)
          && (itemObj.itemtype === -1 || item.itemType === itemObj.itemtype)
          && (itemObj.quality === -1 || item.quality === itemObj.quality)
          && (itemObj.runeword === null || (item.runeword === itemObj.runeword))
          && (itemObj.ethereal === null || (item.ethereal === itemObj.ethereal))
          && (itemObj.equipped === null || (
            typeof itemObj.equipped === "number"
              ? item.bodylocation === itemObj.equipped
              : item.isEquipped === itemObj.equipped)
          )
          && (itemObj.basetype === null || ((item.normal || item.superior) === itemObj.basetype))
          && (!itemObj.name.length || item.fname.toLowerCase().includes(itemObj.name.toLowerCase()))
        );
      });
    if (items.length > 0) {
      if (returnIfSome) return true;
      checkedGids.push(items.first().gid);
      haveAll = true;
    } else {
      if (returnIfSome) continue;
      return false;
    }
  }

  return haveAll;
};

/**
 * @description Check if we have some of the items given by itemInfo
 * @param {ItemInfo[]} itemInfo
 * @returns {boolean}
 */
Unit.prototype.haveSome = function (itemInfo = []) {
  return this.haveAll(itemInfo, true);
};

/**
 * @description Return the items of a player, or an empty array
 * @param args
 * @returns {ItemUnit[]}
 */
Unit.prototype.getItems = function (...args) {
  let items = [];
  let item = this.getItem.apply(this, args);

  if (item) {
    do {
      items.push(copyUnit(item));
    } while (item.getNext());
  }

  return Array.isArray(items) ? items : [];
};

Unit.prototype.getItemsEx = function (...args) {
  let items = [];
  let item = this.getItem.apply(this, args);

  if (item) {
    do {
      items.push(copyUnit(item));
    } while (item.getNext());
  }

  return items;
};

Unit.prototype.getPrefix = function (id) {
  switch (typeof id) {
  case "number":
    if (typeof this.prefixnums !== "object") return this.prefixnum === id;

    for (let i = 0; i < this.prefixnums.length; i += 1) {
      if (id === this.prefixnums[i]) {
        return true;
      }
    }

    break;
  case "string":
    if (typeof this.prefixes !== "object") {
      return this.prefix.replace(/\s+/g, "").toLowerCase() === id.replace(/\s+/g, "").toLowerCase();
    }

    for (let i = 0; i < this.prefixes.length; i += 1) {
      if (id.replace(/\s+/g, "").toLowerCase() === this.prefixes[i].replace(/\s+/g, "").toLowerCase()) {
        return true;
      }
    }

    break;
  }

  return false;
};

Unit.prototype.getSuffix = function (id) {
  switch (typeof id) {
  case "number":
    if (typeof this.suffixnums !== "object") return this.suffixnum === id;

    for (let i = 0; i < this.suffixnums.length; i += 1) {
      if (id === this.suffixnums[i]) {
        return true;
      }
    }

    break;
  case "string":
    if (typeof this.suffixes !== "object") {
      return this.suffix.replace(/\s+/g, "").toLowerCase() === id.replace(/\s+/g, "").toLowerCase();
    }

    for (let i = 0; i < this.suffixes.length; i += 1) {
      if (id.replace(/\s+/g, "").toLowerCase() === this.suffixes[i].replace(/\s+/g, "").toLowerCase()) {
        return true;
      }
    }

    break;
  }

  return false;
};

Unit.prototype.getStatEx = function (id, subid) {
  let temp, rval, regex;

  switch (id) {
  case sdk.stats.AllRes:
  // calculates all res, doesn't exist though
  // Block scope due to the variable declaration
  {
    // Get all res
    let allres = [
      this.getStatEx(sdk.stats.FireResist),
      this.getStatEx(sdk.stats.ColdResist),
      this.getStatEx(sdk.stats.LightningResist),
      this.getStatEx(sdk.stats.PoisonResist)
    ];

    // What is the minimum of the 4?
    let min = Math.min.apply(null, allres);

    // Cap all res to the minimum amount of res
    allres = allres.map(res => res > min ? min : res);

    // Get it in local variables, its more easy to read
    let [fire, cold, light, psn] = allres;

    return fire === cold && cold === light && light === psn ? min : 0;
  }
  case sdk.stats.ToBlock:
    switch (this.classid) {
    case sdk.items.Buckler:
      return this.getStat(sdk.stats.ToBlock);
    case sdk.items.PreservedHead:
    case sdk.items.MummifiedTrophy:
    case sdk.items.MinionSkull:
      return this.getStat(sdk.stats.ToBlock) - 3;
    case sdk.items.SmallShield:
    case sdk.items.ZombieHead:
    case sdk.items.FetishTrophy:
    case sdk.items.HellspawnSkull:
      return this.getStat(sdk.stats.ToBlock) - 5;
    case sdk.items.KiteShield:
    case sdk.items.UnravellerHead:
    case sdk.items.SextonTrophy:
    case sdk.items.OverseerSkull:
      return this.getStat(sdk.stats.ToBlock) - 8;
    case sdk.items.SpikedShield:
    case sdk.items.Defender:
    case sdk.items.GargoyleHead:
    case sdk.items.CantorTrophy:
    case sdk.items.SuccubusSkull:
    case sdk.items.Targe:
    case sdk.items.AkaranTarge:
      return this.getStat(sdk.stats.ToBlock) - 10;
    case sdk.items.LargeShield:
    case sdk.items.RoundShield:
    case sdk.items.DemonHead:
    case sdk.items.HierophantTrophy:
    case sdk.items.BloodlordSkull:
      return this.getStat(sdk.stats.ToBlock) - 12;
    case sdk.items.Scutum:
      return this.getStat(sdk.stats.ToBlock) - 14;
    case sdk.items.Rondache:
    case sdk.items.AkaranRondache:
      return this.getStat(sdk.stats.ToBlock) - 15;
    case sdk.items.GothicShield:
    case sdk.items.AncientShield:
      return this.getStat(sdk.stats.ToBlock) - 16;
    case sdk.items.BarbedShield:
      return this.getStat(sdk.stats.ToBlock) - 17;
    case sdk.items.DragonShield:
      return this.getStat(sdk.stats.ToBlock) - 18;
    case sdk.items.VortexShield:
      return this.getStat(sdk.stats.ToBlock) - 19;
    case sdk.items.BoneShield:
    case sdk.items.GrimShield:
    case sdk.items.Luna:
    case sdk.items.BladeBarrier:
    case sdk.items.TrollNest:
    case sdk.items.HeraldicShield:
    case sdk.items.ProtectorShield:
      return this.getStat(sdk.stats.ToBlock) - 20;
    case sdk.items.Heater:
    case sdk.items.Monarch:
    case sdk.items.AerinShield:
    case sdk.items.GildedShield:
    case sdk.items.ZakarumShield:
      return this.getStat(sdk.stats.ToBlock) - 22;
    case sdk.items.TowerShield:
    case sdk.items.Pavise:
    case sdk.items.Hyperion:
    case sdk.items.Aegis:
    case sdk.items.Ward:
      return this.getStat(sdk.stats.ToBlock) - 24;
    case sdk.items.CrownShield:
    case sdk.items.RoyalShield:
    case sdk.items.KurastShield:
      return this.getStat(sdk.stats.ToBlock) - 25;
    case sdk.items.SacredRondache:
      return this.getStat(sdk.stats.ToBlock) - 28;
    case sdk.items.SacredTarge:
      return this.getStat(sdk.stats.ToBlock) - 30;
    }

    break;
  case sdk.stats.MinDamage:
  case sdk.stats.MaxDamage:
    if (subid === 1) {
      temp = this.getStat(-1);
      rval = 0;

      for (let i = 0; i < temp.length; i += 1) {
        switch (temp[i][0]) {
        case id: // plus one handed dmg
        case id + 2: // plus two handed dmg
          // There are 2 occurrences of min/max if the item has +damage. Total damage is the sum of both.
          // First occurrence is +damage, second is base item damage.

          if (rval) { // First occurence stored, return if the second one exists
            return rval;
          }

          if (this.getStat(temp[i][0]) > 0 && this.getStat(temp[i][0]) > temp[i][2]) {
            rval = temp[i][2]; // Store the potential +dmg value
          }

          break;
        }
      }

      return 0;
    }

    break;
  case sdk.stats.Defense:
    if (subid === 0) {
      if ([0, 1].indexOf(this.mode) < 0) {
        break;
      }

      switch (this.itemType) {
      case sdk.items.type.Jewel:
      case sdk.items.type.SmallCharm:
      case sdk.items.type.LargeCharm:
      case sdk.items.type.GrandCharm:
        // defense is the same as plusdefense for these items
        return this.getStat(sdk.stats.Defense);
      }

      // can fail sometimes
      !this.desc && (this.desc = this.description);

      if (this.desc) {
        temp = this.desc.split("\n");
        regex = new RegExp("\\+\\d+ " + getLocaleString(sdk.locale.text.Defense).replace(/^\s+|\s+$/g, ""));

        for (let i = 0; i < temp.length; i += 1) {
          if (temp[i].match(regex, "i")) {
            return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
          }
        }
      }

      return 0;
    }

    break;
  case sdk.stats.PoisonMinDamage:
    if (subid === 1) {
      return Math.round(this.getStat(sdk.stats.PoisonMinDamage) * this.getStat(sdk.stats.PoisonLength) / 256);
    }

    break;
  case sdk.stats.AddClassSkills:
    if (subid === undefined) {
      for (let i = 0; i < 7; i += 1) {
        let cSkill = this.getStat(sdk.stats.AddClassSkills, i);
        if (cSkill) return cSkill;
      }

      return 0;
    }

    break;
  case sdk.stats.AddSkillTab:
    if (subid === undefined) {
      temp = Object.values(sdk.skills.tabs);

      for (let i = 0; i < temp.length; i += 1) {
        let sTab = this.getStat(sdk.stats.AddSkillTab, temp[i]);
        if (sTab) return sTab;
      }

      return 0;
    }

    break;
  case sdk.stats.SkillOnAttack:
  case sdk.stats.SkillOnKill:
  case sdk.stats.SkillOnDeath:
  case sdk.stats.SkillOnStrike:
  case sdk.stats.SkillOnLevelUp:
  case sdk.stats.SkillWhenStruck:
  case sdk.stats.ChargedSkill:
    if (subid === 1) {
      temp = this.getStat(-2);

      if (temp.hasOwnProperty(id)) {
        if (temp[id] instanceof Array) {
          for (let i = 0; i < temp[id].length; i += 1) {
            if (temp[id][i] !== undefined) {
              return temp[id][i].skill;
            }
          }
        } else {
          return temp[id].skill;
        }
      }

      return 0;
    }

    if (subid === 2) {
      temp = this.getStat(-2);

      if (temp.hasOwnProperty(id)) {
        if (temp[id] instanceof Array) {
          for (let i = 0; i < temp[id].length; i += 1) {
            if (temp[id][i] !== undefined) {
              return temp[id][i].level;
            }
          }
        } else {
          return temp[id].level;
        }
      }

      return 0;
    }

    break;
  case sdk.stats.PerLevelHp: // (for example Fortitude with hp per lvl can be defined now with 1.5)
    return this.getStat(sdk.stats.PerLevelHp) / 2048;
  }

  if (this.getFlag(sdk.items.flags.Runeword)) {
    switch (id) {
    case sdk.stats.ArmorPercent:
      if ([0, 1].indexOf(this.mode) < 0) {
        break;
      }

      !this.desc && (this.desc = this.description);

      if (this.desc) {
        temp = this.desc.split("\n");

        for (let i = 0; i < temp.length; i += 1) {
          if (temp[i].match(getLocaleString(sdk.locale.text.EnhancedDefense).replace(/^\s+|\s+$/g, ""), "i")) {
            return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
          }
        }
      }

      return 0;
    case sdk.stats.EnhancedDamage:
      if ([0, 1].indexOf(this.mode) < 0) {
        break;
      }

      !this.desc && (this.desc = this.description);

      if (this.desc) {
        temp = this.desc.split("\n");

        for (let i = 0; i < temp.length; i += 1) {
          if (temp[i].match(getLocaleString(sdk.locale.text.EnhancedDamage).replace(/^\s+|\s+$/g, ""), "i")) {
            return parseInt(temp[i].replace(/ÿc[0-9!"+<;.*]/, ""), 10);
          }
        }
      }

      return 0;
    }
  }

  return (subid === undefined ? this.getStat(id) : this.getStat(id, subid));
};

/*
  _NTIPAliasColor["black"] = 3;
  _NTIPAliasColor["lightblue"] = 4;
  _NTIPAliasColor["darkblue"] = 5;
  _NTIPAliasColor["crystalblue"] = 6;
  _NTIPAliasColor["lightred"] = 7;
  _NTIPAliasColor["darkred"] = 8;
  _NTIPAliasColor["crystalred"] = 9;
  _NTIPAliasColor["darkgreen"] = 11;
  _NTIPAliasColor["crystalgreen"] = 12;
  _NTIPAliasColor["lightyellow"] = 13;
  _NTIPAliasColor["darkyellow"] = 14;
  _NTIPAliasColor["lightgold"] = 15;
  _NTIPAliasColor["darkgold"] = 16;
  _NTIPAliasColor["lightpurple"] = 17;
  _NTIPAliasColor["orange"] = 19;
  _NTIPAliasColor["white"] = 20;
*/

Unit.prototype.getColor = function () {
  let colors;
  let Color = {
    black: 3,
    lightblue: 4,
    darkblue: 5,
    crystalblue: 6,
    lightred: 7,
    darkred: 8,
    crystalred: 9,
    darkgreen: 11,
    crystalgreen: 12,
    lightyellow: 13,
    darkyellow: 14,
    lightgold: 15,
    darkgold: 16,
    lightpurple: 17,
    orange: 19,
    white: 20
  };

  // check type
  switch (this.itemType) {
  case sdk.items.type.Shield:
  case sdk.items.type.Armor:
  case sdk.items.type.Boots:
  case sdk.items.type.Gloves:
  case sdk.items.type.Belt:
  case sdk.items.type.AuricShields:
  case sdk.items.type.VoodooHeads:
  case sdk.items.type.Helm:
  case sdk.items.type.PrimalHelm:
  case sdk.items.type.Circlet:
  case sdk.items.type.Pelt:
  case sdk.items.type.Scepter:
  case sdk.items.type.Wand:
  case sdk.items.type.Staff:
  case sdk.items.type.Bow:
  case sdk.items.type.Axe:
  case sdk.items.type.Club:
  case sdk.items.type.Sword:
  case sdk.items.type.Hammer:
  case sdk.items.type.Knife:
  case sdk.items.type.Spear:
  case sdk.items.type.Polearm:
  case sdk.items.type.Crossbow:
  case sdk.items.type.Mace:
  case sdk.items.type.ThrowingKnife:
  case sdk.items.type.ThrowingAxe:
  case sdk.items.type.Javelin:
  case sdk.items.type.Orb:
  case sdk.items.type.AmazonBow:
  case sdk.items.type.AmazonSpear:
  case sdk.items.type.AmazonJavelin:
  case sdk.items.type.MissilePotion:
  case sdk.items.type.HandtoHand:
  case sdk.items.type.AssassinClaw:
    break;
  default:
    return -1;
  }

  // check quality
  if ([sdk.items.quality.Magic, sdk.items.quality.Set, sdk.items.quality.Rare, sdk.items.quality.Unique]
    .indexOf(this.quality) === -1) {
    return -1;
  }

  if (this.quality === sdk.items.quality.Magic || this.quality === sdk.items.quality.Rare) {
    colors = {
      "Screaming": Color.orange,
      "Howling": Color.orange,
      "Wailing": Color.orange,
      "Sapphire": Color.lightblue,
      "Snowy": Color.lightblue,
      "Shivering": Color.lightblue,
      "Boreal": Color.lightblue,
      "Hibernal": Color.lightblue,
      "Ruby": Color.lightred,
      "Amber": Color.lightyellow,
      "Static": Color.lightyellow,
      "Glowing": Color.lightyellow,
      "Buzzing": Color.lightyellow,
      "Arcing": Color.lightyellow,
      "Shocking": Color.lightyellow,
      "Emerald": Color.crystalgreen,
      "Saintly": Color.darkgold,
      "Holy": Color.darkgold,
      "Godly": Color.darkgold,
      "Visionary": Color.white,
      "Mnemonic": Color.crystalblue,
      "Bowyer's": Color.lightgold,
      "Gymnastic": Color.lightgold,
      "Spearmaiden's": Color.lightgold,
      "Archer's": Color.lightgold,
      "Athlete's": Color.lightgold,
      "Lancer's": Color.lightgold,
      "Charged": Color.lightgold,
      "Blazing": Color.lightgold,
      "Freezing": Color.lightgold,
      "Glacial": Color.lightgold,
      "Powered": Color.lightgold,
      "Volcanic": Color.lightgold,
      "Blighting": Color.lightgold,
      "Noxious": Color.lightgold,
      "Mojo": Color.lightgold,
      "Cursing": Color.lightgold,
      "Venomous": Color.lightgold,
      "Golemlord's": Color.lightgold,
      "Warden's": Color.lightgold,
      "Hawk Branded": Color.lightgold,
      "Commander's": Color.lightgold,
      "Marshal's": Color.lightgold,
      "Rose Branded": Color.lightgold,
      "Guardian's": Color.lightgold,
      "Veteran's": Color.lightgold,
      "Resonant": Color.lightgold,
      "Raging": Color.lightgold,
      "Echoing": Color.lightgold,
      "Furious": Color.lightgold,
      "Master's": Color.lightgold, // there's 2x masters...
      "Caretaker's": Color.lightgold,
      "Terrene": Color.lightgold,
      "Feral": Color.lightgold,
      "Gaean": Color.lightgold,
      "Communal": Color.lightgold,
      "Keeper's": Color.lightgold,
      "Sensei's": Color.lightgold,
      "Trickster's": Color.lightgold,
      "Psychic": Color.lightgold,
      "Kenshi's": Color.lightgold,
      "Cunning": Color.lightgold,
      "Shadow": Color.lightgold,
      "Faithful": Color.white,
      "Priest's": Color.crystalgreen,
      "Dragon's": Color.crystalblue,
      "Vulpine": Color.crystalblue,
      "Shimmering": Color.lightpurple,
      "Rainbow": Color.lightpurple,
      "Scintillating": Color.lightpurple,
      "Prismatic": Color.lightpurple,
      "Chromatic": Color.lightpurple,
      "Hierophant's": Color.crystalgreen,
      "Berserker's": Color.crystalgreen,
      "Necromancer's": Color.crystalgreen,
      "Witch-hunter's": Color.crystalgreen,
      "Arch-Angel's": Color.crystalgreen,
      "Valkyrie's": Color.crystalgreen,
      "Massive": Color.darkgold,
      "Savage": Color.darkgold,
      "Merciless": Color.darkgold,
      "Ferocious": Color.black,
      "Grinding": Color.white,
      "Cruel": Color.black,
      "Gold": Color.lightgold,
      "Platinum": Color.lightgold,
      "Meteoric": Color.lightgold,
      "Strange": Color.lightgold,
      "Weird": Color.lightgold,
      "Knight's": Color.darkgold,
      "Lord's": Color.darkgold,
      "Fool's": Color.white,
      "King's": Color.darkgold,
      //"Master's": Color.darkgold,
      "Elysian": Color.darkgold,
      "Fiery": Color.darkred,
      "Smoldering": Color.darkred,
      "Smoking": Color.darkred,
      "Flaming": Color.darkred,
      "Condensing": Color.darkred,
      "Septic": Color.darkgreen,
      "Foul": Color.darkgreen,
      "Corrosive": Color.darkgreen,
      "Toxic": Color.darkgreen,
      "Pestilent": Color.darkgreen,
      "of Quickness": Color.darkyellow,
      "of the Glacier": Color.darkblue,
      "of Winter": Color.darkblue,
      "of Burning": Color.darkred,
      "of Incineration": Color.darkred,
      "of Thunder": Color.darkyellow,
      "of Storms": Color.darkyellow,
      "of Carnage": Color.black,
      "of Slaughter": Color.black,
      "of Butchery": Color.black,
      "of Evisceration": Color.black,
      "of Performance": Color.black,
      "of Transcendence": Color.black,
      "of Pestilence": Color.darkgreen,
      "of Anthrax": Color.darkgreen,
      "of the Locust": Color.crystalred,
      "of the Lamprey": Color.crystalred,
      "of the Wraith": Color.crystalred,
      "of the Vampire": Color.crystalred,
      "of Icebolt": Color.lightblue,
      "of Nova": Color.crystalblue,
      "of the Mammoth": Color.crystalred,
      "of Frost Shield": Color.lightblue,
      "of Nova Shield": Color.crystalblue,
      "of Wealth": Color.lightgold,
      "of Fortune": Color.lightgold,
      "of Luck": Color.lightgold,
      "of Perfection": Color.darkgold,
      "of Regrowth": Color.crystalred,
      "of Spikes": Color.orange,
      "of Razors": Color.orange,
      "of Swords": Color.orange,
      "of Stability": Color.darkyellow,
      "of the Colosuss": Color.crystalred,
      "of the Squid": Color.crystalred,
      "of the Whale": Color.crystalred,
      "of Defiance": Color.darkred,
      "of the Titan": Color.darkgold,
      "of Atlas": Color.darkgold,
      "of Wizardry": Color.darkgold
    };

    switch (this.itemType) {
    case sdk.items.type.Boots:
      colors["of Precision"] = Color.darkgold;

      break;
    case sdk.items.type.Gloves:
      colors["of Alacrity"] = Color.darkyellow;
      colors["of the Leech"] = Color.crystalred;
      colors["of the Bat"] = Color.crystalred;
      colors["of the Giant"] = Color.darkgold;

      break;
    }
  } else if (this.set) {
    if (this.identified) {
      for (let i = 0; i < 127; i += 1) {
        if (this.fname.split("\n").reverse()[0].includes(getLocaleString(getBaseStat(16, i, 3)))) {
          return getBaseStat(16, i, 12) > 20 ? -1 : getBaseStat(16, i, 12);
        }
      }
    } else {
      return Color.lightyellow; // Unidentified set item
    }
  } else if (this.unique) {
    for (let i = 0; i < 401; i += 1) {
      if (this.code === getBaseStat(17, i, 4).replace(/^\s+|\s+$/g, "")
        && this.fname.split("\n").reverse()[0].includes(getLocaleString(getBaseStat(17, i, 2)))) {
        return getBaseStat(17, i, 13) > 20 ? -1 : getBaseStat(17, i, 13);
      }
    }
  }

  for (let i = 0; i < this.suffixes.length; i += 1) {
    if (colors.hasOwnProperty(this.suffixes[i])) {
      return colors[this.suffixes[i]];
    }
  }

  for (let i = 0; i < this.prefixes.length; i += 1) {
    if (colors.hasOwnProperty(this.prefixes[i])) {
      return colors[this.prefixes[i]];
    }
  }

  return -1;
};

/**
 * @description Used upon item units like ArachnidMesh.castChargedSkill([skillId])
 * or directly on the "me" unit me.castChargedSkill(278);
 * @param {number} skillId
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 * @throws Error
 */
Unit.prototype.castChargedSkill = function (...args) {
  let skillId, x, y;
  /** @type {Monster} */
  let unit;
  /** @type {ItemUnit} */
  let chargedItem;
  /** @type {Charge} */
  let charge;
  /** @param {Charge} itemCharge */
  let validCharge = function (itemCharge) {
    return itemCharge.skill === skillId && itemCharge.charges;
  };

  switch (args.length) {
  case 0: // item.castChargedSkill()
    break;
  case 1:
    if (args[0] instanceof Unit) { // hellfire.castChargedSkill(monster);
      unit = args[0];
    } else {
      skillId = args[0];
    }

    break;
  case 2:
    if (typeof args[0] === "number") {
      if (args[1] instanceof Unit) { // me.castChargedSkill(skillId,unit)
        [skillId, unit] = [...args];
      } else if (typeof args[1] === "number") { // item.castChargedSkill(x,y)
        [x, y] = [...args];
      }
    } else {
      throw new Error(" invalid arguments, expected (skillId, unit) or (x, y)");
    }

    break;
  case 3:
    // If all arguments are numbers
    if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number") {
      [skillId, x, y] = [...args];
    }

    break;
  default:
    throw new Error("invalid arguments, expected 'me' object or 'item' unit");
  }

  // Charged skills can only be casted on x, y coordinates
  unit && ([x, y] = [unit.x, unit.y]);

  if (this !== me && this.type !== sdk.unittype.Item) {
    throw Error("invalid arguments, expected 'me' object or 'item' unit");
  }

  // Called the function the unit, me.
  if (this === me) {
    if (!skillId) throw Error("Must supply skillId on me.castChargedSkill");
    if (!Skill.charges.length || !Skill.charges.some(validCharge)) {
      // only rebuild list if we are unsure if we have the skill
      Skill.getCharges();
    }
    if (!Skill.charges.length) return false;
    let chargedItems = Skill.charges.filter(validCharge);

    if (chargedItems.length === 0) {
      throw Error("Don't have the charged skill (" + skillId + "), or not enough charges");
    }

    chargedItem = chargedItems
      .sort(function (a, b) {
        return b.charge.level - a.charge.level;
      }).first().unit;
    return chargedItem.castChargedSkill.apply(chargedItem, args);
  } else if (this.type === sdk.unittype.Item) {
    charge = this.getStat(-2)[sdk.stats.ChargedSkill]; // WARNING. Somehow this gives duplicates

    if (!charge) throw Error("No charged skill on this item");

    if (skillId) {
      // Filter out all other charged skills
      charge = charge.filter(item => (skillId && item.skill === skillId) && !!item.charges);
    } else if (charge.length > 1) {
      throw new Error("multiple charges on this item without a given skillId");
    }

    charge = charge.first();

    if (charge) {
      // Setting skill on hand
      if (!Config.PacketCasting || Config.PacketCasting === 1 && skillId !== sdk.skills.Teleport) {
        // Non packet casting
        return Skill.cast(skillId, sdk.skills.hand.Right, x || me.x, y || me.y, this);
      }

      // Packet casting
      // Setting skill on hand
      new PacketBuilder()
        .byte(sdk.packets.send.SelectSkill)
        .word(charge.skill)
        .byte(0x00)
        .byte(0x00)
        .dword(this.gid)
        .send();
      // No need for a delay, since its TCP, the server recv's the next statement always after the send cast skill packet
      // Cast the skill
      new PacketBuilder()
        .byte(sdk.packets.send.RightSkillOnLocation)
        .word(x || me.x)
        .word(y || me.y)
        .send();
      // The result of "successfully" casted is different, so we cant wait for it here. We have to assume it worked

      return true;
    }
  }

  return false;
};

/**
 * @this {ItemUnit}
 * @description equip an item.
 * @param {number | number[]} [destLocation]
 */
Unit.prototype.equip = function (destLocation) {
  if (this.isEquipped) return true; // Item already equiped
  /** @type {ItemUnit} */
  const _self = this;

  /** @param {ItemUnit} */
  const findspot = function (item) {
    let tempspot = Storage.Stash.FindSpot(item);

    if (getUIFlag(sdk.uiflags.Stash) && tempspot) {
      return { location: Storage.Stash.location, coord: tempspot };
    }

    tempspot = Storage.Inventory.FindSpot(item);

    return tempspot ? { location: Storage.Inventory.location, coord: tempspot } : false;
  };

  // Not an item, or unidentified, or not enough stats
  if (_self.type !== sdk.unittype.Item || !_self.identified
    || _self.lvlreq > me.getStat(sdk.stats.Level)
    || _self.dexreq > me.getStat(sdk.stats.Dexterity)
    || _self.strreq > me.getStat(sdk.stats.Strength)) {
    return false;
  }

  // If not a specific location is given, figure it out (can be useful to equip a double weapon)
  !destLocation && (destLocation = _self.getBodyLoc());
  // If destLocation isnt an array, make it one
  !Array.isArray(destLocation) && (destLocation = [destLocation]);

  console.log("equiping " + _self.prettyPrint + " to bodylocation: " + destLocation.first());

  let currentEquiped = me.getItemsEx(-1)
    .filter(function (item) {
      return (destLocation.includes(item.bodylocation)
        || ( item.isOnMain// Deal with double handed weapons
          && [sdk.body.RightArm, sdk.body.LeftArm].indexOf(destLocation) // in case destination is on the weapon/shield slot
          && (item.strictlyTwoHanded || _self.strictlyTwoHanded) // one of the items is strictly two handed
        )
      );
    }).sort(function (a, b) {
      return b - a;
    }); // shields first

  // if nothing is equipped at the moment, just equip it
  if (!currentEquiped.length) {
    clickItemAndWait(sdk.clicktypes.click.item.Left, this);
    clickItemAndWait(sdk.clicktypes.click.item.Left, destLocation.first());
  } else {
    // unequip / swap items
    currentEquiped.forEach(function (item, index) {
      // Last item, so swap instead of putting off first
      if (index === (currentEquiped.length - 1)) {
        console.log("swap " + _self.name + " for " + item.name);
        let oldLoc = { x: _self.x, y: _self.y, location: _self.location };
        clickItemAndWait(sdk.clicktypes.click.item.Left, _self); // Pick up current item
        clickItemAndWait(sdk.clicktypes.click.item.Left, destLocation.first()); // the swap of items
        // Find a spot for the current item
        let	spot = findspot(item);

        if (!spot) { // If no spot is found for the item, rollback
          clickItemAndWait(sdk.clicktypes.click.item.Left, destLocation.first()); // swap again
          clickItemAndWait(sdk.clicktypes.click.item.Left, oldLoc.x, oldLoc.y, oldLoc.location); // put item back on old spot
          throw Error("cant find spot for unequipped item");
        }

        clickItemAndWait(sdk.clicktypes.click.item.Left, spot.coord.y, spot.coord.x, spot.location); // put item on the found spot

        return;
      }

      console.log("Unequip item first " + item.name);
      // Incase multiple items are equipped
      let spot = findspot(item); // Find a spot for the current item

      if (!spot) throw Error("cant find spot for unequipped item");

      clickItemAndWait(sdk.clicktypes.click.item.Left, item.bodylocation);
      clickItemAndWait(sdk.clicktypes.click.item.Left, spot.coord.x, spot.coord.y, spot.location);
    });
  }

  return {
    success: this.bodylocation === destLocation.first(),
    unequiped: currentEquiped,
    rollback: () => currentEquiped.forEach(item => item.equip()) // Note; rollback only works if you had other items equipped before.
  };
};

/**
 * @this {ItemUnit}
 * @returns {number[]}
 */
Unit.prototype.getBodyLoc = function () {
  const _types = new Map([
    [sdk.body.Head, [sdk.items.type.Helm, sdk.items.type.Pelt, sdk.items.type.PrimalHelm]],
    [sdk.body.Neck, [sdk.items.type.Amulet]],
    [sdk.body.Armor, [sdk.items.type.Armor]],
    [sdk.body.RightArm, [
      sdk.items.type.Scepter, sdk.items.type.Wand, sdk.items.type.Staff, sdk.items.type.Bow,
      sdk.items.type.Axe, sdk.items.type.Club, sdk.items.type.Sword, sdk.items.type.Hammer,
      sdk.items.type.Knife, sdk.items.type.Spear, sdk.items.type.Polearm, sdk.items.type.Crossbow,
      sdk.items.type.Mace, sdk.items.type.Javelin, sdk.items.type.ThrowingKnife, sdk.items.type.ThrowingAxe,
      sdk.items.type.MissilePotion, sdk.items.type.Javelin, sdk.items.type.Orb,
      sdk.items.type.HandtoHand, sdk.items.type.AmazonBow,
      sdk.items.type.AmazonSpear
    ]], // right arm
    [sdk.body.LeftArm, [
      sdk.items.type.Shield, sdk.items.type.BowQuiver,
      sdk.items.type.CrossbowQuiver, sdk.items.type.AuricShields, sdk.items.type.VoodooHeads
    ]], // left arm
    [sdk.body.RingRight, [sdk.items.type.Ring]],
    [sdk.body.RingLeft, [sdk.items.type.Ring]],
    [sdk.body.Belt, [sdk.items.type.Belt]],
    [sdk.body.Feet, [sdk.items.type.Boots]],
    [sdk.body.Gloves, [sdk.items.type.Gloves]],
  ]);
  let bodyLoc = [];
  
  for (let [key, value] of _types) {
    if (value.includes(this.itemType)) {
      bodyLoc.push(key);
    }
  }

  return bodyLoc;
};

Unit.prototype.getRes = function (type, difficulty) {
  if (!type) return -1;
  if (![
    sdk.stats.FireResist, sdk.stats.ColdResist,
    sdk.stats.PoisonResist, sdk.stats.LightningResist
  ].includes(type)) {
    return -1;
  }
  
  difficulty === undefined || difficulty < 0 && (difficulty = 0);
  difficulty > 2 && (difficulty = 2);

  let modifier = me.classic
    ? [0, 20, 50][difficulty]
    : [0, 40, 100][difficulty];
  if (this === me) {
    switch (type) {
    case sdk.stats.FireResist:
      me.getState(sdk.states.ShrineResFire) && (modifier += 75);

      break;
    case sdk.stats.ColdResist:
      me.getState(sdk.states.ShrineResCold) && (modifier += 75);
      me.getState(sdk.states.Thawing) && (modifier += 50);

      break;
    case sdk.stats.LightningResist:
      me.getState(sdk.states.ShrineResLighting) && (modifier += 75);

      break;
    case sdk.stats.PoisonResist:
      me.getState(sdk.states.ShrineResPoison) && (modifier += 75);
      me.getState(sdk.states.Antidote) && (modifier += 50);

      break;
    }
  }
  return this.getStat(type) - modifier;
};

{
  let coords = function () {
    if (Array.isArray(this) && this.length > 1) {
      return [this[0], this[1]];
    }

    if (typeof this.x !== "undefined" && typeof this.y !== "undefined") {
      return this instanceof PresetUnit && [this.roomx * 5 + this.x, this.roomy * 5 + this.y] || [this.x, this.y];
    }

    return [undefined, undefined];
  };

  Object.defineProperties(Object.prototype, {
    distance: {
      get: function () {
        return !me.gameReady ? NaN : /* Math.round */(getDistance.apply(null, [me, ...coords.apply(this)]));
      },
      enumerable: false,
    },
  });

  Object.defineProperty(Object.prototype, "mobCount", {
    writable: true,
    enumerable: false,
    configurable: true,
    value: function (givenSettings = {}) {
      let [x, y] = coords.apply(this);
      const settings = Object.assign({}, {
        range: 5,
        coll: (
          sdk.collision.BlockWall | sdk.collision.ClosedDoor | sdk.collision.LineOfSight | sdk.collision.BlockMissile
        ),
        type: 0,
        ignoreClassids: [],
      }, givenSettings);
      return getUnits(sdk.unittype.Monster)
        .filter(function (mon) {
          return mon.attackable && getDistance(x, y, mon.x, mon.y) < settings.range
            && (!settings.type || (settings.type & mon.spectype))
            && (settings.ignoreClassids.indexOf(mon.classid) === -1)
            && !CollMap.checkColl({ x: x, y: y }, mon, settings.coll, 1);
        }).length;
    }
  });
}

Unit.prototype.hasEnchant = function (...enchants) {
  if (!this.isMonster) return false;
  for (let enchant of enchants) {
    if (this.getEnchant(enchant)) return true;
  }
  return false;
};

Unit.prototype.usingShield = function () {
  if (this.type > sdk.unittype.Monster) return false;
  // always switch to main hand if we are checking ourselves
  if (this === me && me.weaponswitch !== sdk.player.slot.Main) {
    me.switchWeapons(sdk.player.slot.Main);
  }
  return this.getItemsEx(-1, sdk.items.mode.Equipped)
    .filter(function (el) {
      return el.isShield;
    })
    .first();
};

// something in here is causing demon imps in barricade towers to be skipped - todo: figure out what
Unit.prototype.__defineGetter__("attackable", function () {
  if (this === undefined || !copyUnit(this).x) return false;
  if (this.type > sdk.unittype.Monster) return false;
  // must be in same area
  if (this.area !== me.area) return false;
  // player and they are hostile
  if (this.type === sdk.unittype.Player && getPlayerFlag(me.gid, this.gid, 8) && !this.dead) return true;
  // Dead monster
  if (this.hp === 0 || this.mode === sdk.monsters.mode.Death || this.mode === sdk.monsters.mode.Dead) return false;
  // Friendly monster/NPC
  if (this.getStat(sdk.stats.Alignment) === 2) return false;
  // catapults were returning a level of 0 and hanging up clear scripts
  if (this.charlvl < 1) return false;
  // neverCount base stat - hydras, traps etc.
  if (!this.isMonsterObject && getBaseStat("monstats", this.classid, "neverCount")) {
    return false;
  }
  // Monsters that are in flight
  if ([
    sdk.monsters.CarrionBird1, sdk.monsters.UndeadScavenger, sdk.monsters.HellBuzzard,
    sdk.monsters.WingedNightmare, sdk.monsters.SoulKiller2/*feel like this one is wrong*/,
    sdk.monsters.CarrionBird2].includes(this.classid) && this.mode === sdk.monsters.mode.UsingSkill1) {
    return false;
  }
  // Monsters that are Burrowed/Submerged
  if ([
    sdk.monsters.SandMaggot, sdk.monsters.RockWorm, sdk.monsters.Devourer,
    sdk.monsters.GiantLamprey, sdk.monsters.WorldKiller2,
    sdk.monsters.WaterWatcherLimb, sdk.monsters.RiverStalkerLimb, sdk.monsters.StygianWatcherLimb,
    sdk.monsters.WaterWatcherHead, sdk.monsters.RiverStalkerHead, sdk.monsters.StygianWatcherHead
  ].includes(this.classid) && this.mode === sdk.monsters.mode.Spawning) {
    return false;
  }

  return [sdk.monsters.ThroneBaal, sdk.monsters.Cow/*an evil force*/].indexOf(this.classid) === -1;
});

Object.defineProperty(Unit.prototype, "curseable", {
  /** @this {Player | Monster} */
  get: function () {
    // must be player or monster
    if (this === undefined || !copyUnit(this).x || this.type > 1) return false;
    // Dead monster
    if (this.hp === 0 || this.mode === sdk.monsters.mode.Death || this.mode === sdk.monsters.mode.Dead) return false;
    // attract can't be overridden
    if (this.getState(sdk.states.Attract)) return false;
    // "Possessed"
    if (!!this.name && !!this.name.includes(getLocaleString(sdk.locale.text.Possessed))) return false;
    if (this.type === sdk.unittype.Player && getPlayerFlag(me.gid, this.gid, 8) && !this.dead) return true;
    // Friendly monster/NPC
    if (this.getStat(sdk.stats.Alignment) === 2) return false;
    // catapults were returning a level of 0 and hanging up clear scripts
    if (this.charlvl < 1) return false;
    // Monsters that are in flight
    if ([
      sdk.monsters.CarrionBird1, sdk.monsters.UndeadScavenger, sdk.monsters.HellBuzzard,
      sdk.monsters.WingedNightmare, sdk.monsters.SoulKiller2/*feel like this one is wrong*/,
      sdk.monsters.CarrionBird2].includes(this.classid) && this.mode === sdk.monsters.mode.UsingSkill1) {
      return false;
    }
    // Monsters that are Burrowed/Submerged
    if ([
      sdk.monsters.SandMaggot, sdk.monsters.RockWorm, sdk.monsters.Devourer,
      sdk.monsters.GiantLamprey, sdk.monsters.WorldKiller2,
      sdk.monsters.WaterWatcherLimb, sdk.monsters.RiverStalkerLimb, sdk.monsters.StygianWatcherLimb,
      sdk.monsters.WaterWatcherHead, sdk.monsters.RiverStalkerHead, sdk.monsters.StygianWatcherHead
    ].includes(this.classid) && this.mode === sdk.monsters.mode.Spawning) {
      return false;
    }

    return (!this.isMonsterObject && !this.isMonsterEgg && !this.isMonsterNest && !this.isBaalTentacle && [
      sdk.monsters.WaterWatcherLimb, sdk.monsters.WaterWatcherHead,
      sdk.monsters.Flavie, sdk.monsters.ThroneBaal, sdk.monsters.Cow
    ].indexOf(this.classid) === -1);
  }
});

Unit.prototype.__defineGetter__("scareable", function () {
  return this.curseable && !(this.isSpecial) && this.classid !== sdk.monsters.ListerTheTormenter;
});

Unit.prototype.getMobCount = function (range = 10, coll = 0, type = 0, noSpecialMobs = false) {
  if (this === undefined) return 0;
  const _this = this;
  return getUnits(sdk.unittype.Monster)
    .filter(function (mon) {
      return mon.attackable && getDistance(_this, mon) < range
        && (!type || ((type & mon.spectype) && !noSpecialMobs))
        && (!coll || !checkCollision(_this, mon, coll));
    }).length;
};

Unit.prototype.checkForMobs = function (givenSettings = {}) {
  if (this === undefined) return 0;
  const _this = this;
  const settings = Object.assign({
    range: 10,
    count: 1,
    coll: 0,
    spectype: sdk.monsters.spectype.All
  }, givenSettings);
  let mob = Game.getMonster();
  let count = 0;
  if (mob) {
    do {
      if (getDistance(_this, mob) < settings.range && mob.attackable
        && (!settings.spectype || ((settings.spectype & mob.spectype)))
        && (!settings.coll || !checkCollision(_this, mob, settings.coll))) {
        count++;
      }
      if (count >= settings.count) {
        return true;
      }
    } while (mob.getNext());
  }
  return false;
};

/**
 * @description check if unit is in an area
 * @param {number} area
 * @returns {boolean} if unit is in specified area
 */
Unit.prototype.inArea = function (area = 0) {
  if (this === undefined) return false;
  return this.area === area;
};

// should this be broken into two functions for item vs unit (player, monster, ect)
/**
 * @description check if unit is a certain unit by classid
 * @param {number} classid
 * @returns {boolean} if unit matches the specified classid
 */
Unit.prototype.isUnit = function (classid = -1) {
  if (this === undefined) return false;
  return this.classid === classid;
};

Object.defineProperty(Object.prototype, "has", {
  writable: true,
  enumerable: false,
  configurable: true,
  value: function (...args) {
    if (this === undefined) return undefined;
    return this[args[0]] !== undefined
      ? typeof this[args[0]] === "function"
        ? this[args[0]].apply(this, ([...args].slice(1)))
        : this[args[0]]
      : {};
  }
});

PresetUnit.prototype.realCoords = function () {
  return {
    id: this.id,
    area: this.level, // for some reason, preset units names the area "level"
    x: this.roomx * 5 + this.x,
    y: this.roomy * 5 + this.y,
  };
};

Unit.prototype.openUnit = function () {
  if (this === undefined) return false;
  if (this.type !== sdk.unittype.Object && this.type !== sdk.unittype.Stairs) {
    return false;
  }
  if (this.mode !== sdk.objects.mode.Inactive) return true;

  for (let i = 0; i < 3; i += 1) {
    let usetk = (i < 2 && Skill.useTK(this));
    
    if (this.distance > 5) {
      Pather.moveNearUnit(this, (usetk ? 20 : 5) - i);
    }

    delay(300);
    // try to activate it once
    if (usetk && i === 0 && this.distance < 21) {
      Packet.telekinesis(this);
    } else {
      Packet.entityInteract(this);
    }

    const _self = this;
    if (Misc.poll(function () {
      return _self.mode !== sdk.objects.mode.Inactive;
    }, 2000, 60)) {
      delay(100);

      return true;
    }

    let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
    !!coord && Pather.moveTo(coord.x, coord.y);
  }

  return false;
};

Unit.prototype.useUnit = function (targetArea) {
  if (this === undefined) return false;
  if (this.type !== sdk.unittype.Object && this.type !== sdk.unittype.Stairs) {
    return false;
  }
  const preArea = me.area;

  MainLoop:
  for (let i = 0; i < 5; i += 1) {
    let usetk = (i < 2 && Skill.useTK(this));
    
    if (this.distance > 5) {
      Pather.moveNearUnit(this, (usetk ? 20 : 5));
      // try to activate it once
      if (usetk && i === 0 && this.mode === sdk.objects.mode.Inactive && this.distance < 21) {
        Packet.telekinesis(this);
      }
    }

    if (this.type === sdk.unittype.Object && this.mode === sdk.objects.mode.Inactive) {
      if (me.inArea(sdk.areas.Travincal) && targetArea === sdk.areas.DuranceofHateLvl1) {
        if (!me.blackendTemple) {
          throw new Error("useUnit: Incomplete quest. TargetArea: " + getAreaName(targetArea));
        }
      } else if (me.inArea(sdk.areas.ArreatSummit) && targetArea === sdk.areas.WorldstoneLvl1) {
        if (!me.ancients) {
          throw new Error("useUnit: Incomplete quest. TargetArea: " + getAreaName(targetArea));
        }
      }

      me.inArea(sdk.areas.A3SewersLvl1)
        ? Pather.openUnit(sdk.unittype.Object, sdk.objects.SewerLever)
        : this.openUnit();
    }

    if (this.type === sdk.unittype.Object
      && this.classid === sdk.objects.RedPortalToAct4
      && me.inArea(sdk.areas.DuranceofHateLvl3)
      && targetArea === sdk.areas.PandemoniumFortress
      && me.getQuest(sdk.quest.id.TheGuardian, sdk.quest.states.Completed) !== 1) {
      throw new Error("useUnit: Incomplete quest. TargetArea: " + getAreaName(targetArea));
    }

    delay(300);
    this.type === sdk.unittype.Stairs
      ? Misc.click(0, 0, this)
      : usetk && this.distance > 5
        ? Packet.telekinesis(this)
        : Packet.entityInteract(this);
    delay(300);

    let tick = getTickCount();

    while (getTickCount() - tick < 3000) {
      if ((!targetArea && me.area !== preArea) || me.area === targetArea) {
        delay(200);

        break MainLoop;
      }

      delay(10);
    }

    i > 2 && Packet.flash(me.gid);
    let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
    !!coord && Pather.moveTo(coord.x, coord.y);
  }

  while (!me.idle && !me.gameReady) {
    delay(40);
  }

  return targetArea ? me.area === targetArea : me.area !== preArea;
};
