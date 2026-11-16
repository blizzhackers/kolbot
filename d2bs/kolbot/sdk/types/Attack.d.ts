declare global {
  type DamageType = "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt";

  interface AttackResult {
    FAILED: 0;
    SUCCESS: 1;
    CANTATTACK: 2; // need to fix the ambiguity between this result and Failed
    NEEDMANA: 3;
    NOOP: 4; // used for clearing, if we didn't find any monsters to clear it's not exactly a success or fail
    FAILED_POSITION: 5;
  }

  interface SecurePositionOptions {
    range?: number;
    timer?: number;
    skipBlocked?: boolean;
    useRedemption?: boolean;
    skipIds?: number[];
    /**
     * @default 300000 (5 minutes)
     * @description Timeout in milliseconds for attempting to secure area.
     */
    timeout?: number;
  }

  /** Options object for {@link Attack.clearEx} - see the `ClearOptions` typedef in Attack.js. */
  interface ClearOptions {
    spectype: number;
    bossId: number | Unit;
    sortfunc: (a: Monster, b: Monster) => number;
    pickit: boolean;
    filter: (unit: Monster) => boolean;
    /** Called on each iteration of the main loop */
    onLoop: () => void;
    /** If returns true, exit the clearing loop. Called on each iteration of the main loop */
    earlyExit: () => boolean;
    /** Called after all clearing is complete */
    onCleared: () => void;
  }

  // Value shape of the global `Attack` const in Attack.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Attack {
    infinity: boolean;
    auradin: boolean;
    monsterObjects: Set<number>;
    Result: AttackResult;
    _killed: Set<number | string>;
    /** Count of unique/superunique monsters seen this area, set lazily by {@link countUniques}. */
    uniques?: number;
    /** gids of superuniques already counted by {@link countUniques}, set lazily. */
    ignoredGids?: number[];
    haveKilled(id: number | string): boolean;
    init(notify?: boolean): void;
    checkSlot(slot?: 0 | 1): boolean;
    getPrimarySlot(): 0 | 1;
    getCustomAttack(unit: Monster): boolean | [number, number];
    getCustomPreAttack(unit: Monster): boolean | [number, number];
    checkInfinity(): boolean;
    checkAuradin(): boolean;
    canTeleStomp(unit: Monster | Player): boolean;
    kill(classId: Monster | number | string): boolean;
    hurt(classId: string | number | Unit, percent: number): boolean;
    getScarinessLevel(unit: Unit): number | undefined;
    /**
     * @todo Refactor so this can accept prebuilt monsterlist, we have repeat logic with this and clearList
     * @description Clear monsters in a section based on range and spectype or clear monsters around a boss monster
     */
    clear(
      range?: number,
      spectype?: number,
      bossId?: number | Unit,
      sortfunc?: (a: Monster, b: Monster) => number,
      pickit?: boolean,
      shouldAttackCb?: (unit: Monster) => boolean,
    ): AttackResult;
    /** @description Clear monsters in a section based on range and spectype or clear monsters around a boss monster */
    clearEx(range: number, opts?: Partial<ClearOptions>): boolean;
    clearClassids(...ids: number[]): boolean;
    getMob(
      classid: number | string | number[],
      spectype: number,
      range?: number,
      center?:
        | Unit
        | {
            x: number;
            y: number;
          },
    ): Monster[];
    clearList(mainArg: Function | Monster[], sortFunc?: Function, refresh?: boolean): boolean;

    securePosition(x: number, y: number, options?: SecurePositionOptions): boolean;
    countUniques(): void;
    storeStatistics(area: number): void;
    /** @description Clear an entire area based on monster spectype using nearestNeighbourSearch */
    clearLevelWalk(spectype: number, cb?: () => boolean): void;
    clearRoom(room: Room, spectype?: number): boolean;
    clearLevel(spectype?: number, cb?: () => boolean): boolean;
    sortMonsters(unitA: Monster, unitB: Monster): number;
    validSpot(x: number, y: number, skill?: number, unitid?: number): boolean;
    /** @deprecated Use Misc.openChests instead */
    openChests(range: number, x?: number, y?: number): boolean;
    buildMonsterList(check?: (unit: Monster) => boolean): [] | Monster[];
    findSafeSpot(
      unit: Unit,
      distance: number,
      spread: number,
      range: number,
    ): IPathNode | false;
    deploy(unit: Unit, distance: number, spread: number, range: number): boolean;
    getMonsterCount(x: number, y: number, range: number, list: Monster[]): number;
    buildGrid(
      xmin: number,
      xmax: number,
      ymin: number,
      ymax: number,
      spread: number,
    ): {
      x: number;
      y: number;
      coll: number;
    }[];
    skipCheck(unit: Monster): boolean;
    getSkillElement(
      skillId: number,
    ): false | "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none";
    getResist(
      unit: Unit | Monster,
      type: "physical" | "fire" | "lightning" | "magic" | "cold" | "poison" | "holybolt" | "none",
    ): number;
    getLowerResistPercent(): number;
    getConvictionPercent(): number;
    checkResist(unit: Monster | Player, val: number | DamageType | "none" | false, maxres?: number): boolean;
    canAttack(unit: Monster): boolean;
    usingBow(): false | "bow" | "crossbow";
    getIntoPosition(unit: Unit, distance: number, coll: number, walk?: boolean | 2, force?: boolean): boolean;
    getNearestMonster(givenSettings?: {
      skipBlocked?: boolean;
      skipImmune?: boolean;
      skipGid?: number;
    }): Monster | false;
    checkCorpse(unit: Monster): boolean;
    checkNearCorpses(unit: Monster, range?: number): Monster[];
    whirlwind(unit: Monster | Player): boolean;
    doPreAttack(unit: Monster): AttackResult;
    doChargeCast(unit: Monster): boolean;
  }

  // Ambient value declaration (Skill.d.ts precedent): checker resolution of the @type-bound
  // js const yields any for this symbol (unlike Pather/Experience - cause undiagnosed);
  // the ambient const restores member typing and empirically does not TS2451.
  const Attack: Attack;
}
export {};
