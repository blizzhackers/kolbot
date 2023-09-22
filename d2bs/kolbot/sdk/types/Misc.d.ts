
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
    /** @deprecated */
    function townCheck(boolean?: boolean): void;
    function spy(name: any): void;
    function errorReport(error: Error | string, script?: string): void;
    function debugLog(msg: any): void;
    function useMenu(id: number): void;
    function poll<T>(check: () => T, timeout?: number, sleep?: number): T;
    function getUIFlags(excluded?: []): number[] | null;
    function getQuestStates(questId: number): number[];
  }
}
