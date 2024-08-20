export {};
declare global {
  type GlobalScript = () => boolean;
  interface Runnable {
    startArea: number | null;
    forceTown: boolean;
    bossid: number | null;
    preAction: () => any;
    action: () => boolean;
    postAction: () => any;
    cleanup: () => any;
  }
  
  namespace Loader {
    const fileList: string[];
    const scriptList: string[];
    const scriptIndex: number;
    const skipTown: string[];
    const firstScriptAct: number;
    const currentScript: GlobalScript | Runnable | null;
    const nextScript: GlobalScript | Runnable | null;
    const doneScripts: Set<string>;
    const tempList: string[];

    function init(): void;
    function getScripts(): void;
    function _runCurrent(): boolean;
    function clone(obj: any): void;
    function copy(from: any, to: any): void;
    function loadScripts(): void;
    function runScript(name: string, configOverride: Object | (() => any)): boolean;
    function scriptName(offset?: number): string;
  }

  type Scripts = {
    [key: string]: boolean;
  };

  const Scripts: Scripts;
}
