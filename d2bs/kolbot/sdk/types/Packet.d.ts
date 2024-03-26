// @ts-nocheck
declare global {
  namespace Packet {
    /**
     * Interact and open the menu of an NPC
     * @param {NPCUnit} unit
     * @returns {boolean}
     */
    function openMenu(unit: NPCUnit): boolean;

    /**
     * Start a trade action with an NPC
     * @param {NPCUnit} unit
     * @param {number} mode
     * @returns {boolean}
     */
    function startTrade(unit: NPCUnit, mode: number): boolean;

    /**
     * Buy an item from an interacted NPC
     * @param {NPCUnit} unit
     * @param {boolean} shiftBuy
     * @param {boolean} gamble
     * @returns {boolean}
     */
    function buyItem(unit: NPCUnit, shiftBuy: boolean, gamble: boolean): boolean;

    /**
     * Buy scrolls from an interacted NPC, we need this as a separate check because itemcount doesn't change
     * if the scroll goes into the tome automatically.
     * @param {NPCUnit} unit
     * @param {ItemUnit} [tome]
     * @param {boolean} [shiftBuy]
     * @returns {boolean}
     */
    function buyScroll(unit: NPCUnit, tome?: ItemUnit, shiftBuy?: boolean): boolean;

    /**
     * Sell an item to a NPC
     * @param {ItemUnit} unit
     * @returns {boolean}
     */
    function sellItem(unit: ItemUnit): boolean;

    /**
     * @param {ItemUnit} unit
     * @param {ItemUnit} tome
     * @returns {boolean}
     */
    function identifyItem(unit: ItemUnit, tome: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @returns {boolean}
     */
    function itemToCursor(item: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @returns {boolean}
     */
    function dropItem(item: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @returns {boolean}
     */
    function givePotToMerc(item: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @param {number} xLoc
     * @returns {boolean}
     */
    function placeInBelt(item: ItemUnit, xLoc: number): boolean;

    /**
     * @param {ItemUnit} who
     * @param {boolean} toCursor
     * @returns {boolean}
     */
    function click(who: ItemUnit, toCursor?: boolean): boolean;

    /**
     * @param {Unit} who
     * @returns {boolean}
     */
    function entityInteract(who: Unit): boolean;

    /**
     * @param {NPCUnit} who
     * @returns {boolean}
     */
    function cancelNPC(who: NPCUnit): boolean;

    /**
     * @param {ItemUnit} pot
     * @returns {boolean}
     */
    function useBeltItemForMerc(pot: ItemUnit): boolean;
    function castSkill(hand: number, wX: number, wY: number): void;
    function castAndHoldSkill(hand: number, wX: number, wY: number, duration?: number): void;
    function unitCast(hand: number, who: Monster | ItemUnit | ObjectUnit): void;
    function telekinesis(who: Monster | ItemUnit | ObjectUnit): boolean;
    function enchant(who: Monster | Player | MercUnit): boolean;
    function teleport(wX: number, wY: number): boolean;
    function teleWalk(x: number, y: number, maxDist: number): boolean;
    function questRefresh(): void;
    function flash(gid?: number, wait?: number): void;
    function changeStat(stat: number, value: number): void;
    function addListener(packetType: number | number[], callback: (packet: number) => any): null;
    function removeListener(callback: (packet: number) => any): null;
  }
}
export {};