export {};

declare global {
  // Value shape of the global `Hooks` const in Hooks.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface Hooks {
    dashBoard: { x: number, y: number };
    portalBoard: { x: number, y: number };
    qolBoard: { x: number, y: number };
    resfix: { x: number, y: number };
    saidMessage: boolean;
    userAddon: boolean;
    enabled: boolean;
    flushed: boolean | number;

    init(): void;
    update(): void;
    flush(flag: boolean | number): boolean;
  }
}
