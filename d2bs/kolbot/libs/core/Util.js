/**
 * @filename    Util.js
 * @author      Jaenster, theBGuy
 * @desc        utility functions for kolbot
 * 
 */

!isIncluded("Polyfill.js") && include("Polyfill.js");

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    let temp = factory();
    Object.keys(temp).forEach(key => {
      if (typeof root[key] === "undefined") {
        root[key] = temp[key];
      }
    });
  }
}(this, function () {
  function ScriptError (message) {
    this.name = "ScriptError";
    this.message = message || "";
    this.stack = (new Error()).stack;
  }

  ScriptError.prototype = Object.create(Error.prototype);
  ScriptError.prototype.constructor = ScriptError;

  /**
   * get all running threads and return them as an array
   * @returns {Script[]}
   */
  const getThreads = function () {
    let threads = [];
    let script = getScript();

    if (script) {
      do {
        threads.push(copyObj(script));
      } while (script.getNext());
    }

    return threads;
  };

  /**
   * @param {...args}
   * @returns {Unit[]}
   */
  const getUnits = function (...args) {
    let units = [], unit = getUnit.apply(null, args);

    if (!unit) {
      return [];
    }
    do {
      units.push(copyUnit(unit));
    } while (unit.getNext());
    return units;
  };

  /**
   * @typedef {Object} Args
   * @property {0 | 1 | 2} arg1 - where
   * @property {number | ItemUnit} arg2 - bodyLoc to click, item to click, x coord
   * @property {number} [arg3] - y coord
   * @property {number} [arg4] - location
   *
   * @param  {...Args} args
   */
  const clickItemAndWait = function (...args) {
    let timeout = getTickCount(), timedOut;
    let before = !me.itemoncursor;

    clickItem.apply(undefined, args);
    delay(Math.max(me.ping * 2, 250));


    while (true) { // Wait until item is picked up.
      delay(3);

      if (before !== !!me.itemoncursor || (timedOut = getTickCount() - timeout > Math.min(1000, 100 + (me.ping * 4)))) {
        break; // quit the loop of item on cursor has changed
      }
    }

    delay(Math.max(me.ping, 50));

    // return item if we didnt timeout
    return !timedOut;
  };

  /**
   * @description clickMap doesn't return if we sucessfully clicked a unit just that a click was sent, this checks and returns that a units mode has changed
   * as a result of us clicking it.
   * @param {number} button
   * @param {0 | 1} shift
   * @param {Unit} unit
   * @returns {boolean} If a units mode has changed as a result of clicking it
   */
  const clickUnitAndWait = function (button, shift, unit) {
    if (typeof (unit) !== "object") throw new Error("clickUnitAndWait: Third arg must be a Unit.");

    let before = unit.mode;

    me.blockMouse = true;
    clickMap(button, shift, unit);
    delay(Math.max(me.ping * 2, 250));
    clickMap(button + 2, shift, unit);
    me.blockMouse = false;
    
    let waitTick = getTickCount();
    let timeOut = Math.min(1000, 100 + (me.ping * 4));

    while (getTickCount() - waitTick < timeOut) {
      delay(30);
      
      // quit the loop if mode has changed
      if (before !== unit.mode) {
        break;
      }
    }

    delay(Math.max(me.ping + 1, 50));

    return (before !== unit.mode);
  };

  /**
   * @class
   * @description new PacketBuilder() - create new packet object
   * @example <caption>(Spoof 'reassign player' packet to client):</caption>
   * new PacketBuilder().byte(sdk.packets.recv.ReassignPlayer).byte(0).dword(me.gid).word(x).word(y).byte(1).get();
   * @example <caption>(Spoof 'player move' packet to server):</caption>
   * new PacketBuilder().byte(sdk.packets.send.RunToLocation).word(x).word(y).send();
   * @todo pass the inital byte into the constructor so we don't always have to do `new PacketBuilder().byte(sdk.packets.recv.ReassignPlayer)...`
   * it would just be `new PacketBuilder(sdk.packets.recv.ReassignPlayer)...`
   */
  function PacketBuilder () {
    // globals DataView ArrayBuffer
    if (this.__proto__.constructor !== PacketBuilder) {
      throw new Error("PacketBuilder must be called with 'new' operator!");
    }

    let queue = [];
    let count = 0;

    // accepts any number of arguments
    let enqueue = (type, size) => (...args) => {
      args.forEach(arg => {
        if (type === "String") {
          arg = stringToEUC(arg);
          size = arg.length + 1;
        }

        queue.push({ type: type, size: size, data: arg });
        count += size;
      });

      return this;
    };

    /** @description size = 4 */
    this.float = enqueue("Float32", 4);
    /** @description size = 4 */
    this.dword = enqueue("Uint32", 4);
    /** @description size = 2 */
    this.word = enqueue("Uint16", 2);
    /** @description size = 1 */
    this.byte = enqueue("Uint8", 1);
    this.string = enqueue("String");

    this.buildDataView = () => {
      let dv = new DataView(new ArrayBuffer(count)), i = 0;
      queue.forEach(field => {
        if (field.type === "String") {
          for (let l = 0; l < field.data.length; l++) {
            dv.setUint8(i++, field.data.charCodeAt(l), true);
          }

          i += field.size - field.data.length; // fix index for field.size !== field.data.length
        } else {
          dv["set" + field.type](i, field.data, true);
          i += field.size;
        }
      });

      return dv;
    };

    this.send = () => (sendPacket(this.buildDataView().buffer), this);
    this.spoof = () => (getPacket(this.buildDataView().buffer), this);
    this.get = this.spoof; // same thing but spoof has clearer intent than get
  }

  const areaNames = [
    "None",
    "Rogue Encampment",
    "Blood Moor",
    "Cold Plains",
    "Stony Field",
    "Dark Wood",
    "Black Marsh",
    "Tamoe Highland",
    "Den Of Evil",
    "Cave Level 1",
    "Underground Passage Level 1",
    "Hole Level 1",
    "Pit Level 1",
    "Cave Level 2",
    "Underground Passage Level 2",
    "Hole Level 2",
    "Pit Level 2",
    "Burial Grounds",
    "Crypt",
    "Mausoleum",
    "Forgotten Tower",
    "Tower Cellar Level 1",
    "Tower Cellar Level 2",
    "Tower Cellar Level 3",
    "Tower Cellar Level 4",
    "Tower Cellar Level 5",
    "Monastery Gate",
    "Outer Cloister",
    "Barracks",
    "Jail Level 1",
    "Jail Level 2",
    "Jail Level 3",
    "Inner Cloister",
    "Cathedral",
    "Catacombs Level 1",
    "Catacombs Level 2",
    "Catacombs Level 3",
    "Catacombs Level 4",
    "Tristram",
    "Moo Moo Farm",
    "Lut Gholein",
    "Rocky Waste",
    "Dry Hills",
    "Far Oasis",
    "Lost City",
    "Valley Of Snakes",
    "Canyon Of The Magi",
    "Sewers Level 1",
    "Sewers Level 2",
    "Sewers Level 3",
    "Harem Level 1",
    "Harem Level 2",
    "Palace Cellar Level 1",
    "Palace Cellar Level 2",
    "Palace Cellar Level 3",
    "Stony Tomb Level 1",
    "Halls Of The Dead Level 1",
    "Halls Of The Dead Level 2",
    "Claw Viper Temple Level 1",
    "Stony Tomb Level 2",
    "Halls Of The Dead Level 3",
    "Claw Viper Temple Level 2",
    "Maggot Lair Level 1",
    "Maggot Lair Level 2",
    "Maggot Lair Level 3",
    "Ancient Tunnels",
    "Tal Rashas Tomb #1",
    "Tal Rashas Tomb #2",
    "Tal Rashas Tomb #3",
    "Tal Rashas Tomb #4",
    "Tal Rashas Tomb #5",
    "Tal Rashas Tomb #6",
    "Tal Rashas Tomb #7",
    "Duriels Lair",
    "Arcane Sanctuary",
    "Kurast Docktown",
    "Spider Forest",
    "Great Marsh",
    "Flayer Jungle",
    "Lower Kurast",
    "Kurast Bazaar",
    "Upper Kurast",
    "Kurast Causeway",
    "Travincal",
    "Spider Cave",
    "Spider Cavern",
    "Swampy Pit Level 1",
    "Swampy Pit Level 2",
    "Flayer Dungeon Level 1",
    "Flayer Dungeon Level 2",
    "Swampy Pit Level 3",
    "Flayer Dungeon Level 3",
    "Sewers Level 1",
    "Sewers Level 2",
    "Ruined Temple",
    "Disused Fane",
    "Forgotten Reliquary",
    "Forgotten Temple",
    "Ruined Fane",
    "Disused Reliquary",
    "Durance Of Hate Level 1",
    "Durance Of Hate Level 2",
    "Durance Of Hate Level 3",
    "The Pandemonium Fortress",
    "Outer Steppes",
    "Plains Of Despair",
    "City Of The Damned",
    "River Of Flame",
    "Chaos Sanctuary",
    "Harrogath",
    "Bloody Foothills",
    "Frigid Highlands",
    "Arreat Plateau",
    "Crystalline Passage",
    "Frozen River",
    "Glacial Trail",
    "Drifter Cavern",
    "Frozen Tundra",
    "Ancient's Way",
    "Icy Cellar",
    "Arreat Summit",
    "Nihlathak's Temple",
    "Halls Of Anguish",
    "Halls Of Pain",
    "Halls Of Vaught",
    "Abaddon",
    "Pit Of Acheron",
    "Infernal Pit",
    "Worldstone Keep Level 1",
    "Worldstone Keep Level 2",
    "Worldstone Keep Level 3",
    "Throne Of Destruction",
    "The Worldstone Chamber",
    "Matron's Den",
    "Forgotten Sands",
    "Furnace of Pain",
    "Tristram"
  ];

  /** @param {number} area */
  const getAreaName = function (area) {
    if (["number", "string"].indexOf(typeof area) === -1) return "undefined";
    if (typeof area === "string") return area;
    return (areaNames[area] || "undefined");
  };

  /**
   * Utility function to fix error tracing for getPresetUnit(s)
   * @param {Error} err
   * @param {number} area
   * @param {number} id
   */
  const rewriteStack = function (err, area, id) {
    let stack = err.stack.match(/[^\r\n]+/g);
    let fileNameAndLine = stack[1].substring(stack[1].lastIndexOf("\\") + 1);
    let [fileName, line] = fileNameAndLine.split(":");
    err.message += " Area: " + area + " Id: " + id;
    err.fileName = fileName;
    err.lineNumber = line;
    err.stack = err.stack.split("\n").slice(1).join("\n");
  };

  const Game = {
    getDistance: function (...args) {
      switch (args.length) {
      case 0:
        return Infinity;
      case 1:
        // getDistance(unit) - returns distance that unit is from me
        if (typeof args[0] !== "object") return Infinity;
        if (!args[0].hasOwnProperty("x")) return Infinity;
        return Math.sqrt(Math.pow((me.x - args[0].x), 2) + Math.pow((me.y - args[0].y), 2));
      case 2:
        // getDistance(x, y) - returns distance x, y is from me
        // getDistance(unitA, unitB) - returns distace unitA is from unitB
        if (typeof args[0] === "number" && typeof args[1] === "number") {
          return Math.sqrt(Math.pow((me.x - args[0]), 2) + Math.pow((me.y - args[1]), 2));
        } else if (typeof args[0] === "object" && typeof args[1] === "object") {
          if (!args[1].hasOwnProperty("x")) return Infinity;
          return Math.sqrt(Math.pow((args[0].x - args[1].x), 2) + Math.pow((args[0].y - args[1].y), 2));
        }
        return Infinity;
      case 3:
        // getDistance(unit, x, y) - returns distance x, y is from unit
        if (typeof args[2] !== "number") return Infinity;
        if (!args[0].hasOwnProperty("x")) return Infinity;
        return Math.sqrt(Math.pow((args[0].x - args[1]), 2) + Math.pow((args[0].y - args[2]), 2));
      case 4:
        // getDistance(x1, y1, x2, y2)
        if (typeof args[0] !== "number" || typeof args[3] !== "number") return Infinity;
        return Math.sqrt(Math.pow((args[0] - args[2]), 2) + Math.pow((args[1] - args[3]), 2));
      default:
        return Infinity;
      }
    },
    /**
     * @returns {ItemUnit | undefined} item on cursor
     */
    getCursorUnit: function () {
      return getUnit(100);
    },
    /**
     * @returns {ItemUnit | undefined} item cursor is hovering over
     */
    getSelectedUnit: function () {
      return getUnit(101);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {Player}
     */
    getPlayer: function (id, mode, gid) {
      return getUnit(sdk.unittype.Player, id, mode, gid);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {Monster}
     */
    getMonster: function (id, mode, gid) {
      return getUnit(sdk.unittype.Monster, id, mode, gid);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {Monster}
     */
    getNPC: function (id, mode, gid) {
      return getUnit(sdk.unittype.NPC, id, mode, gid);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {ObjectUnit}
     */
    getObject: function (id, mode, gid) {
      return getUnit(sdk.unittype.Object, id, mode, gid);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {Missile}
     */
    getMissile: function (id, mode, gid) {
      return getUnit(sdk.unittype.Missile, id, mode, gid);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {ItemUnit}
     */
    getItem: function (id, mode, gid) {
      return getUnit(sdk.unittype.Item, id, mode, gid);
    },
    /**
     * @param {number | string} [id] 
     * @param {number} [mode] 
     * @param {number} [gid] 
     * @returns {Tile}
     */
    getStairs: function (id, mode, gid) {
      return getUnit(sdk.unittype.Stairs, id, mode, gid);
    },
    /**
     * @param {number} area 
     * @param {number} id 
     * @returns {PresetUnit} 
     */
    getPresetMonster: function (area, id) {
      !area && (area = me.area);
      try {
        return getPresetUnit(area, sdk.unittype.Monster, id);
      } catch (e) {
        rewriteStack(e, area, id);
        throw e;
      }
    },
    /**
     * @param {number} area 
     * @param {number} id 
     * @returns {PresetUnit[]} 
     */
    getPresetMonsters: function (area, id) {
      !area && (area = me.area);
      try {
        return getPresetUnits(area, sdk.unittype.Monster, id);
      } catch (e) {
        rewriteStack(e, area, id);
        throw e;
      }
    },
    /**
     * @param {number} area 
     * @param {number} id 
     * @returns {PresetUnit} 
     */
    getPresetObject: function (area, id) {
      !area && (area = me.area);
      try {
        return getPresetUnit(area, sdk.unittype.Object, id);
      } catch (e) {
        rewriteStack(e, area, id);
        throw e;
      }
    },
    /**
     * @param {number} area 
     * @param {number} id 
     * @returns {PresetUnit[]} 
     */
    getPresetObjects: function (area, id) {
      !area && (area = me.area);
      try {
        return getPresetUnits(area, sdk.unittype.Object, id);
      } catch (e) {
        rewriteStack(e, area, id);
        throw e;
      }
    },
    /**
     * @param {number} area 
     * @param {number} id 
     * @returns {PresetUnit} 
     */
    getPresetStair: function (area, id) {
      !area && (area = me.area);
      try {
        return getPresetUnit(area, sdk.unittype.Stairs, id);
      } catch (e) {
        rewriteStack(e, area, id);
        throw e;
      }
    },
    /**
     * @param {number} area 
     * @param {number} id 
     * @returns {PresetUnit[]} 
     */
    getPresetStairs: function (area, id) {
      !area && (area = me.area);
      try {
        return getPresetUnits(area, sdk.unittype.Stairs, id);
      } catch (e) {
        rewriteStack(e, area, id);
        throw e;
      }
    },
  };

  const Sort = {
    // Sort units by comparing distance between the player
    units: function (a, b) {
      return Math.round(getDistance(me.x, me.y, a.x, a.y)) - Math.round(getDistance(me.x, me.y, b.x, b.y));
    },

    // Sort preset units by comparing distance between the player (using preset x/y calculations)
    presetUnits: function (a, b) {
      return getDistance(me, a.roomx * 5 + a.x, a.roomy * 5 + a.y)
        - getDistance(me, b.roomx * 5 + b.x, b.roomy * 5 + b.y);
    },

    // Sort arrays of x,y coords by comparing distance between the player
    points: function (a, b) {
      return getDistance(me, a[0], a[1]) - getDistance(me, b[0], b[1]);
    },

    numbers: function (a, b) {
      return a - b;
    }
  };

  const Messaging = {
    sendToScript: function (name, msg) {
      let script = getScript(name);

      if (script && script.running) {
        script.send(msg);

        return true;
      }

      return false;
    },

    sendToProfile: function (profileName, mode, message, getResponse = false) {
      let response;

      function copyDataEvent (mode2, msg) {
        if (mode2 === mode) {
          let obj;

          try {
            obj = JSON.parse(msg);
          } catch (e) {
            return false;
          }

          if (obj.hasOwnProperty("sender") && obj.sender === profileName) {
            response = copyObj(obj);
          }

          return true;
        }

        return false;
      }

      getResponse && addEventListener("copydata", copyDataEvent);

      if (!sendCopyData(null, profileName, mode, JSON.stringify({ message: message, sender: me.profile }))) {
        //console.log("sendToProfile: failed to get response from " + profileName);
        getResponse && removeEventListener("copydata", copyDataEvent);

        return false;
      }

      if (getResponse) {
        delay(200);
        removeEventListener("copydata", copyDataEvent);

        if (!!response) {
          return response;
        }

        return false;
      }

      return true;
    }
  };

  return {
    getThreads: getThreads,
    getUnits: getUnits,
    clickItemAndWait: clickItemAndWait,
    clickUnitAndWait: clickUnitAndWait,
    PacketBuilder: PacketBuilder,
    getAreaName: getAreaName,
    Game: Game,
    Sort: Sort,
    Messaging: Messaging,
    ScriptError: ScriptError,
  };
}));
