/**
*       @filename       rungame2.js
*       @author         darjkeel@d2jsp
*       @desc           one script to run them all, and in the dankness bind them
*		@readme			rungame2 readme.txt
**/

function rungamex() {
  let boWP = 83, //Default bo wp
    chars = [ //Define chars and list their bosses/tasks
      "Sorceress",
      [
        "chores",
        "getbo 83",
        "Sszark the Burning",
        "goto 102",
        "areadelay in 75 Parzivol PLA",
        "taxi on",
        "areadelay in 75 Parzivol PLA",
        "Wyand Voidbringer",
        "areadelay in 75 Parzivol PLA",
        "Bremm Sparkfist",
        "areadelay in 75 Parzivol PLA",
        "Maffer Dragonhand",
        "goto 105",
        "areadelay in 103 Parzivol PLA",
        "Izual",
        "Hephasto the Armorer",
        "taxi off",
        "chaos",
        "areadelay in 108 Parzivol PLA",
        "getleg",
        "makecows",
        "chests on",
        "Witch Doctor Endugu",
        "Icehawk Riftwing",
        "chests off",
        "findshrine",
        "getbo 108",
        "Urdars",
        "chores"
      ],
      "QuestMF",
      [
        "chores",
        "getbo 83",
        "Andariel",
        "chests on",
        "Mephisto",
        "chests off",
        "Travincal",
        "Fire Eye",
        "The Summoner",
        "Duriel",
        "The Cow King",
        "Beetleburst",
        "Dark Elder",
        "Tunnels",
        "chores"
      ],
      "PLA",
      [
        "chores",
        "getbo 83",
        "Travincal",
        "chores",
        "areadelay in 102 CCA",
        "ride CCA",
        "chaos",
        "getbo 108",
        "ride CCA",
        "chores"
      ],
      "Parzivol",
      [
        "chores",
        "givebo 83 QuestMF PLA CCA",
        "Travincal",
        "goto 75",
        "areadelay in 102 CCA",
        "ride CCA",
        "chaos",
        "givebo 108 PLA CCA",
        "ride CCA",
        "chores"
      ]
    ],
        
    //Chaos options, only apply to walky cs "chaos"
    tele = "star", //Where to tp when running chaos. "gate" or "star"
    teleMsg = [""], //Message(s) after tp to cs. If multiple, picks one at random
    openSeals = [3], //Tele to and open seals after tp. 1 = infector main, 2 = infector other, 3 = seis, 4 = vizier other, 5 = vizier main 
    sealMsg = [], //Message(s) after pre-popping seals. If multiple, picks one at random
    clearChars = ["PLA", "Parzivol"], //Name of chars who will clear chaos
    clearMode = 0, //Clear mode = 0 = all, 0xF = skip normal, 0x7 = just champion/uniques (no minions)
    clearDirection = 1, //0 for clockwise Vizi->Seis->Fect. 1 for counterclockwise Fect->Seis->Vizi
    //Diablo options, apply to either walk cs "chaos" or taxi cs "Infector of Souls","Lord de Seis","Grand Vizier of Chaos","Diablo"
    killDiablo = ["PLA"], //Names of chars who will kill Diablo. Leave out your Baron(ess) char(s) for best drops
    leechDiablo = ["Parzivol"], //Names of chars who will leech d exp but not kill
    weakenDiablo = [], //Names of chars who will leave party and cast weakening spells (static/curse/aura) but not kill
    shrineDiablo = "Parzivol", //Name a char who will use experience shrine at diablo
    //Delay options for good happy timings
    boDelay = 180, //Max time to wait giving or getting bo 
    boQuit = false, //Quits if no bo given or received in time
    taxiDelay = 120, //Max time to wait for a taxi tp
    taxiQuit = false, //Quit if no taxi tp in time
    chaosDelay = 180, //Max time to wait for a chaos tp
    chaosQuit = false, //Quit if no cs tp found in time
    shrineDelay = 40, //Max time to wait for a tp to shrine in useshrine
    finderDelay = 0, //Make shrine finder wait for user to take
    areaDelay = 30, //Max time to wait for other chars in areadelay
    //END OF USER CONFIGS BEWARE NO TOUCHY BELOW
    Bosses = [
      "The Cow King",
      "Corpsefire",
      "Bishibosh",
      "Blood Raven",
      "Bonebreaker",
      "Coldcrow",
      "Rakanishu",
      "Griswold",
      "Treehead Woodfist",
      "The Countess",
      "The Smith",
      "Pitspawn Fouldog",
      "Bone Ash",
      "Andariel",
      "Radament",
      "Creeping Feature",
      "Bloodwitch the Wild",
      "Beetleburst",
      "Coldworm the Burrower",
      "Dark Elder",
      "Fangskin",
      "Fire Eye",
      "The Summoner",
      "Ancient Kaa the Soulless",
      "Duriel",
      "Sszark the Burning",
      "Witch Doctor Endugu",
      "Stormtree",
      "Battlemaid Sarina",
      "Icehawk Riftwing",
      "Travincal",
      "Bremm Sparkfist",
      "Wyand Voidbringer",
      "Maffer Dragonhand",
      "Mephisto",
      "Izual",
      "Hephasto the Armorer",
      "Infector of Souls",
      "Lord de Seis",
      "Grand Vizier of Chaos",
      "Diablo"
    ],
    Tasks = [
      "chores",
      "givebo",
      "getbo",
      "taxi",
      "ride",
      "chaos",
      "getleg",
      "makecows",
      "clearcows",
      "findshrine",
      "useshrine",
      "chests",
      "goto",
      "areadelay",
      "Shopbot",
      "Urdars",
      "Tunnels"
    ],
    wps = [
      1, 3, 3,
      3, 3, 3,
      4, 4, 5,
      6, 27, 29,
      32, 35, 48,
      42, 57, 43,
      43, 44, 44,
      74, 74, 46,
      46, 76, 78,
      79, 80, 81,
      83, 101, 101,
      101, 101, 106,
      106, 107, 107,
      107, 107, 106
    ],
    exits = [
      [0],
      [2, 8],
      [0],
      [17],
      [17, 18],
      [9],
      [38],
      [0],
      [0],
      [20, 21, 22, 23, 24, 25],
      [28],
      [30],
      [33],
      [36, 37],
      [49],
      [41, 55, 59],
      [60],
      [0],
      [62, 63, 64],
      [0],
      [45, 58, 61],
      [0],
      [0],
      [0],
      [0],
      [85],
      [88, 89, 91],
      [78],
      [94],
      [92],
      [0],
      [102],
      [102],
      [102],
      [102],
      [105],
      [107],
      [108],
      [108],
      [108],
      [108]
    ],
    presets = [
      773,
      774,
      734,
      805,
      735,
      736,
      737,
      739,
      738,
      740,
      754,
      741,
      743,
      156,
      744,
      748,
      745,
      747,
      749,
      751,
      746,
      750,
      250,
      753,
      211,
      755,
      756,
      false,
      758,
      759,
      false,
      762,
      764,
      765,
      242,
      256,
      775,
      false,
      false,
      false,
      false
    ],
    vizLayout,
    seisLayout,
    infLayout,
    vizx,
    vizy,
    seisx,
    seisy,
    infx,
    infy,
    diax,
    diay,
    cmd,
    last,
    taxiChar = false,
    chests = false,
    runString,
    runDone;
  
  /**
   * @param {string | number} name 
   * @returns {boolean | number}
   */
  this.find = function (name) {
    let unit = Game.getPlayer(name);
    if (unit) return unit.area;

    let party = getParty();
    if (!party) return false;

    do {
      if (party.name === name) {
        return (party.area > 0) ? party.area : true;
      }
    } while (party.getNext());
    return false;
  };

  /**
   * @param {string | number} name 
   * @returns {Act}
   */
  this.getAct = function(name) {
    let _area = this.find(name);
    return _area === true
      ? me.act
      : sdk.areas.actOf(_area);
  };

  /**
   * @param {number} id 
   * @returns {boolean}
   */
  this.openSeal = function (id) {
    let seal = Game.getObject(id);
    if (seal && seal.mode) return false;
    Pather.moveToPreset(108, 2, id, 4, 4);
    seal = Game.getObject(id);
    if (!seal || (seal && seal.mode)) return false;
    let retryCount = 0;
    
    while (!seal.mode) {
      if (!Skill.cast(43, 0, seal) || retryCount > 50) seal.interact();
      delay(100);
      if (seal.mode === 0) {
        if (retryCount % 5 === 0) {
          Pather.moveTo(seal.x + rand(-5, 5), seal.y + rand(-5, 5));
        }
        delay(400);
        retryCount++;
      }
      if (retryCount > 100) {
        D2Bot.printToConsole("OPEN SEAL " + id + " FAILED in game: " + me.gamename, 9);
        return false;
      }
      if (cmd === "Diablo") {
        break;
      }
    }
    return true;
  };

  this.getLayout = function(seal, value) {
    let sealPreset = getPresetUnit(108, 2, seal);
    if (!seal) {
      throw new Error("Seal preset not found.");
    }
    if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
      return 1;
    }
    return 2;
  };

  this.initLayout = function() {
    vizLayout = getLayout(396, 5275); // 1 = "Y", 2 = "L"
    if (vizLayout === 1) vizx = 7680, vizy = 5295; //	Y	(7680,5295)		L	(7685,5320)
    if (vizLayout === 2) vizx = 7685, vizy = 5320;
    seisLayout = getLayout(394, 7773); // 1 = "2", 2 = "5"
    if (seisLayout === 1) seisx = 7775, seisy = 5200; //	2	(7775,5220)		5	(7780,5185)
    if (seisLayout === 2) seisx = 7780, seisy = 5175;
    infLayout = getLayout(392, 7893); // 1 = "I", 2 = "J"
    if (infLayout === 1) infx = 7910, infy = 5295; //	I	(7910,5295)		J	(7295,5280)
    if (infLayout === 2) infx = 7925, infy = 5280;
    diax = 7795, diay = 5295;
  };
  
  /**
   * @param {string[]} char_str 
   */
  this.bo = function(char_str) {
    let unit;
    if (char_str) {
      Precast.doPrecast(true);
      for (let i = 0; i < char_str.length; i++) {
        unit = getUnit(0, char_str[i]);
        if (unit
          && unit.name !== me.name
          && !unit.dead
          && Misc.inMyParty(unit.name)
          && (!unit.getState(26) || !unit.getState(32) || !unit.getState(51))
          && getDistance(me, unit) <= 20) {
          Precast.doPrecast(true);
        }
      }
    } else {
      unit = getUnit(0);
      if (unit) {
        do {
          if (unit.name !== me.name
            && !unit.dead
            && Misc.inMyParty(unit.name)
            && (!unit.getState(26) || !unit.getState(32) || !unit.getState(51))
            && getDistance(me, unit) <= 20) {
            Precast.doPrecast(true);
          }
        } while (unit.getNext());
      }
    }
  };

  this.chant = function(char_str) {
    let unit;
    if (char_str) {
      for (let i = 0; i < char_str.length; i++) {
        unit = getUnit(0, char_str[i]);
        if (unit && !unit.getState(16) && getDistance(me, unit) <= 40) {
          Skill.setSkill(52, 0);
          sendPacket(1, 0x11, 4, unit.type, 4, unit.gid);
          delay(250);
          
        }
        unit = getUnit(1);
        if (unit) {
          do {
            if (unit.getParent() && char_str.indexOf(unit.getParent().name) > -1 && !unit.getState(16) && getDistance(me, unit) <= 40) {
              Skill.setSkill(52, 0);
              sendPacket(1, 0x11, 4, unit.type, 4, unit.gid);
              delay(500);
            }
          } while (unit.getNext());
        }
      }
    } else {
      unit = getUnit(0);
      if (unit) {
        do {
          if (!unit.getState(16) && Misc.inMyParty(unit.name) && getDistance(me, unit) <= 40) {
            Skill.setSkill(52, 0);
            sendPacket(1, 0x11, 4, unit.type, 4, unit.gid);
            delay(250);
          }
        } while (unit.getNext());
        
      }
      unit = getUnit(1);
      if (unit) {
        do {
          if (unit.getParent() && !unit.getState(16) && getDistance(me, unit) <= 40) {
            Skill.setSkill(52, 0);
            sendPacket(1, 0x11, 4, unit.type, 4, unit.gid);
            delay(500);
          }
        } while (unit.getNext());
      }
    }
  };

  this.pop = function() {
    let monsterList = [],
      monster = getUnit(1);
    if (monster) {
      do {
        if ([345, 346, 347].indexOf(monster.classid) > -1 || (monster.spectype !== 0 && monster.spectype !== 8)) {
          if (getDistance(me, monster) <= 30) monsterList.push(copyUnit(monster));
        }
      } while (monster.getNext());
    }
    for (let i = 0; i < monsterList.length; i++) {
      if ((monsterList[i].mode === 0 || monsterList[i].mode === 12) && !monsterList[i].getState(1) && !monsterList[i].getState(96) && !monsterList[i].getState(99) && !monsterList[i].getState(104) && !monsterList[i].getState(107) && !monsterList[i].getState(118)) {
        console.log("popping " + monsterList[i].name + " spectype: " + monsterList[i].spectype + " classid: " + monsterList[i].classid);
        Pather.moveTo(monsterList[i].x, monsterList[i].y, 3);
        ClassAttack.findItem(10);
      }
    }
  };

  this.chests = function() {
    let preset = getPresetUnits(me.area, 2),
      coords = [];
    while (preset.length > 0) {
      if ([5, 6, 87, 88, 139, 147, 148, 177, 329, 330, 333, 371, 387, 389, 397, 424, 425, 454, 455, 580, 581].indexOf(preset[0].id) > -1) {
        coords.push({
          x: preset[0].roomx * 5 + preset[0].x,
          y: preset[0].roomy * 5 + preset[0].y
        });
      }
      preset.shift();
    }
    while (coords.length) {
      coords.sort(Sort.units);
      Pather.moveToUnit(coords[0], 1, 2);
      Misc.openChests(5);
      coords.shift();
    }
  };

  this.delays = function(mode, delay_, char_str, mode2, aid) {
    let tTimer = getTickCount();
    switch (mode) {
    case "givebo":
      for (let i = 0; i < char_str.length; i++) {
        if (getTickCount() >= tTimer + delay_ * 1e3 - 5000 && i < char_str.length) {
          D2Bot.printToConsole("give bo fail", 9);
          if (boQuit) quit();
          break;
        }
        if (getUnit(0, char_str[i])) i++;
        delay(100);
      }
      this.bo(char_str);
      break;
    case "getbo":
      while (!Misc.inMyParty(char_str) || !getUnit(0, char_str, 10)) {
        if (getTickCount() >= tTimer + delay_ * 1e3) {
          D2Bot.printToConsole("get bo fail 1", 9);
          if (boQuit) quit();
          break;
        }
        delay(100);
      }
      while (getTickCount() <= tTimer + delay_ * 1e3 && (!me.getState(26) || !me.getState(32) || !me.getState(51))) {
        if (getTickCount() >= tTimer + delay_ * 1e3) {
          D2Bot.printToConsole("get bo fail 2", 9);
          if (boQuit) quit();
          break;
        }
        delay(100);
      }
      if (me.classid === 1 && Skill.setSkill(52, 0) && me.getSkill(52, 0) >= 10) this.chant();
      else {
        for (let i = 0; i < 10; i++) {
          let brk = true;
          for (let j = 0; j < 5; j++) {
            delay(100);
            if (getUnit(0, char_str, 10)) brk = false;
          }
          if (brk) break;
        }
      }
      break;
    case "givechant":
      {
        let i = 0;
        while (getTickCount() <= tTimer + delay_ * 1e3) {
          if (getTickCount() >= tTimer + delay_ * 1e3) break;
          if (char_str && char_str.length > 0 && getUnit(0, char_str[i])) {
            this.chant(char_str[i]);
            i++;
          } else this.chant();
          delay(100);
        }
      }
      break;
    case "ride":
      while (!Misc.inMyParty(char_str) || !taxiChar) {
        if (getTickCount() >= tTimer + delay_ * 1e3) {
          D2Bot.printToConsole("wait for taxi fail", 9);
          if (taxiQuit) quit();
          break;
        }
        delay(100);
      }
      break;
    case "chaos":
      if (getUnit(2, "waypoint")) Pather.useWaypoint(103, true);
      else Town.goToTown(4);
      Town.move("portalspot");
      while (me.area !== 108 && !Pather.usePortal(108, char_str)) {
        if (getTickCount() >= tTimer + delay_ * 1e3) {
          D2Bot.printToConsole("wait for chaos fail", 9);
          if (taxiQuit) quit();
          break;
        }
        delay(100);
      }
      break;
    case "shrine":
      Town.goToTown(1);
      Town.move("portalspot");
      while (!me.getState(137)) {
        if (char_str != null && !Misc.inMyParty(char_str)) break;
        if (getTickCount() >= tTimer + delay_ * 1e3) {
          D2Bot.printToConsole("wait for shrine fail", 9);
          if (taxiQuit) quit();
          break;
        }
        
        if (Pather.usePortal(null, char_str)) {
          let shrine = getUnit(2, "shrine");
          if (shrine) {
            do {
              if (shrine.objtype === 15 && shrine.mode === 0) {
                Pather.moveTo(shrine.x - 2, shrine.y - 2);
                Misc.getShrine(shrine);
                Pather.makePortal();
                if (me.getState(137)) break;
              }
            } while (shrine.getNext());
          }
          if (!char_str || !Pather.usePortal(1, char_str)) Town.goToTown(1);
          break;
        }
        delay(100);
      }
      break;
    case "finder":
      loop1:
      while (getTickCount() <= tTimer + delay_ * 1e3) {
        let unit = getUnit(0);
        if (unit) {
          do {
            if (unit.getState(137)) break loop1;
          } while (unit.getNext());
        }
        delay(100);
      }
      break;
    case "area":
      let chars_ = [];
      let pp = getParty(); //big pp variable name come at me bro
      if (pp) {
        do {
          if (!char_str) {
            if (pp.name !== me.name) chars_.push(pp.name);
          } else if (char_str) {
            if (char_str.indexOf(pp.name) > -1 && pp.name !== me.name) chars_.push(pp.name);
          }
        } while (pp.getNext());
      }
      loop2:
      while (getTickCount() <= tTimer + delay_ * 1e3) {
        delay(100);
        if (mode2 === "in") {
          for (let i = 0; i < chars_.length; i++) {
            if (!char_str && this.find(chars_[i]) === aid) break loop2;
            else if (char_str && this.find(chars_[i]) !== aid) break;
            else if (char_str && i === chars_.length - 1) break loop2;
          }
        } else if (mode2 === "out") {
          for (let i = 0; i < chars_.length; i++) {
            if (this.find(chars_[i]) === aid) break;
            else if (i === chars_.length - 1) break loop2;
          }
        }
      }
      break;
    }
  };

  this.killBoss = function(name) {
    if (chars[chars.indexOf(me.name) + 1].indexOf("givebo") > -1) this.bo();
    if (me.name === taxiChar
      && name !== "Grand Vizier of Chaos"
      && name !== "Lord de Seis"
      && name !== "Infector of Souls"
      && name !== "Diablo") {
      if (getUnit(1, name) && getDistance(getUnit(1, name)) > 10 && me.area !== 108) Pather.moveTo(getUnit(1, name).x + rand(-5, 5), getUnit(1, name).y + rand(-5, 5), 0);
      Pather.makePortal();
      say(name);
    }
    if (name === "Grand Vizier of Chaos"
      || name === "Lord de Seis"
      || name === "Infector of Souls"
      || name === "Diablo") {
      if (!diax) this.initLayout();
      let sealTimer = getTickCount();

      for (let i = 0; getTickCount() <= sealTimer + 20 * 1e3; i++) {
        if (!getUnit(1, name)) {
          if (!this.precast()) Attack.clear(10);
          if (name === "Grand Vizier of Chaos") Pather.moveTo(vizx, vizy);
          if (name === "Infector of Souls") Pather.moveTo(infx, infy);
          if (name === "Lord de Seis") Pather.moveTo(seisx, seisy);
          if (name === "Diablo") Pather.moveTo(diax, diay);
          delay(10);
        } else if (i >= 2000) break;
        else break;
      }
    }
    if (getUnit(1, name) && getUnit(1, name).hp > 0) {
      if (me.name === taxiChar) {
        for (let i = 0; i < 30; i++) {
          let mon = getUnit(1, name);
          if (getUnit(1, name)) Attack.clear(getDistance(me, getUnit(1, name)) + 5, 0xF, name);
          if (!mon || mon.hp === 0) break;
          delay(100);
        }
      } else if (getUnit(1, name)) {
        if (getUnit(1, name).spectype === 0) {
          Attack.clear(getDistance(me, getUnit(1, name)) + 5, 0, name);
        } else {
          Attack.clear(getDistance(me, getUnit(1, name)) + 5, 0xF, name);
        }
      }
    }
    if (name === "Travincal") {
      let monsterList = [];
      let monster = Game.getMonster();
      if (monster) {
        do {
          if ([345, 346, 347].includes(monster.classid) && monster.attackable) {
            monsterList.push(copyUnit(monster));
          }
        } while (monster.getNext());
      }
      Attack.clearList(monsterList);
    }
    if (chars[chars.indexOf(me.name) + 1].indexOf("givebo") > -1) this.bo();
    if (me.classid === 4 && Config.FindItem) this.pop();
    if (name === "Andariel") delay(2000);
    Pickit.pickItems();
    return true;
  };

  this.runBoss = function (name, wp, exit, preset) {
    console.log(name);
    if (me.area !== wp && exit.indexOf(me.area) === -1) {
      let wpunit = getUnit(2, "waypoint");
      if (!wpunit) Town.goToTown();
      Pather.useWaypoint(wp, true);
      Precast.doPrecast(true);
    }
    if (!this.bossSpecial(name, 1)) return false;
    if (exit.indexOf(me.area) > 0 && me.area !== exit[exit.length - 1]) {
      let i = [];
      for (let j = exit.indexOf(me.area); j < exit.length; j++) i.push(exit[j]);
      exit = i;
    }
    if (exit[0] !== 0 && me.area !== exit[exit.length - 1]) Pather.moveToExit(exit, true);
    if (!this.bossSpecial(name, 2)) return false;
    if (preset && getPresetUnit(me.area, 1, preset)) Pather.moveToPreset(me.area, 1, preset);
    if (this.bossSpecial(name, 3)) this.killBoss(name);
    if (!this.bossSpecial(name, 4)) return false;
    return true;
  };

  this.bossSpecial = function (name, t) {
    if (t === 1) {
      if (name === "The Cow King") {
        Town.move("stash");
        for (let i = 0; i < 30; i++) {
          if (Pather.usePortal(39)) break;
          delay(100);
        }
        if (!Pather.usePortal(39)) return false;
        else return true;
      }
      if (chests && ["Stormtree", "Battlemaid Sarina", "Icehawk Riftwing"].indexOf(name) > -1) {
        this.chests();
        Pickit.pickItems();
        return true;
      }
      return true;
    }
    if (t === 2) {
      if (chests && name === "Icehawk Riftwing") {
        this.chests();
      }
      if (name === "Griswold") {
        Pather.moveToPreset(me.area, 1, 737);
        while (!getUnit(2, 60)) delay(10);
        Pather.usePortal(38);
        return true;
      }
      if (name === "Fire Eye") {
        Pather.usePortal(null);
        return true;
      }
      if (name === "Ancient Kaa the Soulless") {
        let j, k, pre, kaa = false;
        for (j = 66; kaa === false; j++) {
          if (me.area !== 46) Pather.moveToExit(46, true);
          Pather.moveToExit(j, true);
          pre = getPresetUnits(me.area, 1);
          for (k = 0; k < pre.length; k++) {
            if (pre[k].id === 753) kaa = true;
          }
        }
        return true;
      }
      if (name === "Duriel") {
        Pather.moveToExit(getRoom().correcttomb, true);
        Pather.moveToPreset(me.area, 2, 152, -3, -3);
        while (!getUnit(2, 100)) delay(10);
        if (me.classid === 1 && me.getSkill(43, 1)) {
          for (let i = 0; i < 10; i += 1) {
            if (me.area === 73) {
              break;
            }
            Skill.cast(43, 0, getUnit(2, 100));
          }
        } else Pather.useUnit(2, 100, 73);
        return true;
      }
      if (name === "Travincal") {
        Pather.moveTo(me.x + 101, me.y - 71);
        return true;
      }
      if (name === "Grand Vizier of Chaos") {
        if (!vizx) this.initLayout();
        if (me.name === taxiChar) {
          Pather.moveTo(vizx, vizy, 3);
          Pather.makePortal();
          say(name);
        }
        this.openSeal(396);
        Pather.moveTo(vizx, vizy, 3);
        return true;
      }
      if (name === "Lord de Seis") {
        if (!seisx) this.initLayout();
        if (me.name === taxiChar) {
          Pather.moveTo(seisx, seisy, 3);
          Pather.makePortal();
          say(name);
        }
        this.openSeal(394);
        Pather.moveTo(seisx, seisy, 3);
        return true;
      }
      if (name === "Infector of Souls") {
        if (!infx) this.initLayout();
        if (me.name === taxiChar) {
          Pather.moveTo(infx, infy, 3);
          Pather.makePortal();
          say(name);
        }
        this.openSeal(392);
        Pather.moveTo(infx, infy, 3);
        return true;
      }
      if (name === "Diablo") {
        if (!diax) this.initLayout();
        Pather.moveTo(diax, diay, 3);
        return true;
      }
      return true;
    }
    if (t === 3) {
      if (name === "Diablo") {
        if (me.name === taxiChar) {
          //cmd = "Diablo";
          say("Diablo");
          this.diablo();
          return false;
        } else return true;
      }
      return true;
    }
    if (t === 4) {
      if (name === "Fire Eye") {
        Pather.moveTo(10073, 8668);
        Pather.usePortal(null);
        return true;
      }
      if (name === "The Summoner") {
        let journal = getUnit(2, 357);
        if (journal) {
          Pather.moveTo(journal.x, journal.y);
          for (let i = 0; i < 5; i += 1) {
            journal.interact();
            delay(me.ping + 500);
            me.cancel();
            delay(me.ping + 500);
            if (Pather.getPortal(46)) break;
          }
          Pather.usePortal(46);
        }
        return true;
      }
      if (chests && ["Bonebreaker", "Coldcrow", "Countess", "Creeping Feature", "Coldworm the Burrower", "Dark Elder", "Icehawk Riftwing", "Mephisto"].indexOf(name) > -1) {
        if (name === "Coldcrow") Pather.moveToExit(13, true);
        if (name === "Dark Elder") Pather.moveToExit(65, true);
        if (name === "Icehawk Riftwing") Pather.moveToExit(93, true);
        this.chests();
        Pickit.pickItems();
        return true;
      }
      if (name === "Grand Vizier of Chaos") {
        this.openSeal(395);
        return true;
      }
      if (name === "Infector of Souls") {
        this.openSeal(393);
        return true;
      }
      return true;
    }
    return false;
  };

  this.runList = function (list) {
    runString = [];
    for (let i = 0; i < list.length; i++) {
      if (Bosses.indexOf(list[i]) > -1) {
        if (runString.indexOf(list[i]) === -1) runString.push(list[i]);
        else D2Bot.printToConsole("boss '" + list[i] + "' listed more than once", 9);
      } else {
        for (let j = 0; j < Tasks.length; j++) {
          if (list[i].indexOf(Tasks[j]) === 0) runString.push(list[i]);
        }
        if (runString.indexOf(list[i]) === -1) D2Bot.printToConsole("boss/task string '" + list[i] + "' not recognized and ignored", 9);
      }
    }
    runDone = [];
    for (let i = 0; runDone.length < runString.length; i++) {
      if (Bosses.indexOf(runString[i]) > -1) {
        let loc = Bosses.indexOf(runString[i]);
        if (runDone.indexOf(runString[i]) === -1) {
          this.runBoss(Bosses[loc], wps[loc], exits[loc], presets[loc]);
          runDone.push(runString[i]);
        }
      } else {
        for (let j = 0; j < Tasks.length; j++) {
          if (runString[i].indexOf(Tasks[j]) === 0) {
            this.runTask(runString[i]);
            runDone.push(runString[i]);
          }
        }
      }
    }
    return true;
  };

  this.runTask = function (task) {
    console.log(task);
    let wp;
    if (task.indexOf("givebo") === 0) {
      let boChars = [];
      if (task === "givebo") {
        wp = boWP;
        for (let i = 1; i <= chars.length; i += 2) {
          for (let j = 0; j < chars[i].length; j++) {
            if (chars[i][j].indexOf("getbo") > -1) boChars.push(chars[i - 1]);
          }
        }
      } else if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        if (task.indexOf(" ") === -1) {
          wp = Number(task);
          if (isNaN(wp)) wp = boWP;
          for (let i = 1; i <= chars.length; i += 2) {
            for (let j = 0; j < chars[i].length; j++) {
              if (chars[i][j].indexOf("getbo") > -1) boChars.push(chars[i - 1]);
            }
          }
        } else if (task.indexOf(" ") > -1) {
          wp = Number(task.slice(0, task.indexOf(" ")));
          for (let i = 0; i < chars.length; i += 2) {
            if (task.indexOf(chars[i]) > -1) boChars.push(chars[i]);
          }
        }
        if (isNaN(wp)) wp = boWP;
      }
      if (!wp || boChars.length === 0) {
        D2Bot.printToConsole("givebo string error", 9);
        return false;
      }
      Town.goToTown();
      Pather.useWaypoint(wp, true);
      this.delays("givebo", boDelay, boChars);
    } else if (task.indexOf("getbo") === 0) {
      let boBarb;
      if (task === "getbo") {
        wp = boWP;
        for (let i = 1; i <= chars.length; i += 2) {
          for (let j = 0; j < chars[i].length; j++) {
            if (chars[i][j].indexOf("givebo") > -1) boBarb = chars[i - 1];
          }
        }
      } else if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        if (task.indexOf(" ") === -1) {
          wp = Number(task);
          if (isNaN(wp)) wp = boWP;
          for (let i = 1; i <= chars.length; i += 2) {
            for (let j = 0; j < chars[i].length; j++) {
              if (chars[i][j].indexOf("givebo") > -1) boBarb = chars[i - 1];
            }
          }
        }
        if (task.indexOf(" ") > -1) {
          wp = Number(task.slice(0, task.indexOf(" ")));
          boBarb = task.slice(task.indexOf(" ") + 1);
          if (isNaN(wp)) wp = boWP;
          for (let i = 1; i <= chars.length; i += 2) {
            if (task.indexOf(chars[i]) > -1) boBarb = chars[i - 1];
          }
        }
      }
      if (!wp || !boBarb) {
        D2Bot.printToConsole("getbo string error", 9);
        return false;
      }
      Town.goToTown();
      Pather.useWaypoint(wp, true);
      Pather.moveTo(me.x - 5, me.y - 5, 3);
      this.delays("getbo", boDelay, boBarb);
    } else if (task.indexOf("chant") === 0 || task.indexOf("givechant") === 0) {
      let chantChars = [];
      if (task === "chant" || task === "givechant") {
        wp = boWP;
        for (let i = 1; i <= chars.length; i += 2) {
          for (let j = 0; j < chars[i].length; j++) {
            if (chars[i][j].indexOf("getchant") > -1) chantChars.push(chars[i - 1]);
          }
        }
      } else if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        if (task.indexOf(" ") === -1) {
          wp = Number(task);
          if (isNaN(wp)) wp = boWP;
          for (let i = 1; i <= chars.length; i += 2) {
            for (let j = 0; j < chars[i].length; j++) {
              if (chars[i][j].indexOf("getchant") > -1) chantChars.push(chars[i - 1]);
            }
          }
        } else if (task.indexOf(" ") > -1) {
          wp = Number(task.slice(0, task.indexOf(" ")));
          for (let i = 0; i < chars.length; i += 2) {
            if (task.indexOf(chars[i]) > -1) chantChars.push(chars[i]);
          }
        }
        if (isNaN(wp)) wp = boWP;
      }
      if (!wp || chantChars.length === 0) {
        D2Bot.printToConsole("givechant string error", 9);
        return false;
      }
      if (me.area !== wp) Pather.useWaypoint(wp, true);
      this.delays("givechant", chantDelay, chantChars);
    } else if (task.indexOf("taxi") === 0) {
      if (task === "taxi") taxiChar = me.name;
      if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        if (task === "on") {
          taxiChar = me.name;
          say("taxi");
        }
        if (task === "off") {
          taxiChar = false;
          say("ixat");
        }
      }
    } else if (task.indexOf("ride") === 0) {
      if (task === "ride") {
        for (let i = 1; i <= chars.length; i += 2) {
          for (let j = 0; j < chars[i].length; j++) {
            if (chars[i][j].indexOf("taxi") > -1) taxiChar = chars[i - 1];
          }
        }
      } else if (task.indexOf(" ") > -1) taxiChar = task.slice(task.indexOf(" ") + 1);
      if (!taxiChar) {
        D2Bot.printToConsole("ride string error", 9);
        return false;
      }
      this.delays("ride", taxiDelay, taxiChar);
      this.rideTaxi();
    } else if (task.indexOf("chests") === 0) {
      if (task === "chests") {
        chests = true;
      }
      if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        if (task === "on") chests = true;
        if (task === "off") chests = false;
      }
    } else if (task === "chaos") {
      if (me.name === taxiChar || (!taxiChar && me.classid === 1 && me.area !== 108)) {
        if (me.area !== 107 && me.area !== 108) {
          Town.goToTown();
          Pather.useWaypoint(107, true);
        }
        let teleTo;
        if (tele === "gate") {
          teleTo = [7795, 5555];
        } else if (tele === "star") {
          teleTo = [7792, 5291];
        }
        Pather.moveTo(teleTo[0], teleTo[1], 3);
        Pather.makePortal();
        if (teleMsg.length > 0) say(teleMsg[rand(0, teleMsg.length - 1)]);
        if (me.classid === 1 && Skill.setSkill(52, 0) && me.getSkill(52, 0) >= 10) this.delays("givechant", 5);
        if (openSeals.length > 0) {
          for (let k = 0; k < openSeals.length; k++) {
            this.openSeal(391 + openSeals[k]);
          }
          Pather.moveTo(teleTo[0], teleTo[1], 3);
          if (sealMsg.length > 0) say(sealMsg[rand(0, sealMsg.length - 1)]);
          if (me.classid === 1 && Skill.setSkill(52, 0) && me.getSkill(52, 0) >= 10) this.delays("givechant", 5);
        }
        if (clearChars.indexOf(me.name) > -1) {
          Pather.makePortal();
          this.clearChaos();
        } else {
          Town.goToTown();
          //Town.doChores();
          //Town.move("portalspot");
        }
      } else {
        this.delays("chaos", chaosDelay, null);
        if (me.area === 108 && clearChars.indexOf(me.name) > -1) {
          this.clearChaos();
        }
      }
    } else if (task === "getleg") {
      this.getLeg();
    } else if (task === "makecows") {
      this.openPortal();
    } else if (task === "Shopbot") {
      this.Shopbot();
    } else if (task === "Tunnels") {
      Pather.journeyTo(65);
      Attack.clearLevel(Config.ClearType);
    } else if (task === "Urdars") {
      Town.goToTown();
      Pather.useWaypoint(106);
      Precast.doPrecast(true);
      Pather.journeyTo(107);
      this.Urdars();
    } else if (task === "findshrine") {
      let shrineAreas = [2, 3, 4, 10, 5, 6, 7/*,26,27,28,29,30,31,32,33,34,35,41,42,43,44,76,77,78,79,80,81,82,104,105,106,107,108*/];
      Town.goToTown();
      Pather.useWaypoint(3, true);
      for (let i = 0; i < shrineAreas.length; i++) {
        Pather.journeyTo(shrineAreas[i]);
        if (Misc.getShrinesInArea(shrineAreas[i], 15, false)) {
          if (chars[chars.indexOf(me.name) + 1].indexOf("useshrine") === chars[chars.indexOf(me.name) + 1].indexOf("findshrine") + 1) {
            let shrine = getUnit(2, "shrine");
            if (shrine) {
              do {
                if (shrine.objtype === 15 && shrine.mode === 0) {
                  Pather.moveTo(shrine.x - 3, shrine.y - 3);
                  Misc.getShrine(shrine);
                  if (me.getState(137)) break;
                }
              } while (shrine.getNext());
            }
          }
          break;
        }
      }
      Town.goToTown();
      if (finderDelay && finderDelay > 0) this.delays("finder", finderDelay);
    } else if (task === "useshrine") {
      if (me.getState(137)) return true;
      let finder;
      for (let i = 1; i <= chars.length; i += 2) {
        if (chars[i].indexOf("findshrine") > -1) finder = chars[i - 1];
      }
      if (!finder) finder = null;
      if (finder === me.name || (finder == null && me.classid === 1)) this.runTask("findshrine");
      this.delays("shrine", shrineDelay, finder);
    } else if (task === "clearcows") {
      if (me.area !== 39) {
        Town.goToTown(1);
        Town.move("stash");
        for (let i = 0; i < 30; i++) {
          if (Pather.usePortal(39)) break;
          delay(100);
        }
      }
      if (me.area === 39) Attack.clearLevel(Config.ClearType);
    } else if (task === "chores") {
      Town.goToTown();
      Town.doChores();
    } else if (task.indexOf("areadelay") === 0) {
      if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        if (task.indexOf("in") === 0) {
          if (task.indexOf(" ") > -1) task = task.slice(task.indexOf(" ") + 1);
          if (!isNaN(Number(task))) this.delays("area", areaDelay, false, "in", task);
          else if (task.indexOf(" ") > -1) {
            let aid = Number(task.slice(0, task.indexOf(" ")));
            task = task.slice(task.indexOf(" ") + 1);
            if (!isNaN(aid)) this.delays("area", areaDelay, task, "in", aid);
            else D2Bot.printToConsole("areadelay string error1", 9);
          } else D2Bot.printToConsole("areadelay string error2", 9);
        } else if (task.indexOf("out") === 0) {
          if (task.indexOf(" ") > -1) task = task.slice(task.indexOf(" ") + 1);
          if (!isNaN(Number(task))) this.delays("area", areaDelay, false, "out", task);
          else if (task.indexOf(" ") > -1) {
            let aid = Number(task.slice(0, task.indexOf(" ")));
            task = task.slice(task.indexOf(" ") + 1);
            if (!isNaN(aid)) this.delays("area", areaDelay, task, "out", aid);
            else D2Bot.printToConsole("areadelay string error3", 9);
          } else D2Bot.printToConsole("areadelay string error4", 9);
        } else D2Bot.printToConsole("areadelay string error5", 9);
      } else D2Bot.printToConsole("areadelay string error6", 9);
    } else if (task.indexOf("goto") === 0) {
      if (task.indexOf(" ") > -1) {
        task = task.slice(task.indexOf(" ") + 1);
        let aid = Number(task);
        if (!isNaN(aid)) Pather.journeyTo(aid);
        else D2Bot.printToConsole("goto string value error", 9);
      }
      return true;
    }
    return false;
  };

  this.clearChaos = function() {
    this.clearAct = function(act, x, y) {
      if (act === "move") {
        let xPath = (clearMode === 0) ? true : false;
        Pather.moveTo(x, y, 3, xPath);
        if (tele === "gate" && x === 7794 && y === 5315) Pather.makePortal();
        if (tele === "star" && clearDirection === 0 && x === 7765 && y === 5294) Pather.makePortal();
        if (tele === "star" && clearDirection === 1 && x === 7825 && y === 5294) Pather.makePortal();
        Attack.clear(25, clearMode);
      } else if (act === "seal") {
        if (openSeal(x) === true) {
          if (x === 392 || x === 396) {
            for (let i = 0; i < 30; i++) {
              let boss = (x === 392) ? getUnit(1, "Infector of Souls") : getUnit(1, "Grand Vizier of Chaos");
              if (boss) break;
              delay(100);
            }
          }
        }
        if (((x === 393 && clearDirection === 0) || (x === 395 && clearDirection === 1)) && cmd !== "Diablo") {
          cmd = "Diablo";
          say("Diablo");
        }
      } else if (act === "Infector of Souls" || act === "Lord de Seis" || act === "Grand Vizier of Chaos") {
        let boss = getUnit(1, act);
        if (!boss) {
          Pather.moveTo(x, y, 3, xPath);
          Attack.clear(25, clearMode);
        }
        boss = getUnit(1, act);
        if (boss) {
          if (boss.hp <= 0 || boss.mode === 0 || boss.mode === 12) {
            //
          } else {
            Attack.clear(25, clearMode, act);
          }
        }
      } else if (act === "Diablo") {
        cmd = "Diablo";
      } else {
        throw new Error("Invalid clearAct");
      }
      if (chars[chars.indexOf(me.name) + 1].indexOf("givebo") > -1) this.bo();
      Precast.doPrecast(false);
    };
    Precast.doPrecast(false);
    Attack.clear(10);
    initLayout();
    let Gate = ["move", 7794, 5545, "move", 7794, 5525, "move", 7794, 5505, "move", 7794, 5480, "move", 7794, 5440, "move", 7794, 5405, "move", 7794, 5365, "move", 7794, 5335, "move", 7794, 5315];
    let preFect = ["move", 7825, 5294, "move", 7843, 5294, "move", 7861, 5294];
    let Fect = (infLayout === 1)
      ? ["move", 7890, 5295, "move", 7915, 5290, "seal", 392, 1, "Infector of Souls", 7890, 5295, "Infector of Souls", 7915, 5290, "seal", 393, 0]
      : ["move", 7900, 5275, "move", 7930, 5280, "move", 7930, 5310, "seal", 392, 1, "move", 7930, 5310, "Infector of Souls", 7930, 5280, "Infector of Souls", 7900, 5275, "seal", 393, 0];
    let preSeis = ["move", 7794, 5265, "move", 7794, 5245, "move", 7794, 5225];
    let Seis2 = (openSeals.indexOf(3) > -1)
      ? ["move", 7775, 5210, "move", 7775, 5195, "Lord de Seis", 7775, 5195, "Lord de Seis", 7775, 5210]
      : ["move", 7775, 5210, "move", 7775, 5195, "move", 7810, 5190, "move", 7810, 5155, "move", 7785, 5155, "seal", 394, 1, "Lord de Seis", 7775, 5195, "Lord de Seis", 7775, 5210];
    let Seis5 = (openSeals.indexOf(3) > -1) ? ["move", 7810, 5195, "move", 7780, 5190, "move", 7775, 5155, "Lord de Seis", 7775, 5155, "Lord de Seis", 7780, 5190, "move", 7780, 5190, "move", 7810, 5195] : ["move", 7810, 5195, "move", 7780, 5190, "move", 7775, 5155, "move", 7805, 5155, "seal", 394, 1, "Lord de Seis", 7775, 5155, "Lord de Seis", 7780, 5190, "move", 7780, 5190, "move", 7810, 5195];
    let Seis = (seisLayout === 1) ? Seis2 : Seis5;
    let preVizi = ["move", 7765, 5294, "move", 7745, 5294, "move", 7715, 5294];
    let Vizi = (vizLayout === 1)
      ? ["move", 7680, 5290, "move", 7665, 5275, "seal", 396, 2, "Grand Vizier of Chaos", 7665, 5275, "Grand Vizier of Chaos", 7680, 5290, "seal", 395, 0]
      : ["move", 7700, 5315, "move", 7670, 5315, "seal", 396, 2, "Grand Vizier of Chaos", 7670, 5315, "Grand Vizier of Chaos", 7700, 5315, "seal", 395, 0];
    let Diablo = (clearDirection === 1)
      ? ["move", 7765, 5295, "move", 7796, 5296, "Diablo", 666, 666]
      : ["move", 7825, 5294, "move", 7795, 5295, "Diablo", 666, 666];
    let clearActQueue = [];
    if (tele === "gate" && me.x >= 5520) clearActQueue = clearActQueue.concat(Gate);
    if (clearDirection === 0) clearActQueue = clearActQueue.concat(preVizi, Vizi, preSeis, Seis, preFect, Fect, Diablo);
    if (clearDirection === 1) clearActQueue = clearActQueue.concat(preFect, Fect, preSeis, Seis, preVizi, Vizi, Diablo);
    for (let j = 1; clearActQueue.length > j; j += 3) {
      if (cmd === "Diablo") {
        if (last !== "Diablo") this.diablo();
        break;
      }
      this.clearAct(clearActQueue[j - 1], clearActQueue[j], clearActQueue[j + 1]);
      if (cmd === "Diablo") {
        if (last !== "Diablo") this.diablo();
        break;
      }
      delay(100);
    }
    return true;
  };

  this.diablo = function () {
    cmd !== "Diablo" && (cmd = "Diablo");
    if (last === "Diablo") return true;
    
    if (taxiChar === me.name) {
      if (me.area === 108) {
        Pather.moveTo(diax, diay, 3);
        if ((killDiablo.includes(me.name)
          || leechDiablo.includes(me.name)
          || weakenDiablo.includes(me.name))
          && me.name !== shrineDiablo) {
          Pather.makePortal();
        } else {
          Pather.makePortal(true);
        }
      }
      if (Misc.inMyParty(shrineDiablo) && me.name !== shrineDiablo) {
        this.delays("area", 30, shrineDiablo, "in", 108);
      } else if (killDiablo.length > 0) {
        this.delays("area", 30, killDiablo, "in", 108);
      }
    }

    if (shrineDiablo === me.name) {
      let finder;
      for (let i = 1; i <= chars.length; i += 2) {
        if (chars[i].includes("findshrine")) {
          finder = chars[i - 1];
        }
      }

      !finder && (finder = null);
      if (finder === me.name || (finder === null && me.sorceress)) {
        this.runTask("findshrine");
      }
      console.log(finder);
      this.delays("shrine", shrineDelay, finder);
    }
    if (killDiablo.indexOf(me.name) > -1) {
      if (me.area !== 108) {
        Town.goToTown(4);
        Town.move("portalspot");
        if (!taxiChar || !Pather.usePortal(108, taxiChar)) {
          let portal = getUnit(2, "portal");
          if (portal) {
            do {
              if (portal.objtype === 108
                && portal.getParent() !== me.name
                && Misc.inMyParty(portal.getParent())
                && chars.indexOf(portal.getParent()) > -1) {
                if (Pather.usePortal(null, null, portal)) break;
              }
            } while (portal.getNext());
          }
        }
      }
      if (me.area !== 108) Pather.usePortal(108, null);
      if (me.area === 108) {
        Pather.moveTo(diax, diay, 3);
        Pather.makePortal();
        if (Misc.inMyParty(shrineDiablo) && me.name !== shrineDiablo) {
          this.delays("area", 60, shrineDiablo, "in", 108); //60 was 30
        }
        this.killBoss("Diablo");
      }
    } else if (leechDiablo.indexOf(me.name) > -1) {
      if (me.area !== 108) {
        Town.goToTown(4);
        Town.move("portalspot");
        if (taxiChar) {
          if (!Pather.usePortal(108, taxiChar)) Pather.usePortal(108, null);
        } else Pather.usePortal(108, null);
      }
      if (me.area === 108) {
        (leechDiablo.indexOf(me.name) % 2 === 0)
          ? Pather.moveTo(7792, 5291, 3)
          : Pather.moveTo(7792, 5291, 3);
        for (let i = 0; i < 200; i++) {
          if (!getUnit(1, 243)) {
            delay(100);
          }
        }
        while (getUnit(1, "Diablo") && getUnit(1, "Diablo").hp > 0) delay(100);
        Pickit.pickItems();
      }
    } else if (weakenDiablo.indexOf(me.name) > -1) {
      if (me.area !== 108) {
        Town.goToTown(4);
        Town.move("portalspot");
        if (taxiChar) {
          if (!Pather.usePortal(108, taxiChar)) Pather.usePortal(108, null);
          Pather.makePortal();
        } else Pather.usePortal(108, null);
      }
      if (me.area === 108) {
        if (!diax) this.initLayout();
        Pather.moveTo(diax, diay, 3);
        let waitfor = killDiablo.concat(leechDiablo);
        console.log(waitfor);
        loop:
        for (let i = 0; i < 300; i++) {
          for (let j = 0; j < waitfor.length; j++) {
            delay(100);
            if (Misc.inMyParty(waitfor[j]) && !getUnit(0, waitfor[j])) break;
            else if ((!Misc.inMyParty(waitfor[j]) || getUnit(0, waitfor[j])) && j === waitfor.length - 1) break loop;
          }
        }
        Config.PublicMode = 0;
        delay(2 * me.ping + 100);
        let player = getParty();
        clickParty(player, 3);
        for (let i = 0; i < 200; i++) {
          if (!getUnit(1, 243)) {
            delay(100);
          }
        }
        while (getUnit(1, 243) && getUnit(1, 243).hp > 0) {
          switch (me.classid) {
          case 0: //Amazon
            break;
          case 1: //Sorceress
            if (Skill.cast(42, 0)) Skill.cast(42, 0); //static
            break;
          case 2: //Necromancer
            if (Skill.cast(Config.Curse[0], 0)) Skill.cast(Config.Curse[0], 0); //spam boss curse
            //else if other curses
            break;
          case 3: //Paladin
            if (Skill.setSkill(123, 0)) Skill.setSkill(123, 0); //conviction aura
            break;
          case 4: //Barbarian
            break;
          }
          delay(100);
        }
        Pickit.pickItems();
      }
    } else {
      if (me.area === 108) {
        if (clearDirection === 0) Pather.moveTo(7825, 5294, 3);
        if (clearDirection === 1) Pather.moveTo(7765, 5294, 3);
      }
      Town.goToTown();
    }
    taxiChar = false;
    last = "Diablo";
    return true;
  };

  this.getLeg = function () {
    if (Pather.getPortal(sdk.areas.MooMooFarm)) return false;
    /** @type {ItemUnit} */
    let leg;
    let gid;
    let wrongLeg; // this isn't doing anything

    while (!leg) {
      if (me.getItem(sdk.quest.item.WirtsLeg)) {
        leg = me.getItem(sdk.quest.item.WirtsLeg);
        return me.getItem(-1, -1, leg.gid);
      }
      
      leg = Game.getItem(sdk.quest.item.WirtsLeg);
      if (leg) {
        do {
          if (leg.name.indexOf("ÿc1") > -1) {
            wrongLeg = true;
            
            return false;
          } else {
            gid = leg.gid;
            Pickit.pickItem(leg);
            
            return me.getItem(-1, -1, gid);
          }
        } while (leg.getNext());
      }

      if (chars[chars.indexOf(me.name) + 1].indexOf("getleg") > -1) {
        Pather.useWaypoint(sdk.areas.StonyField);
        Precast.doPrecast(true);
        Pather.moveToPreset(me.area, sdk.unittype.Monster, sdk.monsters.preset.Rakanishu, 8, 8);
        
        /** @type {ObjectUnit} */
        let portal;
        for (let i = 0; i < 6; i += 1) {
          portal = Pather.getPortal(sdk.areas.Tristram);
          if (portal) {
            Pather.usePortal(null, null, portal);
            break;
          }
          delay(500);
        }

        if (!portal) {
          Town.goToTown();
          return false;
        }

        Pather.moveTo(25048, 5177);
        let wirt = Game.getObject(sdk.quest.chest.Wirt);
        for (let i = 0; i < 8; i += 1) {
          !!wirt && wirt.interact();
          delay(500);
          leg = Game.getItem(sdk.quest.item.WirtsLeg);
          
          if (leg) {
            gid = leg.gid;
            Pickit.pickItem(leg);
            Town.goToTown(1);

            if (chars[chars.indexOf(me.name) + 1].indexOf("makecows") === -1) {
              Town.move("stash");
              leg.drop();
              return true;
            } else {
              return me.getItem(-1, -1, gid);
            }
          }
        }
        Town.goToTown();
      } else {
        Town.move("stash");
      }
      delay(100);
    }
    return false;
  };

  this.getTome = function () {
    let myTome = me.findItem("tbk", 0, 3);
    let tome = me.getItem("tbk");
    if (tome) {
      do {
        if (!myTome || tome.gid !== myTome.gid) {
          return copyUnit(tome);
        }
      } while (tome.getNext());
    }

    Town.move(NPC.Akara);
    let akara = Town.initNPC("Shop");
    if (!akara) return false;

    tome = akara.getItem("tbk");
    if (tome.buy()) {
      tome = me.getItem("tbk");
      if (tome) {
        do {
          if (!myTome || tome.gid !== myTome.gid) {
            return copyUnit(tome);
          }
        } while (tome.getNext());
      }
    }
    return false;
  };

  this.openPortal = function () {
    Town.goToTown(1);
    let leg = this.getLeg();
    if (!leg) return false;

    let tome = this.getTome();
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
      if (Pather.getPortal(39)) {
        return true;
      }
      delay(200);
    }
    me.cancel();
    return false;
  };

  this.rideTaxi = function() {
    let tTimer = getTickCount();
    while (true) {
      if (!taxiChar || !Misc.inMyParty(taxiChar)) {
        break;
      }

      if (this.getAct(taxiChar) > 0) {
        Town.goToTown(this.getAct(taxiChar));
        Town.move("portalspot");
      }
      
      if (cmd && cmd !== last) {
        let currCmd = cmd;
        if (currCmd === "Diablo") {
          this.diablo();
        } else if (teleMsg.includes(currCmd)) {
          if (clearChars.includes(me.name)) {
            this.delays("chaos", chaosDelay, taxiChar);
            this.clearChaos();
          }
          taxiChar = false;
          
          break;
        } else if (Pather.getPortal(null, taxiChar)) {
          if (Pather.usePortal(null, taxiChar)) {
            if (currCmd === cmd) {
              this.killBoss(currCmd);
            }
            Town.goToTown();
          }
        }
        last = currCmd;
        tTimer = getTickCount();
      }

      if (getTickCount > tTimer + taxiDelay * 1e3) {
        taxiChar = false;
        break;
      }
      Precast.doPrecast(false);
      delay(100);
    }
  };

  this.Shopbot = function () {
    Loader.runScript("ShopBot");
  };

  /**
   * @param {string | number} name 
   * @returns {boolean}
   */
  this.Urdars = function (name) {
    let room = getRoom();
    if (!room) return false;
      
    const urdars = [189, 309, 361, 311, 675, 300, 692];
    const rooms = [];
    /** @param {Monster} monster */
    const check = function (monster) {
      return (
        urdars.includes(monster.classid)
        && monster.attackable
        && monster.spectype !== sdk.monsters.spectype.All
        && monster.spectype !== sdk.monsters.spectype.Minion
        && monster.distance <= 30
      );
    };
      
    do {
      rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
    } while (room.getNext());
      
    while (rooms.length > 0) {
      rooms.sort(Sort.points);
      room = rooms.shift();
      let result = Pather.getNearestWalkable(room[0], room[1], 15, 2);

      if (result) {
        Pather.moveTo(result[0], result[1], 3);
          
        let monList = [];
        let monster = Game.getMonster(name);
        
        if (monster) {
          do {
            if (check(monster)) {
              monList.push(copyUnit(monster));
              
              if (me.name === taxiChar) {
                Pather.moveTo(monster.x + rand(-5, 5), monster.y + rand(-5, 5), 0);
                Pather.makePortal();
                say(monster.name);
              }

              if (monster && monster.hp > 0) {
                if (me.name === taxiChar) {
                  for (let i = 0; i < 30; i++) {
                    if (monster) Attack.clear(getDistance(me, monster) + 5, 0xF, monster);
                    if (!monster || monster.hp === 0) break;
                    delay(100);
                  }
                } else if (monster) {
                  if (monster.spectype === sdk.monsters.spectype.All) {
                    Attack.clear(getDistance(me, monster) + 5, 0, monster);
                  } else {
                    Attack.clear(getDistance(me, monster) + 5, 0xF, monster);
                  }
                }
              }
            }
          } while (monster.getNext());
        }
            
        if (!Attack.clearList(monList)) {
          return false;
        }
      }
    }
      
    return true;
  };
                  
  this.precast = function () {
    switch (me.classid) {
    case sdk.player.class.Amazon:
    case sdk.player.class.Barbarian:
      return false;
    case sdk.player.class.Sorceress: //Sorceress
      return (
        Skill.cast(sdk.skills.Blizzard)
        || Skill.cast(sdk.skills.Meteor)
        || Skill.cast(sdk.skills.StaticField)
        || Skill.cast(sdk.skills.FrostNova)
        || Skill.cast(sdk.skills.Hydra)
        || Skill.cast(sdk.skills.Nova)
      );
    case sdk.player.class.Necromancer:
      return Skill.cast(Config.Curse[1], 0);
    case sdk.player.class.Paladin:
      return (
        Skill.setSkill(sdk.skills.Concentration, 0)
        && Skill.cast(sdk.skills.BlessedHammer)
      );
    }
    return false;
  };

  /**
   * @param {string} nick 
   * @param {string} msg 
   */
  function ChatEvent(nick, msg) {
    if (!taxiChar && msg === "taxi" && chars.includes(nick)) {
      taxiChar = nick;
    } else if (nick === taxiChar && msg === "ixat" && cmd !== "Diablo") {
      taxiChar = false;
    } else if (nick === taxiChar && nick !== me.name) {
      cmd = msg;
    } else if (msg === "Diablo" && cmd !== msg && chars.includes(nick) && clearChars.indexOf(me.name)) {
      cmd = "Diablo";
    } else if (msg === "Diablo" && cmd !== msg && chars.includes(nick)) {
      if (leechDiablo.includes(me.name)) {
        taxiChar = nick;
      }
      this.diablo();
    }
  }

  // START
  let listen = false;
  for (let i = 0; i < chars[chars.indexOf(me.name) + 1].length; i++) {
    if (chars[chars.indexOf(me.name) + 1][i].indexOf("ride") > -1) {
      listen = true;
    }
  }
  if (!listen && (
    killDiablo.includes(me.name)
    || leechDiablo.includes(me.name)
    || weakenDiablo.includes(me.name)
    || clearChars.includes(me.name)
    )) {
    listen = true;
  }
  if (listen) {
    addEventListener("chatmsg", ChatEvent);
  }
  Pickit.pickItems();
  Town.heal();
  this.runList(chars[chars.indexOf(me.name) + 1]);
  if (killDiablo.indexOf(me.name) === -1) {
    for (let i = 0; i < killDiablo.length; i++) {
      while (Misc.inMyParty(killDiablo[i])) {
        if (me.sorceress && Skill.setSkill(52, 0) && me.getSkill(52, 0) >= 10) {
          this.delays("givechant", 1);
        } else {
          delay(1000);
        }
      }
    }
  }

  return true;
}
