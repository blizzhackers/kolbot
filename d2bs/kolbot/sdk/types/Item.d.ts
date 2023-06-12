export {};
declare global {
  namespace Item {
    let useItemLog: boolean;

    function qualityToName(quality : number): string;
    function color(unit: ItemUnit, type: boolean): string;
    function hasTier(item: ItemUnit): boolean;
    function canEquip(item: ItemUnit): boolean;
    function equip(item: ItemUnit, bodyLoc: number): boolean;
    function getEquippedItem(bodyLoc: number): { classid: number, tier: number };
    function getBodyLoc(item: ItemUnit): number[];
    function autoEquipCheck(item: ItemUnit): boolean;
    function autoEquip(): boolean;
    function getItemDesc(unit: ItemUnit, logILvl: boolean): string;
    function getItemCode(unit: ItemUnit): string;
    function getItemSockets(unit: ItemUnit): ItemUnit[];
    function logger(action: string, unit: ItemUnit, text?: string): string;
    function logItem(action: string, unit: ItemUnit, keptLine?: string): boolean;
    function skipItem(id: number): boolean;
  }
}
