/**
*  @filename    GhostBusters.js
*  @author      kolton, theBGuy
*  @desc        who you gonna call?
*
*/

function GhostBusters () {
  const clearGhosts = function () {
    let room = getRoom();
    if (!room) return false;

    const rooms = [];
    /** @param {Monster} monster */
    const check = function (monster) {
      return monster.isGhost && monster.distance <= 30;
    };

    do {
      rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
    } while (room.getNext());

    while (rooms.length > 0) {
      rooms.sort(Sort.points);
      room = rooms.shift();

      let result = Pather.getNearestWalkable(room[0], room[1], 15, 2);

      if (result) {
        Pather.moveTo(result[0], result[1], 3);

        let monList = Attack.buildMonsterList(check);
        if (!monList.length) continue;

        if (!Attack.clearList(monList)) {
          return false;
        }
      }
    }

    return true;
  };

  const tasks = new Map([
    ["cellar", () => {
      Pather.useWaypoint(sdk.areas.BlackMarsh);
      Precast.doPrecast(true);

      for (let i = sdk.areas.ForgottenTower; i <= sdk.areas.TowerCellarLvl5; i += 1) {
        Pather.moveToExit(i, true) && clearGhosts();
      }
    }],
    ["jail", () => {
      // gonna use inner cloister wp and travel backwards
      Pather.useWaypoint(sdk.areas.InnerCloister);
      Precast.doPrecast(true);

      for (let i = sdk.areas.JailLvl3; i >= sdk.areas.JailLvl1; i -= 1) {
        Pather.moveToExit(i, true) && clearGhosts();
      }
    }],
    ["cathedral", () => {
      Pather.useWaypoint(sdk.areas.InnerCloister);
      Precast.doPrecast(true);
      Pather.moveToExit(sdk.areas.Cathedral, true);
      clearGhosts();
    }],
    ["tombs", () => {
      Pather.useWaypoint(sdk.areas.CanyonofMagic);
      Precast.doPrecast(true);

      for (let i = sdk.areas.TalRashasTomb1; i <= sdk.areas.TalRashasTomb7; i += 1) {
        Pather.moveToExit(i, true) && clearGhosts();
        Pather.moveToExit(sdk.areas.CanyonofMagic, true);
      }
    }],
    ["flayerDungeon", () => {
      Pather.useWaypoint(sdk.areas.FlayerJungle);
      Precast.doPrecast(true);

      [sdk.areas.FlayerDungeonLvl1, sdk.areas.FlayerDungeonLvl2, sdk.areas.FlayerDungeonLvl3].forEach(area => {
        Pather.moveToExit(area, true) && clearGhosts();
      });
    }],
    ["crystalinePassage", () => {
      Pather.useWaypoint(sdk.areas.CrystalizedPassage);
      Precast.doPrecast(true);
      clearGhosts();
      Pather.moveToExit(sdk.areas.FrozenRiver, true) && clearGhosts();
    }],
    ["glacialTrail", () => {
      Pather.useWaypoint(sdk.areas.GlacialTrail);
      Precast.doPrecast(true);
      clearGhosts();
      Pather.moveToExit(sdk.areas.DrifterCavern, true) && clearGhosts();
    }],
    ["icyCellar", () => {
      Pather.useWaypoint(sdk.areas.AncientsWay);
      Precast.doPrecast(true);
      Pather.moveToExit(sdk.areas.IcyCellar, true) && clearGhosts();
    }]
  ]);

  tasks.forEach(task => {
    Town.doChores();

    try {
      task();
    } finally {
      Town.goToTown();
    }
  });

  return true;
}
