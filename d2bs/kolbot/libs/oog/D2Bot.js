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

    init: function () {
      let handle = DataFile.getStats().handle;

      if (handle) {
        D2Bot.handle = handle;
      }

      return D2Bot.handle;
    },

    sendMessage: function (handle, mode, msg) {
      sendCopyData(null, handle, mode, msg);
    },

    printToConsole: function (msg, color, tooltip, trigger) {
      let printObj = {
        msg: ((new Date().dateStamp() + " ") + msg),
        color: color || 0,
        tooltip: tooltip || "",
        trigger: trigger || ""
      };

      new CopyData().data("printToConsole", [printObj]).send();
    },

    printToItemLog: function (itemObj) {
      new CopyData().data("printToItemLog", [itemObj]).send();
    },

    uploadItem: function (itemObj) {
      new CopyData().data("uploadItem", [itemObj]).send();
    },

    writeToFile: function (filename, msg) {
      new CopyData().data("writeToFile", [filename, msg]).send();
    },

    postToIRC: function (ircProfile, recepient, msg) {
      new CopyData().data("postToIRC", [ircProfile, recepient, msg]).send();
    },

    ircEvent: function (mode) {
      new CopyData().data("ircEvent", [mode ? "true" : "false"]).send();
    },

    notify: function (msg) {
      new CopyData().data("notify", [msg]).send();
    },

    saveItem: function (itemObj) {
      new CopyData().data("saveItem", [itemObj]).send();
    },

    updateStatus: function (msg) {
      new CopyData().data("updateStatus", [msg]).send();
    },

    updateRuns: function () {
      new CopyData().data("updateRuns", []).send();
    },

    updateChickens: function () {
      new CopyData().data("updateChickens", []).send();
    },

    updateDeaths: function () {
      new CopyData().data("updateDeaths", []).send();
    },

    requestGameInfo: function () {
      new CopyData().data("requestGameInfo", []).send();
    },

    restart: function (keySwap) {
      new CopyData().data(
        "restartProfile",
        arguments.length > 0 ? [me.profile, keySwap] : [me.profile]
      ).send();
    },

    CDKeyInUse: function () {
      new CopyData().data("CDKeyInUse", []).send();
    },

    CDKeyDisabled: function () {
      new CopyData().data("CDKeyDisabled", []).send();
    },

    CDKeyRD: function () {
      new CopyData().data("CDKeyRD", []).send();
    },

    stop: function (profile, release) {
      !profile && (profile = me.profile);

      new CopyData().data("stop", [profile, release ? "True" : "False"]).send();
    },

    start: function (profile) {
      new CopyData().data("start", [profile]).send();
    },

    startSchedule: function (profile) {
      new CopyData().data("startSchedule", [profile]).send();
    },

    stopSchedule: function (profile) {
      new CopyData().data("stopSchedule", [profile]).send();
    },

    updateCount: function () {
      new CopyData().data("updateCount", ["1"]).send();
    },

    shoutGlobal: function (msg, mode) {
      new CopyData().data("shoutGlobal", [msg, mode]).send();
    },

    heartBeat: function () {
      new CopyData().mode(0xbbbb).data("heartBeat", []).send();
    },

    sendWinMsg: function (wparam, lparam) {
      new CopyData().data("winmsg", [wparam, lparam]).send();
    },

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

    requestGame: function (profile) {
      new CopyData().handle(profile).mode(3).send();
    },

    getProfile: function () {
      new CopyData().data("getProfile", []).send();
    },

    setProfile: function (account, password, character, difficulty, realm, infoTag, gamePath) {
      new CopyData().data(
        "setProfile",
        [account, password, character, difficulty, realm, infoTag, gamePath]
      ).send();
    },

    setTag: function (tag) {
      new CopyData().data("setTag", [tag]).send();
    },

    // Store info in d2bot# cache
    store: function (info) {
      this.remove();

      new CopyData().data("store", [me.profile, info]).send();
    },

    // Get info from d2bot# cache
    retrieve: function () {
      new CopyData().data("retrieve", [me.profile]).send();
    },

    // Delete info from d2bot# cache
    remove: function () {
      new CopyData().data("delete", [me.profile]).send();
    }
  };

  return D2Bot;
}));
