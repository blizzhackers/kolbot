/* eslint-disable max-len */
/**
*  @filename    Item.js
*  @author      kolton, theBGuy
*  @desc        handle item and autoequip related things
*
*/

// torn on if this should be broken up in two classes Item and AutoEquip, for now leaving as is
/**
 * @todo fix the max-len warnings + redo majority of this file
 */
const Item = {
  qualityToName: function (quality) {
    let qualNames = ["", "lowquality", "normal", "superior", "magic", "set", "rare", "unique", "crafted"];
    return qualNames[quality];
  },

  color: function (unit, type) {
    type === undefined && (type = true);

    if (type) {
      switch (unit.itemType) {
      case sdk.items.type.Gold:
        return "ÿc4";
      case sdk.items.type.Rune:
        return "ÿc8";
      case sdk.items.type.HealingPotion:
        return "ÿc1";
      case sdk.items.type.ManaPotion:
        return "ÿc3";
      case sdk.items.type.RejuvPotion:
        return "ÿc;";
      }
    }

    switch (unit.quality) {
    case sdk.items.quality.Magic:
      return "ÿc3";
    case sdk.items.quality.Set:
      return "ÿc2";
    case sdk.items.quality.Rare:
      return "ÿc9";
    case sdk.items.quality.Unique:
      return "ÿc4";
    case sdk.items.quality.Crafted:
      return "ÿc8";
    }

    return "ÿc0";
  },

  hasTier: function (item) {
    return Config.AutoEquip && NTIP.GetTier(item) > 0;
  },

  canEquip: function (item) {
    // Not an item or unid
    if (!item || item.type !== sdk.unittype.Item || !item.identified) return false;
    // Higher requirements
    if (item.getStat(sdk.stats.LevelReq) > me.getStat(sdk.stats.Level)
      || item.dexreq > me.getStat(sdk.stats.Dexterity) || item.strreq > me.getStat(sdk.stats.Strength)) {
      return false;
    }
    return true;
  },

  // Equips an item and throws away the old equipped item
  equip: function (item, bodyLoc) {
    if (!this.canEquip(item)) return false;

    // Already equipped in the right slot
    if (item.mode === sdk.items.mode.Equipped && item.bodylocation === bodyLoc) return true;
    if (item.isInStash && !Town.openStash()) return false;

    for (let i = 0; i < 3; i += 1) {
      if (item.toCursor()) {
        clickItemAndWait(sdk.clicktypes.click.item.Left, bodyLoc);

        if (item.bodylocation === bodyLoc) {
          if (getCursorType() === 3) {
            let cursorItem = Game.getCursorUnit();

            if (cursorItem) {
              if (!Storage.Inventory.CanFit(cursorItem) || !Storage.Inventory.MoveTo(cursorItem)) {
                cursorItem.drop();
              }
            }
          }

          return true;
        }
      }
    }

    return false;
  },

  getEquippedItem: function (bodyLoc) {
    let item = me.getItem();

    if (item) {
      do {
        if (item.bodylocation === bodyLoc) {
          return {
            classid: item.classid,
            tier: NTIP.GetTier(item)
          };
        }
      } while (item.getNext());
    }

    // Don't have anything equipped in there
    return {
      classid: -1,
      tier: -1
    };
  },

  getBodyLoc: function (item) {
    let bodyLoc;

    switch (item.itemType) {
    case sdk.items.type.Shield:
    case sdk.items.type.AuricShields:
    case sdk.items.type.VoodooHeads:
    case sdk.items.type.BowQuiver:
    case sdk.items.type.CrossbowQuiver:
      bodyLoc = sdk.body.LeftArm;

      break;
    case sdk.items.type.Armor:
      bodyLoc = sdk.body.Armor;

      break;
    case sdk.items.type.Ring:
      bodyLoc = [sdk.body.RingRight, sdk.body.RingLeft];

      break;
    case sdk.items.type.Amulet:
      bodyLoc = sdk.body.Neck;

      break;
    case sdk.items.type.Boots:
      bodyLoc = sdk.body.Feet;

      break;
    case sdk.items.type.Gloves:
      bodyLoc = sdk.body.Gloves;

      break;
    case sdk.items.type.Belt:
      bodyLoc = sdk.body.Belt;

      break;
    case sdk.items.type.Helm:
    case sdk.items.type.PrimalHelm:
    case sdk.items.type.Circlet:
    case sdk.items.type.Pelt:
      bodyLoc = sdk.body.Head;

      break;
    case sdk.items.type.Scepter:
    case sdk.items.type.Wand:
    case sdk.items.type.Staff:
    case sdk.items.type.Bow:
    case sdk.items.type.Axe:
    case sdk.items.type.Club:
    case sdk.items.type.Sword:
    case sdk.items.type.Hammer:
    case sdk.items.type.Knife:
    case sdk.items.type.Spear:
    case sdk.items.type.Polearm:
    case sdk.items.type.Crossbow:
    case sdk.items.type.Mace:
    case sdk.items.type.ThrowingKnife:
    case sdk.items.type.ThrowingAxe:
    case sdk.items.type.Javelin:
    case sdk.items.type.Orb:
    case sdk.items.type.AmazonBow:
    case sdk.items.type.AmazonSpear:
    case sdk.items.type.AmazonJavelin:
    case sdk.items.type.MissilePotion:
      bodyLoc = me.barbarian ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;

      break;
    case sdk.items.type.HandtoHand:
    case sdk.items.type.AssassinClaw:
      bodyLoc = me.assassin ? [sdk.body.RightArm, sdk.body.LeftArm] : sdk.body.RightArm;

      break;
    default:
      return false;
    }

    !Array.isArray(bodyLoc) && (bodyLoc = [bodyLoc]);

    return bodyLoc;
  },

  autoEquipCheck: function (item) {
    if (!Config.AutoEquip) return true;

    let tier = NTIP.GetTier(item);
    let bodyLoc = this.getBodyLoc(item);

    if (tier > 0 && bodyLoc) {
      for (let i = 0; i < bodyLoc.length; i += 1) {
        // Low tier items shouldn't be kept if they can't be equipped
        if (tier > this.getEquippedItem(bodyLoc[i]).tier
          && (this.canEquip(item) || !item.getFlag(sdk.items.flags.Identified))) {
          return true;
        }
      }
    }

    // Sell/ignore low tier items, keep high tier
    if (tier > 0 && tier < 100) return false;

    return true;
  },

  // returns true if the item should be kept+logged, false if not
  autoEquip: function () {
    if (!Config.AutoEquip) return true;

    let items = me.findItems(-1, sdk.items.mode.inStorage);

    if (!items) return false;

    function sortEq(a, b) {
      if (Item.canEquip(a)) return -1;
      if (Item.canEquip(b)) return 1;

      return 0;
    }

    me.cancel();

    // Remove items without tier
    for (let i = 0; i < items.length; i += 1) {
      if (NTIP.GetTier(items[i]) === 0) {
        items.splice(i, 1);

        i -= 1;
      }
    }

    while (items.length > 0) {
      items.sort(sortEq);

      let tier = NTIP.GetTier(items[0]);
      let bodyLoc = this.getBodyLoc(items[0]);

      if (tier > 0 && bodyLoc) {
        for (let j = 0; j < bodyLoc.length; j += 1) {
          // khalim's will adjustment
          const equippedItem = this.getEquippedItem(bodyLoc[j]);
          if (items[0].isInStorage
            && tier > equippedItem.tier && equippedItem.classid !== sdk.items.quest.KhalimsWill) {
            if (!items[0].identified) {
              let tome = me.findItem(sdk.items.TomeofIdentify, sdk.items.mode.inStorage, sdk.storage.Inventory);

              if (tome && tome.getStat(sdk.stats.Quantity) > 0) {
                items[0].isInStash && Town.openStash();
                Town.identifyItem(items[0], tome);
              }
            }

            let gid = items[0].gid;
            console.log(items[0].name);

            if (this.equip(items[0], bodyLoc[j])) {
              Item.logItem("Equipped", me.getItem(-1, -1, gid));
            }

            break;
          }
        }
      }

      items.shift();
    }

    return true;
  },

  getItemDesc: function (unit, logILvl = true) {
    let stringColor = "";
    let desc = unit.description;

    if (!desc) return "";
    desc = desc.split("\n");

    // Lines are normally in reverse. Add color tags if needed and reverse order.
    for (let i = 0; i < desc.length; i += 1) {
      // Remove sell value
      if (desc[i].includes(getLocaleString(sdk.locale.text.SellValue))) {
        desc.splice(i, 1);

        i -= 1;
      } else {
        // Add color info
        if (!desc[i].match(/^(y|ÿ)c/)) {
          desc[i] = stringColor + desc[i];
        }

        // Find and store new color info
        let index = desc[i].lastIndexOf("ÿc");

        if (index > -1) {
          stringColor = desc[i].substring(index, index + "ÿ".length + 2);
        }
      }

      desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2");
    }

    if (logILvl && desc[desc.length - 1]) {
      desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
    }

    desc = desc.reverse().join("\n");

    return desc;
  },

  getItemCode: function (unit) {
    if (unit === undefined) return "";
    
    let code = (() => {
      switch (unit.quality) {
      case sdk.items.quality.Set:
        switch (unit.classid) {
        case sdk.items.Sabre:
          return "inv9sbu";
        case sdk.items.ShortWarBow:
          return "invswbu";
        case sdk.items.Helm:
          return "invhlmu";
        case sdk.items.LargeShield:
          return "invlrgu";
        case sdk.items.LongSword:
        case sdk.items.CrypticSword:
          return "invlsdu";
        case sdk.items.SmallShield:
          return "invsmlu";
        case sdk.items.Buckler:
          return "invbucu";
        case sdk.items.Cap:
          return "invcapu";
        case sdk.items.BroadSword:
          return "invbsdu";
        case sdk.items.FullHelm:
          return "invfhlu";
        case sdk.items.GothicShield:
          return "invgtsu";
        case sdk.items.AncientArmor:
        case sdk.items.SacredArmor:
          return "invaaru";
        case sdk.items.KiteShield:
          return "invkitu";
        case sdk.items.TowerShield:
          return "invtowu";
        case sdk.items.FullPlateMail:
          return "invfulu";
        case sdk.items.MilitaryPick:
          return "invmpiu";
        case sdk.items.JaggedStar:
          return "invmstu";
        case sdk.items.ColossusBlade:
          return "invgsdu";
        case sdk.items.OrnatePlate:
          return "invxaru";
        case sdk.items.Cuirass:
        case sdk.items.ReinforcedMace:
        case sdk.items.Ward:
        case sdk.items.SpiredHelm:
          return "inv" + unit.code + "s";
        case sdk.items.GrandCrown:
          return "invxrnu";
        case sdk.items.ScissorsSuwayyah:
          return "invskru";
        case sdk.items.GrimHelm:
        case sdk.items.BoneVisage:
          return "invbhmu";
        case sdk.items.ElderStaff:
          return "invcstu";
        case sdk.items.RoundShield:
          return "invxmlu";
        case sdk.items.BoneWand:
          return "invbwnu";
        default:
          return "";
        }
      case sdk.items.quality.Unique:
        for (let i = 0; i < 401; i += 1) {
          if (unit.code === getBaseStat("uniqueitems", i, 4).trim()
            && unit.fname.split("\n").reverse()[0].includes(getLocaleString(getBaseStat("uniqueitems", i, 2)))) {
            return getBaseStat("uniqueitems", i, "invfile");
          }
        }
        return "";
      default:
        return "";
      }
    })();

    if (!code) {
      // Tiara/Diadem
      code = ["ci2", "ci3"].includes(unit.code) ? unit.code : (getBaseStat("items", unit.classid, "normcode") || unit.code);
      code = code.replace(" ", "");
      [sdk.items.type.Ring, sdk.items.type.Amulet, sdk.items.type.Jewel, sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(unit.itemType) && (code += (unit.gfx + 1));
    }

    return code;
  },

  getItemSockets: function (unit) {
    let code;
    let sockets = unit.sockets;
    let subItems = unit.getItemsEx();
    let tempArray = [];

    if (subItems.length) {
      switch (unit.sizex) {
      case 2:
        switch (unit.sizey) {
        case 3: // 2 x 3
          switch (sockets) {
          case 4:
            tempArray = [subItems[0], subItems[3], subItems[2], subItems[1]];

            break;
          case 5:
            tempArray = [subItems[1], subItems[4], subItems[0], subItems[3], subItems[2]];

            break;
          case 6:
            tempArray = [subItems[0], subItems[3], subItems[1], subItems[4], subItems[2], subItems[5]];

            break;
          }

          break;
        case 4: // 2 x 4
          switch (sockets) {
          case 5:
            tempArray = [subItems[1], subItems[4], subItems[0], subItems[3], subItems[2]];

            break;
          case 6:
            tempArray = [subItems[0], subItems[3], subItems[1], subItems[4], subItems[2], subItems[5]];

            break;
          }

          break;
        }

        break;
      }

      if (tempArray.length === 0 && subItems.length > 0) {
        tempArray = subItems.slice(0);
      }
    }

    for (let i = 0; i < sockets; i += 1) {
      if (tempArray[i]) {
        code = tempArray[i].code;

        if ([sdk.items.type.Ring, sdk.items.type.Amulet, sdk.items.type.Jewel, sdk.items.type.SmallCharm, sdk.items.type.LargeCharm, sdk.items.type.GrandCharm].includes(tempArray[i].itemType)) {
          code += (tempArray[i].gfx + 1);
        }
      } else {
        code = "gemsocket";
      }

      tempArray[i] = code;
    }

    return tempArray;
  },

  useItemLog: true, // Might be a bit dirty

  logger: function (action, unit, text) {
    if (!Config.ItemInfo || !this.useItemLog) return false;

    let desc;
    let date = new Date();
    let dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace(/-/g, "/").replace("T", " ") + "]";

    switch (action) {
    case "Sold":
      if (Config.ItemInfoQuality.indexOf(unit.quality) === -1) {
        return false;
      }

      desc = this.getItemDesc(unit).split("\n").join(" | ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]/gi, "").trim();

      break;
    case "Kept":
    case "Field Kept":
    case "Runeword Kept":
    case "Cubing Kept":
    case "Shopped":
    case "Gambled":
    case "Dropped":
      desc = this.getItemDesc(unit).split("\n").join(" | ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]|\/|\\/gi, "").trim();

      break;
    case "No room for":
      desc = unit.name;

      break;
    default:
      desc = unit.fname.split("\n").reverse().join(" ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]|\/|\\/gi, "").trim();

      break;
    }

    return FileAction.read("logs/ItemLog.txt", dateString + " <" + me.profile + "> <" + action + "> (" + Item.qualityToName(unit.quality) + ") " + desc + (text ? " {" + text + "}" : "") + "\n");
  },

  // Log kept item stats in the manager.
  logItem: function (action, unit, keptLine) {
    if (!this.useItemLog) return false;
    if (!Config.LogKeys && ["pk1", "pk2", "pk3"].includes(unit.code)) return false;
    if (!Config.LogOrgans && ["dhn", "bey", "mbr"].includes(unit.code)) return false;
    if (!Config.LogLowRunes && ["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "r10", "r11", "r12", "r13", "r14"].includes(unit.code)) return false;
    if (!Config.LogMiddleRunes && ["r15", "r16", "r17", "r18", "r19", "r20", "r21", "r22", "r23"].includes(unit.code)) return false;
    if (!Config.LogHighRunes && ["r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32", "r33"].includes(unit.code)) return false;
    if (!Config.LogLowGems && ["gcv", "gcy", "gcb", "gcg", "gcr", "gcw", "skc", "gfv", "gfy", "gfb", "gfg", "gfr", "gfw", "skf", "gsv", "gsy", "gsb", "gsg", "gsr", "gsw", "sku"].includes(unit.code)) return false;
    if (!Config.LogHighGems && ["gzv", "gly", "glb", "glg", "glr", "glw", "skl", "gpv", "gpy", "gpb", "gpg", "gpr", "gpw", "skz"].includes(unit.code)) return false;

    for (let i = 0; i < Config.SkipLogging.length; i++) {
      if (Config.SkipLogging[i] === unit.classid || Config.SkipLogging[i] === unit.code) return false;
    }

    let lastArea;
    let name = unit.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<:;.*]|\/|\\/g, "").trim();
    let desc = this.getItemDesc(unit);
    let color = (unit.getColor() || -1);

    if (action.match("kept", "i")) {
      lastArea = DataFile.getStats().lastArea;
      lastArea && (desc += ("\n\\xffc0Area: " + lastArea));
    }

    let code = this.getItemCode(unit);
    let sock = unit.getItem();

    if (sock) {
      do {
        if (sock.itemType === sdk.items.type.Jewel) {
          desc += "\n\n";
          desc += this.getItemDesc(sock);
        }
      } while (sock.getNext());
    }

    keptLine && (desc += ("\n\\xffc0Line: " + keptLine));
    desc += "$" + (unit.ethereal ? ":eth" : "");

    let itemObj = {
      title: action + " " + name,
      description: desc,
      image: code,
      textColor: unit.quality,
      itemColor: color,
      header: "",
      sockets: this.getItemSockets(unit)
    };

    D2Bot.printToItemLog(itemObj);

    return true;
  },

  // skip low items: MuleLogger
  skipItem: function (id) {
    return [
      sdk.items.HandAxe, sdk.items.Wand, sdk.items.Club, sdk.items.ShortSword, sdk.items.Javelin, sdk.items.ShortStaff, sdk.items.Katar,
      sdk.items.Buckler, sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.RejuvenationPotion, sdk.items.FullRejuvenationPotion,
      sdk.items.ThawingPotion, sdk.items.TomeofTownPortal, sdk.items.TomeofIdentify, sdk.items.ScrollofIdentify, sdk.items.ScrollofTownPortal,
      sdk.items.Key, sdk.items.MinorHealingPotion, sdk.items.LightHealingPotion, sdk.items.HealingPotion, sdk.items.GreaterHealingPotion,
      sdk.items.SuperHealingPotion, sdk.items.MinorManaPotion, sdk.items.LightManaPotion, sdk.items.ManaPotion, sdk.items.GreaterManaPotion,
      sdk.items.SuperManaPotion
    ].includes(id);
  },
};
