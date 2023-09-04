/**
*  @filename    NPC.js
*  @author      kolton, theBGuy
*  @desc        Handle NPC object
*
*/

const NPC = (new function NPC () {
  this.Akara = getLocaleString(sdk.locale.npcs.Akara).toLowerCase();
  this.Gheed = getLocaleString(sdk.locale.npcs.Gheed).toLowerCase();
  this.Charsi = getLocaleString(sdk.locale.npcs.Charsi).toLowerCase();
  this.Kashya = getLocaleString(sdk.locale.npcs.Kashya).toLowerCase();
  this.Warriv = getLocaleString(sdk.locale.npcs.Warriv).toLowerCase();

  this.Fara = getLocaleString(sdk.locale.npcs.Fara).toLowerCase();
  this.Drognan = getLocaleString(sdk.locale.npcs.Drognan).toLowerCase();
  this.Elzix = getLocaleString(sdk.locale.npcs.Elzix).toLowerCase();
  this.Greiz = getLocaleString(sdk.locale.npcs.Greiz).toLowerCase();
  this.Lysander = getLocaleString(sdk.locale.npcs.Lysander).toLowerCase();
  this.Jerhyn = getLocaleString(sdk.locale.npcs.Jerhyn).toLowerCase();
  this.Meshif = getLocaleString(sdk.locale.npcs.Meshif).toLowerCase();
  this.Atma = getLocaleString(sdk.locale.npcs.Atma).toLowerCase();

  this.Ormus = getLocaleString(sdk.locale.npcs.Ormus).toLowerCase();
  this.Alkor = getLocaleString(sdk.locale.npcs.Alkor).toLowerCase();
  this.Hratli = getLocaleString(sdk.locale.npcs.Hratli).toLowerCase();
  this.Asheara = getLocaleString(sdk.locale.npcs.Asheara).toLowerCase();

  this.Jamella = getLocaleString(sdk.locale.npcs.Jamella).toLowerCase();
  this.Halbu = getLocaleString(sdk.locale.npcs.Halbu).toLowerCase();
  this.Tyrael = getLocaleString(sdk.locale.npcs.Tyrael).toLowerCase();

  this.Malah = getLocaleString(sdk.locale.npcs.Malah).toLowerCase();
  this.Anya = getLocaleString(sdk.locale.npcs.Anya).toLowerCase();
  this.Larzuk = getLocaleString(sdk.locale.npcs.Larzuk).toLowerCase();
  this.Qual_Kehk = getLocaleString(sdk.locale.npcs.QualKehk).toLowerCase();
  this.Nihlathak = getLocaleString(sdk.locale.npcs.Nihlathak2).toLowerCase();

  this.Cain = getLocaleString(sdk.locale.npcs.DeckardCain).toLowerCase();

  /**
   * Returns the act(s) where the given NPC can be found.
   * @param {string} name - The name of the NPC.
   * @returns {Array<number>} An array of act numbers where the NPC can be found.
   */
  this.getAct = function (name) {
    if (name === NPC.Cain) return [me.act];
    if (name === NPC.Warriv) return [1, 2];
    if (name === NPC.Meshif) return [2, 3];
    switch (true) {
    case [NPC.Akara, NPC.Gheed, NPC.Charsi, NPC.Kashya, NPC.Warriv].includes(name):
      return [1];
    case [NPC.Fara, NPC.Drognan, NPC.Elzix, NPC.Greiz, NPC.Lysander, NPC.Jerhyn, NPC.Atma].includes(name):
      return [2];
    case [NPC.Ormus, NPC.Alkor, NPC.Hratli, NPC.Asheara].includes(name):
      return [3];
    case [NPC.Jamella, NPC.Halbu, NPC.Tyrael].includes(name):
      return [4];
    case [NPC.Malah, NPC.Anya, NPC.Larzuk, NPC.Qual_Kehk, NPC.Nihlathak].includes(name):
      return [5];
    }
    return [];
  };
  Object.defineProperty(this, "getAct", {
    enumerable: false,
  });
});
