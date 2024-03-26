/**
*  @filename    MonsterData.js
*  @author      Nishimura-Katsuo
*  @desc        monster data library
*
*/

(function (module, require) {
  const LocaleStringName = require("./LocaleStringID").LocaleStringName;
  const MONSTER_INDEX_COUNT = 770;
  /**
   *  @typedef MonsterDataObj
   *  @type {object}
   *  @property {number} Index = Index of this monster
   *  @property {number} ClassID = classid of this monster
   *  @property {number} Type = Type of monster
   *  @property {number} Level = Level of this monster in normal (use GameData.monsterLevel to find monster levels)
   *  @property {boolean} Ranged = if monster is ranged
   *  @property {number} Rarity = weight of this monster in level generation
   *  @property {number} Threat = threat level used by mercs
   *  @property {number} Align = alignment of unit (determines what it will attack)
   *  @property {boolean} Melee = if monster is melee
   *  @property {boolean} NPC = if unit is NPC
   *  @property {boolean} Demon = if monster is demon
   *  @property {boolean} Flying = if monster is flying
   *  @property {boolean} Boss = if monster is a boss
   *  @property {boolean} ActBoss = if monster is act boss
   *  @property {boolean} Killable = if monster can be killed
   *  @property {boolean} Convertable = if monster is affected by convert or mind blast
   *  @property {boolean} NeverCount = if not counted as a minion
   *  @property {number} DeathDamage = explodes on death
   *  @property {number} Regeneration = hp regeneration
   *  @property {number} LocaleString = locale string index for getLocaleString
   *  @property {number} ExperienceModifier = percent of base monster exp this unit rewards when killed
   *  @property {number} Undead = 2 if greater undead, 1 if lesser undead, 0 if neither
   *  @property {number} Drain = drain effectiveness percent
   *  @property {number} Block = block percent
   *  @property {number} Physical = physical resist
   *  @property {number} Magic = magic resist
   *  @property {number} Fire = fire resist
   *  @property {number} Lightning = lightning resist
   *  @property {number} Poison = poison resist
   *  @property {number[]} Minions = array of minions that can spawn with this unit
   *  @property {number} MinionCount.Min = minimum number of minions that can spawn with this unit
   *  @property {number} MinionCount.Max = maximum number of minions that can spawn with this unit
   */
  
  /** @type {MonsterDataObj[]} */
  const MonsterData = Array(MONSTER_INDEX_COUNT);

  for (let i = 0; i < MonsterData.length; i++) {
    let index = i;
    
    MonsterData[i] = ({
      Index: index,
      ClassID: index,
      Type: getBaseStat("monstats", index, "MonType"),
      Level: getBaseStat("monstats", index, "Level"), // normal only, nm/hell are determined by area's LevelEx
      Ranged: getBaseStat("monstats", index, "RangedType"),
      Rarity: getBaseStat("monstats", index, "Rarity"),
      Threat: getBaseStat("monstats", index, "threat"),
      PetIgnore: getBaseStat("monstats", index, "petignore"),
      Align: getBaseStat("monstats", index, "Align"),
      Melee: getBaseStat("monstats", index, "isMelee"),
      NPC: getBaseStat("monstats", index, "npc"),
      Demon: getBaseStat("monstats", index, "demon"),
      Flying: getBaseStat("monstats", index, "flying"),
      Boss: getBaseStat("monstats", index, "boss"),
      ActBoss: getBaseStat("monstats", index, "primeevil"),
      Killable: getBaseStat("monstats", index, "killable"),
      Convertable: getBaseStat("monstats", index, "switchai"),
      NeverCount: getBaseStat("monstats", index, "neverCount"),
      DeathDamage: getBaseStat("monstats", index, "deathDmg"),
      Regeneration: getBaseStat("monstats", index, "DamageRegen"),
      LocaleString: getLocaleString(getBaseStat("monstats", index, "NameStr")),
      InternalName: LocaleStringName[getBaseStat("monstats", index, "NameStr")],
      ExperienceModifier: getBaseStat("monstats", index, ["Exp", "Exp(N)", "Exp(H)"][me.diff]),
      Undead: (getBaseStat("monstats", index, "hUndead") && 2) | (getBaseStat("monstats", index, "lUndead") && 1),
      Drain: getBaseStat("monstats", index, ["Drain", "Drain(N)", "Drain(H)"][me.diff]),
      Block: getBaseStat("monstats", index, ["ToBlock", "ToBlock(N)", "ToBlock(H)"][me.diff]),
      Physical: getBaseStat("monstats", index, ["ResDm", "ResDm(N)", "ResDm(H)"][me.diff]),
      Magic: getBaseStat("monstats", index, ["ResMa", "ResMa(N)", "ResMa(H)"][me.diff]),
      Fire: getBaseStat("monstats", index, ["ResFi", "ResFi(N)", "ResFi(H)"][me.diff]),
      Lightning: getBaseStat("monstats", index, ["ResLi", "ResLi(N)", "ResLi(H)"][me.diff]),
      Cold: getBaseStat("monstats", index, ["ResCo", "ResCo(N)", "ResCo(H)"][me.diff]),
      Poison: getBaseStat("monstats", index, ["ResPo", "ResPo(N)", "ResPo(H)"][me.diff]),
      Minions: ([
        getBaseStat("monstats", index, "minion1"), getBaseStat("monstats", index, "minion2")
      ].filter(mon => mon !== 65535)),
      GroupCount: ({
        Min: getBaseStat("monstats", index, "MinGrp"),
        Max: getBaseStat("monstats", index, "MaxGrp")
      }),
      MinionCount: ({
        Min: getBaseStat("monstats", index, "PartyMin"),
        Max: getBaseStat("monstats", index, "PartyMax")
      }),
      Velocity: getBaseStat("monstats", index, "Velocity"),
      Run: getBaseStat("monstats", index, "Run"),
      SizeX: getBaseStat("monstats", index, "SizeX"),
      SizeY: getBaseStat("monstats", index, "SizeY"),
      Attack1MinDmg: getBaseStat("monstats", index, ["A1MinD", "A1MinD(N)", "A1MinD(H)"][me.diff]),
      Attack1MaxDmg: getBaseStat("monstats", index, ["A1MaxD", "A1MaxD(N)", "A1MaxD(H)"][me.diff]),
      Attack2MinDmg: getBaseStat("monstats", index, ["A2MinD", "A2MinD(N)", "A2MinD(H)"][me.diff]),
      Attack2MaxDmg: getBaseStat("monstats", index, ["A2MaxD", "A2MaxD(N)", "A2MaxD(H)"][me.diff]),
      Skill1MinDmg: getBaseStat("monstats", index, ["S1MinD", "S1MinD(N)", "S1MinD(H)"][me.diff]),
      Skill1MaxDmg: getBaseStat("monstats", index, ["S1MaxD", "S1MaxD(N)", "S1MaxD(H)"][me.diff]),
    });
  }

  MonsterData.findByName = function (whatToFind) {
    let matches = MonsterData
      .map(mon => [Math.min(whatToFind.diffCount(mon.LocaleString), whatToFind.diffCount(mon.InternalName)), mon])
      .sort((a, b) => a[0] - b[0]);

    return matches[0][1];
  };

  module.exports = MonsterData;
})(module, require);
