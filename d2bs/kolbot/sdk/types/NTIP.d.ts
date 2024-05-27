export {};
declare global {
  namespace NTIP {
    function addLine(itemString: string, fileName: string): boolean;
    function OpenFile(filepath: string, notify: boolean): boolean;
    function CheckQuantityOwned(item_type: (item: ItemUnit) => boolean, item_stats: (item: ItemUnit) => boolean): number;
    function Clear(): void;
    function generateTierFunc(tierType: string): (item: ItemUnit) => number;
    function GetTier(item: ItemUnit): number;
    function GetMercTier(item: ItemUnit): number;
    function IsSyntaxInt(ch: string): boolean;
    const parseAliasIn: {
      in: string;
      notin: string;
      _regex: RegExp;
      test: (input: string) => boolean;
      convert: (input: string) => string;
    };
    const _props: Map<string, string>;
    const _aliases: Map<string, string>;
    const _lists: Map<string, Record<string, number | string>>;
    function ParseLineInt(input: string, info: any): boolean;
    function CheckItem(item: ItemUnit, entryList?: [] | false, verbose?: boolean): number | { line: string, result: number };
  }
}
