// Exported (not just ambient) because libs/SoloPlay/Core/MuleloggerOverrides.js imports this
// type directly via `import("../../systems/mulelogger/MuleLogger").MuleLoggerType`.
// The `MuleLogger` const itself is bound in MuleLogger.js via JSDoc @type - no `declare global`
// value declaration here, that would collide (both files are global scripts).
export interface MuleLoggerType {
  LogGame: [string, string];
  LogNames: boolean;
  LogItemLevel: boolean;
  LogEquipped: boolean;
  LogMerc: boolean;
  SaveScreenShot: boolean;
  AutoPerm: boolean;
  IngameTime: number;
  LogAccounts: { [account: string]: string[] };

  // Methods
  inGameCheck(): boolean;

  /**
   * Save perm status to logs/MuleLogPermInfo.json.
   * @param charPermInfo - The character's permanent status information.
   */
  savePermedStatus(charPermInfo?: { charname: string; perm: boolean }): void;

  /**
   * Load perm status from logs/MuleLogPermInfo.json.
   * @returns The character's permanent status information.
   */
  loadPermedStatus(): { charname: string; perm: boolean };

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

  dumpItemStats(item: ItemUnit): Record<string, number | string>;

  /**
   * Log kept item stats in the manager.
   * @param unit - The item unit.
   * @param logIlvl - Log the item's item level. Default: `LogItemLevel` value.
   * @returns The logged item information.
   */
  logItem(
    unit: ItemUnit,
    logIlvl?: boolean,
  ): {
    itemColor: number;
    invTrans: number;
    image: string;
    title: string;
    description: string;
    header: string;
    sockets: ItemUnit[];
  };

  /**
   * Log character to D2Bot# itemviewer.
   * @param logIlvl - Log the item's item level. Default: `LogItemLevel` value.
   * @param logName - Log the character's name. Default: `LogNames` value.
   * @param saveImg - Save the item image. Default: `SaveScreenShot` value.
   */
  logChar(logIlvl?: boolean, logName?: boolean, saveImg?: boolean): void;
}

declare global {
  // Ambient value declaration (Skill/Attack/Misc precedent - see those d.ts comments):
  // restores checker resolution of the @type-bound js const.
  const MuleLogger: MuleLoggerType;
}
