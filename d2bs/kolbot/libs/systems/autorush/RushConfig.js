/**
*  @filename    RushConfig.js
*  @author      theBGuy
*  @desc        Configuration file for AutoRush system
*
*/

(function (module) {
  /** @enum */
  const RushModes = {
    /** The rushee that does the quests */
    quester: 0,
    /** The rushee that follows */
    follower: 1,
    /** The rushee that bumps the quester */
    bumper: 2,
    /** Autorush mode */
    rusher: 3,
    /** ControlBot/Chant scripts mode */
    chanter: 4,
    /** Manual follow mode - disables some of the bot <-> bot communication we need with auto */
    manual: 5,
  };

  const AutoRush = {
    /** Command by rusher to tell players to enter a portal */
    playersIn: "1",
    /** Command by rusher to tell players to go back to town */
    playersOut: "2",
    allIn: "3",
    rushMode: RushModes.rusher,
    /** How long to wait for a player to leave/enter an area before ending quest script with failed */
    playerWaitTimeout: Time.minutes(1),
    /** controls the order */
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

  /** @type {Object.<string, DefaultConfig}>} */
  const RushConfig = {
    "example-quester": {
      type: RushModes.quester,
      startProfiles: ["example-bumper"],
      /** Optional - Fill this out to create a account/character if it doesn't exist already */
      create: {
        account: "testacc",
        password: "password",
        charName: "quester",
        charInfo: "scl-sorc",
      }
    },
    "example-follower": {
      type: RushModes.follower,
      leader: "example-quester",
      create: {
        charName: "follower",
        charInfo: "scl-zon",
      }
    },
    "example-bumper": {
      type: RushModes.bumper,
      leader: "example-quester",
    },
    "example-rusher": {
      type: RushModes.rusher,
      leader: "example-quester",
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
    },
  };

  const _defaultConfig = {
    /** @type {RushModes} */
    type: RushModes.quester,
    /** @type {string[]} */
    startProfiles: [],
    /** @type {string} */
    leader: "",
    /** @type {Object} */
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
    /** @type {Object} */
    config: {
      /** @type {number} */
      WaitPlayerCount: 1,
      /** @type {boolean} */
      Cain: true,
      /** @type {boolean} */
      Radament: true,
      /** @type {boolean} */
      LamEsen: true,
      /** @type {boolean} */
      Izual: true,
      /** @type {boolean} */
      Shenk: true,
      /** @type {boolean} */
      Anya: true,
      /** @type {Object} */
      Ancients: {
        /** @type {boolean} */
        Normal: true,
        /** @type {boolean} */
        Nightmare: true,
        /** @type {boolean} */
        Hell: false,
      },
      /** @type {boolean} */
      Wps: false,
      /** @type {string} */
      LastRun: "",
    },
  };

  for (let key in RushConfig) {
    RushConfig[key] = Object.assign({}, _defaultConfig, RushConfig[key]);
  }

  module.exports = {
    AutoRush: AutoRush,
    RushModes: RushModes,
    RushConfig: RushConfig,
  };
})(module);
