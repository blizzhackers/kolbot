/**
*  @filename    RushConstants.js
*  @author      theBGuy
*  @desc        Constants for AutoRush system - no touchy
*
*/

(function (module) {
  /** @const */
  const RushModes = {
    /**
     * The rushee that does the quests
     */
    quester: 0,
    /**
     * The rushee that follows
     */
    follower: 1,
    /**
     * The rushee that bumps the quester
     */
    bumper: 2,
    /**
     * Autorush mode
     */
    rusher: 3,
    /**
     * ControlBot/Chant scripts mode
     */
    chanter: 4,
    /**
     * Manual follow mode - disables some of the bot <-> bot communication we need with auto
     */
    manual: 5,
  };

  const AutoRush = {
    /**
     * Command by rusher to tell players to enter a portal
     */
    playersIn: "1",
    /**
     * Command by rusher to tell players to go back to town
     */
    playersOut: "2",
    allIn: "3",
    rushMode: RushModes.rusher,
    /**
     * How long to wait for a player to leave/enter an area before ending quest script with failed
     */
    playerWaitTimeout: Time.minutes(1),
    /**
     * controls the order
     */
    sequences: [
      "cain",
      "andariel",
      "radament",
      "cube",
      "amulet",
      "staff",
      "summoner",
      "duriel",
      "lamesen",
      "travincal",
      "mephisto",
      "izual",
      "diablo",
      "shenk",
      "anya",
      "ancients",
      "baal",
      "givewps",
    ],
  };

  /** @type {Object.<string, {check: function(): boolean}>} */
  const sequenceCheck = {
    cain: {
      /** @returns {boolean} Whether Deckard Cain has been rescued. */
      check: function () {
        return me.cain;
      }
    },
    andariel: {
      /** @returns {boolean} Whether Andariel has been killed. */
      check: function () {
        return me.andariel;
      }
    },
    radament: {
      /** @returns {boolean} Whether Radament has been killed. */
      check: function () {
        return me.radament;
      }
    },
    cube: {
      /** @returns {boolean} Whether the Horadric Cube has been picked up. */
      check: function () {
        return !!me.cube;
      }
    },
    amulet: {
      /** @returns {boolean} Whether the Horadric amulet ingredient has been obtained. */
      check: function () {
        return (me.horadricstaff || me.amulet || me.completestaff);
      }
    },
    staff: {
      /** @returns {boolean} Whether the Horadric staff ingredient has been obtained. */
      check: function () {
        return (me.horadricstaff || me.shaft || me.completestaff);
      }
    },
    summoner: {
      /** @returns {boolean} Whether the Summoner has been killed. */
      check: function () {
        return me.summoner;
      }
    },
    duriel: {
      /** @returns {boolean} Whether Duriel has been killed. */
      check: function () {
        return me.duriel;
      }
    },
    lamesen: {
      /** @returns {boolean} Whether the Lam Esen's Tome quest has been completed. */
      check: function () {
        return me.lamessen;
      }
    },
    travincal: {
      /** @returns {boolean} Whether the Travincal (Compelling Orb) quest has been completed. */
      check: function () {
        return me.travincal;
      }
    },
    mephisto: {
      /** @returns {boolean} Whether Mephisto has been killed. */
      check: function () {
        return me.mephisto;
      }
    },
    izual: {
      /** @returns {boolean} Whether Izual has been killed. */
      check: function () {
        return me.izual;
      }
    },
    diablo: {
      /** @returns {boolean} Whether Diablo has been killed. */
      check: function () {
        return me.diablo;
      }
    },
    shenk: {
      /** @returns {boolean} Whether Shenk the Overseer has been killed. */
      check: function () {
        return me.shenk;
      }
    },
    anya: {
      /** @returns {boolean} Whether Anya has been rescued or the Prison of Ice scroll obtained. */
      check: function () {
        return me.anya || Misc.checkQuest(sdk.quest.id.PrisonofIce, 8/** Recieved the scroll */);
      }
    },
    ancients: {
      /** @returns {boolean} Whether the Ancients' Way quest has been completed. */
      check: function () {
        return me.ancients;
      }
    },
    baal: {
      /** @returns {boolean} Whether Baal has been killed. */
      check: function () {
        return me.baal;
      }
    },
  };

  const _defaultRusheeConfig = {
    /** @type {RushModes} */
    type: RushModes.quester,
    /** @type {string[]} */
    startProfiles: [],
    leader: "",
    create: {
      /** @type {string} */
      account: "",
      /** @type {string} */
      password: "",
      /** @type {string} */
      charName: "",
      /**
       * @type {string}
       * @desc Format: "scl-sorc" - "scl" = softcore ladder, "sorc" = sorceress
       */
      charInfo: "",
    },
    config: {
      /**
       * Rusher in game character name
       */
      Leader: "",
    }
  };

  const _defaultRusherConfig = {
    /** @type {RushModes.rusher} */
    type: RushModes.rusher,
    /**
     * How long to wait for a player to leave/enter an area before ending quest script with failed
     */
    playerWaitTimeout: Time.minutes(1),
    config: {
      WaitPlayerCount: 1,
      Cain: true,
      Radament: true,
      LamEsen: true,
      Izual: true,
      Shenk: true,
      Anya: true,
      Ancients: {
        Normal: true,
        Nightmare: true,
        Hell: false,
      },
      Wps: false,
      LastRun: "",
    },
    /** @type {string[]} */
    startProfiles: [],
    allowPickit: true,
  };

  /**
   * Merge defaults into a single rush profile while preserving nested defaults.
   * Mutates the passed profile so other consumers of RushConfig[me.profile] see normalized values.
   * @param {DefaultConfig} rushProfile
   * @returns {DefaultConfig}
   */
  function normalizeRushProfileConfig (rushProfile) {
    let mergedProfile;

    if (rushProfile.type === RushModes.rusher) {
      mergedProfile = Object.assign({}, _defaultRusherConfig, rushProfile);
      mergedProfile.config = Object.assign(
        {},
        _defaultRusherConfig.config,
        rushProfile.config ? rushProfile.config : {}
      );
      mergedProfile.config.Ancients = Object.assign(
        {},
        _defaultRusherConfig.config.Ancients,
        rushProfile.config && rushProfile.config.Ancients ? rushProfile.config.Ancients : {}
      );
    } else {
      mergedProfile = Object.assign({}, _defaultRusheeConfig, rushProfile);
      mergedProfile.create = Object.assign(
        {},
        _defaultRusheeConfig.create,
        rushProfile.create ? rushProfile.create : {}
      );
      // Keep existing access pattern in rushConfigInit where Config.Leader reads rushProfile.config.Leader.
      mergedProfile.config = Object.assign({}, rushProfile.config ? rushProfile.config : {});
    }

    mergedProfile.startProfiles = Array.isArray(mergedProfile.startProfiles)
      ? mergedProfile.startProfiles.slice(0)
      : [];

    Object.keys(rushProfile).forEach(function (key) {
      delete rushProfile[key];
    });

    Object.assign(rushProfile, mergedProfile);

    return rushProfile;
  }

  /** @param {DefaultConfig} rushProfile */
  function rushConfigInit (rushProfile) {
    if (!rushProfile) {
      throw new Error("No rush config found for this profile. Please create one in RushConfig.js");
    }

    normalizeRushProfileConfig(rushProfile);

    // disabling all other scripts so nothing interfers
    Object.keys(Scripts).forEach(function (script) {
      Scripts[script] = false;
    });

    if (rushProfile.type === RushModes.rusher) {
      Scripts.Rusher = true;
      if (!rushProfile.allowPickit) {
        Pickit.enabled = false;
      }
    } else {
      Scripts.Rushee = true;
      Config.Leader = rushProfile.config.Leader
        ? rushProfile.config.Leader
        : /** TODO: iterate config & try to find rusher profile with our game leader */ rushProfile.rusherProfile
          ? (function () {
            // we've been passed the rushers profile name so lets try to determine thier in game name
            if (FileTools.exists("data/" + rushProfile.rusherProfile + ".json")) {
              let string = FileAction.read("data/" + rushProfile.rusherProfile + ".json");

              if (string) {
                let obj = JSON.parse(string);

                if (obj && obj.hasOwnProperty("name")) {
                  return obj.name;
                }
              }
            }
            return "";
          })()
          : "";
      Pickit.enabled = false;
    }

    const { RushConfig } = require("./RushConfig");

    // everyone except main rushee
    if (me.profile !== rushProfile.leader) {
      Config.QuitList.push(rushProfile.leader);
    } else {
      Object.keys(RushConfig).forEach(function (profile) {
        if (
          // is a rusher type profile
          RushConfig[profile].type === RushModes.rusher
          // we are thier game maker
          && RushConfig[profile].leader === me.profile
        ) {
          Config.QuitList.push(profile);
        }
      });
    }
    Config.QuitList = Config.QuitList.filter(function (el) {
      return !!el;
    });

    Config.QuitListMode = 1;
    !Config.PublicMode && (Config.PublicMode = true);
    !Config.LocalChat.Enabled && (Config.LocalChat.Enabled = true);
    if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
      // so we don't get the warning
      Config.AttackSkill[1] = 0;
      Config.AttackSkill[3] = 0;
    }
    Config.MFLeader = false;
    Config.Gamble = false;
  }

  module.exports = {
    RushModes: RushModes,
    AutoRush: AutoRush,
    sequenceCheck: sequenceCheck,
    normalizeRushProfileConfig: normalizeRushProfileConfig,
    rushConfigInit: rushConfigInit,
  };
})(typeof module === "undefined" ? this.AutoRushConstants = {} : module);
