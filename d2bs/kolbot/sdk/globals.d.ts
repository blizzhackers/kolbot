// @ts-nocheck
/// <reference path="../libs/SoloPlay/index.d.ts" />
/// <reference path="./types/sdk.d.ts" />
/// <reference path="./types/Misc.d.ts" />
/// <reference path="./types/Util.d.ts" />
/// <reference path="./types/Town.d.ts" />
/// <reference path="./types/Attack.d.ts" />
/// <reference path="./types/Loader.d.ts" />
/// <reference path="./types/Pather.d.ts" />
/// <reference path="./types/Skill.d.ts" />
/// <reference path="./types/Pickit.d.ts" />
/// <reference path="./types/Storage.d.ts" />
/// <reference path="./types/Cubing.d.ts" />
/// <reference path="./types/Runewords.d.ts" />
/// <reference path="./types/NTIP.d.ts" />
/// <reference path="./types/AutoMule.d.ts" />
/// <reference path="./types/OOG.d.ts" />
// import sdk from "./types/sdk";
// import { NPC, Town } from "./types/Town";
// import * as Attack from "./types/Attack";
// import * as Loader from "./types/Loader";
// import * as Pather from "./types/Pather";
// // import * as Misc from "./types/Misc";
// import * as Skill from "./types/Skill";
// import * as Pickit from "./types/Pickit";
// import { Container, Storage } from "./types/Storage";
// import * as Cubing from "./types/Cubing";
// import { Runeword, Runewords, Roll } from "./types/Runewords";
// import * as NTIP from "./types/NTIP";
// import * as AutoMule from "./types/AutoMule";
// import { D2Bot, DataFile, ControlAction } from "./types/OOG";

