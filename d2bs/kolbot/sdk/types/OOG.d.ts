// @ts-nocheck
declare global {
  namespace DataFile {
    function create(): void
    function getObj(): void
    function getStats(): any
    function updateStats(arg: any, value?: any): void
  }

  namespace FileAction {
    function read(path: string): string;
    function write(path: string, msg: string): boolean;
    function append(path: string, msg: string): boolean;
    function parse(path: string): any;
  }

  export const D2Bot: {
    handle: number,
    init(): void
    sendMessage(handle: any, mode: any, msg: any): void
    printToConsole(msg: string, color?: number, tooltip?: undefined, trigger?: undefined): void
    printToItemLog(itemObj: any): void
    uploadItem(itemObj: any): void
    writeToFile(filename: any, msg: any): void
    postToIRC(ircProfile: any, recepient: any, msg: any): void
    ircEvent(mode: any): void
    notify(msg: any): void
    saveItem(itemObj: any): void
    updateStatus(msg: any): void
    updateRuns(): void
    updateChickens(): void
    updateDeaths(): void
    requestGameInfo(): void
    restart(keySwap?: boolean): void
    CDKeyInUse(): void
    CDKeyDisabled(): void
    CDKeyRD(): void
    stop(profile?: undefined, release?: undefined): void
    start(profile: any): void
    startSchedule(profile: any): void
    stopSchedule(profile: any): void
    updateCount(): void
    shoutGlobal(msg: any, mode: any): void
    heartBeat(): void
    sendWinMsg(wparam: any, lparam: any): void
    ingame(): void
    joinMe(profile: any, gameName: any, gameCount: any, gamePass: any, isUp: any): void
    requestGame(profile: any): void
    getProfile(): void
    setProfile(account: any, password: any, character: any, difficulty: any, realm: any, infoTag: any, gamePath: any): void
    setTag(tag: any): void
    store(info: any): void
    retrieve(): void
    remove(): void
  }

  namespace ControlAction {
    let mutedKey: boolean;
    enum realms {
      'uswest' = 0,
      'useast' = 1,
      'asia' = 2,
      'europe' = 3
    };
    type ControlParams = {
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number,
    };
    type CharacterInfo = {
      charName: string;
      charClass: string;
      charLevel: number;
      expansion: boolean;
      hardcore: boolean;
      ladder: boolean;
    };
    type AccountInfo = {
      account: string;
      password: string;
      realm: realms;
    };
    function timeoutDelay(
      text: string,
      time: number,
      stopfunc?: (arg: any) => boolean,
      arg?: any
    ): void;
    // function click(
    //   ...params: [targetx: number, targety: number, ...rest: ControlParams]
    // ): boolean;
    // function setText(
    //   text: string,
    //   ...params: ControlParams
    // ): boolean;
    // function getText(
    //   ...params: ControlParams
    // ): string[];
    function click(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number,
      targetx: number,
      targety: number,
    ): boolean;

    function setText(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number,
      text: string
    ): boolean;

    function getText(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number
    ): string[];

    function parseText(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number
    ): string;

    function scrollDown(): void;
    function clickRealm(realm: realms): boolean;
    function findCharacter(info: CharacterInfo): Control | false;
    function getCharacters(): string[];
    function getPermStatus(info: CharacterInfo): boolean;
    function getPosition(): number;
    function makeCharacter(info: CharacterInfo): boolean;
    function deleteCharacter(info: CharacterInfo): boolean;
    function convertCharacter(info: CharacterInfo): boolean;
    function loginCharacter(info: CharacterInfo, startFromTop?: boolean): boolean;
    function setEmail(email: string, domain?: string): boolean;
    function makeAccount(info: AccountInfo): boolean;
    function loginAccount(info: AccountInfo): boolean;
    function joinChannel(channel: string): boolean;
    function createGame(name: string, pass: string, diff: string, delay: number): void;
    function getGameList(): { gameName: string, players: number }[] | false;
    function getQueueTime(): number;
    function loginOtherMultiplayer(): boolean;
  }
}
export {};
