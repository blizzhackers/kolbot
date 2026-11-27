export {};

declare global {
  // Value shape of the global `MapMode` const in MapMode.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface MapMode {
    mapHelperFilePath: string;

    include(): void;
    generalSettings(): void;
  }
}