declare global {
	interface Array<T> {
		includes(searchElement: T): boolean;
		find(predicate: (value: T, index: number, obj: Int8Array) => boolean, thisArg?: any): T | undefined;
		first(): T | undefined;
		last(): T | undefined;
		findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
		intersection(other: T[]): T[];
		difference(other: T[]): T[];
		symmetricDifference(other: T[]): T[];
		flat(depth?: number): T[];
		compactMap(callback: (value: T, index: number, obj: T[]) => any, thisArg?: any): any[];
		filterHighDistance(step: number): any[]
		isEqual(t: T[]): boolean
		remove(val: T): T[]
		random(): T;
	}

	interface String {
		lcsGraph(compareToThis: string): { a: string, b: string, graph: Uint16Array[]}
		diffCount(a:string): number;
		startsWith(a: string): boolean;
		capitalize(downCase: boolean): string;
		format(...pairs: Array<string, (number|string|boolean)>): string;
	}

	interface StringConstructor {
		static isEqual(str1: string, str2: string): boolean;
	}

	interface ObjectConstructor {
		assign<T, U>(target: T, source: U): T & U;
		assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
		assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
		assign(target: object, ...sources: any[]): any;
		values(source: object): any[];
		entries(source: object): any[][];
		is(o1: any, o2: any): boolean;
	}

	interface Object {
		distance: number,
		path: PathNode[] | undefined;

		setPrototypeOf(obj: object, proto: object)
	}

	class ScriptError extends Error {
	}

	type actType = { initialized: boolean, spot: { [data: string]: [number, number] } };
	type potType = 'hp' | 'mp' | 'rv';

	class Hook {
		color: number;
		visible: boolean;

		/**
		 * The horizontal alignment
		 * - 0 - Left
		 * - 1 - Right
		 * - 2 - Center
		 */
		align: number;

		/**
		 * The z-order of the Hook (what it covers up and is covered by).
		 */
		zorder: number;
		
		/**
		 * How much of the controls underneath the Hook should show through.
		 */
		opacity: number;

		/**
		 * Whether the Hook is in automap coordinate space (true) or screen coordinate space (false).
		 */
		automap: boolean;

		remove(): void;
	}

	class Line extends Hook {
		constructor(x: number, y: number, x2: number, y2: number, color: number, visible: boolean, automap: boolean, ClickHandler?: Function, HoverHandler?: Function);
		/**
		 * The first x coordinate of the Line.
		 */
		x: number;

		/**
		 * The first y coordinate of the Line.
		 */
		y: number;

		/**
		 * The end x coordinate of the Line.
		 */
		x2: number;

		/**
		 * The end y coordinate of the Line.
		 */
		y2: number;
	}

	class Box extends Hook {
		constructor(x: number, y: number, xsize: number, ysize: number, color: number, opacity: number, align: number, automap: boolean, ClickHandler?: Function, HoverHandler?: Function);
		/**
		 * The x coordinate (left) of the Box.
		 */
		x: number;

		/**
		 * The y coordinate (top) of the Box.
		 */
		y: number;

		/**
		 * The xsize (width) of the Box.
		 */
		xsize: number;

		/**
		 * The ysize (height) of the Box.
		 */
		ysize: number;
	}

	class Frame extends Box {
	}

	interface ClassAttack {
		doAttack(unit: Monster, preattack?: boolean): number
		afterAttack(any?: any): void
		doCast(unit: Monster, timedSkill: number, untimedSkill: number): number

		// Self defined
		decideSkill(unit: Monster, skipSkill?: number[]): [number, number]
	}

	/**
	 * @todo Figure out what each of these actually returns to properly document them
	 */
	class File {
		readable: boolean;
		writable: boolean;
		seekable: boolean;
		mode: number;
		binaryMode: boolean;
		length: number;
		path: string;
		position: number;
		eof: boolean;
		accessed: number;
		created: number;
		modified: number;
		autoflush: boolean;

		static open(path: string, mode: number): File;
		close(): File;
		reopen(): File;
		read(count: number): string[];
		read(count: number): ArrayBuffer[];
		readLine(): string;
		readAllLines(): string[];
		readAll(): string;
		write(): void;
		seek(n: number): any;
		seek(n: number, isLines: boolean, fromStart: boolean): any;
		flush(): void;
		reset(): void;
		end(): void;
	}

	const FileTools: {
		readText(filename: string)
		writeText(filename: string, data: string)
		appendText(filename: string, data: string)
		exists(filename: string): Boolean;
	}

	function getCollision(area: number, x: number, y: number, x2: number, y2: number)

	function getDistance(unit: PathNode, other: PathNode): number;
	function getDistance(unit: PathNode, x: number, y: number): number;

	/*************************************
		*          Unit description         *
		*          Needs expansion          *
		*************************************/
	
	type UnitType = 0 | 1 | 2 | 3 | 4 | 5;
	interface Unit {
		readonly type: UnitType;
		readonly classid: number;
		readonly mode: number;
		readonly name: string;
		readonly act: any;
		readonly gid: number;
		readonly x: number;
		readonly y: number;
		readonly area: number;
		readonly hp: number;
		readonly hpmax: number;
		readonly mp: number;
		readonly mpmax: number;
		readonly stamina: number;
		readonly staminamax: number;
		readonly charlvl: number;
		readonly owner: number;
		readonly ownertype: number;
		readonly uniqueid: number;

	}

	class Unit {
		readonly attackable: boolean;
		readonly dead: boolean;
		readonly islocked: boolean;
		readonly distance: number;

		readonly targetx: number;
		readonly targety: number;
		readonly idle: boolean;
		readonly isPlayer: boolean;
		readonly isNPC: boolean;
		readonly isMonster: boolean;
		readonly attackable: boolean;
		readonly rawStrength: number;
		readonly rawDexterity: number;
		readonly fireRes: number;
		readonly coldRes: number;
		readonly lightRes: number;
		readonly poisonRes: number;
		readonly hpPercent: number;
		readonly prettyPrint: string;
		
		// D2BS built in
		getNext(): Unit | false;
		interact(): boolean;
		interact(area: number): boolean;
		getItem(classId?: number, mode?: number, unitId?: number): ItemUnit | false;
		getItem(name?: string, mode?: number, unitId?: number): ItemUnit | false;
		getItems(...args: any[]): ItemUnit[] | false;
		getMerc(): MercUnit;
		getMercHP(): number | false;
		/**
		 * @param type -
		 * - `me.getSkill(0)` : Name of skill on right hand
		 * - `me.getSkill(1)` : Name of skill on left hand
		 * - `me.getSkill(2)` : ID of skill on right hand
		 * - `me.getSkill(3)` : ID of skill on left hand
		 * - `me.getSkill(4)` : Array of all skills in format [skillId, hardPoints, softPoints, ...repeat]
		 */
		getSkill(type: 0 | 1 | 2 | 3 | 4): number | number[];
		getSkill(skillId: number, type: 0 | 1, item?: ItemUnit): number;
		getStat(index: number, subid?: number, extra?: number): number;
		getState(index: number, subid?: number): boolean;
		getQuest(quest: number, subid: number): number
		getParent(): Unit | string;
		getMinionCount(): number;

		// additions from kolbot		
		getStatEx(one: number, sub?: number): number;
		getItemsEx(classId?: number, mode?: number, unitId?: number): ItemUnit[];
		getItemsEx(name?: string, mode?: number, unitId?: number): ItemUnit[];
		inArea(area: number): boolean;
		checkForMobs(givenSettings: {
			range?: number;
			count?: number;
			coll?: number;
			spectype: number
		}): boolean
	}

	type PlayerType = 0;
	class Player extends Unit {
		public type: PlayerType;
	}

	type MonsterType = 1;
	interface Monster extends Unit {
	}

	class Monster extends Unit {
		public type: MonsterType;
		readonly isChampion: boolean;
		readonly isUnique: boolean;
		readonly isMinion: boolean;
		readonly isSuperUnique: boolean;
		readonly isSpecial: boolean;
		readonly isWalking: boolean;
		readonly isRunning: boolean;
		readonly isMoving: boolean;
		readonly isChilled: boolean;
		readonly isFrozen: boolean;
		readonly currentVelocity: number;
		readonly isPrimeEvil: boolean;
		readonly isBoss: boolean;
		readonly isGhost: boolean;
		readonly isDoll: boolean;
		readonly isMonsterObject: boolean;
		readonly isMonsterEgg: boolean;
		readonly isMonsterNest: boolean;
		readonly isBaalTentacle: boolean;
		readonly isShaman: boolean;
		readonly isUnraveler: boolean;
		readonly isFallen: boolean;
		readonly isBeetle: boolean;
		readonly extraStrong: boolean;
		readonly extraFast: boolean;
		readonly cursed: boolean;
		readonly magicResistant: boolean;
		readonly fireEnchanted: boolean;
		readonly lightningEnchanted: boolean;
		readonly coldEnchanted: boolean;
		readonly manaBurn: boolean;
		readonly teleportation: boolean;
		readonly spectralHit: boolean;
		readonly stoneSkin: boolean;
		readonly multiShot: boolean;
		readonly charlvl: number;
		readonly spectype: number;
		readonly curseable: boolean;
		readonly scareable: boolean;

		getEnchant(type: number): boolean;
		hasEnchant(...enchants: number): boolean
	}

	class NPCUnit extends Unit {
		public type: MonsterType;
		readonly itemcount: number;

		openMenu(): boolean;
		useMenu(): boolean;
		startTrade: (mode: any) => (any | boolean);
	}

	class MercUnit extends Monster {
		equip(destination: number | undefined, item: ItemUnit)
	}

	interface ObjectUnit extends Unit {
	}

	type ObjectType = 2;
	class ObjectUnit extends Unit {
		public type: ObjectType;
		objtype: number;
	}

	type MissileType = 3;
	class Missile extends Unit {
		public readonly type: MissileType;
		hits(position: PathNode): boolean;
	}

	type ItemType = 4;
	interface ItemUnit extends Unit {

	}

	class ItemUnit extends Unit {
		// todo define item modes
		public readonly type: ItemType;
		readonly code: string;
		readonly prefixes: string[];
		readonly suffixes: string[];
		readonly prefixnum: number;
		readonly suffixnum: number;
		readonly prefixenums: number[];
		readonly suffixnums: number[];
		readonly fname: string;
		readonly quality: number;
		readonly node: number;
		readonly location: number;
		readonly sizex: number;
		readonly sizey: number;
		readonly itemType: number;
		readonly bodylocation: number;
		readonly ilvl: number;
		readonly lvlreq: number;
		readonly gfx: number;
		readonly description: string;

		// additional, not from d2bs
		readonly identified: boolean;
		readonly isEquipped: boolean
		readonly dexreq: number
		readonly strreq: number
		readonly isInInventory: boolean;
		readonly isInStash: boolean;
		readonly isInCube: boolean;
		readonly isInStorage: boolean;
		readonly isInBelt: boolean;
		readonly isOnMain: boolean;
		readonly isOnSwap: boolean;
		readonly runeword: boolean;
		readonly questItem: boolean;
		readonly ethereal: boolean;
		readonly twoHanded: boolean
		readonly oneOrTwoHanded: boolean;
		readonly strictlyTwoHanded: boolean;
		readonly sellable: boolean;
		readonly lowQuality: boolean;
		readonly normal: boolean;
		readonly superior: boolean;
		readonly magic: boolean;
		readonly set: boolean;
		readonly rare: boolean;
		readonly unique: boolean;
		readonly crafted: boolean;
		readonly sockets: number;
		readonly onGroundOrDropping: boolean;
		readonly isShield: boolean;
		readonly isAnni: boolean;
		readonly isTorch: boolean;
		readonly isGheeds: boolean;

		getColor(): number;
		getBodyLoc(): number[];
		getFlags(): number;
		getFlag(flag: number): boolean;
		// shop(mode: ShopModes): boolean;
		getItemCost(type?: 0 | 1 | 2): number;
		sell(): boolean;
		drop(): boolean;
		equip(slot?: number): boolean;
		buy(shift?: boolean, gamble?: boolean): boolean;
		sellOrDrop():void
		toCursor():boolean
		use(): boolean;
	}

	type TileType = 5;
	class Tile extends Unit {
		public type: TileType;
	}

	interface MeType extends Unit {
		public type: PlayerType;
		readonly account: string;
		readonly charname: string;
		readonly diff: 0 | 1 | 2;
		readonly maxdiff: 0 | 1 | 2;
		readonly gamestarttime: number;
		readonly gametype: 0 | 1;
		readonly itemoncursor: boolean;
		readonly ladder: number;
		readonly ping: number;
		readonly fps: number;
		readonly locale: number;
		readonly playertype: 0|1;
		readonly realm: string;
		readonly realmshort: string;
		readonly mercrevivecost: number;
		chickenhp: number;
		chickenmp: number;
		quitonhostile: boolean;
		readonly gameReady: boolean;
		readonly profile: string;
		readonly pid: number;
		readonly charflags: number;
		readonly screensize: number;
		readonly windowtitle: string;
		readonly ingame: boolean;
		quitonerror: boolean;
		maxgametime: number;
		readonly gamepassword: string;
		readonly gamestarttime: number;
		readonly gamename: string;
		readonly gameserverip: string;
		readonly itemcount: number;
		readonly classid: 0 | 1 | 2 | 3 | 4 | 5 | 6;
		readonly weaponswitch: 0|1;
		readonly gameReady: boolean;
		blockMouse: boolean;
		blockKeys: boolean;
		runwalk: number;
		automap: boolean;

		readonly expansion: boolean;
		readonly classic: boolean;
		readonly softcore: boolean;
		readonly hardcore: boolean;
		readonly normal: boolean;
		readonly nightmare: boolean;
		readonly hell: boolean;
		readonly sorceress: boolean;
		readonly amazon: boolean;
		readonly necromancer: boolean;
		readonly paladin: boolean;
		readonly barbarian: boolean;
		readonly assassin: boolean;
		readonly druid: boolean;
		readonly hpPercent: number;
		readonly mpPercent: number;
		readonly gold: number;
		readonly inTown: boolean;
		readonly highestAct: 1 | 2 | 3 | 4 | 5;
		readonly staminaDrainPerSec: number;
		readonly staminaTimeLeft: number;
		readonly staminaMaxDuration: number;
		readonly inShop: boolean;
		readonly skillDelay: boolean;

		overhead(msg: string): void;
		repair(): boolean;
		revive(): void;
		move(x: number, y: number): boolean;
		setSkill(): boolean;
		cancel(number?: number): boolean;
		inArea(area: number): boolean;
		switchWeapons(slot: 0 | 1): void;
		switchToPrimary(): boolean;
		checkItem(itemInfo: {
			classid?: number;
			itemtype?: number;
			quality?: number;
			runeword?: boolean;
			ethereal?: boolean;
			name?: string | number;
			equipped?: boolean | number;
		}): {have: boolean; item: ItemUnit | null};
		haveSome(arg0: { name: number; equipped: boolean; }[]): any;
		equip(destination: number | undefined, item: ItemUnit);
		findItem(id?: number | string, mode?: number, location?: number, quality?: number): ItemUnit | boolean;
		findItems(id?: number | string, mode?: number, location?: number): ItemUnit[];
		getRepairCost(): number;
		findItems(param: number, number?: number, number2?: number): ItemUnit[];
		usingShield(): boolean;
		cancelUIFlags(): boolean;
		getTome(id: number): ItemUnit | null;
	}

	const me: MeType

	type PathNode = { x: number, y: number }

	function getUnit(type: 4, name?: string, mode?: number, unitId?: number): ItemUnit
	function getUnit(type: 4, classId?: number, mode?: number, unitId?: number): ItemUnit
	function getUnit(type: 1, name?: string, mode?: number, unitId?: number): Monster
	function getUnit(type: 1, classId?: number, mode?: number, unitId?: number): Monster
	function getUnit(type?: number, name?: string, mode?: number, unitId?: number): Unit
	function getUnit(type?: number, classId?: number, mode?: number, unitId?: number): Unit

	function getPath(area: number, fromX: number, fromY: number, toX: number, toY: number, reductionType: 0 | 1 | 2, radius: number): PathNode[] | false
	function getCollision(area: number, x: number, y: number)
	function getMercHP(): number
	function getCursorType(type: 1 | 3 | 6): boolean
	function getCursorType(): number
	function getSkillByName(name: string): number
	function getSkillById(id: number): string
	function getLocaleString(id: number): string

	// Never seen in the wild, not sure about arguments
	function getTextSize(name: string, size: number)
	function getThreadPriority(): number
	function getUIFlag(flag: number): boolean
	function getTradeInfo(mode: 0 | 1 | 2): boolean
	function getWaypoint(id: number): boolean

	class Script {
		running: boolean;
		name: string;
		type: boolean;
		threadid: number;
		memory: number;

		getNext(): Script;
		pause(): boolean;
		resume(): boolean;
		join(): void;
		stop(): boolean;
		send(): void;
	}

	function getScript(name?: string | boolean): Script | false
	function getScripts(): Script | false

	class Room {
		area: number;
		correcttomb: number;
		x: number;
		y: number;
		xsize: number;
		ysize: number;

		getNext(): Room | false;
		getNearby(): Room[];
		isInRoom(unit: PathNode):boolean
		isInRoom(x:number, y:number):boolean
	}

	function getRoom(area: number, x: number, y: number): Room | false
	function getRoom(x: number, y: number): Room | false
	function getRoom(area: number): Room | false
	function getRoom(): Room | false

	class Party {
		name: string;
		gid: number;
		level: number;
		partyid: number;
		area: number;
		inTown: any;

		getNext(): Party | false;
	}

	function getParty(unit?: Unit): Party | false

	class PresetUnit {
		id: number;
		x: number;
		y: number;
		roomx: number;
		roomy: number;

		getNext(): PresetUnit | false;
		realCoords(): { area: number, x: number, y: number };
	}

	function getPresetUnit(area?: number, objType?: number, classid?: number): PresetUnit | false
	function getPresetUnit(area?: number, objType?: 2, classid?: number): PresetUnit | false
	function getPresetUnits(area?: number, objType?: number, classid?: number): PresetUnit[] | false

	interface Exit extends Object {
		x: number,
		y: number,
		type: number,
		target: number,
		tileid: number,
		level: number,
	}

	class Area {
		name: string;
		x: number;
		xsize: number;
		y: number;
		ysize: number;
		id: number;
		exits: Exit[];

		getNext(): Area | false;
	}

	function getArea(id?: number): Area | false
	function getBaseStat(table: string, row: number, column: string | number): number | string
	function getBaseStat(row: number, column: string): number | string

	/**
	 * @todo get a better understanding of Control
	 */
	class Control {
		/**
		 * The text of the control
		 */
		text: string;

		/**
		 * The x coordinate of the control
		 */
		x: number;

		/**
		 * The y coordinate of the control
		 */
		y: number;

		/**
		 * The xsize (width) of the control
		 */
		xsize: number;

		/**
		 * The ysize (height) of the control
		 */
		ysize: number;

		/**
		 * The state of the control
		 * - Disabled - 4
		 * @todo figure out the rest
		 */
		state: number;

		/**
		 * Return whether or not the Control holds a password (starred out text).
		 */
		password: boolean;

		/**
		 * The type of control
		 * - 1 - TextBox
		 * - 2 - Image
		 * - 3 - Image2
		 * - 4 - LabelBox
		 * - 5 - ScrollBar
		 * - 6 - Button
		 * - 7 - List
		 * - 8 - Timer
		 * - 9 - Smack
		 * - 10 - ProgressBar
		 * - 11 - Popup
		 * - 12 - AccountList
		 */
		type: number;
		cursorpos: any;
		selectstart: any;
		selectend: any;
		disabled: number;

		getNext(): Control | undefined;
		click(x?: number, y?: number): void;
		setText(text: string): void;
		getText(): string[];
	}

	type Profile = {
		type: number,
		ip: number,
		username: string,
		gateway: string,
		character: string,
		difficulty: number,
		maxloginTime: number,
		maxCharacterSelectTime: number,
	}
	function Profile(): Profile;

	function getControl(type?: number, x?: number, y?: number, xsize?: number, ysize?: number): Control | false
	function getControls(type?: number, x?: number, y?: number, xsize?: number, ysize?: number): Control[]
	function getPlayerFlag(meGid: number, otherGid: number, type: number): boolean
	function getTickCount(): number
	function getInteractedNPC(): Monster | false
	function getIsTalkingNPC(): boolean
	function getDialogLines(): { handler() }[] | false
	function print(what: string): void
	function stringToEUC(arg: any): []
	function utf8ToEuc(arg: any): []
	function delay(ms: number): void
	function load(file: string): boolean
	function isIncluded(file: string): boolean
	function include(file: string): boolean
	function stacktrace(): true
	function rand(from: number, to: number): number
	function copy(what: string): void
	function paste(): string

	function sendCopyData(noIdea: null, handle: number | string, mode: number, data: string): void;

	function sendDDE()
	function keystate()

	type eventName = 'gamepacket' | 'scriptmsg' | 'copydata' | 'keyup' | 'keydown';

	function addEventListener(eventType: 'gamepacket', callback: ((bytes: ArrayBufferLike) => boolean)): void
	function addEventListener(eventType: 'scriptmsg', callback: ((data: string | object | number) => void)): void
	function addEventListener(eventType: 'copydata', callback: ((mode: number, msg: string) => void)): void
	function addEventListener(eventType: 'itemaction', callback: ((gid: number, mode?: number, code?: string, global?: true) => void)): void
	function addEventListener(eventType: 'keyup' | 'keydown', callback: ((key: number|string) => void)): void
	function addEventListener(eventType: 'chatmsg', callback: ((nick: string, msg: string) => void)): void
	function addEventListener(eventType: eventName, callback: ((...args: any) => void)): void

	function removeEventListener(eventType: 'gamepacket', callback: ((bytes: ArrayBufferLike) => boolean)): void
	function removeEventListener(eventType: 'scriptmsg', callback: ((data: string | object | number) => void)): void
	function removeEventListener(eventType: 'copydata', callback: ((mode: number, msg: string) => void)): void
	function removeEventListener(eventType: 'itemaction', callback: ((gid: number, mode?: number, code?: string, global?: true) => void)): void
	function removeEventListener(eventType: 'keyup' | 'keydown', callback: ((key: number) => void)): void
	function removeEventListener(eventType: 'chatmsg', callback: ((nick: string, msg: string) => void)): void
	function removeEventListener(eventType: eventName, callback: ((...args: any) => void)): void

	function clearEvent()
	function clearAllEvents()
	function js_strict()
	function version(): number
	function scriptBroadcast(what: string | object): void
	function sqlite_version()
	function sqlite_memusage()

	function dopen(what?: string): {
		getFiles(): string[];
		getFolders(): string[];
		create(what?: string): boolean;
	} | false;
	function debugLog(text: string): void
	function showConsole(): void
	function hideConsole(): void

	// out of game functions
	function login(name?: string): void
	function selectCharacter()
	function createGame()
	function joinGame()
	function addProfile()
	function getLocation():number
	function loadMpq()

	// game functions that don't have anything to do with gathering data
	function submitItem(): void
	function getMouseCoords()
	function copyUnit<S extends Unit>(unit: S): S
	function clickMap(type: 0 | 1 | 2 | 3, shift: 0 | 1, x: number, y: number)
	function acceptTrade()
	function tradeOk()
	function beep(id?: number)

	function clickItem(where: 0 | 1 | 2, bodyLocation: number)
	function clickItem(where: 0 | 1 | 2, item: ItemUnit)
	function clickItem(where: 0 | 1 | 2, x: number, y: number)
	function clickItem(where: 0 | 1 | 2, x: number, y: number, location: number)

	function getDistance(a: Unit, b: Unit): number
	function getDistance(a: Unit, toX: number, toY: number): number
	function getDistance(fromX: number, fromY: number, b: Unit): number
	function getDistance(fromX: number, fromY: number, toX: number, toY: number): number

	function gold(amount: number, changeType?: 0 | 1 | 2 | 3 | 4): void
	function checkCollision(a: Unit, b: Unit, type: number): boolean
	function playSound(num: number): void
	function quit(): never
	function quitGame(): never
	function say(what: string): void
	function clickParty(player: Party, type: 0 | 1 | 2 | 3 | 4)
	function weaponSwitch(): void
	function transmute(): void
	function useStatPoint(type: number): void
	function useSkillPoint(type: number): void
	function takeScreenshot(): void
	function moveNPC(npc: Monster, x: number, y: number): void

	function getPacket(buffer: ArrayBuffer): void
	function getPacket(...args: { size: number, data: number }[]): void

	function sendPacket(buffer: ArrayBuffer): void
	function sendPacket(...number: number[]): void

	function getIP(): string
	function sendKey(key: number): void
	function revealLevel(unknown: true): void

	// hash functions
	function md5(str: string): string
	function sha1(str: string): string
	function sha256(str: string): string
	function sha384(str: string): string
	function sha512(str: string): string
	function md5_file(str: string): string
	function sha1_file(str: string): string
	function sha256_file(str: string): string
	function sha384_file(str: string): string
	function sha512_file(str: string): string

	interface Console {
		static log(...whatever: any[]): void
		static debug(...whatever: any[]): void
		static warn(...whatever: any[]): void
		static error(...whatever: any[]): void
		static time(name: string): void;
		static timeEnd(name: string): void;
		static trace(): void;
		static info(start: boolean, msg: string, timer: string): void;
	}
	const console: Console;

	function includeIfNotIncluded(file?: string): boolean;
	function includeCoreLibs(obj: { exclude: string[] }): boolean;
	function includeSystemLibs(): boolean;
	function clone(obj: Date | any[] | object): ThisParameterType;
	function copyObj(from: object): object;

	interface StarterConfig {
		MinGameTime: number,
		MaxGameTime?: number,
		PingQuitDelay: number,
		CreateGameDelay: number,
		ResetCount: number
		CharacterDifference: number,
		MaxPlayerCount: number,
		StopOnDeadHardcore: boolean,

		JoinChannel: string,
		FirstJoinMessage: string,
		ChatActionsDelay: number,
		AnnounceGames: boolean,
		AnnounceMessage: string,
		AfterGameMessage: string,

		InvalidPasswordDelay: number, // Minutes to wait after getting Invalid Password message
		VersionErrorDelay: number, // Seconds to wait after 'unable to identify version' message
		SwitchKeyDelay: number, // Seconds to wait before switching a used/banned key or after realm down
		CrashDelay: number, // Seconds to wait after a d2 window crash
		FTJDelay: number, // Seconds to wait after failing to create a game
		RealmDownDelay: number, // Minutes to wait after getting Realm Down message
		UnableToConnectDelay: number, // Minutes to wait after Unable To Connect message
		TCPIPNoHostDelay: number, // Seconds to wait after Cannot Connect To Server message
		CDKeyInUseDelay: number, // Minutes to wait before connecting again if CD-Key is in use.
		ConnectingTimeout: number, // Seconds to wait before cancelling the 'Connecting...' screen
		PleaseWaitTimeout: number, // Seconds to wait before cancelling the 'Please Wait...' screen
		WaitInLineTimeout: number, // Seconds to wait before cancelling the 'Waiting in Line...' screen
		WaitOutQueueRestriction: boolean, // Wait out queue if we are restricted, queue time > 10000
		WaitOutQueueExitToMenu: boolean, // Wait out queue restriction at D2 Splash screen if true, else wait out in lobby
		GameDoesNotExistTimeout: number, // Seconds to wait before cancelling the 'Game does not exist.' screen
	}

	interface StarterInterface {
		Config: StarterConfig,
		useChat: boolean,
		pingQuit: boolean,
		inGame: boolean,
		firstLogin: boolean,
		firstRun: boolean,
		isUp: "yes"|"no",
		loginRetry: number,
		deadCheck: boolean,
		chatActionsDone: boolean,
		gameStart: boolean,
		gameCount: number,
		lastGameStatus: string,
		handle: number | null,
		connectFail: boolean,
		connectFailRetry: number,
		makeAccount: false,
		channelNotify: boolean,
		chanInfo: {
			joinChannel: string,
			firstMsg: string,
			afterMsg: string,
			announce: boolean,
		},
		gameInfo: {
			error: string,
			crashInfo: {
					currScript: number,
					area: number,
			},
			switchKeys: boolean,
		},
		joinInfo: {},
		profileInfo: {},

		sayMsg(string: string): void,
		timer(tick: number): string,
		locationTimeout(time: number, location: number): boolean,
		setNextGame(gameInfo: { gameName: string }): void,
		updateCount(): void,
		scriptMsgEvent(msg: string): void,
		receiveCopyData(mode: number, msg: string | object): void,
		randomString(len?: number, useNumbers?: boolean): string,
		randomNumberString(len?: number): string,
	}

	const Starter: StarterInterface;
}
export {};
