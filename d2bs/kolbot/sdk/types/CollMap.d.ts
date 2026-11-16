declare global {
  interface CollMapRoom {
    x: number;
    y: number;
    xsize: number;
    ysize: number;
  }

  interface CollMapHook {
    room: Room;
    lines: Line[];
  }

  interface CollMapColors {
    readonly green: 0x84;
    readonly red: 0x0a;
    readonly black: 0x00;
    readonly white: 0xff;
    readonly purple: 0x9b;
    readonly blue: 0x97;
  }

  type CollMapColorName = "green" | "red" | "black" | "white" | "purple" | "blue";

  interface CollMapInstance {
    rooms: CollMapRoom[];
    maps: number[][][];
    hooks: CollMapHook[];
    readonly colors: CollMapColors;

    /**
     * Draw room outline on screen
     * @param room The room to draw
     * @param color Color name or color code
     * @param update Whether to update existing drawing
     */
    drawRoom(room: Room, color?: CollMapColorName | number, update?: boolean): void;

    /**
     * Remove hook for specific room
     * @param room The room to remove hook for
     */
    removeHookForRoom(room: Room): void;

    /**
     * Remove all hooks
     */
    removeHooks(): void;

    /**
     * Get nearby rooms for given coordinates
     * @param x X coordinate
     * @param y Y coordinate
     * @returns Success status
     */
    getNearbyRooms(x: number, y: number): boolean;

    /**
     * Add room to collision map
     * @param x Room object or X coordinate
     * @param y Y coordinate (optional if first param is Room)
     * @returns Success status
     */
    addRoom(x: Room | number, y?: number): boolean;

    /**
     * Get collision value at coordinates
     * @param x X coordinate
     * @param y Y coordinate
     * @param cacheOnly Only check cache
     * @returns Collision value
     */
    getColl(x: number, y: number, cacheOnly?: boolean): number;

    /**
     * Get room index for coordinates
     * @param x X coordinate
     * @param y Y coordinate
     * @param cacheOnly Only check cache
     * @returns Room index or undefined
     */
    getRoomIndex(x: number, y: number, cacheOnly?: boolean): number | undefined;

    /**
     * Check if coordinates are in room
     * @param x X coordinate
     * @param y Y coordinate
     * @param room Room to check
     * @returns Whether coordinates are in room
     */
    coordsInRoom(x: number, y: number, room: CollMapRoom): boolean;

    /**
     * Reset collision map
     */
    reset(): void;

    /**
     * Check collision between two units
     * @param unitA First unit
     * @param unitB Second unit
     * @param coll Collision flags
     * @param thickness Line thickness
     * @returns Whether collision exists
     */
    checkColl(unitA: Unit | IPathNode, unitB: Unit | IPathNode, coll: number, thickness?: number): boolean;

    /**
     * Get teleport point for room
     * @param room Room to get teleport point for
     * @returns Teleport point or null
     */
    getTelePoint(room: Room): IPathNode | null;

    /**
     * Get random valid coordinate
     * @param cX Center X coordinate
     * @param xmin Minimum X offset
     * @param xmax Maximum X offset
     * @param cY Center Y coordinate
     * @param ymin Minimum Y offset
     * @param ymax Maximum Y offset
     * @param factor Scale factor
     * @returns Random valid coordinate
     */
    getRandCoordinate(
      cX: number,
      xmin: number,
      xmax: number,
      cY: number,
      ymin: number,
      ymax: number,
      factor?: number,
    ): IPathNode;
  }
}
export {};
