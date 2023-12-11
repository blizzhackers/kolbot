/**
*  @filename    AutoRush.js
*  @author      theBGuy
*  @desc        Scripts for the AutoRush system
*
*/

(function (module) {
  const {
    AutoRush,
    RushModes,
    RushConfig,
  } = require("./RushConfig");
  
  const log = function (msg = "", sayMsg = true) {
    console.log(msg);
    sayMsg && say(msg);
  };

  const playerIn = function (area, nick) {
    !area && (area = me.area);

    let party = getParty();

    if (party) {
      do {
        if (party.name !== me.name
          && (!nick || String.isEqual(party.name, nick))
          && party.area === area) {
          return true;
        }
      } while (party.getNext());
    }

    return false;
  };

  const bumperLvlReq = function () {
    return [20, 40, 60][me.diff];
  };
  const bumperCheck = function (nick) {
    return nick
      ? Misc.findPlayer(nick).level >= bumperLvlReq()
      : Misc.checkPartyLevel(bumperLvlReq());
  };

  const playersInAct = function (act) {
    !act && (act = me.act);

    let area = sdk.areas.townOfAct(act);
    let party = getParty();

    if (party) {
      do {
        if (party.name !== me.name && party.area !== area) {
          return false;
        }
      } while (party.getNext());
    }

    return true;
  };
  const cain = function () {
    log("starting cain");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.DarkWood, true) && Precast.doPrecast(true);

    if (!Pather.moveToPreset(sdk.areas.DarkWood, sdk.unittype.Object, sdk.quest.chest.InifussTree, 5, 5)) {
      throw new Error("Failed to move to Tree of Inifuss");
    }

    let tree = Game.getObject(sdk.quest.chest.InifussTree);
    !!tree && tree.distance > 5 && Pather.moveToUnit(tree);
    Attack.securePosition(me.x, me.y, 40, 3000, true);
    !!tree && tree.distance > 5 && Pather.moveToUnit(tree);
    Pather.makePortal();
    log(AutoRush.playersIn);
    let tick = getTickCount();

    while (getTickCount() - tick < Time.minutes(2)) {
      if (tree.mode) {
        break;
      }
      Attack.securePosition(me.x, me.y, 20, 1000);
    }

    Pather.usePortal(1) || Town.goToTown();
    Pather.useWaypoint(sdk.areas.StonyField, true);
    Precast.doPrecast(true);
    Pather.moveToPresetMonster(sdk.areas.StonyField, sdk.monsters.preset.Rakanishu, {
      offX: 10, offY: 10, pop: true
    });
    const StoneAlpha = Game.getObject(sdk.quest.chest.StoneAlpha);
    Attack.securePosition(StoneAlpha.x, StoneAlpha.y, 40, 3000, true);
    StoneAlpha.distance > 5 && Pather.moveToUnit(StoneAlpha);
    Pather.makePortal();
    log(AutoRush.playersIn);

    tick = getTickCount();

    while (getTickCount() - tick < Time.minutes(2)) {
      if (Pather.usePortal(sdk.areas.Tristram)) {
        break;
      }
      Attack.securePosition(StoneAlpha.x, StoneAlpha.y, 35, 1000);
    }

    if (me.inArea(sdk.areas.Tristram)) {
      Pather.moveTo(me.x, me.y + 6);
      let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

      if (gibbet && !gibbet.mode) {
        if (!Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.CainsJail, 0, 0, true, true)) {
          throw new Error("Failed to move to Cain's Jail");
        }

        Attack.securePosition(gibbet.x, gibbet.y, 25, 3000);
        Pather.makePortal();
        log(AutoRush.playersIn);

        tick = getTickCount();

        while (getTickCount() - tick < Time.minutes(2)) {
          if (gibbet.mode) {
            break;
          }
          Attack.securePosition(me.x, me.y, 15, 1000);
        }
      }
    }

    return true;
  };
  /** @param {string} [nick] */
  const andariel = function (nick) {
    log("starting andariel");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.CatacombsLvl2, true) && Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.CatacombsLvl3, sdk.areas.CatacombsLvl4], true)
      || !Pather.moveTo(22582, 9612)) {
      throw new Error("andy failed");
    }

    Attack.securePosition(22582, 9612, 40, 3000, true);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      if (playerIn(me.area, nick)) {
        return true;
      }
      Pather.moveTo(22582, 9612);
      return false;
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Attack.kill(sdk.monsters.Andariel);
    log(AutoRush.playersOut);
    Pather.moveTo(22582, 9612);

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(250);
      }

      Pather.usePortal(null, me.name);
      log("a2");
      Town.goToTown(2);

      while (!playersInAct(2)) {
        delay(250);
      }
    }

    return true;
  };

  /** @param {string} [nick] */
  const bloodraven = function (nick) {
    log("starting bloodraven");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.ColdPlains, true) && Precast.doPrecast(true);

    if (!Pather.moveToPreset(sdk.areas.BurialGrounds, sdk.unittype.Monster, sdk.monsters.preset.BloodRaven, 30, 30)) {
      throw new Error("bloodraven failed");
    }

    Attack.securePosition(me.x, me.y, 10, 1000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      if (playerIn(me.area, nick)) {
        return true;
      }
      Pather.moveTo(22582, 9612);
      return false;
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Attack.kill(sdk.monsters.BloodRaven);
    log(AutoRush.playersOut);
    Pather.moveTo(22582, 9612);

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(250);
      }

      Pather.usePortal(null, me.name);
      Town.goToTown(2);
    }

    return true;
  };

  /** @param {string} [nick] */
  const smith = function (nick) {
    log("starting smith");
    if (Misc.findPlayer(nick).level < 8) {
      log(nick + " you are not eligible for smith. You need to be at least level 8");
        
      return false;
    }  

    Town.doChores();
    Pather.useWaypoint(sdk.areas.OuterCloister, true) && Precast.doPrecast(true);
    if (!Pather.moveToPreset(sdk.areas.Barracks, sdk.unittype.Object, sdk.quest.chest.MalusHolder)) {
      throw new Error("smith failed");
    }
    Attack.securePosition(me.x, me.y, 30, 3000, true);
    Pather.makePortal();
    log(AutoRush.playersIn);
    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }
    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }
    Pather.usePortal(null, me.name);
    return true;
  };
  /** @param {string} [nick] */
  const radament = function (nick) {
    log("starting radament");

    const	moveIntoPos = function (unit, range) {
      let coords = [];
      let angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);
      const angles = [
        0, 15, -15, 30, -30, 45, -45, 60, -60,
        75, -75, 90, -90, 105, -105, 120, -120,
        135, -135, 150, -150, 180
      ];

      for (let i = 0; i < angles.length; i += 1) {
        let coordx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * range + unit.x);
        let coordy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * range + unit.y);

        try {
          if (!(getCollision(unit.area, coordx, coordy) & 0x1)) {
            coords.push({
              x: coordx,
              y: coordy
            });
          }
        } catch (e) {
          continue;
        }
      }

      if (coords.length > 0) {
        coords.sort(Sort.units);

        return Pather.moveToUnit(coords[0]);
      }

      return false;
    };

    Pather.useWaypoint(sdk.areas.A2SewersLvl2, true) && Precast.doPrecast(false);
    Pather.moveToExit(sdk.areas.A2SewersLvl3, true);

    const radaPreset = Game.getPresetObject(sdk.areas.A2SewersLvl3, sdk.quest.chest.HoradricScrollChest);
    const radaCoords = radaPreset.realCoords();

    moveIntoPos(radaCoords, 50);
    const rada = Misc.poll(function () {
      return Game.getMonster(sdk.monsters.Radament);
    }, 1500, 500);

    rada ? moveIntoPos(rada, 60) : console.log("radament unit not found");
    Attack.securePosition(me.x, me.y, 35, 3000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Attack.kill(sdk.monsters.Radament);

    let book = Game.getItem(sdk.quest.item.BookofSkill);
    const returnSpot = {
      x: (book ? book.x : me.x),
      y: (book ? book.y : me.y)
    };

    log(AutoRush.playersOut);
    Pickit.pickItems();
    Attack.securePosition(returnSpot.x, returnSpot.y, 30, 3000);

    if (!Misc.poll(function () {
      return !playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Pather.moveToUnit(returnSpot);
    Pather.makePortal();
    log(AutoRush.allIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      Misc.poll(function () {
        return !Game.getItem(sdk.quest.item.BookofSkill);
      }, 30000, 1000);

      while (playerIn(me.area, nick)) {
        delay(200);
      }
    }

    Pather.usePortal(null, null);

    return true;
  };
  /** @param {string} [nick] */
  const cube = function (nick) {
    if (me.normal) {
      log("starting cube");
      Pather.useWaypoint(sdk.areas.HallsoftheDeadLvl2, true);
      Precast.doPrecast(true);

      if (!Pather.moveToExit(sdk.areas.HallsoftheDeadLvl3, true)
        || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricCubeChest)) {
        throw new Error("cube failed");
      }
      Attack.securePosition(me.x, me.y, 30, 3000, true);
      Pather.makePortal();
      log(AutoRush.playersIn);

      if (!Misc.poll(function () {
        return playerIn(me.area, nick);
      }, AutoRush.playerWaitTimeout, 1000)) {
        log("timed out");
        return false;
      }

      if (AutoRush.rushMode !== RushModes.chanter) {
        while (playerIn(me.area, nick)) {
          delay(100);
        }
      }

      Pather.usePortal(null, me.name);
    }

    return true;
  };
  /** @param {string} [nick] */
  const amulet = function (nick) {
    const exits = [sdk.areas.ValleyofSnakes, sdk.areas.ClawViperTempleLvl1, sdk.areas.ClawViperTempleLvl2];
    log("starting amulet");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.LostCity, true) && Precast.doPrecast(true);

    if (!Pather.moveToExit(exits, true)
      || !Pather.moveTo(15044, 14045)) {
      throw new Error("amulet failed");
    }

    Attack.securePosition(15044, 14045, 25, 3000, me.hell, me.hell);
    Pather.makePortal();

    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    Pather.usePortal(null, me.name);

    return true;
  };
  /** @param {string} [nick] */
  const staff = function (nick) {
    log("starting staff");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.FarOasis, true) && Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3], true)
      || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.ShaftoftheHoradricStaffChest)) {
      throw new Error("staff failed");
    }

    Attack.securePosition(me.x, me.y, 30, 3000, true);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    Pather.usePortal(null, me.name);

    return true;
  };
  /** @param {string} [nick] */
  const summoner = function (nick) {
    // right up 25449 5081 (25431, 5011)
    // left up 25081 5446 (25011, 5446)
    // right down 25830 5447 (25866, 5431)
    // left down 25447 5822 (25431, 5861)

    log("starting summoner");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.ArcaneSanctuary, true) && Precast.doPrecast(true);

    const preset = Game.getPresetObject(sdk.areas.ArcaneSanctuary, sdk.quest.chest.Journal).realCoords();
    /** @type {PathNode} */
    let spot = {};

    switch (preset.x) {
    case 25011:
      spot = { x: 25081, y: 5446 };
      break;
    case 25866:
      spot = { x: 25830, y: 5447 };
      break;
    case 25431:
      switch (preset.y) {
      case 5011:
        spot = { x: 25449, y: 5081 };
        break;
      case 5861:
        spot = { x: 25447, y: 5822 };
        break;
      }

      break;
    }

    if (!Pather.moveToUnit(spot)) {
      throw new Error("summoner failed");
    }

    Attack.securePosition(spot.x, spot.y, 25, 3000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      if (playerIn(me.area, nick)) {
        return true;
      }
      Pather.moveToUnit(spot);
      Attack.securePosition(me.x, me.y, 25, 500);
      return false;
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.Journal);
    Attack.kill(sdk.monsters.Summoner);
    log(AutoRush.playersOut);

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    Pickit.pickItems();
    Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.Journal);

    let redPortal = Game.getObject(sdk.objects.RedPortal);

    if (!redPortal || !Pather.usePortal(null, null, redPortal)) {
      if (!Misc.poll(function () {
        let journal = Game.getObject(sdk.quest.chest.Journal);

        if (journal && journal.interact()) {
          delay(1000);
          me.cancel();
        }

        redPortal = Pather.getPortal(sdk.areas.CanyonofMagic);

        return (redPortal && Pather.usePortal(null, null, redPortal));
      })) throw new Error("summoner failed");
    }
    Pather.useWaypoint(sdk.areas.LutGholein);

    return true;
  };
  /** @param {string} [nick] */
  const duriel = function (nick) {
    log("starting duriel");

    if (me.inTown) {
      Town.doChores();
      Pather.useWaypoint(sdk.areas.CanyonofMagic, true);
    } else {
      giveWP();
    }

    Precast.doPrecast(true);

    if (!Pather.moveToExit(getRoom().correcttomb, true)
      || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricStaffHolder)) {
      throw new Error("duriel failed");
    }

    Attack.securePosition(me.x, me.y, 30, 3000, true, me.hell);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    AutoRush.rushMode !== RushModes.chanter
      ? log(AutoRush.playersOut)
      : log("Place staff in orifice then wait in town");

    if (!Misc.poll(function () {
      return !playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (!Misc.poll(function () {
      return Game.getObject(sdk.objects.PortaltoDurielsLair);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("Duriel portal not found");
      return false;
    }

    Pather.useUnit(sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair);
    Attack.kill(sdk.monsters.Duriel);
    Pickit.pickItems();

    Pather.teleport = false;

    Pather.moveTo(22579, 15706);

    Pather.teleport = true;

    Pather.moveTo(22577, 15649, 10);
    Pather.moveTo(22577, 15609, 10);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (!Pather.usePortal(null, me.name)) {
      Town.goToTown();
    }

    Pather.useWaypoint(sdk.areas.PalaceCellarLvl1);
    Pather.moveToExit([sdk.areas.HaremLvl2, sdk.areas.HaremLvl1], true);
    Pather.moveTo(10022, 5047);

    if (AutoRush.rushMode !== RushModes.chanter) {
      log("a3");
      Town.goToTown(3);
      Town.doChores();

      while (!playersInAct(3)) {
        delay(250);
      }
    }

    return true;
  };
  /** @param {string} [nick] */
  const lamesen = function (nick) {
    log("starting lamesen");

    if (!Town.goToTown() || !Pather.useWaypoint(sdk.areas.KurastBazaar, true)) {
      throw new Error("Lam Essen quest failed");
    }

    Precast.doPrecast(false);

    if (!Pather.moveToExit(sdk.areas.RuinedTemple, true)
      || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.LamEsensTomeHolder)) {
      throw new Error("Lam Essen quest failed");
    }

    Attack.securePosition(me.x, me.y, 30, 2000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      if (!Misc.poll(function () {
        return !playerIn(me.area, nick);
      }, AutoRush.playerWaitTimeout, 1000)) {
        log("timed out");
        return false;
      }
    }

    Pather.usePortal(null, null);

    return true;
  };
  /** @param {string} [nick] */
  const brain = function (nick) {
    const exits = [
      sdk.areas.FlayerDungeonLvl1,
      sdk.areas.FlayerDungeonLvl2,
      sdk.areas.FlayerDungeonLvl3
    ];
    log("starting brain");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.FlayerJungle, true) && Precast.doPrecast(true);

    if (!Pather.moveToExit(exits, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsBrainChest)) {
      throw new Error("brain failed");
    }

    Attack.securePosition(me.x, me.y, 30, 3000, me.hell, me.hell);
    Pather.makePortal();

    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    Pather.usePortal(null, me.name);

    return true;
  };
  /** @param {string} [nick] */
  const eye = function (nick) {
    log("starting eye");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.SpiderForest, true) && Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.SpiderCavern, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsEyeChest)) {
      throw new Error("eye failed");
    }

    Attack.securePosition(me.x, me.y, 30, 3000, me.hell, me.hell);
    Pather.makePortal();

    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    Pather.usePortal(null, me.name);

    return true;
  };
  /** @param {string} [nick] */
  const heart = function (nick) {
    log("starting heart");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.KurastBazaar, true) && Precast.doPrecast(true);

    if (!Pather.journeyTo(sdk.areas.A3SewersLvl2, true)
      || !Pather.moveToPresetObject(me.area, sdk.quest.chest.KhalimsHeartChest)) {
      throw new Error("heart failed");
    }

    Attack.securePosition(me.x, me.y, 30, 3000, me.hell, me.hell);
    Pather.makePortal();

    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    Pather.usePortal(null, me.name);

    return true;
  };
  // re-write to prevent fail to complete quest due to killing council from to far away
  /** @param {string} [nick] */
  const travincal = function (nick) {
    log("starting travincal");
    Town.doChores();
    Pather.useWaypoint(sdk.areas.Travincal, true) && Precast.doPrecast(true);

    /** @type {PathNode} */
    const wpCoords = {
      x: me.x,
      y: me.y
    };
    const portalSpot = {
      x: wpCoords.x + 23,
      y: wpCoords.y - 102
    };

    Pather.move(portalSpot);
    Attack.securePosition(portalSpot.x, portalSpot.y, 40, 4000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Pather.moveTo(wpCoords.x + 30, wpCoords.y - 134);
    Pather.moveTo(wpCoords.x + 86, wpCoords.y - 130);
    Pather.moveTo(wpCoords.x + 71, wpCoords.y - 94);
    Attack.securePosition(me.x, me.y, 40, 4000);
    Attack.kill(sdk.locale.monsters.IsmailVilehand);

    Pather.move(portalSpot);
    Pather.makePortal();
    log(AutoRush.playersOut);
    Pather.usePortal(null, me.name);

    return true;
  };
  /** @param {string} [nick] */
  const mephisto = function (nick) {
    log("starting mephisto");

    Town.doChores();
    Pather.useWaypoint(sdk.areas.DuranceofHateLvl2, true) && Precast.doPrecast(true);
    if (Pather.moveToExit(sdk.areas.DuranceofHateLvl3, true) && Pather.moveTo(17692, 8023)) {
      Pather.makePortal();
    }
    delay(2000);
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Pather.moveTo(17591, 8070);
    Attack.kill(sdk.monsters.Mephisto);
    Pickit.pickItems();
    Pather.moveTo(17692, 8023) && Pather.makePortal();
    log(AutoRush.playersOut);

    while (playerIn(me.area, nick)) {
      delay(250);
    }

    Pather.moveTo(17591, 8070) && Attack.securePosition(me.x, me.y, 40, 3000);

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

    while (!playerIn(me.area, nick)) {
      delay(250);
    }

    log("a4");

    while (!playersInAct(4)) {
      delay(250);
    }

    delay(2000);
    Pather.usePortal(null);

    return true;
  };
  /** @param {string} [nick] */
  const izual = function (nick) {
    log("starting izual");

    const	moveIntoPos = function (unit, range) {
      let coords = [];
      let angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);
      const angles = [
        0, 15, -15, 30, -30, 45, -45, 60, -60,
        75, -75, 90, -90, 105, -105, 120, -120,
        135, -135, 150, -150, 180
      ];

      for (let i = 0; i < angles.length; i += 1) {
        let coordx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * range + unit.x);
        let coordy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * range + unit.y);

        try {
          if (!(getCollision(unit.area, coordx, coordy) & 0x1)) {
            coords.push({
              x: coordx,
              y: coordy
            });
          }
        } catch (e) {
          continue;
        }
      }

      if (coords.length > 0) {
        coords.sort(Sort.units);

        return Pather.moveToUnit(coords[0]);
      }

      return false;
    };

    Pather.useWaypoint(sdk.areas.CityoftheDamned, true) && Precast.doPrecast(false);
    Pather.moveToExit(sdk.areas.PlainsofDespair, true);

    const izualPreset = Game.getPresetMonster(sdk.areas.PlainsofDespair, sdk.monsters.Izual).realCoords();

    moveIntoPos(izualPreset, 50);
    let izual = Misc.poll(function () {
      return Game.getMonster(sdk.monsters.Izual);
    }, 1500, 500);

    izual ? moveIntoPos(izual, 60) : console.log("izual unit not found");

    let returnSpot = {
      x: me.x,
      y: me.y
    };

    Attack.securePosition(me.x, me.y, 30, 3000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Attack.kill(sdk.monsters.Izual);
    Pickit.pickItems();
    log(AutoRush.playersOut);
    Pather.moveToUnit(returnSpot);

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(200);
      }
    }

    Pather.usePortal(null, null);

    return true;
  };
  /** @param {string} [nick] */
  const diablo = function (nick) {
    include("core/Common/Diablo.js");
    log("starting diablo");

    function inviteIn () {
      Pather.moveTo(7763, 5267) && Pather.makePortal();
      // change this spot so we don't bring diablo closer to rushees
      Pather.moveTo(7727, 5267);
      log(AutoRush.playersIn);

      if (!Misc.poll(function () {
        return playerIn(me.area, nick);
      }, AutoRush.playerWaitTimeout, 1000)) {
        log("timed out");
        return false;
      }

      return true;
    }

    Town.doChores();
    Pather.useWaypoint(sdk.areas.RiverofFlame);
    Precast.doPrecast(true);
    if (!Pather.moveToExit(sdk.areas.ChaosSanctuary, true) && !Pather.moveTo(7790, 5544)) {
      throw new Error("Failed to move to Chaos Sanctuary");
    }
    
    Common.Diablo.initLayout();
    Config.Diablo.Fast = true;
    Config.Diablo.SealLeader = false;
    
    try {
      Common.Diablo.runSeals(Config.Diablo.SealOrder);
      console.log("Attempting to find Diablo");
      inviteIn() && Common.Diablo.diabloPrep();
    } catch (error) {
      console.log("Diablo wasn't found. Checking seals.");
      Common.Diablo.runSeals(Config.Diablo.SealOrder);
      inviteIn() && Common.Diablo.diabloPrep();
    }

    Attack.kill(sdk.monsters.Diablo);
    log(AutoRush.playersOut);

    if (me.expansion && AutoRush.rushMode !== RushModes.chanter) {
      log("a5");

      while (!playersInAct(5)) {
        delay(250);
      }
    }

    Pickit.pickItems();
    !Pather.usePortal(null, me.name) && Town.goToTown();

    return true;
  };
  /** @param {string} [nick] */
  const shenk = function (nick) {
    log("starting shenk");

    Pather.useWaypoint(sdk.areas.FrigidHighlands, true) && Precast.doPrecast(false);
    Pather.moveTo(3846, 5120);
    Attack.securePosition(me.x, me.y, 30, 3000);
    Pather.makePortal();
    log(AutoRush.playersIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Attack.kill(getLocaleString(sdk.locale.monsters.ShenktheOverseer));
    Pickit.pickItems();
    Pather.moveTo(3846, 5120);
    log(AutoRush.playersOut);

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(200);
      }
    }

    Pather.usePortal(null, null);

    return true;
  };
  /** @param {string} [nick] */
  const anya = function (nick) {
    !me.inTown && Town.goToTown();

    log("starting anya");

    if (!Pather.useWaypoint(sdk.areas.CrystalizedPassage, true)) {
      throw new Error("Anya quest failed");
    }

    Precast.doPrecast(false);

    if (!Pather.moveToExit(sdk.areas.FrozenRiver, true)
      || !Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.objects.FrozenAnyasPlatform)) {
      throw new Error("Anya quest failed");
    }

    Attack.securePosition(me.x, me.y, 30, 2000);

    let anya = Game.getObject(sdk.objects.FrozenAnya);

    if (anya) {
      Pather.moveToUnit(anya);
      // Rusher should be able to interact so quester can get the potion without entering
      Packet.entityInteract(anya);
      delay(1000 + me.ping);
      me.cancel();
    }

    if (AutoRush.rushMode === RushModes.chanter) {
      log("Talk to Malah to get potion then come in");
    }
    Pather.makePortal();
    if (AutoRush.rushMode !== RushModes.chanter) {
      log(AutoRush.playersIn);
    }

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter) {
      Misc.poll(function () {
        return !Game.getObject(sdk.objects.FrozenAnya);
      }, 30000, 1000);
      log(AutoRush.playersOut); // Mainly for non-questers to know when to get the scroll of resistance
      while (playerIn(me.area, nick)) {
        delay(200);
      }
    }

    Pather.usePortal(null, null);

    return true;
  };
  /** @param {string} [nick] */
  const ancients = function (nick) {
    if (AutoRush.rushMode !== RushModes.chanter) {
      if (!RushConfig[me.profile].config.Ancients[sdk.difficulty.nameOf(me.diff)]) {
        if (!RushConfig[me.profile].config.Wps) {
          log("Hell rush complete~");
          delay(500);
          quit();
        }
        return false;
      }
    }

    if (!bumperCheck(nick)) {
      if (AutoRush.rushMode === RushModes.chanter) {
        log(nick + " you are not eligible for ancients. You need to be at least level " + bumperLvlReq());
        
        return false;
      }
      if (!RushConfig[me.profile].config.Wps) {
        log("No eligible bumpers detected. Rush complete~");
        delay(500);
        quit();
      }

      return false;
    }

    include("core/Common/Ancients.js");
    log("starting ancients");

    Town.doChores();
    Pather.useWaypoint(sdk.areas.AncientsWay, true) && Precast.doPrecast(true);

    if (!Pather.moveToExit(sdk.areas.ArreatSummit, true)) {
      throw new Error("Failed to go to Ancients way.");
    }

    Pather.moveTo(10089, 12622);
    Pather.makePortal();
    log(AutoRush.allIn);

    if (!Misc.poll(function () {
      return playerIn(me.area, nick);
    }, AutoRush.playerWaitTimeout, 1000)) {
      log("timed out");
      return false;
    }

    Pather.moveTo(10048, 12628);
    Common.Ancients.touchAltar();
    Common.Ancients.startAncients();

    Pather.moveTo(10089, 12622);
    me.cancel();
    Pather.makePortal();

    if (AutoRush.rushMode !== RushModes.chanter) {
      while (playerIn(me.area, nick)) {
        delay(100);
      }
    }

    !Pather.usePortal(null, me.name) && Town.goToTown();

    return true;
  };
  /** @param {string} [nick] */
  const baal = function (nick) {
    if (me.hell && AutoRush.rushMode !== RushModes.chanter) {
      if (!RushConfig[me.profile].config.Wps) {
        log("Baal not done in Hell ~Hell rush complete~");
        delay(500);
        quit();
      }
      wpsToGive.remove(sdk.areas.WorldstoneLvl2);

      return false;
    }

    if (AutoRush.rushMode !== RushModes.chanter && !bumperCheck(nick)) {
      if (!RushConfig[me.profile].config.Wps) {
        log("No eligible bumpers detected. ~Rush complete~");
        delay(500);
        quit();
      }
      wpsToGive.remove(sdk.areas.WorldstoneLvl2);

      return false;
    }

    include("core/Common/Baal.js");
    log("starting baal");

    if (me.inTown) {
      Town.doChores();
      Pather.useWaypoint(sdk.areas.WorldstoneLvl2) && Precast.doPrecast(true);

      if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true)) {
        throw new Error("Failed to move to Throne of Destruction.");
      }
    }

    Pather.moveTo(15113, 5040);
    Attack.clear(15);
    Common.Baal.clearThrone();

    if (AutoRush.rushMode !== RushModes.rusher) {
      Pather.moveTo(15118, 5045);
      Pather.makePortal();
      say(AutoRush.playersIn);
    }

    if (!Common.Baal.clearWaves()) {
      throw new Error("Couldn't clear baal waves");
    }

    Common.Baal.clearThrone();

    if (AutoRush.rushMode !== RushModes.chanter) {
      me.checkForMobs({ range: 30 }) && this.clearWaves(); // ensure waves are actually done
      Pather.moveTo(15090, 5008);
      delay(5000);
      Precast.doPrecast(true);
      Misc.poll(() => !Game.getMonster(sdk.monsters.ThroneBaal), Time.minutes(3), 1000);

      let portal = Game.getObject(sdk.objects.WorldstonePortal);

      if (portal) {
        Pather.usePortal(null, null, portal);
      } else {
        throw new Error("Couldn't find portal.");
      }

      Pather.moveTo(15213, 5908);
      Pather.makePortal();
      Pather.moveTo(15170, 5950);
      delay(1000);
      log(AutoRush.allIn);

      while (!playerIn(me.area, nick)) {
        delay(250);
      }

      Pather.moveTo(15134, 5923);
      Attack.kill(sdk.monsters.Baal);
      Pickit.pickItems();
    }

    return true;
  };

  module.exports = {
    log: log,
    playerIn: playerIn,
    playersInAct: playersInAct,
    bumperCheck: bumperCheck,
    andariel: andariel,
    bloodraven: bloodraven,
    smith: smith,
    cube: cube,
    amulet: amulet,
    staff: staff,
    summoner: summoner,
    duriel: duriel,
    eye: eye,
    brain: brain,
    heart: heart,
    travincal: travincal,
    mephisto: mephisto,
    diablo: diablo,
    ancients: ancients,
    baal: baal,
    cain: cain,
    radament: radament,
    lamesen: lamesen,
    izual: izual,
    shenk: shenk,
    anya: anya
  };
})(module);
