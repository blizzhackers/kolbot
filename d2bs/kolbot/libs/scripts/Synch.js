/**
*  @filename    Synch.js
*  @author      kolton
*  @desc        sync script? It's unused but works with Synch2.js
*
*/

let Synched = false;
let uRdyMsg = "I'm rdy, u?";
let rdyMsg = "rdy";

function messageHandler(nick, msg) {
  if (nick !== me.name) {
    if (msg === uRdyMsg) {
      say(rdyMsg);
      Synched = true;
    } else if (msg === rdyMsg) {
      Synched = true;
    } else if (msg === "Yo, I'm rdy, u?") {
      say("No");
      quit();
    }
  }
}

function Synch() {
  let i, party, j;

  addEventListener("chatmsg", messageHandler);

  delay(1000);
  say(uRdyMsg);

  for (i = 0; i < 720 && !Synched; i += 1) {
    delay(1000);

    for (j = 0; j < Config.Synch.WaitFor.length; j += 1) {
      party = getParty(Config.Synch.WaitFor[j]);
      if (!party) {
        D2Bot.printToConsole("WaitFor not in game: " +
            Config.Synch.WaitFor[j] + " so quitting.");

        removeEventListener("chatmsg", messageHandler);
        quit();
        return false;
      }
    }
  }

  if (!Synched) {
    D2Bot.printToConsole("Failed to sync.");
    quit();
  }

  removeEventListener("chatmsg", messageHandler);

  return true;
}
