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
    this.gaveBo = false;
    /** @type {Set<string>} */
    const totalBoed = new Set();
    /** @type {Set<string>} */
    const boGetters = new Set(Config.BattleOrders.Getters.map(name => name.toLowerCase()));

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
            console.log("Waiting " + Config.BattleOrders.Wait + " seconds for other players...");

            Misc.poll(() => {
              counter++;
              me.overhead(
                "Waiting " + Math.round(((tick + Time.seconds(Config.BattleOrders.Wait)) - getTickCount()) / 1000)
                + " Seconds for other players"
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

    function giveBO () {
      let tick = getTickCount();

      // check nearby players
      const playersToBo = getUnits(sdk.unittype.Player)
        .filter(p => boGetters.has(p.name.toLowerCase()) && p.distance < 20);

      // wait for players from boGetters list only, ignoring extra players
      if (!BattleOrders.gaveBo) {
        let boGettersNearby = new Set(playersToBo.map(p => p.name.toLowerCase()));

        while (boGettersNearby.size !== boGetters.size) {
          if (getTickCount() - tick >= Time.seconds(30)) {
            log("Begin");

            break;
          }

          me.overhead(
            "Waiting " + Math.round(((tick + Time.seconds(30)) - getTickCount()) / 1000)
            + " seconds for all BO getters."
          );

          // update nearby players to check only the ones in the getters list
          boGettersNearby = new Set(
            getUnits(sdk.unittype.Player)
              .filter(p => boGetters.has(p.name.toLowerCase()) && p.distance < 20)
              .map(p => p.name.toLowerCase())
          );

          delay(1000);
        }
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
        }
      });

      if (boed) {
        delay(5000);
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
    let failTimer = Time.minutes(2);
    let nearPlayer;

    // Ready
    Precast.enabled = true;

    /**
    * @param {string} name 
    * @param {string} msg 
    */
    function chatEvent (name, msg) {
      if (!msg | !name) return;
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

          if (nearPlayer) {
            do {
              if (nearPlayer.name !== me.name) {
                let nearPlayerName = nearPlayer.name.toLowerCase();
                // there is a player near us and they are in the list of players to bo and in my party
                if (boGetters.has(nearPlayerName)
                    && !totalBoed.has(nearPlayerName)
                    && Misc.inMyParty(nearPlayerName)) {
                  let result = giveBO();
                  if (result.success) {
                    if (result.count === boGetters.size
                        || totalBoed.size === boGetters.size) {
                      // we bo-ed everyone we are set to, don't wait around any longer
                      break MainLoop;
                    }
                    // reset fail tick
                    tick = getTickCount();
                    // shorten waiting time since we've already started giving out bo's
                    BattleOrders.gaveBo = true;
                  }
                }
              } else {
                me.overhead(
                  "Waiting " + Math.round(((tick + failTimer) - getTickCount()) / 1000)
                    + " Seconds for other players"
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
                + " Seconds for other players"
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

          if (getTickCount() - tick >= failTimer) {
            log("ÿc1BO timeout fail.");
            Config.BattleOrders.QuitOnFailure && scriptBroadcast("quit");

            break MainLoop;
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

      if (Config.BattleOrders.Getters.length > 0) {
        const failedToBo = getFailedToBO();
        if (failedToBo.length > 0) {
          log("Failed to bo: " + failedToBo.join(", "));
        } else {
          log("All designated players received BO.");
        }
      }

    } catch (e) {
      console.error(e);
    } finally {
      BattleOrders.gaveBo = false;
      removeEventListener("chatmsg", chatEvent);
    }

    return true;
  },
  {
    startArea: sdk.areas.CatacombsLvl2
  }
);
