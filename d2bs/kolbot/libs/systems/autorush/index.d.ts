declare global {
  enum RushModes {
    quester = 0,
    follower = 1,
    bumper = 2,
    rusher = 3,
    chanter = 4,
    manual = 5,
  }
  type RusheeConfig = {
    type: RushModes.bumper | RushModes.quester | RushModes.follower;
    startProfiles: string[];
    leader: string;
    create: {
      account: string;
      password: string;
      charName: string;
      /**
       * @desc Format: "scl-sorc" - "scl" = softcore ladder, "sorc" = sorceress
       */
      charInfo: string;
    };
    config: {
      /** Rusher in game character name */
      Leader: string;
    };
  };
  type RusherConfig = {
    type: RushModes.rusher | RushModes.manual;
    /** How long to wait for a player to leave/enter an area before ending quest script with failed */
    playerWaitTimeout: number;
    config: {
      WaitPlayerCount: number;
      Cain: boolean;
      Radament: boolean;
      LamEsen: boolean;
      Izual: boolean;
      Shenk: boolean;
      Anya: boolean;
      Ancients: {
        Normal: boolean;
        Nightmare: boolean;
        Hell: boolean;
      };
      Wps: boolean;
      LastRun: string;
    };
    startProfiles: string[];
  };
  type DefaultConfig = RusheeConfig | RusherConfig;
  type RushConfig = {
    [key: string]: DefaultConfig;
  };
}
export {};
