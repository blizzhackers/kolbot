/**
*  @filename    GetCube.js
*  @author      theBGuy
*  @desc        Go get the cube from Halls if we don't have it are enabled to cube
*
*/

function GetCube () {
  // Can't get the cube if we can't access the act
  if (!me.accessToAct(2)) return false;

  console.log("Getting cube");
  me.overhead("Getting cube");

  Pather.useWaypoint(sdk.areas.HallsoftheDeadLvl2, true);
  Precast.doPrecast(true);

  if (Pather.moveToExit(sdk.areas.HallsoftheDeadLvl3, true)
    && Pather.moveToPresetObject(me.area, sdk.quest.chest.HoradricCubeChest)) {
    let chest = Game.getObject(sdk.quest.chest.HoradricCubeChest);

    if (chest) {
      Misc.openChest(chest);
      Misc.poll(function () {
        let cube = Game.getItem(sdk.quest.item.Cube);
        return !!cube && Pickit.pickItem(cube);
      }, 1000, 2000);
    }
  }

  Town.goToTown();
  let cube = me.getItem(sdk.quest.item.Cube);

  return (!!cube && Storage.Stash.MoveTo(cube));
}
