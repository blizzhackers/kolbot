/**
 *  @filename    BattleOrders.js
 *  @author      kolton, jmichelsen, theBGuy
 *  @desc        give or receive Battle Orders buff
 *
 */

// todo - define bo-er name, so bots who are getting bo know who is supposed to give it
// todo - use profile <-> profile communication so we don't need to set char names, Maybe shout global?
const BattleOrders = new Runnable(
  function BattleOrders () {
    /** @type {Set<string>} */
    const totalBoed = new Set();
    /** @type {Set<string>} */
    let boGetters = new Set(Config.BattleOrders.Getters.map(name => name.toLowerCase()));

    const boMode = {
      Give: 0,
      Receive: 1
    };

    function checkForPlayers () {
      if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");
    }

    function log (msg = "") {
      console.log(msg);
      me.overhead(msg);
    }

    function tardy () {
      let party;

      AreaInfoLoop:
      while (true) {
        try {
          checkForPlayers();
        } catch (e) {
          if (Config.BattleOrders.Wait) {
            let counter = 0;
            console.log("Waiting " + Config.BattleOrders.Wait + " seconds for other boGetters...");

            Misc.poll(() => {
              counter++;
              me.overhead(
                "Waiting " + Math.round(((tick + Time.seconds(Config.BattleOrders.Wait)) - getTickCount()) / 1000)
                + " seconds for other boGetters"
              );
              if (counter % 5 === 0) {
                return checkForPlayers();
              }
              return false;
            }, Time.seconds(Config.BattleOrders.Wait), Time.seconds(1));

            continue;
          } else {
            console.error(e);
            // empty game, don't wait
            return true;
          }
        }

        party = getParty();

        if (party) {
          do {
            if (party.name !== me.name && party.area) {
              break AreaInfoLoop; // Can read player area
            }
          } while (party.getNext());
        }

        delay(500);
      }

      if (party) {
        do {
          if ([
            sdk.areas.MooMooFarm,
            sdk.areas.ChaosSanctuary,
            sdk.areas.ThroneofDestruction,
            sdk.areas.WorldstoneChamber
          ].includes(party.area)) {
            log("ÿc1I'm late to BOs. Moving on...");

            return true;
          }
        } while (party.getNext());
      }

      return false; // Not late; wait.
    }

    /** Check for getters in game. */
    function getGetters () {
      const activeGetters = new Set();
      let player = getParty();
      if (player) {
        do {
          activeGetters.add(player.name.toLowerCase());
        } while (player.getNext());
      }
      boGetters = new Set(Config.BattleOrders.Getters
        .map(name => name.toLowerCase())
        .filter(name => activeGetters.has(name) && !totalBoed.has(name))
      );
    }

    /**
     * Checks if the giver is in game.
     * @returns {boolean}
     */
    function getGiver () {
      const giver = Config.BattleOrders.Giver.toLowerCase();
      const wait = Time.seconds(Config.BattleOrders.WaitForGiver);
      const tick = getTickCount();

      //console.debug("Start checking for boGiver: " + giver);

      while (getTickCount() - tick < wait) {
        const timeout = Math.floor(((tick + wait) - getTickCount()) / 1000);
        let player = getParty();
        if (player) {
          do {
            if (player.name && player.name.toLowerCase() === giver) {
              return true;
            }
          } while (player.getNext());
        }

        me.overhead("Waiting " + timeout + " seconds for " + giver);
        delay(250);
      }

      log("ÿc1BO Giver not in game. Moving on...");
      return false;
    }

    function giveBO () {
      let tick = getTickCount();

      // check nearby players
      let playersToBo = getUnits(sdk.unittype.Player)
        .filter(p =>
          boGetters.has(p.name.toLowerCase())
          && p.distance < 20
          && !totalBoed.has(p.name.toLowerCase())
        );

      // wait for players from boGetters list only, ignoring extra players
      while (new Set(playersToBo.map(p => p.name.toLowerCase())).size !== boGetters.size) {
        if (getTickCount() - tick >= Time.seconds(30)) {
          log("Begin");

          break;
        }

        me.overhead(
          "Waiting " + Math.round(((tick + Time.seconds(30)) - getTickCount()) / 1000)
          + " seconds for all getters to show up"
        );

        // update nearby players to check only the ones in the getters list
        playersToBo = getUnits(sdk.unittype.Player)
          .filter(p => boGetters.has(p.name.toLowerCase()) && p.distance < 20);

        delay(1000);
      }

      let boed = false;

      // cast BO on the relevant players
      playersToBo.forEach(p => {
        tick = getTickCount();

        if (copyUnit(p).x) {
          while (!p.getState(sdk.states.BattleOrders) && copyUnit(p).x) {
            if (getTickCount() - tick >= Time.minutes(1)) {
              log("ÿc1BO timeout fail.");

              if (Config.BattleOrders.QuitOnFailure) {
                quit();
              }

              break;
            }

            Precast.doPrecast(true);
            delay(1000);
          }

          totalBoed.add(p.name.toLowerCase());
          console.debug("Bo-ed " + p.name);
          boed = true;
          delay(250);
          boGetters.delete(p.name.toLowerCase());
        }
      });

      if (boGetters.size === 0) {
        return {
          success: boed,
          count: playersToBo.length
        };
      }

      return {
        success: boed,
        count: playersToBo.length
      };
    }

    // START
    try {
      Pather.useWaypoint(sdk.areas.CatacombsLvl2, true);
    } catch (wperror) {
      log("ÿc1Failed to take waypoint.");
      Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

      return false;
    }

    // don't bo until we are ready to do so
    Precast.enabled = false;
    Pather.moveTo(me.x + 6, me.y + 6);

    let tick = getTickCount();
    let failTimer = Time.seconds(40);
    let nearPlayer;

    // Ready
    Precast.enabled = true;

    /**
    * @param {string} name 
    * @param {string} msg 
    */
    function chatEvent (name, msg) {
      if (!msg || !name) return;
      if (!boGetters.has(name.toLowerCase())) return;
      if (msg === "got-bo") {
        console.log(name + " got bo");
        totalBoed.add(name.toLowerCase());
      }
    }

    /** @returns {string[]} */
    function getFailedToBO () {
      return Config.BattleOrders.Getters.filter(name => !totalBoed.has(name.toLowerCase()));
    }

    try {
      if (Config.BattleOrders.Mode === boMode.Give) {
        addEventListener("chatmsg", chatEvent);
      }

      MainLoop:
      while (true) {
        if (Config.BattleOrders.SkipIfTardy && tardy()) {
          break;
        }

        switch (Config.BattleOrders.Mode) {
        case boMode.Give:
          // check if anyone is near us
          nearPlayer = Game.getPlayer();
          getGetters();
          console.debug("Getters in game: " + [...boGetters].join(", "));
          if (nearPlayer) {
            do {
              if (nearPlayer.name !== me.name) {
                let nearPlayerName = nearPlayer.name.toLowerCase();
                // there is a player near us and they are in the list of players to bo and in my party
                if (boGetters.has(nearPlayerName)
                  && !totalBoed.has(nearPlayerName)
                  && Misc.inMyParty(nearPlayerName)) {
                  delay(1000);
                  let result = giveBO();
                  if (result.success) {
                    if (boGetters.size === 0) {
                      // we bo-ed everyone we are set to, don't wait around any longer
                      break MainLoop;
                    }
                    // reset fail tick
                    tick = getTickCount();
                  }
                }
              } else {
                me.overhead(
                  "Waiting " + Math.round(((tick + failTimer) - getTickCount()) / 1000)
                  + " seconds for other boGetters"
                );

                if (getTickCount() - tick >= failTimer) {
                  log("ÿc1Give BO timeout fail.");
                  log("Failed to bo: " + getFailedToBO().join(", "));
                  Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

                  break MainLoop;
                }
              }
            } while (nearPlayer.getNext());
          } else {
            me.overhead(
              "Waiting " + Math.round(((tick + failTimer) - getTickCount()) / 1000)
              + " seconds for other boGetters"
            );

            if (getTickCount() - tick >= failTimer) {
              log("ÿc1Give BO timeout fail.");
              log("Failed to bo: " + getFailedToBO().join(", "));
              Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

              break MainLoop;
            }
          }

          break;
        case boMode.Receive:
          if (me.getState(sdk.states.BattleOrders)) {
            log("Got bo-ed");
            say("got-bo");
            delay(1000);

            break MainLoop;
          }

          if (Config.BattleOrders.Giver) {
            if (!getGiver()) {
              console.log("ÿc1BO timeout fail.");
              Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

              break MainLoop;
            }
          } else {
            if (getTickCount() - tick >= failTimer) {
              log("ÿc1BO timeout fail.");
              Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");
                
              break MainLoop;
            }
          }

          break;
        }

        delay(500);
      }

      if (Loader.nextScript && Loader.nextScript.startArea) {
        Pather.useWaypoint(Loader.nextScript.startArea);
      } else {
        (Pather.useWaypoint(sdk.areas.RogueEncampment) || Town.goToTown());
      }

      // what's the point of this?
      if (Config.BattleOrders.Mode === boMode.Give && Config.BattleOrders.Idle) {
        for (let i = 0; i < Config.BattleOrders.Getters.length; i += 1) {
          while (Misc.inMyParty(Config.BattleOrders.Getters[i])) {
            delay(1000);
          }
        }
      }

    } catch (e) {
      console.error(e);
    } finally {
      removeEventListener("chatmsg", chatEvent);
    }

    return true;
  },
  {
    startArea: sdk.areas.CatacombsLvl2
  }
);
