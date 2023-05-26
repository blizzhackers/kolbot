/**
*  @filename    ShrineData.js
*  @author      theBGuy
*  @desc        shrine data library, handles shrine types, states, durations, and regen times
*
*/

(function (module) {
  const ShrineData = (function () {
    function Shrine (state, duration, regen) {
      this.state = state || 0;
      this.duration = duration || 0;
      this.regenTime = Time.minutes(regen) || Infinity;
    }
    const shrineMap = new Map();
    shrineMap.set(sdk.shrines.Refilling, new Shrine(0, 0, 2));
    shrineMap.set(sdk.shrines.Health, new Shrine(0, 0, 5));
    shrineMap.set(sdk.shrines.Mana, new Shrine(0, 0, 5));
    shrineMap.set(sdk.shrines.HealthExchange, new Shrine());
    shrineMap.set(sdk.shrines.ManaExchange, new Shrine());
    shrineMap.set(sdk.shrines.Armor, new Shrine(sdk.states.ShrineArmor, 2400, 5));
    shrineMap.set(sdk.shrines.Combat, new Shrine(sdk.states.ShrineCombat, 2400, 5));
    shrineMap.set(sdk.shrines.ResistFire, new Shrine(sdk.states.ShrineResFire, 3600, 5));
    shrineMap.set(sdk.shrines.ResistCold, new Shrine(sdk.states.ShrineResCold, 3600, 5));
    shrineMap.set(sdk.shrines.ResistLightning, new Shrine(sdk.states.ShrineResLighting, 3600, 5));
    shrineMap.set(sdk.shrines.ResistPoison, new Shrine(sdk.states.ShrineResPoison, 3600, 5));
    shrineMap.set(sdk.shrines.Skill, new Shrine(sdk.states.ShrineSkill, 2400, 5));
    shrineMap.set(sdk.shrines.ManaRecharge, new Shrine(sdk.states.ShrineManaRegen, 2400, 5));
    shrineMap.set(sdk.shrines.Stamina, new Shrine(sdk.states.ShrineStamina, 4800, 5));
    shrineMap.set(sdk.shrines.Experience, new Shrine(sdk.states.ShrineResCold, 3600));
    shrineMap.set(sdk.shrines.Enirhs, new Shrine());
    shrineMap.set(sdk.shrines.Portal, new Shrine());
    shrineMap.set(sdk.shrines.Gem, new Shrine());
    shrineMap.set(sdk.shrines.Fire, new Shrine());
    shrineMap.set(sdk.shrines.Monster, new Shrine());
    shrineMap.set(sdk.shrines.Exploding, new Shrine());
    shrineMap.set(sdk.shrines.Poison, new Shrine());
    
    return {
      get: function (shrineType) {
        return shrineMap.get(shrineType);
      },

      has: function (shrineType) {
        return shrineMap.has(shrineType);
      },

      getState: function (shrineType) {
        return shrineMap.get(shrineType).state || 0;
      },

      getDuration: function (shrineType) {
        return shrineMap.get(shrineType).duration || 0;
      },

      getRegenTime: function (shrineType) {
        return shrineMap.get(shrineType).regenTime || Infinity;
      },
    };
  })();

  module.exports = ShrineData;
})(module);
