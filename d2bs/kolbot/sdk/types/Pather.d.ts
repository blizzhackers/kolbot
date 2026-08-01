export {};
declare global {
  interface PathDebug {
    enableHooks: boolean;
    paths: Map<number, Line[]>;
    drawPath(id: number, path: IPathNode[]): void;
    removeHooks(id: number): void;
    coordsInPath(path: IPathNode[], x: number, y: number): boolean;
  }

  interface PathSettings {
    allowNodeActions?: boolean;
    allowTeleport?: boolean;
    allowClearing?: boolean;
    allowTown?: boolean;
    allowPicking?: boolean;
    minDist?: number;
    retry?: number;
    pop?: boolean;
    returnSpotOnError?: boolean;
    callback?: () => void;
    clearSettings?: ClearSettings;
  }

  interface ClearSettings {
    clearPath?: boolean;
    range?: number;
    specType?: number;
    sort?: () => void;
  }
  // Value shape of the global `Pather` const in Pather.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Pather {
    wpAreas: number[];
    walkDistance: number;
    teleDistance: number;
    teleport: boolean;
    cancelFlags: number[];
    recursion: boolean;
    lastPortalTick: number;
    allowBroadcast: boolean;

    findSpotAtDistance(node: IPathNode, distance: number, maxAttempts?: number): IPathNode | false;
    getWalkDistance(
      x: number,
      y: number,
      area?: number,
      xx?: number,
      yy?: number,
      reductionType?: 0 | 1 | 2,
      radius?: number,
    ): number;
    useTeleport(): boolean;
    moveTo(
      x: number,
      y: number,
      retry?: number | undefined,
      clearPath?: boolean | undefined,
      pop?: boolean | undefined,
    ): boolean;
    teleportTo(x: number, y: number, maxRange?: number): boolean;
    walkTo(x: number, y: number, minDist?: number | undefined): boolean;
    openDoors(x: number, y: number): boolean;
    moveToUnit(
      unit: Unit | PresetUnit | { x: number; y: number },
      offX?: number,
      offY?: number,
      clearPath?: boolean,
      pop?: boolean,
    ): boolean;
    moveToPreset(
      area: number,
      unitType: number,
      unitId: number,
      offX?: number,
      offY?: number,
      clearPath?: boolean,
      pop?: boolean,
    ): boolean;
    moveToPresetObject(area: number, unitId: number, givenSettings?: PathSettings): boolean;
    moveToPresetMonster(area: number, unitId: number, givenSettings?: PathSettings): boolean;
    moveToExit(targetArea: number | number[], use?: boolean, givenSettings?: PathSettings): boolean;
    getDistanceToExit(area?: number, exit?: number): number;
    getExitCoords(area?: number, exit?: number): IPathNode | false;
    getNearestRoom(area: number): [number, number] | false;
    openExit(targetArea: number): boolean;
    openUnit(type: UnitType, id: number): boolean;
    useUnit(type: UnitType, id: number | string, targetArea: number): boolean;
    broadcastIntent(targetArea: number): void;
    useWaypoint(targetArea: number | null | "random", check?: boolean): boolean;
    makePortal(use?: boolean | undefined): ObjectUnit | boolean;
    usePortal(targetArea?: number | null, owner?: string | undefined, unit?: ObjectUnit): boolean;
    getPortal(targetArea: number | null, owner?: string | null): ObjectUnit | false;
    getNearestWalkable(
      x: number,
      y: number,
      range: number,
      step: number,
      coll: number,
      size?: number,
    ): [number, number] | false;
    checkSpot(x: number, y: number, coll: number, cacheOnly: boolean, size: number): boolean;
    /** @deprecated use `me.accessToAct(act)` instead */
    accessToAct(act: number): boolean;
    getWP(area: number, clearPath?: boolean): boolean;
    journeyTo(area: number): boolean;
    plotCourse(dest: number, src: number): false | { course: number[]; useWP: boolean };
    areasConnected(src: number, dest: number): boolean;
  }
}
