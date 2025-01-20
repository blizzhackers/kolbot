// @ts-nocheck
declare global {
  namespace GameAction {
    let LogNames: boolean;
    let LogItemLevel: boolean;
    let LogEquipped: boolean;
    let LogMerc: boolean;
    let SaveScreenShot: boolean;
    let IngameTime: number;
    let task: any; // Update the type of `task` as needed

    function init(task: any): void;
    function update(action: string, data: any): void;
    function gameInfo(): { gameName: string, gamePass: string };
    function getLogin(): { realm: string, account: string, password: string };
    function getCharacters(): string[];
    function inGameCheck(): boolean;
    function load(hash: string): string;
    function save(hash: string, data: string): void;
    function dropItems(dropList: string[]): void;
  }
}
export {};