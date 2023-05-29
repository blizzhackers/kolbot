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
    const _shrines = new Map([
      [sdk.shrines.Refilling, new Shrine(sdk.shrines.None, 0, 2)],
      [sdk.shrines.Health, new Shrine(sdk.shrines.None, 0, 5)],
      [sdk.shrines.Mana, new Shrine(sdk.shrines.None, 0, 5)],
      [sdk.shrines.HealthExchange, new Shrine()],
      [sdk.shrines.ManaExchange, new Shrine()],
      [sdk.shrines.Armor, new Shrine(sdk.states.ShrineArmor, 2400, 5)],
      [sdk.shrines.Combat, new Shrine(sdk.states.ShrineCombat, 2400, 5)],
      [sdk.shrines.ResistFire, new Shrine(sdk.states.ShrineResFire, 3600, 5)],
      [sdk.shrines.ResistCold, new Shrine(sdk.states.ShrineResCold, 3600, 5)],
      [sdk.shrines.ResistLightning, new Shrine(sdk.states.ShrineResLighting, 3600, 5)],
      [sdk.shrines.ResistPoison, new Shrine(sdk.states.ShrineResPoison, 3600, 5)],
      [sdk.shrines.Skill, new Shrine(sdk.states.ShrineSkill, 2400, 5)],
      [sdk.shrines.ManaRecharge, new Shrine(sdk.states.ShrineManaRegen, 2400, 5)],
      [sdk.shrines.Stamina, new Shrine(sdk.states.ShrineStamina, 4800, 5)],
      [sdk.shrines.Experience, new Shrine(sdk.states.ShrineResCold, 3600)],
      [sdk.shrines.Enirhs, new Shrine()],
      [sdk.shrines.Portal, new Shrine()],
      [sdk.shrines.Gem, new Shrine()],
      [sdk.shrines.Fire, new Shrine()],
      [sdk.shrines.Monster, new Shrine()],
      [sdk.shrines.Exploding, new Shrine()],
      [sdk.shrines.Poison, new Shrine()],
    ]);
    
    return {
      get: function (shrineType) {
        return _shrines.get(shrineType);
      },

      has: function (shrineType) {
        return _shrines.has(shrineType);
      },

      getState: function (shrineType) {
        return _shrines.get(shrineType).state || 0;
      },

      getDuration: function (shrineType) {
        return _shrines.get(shrineType).duration || 0;
      },

      getRegenTime: function (shrineType) {
        return _shrines.get(shrineType).regenTime || Infinity;
      },
    };
  })();

  module.exports = ShrineData;
})(module);
