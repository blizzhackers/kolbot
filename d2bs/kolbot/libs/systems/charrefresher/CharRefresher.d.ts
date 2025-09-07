export interface CharRefresherType {
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

declare global {
  const CharRefresher: CharRefresherType;
}
