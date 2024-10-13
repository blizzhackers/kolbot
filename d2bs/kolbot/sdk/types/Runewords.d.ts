export {};
declare global {
  /**
   * @property {string} name - The name of the runeword.
   * @property {number} sockets - The number of sockets required for the item.
   * @property {Array<number>} runes - Array of rune IDs required for the runeword.
   * @property {Array<number>} itemTypes - Array of item type IDs the runeword can be applied to.
   * @method ladderRestricted - Returns true if we are unable to make the runeword because we are not on ladder.
   */
  interface runeword {
    name: string;
    sockets: number;
    runes: number[];
    itemTypes: number[];
    _ladder: boolean;
    reqLvl: number;
    ladderRestricted: () => boolean;
  }

  namespace Runeword {
    const AncientsPledge: runeword;
    const Black: runeword;
    const Fury: runeword;
    const HolyThunder: runeword;
    const Honor: runeword;
    const KingsGrace: runeword;
    const Leaf: runeword;
    const Lionheart: runeword;
    const Lore: runeword;
    const Malice: runeword;
    const Melody: runeword;
    const Memory: runeword;
    const Nadir: runeword;
    const Radiance: runeword;
    const Rhyme: runeword;
    const Silence: runeword;
    const Smoke: runeword;
    const Stealth: runeword;
    const Steel: runeword;
    const Strength: runeword;
    const Venom: runeword;
    const Wealth: runeword;
    const White: runeword;
    const Zephyr: runeword;
    const Beast: runeword;
    const Bramble: runeword;
    const BreathoftheDying: runeword;
    const CallToArms: runeword;
    const ChainsofHonor: runeword;
    const Chaos: runeword;
    const CrescentMoon: runeword;
    const Delirium: runeword;
    const Doom: runeword;
    const Duress: runeword;
    const Enigma: runeword;
    const Eternity: runeword;
    const Exile: runeword;
    const Famine: runeword;
    const Gloom: runeword;
    const HandofJustice: runeword;
    const HeartoftheOak: runeword;
    const Kingslayer: runeword;
    const Passion: runeword;
    const Prudence: runeword;
    const Sanctuary: runeword;
    const Splendor: runeword;
    const Stone: runeword;
    const Wind: runeword;
    const Brand: runeword;
    const Death: runeword;
    const Destruction: runeword;
    const Dragon: runeword;
    const Dream: runeword;
    const Edge: runeword;
    const Faith: runeword;
    const Fortitude: runeword;
    const Grief: runeword;
    const Harmony: runeword;
    const Ice: runeword;
    const Infinity: runeword;
    const Insight: runeword;
    const LastWish: runeword;
    const Lawbringer: runeword;
    const Oath: runeword;
    const Obedience: runeword;
    const Phoenix: runeword;
    const Pride: runeword;
    const Rift: runeword;
    const Spirit: runeword;
    const VoiceofReason: runeword;
    const Wrath: runeword;
    const Bone: runeword;
    const Enlightenment: runeword;
    const Myth: runeword;
    const Peace: runeword;
    const Principle: runeword;
    const Rain: runeword;
    const Treachery: runeword;
    const Test: runeword;

    function findByName(name: string): runeword | undefined;
    function findByRune(rune: number): runeword[];
    function findByType(type: number): runeword[];

    function addRuneword(name: string, sockets: number, runes: number | number[], itemTypes: number | number[]): runeword | boolean;
  }

  namespace Runewords {
    function init(): void
    function validItem(item: any): void
    function buildLists(): void
    function update(classid: any, gid: any): void
    function checkRunewords(): void
    function checkItem(unit: any): boolean
    function keepItem(unit: any): boolean
    function getBase(runeword: any, base: any, ethFlag: any, reroll: any): void
    function socketItem(base: any, rune: any): void
    function getScroll(): void
    function makeRunewords(): void
    function rerollRunewords(): void
  }
}
