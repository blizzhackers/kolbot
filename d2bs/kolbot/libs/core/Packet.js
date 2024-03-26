/**
*  @filename    Packet.js
*  @author      kolton, theBGuy
*  @desc        handle packet based functions
*
*/

const Packet = {
  /**
   * Interact and open the menu of an NPC
   * @deprecated there was only one line difference between this and Unit.openMenu
   * added the line to Unit.openMenu to save defining this function
   * @param {NPCUnit} unit 
   * @returns {boolean}
   */
  openMenu: function (unit) {
    if (unit.type !== sdk.unittype.NPC) throw new Error("openMenu: Must be used on NPCs.");
    if (getUIFlag(sdk.uiflags.NPCMenu)) return true;
    let pingDelay = (me.gameReady ? me.ping : 125);

    for (let i = 0; i < 5; i += 1) {
      if (getDistance(me, unit) > 4) {
        Pather.moveNearUnit(unit, 4);
      }
      Packet.entityInteract(unit);
      let tick = getTickCount();

      while (getTickCount() - tick < 5000) {
        if (getUIFlag(sdk.uiflags.NPCMenu)) {
          delay(Math.max(500, pingDelay * 2));

          return true;
        }

        if ((getTickCount() - tick > 1000
          && getInteractedNPC()) || (getTickCount() - tick > 500 && getIsTalkingNPC())) {
          me.cancel();
        }

        delay(100);
      }

      new PacketBuilder()
        .byte(sdk.packets.send.NPCInit)
        .dword(1)
        .dword(unit.gid)
        .send();
      delay(pingDelay + 1 * 2);
      Packet.cancelNPC(unit);
      delay(pingDelay + 1 * 2);
      this.flash(me.gid);
    }

    return false;
  },

  /**
   * Start a trade action with an NPC
   * @param {NPCUnit} unit 
   * @param {number} mode
   * @returns {boolean}
   */
  startTrade: function (unit, mode) {
    if (unit.type !== sdk.unittype.NPC) throw new Error("Unit.startTrade: Must be used on NPCs.");
    if (getUIFlag(sdk.uiflags.Shop)) return true;

    const gamble = mode === "Gamble";
    console.info(true, mode + " at " + unit.name);

    if (unit.openMenu()) {
      for (let i = 0; i < 10; i += 1) {
        delay(200);

        if (i % 2 === 0) {
          new PacketBuilder()
            .byte(sdk.packets.send.EntityAction)
            .dword(gamble ? 2 : 1)
            .dword(unit.gid)
            .dword(0)
            .send();
        }

        if (unit.itemcount > 0) {
          delay(200);
          console.info(false, "Successfully started " + mode + " at " + unit.name);
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Buy an item from an interacted NPC
   * @param {NPCUnit} unit 
   * @param {boolean} shiftBuy
   * @param {boolean} gamble
   * @returns {boolean}
   */
  buyItem: function (unit, shiftBuy, gamble) {
    const oldGold = me.gold;
    const itemCount = me.itemcount;
    let npc = getInteractedNPC();

    try {
      if (!npc) throw new Error("buyItem: No NPC menu open.");

      // Can we afford the item?
      if (oldGold < unit.getItemCost(sdk.items.cost.ToBuy)) return false;

      for (let i = 0; i < 3; i += 1) {
        new PacketBuilder()
          .byte(sdk.packets.send.NPCBuy)
          .dword(npc.gid)
          .dword(unit.gid)
          .dword(shiftBuy ? 0x80000000 : gamble ? 0x2 : 0x0)
          .dword(0)
          .send();
        let tick = getTickCount();

        while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
          if (shiftBuy && me.gold < oldGold) return true;
          if (itemCount !== me.itemcount) return true;

          delay(10);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return false;
  },

  /**
   * Buy scrolls from an interacted NPC, we need this as a seperate check because itemcount doesn't change
   * if the scroll goes into the tome automatically.
   * @param {NPCUnit} unit 
   * @param {ItemUnit} [tome]
   * @param {boolean} [shiftBuy]
   * @returns {boolean}
   */
  buyScroll: function (unit, tome, shiftBuy) {
    let oldGold = me.gold;
    let itemCount = me.itemcount;
    let npc = getInteractedNPC();
    tome === undefined && (tome = me.findItem(
      (unit.classid === sdk.items.ScrollofTownPortal ? sdk.items.TomeofTownPortal : sdk.items.TomeofIdentify),
      sdk.items.mode.inStorage, sdk.storage.Inventory
    ));
    let preCount = !!tome ? tome.getStat(sdk.stats.Quantity) : 0;

    try {
      if (!npc) throw new Error("buyItem: No NPC menu open.");

      // Can we afford the item?
      if (oldGold < unit.getItemCost(sdk.items.cost.ToBuy)) return false;

      for (let i = 0; i < 3; i += 1) {
        new PacketBuilder()
          .byte(sdk.packets.send.NPCBuy)
          .dword(npc.gid)
          .dword(unit.gid)
          .dword(shiftBuy ? 0x80000000 : 0x0)
          .dword(0)
          .send();
        let tick = getTickCount();

        while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
          if (shiftBuy && me.gold < oldGold) return true;
          if (itemCount !== me.itemcount) return true;
          if (tome && tome.getStat(sdk.stats.Quantity) > preCount) return true;
          delay(10);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return false;
  },

  /**
   * Sell a item to a NPC
   * @param {ItemUnit} unit 
   * @returns {boolean}
   */
  sellItem: function (unit) {
    // Check if it's an item we want to buy
    if (unit.type !== sdk.unittype.Item) throw new Error("Unit.sell: Must be used on items.");
    if (!unit.sellable) {
      console.error((new Error("Item is unsellable")));
      return false;
    }

    let itemCount = me.itemcount;
    let npc = getInteractedNPC();
    if (!npc) return false;
    let _npcs = Town.tasks.get(me.act);
    if (![_npcs.Shop, _npcs.Gamble, _npcs.Repair, _npcs.Key].includes(npc.name.toLowerCase())) {
      console.warn("Unit.sell: NPC is not a shop, gamble, repair or key NPC.");
      return false;
    }

    for (let i = 0; i < 5; i += 1) {
      new PacketBuilder()
        .byte(sdk.packets.send.NPCSell)
        .dword(npc.gid)
        .dword(unit.gid)
        .dword(0)
        .dword(0)
        .send();
      let tick = getTickCount();

      while (getTickCount() - tick < 2000) {
        if (me.itemcount !== itemCount) return true;
        delay(10);
      }
    }

    return false;
  },

  /**
   * @param {ItemUnit} unit 
   * @param {ItemUnit} tome
   * @returns {boolean}
   */
  identifyItem: function (unit, tome) {
    if (!unit || unit.identified) return false;
    const identify = function () {
      new PacketBuilder()
        .byte(sdk.packets.send.IndentifyItem)
        .dword(unit.gid)
        .dword(tome.gid)
        .send();
    };
    const idOnCursor = function () {
      return getCursorType() === sdk.cursortype.Identify;
    };
    const unitIdentified = function () {
      return unit.identified;
    };

    for (let i = 0; i < 3; i += 1) {
      identify();
      if (Misc.poll(idOnCursor, 2000, 10)) {
        break;
      }
    }

    if (!idOnCursor()) return false;

    for (let i = 0; i < 3; i += 1) {
      idOnCursor() && identify();
      if (Misc.poll(unitIdentified, 2000, 10)) {
        delay(25);

        return true;
      }
    }

    return false;
  },

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  itemToCursor: function (item) {
    // Something already on cursor
    if (me.itemoncursor) {
      let cursorItem = Game.getCursorUnit();
      // Return true if the item is already on cursor
      if (cursorItem.gid === item.gid) {
        return true;
      }
      this.dropItem(cursorItem); // If another item is on cursor, drop it
    }

    for (let i = 0; i < 15; i += 1) {
      // equipped
      item.isEquipped
        ? sendPacket(1, sdk.packets.send.PickupBodyItem, 2, item.bodylocation)
        : item.isInBelt
          ? new PacketBuilder().byte(sdk.packets.send.RemoveBeltItem).dword(item.gid).send()
          : sendPacket(1, sdk.packets.send.PickupBufferItem, 4, item.gid);

      let tick = getTickCount();

      while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
        if (me.itemoncursor) return true;
        delay(10);
      }
    }

    return false;
  },

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  dropItem: function (item) {
    if (!this.itemToCursor(item)) return false;

    for (let i = 0; i < 15; i += 1) {
      new PacketBuilder()
        .byte(sdk.packets.send.DropItem)
        .dword(item.gid)
        .send();
      const tick = getTickCount();

      while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
        if (!me.itemoncursor) return true;
        delay(10);
      }
    }

    return false;
  },

  /**
   * @param {ItemUnit} item 
   * @returns {boolean}
   */
  givePotToMerc: function (item) {
    if (!item) return false;
    if (![
      sdk.items.type.HealingPotion, sdk.items.type.RejuvPotion,
      sdk.items.type.ThawingPotion, sdk.items.type.AntidotePotion
    ].includes(item.itemType)) {
      return false;
    }
    if (item.isInBelt) return this.useBeltItemForMerc(item);
    if (item.isInInventory && this.itemToCursor(item)) {
      new PacketBuilder()
        .byte(sdk.packets.send.MercItem)
        .word(0)
        .send();
      return true;
    }
    return false;
  },

  /**
   * @param {ItemUnit} item 
   * @param {number} xLoc
   * @returns {boolean}
   */
  placeInBelt: function (item, xLoc) {
    if (item.toCursor(true)) {
      new PacketBuilder()
        .byte(sdk.packets.send.ItemToBelt)
        .dword(item.gid)
        .dword(xLoc)
        .send();
    }
    return Misc.poll(function () {
      return item.isInBelt;
    }, 500, 100);
  },

  /**
   * @param {ItemUnit} who 
   * @param {boolean} toCursor 
   * @returns {boolean}
   */
  click: function (who, toCursor = false) {
    if (!who || !copyUnit(who).x) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.PickupItem)
      .dword(sdk.unittype.Item)
      .dword(who.gid)
      .dword(toCursor ? 1 : 0)
      .send();
    return true;
  },

  /**
   * @param {Unit} who 
   * @returns {boolean}
   */
  entityInteract: function (who) {
    if (!who || !copyUnit(who).x) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.InteractWithEntity)
      .dword(who.type)
      .dword(who.gid)
      .send();
    return true;
  },

  /**
   * @param {NPCUnit} who 
   * @returns {boolean}
   */
  initNPC: function (who) {
    if (!who || !copyUnit(who).x) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.NPCInit)
      .dword(1) // action type
      .dword(who.gid)
      .send();
    return true;
  },
  
  /**
   * @param {NPCUnit} who 
   * @returns {boolean}
   */
  cancelNPC: function (who) {
    if (!who || !copyUnit(who).x) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.NPCCancel)
      .dword(who.type)
      .dword(who.gid)
      .send();
    return true;
  },

  /**
   * @param {ItemUnit} pot 
   * @returns {boolean}
   */
  useBeltItemForMerc: function (pot) {
    if (!pot) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.UseBeltItem)
      .dword(pot.gid)
      .dword(1)
      .dword(0)
      .send();
    return true;
  },

  castSkill: function (hand, wX, wY) {
    hand = (hand === sdk.skills.hand.Right)
      ? sdk.packets.send.RightSkillOnLocation
      : sdk.packets.send.LeftSkillOnLocation;
    new PacketBuilder()
      .byte(hand)
      .word(wX)
      .word(wY)
      .send();
  },

  castAndHoldSkill: function (hand, wX, wY, duration = 1000) {
    /** @param {number} byte */
    const cast = function (byte) {
      new PacketBuilder()
        .byte(byte)
        .word(wX)
        .word(wY)
        .send();
    };
    const nHand = (hand === sdk.skills.hand.Right)
      ? sdk.packets.send.RightSkillOnLocation
      : sdk.packets.send.LeftSkillOnLocation;
    hand = (hand === sdk.skills.hand.Right)
      ? sdk.packets.send.RightSkillOnLocationEx
      : sdk.packets.send.LeftSkillOnLocationEx;
    
    const endTime = getTickCount() + duration;
    // has to be cast normally first with a click before held packet is sent
    cast(nHand);
    while (getTickCount() < endTime) {
      cast(hand);
      delay(25);
    }
  },

  /**
   * @param {number} hand
   * @param {Monster | ItemUnit | ObjectUnit} who 
   * @returns {boolean}
   */
  unitCast: function (hand, who) {
    hand = (hand === sdk.skills.hand.Right)
      ? sdk.packets.send.RightSkillOnEntityEx3
      : sdk.packets.send.LeftSkillOnEntityEx3;
    new PacketBuilder()
      .byte(hand)
      .dword(who.type)
      .dword(who.gid)
      .send();
  },

  /**
   * @param {Monster | ItemUnit | ObjectUnit} who 
   * @returns {boolean}
   */
  telekinesis: function (who) {
    if (!who || !Skill.setSkill(sdk.skills.Telekinesis, sdk.skills.hand.Right)) return false;
    if (Skill.getManaCost(sdk.skills.Telekinesis) > me.mp) return false;
    if (me.shapeshifted) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.RightSkillOnEntityEx3)
      .dword(who.type)
      .dword(who.gid)
      .send();
    return true;
  },

  /**
   * @param {Player | Monster | MercUnit} who 
   * @returns {boolean}
   */
  enchant: function (who) {
    if (!who || !Skill.setSkill(sdk.skills.Enchant, sdk.skills.hand.Right)) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.RightSkillOnEntityEx3)
      .dword(who.type)
      .dword(who.gid)
      .send();
    return true;
  },

  /**
   * @param {number} wX 
   * @param {number} wY 
   * @returns {boolean}
   */
  teleport: function (wX, wY) {
    if (![wX, wY].every(n => typeof n === "number")) return false;
    if (!Skill.setSkill(sdk.skills.Teleport, sdk.skills.hand.Right)) return false;
    new PacketBuilder()
      .byte(sdk.packets.send.RightSkillOnLocation)
      .word(wX)
      .word(wY)
      .send();
    return true;
  },

  // moveNPC: function (npc, dwX, dwY) { // commented the patched packet
  // 	//sendPacket(1, sdk.packets.send.MakeEntityMove, 4, npc.type, 4, npc.gid, 4, dwX, 4, dwY);
  // },

  /**
   * @deprecated
   * @param {number} x 
   * @param {number} y 
   * @param {number} maxDist 
   * @returns {boolean}
   */
  teleWalk: function (x, y, maxDist = 5) {
    !Packet.telewalkTick && (Packet.telewalkTick = 0);

    if (getDistance(me, x, y) > 10 && getTickCount() - this.telewalkTick > 3000 && Attack.validSpot(x, y)) {
      for (let i = 0; i < 5; i += 1) {
        sendPacket(1, sdk.packets.send.UpdatePlayerPos, 2, x + rand(-1, 1), 2, y + rand(-1, 1));
        delay(me.ping + 1);
        sendPacket(1, sdk.packets.send.RequestEntityUpdate, 4, me.type, 4, me.gid);
        delay(me.ping + 1);

        if (getDistance(me, x, y) < maxDist) {
          delay(200);

          return true;
        }
      }

      Packet.telewalkTick = getTickCount();
    }

    return false;
  },

  questRefresh: function () {
    sendPacket(1, sdk.packets.send.UpdateQuests);
  },

  /**
   * Request entity update
   * @param {number} gid 
   * @param {number} wait 
   */
  flash: function (gid, wait = 0) {
    wait === 0 && (wait = 300 + (me.gameReady ? 2 * me.ping : 300));
    sendPacket(1, sdk.packets.send.RequestEntityUpdate, 4, 0, 4, gid);

    if (wait > 0) {
      delay(wait);
    }
  },

  /**
   * @deprecated
   * @param {number} stat 
   * @param {number} value 
   */
  changeStat: function (stat, value) {
    if (value > 0) {
      getPacket(1, 0x1d, 1, stat, 1, value);
    }
  },

  // specialized wrapper for addEventListener
  addListener: function (packetType, callback) {
    if (typeof packetType === "number") {
      packetType = [packetType];
    }

    if (typeof packetType === "object" && packetType.length) {
      addEventListener("gamepacket", packet => (packetType.indexOf(packet[0]) > -1 ? callback(packet) : false));

      return callback;
    }

    return null;
  },

  removeListener: callback => removeEventListener("gamepacket", callback), // just a wrapper
};
