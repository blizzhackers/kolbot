declare global {
  /** A single named town spot: an [x, y] pair, or (rarely, e.g. NPC.Hratli) multiple pairs flattened. */
  type TownSpotCoords = number[];

  interface TownActSpot {
    initialized: boolean;
    stash?: TownSpotCoords;
    portalspot?: TownSpotCoords;
    waypoint?: TownSpotCoords;
    /** act 1 only, added once {@link Town.initialize} runs */
    fire?: TownSpotCoords;
    /** keyed by NPC name (see NPC.d.ts) or a landmark name (e.g. "palace", "sewers", "portal") */
    [key: string]: TownSpotCoords | boolean | undefined;
  }

  interface TownAct {
    spot: TownActSpot;
    /** Only ever set (dynamically, act 1 only) once {@link Town.initialize} has run. */
    initialized?: boolean;
  }

  // Value shape of the global `Town` const in Town.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Ambient value declaration - load-bearing, not decoration: top-level `Town.member = ...`
  // assignments elsewhere in the tree turn the js const into an expando/module symbol whose
  // members all widen to any (hover shows "module Town"). Declaring the const pins the
  // interface as the authority. Re-add if it ever disappears; see tools/audit/type-surface.mjs.
  const Town: Town;

  interface Town {
    telekinesis: boolean;
    sellTimer: number;
    lastChores: number;
    dontStashGids: Set<number>;
    choresActive: boolean;

    act: Record<Act, TownAct>;
    tasks: Map<
      Act,
      {
        Heal: NPC;
        Shop: NPC;
        Gamble: NPC;
        Repair: NPC;
        Merc: NPC;
        Key: NPC;
        CainID: NPC;
      }
    >;
    ignoredItemTypes: number[];
    ignoreType(type: number): boolean;
    doChores(repair?: boolean): boolean;
    npcInteract(name?: string, cancel?: boolean): boolean | NPCUnit;
    checkQuestItems(): void;
    canTpToTown(): boolean;
    initNPC(task?: string, reason?: string): boolean | NPCUnit;
    heal(): boolean;
    buyPotions(): boolean;
    shiftCheck(col: [number, number, number, number], beltSize: 0 | 2 | 1 | 4 | 3): boolean;
    checkColumns(beltSize: 0 | 2 | 1 | 4 | 3): [number, number, number, number];
    getPotion(npc: Unit, type: "hp" | "mp", highestPot?: 2 | 1 | 4 | 3 | 5): boolean | ItemUnit;
    fillTome(classid: number): boolean;
    /** @deprecated Use `me.checkScrolls` instead */
    checkScrolls(id: number): number;
    identify(): boolean;
    cainID(): boolean;
    identifyItem(unit: ItemUnit, tome: ItemUnit, packetID?: boolean): boolean;
    shopItems(): boolean;
    gambleIds: Set<number>;
    gamble(): boolean;
    needGamble(): boolean;
    getGambledItem(list?: number[]): false | ItemUnit;
    buyPots(quantity?: number, type?: string | number, drink?: boolean, force?: boolean, npc?: Unit): boolean;
    drinkPots(
      type?: string | number,
      log?: boolean,
    ): {
      potName: string;
      quantity: number;
    };
    buyKeys(): boolean;
    /** @deprecated Use `me.checkKeys` instead */
    checkKeys(): number;
    /** @deprecated Use `me.needKeys` instead */
    needKeys(): boolean;
    /** @deprecated Use `Cubing.repairIngredientCheck` instead */
    repairIngredientCheck(item: ItemUnit): boolean;
    /** @deprecated Use `Cubing.doRepairs` instead */
    cubeRepair(): boolean;
    /** @deprecated Use `Cubing.repairItem` instead */
    cubeRepairItem(item: ItemUnit): boolean;
    repair(force?: boolean): boolean;
    /** @deprecated Use `me.needRepair` instead */
    needRepair(): string[];
    /** @deprecated Use `me.getItemsForRepair` instead */
    getItemsForRepair(repairPercent: number, chargedItems: boolean): ItemUnit[];
    reviveMerc(): boolean;
    /** @deprecated Use `me.needMerc` instead */
    needMerc(): boolean;
    canStash(item: ItemUnit): boolean;
    stash(stashGold?: boolean): boolean;
    /** @deprecated Use `me.needStash` instead */
    needStash(): boolean;
    openStash(): boolean;
    getCorpse(): boolean;
    /** @todo Whats the point of this? @deprecated Use `me.checkShard` instead */
    checkShard(): boolean;
    /** @deprecated Use `me.clearBelt` instead */
    clearBelt(): boolean;
    clearScrolls(): boolean;
    clearInventory(): boolean;
    initialize(): boolean;
    getDistance(spot?: string): number;
    move(spot?: string, allowTK?: boolean): boolean;
    moveToSpot(spot?: string, allowTK?: boolean): boolean;
    goToTown(act?: Act, wpmenu?: boolean): boolean;
    visitTown(repair?: boolean): boolean;
    prepareForGemShrine(): boolean;
  }
}
export {};
