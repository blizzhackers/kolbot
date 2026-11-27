export {};
declare global {
  // Manualplay's addition to the global Pickit - kept out of sdk/types/Pickit.d.ts so the base
  // interface only describes what the base implementation provides.
  interface Pickit {
    /** Stripped-down pickup loop for map mode; `range` is required (no default in the impl). */
    basicPickItems(range: number): boolean;
  }
}
