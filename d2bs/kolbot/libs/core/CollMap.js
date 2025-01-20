/**
*  @filename    CollMap.js
*  @author      kolton
*  @desc        manipulate map collision data
*
*/

const CollMap = new function () {
  this.rooms = [];
  this.maps = [];
  /** @type {Line[]} */
  this.hooks = [];
  this.colors = {
    green: 0x84,
    red: 0x0a,
    black: 0x00,
    white: 0xff,
    purple: 0x9b,
    blue: 0x97,
  };

  /**
   * @param {Room} room 
   * @param {('green' | 'red' | 'black' | 'white' | 'purple' | 'blue' | number)} [color='green'] 
   * @param {boolean} [update=false]
   * @returns {void}
   */
  this.drawRoom = function (room, color = "green", update = false) {
    let idx = this.hooks.findIndex(h => h.room.x === room.x && h.room.y === room.y);
    if (idx >= 0) {
      if (!update) return;
      this.hooks[idx].lines.forEach(l => l.remove());
      this.hooks.splice(idx, 1);
    }
    const lineColor = typeof color === "string"
      ? (color in this.colors) ? this.colors[color] : this.colors.green
      : color;
    let lines = [
      new Line(room.x * 5, room.y * 5, room.x * 5 + room.xsize, room.y * 5, lineColor, true),
      new Line(room.x * 5 + room.xsize, room.y * 5, room.x * 5 + room.xsize, room.y * 5 + room.ysize, lineColor, true),
      new Line(room.x * 5 + room.xsize, room.y * 5 + room.ysize, room.x * 5, room.y * 5 + room.ysize, lineColor, true),
      new Line(room.x * 5, room.y * 5 + room.ysize, room.x * 5, room.y * 5, lineColor, true),
    ];
    this.hooks.push({ room: room, lines: lines });
  };

  /** @param {Room} room */
  this.removeHookForRoom = function (room) {
    let index = this.hooks.findIndex(h => h.room.x === room.x && h.room.y === room.y);
    if (index !== -1) {
      this.hooks[index].lines.forEach(l => l.remove());
      this.hooks.splice(index, 1);
    }
  };

  this.removeHooks = function () {
    this.hooks.forEach(hook => hook.lines.forEach(l => l.remove()));
    this.hooks = [];
  };

  /**
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  this.getNearbyRooms = function (x, y) {
    let room = getRoom(x, y);
    if (!room) return false;

    let rooms = room.getNearby();
    if (!rooms) return false;

    for (let i = 0; i < rooms.length; i += 1) {
      let [rX, rY] = [rooms[i].x * 5 + rooms[i].xsize / 2, rooms[i].y * 5 + rooms[i].ysize / 2];
      if (this.getRoomIndex(rX, rY, true) === undefined) {
        this.addRoom(rooms[i]);
      }
    }

    return true;
  };

  /**
   * @param {number | Room} x 
   * @param {number} [y] 
   * @returns {boolean}
   */
  this.addRoom = function (x, y) {
    let room = x instanceof Room ? x : getRoom(x, y);

    // Coords are not in the returned room.
    if (arguments.length === 2 && !this.coordsInRoom(x, y, room)) {
      return false;
    }

    let coll = !!room ? room.getCollision() : null;

    if (coll) {
      this.rooms.push({ x: room.x, y: room.y, xsize: room.xsize, ysize: room.ysize });
      this.maps.push(coll);

      return true;
    }

    return false;
  };

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {boolean} [cacheOnly]
   * @returns {boolean}
   */
  this.getColl = function (x, y, cacheOnly) {
    let index = this.getRoomIndex(x, y, cacheOnly);

    if (index === undefined) {
      return 5;
    }

    let j = x - this.rooms[index].x * 5;
    let i = y - this.rooms[index].y * 5;

    if (this.maps[index] !== undefined && this.maps[index][i] !== undefined && this.maps[index][i][j] !== undefined) {
      return this.maps[index][i][j];
    }

    return 5;
  };

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {boolean} [cacheOnly]
   * @returns {number | undefined}
   */
  this.getRoomIndex = function (x, y, cacheOnly) {
    this.rooms.length > 25 && this.reset();

    let i;

    for (i = 0; i < this.rooms.length; i += 1) {
      if (this.coordsInRoom(x, y, this.rooms[i])) {
        return i;
      }
    }

    if (!cacheOnly && this.addRoom(x, y)) {
      return i;
    }

    return undefined;
  };

  /**
   * @param {number} x 
   * @param {number} y 
   * @param {Room} room
   * @returns {boolean}
   */
  this.coordsInRoom = function (x, y, room) {
    if (room && x >= room.x * 5 && x < room.x * 5 + room.xsize && y >= room.y * 5 && y < room.y * 5 + room.ysize) {
      return true;
    }

    return false;
  };

  this.reset = function () {
    this.rooms = [];
    this.maps = [];
  };

  /**
   * Check collision between unitA and unitB. true = collision present, false = collision not present
   * If checking for blocking collisions (0x1, 0x4), true means blocked, false means not blocked
   * @param {Unit | PathNode} unitA 
   * @param {Unit | PathNode} unitB 
   * @param {number} coll 
   * @param {number} thickness 
   * @returns {boolean}
   */
  this.checkColl = function (unitA, unitB, coll, thickness) {
    thickness === undefined && (thickness = 1);

    let i, k, l, cx, cy;
    let angle = Math.atan2(unitA.y - unitB.y, unitA.x - unitB.x);
    let distance = Math.round(getDistance(unitA, unitB));

    for (i = 1; i < distance; i += 1) {
      cx = Math.round((Math.cos(angle)) * i + unitB.x);
      cy = Math.round((Math.sin(angle)) * i + unitB.y);

      // check thicker line
      for (k = cx - thickness; k <= cx + thickness; k += 1) {
        for (l = cy - thickness; l <= cy + thickness; l += 1) {
          if (this.getColl(k, l, false) & coll) {
            return true;
          }
        }
      }
    }

    return false;
  };

  /**
   * @param {Room} room 
   * @returns {PathNode}
   */
  this.getTelePoint = function (room) {
    // returns {x, y, distance} of a valid point with lowest distance from room center
    // distance is from room center, handy for keeping bot from trying to teleport on walls

    if (!room) throw new Error("Invalid room passed to getTelePoint");

    let roomx = room.x * 5;
    let roomy = room.y * 5;

    if (getCollision(room.area, roomx, roomy) & 1) {
      let collision = room.getCollision(), validTiles = [];
      let aMid = Math.round(collision.length / 2), bMid = Math.round(collision[0].length / 2);

      for (let a = 0; a < collision.length; a++) {
        for (let b = 0; b < collision[a].length; b++) {
          if (!(collision[a][b] & 1)) {
            validTiles.push({
              x: roomx + b - bMid,
              y: roomy + a - aMid,
              distance: getDistance(0, 0, a - aMid, b - bMid)
            });
          }
        }
      }

      if (validTiles.length) {
        validTiles.sort((a, b) => a.distance - b.distance);

        return validTiles[0];
      }

      return null;
    }

    return { x: roomx, y: roomy, distance: 0 };
  };

  /**
   * @param {number} cX 
   * @param {number} xmin 
   * @param {number} xmax 
   * @param {number} cY 
   * @param {number} ymin 
   * @param {number} ymax 
   * @param {number} factor 
   * @returns {PathNode}
   */
  this.getRandCoordinate = function (cX, xmin, xmax, cY, ymin, ymax, factor = 1) {
    // returns randomized {x, y} object with valid coordinates
    let coordX, coordY;
    let retry = 0;

    do {
      if (retry > 30) {
        console.log("failed to get valid coordinate");
        coordX = cX;
        coordY = cY;

        break;
      }

      coordX = cX + factor * rand(xmin, xmax);
      coordY = cY + factor * rand(ymin, ymax);

      if (cX === coordX && cY === coordY) { // recalculate if same coordiante
        coordX = 0;
        continue;
      }

      retry++;
    } while (getCollision(me.area, coordX, coordY) & 1);

    // console.log("Move " + retry + " from (" + cX + ", " + cY + ") to (" + coordX + ", " + coordY + ")");
    return new PathNode(coordX, coordY);
  };
};
