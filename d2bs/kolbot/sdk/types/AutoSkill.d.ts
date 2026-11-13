export {};

declare global {
  // A [skillId, maxHardPoints, satisfy?] entry of AutoSkill.skillBuildOrder; satisfy
  // defaults to true when omitted (see AutoSkill.skillToAdd in AutoSkill.js).
  type AutoSkillBuildEntry = [number, number, boolean?];

  // Value shape of the global `AutoSkill` const in AutoSkill.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface AutoSkill {
    skillBuildOrder: AutoSkillBuildEntry[];
    save: number;
    remaining: number;
    count: number;
    needPreReq(skillid: number): number | false;
    skillCheck(skillid: number, count: number): boolean;
    skillToAdd(inputArray: AutoSkillBuildEntry[]): number | false;
    allocate(): boolean;
    init(skillBuildOrder: AutoSkillBuildEntry[], save?: number): boolean;
  }
}
