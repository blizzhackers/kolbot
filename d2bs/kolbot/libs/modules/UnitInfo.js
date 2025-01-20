/* eslint-disable max-len */
/**
*  @filename    UnitInfo.js
*  @author      kolton, theBGuy
*  @desc        Display unit info
*
*/

include("core/prototypes.js");

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.UnitInfo = factory();
  }
}(this, function () {
  /**
   * @constructor
   */
  function UnitInfo () {
    /**
     * screen coordinate for info box
     * @private
     * @type {number}
     */
    this.x = 200;

    /**
     * screen coordinate for info box
     * @private
     * @type {number}
     */
    this.y = 250;

    /**
     * @private
     * @type {any[]}
     */
    this.hooks = [];

    /**
     * @private
     * @type {number | null}
     */
    this.currentGid = null;

    /**
     * @private
     * @type {boolean}
     */
    this.cleared = true;

    /**
     * @private
     * @type {{ x: number, y: number }}
     */
    this.resfix = {
      x: (me.screensize ? 0 : -160),
      y: (me.screensize ? 0 : -120)
    };
  }

  /**
   * Create info based on unit type
   * @param {Unit} unit 
   */
  UnitInfo.prototype.createInfo = function (unit) {
    if (typeof unit === "undefined") {
      this.remove();
    } else {
      // same unit, no changes so skip
      if (this.currentGid === unit.gid) return;
      // some hooks left over, remove them
      this.hooks.length > 0 && this.remove();
      // set new gid
      this.currentGid = unit.gid;

      switch (unit.type) {
      case sdk.unittype.Player:
        this.playerInfo(unit);

        break;
      case sdk.unittype.Monster:
        this.monsterInfo(unit);

        break;
      case sdk.unittype.Object:
      case sdk.unittype.Stairs:
        this.objectInfo(unit);

        break;
      case sdk.unittype.Item:
        this.itemInfo(unit);

        break;
      }
    }

  };

  /**
   * Check that selected unit is still valid
   */
  UnitInfo.prototype.check = function () {
    // make sure things got cleaned up properly if we are supposedly cleared
    if (this.hooks.length === 0 && this.cleared) return;
    // don't deal with this when an item is on our cursor
    if (me.itemoncursor) return;
    let unit = Game.getSelectedUnit();
    if (typeof unit === "undefined" || unit.gid !== this.currentGid) {
      this.remove();
    }
  };

  /**
   * @private
   * @param {Player} unit 
   */
  UnitInfo.prototype.playerInfo = function (unit) {
    let string;
    let frameXsize = 0;
    let frameYsize = 20;
    let items = unit.getItemsEx();

    this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));

    if (items.length) {
      this.hooks.push(new Text("Equipped items:", this.x, this.y + 15, 4, 13, 2));
      frameYsize += 15;

      items.forEach((item, i) => {
        if (item.runeword) {
          string = item.fname.split("\n")[1] + "ÿc0 " + item.fname.split("\n")[0];
        } else {
          string = Item.color(item, false) + (item.quality > sdk.items.quality.Magic && item.identified
            ? item.fname.split("\n").reverse()[0].replace("ÿc4", "")
            : item.name);
        }

        this.hooks.push(new Text(string, this.x, this.y + (i + 2) * 15, 0, 13, 2));
        string.length > frameXsize && (frameXsize = string.length);
        frameYsize += 15;
      });
    }

    this.cleared = false;

    this.hooks.push(new Box(this.x + 2, this.y - 15, Math.round(frameXsize * 7.5) - 4, frameYsize, 0x0, 1, 2));
    this.hooks.push(new Frame(this.x, this.y - 15, Math.round(frameXsize * 7.5), frameYsize, 2));
    this.hooks[this.hooks.length - 2].zorder = 0;
  };

  /**
   * @private
   * @param {Monster} unit 
   */
  UnitInfo.prototype.monsterInfo = function (unit) {
    let frameYsize = 125;

    this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));
    this.hooks.push(new Text("HP percent: ÿc0" + Math.round(unit.hp * 100 / 128), this.x, this.y + 15, 4, 13, 2));
    this.hooks.push(new Text("Fire resist: ÿc0" + unit.getStat(sdk.stats.FireResist), this.x, this.y + 30, 4, 13, 2));
    this.hooks.push(new Text("Cold resist: ÿc0" + unit.getStat(sdk.stats.ColdResist), this.x, this.y + 45, 4, 13, 2));
    this.hooks.push(new Text("Lightning resist: ÿc0" + unit.getStat(sdk.stats.LightResist), this.x, this.y + 60, 4, 13, 2));
    this.hooks.push(new Text("Poison resist: ÿc0" + unit.getStat(sdk.stats.PoisonResist), this.x, this.y + 75, 4, 13, 2));
    this.hooks.push(new Text("Physical resist: ÿc0" + unit.getStat(sdk.stats.DamageResist), this.x, this.y + 90, 4, 13, 2));
    this.hooks.push(new Text("Magic resist: ÿc0" + unit.getStat(sdk.stats.MagicResist), this.x, this.y + 105, 4, 13, 2));

    this.cleared = false;

    this.hooks.push(new Box(this.x + 2, this.y - 15, 136, frameYsize, 0x0, 1, 2));
    this.hooks.push(new Frame(this.x, this.y - 15, 140, frameYsize, 2));
    this.hooks[this.hooks.length - 2].zorder = 0;
  };

  /**
   * @private
   * @param {ItemUnit} unit 
   */
  UnitInfo.prototype.itemInfo = function (unit) {
    let xpos = 60;
    let ypos = (me.getMerc() ? 80 : 20) + (-1 * this.resfix.y);
    let frameYsize = 65;

    this.hooks.push(new Text("Code: ÿc0" + unit.code, xpos, ypos + 0, 4, 13, 2));
    this.hooks.push(new Text("Classid: ÿc0" + unit.classid, xpos, ypos + 15, 4, 13, 2));
    this.hooks.push(new Text("Item Type: ÿc0" + unit.itemType, xpos, ypos + 30, 4, 13, 2));
    this.hooks.push(new Text("Item level: ÿc0" + unit.ilvl, xpos, ypos + 45, 4, 13, 2));

    this.cleared = false;
    this.socketedItems = unit.getItemsEx();

    if (this.socketedItems.length) {
      this.hooks.push(new Text("Socketed with:", xpos, ypos + 60, 4, 13, 2));
      frameYsize += 15;

      for (let i = 0; i < this.socketedItems.length; i += 1) {
        this.hooks.push(new Text(this.socketedItems[i].fname.split("\n").reverse().join(" "), xpos, ypos + (i + 5) * 15, 0, 13, 2));

        frameYsize += 15;
      }
    }

    if (unit.magic && unit.identified) {
      this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));
      this.hooks.push(new Text("Suffix: ÿc0" + unit.suffixnum, xpos, ypos + frameYsize + 10, 4, 13, 2));

      frameYsize += 30;
    }

    if (unit.runeword) {
      this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));

      frameYsize += 15;
    }

    this.hooks.push(new Box(xpos + 2, ypos - 15, 116, frameYsize, 0x0, 1, 2));
    this.hooks.push(new Frame(xpos, ypos - 15, 120, frameYsize, 2));
    this.hooks[this.hooks.length - 2].zorder = 0;
  };

  /**
   * @private
   * @param {ObjectUnit} unit 
   */
  UnitInfo.prototype.objectInfo = function (unit) {
    let frameYsize = 35;

    this.hooks.push(new Text("Type: ÿc0" + unit.type, this.x, this.y, 4, 13, 2));
    this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y + 15, 4, 13, 2));

    if (!!unit.objtype) {
      this.hooks.push(new Text((unit.name.toLowerCase().includes("shrine") ? "Type" : "Destination") + ": ÿc0" + unit.objtype, this.x, this.y + 30, 4, 13, 2));

      frameYsize += 15;
    }

    this.cleared = false;

    this.hooks.push(new Box(this.x + 2, this.y - 15, 116, frameYsize, 0x0, 1, 2));
    this.hooks.push(new Frame(this.x, this.y - 15, 120, frameYsize, 2));
    this.hooks[this.hooks.length - 2].zorder = 0;
  };
  
  UnitInfo.prototype.remove = function () {
    while (this.hooks.length > 0) {
      this.hooks.shift().remove();
    }

    this.currentGid = null;
    this.cleared = true;
  };

  return UnitInfo;
}));

