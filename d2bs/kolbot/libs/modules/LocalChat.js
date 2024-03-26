/**
 * @filename    LocalChat.js
 * @author      theBGuy
 * @desc        UMD module for LocalChat system
 * 
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "../core/Util"], factory);
  } else {
    root.LocalChat = factory();
    console.trace();
  }
}(this, function() {
  // const { PacketBuilder } = require("../core/Util");

  const LocalChat = new function () {
    const LOCAL_CHAT_ID = 0xD2BAAAA;
    let toggle, proxy = say;

    let relay = (msg) => D2Bot.shoutGlobal(
      JSON.stringify({ msg: msg, realm: me.realm, charname: me.charname, gamename: me.gamename }),
      LOCAL_CHAT_ID
    );

    let onChatInput = (speaker, msg) => {
      relay(msg);
      return true;
    };

    let onChatRecv = (mode, msg) => {
      if (mode !== LOCAL_CHAT_ID) return;

      msg = JSON.parse(msg);

      if (me.gamename === msg.gamename && me.realm === msg.realm) {
        new PacketBuilder().byte(38).byte(1, me.locale).word(2, 0, 0).byte(90).string(msg.charname, msg.msg).get();
      }
    };

    let onKeyEvent = (key) => {
      if (toggle === key) {
        this.init(true);
      }
    };

    this.init = (cycle = false) => {
      if (!Config.LocalChat.Enabled) return;

      Config.LocalChat.Mode = (Config.LocalChat.Mode + cycle) % 3;
      print("ÿc2LocalChat enabled. Mode: " + Config.LocalChat.Mode);

      switch (Config.LocalChat.Mode) {
      case 2:
        removeEventListener("chatinputblocker", onChatInput);
        addEventListener("chatinputblocker", onChatInput);
        // eslint-disable-next-line no-fallthrough
      case 1:
        removeEventListener("copydata", onChatRecv);
        addEventListener("copydata", onChatRecv);
        say = (msg, force = false) => force ? proxy(msg) : relay(msg);
        break;
      case 0:
        removeEventListener("chatinputblocker", onChatInput);
        removeEventListener("copydata", onChatRecv);
        say = proxy;
        break;
      }

      if (Config.LocalChat.Toggle) {
        toggle = typeof Config.LocalChat.Toggle === "string"
          ? Config.LocalChat.Toggle.charCodeAt(0)
          : Config.LocalChat.Toggle;
        Config.LocalChat.Toggle = false;
        addEventListener("keyup", onKeyEvent);
      }
    };
  };

  return LocalChat;
}));
