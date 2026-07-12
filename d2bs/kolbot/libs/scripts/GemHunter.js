/**
*  @filename    GemHunter.js
*  @author      icommitdesnet, theBGuy
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
const GemHunter = new Runnable(
  function GemHunter () {
    if (!Town.prepareForGemShrine()) {
      console.log("ÿc4GemHunterÿc0: no gems in inventory - aborting.");
      return false;
    }

    /** @param {number} area */
    const findGemShrines = function (area) {
      const shrineLocs = [];
      const units = Game.getPresetObjects(area)
        .filter(function (preset) {
          return sdk.shrines.Presets.includes(preset.id);
        });

      if (units.length) {
        for (let shrine of units) {
          shrineLocs.push(shrine.realCoords());
        }
      }

      try {
        NodeAction.shrinesToIgnore.push(sdk.shrines.Gem);

        while (shrineLocs.length > 0) {
          shrineLocs.sort(Sort.units);
          let coords = shrineLocs.shift();

          Pather.move(coords, { minDist: Skill.haveTK ? 20 : 5, callback: () => {
            let shrine = Game.getObject("shrine");
            return !!shrine && shrine.x === coords.x && shrine.y === coords.y;
          } });

          let shrine = Game.getObject("shrine");

          if (shrine) {
            do {
              if (shrine.objtype === sdk.shrines.Gem && shrine.mode === sdk.objects.mode.Inactive) {
                (!Skill.haveTK) && Pather.moveTo(shrine.x - 2, shrine.y - 2);

                console.log("ÿc4GemHunterÿc0: found a gem Shrine");
                if (Misc.getShrine(shrine)) {
                  Pickit.pickItems();

                  if (!Town.prepareForGemShrine()) {
                    console.error("ÿc4GemHunterÿc0: failed to prepare for next shrine - aborting.");
                    return false;
                  }
                }
              }
            } while (shrine.getNext());
          }
        }

        return true;
      } finally {
        NodeAction.shrinesToIgnore.remove(sdk.shrines.Gem);
      }
    };

    for (let area of Config.GemHunter.AreaList) {
      console.log("ÿc4GemHunterÿc0: Moving to " + getAreaName(area));
      Pather.journeyTo(area);
      Precast.doPrecast(false);
      
      if (!findGemShrines(area)) {
        console.debug("ending early");
        break;
      }
    }
    return true;
  },
  {
    preAction: function (ctx) {
      ctx.preGidList = new Set(Town.dontStashGids);
    },
    cleanup: function (ctx) {
      for (let gid of Town.dontStashGids) {
        if (!ctx.preGidList.has(gid)) {
          Town.dontStashGids.delete(gid);
        }
      }
    }
  }
);
