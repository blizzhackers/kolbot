export {};
declare global {
  const NTIPAliasType: Record<string, number>;
  const NTIPAliasClassID: Record<string, number>;
  const NTIPAliasClass: Record<string, number>;
  const NTIPAliasQuality: Record<string, number>;
  const NTIPAliasFlag: Record<string, number>;
  const NTIPAliasColor: Record<string, number>;
  const NTIPAliasStat: Record<string, number>;

  /** The parsed { line, file, string } info attached to each raw or generated NIP line. */
  interface NTIPLineInfo {
    line: number;
    file: string;
    string: string;
  }

  /** Optional 3rd part of a parsed NIP line: quantity cap and/or tier-scoring functions. */
  interface NTIPWantedSpec {
    MaxQuantity?: number;
    Tier?: (item: ItemUnit) => number;
    Merctier?: (item: ItemUnit) => number;
  }

  /** A single compiled NIP line: [type test, stat test, optional wanted-spec]. */
  type NTIPEntry = [
    ((item: ItemUnit) => boolean) | undefined,
    ((item: ItemUnit) => boolean) | undefined,
    NTIPWantedSpec | undefined
  ];

  // Value shape of the global `NTIP` const in NTItemParser.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Ambient value declaration (Skill/Attack/Misc precedent): the checker leaves some
  // @type-bound js consts unresolved or any (cause undiagnosed); the ambient const
  // restores resolution and empirically does not collide with the js declaration.
  const NTIP: NTIP;

  interface NTIP {
    addLine(itemString: string, fileName?: string): boolean;
    OpenFile(filepath: string, notify: boolean): boolean;
    CheckQuantityOwned(
      item_type: ((item: ItemUnit) => boolean) | null,
      item_stats: ((item: ItemUnit) => boolean) | null,
    ): number;
    Clear(): void;
    generateTierFunc(tierType: string): (item: ItemUnit) => number;
    GetTier(item: ItemUnit): number;
    GetMercTier(item: ItemUnit): number;
    IsSyntaxInt(ch: string): boolean;
    parseAliasIn: {
      in: string;
      notin: string;
      _regex: RegExp;
      test: (input: string) => boolean;
      convert: (input: string) => string;
    };
    _props: Map<string, string>;
    _aliases: Map<string, string>;
    _lists: Map<string, Record<string, number>>;
    ParseLineInt(input: string, info: NTIPLineInfo): NTIPEntry | null | false;
    CheckItem(
      item: ItemUnit,
      entryList?: NTIPEntry[] | false,
      verbose?: boolean,
    ): number | { result: number; line: string | null };
    DebugCheckItem(
      item: ItemUnit,
      entryList?: NTIPEntry[] | false,
      verbose?: boolean,
    ): { result: number; line?: string }[];
  }
}
