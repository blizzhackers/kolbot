export {};

declare global {
  /** Team entry shape from TeamsConfig.js, plus role flags set at runtime by Gambling.getInfo */
  interface GamblingTeam {
    goldFinders: string[];
    gamblers: string[];
    gambleGames: string[];
    goldTrigger: number;
    goldReserve: number;
    /** Set by getInfo() when the current profile matches a goldFinders entry */
    goldFinder?: boolean;
    /** Set by getInfo() when the current profile matches a gamblers entry */
    gambler?: boolean;
  }

  // Value shape of the global `Gambling` const in Gambling.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface IGambling {
    Teams: Record<string, GamblingTeam>;
    inGame: boolean;
    getInfo(profile?: string): GamblingTeam | false;
    inGameCheck(): boolean;
    dropGold(): void;
    outOfGameCheck(): boolean;
    /** Game [name, password] discovered via copydata from a gambler, else null before/without a reply */
    getGame(): string[] | null | false;
  }
}
