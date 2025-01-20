declare global {
  namespace MuleLogger {
    const LogGame: [string, string];
    let LogNames: boolean;
    let LogItemLevel: boolean;
    let LogEquipped: boolean;
    let LogMerc: boolean;
    let SaveScreenShot: boolean;
    let AutoPerm: boolean;
    let IngameTime: number;
    const LogAccounts: { [account: string]: string[] };
    
    function inGameCheck(): boolean;
    /**
     * Save perm status to logs/MuleLogPermInfo.json.
     * @param charPermInfo - The character's permanent status information.
     */
    function savePermedStatus(charPermInfo?: { charname: string; perm: boolean }): void;

    /**
     * Load perm status from logs/MuleLogPermInfo.json.
     * @returns The character's permanent status information.
     */
    function loadPermedStatus(): { charname: string; perm: boolean };

    /**
     * @param hash - The hash value.
     * @returns The loaded data.
     */
    function load(hash: string): string;

    /**
     * @param hash - The hash value.
     * @param data - The data to save.
     */
    function save(hash: string, data: string): void;

    function remove(): void;

    /**
     * Log kept item stats in the manager.
     * @param unit - The item unit.
     * @param logIlvl - Log the item's item level. Default: `LogItemLevel` value.
     * @returns The logged item information.
     */
    function logItem(unit: ItemUnit, logIlvl?: boolean): {
      itemColor: string;
      image: string;
      title: string;
      description: string;
      header: string;
      sockets: any; // Update the type of `sockets` as needed
    };

    /**
     * Log character to D2Bot# itemviewer.
     * @param logIlvl - Log the item's item level. Default: `LogItemLevel` value.
     * @param logName - Log the character's name. Default: `LogNames` value.
     *  @param saveImg - Save the item image. Default: `SaveScreenShot` value.
     */
    function logChar(logIlvl?: boolean, logName?: boolean, saveImg?: boolean): void;

    // Add more functions and properties as needed
  }
}
export {};