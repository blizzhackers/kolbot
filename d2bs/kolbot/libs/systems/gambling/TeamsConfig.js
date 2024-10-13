/**
*  @filename    TeamsConfig.js
*  @author      theBGuy
*  @desc        Configuration file for Gambling system
*
*/

(function (module) {
  module.exports = {
    /**
      Setting up:

      "Gamble Team 1": { // Put a unique team name here.

        goldFinders: ["GF Profile 1", "GF Profile 2"], // List of gold finder PROFILE names. They will join gamble games to drop gold

        gamblers: ["Gambler 1", "Gambler 2"], // List of gambler PROFILE names. They will keep gambling and picking up gold from gold finders.

        gambleGames: ["Gambling-", "HeyIGamble-"], // Games that gold finders will join, don't use numbers.

        goldTrigger: 2500000, // Minimum amount of gold before giving it to gamblers.

        goldReserve: 200000 // Amount of gold to keep after dropping.
      }

      Once set up properly, the gold finders will run their own games and join gamblers' games when they're out of gold.
    */
    "Gamble Team 1": {
      goldFinders: [""],
      gamblers: [""],
      gambleGames: [""],

      goldTrigger: 2500000,
      goldReserve: 200000
    },
  };
})(module);
