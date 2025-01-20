// @ts-nocheck
export {};
declare global {
  function Container(name: string, width: number, height: number, location: number): void;
  interface Container {
    constructor(name: string, width: number, height: number, location: number): Container;
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
    Reset(): void

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
     * A function that finds a spot for an item in the container.
     * @param item 
     */
    FindSpot(item: ItemUnit): PathNode | false
    
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

  type storage = {
    StashY: 4 | 8 | 10;
    Inventory: Container;
    TradeScreen: Container;
    Stash: Container;
    Belt: Container;
    Cube: Container;
    InvRef: number[];

    BeltSize(): 1 | 2 | 3 | 4;
    Reload(): void;
    Init(): void;
  }
  const Storage: storage;
}
