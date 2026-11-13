export {};

declare global {
  /** Instance shape produced by the local `PrecastSkill` constructor in libs/core/Precast.js. */
  interface PrecastSkill {
    skillId: number;
    state: number;
    lastCast: number;
    duration: number;
    /** @returns true if this skill can currently be used */
    canUse(): boolean;
    /** @returns percent of buff duration remaining, clamped to 0-100 */
    remaining(): number;
    /** @param percent threshold percent remaining below which a recast is needed */
    needSoon(percent?: number): boolean;
    /**
     * @param force treat as needing cast regardless of state/duration
     * @param percent threshold percent remaining passed to {@link PrecastSkill.needSoon}
     */
    needToCast(force?: boolean, percent?: number): boolean;
    /** Records the current tick as the last cast time. */
    update(): void;
  }

  /** Instance shape produced by the local `PrecastArmorSkill` constructor (Bone/Cyclone Armor). */
  interface PrecastArmorSkill extends PrecastSkill {
    /** Max Bone/Cyclone Armor absorb recorded as of the last cast. */
    max: number;
  }

  // Value shape of the global `Precast` const in libs/core/Precast.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Precast {
    enabled: boolean;
    coldArmor: number;
    shieldGid: number;
    /** -1 = unresolved, 0 = CTA on main weapon set, 1 = CTA on swap. */
    haveCTA: -1 | 0 | 1;
    /** Cache of {@link Precast.getBetterSlot} results, keyed by skill id. */
    bestSlot: Record<number, 0 | 1>;
    skills: Map<number, PrecastSkill | PrecastArmorSkill>;
    nonPacketSkills: Set<number>;

    /** @returns true once haveCTA has been resolved (cached after the first successful check) */
    checkCTA(): boolean;
    /** @param force */
    precastCTA(force?: boolean): boolean;
    /**
     * Check which slot (primary or secondary) gives us the most skillpoints in a skill
     * @param skillId
     * @returns best slot to give us the most skillpoints in a skill
     */
    getBetterSlot(skillId: number): 0 | 1;
    /**
     * @param skillId
     * @param x x coordinate, or a Unit to target
     * @param y y coordinate (ignored when x is a Unit)
     * @param allowSwitch allow switching to the weapon slot with the better skill roll
     * @returns false on failure, otherwise the skill's state (or true if stateless)
     */
    cast(skillId: number, x?: number | Unit, y?: number, allowSwitch?: boolean): boolean;
    /** Repeatedly casts a summon skill at random nearby spots until the minion count cap is reached. */
    summon(skillId: number, minionType: number): boolean;
    /** Recasts Enchant on the player and nearby party members/minions within range. */
    enchant(): boolean;
    /**
     * Handle precast related skills
     * @param force force re-cast of all precast skills
     * @param partial force re-cast of all state related precast skills
     * @returns sucessfully casted
     */
    doPrecast(force?: boolean, partial?: boolean): boolean;
    /** @returns true if any out-of-town-only precast skill (warcries or CTA) is available */
    needOutOfTownCast(): boolean;
    /**
     * @param force force re-cast of all precast skills
     * @param goToWhenDone area id to return to when done; defaults to the current area
     * @returns true if we ended up back at the target area
     */
    doRandomPrecast(force?: boolean, goToWhenDone?: number): boolean;
  }
}
