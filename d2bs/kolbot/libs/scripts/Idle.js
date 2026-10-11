/**
*  @filename    Idle.js
*  @author      theBGuy
*  @desc        Idle companion script
*
*/

/** @typedef {ScriptContext & { cleanup: () => void }} IdleContext */

const Idle = new Runnable(
  /** @param {IdleContext} ctx */
  function Idle (ctx) {
    const greet = [];

    /**
     * @param {number} mode
     * @param {number} param1
     * @param {number} param2
     * @param {string} name1
     */
    function gameEvent (mode, param1, param2, name1) {
      switch (mode) {
      case 0x02: // "%Name1(%Name2) joined our world. Diablo's minions grow stronger."
        // idle in town
        if (me.inTown && me.mode === sdk.player.mode.StandingInTown) {
          greet.push(name1);
        }
        break;
      }
    }

    /**
     * Removes the gameevent listener registered for the greeting/advertise feature.
     */
    ctx.cleanup = function () {
      removeEventListener("gameevent", gameEvent);
    };
    
    const startTime = getTickCount();
    // send anti-idle packet every ~20 minutes
    let idleTick = getTickCount() + Time.seconds(rand(1200, 1500));
    // move to waypoint/stash every 10-12 minutes
    let moveTick = getTickCount() + Time.seconds(rand(600, 720));

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

      if (getTickCount() - moveTick > 0) {
        if (me.inTown && me.mode === sdk.player.mode.StandingInTown) {
          Town.move("waypoint");
          Town.move("stash");
        }
        moveTick += Time.seconds(rand(600, 720));
        console.log("Moved to waypoint/stash, next move in: (" + Time.format(moveTick - getTickCount()) + ")");
      }

      delay(1000);
    }

    return true;
  },
  {
    startArea: sdk.areas.RogueEncampment,
    preAction: null,
    /** @param {IdleContext} ctx */
    cleanup: function (ctx) {
      ctx.cleanup();
    }
  }
);
