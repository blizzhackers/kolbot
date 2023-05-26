/**
*  @filename    ShitList.js
*  @author      kolton, D3STROY3R, theBGuy
*  @desc        Maintain shitlist of griefers
*
*/

!isIncluded("Polyfill.js") && include("Polyfill.js");
includeIfNotIncluded("oog/FileAction.js");

const ShitList = {
  _default: {
    shitlist: []
  },
  create: function () {
    let string = JSON.stringify(this._default);

    FileAction.write("shitlist.json", string);

    return obj;
  },

  getObj: function () {
    let obj;
    let string = FileAction.read("shitlist.json");

    try {
      obj = JSON.parse(string);
    } catch (e) {
      obj = this.create();
    }

    if (obj) {
      return obj;
    }

    console.warn("Failed to read ShitList. Using null values");

    return this._default;
  },

  read: function () {
    !FileTools.exists("shitlist.json") && this.create();
		
    let obj = this.getObj();

    return obj.shitlist;
  },

  add: function (name) {
    let obj = this.getObj();

    obj.shitlist.push(name);

    let string = JSON.stringify(obj);

    FileAction.write("shitlist.json", string);
  }
};
