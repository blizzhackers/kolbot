
export{};
declare global {
  namespace Misc {
    const screenshotErrors: any;
    const errorConsolePrint: any;
    const useItemLog: boolean;
    
    function click(button: number, shift: number, unit: Unit): void;
    function click(button: number, shift: number, x: Unit, y: undefined): void;
    function inMyParty(name: string): boolean;
    function findPlayer(name: string): Party | false;
    function getPlayerUnit(name: string): Player | false;
    function getPlayerAct(player: Party | string): number | false;
    function getNearbyPlayerCount(): number;
    function getPlayerCount(): number;
    function getPartyCount(): number;
    function checkPartyLevel(levelCheck: number, exclude: string | string[]): boolean;
    function getPlayerArea(player: Party | string): number | false;

    type AutoLeaderDetectSettings = {
      destination: number | number[],
      quitIf: (area: number) => boolean,
      timeout: number,
    };
    function autoLeaderDetect(givenSettings: AutoLeaderDetectSettings): string | false;
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
