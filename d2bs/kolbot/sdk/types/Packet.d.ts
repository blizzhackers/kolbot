// @ts-nocheck
export {};
declare global {
  // Value shape of the global `Packet` const in libs/core/Packet.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Packet {
    /** Last teleWalk tick; lazily initialized on first call, not part of the initial object literal. */
    telewalkTick?: number;

    /**
     * Interact and open the menu of an NPC
     * @param {NPCUnit} unit
     * @returns {boolean}
     */
    openMenu(unit: NPCUnit): boolean;

    /**
     * Start a trade action with an NPC
     * @param {NPCUnit} unit
     * @param {number} mode
     * @returns {boolean}
     */
    startTrade(unit: NPCUnit, mode: number): boolean;

    /**
     * Buy an item from an interacted NPC
     * @param {NPCUnit} unit
     * @param {boolean} shiftBuy
     * @param {boolean} gamble
     * @returns {boolean}
     */
    buyItem(unit: NPCUnit, shiftBuy: boolean, gamble: boolean): boolean;

    /**
     * Buy scrolls from an interacted NPC, we need this as a separate check because itemcount doesn't change
     * if the scroll goes into the tome automatically.
     * @param {NPCUnit} unit
     * @param {ItemUnit} [tome]
     * @param {boolean} [shiftBuy]
     * @returns {boolean}
     */
    buyScroll(unit: NPCUnit, tome?: ItemUnit, shiftBuy?: boolean): boolean;

    /**
     * Sell an item to a NPC
     * @param {ItemUnit} unit
     * @returns {boolean}
     */
    sellItem(unit: ItemUnit): boolean;

    /**
     * @param {ItemUnit} unit
     * @param {ItemUnit} tome
     * @returns {boolean}
     */
    identifyItem(unit: ItemUnit, tome: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @returns {boolean}
     */
    itemToCursor(item: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @returns {boolean}
     */
    dropItem(item: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @returns {boolean}
     */
    givePotToMerc(item: ItemUnit): boolean;

    /**
     * @param {ItemUnit} item
     * @param {number} xLoc
     * @returns {boolean}
     */
    placeInBelt(item: ItemUnit, xLoc: number): boolean;

    /**
     * @param {ItemUnit} who
     * @param {boolean} toCursor
     * @returns {boolean}
     */
    click(who: ItemUnit, toCursor?: boolean): boolean;

    /**
     * @param {Unit} who
     * @returns {boolean}
     */
    entityInteract(who: Unit): boolean;

    /**
     * @param {NPCUnit} who
     * @returns {boolean}
     */
    initNPC(who: NPCUnit): boolean;

    /**
     * @param {NPCUnit} who
     * @returns {boolean}
     */
    cancelNPC(who: NPCUnit): boolean;

    /**
     * @param {ItemUnit} pot
     * @returns {boolean}
     */
    useBeltItemForMerc(pot: ItemUnit): boolean;
    castSkill(hand: number, wX: number, wY: number): void;
    castAndHoldSkill(hand: number, wX: number, wY: number, duration?: number): void;
    unitCast(hand: number, who: Monster | ItemUnit | ObjectUnit): void;
    telekinesis(who: Monster | ItemUnit | ObjectUnit): boolean;
    enchant(who: Monster | Player | MercUnit): boolean;
    teleport(wX: number, wY: number): boolean;

    /**
     * @deprecated
     */
    teleWalk(x: number, y: number, maxDist: number): boolean;
    questRefresh(): void;
    flash(gid?: number, wait?: number): void;

    /**
     * @deprecated
     */
    changeStat(stat: number, value: number): void;

    /**
     * Specialized wrapper for addEventListener("gamepacket", ...) - filters by packet type(s) before invoking callback.
     * @returns the callback (for later removeListener), or null if packetType resolved to an empty list.
     */
    addListener(
      packetType: number | number[],
      callback: (packet: ArrayBufferLike) => boolean,
    ): ((packet: ArrayBufferLike) => boolean) | null;
    /** Wrapper for removeEventListener("gamepacket", callback). */
    removeListener(callback: (packet: ArrayBufferLike) => boolean): void;
  }
}
