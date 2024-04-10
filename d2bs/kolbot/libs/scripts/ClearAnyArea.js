/**
*  @filename    ClearAnyArea.js
*  @author      kolton
*  @desc        Clears any area
*
*/

const ClearAnyArea = new Runnable(
  function ClearAnyArea () {
    Town.doChores();

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
  get: function () {
    return Config.ClearAnyArea.AreaList[0];
  }
});
