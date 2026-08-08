export {};
declare global {
  // Value shape of the global `Item` const in Item.js (bound there via JSDoc @type).
  // No ambient const here, deliberately: Item.js is a global SCRIPT with no expando
  // assignments in this program, so its @type-bound const and this interface are one
  // merged symbol - an ambient `const Item` is TS2451 against it, and redundant anyway
  // (members already resolve through the bind; probe-verified 2026-08-02). An ambient
  // const becomes both legal and necessary only if the js file turns into a CJS module
  // or gains top-level `Item.member =` assignments in-program (see Town/Pickit).
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
