export {};
declare global {
  namespace Skill {
    let usePvpRange: boolean;
    const manaCostList: object;
    const needFloor: number[];
    const missileSkills: number[];
    const charges: any[];
    
    function getClassSkillRange(classid?: number): [number, number];
    function init(): void;
    function canUse(skillId: number): boolean;
    function getDuration(skillId: number): number;
    function getMaxSummonCount(skillId: number): number;
    function getRange(skillId: number): number;
    function getAoE(skillId: number): number;
    function getHand(skillId: number): number;
    function getState(skillId: number): number;
    function getManaCost(skillId: number): number;
    function isTimed(skillId: number): boolean;
    function townSkill(skillId: number): boolean;
    function missileSkill(skillId: number): boolean;
    function wereFormCheck(skillId: number): boolean;
    function setSkill(skillId: number, hand?: number, item?: any): boolean;
    function shapeShift(mode: number | string): boolean;
    function unShift(): boolean;
    function useTK(unit: Unit): boolean;
    function cast(skillId: number, hand?: number, x?: number, y?: number, item?: ItemUnit | undefined): boolean;
    function cast(skillId: number, hand?: number, unit?: Unit): boolean;
  }
}
