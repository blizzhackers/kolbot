/* eslint-disable no-labels */
/**
*  @filename    AutoStat.js
*  @author      IMBA
*  @desc        Automatically allocate stat points
*
*/

const AutoStat = new function () {
  this.statBuildOrder = [];
  this.save = 0;
  this.block = 0;
  this.bulkStat = true;

  /*	statBuildOrder - array of stat points to spend in order
    save - remaining stat points that will not be spent and saved.
    block - an integer value set to desired block chance. This is ignored in classic.
    bulkStat - set true to spend multiple stat points at once (up to 100), or false to spend 1 point at a time.

    statBuildOrder Settings
    The script will stat in the order of precedence. You may want to stat strength or dexterity first.

    Set stats to desired integer value, and it will stat *hard points up to the desired value.
    You can also set to string value "all", and it will spend all the remaining points.
    Dexterity can be set to "block" and it will stat dexterity up the the desired block value specified in arguemnt (ignored in classic).

    statBuildOrder = [
      ["strength", 25], ["energy", 75], ["vitality", 75],
      ["strength", 55], ["vitality", "all"]
    ];
  */

  this.getBlock = function () {
    if (!me.usingShield()) return this.block;

    // cast holy shield if available
    if (Skill.canUse(sdk.skills.HolyShield) && !me.getState(sdk.states.HolyShield)) {
      if (Precast.cast(sdk.skills.HolyShield)) {
        delay(1000);
      } else {
        return this.block;
      }
    }

    if (me.classic) {
      return Math.floor(me.getStat(sdk.stats.ToBlock) + getBaseStat(15, me.classid, 23));
    }

    return Math.min(
      75,
      Math.floor(
        (me.getStat(sdk.stats.ToBlock) + getBaseStat(15, me.classid, 23))
        * (me.getStat(sdk.stats.Dexterity) - 15) / (me.charlvl * 2)
      )
    );
  };

  // this check may not be necessary with this.validItem(), but consider it double check
  // verify that the set bonuses are there
  this.verifySetStats = function (unit, type, stats) {
    let string = type === sdk.stats.Strength ? sdk.locale.text.ToStrength : sdk.locale.text.ToDexterity;

    if (unit) {
      let temp = unit.description.split("\n");

      for (let i = 0; i < temp.length; i += 1) {
        if (temp[i].match(getLocaleString(string), "i")) {
          if (parseInt(temp[i].replace(/(y|ÿ)c[0-9!"+<;.*]/, ""), 10) === stats) {
            return true;
          }
        }
      }
    }

    return false;
  };

  this.validItem = function (item) {
    // ignore item bonuses from secondary weapon slot
    if (me.expansion && item.isOnSwap) return false;
    // check if character meets str, dex, and level requirement since stat bonuses only apply when they are active
    return me.getStat(sdk.stats.Strength) >= item.strreq
      && me.getStat(sdk.stats.Dexterity) >= item.dexreq
      && me.charlvl >= item.lvlreq;
  };

  // get stats from set bonuses
  this.setBonus = function (type) {
    // set bonuses do not have energy or vitality (we can ignore this)
    if (type === sdk.stats.Energy || type === sdk.stats.Vitality) return 0;

    // these are the only sets with possible stat bonuses
    let sets = {
      "angelic": [], "artic": [], "civerb": [], "iratha": [],
      "isenhart": [], "vidala": [], "cowking": [], "disciple": [],
      "griswold": [], "mavina": [], "naj": [], "orphan": []
    };

    let i, j, setStat = 0;
    let items = me.getItems();

    if (items) {
      for (i = 0; i < items.length; i += 1) {
        if (items[i].isEquipped && items[i].set && this.validItem(items[i])) {
          idSwitch:
          switch (items[i].classid) {
          case sdk.items.Crown:
            if (items[i].getStat(sdk.stats.LightResist) === 30) {
              sets.iratha.push(items[i]);
            }

            break;
          case sdk.items.LightGauntlets:
            if (items[i].getStat(sdk.stats.MaxHp) === 20) {
              sets.artic.push(items[i]);
            } else if (items[i].getStat(sdk.stats.ColdResist) === 30) {
              sets.iratha.push(items[i]);
            }

            break;
          case sdk.items.HeavyBoots:
            if (items[i].getStat(sdk.stats.Dexterity) === 20) {
              sets.cowking.push(items[i]);
            }

            break;
          case sdk.items.HeavyBelt:
            if (items[i].getStat(sdk.stats.MinDamage) === 5) {
              sets.iratha.push(items[i]);
            }

            break;
          case sdk.items.Amulet:
            if (items[i].getStat(sdk.stats.DamagetoMana) === 20) {
              sets.angelic.push(items[i]);
            } else if (items[i].getStat(sdk.stats.HpRegen) === 4) {
              sets.civerb.push(items[i]);
            } else if (items[i].getStat(sdk.stats.PoisonLengthResist) === 75) {
              sets.iratha.push(items[i]);
            } else if (items[i].getStat(sdk.stats.ColdResist) === 20) {
              sets.vidala.push(items[i]);
            } else if (items[i].getStat(sdk.stats.ColdResist) === 18) {
              sets.disciple.push(items[i]);
            }

            break;
          case sdk.items.Ring:
            if (items[i].getStat(sdk.stats.HpRegen) === 6) {
              // do not count ring twice
              for (j = 0; j < sets.angelic.length; j += 1) {
                if (sets.angelic[j].classid === items[i].classid) {
                  break idSwitch;
                }
              }

              sets.angelic.push(items[i]);
            }

            break;
          case sdk.items.Sabre:
            // do not count twice in case of dual wield
            for (j = 0; j < sets.angelic.length; j += 1) {
              if (sets.angelic[j].classid === items[i].classid) {
                break idSwitch;
              }
            }

            sets.angelic.push(items[i]);

            break;
          case sdk.items.RingMail:
            sets.angelic.push(items[i]);

            break;
          case sdk.items.ShortWarBow:
          case sdk.items.QuiltedArmor:
          case sdk.items.LightBelt:
            sets.artic.push(items[i]);

            break;
          case sdk.items.GrandScepter:
            // do not count twice in case of dual wield
            for (j = 0; j < sets.civerb.length; j += 1) {
              if (sets.civerb[j].classid === items[i].classid) {
                break idSwitch;
              }
            }

            sets.civerb.push(items[i]);

            break;
          case sdk.items.LargeShield:
            sets.civerb.push(items[i]);

            break;
          case sdk.items.BroadSword:
            // do not count twice in case of dual wield
            for (j = 0; j < sets.isenhart.length; j += 1) {
              if (sets.isenhart[j].classid === items[i].classid) {
                break idSwitch;
              }
            }

            sets.isenhart.push(items[i]);

            break;
          case sdk.items.FullHelm:
          case sdk.items.BreastPlate:
          case sdk.items.GothicShield:
            sets.isenhart.push(items[i]);

            break;
          case sdk.items.LongBattleBow:
          case sdk.items.LeatherArmor:
          case sdk.items.LightPlatedBoots:
            sets.vidala.push(items[i]);

            break;
          case sdk.items.StuddedLeather:
          case sdk.items.WarHat:
            sets.cowking.push(items[i]);

            break;
          case sdk.items.DemonhideBoots:
          case sdk.items.DuskShroud:
          case sdk.items.BrambleMitts:
          case sdk.items.MithrilCoil:
            sets.disciple.push(items[i]);

            break;
          case sdk.items.Caduceus:
            // do not count twice in case of dual wield
            for (j = 0; j < sets.griswold.length; j += 1) {
              if (sets.griswold[j].classid === items[i].classid) {
                break idSwitch;
              }
            }

            sets.griswold.push(items[i]);

            break;
          case sdk.items.OrnatePlate:
          case sdk.items.Corona:
          case sdk.items.VortexShield:
            sets.griswold.push(items[i]);

            break;
          case sdk.items.GrandMatronBow:
          case sdk.items.BattleGauntlets:
          case sdk.items.SharkskinBelt:
          case sdk.items.Diadem:
          case sdk.items.KrakenShell:
            sets.mavina.push(items[i]);

            break;
          case sdk.items.ElderStaff:
          case sdk.items.Circlet:
          case sdk.items.HellforgePlate:
            sets.naj.push(items[i]);

            break;
          case sdk.items.WingedHelm:
          case sdk.items.RoundShield:
          case sdk.items.SharkskinGloves:
          case sdk.items.BattleBelt:
            sets.orphan.push(items[i]);

            break;
          }
        }
      }
    }

    for (i in sets) {
      if (sets.hasOwnProperty(i)) {
        MainSwitch:
        switch (i) {
        case "angelic":
          if (sets[i].length >= 2 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 10)) {
                break MainSwitch;
              }
            }

            setStat += 10;
          }

          break;
        case "artic":
          if (sets[i].length >= 2 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 5)) {
                break MainSwitch;
              }
            }

            setStat += 5;
          }

          break;
        case "civerb":
          if (sets[i].length === 3 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 15)) {
                break MainSwitch;
              }
            }

            setStat += 15;
          }

          break;
        case "iratha":
          if (sets[i].length === 4 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 15)) {
                break MainSwitch;
              }
            }

            setStat += 15;
          }

          break;
        case "isenhart":
          if (sets[i].length >= 2 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 10)) {
                break MainSwitch;
              }
            }

            setStat += 10;
          }

          if (sets[i].length >= 3 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 10)) {
                break MainSwitch;
              }
            }

            setStat += 10;
          }

          break;
        case "vidala":
          if (sets[i].length >= 3 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 15)) {
                break MainSwitch;
              }
            }

            setStat += 15;
          }

          if (sets[i].length === 4 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 10)) {
                break MainSwitch;
              }
            }

            setStat += 10;
          }

          break;
        case "cowking":
          if (sets[i].length === 3 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 20)) {
                break MainSwitch;
              }
            }

            setStat += 20;
          }

          break;
        case "disciple":
          if (sets[i].length >= 4 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 10)) {
                break MainSwitch;
              }
            }

            setStat += 10;
          }

          break;
        case "griswold":
          if (sets[i].length >= 2 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 20)) {
                break MainSwitch;
              }
            }

            setStat += 20;
          }

          if (sets[i].length >= 3 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 30)) {
                break MainSwitch;
              }
            }

            setStat += 30;
          }

          break;
        case "mavina":
          if (sets[i].length >= 2 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 20)) {
                break MainSwitch;
              }
            }

            setStat += 20;
          }

          if (sets[i].length >= 3 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 30)) {
                break MainSwitch;
              }
            }

            setStat += 30;
          }

          break;
        case "naj":
          if (sets[i].length === 3 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 15)) {
                break MainSwitch;
              }
            }

            setStat += 15;
          }

          if (sets[i].length === 3 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 20)) {
                break MainSwitch;
              }
            }

            setStat += 20;
          }

          break;
        case "orphan":
          if (sets[i].length === 4 && type === sdk.stats.Dexterity) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 10)) {
                break MainSwitch;
              }
            }

            setStat += 10;
          }

          if (sets[i].length === 4 && type === sdk.stats.Strength) {
            for (j = 0; j < sets[i].length; j += 1) {
              if (!this.verifySetStats(sets[i][j], type, 20)) {
                break MainSwitch;
              }
            }

            setStat += 20;
          }

          break;
        }
      }
    }

    return setStat;
  };

  // return stat values excluding stat bonuses from sets and/or items
  this.getHardStats = function (type) {
    let i, statID;
    let addedStat = 0;
    let items = me.getItems();

    switch (type) {
    case sdk.stats.Strength:
      type = sdk.stats.Strength;
      statID = sdk.stats.PerLevelStrength;

      break;
    case sdk.stats.Energy:
      type = sdk.stats.Energy;
      statID = sdk.stats.PerLevelEnergy;

      break;
    case sdk.stats.Dexterity:
      type = sdk.stats.Dexterity;
      statID = sdk.stats.PerLevelDexterity;

      break;
    case sdk.stats.Vitality:
      type = sdk.stats.Vitality;
      statID = sdk.stats.PerLevelVitality;

      break;
    }

    if (items) {
      for (i = 0; i < items.length; i += 1) {
        // items equipped or charms in inventory
        if ((items[i].isEquipped || items[i].isEquippedCharm) && this.validItem(items[i])) {
          // stats
          items[i].getStat(type) && (addedStat += items[i].getStat(type));

          // stats per level
          if (items[i].getStat(statID)) {
            addedStat += Math.floor(items[i].getStat(statID) / 8 * me.charlvl);
          }
        }
      }
    }

    return (me.getStat(type) - addedStat - this.setBonus(type));
  };

  this.requiredDex = function () {
    let set = false;
    let inactiveDex = 0;
    let items = me.getItems();

    if (items) {
      for (let i = 0; i < items.length; i += 1) {
        // items equipped but inactive (these are possible dex sources unseen by me.getStat(sdk.stats.Dexterity))
        if (items[i].isEquipped && !items[i].isOnSwap && !this.validItem(items[i])) {
          if (items[i].quality === sdk.items.quality.Set) {
            set = true;

            break;
          }

          // stats
          items[i].getStat(sdk.stats.Dexterity) && (inactiveDex += items[i].getStat(sdk.stats.Dexterity));

          // stats per level
          if (items[i].getStat(sdk.stats.PerLevelDexterity)) {
            inactiveDex += Math.floor(items[i].getStat(sdk.stats.PerLevelDexterity) / 8 * me.charlvl);
          }
        }
      }
    }

    // just stat 1 at a time if there's set item (there could be dex bonus for currently inactive set)
    if (set) {
      return 1;
    }

    // returns amount of dexterity required to get the desired block chance
    return Math.ceil(
      (2 * me.charlvl * this.block) / (me.getStat(sdk.stats.ToBlock) + getBaseStat(15, me.classid, 23)) + 15
    ) - me.getStat(sdk.stats.Dexterity) - inactiveDex;
  };

  this.useStats = function (type, goal = false) {
    let currStat = me.getStat(sdk.stats.StatPts);
    let tick = getTickCount();
    let statIDToString = [
      getLocaleString(sdk.locale.text.Strength), getLocaleString(sdk.locale.text.Energy),
      getLocaleString(sdk.locale.text.Dexterity), getLocaleString(sdk.locale.text.Vitality)
    ];

    // use 0x3a packet to spend multiple stat points at once (up to 100)
    if (this.bulkStat) {
      if (goal) {
        new PacketBuilder()
          .byte(sdk.packets.send.AddStat)
          .byte(type)
          .byte(Math.min(me.getStat(sdk.stats.StatPts) - this.save - 1, goal - 1, 99))
          .send();
      } else {
        new PacketBuilder()
          .byte(sdk.packets.send.AddStat)
          .byte(type)
          .byte(Math.min(me.getStat(sdk.stats.StatPts) - this.save - 1, 99))
          .send();
      }
    } else {
      useStatPoint(type);
    }

    while (getTickCount() - tick < 3000) {
      if (currStat > me.getStat(sdk.stats.StatPts)) {
        console.log(
          "AutoStat: Using " + (currStat - me.getStat(sdk.stats.StatPts))
          + " stat points in " + statIDToString[type]
        );
        return true;
      }

      delay(100);
    }

    return false;
  };

  this.addStatPoint = function () {
    this.remaining = me.getStat(sdk.stats.StatPts);
    
    let hardStats;

    for (let i = 0; i < this.statBuildOrder.length; i += 1) {
      switch (this.statBuildOrder[i][0]) {
      case sdk.stats.Strength:
      case "s":
      case "str":
      case "strength":
        if (typeof this.statBuildOrder[i][1] === "string") {
          switch (this.statBuildOrder[i][1]) {
          case "all":
            return this.useStats(sdk.stats.Strength);
          default:
            break;
          }
        } else {
          hardStats = this.getHardStats(sdk.stats.Strength);

          if (hardStats < this.statBuildOrder[i][1]) {
            return this.useStats(sdk.stats.Strength, this.statBuildOrder[i][1] - hardStats);
          }
        }

        break;
      case sdk.stats.Energy:
      case "e":
      case "enr":
      case "energy":
        if (typeof this.statBuildOrder[i][1] === "string") {
          switch (this.statBuildOrder[i][1]) {
          case "all":
            return this.useStats(sdk.stats.Energy);
          default:
            break;
          }
        } else {
          hardStats = this.getHardStats(sdk.stats.Energy);

          if (hardStats < this.statBuildOrder[i][1]) {
            return this.useStats(sdk.stats.Energy, this.statBuildOrder[i][1] - hardStats);
          }
        }

        break;
      case sdk.stats.Dexterity:
      case "d":
      case "dex":
      case "dexterity":
        if (typeof this.statBuildOrder[i][1] === "string") {
          switch (this.statBuildOrder[i][1]) {
          case "block":
            if (me.expansion) {
              if (this.getBlock() < this.block) {
                return this.useStats(sdk.stats.Dexterity, this.requiredDex());
              }
            }

            break;
          case "all":
            return this.useStats(sdk.stats.Dexterity);
          default:
            break;
          }
        } else {
          hardStats = this.getHardStats(sdk.stats.Dexterity);

          if (hardStats < this.statBuildOrder[i][1]) {
            return this.useStats(sdk.stats.Dexterity, this.statBuildOrder[i][1] - hardStats);
          }
        }

        break;
      case sdk.stats.Vitality:
      case "v":
      case "vit":
      case "vitality":
        if (typeof this.statBuildOrder[i][1] === "string") {
          switch (this.statBuildOrder[i][1]) {
          case "all":
            return this.useStats(sdk.stats.Vitality);
          default:
            break;
          }
        } else {
          hardStats = this.getHardStats(sdk.stats.Vitality);

          if (hardStats < this.statBuildOrder[i][1]) {
            return this.useStats(sdk.stats.Vitality, this.statBuildOrder[i][1] - hardStats);
          }
        }

        break;
      }
    }

    return false;
  };

  this.remaining = 0;
  this.count = 0;

  this.init = function (statBuildOrder, save = 0, block = 0, bulkStat = true) {
    this.statBuildOrder = statBuildOrder;
    this.save = save;
    this.block = block;
    this.bulkStat = bulkStat;

    if (!this.statBuildOrder || !this.statBuildOrder.length) {
      console.log("AutoStat: No build array specified");

      return false;
    }

    while (me.getStat(sdk.stats.StatPts) > this.save) {
      this.addStatPoint();
      delay(150 + me.ping); // spending multiple single stat at a time with short delay may cause r/d

      // break out of loop if we have stat points available but finished allocating as configured
      if (me.getStat(sdk.stats.StatPts) === this.remaining) {
        this.count += 1;
      }

      if (this.count > 2) {
        break;
      }
    }

    console.log("AutoStat: Finished allocating stat points");

    return true;
  };

  return true;
};
