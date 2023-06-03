export {};
declare global {
	namespace Pather {
		const wpAreas: number[];
		let walkDistance: number;
		let teleDistance: number;
		let teleport: boolean;
		const cancelFlags: number[];
		let recursion: boolean;
		let lastPortalTick: 0;
		function getWalkDistance(x: number, y: number, area?: number, xx?: number, yy?: number, reductionType?: 0 | 1 | 2, radius?: number): number;
		function useTeleport(): boolean;
		function moveTo(x: number, y: number, retry?: number | undefined, clearPath?: boolean | undefined, pop?: boolean | undefined): boolean;
		function teleportTo(x: any, y: any, maxRange?: any): void;
		function walkTo(x: any, y: any, minDist?: number | undefined): boolean;
		function openDoors(x: any, y: any): boolean;
		function moveToUnit(unit: PathNode, offX?: undefined, offY?: undefined, clearPath?: undefined, pop?: undefined): boolean;
		function moveToPreset(area: any, unitType: any, unitId: any, offX?: any, offY?: any, clearPath?: any, pop?: any): boolean;
		function moveToExit(targetArea: any, use?: any, clearPath?: any): void;
		function getNearestRoom(area: any): void;
		function openExit(targetArea: any): void;
		function openUnit(type: any, id: any): void;
		function useUnit(type: any, id: any, targetArea: any): boolean;
		function useWaypoint(targetArea: number | null, check?: boolean): boolean;
		function makePortal(use?: boolean | undefined): void;
		function usePortal(targetArea?: number | null, owner?: string | undefined, unit?: undefined): boolean;
		function getPortal(targetArea: any, owner?: any): ObjectUnit | false;
		function getNearestWalkable(x: any, y: any, range: any, step: any, coll: any, size?: any): [number, number] | false;
		function checkSpot(x: any, y: any, coll: any, cacheOnly: any, size: any): void;
		function accessToAct(act: number): boolean;
		function getWP(area: any, clearPath?: any): boolean;
		function journeyTo(area: any): boolean;
		function plotCourse(dest: any, src: any): false|{course:number[]};
		function areasConnected(src: any, dest: any): void;
		function getAreaName(area: number): void;
	}
}
