/**
*  @filename    ControlBot.js
*  @author      theBGuy
*  @credits     kolton (for the original Enchant.js),
*               magace (for the inspiration to add rush commands)
*  @desc        Chat controlled bot for other players. Can open cow portal, give waypoints on command, bo, or enchant
*
*/

/**
 * @typedef {ScriptContext & { cleanup: () => void }} ControlBotContext
 */

const ControlBot = new Runnable(
  /**
   * @param {ControlBotContext} ctx
   */
  function ControlBot (ctx) {
    const thankYouMessages = [
      "Ty {name}. Current count: {stats}",
      "Got your vote, {name}! The tally is now {stats}",
      "Vote recorded, {name}. Current standings: {stats}",
      "Thanks {name}, I've counted your vote. Current count: {stats}",
      "{name}'s vote has been tallied. Updated count: {stats}",
      "Roger that {name}, vote recorded. Current status: {stats}"
    ];

    const voteCompletionMessages = [
      "Thank you {name}, that settles it. Time to tally the votes.",
      "And {name} makes it unanimous! Tallying votes now.",
      "That's everyone! Thanks {name} for the final vote. Let's count them up.",
      "With {name}'s vote, we're all accounted for. Time for the results.",
      "Last vote in from {name}! Let's see where we stand.",
      "Decision time! {name} has cast the final vote. Counting now."
    ];

    const alreadyCountedMessages = [
      "Your vote has already been counted",
      "I've already recorded your vote",
      "You've voted already, no need to vote again",
      "One vote per person, yours is already counted",
      "Vote already registered, thanks!",
      "I remember your vote, no need to repeat"
    ];

    const voteRequestMessages = [
      "{players} please cast your vote for ng. Voting ends in {time}s",
      "Still waiting on ng votes from {players}. {time} seconds remaining",
      "Don't forget to vote for ng {players}! Time remaining: {time}s",
      "{players}, we need your vote for ng! {time} seconds left to decide",
      "Hey {players}, make your voice heard! {time}s left to vote for ng",
      "{time} seconds left and we're still waiting on {players} to vote for ng"
    ];

    const queuePositionMessages = [
      "{command} has been added to the queue. Position: {position}",
      "Added {command} to queue. You're #{position} in line",
      "Request for {command} queued. Current position: {position}",
      "I'll get to your {command} request soon. Queue position: {position}",
      "You're #{position} in the queue for {command}",
      "{command} added. There are {position} requests ahead of you"
    ];

    const currentlyRunningMessages = [
      "Currently running {command} for {nick}",
      "Right now I'm helping {nick} with {command}",
      "Busy with {command} for {nick} at the moment",
      "Working on {command} with {nick} now",
      "{nick}'s {command} request is in progress"
    ];

    const stillRunningMessages = [
      "Still processing your {command} request right now",
      // come up with others
    ];

    // Quests
    const {
      log,
      playerIn,
      andariel,
      bloodraven,
      smith,
      cube,
      radament,
      amulet,
      staff,
      summoner,
      duriel,
      gidbinn,
      lamesen,
      brain,
      heart,
      eye,
      travincal,
      // mephisto,
      izual,
      diablo,
      shenk,
      anya,
      ancients,
      baal,
      timedOut,
    } = require("../systems/autorush/AutoRush");
    const {
      AutoRush,
      RushModes,
    } = require("../systems/autorush/RushConstants");
    const Worker = require("../modules/Worker");
    const AreaData = require("../core/GameData/AreaData");
    
    /** @param {string} [nick] */
    const cain = function (nick) {
      log("starting cain");
      
      if (Game.getNPC(NPC.Cain)) {
        log("Cain has already been rescued");

        return true;
      }
      
      Town.doChores();
      Pather.useWaypoint(sdk.areas.StonyField, true);
      Precast.doPrecast(true);
      if (!Pather.journeyTo(sdk.areas.Tristram)) {
        log("Can't get to tristram");

        return true;
      }

      if (me.inArea(sdk.areas.Tristram)) {
        Pather.moveTo(me.x, me.y + 6);
        let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

        if (gibbet && !gibbet.mode) {
          if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.CainsJail, 0, 0, true, true)) {
            throw new Error("Failed to move to Cain's Jail");
          }

          Attack.securePosition(gibbet.x, gibbet.y, { range: 25, duration: 3000 });
          Pather.makePortal();
          log(AutoRush.playersIn);

          const cainRescued = Misc.poll(function () {
            Attack.securePosition(me.x, me.y, { range: 15, duration: 1000 });
            return gibbet.mode;
          }, Time.minutes(2));
        
          if (!cainRescued) {
            log(timedOut(nick));
            return false;
          }
        }
      }

      return true;
    };
    
    /** @param {string} [nick] */
    const mephisto = function (nick) {
      log("starting mephisto");

      Town.doChores();
      Pather.useWaypoint(sdk.areas.DuranceofHateLvl2, true) && Precast.doPrecast(true);
      if (!Pather.moveToExit(sdk.areas.DuranceofHateLvl3, true)) {
        throw new Error("Failed to move to durance 3");
      }
      Pather.moveTo(17617, 8069);
      Attack.securePosition(me.x, me.y, { range: 30, duration: 3000, skipIds: [sdk.monsters.Mephisto] });
      Attack.securePosition(17591, 8070, { range: 20, duration: 3000, skipIds: [sdk.monsters.Mephisto] });
      let hydra = Game.getMonster(getLocaleString(sdk.locale.monsters.Hydra));

      if (hydra) {
        do {
          while (!hydra.dead && hydra.hp > 0) {
            delay(500);
          }
        } while (hydra.getNext());
      }
      Pather.makePortal();
      Pather.moveTo(17581, 8070);
      log(AutoRush.playersIn);

      if (!Misc.poll(function () {
        return playerIn(me.area, nick);
      }, AutoRush.playerWaitTimeout, 1000)) {
        timedOut(nick);
        return false;
      }

      Pather.moveTo(17591, 8070);
      Attack.kill(sdk.monsters.Mephisto);
      Pickit.pickItems();
      log("meph dead");
      log(AutoRush.playersOut);
      Pather.usePortal(null);

      return true;
    };

    AutoRush.rushMode = RushModes.chanter;
    AutoRush.playersIn = "in";
    AutoRush.playersOut = "out";
    AutoRush.allIn = "all in";

    // TODO: Handle multi's abusing the vote by having multiple accounts in the game
    // most multi's use similar names so we can check for that then need to update votes needed based on that
    // since their vote should only count as 1
    /** @typedef {"yes" | "no" | "undecided"} NgVote  */
    const ngVote = {
      /** @type {Map<string, NgVote>} */
      votes: new Map(),
      active: false,
      tick: 0,
      nextGame: false,
      undecidedAskTick: 0,
      lastVotePeriod: {
        startedBy: "",
        endedAt: 0,
      },

      /**
       * Calculate the number of votes needed for a decision
       * @returns {number}
       */
      votesNeeded: function () {
        return Math.max(1, Math.floor((Misc.getPartyCount()) / 2));
      },

      /**
       * Get the time since the last vote period ended
       * @returns {number}
       */
      timeSinceLastVote: function () {
        return getTickCount() - this.lastVotePeriod.endedAt;
      },

      /**
       * Reset the voting state
       */
      reset: function () {
        this.votes.clear();
        this.tick = 0;
        this.active = false;
        this.lastVotePeriod.endedAt = getTickCount();
      },

      /**
       * Begin a new voting session
       * @param {string} nick
       */
      begin: function(nick) {
        this.active = true;
        this.votes.clear();
        for (let player of Misc.getPartyMembers()) {
          this.votes.set(player.name, "undecided");
        }
        this.tick = getTickCount();
        this.lastVotePeriod.startedBy = nick;
      },

      /**
       * Check current count
       */
      count: function () {
        let [yes, no, undecided] = [0, 0, 0];

        for (let [name, vote] of this.votes) {
          if (!Misc.inMyParty(name)) {
            continue;
          }
          
          if (vote === "yes") {
            yes++;
          } else if (vote === "no") {
            no++;
          } else if (vote === "undecided") {
            undecided++;
          }
        }

        return {
          yes: yes,
          no: no,
          undecided: undecided
        };
      },

      stats: function () {
        const { yes, no, undecided } = this.count();

        return ("yes: " + yes + " no: " + no + " undecided: " + undecided);
      },

      /**
       * Check the current vote count and determine the outcome
       * @param {boolean} skipUndecided
       * @returns {boolean}
       */
      checkCount: function (skipUndecided = false) {
        let undecided = [];
        
        if (!skipUndecided) {
          for (let [playerName, vote] of this.votes) {
            if (vote === "undecided" && Misc.inMyParty(playerName)) {
              undecided.push(playerName);
            }
          }

          if (undecided.length) {
            if (getTickCount() - ngVote.undecidedAskTick > Time.seconds(30)) {
              let votingPeriodRemaining = Math.round(Time.toSeconds(Time.minutes(2) - ngVote.elapsed()));
              let message = voteRequestMessages.random()
                .replace("{players}", undecided.join(", "))
                .replace("{time}", votingPeriodRemaining);
              Chat.say(message);
              ngVote.undecidedAskTick = getTickCount();
            }
            return false;
          }
        }
        
        const votesNeeded = this.votesNeeded();
        const { yes: yesVotes, no: noVotes } = this.count();

        if (Misc.getPartyCount() === yesVotes + noVotes && yesVotes === noVotes) {
          Chat.say("Not enough votes to start ng we have a draw.");
          this.reset();
          return false;
        }

        if (noVotes >= votesNeeded && noVotes > yesVotes) {
          Chat.say("ng rejected by majority.");
          this.reset();
          return false;
        }

        if (yesVotes >= votesNeeded) {
          Chat.say("ng approved by majority.");
          this.nextGame = true;
          this.reset();
          return true;
        }

        return false;
      },

      /**
       * Register a vote
       * @param {string} nick 
       * @param {"yes" | "no"} type 
       */
      vote: function(nick, type) {
        if (!this.active) return;
        this.votes.set(nick, type);
      },

      /**
       * Get the elapsed time since the vote started
       * @returns {number}
       */
      elapsed: function() {
        return getTickCount() - this.tick;
      }
    };
    const MAX_CHAT_LENGTH = 180;
    const MIN_GOLD = 500000;
    const startTime = getTickCount();
    const maxTime = Time.minutes(Config.ControlBot.GameLength);
    const chantDuration = Skill.getDuration(sdk.skills.Enchant);
    /** @type {Map<string, string>} */
    const players = new Map();
    /** @type {Set<string>} */
    const givenGold = new Set();
    
    const sendChatMessage = say;

    /** @param {string} msg */
    global.say = function (msg) {
      if (typeof msg !== "string") {
        throw new TypeError("Message must be a string");
      }
      Chat.say(msg);
    };

    ctx.cleanup = function () {
      // restore the original say function
      global.say = sendChatMessage;
    };
    
    /**
     * @constructor
     * @param {string} msg 
     */
    function Message (msg) {
      if (typeof msg !== "string") {
        throw new TypeError("Message must be a string");
      }
      this.msg = msg;
      this.createdAt = getTickCount();
    }

    const Chat = {
      overheadTick: 0,
      /** @type {Message[]} */
      queue: [],

      /**
      * Send a message in chat
      * @param {string} msg 
      */
      say: function (msg) {
        Chat.queue.push(new Message(msg));
      },

      /**
      * Display a message overhead
      * @param {string} msg 
      * @param {boolean} [force]
      */
      overhead: function (msg, force = false) {
        if (!force && getTickCount() - Chat.overheadTick < 0) return;
        // allow overhead messages every ~3-4 seconds
        Chat.overheadTick = getTickCount() + Time.seconds(3) + rand(250, 1500);
        sendChatMessage("!" + msg);
      },

      /**
      * Whisper a chat to a user
      * @param {string} nick 
      * @param {string} msg 
      */
      whisper: function (nick, msg) {
        if (!players.has(nick) && !Misc.findPlayer(nick)) {
          console.debug("Player not found: " + nick);
          return;
        }
        let who = players.get(nick) || nick;
        Chat.queue.push(new Message("/w " + who + " " + msg));
      },

      /**
      * Private message a chat to a user
      * @param {string} nick 
      * @param {string} msg 
      */
      message: function (nick, msg) {
        Chat.queue.push(new Message("/m " + nick + " " + msg));
      },
    };

    Worker.runInBackground.chat = (function () {
      let tick = getTickCount();
      let burstCount = 0;
      let burstStartTime = 0;
      const BURST_LIMIT = 4;
      const BURST_WINDOW = Time.seconds(16);
      const BURST_COOLDOWN = Time.seconds(10);

      return function () {
        if (!Chat.queue.length) return true;
        if (getTickCount() - tick < 0) return true;
        // check if next msg is going to be a whisper
        if (Chat.queue[0].msg.startsWith("/w")) {
          // check if the player is in the game and if not, don't send the whisper
        }

        // don't immediately respond, seems to trigger temp mutes more often
        if (getTickCount() - Chat.queue[0].createdAt < 500) {
          // don't send messages that are too new
          return true;
        }

        // Burst protection (prevent too many messages in short time)
        let currentTime = getTickCount();
    
        // Reset burst count if window has passed
        if (currentTime - burstStartTime > BURST_WINDOW) {
          burstCount = 0;
          burstStartTime = currentTime;
        }
    
        // If we've hit burst limit, enforce cooldown
        if (burstCount >= BURST_LIMIT) {
          if (currentTime - burstStartTime < BURST_COOLDOWN) {
            return true; // Still in cooldown period
          }
          burstCount = 0;
          burstStartTime = currentTime;
        }
    
        if (burstCount === 0) {
          burstStartTime = currentTime;
        }

        // allow say messages every ~1.7 seconds
        tick = getTickCount() + Time.seconds(1) + rand(500, 950);
        burstCount += 1;

        console.debug("(" + Chat.queue[0].msg + ") [Burst: " + burstCount + "/" + BURST_LIMIT + "]");
        if (Chat.queue[0].msg.length > MAX_CHAT_LENGTH) {
          console.debug("Message too long, splitting.");
          Chat.queue[0].msg = Chat.queue[0].msg.substring(0, MAX_CHAT_LENGTH);
        }
        sendChatMessage(Chat.queue.shift().msg);
        return true;
      };
    })();

    Worker.runInBackground.flooders = (function () {
      let tick = getTickCount();

      return function () {
        if (getTickCount() - tick < 0) return true;
        // check every 1 second
        tick = getTickCount() + Time.seconds(1) + rand(500, 950);

        for (let [key, player] of playerTracker) {
          if (getTickCount() - player.ignoredAt > Time.minutes(1)) {
            if (!player.ignored) continue;
            let party = getParty(key);
            if (!party || !getPlayerFlag(me.gid, party.gid, sdk.player.flag.Squelch)) {
              continue;
            }

            clickParty(party, sdk.party.controls.Squelch);
            player.unIgnore();
          }
        }

        return true;
      };
    })();

    Worker.runInBackground.ngVote = (function () {
      let tick = getTickCount();

      return function () {
        if (getTickCount() - tick < 0) return true;
        // check every 1 second
        tick = getTickCount() + Time.seconds(1);
        if (!ngVote.active) return true;
        
        if (ngVote.elapsed() > Time.minutes(2)) {
          ngVote.checkCount(true);
          if (!ngVote.nextGame) {
            Chat.say("Not enough votes to start ng." + ngVote.stats());
            ngVote.reset();
          }
        } else if (ngVote.elapsed() > Time.seconds(30) && !ngVote.nextGame) {
          ngVote.checkCount();
        }

        return true;
      };
    })();
    
    /** @constructor */
    function PlayerTracker () {
      this.firstCmd = getTickCount();
      this.commands = 0;
      this.ignored = false;
      this.ignoredAt = 0;
      this.toldToChill = false;
      this.seenHelpMsg = false;
      this.lastChant = 0;
    }

    PlayerTracker.prototype.resetCmds = function () {
      this.firstCmd = getTickCount();
      this.commands = 0;
    };

    /** @param {string} nick */
    PlayerTracker.prototype.ignore = function (nick) {
      let party = getParty(nick);
      if (!party || getPlayerFlag(me.gid, party.gid, sdk.player.flag.Squelch)) {
        return;
      }

      clickParty(party, sdk.party.controls.Squelch);
      
      this.ignored = true;
      this.ignoredAt = getTickCount();
    };

    PlayerTracker.prototype.unIgnore = function () {
      this.ignored = false;
      this.ignoredAt = 0;
      this.commands = 0;
    };

    PlayerTracker.prototype.reChant = function () {
      return getTickCount() - this.lastChant >= chantDuration - Time.minutes(1);
    };

    PlayerTracker.prototype.updateChantTracker = function () {
      this.lastChant = getTickCount();
    };

    /** @constructor */
    function WpTracker () {
      this.timer = getTickCount();
      this.requests = 0;
      this.singleWpRequests = 0;
    }

    WpTracker.prototype.update = function () {
      this.timer = getTickCount();
      this.requests++;
    };

    WpTracker.prototype.updateSingle = function () {
      this.timer = getTickCount();
      this.singleWpRequests++;
    };

    WpTracker.prototype.timeSinceLastRequest = function () {
      return getTickCount() - this.timer;
    };

    /** @type {Map<string, PlayerTracker>} */
    const playerTracker = new Map();
    /** @type {Map<string, WpTracker>} */
    const wpNicks = new Map();

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

    /** @type {[string, string][]} */
    const queue = [];
    const running = {
      nick: "",
      command: "",
    };

    /**
    * @param {string} nick 
    * @returns {boolean}
    */
    const enchant = function (nick) {
      try {
        if (!Misc.inMyParty(nick)) {
          throw new ScriptError("Accept party invite, noob.");
        }

        let unit = Game.getPlayer(nick);

        if (unit && unit.distance > 35) {
          throw new ScriptError("Get closer.");
        }

        if (!unit) {
          let partyUnit = getParty(nick);

          if (!Misc.poll(() => partyUnit.inTown, 500, 50)) {
            throw new ScriptError("You need to be in one of the towns.");
          }
          // wait until party area is readable?
          Chat.say("Wait for me at waypoint.");
          Town.goToTown(sdk.areas.actOf(partyUnit.area));

          unit = Game.getPlayer(nick);
        }

        if (unit) {
          do {
            // player is alive
            if (!unit.dead) {
              if (unit.distance >= 35) {
                throw new ScriptError("You went too far away.");
              }
              Packet.enchant(unit);
              if (Misc.poll(() => unit.getState(sdk.states.Enchant), 500, 50)) {
                if (!playerTracker.has(unit.name)) {
                  playerTracker.set(unit.name, new PlayerTracker());
                }
                playerTracker.get(unit.name).updateChantTracker();
              }
            }
          } while (unit.getNext());
        } else {
          Chat.say("I don't see you");
        }

        let monster = Game.getMonster();

        if (monster) {
          do {
            if (!monster.isEnchantable) {
              continue;
            }
            // merc or any other owned unit
            let parent = monster.getParent();
            if (!parent) continue;
            if (parent.name === nick) {
              Packet.enchant(monster);
              delay(500);
            }
          } while (monster.getNext());
        }

        return true;
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
        
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
          throw new ScriptError("Accept party invite, noob.");
        }

        let partyUnit = getParty(nick);

        // wait until party area is readable?
        if (!Misc.poll(() => Pather.wpAreas.includes(partyUnit.area), 500, 50)) {
          throw new ScriptError("Can't find you or you're not somewhere with a waypoint");
        }
        if (partyUnit.inTown) {
          let a1Wp = Object.values(sdk.areas)
            .filter(function (area) {
              if (area < sdk.areas.ColdPlains || area > sdk.areas.CatacombsLvl2) return false;
              return Pather.wpAreas.includes(area) && me.haveWaypoint(area);
            }).random();
          Chat.whisper(nick, "Go to act 1 waypoint " + getAreaName(a1Wp) + " and wait for me.");
          Pather.useWaypoint(a1Wp);
        } else {
          Pather.useWaypoint(partyUnit.area);
        }

        let unit = Misc.poll(function () {
          return Game.getPlayer(nick);
        }, Time.minutes(1), 1000);

        if (unit && unit.distance > 15) {
          Chat.say("Get closer.");
          
          if (!Misc.poll(() => unit.distance <= 15, Time.seconds(30), 50)) {
            throw new ScriptError("You took to long. Going back to town");
          }
        }

        if (unit && unit.distance <= 15 && !unit.dead) {
          Misc.poll(function () {
            Precast.doPrecast(true);
            return unit.getState(sdk.states.BattleOrders);
          }, 5000, 1000);
          Pather.useWaypoint(sdk.areas.RogueEncampment);
        } else {
          throw new ScriptError("I don't see you");
        }

        return true;
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
        
        return false;
      }
    };

    const autoChant = function () {
      if (!Config.ControlBot.Chant.Enchant) return false;

      let chanted = [];
      let unit = Game.getPlayer();

      if (unit) {
        do {
          try {
            if (unit === me.name || unit.dead) continue;
            if (me.shitList.has(unit.name)) continue;
            if (!Misc.inMyParty(unit.name) || unit.distance > 40) continue;
            // allow rechanting someone if it's going to run out soon for them
            if (!unit.getState(sdk.states.Enchant)
              || (playerTracker.has(unit.name) && playerTracker.get(unit.name).reChant())
            ) {
              Packet.enchant(unit);
              if (Misc.poll(() => unit.getState(sdk.states.Enchant), 500, 50)) {
                chanted.push(unit.name);
                if (!playerTracker.has(unit.name)) {
                  playerTracker.set(unit.name, new PlayerTracker());
                }
                playerTracker.get(unit.name).updateChantTracker();
              }
            }
          } catch (err) {
            console.error(err);
          }
        } while (unit.getNext());
      }

      let monster = Game.getMonster();

      if (monster) {
        do {
          try {
            if (monster.getParent()
              && monster.isEnchantable
              && Misc.inMyParty(monster.getParent().name)
              && playerTracker.has(monster.getParent().name)
              && !monster.getState(sdk.states.Enchant)
              && monster.distance <= 40) {
              Packet.enchant(monster);
              // not going to re-enchant the minions for now though, will think on how best to handle that later
              if (Misc.poll(() => monster.getState(sdk.states.Enchant), 500, 50)) {
                chanted.push(monster.name);
              }
            }
          } catch (err) {
            console.error(err);
          }
        } while (monster.getNext());
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

        Chat.say("Bring the leg " + (wrongLeg ? "from this difficulty" : "") + " close to me.");

        return false;
      }

      if (!Pather.journeyTo(sdk.areas.Tristram)) {
        Chat.say("Failed to enter Tristram :(");
        Town.goToTown();

        return false;
      }

      Pather.moveTo(25048, 5177);

      let wirt = Game.getObject(sdk.quest.chest.Wirt);

      for (let i = 0; i < 8; i++) {
        if (wirt) {
          wirt.interact();
          delay(500);
        }

        leg = Game.getItem(sdk.quest.item.WirtsLeg);

        if (leg) {
          gid = leg.gid;

          Pickit.pickItem(leg);
          Town.goToTown();

          return me.getItem(-1, -1, gid);
        }
      }

      Town.goToTown();
      Chat.say("Failed to get the leg :(");

      return false;
    };

    const getTome = function () {
      let tpTome = me.findItems(sdk.items.TomeofTownPortal, sdk.items.mode.inStorage, sdk.storage.Inventory);

      if (tpTome.length < 2) {
        if (!Storage.Inventory.CanFit({ sizex: 1, sizey: 2 })) {
          if (tpTome.length === 1) {
            return tpTome.first();
          }
        }
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
        if (!Misc.inMyParty(nick)) throw new ScriptError("Accept party invite, noob.");
        if (Pather.getPortal(sdk.areas.MooMooFarm)) throw new ScriptError("Cow portal already open.");
        // king dead or cain not saved
        if (me.cows) throw new ScriptError("Can't open the portal because I killed Cow King.");
        if (Config.ControlBot.Cows.GetLeg && !me.tristram && !!Config.Leader && !getParty(Config.Leader)) {
          throw new ScriptError("Can't get leg because I don't have Cain quest.");
        }
        if (!me.diffCompleted) throw new ScriptError("Final quest incomplete.");
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
        return false;
      }

      log("starting cows");
      
      let leg = getLeg();
      if (!leg) return false;

      if (!Storage.Inventory.CanFit({ sizex: 1, sizey: 2 })) {
        // we don't have any space, put the leg in the stash to make room in invo
        Storage.Stash.MoveTo(leg);
        me.cancelUIFlags();
      }

      let tome = getTome();
      if (!tome) {
        log("Failed to get tome");
        return false;
      }
    
      let openedStash = false;

      for (let i = 0; i < 3; i++) {
        if (Town.openStash()) {
          openedStash = true;
          
          break;
        }
      }

      if (!openedStash) {
        log("Failed to open stash");
        return false;
      }

      const cubeItems = me.getItemsEx(-1, sdk.items.mode.inStorage).filter(function (item) {
        return (
          item.isInCube
          && item.classid !== sdk.items.quest.WirtsLeg
          && item.classid !== sdk.items.TomeofTownPortal
        );
      });

      if (cubeItems.length > 0 && !Cubing.emptyCube()) {
        log("Failed to empty cube");
        return false;
      }

      if (!Storage.Cube.MoveTo(leg) || !Storage.Cube.MoveTo(tome)) {
        log("Failed to move items to cube");
        return false;
      }

      if (!Cubing.openCube()) {
        log("Failed to open cube");
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

      Chat.say("Failed to open cow portal.");

      return false;
    };

    /**
    * @param {string} nick 
    * @param {number} areaId
    * @returns {boolean}
    */
    const giveWp = function (nick, areaId) {
      let stop = false;
      /**
       * @param {string} who 
       * @param {string} msg 
       */
      const stopWatcher = function (who, msg) {
        if (who !== nick) return;
        if (msg === "stop" || msg === "abort" || msg === "cancel") {
          stop = true;
        }
      };

      try {
        if (!Misc.inMyParty(nick)) {
          throw new ScriptError("Accept party invite, noob.");
        }

        Chat.say("Giving wp " + getAreaName(areaId));
        
        if (!wpNicks.has(nick)) {
          wpNicks.set(nick, new WpTracker());
        }

        const check = wpNicks.get(nick);
        if (check.singleWpRequests > 12) {
          throw new ScriptError("You have spent all your waypoint requests for this game.");
        } else if (check.singleWpRequests > 1 && check.timeSinceLastRequest() < 60000) {
          throw new ScriptError(
            "You may request wp again in "
            + Math.max(0, (60 - Math.floor(check.timeSinceLastRequest() / 1000)))
            + " seconds."
          );
        }

        let act = Misc.getPlayerAct(nick);
        if (!wps.has(act)) return false;

        addEventListener("chatmsg", stopWatcher);
        Pather.useWaypoint(areaId, true);
        if (Config.ControlBot.Wps.SecurePortal) {
          Attack.securePosition(me.x, me.y, { range: 20, duration: 1000 });
        }
        Pather.makePortal();
        Chat.say(getAreaName(me.area) + " TP up");

        if (!Misc.poll(() => (stop || Game.getPlayer(nick)), Time.seconds(30), Time.seconds(1))) {
          Chat.say(nick + " didn't show up. Aborting wp giving.");
        }

        Town.doChores();
        Town.goToTown(1);
        Town.move("portalspot");

        check.updateSingle();

        return true;
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
        
        return false;
      } finally {
        removeEventListener("chatmsg", stopWatcher);
      }
    };
    
    /**
    * @param {string} nick 
    * @returns {boolean}
    */
    const giveWps = function (nick) {
      let next = false;
      let stop = false;
      /**
       * @param {string} who 
       * @param {string} msg 
       */
      const nextWatcher = function (who, msg) {
        if (who !== nick) return;
        if (msg === "next") {
          next = true;
        } else if (msg === "stop" || msg === "abort" || msg === "cancel") {
          stop = true;
        }
      };

      try {
        if (!Misc.inMyParty(nick)) {
          throw new ScriptError("Accept party invite, noob.");
        }

        if (!wpNicks.has(nick)) {
          wpNicks.set(nick, new WpTracker());
        }

        let check = wpNicks.get(nick);
        if (check.requests > 4) {
          throw new ScriptError("You have spent all your waypoint requests for this game.");
        } else if (check.requests > 1 && check.timeSinceLastRequest() < 60000) {
          throw new ScriptError(
            "You may request wp again in "
            + Math.max(0, (60 - Math.floor(check.timeSinceLastRequest() / 1000)))
            + " seconds."
          );
        }

        let act = Misc.getPlayerAct(nick);
        if (!wps.has(act)) return false;
        Chat.say("Giving wps for act " + act);
        
        addEventListener("chatmsg", nextWatcher);

        for (let wp of wps.get(act)) {
          if (stop || checkHostiles()) {
            break;
          }

          try {
            if (next) {
              next = false;
              continue;
            }

            Pather.useWaypoint(wp, true);
            if (Config.ControlBot.Wps.SecurePortal) {
              Attack.securePosition(me.x, me.y, { range: 20, duration: 1000 });
            }
            Pather.makePortal();
            Chat.say(getAreaName(me.area) + " TP up");

            if (!Misc.poll(() => (Game.getPlayer(nick) || next || stop), Time.seconds(30), Time.seconds(1))) {
              Chat.say(nick + " didn't show up. Aborting wp giving.");

              break;
            }
            next = false;

            Misc.poll(() => next || stop, Time.seconds(5), 500);
          } catch (error) {
            continue;
          }
        }

        Town.doChores();
        Town.goToTown(1);
        Town.move("portalspot");

        check.update();

        return true;
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
        
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

            if (Config.ShitList && !me.shitList.has(party.name)) {
              me.shitList.add(party.name);
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

      if (!playerTracker.has(nick)) {
        playerTracker.set(nick, new PlayerTracker());
      }
      const player = playerTracker.get(nick);

      // with new flooder worker we shouldn't get here unless it failed
      if (player.ignored) {
        return true;
      }

      player.commands += 1;

      if (getTickCount() - player.firstCmd < Time.seconds(10)) {
        if (player.commands > 5) {
          Chat.say("spamming gets you nonwhere but a timeout, enjoy a minute of being ignored");
          player.ignore(nick);
          return true;
        }
      } else {
        player.resetCmds();
      }

      return false;
    };

    const pickGoldPiles = function () {
      /** @type {PathNode} */
      const startPos = { x: me.x, y: me.y };
      let gold = Game.getItem(sdk.items.Gold);

      if (gold) {
        do {
          if (gold.onGroundOrDropping && gold.distance <= 20 && Pickit.canPick(gold)) {
            Pickit.pickItem(gold) && me.inTown && Chat.overhead("Thank you!", true);
            if (startPos.distance > 5) {
              Pather.move(startPos);
            }
          }
        } while (gold.getNext());
      }
    };

    const dropGold = function (nick) {
      try {
        if (me.gold < MIN_GOLD) {
          throw new ScriptError("Not enough gold to drop.");
        }
        if (givenGold.has(nick)) {
          throw new ScriptError("Already dropped gold this game for you. Don't be greedy.");
        }

        let unit = Game.getPlayer(nick);

        if (unit && unit.distance > 15) {
          throw new ScriptError("Get closer.");
        }

        if (!unit) {
          let partyUnit = getParty(nick);

          if (!Misc.poll(() => partyUnit.inTown, 500, 50)) {
            throw new ScriptError("You need to be in one of the towns.");
          }
          // wait until party area is readable?
          Chat.say("Wait for me at waypoint.");
          Town.goToTown(sdk.areas.actOf(partyUnit.area));

          unit = Game.getPlayer(nick);
        }

        if (unit) {
          if (me.getStat(sdk.stats.Gold) < 5000) {
            Town.openStash() && gold(5000, 4);
            me.cancelUIFlags();
          }

          // drop the gold
          gold(5000);
          /** @type {ItemUnit} */
          let droppedGold = Misc.poll(function () {
            let _gold = Game.getItem(sdk.items.Gold);
            if (_gold && _gold.onGroundOrDropping && _gold.getStat(sdk.stats.Gold) === 5000) {
              return _gold;
            }
            return false;
          }, Time.seconds(30), 1000);

          if (!droppedGold) {
            throw new ScriptError("Failed to drop gold.");
          }

          // watch for the gold dissapearing
          let picked = false;
          Misc.poll(function () {
            let _gold = Game.getItem(sdk.items.Gold, sdk.items.mode.onGround, droppedGold.gid);
            if (_gold) return false;
            picked = true;
            return !_gold;
          }, Time.seconds(30), 1000);

          if (!picked) {
            Pickit.pickItem(droppedGold);
            throw new ScriptError("Failed to pick gold.");
          } else {
            givenGold.add(nick);
            Chat.say("yw " + nick);
          }
        } else {
          throw new ScriptError("I don't see you");
        }
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
      }
    };

    const dropTrollGold = function (nick) {
      try {
        if (givenGold.has(nick)) {
          throw new ScriptError("Already gifted you this game. Don't be greedy.");
        }
        
        let unit = Game.getPlayer(nick);

        if (unit && unit.distance > 5) {
          throw new ScriptError("Get closer.");
        }

        if (!unit) {
          let partyUnit = getParty(nick);

          if (!Misc.poll(() => partyUnit.inTown, 500, 50)) {
            throw new ScriptError("You need to be in one of the towns.");
          }
          // wait until party area is readable?
          Chat.say("Wait for me at waypoint.");
          Town.goToTown(sdk.areas.actOf(partyUnit.area));

          unit = Game.getPlayer(nick);
        }

        if (unit) {
          if (me.getStat(sdk.stats.Gold) < 5000) {
            Town.openStash() && gold(5000, 4);
            me.cancelUIFlags();
          }

          // drop the gold
          gold(1);
          /** @type {ItemUnit} */
          let droppedGold = Misc.poll(function () {
            let _gold = Game.getItem(sdk.items.Gold);
            if (_gold && _gold.onGroundOrDropping && _gold.getStat(sdk.stats.Gold) === 1) {
              return _gold;
            }
            return false;
          }, Time.seconds(30), 1000);

          if (!droppedGold) {
            throw new ScriptError("Failed to drop gold.");
          }

          // watch for the gold dissapearing
          let picked = false;
          Misc.poll(function () {
            let _gold = Game.getItem(sdk.items.Gold, sdk.items.mode.onGround, droppedGold.gid);
            if (_gold) return false;
            picked = true;
            return !_gold;
          }, Time.seconds(30), 1000);

          if (!picked) {
            Pickit.pickItem(droppedGold);
            throw new ScriptError("Failed to pick gold.");
          } else {
            givenGold.add(nick);
            Chat.say("yw " + nick);
          }
        } else {
          throw new ScriptError("I don't see you");
        }
      } catch (e) {
        if (e instanceof ScriptError) {
          Chat.say((typeof e === "object" && e.message ? e.message : typeof e === "string" && e));
        } else {
          console.error(e);
          Chat.say("Internal Error");
        }
      }
    };

    /**
     * Finds commands that closely match the input
     * @param {string} input - User entered command
     * @returns {string[]} - Array of matching command suggestions
     */
    function findSimilarCommands(input) {
      if (!input || input.length < 2) return [];
      
      let matches = [];
      
      for (let [key, value] of actions) {
        if (!value.desc) continue;
        
        if (key.startsWith(input)) {
          matches.push(key);
        }
      }
      
      if (matches.length > 0) {
        return matches;
      }
      
      // check for typos (commands with at most 1 character different)
      if (input.length >= 3) {
        for (let [key, value] of actions) {
          if (!value.desc) continue;
          
          // Check for similar commands with at most 1 character different
          if (Math.abs(key.length - input.length) <= 1) {
            let diffCount = 0;
            
            for (let j = 0; j < Math.min(key.length, input.length); j++) {
              if (key[j] !== input[j]) diffCount += 1;
              if (diffCount > 1) break;
            }
            
            // Account for length difference as well
            diffCount += Math.abs(key.length - input.length);
            
            // Match with at most 1 character different
            if (diffCount <= 1) {
              matches.push(key);
            }
          }
        }
      }
      
      return matches;
    }

    /**
    * @param {string} nick 
    * @param {string} msg
    * @returns {boolean}
    */
    function chatEvent (nick, msg) {
      if (!nick || !msg) return;
      if (nick === me.name) return;
      /**
       * @param {string} input 
       */
      const cleanMsg = function (input) {
        return input
          .replace(/[\'\<\>\[\]\{\}\(\)\!\@\#\$\%\^\&\*\_\+\=\|\~\`\;\:\"\?\,\.\/\\]|plz|please/g, "")
          .toLowerCase()
          .trim();
      };
      const full = cleanMsg(msg);
      const denRegex = /^\b(den|den ?of ?evil)\b/;
      const forgeRegex = /^\b(forge|hell ?forge)\b/;
      let chatCmd = full;

      if (chatCmd === "givewp") {
        Chat.say("givewp must be used with an area, i.e givewp cold plains");

        return;
      }

      if (ngVote.active) {
        if (chatCmd === "yes" || chatCmd === "no") {
          Chat.say("Were you trying to vote? Type ngyes or ngno instead.");
          return;
        }
      }
      
      if (chatCmd.match(/^rush /gi)) {
        chatCmd = chatCmd.split(" ")[1];
      } else if (chatCmd.match(/^givewp /gi)) {
        chatCmd = chatCmd.slice(0, 6).trim();
      } else if (chatCmd.match(/^cancel /gi)) {
        chatCmd = chatCmd.slice("cancel ".length);

        if (chatCmd === running.command && String.isEqual(nick, running.nick)) {
          Chat.say("Can't cancel the active action");

          return;
        }

        if (chatCmd === "ngvote" && ngVote.active) {
          Chat.say("Can't cancel ngvote, it is already active. Cast your vote instead with ngyes/ngno");
          return;
        }

        if (commandAliases.has(chatCmd)) {
          chatCmd = commandAliases.get(chatCmd);
        }
        
        const cmdIndex = queue.findIndex(function (item) {
          const [cmd, commander] = item;
          if (!String.isEqual(nick, commander)) {
            return false;
          }

          return String.isEqual(chatCmd, cmd);
        });
        
        if (cmdIndex !== -1) {
          Chat.say("Removing " + chatCmd + " from the queue");
          queue.splice(cmdIndex, 1);

          return;
        }
        return;
      }
      
      if (denRegex.test(chatCmd) || forgeRegex.test(chatCmd)) {
        Chat.say(chatCmd + " is not one of the commands");

        return;
      }

      if (chatCmd === "cancel") {
        Chat.say("Cancel must be used with a command, i.e cancel andy");

        return;
      }

      if (commandAliases.has(chatCmd)) {
        chatCmd = commandAliases.get(chatCmd);
      }

      if ((chatCmd.match(/^drop/gi) || chatCmd.match(/^give ?gold$/)) && !Config.ControlBot.DropGold) {
        chatCmd = "troll";
      }

      if (!actions.has(chatCmd)) {
        let similarCommands = findSimilarCommands(chatCmd);
  
        if (similarCommands.length === 1) {
          Chat.whisper(nick, "Did you mean '" + similarCommands[0] + "'?");
        } else if (similarCommands.length > 1 && similarCommands.length <= 5) {
          Chat.whisper(nick, "Did you mean one of these: " + similarCommands.join(", ") + "?");
        }
  
        return;
      }

      if (me.shitList.has(nick)) {
        Chat.say("No commands for the shitlisted.");
      } else {
        if (running.nick === nick && running.command === chatCmd) {
          console.debug("Command already running. active ", running);
          if (playerTracker.get(nick).toldToChill) return;
          if (running.command === "wps") {
            Chat.whisper(nick, "chill I'm already running wps if you want me to stop type stop");
          } else {
            Chat.whisper(nick, "chill I've already started. spamming doesn't make this go faster");
          }
          playerTracker.get(nick).toldToChill = true;
          return;
        }
        if (actions.get(chatCmd).desc.toLowerCase().includes("rush")) {
          if (running.command === chatCmd) {
            Chat.whisper(nick, "I'm already runnning that for " + running.nick);

            return;
          }
        }
        if (!floodCheck([chatCmd, nick])) {
          if (["help", "timeleft", "ngyes", "ngno"].includes(chatCmd)) {
            actions.get(chatCmd).run(nick);
            return;
          }
        }
        
        if (ngVote.nextGame && running.command) {
          Chat.say("Not accepting new commands, ngvote passed. ng will be made after I finish " + running.command);
          
          return;
        }
        let index = queue.findIndex(function (cmd) {
          return cmd[0] === chatCmd && cmd[1] === nick;
        });
        if (index > -1) {
          Chat.whisper(nick, "You already requested this command. Queue position: " + (index + 1));
        } else {
          if (queue.length > 1) {
            let commandsToCheck = [];
  
            if (running.command && running.nick) {
              commandsToCheck.push([running.command, running.nick]);
            }
  
            commandsToCheck = commandsToCheck.concat(queue.slice(0, 2));
            commandsToCheck.push([chatCmd, nick]);
  
            const isUserHoggingQueue = commandsToCheck.every(function (item) {
              return item[1] === nick;
            });
  
            if (isUserHoggingQueue && commandsToCheck.length >= 4) {
              Chat.whisper(nick, "You are hogging the queue. Max 3 commands per user at a time.");
              return;
            }
          }
          
          queue.push([chatCmd, nick, full]);
          if (queue.length > 1 || running.nick !== "") {
            let queueMessage = queuePositionMessages.random()
              .replace(/{command}/g, chatCmd)
              .replace(/{position}/g, queue.length + 1);
            Chat.whisper(nick, queueMessage);
            if (running.command) {
              let runningMessage = (nick === running.nick ? stillRunningMessages : currentlyRunningMessages).random()
                .replace(/{command}/g, running.command)
                .replace(/{nick}/g, running.nick);
              Chat.say(runningMessage);
            }
          }
        }
      }
    }

    // eslint-disable-next-line no-unused-vars
    /**
     * @param {number} mode 
     * @param {string} param1 
     * @param {string} param2 
     * @param {string} name1 
     * @param {string} name2 
     */
    function gameEvent (mode, param1, param2, name1, name2) {
      switch (mode) {
      case 0x02: // "%Name1(%Name2) joined our world. Diablo's minions grow stronger."
        if (name1 && ngVote.active) {
          ngVote.votes.set(name1, "undecided");
        }
        if (name1 && !playerTracker.has(name1)) {
          playerTracker.set(name1, new PlayerTracker());
        }
        if (name2) {
          players.set(name1, "*" + name2);
        } else {
          players.set(name1, "");
        }

        try {
          // autosqelch shitlisted players
          if (me.shitList.has(name1)) {
            clickParty(getParty(name1), sdk.party.controls.Squelch);
          } else {
            // Handle greeting new players
            Chat.say("Welcome, " + name1 + "! For a list of commands say help");
          }
        } catch (err) {
          console.error(err);
        }

        break;
      case 0x00: // "%Name1(%Name2) dropped due to time out."
      case 0x01: // "%Name1(%Name2) dropped due to errors."
      case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
        players.delete(name1);
        if (ngVote.active) {
          ngVote.votes.delete(name1);
        }

        break;
      }
    }

    /**
    * @typedef {Object} Action
    * @property {string} desc
    * @property {boolean} hostileCheck
    * @property {boolean} [complete]
    * @property {function(): void} [markAsComplete]
    * @property {function(): boolean | void} run
    * @property {string} type
    */
    /** @type {Map<string, Action} */
    const actions = (function () {
      /**
      * @constructor
      * @param {string} desc 
      * @param {(nick: string) => boolean} run 
      */
      function RushAction (desc, run) {
        this.desc = desc;
        this.hostileCheck = true;
        this.complete = false;
        this.completedBy = "";
        this.run = run;
        this.type = "rush";
      }
      /** @param {string} who */
      RushAction.prototype.markAsComplete = function (who) {
        this.complete = true;
        this.completedBy = who;
      };
      /** @type {Map<string, Action} */
      const _actions = new Map();

      _actions.set("help", {
        // desc: "Display commands",
        desc: "",
        hostileCheck: false,
        /** @param {string} nick */
        run: function (nick) {
          let str = "";
          let msg = [];
          _actions.forEach((value, key) => {
            if (!value.desc.length) return;
            if (value.complete) return;
            if (value.desc.includes("Rush")) return;
            // let desc = (key + " (" + value.desc + "), ");
            let desc = value.desc.includes("experimental")
              ? ("(" + value.desc + "), ")
              : (key === "cancel" || key === "givewp")
                ? value.desc + ", "
                : (key + ", ");
            if (str.length + desc.length > MAX_CHAT_LENGTH - (nick.length + 2)) {
              msg.push(str);
              str = "";
            }
            str += desc;
          });
          str.length && msg.push(str);
          str = "Rush cmds: ";
          _actions.forEach((value, key) => {
            if (!value.desc.length) return;
            if (value.complete) return;
            if (!value.desc.includes("Rush")) return;
            let desc = (key + ", ");
            if (str.length + desc.length > MAX_CHAT_LENGTH - (nick.length + 2)) {
              msg.push(str);
              str = "";
            }
            str += desc;
          });
          str.length && msg.push(str);
          
          !playerTracker.has(nick) && playerTracker.set(nick, new PlayerTracker());
          if (playerTracker.has(nick) && playerTracker.get(nick).seenHelpMsg) {
            Chat.message(nick, "You have seen the help menu before this game please refer to message log");
          } else {
            msg.forEach(function (m) {
              // Chat.whisper(nick, m);
              Chat.say(m);
            });
          }
          playerTracker.get(nick).seenHelpMsg = true;
        }
      });
      _actions.set("cancel", {
        desc: "cancel <cmd>",
        hostileCheck: false,
        run: () => {}
      });
      _actions.set("timeleft", {
        desc: "Remaining time for this game",
        hostileCheck: false,
        run: function () {
          let tick = Time.minutes(Config.ControlBot.GameLength) - getTickCount() + startTime;
          let m = Math.floor(tick / 60000);
          let s = Math.floor((tick / 1000) % 60);

          Chat.say(
            "Time left: "
            + (m ? m + " minute" + (m > 1 ? "s" : "")
            + ", " : "") + s + " second" + (s > 1 ? "s." : ".")
          );
        }
      });

      if (Config.ControlBot.NGVoting) {
        _actions.set("ngvote", {
          desc: "Vote for next game",
          hostileCheck: false,
          run: function (nick) {
            if (ngVote.active) {
              Chat.say("NGVote is already active. Type ngyes/ngno to vote. Current count: " + ngVote.stats());
              return;
            }
            const { MinGameLength, NGVoteCooldown } = Config.ControlBot;
            if (getTickCount() - startTime < Time.minutes(MinGameLength)) {
              Chat.say(
                "Can't vote for ng yet. Must be in game for at least " + MinGameLength + " minutes. Remaining: "
                + Math.round((Time.minutes(MinGameLength) - (getTickCount() - startTime)) / 1000) + " seconds."
              );
              return;
            }
            if (nick === ngVote.lastVotePeriod.startedBy && ngVote.timeSinceLastVote() < Time.minutes(NGVoteCooldown)) {
              Chat.say(
                "You can't vote for ng yet. Last vote was less than " + NGVoteCooldown + " minutes ago. Remaining: "
                + Math.round((Time.minutes(NGVoteCooldown) - (ngVote.timeSinceLastVote())) / 1000) + " seconds."
              );
              return;
            }
            ngVote.begin(nick);
            ngVote.vote(nick, "yes");
            const partyCount = Misc.getPartyCount();
            const votesNeeded = ngVote.votesNeeded();

            if (partyCount === 1) {
              Chat.say(nick + " since you're the only player in party, skipping wait period. NG");
              ngVote.nextGame = true;
            } else {
              Chat.say(nick + " voted for next game. Votes Needed: " + votesNeeded + ". Type ngyes/ngno");
            }
          }
        });
        _actions.set("ngyes", {
          desc: "",
          hostileCheck: false,
          run: function (nick) {
            if (!ngVote.active) return;
            if (ngVote.votes.get(nick) === "yes") {
              Chat.say(alreadyCountedMessages.random());
              return;
            }
            ngVote.vote(nick, "yes");
            let { undecided } = ngVote.count();
            if (undecided > 0) {
              let message = thankYouMessages.random()
                .replace("{name}", nick)
                .replace("{stats}", ngVote.stats());
              Chat.say(message);
            } else {
              let message = voteCompletionMessages.random().replace("{name}", nick);
              Chat.say(message);
            }
            ngVote.checkCount();
          }
        });
        _actions.set("ngno", {
          desc: "",
          hostileCheck: false,
          run: function (nick) {
            if (!ngVote.active) return;
            if (ngVote.votes.get(nick) === "no") {
              Chat.say(alreadyCountedMessages.random());
              return;
            }
            ngVote.vote(nick, "no");
            let { undecided } = ngVote.count();
            if (undecided > 0) {
              let message = thankYouMessages.random()
                .replace("{name}", nick)
                .replace("{stats}", ngVote.stats());
              Chat.say(message);
            } else {
              let message = voteCompletionMessages.random().replace("{name}", nick);
              Chat.say(message);
            }
            ngVote.checkCount();
          }
        });
      }

      if (Config.ControlBot.DropGold) {
        _actions.set("dropgold", {
          desc: "Drop 5k gold",
          hostileCheck: false,
          run: dropGold
        });
      } else {
        _actions.set("troll", {
          desc: "",
          hostileCheck: false,
          run: dropTrollGold
        });
      }

      if (Config.ControlBot.Chant.Enchant
        && Skill.canUse(sdk.skills.Enchant)) {
        _actions.set("chant", {
          desc: "Give enchant",
          hostileCheck: false,
          run: enchant
        });
      } else {
        Config.ControlBot.Chant.AutoEnchant = false;
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
          desc: "Give wps in act",
          hostileCheck: true,
          run: giveWps
        });

        _actions.set("givewp", {
          desc: "givewp <name>",
          hostileCheck: true,
          run: giveWp
        });
      }

      if (Config.ControlBot.Bo
        && (Skill.canUse(sdk.skills.BattleOrders) || Precast.haveCTA > 0)) {
        _actions.set("bo", {
          desc: "Bo at wp",
          hostileCheck: true,
          run: bo
        });
      }

      if (Config.ControlBot.Rush) {
        if (Config.ControlBot.Rush.Andy) {
          _actions.set("andy", new RushAction("Rush Andariel", andariel));
        }
        if (Config.ControlBot.Rush.Bloodraven) {
          _actions.set("raven", new RushAction("Rush Bloodraven", bloodraven));
        }
        if (Config.ControlBot.Rush.Smith) {
          _actions.set("smith", new RushAction("Rush Smith", smith));
        }
        if (Config.ControlBot.Rush.Cain) {
          _actions.set("cain", new RushAction("Rush Cain", cain));
        }
        if (Config.ControlBot.Rush.Cube) {
          _actions.set("cube", new RushAction("Rush Cube", cube));
        }
        if (Config.ControlBot.Rush.Radament) {
          _actions.set("rada", new RushAction("Rush Radament", radament));
        }
        if (Config.ControlBot.Rush.Staff) {
          _actions.set("staff", new RushAction("Rush Staff", staff));
        }
        if (Config.ControlBot.Rush.Amulet) {
          _actions.set("amu", new RushAction("Rush Amulet", amulet));
        }
        if (Config.ControlBot.Rush.Summoner) {
          _actions.set("summoner", new RushAction("Rush Summoner", summoner));
        }
        if (Config.ControlBot.Rush.Duriel) {
          _actions.set("duri", new RushAction("Rush Duriel", duriel));
        }
        if (Config.ControlBot.Rush.Gidbinn) {
          _actions.set("gidbinn", new RushAction("Rush Gidbinn", gidbinn));
        }
        if (Config.ControlBot.Rush.LamEsen) {
          _actions.set("lamesen", new RushAction("Rush Lamesen", lamesen));
        }
        if (Config.ControlBot.Rush.Eye) {
          _actions.set("eye", new RushAction("Rush Eye", eye));
        }
        if (Config.ControlBot.Rush.Brain) {
          _actions.set("brain", new RushAction("Rush Brain", brain));
        }
        if (Config.ControlBot.Rush.Heart) {
          _actions.set("heart", new RushAction("Rush Heart", heart));
        }
        if (Config.ControlBot.Rush.Travincal) {
          _actions.set("trav", new RushAction("Rush Travincal", travincal));
        }
        if (Config.ControlBot.Rush.Mephisto) {
          _actions.set("meph", new RushAction("Rush Mephisto", mephisto));
        }
        if (Config.ControlBot.Rush.Izual) {
          _actions.set("izzy", new RushAction("Rush Izual", izual));
        }
        if (Config.ControlBot.Rush.Diablo) {
          _actions.set("diablo", new RushAction("Rush Diablo", diablo));
        }
        if (Config.ControlBot.Rush.Shenk) {
          _actions.set("shenk", new RushAction("Rush Shenk", shenk));
        }
        if (Config.ControlBot.Rush.Anya) {
          _actions.set("anya", new RushAction("Rush Anya", anya));
        }
        if (Config.ControlBot.Rush.Ancients) {
          _actions.set("ancients", new RushAction("Rush Ancients", ancients));
        }
        if (Config.ControlBot.Rush.Baal) {
          _actions.set("baal", new RushAction("Rush Baal", baal));
        }
      }

      return _actions;
    })();

    /** @type {Map<string, string>} */
    const commandAliases = new Map([
      ["andariel", "andy"],
      ["bloodraven", "raven"],
      ["malus", "smith"],
      ["radament", "rada"],
      ["amulet", "amu"],
      ["ammy", "amu"],
      ["duriel", "duri"],
      ["dury", "duri"],
      ["talrasha", "duri"],
      ["tome", "lamesen"],
      ["travincal", "trav"],
      ["mephisto", "meph"],
      ["izual", "izzy"],
      ["bome", "bo"],
      ["time", "timeleft"],
      ["enchant", "chant"],
    ]);

    /** @param {[string, string, string]} command */
    const runAction = function (command) {
      if (!command || command.length < 2) return false;
      console.debug("Checking command: " + command);
      let [cmd, nick, full] = command;
      
      if (!Misc.findPlayer(nick)) {
        Chat.say("Seems " + nick + " left? Skipping " + cmd);
        return false;
      }

      if (!Misc.inMyParty(nick)) {
        Chat.say("Accept party invite, noob. Cmds only allowed for party members.");
        return false;
      }

      if (cmd.match(/^rush /gi)) {
        cmd = cmd.split(" ")[1];
      }

      if (commandAliases.has(cmd.toLowerCase())) {
        cmd = commandAliases.get(cmd.toLowerCase());
      }

      if (!actions.has(cmd.toLowerCase())) return false;
      let action = actions.get(cmd.toLowerCase());
      if (action.desc.includes("Rush") && action.complete) {
        Chat.whisper(nick, cmd + " disabled because it's already completed.");
        return false;
      }

      if (action.hostileCheck && checkHostiles()) {
        Chat.say("Command disabled because of hostiles.");
        return false;
      }

      if (full.match(/^givewp /gi)) {
        let [, areaName] = full.split("givewp ");
        if (areaName) {
          let cleanedAreaName = areaName.replace(/[<>\[\]{}()]/g, "").trim();
          /** @param {AreaDataObj} area */
          const areaFilter = function (area) {
            return area.Waypoint !== 255 && area.Index !== sdk.areas.HallsofPain;
          };
          /** @type {AreaDataObj} */
          let area = AreaData.findByName(cleanedAreaName, areaFilter);
          if (area.Waypoint === 255) {
            Chat.say(area.LocaleString + " isn't a valid wp area to ask for");

            return false;
          } else if (area.Index === sdk.areas.HallsofPain) {
            return false;
          }

          running.nick = nick;
          running.command = cmd + " " + area.Index;
          console.debug(running);

          return action.run(nick, area.Index);
        }
      }

      running.nick = nick;
      running.command = cmd;
      console.debug(running);

      return action.run(nick);
    };

    // START
    let gameEndWarningAnnounced = false;
    include("oog/ShitList.js");
    Config.ShitList && ShitList.read().forEach((name) => me.shitList.add(name));

    try {
      addEventListener("chatmsg", chatEvent);
      addEventListener("gameevent", gameEvent);
      Town.doChores();
      Town.goToTown(1);
      Town.move("portalspot");

      // check who is in game in cased we missed the gameevent or this was a restart
      let party = getParty();
      if (party) {
        do {
          if (party.name !== me.name && !players.has(party.name)) {
            players.set(party.name, "");
          }
        } while (party.getNext());
      }

      while (true) {
        Town.getDistance("stash") > 8 && Town.move("stash");

        if (queue.length > 0) {
          try {
            let command = queue.shift();
            if (command && !floodCheck(command)) {
              if (runAction(command)) {
                // check if command was for rush, if so we need to remove that as an option since its now completed
                if (actions.get(running.command.split(" ")[0]).desc.includes("Rush")) {
                  console.log("Disabling " + running.command + " from actions");
                  actions.get(running.command).markAsComplete(running.nick);
                }
                playerTracker.get(running.nick).toldToChill = false;
              }
            }
          } catch (e) {
            Misc.errorReport(e);
          }
          running.nick = "";
          running.command = "";
        }

        me.act > 1 && Town.goToTown(1);
        Config.ControlBot.Chant.AutoEnchant && autoChant();

        if (me.gold < MIN_GOLD && players.size > 1) {
          Chat.overhead(
            "I am low on gold, to keep this service up please donate by dropping gold near me."
            + " I need at least " + (MIN_GOLD - me.gold) + " gold."
          );
        }
        pickGoldPiles();

        if (getTickCount() - startTime >= maxTime || ngVote.nextGame) {
          if (Config.ControlBot.EndMessage) {
            Chat.say(Config.ControlBot.EndMessage);
          }
          delay(2000);

          break;
        } else if (!gameEndWarningAnnounced && getTickCount() - startTime >= maxTime - Time.seconds(30)) {
          let remaining = Math.round((maxTime - (getTickCount() - startTime)) / 1000);
          Chat.say("Next game in " + (Math.max(0, remaining)) + " seconds.");
          gameEndWarningAnnounced = true;
        }

        delay(200);
      }
    } finally {
      removeEventListener("chatmsg", chatEvent);
      removeEventListener("gameevent", gameEvent);
    }

    return true;
  },
  {
    startArea: sdk.areas.RogueEncampment,
    preAction: null,
    /**
     * @param {ControlBotContext} ctx
     */
    cleanup: function (ctx) {
      ctx.cleanup();
    }
  }
);
