/**
*  @filename    ClearAnyArea.js
*  @author      kolton
*  @desc        Clears any area
*
*/

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
