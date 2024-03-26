export {};
declare global {
  namespace Loader {
    const fileList: string[]
    const scriptList: string[];
    const scriptIndex: number;
    const skipTown: string[];

    function init(): void;
    function getScripts(): void;
    function clone(obj: any): void;
    function copy(from: any, to: any): void;
    function loadScripts(): void;
    function scriptName(offset?: number): void;
  }

  type Scripts = {
    [key: string]: boolean;
  };

  const Scripts: Scripts;
}
