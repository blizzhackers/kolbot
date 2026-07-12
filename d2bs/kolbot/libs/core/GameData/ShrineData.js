/**
*  @filename    ShrineData.js
*  @author      theBGuy
*  @desc        shrine data library, handles shrine types, states, durations, and regen times
*
*/

(function (module) {
  const ShrineData = (function () {
    /**
     * @constructor
     * @param {string} name
     * @param {number} state 
     * @param {number} duration 
     * @param {number} regen 
     */
    function Shrine (name, state, duration, regen) {
      this.name = name || "Unknown Shrine";
      this.state = state || 0;
      this.duration = duration || 0;
      this.regenTime = Time.minutes(regen) || Infinity;
    }
    const _shrines = new Map([
      [sdk.shrines.Refilling, new Shrine("Refilling", sdk.shrines.None, 0, 2)],
      [sdk.shrines.Health, new Shrine("Health", sdk.shrines.None, 0, 5)],
      [sdk.shrines.Mana, new Shrine("Mana", sdk.shrines.None, 0, 5)],
      [sdk.shrines.HealthExchange, new Shrine()],
      [sdk.shrines.ManaExchange, new Shrine()],
      [sdk.shrines.Armor, new Shrine("Armor", sdk.states.ShrineArmor, 2400, 5)],
      [sdk.shrines.Combat, new Shrine("Combat", sdk.states.ShrineCombat, 2400, 5)],
      [sdk.shrines.ResistFire, new Shrine("Resist Fire", sdk.states.ShrineResFire, 3600, 5)],
      [sdk.shrines.ResistCold, new Shrine("Resist Cold", sdk.states.ShrineResCold, 3600, 5)],
      [sdk.shrines.ResistLightning, new Shrine("Resist Lightning", sdk.states.ShrineResLighting, 3600, 5)],
      [sdk.shrines.ResistPoison, new Shrine("Resist Poison", sdk.states.ShrineResPoison, 3600, 5)],
      [sdk.shrines.Skill, new Shrine("Skill", sdk.states.ShrineSkill, 2400, 5)],
      [sdk.shrines.ManaRecharge, new Shrine("Mana Recharge", sdk.states.ShrineManaRegen, 2400, 5)],
      [sdk.shrines.Stamina, new Shrine("Stamina", sdk.states.ShrineStamina, 4800, 5)],
      [sdk.shrines.Experience, new Shrine("Experience", sdk.states.ShrineExperience, 3600)],
      [sdk.shrines.Enirhs, new Shrine()],
      [sdk.shrines.Portal, new Shrine("Portal")],
      [sdk.shrines.Gem, new Shrine("Gem")],
      [sdk.shrines.Fire, new Shrine("Fire")],
      [sdk.shrines.Monster, new Shrine("Monster")],
      [sdk.shrines.Exploding, new Shrine("Exploding")],
      [sdk.shrines.Poison, new Shrine("Poison")],
    ]);
    
    return {
      /** @param {number} shrineType */
      get: function (shrineType) {
        return _shrines.get(shrineType);
      },

      /** @param {number} shrineType */
      has: function (shrineType) {
        return _shrines.has(shrineType);
      },

      /** @param {number} shrineType */
      getState: function (shrineType) {
        if (!_shrines.has(shrineType)) return 0;
        return _shrines.get(shrineType).state || 0;
      },

      /** @param {number} shrineType */
      getDuration: function (shrineType) {
        if (!_shrines.has(shrineType)) return 0;
        return _shrines.get(shrineType).duration || 0;
      },

      /** @param {number} shrineType */
      getRegenTime: function (shrineType) {
        if (!_shrines.has(shrineType)) return Infinity;
        return _shrines.get(shrineType).regenTime || Infinity;
      },
    };
  })();

  module.exports = ShrineData;
})(module);
