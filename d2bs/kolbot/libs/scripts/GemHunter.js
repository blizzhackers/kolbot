/**
*  @filename    GemHunter.js
*  @author      icommitdesnet
*  @desc        hunt gem shrines
*
*/

/**
 * @todo If this script is going to be run, and we run across a gem shrine in a different one we should:
 * - Call check if we have an gems to upgrade in the stash instead of always keep some in invo as that takes up space.
 * If we do, go get the gem from the stash before activating shrine.
 * - We should also then keep track of where the shrine was, (I don't remember if gem shrines regen, so check this)
 * - Take into account the next area and sort the shrines to bring us to the exit if its connected
 */
function GemHunter () {
  Town.doChores();
  Town.getGem();
  if (Town.getGemsInInv().length === 0) {
    print("ÿc4GemHunterÿc0: no gems in inventory - aborting.");
    return false;
  }

  for (let area of Config.GemHunter.AreaList) {
    if (Town.getGemsInInv().length > 0) {
      print("ÿc4GemHunterÿc0: Moving to " + getAreaName(area));
      Pather.journeyTo(area);
      if (i % 2 === 0) Precast.doPrecast(true);
      if (Misc.getShrinesInArea(area, sdk.shrines.Gem, true)) {
        Pickit.pickItems();
        print("ÿc4GemHunterÿc0: found a gem Shrine");
        if ((Town.getGemsInInv().length === 0) && (Town.getGemsInStash().length > 0)) {
          print("ÿc4GemHunterÿc0: Getting a new Gem in Town.");
          Town.visitTown(); // Go to Town and do chores. Will throw an error if it fails to return from Town.
          Town.getGem();
        }
      }
    }
  }
  return true;
}
