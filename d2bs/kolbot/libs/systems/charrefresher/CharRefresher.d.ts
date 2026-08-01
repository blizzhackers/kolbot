export {};
declare global {
  // Value shape of the global `CharRefresher` const in CharRefresher.js (bound there via JSDoc @type).
  // Named CharRefresherType (not the bare "CharRefresher") - reusing the const's own name here
  // reproducibly triggers TS2451 "cannot redeclare block-scoped variable" in this program.
  interface CharRefresherType {
    LobbyTime: number | number[];

    /**
     * @param hash - The hash value.
     * @returns The loaded data.
     */
    load(hash: string): string;

    /**
     * @param hash - The hash value.
     * @param data - The data to save.
     */
    save(hash: string, data: string): void;

    remove(): void;
  }
}
