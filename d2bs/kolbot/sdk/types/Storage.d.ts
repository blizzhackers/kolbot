// @ts-nocheck
export {};
declare global {
  /** An {x, y} buffer position within a Container - what FindSpot/MakeSpot resolve to. */
  type ContainerSpot = { x: number, y: number };

  // `Container` is a private constructor closed over inside Storage.js's IIFE (never assigned
  // to global) - only its instance shape (Storage.Inventory, Storage.Stash, ...) is public,
  // so this is a type-only declaration with no matching `declare const`/`declare function`.
  interface Container {
    /** The name of the container */
    name: string;
    /** The width of the container */
    width: number;
    /** The height of the container */
    height: number;
    /** The location of the container */
    location: number;
    /** A 2D array to store the containers items */
    buffer: number[][];
    /** A list of the items in the container */
    itemList: ItemUnit[];
    /** The number of open positions in the container */
    openPositions: number;

    /**
     * A function that marks an item in the container's buffer and adds it to the item list.
     * @param item
     */
    Mark(item: ItemUnit): boolean;

    /**
     * A function that checks if an item is locked in the container.
     * @param item
     * @param baseRef
     */
    IsLocked(item: ItemUnit, baseRef: number[][]): boolean

    /**
     * A function that resets the container's buffer and item list.
     */
    Reset(): boolean

    /**
     * Checks whether it is possible to fit an item in inventory given available non-locked space.
     * @param item
     */
    IsPossibleToFit(item: ItemUnit): boolean

    /**
     * A function that checks if an item can fit in the container.
     * @param item
     */
    CanFit(item: ItemUnit): boolean

    /**
     * Ensures the Horadric Cube sits at (0, 0) in the stash, relocating it there if needed.
     * No-op (returns true) for any container other than "Stash".
     * @param name
     */
    cubeSpot(name: string): boolean

    /**
     * Sorts the container's items into place, optionally prioritizing the given classids.
     * @param itemIdsLeft
     * @param itemIdsRight
     */
    SortItems(itemIdsLeft?: number[], itemIdsRight?: number[]): boolean

    /**
     * A function that finds a spot for an item in the container.
     * @param item
     * @param reverseX
     * @param reverseY
     * @param priorityClassIds
     */
    FindSpot(
      item: ItemUnit | { sizex: number, sizey: number },
      reverseX?: boolean,
      reverseY?: boolean,
      priorityClassIds?: number[]
    ): ContainerSpot | false

    /**
     * Makes room for an item at a location by moving blocking items elsewhere.
     * @param item
     * @param location
     * @param force
     */
    MakeSpot(item: ItemUnit, location: ContainerSpot, force?: boolean): ContainerSpot | false | -1

    /**
     * A function that moves an item to a location in a container
     * @param item
     * @param mX
     * @param mY
     */
    MoveToSpot(item: ItemUnit, mX: number, mY: number): boolean

    /**
     * A function that moves an item to a location in a container
     * @param item
     */
    MoveTo(item: ItemUnit): boolean

    /**
     * A function that dumps the information about the container to the console
     */
    Dump(): void

    /**
     * A function that returns the amount of space used in this container
     */
    UsedSpacePercent(): number

    /**
     * A function the returns an item list in comparison to a given reference array
     * @param baseRef
     */
    Compare(baseRef: number[][]): ItemUnit[] | false

    /**
     * returns a string representation of the source object
     * @deprecated
     */
    toSource(): string
  }

  /** Storage.Belt only: the general Container shape plus its belt-specific column check. */
  interface BeltContainer extends Container {
    /**
     * Returns needed-potion counts for each of the belt's 4 columns.
     * @param beltSize defaults to the belt's actual column count if omitted
     */
    checkColumns(beltSize?: 0 | 1 | 2 | 3 | 4): [number, number, number, number];
  }

  interface StorageInstance {
    StashY: 4 | 8 | 10;
    Inventory: Container;
    TradeScreen: Container;
    Stash: Container;
    Belt: BeltContainer;
    Cube: Container;
    InvRef: number[];

    BeltSize(): 1 | 2 | 3 | 4;
    Reload(): boolean;
    Init(): void;
  }
  // Built inside an IIFE in Storage.js and assigned via `global.Storage = Storage;` -
  // no top-level binding exists there to annotate, so the value declaration stays here.
  const Storage: StorageInstance;
}
