/**
*  @filename    OrgTorchHelper.js
*  @author      theBGuy
*  @desc        Run alongside OrgTorch to help with Uber Tristram and Uber bosses
*
*/


const OrgTorchHelper = new Runnable(
  function OrgTorchHelper () {
    // TODO: Temp remove organs from nip so this doesn't interfere with OrgTorch
    Config.FindItem = false;
    
    let quitting = false;
    /** @type {Party} */
    let player = null;
    /** @type {number} */
    let lastPrecast;

    /** @type {{ task: string, id?: number | string, at: number, area: number }[]} */
    const taskList = [];
    const tasks = ["kill", "clear", "quit", "starting"];

    /**
    * @param {string} name 
    * @param {string} msg 
    */
    function chatEvent (name, msg) {
      if (!msg) return;
      const cmd = msg.toLowerCase().split(" ");
      const task = cmd.length ? cmd.shift() : "";
      if (!tasks.includes(task)) {
        return;
      }
      const idSplit = cmd.join(" ");
      const id = (function () {
        try {
          return parseInt(idSplit, 10) || idSplit;
        } catch (e) {
          console.warn(e.message || "Failed to parse id from message split");
          return;
        }
      })();

      if (!player) {
        // anything else we need to consider here?
        player = Misc.findPlayer(name);
      }

      if (player && name === player.name) {
        if (Config.OrgTorchHelper.SkipTp && me.inArea(player.area)) {
          return;
        }
        if (Config.OrgTorchHelper.Taxi && task !== "starting") {
          return;
        }
        if (Config.OrgTorchHelper.Taxi && id === sdk.areas.UberTristram) {
          return;
        }
        taskList.push({ task: task, id: id, at: getTickCount(), area: player.area });
      }
    }

    /**
     * Waits out death, stops the profile on hardcore, otherwise revives and returns to town.
     * @returns {void}
     */
    function handleDeath () {
      while (me.mode === sdk.player.mode.Death) {
        delay(3);
      }

      if (me.hardcore) {
        D2Bot.printToConsole(
          "(OrgTorchHelper) :: " + me.charname + " has died at level "
            + me.charlvl + ". Shutting down profile...",
          sdk.colors.D2Bot.Red
        );
        D2Bot.stop();
      }

      while (!me.inTown) {
        me.revive();
        delay(1000);
      }

      Town.move("portalspot");
      console.log("revived!");
    }

    /**
    * Get fade in River of Flames - only works if we are wearing an item with ctc Fade
    * @returns {boolean}
    * @todo equipping an item from storage if we have it
    */
    const getFade = function () {
      if (!Config.OrgTorchHelper.GetFade) return true;
      if (me.getState(sdk.states.Fade)) return true;

      // lets figure out what fade item we have before we leave town
      const fadeItem = me.findFirst([
        { name: sdk.locale.items.Treachery, equipped: true },
        { name: sdk.locale.items.LastWish, equipped: true },
        { name: sdk.locale.items.SpiritWard, equipped: true }
      ]);

      if (fadeItem.have) {
        console.log(sdk.colors.Orange + "OrgTorchHelper :: " + sdk.colors.White + "Getting Fade");

        Pather.useWaypoint(sdk.areas.RiverofFlame);
        Precast.doPrecast(true);
        // check if item is on switch
        let mainSlot;

        Pather.moveTo(7811, 5872);
          
        if (fadeItem.item.isOnSwap && me.weaponswitch !== sdk.player.slot.Secondary) {
          mainSlot = me.weaponswitch;
          me.switchWeapons(sdk.player.slot.Secondary);
        }

        Skill.canUse(sdk.skills.Salvation) && Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);

        while (!me.getState(sdk.states.Fade)) {
          delay(100);
        }

        mainSlot !== undefined && me.weaponswitch !== mainSlot && me.switchWeapons(mainSlot);

        console.log(sdk.colors.Orange + "OrgTorchHelper :: " + sdk.colors.Green + "Fade Achieved");
      }

      return true;
    };

    const portalUp = function () {
      return Config.OrgTorchHelper.Helper ? Pather.makePortal() : Town.goToTown();
    };

    const matronsDen = function () {
      Precast.doPrecast(true);
      Pather.moveToPresetObject(
        sdk.areas.MatronsDen,
        sdk.objects.SmallSparklyChest,
        { offX: 2, offY: 2, useWalkPath: Config.OrgTorchHelper.UseWalkPath, }
      );

      if (Config.OrgTorchHelper.Taxi) {
        portalUp() && say("up");

        if (!Config.OrgTorchHelper.Helper) {
          return;
        }
      }
      // TODO: allow callback to end clearing - in this case stop if lilith is dead
      Attack.clear(25, sdk.monsters.spectype.All, sdk.monsters.Lilith);
      Pickit.pickItems();
      Town.goToTown();
    };

    const forgottenSands = function () {
      Precast.doPrecast(true);

      const nodes = [
        new PathNode(20196, 8694),
        new PathNode(20308, 8588),
        new PathNode(20187, 8639),
        new PathNode(20100, 8550),
        new PathNode(20103, 8688),
        new PathNode(20144, 8709),
        new PathNode(20263, 8811),
        new PathNode(20247, 8665),
      ];

      /** @type {Monster | null} */
      let dury = null;
      const foundDuriel = function () {
        dury = Game.getMonster(sdk.monsters.UberDuriel);
        return !!dury;
      };

      try {
        for (let node of nodes) {
          Pather.move(node, { useWalkPath: Config.OrgTorchHelper.UseWalkPath, callback: foundDuriel });
          delay(500);

          if (foundDuriel()) {
            break;
          }
        }

        if (Config.OrgTorchHelper.Taxi) {
          dury && Pather.move(dury);
          portalUp() && say("up");

          if (!Config.OrgTorchHelper.Helper) {
            return;
          }
        }
        Attack.clear(25, sdk.monsters.spectype.All, sdk.monsters.UberDuriel);
        Pickit.pickItems();
        Town.goToTown();
      } catch (e) {
        //
      }
    };

    const furnance = function () {
      Precast.doPrecast(true);
      Pather.moveToPresetObject(
        sdk.areas.FurnaceofPain,
        sdk.objects.SmallSparklyChest,
        { offX: 2, offY: 2, useWalkPath: Config.OrgTorchHelper.UseWalkPath, }
      );

      if (Config.OrgTorchHelper.Taxi) {
        portalUp() && say("up");

        if (!Config.OrgTorchHelper.Helper) {
          return;
        }
      }
      Attack.clear(25, sdk.monsters.spectype.All, sdk.monsters.UberIzual);
      Pickit.pickItems();
      Town.goToTown();
    };
    
    const uberTrist = function () {
      Config.MercWatch = false;
      
      Pather.moveTo(25068, 5078);
      Precast.doPrecast(true);

      const validIds = [
        sdk.monsters.UberDiablo,
        sdk.monsters.UberMephisto,
        sdk.monsters.UberBaal
      ];

      // poll for the killer to have started so we don't interfere with lure
      Misc.poll(function () {
        let killCmd = taskList.find(el => el.task === "kill" && validIds.includes(el.id));
        return killCmd && killCmd.at < getTickCount() - Time.minutes(3);
      }, Time.seconds(15), 50);

      let nodes = [
        new PathNode(25040, 5101),
        new PathNode(25040, 5166),
        new PathNode(25122, 5170),
      ];

      for (let node of nodes) {
        Pather.move(node);
      }

      if (!Game.getMonster(sdk.monsters.UberMephisto)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.clear(15, sdk.monsters.spectype.All, sdk.monsters.UberMephisto);

      Pather.moveTo(25162, 5141);
      Misc.poll(function () {
        let diablo = Game.getMonster(sdk.monsters.UberDiablo);
        return diablo && (diablo.distance < 10 || diablo.dead);
      }, 3250, 50);

      if (!Game.getMonster(sdk.monsters.UberDiablo)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.clear(15, sdk.monsters.spectype.All, sdk.monsters.UberDiablo);

      if (!Game.getMonster(sdk.monsters.UberBaal)) {
        Pather.moveTo(25122, 5170);
      }

      Attack.clear(15, sdk.monsters.spectype.All, sdk.monsters.UberBaal);
      Pather.moveTo(25105, 5140);
      Pather.usePortal(sdk.areas.Harrogath);
    };

    const useLeaderPortal = function () {
      return Pather.usePortal(null, player.name);
    };

    addEventListener("chatmsg", chatEvent);
    
    // ################# //
    /* ##### START ##### */
    // ################# //
    
    getFade();
    Town.doChores();
    Town.goToTown(5);
    Town.move("portalspot");

    if (Config.Leader) {
      if (!Misc.poll(() => Misc.inMyParty(Config.Leader), 30e4, 1000)) {
        throw new Error("MFHelper: Leader not partied");
      }

      player = Misc.findPlayer(Config.Leader);
    }

    // START
    while (!quitting) {
      if (me.dead) {
        handleDeath();
      }

      if (player) {
        if (me.needHealing() && Town.heal()) {
          Town.move("portalspot");
        }

        if (taskList.length) {
          console.debug("Leader area :: " + player.area);

          if (taskList[0].task === "quit") return true;
          // check if any message is telling us to quit
          if (taskList.find(el => el.task === "quit")) return true;

          // handled pre-reqs, now perform normal checks
          let { task, id, at, area } = taskList.shift();

          if (!id) {
            console.warn("OrgTorchHelper :: No id found in taskList, skipping task " + task);
            continue;
          }

          if ((task === "kill" || task === "clear") && Attack._killed.has(id)) {
            continue;
          }

          // alright first lets check how long its been since the command was given
          // this probably needs to be adjusted but for now 3 minutes on any of theses tasks is probably too long
          if (getTickCount() - at > Time.minutes(3)) continue;

          /**
          * @todo still think this section needs to be done better, we are using a snapshot of the player's area at the time
          * of the message but sometimes the area hasn't been updated yet, causing us to do dumb things like attempt to kill
          * while still in town. We can't just use the players area though because of towncheck/chicken. Feel like best solution
          * would be adding area into leaders message and just always parsing it from there
          */
          if (me.area !== area) {
            !me.inTown && Town.goToTown();

            if (me.act !== sdk.areas.actOf(area)) {
              Town.goToTown(sdk.areas.actOf(area));
              Town.move("portalspot");
            }

            if (player.area !== area && !player.inTown) {
              area = player.area;
            }

            try {
              Misc.poll(useLeaderPortal, Time.seconds(15), 500 + me.ping);
            } catch (e) {
              console.warn(e.message || "Failed to take leader portal");
              continue;
            }
          }

          if (!me.inTown && me.area === area) {
            let forceCast = false;
            if (!lastPrecast || getTickCount() - lastPrecast > Time.minutes(2)) {
              forceCast = true;
              lastPrecast = getTickCount();
            }
            Precast.doPrecast(forceCast);
          } else if (!me.inTown && !me.inArea(player.area)) {
            Town.goToTown(5);
            continue;
          }

          switch (task) {
          case "starting":
            console.log("ÿc4OrgTorchHelperÿc0: Starting " + id);

            if (!Config.OrgTorchHelper.SkipTp && id === sdk.areas.UberTristram) {
              continue;
            }

            Pather.usePortal(id);

            if (me.inArea(sdk.areas.MatronsDen)) {
              matronsDen();
            } else if (me.inArea(sdk.areas.FurnaceofPain)) {
              furnance();
            } else if (me.inArea(sdk.areas.ForgottenSands)) {
              forgottenSands();
            } else if (me.inArea(sdk.areas.UberTristram)) {
              uberTrist();
            }

            break;
          case "kill":
            console.log("ÿc4OrgTorchHelperÿc0: Kill " + id);

            try {
              Attack.kill(id);
            } catch (err) {
              console.error(err);
            }

            break;
          case "clear":
            console.log("ÿc4OrgTorchHelperÿc0: Clear " + id);

            try {
              Attack.clear(15, 0, id);
            } catch (err) {
              console.error(err);
            }

            break;
          }

          if (!Pather.getPortal(sdk.areas.townOf(me.act)) || !Pather.usePortal(sdk.areas.townOf(me.act))) {
            Town.goToTown();
          }
        }
      }

      delay(100);
    }

    return true;
  },
  {
    startArea: sdk.areas.Harrogath
  }
);

Loader.register("OrgTorchHelper", OrgTorchHelper);
