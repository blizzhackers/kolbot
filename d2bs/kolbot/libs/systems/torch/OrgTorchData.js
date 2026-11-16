/**
*  @filename    OrgTorchData.js
*  @author      theBGuy
*  @desc        Data file handling for OrgTorch.js
*
*/

(function (module) {
  /**
   * @typedef {Object} OrgTorchDataObject
   * @property {string} gamename - The name of the game.
   * @property {string} gamepassword - The password for the game.
   * @property {number} active - The index of the active area.
   * @property {Array<number>} doneAreas - An array of completed areas.
   */
  
  const OrgTorchData = {
    _path: "data/" + me.profile + "/orgtorch.json",
    /** @type {OrgTorchDataObject} */
    _default: { gamename: "", gamepassword: "", active: -1, doneAreas: [] },

    /** @returns {boolean} True if this profile's OrgTorch data file exists. */
    exists: function () {
      return FileTools.exists(this._path);
    },
      
    /** @returns {OrgTorchDataObject} A freshly-written default data object for the current game. */
    create: function () {
      if (!FileTools.exists("data/" + me.profile)) {
        let folder = dopen("data");
        folder.create(me.profile);
      }

      const obj = Object.assign({}, this._default);

      if (me.gamename) {
        obj.gamename = me.gamename;
      }

      if (me.gamepassword) {
        obj.gamepassword = me.gamepassword;
      }

      FileAction.write(this._path, JSON.stringify(obj));
      return obj;
    },

    /** @returns {OrgTorchDataObject} */
    read: function () {
      try {
        return FileAction.parse(this._path);
      } catch (e) {
        return this._default;
      }
    },

    /** @param {Partial<OrgTorchDataObject>} newData */
    update: function (newData) {
      let data = this.read();
      Object.assign(data, newData);
      FileTools.writeText(this._path, JSON.stringify(data));
    },

    /** @returns {boolean} True if this profile's OrgTorch data file was deleted. */
    remove: function () {
      return FileTools.remove(this._path);
    }
  };

  module.exports = OrgTorchData;
})(module);
