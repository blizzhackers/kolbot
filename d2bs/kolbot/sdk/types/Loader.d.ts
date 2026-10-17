export {};
declare global {
  type GlobalScript = () => boolean;
  type ScriptContext = { [key: string]: unknown };

  interface RunnableOptions<TContext extends ScriptContext = ScriptContext> {
    setup?: (ctx: TContext) => void;
    preAction?: (ctx: TContext) => void;
    postAction?: (ctx: TContext) => void;
    cleanup?: (ctx: TContext) => void;
    forceTown?: boolean;
    bossid?: number;
    startArea?: number;
  }

  // @ts-ignore
  class Runnable<TContext extends ScriptContext = ScriptContext> {
    constructor(action: (ctx: TContext) => boolean, options: Partial<RunnableOptions<TContext>>);

    action: (ctx: TContext) => boolean;
    startArea: number | null;
    setup: ((ctx: TContext) => void) | null;
    preAction: (ctx: TContext) => void;
    postAction: ((ctx: TContext) => void) | null;
    cleanup: ((ctx: TContext) => void) | null;
    forceTown: boolean;
    bossid: number | null;
  }

  // Value shape of the global `Loader` const in Loader.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Loader {
    fileList: string[];
    scriptList: string[];
    scriptIndex: number;
    skipTown: string[];
    firstScriptAct: number;
    currentScript: GlobalScript | Runnable | null;
    nextScript: Runnable | null;
    doneScripts: Set<string>;
    tempList: string[];
    registry: Record<string, GlobalScript | Runnable>;

    init(): void;
    getScripts(): void;
    _runCurrent(ctx: ScriptContext): boolean;
    /** @see http://stackoverflow.com/questions/728360/copying-an-object-in-javascript#answer-728694 */
    clone<T>(obj: T): T;
    copy<T extends object>(from: T, to: object): void;
    loadScripts(): void;
    runScript(name: string, configOverride?: Partial<IConfig> | (() => void)): boolean;
    scriptName(offset?: number): string;
    register<T extends GlobalScript | Runnable>(name: string, script: T): T;
    resolve(name: string): GlobalScript | Runnable | undefined;
  }

  // Value shape of the global `Scripts` const in Config.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  type Scripts = {
    [key in KolbotScript]: boolean | Partial<IConfig>;
  };
}
