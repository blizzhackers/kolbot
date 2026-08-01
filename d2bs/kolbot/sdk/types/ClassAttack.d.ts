type AttackModules =
  | SDK["player"]["class"]["Amazon"]
  | SDK["player"]["class"]["Assassin"]
  | SDK["player"]["class"]["Barbarian"]
  | SDK["player"]["class"]["Druid"]
  | SDK["player"]["class"]["Sorceress"]
  | SDK["player"]["class"]["Paladin"]
  | SDK["player"]["class"]["Necromancer"]
  | "Wereform";

declare global {
  interface IClassAttack {
    load: <M extends AttackModules>(moduleName: M) => IClassAttack[M];

    [sdk.player.class.Amazon]: typeof import("../../libs/core/Attacks/Amazon");
    [sdk.player.class.Assassin]: typeof import("../../libs/core/Attacks/Assassin");
    [sdk.player.class.Barbarian]: typeof import("../../libs/core/Attacks/Barbarian");
    [sdk.player.class.Druid]: typeof import("../../libs/core/Attacks/Druid");
    [sdk.player.class.Sorceress]: typeof import("../../libs/core/Attacks/Sorceress");
    [sdk.player.class.Paladin]: typeof import("../../libs/core/Attacks/Paladin");
    [sdk.player.class.Necromancer]: typeof import("../../libs/core/Attacks/Necromancer");
    Wereform: typeof import("../../libs/core/Attacks/Wereform");

    /**
     * @deprecated Use the specific class attack modules instead. ClassAttack[me.classid].doAttack(...)
     */
    doAttack: (unit: Monster | Player, preattack?: boolean) => AttackResult;
    /**
     * @deprecated Use the specific class attack modules instead. ClassAttack[me.classid].afterAttack()
     */
    afterAttack: () => void;
    /**
     * @deprecated Use the specific class attack modules instead. ClassAttack[me.classid].doCast(...)
     */
    doCast: (unit: Monster | Player, timedSkill: number, untimedSkill: number) => AttackResult;
  }
}
export {};
