/**
*  @filename    IPHunter.js
*  @author      kolton, Mercoory
*  @desc        search for a "hot" IP and stop if the correct server is found
*  @changes     2020.01 - more beeps and movements (anti drop measure) when IP is found
*               overhead messages with countdown timer; logs to D2Bot console
*
*/

function IPHunter () {
  const ip = Number(me.gameserverip.split(".")[3]);

  if (Config.IPHunter.IPList.includes(ip)) {
    load("threads/antiidle.js");
    const foundMsg = "IPHunter: IP found! - [" + ip + "] Game is : " + me.gamename + "//" + me.gamepassword;
    D2Bot.printToConsole(foundMsg, sdk.colors.D2Bot.DarkGold);
    console.log(foundMsg);
    me.overhead(":D IP found! - [" + ip + "]");
    me.maxgametime = 0;

    for (let i = 12; i > 0; i -= 1) {
      me.overhead(":D IP found! - [" + ip + "]" + (i - 1) + " beep left");
      beep(); // works if windows sounds are enabled
      delay(250);
    }

    while (true) {
      /* // remove comment if you want beeps at every movement
      for (let i = 12; i != 0; i -= 1) {
        me.overhead(":D IP found! - [" + ip + "]" + (i-1) + " beep left");
        beep(); // works if windows sounds are enabled
        delay(250);
      }
      */

      me.overhead(":D IP found! - [" + ip + "]");
      try {
        Town.move("waypoint");
        Town.move("stash");
      } catch (e) {
        // ensure it doesnt leave game by failing to walk due to desyncing.
      }

      for (let i = (12 * 60); i > 0; i -= 1) {
        me.overhead(":D IP found! - [" + ip + "] Next movement in: " + i + " sec.");
        delay(1000);
      }
    }
  }

  for (let i = (Config.IPHunter.GameLength * 60); i > 0; i -= 1) {
    me.overhead(":( IP : [" + (ip) + "] NG: " + i + " sec");
    delay(1000);
  }

  D2Bot.printToConsole("IPHunter: IP was [" + ip + "]", sdk.colors.D2Bot.Gray);

  return true;
}
