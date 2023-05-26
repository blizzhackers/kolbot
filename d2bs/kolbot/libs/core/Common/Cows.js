/**
*  @filename    Cows.js
*  @author      theBGuy
*  @desc        clear Moo Moo Farm
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Cows", {
    value: {
      buildCowRooms: function () {
        let finalRooms = [];
        let indexes = [];

        let kingPreset = Game.getPresetMonster(sdk.areas.MooMooFarm, sdk.monsters.preset.TheCowKing);
        let badRooms = getRoom(kingPreset.roomx * 5 + kingPreset.x, kingPreset.roomy * 5 + kingPreset.y).getNearby();

        for (let i = 0; i < badRooms.length; i += 1) {
          let badRooms2 = badRooms[i].getNearby();

          for (let j = 0; j < badRooms2.length; j += 1) {
            if (indexes.indexOf(badRooms2[j].x + "" + badRooms2[j].y) === -1) {
              indexes.push(badRooms2[j].x + "" + badRooms2[j].y);
            }
          }
        }

        let room = getRoom();

        do {
          if (indexes.indexOf(room.x + "" + room.y) === -1) {
            finalRooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
          }
        } while (room.getNext());

        return finalRooms;
      },

      clearCowLevel: function () {
        function roomSort(a, b) {
          return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
        }

        Config.MFLeader && Pather.makePortal() && say("cows");

        let myRoom;
        let rooms = this.buildCowRooms();

        while (rooms.length > 0) {
          // get the first room + initialize myRoom var
          !myRoom && (room = getRoom(me.x, me.y));

          if (room) {
            // use previous room to calculate distance
            if (room instanceof Array) {
              myRoom = [room[0], room[1]];
            } else {
              // create a new room to calculate distance (first room, done only once)
              myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
            }
          }

          rooms.sort(roomSort);
          let room = rooms.shift();
          let result = Pather.getNearestWalkable(room[0], room[1], 10, 2);

          if (result) {
            Pather.moveTo(result[0], result[1], 3);
            if (!Attack.clear(30)) return false;
          }
        }

        return true;
      },
    },
    configurable: true,
  });
})(Common);
