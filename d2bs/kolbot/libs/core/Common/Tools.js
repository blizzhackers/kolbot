/**
*  @filename    Tools.js
*  @author      theBGuy
*  @desc        Tools for Toolsthread and its variations (MapToolsThread, ect)
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Toolsthread", {
    value: new function Toolsthread () {
      this.pots = {
        Health: 0,
        Mana: 1,
        Rejuv: 2,
        MercHealth: 3,
        MercRejuv: 4
      };
      this.pingTimer = [];
      this.pauseScripts = [];
      this.stopScripts = [];
      this.timerLastDrink = [];
      this.cloneWalked = false;

      /**
       * @param {boolean} print 
       * @returns {boolean}
       */
      this.checkPing = function (print = true) {
        // Quit after at least 5 seconds in game
        if (getTickCount() - me.gamestarttime < 5000 || !me.gameReady) return false;

        for (let i = 0; i < Config.PingQuit.length; i += 1) {
          if (Config.PingQuit[i].Ping > 0) {
            if (me.ping >= Config.PingQuit[i].Ping) {
              me.overhead("High Ping");

              if (this.pingTimer[i] === undefined || this.pingTimer[i] === 0) {
                this.pingTimer[i] = getTickCount();
              }

              if (getTickCount() - this.pingTimer[i] >= Config.PingQuit[i].Duration * 1000) {
                if (print) {
                  D2Bot.printToConsole(
                    "High ping (" + me.ping + "/" + Config.PingQuit[i].Ping + ") - leaving game.",
                    sdk.colors.D2Bot.Red
                  );
                }
                scriptBroadcast("pingquit");
                scriptBroadcast("quit");

                return true;
              }
            } else {
              this.pingTimer[i] = 0;
            }
          }
        }

        return false;
      },

      this.initQuitList = function () {
        let temp = [];

        for (let profile of Config.QuitList) {
          if (FileTools.exists("data/" + profile + ".json")) {
            let string = FileAction.read("data/" + profile + ".json");

            if (string) {
              let obj = JSON.parse(string);

              if (obj && obj.hasOwnProperty("name")) {
                temp.push(obj.name);
              }
            }
          }
        }

        Config.QuitList = temp.slice(0);
      };

      this.togglePause = function () {
        for (let curr of this.pauseScripts) {
          let script = getScript(curr);

          if (script) {
            if (script.running) {
              curr === "default.dbj" && console.log("ÿc1Pausing.");
              script.pause();
            } else {
              if (curr === "default.dbj") {
                console.log("ÿc2Resuming.");
              }
              script.resume();
            }
          }
        }

        return true;
      },

      this.stopDefault = function () {
        for (let curr of this.stopScripts) {
          try {
            let script = getScript(curr);
            if (!!script && script.running) {
              script.stop();
              while (script.running) {
                delay(3);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }

        return true;
      };

      this.exit = function (chickenExit = false) {
        chickenExit && D2Bot.updateChickens();
        Config.LogExperience && Experience.log();
        // clearAllEvents();
        console.log("ÿc8Run duration ÿc2" + (Time.format(getTickCount() - me.gamestarttime)));
        this.stopDefault();
        quit();
      };

      /**
       * @param {number} pottype 
       * @param {number} type 
       * @returns {ItemUnit | false}
       */
      this.getPotion = function (pottype, type) {
        if (!pottype) return false;
        if (!me.gameReady) return false;

        let items = me.getItemsEx()
          .filter(function (item) {
            return item.itemType === pottype;
          });
        if (items.length === 0) return false;

        // Get highest id = highest potion first
        items.sort(function (a, b) {
          return b.classid - a.classid;
        });

        for (let item of items) {
          if (type < this.pots.MercHealth && item.isInInventory && item.itemType === pottype) {
            console.log("ÿc2Drinking potion from inventory.");
            return item;
          }

          if (item.isInBelt && item.itemType === pottype) {
            console.log("ÿc2" + (type > 2 ? "Giving Merc" : "Drinking") + " potion from belt.");
            return item;
          }
        }

        return false;
      };

      /**
       * @param {number} type 
       * @returns {boolean}
       * @todo add stamina/thawing/antidote pot drinking here
       */
      this.drinkPotion = function (type) {
        if (type === undefined) return false;
        if (!me.gameReady) return false;
        let tNow = getTickCount();

        switch (type) {
        case this.pots.Health:
        case this.pots.Mana:
          if ((this.timerLastDrink[type]
            && (tNow - this.timerLastDrink[type] < 1000))
            || me.getState(type === this.pots.Health ? sdk.states.HealthPot : sdk.states.ManaPot)) {
            return false;
          }

          break;
        case this.pots.Rejuv:
          // small delay for juvs just to prevent using more at once
          if (this.timerLastDrink[type] && (tNow - this.timerLastDrink[type] < 300)) {
            return false;
          }

          break;
        case this.pots.MercRejuv:
          // larger delay for juvs just to prevent using more at once, considering merc update rate
          if (this.timerLastDrink[type] && (tNow - this.timerLastDrink[type] < 2000)) {
            return false;
          }

          break;
        default:
          if (this.timerLastDrink[type] && (tNow - this.timerLastDrink[type] < 8000)) {
            return false;
          }

          break;
        }

        let pottype = (() => {
          switch (type) {
          case this.pots.Health:
          case this.pots.MercHealth:
            return sdk.items.type.HealingPotion;
          case this.pots.Mana:
            return sdk.items.type.ManaPotion;
          default:
            return sdk.items.type.RejuvPotion;
          }
        })();

        let potion = this.getPotion(pottype, type);

        if (potion) {
          if (me.dead) return false;

          if (me.mode === sdk.player.mode.SkillActionSequence) {
            while (me.mode === sdk.player.mode.SkillActionSequence) {
              delay (25);
            }
          }

          try {
            type < this.pots.MercHealth
              ? potion.interact()
              : Packet.useBeltItemForMerc(potion);
          } catch (e) {
            console.error(e);
          }

          this.timerLastDrink[type] = getTickCount();

          return true;
        }

        return false;
      };

      this.checkVipers = function () {
        let monster = Game.getMonster(sdk.monsters.TombViper2);

        if (monster) {
          do {
            if (monster.getState(sdk.states.Revive)) {
              let owner = monster.getParent();

              if (owner && owner.name !== me.name) {
                D2Bot.printToConsole("Revived Tomb Vipers found. Leaving game.", sdk.colors.D2Bot.Red);

                return true;
              }
            }
          } while (monster.getNext());
        }

        return false;
      };

      this.getIronGolem = function () {
        let golem = Game.getMonster(sdk.summons.IronGolem);

        if (golem) {
          do {
            let owner = golem.getParent();

            if (owner && owner.name === me.name) {
              return copyUnit(golem);
            }
          } while (golem.getNext());
        }

        return false;
      };

      this.getNearestPreset = function () {
        let id;
        /** @type {Array<PresetUnit>} */
        let presets = getPresetUnits(me.area);
        let dist = 99;

        for (let unit of presets) {
          let coords = unit.realCoords();
          if (getDistance(me, coords.x, coords.y) < dist) {
            dist = getDistance(me, coords.x, coords.y);
            id = unit.type + " " + unit.id;
          }
        }

        return id || "";
      },

      /**
       * @param {MeType | MercUnit} unit 
       * @returns {string}
       */
      this.getStatsString = function (unit) {
        let realFCR = unit.getStat(sdk.stats.FCR);
        let realIAS = unit.getStat(sdk.stats.IAS);
        let realFBR = unit.getStat(sdk.stats.FBR);
        let realFHR = unit.getStat(sdk.stats.FHR);
        // me.getStat(sdk.stats.FasterCastRate) will return real FCR from gear + Config.FCR from char cfg

        if (unit === me) {
          realFCR -= Config.FCR;
          realIAS -= Config.IAS;
          realFBR -= Config.FBR;
          realFHR -= Config.FHR;
        }

        let maxHellFireRes = 75 + unit.getStat(sdk.stats.MaxFireResist);
        let hellFireRes = unit.getRes(sdk.stats.FireResist, sdk.difficulty.Hell);
        hellFireRes > maxHellFireRes && (hellFireRes = maxHellFireRes);

        let maxHellColdRes = 75 + unit.getStat(sdk.stats.MaxColdResist);
        let hellColdRes = unit.getRes(sdk.stats.ColdResist, sdk.difficulty.Hell);
        hellColdRes > maxHellColdRes && (hellColdRes = maxHellColdRes);

        let maxHellLightRes = 75 + unit.getStat(sdk.stats.MaxLightResist);
        let hellLightRes = unit.getRes(sdk.stats.LightResist, sdk.difficulty.Hell);
        hellLightRes > maxHellLightRes && (hellLightRes = maxHellLightRes);

        let maxHellPoisonRes = 75 + unit.getStat(sdk.stats.MaxPoisonResist);
        let hellPoisonRes = unit.getRes(sdk.stats.PoisonResist, sdk.difficulty.Hell);
        hellPoisonRes > maxHellPoisonRes && (hellPoisonRes = maxHellPoisonRes);

        let str =
          "ÿc4Character Level: ÿc0" + unit.charlvl
          + (unit === me ? " ÿc4Difficulty: ÿc0" + sdk.difficulty.nameOf(me.diff)
          + " ÿc4HighestActAvailable: ÿc0" + me.highestAct : "") + "\n"
          + "ÿc1FR: ÿc0" + unit.getStat(sdk.stats.FireResist) + "ÿc1 Applied FR: ÿc0" + unit.fireRes
          + "/ÿc3 CR: ÿc0" + unit.getStat(sdk.stats.ColdResist) + "ÿc3 Applied CR: ÿc0" + unit.coldRes
          + "/ÿc9 LR: ÿc0" + unit.getStat(sdk.stats.LightResist) + "ÿc9 Applied LR: ÿc0" + unit.lightRes
          + "/ÿc2 PR: ÿc0" + unit.getStat(sdk.stats.PoisonResist) + "ÿc2 Applied PR: ÿc0" + unit.poisonRes + "\n"
          + (!me.hell
            ? "Hell res: ÿc1" + hellFireRes
            + "ÿc0/ÿc3" + hellColdRes + "ÿc0/ÿc9" + hellLightRes + "ÿc0/ÿc2" + hellPoisonRes + "ÿc0\n" : "")
          + "ÿc4MF: ÿc0" + unit.getStat(sdk.stats.MagicBonus) + "ÿc4 GF: ÿc0" + unit.getStat(sdk.stats.GoldBonus)
          + " ÿc4FCR: ÿc0" + realFCR + " ÿc4IAS: ÿc0" + realIAS + " ÿc4FBR: ÿc0" + realFBR
          + " ÿc4FHR: ÿc0" + realFHR + " ÿc4FRW: ÿc0" + unit.getStat(sdk.stats.FRW) + "\n"
          + "ÿc4CB: ÿc0" + unit.getStat(sdk.stats.CrushingBlow) + " ÿc4DS: ÿc0" + unit.getStat(sdk.stats.DeadlyStrike)
          + " ÿc4OW: ÿc0" + unit.getStat(sdk.stats.OpenWounds)
          + " ÿc1LL: ÿc0" + unit.getStat(sdk.stats.LifeLeech) + " ÿc3ML: ÿc0" + unit.getStat(sdk.stats.ManaLeech)
          + " ÿc8DR: ÿc0" + unit.getStat(sdk.stats.DamageResist)
          + "% + " + unit.getStat(sdk.stats.NormalDamageReduction)
          + " ÿc8MDR: ÿc0" + unit.getStat(sdk.stats.MagicResist)
          + "% + " + unit.getStat(sdk.stats.MagicDamageReduction) + "\n"
          + (unit.getStat(sdk.stats.CannotbeFrozen) > 0 ? "ÿc3Cannot be Frozenÿc1\n" : "\n");

        return str;
      };
    },
    configurable: true,
  });
})(Common);
