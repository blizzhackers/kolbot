export {};
declare global {
	const Pather: {
		wpAreas: number[];
		walkDistance: number;
		teleDistance: number;
		teleport: boolean,
		cancelFlags: number[],
		recursion: boolean,
		lastPortalTick: 0,
		getWalkDistance(x: number, y: number, area?: number, xx?: number, yy?: number, reductionType?: 0 | 1 | 2, radius?: number)
		useTeleport(): boolean,
		moveTo(x: number, y: number, retry?: number | undefined, clearPath?: boolean | undefined, pop?: boolean | undefined): boolean,
		teleportTo(x: any, y: any, maxRange?: any): void,
		walkTo(x: any, y: any, minDist?: number | undefined): boolean,
		openDoors(x: any, y: any): boolean,
		moveToUnit(unit: PathNode, offX?: undefined, offY?: undefined, clearPath?: undefined, pop?: undefined): boolean,
		moveToPreset(area: any, unitType: any, unitId: any, offX?: any, offY?: any, clearPath?: any, pop?: any): boolean,
		moveToExit(targetArea: any, use?: any, clearPath?: any): void,
		getNearestRoom(area: any): void,
		openExit(targetArea: any): void,
		openUnit(type: any, id: any): void,
		useUnit(type: any, id: any, targetArea: any): boolean,
		useWaypoint(targetArea: number | null, check?: boolean): boolean
		makePortal(use?: boolean | undefined): void,
		usePortal(targetArea?: number | null, owner?: string | undefined, unit?: undefined): boolean,
		getPortal(targetArea: any, owner?: any): ObjectUnit | false,
		getNearestWalkable(x: any, y: any, range: any, step: any, coll: any, size?: any): [number, number] | false,
		checkSpot(x: any, y: any, coll: any, cacheOnly: any, size: any): void,
		accessToAct(act: number): boolean,
		getWP(area: any, clearPath?: any): boolean,
		journeyTo(area: any): boolean,
		plotCourse(dest: any, src: any): false|{course:number[]},
		areasConnected(src: any, dest: any): void,
		getAreaName(area: number): void,
	}
}
