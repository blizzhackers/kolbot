/**
*  @filename    CharRefresher.js
*  @author      theBGuy
*  @desc        Refresh characters so they don't expire, for setup @see RefresherConfig.js
*
*  @typedef {import("../../../sdk/globals")}
*/

/** @type {import("./CharRefresher").CharRefresherType} */
const CharRefresher = {
  LobbyTime: [15, 30],
  /**
   * @param {string} hash 
   * @returns {string}
   */
  load: function (hash) {
    let filename = "data/secure/" + hash + ".txt";
    if (!FileTools.exists(filename)) {
      throw new Error("File " + filename + " does not exist!");
    }
    return FileTools.readText(filename);
  },

  /**
   * @param {string} hash 
   * @param {string} data 
   */
  save: function (hash, data) {
    let filename = "data/secure/" + hash + ".txt";
    FileTools.writeText(filename, data);
  },

  remove: function () {
    FileTools.remove("logs/CharRefresher.json");
  },
};
