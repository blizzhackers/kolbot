/**
*  @filename    TeamsConfig.js
*  @author      theBGuy
*  @desc        Configuration file for Crafting system
*
*/

(function (module) {
  module.exports = {
    "Team 1": {
      // List of profiles that will collect ingredients
      Collectors: [],

      // List of profiles that will craft/reroll items
      Workers: [],

      // List of Worker game names (without the numbers)
      CraftingGames: [],

      /*	BaseItems - list of base item class ids
      *	Ingredients - list of recipe ingredients
      *	SetAmount - number of full sets to gather before transfering
      *	Type - the type of recipe. Available options: "crafting", "runewords", "cubing"
      */
      Sets: [
        // LLD Crafting

        // Caster Belt set, char lvl 29
        // Light Belt classid 345, shopped at nightmare Elzix
        // Sharkskin Belt classid 391, shopped at nightmare Elzix
        //{BaseItems: [345, 391], Ingredients: [615, 643, 561], SetAmount: 2, Type: "crafting"},

        // Runeword Making

        // Spirit Runeset + Hel
        //{BaseItems: [29, 30, 31], Ingredients: [616, 618, 619, 620, 624], SetAmount: 2, Type: "runewords"},

        // Misc. Cubing

        // Reroll rare Diadem
        //{BaseItems: [421], Ingredients: [601, 601, 601], SetAmount: 1, Type: "cubing"}
      ]
    },
  };
})(module);
