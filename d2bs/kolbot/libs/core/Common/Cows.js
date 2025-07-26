/**
*  @filename    Cows.js
*  @author      theBGuy
*  @desc        clear Moo Moo Farm
*
*/

(function (module) {
  module.exports = new function Cows () {
    /** @type {Room[]} */
    this._badRooms = [];
    /** @type {{ id: number, area: number, x: number, y: number } | null} */
    this._kingCoords = null;

    this.buildCowRooms = function () {
      /** @type {Partial<Room>[]} */
      const finalRooms = [];
      /** @type {Set<string>} */
      const indexes = new Set();

      const kingPreset = Game.getPresetMonster(sdk.areas.MooMooFarm, sdk.monsters.preset.TheCowKing);
      this._kingCoords = kingPreset.realCoords();
      /** @type {Room[]} */
      const badRooms = getRoom(this._kingCoords.x, this._kingCoords.y).getNearby();

      for (let i = 0; i < badRooms.length; i += 1) {
        this._badRooms.push(badRooms[i]);
        CollMap.drawRoom(badRooms[i], "red");
        let badRooms2 = badRooms[i].getNearby();

        for (let j = 0; j < badRooms2.length; j += 1) {
          if (!indexes.has(badRooms2[j].x + "" + badRooms2[j].y)) {
            CollMap.drawRoom(badRooms2[j], "white");
            indexes.add(badRooms2[j].x + "" + badRooms2[j].y);
          }
        }
      }

      let room = getRoom();

      do {
        if (!indexes.has(room.x + "" + room.y)) {
          finalRooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
        }
      } while (room.getNext());

      return finalRooms;
    };

    // add soloplays kingTracker?
    this.clearCowLevel = function () {
      function roomSort(a, b) {
        const aSeen = seen.has(JSON.stringify(a));
        const bSeen = seen.has(JSON.stringify(b));

        if (aSeen && !bSeen) {
          return 1; // a is seen, b is not seen, so b should come first
        } else if (!aSeen && bSeen) {
          return -1; // b is seen, a is not seen, so a should come first
        }
  
        return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
      }

      Config.MFLeader && Pather.makePortal() && say("cows");

      let myRoom;
      /** @type {Set<string>} */
      const seen = new Set();
      let rooms = this.buildCowRooms();

      // Check if the starting room is in badRooms
      if (!Pather.useTeleport()) {
        let startRoom = getRoom(me.x, me.y);
        let startRoomCoords = [startRoom.x * 5 + startRoom.xsize / 2, startRoom.y * 5 + startRoom.ysize / 2];
        let startRoomInBadRooms = this._badRooms.some(function (badRoom) {
          return CollMap.coordsInRoom(startRoomCoords[0], startRoomCoords[1], badRoom);
        });

        if (startRoomInBadRooms) {
          console.warn("Starting room is in badRooms, finding the closest safe room...");
          rooms.sort(function (a, b) {
            // eslint-disable-next-line max-len
            return getDistance(startRoomCoords[0], startRoomCoords[1], a[0], a[1]) - getDistance(startRoomCoords[0], startRoomCoords[1], b[0], b[1]);
          });

          for (let room of rooms) {
            let safeRoom = !this._badRooms.some(function (badRoom) {
              return CollMap.coordsInRoom(room[0], room[1], badRoom);
            });

            if (safeRoom) {
              let result = Pather.getNearestWalkable(room[0], room[1], 10, 2);
              if (result) {
                Pather.moveTo(result[0], result[1], 3);
                myRoom = [result[0], result[1]];
                break;
              }
            }
          }
        }
      }

      let room;
      RoomLoop:
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
        seen.add(JSON.stringify(room));
        let result = Pather.getNearestWalkable(room[0], room[1], 10, 2);

        if (result) {
          if (!Pather.useTeleport()) {
            // lets avoid running through the badrooms
            let path = getPath(
              me.area,
              result[0], result[1],
              me.x, me.y,
              0,
              Pather.walkDistance
            );
            if (path) {
              for (let node of path) {
                let pathInBadRoom = this._badRooms.some(function (badRoom) {
                  return CollMap.coordsInRoom(node.x, node.y, badRoom);
                });
                if (pathInBadRoom) {
                  if (!seen.has(JSON.stringify(room))) {
                    seen.add(JSON.stringify(room));
                    rooms.push(room);
                  } else {
                    console.warn("Seen this room before and the path still takes us through the badrooms, skip it");
                  }
                  continue RoomLoop;
                }
              }
            }
          }
          Pather.moveTo(result[0], result[1], 3);
          if (!Attack.clear(30)) return false;
        }
      }

      return true;
    };
  };
})(module);
