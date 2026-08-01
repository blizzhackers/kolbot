/**
*  @filename    ClassAttack.js
*  @author      theBGuy
*  @desc        Class specific attack sequences
*
*/

// each ClassAttack functionality is loaded into this object when it's needed
// for the actual function files @see core/Attacks/
/** @type {IClassAttack} */
const ClassAttack = (function () {
  const LazyLoader = require("../modules/LazyLoader");

  /** @type {Map<string, string>} */
  const modulePathMap = new Map([
    [sdk.player.class.Amazon.toString(), "./Attacks/Amazon"],
    [sdk.player.class.Assassin.toString(), "./Attacks/Assassin"],
    [sdk.player.class.Barbarian.toString(), "./Attacks/Barbarian"],
    [sdk.player.class.Druid.toString(), "./Attacks/Druid"],
    [sdk.player.class.Necromancer.toString(), "./Attacks/Necromancer"],
    [sdk.player.class.Paladin.toString(), "./Attacks/Paladin"],
    [sdk.player.class.Sorceress.toString(), "./Attacks/Sorceress"],
  ]);
  
  return LazyLoader(modulePathMap);
})();
