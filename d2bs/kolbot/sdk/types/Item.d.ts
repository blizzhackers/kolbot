export {};
declare global {
  // Value shape of the global `Item` const in Item.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Item {
    useItemLog: boolean;

    qualityToName(quality: number): string;
    color(unit: ItemUnit, type?: boolean): string;
    repairIngred(item: ItemUnit): number;
    hasTier(item: ItemUnit): boolean;
    canEquip(item: ItemUnit): boolean;
    equip(item: ItemUnit, bodyLoc: number): boolean;
    getEquippedItem(bodyLoc: number): { classid: number, tier: number };
    getBodyLoc(item: ItemUnit): number[];
    autoEquipCheck(item: ItemUnit): boolean;
    autoEquip(): boolean;
    getItemDesc(unit: ItemUnit, logILvl?: boolean): string;
    getItemCode(unit: ItemUnit): string;
    getItemSockets(unit: ItemUnit): string[];
    logger(action: string, unit: ItemUnit, text?: string): boolean;
    logItem(action: string, unit: ItemUnit, keptLine?: string): boolean;
    skipItem(id: number): boolean;
  }
}
