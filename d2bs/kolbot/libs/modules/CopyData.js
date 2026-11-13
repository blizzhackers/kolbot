/**
 * @filename    CopyData.js
 * @author      theBGuy
 * @desc        UMD module for creating and sending a copy data obj
 * 
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.CopyData = factory();
    console.trace();
  }
}([].filter.constructor("return this")(), function() {
  /**
  * @class
  * @classdesc A class for creating and sending copy data packets.
  * @property {number} _mode - Defaults to 0, works for most D2Bot functions
  * @property {number | string} _handle - Defaults to value of D2Bot.handle, works for any D2Bot
  * functions that act on ourselves
  * @example <caption>Request a game from "scl-sorc-001" profile</caption>
  * new CopyData().handle("scl-sorc-001").mode(3).send();
  * @example <caption>Start mule profile "mule"</caption>
  * new CopyData().data("start", ["mule"]).send();
  */
  function CopyData() {
    if (this.__proto__.constructor !== CopyData) throw new Error("CopyData must be called with 'new' operator!");

    /**
    * @private
    * @type {string | number} - The handle to send the copy data to.
    */
    this._handle = D2Bot.handle || me.profile;

    /**
    * @private
    * @type {number} - The mode of the copy data packet.
    */
    this._mode = 0;

    /** 
    * @private
    * @type {string} - The data to send in the copy data
    */
    this._data = null;
  }

  /**
  * - D2Bot.handle is for any functions that act on ourselves
  * - Otherwise it is the D2Bot# profile name of the profile to act upon
  * @param {string | number} handle - The handle or profile to send the copy data to.
  */
  CopyData.prototype.handle = function (handle) {
    this._handle = handle;
    return this;
  };

  /** 
  * - 0 is for most functions, and the default value set
  * - 1 is for joinMe
  * - 3 is for requestGame
  * - 0xbbbb is for heartBeat
  * @param {number} mode - The mode of the copy data packet.
  */
  CopyData.prototype.mode = function (mode) {
    this._mode = mode;
    return this;
  };

  /**
  * @param {string} [func] - The function to call from D2Bot#
  * @param {string[]} [args] - The additonal info needed for the function call
  */
  CopyData.prototype.data = function (func = "", args = []) {
    if (func.includes("Item") || func === "printToConsole" || (func === "setTag" && typeof args[0] === "object")) {
      args[0] = JSON.stringify(args[0]);
    }
    this._data = JSON.stringify({
      profile: me.profile,
      func: func,
      args: args
    });
    return this;
  };

  /**
   * CopyData.data works for functions call d2bot# functions but what about gerneral use?
   * @todo handle passing custom data obj 
   */

  CopyData.prototype.send = function () {
    // check that data is set
    this._data === null && this.data();
    return sendCopyData(null, this._handle, this._mode, this._data);
  };

  return CopyData;
}));
