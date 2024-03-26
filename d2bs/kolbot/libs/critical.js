/**
* @filename    critical.js
* @author      theBGuy
* @desc        Simple loader file for the critical components of kolbot, without these we can't run
* 
*/

include("json2.js"); // I don't know if this one is actually critical but including it
include("polyfill.js");
me.ingame ? include("oog/D2Bot.js") : include("OOG.js");
