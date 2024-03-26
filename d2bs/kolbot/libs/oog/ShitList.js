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
    /** @type {Array<string>} */
    shitlist: []
  },
  _path: "logs/shitlist.json",
  _list: new Set(),

  /**
   * @private
   * @returns {{ shitlist: Array<string> }}}
   */
  create: function () {
    let string = JSON.stringify(this._default);
    FileAction.write(this._path, string);

    return Object.assign({}, this._default);
  },

  reset: function () {
    let string = JSON.stringify(this._default);
    FileAction.write(this._path, string);
    this._list.clear();

    return Object.assign({}, this._default);
  },

  /**
   * @private
   * @returns {{ shitlist: Array<string> }}}
   */
  getObj: function () {
    let obj;
    let string = FileAction.read(this._path);

    try {
      obj = JSON.parse(string);
    } catch (e) {
      obj = this.create();
    }

    if (obj) {
      return obj;
    }

    console.warn("Failed to read ShitList. Using null values");

    return Object.assign({}, this._default);
  },

  /** @param {Array<string>} name */
  read: function () {
    if (!FileTools.exists(this._path)) {
      return this.create().shitlist;
    }
    let obj = this.getObj();
    if (!this._list.size) {
      obj.shitlist.forEach(name => this._list.add(name));
    }
    return obj.shitlist;
  },

  /** @param {string} name */
  add: function (name) {
    let obj = this.getObj();
    if (obj.shitlist.includes(name)) return;
    obj.shitlist.push(name);
    this._list.add(name);

    let string = JSON.stringify(obj);

    FileAction.write(this._path, string);
  },

  /** @param {string} name */
  remove: function (name) {
    let obj = this.getObj();
    let index = obj.shitlist.indexOf(name);
    if (index === -1) return false;
    obj.shitlist.splice(index, 1);
    this._list.delete(name);

    let string = JSON.stringify(obj);

    FileAction.write(this._path, string);
    return true;
  },

  /** @param {string} name */
  has: function (name) {
    return this._list.has(name);
  }
};
