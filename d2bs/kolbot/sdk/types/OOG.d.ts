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

  export const ControlAction: {
    timeoutDelay(text: any, time: any, stopfunc?: any, arg?: any):void
    click(type: any, x: any, y: any, xsize: any, ysize: any):void
    setText(type: any, x: any, y: any, xsize: any, ysize: any, text: any):void
    getText(type: any, x: any, y: any, xsize: any, ysize: any):string
    joinChannel(channel: any):void
    createGame(name: any, pass: any, diff: any, delay: any):void
    clickRealm(realm: 0|1|2|3):void
    loginAccount(info: any):void
    makeAccount(info: any):void
    findCharacter(info: any):void
    getCharacters():void
    getPosition():void
    loginCharacter(info: any, startFromTop?: boolean):void
    makeCharacter(info: any):void
    getGameList():void
  }
}
export {};
