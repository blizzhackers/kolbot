export {};
declare global {
  // Manualplay's additions to the global Pather. Declared HERE, not in sdk/types/Pather.d.ts:
  // override-layer members stay with their layer so the base interface only describes what the
  // base implementation provides.
  interface Pather {
    /**
     * Early-abort flag for the manualplay move overrides: raised by {@link Pather.stopEvent} and
     * cleared by the move that observes it.
     */
    stop: boolean;
    /** @param key forwarded by the `keyup` event; Numpad9 while not idle raises {@link Pather.stop}. */
    stopEvent(key: number): void;
  }
}
