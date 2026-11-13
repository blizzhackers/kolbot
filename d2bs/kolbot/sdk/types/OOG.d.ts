export {};
declare global {
  interface DataFileObj {
    handle: number;
    name: string;
    level: number;
    experience: number;
    gold: number;
    deaths: number;
    runs: number;
    lastArea: string;
    ingameTick: number;
    gameName: string;
    currentGame: string;
    nextGame: string;
  }

  // Value shape of the module-built `DataFile` global (UMD factory `root.DataFile = factory()`
  // in oog/DataFile.js) - there is no top-level binding to annotate, so the const stays here.
  interface IDataFile {
    _path: string;
    _default: DataFileObj;
    init(): boolean;
    create(): DataFileObj;
    read(profile: string): DataFileObj | null;
    getObj(): DataFileObj;
    getStats(): DataFileObj;
    updateStats(arg: string | string[], value?: string | number): void;
  }

  const DataFile: IDataFile;

  // Value shape of the top-level `FileAction` const in oog/FileAction.js (bound there via
  // JSDoc @type). Declaring the const here as well would collide: both files are global scripts.
  interface IFileAction {
    read(path: string): string;
    write(path: string, msg: string): boolean;
    append(path: string, msg: string): boolean;
    /** Parsed JSON content; shape depends on which file is being read. */
    parse(path: string): unknown;
  }

  type RealmName = "uswest" | "west" | "useast" | "east" | "asia" | "europe";
  type RealmIndex = 0 | 1 | 2 | 3;

  interface D2BotItemLogPayload {
    title: string;
    description: string;
    image: string;
    itemColor: number;
    header: string;
    sockets: ItemUnit[];
    textColor?: number;
    invTrans?: number;
  }

  // Value shape of the module-built `D2Bot` global (UMD factory `root.D2Bot = factory()`
  // in oog/D2Bot.js) - there is no top-level binding to annotate, so the const stays here.
  interface ID2Bot {
    handle: number;

    init(): number;
    sendMessage(handle: number | string, mode: number, msg: string): void;
    printToConsole(msg: string, color?: number, tooltip?: string, trigger?: string): void;
    printToItemLog(itemObj: D2BotItemLogPayload): void;
    uploadItem(itemObj: D2BotItemLogPayload): void;
    writeToFile(filename: string, msg: string): void;
    postToIRC(ircProfile: string, recepient: string, msg: string): void;
    ircEvent(mode: boolean): void;
    notify(msg: string): void;
    saveItem(itemObj: D2BotItemLogPayload): void;
    updateStatus(msg: string): void;
    updateRuns(): void;
    updateChickens(): void;
    updateDeaths(): void;
    requestGameInfo(): void;
    restart(keySwap?: boolean): void;
    CDKeyInUse(): void;
    CDKeyDisabled(): void;
    CDKeyRD(): void;
    // profile is meant to be the profile name, but several call sites pass the release flag
    // positionally instead (D2Bot.stop(true)) - typed to match actual call sites.
    stop(profile?: string | boolean, release?: boolean): void;
    start(profile: string): void;
    startSchedule(profile: string): void;
    stopSchedule(profile: string): void;
    updateCount(): void;
    shoutGlobal(msg: string, mode: number): void;
    heartBeat(): void;
    sendWinMsg(wparam: number, lparam: number): void;
    ingame(): void;
    joinMe(
      profile: string,
      gameName: string,
      gameCount: number | string,
      gamePass: string,
      isUp: "yes" | "no",
      delay?: number
    ): void;
    requestGame(profile: string): void;
    getProfile(): void;
    setProfile(
      account: string,
      password: string,
      character: string,
      difficulty: string,
      realm: string,
      infoTag: string,
      gamePath: string
    ): void;
    setTag(tag: string): void;
    /** Arbitrary payload cached by D2Bot# keyed to the current profile; shape is caller-defined. */
    store(info: unknown): void;
    retrieve(): void;
    remove(): void;
  }

  const D2Bot: ID2Bot;

  interface CharacterInfo {
    charName: string;
    charClass: string;
    charLevel: number;
    expansion: boolean;
    hardcore: boolean;
    ladder: boolean;
    /** Read by loginCharacter() when SP falls through to the difficulty select screen. */
    profile?: string;
  }

  interface AccountInfo {
    account: string;
    password: string;
    realm: RealmName;
  }

  type Difficulty = "Normal" | "Nightmare" | "Hell" | "Highest";

  // Value shape of the module-built `ControlAction` global (Object.assign(root, factory())
  // in OOG.js) - there is no top-level binding to annotate, so the const stays here.
  interface IControlAction {
    mutedKey: boolean;
    realms: {
      uswest: 0;
      west: 0;
      useast: 1;
      east: 1;
      asia: 2;
      europe: 3;
    };

    timeoutDelay<T = unknown>(
      text: string,
      time: number,
      stopfunc?: (arg: T) => boolean,
      arg?: T
    ): void;

    click(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number,
      targetx: number,
      targety: number,
    ): boolean;

    setText(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number,
      text: string
    ): boolean;

    getText(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number
    ): string[] | false;

    parseText(
      type: number,
      x: number,
      y: number,
      xsize: number,
      ysize: number
    ): string;

    // ~~~ Start of general functions ~~~ //
    scrollDown(): void;
    clickRealm(realm: RealmIndex): boolean;
    findCharacter(info: CharacterInfo, startFromTop?: boolean): Control | false;
    getCharacters(): string[];
    getPermStatus(info: CharacterInfo): boolean;
    getPosition(): number;
    makeCharacter(info: CharacterInfo, randNameOnFail?: boolean): boolean;
    deleteCharacter(info: CharacterInfo): boolean;
    convertCharacter(info: CharacterInfo): boolean;
    loginCharacter(info: CharacterInfo, startFromTop?: boolean): boolean;
    setEmail(email?: string, domain?: string): boolean;
    makeAccount(info: AccountInfo): boolean;
    loginAccount(info: AccountInfo): boolean;
    joinChannel(channel: string): boolean;
    createGame(name: string, pass: string, diff: Difficulty, delay?: number): void;
    getGameList(): { gameName: string, players: string }[] | false;
    getQueueTime(): number;
    loginOtherMultiplayer(): boolean;
  }

  const ControlAction: IControlAction;
}
