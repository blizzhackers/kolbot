/**
*  @filename    DataFile.js
*  @author      kolton, D3STROY3R, theBGuy
*  @desc        Maintain profile datafiles
*
*/

!isIncluded("Polyfill.js") && include("Polyfill.js");
includeIfNotIncluded("oog/FileAction.js");

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    let v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.DataFile = factory();
  }
}(this, function () {
  const DataFile = {
    _default: {
      handle: 0,
      name: "",
      level: 0,
      experience: 0,
      gold: 0,
      deaths: 0,
      runs: 0,
      lastArea: "",
      ingameTick: 0,
      gameName: "",
      currentGame: "",
      nextGame: ""
    },

    create: function () {
      FileAction.write("data/" + me.profile + ".json", JSON.stringify(this._default, null, 2));

      return this._default;
    },

    /**
     * @param {string} profile 
     * @returns {DataFileObj | null}
     */
    read: function (profile) {
      if (!profile) return null;
      if (!FileTools.exists("data/" + profile + ".json")) return null;
      let string = FileAction.read("data/" + profile + ".json");

      try {
        let obj = JSON.parse(string);
        return obj;
      } catch (e) {
        console.error(e);

        return null;
      }
    },

    getObj: function () {
      !FileTools.exists("data/" + me.profile + ".json") && DataFile.create();
      
      let obj;
      let string = FileAction.read("data/" + me.profile + ".json");

      try {
        obj = JSON.parse(string);
      } catch (e) {
        // If we failed, file might be corrupted, so create a new one
        obj = this.create();
        obj.handle = D2Bot.handle;
      }

      if (obj) {
        return obj;
      }

      console.warn("Error reading DataFile. Using null values.");

      return this._default;
    },

    getStats: function () {
      let obj = this.getObj();
      return clone(obj);
    },

    updateStats: function (arg, value) {
      while (me.ingame && !me.gameReady) {
        delay(100);
      }

      let statArr = [];

      if (Array.isArray(arg)) {
        statArr = arg.slice();
      } else if (typeof arg === "string") {
        statArr.push(arg);
      }

      let obj = this.getObj();

      for (let prop of statArr) {
        switch (prop) {
        case "experience":
          obj.experience = me.getStat(sdk.stats.Experience);
          obj.level = me.getStat(sdk.stats.Level);

          break;
        case "lastArea":
          if (obj.lastArea === getAreaName(me.area)) {
            return;
          }

          obj.lastArea = getAreaName(me.area);

          break;
        case "gold":
          if (!me.gameReady) {
            break;
          }

          obj.gold = me.getStat(sdk.stats.Gold) + me.getStat(sdk.stats.GoldBank);

          break;
        case "name":
          obj.name = me.charname;

          break;
        case "currentGame":
          obj.currentGame = me.ingame ? me.gamename : "";

          break;
        case "ingameTick":
          obj.ingameTick = getTickCount();

          break;
        case "deaths":
          obj.deaths = (obj.deaths || 0) + 1;

          break;
        default:
          obj[prop] = value;

          break;
        }
      }

      let string = JSON.stringify(obj, null, 2);

      FileAction.write("data/" + me.profile + ".json", string);
    }
  };

  return DataFile;
}));
