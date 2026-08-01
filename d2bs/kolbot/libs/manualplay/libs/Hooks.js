/**
 * @typedef {import('./hooks/TextHooks')} TextHooks
 */

/** @type {Hooks} */
const Hooks = {
  dashBoard: { x: 113, y: 490 },
  portalBoard: { x: 12, y: 432 },
  qolBoard: { x: 545, y: 490 },
  resfix: { x: (me.screensize ? 0 : -160), y: (me.screensize ? 0 : -120) },
  saidMessage: false,
  userAddon: false,
  enabled: true,
  flushed: false,

  init: function () {
    let files = dopen("libs/manualplay/hooks/").getFiles();
    
    Array.isArray(files) && files
      .filter(file => file.endsWith(".js"))
      .forEach(function (x) {
        if (!isIncluded("manualplay/hooks/" + x)) {
          if (!include("manualplay/hooks/" + x)) {
            throw new Error("Failed to include " + "manualplay/hooks/" + x);
          }
        }
      });
  },

  update: function () {
    while (!me.gameReady) {
      delay(100);
    }

    if (!this.enabled) {
      Hooks.enabled = getUIFlag(sdk.uiflags.AutoMap);

      return;
    }

    ActionHooks.check();
    VectorHooks.check();
    MonsterHooks.check();
    ShrineHooks.check();
    ItemHooks.check();
    TextHooks.check();
    Hooks.flushed = false;
  },

  flush: function (flag) {
    if (Hooks.flushed === flag) return true;

    const invoFlagCheck = function () {
      return [sdk.uiflags.Stash, sdk.uiflags.Cube, sdk.uiflags.TradePrompt].every(function (el) {
        return !getUIFlag(el);
      });
    };

    if (flag === true) {
      Hooks.enabled = false;

      MonsterHooks.flush();
      ShrineHooks.flush();
      TextHooks.flush();
      VectorHooks.flush();
      ActionHooks.flush();
      ItemHooks.flush();
    } else {
      if (sdk.uiflags.Waypoint === flag) {
        VectorHooks.flush();
        TextHooks.displaySettings = false;
        TextHooks.check();
      } else if (sdk.uiflags.Inventory === flag && invoFlagCheck()) {
        ItemHooks.flush();
        TextHooks.check();
      } else {
        MonsterHooks.flush();
        ShrineHooks.flush();
        TextHooks.flush();
        VectorHooks.flush();
        ActionHooks.flush();
        ItemHooks.flush();
      }
    }

    Hooks.flushed = flag;

    return true;
  }
};
