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
}(this, function() {
  const DataFile = {
    _default: {
      runs: 0,
      experience: 0,
      deaths: 0,
      lastArea: "",
      gold: 0,
      level: 0,
      name: "",
      gameName: "",
      ingameTick: 0,
      handle: 0,
      nextGame: ""
    },

    create: function () {
      FileAction.write("data/" + me.profile + ".json", JSON.stringify(this._default));

      return this._default;
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

      typeof arg === "object" && (statArr = arg.slice());
      typeof arg === "string" && statArr.push(arg);

      let obj = this.getObj();

      for (let i = 0; i < statArr.length; i += 1) {
        switch (statArr[i]) {
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
          obj.name = me.name;

          break;
        case "ingameTick":
          obj.ingameTick = getTickCount();

          break;
        case "deaths":
          obj.deaths = (obj.deaths || 0) + 1;

          break;
        default:
          obj[statArr[i]] = value;

          break;
        }
      }

      let string = JSON.stringify(obj);

      FileAction.write("data/" + me.profile + ".json", string);
    }
  };

  return DataFile;
}));
