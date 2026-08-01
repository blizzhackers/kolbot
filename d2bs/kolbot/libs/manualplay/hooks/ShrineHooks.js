/**
*  @filename    ShrineHooks.js
*  @author      theBGuy
*  @desc        Shrine hooks for MapThread
*
*/

/** @type {ShrineHooks} */
const ShrineHooks = {
  enabled: true,
  /** @type {{ shrine: ObjectUnit, hook: Text }[]} */
  hooks: [],
  shrines: new Map([
    [sdk.shrines.Refilling, "Refilling"],
    [sdk.shrines.Health, "Health"],
    [sdk.shrines.Mana, "Mana"],
    [sdk.shrines.HealthExchange, "Health Exchange"],
    [sdk.shrines.ManaExchange, "Mana Exchange"],
    [sdk.shrines.Armor, "Armor"],
    [sdk.shrines.Combat, "Combat"],
    [sdk.shrines.ResistFire, "Resist Fire"],
    [sdk.shrines.ResistCold, "Resist Cold"],
    [sdk.shrines.ResistLightning, "Resist Lightning"],
    [sdk.shrines.ResistPoison, "Resist Poison"],
    [sdk.shrines.Skill, "Skill"],
    [sdk.shrines.ManaRecharge, "Mana Recharge"],
    [sdk.shrines.Stamina, "Stamina"],
    [sdk.shrines.Experience, "Experience"],
    [sdk.shrines.Enirhs, "Enirhs"],
    [sdk.shrines.Portal, "Portal"],
    [sdk.shrines.Gem, "Gem"],
    [sdk.shrines.Fire, "Fire"],
    [sdk.shrines.Monster, "Monster"],
    [sdk.shrines.Exploding, "Exploding"],
    [sdk.shrines.Poison, "Poison"]
  ]),

  check: function () {
    if (!this.enabled || me.inTown) {
      this.flush();

      return;
    }

    for (let i = 0; i < this.hooks.length; i++) {
      if (!copyUnit(this.hooks[i].shrine).objtype) {
        this.hooks[i].hook.remove();
        this.hooks.splice(i, 1);

        i -= 1;
      }
    }

    let shrine = Game.getObject();

    if (shrine) {
      do {
        if (!ShrineHooks.shrines.has(shrine.objtype)) {
          continue;
        }
        if (shrine.name.toLowerCase().includes("shrine")) {
          if (shrine.mode === sdk.objects.mode.Inactive) {
            if (!this.getHook(shrine)) {
              this.add(shrine);
            }
          } else {
            this.remove(shrine);
          }
        }
      } while (shrine.getNext());
    }
  },

  /** @param {ObjectUnit} shrine */
  newHook: function (shrine) {
    let typeName = ShrineHooks.shrines.get(shrine.objtype);
    return typeName ? new Text(typeName, shrine.x, shrine.y, 4, 6, 2, true) : null;
  },

  /** @param {ObjectUnit} shrine */
  add: function (shrine) {
    if (!shrine.objtype) return;

    this.hooks.push({
      shrine: copyUnit(shrine),
      hook: this.newHook(shrine)
    });
  },

  /** @param {ObjectUnit} shrine */
  getHook: function (shrine) {
    for (let entry of ShrineHooks.hooks) {
      if (entry.shrine.gid === shrine.gid) {
        return entry.hook;
      }
    }

    return false;
  },

  /** @param {ObjectUnit} shrine */
  remove: function (shrine) {
    for (let i = 0; i < this.hooks.length; i++) {
      if (this.hooks[i].shrine.gid === shrine.gid) {
        this.hooks[i].hook.remove();
        this.hooks.splice(i, 1);

        return true;
      }
    }

    return false;
  },

  flush: function () {
    while (this.hooks.length) {
      this.hooks.pop().hook.remove();
    }
  }
};
