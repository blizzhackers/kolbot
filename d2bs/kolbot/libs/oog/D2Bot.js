/**
*  @filename    D2Bot.js
*  @author      kolton, D3STROY3R, theBGuy
*  @desc        UMD module to handle interfacing with D2Bot#
*
*/

!isIncluded("Polyfill.js") && include("Polyfill.js");
includeIfNotIncluded("oog/DataFile.js");

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    let v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "../modules/CopyData"], factory);
  } else {
    root.D2Bot = factory();
  }
}([].filter.constructor("return this")(), function() {
  const CopyData = require("../modules/CopyData");

  const D2Bot = {
    handle: 0,
    _entry: "",

    /**
     * Picks up the D2Bot# window handle from the profile's datafile and the current script's
     * entry (.dbj) filename.
     * @returns {number} The D2Bot# window handle (0 if not yet known).
     */
    init: function () {
      // Pick up handle updates, in case the instance is taken over by a new manager.
      addEventListener("copydata", function (mode, msg) {
        if (msg === "Handle" && typeof mode === "number") {
          D2Bot.handle = mode;
        }
      });

      let handle = DataFile.getStats().handle;

      if (handle) {
        D2Bot.handle = handle;

        let tmp = getThreads().find((thread) => thread.name.endsWith(".dbj"));
        if (tmp) {
          // Remove .dbj
          D2Bot._entry = tmp.name.split(".")[0];
        }
      }

      return D2Bot.handle;
    },

    /**
     * @param {number | string} handle
     * @param {number} mode
     * @param {string} msg
     */
    sendMessage: function (handle, mode, msg) {
      sendCopyData(null, handle, mode, msg);
    },

    /**
     * @param {string} msg
     * @param {number} [color]
     * @param {string} [tooltip]
     * @param {string} [trigger]
     */
    printToConsole: function (msg, color, tooltip, trigger) {
      const printObj = {
        msg: (("(" + D2Bot._entry + ") ") + (new Date().dateStamp() + " ") + msg),
        color: color || 0,
        tooltip: tooltip || "",
        trigger: trigger || ""
      };

      new CopyData().data("printToConsole", [printObj]).send();
    },

    /** @param {D2BotItemLogPayload} itemObj */
    printToItemLog: function (itemObj) {
      new CopyData().data("printToItemLog", [itemObj]).send();
    },

    /** @param {D2BotItemLogPayload} itemObj */
    uploadItem: function (itemObj) {
      new CopyData().data("uploadItem", [itemObj]).send();
    },

    /**
     * @param {string} filename
     * @param {string} msg
     */
    writeToFile: function (filename, msg) {
      new CopyData().data("writeToFile", [filename, msg]).send();
    },

    /**
     * @param {string} ircProfile
     * @param {string} recepient
     * @param {string} msg
     */
    postToIRC: function (ircProfile, recepient, msg) {
      new CopyData().data("postToIRC", [ircProfile, recepient, msg]).send();
    },

    /** @param {boolean} mode */
    ircEvent: function (mode) {
      new CopyData().data("ircEvent", [mode ? "true" : "false"]).send();
    },

    /** @param {string} msg */
    notify: function (msg) {
      new CopyData().data("notify", [msg]).send();
    },

    /** @param {D2BotItemLogPayload} itemObj */
    saveItem: function (itemObj) {
      new CopyData().data("saveItem", [itemObj]).send();
    },

    /** @param {string} msg */
    updateStatus: function (msg) {
      new CopyData().data("updateStatus", [msg]).send();
    },

    /**
     * Signals D2Bot# to refresh the runs counter display for this profile.
     */
    updateRuns: function () {
      new CopyData().data("updateRuns", []).send();
    },

    /**
     * Signals D2Bot# to refresh the chickens counter display for this profile.
     */
    updateChickens: function () {
      new CopyData().data("updateChickens", []).send();
    },

    /**
     * Signals D2Bot# to refresh the deaths counter display for this profile.
     */
    updateDeaths: function () {
      new CopyData().data("updateDeaths", []).send();
    },

    /**
     * Requests the current game info snapshot from D2Bot#.
     */
    requestGameInfo: function () {
      new CopyData().data("requestGameInfo", []).send();
    },

    /** @param {boolean} [keySwap] */
    restart: function (keySwap) {
      new CopyData().data(
        "restartProfile",
        arguments.length > 0 ? [me.profile, keySwap] : [me.profile]
      ).send();
    },

    /**
     * Notifies D2Bot# that the CD key is already in use by another instance.
     */
    CDKeyInUse: function () {
      new CopyData().data("CDKeyInUse", []).send();
    },

    /**
     * Notifies D2Bot# that the CD key has been disabled.
     */
    CDKeyDisabled: function () {
      new CopyData().data("CDKeyDisabled", []).send();
    },

    /**
     * Notifies D2Bot# of a realm-down condition ("CD Key Realm Down") for the current CD key.
     */
    CDKeyRD: function () {
      new CopyData().data("CDKeyRD", []).send();
    },

    /**
     * profile is meant to be the profile name, but several call sites pass the release flag
     * positionally instead (D2Bot.stop(true)).
     * @param {string | boolean} [profile]
     * @param {boolean} [release]
     */
    stop: function (profile, release) {
      !profile && (profile = me.profile);

      new CopyData().data("stop", [profile, release ? "True" : "False"]).send();
    },

    /** @param {string} profile */
    start: function (profile) {
      new CopyData().data("start", [profile]).send();
    },

    /** @param {string} profile */
    startSchedule: function (profile) {
      new CopyData().data("startSchedule", [profile]).send();
    },

    /** @param {string} profile */
    stopSchedule: function (profile) {
      new CopyData().data("stopSchedule", [profile]).send();
    },

    /**
     * Signals D2Bot# to increment the run count for the current profile.
     */
    updateCount: function () {
      new CopyData().data("updateCount", ["1"]).send();
    },

    /**
     * @param {string} msg
     * @param {number} mode
     */
    shoutGlobal: function (msg, mode) {
      new CopyData().data("shoutGlobal", [msg, mode]).send();
    },

    /**
     * Sends a heartbeat ping to D2Bot# on the dedicated 0xbbbb mode.
     */
    heartBeat: function () {
      new CopyData().mode(0xbbbb).data("heartBeat", []).send();
    },

    /**
     * @param {number} wparam
     * @param {number} lparam
     */
    sendWinMsg: function (wparam, lparam) {
      new CopyData().data("winmsg", [wparam, lparam]).send();
    },

    /**
     * Sends the raw window message sequence D2Bot# uses to detect that the client is in a game.
     */
    ingame: function () {
      this.sendWinMsg(0x0086, 0x0000);
      this.sendWinMsg(0x0006, 0x0002);
      this.sendWinMsg(0x001c, 0x0000);
    },

    /**
     * Profile to profile communication
     * @param {string} profile 
     * @param {string} gameName 
     * @param {number} gameCount 
     * @param {string} gamePass 
     * @param {string} isUp 
     * @param {number} delay 
     */
    joinMe: function (profile, gameName, gameCount, gamePass, isUp, delay) {
      let obj = {
        gameName: (gameName + gameCount).toLowerCase(),
        gamePass: (gamePass).toLowerCase(),
        inGame: isUp === "yes",
        delay: (delay || 0),
      };

      sendCopyData(null, profile, 1, JSON.stringify(obj));
    },

    /** @param {string} profile */
    requestGame: function (profile) {
      new CopyData().handle(profile).mode(3).send();
    },

    /**
     * Requests the current profile object from D2Bot#.
     */
    getProfile: function () {
      new CopyData().data("getProfile", []).send();
    },

    /**
     * @param {string} account
     * @param {string} password
     * @param {string} character
     * @param {string} difficulty
     * @param {string} realm
     * @param {string} infoTag
     * @param {string} gamePath
     */
    setProfile: function (account, password, character, difficulty, realm, infoTag, gamePath) {
      new CopyData().data(
        "setProfile",
        [account, password, character, difficulty, realm, infoTag, gamePath]
      ).send();
    },

    /** @param {string} tag */
    setTag: function (tag) {
      new CopyData().data("setTag", [tag]).send();
    },

    // Store info in d2bot# cache
    /** @param {unknown} info Arbitrary payload cached by D2Bot# keyed to the current profile. */
    store: function (info) {
      this.remove();

      new CopyData().data("store", [me.profile, info]).send();
    },

    // Get info from d2bot# cache
    /**
     * Requests the cached info for the current profile from D2Bot#.
     */
    retrieve: function () {
      new CopyData().data("retrieve", [me.profile]).send();
    },

    // Delete info from d2bot# cache
    /**
     * Deletes the cached info for the current profile from D2Bot#.
     */
    remove: function () {
      new CopyData().data("delete", [me.profile]).send();
    }
  };

  return D2Bot;
}));
