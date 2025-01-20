declare global {
  enum RushModes {
    quester = 0,
    follower = 1,
    bumper = 2,
    rusher = 3,
    chanter = 4,
    manual = 5,
  }
  type DefaultConfig = {
    type: RushModes;
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
  };
  type RushConfig = {
    [key: string]: DefaultConfig;
  };
}
export {};
