// @ts-nocheck
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
    /** @description size = 4 */
    float(a: number): this
    /** @description size = 4 */
    dword(a: number): this
    /** @description size = 2 */
    word(a: number): this
    /** @description size = 1 */
    byte(a: number): this
    string(a: any): this
    send(): this
    spoof(): this
  }

  /**
  * @class
  * @classdesc A class for creating and sending copy data packets.
  * @property {number} _mode - Defaults to 0, works for most D2Bot functions
  * @property {number | string} _handle - Defaults to value of D2Bot.handle, works for any D2Bot
  * functions that act on ourselves
  * @example <caption>Request a game from "scl-sorc-001" profile</caption>
  * new CopyData().handle("scl-sorc-001").mode(3).send();
  * @example <caption>Start mule profile "mule"</caption>
  * new CopyData().data("start", ["mule"]).send();
  */
  function CopyData(): void;
  class CopyData {
    /**
    * @private
    * @type {string | number} - The handle to send the copy data to.
    */
    private _handle: string | number;

    /**
    * @private
    * @type {number} - The mode of the copy data packet.
    */
    private _mode: number;

    /** 
    * @private
    * @type {string} - The data to send in the copy data
    */
    private _data: string;

    /**
     * - D2Bot.handle is for any functions that act on ourselves
     * - Otherwise it is the D2Bot# profile name of the profile to act upon
     * @param {string | number} handle - The handle or profile to send the copy data to.
     */
    handle(handle: string | number): CopyData;

    /** 
     * - 0 is for most functions, and the default value set
     * - 1 is for joinMe
     * - 3 is for requestGame
     * - 0xbbbb is for heartBeat
     * @param {number} mode - The mode of the copy data packet.
     */
    mode(mode: number): CopyData;

    /**
     * @param {string} [func] - The function to call from D2Bot#
     * @param {string[]} [args] - The additonal info needed for the function call
     */
    data(func?: string, args?: string[]): CopyData;
    send(): void;
  }

  function getThreads(): Script[];
  function getUnits(type: MonsterType, name?: string, mode?: number, unitId?: number): Monster[];
  function getUnits(type: MonsterType, classId?: number, mode?: number, unitId?: number): Monster[];
  function getUnits(type: ObjectType, name?: string, mode?: number, unitId?: number): ObjectUnit[];
  function getUnits(type: ObjectType, classId?: number, mode?: number, unitId?: number): ObjectUnit[];
  function getUnit(type?: MissileType, name?: string, mode?: number, unitId?: number): Missile[]
  function getUnit(type?: MissileType, classId?: number, mode?: number, unitId?: number): Missile[]
  function getUnits(type: ItemType, name?: string, mode?: number, unitId?: number): ItemUnit[];
  function getUnits(type: ItemType, classId?: number, mode?: number, unitId?: number): ItemUnit[];
  function getUnits(type: TileType, name?: string, mode?: number, unitId?: number): Tile[];
  function getUnits(type: TileType, classId?: number, mode?: number, unitId?: number): Tile[];
  function getUnits(...args: any[]): Unit[];
  function clickItemAndWait(...args: Args[]): boolean;
  function clickUnitAndWait(button: number, shift: 0 | 1, unit: Unit): boolean;
  const LocalChat: object;
  const areaNames: string[];
  function getAreaName(area: number): string;
  namespace Game {
    function getDistance(...args: any[]): number;
    
    function getCursorUnit(): ItemUnit;
    function getSelectedUnit(): ItemUnit;
    function getPlayer(id: any, mode: any, gid: any): Player;
    function getMonster(id?: string | number, mode?: number, gid?: number): Monster;
    function getNPC(id?: string | number, mode?: number, gid?: number): NPCUnit;
    function getObject(id?: string | number, mode?: number, gid?: number): ObjectUnit;
    function getMissile(id?: string | number, mode?: number, gid?: number): Missile;
    function getItem(id?: string | number, mode?: number, gid?: number): ItemUnit;
    function getStairs(id?: string | number, mode?: number, gid?: number): Tile;
    function getPresetMonster(area: number, id: number): PresetUnit;
    function getPresetMonsters(area: number, id: number): PresetUnit[];
    function getPresetObject(area: number, id: number): PresetUnit;
    function getPresetObjects(area: number, id: number): PresetUnit[];
    function getPresetStair(area: number, id: number): PresetUnit;
    function getPresetStairs(area: number, id: number): PresetUnit[];
  }
  type Args = {
    arg1: 0 | 1 | 2;
    arg2: number | ItemUnit;
    arg3?: number;
    arg4?: number;
  };

  namespace Messaging {
    function sendToScript(name: string, message: string): boolean;
    function sendToProfile(profile: string, mode: number, msg: string, getResponse?: boolean): boolean;
  }

  namespace Sort {
    function units(a: Unit, b: Unit): number;
    function presetUnits(a: PresetUnit, b: PresetUnit): number;
    function points(a: [number, number], b: [number, number]): number;
    function numbers(a: number, b: number): number;
  }
}
export {};
