export {};
declare global {
  namespace NTIP {
    function OpenFile(filepath: string, notify: boolean): void;
    function CheckItem(unit: Unit, entryList?: [] | false, verbose?: boolean): void;
  }
}
