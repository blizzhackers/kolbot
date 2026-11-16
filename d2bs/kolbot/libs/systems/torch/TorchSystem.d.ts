export {};
declare global {
  interface TorchSystemFarmerProfile {
    KeyFinderProfiles: string[];
    FarmGame: string;
    profile?: string;
  }

  // Value shape of the global `TorchSystem` const in TorchSystem.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  interface ITorchSystem {
    FarmerProfiles: { [key: string]: TorchSystemFarmerProfile };
    inGame: boolean;
    check: boolean;
    getFarmers(): TorchSystemFarmerProfile[] | false;
    isFarmer(): TorchSystemFarmerProfile | false;
    inGameCheck(): boolean;
    keyCheck(): number[];
    outOfGameCheck(): boolean;
    waitForKeys(): void;
  }
}
