//@ts-nocheck
declare global {
  /** A lowercased NPC name string, as returned by e.g. `NPC.Akara`. */
  type NPC = string;

  // Value shape of the global `NPC` const in NPC.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Named `NPCList` (not `NPC`) because `NPC` is already the name-string type above -
  // an interface can't merge with a type alias of the same name.
  interface NPCList {
    /**
     * Returns the act(s) where the given NPC can be found.
     * @param name - The name of the NPC.
     * @returns An array of act numbers where the NPC can be found.
     */
    getAct(name: string): number[];
    Akara: NPC;
    Gheed: NPC;
    Charsi: NPC;
    Kashya: NPC;
    Warriv: NPC;
    Fara: NPC;
    Drognan: NPC;
    Elzix: NPC;
    Greiz: NPC;
    Lysander: NPC;
    Jerhyn: NPC;
    Meshif: NPC;
    Atma: NPC;
    Ormus: NPC;
    Alkor: NPC;
    Hratli: NPC;
    Asheara: NPC;
    Jamella: NPC;
    Halbu: NPC;
    Tyrael: NPC;
    Malah: NPC;
    Anya: NPC;
    Larzuk: NPC;
    Qual_Kehk: NPC;
    Nihlathak: NPC;
    Cain: NPC;
  }
}
export {};
