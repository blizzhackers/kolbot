export {};
declare global {
  /**
   * Definition of a single runeword recipe, as constructed by RunewordObj in
   * libs/core/GameData/RuneData.js.
   */
  interface RunewordDefinition {
    name: string;
    sockets: number;
    runes: number[];
    itemTypes: number[];
    _ladder: boolean;
    reqLvl: number;
    /** Returns true if we are unable to make the runeword because we are not on ladder. */
    ladderRestricted(): boolean;
  }

  // Back-compat alias: sdk/types/Config.d.ts, libs/core/Runewords.js,
  // libs/core/GameData/RuneData.js, and libs/SoloPlay/Core/RunewordsOverrides.js still reference
  // the lowercase type name `runeword` - keep it resolving to the same shape.
  type runeword = RunewordDefinition;

  // Value shape of the global `Runeword` const in libs/core/Runewords.js. Unlike a Pattern-1
  // global, `Runeword` isn't a literal object declared in that file - it's `require()`d from
  // libs/core/GameData/RuneData.js, whose module.exports is built inside an IIFE module factory.
  // There's no single top-level declaration site to bind via JSDoc @type, so the ambient const
  // declaration stays here.
  interface IRuneword {
    AncientsPledge: RunewordDefinition;
    Black: RunewordDefinition;
    Fury: RunewordDefinition;
    HolyThunder: RunewordDefinition;
    Honor: RunewordDefinition;
    KingsGrace: RunewordDefinition;
    Leaf: RunewordDefinition;
    Lionheart: RunewordDefinition;
    Lore: RunewordDefinition;
    Malice: RunewordDefinition;
    Melody: RunewordDefinition;
    Memory: RunewordDefinition;
    Nadir: RunewordDefinition;
    Radiance: RunewordDefinition;
    Rhyme: RunewordDefinition;
    Silence: RunewordDefinition;
    Smoke: RunewordDefinition;
    Stealth: RunewordDefinition;
    Steel: RunewordDefinition;
    Strength: RunewordDefinition;
    Venom: RunewordDefinition;
    Wealth: RunewordDefinition;
    White: RunewordDefinition;
    Zephyr: RunewordDefinition;
    Beast: RunewordDefinition;
    Bramble: RunewordDefinition;
    BreathoftheDying: RunewordDefinition;
    CallToArms: RunewordDefinition;
    ChainsofHonor: RunewordDefinition;
    Chaos: RunewordDefinition;
    CrescentMoon: RunewordDefinition;
    Delirium: RunewordDefinition;
    Doom: RunewordDefinition;
    Duress: RunewordDefinition;
    Enigma: RunewordDefinition;
    Eternity: RunewordDefinition;
    Exile: RunewordDefinition;
    Famine: RunewordDefinition;
    Gloom: RunewordDefinition;
    HandofJustice: RunewordDefinition;
    HeartoftheOak: RunewordDefinition;
    Kingslayer: RunewordDefinition;
    Passion: RunewordDefinition;
    Prudence: RunewordDefinition;
    Sanctuary: RunewordDefinition;
    Splendor: RunewordDefinition;
    Stone: RunewordDefinition;
    Wind: RunewordDefinition;
    Brand: RunewordDefinition;
    Death: RunewordDefinition;
    Destruction: RunewordDefinition;
    Dragon: RunewordDefinition;
    Dream: RunewordDefinition;
    Edge: RunewordDefinition;
    Faith: RunewordDefinition;
    Fortitude: RunewordDefinition;
    Grief: RunewordDefinition;
    Harmony: RunewordDefinition;
    Ice: RunewordDefinition;
    Infinity: RunewordDefinition;
    Insight: RunewordDefinition;
    LastWish: RunewordDefinition;
    Lawbringer: RunewordDefinition;
    Oath: RunewordDefinition;
    Obedience: RunewordDefinition;
    Phoenix: RunewordDefinition;
    Pride: RunewordDefinition;
    Rift: RunewordDefinition;
    Spirit: RunewordDefinition;
    VoiceofReason: RunewordDefinition;
    Wrath: RunewordDefinition;
    Bone: RunewordDefinition;
    Enlightenment: RunewordDefinition;
    Myth: RunewordDefinition;
    Peace: RunewordDefinition;
    Principle: RunewordDefinition;
    Rain: RunewordDefinition;
    Treachery: RunewordDefinition;
    Test: RunewordDefinition;

    findByName(name: string): RunewordDefinition | undefined;
    findByRune(rune: number): RunewordDefinition[];
    findByType(type: number): RunewordDefinition[];
    addRuneword(
      name: string,
      sockets: number,
      runes: number | number[],
      itemTypes: number | number[]
    ): RunewordDefinition | false;
  }

  const Runeword: IRuneword;

  // Value shape of the global `Runewords` const in libs/core/Runewords.js (bound there via
  // JSDoc @type). Declaring the const here as well would collide: both files are global scripts.
  // Ambient value declaration (Skill/Attack/Misc precedent): the checker leaves some
  // @type-bound js consts unresolved or any (cause undiagnosed); the ambient const
  // restores resolution and empirically does not collide with the js declaration.
  const Runewords: IRunewords;

  interface IRunewords {
    needList: number[];
    // NTIP.ParseLineInt is ambient-typed as returning `boolean` (sdk/types/NTIP.d.ts), but at
    // runtime returns null or a parsed-line object - that type isn't precise yet, so this is a
    // last-resort placeholder until NTIP.d.ts's owner fixes it.
    pickitEntries: unknown[];
    validGids: number[];
    init(): void;
    validItem(item: ItemUnit): boolean;
    buildLists(): void;
    update(classid: number, gid: number): void;
    checkRunewords(): ItemUnit[] | false;
    checkItem(unit: ItemUnit): boolean;
    keepItem(unit: ItemUnit): boolean;
    getBase(runeword: RunewordDefinition, base: ItemUnit | number, ethFlag?: number, reroll?: boolean): ItemUnit | false;
    socketItem(base: ItemUnit, rune: ItemUnit): boolean;
    getScroll(): ItemUnit | false;
    makeRunewords(): boolean;
    rerollRunewords(): boolean;
  }
}
