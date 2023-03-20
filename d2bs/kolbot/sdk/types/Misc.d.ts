
export{};
declare global {
	namespace Misc {
		const screenshotErrors: any;
		const errorConsolePrint: any;
		const useItemLog: boolean;
		
		function click(button: number, shift: number, unit: Unit): void;
		function click(button: number, shift: number, x: Unit, y: undefined): void;
		function inMyParty(name: any): void;
		function findPlayer(name: any): void;
		function getPlayerUnit(name: any): void;
		function getPlayerAct(player: any): void;
		function getNearbyPlayerCount(): void;
		function getPlayerCount(): void;
		function openChest(unit: any): boolean;
		function openChestsInArea(area?: any, chestIds?: any): void;
		function openChests(range: any): void;
		function scanShrines(range: any): void;
		function getShrine(unit: any): void;
		function getShrinesInArea(area: any, type: any, use: any): void;
		function getItemDesc(unit: any): void;
		function getItemSockets(unit: any): void;
		function itemLogger(action: string, unit: Unit, text?: string | undefined): void;
		function logItem(action: string, unit: ItemUnit | undefined, keptLine?: any): void;
		function skipItem(id: any): void;
		function shapeShift(mode: any): void;
		function unShift(): void;
		function townCheck(boolean?: boolean): void;
		function spy(name: any): void;
		function fileAction(path: any, mode: any, msg: any): void;
		function errorReport(error: Error | string, script?: string): void;
		function debugLog(msg: any): void;
		function useMenu(id: number): void;
		function clone(obj: any): void;
		function copy(from: any): void;
		function poll<T>(check: () => T, timeout?: number, sleep?: number): T;
		function getUIFlags(excluded?: []): void;
	}
}
