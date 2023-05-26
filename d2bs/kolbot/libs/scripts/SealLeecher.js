/**
*  @filename    SealLeecher.js
*  @author      probably kolton, theBGuy
*  @desc        Leecher script. Works in conjuction with SealLeader script.
*
*/

function SealLeecher() {
  let commands = [];

  Town.goToTown(4);
  Town.doChores();
  Town.move("portalspot");

  if (!Config.Leader) {
    D2Bot.printToConsole("You have to set Config.Leader");
    D2Bot.stop();

    return false;
  }

  let chatEvent = function (nick, msg) {
    if (nick === Config.Leader) {
      commands.push(msg);
    }
  };

  try {
    addEventListener("chatmsg", chatEvent);

    // Wait until leader is partied
    while (!Misc.inMyParty(Config.Leader)) {
      delay(1000);
    }

    while (Misc.inMyParty(Config.Leader)) {
      if (commands.length > 0) {
        let command = commands.shift();

        switch (command) {
        case "in":
          if (me.inTown) {
            Pather.usePortal(sdk.areas.ChaosSanctuary, Config.Leader);
            delay(250);
          }

          if (getDistance(me, 7761, 5267) < 10) {
            Pather.walkTo(7761, 5267, 2);
          }

          break;
        case "out":
          if (!me.inTown) {
            Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader);
          }

          break;
        case "done":
          if (!me.inTown) {
            Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader);
          }

          return true; // End script
        }
      }

      if (me.dead) {
        while (me.mode === sdk.player.mode.Death) {
          delay(40);
        }

        me.revive();

        while (!me.inTown) {
          delay(40);
        }
      }

      if (!me.inTown) {
        let monster = Game.getMonster();

        if (monster) {
          do {
            if (monster.attackable && monster.distance < 20) {
              me.overhead("HOT");
              Pather.usePortal(sdk.areas.PandemoniumFortress, Config.Leader);
            }
          } while (monster.getNext());
        }
      }

      delay(100);
    }
  } finally {
    removeEventListener("chatmsg", chatEvent);
  }

  return true;
}
