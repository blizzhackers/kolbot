// @ts-nocheck
export {};
declare global {
  /**
  * @constructor
  * @description new PacketBuilder() - create new packet object
  * @example <caption>(Spoof 'reassign player' packet to client):</caption>
  * new PacketBuilder().byte(sdk.packets.recv.ReassignPlayer).byte(0).dword(me.gid).word(x).word(y).byte(1).get();
  * @example <caption>(Spoof 'player move' packet to server):</caption>
  * new PacketBuilder().byte(sdk.packets.send.RunToLocation).word(x).word(y).send();
  * @todo pass the inital byte into the constructor so we don't always have to do `new PacketBuilder().byte(sdk.packets.recv.ReassignPlayer)...`
  * it would just be `new PacketBuilder(sdk.packets.recv.ReassignPlayer)...`
  */
  function PacketBuilder(): void;
  class PacketBuilder {
    /** @description size = 4; variadic - one queued field per argument */
    float(...values: number[]): this
    /** @description size = 4; variadic - one queued field per argument */
    dword(...values: number[]): this
    /** @description size = 2; variadic - one queued field per argument */
    word(...values: number[]): this
    /** @description size = 1; variadic - one queued field per argument */
    byte(...values: number[]): this
    string(...values: string[]): this
    send(): this
    spoof(): this
    /** @description alias of spoof() - clearer intent when reading the packet back on the client */
    get(): this
  }

  function getUnits(type: MonsterType, name?: string, mode?: number, unitId?: number): Monster[];
  function getUnits(type: MonsterType, classId?: number, mode?: number, unitId?: number): Monster[];
  function getUnits(type: ObjectType, name?: string, mode?: number, unitId?: number): ObjectUnit[];
  function getUnits(type: ObjectType, classId?: number, mode?: number, unitId?: number): ObjectUnit[];
  function getUnits(type: MissileType, name?: string, mode?: number, unitId?: number): Missile[];
  function getUnits(type: MissileType, classId?: number, mode?: number, unitId?: number): Missile[];
  function getUnits(type: ItemType, name?: string, mode?: number, unitId?: number): ItemUnit[];
  function getUnits(type: ItemType, classId?: number, mode?: number, unitId?: number): ItemUnit[];
  function getUnits(type: TileType, name?: string, mode?: number, unitId?: number): Tile[];
  function getUnits(type: TileType, classId?: number, mode?: number, unitId?: number): Tile[];
  function getUnits(type?: UnitType, name?: string, mode?: number, unitId?: number): Unit[];
  function getUnits(type?: UnitType, classId?: number, mode?: number, unitId?: number): Unit[];

  // Mirrors the native clickItem(...) overloads (see globals.d.ts) since clickItemAndWait
  // just forwards its args to clickItem before waiting for the cursor/mode change.
  function clickItemAndWait(where: 0 | 1 | 2, bodyLocation: number): boolean;
  function clickItemAndWait(where: 0 | 1 | 2, item: ItemUnit): boolean;
  function clickItemAndWait(where: 0 | 1 | 2, x: number, y: number): boolean;
  function clickItemAndWait(where: 0 | 1 | 2, x: number, y: number, location: number): boolean;

  /**
   * @description clickMap doesn't return if we sucessfully clicked a unit just that a click was sent, this checks and returns that a units mode has changed
   * as a result of us clicking it.
   */
  function clickUnitAndWait(button: number, shift: 0 | 1, unit: Unit): boolean;

  function getAreaName(area: number | string): string;

  // Value shape of the global `Game` const built inside Util.js's UMD factory; assigned onto
  // the global object when Util.js is include()d (see includeCoreLibs in libs/globals.js).
  interface Game {
    getDistance(): number;
    getDistance(unit: Unit): number;
    getDistance(x: number, y: number): number;
    getDistance(unitA: Unit, unitB: Unit): number;
    getDistance(unit: Unit, x: number, y: number): number;
    getDistance(x1: number, y1: number, x2: number, y2: number): number;

    /** @returns item on cursor */
    getCursorUnit(): ItemUnit | undefined;
    /** @returns item cursor is hovering over */
    getSelectedUnit(): ItemUnit | undefined;
    getPlayer(id?: string | number, mode?: number, gid?: number): Player;
    getMonster(id?: string | number, mode?: number, gid?: number): Monster;
    getNPC(id?: string | number, mode?: number, gid?: number): NPCUnit;
    getObject(id?: string | number, mode?: number, gid?: number): ObjectUnit;
    getMissile(id?: string | number, mode?: number, gid?: number): Missile;
    getItem(id?: string | number, mode?: number, gid?: number): ItemUnit;
    getStairs(id?: string | number, mode?: number, gid?: number): Tile;
    getPresetMonster(area: number, id: number): PresetUnit;
    getPresetMonsters(area: number, id: number): PresetUnit[];
    getPresetObject(area: number, id: number): PresetUnit;
    getPresetObjects(area: number, id: number): PresetUnit[];
    getPresetStair(area: number, id: number): PresetUnit;
    getPresetStairs(area: number, id: number): PresetUnit[];
  }
  const Game: Game;

  // Value shape of the global `Sort` const built inside Util.js's UMD factory; assigned onto
  // the global object when Util.js is include()d (see includeCoreLibs in libs/globals.js).
  interface Sort {
    /** Sort units by comparing distance between the player */
    units(a: Unit, b: Unit): number;
    /** Sort preset units by comparing distance between the player (using preset x/y calculations) */
    presetUnits(a: PresetUnit, b: PresetUnit): number;
    /** Sort arrays of x,y coords by comparing distance between the player */
    points(a: [number, number], b: [number, number]): number;
    numbers(a: number, b: number): number;
  }
  const Sort: Sort;

  // Value shape of the global `Messaging` const built inside Util.js's UMD factory; assigned
  // onto the global object when Util.js is include()d (see includeCoreLibs in libs/globals.js).
  interface Messaging {
    sendToScript(name: string, message: string): boolean;
    /** Returns the parsed copydata response object when getResponse is true and one arrives, else a boolean. */
    sendToProfile(profile: string, mode: number, msg: string, getResponse?: boolean): boolean | Record<string, unknown>;
  }
  const Messaging: Messaging;
}
