/**
*  @filename    Idle.js
*  @author      theBGuy
*  @desc        Idle companion script
*
*/

function Idle () {
  const greet = [];
  // eslint-disable-next-line no-unused-vars
  function gameEvent (mode, param1, param2, name1, name2) {
    switch (mode) {
    case 0x02:
      // idle in town
      me.inTown && me.mode === sdk.player.mode.StandingInTown && greet.push(name1);

      break;
    }
  }

  try {
    const startTime = getTickCount();
    let idleTick = getTickCount() + Time.seconds(rand(1200, 1500));
    if (Config.Idle.Advertise) {
      addEventListener("gameevent", gameEvent);
    }

    while (true) {
      if (!me.inArea(sdk.areas.RogueEncampment)) {
        Town.goToTown(1);
      } else if (Town.getDistance("stash") > 10) {
        Town.move("stash");
      }
      if (Config.Idle.MaxGameLength > 0
        && getTickCount() - startTime > Time.minutes(Config.Idle.MaxGameLength)) {
        break;
      }
      if (Config.Idle.Advertise) {
        while (greet.length) {
          let name = greet.shift();
          say("!Welcome " + name + ". " + Config.Idle.AdvertiseMessage);
        }
      }
      if (getTickCount() - idleTick > 0) {
        Packet.questRefresh();
        idleTick += Time.seconds(rand(1200, 1500));
        console.log("Sent anti-idle packet, next refresh in: (" + Time.format(idleTick - getTickCount()) + ")");
      }

      delay(1000);
    }

    return true;
  } finally {
    // cleanup
    removeEventListener("gameevent", gameEvent);
  }
}
