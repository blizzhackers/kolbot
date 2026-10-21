/**
*  @filename    Common.js
*  @author      theBGuy
*  @desc        collection of functions shared between muliple scripts
*
*/

// each common functionality is loaded into this object when it's needed
// for the actual function files @see core/Common/
/** @type {Common} */
const Common = (function () {
  const LazyLoader = require("../modules/LazyLoader");

  /** @type {Map<string, string>} */
  const modulePathMap = new Map([
    ["Ancients", "./Common/Ancients"],
    ["Baal", "./Common/Baal"],
    ["Cain", "./Common/Cain"],
    ["Cows", "./Common/Cows"],
    ["Diablo", "./Common/Diablo"],
    ["Leecher", "./Common/Leecher"],
    ["Smith", "./Common/Smith"],
    ["Toolsthread", "./Common/Tools"],
  ]);
  
  return LazyLoader(modulePathMap);
})();
