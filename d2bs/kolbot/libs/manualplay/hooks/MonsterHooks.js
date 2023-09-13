/**
*  @filename    MonsterHooks.js
*  @author      theBGuy
*  @credits     DetectiveSquirrel
*  @desc        Monster hooks for MapThread
*
*/

const MonsterHooks = (function () {
  /**
   * @author DetectiveSquirrel from his maphack
   * https://github.com/DetectiveSquirrel/Kolbot-MapThread/blob/9c721a72a934518cfca1d1a05211b5e03b5b624f/kolbot/threads/MapThread.js#L2353
   * @param {Monster} unit 
   * @returns {number}
   */
  function specTypeColor (unit) {
    switch (unit.spectype) {
    case sdk.monsters.spectype.Minion:
      return 3;
    case sdk.monsters.spectype.Magic:
      return 9;
    case sdk.monsters.spectype.Unique:
      return 11;
    case sdk.monsters.spectype.SuperUnique:
      return 2;
    default:
      return 8;
    }
  }
  
  /**
   * @constructor
   * @param {Monster} unit 
   */
  function MonsterHook (unit) {
    this.unit = copyUnit(unit);
    this.hook = new Text((unit.spectype & 0xF ? "O" : "X"), unit.x, unit.y, specTypeColor(unit), 1, null, true);
  }

  MonsterHook.prototype.update = function () {
    if (!this.unit || !this.unit.x || !this.unit.attackable) {
      this.hook.remove();
      return;
    }
    this.hook.x = this.unit.x;
    this.hook.y = this.unit.y;
  };
  
  return {
    /** @type {Object.<number, MonsterHook>} */
    hooks: {},
    enabled: true,

    check: function () {
      if (!this.enabled || me.inTown) {
        this.flush();

        return;
      }

      for (let m in this.hooks) {
        if (!this.hooks.hasOwnProperty(m)) {
          continue;
        }

        if (!copyUnit(this.hooks[m].unit).x) {
          this.hooks[m].hook.remove();
          delete this.hooks[m];
        }
      }

      let unit = Game.getMonster();

      if (unit) {
        do {
          if (unit.attackable) {
            if (!this.hooks[unit.gid]) {
              this.hooks[unit.gid] = new MonsterHook(unit);
            } else {
              this.hooks[unit.gid].update();
            }
          } else {
            if (this.hooks[unit.gid]) {
              this.hooks[unit.gid].hook.remove();
              delete this.hooks[unit.gid];
            }
          }
        } while (unit.getNext());
      }
    },

    /** @param {Monster} unit */
    remove: function (unit) {
      if (this.hooks.hasOwnProperty(unit.gid)) {
        this.hooks[unit.gid].hook.remove();
        delete this.hooks[unit.gid];

        return true;
      }

      return false;
    },

    flush: function () {
      for (let m in this.hooks) {
        if (!this.hooks.hasOwnProperty(m)) {
          continue;
        }
        this.hooks[m].hook.remove();
        delete this.hooks[m];
      }
    }
  };
})();
