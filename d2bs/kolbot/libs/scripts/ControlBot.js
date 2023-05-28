/**
*  @filename    ControlBot.js
*  @author      theBGuy
*  @credits     kolton
*  @desc        Chat controlled bot for other players. Can open cow portal, give waypoints on command, bo, or enchant
*
*/

function ControlBot () {
  const startTime = getTickCount();
  const chantDuration = Skill.getDuration(sdk.skills.Enchant);
  
  /** @constructor */
  function PlayerTracker () {
    this.firstCmd = getTickCount();
    this.commands = 0;
    this.ignored = false;
  }

  PlayerTracker.prototype.resetCmds = function () {
    this.firstCmd = getTickCount();
    this.commands = 0;
  };

  PlayerTracker.prototype.unIgnore = function () {
    this.ignored = false;
    this.commands = 0;
  };

  /** @constructor */
  function ChantTracker () {
    this.lastChant = getTickCount();
  }

  ChantTracker.prototype.reChant = function () {
    return getTickCount() - this.lastChant >= chantDuration - Time.minutes(1);
  };

  ChantTracker.prototype.update = function () {
    this.lastChant = getTickCount();
  };

  /** @type {Object.<string, PlayerTracker>} */
  const cmdNicks = {};
  /** @type {Object.<string, { timer: number, requests: number }>} */
  const wpNicks = {};
  /** @type {Set<string>} */
  const shitList = new Set();
  /** @type {Array<string>} */
  const greet = [];
  /** @type {Map<string, ChantTracker} */
  const chantList = new Map();

  /** @type {Map<number, Array<number>} */
  const wps = new Map([
    [1, [
      sdk.areas.ColdPlains, sdk.areas.StonyField,
      sdk.areas.DarkWood, sdk.areas.BlackMarsh,
      sdk.areas.OuterCloister, sdk.areas.JailLvl1,
      sdk.areas.InnerCloister, sdk.areas.CatacombsLvl2
    ]
    ],
    [2, [
      sdk.areas.A2SewersLvl2, sdk.areas.DryHills,
      sdk.areas.HallsoftheDeadLvl2, sdk.areas.FarOasis,
      sdk.areas.LostCity, sdk.areas.PalaceCellarLvl1,
      sdk.areas.ArcaneSanctuary, sdk.areas.CanyonofMagic
    ]
    ],
    [3, [
      sdk.areas.SpiderForest, sdk.areas.GreatMarsh,
      sdk.areas.FlayerJungle, sdk.areas.LowerKurast,
      sdk.areas.KurastBazaar, sdk.areas.UpperKurast,
      sdk.areas.Travincal, sdk.areas.DuranceofHateLvl2
    ]
    ],
    [4, [
      sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame
    ]
    ],
    [5, [
      sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau,
      sdk.areas.CrystalizedPassage, sdk.areas.GlacialTrail,
      sdk.areas.FrozenTundra, sdk.areas.AncientsWay, sdk.areas.WorldstoneLvl2
    ]
    ]
  ]);

  let command, nick;

  /**
   * @param {string} nick 
   * @returns {boolean}
   */
  const enchant = function (nick) {
    try {
      if (!Misc.inMyParty(nick)) {
        throw new Error("Accept party invite, noob.");
      }

      let unit = Game.getPlayer(nick);

      if (unit && unit.distance > 35) {
        throw new Error("Get closer.");
      }

      if (!unit) {
        let partyUnit = getParty(nick);

        if (!Misc.poll(() => partyUnit.inTown, 500, 50)) {
          throw new Error("You need to be in one of the towns.");
        }
        // wait until party area is readable?
        say("Wait for me at waypoint.");
        Town.goToTown(sdk.areas.actOf(partyUnit.area));

        unit = Game.getPlayer(nick);
      }

      if (unit) {
        do {
          // player is alive
          if (!unit.dead) {
            if (unit.distance >= 35) {
              throw new Error("You went too far away.");
            }
            Packet.enchant(unit);
            if (Misc.poll(() => unit.getState(sdk.states.Enchant), 500, 50)) {
              chantList.has(unit.name)
                ? chantList.get(unit.name).update()
                : chantList.set(unit.name, new ChantTracker());
            }
          }
        } while (unit.getNext());
      } else {
        say("I don't see you");
      }

      unit = Game.getMonster();

      if (unit) {
        do {
          // merc or any other owned unit
          if (unit.getParent() && unit.getParent().name === nick) {
            Packet.enchant(unit);
            delay(500);
          }
        } while (unit.getNext());
      }

      return true;
    } catch (e) {
      say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
      
      return false;
    }
  };

  /**
   * @param {string} nick 
   * @returns {boolean}
   */
  const bo = function (nick) {
    if (!Config.ControlBot.Bo) return false;

    try {
      if (!Misc.inMyParty(nick)) {
        throw new Error("Accept party invite, noob.");
      }

      let partyUnit = getParty(nick);

      // wait until party area is readable?
      if (!Misc.poll(() => Pather.wpAreas.includes(partyUnit.area), 500, 50)) {
        throw new Error("Can't find you or you're not somewhere with a waypoint");
      }
      Pather.useWaypoint(partyUnit.area);

      let unit = Game.getPlayer(nick);

      if (unit && unit.distance > 15) {
        say("Get closer.");
        
        if (!Misc.poll(() => unit.distance <= 15, Time.seconds(30), 50)) {
          throw new Error("You took to long. Going back to town");
        }
      }

      if (unit && unit.distance <= 15 && !unit.dead) {
        Misc.poll(function () {
          Precast.doPrecast(true);
          return unit.getState(sdk.states.BattleOrders);
        }, 5000, 1000);
        Pather.useWaypoint(sdk.areas.RogueEncampment);
      } else {
        throw new Error("I don't see you");
      }

      return true;
    } catch (e) {
      say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
      
      return false;
    }
  };

  const autoChant = function () {
    if (!Config.ControlBot.Chant.Enchant) return false;

    let chanted = [];
    let unit = Game.getPlayer();

    if (unit) {
      do {
        if (unit === me.name || unit.dead) continue;
        if (shitList.has(unit.name)) continue;
        if (!Misc.inMyParty(unit.name) || unit.distance > 40) continue;
        // allow rechanting someone if it's going to run out soon for them
        if (!unit.getState(sdk.states.Enchant)
          || (chantList.has(unit.name) && chantList.get(unit.name).reChant())) {
          Packet.enchant(unit);
          if (Misc.poll(() => unit.getState(sdk.states.Enchant), 500, 50)) {
            chanted.push(unit.name);
            chantList.has(unit.name)
              ? chantList.get(unit.name).update()
              : chantList.set(unit.name, new ChantTracker());
          }
        }
      } while (unit.getNext());
    }

    unit = Game.getMonster();

    if (unit) {
      do {
        if (unit.getParent()
          && chanted.includes(unit.getParent().name)
          && !unit.getState(sdk.states.Enchant)
          && unit.distance <= 40) {
          Packet.enchant(unit);
          // not going to re-enchant the minions for now though, will think on how best to handle that later
          if (Misc.poll(() => unit.getState(sdk.states.Enchant), 500, 50)) {
            chanted.push(unit.name);
          }
        }
      } while (unit.getNext());
    }

    return true;
  };

  const getLeg = function () {
    if (me.getItem(sdk.quest.item.WirtsLeg)) {
      return me.getItem(sdk.quest.item.WirtsLeg);
    }

    let leg, gid, wrongLeg;

    if (!Config.ControlBot.Cows.GetLeg) {
      leg = Game.getItem(sdk.items.quest.WirtsLeg);

      if (leg) {
        do {
          if (leg.name.includes("ÿc1")) {
            wrongLeg = true;
          } else if (leg.distance <= 15) {
            gid = leg.gid;
            Pickit.pickItem(leg);

            return me.getItem(-1, -1, gid);
          }
        } while (leg.getNext());
      }

      say("Bring the leg " + (wrongLeg ? "from this difficulty" : "") + " close to me.");

      return false;
    }

    if (!Pather.journeyTo(sdk.areas.Tristram)) {
      say("Failed to enter Tristram :(");
      Town.goToTown();

      return false;
    }

    Pather.moveTo(25048, 5177);

    let wirt = Game.getObject(sdk.quest.chest.Wirt);

    for (let i = 0; i < 8; i += 1) {
      wirt.interact();
      delay(500);

      leg = Game.getItem(sdk.quest.item.WirtsLeg);

      if (leg) {
        gid = leg.gid;

        Pickit.pickItem(leg);
        Town.goToTown();

        return me.getItem(-1, -1, gid);
      }
    }

    Town.goToTown();
    say("Failed to get the leg :(");

    return false;
  };

  const getTome = function () {
    let tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

    if (tpTome.length < 2) {
      let npc = Town.initNPC("Shop", "buyTpTome");
      if (!getInteractedNPC()) throw new Error("Failed to find npc");

      let tome = npc.getItem(sdk.items.TomeofTownPortal);

      if (!!tome && tome.getItemCost(sdk.items.cost.ToBuy) < me.gold && tome.buy()) {
        delay(500);
        tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);
        tpTome.forEach(function (book) {
          if (book.isInInventory) {
            let scroll = npc.getItem(sdk.items.ScrollofTownPortal);

            while (book.getStat(sdk.stats.Quantity) < 20) {
              if (!!scroll && scroll.getItemCost(sdk.items.cost.ToBuy) < me.gold) {
                scroll.buy(true);
              } else {
                break;
              }

              delay(20);
            }
          }
        });
      } else {
        throw new Error("Failed to buy tome");
      }
    }

    return tpTome.last();
  };

  /**
   * @param {string} nick 
   * @returns {boolean}
   */
  const openPortal = function (nick) {
    if (!Config.ControlBot.Cows.MakeCows) return false;
    try {
      if (!Misc.inMyParty(nick)) throw new Error("Accept party invite, noob.");
      if (Pather.getPortal(sdk.areas.MooMooFarm)) throw new Error("Cow portal already open.");
      // king dead or cain not saved
      if (me.cows) throw new Error("Can't open the portal because I killed Cow King.");
      if (Config.ControlBot.Cows.GetLeg && !me.tristram && !!Config.Leader && !getParty(Config.Leader)) {
        throw new Error("Can't get leg because I don't have Cain quest.");
      }
      if (!me.diffCompleted) throw new Error("Final quest incomplete.");
    } catch (e) {
      say(e.message ? e.message : e);
      return false;
    }

    let leg = getLeg();
    if (!leg) return false;

    let tome = getTome();
    if (!tome) return false;

    if (!Town.openStash()
      || !Cubing.emptyCube()
      || !Storage.Cube.MoveTo(leg)
      || !Storage.Cube.MoveTo(tome)
      || !Cubing.openCube()) {
      return false;
    }

    transmute();
    delay(500);

    for (let i = 0; i < 10; i += 1) {
      if (Pather.getPortal(sdk.areas.MooMooFarm)) {
        return true;
      }

      delay(200);
    }

    say("Failed to open cow portal.");

    return false;
  };

  /**
   * @param {string} nick 
   * @returns {string | boolean}
   */
  const getWpNick = function (nick) {
    if (wpNicks.hasOwnProperty(nick)) {
      if (wpNicks[nick].requests > 4) {
        return "maxrequests";
      }

      if (getTickCount() - wpNicks[nick].timer < 60000) {
        return "mintime";
      }

      return true;
    }

    return false;
  };

  /**
   * @param {string} nick 
   * @returns {void}
   */
  const addWpNick = function (nick) {
    wpNicks[nick] = { timer: getTickCount(), requests: 0 };
  };

  /**
   * @param {string} nick 
   * @returns {boolean}
   */
  const giveWps = function (nick) {
    let next = false;
    const nextWatcher = function (who, msg) {
      if (who !== nick) return;
      if (msg === "next") {
        next = true;
      }
    };

    try {
      if (!Misc.inMyParty(nick)) {
        throw new Error("Accept party invite, noob.");
      }

      let reqCheck = getWpNick(nick);
      if (reqCheck) {
        let _eMsg = reqCheck === "maxrequests"
          ? ", you have spent all your waypoint requests for this game."
          : ", you may request waypoints every 60 seconds.";
        throw new Error(nick + _eMsg);
      }

      addWpNick(nick);

      let act = Misc.getPlayerAct(nick);
      if (!wps.has(act)) return false;
      addEventListener("chatmsg", nextWatcher);

      for (let wp of wps.get(act)) {
        if (checkHostiles()) {
          break;
        }

        try {
          if (next) {
            next = false;
            continue;
          }
          Pather.useWaypoint(wp, true);
          if (Config.ControlBot.Wps.SecurePortal) {
            Attack.securePosition(me.x, me.y, 20, 1000);
          }
          Pather.makePortal();
          say(getAreaName(me.area) + " TP up");

          if (!Misc.poll(() => (Game.getPlayer(nick) || next), Time.seconds(30), Time.seconds(1))) {
            say("Aborting wp giving.");

            break;
          }
          next = false;

          delay(5000);
        } catch (error) {
          continue;
        }
      }

      Town.doChores();
      Town.goToTown(1);
      Town.move("portalspot");

      wpNicks[nick].requests += 1;
      wpNicks[nick].timer = getTickCount();

      return true;
    } catch (e) {
      say(e.message ? e.message : e);
      
      return false;
    } finally {
      removeEventListener("chatmsg", nextWatcher);
    }
  };

  const checkHostiles = function () {
    let rval = false;
    let party = getParty();

    if (party) {
      do {
        if (party.name !== me.name && getPlayerFlag(me.gid, party.gid, 8)) {
          rval = true;

          if (Config.ShitList && !shitList.has(party.name)) {
            shitList.add(party.name);
          }
        }
      } while (party.getNext());
    }

    return rval;
  };

  /**
   * @param {string} command 
   * @returns {boolean}
   */
  const floodCheck = function (command) {
    if (!command || command.length < 2) return false;
    let [cmd, nick] = command;
      
    // ignore overhead messages
    if (!nick) return true;
    // ignore messages not related to our commands
    if (!actions.has(cmd.toLowerCase())) return false;

    if (!cmdNicks.hasOwnProperty(nick)) {
      cmdNicks[nick] = new PlayerTracker();
    }

    if (cmdNicks[nick].ignored) {
      if (getTickCount() - cmdNicks[nick].ignored < Time.minutes(1)) {
        return true; // ignore flooder
      }

      // unignore flooder
      cmdNicks[nick].unIgnore();
    }

    cmdNicks[nick].commands += 1;

    if (getTickCount() - cmdNicks[nick].firstCmd < Time.seconds(10)) {
      if (cmdNicks[nick].commands > 5) {
        cmdNicks[nick].ignored = getTickCount();

        say(nick + ", you are being ignored for 60 seconds because of flooding.");
      }
    } else {
      cmdNicks[nick].resetCmds();
    }

    return false;
  };

  /**
   * @param {string} nick 
   * @param {string} msg
   * @returns {boolean}
   */
  function chatEvent (nick, msg) {
    if (shitList.has(nick)) {
      say("No commands for the shitlisted.");
    } else {
      command = [msg, nick];
    }
  }

  // eslint-disable-next-line no-unused-vars
  function gameEvent (mode, param1, param2, name1, name2) {
    switch (mode) {
    case 0x02:
      // idle in town
      me.inTown && me.mode === sdk.player.mode.StandingInTown && greet.push(name1);

      break;
    }
  }

  /** @type {Map<string, { desc: string, hostileCheck: boolean, run: function(): boolean | void }} */
  const actions = (function () {
    const _actions = new Map();

    _actions.set("help", {
      desc: "Display commands",
      hostileCheck: false,
      run: function () {
        let str = "";
        _actions.forEach((value, key) => {
          str += (key + " (" + value.desc + "), ");
        });
        say("Commands: " + str);
      }
    });
    _actions.set("timeleft", {
      desc: "Remaining time left for this game",
      hostileCheck: false,
      run: function () {
        let tick = Time.minutes(Config.ControlBot.GameLength) - getTickCount() + startTime;
        let m = Math.floor(tick / 60000);
        let s = Math.floor((tick / 1000) % 60);

        say(
          "Time left: "
          + (m ? m + " minute" + (m > 1 ? "s" : "")
          + ", " : "") + s + " second" + (s > 1 ? "s." : ".")
        );
      }
    });

    if (Config.ControlBot.Chant.Enchant
      && Skill.canUse(sdk.skills.Enchant)) {
      ["chant", "enchant"]
        .forEach(key => _actions.set(key, {
          desc: "Give enchant",
          hostileCheck: false,
          run: enchant
        }));
    }
    
    if (Config.ControlBot.Cows.MakeCows && !me.cows) {
      _actions.set("cows", {
        desc: "Open cow level",
        hostileCheck: true,
        run: openPortal
      });
    }

    if (Config.ControlBot.Wps.GiveWps) {
      _actions.set("wps", {
        desc: "Give waypoints in act",
        hostileCheck: true,
        run: giveWps
      });
    }

    if (Config.ControlBot.Bo
      && (Skill.canUse(sdk.skills.BattleOrders) || Precast.haveCTA > 0)) {
      _actions.set("bo", {
        desc: "Bo at waypoint",
        hostileCheck: true,
        run: bo
      });
    }

    return _actions;
  })();

  const runAction = function (command) {
    if (!command || command.length < 2) return false;
    let [cmd, nick] = command;

    if (!actions.has(cmd.toLowerCase())) return false;
    let action = actions.get(cmd.toLowerCase());
    if (action.hostileCheck && checkHostiles()) {
      say("Command disabled because of hostiles.");
      return false;
    }

    return action.run(nick);
  };

  // START
  include("oog/ShitList.js");
  Config.ShitList && shitList.add(ShitList.read());

  try {
    addEventListener("chatmsg", chatEvent);
    addEventListener("gameevent", gameEvent);
    Town.doChores();
    Town.goToTown(1);
    Town.move("portalspot");

    while (true) {
      while (greet.length > 0) {
        nick = greet.shift();

        if (!shitList.has(nick)) {
          say("Welcome, " + nick + "! For a list of commands say 'help'");
        }
      }

      Town.getDistance("portalspot") > 5 && Town.move("portalspot");

      if (command && !floodCheck(command)) {
        runAction(command);
      }

      command = "";

      me.act > 1 && Town.goToTown(1);
      Config.ControlBot.Chant.AutoEnchant && autoChant();

      if (getTickCount() - startTime >= Time.minutes(Config.ControlBot.GameLength)) {
        say((Config.ControlBot.EndMessage ? Config.ControlBot.EndMessage : "Bye"));
        delay(1000);

        break;
      }

      delay(200);
    }
  } finally {
    removeEventListener("chatmsg", chatEvent);
    removeEventListener("gameevent", gameEvent);
  }

  return true;
}
