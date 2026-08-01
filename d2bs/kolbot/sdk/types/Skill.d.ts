export {};
declare global {
  class SkillDataInfo {
    skillId: number;
    hand: number;
    state: number;
    summonType: number;
    summonCount: () => number;
    condition: () => boolean;
    townSkill: boolean;
    timed: boolean;
    missleSkill: boolean;
    aura: boolean;
    charClass: number;
    reqLevel: number;
    preReqs: number[];
    damageType: string;
    private _range: number | (() => number);
    private _AoE: () => number;
    private _duration: () => number;
    private _manaCost: number;
    private _mana: number;
    private _minMana: number;
    private _lvlMana: number;
    private _manaShift: number;
    private _bestSlot: number;
    private _dmg: number;
    private _hardPoints: number;
    private _softPoints: number;
    private _checked: boolean;

    constructor(skillId: number);

    duration(): number;
    manaCost(): number;
    range(pvpRange?: boolean): number;
    AoE(): number;
    have(): boolean;
    reset(): void;
  }

  type Charge = {
    skill: number;
    level: number;
    charges: number;
    maxcharges: number;
  };
  
  class ChargedSkill {
    skill: number;
    level: number;
    charges: number;
    maxCharges: number;
    gid: number;
    unit: ItemUnit;
    update(item: ItemUnit): void;
  }

  // Value shape of the global `Skill` const in Skill.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Skill {
    usePvpRange: boolean;
    readonly haveTK: boolean;
    needFloor: number[];
    missileSkills: number[];
    charges: ChargedSkill[];

    get(skillId: number): SkillDataInfo | null;
    getClassSkillRange(classid?: number): [number, number];
    getCharges(): boolean;
    init(): void;
    canUse(skillId: number): boolean;
    getDuration(skillId: number): number;
    getMaxSummonCount(skillId: number): number;
    getSummonType(skillId: number): number;
    getRange(skillId: number): number;
    getAoE(skillId: number): number;
    getHand(skillId: number): number;
    getState(skillId: number): number;
    getCharClass(skillId: number): number;
    getSkillTab(skillId: number): number;
    getManaCost(skillId: number): number;
    isTimed(skillId: number): boolean;
    townSkill(skillId: number): boolean;
    missileSkill(skillId: number): boolean;
    isAura(skillId: number): boolean;
    wereFormCheck(skillId: number): boolean;
    usableOn(skillId: number, unit: Monster): boolean;
    setSkill(skillId: number, hand?: number, item?: ItemUnit): boolean;
    shapeShift(mode: number | string): boolean;
    unShift(): boolean;
    useTK(unit: Unit): boolean;
    cast(
      skillId: number,
      hand?: number,
      x?: number | Unit | IPathNode | null,
      y?: number | null,
      item?: ItemUnit | null,
      weaponSlot?: number,
    ): boolean;
    castCharges(skillId: number, unit: Unit | { x: number, y: number }): boolean;
  }

  // Pattern 2, unlike its libs/core siblings: Skill.js builds the object inside an IIFE and
  // publishes it via `global.Skill = Skill` (Skill.js:778), so there is no top-level js
  // binding to @type-annotate and this ambient const cannot collide.
  const Skill: Skill;
}
