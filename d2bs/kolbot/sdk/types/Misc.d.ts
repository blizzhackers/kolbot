export {};

declare global {
  // Value shape of the global `Misc` const in Misc.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Misc {
    _diabloSpawned: boolean;
    screenshotErrors: boolean;
    errorConsolePrint: boolean;
    shrineStates: number[] | null;
    _shrinerIgnore: Set<number>;
    lastShrine: {
      tick: number;
      duration: number;
      type: number;
      state: number;
      update(unit: ObjectUnit): void;
      remaining(): number;
      isMyCurrentState(): boolean;
    };

    click(button: number, shift: number, x?: number | Unit, y?: number): boolean;
    inMyParty(name: string): boolean;
    findPlayer(name: string): Party | false;
    getPlayerUnit(name: string): Player | false;
    getPlayerAct(player: Party | string): number | false;
    getNearbyPlayerCount(): number;
    getPlayerCount(): number;
    getPartyCount(): number;
    getPartyMembers(): Party[];
    checkPartyLevel(levelCheck?: number, exclude?: string | string[]): boolean;
    getPlayerArea(player: Party | string): number | false;
    autoLeaderDetect(givenSettings?: {
      destination?: number | number[];
      quitIf?: (area: number) => boolean;
      timeout?: number;
    }): string | false;
    openChest(unit: Unit | number): boolean;
    openChestsInArea(area?: number, chestIds?: number[]): boolean;
    openChests(range?: number): boolean;
    _wantShrine(shrine: ObjectUnit): boolean;
    _wantWell(): boolean;
    shriner(ignore?: number[], range?: number): boolean;
    scanShrines(range: number, ignore: number[]): boolean;
    getShrine(unit: ObjectUnit): boolean;
    getShrinesInArea(area: number, type: number, use: boolean): boolean;
    /** @deprecated */
    townCheck(): boolean;
    spy(name: string): boolean;
    errorReport(error: Error | string, script?: string): void;
    debugLog(msg: string): void;
    useMenu(id: number): boolean;
    poll<T>(check: () => T, timeout?: number, sleep?: number, useNativeDelay?: boolean): T | false;
    getUIFlags(excluded?: number[]): number[] | null;
    checkQuest(id: number, state: number): 0 | 1;
    getQuestStates(questId: number): number[];
  }

  // Ambient value declaration (Skill.d.ts precedent): checker resolution of the @type-bound
  // js const yields any for this symbol (unlike Pather/Experience - cause undiagnosed);
  // the ambient const restores member typing and empirically does not TS2451.
  const Misc: Misc;
}
