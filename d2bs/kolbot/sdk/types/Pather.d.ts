export {};
declare global {
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
  namespace Pather {
    const wpAreas: number[];
    let walkDistance: number;
    let teleDistance: number;
    let teleport: boolean;
    const cancelFlags: number[];
    let recursion: boolean;
    let lastPortalTick: 0;
    let allowBroadcast: boolean;

    function getWalkDistance(x: number, y: number, area?: number, xx?: number, yy?: number, reductionType?: 0 | 1 | 2, radius?: number): number;
    function useTeleport(): boolean;
    function moveTo(x: number, y: number, retry?: number | undefined, clearPath?: boolean | undefined, pop?: boolean | undefined): boolean;
    function teleportTo(x: any, y: any, maxRange?: any): void;
    function walkTo(x: any, y: any, minDist?: number | undefined): boolean;
    function openDoors(x: any, y: any): boolean;
    function moveToUnit(unit: PathNode, offX?: undefined, offY?: undefined, clearPath?: undefined, pop?: undefined): boolean;
    function moveToPreset(area: any, unitType: any, unitId: any, offX?: any, offY?: any, clearPath?: any, pop?: any): boolean;
    function moveToPresetObject(area: number, unitId: number, givenSettings?: PathSettings): boolean;
    function moveToPresetMonster(area: number, unitId: number, givenSettings?: PathSettings): boolean;
    function moveToExit(targetArea: any, use?: any, givenSettings?: PathSettings): boolean;
    function getDistanceToExit(area?: number, exit?: number): number;
    function getExitCoords(area?: number, exit?: number): PathNode | false;
    function getNearestRoom(area: number): [number, number] | false;
    function openExit(targetArea: number): boolean;
    function openUnit(type: number, id: number): void;
    function useUnit(type: any, id: any, targetArea: any): boolean;
    function broadcastIntent(targetArea: number): void;
    function useWaypoint(targetArea: number | null | "random", check?: boolean): boolean;
    function makePortal(use?: boolean | undefined): ObjectUnit | boolean;
    function usePortal(targetArea?: number | null, owner?: string | undefined, unit?: undefined): boolean;
    function getPortal(targetArea: number, owner?: any): ObjectUnit | false;
    function getNearestWalkable(
      x: number, y: number, range: number, step: number, coll: number, size?: number
    ): [number, number] | false;
    function checkSpot(
      x: number, y: number, coll: number, cacheOnly: boolean, size: number
    ): boolean;
    /** @deprecated use `me.accessToAct(act)` instead */
    function accessToAct(act: number): boolean;
    function getWP(area: number, clearPath?: boolean): boolean;
    function journeyTo(area: number): boolean;
    function plotCourse(dest: number, src: number): false | { course: number[], useWP: boolean };
    function areasConnected(src: number, dest: number): void;
  }
}
