/**
*  @filename    ClearAnyArea.js
*  @author      kolton
*  @desc        Clears any area
*
*/

// eslint-disable-next-line no-var -- Loader resolves this via global[script]; a top-level const is not a global property on modern JS engines
var ClearAnyArea = new Runnable(
  function ClearAnyArea () {
    for (let area of Config.ClearAnyArea.AreaList) {
      try {
        if (Pather.journeyTo(area)) {
          Attack.clearLevel(Config.ClearType);
        }
      } catch (e) {
        console.error(e);
      }
    }

    return true;
  }
);

Object.defineProperty(ClearAnyArea, "startArea", {
  /** @returns {number} */
  get: function () {
    return Config.ClearAnyArea.AreaList[0];
  }
});
