declare type PathNode = { x: number, y: number }

declare function getUnit(type?: number, name?: string, mode?: number, unitId?: number)
declare function getUnit(type?: number, classId?: number, mode?: number, unitId?: number)

declare function getPath(area: number, fromX: number, fromY: number, toX: number, toY: number, reductionType: 0 | 1, radius: number): PathNode | false

declare function getCollision(area: number, x: number, y: number)

declare function getMercHP(): number

declare function getCursorType(type: 1 | 3 | 6): boolean

declare function getSkillByName(name: string): number

declare function getSkillById(id: number): string

declare function getLocaleString(id: number)

// Never seen in the wild, not sure about arguments
declare function getTextSize(name: string, size: number)

declare function getThreadPriority(): number

declare function getUIFlag(flag: number): boolean

declare function getTradeInfo(mode: 0 | 1 | 2): boolean

declare function getWaypoint(id: number): boolean

declare class Script {
    getNext(): Script
}

declare function getScript(name?: string): Script | false

declare function getScripts(): Script | false

declare class Room {
    getNext(): Room | false;
}

declare function getRoom(area: number, x: number, y: number): Room | false
declare function getRoom(x: number, y: number): Room | false
declare function getRoom(area: number): Room | false
declare function getRoom(): Room | false

declare class Party {
    getNext(): Party | false;
}

declare function getParty(): Party | false

declare class PresetUnit {
    getNext(): PresetUnit | false
}

declare function getPresetUnit(): PresetUnit | false

declare function getPresetUnits(): PresetUnit[] | false

declare class Area {
    getNext(): Area | false;
}

declare function getArea(): Area | false

declare function getBaseStat(table: string, row: number, column: string): number | string
declare function getBaseStat(row: number, column: string): number | string

declare class Control {

}

declare function getControl(type?: number, x?: number, y?: number, xsize?: number, ysize?: number): Control | false

declare function getControls(type?: number, x?: number, y?: number, xsize?: number, ysize?: number): Control[]

declare function getPlayerFlag(meGid: number, otherGid: number, type: number): boolean

declare function getTickCount(): number

declare function getInteractedNPC(): Monster | false

declare function getIsTalkingNPC(): boolean

declare function getDialogLines(): { handler() }[] | false

declare function print(what: string): void

declare function stringToEUC(arg): []

declare function utf8ToEuc(arg): []

declare function delay(ms: number): void

declare function load(file: string): boolean

declare function isIncluded(file: string): boolean

declare function include(file: string): boolean

declare function stacktrace(): true

declare function rand(from: number, to: number): number

declare function copy(what: string): void

declare function paste(): string

declare function sendCopyData(noIdea: null, handle: number, mode: number, data: string)
declare function sendCopyData(noIdea: null, handle: string, mode: number, data: string)

declare function sendDDE()

declare function keystate()

declare type eventName = 'gamepacket' | 'scriptmsg' | 'copydata' | 'keyup' | 'keydown'

declare function addEventListener(eventType: 'gamepacket', callback: ((bytes: ArrayBufferLike) => boolean)): void
declare function addEventListener(eventType: 'scriptmsg', callback: ((data: string | object | number) => void)): void
declare function addEventListener(eventType: 'copydata', callback: ((mode: number, msg: string) => void)): void
declare function addEventListener(eventType: 'itemaction', callback: ((gid:number,mode?:number,code?:string,global?:true) => void)): void
declare function addEventListener(eventType: 'keyup' | 'keydown', callback: ((key: number) => void)): void
declare function addEventListener(eventType: 'chatmsg', callback: ((nick: string,msg:string) => void)): void
declare function addEventListener(eventType: eventName, callback: ((...args: any) => void)): void

declare function removeEventListener(eventType: 'gamepacket', callback: ((bytes: ArrayBufferLike) => boolean)): void
declare function removeEventListener(eventType: 'scriptmsg', callback: ((data: string | object | number) => void)): void
declare function removeEventListener(eventType: 'copydata', callback: ((mode: number, msg: string) => void)): void
declare function removeEventListener(eventType: 'itemaction', callback: ((gid:number,mode?:number,code?:string,global?:true) => void)): void
declare function removeEventListener(eventType: 'keyup' | 'keydown', callback: ((key: number) => void)): void
declare function removeEventListener(eventType: 'chatmsg', callback: ((nick: string,msg:string) => void)): void
declare function removeEventListener(eventType: eventName, callback: ((...args: any) => void)): void

declare function clearEvent()

declare function clearAllEvents()

declare function js_strict()

declare function version():number

declare function scriptBroadcast(what:string|object):void

declare function sqlite_version()

declare function sqlite_memusage()

declare function dopen(path:string):false|{create(what:string)}

declare function debugLog(text:string):void

declare function showConsole():void

declare function hideConsole():void

// out of game functions

declare function login(name?:string):void

//
// declare function createCharacter())
// this function is not finished

declare function selectCharacter()

declare function createGame()

declare function joinGame()

declare function addProfile()

declare function getLocation()

declare function loadMpq()

// game functions that don't have anything to do with gathering data

declare function submitItem():void

declare function getMouseCoords()

declare function copyUnit(unit: Unit):Unit

declare function clickMap(type: 0|1|2|3,shift:0|1,x:number,y:number)

declare function acceptTrade()

declare function tradeOk()

declare function beep(id?:number)

declare function clickItem(where: 0|1|2,bodyLocation:number)
declare function clickItem(where: 0|1|2,item:Item)
declare function clickItem(where: 0|1|2,x:number,y:number)
declare function clickItem(where: 0|1|2,x:number,y:number,location:number)

declare function getDistance(a: Unit,b: Unit):number
declare function getDistance(a: Unit,toX:number, toY: number):number
declare function getDistance(fromX: number, fromY: number,b: Unit):number
declare function getDistance(fromX: number, fromY: number,toX:number, toY: number):number

declare function gold(amount: number,changeType?: 0|1|2|3|4):void

declare function checkCollision(a: Unit,b:Unit,type:number):boolean

declare function playSound(num:number):void

declare function quit():never

declare function quitGame():never

declare function say(what:string):void

declare function clickParty(player: Party,type: 0|1|2|3|4)

declare function weaponSwitch():void

declare function transmute():void

declare function useStatPoint(type:number):void

declare function useSkillPoint(type:number):void

declare function takeScreenshot():void

declare function moveNPC(npc:Monster,x:number,y:number):void

declare function getPacket(buffer: DataView):void
declare function getPacket(...args: {size:number, data: number}[]):void

declare function sendPacket(buffer: DataView):void
declare function sendPacket(...args: {size:number, data: number}[]):void

declare function getIP():string

declare function sendKey(key:number):void

declare function revealLevel(unknown:true):void

// hash functions

declare function md5(str:string):string

declare function sha1(str:string):string

declare function sha256(str:string):string

declare function sha384(str:string):string

declare function sha512(str:string):string

declare function md5_file(str:string):string

declare function sha1_file(str:string):string

declare function sha256_file(str:string):string

declare function sha384_file(str:string):string

declare function sha512_file(str:string):string